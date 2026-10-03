<?php
/**
 * Extended migration exporters: brands, coupons, reviews, redirects, settings,
 * Elementor templates, stats, staff, waiting list, permalinks, review queue.
 *
 * Resources that the current Webino importer does not apply are still built.
 * The job sends them only when ping advertises the resource. See docs/WEBINO_MIGRATE.md.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Product tags. Separate from shop categories and from blog tags.
 */
final class Webino_Dashboard_Migrate_Export_Tags {

	/**
	 * @return list<string>
	 */
	public static function taxonomies() {
		return array( 'product_tag' );
	}

	/**
	 * @param string $cursor Cursor.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		return Webino_Dashboard_Migrate_Export_Categories::export_taxonomies( self::taxonomies(), 'tags', $cursor, $limit );
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		return Webino_Dashboard_Migrate_Export_Categories::count_taxonomies( self::taxonomies() );
	}
}

/**
 * Brand terms. Not stuffed into shop categories.
 */
final class Webino_Dashboard_Migrate_Export_Brands {

	/**
	 * @return list<string>
	 */
	public static function taxonomies() {
		$taxes = array();
		foreach ( array( 'product_brand', 'pwb-brand', 'yith_product_brand' ) as $brand ) {
			if ( function_exists( 'taxonomy_exists' ) && taxonomy_exists( $brand ) ) {
				$taxes[] = $brand;
			}
		}
		return $taxes;
	}

	/**
	 * @param string $cursor Cursor.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		$taxes = self::taxonomies();
		if ( ! $taxes ) {
			return array(
				'items'       => array(),
				'next_cursor' => (string) $cursor,
				'done'        => true,
				'total'       => 0,
				'warning'     => 'هیچ طبقه‌بندی برندی روی این سایت نیست.',
			);
		}
		return Webino_Dashboard_Migrate_Export_Categories::export_taxonomies( $taxes, 'brands', $cursor, $limit );
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		return Webino_Dashboard_Migrate_Export_Categories::count_taxonomies( self::taxonomies() );
	}
}

/**
 * Staff users as invite payloads. Passwords are never copied.
 */
final class Webino_Dashboard_Migrate_Export_Staff {

	/**
	 * @return list<string>
	 */
	public static function roles() {
		return array( 'administrator', 'shop_manager', 'editor', 'author', 'contributor', 'translator' );
	}

	/**
	 * @param string $cursor Cursor.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		if ( ! isset( $GLOBALS['wpdb'] ) ) {
			return self::empty_batch( $cursor );
		}
		$ids   = self::ids_after( (int) $cursor, (int) $limit );
		$items = array();
		$last  = (int) $cursor;
		foreach ( $ids as $id ) {
			$last = $id;
			$user = get_userdata( $id );
			if ( ! $user ) {
				continue;
			}
			$items[] = Webino_Dashboard_Migrate_Export_Support::filter_item( self::from_user( $user ), 'staff', $id );
		}
		return array(
			'items'       => $items,
			'next_cursor' => (string) $last,
			'done'        => count( $ids ) < $limit,
			'total'       => self::count_total(),
		);
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		if ( ! function_exists( 'count_users' ) ) {
			return 0;
		}
		$counts = count_users();
		$avail  = isset( $counts['avail_roles'] ) && is_array( $counts['avail_roles'] ) ? $counts['avail_roles'] : array();
		$total  = 0;
		foreach ( self::roles() as $role ) {
			$total += isset( $avail[ $role ] ) ? (int) $avail[ $role ] : 0;
		}
		return $total;
	}

	/**
	 * @param WP_User $user User.
	 * @return array<string,mixed>
	 */
	public static function from_user( $user ) {
		$roles = array_values( array_intersect( (array) $user->roles, self::roles() ) );
		return self::shape_item(
			array(
				'source_id'    => (int) $user->ID,
				'email'        => (string) $user->user_email,
				'name'         => (string) $user->display_name,
				'first_name'   => (string) $user->first_name,
				'last_name'    => (string) $user->last_name,
				'username'     => (string) $user->user_login,
				'roles'        => $roles,
				'invite'       => true,
				'registered_at' => Webino_Dashboard_Migrate_Export_Support::iso_date( $user->user_registered ),
			)
		);
	}

	/**
	 * @param array<string,mixed> $raw Raw staff row.
	 * @return array<string,mixed>
	 */
	public static function shape_item( array $raw ) {
		$raw = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $raw );
		unset( $raw['user_pass'], $raw['user_activation_key'] );
		return array(
			'source_id'          => isset( $raw['source_id'] ) ? (string) $raw['source_id'] : '',
			'email'              => isset( $raw['email'] ) ? (string) $raw['email'] : '',
			'name'               => isset( $raw['name'] ) ? (string) $raw['name'] : '',
			'first_name'         => isset( $raw['first_name'] ) ? (string) $raw['first_name'] : '',
			'last_name'          => isset( $raw['last_name'] ) ? (string) $raw['last_name'] : '',
			'username'           => isset( $raw['username'] ) ? (string) $raw['username'] : '',
			'roles'              => isset( $raw['roles'] ) && is_array( $raw['roles'] ) ? array_values( array_map( 'strval', $raw['roles'] ) ) : array(),
			'invite'             => true,
			'password_exported'  => false,
			'registered_at'      => isset( $raw['registered_at'] ) ? (string) $raw['registered_at'] : '',
		);
	}

	/**
	 * @param int $cursor Cursor.
	 * @param int $limit  Limit.
	 * @return list<int>
	 */
	private static function ids_after( $cursor, $limit ) {
		global $wpdb;
		$roles = self::roles();
		$like  = array();
		$args  = array( $wpdb->prefix . 'capabilities', (int) $cursor );
		foreach ( $roles as $role ) {
			$like[] = 'meta_value LIKE %s';
			$args[] = '%"' . $wpdb->esc_like( $role ) . '"%';
		}
		$args[] = (int) $limit;
		$sql    = "SELECT user_id FROM {$wpdb->usermeta} WHERE meta_key = %s AND user_id > %d AND (" . implode( ' OR ', $like ) . ') ORDER BY user_id ASC LIMIT %d';
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$ids = $wpdb->get_col( $wpdb->prepare( $sql, $args ) );
		return array_map( 'intval', is_array( $ids ) ? $ids : array() );
	}

	/**
	 * @param string $cursor Cursor.
	 * @return array<string,mixed>
	 */
	private static function empty_batch( $cursor ) {
		return array(
			'items'       => array(),
			'next_cursor' => (string) $cursor,
			'done'        => true,
			'total'       => 0,
		);
	}
}

/**
 * WooCommerce coupons.
 */
final class Webino_Dashboard_Migrate_Export_Coupons {

