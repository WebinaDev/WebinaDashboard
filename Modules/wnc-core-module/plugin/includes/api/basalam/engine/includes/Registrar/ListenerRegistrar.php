<?php

namespace WncBasalam\Registrar;

use WncBasalam\Registrar\Contracts\RegistrarInterface;
use WncBasalam\Registrar\ProductListeners\RestoreProduct;
use WncBasalam\Registrar\ProductListeners\ArchiveProduct;
use WncBasalam\Registrar\ProductListeners\UpdateWooProduct;
use WncBasalam\Registrar\ProductListeners\CreateWooProduct;

defined('ABSPATH') || exit;

class ListenerRegistrar implements RegistrarInterface
{
    public static function register(): void
    {
        $listeners = [
            'woocommerce_update_product' => UpdateWooProduct::class,
            'save_post'                  => CreateWooProduct::class,
            'untrashed_post'             => RestoreProduct::class,
            'wp_trash_post'              => ArchiveProduct::class,
        ];

        foreach ($listeners as $event => $listenerClass) {
            \add_action($event, function ($data) use ($listenerClass, $event) {
                $listener = wncBasalamContainer()->get($listenerClass);
                $listener->initHook($event, $data);
            }, 10, 2);
        }
    }
}
