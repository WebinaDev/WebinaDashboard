<?php

namespace WebinoBasalam\Registrar;

use WebinoBasalam\Registrar\Contracts\RegistrarInterface;
use WebinoBasalam\Queue\Tasks\UpdateProduct;
use WebinoBasalam\Queue\Tasks\CreateProduct;

defined('ABSPATH') || exit;

class QueueRegistrar implements RegistrarInterface
{
    public static function register(): void
    {
        $container = webinoBasalamContainer();
        self::initTasks($container);
        self::initWpBgProcess($container);
    }

    private static function initTasks($container): void
    {
        $taskClasses = [
            'Debug',
            'DailyCheckForceUpdate'
        ];

        foreach ($taskClasses as $className) {
            $fullClassName = 'WebinoBasalam\\Queue\\Tasks\\' . $className;
            if (\class_exists($fullClassName) && \is_subclass_of($fullClassName, 'WebinoBasalam\\Queue\\QueueAbstract')) {
                $task = $container->get($fullClassName);
                $task->registerHooks();
                if ($task->NEED_SCHEDULE) $task->schedule();
            }
        }
    }

    private static function initWpBgProcess($container): void
    {
        $dispatchers = [
            $container->get(CreateProduct::class),
            $container->get(UpdateProduct::class),
        ];

        foreach ($dispatchers as $dispatcher) {
            $className = \get_class($dispatcher);
            global ${$className};
            ${$className} = $dispatcher;
        }
    }
}
