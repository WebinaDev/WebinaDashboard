<?php

namespace WebinoBasalam\Services\Api;

use WebinoBasalam\Jobs\Exceptions\NonRetryableException;

defined('ABSPATH') || exit;

class BlockedHttpRequestException extends NonRetryableException{}
