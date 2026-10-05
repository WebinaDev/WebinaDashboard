<?php
/**
 * Fired during plugin deactivation
 *
 * @package    WFCP
 * @subpackage WFCP/includes
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Fired during plugin deactivation.
 */
class WFCP_Deactivator {

	/**
	 * Deactivate plugin
	 */
	public static function deactivate() {
		// Delete transients
		global $wpdb;
		$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_wfcp_%'" );
		$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_wfcp_%'" );
		
		// Flush rewrite rules
		flush_rewrite_rules();
	}
}

