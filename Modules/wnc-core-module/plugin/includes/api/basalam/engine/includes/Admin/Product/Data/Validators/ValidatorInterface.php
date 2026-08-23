<?php

namespace WncBasalam\Admin\Product\Data\Validators;

defined('ABSPATH') || exit;

interface ValidatorInterface
{
    public function validate($product): void;
}