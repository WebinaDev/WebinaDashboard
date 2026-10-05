<?php
/**
 * Legacy rewrite-based webhook — quarantined.
 *
 * Live order webhooks use the engine REST route:
 * /wp-json/webino-basalam/v1/order-manager
 *
 * This class is kept only so bootstrap includes do not fatally fail.
 * It does NOT register rewrites or process payloads.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Basalam_Webhook_Handler {
	const QUERY_VAR = 'webino_basalam_webhook';

	/**
	 * No-op: legacy rewrite webhook is disabled.
	 */
	public static function init() {
		// Quarantined — do not register rewrite rules.
	}
}
