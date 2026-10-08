<?php
/**
 * Iran Post standard packaging box settings.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Packaging settings (fixed box sizes 1–9 + prices).
 */
class Webino_Shipping_Packaging_Settings {

	const OPTION = 'webino_shipping_packaging';

	/**
	 * @return void
	 */
	public static function init() {
		// Reserved for future upgrades.
	}

	/**
	 * Canonical Iran Post carton sizes (cm).
	 *
	 * @return array<int, array{size:int,length:float,width:float,height:float}>
	 */
	public static function standard_boxes() {
		return array(
			1 => array( 'size' => 1, 'length' => 15.0, 'width' => 10.0, 'height' => 10.0 ),
			2 => array( 'size' => 2, 'length' => 20.0, 'width' => 15.0, 'height' => 10.0 ),
			3 => array( 'size' => 3, 'length' => 20.0, 'width' => 20.0, 'height' => 15.0 ),
			4 => array( 'size' => 4, 'length' => 30.0, 'width' => 20.0, 'height' => 20.0 ),
			5 => array( 'size' => 5, 'length' => 35.0, 'width' => 25.0, 'height' => 20.0 ),
			6 => array( 'size' => 6, 'length' => 45.0, 'width' => 25.0, 'height' => 20.0 ),
			7 => array( 'size' => 7, 'length' => 40.0, 'width' => 30.0, 'height' => 25.0 ),
			8 => array( 'size' => 8, 'length' => 50.0, 'width' => 35.0, 'height' => 30.0 ),
			9 => array( 'size' => 9, 'length' => 60.0, 'width' => 40.0, 'height' => 40.0 ),
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	public static function defaults() {
		$tares = class_exists( 'Webino_Shipping_Weight', false )
			? Webino_Shipping_Weight::default_tare_weights()
			: array( 1 => 40, 2 => 55, 3 => 80, 4 => 120, 5 => 150, 6 => 180, 7 => 220, 8 => 280, 9 => 350 );
		$boxes = array();
		foreach ( self::standard_boxes() as $size => $dims ) {
			$boxes[ (string) $size ] = array(
				'size'          => (int) $size,
				'length'        => $dims['length'],
				'width'         => $dims['width'],
				'height'        => $dims['height'],
				'price'         => 0,
				'tare_weight_g' => (int) ( $tares[ (int) $size ] ?? 40 ),
				'enabled'       => true,
			);
		}
		return array(
			'add_packaging_cost_to_checkout'   => true,
			'fill_factor'                       => 0.85,
			'boxes'                             => $boxes,
			'professional_fee_enabled'          => false,
			'professional_fee_label'            => 'بسته‌بندی حرفه‌ای',
			'professional_fee_description'      => 'بسته‌بندی شکیل و ایمن با لوازم محافظ، روی هزینه ارسال اضافه می‌شود.',
			'professional_fee_amount'           => 95000,
			'professional_fee_default_selected' => false,
			// Mandatory: always applied to every eligible cart; customer cannot remove it.
			'professional_fee_mandatory'        => false,
			// Safer default: when professional fee is selected, do not also charge carton packaging.
			'professional_fee_replaces_carton'  => true,
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	public static function get() {
		$raw = get_option( self::OPTION, null );
		$out = self::defaults();
		if ( ! is_array( $raw ) ) {
			return $out;
		}
		if ( array_key_exists( 'add_packaging_cost_to_checkout', $raw ) ) {
			$out['add_packaging_cost_to_checkout'] = (bool) $raw['add_packaging_cost_to_checkout'];
		}
		if ( array_key_exists( 'professional_fee_enabled', $raw ) ) {
			$out['professional_fee_enabled'] = (bool) $raw['professional_fee_enabled'];
		}
		if ( array_key_exists( 'professional_fee_default_selected', $raw ) ) {
			$out['professional_fee_default_selected'] = (bool) $raw['professional_fee_default_selected'];
		}
		if ( array_key_exists( 'professional_fee_replaces_carton', $raw ) ) {
			$out['professional_fee_replaces_carton'] = (bool) $raw['professional_fee_replaces_carton'];
		}
		if ( array_key_exists( 'professional_fee_mandatory', $raw ) ) {
			$out['professional_fee_mandatory'] = (bool) $raw['professional_fee_mandatory'];
		}
		if ( isset( $raw['professional_fee_label'] ) ) {
			$label = sanitize_text_field( (string) $raw['professional_fee_label'] );
			if ( '' !== $label ) {
				$out['professional_fee_label'] = $label;
			}
		}
		if ( isset( $raw['professional_fee_description'] ) ) {
			$out['professional_fee_description'] = sanitize_textarea_field( (string) $raw['professional_fee_description'] );
		}
		if ( isset( $raw['professional_fee_amount'] ) ) {
			$out['professional_fee_amount'] = max( 0, (float) $raw['professional_fee_amount'] );
		}
		if ( isset( $raw['fill_factor'] ) ) {
			$ff = (float) $raw['fill_factor'];
			if ( $ff > 0.1 && $ff <= 1.0 ) {
				$out['fill_factor'] = $ff;
			}
		}
		if ( isset( $raw['boxes'] ) && is_array( $raw['boxes'] ) ) {
			$defaults = self::defaults();
			foreach ( self::standard_boxes() as $size => $dims ) {
				$key = (string) $size;
				$row = isset( $raw['boxes'][ $key ] ) && is_array( $raw['boxes'][ $key ] )
					? $raw['boxes'][ $key ]
					: ( isset( $raw['boxes'][ $size ] ) && is_array( $raw['boxes'][ $size ] ) ? $raw['boxes'][ $size ] : array() );
				$default_tare = isset( $defaults['boxes'][ $key ]['tare_weight_g'] )
					? (int) $defaults['boxes'][ $key ]['tare_weight_g']
					: 40;
				$out['boxes'][ $key ] = array(
					'size'          => (int) $size,
					'length'        => $dims['length'],
					'width'         => $dims['width'],
					'height'        => $dims['height'],
					'price'         => isset( $row['price'] ) ? max( 0, (float) $row['price'] ) : 0,
					'tare_weight_g' => isset( $row['tare_weight_g'] ) ? max( 0, (int) $row['tare_weight_g'] ) : $default_tare,
					'enabled'       => array_key_exists( 'enabled', $row ) ? (bool) $row['enabled'] : true,
				);
			}
		}
		return $out;
	}

	/**
	 * @param array<string, mixed> $input Settings payload.
	 * @return array<string, mixed>
	 */
	public static function update( $input ) {
		$current = self::get();
		if ( ! is_array( $input ) ) {
			return $current;
		}
		if ( array_key_exists( 'add_packaging_cost_to_checkout', $input ) ) {
			$current['add_packaging_cost_to_checkout'] = (bool) $input['add_packaging_cost_to_checkout'];
		}
		if ( array_key_exists( 'professional_fee_enabled', $input ) ) {
			$current['professional_fee_enabled'] = (bool) $input['professional_fee_enabled'];
		}
		if ( array_key_exists( 'professional_fee_default_selected', $input ) ) {
			$current['professional_fee_default_selected'] = (bool) $input['professional_fee_default_selected'];
		}
		if ( array_key_exists( 'professional_fee_replaces_carton', $input ) ) {
			$current['professional_fee_replaces_carton'] = (bool) $input['professional_fee_replaces_carton'];
		}
		if ( array_key_exists( 'professional_fee_mandatory', $input ) ) {
			$current['professional_fee_mandatory'] = (bool) $input['professional_fee_mandatory'];
		}
		if ( isset( $input['professional_fee_label'] ) ) {
			$label = sanitize_text_field( (string) $input['professional_fee_label'] );
			if ( '' !== $label ) {
				$current['professional_fee_label'] = $label;
			}
		}
		if ( isset( $input['professional_fee_description'] ) ) {
			$current['professional_fee_description'] = sanitize_textarea_field( (string) $input['professional_fee_description'] );
		}
		if ( isset( $input['professional_fee_amount'] ) ) {
			$current['professional_fee_amount'] = max( 0, (float) $input['professional_fee_amount'] );
		}
		if ( isset( $input['fill_factor'] ) ) {
			$ff = (float) $input['fill_factor'];
			if ( $ff > 0.1 && $ff <= 1.0 ) {
				$current['fill_factor'] = $ff;
			}
		}
		if ( isset( $input['boxes'] ) && is_array( $input['boxes'] ) ) {
			foreach ( self::standard_boxes() as $size => $dims ) {
				$key = (string) $size;
				$row = null;
				if ( isset( $input['boxes'][ $key ] ) && is_array( $input['boxes'][ $key ] ) ) {
					$row = $input['boxes'][ $key ];
				} elseif ( isset( $input['boxes'][ $size ] ) && is_array( $input['boxes'][ $size ] ) ) {
					$row = $input['boxes'][ $size ];
				} else {
					foreach ( $input['boxes'] as $maybe ) {
						if ( is_array( $maybe ) && isset( $maybe['size'] ) && (int) $maybe['size'] === (int) $size ) {
							$row = $maybe;
							break;
						}
					}
				}
				if ( ! is_array( $row ) ) {
					continue;
				}
				$current['boxes'][ $key ] = array(
					'size'          => (int) $size,
					'length'        => $dims['length'],
					'width'         => $dims['width'],
					'height'        => $dims['height'],
					'price'         => isset( $row['price'] ) ? max( 0, (float) $row['price'] ) : (float) $current['boxes'][ $key ]['price'],
					'tare_weight_g' => isset( $row['tare_weight_g'] )
						? max( 0, (int) $row['tare_weight_g'] )
						: (int) ( $current['boxes'][ $key ]['tare_weight_g'] ?? 0 ),
					'enabled'       => array_key_exists( 'enabled', $row ) ? (bool) $row['enabled'] : (bool) $current['boxes'][ $key ]['enabled'],
				);
			}
		}
		update_option( self::OPTION, $current, false );
		// Packaging / professional-fee settings change carton shipping rates: drop cached rates.
		if ( class_exists( 'WC_Cache_Helper' ) && method_exists( 'WC_Cache_Helper', 'get_transient_version' ) ) {
			WC_Cache_Helper::get_transient_version( 'shipping', true );
		}
		return $current;
	}

	/**
	 * Enabled boxes sorted by volume ascending.
	 *
	 * @return list<array{size:int,length:float,width:float,height:float,price:float,tare_weight_g:int,volume:float}>
	 */
	public static function enabled_boxes_sorted() {
		$settings = self::get();
		$out      = array();
		foreach ( $settings['boxes'] as $box ) {
			if ( empty( $box['enabled'] ) ) {
				continue;
			}
			$l = (float) $box['length'];
			$w = (float) $box['width'];
			$h = (float) $box['height'];
			$out[] = array(
				'size'          => (int) $box['size'],
				'length'        => $l,
				'width'         => $w,
				'height'        => $h,
				'price'         => (float) $box['price'],
				'tare_weight_g' => (int) ( $box['tare_weight_g'] ?? 0 ),
				'volume'        => $l * $w * $h,
			);
		}
		usort(
			$out,
			static function ( $a, $b ) {
				if ( $a['volume'] === $b['volume'] ) {
					return $a['size'] <=> $b['size'];
				}
				return $a['volume'] <=> $b['volume'];
			}
		);
		return $out;
	}
}
