<?php
/**
 * AI provider router (Grok / Gemini / OpenAI / GapGPT).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Unified chat completion with JSON output and fallback.
 */
final class Webino_Dashboard_AI_Providers {

	/**
	 * @param string               $system System prompt.
	 * @param string               $user User prompt.
	 * @param array<string,mixed>  $schema Optional JSON schema hint (for prompt).
	 * @param string|null          $force_provider Optional provider slug.
	 * @return array{ok:bool,content?:string,data?:array,provider?:string,model?:string,tokens_in?:int,tokens_out?:int,error?:string}
	 */
	public static function complete( $system, $user, $schema = array(), $force_provider = null ) {
		$schema_hint = '';
		if ( ! empty( $schema ) ) {
			$schema_hint = "\n\nReturn ONLY valid JSON matching this shape (no markdown):\n" . wp_json_encode( $schema, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT );
		}
		return self::dispatch( (string) $system . $schema_hint, (string) $user, $force_provider, array(), true );
	}

	/**
	 * Plain-text completion (optional web search).
	 *
	 * @param string      $system System.
	 * @param string      $user User.
	 * @param array       $opts Options: search, force_provider.
	 * @return array{ok:bool,content?:string,provider?:string,model?:string,tokens_in?:int,tokens_out?:int,error?:string}
	 */
	public static function complete_text( $system, $user, $opts = array() ) {
		$force = isset( $opts['force_provider'] ) ? (string) $opts['force_provider'] : null;
		$extra = array();
		if ( ! empty( $opts['search'] ) ) {
			$extra['search'] = true;
		}
		return self::dispatch( (string) $system, (string) $user, $force, $extra, false );
	}

	/**
	 * Research notes for a product (best-effort; empty string on failure).
	 *
	 * @param array<string,mixed> $ctx Product context.
	 * @return array{notes:string,result:array}
	 */
	public static function research_product( $ctx ) {
		$empty = array(
			'notes'  => '',
			'result' => array( 'ok' => false, 'tokens_in' => 0, 'tokens_out' => 0 ),
		);
		$settings = Webino_Dashboard_AI_Content_Settings::get();
		if ( empty( $settings['web_research'] ) ) {
			return $empty;
		}
		$name = (string) ( $ctx['name'] ?? '' );
		if ( '' === $name ) {
			return $empty;
		}
		$system = 'You research product facts for an e-commerce writer. Search the public web about this exact product when possible. Return concise factual notes only (origin, composition, typical use, comparable products). If a fact is unknown, write unknown. Do not invent specifications.';
		$user   = wp_json_encode(
			array(
				'product_name' => $name,
				'english_name' => $ctx['english_name'] ?? '',
				'sku'          => $ctx['sku'] ?? '',
				'brands'       => $ctx['brands'] ?? array(),
				'categories'   => $ctx['categories'] ?? array(),
				'site_name'    => Webino_Dashboard_AI_Content_Settings::resolved_site_name( $settings ),
				'site_topic'   => $settings['site_topic'] ?? '',
			),
			JSON_UNESCAPED_UNICODE
		);
		$result = self::complete_text( $system, (string) $user, array( 'search' => true ) );
		$notes  = ! empty( $result['ok'] ) ? trim( (string) ( $result['content'] ?? '' ) ) : '';
		return array(
			'notes'  => $notes,
			'result' => $result,
		);
	}

