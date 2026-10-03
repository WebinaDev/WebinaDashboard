#!/usr/bin/env php
<?php
/**
 * CLI checks for the Webino migration contract. No WordPress bootstrap.
 *
 * @package WebinoDashboard
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'AUTH_KEY', 'test-auth-key-webino-migrate' );
define( 'SECURE_AUTH_KEY', 'test-secure-auth-key-webino-migrate' );
define( 'WEBINO_DASHBOARD_VERSION', 'test' );

$failures = 0;

/**
 * @param bool   $ok Condition.
 * @param string $message Message.
 * @return void
 */
function webino_migrate_assert( $ok, $message ) {
	global $failures;
	if ( $ok ) {
		fwrite( STDOUT, "OK: {$message}\n" );
		return;
	}
	++$failures;
	fwrite( STDERR, "FAIL: {$message}\n" );
}

if ( ! class_exists( 'WP_Error' ) ) {
	/**
	 * Minimal WP_Error stub.
	 */
	class WP_Error {
		/**
		 * @var string
		 */
		public $code;
		/**
		 * @var string
		 */
		public $message;

		/**
		 * @param string $code Code.
		 * @param string $message Message.
		 * @param mixed  $data Data.
		 */
		public function __construct( $code = '', $message = '', $data = '' ) {
			unset( $data );
			$this->code    = (string) $code;
			$this->message = (string) $message;
		}

		/**
		 * @return string
		 */
		public function get_error_code() {
			return $this->code;
		}

		/**
		 * @return string
		 */
		public function get_error_message() {
			return $this->message;
		}
	}
}

if ( ! function_exists( 'is_wp_error' ) ) {
	/**
	 * @param mixed $thing Thing.
	 * @return bool
	 */
	function is_wp_error( $thing ) {
		return $thing instanceof WP_Error;
	}
}

if ( ! function_exists( '__' ) ) {
	/**
	 * @param string $text Text.
	 * @param string $domain Domain.
	 * @return string
	 */
	function __( $text, $domain = 'default' ) {
		unset( $domain );
		return (string) $text;
	}
}

if ( ! function_exists( 'apply_filters' ) ) {
	/**
	 * @param string $tag Tag.
	 * @param mixed  $value Value.
	 * @return mixed
	 */
	function apply_filters( $tag, $value ) {
		unset( $tag );
		return $value;
	}
}

if ( ! function_exists( 'sanitize_key' ) ) {
	/**
	 * @param string $key Key.
	 * @return string
	 */
	function sanitize_key( $key ) {
		return strtolower( (string) preg_replace( '/[^a-z0-9_\-]/', '', (string) $key ) );
	}
}

if ( ! function_exists( 'wp_parse_url' ) ) {
	/**
	 * @param string $url URL.
	 * @return array|false
	 */
	function wp_parse_url( $url ) {
		$parts = parse_url( (string) $url );
		return is_array( $parts ) ? $parts : false;
	}
}

$GLOBALS['webino_test_options'] = array();

if ( ! function_exists( 'get_option' ) ) {
	/**
	 * @param string $key Key.
	 * @param mixed  $default Default.
	 * @return mixed
	 */
	function get_option( $key, $default = false ) {
		return array_key_exists( $key, $GLOBALS['webino_test_options'] ) ? $GLOBALS['webino_test_options'][ $key ] : $default;
	}
}

if ( ! function_exists( 'update_option' ) ) {
	/**
	 * @param string $key Key.
	 * @param mixed  $value Value.
	 * @param bool   $autoload Autoload.
	 * @return bool
	 */
	function update_option( $key, $value, $autoload = null ) {
		unset( $autoload );
		$GLOBALS['webino_test_options'][ $key ] = $value;
		return true;
	}
}

if ( ! function_exists( 'wp_remote_retrieve_response_code' ) ) {
	/**
	 * @param array $response Response.
	 * @return int
	 */
	function wp_remote_retrieve_response_code( $response ) {
		return isset( $response['code'] ) ? (int) $response['code'] : 0;
	}
}

