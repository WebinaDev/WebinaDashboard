<?php
namespace WncDigikala;

defined('ABSPATH') || exit;

final class Runtime {
    /**
     * Dashboard engine owns runtime when WebinoDigikala is loaded.
     */
    public static function owns_runtime(): bool {
        $is_dashboard_engine = 'WncDigikala' === 'WebinoDigikala';
        if ($is_dashboard_engine) {
            return (bool) apply_filters('webino_digikala_owns_runtime', true);
        }
        // Connector yields if Dashboard Digikala engine is present.
        if (class_exists('\\WebinoDigikala\\Auth', false) || function_exists('webinoDigikalaBooted')) {
            return (bool) apply_filters('wnc_digikala_owns_runtime', false);
        }
        return (bool) apply_filters('wnc_digikala_owns_runtime', true);
    }
}
