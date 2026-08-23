<?php
/**
 * Admin pages and AJAX.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Admin controller.
 */
class WNC_Admin {

	/**
	 * Register menu.
	 */
	public function add_menu() {
		$cap = 'manage_woocommerce';
		add_menu_page(
			__( 'WebinaConnector', 'webinaconnector' ),
			__( 'بازارگاه‌ها', 'webinaconnector' ),
			$cap,
			'wnc-dashboard',
			array( $this, 'page_dashboard' ),
			'dashicons-store',
			57
		);
		add_submenu_page( 'wnc-dashboard', __( 'داشبورد', 'webinaconnector' ), __( 'داشبورد', 'webinaconnector' ), $cap, 'wnc-dashboard', array( $this, 'page_dashboard' ) );
		add_submenu_page( 'wnc-dashboard', __( 'تنظیمات اتصال', 'webinaconnector' ), __( 'تنظیمات اتصال', 'webinaconnector' ), $cap, 'wnc-settings', array( $this, 'page_settings' ) );
		add_submenu_page( 'wnc-dashboard', __( 'نقشه محصولات', 'webinaconnector' ), __( 'نقشه محصولات', 'webinaconnector' ), $cap, 'wnc-mapping', array( $this, 'page_mapping' ) );
		add_submenu_page( 'wnc-dashboard', __( 'سفارش‌ها', 'webinaconnector' ), __( 'سفارش‌ها', 'webinaconnector' ), $cap, 'wnc-orders', array( $this, 'page_orders' ) );
		add_submenu_page( 'wnc-dashboard', __( 'لاگ و صف', 'webinaconnector' ), __( 'لاگ و صف', 'webinaconnector' ), $cap, 'wnc-logs', array( $this, 'page_logs' ) );
	}

