<?php

namespace Webino_Dashboard_Bots_Telegram\Bale;

use Webino_Dashboard_Bots_Telegram\Core\Plugin;
use Webino_Dashboard_Bots_Telegram\Logging\ActivityLog;

/**
 * Telegram Bot API client. Base: https://api.telegram.org/bot{token}/
 */
class Client {

	private string $token;

	public function __construct( ?string $token = null ) {
		$this->token = $token ?? Plugin::get_bot_token();
	}

	private function api_url( string $method ): string {
		return 'https://api.telegram.org/bot' . rawurlencode( $this->token ) . '/' . $method;
	}

	/**
	 * @param array<string, mixed> $context
	 */
	private function log_error( string $event, array $context = array() ): void {
		$message = '[' . $event . '] ' . wp_json_encode( $context );
		if ( function_exists( 'wc_get_logger' ) ) {
			wc_get_logger()->error( $message, array( 'source' => 'webino_dashboard_telegram' ) );
		} else {
			error_log( 'woobale ' . $message );
		}
		ActivityLog::add(
			'error',
			'api',
			$event,
			$context
		);
	}

	/**
	 * @return array{type:string,host:string,port:int,user:string,pass:string}|null|\WP_Error
	 */
	private function resolve_proxy() {
		$s    = Plugin::get_settings();
		$type = isset( $s['proxy_type'] ) ? sanitize_key( (string) $s['proxy_type'] ) : 'none';
		if ( $type === '' || $type === 'none' ) {
			return null;
		}
		if ( ! in_array( $type, array( 'http', 'socks4', 'socks5' ), true ) ) {
			return null;
		}
		$host = isset( $s['proxy_host'] ) ? trim( (string) $s['proxy_host'] ) : '';
		$host = preg_replace( '#^https?://#i', '', $host );
		$host = is_string( $host ) ? trim( $host ) : '';
		$host = explode( '/', $host, 2 )[0];
		$port = isset( $s['proxy_port'] ) ? (int) $s['proxy_port'] : 0;
		if ( $host === '' || $port < 1 || $port > 65535 ) {
			return new \WP_Error(
				'proxy_incomplete',
				__( 'پراکسی تلگرام ناقص است. میزبان و پورت را وارد کنید.', 'webino-dashboard' )
			);
		}
		return array(
			'type' => $type,
			'host' => $host,
			'port' => $port,
			'user' => isset( $s['proxy_username'] ) ? (string) $s['proxy_username'] : '',
			'pass' => isset( $s['proxy_password'] ) ? (string) $s['proxy_password'] : '',
		);
	}

	/**
	 * @param resource $ch
	 * @param array{type:string,host:string,port:int,user:string,pass:string} $proxy
	 */
	private function curl_apply_proxy( $ch, array $proxy ): void {
		curl_setopt( $ch, CURLOPT_PROXY, $proxy['host'] . ':' . (string) $proxy['port'] );
		if ( $proxy['type'] === 'socks5' ) {
			$socks = defined( 'CURLPROXY_SOCKS5_HOSTNAME' ) ? CURLPROXY_SOCKS5_HOSTNAME : CURLPROXY_SOCKS5;
			curl_setopt( $ch, CURLOPT_PROXYTYPE, $socks );
		} elseif ( $proxy['type'] === 'socks4' ) {
			curl_setopt( $ch, CURLOPT_PROXYTYPE, CURLPROXY_SOCKS4 );
		} else {
			curl_setopt( $ch, CURLOPT_PROXYTYPE, CURLPROXY_HTTP );
			curl_setopt( $ch, CURLOPT_HTTPPROXYTUNNEL, true );
		}
		if ( $proxy['user'] !== '' ) {
			curl_setopt( $ch, CURLOPT_PROXYUSERPWD, $proxy['user'] . ':' . $proxy['pass'] );
		}
	}