	/**
	 * @param string $cursor Cursor.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		if ( ! function_exists( 'get_post' ) ) {
			return array( 'items' => array(), 'next_cursor' => (string) $cursor, 'done' => true, 'total' => 0, 'warning' => 'ووکامرس برای کوپن در دسترس نیست.' );
		}
		$ids   = Webino_Dashboard_Migrate_Export_Support::post_ids_after( 'shop_coupon', array( 'publish', 'draft', 'private' ), (int) $cursor, (int) $limit );
		$items = array();
		$last  = (int) $cursor;
		foreach ( $ids as $id ) {
			$last = $id;
			$post = get_post( $id );
			if ( ! $post ) {
				continue;
			}
			$items[] = Webino_Dashboard_Migrate_Export_Support::filter_item( self::from_post( $post ), 'coupons', $id );
		}
		return array(
			'items'       => $items,
			'next_cursor' => (string) $last,
			'done'        => count( $ids ) < (int) $limit,
			'total'       => self::count_total(),
		);
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		return Webino_Dashboard_Migrate_Export_Support::count_posts( 'shop_coupon', array( 'publish', 'draft', 'private' ) );
	}

	/**
	 * @param WP_Post $post Coupon post.
	 * @return array<string,mixed>
	 */
	public static function from_post( $post ) {
		$id   = (int) $post->ID;
		$meta = function ( $key ) use ( $id ) {
			return function_exists( 'get_post_meta' ) ? get_post_meta( $id, $key, true ) : '';
		};
		$expires = $meta( 'date_expires' );
		return self::shape_item(
			array(
				'source_id'           => $id,
				'code'                => (string) $post->post_title,
				'description'         => (string) $post->post_excerpt,
				'status'              => (string) $post->post_status,
				'discount_type'       => (string) $meta( 'discount_type' ),
				'amount'              => (string) $meta( 'coupon_amount' ),
				'date_expires'        => is_numeric( $expires ) ? gmdate( 'c', (int) $expires ) : (string) $expires,
				'individual_use'      => 'yes' === (string) $meta( 'individual_use' ),
				'free_shipping'       => 'yes' === (string) $meta( 'free_shipping' ),
				'exclude_sale_items'  => 'yes' === (string) $meta( 'exclude_sale_items' ),
				'minimum_amount'      => (string) $meta( 'minimum_amount' ),
				'maximum_amount'      => (string) $meta( 'maximum_amount' ),
				'usage_limit'         => '' === (string) $meta( 'usage_limit' ) ? null : (int) $meta( 'usage_limit' ),
				'usage_count'         => (int) $meta( 'usage_count' ),
				'product_ids'         => self::id_list( $meta( 'product_ids' ) ),
				'excluded_product_ids' => self::id_list( $meta( 'exclude_product_ids' ) ),
				'product_categories'  => self::id_list( $meta( 'product_categories' ) ),
				'email_restrictions'  => self::id_list( $meta( 'customer_email' ) ),
			)
		);
	}

	/**
	 * @param array<string,mixed> $raw Raw coupon.
	 * @return array<string,mixed>
	 */
	public static function shape_item( array $raw ) {
		$raw = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $raw );
		return array(
			'source_id'            => isset( $raw['source_id'] ) ? (string) $raw['source_id'] : '',
			'code'                 => isset( $raw['code'] ) ? (string) $raw['code'] : '',
			'description'          => isset( $raw['description'] ) ? (string) $raw['description'] : '',
			'status'               => isset( $raw['status'] ) ? (string) $raw['status'] : '',
			'discount_type'        => isset( $raw['discount_type'] ) ? (string) $raw['discount_type'] : '',
			'amount'               => isset( $raw['amount'] ) ? (string) $raw['amount'] : '',
			'date_expires'         => isset( $raw['date_expires'] ) ? (string) $raw['date_expires'] : '',
			'individual_use'       => ! empty( $raw['individual_use'] ),
			'free_shipping'        => ! empty( $raw['free_shipping'] ),
			'exclude_sale_items'   => ! empty( $raw['exclude_sale_items'] ),
			'minimum_amount'       => isset( $raw['minimum_amount'] ) ? (string) $raw['minimum_amount'] : '',
			'maximum_amount'       => isset( $raw['maximum_amount'] ) ? (string) $raw['maximum_amount'] : '',
			'usage_limit'          => isset( $raw['usage_limit'] ) && null !== $raw['usage_limit'] && '' !== $raw['usage_limit'] ? (int) $raw['usage_limit'] : null,
			'usage_count'          => isset( $raw['usage_count'] ) ? (int) $raw['usage_count'] : 0,
			'product_ids'          => isset( $raw['product_ids'] ) && is_array( $raw['product_ids'] ) ? array_values( array_map( 'strval', $raw['product_ids'] ) ) : array(),
			'excluded_product_ids' => isset( $raw['excluded_product_ids'] ) && is_array( $raw['excluded_product_ids'] ) ? array_values( array_map( 'strval', $raw['excluded_product_ids'] ) ) : array(),
			'product_categories'   => isset( $raw['product_categories'] ) && is_array( $raw['product_categories'] ) ? array_values( array_map( 'strval', $raw['product_categories'] ) ) : array(),
			'email_restrictions'   => isset( $raw['email_restrictions'] ) && is_array( $raw['email_restrictions'] ) ? array_values( array_map( 'strval', $raw['email_restrictions'] ) ) : array(),
		);
	}

	/**
	 * @param mixed $value Meta value.
	 * @return list<string>
	 */
	private static function id_list( $value ) {
		if ( is_string( $value ) ) {
			$value = array_filter( array_map( 'trim', explode( ',', $value ) ) );
		}
		if ( ! is_array( $value ) ) {
			return array();
		}
		$out = array();
		foreach ( $value as $item ) {
			if ( is_scalar( $item ) && '' !== (string) $item ) {
				$out[] = (string) $item;
			}
		}
		return $out;
	}
}

/**
 * Product reviews.
 */
final class Webino_Dashboard_Migrate_Export_Reviews {

