<?php
/**
 * Custom taxonomies for media and optional product brand.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers taxonomies on init.
 */
class Webino_Dashboard_Taxonomies {

	/**
	 * @return void
	 */
	public static function register() {
		register_taxonomy(
			'webino_media_category',
			'attachment',
			array(
				'labels'            => array(
					'name'          => __( 'Media categories', 'webino-dashboard' ),
					'singular_name' => __( 'Media category', 'webino-dashboard' ),
				),
				'public'            => false,
				'show_ui'           => false,
				'show_admin_column' => false,
				'hierarchical'      => true,
				'show_in_rest'      => true,
				'rest_base'         => 'webino-media-category',
			)
		);

		register_taxonomy(
			'webino_media_folder',
			'attachment',
			array(
				'labels'            => array(
					'name'          => __( 'Media folders', 'webino-dashboard' ),
					'singular_name' => __( 'Media folder', 'webino-dashboard' ),
				),
				'public'            => false,
				'show_ui'           => false,
				'hierarchical'      => true,
				'show_in_rest'      => true,
				'rest_base'         => 'webino-media-folder',
			)
		);

		register_taxonomy(
			'webino_media_tag',
			'attachment',
			array(
				'labels'            => array(
					'name'          => __( 'Media tags', 'webino-dashboard' ),
					'singular_name' => __( 'Media tag', 'webino-dashboard' ),
				),
				'public'            => false,
				'show_ui'           => false,
				'hierarchical'      => false,
				'show_in_rest'      => true,
				'rest_base'         => 'webino-media-tag',
			)
		);

		if ( ! taxonomy_exists( 'product_brand' ) && post_type_exists( 'product' ) ) {
			register_taxonomy(
				'product_brand',
				'product',
				array(
					'labels'       => array(
						'name'          => __( 'Brands', 'webino-dashboard' ),
						'singular_name' => __( 'Brand', 'webino-dashboard' ),
					),
					'public'       => true,
					'hierarchical' => true,
					'show_ui'      => true,
					'show_in_rest' => true,
				)
			);
		}
	}
}
