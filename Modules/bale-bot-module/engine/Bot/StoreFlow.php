<?php

namespace Webino_Dashboard_Bots_Bale\Bot;

use Webino_Dashboard_Bots_Bale\Bale\Client;
use Webino_Dashboard_Bots_Bale\Core\Plugin;
use Webino_Dashboard_Bots_Bale\Woo\UserWishlistContext;

/**
 * Browse categories, brands and products (inline keyboards).
 */
class StoreFlow {

	private const CB_CAT = 'c';
	private const CB_PRD = 'p';
	private const CB_BRAND = 'b';
	private const CB_WISHLIST = 'w';

	private static function product_is_available_for_bot( \WC_Product $product ): bool {
		if ( ! $product->is_purchasable() ) {
			return false;
		}
		if ( $product->is_type( 'variable' ) ) {
			foreach ( $product->get_children() as $vid ) {
				$v = wc_get_product( $vid );
				if ( $v && $v->is_type( 'variation' ) && $v->is_purchasable() && $v->is_in_stock() ) {
					return true;
				}
			}
			return false;
		}
		return $product->is_in_stock();
	}

	/**
	 * Bold title + price, or title + out-of-stock line. HTML for parse_mode.
	 */
	private static function product_caption_html( \WC_Product $product, bool $out_of_stock ): string {
		$name = '<b>' . esc_html( wp_strip_all_tags( $product->get_name() ) ) . '</b>';
		if ( $out_of_stock ) {
			return $name . "\n" . '❌ ' . esc_html__( 'ناموجود', 'webino-dashboard' );
		}
		return $name . "\n" . esc_html( self::price_text( $product ) );
	}

	private static function product_inline_markup_json( string $primary_cb, string $primary_label, int $product_id, ?int $user_id = null ): string {
		$rows = array(
			array(
				array(
					'text'          => $primary_label,
					'callback_data' => $primary_cb,
				),
			),
		);
		if ( strpos( $primary_cb, 'a:' ) === 0 || strpos( $primary_cb, 'pt:' ) === 0 ) {
			$rows[] = array(
				array(
					'text'          => __( '⚡ خرید سریع', 'webino-dashboard' ),
					'callback_data' => 'qb:' . $product_id,
				),
			);
		}
		$rows[] = array(
			array(
				'text'          => __( '📄 اطلاعات کامل محصول', 'webino-dashboard' ),
				'callback_data' => 'pd:' . $product_id,
			),
		);
		if ( class_exists( 'Webino_Dashboard_Bots_Loyalty', false ) ) {
			$web = Webino_Dashboard_Bots_Loyalty::webapp_url( 'product/' . $product_id );
			if ( $web !== '' ) {
				$rows[] = array(
					array(
						'text' => __( '🌐 باز کردن در وب', 'webino-dashboard' ),
						'url'  => $web,
					),
				);
			}
		}
		$rows[] = array(
			self::wishlist_button( $product_id, $user_id ),
		);
		return wp_json_encode( array( 'inline_keyboard' => $rows ) );
	}

	private static function product_detail_only_markup_json( int $product_id, ?int $user_id = null ): string {
		return wp_json_encode(
			array(
				'inline_keyboard' => array(
					array(
						array(
							'text'          => __( '📄 اطلاعات کامل محصول', 'webino-dashboard' ),
							'callback_data' => 'pd:' . $product_id,
						),
					),
					array(
						self::wishlist_button( $product_id, $user_id ),
					),
				),
			)
		);
	}

	/**
	 * @return array<string, string>
	 */
	private static function wishlist_button( int $product_id, ?int $user_id ): array {
		$in_wishlist = false;
		if ( null !== $user_id && $user_id > 0 ) {
			$in_wishlist = ( new UserWishlistContext() )->has( $user_id, $product_id );
		}
		return array(
			'text'          => $in_wishlist ? __( '💔 حذف از علاقمندی‌ها', 'webino-dashboard' ) : __( '❤️ افزودن به علاقمندی‌ها', 'webino-dashboard' ),
			'callback_data' => self::CB_WISHLIST . ':' . $product_id,
		);
	}