	/**
	 * @param string $cursor Cursor.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		global $wpdb;
		if ( ! isset( $wpdb ) || ! is_object( $wpdb ) || ! method_exists( $wpdb, 'get_results' ) ) {
			return array( 'items' => array(), 'next_cursor' => (string) $cursor, 'done' => true, 'total' => 0 );
		}
		$sql  = "SELECT c.comment_ID, c.comment_post_ID, c.comment_author, c.comment_author_email, c.comment_content, c.comment_date_gmt, c.comment_approved, c.user_id, c.comment_type
			FROM {$wpdb->comments} c
			INNER JOIN {$wpdb->posts} p ON p.ID = c.comment_post_ID
			WHERE p.post_type = 'product' AND c.comment_ID > %d AND c.comment_approved NOT IN ('spam','trash')
			AND c.comment_type IN ('review','comment','')
			ORDER BY c.comment_ID ASC LIMIT %d";
		$rows = $wpdb->get_results( $wpdb->prepare( $sql, (int) $cursor, (int) $limit ) );
		$rows = is_array( $rows ) ? $rows : array();
		$items = array();
		$last  = (int) $cursor;
		foreach ( $rows as $row ) {
			$last = (int) $row->comment_ID;
			$rating = function_exists( 'get_comment_meta' ) ? (string) get_comment_meta( (int) $row->comment_ID, 'rating', true ) : '';
			$items[] = Webino_Dashboard_Migrate_Export_Support::filter_item(
				self::shape_item(
					array(
						'source_id'          => (int) $row->comment_ID,
						'product_source_id'  => (int) $row->comment_post_ID,
						'author'             => (string) $row->comment_author,
						'email'              => (string) $row->comment_author_email,
						'content'            => (string) $row->comment_content,
						'rating'             => '' === $rating ? null : (int) $rating,
						'status'             => (string) $row->comment_approved,
						'user_source_id'     => (int) $row->user_id,
						'created_at'         => Webino_Dashboard_Migrate_Export_Support::iso_date( $row->comment_date_gmt ),
					)
				),
				'reviews',
				(int) $row->comment_ID
			);
		}
		return array(
			'items'       => $items,
			'next_cursor' => (string) $last,
			'done'        => count( $rows ) < (int) $limit,
			'total'       => self::count_total(),
		);
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		global $wpdb;
		if ( ! isset( $wpdb ) || ! method_exists( $wpdb, 'get_var' ) ) {
			return 0;
		}
		$sql = "SELECT COUNT(*) FROM {$wpdb->comments} c INNER JOIN {$wpdb->posts} p ON p.ID = c.comment_post_ID WHERE p.post_type = 'product' AND c.comment_approved NOT IN ('spam','trash') AND c.comment_type IN ('review','comment','')";
		return (int) $wpdb->get_var( $sql ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
	}

	/**
	 * @param array<string,mixed> $raw Raw review.
	 * @return array<string,mixed>
	 */
	public static function shape_item( array $raw ) {
		$raw = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $raw );
		return array(
			'source_id'         => isset( $raw['source_id'] ) ? (string) $raw['source_id'] : '',
			'product_source_id' => isset( $raw['product_source_id'] ) ? (string) $raw['product_source_id'] : '',
			'author'            => isset( $raw['author'] ) ? (string) $raw['author'] : '',
			'email'             => isset( $raw['email'] ) ? (string) $raw['email'] : '',
			'content'           => isset( $raw['content'] ) ? (string) $raw['content'] : '',
			'rating'            => isset( $raw['rating'] ) && null !== $raw['rating'] && '' !== $raw['rating'] ? (int) $raw['rating'] : null,
			'status'            => isset( $raw['status'] ) ? (string) $raw['status'] : '',
			'user_source_id'    => isset( $raw['user_source_id'] ) ? (int) $raw['user_source_id'] : 0,
			'created_at'        => isset( $raw['created_at'] ) ? (string) $raw['created_at'] : '',
		);
	}
}

/**
 * Elementor library templates (header, footer, single, archive, kit).
 */
final class Webino_Dashboard_Migrate_Export_Elementor_Templates {

	/**
	 * @param string $cursor Cursor.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		if ( ! function_exists( 'get_post' ) ) {
			return array( 'items' => array(), 'next_cursor' => (string) $cursor, 'done' => true, 'total' => 0 );
		}
		$ids   = Webino_Dashboard_Migrate_Export_Support::post_ids_after( 'elementor_library', array( 'publish', 'draft', 'private' ), (int) $cursor, (int) $limit );
		$items = array();
		$last  = (int) $cursor;
		foreach ( $ids as $id ) {
			$last = $id;
			$post = get_post( $id );
			if ( ! $post ) {
				continue;
			}
			$meta     = Webino_Dashboard_Migrate_Elementor::meta_for_post( $id );
			$rendered = Webino_Dashboard_Migrate_Elementor::rendered_html( $post );
			$document = Webino_Dashboard_Migrate_Elementor::convert(
				$meta['data'],
				array(
					'html'        => $rendered,
					'css'         => (string) $meta['css'],
					'title'       => (string) $post->post_title,
					'external_id' => (string) $id,
				)
			);
			$items[] = Webino_Dashboard_Migrate_Export_Support::filter_item(
				array(
					'source_id'     => (string) $id,
					'title'         => (string) $post->post_title,
					'slug'          => (string) $post->post_name,
					'status'        => (string) $post->post_status,
					'template_type' => (string) $meta['template_type'],
					'location'      => (string) $meta['location'],
					'conditions'    => $meta['conditions'],
					'page_settings' => $meta['page_settings'],
					'css'           => (string) $meta['css'],
					'css_url'       => (string) $meta['css_url'],
					'document'      => $document,
					'content'       => $rendered,
					'elementor'     => $meta,
				),
				'elementor_templates',
				$id
			);
		}
		$warning = '';
		if ( ! $ids && (int) $cursor <= 0 ) {
			$warning = 'قالب کتابخانه المنتور پیدا نشد. برگه‌های ساخته‌شده با المنتور داخل موجودیت برگه‌ها هستند.';
		}
		return array(
			'items'       => $items,
			'next_cursor' => (string) $last,
			'done'        => count( $ids ) < (int) $limit,
			'total'       => self::count_total(),
			'warning'     => $warning,
		);
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		return Webino_Dashboard_Migrate_Export_Support::count_posts( 'elementor_library', array( 'publish', 'draft', 'private' ) );
	}
}

/**
 * Rank Math and Yoast redirects.
 */
final class Webino_Dashboard_Migrate_Export_Redirects {

	/**
	 * @param string $cursor Cursor `source|id`.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		$sources = self::sources();
		if ( ! $sources ) {
			return array(
				'items'       => array(),
				'next_cursor' => '',
				'done'        => true,
				'total'       => 0,
				'warning'     => 'جدول یا گزینه ریدایرکت Rank Math / Yoast پیدا نشد.',
			);
		}
		list( $source, $last ) = self::parse_cursor( $cursor, $sources );
		$items = array();
		$guard = 0;
		while ( count( $items ) < (int) $limit && $guard < 8 ) {
			++$guard;
			$rows = self::rows( $source, $last, (int) $limit - count( $items ) );
			foreach ( $rows as $row ) {
				$last    = (int) $row['cursor_id'];
				$items[] = Webino_Dashboard_Migrate_Export_Support::filter_item( $row['item'], 'redirects', $last );
			}
			if ( count( $rows ) >= ( (int) $limit - count( $items ) + count( $rows ) ) && count( $items ) >= (int) $limit ) {
				break;
			}
			if ( count( $rows ) > 0 && count( $items ) < (int) $limit ) {
				continue;
			}
			$next = self::next_source( $source, $sources );
			if ( null === $next ) {
				return array(
					'items'       => $items,
					'next_cursor' => $source . '|' . $last,
					'done'        => true,
					'total'       => self::count_total(),
				);
			}
			if ( ! $rows ) {
				$source = $next;
				$last   = 0;
			}
		}
		return array(
			'items'       => $items,
			'next_cursor' => $source . '|' . $last,
			'done'        => false,
			'total'       => self::count_total(),
		);
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		$total = 0;
		foreach ( self::sources() as $source ) {
			$total += self::count_source( $source );
		}
		return $total;
	}

	/**
	 * @param array<string,mixed> $raw Raw redirect.
	 * @return array<string,mixed>
	 */
	public static function shape_item( array $raw ) {
		$code = isset( $raw['code'] ) ? (int) $raw['code'] : 301;
		if ( $code < 300 || $code > 399 ) {
			$code = 301;
		}
		return array(
			'source_id' => isset( $raw['source_id'] ) ? (string) $raw['source_id'] : '',
			'source'    => isset( $raw['source'] ) ? (string) $raw['source'] : '',
			'from'      => isset( $raw['from'] ) ? (string) $raw['from'] : '',
			'to'        => isset( $raw['to'] ) ? (string) $raw['to'] : '',
			'code'      => $code,
			'status'    => isset( $raw['status'] ) ? (string) $raw['status'] : 'active',
		);
	}