if ( ! function_exists( 'wp_remote_retrieve_body' ) ) {
	/**
	 * @param array $response Response.
	 * @return string
	 */
	function wp_remote_retrieve_body( $response ) {
		return isset( $response['body'] ) ? (string) $response['body'] : '';
	}
}

if ( ! function_exists( 'wp_json_encode' ) ) {
	/**
	 * @param mixed $data Data.
	 * @param int   $flags Flags.
	 * @return string|false
	 */
	function wp_json_encode( $data, $flags = 0 ) {
		return json_encode( $data, $flags );
	}
}

if ( ! function_exists( 'wp_remote_retrieve_header' ) ) {
	/**
	 * @param array  $response Response.
	 * @param string $header Header.
	 * @return string
	 */
	function wp_remote_retrieve_header( $response, $header ) {
		return isset( $response['headers'][ $header ] ) ? (string) $response['headers'][ $header ] : '';
	}
}

$root = dirname( __DIR__ );
require $root . '/includes/migrate/class-webino-dashboard-migrate-crypto.php';
require $root . '/includes/migrate/class-webino-dashboard-migrate-schema.php';
require $root . '/includes/migrate/class-webino-dashboard-migrate-settings.php';
require $root . '/includes/migrate/class-webino-dashboard-migrate-client.php';
require $root . '/includes/migrate/class-webino-dashboard-migrate-runner.php';
require $root . '/includes/migrate/class-webino-dashboard-migrate-exporters.php';
require $root . '/includes/migrate/class-webino-dashboard-migrate-elementor.php';
require $root . '/includes/migrate/class-webino-dashboard-migrate-extra.php';

$secret = 'super-secret-token-value';
$cipher = Webino_Dashboard_Migrate_Crypto::encrypt( $secret );
webino_migrate_assert( is_string( $cipher ) && 0 === strpos( $cipher, 'v1:' ), 'token ciphertext uses v1 prefix' );
webino_migrate_assert( false === strpos( (string) $cipher, $secret ), 'ciphertext does not contain the token' );
webino_migrate_assert( Webino_Dashboard_Migrate_Crypto::decrypt( $cipher ) === $secret, 'token round-trips' );
webino_migrate_assert( '' === Webino_Dashboard_Migrate_Crypto::decrypt( 'plain-text-token' ), 'plaintext storage is not treated as a token' );
webino_migrate_assert( '' === Webino_Dashboard_Migrate_Crypto::encrypt( '' ), 'empty token stays empty' );

$saved = Webino_Dashboard_Migrate_Settings::update(
	array(
		'site_url'   => 'https://PARISMA.WEBINAAGENCY.IR/tenant/?token=' . $secret,
		'token'      => $secret,
		'batch_size' => 500,
		'delay_ms'   => 400,
		'entities'   => array(
			'products' => '1',
			'orders'   => '1',
		),
		'endpoints'  => array(
			'ingest' => '../secret',
			'run'    => '/api/v1/import/wordpress/jobs/{id}/run',
		),
	)
);
webino_migrate_assert( ! is_wp_error( $saved ), 'settings save accepts a public https origin' );
webino_migrate_assert( 'https://parisma.webinaagency.ir/tenant' === $saved['site_url'], 'origin is normalized and query is dropped' );
webino_migrate_assert( 50 === $saved['batch_size'], 'batch size is clamped to the ingest maximum' );
webino_migrate_assert( 'selective' === $saved['mode'], 'a save without mode stays selective' );
webino_migrate_assert( ! empty( $saved['entities']['products'] ) && empty( $saved['entities']['pages'] ), 'entity checklist is stored' );
webino_migrate_assert( '/api/v1/import/wordpress/ingest' === $saved['endpoints']['ingest'], 'path traversal falls back to the default ingest path' );
webino_migrate_assert( '/api/v1/import/wordpress/jobs/{id}/run' === $saved['endpoints']['run'], 'run path keeps the job id placeholder' );
webino_migrate_assert( true === $saved['token_set'], 'token is marked as stored' );
webino_migrate_assert( false === strpos( wp_json_encode( $saved ), $secret ) && false === strpos( $saved['token_hint'], $secret ), 'public settings do not contain the token' );
$stored = get_option( Webino_Dashboard_Migrate_Settings::OPTION );
webino_migrate_assert( is_array( $stored ) && false === strpos( (string) $stored['token_enc'], $secret ), 'option value does not contain the plaintext token' );
webino_migrate_assert( Webino_Dashboard_Migrate_Settings::token() === $secret, 'stored token decrypts for the HTTP client' );

