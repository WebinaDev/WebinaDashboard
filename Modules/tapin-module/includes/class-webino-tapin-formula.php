<?php
/**
 * Offline Tapin/PWS rate formula (ported tables).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Webino_Tapin_Formula {

	/**
	 * Vicinity band: in|beside|out.
	 *
	 * @param int $from Province code.
	 * @param int $to Province code.
	 * @return string
	 */
	public static function vicinity( $from, $to ) {
		$from = (int) $from;
		$to   = (int) $to;
		if ( $from > 0 && $from === $to ) {
			return 'in';
		}
		if ( self::is_beside( $from, $to ) ) {
			return 'beside';
		}
		return 'out';
	}

	/**
	 * @param int $source Source province.
	 * @param int $destination Dest province.
	 * @return bool
	 */
	public static function is_beside( $source, $destination ) {
		$is_beside = array();
		$is_beside[3][16] = true;
		$is_beside[3][15] = true;
		$is_beside[3][12] = true;
		$is_beside[16][3]  = true;
		$is_beside[16][18] = true;
		$is_beside[16][12] = true;
		$is_beside[15][3]  = true;
		$is_beside[15][2]  = true;
		$is_beside[15][12] = true;
		$is_beside[6][24] = true;
		$is_beside[6][20] = true;
		$is_beside[6][28] = true;
		$is_beside[6][11] = true;
		$is_beside[6][10] = true;
		$is_beside[6][9]  = true;
		$is_beside[6][30] = true;
		$is_beside[6][25] = true;
		$is_beside[6][5]  = true;
		$is_beside[31][1]  = true;
		$is_beside[31][11] = true;
		$is_beside[31][8]  = true;
		$is_beside[31][13] = true;
		$is_beside[27][19] = true;
		$is_beside[27][20] = true;
		$is_beside[27][4]  = true;
		$is_beside[21][28] = true;
		$is_beside[21][4]  = true;
		$is_beside[21][5]  = true;
		$is_beside[21][23] = true;
		$is_beside[1][31] = true;
		$is_beside[1][11] = true;
		$is_beside[1][10] = true;
		$is_beside[1][13] = true;
		$is_beside[1][9]  = true;
		$is_beside[24][28] = true;
		$is_beside[24][4]  = true;
		$is_beside[24][20] = true;
		$is_beside[24][6]  = true;
		$is_beside[30][26] = true;
		$is_beside[30][22] = true;
		$is_beside[30][25] = true;
		$is_beside[30][6]  = true;
		$is_beside[30][9]  = true;
		$is_beside[30][7]  = true;
		$is_beside[7][30] = true;
		$is_beside[7][29] = true;
		$is_beside[7][9]  = true;
		$is_beside[29][7]  = true;
		$is_beside[29][14] = true;
		$is_beside[29][9]  = true;
		$is_beside[4][27] = true;
		$is_beside[4][21] = true;
		$is_beside[4][20] = true;
		$is_beside[4][28] = true;
		$is_beside[4][24] = true;
		$is_beside[12][2]  = true;
		$is_beside[12][15] = true;
		$is_beside[12][3]  = true;
		$is_beside[12][16] = true;
		$is_beside[12][18] = true;
		$is_beside[12][17] = true;
		$is_beside[12][8]  = true;
		$is_beside[9][13] = true;
		$is_beside[9][1]  = true;
		$is_beside[9][10] = true;
		$is_beside[9][6]  = true;
		$is_beside[9][29] = true;
		$is_beside[9][7]  = true;
		$is_beside[9][30] = true;
		$is_beside[26][30] = true;
		$is_beside[26][22] = true;
		$is_beside[26][23] = true;
		$is_beside[5][6]  = true;
		$is_beside[5][25] = true;
		$is_beside[5][21] = true;
		$is_beside[5][23] = true;
		$is_beside[5][28] = true;
		$is_beside[5][22] = true;
		$is_beside[8][12] = true;
		$is_beside[8][17] = true;
		$is_beside[8][11] = true;
		$is_beside[8][31] = true;
		$is_beside[8][13] = true;
		$is_beside[8][2]  = true;
		$is_beside[10][1]  = true;
		$is_beside[10][11] = true;
		$is_beside[10][9]  = true;
		$is_beside[10][6]  = true;
		$is_beside[18][16] = true;
		$is_beside[18][19] = true;
		$is_beside[18][17] = true;
		$is_beside[18][12] = true;
		$is_beside[22][25] = true;
		$is_beside[22][5]  = true;
		$is_beside[22][23] = true;
		$is_beside[22][26] = true;
		$is_beside[22][30] = true;
		$is_beside[19][18] = true;
		$is_beside[19][17] = true;
		$is_beside[19][20] = true;
		$is_beside[19][27] = true;
		$is_beside[28][24] = true;
		$is_beside[28][4]  = true;
		$is_beside[28][21] = true;
		$is_beside[28][5]  = true;
		$is_beside[28][6]  = true;
		$is_beside[14][13] = true;
		$is_beside[14][29] = true;
		$is_beside[14][9]  = true;
		$is_beside[2][13] = true;
		$is_beside[2][15] = true;
		$is_beside[2][12] = true;
		$is_beside[2][8]  = true;
		$is_beside[20][27] = true;
		$is_beside[20][19] = true;
		$is_beside[20][17] = true;
		$is_beside[20][11] = true;
		$is_beside[20][6]  = true;
		$is_beside[20][24] = true;
		$is_beside[20][4]  = true;
		$is_beside[13][14] = true;
		$is_beside[13][9]  = true;
		$is_beside[13][1]  = true;
		$is_beside[13][31] = true;
		$is_beside[13][6]  = true;
		$is_beside[13][8]  = true;
		$is_beside[13][2]  = true;
		$is_beside[11][6]  = true;
		$is_beside[11][10] = true;
		$is_beside[11][1]  = true;
		$is_beside[11][31] = true;
		$is_beside[11][20] = true;
		$is_beside[11][8]  = true;
		$is_beside[11][17] = true;
		$is_beside[23][21] = true;
		$is_beside[23][5]  = true;
		$is_beside[23][22] = true;
		$is_beside[23][26] = true;
		$is_beside[17][19] = true;
		$is_beside[17][20] = true;
		$is_beside[17][18] = true;
		$is_beside[17][11] = true;
		$is_beside[17][8]  = true;
		$is_beside[17][12] = true;
		$is_beside[25][5]  = true;
		$is_beside[25][22] = true;
		$is_beside[25][30] = true;
		return $is_beside[ $source ][ $destination ] ?? false;
		$source = (int) $source;
		$destination = (int) $destination;
		return ! empty( $is_beside[ $source ][ $destination ] );
	}

	/**
	 * Border origin provinces use *-border rate tables.
	 *
	 * @param int $province Province code.
	 * @return bool
	 */
	public static function is_border_origin( $province ) {
		return in_array( (int) $province, array( 4, 8, 13, 14, 19, 22, 26, 27 ), true );
	}

	/**
	 * @param string $method pishtaz|vip.
	 * @param int    $weight_g Weight grams.
	 * @param int    $box_id Box 1-10.
	 * @param int    $from_province Origin.
	 * @param int    $to_province Dest.
	 * @param array  $args Extra: price (cart), fragile, is_cod, gateway posteketab.
	 * @return float|null
	 */
	public static function calculate( $method, $weight_g, $box_id, $from_province, $to_province, $args = array() ) {
		$method = ( 'vip' === $method || 'special' === $method ) ? 'special' : 'pishtaz';
		$box_id = max( 1, min( 10, (int) $box_id ) );
		$weight_g = max( 1, (int) $weight_g );
		$kg = (int) ceil( $weight_g / 1000 );
		$weight_index = min( 30, max( 1, $kg ) ) * 1000;

		$dir = dirname( __DIR__ ) . '/data/rates/';
		$border = self::is_border_origin( (int) $from_province );
		if ( 'special' === $method ) {
			$file = $border ? 'tapin-special-border.php' : 'tapin-special.php';
		} else {
			$file = $border ? 'tapin-pishtaz-border.php' : 'tapin-pishtaz.php';
		}
		$path = $dir . $file;
		if ( ! is_readable( $path ) ) {
			return null;
		}
		$box_rates = include $path;
		if ( ! is_array( $box_rates ) ) {
			return null;
		}
		// Find nearest weight bucket.
		if ( ! isset( $box_rates[ $weight_index ] ) ) {
			$keys = array_keys( $box_rates );
			sort( $keys, SORT_NUMERIC );
			$picked = $keys[0];
			foreach ( $keys as $k ) {
				$picked = $k;
				if ( (int) $k >= $weight_index ) {
					break;
				}
			}
			$weight_index = (int) $picked;
		}
		$vicinity = self::vicinity( (int) $from_province, (int) $to_province );
		$row = $box_rates[ $weight_index ][ $box_id ] ?? null;
		if ( ! is_array( $row ) || ! isset( $row[ $vicinity ] ) ) {
			return null;
		}
		$cost = (float) $row[ $vicinity ];

		// Island surcharge (approx).
		$islands = array( 1013, 1014 ); // unused without city codes; skip unless args.
		if ( ! empty( $args['island'] ) ) {
			$cost += 50000;
		}
		if ( ! empty( $args['fragile'] ) ) {
			$cost *= 1.25;
		}

		$price = (float) ( $args['price'] ?? 0 );
		if ( $price > 0 ) {
			if ( $price <= 2000000 ) {
				$insurance_rate = 0.004;
			} elseif ( $price <= 10000000 ) {
				$insurance_rate = 0.0035;
			} elseif ( $price <= 20000000 ) {
				$insurance_rate = 0.003;
			} elseif ( $price <= 50000000 ) {
				$insurance_rate = 0.0025;
			} else {
				$insurance_rate = 0.002;
			}
			$cost += $price * $insurance_rate;
		}

		if ( ! empty( $args['is_cod'] ) ) {
			$cost += max( 15000, $price * 0.01 );
		}

		$cost *= 1.1; // tax approx

		if ( ! empty( $args['posteketab'] ) ) {
			$cost *= 0.7;
		}

		return max( 0, round( $cost ) );
	}

	/**
	 * Non-Tapin 1405 pishtaz table.
	 *
	 * @param int $weight_g Weight.
	 * @param int $box_id Box.
	 * @param int $from From province.
	 * @param int $to To province.
	 * @return float|null
	 */
	public static function pishtaz_1405( $weight_g, $box_id, $from, $to ) {
		$path = dirname( __DIR__ ) . '/data/pishtaz-rates.php';
		if ( ! is_readable( $path ) ) {
			return null;
		}
		$rates = include $path;
		if ( ! is_array( $rates ) ) {
			return null;
		}
		$box_id = max( 1, min( 10, (int) $box_id ) );
		$kg = (int) ceil( max( 1, (int) $weight_g ) / 1000 );
		$weight_index = min( 30, max( 1, $kg ) ) * 1000;
		if ( ! isset( $rates[ $weight_index ] ) ) {
			$keys = array_keys( $rates );
			sort( $keys, SORT_NUMERIC );
			$picked = end( $keys );
			foreach ( $keys as $k ) {
				$picked = $k;
				if ( (int) $k >= $weight_index ) {
					break;
				}
			}
			$weight_index = (int) $picked;
		}
		$vicinity = self::vicinity( (int) $from, (int) $to );
		$row = $rates[ $weight_index ][ $box_id ] ?? null;
		if ( ! is_array( $row ) || ! isset( $row[ $vicinity ] ) ) {
			return null;
		}
		return (float) $row[ $vicinity ] * 1.1;
	}
}