	/**
	 * @return list<string>
	 */
	private static function sources() {
		$out = array();
		if ( Webino_Dashboard_Migrate_Export_Support::table_exists( self::table( 'rank_math_redirections' ) ) ) {
			$out[] = 'rank_math';
		}
		foreach ( array( 'yoast_seo_redirects', 'yoast_redirects' ) as $suffix ) {
			if ( Webino_Dashboard_Migrate_Export_Support::table_exists( self::table( $suffix ) ) ) {
				$out[] = 'yoast_table';
				break;
			}
		}
		if ( function_exists( 'get_option' ) && is_array( get_option( 'wpseo_redirect', null ) ) ) {
			$out[] = 'yoast_option';
		}
		return $out;
	}

	/**
	 * @param string $suffix Suffix.
	 * @return string
	 */
	private static function table( $suffix ) {
		global $wpdb;
		$prefix = ( isset( $wpdb ) && isset( $wpdb->prefix ) ) ? $wpdb->prefix : 'wp_';
		return $prefix . $suffix;
	}

	/**
	 * @param string       $cursor  Cursor.
	 * @param list<string> $sources Sources.
	 * @return array{0:string,1:int}
	 */
	private static function parse_cursor( $cursor, array $sources ) {
		$parts = explode( '|', (string) $cursor, 2 );
		$source = isset( $parts[0] ) ? (string) $parts[0] : '';
		$last   = isset( $parts[1] ) ? (int) $parts[1] : 0;
		if ( ! in_array( $source, $sources, true ) ) {
			return array( (string) $sources[0], 0 );
		}
		return array( $source, $last );
	}

	/**
	 * @param string       $current Current.
	 * @param list<string> $sources Sources.
	 * @return string|null
	 */
	private static function next_source( $current, array $sources ) {
		$index = array_search( $current, $sources, true );
		if ( false === $index ) {
			return null;
		}
		$next = $index + 1;
		return isset( $sources[ $next ] ) ? $sources[ $next ] : null;
	}

	/**
	 * @param string $source Source.
	 * @param int    $last   Last id.
	 * @param int    $limit  Limit.
	 * @return list<array{cursor_id:int,item:array<string,mixed>}>
	 */
	private static function rows( $source, $last, $limit ) {
		if ( $limit <= 0 ) {
			return array();
		}
		if ( 'rank_math' === $source ) {
			return self::rank_math_rows( $last, $limit );
		}
		if ( 'yoast_table' === $source ) {
			return self::yoast_table_rows( $last, $limit );
		}
		if ( 'yoast_option' === $source && 0 === (int) $last ) {
			return self::yoast_option_rows();
		}
		return array();
	}

