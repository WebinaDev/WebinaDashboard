<?php
/**
 * AI Content job queue (Action Scheduler / WP-Cron).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue and process generation jobs.
 */
final class Webino_Dashboard_AI_Queue {

	const HOOK       = 'webino_dashboard_ai_content_process_job';
	const CRON_DAILY = 'webino_dashboard_ai_content_daily';
	const PAUSE_OPT  = 'webino_dashboard_ai_queue_paused';

	/**
	 * Job currently being processed (for phase updates).
	 *
	 * @var int
	 */
	private static $current_job_id = 0;

	/**
	 * Last provider usage for fail_job.
	 *
	 * @var array{provider:string,model:string,tokens_in:int,tokens_out:int}
	 */
	private static $last_usage = array(
		'provider'   => '',
		'model'      => '',
		'tokens_in'  => 0,
		'tokens_out' => 0,
	);

	/**
	 * @return void
	 */
	public static function init() {
		add_action( self::HOOK, array( __CLASS__, 'process_job' ), 10, 1 );
		add_action( self::CRON_DAILY, array( 'Webino_Dashboard_AI_Calendar', 'run_daily' ) );
		if ( ! wp_next_scheduled( self::CRON_DAILY ) ) {
			wp_schedule_event( time() + 300, 'daily', self::CRON_DAILY );
		}
	}

	/**
	 * @param string               $job_type Type.
	 * @param string               $target_type Target type.
	 * @param int                  $target_id Target ID.
	 * @param array<string,mixed>  $payload Payload.
	 * @return int|WP_Error Job ID.
	 */
	public static function enqueue( $job_type, $target_type, $target_id, $payload = array() ) {
		global $wpdb;
		Webino_Dashboard_AI_Content_Db::ensure_tables();
		$table = Webino_Dashboard_AI_Content_Db::table( 'jobs' );
		$now   = current_time( 'mysql', true );

		$ok = $wpdb->insert(
			$table,
			array(
				'job_type'    => sanitize_key( $job_type ),
				'target_type' => sanitize_key( $target_type ),
				'target_id'   => (int) $target_id,
				'payload'     => wp_json_encode( $payload ),
				'status'      => 'pending',
				'result_summary' => 'queued',
				'created_at'  => $now,
				'updated_at'  => $now,
			),
			array( '%s', '%s', '%d', '%s', '%s', '%s', '%s', '%s' )
		);

		$job_id = (int) $wpdb->insert_id;
		if ( false === $ok || $job_id < 1 ) {
			$err = trim( (string) $wpdb->last_error );
			return new WP_Error(
				'ai_enqueue',
				$err ? $err : __( 'Could not queue the job.', 'webino-dashboard' ),
				array( 'status' => 500 )
			);
		}

		return $job_id;
	}

	/**
	 * @param int $job_id Job ID.
	 * @return void
	 */
	public static function schedule( $job_id ) {
		$job_id = (int) $job_id;
		if ( $job_id < 1 || self::is_paused() ) {
			return;
		}
		if ( function_exists( 'as_enqueue_async_action' ) ) {
			as_enqueue_async_action( self::HOOK, array( $job_id ), 'webino-ai-content' );
			return;
		}
		if ( ! wp_next_scheduled( self::HOOK, array( $job_id ) ) ) {
			wp_schedule_single_event( time() + 5, self::HOOK, array( $job_id ) );
		}
		if ( function_exists( 'spawn_cron' ) ) {
			spawn_cron();
		}
	}

	/**
	 * @param int  $job_id Job ID.
	 * @param bool $force Ignore pause (explicit single run).
	 * @return void
	 */
	public static function process_job( $job_id, $force = false ) {
		$job_id = (int) $job_id;
		if ( $job_id < 1 ) {
			return;
		}
		if ( ! $force && self::is_paused() ) {
			return;
		}
		$claimed = self::claim_job( $job_id );
		if ( is_wp_error( $claimed ) ) {
			return;
		}
		self::execute_claimed( $job_id );
	}

	/**
	 * Claim a pending job (pending → running). Does not call the provider.
	 *
	 * @param int $job_id Job.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function claim_job( $job_id ) {
		global $wpdb;
		$job_id = (int) $job_id;
		if ( $job_id < 1 ) {
			return new WP_Error( 'ai_job', __( 'Job not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		self::reap_stuck_jobs();
		$table = Webino_Dashboard_AI_Content_Db::table( 'jobs' );
		$now   = current_time( 'mysql', true );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$updated = $wpdb->query(
			$wpdb->prepare(
				"UPDATE {$table} SET status = %s, result_summary = %s, started_at = %s, updated_at = %s, attempts = attempts + 1, error_message = %s WHERE id = %d AND status = %s",
				'running',
				'provider',
				$now,
				$now,
				'',
				$job_id,
				'pending'
			)
		);
		if ( 1 !== (int) $updated ) {
			$job = self::get_job( $job_id );
			if ( is_wp_error( $job ) ) {
				return $job;
			}
			return new WP_Error( 'ai_job_busy', __( 'Job is not pending.', 'webino-dashboard' ), array( 'status' => 409, 'job' => $job ) );
		}
		self::register_crash_guard( $job_id );
		$job = self::get_job( $job_id );
		return is_wp_error( $job ) ? $job : $job;
	}

	/**
	 * Continue after the HTTP response is flushed.
	 *
	 * @param int $job_id Job.
	 * @return void
	 */
	public static function defer_execute( $job_id ) {
		$job_id = (int) $job_id;
		if ( $job_id < 1 ) {
			return;
		}
		self::register_crash_guard( $job_id );
		add_action(
			'shutdown',
			static function () use ( $job_id ) {
				if ( function_exists( 'fastcgi_finish_request' ) ) {
					@fastcgi_finish_request();
				}
				self::execute_claimed( $job_id );
			},
			20
		);
	}

