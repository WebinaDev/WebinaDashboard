<?php

namespace WebinoBasalam\Services;

use WebinoBasalam\Admin\Settings\SettingsConfig;
use WebinoBasalam\Admin\Settings\SettingsManager;
use WebinoBasalam\Config\Endpoints;
use WebinoBasalam\Jobs\Exceptions\NonRetryableException;
use WebinoBasalam\Logger\Logger;

defined( 'ABSPATH' ) || exit;

/**
 * Shared vendor_id checks before Basalam product API calls.
 */
class VendorGate {

	private const HEALTH_TRANSIENT = 'webino_basalam_vendor_health_v1';
	private const HEALTH_TTL       = HOUR_IN_SECONDS;
	private const USERS_ME_URL     = Endpoints::OPENAPI_BASE . '/v1/users/me';

	/**
	 * Require a positive vendor_id from settings (self-heal via users/me when token exists).
	 *
	 * @throws NonRetryableException When missing/invalid.
	 */
	public static function requireVendorId(): int {
		return self::ensureVendorId();
	}

	/**
	 * Return a positive vendor_id. If missing but access token exists, resolve from /v1/users/me.
	 *
	 * @throws NonRetryableException When token missing or booth id cannot be resolved.
	 */
	public static function ensureVendorId(): int {
		$vendor_id = absint( webinoBasalamSettings()->getSettings( SettingsConfig::VENDOR_ID ) );
		if ( $vendor_id >= 1 ) {
			return $vendor_id;
		}

		$token = (string) webinoBasalamSettings()->getSettings( SettingsConfig::TOKEN );
		if ( '' === trim( $token ) ) {
			throw NonRetryableException::invalidData(
				'شناسه غرفه (vendor_id) تنظیم نشده یا نامعتبر است — اتصال باسلام را دوباره برقرار کنید. | vendor_id: 0'
			);
		}

		$resolved = self::resolveVendorIdFromUsersMe( $token );
		if ( $resolved < 1 ) {
			throw NonRetryableException::invalidData(
				'شناسه غرفه (vendor_id) تنظیم نشده یا نامعتبر است — اتصال باسلام را دوباره برقرار کنید. | vendor_id: 0'
			);
		}

		SettingsManager::updateSettings(
			array(
				SettingsConfig::VENDOR_ID => (string) $resolved,
				SettingsConfig::IS_VENDOR => true,
			)
		);
		if ( function_exists( 'webinoBasalamSettings' ) ) {
			webinoBasalamSettings()->forget();
		}

		Logger::info(
			'vendor_id از /v1/users/me ترمیم شد.',
			array( 'vendor_id' => $resolved )
		);

		return $resolved;
	}

	/**
	 * Best-effort heal for UI/status — never throws.
	 *
	 * @return int Resolved vendor id or 0.
	 */
	public static function tryEnsureVendorId(): int {
		try {
			return self::ensureVendorId();
		} catch ( \Throwable $e ) {
			Logger::warning( 'ترمیم vendor_id ناموفق: ' . $e->getMessage() );
			return absint( webinoBasalamSettings()->getSettings( SettingsConfig::VENDOR_ID ) );
		}
	}