	/**
	 * @param string $source Source.
	 * @return int
	 */
	private static function count_source( $source ) {
		global $wpdb;
		if ( 'rank_math' === $source && isset( $wpdb ) ) {
			return (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . self::table( 'rank_math_redirections' ) ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		}
		if ( 'yoast_option' === $source && function_exists( 'get_option' ) ) {
			$rows = get_option( 'wpseo_redirect', array() );
			return is_array( $rows ) ? count( $rows ) : 0;
		}
		return 0;
	}

	/**
	 * @param int $last  Last id.
	 * @param int $limit Limit.
	 * @return list<array{cursor_id:int,item:array<string,mixed>}>
	 */
	private static function rank_math_rows( $last, $limit ) {
		global $wpdb;
		$table = self::table( 'rank_math_redirections' );
		$sql   = "SELECT * FROM {$table} WHERE id > %d ORDER BY id ASC LIMIT %d";
		$rows  = $wpdb->get_results( $wpdb->prepare( $sql, (int) $last, (int) $limit ), ARRAY_A );
		$out   = array();
		foreach ( is_array( $rows ) ? $rows : array() as $row ) {
			$from = '';
			$sources = isset( $row['sources'] ) ? $row['sources'] : '';
			$decoded = is_string( $sources ) ? json_decode( $sources, true ) : $sources;
			if ( ! is_array( $decoded ) && is_string( $sources ) ) {
				$decoded = @unserialize( $sources, array( 'allowed_classes' => false ) ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			}
			if ( is_array( $decoded ) ) {
				$first = isset( $decoded[0] ) ? $decoded[0] : $decoded;
				if ( is_array( $first ) && isset( $first['pattern'] ) ) {
					$from = (string) $first['pattern'];
				}
			}
			$out[] = array(
				'cursor_id' => (int) $row['id'],
				'item'      => self::shape_item(
					array(
						'source_id' => 'rank-math-' . (int) $row['id'],
						'source'    => 'rank_math',
						'from'      => $from,
						'to'        => isset( $row['url_to'] ) ? (string) $row['url_to'] : '',
						'code'      => isset( $row['header_code'] ) ? (int) $row['header_code'] : 301,
						'status'    => isset( $row['status'] ) ? (string) $row['status'] : 'active',
					)
				),
			);
		}
		return $out;
	}

	/**
	 * @param int $last  Last.
	 * @param int $limit Limit.
	 * @return list<array{cursor_id:int,item:array<string,mixed>}>
	 */
	private static function yoast_table_rows( $last, $limit ) {
		global $wpdb;
		$table = '';
		foreach ( array( 'yoast_seo_redirects', 'yoast_redirects' ) as $suffix ) {
			$candidate = self::table( $suffix );
			if ( Webino_Dashboard_Migrate_Export_Support::table_exists( $candidate ) ) {
				$table = $candidate;
				break;
			}
		}
		if ( '' === $table ) {
			return array();
		}
		$sql  = "SELECT * FROM {$table} WHERE id > %d ORDER BY id ASC LIMIT %d";
		$rows = $wpdb->get_results( $wpdb->prepare( $sql, (int) $last, (int) $limit ), ARRAY_A );
		$out  = array();
		foreach ( is_array( $rows ) ? $rows : array() as $row ) {
			$from = isset( $row['origin'] ) ? (string) $row['origin'] : ( isset( $row['url'] ) ? (string) $row['url'] : '' );
			$to   = isset( $row['url'] ) && isset( $row['origin'] ) ? (string) $row['url'] : ( isset( $row['target'] ) ? (string) $row['target'] : '' );
			$out[] = array(
				'cursor_id' => isset( $row['id'] ) ? (int) $row['id'] : 0,
				'item'      => self::shape_item(
					array(
						'source_id' => 'yoast-' . ( isset( $row['id'] ) ? (int) $row['id'] : 0 ),
						'source'    => 'yoast',
						'from'      => $from,
						'to'        => $to,
						'code'      => isset( $row['type'] ) ? (int) $row['type'] : 301,
						'status'    => 'active',
					)
				),
			);
		}
		return $out;
	}

	/**
	 * @return list<array{cursor_id:int,item:array<string,mixed>}>
	 */
	private static function yoast_option_rows() {
		$rows = get_option( 'wpseo_redirect', array() );
		if ( ! is_array( $rows ) ) {
			return array();
		}
		$out = array();
		$i   = 0;
		foreach ( $rows as $from => $row ) {
			++$i;
			$target = is_array( $row ) && isset( $row['url'] ) ? (string) $row['url'] : ( is_string( $row ) ? $row : '' );
			$code   = is_array( $row ) && isset( $row['type'] ) ? (int) $row['type'] : 301;
			$out[]  = array(
				'cursor_id' => $i,
				'item'      => self::shape_item(
					array(
						'source_id' => 'yoast-option-' . $i,
						'source'    => 'yoast',
						'from'      => (string) $from,
						'to'        => $target,
						'code'      => $code,
						'status'    => 'active',
					)
				),
			);
		}
		return $out;
	}
}

/**
 * Store settings without payment credentials or license material.
 */
final class Webino_Dashboard_Migrate_Export_Settings {

	/**
	 * @param string $cursor Cursor.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		unset( $limit );
		if ( '' !== (string) $cursor ) {
			return array( 'items' => array(), 'next_cursor' => '1', 'done' => true, 'total' => 1 );
		}
		$item = self::shape_item( self::collect() );
		return array(
			'items'       => array( Webino_Dashboard_Migrate_Export_Support::filter_item( $item, 'settings', 1 ) ),
			'next_cursor' => '1',
			'done'        => true,
			'total'       => 1,
		);
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		return function_exists( 'get_option' ) ? 1 : 0;
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function collect() {
		$option = function ( $key ) {
			return function_exists( 'get_option' ) ? get_option( $key, '' ) : '';
		};
		$package = array(
			'source_id' => 'store',
			'store'     => array(
				'address'   => (string) $option( 'woocommerce_store_address' ),
				'address_2' => (string) $option( 'woocommerce_store_address_2' ),
				'city'      => (string) $option( 'woocommerce_store_city' ),
				'postcode'  => (string) $option( 'woocommerce_store_postcode' ),
				'country'   => (string) $option( 'woocommerce_default_country' ),
				'currency'  => (string) $option( 'woocommerce_currency' ),
				'email'     => (string) $option( 'woocommerce_email_from_address' ),
				'email_name' => (string) $option( 'woocommerce_email_from_name' ),
				'weight_unit' => (string) $option( 'woocommerce_weight_unit' ),
				'dimension_unit' => (string) $option( 'woocommerce_dimension_unit' ),
			),
			'shipping_zones' => self::shipping_zones(),
			'tax_rates'      => self::tax_rates(),
			'payments'       => self::payments(),
			'emails'         => self::emails(),
			'pwa'            => self::option_array( 'webino_dashboard_pwa' ),
			'notify'         => self::option_array( 'webino_dashboard_notify' ),
			'brand_style'    => self::option_array( 'webino_dashboard_brand_style' ),
			'swatches'       => self::option_array( 'webino_dashboard_swatch_settings' ),
			'attribute_groups' => self::option_array( 'webino_dashboard_attribute_groups' ),
			'modules'        => self::module_flags(),
		);
		return $package;
	}

	/**
	 * @param array<string,mixed> $raw Raw package.
	 * @return array<string,mixed>
	 */
	public static function shape_item( array $raw ) {
		$clean = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $raw );
		if ( ! is_array( $clean ) ) {
			$clean = array();
		}
		$clean['source_id'] = 'store';
		$clean['kind']      = 'settings';
		return $clean;
	}

	/**
	 * @param string $key Option.
	 * @return array<string,mixed>
	 */
	private static function option_array( $key ) {
		if ( ! function_exists( 'get_option' ) ) {
			return array();
		}
		$value = get_option( $key, array() );
		return is_array( $value ) ? $value : array();
	}

	/**
	 * @return list<array<string,mixed>>
	 */
	private static function shipping_zones() {
		if ( ! class_exists( 'WC_Shipping_Zones' ) ) {
			return array();
		}
		$zones = WC_Shipping_Zones::get_zones();
		$out   = array();
		if ( is_array( $zones ) ) {
			foreach ( $zones as $zone ) {
				$out[] = self::zone_row( $zone );
			}
		}
		if ( method_exists( 'WC_Shipping_Zones', 'get_zone' ) ) {
			$rest = WC_Shipping_Zones::get_zone( 0 );
			if ( is_object( $rest ) && method_exists( $rest, 'get_data' ) ) {
				$out[] = self::zone_row( $rest->get_data() );
			}
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $zone Zone.
	 * @return array<string,mixed>
	 */
	private static function zone_row( array $zone ) {
		$methods = array();
		$rows    = isset( $zone['shipping_methods'] ) && is_array( $zone['shipping_methods'] ) ? $zone['shipping_methods'] : array();
		foreach ( $rows as $method ) {
			if ( ! is_object( $method ) ) {
				continue;
			}
			$settings = method_exists( $method, 'instance_settings' ) || isset( $method->instance_settings ) ? (array) $method->instance_settings : array();
			$methods[] = array(
				'id'       => method_exists( $method, 'get_method_id' ) ? (string) $method->get_method_id() : '',
				'title'    => method_exists( $method, 'get_title' ) ? (string) $method->get_title() : '',
				'enabled'  => method_exists( $method, 'is_enabled' ) ? (bool) $method->is_enabled() : false,
				'settings' => Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $settings ),
			);
		}
		return array(
			'id'      => isset( $zone['id'] ) ? (int) $zone['id'] : 0,
			'name'    => isset( $zone['zone_name'] ) ? (string) $zone['zone_name'] : '',
			'order'   => isset( $zone['zone_order'] ) ? (int) $zone['zone_order'] : 0,
			'methods' => $methods,
		);
	}

	/**
	 * @return list<array<string,mixed>>
	 */
	private static function tax_rates() {
		global $wpdb;
		if ( ! isset( $wpdb ) || ! method_exists( $wpdb, 'get_results' ) ) {
			return array();
		}
		$table = $wpdb->prefix . 'woocommerce_tax_rates';
		if ( ! Webino_Dashboard_Migrate_Export_Support::table_exists( $table ) ) {
			return array();
		}
		$rows = $wpdb->get_results( "SELECT tax_rate_id, tax_rate_country, tax_rate_state, tax_rate, tax_rate_name, tax_rate_priority, tax_rate_compound, tax_rate_shipping, tax_rate_class FROM {$table} ORDER BY tax_rate_id ASC LIMIT 500", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		return is_array( $rows ) ? $rows : array();
	}

	/**
	 * @return list<array<string,mixed>>
	 */
	private static function payments() {
		if ( ! function_exists( 'WC' ) ) {
			return array();
		}
		$wc = WC();
		if ( ! is_object( $wc ) || ! method_exists( $wc, 'payment_gateways' ) ) {
			return array();
		}
		$registry = $wc->payment_gateways();
		if ( ! is_object( $registry ) || ! method_exists( $registry, 'payment_gateways' ) ) {
			return array();
		}
		$out = array();
		foreach ( (array) $registry->payment_gateways() as $gateway ) {
			if ( ! is_object( $gateway ) ) {
				continue;
			}
			$id       = isset( $gateway->id ) ? (string) $gateway->id : '';
			$settings = function_exists( 'get_option' ) ? get_option( 'woocommerce_' . $id . '_settings', array() ) : array();
			$settings = is_array( $settings ) ? Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $settings ) : array();
			$out[]    = array(
				'id'       => $id,
				'title'    => isset( $gateway->title ) ? (string) $gateway->title : '',
				'enabled'  => isset( $gateway->enabled ) ? 'yes' === (string) $gateway->enabled : false,
				'settings' => is_array( $settings ) ? $settings : array(),
			);
		}
		return $out;
	}

	/**
	 * @return list<array<string,mixed>>
	 */
	private static function emails() {
		if ( ! function_exists( 'WC' ) ) {
			return array();
		}
		$wc = WC();
		if ( ! is_object( $wc ) || ! method_exists( $wc, 'mailer' ) ) {
			return array();
		}
		$mailer = $wc->mailer();
		if ( ! is_object( $mailer ) || ! method_exists( $mailer, 'get_emails' ) ) {
			return array();
		}
		$out = array();
		foreach ( (array) $mailer->get_emails() as $email ) {
			if ( ! is_object( $email ) ) {
				continue;
			}
			$out[] = array(
				'id'      => isset( $email->id ) ? (string) $email->id : '',
				'title'   => isset( $email->title ) ? (string) $email->title : '',
				'enabled' => isset( $email->enabled ) ? 'yes' === (string) $email->enabled : false,
				'subject' => method_exists( $email, 'get_subject' ) ? (string) $email->get_subject() : '',
				'heading' => method_exists( $email, 'get_heading' ) ? (string) $email->get_heading() : '',
			);
		}
		return $out;
	}

	/**
	 * @return array<string,bool>
	 */
	private static function module_flags() {
		$flags = array();
		$dir   = defined( 'WEBINO_MODULES_DIR' ) ? (string) WEBINO_MODULES_DIR : '';
		if ( '' !== $dir && is_dir( $dir ) ) {
			foreach ( glob( $dir . '*/manifest.json' ) ?: array() as $manifest ) {
				$slug = basename( dirname( $manifest ) );
				if ( class_exists( 'Webino_Dashboard_Module_Registry', false ) && method_exists( 'Webino_Dashboard_Module_Registry', 'is_active' ) ) {
					$flags[ $slug ] = (bool) Webino_Dashboard_Module_Registry::is_active( $slug );
				} elseif ( function_exists( 'get_option' ) ) {
					$flags[ $slug ] = (bool) get_option( 'webino_dashboard_module_' . $slug . '_active', false );
				}
			}
		}
		return $flags;
	}
}

/**
 * Daily analytics aggregates when webino_dashboard_analytics_* tables exist.
 */
final class Webino_Dashboard_Migrate_Export_Stats {

	/**
	 * @param string $cursor Cursor `table|id`.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		$tables = self::tables();
		if ( ! $tables ) {
			return array(
				'items'       => array(),
				'next_cursor' => '',
				'done'        => true,
				'total'       => 0,
				'warning'     => 'جدول webino_dashboard_analytics_* نیست. آمار فروش از سفارش‌های واردشده در وبینو ساخته می‌شود.',
			);
		}
		list( $table, $last ) = self::parse_cursor( $cursor, $tables );
		global $wpdb;
		$sql  = "SELECT * FROM {$table} WHERE id > %d ORDER BY id ASC LIMIT %d";
		$rows = $wpdb->get_results( $wpdb->prepare( $sql, (int) $last, (int) $limit ), ARRAY_A );
		$rows = is_array( $rows ) ? $rows : array();
		$items = array();
		foreach ( $rows as $row ) {
			$last = isset( $row['id'] ) ? (int) $row['id'] : $last;
			$items[] = Webino_Dashboard_Migrate_Export_Support::filter_item( self::shape_row( $table, $row ), 'stats', $last );
		}
		if ( count( $rows ) < (int) $limit ) {
			$next = self::next_table( $table, $tables );
			if ( null === $next ) {
				return array( 'items' => $items, 'next_cursor' => $table . '|' . $last, 'done' => true, 'total' => self::count_total() );
			}
			return array( 'items' => $items, 'next_cursor' => $next . '|0', 'done' => false, 'total' => self::count_total() );
		}
		return array(
			'items'       => $items,
			'next_cursor' => $table . '|' . $last,
			'done'        => false,
			'total'       => self::count_total(),
		);
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		global $wpdb;
		$total = 0;
		foreach ( self::tables() as $table ) {
			$total += (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		}
		return $total;
	}

	/**
	 * @param string              $table Table.
	 * @param array<string,mixed> $row   Row.
	 * @return array<string,mixed>
	 */
	public static function shape_row( $table, array $row ) {
		$row    = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $row );
		$period = '';
		foreach ( array( 'period', 'day', 'date', 'stat_date', 'bucket' ) as $key ) {
			if ( ! empty( $row[ $key ] ) && is_scalar( $row[ $key ] ) ) {
				$period = (string) $row[ $key ];
				break;
			}
		}
		$orders = 0;
		foreach ( array( 'orders', 'order_count', 'sales_count' ) as $key ) {
			if ( isset( $row[ $key ] ) ) {
				$orders = (int) $row[ $key ];
				break;
			}
		}
		$revenue = '';
		foreach ( array( 'revenue', 'total', 'sales_total' ) as $key ) {
			if ( isset( $row[ $key ] ) && is_scalar( $row[ $key ] ) ) {
				$revenue = (string) $row[ $key ];
				break;
			}
		}
		$id = isset( $row['id'] ) ? (string) $row['id'] : $period;
		return array(
			'source_id' => basename( (string) $table ) . ':' . $id,
			'period'    => '' !== $period ? $period : $id,
			'orders'    => $orders,
			'revenue'   => $revenue,
			'currency'  => function_exists( 'get_woocommerce_currency' ) ? (string) get_woocommerce_currency() : '',
			'table'     => (string) $table,
			'metrics'   => is_array( $row ) ? $row : array(),
		);
	}

	/**
	 * @return list<string>
	 */
	private static function tables() {
		global $wpdb;
		if ( ! isset( $wpdb ) || ! method_exists( $wpdb, 'get_col' ) ) {
			return array();
		}
		$like = $wpdb->prefix . 'webino_dashboard_analytics%';
		$found = $wpdb->get_col( $wpdb->prepare( 'SHOW TABLES LIKE %s', $like ) );
		$out = array();
		foreach ( is_array( $found ) ? $found : array() as $table ) {
			$table = (string) $table;
			if ( preg_match( '/^[A-Za-z0-9_]+$/', $table ) ) {
				$out[] = $table;
			}
		}
		sort( $out );
		return $out;
	}

	/**
	 * @param string       $cursor Cursor.
	 * @param list<string> $tables Tables.
	 * @return array{0:string,1:int}
	 */
	private static function parse_cursor( $cursor, array $tables ) {
		$parts = explode( '|', (string) $cursor, 2 );
		$table = isset( $parts[0] ) ? (string) $parts[0] : '';
		$last  = isset( $parts[1] ) ? (int) $parts[1] : 0;
		if ( ! in_array( $table, $tables, true ) ) {
			return array( (string) $tables[0], 0 );
		}
		return array( $table, $last );
	}

	/**
	 * @param string       $current Current.
	 * @param list<string> $tables  Tables.
	 * @return string|null
	 */
	private static function next_table( $current, array $tables ) {
		$index = array_search( $current, $tables, true );
		if ( false === $index ) {
			return null;
		}
		$next = $index + 1;
		return isset( $tables[ $next ] ) ? $tables[ $next ] : null;
	}
}

/**
 * YITH waiting list rows when the plugin tables exist.
 */
final class Webino_Dashboard_Migrate_Export_Waiting_List {

