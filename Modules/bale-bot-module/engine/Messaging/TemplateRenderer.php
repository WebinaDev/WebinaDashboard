<?php

namespace Webino_Dashboard_Bots_Bale\Messaging;

use Webino_Dashboard_Bots_Bale\Core\Plugin;

/**
 * Replace {placeholders} in outbound Bale messages.
 */
class TemplateRenderer {

	/**
	 * @param array<string, string> $extra
	 */
	public static function render( string $template, \WC_Order $order, array $extra = array() ): string {
		$uid = (int) $order->get_user_id();
		$map = array(
			'order_number'   => $order->get_order_number(),
			'order_id'       => (string) $order->get_id(),
			'customer_name'  => trim( $order->get_formatted_billing_full_name() ) !== '' ? $order->get_formatted_billing_full_name() : __( 'مشتری', 'webino-dashboard' ),
			'billing_phone'  => $order->get_billing_phone(),
			'order_status'   => wc_get_order_status_name( $order->get_status() ),
			'order_total'    => wp_strip_all_tags( wc_price( $order->get_total() ) ),
			'payment_url'    => $order->get_checkout_payment_url( true ),
			'site_name'      => get_bloginfo( 'name' ),
			'tracking_code'  => self::get_tracking_code( $order ),
		);
		foreach ( $extra as $k => $v ) {
			$map[ $k ] = $v;
		}
		$out = $template;
		foreach ( $map as $key => $val ) {
			$out = str_replace( '{' . $key . '}', (string) $val, $out );
		}
		return $out;
	}

	public static function get_tracking_code( \WC_Order $order ): string {
		$v = apply_filters( 'wbdb_bale_tracking_value', '', $order );
		if ( $v !== '' ) {
			return (string) $v;
		}
		$m = $order->get_meta( 'woobale_tracking_code' );
		if ( $m !== '' ) {
			return (string) $m;
		}
		return (string) $order->get_meta( '_tracking_number' );
	}

	/**
	 * Tracking URL for postal follow-up. Empty if no code or no template.
	 */
	public static function get_tracking_url( \WC_Order $order ): string {
		$code = self::get_tracking_code( $order );
		if ( $code === '' ) {
			return '';
		}
		$s        = Plugin::get_settings();
		$template = isset( $s['post_tracking_url_template'] ) ? trim( (string) $s['post_tracking_url_template'] ) : '';
		if ( $template === '' ) {
			$template = 'https://tracking.post.ir/?id={code}';
		}
		if ( strpos( $template, '{code}' ) === false && strpos( $template, '{code_raw}' ) === false ) {
			$template = 'https://tracking.post.ir/?id={code}';
		}
		$url = str_replace( '{code_raw}', $code, $template );
		$url = str_replace( '{code}', rawurlencode( $code ), $url );
		$url = (string) apply_filters( 'wbdb_bale_tracking_url', $url, $order, $code );
		return trim( $url );
	}

	/**
	 * Order statuses where post tracking block (code + link) is shown in «پیگیری سفارش».
	 *
	 * @return list<string>
	 */
	public static function get_post_tracking_status_slugs( \WC_Order $order ): array {
		$defaults = array( 'completed', 'shipped' );
		/**
		 * @param list<string> $slugs
		 */
		$slugs = apply_filters( 'wbdb_bale_order_statuses_with_post_tracking', $defaults, $order );
		return is_array( $slugs ) ? array_values( $slugs ) : $defaults;
	}
}
