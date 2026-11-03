<?php

namespace WebinoBasalam\Services;

use WebinoBasalam\Admin\Settings\OAuthManager;
use WebinoBasalam\Admin\Settings\SettingsConfig;
use WebinoBasalam\Config\Endpoints;

defined('ABSPATH') || exit;

class FinancialManagementService
{
    private const BALANCE_URL = 'https://accounting.basalam.com/financial/v1/client/transaction/balance';
    private const BALANCE_SETTLEMENT_URL = 'https://accounting.basalam.com/financial/v1/client/balance-settlement';
    private const BALANCE_SETTLEMENT_POST_URL = 'https://accounting.basalam.com/financial/v2/client/balance-settlement';
    private const BANK_ACCOUNTS_URL = 'https://identity.basalam.com/v1/users/bank-accounts';
    private const ACTIVE_STATUS_FILTER_TYPE = 2;
    private const ACTIVE_STATUSES = [4, 6, 8, 9, 10];
    private const DEFAULT_PER_PAGE = 20;

    public function getDefaultPerPage(): int
    {
        return self::DEFAULT_PER_PAGE;
    }

    public function getBalanceUrl(): string
    {
        return self::BALANCE_URL;
    }

    public function getActiveSettlementsUrl(int $page = 1, int $perPage = self::DEFAULT_PER_PAGE): string
    {
        return $this->buildBalanceSettlementUrl($page, $perPage, self::ACTIVE_STATUSES, true);
    }

    public function getHistoryUrl(int $page = 1, int $perPage = self::DEFAULT_PER_PAGE): string
    {
        return $this->buildBalanceSettlementUrl($page, $perPage);
    }

    public function getBalance(): array
    {
        return $this->proxy('balance');
    }

    public function getActiveSettlements(int $page = 1, int $perPage = self::DEFAULT_PER_PAGE): array
    {
        return $this->proxy('active_settlements', [
            'page' => max(1, $page),
            'per_page' => max(1, $perPage),
        ]);
    }

    public function getSettlementHistory(int $page = 1, int $perPage = self::DEFAULT_PER_PAGE): array
    {
        return $this->proxy('history', [
            'page' => max(1, $page),
            'per_page' => max(1, $perPage),
        ]);
    }

    public function getBankAccounts(): array
    {
        return $this->proxy('banks');
    }

    public function createSettlement(int $amount, int $method, ?int $investmentOptionId = null, ?int $bankAccountId = null): array
    {
        return $this->proxy('create_settlement', [
            'amount' => $amount,
            'settlement_method' => $method,
            'investment_option_id' => $investmentOptionId,
            'bank_account_id' => $bankAccountId,
        ]);
    }

    public function getToken(): string
    {
        if (function_exists('webinoBasalamSettings') && class_exists(SettingsConfig::class)) {
            $token = webinoBasalamSettings()->getSettings(SettingsConfig::TOKEN);
            return is_string($token) ? trim($token) : '';
        }

        $settings = get_option('webino_basalam_sync_settings', []);
        if (!is_array($settings)) {
            return '';
        }

        $token = $settings['token'] ?? '';
        return is_string($token) ? trim($token) : '';
    }

