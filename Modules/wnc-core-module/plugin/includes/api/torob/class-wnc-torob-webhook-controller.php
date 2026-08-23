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
 * Handles the product webhook REST API boundary.
 */
final class WNC_Torob_Webhook_Controller
{
    private const TOKEN_ROUTE = '/set-token';

    private WNC_Torob_Webhook_Queue_Runner $queue_runner;

    public function __construct(WNC_Torob_Webhook_Queue_Runner $queue_runner)
    {
        $this->queue_runner = $queue_runner;
    }

    /**
     * Register product webhook REST endpoints.
     */
    public function register_routes(WNC_Torob_Token $validator): void
    {
        register_rest_route(WNC_Torob_Webhook_Queue_Runner::REST_NAMESPACE, self::TOKEN_ROUTE, [
            'methods' => 'POST',
            'callback' => [$this, 'receive_webhook_token'],
            'permission_callback' => [$validator, 'validate_token'],
            'args' => [
                'token' => [
                    'required' => true,
                    'type' => 'string'
                ]
            ]
        ], true);

        register_rest_route(WNC_Torob_Webhook_Queue_Runner::REST_NAMESPACE, WNC_Torob_Webhook_Queue_Runner::REST_ROUTE, [
            'methods' => 'POST',
            'callback' => [$this, 'run_product_webhook_queue'],
            'permission_callback' => [$this, 'authorize_queue_runner_request'],
            'args' => [
                WNC_Torob_Webhook_Queue_Runner::TOKEN_PARAMETER => [
                    'required' => true,
                    'type' => 'string'
                ]
            ]
        ], true);
    }

    /**
     * Accept and store the product page webhook token sent by Torob.
     */
    public function receive_webhook_token(WP_REST_Request $request): WP_REST_Response
    {
        if (!WNC_Torob_Options::isProductPageWebhookEnabled()) {
            return new WP_REST_Response(['error' => 'product page webhook is disabled'], 409);
        }

        $token = WNC_Torob_Token::sanitize_opaque_token_value($request->get_param('token')) ?? '';

        if ($token === '') {
            return new WP_REST_Response(['error' => 'token parameter is required'], 400);
        }

        WNC_Torob_Options::setToken($token);

        return new WP_REST_Response(['success' => true], 200);
    }

    /**
     * Verify that a fallback request presents the current runner lock token.
     *
     * @return true|WP_Error
     */
    public function authorize_queue_runner_request(WP_REST_Request $request)
    {
        if (!$this->queue_runner->is_fallback_active()) {
            return new WP_Error(
                WNC_Torob_Webhook_Queue_Runner::FALLBACK_INACTIVE_ERROR,
                'The product webhook runner fallback is not active',
                ['status' => 404]
            );
        }

        $lock_token = $this->get_runner_token($request);
        if ($this->queue_runner->is_runner_token_valid($lock_token)) {
            return true;
        }

        return new WP_Error(WNC_Torob_Webhook_Queue_Runner::INVALID_TOKEN_ERROR, 'A valid product webhook runner token is required', [
            'status' => 401
        ]);
    }

    /**
     * Process one authenticated fallback request.
     */
    public function run_product_webhook_queue(WP_REST_Request $request): WP_REST_Response
    {
        $result = $this->queue_runner->run_fallback($this->get_runner_token($request));

        if (!is_wp_error($result)) {
            return new WP_REST_Response(['success' => true, 'processed' => $result], 200);
        }

        return new WP_REST_Response(['error' => $result->get_error_message()], $this->get_runner_error_status($result));
    }

    /**
     * Read the opaque one-time runner token without text-field mutation.
     */
    private function get_runner_token(WP_REST_Request $request): string
    {
        $lock_token = $request->get_param(WNC_Torob_Webhook_Queue_Runner::TOKEN_PARAMETER);

        return is_string($lock_token) ? trim($lock_token) : '';
    }

    /**
     * Translate queue runner failures into endpoint response statuses.
     */
    private function get_runner_error_status(WP_Error $error): int
    {
        switch ($error->get_error_code()) {
            case WNC_Torob_Webhook_Queue_Runner::FALLBACK_INACTIVE_ERROR:
                return 404;
            case WNC_Torob_Webhook_Queue_Runner::INVALID_TOKEN_ERROR:
                return 401;
            case WNC_Torob_Webhook_Queue_Runner::WEBHOOK_NOT_READY_ERROR:
                return 409;
            default:
                return 500;
        }
    }
}
