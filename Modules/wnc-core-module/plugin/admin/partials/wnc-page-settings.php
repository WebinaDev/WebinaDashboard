<?php
/**
 * Settings page.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

$platforms = WNC_Platform_Registry::all();
$active    = isset( $_GET['platform'] ) ? sanitize_key( wp_unslash( $_GET['platform'] ) ) : 'digikala';
if ( ! isset( $platforms[ $active ] ) ) {
	$active = 'digikala';
}
?>
<div class="wrap wnc-wrap">
	<h1><?php esc_html_e( 'تنظیمات اتصال بازارگاه', 'webinaconnector' ); ?></h1>
	<div class="wnc-tabs">
		<?php foreach ( $platforms as $id => $adapter ) : ?>
			<a class="wnc-tab <?php echo $active === $id ? 'active' : ''; ?>" href="<?php echo esc_url( admin_url( 'admin.php?page=wnc-settings&platform=' . $id ) ); ?>">
				<?php echo esc_html( $adapter->label() ); ?>
			</a>
		<?php endforeach; ?>
	</div>

	<?php
	$adapter  = $platforms[ $active ];
	$settings = WNC_Settings::get_platform( $active );
	$creds    = isset( $settings['credentials'] ) && is_array( $settings['credentials'] ) ? $settings['credentials'] : array();
	?>
	<div class="wnc-card">
		<form class="wnc-settings-form" data-platform="<?php echo esc_attr( $active ); ?>">
			<p>
				<label>
					<input type="checkbox" name="enabled" value="1" <?php checked( ! empty( $settings['enabled'] ) ); ?> />
					<?php esc_html_e( 'فعال‌سازی پلتفرم', 'webinaconnector' ); ?>
				</label>
			</p>
			<p>
				<label>
					<input type="checkbox" name="auto_sync" value="1" <?php checked( ! empty( $settings['auto_sync'] ) ); ?> />
					<?php esc_html_e( 'همگام‌سازی خودکار قیمت و موجودی', 'webinaconnector' ); ?>
				</label>
			</p>

			<?php if ( 'digikala' === $active ) : ?>
				<?php
				$dk_tokens   = class_exists( 'WNC_Digikala_Auth' ) ? WNC_Digikala_Auth::tokens() : array();
				$has_access  = ! empty( $dk_tokens['access_token'] );
				$has_private = ! empty( $creds['private_key'] );
				$public_key  = (string) ( $creds['public_key'] ?? '' );
				?>
				<p class="description">
					<?php esc_html_e( 'دیجیکالا داده‌های حساس را با RSA 4096 (کلید عمومی شما) رمز می‌کند. کلید خصوصی را فقط اینجا نگه دارید، کلید عمومی را در پنل دیجیکالا ثبت کنید، سپس کد هویت‌سنجی Base64 را بچسبانید تا رمزگشایی و صدور توکن انجام شود. Access ≈ ۱ ساعت، Refresh ≈ ۶ ماه.', 'webinaconnector' ); ?>
				</p>
				<p><label><?php esc_html_e( 'Base URL', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[base_url]" value="<?php echo esc_attr( $creds['base_url'] ?? 'https://seller.digikala.com' ); ?>" /></p>
				<p><label><?php esc_html_e( 'کد کلاینت (اختیاری — برای scopes)', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[client_code]" value="<?php echo esc_attr( $creds['client_code'] ?? '' ); ?>" /></p>

				<p>
					<button type="button" class="button wnc-generate-dk-keys"><?php esc_html_e( 'تولید جفت کلید RSA 4096', 'webinaconnector' ); ?></button>
					<span class="description" style="margin-right:8px;">
						<?php echo $has_private ? esc_html__( 'کلید خصوصی ذخیره شده است.', 'webinaconnector' ) : esc_html__( 'هنوز کلید خصوصی ذخیره نشده.', 'webinaconnector' ); ?>
					</span>
				</p>
				<p><label><?php esc_html_e( 'کلید عمومی (برای ثبت در دیجیکالا)', 'webinaconnector' ); ?></label>
					<textarea class="widefat" rows="5" id="wnc-dk-public-key" name="credentials[public_key]" readonly><?php echo esc_textarea( $public_key ); ?></textarea>
					<span class="description"><?php esc_html_e( 'این کلید را در پنل فروشندگان دیجیکالا ثبت کنید. کلید خصوصی را محرمانه نگه دارید و افشا نکنید.', 'webinaconnector' ); ?></span>
				</p>
				<p><label><?php esc_html_e( 'کلید خصوصی (PEM) — فقط در صورت جایگزینی دستی', 'webinaconnector' ); ?></label>
					<textarea class="widefat" rows="4" name="credentials[private_key]" placeholder="<?php esc_attr_e( 'خالی = بدون تغییر (پیشنهاد: از دکمه تولید کلید استفاده کنید)', 'webinaconnector' ); ?>"></textarea></p>

				<p><label><?php esc_html_e( 'کد هویت‌سنجی رمزشده (Base64 از دیجیکالا)', 'webinaconnector' ); ?></label>
					<textarea class="widefat" rows="3" name="credentials[encrypted_code]" placeholder="<?php esc_attr_e( 'کد Base64 که دیجیکالا با کلید عمومی شما رمز کرده است', 'webinaconnector' ); ?>"></textarea></p>

				<p><label><?php esc_html_e( 'درصد افزایش اعتباری', 'webinaconnector' ); ?></label>
					<input class="widefat" type="number" min="0" name="credentials[credit_increase_percentage]" value="<?php echo esc_attr( $creds['credit_increase_percentage'] ?? 0 ); ?>" /></p>
				<p class="description">
					<?php if ( $has_access ) : ?>
						<?php
						printf(
							/* translators: 1: access expiry, 2: refresh expiry */
							esc_html__( 'وضعیت توکن: صادر شده — انقضای Access: %1$s | انقضای Refresh: %2$s', 'webinaconnector' ),
							! empty( $dk_tokens['access_expires_at'] ) ? esc_html( wp_date( 'Y-m-d H:i', (int) $dk_tokens['access_expires_at'] ) ) : '—',
							! empty( $dk_tokens['refresh_expires_at'] ) ? esc_html( wp_date( 'Y-m-d H:i', (int) $dk_tokens['refresh_expires_at'] ) ) : '—'
						);
						?>
					<?php else : ?>
						<?php esc_html_e( 'وضعیت توکن: هنوز صادر نشده', 'webinaconnector' ); ?>
					<?php endif; ?>
				</p>
				<p>
					<button type="button" class="button button-primary wnc-issue-dk-token"><?php esc_html_e( 'رمزگشایی RSA و صدور توکن', 'webinaconnector' ); ?></button>
				</p>
			<?php elseif ( 'basalam' === $active ) : ?>
				<p><label><?php esc_html_e( 'Base URL', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[base_url]" value="<?php echo esc_attr( $creds['base_url'] ?? 'https://openapi.basalam.com' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Auth URL', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[auth_url]" value="<?php echo esc_attr( $creds['auth_url'] ?? 'https://auth.basalam.com/oauth/token' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Vendor ID', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[vendor_id]" value="<?php echo esc_attr( $creds['vendor_id'] ?? '' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Access Token', 'webinaconnector' ); ?></label>
					<input class="widefat" type="password" name="credentials[access_token]" value="" placeholder="<?php esc_attr_e( 'خالی = بدون تغییر', 'webinaconnector' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Refresh Token', 'webinaconnector' ); ?></label>
					<input class="widefat" type="password" name="credentials[refresh_token]" value="" placeholder="<?php esc_attr_e( 'خالی = بدون تغییر', 'webinaconnector' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Client ID', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[client_id]" value="<?php echo esc_attr( $creds['client_id'] ?? '' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Client Secret', 'webinaconnector' ); ?></label>
					<input class="widefat" type="password" name="credentials[client_secret]" value="" placeholder="<?php esc_attr_e( 'خالی = بدون تغییر', 'webinaconnector' ); ?>" /></p>
			<?php elseif ( 'snappshop' === $active ) : ?>
				<p><label><?php esc_html_e( 'Base URL', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[base_url]" value="<?php echo esc_attr( $creds['base_url'] ?? 'https://apix.snappshop.ir' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Automation Base URL', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[automation_base_url]" value="<?php echo esc_attr( $creds['automation_base_url'] ?? 'https://apix.snappshop.ir/automation/v1' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Vendor ID', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[vendor_id]" value="<?php echo esc_attr( $creds['vendor_id'] ?? '' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Shop Code', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[shop_code]" value="<?php echo esc_attr( $creds['shop_code'] ?? '' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Panel Token', 'webinaconnector' ); ?></label>
					<input class="widefat" type="password" name="credentials[token]" value="" placeholder="<?php esc_attr_e( 'خالی = بدون تغییر', 'webinaconnector' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Automation Token', 'webinaconnector' ); ?></label>
					<input class="widefat" type="password" name="credentials[token_api]" value="" placeholder="<?php esc_attr_e( 'خالی = بدون تغییر', 'webinaconnector' ); ?>" /></p>
				<p><label><?php esc_html_e( 'User-Agent', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[user_agent]" value="<?php echo esc_attr( $creds['user_agent'] ?? '' ); ?>" /></p>
			<?php elseif ( 'technolife' === $active ) : ?>
				<p class="description"><?php esc_html_e( 'Base URL را از مستندات داخل پنل فروشنده تکنولایف وارد کنید. مسیرهای endpoint در صورت نیاز قابل تغییرند.', 'webinaconnector' ); ?></p>
				<p><label><?php esc_html_e( 'Base URL', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[base_url]" value="<?php echo esc_attr( $creds['base_url'] ?? '' ); ?>" placeholder="https://..." /></p>
				<p><label><?php esc_html_e( 'API Key', 'webinaconnector' ); ?></label>
					<input class="widefat" type="password" name="credentials[api_key]" value="" placeholder="<?php esc_attr_e( 'خالی = بدون تغییر', 'webinaconnector' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Auth Header', 'webinaconnector' ); ?></label>
					<select name="credentials[auth_header]">
						<option value="bearer" <?php selected( ( $creds['auth_header'] ?? 'bearer' ), 'bearer' ); ?>>Authorization: Bearer</option>
						<option value="x-api-key" <?php selected( ( $creds['auth_header'] ?? '' ), 'x-api-key' ); ?>>X-Api-Key</option>
					</select>
				</p>
				<p><label><?php esc_html_e( 'Products path', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[products_path]" value="<?php echo esc_attr( $creds['products_path'] ?? 'api/v1/seller/products' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Price path', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[price_path]" value="<?php echo esc_attr( $creds['price_path'] ?? 'api/v1/seller/variants/{variant_id}/price' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Stock path', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[stock_path]" value="<?php echo esc_attr( $creds['stock_path'] ?? 'api/v1/seller/variants/{variant_id}/stock' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Orders path', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[orders_path]" value="<?php echo esc_attr( $creds['orders_path'] ?? 'api/v1/seller/orders' ); ?>" /></p>
			<?php elseif ( 'tapsishop' === $active ) : ?>
				<p><label><?php esc_html_e( 'Base URL', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[base_url]" value="<?php echo esc_attr( $creds['base_url'] ?? 'https://vendorgw.tapsi.shop' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Store ID', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[store_id]" value="<?php echo esc_attr( $creds['store_id'] ?? '' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Username', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[username]" value="<?php echo esc_attr( $creds['username'] ?? '' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Password', 'webinaconnector' ); ?></label>
					<input class="widefat" type="password" name="credentials[password]" value="" placeholder="<?php esc_attr_e( 'خالی = بدون تغییر', 'webinaconnector' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Vendor Token', 'webinaconnector' ); ?></label>
					<input class="widefat" type="password" name="credentials[token]" value="" placeholder="<?php esc_attr_e( 'خالی = بدون تغییر', 'webinaconnector' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Token Name', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[token_name]" value="<?php echo esc_attr( $creds['token_name'] ?? '5' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Client Name', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[client_name]" value="<?php echo esc_attr( $creds['client_name'] ?? 'vendor.dartil.com' ); ?>" /></p>
				<p><label><?php esc_html_e( 'Client Version', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[client_version]" value="<?php echo esc_attr( $creds['client_version'] ?? '1.0.0.0' ); ?>" /></p>
			<?php elseif ( 'zarehbin' === $active ) : ?>
				<p class="description">
					<?php esc_html_e( 'ذره‌بین موتور مقایسه قیمت است. خزنده با Bearer Token خودش به فید REST وصل می‌شود (توکن فروشگاهی لازم نیست)؛ قیمت از تب ذره‌بین در webina-woo-core خوانده می‌شود.', 'webinaconnector' ); ?>
				</p>
				<p><label><?php esc_html_e( 'آدرس فید', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" readonly value="<?php echo esc_attr( rest_url( 'zarehbin/v1/products' ) ); ?>" /></p>
				<p><label><?php esc_html_e( 'تعداد در هر صفحه', 'webinaconnector' ); ?></label>
					<input class="widefat" type="number" min="1" name="credentials[per_page]" value="<?php echo esc_attr( $creds['per_page'] ?? 50 ); ?>" /></p>
				<p><label><?php esc_html_e( 'Version', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[version]" value="<?php echo esc_attr( $creds['version'] ?? '1.0.0' ); ?>" /></p>
			<?php elseif ( 'emalls' === $active ) : ?>
				<p class="description">
					<?php esc_html_e( 'ایمالز موتور مقایسه قیمت است. خزنده توکن را در هر درخواست می‌فرستد (توکن فروشگاهی لازم نیست)؛ قیمت از تب ایمالز در webina-woo-core خوانده می‌شود.', 'webinaconnector' ); ?>
				</p>
				<p><label><?php esc_html_e( 'آدرس فید', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" readonly value="<?php echo esc_attr( rest_url( 'emalls_ext/v1/products' ) ); ?>" /></p>
				<p><label><?php esc_html_e( 'تعداد در هر صفحه', 'webinaconnector' ); ?></label>
					<input class="widefat" type="number" min="1" max="100" name="credentials[per_page]" value="<?php echo esc_attr( $creds['per_page'] ?? 50 ); ?>" /></p>
				<p><label><?php esc_html_e( 'Version', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[version]" value="<?php echo esc_attr( $creds['version'] ?? '1.3.0' ); ?>" /></p>
			<?php elseif ( 'snapppay-search' === $active ) : ?>
				<p class="description">
					<?php esc_html_e( 'اسنپ‌پی سرچ (SearchWise) فید جستجو است. خزنده با هدر x-api-key احراز می‌شود؛ توکن فروشگاهی لازم نیست. قیمت از تب اسنپ‌پی سرچ در webina-woo-core خوانده می‌شود.', 'webinaconnector' ); ?>
				</p>
				<p><label><?php esc_html_e( 'آدرس فید', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" readonly value="<?php echo esc_attr( rest_url( 'v1/product/feed' ) ); ?>" /></p>
				<p><label><?php esc_html_e( 'تعداد در هر صفحه (پیش‌فرض)', 'webinaconnector' ); ?></label>
					<input class="widefat" type="number" min="1" name="credentials[per_page]" value="<?php echo esc_attr( $creds['per_page'] ?? 100 ); ?>" /></p>
				<p><label><?php esc_html_e( 'Version', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" name="credentials[version]" value="<?php echo esc_attr( $creds['version'] ?? '1.0.2' ); ?>" /></p>
			<?php elseif ( 'torob' === $active ) : ?>
				<p class="description">
					<?php esc_html_e( 'ترب موتور مقایسه قیمت است. احراز هویت با هدرهای خزنده (JWT) انجام می‌شود؛ توکن outbound وب‌هوک را خود ترب با set-token می‌فرستد. قیمت از تب ترب در webina-woo-core خوانده می‌شود.', 'webinaconnector' ); ?>
				</p>
				<p><label><?php esc_html_e( 'آدرس فید محصولات', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" readonly value="<?php echo esc_attr( rest_url( 'wcpe/v1/products' ) ); ?>" /></p>
				<p><label><?php esc_html_e( 'وضعیت سفارش', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" readonly value="<?php echo esc_attr( rest_url( 'torob-api/v1/order-status' ) ); ?>" /></p>
				<p><label><?php esc_html_e( 'لیست سفارش‌ها', 'webinaconnector' ); ?></label>
					<input class="widefat" type="text" readonly value="<?php echo esc_attr( rest_url( 'torob-api/v1/orders' ) ); ?>" /></p>
				<p><label><?php esc_html_e( 'تعداد در هر صفحه (پیش‌فرض فید)', 'webinaconnector' ); ?></label>
					<input class="widefat" type="number" min="1" name="credentials[per_page]" value="<?php echo esc_attr( $creds['per_page'] ?? 50 ); ?>" /></p>
				<p>
					<label>
						<input type="checkbox" name="credentials[order_status_enabled]" value="1" <?php checked( ! isset( $creds['order_status_enabled'] ) || ! empty( $creds['order_status_enabled'] ) ); ?> />
						<?php esc_html_e( 'فعال‌سازی API وضعیت سفارش', 'webinaconnector' ); ?>
					</label>
				</p>
				<p>
					<label>
						<input type="checkbox" name="credentials[orders_list_api_enabled]" value="1" <?php checked( ! isset( $creds['orders_list_api_enabled'] ) || ! empty( $creds['orders_list_api_enabled'] ) ); ?> />
						<?php esc_html_e( 'فعال‌سازی API لیست سفارش‌ها (torob_clid)', 'webinaconnector' ); ?>
					</label>
				</p>
				<p>
					<label>
						<input type="checkbox" name="credentials[product_page_webhook_enabled]" value="1" <?php checked( ! isset( $creds['product_page_webhook_enabled'] ) || ! empty( $creds['product_page_webhook_enabled'] ) ); ?> />
						<?php esc_html_e( 'فعال‌سازی وب‌هوک تغییرات محصول', 'webinaconnector' ); ?>
					</label>
				</p>
				<p>
					<a class="button" href="<?php echo esc_url( add_query_arg( array( 'platform' => 'torob', 'wnc_torob_preview' => '1' ), admin_url( 'admin.php?page=wnc-settings' ) ) ); ?>">
						<?php esc_html_e( 'پیش‌نمایش اطلاعات محصولات', 'webinaconnector' ); ?>
					</a>
					<button type="button" class="button wnc-torob-connectivity" data-platform="torob"><?php esc_html_e( 'بررسی ارتباط با ترب', 'webinaconnector' ); ?></button>
				</p>
				<div class="wnc-torob-connectivity-msg"></div>
				<?php if ( ! empty( $_GET['wnc_torob_preview'] ) ) : // phpcs:ignore WordPress.Security.NonceVerification.Recommended ?>
					<?php
					$preview = WNC_Torob_Bootstrap::feed()->get_all_products( false, 5, 1, false );
					?>
					<h3><?php esc_html_e( 'پیش‌نمایش خروجی فید (۵ محصول)', 'webinaconnector' ); ?></h3>
					<pre style="max-height:420px;overflow:auto;background:#f6f7f7;padding:12px;direction:ltr;text-align:left;"><?php echo esc_html( wp_json_encode( $preview, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE ) ); ?></pre>
				<?php endif; ?>
			<?php endif; ?>

			<p>
				<button type="submit" class="button button-primary"><?php esc_html_e( 'ذخیره', 'webinaconnector' ); ?></button>
				<button type="button" class="button wnc-test-connection" data-platform="<?php echo esc_attr( $active ); ?>"><?php esc_html_e( 'تست اتصال', 'webinaconnector' ); ?></button>
			</p>
			<div class="wnc-ajax-msg" data-platform="<?php echo esc_attr( $active ); ?>"></div>
		</form>
	</div>
</div>
