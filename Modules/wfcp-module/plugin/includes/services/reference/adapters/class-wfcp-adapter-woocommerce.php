<?php
/**
 * WooCommerce / ParsKala reference adapter (Iran Swimmers, Monirie, custom hosts).
 *
 * @package WFCP
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Class WFCP_Adapter_WooCommerce
 */
class WFCP_Adapter_WooCommerce implements WFCP_Reference_Adapter {

	/**
	 * {@inheritdoc}
	 */
	public function get_slug() {
		return 'woocommerce';
	}

	/**
	 * {@inheritdoc}
	 */
	public function can_handle( $url ) {
		$host = self::host( $url );
		if ( ! $host ) {
			return false;
		}

		$settings = WFCP_Helper::get_settings( 'reference' );
		$sources  = isset( $settings['sources'] ) && is_array( $settings['sources'] ) ? $settings['sources'] : array();

		if ( false !== strpos( $host, 'iranswimmers.com' ) ) {
			return ! empty( $sources['iranswimmers'] );
		}
		if ( false !== strpos( $host, 'iranswimgroupmonirie.ir' ) ) {
			return ! empty( $sources['monirie'] );
		}

		if ( empty( $sources['woocommerce'] ) ) {
			return false;
		}

		$extra = self::extra_hosts();
		foreach ( $extra as $allowed ) {
			if ( $host === $allowed || substr( $host, -strlen( '.' . $allowed ) ) === '.' . $allowed ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Source label by host.
	 *
	 * @param string $url URL.
	 * @return string
	 */
	public function detect_source_slug( $url ) {
		$host = self::host( $url );
		if ( false !== strpos( (string) $host, 'iranswimmers.com' ) ) {
			return 'iranswimmers';
		}
		if ( false !== strpos( (string) $host, 'iranswimgroupmonirie.ir' ) ) {
			return 'monirie';
		}
		return 'woocommerce';
	}

	/**
	 * {@inheritdoc}
	 */
	public function fetch( $url, $context = array() ) {
		$body = WFCP_Reference_HTTP::get_body( $url );
		if ( is_wp_error( $body ) ) {
			return $body;
		}

		$source = $this->detect_source_slug( $url );
		$variations = self::extract_variations( $body );

		if ( ! empty( $variations ) ) {
			$matched = self::match_variation( $variations, $url, $context );
			if ( is_wp_error( $matched ) ) {
				return $matched;
			}
			$price = isset( $matched['display_price'] ) ? floatval( $matched['display_price'] ) : null;
			if ( null === $price || $price <= 0 ) {
				$price = isset( $matched['display_regular_price'] ) ? floatval( $matched['display_regular_price'] ) : null;
			}
			$in_stock  = isset( $matched['is_in_stock'] ) ? (bool) $matched['is_in_stock'] : null;
			$stock_qty = null;
			if ( isset( $matched['max_qty'] ) && '' !== $matched['max_qty'] && null !== $matched['max_qty'] && is_numeric( $matched['max_qty'] ) ) {
				$stock_qty = (int) $matched['max_qty'];
			}
			return array(
				'price'      => ( $price && $price > 0 ) ? $price : null,
				'price_unit' => 'toman',
				'in_stock'   => $in_stock,
				'stock_qty'  => $stock_qty,
				'source'     => $source,
				'message'    => isset( $matched['variation_id'] ) ? sprintf( 'variation_id=%d', (int) $matched['variation_id'] ) : '',
			);
		}

		// Simple product.
		$price     = self::extract_simple_price_toman( $body );
		$in_stock  = self::extract_availability( $body );
		$stock_qty = self::extract_qty_max( $body );

		return array(
			'price'      => $price,
			'price_unit' => 'toman',
			'in_stock'   => $in_stock,
			'stock_qty'  => $stock_qty,
			'source'     => $source,
		);
	}

	/**
	 * Parse host from URL.
	 *
	 * @param string $url URL.
	 * @return string
	 */
	private static function host( $url ) {
		$parts = wp_parse_url( $url );
		$host  = isset( $parts['host'] ) ? strtolower( $parts['host'] ) : '';
		return preg_replace( '/^www\./', '', $host );
	}

	/**
	 * Extra Woo hosts from settings.
	 *
	 * @return string[]
	 */
	private static function extra_hosts() {
		$settings = WFCP_Helper::get_settings( 'reference' );
		$raw      = isset( $settings['extra_woo_hosts'] ) ? (string) $settings['extra_woo_hosts'] : '';
		$lines    = preg_split( '/[\r\n,]+/', $raw );
		$out      = array();
		foreach ( (array) $lines as $line ) {
			$line = strtolower( trim( $line ) );
			$line = preg_replace( '#^https?://#', '', $line );
			$line = preg_replace( '#/.*$#', '', $line );
			$line = preg_replace( '/^www\./', '', $line );
			if ( $line ) {
				$out[] = $line;
			}
		}
		return array_unique( $out );
	}

	/**
	 * Extract data-product_variations JSON.
	 *
	 * @param string $html HTML.
	 * @return array
	 */
	private static function extract_variations( $html ) {
		if ( ! preg_match( '/data-product_variations="([^"]*)"/', $html, $m ) ) {
			return array();
		}
		$raw  = html_entity_decode( $m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$data = json_decode( $raw, true );
		return is_array( $data ) ? $data : array();
	}

	/**
	 * Match a variation from list using URL query / context attributes.
	 *
	 * @param array  $variations Variations.
	 * @param string $url        URL.
	 * @param array  $context    Context.
	 * @return array|WP_Error
	 */
	private static function match_variation( $variations, $url, $context ) {
		$query = array();
		$parts = wp_parse_url( $url );
		if ( ! empty( $parts['query'] ) ) {
			parse_str( $parts['query'], $query );
		}

		$attrs = array();
		if ( ! empty( $context['variation_attributes'] ) && is_array( $context['variation_attributes'] ) ) {
			$attrs = $context['variation_attributes'];
		}
		foreach ( $query as $k => $v ) {
			if ( 0 === strpos( $k, 'attribute_' ) && '' !== $v ) {
				$attrs[ $k ] = $v;
			}
		}

		$wanted_vid = 0;
		if ( ! empty( $context['remote_variation_id'] ) ) {
			$wanted_vid = (int) $context['remote_variation_id'];
		} elseif ( ! empty( $query['variation_id'] ) ) {
			$wanted_vid = (int) $query['variation_id'];
		}

		if ( $wanted_vid > 0 ) {
			foreach ( $variations as $v ) {
				if ( isset( $v['variation_id'] ) && (int) $v['variation_id'] === $wanted_vid ) {
					return $v;
				}
			}
		}

		if ( ! empty( $attrs ) ) {
			foreach ( $variations as $v ) {
				if ( empty( $v['attributes'] ) || ! is_array( $v['attributes'] ) ) {
					continue;
				}
				if ( self::attrs_match( $v['attributes'], $attrs ) ) {
					return $v;
				}
			}
			return new WP_Error( 'wfcp_ref_var_match', __( 'وریبل متناظر در صفحه مرجع پیدا نشد. لینک وریبل یا ویژگی‌ها را بررسی کنید.', 'webina-woo-core' ) );
		}

		// No hint: if all same price and one in stock, use first in-stock; else fail asking for specific URL.
		$in_stock = array();
		foreach ( $variations as $v ) {
			if ( ! empty( $v['is_in_stock'] ) ) {
				$in_stock[] = $v;
			}
		}
		if ( 1 === count( $variations ) ) {
			return $variations[0];
		}
		if ( 1 === count( $in_stock ) ) {
			return $in_stock[0];
		}

		return new WP_Error(
			'wfcp_ref_var_needed',
			__( 'محصول مرجع متغیر است. برای هر وریبل لینک جدا (یا ویژگی در query) وارد کنید.', 'webina-woo-core' )
		);
	}

	/**
	 * Compare attribute maps (URL-encoded values allowed).
	 *
	 * @param array $remote Remote attrs.
	 * @param array $wanted Wanted attrs.
	 * @return bool
	 */
	private static function attrs_match( $remote, $wanted ) {
		foreach ( $wanted as $key => $val ) {
			$rval = isset( $remote[ $key ] ) ? (string) $remote[ $key ] : '';
			$val  = (string) $val;
			if ( '' === $val ) {
				continue;
			}
			$candidates = array_unique(
				array(
					$val,
					rawurldecode( $val ),
					rawurlencode( $val ),
					strtolower( $val ),
					strtolower( rawurldecode( $val ) ),
				)
			);
			$remote_cands = array_unique(
				array(
					$rval,
					rawurldecode( $rval ),
					strtolower( $rval ),
					strtolower( rawurldecode( $rval ) ),
				)
			);
			if ( ! array_intersect( $candidates, $remote_cands ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Extract display price in toman for simple products.
	 *
	 * Prefer visible WooCommerce price HTML over OG (often rial).
	 *
	 * @param string $html HTML.
	 * @return float|null
	 */
	private static function extract_simple_price_toman( $html ) {
		// Schema Offer price — may be rial on some themes.
		$schema_price = null;
		if ( preg_match_all( '/"price"\s*:\s*"?(\d+(?:\.\d+)?)"?/', $html, $mm ) ) {
			foreach ( $mm[1] as $p ) {
				$schema_price = floatval( $p );
				break;
			}
		}

		// Visible toman amount near price_sale / woocommerce-Price-amount.
		if ( preg_match( '/price_sale[^>]*>.*?<bdi[^>]*>\s*([\d٬,.\s]+)/u', $html, $m )
			|| preg_match( '/woocommerce-Price-amount[^>]*>.*?<bdi[^>]*>\s*([\d٬,.\s]+)/u', $html, $m ) ) {
			$display = self::parse_fa_number( $m[1] );
			if ( $display > 0 ) {
				return $display;
			}
		}

		// Persian/Arabic digits in "X تومان" near summary.
		if ( preg_match( '/([\d۰-۹٬,.\s]+)\s*تومان/u', $html, $m ) ) {
			$display = self::parse_fa_number( $m[1] );
			if ( $display > 0 ) {
				return $display;
			}
		}

		if ( $schema_price && $schema_price > 0 ) {
			// If schema is ~10x a typical display, treat as rial.
			if ( $schema_price >= 100000 && 0 === ( (int) $schema_price % 10 ) ) {
				return $schema_price / 10.0;
			}
			return $schema_price;
		}

		if ( preg_match( '/product:price:amount"\s+content="(\d+(?:\.\d+)?)"/', $html, $m ) ) {
			$og = floatval( $m[1] );
			if ( $og >= 100000 && 0 === ( (int) $og % 10 ) ) {
				return $og / 10.0;
			}
			return $og > 0 ? $og : null;
		}

		return null;
	}

	/**
	 * Availability from schema / body classes.
	 *
	 * @param string $html HTML.
	 * @return bool|null
	 */
	private static function extract_availability( $html ) {
		if ( preg_match( '/schema\.org\/OutOfStock/i', $html ) || preg_match( '/\boutofstock\b/i', $html ) ) {
			return false;
		}
		if ( preg_match( '/product:availability"\s+content="([^"]+)"/', $html, $m ) ) {
			$av = strtolower( $m[1] );
			if ( false !== strpos( $av, 'out' ) ) {
				return false;
			}
			if ( false !== strpos( $av, 'in' ) ) {
				return true;
			}
		}
		if ( preg_match( '/schema\.org\/InStock/i', $html ) ) {
			return true;
		}
		if ( false !== strpos( $html, 'ناموجود' ) ) {
			return false;
		}
		return null;
	}

	/**
	 * Quantity max from input.
	 *
	 * @param string $html HTML.
	 * @return int|null
	 */
	private static function extract_qty_max( $html ) {
		if ( preg_match( '/name=["\']quantity["\'][^>]*max=["\'](\d+)["\']/i', $html, $m )
			|| preg_match( '/max=["\'](\d+)["\'][^>]*name=["\']quantity["\']/i', $html, $m ) ) {
			$q = (int) $m[1];
			return $q > 0 ? $q : null;
		}
		return null;
	}

	/**
	 * Parse Persian/English number string.
	 *
	 * @param string $str Number string.
	 * @return float
	 */
	private static function parse_fa_number( $str ) {
		$map = array(
			'۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
			'۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
			'٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
			'٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
			'٬' => '', ',' => '', ' ' => '',
		);
		$str = strtr( (string) $str, $map );
		$str = preg_replace( '/[^\d.]/', '', $str );
		return floatval( $str );
	}
}
