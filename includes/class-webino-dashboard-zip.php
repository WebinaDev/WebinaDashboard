<?php
/**
 * Safe ZIP extraction (Zip Slip protection).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Extracts ZIP archives file-by-file with path traversal checks.
 */
final class Webino_Dashboard_Zip {

	/**
	 * @param string $zip_path Absolute path to ZIP file.
	 * @param string $dest     Destination directory.
	 * @return true|WP_Error
	 */
	public static function extract_to( $zip_path, $dest ) {
		if ( ! class_exists( 'ZipArchive' ) ) {
			return new WP_Error( 'zip', __( 'ZipArchive is not available on this server.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}

		$archive = new ZipArchive();
		if ( true !== $archive->open( $zip_path ) ) {
			return new WP_Error( 'zip', __( 'Could not open package ZIP.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}

		$result = self::safe_extract( $archive, $dest );
		$archive->close();
		return $result;
	}

	/**
	 * @param ZipArchive $archive Open archive.
	 * @param string     $dest    Destination directory.
	 * @return true|WP_Error
	 */
	public static function safe_extract( ZipArchive $archive, $dest ) {
		$dest = trailingslashit( (string) $dest );
		if ( ! wp_mkdir_p( $dest ) ) {
			return new WP_Error( 'zip_dest', __( 'Could not create extraction directory.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}

		$dest_real = realpath( $dest );
		if ( ! is_string( $dest_real ) || '' === $dest_real ) {
			return new WP_Error( 'zip_dest', __( 'Invalid extraction directory.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}
		$dest_real = trailingslashit( $dest_real );

		if ( $archive->numFiles < 1 ) {
			return new WP_Error( 'zip', __( 'Package ZIP is empty.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}

		for ( $i = 0; $i < $archive->numFiles; $i++ ) {
			$name = (string) $archive->getNameIndex( $i );
			if ( '' === $name ) {
				continue;
			}

			$target = self::resolve_safe_target( $name, $dest_real );
			if ( is_wp_error( $target ) ) {
				return $target;
			}

			if ( str_ends_with( str_replace( '\\', '/', $name ), '/' ) ) {
				if ( ! wp_mkdir_p( $target ) ) {
					return new WP_Error( 'zip', __( 'Could not create directory from ZIP entry.', 'webino-dashboard' ), array( 'status' => 500 ) );
				}
				continue;
			}

			$parent = dirname( $target );
			if ( ! wp_mkdir_p( $parent ) ) {
				return new WP_Error( 'zip', __( 'Could not create parent directory for ZIP entry.', 'webino-dashboard' ), array( 'status' => 500 ) );
			}

			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			$written = file_put_contents( $target, $archive->getFromIndex( $i ) );
			if ( false === $written ) {
				return new WP_Error( 'zip', __( 'Could not write ZIP entry to disk.', 'webino-dashboard' ), array( 'status' => 500 ) );
			}
		}

		return true;
	}

	/**
	 * @param string $entry     ZIP member path.
	 * @param string $dest_real Real destination root with trailing slash.
	 * @return string|WP_Error Absolute file path.
	 */
	private static function resolve_safe_target( $entry, $dest_real ) {
		$normalized = str_replace( '\\', '/', (string) $entry );
		$normalized = ltrim( $normalized, '/' );

		if ( '' === $normalized || str_contains( $normalized, '..' ) ) {
			return new WP_Error( 'zip_traversal', __( 'Unsafe path in ZIP archive.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$parts = explode( '/', $normalized );
		$built = rtrim( $dest_real, '/\\' );
		foreach ( $parts as $part ) {
			if ( '' === $part || '.' === $part ) {
				continue;
			}
			if ( '..' === $part ) {
				return new WP_Error( 'zip_traversal', __( 'Unsafe path in ZIP archive.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
			$built .= DIRECTORY_SEPARATOR . $part;
		}

		$dest_prefix = str_replace( '\\', '/', rtrim( $dest_real, '/\\' ) ) . '/';
		$built_norm  = str_replace( '\\', '/', $built );
		if ( ! str_starts_with( $built_norm . ( str_ends_with( $built_norm, '/' ) ? '' : '/' ), $dest_prefix ) && $built_norm !== rtrim( $dest_prefix, '/' ) ) {
			return new WP_Error( 'zip_traversal', __( 'ZIP entry escapes destination directory.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$resolved = realpath( $built );
		if ( is_string( $resolved ) && '' !== $resolved ) {
			$resolved_norm = str_replace( '\\', '/', $resolved );
			if ( ! str_starts_with( $resolved_norm . '/', $dest_prefix ) && $resolved_norm !== rtrim( $dest_prefix, '/' ) ) {
				return new WP_Error( 'zip_traversal', __( 'ZIP entry escapes destination directory.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
			return $resolved;
		}

		$parent_real = realpath( dirname( $built ) );
		if ( is_string( $parent_real ) && '' !== $parent_real ) {
			$parent_norm = str_replace( '\\', '/', trailingslashit( $parent_real ) );
			if ( ! str_starts_with( $parent_norm, $dest_prefix ) ) {
				return new WP_Error( 'zip_traversal', __( 'ZIP entry escapes destination directory.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
		}

		return $built;
	}
}
