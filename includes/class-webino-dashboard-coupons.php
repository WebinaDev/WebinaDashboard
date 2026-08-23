<?php
/**
 * WooCommerce coupon helpers for dashboard REST.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Coupon serialization and REST utilities.
 */
class Webino_Dashboard_Coupons {

	const META_ALLOWED_USER_IDS         = '_webino_coupon_allowed_user_ids';
	const META_ALLOWED_STATES           = '_webino_coupon_allowed_states';
	const META_ALLOWED_CITIES           = '_webino_coupon_allowed_cities';
	const META_ALLOWED_PAYMENT_METHODS  = '_webino_coupon_allowed_payment_methods';
	const META_ALLOWED_PURCHASE_TYPES   = '_webino_coupon_allowed_purchase_types';
	const META_ALLOWED_SHIPPING_METHODS = '_webino_coupon_allowed_shipping_methods';
	const META_ALLOWED_CHANNELS         = '_webino_coupon_allowed_channels';

	/**
	 * @return bool
	 */
	public static function wc_active() {
		return class_exists( 'WC_Coupon' ) && function_exists( 'wc_get_coupon_types' );
	}

	/**
	 * @param int $post_id Coupon post ID.
	 * @return array<string, string>
	 */
	public static function action_urls( $post_id ) {
		$post_id = (int) $post_id;
		return array(
			'trash_url' => (string) wp_nonce_url(
				admin_url( 'post.php?post=' . $post_id . '&action=trash' ),
				'trash-post_' . $post_id
			),
		);
	}

	/**
	 * @param WP_Post $p Coupon post.
	 * @return string
	 */
	public static function post_visibility_from_post( $p ) {
		if ( 'private' === $p->post_status ) {
			return 'private';
		}
		if ( ! empty( $p->post_password ) ) {
			return 'password';
		}
		return 'public';
	}

	/**
	 * @param int $coupon_id Coupon post ID.
	 * @return array<int>
	 */
	public static function get_brand_ids( $coupon_id ) {
		$ids = get_post_meta( (int) $coupon_id, 'product_brands', true );
		if ( ! is_array( $ids ) ) {
			return array();
		}
		return array_values( array_filter( array_map( 'intval', $ids ) ) );
	}

	/**
	 * @param int $coupon_id Coupon post ID.
	 * @return array<int>
	 */
	public static function get_excluded_brand_ids( $coupon_id ) {
		$ids = get_post_meta( (int) $coupon_id, 'exclude_product_brands', true );
		if ( ! is_array( $ids ) ) {
			return array();
		}
		return array_values( array_filter( array_map( 'intval', $ids ) ) );
	}

	/**
	 * @param int   $coupon_id Coupon post ID.
	 * @param array $ids Brand term IDs.
	 * @return void
	 */
	public static function set_brand_ids( $coupon_id, $ids ) {
		$ids = array_values( array_filter( array_map( 'intval', (array) $ids ) ) );
		update_post_meta( (int) $coupon_id, 'product_brands', $ids );
	}

	/**
	 * @param int   $coupon_id Coupon post ID.
	 * @param array $ids Brand term IDs.
	 * @return void
	 */
	public static function set_excluded_brand_ids( $coupon_id, $ids ) {
		$ids = array_values( array_filter( array_map( 'intval', (array) $ids ) ) );
		update_post_meta( (int) $coupon_id, 'exclude_product_brands', $ids );
	}

	/**
	 * @param int    $coupon_id Coupon post ID.
	 * @param string $meta_key  Meta key.
	 * @return array<int|string>
	 */
	public static function get_string_list_meta( $coupon_id, $meta_key ) {
		$raw = get_post_meta( (int) $coupon_id, $meta_key, true );
		if ( ! is_array( $raw ) ) {
			return array();
		}
		$out = array();
		foreach ( $raw as $v ) {
			$v = sanitize_text_field( (string) $v );
			if ( '' !== $v ) {
				$out[] = $v;
			}
		}
		return array_values( array_unique( $out ) );
	}

