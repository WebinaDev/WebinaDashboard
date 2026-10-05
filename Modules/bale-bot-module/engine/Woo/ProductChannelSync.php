<?php

namespace Webino_Dashboard_Bots_Bale\Woo;

use Webino_Dashboard_Bots_Bale\Bale\Client;
use Webino_Dashboard_Bots_Bale\Core\Plugin;

/**
 * On product publish/update: sync post to Bale channel (edit when possible to avoid spam).
 */
class ProductChannelSync {

	private const META_MSG_ID   = '_woobale_bale_channel_message_id';
	private const META_HASH     = '_woobale_bale_channel_sync_hash';
	private const META_LAST_IMG = '_woobale_bale_last_image';
	private const META_IS_PHOTO = '_woobale_bale_channel_is_photo';
	private static $instance = null;

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function init(): void {
		add_action( 'save_post_product', array( $this, 'on_save_product' ), 20, 3 );
		add_filter( 'post_row_actions', array( $this, 'add_product_list_row_action' ), 20, 2 );
		add_action( 'post_submitbox_misc_actions', array( $this, 'render_single_product_sync_button' ) );
		add_action( 'admin_post_woobale_sync_product_channel', array( $this, 'handle_manual_sync_action' ) );
		add_action( 'admin_notices', array( $this, 'render_sync_notice' ) );
	}

	/**
	 * @param int      $post_id
	 * @param \WP_Post $post
	 * @param bool     $update
	 */
	public function on_save_product( $post_id, $post, $update ): void {
		if ( wp_is_post_revision( $post_id ) || 'publish' !== get_post_status( $post_id ) ) {
			return;
		}
		$this->sync_product_to_channel( (int) $post_id );
	}

	/**
	 * Sync one product to channel and update sync metadata.
	 *
	 * @return true|\WP_Error
	 */
	public function sync_product_to_channel( int $post_id ) {
		if ( $post_id < 1 ) {
			return new \WP_Error( 'invalid_product', __( 'شناسه محصول نامعتبر است.', 'webino-dashboard' ) );
		}

		$channel = Plugin::get_channel_id();
		$token   = Plugin::get_bot_token();
		if ( $channel === '' || $token === '' ) {
			return new \WP_Error( 'missing_settings', __( 'تنظیمات کانال یا توکن کامل نیست.', 'webino-dashboard' ) );
		}

		$product = wc_get_product( $post_id );
		if ( ! $product || ! $product->is_visible() ) {
			return new \WP_Error( 'invalid_product_state', __( 'محصول معتبر/قابل نمایش نیست.', 'webino-dashboard' ) );
		}

		if ( ! $this->product_passes_channel_rules( $product ) ) {
			return true;
		}

		$caption  = $this->build_caption( $product );
		$img      = wp_get_attachment_image_url( $product->get_image_id(), 'large' );
		$img      = $img ? $img : '';
		$hash     = md5( $caption . '|' . $img );
		$prev_hash = (string) get_post_meta( $post_id, self::META_HASH, true );
		$msg_id    = (int) get_post_meta( $post_id, self::META_MSG_ID, true );
		$last_img  = (string) get_post_meta( $post_id, self::META_LAST_IMG, true );
		$was_photo = (bool) get_post_meta( $post_id, self::META_IS_PHOTO, true );
		$is_photo  = $img !== '';

		if ( $prev_hash === $hash && $msg_id > 0 ) {
			return true;
		}

		$pid = $product->get_id();
		$kbd = wp_json_encode(
			array(
				'inline_keyboard' => array(
					array(
						array(
							'text'          => __( '🛒 خرید این محصول از بازو', 'webino-dashboard' ),
							'callback_data' => 'a:' . $pid,
						),
					),
					array(
						array(
							'text'          => __( '📄 اطلاعات کامل محصول', 'webino-dashboard' ),
							'callback_data' => 'pd:' . $pid,
						),
					),
					array(
						array(
							'text'          => __( '❤️ افزودن به علاقمندی‌ها', 'webino-dashboard' ),
							'callback_data' => 'w:' . $pid,
						),
					),
				),
			)
		);

		$client = new Client();

		$can_edit = $msg_id > 0 && $was_photo === $is_photo && $img === $last_img;
		if ( $can_edit ) {
			$edited = $this->try_edit_channel_message( $client, $channel, $msg_id, $caption, $kbd, $is_photo );
			if ( $edited ) {
				update_post_meta( $post_id, self::META_HASH, $hash );
				return true;
			}
		}

		$res = null;
		if ( $is_photo ) {
			$res = $client->send_photo(
				array(
					'chat_id'      => $channel,
					'photo'        => $img,
					'caption'      => $caption,
					'parse_mode'   => 'HTML',
					'reply_markup' => $kbd,
				)
			);
		} else {
			$res = $client->send_message(
				array(
					'chat_id'      => $channel,
					'text'         => $caption,
					'parse_mode'   => 'HTML',
					'reply_markup' => $kbd,
				)
			);
		}

		$new_id = $this->extract_message_id( $res );
		if ( $new_id > 0 ) {
			update_post_meta( $post_id, self::META_MSG_ID, $new_id );
			update_post_meta( $post_id, self::META_HASH, $hash );
			update_post_meta( $post_id, self::META_LAST_IMG, $img );
			update_post_meta( $post_id, self::META_IS_PHOTO, $is_photo ? '1' : '0' );
			return true;
		}

		$detail = Client::summarize_error( $res );
		return new \WP_Error(
			'sync_failed',
			sprintf(
				/* translators: %s: error message from Bale Bot API */
				__( 'ارسال/ویرایش پیام کانال ناموفق بود: %s', 'webino-dashboard' ),
				$detail
			)
		);
	}

