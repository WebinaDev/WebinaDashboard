<?php
/**
 * Job queue.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Background job queue with retry/backoff.
 */
class WNC_Jobs {

	/**
	 * Enqueue a job.
	 *
	 * @param string              $job_type Job type.
	 * @param array<string,mixed> $payload Payload.
	 * @param string              $platform Platform.
	 * @param int                 $delay_seconds Delay.
	 * @return int Job ID.
	 */
	public static function enqueue( $job_type, array $payload = array(), $platform = '', $delay_seconds = 0 ) {
		global $wpdb;
		$table = WNC_Storage::jobs_table();
		$now   = current_time( 'mysql' );
		$run   = date( 'Y-m-d H:i:s', current_time( 'timestamp' ) + max( 0, (int) $delay_seconds ) );

		$wpdb->insert(
			$table,
			array(
				'job_type'    => sanitize_key( $job_type ),
				'platform'    => sanitize_key( $platform ),
				'payload'     => wp_json_encode( $payload ),
				'status'      => 'pending',
				'retries'     => 0,
				'max_retries' => 5,
				'run_after'   => $run,
				'created_at'  => $now,
				'updated_at'  => $now,
			),
			array( '%s', '%s', '%s', '%s', '%d', '%d', '%s', '%s', '%s' )
		);

		return (int) $wpdb->insert_id;
	}

	/**
	 * Process pending jobs.
	 *
	 * @param int $batch Batch size.
	 */
	public static function process( $batch = 10 ) {
		global $wpdb;
		$table = WNC_Storage::jobs_table();
		$now   = current_time( 'mysql' );
		$batch = max( 1, min( 50, (int) $batch ) );

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$jobs = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE status = 'pending' AND run_after <= %s ORDER BY id ASC LIMIT %d",
				$now,
				$batch
			),
			ARRAY_A
		);

		if ( empty( $jobs ) ) {
			return;
		}

		foreach ( $jobs as $job ) {
			self::run_job( $job );
		}
	}

	/**
	 * Run a single job.
	 *
	 * @param array<string,mixed> $job Job row.
	 */
	private static function run_job( array $job ) {
		global $wpdb;
		$table = WNC_Storage::jobs_table();
		$id    = (int) $job['id'];

		$wpdb->update(
			$table,
			array(
				'status'     => 'running',
				'locked_at'  => current_time( 'mysql' ),
				'updated_at' => current_time( 'mysql' ),
			),
			array( 'id' => $id ),
			array( '%s', '%s', '%s' ),
			array( '%d' )
		);

		$payload = json_decode( (string) $job['payload'], true );
		if ( ! is_array( $payload ) ) {
			$payload = array();
		}

		$ok    = false;
		$error = '';

		try {
			$ok = self::dispatch( (string) $job['job_type'], (string) $job['platform'], $payload, $id );
		} catch ( Exception $e ) {
			$error = $e->getMessage();
			$ok    = false;
		}

		if ( $ok ) {
			$wpdb->update(
				$table,
				array(
					'status'     => 'done',
					'last_error' => null,
					'updated_at' => current_time( 'mysql' ),
				),
				array( 'id' => $id ),
				array( '%s', '%s', '%s' ),
				array( '%d' )
			);
			return;
		}

		$retries     = (int) $job['retries'] + 1;
		$max_retries = (int) $job['max_retries'];
		if ( $retries >= $max_retries ) {
			$wpdb->update(
				$table,
				array(
					'status'     => 'failed',
					'retries'    => $retries,
					'last_error' => $error ? $error : 'Job failed',
					'updated_at' => current_time( 'mysql' ),
				),
				array( 'id' => $id ),
				array( '%s', '%d', '%s', '%s' ),
				array( '%d' )
			);
			WNC_Logger::error( 'Job failed permanently: ' . $job['job_type'], $job['platform'], 'jobs', array( 'job_id' => $id, 'error' => $error ) );
			return;
		}

		$backoff = min( 3600, (int) pow( 2, $retries ) * 30 );
		$run     = date( 'Y-m-d H:i:s', current_time( 'timestamp' ) + $backoff );

		$wpdb->update(
			$table,
			array(
				'status'     => 'pending',
				'retries'    => $retries,
				'run_after'  => $run,
				'last_error' => $error ? $error : 'Retry scheduled',
				'locked_at'  => null,
				'updated_at' => current_time( 'mysql' ),
			),
			array( 'id' => $id ),
			array( '%s', '%d', '%s', '%s', '%s', '%s' ),
			array( '%d' )
		);
	}

	/**
	 * Dispatch job to handlers.
	 *
	 * @param string              $job_type Type.
	 * @param string              $platform Platform.
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job ID.
	 * @return bool
	 */
	private static function dispatch( $job_type, $platform, array $payload, $job_id ) {
		switch ( $job_type ) {
			case 'push_price':
				return WNC_Price_Sync::push_for_product( $platform, $payload, $job_id );
			case 'push_stock':
				return WNC_Stock_Sync::push_for_product( $platform, $payload, $job_id );
			case 'push_price_stock':
				$p = WNC_Price_Sync::push_for_product( $platform, $payload, $job_id );
				$s = WNC_Stock_Sync::push_for_product( $platform, $payload, $job_id );
				return $p && $s;
			case 'pull_orders':
				return WNC_Order_Sync::pull( $platform, $payload, $job_id );
			default:
				WNC_Logger::error( 'Unknown job type: ' . $job_type, $platform, 'jobs', array( 'job_id' => $job_id ) );
				return false;
		}
	}

	/**
	 * Recent jobs.
	 *
	 * @param int $limit Limit.
	 * @return array
	 */
	public static function recent( $limit = 30 ) {
		global $wpdb;
		$table = WNC_Storage::jobs_table();
		$limit = max( 1, min( 100, (int) $limit ) );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $wpdb->get_results(
			$wpdb->prepare( "SELECT * FROM {$table} ORDER BY id DESC LIMIT %d", $limit ),
			ARRAY_A
		);
	}
}
