<?php

namespace WebinoBasalam\Services\Orders;

use WebinoBasalam\Admin\Settings\SettingsConfig;
use WebinoBasalam\Config\Endpoints;
use WebinoBasalam\Logger\Logger;
use WebinoBasalam\Utilities\GetProvincesData;
use WebinoBasalam\Utilities\ProductMetaKey;
use WebinoBasalam\Services\ApiServiceManager;

defined('ABSPATH') || exit;

class OrderManager
{

    private static function shouldBypassWccfOrderHooks()
    {
        return class_exists('WCCF_WC_Order') && !class_exists('RightPress_Product_Price_Shop');
    }

    private static function removeWccfOrderSaveHooks()
    {
        global $wp_filter;

        $removedHooks = [];

        if (!is_array($wp_filter) && !($wp_filter instanceof \ArrayAccess)) {
            return $removedHooks;
        }

        foreach ($wp_filter as $hookName => $hook) {
            if (!isset($hook->callbacks) || !is_array($hook->callbacks)) {
                continue;
            }

            foreach ($hook->callbacks as $priority => $callbacks) {
                foreach ($callbacks as $callbackConfig) {
                    $callback = $callbackConfig['function'] ?? null;

                    if (!is_array($callback) || !is_object($callback[0] ?? null) || !isset($callback[1])) {
                        continue;
                    }

                    if (!($callback[0] instanceof \WCCF_WC_Order) || $callback[1] !== 'save_order_field_values') {
                        continue;
                    }

                    if (remove_filter($hookName, $callback, $priority)) {
                        $removedHooks[] = [
                            'hook' => $hookName,
                            'callback' => $callback,
                            'priority' => $priority,
                            'accepted_args' => $callbackConfig['accepted_args'] ?? 1,
                        ];
                    }
                }
            }
        }

        return $removedHooks;
    }

    private static function restoreWccfOrderSaveHooks(array $removedHooks)
    {
        foreach ($removedHooks as $hookConfig) {
            add_filter(
                $hookConfig['hook'],
                $hookConfig['callback'],
                $hookConfig['priority'],
                $hookConfig['accepted_args']
            );
        }
    }

    private static function executeWithoutWccfOrderSaveHooks(callable $callback, $invoice_id, $contextLabel)
    {
        $removedWccfHooks = [];

        if (self::shouldBypassWccfOrderHooks()) {
            $removedWccfHooks = self::removeWccfOrderSaveHooks();
        }

        try {
            return $callback();
        } finally {
            if (!empty($removedWccfHooks)) {
                self::restoreWccfOrderSaveHooks($removedWccfHooks);
            }
        }
    }

    public static function createOrderWooFromRequest(\WP_REST_Request $request)
    {
        return self::createRestResponse(
            self::createOrderWoo($request->get_params())
        );
    }

    public static function orderManger(\WP_REST_Request $request, $checkSyncStatus = true)
    {
        $parsedParams = $request->get_params();

        // WooCommerce inactive/being updated: answer 503 so Basalam retries later instead of a fatal.
        if (!function_exists('wc_get_order') || !function_exists('wc_create_order')) {
            return self::createRestResponse([
                'success' => false,
                'message' => 'WooCommerce is not active.',
                'status'  => 503,
            ]);
        }

        if ($checkSyncStatus && !webinoBasalamSettings()->getSettings(SettingsConfig::SYNC_STATUS_ORDER)) {
            return self::createRestResponse([
                'success' => true,
                'message' => 'Order sync is disabled.',
                'status'  => 200,
            ]);
        }

        Logger::debug("دریافت رویداد سفارش: " . json_encode($parsedParams));

        if (isset($parsedParams['event_id']) && $parsedParams['event_id'] == 7) {
            if ($parsedParams['type'] == 'shipped') {
                return self::createRestResponse(self::shippedOrderWoo($parsedParams['invoice_id']));
            } elseif ($parsedParams['type'] == 'cancelled') {
                return self::createRestResponse(self::cancelOrderWoo($parsedParams['invoice_id']));
            } elseif ($parsedParams['type'] == 'preparation') {
                return self::createRestResponse(self::confirmOrderWoo($parsedParams['invoice_id']));
            }
        } elseif (isset($parsedParams['event_id']) && $parsedParams['event_id'] == 3) {
            if ($parsedParams['status'] == '3195') {
                return self::createRestResponse(self::completeOrderWoo($parsedParams['more_data']['invoice_id']));
            } elseif ($parsedParams['status'] == '3067' || $parsedParams['status'] == '3233') {
                return self::createRestResponse(self::cancelOrderWoo($parsedParams['more_data']['invoice_id']));
            }
        } else {
            return self::createOrderWooFromRequest($request);
        }

        return self::createRestResponse([
            'success' => false,
            'message' => 'Unsupported order event.',
            'error'   => 'The incoming event did not match any supported order action.',
            'status'  => 400,
        ]);
    }

    public static function createOrderWoo($params)
    {
        $payment_id = $params['payment_id'] ?? null;
        $invoice_id = $params['invoice_id'] ?? null;
        $user_id = $params['user_id'] ?? null;
        $city_id = $params['city_id'] ?? null;
        $province_id = $params['province_id'] ?? null;

        global $wpdb;
        $table_name = $wpdb->prefix . 'webino_basalam_payments';

        if (empty($invoice_id)) {
            return [
                'success' => false,
                'message' => 'Missing invoice_id.',
                'error'   => 'invoice_id is required to create an order.',
                'status'  => 400,
            ];
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, PluginCheck.Security.DirectDB.UnescapedDBParameter -- Custom plugin table; identifier from $wpdb->prefix, not user input.
        $existingOrderId = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT order_id FROM {$table_name} WHERE invoice_id = %d LIMIT 1",
                $invoice_id
            )
        );

        if ($existingOrderId) {
            return [
                'success'  => true,
                'message'  => 'Order already exists.',
                'order_id' => (int) $existingOrderId,
                'status'   => 200,
            ];
        }

        $lockName = 'webino_basalam_invoice_' . $invoice_id;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Named MySQL advisory lock; no object cache applicable.
        $gotLock = $wpdb->get_var(
            $wpdb->prepare("SELECT GET_LOCK(%s, 0)", $lockName)
        );

