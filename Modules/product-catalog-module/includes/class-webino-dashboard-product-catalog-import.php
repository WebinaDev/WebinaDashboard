<?php
/**
 * Import catalog item as WooCommerce draft product.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sideload image + create draft product.
 */
final class Webino_Dashboard_Product_Catalog_Import {

	/**
	 * @param array<string,mixed> $item Normalized catalog item (or partial).
	 * @return array{product_id:int,edit_url:string}|WP_Error
	 */
	public static function import( array $item ) {
		if ( ! class_exists( 'WooCommerce' ) || ! class_exists( 'WC_Product_Simple' ) ) {
			return new WP_Error( 'no_wc', __( 'Store module is not available.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$title = sanitize_text_field( (string) ( $item['title'] ?? '' ) );
		if ( '' === $title ) {
			return new WP_Error( 'invalid_item', __( 'Product title is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$barcode = Webino_Dashboard_Product_Catalog_Http::normalize_barcode( (string) ( $item['barcode'] ?? '' ) );
		$brand   = sanitize_text_field( (string) ( $item['brand'] ?? '' ) );
		$desc    = wp_kses_post( (string) ( $item['description'] ?? '' ) );
		$image   = esc_url_raw( (string) ( $item['image_url'] ?? '' ) );

		// Avoid duplicate SKU collision: if barcode SKU exists, skip sku or suffix.
		$sku = $barcode;
		if ( $sku && function_exists( 'wc_get_product_id_by_sku' ) ) {
			$existing = wc_get_product_id_by_sku( $sku );
			if ( $existing ) {
				$sku = $sku . '-' . wp_generate_password( 4, false, false );
			}
		}

		$p = new WC_Product_Simple();
		$p->set_name( $title );
		$p->set_status( 'draft' );
		if ( $desc ) {
			$p->set_description( $desc );
		}
		$short = $brand ? $brand : '';
		if ( $short ) {
			$p->set_short_description( $short );
		}
		if ( $sku ) {
			try {
				$p->set_sku( $sku );
			} catch ( Exception $e ) {
				// Ignore SKU errors; still create draft.
			}
		}
		$p->save();
		$pid = $p->get_id();
		if ( ! $pid ) {
			return new WP_Error( 'create_failed', __( 'Could not create product.', 'webino-dashboard' ), array( 'status' => 500 ) );
		}

		if ( $brand && taxonomy_exists( 'product_brand' ) ) {
			$term = term_exists( $brand, 'product_brand' );
			if ( ! $term ) {
				$term = wp_insert_term( $brand, 'product_brand' );
			}
			if ( ! is_wp_error( $term ) ) {
				$tid = is_array( $term ) ? (int) ( $term['term_id'] ?? 0 ) : (int) $term;
				if ( $tid > 0 ) {
					wp_set_object_terms( $pid, array( $tid ), 'product_brand', false );
				}
			}
		}

		if ( $barcode && class_exists( 'Webino_Dashboard_REST', false ) ) {
			// Rank Math GTIN via same path as product editor.
			update_post_meta( $pid, 'rank_math_snippet_product_gtin', $barcode );
		}

		if ( $image ) {
			$att_id = self::sideload_image( $image, $pid, $title );
			if ( $att_id && ! is_wp_error( $att_id ) ) {
				$p2 = wc_get_product( $pid );
				if ( $p2 ) {
					$p2->set_image_id( (int) $att_id );
					$p2->save();
				}
			}
		}

		$edit = '';
		if ( function_exists( 'admin_url' ) ) {
			// Dashboard SPA product editor path.
			$base = '';
			if ( class_exists( 'Webino_Dashboard_Plugin', false ) && method_exists( 'Webino_Dashboard_Plugin', 'dashboard_base_path' ) ) {
				$base = (string) Webino_Dashboard_Plugin::dashboard_base_path();
			}
			if ( '' === $base ) {
				$base = '/dashboard';
			}
			$edit = untrailingslashit( home_url( $base ) ) . '/shop/products/' . $pid;
		}

		return array(
			'product_id' => (int) $pid,
			'edit_url'   => $edit,
		);
	}

	/**
	 * @param string $url Image URL.
	 * @param int    $post_id Product id.
	 * @param string $desc Description.
	 * @return int|WP_Error Attachment id.
	 */
	private static function sideload_image( $url, $post_id, $desc = '' ) {
		if ( ! function_exists( 'download_url' ) || ! function_exists( 'media_handle_sideload' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';
		}
		$tmp = download_url( $url, 60 );
		if ( is_wp_error( $tmp ) ) {
			return $tmp;
		}
		$path = wp_parse_url( $url, PHP_URL_PATH );
		$name = $path ? basename( (string) $path ) : 'catalog-image.jpg';
		if ( ! preg_match( '/\.(jpe?g|png|gif|webp)$/i', $name ) ) {
			$name .= '.jpg';
		}
		$file_array = array(
			'name'     => sanitize_file_name( $name ),
			'tmp_name' => $tmp,
		);
		$id = media_handle_sideload( $file_array, (int) $post_id, $desc );
		if ( is_wp_error( $id ) ) {
			@unlink( $tmp ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			return $id;
		}
		return (int) $id;
	}
}