    /**
     * Booth balance goes through WebinoERP (webina.dev). Basalam accounting
     * returns 403 when the shop calls it directly.
     *
     * @param array<string,mixed> $params
     */
    private function proxy(string $op, array $params = [], bool $retried = false): array
    {
        $token = $this->getToken();
        if ($token === '') {
            return [
                'success' => false,
                'status_code' => 0,
                'message' => 'توکن باسلام یافت نشد. ابتدا اتصال باسلام را در افزونه اصلی باسلام انجام دهید.',
                'data' => [],
                'raw_body' => '',
            ];
        }

        $payload = array_merge($params, [
            'op' => $op,
            'site_url' => get_site_url(),
            'access_token' => $token,
        ]);
        $payload = array_filter(
            $payload,
            static function ($value) {
                return null !== $value;
            }
        );

        $response = $this->remote('POST', Endpoints::vendorBaseUrl() . '/api/webinocrm/v1/basalam/finance/proxy', [
            'timeout' => 25,
            'headers' => [
                'Accept'       => 'application/json',
                'Content-Type' => 'application/json',
            ],
            'body'    => wp_json_encode($payload),
        ]);

        if (is_wp_error($response)) {
            return $this->direct($op, $params);
        }

        $statusCode = (int) wp_remote_retrieve_response_code($response);
        $body = (string) wp_remote_retrieve_body($response);
        $decoded = $this->decodeJsonResponse($body);

        if ($statusCode === 404) {
            return $this->direct($op, $params);
        }

        if ($statusCode === 401 && ! $retried && OAuthManager::refreshAccessToken() === true) {
            return $this->proxy($op, $params, true);
        }

        if ($statusCode < 200 || $statusCode > 299) {
            return [
                'success' => false,
                'status_code' => $statusCode,
                'message' => $this->extractErrorMessage($decoded, $body, $statusCode),
                'data' => is_array($decoded) ? $decoded : [],
                'raw_body' => $body,
            ];
        }

        if (!is_array($decoded)) {
            return [
                'success' => false,
                'status_code' => $statusCode,
                'message' => 'پاسخ API قابل تبدیل به JSON نیست.',
                'data' => [],
                'raw_body' => $body,
            ];
        }

        return [
            'success' => true,
            'status_code' => $statusCode,
            'message' => '',
            'data' => $decoded,
            'raw_body' => $body,
        ];
    }

    /**
     * Used only when the ERP route is not deployed yet.
     *
     * @param array<string,mixed> $params
     */
    private function direct(string $op, array $params): array
    {
        $token = $this->getToken();
        $page = max(1, (int) ($params['page'] ?? 1));
        $perPage = max(1, (int) ($params['per_page'] ?? self::DEFAULT_PER_PAGE));
        $method = 'GET';
        $url = self::BALANCE_URL;
        $body = null;

        if ($op === 'active_settlements') {
            $url = $this->getActiveSettlementsUrl($page, $perPage);
        } elseif ($op === 'history') {
            $url = $this->getHistoryUrl($page, $perPage);
        } elseif ($op === 'banks') {
            $url = self::BANK_ACCOUNTS_URL;
        } elseif ($op === 'create_settlement') {
            $method = 'POST';
            $url = self::BALANCE_SETTLEMENT_POST_URL;
            $body = [
                'amount' => (int) ($params['amount'] ?? 0),
                'method' => (int) ($params['settlement_method'] ?? 0),
            ];
            if (!empty($params['investment_option_id'])) {
                $body['investment_option_id'] = (int) $params['investment_option_id'];
            }
            if (!empty($params['bank_account_id'])) {
                $body['bank_account_id'] = (int) $params['bank_account_id'];
            }
        }

        $response = $this->remote($method, $url, [
            'timeout' => 25,
            'headers' => [
                'Authorization' => 'Bearer ' . $token,
                'Accept'        => 'application/json',
                'Content-Type'  => 'application/json',
                'user-agent'    => 'Wp-Basalam',
                'referer'       => Endpoints::vendorBaseUrl(),
            ],
            'body' => $body !== null ? wp_json_encode($body) : null,
        ]);

        if (is_wp_error($response)) {
            return [
                'success' => false,
                'status_code' => 0,
                'message' => $response->get_error_message(),
                'data' => [],
                'raw_body' => '',
            ];
        }

        $statusCode = (int) wp_remote_retrieve_response_code($response);
        $raw = (string) wp_remote_retrieve_body($response);
        $decoded = $this->decodeJsonResponse($raw);
        if ($statusCode < 200 || $statusCode > 299) {
            return [
                'success' => false,
                'status_code' => $statusCode,
                'message' => $this->extractErrorMessage($decoded, $raw, $statusCode),
                'data' => is_array($decoded) ? $decoded : [],
                'raw_body' => $raw,
            ];
        }
        if (!is_array($decoded)) {
            return [
                'success' => false,
                'status_code' => $statusCode,
                'message' => 'پاسخ API قابل تبدیل به JSON نیست.',
                'data' => [],
                'raw_body' => $raw,
            ];
        }

        return [
            'success' => true,
            'status_code' => $statusCode,
            'message' => '',
            'data' => $decoded,
            'raw_body' => $raw,
        ];
    }

