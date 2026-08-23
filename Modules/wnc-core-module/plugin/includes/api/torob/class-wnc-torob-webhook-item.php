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
 * Product page webhook item sent to Torob.
 */
class WNC_Torob_Webhook_Item
{
    private string $page_unique;
    private string $page_url;

    public function __construct(string $page_unique, string $page_url)
    {
        $this->page_unique = $page_unique;
        $this->page_url = $page_url;
    }

    public function get_page_unique(): string
    {
        return $this->page_unique;
    }

    public function get_page_url(): string
    {
        return $this->page_url;
    }

    /**
     * Convert the DTO to the webhook payload shape.
     *
     * @return array{page_unique: string, page_url: string}
     */
    public function to_array(): array
    {
        return [
            'page_unique' => $this->page_unique,
            'page_url' => $this->page_url
        ];
    }
}
