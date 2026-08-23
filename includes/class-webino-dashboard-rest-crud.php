<?php
/**
 * Extended REST: home widgets, post/page CRUD, media upload, orders, coupons, comments, brands, reports.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers additional routes.
 */
class Webino_Dashboard_REST_Crud {

	const NS = 'webino-dashboard/v1';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register' ), 11 );
	}

	/**
	 * @return void
	 */
	public static function register() {
		register_rest_route(
			self::NS,
			'/dashboard/home',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'dashboard_home' ),
				'permission_callback' => array( 'Webino_Dashboard_Rest_Base', 'can_read' ),
			)
		);

		register_rest_route(
			self::NS,
			'/dashboard/overview',
			array(
				'methods'             => 'GET',
				'callback'            => array( 'Webino_Dashboard_Home_Overview', 'rest_get' ),
				'permission_callback' => array( 'Webino_Dashboard_Rest_Base', 'can_read' ),
			)
		);

		register_rest_route(
			self::NS,
			'/dashboard/sms-panel',
			array(
				'methods'             => 'GET',
				'callback'            => array( 'Webino_Dashboard_Home_Overview', 'rest_sms_panel' ),
				'permission_callback' => array( 'Webino_Dashboard_Rest_Base', 'can_read' ),
			)
		);

		register_rest_route(
			self::NS,
			'/content/posts/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'post_get' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_posts' );
					},
				),
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'post_patch' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_posts' );
					},
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'post_delete' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'delete_posts' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/content/posts',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'post_create' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/content/categories',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'categories_list' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_posts' );
					},
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'categories_create' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_categories' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/content/tags',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'tags_list' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/content/categories/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'categories_patch' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_categories' ); },
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'categories_delete' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_categories' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/content/pages/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'page_get' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_pages' ); },
				),
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'page_patch' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_pages' ); },
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'page_delete' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'delete_pages' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/content/pages',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'page_create' ),
				'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_pages' ); },
			)
		);

		register_rest_route(
			self::NS,
			'/content/media',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'media_upload' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'upload_files' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/content/media/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'media_patch' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'upload_files' ); },
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'media_delete' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'delete_posts' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/content/media/terms',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'media_terms_list' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'upload_files' ); },
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'media_terms_create' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'upload_files' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/content/media/terms/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'media_terms_patch' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'upload_files' ); },
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'media_terms_delete' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'upload_files' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/product-categories',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'product_categories_list' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_products' )
							|| Webino_Dashboard_Rest_Base::can( 'manage_product_terms' );
					},
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'product_category_create' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_product_terms' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/product-categories/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'product_category_get' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_products' )
							|| Webino_Dashboard_Rest_Base::can( 'manage_product_terms' );
					},
				),
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'product_category_patch' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_product_terms' );
					},
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'product_category_delete' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_product_terms' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/global-attributes',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'global_attribute_create' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'manage_product_terms' );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/shop/global-attributes/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'global_attribute_get' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_product_terms' );
					},
				),
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'global_attribute_patch' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_product_terms' );
					},
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'global_attribute_delete' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_product_terms' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/global-attributes/(?P<id>\d+)/terms',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'global_attribute_terms_list' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_products' );
					},
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'global_attribute_term_create' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_product_terms' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/attribute-groups',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( 'Webino_Dashboard_Attribute_Groups', 'rest_list' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_products' );
					},
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( 'Webino_Dashboard_Attribute_Groups', 'rest_create' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_product_terms' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/attribute-groups/(?P<id>[a-z0-9_]+)',
			array(
				array(
					'methods'             => 'PATCH',
					'callback'            => array( 'Webino_Dashboard_Attribute_Groups', 'rest_patch' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_product_terms' );
					},
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( 'Webino_Dashboard_Attribute_Groups', 'rest_delete' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_product_terms' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/global-attributes/(?P<id>\d+)/terms/(?P<term_id>\d+)',
			array(
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'global_attribute_term_patch' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_product_terms' );
					},
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'global_attribute_term_delete' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_product_terms' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/users/me',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'user_get_me' ),
					'permission_callback' => function () {
						return is_user_logged_in();
					},
				),
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'user_patch_me' ),
					'permission_callback' => function () {
						return is_user_logged_in() && (
							current_user_can( 'edit_user', get_current_user_id() )
							|| Webino_Dashboard_Rest_Base::has_account_portal()
						);
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/users/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'user_get' ),
					'permission_callback' => function ( $request ) {
						$uid = (int) $request['id'];
						return Webino_Dashboard_Rest_Base::can( 'list_users' ) || get_current_user_id() === $uid;
					},
				),
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'user_patch' ),
					'permission_callback' => function ( $request ) {
						$uid = (int) $request['id'];
						if ( current_user_can( 'edit_user', $uid ) ) {
							return true;
						}
						return get_current_user_id() === $uid && Webino_Dashboard_Rest_Base::has_account_portal();
					},
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'user_delete' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'delete_users' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/users/(?P<id>\d+)/reset-password',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'user_reset_password' ),
				'permission_callback' => function ( $request ) {
					return current_user_can( 'edit_user', (int) $request['id'] );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/users/(?P<id>\d+)/change-role',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'user_change_role' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'promote_users' );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/users/(?P<id>\d+)/send-message',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'user_send_message' ),
				'permission_callback' => function ( $request ) {
					return current_user_can( 'edit_user', (int) $request['id'] );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/users/(?P<id>\d+)/disconnect-bot',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'user_disconnect_bot' ),
				'permission_callback' => function ( $request ) {
					return current_user_can( 'edit_user', (int) $request['id'] );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/users/(?P<id>\d+)/wishlist',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'user_wishlist' ),
				'permission_callback' => function ( $request ) {
					return Webino_Dashboard_Rest_Base::can( 'list_users' ) || get_current_user_id() === (int) $request['id'];
				},
			)
		);

		register_rest_route(
			self::NS,
			'/users/(?P<id>\d+)/addresses',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'user_addresses_list' ),
					'permission_callback' => function ( $request ) {
						return Webino_Dashboard_Rest_Base::can_edit_profile_user( (int) $request['id'] );
					},
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'user_address_create' ),
					'permission_callback' => function ( $request ) {
						return Webino_Dashboard_Rest_Base::can_edit_profile_user( (int) $request['id'] );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/users/(?P<id>\d+)/addresses/(?P<address_id>[a-zA-Z0-9\-]+)',
			array(
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'user_address_patch' ),
					'permission_callback' => function ( $request ) {
						return Webino_Dashboard_Rest_Base::can_edit_profile_user( (int) $request['id'] );
					},
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'user_address_delete' ),
					'permission_callback' => function ( $request ) {
						return Webino_Dashboard_Rest_Base::can_edit_profile_user( (int) $request['id'] );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/users/(?P<id>\d+)/addresses/(?P<address_id>[a-zA-Z0-9\-]+)/default',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'user_address_set_default' ),
				'permission_callback' => function ( $request ) {
					return Webino_Dashboard_Rest_Base::can_edit_profile_user( (int) $request['id'] );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/users/(?P<id>\d+)/notes',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'user_notes_list' ),
					'permission_callback' => function ( $request ) {
						return Webino_Dashboard_Rest_Base::can( 'list_users' ) || get_current_user_id() === (int) $request['id'];
					},
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'user_notes_create' ),
					'permission_callback' => function ( $request ) {
						return current_user_can( 'edit_user', (int) $request['id'] );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/users/(?P<id>\d+)/notes/(?P<note_id>[a-zA-Z0-9\-]+)',
			array(
				'methods'             => 'DELETE',
				'callback'            => array( __CLASS__, 'user_notes_delete' ),
				'permission_callback' => function ( $request ) {
					return current_user_can( 'edit_user', (int) $request['id'] );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/shop/products/(?P<id>\d+)/duplicate',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'product_duplicate' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_products' ); },
			)
		);

		register_rest_route(
			self::NS,
			'/shop/products/(?P<id>\d+)/sync-channel',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'product_sync_channel' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_products' ); },
			)
		);

		register_rest_route(
			self::NS,
			'/shop/products/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'product_get' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_products' ); },
				),
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'product_patch' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_products' ); },
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'product_delete' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_products' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/products/(?P<id>\d+)/variations',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'product_variations_list' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_products' ); },
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'product_variation_create' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_products' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/products/(?P<id>\d+)/variations/bulk',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'product_variations_bulk' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_products' ); },
			)
		);

		register_rest_route(
			self::NS,
			'/shop/products/(?P<id>\d+)/variations/generate',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'product_variations_generate' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_products' ); },
			)
		);

		register_rest_route(
			self::NS,
			'/shop/products/(?P<id>\d+)/variations/default',
			array(
				'methods'             => 'PUT',
				'callback'            => array( __CLASS__, 'product_variation_set_default' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_products' ); },
			)
		);

		register_rest_route(
			self::NS,
			'/shop/products/(?P<id>\d+)/variations/(?P<vid>\d+)',
			array(
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'product_variation_patch' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_products' ); },
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'product_variation_delete' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_products' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/products',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'product_create' ),
				'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_products' ); },
			)
		);

		register_rest_route(
			self::NS,
			'/shop/brands',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'brands_list' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_products' ); },
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'brands_create' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_product_terms' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/brands/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'brands_get' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_products' ); },
				),
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'brands_patch' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_product_terms' ); },
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'brands_delete' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'manage_product_terms' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/orders/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'order_get' ),
					'permission_callback' => function ( $request ) {
						return Webino_Dashboard_Rest_Base::can_view_order( (int) $request['id'] );
					},
				),
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'order_patch' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_shop_orders' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/orders/(?P<id>\d+)/notes',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'order_note_create' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_shop_orders' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/orders/(?P<id>\d+)/notes/(?P<note_id>\d+)',
			array(
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'order_note_delete' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_shop_orders' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/orders/(?P<id>\d+)/print',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'order_print' ),
					'permission_callback' => function ( $request ) {
						return Webino_Dashboard_Rest_Base::can_view_order( (int) $request['id'] );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/reports/sales',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'reports_sales' ),
				'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'view_woocommerce_reports' ); },
			)
		);

		register_rest_route(
			self::NS,
			'/shop/reports/orders',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( 'Webino_Dashboard_Order_Reports', 'rest_get' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'view_woocommerce_reports' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/reports/orders/export',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( 'Webino_Dashboard_Order_Reports', 'rest_export_csv' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'view_woocommerce_reports' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/reports/financial',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( 'Webino_Dashboard_Order_Reports', 'rest_financial' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'view_woocommerce_reports' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/reports/revenue',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( 'Webino_Dashboard_Order_Reports', 'rest_revenue' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'view_woocommerce_reports' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/reports/stock',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( 'Webino_Dashboard_Inventory_Reports', 'rest_get' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'view_woocommerce_reports' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/reports/stock/export',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( 'Webino_Dashboard_Inventory_Reports', 'rest_export_csv' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'view_woocommerce_reports' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/reports/(?P<section>products|variations|categories|brands|coupons|taxes|customers|downloads)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( 'Webino_Dashboard_Order_Reports', 'rest_list' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'view_woocommerce_reports' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/reports/(?P<section>overview|revenue|orders|products|variations|categories|brands|coupons|taxes|customers|downloads|sales|financial)/export',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( 'Webino_Dashboard_Order_Reports', 'rest_section_export' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'view_woocommerce_reports' );
					},
				),
			)
		);

		register_rest_route(
			self::NS,
			'/marketing/coupons/bulk',
			array(
				'methods'             => 'POST',
				'callback'            => array( 'Webino_Dashboard_Coupons', 'bulk_action' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_shop_coupons' );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/marketing/coupons/generate-code',
			array(
				'methods'             => 'GET',
				'callback'            => array( 'Webino_Dashboard_Coupons', 'generate_code' ),
				'permission_callback' => function () {
					return Webino_Dashboard_Rest_Base::can( 'edit_shop_coupons' );
				},
			)
		);

		register_rest_route(
			self::NS,
			'/marketing/coupons/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'coupon_get' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_shop_coupons' ); },
				),
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'coupon_patch' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_shop_coupons' ); },
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'coupon_delete' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_shop_coupons' ); },
				),
			)
		);

		register_rest_route(
			self::NS,
			'/marketing/coupons',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'coupon_create' ),
				'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'edit_shop_coupons' ); },
			)
		);

		register_rest_route(
			self::NS,
			'/comments/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'comment_get' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'moderate_comments' ); },
				),
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'comment_patch' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'moderate_comments' ); },
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'comment_delete' ),
					'permission_callback' => function () {
						return Webino_Dashboard_Rest_Base::can( 'moderate_comments' ); },
				),
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function dashboard_home() {
		$recent_posts = array();
		$post_status    = current_user_can( 'edit_posts' ) ? 'any' : 'publish';
		$q              = new WP_Query(
			array(
				'post_type'      => 'post',
				'posts_per_page' => 5,
				'post_status'    => $post_status,
			)
		);
		while ( $q->have_posts() ) {
			$q->the_post();
			$recent_posts[] = array(
				'id'    => get_the_ID(),
				'title' => get_the_title(),
			);
		}
		wp_reset_postdata();

		$orders = array();
		if ( function_exists( 'wc_get_orders' ) && current_user_can( 'edit_shop_orders' ) ) {
			foreach ( wc_get_orders( array( 'limit' => 5, 'orderby' => 'date', 'order' => 'DESC' ) ) as $o ) {
				$orders[] = array(
					'id'     => $o->get_id(),
					'total'  => $o->get_total(),
					'status' => $o->get_status(),
				);
			}
		}

		return new WP_REST_Response(
			array(
				'recent_posts' => $recent_posts,
				'recent_orders'=> $orders,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function post_get( $request ) {
		$p = Webino_Dashboard_Rest_Base::get_post_for_type( (int) $request['id'], 'post' );
		if ( is_wp_error( $p ) ) {
			return $p;
		}
		$cap = 'publish' === $p->post_status ? 'read_post' : 'edit_post';
		$ok  = Webino_Dashboard_Rest_Base::assert_post_cap( $p, $cap );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		return new WP_REST_Response( self::serialize_post( $p ) );
	}

	/**
	 * @param WP_Post $p Post.
	 * @return string
	 */
	private static function post_visibility_from_post( $p ) {
		if ( 'private' === $p->post_status ) {
			return 'private';
		}
		if ( ! empty( $p->post_password ) ) {
			return 'password';
		}
		return 'public';
	}

	/**
	 * @param WP_Post|null $existing Existing post when patching.
	 * @param WP_REST_Request $request Request.
	 * @return array<string,mixed>
	 */
	private static function build_post_args_from_request( $existing, $request ) {
		$args = array();

		$status     = $request->get_param( 'status' );
		$visibility = $request->get_param( 'visibility' );

		if ( null !== $visibility ) {
			$visibility = sanitize_key( (string) $visibility );
			if ( 'private' === $visibility ) {
				$args['post_status']  = 'private';
				$args['post_password'] = '';
			} elseif ( 'password' === $visibility ) {
				$fallback_status = $existing ? $existing->post_status : 'draft';
				$args['post_status'] = sanitize_key( (string) $status ) ?: $fallback_status;
				if ( 'private' === $args['post_status'] ) {
					$args['post_status'] = 'publish';
				}
				$pw = $request->get_param( 'password' );
				if ( null !== $pw && '' !== (string) $pw ) {
					$args['post_password'] = (string) $pw;
				}
			} else {
				$args['post_password'] = '';
				if ( null !== $status ) {
					$args['post_status'] = sanitize_key( (string) $status ) ?: 'draft';
				}
			}
		} elseif ( null !== $status ) {
			$args['post_status'] = sanitize_key( (string) $status ) ?: 'draft';
		}

		$comment_status = $request->get_param( 'comment_status' );
		if ( null !== $comment_status ) {
			$cs = sanitize_key( (string) $comment_status );
			if ( in_array( $cs, array( 'open', 'closed' ), true ) ) {
				$args['comment_status'] = $cs;
			}
		}

		$date = $request->get_param( 'date' );
		if ( null !== $date && '' !== (string) $date ) {
			$ts = strtotime( (string) $date );
			if ( $ts ) {
				$args['post_date']     = wp_date( 'Y-m-d H:i:s', $ts );
				$args['post_date_gmt'] = get_gmt_from_date( $args['post_date'] );
			}
		}

		return $args;
	}

	/**
	 * @param int             $id Post ID.
	 * @param WP_REST_Request $request Request.
	 * @return void
	 */
	private static function apply_post_taxonomy_and_meta( $id, $request ) {
		$cats = $request->get_param( 'categories' );
		if ( is_array( $cats ) ) {
			wp_set_post_categories( $id, array_map( 'intval', $cats ) );
		}

		$tags = $request->get_param( 'tags' );
		if ( is_array( $tags ) ) {
			$names = array_filter(
				array_map(
					static function ( $tag ) {
						return sanitize_text_field( (string) $tag );
					},
					$tags
				)
			);
			wp_set_post_tags( $id, $names, false );
		}

		if ( null !== $request->get_param( 'featured_image_id' ) ) {
			$thumb_id = (int) $request->get_param( 'featured_image_id' );
			if ( $thumb_id > 0 ) {
				set_post_thumbnail( $id, $thumb_id );
			} else {
				delete_post_thumbnail( $id );
			}
		}

		$seo = $request->get_param( 'seo' );
		if ( is_array( $seo ) ) {
			if ( class_exists( 'Webino_Dashboard_AI_Writer', false ) ) {
				Webino_Dashboard_AI_Writer::apply_post_seo( (int) $id, $seo );
			} else {
				self::apply_post_seo_fallback( (int) $id, $seo );
			}
		}
		return true;
	}

	/**
	 * @param int                 $post_id Post ID.
	 * @param array<string,mixed> $seo SEO.
	 * @return void
	 */
	private static function apply_post_seo_fallback( $post_id, $seo ) {
		$map = array(
			'title'                => 'rank_math_title',
			'description'          => 'rank_math_description',
			'focus_keyword'        => 'rank_math_focus_keyword',
			'canonical_url'        => 'rank_math_canonical_url',
			'breadcrumb_title'     => 'rank_math_breadcrumb_title',
			'facebook_title'       => 'rank_math_facebook_title',
			'facebook_description' => 'rank_math_facebook_description',
			'facebook_image'       => 'rank_math_facebook_image',
			'twitter_title'        => 'rank_math_twitter_title',
			'twitter_description'  => 'rank_math_twitter_description',
			'twitter_image'        => 'rank_math_twitter_image',
			'twitter_card_type'    => 'rank_math_twitter_card_type',
			'schema_type'          => 'rank_math_rich_snippet',
		);
		foreach ( $map as $key => $meta ) {
			if ( array_key_exists( $key, $seo ) ) {
				update_post_meta( (int) $post_id, $meta, sanitize_text_field( (string) $seo[ $key ] ) );
			}
		}
		if ( array_key_exists( 'pillar_content', $seo ) ) {
			update_post_meta( (int) $post_id, 'rank_math_pillar_content', ! empty( $seo['pillar_content'] ) ? 'on' : 'off' );
		}
	}

	/**
	 * @param WP_Post $p Post.
	 * @return array<string,mixed>
	 */
	private static function serialize_post( $p ) {
		$thumb_id = (int) get_post_thumbnail_id( $p->ID );
		$tags     = wp_get_post_tags( $p->ID );
		if ( ! is_array( $tags ) ) {
			$tags = array();
		}
		$tag_items = array();
		foreach ( $tags as $t ) {
			$tag_items[] = array(
				'id'   => (int) $t->term_id,
				'name' => $t->name,
			);
		}

		return array(
			'id'                 => (int) $p->ID,
			'title'              => $p->post_title,
			'content'            => $p->post_content,
			'excerpt'            => $p->post_excerpt,
			'status'             => $p->post_status,
			'categories'         => wp_get_post_categories( $p->ID ),
			'tags'               => $tag_items,
			'featured_image_id'  => $thumb_id,
			'featured_image_url' => $thumb_id ? (string) wp_get_attachment_image_url( $thumb_id, 'medium' ) : '',
			'comment_status'     => $p->comment_status,
			'visibility'         => self::post_visibility_from_post( $p ),
			'password'           => '',
			'date'               => mysql2date( 'c', $p->post_date, false ),
			'seo'                => class_exists( 'Webino_Dashboard_AI_Writer', false )
				? Webino_Dashboard_AI_Writer::map_post_seo( (int) $p->ID )
				: self::map_post_seo_fallback( (int) $p->ID ),
			'rank_math_available'=> class_exists( 'RankMath', false ) || defined( 'RANK_MATH_VERSION' ),
		);
	}

	/**
	 * Fallback Rank Math map when AI module is inactive.
	 *
	 * @param int $post_id Post ID.
	 * @return array<string,mixed>
	 */
	private static function map_post_seo_fallback( $post_id ) {
		$id = (int) $post_id;
		return array(
			'title'                => (string) get_post_meta( $id, 'rank_math_title', true ),
			'description'          => (string) get_post_meta( $id, 'rank_math_description', true ),
			'focus_keyword'        => (string) get_post_meta( $id, 'rank_math_focus_keyword', true ),
			'canonical_url'        => (string) get_post_meta( $id, 'rank_math_canonical_url', true ),
			'breadcrumb_title'     => (string) get_post_meta( $id, 'rank_math_breadcrumb_title', true ),
			'pillar_content'       => 'on' === (string) get_post_meta( $id, 'rank_math_pillar_content', true ),
			'facebook_title'       => (string) get_post_meta( $id, 'rank_math_facebook_title', true ),
			'facebook_description' => (string) get_post_meta( $id, 'rank_math_facebook_description', true ),
			'facebook_image'       => (string) get_post_meta( $id, 'rank_math_facebook_image', true ),
			'twitter_title'        => (string) get_post_meta( $id, 'rank_math_twitter_title', true ),
			'twitter_description'  => (string) get_post_meta( $id, 'rank_math_twitter_description', true ),
			'twitter_image'        => (string) get_post_meta( $id, 'rank_math_twitter_image', true ),
			'twitter_card_type'    => (string) get_post_meta( $id, 'rank_math_twitter_card_type', true ) ?: 'summary_large_image',
			'schema_type'          => (string) get_post_meta( $id, 'rank_math_rich_snippet', true ) ?: 'article',
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function post_create( $request ) {
		$insert = array_merge(
			array(
				'post_title'   => sanitize_text_field( (string) $request->get_param( 'title' ) ),
				'post_content' => (string) $request->get_param( 'content' ),
				'post_status'  => sanitize_key( (string) $request->get_param( 'status' ) ) ?: 'draft',
				'post_type'    => 'post',
			),
			self::build_post_args_from_request( null, $request )
		);
		if ( null !== $request->get_param( 'excerpt' ) ) {
			$insert['post_excerpt'] = sanitize_textarea_field( (string) $request->get_param( 'excerpt' ) );
		}
		$id = wp_insert_post( $insert, true );
		if ( is_wp_error( $id ) ) {
			return $id;
		}
		self::apply_post_taxonomy_and_meta( $id, $request );
		return new WP_REST_Response( self::serialize_post( get_post( $id ) ), 201 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function post_patch( $request ) {
		$id = (int) $request['id'];
		$p  = Webino_Dashboard_Rest_Base::get_post_for_type( $id, 'post' );
		if ( is_wp_error( $p ) ) {
			return $p;
		}
		$ok = Webino_Dashboard_Rest_Base::assert_post_cap( $p, 'edit_post' );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$args = array_merge(
			array( 'ID' => $id ),
			self::build_post_args_from_request( $p, $request )
		);
		if ( null !== $request->get_param( 'title' ) ) {
			$args['post_title'] = sanitize_text_field( (string) $request->get_param( 'title' ) );
		}
		if ( null !== $request->get_param( 'content' ) ) {
			$args['post_content'] = (string) $request->get_param( 'content' );
		}
		if ( null !== $request->get_param( 'excerpt' ) ) {
			$args['post_excerpt'] = sanitize_textarea_field( (string) $request->get_param( 'excerpt' ) );
		}
		$updated = wp_update_post( $args, true );
		if ( is_wp_error( $updated ) ) {
			return $updated;
		}
		self::apply_post_taxonomy_and_meta( $id, $request );
		return new WP_REST_Response( self::serialize_post( get_post( $id ) ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function post_delete( $request ) {
		$id = (int) $request['id'];
		$r  = wp_delete_post( $id, true );
		if ( ! $r ) {
			return new WP_Error( 'fail', 'Delete failed', array( 'status' => 400 ) );
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function tags_list() {
		$terms = get_terms(
			array(
				'taxonomy'   => 'post_tag',
				'hide_empty' => false,
				'number'     => 1000,
			)
		);
		if ( is_wp_error( $terms ) ) {
			return new WP_REST_Response( array( 'items' => array() ) );
		}
		$items = array();
		foreach ( $terms as $t ) {
			$items[] = array(
				'id'    => (int) $t->term_id,
				'name'  => $t->name,
				'slug'  => $t->slug,
				'count' => (int) $t->count,
			);
		}
		return new WP_REST_Response( array( 'items' => $items ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function categories_list() {
		$terms = get_terms(
			array(
				'taxonomy'   => 'category',
				'hide_empty' => false,
				'orderby'    => 'name',
				'order'      => 'ASC',
				'number'     => 1000,
			)
		);
		if ( is_wp_error( $terms ) ) {
			return new WP_REST_Response( array( 'items' => array() ) );
		}
		$items = array();
		$with_posts = 0;
		foreach ( $terms as $t ) {
			$link  = get_term_link( $t );
			$count = (int) $t->count;
			if ( $count > 0 ) {
				++$with_posts;
			}
			$items[] = array(
				'id'          => (int) $t->term_id,
				'name'        => $t->name,
				'slug'        => $t->slug,
				'parent'      => (int) $t->parent,
				'description' => $t->description,
				'count'       => $count,
				'url'         => is_wp_error( $link ) ? '' : (string) $link,
				'seo'         => self::map_term_seo_fields( (int) $t->term_id ),
			);
		}
		return new WP_REST_Response(
			array(
				'items' => $items,
				'stats' => array(
					'total'      => count( $items ),
					'with_posts' => $with_posts,
					'empty'      => max( 0, count( $items ) - $with_posts ),
				),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function categories_create( $request ) {
		$args = array(
			'slug'        => sanitize_title( (string) $request->get_param( 'slug' ) ),
			'description' => (string) $request->get_param( 'description' ),
			'parent'      => max( 0, (int) $request->get_param( 'parent' ) ),
		);
		$r = wp_insert_term(
			sanitize_text_field( (string) $request->get_param( 'name' ) ),
			'category',
			$args
		);
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		self::save_term_seo_from_request( (int) $r['term_id'], $request );
		return new WP_REST_Response( array( 'id' => (int) $r['term_id'] ), 201 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function categories_patch( $request ) {
		$id = (int) $request['id'];
		$args = array(
			'name'        => sanitize_text_field( (string) $request->get_param( 'name' ) ),
			'slug'        => sanitize_title( (string) $request->get_param( 'slug' ) ),
			'description' => (string) $request->get_param( 'description' ),
		);
		if ( null !== $request->get_param( 'parent' ) ) {
			$args['parent'] = max( 0, (int) $request->get_param( 'parent' ) );
		}
		$r  = wp_update_term(
			$id,
			'category',
			$args
		);
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		self::save_term_seo_from_request( $id, $request );
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function categories_delete( $request ) {
		$r = wp_delete_term( (int) $request['id'], 'category' );
		if ( is_wp_error( $r ) || ! $r ) {
			return new WP_Error( 'fail', 'Delete failed', array( 'status' => 400 ) );
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * @param int $post_id Page ID.
	 * @return array<string, string>
	 */
	public static function page_action_urls( $post_id ) {
		$post_id = (int) $post_id;
		$urls    = array(
			'url'           => (string) get_permalink( $post_id ),
			'elementor_url' => '',
			'trash_url'     => (string) wp_nonce_url(
				admin_url( 'post.php?post=' . $post_id . '&action=trash' ),
				'trash-post_' . $post_id
			),
		);
		if ( defined( 'ELEMENTOR_VERSION' ) ) {
			$urls['elementor_url'] = admin_url( 'post.php?post=' . $post_id . '&action=elementor' );
		}
		return $urls;
	}

	/**
	 * @param WP_Post $p Page.
	 * @return array<string, mixed>
	 */
	public static function serialize_page_list_item( $p ) {
		$urls = self::page_action_urls( $p->ID );
		return array(
			'id'            => (int) $p->ID,
			'title'         => $p->post_title,
			'status'        => $p->post_status,
			'date'          => mysql2date( 'c', $p->post_date, false ),
			'excerpt'       => $p->post_excerpt,
			'parent'        => (int) $p->post_parent,
			'url'           => $urls['url'],
			'elementor_url' => $urls['elementor_url'],
			'trash_url'     => $urls['trash_url'],
		);
	}

	/**
	 * @param WP_Post $p Page.
	 * @return array<string, mixed>
	 */
	private static function serialize_page( $p ) {
		$thumb_id = (int) get_post_thumbnail_id( $p->ID );
		$urls     = self::page_action_urls( $p->ID );
		return array(
			'id'                 => (int) $p->ID,
			'title'              => $p->post_title,
			'content'            => $p->post_content,
			'excerpt'            => $p->post_excerpt,
			'status'             => $p->post_status,
			'parent'             => (int) $p->post_parent,
			'featured_image_id'  => $thumb_id,
			'featured_image_url' => $thumb_id ? (string) wp_get_attachment_image_url( $thumb_id, 'medium' ) : '',
			'comment_status'     => $p->comment_status,
			'visibility'         => self::post_visibility_from_post( $p ),
			'password'           => '',
			'date'               => mysql2date( 'c', $p->post_date, false ),
			'url'                => $urls['url'],
			'elementor_url'      => $urls['elementor_url'],
			'trash_url'          => $urls['trash_url'],
			'seo'                => class_exists( 'Webino_Dashboard_AI_Writer', false )
				? Webino_Dashboard_AI_Writer::map_post_seo( (int) $p->ID )
				: self::map_post_seo_fallback( (int) $p->ID ),
			'rank_math_available'=> class_exists( 'RankMath', false ) || defined( 'RANK_MATH_VERSION' ),
		);
	}

	/**
	 * @param int             $id Page ID.
	 * @param WP_REST_Request $request Request.
	 * @return true|WP_Error
	 */
	private static function apply_page_meta( $id, $request ) {
		if ( null !== $request->get_param( 'parent' ) ) {
			$parent = (int) $request->get_param( 'parent' );
			$updated = wp_update_post(
				array(
					'ID'          => $id,
					'post_parent' => max( 0, $parent ),
				),
				true
			);
			if ( is_wp_error( $updated ) ) {
				return $updated;
			}
		}

		if ( null !== $request->get_param( 'featured_image_id' ) ) {
			$thumb_id = (int) $request->get_param( 'featured_image_id' );
			if ( $thumb_id > 0 ) {
				set_post_thumbnail( $id, $thumb_id );
			} else {
				delete_post_thumbnail( $id );
			}
		}

		$seo = $request->get_param( 'seo' );
		if ( is_array( $seo ) ) {
			if ( class_exists( 'Webino_Dashboard_AI_Writer', false ) ) {
				Webino_Dashboard_AI_Writer::apply_post_seo( (int) $id, $seo );
			} else {
				self::apply_post_seo_fallback( (int) $id, $seo );
			}
		}
		return true;
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function page_get( $request ) {
		$p = Webino_Dashboard_Rest_Base::get_post_for_type( (int) $request['id'], 'page' );
		if ( is_wp_error( $p ) ) {
			return $p;
		}
		$ok = Webino_Dashboard_Rest_Base::assert_post_cap( $p, 'edit_page' );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		return new WP_REST_Response( self::serialize_page( $p ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function page_create( $request ) {
		$insert = array_merge(
			array(
				'post_title'   => sanitize_text_field( (string) $request->get_param( 'title' ) ),
				'post_content' => (string) $request->get_param( 'content' ),
				'post_status'  => sanitize_key( (string) $request->get_param( 'status' ) ) ?: 'draft',
				'post_type'    => 'page',
			),
			self::build_post_args_from_request( null, $request )
		);
		if ( null !== $request->get_param( 'excerpt' ) ) {
			$insert['post_excerpt'] = sanitize_textarea_field( (string) $request->get_param( 'excerpt' ) );
		}
		if ( null !== $request->get_param( 'parent' ) ) {
			$insert['post_parent'] = max( 0, (int) $request->get_param( 'parent' ) );
		}
		$id = wp_insert_post( $insert, true );
		if ( is_wp_error( $id ) ) {
			return $id;
		}
		$meta_err = self::apply_page_meta( (int) $id, $request );
		if ( is_wp_error( $meta_err ) ) {
			return $meta_err;
		}
		return new WP_REST_Response( self::serialize_page( get_post( $id ) ), 201 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function page_patch( $request ) {
		$id = (int) $request['id'];
		$p  = Webino_Dashboard_Rest_Base::get_post_for_type( $id, 'page' );
		if ( is_wp_error( $p ) ) {
			return $p;
		}
		$ok = Webino_Dashboard_Rest_Base::assert_post_cap( $p, 'edit_page' );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$args = array_merge(
			array( 'ID' => $id ),
			self::build_post_args_from_request( $p, $request )
		);
		if ( null !== $request->get_param( 'title' ) ) {
			$args['post_title'] = sanitize_text_field( (string) $request->get_param( 'title' ) );
		}
		if ( null !== $request->get_param( 'content' ) ) {
			$args['post_content'] = (string) $request->get_param( 'content' );
		}
		if ( null !== $request->get_param( 'excerpt' ) ) {
			$args['post_excerpt'] = sanitize_textarea_field( (string) $request->get_param( 'excerpt' ) );
		}
		if ( null !== $request->get_param( 'parent' ) ) {
			$args['post_parent'] = max( 0, (int) $request->get_param( 'parent' ) );
		}
		$r = wp_update_post( $args, true );
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		$meta_err = self::apply_page_meta( $id, $request );
		if ( is_wp_error( $meta_err ) ) {
			return $meta_err;
		}
		return new WP_REST_Response( self::serialize_page( get_post( $id ) ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function page_delete( $request ) {
		$id = (int) $request['id'];
		$p  = Webino_Dashboard_Rest_Base::get_post_for_type( $id, 'page' );
		if ( is_wp_error( $p ) ) {
			return $p;
		}
		$ok = Webino_Dashboard_Rest_Base::assert_post_cap( $p, 'delete_page' );
		if ( is_wp_error( $ok ) ) {
			return $ok;
		}
		$r = wp_delete_post( $id, true );
		if ( ! $r ) {
			return new WP_Error( 'fail', __( 'Delete failed.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function media_upload( $request ) {
		if ( empty( $_FILES['file'] ) ) {
			return new WP_Error( 'no_file', __( 'No file uploaded.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		$aid = media_handle_upload( 'file', 0 );
		if ( is_wp_error( $aid ) ) {
			return $aid;
		}
		self::apply_media_term_assignments( (int) $aid, $request, true );
		return new WP_REST_Response(
			array(
				'id'  => (int) $aid,
				'url' => (string) wp_get_attachment_url( (int) $aid ),
			),
			201
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function media_delete( $request ) {
		if ( ! wp_delete_attachment( (int) $request['id'], true ) ) {
			return new WP_Error( 'fail', 'Delete failed', array( 'status' => 400 ) );
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * Assign media categories / folder to an attachment.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function media_patch( $request ) {
		$id = (int) $request['id'];
		if ( ! get_post( $id ) || 'attachment' !== get_post_type( $id ) ) {
			return new WP_Error( 'not_found', __( 'Attachment not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}

		$post_update = array( 'ID' => $id );
		$has_update  = false;

		if ( null !== $request->get_param( 'title' ) ) {
			$post_update['post_title'] = sanitize_text_field( (string) $request->get_param( 'title' ) );
			$has_update                = true;
		}
		if ( null !== $request->get_param( 'slug' ) ) {
			$post_update['post_name'] = sanitize_title( (string) $request->get_param( 'slug' ) );
			$has_update               = true;
		}
		if ( null !== $request->get_param( 'caption' ) ) {
			$post_update['post_excerpt'] = sanitize_textarea_field( (string) $request->get_param( 'caption' ) );
			$has_update                  = true;
		}
		if ( null !== $request->get_param( 'description' ) ) {
			$post_update['post_content'] = sanitize_textarea_field( (string) $request->get_param( 'description' ) );
			$has_update                  = true;
		}
		if ( $has_update ) {
			$r = wp_update_post( $post_update, true );
			if ( is_wp_error( $r ) ) {
				return $r;
			}
		}

		if ( null !== $request->get_param( 'alt_text' ) ) {
			update_post_meta( $id, '_wp_attachment_image_alt', sanitize_text_field( (string) $request->get_param( 'alt_text' ) ) );
		}

		self::apply_media_term_assignments( $id, $request );

		return new WP_REST_Response( self::serialize_media_attachment( $id ) );
	}

	/**
	 * Assign folder/category/tag terms from request params.
	 *
	 * @param int             $id          Attachment ID.
	 * @param WP_REST_Request $request     Request.
	 * @param bool            $from_upload Whether this is a multipart upload.
	 * @return void
	 */
	private static function apply_media_term_assignments( $id, $request, $from_upload = false ) {
		$cats = $request->get_param( 'category_ids' );
		if ( ! is_array( $cats ) && $from_upload && ! empty( $_POST['category_ids'] ) ) {
			$decoded = json_decode( wp_unslash( (string) $_POST['category_ids'] ), true );
			if ( is_array( $decoded ) ) {
				$cats = $decoded;
			}
		}
		if ( is_array( $cats ) && taxonomy_exists( 'webino_media_category' ) ) {
			$ids = array_values( array_filter( array_map( 'intval', $cats ) ) );
			wp_set_object_terms( $id, $ids, 'webino_media_category', false );
		}

		$has_folder = null !== $request->get_param( 'folder_id' );
		$fid        = $request->get_param( 'folder_id' );
		if ( ! $has_folder && $from_upload && isset( $_POST['folder_id'] ) ) {
			$has_folder = true;
			$fid        = sanitize_text_field( wp_unslash( (string) $_POST['folder_id'] ) );
		}
		if ( $has_folder && taxonomy_exists( 'webino_media_folder' ) ) {
			if ( null === $fid || '' === $fid ) {
				wp_set_object_terms( $id, array(), 'webino_media_folder', false );
			} else {
				$fid = (int) $fid;
				if ( $fid > 0 ) {
					wp_set_object_terms( $id, array( $fid ), 'webino_media_folder', false );
				}
			}
		}

		$tags = $request->get_param( 'tag_ids' );
		if ( ! is_array( $tags ) && $from_upload && ! empty( $_POST['tag_ids'] ) ) {
			$decoded = json_decode( wp_unslash( (string) $_POST['tag_ids'] ), true );
			if ( is_array( $decoded ) ) {
				$tags = $decoded;
			}
		}
		if ( is_array( $tags ) && taxonomy_exists( 'webino_media_tag' ) ) {
			$ids = array_values( array_filter( array_map( 'intval', $tags ) ) );
			wp_set_object_terms( $id, $ids, 'webino_media_tag', false );
		}
	}

	/**
	 * Serialize attachment for API responses.
	 *
	 * @param int $aid Attachment ID.
	 * @return array<string, mixed>
	 */
	public static function serialize_media_attachment( $aid ) {
		$post = get_post( $aid );
		if ( ! $post || 'attachment' !== $post->post_type ) {
			return array();
		}

		$cats  = taxonomy_exists( 'webino_media_category' )
			? wp_get_post_terms( $aid, 'webino_media_category', array( 'fields' => 'all' ) ) : array();
		$folds = taxonomy_exists( 'webino_media_folder' )
			? wp_get_post_terms( $aid, 'webino_media_folder', array( 'fields' => 'all' ) ) : array();
		$tags  = taxonomy_exists( 'webino_media_tag' )
			? wp_get_post_terms( $aid, 'webino_media_tag', array( 'fields' => 'all' ) ) : array();
		if ( is_wp_error( $cats ) ) {
			$cats = array();
		}
		if ( is_wp_error( $folds ) ) {
			$folds = array();
		}
		if ( is_wp_error( $tags ) ) {
			$tags = array();
		}

		return array(
			'id'          => (int) $aid,
			'title'       => get_the_title( $aid ),
			'slug'        => $post->post_name,
			'url'         => wp_get_attachment_url( $aid ),
			'mime'        => get_post_mime_type( $aid ),
			'caption'     => $post->post_excerpt,
			'description' => $post->post_content,
			'alt_text'    => (string) get_post_meta( $aid, '_wp_attachment_image_alt', true ),
			'categories'  => array_map( array( __CLASS__, 'serialize_media_term' ), $cats ),
			'folders'     => array_map( array( __CLASS__, 'serialize_media_term' ), $folds ),
			'tags'        => array_map( array( __CLASS__, 'serialize_media_term' ), $tags ),
		);
	}

	/**
	 * @param WP_Term $term Term.
	 * @return array<string, mixed>
	 */
	public static function serialize_media_term( $term ) {
		return array(
			'id'          => (int) $term->term_id,
			'name'        => $term->name,
			'slug'        => $term->slug,
			'parent'      => (int) $term->parent,
			'description' => $term->description,
			'count'       => (int) $term->count,
		);
	}

	/**
	 * Resolve taxonomy slug from media term kind.
	 *
	 * @param string $kind folder|category|tag.
	 * @return string
	 */
	private static function media_term_taxonomy( $kind ) {
		if ( 'folder' === $kind ) {
			return 'webino_media_folder';
		}
		if ( 'category' === $kind ) {
			return 'webino_media_category';
		}
		if ( 'tag' === $kind ) {
			return 'webino_media_tag';
		}
		return '';
	}

	/**
	 * List media category + folder terms.
	 *
	 * @return WP_REST_Response
	 */
	public static function media_terms_list() {
		$categories = array();
		$folders    = array();
		$tags       = array();

		if ( taxonomy_exists( 'webino_media_category' ) ) {
			$terms = get_terms( array( 'taxonomy' => 'webino_media_category', 'hide_empty' => false ) );
			if ( ! is_wp_error( $terms ) ) {
				foreach ( $terms as $t ) {
					$categories[] = self::serialize_media_term( $t );
				}
			}
		}
		if ( taxonomy_exists( 'webino_media_folder' ) ) {
			$terms = get_terms(
				array(
					'taxonomy'   => 'webino_media_folder',
					'hide_empty' => false,
				)
			);
			if ( ! is_wp_error( $terms ) ) {
				foreach ( $terms as $t ) {
					$folders[] = self::serialize_media_term( $t );
				}
			}
		}
		if ( taxonomy_exists( 'webino_media_tag' ) ) {
			$terms = get_terms(
				array(
					'taxonomy'   => 'webino_media_tag',
					'hide_empty' => false,
				)
			);
			if ( ! is_wp_error( $terms ) ) {
				foreach ( $terms as $t ) {
					$tags[] = self::serialize_media_term( $t );
				}
			}
		}
		return new WP_REST_Response(
			array(
				'categories' => $categories,
				'folders'    => $folders,
				'tags'       => $tags,
			)
		);
	}

	/**
	 * Create a media category or folder term.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function media_terms_create( $request ) {
		$kind        = sanitize_key( (string) $request->get_param( 'kind' ) );
		$name        = sanitize_text_field( (string) $request->get_param( 'name' ) );
		$parent      = (int) $request->get_param( 'parent' );
		$slug        = sanitize_title( (string) $request->get_param( 'slug' ) );
		$description = sanitize_textarea_field( (string) $request->get_param( 'description' ) );
		if ( '' === $name ) {
			return new WP_Error( 'invalid', __( 'Name required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$taxonomy = self::media_term_taxonomy( $kind );
		if ( '' === $taxonomy || ! taxonomy_exists( $taxonomy ) ) {
			return new WP_Error( 'invalid', __( 'kind must be folder, category, or tag.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$args = array();
		if ( '' !== $slug ) {
			$args['slug'] = $slug;
		} else {
			$args['slug'] = sanitize_title( $name );
		}
		if ( '' !== $description ) {
			$args['description'] = $description;
		}
		if ( 'tag' !== $kind && $parent > 0 ) {
			$args['parent'] = $parent;
		}

		$r = wp_insert_term( $name, $taxonomy, $args );
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		$term = get_term( (int) $r['term_id'], $taxonomy );
		return new WP_REST_Response( self::serialize_media_term( $term ), 201 );
	}

	/**
	 * Update a media term.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function media_terms_patch( $request ) {
		$kind     = sanitize_key( (string) $request->get_param( 'kind' ) );
		$term_id  = (int) $request['id'];
		$taxonomy = self::media_term_taxonomy( $kind );
		if ( '' === $taxonomy ) {
			return new WP_Error( 'invalid', __( 'kind must be folder, category, or tag.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$term = get_term( $term_id, $taxonomy );
		if ( ! $term || is_wp_error( $term ) ) {
			return new WP_Error( 'not_found', __( 'Term not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}

		$args = array();
		if ( null !== $request->get_param( 'name' ) ) {
			$args['name'] = sanitize_text_field( (string) $request->get_param( 'name' ) );
		}
		if ( null !== $request->get_param( 'slug' ) ) {
			$args['slug'] = sanitize_title( (string) $request->get_param( 'slug' ) );
		}
		if ( null !== $request->get_param( 'description' ) ) {
			$args['description'] = sanitize_textarea_field( (string) $request->get_param( 'description' ) );
		}
		if ( 'tag' !== $kind && null !== $request->get_param( 'parent' ) ) {
			$args['parent'] = (int) $request->get_param( 'parent' );
		}
		if ( array() === $args ) {
			return new WP_REST_Response( self::serialize_media_term( $term ) );
		}

		$r = wp_update_term( $term_id, $taxonomy, $args );
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		$updated = get_term( $term_id, $taxonomy );
		return new WP_REST_Response( self::serialize_media_term( $updated ) );
	}

	/**
	 * Delete a media term.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function media_terms_delete( $request ) {
		$kind     = sanitize_key( (string) $request->get_param( 'kind' ) );
		$term_id  = (int) $request['id'];
		$taxonomy = self::media_term_taxonomy( $kind );
		if ( '' === $taxonomy ) {
			return new WP_Error( 'invalid', __( 'kind must be folder, category, or tag.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$term = get_term( $term_id, $taxonomy );
		if ( ! $term || is_wp_error( $term ) ) {
			return new WP_Error( 'not_found', __( 'Term not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$r = wp_delete_term( $term_id, $taxonomy );
		if ( is_wp_error( $r ) || ! $r ) {
			return new WP_Error( 'fail', __( 'Delete failed.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * @param WP_Term                $t            Term.
	 * @param array<int,string>|null $parent_names Optional id => name map.
	 * @return array<string,mixed>
	 */
	private static function map_product_category_item( $t, $parent_names = null ) {
		$id       = (int) $t->term_id;
		$thumb_id = (int) get_term_meta( $id, 'thumbnail_id', true );

		$views_raw = get_term_meta( $id, 'post_views_count', true );
		if ( '' === $views_raw || false === $views_raw ) {
			$views_raw = get_term_meta( $id, 'views', true );
		}
		$views = ( '' !== $views_raw && false !== $views_raw ) ? (int) $views_raw : null;

		$parent = (int) $t->parent;
		$parent_name = '';
		if ( $parent > 0 ) {
			if ( is_array( $parent_names ) && isset( $parent_names[ $parent ] ) ) {
				$parent_name = $parent_names[ $parent ];
			} else {
				$pterm = get_term( $parent, 'product_cat' );
				$parent_name = ( $pterm && ! is_wp_error( $pterm ) ) ? $pterm->name : '';
			}
		}

		$link = get_term_link( $t );

		$item = array(
			'id'            => $id,
			'name'          => $t->name,
			'slug'          => $t->slug,
			'description'   => $t->description,
			'parent'        => $parent,
			'parent_name'   => $parent_name,
			'count'         => (int) $t->count,
			'thumbnail_id'  => $thumb_id > 0 ? $thumb_id : null,
			'thumbnail_url' => $thumb_id > 0 ? (string) wp_get_attachment_image_url( $thumb_id, 'thumbnail' ) : '',
			'views'         => $views,
			'url'           => is_wp_error( $link ) ? '' : (string) $link,
			'seo'           => self::map_term_seo_fields( $id ),
		);
		return $item;
	}

	/**
	 * Rank Math term meta for brand/category editors.
	 *
	 * @param int $term_id Term ID.
	 * @return array<string,mixed>
	 */
	private static function map_term_seo_fields( $term_id ) {
		if ( class_exists( 'Webino_Dashboard_AI_Writer', false ) ) {
			return Webino_Dashboard_AI_Writer::map_term_seo( (int) $term_id );
		}
		$id = (int) $term_id;
		return array(
			'title'                => (string) get_term_meta( $id, 'rank_math_title', true ),
			'description'          => (string) get_term_meta( $id, 'rank_math_description', true ),
			'focus_keyword'        => (string) get_term_meta( $id, 'rank_math_focus_keyword', true ),
			'facebook_title'       => (string) get_term_meta( $id, 'rank_math_facebook_title', true ),
			'facebook_description' => (string) get_term_meta( $id, 'rank_math_facebook_description', true ),
			'schema_type'          => (string) get_term_meta( $id, 'rank_math_rich_snippet', true ) ?: 'collectionpage',
		);
	}

	/**
	 * @param int             $term_id Term ID.
	 * @param WP_REST_Request $request Request.
	 * @return void
	 */
	private static function save_term_seo_from_request( $term_id, $request ) {
		$seo = $request->get_param( 'seo' );
		if ( ! is_array( $seo ) ) {
			return;
		}
		if ( class_exists( 'Webino_Dashboard_AI_Writer', false ) ) {
			Webino_Dashboard_AI_Writer::apply_term_seo( (int) $term_id, $seo );
			return;
		}
		$map = array(
			'title'                => 'rank_math_title',
			'description'          => 'rank_math_description',
			'focus_keyword'        => 'rank_math_focus_keyword',
			'facebook_title'       => 'rank_math_facebook_title',
			'facebook_description' => 'rank_math_facebook_description',
			'schema_type'          => 'rank_math_rich_snippet',
		);
		foreach ( $map as $key => $meta ) {
			if ( array_key_exists( $key, $seo ) ) {
				update_term_meta( (int) $term_id, $meta, sanitize_text_field( (string) $seo[ $key ] ) );
			}
		}
	}

	/**
	 * @param array<string,mixed> $a Item A.
	 * @param array<string,mixed> $b Item B.
	 * @param string              $sort Sort key.
	 * @return int
	 */
	private static function compare_product_category_items( $a, $b, $sort ) {
		switch ( $sort ) {
			case 'name_desc':
				return strcasecmp( (string) $b['name'], (string) $a['name'] );
			case 'count_desc':
				return ( (int) $b['count'] ) <=> ( (int) $a['count'] );
			case 'count_asc':
				return ( (int) $a['count'] ) <=> ( (int) $b['count'] );
			case 'name_asc':
			default:
				return strcasecmp( (string) $a['name'], (string) $b['name'] );
		}
	}

	/**
	 * @param int                  $term_id Term ID.
	 * @param WP_REST_Request|null $request Request for thumbnail_id.
	 * @return void
	 */
	private static function product_categories_save_thumbnail_meta( $term_id, $request ) {
		if ( ! $request || null === $request->get_param( 'thumbnail_id' ) ) {
			return;
		}
		$thumb_id = max( 0, (int) $request->get_param( 'thumbnail_id' ) );
		if ( $thumb_id > 0 ) {
			update_term_meta( $term_id, 'thumbnail_id', $thumb_id );
		} else {
			delete_term_meta( $term_id, 'thumbnail_id' );
		}
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function product_categories_list( $request ) {
		if ( ! taxonomy_exists( 'product_cat' ) ) {
			return new WP_REST_Response( array( 'items' => array(), 'found' => 0 ) );
		}
		$terms = get_terms(
			array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => false,
			)
		);
		if ( is_wp_error( $terms ) ) {
			return new WP_REST_Response( array( 'items' => array(), 'found' => 0 ) );
		}

		$search = sanitize_text_field( (string) $request->get_param( 'search' ) );
		$sort   = sanitize_key( (string) ( $request->get_param( 'sort' ) ?: 'name_asc' ) );
		$parent_param = $request->get_param( 'parent' );
		$has_parent_filter = null !== $parent_param && '' !== (string) $parent_param;
		$parent_filter = $has_parent_filter ? (int) $parent_param : null;

		$parent_names = array();
		foreach ( $terms as $t ) {
			$parent_names[ (int) $t->term_id ] = $t->name;
		}

		$items = array();
		foreach ( $terms as $t ) {
			if ( '' !== $search ) {
				$hay = strtolower( $t->name . ' ' . $t->slug );
				if ( false === strpos( $hay, strtolower( $search ) ) ) {
					continue;
				}
			}
			if ( $has_parent_filter && (int) $t->parent !== $parent_filter ) {
				continue;
			}
			$items[] = self::map_product_category_item( $t, $parent_names );
		}

		usort(
			$items,
			function ( $a, $b ) use ( $sort ) {
				return self::compare_product_category_items( $a, $b, $sort );
			}
		);

		return new WP_REST_Response(
			array(
				'items' => $items,
				'found' => count( $items ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_category_get( $request ) {
		if ( ! taxonomy_exists( 'product_cat' ) ) {
			return new WP_Error( 'no_tax', __( 'Taxonomy missing.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$t = get_term( (int) $request['id'], 'product_cat' );
		if ( ! $t || is_wp_error( $t ) ) {
			return new WP_Error( 'not_found', __( 'Category not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response( self::map_product_category_item( $t ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_category_create( $request ) {
		if ( ! taxonomy_exists( 'product_cat' ) ) {
			return new WP_Error( 'no_tax', __( 'Taxonomy missing.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$name = sanitize_text_field( (string) $request->get_param( 'name' ) );
		if ( '' === $name ) {
			return new WP_Error( 'invalid', __( 'Name required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$slug   = sanitize_title( (string) ( $request->get_param( 'slug' ) ?: $name ) );
		$parent = max( 0, (int) $request->get_param( 'parent' ) );
		$args   = array(
			'slug'        => $slug,
			'description' => (string) $request->get_param( 'description' ),
		);
		if ( $parent > 0 ) {
			$args['parent'] = $parent;
		}
		$r = wp_insert_term( $name, 'product_cat', $args );
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		$term_id = (int) $r['term_id'];
		self::product_categories_save_thumbnail_meta( $term_id, $request );
		self::save_term_seo_from_request( $term_id, $request );
		$t = get_term( $term_id, 'product_cat' );
		return new WP_REST_Response(
			array(
				'id'   => $term_id,
				'item' => ( $t && ! is_wp_error( $t ) ) ? self::map_product_category_item( $t ) : null,
			),
			201
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_category_patch( $request ) {
		if ( ! taxonomy_exists( 'product_cat' ) ) {
			return new WP_Error( 'no_tax', __( 'Taxonomy missing.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$id = (int) $request['id'];
		if ( ! get_term( $id, 'product_cat' ) ) {
			return new WP_Error( 'not_found', __( 'Category not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$args = array();
		if ( null !== $request->get_param( 'name' ) ) {
			$args['name'] = sanitize_text_field( (string) $request->get_param( 'name' ) );
		}
		if ( null !== $request->get_param( 'slug' ) ) {
			$args['slug'] = sanitize_title( (string) $request->get_param( 'slug' ) );
		}
		if ( null !== $request->get_param( 'description' ) ) {
			$args['description'] = (string) $request->get_param( 'description' );
		}
		if ( null !== $request->get_param( 'parent' ) ) {
			$args['parent'] = max( 0, (int) $request->get_param( 'parent' ) );
		}
		if ( array() !== $args ) {
			$r = wp_update_term( $id, 'product_cat', $args );
			if ( is_wp_error( $r ) ) {
				return $r;
			}
		}
		self::product_categories_save_thumbnail_meta( $id, $request );
		self::save_term_seo_from_request( $id, $request );
		$t = get_term( $id, 'product_cat' );
		return new WP_REST_Response(
			array(
				'ok'   => true,
				'item' => ( $t && ! is_wp_error( $t ) ) ? self::map_product_category_item( $t ) : null,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_category_delete( $request ) {
		if ( ! taxonomy_exists( 'product_cat' ) ) {
			return new WP_Error( 'no_tax', __( 'Taxonomy missing.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$id = (int) $request['id'];
		$r   = wp_delete_term( $id, 'product_cat' );
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		if ( ! $r ) {
			return new WP_Error( 'not_found', __( 'Term not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * @param object|array|int $attr Attribute row or ID.
	 * @return array<string,mixed>
	 */
	public static function map_global_attribute_item( $attr ) {
		$row = null;
		if ( is_numeric( $attr ) && function_exists( 'wc_get_attribute' ) ) {
			$row = wc_get_attribute( (int) $attr );
		} elseif ( is_object( $attr ) ) {
			$row = $attr;
		} elseif ( is_array( $attr ) ) {
			$row = (object) $attr;
		}
		if ( ! $row ) {
			return array();
		}
		$id   = isset( $row->id ) ? (int) $row->id : ( isset( $row->attribute_id ) ? (int) $row->attribute_id : 0 );
		$slug = isset( $row->slug ) ? (string) $row->slug : ( isset( $row->attribute_name ) ? (string) $row->attribute_name : '' );
		$type = isset( $row->type ) ? (string) $row->type : ( isset( $row->attribute_type ) ? (string) $row->attribute_type : 'select' );
		$label = isset( $row->name ) ? (string) $row->name : ( isset( $row->attribute_label ) ? (string) $row->attribute_label : $slug );
		$order_by = isset( $row->order_by ) ? (string) $row->order_by : ( isset( $row->attribute_orderby ) ? (string) $row->attribute_orderby : 'menu_order' );
		$has_archives = isset( $row->has_archives ) ? (bool) $row->has_archives : ( isset( $row->attribute_public ) ? (bool) (int) $row->attribute_public : false );
		$taxonomy     = self::resolve_attribute_taxonomy( $id, $slug );
		$term_count   = 0;
		if ( $taxonomy && taxonomy_exists( $taxonomy ) ) {
			$count = wp_count_terms(
				array(
					'taxonomy'   => $taxonomy,
					'hide_empty' => false,
				)
			);
			$term_count = is_wp_error( $count ) ? 0 : (int) $count;
		}
		$show_label = true;
		if ( class_exists( 'Webino_Dashboard_Variation_Swatches', false ) ) {
			$show_label = Webino_Dashboard_Variation_Swatches::show_swatch_label( $id );
		}
		return array(
			'id'                => $id,
			'label'             => $label,
			'slug'              => $slug,
			'type'              => self::sanitize_attribute_type( $type ),
			'order_by'          => $order_by,
			'has_archives'      => $has_archives,
			'show_swatch_label' => $show_label,
			'taxonomy'          => $taxonomy,
			'term_count'        => $term_count,
		);
	}

	/**
	 * @param int             $attribute_id Attribute ID.
	 * @param WP_REST_Request $request Request.
	 * @return void
	 */
	private static function maybe_save_show_swatch_label( $attribute_id, $request ) {
		if ( null === $request->get_param( 'show_swatch_label' ) ) {
			return;
		}
		if ( ! class_exists( 'Webino_Dashboard_Variation_Swatches', false ) ) {
			return;
		}
		Webino_Dashboard_Variation_Swatches::set_show_swatch_label(
			(int) $attribute_id,
			(bool) rest_sanitize_boolean( $request->get_param( 'show_swatch_label' ) )
		);
	}

	/**
	 * @param string $type Attribute type.
	 * @return string
	 */
	private static function sanitize_attribute_type( $type ) {
		$type = sanitize_key( (string) $type );
		// YITH WooCommerce Color and Label Swatches aliases.
		if ( 'colorpicker' === $type ) {
			$type = 'color';
		} elseif ( in_array( $type, array( 'label', 'radio' ), true ) ) {
			$type = 'button';
		}
		$allowed = array( 'select', 'text', 'color', 'image', 'button' );
		return in_array( $type, $allowed, true ) ? $type : 'select';
	}

	/**
	 * Persist type using YITH-registered keys when available.
	 *
	 * @param string $type Sanitized dashboard type.
	 * @return string
	 */
	private static function to_wc_attribute_type( $type ) {
		$type  = self::sanitize_attribute_type( $type );
		$types = function_exists( 'wc_get_attribute_types' ) ? wc_get_attribute_types() : array();
		if ( ! is_array( $types ) ) {
			$types = array();
		}
		if ( 'color' === $type && isset( $types['colorpicker'] ) ) {
			return 'colorpicker';
		}
		if ( 'button' === $type && isset( $types['label'] ) && ! isset( $types['button'] ) ) {
			return 'label';
		}
		return $type;
	}

	/**
	 * Resolve WooCommerce attribute taxonomy name (never invent empty pa_*).
	 *
	 * @param int    $attr_id Attribute ID.
	 * @param string $slug    Raw slug from attribute row.
	 * @return string
	 */
	private static function resolve_attribute_taxonomy( $attr_id, $slug = '' ) {
		$attr_id = (int) $attr_id;
		if ( $attr_id > 0 && function_exists( 'wc_attribute_taxonomy_name_by_id' ) ) {
			$tax = wc_attribute_taxonomy_name_by_id( $attr_id );
			if ( is_string( $tax ) && '' !== $tax ) {
				return $tax;
			}
		}
		$slug = (string) $slug;
		if ( 0 === strpos( $slug, 'pa_' ) ) {
			$slug = substr( $slug, 3 );
		}
		$slug = function_exists( 'wc_sanitize_taxonomy_name' )
			? wc_sanitize_taxonomy_name( $slug )
			: sanitize_title( $slug );
		if ( '' === $slug ) {
			return '';
		}
		if ( function_exists( 'wc_attribute_taxonomy_name' ) ) {
			return wc_attribute_taxonomy_name( $slug );
		}
		return 'pa_' . $slug;
	}

	/**
	 * Normalize YITH / hex color meta to #RRGGBB (first swatch if bicolor).
	 *
	 * @param mixed $raw Raw meta.
	 * @return string
	 */
	private static function normalize_attribute_hex_color( $raw ) {
		if ( ! is_string( $raw ) || '' === trim( $raw ) ) {
			return '';
		}
		$part = trim( explode( ',', $raw )[0] );
		if ( '' === $part ) {
			return '';
		}
		if ( '#' !== substr( $part, 0, 1 ) ) {
			$part = '#' . $part;
		}
		$san = sanitize_hex_color( $part );
		if ( $san ) {
			return $san;
		}
		// 3-digit hex without expansion by sanitize_hex_color in some WP versions.
		if ( preg_match( '/^#([0-9a-fA-F]{3})$/', $part, $m ) ) {
			$h = $m[1];
			$expanded = '#' . $h[0] . $h[0] . $h[1] . $h[1] . $h[2] . $h[2];
			$san = sanitize_hex_color( $expanded );
			return $san ? $san : '';
		}
		return '';
	}

	/**
	 * @param int $attr_id Attribute ID.
	 * @return array{taxonomy:string,type:string}|WP_Error
	 */
	private static function global_attribute_context( $attr_id ) {
		if ( ! function_exists( 'wc_get_attribute' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$attr = wc_get_attribute( $attr_id );
		if ( ! $attr ) {
			return new WP_Error( 'not_found', __( 'Attribute not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$slug = isset( $attr->slug ) ? (string) $attr->slug : '';
		if ( '' === $slug ) {
			return new WP_Error( 'invalid', __( 'Attribute slug missing.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$taxonomy = self::resolve_attribute_taxonomy( (int) $attr_id, $slug );
		if ( '' === $taxonomy ) {
			return new WP_Error( 'invalid', __( 'Attribute taxonomy missing.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( ! taxonomy_exists( $taxonomy ) && function_exists( 'wc_attribute_taxonomy_name' ) ) {
			// Ensure taxonomy is registered for this request (WC usually does this on init).
			$label = isset( $attr->name ) ? (string) $attr->name : $slug;
			register_taxonomy(
				$taxonomy,
				apply_filters( 'woocommerce_taxonomy_objects_' . $taxonomy, array( 'product' ) ),
				apply_filters(
					'woocommerce_taxonomy_args_' . $taxonomy,
					array(
						'labels'       => array( 'name' => $label ),
						'hierarchical' => false,
						'show_ui'      => false,
						'query_var'    => true,
						'rewrite'      => false,
					)
				)
			);
		}
		$type = isset( $attr->type ) ? (string) $attr->type : 'select';
		return array(
			'taxonomy' => $taxonomy,
			'type'     => self::sanitize_attribute_type( $type ),
		);
	}

	/**
	 * @param WP_Term   $term Term.
	 * @param string    $attr_type Attribute type.
	 * @return array<string,mixed>
	 */
	private static function map_global_attribute_term_item( $term, $attr_type ) {
		$item = array(
			'id'          => (int) $term->term_id,
			'name'        => $term->name,
			'slug'        => $term->slug,
			'description' => $term->description,
			'menu_order'  => (int) get_term_meta( $term->term_id, 'order', true ),
			'count'       => (int) $term->count,
		);
		if ( 'color' === $attr_type ) {
			$color = get_term_meta( $term->term_id, 'product_attribute_color', true );
			if ( '' === $color || false === $color ) {
				$color = get_term_meta( $term->term_id, 'yith_wccl_value', true );
			}
			if ( '' === $color || false === $color ) {
				$color = get_term_meta( $term->term_id, 'ishop_attribute_color', true );
			}
			if ( '' === $color || false === $color ) {
				$color = get_term_meta( $term->term_id, 'color', true );
			}
			$item['color'] = self::normalize_attribute_hex_color( is_string( $color ) ? $color : '' );
		}
		if ( 'image' === $attr_type ) {
			$image_id = (int) get_term_meta( $term->term_id, 'product_attribute_image', true );
			if ( $image_id <= 0 ) {
				$yith = get_term_meta( $term->term_id, 'yith_wccl_value', true );
				if ( is_numeric( $yith ) ) {
					$image_id = (int) $yith;
				} elseif ( is_string( $yith ) && '' !== $yith ) {
					$image_id = (int) attachment_url_to_postid( $yith );
				}
			}
			$item['image_id']  = $image_id;
			$item['image_url'] = $image_id > 0 ? (string) wp_get_attachment_image_url( $image_id, 'thumbnail' ) : '';
		}
		return $item;
	}

	/**
	 * @param int                 $term_id Term ID.
	 * @param string              $attr_type Attribute type.
	 * @param array<string,mixed> $params Request params.
	 * @return void
	 */
	private static function save_global_attribute_term_meta( $term_id, $attr_type, $params ) {
		if ( 'color' === $attr_type && null !== ( $params['color'] ?? null ) ) {
			$color = self::normalize_attribute_hex_color( (string) $params['color'] );
			if ( $color ) {
				update_term_meta( $term_id, 'product_attribute_color', $color );
				update_term_meta( $term_id, 'yith_wccl_value', $color );
				update_term_meta( $term_id, 'ishop_attribute_color', $color );
			} else {
				delete_term_meta( $term_id, 'product_attribute_color' );
				delete_term_meta( $term_id, 'yith_wccl_value' );
				delete_term_meta( $term_id, 'ishop_attribute_color' );
			}
		}
		if ( 'image' === $attr_type && null !== ( $params['image_id'] ?? null ) ) {
			$image_id = absint( $params['image_id'] );
			if ( $image_id > 0 ) {
				update_term_meta( $term_id, 'product_attribute_image', $image_id );
				$url = (string) wp_get_attachment_url( $image_id );
				if ( $url ) {
					update_term_meta( $term_id, 'yith_wccl_value', $url );
				}
			} else {
				delete_term_meta( $term_id, 'product_attribute_image' );
				delete_term_meta( $term_id, 'yith_wccl_value' );
			}
		}
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function global_attribute_get( $request ) {
		$id = (int) $request['id'];
		if ( ! function_exists( 'wc_get_attribute' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$item = self::map_global_attribute_item( $id );
		if ( empty( $item['id'] ) ) {
			return new WP_Error( 'not_found', __( 'Attribute not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response( $item );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function global_attribute_patch( $request ) {
		if ( ! function_exists( 'wc_update_attribute' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$id = (int) $request['id'];
		if ( ! wc_get_attribute( $id ) ) {
			return new WP_Error( 'not_found', __( 'Attribute not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$args = array( 'id' => $id );
		if ( null !== $request->get_param( 'name' ) ) {
			$args['name'] = sanitize_text_field( (string) $request->get_param( 'name' ) );
		}
		if ( null !== $request->get_param( 'slug' ) ) {
			$args['slug'] = sanitize_title( (string) $request->get_param( 'slug' ) );
		}
		if ( null !== $request->get_param( 'type' ) ) {
			$args['type'] = self::to_wc_attribute_type( (string) $request->get_param( 'type' ) );
		}
		if ( null !== $request->get_param( 'order_by' ) ) {
			$orderby = sanitize_key( (string) $request->get_param( 'order_by' ) );
			if ( in_array( $orderby, array( 'menu_order', 'name', 'name_num', 'id' ), true ) ) {
				$args['order_by'] = $orderby;
			}
		}
		if ( null !== $request->get_param( 'has_archives' ) ) {
			$args['has_archives'] = rest_sanitize_boolean( $request->get_param( 'has_archives' ) );
		}
		$r = wc_update_attribute( $id, $args );
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		self::maybe_save_show_swatch_label( $id, $request );
		return new WP_REST_Response( self::map_global_attribute_item( $id ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function global_attribute_create( $request ) {
		if ( ! function_exists( 'wc_create_attribute' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$name = sanitize_text_field( (string) $request->get_param( 'name' ) );
		if ( '' === $name ) {
			return new WP_Error( 'invalid', __( 'Name required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$slug = sanitize_title( (string) ( $request->get_param( 'slug' ) ?: $name ) );
		$type = self::to_wc_attribute_type( (string) ( $request->get_param( 'type' ) ?: 'select' ) );
		$order_by = sanitize_key( (string) ( $request->get_param( 'order_by' ) ?: 'menu_order' ) );
		if ( ! in_array( $order_by, array( 'menu_order', 'name', 'name_num', 'id' ), true ) ) {
			$order_by = 'menu_order';
		}
		$attr_id = wc_create_attribute(
			array(
				'name'         => $name,
				'slug'         => $slug,
				'type'         => $type,
				'order_by'     => $order_by,
				'has_archives' => rest_sanitize_boolean( $request->get_param( 'has_archives' ) ),
			)
		);
		if ( is_wp_error( $attr_id ) ) {
			return $attr_id;
		}
		self::maybe_save_show_swatch_label( (int) $attr_id, $request );
		return new WP_REST_Response( self::map_global_attribute_item( (int) $attr_id ), 201 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function global_attribute_terms_list( $request ) {
		$id = (int) $request['id'];
		$ctx = self::global_attribute_context( $id );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$terms = get_terms(
			array(
				'taxonomy'   => $ctx['taxonomy'],
				'hide_empty' => false,
				'orderby'    => 'menu_order',
				'order'      => 'ASC',
			)
		);
		if ( is_wp_error( $terms ) ) {
			return $terms;
		}
		$items = array();
		foreach ( $terms as $term ) {
			if ( $term instanceof WP_Term ) {
				$items[] = self::map_global_attribute_term_item( $term, $ctx['type'] );
			}
		}
		return new WP_REST_Response( array( 'items' => $items ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function global_attribute_term_create( $request ) {
		$id  = (int) $request['id'];
		$ctx = self::global_attribute_context( $id );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$name = sanitize_text_field( (string) $request->get_param( 'name' ) );
		if ( '' === $name ) {
			return new WP_Error( 'invalid', __( 'Name required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$args = array(
			'slug'        => sanitize_title( (string) ( $request->get_param( 'slug' ) ?: $name ) ),
			'description' => (string) $request->get_param( 'description' ),
		);
		$r = wp_insert_term( $name, $ctx['taxonomy'], $args );
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		$term_id = (int) $r['term_id'];
		if ( null !== $request->get_param( 'menu_order' ) ) {
			update_term_meta( $term_id, 'order', (int) $request->get_param( 'menu_order' ) );
		}
		self::save_global_attribute_term_meta(
			$term_id,
			$ctx['type'],
			array(
				'color'    => $request->get_param( 'color' ),
				'image_id' => $request->get_param( 'image_id' ),
			)
		);
		$t = get_term( $term_id, $ctx['taxonomy'] );
		return new WP_REST_Response(
			array(
				'id'   => $term_id,
				'item' => ( $t && ! is_wp_error( $t ) ) ? self::map_global_attribute_term_item( $t, $ctx['type'] ) : null,
			),
			201
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function global_attribute_term_patch( $request ) {
		$id      = (int) $request['id'];
		$term_id = (int) $request['term_id'];
		$ctx     = self::global_attribute_context( $id );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$t = get_term( $term_id, $ctx['taxonomy'] );
		if ( ! $t || is_wp_error( $t ) ) {
			return new WP_Error( 'not_found', __( 'Term not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$args = array();
		if ( null !== $request->get_param( 'name' ) ) {
			$args['name'] = sanitize_text_field( (string) $request->get_param( 'name' ) );
		}
		if ( null !== $request->get_param( 'slug' ) ) {
			$args['slug'] = sanitize_title( (string) $request->get_param( 'slug' ) );
		}
		if ( null !== $request->get_param( 'description' ) ) {
			$args['description'] = (string) $request->get_param( 'description' );
		}
		if ( array() !== $args ) {
			$r = wp_update_term( $term_id, $ctx['taxonomy'], $args );
			if ( is_wp_error( $r ) ) {
				return $r;
			}
		}
		if ( null !== $request->get_param( 'menu_order' ) ) {
			update_term_meta( $term_id, 'order', (int) $request->get_param( 'menu_order' ) );
		}
		self::save_global_attribute_term_meta(
			$term_id,
			$ctx['type'],
			array(
				'color'    => $request->get_param( 'color' ),
				'image_id' => $request->get_param( 'image_id' ),
			)
		);
		$t = get_term( $term_id, $ctx['taxonomy'] );
		return new WP_REST_Response(
			array(
				'ok'   => true,
				'item' => ( $t && ! is_wp_error( $t ) ) ? self::map_global_attribute_term_item( $t, $ctx['type'] ) : null,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function global_attribute_term_delete( $request ) {
		$id      = (int) $request['id'];
		$term_id = (int) $request['term_id'];
		$ctx     = self::global_attribute_context( $id );
		if ( is_wp_error( $ctx ) ) {
			return $ctx;
		}
		$r = wp_delete_term( $term_id, $ctx['taxonomy'] );
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		if ( ! $r ) {
			return new WP_Error( 'not_found', __( 'Term not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function global_attribute_delete( $request ) {
		if ( ! function_exists( 'wc_delete_attribute' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$id = (int) $request['id'];
		$r   = wc_delete_attribute( $id );
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		if ( class_exists( 'Webino_Dashboard_Variation_Swatches', false ) ) {
			Webino_Dashboard_Variation_Swatches::delete_settings( $id );
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_get( $request ) {
		$u = get_userdata( (int) $request['id'] );
		if ( ! $u ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response( Webino_Dashboard_Users::map_detail( $u ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_get_me( $request ) {
		$request->set_param( 'id', get_current_user_id() );
		return self::user_get( $request );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_patch_me( $request ) {
		$request->set_param( 'id', get_current_user_id() );
		return self::user_patch( $request );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_notes_list( $request ) {
		$id = (int) $request['id'];
		if ( ! get_userdata( $id ) ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response( array( 'items' => Webino_Dashboard_Users::get_notes( $id ) ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_notes_create( $request ) {
		$id = (int) $request['id'];
		if ( ! get_userdata( $id ) ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$note = Webino_Dashboard_Users::add_note( $id, (string) $request->get_param( 'content' ) );
		if ( is_wp_error( $note ) ) {
			return $note;
		}
		return new WP_REST_Response( $note, 201 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_notes_delete( $request ) {
		$id      = (int) $request['id'];
		$note_id = (string) $request['note_id'];
		if ( ! get_userdata( $id ) ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$r = Webino_Dashboard_Users::delete_note( $id, $note_id );
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_patch( $request ) {
		$id = (int) $request['id'];
		$u  = get_userdata( $id );
		if ( ! $u ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$args = array( 'ID' => $id );
		if ( null !== $request->get_param( 'display_name' ) ) {
			$args['display_name'] = sanitize_text_field( (string) $request->get_param( 'display_name' ) );
		}
		if ( null !== $request->get_param( 'first_name' ) || null !== $request->get_param( 'last_name' ) ) {
			$names = Webino_Dashboard_Users::get_name_parts( $id );
			$first = null !== $request->get_param( 'first_name' )
				? sanitize_text_field( (string) $request->get_param( 'first_name' ) )
				: $names['first_name'];
			$last  = null !== $request->get_param( 'last_name' )
				? sanitize_text_field( (string) $request->get_param( 'last_name' ) )
				: $names['last_name'];
			Webino_Dashboard_Users::save_name( $id, $first, $last );
		}
		if ( null !== $request->get_param( 'user_email' ) ) {
			$args['user_email'] = sanitize_email( (string) $request->get_param( 'user_email' ) );
		}
		if ( null !== $request->get_param( 'role' ) && current_user_can( 'promote_users' ) ) {
			$role_check = Webino_Dashboard_Rest_Base::sanitize_assignable_role( (string) $request->get_param( 'role' ) );
			if ( is_wp_error( $role_check ) ) {
				return $role_check;
			}
			$args['role'] = $role_check;
		}
		if ( count( $args ) > 1 ) {
			$r = wp_update_user( $args );
			if ( is_wp_error( $r ) ) {
				return $r;
			}
		}
		if ( null !== $request->get_param( 'phone' ) ) {
			Webino_Dashboard_Users::save_phone( $id, (string) $request->get_param( 'phone' ) );
		}
		$profile = $request->get_param( 'profile' );
		if ( is_array( $profile ) ) {
			$san = Webino_Dashboard_Users::sanitize_profile( $profile );
			if ( is_wp_error( $san ) ) {
				return $san;
			}
			Webino_Dashboard_Users::save_profile( $id, $san );
		}
		$bank = $request->get_param( 'bank' );
		if ( is_array( $bank ) ) {
			$san = Webino_Dashboard_Users::sanitize_bank( $bank );
			if ( is_wp_error( $san ) ) {
				return $san;
			}
			Webino_Dashboard_Users::save_bank( $id, $san );
		}
		return self::user_get( $request );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_reset_password( $request ) {
		$id = (int) $request['id'];
		$u  = get_userdata( $id );
		if ( ! $u ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$result = retrieve_password( $u->user_login );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return new WP_REST_Response( array( 'ok' => true, 'sent_email' => true ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_change_role( $request ) {
		$id = (int) $request['id'];
		if ( ! get_userdata( $id ) ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$role_check = Webino_Dashboard_Rest_Base::sanitize_assignable_role( (string) $request->get_param( 'role' ) );
		if ( is_wp_error( $role_check ) ) {
			return $role_check;
		}
		$u = new WP_User( $id );
		$u->set_role( $role_check );
		return self::user_get( $request );
	}

	/**
	 * Bulk assign a role (partner / customer).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function users_bulk_role( $request ) {
		$ids = $request->get_param( 'ids' );
		if ( ! is_array( $ids ) ) {
			return new WP_Error( 'invalid', __( 'Invalid user list.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$role_check = Webino_Dashboard_Rest_Base::sanitize_assignable_role( (string) $request->get_param( 'role' ) );
		if ( is_wp_error( $role_check ) ) {
			return $role_check;
		}
		$updated = 0;
		foreach ( $ids as $id ) {
			$id = (int) $id;
			if ( $id < 1 || ! get_userdata( $id ) ) {
				continue;
			}
			if ( ! current_user_can( 'promote_users' ) ) {
				continue;
			}
			$u = new WP_User( $id );
			$u->set_role( $role_check );
			++$updated;
		}
		return new WP_REST_Response(
			array(
				'ok'      => true,
				'updated' => $updated,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_send_message( $request ) {
		$id = (int) $request['id'];
		if ( ! get_userdata( $id ) ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$message  = (string) $request->get_param( 'message' );
		$channels = $request->get_param( 'channels' );
		if ( ! is_array( $channels ) || empty( $channels ) ) {
			$channel = sanitize_key( (string) $request->get_param( 'channel' ) );
			$channels = '' !== $channel ? array( $channel ) : array();
		}
		if ( empty( $channels ) ) {
			return new WP_Error( 'invalid', __( 'At least one channel is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( '' === trim( $message ) ) {
			return new WP_Error( 'invalid', __( 'Message is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( 1 === count( $channels ) && 'whatsapp' !== sanitize_key( (string) $channels[0] ) ) {
			$res = Webino_Dashboard_Users::send_message( $id, (string) $channels[0], $message );
			if ( is_wp_error( $res ) ) {
				return $res;
			}
			return new WP_REST_Response(
				array(
					'ok'      => true,
					'results' => array( sanitize_key( (string) $channels[0] ) => true ),
				)
			);
		}
		$res = Webino_Dashboard_Users::send_messages( $id, $channels, $message );
		if ( empty( $res['results'] ) ) {
			return new WP_Error( 'invalid', __( 'At least one channel is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		return new WP_REST_Response( $res );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_disconnect_bot( $request ) {
		$id = (int) $request['id'];
		if ( ! get_userdata( $id ) ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$res = Webino_Dashboard_Users::disconnect_bot( $id, (string) $request->get_param( 'provider' ) );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return self::user_get( $request );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_wishlist( $request ) {
		$id = (int) $request['id'];
		if ( ! get_userdata( $id ) ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response(
			array(
				'items' => Webino_Dashboard_Users::get_wishlist_summary( $id ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_addresses_list( $request ) {
		$id = (int) $request['id'];
		if ( ! get_userdata( $id ) ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response(
			array(
				'items'              => Webino_Dashboard_Users::get_addresses( $id ),
				'default_address_id' => Webino_Dashboard_Users::get_default_address_id( $id ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_address_create( $request ) {
		$id = (int) $request['id'];
		if ( ! get_userdata( $id ) ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		$address = Webino_Dashboard_Users::validate_address( $id, $body );
		if ( is_wp_error( $address ) ) {
			return $address;
		}
		Webino_Dashboard_Users::upsert_address( $id, $address );
		if ( ! empty( $body['is_default'] ) ) {
			Webino_Dashboard_Users::set_default_address( $id, $address['id'] );
		}
		return self::user_addresses_list( $request );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_address_patch( $request ) {
		$id         = (int) $request['id'];
		$address_id = sanitize_text_field( (string) $request['address_id'] );
		if ( ! get_userdata( $id ) ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		$address = Webino_Dashboard_Users::validate_address( $id, $body, $address_id );
		if ( is_wp_error( $address ) ) {
			return $address;
		}
		Webino_Dashboard_Users::upsert_address( $id, $address );
		if ( ! empty( $body['is_default'] ) ) {
			Webino_Dashboard_Users::set_default_address( $id, $address['id'] );
		}
		return self::user_addresses_list( $request );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_address_delete( $request ) {
		$id         = (int) $request['id'];
		$address_id = sanitize_text_field( (string) $request['address_id'] );
		if ( ! get_userdata( $id ) ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( ! Webino_Dashboard_Users::delete_address( $id, $address_id ) ) {
			return new WP_Error( 'not_found', __( 'Address not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return self::user_addresses_list( $request );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_address_set_default( $request ) {
		$id         = (int) $request['id'];
		$address_id = sanitize_text_field( (string) $request['address_id'] );
		if ( ! get_userdata( $id ) ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$owned = false;
		foreach ( Webino_Dashboard_Users::get_addresses( $id ) as $row ) {
			if ( isset( $row['id'] ) && (string) $row['id'] === $address_id ) {
				$owned = true;
				break;
			}
		}
		if ( ! $owned ) {
			return new WP_Error( 'not_found', __( 'Address not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		Webino_Dashboard_Users::set_default_address( $id, $address_id );
		return self::user_addresses_list( $request );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function user_delete( $request ) {
		$id = (int) $request['id'];
		if ( get_current_user_id() === $id ) {
			return new WP_Error( 'self', __( 'Cannot delete yourself.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		require_once ABSPATH . 'wp-admin/includes/user.php';
		if ( ! get_userdata( $id ) ) {
			return new WP_Error( 'not_found', __( 'User not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( ! wp_delete_user( $id ) ) {
			return new WP_Error( 'fail', __( 'Could not delete user.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * Featured image, gallery, categories, brands, custom attributes, dimensions (WC).
	 *
	 * @param WC_Product      $p Product instance.
	 * @param WP_REST_Request $request Request.
	 * @return void
	 */
	private static function apply_product_catalog_fields( $p, $request ) {
		if ( null !== $request->get_param( 'image_id' ) ) {
			$img = (int) $request->get_param( 'image_id' );
			$p->set_image_id( $img > 0 ? $img : 0 );
		}
		if ( null !== $request->get_param( 'gallery_ids' ) && is_array( $request->get_param( 'gallery_ids' ) ) ) {
			$g = array_values( array_filter( array_map( 'intval', $request->get_param( 'gallery_ids' ) ) ) );
			$p->set_gallery_image_ids( $g );
		}
		if ( null !== $request->get_param( 'category_ids' ) && is_array( $request->get_param( 'category_ids' ) ) ) {
			$p->set_category_ids( array_values( array_filter( array_map( 'intval', $request->get_param( 'category_ids' ) ) ) ) );
		}
		if ( taxonomy_exists( 'product_brand' ) && null !== $request->get_param( 'brand_ids' ) && is_array( $request->get_param( 'brand_ids' ) ) ) {
			$b = array_values( array_filter( array_map( 'intval', $request->get_param( 'brand_ids' ) ) ) );
			wp_set_object_terms( $p->get_id(), $b, 'product_brand', false );
		}
		$raw_attrs = $request->get_param( 'product_attributes' );
		if ( is_array( $raw_attrs ) && class_exists( 'WC_Product_Attribute' ) ) {
			$attr_objects = array();
			foreach ( $raw_attrs as $i => $row ) {
				if ( ! is_array( $row ) || empty( $row['name'] ) || empty( $row['options'] ) || ! is_array( $row['options'] ) ) {
					continue;
				}
				$options = array_values(
					array_filter(
						array_map( 'sanitize_text_field', array_map( 'strval', $row['options'] ) )
					)
				);
				if ( ! $options ) {
					continue;
				}

				$attr = new WC_Product_Attribute();
				$aid  = isset( $row['attribute_id'] ) ? (int) $row['attribute_id'] : 0;
				$name = sanitize_text_field( (string) $row['name'] );

				// Always prefer / create a WooCommerce global attribute (never product-only).
				if ( $aid <= 0 && function_exists( 'wc_create_attribute' ) ) {
					$slug = sanitize_title( 0 === strpos( $name, 'pa_' ) ? substr( $name, 3 ) : $name );
					$label = $name;
					if ( 0 === strpos( $name, 'pa_' ) && function_exists( 'wc_attribute_label' ) ) {
						$label = wc_attribute_label( $name );
					}
					if ( function_exists( 'wc_get_attribute_taxonomies' ) ) {
						foreach ( wc_get_attribute_taxonomies() as $tax ) {
							if ( sanitize_title( $tax->attribute_name ) === $slug || $tax->attribute_label === $label ) {
								$aid = (int) $tax->attribute_id;
								break;
							}
						}
					}
					if ( $aid <= 0 ) {
						$created = wc_create_attribute(
							array(
								'name'         => $label ? $label : $slug,
								'slug'         => $slug,
								'type'         => 'select',
								'order_by'     => 'menu_order',
								'has_archives' => false,
							)
						);
						if ( ! is_wp_error( $created ) && (int) $created > 0 ) {
							$aid = (int) $created;
						}
					}
				}

				$is_var_product = $p->is_type( 'variable' );
				$attr->set_position( (int) $i );
				$attr->set_visible( isset( $row['visible'] ) ? (bool) $row['visible'] : true );
				$attr->set_variation( $is_var_product && ! empty( $row['variation'] ) );

				$key = sanitize_title( $name );
				if ( $aid > 0 && function_exists( 'wc_attribute_taxonomy_id_to_name' ) ) {
					$tax_name = wc_attribute_taxonomy_id_to_name( $aid );
					if ( ! is_string( $tax_name ) || '' === $tax_name ) {
						$tax_name = self::resolve_attribute_taxonomy( $aid, $name );
					}
					if ( is_string( $tax_name ) && '' !== $tax_name ) {
						if ( ! taxonomy_exists( $tax_name ) ) {
							register_taxonomy( $tax_name, array( 'product' ) );
						}
						foreach ( $options as $opt ) {
							if ( ! term_exists( $opt, $tax_name ) ) {
								wp_insert_term( $opt, $tax_name );
							}
						}
						$attr->set_id( $aid );
						$attr->set_name( $tax_name );
						$attr->set_options( $options );
						$key = $tax_name;
						$attr_objects[ $key ] = $attr;
						continue;
					}
				}

				// Last resort should still not happen; skip orphan custom attrs.
				continue;
			}
			if ( array() !== $attr_objects ) {
				$p->set_attributes( $attr_objects );
			}
		}
		foreach ( array( 'weight', 'length', 'width', 'height' ) as $dim ) {
			if ( null === $request->get_param( $dim ) ) {
				continue;
			}
			$val = sanitize_text_field( (string) $request->get_param( $dim ) );
			if ( 'weight' === $dim ) {
				$p->set_weight( $val );
			} elseif ( 'length' === $dim ) {
				$p->set_length( $val );
			} elseif ( 'width' === $dim ) {
				$p->set_width( $val );
			} elseif ( 'height' === $dim ) {
				$p->set_height( $val );
			}
		}
	}

	/**
	 * Virtual, tax, linked products, tags, etc.
	 *
	 * @param WC_Product      $p Product.
	 * @param WP_REST_Request $request Request.
	 * @return void
	 */
	private static function apply_product_extended_fields( $p, $request ) {
		if ( null !== $request->get_param( 'virtual' ) ) {
			$p->set_virtual( (bool) $request->get_param( 'virtual' ) );
		}
		if ( null !== $request->get_param( 'downloadable' ) ) {
			$p->set_downloadable( (bool) $request->get_param( 'downloadable' ) );
		}
		if ( null !== $request->get_param( 'featured' ) ) {
			$p->set_featured( (bool) $request->get_param( 'featured' ) );
		}
		if ( null !== $request->get_param( 'sold_individually' ) ) {
			$p->set_sold_individually( (bool) $request->get_param( 'sold_individually' ) );
		}
		if ( null !== $request->get_param( 'catalog_visibility' ) ) {
			$vis = sanitize_text_field( (string) $request->get_param( 'catalog_visibility' ) );
			if ( in_array( $vis, array( 'visible', 'catalog', 'search', 'hidden' ), true ) ) {
				$p->set_catalog_visibility( $vis );
			}
		}
		if ( null !== $request->get_param( 'tax_status' ) ) {
			$ts = sanitize_text_field( (string) $request->get_param( 'tax_status' ) );
			if ( in_array( $ts, array( 'taxable', 'shipping', 'none' ), true ) ) {
				$p->set_tax_status( $ts );
			}
		}
		if ( null !== $request->get_param( 'tax_class' ) ) {
			$p->set_tax_class( sanitize_text_field( (string) $request->get_param( 'tax_class' ) ) );
		}
		if ( null !== $request->get_param( 'shipping_class_id' ) ) {
			$p->set_shipping_class_id( (int) $request->get_param( 'shipping_class_id' ) );
		}
		if ( null !== $request->get_param( 'backorders' ) ) {
			$bo = sanitize_key( (string) $request->get_param( 'backorders' ) );
			if ( in_array( $bo, array( 'no', 'notify', 'yes' ), true ) ) {
				$p->set_backorders( $bo );
			}
		}
		if ( null !== $request->get_param( 'low_stock_amount' ) ) {
			$ls = $request->get_param( 'low_stock_amount' );
			$p->set_low_stock_amount( null === $ls || '' === $ls ? null : (int) $ls );
		}
		if ( null !== $request->get_param( 'purchase_note' ) ) {
			$p->set_purchase_note( sanitize_textarea_field( (string) $request->get_param( 'purchase_note' ) ) );
		}
		if ( null !== $request->get_param( 'menu_order' ) ) {
			$p->set_menu_order( (int) $request->get_param( 'menu_order' ) );
		}
		if ( null !== $request->get_param( 'upsell_ids' ) && is_array( $request->get_param( 'upsell_ids' ) ) ) {
			$p->set_upsell_ids( array_values( array_filter( array_map( 'intval', $request->get_param( 'upsell_ids' ) ) ) ) );
		}
		if ( null !== $request->get_param( 'cross_sell_ids' ) && is_array( $request->get_param( 'cross_sell_ids' ) ) ) {
			$p->set_cross_sell_ids( array_values( array_filter( array_map( 'intval', $request->get_param( 'cross_sell_ids' ) ) ) ) );
		}
		if ( null !== $request->get_param( 'tag_ids' ) && is_array( $request->get_param( 'tag_ids' ) ) && taxonomy_exists( 'product_tag' ) ) {
			$tag_ids = array_values( array_filter( array_map( 'intval', $request->get_param( 'tag_ids' ) ) ) );
			wp_set_object_terms( $p->get_id(), $tag_ids, 'product_tag', false );
		}
		if ( null !== $request->get_param( 'date_on_sale_from' ) ) {
			$raw = $request->get_param( 'date_on_sale_from' );
			if ( null === $raw || '' === $raw ) {
				$p->set_date_on_sale_from( null );
			} elseif ( class_exists( 'WC_DateTime' ) ) {
				$ts = strtotime( (string) $raw );
				if ( $ts ) {
					$p->set_date_on_sale_from( new WC_DateTime( '@' . $ts ) );
				}
			}
		}
		if ( null !== $request->get_param( 'date_on_sale_to' ) ) {
			$raw = $request->get_param( 'date_on_sale_to' );
			if ( null === $raw || '' === $raw ) {
				$p->set_date_on_sale_to( null );
			} elseif ( class_exists( 'WC_DateTime' ) ) {
				$ts = strtotime( (string) $raw );
				if ( $ts ) {
					$p->set_date_on_sale_to( new WC_DateTime( '@' . $ts ) );
				}
			}
		}
		if ( $p->is_type( 'grouped' ) && null !== $request->get_param( 'grouped_children_ids' ) && is_array( $request->get_param( 'grouped_children_ids' ) ) ) {
			$ids = array_values( array_filter( array_map( 'intval', $request->get_param( 'grouped_children_ids' ) ) ) );
			$p->set_children_ids( $ids );
		}
		if ( $p->is_type( 'external' ) ) {
			if ( null !== $request->get_param( 'product_url' ) ) {
				$p->set_product_url( esc_url_raw( (string) $request->get_param( 'product_url' ) ) );
			}
			if ( null !== $request->get_param( 'button_text' ) ) {
				$p->set_button_text( sanitize_text_field( (string) $request->get_param( 'button_text' ) ) );
			}
		}
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_get( $request ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return new WP_Error( 'no_wc', 'WC inactive', array( 'status' => 400 ) );
		}
		$p = wc_get_product( (int) $request['id'] );
		if ( ! $p ) {
			return new WP_Error( 'not_found', 'Not found', array( 'status' => 404 ) );
		}
		return new WP_REST_Response( Webino_Dashboard_REST::map_product_row( $p ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_patch( $request ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return new WP_Error( 'no_wc', 'WC inactive', array( 'status' => 400 ) );
		}
		$id = (int) $request['id'];
		$p   = wc_get_product( $id );
		if ( ! $p ) {
			return new WP_Error( 'not_found', 'Not found', array( 'status' => 404 ) );
		}
		if ( null !== $request->get_param( 'name' ) ) {
			$p->set_name( sanitize_text_field( (string) $request->get_param( 'name' ) ) );
		}
		if ( null !== $request->get_param( 'slug' ) ) {
			$slug = sanitize_title( (string) $request->get_param( 'slug' ) );
			if ( '' !== $slug ) {
				$p->set_slug( $slug );
			}
		}
		$is_variable = $p->is_type( 'variable' );
		if ( ! $is_variable ) {
			if ( null !== $request->get_param( 'regular_price' ) ) {
				$pr = wc_format_decimal( $request->get_param( 'regular_price' ) );
				$p->set_regular_price( $pr );
				$p->set_price( $pr );
			}
			if ( null !== $request->get_param( 'stock_quantity' ) ) {
				$p->set_stock_quantity( (int) $request->get_param( 'stock_quantity' ) );
			}
			if ( null !== $request->get_param( 'sale_price' ) ) {
				$sale = (string) $request->get_param( 'sale_price' );
				$p->set_sale_price( '' !== $sale ? wc_format_decimal( $sale ) : '' );
				if ( '' !== $sale ) {
					$p->set_price( wc_format_decimal( $sale ) );
				} else {
					$p->set_price( $p->get_regular_price() ? wc_format_decimal( $p->get_regular_price() ) : '' );
				}
			}
		}
		if ( null !== $request->get_param( 'description' ) ) {
			$p->set_description( wp_kses_post( (string) $request->get_param( 'description' ) ) );
		}
		if ( null !== $request->get_param( 'short_description' ) ) {
			$p->set_short_description( wp_kses_post( (string) $request->get_param( 'short_description' ) ) );
		}
		if ( null !== $request->get_param( 'sku' ) ) {
			$p->set_sku( sanitize_text_field( (string) $request->get_param( 'sku' ) ) );
		}
		if ( null !== $request->get_param( 'status' ) ) {
			$st = sanitize_key( (string) $request->get_param( 'status' ) );
			if ( in_array( $st, array( 'draft', 'pending', 'publish', 'private' ), true ) ) {
				$p->set_status( $st );
			}
		}
		if ( ! $is_variable && null !== $request->get_param( 'manage_stock' ) ) {
			$p->set_manage_stock( (bool) $request->get_param( 'manage_stock' ) );
		}
		self::apply_product_catalog_fields( $p, $request );
		self::apply_product_extended_fields( $p, $request );
		$seo = $request->get_param( 'seo' );
		if ( is_array( $seo ) ) {
			Webino_Dashboard_REST::apply_product_seo( $p, $seo );
		}
		$ishop = $request->get_param( 'ishop' );
		if ( is_array( $ishop ) ) {
			Webino_Dashboard_REST::apply_product_ishop( $p, $ishop );
		}
		$p->save();

		$wfcp = $request->get_param( 'wfcp' );
		if ( is_array( $wfcp ) && array() !== $wfcp ) {
			$sub = new WP_REST_Request( 'PATCH' );
			$sub->set_route( '/' . Webino_Dashboard_REST::NS . '/shop/products/' . $id . '/wfcp' );
			$sub->set_url_params( array( 'id' => $id ) );
			$sub->set_param( 'wfcp', $wfcp );
			$result = Webino_Dashboard_REST::shop_product_wfcp_patch( $sub );
			if ( is_wp_error( $result ) ) {
				return $result;
			}
		}

		return self::product_get( $request );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_create( $request ) {
		if ( ! class_exists( 'WooCommerce' ) || ! class_exists( 'WC_Product_Simple' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$ptype = sanitize_key( (string) $request->get_param( 'type' ) );
		if ( 'variable' === $ptype && class_exists( 'WC_Product_Variable' ) ) {
			$p = new WC_Product_Variable();
		} elseif ( 'grouped' === $ptype && class_exists( 'WC_Product_Grouped' ) ) {
			$p = new WC_Product_Grouped();
		} elseif ( 'external' === $ptype && class_exists( 'WC_Product_External' ) ) {
			$p = new WC_Product_External();
		} else {
			$p = new WC_Product_Simple();
		}
		$p->set_name( sanitize_text_field( (string) $request->get_param( 'name' ) ) ?: 'Product' );
		$status = sanitize_key( (string) $request->get_param( 'status' ) );
		if ( in_array( $status, array( 'draft', 'pending', 'publish', 'private' ), true ) ) {
			$p->set_status( $status );
		} else {
			$p->set_status( 'draft' );
		}
		if ( null !== $request->get_param( 'slug' ) ) {
			$slug = sanitize_title( (string) $request->get_param( 'slug' ) );
			if ( '' !== $slug ) {
				$p->set_slug( $slug );
			}
		}
		$p->save();
		$pid = $p->get_id();
		$p2  = wc_get_product( $pid );
		if ( $p2 ) {
			self::apply_product_catalog_fields( $p2, $request );
			self::apply_product_extended_fields( $p2, $request );
			if ( ! $p2->is_type( 'variable' ) ) {
				if ( null !== $request->get_param( 'regular_price' ) ) {
					$pr = wc_format_decimal( $request->get_param( 'regular_price' ) );
					$p2->set_regular_price( $pr );
					$p2->set_price( $pr );
				}
				if ( null !== $request->get_param( 'sale_price' ) ) {
					$sale = (string) $request->get_param( 'sale_price' );
					$p2->set_sale_price( '' !== $sale ? wc_format_decimal( $sale ) : '' );
				}
				if ( null !== $request->get_param( 'stock_quantity' ) ) {
					$p2->set_stock_quantity( (int) $request->get_param( 'stock_quantity' ) );
				}
				if ( null !== $request->get_param( 'manage_stock' ) ) {
					$p2->set_manage_stock( (bool) $request->get_param( 'manage_stock' ) );
				}
			}
			if ( null !== $request->get_param( 'sku' ) ) {
				$p2->set_sku( sanitize_text_field( (string) $request->get_param( 'sku' ) ) );
			}
			if ( null !== $request->get_param( 'description' ) ) {
				$p2->set_description( wp_kses_post( (string) $request->get_param( 'description' ) ) );
			}
			if ( null !== $request->get_param( 'short_description' ) ) {
				$p2->set_short_description( wp_kses_post( (string) $request->get_param( 'short_description' ) ) );
			}
			$seo = $request->get_param( 'seo' );
			if ( is_array( $seo ) ) {
				Webino_Dashboard_REST::apply_product_seo( $p2, $seo );
			}
			$ishop = $request->get_param( 'ishop' );
			if ( is_array( $ishop ) ) {
				Webino_Dashboard_REST::apply_product_ishop( $p2, $ishop );
			}
			$p2->save();
		}
		$wfcp = $request->get_param( 'wfcp' );
		if ( is_array( $wfcp ) && array() !== $wfcp ) {
			$sub = new WP_REST_Request( 'PATCH' );
			$sub->set_route( '/' . Webino_Dashboard_REST::NS . '/shop/products/' . $pid . '/wfcp' );
			$sub->set_url_params( array( 'id' => $pid ) );
			$sub->set_param( 'wfcp', $wfcp );
			$wfcp_res = Webino_Dashboard_REST::shop_product_wfcp_patch( $sub );
			if ( is_wp_error( $wfcp_res ) ) {
				return $wfcp_res;
			}
		}
		return new WP_REST_Response( Webino_Dashboard_REST::map_product_row( wc_get_product( $pid ) ), 201 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_duplicate( $request ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$id      = (int) $request['id'];
		$product = wc_get_product( $id );
		if ( ! $product ) {
			return new WP_Error( 'not_found', __( 'Product not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}

		$new_id = 0;
		if ( class_exists( 'WC_Admin_Duplicate_Product' ) ) {
			$duplicator = new WC_Admin_Duplicate_Product();
			$new_id     = (int) $duplicator->product_duplicate( $product );
		} else {
			$new_post = array(
				'post_title'  => $product->get_name() . ' (Copy)',
				'post_status' => 'draft',
				'post_type'   => 'product',
				'post_author' => get_current_user_id(),
			);
			$new_id = wp_insert_post( $new_post, true );
			if ( is_wp_error( $new_id ) ) {
				return $new_id;
			}
			$new_id = (int) $new_id;
			if ( $new_id > 0 ) {
				foreach ( $product->get_meta_data() as $meta ) {
					$key = $meta->key;
					if ( '_edit_lock' === $key || '_edit_last' === $key ) {
						continue;
					}
					add_post_meta( $new_id, $key, $meta->value );
				}
				foreach ( get_object_taxonomies( 'product' ) as $tax ) {
					$term_ids = wp_get_object_terms( $id, $tax, array( 'fields' => 'ids' ) );
					if ( ! is_wp_error( $term_ids ) && $term_ids ) {
						wp_set_object_terms( $new_id, $term_ids, $tax, false );
					}
				}
			}
		}

		if ( $new_id < 1 ) {
			return new WP_Error( 'duplicate_failed', __( 'Could not duplicate product.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}

		$copy = wc_get_product( $new_id );
		if ( $copy ) {
			$copy->set_status( 'draft' );
			$copy->save();
		}

		return new WP_REST_Response(
			array(
				'id'   => $new_id,
				'item' => Webino_Dashboard_REST::map_product_list_item( wc_get_product( $new_id ) ),
			),
			201
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_delete( $request ) {
		$id = (int) $request['id'];
		if ( ! function_exists( 'wc_get_product' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( ! wc_get_product( $id ) ) {
			return new WP_Error( 'not_found', __( 'Product not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$force = ! empty( $request->get_param( 'force' ) );
		if ( $force ) {
			wp_delete_post( $id, true );
		} else {
			wp_trash_post( $id );
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_sync_channel( $request ) {
		$id       = (int) $request['id'];
		$provider = sanitize_key( (string) $request->get_param( 'provider' ) );
		if ( ! wc_get_product( $id ) ) {
			return new WP_Error( 'not_found', __( 'Product not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( 'bale' === $provider && class_exists( '\Webino_Dashboard_Bots_Bale\Woo\ProductChannelSync' ) ) {
			$res = \Webino_Dashboard_Bots_Bale\Woo\ProductChannelSync::instance()->sync_product_to_channel( $id );
			return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'ok' => true, 'provider' => 'bale' ) );
		}
		if ( 'telegram' === $provider && class_exists( '\Webino_Dashboard_Bots_Telegram\Woo\ProductChannelSync' ) ) {
			$res = \Webino_Dashboard_Bots_Telegram\Woo\ProductChannelSync::instance()->sync_product_to_channel( $id );
			return is_wp_error( $res ) ? $res : new WP_REST_Response( array( 'ok' => true, 'provider' => 'telegram' ) );
		}
		return new WP_Error( 'invalid_provider', __( 'Invalid channel provider.', 'webino-dashboard' ), array( 'status' => 400 ) );
	}

	/**
	 * @param WP_Term              $t            Term.
	 * @param array<int,string>|null $parent_names Optional id => name map.
	 * @return array<string,mixed>
	 */
	private static function map_brand_item( $t, $parent_names = null ) {
		$id       = (int) $t->term_id;
		$thumb_id = (int) get_term_meta( $id, 'thumbnail_id', true );

		$views_raw = get_term_meta( $id, 'post_views_count', true );
		if ( '' === $views_raw || false === $views_raw ) {
			$views_raw = get_term_meta( $id, 'views', true );
		}
		$views = ( '' !== $views_raw && false !== $views_raw ) ? (int) $views_raw : null;

		$parent = (int) $t->parent;
		$parent_name = '';
		if ( $parent > 0 ) {
			if ( is_array( $parent_names ) && isset( $parent_names[ $parent ] ) ) {
				$parent_name = $parent_names[ $parent ];
			} else {
				$pterm = get_term( $parent, 'product_brand' );
				$parent_name = ( $pterm && ! is_wp_error( $pterm ) ) ? $pterm->name : '';
			}
		}

		$link = get_term_link( $t );

		return array(
			'id'            => $id,
			'name'          => $t->name,
			'slug'          => $t->slug,
			'description'   => $t->description,
			'parent'        => $parent,
			'parent_name'   => $parent_name,
			'count'         => (int) $t->count,
			'thumbnail_id'  => $thumb_id > 0 ? $thumb_id : null,
			'thumbnail_url' => $thumb_id > 0 ? (string) wp_get_attachment_image_url( $thumb_id, 'thumbnail' ) : '',
			'views'         => $views,
			'url'           => is_wp_error( $link ) ? '' : (string) $link,
			'seo'           => self::map_term_seo_fields( $id ),
		);
	}

	/**
	 * @param array<string,mixed> $a Item A.
	 * @param array<string,mixed> $b Item B.
	 * @param string              $sort Sort key.
	 * @return int
	 */
	private static function compare_brand_items( $a, $b, $sort ) {
		switch ( $sort ) {
			case 'name_desc':
				return strcasecmp( (string) $b['name'], (string) $a['name'] );
			case 'count_desc':
				return ( (int) $b['count'] ) <=> ( (int) $a['count'] );
			case 'count_asc':
				return ( (int) $a['count'] ) <=> ( (int) $b['count'] );
			case 'name_asc':
			default:
				return strcasecmp( (string) $a['name'], (string) $b['name'] );
		}
	}

	/**
	 * @param int                  $term_id Term ID.
	 * @param WP_REST_Request|null $request Request for thumbnail_id.
	 * @return void
	 */
	private static function brands_save_thumbnail_meta( $term_id, $request ) {
		if ( ! $request || null === $request->get_param( 'thumbnail_id' ) ) {
			return;
		}
		$thumb_id = max( 0, (int) $request->get_param( 'thumbnail_id' ) );
		if ( $thumb_id > 0 ) {
			update_term_meta( $term_id, 'thumbnail_id', $thumb_id );
		} else {
			delete_term_meta( $term_id, 'thumbnail_id' );
		}
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function brands_list( $request ) {
		if ( ! taxonomy_exists( 'product_brand' ) ) {
			return new WP_REST_Response( array( 'items' => array(), 'found' => 0 ) );
		}
		$terms = get_terms(
			array(
				'taxonomy'   => 'product_brand',
				'hide_empty' => false,
			)
		);
		if ( is_wp_error( $terms ) ) {
			return new WP_REST_Response( array( 'items' => array(), 'found' => 0 ) );
		}

		$search = sanitize_text_field( (string) $request->get_param( 'search' ) );
		$sort   = sanitize_key( (string) ( $request->get_param( 'sort' ) ?: 'name_asc' ) );
		$parent_param = $request->get_param( 'parent' );
		$has_parent_filter = null !== $parent_param && '' !== (string) $parent_param;
		$parent_filter = $has_parent_filter ? (int) $parent_param : null;

		$parent_names = array();
		foreach ( $terms as $t ) {
			$parent_names[ (int) $t->term_id ] = $t->name;
		}

		$items = array();
		foreach ( $terms as $t ) {
			if ( '' !== $search ) {
				$hay = strtolower( $t->name . ' ' . $t->slug );
				if ( false === strpos( $hay, strtolower( $search ) ) ) {
					continue;
				}
			}
			if ( $has_parent_filter && (int) $t->parent !== $parent_filter ) {
				continue;
			}
			$items[] = self::map_brand_item( $t, $parent_names );
		}

		usort(
			$items,
			function ( $a, $b ) use ( $sort ) {
				return self::compare_brand_items( $a, $b, $sort );
			}
		);

		return new WP_REST_Response(
			array(
				'items' => $items,
				'found' => count( $items ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function brands_get( $request ) {
		if ( ! taxonomy_exists( 'product_brand' ) ) {
			return new WP_Error( 'no_tax', __( 'Brand taxonomy missing.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$t = get_term( (int) $request['id'], 'product_brand' );
		if ( ! $t || is_wp_error( $t ) ) {
			return new WP_Error( 'not_found', __( 'Brand not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response( self::map_brand_item( $t ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function brands_create( $request ) {
		if ( ! taxonomy_exists( 'product_brand' ) ) {
			return new WP_Error( 'no_tax', __( 'Brand taxonomy missing.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$name = sanitize_text_field( (string) $request->get_param( 'name' ) );
		if ( '' === $name ) {
			return new WP_Error( 'invalid', __( 'Name required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$slug   = sanitize_title( (string) ( $request->get_param( 'slug' ) ?: $name ) );
		$parent = max( 0, (int) $request->get_param( 'parent' ) );
		$args   = array(
			'slug'        => $slug,
			'description' => (string) $request->get_param( 'description' ),
		);
		if ( $parent > 0 ) {
			$args['parent'] = $parent;
		}
		$r = wp_insert_term( $name, 'product_brand', $args );
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		$term_id = (int) $r['term_id'];
		self::brands_save_thumbnail_meta( $term_id, $request );
		self::save_term_seo_from_request( $term_id, $request );
		$t = get_term( $term_id, 'product_brand' );
		return new WP_REST_Response(
			array(
				'id'   => $term_id,
				'item' => ( $t && ! is_wp_error( $t ) ) ? self::map_brand_item( $t ) : null,
			),
			201
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function brands_patch( $request ) {
		if ( ! taxonomy_exists( 'product_brand' ) ) {
			return new WP_Error( 'no_tax', __( 'Brand taxonomy missing.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$id = (int) $request['id'];
		if ( ! get_term( $id, 'product_brand' ) ) {
			return new WP_Error( 'not_found', __( 'Brand not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$args = array();
		if ( null !== $request->get_param( 'name' ) ) {
			$args['name'] = sanitize_text_field( (string) $request->get_param( 'name' ) );
		}
		if ( null !== $request->get_param( 'slug' ) ) {
			$args['slug'] = sanitize_title( (string) $request->get_param( 'slug' ) );
		}
		if ( null !== $request->get_param( 'description' ) ) {
			$args['description'] = (string) $request->get_param( 'description' );
		}
		if ( null !== $request->get_param( 'parent' ) ) {
			$args['parent'] = max( 0, (int) $request->get_param( 'parent' ) );
		}
		if ( array() !== $args ) {
			$r = wp_update_term( $id, 'product_brand', $args );
			if ( is_wp_error( $r ) ) {
				return $r;
			}
		}
		self::brands_save_thumbnail_meta( $id, $request );
		self::save_term_seo_from_request( $id, $request );
		$t = get_term( $id, 'product_brand' );
		return new WP_REST_Response(
			array(
				'ok'   => true,
				'item' => ( $t && ! is_wp_error( $t ) ) ? self::map_brand_item( $t ) : null,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function brands_delete( $request ) {
		$r = wp_delete_term( (int) $request['id'], 'product_brand' );
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		if ( ! $r ) {
			return new WP_Error( 'fail', __( 'Could not delete term.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * @param WC_Product_Variation $v Variation.
	 * @return array<string,mixed>
	 */
	private static function map_variation_row( $v ) {
		if ( ! is_a( $v, 'WC_Product_Variation' ) ) {
			return array();
		}
		$wfcp = array();
		if ( method_exists( 'Webino_Dashboard_REST', 'map_product_list_wfcp' ) ) {
			$wfcp = Webino_Dashboard_REST::map_product_list_wfcp( $v );
		} else {
			$pp = get_post_meta( $v->get_id(), '_wfcp_purchase_price', true );
			$wfcp = array(
				'purchase_price' => '' !== $pp && false !== $pp ? (float) $pp : null,
				'lock_price'     => (bool) get_post_meta( $v->get_id(), '_wfcp_lock_price', true ),
			);
		}
		$attrs = $v->get_attributes();
		$parent = wc_get_product( $v->get_parent_id() );
		$attr_labels = self::variation_attribute_labels( is_array( $attrs ) ? $attrs : array(), $parent ? $parent : null );
		return array(
			'id'             => $v->get_id(),
			'sku'            => $v->get_sku(),
			'regular_price'  => $v->get_regular_price(),
			'sale_price'     => $v->get_sale_price(),
			'price'          => $v->get_price(),
			'manage_stock'   => $v->get_manage_stock(),
			'stock_quantity' => $v->get_stock_quantity(),
			'stock_status'   => $v->get_stock_status(),
			'image_id'       => (int) $v->get_image_id(),
			'attributes'     => is_array( $attrs ) ? $attrs : array(),
			'attribute_labels' => $attr_labels,
			'status'         => $v->get_status(),
			'wfcp'           => array(
				'purchase_price' => $wfcp['purchase_price'] ?? null,
				'lock_price'     => ! empty( $wfcp['lock_price'] ),
				'reference_url'  => (string) get_post_meta( $v->get_id(), '_wfcp_reference_url', true ),
				'reference_source' => (string) get_post_meta( $v->get_id(), '_wfcp_reference_source', true ),
				'reference_last_sync' => get_post_meta( $v->get_id(), '_wfcp_reference_last_sync', true ),
				'wholesale_rule' => isset( $wfcp['wholesale_rule'] ) && is_array( $wfcp['wholesale_rule'] ) ? $wfcp['wholesale_rule'] : get_post_meta( $v->get_id(), '_wfcp_wholesale_custom_rule', true ),
			),
			'wfcp_prices'    => $wfcp,
		);
	}

	/**
	 * Human-readable attribute labels/values for a variation (Persian-safe).
	 *
	 * @param array<string,mixed> $attrs Variation attributes (taxonomy => slug).
	 * @param WC_Product|null     $product Parent product (helps custom attribute labels).
	 * @return array<string,array{label:string,value:string}>
	 */
	private static function variation_attribute_labels( $attrs, $product = null ) {
		$out = array();
		if ( ! is_array( $attrs ) ) {
			return $out;
		}
		foreach ( $attrs as $key => $val ) {
			$tax     = (string) $key;
			$decoded = rawurldecode( $tax );
			$label   = $tax;
			if ( function_exists( 'wc_attribute_label' ) ) {
				$label = (string) wc_attribute_label( $tax, $product );
				if ( $label === $tax || $label === $decoded ) {
					$alt = (string) wc_attribute_label( $decoded, $product );
					if ( '' !== $alt ) {
						$label = $alt;
					}
				}
			}
			if ( ( $label === $tax || $label === $decoded || 0 === strpos( $label, 'pa_' ) ) && function_exists( 'wc_get_attribute_taxonomy_labels' ) ) {
				$all_labels = wc_get_attribute_taxonomy_labels();
				if ( is_array( $all_labels ) ) {
					if ( ! empty( $all_labels[ $tax ] ) ) {
						$label = (string) $all_labels[ $tax ];
					} elseif ( ! empty( $all_labels[ $decoded ] ) ) {
						$label = (string) $all_labels[ $decoded ];
					}
				}
			}
			if ( $label === $tax || 0 === strpos( $label, 'pa_' ) ) {
				$bare  = preg_replace( '/^pa_/', '', $decoded );
				$label = str_replace( '-', ' ', (string) $bare );
			}
			$value    = (string) $val;
			$term_tax = taxonomy_exists( $tax ) ? $tax : '';
			if ( '' === $term_tax && taxonomy_exists( $decoded ) ) {
				$term_tax = $decoded;
			}
			if ( '' !== $term_tax ) {
				$term = get_term_by( 'slug', $value, $term_tax );
				if ( ( ! $term || is_wp_error( $term ) ) && $value !== rawurldecode( $value ) ) {
					$term = get_term_by( 'slug', rawurldecode( $value ), $term_tax );
				}
				if ( $term && ! is_wp_error( $term ) ) {
					$value = $term->name;
				} else {
					$value = rawurldecode( $value );
				}
			} else {
				$value = rawurldecode( $value );
			}
			$out[ $tax ] = array(
				'label' => $label,
				'value' => $value,
			);
		}
		return $out;
	}

	/**
	 * Variation ID matching the parent default attributes, or 0.
	 *
	 * @param WC_Product $parent Variable product.
	 * @return int
	 */
	private static function default_variation_id_for_parent( $parent ) {
		if ( ! $parent || ! is_a( $parent, 'WC_Product' ) || ! $parent->is_type( 'variable' ) ) {
			return 0;
		}
		$defaults = $parent->get_default_attributes();
		if ( ! is_array( $defaults ) || array() === $defaults ) {
			return 0;
		}
		$match = array();
		foreach ( $parent->get_attributes() as $attribute ) {
			if ( ! is_object( $attribute ) || ! $attribute->get_variation() ) {
				continue;
			}
			$name = (string) $attribute->get_name();
			$san  = sanitize_title( $name );
			$val  = '';
			if ( isset( $defaults[ $san ] ) ) {
				$val = (string) $defaults[ $san ];
			} elseif ( isset( $defaults[ $name ] ) ) {
				$val = (string) $defaults[ $name ];
			}
			$match[ 'attribute_' . $san ] = $val;
		}
		if ( ! $match ) {
			return 0;
		}
		$data_store = WC_Data_Store::load( 'product' );
		$found      = $data_store->find_matching_product_variation( $parent, $match );
		return $found ? (int) $found : 0;
	}

	/**
	 * @param WC_Product_Variation $v Variation.
	 * @param WP_REST_Request      $request Request.
	 * @return void
	 */
	private static function apply_variation_request( $v, $request ) {
		if ( null !== $request->get_param( 'sku' ) ) {
			$v->set_sku( sanitize_text_field( (string) $request->get_param( 'sku' ) ) );
		}
		if ( null !== $request->get_param( 'regular_price' ) ) {
			$rp = wc_format_decimal( $request->get_param( 'regular_price' ) );
			$v->set_regular_price( $rp );
		}
		if ( null !== $request->get_param( 'sale_price' ) ) {
			$sp = (string) $request->get_param( 'sale_price' );
			$v->set_sale_price( '' !== $sp ? wc_format_decimal( $sp ) : '' );
		}
		if ( null !== $request->get_param( 'manage_stock' ) ) {
			$v->set_manage_stock( (bool) $request->get_param( 'manage_stock' ) );
		}
		if ( null !== $request->get_param( 'stock_quantity' ) ) {
			$sq = $request->get_param( 'stock_quantity' );
			$v->set_stock_quantity( null === $sq || '' === $sq ? null : (int) $sq );
		}
		if ( null !== $request->get_param( 'stock_status' ) ) {
			$st = sanitize_key( (string) $request->get_param( 'stock_status' ) );
			if ( in_array( $st, array( 'instock', 'outofstock', 'onbackorder' ), true ) ) {
				$v->set_stock_status( $st );
			}
		}
		if ( null !== $request->get_param( 'image_id' ) ) {
			$img = (int) $request->get_param( 'image_id' );
			$v->set_image_id( $img > 0 ? $img : 0 );
		}
		$attrs = $request->get_param( 'attributes' );
		if ( is_array( $attrs ) ) {
			$clean = array();
			foreach ( $attrs as $k => $val ) {
				$key = sanitize_text_field( (string) $k );
				if ( '' === $key ) {
					continue;
				}
				$clean[ $key ] = sanitize_text_field( (string) $val );
			}
			$v->set_attributes( $clean );
		}

		$wfcp = $request->get_param( 'wfcp' );
		if ( is_array( $wfcp ) ) {
			if ( array_key_exists( 'purchase_price', $wfcp ) ) {
				$raw = $wfcp['purchase_price'];
				if ( null === $raw || '' === $raw ) {
					$v->delete_meta_data( '_wfcp_purchase_price' );
				} else {
					$pp = class_exists( 'WFCP_Helper' ) ? WFCP_Helper::sanitize_price( $raw ) : (float) $raw;
					$v->update_meta_data( '_wfcp_purchase_price', $pp );
				}
			}
			if ( array_key_exists( 'lock_price', $wfcp ) ) {
				$v->update_meta_data( '_wfcp_lock_price', ! empty( $wfcp['lock_price'] ) ? '1' : '0' );
			}
			if ( array_key_exists( 'reference_url', $wfcp ) ) {
				$url = esc_url_raw( (string) $wfcp['reference_url'] );
				if ( '' === $url ) {
					$v->delete_meta_data( '_wfcp_reference_url' );
				} else {
					$v->update_meta_data( '_wfcp_reference_url', $url );
				}
			}
			if ( array_key_exists( 'wholesale_rule', $wfcp ) && class_exists( 'WFCP_Wholesale_Rules', false ) ) {
				WFCP_Wholesale_Rules::apply_to_wc_product( $v, $wfcp['wholesale_rule'] );
			}
		}

		$reg = $v->get_regular_price();
		$sal = $v->get_sale_price();
		if ( $sal && '' !== $sal ) {
			$v->set_price( wc_format_decimal( $sal ) );
		} elseif ( $reg && '' !== $reg ) {
			$v->set_price( wc_format_decimal( $reg ) );
		}
	}

	/**
	 * After variation save, sync retail from purchase when WFCP is available.
	 *
	 * @param int $variation_id Variation ID.
	 * @return void
	 */
	private static function maybe_sync_variation_wfcp( $variation_id ) {
		$variation_id = (int) $variation_id;
		if ( $variation_id < 1 || ! class_exists( 'WFCP_Helper', false ) ) {
			return;
		}
		$pp = get_post_meta( $variation_id, '_wfcp_purchase_price', true );
		if ( '' === $pp || false === $pp ) {
			return;
		}
		WFCP_Helper::sync_retail_price_from_purchase( $variation_id, (float) $pp );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_variations_list( $request ) {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$parent_id = (int) $request['id'];
		$parent    = wc_get_product( $parent_id );
		if ( ! $parent || ! $parent->is_type( 'variable' ) ) {
			return new WP_Error( 'invalid_parent', __( 'Not a variable product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$page     = max( 1, (int) $request->get_param( 'page' ) ?: 1 );
		$per_page = min( 100, max( 1, (int) $request->get_param( 'per_page' ) ?: 50 ) );
		$children = $parent->get_children();
		$total    = count( $children );
		$offset   = ( $page - 1 ) * $per_page;
		$slice    = array_slice( $children, $offset, $per_page );
		$items    = array();
		foreach ( $slice as $vid ) {
			$v = wc_get_product( (int) $vid );
			if ( $v && $v->is_type( 'variation' ) ) {
				$items[] = self::map_variation_row( $v );
			}
		}
		return new WP_REST_Response(
			array(
				'items'                => $items,
				'page'                 => $page,
				'total'                => $total,
				'default_variation_id' => self::default_variation_id_for_parent( $parent ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_variation_create( $request ) {
		if ( ! class_exists( 'WC_Product_Variation' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$parent_id = (int) $request['id'];
		$parent    = wc_get_product( $parent_id );
		if ( ! $parent || ! $parent->is_type( 'variable' ) ) {
			return new WP_Error( 'invalid_parent', __( 'Not a variable product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$v = new WC_Product_Variation();
		$v->set_parent_id( $parent_id );
		$v->set_status( 'publish' );
		self::apply_variation_request( $v, $request );
		$v->save();
		self::maybe_sync_variation_wfcp( $v->get_id() );
		$v2 = wc_get_product( $v->get_id() );
		return new WP_REST_Response( $v2 && $v2->is_type( 'variation' ) ? self::map_variation_row( $v2 ) : self::map_variation_row( $v ), 201 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_variation_patch( $request ) {
		$parent_id = (int) $request['id'];
		$vid       = (int) $request['vid'];
		$v         = wc_get_product( $vid );
		if ( ! $v || ! $v->is_type( 'variation' ) || (int) $v->get_parent_id() !== $parent_id ) {
			return new WP_Error( 'not_found', __( 'Variation not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		self::apply_variation_request( $v, $request );
		$v->save();
		self::maybe_sync_variation_wfcp( $vid );
		$v2 = wc_get_product( $vid );
		return new WP_REST_Response( $v2 && $v2->is_type( 'variation' ) ? self::map_variation_row( $v2 ) : self::map_variation_row( $v ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_variation_delete( $request ) {
		$parent_id = (int) $request['id'];
		$vid       = (int) $request['vid'];
		$v         = wc_get_product( $vid );
		if ( ! $v || ! $v->is_type( 'variation' ) || (int) $v->get_parent_id() !== $parent_id ) {
			return new WP_Error( 'not_found', __( 'Variation not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$r = wp_delete_post( $vid, true );
		if ( ! $r ) {
			return new WP_Error( 'fail', __( 'Could not delete variation.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * Set WooCommerce default attributes from a variation (storefront pre-select).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_variation_set_default( $request ) {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$parent_id = (int) $request['id'];
		$parent    = wc_get_product( $parent_id );
		if ( ! $parent || ! $parent->is_type( 'variable' ) ) {
			return new WP_Error( 'invalid_parent', __( 'Not a variable product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$vid = (int) $request->get_param( 'variation_id' );
		if ( $vid <= 0 ) {
			$parent->set_default_attributes( array() );
			$parent->save();
			return new WP_REST_Response(
				array(
					'ok'                   => true,
					'default_variation_id' => 0,
				)
			);
		}
		$v = wc_get_product( $vid );
		if ( ! $v || ! $v->is_type( 'variation' ) || (int) $v->get_parent_id() !== $parent_id ) {
			return new WP_Error( 'not_found', __( 'Variation not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$attrs     = $v->get_attributes();
		$defaults  = array();
		if ( is_array( $attrs ) ) {
			foreach ( $attrs as $key => $val ) {
				if ( '' === $val || null === $val ) {
					continue;
				}
				$defaults[ (string) $key ] = (string) $val;
			}
		}
		$parent->set_default_attributes( $defaults );
		$parent->save();
		$fresh = wc_get_product( $parent_id );
		return new WP_REST_Response(
			array(
				'ok'                   => true,
				'default_variation_id' => self::default_variation_id_for_parent( $fresh ? $fresh : $parent ),
			)
		);
	}

	/**
	 * Apply selected price/stock fields to every existing variation of a product.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_variations_bulk( $request ) {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$parent_id = (int) $request['id'];
		$parent    = wc_get_product( $parent_id );
		if ( ! $parent || ! $parent->is_type( 'variable' ) ) {
			return new WP_Error( 'invalid_parent', __( 'Not a variable product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$sub = new WP_REST_Request( 'POST' );
		$has = false;
		foreach ( array( 'regular_price', 'sale_price', 'manage_stock', 'stock_quantity', 'stock_status', 'wfcp' ) as $key ) {
			if ( null !== $request->get_param( $key ) ) {
				$sub->set_param( $key, $request->get_param( $key ) );
				$has = true;
			}
		}
		if ( ! $has ) {
			return new WP_Error( 'invalid', __( 'No fields to apply.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( null !== $request->get_param( 'stock_quantity' ) && null === $request->get_param( 'manage_stock' ) ) {
			$sub->set_param( 'manage_stock', true );
		}

		$updated  = 0;
		$children = $parent->get_children();
		foreach ( $children as $vid ) {
			$v = wc_get_product( (int) $vid );
			if ( ! $v || ! $v->is_type( 'variation' ) ) {
				continue;
			}
			self::apply_variation_request( $v, $sub );
			$v->save();
			self::maybe_sync_variation_wfcp( (int) $vid );
			++$updated;
		}
		if ( function_exists( 'wc_delete_product_transients' ) ) {
			wc_delete_product_transients( $parent_id );
		}
		return new WP_REST_Response( array( 'updated' => $updated ) );
	}

	/**
	 * Create missing variation combinations (bypasses WooCommerce's ~50 link_all cap).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_variations_generate( $request ) {
		if ( ! class_exists( 'WC_Product_Variation' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$parent_id = (int) $request['id'];
		$parent    = wc_get_product( $parent_id );
		if ( ! $parent || ! $parent->is_type( 'variable' ) ) {
			return new WP_Error( 'invalid_parent', __( 'Not a variable product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$axes = $parent->get_variation_attributes();
		if ( ! is_array( $axes ) || empty( $axes ) ) {
			return new WP_Error( 'no_attrs', __( 'No variation attributes found.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$combos = self::cartesian_variation_combos( $axes );
		$total  = count( $combos );
		if ( $total < 1 ) {
			return new WP_Error( 'no_combos', __( 'No variation combinations to create.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( $total > 2500 ) {
			return new WP_Error(
				'too_many',
				sprintf(
					/* translators: %d: combination count */
					__( 'Too many combinations (%d). Maximum is 2500.', 'webino-dashboard' ),
					$total
				),
				array( 'status' => 400 )
			);
		}

		$data_store = WC_Data_Store::load( 'product' );
		$dry_run    = (bool) $request->get_param( 'dry_run' );

		if ( $dry_run ) {
			$existing = 0;
			foreach ( $combos as $combo ) {
				if ( self::find_variation_for_combo( $parent, $data_store, $combo ) ) {
					++$existing;
				}
			}
			$missing = $total - $existing;
			return new WP_REST_Response(
				array(
					'created'   => 0,
					'skipped'   => $existing,
					'total'     => $total,
					'existing'  => $existing,
					'missing'   => $missing,
					'remaining' => $missing,
				)
			);
		}

		$offset  = max( 0, (int) $request->get_param( 'offset' ) );
		$created = 0;
		$skipped = 0;
		$i       = $offset;
		$batch   = 40;
		while ( $i < $total && $created < $batch ) {
			$combo = $combos[ $i ];
			++$i;
			if ( self::find_variation_for_combo( $parent, $data_store, $combo ) ) {
				++$skipped;
				continue;
			}
			$v = new WC_Product_Variation();
			$v->set_parent_id( $parent_id );
			$v->set_status( 'publish' );
			$v->set_attributes( $combo );
			$v->save();
			++$created;
		}

		if ( $created > 0 && class_exists( 'WC_Product_Variable' ) ) {
			WC_Product_Variable::sync( $parent_id );
			if ( function_exists( 'wc_delete_product_transients' ) ) {
				wc_delete_product_transients( $parent_id );
			}
		}

		return new WP_REST_Response(
			array(
				'created'     => $created,
				'skipped'     => $skipped,
				'total'       => $total,
				'remaining'   => max( 0, $total - $i ),
				'next_offset' => $i,
			)
		);
	}

	/**
	 * Cartesian product of variation attribute options.
	 *
	 * @param array<string,array<int,string>> $axes Attribute name => option values.
	 * @return array<int,array<string,string>>
	 */
	private static function cartesian_variation_combos( $axes ) {
		$result = array( array() );
		foreach ( $axes as $key => $values ) {
			$clean = array();
			foreach ( (array) $values as $value ) {
				$value = (string) $value;
				if ( '' !== $value ) {
					$clean[] = $value;
				}
			}
			if ( empty( $clean ) ) {
				return array();
			}
			$append = array();
			foreach ( $result as $combo ) {
				foreach ( $clean as $value ) {
					$next           = $combo;
					$next[ $key ]   = $value;
					$append[]       = $next;
				}
			}
			$result = $append;
		}
		return $result;
	}

	/**
	 * @param WC_Product $parent Parent variable product.
	 * @param object     $data_store WC product data store.
	 * @param array      $combo Attribute map.
	 * @return int Matching variation ID or 0.
	 */
	private static function find_variation_for_combo( $parent, $data_store, $combo ) {
		$match = array();
		foreach ( $combo as $name => $value ) {
			$match[ 'attribute_' . sanitize_title( (string) $name ) ] = $value;
		}
		if ( ! is_object( $data_store ) || ! method_exists( $data_store, 'find_matching_product_variation' ) ) {
			return 0;
		}
		$found = $data_store->find_matching_product_variation( $parent, $match );
		return $found ? (int) $found : 0;
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_get( $request ) {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$o = wc_get_order( (int) $request['id'] );
		if ( ! $o ) {
			return new WP_Error( 'not_found', 'Not found', array( 'status' => 404 ) );
		}
		return new WP_REST_Response( Webino_Dashboard_Orders::map_detail( $o ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_patch( $request ) {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$o = wc_get_order( (int) $request['id'] );
		if ( ! $o ) {
			return new WP_Error( 'not_found', 'Not found', array( 'status' => 404 ) );
		}
		$st = sanitize_key( (string) $request->get_param( 'status' ) );
		if ( $st ) {
			$result = $o->update_status( $st );
			if ( is_wp_error( $result ) ) {
				return $result;
			}
		}
		if ( null !== $request->get_param( 'tracking_code' ) ) {
			$o->update_meta_data( 'woobale_tracking_code', sanitize_text_field( (string) $request->get_param( 'tracking_code' ) ) );
			$o->save();
		}
		if ( null !== $request->get_param( 'tracking_provider' ) ) {
			$o->update_meta_data( '_tracking_provider', sanitize_text_field( (string) $request->get_param( 'tracking_provider' ) ) );
			$o->save();
		}
		return self::order_get( $request );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_note_create( $request ) {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$o = wc_get_order( (int) $request['id'] );
		if ( ! $o ) {
			return new WP_Error( 'not_found', 'Not found', array( 'status' => 404 ) );
		}
		$content = sanitize_textarea_field( (string) $request->get_param( 'content' ) );
		if ( '' === $content ) {
			return new WP_Error( 'invalid', __( 'Note content required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$customer_note = (bool) $request->get_param( 'customer_note' );
		$note_id       = $o->add_order_note( $content, (int) $customer_note, true );
		return new WP_REST_Response( array( 'id' => (int) $note_id ), 201 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function order_note_delete( $request ) {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$o = wc_get_order( (int) $request['id'] );
		if ( ! $o ) {
			return new WP_Error( 'not_found', 'Not found', array( 'status' => 404 ) );
		}
		$deleted = $o->delete_note( (int) $request['note_id'] );
		if ( ! $deleted ) {
			return new WP_Error( 'fail', __( 'Could not delete note.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return void|WP_Error
	 */
	public static function order_print( $request ) {
		if ( ! Webino_Dashboard_Orders::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$o = wc_get_order( (int) $request['id'] );
		if ( ! $o ) {
			return new WP_Error( 'not_found', 'Not found', array( 'status' => 404 ) );
		}
		$type = sanitize_key( (string) $request->get_param( 'type' ) );
		if ( ! in_array( $type, array( 'invoice', 'label', 'receipt' ), true ) ) {
			return new WP_Error( 'invalid', __( 'Invalid document type.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$user_id = get_current_user_id();
		$locale  = Webino_Dashboard_I18n::get_user_locale( $user_id );

		Webino_Dashboard_I18n::with_user_locale(
			function () use ( $o, $type, $locale ) {
				$html = Webino_Dashboard_Order_Documents::render( $o, $type, $locale );
				header( 'Content-Type: text/html; charset=utf-8' );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo $html;
				exit;
			},
			$user_id
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function reports_sales( $request ) {
		$from_ts = Webino_Dashboard_Order_Reports::parse_timestamp( $request->get_param( 'from' ) ?: strtotime( '-30 days' ) );
		$to_ts   = Webino_Dashboard_Order_Reports::parse_timestamp( $request->get_param( 'to' ) ?: time() );
		$sum     = 0.0;
		$n       = 0;
		$truncated = false;
		if ( function_exists( 'wc_get_orders' ) ) {
			// Keep aggregate path for legacy callers + smoke tests.
			$agg       = Webino_Dashboard_Order_Aggregates::sum_orders_in_range(
				array(
					'status'       => Webino_Dashboard_Order_Reports::default_statuses(),
					'date_created' => (int) $from_ts . '...' . (int) $to_ts,
				)
			);
			$sum       = (float) $agg['revenue'];
			$n         = (int) $agg['order_count'];
			$truncated = ! empty( $agg['truncated'] );
		}

		$pnl = null;
		if ( class_exists( 'Webino_Dashboard_Order_Reports', false ) ) {
			$pnl_response = Webino_Dashboard_Order_Reports::rest_sales_pnl( $request );
			if ( ! is_wp_error( $pnl_response ) ) {
				$pnl = $pnl_response->get_data();
			}
		}

		$payload = array(
			'revenue'     => $sum,
			'order_count' => $n,
			'from'        => $from_ts,
			'to'          => $to_ts,
			'from_date'   => gmdate( 'c', $from_ts ),
			'to_date'     => gmdate( 'c', $to_ts ),
			'truncated'   => $truncated,
		);
		if ( is_array( $pnl ) ) {
			$payload = array_merge( $pnl, $payload );
			if ( isset( $pnl['summary']['revenue'] ) ) {
				$payload['revenue'] = (float) $pnl['summary']['revenue'];
			}
			if ( isset( $pnl['summary']['order_count'] ) ) {
				$payload['order_count'] = (int) $pnl['summary']['order_count'];
			}
			if ( ! empty( $pnl['truncated'] ) ) {
				$payload['truncated'] = true;
			}
		}
		return new WP_REST_Response( $payload );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function coupon_get( $request ) {
		if ( ! class_exists( 'WC_Coupon' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$c = new WC_Coupon( (int) $request['id'] );
		if ( ! $c->get_id() ) {
			return new WP_Error( 'not_found', 'Not found', array( 'status' => 404 ) );
		}
		return new WP_REST_Response( Webino_Dashboard_Coupons::map_detail( $c ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function coupon_create( $request ) {
		if ( ! class_exists( 'WC_Coupon' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$c = new WC_Coupon();
		$c->set_code( sanitize_text_field( (string) $request->get_param( 'code' ) ) );
		$c->set_discount_type( sanitize_key( (string) $request->get_param( 'type' ) ) ?: 'fixed_cart' );
		$c->set_amount( (string) $request->get_param( 'amount' ) );
		Webino_Dashboard_Coupons::apply_rest_fields( $c, $request );
		$c->save();
		$post_ok = Webino_Dashboard_Coupons::apply_post_fields( $c->get_id(), $request );
		if ( is_wp_error( $post_ok ) ) {
			return $post_ok;
		}
		return new WP_REST_Response( Webino_Dashboard_Coupons::map_detail( new WC_Coupon( $c->get_id() ) ), 201 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function coupon_patch( $request ) {
		if ( ! class_exists( 'WC_Coupon' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$c = new WC_Coupon( (int) $request['id'] );
		if ( ! $c->get_id() ) {
			return new WP_Error( 'not_found', 'Not found', array( 'status' => 404 ) );
		}
		if ( $request->get_param( 'amount' ) !== null ) {
			$c->set_amount( (string) $request->get_param( 'amount' ) );
		}
		if ( $request->get_param( 'code' ) ) {
			$c->set_code( sanitize_text_field( (string) $request->get_param( 'code' ) ) );
		}
		if ( null !== $request->get_param( 'type' ) ) {
			$c->set_discount_type( sanitize_key( (string) $request->get_param( 'type' ) ) ?: 'fixed_cart' );
		}
		Webino_Dashboard_Coupons::apply_rest_fields( $c, $request );
		$c->save();
		$post_ok = Webino_Dashboard_Coupons::apply_post_fields( $c->get_id(), $request );
		if ( is_wp_error( $post_ok ) ) {
			return $post_ok;
		}
		return self::coupon_get( $request );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function coupon_delete( $request ) {
		if ( ! class_exists( 'WC_Coupon' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$c = new WC_Coupon( (int) $request['id'] );
		if ( ! $c->get_id() ) {
			return new WP_Error( 'not_found', 'Not found', array( 'status' => 404 ) );
		}
		wp_trash_post( $c->get_id() );
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * Map REST comment status filter to get_comments() args.
	 *
	 * @param string $status REST status: all|hold|approve|spam|trash.
	 * @return array<string, mixed>
	 */
	public static function comment_query_args_for_status( $status ) {
		$status = sanitize_key( (string) $status );
		if ( 'all' === $status ) {
			return array();
		}
		return array( 'status' => $status );
	}

	/**
	 * @return array{all:int,hold:int,approve:int,spam:int,trash:int}
	 */
	public static function comment_counts() {
		return array(
			'all'     => (int) get_comments( array( 'count' => true ) ),
			'hold'    => (int) get_comments( array( 'count' => true, 'status' => 'hold' ) ),
			'approve' => (int) get_comments( array( 'count' => true, 'status' => 'approve' ) ),
			'spam'    => (int) get_comments( array( 'count' => true, 'status' => 'spam' ) ),
			'trash'   => (int) get_comments( array( 'count' => true, 'status' => 'trash' ) ),
		);
	}

	/**
	 * @param WP_Comment|int|null $comment Comment object or ID.
	 * @return array<string, mixed>|null
	 */
	public static function serialize_comment( $comment ) {
		if ( is_numeric( $comment ) ) {
			$comment = get_comment( (int) $comment );
		}
		if ( ! $comment instanceof WP_Comment ) {
			return null;
		}

		$content = wp_strip_all_tags( $comment->comment_content );
		$excerpt = $content;
		if ( function_exists( 'mb_strlen' ) && function_exists( 'mb_substr' ) ) {
			if ( mb_strlen( $excerpt ) > 150 ) {
				$excerpt = mb_substr( $excerpt, 0, 150 ) . '…';
			}
		} elseif ( strlen( $excerpt ) > 150 ) {
			$excerpt = substr( $excerpt, 0, 150 ) . '…';
		}

		$post           = get_post( (int) $comment->comment_post_ID );
		$parent_excerpt = '';
		if ( (int) $comment->comment_parent > 0 ) {
			$parent = get_comment( (int) $comment->comment_parent );
			if ( $parent ) {
				$parent_text = wp_strip_all_tags( $parent->comment_content );
				if ( function_exists( 'mb_strlen' ) && function_exists( 'mb_substr' ) ) {
					if ( mb_strlen( $parent_text ) > 120 ) {
						$parent_excerpt = mb_substr( $parent_text, 0, 120 ) . '…';
					} else {
						$parent_excerpt = $parent_text;
					}
				} elseif ( strlen( $parent_text ) > 120 ) {
					$parent_excerpt = substr( $parent_text, 0, 120 ) . '…';
				} else {
					$parent_excerpt = $parent_text;
				}
			}
		}

		return array(
			'id'             => (int) $comment->comment_ID,
			'parent_id'      => (int) $comment->comment_parent,
			'author'         => $comment->comment_author,
			'author_email'   => $comment->comment_author_email,
			'content'        => $content,
			'excerpt'        => $excerpt,
			'status'         => wp_get_comment_status( $comment->comment_ID ),
			'date'           => mysql2date( 'c', $comment->comment_date_gmt, false ),
			'post_id'        => (int) $comment->comment_post_ID,
			'post_title'     => $post ? get_the_title( $post ) : '',
			'post_url'       => $post ? get_permalink( $post ) : '',
			'post_type'      => $post ? $post->post_type : '',
			'parent_excerpt' => $parent_excerpt,
			'user_id'        => (int) $comment->user_id,
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function comment_get( $request ) {
		$id = (int) $request['id'];
		$c  = get_comment( $id );
		if ( ! $c ) {
			return new WP_Error( 'not_found', __( 'Comment not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$row = self::serialize_comment( $c );
		if ( ! $row ) {
			return new WP_Error( 'not_found', __( 'Comment not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response( $row );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function comment_create( $request ) {
		$post_id   = (int) $request->get_param( 'post_id' );
		$parent_id = (int) $request->get_param( 'parent_id' );
		$content   = trim( (string) $request->get_param( 'content' ) );

		if ( $post_id < 1 || ! get_post( $post_id ) ) {
			return new WP_Error( 'invalid_post', __( 'Post not found.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( '' === $content ) {
			return new WP_Error( 'invalid', __( 'Comment content is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( $parent_id > 0 && ! get_comment( $parent_id ) ) {
			return new WP_Error( 'invalid_parent', __( 'Parent comment not found.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$user = wp_get_current_user();
		$id   = wp_new_comment(
			array(
				'comment_post_ID'      => $post_id,
				'comment_parent'       => $parent_id,
				'comment_content'      => wp_kses_post( $content ),
				'user_id'              => $user->ID,
				'comment_author'       => $user->display_name,
				'comment_author_email' => $user->user_email,
				'comment_approved'     => 1,
			),
			true
		);
		if ( is_wp_error( $id ) ) {
			return $id;
		}

		$row = self::serialize_comment( (int) $id );
		return new WP_REST_Response( $row, 201 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function comment_patch( $request ) {
		$id = (int) $request['id'];
		$c  = get_comment( $id );
		if ( ! $c ) {
			return new WP_Error( 'not_found', __( 'Comment not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}

		$st = sanitize_key( (string) $request->get_param( 'status' ) );
		if ( '' !== $st ) {
			$allowed_st = array( 'approved', 'spam', 'hold', 'trash' );
			if ( ! in_array( $st, $allowed_st, true ) ) {
				return new WP_Error( 'invalid', __( 'Invalid comment status.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
			$ok = true;
			if ( 'approved' === $st ) {
				if ( 'trash' === wp_get_comment_status( $id ) ) {
					$ok = (bool) wp_untrash_comment( $id );
				}
				if ( $ok ) {
					$ok = (bool) wp_set_comment_status( $id, 'approve' );
				}
			} elseif ( 'spam' === $st ) {
				$ok = (bool) wp_spam_comment( $id );
			} elseif ( 'hold' === $st ) {
				if ( 'trash' === wp_get_comment_status( $id ) ) {
					$ok = (bool) wp_untrash_comment( $id );
				}
				if ( $ok ) {
					$ok = (bool) wp_set_comment_status( $id, 'hold' );
				}
			} elseif ( 'trash' === $st ) {
				$ok = (bool) wp_trash_comment( $id );
			}
			if ( ! $ok ) {
				return new WP_Error( 'fail', __( 'Could not update comment status.', 'webino-dashboard' ), array( 'status' => 500 ) );
			}
		}

		$update = array( 'comment_ID' => $id );
		$dirty  = false;
		if ( null !== $request->get_param( 'content' ) ) {
			$update['comment_content'] = wp_kses_post( (string) $request->get_param( 'content' ) );
			$dirty                     = true;
		}
		if ( null !== $request->get_param( 'author' ) ) {
			$update['comment_author'] = sanitize_text_field( (string) $request->get_param( 'author' ) );
			$dirty                    = true;
		}
		if ( null !== $request->get_param( 'author_email' ) ) {
			$update['comment_author_email'] = sanitize_email( (string) $request->get_param( 'author_email' ) );
			$dirty                          = true;
		}
		if ( $dirty ) {
			$updated = wp_update_comment( $update );
			if ( false === $updated ) {
				return new WP_Error( 'fail', __( 'Could not update comment.', 'webino-dashboard' ), array( 'status' => 500 ) );
			}
		}

		$row = self::serialize_comment( $id );
		if ( ! $row ) {
			return new WP_Error( 'not_found', __( 'Comment not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response( $row );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function comment_delete( $request ) {
		$id = (int) $request['id'];
		if ( ! get_comment( $id ) ) {
			return new WP_Error( 'not_found', __( 'Comment not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( ! wp_delete_comment( $id, true ) ) {
			return new WP_Error( 'fail', __( 'Could not delete comment.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}
}