    /**
     * webina.dev and Basalam often drop HTTP/2 mid-body (cURL 18). Force HTTP/1.1 and retry once.
     *
     * @param array<string,mixed> $args
     * @return array|\WP_Error
     */
    private function remote(string $method, string $url, array $args)
    {
        $args['method'] = $method;
        $args['httpversion'] = '1.1';
        $args['timeout'] = isset($args['timeout']) ? (int) $args['timeout'] : 25;

        $response = wp_remote_request($url, $args);
        if (!is_wp_error($response) || !$this->isTruncatedTransfer($response)) {
            return $response;
        }

        return wp_remote_request($url, $args);
    }

    /**
     * @param \WP_Error $error Transport error.
     */
    private function isTruncatedTransfer(\WP_Error $error): bool
    {
        $message = $error->get_error_message();
        return strpos($message, 'cURL error 18') !== false
            || strpos($message, 'cURL error 52') !== false
            || strpos($message, 'cURL error 56') !== false
            || strpos($message, 'transfer closed') !== false;
    }

    private function buildBalanceSettlementUrl(int $page, int $perPage, array $statuses = [], bool $withStatusFilter = false): string
    {
        $page = max(1, $page);
        $perPage = max(1, $perPage);

        $params = [
            'page' => $page,
            'per_page' => $perPage,
        ];

        if ($withStatusFilter) {
            $params['status_filter_type'] = self::ACTIVE_STATUS_FILTER_TYPE;
        }

        $query = http_build_query($params, '', '&', PHP_QUERY_RFC3986);

        foreach ($statuses as $status) {
            $query .= '&status=' . rawurlencode((string) $status);
        }

        return self::BALANCE_SETTLEMENT_URL . '?' . $query;
    }

    private function decodeJsonResponse(string $body): ?array
    {
        $trimmed = trim($body);
        if ($trimmed === '') {
            return null;
        }

        $decoded = json_decode($trimmed, true);
        if (is_array($decoded) && json_last_error() === JSON_ERROR_NONE) {
            return $decoded;
        }

        $start = strpos($trimmed, '{');
        $end = strrpos($trimmed, '}');

        if ($start !== false && $end !== false && $end > $start) {
            $candidate = substr($trimmed, $start, ($end - $start + 1));
            $decodedCandidate = json_decode($candidate, true);
            if (is_array($decodedCandidate) && json_last_error() === JSON_ERROR_NONE) {
                return $decodedCandidate;
            }
        }

        return null;
    }

    private function extractErrorMessage($decodedBody, string $rawBody, int $statusCode): string
    {
        if (is_array($decodedBody)) {
            if (!empty($decodedBody['message']) && is_string($decodedBody['message'])) {
                return $decodedBody['message'] . ' (کد ' . $statusCode . ')';
            }

            if (!empty($decodedBody['error']) && is_string($decodedBody['error'])) {
                return $decodedBody['error'] . ' (کد ' . $statusCode . ')';
            }

            if (!empty($decodedBody['errors'][0]['message']) && is_string($decodedBody['errors'][0]['message'])) {
                return $decodedBody['errors'][0]['message'] . ' (کد ' . $statusCode . ')';
            }
        }

        if ($rawBody !== '') {
            return 'خطای API با کد ' . $statusCode . ': ' . wp_strip_all_tags($rawBody);
        }

        return 'خطای API با کد ' . $statusCode;
    }
}
