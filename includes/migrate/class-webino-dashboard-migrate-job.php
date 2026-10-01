<?php
/**
 * Persisted migration job: one batch per tick, cron + admin resume.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Job option and scheduler.
 */
final class Webino_Dashboard_Migrate_Job {

	const OPTION = 'webino_dashboard_migrate_job';

	const CRON_HOOK = 'webino_dashboard_migrate_tick';

	const LOCK = 'webino_dashboard_migrate_lock';

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'cron_schedules', array( __CLASS__, 'cron_schedules' ) );
		add_action( self::CRON_HOOK, array( __CLASS__, 'cron_tick' ) );
	}

	/**
	 * @param array<string,array<string,int|string>> $schedules Schedules.
	 * @return array<string,array<string,int|string>>
	 */
	public static function cron_schedules( $schedules ) {
		if ( ! isset( $schedules['webino_migrate_minute'] ) ) {
			$schedules['webino_migrate_minute'] = array(
				'interval' => 60,
				'display'  => __( 'Webino migration (every minute)', 'webino-dashboard' ),
			);
		}
		return $schedules;
	}

	/**
	 * @return void
	 */
	public static function cron_tick() {
		self::tick();
	}

	/**
	 * @return array<string,mixed>|null
	 */
	public static function get() {
		$state = get_option( self::OPTION, null );
		return is_array( $state ) ? $state : null;
	}

	/**
	 * @param array<string,mixed> $state State.
	 * @return void
	 */
	public static function save( array $state ) {
		update_option( self::OPTION, $state, false );
		self::sync_cron( $state );
	}

	/**
	 * Status payload for the UI. Never includes the API token.
	 *
	 * @return array<string,mixed>
	 */
	public static function public_state() {
		$state = self::get();
		if ( ! is_array( $state ) ) {
			return array(
				'status'      => 'idle',
				'phase'       => 'export',
				'entities'    => array(),
				'progress'    => array(),
				'log'         => array(),
				'last_error'  => '',
				'pause_until' => 0,
				'delay_ms'    => Webino_Dashboard_Migrate_Settings::delay_ms(),
				'dry_run'     => Webino_Dashboard_Migrate_Settings::dry_run(),
			);
		}
		$state['delay_ms'] = Webino_Dashboard_Migrate_Settings::delay_ms();
		unset( $state['token'], $state['token_enc'] );
		return $state;
	}

	/**
	 * @param bool $resume Continue cursors when a paused or failed job exists.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function start( $resume = false ) {
		$current = self::get();
		if ( is_array( $current ) && 'running' === $current['status'] ) {
			return new WP_Error( 'already_running', __( 'A migration is already running.', 'webino-dashboard' ) );
		}

		$can_resume = $resume && is_array( $current ) && in_array( $current['status'], array( 'paused', 'failed' ), true );
		if ( ! $can_resume ) {
			$ready = self::assert_ready();
			if ( is_wp_error( $ready ) ) {
				return $ready;
			}
			$entities = Webino_Dashboard_Migrate_Settings::selected_entities();
			if ( ! $entities ) {
				return new WP_Error( 'no_entities', __( 'Select at least one item to migrate.', 'webino-dashboard' ) );
			}
			$job_id = function_exists( 'wp_generate_password' ) ? wp_generate_password( 12, false, false ) : bin2hex( random_bytes( 6 ) );
			$state  = Webino_Dashboard_Migrate_Runner::initial_state(
				$job_id,
				$entities,
				time(),
				Webino_Dashboard_Migrate_Settings::dry_run()
			);
			foreach ( $entities as $entity ) {
				$state['totals'][ $entity ] = Webino_Dashboard_Migrate_Exporters::count( $entity );
			}
		} else {
			$state                 = $current;
			$state['status']       = 'running';
			$state['pause_until']  = 0;
			$state['last_error']   = '';
			$state['finished_at']  = null;
			$state['updated_at']   = gmdate( 'c' );
			$entities              = isset( $state['entities'] ) && is_array( $state['entities'] ) ? $state['entities'] : array();
			$index                 = isset( $state['entity_index'] ) ? (int) $state['entity_index'] : 0;
			$retry_key             = ( 'complete' === ( isset( $state['phase'] ) ? $state['phase'] : '' ) || $index >= count( $entities ) )
				? '_complete'
				: (string) ( isset( $entities[ $index ] ) ? $entities[ $index ] : '' );
			if ( '' !== $retry_key ) {
				$state['retries'][ $retry_key ] = 0;
			}
			$state['log']          = Webino_Dashboard_Migrate_Schema::append_log(
				isset( $state['log'] ) && is_array( $state['log'] ) ? $state['log'] : array(),
				'info',
				'ادامه مهاجرت از آخرین مکان‌نما.'
			);
		}

		self::save( $state );
		return self::public_state();
	}

	/**
	 * @return array<string,mixed>|WP_Error
	 */
	public static function pause() {
		$state = self::get();
		if ( ! is_array( $state ) || 'running' !== $state['status'] ) {
			return new WP_Error( 'not_running', __( 'There is no running migration to pause.', 'webino-dashboard' ) );
		}
		$state['status']     = 'paused';
		$state['updated_at'] = gmdate( 'c' );
		$state['log']        = Webino_Dashboard_Migrate_Schema::append_log(
			isset( $state['log'] ) && is_array( $state['log'] ) ? $state['log'] : array(),
			'info',
			'مهاجرت متوقف شد. با «ادامه» از همین مکان‌نما از سر گرفته می‌شود.'
		);
		self::save( $state );
		return self::public_state();
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function reset() {
		delete_option( self::OPTION );
		self::unschedule();
		return self::public_state();
	}

	/**
	 * Process a single batch. Safe to call from cron and from the admin UI.
	 *
	 * @return array<string,mixed>
	 */
	public static function tick() {
		$state = self::get();
		if ( ! is_array( $state ) || 'running' !== ( isset( $state['status'] ) ? $state['status'] : '' ) ) {
			return self::public_state();
		}
		$now = time();
		if ( ! empty( $state['pause_until'] ) && (int) $state['pause_until'] > $now ) {
			return self::public_state();
		}
		if ( ! self::acquire_lock() ) {
			$public                 = self::public_state();
			$public['lock_skipped'] = true;
			return $public;
		}
		try {
			$state = self::step( $state );
			self::save( $state );
		} catch ( Throwable $e ) {
			$state['status']      = 'failed';
			$state['last_error']  = Webino_Dashboard_Migrate_Schema::redact( $e->getMessage() );
			$state['finished_at'] = gmdate( 'c' );
			$state['log']         = Webino_Dashboard_Migrate_Schema::append_log(
				isset( $state['log'] ) && is_array( $state['log'] ) ? $state['log'] : array(),
				'error',
				'خطای داخلی مهاجرت: ' . $state['last_error']
			);
			self::save( $state );
		}
		self::release_lock();
		return self::public_state();
	}

	/**
	 * @param array<string,mixed> $state State.
	 * @return array<string,mixed>
	 */
	private static function step( array $state ) {
		$entities = isset( $state['entities'] ) && is_array( $state['entities'] ) ? $state['entities'] : array();
		$index    = isset( $state['entity_index'] ) ? (int) $state['entity_index'] : 0;
		if ( 'complete' === ( isset( $state['phase'] ) ? $state['phase'] : '' ) || $index >= count( $entities ) ) {
			return self::step_complete( $state );
		}
		$entity = (string) $entities[ $index ];
		$cursor = isset( $state['cursors'][ $entity ] ) ? (string) $state['cursors'][ $entity ] : '';
		$limit  = Webino_Dashboard_Migrate_Settings::batch_size();
		$batch  = Webino_Dashboard_Migrate_Exporters::batch( $entity, $cursor, $limit );
		if ( is_wp_error( $batch ) ) {
			return Webino_Dashboard_Migrate_Runner::reduce(
				$state,
				array(
					'entity'      => $entity,
					'ok'          => false,
					'http_status' => 0,
					'error'       => $batch->get_error_message(),
				)
			);
		}

		$items = isset( $batch['items'] ) && is_array( $batch['items'] ) ? $batch['items'] : array();
		$done  = ! empty( $batch['done'] );
		$next  = isset( $batch['next_cursor'] ) ? (string) $batch['next_cursor'] : $cursor;
		if ( ! $items && $done ) {
			return Webino_Dashboard_Migrate_Runner::reduce(
				$state,
				array(
					'entity'      => $entity,
					'ok'          => true,
					'http_status' => 200,
					'exported'    => 0,
					'next_cursor' => $next,
					'done'        => true,
					'warning'     => isset( $batch['warning'] ) ? (string) $batch['warning'] : '',
				)
			);
		}
		if ( ! $items && ! $done ) {
			return Webino_Dashboard_Migrate_Runner::reduce(
				$state,
				array(
					'entity'      => $entity,
					'ok'          => true,
					'http_status' => 200,
					'exported'    => 0,
					'next_cursor' => $next,
					'done'        => false,
					'warning'     => isset( $batch['warning'] ) ? (string) $batch['warning'] : '',
				)
			);
		}

		$payload = Webino_Dashboard_Migrate_Schema::envelope(
			$entity,
			$items,
			array(
				'cursor'      => $cursor,
				'next_cursor' => $next,
				'limit'       => $limit,
				'done'        => $done,
				'total'       => isset( $state['totals'][ $entity ] ) ? (int) $state['totals'][ $entity ] : ( isset( $batch['total'] ) ? (int) $batch['total'] : null ),
			),
			Webino_Dashboard_Migrate_Schema::source_site(),
			isset( $state['id'] ) ? (string) $state['id'] : ''
		);
		$key    = Webino_Dashboard_Migrate_Schema::idempotency_key(
			isset( $state['id'] ) ? (string) $state['id'] : '',
			$entity,
			$cursor,
			count( $items )
		);
		$result = Webino_Dashboard_Migrate_Client::post( $entity, $payload, $key );
		if ( is_wp_error( $result ) ) {
			return Webino_Dashboard_Migrate_Runner::reduce(
				$state,
				array(
					'entity'      => $entity,
					'ok'          => false,
					'http_status' => 0,
					'error'       => $result->get_error_message(),
				)
			);
		}
		return Webino_Dashboard_Migrate_Runner::reduce(
			$state,
			array(
				'entity'      => $entity,
				'ok'          => ! empty( $result['ok'] ),
				'http_status' => (int) $result['http_status'],
				'retry_after' => (int) $result['retry_after'],
				'error'       => (string) $result['error'],
				'exported'    => count( $items ),
				'next_cursor' => $next,
				'done'        => $done,
				'warning'     => isset( $batch['warning'] ) ? (string) $batch['warning'] : '',
			)
		);
	}

	/**
	 * @param array<string,mixed> $state State.
	 * @return array<string,mixed>
	 */
	private static function step_complete( array $state ) {
		$summary = array();
		$progress = isset( $state['progress'] ) && is_array( $state['progress'] ) ? $state['progress'] : array();
		foreach ( $progress as $entity => $row ) {
			$summary[ $entity ] = array(
				'exported' => isset( $row['exported'] ) ? (int) $row['exported'] : 0,
				'failed'   => isset( $row['failed'] ) ? (int) $row['failed'] : 0,
			);
		}
		$payload = Webino_Dashboard_Migrate_Schema::complete_payload(
			Webino_Dashboard_Migrate_Schema::source_site(),
			$summary,
			isset( $state['id'] ) ? (string) $state['id'] : ''
		);
		$key     = Webino_Dashboard_Migrate_Schema::idempotency_key(
			isset( $state['id'] ) ? (string) $state['id'] : '',
			'complete',
			'done',
			count( $summary )
		);
		$result  = Webino_Dashboard_Migrate_Client::post( 'complete', $payload, $key );
		if ( is_wp_error( $result ) ) {
			return Webino_Dashboard_Migrate_Runner::reduce(
				$state,
				array(
					'kind'        => 'complete',
					'ok'          => false,
					'http_status' => 0,
					'error'       => $result->get_error_message(),
				)
			);
		}
		return Webino_Dashboard_Migrate_Runner::reduce(
			$state,
			array(
				'kind'        => 'complete',
				'ok'          => ! empty( $result['ok'] ),
				'http_status' => (int) $result['http_status'],
				'retry_after' => (int) $result['retry_after'],
				'error'       => (string) $result['error'],
			)
		);
	}

	/**
	 * @return true|WP_Error
	 */
	private static function assert_ready() {
		$url = Webino_Dashboard_Migrate_Settings::site_url();
		if ( '' === $url ) {
			return new WP_Error( 'empty_url', __( 'Save the Webino site URL first.', 'webino-dashboard' ) );
		}
		if ( ! Webino_Dashboard_Migrate_Settings::dry_run() && '' === Webino_Dashboard_Migrate_Settings::token() ) {
			return new WP_Error( 'missing_token', __( 'Save an API token, or enable dry run.', 'webino-dashboard' ) );
		}
		return true;
	}

	/**
	 * @param array<string,mixed> $state State.
	 * @return void
	 */
	private static function sync_cron( array $state ) {
		if ( 'running' === ( isset( $state['status'] ) ? $state['status'] : '' ) ) {
			if ( function_exists( 'wp_next_scheduled' ) && ! wp_next_scheduled( self::CRON_HOOK ) && function_exists( 'wp_schedule_event' ) ) {
				wp_schedule_event( time() + 60, 'webino_migrate_minute', self::CRON_HOOK );
			}
			return;
		}
		self::unschedule();
	}

	/**
	 * @return void
	 */
	private static function unschedule() {
		if ( ! function_exists( 'wp_next_scheduled' ) || ! function_exists( 'wp_unschedule_event' ) ) {
			return;
		}
		$timestamp = wp_next_scheduled( self::CRON_HOOK );
		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, self::CRON_HOOK );
		}
	}

	/**
	 * @return bool
	 */
	private static function acquire_lock() {
		$now      = time();
		$existing = get_option( self::LOCK, '' );
		if ( '' !== (string) $existing && (int) $existing > ( $now - 90 ) ) {
			return false;
		}
		if ( '' !== (string) $existing ) {
			delete_option( self::LOCK );
		}
		return (bool) add_option( self::LOCK, (string) $now, '', false );
	}

	/**
	 * @return void
	 */
	private static function release_lock() {
		delete_option( self::LOCK );
	}
}
