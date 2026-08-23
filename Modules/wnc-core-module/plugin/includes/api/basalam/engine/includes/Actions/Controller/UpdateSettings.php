<?php

namespace WncBasalam\Actions\Controller;

use WncBasalam\Admin\Settings;

defined('ABSPATH') || exit;
class UpdateSettings extends ActionController
{
    public function __invoke()
    {
        try {
            Settings::saveSettings();
        } catch (\Exception $e) {
            wp_die('Error saving settings: ' . esc_html($e->getMessage()));
        }
    }
}
