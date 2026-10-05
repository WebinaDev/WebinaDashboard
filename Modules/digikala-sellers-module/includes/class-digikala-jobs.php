<?php
/**
 * Digikala job queue and structured logs.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Digikala_Jobs {

	/**
	 * @param string               $type Job type.
	 * @param array<string,mixed>  $payload Payload.
	 * @param int                  $delay Delay seconds.
	 * @return int
	 */
	public static function enqueue( $type, array $payload = array(), $delay = 0 ) {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_dk_jobs';
		$now   = gmdate( 'Y-m-d H:i:s' );
		$run_after = gmdate( 'Y-m-d H:i:s', time() + max( 0, (int) $delay ) );
		$wpdb->insert(
			$table,
			array(
				'job_type'    => sanitize_key( $type ),
				'payload'     => wp_json_encode( $payload ),
				'status'      => 'pending',
				'retries'     => 0,
				'max_retries' => 5,
				'run_after'   => $run_after,
				'created_at'  => $now,
				'updated_at'  => $now,
			)
		);
		return (int) $wpdb->insert_id;
	}

	/**
	 * @return void
	 */
	public static function run_due_jobs() {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_dk_jobs';
		$now   = gmdate( 'Y-m-d H:i:s' );
		$jobs  = $wpdb->get_results(
			$wpdb->prepare( "SELECT * FROM {$table} WHERE status = %s AND run_after <= %s ORDER BY id ASC LIMIT 10", 'pending', $now ),
			ARRAY_A
		);
		if ( ! is_array( $jobs ) ) {
			return;
		}
		foreach ( $jobs as $job ) {
			$id = (int) ( $job['id'] ?? 0 );
			if ( $id <= 0 ) {
				continue;
			}
			$wpdb->update(
				$table,
				array(
					'status'    => 'running',
					'locked_at' => $now,
					'updated_at'=> $now,
				),
				array( 'id' => $id, 'status' => 'pending' )
			);
			if ( 1 !== (int) $wpdb->rows_affected ) {
				continue;
			}
			$result = self::dispatch( (string) $job['job_type'], json_decode( (string) $job['payload'], true ) ?: array(), $id );
			if ( ! empty( $result['ok'] ) ) {
				$wpdb->update( $table, array( 'status' => 'done', 'updated_at' => gmdate( 'Y-m-d H:i:s' ) ), array( 'id' => $id ) );
				continue;
			}
			$retries = (int) $job['retries'] + 1;
			$max     = (int) $job['max_retries'];
			$retry_after = isset( $result['retry_after'] ) ? max( 0, (int) $result['retry_after'] ) : 0;
			$last_error  = isset( $result['last_error'] ) ? sanitize_text_field( (string) $result['last_error'] ) : 'job_failed';
			if ( $retries >= $max ) {
				$wpdb->update(
					$table,
					array(
						'status'     => 'failed',
						'retries'    => $retries,
						'last_error' => $last_error,
						'updated_at' => gmdate( 'Y-m-d H:i:s' ),
					),
					array( 'id' => $id )
				);
				self::log( 'error', 'jobs', 'Job permanently failed.', array( 'job_id' => $id, 'job_type' => $job['job_type'], 'error' => $last_error ) );
			} else {
				$delay = $retry_after > 0 ? $retry_after : self::backoff_with_jitter( $retries );
				$wpdb->update(
					$table,
					array(
						'status'     => 'pending',
						'retries'    => $retries,
						'run_after'  => gmdate( 'Y-m-d H:i:s', time() + $delay ),
						'last_error' => $last_error,
						'updated_at' => gmdate( 'Y-m-d H:i:s' ),
					),
					array( 'id' => $id )
				);
			}
		}
	}

	/**
	 * @param string              $job_type Job type.
	 * @param array<string,mixed> $payload Payload.
	 * @param int                 $job_id Job id.
	 * @return array{ok:bool,retry_after:int,last_error:string}
	 */
	private static function dispatch( $job_type, array $payload, $job_id ) {
		$ok = false;
		switch ( $job_type ) {
			case 'product_export':
				$ok = Digikala_Product_Sync::export_products( $payload, $job_id );
				break;
			case 'product_import':
				$ok = Digikala_Product_Sync::import_products( $payload, $job_id );
				break;
			case 'inventory_sync':
				$ok = Digikala_Inventory_Sync::sync_inventory( $payload, $job_id );
				break;
			case 'orders_pull':
				$ok = Digikala_Order_Sync::pull_orders( $payload, $job_id );
				break;
			case 'order_push_status':
				$ok = Digikala_Order_Sync::push_order_status( $payload, $job_id );
				break;
			case 'order_cancel':
				$ok = Digikala_Order_Sync::cancel_order( $payload, $job_id );
				break;
			case 'phase2_shipments':
				$ok = Digikala_Phase2_Sync::sync_shipments( $payload, $job_id );
				break;
			case 'phase2_finance':
				$ok = Digikala_Phase2_Sync::sync_finance( $payload, $job_id );
				break;
			case 'phase2_promotions':
				$ok = Digikala_Phase2_Sync::sync_promotions( $payload, $job_id );
				break;
			case 'phase2_sbs':
				$ok = Digikala_Phase2_Sync::sync_sbs( $payload, $job_id );
				break;
			case 'reconcile_products':
				$ok = Digikala_Phase3_Sync::reconcile_products( $payload, $job_id );
				break;
			case 'reconcile_orders':
				$ok = Digikala_Phase3_Sync::reconcile_orders( $payload, $job_id );
				break;
			case 'reconcile_inventory':
				$ok = Digikala_Phase3_Sync::reconcile_inventory( $payload, $job_id );
				break;
			default:
				self::log( 'error', 'jobs', 'Unknown job type.', array( 'job_type' => $job_type, 'job_id' => $job_id ) );
				return array(
					'ok'          => false,
					'retry_after' => 0,
					'last_error'  => 'unknown_job_type',
				);
		}
		return array(
			'ok'          => (bool) $ok,
			'retry_after' => 0,
			'last_error'  => $ok ? '' : 'handler_failed',
		);
	}

	/**
	 * @param int $retries Retries count.
	 * @return int
	 */
	private static function backoff_with_jitter( $retries ) {
		$base = min( 3600, (int) pow( 2, max( 1, (int) $retries ) ) * 45 );
		$jitter = random_int( 0, 45 );
		return $base + $jitter;
	}

	/**
	 * @param string              $level Level.
	 * @param string              $context Context.
	 * @param string              $message Message.
	 * @param array<string,mixed> $meta Meta.
	 * @return void
	 */
	public static function log( $level, $context, $message, array $meta = array() ) {
		global $wpdb;
		$table = $wpdb->prefix . 'webino_dk_logs';
		$wpdb->insert(
			$table,
			array(
				'level'      => sanitize_key( $level ),
				'context'    => sanitize_key( $context ),
				'message'    => sanitize_textarea_field( $message ),
				'meta'       => wp_json_encode( self::sanitize_meta( $meta ) ),
				'created_at' => gmdate( 'Y-m-d H:i:s' ),
			)
		);
	}

	/**
	 * @param array<string,mixed> $meta Meta.
	 * @return array<string,mixed>
	 */
	private static function sanitize_meta( array $meta ) {
		$json = wp_json_encode( $meta );
		if ( ! is_string( $json ) ) {
			return array();
		}
		$json = preg_replace( '/"(access_token|refresh_token|client_secret|authorization)"\s*:\s*"[^"]*"/i', '"$1":"***"', $json );
		$decoded = json_decode( (string) $json, true );
		return is_array( $decoded ) ? $decoded : array();
	}
}
