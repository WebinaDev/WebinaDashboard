<?php

namespace WncBasalam\Services\Api;

use WncBasalam\Jobs\Exceptions\NonRetryableException;

defined('ABSPATH') || exit;

class BlockedHttpRequestException extends NonRetryableException{}