$blocked = array(
	'http://parisma.webinaagency.ir',
	'https://user:pass@parisma.webinaagency.ir',
	'https://127.0.0.1',
	'https://192.168.0.5',
	'https://169.254.169.254',
	'https://localhost',
	'https://evil.example/../wp-admin',
);
foreach ( $blocked as $bad ) {
	webino_migrate_assert( is_wp_error( Webino_Dashboard_Migrate_Schema::normalize_site_url( $bad ) ), 'blocked URL ' . $bad );
}

webino_migrate_assert(
	'https://parisma.webinaagency.ir/api/v1/import/wordpress/ping' === Webino_Dashboard_Migrate_Schema::join_url( 'https://parisma.webinaagency.ir/', '/api/v1/import/wordpress/ping' ),
	'endpoint URL is joined once'
);

$leaked = 'Authorization: Bearer ' . $secret . ' token=' . $secret;
$clean  = Webino_Dashboard_Migrate_Schema::redact( $leaked, $secret );
webino_migrate_assert( false === strpos( $clean, $secret ), 'redaction removes bearer token and token assignment' );

$parsed = Webino_Dashboard_Migrate_Client::parse_response(
	array(
		'code'    => 429,
		'body'    => '{"message":"slow down Bearer ' . $secret . '"}',
		'headers' => array( 'retry-after' => '12' ),
	),
	$secret
);
webino_migrate_assert( ! $parsed['ok'] && 429 === $parsed['http_status'] && 12 === $parsed['retry_after'], '429 exposes Retry-After' );
webino_migrate_assert( false === strpos( $parsed['error'], $secret ), '429 body does not keep the token' );

$replay = Webino_Dashboard_Migrate_Client::parse_response(
	array(
		'code'    => 409,
		'body'    => '{"ok":true}',
		'headers' => array(),
	),
	$secret
);
webino_migrate_assert( ! empty( $replay['ok'] ), '409 idempotent replay counts as success' );

$state = Webino_Dashboard_Migrate_Runner::initial_state( 'job1', array( 'products', 'orders' ), 1_700_000_000, false );
$state = Webino_Dashboard_Migrate_Runner::reduce(
	$state,
	array(
		'now'          => 1_700_000_010,
		'entity'       => 'products',
		'ok'           => true,
		'http_status'  => 200,
		'exported'     => 20,
		'next_cursor'  => '20',
		'done'         => false,
	)
);
webino_migrate_assert( '20' === $state['cursors']['products'] && 20 === $state['progress']['products']['exported'] && 0 === $state['entity_index'], 'successful batch advances the cursor' );

$before = $state['cursors']['products'];
$state  = Webino_Dashboard_Migrate_Runner::reduce(
	$state,
	array(
		'now'         => 1_700_000_020,
		'entity'      => 'products',
		'ok'          => false,
		'http_status' => 429,
		'retry_after' => 9,
		'error'       => 'Bearer ' . $secret,
	)
);
webino_migrate_assert( $before === $state['cursors']['products'] && 'running' === $state['status'] && 1_700_000_029 === $state['pause_until'], 'rate limit keeps the cursor' );
$log_blob = wp_json_encode( $state['log'] );
webino_migrate_assert( false === strpos( (string) $log_blob, $secret ), 'job log does not contain the token' );

$state = Webino_Dashboard_Migrate_Runner::reduce(
	$state,
	array(
		'now'         => 1_700_000_040,
		'entity'      => 'products',
		'ok'          => false,
		'http_status' => 422,
		'error'       => 'invalid row',
	)
);
webino_migrate_assert( 'failed' === $state['status'] && $before === $state['cursors']['products'], 'client error fails without moving the cursor' );

