<?php

namespace WebinoBasalam\Services;

use WebinoBasalam\Admin\Settings\SettingsConfig;
use WebinoBasalam\Admin\Settings;
use WebinoBasalam\Config\Endpoints;
use WebinoBasalam\Logger\Logger;

defined('ABSPATH') || exit;

class VendorInfoService
{
    private $apiService;
    private $basalamToken;
    private $basalamVendorId;

    public function __construct()
    {
        $this->apiService = webinoBasalamContainer()->get(ApiServiceManager::class);
        $this->basalamToken = Settings::getSettings(SettingsConfig::TOKEN);
        $this->basalamVendorId = Settings::getSettings(SettingsConfig::VENDOR_ID);
    }

    public function FetchVendorInfo()
    {
        if (!$this->basalamToken || !$this->basalamVendorId) {
            return null;
        }

        try {
            $apiUrl = sprintf(Endpoints::VENDOR_INFO, $this->basalamVendorId);
            $FetchVendorInfo = $this->apiService->get($apiUrl, ['Authorization' => 'Bearer ' . $this->basalamToken]);

            if (!is_array($FetchVendorInfo) || !isset($FetchVendorInfo['body'])) {
                return null;
            }

            $vendorInfo = is_array($FetchVendorInfo['body'])
                ? $FetchVendorInfo['body']
                : json_decode((string) $FetchVendorInfo['body'], true);
            if (!is_array($vendorInfo)) {
                return null;
            }

            return $vendorInfo;
        } catch (\Exception $e) {
            Logger::error('خطا در دریافت اطلاعات فروشنده: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Update vendor profile fields supported by OpenAPI.
     *
     * @param array<string,mixed> $fields Fields (title, summary, status, …).
     * @return array<string,mixed>
     */
    public function updateVendor(array $fields)
    {
        if (!$this->basalamToken || !$this->basalamVendorId) {
            return [
                'success' => false,
                'message' => 'Vendor not connected.',
            ];
        }

        $allowed = ['title', 'summary', 'status', 'city', 'province', 'is_active'];
        $body    = [];
        foreach ($allowed as $key) {
            if (array_key_exists($key, $fields)) {
                $body[$key] = $fields[$key];
            }
        }
        if (!$body) {
            return [
                'success' => false,
                'message' => 'No fields to update.',
            ];
        }

        try {
            $apiUrl = sprintf(Endpoints::VENDOR_INFO, $this->basalamVendorId);
            $res    = $this->apiService->patch($apiUrl, $body, ['Authorization' => 'Bearer ' . $this->basalamToken]);
            $code   = (int) ($res['status_code'] ?? 0);
            return [
                'success'     => $code >= 200 && $code < 300,
                'status_code' => $code,
                'data'        => $res['body'] ?? null,
                'message'     => $code >= 200 && $code < 300 ? 'OK' : 'Update failed',
            ];
        } catch (\Exception $e) {
            Logger::error('خطا در بروزرسانی فروشنده: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
