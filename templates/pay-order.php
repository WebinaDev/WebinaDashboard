<?php
/**
 * Customer payment page for POS pay-link orders.
 *
 * @package WebinoDashboard
 *
 * @var WC_Order $order
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$allowed_types = Webino_Dashboard_Pay_Order::allowed_purchase_types( $order );
$current_type  = sanitize_key( (string) $order->get_meta( '_wfcp_purchase_type' ) );
if ( ! in_array( $current_type, array( 'retail', 'credit' ), true ) ) {
	$current_type = $allowed_types[0] ?? 'retail';
}
$gateways = WC()->payment_gateways()->get_available_payment_gateways();
$notices  = function_exists( 'wc_print_notices' ) ? wc_print_notices( true ) : '';

?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title><?php echo esc_html( sprintf( __( 'Pay order #%s', 'webino-dashboard' ), $order->get_order_number() ) ); ?></title>
	<?php wp_head(); ?>
	<style>
		body { font-family: system-ui, -apple-system, sans-serif; background: #f6f7f8; color: #111; margin: 0; padding: 1.5rem; }
		.wrap { max-width: 720px; margin: 0 auto; }
		.card { background: #fff; border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
		h1 { font-size: 1.35rem; margin: 0 0 .5rem; }
		.muted { color: #666; font-size: .9rem; }
		table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
		th, td { text-align: start; padding: .5rem 0; border-bottom: 1px solid #eee; }
		.total { font-weight: 700; font-size: 1.1rem; }
		.gateway { display: block; padding: .75rem; border: 1px solid #ddd; border-radius: 8px; margin-bottom: .5rem; cursor: pointer; }
		.gateway input { margin-inline-end: .5rem; }
		.btn { display: inline-block; background: #111; color: #fff; border: 0; border-radius: 8px; padding: .75rem 1.25rem; font-size: 1rem; cursor: pointer; }
		.type-switch { display: flex; gap: .5rem; flex-wrap: wrap; margin-top: .75rem; }
		.type-switch button { border: 1px solid #ccc; background: #fff; border-radius: 999px; padding: .4rem .9rem; cursor: pointer; }
		.type-switch button.active { background: #111; color: #fff; border-color: #111; }
		.notices { margin-bottom: 1rem; }
	</style>
</head>
<body>
<div class="wrap">
	<div class="card">
		<h1><?php echo esc_html( sprintf( __( 'Order #%s', 'webino-dashboard' ), $order->get_order_number() ) ); ?></h1>
		<p class="muted"><?php echo esc_html( trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() ) ); ?></p>
		<?php if ( $order->get_billing_phone() ) : ?>
			<p class="muted"><?php echo esc_html( $order->get_billing_phone() ); ?></p>
		<?php endif; ?>

		<?php if ( count( $allowed_types ) > 1 ) : ?>
			<form method="post" class="type-switch">
				<?php wp_nonce_field( 'webino_pay_order_' . $order->get_id() ); ?>
				<input type="hidden" name="webino_pay_purchase_type" id="webino_pay_purchase_type" value="<?php echo esc_attr( $current_type ); ?>" />
				<button type="submit" class="<?php echo 'retail' === $current_type ? 'active' : ''; ?>" onclick="document.getElementById('webino_pay_purchase_type').value='retail';">
					<?php esc_html_e( 'Cash', 'webino-dashboard' ); ?>
				</button>
				<button type="submit" class="<?php echo 'credit' === $current_type ? 'active' : ''; ?>" onclick="document.getElementById('webino_pay_purchase_type').value='credit';">
					<?php esc_html_e( 'Installment', 'webino-dashboard' ); ?>
				</button>
			</form>
		<?php endif; ?>

		<table>
			<thead>
				<tr>
					<th><?php esc_html_e( 'Product', 'webino-dashboard' ); ?></th>
					<th><?php esc_html_e( 'Qty', 'webino-dashboard' ); ?></th>
					<th><?php esc_html_e( 'Total', 'webino-dashboard' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( $order->get_items() as $item ) : ?>
					<?php if ( ! $item instanceof WC_Order_Item_Product ) { continue; } ?>
					<tr>
						<td><?php echo esc_html( $item->get_name() ); ?></td>
						<td><?php echo esc_html( (string) $item->get_quantity() ); ?></td>
						<td><?php echo wp_kses_post( wc_price( $item->get_total() ) ); ?></td>
					</tr>
				<?php endforeach; ?>
				<?php if ( (float) $order->get_shipping_total() > 0 ) : ?>
					<tr>
						<td colspan="2"><?php esc_html_e( 'Shipping', 'webino-dashboard' ); ?></td>
						<td><?php echo wp_kses_post( wc_price( $order->get_shipping_total() ) ); ?></td>
					</tr>
				<?php endif; ?>
				<tr>
					<td colspan="2" class="total"><?php esc_html_e( 'Order total', 'webino-dashboard' ); ?></td>
					<td class="total"><?php echo wp_kses_post( $order->get_formatted_order_total() ); ?></td>
				</tr>
			</tbody>
		</table>
	</div>

	<?php if ( $notices ) : ?>
		<div class="notices card"><?php echo $notices; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
	<?php endif; ?>

	<?php if ( $order->needs_payment() && $gateways ) : ?>
		<div class="card">
			<h2 style="margin-top:0;font-size:1.1rem;"><?php esc_html_e( 'Payment method', 'webino-dashboard' ); ?></h2>
			<form method="post">
				<?php foreach ( $gateways as $gateway ) : ?>
					<label class="gateway">
						<input type="radio" name="payment_method" value="<?php echo esc_attr( $gateway->id ); ?>" required />
						<strong><?php echo esc_html( $gateway->get_title() ); ?></strong>
						<?php if ( $gateway->get_description() ) : ?>
							<div class="muted"><?php echo wp_kses_post( $gateway->get_description() ); ?></div>
						<?php endif; ?>
					</label>
				<?php endforeach; ?>
				<p><button type="submit" class="btn"><?php esc_html_e( 'Pay now', 'webino-dashboard' ); ?></button></p>
			</form>
		</div>
	<?php elseif ( ! $order->needs_payment() ) : ?>
		<div class="card">
			<p><?php esc_html_e( 'This order has already been paid.', 'webino-dashboard' ); ?></p>
		</div>
	<?php else : ?>
		<div class="card">
			<p><?php esc_html_e( 'No payment methods are available.', 'webino-dashboard' ); ?></p>
		</div>
	<?php endif; ?>
</div>
<?php wp_footer(); ?>
</body>
</html>
