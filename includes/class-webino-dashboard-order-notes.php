<?php
/**
 * Format WooCommerce order notes for dashboard and storefront display.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cleans HTML and translates known system note patterns to Persian.
 */
final class Webino_Dashboard_Order_Notes {

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'woocommerce_new_order_note_data', array( __CLASS__, 'filter_new_order_note_data' ), 20, 2 );
		add_filter( 'woocommerce_get_order_note', array( __CLASS__, 'filter_order_note_object' ), 20, 2 );
		add_filter( 'comment_text', array( __CLASS__, 'filter_customer_order_note_text' ), 20, 2 );
	}

	/**
	 * @param array<string,mixed> $commentdata Note data.
	 * @param array<string,mixed> $args        Args.
	 * @return array<string,mixed>
	 */
	public static function filter_new_order_note_data( $commentdata, $args ) {
		if ( ! is_array( $commentdata ) || ! is_array( $args ) ) {
			return $commentdata;
		}
		if ( empty( $args['is_customer_note'] ) || empty( $commentdata['comment_content'] ) ) {
			return $commentdata;
		}
		$commentdata['comment_content'] = self::format( (string) $commentdata['comment_content'] );
		return $commentdata;
	}

	/**
	 * Format note content whenever WooCommerce loads an order note (My Account, emails, admin).
	 *
	 * @param stdClass|WC_Order_Comment $note Note object.
	 * @param array<string,mixed>       $args Args.
	 * @return stdClass|WC_Order_Comment
	 */
	public static function filter_order_note_object( $note, $args ) {
		unset( $args );
		if ( is_object( $note ) && isset( $note->content ) && '' !== (string) $note->content ) {
			$note->content = self::format( (string) $note->content );
		}
		return $note;
	}

	/**
	 * @param string     $text    Comment text.
	 * @param WP_Comment $comment Comment.
	 * @return string
	 */
	public static function filter_customer_order_note_text( $text, $comment ) {
		if ( ! $comment instanceof WP_Comment || 'order_note' !== (string) $comment->comment_type ) {
			return $text;
		}
		if ( ! is_wc_endpoint_url( 'view-order' ) && ! is_account_page() ) {
			return $text;
		}
		return self::format( (string) $text );
	}

	/**
	 * @param string $raw Raw note HTML/text.
	 * @return string
	 */
	public static function format( $raw ) {
		$text = self::html_to_text( $raw );
		if ( '' === $text ) {
			return '';
		}

		$patterns = array(
			'/^Email\s+"(.+?)"\s+failed to send:\s*(.+)$/iu'
				=> __( 'ارسال ایمیل «%1$s» ناموفق بود: %2$s', 'webino-dashboard' ),
			'/^Payment complete\.?$/iu'
				=> __( 'پرداخت تکمیل شد.', 'webino-dashboard' ),
			'/^Accounting invoice #(\d+) posted \(journal #(\d+)\)\.?$/iu'
				=> __( 'فاکتور حسابداری شماره %1$s ثبت شد (سند شماره %2$s).', 'webino-dashboard' ),
			'/^Stock levels reduced:\s*(.+)$/iu'
				=> __( 'میزان موجودی کاهش یافت: %1$s', 'webino-dashboard' ),
			'/^Stock reduced:\s*(.+)$/iu'
				=> __( 'میزان موجودی کاهش یافت: %1$s', 'webino-dashboard' ),
			'/^Order status changed from (.+?) to (.+?)\.?$/iu'
				=> __( 'وضعیت سفارش از %1$s به %2$s تغییر کرد.', 'webino-dashboard' ),
		);

		foreach ( $patterns as $regex => $template ) {
			if ( preg_match( $regex, $text, $m ) ) {
				array_shift( $m );
				return vsprintf( $template, $m );
			}
		}

		$text = preg_replace( '/^اسنپ پی:\s*/u', __( 'اسنپ‌پی:', 'webino-dashboard' ) . ' ', $text );
		$text = preg_replace( '/^انتقال به درگاه/u', __( 'انتقال به درگاه', 'webino-dashboard' ), $text );
		$text = preg_replace( '/^رزرو موجودی/u', __( 'رزرو موجودی', 'webino-dashboard' ), $text );

		return $text;
	}

	/**
	 * @param string $raw Raw note.
	 * @return string
	 */
	private static function html_to_text( $raw ) {
		$text = (string) $raw;
		$text = html_entity_decode( $text, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$text = preg_replace( '/<br\s*\/?>/i', "\n", $text );
		$text = preg_replace( '/<\/p>\s*<p[^>]*>/i', "\n", $text );
		$text = wp_strip_all_tags( $text );
		$text = str_replace( array( "\xC2\xA0", '&rarr;', '→' ), array( ' ', '→', '→' ), $text );
		$text = preg_replace( "/\r\n|\r/", "\n", $text );
		$text = preg_replace( "/\n{3,}/", "\n\n", $text );
		return trim( $text );
	}
}
