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
		add_action( 'woocommerce_after_variations_table', array( __CLASS__, 'render_picker' ), 10 );
		add_action( 'woocommerce_before_add_to_cart_button', array( __CLASS__, 'render_picker_fallback' ), 7 );
		add_action( 'woocommerce_after_add_to_cart_form', array( __CLASS__, 'render_picker_late_fallback' ), 5 );
		add_filter( 'woocommerce_add_to_cart_validation', array( __CLASS__, 'validate_add_to_cart' ), 20, 5 );
		add_filter( 'woocommerce_add_cart_item_data', array( __CLASS__, 'add_cart_item_data' ), 20, 4 );
		add_filter( 'woocommerce_get_cart_item_from_session', array( __CLASS__, 'cart_item_from_session' ), 20, 2 );
		add_filter( 'woocommerce_get_item_data', array( __CLASS__, 'cart_item_data_display' ), 20, 2 );
		add_action( 'woocommerce_checkout_create_order_line_item', array( __CLASS__, 'order_line_item' ), 20, 4 );
		add_action( 'wp_footer', array( __CLASS__, 'footer_inject_script' ), 25 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
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
			return;
		}
		$clean = self::sanitize_configs( $configs, $product_id );
		if ( array() === $clean ) {
			if ( $preserve_if_empty ) {
				return;
			}
			delete_post_meta( $product_id, self::META_KEY );
			return;
		}
		update_post_meta( $product_id, self::META_KEY, $clean );
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
		$product_id = (int) $product_id;
		if ( $product_id <= 0 || ! function_exists( 'wc_get_product' ) ) {
			return array();
		}
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return array();
		}
		$axes = array();
		foreach ( self::get_configs( $product_id ) as $cfg ) {
			$axis = self::axis_for_config( $product, $cfg );
			if ( is_array( $axis ) ) {
				$axes[] = $axis;
			}
		}
		return $axes;
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
		$attr = self::find_product_attribute( $product, $name, $attribute_id );
		if ( ! $attr instanceof WC_Product_Attribute ) {
			return null;
		}
		$taxonomy = (string) $attr->get_name();
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
	private static function find_product_attribute( $product, $name, $attribute_id = 0 ) {
		$name         = self::normalize_config_name( $name );
		$attribute_id = (int) $attribute_id;
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
			'slug'      => (string) $term->slug,
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
			$term = get_term( (int) $opt );
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
			return;
		}

		$parent_id = $product->is_type( 'variation' ) ? (int) $product->get_parent_id() : (int) $product->get_id();
		$axes      = self::storefront_axes( $parent_id );
		if ( array() === $axes ) {
			return;
		}

		self::enqueue_for_product( $product );

		$rows = '';
		foreach ( $axes as $axis ) {
			$rows .= self::picker_row_html( $axis, $product );
		}
		if ( '' === $rows ) {
			return;
		}

		if ( $fallback_only || $standalone ) {
			echo '<div class="wcf-fulfillment wcf-fulfillment--fallback">'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}

		echo '<table class="variations wcf-variations webino-order-configs" cellspacing="0" role="presentation"><tbody class="wcf-fulfillment">'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo $rows; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo '</tbody></table>';

		if ( $fallback_only || $standalone ) {
			echo '</div>';
		}

		self::$picker_rendered = true;
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
		$variation_class = 'variation-' . sanitize_html_class( strtolower( rawurlencode( $attr_key ) ) );
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
	 * @return void
	 */
	public static function enqueue() {
		$product = self::current_product();
		if ( ! $product ) {
			return;
		}
		self::enqueue_for_product( $product );
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
		if ( array() === self::storefront_axes( $parent_id ) ) {
			return;
		}
		if ( class_exists( 'Webino_Dashboard_Variation_Swatches', false ) ) {
			Webino_Dashboard_Variation_Swatches::enqueue();
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
}
