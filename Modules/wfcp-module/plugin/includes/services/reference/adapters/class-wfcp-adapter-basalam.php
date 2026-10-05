<?php
/**
 * Basalam reference adapter (__NEXT_DATA__).
 *
 * @package WFCP
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Class WFCP_Adapter_Basalam
 */
class WFCP_Adapter_Basalam implements WFCP_Reference_Adapter {

	/**
	 * {@inheritdoc}
	 */
	public function get_slug() {
		return 'basalam';
	}

	/**
	 * {@inheritdoc}
	 */
	public function can_handle( $url ) {
		$settings = WFCP_Helper::get_settings( 'reference' );
		$sources  = isset( $settings['sources'] ) && is_array( $settings['sources'] ) ? $settings['sources'] : array();
		if ( empty( $sources['basalam'] ) ) {
			return false;
		}
		$host = wp_parse_url( $url, PHP_URL_HOST );
		$host = $host ? strtolower( preg_replace( '/^www\./', '', $host ) ) : '';
		if ( false === strpos( $host, 'basalam.com' ) ) {
			return false;
		}
		return (bool) preg_match( '#/product/(\d+)#', $url );
	}

	/**
	 * {@inheritdoc}
	 */
	public function fetch( $url, $context = array() ) {
		$body = WFCP_Reference_HTTP::get_body( $url );
		if ( is_wp_error( $body ) ) {
			return $body;
		}

		if ( ! preg_match( '/<script[^>]+id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s', $body, $m ) ) {
			return new WP_Error( 'wfcp_bs_next', __( 'داده محصول باسلام (__NEXT_DATA__) یافت نشد', 'webina-woo-core' ) );
		}

		$next = json_decode( $m[1], true );
		if ( ! is_array( $next ) ) {
			return new WP_Error( 'wfcp_bs_json', __( 'JSON باسلام نامعتبر است', 'webina-woo-core' ) );
		}

		$product = $next['props']['pageProps']['product'] ?? null;
		if ( ! is_array( $product ) ) {
			return new WP_Error( 'wfcp_bs_product', __( 'محصول باسلام در صفحه یافت نشد', 'webina-woo-core' ) );
		}

		$variants = isset( $product['variants'] ) && is_array( $product['variants'] ) ? $product['variants'] : null;
		$selected = null;

		if ( $variants ) {
			$idx = isset( $product['variantsSelectedIndex'] ) ? (int) $product['variantsSelectedIndex'] : -1;
			if ( $idx >= 0 && isset( $variants[ $idx ] ) ) {
				$selected = $variants[ $idx ];
			}
			if ( ! $selected && ! empty( $context['variation_attributes'] ) ) {
				$selected = self::match_variant( $variants, $context['variation_attributes'] );
			}
			if ( ! $selected ) {
				$selected = $variants[0];
			}
		}

		if ( $selected && is_array( $selected ) ) {
			$price = isset( $selected['price'] ) ? floatval( $selected['price'] ) : ( isset( $selected['primaryPrice'] ) ? floatval( $selected['primaryPrice'] ) : null );
			$inv   = isset( $selected['inventory'] ) ? (int) $selected['inventory'] : null;
			$in    = isset( $selected['isAvailable'] ) ? (bool) $selected['isAvailable'] : ( null !== $inv ? $inv > 0 : null );
			return array(
				'price'      => ( $price && $price > 0 ) ? $price : null,
				'price_unit' => 'toman',
				'in_stock'   => $in,
				'stock_qty'  => ( null !== $inv && $inv >= 0 ) ? $inv : null,
				'source'     => 'basalam',
			);
		}

		$price = isset( $product['price'] ) ? floatval( $product['price'] ) : null;
		if ( ( ! $price || $price <= 0 ) && isset( $product['primaryPrice'] ) ) {
			$price = floatval( $product['primaryPrice'] );
		}
		$inv = isset( $product['inventory'] ) ? (int) $product['inventory'] : null;
		$in  = isset( $product['isAvailable'] ) ? (bool) $product['isAvailable'] : ( null !== $inv ? $inv > 0 : null );
		if ( isset( $product['canAddToCart'] ) && ! $product['canAddToCart'] ) {
			$in = false;
		}

		return array(
			'price'      => ( $price && $price > 0 ) ? $price : null,
			'price_unit' => 'toman',
			'in_stock'   => $in,
			'stock_qty'  => ( null !== $inv && $inv >= 0 ) ? $inv : null,
			'source'     => 'basalam',
		);
	}

	/**
	 * Match variant by attribute titles.
	 *
	 * @param array $variants Variants.
	 * @param array $attrs    Attributes.
	 * @return array|null
	 */
	private static function match_variant( $variants, $attrs ) {
		$needles = array();
		foreach ( $attrs as $v ) {
			$v = mb_strtolower( rawurldecode( (string) $v ) );
			if ( '' !== $v ) {
				$needles[] = $v;
			}
		}
		foreach ( $variants as $v ) {
			if ( ! is_array( $v ) ) {
				continue;
			}
			$hay = mb_strtolower( wp_json_encode( $v, JSON_UNESCAPED_UNICODE ) );
			$ok  = true;
			foreach ( $needles as $n ) {
				if ( false === strpos( $hay, $n ) ) {
					$ok = false;
					break;
				}
			}
			if ( $ok ) {
				return $v;
			}
		}
		return null;
	}
}
