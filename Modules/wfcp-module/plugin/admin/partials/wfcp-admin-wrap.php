<?php
/**
 * Admin wrapper template
 *
 * @package    WFCP
 * @subpackage WFCP/admin/partials
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

$settings = WFCP_Helper::get_settings();
$general = $settings['general'] ?? array();
$retail = $settings['retail'] ?? array();
$credit = $settings['credit'] ?? array();
$installment = $settings['installment'] ?? array();
$wholesale = $settings['wholesale'] ?? array();
?>

<div class="wrap wfcp-admin-wrap">
	<div class="wfcp-admin-header">
		<div class="wfcp-header-content">
			<div class="wfcp-logo-wrapper">
				<img src="<?php echo esc_url( WFCP_PLUGIN_URL . 'assets/images/logo.png' ); ?>" alt="Webina Woo Core" class="wfcp-logo">
			</div>
			<div class="wfcp-header-title">
				<h1><?php esc_html_e( 'تنظیمات افزونه مدیریت قیمت', 'webina-woo-core' ); ?></h1>
				<p class="wfcp-header-subtitle"><?php esc_html_e( 'مدیریت و کنترل کامل سیستم قیمت‌گذاری چند لایه', 'webina-woo-core' ); ?></p>
			</div>
		</div>
	</div>

	<div class="wfcp-admin-container">
		<div class="wfcp-tab-nav-vertical">
			<button class="wfcp-tab-nav-item active" data-tab="wfcp-tab-dashboard">
				<span class="wfcp-tab-icon">📊</span>
				<span class="wfcp-tab-text"><?php esc_html_e( 'داشبورد', 'webina-woo-core' ); ?></span>
			</button>
			<button class="wfcp-tab-nav-item" data-tab="wfcp-tab-currency">
				<span class="wfcp-tab-icon">💱</span>
				<span class="wfcp-tab-text"><?php esc_html_e( 'واحد پول', 'webina-woo-core' ); ?></span>
			</button>
			<button class="wfcp-tab-nav-item" data-tab="wfcp-tab-exchange">
				<span class="wfcp-tab-icon">💲</span>
				<span class="wfcp-tab-text"><?php esc_html_e( 'نرخ تبدیل ارز', 'webina-woo-core' ); ?></span>
			</button>
			<button class="wfcp-tab-nav-item" data-tab="wfcp-tab-retail">
				<span class="wfcp-tab-icon">🛒</span>
				<span class="wfcp-tab-text"><?php esc_html_e( 'قیمت تکی', 'webina-woo-core' ); ?></span>
			</button>
			<button class="wfcp-tab-nav-item" data-tab="wfcp-tab-credit">
				<span class="wfcp-tab-icon">💳</span>
				<span class="wfcp-tab-text"><?php esc_html_e( 'خرید اعتباری', 'webina-woo-core' ); ?></span>
			</button>
			<button class="wfcp-tab-nav-item" data-tab="wfcp-tab-installment">
				<span class="wfcp-tab-icon">📅</span>
				<span class="wfcp-tab-text"><?php esc_html_e( 'خرید اقساطی', 'webina-woo-core' ); ?></span>
			</button>
			<button class="wfcp-tab-nav-item" data-tab="wfcp-tab-wholesale">
				<span class="wfcp-tab-icon">📦</span>
				<span class="wfcp-tab-text"><?php esc_html_e( 'فروش عمده', 'webina-woo-core' ); ?></span>
			</button>
			<?php
			$marketplace_tabs = apply_filters(
				'wfcp_settings_tabs',
				array(
					'digikala'   => array( 'icon' => '🛍️', 'label' => __( 'دیجیکالا', 'webina-woo-core' ) ),
					'basalam'    => array( 'icon' => '🏪', 'label' => __( 'باسلام', 'webina-woo-core' ) ),
					'technolife' => array( 'icon' => '📱', 'label' => __( 'تکنولایف', 'webina-woo-core' ) ),
					'snappshop'  => array( 'icon' => '⚡', 'label' => __( 'اسنپ شاپ', 'webina-woo-core' ) ),
					'tapsishop'  => array( 'icon' => '🚕', 'label' => __( 'تپسی شاپ', 'webina-woo-core' ) ),
					'zarehbin'   => array( 'icon' => '🔍', 'label' => __( 'ذره‌بین', 'webina-woo-core' ) ),
					'emalls'          => array( 'icon' => '🛒', 'label' => __( 'ایمالز', 'webina-woo-core' ) ),
					'snapppay-search' => array( 'icon' => '🔎', 'label' => __( 'اسنپ‌پی سرچ', 'webina-woo-core' ) ),
					'torob'           => array( 'icon' => '🔍', 'label' => __( 'ترب', 'webina-woo-core' ) ),
				)
			);
			foreach ( $marketplace_tabs as $tab_slug => $tab_meta ) :
				?>
			<button class="wfcp-tab-nav-item" data-tab="wfcp-tab-<?php echo esc_attr( $tab_slug ); ?>">
				<span class="wfcp-tab-icon"><?php echo esc_html( $tab_meta['icon'] ?? '🛒' ); ?></span>
				<span class="wfcp-tab-text"><?php echo esc_html( $tab_meta['label'] ?? $tab_slug ); ?></span>
			</button>
			<?php endforeach; ?>
			<button class="wfcp-tab-nav-item" data-tab="wfcp-tab-notifications">
				<span class="wfcp-tab-icon">📝</span>
				<span class="wfcp-tab-text"><?php esc_html_e( 'متن‌ها', 'webina-woo-core' ); ?></span>
			</button>
			<button class="wfcp-tab-nav-item" data-tab="wfcp-tab-style">
				<span class="wfcp-tab-icon">🎨</span>
				<span class="wfcp-tab-text"><?php esc_html_e( 'استایل', 'webina-woo-core' ); ?></span>
			</button>
			<button class="wfcp-tab-nav-item" data-tab="wfcp-tab-advanced">
				<span class="wfcp-tab-icon">⚙️</span>
				<span class="wfcp-tab-text"><?php esc_html_e( 'پیشرفته', 'webina-woo-core' ); ?></span>
			</button>
		</div>

		<div class="wfcp-tab-content-wrapper">
			<div class="wfcp-tab-content active" id="wfcp-tab-dashboard">
				<?php require_once WFCP_PLUGIN_DIR . 'admin/partials/tabs/wfcp-tab-dashboard.php'; ?>
			</div>

			<div class="wfcp-tab-content" id="wfcp-tab-currency">
				<?php require_once WFCP_PLUGIN_DIR . 'admin/partials/tabs/wfcp-tab-currency.php'; ?>
			</div>

			<div class="wfcp-tab-content" id="wfcp-tab-exchange">
				<?php require_once WFCP_PLUGIN_DIR . 'admin/partials/tabs/wfcp-tab-exchange.php'; ?>
			</div>

			<div class="wfcp-tab-content" id="wfcp-tab-retail">
				<?php require_once WFCP_PLUGIN_DIR . 'admin/partials/tabs/wfcp-tab-retail.php'; ?>
			</div>

			<div class="wfcp-tab-content" id="wfcp-tab-credit">
				<?php require_once WFCP_PLUGIN_DIR . 'admin/partials/tabs/wfcp-tab-credit.php'; ?>
			</div>

			<div class="wfcp-tab-content" id="wfcp-tab-installment">
				<?php require_once WFCP_PLUGIN_DIR . 'admin/partials/tabs/wfcp-tab-installment.php'; ?>
			</div>

			<div class="wfcp-tab-content" id="wfcp-tab-wholesale">
				<?php require_once WFCP_PLUGIN_DIR . 'admin/partials/tabs/wfcp-tab-wholesale.php'; ?>
			</div>

			<?php foreach ( array_keys( $marketplace_tabs ) as $tab_slug ) : ?>
			<div class="wfcp-tab-content" id="wfcp-tab-<?php echo esc_attr( $tab_slug ); ?>">
				<?php
				$tab_file = WFCP_PLUGIN_DIR . 'admin/partials/tabs/wfcp-tab-' . $tab_slug . '.php';
				if ( file_exists( $tab_file ) ) {
					require_once $tab_file;
				}
				do_action( 'wfcp_render_settings_tab', $tab_slug );
				?>
			</div>
			<?php endforeach; ?>

			<div class="wfcp-tab-content" id="wfcp-tab-notifications">
				<?php require_once WFCP_PLUGIN_DIR . 'admin/partials/tabs/wfcp-tab-notifications.php'; ?>
			</div>

			<div class="wfcp-tab-content" id="wfcp-tab-style">
				<?php require_once WFCP_PLUGIN_DIR . 'admin/partials/tabs/wfcp-tab-style.php'; ?>
			</div>

			<div class="wfcp-tab-content" id="wfcp-tab-advanced">
				<?php require_once WFCP_PLUGIN_DIR . 'admin/partials/tabs/wfcp-tab-advanced.php'; ?>
			</div>
		</div>
	</div>
</div>
