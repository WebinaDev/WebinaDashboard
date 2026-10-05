<?php

namespace WebinoBasalam\Registrar\ProductListeners;

use WebinoBasalam\Admin\Settings\SettingsConfig;

defined('ABSPATH') || exit;

trait ProductStatusTrait
{
    public static function isProductSyncEnabled()
    {
        $status = webinoBasalamSettings()->getSettings(SettingsConfig::SYNC_STATUS_PRODUCT);

        return (bool) $status;
    }
}
