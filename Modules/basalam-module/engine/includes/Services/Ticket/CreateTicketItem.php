<?php

namespace WebinoBasalam\Services\Ticket;

use WebinoBasalam\Config\Endpoints;
use WebinoBasalam\Services\ApiServiceManager;

class CreateTicketItem
{
    private $url;

    public function __construct($ticket_id)
    {
        $this->url  = sprintf(Endpoints::TICKET_ITEMS, $ticket_id);
    }
    public function execute($hamsalamToken, $data)
    {
        $apiService = webinoBasalamContainer()->get(ApiServiceManager::class);
        $header = ['Authorization' => 'Bearer ' . $hamsalamToken];

        try {
            return $apiService->post($this->url, $data, $header);
        } catch (\Exception $e) {
            return [
                'status_code' => $e->getCode() ?? 500,
                'body' => null,
                'error' => 'خطا در ثبت پاسخ تیکت: ' . $e->getMessage(),
            ];
        }
    }
}
