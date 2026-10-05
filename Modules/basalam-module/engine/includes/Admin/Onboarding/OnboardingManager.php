<?php

namespace WebinoBasalam\Admin\Onboarding;

class OnboardingManager
{
    public function getCurrentStep()
    {
        if (isset($_POST['webino_basalam_onboarding_nonce']) && !check_admin_referer('webino_basalam_onboarding_action', 'webino_basalam_onboarding_nonce')) {
            die('دسترسی مجاز نیست.');
        }

        return isset($_GET['step']) ? intval(sanitize_text_field(wp_unslash($_GET['step']))) : 1;
    }

    public function onboardingSteps()
    {
        return [
            1 => [
                'title'   => 'به باسلام خوش آمدید',
                'content' => function () {
                    ob_start();
                    require webinoBasalamPlugin()->templatePath('/admin/onboarding/step1.php');
                    return ob_get_clean();
                },
            ],
            2 => [
                'title'   => 'دریافت دسترسی از باسلام',
                'content' => function () {
                    ob_start();
                    require webinoBasalamPlugin()->templatePath('/admin/onboarding/step2.php');
                    return ob_get_clean();
                },
            ],
            3 => [
                'title'   => 'تکمیل فرایند',
                'content' => function () {
                    ob_start();
                    require webinoBasalamPlugin()->templatePath('/admin/onboarding/step3.php');
                    return ob_get_clean();
                },
            ],
        ];
    }
}
