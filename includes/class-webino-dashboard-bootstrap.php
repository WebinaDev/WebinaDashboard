<?php
/**
 * Safe core file loader — avoids site-wide fatals on partial plugin deploys.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads Webino Dashboard PHP includes with readability checks.
 */
final class Webino_Dashboard_Bootstrap {

	const BROKEN_OPTION = 'webino_dashboard_core_broken';

	/**
	 * @return bool True when critical core loaded and plugin may boot.
	 */
	public static function load() {
		$critical = array(
			'includes/class-webino-dashboard-i18n.php',
			'includes/class-webino-dashboard-install.php',
			'includes/class-webino-dashboard-license.php',
			'includes/class-webino-dashboard-module-registry.php',
			'includes/class-webino-dashboard-modules.php',
			'includes/class-webino-dashboard-taxonomies.php',
			'includes/class-webino-dashboard-rest-base.php',
			'includes/class-webino-dashboard-roles.php',
			'includes/class-webino-dashboard-zip.php',
			'includes/class-webino-dashboard-remote-url.php',
			'includes/class-webino-dashboard-rest.php',
			'includes/class-webino-dashboard-rest-crud.php',
			'includes/class-webino-dashboard-product-slugs.php',
			'includes/class-webino-dashboard-attribute-groups.php',
			'includes/class-webino-dashboard-variation-swatches.php',
			'includes/class-webino-dashboard-order-configs.php',
			'includes/class-webino-dashboard-home-overview.php',
			'includes/class-webino-dashboard-marketplace.php',
			'includes/class-webino-dashboard-orders.php',
			'includes/class-webino-dashboard-order-notes.php',
			'includes/class-webino-dashboard-order-writer.php',
			'includes/class-webino-dashboard-order-returns.php',
			'includes/class-webino-dashboard-pay-order.php',
			'includes/class-webino-dashboard-checkout-geo.php',
			'includes/class-webino-dashboard-order-reports.php',
			'includes/class-webino-dashboard-inventory-reports.php',
			'includes/class-webino-dashboard-order-aggregates.php',
			'includes/class-webino-dashboard-coupons.php',
			'includes/class-webino-dashboard-coupon-restrictions.php',
			'includes/class-webino-dashboard-users.php',
			'includes/class-webino-dashboard-addresses.php',
			'includes/class-webino-dashboard-account-portal.php',
			'includes/class-webino-dashboard-notifications.php',
			'includes/class-webino-dashboard-notify-copy.php',
			'includes/class-webino-dashboard-notify.php',
			'includes/class-webino-dashboard-auth-otp.php',
			'includes/class-webino-dashboard-mailer.php',
			'includes/class-webino-dashboard-rest-notify.php',
			'includes/class-webino-dashboard-support-tickets.php',
			'includes/class-webino-dashboard-wallet.php',
			'includes/class-webino-dashboard-rest-account.php',
			'includes/class-webino-dashboard-barcode.php',
			'includes/class-webino-dashboard-order-documents.php',
			'includes/class-webino-dashboard-order-document-settings.php',
			'includes/class-webino-dashboard-locale.php',
			'includes/class-webino-dashboard-currency.php',
			'includes/class-webino-dashboard-rest-site-settings.php',
			'includes/class-webino-dashboard-rest-wc-settings.php',
			'includes/class-webino-dashboard-ssr.php',
			'includes/class-webino-dashboard-rewrite.php',
			'includes/class-webino-dashboard-pwa.php',
			'includes/class-webino-dashboard-brand-style.php',
			'includes/class-webino-dashboard-assets.php',
			'includes/class-webino-dashboard-plugin.php',
		);

		$optional = array(
			'includes/bots/class-webino-dashboard-bots-core.php',
			'includes/class-webino-dashboard-marketplace-install-job.php',
			'includes/class-webino-dashboard-rest-marketplace.php',
			'includes/class-webino-dashboard-core-updater.php',
			'includes/class-webino-dashboard-rest-core-update.php',
			'includes/class-webino-dashboard-build-pipeline.php',
			'includes/class-webino-dashboard-rest-build-pipeline.php',
		);

		$missing_critical = array();
		foreach ( $critical as $relative ) {
			if ( ! self::require_file( $relative ) ) {
				$missing_critical[] = $relative;
			}
		}

		if ( $missing_critical ) {
			self::mark_broken( $missing_critical );
			return false;
		}

		delete_option( self::BROKEN_OPTION );

		foreach ( $optional as $relative ) {
			self::require_file( $relative, false );
		}

		return true;
	}

