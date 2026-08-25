<?php
/**
 * Variation attribute swatches (color / image / label) for the storefront.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers WC attribute types, stores show-label flags, and renders PDP swatches.
 */
class Webino_Dashboard_Variation_Swatches {

	const OPTION = 'webino_dashboard_swatch_settings';

	const YITH_MIGRATE_OPTION = 'webino_dashboard_yith_swatch_meta_migrated';

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'product_attributes_type_selector', array( __CLASS__, 'register_types' ) );
		add_filter( 'woocommerce_dropdown_variation_attribute_options_html', array( __CLASS__, 'filter_dropdown_html' ), 20, 2 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
		add_action( 'init', array( __CLASS__, 'maybe_migrate_yith_term_meta' ), 30 );
	}

	/**
	 * @param array<string,string> $types WC types.
	 * @return array<string,string>
	 */
	public static function register_types( $types ) {
		if ( ! is_array( $types ) ) {
			$types = array();
		}
		$types['color']  = __( 'Color', 'webino-dashboard' );
		$types['image']  = __( 'Image', 'webino-dashboard' );
		$types['button'] = __( 'Label', 'webino-dashboard' );
		return $types;
	}

	/**
	 * @param int $attribute_id Attribute ID.
	 * @return bool
	 */
	public static function show_swatch_label( $attribute_id ) {
		$attribute_id = (int) $attribute_id;
		$all          = self::all_settings();
		if ( isset( $all[ $attribute_id ] ) && is_array( $all[ $attribute_id ] ) && array_key_exists( 'show_label', $all[ $attribute_id ] ) ) {
			return (bool) $all[ $attribute_id ]['show_label'];
		}
		return true;
	}

	/**
	 * @param int  $attribute_id Attribute ID.
	 * @param bool $show         Show names under swatches.
	 * @return void
	 */
	public static function set_show_swatch_label( $attribute_id, $show ) {
		$attribute_id = (int) $attribute_id;
		if ( $attribute_id < 1 ) {
			return;
		}
		$all = self::all_settings();
		$all[ $attribute_id ] = array(
			'show_label' => (bool) $show,
		);
		update_option( self::OPTION, $all, false );
	}

	/**
	 * @param int $attribute_id Attribute ID.
	 * @return void
	 */
	public static function delete_settings( $attribute_id ) {
		$attribute_id = (int) $attribute_id;
		$all          = self::all_settings();
		if ( isset( $all[ $attribute_id ] ) ) {
			unset( $all[ $attribute_id ] );
			update_option( self::OPTION, $all, false );
		}
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	public static function all_settings() {
		$raw = get_option( self::OPTION, array() );
		if ( ! is_array( $raw ) ) {
			return array();
		}
		$out = array();
		foreach ( $raw as $id => $row ) {
			$out[ (int) $id ] = is_array( $row ) ? $row : array();
		}
		return $out;
	}

	/**
	 * @param string $taxonomy Taxonomy name (pa_*).
	 * @return array{id:int,type:string,show_label:bool}
	 */
	public static function context_for_taxonomy( $taxonomy ) {
		$taxonomy = (string) $taxonomy;
		$id       = 0;
		if ( function_exists( 'wc_attribute_taxonomy_id_by_name' ) ) {
			$id = (int) wc_attribute_taxonomy_id_by_name( $taxonomy );
		}
		$type = 'select';
		if ( $id > 0 && function_exists( 'wc_get_attribute' ) ) {
			$attr = wc_get_attribute( $id );
			if ( $attr && isset( $attr->type ) ) {
				$type = self::normalize_type( (string) $attr->type );
			}
		}
		return array(
			'id'         => $id,
			'type'       => $type,
			'show_label' => $id > 0 ? self::show_swatch_label( $id ) : true,
		);
	}

	/**
	 * @param string $type Raw type.
	 * @return string
	 */
	public static function normalize_type( $type ) {
		$type = sanitize_key( (string) $type );
		if ( 'colorpicker' === $type ) {
			return 'color';
		}
		if ( in_array( $type, array( 'label', 'radio' ), true ) ) {
			return 'button';
		}
		$allowed = array( 'select', 'text', 'color', 'image', 'button' );
		return in_array( $type, $allowed, true ) ? $type : 'select';
	}

	/**
	 * YITH stores colors as `yith_wccl_value` and/or `{taxonomy}_yith_wccl_value`.
	 *
	 * @param int         $term_id  Term ID.
	 * @param string|null $taxonomy Optional taxonomy (pa_*); resolved from term when empty.
	 * @return list<string>
	 */
	public static function yith_meta_keys_for_term( $term_id, $taxonomy = null ) {
		$keys = array( 'yith_wccl_value' );
		$tax  = is_string( $taxonomy ) ? $taxonomy : '';
		if ( '' === $tax ) {
			$term = get_term( (int) $term_id );
			if ( $term instanceof WP_Term && ! is_wp_error( $term ) && is_string( $term->taxonomy ) ) {
				$tax = $term->taxonomy;
			}
		}
		if ( '' !== $tax ) {
			$prefixed = $tax . '_yith_wccl_value';
			if ( ! in_array( $prefixed, $keys, true ) ) {
				$keys[] = $prefixed;
			}
		}
		return $keys;
	}

	/**
	 * Raw YITH value (hex, URL, or attachment id string) if present.
	 *
	 * @param int         $term_id  Term ID.
	 * @param string|null $taxonomy Optional taxonomy.
	 * @return string
	 */
	public static function raw_yith_term_value( $term_id, $taxonomy = null ) {
		$term_id = (int) $term_id;
		foreach ( self::yith_meta_keys_for_term( $term_id, $taxonomy ) as $key ) {
			$raw = get_term_meta( $term_id, $key, true );
			if ( is_numeric( $raw ) && (int) $raw > 0 ) {
				return (string) (int) $raw;
			}
			if ( is_string( $raw ) && '' !== trim( $raw ) ) {
				return trim( $raw );
			}
		}
		return '';
	}

	/**
	 * @param int $term_id Term ID.
	 * @return string Hex color or empty.
	 */
	public static function term_color( $term_id ) {
		return self::resolve_term_color( $term_id );
	}

	/**
	 * Resolve color with Webina canonical + YITH + legacy fallbacks.
	 *
	 * @param int         $term_id  Term ID.
	 * @param string|null $taxonomy Optional taxonomy for YITH prefixed key.
	 * @return string
	 */
	public static function resolve_term_color( $term_id, $taxonomy = null ) {
		$term_id = (int) $term_id;
		$keys    = array_merge(
			array( 'product_attribute_color' ),
			self::yith_meta_keys_for_term( $term_id, $taxonomy ),
			array( 'ishop_attribute_color', 'color' )
		);
		$seen = array();
		foreach ( $keys as $key ) {
			if ( isset( $seen[ $key ] ) ) {
				continue;
			}
			$seen[ $key ] = true;
			$raw = get_term_meta( $term_id, $key, true );
			$hex = self::normalize_hex( is_string( $raw ) ? $raw : '' );
			if ( '' !== $hex ) {
				return $hex;
			}
		}
		return '';
	}

	/**
	 * @param int $term_id Term ID.
	 * @return array{id:int,url:string}
	 */
	public static function term_image( $term_id ) {
		return self::resolve_term_image( $term_id );
	}

	/**
	 * @param int         $term_id  Term ID.
	 * @param string|null $taxonomy Optional taxonomy.
	 * @return array{id:int,url:string}
	 */
	public static function resolve_term_image( $term_id, $taxonomy = null ) {
		$term_id  = (int) $term_id;
		$image_id = (int) get_term_meta( $term_id, 'product_attribute_image', true );
		if ( $image_id <= 0 ) {
			foreach ( self::yith_meta_keys_for_term( $term_id, $taxonomy ) as $key ) {
				$yith = get_term_meta( $term_id, $key, true );
				if ( is_numeric( $yith ) && (int) $yith > 0 ) {
					$image_id = (int) $yith;
					break;
				}
				if ( is_string( $yith ) && '' !== $yith ) {
					$resolved = (int) attachment_url_to_postid( $yith );
					if ( $resolved > 0 ) {
						$image_id = $resolved;
						break;
					}
				}
			}
		}
		$url = $image_id > 0 ? (string) wp_get_attachment_image_url( $image_id, 'woocommerce_gallery_thumbnail' ) : '';
		if ( '' === $url && $image_id > 0 ) {
			$url = (string) wp_get_attachment_image_url( $image_id, 'thumbnail' );
		}
		return array(
			'id'  => $image_id,
			'url' => $url,
		);
	}

	/**
	 * Dual-write color to Webina + YITH (+ iShop) keys.
	 *
	 * @param int         $term_id  Term ID.
	 * @param string      $color    Normalized #RRGGBB or empty to clear.
	 * @param string|null $taxonomy Optional taxonomy.
	 * @param bool        $force_clear Force delete even when only YITH has a value.
	 * @return void
	 */
	public static function sync_term_color( $term_id, $color, $taxonomy = null, $force_clear = false ) {
		$term_id = (int) $term_id;
		$color   = self::normalize_hex( $color );
		$keys    = array_merge(
			array( 'product_attribute_color', 'ishop_attribute_color' ),
			self::yith_meta_keys_for_term( $term_id, $taxonomy )
		);
		$keys = array_values( array_unique( $keys ) );

		if ( '' !== $color ) {
			foreach ( $keys as $key ) {
				update_term_meta( $term_id, $key, $color );
			}
			return;
		}

		$canonical = self::normalize_hex( (string) get_term_meta( $term_id, 'product_attribute_color', true ) );
		$yith_hex  = self::normalize_hex( self::raw_yith_term_value( $term_id, $taxonomy ) );

		// Empty payload before migration (UI never saw hex): keep YITH data.
		if ( ! $force_clear && '' === $canonical && '' !== $yith_hex ) {
			return;
		}

		foreach ( $keys as $key ) {
			delete_term_meta( $term_id, $key );
		}
	}

	/**
	 * Dual-write image id / YITH URL.
	 *
	 * @param int         $term_id  Term ID.
	 * @param int         $image_id Attachment ID (0 to clear).
	 * @param string|null $taxonomy Optional taxonomy.
	 * @param bool        $force_clear Force delete even when only YITH has a value.
	 * @return void
	 */
	public static function sync_term_image( $term_id, $image_id, $taxonomy = null, $force_clear = false ) {
		$term_id   = (int) $term_id;
		$image_id  = absint( $image_id );
		$yith_keys = self::yith_meta_keys_for_term( $term_id, $taxonomy );

		if ( $image_id > 0 ) {
			update_term_meta( $term_id, 'product_attribute_image', $image_id );
			$url   = (string) wp_get_attachment_url( $image_id );
			$value = $url ? $url : (string) $image_id;
			foreach ( $yith_keys as $key ) {
				update_term_meta( $term_id, $key, $value );
			}
			return;
		}

		$canonical_id = (int) get_term_meta( $term_id, 'product_attribute_image', true );
		$yith_raw     = self::raw_yith_term_value( $term_id, $taxonomy );

		// Empty payload before migration: keep YITH image meta.
		if ( ! $force_clear && $canonical_id <= 0 && '' !== $yith_raw ) {
			return;
		}

		delete_term_meta( $term_id, 'product_attribute_image' );
		foreach ( $yith_keys as $key ) {
			delete_term_meta( $term_id, $key );
		}
	}

	/**
	 * One-shot: copy YITH term meta into Webina canonical keys.
	 *
	 * @return void
	 */
	public static function maybe_migrate_yith_term_meta() {
		if ( '1' === (string) get_option( self::YITH_MIGRATE_OPTION, '' ) ) {
			return;
		}

		self::migrate_yith_from_attribute_taxonomies();
		self::migrate_yith_from_termmeta_scan();

		update_option( self::YITH_MIGRATE_OPTION, '1', false );
	}

	/**
	 * @return void
	 */
	private static function migrate_yith_from_attribute_taxonomies() {
		if ( ! function_exists( 'wc_get_attribute_taxonomies' ) ) {
			return;
		}
		$taxonomies = wc_get_attribute_taxonomies();
		if ( ! is_array( $taxonomies ) ) {
			return;
		}

		foreach ( $taxonomies as $row ) {
			$type = isset( $row->attribute_type ) ? self::normalize_type( (string) $row->attribute_type ) : 'select';
			if ( ! in_array( $type, array( 'color', 'image' ), true ) ) {
				continue;
			}
			$name = isset( $row->attribute_name ) ? (string) $row->attribute_name : '';
			if ( '' === $name ) {
				continue;
			}
			$taxonomy = function_exists( 'wc_attribute_taxonomy_name' )
				? wc_attribute_taxonomy_name( $name )
				: 'pa_' . $name;
			if ( ! taxonomy_exists( $taxonomy ) ) {
				continue;
			}
			$terms = get_terms(
				array(
					'taxonomy'   => $taxonomy,
					'hide_empty' => false,
					'fields'     => 'ids',
				)
			);
			if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
				continue;
			}
			foreach ( $terms as $term_id ) {
				self::migrate_one_term( (int) $term_id, $type, $taxonomy );
			}
		}
	}

	/**
	 * Catch YITH-prefixed keys even when attribute type was reset to select.
	 *
	 * @return void
	 */
	private static function migrate_yith_from_termmeta_scan() {
		global $wpdb;
		if ( ! isset( $wpdb ) || ! is_object( $wpdb ) ) {
			return;
		}
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			"SELECT term_id, meta_key, meta_value FROM {$wpdb->termmeta}
			WHERE meta_key = 'yith_wccl_value'
			   OR meta_key LIKE '%\\_yith\\_wccl\\_value'
			   OR meta_key = 'ishop_attribute_color'"
		);
		if ( ! is_array( $rows ) ) {
			return;
		}
		foreach ( $rows as $row ) {
			$term_id = isset( $row->term_id ) ? (int) $row->term_id : 0;
			if ( $term_id < 1 ) {
				continue;
			}
			$raw = isset( $row->meta_value ) ? (string) $row->meta_value : '';
			$hex = self::normalize_hex( $raw );
			if ( '' !== $hex ) {
				$canonical = self::normalize_hex( (string) get_term_meta( $term_id, 'product_attribute_color', true ) );
				if ( '' === $canonical ) {
					self::sync_term_color( $term_id, $hex, null, true );
				} else {
					$plain = get_term_meta( $term_id, 'yith_wccl_value', true );
					if ( ! is_string( $plain ) || '' === trim( $plain ) ) {
						update_term_meta( $term_id, 'yith_wccl_value', $canonical );
					}
				}
				continue;
			}
			// Image-like YITH value (URL or attachment id).
			$image_id = 0;
			if ( is_numeric( $raw ) && (int) $raw > 0 ) {
				$image_id = (int) $raw;
			} elseif ( '' !== $raw && false !== filter_var( $raw, FILTER_VALIDATE_URL ) ) {
				$image_id = (int) attachment_url_to_postid( $raw );
			}
			if ( $image_id > 0 && (int) get_term_meta( $term_id, 'product_attribute_image', true ) <= 0 ) {
				self::sync_term_image( $term_id, $image_id, null, true );
			}
		}
	}

	/**
	 * @param int    $term_id  Term ID.
	 * @param string $type     color|image.
	 * @param string $taxonomy Taxonomy name.
	 * @return void
	 */
	private static function migrate_one_term( $term_id, $type, $taxonomy ) {
		$term_id = (int) $term_id;
		if ( $term_id < 1 ) {
			return;
		}
		if ( 'color' === $type ) {
			$canonical = self::normalize_hex( (string) get_term_meta( $term_id, 'product_attribute_color', true ) );
			if ( '' !== $canonical ) {
				$plain = get_term_meta( $term_id, 'yith_wccl_value', true );
				if ( ( ! is_string( $plain ) || '' === trim( $plain ) ) ) {
					update_term_meta( $term_id, 'yith_wccl_value', $canonical );
				}
				$prefixed = $taxonomy . '_yith_wccl_value';
				$pref     = get_term_meta( $term_id, $prefixed, true );
				if ( ! is_string( $pref ) || '' === trim( $pref ) ) {
					update_term_meta( $term_id, $prefixed, $canonical );
				}
				return;
			}
			$hex = self::resolve_term_color( $term_id, $taxonomy );
			if ( '' !== $hex ) {
				self::sync_term_color( $term_id, $hex, $taxonomy, true );
			}
			return;
		}
		if ( 'image' === $type ) {
			$canonical_id = (int) get_term_meta( $term_id, 'product_attribute_image', true );
			if ( $canonical_id > 0 ) {
				$plain = get_term_meta( $term_id, 'yith_wccl_value', true );
				if ( ! is_string( $plain ) || '' === trim( $plain ) ) {
					$url = (string) wp_get_attachment_url( $canonical_id );
					update_term_meta( $term_id, 'yith_wccl_value', $url ? $url : (string) $canonical_id );
				}
				return;
			}
			$img = self::resolve_term_image( $term_id, $taxonomy );
			if ( $img['id'] > 0 ) {
				self::sync_term_image( $term_id, $img['id'], $taxonomy, true );
			}
		}
	}

	/**
	 * @param string $raw Raw color.
	 * @return string
	 */
	public static function normalize_hex( $raw ) {
		$raw = trim( (string) $raw );
		if ( '' === $raw ) {
			return '';
		}
		$part = trim( explode( ',', $raw )[0] );
		if ( '' === $part ) {
			return '';
		}
		if ( '#' !== substr( $part, 0, 1 ) ) {
			$part = '#' . $part;
		}
		if ( function_exists( 'sanitize_hex_color' ) ) {
			$san = sanitize_hex_color( $part );
			if ( is_string( $san ) && '' !== $san ) {
				return $san;
			}
		}
		if ( preg_match( '/^#([0-9a-fA-F]{3})$/', $part, $m ) ) {
			$h = $m[1];
			return '#' . $h[0] . $h[0] . $h[1] . $h[1] . $h[2] . $h[2];
		}
		if ( preg_match( '/^#([0-9a-fA-F]{6})$/', $part ) ) {
			return strtolower( $part );
		}
		return '';
	}

	/**
	 * @return void
	 */
	public static function enqueue() {
		if ( is_admin() || ! function_exists( 'is_product' ) || ! is_product() ) {
			return;
		}
		$css = WEBINO_DASHBOARD_DIR . 'assets/swatches/variation-swatches.css';
		$js  = WEBINO_DASHBOARD_DIR . 'assets/swatches/variation-swatches.js';
		if ( ! is_readable( $css ) ) {
			return;
		}
		$ver = defined( 'WEBINO_DASHBOARD_VERSION' ) ? WEBINO_DASHBOARD_VERSION : '1.0';
		if ( is_readable( $css ) ) {
			$ver = $ver . '-' . (string) filemtime( $css );
		}
		wp_enqueue_style(
			'webino-variation-swatches',
			plugins_url( 'assets/swatches/variation-swatches.css', WEBINO_DASHBOARD_FILE ),
			array(),
			$ver
		);
		if ( is_readable( $js ) ) {
			wp_enqueue_script(
				'webino-variation-swatches',
				plugins_url( 'assets/swatches/variation-swatches.js', WEBINO_DASHBOARD_FILE ),
				array( 'jquery', 'wc-add-to-cart-variation' ),
				(string) filemtime( $js ),
				true
			);
		}
	}

	/**
	 * @param string               $html Dropdown HTML.
	 * @param array<string,mixed>  $args WC args.
	 * @return string
	 */
	public static function filter_dropdown_html( $html, $args ) {
		$attribute = isset( $args['attribute'] ) ? (string) $args['attribute'] : '';
		if ( '' === $attribute ) {
			return $html;
		}
		$ctx = self::context_for_taxonomy( $attribute );
		if ( ! in_array( $ctx['type'], array( 'color', 'image', 'button' ), true ) ) {
			return $html;
		}
		$product = isset( $args['product'] ) ? $args['product'] : null;
		$options = isset( $args['options'] ) && is_array( $args['options'] ) ? $args['options'] : array();
		if ( $product instanceof WC_Product && empty( $options ) && method_exists( $product, 'get_variation_attributes' ) ) {
			$attrs = $product->get_variation_attributes();
			if ( isset( $attrs[ $attribute ] ) && is_array( $attrs[ $attribute ] ) ) {
				$options = $attrs[ $attribute ];
			}
		}
		if ( array() === $options ) {
			return $html;
		}

		$selected = isset( $args['selected'] ) ? (string) $args['selected'] : '';
		$show     = ! empty( $ctx['show_label'] ) || 'button' === $ctx['type'];
		$items    = self::option_items( $attribute, $options, $product );

		ob_start();
		?>
		<div class="wd-swatches wd-swatches--<?php echo esc_attr( $ctx['type'] ); ?><?php echo $show ? ' wd-swatches--labels' : ''; ?>" data-attribute="<?php echo esc_attr( $attribute ); ?>">
			<?php foreach ( $items as $item ) : ?>
				<?php
				$is_selected = (string) $item['value'] === $selected || (string) $item['slug'] === $selected;
				$classes     = array( 'wd-swatch', 'wd-swatch--' . $ctx['type'] );
				if ( $is_selected ) {
					$classes[] = 'is-selected';
				}
				if ( 'color' === $ctx['type'] && self::color_is_light( $item['color'] ) ) {
					$classes[] = 'is-light';
				}
				?>
				<button
					type="button"
					class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>"
					data-value="<?php echo esc_attr( $item['value'] ); ?>"
					aria-label="<?php echo esc_attr( $item['name'] ); ?>"
					aria-pressed="<?php echo $is_selected ? 'true' : 'false'; ?>"
					title="<?php echo esc_attr( $item['name'] ); ?>"
					<?php echo $item['color'] ? 'style="--wd-swatch-color:' . esc_attr( $item['color'] ) . '"' : ''; ?>
				>
					<span class="wd-swatch-face" aria-hidden="true">
						<?php if ( 'image' === $ctx['type'] && $item['image'] ) : ?>
							<img src="<?php echo esc_url( $item['image'] ); ?>" alt="" width="44" height="44" loading="lazy" />
						<?php elseif ( 'button' === $ctx['type'] ) : ?>
							<?php echo esc_html( $item['name'] ); ?>
						<?php endif; ?>
					</span>
					<?php if ( $show && 'button' !== $ctx['type'] ) : ?>
						<span class="wd-swatch-name"><?php echo esc_html( $item['name'] ); ?></span>
					<?php endif; ?>
				</button>
			<?php endforeach; ?>
			<div class="wd-swatch-select-hidden" aria-hidden="true"><?php echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * @param string          $taxonomy Taxonomy.
	 * @param array<int,string> $options Option slugs/names.
	 * @param WC_Product|null $product Product.
	 * @return array<int,array<string,string>>
	 */
	private static function option_items( $taxonomy, $options, $product ) {
		$items = array();
		foreach ( $options as $option ) {
			$option = (string) $option;
			$name   = $option;
			$slug   = $option;
			$term   = null;
			if ( taxonomy_exists( $taxonomy ) ) {
				$term = get_term_by( 'slug', $option, $taxonomy );
				if ( ! $term ) {
					$term = get_term_by( 'name', $option, $taxonomy );
				}
			}
			$color = '';
			$image = '';
			if ( $term instanceof WP_Term ) {
				$name  = $term->name;
				$slug  = $term->slug;
				$color = self::term_color( (int) $term->term_id );
				$img   = self::term_image( (int) $term->term_id );
				$image = $img['url'];
			} elseif ( $product instanceof WC_Product ) {
				$name = rawurldecode( $option );
			}
			$items[] = array(
				'value' => $slug,
				'slug'  => $slug,
				'name'  => $name,
				'color' => $color,
				'image' => $image,
			);
		}
		return $items;
	}

	/**
	 * @param string $hex Hex color.
	 * @return bool
	 */
	private static function color_is_light( $hex ) {
		$hex = ltrim( (string) $hex, '#' );
		if ( 6 !== strlen( $hex ) ) {
			return false;
		}
		$r = hexdec( substr( $hex, 0, 2 ) );
		$g = hexdec( substr( $hex, 2, 2 ) );
		$b = hexdec( substr( $hex, 4, 2 ) );
		$y = ( 0.299 * $r ) + ( 0.587 * $g ) + ( 0.114 * $b );
		return $y > 210;
	}
}