	/**
	 * @param array<string, string> $actions
	 * @param \WP_Post              $post
	 * @return array<string, string>
	 */
	public function add_product_list_row_action( array $actions, \WP_Post $post ): array {
		if ( $post->post_type !== 'product' || ! current_user_can( 'edit_post', $post->ID ) ) {
			return $actions;
		}
		$url = wp_nonce_url(
			add_query_arg(
				array(
					'action'     => 'woobale_sync_product_channel',
					'product_id' => (int) $post->ID,
				),
				admin_url( 'admin-post.php' )
			),
			'woobale_sync_product_' . (int) $post->ID
		);
		$actions['woobale_sync_channel'] = '<a href="' . esc_url( $url ) . '">' . esc_html__( 'افزودن به کانال بله', 'webino-dashboard' ) . '</a>';
		return $actions;
	}

	public function render_single_product_sync_button(): void {
		global $post;
		if ( ! $post instanceof \WP_Post || $post->post_type !== 'product' || ! current_user_can( 'edit_post', $post->ID ) ) {
			return;
		}
		$url = wp_nonce_url(
			add_query_arg(
				array(
					'action'     => 'woobale_sync_product_channel',
					'product_id' => (int) $post->ID,
				),
				admin_url( 'admin-post.php' )
			),
			'woobale_sync_product_' . (int) $post->ID
		);
		echo '<div class="misc-pub-section"><a class="button button-secondary" href="' . esc_url( $url ) . '">' . esc_html__( 'افزودن به کانال بله', 'webino-dashboard' ) . '</a></div>';
	}

	public function handle_manual_sync_action(): void {
		if ( ! current_user_can( 'edit_products' ) ) {
			wp_die( esc_html__( 'مجوز دسترسی ندارید.', 'webino-dashboard' ) );
		}
		$product_id = isset( $_GET['product_id'] ) ? absint( $_GET['product_id'] ) : 0;
		check_admin_referer( 'woobale_sync_product_' . $product_id );
		$res = $this->sync_product_to_channel( $product_id );
		$ok  = ! is_wp_error( $res );
		$redirect = add_query_arg(
			array(
				'post'          => $product_id,
				'action'        => 'edit',
				'woobale_sync'  => $ok ? '1' : '0',
				'woobale_error' => $ok ? '' : rawurlencode( (string) $res->get_error_message() ),
			),
			admin_url( 'post.php' )
		);
		wp_safe_redirect( $redirect );
		exit;
	}

