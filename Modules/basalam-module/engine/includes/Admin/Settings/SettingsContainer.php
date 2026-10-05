<?php

namespace WebinoBasalam\Admin\Settings;

use WebinoBasalam\Admin\Settings;
use WebinoBasalam\Admin\Settings\SettingsConfig;

defined('ABSPATH') || exit;

class SettingsContainer
{
    private ?array $settings = null;

    public function getSettings($setting = null)
    {
        if ($this->settings === null) {
            $this->settings = Settings::getSettings();
        }

        if ($setting === null) return $this->settings;

        return $this->settings[$setting] ?? null;
    }

    /**
     * Drop in-memory cache after option writes (e.g. WooSalam token import).
     *
     * @return void
     */
    public function forget()
    {
        $this->settings = null;
    }

    public function hasToken(): bool
    {
        $token = ($this->getSettings(SettingsConfig::TOKEN));
        if (!$token) return false;
        return true;
    }

    /**
     * True only when an access token and a positive vendor_id are stored.
     */
    public function isConnected(): bool
    {
        if (!$this->hasToken()) {
            return false;
        }
        return absint($this->getSettings(SettingsConfig::VENDOR_ID)) >= 1;
    }
}