	/**
	 * @param string      $system System.
	 * @param string      $user User.
	 * @param string|null $force_provider Provider.
	 * @param array       $extra Extra call opts.
	 * @param bool        $parse_json Parse JSON body.
	 * @return array{ok:bool,content?:string,data?:array,provider?:string,model?:string,tokens_in?:int,tokens_out?:int,error?:string}
	 */
	private static function dispatch( $system, $user, $force_provider, $extra, $parse_json ) {
		$settings = Webino_Dashboard_AI_Content_Settings::get();
		$order    = is_array( $settings['fallback_order'] ) ? $settings['fallback_order'] : array( 'grok', 'gemini', 'openai', 'gapgpt' );

		if ( $force_provider ) {
			$order = array( sanitize_key( (string) $force_provider ) );
		} else {
			$default = sanitize_key( (string) $settings['default_provider'] );
			$order   = array_values( array_unique( array_merge( array( $default ), $order ) ) );
		}

		$last_error = 'No provider available';
		foreach ( $order as $provider ) {
			$key = self::key_for( $provider, $settings );
			if ( '' === $key ) {
				continue;
			}

			$result = self::call_provider( $provider, $key, $settings, (string) $system, (string) $user, $extra );
			$result['provider'] = $provider;
			if ( empty( $result['model'] ) ) {
				$result['model'] = Webino_Dashboard_AI_Pricing::model_for_provider( $provider, $settings );
			}
			$code               = (int) ( $result['http_code'] ?? 0 );

			if ( ! empty( $result['ok'] ) ) {
				if ( ! $parse_json ) {
					return $result;
				}
				$parsed = self::parse_json_content( (string) ( $result['content'] ?? '' ) );
				if ( is_wp_error( $parsed ) ) {
					$result['ok']    = false;
					$result['error'] = $parsed->get_error_message();
					return $result;
				}
				$result['data'] = $parsed;
				return $result;
			}

			$last_error = (string) ( $result['error'] ?? 'Provider failed' );
			if ( ! self::is_retryable_provider_error( $last_error, $code ) ) {
				return $result;
			}
		}

		return array(
			'ok'    => false,
			'error' => $last_error,
		);
	}

	/**
	 * @param string              $provider Provider.
	 * @param array<string,mixed> $settings Settings.
	 * @return string
	 */
	private static function key_for( $provider, $settings ) {
		$map = array(
			'grok'   => 'grok_api_key',
			'gemini' => 'gemini_api_key',
			'openai' => 'openai_api_key',
			'gapgpt' => 'gapgpt_api_key',
		);
		$field = $map[ $provider ] ?? '';
		return $field ? trim( (string) ( $settings[ $field ] ?? '' ) ) : '';
	}

	/**
	 * @param string              $provider Provider.
	 * @param string              $api_key Key.
	 * @param array<string,mixed> $settings Settings.
	 * @param string              $system System.
	 * @param string              $user User.
	 * @param array<string,mixed> $extra Extra options (search).
	 * @return array{ok:bool,content?:string,tokens_in?:int,tokens_out?:int,error?:string}
	 */
	private static function call_provider( $provider, $api_key, $settings, $system, $user, $extra = array() ) {
		if ( 'gemini' === $provider ) {
			return self::call_gemini( $api_key, (string) ( $settings['gemini_model'] ?? 'gemini-2.0-flash' ), $system, $user, $settings, $extra );
		}
		if ( 'openai' === $provider ) {
			return self::call_openai_compatible(
				'https://api.openai.com/v1/chat/completions',
				$api_key,
				(string) ( $settings['openai_model'] ?? 'gpt-4o-mini' ),
				$system,
				$user,
				$settings,
				$extra
			);
		}
		if ( 'gapgpt' === $provider ) {
			$result = self::call_openai_compatible(
				'https://api.gapgpt.app/v1/chat/completions',
				$api_key,
				(string) ( $settings['gapgpt_model'] ?? 'gpt-5.6-terra' ),
				$system,
				$user,
				$settings,
				$extra
			);
			if ( empty( $result['ok'] ) && self::is_transport_error( (string) ( $result['error'] ?? '' ) ) ) {
				$result = self::call_openai_compatible(
					'https://api.gapapi.com/v1/chat/completions',
					$api_key,
					(string) ( $settings['gapgpt_model'] ?? 'gpt-5.6-terra' ),
					$system,
					$user,
					$settings,
					$extra
				);
			}
			return $result;
		}
		if ( ! empty( $extra['search'] ) ) {
			$extra['grok_search'] = true;
		}
		return self::call_openai_compatible(
			'https://api.x.ai/v1/chat/completions',
			$api_key,
			(string) ( $settings['grok_model'] ?? 'grok-2-latest' ),
			$system,
			$user,
			$settings,
			$extra
		);
	}

