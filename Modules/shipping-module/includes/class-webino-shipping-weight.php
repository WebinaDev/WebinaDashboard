<?php
/**
 * Product/package weight helpers for marketplace sync.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Converts WC weight and estimates Basalam package_weight using postal box tare.
 */
class Webino_Shipping_Weight {

	/**
	 * Default empty-carton weights (grams) by Iran Post size.
	 *
	 * @return array<int, int>
	 */
	public static function default_tare_weights() {
		return array(
			1 => 40,
			2 => 55,
			3 => 80,
			4 => 120,
			5 => 150,
			6 => 180,
			7 => 220,
			8 => 280,
			9 => 350,
		);
	}

	/**
	 * @param mixed $wc_weight Raw WooCommerce weight value.
	 * @return int Grams (0 if empty/invalid).
	 */
	public static function to_grams( $wc_weight ) {
		if ( null === $wc_weight || '' === $wc_weight ) {
			return 0;
		}
		$weight = str_replace( ',', '.', (string) $wc_weight );
		if ( ! is_numeric( $weight ) ) {
			return 0;
		}
		$n = (float) $weight;
		if ( $n <= 0 ) {
			return 0;
		}
		$unit = (string) get_option( 'woocommerce_weight_unit', 'kg' );
		if ( 'kg' === $unit ) {
			return (int) round( $n * 1000 );
		}
		if ( 'lbs' === $unit ) {
			return (int) round( $n * 453.592 );
		}
		if ( 'oz' === $unit ) {
			return (int) round( $n * 28.3495 );
		}
		// g or unknown → treat as grams.
		return (int) round( $n );
	}

	/**
	 * Estimate product weight + smallest fitting carton tare for one unit.
	 *
	 * @param WC_Product $product Product or variation.
	 * @return array{product_weight_g:int,box_size:int,tare_g:int,package_weight_g:int}
	 */
	public static function estimate_unit_package( $product ) {
		$product_weight_g = 0;
		$box_size         = 1;
		$tare_g           = (int) ( self::default_tare_weights()[1] ?? 40 );

		if ( ! is_a( $product, 'WC_Product' ) ) {
			return array(
				'product_weight_g'  => 0,
				'box_size'          => $box_size,
				'tare_g'            => $tare_g,
				'package_weight_g'  => $tare_g,
			);
		}

		$product_weight_g = self::to_grams( $product->get_weight() );
		$parent_id        = $product->is_type( 'variation' ) ? (int) $product->get_parent_id() : 0;
		$parent           = $parent_id > 0 ? wc_get_product( $parent_id ) : null;

		if ( $product_weight_g <= 0 && is_a( $parent, 'WC_Product' ) ) {
			$product_weight_g = self::to_grams( $parent->get_weight() );
		}
		if ( $product_weight_g <= 0 && class_exists( 'Webino_Shipping_Tools', false ) ) {
			$product_weight_g = max( 0, (int) Webino_Shipping_Tools::get()['default_product_weight_g'] );
		}

		$product_id   = $product->is_type( 'variation' ) ? $parent_id : (int) $product->get_id();
		$variation_id = $product->is_type( 'variation' ) ? (int) $product->get_id() : 0;

		$dims = class_exists( 'Webino_Shipping_Packer', false )
			? Webino_Shipping_Packer::resolve_dims( $product_id, $variation_id )
			: array(
				'length' => (float) $product->get_length(),
				'width'  => (float) $product->get_width(),
				'height' => (float) $product->get_height(),
			);

		if ( ( $dims['length'] <= 0 || $dims['width'] <= 0 || $dims['height'] <= 0 ) && is_a( $parent, 'WC_Product' ) ) {
			if ( $dims['length'] <= 0 ) {
				$dims['length'] = (float) $parent->get_length();
			}
			if ( $dims['width'] <= 0 ) {
				$dims['width'] = (float) $parent->get_width();
			}
			if ( $dims['height'] <= 0 ) {
				$dims['height'] = (float) $parent->get_height();
			}
		}

		$chosen = self::smallest_box_for_dims(
			(float) $dims['length'],
			(float) $dims['width'],
			(float) $dims['height']
		);

		if ( is_array( $chosen ) ) {
			$box_size = (int) $chosen['size'];
			$tare_g   = (int) $chosen['tare_weight_g'];
		}

		return array(
			'product_weight_g' => max( 0, $product_weight_g ),
			'box_size'         => $box_size,
			'tare_g'           => max( 0, $tare_g ),
			'package_weight_g' => max( 0, $product_weight_g ) + max( 0, $tare_g ),
		);
	}

	/**
	 * @param float $length cm.
	 * @param float $width  cm.
	 * @param float $height cm.
	 * @return array{size:int,tare_weight_g:int,length:float,width:float,height:float}|null
	 */
	private static function smallest_box_for_dims( $length, $width, $height ) {
		$boxes = Webino_Shipping_Packaging_Settings::enabled_boxes_sorted();
		if ( ! $boxes ) {
			$defaults = self::default_tare_weights();
			return array(
				'size'          => 1,
				'tare_weight_g' => (int) ( $defaults[1] ?? 40 ),
				'length'        => 15.0,
				'width'         => 10.0,
				'height'        => 10.0,
			);
		}

		$has_dims = $length > 0 && $width > 0 && $height > 0;
		if ( ! $has_dims ) {
			$first = $boxes[0];
			return array(
				'size'          => (int) $first['size'],
				'tare_weight_g' => (int) ( $first['tare_weight_g'] ?? 0 ),
				'length'        => (float) $first['length'],
				'width'         => (float) $first['width'],
				'height'        => (float) $first['height'],
			);
		}

		foreach ( $boxes as $box ) {
			if ( self::dims_fit( $length, $width, $height, $box['length'], $box['width'], $box['height'] ) ) {
				return array(
					'size'          => (int) $box['size'],
					'tare_weight_g' => (int) ( $box['tare_weight_g'] ?? 0 ),
					'length'        => (float) $box['length'],
					'width'         => (float) $box['width'],
					'height'        => (float) $box['height'],
				);
			}
		}

		$last = $boxes[ count( $boxes ) - 1 ];
		return array(
			'size'          => (int) $last['size'],
			'tare_weight_g' => (int) ( $last['tare_weight_g'] ?? 0 ),
			'length'        => (float) $last['length'],
			'width'         => (float) $last['width'],
			'height'        => (float) $last['height'],
		);
	}

	/**
	 * @param float $il Item L.
	 * @param float $iw Item W.
	 * @param float $ih Item H.
	 * @param float $bl Box L.
	 * @param float $bw Box W.
	 * @param float $bh Box H.
	 * @return bool
	 */
	private static function dims_fit( $il, $iw, $ih, $bl, $bw, $bh ) {
		$item = array( $il, $iw, $ih );
		sort( $item, SORT_NUMERIC );
		$box = array( $bl, $bw, $bh );
		sort( $box, SORT_NUMERIC );
		return $item[0] <= $box[0] + 0.0001
			&& $item[1] <= $box[1] + 0.0001
			&& $item[2] <= $box[2] + 0.0001;
	}
}
