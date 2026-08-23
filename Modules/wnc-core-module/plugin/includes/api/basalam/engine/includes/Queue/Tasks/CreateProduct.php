<?php

namespace WncBasalam\Queue\Tasks;

use WncBasalam\Admin\Product\ProductOperations;
use WncBasalam\AsyncBackgroundProcess;

defined('ABSPATH') || exit;

class CreateProduct extends AsyncBackgroundProcess
{
    protected $action = 'CreateSingleProduct';
    protected $batch_size = 1;
    private $operator;

    public function __construct($operator = null)
    {
        parent::__construct();
        $this->operator = $operator ?: wncBasalamContainer()->get(ProductOperations::class);
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