	/**
	 * @param string $cursor Cursor.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		$table = self::table();
		if ( '' === $table ) {
			return array(
				'items'       => array(),
				'next_cursor' => '',
				'done'        => true,
				'total'       => 0,
				'warning'     => 'جدول لیست انتظار YITH پیدا نشد.',
			);
		}
		global $wpdb;
		$sql  = "SELECT * FROM {$table} WHERE id > %d ORDER BY id ASC LIMIT %d";
		$rows = $wpdb->get_results( $wpdb->prepare( $sql, (int) $cursor, (int) $limit ), ARRAY_A );
		$rows = is_array( $rows ) ? $rows : array();
		$items = array();
		$last  = (int) $cursor;
		foreach ( $rows as $row ) {
			$last = isset( $row['id'] ) ? (int) $row['id'] : $last;
			$clean = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $row );
			$items[] = Webino_Dashboard_Migrate_Export_Support::filter_item(
				array(
					'source_id' => 'yith-' . $last,
					'product_source_id' => isset( $clean['product_id'] ) ? (string) $clean['product_id'] : '',
					'email'     => isset( $clean['email'] ) ? (string) $clean['email'] : ( isset( $clean['user_email'] ) ? (string) $clean['user_email'] : '' ),
					'record'    => is_array( $clean ) ? $clean : array(),
				),
				'waiting_list',
				$last
			);
		}
		return array(
			'items'       => $items,
			'next_cursor' => (string) $last,
			'done'        => count( $rows ) < (int) $limit,
			'total'       => self::count_total(),
		);
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		$table = self::table();
		if ( '' === $table ) {
			return 0;
		}
		global $wpdb;
		return (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
	}

	/**
	 * @return string
	 */
	private static function table() {
		global $wpdb;
		if ( ! isset( $wpdb ) ) {
			return '';
		}
		foreach ( array( 'yith_wcwtl_waitlists', 'yith_wcwtl_list', 'yith_wcwtl_users' ) as $suffix ) {
			$table = $wpdb->prefix . $suffix;
			if ( Webino_Dashboard_Migrate_Export_Support::table_exists( $table ) ) {
				return $table;
			}
		}
		return '';
	}
}

/**
 * Old permalink → slug map for cutover.
 */
final class Webino_Dashboard_Migrate_Export_Permalinks {

