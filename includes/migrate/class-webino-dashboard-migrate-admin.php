<?php
/**
 * wp-admin screen: مهاجرت کامل به سیستم اختصاصی وبینو.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Settings, connection test, checklist, and live progress.
 */
final class Webino_Dashboard_Migrate_Admin {

	const PAGE = 'webino-migrate';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
		add_action( 'admin_post_webino_migrate_save', array( __CLASS__, 'handle_save' ) );
		add_action( 'wp_ajax_webino_migrate_test', array( __CLASS__, 'ajax_test' ) );
		add_action( 'wp_ajax_webino_migrate_start', array( __CLASS__, 'ajax_start' ) );
		add_action( 'wp_ajax_webino_migrate_tick', array( __CLASS__, 'ajax_tick' ) );
		add_action( 'wp_ajax_webino_migrate_pause', array( __CLASS__, 'ajax_pause' ) );
		add_action( 'wp_ajax_webino_migrate_reset', array( __CLASS__, 'ajax_reset' ) );
		add_action( 'wp_ajax_webino_migrate_status', array( __CLASS__, 'ajax_status' ) );
	}

	/**
	 * @return void
	 */
	public static function menu() {
		add_menu_page(
			'مهاجرت به وبینو',
			'مهاجرت به وبینو',
			Webino_Dashboard_Migrate::capability(),
			self::PAGE,
			array( __CLASS__, 'render' ),
			'dashicons-migrate',
			58
		);
	}

	/**
	 * @param string $hook Hook suffix.
	 * @return void
	 */
	public static function assets( $hook ) {
		if ( 'toplevel_page_' . self::PAGE !== $hook ) {
			return;
		}
		$css = WEBINO_DASHBOARD_DIR . 'assets/migrate/admin.css';
		$js  = WEBINO_DASHBOARD_DIR . 'assets/migrate/admin.js';
		wp_enqueue_style(
			'webino-migrate-admin',
			WEBINO_DASHBOARD_URL . 'assets/migrate/admin.css',
			array(),
			file_exists( $css ) ? (string) filemtime( $css ) : WEBINO_DASHBOARD_VERSION
		);
		wp_enqueue_script(
			'webino-migrate-admin',
			WEBINO_DASHBOARD_URL . 'assets/migrate/admin.js',
			array(),
			file_exists( $js ) ? (string) filemtime( $js ) : WEBINO_DASHBOARD_VERSION,
			true
		);
		wp_localize_script(
			'webino-migrate-admin',
			'webinoMigrate',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'webino_migrate' ),
				'delayMs' => Webino_Dashboard_Migrate_Settings::delay_ms(),
				'labels'  => Webino_Dashboard_Migrate_Schema::entity_labels(),
			)
		);
	}

	/**
	 * @return void
	 */
	public static function handle_save() {
		if ( ! Webino_Dashboard_Migrate::current_user_can() ) {
			wp_die( esc_html__( 'You are not allowed to migrate this site.', 'webino-dashboard' ), 403 );
		}
		check_admin_referer( 'webino_migrate_save' );
		$input = array(
			'site_url'   => isset( $_POST['site_url'] ) ? wp_unslash( $_POST['site_url'] ) : '',
			'token'      => isset( $_POST['token'] ) ? wp_unslash( $_POST['token'] ) : '',
			'clear_token' => ! empty( $_POST['clear_token'] ),
			'batch_size' => isset( $_POST['batch_size'] ) ? wp_unslash( $_POST['batch_size'] ) : 20,
			'delay_ms'   => isset( $_POST['delay_ms'] ) ? wp_unslash( $_POST['delay_ms'] ) : 400,
			'timeout'    => isset( $_POST['timeout'] ) ? wp_unslash( $_POST['timeout'] ) : 45,
			'dry_run'    => ! empty( $_POST['dry_run'] ),
			'entities'   => isset( $_POST['entities'] ) && is_array( $_POST['entities'] ) ? wp_unslash( $_POST['entities'] ) : array(),
			'endpoints'  => isset( $_POST['endpoints'] ) && is_array( $_POST['endpoints'] ) ? wp_unslash( $_POST['endpoints'] ) : array(),
		);
		$result = Webino_Dashboard_Migrate_Settings::update( $input );
		$flag   = is_wp_error( $result ) ? 'error' : 'saved';
		$msg    = is_wp_error( $result ) ? $result->get_error_message() : '';
		wp_safe_redirect(
			add_query_arg(
				array(
					'page'     => self::PAGE,
					'migrate'  => $flag,
					'migrate_msg' => rawurlencode( $msg ),
				),
				admin_url( 'admin.php' )
			)
		);
		exit;
	}

	/**
	 * @return void
	 */
	public static function ajax_test() {
		self::guard_ajax();
		$result = Webino_Dashboard_Migrate_Client::ping();
		if ( is_wp_error( $result ) ) {
			wp_send_json_error(
				array(
					'message' => $result->get_error_message(),
				),
				400
			);
		}
		wp_send_json_success( $result );
	}

	/**
	 * @return void
	 */
	public static function ajax_start() {
		self::guard_ajax();
		$resume = ! empty( $_POST['resume'] );
		$result = Webino_Dashboard_Migrate_Job::start( $resume );
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ), 400 );
		}
		wp_send_json_success( array( 'job' => $result ) );
	}

	/**
	 * @return void
	 */
	public static function ajax_tick() {
		self::guard_ajax();
		wp_send_json_success( array( 'job' => Webino_Dashboard_Migrate_Job::tick() ) );
	}

	/**
	 * @return void
	 */
	public static function ajax_pause() {
		self::guard_ajax();
		$result = Webino_Dashboard_Migrate_Job::pause();
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ), 400 );
		}
		wp_send_json_success( array( 'job' => $result ) );
	}

	/**
	 * @return void
	 */
	public static function ajax_reset() {
		self::guard_ajax();
		wp_send_json_success( array( 'job' => Webino_Dashboard_Migrate_Job::reset() ) );
	}

	/**
	 * @return void
	 */
	public static function ajax_status() {
		self::guard_ajax();
		wp_send_json_success( array( 'job' => Webino_Dashboard_Migrate_Job::public_state() ) );
	}

	/**
	 * @return void
	 */
	private static function guard_ajax() {
		if ( ! Webino_Dashboard_Migrate::current_user_can() ) {
			wp_send_json_error( array( 'message' => 'Forbidden' ), 403 );
		}
		check_ajax_referer( 'webino_migrate', 'nonce' );
	}

	/**
	 * @return void
	 */
	public static function render() {
		if ( ! Webino_Dashboard_Migrate::current_user_can() ) {
			wp_die( esc_html__( 'You are not allowed to migrate this site.', 'webino-dashboard' ), 403 );
		}
		$settings = Webino_Dashboard_Migrate_Settings::public_view();
		$job      = Webino_Dashboard_Migrate_Job::public_state();
		$notice   = isset( $_GET['migrate'] ) ? sanitize_key( wp_unslash( $_GET['migrate'] ) ) : '';
		$notice_m = isset( $_GET['migrate_msg'] ) ? sanitize_text_field( rawurldecode( wp_unslash( $_GET['migrate_msg'] ) ) ) : '';
		$labels   = Webino_Dashboard_Migrate_Schema::entity_labels();
		$estimates = array();
		foreach ( Webino_Dashboard_Migrate_Schema::entity_order() as $entity ) {
			$estimates[ $entity ] = Webino_Dashboard_Migrate_Exporters::count( $entity );
		}
		?>
		<div class="wrap webino-migrate" dir="rtl" lang="fa">
			<h1>مهاجرت کامل به سیستم اختصاصی وبینو</h1>
			<p class="webino-migrate__lead">
				داده‌های این سایت وردپرس/ووکامرس را به‌صورت دسته‌ای به مستاجر وبینو منتقل کنید.
				نمونه مبدأ: <code>parisma.ir</code> — نمونه مقصد: <code>https://parisma.webinaagency.ir</code>.
				طرح داده: <code><?php echo esc_html( Webino_Dashboard_Migrate_Schema::NAME ); ?></code>.
			</p>
			<?php if ( 'saved' === $notice ) : ?>
				<div class="notice notice-success"><p>تنظیمات ذخیره شد. توکن در گزارش‌ها نمایش داده نمی‌شود.</p></div>
			<?php elseif ( 'error' === $notice && '' !== $notice_m ) : ?>
				<div class="notice notice-error"><p><?php echo esc_html( $notice_m ); ?></p></div>
			<?php endif; ?>

			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="webino-migrate__card">
				<?php wp_nonce_field( 'webino_migrate_save' ); ?>
				<input type="hidden" name="action" value="webino_migrate_save" />
				<h2>اتصال</h2>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="webino-migrate-url">آدرس سایت وبینو</label></th>
						<td>
							<input id="webino-migrate-url" name="site_url" type="url" class="regular-text" dir="ltr" required value="<?php echo esc_attr( $settings['site_url'] ); ?>" placeholder="https://parisma.webinaagency.ir" />
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="webino-migrate-token">توکن API</label></th>
						<td>
							<input id="webino-migrate-token" name="token" type="password" class="regular-text" dir="ltr" autocomplete="new-password" value="" placeholder="<?php echo esc_attr( $settings['token_set'] ? 'ذخیره شده (' . $settings['token_hint'] . ')' : '' ); ?>" />
							<?php if ( $settings['token_set'] ) : ?>
								<label class="webino-migrate__inline"><input type="checkbox" name="clear_token" value="1" /> حذف توکن ذخیره‌شده</label>
							<?php endif; ?>
							<p class="description">توکن با AES-256 و کلیدهای وردپرس رمز می‌شود و در گزارش مهاجرت نوشته نمی‌شود.</p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="webino-migrate-batch">اندازه دسته</label></th>
						<td><input id="webino-migrate-batch" name="batch_size" type="number" min="1" max="100" value="<?php echo esc_attr( (string) $settings['batch_size'] ); ?>" /></td>
					</tr>
					<tr>
						<th scope="row"><label for="webino-migrate-delay">فاصله بین دسته‌ها (میلی‌ثانیه)</label></th>
						<td><input id="webino-migrate-delay" name="delay_ms" type="number" min="0" max="10000" value="<?php echo esc_attr( (string) $settings['delay_ms'] ); ?>" /></td>
					</tr>
					<tr>
						<th scope="row"><label for="webino-migrate-timeout">مهلت هر درخواست (ثانیه)</label></th>
						<td><input id="webino-migrate-timeout" name="timeout" type="number" min="5" max="120" value="<?php echo esc_attr( (string) $settings['timeout'] ); ?>" /></td>
					</tr>
					<tr>
						<th scope="row">پیش‌نمایش</th>
						<td><label><input type="checkbox" name="dry_run" value="1" <?php checked( ! empty( $settings['dry_run'] ) ); ?> /> فقط شمارش و ساخت دسته، بدون ارسال به وبینو</label></td>
					</tr>
				</table>

				<h2>موجودیت‌ها</h2>
				<ul class="webino-migrate__checks">
					<?php foreach ( $labels as $key => $label ) : ?>
						<li>
							<label>
								<input type="checkbox" name="entities[<?php echo esc_attr( $key ); ?>]" value="1" <?php checked( ! empty( $settings['entities'][ $key ] ) ); ?> />
								<?php echo esc_html( $label ); ?>
								<span class="webino-migrate__count"><?php echo esc_html( (string) ( isset( $estimates[ $key ] ) ? $estimates[ $key ] : 0 ) ); ?></span>
							</label>
						</li>
					<?php endforeach; ?>
				</ul>

				<details class="webino-migrate__endpoints">
					<summary>مسیرهای API (قابل تغییر)</summary>
					<p class="description">پیش‌فرض‌ها روی <code>/api/v1/import/wordpress/…</code> هستند. فقط مسیر نسبی وارد کنید.</p>
					<table class="widefat striped">
						<thead><tr><th>کلید</th><th>مسیر</th></tr></thead>
						<tbody>
						<?php foreach ( $settings['endpoints'] as $key => $path ) : ?>
							<tr>
								<td><code><?php echo esc_html( $key ); ?></code></td>
								<td><input name="endpoints[<?php echo esc_attr( $key ); ?>]" type="text" dir="ltr" class="large-text" value="<?php echo esc_attr( $path ); ?>" /></td>
							</tr>
						<?php endforeach; ?>
						</tbody>
					</table>
				</details>

				<p class="webino-migrate__actions">
					<button type="submit" class="button button-primary">ذخیره تنظیمات</button>
					<button type="button" class="button" id="webino-migrate-test">آزمایش اتصال</button>
				</p>
				<p id="webino-migrate-test-result" class="webino-migrate__test" role="status"></p>
			</form>

			<section class="webino-migrate__card" aria-labelledby="webino-migrate-progress-title">
				<h2 id="webino-migrate-progress-title">پیشرفت</h2>
				<p>
					وضعیت: <strong id="webino-migrate-status"><?php echo esc_html( self::status_label( isset( $job['status'] ) ? (string) $job['status'] : 'idle' ) ); ?></strong>
					<?php if ( ! empty( $job['dry_run'] ) ) : ?>
						<span class="webino-migrate__badge">پیش‌نمایش</span>
					<?php endif; ?>
				</p>
				<p id="webino-migrate-error" class="webino-migrate__error"><?php echo esc_html( isset( $job['last_error'] ) ? (string) $job['last_error'] : '' ); ?></p>
				<div id="webino-migrate-bars">
					<?php echo self::progress_html( $job, $labels ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in helper. ?>
				</div>
				<p class="webino-migrate__actions">
					<button type="button" class="button button-primary" id="webino-migrate-start">شروع مهاجرت</button>
					<button type="button" class="button" id="webino-migrate-resume">ادامه</button>
					<button type="button" class="button" id="webino-migrate-pause">توقف</button>
					<button type="button" class="button" id="webino-migrate-reset">پاک کردن وضعیت</button>
				</p>
				<p class="description">با بستن این صفحه، کرون وردپرس هر دقیقه یک دسته را ادامه می‌دهد. «ادامه» مکان‌نما را از نو صفر نمی‌کند. رمز مشتریان منتقل نمی‌شود؛ در وبینو باید ورود با کد یکبارمصرف یا بازنشانی رمز انجام شود.</p>
				<h3>گزارش</h3>
				<ol id="webino-migrate-log" class="webino-migrate__log">
					<?php
					$log = isset( $job['log'] ) && is_array( $job['log'] ) ? $job['log'] : array();
					foreach ( $log as $row ) {
						$level = isset( $row['level'] ) ? (string) $row['level'] : 'info';
						$ts    = isset( $row['ts'] ) ? (string) $row['ts'] : '';
						$msg   = isset( $row['message'] ) ? (string) $row['message'] : '';
						echo '<li class="is-' . esc_attr( $level ) . '"><time>' . esc_html( $ts ) . '</time> ' . esc_html( $msg ) . '</li>';
					}
					?>
				</ol>
			</section>
		</div>
		<?php
	}

	/**
	 * @param string $status Status slug.
	 * @return string
	 */
	public static function status_label( $status ) {
		$labels = array(
			'idle'      => 'آماده',
			'running'   => 'در حال اجرا',
			'paused'    => 'متوقف',
			'failed'    => 'ناموفق',
			'completed' => 'کامل شد',
		);
		return isset( $labels[ $status ] ) ? $labels[ $status ] : $status;
	}

	/**
	 * @param array<string,mixed> $job    Job.
	 * @param array<string,string> $labels Labels.
	 * @return string
	 */
	public static function progress_html( array $job, array $labels ) {
		$progress = isset( $job['progress'] ) && is_array( $job['progress'] ) ? $job['progress'] : array();
		$totals   = isset( $job['totals'] ) && is_array( $job['totals'] ) ? $job['totals'] : array();
		if ( ! $progress ) {
			return '<p class="description">هنوز مهاجرتی شروع نشده است.</p>';
		}
		$html = '';
		foreach ( $progress as $key => $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$exported = isset( $row['exported'] ) ? (int) $row['exported'] : 0;
			$total    = isset( $totals[ $key ] ) ? (int) $totals[ $key ] : 0;
			$pct      = $total > 0 ? min( 100, (int) floor( ( $exported / $total ) * 100 ) ) : ( ! empty( $row['done'] ) ? 100 : 0 );
			$label    = isset( $labels[ $key ] ) ? $labels[ $key ] : (string) $key;
			$html    .= '<div class="webino-migrate__bar">';
			$html    .= '<div class="webino-migrate__bar-label"><span>' . esc_html( $label ) . '</span><span>' . esc_html( (string) $exported . ( $total ? ' / ' . $total : '' ) ) . '</span></div>';
			$html    .= '<div class="webino-migrate__track" role="progressbar" aria-valuenow="' . esc_attr( (string) $pct ) . '" aria-valuemin="0" aria-valuemax="100"><span style="width:' . esc_attr( (string) $pct ) . '%"></span></div>';
			$html    .= '</div>';
		}
		return $html;
	}
}
