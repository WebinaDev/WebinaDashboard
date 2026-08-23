<?php

namespace WncBasalam\Registrar\ProductListeners;

use WncBasalam\Admin\Settings\SettingsConfig;

defined('ABSPATH') || exit;

trait ProductStatusTrait
{
    public static function isProductSyncEnabled()
    {
        $status = wncBasalamSettings()->getSettings(SettingsConfig::SYNC_STATUS_PRODUCT);

        return (bool) $status;
    }
}
