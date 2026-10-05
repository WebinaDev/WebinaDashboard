<?php
/**
 * Grouped subcart summary on cart page.
 *
 * @package WFCP
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( empty( $groups ) || ! is_array( $groups ) ) {
	return;
}
?>

<div class="wfcp-subcarts">
	<h2 class="wfcp-subcarts__title"><?php esc_html_e( 'سبدهای خرید بر اساس روش پرداخت', 'webina-woo-core' ); ?></h2>
	<?php if ( count( $groups ) > 1 ) : ?>
		<p class="wfcp-subcarts__hint"><?php esc_html_e( 'هر روش پرداخت جداگانه تسویه می‌شود. پس از پرداخت یک سبد، سایر سبدهای شما در سبد خرید باقی می‌مانند.', 'webina-woo-core' ); ?></p>
	<?php else : ?>
		<p class="wfcp-subcarts__hint"><?php esc_html_e( 'برای تسویه این سبد از دکمه زیر استفاده کنید.', 'webina-woo-core' ); ?></p>
	<?php endif; ?>

	<?php foreach ( $groups as $type => $group ) : ?>
		<div class="wfcp-subcart wfcp-subcart--<?php echo esc_attr( $type ); ?>">
			<div class="wfcp-subcart__header">
				<h3 class="wfcp-subcart__label"><?php echo esc_html( $group['label'] ); ?></h3>
				<span class="wfcp-subcart__subtotal"><?php echo wp_kses_post( wc_price( $group['subtotal'] ) ); ?></span>
			</div>
			<ul class="wfcp-subcart__items">
				<?php foreach ( $group['items'] as $cart_item ) : ?>
					<?php
					$product = isset( $cart_item['data'] ) ? $cart_item['data'] : null;
					if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
						continue;
					}
					?>
					<li>
						<span class="wfcp-subcart__item-name"><?php echo esc_html( $product->get_name() ); ?></span>
						<span class="wfcp-subcart__item-qty">&times; <?php echo esc_html( (string) ( $cart_item['quantity'] ?? 1 ) ); ?></span>
					</li>
				<?php endforeach; ?>
			</ul>
			<a class="button wfcp-subcart__checkout" href="<?php echo esc_url( WFCP_Multi_Cart::get_subcart_checkout_url( $type ) ); ?>">
				<?php
				printf(
					/* translators: %s: purchase type label */
					esc_html__( 'تسویه %s', 'webina-woo-core' ),
					esc_html( $group['label'] )
				);
				?>
			</a>
		</div>
	<?php endforeach; ?>
</div>
