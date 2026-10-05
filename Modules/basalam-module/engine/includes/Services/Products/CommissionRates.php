<?php

namespace WebinoBasalam\Services\Products;

use WebinoBasalam\Admin\Product\Category\CategoryMapping;
use WebinoBasalam\Admin\Settings\SettingsConfig;
use WebinoBasalam\Admin\Settings\SettingsManager;
use WebinoBasalam\Logger\Logger;
use WebinoBasalam\Utilities\PriceAdjustment;

defined( 'ABSPATH' ) || exit;

/**
 * Local Basalam retail commission rates (e.g. Mehr 1405 tariff CSV) keyed by leaf category id.
 */
class CommissionRates {

	const OPTION = 'webino_basalam_commission_rates';

	/**
	 * @return array{rates: array<string,float>, paths: array<string,array<string,mixed>>, imported_at: string, row_count: int, unmatched: int}
	 */
	public static function get(): array {
		$raw = get_option( self::OPTION, array() );
		if ( ! is_array( $raw ) ) {
			$raw = array();
		}
		$rates = isset( $raw['rates'] ) && is_array( $raw['rates'] ) ? $raw['rates'] : array();
		$out_rates = array();
		foreach ( $rates as $id => $pct ) {
			$out_rates[ (string) $id ] = (float) $pct;
		}
		return array(
			'rates'       => $out_rates,
			'paths'       => isset( $raw['paths'] ) && is_array( $raw['paths'] ) ? $raw['paths'] : array(),
			'imported_at' => isset( $raw['imported_at'] ) ? (string) $raw['imported_at'] : '',
			'row_count'   => isset( $raw['row_count'] ) ? (int) $raw['row_count'] : count( $out_rates ),
			'unmatched'   => isset( $raw['unmatched'] ) ? (int) $raw['unmatched'] : 0,
		);
	}

	/**
	 * @param int[] $category_ids Basalam level path.
	 * @return float Percent 0–100, or 0 if unknown.
	 */
	public static function lookupPercent( array $category_ids ): float {
		$data = self::get();
		if ( empty( $data['rates'] ) ) {
			return 0.0;
		}
		// Prefer leaf, then parents.
		for ( $i = count( $category_ids ) - 1; $i >= 0; $i-- ) {
			$key = (string) absint( $category_ids[ $i ] );
			if ( $key !== '0' && isset( $data['rates'][ $key ] ) ) {
				return (float) $data['rates'][ $key ];
			}
		}
		return 0.0;
	}

	/**
	 * Parse CSV text and match against Basalam category tree.
	 *
	 * @param string $csv Raw CSV (UTF-8).
	 * @return array{ok:bool,message:string,matched:int,unmatched:int,row_count:int}
	 */
	public static function importCsv( string $csv ): array {
		$csv = self::stripBom( $csv );
		if ( '' === trim( $csv ) ) {
			return array(
				'ok'        => false,
				'message'   => 'empty_csv',
				'matched'   => 0,
				'unmatched' => 0,
				'row_count' => 0,
			);
		}

		$rows = self::parseCsvRows( $csv );
		if ( empty( $rows ) ) {
			return array(
				'ok'        => false,
				'message'   => 'no_rows',
				'matched'   => 0,
				'unmatched' => 0,
				'row_count' => 0,
			);
		}

		return self::importRows( $rows, true );
	}

	/**
	 * Seed rates from bundled Mehr 1405 tariff (name paths → Basalam leaf ids).
	 *
	 * @param bool $enable_commission Set price_change_value to commission when matched > 0.
	 * @return array{ok:bool,message:string,matched:int,unmatched:int,row_count:int}
	 */
	public static function seedFromBundledTariff( bool $enable_commission = true ): array {
		$path = dirname( __DIR__, 3 ) . '/data/mehr-1405-commission-tariff.php';
		if ( ! is_readable( $path ) ) {
			return array(
				'ok'        => false,
				'message'   => 'tariff_file_missing',
				'matched'   => 0,
				'unmatched' => 0,
				'row_count' => 0,
			);
		}
		$raw = include $path;
		if ( ! is_array( $raw ) || array() === $raw ) {
			return array(
				'ok'        => false,
				'message'   => 'tariff_empty',
				'matched'   => 0,
				'unmatched' => 0,
				'row_count' => 0,
			);
		}
		$rows = array();
		foreach ( $raw as $row ) {
			if ( ! is_array( $row ) || count( $row ) < 4 ) {
				continue;
			}
			$l1  = trim( (string) $row[0] );
			$l2  = trim( (string) $row[1] );
			$l3  = trim( (string) $row[2] );
			$pct = (float) $row[3];
			if ( '' === $l1 || $pct <= 0 || $pct >= 100 ) {
				continue;
			}
			$rows[] = array(
				'l1'      => $l1,
				'l2'      => $l2,
				'l3'      => $l3,
				'percent' => $pct,
			);
		}
		if ( array() === $rows ) {
			return array(
				'ok'        => false,
				'message'   => 'tariff_empty',
				'matched'   => 0,
				'unmatched' => 0,
				'row_count' => 0,
			);
		}
		return self::importRows( $rows, $enable_commission );
	}

