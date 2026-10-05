<?php
/**
 * Phase 2 sync jobs for additional Digikala API domains.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digikala_Phase2_Sync {

	/**
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job id.
	 * @return bool
	 */
	public static function sync_shipments( array $payload = array(), $job_id = 0 ) {
		$ok = self::run_catalog( 'shipments', $job_id, array(
			'open-api/v1/shipments',
			'open-api/v1/packages',
			'open-api/v1/post-tracking-codes',
			'open-api/v1/commitments',
		) );
		return $ok;
	}

	/**
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job id.
	 * @return bool
	 */
	public static function sync_finance( array $payload = array(), $job_id = 0 ) {
		$ok = self::run_catalog( 'finance', $job_id, array(
			'open-api/v1/invoices',
			'open-api/v1/commission',
			'open-api/v1/buy-box',
			'open-api/v1/price-stats',
		) );
		return $ok;
	}

	/**
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job id.
	 * @return bool
	 */
	public static function sync_promotions( array $payload = array(), $job_id = 0 ) {
		$ok = self::run_catalog( 'promotions', $job_id, array(
			'open-api/v1/promotions',
			'open-api/v1/vouchers',
			'open-api/v1/smart-discount',
			'open-api/v1/search-ads',
		) );
		return $ok;
	}

	/**
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job id.
	 * @return bool
	 */
	public static function sync_sbs( array $payload = array(), $job_id = 0 ) {
		$ok = self::run_catalog( 'sbs', $job_id, array(
			'open-api/v1/sbs/orders',
			'open-api/v1/sbs/settings',
			'open-api/v1/drop-shipping',
			'open-api/v1/insight',
		) );
		return $ok;
	}

	/**
	 * @param string              $context Log context.
	 * @param int                 $job_id Job id.
	 * @param array<int,string>   $paths API paths.
	 * @return bool
	 */
	private static function run_catalog( $context, $job_id, array $paths ) {
		$ok = true;
		foreach ( $paths as $path ) {
			$res = Digikala_Client::request( 'GET', $path );
			if ( is_wp_error( $res ) ) {
				Digikala_Jobs::log(
					'error',
					$context,
					'Phase2 endpoint sync failed.',
					array(
						'job_id' => $job_id,
						'path'   => $path,
						'error'  => $res->get_error_message(),
					)
				);
				$ok = false;
				continue;
			}
			Digikala_Jobs::log(
				'info',
				$context,
				'Phase2 endpoint fetched.',
				array(
					'job_id' => $job_id,
					'path'   => $path,
				)
			);
		}
		return $ok;
	}
}
