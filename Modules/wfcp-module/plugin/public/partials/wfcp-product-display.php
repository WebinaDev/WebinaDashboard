<?php
/**
 * Product pricing display template
 *
 * Select purchase method only — add-to-cart is handled by the theme/WC form.
 *
 * @package    WFCP
 * @subpackage WFCP/public/partials
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

global $product;

if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
	return;
}

$is_variable = $product->is_type( 'variable' );
$product_id  = $product->get_id();

$purchase_price = WFCP_Helper::get_product_purchase_price( $product_id );

if ( ! $purchase_price && $product->get_parent_id() ) {
	$purchase_price = WFCP_Helper::get_product_purchase_price( $product->get_parent_id() );
}

// Simple products still require a purchase price. Variable products always show the box
// with placeholders until a variation is selected (do not seed from first child).
if ( ! $purchase_price && ! $is_variable ) {
	return;
}

// For variable, do not show parent/child seed prices before selection.
$display_purchase = ( $is_variable ) ? 0 : $purchase_price;

$settings      = WFCP_Helper::get_settings();
$notifications = ( isset( $settings['notifications'] ) && is_array( $settings['notifications'] ) ) ? $settings['notifications'] : array();

if ( ! class_exists( 'WFCP_Gateway_Manager' ) ) {
	require_once WFCP_PLUGIN_DIR . 'includes/services/class-wfcp-gateway-manager.php';
}

$retail_price = $display_purchase ? WFCP_Calculator::calculate_price( $display_purchase, 'retail', $product_id ) : 0;

$partner_mode = class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::is_partner_shopping();
$show_wholesale_row = class_exists( 'WFCP_Wholesale_Partner', false ) && WFCP_Wholesale_Partner::current_sees_wholesale();
$wholesale_price = 0;
if ( $show_wholesale_row && $display_purchase ) {
	$wholesale_price = WFCP_Calculator::calculate_price( $display_purchase, 'wholesale', $product_id );
}

$wholesale_rules = class_exists( 'WFCP_Wholesale_Rules', false )
	? WFCP_Wholesale_Rules::for_product( $product_id, 0 )
	: array();
$wholesale_min_hint = '';
if ( $show_wholesale_row && is_array( $wholesale_rules ) ) {
	$min_q = isset( $wholesale_rules['min_qty'] ) ? (float) $wholesale_rules['min_qty'] : 0;
	$min_w = isset( $wholesale_rules['min_weight'] ) ? (float) $wholesale_rules['min_weight'] : 0;
	$parts = array();
	if ( $min_q > 0 ) {
		$parts[] = sprintf(
			/* translators: %s: min qty */
			__( 'از %s عدد', 'webina-woo-core' ),
			wc_format_decimal( $min_q )
		);
	}
	if ( $min_w > 0 ) {
		$unit    = function_exists( 'get_option' ) ? (string) get_option( 'woocommerce_weight_unit', 'kg' ) : 'kg';
		$parts[] = sprintf(
			/* translators: 1: min weight, 2: unit */
			__( 'از %1$s %2$s', 'webina-woo-core' ),
			wc_format_decimal( $min_w ),
			$unit
		);
	}
	$wholesale_min_hint = implode( ' / ', $parts );
}

$credit_enabled = WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'credit', 'enabled' ) );
$credit_price   = 0;
if ( $credit_enabled && $display_purchase ) {
	$credit_price = WFCP_Calculator::calculate_price( $display_purchase, 'credit', $product_id );
}

$installment_enabled = WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'installment', 'enabled' ) );
$installment_plans   = array();
$first_plan_months   = 0;
if ( $installment_enabled ) {
	$plans_config = WFCP_Helper::get_settings( 'installment', 'plans' );
	if ( is_array( $plans_config ) ) {
		foreach ( $plans_config as $plan ) {
			$months = isset( $plan['months'] ) ? intval( $plan['months'] ) : 0;
			if ( $months > 0 ) {
				$monthly_price = $display_purchase
					? WFCP_Calculator::calculate_price( $display_purchase, 'installment', $product_id, array( 'months' => $months ) )
					: 0;
				$installment_plans[] = array(
					'months'        => $months,
					'monthly_price' => $monthly_price,
					'total_price'   => $monthly_price * $months,
				);
				if ( ! $first_plan_months ) {
					$first_plan_months = $months;
				}
			}
		}
	}
}

