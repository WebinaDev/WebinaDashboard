<?php
/**
 * Card-to-card receipt upload, admin photo, approve/reject.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Receipts + bot moderation.
 */
final class Webino_C2C_Receipts {

	const META_RECEIPT_ID = '_webino_c2c_receipt_id';
	const META_STATUS     = '_webino_c2c_status';
	const META_MESSAGES   = '_webino_c2c_admin_messages_json';
	const META_DECIDED_BY = '_webino_c2c_decided_by';
	const STATUS_PENDING  = 'pending';
	const STATUS_APPROVED = 'approved';
	const STATUS_REJECTED = 'rejected';

	/**
	 * @return void
	 */
	public static function init() {
		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;
		add_action( 'template_redirect', array( __CLASS__, 'maybe_handle_upload' ), 20 );
		add_action( 'woocommerce_order_details_after_order_table', array( __CLASS__, 'render_upload_form' ), 20 );
	}

	/**
	 * @param mixed $order Order.
	 * @return bool
	 */
	public static function is_c2c_order( $order ) {
		return $order && is_object( $order ) && method_exists( $order, 'get_payment_method' )
			&& Webino_C2C_Config::GATEWAY_ID === $order->get_payment_method();
	}

	/**
	 * @param WC_Order $order Order.
	 * @return string
	 */
	public static function status( $order ) {
		$st = (string) $order->get_meta( self::META_STATUS );
		return $st !== '' ? $st : '';
	}