	/**
	 * Enqueue assets.
	 *
	 * @param string $hook Hook.
	 */
	public function enqueue_assets( $hook ) {
		$screen = get_current_screen();
		$is_wnc = ( isset( $_GET['page'] ) && 0 === strpos( sanitize_text_field( wp_unslash( $_GET['page'] ) ), 'wnc-' ) );
		$is_product = $screen && in_array( $screen->id, array( 'product', 'edit-product' ), true );

		if ( ! $is_wnc && ! $is_product ) {
			return;
		}

		wp_enqueue_style( 'wnc-admin', WNC_PLUGIN_URL . 'admin/css/wnc-admin.css', array(), WNC_VERSION );
		wp_enqueue_script( 'wnc-admin', WNC_PLUGIN_URL . 'admin/js/wnc-admin.js', array( 'jquery' ), WNC_VERSION, true );
		wp_localize_script(
			'wnc-admin',
			'wncAdmin',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'wnc_admin_nonce' ),
				'i18n'    => array(
					'saved'   => __( 'ذخیره شد', 'webinaconnector' ),
					'error'   => __( 'خطا', 'webinaconnector' ),
					'confirm' => __( 'مطمئن هستید؟', 'webinaconnector' ),
				),
			)
		);
	}

	/**
	 * WFCP missing notice.
	 */
	public function maybe_wfcp_notice() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}
		if ( WNC_Pricing::wfcp_available() ) {
			return;
		}
		$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';
		if ( 0 !== strpos( $page, 'wnc-' ) ) {
			return;
		}
		echo '<div class="notice notice-warning"><p>';
		esc_html_e( 'برای قیمت‌گذاری جداگانه هر پلتفرم، افزونه Webina Woo Core را فعال کنید. در غیر این صورت قیمت ووکامرس پوش می‌شود.', 'webinaconnector' );
		echo '</p></div>';
	}

	/**
	 * Dashboard page.
	 */
	public function page_dashboard() {
		require WNC_PLUGIN_DIR . 'admin/partials/wnc-page-dashboard.php';
	}

	/**
	 * Settings page.
	 */
	public function page_settings() {
		require WNC_PLUGIN_DIR . 'admin/partials/wnc-page-settings.php';
	}

	/**
	 * Mapping page.
	 */
	public function page_mapping() {
		require WNC_PLUGIN_DIR . 'admin/partials/wnc-page-mapping.php';
	}

	/**
	 * Orders page.
	 */
	public function page_orders() {
		require WNC_PLUGIN_DIR . 'admin/partials/wnc-page-orders.php';
	}

	/**
	 * Logs page.
	 */
	public function page_logs() {
		require WNC_PLUGIN_DIR . 'admin/partials/wnc-page-logs.php';
	}

	/**
	 * Capability check for AJAX.
	 *
	 * @return bool
	 */
	private function can() {
		check_ajax_referer( 'wnc_admin_nonce', 'nonce' );
		return current_user_can( 'manage_woocommerce' );
	}

	/**
	 * Save platform settings.
	 */
	public function ajax_save_settings() {
		if ( ! $this->can() ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webinaconnector' ) ) );
		}
		$platform = isset( $_POST['platform'] ) ? sanitize_key( wp_unslash( $_POST['platform'] ) ) : '';
		if ( ! WNC_Platform_Registry::get( $platform ) ) {
			wp_send_json_error( array( 'message' => __( 'پلتفرم نامعتبر', 'webinaconnector' ) ) );
		}
		$data = array(
			'enabled'   => WNC_Settings::to_bool( $_POST['enabled'] ?? false ),
			'auto_sync' => WNC_Settings::to_bool( $_POST['auto_sync'] ?? false ),
		);
		if ( isset( $_POST['credentials'] ) && is_array( $_POST['credentials'] ) ) {
			$data['credentials'] = wp_unslash( $_POST['credentials'] );
		}
		if ( 'torob' === $platform ) {
			$flags = array( 'order_status_enabled', 'orders_list_api_enabled', 'product_page_webhook_enabled' );
			if ( ! isset( $data['credentials'] ) || ! is_array( $data['credentials'] ) ) {
				$data['credentials'] = array();
			}
			foreach ( $flags as $flag ) {
				$data['credentials'][ $flag ] = ! empty( $data['credentials'][ $flag ] ) ? 1 : 0;
			}
		}
		WNC_Settings::update_platform( $platform, $data );
		if ( 'torob' === $platform && class_exists( 'WNC_Torob_Bootstrap' ) ) {
			WNC_Torob_Bootstrap::sync_feature_flags_from_settings();
		}
		wp_send_json_success( array( 'message' => __( 'تنظیمات ذخیره شد', 'webinaconnector' ) ) );
	}

	/**
	 * Test connection.
	 */
	public function ajax_test_connection() {
		if ( ! $this->can() ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webinaconnector' ) ) );
		}
		$platform = isset( $_POST['platform'] ) ? sanitize_key( wp_unslash( $_POST['platform'] ) ) : '';
		$adapter  = WNC_Platform_Registry::get( $platform );
		if ( ! $adapter ) {
			wp_send_json_error( array( 'message' => __( 'پلتفرم نامعتبر', 'webinaconnector' ) ) );
		}
		$result = $adapter->test_connection();
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}
		wp_send_json_success( array( 'message' => __( 'اتصال موفق بود', 'webinaconnector' ) ) );
	}

	/**
	 * Torob extractor/backend connectivity check.
	 */
	public function ajax_torob_connectivity() {
		if ( ! $this->can() ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webinaconnector' ) ) );
		}
		$extractor = WNC_Torob_HTTP::check_extractor_health();
		$backend   = WNC_Torob_HTTP::check_backend_health();
		$lines     = array();
		foreach ( array( 'extractor.torob.com' => $extractor, 'api.torob.com' => $backend ) as $host => $result ) {
			$status = $result->is_successful() ? 'OK' : 'FAIL';
			$ms     = number_format( $result->get_request_time_seconds(), 2 );
			$lines[] = sprintf( '%s: %s (%ss)', $host, $status, $ms );
		}
		$ok = $extractor->is_successful() && $backend->is_successful();
		$payload = array( 'message' => implode( ' | ', $lines ) );
		if ( $ok ) {
			wp_send_json_success( $payload );
		}
		wp_send_json_error( $payload );
	}

	/**
	 * Generate Digikala RSA-4096 key pair.
	 */
	public function ajax_generate_digikala_keys() {
		if ( ! $this->can() ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webinaconnector' ) ) );
		}
		$result = WNC_Digikala_Auth::generate_rsa_keypair();
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}
		wp_send_json_success(
			array(
				'message'     => __( 'جفت کلید RSA 4096 ساخته شد. کلید عمومی را در پنل دیجیکالا ثبت کنید.', 'webinaconnector' ),
				'public_key'  => $result['public_key'],
				'private_key' => '', // never echo private key back to browser after store.
			)
		);
	}

	/**
	 * Issue Digikala token: RSA-decrypt encrypted authorization_code then exchange.
	 */
	public function ajax_issue_digikala_token() {
		if ( ! $this->can() ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webinaconnector' ) ) );
		}
		$result = WNC_Digikala_Auth::issue_from_code();
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}
		$tokens = WNC_Digikala_Auth::tokens();
		$msg    = __( 'توکن دیجیکالا صادر شد', 'webinaconnector' );
		if ( ! empty( $tokens['access_expires_at'] ) ) {
			$msg .= ' — Access: ' . wp_date( 'Y-m-d H:i', (int) $tokens['access_expires_at'] );
		}
		if ( ! empty( $tokens['refresh_expires_at'] ) ) {
			$msg .= ' | Refresh: ' . wp_date( 'Y-m-d H:i', (int) $tokens['refresh_expires_at'] );
		}
		wp_send_json_success( array( 'message' => $msg ) );
	}

	/**
	 * Search remote catalog.
	 */
	public function ajax_search_remote() {
		if ( ! $this->can() ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webinaconnector' ) ) );
		}
		$platform = isset( $_POST['platform'] ) ? sanitize_key( wp_unslash( $_POST['platform'] ) ) : '';
		$keyword  = isset( $_POST['keyword'] ) ? sanitize_text_field( wp_unslash( $_POST['keyword'] ) ) : '';
		$adapter  = WNC_Platform_Registry::get( $platform );
		if ( ! $adapter ) {
			wp_send_json_error( array( 'message' => __( 'پلتفرم نامعتبر', 'webinaconnector' ) ) );
		}
		$result = $adapter->search_products( array( 'keyword' => $keyword ) );
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}
		wp_send_json_success( array( 'items' => $result ) );
	}

	/**
	 * Save product map.
	 */
	public function ajax_save_map() {
		if ( ! $this->can() ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webinaconnector' ) ) );
		}
		$id = WNC_Mapper::upsert(
			array(
				'wc_product_id'     => absint( $_POST['wc_product_id'] ?? 0 ),
				'wc_variation_id'   => absint( $_POST['wc_variation_id'] ?? 0 ),
				'platform'          => sanitize_key( wp_unslash( $_POST['platform'] ?? '' ) ),
				'remote_product_id' => sanitize_text_field( wp_unslash( $_POST['remote_product_id'] ?? '' ) ),
				'remote_variant_id' => sanitize_text_field( wp_unslash( $_POST['remote_variant_id'] ?? '' ) ),
				'sync_enabled'      => WNC_Settings::to_bool( $_POST['sync_enabled'] ?? true ),
			)
		);
		if ( ! $id ) {
			wp_send_json_error( array( 'message' => __( 'ذخیره نقشه ناموفق بود', 'webinaconnector' ) ) );
		}
		wp_send_json_success( array( 'message' => __( 'نقشه ذخیره شد', 'webinaconnector' ), 'id' => $id ) );
	}

	/**
	 * Delete map.
	 */
	public function ajax_delete_map() {
		if ( ! $this->can() ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webinaconnector' ) ) );
		}
		WNC_Mapper::delete(
			absint( $_POST['wc_product_id'] ?? 0 ),
			absint( $_POST['wc_variation_id'] ?? 0 ),
			sanitize_key( wp_unslash( $_POST['platform'] ?? '' ) )
		);
		wp_send_json_success( array( 'message' => __( 'نقشه حذف شد', 'webinaconnector' ) ) );
	}

	/**
	 * Sync now.
	 */
	public function ajax_sync_now() {
		if ( ! $this->can() ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webinaconnector' ) ) );
		}
		$platform = sanitize_key( wp_unslash( $_POST['platform'] ?? '' ) );
		$payload  = array(
			'wc_product_id'   => absint( $_POST['wc_product_id'] ?? 0 ),
			'wc_variation_id' => absint( $_POST['wc_variation_id'] ?? 0 ),
			'product_id'      => absint( $_POST['product_id'] ?? 0 ),
		);
		$job = WNC_Jobs::enqueue( 'push_price_stock', $payload, $platform );
		WNC_Jobs::process( 5 );
		wp_send_json_success( array( 'message' => __( 'همگام‌سازی در صف اجرا شد', 'webinaconnector' ), 'job_id' => $job ) );
	}

	/**
	 * Pull orders now.
	 */
	public function ajax_pull_orders() {
		if ( ! $this->can() ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webinaconnector' ) ) );
		}
		$platform = sanitize_key( wp_unslash( $_POST['platform'] ?? '' ) );
		if ( $platform ) {
			WNC_Jobs::enqueue( 'pull_orders', array(), $platform );
		} else {
			WNC_Order_Sync::pull_all();
		}
		WNC_Jobs::process( 10 );
		wp_send_json_success( array( 'message' => __( 'دریافت سفارش‌ها اجرا شد', 'webinaconnector' ) ) );
	}
}
