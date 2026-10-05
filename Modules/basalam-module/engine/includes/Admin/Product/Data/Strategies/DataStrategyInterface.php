<?php

namespace WebinoBasalam\Admin\Product\Data\Strategies;

use WebinoBasalam\Admin\Product\Data\Handlers\ProductDataHandlerInterface;

defined('ABSPATH') || exit;

interface DataStrategyInterface
{
    public function collect($product, ProductDataHandlerInterface $handler): array;
}