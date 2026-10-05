<?php

namespace WebinoBasalam\Services\Ticket;

use WebinoBasalam\Config\Endpoints;
use WebinoBasalam\Services\ApiServiceManager;

defined('ABSPATH') || exit;

class UpsertTicketSiteAccess
{
    private $url;

    public function __construct($businessId)
    {
        $this->url = sprintf(Endpoints::BUSINESS_SITE_ACCESS, intval($businessId));
    }

    public function execute($hamsalamToken, array $data): array
    {
        $apiService = webinoBasalamContainer()->get(ApiServiceManager::class);
        $headers = ['Authorization' => 'Bearer ' . $hamsalamToken];

        try {
            return $apiService->put($this->url, $data, $headers);
        } catch (\Exception $e) {
            return [
                'status_code' => intval($e->getCode()) ?: 500,
                'body' => null,
                'error' => 'خطا در ذخیره اطلاعات دسترسی.',
            ];
        }
    }
}
