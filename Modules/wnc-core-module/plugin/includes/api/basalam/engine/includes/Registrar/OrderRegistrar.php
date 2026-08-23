<?php

namespace WncBasalam\Registrar;

use WncBasalam\Endpoints\EndpointRegistrar;
use WncBasalam\Registrar\Contracts\RegistrarInterface;

defined('ABSPATH') || exit;

class OrderRegistrar implements RegistrarInterface
{
    public static function register(): void
    {
        // REST API Endpoints
        \add_action('rest_api_init', [EndpointRegistrar::class, 'registerRoutes']);
    }
}