$credit_text      = $notifications['credit_text'] ?? 'خرید اعتباری';
$installment_text = $notifications['installment_text'] ?? 'خرید اقساطی';

$available_gateways      = WFCP_Gateway_Manager::get_all_gateways();
$retail_gateway_ids      = WFCP_Gateway_Manager::get_selected_gateways( 'cash' );
$installment_gateway_ids = WFCP_Gateway_Manager::get_selected_gateways( 'installment' );
$credit_gateway_ids      = WFCP_Gateway_Manager::get_selected_gateways( 'credit' );
$wholesale_gateway_ids   = WFCP_Gateway_Manager::get_selected_gateways( 'wholesale' );

$selected_type = class_exists( 'WFCP_Cart_Manager' ) ? WFCP_Cart_Manager::get_default_purchase_type() : 'cash';
if ( $partner_mode ) {
	$selected_type = 'wholesale';
}
if ( 'credit' === $selected_type && ! $credit_enabled ) {
	$selected_type = 'cash';
}
if ( 'installment' === $selected_type && ( ! $installment_enabled || empty( $installment_plans ) ) ) {
	$selected_type = 'cash';
}
$pdp_theme    = class_exists( 'WFCP_Helper' ) ? WFCP_Helper::installment_pdp_theme() : 'classic';
$use_timeline = ( 'timeline' === $pdp_theme && ! $partner_mode && $installment_enabled && ! empty( $installment_plans ) );
$box_theme    = $use_timeline ? 'timeline' : 'classic';
if ( $use_timeline ) {
	$selected_type = 'installment';
}
$cash_active        = ( 'cash' === $selected_type ) && ! $partner_mode;
$installment_active = ( 'installment' === $selected_type ) && ! $partner_mode;
$credit_active      = ( 'credit' === $selected_type ) && ! $partner_mode;
$wholesale_active   = ( 'wholesale' === $selected_type );
$first_due_labels   = $first_plan_months > 0 ? WFCP_Helper::installment_due_labels( $first_plan_months ) : array();
$first_monthly      = ! empty( $installment_plans[0]['monthly_price'] ) ? (float) $installment_plans[0]['monthly_price'] : 0;
?>

<div
	class="wfcp-pricing-box wfcp-theme-<?php echo esc_attr( $box_theme ); ?>"
	data-product-id="<?php echo esc_attr( $product_id ); ?>"
	data-selected-type="<?php echo esc_attr( $selected_type ); ?>"
	data-selected-months="<?php echo esc_attr( $first_plan_months ); ?>"
	data-pdp-theme="<?php echo esc_attr( $box_theme ); ?>"
	<?php echo $is_variable ? 'data-is-variable="1"' : ''; ?>
