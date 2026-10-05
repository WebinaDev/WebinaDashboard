<?php
/**
 * Technolife reference adapter (__NEXT_DATA__).
 *
 * @package WFCP
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Class WFCP_Adapter_Technolife
 */
class WFCP_Adapter_Technolife implements WFCP_Reference_Adapter {

	/**
	 * {@inheritdoc}
	 */
	public function get_slug() {
		return 'technolife';
	}

	/**
	 * {@inheritdoc}
	 */
	public function can_handle( $url ) {
		$settings = WFCP_Helper::get_settings( 'reference' );
		$sources  = isset( $settings['sources'] ) && is_array( $settings['sources'] ) ? $settings['sources'] : array();
		if ( empty( $sources['technolife'] ) ) {
			return false;
		}
		$host = wp_parse_url( $url, PHP_URL_HOST );
		$host = $host ? strtolower( preg_replace( '/^www\./', '', $host ) ) : '';
		if ( false === strpos( $host, 'technolife.' ) ) {
			return false;
		}
		return (bool) self::extract_code( $url );
	}

	/**
	 * {@inheritdoc}
	 */
	public function fetch( $url, $context = array() ) {
		$body = WFCP_Reference_HTTP::get_body( $url );
		if ( is_wp_error( $body ) ) {
			return $body;
		}

		$next = self::extract_next_data( $body );
		if ( ! $next ) {
			return new WP_Error( 'wfcp_tl_next', __( 'داده محصول تکنولایف (__NEXT_DATA__) یافت نشد', 'webina-woo-core' ) );
		}

		$product_info = self::find_product_info( $next );
		if ( ! $product_info ) {
			return new WP_Error( 'wfcp_tl_info', __( 'اطلاعات محصول تکنولایف یافت نشد', 'webina-woo-core' ) );
		}

		$items = isset( $product_info['color_items'] ) && is_array( $product_info['color_items'] ) ? $product_info['color_items'] : array();
		$item  = self::pick_color_item( $items, $url, $context );

		if ( ! $item ) {
			$available = ! empty( $product_info['is_available'] );
			return array(
				'price'      => null,
				'price_unit' => 'toman',
				'in_stock'   => $available,
				'stock_qty'  => null,
				'source'     => 'technolife',
			);
		}

		$price = null;
		if ( isset( $item['discounted_price'] ) && floatval( $item['discounted_price'] ) > 0 ) {
			$price = floatval( $item['discounted_price'] );
		} elseif ( isset( $item['price'] ) && floatval( $item['price'] ) > 0 ) {
			$price = floatval( $item['price'] );
		}

		$in_stock = null;
		if ( isset( $item['available'] ) ) {
			$in_stock = floatval( $item['available'] ) > 0 || ! empty( $item['available'] );
		} elseif ( array_key_exists( 'in_stock', $item ) ) {
			$in_stock = floatval( $item['in_stock'] ) > 0;
		}

		$stock_qty = null;
		if ( isset( $item['available'] ) && is_numeric( $item['available'] ) ) {
			$q = (int) $item['available'];
			// Technolife sometimes uses large sentinel values; still store if positive and reasonable.
			if ( $q > 0 && $q < 100000 ) {
				$stock_qty = $q;
			}
		}

		return array(
			'price'      => $price,
			'price_unit' => 'toman',
			'in_stock'   => $in_stock,
			'stock_qty'  => $stock_qty,
			'source'     => 'technolife',
		);
	}

	/**
	 * Extract product numeric code from URL.
	 *
	 * @param string $url URL.
	 * @return string
	 */
	private static function extract_code( $url ) {
		if ( preg_match( '#/product-(\d+)#', $url, $m ) ) {
			return $m[1];
		}
		if ( preg_match( '#TLP-(\d+)#i', $url, $m ) ) {
			return $m[1];
		}
		return '';
	}

	/**
	 * Parse __NEXT_DATA__ JSON.
	 *
	 * @param string $html HTML.
	 * @return array|null
	 */
	private static function extract_next_data( $html ) {
		if ( ! preg_match( '/<script[^>]+id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s', $html, $m ) ) {
			return null;
		}
		$data = json_decode( $m[1], true );
		return is_array( $data ) ? $data : null;
	}

	/**
	 * Find product_info in dehydrated queries.
	 *
	 * @param array $next Next data.
	 * @return array|null
	 */
	private static function find_product_info( $next ) {
		$queries = $next['props']['pageProps']['dehydratedState']['queries'] ?? null;
		if ( ! is_array( $queries ) ) {
			return null;
		}
		foreach ( $queries as $q ) {
			$data = $q['state']['data'] ?? null;
			if ( is_array( $data ) && isset( $data['product_info'] ) && is_array( $data['product_info'] ) ) {
				return $data['product_info'];
			}
		}
		return null;
	}

	/**
	 * Pick color/config item.
	 *
	 * @param array  $items   Color items.
	 * @param string $url     URL.
	 * @param array  $context Context.
	 * @return array|null
	 */
	private static function pick_color_item( $items, $url, $context ) {
		if ( empty( $items ) ) {
			return null;
		}
		if ( 1 === count( $items ) ) {
			return $items[0];
		}

		$needles = array();
		$parts   = wp_parse_url( $url );
		$query   = array();
		if ( ! empty( $parts['query'] ) ) {
			parse_str( $parts['query'], $query );
		}
		foreach ( array( 'color', 'colour', 'attribute_pa_color' ) as $k ) {
			if ( ! empty( $query[ $k ] ) ) {
				$needles[] = mb_strtolower( rawurldecode( (string) $query[ $k ] ) );
			}
		}
		if ( ! empty( $context['variation_attributes'] ) && is_array( $context['variation_attributes'] ) ) {
			foreach ( $context['variation_attributes'] as $v ) {
				$needles[] = mb_strtolower( rawurldecode( (string) $v ) );
			}
		}
		$needles = array_filter( array_unique( $needles ) );

		if ( $needles ) {
			foreach ( $items as $item ) {
				$hay = '';
				if ( ! empty( $item['color']['value'] ) ) {
					$hay .= ' ' . mb_strtolower( (string) $item['color']['value'] );
				}
				if ( ! empty( $item['color']['code'] ) ) {
					$hay .= ' ' . mb_strtolower( (string) $item['color']['code'] );
				}
				if ( ! empty( $item['_id'] ) ) {
					$hay .= ' ' . mb_strtolower( (string) $item['_id'] );
				}
				foreach ( $needles as $n ) {
					if ( $n && false !== strpos( $hay, $n ) ) {
						return $item;
					}
				}
			}
		}

		// Prefer first available.
		foreach ( $items as $item ) {
			if ( isset( $item['available'] ) && floatval( $item['available'] ) > 0 ) {
				return $item;
			}
		}
		return $items[0];
	}
}