	/**
	 * @param string $cursor Cursor `type|id`.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		$types = array( 'product', 'page', 'post' );
		list( $type, $last ) = self::parse_cursor( $cursor, $types );
		if ( ! function_exists( 'get_post' ) ) {
			return array( 'items' => array(), 'next_cursor' => '', 'done' => true, 'total' => 0 );
		}
		$items = array();
		$guard = 0;
		while ( count( $items ) < (int) $limit && $guard < 6 ) {
			++$guard;
			$ids = Webino_Dashboard_Migrate_Export_Support::post_ids_after( $type, array( 'publish', 'draft', 'private', 'pending' ), $last, (int) $limit - count( $items ) );
			foreach ( $ids as $id ) {
				$last = $id;
				$post = get_post( $id );
				if ( ! $post ) {
					continue;
				}
				$path = function_exists( 'wp_parse_url' ) ? (string) ( wp_parse_url( (string) get_permalink( $id ), PHP_URL_PATH ) ) : '';
				$items[] = Webino_Dashboard_Migrate_Export_Support::filter_item(
					self::shape_item(
						array(
							'source_id'        => $type . ':' . $id,
							'entity'           => 'product' === $type ? 'products' : ( 'page' === $type ? 'pages' : 'posts' ),
							'object_source_id' => $id,
							'slug'             => (string) $post->post_name,
							'permalink'        => function_exists( 'get_permalink' ) ? (string) get_permalink( $id ) : '',
							'path'             => $path,
						)
					),
					'permalinks',
					$id
				);
			}
			if ( count( $ids ) >= ( (int) $limit - count( $items ) + count( $ids ) ) && count( $items ) >= (int) $limit ) {
				break;
			}
			$next = self::next_type( $type, $types );
			if ( null === $next || count( $items ) >= (int) $limit ) {
				$done = null === $next && count( $ids ) < (int) $limit;
				return array(
					'items'       => $items,
					'next_cursor' => $type . '|' . $last,
					'done'        => $done || ( null === $next && ! $ids ),
					'total'       => self::count_total(),
				);
			}
			if ( count( $ids ) < ( (int) $limit ) ) {
				$type = $next;
				$last = 0;
			}
		}
		return array(
			'items'       => $items,
			'next_cursor' => $type . '|' . $last,
			'done'        => false,
			'total'       => self::count_total(),
		);
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		return Webino_Dashboard_Migrate_Export_Support::count_posts( 'product', array( 'publish', 'draft', 'private', 'pending' ) )
			+ Webino_Dashboard_Migrate_Export_Support::count_posts( 'page', array( 'publish', 'draft', 'private', 'pending' ) )
			+ Webino_Dashboard_Migrate_Export_Support::count_posts( 'post', array( 'publish', 'draft', 'private', 'pending' ) );
	}

	/**
	 * @param array<string,mixed> $raw Raw link.
	 * @return array<string,mixed>
	 */
	public static function shape_item( array $raw ) {
		return array(
			'source_id'        => isset( $raw['source_id'] ) ? (string) $raw['source_id'] : '',
			'entity'           => isset( $raw['entity'] ) ? (string) $raw['entity'] : '',
			'object_source_id' => isset( $raw['object_source_id'] ) ? (int) $raw['object_source_id'] : 0,
			'slug'             => isset( $raw['slug'] ) ? (string) $raw['slug'] : '',
			'permalink'        => Webino_Dashboard_Migrate_Schema::public_url( isset( $raw['permalink'] ) ? $raw['permalink'] : '' ),
			'path'             => isset( $raw['path'] ) ? (string) $raw['path'] : '',
		);
	}

