<?php

namespace WebinoBasalam\Services;

use WebinoBasalam\Admin\Settings\SettingsConfig;
use WebinoBasalam\Admin\Settings;
use WebinoBasalam\Config\Endpoints;
use WebinoBasalam\Logger\Logger;

defined('ABSPATH') || exit;

/**
 * Basalam Shipping Service (openapi.basalam.com/v1/shipping/*).
 * Replaces deprecated Core shipping-methods endpoints.
 */
class ShippingService
{
    private $api;
    private $token;
    private $vendorId;

    public function __construct()
    {
        $this->api      = webinoBasalamContainer()->get(ApiServiceManager::class);
        $this->token    = (string) Settings::getSettings(SettingsConfig::TOKEN);
        $this->vendorId = absint(Settings::getSettings(SettingsConfig::VENDOR_ID));
    }

    private function authHeaders(): array
    {
        return ['Authorization' => 'Bearer ' . $this->token];
    }

    /**
     * @return array{success:bool,status_code:int,data:mixed,message?:string}
     */
    public function listProfiles(int $page = 1, int $perPage = 50): array
    {
        if (!$this->token || $this->vendorId < 1) {
            return ['success' => false, 'status_code' => 400, 'data' => null, 'message' => 'Vendor not connected.'];
        }

        $url = add_query_arg(
            [
                'page'      => max(1, $page),
                'per_page'  => max(1, min(100, $perPage)),
                'vendor_id' => $this->vendorId,
            ],
            Endpoints::SHIPPING_PROFILES
        );

        try {
            $res  = $this->api->get($url, $this->authHeaders());
            $code = (int) ($res['status_code'] ?? 0);
            return [
                'success'     => $code >= 200 && $code < 300,
                'status_code' => $code,
                'data'        => $res['body'] ?? null,
            ];
        } catch (\Throwable $e) {
            Logger::error('Shipping listProfiles: ' . $e->getMessage());
            return ['success' => false, 'status_code' => 500, 'data' => null, 'message' => $e->getMessage()];
        }
    }

    /**
     * @param array<string,mixed> $fields title (+ optional extras)
     * @return array{success:bool,status_code:int,data:mixed,message?:string}
     */
    public function createProfile(array $fields): array
    {
        if (!$this->token || $this->vendorId < 1) {
            return ['success' => false, 'status_code' => 400, 'data' => null, 'message' => 'Vendor not connected.'];
        }

        $title = isset($fields['title']) ? sanitize_text_field((string) $fields['title']) : '';
        if ($title === '') {
            return ['success' => false, 'status_code' => 400, 'data' => null, 'message' => 'title is required.'];
        }

        $body = array_merge($fields, [
            'title'     => $title,
            'vendor_id' => $this->vendorId,
        ]);

        try {
            $res  = $this->api->post(Endpoints::SHIPPING_PROFILES, $body, $this->authHeaders());
            $code = (int) ($res['status_code'] ?? 0);
            return [
                'success'     => $code >= 200 && $code < 300,
                'status_code' => $code,
                'data'        => $res['body'] ?? null,
                'message'     => $code >= 200 && $code < 300 ? 'OK' : 'Create failed',
            ];
        } catch (\Throwable $e) {
            Logger::error('Shipping createProfile: ' . $e->getMessage());
            return ['success' => false, 'status_code' => 500, 'data' => null, 'message' => $e->getMessage()];
        }
    }

    /**
     * @param array<string,mixed> $fields
     * @return array{success:bool,status_code:int,data:mixed,message?:string}
     */
    public function updateProfile(int $profileId, array $fields): array
    {
        if (!$this->token || $profileId < 1) {
            return ['success' => false, 'status_code' => 400, 'data' => null, 'message' => 'Invalid profile.'];
        }

        $body = $fields;
        if (isset($body['title'])) {
            $body['title'] = sanitize_text_field((string) $body['title']);
        }
        unset($body['profile_id'], $body['id'], $body['action']);

        try {
            $url  = sprintf(Endpoints::SHIPPING_PROFILE, $profileId);
            $res  = $this->api->patch($url, $body, $this->authHeaders());
            $code = (int) ($res['status_code'] ?? 0);
            return [
                'success'     => $code >= 200 && $code < 300,
                'status_code' => $code,
                'data'        => $res['body'] ?? null,
                'message'     => $code >= 200 && $code < 300 ? 'OK' : 'Update failed',
            ];
        } catch (\Throwable $e) {
            Logger::error('Shipping updateProfile: ' . $e->getMessage());
            return ['success' => false, 'status_code' => 500, 'data' => null, 'message' => $e->getMessage()];
        }
    }

