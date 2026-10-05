<?php

namespace WebinoBasalam\Actions;

use WebinoBasalam\Actions\Controller\ProductActions\CreateAllProducts;
use WebinoBasalam\Actions\Controller\ProductActions\CancelCreateProducts;
use WebinoBasalam\Actions\Controller\ProductActions\UpdateAllProducts;
use WebinoBasalam\Actions\Controller\ProductActions\CancelUpdateProducts;
use WebinoBasalam\Actions\Controller\ProductActions\ConnectAllProducts;
use WebinoBasalam\Actions\Controller\ProductActions\CancelConnectAllProducts;
use WebinoBasalam\Actions\Controller\OrderActions\FetchUnsyncOrders;
use WebinoBasalam\Actions\Controller\OrderActions\CancelFetchOrders;
use WebinoBasalam\Actions\Controller\OrderActions\ConfirmOrder;
use WebinoBasalam\Actions\Controller\OrderActions\CancelOrder;
use WebinoBasalam\Actions\Controller\OrderActions\RequestCancelOrder;
use WebinoBasalam\Actions\Controller\OrderActions\DelayOrder;
use WebinoBasalam\Actions\Controller\OrderActions\TrackingCodeOrder;
use WebinoBasalam\Actions\Controller\OrderActions\AutoConfirmOrders;
use WebinoBasalam\Actions\Controller\OptionActions\CreateMapOption;
use WebinoBasalam\Actions\Controller\OptionActions\RemoveMapOption;
use WebinoBasalam\Actions\Controller\ReviewActions\RemindLaterReview;
use WebinoBasalam\Actions\Controller\ReviewActions\NeverRemindReview;
use WebinoBasalam\Actions\Controller\ReviewActions\SubmitReview;
use WebinoBasalam\Actions\Controller\ProductActions\CreateSingleProduct;
use WebinoBasalam\Actions\Controller\ProductActions\UpdateSingleProduct;
use WebinoBasalam\Actions\Controller\ProductActions\RestoreProduct;
use WebinoBasalam\Actions\Controller\ProductActions\ArchiveProduct;
use WebinoBasalam\Actions\Controller\ProductActions\DisconnectProduct;
use WebinoBasalam\Actions\Controller\ProductActions\ConnectSingleProduct;
use WebinoBasalam\Actions\Controller\ProductActions\DetectionProductCategories;
use WebinoBasalam\Actions\Controller\ProductActions\GetCategoryAttributes;
use WebinoBasalam\Actions\Controller\ProductActions\ClearLogs;
use WebinoBasalam\Actions\Controller\UpdateSettings;
use WebinoBasalam\Actions\Controller\CategoryActions\GetWooCategories;
use WebinoBasalam\Actions\Controller\CategoryActions\FetchBasalamCategories;
use WebinoBasalam\Actions\Controller\CategoryActions\GetCategoryMappings;
use WebinoBasalam\Actions\Controller\CategoryActions\CreateCategoryMap;
use WebinoBasalam\Actions\Controller\CategoryActions\RemoveCategoryMap;
use WebinoBasalam\Actions\Controller\CategoryActions\GetMappingStats;
use WebinoBasalam\Actions\Controller\TicketActions\CreateTicket;
use WebinoBasalam\Actions\Controller\TicketActions\CreateTicketItem;
use WebinoBasalam\Actions\Controller\TicketActions\UploadTicketMediaAjax;

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
        ActionHandler::postAjax('webino_basalam_remind_later_review', RemindLaterReview::class);
        ActionHandler::postAjax('webino_basalam_never_remind_review', NeverRemindReview::class);
        ActionHandler::postAjax('webino_basalam_submit_review', SubmitReview::class);
    }
}
