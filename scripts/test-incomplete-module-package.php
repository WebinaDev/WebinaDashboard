#!/usr/bin/env php
<?php
/**
 * CLI smoke: incomplete module package must not pass module_package_is_complete.
 *
 * @package WebinoDashboard
 */

define( 'ABSPATH', __DIR__ . '/' );
define( 'WEBINO_DASHBOARD_DIR', dirname( __DIR__ ) . '/' );
define( 'WEBINO_MODULES_DIR', dirname( WEBINO_DASHBOARD_DIR ) . '/Modules/' );

if ( ! function_exists( 'apply_filters' ) ) {
	/**
	 * @param string $tag  Filter name.
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

if ( ! function_exists( 'trailingslashit' ) ) {
	/**
	 * @param string $path Path.
	 * @return string
	 */
	function trailingslashit( $path ) {
		return rtrim( (string) $path, '/\\' ) . '/';
	}
}

require dirname( __DIR__ ) . '/includes/class-webino-dashboard-module-registry.php';

/**
 * @param string $slug Module slug.
 * @return void
 */
function webino_test_cleanup_module_dir( $slug ) {
	$module_dir = WEBINO_MODULES_DIR . sanitize_key( $slug ) . '/';
	if ( ! is_dir( $module_dir ) ) {
		return;
	}
	$it = new RecursiveIteratorIterator(
		new RecursiveDirectoryIterator( $module_dir, RecursiveDirectoryIterator::SKIP_DOTS ),
		RecursiveIteratorIterator::CHILD_FIRST
	);
	foreach ( $it as $file ) {
		if ( $file->isDir() ) {
			rmdir( $file->getPathname() );
		} else {
			unlink( $file->getPathname() );
		}
	}
	rmdir( $module_dir );
}

/**
 * @param string               $slug     Module slug.
 * @param array<string,mixed> $manifest Manifest array.
 * @param array<string,string> $files    Relative path => contents.
 * @return void
 */
function webino_test_write_module_fixture( $slug, array $manifest, array $files ) {
	$slug       = sanitize_key( $slug );
	$module_dir = WEBINO_MODULES_DIR . $slug . '/';
	webino_test_cleanup_module_dir( $slug );
	mkdir( $module_dir, 0755, true );
	file_put_contents( $module_dir . 'manifest.json', json_encode( $manifest, JSON_UNESCAPED_UNICODE ) );
	foreach ( $files as $rel => $contents ) {
		$path = $module_dir . ltrim( $rel, '/' );
		$parent = dirname( $path );
		if ( ! is_dir( $parent ) ) {
			mkdir( $parent, 0755, true );
		}
		file_put_contents( $path, $contents );
	}
}

if ( ! is_dir( WEBINO_MODULES_DIR ) ) {
	mkdir( WEBINO_MODULES_DIR, 0755, true );
}

$slug = 'incomplete-test-module';
webino_test_write_module_fixture(
	$slug,
	array(
		'slug'      => $slug,
		'name'      => 'Incomplete test',
		'version'   => '1.0.0',
		'bootstrap' => 'bootstrap.php',
	),
	array(
		'bootstrap.php' => "<?php\n\$dir = dirname( __FILE__ ) . '/includes/';\nrequire_once \$dir . 'missing.php';\n",
	)
);

$manifest = Webino_Dashboard_Module_Registry::get_manifest( $slug );
if ( ! is_array( $manifest ) ) {
	fwrite( STDERR, "FAIL: could not read fixture manifest (missing includes)\n" );
	exit( 1 );
}

if ( Webino_Dashboard_Module_Registry::module_package_is_complete( $slug, $manifest ) ) {
	fwrite( STDERR, "FAIL: incomplete package (missing includes) should not pass validation\n" );
	exit( 1 );
}

webino_test_cleanup_module_dir( $slug );

$client_slug = 'incomplete-client-module';
webino_test_write_module_fixture(
	$client_slug,
	array(
		'slug'      => $client_slug,
		'name'      => 'Incomplete client test',
		'version'   => '1.0.0',
		'bootstrap' => 'bootstrap.php',
		'client'    => array(
			'entry'  => 'client/dist/module.js',
			'routes' => array(
				array(
					'path'       => 'shop/example',
					'capability' => 'read',
				),
			),
		),
	),
	array(
		'bootstrap.php' => "<?php\n// no includes\n",
	)
);

$client_manifest = Webino_Dashboard_Module_Registry::get_manifest( $client_slug );
if ( ! is_array( $client_manifest ) ) {
	fwrite( STDERR, "FAIL: could not read fixture manifest (missing client dist)\n" );
	exit( 1 );
}

if ( Webino_Dashboard_Module_Registry::module_package_is_complete( $client_slug, $client_manifest ) ) {
	fwrite( STDERR, "FAIL: incomplete package (missing client dist) should not pass validation\n" );
	exit( 1 );
}

webino_test_cleanup_module_dir( $client_slug );

fwrite( STDOUT, "OK: incomplete module packages correctly rejected\n" );
exit( 0 );