	/**
	 * @param int    $coupon_id Coupon post ID.
	 * @param string $meta_key  Meta key.
	 * @param mixed  $values    Values.
	 * @return void
	 */
	public static function set_string_list_meta( $coupon_id, $meta_key, $values ) {
		$list = array();
		foreach ( (array) $values as $v ) {
			$v = sanitize_text_field( (string) $v );
			if ( '' !== $v ) {
				$list[] = $v;
			}
		}
		update_post_meta( (int) $coupon_id, $meta_key, array_values( array_unique( $list ) ) );
	}

	/**
	 * @param int $coupon_id Coupon post ID.
	 * @return array<int>
	 */
	public static function get_allowed_user_ids( $coupon_id ) {
		$raw = get_post_meta( (int) $coupon_id, self::META_ALLOWED_USER_IDS, true );
		if ( ! is_array( $raw ) ) {
			return array();
		}
		return array_values( array_filter( array_map( 'intval', $raw ) ) );
	}

	/**
	 * @param int   $coupon_id Coupon post ID.
	 * @param array $ids User IDs.
	 * @return void
	 */
	public static function set_allowed_user_ids( $coupon_id, $ids ) {
		$ids = array_values( array_filter( array_map( 'intval', (array) $ids ) ) );
		update_post_meta( (int) $coupon_id, self::META_ALLOWED_USER_IDS, $ids );
	}

	/**
	 * Restriction fields for REST map/apply.
	 *
	 * @param int $coupon_id Coupon ID.
	 * @return array<string, mixed>
	 */
	public static function get_restriction_fields( $coupon_id ) {
		$coupon_id = (int) $coupon_id;
		return array(
			'allowed_user_ids'         => self::get_allowed_user_ids( $coupon_id ),
			'allowed_states'           => self::get_string_list_meta( $coupon_id, self::META_ALLOWED_STATES ),
			'allowed_cities'           => self::get_string_list_meta( $coupon_id, self::META_ALLOWED_CITIES ),
			'allowed_payment_methods'  => self::get_string_list_meta( $coupon_id, self::META_ALLOWED_PAYMENT_METHODS ),
			'allowed_purchase_types'   => self::get_string_list_meta( $coupon_id, self::META_ALLOWED_PURCHASE_TYPES ),
			'allowed_shipping_methods' => self::get_string_list_meta( $coupon_id, self::META_ALLOWED_SHIPPING_METHODS ),
			'allowed_channels'         => self::get_string_list_meta( $coupon_id, self::META_ALLOWED_CHANNELS ),
		);
	}

	/**
	 * @param WC_Coupon $c Coupon.
	 * @return array<string, mixed>
	 */
	public static function map_base( $c ) {
		$exp  = $c->get_date_expires();
		$post = get_post( $c->get_id() );
		$urls = self::action_urls( $c->get_id() );

		return array_merge(
			array(
				'id'                          => $c->get_id(),
				'code'                        => $c->get_code(),
				'amount'                      => $c->get_amount(),
				'type'                        => $c->get_discount_type(),
				'description'                 => $c->get_description(),
				'date_expires'                => $exp ? $exp->format( 'c' ) : null,
				'minimum_amount'              => $c->get_minimum_amount(),
				'maximum_amount'              => $c->get_maximum_amount(),
				'usage_limit'                 => $c->get_usage_limit(),
				'usage_limit_per_user'        => $c->get_usage_limit_per_user(),
				'usage_count'                 => $c->get_usage_count(),
				'individual_use'              => $c->get_individual_use(),
				'free_shipping'               => $c->get_free_shipping(),
				'exclude_sale_items'          => $c->get_exclude_sale_items(),
				'product_ids'                 => array_map( 'intval', $c->get_product_ids() ),
				'excluded_product_ids'        => array_map( 'intval', $c->get_excluded_product_ids() ),
				'product_categories'          => array_map( 'intval', $c->get_product_categories() ),
				'excluded_product_categories' => array_map( 'intval', $c->get_excluded_product_categories() ),
				'email_restrictions'          => array_values( array_filter( array_map( 'strval', $c->get_email_restrictions() ) ) ),
				'brand_ids'                   => self::get_brand_ids( $c->get_id() ),
				'excluded_brand_ids'          => self::get_excluded_brand_ids( $c->get_id() ),
				'status'                      => $post ? $post->post_status : 'publish',
				'date'                        => $post ? mysql2date( 'c', $post->post_date, false ) : null,
				'visibility'                  => $post ? self::post_visibility_from_post( $post ) : 'public',
				'trash_url'                   => $urls['trash_url'],
			),
			self::get_restriction_fields( $c->get_id() )
		);
	}

