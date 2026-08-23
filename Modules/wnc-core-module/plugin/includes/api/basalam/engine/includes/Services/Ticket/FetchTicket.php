<?php

namespace WncBasalam\Services\Ticket;

use WncBasalam\Config\Endpoints;
use WncBasalam\Services\ApiServiceManager;

class FetchTicket
{
    private $url;

    public function __construct($ticket_id)
    {
        $this->url  = sprintf(Endpoints::TICKET_DETAIL, $ticket_id);
    }
    public function execute($hamsalamToken)
    {
        $apiService = wncBasalamContainer()->get(ApiServiceManager::class);
        $header = ['Authorization' => 'Bearer ' . $hamsalamToken];

        try {
            return $apiService->get($this->url, $header);
        } catch (\Exception $e) {
            return [
                'status_code' => $e->getCode() ?? 500,
                'body' => null,
                'error' => 'خطا در دریافت تیکت: ' . $e->getMessage(),
            ];
        }
    }
}
