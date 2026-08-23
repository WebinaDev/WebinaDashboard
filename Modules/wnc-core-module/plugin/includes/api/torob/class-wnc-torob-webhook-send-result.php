<?php
/**
 * Torob port — adapted from official plugin 2.3.0.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Result of sending product page webhook items to Torob.
 */
class WNC_Torob_Webhook_Send_Result
{
    private bool $success;
    private int $status_code;

    public function __construct(bool $success, int $status_code)
    {
        $this->success = $success;
        $this->status_code = $status_code;
    }

    public function is_success(): bool
    {
        return $this->success;
    }

    public function get_status_code(): int
    {
        return $this->status_code;
    }
}
