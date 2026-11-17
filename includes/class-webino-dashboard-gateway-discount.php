<?php
/**
 * Gateway payment discounts (تخفیف در درگاه پرداخت).
 *
 * Merchants register «campaign codes» here — e.g. ترب‌پی black-friday codes such as TP25NMH —
 * and the storefront announces them on cart/checkout: discount amount, minimum cart and the
 * exact remaining amount needed to unlock the code. The code itself is used inside the gateway,
 * never on the site.
 *
 * Each campaign can either stack with the site's own coupons ("stack") or replace the site
 * coupon entirely ("exclusive"): while an eligible exclusive campaign exists, site coupons are
 * removed (gift coupons excepted) and new ones cannot be applied.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Gateway discount campaign storage, REST CRUD and storefront banner.
 */
final class Webino_Dashboard_Gateway_Discount {

	const OPTION       = 'webino_gateway_discounts';
	const AJAX_GUARD   = 'webino_gd_suppressed';

	/**
	 * Whether exclusivity was already enforced during this request.
	 *
	 * @var bool
	 */
	private static $exclusive_enforced = false;

	/**
	 * @return void
	 */
	public static function init() {
		// Classic cart / checkout + order-review AJAX fragments (blocks get the banner via classic hooks only).
		add_action( 'woocommerce_before_cart', array( __CLASS__, 'render_banner' ), 21 );
		add_action( 'woocommerce_before_checkout_form', array( __CLASS__, 'render_banner' ), 13 );
		add_filter( 'woocommerce_update_order_review_fragments', array( __CLASS__, 'order_review_fragments' ) );

		// Exclusive campaigns: the site coupon is removed while the gateway code is the payable discount.
		add_action( 'woocommerce_before_calculate_totals', array( __CLASS__, 'enforce_exclusive' ), 30 );
		add_filter( 'woocommerce_coupon_is_valid', array( __CLASS__, 'filter_coupon_is_valid' ), 20, 3 );
		add_action( 'woocommerce_after_checkout_validation', array( __CLASS__, 'validate_checkout' ), 20, 2 );
	}

	/* =====================================================================
	 * Storage
	 * =================================================================== */

	/**
	 * All campaigns (sanitized, oldest first).
	 *
	 * @return list<array<string, mixed>>
	 */
	public static function campaigns() {
		$raw = get_option( self::OPTION, array() );
		if ( ! is_array( $raw ) ) {
			return array();
		}
		$out = array();
		foreach ( $raw as $row ) {
			if ( ! is_array( $row ) || empty( $row['id'] ) ) {
				continue;
			}
			$normalized = self::normalize_campaign( $row, false );
			if ( is_wp_error( $normalized ) ) {
				continue; // Never let a stale/invalid stored row break cart or dashboard.
			}
			$out[] = $normalized;
		}
		return $out;
	}

	/**
	 * Campaigns that should be announced right now (active and inside their date window).
	 *
	 * @return list<array<string, mixed>>
	 */
	public static function active_campaigns() {
		$today = current_time( 'Y-m-d' );
		$out   = array();
		foreach ( self::campaigns() as $c ) {
			if ( empty( $c['active'] ) ) {
				continue;
			}
			if ( '' !== $c['start_date'] && $today < $c['start_date'] ) {
				continue;
			}
			if ( '' !== $c['end_date'] && $today > $c['end_date'] ) {
				continue;
			}
			$out[] = $c;
		}
		return $out;
	}

