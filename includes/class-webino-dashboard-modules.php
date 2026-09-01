<?php
/**
 * Default module registry (sidebar) — filterable.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds default module tree from README.
 */
class Webino_Dashboard_Modules {

	const NAV_GROUP_CONTENT = 'content';
	const NAV_GROUP_SHOP    = 'shop';
	const NAV_GROUP_TOOLS   = 'tools';
	const NAV_GROUP_REPORTS = 'reports';
	const NAV_GROUP_ADMIN   = 'admin';

	/**
	 * Whether a dashboard module slug is enabled (option). Overview (home) is always on.
	 * `settings-app` falls back to legacy `webino_dashboard_module_settings_active` if needed.
	 *
	 * @param string $slug Module id.
	 * @return bool
	 */
	public static function is_module_enabled( $slug ) {
		$slug = sanitize_key( (string) $slug );
		if ( '' === $slug || 'home' === $slug ) {
			return true;
		}
		if ( 'settings-app' === $slug || 'settings' === $slug ) {
			$explicit = get_option( 'webino_dashboard_module_settings-app_active', null );
			if ( null !== $explicit ) {
				return (bool) $explicit;
			}
			return (bool) get_option( 'webino_dashboard_module_settings_active', true );
		}
		if ( class_exists( 'Webino_Dashboard_Module_Registry', false ) ) {
			$package_slug = Webino_Dashboard_Module_Registry::slug_for_sidebar_module_id( $slug );
			if ( '' !== $package_slug && Webino_Dashboard_Module_Registry::is_installed( $package_slug ) ) {
				return Webino_Dashboard_Module_Registry::is_active( $package_slug );
			}
		}
		return (bool) get_option( 'webino_dashboard_module_' . $slug . '_active', true );
	}

	/**
	 * Wallet gateway package is installed and switched on.
	 *
	 * @return bool
	 */
	public static function is_wallet_module_active() {
		if ( class_exists( 'Webino_Dashboard_Module_Registry', false ) ) {
			if ( ! Webino_Dashboard_Module_Registry::is_installed( 'wallet-gateway-module' ) ) {
				return false;
			}
			return Webino_Dashboard_Module_Registry::is_active( 'wallet-gateway-module' );
		}
		return self::is_module_enabled( 'wallet-gateway-module' );
	}

