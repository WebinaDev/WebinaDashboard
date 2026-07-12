<?php
/**
 * Minimal document shell for the React dashboard (no theme layout).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$wd_uid         = get_current_user_id();
$wd_ui_theme    = $wd_uid ? (string) get_user_meta( $wd_uid, 'webino_dashboard_theme', true ) : '';
$wd_ui_accent   = $wd_uid ? (string) get_user_meta( $wd_uid, 'webino_dashboard_accent', true ) : '';
$wd_ui_theme    = $wd_ui_theme ? $wd_ui_theme : 'system';
$wd_ui_accent   = $wd_ui_accent ? $wd_ui_accent : 'default';
$wd_accents_ok  = array( 'default', 'red', 'rose', 'orange', 'green', 'blue', 'yellow', 'violet' );
if ( 'amber' === $wd_ui_accent ) {
	$wd_ui_accent = 'orange';
}
if ( ! in_array( $wd_ui_accent, $wd_accents_ok, true ) ) {
	$wd_ui_accent = 'default';
}
$wd_html_class = ( 'dark' === $wd_ui_theme ) ? 'dark' : '';
$wd_asset_ver  = class_exists( 'Webino_Dashboard_Assets' )
	? Webino_Dashboard_Assets::get_deploy_asset_version()
	: WEBINO_DASHBOARD_VERSION;

?><!DOCTYPE html>
<html <?php language_attributes(); ?> class="<?php echo esc_attr( $wd_html_class ); ?>" data-accent="<?php echo esc_attr( $wd_ui_accent ); ?>" data-wd-asset-version="<?php echo esc_attr( $wd_asset_ver ); ?>" data-wd-plugin-version="<?php echo esc_attr( WEBINO_DASHBOARD_VERSION ); ?>">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="description" content="<?php echo esc_attr( get_bloginfo( 'description', 'display' ) ?: __( 'Store dashboard', 'webino-dashboard' ) ); ?>">
	<title><?php echo esc_html( get_bloginfo( 'name' ) . ' — ' . __( 'Dashboard', 'webino-dashboard' ) ); ?></title>
	<link rel="preconnect" href="<?php echo esc_url( rest_url() ); ?>" crossorigin />
	<script>
	(function () {
		try {
			var stored = localStorage.getItem('wd-theme');
			var theme = stored || <?php echo wp_json_encode( $wd_ui_theme ); ?>;
			var dark =
				theme === 'dark' ||
				(theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
			document.documentElement.classList.toggle('dark', dark);
			document.documentElement.setAttribute('data-accent', <?php echo wp_json_encode( $wd_ui_accent ); ?>);
		} catch (e) {}
	})();
	</script>
	<script>
	(function () {
		var ver = document.documentElement.getAttribute('data-wd-asset-version') || '';
		try {
			var prev = localStorage.getItem('wd_asset_version');
			if (prev && prev !== ver && !/\bwd_cache_bust=1\b/.test(location.search)) {
				localStorage.setItem('wd_asset_version', ver);
				var bust = new URL(location.href);
				bust.searchParams.set('wd_cache_bust', '1');
				location.replace(bust.toString());
				return;
			}
			localStorage.setItem('wd_asset_version', ver);
		} catch (e) {}
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.getRegistrations().then(function (regs) {
				regs.forEach(function (reg) {
					reg.unregister();
				});
			});
		}
	})();
	</script>
	<?php
	if ( class_exists( 'Webino_Dashboard_Assets' ) ) {
		Webino_Dashboard_Assets::render_entry_tags();
	}
	?>
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'webino-dashboard-body' ); ?>>
<?php
if ( class_exists( 'Webino_Dashboard_Assets' ) ) {
	Webino_Dashboard_Assets::render_build_missing_notice();
}
?>
<div id="root">
	<p id="wd-shell-loader" style="box-sizing:border-box;margin:0;min-height:100vh;padding:1.5rem;font-family:system-ui,sans-serif;font-size:0.9375rem;color:#525252;display:flex;align-items:center;justify-content:center;">
		<?php esc_html_e( 'Loading dashboard…', 'webino-dashboard' ); ?>
	</p>
</div>
<script>
if (typeof window.freeShippingData === 'undefined') {
	window.freeShippingData = {
		total: 0,
		threshold: 0,
		remaining: 0,
		progress: 0,
	};
}
</script>
<?php wp_footer(); ?>
</body>
</html>
