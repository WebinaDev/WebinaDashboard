<?php

namespace WncBasalam\Actions;

use WncBasalam\Actions\Controller\ProductActions\CreateAllProducts;
use WncBasalam\Actions\Controller\ProductActions\CancelCreateProducts;
use WncBasalam\Actions\Controller\ProductActions\UpdateAllProducts;
use WncBasalam\Actions\Controller\ProductActions\CancelUpdateProducts;
use WncBasalam\Actions\Controller\ProductActions\ConnectAllProducts;
use WncBasalam\Actions\Controller\ProductActions\CancelConnectAllProducts;
use WncBasalam\Actions\Controller\OrderActions\FetchUnsyncOrders;
use WncBasalam\Actions\Controller\OrderActions\CancelFetchOrders;
use WncBasalam\Actions\Controller\OrderActions\ConfirmOrder;
use WncBasalam\Actions\Controller\OrderActions\CancelOrder;
use WncBasalam\Actions\Controller\OrderActions\RequestCancelOrder;
use WncBasalam\Actions\Controller\OrderActions\DelayOrder;
use WncBasalam\Actions\Controller\OrderActions\TrackingCodeOrder;
use WncBasalam\Actions\Controller\OrderActions\AutoConfirmOrders;
use WncBasalam\Actions\Controller\OptionActions\CreateMapOption;
use WncBasalam\Actions\Controller\OptionActions\RemoveMapOption;
use WncBasalam\Actions\Controller\ReviewActions\RemindLaterReview;
use WncBasalam\Actions\Controller\ReviewActions\NeverRemindReview;
use WncBasalam\Actions\Controller\ReviewActions\SubmitReview;
use WncBasalam\Actions\Controller\ProductActions\CreateSingleProduct;
use WncBasalam\Actions\Controller\ProductActions\UpdateSingleProduct;
use WncBasalam\Actions\Controller\ProductActions\RestoreProduct;
use WncBasalam\Actions\Controller\ProductActions\ArchiveProduct;
use WncBasalam\Actions\Controller\ProductActions\DisconnectProduct;
use WncBasalam\Actions\Controller\ProductActions\ConnectSingleProduct;
use WncBasalam\Actions\Controller\ProductActions\DetectionProductCategories;
use WncBasalam\Actions\Controller\ProductActions\GetCategoryAttributes;
use WncBasalam\Actions\Controller\ProductActions\ClearLogs;
use WncBasalam\Actions\Controller\UpdateSettings;
use WncBasalam\Actions\Controller\CategoryActions\GetWooCategories;
use WncBasalam\Actions\Controller\CategoryActions\FetchBasalamCategories;
use WncBasalam\Actions\Controller\CategoryActions\GetCategoryMappings;
use WncBasalam\Actions\Controller\CategoryActions\CreateCategoryMap;
use WncBasalam\Actions\Controller\CategoryActions\RemoveCategoryMap;
use WncBasalam\Actions\Controller\CategoryActions\GetMappingStats;
use WncBasalam\Actions\Controller\TicketActions\CreateTicket;
use WncBasalam\Actions\Controller\TicketActions\CreateTicketItem;
use WncBasalam\Actions\Controller\TicketActions\UploadTicketMediaAjax;

defined('ABSPATH') || exit;

class RegisterActions
{
    public function __construct()
    {
        $this->register();
    }

    private function register()
    {
        ActionHandler::postAjax('create_products_to_basalam', CreateAllProducts::class);
        ActionHandler::postAction('cancel_create_jobs', CancelCreateProducts::class);
        ActionHandler::postAction('cancel_update_jobs', CancelUpdateProducts::class);
        ActionHandler::postAjax('update_products_in_basalam', UpdateAllProducts::class);
        ActionHandler::postAction('cancel_update_products_in_basalam', CancelUpdateProducts::class);
        ActionHandler::postAjax('connect_products_with_basalam', ConnectAllProducts::class);
        ActionHandler::postAction('cancel_connect_products_with_basalam', CancelConnectAllProducts::class);
        ActionHandler::postAjax('add_unsync_orders_from_basalam', FetchUnsyncOrders::class);
        ActionHandler::postAjax('cancel_fetch_orders', CancelFetchOrders::class);
        ActionHandler::postAjax('basalam_add_map_option', CreateMapOption::class);
        ActionHandler::postAjax('basalam_delete_mapped_option', RemoveMapOption::class);
        ActionHandler::postAjax('create_product_basalam', CreateSingleProduct::class);
        ActionHandler::postAjax('update_product_in_basalam', UpdateSingleProduct::class);
        ActionHandler::postAjax('restore_exist_product_on_basalam', RestoreProduct::class);
        ActionHandler::postAjax('archive_exist_product_on_basalam', ArchiveProduct::class);
        ActionHandler::postAjax('disconnect_exist_product_on_basalam', DisconnectProduct::class);
        ActionHandler::postAction('basalam_update_setting', UpdateSettings::class);
        ActionHandler::postAjax('confirm_basalam_order', ConfirmOrder::class);
        ActionHandler::postAjax('cancel_basalam_order', CancelOrder::class);
        ActionHandler::postAjax('request_cancel_basalam_order', RequestCancelOrder::class);
        ActionHandler::postAjax('delay_req_basalam_order', DelayOrder::class);
        ActionHandler::postAjax('tracking_code_basalam_order', TrackingCodeOrder::class);
        ActionHandler::postAjax('basalam_connect_product', ConnectSingleProduct::class);
        ActionHandler::postAjax('basalam_get_category_ids', DetectionProductCategories::class);
        ActionHandler::postAjax('basalam_get_category_attrs', GetCategoryAttributes::class);
        ActionHandler::postAjax('basalam_clear_logs', ClearLogs::class);
        ActionHandler::postAjax('get_woocommerce_categories', GetWooCategories::class);
        ActionHandler::postAjax('get_basalam_categories', FetchBasalamCategories::class);
        ActionHandler::postAjax('get_category_mappings', GetCategoryMappings::class);
        ActionHandler::postAjax('create_category_mapping', CreateCategoryMap::class);
        ActionHandler::postAjax('delete_category_mapping', RemoveCategoryMap::class);
        ActionHandler::postAjax('get_mapping_stats', GetMappingStats::class);
        ActionHandler::postAction('auto_confirm_order_in_basalam', AutoConfirmOrders::class);
        ActionHandler::postAction('create_ticket', CreateTicket::class);
        ActionHandler::postAjax('create_ticket', CreateTicket::class);
        ActionHandler::postAction('create_ticket_item', CreateTicketItem::class);
        ActionHandler::postAjax('upload_ticket_media', UploadTicketMediaAjax::class);
        ActionHandler::postAjax('wnc_basalam_remind_later_review', RemindLaterReview::class);
        ActionHandler::postAjax('wnc_basalam_never_remind_review', NeverRemindReview::class);
        ActionHandler::postAjax('wnc_basalam_submit_review', SubmitReview::class);
    }
}
