<?php
/**
 * Product order-config attributes (storefront swatches, cart/order meta — not WC variations).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin-selected non-variation attribute configs on variable products.
 */
class Webino_Dashboard_Order_Configs {

	const META_KEY  = '_webino_order_configs';
	const CART_KEY  = 'webino_order_cfg';
	const POST_KEY  = 'webino_cfg';

	/**
	 * Prevents re-entrant picker HTML generation (PHP-FPM timeout/recursion guard).
	 *
	 * @var bool
	 */
	private static $building_picker = false;

	/**
	 * Prevents re-entrant axis resolution.
	 *
	 * @var bool
	 */
	private static $computing_axes = false;

	/**
	 * @param string              $message       Unused.
	 * @param array<string,mixed> $data          Unused.
	 * @param string              $hypothesis_id Unused.
	 * @return void
	 */
	private static function agent_debug_log( $message, array $data, $hypothesis_id ) {
		unset( $message, $data, $hypothesis_id );
	}

	/**
	 * @param string              $message       Unused.
	 * @param array<string,mixed> $data          Unused.
	 * @param string              $hypothesis_id Unused.
	 * @return void
	 */
	public static function agent_debug_log_public( $message, array $data, $hypothesis_id ) {
		unset( $message, $data, $hypothesis_id );
	}

	/**
	 * Keep WooCommerce taxonomy keys intact (Persian pa_* names break sanitize_key).
	 *
	 * @param mixed $name Raw attribute / taxonomy name.
	 * @return string
	 */
	private static function normalize_config_name( $name ) {
		return trim( (string) $name );
	}

	/**
	 * Safe HTML id for a config field (taxonomy may contain non-Latin chars).
	 *
	 * @param string $name Config name.
	 * @return string
	 */
	private static function field_dom_id( $name ) {
		$name = self::normalize_config_name( $name );
		if ( '' === $name ) {
			return 'webino_cfg';
		}
		return 'webino_cfg_' . substr( md5( $name ), 0, 10 );
	}

	/**
	 * Latin POST array key for webino_cfg (Persian taxonomy names break HTML/JS sanitizers).
	 *
	 * @param string $name Attribute taxonomy / key.
	 * @return string
	 */
	private static function post_field_key( $name ) {
		$name = self::normalize_config_name( $name );
		return '' === $name ? '' : md5( $name );
	}