	/**
	 * @param string $relative Path relative to WEBINO_DASHBOARD_DIR.
	 * @param bool   $required When false, skip missing files.
	 * @return bool
	 */
	private static function require_file( $relative, $required = true ) {
		$path = WEBINO_DASHBOARD_DIR . ltrim( (string) $relative, '/' );
		if ( ! is_readable( $path ) ) {
			return ! $required;
		}
		require_once $path;
		return true;
	}

	/**
	 * @param array<int,string> $missing Missing critical paths.
	 * @return void
	 */
	private static function mark_broken( array $missing ) {
		update_option( self::BROKEN_OPTION, $missing, false );
		add_action(
			'admin_notices',
			static function () use ( $missing ) {
				if ( ! current_user_can( 'manage_options' ) ) {
					return;
				}
				echo '<div class="notice notice-error"><p>';
				echo esc_html__(
					'Webino Dashboard core files are missing or incomplete. Re-upload the full plugin package.',
					'webino-dashboard'
				);
				echo ' <code>' . esc_html( implode( ', ', $missing ) ) . '</code>';
				echo '</p></div>';
			}
		);
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log( '[Webino Dashboard] Critical core files missing: ' . implode( ', ', $missing ) );
	}

	/**
	 * @return void
	 */
	public static function boot_optional_services() {
		if ( class_exists( 'Webino_Dashboard_Modules', false ) ) {
			Webino_Dashboard_Modules::maybe_migrate_legacy_options();
		}
		if ( class_exists( 'Webino_Dashboard_License', false ) ) {
			Webino_Dashboard_License::instance();
		}
		if ( class_exists( 'Webino_Dashboard_REST_Site_Settings', false ) ) {
			Webino_Dashboard_REST_Site_Settings::init();
		}
		if ( class_exists( 'Webino_Dashboard_REST_WC_Settings', false ) ) {
			Webino_Dashboard_REST_WC_Settings::init();
		}
		if ( class_exists( 'Webino_Dashboard_Bots_Core', false ) ) {
			Webino_Dashboard_Bots_Core::init();
		}
		if ( class_exists( 'Webino_Dashboard_Module_Registry', false ) ) {
			Webino_Dashboard_Module_Registry::init();
		}
		if ( class_exists( 'Webino_Dashboard_Marketplace_Install_Job', false ) ) {
			Webino_Dashboard_Marketplace_Install_Job::init();
		}
		if ( class_exists( 'Webino_Dashboard_REST_Marketplace', false ) ) {
			Webino_Dashboard_REST_Marketplace::init();
		}
		if ( class_exists( 'Webino_Dashboard_REST_Core_Update', false ) ) {
			Webino_Dashboard_REST_Core_Update::init();
		}
		if ( class_exists( 'Webino_Dashboard_REST_Build_Pipeline', false ) ) {
			Webino_Dashboard_REST_Build_Pipeline::init();
		}
		if ( class_exists( 'Webino_Dashboard_Account_Portal', false ) ) {
			Webino_Dashboard_Account_Portal::init();
		}
		if ( class_exists( 'Webino_Dashboard_Notifications', false ) ) {
			Webino_Dashboard_Notifications::init_hooks();
			Webino_Dashboard_Notifications::ensure_table();
		}
		if ( class_exists( 'Webino_Dashboard_Notify', false ) ) {
			Webino_Dashboard_Notify::init();
		}
		if ( class_exists( 'Webino_Dashboard_Mailer', false ) ) {
			Webino_Dashboard_Mailer::init();
		}
		if ( class_exists( 'Webino_Dashboard_REST_Notify', false ) ) {
			Webino_Dashboard_REST_Notify::init();
		}
		if ( class_exists( 'Webino_Dashboard_Wallet', false ) ) {
			Webino_Dashboard_Wallet::init_hooks();
			Webino_Dashboard_Wallet::ensure_tables();
		}
		if ( class_exists( 'Webino_Dashboard_Support_Tickets', false ) ) {
			Webino_Dashboard_Support_Tickets::ensure_tables();
			Webino_Dashboard_Support_Tickets::init();
		}
		if ( class_exists( 'Webino_Dashboard_REST_Account', false ) ) {
			Webino_Dashboard_REST_Account::init();
		}
	}
}