	/**
	 * @param string               $url Endpoint.
	 * @param string               $api_key Key.
	 * @param string               $model Model.
	 * @param string               $system System.
	 * @param string               $user User.
	 * @param array<string,mixed>  $settings Settings.
	 * @param array<string,mixed>  $extra Extra body flags.
	 * @return array{ok:bool,content?:string,tokens_in?:int,tokens_out?:int,error?:string}
	 */
	private static function call_openai_compatible( $url, $api_key, $model, $system, $user, $settings = array(), $extra = array() ) {
		$temp = min( 2, max( 0, (float) ( $settings['temperature'] ?? 0.55 ) ) );
		$body = array(
			'model'       => $model,
			'messages'    => array(
				array( 'role' => 'system', 'content' => $system ),
				array( 'role' => 'user', 'content' => $user ),
			),
			'temperature' => $temp,
		);
		$max = (int) ( $settings['max_tokens'] ?? 0 );
		if ( $max > 0 ) {
			$body['max_tokens'] = min( 128000, $max );
		}
		if ( ! empty( $extra['grok_search'] ) ) {
			$body['search_parameters'] = array( 'mode' => 'on' );
		}

		$result = self::post_openai_json( $url, $api_key, $body );
		if ( empty( $result['ok'] ) && ! empty( $extra['grok_search'] ) ) {
			unset( $body['search_parameters'] );
			$result = self::post_openai_json( $url, $api_key, $body );
		}
		if ( empty( $result['ok'] ) && $max > 0 && self::needs_max_completion_tokens( (string) ( $result['error'] ?? '' ) ) ) {
			unset( $body['max_tokens'] );
			$body['max_completion_tokens'] = min( 128000, $max );
			$result = self::post_openai_json( $url, $api_key, $body );
		}
		return $result;
	}

	/**
	 * @param string               $url URL.
	 * @param string               $api_key Key.
	 * @param array<string,mixed>  $body Body.
	 * @return array{ok:bool,content?:string,tokens_in?:int,tokens_out?:int,error?:string}
	 */
	private static function post_openai_json( $url, $api_key, $body ) {
		$response = wp_remote_post(
			$url,
			array(
				'timeout' => 120,
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Content-Type'  => 'application/json',
				),
				'body'    => wp_json_encode( $body ),
			)
		);

		if ( is_wp_error( $response ) ) {
			return array( 'ok' => false, 'error' => $response->get_error_message(), 'http_code' => 0 );
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		$raw  = (string) wp_remote_retrieve_body( $response );
		$data = json_decode( $raw, true );
		if ( $code < 200 || $code >= 300 ) {
			$msg = is_array( $data ) && isset( $data['error']['message'] ) ? (string) $data['error']['message'] : 'HTTP ' . $code;
			return array( 'ok' => false, 'error' => $msg, 'http_code' => $code );
		}

		$content = '';
		if ( is_array( $data ) && isset( $data['choices'][0]['message']['content'] ) ) {
			$content = (string) $data['choices'][0]['message']['content'];
		}

		return array(
			'ok'         => '' !== trim( $content ),
			'content'    => $content,
			'model'      => (string) ( $body['model'] ?? '' ),
			'tokens_in'  => isset( $data['usage']['prompt_tokens'] ) ? (int) $data['usage']['prompt_tokens'] : 0,
			'tokens_out' => isset( $data['usage']['completion_tokens'] ) ? (int) $data['usage']['completion_tokens'] : 0,
			'error'      => '' === trim( $content ) ? 'Empty completion' : '',
			'http_code'  => $code,
		);
	}