	/**
	 * Match tariff name-path rows against Basalam category tree and store option.
	 *
	 * @param array<int,array{l1:string,l2:string,l3:string,percent:float}> $rows Rows.
	 * @param bool                                                           $enable_commission Enable commission mode.
	 * @return array{ok:bool,message:string,matched:int,unmatched:int,row_count:int}
	 */
	public static function importRows( array $rows, bool $enable_commission = true ): array {
		try {
			$tree = CategoryMapping::getBasalamCategories();
		} catch ( \Throwable $e ) {
			Logger::error( 'commission import: categories fetch failed: ' . $e->getMessage() );
			return array(
				'ok'        => false,
				'message'   => 'categories_fetch_failed',
				'matched'   => 0,
				'unmatched' => 0,
				'row_count' => 0,
			);
		}

		$index = self::buildNameIndex( $tree );
		if ( empty( $rows ) ) {
			return array(
				'ok'        => false,
				'message'   => 'no_rows',
				'matched'   => 0,
				'unmatched' => 0,
				'row_count' => 0,
			);
		}

		$rates     = array();
		$paths     = array();
		$matched   = 0;
		$unmatched = 0;

		foreach ( $rows as $row ) {
			$l1  = isset( $row['l1'] ) ? (string) $row['l1'] : '';
			$l2  = isset( $row['l2'] ) ? (string) $row['l2'] : '';
			$l3  = isset( $row['l3'] ) ? (string) $row['l3'] : '';
			$pct = isset( $row['percent'] ) ? (float) $row['percent'] : 0.0;
			if ( $pct <= 0 || $pct >= 100 ) {
				++$unmatched;
				continue;
			}

			$hit = self::resolvePath( $index, $l1, $l2, $l3 );
			if ( null === $hit ) {
				++$unmatched;
				continue;
			}

			$leaf = (string) $hit['leaf_id'];
			$rates[ $leaf ] = $pct;
			$paths[ $leaf ] = array(
				'level1'  => $l1,
				'level2'  => $l2,
				'level3'  => $l3,
				'ids'     => $hit['ids'],
				'percent' => $pct,
			);
			++$matched;
		}

		update_option(
			self::OPTION,
			array(
				'rates'       => $rates,
				'paths'       => $paths,
				'imported_at' => gmdate( 'c' ),
				'row_count'   => $matched,
				'unmatched'   => $unmatched,
			),
			false
		);

		if ( $enable_commission && $matched > 0 ) {
			SettingsManager::updateSettings(
				array(
					SettingsConfig::PRICE_CHANGE_VALUE => PriceAdjustment::COMMISSION,
				)
			);
			if ( function_exists( 'webinoBasalamSettings' ) ) {
				webinoBasalamSettings()->forget();
			}
		}

		return array(
			'ok'        => true,
			'message'   => 'imported',
			'matched'   => $matched,
			'unmatched' => $unmatched,
			'row_count' => $matched,
		);
	}

	/**
	 * @param string $csv CSV body.
	 * @return array<int,array{l1:string,l2:string,l3:string,percent:float}>
	 */
	private static function parseCsvRows( string $csv ): array {
		$lines = preg_split( '/\R/u', $csv );
		if ( ! is_array( $lines ) ) {
			return array();
		}
		$out     = array();
		$header  = true;
		$col_map = array( 'l1' => 0, 'l2' => 1, 'l3' => 2, 'pct' => 3 );

		foreach ( $lines as $line ) {
			$line = trim( (string) $line );
			if ( '' === $line ) {
				continue;
			}
			$cells = str_getcsv( $line );
			if ( ! is_array( $cells ) || count( $cells ) < 2 ) {
				continue;
			}
			if ( $header ) {
				$header  = false;
				$col_map = self::detectColumns( $cells );
				// If first row looks like data (numeric percent), treat as data.
				if ( null === $col_map ) {
					$col_map = array( 'l1' => 0, 'l2' => 1, 'l3' => 2, 'pct' => 3 );
					$parsed  = self::rowFromCells( $cells, $col_map );
					if ( null !== $parsed ) {
						$out[] = $parsed;
					}
				}
				continue;
			}
			$parsed = self::rowFromCells( $cells, $col_map );
			if ( null !== $parsed ) {
				$out[] = $parsed;
			}
		}
		return $out;
	}

