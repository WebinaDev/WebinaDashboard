<?php
/**
 * Printable HTML order documents (Parisma-style templates).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders invoice, postal label, and receipt HTML.
 */
class Webino_Dashboard_Order_Documents {

	/**
	 * @var string
	 */
	private static $render_locale = '';

	/**
	 * @param WC_Order $order Order.
	 * @param string   $type invoice|label|receipt.
	 * @param string   $locale Optional dashboard locale.
	 * @return string
	 */
	public static function render( $order, $type, $locale = null ) {
		self::$render_locale = Webino_Dashboard_Locale::resolve_locale( $locale );
		switch ( $type ) {
			case 'label':
				return self::render_label( $order );
			case 'receipt':
				return self::render_receipt( $order );
			case 'invoice':
			default:
				return self::render_invoice( $order );
		}
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function doc_config() {
		$jalali = Webino_Dashboard_Locale::is_jalali_locale( self::$render_locale );
		return array(
			'lang'              => $jalali ? 'fa' : 'en',
			'dir'               => $jalali ? 'rtl' : 'ltr',
			'font_family'       => $jalali ? 'yekanbakh, Tahoma, sans-serif' : 'system-ui, -apple-system, Segoe UI, sans-serif',
			'include_font_face' => $jalali,
		);
	}

	/**
	 * @param array<string, string> $parts Address parts.
	 * @return string
	 */
	private static function address_summary( $parts ) {
		$sep = Webino_Dashboard_Locale::list_separator( self::$render_locale );
		return trim(
			implode(
				$sep,
				array_filter(
					array(
						$parts['state_label'] ?? '',
						$parts['city'] ?? '',
						$parts['address'] ?? '',
					)
				)
			),
			$sep
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function settings() {
		return Webino_Dashboard_Order_Document_Settings::get();
	}

	/**
	 * @return string
	 */
	private static function font_face_css() {
		$base = WEBINO_DASHBOARD_URL . 'assets/fonts/yekan-bakh/woff2/';
		return "
		@font-face { font-family: yekanbakh; font-style: normal; font-weight: 700; src: url('{$base}YekanBakh-Bold.woff2') format('woff2'); }
		@font-face { font-family: yekanbakh; font-style: normal; font-weight: 500; src: url('{$base}YekanBakh-Medium.woff2') format('woff2'); }
		@font-face { font-family: yekanbakh; font-style: normal; font-weight: 400; src: url('{$base}YekanBakh-Regular.woff2') format('woff2'); }
		";
	}

	/**
	 * @param array<string, mixed> $s Settings.
	 * @return string
	 */
	private static function shared_styles( $s, $config = null ) {
		if ( null === $config ) {
			$config = self::doc_config();
		}
		$accent = esc_attr( $s['accent_color'] );
		$dir    = esc_attr( (string) ( $config['dir'] ?? 'rtl' ) );
		$font   = esc_attr( (string) ( $config['font_family'] ?? 'yekanbakh, Tahoma, sans-serif' ) );
		$faces  = ! empty( $config['include_font_face'] ) ? self::font_face_css() : '';
		return $faces . "
		:root {
			--border-color: #e5e7eb;
			--border-radius: 12px;
			--border-radius-sm: 8px;
			--bg-light: #f9fafb;
			--bg-lighter: #f3f4f6;
			--text-dark: #374151;
			--text-medium: #6b7280;
			--accent-color: {$accent};
			--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
		}
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body { direction: {$dir}; font-family: {$font}; padding: 15px; background: #fff; color: var(--text-dark); line-height: 1.6; }
		h1,h2,h3 { font-weight: 700; color: var(--text-dark); }
		.print-btn, .print-button { display: inline-block; margin: 20px auto; padding: 12px 24px; background: var(--accent-color); color: #fff; border: none; border-radius: var(--border-radius); cursor: pointer; text-decoration: none; font-size: 14px; font-weight: 600; }
		@media print { .print-btn, .print-button, .no-print { display: none !important; } body { padding: 0; } }
		" . ( class_exists( 'Webino_Dashboard_Currency' ) ? Webino_Dashboard_Currency::icon_styles() : '' );
	}

	/**
	 * @param WC_Order $order Order.
	 * @param float    $amount Amount.
	 * @return string
	 */
	private static function price_html( $order, $amount ) {
		if ( class_exists( 'Webino_Dashboard_Currency' ) ) {
			return Webino_Dashboard_Currency::format_order_amount( $amount, $order );
		}
		return esc_html( wc_price( $amount, array( 'currency' => $order->get_currency() ) ) );
	}

	/**
	 * @param string $text Barcode text.
	 * @return string
	 */
	private static function barcode_data_uri( $text ) {
		if ( class_exists( 'Webino_Dashboard_Barcode' ) ) {
			return Webino_Dashboard_Barcode::svg_data_uri( $text );
		}
		return '';
	}

	/**
	 * @param WC_Order $order Order.
	 * @return string
	 */
	private static function format_order_datetime( $order ) {
		return Webino_Dashboard_Locale::format_order_datetime( $order->get_date_created(), self::$render_locale );
	}

	/**
	 * Escaped display text with locale-aware digits for print HTML.
	 *
	 * @param string $s Raw value.
	 * @return string
	 */
	private static function display_num( $s ) {
		return esc_html( Webino_Dashboard_Locale::localize_display( (string) $s, self::$render_locale ) );
	}

	/**
	 * @param WC_Order $order Order.
	 * @param string   $type billing|shipping.
	 * @return array<string, string>
	 */
	private static function address_parts( $order, $type ) {
		return Webino_Dashboard_Orders::format_address_parts( $order, $type );
	}

	/**
	 * @param array<string, string> $p Address parts.
	 * @param bool                  $include_email Include email line.
	 * @return string
	 */
	private static function address_html( $p, $include_email = false ) {
		$lines = array();
		if ( ! empty( $p['name'] ) ) {
			$lines[] = '<strong>' . esc_html__( 'Name', 'webino-dashboard' ) . ':</strong> ' . esc_html( $p['name'] );
		}
		if ( ! empty( $p['state_label'] ) ) {
			$lines[] = '<strong>' . esc_html__( 'State', 'webino-dashboard' ) . ':</strong> ' . esc_html( $p['state_label'] );
		}
		if ( ! empty( $p['city'] ) ) {
			$lines[] = '<strong>' . esc_html__( 'City', 'webino-dashboard' ) . ':</strong> ' . esc_html( $p['city'] );
		}
		if ( ! empty( $p['postcode'] ) ) {
			$lines[] = '<strong>' . esc_html__( 'Postcode', 'webino-dashboard' ) . ':</strong> ' . self::display_num( $p['postcode'] );
		}
		if ( ! empty( $p['address'] ) ) {
			$lines[] = '<strong>' . esc_html__( 'Address', 'webino-dashboard' ) . ':</strong> ' . esc_html( $p['address'] );
		}
		if ( ! empty( $p['phone'] ) ) {
			$lines[] = '<strong>' . esc_html__( 'Phone', 'webino-dashboard' ) . ':</strong> ' . self::display_num( $p['phone'] );
		}
		if ( $include_email && ! empty( $p['email'] ) ) {
			$lines[] = '<strong>' . esc_html__( 'Email', 'webino-dashboard' ) . ':</strong> ' . esc_html( $p['email'] );
		}
		return implode( '<br>', $lines );
	}

	/**
	 * @param array<string, mixed> $s Settings.
	 * @return string
	 */
	private static function sender_html( $s ) {
		$lines = array();
		$lines[] = '<strong>' . esc_html__( 'Seller', 'webino-dashboard' ) . ':</strong> ' . esc_html( $s['sender_name'] );
		if ( ! empty( $s['sender_address'] ) ) {
			$lines[] = '<strong>' . esc_html__( 'Address', 'webino-dashboard' ) . ':</strong> ' . esc_html( $s['sender_address'] );
		}
		if ( ! empty( $s['sender_postcode'] ) ) {
			$lines[] = '<strong>' . esc_html__( 'Postcode', 'webino-dashboard' ) . ':</strong> ' . self::display_num( $s['sender_postcode'] );
		}
		if ( ! empty( $s['sender_phone'] ) ) {
			$lines[] = '<strong>' . esc_html__( 'Phone', 'webino-dashboard' ) . ':</strong> ' . self::display_num( $s['sender_phone'] );
		}
		if ( ! empty( $s['sender_email'] ) ) {
			$lines[] = '<strong>' . esc_html__( 'Email', 'webino-dashboard' ) . ':</strong> ' . esc_html( $s['sender_email'] );
		}
		return implode( '<br>', $lines );
	}

	/**
	 * @param array<string, mixed> $s Settings.
	 * @param string               $number Order number.
	 * @return string
	 */
	private static function logo_barcode_block( $s, $number, $show_barcode = true ) {
		$html = '';
		if ( ! empty( $s['logo_url'] ) ) {
			$html .= '<img src="' . esc_url( $s['logo_url'] ) . '" style="height:45px;width:auto;" alt="" />';
		}
		if ( $show_barcode ) {
			$uri = self::barcode_data_uri( $number );
			if ( $uri ) {
				$html .= '<img class="invoice-barcode" src="' . esc_attr( $uri ) . '" alt="' . esc_attr__( 'Barcode', 'webino-dashboard' ) . '" style="max-width:120px;margin-top:8px;" />';
			}
		}
		return $html;
	}

	/**
	 * @param WC_Order $order Order.
	 * @param array<string, mixed> $s Settings.
	 * @return string
	 */
	private static function item_rows_invoice( $order, $s ) {
		$html = '';
		$row  = 0;
		foreach ( $order->get_items() as $item ) {
			++$row;
			$product = $item->get_product();
			$qty     = $item->get_quantity();
			$unit    = $qty > 0 ? (float) $item->get_subtotal() / $qty : 0;
			$sku     = $product && is_callable( array( $product, 'get_sku' ) ) ? $product->get_sku() : '';
			$html   .= '<tr>';
			$html   .= '<td>' . self::display_num( (string) $row ) . '</td>';
			if ( ! empty( $s['invoice_show_product_image'] ) && $product ) {
				$img = wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' );
				$html .= '<td>' . ( $img ? '<img style="width:80px;height:80px;object-fit:cover;" src="' . esc_url( $img ) . '" alt="" />' : '—' ) . '</td>';
			}
			if ( ! empty( $s['invoice_show_sku'] ) ) {
				$html .= '<td>' . ( $sku ? self::display_num( $sku ) : '—' ) . '</td>';
			}
			$html .= '<td>' . esc_html( $item->get_name() ) . '</td>';
			$html .= '<td>' . self::display_num( (string) $qty ) . '</td>';
			$html .= '<td>' . wp_kses_post( self::price_html( $order, $unit ) ) . '</td>';
			$html .= '<td>' . wp_kses_post( self::price_html( $order, $item->get_total() ) ) . '</td>';
			$html .= '</tr>';
		}
		return $html;
	}

	/**
	 * @param WC_Order $order Order.
	 * @return string
	 */
	private static function render_invoice( $order ) {
		$s        = self::settings();
		$config   = self::doc_config();
		$number   = $order->get_order_number();
		$num_disp = Webino_Dashboard_Locale::localize_display( (string) $number, self::$render_locale );
		$date    = self::format_order_datetime( $order );
		$ship    = self::address_parts( $order, 'shipping' );
		$method  = Webino_Dashboard_Orders::get_shipping_method_title( $order );
		$show_img = ! empty( $s['invoice_show_product_image'] );
		$show_sku = ! empty( $s['invoice_show_sku'] );

		ob_start();
		?>
<!DOCTYPE html>
<html lang="<?php echo esc_attr( (string) $config['lang'] ); ?>" dir="<?php echo esc_attr( (string) $config['dir'] ); ?>">
<head>
	<meta charset="utf-8" />
	<title><?php echo esc_html( sprintf( __( 'Invoice #%s', 'webino-dashboard' ), $num_disp ) ); ?></title>
	<style>
		<?php echo self::shared_styles( $s, $config ); // phpcs:ignore ?>
		.invoice-box { max-width: 1500px; border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 20px; margin: 0 auto; }
		.invoice-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; border-bottom: 2px solid var(--border-color); margin-bottom: 20px; }
		.invoice-header h2 { font-size: 22px; }
		.invoice-details table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
		.invoice-details th, .invoice-details td { border: 1px solid var(--border-color); padding: 12px; text-align: start; font-size: 14px; }
		.invoice-details th { background: var(--bg-light); font-weight: 600; }
		.total-section table { width: 100%; max-width: 400px; margin-inline-start: auto; margin-top: 20px; }
		.total-section td { padding: 8px 0; border: none; }
		.total-section td:last-child { text-align: end; font-weight: 600; }
		.footer { text-align: center; margin-top: 25px; padding-top: 20px; border-top: 2px solid var(--border-color); color: var(--text-medium); }
		.barcode { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
	</style>
</head>
<body onload="window.print()">
<div class="invoice-box">
	<div class="invoice-header">
		<div>
			<h2><?php esc_html_e( 'Invoice', 'webino-dashboard' ); ?></h2>
			<p><?php echo esc_html( sprintf( __( 'Order #%s', 'webino-dashboard' ), $num_disp ) ); ?></p>
			<p><?php echo esc_html( sprintf( __( 'Order date: %s', 'webino-dashboard' ), $date ) ); ?></p>
			<?php if ( ! empty( $s['invoice_show_status'] ) ) : ?>
				<p><?php echo esc_html( sprintf( __( 'Status: %s', 'webino-dashboard' ), wc_get_order_status_name( $order->get_status() ) ) ); ?></p>
			<?php endif; ?>
		</div>
		<div class="barcode"><?php echo self::logo_barcode_block( $s, $number, ! empty( $s['invoice_show_barcode'] ) ); // phpcs:ignore ?></div>
	</div>
	<div class="invoice-details">
		<table>
			<tr><th><?php esc_html_e( 'Seller', 'webino-dashboard' ); ?></th><th><?php esc_html_e( 'Recipient', 'webino-dashboard' ); ?></th></tr>
			<tr>
				<td><?php echo self::sender_html( $s ); // phpcs:ignore ?></td>
				<td>
					<?php echo esc_html__( 'Buyer', 'webino-dashboard' ) . ': ' . esc_html( $ship['name'] ); ?><br>
					<?php
					if ( $ship['state_label'] || $ship['city'] || $ship['postcode'] ) {
						echo esc_html(
							trim(
								sprintf(
									/* translators: 1: state 2: city 3: postcode */
									__( 'State: %1$s, City: %2$s, Postcode: %3$s', 'webino-dashboard' ),
									$ship['state_label'],
									$ship['city'],
									Webino_Dashboard_Locale::localize_display( (string) $ship['postcode'], self::$render_locale )
								)
							)
						);
						echo '<br>';
					}
					?>
					<?php echo esc_html__( 'Address', 'webino-dashboard' ) . ': ' . esc_html( $ship['address'] ); ?><br>
					<?php if ( $ship['phone'] ) : ?>
						<?php echo esc_html__( 'Phone', 'webino-dashboard' ) . ': ' . self::display_num( $ship['phone'] ); ?>
					<?php endif; ?>
				</td>
			</tr>
		</table>
	</div>
	<div class="invoice-details">
		<table>
			<thead>
				<tr>
					<th><?php esc_html_e( 'Row', 'webino-dashboard' ); ?></th>
					<?php if ( $show_img ) : ?><th><?php esc_html_e( 'Image', 'webino-dashboard' ); ?></th><?php endif; ?>
					<?php if ( $show_sku ) : ?><th><?php esc_html_e( 'SKU', 'webino-dashboard' ); ?></th><?php endif; ?>
					<th><?php esc_html_e( 'Description', 'webino-dashboard' ); ?></th>
					<th><?php esc_html_e( 'Qty', 'webino-dashboard' ); ?></th>
					<th><?php esc_html_e( 'Unit price', 'webino-dashboard' ); ?></th>
					<th><?php esc_html_e( 'Line total', 'webino-dashboard' ); ?></th>
				</tr>
			</thead>
			<tbody><?php echo self::item_rows_invoice( $order, $s ); // phpcs:ignore ?></tbody>
		</table>
	</div>
	<div class="total-section">
		<table>
			<tr><td><strong><?php esc_html_e( 'Subtotal', 'webino-dashboard' ); ?>:</strong></td><td><?php echo wp_kses_post( self::price_html( $order, $order->get_subtotal() ) ); ?></td></tr>
			<tr><td><strong><?php esc_html_e( 'Shipping', 'webino-dashboard' ); ?>:</strong></td><td><?php echo esc_html( $method ); ?> (<?php echo wp_kses_post( self::price_html( $order, $order->get_shipping_total() ) ); ?>)</td></tr>
			<tr><td><strong><?php esc_html_e( 'Payment method', 'webino-dashboard' ); ?>:</strong></td><td><?php echo esc_html( $order->get_payment_method_title() ); ?></td></tr>
			<tr><td><strong><?php esc_html_e( 'Order total', 'webino-dashboard' ); ?>:</strong></td><td><?php echo wp_kses_post( self::price_html( $order, $order->get_total() ) ); ?></td></tr>
		</table>
	</div>
	<div class="footer">
		<p><?php echo esc_html( $s['footer_thanks'] ); ?></p>
		<p><?php echo esc_html( $s['footer_site'] ); ?></p>
		<a href="javascript:window.print()" class="print-btn"><?php esc_html_e( 'Print invoice', 'webino-dashboard' ); ?></a>
	</div>
</div>
</body>
</html>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * @param WC_Order $order Order.
	 * @return string
	 */
	private static function render_receipt( $order ) {
		$s        = self::settings();
		$config   = self::doc_config();
		$number   = $order->get_order_number();
		$num_disp = Webino_Dashboard_Locale::localize_display( (string) $number, self::$render_locale );
		$date     = Webino_Dashboard_Locale::format_order_date_short( $order->get_date_created(), self::$render_locale );
		$ship   = self::address_parts( $order, 'shipping' );
		$method = Webino_Dashboard_Orders::get_shipping_method_title( $order );

		ob_start();
		?>
<!DOCTYPE html>
<html lang="<?php echo esc_attr( (string) $config['lang'] ); ?>" dir="<?php echo esc_attr( (string) $config['dir'] ); ?>">
<head>
	<meta charset="utf-8" />
	<title><?php echo esc_html( sprintf( __( 'Receipt #%s', 'webino-dashboard' ), $num_disp ) ); ?></title>
	<style>
		<?php echo self::shared_styles( $s, $config ); // phpcs:ignore ?>
		.container { background: #fff; border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 25px; max-width: 420px; margin: 0 auto; }
		.header { text-align: center; padding-bottom: 15px; border-bottom: 2px solid var(--border-color); margin-bottom: 20px; }
		.header h1 { font-size: 20px; margin: 8px 0; }
		.item-details table { width: 100%; border-collapse: collapse; margin: 16px 0; }
		.item-details th, .item-details td { border: 1px solid var(--border-color); padding: 10px; font-size: 14px; text-align: center; }
		.item-details th { background: var(--bg-light); }
		.summary p, .customer-details p { margin: 6px 0; font-size: 14px; color: var(--text-medium); }
		.footer { text-align: center; margin-top: 25px; padding-top: 20px; border-top: 2px solid var(--border-color); }
	</style>
</head>
<body onload="window.print()">
<div class="container">
	<div class="header">
		<?php echo self::logo_barcode_block( $s, $number, ! empty( $s['receipt_show_barcode'] ) ); // phpcs:ignore ?>
		<h1><?php echo esc_html( $s['store_name'] ); ?></h1>
		<p><?php echo esc_html( sprintf( __( 'Receipt #%1$s — Date: %2$s', 'webino-dashboard' ), $num_disp, $date ) ); ?></p>
	</div>
	<div class="customer-details">
		<p><strong><?php esc_html_e( 'Buyer', 'webino-dashboard' ); ?>:</strong> <?php echo esc_html( $ship['name'] ); ?></p>
		<p><strong><?php esc_html_e( 'Address', 'webino-dashboard' ); ?>:</strong> <?php echo esc_html( self::address_summary( $ship ) ); ?></p>
		<p><strong><?php esc_html_e( 'Postcode', 'webino-dashboard' ); ?>:</strong> <?php echo self::display_num( $ship['postcode'] ); ?></p>
		<?php if ( $ship['phone'] ) : ?>
			<p><strong><?php esc_html_e( 'Phone', 'webino-dashboard' ); ?>:</strong> <?php echo self::display_num( $ship['phone'] ); ?></p>
		<?php endif; ?>
	</div>
	<?php if ( ! empty( $s['receipt_show_items_table'] ) ) : ?>
	<div class="item-details">
		<table>
			<thead><tr><th><?php esc_html_e( 'Item', 'webino-dashboard' ); ?></th><th><?php esc_html_e( 'Qty', 'webino-dashboard' ); ?></th><th><?php esc_html_e( 'Unit', 'webino-dashboard' ); ?></th><th><?php esc_html_e( 'Total', 'webino-dashboard' ); ?></th></tr></thead>
			<tbody>
				<?php foreach ( $order->get_items() as $item ) : ?>
					<?php $qty = $item->get_quantity(); ?>
					<tr>
						<td><?php echo esc_html( $item->get_name() ); ?></td>
						<td><?php echo self::display_num( (string) $qty ); ?></td>
						<td><?php echo wp_kses_post( self::price_html( $order, $qty > 0 ? (float) $item->get_subtotal() / $qty : 0 ) ); ?></td>
						<td><?php echo wp_kses_post( self::price_html( $order, $item->get_total() ) ); ?></td>
					</tr>
				<?php endforeach; ?>
			</tbody>
			<tfoot><tr><td colspan="3"><strong><?php esc_html_e( 'Total', 'webino-dashboard' ); ?>:</strong></td><td><?php echo wp_kses_post( self::price_html( $order, $order->get_total() ) ); ?></td></tr></tfoot>
		</table>
	</div>
	<?php endif; ?>
	<div class="summary">
		<p><strong><?php esc_html_e( 'Shipping', 'webino-dashboard' ); ?>:</strong> <?php echo esc_html( $method ); ?></p>
		<p><strong><?php esc_html_e( 'Payment method', 'webino-dashboard' ); ?>:</strong> <?php echo esc_html( $order->get_payment_method_title() ); ?></p>
		<p><strong><?php esc_html_e( 'Order total', 'webino-dashboard' ); ?>:</strong> <?php echo wp_kses_post( self::price_html( $order, $order->get_total() ) ); ?></p>
	</div>
	<div class="footer">
		<p><?php echo esc_html( $s['footer_thanks'] ); ?></p>
		<p><?php echo esc_html( $s['footer_site'] ); ?></p>
		<a href="javascript:window.print()" class="print-button"><?php esc_html_e( 'Print receipt', 'webino-dashboard' ); ?></a>
	</div>
</div>
</body>
</html>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * @param WC_Order $order Order.
	 * @return string
	 */
	private static function render_label( $order ) {
		$s        = self::settings();
		$config   = self::doc_config();
		$number   = $order->get_order_number();
		$num_disp = Webino_Dashboard_Locale::localize_display( (string) $number, self::$render_locale );
		$ship   = self::address_parts( $order, 'shipping' );
		$method = Webino_Dashboard_Orders::get_shipping_method_title( $order );

		ob_start();
		?>
<!DOCTYPE html>
<html lang="<?php echo esc_attr( (string) $config['lang'] ); ?>" dir="<?php echo esc_attr( (string) $config['dir'] ); ?>">
<head>
	<meta charset="utf-8" />
	<title><?php echo esc_html( sprintf( __( 'Postal label #%s', 'webino-dashboard' ), $num_disp ) ); ?></title>
	<style>
		<?php echo self::shared_styles( $s, $config ); // phpcs:ignore ?>
		.postal-label-container { max-width: 1100px; margin: auto; border: 1px solid var(--border-color); border-radius: var(--border-radius); overflow: hidden; }
		.postal-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 2px solid var(--border-color); background: var(--bg-light); }
		.postal-header-right { display: flex; align-items: center; gap: 15px; }
		.postal-title { font-size: 20px; margin: 0; }
		.order-number { font-size: 13px; color: var(--text-medium); margin-top: 3px; }
		.postal-content { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; }
		.sender-section { grid-column: 2; grid-row: 1; padding: 15px; border-inline-end: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
		.receiver-section { grid-column: 1; grid-row: 2; padding: 15px; border-inline-start: 1px solid var(--border-color); }
		.product-list-section { grid-column: 1; grid-row: 1; padding: 15px; border-bottom: 1px solid var(--border-color); max-height: 220px; overflow-y: auto; }
		.postman-label-placeholder { grid-column: 2; grid-row: 2; padding: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-lighter); border: 2px dashed var(--border-color); margin: 12px; border-radius: var(--border-radius); }
		.section-title { font-size: 16px; font-weight: 600; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid var(--border-color); }
		.address-info p { margin: 6px 0; font-size: 13px; }
		.product-item { display: flex; gap: 10px; padding: 8px; border-bottom: 1px solid var(--border-color); align-items: center; }
		.product-image { width: 45px; height: 45px; object-fit: cover; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color); }
		.product-quantity { font-weight: 700; background: var(--bg-lighter); padding: 6px 10px; border-radius: var(--border-radius-sm); }
		.print-button-wrapper { text-align: center; margin: 20px 0; }
		@media print { @page { size: A5 landscape; margin: 8mm; } }
	</style>
</head>
<body onload="window.print()">
<div class="postal-label-container">
	<div class="postal-header">
		<div class="postal-header-right">
			<?php if ( ! empty( $s['logo_url'] ) ) : ?>
				<img src="<?php echo esc_url( $s['logo_url'] ); ?>" style="height:50px;width:auto;" alt="" />
			<?php endif; ?>
			<div>
				<h2 class="postal-title"><?php esc_html_e( 'Postal label', 'webino-dashboard' ); ?></h2>
				<p class="order-number"><?php echo esc_html( sprintf( __( 'Order #%s', 'webino-dashboard' ), $num_disp ) ); ?></p>
			</div>
		</div>
		<?php if ( ! empty( $s['label_show_barcode'] ) ) : ?>
			<?php $uri = self::barcode_data_uri( $number ); ?>
			<?php if ( $uri ) : ?>
				<img src="<?php echo esc_attr( $uri ); ?>" alt="<?php echo esc_attr__( 'Barcode', 'webino-dashboard' ); ?>" style="max-width:180px;" />
			<?php endif; ?>
		<?php endif; ?>
	</div>
	<div class="postal-content">
		<div class="product-list-section">
			<?php if ( ! empty( $s['label_show_products'] ) ) : ?>
				<?php foreach ( $order->get_items() as $item ) : ?>
					<?php
					$product = $item->get_product();
					$img     = $product ? wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' ) : '';
					?>
					<div class="product-item">
						<?php if ( $img ) : ?><img class="product-image" src="<?php echo esc_url( $img ); ?>" alt="" /><?php endif; ?>
						<div class="product-details" style="flex:1;font-size:12px;">
							<div class="product-name"><?php echo esc_html( $item->get_name() ); ?></div>
						</div>
						<div class="product-quantity">× <?php echo self::display_num( (string) $item->get_quantity() ); ?></div>
					</div>
				<?php endforeach; ?>
			<?php endif; ?>
		</div>
		<div class="sender-section">
			<div class="section-title"><?php esc_html_e( 'Sender', 'webino-dashboard' ); ?></div>
			<div class="address-info"><?php echo self::sender_html( $s ); // phpcs:ignore ?></div>
		</div>
		<div class="receiver-section">
			<div class="section-title"><?php esc_html_e( 'Recipient', 'webino-dashboard' ); ?></div>
			<div class="address-info">
				<p><strong><?php esc_html_e( 'Name', 'webino-dashboard' ); ?>:</strong> <?php echo esc_html( $ship['name'] ); ?></p>
				<?php if ( $ship['state_label'] ) : ?><p><strong><?php esc_html_e( 'State', 'webino-dashboard' ); ?>:</strong> <?php echo esc_html( $ship['state_label'] ); ?></p><?php endif; ?>
				<?php if ( $ship['city'] ) : ?><p><strong><?php esc_html_e( 'City', 'webino-dashboard' ); ?>:</strong> <?php echo esc_html( $ship['city'] ); ?></p><?php endif; ?>
				<?php if ( $ship['postcode'] ) : ?><p><strong><?php esc_html_e( 'Postcode', 'webino-dashboard' ); ?>:</strong> <?php echo self::display_num( $ship['postcode'] ); ?></p><?php endif; ?>
				<?php if ( $ship['address'] ) : ?><p><strong><?php esc_html_e( 'Address', 'webino-dashboard' ); ?>:</strong> <?php echo esc_html( $ship['address'] ); ?></p><?php endif; ?>
				<?php if ( $ship['phone'] ) : ?><p><strong><?php esc_html_e( 'Phone', 'webino-dashboard' ); ?>:</strong> <?php echo self::display_num( $ship['phone'] ); ?></p><?php endif; ?>
			</div>
			<div class="address-info" style="margin-top:15px;padding-top:15px;border-top:1px solid #ddd;">
				<p><strong><?php esc_html_e( 'Shipping method', 'webino-dashboard' ); ?>:</strong> <?php echo esc_html( $method ); ?></p>
				<p><strong><?php esc_html_e( 'Order total', 'webino-dashboard' ); ?>:</strong> <?php echo wp_kses_post( self::price_html( $order, $order->get_total() ) ); ?></p>
			</div>
		</div>
		<?php if ( ! empty( $s['label_show_postman_placeholder'] ) ) : ?>
		<div class="postman-label-placeholder">
			<div class="postman-label-text"><?php echo esc_html( $s['label_postman_title'] ); ?></div>
			<div class="postman-label-text" style="margin-top:10px;font-size:12px;"><?php echo esc_html( $s['label_postman_hint'] ); ?></div>
		</div>
		<?php endif; ?>
	</div>
</div>
<div class="print-button-wrapper">
	<a href="javascript:window.print()" class="print-btn"><?php esc_html_e( 'Print postal label', 'webino-dashboard' ); ?></a>
</div>
</body>
</html>
		<?php
		return (string) ob_get_clean();
	}
}
