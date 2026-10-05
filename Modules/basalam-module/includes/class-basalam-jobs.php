<?php
/**
 * Basalam jobs queue and reconciliation.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Basalam_Jobs {
	const OPTION_QUEUE = 'webino_basalam_jobs_queue';

	/**
	 * @param string              $type Job type.
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $delay Delay in seconds.
	 * @return void
	 */
	public static function enqueue( $type, array $payload, $delay = 0 ) {
		$q = get_option( self::OPTION_QUEUE, array() );
		if ( ! is_array( $q ) ) {
			$q = array();
		}
		$q[] = array(
			'id'         => wp_generate_uuid4(),
			'type'       => sanitize_key( $type ),
			'payload'    => $payload,
			'run_after'  => time() + max( 0, (int) $delay ),
			'created_at' => gmdate( 'c' ),
		);
		update_option( self::OPTION_QUEUE, $q, false );
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	public static function queue() {
		$q = get_option( self::OPTION_QUEUE, array() );
		return is_array( $q ) ? $q : array();
	}

	/**
	 * @return void
	 */
	public static function process_due() {
		$q = self::queue();
		$now = time();
		$remaining = array();
		foreach ( $q as $job ) {
			$run_after = (int) ( $job['run_after'] ?? 0 );
			if ( $run_after > $now ) {
				$remaining[] = $job;
				continue;
			}
			$type = (string) ( $job['type'] ?? '' );
			if ( 'webhook_event' === $type ) {
				// Deterministic event routing extension point.
				do_action( 'webino_basalam_webhook_event', $job['payload'] ?? array() );
			} elseif ( 'reconcile_wallet' === $type ) {
				Basalam_Reconciliation_Service::reconcile_wallet();
			} elseif ( 'reconcile_subscriptions' === $type ) {
				Basalam_Reconciliation_Service::reconcile_subscriptions();
			}
		}
		update_option( self::OPTION_QUEUE, $remaining, false );

		// Also drain product-sync JobManager (create-all / update-all), not only the option queue.
		if ( class_exists( '\\WebinoBasalam\\JobsRunner', false ) && function_exists( 'webinoBasalamContainer' ) ) {
			try {
				$runner = webinoBasalamContainer()->get( \WebinoBasalam\JobsRunner::class );
				if ( $runner instanceof \WebinoBasalam\JobsRunner ) {
					$runner->checkAndRunJobs();
				}
			} catch ( \Throwable $e ) {
				// Ignore — next cron/admin hit will retry.
			}
		}
	}
}