	/**
	 * Run claimed (running) job logic.
	 *
	 * @param int $job_id Job.
	 * @return void
	 */
	public static function execute_claimed( $job_id ) {
		global $wpdb;
		$job_id = (int) $job_id;
		if ( $job_id < 1 ) {
			return;
		}
		if ( function_exists( 'ignore_user_abort' ) ) {
			ignore_user_abort( true );
		}
		if ( function_exists( 'set_time_limit' ) ) {
			@set_time_limit( 180 );
		}

		$table = Webino_Dashboard_AI_Content_Db::table( 'jobs' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$job = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $job_id ), ARRAY_A );
		if ( ! $job || 'running' !== $job['status'] ) {
			return;
		}

		self::$current_job_id = $job_id;
		self::$last_usage     = array(
			'provider'   => '',
			'model'      => '',
			'tokens_in'  => 0,
			'tokens_out' => 0,
		);

		$payload = json_decode( (string) $job['payload'], true );
		if ( ! is_array( $payload ) ) {
			$payload = array();
		}

		try {
			$stop = self::abort_if_cancelled();
			if ( is_wp_error( $stop ) ) {
				self::mark_cancelled( $job_id, $stop->get_error_message() );
				self::$current_job_id = 0;
				return;
			}
			$result = self::run_job_logic( (string) $job['job_type'], (string) $job['target_type'], (int) $job['target_id'], $payload );
			if ( is_wp_error( $result ) ) {
				if ( 'ai_cancelled' === $result->get_error_code() ) {
					self::mark_cancelled( $job_id, $result->get_error_message() );
				} else {
					self::fail_job( $job_id, $result->get_error_message() );
				}
				self::$current_job_id = 0;
				return;
			}
			$usage = self::usage_fields();
			$wpdb->update(
				$table,
				array_merge(
					array(
						'status'         => 'done',
						'result_summary' => sanitize_text_field( (string) ( $result['summary'] ?? 'done' ) ),
						'finished_at'    => current_time( 'mysql', true ),
						'updated_at'     => current_time( 'mysql', true ),
						'error_message'  => '',
					),
					$usage
				),
				array( 'id' => $job_id ),
				array( '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%d', '%s' ),
				array( '%d' )
			);
		} catch ( Exception $e ) {
			self::fail_job( $job_id, $e->getMessage() );
		} catch ( Throwable $e ) {
			self::fail_job( $job_id, $e->getMessage() );
		}
		self::$current_job_id = 0;
	}

	/**
	 * @param int $job_id Job.
	 * @return void
	 */
	private static function register_crash_guard( $job_id ) {
		$job_id = (int) $job_id;
		if ( $job_id < 1 ) {
			return;
		}
		register_shutdown_function(
			static function () use ( $job_id ) {
				self::fail_if_still_running( $job_id );
			}
		);
	}

	/**
	 * @param int $job_id Job.
	 * @return void
	 */
	private static function fail_if_still_running( $job_id ) {
		$job = self::get_job( (int) $job_id );
		if ( is_wp_error( $job ) || 'running' !== ( $job['status'] ?? '' ) ) {
			return;
		}
		$last = error_get_last();
		$msg  = __( 'Job stopped before finishing.', 'webino-dashboard' );
		if ( is_array( $last ) && ! empty( $last['message'] ) ) {
			$type = isset( $last['type'] ) ? (int) $last['type'] : 0;
			if ( $type & ( E_ERROR | E_PARSE | E_CORE_ERROR | E_COMPILE_ERROR | E_USER_ERROR | E_RECOVERABLE_ERROR ) ) {
				$msg = (string) $last['message'];
			}
		}
		self::fail_job( (int) $job_id, $msg );
	}

	/**
	 * @return bool
	 */
	public static function is_paused() {
		return (bool) get_option( self::PAUSE_OPT, false );
	}

	/**
	 * @param bool $paused Paused.
	 * @return bool
	 */
	public static function set_paused( $paused ) {
		$paused = (bool) $paused;
		update_option( self::PAUSE_OPT, $paused, false );
		return $paused;
	}

	/**
	 * @param int $job_id Job.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function cancel_job( $job_id ) {
		$job_id = (int) $job_id;
		$job    = self::get_job( $job_id );
		if ( is_wp_error( $job ) ) {
			return $job;
		}
		$status = (string) ( $job['status'] ?? '' );
		if ( 'pending' === $status ) {
			self::mark_cancelled( $job_id, __( 'Cancelled by user.', 'webino-dashboard' ) );
			return self::get_job( $job_id );
		}
		if ( 'running' === $status ) {
			set_transient( 'webino_ai_job_cancel_' . $job_id, 1, 15 * MINUTE_IN_SECONDS );
			self::abort_if_cancelled();
			$again = self::get_job( $job_id );
			return is_wp_error( $again ) ? $again : $again;
		}
		return new WP_Error( 'ai_job', __( 'This job cannot be cancelled.', 'webino-dashboard' ), array( 'status' => 400 ) );
	}

	/**
	 * @return array{count:int}
	 */
	public static function cancel_pending() {
		global $wpdb;
		Webino_Dashboard_AI_Content_Db::ensure_tables();
		$table = Webino_Dashboard_AI_Content_Db::table( 'jobs' );
		$now   = current_time( 'mysql', true );
		$msg   = __( 'Cancelled by user.', 'webino-dashboard' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$n = $wpdb->query(
			$wpdb->prepare(
				"UPDATE {$table} SET status = %s, error_message = %s, result_summary = %s, finished_at = %s, updated_at = %s WHERE status = %s",
				'cancelled',
				$msg,
				'cancelled',
				$now,
				$now,
				'pending'
			)
		);
		return array( 'count' => (int) $n );
	}

	/**
	 * @return true|WP_Error
	 */
	public static function abort_if_cancelled() {
		$job_id = (int) self::$current_job_id;
		if ( $job_id < 1 ) {
			return true;
		}
		if ( ! get_transient( 'webino_ai_job_cancel_' . $job_id ) ) {
			return true;
		}
		return new WP_Error( 'ai_cancelled', __( 'Cancelled by user.', 'webino-dashboard' ) );
	}

	/**
	 * @param array<string,mixed> $result Provider result.
	 * @return void
	 */
	public static function remember_usage( $result ) {
		if ( ! is_array( $result ) ) {
			return;
		}
		self::$last_usage['provider']   = (string) ( $result['provider'] ?? self::$last_usage['provider'] );
		self::$last_usage['model']      = (string) ( $result['model'] ?? self::$last_usage['model'] );
		self::$last_usage['tokens_in'] += isset( $result['tokens_in'] ) ? (int) $result['tokens_in'] : 0;
		self::$last_usage['tokens_out'] += isset( $result['tokens_out'] ) ? (int) $result['tokens_out'] : 0;
		if ( '' === self::$last_usage['model'] && '' !== self::$last_usage['provider'] ) {
			self::$last_usage['model'] = Webino_Dashboard_AI_Pricing::model_for_provider( self::$last_usage['provider'] );
		}
	}

	/**
	 * @return array{provider:string,model:string,tokens_in:int,tokens_out:int,cost_toman:string}
	 */
	private static function usage_fields() {
		$provider = (string) self::$last_usage['provider'];
		$model    = (string) self::$last_usage['model'];
		if ( '' === $model && '' !== $provider ) {
			$model = Webino_Dashboard_AI_Pricing::model_for_provider( $provider );
		}
		$tin  = (int) self::$last_usage['tokens_in'];
		$tout = (int) self::$last_usage['tokens_out'];
		$cost = Webino_Dashboard_AI_Pricing::cost_toman( $provider, $model, $tin, $tout );
		return array(
			'provider'   => $provider,
			'model'      => $model,
			'tokens_in'  => $tin,
			'tokens_out' => $tout,
			'cost_toman' => number_format( $cost, 4, '.', '' ),
		);
	}

	/**
	 * @param string $phase queued|provider|seo|writing|done.
	 * @return void
	 */
	public static function set_phase( $phase ) {
		global $wpdb;
		$job_id = (int) self::$current_job_id;
		if ( $job_id < 1 ) {
			return;
		}
		$phase = sanitize_key( $phase );
		$table = Webino_Dashboard_AI_Content_Db::table( 'jobs' );
		$wpdb->update(
			$table,
			array(
				'result_summary' => $phase,
				'updated_at'     => current_time( 'mysql', true ),
			),
			array( 'id' => $job_id ),
			array( '%s', '%s' ),
			array( '%d' )
		);
	}

	/**
	 * Mark running jobs older than 3 minutes as failed.
	 *
	 * @return void
	 */
	public static function reap_stuck_jobs() {
		global $wpdb;
		if ( ! Webino_Dashboard_AI_Content_Db::jobs_table_exists() ) {
			return;
		}
		$table  = Webino_Dashboard_AI_Content_Db::table( 'jobs' );
		$cutoff = gmdate( 'Y-m-d H:i:s', time() - 3 * MINUTE_IN_SECONDS );
		$now    = current_time( 'mysql', true );
		$msg    = __( 'Job timed out.', 'webino-dashboard' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query(
			$wpdb->prepare(
				"UPDATE {$table} SET status = %s, error_message = CASE WHEN error_message IS NULL OR error_message = '' THEN %s ELSE error_message END, finished_at = %s, updated_at = %s WHERE status = %s AND started_at IS NOT NULL AND started_at < %s",
				'failed',
				$msg,
				$now,
				$now,
				'running',
				$cutoff
			)
		);
	}

	/**
	 * Process pending jobs in the current request (WP-Cron fallback).
	 *
	 * @param int $limit Max jobs.
	 * @return array{processed:list<int>,count:int,paused?:bool}
	 */
	public static function run_due( $limit = 1 ) {
		if ( self::is_paused() ) {
			return array(
				'processed' => array(),
				'count'     => 0,
				'paused'    => true,
			);
		}
		global $wpdb;
		Webino_Dashboard_AI_Content_Db::ensure_tables();
		self::reap_stuck_jobs();
		$limit = min( 5, max( 1, (int) $limit ) );
		$table = Webino_Dashboard_AI_Content_Db::table( 'jobs' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT id FROM {$table} WHERE status = %s ORDER BY id ASC LIMIT %d",
				'pending',
				$limit
			)
		);
		$processed = array();
		foreach ( (array) $ids as $id ) {
			$claimed = self::claim_job( (int) $id );
			if ( is_wp_error( $claimed ) ) {
				continue;
			}
			self::defer_execute( (int) $id );
			$processed[] = (int) $id;
		}
		return array(
			'processed' => $processed,
			'count'     => count( $processed ),
		);
	}

	/**
	 * @param int $job_id Job.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function get_job( $job_id ) {
		global $wpdb;
		$job_id = (int) $job_id;
		if ( $job_id < 1 ) {
			return new WP_Error( 'ai_job', __( 'Job not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		Webino_Dashboard_AI_Content_Db::ensure_tables();
		$table = Webino_Dashboard_AI_Content_Db::table( 'jobs' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $job_id ), ARRAY_A );
		if ( ! is_array( $row ) ) {
			return new WP_Error( 'ai_job', __( 'Job not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return Webino_Dashboard_AI_Pricing::present_job( $row );
	}

	/**
	 * @param string $message Error.
	 * @return string
	 */
	private static function sanitize_error( $message ) {
		$text = wp_strip_all_tags( (string) $message );
		$text = preg_replace( '/\s+/', ' ', $text );
		$text = is_string( $text ) ? trim( $text ) : '';
		if ( function_exists( 'mb_substr' ) ) {
			return mb_substr( $text, 0, 4000 );
		}
		return substr( $text, 0, 4000 );
	}

	/**
	 * @param int    $job_id Job.
	 * @param string $message Error.
	 * @return void
	 */
	private static function fail_job( $job_id, $message ) {
		global $wpdb;
		$table = Webino_Dashboard_AI_Content_Db::table( 'jobs' );
		$usage = self::usage_fields();
		$wpdb->update(
			$table,
			array_merge(
				array(
					'status'         => 'failed',
					'error_message'  => self::sanitize_error( $message ),
					'finished_at'    => current_time( 'mysql', true ),
					'updated_at'     => current_time( 'mysql', true ),
				),
				$usage
			),
			array( 'id' => (int) $job_id ),
			array( '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%d', '%s' ),
			array( '%d' )
		);
		delete_transient( 'webino_ai_job_cancel_' . (int) $job_id );
	}

	/**
	 * @param int    $job_id Job.
	 * @param string $message Message.
	 * @return void
	 */
	private static function mark_cancelled( $job_id, $message ) {
		global $wpdb;
		$table = Webino_Dashboard_AI_Content_Db::table( 'jobs' );
		$usage = self::usage_fields();
		$wpdb->update(
			$table,
			array_merge(
				array(
					'status'         => 'cancelled',
					'error_message'  => self::sanitize_error( $message ),
					'result_summary' => 'cancelled',
					'finished_at'    => current_time( 'mysql', true ),
					'updated_at'     => current_time( 'mysql', true ),
				),
				$usage
			),
			array( 'id' => (int) $job_id ),
			array( '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%d', '%s' ),
			array( '%d' )
		);
		delete_transient( 'webino_ai_job_cancel_' . (int) $job_id );
	}

	/**
	 * @param string              $job_type Type.
	 * @param string              $target_type Target.
	 * @param int                 $target_id ID.
	 * @param array<string,mixed> $payload Payload.
	 * @return array<string,mixed>|WP_Error
	 */
	private static function run_job_logic( $job_type, $target_type, $target_id, $payload ) {
		if ( 'product_fill' === $job_type ) {
			return self::job_product_fill( $target_id, $payload );
		}
		if ( 'blog_write' === $job_type ) {
			return self::job_blog_write( $target_id, $payload );
		}
		if ( 'term_fill' === $job_type ) {
			return self::job_term_fill( $target_type, $target_id, $payload );
		}
		if ( 'suggest_blog_categories' === $job_type ) {
			return self::job_suggest_categories( 'blog', $payload );
		}
		if ( 'suggest_product_categories' === $job_type ) {
			return self::job_suggest_categories( 'product', $payload );
		}
		if ( 'attr_template' === $job_type ) {
			return self::job_attr_template( $target_id, $payload );
		}
		return new WP_Error( 'ai_job', __( 'Unknown job type.', 'webino-dashboard' ) );
	}

	/**
	 * @param int                 $product_id Product.
	 * @param array<string,mixed> $payload Payload.
	 * @return array<string,mixed>|WP_Error
	 */
	private static function job_product_fill( $product_id, $payload ) {
		$ready = Webino_Dashboard_AI_Content_Settings::assert_entity( 'product' );
		if ( is_wp_error( $ready ) ) {
			return $ready;
		}
		if ( ! function_exists( 'wc_get_product' ) ) {
			return new WP_Error( 'no_wc', 'WooCommerce required' );
		}
		$p = wc_get_product( (int) $product_id );
		if ( ! $p ) {
			return new WP_Error( 'not_found', 'Product not found' );
		}

		$cats = array();
		foreach ( $p->get_category_ids() as $cid ) {
			$t = get_term( (int) $cid, 'product_cat' );
			if ( $t && ! is_wp_error( $t ) ) {
				$cats[] = array( 'id' => (int) $t->term_id, 'name' => $t->name );
			}
		}

		$merged        = Webino_Dashboard_AI_Attributes::merge_for_categories( wp_list_pluck( $cats, 'id' ) );
		$attr_ids      = $merged['attribute_ids'];
		$attr_template = $merged['labels'];

		$related = self::related_products( (int) $product_id, wp_list_pluck( $cats, 'id' ) );

		$ctx = array(
			'id'                  => (int) $product_id,
			'name'                => $p->get_name(),
			'sku'                 => $p->get_sku(),
			'english_name'        => (string) get_post_meta( (int) $product_id, '_ishop_english_name', true ),
			'short_description'   => $p->get_short_description(),
			'description'         => $p->get_description(),
			'categories'          => $cats,
			'brands'              => self::product_brands( (int) $product_id ),
			'current_attributes'  => self::product_attribute_facts( $p ),
			'variations_summary'  => self::product_variation_facts( $p ),
			'focus_keyword'       => (string) ( $payload['focus_keyword'] ?? '' ),
			'attribute_template'  => $attr_template,
			'related'             => $related,
			'regenerate_hint'     => (string) ( $payload['regenerate_hint'] ?? '' ),
			'coffee'              => self::coffee_context( (int) $product_id ),
			'research_notes'      => '',
		);

		self::set_phase( 'provider' );
		$stop = self::abort_if_cancelled();
		if ( is_wp_error( $stop ) ) {
			return $stop;
		}

		$research = Webino_Dashboard_AI_Providers::research_product( $ctx );
		self::remember_usage( $research['result'] );
		$ctx['research_notes'] = (string) ( $research['notes'] ?? '' );

		$result = Webino_Dashboard_AI_Providers::complete(
			Webino_Dashboard_AI_Prompts::system_rules(),
			Webino_Dashboard_AI_Prompts::product_user( $ctx ),
			Webino_Dashboard_AI_Prompts::product_schema()
		);
		self::remember_usage( $result );
		if ( empty( $result['ok'] ) ) {
			return new WP_Error( 'ai_provider', (string) ( $result['error'] ?? 'fail' ) );
		}

		$stop = self::abort_if_cancelled();
		if ( is_wp_error( $stop ) ) {
			return $stop;
		}

		$data = $result['data'];
		self::set_phase( 'seo' );
		$gate = Webino_Dashboard_AI_Seo_Gate::validate(
			$data,
			'product',
			array(
				'focus_keyword' => (string) ( $data['focus_keyword'] ?? $data['seo']['focus_keyword'] ?? $p->get_name() ),
				'exclude_type'  => 'product',
				'exclude_id'    => (int) $product_id,
			)
		);
		if ( is_wp_error( $gate ) ) {
			return $gate;
		}

		self::set_phase( 'writing' );
		$stop = self::abort_if_cancelled();
		if ( is_wp_error( $stop ) ) {
			return $stop;
		}
		$settings = Webino_Dashboard_AI_Content_Settings::get();
		$applied  = Webino_Dashboard_AI_Writer::apply_product(
			(int) $product_id,
			$data,
			array(
				'attribute_ids' => $attr_ids,
				'related_ids'   => wp_list_pluck( $related, 'id' ),
				'set_status'    => ! empty( $payload['set_status'] ),
				'publish'       => ! empty( $settings['auto_publish'] ),
				'status'        => $settings['publish_status'],
			)
		);
		if ( is_wp_error( $applied ) ) {
			return $applied;
		}

		return array(
			'provider'   => $result['provider'] ?? '',
			'tokens_in'  => $result['tokens_in'] ?? 0,
			'tokens_out' => $result['tokens_out'] ?? 0,
			'summary'    => 'Product #' . $product_id . ' updated',
		);
	}

	/**
	 * @param int                 $calendar_or_post_id Calendar slot or post id.
	 * @param array<string,mixed> $payload Payload.
	 * @return array<string,mixed>|WP_Error
	 */
	private static function job_blog_write( $calendar_or_post_id, $payload ) {
		$ready = Webino_Dashboard_AI_Content_Settings::assert_entity( 'blog' );
		if ( is_wp_error( $ready ) ) {
			return $ready;
		}
		$ctx = array(
			'topic'               => (string) ( $payload['topic'] ?? '' ),
			'focus_keyword'       => (string) ( $payload['focus_keyword'] ?? '' ),
			'secondary_keywords'  => $payload['secondary_keywords'] ?? array(),
			'category'            => (string) ( $payload['category'] ?? '' ),
			'related'             => self::related_posts(),
			'regenerate_hint'     => (string) ( $payload['regenerate_hint'] ?? '' ),
		);

		self::set_phase( 'provider' );
		$result = Webino_Dashboard_AI_Providers::complete(
			Webino_Dashboard_AI_Prompts::system_rules(),
			Webino_Dashboard_AI_Prompts::blog_user( $ctx ),
			Webino_Dashboard_AI_Prompts::blog_schema()
		);
		self::remember_usage( $result );
		if ( empty( $result['ok'] ) ) {
			return new WP_Error( 'ai_provider', (string) ( $result['error'] ?? 'fail' ) );
		}

		$data = $result['data'];
		self::set_phase( 'seo' );
		$gate = Webino_Dashboard_AI_Seo_Gate::validate(
			$data,
			'blog',
			array(
				'focus_keyword' => (string) ( $data['focus_keyword'] ?? $ctx['focus_keyword'] ),
				'exclude_type'  => 'post',
				'exclude_id'    => (int) ( $payload['post_id'] ?? 0 ),
			)
		);
		if ( is_wp_error( $gate ) ) {
			return $gate;
		}

		self::set_phase( 'writing' );
		$stop = self::abort_if_cancelled();
		if ( is_wp_error( $stop ) ) {
			return $stop;
		}
		$post_id = Webino_Dashboard_AI_Writer::create_or_update_post(
			$data,
			array(
				'post_id'     => (int) ( $payload['post_id'] ?? 0 ),
				'category_id' => (int) ( $payload['category_id'] ?? 0 ),
				'publish'     => ! empty( $payload['publish'] ),
			)
		);
		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		if ( ! empty( $payload['calendar_id'] ) ) {
			Webino_Dashboard_AI_Calendar::mark_done( (int) $payload['calendar_id'], (int) $post_id );
		}

		return array(
			'provider'   => $result['provider'] ?? '',
			'tokens_in'  => $result['tokens_in'] ?? 0,
			'tokens_out' => $result['tokens_out'] ?? 0,
			'summary'    => 'Post #' . $post_id . ' created',
			'post_id'    => (int) $post_id,
		);
	}

	/**
	 * @param string              $taxonomy Taxonomy.
	 * @param int                 $term_id Term.
	 * @param array<string,mixed> $payload Payload.
	 * @return array<string,mixed>|WP_Error
	 */
	private static function job_term_fill( $taxonomy, $term_id, $payload ) {
		$entity = Webino_Dashboard_AI_Content_Settings::entity_for_type( $taxonomy );
		$ready  = Webino_Dashboard_AI_Content_Settings::assert_entity( $entity );
		if ( is_wp_error( $ready ) ) {
			return $ready;
		}
		$term = get_term( (int) $term_id, sanitize_key( $taxonomy ) );
		if ( ! $term || is_wp_error( $term ) ) {
			return new WP_Error( 'not_found', 'Term not found' );
		}

		$ctx = array(
			'id'              => (int) $term_id,
			'name'            => $term->name,
			'slug'            => $term->slug,
			'taxonomy'        => $taxonomy,
			'description'     => $term->description,
			'focus_keyword'   => (string) ( $payload['focus_keyword'] ?? $term->name ),
			'regenerate_hint' => (string) ( $payload['regenerate_hint'] ?? '' ),
		);

		self::set_phase( 'provider' );
		$result = Webino_Dashboard_AI_Providers::complete(
			Webino_Dashboard_AI_Prompts::system_rules(),
			Webino_Dashboard_AI_Prompts::term_user( $ctx ),
			Webino_Dashboard_AI_Prompts::term_schema( $taxonomy )
		);
		self::remember_usage( $result );
		if ( empty( $result['ok'] ) ) {
			return new WP_Error( 'ai_provider', (string) ( $result['error'] ?? 'fail' ) );
		}

		$data = $result['data'];
		self::set_phase( 'seo' );
		$gate = Webino_Dashboard_AI_Seo_Gate::validate(
			array_merge( $data, array( 'title' => $term->name ) ),
			'term',
			array(
				'focus_keyword' => (string) ( $data['focus_keyword'] ?? $term->name ),
				'exclude_type'  => $taxonomy,
				'exclude_id'    => (int) $term_id,
			)
		);
		if ( is_wp_error( $gate ) ) {
			return $gate;
		}

		self::set_phase( 'writing' );
		$stop = self::abort_if_cancelled();
		if ( is_wp_error( $stop ) ) {
			return $stop;
		}
		$applied = Webino_Dashboard_AI_Writer::apply_term( (int) $term_id, $taxonomy, $data );
		if ( is_wp_error( $applied ) ) {
			return $applied;
		}

		return array(
			'provider'   => $result['provider'] ?? '',
			'tokens_in'  => $result['tokens_in'] ?? 0,
			'tokens_out' => $result['tokens_out'] ?? 0,
			'summary'    => $taxonomy . ' #' . $term_id . ' updated',
		);
	}

	/**
	 * @param string              $kind blog|product.
	 * @param array<string,mixed> $payload Payload.
	 * @return array<string,mixed>|WP_Error
	 */
	private static function job_suggest_categories( $kind, $payload ) {
		$existing = array();
		$tax      = 'blog' === $kind ? 'category' : 'product_cat';
		$terms    = get_terms( array( 'taxonomy' => $tax, 'hide_empty' => false, 'number' => 100 ) );
		if ( ! is_wp_error( $terms ) ) {
			foreach ( $terms as $t ) {
				$existing[] = $t->name;
			}
		}

		$user = Webino_Dashboard_AI_Prompts::suggest_categories_user(
			$kind,
			array(
				'existing'          => $existing,
				'product_samples'   => $payload['product_samples'] ?? array(),
				'regenerate_hint'   => (string) ( $payload['regenerate_hint'] ?? '' ),
			)
		);

		$result = Webino_Dashboard_AI_Providers::complete(
			Webino_Dashboard_AI_Prompts::system_rules(),
			$user,
			Webino_Dashboard_AI_Prompts::categories_schema()
		);
		self::remember_usage( $result );
		if ( empty( $result['ok'] ) ) {
			return new WP_Error( 'ai_provider', (string) ( $result['error'] ?? 'fail' ) );
		}

		set_transient( 'webino_ai_suggest_cats_' . $kind, $result['data'], DAY_IN_SECONDS );

		return array(
			'provider'   => $result['provider'] ?? '',
			'tokens_in'  => $result['tokens_in'] ?? 0,
			'tokens_out' => $result['tokens_out'] ?? 0,
			'summary'    => 'Category suggestions ready',
			'suggestions'=> $result['data'],
		);
	}

	/**
	 * @param int                 $cat_id Category.
	 * @param array<string,mixed> $payload Payload.
	 * @return array<string,mixed>|WP_Error
	 */
	private static function job_attr_template( $cat_id, $payload ) {
		$term = get_term( (int) $cat_id, 'product_cat' );
		if ( ! $term || is_wp_error( $term ) ) {
			return new WP_Error( 'not_found', 'Category not found' );
		}

		$user = Webino_Dashboard_AI_Prompts::attr_template_user(
			array(
				'category'          => array( 'id' => (int) $cat_id, 'name' => $term->name ),
				'sample_products'   => $payload['samples'] ?? array(),
				'regenerate_hint'   => (string) ( $payload['regenerate_hint'] ?? '' ),
			)
		);

		$result = Webino_Dashboard_AI_Providers::complete(
			Webino_Dashboard_AI_Prompts::system_rules(),
			$user,
			Webino_Dashboard_AI_Prompts::attribute_template_schema()
		);
		self::remember_usage( $result );
		if ( empty( $result['ok'] ) ) {
			return new WP_Error( 'ai_provider', (string) ( $result['error'] ?? 'fail' ) );
		}

		$draft = $result['data'];
		set_transient( 'webino_ai_attr_draft_' . (int) $cat_id, $draft, DAY_IN_SECONDS );

		return array(
			'provider'   => $result['provider'] ?? '',
			'tokens_in'  => $result['tokens_in'] ?? 0,
			'tokens_out' => $result['tokens_out'] ?? 0,
			'summary'    => 'Attribute template draft ready',
			'draft'      => $draft,
		);
	}

	/**
	 * Coffee tasting context when the module and AI switch are on.
	 *
	 * @param int $product_id Product.
	 * @return array<string,mixed>|null
	 */
	private static function coffee_context( $product_id ) {
		if ( ! Webino_Dashboard_AI_Content_Settings::coffee_enabled() ) {
			return null;
		}
		$settings = Webino_Dashboard_Coffee_Profile::get_settings();
		$origins  = array();
		if ( taxonomy_exists( 'product_coffee_origin' ) ) {
			$terms = get_terms(
				array(
					'taxonomy'   => 'product_coffee_origin',
					'hide_empty' => false,
					'number'     => 80,
				)
			);
			if ( ! is_wp_error( $terms ) ) {
				foreach ( $terms as $t ) {
					$origins[] = array(
						'id'   => (int) $t->term_id,
						'name' => $t->name,
					);
				}
			}
		}
		return array(
			'scale_min'      => (int) $settings['scale_min'],
			'scale_max'      => (int) $settings['scale_max'],
			'caffeine_max'   => (int) $settings['caffeine_max'],
			'acidity_levels' => $settings['acidity_levels'],
			'origins'        => $origins,
			'current'        => Webino_Dashboard_Coffee_Profile::get_profile( (int) $product_id ),
		);
	}

	/**
	 * @param int        $product_id Product.
	 * @param array<int> $category_ids Category IDs.
	 * @return array<int,array<string,mixed>>
	 */
	private static function related_products( $product_id, $category_ids = array() ) {
		if ( ! function_exists( 'wc_get_products' ) ) {
			return array();
		}
		$args = array(
			'limit'   => 8,
			'status'  => 'publish',
			'exclude' => array( (int) $product_id ),
			'return'  => 'ids',
			'orderby' => 'date',
			'order'   => 'DESC',
		);
		$category_ids = array_values( array_filter( array_map( 'intval', (array) $category_ids ) ) );
		if ( $category_ids ) {
			$args['category'] = array();
			foreach ( $category_ids as $cid ) {
				$term = get_term( $cid, 'product_cat' );
				if ( $term && ! is_wp_error( $term ) ) {
					$args['category'][] = $term->slug;
				}
			}
			if ( ! $args['category'] ) {
				unset( $args['category'] );
			}
		}
		$ids = wc_get_products( $args );
		$out = array();
		foreach ( (array) $ids as $id ) {
			$p = wc_get_product( (int) $id );
			if ( $p ) {
				$out[] = array(
					'id'   => (int) $id,
					'name' => $p->get_name(),
					'url'  => get_permalink( (int) $id ) ?: '',
				);
			}
		}
		return $out;
	}

	/**
	 * @param int $product_id Product.
	 * @return array<int,array<string,string>>
	 */
	private static function product_brands( $product_id ) {
		$out = array();
		if ( ! taxonomy_exists( 'product_brand' ) ) {
			return $out;
		}
		$terms = wp_get_post_terms( (int) $product_id, 'product_brand' );
		if ( is_wp_error( $terms ) ) {
			return $out;
		}
		foreach ( $terms as $term ) {
			$out[] = array(
				'id'   => (int) $term->term_id,
				'name' => $term->name,
			);
		}
		return $out;
	}

	/**
	 * @param WC_Product $p Product.
	 * @return array<int,array<string,mixed>>
	 */
	private static function product_attribute_facts( $p ) {
		$out = array();
		foreach ( $p->get_attributes() as $attr ) {
			if ( ! is_object( $attr ) ) {
				continue;
			}
			$name = $attr->get_name();
			if ( $attr->is_taxonomy() ) {
				$label = wc_attribute_label( $name );
				$terms = wc_get_product_terms( $p->get_id(), $name, array( 'fields' => 'names' ) );
				$opts  = is_wp_error( $terms ) ? array() : array_values( (array) $terms );
			} else {
				$label = $name;
				$opts  = $attr->get_options();
			}
			$out[] = array(
				'name'    => $label,
				'options' => $opts,
			);
		}
		return $out;
	}

	/**
	 * @param WC_Product $p Product.
	 * @return array<string,array<int,string>>
	 */
	private static function product_variation_facts( $p ) {
		if ( ! $p->is_type( 'variable' ) ) {
			return array();
		}
		$out = array();
		foreach ( $p->get_variation_attributes() as $tax => $opts ) {
			$label = wc_attribute_label( $tax );
			$out[ $label ] = array_values( array_map( 'strval', (array) $opts ) );
		}
		return $out;
	}

	/**
	 * @return array<int,array<string,string>>
	 */
	private static function related_posts() {
		$q = new WP_Query(
			array(
				'post_type'      => 'post',
				'post_status'    => 'publish',
				'posts_per_page' => 5,
				'fields'         => 'ids',
			)
		);
		$out = array();
		foreach ( $q->posts as $id ) {
			$out[] = array(
				'name' => get_the_title( (int) $id ),
				'url'  => get_permalink( (int) $id ) ?: '',
			);
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $args Query args.
	 * @return array{items:array,total:int}
	 */
	public static function list_jobs( $args = array() ) {
		global $wpdb;
		Webino_Dashboard_AI_Content_Db::ensure_tables();
		self::reap_stuck_jobs();
		$table  = Webino_Dashboard_AI_Content_Db::table( 'jobs' );
		$status = isset( $args['status'] ) ? sanitize_key( (string) $args['status'] ) : '';
		$limit  = min( 100, max( 1, (int) ( $args['limit'] ?? 30 ) ) );
		$offset = max( 0, (int) ( $args['offset'] ?? 0 ) );

		$where = '1=1';
		$params = array();
		if ( $status ) {
			$where   .= ' AND status = %s';
			$params[] = $status;
		}

		$sql_count = "SELECT COUNT(*) FROM {$table} WHERE {$where}";
		$sql_list  = "SELECT * FROM {$table} WHERE {$where} ORDER BY id DESC LIMIT %d OFFSET %d";

		if ( $params ) {
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
			$total = (int) $wpdb->get_var( $wpdb->prepare( $sql_count, $params ) );
			$params2 = array_merge( $params, array( $limit, $offset ) );
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
			$rows = $wpdb->get_results( $wpdb->prepare( $sql_list, $params2 ), ARRAY_A );
		} else {
			$total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$rows = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table} ORDER BY id DESC LIMIT %d OFFSET %d", $limit, $offset ), ARRAY_A );
		}

		$items = array();
		foreach ( is_array( $rows ) ? $rows : array() as $row ) {
			$items[] = Webino_Dashboard_AI_Pricing::present_job( $row );
		}

		return array(
			'items' => $items,
			'total' => $total,
		);
	}
}