>
	<?php if ( ! $use_timeline ) : ?>
		<p class="wfcp-method-hint"><?php echo $partner_mode
			? esc_html__( 'قیمت خرد و عمده برای حساب همکار نمایش داده می‌شود؛ خرید با قیمت عمده است.', 'webina-woo-core' )
			: esc_html__( 'روش پرداخت را انتخاب کنید، سپس از دکمه افزودن به سبد استفاده کنید.', 'webina-woo-core' ); ?></p>
	<?php endif; ?>

	<?php if ( $is_variable ) : ?>
		<div class="wfcp-variation-note"><?php esc_html_e( 'رنگ یا سایز را انتخاب کنید تا قیمت‌ها به‌روز شوند.', 'webina-woo-core' ); ?></div>
	<?php endif; ?>

	<?php if ( $show_wholesale_row && ! $use_timeline ) : ?>
		<div class="wfcp-pricing-row wholesale<?php echo $wholesale_active ? ' active' : ''; ?>" data-purchase-type="wholesale" role="button" tabindex="0" aria-pressed="<?php echo $wholesale_active ? 'true' : 'false'; ?>">
			<div class="wfcp-pricing-info">
				<div class="wfcp-pricing-icon">📦</div>
				<div class="wfcp-pricing-details">
					<h3 class="wfcp-pricing-title"><?php esc_html_e( 'خرید عمده', 'webina-woo-core' ); ?></h3>
					<p class="wfcp-pricing-amount"><?php echo $wholesale_price > 0 ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $wholesale_price ) ) : esc_html__( '—', 'webina-woo-core' ); ?></p>
					<?php if ( $wholesale_min_hint ) : ?>
						<p class="wfcp-pricing-description"><?php echo esc_html( $wholesale_min_hint ); ?></p>
					<?php endif; ?>
					<?php if ( ! empty( $notifications['wholesale_description'] ) ) : ?>
						<div class="wfcp-pricing-description"><?php echo wp_kses_post( $notifications['wholesale_description'] ); ?></div>
					<?php endif; ?>
					<span class="wfcp-label-pill"><?php esc_html_e( 'عمده', 'webina-woo-core' ); ?></span>
					<?php WFCP_Gateway_Manager::render_badges( $wholesale_gateway_ids, $available_gateways ); ?>
				</div>
			</div>
		</div>
	<?php endif; ?>

	<?php if ( ! $use_timeline ) : ?>
		<!-- Cash Row -->
		<div class="wfcp-pricing-row cash<?php echo $cash_active ? ' active' : ''; ?>" data-purchase-type="cash" role="button" tabindex="0" aria-pressed="<?php echo $cash_active ? 'true' : 'false'; ?>">
			<div class="wfcp-pricing-info">
				<div class="wfcp-pricing-icon">💵</div>
				<div class="wfcp-pricing-details">
					<h3 class="wfcp-pricing-title"><?php esc_html_e( 'خرید نقدی', 'webina-woo-core' ); ?></h3>
					<p class="wfcp-pricing-amount"><?php echo $retail_price > 0 ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $retail_price ) ) : esc_html__( '—', 'webina-woo-core' ); ?></p>
					<?php if ( ! empty( $notifications['cash_description'] ) ) : ?>
						<div class="wfcp-pricing-description"><?php echo wp_kses_post( $notifications['cash_description'] ); ?></div>
					<?php endif; ?>
					<?php if ( ! empty( $notifications['need_review'] ) ) : ?>
						<span class="wfcp-label-pill alert"><?php echo esc_html( $notifications['need_review'] ); ?></span>
					<?php endif; ?>
					<?php if ( ! isset( $notifications['show_cash_badge'] ) || WFCP_Helper::to_bool( $notifications['show_cash_badge'] ) ) : ?>
						<span class="wfcp-label-pill"><?php echo esc_html( $notifications['custom_cash_label'] ?: 'نقدی' ); ?></span>
					<?php endif; ?>
					<?php WFCP_Gateway_Manager::render_badges( $retail_gateway_ids, $available_gateways ); ?>
				</div>
			</div>
		</div>
	<?php endif; ?>

	<?php if ( ! $partner_mode && $installment_enabled && ! empty( $installment_plans ) ) : ?>
		<div class="wfcp-pricing-row installment<?php echo $installment_active ? ' active' : ''; ?>" data-purchase-type="installment" data-months="<?php echo esc_attr( $first_plan_months ); ?>" role="button" tabindex="0" aria-pressed="<?php echo $installment_active ? 'true' : 'false'; ?>">
			<div class="wfcp-pricing-info">
				<div class="wfcp-pricing-icon">📅</div>
				<div class="wfcp-pricing-details">
					<h3 class="wfcp-pricing-title"><?php echo esc_html( $installment_text ); ?></h3>
					<div class="wfcp-installment-plans-list<?php echo count( $installment_plans ) < 2 ? ' is-single' : ''; ?>">
						<?php foreach ( $installment_plans as $index => $plan ) : ?>
							<?php
							$due_labels = WFCP_Helper::installment_due_labels( (int) $plan['months'] );
							$plan_fmt   = $plan['monthly_price'] > 0
								? WFCP_Helper::format_price_with_irt_symbol( $plan['monthly_price'] )
								: '';
							?>
							<div
								class="wfcp-installment-plan-item <?php echo 0 === $index ? 'active' : ''; ?>"
								data-months="<?php echo esc_attr( $plan['months'] ); ?>"
								data-dates="<?php echo esc_attr( wp_json_encode( $due_labels ) ); ?>"
								data-monthly="<?php echo esc_attr( wp_kses_post( $plan_fmt ) ); ?>"
							>
								<span class="wfcp-installment-plan-months"><?php printf( esc_html__( '%d ماهه', 'webina-woo-core' ), $plan['months'] ); ?></span>
								<span class="wfcp-installment-plan-price"><?php
									if ( $plan['monthly_price'] > 0 ) {
										printf( esc_html__( 'هر قسط %s', 'webina-woo-core' ), wp_kses_post( $plan_fmt ) );
									} else {
										echo esc_html__( 'هر قسط —', 'webina-woo-core' );
									}
								?></span>
							</div>
						<?php endforeach; ?>
					</div>
					<?php if ( $use_timeline ) : ?>
						<div class="wfcp-timeline-head">
							<p class="wfcp-timeline-headline"><?php
								printf(
									/* translators: %d: installment count */
									esc_html__( 'جیبت رو الان خالی نکن؛ %d قسطه بخر!', 'webina-woo-core' ),
									(int) $first_plan_months
								);
							?></p>
							<p class="wfcp-timeline-monthly"><?php
								if ( $first_monthly > 0 ) {
									printf(
										esc_html__( 'هر قسط: %s', 'webina-woo-core' ),
										wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $first_monthly ) )
									);
								} else {
									echo esc_html__( 'هر قسط: —', 'webina-woo-core' );
								}
							?></p>
						</div>
						<div class="wfcp-timeline-track" style="--wfcp-timeline-count: <?php echo (int) max( 1, count( $first_due_labels ) ); ?>">
							<span class="wfcp-timeline-line" aria-hidden="true"></span>
							<ol class="wfcp-timeline-dates">
								<?php foreach ( $first_due_labels as $due_index => $due ) : ?>
									<li class="<?php echo 0 === (int) $due_index ? 'is-today' : 'is-future'; ?>">
										<span class="wfcp-timeline-dot" aria-hidden="true"></span>
										<span class="wfcp-timeline-date"><?php echo esc_html( $due ); ?></span>
									</li>
								<?php endforeach; ?>
							</ol>
						</div>
					<?php endif; ?>
					<?php if ( ! empty( $notifications['installment_description'] ) ) : ?>
						<div class="wfcp-pricing-description"><?php echo wp_kses_post( $notifications['installment_description'] ); ?></div>
					<?php endif; ?>
					<span class="wfcp-label-pill">اقساطی</span>
					<?php WFCP_Gateway_Manager::render_badges( $installment_gateway_ids, $available_gateways, true ); ?>
					<?php if ( $use_timeline ) : ?>
						<button type="button" class="wfcp-btn-add wfcp-timeline-atc">
							<?php
							$inst_texts = WFCP_Helper::get_settings( 'installment', 'texts' );
							echo esc_html(
								( is_array( $inst_texts ) && ! empty( $inst_texts['button_text'] ) )
									? $inst_texts['button_text']
									: __( 'افزودن به سبد خرید', 'webina-woo-core' )
							);
							?>
						</button>
					<?php endif; ?>
				</div>
			</div>
		</div>
	<?php endif; ?>

	<?php if ( ! $use_timeline && ! $partner_mode && $credit_enabled ) : ?>
		<div class="wfcp-pricing-row credit<?php echo $credit_active ? ' active' : ''; ?>" data-purchase-type="credit" role="button" tabindex="0" aria-pressed="<?php echo $credit_active ? 'true' : 'false'; ?>">
			<div class="wfcp-pricing-info">
				<div class="wfcp-pricing-icon">💳</div>
				<div class="wfcp-pricing-details">
					<h3 class="wfcp-pricing-title"><?php echo esc_html( $credit_text ); ?></h3>
					<p class="wfcp-pricing-amount"><?php echo $credit_price > 0 ? wp_kses_post( WFCP_Helper::format_price_with_irt_symbol( $credit_price ) ) : esc_html__( '—', 'webina-woo-core' ); ?></p>
					<?php if ( ! empty( $notifications['credit_description'] ) ) : ?>
						<div class="wfcp-pricing-description"><?php echo wp_kses_post( $notifications['credit_description'] ); ?></div>
					<?php endif; ?>
					<span class="wfcp-label-pill">اعتباری</span>
					<?php WFCP_Gateway_Manager::render_badges( $credit_gateway_ids, $available_gateways ); ?>
				</div>
			</div>
		</div>
	<?php endif; ?>
</div>
