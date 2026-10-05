<?php

namespace WebinoBasalam\Queue\Tasks;

use WebinoBasalam\Admin\Product\ProductOperations;
use WebinoBasalam\AsyncBackgroundProcess;

defined('ABSPATH') || exit;

class CreateProduct extends AsyncBackgroundProcess
{
    protected $action = 'CreateSingleProduct';
    protected $batch_size = 1;
    private $operator;

    public function __construct($operator = null)
    {
        parent::__construct();
        $this->operator = $operator ?: webinoBasalamContainer()->get(ProductOperations::class);
    }

    protected function task($item)
    {
        $this->operator->createNewProduct($item['id'], null);

        return false;
    }

    protected function complete()
    {
        parent::complete();
    }

    public function isActive()
    {
        return get_site_transient($this->identifier . '_process_lock') !== false;
    }
}
