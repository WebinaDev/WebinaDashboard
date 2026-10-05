<?php
namespace WebinoDigikala;

defined('ABSPATH') || exit;

final class Endpoints {
    const BASE = 'https://seller.digikala.com';
    const AUTH_TOKEN = 'open-api/v1/auth/token';
    const AUTH_REFRESH = 'open-api/v1/auth/refresh-token';
    const AUTH_SCOPES = 'open-api/v1/auth/scopes';
    const VARIANTS = 'open-api/v1/variants';
    const VARIANT_DETAIL = 'open-api/v1/variants/{variant_id}';
    const SELLING_PRICE = 'open-api/v1/variants/selling-price';
    const BATCH_VARIANT_UPDATE = 'open-api/v1/batch/variant/update';
    const BATCH_STOCK = 'open-api/v1/batch/variant/seller-stock/update';
    const ORDERS = 'open-api/v1/orders';
    const ORDERS_HISTORY = 'open-api/v1/orders/history';
    const ORDER_ITEM = 'open-api/v1/orders/{order_item_id}';
    const SBS_ORDERS = 'open-api/v1/ship-by-seller-orders';
    const SBS_UPDATE_STATUS = 'open-api/v1/ship-by-seller-orders/update-status';
    const SBS_CANCEL_ITEM = 'open-api/v1/ship-by-seller-orders/cancel-item';
    const SBS_CANCEL_SHIPMENT = 'open-api/v1/ship-by-seller-orders/cancel-shipment';
    const SBS_TRACKING = 'open-api/v1/ship-by-seller-orders/tracking-code';
    const PRODUCT_SEARCH = 'open-api/v1/product-creation/search/v2';
    const BE_SELLER = 'open-api/v1/product-creation/be-seller/{product_id}';
    const WEBHOOK_EVENTS = 'open-api/v1/webhook/event-types';
    const WEBHOOK_SUBSCRIBE = 'open-api/v1/webhook/subscription';
}
