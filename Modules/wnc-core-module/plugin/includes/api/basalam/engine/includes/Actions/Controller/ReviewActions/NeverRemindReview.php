<?php

namespace WncBasalam\Actions\Controller\ReviewActions;

use WncBasalam\Actions\Controller\ActionController;

defined('ABSPATH') || exit;

class NeverRemindReview extends ActionController
{
    public function __invoke()
    {
        update_option('wnc_basalam_review_never_remind', true);
        wp_send_json_success();
    }
}