    /**
     * @return array{success:bool,status_code:int,data:mixed,message?:string}
     */
    public function deleteProfile(int $profileId): array
    {
        if (!$this->token || $profileId < 1) {
            return ['success' => false, 'status_code' => 400, 'data' => null, 'message' => 'Invalid profile.'];
        }

        try {
            $url  = sprintf(Endpoints::SHIPPING_PROFILE, $profileId);
            $res  = $this->api->delete($url, $this->authHeaders());
            $code = (int) ($res['status_code'] ?? 0);
            return [
                'success'     => $code >= 200 && $code < 300,
                'status_code' => $code,
                'data'        => $res['body'] ?? null,
            ];
        } catch (\Throwable $e) {
            Logger::error('Shipping deleteProfile: ' . $e->getMessage());
            return ['success' => false, 'status_code' => 500, 'data' => null, 'message' => $e->getMessage()];
        }
    }

    /**
     * @return array{success:bool,status_code:int,data:mixed,message?:string}
     */
    public function listCarriers(): array
    {
        if (!$this->token) {
            return ['success' => false, 'status_code' => 400, 'data' => null, 'message' => 'Not connected.'];
        }

        try {
            $res  = $this->api->get(Endpoints::SHIPPING_CARRIERS, $this->authHeaders());
            $code = (int) ($res['status_code'] ?? 0);
            return [
                'success'     => $code >= 200 && $code < 300,
                'status_code' => $code,
                'data'        => $res['body'] ?? null,
            ];
        } catch (\Throwable $e) {
            Logger::error('Shipping listCarriers: ' . $e->getMessage());
            return ['success' => false, 'status_code' => 500, 'data' => null, 'message' => $e->getMessage()];
        }
    }

    /**
     * @return array{success:bool,status_code:int,data:mixed,message?:string}
     */
    public function listVendorCarriers(): array
    {
        if (!$this->token || $this->vendorId < 1) {
            return ['success' => false, 'status_code' => 400, 'data' => null, 'message' => 'Vendor not connected.'];
        }

        $url = add_query_arg(['vendor_id' => $this->vendorId], Endpoints::SHIPPING_VENDOR_CARRIERS);

        try {
            $res  = $this->api->get($url, $this->authHeaders());
            $code = (int) ($res['status_code'] ?? 0);
            return [
                'success'     => $code >= 200 && $code < 300,
                'status_code' => $code,
                'data'        => $res['body'] ?? null,
            ];
        } catch (\Throwable $e) {
            Logger::error('Shipping listVendorCarriers: ' . $e->getMessage());
            return ['success' => false, 'status_code' => 500, 'data' => null, 'message' => $e->getMessage()];
        }
    }

    /**
     * @return array{success:bool,status_code:int,data:mixed,message?:string}
     */
    public function readStrategy(): array
    {
        if (!$this->token || $this->vendorId < 1) {
            return ['success' => false, 'status_code' => 400, 'data' => null, 'message' => 'Vendor not connected.'];
        }

        $url = add_query_arg(['vendor_id' => $this->vendorId], Endpoints::SHIPPING_PROFILE_STRATEGY);

        try {
            $res  = $this->api->get($url, $this->authHeaders());
            $code = (int) ($res['status_code'] ?? 0);
            return [
                'success'     => $code >= 200 && $code < 300,
                'status_code' => $code,
                'data'        => $res['body'] ?? null,
            ];
        } catch (\Throwable $e) {
            Logger::error('Shipping readStrategy: ' . $e->getMessage());
            return ['success' => false, 'status_code' => 500, 'data' => null, 'message' => $e->getMessage()];
        }
    }
}