	/**
	 * Cart value the campaign threshold is compared against.
	 * Subtotal of the goods after line-level and site-coupon discounts (Gift lines are free, so
	 * they never push the basket over the floor), excluding shipping and fees — i.e. the same
	 * figure WooCommerce compares minimum spend against.
	 *
	 * @return float
	 */
	public static function base_amount() {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return 0.0;
		}
		if ( class_exists( 'Webino_Dashboard_Coupon_Storefront' ) ) {
			$amount = (float) Webino_Dashboard_Coupon_Storefront::cart_amount();
			if ( is_finite( $amount ) ) {
				return max( 0.0, $amount );
			}
		}
		return max( 0.0, (float) WC()->cart->get_displayed_subtotal() );
	}

	/**
	 * Active campaigns whose minimum cart is reached.
	 *
	 * @return list<array<string, mixed>>
	 */
	public static function eligible_campaigns() {
		$base = self::base_amount();
		$out  = array();
		foreach ( self::active_campaigns() as $c ) {
			$min = (float) $c['min_amount'];
			if ( $min <= 0 || $base + 0.0001 >= $min ) {
				$out[] = $c;
			}
		}
		return $out;
	}

	/**
	 * Active, in-date exclusive campaigns that are currently unlocked (min cart reached).
	 *
	 * @return list<array<string, mixed>>
	 */
	public static function eligible_exclusive_campaigns() {
		$out = array();
		foreach ( self::eligible_campaigns() as $c ) {
			if ( empty( $c['combine_with_site'] ) ) {
				$out[] = $c;
			}
		}
		return $out;
	}

	/**
	 * Sanitize/validate one campaign. Returns WP_Error on invalid input.
	 *
	 * @param array<mixed> $input  Raw input.
	 * @param bool         $is_new True when creating.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function normalize_campaign( $input, $is_new = true ) {
		$bad = static function ( $code, $message ) {
			return new WP_Error( $code, $message );
		};

		$id = isset( $input['id'] ) ? sanitize_key( (string) $input['id'] ) : '';
		if ( '' === $id && $is_new ) {
			$id = 'gd_' . strtolower( wp_generate_password( 12, false, false ) );
		}

		$gateway = isset( $input['gateway'] ) ? sanitize_text_field( (string) $input['gateway'] ) : '';
		$gateway = trim( $gateway );
		if ( '' === $gateway ) {
			return $bad( 'gateway_discounts_gateway_required', __( 'درگاه را مشخص کنید (مثلاً ترب‌پی).', 'webino-dashboard' ) );
		}

		$code = isset( $input['code'] ) ? strtoupper( wc_format_coupon_code( sanitize_text_field( (string) $input['code'] ) ) ) : '';
		$code = trim( $code );
		if ( ! preg_match( '/^[A-Z0-9][A-Z0-9\-_]{1,31}$/', $code ) ) {
			return $bad( 'gateway_discounts_code_invalid', __( 'کد تخفیف باید ۲ تا ۳۲ کاراکتر (حروف انگلیسی، عدد یا خط تیره) باشد.', 'webino-dashboard' ) );
		}

		$num = static function ( $value ) {
			$raw = is_scalar( $value ) ? trim( (string) $value ) : '';
			if ( '' === $raw ) {
				return 0.0;
			}
			$n = class_exists( 'Webino_Dashboard_Coupon_Storefront' )
				? Webino_Dashboard_Coupon_Storefront::normalize_decimal( $raw )
				: (string) wc_format_decimal( $raw );
			if ( '' === $n || ! is_numeric( $n ) ) {
				return null;
			}
			return (float) $n;
		};

		$min = $num( $input['min_amount'] ?? 0 );
		if ( null === $min || $min < 0 ) {
			return $bad( 'gateway_discounts_min_invalid', __( 'کف سبد خرید باید یک عدد معتبر (صفر یا بیشتر) باشد.', 'webino-dashboard' ) );
		}
		$discount = $num( $input['discount_amount'] ?? 0 );
		if ( null === $discount || $discount <= 0 ) {
			return $bad( 'gateway_discounts_discount_invalid', __( 'مبلغ تخفیف باید یک عدد بزرگ‌تر از صفر باشد.', 'webino-dashboard' ) );
		}
		$share = $num( $input['store_share_percent'] ?? 50 );
		if ( null === $share ) {
			$share = 50.0;
		}
		$share = min( 100.0, max( 0.0, $share ) );

		$title       = isset( $input['title'] ) ? sanitize_text_field( (string) $input['title'] ) : '';
		$description = isset( $input['description'] ) ? sanitize_textarea_field( (string) $input['description'] ) : '';
		if ( $is_new ) {
			$title       = (string) mb_substr( $title, 0, 160 );
			$description = (string) mb_substr( $description, 0, 500 );
		}

		$date = static function ( $value ) {
			$v = is_scalar( $value ) ? trim( (string) $value ) : '';
			if ( '' === $v ) {
				return '';
			}
			$parsed = DateTime::createFromFormat( 'Y-m-d', $v );
			if ( ! $parsed ) {
				return null;
			}
			return $parsed->format( 'Y-m-d' );
		};
		$start = $date( $input['start_date'] ?? '' );
		$end   = $date( $input['end_date'] ?? '' );
		if ( null === $start || null === $end ) {
			return $bad( 'gateway_discounts_date_invalid', __( 'تاریخ‌ها را به شکل Y-m-d وارد کنید.', 'webino-dashboard' ) );
		}
		if ( '' !== $start && '' !== $end && $start > $end ) {
			return $bad( 'gateway_discounts_date_range', __( 'تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.', 'webino-dashboard' ) );
		}

		$active  = filter_var( $input['active'] ?? true, FILTER_VALIDATE_BOOLEAN );
		$combine = filter_var( $input['combine_with_site'] ?? true, FILTER_VALIDATE_BOOLEAN );

		$now = current_time( 'mysql' );

		return array(
			'id'                  => '' !== $id ? $id : ( 'gd_' . strtolower( wp_generate_password( 12, false, false ) ) ),
			'gateway'             => $gateway,
			'title'               => $title,
			'code'                => $code,
			'description'         => $description,
			'min_amount'          => $min,
			'discount_amount'     => $discount,
			'store_share_percent' => $share,
			'start_date'          => $start,
			'end_date'            => $end,
			'active'              => $active,
			'combine_with_site'   => $combine,
			'created_at'          => isset( $input['created_at'] ) ? (string) $input['created_at'] : $now,
			'updated_at'          => $now,
		);
	}

	/**
	 * Derived share amounts for a campaign.
	 *
	 * @param array<string, mixed> $c Campaign.
	 * @return array{store_share: float, gateway_share: float}
	 */
	public static function shares( $c ) {
		$discount = (float) ( $c['discount_amount'] ?? 0 );
		$pct      = (float) ( $c['store_share_percent'] ?? 50 );
		$store    = round( $discount * $pct / 100.0, 2 );
		return array(
			'store_share'   => $store,
			'gateway_share' => max( 0.0, $discount - $store ),
		);
	}

	/**
	 * REST/admin representation (with derived amounts).
	 *
	 * @param array<string, mixed> $c Campaign.
	 * @return array<string, mixed>
	 */
	public static function public_row( $c ) {
		$shares = self::shares( $c );
		return array(
			'id'                  => (string) $c['id'],
			'gateway'             => (string) $c['gateway'],
			'title'               => (string) $c['title'],
			'code'                => (string) $c['code'],
			'description'         => (string) $c['description'],
			'min_amount'          => (float) $c['min_amount'],
			'discount_amount'     => (float) $c['discount_amount'],
			'store_share_percent' => (float) $c['store_share_percent'],
			'store_share'         => $shares['store_share'],
			'gateway_share'       => $shares['gateway_share'],
			'start_date'          => (string) $c['start_date'],
			'end_date'            => (string) $c['end_date'],
			'active'              => (bool) $c['active'],
			'combine_with_site'   => (bool) $c['combine_with_site'],
			'created_at'          => (string) $c['created_at'],
			'updated_at'          => (string) $c['updated_at'],
		);
	}

	/**
	 * @param list<array<string, mixed>> $campaigns Campaigns to persist.
	 * @return void
	 */
	private static function persist( $campaigns ) {
		update_option( self::OPTION, array_values( $campaigns ), false );
	}

	/**
	 * Payment gateways available on the site (from WooCommerce), enabled ones first.
	 *
	 * @return WP_REST_Response
	 */
	public static function rest_gateways() {
		$items = array();
		$seen  = array();
		if ( function_exists( 'WC' ) && WC() && method_exists( WC(), 'payment_gateways' ) && WC()->payment_gateways() ) {
			foreach ( WC()->payment_gateways()->payment_gateways() as $id => $gateway ) {
				if ( ! is_object( $gateway ) ) {
					continue;
				}
				$title = method_exists( $gateway, 'get_title' ) ? (string) $gateway->get_title() : '';
				if ( '' === trim( wp_strip_all_tags( $title ) ) && method_exists( $gateway, 'get_method_title' ) ) {
					$title = (string) $gateway->get_method_title();
				}
				$title = trim( html_entity_decode( wp_strip_all_tags( $title ), ENT_QUOTES, 'UTF-8' ) );
				if ( '' === $title ) {
					$title = (string) $id;
				}
				$enabled_raw = isset( $gateway->enabled ) ? $gateway->enabled : 'no';
				$enabled     = ( 'yes' === $enabled_raw || true === $enabled_raw || 1 === $enabled_raw );
				$key         = md5( $title );
				$items[]     = array(
					'id'      => (string) $id,
					'title'   => $title,
					'enabled' => $enabled,
				);
				$seen[ $key ] = true;
			}
		}
		// Presets for gateways the site knows by name but that are not registered in WooCommerce.
		foreach ( array( 'ترب‌پی', 'دیجی‌پی', 'اسنپ‌پی', 'زرین‌پال', 'تپسی‌پی' ) as $preset ) {
			$key = md5( $preset );
			if ( isset( $seen[ $key ] ) ) {
				continue;
			}
			$items[] = array(
				'id'      => 'preset:' . $preset,
				'title'   => $preset,
				'enabled' => false,
				'preset'  => true,
			);
		}
		usort(
			$items,
			static function ( $a, $b ) {
				if ( (bool) $a['enabled'] !== (bool) $b['enabled'] ) {
					return $a['enabled'] ? -1 : 1;
				}
				return strcasecmp( (string) $a['title'], (string) $b['title'] );
			}
		);
		return new WP_REST_Response( array( 'items' => $items ) );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function rest_items() {
		$out = array();
		foreach ( self::campaigns() as $c ) {
			$out[] = self::public_row( $c );
		}
		return new WP_REST_Response( array( 'items' => $out ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_create( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		$body = is_array( $body ) ? $body : $request->get_params();
		$row  = self::normalize_campaign( is_array( $body ) ? $body : array(), true );
		if ( is_wp_error( $row ) ) {
			return $row;
		}
		$all = self::campaigns();
		foreach ( $all as $existing ) {
			if ( strcasecmp( (string) $existing['code'], (string) $row['code'] ) === 0 ) {
				return new WP_Error( 'gateway_discounts_code_exists', __( 'این کد تخفیف قبلاً ثبت شده است.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
		}
		$all[] = $row;
		self::persist( $all );
		return new WP_REST_Response( array( 'item' => self::public_row( $row ) ), 201 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_update( WP_REST_Request $request ) {
		$id   = sanitize_key( (string) $request->get_param( 'id' ) );
		$body = $request->get_json_params();
		$body = is_array( $body ) ? $body : $request->get_params();
		$all  = self::campaigns();
		$found = null;
		foreach ( $all as $i => $existing ) {
			if ( (string) $existing['id'] === $id ) {
				$found = $i;
				break;
			}
		}
		if ( null === $found ) {
			return new WP_Error( 'gateway_discounts_not_found', __( 'این کد تخفیف پیدا نشد.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$merged = array_merge( $all[ $found ], is_array( $body ) ? $body : array() );
		$merged['id']         = $id;
		$merged['created_at'] = $all[ $found ]['created_at'];
		$row = self::normalize_campaign( $merged, false );
		if ( is_wp_error( $row ) ) {
			return $row;
		}
		foreach ( $all as $i => $existing ) {
			if ( $i !== $found && strcasecmp( (string) $existing['code'], (string) $row['code'] ) === 0 ) {
				return new WP_Error( 'gateway_discounts_code_exists', __( 'این کد تخفیف قبلاً ثبت شده است.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
		}
		$all[ $found ] = $row;
		self::persist( $all );
		return new WP_REST_Response( array( 'item' => self::public_row( $row ) ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_delete( WP_REST_Request $request ) {
		$id  = sanitize_key( (string) $request->get_param( 'id' ) );
		$all = self::campaigns();
		$kept = array();
		$found = false;
		foreach ( $all as $existing ) {
			if ( (string) $existing['id'] === $id ) {
				$found = true;
				continue;
			}
			$kept[] = $existing;
		}
		if ( ! $found ) {
			return new WP_Error( 'gateway_discounts_not_found', __( 'این کد تخفیف پیدا نشد.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		self::persist( $kept );
		return new WP_REST_Response( array( 'ok' => true ) );
	}

	/* =====================================================================
	 * Storefront banner
	 * =================================================================== */

	/**
	 * Build the banner markup (used by classic pages and by order-review fragments).
	 *
	 * @return string
	 */
	public static function banner_html() {
		$placeholder = '<div class="webino-gd" hidden></div>';
		if ( ! function_exists( 'WC' ) || ! WC()->cart || ! function_exists( 'wc_price' ) ) {
			return $placeholder;
		}
		$campaigns = self::active_campaigns();
		if ( ! $campaigns ) {
			return $placeholder;
		}
		$base    = self::base_amount();
		$is_rtl  = function_exists( 'is_rtl' ) ? is_rtl() : true;
		$dir     = $is_rtl ? 'rtl' : 'ltr';
		$uid     = 'webino-gd-' . wp_rand( 1000, 999999 );
		ob_start();
		?>
		<section class="webino-gd" dir="<?php echo esc_attr( $dir ); ?>" aria-labelledby="<?php echo esc_attr( $uid ); ?>">
			<span class="screen-reader-text" id="<?php echo esc_attr( $uid ); ?>"><?php echo esc_html__( 'تخفیف‌های درگاه پرداخت', 'webino-dashboard' ); ?></span>
			<?php foreach ( $campaigns as $c ) : ?>
				<?php
				$min        = (float) $c['min_amount'];
				$discount   = (float) $c['discount_amount'];
				$remaining  = max( 0.0, $min - $base );
				$reached    = $remaining <= 0.0001;
				$percent    = ( $min > 0 ) ? (int) min( 100, max( 0, round( $base / $min * 100 ) ) ) : 100;
				$end_ts     = ( '' !== $c['end_date'] ) ? strtotime( $c['end_date'] . ' 23:59:59' ) : false;
				$end_label  = $end_ts ? date_i18n( 'j F Y', (int) $end_ts ) : '';
				$code       = (string) $c['code'];
				$combine    = ! empty( $c['combine_with_site'] );
				$item_class = 'webino-gd__item' . ( $reached ? ' is-ready' : ' is-locked' );
				?>
				<div class="<?php echo esc_attr( $item_class ); ?>">
					<div class="webino-gd__main">
						<span class="webino-gd__gateway"><span class="webino-gd__gateway-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41L13.41 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"/><circle cx="7" cy="7" r="1.1" fill="currentColor" stroke="none"/></svg></span><?php echo esc_html( sprintf( /* translators: %s: gateway name */ __( 'تخفیف درگاه %s', 'webino-dashboard' ), $c['gateway'] ) ); ?></span>
						<?php if ( '' !== $c['title'] ) : ?>
							<span class="webino-gd__title"><?php echo esc_html( $c['title'] ); ?></span>
						<?php endif; ?>
						<span class="webino-gd__benefit"><?php echo wp_kses_post( wc_price( $discount ) ); ?> <?php echo esc_html__( 'تخفیف', 'webino-dashboard' ); ?></span>
						<?php if ( $min > 0 ) : ?>
							<span class="webino-gd__condition"><?php echo esc_html( sprintf( /* translators: %s: amount */ __( 'حداقل سبد خرید: %s', 'webino-dashboard' ), wp_strip_all_tags( wc_price( $min ) ) ) ); ?></span>
						<?php endif; ?>
						<?php if ( $reached ) : ?>
							<span class="webino-gd__status webino-gd__status--ready"><?php echo esc_html( sprintf( /* translators: %s: gateway name */ __( 'برای استفاده وارد درگاه %s شوید و کد تخفیفتان را وارد کنید.', 'webino-dashboard' ), $c['gateway'] ) ); ?></span>
							<?php if ( ! $combine ) : ?>
								<span class="webino-gd__status webino-gd__status--exclusive"><?php echo esc_html__( 'این کد همزمان با تخفیف سایت اعمال نمی‌شود؛ تخفیف سایت حذف شد.', 'webino-dashboard' ); ?></span>
							<?php endif; ?>
						<?php else : ?>
							<span class="webino-gd__status webino-gd__status--locked"><?php echo esc_html( sprintf( /* translators: %s: remaining amount */ __( '%s دیگر به سبدتان اضافه کنید تا این کد تخفیف را بگیرید.', 'webino-dashboard' ), wp_strip_all_tags( wc_price( $remaining ) ) ) ); ?></span>
							<span class="webino-gd__progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="<?php echo esc_attr( (string) $percent ); ?>"><span class="webino-gd__progress-bar" style="width: <?php echo esc_attr( (string) $percent ); ?>%"></span></span>
						<?php endif; ?>
						<?php if ( '' !== $end_label ) : ?>
							<span class="webino-gd__deadline"><?php echo esc_html( sprintf( /* translators: %s: date */ __( 'مهلت استفاده تا %s', 'webino-dashboard' ), $end_label ) ); ?></span>
						<?php endif; ?>
						<?php if ( '' !== $c['description'] ) : ?>
							<span class="webino-gd__desc"><?php echo esc_html( $c['description'] ); ?></span>
						<?php endif; ?>
					</div>
					<div class="webino-gd__side">
						<code class="webino-gd__code" dir="ltr"><?php echo esc_html( $code ); ?></code>
						<button type="button" class="webino-gd__copy" data-webino-gd-copy="<?php echo esc_attr( $code ); ?>"><?php echo esc_html__( 'کپی کد تخفیف', 'webino-dashboard' ); ?></button>
					</div>
				</div>
			<?php endforeach; ?>
		</section>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * @return void
	 */
	public static function render_banner() {
		// Never echo during AJAX/REST fragments calls (would corrupt JSON responses).
		if ( ( function_exists( 'wp_doing_ajax' ) && wp_doing_ajax() ) || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return;
		}
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in banner_html().
		echo self::banner_html();
	}

	/**
	 * @param array<string, string> $fragments Fragments.
	 * @return array<string, string>
	 */
	public static function order_review_fragments( $fragments ) {
		if ( ! is_array( $fragments ) ) {
			$fragments = array();
		}
		$fragments['.webino-gd'] = self::banner_html();
		return $fragments;
	}

	/* =====================================================================
	 * Exclusive mode — site coupon is replaced by the gateway code
	 * =================================================================== */

	/**
	 * @return void
	 */
	private static function notify_once( $key, $message ) {
		if ( ! function_exists( 'wc_add_notice' ) || ! function_exists( 'WC' ) ) {
			return;
		}
		if ( WC()->session ) {
			$shown = (array) WC()->session->get( 'webino_gd_notice', array() );
			if ( in_array( $key, $shown, true ) ) {
				return;
			}
			$shown[] = $key;
			WC()->session->set( 'webino_gd_notice', $shown );
		}
		wc_add_notice( $message, 'notice' );
	}

	/**
	 * Remove site coupons (gift coupons excepted) while an exclusive campaign is unlocked.
	 *
	 * @param WC_Cart $cart Cart.
	 * @return void
	 */
	public static function enforce_exclusive( $cart ) {
		if ( self::$exclusive_enforced || ! ( $cart instanceof WC_Cart ) ) {
			return;
		}
		if ( is_admin() && ! ( function_exists( 'wp_doing_ajax' ) && wp_doing_ajax() ) ) {
			return;
		}
		$exclusive = self::eligible_exclusive_campaigns();
		if ( ! $exclusive ) {
			return;
		}
		$removed = array();
		foreach ( $cart->get_applied_coupons() as $code ) {
			if ( class_exists( 'Webino_Dashboard_Coupon_Storefront' ) && Webino_Dashboard_Coupon_Storefront::is_gift_code( $code ) ) {
				continue;
			}
			++self::$exclusive_enforced;
			try {
				$cart->remove_coupon( $code );
				$removed[] = $code;
			} finally {
				--self::$exclusive_enforced;
			}
		}
		if ( $removed ) {
			$first = $exclusive[0];
			self::notify_once(
				'suppress_' . $first['id'],
				sprintf(
					/* translators: 1: coupon code removed (comma separated), 2: gateway code, 3: gateway name */
					__( 'تخفیف سایت (%1$s) حذف شد؛ این سفارش با کد تخفیف %2$s در درگاه %3$s قابل انجام است.', 'webino-dashboard' ),
					implode( '، ', $removed ),
					$first['code'],
					$first['gateway']
				)
			);
		}
	}

	/**
	 * Block applying new non-gift site coupons while an exclusive campaign is unlocked.
	 * Throwing an Exception is how WooCommerce turns a filter verdict into a coupon error.
	 *
	 * @param bool              $valid      Valid.
	 * @param WC_Coupon         $coupon     Coupon.
	 * @param WC_Discounts|null $discounts  Discounts context.
	 * @return bool
	 * @throws Exception When the site coupon may not be used.
	 */
	public static function filter_coupon_is_valid( $valid, $coupon, $discounts = null ) {
		if ( ! $valid || ! ( $coupon instanceof WC_Coupon ) ) {
			return $valid;
		}
		if ( 'webino_gift' === $coupon->get_discount_type() ) {
			return $valid; // Gifts are not a discount on price; they always stack.
		}
		$object = ( $discounts instanceof WC_Discounts ) ? $discounts->get_object() : null;
		if ( $object && ! ( $object instanceof WC_Cart ) ) {
			return $valid; // Admin order edits / order-pay: do not block.
		}
		$exclusive = self::eligible_exclusive_campaigns();
		if ( ! $exclusive ) {
			return $valid;
		}
		$first = $exclusive[0];
		throw new Exception(
			sprintf(
				/* translators: 1: gateway code, 2: gateway name */
				esc_html__( 'سایت برای این سفارش تخفیفی اعمال نمی‌کند؛ کد تخفیف %1$s را در درگاه %2$s استفاده کنید.', 'webino-dashboard' ),
				esc_html( $first['code'] ),
				esc_html( $first['gateway'] )
			)
		);
	}

	/**
	 * Defense in depth at checkout: no site coupon may ride along with an unlocked exclusive campaign.
	 *
	 * @param array     $data   Posted data.
	 * @param WP_Error  $errors Errors.
	 * @return void
	 */
	public static function validate_checkout( $data, $errors ) {
		unset( $data );
		if ( ! function_exists( 'WC' ) || ! WC()->cart || ! ( $errors instanceof WP_Error ) ) {
			return;
		}
		$exclusive = self::eligible_exclusive_campaigns();
		if ( ! $exclusive ) {
			return;
		}
		foreach ( WC()->cart->get_applied_coupons() as $code ) {
			if ( class_exists( 'Webino_Dashboard_Coupon_Storefront' ) && Webino_Dashboard_Coupon_Storefront::is_gift_code( $code ) ) {
				continue;
			}
			$first = $exclusive[0];
			$errors->add(
				'webino_gd_exclusive',
				sprintf(
					/* translators: 1: coupon code, 2: gateway code */
					__( 'کوپن %1$s با تخفیف درگاه اعمال نمی‌شود؛ آن را حذف کنید و از کد %2$s در درگاه استفاده کنید.', 'webino-dashboard' ),
					$code,
					$first['code']
				)
			);
		}
	}
}
