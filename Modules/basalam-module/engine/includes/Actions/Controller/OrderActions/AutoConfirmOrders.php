<?php

namespace WebinoBasalam\Actions\Controller\OrderActions;

use WebinoBasalam\Admin\Settings\SettingsConfig;
use WebinoBasalam\Admin\Settings;
use WebinoBasalam\Logger\Logger;
use WebinoBasalam\Services\Orders\PostAutoConfirmOrder;
use WebinoBasalam\Actions\Controller\ActionController;

defined('ABSPATH') || exit;

class AutoConfirmOrders extends ActionController
{
    public function __invoke()
    {
        $autoConfirmStatus = webinoBasalamSettings()->getSettings(SettingsConfig::AUTO_CONFIRM_ORDER);
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