	public function render_sync_notice(): void {
		if ( ! is_admin() || ! current_user_can( 'edit_products' ) || empty( $_GET['woobale_sync'] ) ) {
			return;
		}
		$ok = (string) wp_unslash( $_GET['woobale_sync'] ) === '1';
		if ( $ok ) {
			echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'محصول با موفقیت به کانال بله ارسال/به‌روزرسانی شد.', 'webino-dashboard' ) . '</p></div>';
			return;
		}
		$error = isset( $_GET['woobale_error'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['woobale_error'] ) ) : __( 'خطای نامشخص', 'webino-dashboard' );
		echo '<div class="notice notice-error is-dismissible"><p>' . esc_html__( 'ارسال به کانال ناموفق بود:', 'webino-dashboard' ) . ' ' . esc_html( $error ) . '</p></div>';
	}

	private function build_caption( \WC_Product $product ): string {
		$name        = wp_strip_all_tags( $product->get_name() );
		$excerpt     = $this->normalize_text_lines( $product->get_short_description() );
		$attrs       = $this->collect_attribute_lines( $product );
		$variants    = $this->collect_variant_lines( $product );
		$price       = \Webino_Dashboard_Bots_Bale\Bot\StoreFlow::price_text( $product );
		$product_url = get_permalink( $product->get_id() );

		$parts   = array();
		$parts[] = '<b>' . esc_html( $name ) . '</b>';
		if ( ! empty( $excerpt ) ) {
			$parts[] = implode(
				"\n",
				array_map(
					static function ( $line ) {
						return esc_html( (string) $line );
					},
					$excerpt
				)
			);
		}
		if ( ! empty( $attrs ) ) {
			$parts[] = esc_html__( 'ویژگی‌ها:', 'webino-dashboard' ) . "\n" . implode(
				"\n",
				array_map(
					static function ( $line ) {
						return esc_html( (string) $line );
					},
					$attrs
				)
			);
		}
		if ( ! empty( $variants ) ) {
			$parts[] = esc_html__( 'متغیرها:', 'webino-dashboard' ) . "\n" . implode(
				"\n",
				array_map(
					static function ( $line ) {
						return esc_html( (string) $line );
					},
					$variants
				)
			);
		}

		$parts[] = esc_html__( 'قیمت', 'webino-dashboard' ) . ' ' . esc_html( $price ) . ' 💰';
		if ( $product_url ) {
			$parts[] = esc_html__( 'افزودن به سبد خرید:', 'webino-dashboard' ) . ' ' . esc_html( $product_url );
		}
		$settings   = Plugin::get_settings();
		$contact_id = isset( $settings['channel_contact_id'] ) ? trim( (string) $settings['channel_contact_id'] ) : '';
		$bale_link  = isset( $settings['channel_bale_link'] ) ? trim( (string) $settings['channel_bale_link'] ) : '';
		if ( $contact_id !== '' ) {
			$parts[] = esc_html__( 'جهت ثبت سفارش به آیدی زیر👇🏻', 'webino-dashboard' ) . "\n" . esc_html( $contact_id );
		}
		if ( $bale_link !== '' ) {
			$parts[] = esc_html__( 'لینک کانال در بله👇🏻', 'webino-dashboard' ) . "\n" . esc_html( $bale_link );
		}

		$caption = implode( "\n\n", $parts );
		$caption = trim( preg_replace( '/\n{3,}/', "\n\n", $caption ) );
		return mb_substr( $caption, 0, 1000 );
	}

	/**
	 * @return list<string>
	 */
	private function normalize_text_lines( string $html ): array {
		if ( trim( $html ) === '' ) {
			return array();
		}
		$text  = html_entity_decode( wp_strip_all_tags( $html ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$text  = str_replace( array( "\r\n", "\r" ), "\n", $text );
		$lines = array_filter(
			array_map(
				static function ( string $line ): string {
					$line = trim( preg_replace( '/\s+/u', ' ', $line ) );
					if ( $line === '' ) {
						return '';
					}
					if ( strpos( $line, '•' ) === 0 || strpos( $line, '-' ) === 0 ) {
						return $line;
					}
					return '• ' . $line;
				},
				explode( "\n", $text )
			)
		);
		return array_values( $lines );
	}

	/**
	 * @return list<string>
	 */
	private function collect_attribute_lines( \WC_Product $product ): array {
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
	private function collect_variant_lines( \WC_Product $product ): array {
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
			$lines[]   = '• ' . trim( $label );
		}
		return array_values( array_unique( $lines ) );
	}

	/**
	 * @param array<string, mixed>|null $res
	 */
	private function extract_message_id( ?array $res ): int {
		if ( ! $res || empty( $res['ok'] ) || empty( $res['result']['message_id'] ) ) {
			return 0;
		}
		return (int) $res['result']['message_id'];
	}

	/**
	 * @return bool True if edit succeeded.
	 */
	private function try_edit_channel_message(
		Client $client,
		string $channel,
		int $message_id,
		string $caption,
		string $reply_markup,
		bool $is_photo_message
	): bool {
		if ( $is_photo_message ) {
			$res = $client->edit_message_caption(
				array(
					'chat_id'      => $channel,
					'message_id'   => $message_id,
					'caption'      => $caption,
					'parse_mode'   => 'HTML',
					'reply_markup' => $reply_markup,
				)
			);
		} else {
			$res = $client->edit_message_text(
				array(
					'chat_id'      => $channel,
					'message_id'   => $message_id,
					'text'         => $caption,
					'parse_mode'   => 'HTML',
					'reply_markup' => $reply_markup,
				)
			);
		}
		return is_array( $res ) && ! empty( $res['ok'] );
	}

	/**
	 * Optional filters: product categories/tags, sale-only, min price, server hour window.
	 */
	private function product_passes_channel_rules( \WC_Product $product ): bool {
		$s = Plugin::get_settings();

		$raw_cats = isset( $s['channel_rule_category_ids'] ) ? trim( (string) $s['channel_rule_category_ids'] ) : '';
		if ( $raw_cats !== '' ) {
			$ids = array_filter( array_map( 'absint', preg_split( '/[\s,]+/', $raw_cats ) ) );
			if ( ! empty( $ids ) ) {
				$product_cats = function_exists( 'wc_get_product_term_ids' )
					? wc_get_product_term_ids( $product->get_id(), 'product_cat' )
					: wp_get_post_terms( $product->get_id(), 'product_cat', array( 'fields' => 'ids' ) );
				if ( ! is_array( $product_cats ) ) {
					$product_cats = array();
				}
				if ( empty( array_intersect( $ids, array_map( 'intval', $product_cats ) ) ) ) {
					return false;
				}
			}
		}

		$raw_tags = isset( $s['channel_rule_tag_ids'] ) ? trim( (string) $s['channel_rule_tag_ids'] ) : '';
		if ( $raw_tags !== '' ) {
			$ids = array_filter( array_map( 'absint', preg_split( '/[\s,]+/', $raw_tags ) ) );
			if ( ! empty( $ids ) ) {
				$product_tags = function_exists( 'wc_get_product_term_ids' )
					? wc_get_product_term_ids( $product->get_id(), 'product_tag' )
					: wp_get_post_terms( $product->get_id(), 'product_tag', array( 'fields' => 'ids' ) );
				if ( ! is_array( $product_tags ) ) {
					$product_tags = array();
				}
				if ( empty( array_intersect( $ids, array_map( 'intval', $product_tags ) ) ) ) {
					return false;
				}
			}
		}

		if ( ! empty( $s['channel_rule_sale_only'] ) && (string) $s['channel_rule_sale_only'] !== '0' && ! $product->is_on_sale() ) {
			return false;
		}

		$min_p = isset( $s['channel_rule_min_price'] ) ? trim( (string) $s['channel_rule_min_price'] ) : '';
		if ( $min_p !== '' && is_numeric( $min_p ) && (float) $min_p > 0 ) {
			$price = (float) $product->get_price();
			if ( $price < (float) $min_p ) {
				return false;
			}
		}

		$h_start = isset( $s['channel_rule_hour_start'] ) ? trim( (string) $s['channel_rule_hour_start'] ) : '';
		$h_end   = isset( $s['channel_rule_hour_end'] ) ? trim( (string) $s['channel_rule_hour_end'] ) : '';
		if ( $h_start !== '' && $h_end !== '' ) {
			$hs = (int) $h_start;
			$he = (int) $h_end;
			$h  = (int) current_time( 'G' );
			if ( $hs <= $he ) {
				if ( $h < $hs || $h > $he ) {
					return false;
				}
			} elseif ( $h < $hs && $h > $he ) {
				return false;
			}
		}

		return true;
	}
}
