<?php
/**
 * AI Content module core.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Bootstrap tables, queue, and helpers.
 */
final class Webino_Dashboard_AI_Content {

	/**
	 * @return void
	 */
	public static function init() {
		Webino_Dashboard_AI_Content_Db::ensure_tables();
		Webino_Dashboard_AI_Queue::init();
	}

	/**
	 * @return bool
	 */
	public static function is_enabled() {
		if ( class_exists( 'Webino_Dashboard_Modules', false )
			&& ! Webino_Dashboard_Modules::is_module_enabled( 'ai-content-module' ) ) {
			return false;
		}
		$s = Webino_Dashboard_AI_Content_Settings::get();
		return ! empty( $s['enabled'] );
	}

	/**
	 * Incomplete products for UI.
	 *
	 * @param int $limit Limit.
	 * @return array{items:array,total:int}
	 */
	public static function incomplete_products( $limit = 50 ) {
		if ( ! function_exists( 'wc_get_products' ) ) {
			return array( 'items' => array(), 'total' => 0 );
		}
		$ids = wc_get_products(
			array(
				'limit'  => 200,
				'status' => array( 'publish', 'draft', 'pending' ),
				'return' => 'ids',
				'orderby'=> 'date',
				'order'  => 'DESC',
			)
		);
		$items = array();
		foreach ( (array) $ids as $id ) {
			$p = wc_get_product( (int) $id );
			if ( ! $p ) {
				continue;
			}
			$desc  = trim( wp_strip_all_tags( $p->get_description() ) );
			$short = trim( wp_strip_all_tags( $p->get_short_description() ) );
			$seo   = (string) get_post_meta( (int) $id, 'rank_math_focus_keyword', true );
			$faqs  = get_post_meta( (int) $id, '_product_faqs', true );
			$attrs = $p->get_attributes();
			$missing = array();
			if ( mb_strlen( $desc ) < 120 ) {
				$missing[] = 'description';
			}
			if ( mb_strlen( $short ) < 20 ) {
				$missing[] = 'short_description';
			}
			if ( '' === $seo ) {
				$missing[] = 'seo';
			}
			if ( ! is_array( $faqs ) || ! $faqs ) {
				$missing[] = 'faqs';
			}
			if ( ! $attrs ) {
				$missing[] = 'attributes';
			}
			if ( ! $missing ) {
				continue;
			}
			$items[] = array(
				'id'      => (int) $id,
				'name'    => $p->get_name(),
				'status'  => $p->get_status(),
				'missing' => $missing,
			);
			if ( count( $items ) >= $limit ) {
				break;
			}
		}
		return array(
			'items' => $items,
			'total' => count( $items ),
		);
	}

	/**
	 * Overview stats.
	 *
	 * @return array<string,mixed>
	 */
	public static function overview() {
		global $wpdb;
		Webino_Dashboard_AI_Content_Db::ensure_tables();
		Webino_Dashboard_AI_Queue::reap_stuck_jobs();
		$jobs = Webino_Dashboard_AI_Content_Db::table( 'jobs' );
		$cal  = Webino_Dashboard_AI_Content_Db::table( 'calendar' );

		$pending = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$jobs} WHERE status IN ('pending','running')" ); // phpcs:ignore
		$failed  = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$jobs} WHERE status = 'failed'" ); // phpcs:ignore
		$done    = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$jobs} WHERE status = 'done'" ); // phpcs:ignore
		$spend   = 0.0;
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$has_cost = $wpdb->get_var( $wpdb->prepare( "SHOW COLUMNS FROM {$jobs} LIKE %s", 'cost_toman' ) );
		if ( $has_cost ) {
			$spend = (float) $wpdb->get_var( "SELECT COALESCE(SUM(cost_toman),0) FROM {$jobs} WHERE cost_toman > 0" ); // phpcs:ignore
		}
		$planned = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$cal} WHERE status = 'planned' AND slot_date >= %s", current_time( 'Y-m-d' ) ) ); // phpcs:ignore

		$settings = Webino_Dashboard_AI_Content_Settings::get_public();
		$incomplete = self::incomplete_products( 5 );

		return array(
			'jobs_pending'        => $pending,
			'jobs_failed'         => $failed,
			'jobs_done'           => $done,
			'jobs_cost_toman'     => $spend,
			'calendar_upcoming'   => $planned,
			'incomplete_products' => $incomplete['total'],
			'sample_incomplete'   => $incomplete['items'],
			'settings'            => $settings,
			'module_enabled'      => self::is_enabled(),
		);
	}
}
