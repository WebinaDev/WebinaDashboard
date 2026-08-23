<?php
/**
 * Named presets of WooCommerce global attributes (no term values).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * CRUD for attribute groups stored in a site option.
 */
final class Webino_Dashboard_Attribute_Groups {

	const OPTION = 'webino_dashboard_attribute_groups';

	/**
	 * @return array<int,array{id:string,name:string,attribute_ids:array<int,int>}>
	 */
	public static function all() {
		$stored = get_option( self::OPTION, array() );
		if ( ! is_array( $stored ) ) {
			return array();
		}
		$out = array();
		foreach ( $stored as $row ) {
			$normalized = self::normalize_row( $row );
			if ( $normalized ) {
				$out[] = $normalized;
			}
		}
		return $out;
	}

	/**
	 * @param string $id Group id.
	 * @return array{id:string,name:string,attribute_ids:array<int,int>}|null
	 */
	public static function get( $id ) {
		$id = sanitize_key( (string) $id );
		if ( '' === $id ) {
			return null;
		}
		foreach ( self::all() as $row ) {
			if ( $row['id'] === $id ) {
				return $row;
			}
		}
		return null;
	}

	/**
	 * @param string            $name Name.
	 * @param array<int,mixed> $ids Attribute ids.
	 * @return array{id:string,name:string,attribute_ids:array<int,int>}|WP_Error
	 */
	public static function create( $name, array $ids ) {
		$name = sanitize_text_field( (string) $name );
		if ( '' === $name ) {
			return new WP_Error( 'invalid_name', __( 'Group name is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$row = array(
			'id'            => self::new_id(),
			'name'          => $name,
			'attribute_ids' => self::sanitize_attribute_ids( $ids ),
		);
		$all   = self::all();
		$all[] = $row;
		self::save( $all );
		return $row;
	}

	/**
	 * @param string               $id Group id.
	 * @param array<string,mixed> $input Patch.
	 * @return array{id:string,name:string,attribute_ids:array<int,int>}|WP_Error
	 */
	public static function update( $id, array $input ) {
		$existing = self::get( $id );
		if ( ! $existing ) {
			return new WP_Error( 'not_found', __( 'Attribute group not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		if ( array_key_exists( 'name', $input ) ) {
			$name = sanitize_text_field( (string) $input['name'] );
			if ( '' === $name ) {
				return new WP_Error( 'invalid_name', __( 'Group name is required.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
			$existing['name'] = $name;
		}
		if ( array_key_exists( 'attribute_ids', $input ) ) {
			$ids = is_array( $input['attribute_ids'] ) ? $input['attribute_ids'] : array();
			$existing['attribute_ids'] = self::sanitize_attribute_ids( $ids );
		}
		$all = self::all();
		foreach ( $all as $i => $row ) {
			if ( $row['id'] === $existing['id'] ) {
				$all[ $i ] = $existing;
				break;
			}
		}
		self::save( $all );
		return $existing;
	}

	/**
	 * @param string $id Group id.
	 * @return true|WP_Error
	 */
	public static function delete( $id ) {
		$existing = self::get( $id );
		if ( ! $existing ) {
			return new WP_Error( 'not_found', __( 'Attribute group not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}
		$all = array();
		foreach ( self::all() as $row ) {
			if ( $row['id'] !== $existing['id'] ) {
				$all[] = $row;
			}
		}
		self::save( $all );
		return true;
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function rest_list( $request ) {
		unset( $request );
		return new WP_REST_Response( array( 'items' => self::all() ) );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_create( $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = $request->get_params();
		}
		$name = is_array( $body ) ? ( $body['name'] ?? '' ) : '';
		$ids  = is_array( $body ) && isset( $body['attribute_ids'] ) && is_array( $body['attribute_ids'] )
			? $body['attribute_ids']
			: array();
		$row  = self::create( $name, $ids );
		if ( is_wp_error( $row ) ) {
			return $row;
		}
		return new WP_REST_Response( $row, 201 );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_patch( $request ) {
		$id   = sanitize_key( (string) $request['id'] );
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = $request->get_params();
		}
		if ( ! is_array( $body ) ) {
			$body = array();
		}
		$row = self::update( $id, $body );
		if ( is_wp_error( $row ) ) {
			return $row;
		}
		return new WP_REST_Response( $row );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_delete( $request ) {
		$id  = sanitize_key( (string) $request['id'] );
		$res = self::delete( $id );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * @param mixed $row Raw row.
	 * @return array{id:string,name:string,attribute_ids:array<int,int>}|null
	 */
	private static function normalize_row( $row ) {
		if ( ! is_array( $row ) ) {
			return null;
		}
		$id = sanitize_key( (string) ( $row['id'] ?? '' ) );
		if ( '' === $id ) {
			return null;
		}
		$name = sanitize_text_field( (string) ( $row['name'] ?? '' ) );
		$ids  = isset( $row['attribute_ids'] ) && is_array( $row['attribute_ids'] ) ? $row['attribute_ids'] : array();
		return array(
			'id'            => $id,
			'name'          => $name,
			'attribute_ids' => self::sanitize_attribute_ids( $ids, false ),
		);
	}

	/**
	 * @param array<int,mixed> $ids Raw ids.
	 * @param bool             $verify_wc When true, drop ids that are not WC attributes.
	 * @return array<int,int>
	 */
	private static function sanitize_attribute_ids( array $ids, $verify_wc = true ) {
		$out = array();
		foreach ( $ids as $id ) {
			$id = (int) $id;
			if ( $id < 1 || isset( $out[ $id ] ) ) {
				continue;
			}
			if ( $verify_wc && function_exists( 'wc_get_attribute' ) && ! wc_get_attribute( $id ) ) {
				continue;
			}
			$out[ $id ] = $id;
		}
		return array_values( $out );
	}

	/**
	 * @return string
	 */
	private static function new_id() {
		return 'ag_' . strtolower( wp_generate_password( 10, false, false ) );
	}

	/**
	 * @param array<int,array{id:string,name:string,attribute_ids:array<int,int>}> $rows Rows.
	 * @return void
	 */
	private static function save( array $rows ) {
		update_option( self::OPTION, array_values( $rows ), false );
	}
}
