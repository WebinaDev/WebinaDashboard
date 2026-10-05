<?php
defined('ABSPATH') || exit;
use WebinoBasalam\Services\CheckHttpBlockService;

$syncBasalamHttpBlock =  webinoBasalamContainer()->get(CheckHttpBlockService::class)->SyncBasalamHttpBlock();
if (!$syncBasalamHttpBlock) return;

echo '<div class="notice notice-error basalam-p" style="text-align:right;">';
echo '<p>درخواست های HTTP افزونه باسلام محدود شده اند.</p>';
echo '<p>برای عملکرد صحیح باسلام، دامنه‌های زیر باید به <code>WP_ACCESSIBLE_HOSTS</code> در فایل <code>wp-config.php</code> اضافه شوند:  <code>' . esc_html(implode(',', $syncBasalamHttpBlock)) . '</code></p>';
echo '<p>در غیر این صورت هیچ همگام سازی با باسلام صورت نخواهد گرفت.</p>';
echo '</div>';
