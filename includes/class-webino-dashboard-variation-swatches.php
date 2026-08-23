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

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'product_attributes_type_selector', array( __CLASS__, 'register_types' ) );
		add_filter( 'woocommerce_dropdown_variation_attribute_options_html', array( __CLASS__, 'filter_dropdown_html' ), 20, 2 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
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
	 * @param int $term_id Term ID.
	 * @return string Hex color or empty.
	 */
	public static function term_color( $term_id ) {
		$term_id = (int) $term_id;
		$keys    = array( 'product_attribute_color', 'yith_wccl_value', 'ishop_attribute_color', 'color' );
		foreach ( $keys as $key ) {
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
		$term_id  = (int) $term_id;
		$image_id = (int) get_term_meta( $term_id, 'product_attribute_image', true );
		if ( $image_id <= 0 ) {
			$yith = get_term_meta( $term_id, 'yith_wccl_value', true );
			if ( is_numeric( $yith ) ) {
				$image_id = (int) $yith;
			} elseif ( is_string( $yith ) && '' !== $yith ) {
				$image_id = (int) attachment_url_to_postid( $yith );
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
