<?php

namespace WncBasalam\Admin\Product\Data\Strategies;

use WncBasalam\Admin\Product\Data\Handlers\ProductDataHandlerInterface;

defined('ABSPATH') || exit;

interface DataStrategyInterface
{
    public function collect($product, ProductDataHandlerInterface $handler): array;
}