$retry = Webino_Dashboard_Migrate_Runner::initial_state( 'job2', array( 'orders' ), 1_700_000_000, false );
for ( $i = 1; $i <= 3; $i++ ) {
	$retry = Webino_Dashboard_Migrate_Runner::reduce(
		$retry,
		array(
			'now'         => 1_700_000_000 + $i,
			'entity'      => 'orders',
			'ok'          => false,
			'http_status' => 503,
			'error'       => 'upstream',
		)
	);
}
webino_migrate_assert( 'failed' === $retry['status'] && '' === $retry['cursors']['orders'] && 3 === $retry['retries']['orders'], 'three server errors fail the same cursor' );

$done = Webino_Dashboard_Migrate_Runner::initial_state( 'job3', array( 'menus' ), 1_700_000_000, true );
$done = Webino_Dashboard_Migrate_Runner::reduce(
	$done,
	array(
		'now'         => 1_700_000_005,
		'entity'      => 'menus',
		'ok'          => true,
		'exported'    => 2,
		'next_cursor' => '7',
		'done'        => true,
	)
);
webino_migrate_assert( 'complete' === $done['phase'] && ! empty( $done['progress']['menus']['done'] ), 'last entity moves the job to the complete phase' );

list( $tax, $last ) = Webino_Dashboard_Migrate_Export_Categories::parse_cursor( 'product_cat|40', array( 'product_cat', 'product_tag' ) );
webino_migrate_assert( 'product_cat' === $tax && 40 === $last, 'category cursor parses taxonomy and id' );
list( $tax2, $last2 ) = Webino_Dashboard_Migrate_Export_Categories::parse_cursor( '', array( 'product_cat' ) );
webino_migrate_assert( 'product_cat' === $tax2 && 0 === $last2, 'empty category cursor starts at the first taxonomy' );

$product = Webino_Dashboard_Migrate_Export_Products::shape_item(
	array(
		'source_id'         => 501,
		'type'              => 'variable',
		'name'              => 'رژ مات',
		'sku'               => 'PRS-501',
		'user_pass'         => 'hash',
		'api_key'           => 'secret',
		'regular_price'     => '450000',
		'images'            => array(
			array( 'source_id' => 1, 'url' => 'file:///etc/passwd', 'position' => 0 ),
			array( 'source_id' => 2, 'url' => 'https://parisma.ir/wp-content/uploads/a.jpg', 'alt' => 'رژ', 'position' => 1 ),
		),
		'variations'        => array(
			array(
				'source_id'     => 502,
				'sku'           => 'PRS-501-RED',
				'regular_price' => '450000',
				'attributes'    => array( 'pa_color' => 'red' ),
				'password'      => 'nope',
			),
		),
	)
);
webino_migrate_assert( ! isset( $product['user_pass'] ) && ! isset( $product['api_key'] ), 'product payload drops secrets' );
webino_migrate_assert( 1 === count( $product['images'] ) && 'https://parisma.ir/wp-content/uploads/a.jpg' === $product['images'][0]['url'], 'product images keep only public URLs' );
webino_migrate_assert( 'PRS-501-RED' === $product['variations'][0]['sku'] && ! isset( $product['variations'][0]['password'] ), 'variation sku is kept and secrets are not' );

$customer = Webino_Dashboard_Migrate_Export_Customers::shape_item(
	array(
		'source_id' => 44,
		'email'     => 'customer@example.com',
		'user_pass' => '$P$not-a-real-hash',
		'username'  => 'customer44',
	)
);
webino_migrate_assert( ! isset( $customer['user_pass'] ) && 'customer@example.com' === $customer['email'], 'customer payload omits the password hash' );

$order = Webino_Dashboard_Migrate_Export_Orders::shape_item(
	array(
		'source_id'     => 9001,
		'number'        => '9001',
		'status'        => 'completed',
		'payment_token' => 'tok_live_secret',
		'totals'        => array( 'total' => '500000' ),
		'line_items'    => array(
			array( 'product_source_id' => 501, 'variation_source_id' => 502, 'quantity' => 1, 'sku' => 'PRS-501-RED' ),
		),
	)
);
webino_migrate_assert( ! isset( $order['payment_token'] ) && 502 === $order['line_items'][0]['variation_source_id'], 'order payload drops payment tokens and keeps variation ids' );

