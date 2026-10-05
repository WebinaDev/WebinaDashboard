<?php

namespace WebinoBasalam\Actions\Controller\ReviewActions;

use WebinoBasalam\Actions\Controller\ActionController;

defined('ABSPATH') || exit;

class NeverRemindReview extends ActionController
{
    public function __invoke()
    {
        update_option('webino_basalam_review_never_remind', true);
        wp_send_json_success();
    }
}
