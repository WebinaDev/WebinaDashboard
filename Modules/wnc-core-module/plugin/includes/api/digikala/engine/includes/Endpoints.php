<?php
namespace WncDigikala;

defined('ABSPATH') || exit;

final class Endpoints {
    const BASE = 'https://seller.digikala.com';
    const AUTH_TOKEN = 'open-api/v1/auth/token';
    const AUTH_REFRESH = 'open-api/v1/auth/refresh-token';
    const AUTH_SCOPES = 'open-api/v1/auth/scopes';
    const VARIANTS = 'open-api/v1/variants';
    const SELLING_PRICE = 'open-api/v1/variants/selling-price';
    const BATCH_VARIANT_UPDATE = 'open-api/v1/batch/variant/update';
    const BATCH_STOCK = 'open-api/v1/batch/variant/seller-stock/update';
    const ORDERS = 'open-api/v1/orders';
    const ORDERS_STATUS = 'open-api/v1/orders/status';
    const PRODUCT_SEARCH = 'open-api/v1/product-creation/search/v2';
}
