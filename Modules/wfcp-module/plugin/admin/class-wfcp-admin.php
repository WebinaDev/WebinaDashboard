<?php
/**
 * The admin-specific functionality of the plugin.
 *
 * @package    WFCP
 * @subpackage WFCP/admin
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * The admin-specific functionality of the plugin.
 */
class WFCP_Admin {

	/**
	 * Register the stylesheets for the admin area.
	 */
	public function enqueue_styles() {
		$screen = get_current_screen();
		$is_wfcp_page = false;

		// Check by screen ID
		if ( $screen && strpos( $screen->id, 'wfcp' ) !== false ) {
			$is_wfcp_page = true;
		}

		// Check by page parameter
		if ( isset( $_GET['page'] ) && strpos( $_GET['page'], 'wfcp' ) !== false ) {
			$is_wfcp_page = true;
		}

		$is_product_edit = $screen && in_array( $screen->id, array( 'product', 'edit-product' ), true );

		if ( ! $is_wfcp_page && ! $is_product_edit ) {
			return;
		}

		if ( $is_wfcp_page ) {
			wp_enqueue_style(
				'wfcp-admin-style',
				WFCP_PLUGIN_URL . 'admin/css/wfcp-admin-style.css',
				array(),
				WFCP_VERSION,
				'all'
			);
			wp_add_inline_style( 'wfcp-admin-style', WFCP_Helper::get_toman_glyph_css() );
		} else {
			wp_register_style( 'wfcp-toman-admin', false, array(), WFCP_VERSION );
			wp_enqueue_style( 'wfcp-toman-admin' );
			wp_add_inline_style( 'wfcp-toman-admin', WFCP_Helper::get_toman_glyph_css() );
		}
	}

