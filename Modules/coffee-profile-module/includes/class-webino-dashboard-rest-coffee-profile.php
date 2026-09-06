<?php
/**
 * REST API for coffee profile, settings, and origins.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Coffee profile REST routes.
 */
class Webino_Dashboard_REST_Coffee_Profile {

	const NS = 'webino-dashboard/v1';

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		register_rest_route(
			self::NS,
			'/shop/coffee-profile/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'settings_get' ),
					'permission_callback' => array( __CLASS__, 'perm_edit_products' ),
				),
				array(
					'methods'             => 'PUT',
					'callback'            => array( __CLASS__, 'settings_put' ),
					'permission_callback' => array( __CLASS__, 'perm_edit_products' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/products/(?P<id>\d+)/coffee-profile',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'product_get' ),
					'permission_callback' => array( __CLASS__, 'perm_edit_products' ),
				),
				array(
					'methods'             => 'PUT',
					'callback'            => array( __CLASS__, 'product_put' ),
					'permission_callback' => array( __CLASS__, 'perm_edit_products' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/products/(?P<id>\d+)/coffee-profile/price-by-attribute',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'price_by_attribute_get' ),
					'permission_callback' => array( __CLASS__, 'perm_edit_products' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'price_by_attribute_post' ),
					'permission_callback' => array( __CLASS__, 'perm_edit_products' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/coffee-origins',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'origins_list' ),
					'permission_callback' => array( __CLASS__, 'perm_edit_products' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'origins_create' ),
					'permission_callback' => array( __CLASS__, 'perm_manage_terms' ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/shop/coffee-origins/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'origins_get' ),
					'permission_callback' => array( __CLASS__, 'perm_edit_products' ),
				),
				array(
					'methods'             => 'PATCH',
					'callback'            => array( __CLASS__, 'origins_patch' ),
					'permission_callback' => array( __CLASS__, 'perm_manage_terms' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'origins_delete' ),
					'permission_callback' => array( __CLASS__, 'perm_manage_terms' ),
				),
			)
		);
	}

	/**
	 * @return bool
	 */
	public static function perm_edit_products() {
		return class_exists( 'Webino_Dashboard_Rest_Base', false ) && Webino_Dashboard_Rest_Base::can( 'edit_products' );
	}

