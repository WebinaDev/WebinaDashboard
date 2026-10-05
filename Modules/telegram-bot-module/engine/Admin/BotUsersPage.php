<?php

namespace Webino_Dashboard_Bots_Telegram\Admin;

use Webino_Dashboard_Bots_Telegram\Util\PhoneNormalizer;
use Webino_Dashboard_Bots_Telegram\Util\UserResolver;
use Webino_Dashboard_Bots_Telegram\Core\Plugin;

/**
 * List users linked to Telegram (webino_dashboard_telegram_chat_id).
 */
class BotUsersPage {

	public static function init(): void {
		add_action( 'admin_post_woobale_import_contacts', array( __CLASS__, 'handle_import_contacts' ) );
	}

	public static function render(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'شما اجازه دسترسی ندارید.', 'webino-dashboard' ) );
		}

		$paged  = max( 1, (int) ( $_GET['paged'] ?? 1 ) );
		$search = isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( $_GET['s'] ) ) : '';

		$args = array(
			'meta_key'     => 'webino_dashboard_telegram_chat_id',
			'meta_compare' => 'EXISTS',
			'number'       => 30,
			'paged'        => $paged,
			'orderby'      => 'registered',
			'order'        => 'DESC',
		);
		if ( $search !== '' ) {
			$args['search']         = '*' . $search . '*';
			$args['search_columns'] = array( 'user_login', 'user_email', 'display_name' );
		}

		$users = get_users( $args );
		$with  = StatsService::count_linked_users();
		?>
		<div class="wrap woobale-admin-wrap">
			<h1><?php esc_html_e( 'کاربران متصل به ربات تلگرام', 'webino-dashboard' ); ?></h1>
			<p><?php echo esc_html( sprintf( /* translators: %d count */ __( 'تعداد: %d کاربر', 'webino-dashboard' ), (int) $with ) ); ?></p>
			<?php if ( isset( $_GET['woobale_import'] ) && $_GET['woobale_import'] === 'done' ) : ?>
				<div class="notice notice-success is-dismissible">
					<p>
						<?php
						echo esc_html(
							sprintf(
								/* translators: 1: total, 2: matched, 3: invalid, 4: duplicate, 5: not found */
								__( 'درون‌ریزی انجام شد. کل: %1$d | منطبق: %2$d | نامعتبر: %3$d | تکراری: %4$d | بدون کاربر: %5$d', 'webino-dashboard' ),
								(int) ( $_GET['total'] ?? 0 ),
								(int) ( $_GET['matched'] ?? 0 ),
								(int) ( $_GET['invalid'] ?? 0 ),
								(int) ( $_GET['duplicate'] ?? 0 ),
								(int) ( $_GET['not_found'] ?? 0 )
							)
						);
						?>
					</p>
				</div>
			<?php endif; ?>
			<p>
				<a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=woobale-broadcast' ) ); ?>"><?php esc_html_e( 'پیام همگانی', 'webino-dashboard' ); ?></a>
			</p>
			<form method="post" enctype="multipart/form-data" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="margin: 12px 0;">
				<?php wp_nonce_field( 'woobale_import_contacts' ); ?>
				<input type="hidden" name="action" value="woobale_import_contacts" />
				<label for="woobale_contacts_csv"><strong><?php esc_html_e( 'درون‌ریزی مخاطب از CSV', 'webino-dashboard' ); ?></strong></label>
				<input type="file" name="contacts_csv" id="woobale_contacts_csv" accept=".csv,text/csv" required />
				<?php
				submit_button(
					__( 'شروع درون‌ریزی', 'webino-dashboard' ),
					'secondary',
					'submit',
					false,
					Plugin::has_feature( 'campaigns' ) ? array() : array( 'disabled' => 'disabled' )
				);
				?>
				<p class="description"><?php esc_html_e( 'ستون اول فایل باید شماره تماس باشد. فقط کاربران موجود سایت که شماره‌شان یافت شود به لیست مخاطب کمپین اضافه می‌شوند.', 'webino-dashboard' ); ?></p>
				<?php if ( ! Plugin::has_feature( 'campaigns' ) ) : ?>
					<p class="description" style="color:#b32d2e;"><?php esc_html_e( 'این قابلیت فقط در طرح پیشرفته فعال است.', 'webino-dashboard' ); ?></p>
				<?php endif; ?>
			</form>
			<form method="get" action="" class="woobale-users-search" style="margin:1em 0;">
				<input type="hidden" name="page" value="woobale-users" />
				<label for="woobale-users-s" class="screen-reader-text"><?php esc_html_e( 'جستجو', 'webino-dashboard' ); ?></label>
				<input type="search" name="s" id="woobale-users-s" value="<?php echo esc_attr( $search ); ?>" placeholder="<?php esc_attr_e( 'نام، ایمیل یا نام کاربری…', 'webino-dashboard' ); ?>" />
				<?php submit_button( __( 'جستجو', 'webino-dashboard' ), 'secondary', '', false ); ?>
			</form>
			<table class="widefat striped">
				<thead>
					<tr>
						<th><?php esc_html_e( 'نام', 'webino-dashboard' ); ?></th>
						<th><?php esc_html_e( 'ایمیل', 'webino-dashboard' ); ?></th>
						<th><?php esc_html_e( 'موبایل', 'webino-dashboard' ); ?></th>
						<th><?php esc_html_e( 'chat_id', 'webino-dashboard' ); ?></th>
						<th><?php esc_html_e( 'عملیات', 'webino-dashboard' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php if ( empty( $users ) ) : ?>
						<tr><td colspan="5"><?php esc_html_e( 'کاربری یافت نشد.', 'webino-dashboard' ); ?></td></tr>
					<?php else : ?>
						<?php foreach ( $users as $u ) : ?>
							<tr>
								<td>
									<a href="<?php echo esc_url( get_edit_user_link( $u->ID ) ); ?>"><?php echo esc_html( $u->display_name ); ?></a>
								</td>
								<td><?php echo esc_html( $u->user_email ); ?></td>
								<td><?php echo esc_html( (string) get_user_meta( $u->ID, 'billing_phone', true ) ); ?></td>
								<td><code><?php echo esc_html( (string) get_user_meta( $u->ID, 'webino_dashboard_telegram_chat_id', true ) ); ?></code></td>
								<td>
									<textarea id="woobale_user_message_<?php echo esc_attr( (string) $u->ID ); ?>" rows="2" class="large-text" placeholder="<?php esc_attr_e( 'متن پیام...', 'webino-dashboard' ); ?>"></textarea>
									<p style="margin:6px 0 0;">
										<button type="button" class="button button-small button-primary woobale-js-user-send" data-user-id="<?php echo esc_attr( (string) $u->ID ); ?>">
											<?php esc_html_e( 'ارسال به بله', 'webino-dashboard' ); ?>
										</button>
										<a class="button button-small" href="<?php echo esc_url( get_edit_user_link( $u->ID ) ); ?>#woobale-user-bale">
											<?php esc_html_e( 'پروفایل کاربر', 'webino-dashboard' ); ?>
										</a>
									</p>
								</td>
							</tr>
						<?php endforeach; ?>
					<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
	}

	public static function handle_import_contacts(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'Forbidden', 'webino-dashboard' ) );
		}
		check_admin_referer( 'woobale_import_contacts' );
		if ( ! Plugin::has_feature( 'campaigns' ) ) {
			wp_safe_redirect( admin_url( 'admin.php?page=woobale-users' ) );
			exit;
		}
		if ( empty( $_FILES['contacts_csv']['tmp_name'] ) ) {
			wp_safe_redirect( admin_url( 'admin.php?page=woobale-users' ) );
			exit;
		}

		$file = $_FILES['contacts_csv']['tmp_name'];
		$fh   = fopen( $file, 'r' );
		if ( ! $fh ) {
			wp_safe_redirect( admin_url( 'admin.php?page=woobale-users' ) );
			exit;
		}

		$stats = array(
			'total'     => 0,
			'matched'   => 0,
			'invalid'   => 0,
			'duplicate' => 0,
			'not_found' => 0,
		);
		$user_ids = array();
		while ( ( $row = fgetcsv( $fh ) ) !== false ) {
			if ( empty( $row ) || ! isset( $row[0] ) ) {
				continue;
			}
			$raw = trim( (string) $row[0] );
			if ( $raw === '' ) {
				continue;
			}
			++$stats['total'];
			$phone = PhoneNormalizer::normalize( $raw );
			if ( strlen( $phone ) < 10 ) {
				++$stats['invalid'];
				continue;
			}
			$user = UserResolver::find_user_by_phone( $phone );
			if ( ! $user ) {
				++$stats['not_found'];
				continue;
			}
			$uid = (int) $user->ID;
			if ( in_array( $uid, $user_ids, true ) ) {
				++$stats['duplicate'];
				continue;
			}
			$user_ids[] = $uid;
			++$stats['matched'];
		}
		fclose( $fh );

		\Webino_Dashboard_Bots_REST_Context::merge_imported_user_ids( 'telegram', $user_ids );

		wp_safe_redirect(
			add_query_arg(
				array_merge(
					array(
						'page'           => 'woobale-users',
						'woobale_import' => 'done',
					),
					$stats
				),
				admin_url( 'admin.php' )
			)
		);
		exit;
	}
}