	/**
	 * Register the JavaScript for the admin area.
	 */
	public function enqueue_scripts() {
		$screen = get_current_screen();
		$is_wfcp_page = false;
		
		// Check by screen ID
		if ( $screen && strpos( $screen->id, 'wfcp' ) !== false ) {
			$is_wfcp_page = true;
		}
		
		// Check by page parameter (important for custom pages)
		if ( isset( $_GET['page'] ) && strpos( $_GET['page'], 'wfcp' ) !== false ) {
			$is_wfcp_page = true;
		}
		
		if ( ! $is_wfcp_page ) {
			return;
		}

		// Enqueue WordPress Media Uploader for all WFCP admin pages (needed for gateway icon uploads etc.)
		wp_enqueue_media();

		// Quick add products page - additional media scripts
		if ( isset( $_GET['page'] ) && 'wfcp-quick-add' === $_GET['page'] ) {
			// Also explicitly enqueue media scripts to ensure they're loaded
			wp_enqueue_script( 'media-upload' );
			wp_enqueue_script( 'media-views' );
			wp_enqueue_script( 'wp-util' );
		}

		wp_enqueue_script(
			'wfcp-admin-general',
			WFCP_PLUGIN_URL . 'admin/js/wfcp-admin-general.js',
			array( 'jquery' ),
			WFCP_VERSION,
			false
		);

		wp_enqueue_script(
			'wfcp-admin-bulk',
			WFCP_PLUGIN_URL . 'admin/js/wfcp-admin-bulk.js',
			array( 'jquery' ),
			WFCP_VERSION,
			false
		);

		// Quick add products script
		if ( isset( $_GET['page'] ) && 'wfcp-quick-add' === $_GET['page'] ) {
			// Enqueue our script with proper dependencies
			// Include all media-related dependencies to ensure wp.media is fully loaded
			wp_enqueue_script(
				'wfcp-admin-quick-add',
				WFCP_PLUGIN_URL . 'admin/js/wfcp-admin-quick-add.js',
				array( 'jquery', 'media-upload', 'media-views', 'wp-util' ),
				WFCP_VERSION,
				true // Load in footer to ensure wp.media is available
			);
		}

		// Select2 no longer needed - gateways are now toggle switches

		// Localize script
		wp_localize_script(
			'wfcp-admin-general',
			'wfcpAdmin',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'wfcp_admin_nonce' ),
			)
		);

		// Localize quick add script if on quick add page
		if ( isset( $_GET['page'] ) && 'wfcp-quick-add' === $_GET['page'] ) {
			wp_localize_script(
				'wfcp-admin-quick-add',
				'wfcpAdmin',
				array(
					'ajaxUrl' => admin_url( 'admin-ajax.php' ),
					'nonce'   => wp_create_nonce( 'wfcp_admin_nonce' ),
				)
			);
		}

		wp_localize_script(
			'wfcp-admin-bulk',
			'wfcpBulk',
			array(
				'ajaxUrl'     => admin_url( 'admin-ajax.php' ),
				'nonce'       => wp_create_nonce( 'wfcp_bulk_nonce' ),
				'filterNonce' => wp_create_nonce( 'wfcp_pm_filter_nonce' ),
				'updateNonce' => wp_create_nonce( 'wfcp_pm_update_nonce' ),
			)
		);
	}

	/**
	 * Add admin menu
	 */
	public function add_admin_menu() {
		// Use edit_products as it's the standard WooCommerce capability that always exists
		// manage_woocommerce might not exist in older WooCommerce versions
		$capability = 'edit_products';
		
		add_menu_page(
			__( 'مدیریت قیمت', 'webina-woo-core' ),
			__( 'مدیریت قیمت', 'webina-woo-core' ),
			$capability,
			'wfcp-settings',
			array( $this, 'display_settings_page' ),
			'dashicons-money-alt',
			56
		);

		add_submenu_page(
			'wfcp-settings',
			__( 'داشبورد و تنظیمات', 'webina-woo-core' ),
			__( 'داشبورد و تنظیمات', 'webina-woo-core' ),
			$capability,
			'wfcp-settings',
			array( $this, 'display_settings_page' )
		);

		add_submenu_page(
			'wfcp-settings',
			__( 'لیست قیمت', 'webina-woo-core' ),
			__( 'لیست قیمت', 'webina-woo-core' ),
			$capability,
			'wfcp-bulk-editor',
			array( $this, 'display_bulk_editor_page' )
		);

		add_submenu_page(
			'wfcp-settings',
			__( 'افزودن سریع محصولات', 'webina-woo-core' ),
			__( 'افزودن سریع محصولات', 'webina-woo-core' ),
			$capability,
			'wfcp-quick-add',
			array( $this, 'display_quick_add_page' )
		);

		add_submenu_page(
			'wfcp-settings',
			__( 'تغییر قیمت گروهی', 'webina-woo-core' ),
			__( 'تغییر قیمت گروهی', 'webina-woo-core' ),
			'manage_woocommerce',
			'wfcp-price-changer',
			array( $this, 'display_price_changer_page' )
		);
	}

	/**
	 * Display settings page
	 */
	public function display_settings_page() {
		require_once WFCP_PLUGIN_DIR . 'admin/partials/wfcp-admin-wrap.php';
	}

	/**
	 * Display bulk editor page
	 */
	public function display_bulk_editor_page() {
		require_once WFCP_PLUGIN_DIR . 'admin/partials/wfcp-page-bulk-editor.php';
	}

	/**
	 * Display quick add products page
	 */
	public function display_quick_add_page() {
		require_once WFCP_PLUGIN_DIR . 'admin/partials/wfcp-page-quick-add.php';
	}

	/**
	 * Display price changer page (bulk price bump + CSV import)
	 */
	public function display_price_changer_page() {
		if ( isset( $GLOBALS['wfcp_bulk_price_change'] ) && is_object( $GLOBALS['wfcp_bulk_price_change'] ) ) {
			$GLOBALS['wfcp_bulk_price_change']->page();
		} else {
			echo '<div class="wrap"><h1>تغییر قیمت گروهی</h1><p>خطا در بارگذاری ماژول تغییر قیمت گروهی</p></div>';
		}
	}

	/**
	 * AJAX handler for saving settings
	 */
	public function ajax_save_settings() {
		check_ajax_referer( 'wfcp_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}

		$allowed = apply_filters(
			'wfcp_settings_allowed_sections',
			array(
				'general',
				'retail',
				'credit',
				'installment',
				'wholesale',
				'digikala',
				'basalam',
				'technolife',
				'snappshop',
				'tapsishop',
				'zarehbin',
				'emalls',
				'snapppay-search',
				'torob',
				'notifications',
				'gateways',
				'currency',
				'exchange',
				'style',
			)
		);

		$section = isset( $_POST['section'] ) ? sanitize_text_field( wp_unslash( $_POST['section'] ) ) : '';
		if ( empty( $section ) || ! in_array( $section, $allowed, true ) ) {
			wp_send_json_error( array( 'message' => __( 'بخش تنظیمات مشخص نشده است', 'webina-woo-core' ) ) );
		}

		$raw  = isset( $_POST['data'] ) ? wp_unslash( $_POST['data'] ) : array();
		$data = is_array( $raw ) ? $raw : array();

		$sanitized_data = $this->sanitize_settings_data( $section, $data );

		$update_section = ( 'exchange' === $section || 'currency' === $section ) ? 'general' : $section;
		if ( 'gateways' === $section ) {
			$update_section = 'gateways_config';
		}

		$result = WFCP_Helper::update_settings( $update_section, $sanitized_data );

		if ( $result ) {
			if ( in_array( $section, array( 'retail', 'credit', 'installment', 'wholesale', 'gateways' ), true ) ) {
				if ( class_exists( 'WFCP_Gateway_Manager' ) ) {
					WFCP_Gateway_Manager::reset_cache();
				}
			}

			if ( in_array( $update_section, array( 'general', 'retail', 'credit', 'installment' ), true )
				|| in_array( $section, array( 'general', 'retail', 'credit', 'installment', 'exchange' ), true ) ) {
				if ( class_exists( 'WFCP_Batch_Process' ) ) {
					WFCP_Batch_Process::delete_transients();
				}
			}

			if ( 'general' === $update_section ) {
				WFCP_Helper::reschedule_exchange_cron();
			}
			wp_send_json_success( array( 'message' => __( 'تنظیمات با موفقیت ذخیره شد', 'webina-woo-core' ) ) );
		} else {
			wp_send_json_error( array( 'message' => __( 'خطا در ذخیره تنظیمات', 'webina-woo-core' ) ) );
		}
	}

	/**
	 * Normalize checkbox/toggle values from AJAX.
	 * jQuery sends false as the string "false"; (bool) "false" is true in PHP.
	 *
	 * @param mixed $value Raw value.
	 * @return bool
	 */
	private function to_bool( $value ) {
		return WFCP_Helper::to_bool( $value );
	}

	/**
	 * Sanitize settings data — only overwrite fields present in $data.
	 *
	 * @param string $section Section name.
	 * @param array  $data    Data to sanitize.
	 * @return array
	 */
	private function sanitize_settings_data( $section, $data ) {
		$storage = ( 'gateways' === $section ) ? 'gateways_config' : (
			( 'exchange' === $section || 'currency' === $section ) ? 'general' : $section
		);
		$current = WFCP_Helper::get_settings( $storage );
		if ( ! is_array( $current ) ) {
			$current = array();
		}
		if ( ! is_array( $data ) ) {
			$data = array();
		}

		switch ( $section ) {
			case 'general':
				if ( isset( $data['enabled'] ) ) {
					$current['enabled'] = $this->to_bool( $data['enabled'] );
				}
				if ( isset( $data['currency'] ) ) {
					$current['currency'] = sanitize_text_field( $data['currency'] );
				}
				if ( isset( $data['exchange_rate'] ) ) {
					$current['exchange_rate'] = WFCP_Helper::sanitize_price( $data['exchange_rate'] );
				}
				if ( isset( $data['default_purchase_type'] ) ) {
					$type = sanitize_text_field( (string) $data['default_purchase_type'] );
					if ( 'retail' === $type ) {
						$type = 'cash';
					}
					if ( ! in_array( $type, array( 'cash', 'credit', 'installment' ), true ) ) {
						$type = 'cash';
					}
					if ( 'credit' === $type && ! WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'credit', 'enabled' ) ) ) {
						$type = 'cash';
					}
					if ( 'installment' === $type && ! WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'installment', 'enabled' ) ) ) {
						$type = 'cash';
					}
					$current['default_purchase_type'] = $type;
				}
				return $current;

			case 'retail':
				if ( isset( $data['profit_percent'] ) ) {
					$current['profit_percent'] = floatval( $data['profit_percent'] );
				}
				if ( isset( $data['round_enabled'] ) ) {
					$current['round_enabled'] = $this->to_bool( $data['round_enabled'] );
				}
				if ( isset( $data['round_to'] ) ) {
					$current['round_to'] = max( 1, intval( $data['round_to'] ) );
				}
				if ( array_key_exists( 'gateways', $data ) ) {
					$current['gateways'] = WFCP_Gateway_Manager::normalize_gateway_ids( $data['gateways'] );
				}
				return $current;

			case 'credit':
				if ( isset( $data['enabled'] ) ) {
					$current['enabled'] = $this->to_bool( $data['enabled'] );
				}
				if ( isset( $data['increase_percent'] ) ) {
					$current['increase_percent'] = floatval( $data['increase_percent'] );
				}
				if ( array_key_exists( 'gateways', $data ) ) {
					$current['gateways'] = WFCP_Gateway_Manager::normalize_gateway_ids( $data['gateways'] );
				}
				if ( isset( $data['texts'] ) && is_array( $data['texts'] ) ) {
					$texts = isset( $current['texts'] ) && is_array( $current['texts'] ) ? $current['texts'] : array();
					if ( isset( $data['texts']['title'] ) ) {
						$texts['title'] = sanitize_text_field( $data['texts']['title'] );
					}
					if ( isset( $data['texts']['button_text'] ) ) {
						$texts['button_text'] = sanitize_text_field( $data['texts']['button_text'] );
					}
					$current['texts'] = $texts;
				}
				return $current;

			case 'installment':
				if ( isset( $data['enabled'] ) ) {
					$current['enabled'] = $this->to_bool( $data['enabled'] );
				}
				if ( array_key_exists( 'round_enabled', $data ) ) {
					$current['round_enabled'] = $this->to_bool( $data['round_enabled'] );
				}
				if ( isset( $data['round_to'] ) ) {
					$current['round_to'] = max( 1, intval( $data['round_to'] ) );
				}
				if ( array_key_exists( 'plans', $data ) && is_array( $data['plans'] ) ) {
					$plans = array();
					foreach ( $data['plans'] as $plan ) {
						$plans[] = array(
							'months'   => isset( $plan['months'] ) ? intval( $plan['months'] ) : 0,
							'interest' => isset( $plan['interest'] ) ? floatval( $plan['interest'] ) : 0,
						);
					}
					$current['plans'] = $plans;
				}
				if ( array_key_exists( 'gateways', $data ) ) {
					$current['gateways'] = WFCP_Gateway_Manager::normalize_gateway_ids( $data['gateways'] );
				}
				if ( isset( $data['pdp_theme'] ) ) {
					$theme = sanitize_key( (string) $data['pdp_theme'] );
					$current['pdp_theme'] = 'timeline' === $theme ? 'timeline' : 'classic';
				}
				if ( array_key_exists( 'gateway_logos_only', $data ) ) {
					$current['gateway_logos_only'] = $this->to_bool( $data['gateway_logos_only'] );
				}
				if ( isset( $data['texts'] ) && is_array( $data['texts'] ) ) {
					$texts = isset( $current['texts'] ) && is_array( $current['texts'] ) ? $current['texts'] : array();
					if ( isset( $data['texts']['title'] ) ) {
						$texts['title'] = sanitize_text_field( $data['texts']['title'] );
					}
					if ( isset( $data['texts']['button_text'] ) ) {
						$texts['button_text'] = sanitize_text_field( $data['texts']['button_text'] );
					}
					$current['texts'] = $texts;
				}
				return $current;

			case 'wholesale':
				if ( isset( $data['enabled'] ) ) {
					$current['enabled'] = $this->to_bool( $data['enabled'] );
				}
				if ( isset( $data['strategy'] ) ) {
					$current['strategy'] = sanitize_text_field( $data['strategy'] );
				}
				if ( isset( $data['discount_percent'] ) ) {
					$current['discount_percent'] = floatval( $data['discount_percent'] );
				}
				if ( array_key_exists( 'gateways', $data ) ) {
					$current['gateways'] = WFCP_Gateway_Manager::normalize_gateway_ids( $data['gateways'] );
				}
				if ( array_key_exists( 'shipping_methods', $data ) ) {
					$current['shipping_methods'] = WFCP_Gateway_Manager::normalize_gateway_ids( $data['shipping_methods'] );
				}
				if ( array_key_exists( 'category_rules', $data ) && is_array( $data['category_rules'] ) ) {
					$rules = array();
					foreach ( $data['category_rules'] as $cat_id => $discount ) {
						$rules[ intval( $cat_id ) ] = floatval( $discount );
					}
					$current['category_rules'] = $rules;
				}
				if ( isset( $data['threshold_enabled'] ) ) {
					$current['threshold_enabled'] = $this->to_bool( $data['threshold_enabled'] );
				} elseif ( isset( $data['strategy'] ) || isset( $data['enabled'] ) ) {
					$current['threshold_enabled'] = false;
				}
				if ( isset( $data['partner_enabled'] ) ) {
					$current['partner_enabled'] = $this->to_bool( $data['partner_enabled'] );
				} elseif ( isset( $data['strategy'] ) || isset( $data['enabled'] ) ) {
					$current['partner_enabled'] = false;
				}
				if ( isset( $data['partner_only'] ) ) {
					$current['partner_only'] = $this->to_bool( $data['partner_only'] );
				}
				if ( isset( $data['hide_retail_from_partner'] ) ) {
					$current['hide_retail_from_partner'] = $this->to_bool( $data['hide_retail_from_partner'] );
				}
				if ( isset( $data['defaults'] ) && is_array( $data['defaults'] ) ) {
					$prev = isset( $current['defaults'] ) && is_array( $current['defaults'] ) ? $current['defaults'] : array();
					$prev['min_qty']           = isset( $data['defaults']['min_qty'] ) ? max( 0, floatval( $data['defaults']['min_qty'] ) ) : ( isset( $prev['min_qty'] ) ? $prev['min_qty'] : 0 );
					$prev['min_weight']        = isset( $data['defaults']['min_weight'] ) ? max( 0, floatval( $data['defaults']['min_weight'] ) ) : ( isset( $prev['min_weight'] ) ? $prev['min_weight'] : 0 );
					$prev['qty_step']          = isset( $data['defaults']['qty_step'] ) ? max( 0, floatval( $data['defaults']['qty_step'] ) ) : ( isset( $prev['qty_step'] ) ? $prev['qty_step'] : 0 );
					$prev['min_distinct_skus'] = isset( $data['defaults']['min_distinct_skus'] ) ? max( 0, intval( $data['defaults']['min_distinct_skus'] ) ) : ( isset( $prev['min_distinct_skus'] ) ? $prev['min_distinct_skus'] : 0 );
					$current['defaults']       = $prev;
				}
				if ( array_key_exists( 'category_variety_rules', $data ) && is_array( $data['category_variety_rules'] ) ) {
					$vrules = array();
					foreach ( $data['category_variety_rules'] as $cat_id => $need ) {
						$vrules[ intval( $cat_id ) ] = max( 0, intval( $need ) );
					}
					$current['category_variety_rules'] = $vrules;
				}
				return $current;

			case 'digikala':
			case 'basalam':
			case 'technolife':
			case 'snappshop':
			case 'tapsishop':
			case 'zarehbin':
			case 'emalls':
			case 'snapppay-search':
			case 'torob':
				if ( isset( $data['enabled'] ) ) {
					$current['enabled'] = $this->to_bool( $data['enabled'] );
				}
				if ( isset( $data['profit_percent'] ) ) {
					$current['profit_percent'] = floatval( $data['profit_percent'] );
				}
				if ( isset( $data['extra_percent'] ) ) {
					$current['extra_percent'] = floatval( $data['extra_percent'] );
				}
				if ( isset( $data['round_enabled'] ) ) {
					$current['round_enabled'] = $this->to_bool( $data['round_enabled'] );
				}
				if ( isset( $data['round_to'] ) ) {
					$current['round_to'] = max( 1, intval( $data['round_to'] ) );
				}
				if ( isset( $data['price_unit'] ) && in_array( $data['price_unit'], array( 'toman', 'rial' ), true ) ) {
					$current['price_unit'] = sanitize_text_field( $data['price_unit'] );
				}
				if ( in_array( $section, array( 'torob', 'zarehbin', 'emalls', 'snapppay-search' ), true ) && isset( $data['price_mode'] ) ) {
					$mode = sanitize_key( (string) $data['price_mode'] );
					$current['price_mode'] = in_array( $mode, array( 'retail', 'markup' ), true ) ? $mode : 'retail';
				}
				return $current;

			case 'notifications':
				$map_text = array(
					'installment_text',
					'credit_text',
					'need_review',
					'custom_cash_label',
					'custom_install_label',
					'guaranty_text',
				);
				foreach ( $map_text as $key ) {
					if ( isset( $data[ $key ] ) ) {
						$current[ $key ] = sanitize_text_field( $data[ $key ] );
					}
				}
				$map_html = array( 'cash_description', 'installment_description', 'credit_description', 'wholesale_description' );
				foreach ( $map_html as $key ) {
					if ( isset( $data[ $key ] ) ) {
						$current[ $key ] = wp_kses_post( $data[ $key ] );
					}
				}
				$map_alert_text = array(
					'alert_product_text',
					'alert_cart_text',
					'alert_checkout_text',
				);
				foreach ( $map_alert_text as $key ) {
					if ( isset( $data[ $key ] ) ) {
						$current[ $key ] = sanitize_textarea_field( $data[ $key ] );
					}
				}
				$map_bool = array(
					'show_cash_badge',
					'show_install_badge',
					'show_credit_badge',
					'show_guaranty_label',
					'alert_product_enabled',
					'alert_cart_enabled',
					'alert_checkout_enabled',
				);
				foreach ( $map_bool as $key ) {
					if ( array_key_exists( $key, $data ) ) {
						$current[ $key ] = $this->to_bool( $data[ $key ] );
					} elseif ( in_array( $key, array( 'alert_product_enabled', 'alert_cart_enabled', 'alert_checkout_enabled' ), true ) ) {
						// Unchecked toggles are omitted from POST — treat as off when form saved.
						$current[ $key ] = false;
					}
				}
				return $current;

			case 'gateways':
				$incoming = array();
				if ( isset( $data['config'] ) && is_array( $data['config'] ) ) {
					$incoming = $data['config'];
				} elseif ( ! empty( $data ) ) {
					$incoming = $data;
				}
				foreach ( $incoming as $gid => $c ) {
					if ( ! is_array( $c ) ) {
						continue;
					}
					$id = '';
					if ( ! empty( $c['id'] ) ) {
						$id = sanitize_text_field( $c['id'] );
					} elseif ( ! empty( $c['gateway_id'] ) ) {
						$id = sanitize_text_field( $c['gateway_id'] );
					} else {
						$id = sanitize_text_field( (string) $gid );
					}
					if ( '' === $id || false !== strpos( $id, '.' ) ) {
						continue;
					}
					$prev = isset( $current[ $id ] ) && is_array( $current[ $id ] ) ? $current[ $id ] : array();
					$current[ $id ] = array(
						'name' => isset( $c['name'] ) ? sanitize_text_field( $c['name'] ) : ( isset( $prev['name'] ) ? $prev['name'] : '' ),
						'icon' => isset( $c['icon'] ) ? esc_url_raw( $c['icon'] ) : ( isset( $prev['icon'] ) ? $prev['icon'] : '' ),
					);
				}
				return $current;

			case 'currency':
				return $current;

			case 'exchange':
				if ( isset( $data['exchange_rate'] ) ) {
					$current['exchange_rate'] = WFCP_Helper::sanitize_price( $data['exchange_rate'] );
				}
				if ( isset( $data['exchange_rate_enabled'] ) ) {
					$current['exchange_rate_enabled'] = $this->to_bool( $data['exchange_rate_enabled'] );
				}
				if ( isset( $data['purchase_currency'] ) && in_array( $data['purchase_currency'], array( 'base', 'display' ), true ) ) {
					$current['purchase_currency'] = sanitize_text_field( $data['purchase_currency'] );
				}
				if ( isset( $data['api_enabled'] ) ) {
					$current['api_enabled'] = $this->to_bool( $data['api_enabled'] );
				}
				if ( isset( $data['api_key'] ) ) {
					$current['api_key'] = sanitize_text_field( $data['api_key'] );
				}
				if ( isset( $data['api_symbol'] ) ) {
					$current['api_symbol'] = sanitize_text_field( $data['api_symbol'] );
				}
				if ( isset( $data['auto_update_enabled'] ) ) {
					$current['auto_update_enabled'] = $this->to_bool( $data['auto_update_enabled'] );
				}
				if ( isset( $data['auto_update_hour'] ) ) {
					$current['auto_update_hour'] = intval( $data['auto_update_hour'] );
				}
				if ( isset( $data['enabled'] ) ) {
					$current['enabled'] = $this->to_bool( $data['enabled'] );
				}
				return $current;

			case 'style':
				$map_color = array(
					'box_background',
					'box_border_color',
					'button_background',
					'button_text_color',
					'price_color',
					'alert_bg',
					'alert_text_color',
					'alert_border_color',
					'alert_accent',
					'badge_cash_bg',
					'badge_cash_text',
					'badge_credit_bg',
					'badge_credit_text',
					'badge_installment_bg',
					'badge_installment_text',
					'timeline_dot',
					'timeline_line',
					'timeline_today_text',
					'timeline_future_text',
				);
				foreach ( $map_color as $key ) {
					if ( isset( $data[ $key ] ) ) {
						$color = sanitize_hex_color( $data[ $key ] );
						if ( $color ) {
							$current[ $key ] = $color;
						}
					}
				}
				if ( isset( $data['border_radius'] ) ) {
					$current['border_radius'] = intval( $data['border_radius'] );
				}
				if ( isset( $data['placement'] ) ) {
					$placement = sanitize_key( (string) $data['placement'] );
					$allowed   = class_exists( 'WFCP_Helper', false )
						? WFCP_Helper::allowed_product_box_placements()
						: array( 'summary', 'before_cart', 'after_cart', 'before_tabs', 'after_tabs', 'none' );
					if ( in_array( $placement, $allowed, true ) ) {
						$current['placement'] = $placement;
					}
				}
				return $current;
		}

		return array();
	}

	/**
	 * AJAX handler for updating product price
	 */
	public function ajax_update_product_price() {
		check_ajax_referer( 'wfcp_bulk_nonce', 'nonce' );

		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}

		$product_id    = isset( $_POST['product_id'] ) ? intval( $_POST['product_id'] ) : 0;
		$purchase_price = isset( $_POST['purchase_price'] ) ? WFCP_Helper::sanitize_price( $_POST['purchase_price'] ) : 0;

		if ( ! $product_id || ! $purchase_price ) {
			wp_send_json_error( array( 'message' => __( 'اطلاعات ناقص است', 'webina-woo-core' ) ) );
		}

		// Update purchase price
		update_post_meta( $product_id, '_wfcp_purchase_price', $purchase_price );

		// Calculate prices
		$retail_price     = WFCP_Calculator::calculate_price( $purchase_price, 'retail', $product_id );
		$credit_price     = WFCP_Calculator::calculate_price( $purchase_price, 'credit', $product_id );
		$wholesale_price  = WFCP_Calculator::calculate_price( $purchase_price, 'wholesale', $product_id );
		$digikala_price   = WFCP_Calculator::calculate_price( $purchase_price, 'digikala', $product_id );
		$basalam_price    = WFCP_Calculator::calculate_price( $purchase_price, 'basalam', $product_id );
		$technolife_price = WFCP_Calculator::calculate_price( $purchase_price, 'technolife', $product_id );
		$snappshop_price  = WFCP_Calculator::calculate_price( $purchase_price, 'snappshop', $product_id );
		$tapsishop_price  = WFCP_Calculator::calculate_price( $purchase_price, 'tapsishop', $product_id );
		$zarehbin_price   = WFCP_Calculator::calculate_price( $purchase_price, 'zarehbin', $product_id );
		$emalls_price     = WFCP_Calculator::calculate_price( $purchase_price, 'emalls', $product_id );
		$snapppay_search_price = WFCP_Calculator::calculate_price( $purchase_price, 'snapppay-search', $product_id );
		$torob_price      = WFCP_Calculator::calculate_price( $purchase_price, 'torob', $product_id );

		// Update WooCommerce price if not locked
		if ( ! WFCP_Helper::is_product_price_locked( $product_id ) ) {
			update_post_meta( $product_id, '_regular_price', $retail_price );
			update_post_meta( $product_id, '_price', $retail_price );
			wc_delete_product_transients( $product_id );
		}

		/**
		 * After purchase price update (e.g. WebinaConnector enqueue sync).
		 *
		 * @param int   $product_id Product ID.
		 * @param float $purchase_price Purchase price.
		 */
		do_action( 'wfcp_after_product_price_update', $product_id, $purchase_price );

		wp_send_json_success(
			array(
				'retail_price'     => WFCP_Helper::format_price_with_irt_symbol( $retail_price ),
				'credit_price'     => WFCP_Helper::format_price_with_irt_symbol( $credit_price ),
				'wholesale_price'  => WFCP_Helper::format_price_with_irt_symbol( $wholesale_price ),
				'digikala_price'   => WFCP_Helper::format_price_with_irt_symbol( $digikala_price ),
				'basalam_price'    => WFCP_Helper::format_price_with_irt_symbol( $basalam_price ),
				'technolife_price' => WFCP_Helper::format_price_with_irt_symbol( $technolife_price ),
				'snappshop_price'  => WFCP_Helper::format_price_with_irt_symbol( $snappshop_price ),
				'tapsishop_price'  => WFCP_Helper::format_price_with_irt_symbol( $tapsishop_price ),
				'zarehbin_price'   => WFCP_Helper::format_price_with_irt_symbol( $zarehbin_price ),
				'emalls_price'     => WFCP_Helper::format_price_with_irt_symbol( $emalls_price ),
				'snapppay_search_price' => WFCP_Helper::format_price_with_irt_symbol( $snapppay_search_price ),
				'torob_price'      => WFCP_Helper::format_price_with_irt_symbol( $torob_price ),
			)
		);
	}

	/**
	 * AJAX handler for recalculating all prices
	 */
	public static function ajax_recalculate_all() {
		check_ajax_referer( 'wfcp_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}

		$dry_run = isset( $_POST['dry_run'] ) && 'true' === $_POST['dry_run'];

		$results = WFCP_Batch_Process::queue_recalculate( $dry_run );
		if ( is_wp_error( $results ) ) {
			wp_send_json_error( array( 'message' => $results->get_error_message() ) );
		}

		wp_send_json_success( $results );
	}

	/**
	 * AJAX handler for deleting transients
	 */
	public function ajax_delete_transients() {
		check_ajax_referer( 'wfcp_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}

		$deleted = WFCP_Batch_Process::delete_transients();

		wp_send_json_success(
			array(
				'message' => sprintf( __( '%d کش حذف شد', 'webina-woo-core' ), $deleted ),
			)
		);
	}

	/**
	 * AJAX handler for exporting settings
	 */
	public function ajax_export_settings() {
		check_ajax_referer( 'wfcp_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}

		$json = WFCP_Batch_Process::export_settings();

		wp_send_json_success( array( 'json' => $json ) );
	}

	/**
	 * AJAX handler for importing settings
	 */
	public function ajax_import_settings() {
		check_ajax_referer( 'wfcp_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}

		$json = isset( $_POST['json'] ) ? wp_unslash( $_POST['json'] ) : '';
		$json = sanitize_textarea_field( $json );

		if ( empty( $json ) ) {
			wp_send_json_error( array( 'message' => __( 'داده JSON ارسال نشده است', 'webina-woo-core' ) ) );
		}

		$result = WFCP_Batch_Process::import_settings( $json );

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}

		wp_send_json_success( array( 'message' => __( 'تنظیمات با موفقیت وارد شد', 'webina-woo-core' ) ) );
	}

	/**
	 * AJAX handler for updating lock price
	 */
	public function ajax_update_lock_price() {
		check_ajax_referer( 'wfcp_bulk_nonce', 'nonce' );

		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}

		$product_id = isset( $_POST['product_id'] ) ? intval( $_POST['product_id'] ) : 0;
		$is_locked  = isset( $_POST['is_locked'] ) && 1 === intval( $_POST['is_locked'] );

		if ( ! $product_id ) {
			wp_send_json_error( array( 'message' => __( 'شناسه محصول نامعتبر است', 'webina-woo-core' ) ) );
		}

		update_post_meta( $product_id, '_wfcp_lock_price', $is_locked ? '1' : '0' );

		$message = $is_locked 
			? __( 'قیمت محصول قفل شد', 'webina-woo-core' )
			: __( 'قفل قیمت محصول باز شد', 'webina-woo-core' );

		wp_send_json_success( array( 'message' => $message ) );
	}

	/**
	 * AJAX handler for testing API connection
	 */
	public function ajax_test_api() {
		check_ajax_referer( 'wfcp_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}

		$api_key = isset( $_POST['api_key'] ) ? sanitize_text_field( $_POST['api_key'] ) : '';
		$symbol  = isset( $_POST['api_symbol'] ) ? sanitize_text_field( $_POST['api_symbol'] ) : 'USD';

		if ( empty( $api_key ) ) {
			wp_send_json_error( array( 'message' => __( 'API Key وارد نشده است', 'webina-woo-core' ) ) );
		}

		$result = WFCP_Exchange_API::get_exchange_rate( $api_key, $symbol );

		if ( $result['success'] ) {
			wp_send_json_success( array(
				'message' => sprintf( __( 'اتصال موفق! نرخ ارز: %s', 'webina-woo-core' ), number_format_i18n( $result['price'], 0 ) ),
				'price'   => $result['price'],
			) );
		} else {
			wp_send_json_error( array( 'message' => $result['message'] ) );
		}
	}

	/**
	 * AJAX handler for updating exchange rate from API
	 */
	public function ajax_update_exchange_rate() {
		check_ajax_referer( 'wfcp_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}

		$result = WFCP_Exchange_API::update_exchange_rate();

		if ( $result['success'] ) {
			wp_send_json_success( array(
				'message' => $result['message'],
				'price'   => $result['price'],
			) );
		} else {
			wp_send_json_error( array( 'message' => $result['message'] ) );
		}
	}

	/**
	 * AJAX handler for updating all product prices
	 */
	public function ajax_update_all_prices() {
		check_ajax_referer( 'wfcp_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}

		$results = WFCP_Batch_Process::queue_recalculate( false );
		if ( is_wp_error( $results ) ) {
			wp_send_json_error( array( 'message' => $results->get_error_message() ) );
		}

		wp_send_json_success(
			array(
				'message' => sprintf(
					__( 'به‌روزرسانی قیمت %d محصول در صف قرار گرفت', 'webina-woo-core' ),
					(int) $results['total']
				),
				'queued'  => true,
				'run_id'  => $results['run_id'],
				'total'   => (int) $results['total'],
				'pages'   => (int) $results['pages'],
			)
		);
	}

	/**
	 * AJAX handler for quick add product
	 */
	public function ajax_quick_add_product() {
		check_ajax_referer( 'wfcp_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}

		$product_name = isset( $_POST['product_name'] ) ? sanitize_text_field( $_POST['product_name'] ) : '';
		$purchase_price = isset( $_POST['purchase_price'] ) ? WFCP_Helper::sanitize_price( $_POST['purchase_price'] ) : 0;
		$image_id = isset( $_POST['image_id'] ) ? intval( $_POST['image_id'] ) : 0;

		if ( empty( $product_name ) ) {
			wp_send_json_error( array( 'message' => __( 'نام محصول الزامی است', 'webina-woo-core' ) ) );
		}

		if ( strlen( $product_name ) > 5040 ) {
			wp_send_json_error( array( 'message' => __( 'نام محصول نمی‌تواند بیشتر از 5040 کاراکتر باشد', 'webina-woo-core' ) ) );
		}

		if ( $purchase_price <= 0 ) {
			wp_send_json_error( array( 'message' => __( 'قیمت خرید باید بیشتر از صفر باشد', 'webina-woo-core' ) ) );
		}

		// Check if WooCommerce is active
		if ( ! class_exists( 'WC_Product_Simple' ) ) {
			wp_send_json_error( array( 'message' => __( 'ووکامرس فعال نیست', 'webina-woo-core' ) ) );
		}

		// Create WooCommerce product
		$product = new WC_Product_Simple();
		$product->set_name( $product_name );
		$product->set_status( 'publish' );
		$product->set_catalog_visibility( 'visible' );
		$product->set_manage_stock( false );
		$product->set_stock_status( 'instock' );

		// Set purchase price
		$product->update_meta_data( '_wfcp_purchase_price', $purchase_price );

		// Calculate and set retail price
		$retail_price = WFCP_Calculator::calculate_price( $purchase_price, 'retail' );
		$product->set_regular_price( $retail_price );
		$product->set_price( $retail_price );

		// Save product
		$product_id = $product->save();

		if ( ! $product_id || is_wp_error( $product_id ) ) {
			wp_send_json_error( array( 'message' => __( 'خطا در ایجاد محصول', 'webina-woo-core' ) ) );
		}

		// Handle image if provided (from media library)
		if ( $image_id > 0 ) {
			set_post_thumbnail( $product_id, $image_id );
		}

		wp_send_json_success( array(
			'message' => sprintf( __( 'محصول "%s" با موفقیت ایجاد شد', 'webina-woo-core' ), $product_name ),
			'product_id' => $product_id,
		) );
	}

	/* =================================================================
	 *  Price Manager AJAX handlers
	 * ================================================================= */

	/**
	 * AJAX: Get products list for price manager page.
	 */
	public function ajax_pm_get_products() {
		check_ajax_referer( 'wfcp_pm_filter_nonce' );

		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}

		$paged          = isset( $_POST['page'] ) ? absint( $_POST['page'] ) : 1;
		$search_term    = isset( $_POST['search'] ) ? sanitize_text_field( wp_unslash( $_POST['search'] ) ) : '';
		$posts_per_page = 50;

		$brand_terms = get_terms( array( 'taxonomy' => 'product_brand', 'hide_empty' => false ) );
		if ( is_wp_error( $brand_terms ) ) {
			$brand_terms = array();
		}

		// Sort
		$sort_option = isset( $_POST['sort'] ) ? sanitize_text_field( wp_unslash( $_POST['sort'] ) ) : 'date_desc';
		$orderby     = 'date';
		$order       = 'DESC';

		switch ( $sort_option ) {
			case 'date_asc':
				$orderby = 'date';
				$order   = 'ASC';
				break;
			case 'name_asc':
				$orderby = 'title';
				$order   = 'ASC';
				break;
			case 'name_desc':
				$orderby = 'title';
				$order   = 'DESC';
				break;
			case 'price_asc':
				$orderby = 'meta_value_num';
				$order   = 'ASC';
				break;
			case 'price_desc':
				$orderby = 'meta_value_num';
				$order   = 'DESC';
				break;
		}

		$args = array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => $posts_per_page,
			'paged'          => $paged,
			's'              => $search_term,
			'orderby'        => $orderby,
			'order'          => $order,
		);

		if ( false !== strpos( $sort_option, 'price' ) ) {
			$args['meta_key'] = '_regular_price';
		}

		// Taxonomy filters.
		$tax_query = array();
		if ( ! empty( $_POST['category'] ) ) {
			$tax_query[] = array(
				'taxonomy' => 'product_cat',
				'field'    => 'slug',
				'terms'    => sanitize_text_field( wp_unslash( $_POST['category'] ) ),
			);
		}
		if ( ! empty( $_POST['brand'] ) ) {
			$tax_query[] = array(
				'taxonomy' => 'product_brand',
				'field'    => 'slug',
				'terms'    => sanitize_text_field( wp_unslash( $_POST['brand'] ) ),
			);
		}
		if ( ! empty( $tax_query ) ) {
			$tax_query['relation'] = 'AND';
			$args['tax_query']     = $tax_query;
		}

		$stock_status_filter = ! empty( $_POST['stock_status'] ) ? sanitize_text_field( wp_unslash( $_POST['stock_status'] ) ) : '';

		$products_query = new WP_Query( $args );

		ob_start();

		if ( $products_query->have_posts() ) {
			while ( $products_query->have_posts() ) {
				$products_query->the_post();
				$product = wc_get_product( get_the_ID() );
				if ( ! $product ) {
					continue;
				}

				// Clear caches to ensure fresh data from DB.
				clean_post_cache( get_the_ID() );
				wc_delete_product_transients( get_the_ID() );
				$product = wc_get_product( get_the_ID() );

				if ( $product->is_type( 'variable' ) ) {
					$variations_data    = $product->get_available_variations();
					$parent_brand_id    = $this->pm_get_brand_term_id( $product->get_id() );
					$brand_html         = $this->pm_build_brand_select( $brand_terms, $parent_brand_id, $product->get_id() );
					$parent_purchase    = WFCP_Helper::get_product_purchase_price( $product->get_id() );
					$parent_locked      = WFCP_Helper::is_product_price_locked( $product->get_id() );

					foreach ( $variations_data as $i => $variation_data ) {
						$variation = wc_get_product( $variation_data['variation_id'] );
						if ( ! $variation ) {
							continue;
						}
						$stock_status = $variation->get_stock_status();
						if ( '' !== $stock_status_filter && $stock_status !== $stock_status_filter ) {
							continue;
						}

						$v_purchase  = WFCP_Helper::get_product_purchase_price( $variation->get_id() );
						if ( null === $v_purchase ) {
							$v_purchase = $parent_purchase;
						}
						$v_retail     = $v_purchase ? WFCP_Calculator::calculate_price( $v_purchase, 'retail', $product->get_id() ) : 0;
						$v_credit     = $v_purchase ? WFCP_Calculator::calculate_price( $v_purchase, 'credit', $product->get_id() ) : 0;
						$v_wholesale  = $v_purchase ? WFCP_Calculator::calculate_price( $v_purchase, 'wholesale', $product->get_id() ) : 0;
						$v_digikala   = $v_purchase ? WFCP_Calculator::calculate_price( $v_purchase, 'digikala', $variation->get_id() ) : 0;
						$v_basalam    = $v_purchase ? WFCP_Calculator::calculate_price( $v_purchase, 'basalam', $variation->get_id() ) : 0;
						$v_technolife = $v_purchase ? WFCP_Calculator::calculate_price( $v_purchase, 'technolife', $variation->get_id() ) : 0;
						$v_snappshop  = $v_purchase ? WFCP_Calculator::calculate_price( $v_purchase, 'snappshop', $variation->get_id() ) : 0;
						$v_tapsishop  = $v_purchase ? WFCP_Calculator::calculate_price( $v_purchase, 'tapsishop', $variation->get_id() ) : 0;
						$v_zarehbin   = $v_purchase ? WFCP_Calculator::calculate_price( $v_purchase, 'zarehbin', $variation->get_id() ) : 0;
						$v_emalls     = $v_purchase ? WFCP_Calculator::calculate_price( $v_purchase, 'emalls', $variation->get_id() ) : 0;
						$v_snapppay_search = $v_purchase ? WFCP_Calculator::calculate_price( $v_purchase, 'snapppay-search', $variation->get_id() ) : 0;
						$v_torob      = $v_purchase ? WFCP_Calculator::calculate_price( $v_purchase, 'torob', $variation->get_id() ) : 0;
						?>
						<tr class="<?php echo 0 === $i ? 'wfcp-pm-product-start' : ''; ?>" data-product-id="<?php echo esc_attr( $variation->get_id() ); ?>">
							<td data-column="image" class="wfcp-pm-image-cell"><?php echo $variation->get_image( 'thumbnail', array( 'class' => 'wfcp-pm-product-thumbnail' ) ); ?></td>
							<td data-column="name" data-label="نام"><strong><?php echo esc_html( $product->get_name() ); ?></strong></td>
							<td data-column="attrs" class="wfcp-pm-attrs-cell" data-label="ویژگی‌ها">
								<?php
								foreach ( $variation_data['attributes'] as $attr_key => $term_slug ) {
									$taxonomy = str_replace( 'attribute_', '', urldecode( $attr_key ) );
									$term     = get_term_by( 'slug', $term_slug, $taxonomy );
									echo '<span class="wfcp-pm-attr-tag">' . esc_html( wc_attribute_label( $taxonomy ) ) . ': <strong>' . ( $term ? esc_html( $term->name ) : esc_html( $term_slug ) ) . '</strong></span>';
								}
								?>
							</td>
							<td data-column="sku" data-label="SKU"><?php echo esc_html( $variation->get_sku() ?: '-' ); ?></td>
							<td data-column="brand" class="wfcp-pm-brand-col" data-label="برند"><?php echo $brand_html; ?></td>
							<td data-column="stock" data-label="موجودی">
								<div class="wfcp-pm-stock-wrapper">
									<select class="wfcp-stock-select" data-id="<?php echo esc_attr( $variation->get_id() ); ?>">
										<option value="instock" <?php selected( $stock_status, 'instock' ); ?>>موجود</option>
										<option value="outofstock" <?php selected( $stock_status, 'outofstock' ); ?>>ناموجود</option>
									</select>
									<span class="wfcp-pm-save-status"><span class="spinner"></span><span class="wfcp-pm-status-icon"></span></span>
								</div>
							</td>
							<td data-column="purchase_price" data-label="قیمت خرید">
								<input type="number" class="wfcp-purchase-price-input wfcp-form-control" value="<?php echo esc_attr( $v_purchase ?: '' ); ?>" step="0.01" min="0" <?php echo $parent_locked ? 'disabled' : ''; ?>>
								<label class="wfcp-checkbox" style="margin-top:5px;font-size:12px;">
									<input type="checkbox" class="wfcp-lock-price-checkbox" data-product-id="<?php echo esc_attr( $variation->get_id() ); ?>" <?php checked( $parent_locked ); ?>>
									<span>قفل</span>
								</label>
							</td>
						<td data-column="retail_price" class="wfcp-retail-price" data-label="قیمت تکی"><?php echo $v_retail ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $v_retail ) ) : '-'; ?></td>
						<td data-column="credit_price" class="wfcp-credit-price" data-label="قیمت اعتباری"><?php echo $v_credit ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $v_credit ) ) : '-'; ?></td>
						<td data-column="wholesale_price" class="wfcp-wholesale-price" data-label="قیمت عمده"><?php echo $v_wholesale ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $v_wholesale ) ) : '-'; ?></td>
						<td data-column="digikala_price" class="wfcp-digikala-price" data-label="دیجیکالا"><?php echo $v_digikala ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $v_digikala ) ) : '-'; ?></td>
						<td data-column="basalam_price" class="wfcp-basalam-price" data-label="باسلام"><?php echo $v_basalam ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $v_basalam ) ) : '-'; ?></td>
						<td data-column="technolife_price" class="wfcp-technolife-price" data-label="تکنولایف"><?php echo $v_technolife ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $v_technolife ) ) : '-'; ?></td>
						<td data-column="snappshop_price" class="wfcp-snappshop-price" data-label="اسنپ شاپ"><?php echo $v_snappshop ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $v_snappshop ) ) : '-'; ?></td>
						<td data-column="tapsishop_price" class="wfcp-tapsishop-price" data-label="تپسی شاپ"><?php echo $v_tapsishop ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $v_tapsishop ) ) : '-'; ?></td>
						<td data-column="zarehbin_price" class="wfcp-zarehbin-price" data-label="ذره‌بین"><?php echo $v_zarehbin ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $v_zarehbin ) ) : '-'; ?></td>
						<td data-column="emalls_price" class="wfcp-emalls-price" data-label="ایمالز"><?php echo $v_emalls ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $v_emalls ) ) : '-'; ?></td>
						<td data-column="snapppay_search_price" class="wfcp-snapppay-search-price" data-label="اسنپ‌پی سرچ"><?php echo $v_snapppay_search ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $v_snapppay_search ) ) : '-'; ?></td>
						<td data-column="torob_price" class="wfcp-torob-price" data-label="ترب"><?php echo $v_torob ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $v_torob ) ) : '-'; ?></td>
							<td data-column="regular_price" data-label="قیمت ووکامرس">
								<div class="wfcp-pm-price-wrapper">
									<input type="text" class="wfcp-wc-price-input" value="<?php echo esc_attr( $variation->get_regular_price() ? number_format( (float) $variation->get_regular_price() ) : '' ); ?>" data-price-type="regular" data-id="<?php echo esc_attr( $variation->get_id() ); ?>">
									<span class="wfcp-pm-save-status"><span class="spinner"></span><span class="wfcp-pm-status-icon"></span></span>
								</div>
							</td>
							<td data-column="sale_price" data-label="تخفیف ووکامرس">
								<div class="wfcp-pm-price-wrapper">
									<input type="text" class="wfcp-wc-price-input" value="<?php echo esc_attr( $variation->get_sale_price() ? number_format( (float) $variation->get_sale_price() ) : '' ); ?>" data-price-type="sale" data-id="<?php echo esc_attr( $variation->get_id() ); ?>">
									<span class="wfcp-pm-save-status"><span class="spinner"></span><span class="wfcp-pm-status-icon"></span></span>
								</div>
							</td>
						</tr>
						<?php
					}
				} else {
					$stock_status        = $product->get_stock_status();
					$product_brand_id    = $this->pm_get_brand_term_id( $product->get_id() );
					$brand_html          = $this->pm_build_brand_select( $brand_terms, $product_brand_id, $product->get_id() );
					$purchase_price      = WFCP_Helper::get_product_purchase_price( $product->get_id() );
					$is_locked          = WFCP_Helper::is_product_price_locked( $product->get_id() );
					$retail_price       = $purchase_price ? WFCP_Calculator::calculate_price( $purchase_price, 'retail', $product->get_id() ) : 0;
					$credit_price       = $purchase_price ? WFCP_Calculator::calculate_price( $purchase_price, 'credit', $product->get_id() ) : 0;
					$wholesale_price    = $purchase_price ? WFCP_Calculator::calculate_price( $purchase_price, 'wholesale', $product->get_id() ) : 0;
					$digikala_price     = $purchase_price ? WFCP_Calculator::calculate_price( $purchase_price, 'digikala', $product->get_id() ) : 0;
					$basalam_price      = $purchase_price ? WFCP_Calculator::calculate_price( $purchase_price, 'basalam', $product->get_id() ) : 0;
					$technolife_price   = $purchase_price ? WFCP_Calculator::calculate_price( $purchase_price, 'technolife', $product->get_id() ) : 0;
					$snappshop_price    = $purchase_price ? WFCP_Calculator::calculate_price( $purchase_price, 'snappshop', $product->get_id() ) : 0;
					$tapsishop_price    = $purchase_price ? WFCP_Calculator::calculate_price( $purchase_price, 'tapsishop', $product->get_id() ) : 0;
					$zarehbin_price     = $purchase_price ? WFCP_Calculator::calculate_price( $purchase_price, 'zarehbin', $product->get_id() ) : 0;
					$emalls_price       = $purchase_price ? WFCP_Calculator::calculate_price( $purchase_price, 'emalls', $product->get_id() ) : 0;
					$snapppay_search_price = $purchase_price ? WFCP_Calculator::calculate_price( $purchase_price, 'snapppay-search', $product->get_id() ) : 0;
					$torob_price        = $purchase_price ? WFCP_Calculator::calculate_price( $purchase_price, 'torob', $product->get_id() ) : 0;

					if ( '' !== $stock_status_filter && $stock_status !== $stock_status_filter ) {
						continue;
					}
					?>
					<tr class="wfcp-pm-product-start" data-product-id="<?php echo esc_attr( $product->get_id() ); ?>">
						<td data-column="image" class="wfcp-pm-image-cell"><?php echo $product->get_image( 'thumbnail', array( 'class' => 'wfcp-pm-product-thumbnail' ) ); ?></td>
						<td data-column="name" data-label="نام"><strong><?php echo esc_html( $product->get_name() ); ?></strong></td>
						<td data-column="attrs" class="wfcp-pm-attrs-cell" data-label="ویژگی‌ها"><span class="wfcp-pm-attr-tag">محصول ساده</span></td>
						<td data-column="sku" data-label="SKU"><?php echo esc_html( $product->get_sku() ?: '-' ); ?></td>
						<td data-column="brand" class="wfcp-pm-brand-col" data-label="برند"><?php echo $brand_html; ?></td>
						<td data-column="stock" data-label="موجودی">
							<div class="wfcp-pm-stock-wrapper">
								<select class="wfcp-stock-select" data-id="<?php echo esc_attr( $product->get_id() ); ?>">
									<option value="instock" <?php selected( $stock_status, 'instock' ); ?>>موجود</option>
									<option value="outofstock" <?php selected( $stock_status, 'outofstock' ); ?>>ناموجود</option>
								</select>
								<span class="wfcp-pm-save-status"><span class="spinner"></span><span class="wfcp-pm-status-icon"></span></span>
							</div>
						</td>
						<td data-column="purchase_price" data-label="قیمت خرید">
							<input type="number" class="wfcp-purchase-price-input wfcp-form-control" value="<?php echo esc_attr( $purchase_price ?: '' ); ?>" step="0.01" min="0" <?php echo $is_locked ? 'disabled' : ''; ?>>
							<label class="wfcp-checkbox" style="margin-top:5px;font-size:12px;">
								<input type="checkbox" class="wfcp-lock-price-checkbox" data-product-id="<?php echo esc_attr( $product->get_id() ); ?>" <?php checked( $is_locked ); ?>>
								<span>قفل</span>
							</label>
						</td>
						<td data-column="retail_price" class="wfcp-retail-price" data-label="قیمت تکی"><?php echo $retail_price ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $retail_price ) ) : '-'; ?></td>
						<td data-column="credit_price" class="wfcp-credit-price" data-label="قیمت اعتباری"><?php echo $credit_price ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $credit_price ) ) : '-'; ?></td>
						<td data-column="wholesale_price" class="wfcp-wholesale-price" data-label="قیمت عمده"><?php echo $wholesale_price ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $wholesale_price ) ) : '-'; ?></td>
						<td data-column="digikala_price" class="wfcp-digikala-price" data-label="دیجیکالا"><?php echo $digikala_price ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $digikala_price ) ) : '-'; ?></td>
						<td data-column="basalam_price" class="wfcp-basalam-price" data-label="باسلام"><?php echo $basalam_price ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $basalam_price ) ) : '-'; ?></td>
						<td data-column="technolife_price" class="wfcp-technolife-price" data-label="تکنولایف"><?php echo $technolife_price ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $technolife_price ) ) : '-'; ?></td>
						<td data-column="snappshop_price" class="wfcp-snappshop-price" data-label="اسنپ شاپ"><?php echo $snappshop_price ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $snappshop_price ) ) : '-'; ?></td>
						<td data-column="tapsishop_price" class="wfcp-tapsishop-price" data-label="تپسی شاپ"><?php echo $tapsishop_price ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $tapsishop_price ) ) : '-'; ?></td>
						<td data-column="zarehbin_price" class="wfcp-zarehbin-price" data-label="ذره‌بین"><?php echo $zarehbin_price ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $zarehbin_price ) ) : '-'; ?></td>
						<td data-column="emalls_price" class="wfcp-emalls-price" data-label="ایمالز"><?php echo $emalls_price ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $emalls_price ) ) : '-'; ?></td>
						<td data-column="snapppay_search_price" class="wfcp-snapppay-search-price" data-label="اسنپ‌پی سرچ"><?php echo $snapppay_search_price ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $snapppay_search_price ) ) : '-'; ?></td>
						<td data-column="torob_price" class="wfcp-torob-price" data-label="ترب"><?php echo $torob_price ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $torob_price ) ) : '-'; ?></td>
						<td data-column="regular_price" data-label="قیمت ووکامرس">
							<div class="wfcp-pm-price-wrapper">
								<input type="text" class="wfcp-wc-price-input" value="<?php echo esc_attr( $product->get_regular_price() ? number_format( (float) $product->get_regular_price() ) : '' ); ?>" data-price-type="regular" data-id="<?php echo esc_attr( $product->get_id() ); ?>">
								<span class="wfcp-pm-save-status"><span class="spinner"></span><span class="wfcp-pm-status-icon"></span></span>
							</div>
						</td>
						<td data-column="sale_price" data-label="تخفیف ووکامرس">
							<div class="wfcp-pm-price-wrapper">
								<input type="text" class="wfcp-wc-price-input" value="<?php echo esc_attr( $product->get_sale_price() ? number_format( (float) $product->get_sale_price() ) : '' ); ?>" data-price-type="sale" data-id="<?php echo esc_attr( $product->get_id() ); ?>">
								<span class="wfcp-pm-save-status"><span class="spinner"></span><span class="wfcp-pm-status-icon"></span></span>
							</div>
						</td>
					</tr>
					<?php
				}
			}
			wp_reset_postdata();
		} else {
			echo '<tr><td colspan="16">هیچ محصولی با این مشخصات یافت نشد.</td></tr>';
		}

		$products_html = ob_get_clean();

		// Pagination.
		$pagination_html = '';
		if ( $products_query->max_num_pages > 1 ) {
			$pagination_html = '<div class="wfcp-pm-pagination">';

			if ( $paged > 1 ) {
				$pagination_html .= '<a href="#" data-page="' . ( $paged - 1 ) . '" class="page-numbers prev">« قبلی</a>';
			}

			$start_page = max( 1, $paged - 2 );
			$end_page   = min( $products_query->max_num_pages, $paged + 2 );

			if ( $start_page > 1 ) {
				$pagination_html .= '<a href="#" data-page="1" class="page-numbers">1</a>';
				if ( $start_page > 2 ) {
					$pagination_html .= '<span class="page-numbers dots">...</span>';
				}
			}

			for ( $i = $start_page; $i <= $end_page; $i++ ) {
				$current_class    = ( $i === $paged ) ? ' current' : '';
				$pagination_html .= '<a href="#" data-page="' . $i . '" class="page-numbers' . $current_class . '">' . $i . '</a>';
			}

			if ( $end_page < $products_query->max_num_pages ) {
				if ( $end_page < $products_query->max_num_pages - 1 ) {
					$pagination_html .= '<span class="page-numbers dots">...</span>';
				}
				$pagination_html .= '<a href="#" data-page="' . $products_query->max_num_pages . '" class="page-numbers">' . $products_query->max_num_pages . '</a>';
			}

			if ( $paged < $products_query->max_num_pages ) {
				$pagination_html .= '<a href="#" data-page="' . ( $paged + 1 ) . '" class="page-numbers next">بعدی »</a>';
			}

			$pagination_html .= '</div>';
		}

		wp_send_json_success( array(
			'products_html'   => $products_html,
			'pagination_html' => $pagination_html,
			'current_page'    => $paged,
			'total_pages'     => $products_query->max_num_pages,
			'total_products'  => $products_query->found_posts,
		) );
	}

	/**
	 * AJAX: Update product/variation price.
	 */
	public function ajax_pm_update_price() {
		check_ajax_referer( 'wfcp_pm_update_nonce' );

		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}

		$product_id = isset( $_POST['id'] ) ? absint( $_POST['id'] ) : 0;
		if ( $product_id <= 0 ) {
			wp_send_json_error( array( 'message' => __( 'شناسه نامعتبر است.', 'webina-woo-core' ) ) );
		}

		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			wp_send_json_error( array( 'message' => __( 'محصول یافت نشد.', 'webina-woo-core' ) ) );
		}

		$price      = isset( $_POST['price'] ) ? wc_clean( wp_unslash( $_POST['price'] ) ) : '';
		$price_type = isset( $_POST['price_type'] ) && 'sale' === $_POST['price_type'] ? 'sale' : 'regular';
		$price      = str_replace( ',', '', $price );

		if ( '' !== $price && ! is_numeric( $price ) ) {
			wp_send_json_error( array( 'message' => __( 'قیمت نامعتبر است.', 'webina-woo-core' ) ) );
		}

		if ( 'sale' === $price_type ) {
			$product->set_sale_price( $price );
		} else {
			$product->set_regular_price( $price );
		}

		$product->save();

		// Also update post meta directly as a safety net (in case WC object cache is stale).
		$meta_key = ( 'sale' === $price_type ) ? '_sale_price' : '_regular_price';
		update_post_meta( $product_id, $meta_key, $price );

		// If regular price changed, update _price meta too (WooCommerce uses _price for display).
		if ( 'regular' === $price_type ) {
			$current_sale = get_post_meta( $product_id, '_sale_price', true );
			if ( '' === $current_sale || (float) $current_sale <= 0 ) {
				update_post_meta( $product_id, '_price', $price );
			}
		}

		// Verify save: clear cache and re-read from DB.
		wc_delete_product_transients( $product_id );
		clean_post_cache( $product_id );
		$saved_price = get_post_meta( $product_id, $meta_key, true );
		$verified    = ( (string) $saved_price === (string) $price );

		if ( ! $verified ) {
			error_log( "WFCP price save FAILED: product_id={$product_id}, type={$price_type}, sent={$price}, saved={$saved_price}" );
		}

		wp_send_json_success( array(
			'message'     => __( 'قیمت ذخیره شد.', 'webina-woo-core' ),
			'product_id'  => $product_id,
			'price_type'  => $price_type,
			'sent_price'  => $price,
			'saved_price' => $saved_price,
			'verified'    => $verified,
		) );
	}

	/**
	 * AJAX: Update product/variation stock status.
	 */
	public function ajax_pm_update_stock() {
		check_ajax_referer( 'wfcp_pm_update_nonce' );

		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}

		$product_id = isset( $_POST['id'] ) ? absint( $_POST['id'] ) : 0;
		if ( $product_id <= 0 ) {
			wp_send_json_error( array( 'message' => __( 'شناسه نامعتبر است.', 'webina-woo-core' ) ) );
		}

		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			wp_send_json_error( array( 'message' => __( 'محصول یافت نشد.', 'webina-woo-core' ) ) );
		}

		$stock_status = isset( $_POST['stock_status'] ) && in_array( $_POST['stock_status'], array( 'instock', 'outofstock' ), true )
			? sanitize_text_field( wp_unslash( $_POST['stock_status'] ) )
			: 'instock';

		$product->set_stock_status( $stock_status );
		$product->save();

		// Also update post meta directly as a safety net.
		update_post_meta( $product_id, '_stock_status', $stock_status );

		// Verify save: clear cache and re-read from DB.
		wc_delete_product_transients( $product_id );
		clean_post_cache( $product_id );
		$saved_status = get_post_meta( $product_id, '_stock_status', true );
		$verified     = ( $saved_status === $stock_status );

		if ( ! $verified ) {
			error_log( "WFCP stock save FAILED: product_id={$product_id}, sent={$stock_status}, saved={$saved_status}" );
		}

		wp_send_json_success( array(
			'message'      => __( 'وضعیت موجودی ذخیره شد.', 'webina-woo-core' ),
			'product_id'   => $product_id,
			'sent_status'  => $stock_status,
			'saved_status' => $saved_status,
			'verified'     => $verified,
		) );
	}

	/**
	 * AJAX: Update product brand.
	 */
	public function ajax_pm_update_brand() {
		check_ajax_referer( 'wfcp_pm_update_nonce' );

		if ( ! current_user_can( 'edit_products' ) ) {
			wp_send_json_error( array( 'message' => __( 'دسترسی غیرمجاز', 'webina-woo-core' ) ) );
		}

		$product_id = isset( $_POST['id'] ) ? absint( $_POST['id'] ) : 0;
		if ( $product_id <= 0 ) {
			wp_send_json_error( array( 'message' => __( 'شناسه نامعتبر است.', 'webina-woo-core' ) ) );
		}

		$brand_id = isset( $_POST['brand_id'] ) ? absint( $_POST['brand_id'] ) : 0;

		if ( 0 === $brand_id ) {
			$result = wp_set_object_terms( $product_id, array(), 'product_brand', false );
			if ( is_wp_error( $result ) ) {
				wp_send_json_error( array( 'message' => $result->get_error_message() ) );
			}
			// Verify removal.
			clean_object_term_cache( $product_id, get_post_type( $product_id ) ?: 'product' );
			$verify = wp_get_post_terms( $product_id, 'product_brand', array( 'fields' => 'ids' ) );
			wp_send_json_success( array(
				'message'    => __( 'برند حذف شد.', 'webina-woo-core' ),
				'product_id' => $product_id,
				'verified'   => empty( $verify ),
			) );
		}

		$brand_term = get_term( $brand_id, 'product_brand' );
		if ( ! $brand_term || is_wp_error( $brand_term ) ) {
			wp_send_json_error( array(
				'message'         => __( 'برند انتخابی نامعتبر است.', 'webina-woo-core' ),
				'brand_id'        => $brand_id,
				'taxonomy_exists' => taxonomy_exists( 'product_brand' ),
			) );
		}

		$result = wp_set_object_terms( $product_id, (int) $brand_term->term_id, 'product_brand', false );
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}

		// Verify save: clear cache and re-read from DB.
		clean_object_term_cache( $product_id, get_post_type( $product_id ) ?: 'product' );
		$verify_terms = wp_get_post_terms( $product_id, 'product_brand', array( 'fields' => 'ids' ) );
		$verified     = is_array( $verify_terms ) && in_array( $brand_id, $verify_terms, false );

		if ( ! $verified ) {
			error_log( "WFCP brand save FAILED: product_id={$product_id}, sent_id={$brand_id}, saved=" . wp_json_encode( $verify_terms ) );
		}

		wp_send_json_success( array(
			'message'      => __( 'برند ذخیره شد.', 'webina-woo-core' ),
			'product_id'   => $product_id,
			'brand_id'     => $brand_id,
			'verified'     => $verified,
			'saved_brands' => $verify_terms,
		) );
	}

	/* =================================================================
	 *  Price Manager helper methods
	 * ================================================================= */

	/**
	 * Get primary brand slug for a product.
	 *
	 * @param int $product_id Product ID.
	 * @return string
	 */
	private function pm_get_brand_term_id( $product_id ) {
		// Force fresh read — bypass any stale object cache.
		clean_object_term_cache( $product_id, get_post_type( $product_id ) ?: 'product' );
		$terms = wp_get_post_terms( $product_id, 'product_brand' );
		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return 0;
		}
		return (int) $terms[0]->term_id;
	}

	/**
	 * Build brand dropdown HTML.
	 *
	 * @param array  $brand_terms   All brand terms.
	 * @param string $selected_slug Currently selected slug.
	 * @param int    $product_id    Product ID.
	 * @return string
	 */
	private function pm_build_brand_select( $brand_terms, $selected_term_id, $product_id ) {
		$options = '<option value="0">بدون برند</option>';
		if ( ! empty( $brand_terms ) ) {
			foreach ( $brand_terms as $bt ) {
				$options .= '<option value="' . esc_attr( $bt->term_id ) . '"' . selected( (int) $selected_term_id, (int) $bt->term_id, false ) . '>' . esc_html( $bt->name ) . '</option>';
			}
		}

		$html  = '<div class="wfcp-pm-brand-wrapper">';
		$html .= '<select class="wfcp-brand-select" data-product-id="' . esc_attr( $product_id ) . '" data-original-value="' . esc_attr( $selected_term_id ) . '">';
		$html .= $options;
		$html .= '</select>';
		$html .= '<span class="wfcp-pm-save-status"><span class="spinner"></span><span class="wfcp-pm-status-icon"></span></span>';
		$html .= '</div>';

		return $html;
	}

	/* =================================================================
	 *  Attractive WFCP fields in native WooCommerce product edit + quick edit
	 * ================================================================= */

	/**
	 * Add nice purchase price + calculated prices card in product pricing tab.
	 */
	public function add_wfcp_pricing_fields() {
		global $product_object;
		$product_id = $product_object ? $product_object->get_id() : 0;
		$purchase   = WFCP_Helper::get_product_purchase_price( $product_id );
		$locked     = WFCP_Helper::is_product_price_locked( $product_id );

		$retail = $purchase ? WFCP_Calculator::calculate_price( $purchase, 'retail', $product_id ) : 0;
		$credit = $purchase ? WFCP_Calculator::calculate_price( $purchase, 'credit', $product_id ) : 0;
		$wholesale = $purchase ? WFCP_Calculator::calculate_price( $purchase, 'wholesale', $product_id ) : 0;
		$platforms = array(
			'digikala'   => __( 'دیجیکالا', 'webina-woo-core' ),
			'basalam'    => __( 'باسلام', 'webina-woo-core' ),
			'technolife' => __( 'تکنولایف', 'webina-woo-core' ),
			'snappshop'  => __( 'اسنپ شاپ', 'webina-woo-core' ),
			'tapsishop'  => __( 'تپسی شاپ', 'webina-woo-core' ),
			'zarehbin'   => __( 'ذره‌بین', 'webina-woo-core' ),
			'emalls'          => __( 'ایمالز', 'webina-woo-core' ),
			'snapppay-search' => __( 'اسنپ‌پی سرچ', 'webina-woo-core' ),
			'torob'           => __( 'ترب', 'webina-woo-core' ),
		);
		?>
		<div class="wfcp-admin-pricing-card options_group" style="border:1px solid #e5e7eb; padding:14px; border-radius:8px; margin:12px 0; background:#fff;">
			<h4 style="margin:0 0 10px; font-size:14px;"><?php esc_html_e( 'قیمت‌های چندلایه وبینا (خرید + محاسباتی)', 'webina-woo-core' ); ?></h4>

			<p class="form-field">
				<label for="_wfcp_purchase_price"><?php esc_html_e( 'قیمت خرید (پایه)', 'webina-woo-core' ); ?></label>
				<input type="number" step="0.01" min="0" style="width:180px;" id="_wfcp_purchase_price" name="_wfcp_purchase_price" value="<?php echo esc_attr( $purchase ); ?>" />
				<span class="description"><?php esc_html_e( 'قیمت خرید دلاری یا پایه', 'webina-woo-core' ); ?></span>
			</p>

		<p class="form-field">
			<label><?php esc_html_e( 'قیمت تکی (نقدی)', 'webina-woo-core' ); ?></label>
			<strong style="color:#0f766e;"><?php echo $retail ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $retail ) ) : '—'; ?></strong>
		</p>
		<p class="form-field">
			<label><?php esc_html_e( 'قیمت اعتباری', 'webina-woo-core' ); ?></label>
			<strong><?php echo $credit ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $credit ) ) : '—'; ?></strong>
		</p>
		<p class="form-field">
			<label><?php esc_html_e( 'قیمت عمده', 'webina-woo-core' ); ?></label>
			<strong><?php echo $wholesale ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $wholesale ) ) : '—'; ?></strong>
		</p>

			<?php foreach ( $platforms as $slug => $label ) :
				$p_price = $purchase ? WFCP_Calculator::calculate_price( $purchase, $slug, $product_id ) : 0;
				$p_lock  = get_post_meta( $product_id, '_wfcp_' . $slug . '_lock', true );
				$p_manual = get_post_meta( $product_id, '_wfcp_' . $slug . '_price', true );
				?>
			<p class="form-field">
				<label><?php echo esc_html( $label ); ?></label>
				<strong><?php echo $p_price ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $p_price ) ) : '—'; ?></strong>
				<label style="margin-right:12px;">
					<input type="checkbox" name="_wfcp_<?php echo esc_attr( $slug ); ?>_lock" value="1" <?php checked( '1', (string) $p_lock ); ?> />
					<?php esc_html_e( 'قفل', 'webina-woo-core' ); ?>
				</label>
				<input type="number" step="1" min="0" style="width:120px;" name="_wfcp_<?php echo esc_attr( $slug ); ?>_price" value="<?php echo esc_attr( $p_manual ); ?>" placeholder="<?php esc_attr_e( 'دستی', 'webina-woo-core' ); ?>" />
			</p>
			<?php endforeach; ?>

			<?php do_action( 'wfcp_product_pricing_card_after', $product_id ); ?>

			<p class="form-field">
				<label>
					<input type="checkbox" name="_wfcp_lock_price" value="1" <?php checked( $locked ); ?> /> 
					<?php esc_html_e( 'قفل کردن قیمت (عدم آپدیت خودکار)', 'webina-woo-core' ); ?>
				</label>
			</p>
		</div>
		<?php
	}

	/**
	 * Save the purchase price + lock from simple product.
	 */
	public function save_wfcp_pricing_fields( $product ) {
		if ( isset( $_POST['_wfcp_purchase_price'] ) ) {
			$val = WFCP_Helper::sanitize_price( $_POST['_wfcp_purchase_price'] );
			$product->update_meta_data( '_wfcp_purchase_price', $val );
		}
		$lock = isset( $_POST['_wfcp_lock_price'] ) ? '1' : '0';
		$product->update_meta_data( '_wfcp_lock_price', $lock );

		foreach ( array( 'digikala', 'basalam', 'technolife', 'snappshop', 'tapsishop', 'zarehbin', 'emalls', 'snapppay-search', 'torob' ) as $slug ) {
			$product->update_meta_data( '_wfcp_' . $slug . '_lock', isset( $_POST[ '_wfcp_' . $slug . '_lock' ] ) ? '1' : '0' );
			if ( isset( $_POST[ '_wfcp_' . $slug . '_price' ] ) && '' !== $_POST[ '_wfcp_' . $slug . '_price' ] ) {
				$product->update_meta_data( '_wfcp_' . $slug . '_price', WFCP_Helper::sanitize_price( $_POST[ '_wfcp_' . $slug . '_price' ] ) );
			}
		}
	}

	/**
	 * Per variation fields (attractive).
	 *
	 * WooCommerce passes WP_Post as $variation (not WC_Product).
	 *
	 * @param int     $loop           Position in the loop.
	 * @param array   $variation_data Variation data.
	 * @param WP_Post $variation      Variation post object.
	 */
	public function add_wfcp_variation_fields( $loop, $variation_data, $variation ) {
		// Hook receives WP_Post; accept WC_Product / int defensively.
		if ( $variation instanceof WP_Post ) {
			$vid = (int) $variation->ID;
		} elseif ( is_object( $variation ) && method_exists( $variation, 'get_id' ) ) {
			$vid = (int) $variation->get_id();
		} else {
			$vid = absint( $variation );
		}

		if ( $vid <= 0 ) {
			return;
		}

		$variation_product = wc_get_product( $vid );
		$parent            = $variation_product ? (int) $variation_product->get_parent_id() : (int) wp_get_post_parent_id( $vid );
		$purchase          = WFCP_Helper::get_product_purchase_price( $vid );
		$locked            = WFCP_Helper::is_product_price_locked( $vid ) || ( $parent && WFCP_Helper::is_product_price_locked( $parent ) );

		$retail = $purchase ? WFCP_Calculator::calculate_price( $purchase, 'retail', $parent ? $parent : $vid ) : 0;
		?>
		<div class="wfcp-var-pricing" style="margin:8px 0; padding:8px; background:#f8fafc; border-radius:6px;">
			<p style="margin:4px 0;"><strong><?php esc_html_e( 'قیمت خرید متغیر', 'webina-woo-core' ); ?></strong></p>
			<input type="number" step="0.01" name="wfcp_variation_purchase[<?php echo esc_attr( $loop ); ?>]" value="<?php echo esc_attr( $purchase ); ?>" style="width:140px;" <?php echo $locked ? 'disabled' : ''; ?> />
			<small><?php esc_html_e( 'محاسبه خودکار قیمت‌ها', 'webina-woo-core' ); ?></small>
			<?php if ( $retail ) : ?>
				<span style="margin-left:12px; color:#0f766e;">تکی: <?php echo wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $retail ) ); ?></span>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Save variation purchase price.
	 */
	public function save_wfcp_variation_fields( $variation_id, $i ) {
		if ( isset( $_POST['wfcp_variation_purchase'][ $i ] ) ) {
			$val = WFCP_Helper::sanitize_price( $_POST['wfcp_variation_purchase'][ $i ] );
			update_post_meta( $variation_id, '_wfcp_purchase_price', $val );
		}
	}

	/**
	 * Add purchase price column to products list + quick edit.
	 */
	public function add_wfcp_product_columns( $columns ) {
		$columns['wfcp_purchase'] = __( 'قیمت خرید', 'webina-woo-core' );
		return $columns;
	}

	public function render_wfcp_product_column( $column, $post_id ) {
		if ( 'wfcp_purchase' !== $column ) return;
		$val = WFCP_Helper::get_product_purchase_price( $post_id );
		echo $val ? esc_html( number_format( $val, 0 ) ) : '—';
	}

	/**
	 * Quick edit field.
	 */
	public function add_wfcp_quick_edit( $column_name, $post_type ) {
		if ( 'wfcp_purchase' !== $column_name ) return;
		?>
		<fieldset class="inline-edit-col-right">
			<div class="inline-edit-col">
				<label>
					<span class="title"><?php esc_html_e( 'قیمت خرید', 'webina-woo-core' ); ?></span>
					<span class="input-text-wrap">
						<input type="number" step="0.01" name="_wfcp_purchase_price" class="wfcp-quick-purchase" value="">
					</span>
				</label>
			</div>
		</fieldset>
		<?php
	}

	/**
	 * Quick edit JS to populate.
	 */
	public function add_wfcp_quick_edit_js() {
		$screen = get_current_screen();
		if ( ! $screen || 'edit-product' !== $screen->id ) return;
		?>
		<script>
		jQuery(document).ready(function($){
			$('#the-list').on('click', '.editinline', function(){
				var post_id = $(this).closest('tr').attr('id').replace('post-', '');
				var purchase = $('#post-' + post_id).find('.column-wfcp_purchase').text().replace(/[^0-9.]/g,'');
				$('input.wfcp-quick-purchase').val( purchase );
				// also set hidden for save if needed
			});
		});
		</script>
		<?php
	}

	/**
	 * Save quick edit purchase price.
	 */
	public function save_wfcp_quick_edit( $post_id ) {
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
		if ( ! current_user_can( 'edit_product', $post_id ) ) return;
		if ( isset( $_POST['_wfcp_purchase_price'] ) ) {
			update_post_meta( $post_id, '_wfcp_purchase_price', WFCP_Helper::sanitize_price( $_POST['_wfcp_purchase_price'] ) );
		}
	}
}

