<?php

namespace WebinoBasalam\Registrar;

use WebinoBasalam\Endpoints\EndpointRegistrar;
use WebinoBasalam\Registrar\Contracts\RegistrarInterface;

defined('ABSPATH') || exit;

class OrderRegistrar implements RegistrarInterface
{
    public static function register(): void
    {
        // REST API Endpoints
        \add_action('rest_api_init', [EndpointRegistrar::class, 'registerRoutes']);
    }
}
