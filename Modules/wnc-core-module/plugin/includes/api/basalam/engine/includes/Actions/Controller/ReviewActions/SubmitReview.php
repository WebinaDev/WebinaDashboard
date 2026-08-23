<?php

namespace WncBasalam\Actions\Controller\ReviewActions;

use WncBasalam\Actions\Controller\ActionController;
use WncBasalam\Services\BasalamAppStoreReview;

defined('ABSPATH') || exit;

class SubmitReview extends ActionController
{
    public function __invoke()
    {
        $comment = isset($this->request['wnc_basalam_comment']) ? sanitize_textarea_field(wp_unslash($this->request['wnc_basalam_comment'])) : null;
        $rating = isset($this->request['wnc_basalam_rating']) ? intval($this->request['wnc_basalam_rating']) : 5;

        $basalamReviewService = new BasalamAppStoreReview();
        $review = $basalamReviewService->createReview($comment, $rating);

        if (isset($review['status_code']) && $review['status_code'] == 200) {
            update_option('wnc_basalam_review_never_remind', true);
        }

        wp_send_json_success([
            'review' => $review
        ]);
    }
}
