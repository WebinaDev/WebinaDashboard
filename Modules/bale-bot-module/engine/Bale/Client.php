<?php

namespace Webino_Dashboard_Bots_Bale\Bale;

use Webino_Dashboard_Bots_Bale\Core\Plugin;
use Webino_Dashboard_Bots_Bale\Logging\ActivityLog;

/**
 * Bale Bot API client (Telegram-compatible). Base: https://tapi.bale.ai/bot{token}/
 */
class Client {

	private string $token;

	public function __construct( ?string $token = null ) {
		$this->token = $token ?? Plugin::get_bot_token();
	}

	private function api_url( string $method ): string {
		return 'https://tapi.bale.ai/bot' . rawurlencode( $this->token ) . '/' . $method;
	}

	/**
	 * @param array<string, mixed> $context
	 */
	private function log_error( string $event, array $context = array() ): void {
		$message = '[' . $event . '] ' . wp_json_encode( $context );
		if ( function_exists( 'wc_get_logger' ) ) {
			wc_get_logger()->error( $message, array( 'source' => 'webino_dashboard_bale' ) );
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
	 * @param array<string, mixed> $body
	 * @return array<string, mixed>|null Decoded JSON or null on failure.
	 */
	private function request( string $method, array $body = array() ): ?array {
		$url  = $this->api_url( $method );
		$args = array(
			'timeout' => 30,
			'headers' => array(
				'Content-Type' => 'application/json',
			),
			'body'    => wp_json_encode( $body ),
		);
		$response = wp_remote_post( $url, $args );
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
		$code = wp_remote_retrieve_response_code( $response );
		$raw  = wp_remote_retrieve_body( $response );
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
	 * Bale docs only document `url`; if secret_token is rejected, retry with url only.
	 */
	public function set_webhook( string $url, ?string $secret_token = null ): ?array {
		$body = array( 'url' => $url );
		if ( $secret_token !== null && $secret_token !== '' ) {
			$body['secret_token'] = $secret_token;
		}
		$res = $this->request( 'setWebhook', $body );
		if (
			isset( $body['secret_token'] )
			&& is_array( $res )
			&& empty( $res['ok'] )
		) {
			$description = isset( $res['description'] ) ? strtolower( (string) $res['description'] ) : '';
			$retry_url_only = $description === ''
				|| false !== strpos( $description, 'secret' )
				|| false !== strpos( $description, 'unknown' )
				|| false !== strpos( $description, 'unexpected' )
				|| false !== strpos( $description, 'invalid' );
			if ( $retry_url_only ) {
				$res = $this->request( 'setWebhook', array( 'url' => $url ) );
			}
		}
		return $res;
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
		return 'https://tapi.bale.ai/file/bot' . rawurlencode( $this->token ) . '/' . $file_path;
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
