<?php
/**
 * AI Content module bootstrap.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

	$dir = dirname( __FILE__ ) . '/includes/';
if ( ! class_exists( 'Webino_Dashboard_Module_Registry', false )
	|| ! Webino_Dashboard_Module_Registry::require_module_files(
		$dir,
		array(
			'class-webino-dashboard-ai-content-crypto.php',
			'class-webino-dashboard-ai-content-db.php',
			'class-webino-dashboard-ai-content-settings.php',
			'class-webino-dashboard-ai-design-memory.php',
			'class-webino-dashboard-ai-providers.php',
			'class-webino-dashboard-ai-pricing.php',
			'class-webino-dashboard-ai-seo-gate.php',
			'class-webino-dashboard-ai-prompts.php',
			'class-webino-dashboard-ai-elementor-sanitize.php',
			'class-webino-dashboard-ai-elementor-catalog.php',
			'class-webino-dashboard-ai-elementor-compiler.php',
			'class-webino-dashboard-ai-elementor.php',
			'class-webino-dashboard-ai-writer.php',
			'class-webino-dashboard-ai-proposals.php',
			'class-webino-dashboard-ai-blog-topics.php',
			'class-webino-dashboard-ai-blog-images.php',
			'class-webino-dashboard-ai-queue.php',
			'class-webino-dashboard-ai-calendar.php',
			'class-webino-dashboard-ai-attributes.php',
			'class-webino-dashboard-ai-content.php',
			'class-webino-dashboard-ai-related-storefront.php',
			'class-webino-dashboard-rest-ai-content.php',
		),
		'ai-content-module'
	) ) {
	return;
}

Webino_Dashboard_AI_Content::init();
Webino_Dashboard_AI_Related_Storefront::init();
Webino_Dashboard_REST_AI_Content::init();
