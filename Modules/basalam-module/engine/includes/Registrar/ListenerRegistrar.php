<?php

namespace WebinoBasalam\Registrar;

use WebinoBasalam\Registrar\Contracts\RegistrarInterface;
use WebinoBasalam\Registrar\ProductListeners\RestoreProduct;
use WebinoBasalam\Registrar\ProductListeners\ArchiveProduct;
use WebinoBasalam\Registrar\ProductListeners\UpdateWooProduct;
use WebinoBasalam\Registrar\ProductListeners\CreateWooProduct;

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
                $listener = webinoBasalamContainer()->get($listenerClass);
                $listener->initHook($event, $data);
            }, 10, 2);
        }
    }
}