	/**
	 * Copy legacy `bots` parent toggle to bots / bale-bot / telegram-bot when child options were never set.
	 *
	 * @return void
	 */
	public static function maybe_migrate_legacy_options() {
		$legacy = get_option( 'webino_dashboard_module_bots_active', null );
		if ( null === $legacy ) {
			return;
		}
		foreach ( array( 'bots', 'bale-bot-module', 'telegram-bot-module' ) as $slug ) {
			if ( null === get_option( 'webino_dashboard_module_' . $slug . '_active', null ) ) {
				update_option( 'webino_dashboard_module_' . $slug . '_active', $legacy, false );
			}
		}
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	public static function get_default_modules() {
		$modules = array(
			array(
				'id'         => 'home',
				'title'      => __( 'Overview', 'webino-dashboard' ),
				'path'       => '/',
				'capability' => 'read',
				'icon'       => 'layout-dashboard',
			),
			array(
				'id'         => 'magazine',
				'nav_group'  => self::NAV_GROUP_CONTENT,
				'title'      => __( 'Magazine', 'webino-dashboard' ),
				'path'       => '/magazine',
				'capability' => 'edit_posts',
				'icon'       => 'newspaper',
				'children'   => array(
					array( 'id' => 'posts', 'title' => __( 'All posts', 'webino-dashboard' ), 'path' => '/magazine/posts', 'capability' => 'edit_posts' ),
					array( 'id' => 'categories', 'title' => __( 'Categories', 'webino-dashboard' ), 'path' => '/magazine/categories', 'capability' => 'manage_categories' ),
				),
			),
			array(
				'id'         => 'media',
				'nav_group'  => self::NAV_GROUP_CONTENT,
				'title'      => __( 'Media library', 'webino-dashboard' ),
				'path'       => '/media',
				'capability' => 'upload_files',
				'icon'       => 'images',
				'children'   => array(
					array( 'id' => 'media-library', 'title' => __( 'Media', 'webino-dashboard' ), 'path' => '/media', 'capability' => 'upload_files' ),
					array( 'id' => 'media-folders', 'title' => __( 'Folders', 'webino-dashboard' ), 'path' => '/media/folders', 'capability' => 'upload_files' ),
					array( 'id' => 'media-categories', 'title' => __( 'Categories', 'webino-dashboard' ), 'path' => '/media/categories', 'capability' => 'upload_files' ),
				),
			),
			array(
				'id'         => 'pages',
				'nav_group'  => self::NAV_GROUP_CONTENT,
				'title'      => __( 'Site pages', 'webino-dashboard' ),
				'path'       => '/pages',
				'capability' => 'edit_pages',
				'icon'       => 'file-text',
			),
			array(
				'id'         => 'shop',
				'nav_group'  => self::NAV_GROUP_SHOP,
				'title'      => __( 'Store', 'webino-dashboard' ),
				'path'       => '/shop',
				'capability' => 'edit_products',
				'icon'       => 'shopping-bag',
				'children'   => array(
					array( 'id' => 'products', 'title' => __( 'Products', 'webino-dashboard' ), 'path' => '/shop/products', 'capability' => 'edit_products' ),
					array( 'id' => 'brands', 'title' => __( 'Brands', 'webino-dashboard' ), 'path' => '/shop/brands', 'capability' => 'manage_product_terms' ),
					array( 'id' => 'product-cats', 'title' => __( 'Product categories', 'webino-dashboard' ), 'path' => '/shop/product-categories', 'capability' => 'manage_product_terms' ),
					array( 'id' => 'attributes', 'title' => __( 'Attributes', 'webino-dashboard' ), 'path' => '/shop/attributes', 'capability' => 'manage_product_terms' ),
					array( 'id' => 'shop-tickets', 'title' => __( 'Support tickets', 'webino-dashboard' ), 'path' => '/shop/tickets', 'capability' => 'edit_shop_orders' ),
				),
			),
			array(
				'id'         => 'orders',
				'nav_group'  => self::NAV_GROUP_SHOP,
				'title'      => __( 'Orders', 'webino-dashboard' ),
				'path'       => '/orders',
				'capability' => 'edit_shop_orders',
				'icon'       => 'package',
				'children'   => array(
					array( 'id' => 'order-list', 'title' => __( 'Orders', 'webino-dashboard' ), 'path' => '/orders/list', 'capability' => 'edit_shop_orders' ),
					array( 'id' => 'order-new', 'title' => __( 'New order', 'webino-dashboard' ), 'path' => '/orders/new', 'capability' => 'webino_create_shop_orders' ),
				),
			),
			array(
				'id'         => 'pos',
				'nav_group'  => self::NAV_GROUP_SHOP,
				'title'      => __( 'Cashier', 'webino-dashboard' ),
				'path'       => '/pos',
				'capability' => 'webino_pos',
				'icon'       => 'shopping-cart',
				'children'   => array(
					array( 'id' => 'pos-register', 'title' => __( 'Register', 'webino-dashboard' ), 'path' => '/pos', 'capability' => 'webino_pos' ),
					array( 'id' => 'pos-my-orders', 'title' => __( 'My POS orders', 'webino-dashboard' ), 'path' => '/orders/list', 'capability' => 'webino_view_own_shop_orders' ),
				),
			),
			array(
				'id'         => 'account-portal',
				'nav_group'  => self::NAV_GROUP_SHOP,
				'title'      => __( 'My account', 'webino-dashboard' ),
				'path'       => '/account',
				'capability' => 'webino_account_portal',
				'icon'       => 'user',
				'children'   => array(
					array( 'id' => 'account-home', 'title' => __( 'Overview', 'webino-dashboard' ), 'path' => '/account', 'capability' => 'webino_account_portal' ),
					array( 'id' => 'account-orders', 'title' => __( 'My orders', 'webino-dashboard' ), 'path' => '/account/orders', 'capability' => 'webino_account_portal' ),
					array( 'id' => 'account-addresses', 'title' => __( 'Addresses', 'webino-dashboard' ), 'path' => '/account/addresses', 'capability' => 'webino_account_portal' ),
					array( 'id' => 'account-notifications', 'title' => __( 'Notifications', 'webino-dashboard' ), 'path' => '/account/notifications', 'capability' => 'webino_account_portal' ),
					array( 'id' => 'account-favorites', 'title' => __( 'Favorites', 'webino-dashboard' ), 'path' => '/account/favorites', 'capability' => 'webino_account_portal' ),
					array( 'id' => 'account-reviews', 'title' => __( 'Reviews & questions', 'webino-dashboard' ), 'path' => '/account/reviews', 'capability' => 'webino_account_portal' ),
					array( 'id' => 'account-profile', 'title' => __( 'Account info', 'webino-dashboard' ), 'path' => '/account/profile', 'capability' => 'webino_account_portal' ),
					array( 'id' => 'account-wallet', 'title' => __( 'Wallet', 'webino-dashboard' ), 'path' => '/account/wallet', 'capability' => 'webino_account_portal' ),
					array( 'id' => 'account-tickets', 'title' => __( 'Support', 'webino-dashboard' ), 'path' => '/account/tickets', 'capability' => 'webino_account_portal' ),
				),
			),
			array(
				'id'                   => 'shop-reports',
				'nav_group'            => self::NAV_GROUP_REPORTS,
				'title'                => __( 'Store analytics', 'webino-dashboard' ),
				'path'                 => '/reports/overview',
				'capability'           => 'view_woocommerce_reports',
				'icon'                 => 'line-chart',
				'requires_woocommerce' => true,
				'children'             => array(
					array( 'id' => 'shop-reports-overview', 'title' => __( 'Overview', 'webino-dashboard' ), 'path' => '/reports/overview', 'capability' => 'view_woocommerce_reports' ),
					array( 'id' => 'shop-reports-revenue', 'title' => __( 'Revenue', 'webino-dashboard' ), 'path' => '/reports/revenue', 'capability' => 'view_woocommerce_reports' ),
					array( 'id' => 'shop-reports-orders', 'title' => __( 'Orders', 'webino-dashboard' ), 'path' => '/reports/orders', 'capability' => 'view_woocommerce_reports' ),
					array( 'id' => 'shop-reports-products', 'title' => __( 'Products', 'webino-dashboard' ), 'path' => '/reports/products', 'capability' => 'view_woocommerce_reports' ),
					array( 'id' => 'shop-reports-variations', 'title' => __( 'Variations', 'webino-dashboard' ), 'path' => '/reports/variations', 'capability' => 'view_woocommerce_reports' ),
					array( 'id' => 'shop-reports-categories', 'title' => __( 'Categories', 'webino-dashboard' ), 'path' => '/reports/categories', 'capability' => 'view_woocommerce_reports' ),
					array( 'id' => 'shop-reports-coupons', 'title' => __( 'Coupons', 'webino-dashboard' ), 'path' => '/reports/coupons', 'capability' => 'view_woocommerce_reports' ),
					array( 'id' => 'shop-reports-taxes', 'title' => __( 'Taxes', 'webino-dashboard' ), 'path' => '/reports/taxes', 'capability' => 'view_woocommerce_reports' ),
					array( 'id' => 'shop-reports-customers', 'title' => __( 'Customers', 'webino-dashboard' ), 'path' => '/reports/customers', 'capability' => 'view_woocommerce_reports' ),
					array( 'id' => 'shop-reports-downloads', 'title' => __( 'Downloads', 'webino-dashboard' ), 'path' => '/reports/downloads', 'capability' => 'view_woocommerce_reports' ),
					array( 'id' => 'shop-reports-stock', 'title' => __( 'Stock', 'webino-dashboard' ), 'path' => '/reports/stock', 'capability' => 'view_woocommerce_reports' ),
					array( 'id' => 'shop-reports-sales', 'title' => __( 'Sales & profit', 'webino-dashboard' ), 'path' => '/reports/sales', 'capability' => 'view_woocommerce_reports' ),
					array( 'id' => 'shop-reports-financial', 'title' => __( 'Financial', 'webino-dashboard' ), 'path' => '/reports/financial', 'capability' => 'view_woocommerce_reports' ),
				),
			),
			array(
				'id'         => 'marketing',
				'nav_group'  => self::NAV_GROUP_SHOP,
				'title'      => __( 'Marketing', 'webino-dashboard' ),
				'path'       => '/marketing',
				'capability' => 'edit_shop_coupons',
				'icon'       => 'percent',
				'children'   => array(
					array( 'id' => 'coupons', 'title' => __( 'Coupons', 'webino-dashboard' ), 'path' => '/marketing/coupons', 'capability' => 'edit_shop_coupons' ),
				),
			),
			array(
				'id'                   => 'bots',
				'nav_group'            => self::NAV_GROUP_TOOLS,
				'title'                => __( 'Bots', 'webino-dashboard' ),
				'path'                 => '/bots/bale',
				'capability'           => 'manage_woocommerce',
				'icon'                 => 'bot',
				'requires_woocommerce' => true,
				// Children come from bale-bot-module / telegram-bot-module manifests.
				// Hardcoded bots-bale / bots-telegram caused duplicate sidebar entries.
				'children'             => array(),
			),
			array(
				'id'                   => 'notifications-hub',
				'nav_group'            => self::NAV_GROUP_TOOLS,
				'title'                => __( 'Notification system', 'webino-dashboard' ),
				'path'                 => '/notifications',
				'capability'           => 'manage_woocommerce',
				'icon'                 => 'bell',
				'requires_woocommerce' => true,
			),
			array(
				'id'         => 'marketplace',
				'nav_group'  => self::NAV_GROUP_ADMIN,
				'title'      => __( 'Marketplace', 'webino-dashboard' ),
				'path'       => '/marketplace',
				'capability' => 'manage_options',
				'icon'       => 'store',
				'children'   => array(
					array(
						'id'         => 'marketplace-catalog',
						'title'      => __( 'Marketplace', 'webino-dashboard' ),
						'path'       => '/marketplace',
						'capability' => 'manage_options',
					),
					array(
						'id'         => 'my-modules',
						'title'      => __( 'My modules', 'webino-dashboard' ),
						'path'       => '/marketplace/installed',
						'capability' => 'manage_options',
					),
				),
			),
			array(
				'id'         => 'users',
				'nav_group'  => self::NAV_GROUP_ADMIN,
				'title'      => __( 'Users', 'webino-dashboard' ),
				'path'       => '/users',
				'capability' => 'list_users',
				'icon'       => 'users',
				'children'   => array(
					array( 'id' => 'user-list', 'title' => __( 'Users', 'webino-dashboard' ), 'path' => '/users/list', 'capability' => 'list_users' ),
					array( 'id' => 'comments', 'title' => __( 'Comments', 'webino-dashboard' ), 'path' => '/users/comments', 'capability' => 'moderate_comments' ),
				),
			),
			array(
				'id'                   => 'settings-app',
				'nav_group'            => self::NAV_GROUP_ADMIN,
				'title'                => __( 'Settings', 'webino-dashboard' ),
				'path'                 => '/settings',
				'capability'           => 'manage_options',
				'icon'                 => 'settings',
				'ignore_parent_toggle' => true,
				'children'             => array(
					array(
						'id'         => 'settings-site',
						'title'      => __( 'Site management', 'webino-dashboard' ),
						'path'       => '/settings/site/general',
						'capability' => 'manage_options',
					),
					array(
						'id'         => 'settings-shop',
						'title'      => __( 'Shop management', 'webino-dashboard' ),
						'path'       => '/settings/shop/general',
						'capability' => 'manage_woocommerce',
					),
				),
			),
		);

		/**
		 * Filter registered dashboard modules (sidebar).
		 *
		 * @param array<int,array<string,mixed>> $modules Tree.
		 */
		return apply_filters( 'webino_dashboard_modules', $modules );
	}

	/**
	 * All module ids (recursive) for settings / options. Skips nodes with exclude_from_module_toggle.
	 *
	 * @param array<int,array<string,mixed>> $modules Modules tree.
	 * @return list<string>
	 */
	public static function collect_module_ids( $modules ) {
		$ids = array();
		foreach ( $modules as $m ) {
			self::collect_module_ids_walk( $m, $ids );
		}
		return array_values( array_unique( $ids ) );
	}

	/**
	 * @param array<string,mixed> $node Node.
	 * @param list<string>        $ids  Out ids.
	 * @return void
	 */
	private static function collect_module_ids_walk( $node, array &$ids ) {
		if ( ! is_array( $node ) ) {
			return;
		}
		$id = isset( $node['id'] ) ? (string) $node['id'] : '';
		if ( $id && empty( $node['exclude_from_module_toggle'] ) ) {
			$ids[] = $id;
		}
		if ( ! empty( $node['children'] ) && is_array( $node['children'] ) ) {
			foreach ( $node['children'] as $c ) {
				self::collect_module_ids_walk( $c, $ids );
			}
		}
	}
}
