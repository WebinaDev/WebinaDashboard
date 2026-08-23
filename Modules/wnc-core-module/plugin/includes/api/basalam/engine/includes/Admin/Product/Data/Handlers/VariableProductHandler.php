<?php

namespace WncBasalam\Admin\Product\Data\Handlers;

use WncBasalam\Admin\Product\Data\Services\VariantService;

defined('ABSPATH') || exit;

class VariableProductHandler extends SimpleProductHandler
{
    private $variantService;

    public function __construct()
    {
        parent::__construct();
        $this->variantService = new VariantService();
    }

    public function getVariants($product): array
    {
        return $this->variantService->getVariants($product);
    }
}