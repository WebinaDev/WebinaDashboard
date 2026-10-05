<?php
/**
 * Define the internationalization functionality
 *
 * @package    WFCP
 * @subpackage WFCP/includes
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Define the internationalization functionality.
 */
class WFCP_i18n {

	/**
	 * Load the plugin text domain for translation.
	 */
	public function load_plugin_textdomain() {
		load_plugin_textdomain(
			'webina-woo-core',
			false,
			dirname( WFCP_PLUGIN_BASENAME ) . '/languages/'
		);
	}
}