	/**
	 * @return void
	 */
	public static function maybe_handle_upload() {
		if ( empty( $_POST['webino_c2c_upload'] ) || empty( $_POST['webino_c2c_order'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			return;
		}
		$order_id = absint( wp_unslash( $_POST['webino_c2c_order'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( $order_id < 1 || ! function_exists( 'wc_get_order' ) ) {
			return;
		}
		$nonce = isset( $_POST['webino_c2c_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['webino_c2c_nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'webino_c2c_receipt_' . $order_id ) ) {
			return;
		}
		$order = wc_get_order( $order_id );
		if ( ! $order || ! self::is_c2c_order( $order ) ) {
			return;
		}
		if ( ! self::current_user_can_upload( $order ) ) {
			return;
		}
		$result = self::process_upload( $order );
		if ( is_wp_error( $result ) ) {
			wc_add_notice( $result->get_error_message(), 'error' );
		} else {
			wc_add_notice( __( 'رسید دریافت شد. پس از تأیید ادمین، سفارش تکمیل می‌شود.', 'webino-dashboard' ), 'success' );
		}
		if ( function_exists( 'is_order_received_page' ) && is_order_received_page() ) {
			$redirect = $order->get_checkout_order_received_url();
		} else {
			$redirect = $order->get_view_order_url();
		}
		wp_safe_redirect( $redirect );
		exit;
	}

	/**
	 * @param WC_Order $order Order.
	 * @return bool
	 */
	private static function current_user_can_upload( $order ) {
		if ( current_user_can( 'manage_woocommerce' ) ) {
			return true;
		}
		$uid = (int) $order->get_user_id();
		if ( $uid > 0 ) {
			return get_current_user_id() === $uid;
		}
		return true;
	}

	/**
	 * @param WC_Order $order Order.
	 * @return true|WP_Error
	 */
	public static function process_upload( $order ) {
		$decided = self::status( $order );
		if ( in_array( $decided, array( self::STATUS_APPROVED, self::STATUS_REJECTED ), true ) ) {
			return new WP_Error( 'c2c_decided', __( 'این سفارش قبلاً بررسی شده است.', 'webino-dashboard' ) );
		}
		if ( empty( $_FILES['webino_c2c_receipt'] ) || empty( $_FILES['webino_c2c_receipt']['tmp_name'] ) ) {
			return new WP_Error( 'c2c_file', __( 'فایل رسید را انتخاب کنید.', 'webino-dashboard' ) );
		}
		$file = $_FILES['webino_c2c_receipt']; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		if ( ! empty( $file['error'] ) && UPLOAD_ERR_OK !== (int) $file['error'] ) {
			return new WP_Error( 'c2c_file', __( 'آپلود رسید ناموفق بود.', 'webino-dashboard' ) );
		}
		$check = wp_check_filetype_and_ext(
			(string) $file['tmp_name'],
			isset( $file['name'] ) ? (string) $file['name'] : ''
		);
		$ext   = isset( $check['ext'] ) ? strtolower( (string) $check['ext'] ) : '';
		$mime  = isset( $check['type'] ) ? strtolower( (string) $check['type'] ) : '';
		$ok    = in_array( $ext, array( 'jpg', 'jpeg', 'jpe', 'png', 'webp' ), true )
			|| in_array( $mime, array( 'image/jpeg', 'image/png', 'image/webp' ), true );
		if ( ! $ok ) {
			return new WP_Error( 'c2c_type', __( 'فقط تصویر jpeg، png یا webp پذیرفته می‌شود.', 'webino-dashboard' ) );
		}
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		$att_id = media_handle_upload( 'webino_c2c_receipt', 0 );
		if ( is_wp_error( $att_id ) ) {
			return $att_id;
		}
		$att_id = (int) $att_id;
		$order->update_meta_data( self::META_RECEIPT_ID, $att_id );
		$order->update_meta_data( self::META_STATUS, self::STATUS_PENDING );
		$order->add_order_note( sprintf( __( 'رسید کارت‌به‌کارت آپلود شد (پیوست #%d).', 'webino-dashboard' ), $att_id ) );
		$order->save();
		self::notify_admins( $order );
		return true;
	}

	/**
	 * @param WC_Order $order Order.
	 * @return void
	 */
	public static function render_upload_form( $order ) {
		if ( ! self::is_c2c_order( $order ) ) {
			return;
		}
		$status   = self::status( $order );
		$att_id   = (int) $order->get_meta( self::META_RECEIPT_ID );
		$decided  = in_array( $status, array( self::STATUS_APPROVED, self::STATUS_REJECTED ), true );
		$s        = Webino_C2C_Config::get();
		echo '<div class="webino-c2c-receipt" style="margin:1.5em 0;padding:1.1em 1.2em;border:1px solid #e5e5e5;border-radius:10px;background:#fafafa">';
		echo '<h3 style="margin-top:0">' . esc_html__( 'پرداخت کارت‌به‌کارت', 'webino-dashboard' ) . '</h3>';
		if ( ! empty( $s['instructions'] ) ) {
			echo '<p>' . esc_html( (string) $s['instructions'] ) . '</p>';
		}
		self::echo_destination_details( $s );
		if ( $decided ) {
			$by = (string) $order->get_meta( self::META_DECIDED_BY );
			if ( self::STATUS_APPROVED === $status ) {
				echo '<p><strong>' . esc_html__( 'رسید تأیید شد.', 'webino-dashboard' ) . '</strong>';
			} else {
				echo '<p><strong>' . esc_html__( 'رسید رد شد.', 'webino-dashboard' ) . '</strong>';
			}
			if ( $by !== '' ) {
				echo ' ' . esc_html( $by );
			}
			echo '</p>';
			self::echo_receipt_thumb( $att_id );
			echo '</div>';
			return;
		}
		if ( $att_id > 0 ) {
			echo '<p>' . esc_html__( 'رسید دریافت شد و در انتظار تأیید ادمین است. در صورت نیاز می‌توانید تصویر جدید بفرستید.', 'webino-dashboard' ) . '</p>';
			self::echo_receipt_thumb( $att_id );
		} else {
			echo '<p>' . esc_html__( 'پس از واریز، عکس رسید را از همین صفحه بفرستید. تا قبل از ارسال رسید به ادمین پیام داده نمی‌شود.', 'webino-dashboard' ) . '</p>';
		}
		echo '<form method="post" enctype="multipart/form-data" style="margin-top:0.8em">';
		wp_nonce_field( 'webino_c2c_receipt_' . $order->get_id(), 'webino_c2c_nonce' );
		echo '<input type="hidden" name="webino_c2c_order" value="' . esc_attr( (string) $order->get_id() ) . '" />';
		echo '<p><input type="file" name="webino_c2c_receipt" accept="image/jpeg,image/png,image/webp" required /></p>';
		echo '<p><button type="submit" class="button" name="webino_c2c_upload" value="1">' . esc_html__( 'آپلود رسید', 'webino-dashboard' ) . '</button></p>';
		echo '</form>';
		echo '</div>';
	}

	/**
	 * @param array<string,mixed> $s Settings.
	 * @return void
	 */
	public static function echo_destination_details( $s ) {
		if ( ! empty( $s['iban'] ) ) {
			echo '<p><strong>' . esc_html__( 'شبا:', 'webino-dashboard' ) . '</strong> <span style="font-family:ui-monospace,monospace">' . esc_html( (string) $s['iban'] ) . '</span></p>';
		}
		$cards = isset( $s['cards'] ) && is_array( $s['cards'] ) ? $s['cards'] : array();
		if ( $cards ) {
			echo '<ul style="list-style:none;padding:0;margin:0 0 0.8em">';
			foreach ( $cards as $card ) {
				$line = self::format_card_line( $card );
				if ( $line !== '' ) {
					echo '<li style="font-family:ui-monospace,monospace;margin:0.25em 0">' . esc_html( $line ) . '</li>';
				}
			}
			echo '</ul>';
		}
		$h = isset( $s['deadline_h'] ) ? (int) $s['deadline_h'] : 0;
		if ( $h > 0 ) {
			echo '<p>' . esc_html( sprintf( __( 'مهلت پرداخت: %d ساعت', 'webino-dashboard' ), $h ) ) . '</p>';
		}
	}

	/**
	 * @param mixed $card Card.
	 * @return string
	 */
	public static function format_card_line( $card ) {
		if ( is_string( $card ) ) {
			return trim( $card );
		}
		if ( ! is_array( $card ) ) {
			return '';
		}
		$num  = trim( (string) ( $card['number'] ?? '' ) );
		$name = trim( (string) ( $card['name'] ?? '' ) );
		$bank = trim( (string) ( $card['bank'] ?? '' ) );
		$bits = array_filter( array( $num, $name, $bank ) );
		return implode( ' — ', $bits );
	}

	/**
	 * @param int $att_id Attachment.
	 * @return void
	 */
	private static function echo_receipt_thumb( $att_id ) {
		if ( $att_id < 1 ) {
			return;
		}
		$url = wp_get_attachment_image_url( $att_id, 'medium' );
		if ( ! $url ) {
			$url = wp_get_attachment_url( $att_id );
		}
		if ( $url ) {
			echo '<p><img src="' . esc_url( $url ) . '" alt="" style="max-width:280px;height:auto;border-radius:8px" /></p>';
		}
	}

	/**
	 * Send receipt photo to Bale and Telegram admins. No-op until a receipt exists.
	 *
	 * @param WC_Order $order Order.
	 * @return void
	 */
	public static function notify_admins( $order ) {
		$att_id = (int) $order->get_meta( self::META_RECEIPT_ID );
		$url    = $att_id > 0 ? wp_get_attachment_url( $att_id ) : '';
		if ( ! $url ) {
			return;
		}
		$caption = self::caption( $order );
		$kbd     = array(
			'inline_keyboard' => array(
				array(
					array(
						'text'          => __( 'تأیید پرداخت', 'webino-dashboard' ),
						'callback_data' => 'c2c:' . $order->get_id() . ':approve',
					),
					array(
						'text'          => __( 'رد', 'webino-dashboard' ),
						'callback_data' => 'c2c:' . $order->get_id() . ':reject',
					),
				),
			),
		);
		$copies = array();
		$map    = array(
			'bale'     => class_exists( 'Webino_Dashboard_Bots_Admin_Ops', false ) ? Webino_Dashboard_Bots_Admin_Ops::admin_chats( 'bale' ) : array(),
			'telegram' => class_exists( 'Webino_Dashboard_Bots_Admin_Ops', false ) ? Webino_Dashboard_Bots_Admin_Ops::admin_chats( 'telegram' ) : array(),
		);
		foreach ( $map as $provider => $chats ) {
			$client = class_exists( 'Webino_Dashboard_Bots_Client_Facade', false )
				? Webino_Dashboard_Bots_Client_Facade::make( $provider )
				: null;
			if ( ! $client ) {
				continue;
			}
			foreach ( (array) $chats as $chat ) {
				$chat = (string) $chat;
				if ( $chat === '' ) {
					continue;
				}
				$res = $client->send_photo(
					array(
						'chat_id'      => $chat,
						'photo'        => $url,
						'caption'      => $caption,
						'reply_markup' => $kbd,
					)
				);
				$mid = 0;
				if ( is_array( $res ) && ! empty( $res['result']['message_id'] ) ) {
					$mid = (int) $res['result']['message_id'];
				}
				if ( $mid > 0 ) {
					$copies[] = array(
						'provider'   => $provider,
						'chat_id'    => $chat,
						'message_id' => $mid,
					);
				}
			}
		}
		$prev = $order->get_meta( self::META_MESSAGES );
		$all  = is_string( $prev ) ? json_decode( $prev, true ) : ( is_array( $prev ) ? $prev : array() );
		if ( ! is_array( $all ) ) {
			$all = array();
		}
		$all = array_merge( $all, $copies );
		$order->update_meta_data( self::META_MESSAGES, wp_json_encode( $all ) );
		$order->save();
	}

	/**
	 * @param WC_Order $order Order.
	 * @return string
	 */
	private static function caption( $order ) {
		$s     = Webino_C2C_Config::get();
		$cards = array();
		foreach ( (array) $s['cards'] as $card ) {
			$line = self::format_card_line( $card );
			if ( $line !== '' ) {
				$cards[] = $line;
			}
		}
		$amount = html_entity_decode( wp_strip_all_tags( $order->get_formatted_order_total() ), ENT_QUOTES, 'UTF-8' );
		$lines  = array(
			__( 'رسید کارت‌به‌کارت', 'webino-dashboard' ),
			sprintf( __( 'سفارش: #%s', 'webino-dashboard' ), $order->get_order_number() ),
			sprintf( __( 'مبلغ: %s', 'webino-dashboard' ), $amount ),
		);
		if ( $cards ) {
			$lines[] = sprintf( __( 'کارت مقصد: %s', 'webino-dashboard' ), implode( ' | ', $cards ) );
		}
		$name = trim( (string) $order->get_formatted_billing_full_name() );
		if ( $name !== '' ) {
			$lines[] = sprintf( __( 'مشتری: %s', 'webino-dashboard' ), $name );
		}
		return implode( "\n", $lines );
	}

	/**
	 * @param string               $data     Callback data.
	 * @param string               $chat     Clicker chat.
	 * @param string               $provider bale|telegram.
	 * @param array<string,mixed>  $from     callback_query.from.
	 * @return bool Consumed.
	 */
	public static function handle_callback( $data, $chat, $provider, $from = array() ) {
		unset( $chat );
		if ( 'noop' === $data ) {
			return true;
		}
		if ( strpos( (string) $data, 'c2c:' ) !== 0 ) {
			return false;
		}
		$parts = explode( ':', (string) $data );
		$oid   = isset( $parts[1] ) ? (int) $parts[1] : 0;
		$act   = isset( $parts[2] ) ? sanitize_key( $parts[2] ) : '';
		if ( $oid < 1 || ! in_array( $act, array( 'approve', 'reject' ), true ) ) {
			return true;
		}
		$order = function_exists( 'wc_get_order' ) ? wc_get_order( $oid ) : false;
		if ( ! $order ) {
			return true;
		}
		$label = self::label_from_from( is_array( $from ) ? $from : array() );
		self::decide( $order, $act, $label );
		return true;
	}

	/**
	 * @param array<string,mixed> $from From.
	 * @return string
	 */
	public static function label_from_from( $from ) {
		$username = isset( $from['username'] ) ? trim( (string) $from['username'] ) : '';
		if ( $username !== '' ) {
			return '@' . ltrim( $username, '@' );
		}
		$first = isset( $from['first_name'] ) ? trim( (string) $from['first_name'] ) : '';
		$last  = isset( $from['last_name'] ) ? trim( (string) $from['last_name'] ) : '';
		$name  = trim( $first . ' ' . $last );
		if ( $name !== '' ) {
			return $name;
		}
		$id = isset( $from['id'] ) ? (string) $from['id'] : '';
		return $id !== '' ? $id : __( 'ادمین', 'webino-dashboard' );
	}

	/**
	 * @return string
	 */
	public static function label_from_wp_user() {
		$user = wp_get_current_user();
		if ( $user && $user->ID ) {
			$login = trim( (string) $user->user_login );
			if ( $login !== '' ) {
				return $login;
			}
			$dn = trim( (string) $user->display_name );
			if ( $dn !== '' ) {
				return $dn;
			}
		}
		return __( 'داشبورد', 'webino-dashboard' );
	}

	/**
	 * @param WC_Order $order  Order.
	 * @param string   $action approve|reject.
	 * @param string   $label  Approver label.
	 * @return true|WP_Error
	 */
	public static function decide( $order, $action, $label ) {
		$action = sanitize_key( $action );
		if ( ! in_array( $action, array( 'approve', 'reject' ), true ) ) {
			return new WP_Error( 'c2c_action', __( 'عملیات نامعتبر است.', 'webino-dashboard' ) );
		}
		$label  = trim( (string) $label );
		$status = self::status( $order );
		if ( in_array( $status, array( self::STATUS_APPROVED, self::STATUS_REJECTED ), true ) ) {
			self::update_admin_markups( $order, $status, $label !== '' ? $label : (string) $order->get_meta( self::META_DECIDED_BY ) );
			return true;
		}
		if ( $label === '' ) {
			$label = __( 'ادمین', 'webino-dashboard' );
		}
		$order->update_meta_data( self::META_DECIDED_BY, $label );
		if ( 'approve' === $action ) {
			$order->update_meta_data( self::META_STATUS, self::STATUS_APPROVED );
			$order->add_order_note( sprintf( __( 'پرداخت کارت‌به‌کارت تأیید شد · %s', 'webino-dashboard' ), $label ) );
			$order->save();
			$order->payment_complete();
			self::update_admin_markups( $order, self::STATUS_APPROVED, $label );
			return true;
		}
		$order->update_meta_data( self::META_STATUS, self::STATUS_REJECTED );
		$order->add_order_note( sprintf( __( 'رسید کارت‌به‌کارت رد شد · %s', 'webino-dashboard' ), $label ) );
		$order->save();
		$order->update_status( 'failed', sprintf( __( 'رسید کارت‌به‌کارت رد شد · %s', 'webino-dashboard' ), $label ) );
		self::update_admin_markups( $order, self::STATUS_REJECTED, $label );
		return true;
	}

	/**
	 * @param WC_Order $order  Order.
	 * @param string   $status approved|rejected.
	 * @param string   $label  Approver.
	 * @return void
	 */
	public static function update_admin_markups( $order, $status, $label ) {
		$raw = $order->get_meta( self::META_MESSAGES );
		$all = is_string( $raw ) ? json_decode( $raw, true ) : ( is_array( $raw ) ? $raw : array() );
		if ( ! is_array( $all ) ) {
			return;
		}
		$text = self::STATUS_APPROVED === $status
			? sprintf( __( '✅ رسید تایید شد · %s', 'webino-dashboard' ), $label )
			: sprintf( __( '❌ رد شد · %s', 'webino-dashboard' ), $label );
		$kbd  = array(
			'inline_keyboard' => array(
				array(
					array(
						'text'          => $text,
						'callback_data' => 'noop',
					),
				),
			),
		);
		foreach ( $all as $copy ) {
			if ( ! is_array( $copy ) ) {
				continue;
			}
			$provider = isset( $copy['provider'] ) ? sanitize_key( (string) $copy['provider'] ) : '';
			$chat_id  = isset( $copy['chat_id'] ) ? (string) $copy['chat_id'] : '';
			$mid      = isset( $copy['message_id'] ) ? (int) $copy['message_id'] : 0;
			if ( $chat_id === '' || $mid < 1 ) {
				continue;
			}
			$client = class_exists( 'Webino_Dashboard_Bots_Client_Facade', false )
				? Webino_Dashboard_Bots_Client_Facade::make( $provider )
				: null;
			if ( ! $client || ! method_exists( $client, 'edit_message_reply_markup' ) ) {
				continue;
			}
			$client->edit_message_reply_markup(
				array(
					'chat_id'      => $chat_id,
					'message_id'   => $mid,
					'reply_markup' => $kbd,
				)
			);
		}
	}

	/**
	 * @param string $status Filter.
	 * @param int    $limit  Limit.
	 * @return list<array<string,mixed>>
	 */
	public static function list_receipts( $status = self::STATUS_PENDING, $limit = 80 ) {
		if ( ! function_exists( 'wc_get_orders' ) ) {
			return array();
		}
		$status = sanitize_key( $status );
		if ( ! in_array( $status, array( self::STATUS_PENDING, self::STATUS_APPROVED, self::STATUS_REJECTED, 'all' ), true ) ) {
			$status = self::STATUS_PENDING;
		}
		$args = array(
			'limit'          => max( 1, min( 200, (int) $limit ) ),
			'orderby'        => 'date',
			'order'          => 'DESC',
			'payment_method' => Webino_C2C_Config::GATEWAY_ID,
			'return'         => 'objects',
		);
		if ( self::STATUS_PENDING === $status ) {
			$args['status'] = array( 'on-hold', 'pending' );
		} elseif ( self::STATUS_APPROVED === $status ) {
			$args['status'] = array( 'processing', 'completed' );
		} elseif ( self::STATUS_REJECTED === $status ) {
			$args['status'] = array( 'failed', 'cancelled' );
		}
		$orders = wc_get_orders( $args );
		$out    = array();
		foreach ( (array) $orders as $order ) {
			if ( ! $order || ! self::is_c2c_order( $order ) ) {
				continue;
			}
			$row = self::serialize( $order );
			if ( 'all' !== $status && (string) $row['status'] !== $status ) {
				continue;
			}
			if ( self::STATUS_PENDING === $status && (int) $row['receipt_id'] < 1 ) {
				continue;
			}
			$out[] = $row;
		}
		return $out;
	}

	/**
	 * @param WC_Order $order Order.
	 * @return array<string,mixed>
	 */
	public static function serialize( $order ) {
		$att_id = (int) $order->get_meta( self::META_RECEIPT_ID );
		$url    = $att_id > 0 ? wp_get_attachment_url( $att_id ) : '';
		$thumb  = $att_id > 0 ? wp_get_attachment_image_url( $att_id, 'medium' ) : '';
		return array(
			'id'           => (int) $order->get_id(),
			'number'       => (string) $order->get_order_number(),
			'status'       => self::status( $order ),
			'order_status' => $order->get_status(),
			'total'        => (float) $order->get_total(),
			'total_html'   => $order->get_formatted_order_total(),
			'customer'     => (string) $order->get_formatted_billing_full_name(),
			'receipt_id'   => $att_id,
			'receipt_url'  => $url ? $url : '',
			'thumb_url'    => $thumb ? $thumb : $url,
			'decided_by'   => (string) $order->get_meta( self::META_DECIDED_BY ),
			'date'         => $order->get_date_created() ? $order->get_date_created()->date_i18n( 'Y-m-d H:i' ) : '',
			'edit_url'     => $order->get_edit_order_url(),
		);
	}
}
