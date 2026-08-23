<?php
namespace WncDigikala\Admin;

use WncDigikala\Auth;
use WncDigikala\Jobs;
use WncDigikala\Settings;
use WncDigikala\Storage;

defined('ABSPATH') || exit;

final class Menus {
    public static function register(): void {
        add_action('admin_menu', [self::class, 'menu']);
        add_action('admin_post_wnc_dk_generate_keys', [self::class, 'handle_generate']);
        add_action('admin_post_wnc_dk_issue_token', [self::class, 'handle_issue']);
        add_action('admin_post_wnc_dk_save_settings', [self::class, 'handle_save']);
        add_action('admin_post_wnc_dk_enqueue_job', [self::class, 'handle_job']);
    }

    public static function menu(): void {
        add_menu_page(
            __('Digikala', 'webinaconnector'),
            __('Digikala', 'webinaconnector'),
            'manage_woocommerce',
            'wnc_digikala',
            [self::class, 'render_home'],
            'dashicons-store',
            56
        );
        add_submenu_page('wnc_digikala', __('Connection', 'webinaconnector'), __('Connection', 'webinaconnector'), 'manage_woocommerce', 'wnc_digikala', [self::class, 'render_home']);
        add_submenu_page('wnc_digikala', __('Products', 'webinaconnector'), __('Products', 'webinaconnector'), 'manage_woocommerce', 'wnc_digikala_products', [self::class, 'render_products']);
        add_submenu_page('wnc_digikala', __('Orders', 'webinaconnector'), __('Orders', 'webinaconnector'), 'manage_woocommerce', 'wnc_digikala_orders', [self::class, 'render_orders']);
        add_submenu_page('wnc_digikala', __('Jobs', 'webinaconnector'), __('Jobs', 'webinaconnector'), 'manage_woocommerce', 'wnc_digikala_jobs', [self::class, 'render_jobs']);
    }

    public static function render_home(): void {
        if (!current_user_can('manage_woocommerce')) return;
        $s = Settings::redact(Settings::all());
        $t = Auth::tokens();
        echo '<div class="wrap"><h1>Digikala</h1>';
        echo '<p>' . esc_html__('Generate RSA-4096 keys, paste the public key in Digikala seller panel, then paste the encrypted code here and issue a token.', 'webinaconnector') . '</p>';
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
        wp_nonce_field('wnc_dk_generate');
        echo '<input type="hidden" name="action" value="wnc_dk_generate_keys" />';
        submit_button(__('Generate RSA keys', 'webinaconnector'), 'secondary', 'submit', false);
        echo '</form>';
        echo '<h2>' . esc_html__('Public key (give to Digikala)', 'webinaconnector') . '</h2>';
        echo '<textarea readonly rows="8" class="large-text code">' . esc_textarea((string) Settings::get('public_key')) . '</textarea>';
        echo '<p>' . (Settings::get('private_key') ? esc_html__('Private key stored on server.', 'webinaconnector') : esc_html__('No private key yet.', 'webinaconnector')) . '</p>';
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
        wp_nonce_field('wnc_dk_issue');
        echo '<input type="hidden" name="action" value="wnc_dk_issue_token" />';
        echo '<p><label>' . esc_html__('Encrypted code from Digikala', 'webinaconnector') . '</label><br/>';
        echo '<textarea name="encrypted_code" rows="4" class="large-text code" required></textarea></p>';
        submit_button(__('Issue token', 'webinaconnector'));
        echo '</form>';
        echo '<h2>' . esc_html__('Status', 'webinaconnector') . '</h2>';
        echo '<pre>' . esc_html(wp_json_encode([
            'connected' => Auth::is_connected(),
            'access_expires_at' => $t['access_expires_at'] ?? null,
            'client_code' => $s['client_code'] ?? '',
            'has_private_key' => !empty($s['has_private_key']),
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . '</pre>';
        echo '</div>';
    }

    public static function render_products(): void {
        echo '<div class="wrap"><h1>Digikala Products</h1>';
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
        wp_nonce_field('wnc_dk_job');
        echo '<input type="hidden" name="action" value="wnc_dk_enqueue_job" />';
        echo '<input type="hidden" name="job_type" value="product_import" />';
        submit_button(__('Queue product import', 'webinaconnector'), 'secondary');
        echo '</form>';
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
        wp_nonce_field('wnc_dk_job');
        echo '<input type="hidden" name="action" value="wnc_dk_enqueue_job" />';
        echo '<input type="hidden" name="job_type" value="product_export" />';
        submit_button(__('Queue product export (price/stock)', 'webinaconnector'));
        echo '</form></div>';
    }

    public static function render_orders(): void {
        echo '<div class="wrap"><h1>Digikala Orders</h1>';
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
        wp_nonce_field('wnc_dk_job');
        echo '<input type="hidden" name="action" value="wnc_dk_enqueue_job" />';
        echo '<input type="hidden" name="job_type" value="orders_pull" />';
        submit_button(__('Pull orders', 'webinaconnector'));
        echo '</form></div>';
    }

    public static function render_jobs(): void {
        global $wpdb;
        $rows = $wpdb->get_results('SELECT * FROM ' . Storage::table('jobs') . ' ORDER BY id DESC LIMIT 50', ARRAY_A);
        echo '<div class="wrap"><h1>Digikala Jobs</h1><pre>' . esc_html(wp_json_encode($rows ?: [], JSON_PRETTY_PRINT)) . '</pre></div>';
    }

    public static function handle_generate(): void {
        if (!current_user_can('manage_woocommerce') || !wp_verify_nonce($_POST['_wpnonce'] ?? '', 'wnc_dk_generate')) {
            wp_die('forbidden');
        }
        Auth::generate_rsa_keypair();
        wp_safe_redirect(admin_url('admin.php?page=wnc_digikala&generated=1'));
        exit;
    }

    public static function handle_issue(): void {
        if (!current_user_can('manage_woocommerce') || !wp_verify_nonce($_POST['_wpnonce'] ?? '', 'wnc_dk_issue')) {
            wp_die('forbidden');
        }
        $code = sanitize_textarea_field(wp_unslash($_POST['encrypted_code'] ?? ''));
        Auth::issue_from_encrypted_code($code);
        wp_safe_redirect(admin_url('admin.php?page=wnc_digikala&issued=1'));
        exit;
    }

    public static function handle_save(): void {
        wp_safe_redirect(admin_url('admin.php?page=wnc_digikala'));
        exit;
    }

    public static function handle_job(): void {
        if (!current_user_can('manage_woocommerce') || !wp_verify_nonce($_POST['_wpnonce'] ?? '', 'wnc_dk_job')) {
            wp_die('forbidden');
        }
        $type = sanitize_text_field(wp_unslash($_POST['job_type'] ?? ''));
        if ($type) {
            Jobs::enqueue($type);
        }
        wp_safe_redirect(admin_url('admin.php?page=wnc_digikala_jobs'));
        exit;
    }
}