	/**
	 * @param string[] $cells Header cells.
	 * @return array{l1:int,l2:int,l3:int,pct:int}|null
	 */
	private static function detectColumns( array $cells ): ?array {
		$map = array( 'l1' => -1, 'l2' => -1, 'l3' => -1, 'pct' => -1 );
		foreach ( $cells as $i => $cell ) {
			$n = self::normalizeName( (string) $cell );
			if ( false !== mb_strpos( $n, 'سطح1' ) || false !== mb_strpos( $n, 'سطح ۱' ) || ( false !== mb_strpos( $n, 'سطح' ) && false !== mb_strpos( $n, '1' ) ) || false !== mb_strpos( $n, 'level1' ) ) {
				$map['l1'] = (int) $i;
			} elseif ( false !== mb_strpos( $n, 'سطح2' ) || false !== mb_strpos( $n, 'سطح ۲' ) || ( false !== mb_strpos( $n, 'سطح' ) && false !== mb_strpos( $n, '2' ) ) || false !== mb_strpos( $n, 'level2' ) ) {
				$map['l2'] = (int) $i;
			} elseif ( false !== mb_strpos( $n, 'سطح3' ) || false !== mb_strpos( $n, 'سطح ۳' ) || ( false !== mb_strpos( $n, 'سطح' ) && false !== mb_strpos( $n, '3' ) ) || false !== mb_strpos( $n, 'level3' ) ) {
				$map['l3'] = (int) $i;
			} elseif ( false !== mb_strpos( $n, 'کارمزد' ) || false !== mb_strpos( $n, 'commission' ) || false !== mb_strpos( $n, 'خرده' ) ) {
				$map['pct'] = (int) $i;
			}
		}
		// Default sheet order: A=l1 B=l2 C=l3 D=pct
		if ( $map['l1'] < 0 && $map['pct'] < 0 ) {
			return null;
		}
		if ( $map['l1'] < 0 ) {
			$map['l1'] = 0;
		}
		if ( $map['l2'] < 0 ) {
			$map['l2'] = 1;
		}
		if ( $map['l3'] < 0 ) {
			$map['l3'] = 2;
		}
		if ( $map['pct'] < 0 ) {
			$map['pct'] = 3;
		}
		return $map;
	}

	/**
	 * @param string[]             $cells Cells.
	 * @param array{l1:int,l2:int,l3:int,pct:int} $map Column map.
	 * @return array{l1:string,l2:string,l3:string,percent:float}|null
	 */
	private static function rowFromCells( array $cells, array $map ): ?array {
		$l1  = isset( $cells[ $map['l1'] ] ) ? trim( (string) $cells[ $map['l1'] ] ) : '';
		$l2  = isset( $cells[ $map['l2'] ] ) ? trim( (string) $cells[ $map['l2'] ] ) : '';
		$l3  = isset( $cells[ $map['l3'] ] ) ? trim( (string) $cells[ $map['l3'] ] ) : '';
		$raw = isset( $cells[ $map['pct'] ] ) ? (string) $cells[ $map['pct'] ] : '';
		$pct = self::parsePercent( $raw );
		if ( '' === $l1 && '' === $l3 ) {
			return null;
		}
		if ( $pct <= 0 ) {
			return null;
		}
		return array(
			'l1'      => $l1,
			'l2'      => $l2,
			'l3'      => $l3,
			'percent' => $pct,
		);
	}

	private static function parsePercent( string $raw ): float {
		$raw = trim( str_replace( array( '%', '٪', ' ' ), '', $raw ) );
		$raw = str_replace( ',', '.', $raw );
		if ( ! is_numeric( $raw ) ) {
			return 0.0;
		}
		return (float) $raw;
	}