	private static function product_keyboard_json(
		\WC_Product $product,
		bool $available,
		int $cat_id,
		int $brand_id,
		int $page,
		?int $user_id = null
	): string {
		$pid = $product->get_id();
		if ( ! $available ) {
			return self::product_detail_only_markup_json( $pid, $user_id );
		}
		if ( $product->is_type( 'variable' ) ) {
			$cb  = 'v:' . $pid . ':' . $cat_id . ':' . $brand_id . ':' . $page;
			$btn = __( '🎨 انتخاب تنوع', 'webino-dashboard' );
			return self::product_inline_markup_json( $cb, $btn, $pid, $user_id );
		}
		$cb  = 'a:' . $pid;
		$btn = __( '🛒 افزودن به سبد', 'webino-dashboard' );
		if ( class_exists( 'Webino_Dashboard_Bots_WFCP', false ) && count( Webino_Dashboard_Bots_WFCP::enabled_types() ) > 1 ) {
			$cb  = 'pt:' . $pid;
			$btn = __( '🛒 انتخاب نوع خرید', 'webino-dashboard' );
		}
		return self::product_inline_markup_json( $cb, $btn, $pid, $user_id );
	}

	/**
	 * @param list<\WC_Product> $products
	 * @return list<\WC_Product>
	 */
	private static function sort_products_in_stock_first( array $products ): array {
		$in  = array();
		$oos = array();
		foreach ( $products as $p ) {
			if ( self::product_is_available_for_bot( $p ) ) {
				$in[] = $p;
			} else {
				$oos[] = $p;
			}
		}
		return array_merge( $in, $oos );
	}

