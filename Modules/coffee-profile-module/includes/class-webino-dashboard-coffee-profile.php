<?php
/**
 * Coffee profile settings and product meta.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Settings + product tasting-profile storage.
 */
class Webino_Dashboard_Coffee_Profile {

	const OPTION_KEY = 'webino_coffee_profile_settings';
	const META_KEY   = '_webino_coffee_profile';

	const INDEX_ARABICA      = '_webino_coffee_arabica';
	const INDEX_ROBUSTA      = '_webino_coffee_robusta';
	const INDEX_BITTERNESS   = '_webino_coffee_bitterness';
	const INDEX_CAFFEINE     = '_webino_coffee_caffeine_mg';
	const INDEX_ACIDITY      = '_webino_coffee_acidity_avg';
	const INDEX_ORIGIN_COUNT = '_webino_coffee_origin_count';

	const ISHOP_PLACEMENT_MIGRATED = 'webino_coffee_placement_ishop_summary';

	/**
	 * @return void
	 */
	public static function init() {
		add_shortcode( 'webino_coffee_profile', array( 'Webino_Dashboard_Coffee_Storefront', 'shortcode' ) );
		add_action( 'init', array( __CLASS__, 'maybe_migrate_ishop_placement' ), 1 );
		add_action( 'pre_get_posts', array( __CLASS__, 'harden_frontend_product_query' ), 50 );
	}

	/**
	 * Tax query clause excluding hidden catalog products.
	 *
	 * @return array<string,mixed>|null
	 */
	public static function storefront_visibility_tax_clause() {
		if ( ! taxonomy_exists( 'product_visibility' ) ) {
			return null;
		}
		return array(
			'taxonomy' => 'product_visibility',
			'field'    => 'name',
			'terms'    => array( 'exclude-from-catalog', 'exclude-from-search' ),
			'operator' => 'NOT IN',
		);
	}

	/**
	 * Keep storefront product loops on published, catalog-visible products.
	 *
	 * @param WP_Query $query Query.
	 * @return void
	 */
	public static function harden_frontend_product_query( $query ) {
		if ( ! $query instanceof WP_Query || is_admin() ) {
			return;
		}
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return;
		}
		$pt         = $query->get( 'post_type' );
		$is_product = ( 'product' === $pt ) || ( is_array( $pt ) && in_array( 'product', $pt, true ) );
		if ( ! $is_product ) {
			return;
		}
		// Allow editors to preview a single draft/private product.
		if ( $query->is_singular( 'product' ) && current_user_can( 'edit_products' ) ) {
			return;
		}

		$status = $query->get( 'post_status' );
		$bad    = array( 'draft', 'pending', 'private', 'future', 'trash', 'any' );
		if ( empty( $status ) || 'any' === $status || ( is_array( $status ) && array_intersect( $status, $bad ) ) ) {
			$query->set( 'post_status', 'publish' );
		}