	/**
	 * @param array<int,array<string,mixed>> $tree Formatted categories.
	 * @return array{by_norm: array<string,array<int,array{id:int,name:string,children:array}>>, flat: array<string,array{id:int,path:int[]}>}
	 */
	private static function buildNameIndex( array $tree ): array {
		$by_norm = array();
		$flat    = array();
		$walk    = null;
		$walk    = static function ( array $nodes, array $path_ids ) use ( &$walk, &$by_norm, &$flat ) {
			foreach ( $nodes as $node ) {
				if ( ! is_array( $node ) || empty( $node['id'] ) ) {
					continue;
				}
				$id   = (int) $node['id'];
				$name = (string) ( $node['name'] ?? '' );
				$norm = CommissionRates::normalizeName( $name );
				$ids  = array_merge( $path_ids, array( $id ) );
				if ( '' !== $norm ) {
					if ( ! isset( $by_norm[ $norm ] ) ) {
						$by_norm[ $norm ] = array();
					}
					$by_norm[ $norm ][] = array(
						'id'       => $id,
						'name'     => $name,
						'children' => isset( $node['children'] ) && is_array( $node['children'] ) ? $node['children'] : array(),
						'path'     => $ids,
					);
				}
				$flat[ (string) $id ] = array(
					'id'   => $id,
					'path' => $ids,
					'name' => $name,
				);
				if ( ! empty( $node['children'] ) && is_array( $node['children'] ) ) {
					$walk( $node['children'], $ids );
				}
			}
		};
		$walk( $tree, array() );
		return array(
			'by_norm' => $by_norm,
			'flat'    => $flat,
		);
	}

	/**
	 * @param array{by_norm:array,flat:array} $index Index.
	 * @return array{leaf_id:int,ids:int[]}|null
	 */
	private static function resolvePath( array $index, string $l1, string $l2, string $l3 ): ?array {
		$n1 = self::normalizeName( $l1 );
		$n2 = self::normalizeName( $l2 );
		$n3 = self::normalizeName( $l3 );

		$candidates = isset( $index['by_norm'][ $n3 ] ) ? $index['by_norm'][ $n3 ] : array();
		if ( empty( $candidates ) && '' !== $n2 ) {
			$candidates = isset( $index['by_norm'][ $n2 ] ) ? $index['by_norm'][ $n2 ] : array();
		}
		if ( empty( $candidates ) && '' !== $n1 ) {
			$candidates = isset( $index['by_norm'][ $n1 ] ) ? $index['by_norm'][ $n1 ] : array();
		}
		if ( empty( $candidates ) ) {
			return null;
		}

		$best = null;
		foreach ( $candidates as $c ) {
			$path_names = self::pathNames( $index['flat'], $c['path'] );
			$score      = 0;
			if ( '' !== $n3 && in_array( $n3, $path_names, true ) ) {
				$score += 4;
			}
			if ( '' !== $n2 && in_array( $n2, $path_names, true ) ) {
				$score += 2;
			}
			if ( '' !== $n1 && in_array( $n1, $path_names, true ) ) {
				$score += 1;
			}
			if ( null === $best || $score > $best['score'] ) {
				$best = array(
					'score'   => $score,
					'leaf_id' => (int) $c['id'],
					'ids'     => $c['path'],
				);
			}
		}

		if ( null === $best || $best['score'] < 1 ) {
			return null;
		}
		return array(
			'leaf_id' => $best['leaf_id'],
			'ids'     => $best['ids'],
		);
	}

	/**
	 * @param array<string,array{id:int,path:int[],name:string}> $flat Flat index.
	 * @param int[]                                               $path Ids.
	 * @return string[]
	 */
	private static function pathNames( array $flat, array $path ): array {
		$names = array();
		foreach ( $path as $id ) {
			$key = (string) $id;
			if ( isset( $flat[ $key ]['name'] ) ) {
				$names[] = self::normalizeName( (string) $flat[ $key ]['name'] );
			}
		}
		return $names;
	}

	public static function normalizeName( string $name ): string {
		$name = trim( $name );
		$name = str_replace( array( 'ي', 'ك', 'ة', 'ؤ', 'إ', 'أ', 'آ' ), array( 'ی', 'ک', 'ه', 'و', 'ا', 'ا', 'ا' ), $name );
		$name = strtr(
			$name,
			array(
				'۰' => '0',
				'۱' => '1',
				'۲' => '2',
				'۳' => '3',
				'۴' => '4',
				'۵' => '5',
				'۶' => '6',
				'۷' => '7',
				'۸' => '8',
				'۹' => '9',
				'٠' => '0',
				'١' => '1',
				'٢' => '2',
				'٣' => '3',
				'٤' => '4',
				'٥' => '5',
				'٦' => '6',
				'٧' => '7',
				'٨' => '8',
				'٩' => '9',
			)
		);
		$name = preg_replace( '/\s+/u', '', $name ) ?? $name;
		$name = mb_strtolower( $name );
		return $name;
	}

	private static function stripBom( string $text ): string {
		if ( strncmp( $text, "\xEF\xBB\xBF", 3 ) === 0 ) {
			return substr( $text, 3 );
		}
		return $text;
	}
}