	/**
	 * @return list<array<string, mixed>>
	 */
	public static function category_keyboard_rows( int $page = 0, int $parent_id = 0 ): array {
		$per_page = 8;
		$terms    = get_terms(
			array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => true,
				'parent'     => $parent_id,
				'number'     => 0,
			)
		);
		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return array();
		}
		usort(
			$terms,
			static function ( $a, $b ) {
				return strcasecmp( (string) $a->name, (string) $b->name );
			}
		);
		$slice  = array_slice( $terms, $page * $per_page, $per_page );
		$rows   = array();
		$buffer = array();
		foreach ( $slice as $t ) {
			$buffer[] = array(
				'text'          => (string) $t->name,
				'callback_data' => self::CB_CAT . ':' . (int) $t->term_id . ':0',
			);
			if ( count( $buffer ) >= 2 ) {
				$rows[] = $buffer;
				$buffer = array();
			}
		}
		if ( ! empty( $buffer ) ) {
			$rows[] = $buffer;
		}
		$nav = array();
		if ( $page > 0 ) {
			$nav[] = array(
				'text'          => '⬅️ ' . __( 'قبلی', 'webino-dashboard' ),
				'callback_data' => 'catp:' . ( $page - 1 ),
			);
		}
		if ( ( $page + 1 ) * $per_page < count( $terms ) ) {
			$nav[] = array(
				'text'          => __( 'بعدی', 'webino-dashboard' ) . ' ➡️',
				'callback_data' => 'catp:' . $parent_id . ':' . ( $page + 1 ),
			);
		}
		if ( $page > 0 ) {
			$nav[0]['callback_data'] = 'catp:' . $parent_id . ':' . ( $page - 1 );
		}
		if ( ! empty( $nav ) ) {
			$rows[] = $nav;
		}
		return $rows;
	}

	public static function send_categories( string $chat_id, int $page = 0, int $parent_id = 0 ): void {
		$rows   = self::category_keyboard_rows( $page, $parent_id );
		$client = new Client();
		if ( empty( $rows ) ) {
			if ( $parent_id > 0 ) {
				self::send_brands_page( $chat_id, $parent_id, 0 );
			} else {
				$client->send_message(
					array(
						'chat_id' => $chat_id,
						'text'    => __( 'دسته‌بندی محصولی یافت نشد.', 'webino-dashboard' ),
					)
				);
			}
			return;
		}
		if ( $parent_id > 0 ) {
			$rows = array_merge(
				array(
					array(
						array(
							'text'          => __( '📦 همه محصولات این دسته', 'webino-dashboard' ),
							'callback_data' => self::CB_BRAND . ':all:' . $parent_id . ':0',
						),
					),
				),
				$rows
			);
			$parent_term = get_term( $parent_id, 'product_cat' );
			if ( $parent_term && ! is_wp_error( $parent_term ) && (int) $parent_term->parent >= 0 ) {
				$rows[] = array(
					array(
						'text'          => '◀️ ' . __( 'بازگشت', 'webino-dashboard' ),
						'callback_data' => 'catp:' . (int) $parent_term->parent . ':0',
					),
				);
			}
		}
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => $parent_id > 0 ? __( '📂 زیر‌دسته را انتخاب کنید:', 'webino-dashboard' ) : __( '📂 یک دسته را انتخاب کنید:', 'webino-dashboard' ),
				'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
			)
		);
	}

	public static function send_brands_page( string $chat_id, int $cat_id, int $page = 0 ): void {
		$client = new Client();
		$cat    = get_term( $cat_id, 'product_cat' );
		if ( ! $cat || is_wp_error( $cat ) ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'دسته‌بندی نامعتبر است.', 'webino-dashboard' ) ) );
			return;
		}

		$product_ids = get_posts(
			array(
				'post_type'      => 'product',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'no_found_rows'  => true,
				'tax_query'      => array(
					array(
						'taxonomy'         => 'product_cat',
						'field'            => 'term_id',
						'terms'            => array( $cat_id ),
						'include_children' => true,
					),
				),
			)
		);
		$terms = array();
		if ( ! empty( $product_ids ) ) {
			$brand_terms = wp_get_object_terms(
				$product_ids,
				'product_brand',
				array(
					'hide_empty' => true,
				)
			);
			if ( ! is_wp_error( $brand_terms ) && ! empty( $brand_terms ) ) {
				$by_id = array();
				foreach ( $brand_terms as $term ) {
					$by_id[ (int) $term->term_id ] = $term;
				}
				$terms = array_values( $by_id );
				usort(
					$terms,
					static function ( $a, $b ) {
						return strcasecmp( (string) $a->name, (string) $b->name );
					}
				);
			}
		}

		$rows = array(
			array(
				array(
					'text'          => __( '📦 همه محصولات این دسته', 'webino-dashboard' ),
					'callback_data' => self::CB_BRAND . ':all:' . $cat_id . ':0',
				),
			),
		);
		$per_page = 8;
		$slice    = array_slice( $terms, $page * $per_page, $per_page );
		$buffer   = array();
		foreach ( $slice as $brand ) {
			$buffer[] = array(
				'text'          => $brand->name,
				'callback_data' => self::CB_BRAND . ':' . (int) $brand->term_id . ':' . $cat_id . ':0',
			);
			if ( count( $buffer ) >= 2 ) {
				$rows[] = $buffer;
				$buffer = array();
			}
		}
		if ( ! empty( $buffer ) ) {
			$rows[] = $buffer;
		}

		$nav = array();
		if ( $page > 0 ) {
			$nav[] = array( 'text' => '⬅️ ' . __( 'قبلی', 'webino-dashboard' ), 'callback_data' => 'bpg:' . $cat_id . ':' . ( $page - 1 ) );
		}
		if ( ( $page + 1 ) * $per_page < count( $terms ) ) {
			$nav[] = array( 'text' => __( 'بعدی', 'webino-dashboard' ) . ' ➡️', 'callback_data' => 'bpg:' . $cat_id . ':' . ( $page + 1 ) );
		}
		if ( ! empty( $nav ) ) {
			$rows[] = $nav;
		}

		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => sprintf( __( '🏷️ دسته «%s» انتخاب شد. برند را انتخاب کنید:', 'webino-dashboard' ), $cat->name ),
				'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
			)
		);
	}

	public static function send_products_page( string $chat_id, int $cat_id, int $page, ?int $brand_id = null, ?int $user_id = null ): void {
		$s   = Plugin::get_settings();
		$per = isset( $s['products_per_page'] ) ? max( 1, (int) $s['products_per_page'] ) : 5;
		$tax = array(
			'relation' => 'AND',
			array(
				'taxonomy'         => 'product_cat',
				'field'            => 'term_id',
				'terms'            => array( $cat_id ),
				'include_children' => true,
			),
		);
		if ( null !== $brand_id && $brand_id > 0 ) {
			$tax[] = array(
				'taxonomy' => 'product_brand',
				'field'    => 'term_id',
				'terms'    => array( $brand_id ),
			);
		}
		$q = new \WP_Query(
			array(
				'post_type'      => 'product',
				'post_status'    => 'publish',
				'posts_per_page' => $per,
				'paged'          => $page + 1,
				'tax_query'      => $tax,
			)
		);
		$products = array();
		$hide_oos = ! empty( Plugin::get_settings()['hide_out_of_stock_products'] ) && Plugin::get_settings()['hide_out_of_stock_products'] !== '0';
		foreach ( $q->posts as $post ) {
			$p = wc_get_product( $post->ID );
			if ( $p ) {
				if ( $hide_oos && ! self::product_is_available_for_bot( $p ) ) {
					continue;
				}
				$products[] = $p;
			}
		}
		$client = new Client();
		if ( empty( $products ) ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'محصولی با این فیلتر یافت نشد.', 'webino-dashboard' ) ) );
			return;
		}
		$ordered = self::sort_products_in_stock_first( $products );
		foreach ( $ordered as $product ) {
			$pid   = $product->get_id();
			$avail = self::product_is_available_for_bot( $product );
			$cap   = self::product_caption_html( $product, ! $avail );
			$img   = wp_get_attachment_image_url( $product->get_image_id(), 'medium' );
			$kbd   = self::product_keyboard_json( $product, $avail, $cat_id, null === $brand_id ? 0 : $brand_id, $page, $user_id );
			$params = array(
				'chat_id'      => $chat_id,
				'parse_mode'   => 'HTML',
				'reply_markup' => $kbd,
			);
			if ( $img ) {
				$params['photo']   = $img;
				$params['caption'] = $cap;
				$client->send_photo( $params );
			} else {
				$params['text'] = $cap;
				$client->send_message( $params );
			}
		}

		$brand_part = null === $brand_id ? 0 : $brand_id;
		$rows       = array();
		$nav        = array();
		if ( $page > 0 ) {
			$nav[] = array( 'text' => '⬅️', 'callback_data' => self::CB_PRD . ':' . $cat_id . ':' . $brand_part . ':' . ( $page - 1 ) );
		}
		if ( (int) $q->max_num_pages > $page + 1 ) {
			$nav[] = array( 'text' => '➡️', 'callback_data' => self::CB_PRD . ':' . $cat_id . ':' . $brand_part . ':' . ( $page + 1 ) );
		}
		if ( ! empty( $nav ) ) {
			$rows[] = $nav;
		}
		$rows[] = array(
			array(
				'text'          => '◀️ ' . __( 'بازگشت به برندها', 'webino-dashboard' ),
				'callback_data' => 'bpg:' . $cat_id . ':0',
			),
		);
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => '📑 ' . __( 'صفحه‌بندی', 'webino-dashboard' ),
				'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
			)
		);
	}

	public static function send_search_results( string $chat_id, string $query, ?int $user_id = null ): void {
		$query  = trim( $query );
		$client = new Client();
		if ( $query === '' ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'عبارت جستجو خالی است.', 'webino-dashboard' ) ) );
			return;
		}
		$s   = Plugin::get_settings();
		$per = isset( $s['products_per_page'] ) ? max( 1, (int) $s['products_per_page'] ) : 5;
		$q   = new \WP_Query(
			array(
				'post_type'      => 'product',
				'post_status'    => 'publish',
				'posts_per_page' => $per,
				's'              => $query,
			)
		);
		$products = array();
		$hide_oos = ! empty( Plugin::get_settings()['hide_out_of_stock_products'] ) && Plugin::get_settings()['hide_out_of_stock_products'] !== '0';
		foreach ( $q->posts as $post ) {
			$p = wc_get_product( $post->ID );
			if ( $p ) {
				if ( $hide_oos && ! self::product_is_available_for_bot( $p ) ) {
					continue;
				}
				$products[] = $p;
			}
		}
		if ( empty( $products ) ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'محصولی برای این جستجو پیدا نشد.', 'webino-dashboard' ) ) );
			return;
		}
		$client->send_message(
			array(
				'chat_id' => $chat_id,
				'text'    => sprintf( __( '🔍 نتایج جستجو برای: %s', 'webino-dashboard' ), $query ),
			)
		);
		$ordered = self::sort_products_in_stock_first( $products );
		foreach ( $ordered as $product ) {
			$avail = self::product_is_available_for_bot( $product );
			$cap   = self::product_caption_html( $product, ! $avail );
			$img   = wp_get_attachment_image_url( $product->get_image_id(), 'medium' );
			$kbd   = self::product_keyboard_json( $product, $avail, 0, 0, 0, $user_id );
			$params = array(
				'chat_id'      => $chat_id,
				'parse_mode'   => 'HTML',
				'reply_markup' => $kbd,
			);
			if ( $img ) {
				$params['photo']   = $img;
				$params['caption'] = $cap;
				$client->send_photo( $params );
			} else {
				$params['text'] = $cap;
				$client->send_message( $params );
			}
		}
	}

	/**
	 * Browse products currently on sale.
	 */
	public static function send_on_sale_products( string $chat_id, ?int $user_id = null ): void {
		$client = new Client();
		$s      = Plugin::get_settings();
		$per    = isset( $s['products_per_page'] ) ? max( 1, (int) $s['products_per_page'] ) : 5;
		$ids    = function_exists( 'wc_get_product_ids_on_sale' ) ? wc_get_product_ids_on_sale() : array();
		if ( empty( $ids ) && function_exists( 'wc_get_products' ) ) {
			$ids = wc_get_products(
				array(
					'status'  => 'publish',
					'limit'   => $per,
					'on_sale' => true,
					'return'  => 'ids',
				)
			);
		}
		$products = array();
		$hide_oos = ! empty( $s['hide_out_of_stock_products'] ) && $s['hide_out_of_stock_products'] !== '0';
		foreach ( array_slice( (array) $ids, 0, max( $per * 3, 15 ) ) as $pid ) {
			$p = wc_get_product( (int) $pid );
			if ( ! $p || ! $p->is_visible() || ! $p->is_on_sale() ) {
				continue;
			}
			if ( $hide_oos && ! self::product_is_available_for_bot( $p ) ) {
				continue;
			}
			$products[] = $p;
			if ( count( $products ) >= $per ) {
				break;
			}
		}
		if ( empty( $products ) ) {
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'فعلاً محصولی در فروش ویژه نیست.', 'webino-dashboard' ),
				)
			);
			return;
		}
		$client->send_message(
			array(
				'chat_id' => $chat_id,
				'text'    => __( '🔥 محصولات فروش ویژه', 'webino-dashboard' ),
			)
		);
		foreach ( self::sort_products_in_stock_first( $products ) as $product ) {
			$avail  = self::product_is_available_for_bot( $product );
			$cap    = self::product_caption_html( $product, ! $avail );
			$img    = wp_get_attachment_image_url( $product->get_image_id(), 'medium' );
			$kbd    = self::product_keyboard_json( $product, $avail, 0, 0, 0, $user_id );
			$params = array(
				'chat_id'      => $chat_id,
				'parse_mode'   => 'HTML',
				'reply_markup' => $kbd,
			);
			if ( $img ) {
				$params['photo']   = $img;
				$params['caption'] = $cap;
				$client->send_photo( $params );
			} else {
				$params['text'] = $cap;
				$client->send_message( $params );
			}
		}
	}

	public static function send_wishlist_products( string $chat_id, int $user_id ): void {
		$client   = new Client();
		$wishlist = new UserWishlistContext();
		$ids      = $wishlist->get_product_ids( $user_id );
		if ( empty( $ids ) ) {
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'لیست علاقمندی‌های شما خالی است.', 'webino-dashboard' ),
				)
			);
			return;
		}
		$products = array();
		foreach ( $ids as $pid ) {
			$product = wc_get_product( $pid );
			if ( $product && $product->is_visible() ) {
				$products[] = $product;
			}
		}
		if ( empty( $products ) ) {
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'محصول معتبری در علاقمندی‌های شما یافت نشد.', 'webino-dashboard' ),
				)
			);
			return;
		}
		$client->send_message(
			array(
				'chat_id' => $chat_id,
				'text'    => __( '❤️ لیست علاقمندی‌های شما:', 'webino-dashboard' ),
			)
		);
		foreach ( self::sort_products_in_stock_first( $products ) as $product ) {
			$avail = self::product_is_available_for_bot( $product );
			$cap   = self::product_caption_html( $product, ! $avail );
			$img   = wp_get_attachment_image_url( $product->get_image_id(), 'medium' );
			$kbd   = self::product_keyboard_json( $product, $avail, 0, 0, 0, $user_id );
			$params = array(
				'chat_id'      => $chat_id,
				'parse_mode'   => 'HTML',
				'reply_markup' => $kbd,
			);
			if ( $img ) {
				$params['photo']   = $img;
				$params['caption'] = $cap;
				$client->send_photo( $params );
			} else {
				$params['text'] = $cap;
				$client->send_message( $params );
			}
		}
	}

	/**
	 * Purchase-type keyboard after product/variation selection.
	 *
	 * @param string $prefix pta (simple) or ptv (variation).
	 */
	public static function send_purchase_type_picker( string $chat_id, string $prefix, int $id ): void {
		$client  = new Client();
		$product = function_exists( 'wc_get_product' ) ? wc_get_product( $id ) : null;
		if ( ! $product ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'محصول نامعتبر است.', 'webino-dashboard' ) ) );
			return;
		}
		if ( ! class_exists( 'Webino_Dashboard_Bots_WFCP', false ) ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'قیمت‌گذاری پیشرفته در دسترس نیست.', 'webino-dashboard' ) ) );
			return;
		}
		$rows = Webino_Dashboard_Bots_WFCP::type_keyboard_rows( $prefix, $id );
		if ( empty( $rows ) ) {
			$rows = array(
				array(
					array(
						'text'          => '💵 ' . __( 'نقدی', 'webino-dashboard' ),
						'callback_data' => $prefix . ':' . (int) $id . ':cash',
					),
				),
			);
		}
		$name = wp_strip_all_tags( (string) $product->get_name() );
		$lines = array(
			'<b>' . esc_html( $name ) . '</b>',
			esc_html__( 'نوع خرید را انتخاب کنید:', 'webino-dashboard' ),
		);
		foreach ( Webino_Dashboard_Bots_WFCP::enabled_types() as $row ) {
			$tid = $row['id'];
			if ( 'installment' === $tid ) {
				foreach ( Webino_Dashboard_Bots_WFCP::installment_plans() as $plan ) {
					$lines[] = esc_html( $row['label'] . ' / ' . $plan['label'] . ': ' . self::price_text( $product, 'installment', (int) $plan['months'] ) );
				}
				continue;
			}
			$lines[] = esc_html( $row['label'] . ': ' . self::price_text( $product, $tid ) );
		}
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => implode( "\n", $lines ),
				'parse_mode'   => 'HTML',
				'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
			)
		);
	}

	/**
	 * List variations as inline buttons (one per row). Callback vx:{variation_id}.
	 */
	public static function send_variation_picker( string $chat_id, int $parent_id, int $cat_id, int $brand_id, int $page ): void {
		$parent = wc_get_product( $parent_id );
		$client = new Client();
		if ( ! $parent || ! $parent->is_type( 'variable' ) ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'محصول نامعتبر است.', 'webino-dashboard' ) ) );
			return;
		}
		$rows     = array();
		$children = $parent->get_children();
		foreach ( $children as $vid ) {
			$v = wc_get_product( $vid );
			if ( ! $v || ! $v->is_type( 'variation' ) ) {
				continue;
			}
			if ( ! $v->is_purchasable() || ! $v->is_in_stock() ) {
				continue;
			}
			$attr_txt = wc_get_formatted_variation( $v, true, true, false );
			$label    = $attr_txt !== '' ? wp_strip_all_tags( $attr_txt ) : $v->get_name();
			$label   .= ' — ' . self::price_text( $v );
			$label    = mb_substr( $label, 0, 58 );
			$use_pt   = class_exists( 'Webino_Dashboard_Bots_WFCP', false ) && count( Webino_Dashboard_Bots_WFCP::enabled_types() ) > 1;
			$rows[]   = array(
				array(
					'text'          => $label,
					'callback_data' => ( $use_pt ? 'ptv:' : 'vx:' ) . (int) $vid,
				),
			);
		}
		if ( empty( $rows ) ) {
			$client->send_message( array( 'chat_id' => $chat_id, 'text' => __( 'تنوع قابل خریدی برای این محصول نیست.', 'webino-dashboard' ) ) );
			return;
		}
		$rows[] = array(
			array(
				'text'          => '◀️ ' . __( 'بازگشت', 'webino-dashboard' ),
				'callback_data' => self::CB_PRD . ':' . $cat_id . ':' . $brand_id . ':' . $page,
			),
		);
		$name_html = '<b>' . esc_html( wp_strip_all_tags( $parent->get_name() ) ) . '</b>';
		$client->send_message(
			array(
				'chat_id'      => $chat_id,
				'text'         => __( '🎨 تنوع را انتخاب کنید:', 'webino-dashboard' ) . "\n" . $name_html,
				'parse_mode'   => 'HTML',
				'reply_markup' => wp_json_encode( array( 'inline_keyboard' => $rows ) ),
			)
		);
	}

	public static function price_text( \WC_Product $product, string $type = 'cash', int $months = 0 ): string {
		if ( class_exists( 'Webino_Dashboard_Bots_WFCP', false ) ) {
			return Webino_Dashboard_Bots_WFCP::format_price(
				Webino_Dashboard_Bots_WFCP::price_for( $product, $type, $months )
			);
		}
		return number_format( (float) $product->get_price(), 0, '.', ',' ) . ' ' . __( 'تومان', 'webino-dashboard' );
	}

	/**
	 * Full product info for the bot (may be split across several messages).
	 */
	public static function send_product_detail( string $chat_id, int $product_id ): void {
		$product = wc_get_product( $product_id );
		$client  = new Client();
		if ( ! $product || ! $product->is_visible() ) {
			$client->send_message(
				array(
					'chat_id' => $chat_id,
					'text'    => __( 'محصول یافت نشد یا در دسترس نیست.', 'webino-dashboard' ),
				)
			);
			return;
		}

		$full = self::build_product_detail_html( $product );
		foreach ( self::split_message_chunks( $full, 4000 ) as $chunk ) {
			$client->send_message(
				array(
					'chat_id'    => $chat_id,
					'text'       => $chunk,
					'parse_mode' => 'HTML',
				)
			);
		}

		if ( ! $product->is_in_stock() ) {
			$pid = $product->get_id();
			$kbd = wp_json_encode(
				array(
					'inline_keyboard' => array(
						array(
							array(
								'text'          => __( '🔔 به من اطلاع بده', 'webino-dashboard' ),
								'callback_data' => 'sn:' . $pid,
							),
						),
					),
				)
			);
			$client->send_message(
				array(
					'chat_id'      => $chat_id,
					'text'         => __( 'برای اطلاع از موجودی دوباره، دکمهٔ زیر را بزنید.', 'webino-dashboard' ),
					'reply_markup' => $kbd,
				)
			);
		}
	}

	/**
	 * @return list<string>
	 */
	private static function split_message_chunks( string $text, int $max_len ): array {
		$text = trim( $text );
		if ( $text === '' ) {
			return array();
		}
		$out = array();
		while ( $text !== '' ) {
			if ( mb_strlen( $text ) <= $max_len ) {
				$out[] = $text;
				break;
			}
			$out[]  = mb_substr( $text, 0, $max_len );
			$text   = mb_substr( $text, $max_len );
		}
		return $out;
	}

	private static function build_product_detail_html( \WC_Product $product ): string {
		$lines   = array();
		$lines[] = '<b>' . esc_html( wp_strip_all_tags( $product->get_name() ) ) . '</b>';

		$sku = $product->get_sku();
		if ( is_string( $sku ) && $sku !== '' ) {
			$lines[] = esc_html__( 'شناسه کالا (SKU):', 'webino-dashboard' ) . ' ' . esc_html( $sku );
		}

		$cats = wc_get_product_category_list( $product->get_id(), '، ', '', '' );
		if ( is_string( $cats ) && trim( wp_strip_all_tags( $cats ) ) !== '' ) {
			$lines[] = esc_html__( 'دسته‌ها:', 'webino-dashboard' ) . ' ' . esc_html( wp_strip_all_tags( $cats ) );
		}

		$attr_lines = self::collect_attribute_lines_detail( $product );
		if ( ! empty( $attr_lines ) ) {
			$lines[] = esc_html__( 'ویژگی‌ها:', 'webino-dashboard' );
			foreach ( $attr_lines as $al ) {
				$lines[] = esc_html( $al );
			}
		}

		if ( $product->is_type( 'variable' ) && $product instanceof \WC_Product_Variable ) {
			$min = (float) $product->get_variation_price( 'min', true );
			$max = (float) $product->get_variation_price( 'max', true );
			if ( $min !== $max ) {
				$lines[] = esc_html__( 'محدوده قیمت:', 'webino-dashboard' ) . ' ' . esc_html( self::price_text_range( $min, $max ) );
			} else {
				$lines[] = esc_html__( 'قیمت:', 'webino-dashboard' ) . ' ' . esc_html( self::price_text( $product ) );
			}
			$var_lines = self::collect_variant_lines_detail( $product );
			if ( ! empty( $var_lines ) ) {
				$lines[] = esc_html__( 'تنوع‌ها:', 'webino-dashboard' );
				foreach ( array_slice( $var_lines, 0, 30 ) as $vl ) {
					$lines[] = esc_html( $vl );
				}
			}
		} else {
			$lines[] = esc_html__( 'قیمت:', 'webino-dashboard' ) . ' ' . esc_html( self::price_text( $product ) );
		}

		if ( $product->managing_stock() ) {
			$lines[] = esc_html__( 'موجودی:', 'webino-dashboard' ) . ' ' . esc_html( $product->is_in_stock() ? (string) $product->get_stock_quantity() : __( 'ناموجود', 'webino-dashboard' ) );
		} else {
			$lines[] = esc_html__( 'وضعیت:', 'webino-dashboard' ) . ' ' . esc_html( $product->is_in_stock() ? __( 'موجود', 'webino-dashboard' ) : __( 'ناموجود', 'webino-dashboard' ) );
		}

		if ( $product->has_weight() ) {
			$lines[] = esc_html__( 'وزن:', 'webino-dashboard' ) . ' ' . esc_html( wc_format_weight( $product->get_weight() ) );
		}
		if ( $product->has_dimensions() ) {
			$lines[] = esc_html__( 'ابعاد:', 'webino-dashboard' ) . ' ' . esc_html( wc_format_dimensions( $product->get_dimensions( false ) ) );
		}

		$short = self::normalize_text_lines_detail( $product->get_short_description() );
		if ( ! empty( $short ) ) {
			$lines[] = '';
			$lines[] = '📋 ' . esc_html__( 'خلاصه:', 'webino-dashboard' );
			foreach ( $short as $s ) {
				$lines[] = esc_html( $s );
			}
		}

		$post = get_post( $product->get_id() );
		$long = $post && isset( $post->post_content ) ? self::normalize_text_lines_detail( (string) $post->post_content ) : array();
		if ( ! empty( $long ) ) {
			$lines[] = '';
			$lines[] = '📄 ' . esc_html__( 'توضیحات:', 'webino-dashboard' );
			foreach ( $long as $l ) {
				$lines[] = esc_html( $l );
			}
		}

		$url = get_permalink( $product->get_id() );
		if ( $url ) {
			$lines[] = '';
			$lines[] = esc_html__( 'صفحه محصول:', 'webino-dashboard' ) . ' ' . esc_html( $url );
		}

		return implode( "\n", $lines );
	}

	private static function price_text_range( float $min, float $max ): string {
		return number_format( $min, 0, '.', ',' ) . ' — ' . number_format( $max, 0, '.', ',' ) . ' ' . __( 'تومان', 'webino-dashboard' );
	}

	/**
	 * @return list<string>
	 */
	private static function collect_attribute_lines_detail( \WC_Product $product ): array {
		$lines = array();
		foreach ( $product->get_attributes() as $attribute ) {
			if ( ! $attribute ) {
				continue;
			}
			$label = wc_attribute_label( $attribute->get_name() );
			if ( $attribute->is_taxonomy() ) {
				$values = wc_get_product_terms( $product->get_id(), $attribute->get_name(), array( 'fields' => 'names' ) );
				if ( empty( $values ) ) {
					continue;
				}
				$lines[] = '• ' . $label . ': ' . implode( '، ', $values );
				continue;
			}
			$options = $attribute->get_options();
			if ( empty( $options ) ) {
				continue;
			}
			$lines[] = '• ' . $label . ': ' . implode( '، ', $options );
		}
		return $lines;
	}

	/**
	 * @return list<string>
	 */
	private static function collect_variant_lines_detail( \WC_Product $product ): array {
		if ( ! $product->is_type( 'variable' ) ) {
			return array();
		}
		$lines = array();
		foreach ( $product->get_children() as $vid ) {
			$variation = wc_get_product( $vid );
			if ( ! $variation || ! $variation->is_type( 'variation' ) ) {
				continue;
			}
			$formatted = wc_get_formatted_variation( $variation, true, true, false );
			$label     = $formatted !== '' ? wp_strip_all_tags( $formatted ) : $variation->get_name();
			$lines[]   = '• ' . trim( $label ) . ' — ' . self::price_text( $variation );
		}
		return array_values( array_unique( $lines ) );
	}

	/**
	 * @return list<string>
	 */
	private static function normalize_text_lines_detail( string $html ): array {
		if ( trim( $html ) === '' ) {
			return array();
		}
		$text  = html_entity_decode( wp_strip_all_tags( $html ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$text  = str_replace( array( "\r\n", "\r" ), "\n", $text );
		$lines = array_filter(
			array_map(
				static function ( string $line ): string {
					return trim( preg_replace( '/\s+/u', ' ', $line ) );
				},
				explode( "\n", $text )
			)
		);
		return array_values( $lines );
	}
}