$media = Webino_Dashboard_Migrate_Export_Media::shape_item(
	array(
		'source_id' => 90,
		'url'       => 'javascript:alert(1)',
		'file'      => '2024/05/a.jpg',
		'mime_type' => 'image/jpeg',
	)
);
webino_migrate_assert( '' === $media['url'], 'media URL must be http(s)' );

$key = Webino_Dashboard_Migrate_Schema::idempotency_key( 'job1', 'products', '20', 20 );
webino_migrate_assert( $key === Webino_Dashboard_Migrate_Schema::idempotency_key( 'job1', 'products', '20', 20 ), 'idempotency key is stable' );
webino_migrate_assert( 1 === preg_match( '/^[A-Za-z0-9_:\-|.]{8,180}$/', $key ), 'idempotency key is header-safe' );

$full = Webino_Dashboard_Migrate_Settings::update(
	array(
		'site_url' => 'https://parisma.webinaagency.ir',
		'mode'     => 'full',
		'entities' => array( 'pages' => '' ),
	)
);
webino_migrate_assert( ! is_wp_error( $full ) && 'full' === $full['mode'] && ! empty( $full['entities']['pages'] ) && ! empty( $full['entities']['brands'] ), 'full mode forces every entity on' );

$taxes = Webino_Dashboard_Migrate_Export_Categories::taxonomies();
webino_migrate_assert( array( 'product_cat' ) === $taxes, 'category export is product categories only' );

$product = Webino_Dashboard_Migrate_Export_Products::shape_item(
	array(
		'source_id'  => 501,
		'type'       => 'simple',
		'name'       => 'رژ مات',
		'dimensions' => array( 'length' => '12', 'width' => '3', 'height' => '3' ),
		'brands'     => array(
			array( 'source_id' => 8, 'slug' => 'loreal', 'name' => 'لورآل' ),
		),
		'license_key' => 'should-drop',
	)
);
webino_migrate_assert( '12' === $product['length'] && array( '8' ) === $product['brand_external_ids'], 'product length is flattened and brands become external ids' );
webino_migrate_assert( ! isset( $product['license_key'] ), 'product payload drops license keys' );

$order = Webino_Dashboard_Migrate_Export_Orders::shape_item(
	array(
		'source_id'      => 9002,
		'number'         => '9002',
		'status'         => 'processing',
		'shipping_lines' => array(
			array( 'line_type' => 'shipping', 'method_title' => 'پست', 'total' => '45000' ),
		),
		'private_notes'  => array(
			array( 'content' => 'بسته‌بندی هدیه' ),
		),
	)
);
webino_migrate_assert( 'shipping' === $order['shipping_lines'][0]['line_type'] && 'بسته‌بندی هدیه' === $order['note'], 'order keeps shipping lines and joins private notes' );

$menu = Webino_Dashboard_Migrate_Export_Menus::nest_items(
	array(
		array( 'source_id' => 1, 'parent_source_id' => 0, 'title' => 'فروشگاه' ),
		array( 'source_id' => 2, 'parent_source_id' => 1, 'title' => 'آرایش' ),
	)
);
webino_migrate_assert( isset( $menu[0]['children'][0]['title'] ) && 'آرایش' === $menu[0]['children'][0]['title'], 'flat menu items nest under their parent' );

$staff = Webino_Dashboard_Migrate_Export_Staff::shape_item(
	array(
		'source_id' => '7',
		'email'     => 'editor@parisma.ir',
		'name'      => 'ویراستار',
		'roles'     => array( 'editor' ),
		'user_pass' => '$P$not-exported',
	)
);
webino_migrate_assert( true === $staff['invite'] && false === $staff['password_exported'] && ! isset( $staff['user_pass'] ), 'staff payload is invite-only' );

