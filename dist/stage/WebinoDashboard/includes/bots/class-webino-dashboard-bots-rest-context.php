<?php
/**
 * Maps REST provider slug (bale|telegram) to embedded bot classes and option keys.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolver for webino-dashboard/v1/bots/* routes.
 */
final class Webino_Dashboard_Bots_REST_Context {

	public const IMPORTED_BALE     = 'webino_dashboard_bale_imported_user_ids';
	public const IMPORTED_TELEGRAM = 'webino_dashboard_telegram_imported_user_ids';

	/**
	 * @param string $pre URL segment bale|telegram.
	 * @return string|null bale|telegram
	 */
	public static function normalize_provider( $pre ) {
		$pre = sanitize_key( (string) $pre );
		return in_array( $pre, array( 'bale', 'telegram' ), true ) ? $pre : null;
	}

	/**
	 * @param string $which bale|telegram.
	 * @return array<string,string>|null
	 */
	public static function resolve( $which ) {
		if ( 'bale' === $which ) {
			if ( ! class_exists( 'Webino_Dashboard_Module_Registry', false )
				|| ! Webino_Dashboard_Module_Registry::is_active( 'bale-bot-module' ) ) {
				return null;
			}
			return array(
				'which'            => 'bale',
				'module_id'        => 'bale-bot-module',
				'pre'              => 'bale',
				'stats_class'      => \Webino_Dashboard_Bots_Bale\Admin\StatsService::class,
				'broadcast_class'  => \Webino_Dashboard_Bots_Bale\Admin\BroadcastQueue::class,
				'campaign_class'   => \Webino_Dashboard_Bots_Bale\Admin\CampaignRepository::class,
				'activity_class'   => \Webino_Dashboard_Bots_Bale\Logging\ActivityLog::class,
				'plugin_class'     => \Webino_Dashboard_Bots_Bale\Core\Plugin::class,
				'imported_option'  => self::IMPORTED_BALE,
				'chat_meta_key'    => 'woobale_chat_id',
				'order_source_key' => '_woobale_source',
			);
		}
		if ( 'telegram' === $which ) {
			if ( ! class_exists( 'Webino_Dashboard_Module_Registry', false )
				|| ! Webino_Dashboard_Module_Registry::is_active( 'telegram-bot-module' ) ) {
				return null;
			}
			return array(
				'which'            => 'telegram',
				'module_id'        => 'telegram-bot-module',
				'pre'              => 'telegram',
				'stats_class'      => \Webino_Dashboard_Bots_Telegram\Admin\StatsService::class,
				'broadcast_class'  => \Webino_Dashboard_Bots_Telegram\Admin\BroadcastQueue::class,
				'campaign_class'   => \Webino_Dashboard_Bots_Telegram\Admin\CampaignRepository::class,
				'activity_class'   => \Webino_Dashboard_Bots_Telegram\Logging\ActivityLog::class,
				'plugin_class'     => \Webino_Dashboard_Bots_Telegram\Core\Plugin::class,
				'imported_option'  => self::IMPORTED_TELEGRAM,
				'chat_meta_key'    => 'webino_dashboard_telegram_chat_id',
				'order_source_key' => '_woobale_source',
			);
		}
		return null;
	}

	/**
	 * @param string $which bale|telegram.
	 * @return list<int>
	 */
	public static function get_imported_user_ids( $which ) {
		$key = 'telegram' === $which ? self::IMPORTED_TELEGRAM : self::IMPORTED_BALE;
		$ids = get_option( $key, array() );
		if ( ! is_array( $ids ) || count( $ids ) === 0 ) {
			$legacy = get_option( 'woobale_imported_user_ids', array() );
			if ( is_array( $legacy ) && count( $legacy ) > 0 && 'bale' === $which ) {
				$ids = array_values( array_unique( array_map( 'absint', $legacy ) ) );
				update_option( $key, $ids, false );
				return $ids;
			}
		}
		return is_array( $ids ) ? array_values( array_unique( array_map( 'absint', $ids ) ) ) : array();
	}

	/**
	 * @param string $which bale|telegram.
	 * @param list<int> $merge_ids User IDs to merge.
	 * @return void
	 */
	public static function merge_imported_user_ids( $which, array $merge_ids ) {
		$key    = 'telegram' === $which ? self::IMPORTED_TELEGRAM : self::IMPORTED_BALE;
		$stored = self::get_imported_user_ids( $which );
		update_option( $key, array_values( array_unique( array_merge( $stored, $merge_ids ) ) ), false );
	}
}
