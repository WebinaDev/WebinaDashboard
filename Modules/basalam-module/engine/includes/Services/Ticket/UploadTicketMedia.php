<?php

namespace WebinoBasalam\Services\Ticket;

use WebinoBasalam\Config\Endpoints;
use WebinoBasalam\Services\ApiServiceManager;

defined('ABSPATH') || exit;

class UploadTicketMedia
{
    private $url = Endpoints::TICKET_MEDIA_UPLOAD;

    public function execute($hamsalamToken, $filePath)
    {
        $apiService = webinoBasalamContainer()->get(ApiServiceManager::class);
        $headers = [
            'Authorization' => 'Bearer ' . $hamsalamToken,
            'Accept' => 'application/json',
        ];
        $fields = [
            'type' => 'ticket_item',
            'collection' => 'IMAGE',
        ];

        try {
            return $apiService->upload($this->url, $filePath, $fields, $headers);
        } catch (\Exception $e) {
            return [
                'status_code' => $e->getCode() ?? 500,
                'body' => null,
                'error' => 'خطا در آپلود فایل: ' . $e->getMessage(),
            ];
        }
    }
}