	/**
	 * @param string              $api_key Key.
	 * @param string              $model Model.
	 * @param string              $system System.
	 * @param string              $user User.
	 * @param array<string,mixed> $settings Settings.
	 * @param array<string,mixed> $extra Extra flags.
	 * @return array{ok:bool,content?:string,tokens_in?:int,tokens_out?:int,error?:string}
	 */
	private static function call_gemini( $api_key, $model, $system, $user, $settings = array(), $extra = array() ) {
		$model = sanitize_text_field( $model );
		$url   = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode( $model ) . ':generateContent?key=' . rawurlencode( $api_key );

		$temp = min( 2, max( 0, (float) ( $settings['temperature'] ?? 0.55 ) ) );
		$json = empty( $extra['search'] );
		$gen  = array(
			'temperature' => $temp,
		);
		if ( $json ) {
			$gen['responseMimeType'] = 'application/json';
		}
		$max = (int) ( $settings['max_tokens'] ?? 0 );
		if ( $max > 0 ) {
			$gen['maxOutputTokens'] = min( 128000, $max );
		}

		$body = array(
			'systemInstruction' => array(
				'parts' => array( array( 'text' => $system ) ),
			),
			'contents'          => array(
				array(
					'role'  => 'user',
					'parts' => array( array( 'text' => $user ) ),
				),
			),
			'generationConfig'  => $gen,
		);
		if ( ! empty( $extra['search'] ) ) {
			$body['tools'] = array( array( 'google_search' => (object) array() ) );
		}

		$response = wp_remote_post(
			$url,
			array(
				'timeout' => 120,
				'headers' => array( 'Content-Type' => 'application/json' ),
				'body'    => wp_json_encode( $body ),
			)
		);

		if ( is_wp_error( $response ) ) {
			return array( 'ok' => false, 'error' => $response->get_error_message(), 'http_code' => 0 );
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		$raw  = (string) wp_remote_retrieve_body( $response );
		$data = json_decode( $raw, true );
		if ( $code < 200 || $code >= 300 ) {
			$msg = is_array( $data ) && isset( $data['error']['message'] ) ? (string) $data['error']['message'] : 'HTTP ' . $code;
			return array( 'ok' => false, 'error' => $msg, 'http_code' => $code );
		}

		$content = '';
		if ( is_array( $data ) && isset( $data['candidates'][0]['content']['parts'] ) && is_array( $data['candidates'][0]['content']['parts'] ) ) {
			$chunks = array();
			foreach ( $data['candidates'][0]['content']['parts'] as $part ) {
				if ( is_array( $part ) && isset( $part['text'] ) ) {
					$chunks[] = (string) $part['text'];
				}
			}
			$content = implode( "\n", $chunks );
		}

		$usage_in  = isset( $data['usageMetadata']['promptTokenCount'] ) ? (int) $data['usageMetadata']['promptTokenCount'] : 0;
		$usage_out = isset( $data['usageMetadata']['candidatesTokenCount'] ) ? (int) $data['usageMetadata']['candidatesTokenCount'] : 0;

		return array(
			'ok'         => '' !== trim( $content ),
			'content'    => $content,
			'model'      => $model,
			'tokens_in'  => $usage_in,
			'tokens_out' => $usage_out,
			'error'      => '' === trim( $content ) ? 'Empty completion' : '',
			'http_code'  => $code,
		);
	}

	/**
	 * @param string $content Raw model content.
	 * @return array<string,mixed>|WP_Error
	 */
	private static function parse_json_content( $content ) {
		$content = trim( (string) $content );
		if ( preg_match( '/```(?:json)?\s*([\s\S]*?)```/i', $content, $m ) ) {
			$content = trim( $m[1] );
		}
		$data = json_decode( $content, true );
		if ( ! is_array( $data ) ) {
			$start = strpos( $content, '{' );
			$end   = strrpos( $content, '}' );
			if ( false !== $start && false !== $end && $end > $start ) {
				$data = json_decode( substr( $content, $start, $end - $start + 1 ), true );
			}
		}
		if ( ! is_array( $data ) ) {
			return new WP_Error( 'ai_json', __( 'Model returned invalid JSON.', 'webino-dashboard' ) );
		}
		return $data;
	}

	/**
	 * Live GapGPT catalog (OpenAI-compatible GET /v1/models).
	 *
	 * @param bool $refresh Bypass short cache.
	 * @return list<array{id:string,owned_by:string}>|WP_Error
	 */
	public static function list_gapgpt_models( $refresh = false ) {
		$settings = Webino_Dashboard_AI_Content_Settings::get();
		$api_key  = trim( (string) ( $settings['gapgpt_api_key'] ?? '' ) );
		if ( '' === $api_key ) {
			return new WP_Error(
				'gapgpt_no_key',
				__( 'Enter a GapGPT API key and save settings first.', 'webino-dashboard' ),
				array( 'status' => 400 )
			);
		}

		$cache_key = 'webino_ai_gapgpt_models';
		if ( ! $refresh ) {
			$cached = get_transient( $cache_key );
			if ( is_array( $cached ) ) {
				return $cached;
			}
		}

		$response = wp_remote_get(
			'https://api.gapgpt.app/v1/models',
			array(
				'timeout' => 30,
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Accept'        => 'application/json',
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			$fallback = wp_remote_get(
				'https://api.gapapi.com/v1/models',
				array(
					'timeout' => 30,
					'headers' => array(
						'Authorization' => 'Bearer ' . $api_key,
						'Accept'        => 'application/json',
					),
				)
			);
			if ( ! is_wp_error( $fallback ) ) {
				$response = $fallback;
			} else {
				return new WP_Error( 'gapgpt_models', $response->get_error_message(), array( 'status' => 502 ) );
			}
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		$raw  = (string) wp_remote_retrieve_body( $response );
		$data = json_decode( $raw, true );
		if ( $code < 200 || $code >= 300 ) {
			$msg = is_array( $data ) && isset( $data['error']['message'] ) ? (string) $data['error']['message'] : 'HTTP ' . $code;
			return new WP_Error( 'gapgpt_models', $msg, array( 'status' => $code >= 400 && $code < 600 ? $code : 502 ) );
		}

		$rows = array();
		$list = array();
		if ( is_array( $data ) && isset( $data['data'] ) && is_array( $data['data'] ) ) {
			$list = $data['data'];
		} elseif ( is_array( $data ) && isset( $data['models'] ) && is_array( $data['models'] ) ) {
			$list = $data['models'];
		} elseif ( is_array( $data ) && isset( $data[0] ) ) {
			$list = $data;
		}

		foreach ( $list as $item ) {
			if ( is_string( $item ) ) {
				$id = sanitize_text_field( $item );
				if ( '' !== $id ) {
					$rows[] = array(
						'id'       => $id,
						'owned_by' => '',
					);
				}
				continue;
			}
			if ( ! is_array( $item ) ) {
				continue;
			}
			$id = sanitize_text_field( (string) ( $item['id'] ?? $item['name'] ?? '' ) );
			if ( '' === $id ) {
				continue;
			}
			$rows[] = array(
				'id'         => $id,
				'owned_by'   => sanitize_text_field( (string) ( $item['owned_by'] ?? $item['ownedBy'] ?? '' ) ),
				'in_per_1m'  => 0.0,
				'out_per_1m' => 0.0,
			);
			$parsed = Webino_Dashboard_AI_Pricing::rates_from_model_item( $item, Webino_Dashboard_AI_Pricing::usd_to_toman( $settings ) );
			if ( $parsed ) {
				$rows[ count( $rows ) - 1 ]['in_per_1m']  = $parsed['in_per_1m'];
				$rows[ count( $rows ) - 1 ]['out_per_1m'] = $parsed['out_per_1m'];
			}
		}

		usort(
			$rows,
			static function ( $a, $b ) {
				return strcasecmp( (string) $a['id'], (string) $b['id'] );
			}
		);

		set_transient( $cache_key, $rows, 5 * MINUTE_IN_SECONDS );
		return $rows;
	}

	/**
	 * GPT-5.x rejects max_tokens; retry with max_completion_tokens.
	 *
	 * @param string $error Error.
	 * @return bool
	 */
	private static function needs_max_completion_tokens( $error ) {
		$e = strtolower( (string) $error );
		return false !== strpos( $e, 'max_tokens' ) || false !== strpos( $e, 'max_completion_tokens' );
	}

	/**
	 * Network/transport failure (not HTTP 4xx from the API).
	 *
	 * @param string $error Error.
	 * @return bool
	 */
	private static function is_transport_error( $error ) {
		$e = strtolower( (string) $error );
		foreach ( array( 'curl error', 'failed to connect', 'could not resolve', 'timed out', 'timeout', 'connection refused', 'network is unreachable' ) as $needle ) {
			if ( false !== strpos( $e, $needle ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Fallback to another provider only when the call did not reach a billed completion.
	 *
	 * @param string $error Error.
	 * @param int    $http_code HTTP code.
	 * @return bool
	 */
	private static function is_retryable_provider_error( $error, $http_code ) {
		if ( $http_code >= 500 ) {
			return true;
		}
		if ( $http_code > 0 && $http_code < 500 ) {
			return false;
		}
		return self::is_transport_error( $error );
	}
}
