<?php

namespace WebinoBasalam\Admin\Order;

class OrderStatuses
{
    public static function boot(): void
    {
        \add_action('init', [self::class, 'registerPostStatuses'], 5);
    }

    public static function registerPostStatuses(): void
    {
        $statuses = (new self())->getBasalamOrderStatuses();
        foreach ($statuses as $key => $label) {
            \register_post_status($key, [
                'label'                     => $label,
                'public'                    => true,
                'show_in_admin_all_list'    => true,
                'show_in_admin_status_list' => true,
                'wc_status'                 => true,
            ]);
        }
    }

    public function getBasalamOrderStatuses()
    {
        return [
            "wc-bslm-rejected"    => "ردشده",
            "wc-bslm-preparation" => "آماده‌سازی",
            "wc-bslm-wait-vendor" => "انتظار فروشنده",
            "wc-bslm-shipping"    => "ارسال",
            "wc-bslm-completed"   => "تکمیل",
        ];
    }

    public function registerorderStatuses(array $orderStatuses): array
    {
        foreach ($this->getBasalamOrderStatuses() as $key => $label) {
            \register_post_status($key, [
                "label"                     => $label,
                "public"                    => true,
                "show_in_admin_all_list"    => true,
                "show_in_admin_status_list" => true,
                "wc_status"                 => true,
            ]);
        }
        return $orderStatuses + $this->getBasalamOrderStatuses();
    }
}