	/**
	 * @param array{type:string,host:string,port:int,user:string,pass:string}|null $proxy
	 * @param array<int, mixed>                                                     $extra
	 * @return array{code:int, body:string}|null
	 */
	private function curl_exec_url( string $url, $proxy, array $extra, string $context ): ?array {
		if ( ! function_exists( 'curl_init' ) ) {
			$this->log_error(
				'api_curl_missing',
				array(
					'method' => $context,
				)
			);
			return null;
		}
		$ch = curl_init( $url );
		if ( $ch === false ) {
			$this->log_error( 'api_curl_init_failed', array( 'method' => $context ) );
			return null;
		}
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
		curl_setopt( $ch, CURLOPT_TIMEOUT, 30 );
		curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, 15 );
		curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, true );
		curl_setopt( $ch, CURLOPT_SSL_VERIFYHOST, 2 );
		foreach ( $extra as $opt => $val ) {
			curl_setopt( $ch, $opt, $val );
		}
		if ( is_array( $proxy ) ) {
			$this->curl_apply_proxy( $ch, $proxy );
		}
		$raw  = curl_exec( $ch );
		$err  = curl_error( $ch );
		$code = (int) curl_getinfo( $ch, CURLINFO_HTTP_CODE );
		curl_close( $ch );
		if ( $raw === false ) {
			$this->log_error(
				'api_transport_error',
				array(
					'method'    => $context,
					'wp_error'  => $err !== '' ? $err : 'curl_exec failed',
					'has_token' => $this->token !== '',
					'proxy'     => is_array( $proxy ) ? $proxy['type'] : 'none',
				)
			);
			return null;
		}
		return array(
			'code' => $code,
			'body' => (string) $raw,
		);
	}

	/**
	 * @return array{code:int, body:string}|null
	 */
	private function http_post_json( string $url, string $json, string $method ): ?array {
		$proxy = $this->resolve_proxy();
		if ( is_wp_error( $proxy ) ) {
			$this->log_error(
				'api_proxy_invalid',
				array(
					'method'   => $method,
					'wp_error' => $proxy->get_error_message(),
				)
			);
			return null;
		}

		if ( is_array( $proxy ) ) {
			return $this->curl_exec_url(
				$url,
				$proxy,
				array(
					CURLOPT_POST       => true,
					CURLOPT_POSTFIELDS => $json,
					CURLOPT_HTTPHEADER => array( 'Content-Type: application/json' ),
				),
				$method
			);
		}

		if ( function_exists( 'curl_init' ) ) {
			return $this->curl_exec_url(
				$url,
				null,
				array(
					CURLOPT_POST       => true,
					CURLOPT_POSTFIELDS => $json,
					CURLOPT_HTTPHEADER => array( 'Content-Type: application/json' ),
				),
				$method
			);
		}

		$response = wp_remote_post(
			$url,
			array(
				'timeout' => 30,
				'headers' => array(
					'Content-Type' => 'application/json',
				),
				'body'    => $json,
			)
		);
		if ( is_wp_error( $response ) ) {
			$this->log_error(
				'api_transport_error',
				array(
					'method'    => $method,
					'wp_error'  => $response->get_error_message(),
					'has_token' => $this->token !== '',
				)
			);
			return null;
		}
		return array(
			'code' => (int) wp_remote_retrieve_response_code( $response ),
			'body' => (string) wp_remote_retrieve_body( $response ),
		);
	}

	/**
	 * Download a remote file through the same outbound proxy as Bot API calls.
	 *
	 * @return string|\WP_Error Temp file path.
	 */
	public function download_to_temp( string $url ) {
		if ( ! function_exists( 'wp_tempnam' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}
		$tmp = wp_tempnam( $url );
		if ( ! is_string( $tmp ) || $tmp === '' ) {
			return new \WP_Error( 'http_no_file', __( 'امکان ساخت فایل موقت نبود.', 'webino-dashboard' ) );
		}

		$proxy = $this->resolve_proxy();
		if ( is_wp_error( $proxy ) ) {
			@unlink( $tmp );
			return $proxy;
		}

		if ( ! function_exists( 'curl_init' ) ) {
			@unlink( $tmp );
			if ( is_array( $proxy ) ) {
				return new \WP_Error( 'proxy_curl_missing', __( 'برای پراکسی HTTP/SOCKS افزونه cURL روی سرور لازم است.', 'webino-dashboard' ) );
			}
			return download_url( $url );
		}

		$fp = fopen( $tmp, 'wb' );
		if ( $fp === false ) {
			@unlink( $tmp );
			return new \WP_Error( 'http_no_file', __( 'امکان نوشتن فایل موقت نبود.', 'webino-dashboard' ) );
		}

		$ch = curl_init( $url );
		if ( $ch === false ) {
			fclose( $fp );
			@unlink( $tmp );
			return new \WP_Error( 'api_curl_init_failed', __( 'راه‌اندازی cURL ناموفق بود.', 'webino-dashboard' ) );
		}
		curl_setopt( $ch, CURLOPT_FILE, $fp );
		curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
		curl_setopt( $ch, CURLOPT_TIMEOUT, 60 );
		curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, 15 );
		curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, true );
		curl_setopt( $ch, CURLOPT_SSL_VERIFYHOST, 2 );
		if ( is_array( $proxy ) ) {
			$this->curl_apply_proxy( $ch, $proxy );
		}
		$ok   = curl_exec( $ch );
		$err  = curl_error( $ch );
		$code = (int) curl_getinfo( $ch, CURLINFO_HTTP_CODE );
		curl_close( $ch );
		fclose( $fp );

		if ( $ok === false || $code >= 400 ) {
			@unlink( $tmp );
			$msg = $err !== '' ? $err : sprintf( 'HTTP %d', $code );
			return new \WP_Error( 'download_failed', $msg );
		}
		return $tmp;
	}

	/**
	 * @param array<string, mixed> $body
	 * @return array<string, mixed>|null Decoded JSON or null on failure.
	 */
	private function request( string $method, array $body = array() ): ?array {
		$url  = $this->api_url( $method );
		$json = wp_json_encode( $body );
		if ( ! is_string( $json ) ) {
			$json = '{}';
		}
		$fetched = $this->http_post_json( $url, $json, $method );
		if ( $fetched === null ) {
			return null;
		}
		$code = $fetched['code'];
		$raw  = $fetched['body'];
		$data = json_decode( $raw, true );
		if ( ! is_array( $data ) ) {
			$this->log_error(
				'api_invalid_json',
				array(
					'method'       => $method,
					'http_code'    => $code,
					'raw_excerpt'  => substr( (string) $raw, 0, 500 ),
					'has_token'    => $this->token !== '',
				)
			);
			return null;
		}
		if ( $code >= 400 || ( isset( $data['ok'] ) && ! $data['ok'] ) ) {
			$description = isset( $data['description'] ) ? (string) $data['description'] : '';
			$stale_cb    = $method === 'answerCallbackQuery' && $code === 400
				&& ( stripos( $description, 'too old' ) !== false || stripos( $description, 'query id is invalid' ) !== false );
			if ( ! $stale_cb ) {
				$this->log_error(
					'api_error_response',
					array(
						'method'      => $method,
						'http_code'   => $code,
						'error_code'  => isset( $data['error_code'] ) ? (int) $data['error_code'] : null,
						'description' => $description,
					)
				);
			}
			return $data;
		}
		return $data;
	}

	/**
	 * @param array<string, mixed>|null $response
	 */
	public static function summarize_error( ?array $response ): string {
		if ( ! is_array( $response ) ) {
			return __( 'ارتباط با API بله برقرار نشد. اتصال اینترنت/SSL و Bot Token را بررسی کنید.', 'webino-dashboard' );
		}
		$description = isset( $response['description'] ) ? (string) $response['description'] : '';
		$error_code  = isset( $response['error_code'] ) ? (string) $response['error_code'] : '';
		if ( $description !== '' ) {
			return $error_code !== '' ? sprintf( '(%s) %s', $error_code, $description ) : $description;
		}
		return __( 'پاسخ نامعتبر از API بله دریافت شد.', 'webino-dashboard' );
	}

	/**
	 * @param string|null $secret_token If non-empty, sent as secret_token so Bale echoes it in X-Telegram-Bot-Api-Secret-Token.
	 */
	public function set_webhook( string $url, ?string $secret_token = null ): ?array {
		$body = array( 'url' => $url );
		if ( $secret_token !== null && $secret_token !== '' ) {
			$body['secret_token'] = $secret_token;
		}
		$body['allowed_updates'] = wp_json_encode(
			array(
				'message',
				'callback_query',
				'pre_checkout_query',
				'successful_payment',
				'inline_query',
			)
		);
		return $this->request( 'setWebhook', $body );
	}

	public function delete_webhook(): ?array {
		return $this->request( 'deleteWebhook', array() );
	}

	/**
	 * @return array<string, mixed>|null
	 */
	public function get_webhook_info(): ?array {
		return $this->request( 'getWebhookInfo', array() );
	}

	/**
	 * @return array<string, mixed>|null
	 */
	public function get_me(): ?array {
		return $this->request( 'getMe', array() );
	}

	/**
	 * Telegram-compatible getFile (for downloading photos/documents by file_id).
	 *
	 * @param array<string, mixed> $params
	 * @return array<string, mixed>|null
	 */
	public function get_file( array $params ): ?array {
		return $this->request( 'getFile', $params );
	}

	/**
	 * Public HTTPS URL to download a file after getFile (Bale / Telegram-compatible).
	 */
	public function get_file_download_url( string $file_path ): string {
		$file_path = ltrim( str_replace( '\\', '/', $file_path ), '/' );
		return 'https://api.telegram.org/file/bot' . rawurlencode( $this->token ) . '/' . $file_path;
	}

	/**
	 * @param array<string, mixed> $params
	 */
	public function delete_message( array $params ): ?array {
		return $this->request( 'deleteMessage', $params );
	}

	/**
	 * @param array<string, mixed> $params
	 */
	public function send_message( array $params ): ?array {
		return $this->request( 'sendMessage', $params );
	}

	/**
	 * @param array<string, mixed> $params
	 */
	public function send_photo( array $params ): ?array {
		return $this->request( 'sendPhoto', $params );
	}

	/**
	 * @param array<string, mixed> $params
	 */
	public function send_video( array $params ): ?array {
		return $this->request( 'sendVideo', $params );
	}

	/**
	 * @param array<string, mixed> $params
	 */
	public function send_voice( array $params ): ?array {
		return $this->request( 'sendVoice', $params );
	}

	/**
	 * @param array<string, mixed> $params
	 */
	public function send_document( array $params ): ?array {
		return $this->request( 'sendDocument', $params );
	}

	/**
	 * @param array<string, mixed> $params
	 */
	public function edit_message_text( array $params ): ?array {
		return $this->request( 'editMessageText', $params );
	}

	/**
	 * @param array<string, mixed> $params
	 */
	public function edit_message_caption( array $params ): ?array {
		return $this->request( 'editMessageCaption', $params );
	}

	/**
	 * @param array<string, mixed> $params
	 */
	public function edit_message_reply_markup( array $params ): ?array {
		return $this->request( 'editMessageReplyMarkup', $params );
	}

	/**
	 * @param array<string, mixed> $params
	 */
	public function answer_callback_query( array $params ): ?array {
		return $this->request( 'answerCallbackQuery', $params );
	}

	/**
	 * @param array<string, mixed> $params
	 */
	public function answer_inline_query( array $params ): ?array {
		return $this->request( 'answerInlineQuery', $params );
	}

	/**
	 * @param array<string, mixed> $params
	 */
	public function send_invoice( array $params ): ?array {
		return $this->request( 'sendInvoice', $params );
	}

	/**
	 * @param array<string, mixed> $params
	 */
	public function answer_pre_checkout_query( array $params ): ?array {
		return $this->request( 'answerPreCheckoutQuery', $params );
	}

	/**
	 * Returns true when user is member/admin/creator of channel.
	 * Returns false when explicitly left/kicked.
	 * Returns null on unknown status or API failure.
	 */
	public function is_channel_member( string $channel_id, string $user_id ): ?bool {
		$channel_id = trim( $channel_id );
		$user_id    = trim( $user_id );
		if ( $channel_id === '' || $user_id === '' ) {
			return null;
		}

		$response = $this->request(
			'getChatMember',
			array(
				'chat_id' => $channel_id,
				'user_id' => $user_id,
			)
		);
		if ( ! is_array( $response ) || empty( $response['ok'] ) || empty( $response['result'] ) || ! is_array( $response['result'] ) ) {
			return null;
		}

		$status = isset( $response['result']['status'] ) ? strtolower( (string) $response['result']['status'] ) : '';
		if ( in_array( $status, array( 'creator', 'administrator', 'member' ), true ) ) {
			return true;
		}
		if ( in_array( $status, array( 'left', 'kicked', 'restricted' ), true ) ) {
			return false;
		}

		return null;
	}
}
