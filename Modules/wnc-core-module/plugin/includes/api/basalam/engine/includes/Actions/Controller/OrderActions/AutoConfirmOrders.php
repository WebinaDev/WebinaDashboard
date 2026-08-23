<?php

namespace WncBasalam\Actions\Controller\OrderActions;

use WncBasalam\Admin\Settings\SettingsConfig;
use WncBasalam\Admin\Settings;
use WncBasalam\Logger\Logger;
use WncBasalam\Services\Orders\PostAutoConfirmOrder;
use WncBasalam\Actions\Controller\ActionController;

defined('ABSPATH') || exit;

class AutoConfirmOrders extends ActionController
{
    public function __invoke()
    {
        $autoConfirmStatus = wncBasalamSettings()->getSettings(SettingsConfig::AUTO_CONFIRM_ORDER);
        $autoConfirmStatus = !$autoConfirmStatus;
        $autoConfrimOrdersService = new PostAutoConfirmOrder();
        $result = $autoConfrimOrdersService->postAutoConfirmOrder($autoConfirmStatus);

        if ($result['success']) {
            $data = [
                SettingsConfig::AUTO_CONFIRM_ORDER => $autoConfirmStatus,
            ];
            Settings::updateSettings($data);
        } else {
            Logger::error("خطا در فعالسازی تایید خودکار سفارشات: " . $result['message']);
        }
    }
}