	/**
	 * @return bool
	 */
	public static function perm_manage_terms() {
		return class_exists( 'Webino_Dashboard_Rest_Base', false ) && Webino_Dashboard_Rest_Base::can( 'manage_product_terms' );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function settings_get() {
		return new WP_REST_Response( array( 'settings' => Webino_Dashboard_Coffee_Profile::get_settings() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function settings_put( $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = $request->get_params();
		}
		$settings = isset( $body['settings'] ) && is_array( $body['settings'] ) ? $body['settings'] : $body;
		Webino_Dashboard_Coffee_Profile::save_settings( is_array( $settings ) ? $settings : array() );
		return new WP_REST_Response( array( 'settings' => Webino_Dashboard_Coffee_Profile::get_settings() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_get( $request ) {
		$id = (int) $request['id'];
		if ( $id <= 0 || ! get_post( $id ) ) {
			return new WP_Error( 'not_found', __( 'Product not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return new WP_REST_Response(
			array(
				'profile'  => Webino_Dashboard_Coffee_Profile::get_profile( $id ),
				'settings' => Webino_Dashboard_Coffee_Profile::get_settings(),
				'origins'  => self::origin_items_all(),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function product_put( $request ) {
		$id   = (int) $request['id'];
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = $request->get_params();
		}
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		if ( isset( $body['profile'] ) && is_array( $body['profile'] ) ) {
			$body = array_merge( $body['profile'], array_intersect_key( $body, array( 'origin_ids' => true ) ) );
		}
		$keys = array( 'blend_robusta', 'blend_arabica', 'acidity', 'caffeine_mg', 'bitterness', 'sweetness', 'body', 'visible', 'origin_ids', 'pack_weight_g', 'price_mode', 'price_bean_id', 'price_mix_id', 'price_shop_style', 'price_parts' );
		$has  = false;
		foreach ( $keys as $key ) {
			if ( array_key_exists( $key, $body ) ) {
				$has = true;
				break;
			}
		}
		if ( ! $has ) {
			return new WP_Error( 'invalid', __( 'Coffee profile payload is empty.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$saved = Webino_Dashboard_Coffee_Profile::save_profile( $id, $body );
		if ( is_wp_error( $saved ) ) {
			return $saved;
		}
		$pricing = null;
		$mode    = sanitize_key( (string) ( $saved['price_mode'] ?? '' ) );
		if ( '' !== $mode && 'none' !== $mode && class_exists( 'Webino_Dashboard_Coffee_Pricing', false ) ) {
			$res = Webino_Dashboard_Coffee_Pricing::apply_to_product( $id );
			if ( ! is_wp_error( $res ) ) {
				$pricing = $res;
			}
		}
		return new WP_REST_Response(
			array(
				'profile'  => $saved,
				'settings' => Webino_Dashboard_Coffee_Profile::get_settings(),
				'origins'  => self::origin_items_all(),
				'pricing'  => $pricing,
			)
		);
	}

	/**
	 * Terms + current sample price/stock for one variation attribute.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function price_by_attribute_get( $request ) {
		$parent = self::variable_parent( (int) $request['id'] );
		if ( is_wp_error( $parent ) ) {
			return $parent;
		}

		$axes = self::variation_axes( $parent );
		if ( empty( $axes ) ) {
			return new WP_Error( 'no_attrs', __( 'No variation attributes found.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$requested = sanitize_text_field( (string) $request->get_param( 'attribute' ) );
		$attr      = self::resolve_price_attribute( $axes, $requested );
		$rows      = self::price_rows_for_attribute( $parent, $attr, $axes[ $attr ]['terms'] );

		$attributes = array();
		foreach ( $axes as $name => $meta ) {
			$attributes[] = array(
				'name'  => $name,
				'label' => $meta['label'],
			);
		}

		return new WP_REST_Response(
			array(
				'product_type' => 'variable',
				'attribute'    => $attr,
				'attributes'   => $attributes,
				'rows'         => $rows,
			)
		);
	}

	/**
	 * Apply purchase price + stock to every variation that has a given attribute term.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function price_by_attribute_post( $request ) {
		$parent = self::variable_parent( (int) $request['id'] );
		if ( is_wp_error( $parent ) ) {
			return $parent;
		}

		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = $request->get_params();
		}
		$attr = sanitize_text_field( (string) ( $body['attribute'] ?? $request->get_param( 'attribute' ) ) );
		$axes = self::variation_axes( $parent );
		$attr = self::resolve_price_attribute( $axes, $attr );

		$by_term = self::index_price_rows_by_term( (array) ( $body['rows'] ?? array() ), $attr );
		if ( empty( $by_term ) ) {
			return new WP_Error( 'invalid', __( 'No price rows provided.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$matches = array();
		foreach ( self::variation_children( $parent ) as $vid ) {
			$v = wc_get_product( (int) $vid );
			if ( ! $v || ! $v->is_type( 'variation' ) ) {
				continue;
			}
			$row = self::match_variation_to_row( $v, $attr, $by_term );
			if ( ! $row ) {
				continue;
			}
			$matches[] = array(
				'id'  => (int) $vid,
				'row' => $row,
			);
		}

		$offset  = max( 0, (int) ( $body['offset'] ?? $request->get_param( 'offset' ) ) );
		$batch   = 40;
		$slice   = array_slice( $matches, $offset, $batch );
		$updated = 0;
		foreach ( $slice as $item ) {
			$v = wc_get_product( $item['id'] );
			if ( ! $v || ! $v->is_type( 'variation' ) ) {
				continue;
			}
			$row = $item['row'];
			if ( class_exists( 'Webino_Dashboard_Rest_Crud', false ) ) {
				Webino_Dashboard_Rest_Crud::canonicalize_variation_attributes( $parent, $v );
			}
			if ( array_key_exists( 'purchase_price', $row ) && '' !== (string) $row['purchase_price'] && null !== $row['purchase_price'] ) {
				$pp = class_exists( 'WFCP_Helper' ) ? WFCP_Helper::sanitize_price( $row['purchase_price'] ) : (float) $row['purchase_price'];
				$v->update_meta_data( '_wfcp_purchase_price', $pp );
				if ( class_exists( 'WFCP_Helper', false ) ) {
					$v->save();
					WFCP_Helper::sync_retail_price_from_purchase( (int) $item['id'], (float) $pp );
					$v = wc_get_product( $item['id'] );
				}
			}
			if ( array_key_exists( 'stock_quantity', $row ) && '' !== (string) $row['stock_quantity'] && null !== $row['stock_quantity'] ) {
				$qty = (int) $row['stock_quantity'];
				if ( $v ) {
					$v->set_manage_stock( true );
					$v->set_stock_quantity( $qty );
					$v->set_stock_status( $qty > 0 ? 'instock' : 'outofstock' );
				}
			}
			if ( $v ) {
				$v->save();
			}
			++$updated;
		}

		$next = $offset + count( $slice );
		if ( $updated > 0 ) {
			if ( class_exists( 'Webino_Dashboard_Rest_Crud', false ) ) {
				Webino_Dashboard_Rest_Crud::repair_variable_children_stock_status( (int) $parent->get_id() );
			}
			if ( class_exists( 'WC_Product_Variable' ) ) {
				WC_Product_Variable::sync( (int) $parent->get_id() );
			}
			if ( function_exists( 'wc_delete_product_transients' ) ) {
				wc_delete_product_transients( (int) $parent->get_id() );
			}
		}

		return new WP_REST_Response(
			array(
				'updated'     => $updated,
				'total'       => count( $matches ),
				'remaining'   => max( 0, count( $matches ) - $next ),
				'next_offset' => $next,
				'attribute'   => $attr,
			)
		);
	}

	/**
	 * @param int $id Product ID.
	 * @return WC_Product|WP_Error
	 */
	private static function variable_parent( $id ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$product = wc_get_product( $id );
		if ( ! $product ) {
			return new WP_Error( 'not_found', __( 'Product not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( ! $product->is_type( 'variable' ) ) {
			return new WP_Error( 'invalid_parent', __( 'Not a variable product.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		return $product;
	}

	/**
	 * @param WC_Product $parent Variable product.
	 * @return array<string,array{label:string,terms:array<int,array{slug:string,name:string}>}>
	 */
	private static function variation_axes( $parent ) {
		$out = array();
		$raw = $parent->get_variation_attributes();
		if ( ! is_array( $raw ) ) {
			return $out;
		}
		foreach ( $raw as $name => $options ) {
			$name  = (string) $name;
			$label = function_exists( 'wc_attribute_label' ) ? wc_attribute_label( $name ) : $name;
			$terms = array();
			if ( taxonomy_exists( $name ) ) {
				foreach ( (array) $options as $slug ) {
					$term = get_term_by( 'slug', (string) $slug, $name );
					$terms[] = array(
						'slug' => (string) $slug,
						'name' => ( $term && ! is_wp_error( $term ) ) ? (string) $term->name : (string) $slug,
					);
				}
			} else {
				foreach ( (array) $options as $opt ) {
					$terms[] = array(
						'slug' => (string) $opt,
						'name' => (string) $opt,
					);
				}
			}
			$out[ $name ] = array(
				'label' => $label,
				'terms' => $terms,
			);
		}
		return $out;
	}

	/**
	 * @param array<string,array<string,mixed>> $axes Axes.
	 * @param string                            $requested Requested attribute name.
	 * @return string
	 */
	private static function resolve_price_attribute( $axes, $requested ) {
		if ( $requested && isset( $axes[ $requested ] ) ) {
			return $requested;
		}
		foreach ( $axes as $name => $meta ) {
			$hay = strtolower( $name . ' ' . (string) ( $meta['label'] ?? '' ) );
			if ( false !== strpos( $hay, 'وزن' ) || false !== strpos( $hay, 'weight' ) || false !== strpos( $name, 'pa_wt' ) ) {
				return $name;
			}
		}
		$keys = array_keys( $axes );
		return (string) ( $keys[0] ?? '' );
	}

	/**
	 * @param WC_Product                           $parent Parent.
	 * @param string                               $attr   Attribute name.
	 * @param array<int,array{slug:string,name:string}> $terms Terms.
	 * @return array<int,array<string,mixed>>
	 */
	private static function price_rows_for_attribute( $parent, $attr, $terms ) {
		$children = self::variation_children( $parent );
		$samples  = array();
		foreach ( $children as $vid ) {
			$v = wc_get_product( (int) $vid );
			if ( ! $v || ! $v->is_type( 'variation' ) ) {
				continue;
			}
			$val = self::variation_attr_value( $v, $attr );
			if ( '' === $val ) {
				continue;
			}
			$pp = $v->get_meta( '_wfcp_purchase_price', true );
			$sample = array(
				'purchase_price' => ( '' === $pp || false === $pp ) ? '' : (string) $pp,
				'stock_quantity' => $v->get_manage_stock() ? (string) (int) $v->get_stock_quantity() : '',
			);
			foreach ( self::term_aliases( $attr, $val ) as $alias ) {
				if ( ! isset( $samples[ $alias ] ) ) {
					$samples[ $alias ] = $sample;
				}
			}
		}

		$rows = array();
		foreach ( $terms as $term ) {
			$slug   = (string) $term['slug'];
			$sample = array();
			foreach ( self::term_aliases( $attr, $slug ) as $alias ) {
				if ( isset( $samples[ $alias ] ) ) {
					$sample = $samples[ $alias ];
					break;
				}
			}
			$count = 0;
			foreach ( $children as $vid ) {
				$v = wc_get_product( (int) $vid );
				if ( ! $v || ! $v->is_type( 'variation' ) ) {
					continue;
				}
				if ( self::variation_matches_term( $v, $attr, $slug ) ) {
					++$count;
				}
			}
			$rows[] = array(
				'term'            => $slug,
				'label'           => (string) $term['name'],
				'purchase_price'  => $sample['purchase_price'] ?? '',
				'stock_quantity'  => $sample['stock_quantity'] ?? '',
				'variation_count' => $count,
			);
		}
		return $rows;
	}

	/**
	 * Variation IDs for a variable product (fallback when cached children are empty).
	 *
	 * @param WC_Product $parent Variable product.
	 * @return array<int,int>
	 */
	private static function variation_children( $parent ) {
		$children = $parent->get_children();
		if ( ! empty( $children ) ) {
			return array_map( 'intval', $children );
		}
		$posts = get_posts(
			array(
				'post_parent'    => (int) $parent->get_id(),
				'post_type'      => 'product_variation',
				'post_status'    => array( 'publish', 'private' ),
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'orderby'        => 'menu_order ID',
				'order'          => 'ASC',
			)
		);
		return array_map( 'intval', is_array( $posts ) ? $posts : array() );
	}

	/**
	 * @param array<int,array<string,mixed>> $rows Price rows from client.
	 * @param string                         $attr Attribute taxonomy/name.
	 * @return array<string,array<string,mixed>>
	 */
	private static function index_price_rows_by_term( $rows, $attr ) {
		$by_term = array();
		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$raw_term = (string) ( $row['term'] ?? '' );
			if ( '' === $raw_term ) {
				continue;
			}
			foreach ( self::term_aliases( $attr, $raw_term ) as $alias ) {
				$by_term[ $alias ] = $row;
			}
		}
		return $by_term;
	}

	/**
	 * @param WC_Product                      $variation Variation.
	 * @param string                          $attr      Attribute name.
	 * @param array<string,array<string,mixed>> $by_term Indexed rows.
	 * @return array<string,mixed>|null
	 */
	private static function match_variation_to_row( $variation, $attr, $by_term ) {
		$val = self::variation_attr_value( $variation, $attr );
		if ( '' === $val ) {
			return null;
		}
		foreach ( self::term_aliases( $attr, $val ) as $alias ) {
			if ( isset( $by_term[ $alias ] ) ) {
				return $by_term[ $alias ];
			}
		}
		return null;
	}

	/**
	 * @param WC_Product $variation Variation.
	 * @param string     $attr      Attribute name.
	 * @param string     $term_slug Term slug from parent axis.
	 * @return bool
	 */
	private static function variation_matches_term( $variation, $attr, $term_slug ) {
		$val = self::variation_attr_value( $variation, $attr );
		if ( '' === $val ) {
			return false;
		}
		$term_aliases = self::term_aliases( $attr, $term_slug );
		$val_aliases  = self::term_aliases( $attr, $val );
		foreach ( $term_aliases as $alias ) {
			if ( in_array( $alias, $val_aliases, true ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Possible keys for matching a variation attribute name.
	 *
	 * @param string $name Attribute name or meta key.
	 * @return array<int,string>
	 */
	private static function attr_key_aliases( $name ) {
		$name     = (string) $name;
		$seed     = array( $name );
		$stripped = preg_replace( '/^attribute_/', '', $name );
		if ( is_string( $stripped ) && $stripped !== $name ) {
			$seed[] = $stripped;
			$seed[] = 'attribute_' . sanitize_title( $stripped );
		} else {
			$seed[] = 'attribute_' . sanitize_title( $name );
		}
		$aliases = array();
		foreach ( $seed as $candidate ) {
			$candidate = (string) $candidate;
			if ( '' === $candidate ) {
				continue;
			}
			$decoded = rawurldecode( $candidate );
			$aliases[] = $candidate;
			$aliases[] = $decoded;
			$aliases[] = sanitize_title( $candidate );
			$aliases[] = sanitize_title( $decoded );
			if ( 0 === strpos( $candidate, 'pa_' ) ) {
				$aliases[] = substr( $candidate, 3 );
				$aliases[] = sanitize_title( substr( $candidate, 3 ) );
			} else {
				$aliases[] = 'pa_' . sanitize_title( $candidate );
			}
		}
		return array_values( array_unique( array_filter( $aliases ) ) );
	}

	/**
	 * Possible values for matching a variation attribute term.
	 *
	 * @param string $attr Attribute taxonomy/name.
	 * @param string $raw  Raw stored value.
	 * @return array<int,string>
	 */
	private static function term_aliases( $attr, $raw ) {
		$raw = (string) $raw;
		if ( '' === $raw ) {
			return array();
		}
		$aliases = array(
			$raw,
			rawurldecode( $raw ),
			sanitize_title( $raw ),
			sanitize_title( rawurldecode( $raw ) ),
		);
		$tax = taxonomy_exists( $attr ) ? $attr : '';
		if ( '' === $tax && taxonomy_exists( rawurldecode( $attr ) ) ) {
			$tax = rawurldecode( $attr );
		}
		if ( '' !== $tax ) {
			foreach ( array( $raw, rawurldecode( $raw ), sanitize_title( $raw ) ) as $probe ) {
				$probe = (string) $probe;
				if ( '' === $probe ) {
					continue;
				}
				$term = get_term_by( 'slug', $probe, $tax );
				if ( ! $term || is_wp_error( $term ) ) {
					$term = get_term_by( 'name', $probe, $tax );
				}
				if ( ( ! $term || is_wp_error( $term ) ) && ctype_digit( $probe ) ) {
					$term = get_term( (int) $probe, $tax );
				}
				if ( $term && ! is_wp_error( $term ) ) {
					$aliases[] = (string) $term->slug;
					$aliases[] = (string) $term->name;
					$aliases[] = (string) $term->term_id;
					$aliases[] = sanitize_title( $term->slug );
					$aliases[] = sanitize_title( $term->name );
				}
			}
		}
		return array_values(
			array_unique(
				array_filter(
					$aliases,
					static function ( $value ) {
						return '' !== (string) $value;
					}
				)
			)
		);
	}

	/**
	 * @param WC_Product $variation Variation.
	 * @param string     $attr_name Attribute name.
	 * @return string
	 */
	private static function variation_attr_value( $variation, $attr_name ) {
		$want_aliases = self::attr_key_aliases( $attr_name );
		$attrs        = $variation->get_attributes();
		if ( is_array( $attrs ) ) {
			foreach ( $attrs as $key => $val ) {
				if ( '' === (string) $val && '0' !== (string) $val ) {
					continue;
				}
				$key_aliases = self::attr_key_aliases( (string) $key );
				foreach ( $want_aliases as $want ) {
					if ( in_array( $want, $key_aliases, true ) ) {
						return (string) $val;
					}
				}
			}
		}

		$vid = (int) $variation->get_id();
		if ( $vid > 0 ) {
			$all_meta = get_post_meta( $vid );
			if ( is_array( $all_meta ) ) {
				foreach ( $all_meta as $meta_key => $meta_vals ) {
					if ( 0 !== strpos( (string) $meta_key, 'attribute_' ) ) {
						continue;
					}
					$key_aliases = self::attr_key_aliases( (string) $meta_key );
					$matched     = false;
					foreach ( $want_aliases as $want ) {
						if ( in_array( $want, $key_aliases, true ) ) {
							$matched = true;
							break;
						}
					}
					if ( ! $matched ) {
						continue;
					}
					$val = is_array( $meta_vals ) ? (string) ( $meta_vals[0] ?? '' ) : (string) $meta_vals;
					if ( '' !== $val ) {
						return $val;
					}
				}
			}
		}
		return '';
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function origins_list( $request ) {
		if ( ! taxonomy_exists( Webino_Dashboard_Coffee_Origins::TAXONOMY ) ) {
			return new WP_REST_Response( array( 'items' => array(), 'found' => 0 ) );
		}
		$terms = get_terms(
			array(
				'taxonomy'   => Webino_Dashboard_Coffee_Origins::TAXONOMY,
				'hide_empty' => false,
			)
		);
		if ( is_wp_error( $terms ) ) {
			return new WP_REST_Response( array( 'items' => array(), 'found' => 0 ) );
		}
		$search = sanitize_text_field( (string) $request->get_param( 'search' ) );
		$items  = array();
		foreach ( $terms as $term ) {
			if ( '' !== $search ) {
				$hay = strtolower( $term->name . ' ' . $term->slug . ' ' . get_term_meta( $term->term_id, 'iso_code', true ) );
				if ( false === strpos( $hay, strtolower( $search ) ) ) {
					continue;
				}
			}
			$items[] = Webino_Dashboard_Coffee_Origins::map_item( $term );
		}
		usort(
			$items,
			static function ( $a, $b ) {
				return strcasecmp( (string) $a['name'], (string) $b['name'] );
			}
		);
		return new WP_REST_Response(
			array(
				'items' => $items,
				'found' => count( $items ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function origins_get( $request ) {
		$term = self::get_origin_term( (int) $request['id'] );
		if ( is_wp_error( $term ) ) {
			return $term;
		}
		return new WP_REST_Response( Webino_Dashboard_Coffee_Origins::map_item( $term ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function origins_create( $request ) {
		if ( ! taxonomy_exists( Webino_Dashboard_Coffee_Origins::TAXONOMY ) ) {
			return new WP_Error( 'no_tax', __( 'Origin taxonomy missing.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$name = sanitize_text_field( (string) $request->get_param( 'name' ) );
		if ( '' === $name ) {
			return new WP_Error( 'invalid', __( 'Name required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$slug = sanitize_title( (string) ( $request->get_param( 'slug' ) ?: $name ) );
		$r    = wp_insert_term(
			$name,
			Webino_Dashboard_Coffee_Origins::TAXONOMY,
			array(
				'slug'        => $slug,
				'description' => (string) $request->get_param( 'description' ),
			)
		);
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		$term_id = (int) $r['term_id'];
		self::save_origin_meta( $term_id, $request );
		$term = get_term( $term_id, Webino_Dashboard_Coffee_Origins::TAXONOMY );
		return new WP_REST_Response(
			array(
				'id'   => $term_id,
				'item' => ( $term && ! is_wp_error( $term ) ) ? Webino_Dashboard_Coffee_Origins::map_item( $term ) : null,
			),
			201
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function origins_patch( $request ) {
		$id   = (int) $request['id'];
		$term = self::get_origin_term( $id );
		if ( is_wp_error( $term ) ) {
			return $term;
		}
		$args = array();
		if ( null !== $request->get_param( 'name' ) ) {
			$args['name'] = sanitize_text_field( (string) $request->get_param( 'name' ) );
		}
		if ( null !== $request->get_param( 'slug' ) ) {
			$args['slug'] = sanitize_title( (string) $request->get_param( 'slug' ) );
		}
		if ( null !== $request->get_param( 'description' ) ) {
			$args['description'] = (string) $request->get_param( 'description' );
		}
		if ( array() !== $args ) {
			$r = wp_update_term( $id, Webino_Dashboard_Coffee_Origins::TAXONOMY, $args );
			if ( is_wp_error( $r ) ) {
				return $r;
			}
		}
		self::save_origin_meta( $id, $request );
		$term = get_term( $id, Webino_Dashboard_Coffee_Origins::TAXONOMY );
		return new WP_REST_Response(
			array(
				'ok'   => true,
				'item' => ( $term && ! is_wp_error( $term ) ) ? Webino_Dashboard_Coffee_Origins::map_item( $term ) : null,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function origins_delete( $request ) {
		$r = wp_delete_term( (int) $request['id'], Webino_Dashboard_Coffee_Origins::TAXONOMY );
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		if ( ! $r ) {
			return new WP_Error( 'fail', __( 'Could not delete term.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * @param int $id Term ID.
	 * @return WP_Term|WP_Error
	 */
	private static function get_origin_term( $id ) {
		if ( ! taxonomy_exists( Webino_Dashboard_Coffee_Origins::TAXONOMY ) ) {
			return new WP_Error( 'no_tax', __( 'Origin taxonomy missing.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$term = get_term( (int) $id, Webino_Dashboard_Coffee_Origins::TAXONOMY );
		if ( ! $term || is_wp_error( $term ) ) {
			return new WP_Error( 'not_found', __( 'Origin not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		return $term;
	}

	/**
	 * @param int             $term_id Term ID.
	 * @param WP_REST_Request $request Request.
	 * @return void
	 */
	private static function save_origin_meta( $term_id, $request ) {
		if ( null !== $request->get_param( 'iso_code' ) ) {
			$iso = strtoupper( preg_replace( '/[^A-Za-z]/', '', (string) $request->get_param( 'iso_code' ) ) );
			$iso = substr( $iso, 0, 2 );
			if ( 2 === strlen( $iso ) ) {
				update_term_meta( $term_id, 'iso_code', $iso );
			} else {
				delete_term_meta( $term_id, 'iso_code' );
			}
		}
		if ( null !== $request->get_param( 'thumbnail_id' ) ) {
			$thumb_id = max( 0, (int) $request->get_param( 'thumbnail_id' ) );
			if ( $thumb_id > 0 ) {
				update_term_meta( $term_id, 'thumbnail_id', $thumb_id );
			} else {
				delete_term_meta( $term_id, 'thumbnail_id' );
			}
		}
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	private static function origin_items_all() {
		if ( ! taxonomy_exists( Webino_Dashboard_Coffee_Origins::TAXONOMY ) ) {
			return array();
		}
		$terms = get_terms(
			array(
				'taxonomy'   => Webino_Dashboard_Coffee_Origins::TAXONOMY,
				'hide_empty' => false,
			)
		);
		if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
			return array();
		}
		$items = array();
		foreach ( $terms as $term ) {
			$items[] = Webino_Dashboard_Coffee_Origins::map_item( $term );
		}
		usort(
			$items,
			static function ( $a, $b ) {
				return strcasecmp( (string) $a['name'], (string) $b['name'] );
			}
		);
		return $items;
	}
}