		$clause = self::storefront_visibility_tax_clause();
		if ( ! $clause ) {
			return;
		}
		$tax = $query->get( 'tax_query' );
		if ( ! is_array( $tax ) ) {
			$tax = array();
		}
		foreach ( $tax as $item ) {
			if ( is_array( $item ) && isset( $item['taxonomy'] ) && 'product_visibility' === $item['taxonomy'] ) {
				return;
			}
		}
		$tax[]             = $clause;
		$tax['relation']   = 'AND';
		$query->set( 'tax_query', $tax );
	}

	/**
	 * ishop never honored stored placement; the factory default before_tabs
	 * always rendered in the summary slot. Move that default to summary once.
	 *
	 * @return void
	 */
	public static function maybe_migrate_ishop_placement() {
		if ( get_option( self::ISHOP_PLACEMENT_MIGRATED ) ) {
			return;
		}
		if ( ! class_exists( 'Webino_Dashboard_Coffee_Storefront', false )
			|| ! Webino_Dashboard_Coffee_Storefront::is_ishop_theme() ) {
			return;
		}

		$saved = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $saved ) ) {
			$saved = array();
		}
		$placement = isset( $saved['placement'] ) ? sanitize_key( (string) $saved['placement'] ) : '';
		if ( 'before_tabs' === $placement ) {
			$saved['placement'] = 'summary';
			update_option( self::OPTION_KEY, $saved, false );
		}
		update_option( self::ISHOP_PLACEMENT_MIGRATED, '1', false );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function default_settings() {
		return array(
			'placement'      => 'summary',
			'robusta_label'  => 'روبوستا',
			'arabica_label'  => 'عربیکا',
			'caffeine_unit'  => 'میلی‌گرم در هر شات',
			'scale_min'      => 0,
			'scale_max'      => 10,
			'caffeine_max'   => 200,
			'use_flagcdn'    => true,
			'acidity_levels' => array(
				array(
					'id'    => 'citric',
					'label' => 'سیتریک',
				),
				array(
					'id'    => 'malic',
					'label' => 'مالیک',
				),
				array(
					'id'    => 'tartaric',
					'label' => 'تارتاریک',
				),
				array(
					'id'    => 'phosphoric',
					'label' => 'فسفریک',
				),
				array(
					'id'    => 'acetic',
					'label' => 'استیک',
				),
			),
			'colors'         => array(
				'card_bg'         => '#f7f3ee',
				'card_text'       => '#3d2b1f',
				'card_border'     => '#e2d5c5',
				'track'           => '#e8ddd0',
				'blend_fill'      => '#6b4f3a',
				'acidity_line'    => '#8b6914',
				'acidity_dot'     => '#c45c26',
				'caffeine_fill'   => '#4a3728',
				'bitterness_fill' => '#5c4033',
				'sweetness_fill'  => '#c17f3a',
				'body_fill'       => '#7a5c45',
				'label'           => '#6b5b4f',
				'value'           => '#3d2b1f',
			),
			'font_title'     => 16,
			'font_label'     => 12,
			'font_value'     => 13,
			'radius'         => 16,
			'gap'            => 20,
			'bar_height'     => 10,
			'stroke_width'   => 2,
			'grinds'         => array(
				array(
					'id'    => 'whole_bean',
					'label' => 'دان کامل',
				),
				array(
					'id'    => 'espresso',
					'label' => 'اسپرسوساز',
				),
				array(
					'id'    => 'moka',
					'label' => 'موکاپات',
				),
				array(
					'id'    => 'turkish',
					'label' => 'قهوه ترک / جذوه',
				),
				array(
					'id'    => 'v60',
					'label' => 'V60 / دریپر',
				),
				array(
					'id'    => 'french_press',
					'label' => 'فرنچ پرس',
				),
				array(
					'id'    => 'chemex',
					'label' => 'کمکس',
				),
				array(
					'id'    => 'aeropress',
					'label' => 'ایروپرس',
				),
			),
			'roasts'         => array(
				array(
					'id'    => 'light',
					'label' => 'لایت',
				),
				array(
					'id'    => 'medium',
					'label' => 'مدیوم',
				),
				array(
					'id'    => 'medium_dark',
					'label' => 'مدیوم‌دارک',
				),
				array(
					'id'    => 'dark',
					'label' => 'دارک',
				),
			),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get_settings() {
		$saved = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $saved ) ) {
			$saved = array();
		}
		return self::sanitize_settings( array_replace_recursive( self::default_settings(), $saved ) );
	}

	/**
	 * @param array<string,mixed> $input Raw settings.
	 * @return array<string,mixed>
	 */
	public static function sanitize_settings( $input ) {
		$defaults = self::default_settings();
		if ( ! is_array( $input ) ) {
			return $defaults;
		}

		$placement = sanitize_key( (string) ( $input['placement'] ?? $defaults['placement'] ) );
		$allowed_placement = array( 'summary', 'before_cart', 'after_cart', 'before_tabs', 'after_tabs', 'none' );
		if ( ! in_array( $placement, $allowed_placement, true ) ) {
			$placement = 'summary';
		}

		$levels_in = isset( $input['acidity_levels'] ) && is_array( $input['acidity_levels'] ) ? $input['acidity_levels'] : $defaults['acidity_levels'];
		$levels    = array();
		$used_ids  = array();
		foreach ( $levels_in as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$label = sanitize_text_field( (string) ( $row['label'] ?? '' ) );
			if ( '' === $label ) {
				continue;
			}
			$id = sanitize_key( (string) ( $row['id'] ?? '' ) );
			if ( '' === $id ) {
				$id = sanitize_key( $label );
			}
			if ( '' === $id ) {
				$id = 'level_' . ( count( $levels ) + 1 );
			}
			$base = $id;
			$n    = 2;
			while ( isset( $used_ids[ $id ] ) ) {
				$id = $base . '_' . $n;
				++$n;
			}
			$used_ids[ $id ] = true;
			$levels[]        = array(
				'id'    => $id,
				'label' => $label,
			);
		}
		if ( array() === $levels ) {
			$levels = $defaults['acidity_levels'];
		}

		$grinds = self::sanitize_id_label_list(
			isset( $input['grinds'] ) && is_array( $input['grinds'] ) ? $input['grinds'] : $defaults['grinds'],
			$defaults['grinds']
		);
		$roasts = self::sanitize_id_label_list(
			isset( $input['roasts'] ) && is_array( $input['roasts'] ) ? $input['roasts'] : $defaults['roasts'],
			$defaults['roasts']
		);

		$color_keys = array_keys( $defaults['colors'] );
		$colors_in  = isset( $input['colors'] ) && is_array( $input['colors'] ) ? $input['colors'] : array();
		$colors     = array();
		foreach ( $color_keys as $key ) {
			$fallback     = $defaults['colors'][ $key ];
			$colors[ $key ] = self::sanitize_hex_color( isset( $colors_in[ $key ] ) ? (string) $colors_in[ $key ] : $fallback, $fallback );
		}

		$scale_min = (int) ( $input['scale_min'] ?? $defaults['scale_min'] );
		$scale_max = (int) ( $input['scale_max'] ?? $defaults['scale_max'] );
		if ( $scale_max <= $scale_min ) {
			$scale_max = $scale_min + 1;
		}

		return array(
			'placement'      => $placement,
			'robusta_label'  => sanitize_text_field( (string) ( $input['robusta_label'] ?? $defaults['robusta_label'] ) ),
			'arabica_label'  => sanitize_text_field( (string) ( $input['arabica_label'] ?? $defaults['arabica_label'] ) ),
			'caffeine_unit'  => sanitize_text_field( (string) ( $input['caffeine_unit'] ?? $defaults['caffeine_unit'] ) ),
			'scale_min'      => max( 0, $scale_min ),
			'scale_max'      => min( 100, $scale_max ),
			'caffeine_max'   => max( 1, min( 2000, (int) ( $input['caffeine_max'] ?? $defaults['caffeine_max'] ) ) ),
			'use_flagcdn'    => ! empty( $input['use_flagcdn'] ),
			'acidity_levels' => $levels,
			'grinds'         => $grinds,
			'roasts'         => $roasts,
			'colors'         => $colors,
			'font_title'     => max( 10, min( 32, (int) ( $input['font_title'] ?? $defaults['font_title'] ) ) ),
			'font_label'     => max( 9, min( 24, (int) ( $input['font_label'] ?? $defaults['font_label'] ) ) ),
			'font_value'     => max( 9, min( 28, (int) ( $input['font_value'] ?? $defaults['font_value'] ) ) ),
			'radius'         => max( 0, min( 48, (int) ( $input['radius'] ?? $defaults['radius'] ) ) ),
			'gap'            => max( 8, min( 48, (int) ( $input['gap'] ?? $defaults['gap'] ) ) ),
			'bar_height'     => max( 4, min( 32, (int) ( $input['bar_height'] ?? $defaults['bar_height'] ) ) ),
			'stroke_width'   => max( 1, min( 8, (int) ( $input['stroke_width'] ?? $defaults['stroke_width'] ) ) ),
		);
	}

	/**
	 * @param array<string,mixed> $settings Settings.
	 * @return bool
	 */
	public static function save_settings( $settings ) {
		$clean = self::sanitize_settings( $settings );
		return (bool) update_option( self::OPTION_KEY, $clean, false );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function default_profile() {
		return array(
			'blend_robusta'     => 0,
			'blend_arabica'     => 0,
			'acidity'           => array(),
			'caffeine_mg'       => 0,
			'bitterness'        => 0,
			'sweetness'         => 0,
			'body'              => 0,
			'pack_weight_g'     => 1000,
			'price_mode'        => 'none',
			'price_bean_id'     => '',
			'price_mix_id'      => '',
			'price_shop_style'  => 'classic',
			'price_parts'       => array(),
			'visible'           => array(
				'blend'      => true,
				'acidity'    => true,
				'caffeine'   => true,
				'bitterness' => true,
				'sweetness'  => true,
				'body'       => true,
				'origin'     => true,
			),
		);
	}

	/**
	 * @param int $product_id Product ID.
	 * @return array<string,mixed>
	 */
	public static function get_profile( $product_id ) {
		$product_id = (int) $product_id;
		$raw        = $product_id > 0 ? get_post_meta( $product_id, self::META_KEY, true ) : array();
		if ( is_string( $raw ) && '' !== $raw ) {
			$decoded = json_decode( $raw, true );
			$raw     = is_array( $decoded ) ? $decoded : array();
		}
		if ( ! is_array( $raw ) ) {
			$raw = array();
		}
		$profile = self::sanitize_profile( $raw );
		$profile['origin_ids']    = Webino_Dashboard_Coffee_Origins::ids_for_product( $product_id );
		$profile['visible_saved'] = is_array( $raw ) && array_key_exists( 'visible', $raw );
		return $profile;
	}

	/**
	 * @param int                 $product_id Product ID.
	 * @param array<string,mixed> $input      Raw profile.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function save_profile( $product_id, $input ) {
		$product_id = (int) $product_id;
		if ( $product_id <= 0 || ! get_post( $product_id ) ) {
			return new WP_Error( 'not_found', __( 'Product not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$profile = self::sanitize_profile( $input );
		$origin_ids = array();
		if ( isset( $input['origin_ids'] ) && is_array( $input['origin_ids'] ) ) {
			$origin_ids = array_values( array_unique( array_map( 'intval', $input['origin_ids'] ) ) );
		}
		update_post_meta( $product_id, self::META_KEY, $profile );
		Webino_Dashboard_Coffee_Origins::set_for_product( $product_id, $origin_ids );
		$profile['origin_ids'] = Webino_Dashboard_Coffee_Origins::ids_for_product( $product_id );
		self::sync_search_index( $product_id, $profile );
		return $profile;
	}

	/**
	 * Average of acidity axes for search / blend.
	 *
	 * @param array<string,mixed> $profile Profile.
	 * @return int
	 */
	public static function acidity_avg( $profile ) {
		$acidity = isset( $profile['acidity'] ) && is_array( $profile['acidity'] ) ? $profile['acidity'] : array();
		if ( array() === $acidity ) {
			return 0;
		}
		return (int) round( array_sum( $acidity ) / max( 1, count( $acidity ) ) );
	}

	/**
	 * Flatten tasting fields so WP_Query can filter them.
	 *
	 * @param int                      $product_id Product ID.
	 * @param array<string,mixed>|null $profile    Optional already-loaded profile.
	 * @return void
	 */
	public static function sync_search_index( $product_id, $profile = null ) {
		$product_id = (int) $product_id;
		if ( $product_id <= 0 ) {
			return;
		}
		if ( ! is_array( $profile ) ) {
			$profile = self::get_profile( $product_id );
		}
		$origin_ids = isset( $profile['origin_ids'] ) && is_array( $profile['origin_ids'] )
			? $profile['origin_ids']
			: Webino_Dashboard_Coffee_Origins::ids_for_product( $product_id );
		update_post_meta( $product_id, self::INDEX_ARABICA, (int) ( $profile['blend_arabica'] ?? 0 ) );
		update_post_meta( $product_id, self::INDEX_ROBUSTA, (int) ( $profile['blend_robusta'] ?? 0 ) );
		update_post_meta( $product_id, self::INDEX_BITTERNESS, (int) ( $profile['bitterness'] ?? 0 ) );
		update_post_meta( $product_id, self::INDEX_CAFFEINE, (int) ( $profile['caffeine_mg'] ?? 0 ) );
		update_post_meta( $product_id, self::INDEX_ACIDITY, self::acidity_avg( $profile ) );
		update_post_meta( $product_id, self::INDEX_ORIGIN_COUNT, count( $origin_ids ) );
	}

	/**
	 * @param array<string,mixed> $input Raw.
	 * @return array<string,mixed>
	 */
	public static function sanitize_profile( $input ) {
		$defaults = self::default_profile();
		$settings = self::get_settings();
		if ( ! is_array( $input ) ) {
			$input = array();
		}

		$robusta = max( 0, min( 100, (int) ( $input['blend_robusta'] ?? $defaults['blend_robusta'] ) ) );
		$arabica = max( 0, min( 100, (int) ( $input['blend_arabica'] ?? $defaults['blend_arabica'] ) ) );
		$sum     = $robusta + $arabica;
		if ( $sum > 100 ) {
			$robusta = (int) round( $robusta * 100 / $sum );
			$arabica = 100 - $robusta;
		}

		$acidity_in = isset( $input['acidity'] ) && is_array( $input['acidity'] ) ? $input['acidity'] : array();
		$acidity    = array();
		$min        = (int) $settings['scale_min'];
		$max        = (int) $settings['scale_max'];
		foreach ( $settings['acidity_levels'] as $level ) {
			$id = (string) $level['id'];
			$acidity[ $id ] = isset( $acidity_in[ $id ] ) ? max( $min, min( $max, (int) $acidity_in[ $id ] ) ) : $min;
		}
		foreach ( $acidity_in as $raw_id => $val ) {
			$id = sanitize_key( (string) $raw_id );
			if ( '' === $id || isset( $acidity[ $id ] ) ) {
				continue;
			}
			$acidity[ $id ] = max( $min, min( $max, (int) $val ) );
		}

		$vis_in  = isset( $input['visible'] ) && is_array( $input['visible'] ) ? $input['visible'] : array();
		$visible = array();
		foreach ( array_keys( $defaults['visible'] ) as $key ) {
			if ( array_key_exists( $key, $vis_in ) ) {
				$visible[ $key ] = ! empty( $vis_in[ $key ] );
			} else {
				$visible[ $key ] = ! empty( $defaults['visible'][ $key ] );
			}
		}

		$price_mode = sanitize_key( (string) ( $input['price_mode'] ?? $defaults['price_mode'] ) );
		$allowed_modes = array( 'none', 'single', 'base_mix', 'shop', 'economy', 'custom' );
		if ( ! in_array( $price_mode, $allowed_modes, true ) ) {
			$price_mode = 'none';
		}

		$shop_style = sanitize_key( (string) ( $input['price_shop_style'] ?? 'classic' ) );
		if ( ! in_array( $shop_style, array( 'classic', 'luxury' ), true ) ) {
			$shop_style = 'classic';
		}

		$parts_in = isset( $input['price_parts'] ) && is_array( $input['price_parts'] ) ? $input['price_parts'] : array();
		$parts    = array();
		foreach ( $parts_in as $p ) {
			if ( ! is_array( $p ) ) {
				continue;
			}
			$bid = sanitize_key( (string) ( $p['bean_id'] ?? '' ) );
			$pct = max( 0, min( 100, (float) ( $p['percent'] ?? 0 ) ) );
			if ( '' === $bid || $pct <= 0 ) {
				continue;
			}
			$parts[] = array(
				'bean_id' => $bid,
				'percent' => $pct,
			);
		}

		// Composition drives pricing; mark as custom when parts exist.
		if ( ! empty( $parts ) ) {
			$price_mode = 'custom';
			if ( 1 === count( $parts ) && abs( (float) $parts[0]['percent'] - 100 ) < 0.5 ) {
				$input['price_bean_id'] = $parts[0]['bean_id'];
			}
		}

		return array(
			'blend_robusta'    => $robusta,
			'blend_arabica'    => $arabica,
			'acidity'          => $acidity,
			'caffeine_mg'      => max( 0, min( 5000, (int) ( $input['caffeine_mg'] ?? 0 ) ) ),
			'bitterness'       => max( $min, min( $max, (int) ( $input['bitterness'] ?? $min ) ) ),
			'sweetness'        => max( $min, min( $max, (int) ( $input['sweetness'] ?? $min ) ) ),
			'body'             => max( $min, min( $max, (int) ( $input['body'] ?? $min ) ) ),
			'pack_weight_g'    => max( 1, min( 50000, (int) ( $input['pack_weight_g'] ?? $defaults['pack_weight_g'] ) ) ),
			'price_mode'       => $price_mode,
			'price_bean_id'    => sanitize_key( (string) ( $input['price_bean_id'] ?? '' ) ),
			'price_mix_id'     => sanitize_key( (string) ( $input['price_mix_id'] ?? '' ) ),
			'price_shop_style' => $shop_style,
			'price_parts'      => $parts,
			'visible'          => $visible,
		);
	}

	/**
	 * @param mixed               $rows     Raw rows.
	 * @param array<int,mixed>    $fallback Fallback list.
	 * @return array<int,array{id:string,label:string}>
	 */
	private static function sanitize_id_label_list( $rows, $fallback ) {
		$out  = array();
		$used = array();
		if ( ! is_array( $rows ) ) {
			return $fallback;
		}
		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$label = sanitize_text_field( (string) ( $row['label'] ?? '' ) );
			if ( '' === $label ) {
				continue;
			}
			$id = sanitize_key( (string) ( $row['id'] ?? $label ) );
			if ( '' === $id || isset( $used[ $id ] ) ) {
				continue;
			}
			$used[ $id ] = true;
			$out[]       = array(
				'id'    => $id,
				'label' => $label,
			);
		}
		return $out ? $out : $fallback;
	}

	/**
	 * Find label for an id in a settings list.
	 *
	 * @param array<int,array{id:string,label:string}> $list List.
	 * @param string                                   $id   Id.
	 * @return string
	 */
	public static function label_for_id( $list, $id ) {
		$id = sanitize_key( (string) $id );
		if ( '' === $id || ! is_array( $list ) ) {
			return '';
		}
		foreach ( $list as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			if ( sanitize_key( (string) ( $row['id'] ?? '' ) ) === $id ) {
				return sanitize_text_field( (string) ( $row['label'] ?? '' ) );
			}
		}
		return '';
	}

	/**
	 * @param string $value Hex color.
	 * @param string $fallback Fallback.
	 * @return string
	 */
	public static function sanitize_hex_color( $value, $fallback ) {
		$value = trim( (string) $value );
		if ( function_exists( 'sanitize_hex_color' ) ) {
			$clean = sanitize_hex_color( $value );
			if ( is_string( $clean ) && '' !== $clean ) {
				return $clean;
			}
		}
		if ( preg_match( '/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', $value ) ) {
			return $value;
		}
		return $fallback;
	}

	/**
	 * @param int|float $n Number.
	 * @return string
	 */
	public static function format_display_number( $n ) {
		$s = (string) (int) round( (float) $n );
		$locale = function_exists( 'determine_locale' ) ? determine_locale() : get_locale();
		if ( 0 === strpos( (string) $locale, 'fa' ) ) {
			return strtr(
				$s,
				array(
					'0' => '۰',
					'1' => '۱',
					'2' => '۲',
					'3' => '۳',
					'4' => '۴',
					'5' => '۵',
					'6' => '۶',
					'7' => '۷',
					'8' => '۸',
					'9' => '۹',
				)
			);
		}
		return $s;
	}
}