	/**
	 * @param string $access_token Bearer token.
	 * @return int
	 */
	private static function resolveVendorIdFromUsersMe( string $access_token ): int {
		$response = wp_remote_get(
			self::USERS_ME_URL,
			array(
				'timeout' => 20,
				'headers' => array(
					'Authorization' => 'Bearer ' . $access_token,
					'Accept'        => 'application/json',
					'user-agent'    => 'WebinoBasalam-VendorGate',
				),
			)
		);
		if ( is_wp_error( $response ) ) {
			Logger::warning( 'users/me برای vendor_id ناموفق: ' . $response->get_error_message() );
			return 0;
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		$data = json_decode( (string) wp_remote_retrieve_body( $response ), true );
		if ( $code < 200 || $code >= 300 || ! is_array( $data ) ) {
			Logger::warning( 'users/me HTTP ' . $code . ' هنگام resolve vendor_id' );
			return 0;
		}

		return self::extractVendorIdFromUsersMe( $data );
	}

	/**
	 * Prefer nested vendor.id — never use top-level user id.
	 *
	 * @param array<string,mixed> $data users/me payload.
	 * @return int
	 */
	private static function extractVendorIdFromUsersMe( array $data ): int {
		if ( ! empty( $data['vendor']['id'] ) && is_numeric( $data['vendor']['id'] ) ) {
			return (int) $data['vendor']['id'];
		}
		if ( isset( $data['data'] ) && is_array( $data['data'] ) ) {
			if ( ! empty( $data['data']['vendor']['id'] ) && is_numeric( $data['data']['vendor']['id'] ) ) {
				return (int) $data['data']['vendor']['id'];
			}
			if ( ! empty( $data['data']['vendor_id'] ) && is_numeric( $data['data']['vendor_id'] ) ) {
				return (int) $data['data']['vendor_id'];
			}
		}
		if ( ! empty( $data['vendor_id'] ) && is_numeric( $data['vendor_id'] ) ) {
			return (int) $data['vendor_id'];
		}
		return 0;
	}

	/**
	 * Soft health check against VENDOR_INFO (cached 1h). Throws if Basalam returns 404 for this booth.
	 *
	 * @throws NonRetryableException When vendor is missing on Basalam.
	 */
	public static function assertVendorExistsOnBasalam( ?int $vendor_id = null ): int {
		$vendor_id = null !== $vendor_id ? absint( $vendor_id ) : self::requireVendorId();
		$url       = sprintf( Endpoints::VENDOR_INFO, $vendor_id );

		$cache_key = self::HEALTH_TRANSIENT . '_' . $vendor_id;
		$cached    = get_transient( $cache_key );
		if ( 'ok' === $cached ) {
			return $vendor_id;
		}
		if ( is_array( $cached ) && ! empty( $cached['error'] ) ) {
			throw NonRetryableException::invalidData( (string) $cached['error'] );
		}

		$token = (string) webinoBasalamSettings()->getSettings( SettingsConfig::TOKEN );
		if ( '' === $token ) {
			throw NonRetryableException::unauthorized(
				'توکن باسلام یافت نشد. ابتدا اتصال باسلام را انجام دهید. | vendor_id: ' . $vendor_id
			);
		}

		try {
			$api = webinoBasalamContainer()->get( ApiServiceManager::class );
			$api->get( $url, array( 'Authorization' => 'Bearer ' . $token ) );
			set_transient( $cache_key, 'ok', self::HEALTH_TTL );
			return $vendor_id;
		} catch ( NonRetryableException $e ) {
			$code = (int) $e->getCode();
			$msg  = $e->getMessage();
			$is404 = 404 === $code || false !== strpos( $msg, '404' ) || false !== strpos( $msg, 'یافت نشد' );
			if ( $is404 ) {
				$msg = sprintf(
					'vendor_id روی باسلام یافت نشد: %d — اتصال غرفه را دوباره برقرار کنید. | HTTP 404 | URL: %s | vendor_id: %d',
					$vendor_id,
					$url,
					$vendor_id
				);
				set_transient( $cache_key, array( 'error' => $msg ), 5 * MINUTE_IN_SECONDS );
				throw NonRetryableException::invalidData( $msg );
			}
			throw $e;
		} catch ( \Throwable $e ) {
			Logger::warning( 'بررسی سلامت vendor_id ناموفق بود (ادامه با create): ' . $e->getMessage(), array(
				'vendor_id' => $vendor_id,
				'url'       => $url,
			) );
			// Network/transient issues: do not hard-block create; ApiResponseHandler will still enrich.
			return $vendor_id;
		}
	}
}