	/**
	 * @return void
	 */
	public static function init() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}
		self::cleanup_debug_log_file();
		// Picker HTML is injected client-side (variation-swatches.js + REST). PHP render hooks caused timeouts.
		add_action( 'rest_api_init', array( __CLASS__, 'register_rest_routes' ) );
		add_filter( 'litespeed_control_cacheable', array( __CLASS__, 'litespeed_disable_cache_when_configs' ), 20 );
		add_filter( 'woocommerce_add_to_cart_validation', array( __CLASS__, 'validate_add_to_cart' ), 20, 5 );
		add_filter( 'woocommerce_add_cart_item_data', array( __CLASS__, 'add_cart_item_data' ), 20, 4 );
		add_filter( 'woocommerce_get_cart_item_from_session', array( __CLASS__, 'cart_item_from_session' ), 20, 2 );
		add_filter( 'woocommerce_get_item_data', array( __CLASS__, 'cart_item_data_display' ), 20, 2 );
		add_action( 'woocommerce_checkout_create_order_line_item', array( __CLASS__, 'order_line_item' ), 20, 4 );
	}

	/**
	 * Remove runaway debug log from prior builds (was causing disk lock/contention).
	 *
	 * @return void
	 */
	private static function cleanup_debug_log_file() {
		if ( ! defined( 'WP_CONTENT_DIR' ) ) {
			return;
		}
		$path = WP_CONTENT_DIR . '/uploads/webino-debug-ff9619.log';
		if ( is_file( $path ) && filesize( $path ) > 100000 ) {
			// phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			@unlink( $path );
		}
	}

	/**
	 * @param int $product_id Product ID.
	 * @return array<int,array{name:string,default:string,attribute_id:int}>
	 */
	public static function get_configs( $product_id ) {
		$product_id = (int) $product_id;
		if ( $product_id <= 0 ) {
			return array();
		}
		$raw = get_post_meta( $product_id, self::META_KEY, true );
		if ( is_string( $raw ) && '' !== $raw ) {
			$decoded = json_decode( $raw, true );
			$raw     = is_array( $decoded ) ? $decoded : array();
		}
		if ( ! is_array( $raw ) ) {
			return array();
		}
		$out  = array();
		$seen = array();
		foreach ( $raw as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$name = self::normalize_config_name( $row['name'] ?? '' );
			if ( '' === $name || 'pa_' === $name || isset( $seen[ $name ] ) ) {
				continue;
			}
			$seen[ $name ] = true;
			$out[]         = array(
				'name'          => $name,
				'default'       => self::normalize_term_slug( (string) ( $row['default'] ?? '' ) ),
				'attribute_id'  => (int) ( $row['attribute_id'] ?? 0 ),
			);
		}
		return $out;
	}

	/**
	 * @param int                              $product_id Product ID.
	 * @param array<int,array<string,mixed>>   $configs    Config rows.
	 * @param bool                             $preserve_if_empty Keep existing meta when save yields nothing but admin requested configs.
	 * @return void
	 */
	public static function save_configs( $product_id, $configs, $preserve_if_empty = false ) {
		$product_id = (int) $product_id;
		if ( $product_id <= 0 ) {
			return;
		}
		if ( ! is_array( $configs ) ) {
			if ( ! $preserve_if_empty ) {
				delete_post_meta( $product_id, self::META_KEY );
			}
			self::purge_product_page_cache( $product_id );
			return;
		}
		$clean = self::sanitize_configs( $configs, $product_id );
		if ( array() === $clean ) {
			if ( $preserve_if_empty ) {
				return;
			}
			delete_post_meta( $product_id, self::META_KEY );
			self::purge_product_page_cache( $product_id );
			return;
		}
		update_post_meta( $product_id, self::META_KEY, $clean );
		self::purge_product_page_cache( $product_id );
		// #region agent log
		self::agent_debug_log(
			'save_configs',
			array(
				'product_id' => $product_id,
				'count'      => count( $clean ),
				'configs'    => $clean,
			),
			'H-save'
		);
		// #endregion
	}

	/**
	 * @param array<int,array<string,mixed>> $configs    Raw configs.
	 * @param int                            $product_id Product ID for default resolution.
	 * @return array<int,array{name:string,default:string,attribute_id:int}>
	 */
	public static function sanitize_configs( $configs, $product_id = 0 ) {
		$out  = array();
		$seen = array();
		foreach ( $configs as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$name = self::normalize_config_name( $row['name'] ?? '' );
			if ( '' === $name || 'pa_' === $name || isset( $seen[ $name ] ) ) {
				continue;
			}
			$seen[ $name ]      = true;
			$attribute_id       = (int) ( $row['attribute_id'] ?? 0 );
			$default            = self::resolve_default_slug(
				(string) ( $row['default'] ?? '' ),
				$attribute_id,
				$name
			);
			if ( '' === $default && $product_id > 0 ) {
				$default = self::first_term_slug_for_attribute( $product_id, $name, $attribute_id );
			}
			$out[] = array(
				'name'         => $name,
				'default'      => $default,
				'attribute_id' => $attribute_id,
			);
		}
		return $out;
	}

	/**
	 * Resolve admin default (slug, term id, or label) to the canonical term slug in DB.
	 *
	 * @param string $raw          Raw default from UI.
	 * @param int    $attribute_id Global attribute ID.
	 * @param string $taxonomy     Attribute taxonomy / name.
	 * @return string
	 */
	public static function resolve_default_slug( $raw, $attribute_id = 0, $taxonomy = '' ) {
		$raw = self::normalize_term_slug( $raw );
		if ( '' === $raw ) {
			return '';
		}
		if ( ctype_digit( $raw ) ) {
			$term = get_term( (int) $raw );
			if ( $term instanceof WP_Term && ! is_wp_error( $term ) ) {
				return (string) $term->slug;
			}
		}
		$taxonomy = self::normalize_config_name( $taxonomy );
		if ( '' !== $taxonomy && taxonomy_exists( $taxonomy ) ) {
			$term = get_term_by( 'slug', $raw, $taxonomy );
			if ( ! $term ) {
				$term = get_term_by( 'name', $raw, $taxonomy );
			}
			if ( $term instanceof WP_Term && ! is_wp_error( $term ) ) {
				return (string) $term->slug;
			}
		}
		if ( $attribute_id > 0 && function_exists( 'wc_attribute_taxonomy_name_by_id' ) ) {
			$tax = wc_attribute_taxonomy_name_by_id( (int) $attribute_id );
			if ( is_string( $tax ) && '' !== $tax && taxonomy_exists( $tax ) ) {
				$term = get_term_by( 'slug', $raw, $tax );
				if ( ! $term ) {
					$term = get_term_by( 'name', $raw, $tax );
				}
				if ( $term instanceof WP_Term && ! is_wp_error( $term ) ) {
					return (string) $term->slug;
				}
			}
		}
		return $raw;
	}

	/**
	 * @param int    $product_id Product ID.
	 * @param string $name       Attribute taxonomy / key.
	 * @return string
	 */
	private static function first_term_slug_for_attribute( $product_id, $name, $attribute_id = 0 ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return '';
		}
		$product = wc_get_product( (int) $product_id );
		if ( ! $product ) {
			return '';
		}
		$attr = self::find_product_attribute( $product, $name, (int) $attribute_id );
		if ( ! $attr instanceof WC_Product_Attribute ) {
			return '';
		}
		$taxonomy = (string) $attr->get_name();
		$terms    = self::attribute_terms( $attr, $taxonomy, (int) $product_id );
		if ( array() === $terms ) {
			return '';
		}
		return self::normalize_term_slug( (string) ( $terms[0]['slug'] ?? '' ) );
	}

	/**
	 * @param mixed $slug Raw slug.
	 * @return string
	 */
	private static function normalize_term_slug( $slug ) {
		return rawurldecode( trim( (string) $slug ) );
	}

	/**
	 * @param mixed $a Slug A.
	 * @param mixed $b Slug B.
	 * @return bool
	 */
	private static function slug_matches( $a, $b ) {
		$a = self::normalize_term_slug( $a );
		$b = self::normalize_term_slug( $b );
		if ( '' === $a || '' === $b ) {
			return false;
		}
		if ( $a === $b ) {
			return true;
		}
		return sanitize_title( $a ) === sanitize_title( $b );
	}

	/**
	 * Merge saved order-config flags into REST attribute rows.
	 *
	 * @param int                              $product_id Product ID.
	 * @param array<int,array<string,mixed>>   $attrs      Attribute rows.
	 * @return array<int,array<string,mixed>>
	 */
	public static function merge_into_attribute_rows( $product_id, $attrs ) {
		if ( ! is_array( $attrs ) ) {
			return array();
		}
		$configs = self::get_configs( $product_id );
		foreach ( $attrs as $i => $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$matched = null;
			foreach ( $configs as $cfg ) {
				if ( self::config_matches_attribute_row( $cfg, $row, $product_id ) ) {
					$matched = $cfg;
					break;
				}
			}
			if ( is_array( $matched ) ) {
				$attrs[ $i ]['order_config']         = true;
				$attrs[ $i ]['order_config_default'] = (string) ( $matched['default'] ?? '' );
			} else {
				$attrs[ $i ]['order_config']         = false;
				$attrs[ $i ]['order_config_default'] = '';
			}
		}
		return $attrs;
	}

	/**
	 * @param array{name:string,default:string,attribute_id:int} $cfg         Saved config.
	 * @param array<string,mixed>                                $row         Attribute row.
	 * @param int                                                $product_id Product ID.
	 * @return bool
	 */
	private static function config_matches_attribute_row( $cfg, $row, $product_id ) {
		$cfg_aid = (int) ( $cfg['attribute_id'] ?? 0 );
		$row_aid = (int) ( $row['attribute_id'] ?? 0 );
		if ( $cfg_aid > 0 && $row_aid > 0 && $cfg_aid === $row_aid ) {
			return true;
		}
		$cfg_name = self::normalize_config_name( $cfg['name'] ?? '' );
		$row_name = self::normalize_config_name( $row['name'] ?? '' );
		if ( '' !== $cfg_name && '' !== $row_name && $cfg_name === $row_name ) {
			return true;
		}
		if ( '' === $cfg_name || '' === $row_name || ! function_exists( 'wc_get_product' ) || ! function_exists( 'wc_attribute_label' ) ) {
			return false;
		}
		$product = wc_get_product( (int) $product_id );
		if ( ! $product ) {
			return false;
		}
		$row_label = self::normalize_config_name( (string) wc_attribute_label( $row_name, $product ) );
		if ( '' !== $row_label && $cfg_name === $row_label ) {
			return true;
		}
		$cfg_label = self::normalize_config_name( (string) wc_attribute_label( $cfg_name, $product ) );
		return '' !== $cfg_label && $cfg_label === $row_label;
	}

	/**
	 * @param int $product_id Product ID.
	 * @return array<int,array<string,mixed>>
	 */
	public static function storefront_axes( $product_id ) {
		if ( self::$computing_axes ) {
			return array();
		}
		self::$computing_axes = true;
		$product_id = (int) $product_id;
		if ( $product_id <= 0 || ! function_exists( 'wc_get_product' ) ) {
			self::$computing_axes = false;
			return array();
		}
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return array();
		}
		$axes    = array();
		$configs = self::get_configs( $product_id );
		$failures = array();
		foreach ( $configs as $cfg ) {
			$axis = self::axis_for_config( $product, $cfg );
			if ( is_array( $axis ) ) {
				$axes[] = $axis;
				continue;
			}
			$failures[] = array(
				'name'          => $cfg['name'] ?? '',
				'attribute_id'  => (int) ( $cfg['attribute_id'] ?? 0 ),
				'attr_found'    => null !== self::find_product_attribute(
					$product,
					(string) ( $cfg['name'] ?? '' ),
					(int) ( $cfg['attribute_id'] ?? 0 )
				),
				'product_attrs' => array_keys( $product->get_attributes() ),
			);
		}
		// #region agent log
		if ( is_product() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			self::agent_debug_log(
				'storefront_axes',
				array(
					'product_id'   => $product_id,
					'config_count' => count( $configs ),
					'axis_count'   => count( $axes ),
					'configs'      => $configs,
					'failures'     => $failures,
				),
				'H-render'
			);
		}
		// #endregion
		self::$computing_axes = false;
		return $axes;
	}

	/**
	 * Purge product page caches after order-config meta changes.
	 *
	 * @param int $product_id Product ID.
	 * @return void
	 */
	public static function purge_product_page_cache( $product_id ) {
		$product_id = (int) $product_id;
		if ( $product_id <= 0 ) {
			return;
		}
		clean_post_cache( $product_id );
		if ( function_exists( 'wc_delete_product_transients' ) ) {
			wc_delete_product_transients( $product_id );
		}
		$url = get_permalink( $product_id );
		if ( is_string( $url ) && '' !== $url ) {
			if ( function_exists( 'litespeed_purge_url' ) ) {
				litespeed_purge_url( $url );
			}
			if ( has_action( 'litespeed_purge_url' ) ) {
				do_action( 'litespeed_purge_url', $url );
			}
		}
		if ( function_exists( 'litespeed_purge_post' ) ) {
			litespeed_purge_post( $product_id );
		}
		// #region agent log
		self::agent_debug_log(
			'cache_purged',
			array(
				'product_id' => $product_id,
				'url'        => is_string( $url ) ? $url : '',
			),
			'H-cache'
		);
		// #endregion
	}

	/**
	 * @param bool $cacheable LiteSpeed cacheable flag.
	 * @return bool
	 */
	public static function litespeed_disable_cache_when_configs( $cacheable ) {
		if ( ! $cacheable ) {
			return $cacheable;
		}
		if ( function_exists( 'is_product' ) && is_product() ) {
			$product_id = (int) get_queried_object_id();
			if ( $product_id <= 0 && function_exists( 'get_the_ID' ) ) {
				$product_id = (int) get_the_ID();
			}
			if ( $product_id > 0 && array() !== self::get_configs( $product_id ) ) {
				return false;
			}
		}
		if ( function_exists( 'get_query_var' ) && get_query_var( 'webino_dashboard' ) ) {
			return false;
		}
		return $cacheable;
	}

	/**
	 * @return void
	 */
	public static function register_rest_routes() {
		register_rest_route(
			'webino-dashboard/v1',
			'/storefront/products/(?P<id>\d+)/order-config-picker',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_storefront_picker' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function rest_storefront_picker( $request ) {
		$product_id = (int) $request['id'];
		$product    = function_exists( 'wc_get_product' ) ? wc_get_product( $product_id ) : null;
		if ( ! $product || ! $product->is_visible() || 'publish' !== $product->get_status() ) {
			return new WP_REST_Response( array( 'html' => '' ), 200 );
		}
		$html = self::build_picker_html( $product_id, true );
		// #region agent log
		self::agent_debug_log(
			'rest_storefront_picker',
			array(
				'product_id' => $product_id,
				'has_html'   => '' !== $html,
			),
			'H-render'
		);
		// #endregion
		return new WP_REST_Response( array( 'html' => $html ), 200 );
	}

	/**
	 * @param int  $product_id  Product ID.
	 * @param bool $standalone Wrap output for late injection.
	 * @return string
	 */
	public static function build_picker_html( $product_id, $standalone = true ) {
		if ( self::$building_picker ) {
			return '';
		}
		self::$building_picker = true;
		$product = function_exists( 'wc_get_product' ) ? wc_get_product( (int) $product_id ) : null;
		if ( ! $product ) {
			self::$building_picker = false;
			return '';
		}
		$product   = self::normalize_product_context( $product );
		$parent_id = $product->is_type( 'variation' ) ? (int) $product->get_parent_id() : (int) $product->get_id();
		$axes      = self::storefront_axes( $parent_id );
		if ( array() === $axes ) {
			self::$building_picker = false;
			return '';
		}
		$rows = '';
		foreach ( $axes as $axis ) {
			$rows .= self::picker_row_html( $axis, $product );
		}
		if ( '' === $rows ) {
			self::$building_picker = false;
			return '';
		}
		ob_start();
		if ( $standalone ) {
			echo '<div class="wcf-fulfillment wcf-fulfillment--fallback wcf-order-config-fields">'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
		echo '<table class="variations wcf-variations webino-order-configs wcf-order-configs" cellspacing="0" role="presentation"><tbody class="wcf-fulfillment">'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo $rows; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo '</tbody></table>';
		if ( $standalone ) {
			echo '</div>';
		}
		$html = (string) ob_get_clean();
		self::$building_picker = false;
		return $html;
	}

	/**
	 * @param WC_Product                                          $product Product.
	 * @param array{name:string,default:string,attribute_id?:int} $cfg     Config row.
	 * @return array<string,mixed>|null
	 */
	private static function axis_for_config( $product, $cfg ) {
		$name         = self::normalize_config_name( $cfg['name'] ?? '' );
		$attribute_id = (int) ( $cfg['attribute_id'] ?? 0 );
		if ( '' === $name && $attribute_id <= 0 ) {
			return null;
		}
		$taxonomy = self::resolve_config_taxonomy( $name, $attribute_id );
		$attr     = self::find_product_attribute( $product, $name, $attribute_id );
		if ( ! $attr instanceof WC_Product_Attribute && '' !== $taxonomy ) {
			$attr = self::attribute_from_taxonomy( $product, $taxonomy, $attribute_id );
		}
		if ( ! $attr instanceof WC_Product_Attribute ) {
			return null;
		}
		$taxonomy = (string) $attr->get_name();
		if ( '' === $taxonomy && '' !== $name ) {
			$taxonomy = $name;
		}
		$terms    = self::attribute_terms( $attr, $taxonomy, (int) $product->get_id() );
		if ( array() === $terms ) {
			return null;
		}
		$selected = self::resolve_default_slug(
			(string) ( $cfg['default'] ?? '' ),
			$attribute_id > 0 ? $attribute_id : (int) $attr->get_id(),
			$taxonomy
		);
		if ( '' === $selected || '' === self::label_for_term_slug( $terms, $selected ) ) {
			$selected = self::normalize_term_slug( (string) ( $terms[0]['slug'] ?? '' ) );
		}
		$canonical_name = '' !== $taxonomy ? $taxonomy : $name;
		$label          = self::attribute_label( $attr, $product, $taxonomy, $name );
		return array(
			'name'         => $canonical_name,
			'label'        => $label,
			'taxonomy'     => $taxonomy,
			'options'      => array_values(
				array_map(
					static function ( $term ) {
						return (string) ( $term['slug'] ?? '' );
					},
					$terms
				)
			),
			'terms'        => $terms,
			'default_slug' => $selected,
			'post_key'     => self::post_field_key( $canonical_name ),
			'field_name'   => self::POST_KEY . '[' . self::post_field_key( $canonical_name ) . ']',
			'field_id'     => self::field_dom_id( $canonical_name ),
		);
	}

	/**
	 * @param WC_Product $product      Product.
	 * @param string     $name         Attribute key / taxonomy / label.
	 * @param int        $attribute_id Global attribute ID.
	 * @return WC_Product_Attribute|null
	 */
	private static function resolve_config_taxonomy( $name, $attribute_id = 0 ) {
		$name         = self::normalize_config_name( $name );
		$attribute_id = (int) $attribute_id;
		if ( $attribute_id > 0 && function_exists( 'wc_attribute_taxonomy_name_by_id' ) ) {
			$tax = (string) wc_attribute_taxonomy_name_by_id( $attribute_id );
			if ( '' !== $tax ) {
				return $tax;
			}
		}
		if ( '' !== $name && taxonomy_exists( $name ) ) {
			return $name;
		}
		return '';
	}

	/**
	 * Build a product attribute object from assigned taxonomy terms when WC lookup fails.
	 *
	 * @param WC_Product $product      Product.
	 * @param string     $taxonomy     Taxonomy name.
	 * @param int        $attribute_id Global attribute ID.
	 * @return WC_Product_Attribute|null
	 */
	private static function attribute_from_taxonomy( $product, $taxonomy, $attribute_id = 0 ) {
		$taxonomy = (string) $taxonomy;
		if ( '' === $taxonomy || ! taxonomy_exists( $taxonomy ) || ! class_exists( 'WC_Product_Attribute' ) ) {
			return null;
		}
		$term_ids = array();
		$pid      = (int) $product->get_id();
		if ( $pid > 0 && function_exists( 'wc_get_product_terms' ) ) {
			$ids = wc_get_product_terms( $pid, $taxonomy, array( 'fields' => 'ids' ) );
			if ( ! is_wp_error( $ids ) && is_array( $ids ) ) {
				$term_ids = array_values( array_filter( array_map( 'intval', $ids ) ) );
			}
		}
		if ( array() === $term_ids ) {
			$term_ids = self::term_ids_from_product_attribute( $product, $taxonomy, $attribute_id );
		}
		if ( array() === $term_ids && method_exists( $product, 'get_attribute' ) ) {
			$term_ids = self::term_ids_from_attribute_string( $product, $taxonomy );
		}
		if ( array() === $term_ids ) {
			return null;
		}
		$attr = new WC_Product_Attribute();
		if ( $attribute_id > 0 ) {
			$attr->set_id( $attribute_id );
		}
		$attr->set_name( $taxonomy );
		$attr->set_options( $term_ids );
		$attr->set_visible( true );
		$attr->set_variation( false );
		return $attr;
	}

	/**
	 * @param WC_Product $product      Product.
	 * @param string     $taxonomy     Taxonomy.
	 * @param int        $attribute_id Global attribute ID.
	 * @return array<int,int>
	 */
	private static function term_ids_from_product_attribute( $product, $taxonomy, $attribute_id = 0 ) {
		$taxonomy     = (string) $taxonomy;
		$attribute_id = (int) $attribute_id;
		$term_ids     = array();
		foreach ( $product->get_attributes() as $key => $attr ) {
			if ( ! $attr instanceof WC_Product_Attribute ) {
				continue;
			}
			$attr_tax = (string) $attr->get_name();
			$key      = (string) $key;
			$matches  = ( '' !== $taxonomy && ( $attr_tax === $taxonomy || $key === $taxonomy ) )
				|| ( $attribute_id > 0 && (int) $attr->get_id() === $attribute_id );
			if ( ! $matches ) {
				continue;
			}
			foreach ( (array) $attr->get_options() as $opt ) {
				if ( is_numeric( $opt ) ) {
					$term_ids[] = (int) $opt;
				}
			}
			if ( array() !== $term_ids ) {
				break;
			}
		}
		return array_values( array_unique( array_filter( $term_ids ) ) );
	}

	/**
	 * @param WC_Product $product  Product.
	 * @param string     $taxonomy Taxonomy.
	 * @return array<int,int>
	 */
	private static function term_ids_from_attribute_string( $product, $taxonomy ) {
		$taxonomy = (string) $taxonomy;
		if ( '' === $taxonomy || ! taxonomy_exists( $taxonomy ) || ! method_exists( $product, 'get_attribute' ) ) {
			return array();
		}
		$raw = trim( (string) $product->get_attribute( $taxonomy ) );
		if ( '' === $raw ) {
			return array();
		}
		$term_ids = array();
		foreach ( preg_split( '/\s*,\s*/u', $raw ) as $label ) {
			$label = trim( (string) $label );
			if ( '' === $label ) {
				continue;
			}
			$term = get_term_by( 'name', $label, $taxonomy );
			if ( ! $term instanceof WP_Term || is_wp_error( $term ) ) {
				$term = get_term_by( 'slug', sanitize_title( $label ), $taxonomy );
			}
			if ( $term instanceof WP_Term && ! is_wp_error( $term ) ) {
				$term_ids[] = (int) $term->term_id;
			}
		}
		return array_values( array_unique( array_filter( $term_ids ) ) );
	}

	/**
	 * @param WC_Product $product      Product.
	 * @param string     $name         Attribute key / taxonomy / label.
	 * @param int        $attribute_id Global attribute ID.
	 * @return WC_Product_Attribute|null
	 */
	private static function find_product_attribute( $product, $name, $attribute_id = 0 ) {
		$name         = self::normalize_config_name( $name );
		$attribute_id = (int) $attribute_id;
		$tax_by_id    = self::resolve_config_taxonomy( $name, $attribute_id );
		if ( $attribute_id > 0 ) {
			foreach ( $product->get_attributes() as $key => $attr ) {
				if ( ! $attr instanceof WC_Product_Attribute ) {
					continue;
				}
				if ( (int) $attr->get_id() === $attribute_id ) {
					return $attr;
				}
			}
		}
		if ( '' !== $tax_by_id ) {
			foreach ( $product->get_attributes() as $key => $attr ) {
				if ( ! $attr instanceof WC_Product_Attribute ) {
					continue;
				}
				$attr_name = (string) $attr->get_name();
				if ( $attr_name === $tax_by_id || (string) $key === $tax_by_id ) {
					return $attr;
				}
			}
		}
		if ( '' === $name ) {
			return null;
		}
		foreach ( $product->get_attributes() as $key => $attr ) {
			if ( ! $attr instanceof WC_Product_Attribute ) {
				continue;
			}
			$attr_name = (string) $attr->get_name();
			if ( $attr_name === $name || (string) $key === $name ) {
				return $attr;
			}
			if ( function_exists( 'wc_attribute_label' ) ) {
				$label = self::normalize_config_name( (string) wc_attribute_label( $attr_name, $product ) );
				if ( '' !== $label && $label === $name ) {
					return $attr;
				}
			}
		}
		return null;
	}

	/**
	 * @param mixed  $opt      Term id, slug, or name.
	 * @param string $taxonomy Attribute taxonomy.
	 * @return WP_Term|null
	 */
	private static function resolve_attribute_term( $opt, $taxonomy ) {
		$taxonomy = (string) $taxonomy;
		$term     = null;
		if ( is_numeric( $opt ) ) {
			$term = get_term( (int) $opt );
			if ( ( ! $term || is_wp_error( $term ) ) && '' !== $taxonomy && taxonomy_exists( $taxonomy ) ) {
				$term = get_term( (int) $opt, $taxonomy );
			}
		} else {
			if ( '' !== $taxonomy && taxonomy_exists( $taxonomy ) ) {
				$term = get_term_by( 'slug', (string) $opt, $taxonomy );
				if ( ! $term ) {
					$term = get_term_by( 'slug', self::normalize_term_slug( (string) $opt ), $taxonomy );
				}
				if ( ! $term ) {
					$term = get_term_by( 'name', (string) $opt, $taxonomy );
				}
			}
		}
		if ( ! $term instanceof WP_Term || is_wp_error( $term ) ) {
			return null;
		}
		return $term;
	}

	/**
	 * @param WC_Product|null $product Explicit product or null for current PDP product.
	 * @return WC_Product|null
	 */
	private static function current_product( $product = null ) {
		if ( $product && is_a( $product, 'WC_Product' ) ) {
			return self::normalize_product_context( $product );
		}
		global $product;
		if ( $product && is_a( $product, 'WC_Product' ) ) {
			return self::normalize_product_context( $product );
		}
		if ( function_exists( 'wc_get_product' ) && function_exists( 'is_product' ) && is_product() ) {
			$id = (int) get_queried_object_id();
			if ( $id <= 0 && function_exists( 'get_the_ID' ) ) {
				$id = (int) get_the_ID();
			}
			if ( $id > 0 ) {
				$p = wc_get_product( $id );
				if ( $p && is_a( $p, 'WC_Product' ) ) {
					return self::normalize_product_context( $p );
				}
			}
		}
		return null;
	}

	/**
	 * @param WC_Product $product Product.
	 * @return WC_Product
	 */
	private static function normalize_product_context( $product ) {
		if ( $product->is_type( 'variation' ) && function_exists( 'wc_get_product' ) ) {
			$parent = wc_get_product( (int) $product->get_parent_id() );
			if ( $parent && is_a( $parent, 'WC_Product' ) ) {
				return $parent;
			}
		}
		return $product;
	}

	/**
	 * @param WC_Product_Attribute $attr     Attribute.
	 * @param WC_Product           $product  Product.
	 * @param string               $taxonomy Taxonomy or empty.
	 * @param string               $key      Attribute array key.
	 * @return string
	 */
	private static function attribute_label( $attr, $product, $taxonomy, $key = '' ) {
		if ( $taxonomy && function_exists( 'wc_attribute_label' ) ) {
			return (string) wc_attribute_label( $taxonomy, $product );
		}
		$key = self::normalize_config_name( $key );
		if ( '' !== $key ) {
			return $key;
		}
		return self::normalize_config_name( (string) $attr->get_name() );
	}

	/**
	 * @param WP_Term $term     Term.
	 * @param string  $taxonomy Taxonomy.
	 * @return array{id:int,slug:string,name:string,image_url:string}
	 */
	private static function term_row_from_wp_term( $term, $taxonomy ) {
		$image_url = '';
		if ( class_exists( 'Webino_Dashboard_Variation_Swatches', false ) ) {
			$img = Webino_Dashboard_Variation_Swatches::resolve_term_image( (int) $term->term_id, $taxonomy );
			$image_url = isset( $img['url'] ) ? (string) $img['url'] : '';
		}
		return array(
			'id'        => (int) $term->term_id,
			'slug'      => rawurldecode( (string) $term->slug ),
			'name'      => (string) $term->name,
			'image_url' => $image_url,
		);
	}

	/**
	 * @param WC_Product_Attribute $attr       Attribute.
	 * @param string               $taxonomy   Taxonomy or empty.
	 * @param int                  $product_id Product ID.
	 * @return array<int,array<string,mixed>>
	 */
	private static function attribute_terms( $attr, $taxonomy, $product_id = 0 ) {
		$terms      = array();
		$product_id = (int) $product_id;
		$taxonomy   = (string) $taxonomy;
		$seen       = array();

		foreach ( $attr->get_options() as $opt ) {
			if ( ! is_numeric( $opt ) ) {
				continue;
			}
			$term = '' !== $taxonomy ? get_term( (int) $opt, $taxonomy ) : get_term( (int) $opt );
			if ( ! $term instanceof WP_Term || is_wp_error( $term ) ) {
				continue;
			}
			if ( '' !== $taxonomy && $term->taxonomy !== $taxonomy ) {
				continue;
			}
			$key = (int) $term->term_id;
			if ( isset( $seen[ $key ] ) ) {
				continue;
			}
			$seen[ $key ] = true;
			$terms[]      = self::term_row_from_wp_term( $term, (string) $term->taxonomy );
		}
		if ( array() !== $terms ) {
			return $terms;
		}

		if ( '' !== $taxonomy ) {
			if ( $product_id > 0 && function_exists( 'wc_get_product_terms' ) ) {
				$wp_terms = wc_get_product_terms( $product_id, $taxonomy, array( 'fields' => 'all' ) );
				if ( ! is_wp_error( $wp_terms ) && is_array( $wp_terms ) && array() !== $wp_terms ) {
					foreach ( $wp_terms as $term ) {
						if ( $term instanceof WP_Term ) {
							$terms[] = self::term_row_from_wp_term( $term, $taxonomy );
						}
					}
					if ( array() !== $terms ) {
						return $terms;
					}
				}
			}

			if ( $product_id > 0 && taxonomy_exists( $taxonomy ) ) {
				$object_terms = wp_get_object_terms(
					$product_id,
					$taxonomy,
					array(
						'fields' => 'all',
					)
				);
				if ( ! is_wp_error( $object_terms ) && is_array( $object_terms ) ) {
					foreach ( $object_terms as $term ) {
						if ( $term instanceof WP_Term ) {
							$terms[] = self::term_row_from_wp_term( $term, $taxonomy );
						}
					}
					if ( array() !== $terms ) {
						return $terms;
					}
				}
			}

			foreach ( $attr->get_options() as $opt ) {
				$term = self::resolve_attribute_term( $opt, $taxonomy );
				if ( ! $term instanceof WP_Term ) {
					continue;
				}
				$key = (int) $term->term_id;
				if ( isset( $seen[ $key ] ) ) {
					continue;
				}
				$seen[ $key ] = true;
				$terms[]      = self::term_row_from_wp_term( $term, $taxonomy );
			}
			if ( array() !== $terms ) {
				return $terms;
			}

			foreach ( $attr->get_options() as $opt ) {
				$label = sanitize_text_field( (string) $opt );
				if ( '' === $label ) {
					continue;
				}
				$terms[] = array(
					'id'        => 0,
					'slug'      => (string) $opt,
					'name'      => $label,
					'image_url' => '',
				);
			}
			return $terms;
		}

		foreach ( $attr->get_options() as $opt ) {
			$label = sanitize_text_field( (string) $opt );
			if ( '' === $label ) {
				continue;
			}
			$terms[] = array(
				'id'        => 0,
				'slug'      => (string) $opt,
				'name'      => $label,
				'image_url' => '',
			);
		}
		return $terms;
	}

	/**
	 * @param array<int,array<string,mixed>> $terms Terms.
	 * @param string                         $slug  Slug.
	 * @return string
	 */
	public static function label_for_term_slug( $terms, $slug ) {
		$slug = self::normalize_term_slug( $slug );
		if ( '' === $slug || ! is_array( $terms ) ) {
			return '';
		}
		foreach ( $terms as $term ) {
			if ( ! is_array( $term ) ) {
				continue;
			}
			if ( ctype_digit( $slug ) && (int) $slug === (int) ( $term['id'] ?? 0 ) ) {
				return sanitize_text_field( (string) ( $term['name'] ?? '' ) );
			}
			if ( self::slug_matches( (string) ( $term['slug'] ?? '' ), $slug ) ) {
				return sanitize_text_field( (string) ( $term['name'] ?? '' ) );
			}
			if ( self::slug_matches( (string) ( $term['name'] ?? '' ), $slug ) ) {
				return sanitize_text_field( (string) ( $term['name'] ?? '' ) );
			}
		}
		return '';
	}

	/**
	 * @var bool
	 */
	private static $picker_rendered = false;

	/**
	 * Primary PDP output inside variations form (after WC variations table).
	 *
	 * @return void
	 */
	public static function render_picker() {
		self::render_picker_inner( false );
	}

	/**
	 * ishop / div-based variation templates (no variations table hook).
	 *
	 * @return void
	 */
	public static function render_picker_before_variation() {
		self::render_picker_inner( true );
	}

	/**
	 * Inside variations form, before weight/variation rows (ishop keeps this hook).
	 *
	 * @return void
	 */
	public static function render_picker_before_form() {
		self::render_picker_inner( true );
	}

	/**
	 * After the full variations form markup (ishop keeps this hook).
	 *
	 * @return void
	 */
	public static function render_picker_after_form() {
		self::render_picker_inner( true, true );
	}

	/**
	 * Fallback when variations table hook did not run (simple products, some themes).
	 *
	 * @return void
	 */
	public static function render_picker_fallback() {
		self::render_picker_inner( true );
	}

	/**
	 * Late fallback when neither primary nor in-form hook rendered output.
	 *
	 * @return void
	 */
	public static function render_picker_late_fallback() {
		if ( self::$picker_rendered ) {
			return;
		}
		self::render_picker_inner( true, true );
	}

	/**
	 * Last-resort output for themes that skip in-form WooCommerce hooks.
	 *
	 * @return void
	 */
	public static function render_picker_footer_fallback() {
		if ( self::$picker_rendered || ! function_exists( 'is_product' ) || ! is_product() ) {
			return;
		}
		self::render_picker_inner( true, true );
	}

	/**
	 * Product-page bootstrap: log PDP visits and disable full-page cache when configs exist.
	 *
	 * @return void
	 */
	public static function boot_storefront() {
		if ( ! function_exists( 'is_product' ) || ! is_product() ) {
			return;
		}
		$product_id = (int) get_queried_object_id();
		if ( $product_id <= 0 && function_exists( 'get_the_ID' ) ) {
			$product_id = (int) get_the_ID();
		}
		if ( $product_id <= 0 ) {
			return;
		}
		$configs = self::get_configs( $product_id );
		// #region agent log
		self::agent_debug_log(
			'pdp_boot',
			array(
				'product_id'   => $product_id,
				'config_count' => count( $configs ),
				'version'      => defined( 'WEBINO_DASHBOARD_VERSION' ) ? WEBINO_DASHBOARD_VERSION : '',
			),
			'H-render'
		);
		// #endregion
		if ( array() === $configs ) {
			return;
		}
		if ( ! headers_sent() ) {
			nocache_headers();
		}
	}

	/**
	 * Echo order-config swatches once per request (WC variations table markup).
	 *
	 * @param bool $fallback_only Skip when primary hook already rendered.
	 * @param bool $standalone      Wrap for late fallback outside variations table.
	 * @return void
	 */
	private static function render_picker_inner( $fallback_only = false, $standalone = false ) {
		if ( $fallback_only && self::$picker_rendered ) {
			return;
		}
		if ( self::$picker_rendered ) {
			return;
		}

		$product = self::current_product();
		if ( ! $product ) {
			// #region agent log
			if ( function_exists( 'is_product' ) && is_product() ) {
				self::agent_debug_log(
					'render_picker_no_product',
					array(
						'fallback_only' => (bool) $fallback_only,
						'standalone'    => (bool) $standalone,
					),
					'H-render'
				);
			}
			// #endregion
			return;
		}

		$parent_id = $product->is_type( 'variation' ) ? (int) $product->get_parent_id() : (int) $product->get_id();
		$axes      = self::storefront_axes( $parent_id );
		if ( array() === $axes ) {
			// #region agent log
			self::agent_debug_log(
				'render_picker_skipped',
				array(
					'product_id' => $parent_id,
					'reason'     => 'no_axes',
				),
				'H-render'
			);
			// #endregion
			return;
		}

		self::enqueue_for_product( $product );

		$html = self::build_picker_html( $parent_id, $fallback_only || $standalone );
		if ( '' === $html ) {
			return;
		}

		echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

		self::$picker_rendered = true;
		// #region agent log
		self::agent_debug_log(
			'render_picker_ok',
			array(
				'product_id' => $parent_id,
				'axis_count' => count( $axes ),
				'standalone' => (bool) $standalone,
			),
			'H-render'
		);
		// #endregion
	}

	/**
	 * @param array<string,mixed> $axis    Axis.
	 * @param WC_Product          $product Product.
	 * @return string
	 */
	private static function picker_row_html( $axis, $product ) {
		$label    = (string) ( $axis['label'] ?? '' );
		$taxonomy = (string) ( $axis['taxonomy'] ?? '' );
		$options  = isset( $axis['options'] ) && is_array( $axis['options'] ) ? $axis['options'] : array();
		$selected = (string) ( $axis['default_slug'] ?? '' );
		$field    = (string) ( $axis['field_name'] ?? '' );
		$field_id = (string) ( $axis['field_id'] ?? self::field_dom_id( (string) ( $axis['name'] ?? 'cfg' ) ) );
		if ( '' === $label || '' === $field || array() === $options ) {
			return '';
		}
		$swatches = '';
		if ( class_exists( 'Webino_Dashboard_Variation_Swatches', false ) ) {
			$swatches = Webino_Dashboard_Variation_Swatches::render_attribute_swatches(
				$taxonomy,
				$options,
				$selected,
				$field,
				$product,
				$field_id
			);
		}
		if ( '' === $swatches ) {
			$swatches = self::plain_select_html( $options, $axis['terms'] ?? array(), $selected, $field, $field_id );
		}
		$attr_key        = $taxonomy ? $taxonomy : $field_id;
		$variation_class = 'variation-webino-' . sanitize_html_class( self::post_field_key( $attr_key ) );
		ob_start();
		?>
		<tr class="<?php echo esc_attr( $variation_class ); ?> wcf-field" data-wcf-field="<?php echo esc_attr( $field_id ); ?>">
			<th class="label">
				<label class="product-single--add-to-cart--form-label" for="<?php echo esc_attr( $field_id ); ?>">
					<?php echo esc_html( $label ); ?> <abbr class="required" title="<?php echo esc_attr__( 'required', 'woocommerce' ); ?>">*</abbr>
				</label>
			</th>
			<td class="value wcf-field-value">
				<?php echo $swatches; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</td>
		</tr>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * @param array<int,string>              $options  Slugs.
	 * @param array<int,array<string,mixed>> $terms    Terms.
	 * @param string                         $selected Selected slug.
	 * @param string                         $name     Field name.
	 * @param string                         $id       Field id.
	 * @return string
	 */
	private static function plain_select_html( $options, $terms, $selected, $name, $id ) {
		ob_start();
		?>
		<select id="<?php echo esc_attr( $id ); ?>" name="<?php echo esc_attr( $name ); ?>" class="wcf-plain-select">
			<option value=""><?php echo esc_html__( 'Choose an option', 'woocommerce' ); ?></option>
			<?php foreach ( $options as $slug ) : ?>
				<?php
				$slug  = self::normalize_term_slug( (string) $slug );
				$label = self::label_for_term_slug( $terms, $slug );
				if ( '' === $slug || '' === $label ) {
					continue;
				}
				?>
				<option value="<?php echo esc_attr( $slug ); ?>" <?php selected( $selected, $slug ); ?>><?php echo esc_html( $label ); ?></option>
			<?php endforeach; ?>
		</select>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * @param int $product_id Product ID.
	 * @return int
	 */
	private static function resolve_parent_id( $product_id ) {
		$product = wc_get_product( (int) $product_id );
		if ( $product && $product->is_type( 'variation' ) ) {
			return (int) $product->get_parent_id();
		}
		return (int) $product_id;
	}

	/**
	 * @param bool  $passed     Passed.
	 * @param int   $product_id Product ID.
	 * @param int   $quantity   Quantity.
	 * @param int   $variation_id Variation ID.
	 * @param array $variations Variations.
	 * @return bool
	 */
	public static function validate_add_to_cart( $passed, $product_id, $quantity, $variation_id = 0, $variations = array() ) {
		unset( $quantity, $variation_id, $variations );
		if ( ! $passed ) {
			return false;
		}
		$parent_id = self::resolve_parent_id( (int) $product_id );
		$posted    = isset( $_POST[ self::POST_KEY ] ) && is_array( $_POST[ self::POST_KEY ] )
			? wp_unslash( $_POST[ self::POST_KEY ] )
			: array();
		foreach ( self::storefront_axes( $parent_id ) as $axis ) {
			$post_key = (string) ( $axis['post_key'] ?? self::post_field_key( $axis['name'] ?? '' ) );
			$name     = self::normalize_config_name( $axis['name'] ?? '' );
			$slug     = self::normalize_term_slug( (string) ( $posted[ $post_key ] ?? '' ) );
			$terms    = isset( $axis['terms'] ) && is_array( $axis['terms'] ) ? $axis['terms'] : array();
			if ( '' === $slug || '' === self::label_for_term_slug( $terms, $slug ) ) {
				$label = (string) ( $axis['label'] ?? $name );
				/* translators: %s: attribute label */
				wc_add_notice( sprintf( __( 'لطفاً «%s» را انتخاب کنید.', 'webino-dashboard' ), $label ), 'error' );
				return false;
			}
		}
		return true;
	}

	/**
	 * @param array<string,mixed> $cart_item_data Cart item data.
	 * @param int                 $product_id     Product ID.
	 * @param int                 $variation_id   Variation ID.
	 * @param int                 $quantity       Quantity.
	 * @return array<string,mixed>
	 */
	public static function add_cart_item_data( $cart_item_data, $product_id, $variation_id, $quantity ) {
		unset( $variation_id, $quantity );
		$parent_id = self::resolve_parent_id( (int) $product_id );
		$posted    = isset( $_POST[ self::POST_KEY ] ) && is_array( $_POST[ self::POST_KEY ] )
			? wp_unslash( $_POST[ self::POST_KEY ] )
			: array();
		$extra     = array();
		foreach ( self::storefront_axes( $parent_id ) as $axis ) {
			$post_key = (string) ( $axis['post_key'] ?? self::post_field_key( $axis['name'] ?? '' ) );
			$name     = self::normalize_config_name( $axis['name'] ?? '' );
			$slug     = self::normalize_term_slug( (string) ( $posted[ $post_key ] ?? '' ) );
			$terms    = isset( $axis['terms'] ) && is_array( $axis['terms'] ) ? $axis['terms'] : array();
			$label    = self::label_for_term_slug( $terms, $slug );
			if ( '' === $name || '' === $slug || '' === $label ) {
				continue;
			}
			$extra[ $name ] = array(
				'slug'  => $slug,
				'label' => $label,
				'title' => (string) ( $axis['label'] ?? $name ),
			);
		}
		if ( array() === $extra ) {
			return $cart_item_data;
		}
		$cart_item_data[ self::CART_KEY ] = $extra;
		$cart_item_data['unique_key']    = md5( wp_json_encode( $extra ) . ( $cart_item_data['unique_key'] ?? '' ) );
		return $cart_item_data;
	}

	/**
	 * @param array<string,mixed> $cart_item Item.
	 * @param array<string,mixed> $values    Session values.
	 * @return array<string,mixed>
	 */
	public static function cart_item_from_session( $cart_item, $values ) {
		if ( isset( $values[ self::CART_KEY ] ) && is_array( $values[ self::CART_KEY ] ) ) {
			$cart_item[ self::CART_KEY ] = $values[ self::CART_KEY ];
		}
		return $cart_item;
	}

	/**
	 * @param array<int,array<string,mixed>> $item_data Item data.
	 * @param array<string,mixed>            $cart_item Cart item.
	 * @return array<int,array<string,mixed>>
	 */
	public static function cart_item_data_display( $item_data, $cart_item ) {
		if ( empty( $cart_item[ self::CART_KEY ] ) || ! is_array( $cart_item[ self::CART_KEY ] ) ) {
			return $item_data;
		}
		foreach ( $cart_item[ self::CART_KEY ] as $row ) {
			if ( ! is_array( $row ) || empty( $row['label'] ) ) {
				continue;
			}
			$item_data[] = array(
				'key'   => sanitize_text_field( (string) ( $row['title'] ?? '' ) ),
				'value' => sanitize_text_field( (string) $row['label'] ),
			);
		}
		return $item_data;
	}

	/**
	 * @param WC_Order_Item_Product $item          Line item.
	 * @param string                $cart_item_key Cart key.
	 * @param array<string,mixed>   $values        Values.
	 * @param WC_Order              $order         Order.
	 * @return void
	 */
	public static function order_line_item( $item, $cart_item_key, $values, $order ) {
		unset( $cart_item_key, $order );
		if ( empty( $values[ self::CART_KEY ] ) || ! is_array( $values[ self::CART_KEY ] ) ) {
			return;
		}
		foreach ( $values[ self::CART_KEY ] as $row ) {
			if ( ! is_array( $row ) || empty( $row['label'] ) ) {
				continue;
			}
			$key = sanitize_text_field( (string) ( $row['title'] ?? '' ) );
			if ( '' === $key ) {
				continue;
			}
			$item->add_meta_data( $key, sanitize_text_field( (string) $row['label'] ), true );
		}
	}

	/**
	 * @return void
	 */
	public static function footer_inject_script() {
		if ( ! self::$picker_rendered ) {
			return;
		}
		?>
		<script>
		(function () {
			function run() {
				if (typeof window.webinoOrderConfigsInit === 'function') {
					window.webinoOrderConfigsInit();
				}
			}
			if (typeof jQuery !== 'undefined') {
				jQuery(run);
			} else if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', run);
			} else {
				run();
			}
			if (typeof jQuery !== 'undefined') {
				jQuery(window).on('load', run);
			}
		})();
		</script>
		<?php
	}

	/**
	 * Enqueue order-config storefront assets only (no variation-swatches recurse).
	 *
	 * @return void
	 */
	public static function enqueue_order_config_assets() {
		if ( wp_script_is( 'webino-order-configs', 'enqueued' ) || wp_script_is( 'webino-order-configs', 'done' ) ) {
			return;
		}
		$base = defined( 'WEBINO_DASHBOARD_DIR' )
			? WEBINO_DASHBOARD_DIR . 'assets/order-configs/'
			: dirname( __DIR__ ) . '/assets/order-configs/';
		$css  = $base . 'order-configs.css';
		$js   = $base . 'order-configs.js';
		if ( ! is_readable( $css ) || ! is_readable( $js ) ) {
			return;
		}
		$url_base = defined( 'WEBINO_DASHBOARD_FILE' )
			? plugins_url( 'assets/order-configs/', WEBINO_DASHBOARD_FILE )
			: plugins_url( 'assets/order-configs/', dirname( __DIR__ ) . '/webino-dashboard.php' );
		if ( ! wp_style_is( 'webino-variation-swatches', 'enqueued' ) && ! wp_style_is( 'webino-variation-swatches', 'done' ) ) {
			wp_enqueue_style(
				'webino-variation-swatches',
				plugins_url( 'assets/swatches/variation-swatches.css', WEBINO_DASHBOARD_FILE ),
				array(),
				defined( 'WEBINO_DASHBOARD_VERSION' ) ? WEBINO_DASHBOARD_VERSION : '1.0'
			);
		}
		wp_enqueue_style(
			'webino-order-configs',
			$url_base . 'order-configs.css',
			array( 'webino-variation-swatches' ),
			(string) filemtime( $css )
		);
		wp_enqueue_script(
			'webino-order-configs',
			$url_base . 'order-configs.js',
			array( 'jquery' ),
			(string) filemtime( $js ),
			true
		);
	}

	/**
	 * @param int $product_id Product ID.
	 * @return void
	 */
	public static function enqueue_storefront_assets_for_product( $product_id ) {
		$product_id = (int) $product_id;
		if ( $product_id <= 0 || ! function_exists( 'wc_get_product' ) ) {
			return;
		}
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return;
		}
		self::enqueue_for_product( self::normalize_product_context( $product ) );
	}

	/**
	 * @return void
	 */
	public static function enqueue() {
		if ( is_admin() || ! function_exists( 'is_product' ) || ! is_product() ) {
			return;
		}
		$product_id = (int) get_queried_object_id();
		if ( $product_id <= 0 && function_exists( 'get_the_ID' ) ) {
			$product_id = (int) get_the_ID();
		}
		if ( $product_id <= 0 || ! function_exists( 'wc_get_product' ) ) {
			return;
		}
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return;
		}
		self::enqueue_for_product( self::normalize_product_context( $product ) );
	}

	/**
	 * @param WC_Product|null $product Product (from dropdown args or current PDP).
	 * @return void
	 */
	private static function enqueue_for_product( $product ) {
		if ( ! $product instanceof WC_Product ) {
			return;
		}
		if ( wp_script_is( 'webino-order-configs', 'enqueued' ) || wp_script_is( 'webino-order-configs', 'done' ) ) {
			return;
		}
		$parent_id = $product->is_type( 'variation' ) ? (int) $product->get_parent_id() : (int) $product->get_id();
		if ( array() === self::get_configs( $parent_id ) ) {
			return;
		}
		if ( class_exists( 'Webino_Dashboard_Variation_Swatches', false ) ) {
			if (
				! wp_style_is( 'webino-variation-swatches', 'enqueued' )
				&& ! wp_style_is( 'webino-variation-swatches', 'done' )
			) {
				Webino_Dashboard_Variation_Swatches::enqueue();
			}
		}
		self::enqueue_order_config_assets();
	}
}
