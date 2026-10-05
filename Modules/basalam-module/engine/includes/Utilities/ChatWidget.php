<?php

namespace WebinoBasalam\Utilities;

use WebinoBasalam\Admin\Settings\SettingsConfig;

defined('ABSPATH') || exit;

class ChatWidget
{
    public static function shouldLoadWidget()
    {
        $token = webinoBasalamSettings()->hasToken();
        if (!$token) return false;

        return true;
    }

    public static function addTokenToWidgetScript($tag, $handle, $src)
    {
        if ($handle !== 'basalam-chat-widget-script') return $tag;

        $token = webinoBasalamSettings()->getSettings(SettingsConfig::TOKEN);

        return sprintf('<script src="%s" token="%s"></script>', esc_url($src), esc_attr($token));
    }
}
