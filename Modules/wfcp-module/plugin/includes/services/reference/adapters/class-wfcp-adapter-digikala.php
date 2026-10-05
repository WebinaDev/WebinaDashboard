<?php
/**
 * Digikala reference adapter (public API).
 *
 * @package WFCP
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Class WFCP_Adapter_Digikala
 */
class WFCP_Adapter_Digikala implements WFCP_Reference_Adapter {

	/**
	 * {@inheritdoc}
	 */
	public function get_slug() {
		return 'digikala';
	}

	/**
	 * {@inheritdoc}
	 */
	public function can_handle( $url ) {
		$settings = WFCP_Helper::get_settings( 'reference' );
		$sources  = isset( $settings['sources'] ) && is_array( $settings['sources'] ) ? $settings['sources'] : array();
		if ( empty( $sources['digikala'] ) ) {
			return false;
		}
		$host = wp_parse_url( $url, PHP_URL_HOST );
		$host = $host ? strtolower( preg_replace( '/^www\./', '', $host ) ) : '';
		if ( false === strpos( $host, 'digikala.com' ) ) {
			return false;
		}
		return (bool) self::extract_product_id( $url );
	}

	/**
	 * {@inheritdoc}
	 */
	public function fetch( $url, $context = array() ) {
		$pid = self::extract_product_id( $url );
		if ( ! $pid ) {
			return new WP_Error( 'wfcp_dk_id', __( 'شناسه محصول دیجیکالا یافت نشد', 'webina-woo-core' ) );
		}

		$api  = 'https://api.digikala.com/v2/product/' . $pid . '/';
		$data = WFCP_Reference_HTTP::get_json( $api );
		if ( is_wp_error( $data ) ) {
			return $data;
		}

		$product = isset( $data['data']['product'] ) && is_array( $data['data']['product'] ) ? $data['data']['product'] : null;
		if ( ! $product ) {
			return new WP_Error( 'wfcp_dk_product', __( 'محصول دیجیکالا در API یافت نشد', 'webina-woo-core' ) );
		}

		$variant_id = 0;
		$parts      = wp_parse_url( $url );
		$query      = array();
		if ( ! empty( $parts['query'] ) ) {
			parse_str( $parts['query'], $query );
		}
		if ( ! empty( $query['variant_id'] ) ) {
			$variant_id = (int) $query['variant_id'];
		} elseif ( ! empty( $context['remote_variation_id'] ) ) {
			$variant_id = (int) $context['remote_variation_id'];
		}

		$variant = null;
		$variants = isset( $product['variants'] ) && is_array( $product['variants'] ) ? $product['variants'] : array();

		if ( $variant_id > 0 ) {
			foreach ( $variants as $v ) {
				if ( isset( $v['id'] ) && (int) $v['id'] === $variant_id ) {
					$variant = $v;
					break;
				}
			}
		}

		if ( ! $variant && ! empty( $context['variation_attributes'] ) && is_array( $context['variation_attributes'] ) ) {
			$variant = self::match_by_attrs( $variants, $context['variation_attributes'] );
		}

		if ( ! $variant && ! empty( $product['default_variant'] ) && is_array( $product['default_variant'] ) ) {
			$variant = $product['default_variant'];
		}

		if ( ! $variant && ! empty( $variants ) ) {
			$variant = $variants[0];
		}

		if ( ! $variant ) {
			$status = isset( $product['status'] ) ? (string) $product['status'] : '';
			return array(
				'price'      => null,
				'price_unit' => 'rial',
				'in_stock'   => ( 'marketable' === $status ),
				'stock_qty'  => null,
				'source'     => 'digikala',
				'message'    => __( 'واریانت قیمت‌دار یافت نشد', 'webina-woo-core' ),
			);
		}

		$price_rial = null;
		if ( isset( $variant['price']['selling_price'] ) ) {
			$price_rial = floatval( $variant['price']['selling_price'] );
		}
		$status   = isset( $variant['status'] ) ? (string) $variant['status'] : '';
		$in_stock = ( 'marketable' === $status );

		return array(
			'price'      => ( $price_rial && $price_rial > 0 ) ? $price_rial : null,
			'price_unit' => 'rial',
			'in_stock'   => $in_stock,
			'stock_qty'  => null, // Digikala does not expose real warehouse qty publicly.
			'source'     => 'digikala',
			'message'    => isset( $variant['id'] ) ? sprintf( 'variant_id=%d', (int) $variant['id'] ) : '',
		);
	}

	/**
	 * Extract dkp id.
	 *
	 * @param string $url URL.
	 * @return int
	 */
	private static function extract_product_id( $url ) {
		if ( preg_match( '#/product/dkp-(\d+)#i', $url, $m ) ) {
			return (int) $m[1];
		}
		if ( preg_match( '#dkp-(\d+)#i', $url, $m ) ) {
			return (int) $m[1];
		}
		return 0;
	}

	/**
	 * Best-effort match by color/size titles in attributes.
	 *
	 * @param array $variants Variants.
	 * @param array $attrs    Local attributes.
	 * @return array|null
	 */
	private static function match_by_attrs( $variants, $attrs ) {
		$needles = array();
		foreach ( $attrs as $v ) {
			$v = rawurldecode( (string) $v );
			if ( '' !== $v ) {
				$needles[] = mb_strtolower( $v );
			}
		}
		if ( ! $needles ) {
			return null;
		}
		foreach ( $variants as $v ) {
			$hay = '';
			if ( ! empty( $v['color']['title'] ) ) {
				$hay .= ' ' . mb_strtolower( (string) $v['color']['title'] );
			}
			if ( ! empty( $v['size']['title'] ) ) {
				$hay .= ' ' . mb_strtolower( (string) $v['size']['title'] );
			}
			$ok = true;
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