$stripped = Webino_Dashboard_Migrate_Schema::strip_sensitive_keys(
	array(
		'title'            => 'زرین‌پال',
		'enabled'          => 'yes',
		'merchant'         => 'MID',
		'license'          => 'LIC',
		'consumer_secret'  => 'sec',
	)
);
webino_migrate_assert( isset( $stripped['title'] ) && ! isset( $stripped['merchant'] ) && ! isset( $stripped['license'] ) && ! isset( $stripped['consumer_secret'] ), 'settings strip drops credentials and license keys' );

$ingest = Webino_Dashboard_Migrate_Schema::ingest_payload(
	'pages',
	array( array( 'source_id' => 1927, 'title' => 'خانه' ) ),
	array( 'site_url' => 'https://parisma.ir' )
);
webino_migrate_assert( 'https://parisma.ir' === $ingest['source_url'] && 'pages' === $ingest['resource'] && false === $ingest['publish_content'], 'ingest payload keeps publish off' );
webino_migrate_assert( '1927' === $ingest['items'][0]['external_id'], 'ingest rows alias source_id to external_id' );

webino_migrate_assert( true === Webino_Dashboard_Migrate_Schema::remote_accepts( 'products', null ), 'empty advertisement still accepts products' );
webino_migrate_assert( false === Webino_Dashboard_Migrate_Schema::remote_accepts( 'brands', array() ), 'empty advertisement does not accept brands' );
webino_migrate_assert( true === Webino_Dashboard_Migrate_Schema::remote_accepts( 'brands', array( 'brands', 'products' ) ), 'advertised brands are accepted' );
webino_migrate_assert( true === Webino_Dashboard_Migrate_Schema::is_unknown_resource_error( 'Unknown import resource.' ), 'unknown resource errors are recognized' );

$skip = Webino_Dashboard_Migrate_Runner::initial_state( 'job4', array( 'brands', 'products' ), 1_700_000_100, false );
$skip = Webino_Dashboard_Migrate_Runner::reduce(
	$skip,
	array(
		'now'          => 1_700_000_110,
		'entity'       => 'brands',
		'unsupported'  => true,
		'http_status'  => 422,
		'error'        => 'Unknown import resource.',
	)
);
webino_migrate_assert( 'running' === $skip['status'] && ! empty( $skip['progress']['brands']['unsupported'] ) && 1 === (int) $skip['entity_index'], 'an unknown resource is skipped without failing the job' );

$fixture = json_decode( (string) file_get_contents( __DIR__ . '/fixtures/elementor-page.json' ), true );
$document = Webino_Dashboard_Migrate_Elementor::convert(
	$fixture,
	array(
		'html'        => '<div class="elementor">خانه</div>',
		'css'         => '.elementor{color:#111}',
		'title'       => 'خانه',
		'external_id' => '1927',
	)
);
$types = array();
$unmapped = '';
foreach ( $document['sections'] as $section ) {
	foreach ( $section['columns'] as $column ) {
		foreach ( $column['widgets'] as $widget ) {
			$types[] = $widget['type'];
			if ( isset( $widget['props']['html'] ) && is_string( $widget['props']['html'] ) && false !== strpos( $widget['props']['html'], 'data-webino-unmapped' ) ) {
				$unmapped = $widget['props']['html'];
			}
		}
	}
}
webino_migrate_assert( 1 === $document['version'] && 'elementor' === $document['source'], 'Elementor document uses builder version 1' );
webino_migrate_assert( in_array( 'heading', $types, true ) && in_array( 'text', $types, true ) && in_array( 'image', $types, true ), 'Elementor maps heading, text, and image' );
webino_migrate_assert( in_array( 'button', $types, true ) && in_array( 'product-grid', $types, true ) && in_array( 'html', $types, true ), 'Elementor maps button, product grid, and unmapped HTML' );
webino_migrate_assert( false !== strpos( $unmapped, 'countdown' ), 'unmapped widgets keep an HTML marker' );
webino_migrate_assert( isset( $document['styles']['css'] ) && false !== strpos( $document['styles']['css'], 'color:#111' ), 'Elementor CSS is attached to the document' );

if ( $failures > 0 ) {
	fwrite( STDERR, "{$failures} failure(s)\n" );
	exit( 1 );
}

fwrite( STDOUT, "All migration contract checks passed\n" );
exit( 0 );
