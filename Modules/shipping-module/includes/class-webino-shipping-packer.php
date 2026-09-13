<?php
/**
 * Greedy packaging packer for Iran Post cartons.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Packs order/cart line items into standard postal boxes.
 */
class Webino_Shipping_Packer {

	const ORDER_META = '_webino_packaging_plan';
	const UNIT_EXPAND_LIMIT = 500;

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'woocommerce_checkout_create_order', array( __CLASS__, 'attach_plan_to_order' ), 20, 2 );
	}

	/**
	 * @param WC_Order                $order Order being created.
	 * @param array<string, mixed>    $data  Checkout data.
	 * @return void
	 */
	public static function attach_plan_to_order( $order, $data = array() ) {
		if ( ! is_a( $order, 'WC_Order' ) ) {
			return;
		}
		$plan = null;
		if ( function_exists( 'WC' ) && WC()->session ) {
			$cached = WC()->session->get( 'webino_packaging_plan' );
			if ( is_array( $cached ) ) {
				$plan = $cached;
			}
		}
		if ( ! is_array( $plan ) ) {
			$plan = self::pack_from_order( $order );
		}
		if ( is_array( $plan ) ) {
			$order->update_meta_data( self::ORDER_META, wp_json_encode( $plan ) );
		}
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array<string, mixed>
	 */
	public static function pack_from_order( $order ) {
		$lines = array();
		foreach ( $order->get_items() as $item ) {
			if ( ! is_a( $item, 'WC_Order_Item_Product' ) ) {
				continue;
			}
			$lines[] = array(
				'product_id'   => (int) $item->get_product_id(),
				'variation_id' => (int) $item->get_variation_id(),
				'quantity'     => max( 1, (int) $item->get_quantity() ),
				'name'         => (string) $item->get_name(),
			);
		}
		return self::pack_lines( $lines );
	}

	/**
	 * @param array<int, array{data?:WC_Product,quantity?:float|int,product_id?:int,variation_id?:int}> $package_contents WC package contents.
	 * @return array<string, mixed>
	 */
	public static function pack_from_package_contents( $package_contents ) {
		$lines = array();
		foreach ( (array) $package_contents as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$product = isset( $row['data'] ) ? $row['data'] : null;
			$qty     = isset( $row['quantity'] ) ? (int) $row['quantity'] : 0;
			if ( $qty < 1 ) {
				continue;
			}
			$product_id   = 0;
			$variation_id = 0;
			$name         = '';
			if ( is_a( $product, 'WC_Product' ) ) {
				if ( $product->is_type( 'variation' ) ) {
					$variation_id = (int) $product->get_id();
					$product_id   = (int) $product->get_parent_id();
				} else {
					$product_id = (int) $product->get_id();
				}
				$name = (string) $product->get_name();
			} else {
				$product_id   = isset( $row['product_id'] ) ? (int) $row['product_id'] : 0;
				$variation_id = isset( $row['variation_id'] ) ? (int) $row['variation_id'] : 0;
			}
			$lines[] = array(
				'product_id'   => $product_id,
				'variation_id' => $variation_id,
				'quantity'     => $qty,
				'name'         => $name,
			);
		}
		return self::pack_lines( $lines );
	}

	/**
	 * @param list<array{product_id:int,variation_id?:int,quantity:int,name?:string}> $lines Lines.
	 * @return array<string, mixed>
	 */
	public static function pack_lines( $lines ) {
		$settings = Webino_Shipping_Packaging_Settings::get();
		$boxes    = Webino_Shipping_Packaging_Settings::enabled_boxes_sorted();
		$fill     = (float) $settings['fill_factor'];
		if ( $fill <= 0 ) {
			$fill = 0.85;
		}

		$units = self::expand_units( $lines );
		usort(
			$units,
			static function ( $a, $b ) {
				return $b['volume'] <=> $a['volume'];
			}
		);

		$open       = array();
		$oversized  = false;
		$fallback   = self::largest_box( $boxes );

		foreach ( $units as $unit ) {
			$placed = false;
			foreach ( $open as &$bin ) {
				if ( self::unit_fits_bin( $unit, $bin, $fill ) ) {
					$bin['used_volume'] += $unit['volume'];
					$bin['item_ids'][]   = $unit['key'];
					$placed              = true;
					break;
				}
			}
			unset( $bin );
			if ( $placed ) {
				continue;
			}

			$chosen = self::smallest_box_for_unit( $unit, $boxes );
			if ( null === $chosen ) {
				$oversized = true;
				$chosen    = $fallback ? $fallback : array(
					'size'   => 9,
					'length' => 60.0,
					'width'  => 40.0,
					'height' => 40.0,
					'price'  => 0.0,
					'volume' => 60.0 * 40.0 * 40.0,
				);
			}
			$open[] = array(
				'size'        => (int) $chosen['size'],
				'length'      => (float) $chosen['length'],
				'width'       => (float) $chosen['width'],
				'height'      => (float) $chosen['height'],
				'price'       => (float) $chosen['price'],
				'box_volume'  => (float) $chosen['volume'],
				'used_volume' => (float) $unit['volume'],
				'item_ids'    => array( $unit['key'] ),
				'oversized'   => null === self::smallest_box_for_unit( $unit, $boxes ),
			);
		}

		$total = 0.0;
		$boxes_out = array();
		foreach ( $open as $bin ) {
			$total += (float) $bin['price'];
			if ( ! empty( $bin['oversized'] ) ) {
				$oversized = true;
			}
			$boxes_out[] = array(
				'size'     => (int) $bin['size'],
				'length'   => (float) $bin['length'],
				'width'    => (float) $bin['width'],
				'height'   => (float) $bin['height'],
				'price'    => (float) $bin['price'],
				'item_ids' => array_values( $bin['item_ids'] ),
				'oversized'=> ! empty( $bin['oversized'] ),
			);
		}

		return array(
			'boxes'                 => $boxes_out,
			'box_count'             => count( $boxes_out ),
			'total_packaging_cost'  => $total,
			'oversized'             => $oversized,
			'add_to_checkout'       => ! empty( $settings['add_packaging_cost_to_checkout'] ),
			'unit_count'            => count( $units ),
		);
	}

	/**
	 * @param list<array{product_id:int,variation_id?:int,quantity:int,name?:string}> $lines Lines.
	 * @return list<array{key:string,length:float,width:float,height:float,volume:float}>
	 */
	private static function expand_units( $lines ) {
		$units     = array();
		$total_qty = 0;
		foreach ( $lines as $line ) {
			$total_qty += max( 0, (int) ( $line['quantity'] ?? 0 ) );
		}

		$estimate_mode = $total_qty > self::UNIT_EXPAND_LIMIT;

		foreach ( $lines as $idx => $line ) {
			$qty = max( 0, (int) ( $line['quantity'] ?? 0 ) );
			if ( $qty < 1 ) {
				continue;
			}
			$dims = self::resolve_dims(
				(int) ( $line['product_id'] ?? 0 ),
				(int) ( $line['variation_id'] ?? 0 )
			);
			$vol  = max( 0.001, $dims['length'] * $dims['width'] * $dims['height'] );
			$key_base = (string) ( $line['variation_id'] ?? 0 ) . ':' . (string) ( $line['product_id'] ?? 0 ) . ':' . $idx;

			if ( $estimate_mode ) {
				// One synthetic unit representing qty via volume scaling for box count estimate.
				$units[] = array(
					'key'    => $key_base . '#bulk',
					'length' => $dims['length'],
					'width'  => $dims['width'],
					'height' => $dims['height'],
					'volume' => $vol * $qty,
					'bulk'   => true,
					'qty'    => $qty,
				);
				continue;
			}

			for ( $i = 0; $i < $qty; $i++ ) {
				$units[] = array(
					'key'    => $key_base . '#' . $i,
					'length' => $dims['length'],
					'width'  => $dims['width'],
					'height' => $dims['height'],
					'volume' => $vol,
				);
			}
		}

		if ( $estimate_mode ) {
			return self::estimate_units_as_boxes( $units );
		}

		return $units;
	}

	/**
	 * Convert bulk volume lines into virtual unit slices that fit largest enabled box.
	 *
	 * @param list<array{key:string,length:float,width:float,height:float,volume:float,bulk?:bool,qty?:int}> $bulk_units Units.
	 * @return list<array{key:string,length:float,width:float,height:float,volume:float}>
	 */
	private static function estimate_units_as_boxes( $bulk_units ) {
		$boxes = Webino_Shipping_Packaging_Settings::enabled_boxes_sorted();
		$cap   = self::largest_box( $boxes );
		$fill  = (float) Webino_Shipping_Packaging_Settings::get()['fill_factor'];
		if ( ! $cap ) {
			return $bulk_units;
		}
		$usable = max( 1.0, (float) $cap['volume'] * ( $fill > 0 ? $fill : 0.85 ) );
		$out    = array();
		foreach ( $bulk_units as $u ) {
			$remaining = (float) $u['volume'];
			$n         = 0;
			while ( $remaining > 0.0001 && $n < 2000 ) {
				$slice = min( $remaining, $usable );
				$out[] = array(
					'key'    => $u['key'] . '@' . $n,
					'length' => min( (float) $u['length'], (float) $cap['length'] ),
					'width'  => min( (float) $u['width'], (float) $cap['width'] ),
					'height' => min( (float) $u['height'], (float) $cap['height'] ),
					'volume' => $slice,
				);
				$remaining -= $slice;
				++$n;
			}
		}
		return $out;
	}

	/**
	 * @param int $product_id Product ID.
	 * @param int $variation_id Variation ID.
	 * @return array{length:float,width:float,height:float,weight:float}
	 */
	public static function resolve_dims( $product_id, $variation_id = 0 ) {
		$length = 0.0;
		$width  = 0.0;
		$height = 0.0;
		$weight = 0.0;

		$variation = $variation_id > 0 ? wc_get_product( $variation_id ) : null;
		if ( is_a( $variation, 'WC_Product' ) ) {
			$length = (float) $variation->get_length();
			$width  = (float) $variation->get_width();
			$height = (float) $variation->get_height();
			$weight = (float) $variation->get_weight();
		}

		$parent = $product_id > 0 ? wc_get_product( $product_id ) : null;
		if ( ( $length <= 0 || $width <= 0 || $height <= 0 ) && is_a( $parent, 'WC_Product' ) ) {
			if ( $length <= 0 ) {
				$length = (float) $parent->get_length();
			}
			if ( $width <= 0 ) {
				$width = (float) $parent->get_width();
			}
			if ( $height <= 0 ) {
				$height = (float) $parent->get_height();
			}
			if ( $weight <= 0 ) {
				$weight = (float) $parent->get_weight();
			}
		}

		// Missing dims: treat as tiny so packing still runs (size 1).
		if ( $length <= 0 ) {
			$length = 1.0;
		}
		if ( $width <= 0 ) {
			$width = 1.0;
		}
		if ( $height <= 0 ) {
			$height = 1.0;
		}

		return array(
			'length' => $length,
			'width'  => $width,
			'height' => $height,
			'weight' => $weight,
		);
	}

	/**
	 * @param array{length:float,width:float,height:float,volume:float} $unit Unit.
	 * @param array{length:float,width:float,height:float,box_volume:float,used_volume:float} $bin Open bin.
	 * @param float $fill Fill factor.
	 * @return bool
	 */
	private static function unit_fits_bin( $unit, $bin, $fill ) {
		$usable = (float) $bin['box_volume'] * $fill;
		if ( (float) $bin['used_volume'] + (float) $unit['volume'] > $usable + 0.0001 ) {
			return false;
		}
		return self::dims_fit(
			(float) $unit['length'],
			(float) $unit['width'],
			(float) $unit['height'],
			(float) $bin['length'],
			(float) $bin['width'],
			(float) $bin['height']
		);
	}

	/**
	 * @param array{length:float,width:float,height:float} $unit Unit.
	 * @param list<array{size:int,length:float,width:float,height:float,price:float,volume:float}> $boxes Boxes.
	 * @return array{size:int,length:float,width:float,height:float,price:float,volume:float}|null
	 */
	private static function smallest_box_for_unit( $unit, $boxes ) {
		foreach ( $boxes as $box ) {
			if ( self::dims_fit( $unit['length'], $unit['width'], $unit['height'], $box['length'], $box['width'], $box['height'] ) ) {
				$fill = (float) Webino_Shipping_Packaging_Settings::get()['fill_factor'];
				if ( (float) $unit['volume'] <= (float) $box['volume'] * ( $fill > 0 ? $fill : 0.85 ) + 0.0001 ) {
					return $box;
				}
			}
		}
		return null;
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

	/**
	 * @param list<array{size:int,length:float,width:float,height:float,price:float,volume:float}> $boxes Boxes.
	 * @return array{size:int,length:float,width:float,height:float,price:float,volume:float}|null
	 */
	private static function largest_box( $boxes ) {
		if ( ! $boxes ) {
			return null;
		}
		return $boxes[ count( $boxes ) - 1 ];
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array<string, mixed>|null
	 */
	public static function get_order_plan( $order ) {
		if ( ! is_a( $order, 'WC_Order' ) ) {
			return null;
		}
		$raw = $order->get_meta( self::ORDER_META );
		if ( is_array( $raw ) ) {
			return $raw;
		}
		if ( is_string( $raw ) && '' !== $raw ) {
			$decoded = json_decode( $raw, true );
			return is_array( $decoded ) ? $decoded : null;
		}
		return null;
	}
}
