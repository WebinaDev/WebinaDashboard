<?php

namespace WncBasalam\Utilities;

use WncBasalam\Admin\Settings\SettingsConfig;

defined('ABSPATH') || exit;

class ChatWidget
{
    public static function shouldLoadWidget()
    {
        $token = wncBasalamSettings()->hasToken();
        if (!$token) return false;

        return true;
    }

    public static function addTokenToWidgetScript($tag, $handle, $src)
    {
        if ($handle !== 'basalam-chat-widget-script') return $tag;

        $token = wncBasalamSettings()->getSettings(SettingsConfig::TOKEN);

        return sprintf('<script src="%s" token="%s"></script>', esc_url($src), esc_attr($token));
    }
}
