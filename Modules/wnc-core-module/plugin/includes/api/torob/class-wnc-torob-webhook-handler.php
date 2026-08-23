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
 * Coordinates product page webhook controllers and lifecycle operations.
 */
class WNC_Torob_Webhook_Handler
{
    private WNC_Torob_Webhook_Controller $controller;
    private WNC_Torob_Webhook_Queue_Services $queue_services;
    private WNC_Torob_Webhook_Queue_Runner $queue_runner;
    private WNC_Torob_Webhook_Observer $product_change_observer;

    public function __construct(?bool $wp_cron_disabled = null)
    {
        $this->queue_services = new WNC_Torob_Webhook_Queue_Services();
        $this->queue_runner = new WNC_Torob_Webhook_Queue_Runner($this->queue_services, $wp_cron_disabled);
        $this->controller = new WNC_Torob_Webhook_Controller($this->queue_runner);
        $this->product_change_observer = new WNC_Torob_Webhook_Observer($this->queue_services);
    }

    /**
     * Set the product page webhook enabled state.
     */
    public function set_webhook_enabled(bool $enabled): void
    {
        if ($enabled) {
            WNC_Torob_Options::setProductPageWebhookEnabled(true);
        } else {
            WNC_Torob_Options::setProductPageWebhookEnabled(false);
            $this->queue_runner->unregister_hooks();
            WNC_Torob_Webhook_Queue_Runner::clear_state();
            WNC_Torob_Webhook_Queue_Services::clear_pending_queue();
        }
    }

    /**
     * Clear product webhook queue and runner state on plugin deactivation.
     */
    public function plugin_deactivated(): void
    {
        $this->queue_runner->unregister_hooks();
        WNC_Torob_Webhook_Queue_Runner::clear_state();
        WNC_Torob_Webhook_Queue_Services::clear_pending_queue();
    }

    /**
     * Register product page webhook REST endpoints.
     */
    public function register_routes(WNC_Torob_Token $validator): void
    {
        $this->controller->register_routes($validator);
    }

    /**
     * Register all product page webhook hooks.
     */
    public function register_hooks(): void
    {
        $this->product_change_observer->register_product_hooks();
        $this->queue_runner->register_hooks();
    }

    /**
     * Count products currently waiting in the webhook queue.
     */
    public function get_pending_queue_product_count(): int
    {
        return $this->queue_services->count_pending();
    }

    /**
     * Get the completion time of the last queue run.
     */
    public function get_queue_runner_last_run_timestamp(): ?int
    {
        return $this->queue_runner->get_last_run_timestamp();
    }

    /**
     * Get the next queue run time.
     */
    public function get_queue_runner_next_run_timestamp(): ?int
    {
        return $this->queue_runner->get_next_run_timestamp();
    }

    /**
     * Fetch queued products for admin preview.
     *
     * @return array<int, object>
     */
    public function get_pending_queue_products(int $limit, int $offset): array
    {
        return $this->queue_services->get_paginated_webhook_items($limit, $offset);
    }
}