	/**
	 * @param WC_Coupon $c Coupon.
	 * @return array<string, mixed>
	 */
	public static function map_list_item( $c ) {
		$row = self::map_base( $c );
		return array(
			'id'                   => $row['id'],
			'code'                 => $row['code'],
			'type'                 => $row['type'],
			'amount'               => $row['amount'],
			'description'          => $row['description'],
			'product_ids'          => $row['product_ids'],
			'usage_count'          => $row['usage_count'],
			'usage_limit'          => $row['usage_limit'],
			'usage_limit_per_user' => $row['usage_limit_per_user'],
			'date_expires'         => $row['date_expires'],
			'status'               => $row['status'],
			'trash_url'            => $row['trash_url'],
		);
	}

	/**
	 * @param WC_Coupon $c Coupon.
	 * @return array<string, mixed>
	 */
	public static function map_detail( $c ) {
		return self::map_base( $c );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function query_list( $request ) {
		if ( ! self::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$page     = max( 1, (int) $request->get_param( 'page' ) ?: 1 );
		$per_page = min( 100, max( 1, (int) $request->get_param( 'per_page' ) ?: 20 ) );
		$search   = sanitize_text_field( (string) $request->get_param( 'search' ) );

		$args = array(
			'post_type'      => 'shop_coupon',
			'post_status'    => array( 'publish', 'draft', 'pending', 'future', 'private' ),
			'paged'          => $page,
			'posts_per_page' => $per_page,
			'orderby'        => 'date',
			'order'          => 'DESC',
		);
		if ( '' !== $search ) {
			$args['s'] = $search;
		}

		$q     = new WP_Query( $args );
		$items = array();
		while ( $q->have_posts() ) {
			$q->the_post();
			$c = new WC_Coupon( get_the_ID() );
			if ( $c->get_id() ) {
				$items[] = self::map_list_item( $c );
			}
		}
		wp_reset_postdata();

		return new WP_REST_Response(
			array(
				'items'    => $items,
				'page'     => $page,
				'per_page' => $per_page,
				'found'    => (int) $q->found_posts,
			)
		);
	}

	/**
	 * @param array<int> $ids Integer IDs.
	 * @return array<int>
	 */
	private static function sanitize_id_list( $ids ) {
		if ( ! is_array( $ids ) ) {
			return array();
		}
		return array_values( array_filter( array_map( 'intval', $ids ) ) );
	}

	/**
	 * @param WC_Coupon       $c Coupon.
	 * @param WP_REST_Request $request Request.
	 * @return void
	 */
	public static function apply_rest_fields( $c, $request ) {
		if ( null !== $request->get_param( 'description' ) ) {
			$c->set_description( sanitize_textarea_field( (string) $request->get_param( 'description' ) ) );
		}
		if ( null !== $request->get_param( 'minimum_amount' ) ) {
			$c->set_minimum_amount( wc_format_decimal( (string) $request->get_param( 'minimum_amount' ) ) );
		}
		if ( null !== $request->get_param( 'maximum_amount' ) ) {
			$c->set_maximum_amount( wc_format_decimal( (string) $request->get_param( 'maximum_amount' ) ) );
		}
		if ( null !== $request->get_param( 'usage_limit' ) ) {
			$ul = $request->get_param( 'usage_limit' );
			$c->set_usage_limit( null === $ul || '' === $ul ? null : (int) $ul );
		}
		if ( null !== $request->get_param( 'usage_limit_per_user' ) ) {
			$ul = $request->get_param( 'usage_limit_per_user' );
			$c->set_usage_limit_per_user( null === $ul || '' === $ul ? null : (int) $ul );
		}
		if ( null !== $request->get_param( 'individual_use' ) ) {
			$c->set_individual_use( (bool) $request->get_param( 'individual_use' ) );
		}
		if ( null !== $request->get_param( 'free_shipping' ) ) {
			$c->set_free_shipping( (bool) $request->get_param( 'free_shipping' ) );
		}
		if ( null !== $request->get_param( 'exclude_sale_items' ) ) {
			$c->set_exclude_sale_items( (bool) $request->get_param( 'exclude_sale_items' ) );
		}
		if ( null !== $request->get_param( 'date_expires' ) ) {
			$raw = $request->get_param( 'date_expires' );
			if ( null === $raw || '' === $raw ) {
				$c->set_date_expires( null );
			} elseif ( is_numeric( $raw ) ) {
				$c->set_date_expires( new WC_DateTime( '@' . (int) $raw ) );
			} else {
				$ts = strtotime( (string) $raw );
				if ( $ts ) {
					$c->set_date_expires( new WC_DateTime( '@' . $ts ) );
				}
			}
		}
		if ( null !== $request->get_param( 'product_ids' ) && is_array( $request->get_param( 'product_ids' ) ) ) {
			$c->set_product_ids( self::sanitize_id_list( $request->get_param( 'product_ids' ) ) );
		}
		if ( null !== $request->get_param( 'excluded_product_ids' ) && is_array( $request->get_param( 'excluded_product_ids' ) ) ) {
			$c->set_excluded_product_ids( self::sanitize_id_list( $request->get_param( 'excluded_product_ids' ) ) );
		}
		if ( null !== $request->get_param( 'product_categories' ) && is_array( $request->get_param( 'product_categories' ) ) ) {
			$c->set_product_categories( self::sanitize_id_list( $request->get_param( 'product_categories' ) ) );
		}
		if ( null !== $request->get_param( 'excluded_product_categories' ) && is_array( $request->get_param( 'excluded_product_categories' ) ) ) {
			$c->set_excluded_product_categories( self::sanitize_id_list( $request->get_param( 'excluded_product_categories' ) ) );
		}
		if ( null !== $request->get_param( 'email_restrictions' ) && is_array( $request->get_param( 'email_restrictions' ) ) ) {
			$emails = array();
			foreach ( $request->get_param( 'email_restrictions' ) as $email ) {
				$email = sanitize_email( (string) $email );
				if ( '' !== $email ) {
					$emails[] = $email;
				}
			}
			$c->set_email_restrictions( $emails );
		}
	}

	/**
	 * @param int             $coupon_id Coupon post ID.
	 * @param WP_REST_Request $request Request.
	 * @return true|WP_Error
	 */
	public static function apply_post_fields( $coupon_id, $request ) {
		$post     = get_post( (int) $coupon_id );
		$post_args = array( 'ID' => (int) $coupon_id );

		$status     = $request->get_param( 'status' );
		$visibility = $request->get_param( 'visibility' );

		if ( null !== $visibility ) {
			$visibility = sanitize_key( (string) $visibility );
			if ( 'private' === $visibility ) {
				$post_args['post_status']  = 'private';
				$post_args['post_password'] = '';
			} elseif ( 'password' === $visibility ) {
				$fallback_status = $post ? $post->post_status : 'draft';
				$post_args['post_status'] = sanitize_key( (string) $status ) ?: $fallback_status;
				if ( 'private' === $post_args['post_status'] ) {
					$post_args['post_status'] = 'publish';
				}
				$pw = $request->get_param( 'password' );
				if ( null !== $pw && '' !== (string) $pw ) {
					$post_args['post_password'] = (string) $pw;
				}
			} else {
				$post_args['post_password'] = '';
				if ( null !== $status ) {
					$post_args['post_status'] = sanitize_key( (string) $status ) ?: 'draft';
				}
			}
		} elseif ( null !== $status ) {
			$post_args['post_status'] = sanitize_key( (string) $status ) ?: 'draft';
		}

		$date = $request->get_param( 'date' );
		if ( null !== $date && '' !== (string) $date ) {
			$ts = strtotime( (string) $date );
			if ( $ts ) {
				$post_args['post_date']     = wp_date( 'Y-m-d H:i:s', $ts );
				$post_args['post_date_gmt'] = get_gmt_from_date( $post_args['post_date'] );
			}
		}

		if ( count( $post_args ) > 1 ) {
			$updated = wp_update_post( $post_args, true );
			if ( is_wp_error( $updated ) ) {
				return $updated;
			}
		}

		if ( null !== $request->get_param( 'brand_ids' ) && is_array( $request->get_param( 'brand_ids' ) ) ) {
			self::set_brand_ids( $coupon_id, $request->get_param( 'brand_ids' ) );
		}
		if ( null !== $request->get_param( 'excluded_brand_ids' ) && is_array( $request->get_param( 'excluded_brand_ids' ) ) ) {
			self::set_excluded_brand_ids( $coupon_id, $request->get_param( 'excluded_brand_ids' ) );
		}
		if ( null !== $request->get_param( 'allowed_user_ids' ) && is_array( $request->get_param( 'allowed_user_ids' ) ) ) {
			self::set_allowed_user_ids( $coupon_id, $request->get_param( 'allowed_user_ids' ) );
		}
		if ( null !== $request->get_param( 'allowed_states' ) && is_array( $request->get_param( 'allowed_states' ) ) ) {
			self::set_string_list_meta( $coupon_id, self::META_ALLOWED_STATES, $request->get_param( 'allowed_states' ) );
		}
		if ( null !== $request->get_param( 'allowed_cities' ) && is_array( $request->get_param( 'allowed_cities' ) ) ) {
			self::set_string_list_meta( $coupon_id, self::META_ALLOWED_CITIES, $request->get_param( 'allowed_cities' ) );
		}
		if ( null !== $request->get_param( 'allowed_payment_methods' ) && is_array( $request->get_param( 'allowed_payment_methods' ) ) ) {
			self::set_string_list_meta( $coupon_id, self::META_ALLOWED_PAYMENT_METHODS, $request->get_param( 'allowed_payment_methods' ) );
		}
		if ( null !== $request->get_param( 'allowed_purchase_types' ) && is_array( $request->get_param( 'allowed_purchase_types' ) ) ) {
			$types = array();
			foreach ( $request->get_param( 'allowed_purchase_types' ) as $t ) {
				$t = sanitize_key( (string) $t );
				if ( in_array( $t, array( 'cash', 'credit', 'installment', 'wholesale' ), true ) ) {
					$types[] = $t;
				}
			}
			self::set_string_list_meta( $coupon_id, self::META_ALLOWED_PURCHASE_TYPES, $types );
		}
		if ( null !== $request->get_param( 'allowed_shipping_methods' ) && is_array( $request->get_param( 'allowed_shipping_methods' ) ) ) {
			self::set_string_list_meta( $coupon_id, self::META_ALLOWED_SHIPPING_METHODS, $request->get_param( 'allowed_shipping_methods' ) );
		}
		if ( null !== $request->get_param( 'allowed_channels' ) && is_array( $request->get_param( 'allowed_channels' ) ) ) {
			$channels = array();
			foreach ( $request->get_param( 'allowed_channels' ) as $ch ) {
				$ch = sanitize_key( (string) $ch );
				if ( in_array( $ch, array( 'site', 'bale', 'telegram' ), true ) ) {
					$channels[] = $ch;
				}
			}
			self::set_string_list_meta( $coupon_id, self::META_ALLOWED_CHANNELS, $channels );
		}
		return true;
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function bulk_action( $request ) {
		if ( ! self::wc_active() ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$action = sanitize_key( (string) $request->get_param( 'action' ) );
		$ids    = $request->get_param( 'ids' );
		if ( ! is_array( $ids ) || array() === $ids ) {
			return new WP_Error( 'invalid', __( 'No coupons selected.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$ids     = array_map( 'intval', $ids );
		$results = array( 'ok' => 0, 'failed' => 0 );

		foreach ( $ids as $id ) {
			$c = new WC_Coupon( $id );
			if ( ! $c->get_id() || 'shop_coupon' !== get_post_type( $id ) ) {
				++$results['failed'];
				continue;
			}
			$ok = false;
			switch ( $action ) {
				case 'trash':
					$ok = wp_trash_post( $id ) !== false;
					break;
				default:
					break;
			}
			if ( $ok ) {
				++$results['ok'];
			} else {
				++$results['failed'];
			}
		}
		return new WP_REST_Response( $results );
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function generate_code() {
		if ( function_exists( 'wc_generate_coupon_code' ) ) {
			return new WP_REST_Response( array( 'code' => wc_generate_coupon_code() ) );
		}
		$chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
		$code  = '';
		for ( $i = 0; $i < 8; $i++ ) {
			$code .= $chars[ wp_rand( 0, strlen( $chars ) - 1 ) ];
		}
		return new WP_REST_Response( array( 'code' => $code ) );
	}
}
