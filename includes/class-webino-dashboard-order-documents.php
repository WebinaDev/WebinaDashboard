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
	 * @param string   $type invoice|label|receipt|packing|customer_label|store_label.
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
			case 'packing':
				return self::render_packing( $order );
			case 'customer_label':
				return self::render_sticker( $order, 'customer' );
			case 'store_label':
				return self::render_sticker( $order, 'store' );
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
		@media print {
			@page { margin: 0; }
			html, body { margin: 0; padding: 0; }
			.print-btn, .print-button, .no-print { display: none !important; }
			body { padding: 0; }
		}
		body.theme-modern .invoice-box, body.theme-modern .container, body.theme-modern .postal-label-container {
			border-radius: 0; border-color: #111;
		}
		body.theme-modern .invoice-header, body.theme-modern .header, body.theme-modern .postal-header {
			border-bottom-color: var(--accent-color);
		}
		body.theme-modern { letter-spacing: 0.01em; }
		body.theme-modern .invoice-box, body.theme-modern .container { padding: 28px; }
		body.theme-modern .invoice-details th, body.theme-modern .item-details th { background: #111; color: #fff; }
		body.theme-modern .footer { letter-spacing: 0.02em; }
		body.theme-band .doc-band, body.theme-landscape .doc-band { background: var(--accent-color); color: #fff; padding: 14px 18px; margin: -20px -20px 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
		body.theme-band .doc-band h2, body.theme-band .doc-band p, body.theme-landscape .doc-band h2, body.theme-landscape .doc-band p { color: #fff; margin: 0; }
		body.theme-band .invoice-details th, body.theme-band .item-details th, body.theme-landscape .invoice-details th { background: var(--accent-color); color: #fff; border-color: var(--accent-color); }
		body.theme-boxed .invoice-header h2 { border: 2px solid var(--accent-color); display: inline-block; padding: 4px 14px; border-radius: 4px; }
		body.theme-boxed .invoice-header-meta { border-inline-start: 4px solid var(--accent-color); padding-inline-start: 12px; }
		body.theme-stripe .invoice-details tbody tr:nth-child(even), body.theme-stripe .item-details tbody tr:nth-child(even) { background: #f8fafc; }
		body.theme-stripe .invoice-details th, body.theme-stripe .item-details th { background: var(--accent-color); color: #fff; }
		body.theme-compact .invoice-box, body.theme-compact .container { padding: 10px; }
		body.theme-compact .invoice-details th, body.theme-compact .invoice-details td, body.theme-compact .item-details th, body.theme-compact .item-details td { padding: 6px; font-size: 12px; }
		body.theme-compact .invoice-header { min-height: 64px; margin-bottom: 10px; padding-bottom: 8px; }
		body.theme-landscape .invoice-box { max-width: none; }
		@media print {
			body.orient-landscape { }
			body.orient-landscape .invoice-box { padding: 8mm; }
		}
		body.theme-iran .section-title { background: var(--accent-color); color: #fff; border: 0; padding: 4px 8px; }
		body.theme-iran .postcode-boxes { display: inline-flex; gap: 2px; margin-inline-start: 4px; vertical-align: middle; }
		body.theme-iran .pc-box { display: inline-block; width: 14px; height: 16px; border: 1px solid #111; text-align: center; font-size: 10px; line-height: 16px; }
		body.theme-stamp .postman-label-placeholder { min-height: 88px; border-style: dashed; border-width: 2px; }
		" . ( class_exists( 'Webino_Dashboard_Currency' ) ? Webino_Dashboard_Currency::icon_styles() : '' );
	}

	/**
	 * @param string $size        100x150|100x100|A5.
	 * @param string $orientation portrait|landscape.
	 * @return string
	 */
	private static function label_page_css( $size, $orientation = 'portrait' ) {
		$landscape = ( 'landscape' === $orientation );
		if ( '100x100' === $size ) {
			$box  = 'width: 94mm; height: 94mm;';
			$page = '100mm 100mm';
		} elseif ( 'A5' === $size ) {
			$page = $landscape ? 'A5 landscape' : 'A5 portrait';
			$box  = $landscape ? 'width: 196mm; height: 134mm;' : 'width: 134mm; height: 196mm;';
		} else {
			$page = $landscape ? '150mm 100mm' : '100mm 150mm';
			$box  = $landscape ? 'width: 144mm; height: 94mm;' : 'width: 94mm; height: 144mm;';
		}
		return "@media print { @page { size: {$page}; margin: 0; } } .postal-label-container { {$box} box-sizing: border-box; display: flex; flex-direction: column; }";
	}

	/**
	 * @param string $orientation portrait|landscape.
	 * @return string
	 */
	private static function invoice_page_css( $orientation ) {
		$size = ( 'landscape' === $orientation ) ? 'A4 landscape' : 'A4 portrait';
		return "@media print { @page { size: {$size}; margin: 0; } }";
	}

	/**
	 * @param string $size 100x70|100x100.
	 * @return string
	 */
	private static function sticker_page_css( $size ) {
		$landscape = ( '100x70' === $size );
		$page      = $landscape ? '100mm 70mm' : '100mm 100mm';
		$box       = $landscape ? 'width: 94mm; min-height: 64mm;' : 'width: 94mm; min-height: 94mm;';
		return "@media print { @page { size: {$page}; margin: 0; } } .sticker-label { {$box} }";
	}

	/**
	 * @param string $size Thermal size like 58x40.
	 * @return string
	 */
	private static function product_label_page_css( $size ) {
		$parts = explode( 'x', $size );
		$w     = isset( $parts[0] ) ? (int) $parts[0] : 58;
		$h     = isset( $parts[1] ) ? (int) $parts[1] : 40;
		if ( $w < 20 ) {
			$w = 58;
		}
		if ( $h < 20 ) {
			$h = 40;
		}
		return "@media print { @page { size: {$w}mm {$h}mm; margin: 0; } } .wh-label { width: " . ( $w - 3 ) . 'mm; min-height: ' . ( $h - 3 ) . 'mm; }';
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
	 * @param bool                 $for_label Use Name (postal) instead of Seller (invoice).
	 * @return string
	 */
	private static function sender_html( $s, $for_label = false ) {
		$lines = array();
		$name_label = $for_label ? __( 'Name', 'webino-dashboard' ) : __( 'Seller', 'webino-dashboard' );
		$lines[]    = '<strong>' . esc_html( $name_label ) . ':</strong> ' . esc_html( $s['sender_name'] );
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
	private static function logo_barcode_block( $s, $number, $show_barcode = true, $kind = 'invoice' ) {
		$html = '';
		$logo = Webino_Dashboard_Order_Document_Settings::logo_url( $kind, $s );
		if ( $logo && 'invoice' !== $kind ) {
			$html .= '<img src="' . esc_url( $logo ) . '" class="doc-logo" alt="" />';
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
		$theme    = isset( $s['invoice_theme'] ) ? (string) $s['invoice_theme'] : 'classic';
		$allowed  = array( 'classic', 'modern', 'band', 'boxed', 'stripe', 'compact', 'landscape' );
		if ( ! in_array( $theme, $allowed, true ) ) {
			$theme = 'classic';
		}
		$orientation = ( 'landscape' === ( $s['invoice_orientation'] ?? 'portrait' ) || 'landscape' === $theme ) ? 'landscape' : 'portrait';
		$sender_first = ( 'recipient_first' !== ( $s['invoice_parties_order'] ?? 'sender_first' ) );
		$thanks   = (string) ( $s['invoice_thanks'] ?? $s['footer_thanks'] ?? '' );

		ob_start();
		?>
<!DOCTYPE html>
<html lang="<?php echo esc_attr( (string) $config['lang'] ); ?>" dir="<?php echo esc_attr( (string) $config['dir'] ); ?>">
<head>
	<meta charset="utf-8" />
	<title><?php echo esc_html( sprintf( __( 'Invoice #%s', 'webino-dashboard' ), $num_disp ) ); ?></title>
	<style>
		<?php echo self::shared_styles( $s, $config ); // phpcs:ignore ?>
		<?php echo self::invoice_page_css( $orientation ); // phpcs:ignore ?>
		.invoice-box { max-width: 1500px; border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 20px; margin: 0 auto; }
		.invoice-header { display: flex; flex-direction: row; justify-content: space-between; align-items: stretch; gap: 16px; min-height: 100px; padding-bottom: 15px; border-bottom: 2px solid var(--border-color); margin-bottom: 20px; }
		.invoice-logo-wrap { flex: 0 0 auto; display: flex; align-items: stretch; max-width: 42%; min-height: 80px; }
		.invoice-logo { height: 100%; width: auto; max-width: 100%; max-height: 100px; object-fit: contain; }
		.invoice-header-meta { flex: 1; min-width: 0; }
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
<body class="theme-<?php echo esc_attr( $theme ); ?> orient-<?php echo esc_attr( $orientation ); ?>" onload="window.print()">
<div class="invoice-box">
	<?php if ( in_array( $theme, array( 'band', 'landscape' ), true ) ) : ?>
	<div class="doc-band">
		<h2><?php esc_html_e( 'Sales invoice', 'webino-dashboard' ); ?></h2>
		<p><?php echo esc_html( sprintf( __( 'Order #%s', 'webino-dashboard' ), $num_disp ) ); ?></p>
	</div>
	<?php endif; ?>
	<div class="invoice-header">
		<?php
		$inv_logo = Webino_Dashboard_Order_Document_Settings::logo_url( 'invoice', $s );
		if ( $inv_logo ) :
			?>
			<div class="invoice-logo-wrap">
				<img class="invoice-logo" src="<?php echo esc_url( $inv_logo ); ?>" alt="" />
			</div>
		<?php endif; ?>
		<div class="invoice-header-meta">
			<?php if ( ! in_array( $theme, array( 'band', 'landscape' ), true ) ) : ?>
			<h2><?php esc_html_e( 'Invoice', 'webino-dashboard' ); ?></h2>
			<?php endif; ?>
			<p><?php echo esc_html( sprintf( __( 'Order #%s', 'webino-dashboard' ), $num_disp ) ); ?></p>
			<p><?php echo esc_html( sprintf( __( 'Order date: %s', 'webino-dashboard' ), $date ) ); ?></p>
			<?php if ( ! empty( $s['invoice_show_status'] ) ) : ?>
				<p><?php echo esc_html( sprintf( __( 'Status: %s', 'webino-dashboard' ), wc_get_order_status_name( $order->get_status() ) ) ); ?></p>
			<?php endif; ?>
			<div class="barcode"><?php echo self::logo_barcode_block( $s, $number, ! empty( $s['invoice_show_barcode'] ), 'invoice' ); // phpcs:ignore ?></div>
		</div>
	</div>
	<div class="invoice-details">
		<table>
			<tr>
				<?php if ( $sender_first ) : ?>
					<th><?php esc_html_e( 'Seller', 'webino-dashboard' ); ?></th>
					<th><?php esc_html_e( 'Buyer', 'webino-dashboard' ); ?></th>
				<?php else : ?>
					<th><?php esc_html_e( 'Buyer', 'webino-dashboard' ); ?></th>
					<th><?php esc_html_e( 'Seller', 'webino-dashboard' ); ?></th>
				<?php endif; ?>
			</tr>
			<tr>
				<?php if ( $sender_first ) : ?>
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
				<?php else : ?>
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
				<td><?php echo self::sender_html( $s ); // phpcs:ignore ?></td>
				<?php endif; ?>
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
		<p><?php echo esc_html( $thanks ); ?></p>
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
		$theme  = isset( $s['receipt_theme'] ) ? (string) $s['receipt_theme'] : 'classic';
		$thanks = (string) ( $s['receipt_thanks'] ?? $s['footer_thanks'] ?? '' );

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
<body class="theme-<?php echo esc_attr( $theme ); ?>" onload="window.print()">
<div class="container">
	<?php if ( 'band' === $theme ) : ?>
	<div class="doc-band">
		<h2><?php esc_html_e( 'Store receipt', 'webino-dashboard' ); ?></h2>
		<p><?php echo esc_html( sprintf( __( 'Order #%s', 'webino-dashboard' ), $num_disp ) ); ?></p>
	</div>
	<?php endif; ?>
	<div class="header">
		<?php echo self::logo_barcode_block( $s, $number, ! empty( $s['receipt_show_barcode'] ), 'receipt' ); // phpcs:ignore ?>
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
		<p><?php echo esc_html( $thanks ); ?></p>
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
	 * @param bool     $inner Inner fragment only.
	 * @return string
	 */
	private static function render_label( $order, $inner = false ) {
		$s           = self::settings();
		$config      = self::doc_config();
		$number      = $order->get_order_number();
		$num_disp    = Webino_Dashboard_Locale::localize_display( (string) $number, self::$render_locale );
		$ship        = self::address_parts( $order, 'shipping' );
		$method      = Webino_Dashboard_Orders::get_shipping_method_title( $order );
		$theme       = isset( $s['label_theme'] ) ? (string) $s['label_theme'] : 'stacked';
		$rows_theme  = ( 'rows' === $theme );
		$size        = isset( $s['label_size'] ) ? (string) $s['label_size'] : 'A5';
		$orientation = ( 'portrait' === ( $s['label_orientation'] ?? 'landscape' ) ) ? 'portrait' : 'landscape';
		$logo       = Webino_Dashboard_Order_Document_Settings::logo_url( 'label', $s );
		$note       = isset( $s['label_note'] ) ? (string) $s['label_note'] : '';
		$iran       = ( 'iran' === $theme );
		$postman_title = isset( $s['label_postman_title'] ) ? (string) $s['label_postman_title'] : __( 'Place for attaching postal label', 'webino-dashboard' );
		$postman_hint  = isset( $s['label_postman_hint'] ) ? (string) $s['label_postman_hint'] : __( 'The post officer will attach the official label in this area', 'webino-dashboard' );

		ob_start();
		if ( ! $inner ) :
			?>
<!DOCTYPE html>
<html lang="<?php echo esc_attr( (string) $config['lang'] ); ?>" dir="<?php echo esc_attr( (string) $config['dir'] ); ?>">
<head>
	<meta charset="utf-8" />
	<title><?php echo esc_html( sprintf( __( 'Postal label #%s', 'webino-dashboard' ), $num_disp ) ); ?></title>
	<style>
		<?php echo self::shared_styles( $s, $config ); // phpcs:ignore ?>
		<?php echo self::label_page_css( $size, $orientation ); // phpcs:ignore ?>
		<?php echo self::label_layout_css( $theme ); // phpcs:ignore ?>
	</style>
</head>
<body class="theme-<?php echo esc_attr( $theme ); ?> orient-<?php echo esc_attr( $orientation ); ?>" onload="window.print()">
			<?php
		endif;
		?>
<div class="postal-label-container label-page orient-<?php echo esc_attr( $orientation ); ?>">
	<div class="postal-header">
		<div class="postal-header-right">
			<?php if ( $logo ) : ?>
				<img src="<?php echo esc_url( $logo ); ?>" class="doc-logo" alt="" />
			<?php endif; ?>
			<div>
				<h2 class="postal-title"><?php esc_html_e( 'Postal label', 'webino-dashboard' ); ?></h2>
				<p class="order-number"><?php echo esc_html( sprintf( __( 'Order #%s', 'webino-dashboard' ), $num_disp ) ); ?></p>
			</div>
		</div>
		<?php if ( ! empty( $s['label_show_barcode'] ) ) : ?>
			<?php $uri = self::barcode_data_uri( $number ); ?>
			<?php if ( $uri ) : ?>
				<img class="header-barcode" src="<?php echo esc_attr( $uri ); ?>" alt="<?php echo esc_attr__( 'Barcode', 'webino-dashboard' ); ?>" />
			<?php endif; ?>
		<?php endif; ?>
	</div>
	<div class="postal-content orient-<?php echo esc_attr( $orientation ); ?><?php echo $rows_theme ? ' theme-rows' : ''; ?>">
		<?php if ( ! $rows_theme ) : ?>
		<div class="label-cell empty-cell" aria-hidden="true"></div>
		<?php endif; ?>
		<div class="label-cell sender-cell party-block">
			<div class="section-title"><?php esc_html_e( 'Sender', 'webino-dashboard' ); ?></div>
			<div class="address-info"><?php echo self::sender_html( $s, true ); // phpcs:ignore ?></div>
			<?php if ( $iran ) : ?>
				<div class="address-info"><?php echo self::postcode_boxes( (string) ( $s['sender_postcode'] ?? '' ) ); // phpcs:ignore ?></div>
			<?php endif; ?>
		</div>
		<div class="label-cell receiver-cell party-block">
			<div class="section-title"><?php esc_html_e( 'Recipient', 'webino-dashboard' ); ?></div>
			<div class="address-info">
				<?php if ( $ship['name'] ) : ?><p><strong><?php esc_html_e( 'Name', 'webino-dashboard' ); ?>:</strong> <?php echo esc_html( $ship['name'] ); ?></p><?php endif; ?>
				<?php if ( $ship['state_label'] ) : ?><p><strong><?php esc_html_e( 'State', 'webino-dashboard' ); ?>:</strong> <?php echo esc_html( $ship['state_label'] ); ?></p><?php endif; ?>
				<?php if ( $ship['city'] ) : ?><p><strong><?php esc_html_e( 'City', 'webino-dashboard' ); ?>:</strong> <?php echo esc_html( $ship['city'] ); ?></p><?php endif; ?>
				<?php if ( $ship['postcode'] ) : ?>
					<p><strong><?php esc_html_e( 'Postcode', 'webino-dashboard' ); ?>:</strong>
					<?php
					if ( $iran ) {
						echo self::postcode_boxes( (string) $ship['postcode'] ); // phpcs:ignore
					} else {
						echo self::display_num( $ship['postcode'] );
					}
					?>
					</p>
				<?php endif; ?>
				<?php if ( $ship['address'] ) : ?><p><strong><?php esc_html_e( 'Address', 'webino-dashboard' ); ?>:</strong> <?php echo esc_html( $ship['address'] ); ?></p><?php endif; ?>
				<?php if ( $ship['phone'] ) : ?><p><strong><?php esc_html_e( 'Phone', 'webino-dashboard' ); ?>:</strong> <?php echo self::display_num( $ship['phone'] ); ?></p><?php endif; ?>
				<?php if ( $method ) : ?><p><strong><?php esc_html_e( 'Shipping method', 'webino-dashboard' ); ?>:</strong> <?php echo esc_html( $method ); ?></p><?php endif; ?>
			</div>
		</div>
		<?php if ( ! $rows_theme ) : ?>
		<div class="label-cell postman-cell">
			<div class="postman-label-placeholder">
				<div class="postman-label-text"><?php echo esc_html( $postman_title ); ?></div>
				<div class="postman-label-text postman-hint"><?php echo esc_html( $postman_hint ); ?></div>
			</div>
		</div>
		<?php endif; ?>
		<?php if ( $note ) : ?>
			<p class="label-note"><?php echo esc_html( $note ); ?></p>
		<?php endif; ?>
	</div>
</div>
		<?php
		if ( ! $inner ) :
			?>
<div class="print-button-wrapper no-print">
	<a href="javascript:window.print()" class="print-btn"><?php esc_html_e( 'Print postal label', 'webino-dashboard' ); ?></a>
</div>
</body>
</html>
			<?php
		endif;
		return (string) ob_get_clean();
	}

	/**
	 * @param string $theme stacked|classic|modern.
	 * @return string
	 */
	private static function label_layout_css( $theme ) {
		$radius = ( 'modern' === $theme ) ? '0' : 'var(--border-radius)';
		return '
		.postal-label-container { margin: auto; border: 1px solid var(--border-color); border-radius: ' . $radius . '; overflow: hidden; }
		.postal-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 2px solid var(--border-color); background: var(--bg-light); flex: 0 0 auto; }
		.postal-header-right { display: flex; align-items: center; gap: 12px; }
		.postal-title { font-size: 18px; font-weight: 700; margin: 0; }
		.order-number { font-size: 12px; color: var(--text-medium); margin-top: 2px; }
		.doc-logo { height: 48px; width: auto; }
		.header-barcode { max-width: 160px; height: auto; }
		.postal-content { flex: 1; min-height: 0; }
		.label-cell { padding: 10px 12px; box-sizing: border-box; overflow: hidden; }
		.empty-cell { background: var(--bg-light); }
		.sender-cell { font-size: 12px; }
		.sender-cell .section-title { font-size: 13px; }
		.sender-cell .address-info, .sender-cell .address-info p { font-size: 12px; line-height: 1.45; }
		.receiver-cell { font-size: 15px; }
		.receiver-cell .section-title { font-size: 16px; font-weight: 700; }
		.receiver-cell .address-info, .receiver-cell .address-info p { font-size: 15px; line-height: 1.55; margin: 4px 0; }
		.section-title { font-weight: 700; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid var(--border-color); }
		.address-info p { margin: 3px 0; }
		.label-note { font-size: 11px; padding: 6px 10px; border-top: 1px dashed var(--border-color); grid-column: 1 / -1; }
		.label-page { page-break-after: always; }
		.print-button-wrapper { text-align: center; margin: 20px 0; }
		.postman-cell { display: flex; }
		.postman-label-placeholder { border: 2px dashed var(--border-color); margin: 4px; padding: 12px 8px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; flex: 1; min-height: 72px; background: var(--bg-light); }
		.postman-label-text { font-size: 13px; font-weight: 700; }
		.postman-hint { margin-top: 8px; font-size: 11px; font-weight: 400; color: var(--text-medium); }
		.postal-content.orient-landscape { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
		.postal-content.orient-landscape .empty-cell { border-inline-end: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
		.postal-content.orient-landscape .sender-cell { border-bottom: 1px solid var(--border-color); }
		.postal-content.orient-landscape .receiver-cell { border-inline-end: 1px solid var(--border-color); }
		.postal-content.orient-portrait { display: flex; flex-direction: column; }
		.postal-content.orient-portrait .empty-cell { display: none; }
		.postal-content.orient-portrait .sender-cell { flex: 0 1 32%; max-height: 35%; border-bottom: 2px solid var(--border-color); }
		.postal-content.orient-portrait .receiver-cell { flex: 1 1 auto; border-bottom: 2px solid var(--border-color); }
		.postal-content.orient-portrait .postman-cell { flex: 0 0 auto; min-height: 80px; }
		body.theme-rows .postal-content,
		.postal-content.theme-rows { display: flex; flex-direction: column; }
		body.theme-rows .postal-content.orient-landscape { grid-template-columns: unset; grid-template-rows: unset; }
		body.theme-rows .postal-content .sender-cell { flex: 0 1 40%; max-height: 40%; width: 100%; border-bottom: 2px solid var(--border-color); border-inline-end: 0; }
		body.theme-rows .postal-content .receiver-cell { flex: 1 1 auto; width: 100%; border-inline-end: 0; border-bottom: 0; }
		body.theme-rows .postal-content .label-note { grid-column: unset; }
		body.theme-iran .section-title { background: var(--accent-color); color: #fff; padding: 4px 8px; border-bottom: 0; }
		body.theme-stamp .postman-label-placeholder { min-height: 96px; }
		.postcode-boxes { display: inline-flex; gap: 2px; vertical-align: middle; }
		.pc-box { display: inline-block; width: 14px; height: 16px; border: 1px solid #111; text-align: center; font-size: 10px; line-height: 16px; font-family: ui-monospace, monospace; }
		@media print { .postal-label-container { border-radius: 0; } }
		';
	}

	/**
	 * @param array<int,WC_Order> $orders Orders.
	 * @param string              $locale Locale.
	 * @return string
	 */
	public static function render_labels_batch( $orders, $locale = null ) {
		self::$render_locale = Webino_Dashboard_Locale::resolve_locale( $locale );
		$s                   = self::settings();
		$config              = self::doc_config();
		$theme               = isset( $s['label_theme'] ) ? (string) $s['label_theme'] : 'stacked';
		$size                = isset( $s['label_size'] ) ? (string) $s['label_size'] : 'A5';
		$orientation         = ( 'portrait' === ( $s['label_orientation'] ?? 'landscape' ) ) ? 'portrait' : 'landscape';
		ob_start();
		?>
<!DOCTYPE html>
<html lang="<?php echo esc_attr( (string) $config['lang'] ); ?>" dir="<?php echo esc_attr( (string) $config['dir'] ); ?>">
<head>
	<meta charset="utf-8" />
	<title><?php esc_html_e( 'Postal labels', 'webino-dashboard' ); ?></title>
	<style>
		<?php echo self::shared_styles( $s, $config ); // phpcs:ignore ?>
		<?php echo self::label_page_css( $size, $orientation ); // phpcs:ignore ?>
		<?php echo self::label_layout_css( $theme ); // phpcs:ignore ?>
	</style>
</head>
<body class="theme-<?php echo esc_attr( $theme ); ?> orient-<?php echo esc_attr( $orientation ); ?>" onload="window.print()">
		<?php
		foreach ( $orders as $order ) {
			if ( $order instanceof WC_Order ) {
				echo self::render_label( $order, true ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			}
		}
		?>
<div class="print-button-wrapper no-print">
	<a href="javascript:window.print()" class="print-btn"><?php esc_html_e( 'Print postal label', 'webino-dashboard' ); ?></a>
</div>
</body>
</html>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * @param array<int> $product_ids Product IDs.
	 * @param string     $locale Locale.
	 * @return string
	 */
	public static function render_product_labels( $product_ids, $locale = null ) {
		self::$render_locale = Webino_Dashboard_Locale::resolve_locale( $locale );
		$s                   = self::settings();
		$config              = self::doc_config();
		$size                = isset( $s['product_label_size'] ) ? (string) $s['product_label_size'] : '58x40';
		$split               = ! empty( $s['product_label_split_variations'] );
		$rows                = array();
		foreach ( (array) $product_ids as $pid ) {
			$p = function_exists( 'wc_get_product' ) ? wc_get_product( (int) $pid ) : null;
			if ( ! $p ) {
				continue;
			}
			if ( $split && $p->is_type( 'variable' ) && is_callable( array( $p, 'get_children' ) ) ) {
				$added = false;
				foreach ( (array) $p->get_children() as $vid ) {
					$v = wc_get_product( (int) $vid );
					if ( $v ) {
						$rows[] = $v;
						$added  = true;
					}
				}
				if ( ! $added ) {
					$rows[] = $p;
				}
			} else {
				$rows[] = $p;
			}
		}
		ob_start();
		?>
<!DOCTYPE html>
<html lang="<?php echo esc_attr( (string) $config['lang'] ); ?>" dir="<?php echo esc_attr( (string) $config['dir'] ); ?>">
<head>
	<meta charset="utf-8" />
	<title><?php esc_html_e( 'Warehouse labels', 'webino-dashboard' ); ?></title>
	<style>
		<?php echo self::shared_styles( $s, $config ); // phpcs:ignore ?>
		<?php echo self::product_label_page_css( $size ); // phpcs:ignore ?>
		.wh-label { border: 1px solid #111; padding: 3mm; page-break-after: always; display: flex; flex-direction: column; justify-content: space-between; }
		.wh-name { font-size: 12px; font-weight: 700; line-height: 1.25; }
		.wh-sku { font-size: 10px; }
		.wh-label img { max-width: 100%; height: auto; }
	</style>
</head>
<body onload="window.print()">
		<?php foreach ( $rows as $p ) : ?>
			<?php
			$sku  = $p->get_sku();
			$code = $sku ? $sku : (string) $p->get_id();
			$uri  = self::barcode_data_uri( $code );
			?>
			<div class="wh-label">
				<div class="wh-name"><?php echo esc_html( $p->get_name() ); ?></div>
				<?php if ( $sku ) : ?>
					<div class="wh-sku"><?php echo esc_html__( 'SKU', 'webino-dashboard' ) . ': ' . self::display_num( $sku ); ?></div>
				<?php endif; ?>
				<?php if ( $uri ) : ?>
					<img src="<?php echo esc_attr( $uri ); ?>" alt="" />
				<?php endif; ?>
			</div>
		<?php endforeach; ?>
</body>
</html>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * @param string $code Postcode.
	 * @return string
	 */
	private static function postcode_boxes( $code ) {
		$digits = preg_replace( '/\D+/', '', (string) $code );
		$digits = str_pad( substr( (string) $digits, 0, 10 ), 10, ' ' );
		$html   = '<span class="postcode-boxes" dir="ltr">';
		$len    = strlen( $digits );
		for ( $i = 0; $i < $len; $i++ ) {
			$ch    = $digits[ $i ];
			$show  = ( ' ' === $ch ) ? '' : self::display_num( $ch );
			$html .= '<span class="pc-box">' . $show . '</span>';
		}
		$html .= '</span>';
		return $html;
	}

	/**
	 * @param WC_Order $order Order.
	 * @return string
	 */
	private static function render_packing( $order ) {
		$s        = self::settings();
		$config   = self::doc_config();
		$number   = $order->get_order_number();
		$num_disp = Webino_Dashboard_Locale::localize_display( (string) $number, self::$render_locale );
		$date     = self::format_order_datetime( $order );
		$ship     = self::address_parts( $order, 'shipping' );
		$method   = Webino_Dashboard_Orders::get_shipping_method_title( $order );
		$theme    = isset( $s['packing_theme'] ) ? (string) $s['packing_theme'] : 'classic';
		if ( ! in_array( $theme, array( 'classic', 'band', 'compact' ), true ) ) {
			$theme = 'classic';
		}
		$note = is_callable( array( $order, 'get_customer_note' ) ) ? (string) $order->get_customer_note() : '';
		$logo = Webino_Dashboard_Order_Document_Settings::logo_url( 'invoice', $s );

		ob_start();
		?>
<!DOCTYPE html>
<html lang="<?php echo esc_attr( (string) $config['lang'] ); ?>" dir="<?php echo esc_attr( (string) $config['dir'] ); ?>">
<head>
	<meta charset="utf-8" />
	<title><?php echo esc_html( sprintf( __( 'Packing slip #%s', 'webino-dashboard' ), $num_disp ) ); ?></title>
	<style>
		<?php echo self::shared_styles( $s, $config ); // phpcs:ignore ?>
		<?php echo self::invoice_page_css( 'portrait' ); // phpcs:ignore ?>
		.invoice-box { max-width: 900px; border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 20px; margin: 0 auto; }
		.invoice-header { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
		.invoice-details table { width: 100%; border-collapse: collapse; margin: 12px 0; }
		.invoice-details th, .invoice-details td { border: 1px solid var(--border-color); padding: 8px; text-align: start; font-size: 13px; }
		.invoice-details th { background: var(--bg-light); }
		.sign-row { display: flex; justify-content: space-between; margin-top: 40px; gap: 24px; }
		.sign-box { flex: 1; border-top: 1px solid var(--border-color); padding-top: 8px; font-size: 12px; text-align: center; }
	</style>
</head>
<body class="theme-<?php echo esc_attr( $theme ); ?>" onload="window.print()">
<div class="invoice-box">
	<?php if ( 'band' === $theme ) : ?>
	<div class="doc-band">
		<h2><?php esc_html_e( 'Warehouse packing slip', 'webino-dashboard' ); ?></h2>
		<p><?php echo esc_html( sprintf( __( 'Order #%s', 'webino-dashboard' ), $num_disp ) ); ?></p>
	</div>
	<?php endif; ?>
	<div class="invoice-header">
		<div>
			<?php if ( $logo ) : ?>
				<img src="<?php echo esc_url( $logo ); ?>" class="invoice-logo" style="max-height:72px;width:auto;" alt="" />
			<?php endif; ?>
			<?php if ( 'band' !== $theme ) : ?>
				<h2><?php esc_html_e( 'Warehouse packing slip', 'webino-dashboard' ); ?></h2>
			<?php endif; ?>
			<p><?php echo esc_html( sprintf( __( 'Order #%s', 'webino-dashboard' ), $num_disp ) ); ?></p>
			<p><?php echo esc_html( sprintf( __( 'Order date: %s', 'webino-dashboard' ), $date ) ); ?></p>
		</div>
		<div><?php echo self::logo_barcode_block( $s, $number, true, 'invoice' ); // phpcs:ignore ?></div>
	</div>
	<div class="invoice-details">
		<table>
			<tr><th><?php esc_html_e( 'Buyer', 'webino-dashboard' ); ?></th><th><?php esc_html_e( 'Shipping', 'webino-dashboard' ); ?></th></tr>
			<tr>
				<td>
					<?php echo esc_html( $ship['name'] ); ?><br>
					<?php echo esc_html( self::address_summary( $ship ) ); ?><br>
					<?php echo esc_html__( 'Postcode', 'webino-dashboard' ) . ': ' . self::display_num( $ship['postcode'] ); ?><br>
					<?php echo esc_html__( 'Phone', 'webino-dashboard' ) . ': ' . self::display_num( $ship['phone'] ); ?>
				</td>
				<td><?php echo esc_html( $method ); ?></td>
			</tr>
		</table>
		<table>
			<thead>
				<tr>
					<th><?php esc_html_e( 'Row', 'webino-dashboard' ); ?></th>
					<th><?php esc_html_e( 'Image', 'webino-dashboard' ); ?></th>
					<th><?php esc_html_e( 'SKU', 'webino-dashboard' ); ?></th>
					<th><?php esc_html_e( 'Description', 'webino-dashboard' ); ?></th>
					<th><?php esc_html_e( 'Qty', 'webino-dashboard' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php
				$row = 0;
				foreach ( $order->get_items() as $item ) :
					++$row;
					$product = $item->get_product();
					$sku     = $product && is_callable( array( $product, 'get_sku' ) ) ? $product->get_sku() : '';
					$img     = $product ? wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' ) : '';
					?>
					<tr>
						<td><?php echo self::display_num( (string) $row ); ?></td>
						<td><?php echo $img ? '<img src="' . esc_url( $img ) . '" alt="" style="width:48px;height:48px;object-fit:cover;" />' : '—'; ?></td>
						<td><?php echo $sku ? self::display_num( $sku ) : '—'; ?></td>
						<td><?php echo esc_html( $item->get_name() ); ?></td>
						<td><?php echo self::display_num( (string) $item->get_quantity() ); ?></td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
	<?php if ( $note ) : ?>
		<p><strong><?php esc_html_e( 'Customer note', 'webino-dashboard' ); ?>:</strong> <?php echo esc_html( $note ); ?></p>
	<?php endif; ?>
	<div class="sign-row">
		<div class="sign-box"><?php esc_html_e( 'Warehouse signature', 'webino-dashboard' ); ?></div>
		<div class="sign-box"><?php esc_html_e( 'Picker signature', 'webino-dashboard' ); ?></div>
	</div>
	<div class="footer" style="text-align:center;margin-top:20px;">
		<a href="javascript:window.print()" class="print-btn"><?php esc_html_e( 'Print packing slip', 'webino-dashboard' ); ?></a>
	</div>
</div>
</body>
</html>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * @param WC_Order $order Order.
	 * @param string   $kind customer|store.
	 * @return string
	 */
	private static function render_sticker( $order, $kind ) {
		$s        = self::settings();
		$config   = self::doc_config();
		$number   = $order->get_order_number();
		$num_disp = Webino_Dashboard_Locale::localize_display( (string) $number, self::$render_locale );
		$ship     = self::address_parts( $order, 'shipping' );
		$method   = Webino_Dashboard_Orders::get_shipping_method_title( $order );
		$size_key = ( 'store' === $kind ) ? 'store_label_size' : 'customer_label_size';
		$size     = isset( $s[ $size_key ] ) ? (string) $s[ $size_key ] : '100x70';
		$logo     = Webino_Dashboard_Order_Document_Settings::logo_url( 'label', $s );
		$uri      = self::barcode_data_uri( $number );
		$title    = ( 'store' === $kind ) ? __( 'Store label', 'webino-dashboard' ) : __( 'Customer label', 'webino-dashboard' );

		ob_start();
		?>
<!DOCTYPE html>
<html lang="<?php echo esc_attr( (string) $config['lang'] ); ?>" dir="<?php echo esc_attr( (string) $config['dir'] ); ?>">
<head>
	<meta charset="utf-8" />
	<title><?php echo esc_html( $title . ' #' . $num_disp ); ?></title>
	<style>
		<?php echo self::shared_styles( $s, $config ); // phpcs:ignore ?>
		<?php echo self::sticker_page_css( $size ); // phpcs:ignore ?>
		.sticker-label { margin: auto; border: 1px solid #111; padding: 6mm; display: flex; flex-direction: column; justify-content: space-between; }
		.sticker-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
		.sticker-label p { font-size: 11px; margin: 2px 0; }
		.sticker-label img { max-width: 100%; height: auto; }
	</style>
</head>
<body onload="window.print()">
<div class="sticker-label">
	<div>
		<?php if ( $logo ) : ?>
			<img src="<?php echo esc_url( $logo ); ?>" alt="" style="height:22px;width:auto;" />
		<?php endif; ?>
		<div class="sticker-title"><?php echo esc_html( $title ); ?></div>
		<p><?php echo esc_html( sprintf( __( 'Order #%s', 'webino-dashboard' ), $num_disp ) ); ?></p>
		<?php if ( 'store' === $kind ) : ?>
			<p><strong><?php echo esc_html( (string) $s['store_name'] ); ?></strong></p>
			<p><?php echo esc_html__( 'Shipping', 'webino-dashboard' ) . ': ' . esc_html( $method ); ?></p>
		<?php else : ?>
			<p><strong><?php echo esc_html( $ship['name'] ); ?></strong></p>
			<p><?php echo esc_html( self::address_summary( $ship ) ); ?></p>
			<p><?php echo esc_html__( 'Postcode', 'webino-dashboard' ) . ': ' . self::display_num( $ship['postcode'] ); ?></p>
			<p><?php echo esc_html__( 'Phone', 'webino-dashboard' ) . ': ' . self::display_num( $ship['phone'] ); ?></p>
		<?php endif; ?>
	</div>
	<?php if ( $uri ) : ?>
		<img src="<?php echo esc_attr( $uri ); ?>" alt="" />
	<?php endif; ?>
</div>
<div class="print-button-wrapper no-print">
	<a href="javascript:window.print()" class="print-btn"><?php echo esc_html( $title ); ?></a>
</div>
</body>
</html>
		<?php
		return (string) ob_get_clean();
	}
}