        if ($gotLock !== '1' && $gotLock !== 1) {
            Logger::debug("ریکوئست تکراری webhook برای invoice_id {$invoice_id} ـ نادیده گرفته شد (در حال پردازش توسط ریکوئست دیگر).");
            return [
                'success' => true,
                'message' => 'Order is already being processed by another request.',
                'status'  => 200,
            ];
        }

        try {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, PluginCheck.Security.DirectDB.UnescapedDBParameter -- Custom plugin table; identifier from $wpdb->prefix, not user input.
            $existingOrderId = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT order_id FROM {$table_name} WHERE invoice_id = %d LIMIT 1",
                    $invoice_id
                )
            );

            if (!$existingOrderId) {
                // Fallback: order saved but payments-table row missing (crash between the two writes).
                $existingOrderId = self::findOrderIdByInvoiceMeta($invoice_id);
            }

            if ($existingOrderId) {
                return [
                    'success'  => true,
                    'message'  => 'Order already exists.',
                    'order_id' => (int) $existingOrderId,
                    'status'   => 200,
                ];
            }

            return self::createOrderWooLocked($params, $invoice_id, $payment_id, $user_id, $city_id, $province_id, $table_name);
        } finally {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Named MySQL advisory lock; no object cache applicable.
            $wpdb->query(
                $wpdb->prepare("SELECT RELEASE_LOCK(%s)", $lockName)
            );
        }
    }

    private static function createOrderWooLocked($params, $invoice_id, $payment_id, $user_id, $city_id, $province_id, $table_name)
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Transaction control statement; no object cache applicable.
        $wpdb->query('START TRANSACTION');
        try {

            $vendor_id = webinoBasalamSettings()->getSettings(SettingsConfig::VENDOR_ID);

            $api_url = sprintf(Endpoints::ORDER_DETAIL, $vendor_id, $invoice_id);

            $apiServiceManager = webinoBasalamContainer()->get(ApiServiceManager::class);

            $response = $apiServiceManager->get($api_url);

            if (isset($response['success']) && !$response['success']) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Transaction control statement; no object cache applicable.
                $wpdb->query('ROLLBACK');
                Logger::error("درخواست API ناموفق بود: " . ($response['error'] ?? 'خطای نامشخص'));

                return [
                    'success' => false,
                    'message' => 'Failed to fetch invoice details.',
                    'error'   => $response['error'] ?? 'Unknown error',
                    'status'  => 500,
                ];
            }

            $api_response = $response['body'] ?? '';
            $data = json_decode($api_response, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Transaction control statement; no object cache applicable.
                $wpdb->query('ROLLBACK');

                return [
                    'success' => false,
                    'message' => 'Failed to parse API response.',
                    'error'   => 'Invalid JSON response: ' . json_last_error_msg(),
                    'status'  => 500,
                ];
            }

            if (empty($data)) {
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Transaction control statement; no object cache applicable.
                $wpdb->query('ROLLBACK');
                Logger::error("پاسخ خالی از API برای فاکتور دریافت شد: $invoice_id");

                return [
                    'success' => false,
                    'message' => 'Empty API response.',
                    'error'   => 'No data received from API',
                    'status'  => 500,
                ];
            }

            $user_id = $user_id ?? ($data['customer_data']['user']['id'] ?? null);
            $city_id = $city_id ?? ($data['customer_data']['city']['id'] ?? null);
            $province_id = $province_id ?? ($data['customer_data']['city']['parent']['id'] ?? null);

            $order = self::executeWithoutWccfOrderSaveHooks(function () {
                return wc_create_order();
            }, $invoice_id, 'wc_create_order');

            if (is_wp_error($order)) {
                throw new \RuntimeException('wc_create_order failed: ' . $order->get_error_message());
            }

            if (!$order instanceof \WC_Order) {
                throw new \RuntimeException('wc_create_order did not return a valid WC_Order instance.');
            }
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    $sync_basalam_product_id = $item['product']['id'] ?? null;
                    $quantity = $item['quantity'] ?? 1;
                    $item_id = $item['id'] ?? null;

                    if ($sync_basalam_product_id) {
                        try {
                            if (!empty($item['variation']['id'])) {
                                $woo_product_id = self::getWooProductVariableId($item['variation']['id']);
                                if (!$woo_product_id) {
                                    // Variant not mapped yet: fall back to the mapped parent, but only if it
                                    // is a purchasable non-variable product (a variable parent has no stock/price).
                                    $parentId = self::getWooProductSimpleId($sync_basalam_product_id);
                                    $parent   = $parentId ? wc_get_product($parentId) : null;
                                    if ($parent && !$parent->is_type('variable')) {
                                        $woo_product_id = $parentId;
                                    }
                                }
                            } else {
                                $woo_product_id = self::getWooProductSimpleId($sync_basalam_product_id);
                            }

                            if ($woo_product_id) {
                                $product = wc_get_product($woo_product_id);
                                if ($product) {
                                    $order_item_id = $order->add_product($product, $quantity);
                                    if ($item_id && $order_item_id) {
                                        $order->update_meta_data('_sync_basalam_item_id_' . $order_item_id, $item_id);
                                    }

                                    self::set_item_price_from_financial_report($order, $order_item_id, $item, $quantity);
                                }
                            } else {
                                $placeholder_product_id = self::getPlaceholderProductId();
                                if ($placeholder_product_id) {
                                    $placeholder_product = wc_get_product($placeholder_product_id);
                                    if ($placeholder_product) {
                                        $order_item_id = $order->add_product($placeholder_product, $quantity);

                                        if ($item_id && $order_item_id) {
                                            $order->update_meta_data('_sync_basalam_item_id_' . $order_item_id, $item_id);
                                        }

                                        self::set_item_price_from_financial_report($order, $order_item_id, $item, $quantity);
                                    }
                                }
                            }
                        } catch (\Exception $e) {
                            Logger::error('خطا در ایجاد سفارش: ' . $e->getMessage());
                        }
                    }
                }
            }

            if (isset($data['customer_data']['recipient']) && is_array($data['customer_data']['recipient'])) {
                $recipient = $data['customer_data']['recipient'];
                $province = $data['customer_data']['city']['parent']['title'] ?? '';
                $city = $data['customer_data']['city']['title'] ?? '';

                $full_name = $recipient['name'] ?? '';
                $first_name = '';
                $last_name = '';
                if (!empty($full_name)) {
                    $parts = explode(' ', trim($full_name));
                    $parts = array_filter($parts);

                    if (count($parts) === 1) {
                        $first_name = $parts[0];
                        $last_name = $parts[0];
                    } else {
                        $first_name = array_shift($parts);
                        $last_name = implode(' ', $parts);
                    }
                }

                $prefix = webinoBasalamSettings()->getSettings(SettingsConfig::CUSTOMER_PREFIX_NAME);
                $suffix = webinoBasalamSettings()->getSettings(SettingsConfig::CUSTOMER_SUFFIX_NAME);

                if (!empty($prefix)) $first_name = $prefix . ' ' . $first_name;
                if (!empty($suffix)) $last_name = $last_name . ' ' . $suffix;

                // Set basic billing info
                $order->set_billing_first_name($first_name);
                $order->set_billing_last_name($last_name);
                $order->set_billing_address_1($recipient['postal_address'] ?? '');
                $order->set_billing_postcode($recipient['postal_code'] ?? '');
                $order->set_billing_country('IR');
                $order->set_billing_phone($recipient['mobile'] ?? '');

                // Set basic shipping info
                $order->set_shipping_first_name($first_name);
                $order->set_shipping_last_name($last_name);
                $order->set_shipping_address_1($recipient['postal_address'] ?? '');
                $order->set_shipping_postcode($recipient['postal_code'] ?? '');
                $order->set_shipping_phone($recipient['mobile'] ?? '');
                $order->set_shipping_country('IR');

                // Set state and city with PWS compatibility
                $addressData = [
                        'province' => $province,
                    'city'     => $city,
                ];
                GetProvincesData::setOrderAddress($order, $addressData, 'billing');
                GetProvincesData::setOrderAddress($order, $addressData, 'shipping');

                // Add shipping method based on settings
                $shipping_method_setting = webinoBasalamSettings()->getSettings(SettingsConfig::ORDER_SHIPPING_METHOD);

                if (isset($data['financial_report']['shipping_submit']['total']['amount'])) {
                    $shipping_cost = $data['financial_report']['shipping_submit']['total']['amount'];

                    $shipping_cost = self::rialToStore($shipping_cost);

                    $shipping_item = new \WC_Order_Item_Shipping();

                    if ($shipping_method_setting === 'basalam') {
                        // Use Basalam shipping method title from API
                        if (isset($data['parcel_detail']['shipping_method']['title'])) {
                            $shipping_method_title = $data['parcel_detail']['shipping_method']['title'];
                            $shipping_item->set_method_title($shipping_method_title);
                        }
                        $shipping_item->set_method_id('basalam_shipping');
                    } elseif (strpos($shipping_method_setting, 'wc_') === 0) {
                        // Use WooCommerce shipping method
                        $wc_method_id = substr($shipping_method_setting, 3); // Remove 'wc_' prefix

                        // Find the shipping method instance
                        $method_instance_id = self::findShippingMethodInstanceId($wc_method_id);
                        if ($method_instance_id) {
                            $shipping_item->set_method_id($wc_method_id . ':' . $method_instance_id);

                            // Get the method title from WooCommerce
                            $method_title = self::getShippingMethodTitle($wc_method_id, $method_instance_id);
                            if ($method_title) {
                                $shipping_item->set_method_title($method_title);
                            }
                        } else {
                            // Fallback to method id without instance
                            $shipping_item->set_method_id($wc_method_id);
                            $shipping_item->set_method_title($wc_method_id);
                        }
                    }

                    $shipping_item->set_total(floatval($shipping_cost));
                    $shipping_item->set_taxes([]);
                    $order->add_item($shipping_item);
                }
            }

            $order->calculate_totals();

            $total_price = 0;
            $products_total = 0;

            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    if (isset($item['financial_report']['report_items']) && is_array($item['financial_report']['report_items'])) {
                        foreach ($item['financial_report']['report_items'] as $report_item) {
                            if (isset($report_item['title']) && $report_item['title'] === 'قیمت محصول' && isset($report_item['amount'])) {
                                $products_total += (int) $report_item['amount'];
                                break;
                            }
                        }
                    }
                }
            }

            if ($products_total > 0) {
                $total_price = $products_total;
            } else {
                if (isset($data['financial_report']['product_cost']['report_items'][0]['amount'])) {
                    $total_price += $data['financial_report']['product_cost']['report_items'][0]['amount'];
                }
            }

            if (isset($data['financial_report']['shipping_cost']['total']['amount'])) {
                $total_price += $data['financial_report']['shipping_cost']['total']['amount'];
            }

            if ($total_price > 0) {
                $total_price = self::rialToStore($total_price);
                $order->set_total($total_price);
            }

            $order->set_payment_method('basalam');
            $order->set_payment_method_title('پرداخت باسلام');

            $createdAt = self::parseBasalamTime($data['created_at'] ?? $data['paid_at'] ?? null);
            if ($createdAt) {
                $order->set_date_created($createdAt);
            }

            $remoteStatus = self::wooStatusForBasalam($data);
            $order->set_status($remoteStatus !== '' ? $remoteStatus : 'bslm-wait-vendor');

            $tracking = self::pickString($data, [
                'parcel_detail.tracking_code',
                'parcel_detail.post_tracking_code',
                'shipping.tracking_code',
                'tracking_code',
            ]);
            if ($tracking !== '') {
                $order->update_meta_data('_tracking_code', $tracking);
                $order->update_meta_data('_post_barcode', $tracking);
                $order->update_meta_data('_basalam_order_tracking_code', $tracking);
            }

            $purchase_count = $data['customer_data']['purchase_count'] ?? 0;
            $fee_amount = self::findFeeAmountRial($data);
            $balance_amount = (float) ($data['financial_report']['product_cost']['total']['amount'] ?? 0);
            $sale_total = self::saleTotalFromInvoice($data);
            if ($sale_total > 0) {
                $order->set_total($sale_total);
                $order->update_meta_data('_basalam_sale_total', $sale_total);
            }
            $status_slug = self::wooStatusForBasalam($data);
            if ($status_slug !== '') {
                $order->update_meta_data('_basalam_status_slug', $status_slug);
            }
            self::attachStoreCustomer($order, $data);

            // Basalam API amounts are rial. Keep raw rial for accounting, and the
            // legacy meta in toman (the order meta box labels it «تومان").
            $irt_factor = class_exists('Webino_Dashboard_Currency') ? (float) \Webino_Dashboard_Currency::to_rial_factor('IRT') : 10.0;
            $order->update_meta_data('_basalam_fee_amount_rial', (int) round(abs($fee_amount)));
            $order->update_meta_data('_basalam_balance_amount_rial', (int) round($balance_amount));
            $order->update_meta_data('_basalam_fee_amount', (int) round(abs($fee_amount) / $irt_factor));
            $order->update_meta_data('_basalam_balance_amount', (int) round($balance_amount / $irt_factor));
            $order->update_meta_data('_basalam_purchase_count', $purchase_count);

            if (isset($data['hash_id'])) {
                $order->update_meta_data('_sync_basalam_hash_id', $data['hash_id']);
            }
            // Order meta API (HPOS-safe); dashboard marketplace filter queries this key.
            $order->update_meta_data('_is_sync_basalam_order', '1');
            $order->update_meta_data('_basalam_invoice_id', (string) $invoice_id);
            if (class_exists('Webino_Basalam_Order_View')) {
                \Webino_Basalam_Order_View::remember($order, $data);
            }

            self::executeWithoutWccfOrderSaveHooks(function () use ($order) {
                $order->save();
            }, $invoice_id, 'order->save()');

            $order_id = $order->get_id();
            if ($order_id) {

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Custom plugin table; no object cache for these operational queries.
                $insert_result = $wpdb->insert(
                    $table_name,
                    [
                        'payment_id'  => $payment_id,
                        'invoice_id'  => $invoice_id,
                        'user_id'     => $user_id,
                        'city_id'     => $city_id,
                        'province_id' => $province_id,
                        'order_id'    => $order_id,
                    ],
                    ['%d', '%d', '%d', '%d', '%d', '%d']
                );

                if ($insert_result === false) {
                    throw new \Exception("خطا در ذخیره اطلاعات سفارش در جدول webino_basalam_payments");
                }


                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Transaction control statement; no object cache applicable.
                $wpdb->query('COMMIT');

                if (class_exists('Webino_Basalam_Erp_Order_Mirror', false)) {
                    \Webino_Basalam_Erp_Order_Mirror::enqueue((int) $order_id);
                }

                return [
                    'success'  => true,
                    'message'  => 'Order created successfully',
                    'order_id' => $order_id,
                    'status'   => 200,
                ];
            } else {
                throw new \Exception("خطا در ایجاد سفارش با شناسه $invoice_id ، از گزینه بررسی سفارشات استفاده نمایید.");
            }
        } catch (\Exception $e) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Transaction control statement; no object cache applicable.
            $wpdb->query('ROLLBACK');

            Logger::error($e->getMessage());

            return [
                'success' => false,
                'message' => 'Failed to create order.',
                'error'   => $e->getMessage(),
                'status'  => 500,
            ];
        }
    }

    public static function cancelOrderWoo($invoice_id)
    {
        return self::updateOrderStatus($invoice_id, 'bslm-rejected', 'bslm-rejected');
    }

    public static function completeOrderWoo($invoice_id)
    {
        return self::updateOrderStatus($invoice_id, 'bslm-completed', 'bslm-completed');
    }

    public static function confirmOrderWoo($invoice_id)
    {
        return self::updateOrderStatus($invoice_id, 'bslm-preparation', 'bslm-preparation');
    }

    public static function shippedOrderWoo($invoice_id)
    {
        return self::updateOrderStatus($invoice_id, 'bslm-shipping', 'bslm-shipping');
    }

    public static function updateOrderStatus($invoice_id, $status, $job = null)
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'webino_basalam_payments';

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, PluginCheck.Security.DirectDB.UnescapedDBParameter -- Custom plugin table; identifier from $wpdb->prefix, not user input.
        $order_id = $wpdb->get_var(
            $wpdb->prepare("SELECT order_id FROM {$table_name} WHERE invoice_id = %d", $invoice_id)
        );

        if (!$order_id) {
            $order_id = self::findOrderIdByInvoiceMeta($invoice_id) ?: null;
        }

        if (!$order_id) {
            $create_result = self::createOrderWoo([
                'invoice_id' => $invoice_id,
            ]);

            if (!empty($create_result['success']) && !empty($create_result['order_id'])) {
                $order_id = $create_result['order_id'];
            }
        }

        if (!$order_id) {
            return [
                'success'    => false,
                'message'    => 'Order not found.',
                'error'      => "No WooCommerce order found for invoice_id {$invoice_id}.",
                'invoice_id' => $invoice_id,
                'status'     => 404,
            ];
        }

        $order = wc_get_order($order_id);

        if ($order && $order instanceof \WC_Order) {
            // Out-of-order webhooks must not move a finished order backwards.
            $current = $order->get_status();
            $final   = ['bslm-completed', 'bslm-rejected', 'completed', 'cancelled', 'refunded'];
            // Replayed/late "confirm" must not pull a shipped order back to preparation.
            $regress = ($current === 'bslm-shipping' && $status === 'bslm-preparation');
            if ((in_array($current, $final, true) && $current !== $status) || $regress) {
                return [
                    'success'    => true,
                    'message'    => 'Order already in a final status; transition ignored.',
                    'order_id'   => $order_id,
                    'invoice_id' => $invoice_id,
                    'status_key' => $current,
                    'status'     => 200,
                ];
            }
            $order->update_status($status);
            if (class_exists('Webino_Basalam_Erp_Order_Mirror', false)) {
                \Webino_Basalam_Erp_Order_Mirror::enqueue((int) $order_id);
            }
            return [
                'success'    => true,
                'message'    => 'Order status updated successfully.',
                'order_id'   => $order_id,
                'invoice_id' => $invoice_id,
                'job'        => $job,
                'status_key' => $status,
                'status'     => 200,
            ];
        }

        self::logError("آبجکت سفارش ووکامرس برای order_id {$order_id} و invoice_id {$invoice_id} معتبر نیست");
        return [
            'success'    => false,
            'message'    => 'Invalid WooCommerce order object.',
            'error'      => "Invalid WooCommerce order object for order_id {$order_id} and invoice_id {$invoice_id}.",
            'order_id'   => $order_id,
            'invoice_id' => $invoice_id,
            'status'     => 500,
        ];
    }

    /**
     * Find a Woo order already created for this Basalam invoice via order meta.
     * Works for both HPOS and legacy post storage (wc_get_orders abstracts it).
     *
     * @param int|string $invoice_id
     * @return int
     */
    public static function findOrderIdByInvoiceMeta($invoice_id)
    {
        if (!function_exists('wc_get_orders') || empty($invoice_id)) {
            return 0;
        }
        try {
            $ids = wc_get_orders([
                'limit'      => 1,
                'return'     => 'ids',
                'status'     => 'any',
                'meta_key'   => '_basalam_invoice_id', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
                'meta_value' => (string) $invoice_id, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
            ]);
        } catch (\Throwable $e) {
            return 0;
        }
        return !empty($ids) ? (int) reset($ids) : 0;
    }

    public static function getPlaceholderProductId()
    {
        $placeholder_name = 'این محصول در سایت شما تعریف نشده است ، برای مشاهده جزییات به باسلام مراجعه کنید';
        $product_id = self::productExistsByTitle($placeholder_name);
        if (!$product_id) {
            $product = new \WC_Product_Simple();
            $product->set_name($placeholder_name);
            $product->set_status('draft');
            $product->set_sku('placeholder-basalam-product');
            $product->save();
            $product_id = $product->get_id();
        }

        return $product_id;
    }

    public static function getWooProductSimpleId($sync_basalam_product_id)
    {
        $product = get_posts([
            'post_type'      => ['product', 'product_variation'],
            'meta_key'       => ProductMetaKey::basalamProductId(),
            'meta_value'     => $sync_basalam_product_id,
            'posts_per_page' => 1,
            'post_status'    => ['publish', 'private'],
        ]);

        return !empty($product) ? $product[0]->ID : null;
    }

    public static function getWooProductVariableId($webino_basalam_product_variant_id)
    {
        // Legacy nested Basalam variation id.
        $args = [
            'post_type'      => 'product_variation',
            'posts_per_page' => 1,
            'meta_key'       => 'sync_basalam_variation_id',
            'meta_value'     => $webino_basalam_product_variant_id,
            'fields'         => 'ids',
            'post_status'    => ['publish', 'private'],
        ];

        $variation = get_posts($args);
        if (!empty($variation)) {
            return $variation[0];
        }

        // Standalone model: Basalam product id is stored on the variation.
        return self::getWooProductSimpleId($webino_basalam_product_variant_id);
    }

    public static function productExistsByTitle($title)
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct lookup on core posts table; no cache key available for this title match.
        $product_id = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'product' AND post_status != 'private' AND post_title = %s LIMIT 1",
                $title
            )
        );

        return $product_id ? $product_id : false;
    }

    /**
     * Convert a Basalam (rial) amount into the store currency via shared factors.
     */
    private static function rialToStore($amount)
    {
        $amount = (float) $amount;
        if (class_exists('Webino_Dashboard_Currency')) {
            return \Webino_Dashboard_Currency::from_rial($amount);
        }
        $map = ['IRT' => 10, 'TOMAN' => 10, 'IRHR' => 1000, 'IRHT' => 10000];
        $factor = (float) ($map[strtoupper((string) get_woocommerce_currency())] ?? 1);
        return $factor > 0 ? $amount / $factor : $amount;
    }

    /**
     * Basalam commission/fee row (rial). Matched by title; falls back to the
     * historical index 2 only when no titled row exists.
     */
    private static function findFeeAmountRial($data)
    {
        $items = $data['financial_report']['product_cost']['report_items'] ?? [];
        if (!is_array($items)) {
            return 0.0;
        }
        foreach ($items as $row) {
            $title = isset($row['title']) ? (string) $row['title'] : '';
            if ($title !== '' && isset($row['amount']) && preg_match('/کارمزد|commission|fee/iu', $title)) {
                return (float) $row['amount'];
            }
        }
        return (float) ($items[2]['amount'] ?? 0);
    }

    /**
     * Resolve the line total (rial) for an order item.
     *
     * The «قیمت محصول» report row is the line amount (sum over all units; the
     * order total is built by summing these rows). If Basalam also sends a unit
     * price and the row equals that unit price for qty > 1, treat it as unit.
     */
    public static function resolveLineTotalRial(array $item, $quantity)
    {
        $quantity = max(1, (int) $quantity);
        $row = 0.0;
        if (isset($item['financial_report']['report_items']) && is_array($item['financial_report']['report_items'])) {
            foreach ($item['financial_report']['report_items'] as $report_item) {
                if (isset($report_item['title']) && $report_item['title'] === 'قیمت محصول' && isset($report_item['amount'])) {
                    $row = (float) $report_item['amount'];
                    break;
                }
            }
        }
        $unit = 0.0;
        foreach (['price', 'unit_price', 'primary_price'] as $k) {
            if (isset($item[$k]) && is_numeric($item[$k]) && (float) $item[$k] > 0) {
                $unit = (float) $item[$k];
                break;
            }
        }
        if ($row <= 0) {
            return $unit > 0 ? $unit * $quantity : 0.0;
        }
        if ($quantity > 1 && $unit > 0 && abs($row - $unit) < 1) {
            return $unit * $quantity;
        }
        return $row;
    }

    private static function set_item_price_from_financial_report($order, $order_item_id, $item, $quantity)
    {
        $line_total = self::resolveLineTotalRial(is_array($item) ? $item : [], $quantity);
        if ($line_total <= 0) {
            return;
        }
        // WC line subtotal/total are for the whole line (unit price * qty), never per unit.
        $line_total = self::rialToStore($line_total);
        $order_item = $order->get_item($order_item_id);
        if ($order_item) {
            $order_item->set_subtotal($line_total);
            $order_item->set_total($line_total);
            $order_item->save();
        }
    }

    private static function findShippingMethodInstanceId($method_id)
    {
        if (!class_exists('WC_Shipping_Zones')) {
            return null;
        }

        $shipping_zones = \WC_Shipping_Zones::get_zones();

        foreach ($shipping_zones as $zone) {
            $zone_id = $zone['id'] ?? 0;
            $shipping_zone = new \WC_Shipping_Zone($zone_id);
            $methods = $shipping_zone->get_shipping_methods(true);

            foreach ($methods as $method) {
                if ($method->id === $method_id) {
                    return $method->instance_id;
                }
            }
        }

        return null;
    }

    private static function getShippingMethodTitle($method_id, $instance_id)
    {
        if (!class_exists('WC_Shipping_Zones')) {
            return null;
        }

        $shipping_zones = \WC_Shipping_Zones::get_zones();

        foreach ($shipping_zones as $zone) {
            $zone_id = $zone['id'] ?? 0;
            $shipping_zone = new \WC_Shipping_Zone($zone_id);
            $methods = $shipping_zone->get_shipping_methods(true);

            foreach ($methods as $method) {
                if ($method->id === $method_id && $method->instance_id == $instance_id) {
                    return $method->get_title() ?: $method->get_method_title();
                }
            }
        }

        return null;
    }

    /**
     * Re-read a Basalam invoice and apply its status, date and tracking onto the Woo order.
     *
     * @return array<string,mixed>|null Raw invoice, or null when it cannot be loaded.
     */
    public static function refreshOrderFromInvoice($invoiceId)
    {
        $invoiceId = (int) $invoiceId;
        $orderId = self::findOrderIdByInvoiceMeta($invoiceId);
        if ($orderId < 1) {
            return null;
        }
        $order = wc_get_order($orderId);
        if (!$order) {
            return null;
        }
        $data = self::fetchInvoice($invoiceId);
        if (!is_array($data)) {
            return null;
        }
        self::applyRemoteState($order, $data);
        return $data;
    }

    /**
     * @return array<string,mixed>|null
     */
    public static function fetchInvoice($invoiceId)
    {
        $vendorId = webinoBasalamSettings()->getSettings(SettingsConfig::VENDOR_ID);
        if (!$vendorId || !$invoiceId) {
            return null;
        }
        try {
            $api = webinoBasalamContainer()->get(ApiServiceManager::class);
            $response = $api->get(sprintf(Endpoints::ORDER_DETAIL, $vendorId, (int) $invoiceId));
            $body = $response['body'] ?? '';
            $data = is_array($body) ? $body : json_decode((string) $body, true);
            return is_array($data) ? $data : null;
        } catch (\Throwable $e) {
            Logger::error('خطا در دریافت جزئیات سفارش باسلام: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * @param \WC_Order            $order Order.
     * @param array<string,mixed>  $data  Invoice payload.
     */
    public static function applyRemoteState($order, array $data)
    {
        $slug = self::wooStatusForBasalam($data);
        $current = $order->get_status();
        $frozen = ['refunded', 'cancelled', 'trash', 'failed'];
        if ($slug !== '' && $slug !== $current && !in_array($current, $frozen, true)) {
            $order->set_status($slug);
        }

        $title = (string) $order->get_payment_method_title();
        if ($title === '' || stripos($title, 'basalam') !== false) {
            $order->set_payment_method('basalam');
            $order->set_payment_method_title('پرداخت باسلام');
        }

        if (!$order->get_meta('_basalam_date_applied')) {
            $createdAt = self::parseBasalamTime($data['created_at'] ?? $data['paid_at'] ?? null);
            if ($createdAt) {
                $order->set_date_created($createdAt);
                $order->update_meta_data('_basalam_date_applied', '1');
            }
        }

        $tracking = self::pickString($data, [
            'parcel_detail.tracking_code',
            'parcel_detail.post_tracking_code',
            'shipping.tracking_code',
            'tracking_code',
        ]);
        if ($tracking !== '' && $order->get_meta('_tracking_code') === '') {
            $order->update_meta_data('_tracking_code', $tracking);
            $order->update_meta_data('_post_barcode', $tracking);
            $order->update_meta_data('_basalam_order_tracking_code', $tracking);
        }

        if ($slug !== '') {
            $order->update_meta_data('_basalam_status_slug', $slug);
        }
        $saleTotal = self::saleTotalFromInvoice($data);
        if ($saleTotal > 0) {
            $order->set_total($saleTotal);
            $order->update_meta_data('_basalam_sale_total', $saleTotal);
        }
        self::attachStoreCustomer($order, $data);
        if (class_exists('Webino_Basalam_Order_View')) {
            \Webino_Basalam_Order_View::remember($order, $data);
        }

        $order->save();
    }

    /**
     * Vendor receivable in store currency: product net plus shipping the booth keeps.
     *
     * @param array<string,mixed> $data Invoice.
     */
    public static function saleTotalFromInvoice(array $data): float
    {
        $report = isset($data['financial_report']) && is_array($data['financial_report']) ? $data['financial_report'] : [];
        $product = self::reportTotalRial($report, ['product_cost', 'product_submit']);
        $shipping = self::reportTotalRial($report, ['shipping_cost', 'shipping_submit']);
        $rial = $product + $shipping;
        return $rial > 0 ? (float) self::rialToStore($rial) : 0.0;
    }

    /**
     * @param array<string,mixed> $report Financial report.
     * @param array<int,string>   $keys Block keys, first positive total wins.
     */
    private static function reportTotalRial(array $report, array $keys): float
    {
        foreach ($keys as $key) {
            $block = $report[$key] ?? null;
            if (!is_array($block)) {
                continue;
            }
            $amount = $block['total']['amount'] ?? ($block['total'] ?? null);
            if (is_numeric($amount) && (float) $amount > 0) {
                return (float) $amount;
            }
        }
        return 0.0;
    }

    /**
     * Apply a vendor-parcel list row when the invoice detail request failed.
     *
     * @param int                 $invoiceId Invoice id.
     * @param array<string,mixed> $parcel List row.
     */
    public static function applyListStatus($invoiceId, array $parcel)
    {
        $orderId = self::findOrderIdByInvoiceMeta($invoiceId);
        if ($orderId < 1) {
            return;
        }
        $order = wc_get_order($orderId);
        if (!$order) {
            return;
        }
        $status = self::extractStatusNode($parcel);
        if ($status === null || $status === '') {
            return;
        }
        self::applyRemoteState($order, ['status' => $status]);
    }

    /**
     * Move Basalam orders off Woo pending/processing onto the Basalam status.
     *
     * Runs from the orders list and the home sales card so existing imports
     * leave «در انتظار» and enter sales totals without a manual re-fetch.
     */
    public static function repairStuckStatuses()
    {
        if (get_transient('webino_bslm_status_repair')) {
            return;
        }
        set_transient('webino_bslm_status_repair', '1', 2 * MINUTE_IN_SECONDS);
        if (!function_exists('wc_get_orders')) {
            return;
        }

        $stuck = self::stuckBasalamOrderIds();
        if (!$stuck) {
            return;
        }

        $changed = self::applyStoredBasalamStatuses($stuck);
        $stuck = self::stuckBasalamOrderIds();
        if ($stuck) {
            try {
                $changed += self::syncStatusesFromParcelList(180);
            } catch (\Throwable $e) {
                Logger::error('همگام‌سازی وضعیت سفارش‌های باسلام ناموفق بود: ' . $e->getMessage());
            }
            $stuck = self::stuckBasalamOrderIds();
        }
        if ($stuck) {
            $fetched = 0;
            foreach ($stuck as $orderId) {
                if ($fetched >= 15) {
                    break;
                }
                $order = wc_get_order($orderId);
                $invoice = $order ? (string) $order->get_meta('_basalam_invoice_id') : '';
                if ($invoice !== '' && is_array(self::refreshOrderFromInvoice($invoice))) {
                    $changed++;
                }
                $fetched++;
            }
        }
        if ($changed > 0) {
            self::flushSalesCaches();
        }
    }

    /**
     * @return int[]
     */
    private static function stuckBasalamOrderIds(): array
    {
        $ids = wc_get_orders([
            'limit'      => 50,
            'return'     => 'ids',
            'status'     => ['pending', 'processing', 'on-hold'],
            'meta_query' => [ // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
                [
                    'key'     => '_basalam_invoice_id',
                    'compare' => 'EXISTS',
                ],
            ],
        ]);
        $out = [];
        foreach ((array) $ids as $id) {
            $id = (int) $id;
            if ($id > 0) {
                $out[] = $id;
            }
        }
        return $out;
    }

    /**
     * @param int[] $ids Order ids.
     */
    private static function applyStoredBasalamStatuses(array $ids): int
    {
        $valid = ['bslm-rejected', 'bslm-preparation', 'bslm-wait-vendor', 'bslm-shipping', 'bslm-completed'];
        $changed = 0;
        foreach ($ids as $orderId) {
            $order = wc_get_order($orderId);
            if (!$order) {
                continue;
            }
            $slug = (string) $order->get_meta('_basalam_status_slug');
            if (!in_array($slug, $valid, true)) {
                $slug = self::slugFromSnapshot($order);
            }
            if (!in_array($slug, $valid, true) || $slug === $order->get_status()) {
                continue;
            }
            $order->update_meta_data('_basalam_status_slug', $slug);
            $order->set_status($slug);
            $order->save();
            $changed++;
        }
        return $changed;
    }

    /**
     * @param \WC_Order $order Order.
     */
    private static function slugFromSnapshot($order): string
    {
        $raw = $order->get_meta('_basalam_order_snapshot');
        if (!is_string($raw) || $raw === '') {
            return '';
        }
        $view = json_decode($raw, true);
        if (!is_array($view)) {
            return '';
        }
        $slug = isset($view['woo_status']) ? (string) $view['woo_status'] : '';
        if ($slug !== '') {
            return $slug;
        }
        $id = (int) ($view['status_id'] ?? 0);
        return $id > 0 ? self::wooStatusForBasalam(['status' => ['id' => $id]]) : '';
    }

    /**
     * Pull recent vendor parcels and copy each Basalam status onto the Woo order.
     *
     * @param int $days Lookback.
     */
    private static function syncStatusesFromParcelList($days): int
    {
        $vendorReady = function_exists('webinoBasalamContainer') && function_exists('webinoBasalamSettings');
        if (!$vendorReady) {
            return 0;
        }
        $api = webinoBasalamContainer()->get(ApiServiceManager::class);
        $since = gmdate('c', time() - max(1, (int) $days) * DAY_IN_SECONDS);
        $cursor = null;
        $pages = 0;
        $changed = 0;
        do {
            $url = Endpoints::VENDOR_PARCELS . '?per_page=30&created_at%5Bgte%5D=' . rawurlencode($since);
            if ($cursor) {
                $url .= '&cursor=' . rawurlencode((string) $cursor);
            }
            $response = $api->get($url);
            $body = $response['body'] ?? '';
            $decoded = is_array($body) ? $body : json_decode((string) $body, true);
            if (!is_array($decoded)) {
                break;
            }
            foreach ((array) ($decoded['data'] ?? []) as $row) {
                if (!is_array($row)) {
                    continue;
                }
                $invoice = $row['order']['id'] ?? ($row['order_id'] ?? null);
                if (!$invoice) {
                    continue;
                }
                $orderId = self::findOrderIdByInvoiceMeta($invoice);
                $order = $orderId > 0 ? wc_get_order($orderId) : null;
                $before = $order ? $order->get_status() : '';
                self::applyListStatus((int) $invoice, $row);
                if ($order) {
                    $fresh = wc_get_order($orderId);
                    if ($fresh && $fresh->get_status() !== $before) {
                        $changed++;
                    }
                }
            }
            $cursor = $decoded['next_cursor'] ?? null;
            $pages++;
        } while ($cursor && $pages < 8);

        return $changed;
    }

    private static function flushSalesCaches()
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '%webino_dashboard_sales_v%'" );
    }

    /**
     * Refresh Basalam orders whose Woo status can still change.
     *
     * @param int $limit Max orders.
     */
    public static function refreshStaleOrders($limit = 20)
    {
        if (!function_exists('wc_get_orders')) {
            return;
        }
        $ids = wc_get_orders([
            'limit'      => max(1, (int) $limit),
            'return'     => 'ids',
            'status'     => ['pending', 'processing', 'on-hold', 'bslm-wait-vendor', 'bslm-preparation', 'bslm-shipping'],
            'meta_key'   => '_is_sync_basalam_order', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
            'meta_value' => '1', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
        ]);
        foreach ((array) $ids as $orderId) {
            $order = wc_get_order($orderId);
            if (!$order) {
                continue;
            }
            $invoice = (string) $order->get_meta('_basalam_invoice_id');
            if ($invoice !== '') {
                self::refreshOrderFromInvoice($invoice);
            }
        }
    }

    /**
     * Create or reuse a store customer from the Basalam recipient name and phone.
     *
     * @param \WC_Order           $order Order.
     * @param array<string,mixed> $data Invoice.
     */
    private static function attachStoreCustomer($order, array $data)
    {
        if ((int) $order->get_customer_id() > 0) {
            return;
        }
        $recipient = $data['customer_data']['recipient'] ?? null;
        if (!is_array($recipient)) {
            return;
        }
        $userId = self::ensureStoreCustomer($recipient);
        if ($userId > 0) {
            $order->set_customer_id($userId);
        }
    }

    /**
     * @param array<string,mixed> $recipient Recipient.
     */
    private static function ensureStoreCustomer(array $recipient): int
    {
        $phone = trim((string) ($recipient['mobile'] ?? $recipient['phone'] ?? ''));
        $digits = preg_replace('/\D+/', '', $phone);
        $name = trim((string) ($recipient['name'] ?? ''));
        if ($digits === '' || !function_exists('wp_insert_user')) {
            return 0;
        }
        $local = $digits;
        if (strpos($digits, '98') === 0 && strlen($digits) > 10) {
            $local = '0' . substr($digits, 2);
        }
        $candidates = array_unique(array_filter([$phone, $digits, $local]));
        foreach ($candidates as $candidate) {
            $found = get_users([
                'meta_key'   => 'billing_phone', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
                'meta_value' => $candidate, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
                'number'     => 1,
                'fields'     => 'ID',
            ]);
            if (!empty($found)) {
                return (int) $found[0];
            }
        }
        $login = 'bslm' . $local;
        $existing = get_user_by('login', $login);
        if ($existing) {
            update_user_meta($existing->ID, 'billing_phone', $local);
            return (int) $existing->ID;
        }
        $parts = preg_split('/\s+/u', $name, -1, PREG_SPLIT_NO_EMPTY);
        $first = $parts[0] ?? $name;
        $last = is_array($parts) && count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : '';
        $created = wp_insert_user([
            'user_login'   => $login,
            'user_pass'    => wp_generate_password(24),
            'display_name' => $name !== '' ? $name : $local,
            'first_name'   => $first,
            'last_name'    => $last,
            'role'         => 'customer',
        ]);
        if (is_wp_error($created)) {
            return 0;
        }
        $userId = (int) $created;
        update_user_meta($userId, 'billing_phone', $local);
        update_user_meta($userId, 'billing_first_name', $first);
        update_user_meta($userId, 'billing_last_name', $last);
        return $userId;
    }

    /**
     * @param array<string,mixed> $data Invoice payload.
     */
    public static function wooStatusForBasalam(array $data): string
    {
        $status = self::extractStatusNode($data);
        $id = 0;
        $title = '';
        if (is_array($status)) {
            $id = (int) ($status['id'] ?? $status['status_id'] ?? 0);
            $title = (string) ($status['title'] ?? $status['name'] ?? '');
        } elseif (is_numeric($status)) {
            $id = (int) $status;
        } elseif (is_string($status)) {
            $title = $status;
        }

        $map = [
            3067 => 'bslm-rejected',
            3233 => 'bslm-rejected',
            3739 => 'bslm-wait-vendor',
            3237 => 'bslm-preparation',
            3238 => 'bslm-shipping',
            3195 => 'bslm-completed',
        ];
        if (isset($map[$id])) {
            return $map[$id];
        }
        if (preg_match('/لغو|رد شده|مرجوع/u', $title)) {
            return 'bslm-rejected';
        }
        if (preg_match('/انتظار فروشنده|انتظار تایید|انتظار تأیید|تایید غرفه|تأیید غرفه/u', $title)) {
            return 'bslm-wait-vendor';
        }
        if (preg_match('/تکمیل|رضایت/u', $title)) {
            return 'bslm-completed';
        }
        if (preg_match('/ارسال/u', $title)) {
            return 'bslm-shipping';
        }
        if (preg_match('/آماد|تایید شده|تأیید شده/u', $title)) {
            return 'bslm-preparation';
        }
        if ($id === 0 && $title === '') {
            return '';
        }
        return 'bslm-wait-vendor';
    }

    /**
     * @param array<string,mixed> $data Payload.
     * @return mixed
     */
    private static function extractStatusNode(array $data)
    {
        $paths = [
            ['status'],
            ['order', 'status'],
            ['parcel_detail', 'status'],
            ['order_status'],
            ['current_status'],
        ];
        foreach ($paths as $path) {
            $cur = $data;
            $found = true;
            foreach ($path as $key) {
                if (!is_array($cur) || !array_key_exists($key, $cur)) {
                    $found = false;
                    break;
                }
                $cur = $cur[$key];
            }
            if ($found && $cur !== null && $cur !== '') {
                return $cur;
            }
        }
        return null;
    }

    /**
     * @param mixed $value Timestamp or date string.
     */
    public static function parseBasalamTime($value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }
        if (is_numeric($value)) {
            $n = (int) $value;
            if ($n > 100000000000) {
                $n = (int) floor($n / 1000);
            }
            return $n > 1000000000 ? $n : null;
        }
        $ts = strtotime((string) $value);
        return $ts ? (int) $ts : null;
    }

    /**
     * @param array<string,mixed> $data
     * @param array<int,string>   $paths
     */
    public static function pickString(array $data, array $paths): string
    {
        foreach ($paths as $path) {
            $cur = $data;
            foreach (explode('.', $path) as $key) {
                if (!is_array($cur) || !array_key_exists($key, $cur)) {
                    $cur = null;
                    break;
                }
                $cur = $cur[$key];
            }
            if (is_scalar($cur) && trim((string) $cur) !== '') {
                return trim((string) $cur);
            }
        }
        return '';
    }

    private static function createRestResponse(array $result)
    {
        $status = (int) ($result['status'] ?? (!empty($result['success']) ? 200 : 500));
        unset($result['status']);

        return new \WP_REST_Response($result, $status);
    }
}
