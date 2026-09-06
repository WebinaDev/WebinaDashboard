<?php
/**
 * Coffee green → roast → mix pricing synced to WFCP.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Bean/mix formula engine and product price application.
 */
final class Webino_Dashboard_Coffee_Pricing {

	const OPTION_KEY   = 'webino_coffee_pricing';
	const BATCH_HOOK   = 'webino_coffee_pricing_recalc_batch';
	const BATCH_OPTION = 'webino_coffee_pricing_recalc_state';
	const BATCH_SIZE   = 25;

	/**
	 * @return void
	 */
	public static function init() {
		add_action( self::BATCH_HOOK, array( __CLASS__, 'process_recalc_batch' ), 10, 1 );
	}

	/**
	 * Defaults from Coffee price site.xlsx.
	 *
	 * @return array<string,mixed>
	 */
	public static function defaults() {
		$beans = array(
			array( 'id' => 'vietnam', 'name' => 'Vietnam', 'kind' => 'robusta', 'green_price' => 1353, 'product_id' => 0 ),
			array( 'id' => 'pb', 'name' => 'PB', 'kind' => 'robusta', 'green_price' => 1562, 'product_id' => 0 ),
			array( 'id' => 'cherry', 'name' => 'Cherry', 'kind' => 'robusta', 'green_price' => 1672, 'product_id' => 0 ),
			array( 'id' => 'uganda', 'name' => 'Uganda', 'kind' => 'robusta', 'green_price' => 1672, 'product_id' => 0 ),
			array( 'id' => 'indonesia', 'name' => 'Indonesia', 'kind' => 'robusta', 'green_price' => 1870, 'product_id' => 0 ),
			array( 'id' => 'rio', 'name' => 'Rio', 'kind' => 'arabica', 'green_price' => 1980, 'product_id' => 0 ),
			array( 'id' => 'ethiopia', 'name' => 'Ethiopia', 'kind' => 'arabica', 'green_price' => 2145, 'product_id' => 0 ),
			array( 'id' => 'kenya', 'name' => 'Kenya', 'kind' => 'arabica', 'green_price' => 2420, 'product_id' => 0 ),
			array( 'id' => 'santos', 'name' => 'Santos', 'kind' => 'arabica', 'green_price' => 3025, 'product_id' => 0 ),
			array( 'id' => 'colombia', 'name' => 'Colombia', 'kind' => 'arabica', 'green_price' => 3795, 'product_id' => 0 ),
		);

		$base_mixes = array(
			array(
				'id'    => 'classic_robusta',
				'name'  => 'Classic Robusta',
				'kind'  => 'robusta',
				'parts' => array(
					array( 'bean_id' => 'vietnam', 'percent' => 70 ),
					array( 'bean_id' => 'pb', 'percent' => 30 ),
				),
			),
			array(
				'id'    => 'base_arabica',
				'name'  => 'Base Arabica',
				'kind'  => 'robusta',
				'parts' => array(
					array( 'bean_id' => 'vietnam', 'percent' => 50 ),
					array( 'bean_id' => 'pb', 'percent' => 20 ),
					array( 'bean_id' => 'cherry', 'percent' => 15 ),
					array( 'bean_id' => 'indonesia', 'percent' => 15 ),
				),
			),
			array(
				'id'    => 'full_caffeine',
				'name'  => 'Full Caffeine',
				'kind'  => 'robusta',
				'parts' => array(
					array( 'bean_id' => 'vietnam', 'percent' => 50 ),
					array( 'bean_id' => 'pb', 'percent' => 20 ),
					array( 'bean_id' => 'uganda', 'percent' => 15 ),
					array( 'bean_id' => 'indonesia', 'percent' => 15 ),
				),
			),
			array(
				'id'    => 'classic_arabica',
				'name'  => 'Classic Arabica',
				'kind'  => 'arabica',
				'parts' => array(
					array( 'bean_id' => 'rio', 'percent' => 50 ),
					array( 'bean_id' => 'ethiopia', 'percent' => 50 ),
				),
			),
			array(
				'id'    => 'luxury_arabica',
				'name'  => 'Luxury Arabica',
				'kind'  => 'arabica',
				'parts' => array(
					array( 'bean_id' => 'santos', 'percent' => 50 ),
					array( 'bean_id' => 'kenya', 'percent' => 25 ),
					array( 'bean_id' => 'rio', 'percent' => 25 ),
				),
			),
		);

		return array(
			'roast_yield'      => 0.85,
			'weight_attribute' => '',
			'weight_packs'     => array(
				array( 'term' => '250', 'label' => '250g', 'grams' => 250 ),
				array( 'term' => '500', 'label' => '500g', 'grams' => 500 ),
				array( 'term' => '1000', 'label' => '1kg', 'grams' => 1000 ),
			),
			'beans'            => $beans,
			// Patterns for name detection only (not edited on pricing page).
			'base_mixes'       => $base_mixes,
			'shop_styles'      => array(
				'classic' => array(
					'robusta_mix_id' => 'classic_robusta',
					'arabica_mix_id' => 'classic_arabica',
				),
				'luxury'  => array(
					'robusta_mix_id' => 'base_arabica',
					'arabica_mix_id' => 'luxury_arabica',
				),
			),
			'economy_beans'    => array(
				'robusta_bean_id' => 'vietnam',
				'arabica_bean_id' => 'rio',
			),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get() {
		$stored = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}
		return self::sanitize( array_merge( self::defaults(), $stored ) );
	}

	/**
	 * WooCommerce product IDs linked to green/roast beans in pricing table.
	 *
	 * @return list<int>
	 */
	public static function bean_product_ids() {
		$settings = self::get();
		$ids      = array();
		foreach ( (array) ( $settings['beans'] ?? array() ) as $bean ) {
			if ( ! is_array( $bean ) ) {
				continue;
			}
			$pid = (int) ( $bean['product_id'] ?? 0 );
			if ( $pid > 0 ) {
				$ids[] = $pid;
			}
		}
		return array_values( array_unique( $ids ) );
	}

	/**
	 * @param array<string,mixed> $input Input.
	 * @return array<string,mixed>
	 */
	public static function save( $input ) {
		$clean = self::sanitize( is_array( $input ) ? $input : array() );
		update_option( self::OPTION_KEY, $clean, false );
		return $clean;
	}

	/**
	 * @param array<string,mixed> $input Input.
	 * @return array<string,mixed>
	 */
	public static function sanitize( $input ) {
		$defaults = self::defaults();
		$yield    = (float) ( $input['roast_yield'] ?? $defaults['roast_yield'] );
		if ( $yield < 0.5 || $yield > 1 ) {
			$yield = 0.85;
		}

		$weight_attribute = sanitize_text_field( (string) ( $input['weight_attribute'] ?? '' ) );

		$packs_in = isset( $input['weight_packs'] ) && is_array( $input['weight_packs'] ) ? $input['weight_packs'] : $defaults['weight_packs'];
		$packs    = array();
		$pack_seen = array();
		foreach ( $packs_in as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$term = sanitize_title( (string) ( $row['term'] ?? '' ) );
			if ( '' === $term ) {
				$term = sanitize_text_field( (string) ( $row['term'] ?? '' ) );
			}
			$label = sanitize_text_field( (string) ( $row['label'] ?? $term ) );
			$grams = max( 0, (int) ( $row['grams'] ?? 0 ) );
			if ( '' === $term || $grams <= 0 ) {
				continue;
			}
			$key = strtolower( $term );
			if ( isset( $pack_seen[ $key ] ) ) {
				continue;
			}
			$pack_seen[ $key ] = true;
			$packs[]           = array(
				'term'  => $term,
				'label' => '' !== $label ? $label : $term,
				'grams' => $grams,
			);
		}

		$beans_in = isset( $input['beans'] ) && is_array( $input['beans'] ) ? $input['beans'] : $defaults['beans'];
		$beans    = array();
		$seen     = array();
		foreach ( $beans_in as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$id = sanitize_key( (string) ( $row['id'] ?? '' ) );
			if ( '' === $id || isset( $seen[ $id ] ) ) {
				continue;
			}
			$seen[ $id ] = true;
			$kind        = sanitize_key( (string) ( $row['kind'] ?? 'robusta' ) );
			if ( ! in_array( $kind, array( 'robusta', 'arabica' ), true ) ) {
				$kind = 'robusta';
			}
			$beans[] = array(
				'id'          => $id,
				'name'        => sanitize_text_field( (string) ( $row['name'] ?? $id ) ),
				'kind'        => $kind,
				'green_price' => max( 0, (float) ( $row['green_price'] ?? 0 ) ),
				'product_id'  => max( 0, (int) ( $row['product_id'] ?? 0 ) ),
			);
		}
		if ( ! $beans ) {
			$beans = $defaults['beans'];
		}

		$bean_ids = array();
		foreach ( $beans as $b ) {
			$bean_ids[ $b['id'] ] = true;
		}

		// Keep Excel patterns for mix-name detection (not edited on pricing UI).
		$mixes_in = isset( $input['base_mixes'] ) && is_array( $input['base_mixes'] ) ? $input['base_mixes'] : $defaults['base_mixes'];
		$mixes    = array();
		$mix_seen = array();
		foreach ( $mixes_in as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$id = sanitize_key( (string) ( $row['id'] ?? '' ) );
			if ( '' === $id || isset( $mix_seen[ $id ] ) ) {
				continue;
			}
			$mix_seen[ $id ] = true;
			$kind            = sanitize_key( (string) ( $row['kind'] ?? 'robusta' ) );
			if ( ! in_array( $kind, array( 'robusta', 'arabica' ), true ) ) {
				$kind = 'robusta';
			}
			$parts_in = isset( $row['parts'] ) && is_array( $row['parts'] ) ? $row['parts'] : array();
			$parts    = array();
			$sum      = 0.0;
			foreach ( $parts_in as $p ) {
				if ( ! is_array( $p ) ) {
					continue;
				}
				$bid = sanitize_key( (string) ( $p['bean_id'] ?? '' ) );
				if ( '' === $bid || empty( $bean_ids[ $bid ] ) ) {
					continue;
				}
				$pct = max( 0, min( 100, (float) ( $p['percent'] ?? 0 ) ) );
				if ( $pct <= 0 ) {
					continue;
				}
				$parts[] = array(
					'bean_id' => $bid,
					'percent' => $pct,
				);
				$sum += $pct;
			}
			if ( $sum > 0 && abs( $sum - 100 ) > 0.01 ) {
				foreach ( $parts as $i => $p ) {
					$parts[ $i ]['percent'] = round( $p['percent'] * 100 / $sum, 4 );
				}
			}
			$mixes[] = array(
				'id'    => $id,
				'name'  => sanitize_text_field( (string) ( $row['name'] ?? $id ) ),
				'kind'  => $kind,
				'parts' => $parts,
			);
		}
		if ( ! $mixes ) {
			$mixes = $defaults['base_mixes'];
		}

		$mix_ids = array();
		foreach ( $mixes as $m ) {
			$mix_ids[ $m['id'] ] = true;
		}

		$shop_in = isset( $input['shop_styles'] ) && is_array( $input['shop_styles'] ) ? $input['shop_styles'] : array();
		$shop    = array();
		foreach ( array( 'classic', 'luxury' ) as $style ) {
			$row = isset( $shop_in[ $style ] ) && is_array( $shop_in[ $style ] ) ? $shop_in[ $style ] : ( $defaults['shop_styles'][ $style ] ?? array() );
			$r   = sanitize_key( (string) ( $row['robusta_mix_id'] ?? '' ) );
			$a   = sanitize_key( (string) ( $row['arabica_mix_id'] ?? '' ) );
			if ( empty( $mix_ids[ $r ] ) ) {
				$r = (string) ( $defaults['shop_styles'][ $style ]['robusta_mix_id'] ?? '' );
			}
			if ( empty( $mix_ids[ $a ] ) ) {
				$a = (string) ( $defaults['shop_styles'][ $style ]['arabica_mix_id'] ?? '' );
			}
			$shop[ $style ] = array(
				'robusta_mix_id' => $r,
				'arabica_mix_id' => $a,
			);
		}

		$eco_in = isset( $input['economy_beans'] ) && is_array( $input['economy_beans'] ) ? $input['economy_beans'] : $defaults['economy_beans'];
		$eco_r  = sanitize_key( (string) ( $eco_in['robusta_bean_id'] ?? 'vietnam' ) );
		$eco_a  = sanitize_key( (string) ( $eco_in['arabica_bean_id'] ?? 'rio' ) );
		if ( empty( $bean_ids[ $eco_r ] ) ) {
			$eco_r = 'vietnam';
		}
		if ( empty( $bean_ids[ $eco_a ] ) ) {
			$eco_a = 'rio';
		}

		return array(
			'roast_yield'      => $yield,
			'weight_attribute' => $weight_attribute,
			'weight_packs'     => $packs,
			'beans'            => $beans,
			'base_mixes'       => $mixes,
			'shop_styles'      => $shop,
			'economy_beans'    => array(
				'robusta_bean_id' => $eco_r,
				'arabica_bean_id' => $eco_a,
			),
		);
	}

	/**
	 * Computed table for UI: beans after roast + mixes.
	 *
	 * @param array<string,mixed>|null $settings Settings.
	 * @return array<string,mixed>
	 */
	public static function computed( $settings = null ) {
		$s = is_array( $settings ) ? $settings : self::get();
		$beans_out = array();
		$by_id     = array();
		foreach ( (array) $s['beans'] as $b ) {
			$green = (float) $b['green_price'];
			$after = self::after_roast( $green, (float) $s['roast_yield'] );
			$row   = array_merge(
				$b,
				array(
					'after_roast' => $after,
				)
			);
			$beans_out[]         = $row;
			$by_id[ $b['id'] ] = $after;
		}

		$mixes_out = array();
		$mix_by_id = array();
		foreach ( (array) $s['base_mixes'] as $m ) {
			$price = self::weighted_from_map( (array) ( $m['parts'] ?? array() ), $by_id );
			$row   = array_merge(
				$m,
				array(
					'after_roast' => $price,
				)
			);
			$mixes_out[]           = $row;
			$mix_by_id[ $m['id'] ] = $price;
		}

		return array(
			'settings'    => $s,
			'beans'       => $beans_out,
			'base_mixes'  => $mixes_out,
			'shop_styles' => $s['shop_styles'],
			'economy'     => array(
				'robusta_bean_id' => $s['economy_beans']['robusta_bean_id'],
				'arabica_bean_id' => $s['economy_beans']['arabica_bean_id'],
				'robusta_after'   => (float) ( $by_id[ $s['economy_beans']['robusta_bean_id'] ] ?? 0 ),
				'arabica_after'   => (float) ( $by_id[ $s['economy_beans']['arabica_bean_id'] ] ?? 0 ),
			),
			'_maps'       => array(
				'beans' => $by_id,
				'mixes' => $mix_by_id,
			),
		);
	}

	/**
	 * @param float $green Green price.
	 * @param float $yield Roast yield.
	 * @return float
	 */
	public static function after_roast( $green, $yield ) {
		$yield = (float) $yield;
		if ( $yield <= 0 ) {
			$yield = 0.85;
		}
		return (float) $green / $yield;
	}

	/**
	 * @param list<array{bean_id:string,percent:float}> $parts Parts.
	 * @param array<string,float>                       $map Bean after-roast map.
	 * @return float
	 */
	private static function weighted_from_map( $parts, $map ) {
		$sum = 0.0;
		$w   = 0.0;
		foreach ( $parts as $p ) {
			$id  = (string) ( $p['bean_id'] ?? '' );
			$pct = (float) ( $p['percent'] ?? 0 );
			if ( '' === $id || $pct <= 0 || ! isset( $map[ $id ] ) ) {
				continue;
			}
			$sum += ( (float) $map[ $id ] ) * ( $pct / 100 );
			$w   += $pct;
		}
		if ( $w <= 0 ) {
			return 0.0;
		}
		if ( abs( $w - 100 ) > 0.5 ) {
			$sum = $sum * ( 100 / $w );
		}
		return $sum;
	}

	/**
	 * Resolve per-kg purchase price for a product profile.
	 * Primary source: price_parts (bean composition). Legacy modes kept for old data.
	 *
	 * @param array<string,mixed>      $profile Profile.
	 * @param array<string,mixed>|null $computed Computed tables.
	 * @return float|WP_Error
	 */
	public static function purchase_per_kg_for_profile( $profile, $computed = null ) {
		$c     = is_array( $computed ) ? $computed : self::computed();
		$beans = isset( $c['_maps']['beans'] ) && is_array( $c['_maps']['beans'] ) ? $c['_maps']['beans'] : array();
		$mixes = isset( $c['_maps']['mixes'] ) && is_array( $c['_maps']['mixes'] ) ? $c['_maps']['mixes'] : array();

		$parts = isset( $profile['price_parts'] ) && is_array( $profile['price_parts'] ) ? $profile['price_parts'] : array();
		if ( ! empty( $parts ) ) {
			$price = self::weighted_from_map( $parts, $beans );
			if ( $price <= 0 ) {
				return new WP_Error( 'bad_parts', __( 'ترکیب دان برای قیمت نامعتبر است.', 'webino-dashboard' ) );
			}
			return $price;
		}

		$mode = sanitize_key( (string) ( $profile['price_mode'] ?? '' ) );
		if ( '' === $mode || 'none' === $mode ) {
			return new WP_Error( 'no_price_mode', __( 'ترکیب دان برای قیمت تنظیم نشده.', 'webino-dashboard' ) );
		}

		$rob    = max( 0, min( 100, (int) ( $profile['blend_robusta'] ?? 0 ) ) );
		$ara    = max( 0, min( 100, (int) ( $profile['blend_arabica'] ?? 0 ) ) );
		$sum_ra = $rob + $ara;
		if ( $sum_ra > 0 && $sum_ra !== 100 ) {
			$rob = (int) round( $rob * 100 / $sum_ra );
			$ara = 100 - $rob;
		}

		if ( 'single' === $mode ) {
			$bid = sanitize_key( (string) ( $profile['price_bean_id'] ?? '' ) );
			if ( '' === $bid || ! isset( $beans[ $bid ] ) ) {
				return new WP_Error( 'bad_bean', __( 'دان انتخاب‌شده نامعتبر است.', 'webino-dashboard' ) );
			}
			return (float) $beans[ $bid ];
		}

		if ( 'base_mix' === $mode ) {
			$mid = sanitize_key( (string) ( $profile['price_mix_id'] ?? '' ) );
			if ( '' === $mid || ! isset( $mixes[ $mid ] ) ) {
				return new WP_Error( 'bad_mix', __( 'میکس پایه نامعتبر است.', 'webino-dashboard' ) );
			}
			return (float) $mixes[ $mid ];
		}

		if ( 'shop' === $mode ) {
			$style = sanitize_key( (string) ( $profile['price_shop_style'] ?? 'classic' ) );
			if ( ! in_array( $style, array( 'classic', 'luxury' ), true ) ) {
				$style = 'classic';
			}
			$cfg = isset( $c['settings']['shop_styles'][ $style ] ) ? $c['settings']['shop_styles'][ $style ] : array();
			$rm  = (string) ( $cfg['robusta_mix_id'] ?? '' );
			$am  = (string) ( $cfg['arabica_mix_id'] ?? '' );
			if ( ! isset( $mixes[ $rm ], $mixes[ $am ] ) ) {
				return new WP_Error( 'bad_shop', __( 'تنظیمات میکس مغازه ناقص است.', 'webino-dashboard' ) );
			}
			if ( $sum_ra <= 0 ) {
				return new WP_Error( 'bad_ratio', __( 'نسبت روبوستا/عربیکا را در پروفایل تنظیم کنید.', 'webino-dashboard' ) );
			}
			return ( (float) $mixes[ $rm ] ) * ( $rob / 100 ) + ( (float) $mixes[ $am ] ) * ( $ara / 100 );
		}

		if ( 'economy' === $mode ) {
			$eco = isset( $c['settings']['economy_beans'] ) ? $c['settings']['economy_beans'] : array();
			$rb  = (string) ( $eco['robusta_bean_id'] ?? '' );
			$ab  = (string) ( $eco['arabica_bean_id'] ?? '' );
			if ( ! isset( $beans[ $rb ], $beans[ $ab ] ) ) {
				return new WP_Error( 'bad_eco', __( 'دان‌های میکس اقتصادی نامعتبرند.', 'webino-dashboard' ) );
			}
			if ( $sum_ra <= 0 ) {
				return new WP_Error( 'bad_ratio', __( 'نسبت روبوستا/عربیکا را در پروفایل تنظیم کنید.', 'webino-dashboard' ) );
			}
			return ( (float) $beans[ $rb ] ) * ( $rob / 100 ) + ( (float) $beans[ $ab ] ) * ( $ara / 100 );
		}

		if ( 'custom' === $mode ) {
			return new WP_Error( 'bad_custom', __( 'ترکیب دان برای قیمت خالی است.', 'webino-dashboard' ) );
		}

		return new WP_Error( 'bad_mode', __( 'حالت قیمت‌گذاری نامعتبر است.', 'webino-dashboard' ) );
	}

	/**
	 * Detect Excel pattern name matching composition (within 1%).
	 *
	 * @param list<array{bean_id?:string,percent?:float|int}> $parts Parts.
	 * @param array<string,mixed>|null                          $settings Settings.
	 * @return array{id:string,name:string}|null
	 */
	public static function detect_mix_pattern( $parts, $settings = null ) {
		$s = is_array( $settings ) ? $settings : self::get();
		$map = array();
		foreach ( (array) $parts as $p ) {
			if ( ! is_array( $p ) ) {
				continue;
			}
			$bid = sanitize_key( (string) ( $p['bean_id'] ?? '' ) );
			$pct = (float) ( $p['percent'] ?? 0 );
			if ( '' === $bid || $pct <= 0 ) {
				continue;
			}
			$map[ $bid ] = ( isset( $map[ $bid ] ) ? (float) $map[ $bid ] : 0.0 ) + $pct;
		}
		if ( ! $map ) {
			return null;
		}
		$sum = array_sum( $map );
		if ( $sum > 0 && abs( $sum - 100 ) > 0.01 ) {
			foreach ( $map as $k => $v ) {
				$map[ $k ] = $v * 100 / $sum;
			}
		}
		foreach ( (array) ( $s['base_mixes'] ?? array() ) as $mix ) {
			if ( ! is_array( $mix ) ) {
				continue;
			}
			$want = array();
			foreach ( (array) ( $mix['parts'] ?? array() ) as $p ) {
				if ( ! is_array( $p ) ) {
					continue;
				}
				$bid = sanitize_key( (string) ( $p['bean_id'] ?? '' ) );
				$pct = (float) ( $p['percent'] ?? 0 );
				if ( '' === $bid || $pct <= 0 ) {
					continue;
				}
				$want[ $bid ] = ( isset( $want[ $bid ] ) ? (float) $want[ $bid ] : 0.0 ) + $pct;
			}
			if ( count( $want ) !== count( $map ) ) {
				continue;
			}
			$ok = true;
			foreach ( $want as $bid => $pct ) {
				if ( ! isset( $map[ $bid ] ) || abs( (float) $map[ $bid ] - $pct ) > 1.0 ) {
					$ok = false;
					break;
				}
			}
			if ( $ok ) {
				return array(
					'id'   => (string) ( $mix['id'] ?? '' ),
					'name' => (string) ( $mix['name'] ?? '' ),
				);
			}
		}
		return null;
	}

	/**
	 * Apply pricing to one product (simple or variable weight variations).
	 *
	 * @param int                      $product_id Product ID.
	 * @param array<string,mixed>|null $computed Computed.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function apply_to_product( $product_id, $computed = null ) {
		$product_id = (int) $product_id;
		$product    = function_exists( 'wc_get_product' ) ? wc_get_product( $product_id ) : null;
		if ( ! $product ) {
			return new WP_Error( 'not_found', __( 'Product not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}

		$profile = Webino_Dashboard_Coffee_Profile::get_profile( $product_id );
		$per_kg  = self::purchase_per_kg_for_profile( $profile, $computed );
		if ( is_wp_error( $per_kg ) ) {
			return $per_kg;
		}

		$updated = array();
		if ( $product->is_type( 'variable' ) ) {
			$children = $product->get_children();
			if ( empty( $children ) ) {
				$q = new WP_Query(
					array(
						'post_type'      => 'product_variation',
						'post_parent'    => $product_id,
						'posts_per_page' => -1,
						'fields'         => 'ids',
						'post_status'    => array( 'publish', 'private' ),
					)
				);
				$children = $q->posts;
			}
			foreach ( (array) $children as $vid ) {
				$v = wc_get_product( (int) $vid );
				if ( ! $v || ! $v->is_type( 'variation' ) ) {
					continue;
				}
				$grams = self::grams_from_variation( $v );
				if ( $grams <= 0 ) {
					$grams = (int) ( $profile['pack_weight_g'] ?? 1000 );
				}
				$purchase = (float) $per_kg * ( $grams / 1000 );
				self::write_purchase_and_sync( (int) $vid, $purchase );
				$updated[] = array(
					'id'       => (int) $vid,
					'grams'    => $grams,
					'purchase' => $purchase,
				);
			}
			WC_Product_Variable::sync( $product_id );
		} else {
			$grams    = (int) ( $profile['pack_weight_g'] ?? 1000 );
			$purchase = (float) $per_kg * ( $grams / 1000 );
			self::write_purchase_and_sync( $product_id, $purchase );
			$updated[] = array(
				'id'       => $product_id,
				'grams'    => $grams,
				'purchase' => $purchase,
			);
		}

		return array(
			'ok'           => true,
			'product_id'   => $product_id,
			'per_kg'       => (float) $per_kg,
			'updated'      => $updated,
			'updated_count'=> count( $updated ),
		);
	}

	/**
	 * Sync bean catalog products linked in pricing settings (single-origin SKUs).
	 *
	 * @param array<string,mixed>|null $computed Computed.
	 * @return array{updated:int,items:list<array>}
	 */
	public static function apply_linked_bean_products( $computed = null ) {
		$c       = is_array( $computed ) ? $computed : self::computed();
		$updated = 0;
		$items   = array();
		foreach ( (array) ( $c['beans'] ?? array() ) as $bean ) {
			$pid = (int) ( $bean['product_id'] ?? 0 );
			if ( $pid <= 0 ) {
				continue;
			}
			$profile = Webino_Dashboard_Coffee_Profile::get_profile( $pid );
			$parts   = isset( $profile['price_parts'] ) && is_array( $profile['price_parts'] ) ? $profile['price_parts'] : array();
			if ( empty( $parts ) ) {
				$profile['price_mode']    = 'custom';
				$profile['price_bean_id'] = (string) $bean['id'];
				$profile['price_parts']   = array(
					array(
						'bean_id' => (string) $bean['id'],
						'percent' => 100,
					),
				);
				Webino_Dashboard_Coffee_Profile::save_profile( $pid, $profile );
			}
			$res = self::apply_to_product( $pid, $c );
			if ( ! is_wp_error( $res ) ) {
				++$updated;
				$items[] = $res;
			}
		}
		return array(
			'updated' => $updated,
			'items'   => $items,
		);
	}

	/**
	 * @param int   $product_id Product/variation ID.
	 * @param float $purchase Purchase price.
	 * @return void
	 */
	public static function write_purchase_and_sync( $product_id, $purchase ) {
		$product_id = (int) $product_id;
		$purchase   = (float) $purchase;
		if ( class_exists( 'WFCP_Helper', false ) ) {
			$purchase = (float) WFCP_Helper::sanitize_price( $purchase );
			update_post_meta( $product_id, '_wfcp_purchase_price', $purchase );
			WFCP_Helper::sync_retail_price_from_purchase( $product_id, $purchase );
			return;
		}
		update_post_meta( $product_id, '_wfcp_purchase_price', $purchase );
		update_post_meta( $product_id, '_regular_price', $purchase );
		update_post_meta( $product_id, '_price', $purchase );
	}

	/**
	 * Parse grams from variation weight attribute.
	 * Prefers weight_packs map, then parses attribute values.
	 *
	 * @param WC_Product $variation Variation.
	 * @return int
	 */
	public static function grams_from_variation( $variation ) {
		$settings = self::get();
		$packs    = isset( $settings['weight_packs'] ) && is_array( $settings['weight_packs'] ) ? $settings['weight_packs'] : array();
		$attr_key = (string) ( $settings['weight_attribute'] ?? '' );
		$attrs    = $variation->get_attributes();
		if ( ! is_array( $attrs ) ) {
			return 0;
		}

		$pack_map = array();
		foreach ( $packs as $pack ) {
			if ( ! is_array( $pack ) ) {
				continue;
			}
			$term  = strtolower( trim( (string) ( $pack['term'] ?? '' ) ) );
			$label = strtolower( trim( (string) ( $pack['label'] ?? '' ) ) );
			$grams = (int) ( $pack['grams'] ?? 0 );
			if ( $grams <= 0 ) {
				continue;
			}
			if ( '' !== $term ) {
				$pack_map[ $term ] = $grams;
			}
			if ( '' !== $label ) {
				$pack_map[ $label ] = $grams;
			}
		}

		$candidates = array();
		if ( '' !== $attr_key ) {
			$slug = sanitize_title( $attr_key );
			foreach ( $attrs as $name => $val ) {
				$n = (string) $name;
				if ( $n === $attr_key || $n === 'pa_' . $slug || $n === $slug || false !== strpos( $n, $slug ) ) {
					$candidates[] = (string) $val;
				}
			}
		}
		foreach ( $attrs as $name => $val ) {
			$hay = strtolower( (string) $name . ' ' . (string) $val );
			if ( false !== strpos( $hay, 'weight' ) || false !== strpos( $hay, 'وزن' ) || false !== strpos( (string) $name, 'pa_wt' ) || false !== strpos( (string) $name, 'wt' ) ) {
				$candidates[] = (string) $val;
			}
		}
		foreach ( $attrs as $val ) {
			$candidates[] = (string) $val;
		}

		foreach ( $candidates as $val ) {
			$key = strtolower( trim( $val ) );
			if ( '' !== $key && isset( $pack_map[ $key ] ) ) {
				return (int) $pack_map[ $key ];
			}
			// Match pack term as substring (e.g. "250g", "250 گرم").
			foreach ( $packs as $pack ) {
				if ( ! is_array( $pack ) ) {
					continue;
				}
				$term  = strtolower( trim( (string) ( $pack['term'] ?? '' ) ) );
				$grams = (int) ( $pack['grams'] ?? 0 );
				if ( $grams <= 0 || '' === $term ) {
					continue;
				}
				if ( $key === $term || false !== strpos( $key, $term ) || (string) $grams === $key ) {
					return $grams;
				}
			}
		}

		foreach ( $attrs as $name => $val ) {
			$hay       = strtolower( (string) $name . ' ' . (string) $val );
			$is_weight = ( false !== strpos( $hay, 'weight' ) || false !== strpos( $hay, 'وزن' ) || false !== strpos( (string) $name, 'pa_wt' ) || false !== strpos( (string) $name, 'wt' ) );
			$grams     = self::parse_grams( (string) $val );
			if ( $grams > 0 && ( $is_weight || $grams >= 10 ) ) {
				if ( $is_weight || preg_match( '/^\d+/', (string) $val ) ) {
					return $grams;
				}
			}
		}
		// Fallback: any numeric attribute that looks like grams.
		foreach ( $attrs as $val ) {
			$grams = self::parse_grams( (string) $val );
			if ( $grams >= 50 && $grams <= 5000 ) {
				return $grams;
			}
		}
		return 0;
	}

	/**
	 * @param string $raw Raw term.
	 * @return int
	 */
	public static function parse_grams( $raw ) {
		$raw = trim( (string) $raw );
		if ( '' === $raw ) {
			return 0;
		}
		if ( preg_match( '/(\d+(?:[.,]\d+)?)\s*(kg|کیلو)/iu', $raw, $m ) ) {
			return (int) round( (float) str_replace( ',', '.', $m[1] ) * 1000 );
		}
		if ( preg_match( '/(\d+)/u', $raw, $m ) ) {
			return (int) $m[1];
		}
		return 0;
	}

	/**
	 * Product IDs priced via composition (price_parts) or legacy price_mode.
	 *
	 * @return list<int>
	 */
	public static function priced_product_ids() {
		global $wpdb;
		$meta = Webino_Dashboard_Coffee_Profile::META_KEY;
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s",
				$meta
			)
		);
		$ids = array();
		foreach ( (array) $rows as $pid ) {
			$pid = (int) $pid;
			if ( $pid <= 0 ) {
				continue;
			}
			$post = get_post( $pid );
			if ( ! $post || 'product' !== $post->post_type ) {
				continue;
			}
			$profile = Webino_Dashboard_Coffee_Profile::get_profile( $pid );
			$parts   = isset( $profile['price_parts'] ) && is_array( $profile['price_parts'] ) ? $profile['price_parts'] : array();
			if ( ! empty( $parts ) ) {
				$ids[] = $pid;
				continue;
			}
			$mode = sanitize_key( (string) ( $profile['price_mode'] ?? '' ) );
			if ( '' === $mode || 'none' === $mode ) {
				continue;
			}
			$ids[] = $pid;
		}
		return array_values( array_unique( $ids ) );
	}

	/**
	 * Queue full recalc of all priced coffee products (+ linked beans).
	 *
	 * @return array{ok:bool,total:int,queued:bool}
	 */
	public static function queue_recalc_all() {
		$computed = self::computed();
		self::apply_linked_bean_products( $computed );

		$ids = self::priced_product_ids();
		$state = array(
			'status'    => 'running',
			'total'     => count( $ids ),
			'done'      => 0,
			'failed'    => 0,
			'offset'    => 0,
			'ids'       => $ids,
			'started_at'=> current_time( 'mysql', true ),
			'updated_at'=> current_time( 'mysql', true ),
			'errors'    => array(),
		);
		update_option( self::BATCH_OPTION, $state, false );
		self::schedule_batch( 0 );
		return array(
			'ok'     => true,
			'total'  => count( $ids ),
			'queued' => true,
		);
	}

	/**
	 * @param int $offset Offset.
	 * @return void
	 */
	private static function schedule_batch( $offset ) {
		$offset = max( 0, (int) $offset );
		if ( function_exists( 'as_enqueue_async_action' ) ) {
			as_enqueue_async_action( self::BATCH_HOOK, array( $offset ), 'webino-coffee-pricing' );
			return;
		}
		wp_schedule_single_event( time() + 1, self::BATCH_HOOK, array( $offset ) );
	}

	/**
	 * @param int $offset Offset.
	 * @return void
	 */
	public static function process_recalc_batch( $offset = 0 ) {
		$state = get_option( self::BATCH_OPTION, array() );
		if ( ! is_array( $state ) || empty( $state['ids'] ) || 'running' !== ( $state['status'] ?? '' ) ) {
			return;
		}
		$ids      = array_map( 'intval', (array) $state['ids'] );
		$offset   = max( 0, (int) $offset );
		$slice    = array_slice( $ids, $offset, self::BATCH_SIZE );
		$computed = self::computed();
		$done     = (int) ( $state['done'] ?? 0 );
		$failed   = (int) ( $state['failed'] ?? 0 );
		$errors   = isset( $state['errors'] ) && is_array( $state['errors'] ) ? $state['errors'] : array();

		foreach ( $slice as $pid ) {
			$res = self::apply_to_product( $pid, $computed );
			if ( is_wp_error( $res ) ) {
				++$failed;
				if ( count( $errors ) < 20 ) {
					$errors[] = array(
						'product_id' => $pid,
						'message'    => $res->get_error_message(),
					);
				}
			} else {
				++$done;
			}
		}

		$next = $offset + count( $slice );
		$state['done']       = $done;
		$state['failed']     = $failed;
		$state['offset']     = $next;
		$state['errors']     = $errors;
		$state['updated_at'] = current_time( 'mysql', true );

		if ( $next >= count( $ids ) ) {
			$state['status']      = 'done';
			$state['finished_at'] = current_time( 'mysql', true );
			update_option( self::BATCH_OPTION, $state, false );
			return;
		}

		update_option( self::BATCH_OPTION, $state, false );
		self::schedule_batch( $next );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function recalc_state() {
		$state = get_option( self::BATCH_OPTION, array() );
		if ( ! is_array( $state ) ) {
			$state = array();
		}
		return array(
			'status'      => (string) ( $state['status'] ?? 'idle' ),
			'total'       => (int) ( $state['total'] ?? 0 ),
			'done'        => (int) ( $state['done'] ?? 0 ),
			'failed'      => (int) ( $state['failed'] ?? 0 ),
			'offset'      => (int) ( $state['offset'] ?? 0 ),
			'started_at'  => (string) ( $state['started_at'] ?? '' ),
			'updated_at'  => (string) ( $state['updated_at'] ?? '' ),
			'finished_at' => (string) ( $state['finished_at'] ?? '' ),
			'errors'      => isset( $state['errors'] ) && is_array( $state['errors'] ) ? $state['errors'] : array(),
		);
	}

	/**
	 * Preview retail via WFCP for a per-kg purchase.
	 *
	 * @param float $purchase_per_kg Per kg.
	 * @param int   $product_id Optional context product.
	 * @return float
	 */
	public static function preview_retail( $purchase_per_kg, $product_id = 0 ) {
		if ( class_exists( 'WFCP_Calculator', false ) ) {
			return (float) WFCP_Calculator::calculate_price( (float) $purchase_per_kg, 'retail', (int) $product_id );
		}
		return (float) $purchase_per_kg;
	}
}
