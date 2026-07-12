<?php
/**
 * One-time migration of shared woobale_campaign_* options to per-provider keys.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Moves legacy campaign rows to Bale storage and registers Bale launch hooks.
 */
final class Webino_Dashboard_Bots_Campaign_Migration {

	const FLAG = 'webino_dashboard_bots_campaign_options_v2';

	/**
	 * @return void
	 */
	public static function run(): void {
		if ( '1' === get_option( self::FLAG, '' ) ) {
			return;
		}

		$old_items = get_option( 'woobale_campaign_items' );
		$old_last  = (int) get_option( 'woobale_campaign_last_id', 0 );

		wp_clear_scheduled_hook( 'woobale_campaign_launch' );

		if ( is_array( $old_items ) && count( $old_items ) > 0 ) {
			update_option( 'webino_dashboard_bale_campaign_items', $old_items, false );
			update_option( 'webino_dashboard_bale_campaign_last_id', $old_last, false );

			foreach ( $old_items as $item ) {
				if ( ! is_array( $item ) || empty( $item['id'] ) ) {
					continue;
				}
				if ( ( $item['status'] ?? '' ) !== 'scheduled' ) {
					continue;
				}
				$id   = (int) $item['id'];
				$when = (int) ( $item['scheduled_at'] ?? 0 );
				if ( $when > 0 && $id > 0 && ! wp_next_scheduled( 'webino_dashboard_bale_campaign_launch', array( $id ) ) ) {
					wp_schedule_single_event( $when, 'webino_dashboard_bale_campaign_launch', array( $id ) );
				}
			}
		}

		if ( false === get_option( 'webino_dashboard_telegram_campaign_items', false ) ) {
			add_option( 'webino_dashboard_telegram_campaign_items', array(), '', false );
		}
		if ( false === get_option( 'webino_dashboard_telegram_campaign_last_id', false ) ) {
			add_option( 'webino_dashboard_telegram_campaign_last_id', 0, '', false );
		}

		delete_option( 'woobale_campaign_items' );
		delete_option( 'woobale_campaign_last_id' );

		update_option( self::FLAG, '1', true );
	}
}
