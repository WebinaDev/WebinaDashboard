<?php

namespace Webino_Dashboard_Bots_Telegram\Database;

/**
 * Activation: custom table for bot sessions.
 */
class Activator {

	public static function activate(): void {
		global $wpdb;
		$table_name      = $wpdb->prefix . 'webino_dashboard_bot_sessions';
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$table_name} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			chat_id varchar(64) NOT NULL,
			wp_user_id bigint(20) unsigned NOT NULL DEFAULT 0,
			current_state varchar(64) NULL,
			temp_data longtext NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY chat_id (chat_id),
			KEY wp_user_id (wp_user_id)
		) {$charset_collate};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		update_option( 'woobale_db_version', '1.0.0' );

		if ( class_exists( '\Webino_Dashboard_Bots_Telegram\Core\Plugin' ) ) {
			\Webino_Dashboard_Bots_Telegram\Core\Plugin::bootstrap_secrets();
		}
	}
}
