<?php

namespace WebinoBasalam\Services\Ticket;

use WebinoBasalam\Config\Endpoints;
use WebinoBasalam\Services\ApiServiceManager;

class FetchTicketSubjects
{
    private $url;

    public function __construct()
    {
        $this->url  = Endpoints::TICKET_SUBJECTS;
    }
    public function execute($hamsalamToken)
    {
        $apiService = webinoBasalamContainer()->get(ApiServiceManager::class);
        $headers = [
            'Authorization' => 'Bearer ' . $hamsalamToken,
            'X-App-Name' => 'webino-basalam'
        ];

        try {
            return $apiService->get($this->url, $headers);
        } catch (\Exception $e) {
            return [
                'status_code' => $e->getCode() ?? 500,
                'body' => null,
                'error' => 'خطا در دریافت موضوعات تیکت: ' . $e->getMessage(),
            ];
        }
    }
}
