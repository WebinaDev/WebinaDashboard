<?php

namespace WncBasalam\Infrastructure\Container;

defined('ABSPATH') || exit;

interface ServiceProviderInterface
{
    public function register(ContainerInterface $container): void;
}