	/**
	 * @param string       $cursor Cursor.
	 * @param list<string> $types  Types.
	 * @return array{0:string,1:int}
	 */
	private static function parse_cursor( $cursor, array $types ) {
		$parts = explode( '|', (string) $cursor, 2 );
		$type  = isset( $parts[0] ) ? (string) $parts[0] : '';
		$last  = isset( $parts[1] ) ? (int) $parts[1] : 0;
		if ( ! in_array( $type, $types, true ) ) {
			return array( (string) $types[0], 0 );
		}
		return array( $type, $last );
	}

	/**
	 * @param string       $current Current.
	 * @param list<string> $types   Types.
	 * @return string|null
	 */
	private static function next_type( $current, array $types ) {
		$index = array_search( $current, $types, true );
		if ( false === $index ) {
			return null;
		}
		$next = $index + 1;
		return isset( $types[ $next ] ) ? $types[ $next ] : null;
	}
}

/**
 * Wallet, tickets, and returns staged for operator review. needs_mapping is always true.
 */
final class Webino_Dashboard_Migrate_Export_Review_Queue {

	/**
	 * @param string $cursor Cursor `kind|id`.
	 * @param int    $limit  Limit.
	 * @return array<string,mixed>
	 */
	public static function export_batch( $cursor, $limit ) {
		$kinds = self::kinds();
		if ( ! $kinds ) {
			return array(
				'items'       => array(),
				'next_cursor' => '',
				'done'        => true,
				'total'       => 0,
				'warning'     => 'جدول کیف پول، تیکت یا مرجوعی پیدا نشد.',
			);
		}
		list( $kind, $last ) = self::parse_cursor( $cursor, $kinds );
		global $wpdb;
		$table = self::table_for( $kind );
		$sql   = "SELECT * FROM {$table} WHERE id > %d ORDER BY id ASC LIMIT %d";
		$rows  = $wpdb->get_results( $wpdb->prepare( $sql, (int) $last, (int) $limit ), ARRAY_A );
		$rows  = is_array( $rows ) ? $rows : array();
		$items = array();
		foreach ( $rows as $row ) {
			$last  = isset( $row['id'] ) ? (int) $row['id'] : $last;
			$clean = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys( $row );
			$items[] = Webino_Dashboard_Migrate_Export_Support::filter_item(
				array(
					'source_id'     => $kind . ':' . $last,
					'kind'          => $kind,
					'needs_mapping' => true,
					'record'        => is_array( $clean ) ? $clean : array(),
				),
				'review_queue',
				$last
			);
		}
		if ( count( $rows ) < (int) $limit ) {
			$next = self::next_kind( $kind, $kinds );
			if ( null === $next ) {
				return array( 'items' => $items, 'next_cursor' => $kind . '|' . $last, 'done' => true, 'total' => self::count_total(), 'warning' => 'این ردیف‌ها needs_mapping هستند و تا زمان مدل مقصد در صف بررسی می‌مانند.' );
			}
			return array( 'items' => $items, 'next_cursor' => $next . '|0', 'done' => false, 'total' => self::count_total() );
		}
		return array(
			'items'       => $items,
			'next_cursor' => $kind . '|' . $last,
			'done'        => false,
			'total'       => self::count_total(),
		);
	}

	/**
	 * @return int
	 */
	public static function count_total() {
		global $wpdb;
		$total = 0;
		foreach ( self::kinds() as $kind ) {
			$table  = self::table_for( $kind );
			$total += (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		}
		return $total;
	}

	/**
	 * @return list<string>
	 */
	private static function kinds() {
		$out = array();
		foreach ( array( 'wallet' => 'webino_wallet_ledger', 'tickets' => 'webino_support_tickets', 'returns' => 'webino_order_returns' ) as $kind => $suffix ) {
			if ( '' !== self::resolve( $suffix ) ) {
				$out[] = $kind;
			}
		}
		return $out;
	}

	/**
	 * @param string $kind Kind.
	 * @return string
	 */
	private static function table_for( $kind ) {
		$map = array(
			'wallet'  => 'webino_wallet_ledger',
			'tickets' => 'webino_support_tickets',
			'returns' => 'webino_order_returns',
		);
		return self::resolve( isset( $map[ $kind ] ) ? $map[ $kind ] : '' );
	}

	/**
	 * @param string $suffix Suffix.
	 * @return string
	 */
	private static function resolve( $suffix ) {
		global $wpdb;
		if ( '' === $suffix || ! isset( $wpdb ) ) {
			return '';
		}
		$table = $wpdb->prefix . $suffix;
		return Webino_Dashboard_Migrate_Export_Support::table_exists( $table ) ? $table : '';
	}

	/**
	 * @param string       $cursor Cursor.
	 * @param list<string> $kinds  Kinds.
	 * @return array{0:string,1:int}
	 */
	private static function parse_cursor( $cursor, array $kinds ) {
		$parts = explode( '|', (string) $cursor, 2 );
		$kind  = isset( $parts[0] ) ? (string) $parts[0] : '';
		$last  = isset( $parts[1] ) ? (int) $parts[1] : 0;
		if ( ! in_array( $kind, $kinds, true ) ) {
			return array( (string) $kinds[0], 0 );
		}
		return array( $kind, $last );
	}

	/**
	 * @param string       $current Current.
	 * @param list<string> $kinds   Kinds.
	 * @return string|null
	 */
	private static function next_kind( $current, array $kinds ) {
		$index = array_search( $current, $kinds, true );
		if ( false === $index ) {
			return null;
		}
		$next = $index + 1;
		return isset( $kinds[ $next ] ) ? $kinds[ $next ] : null;
	}
}
