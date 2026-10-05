<?php

namespace WebinoBasalam\Admin\Pages;

use WebinoBasalam\Admin\Onboarding\OnboardingManager;

defined('ABSPATH') || exit;
class OnboardingPage extends AdminPageAbstract
{
    public $checkToken = false;

    protected function renderContent()
    {
        $class = new OnboardingManager();
        $current_step = $class->getCurrentStep();
        $steps = $class->onboardingSteps();
        $total_steps = count($steps);

        if ($current_step === $total_steps) update_option('webino_basalam_onboarding_completed', true);

        require_once webinoBasalamPlugin()->templatePath('/admin/onboarding/template-onboarding-page.php');
    }
}
