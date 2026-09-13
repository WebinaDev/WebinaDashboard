<?php
/**
 * District field on checkout from webino_state_city taxonomy.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Webino_Shipping_Checkout_District {

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'woocommerce_checkout_fields', array( __CLASS__, 'fields' ), 40 );
		add_action( 'woocommerce_checkout_update_order_meta', array( __CLASS__, 'save' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'assets' ) );
	}

	/**
	 * @return void
	 */
	public static function assets() {
		if ( ! function_exists( 'is_checkout' ) || ! is_checkout() ) {
			return;
		}
		$states = class_exists( 'Webino_Shipping_Cities', false ) ? Webino_Shipping_Cities::get_states() : array();
		$map = array();
		foreach ( $states as $st ) {
			foreach ( Webino_Shipping_Cities::get_cities( $st['id'] ) as $city ) {
				$districts = Webino_Shipping_Cities::get_districts( $city['id'] );
				if ( $districts ) {
					$map[ $city['name'] ] = array_map(
						static function ( $d ) {
							return array( 'id' => $d['id'], 'name' => $d['name'] );
						},
						$districts
					);
				}
			}
		}
		$js = 'window.webinoDistricts=' . wp_json_encode( $map ) . ';'
			. 'jQuery(function($){'
			. 'function fill(citySel,distSel){'
			. 'var city=$(citySel).val();'
			. 'var list=(window.webinoDistricts&&window.webinoDistricts[city])||[];'
			. 'var $el=$(distSel);'
			. '$el.empty().append(\'<option value="">—</option>\');'
			. 'list.forEach(function(x){$el.append($(\'<option/>\',{value:x.id,text:x.name}));});'
			. '}'
			. '$(document.body).on(\'change\',\'#billing_city,#shipping_city\',function(){'
			. 'var isShip=this.id.indexOf(\'shipping\')===0;'
			. 'fill(isShip?\'#shipping_city\':\'#billing_city\',isShip?\'#shipping_district\':\'#billing_district\');'
			. '});'
			. '});';
		wp_add_inline_script( 'jquery', $js );
	}

	/**
	 * @param array $fields Fields.
	 * @return array
	 */
	public static function fields( $fields ) {
		$district = array(
			'type'     => 'select',
			'label'    => __( 'محله', 'webino-dashboard' ),
			'required' => false,
			'class'    => array( 'form-row-wide', 'address-field' ),
			'options'  => array( '' => '—' ),
			'priority' => 65,
		);
		$fields['billing']['billing_district'] = $district;
		$fields['shipping']['shipping_district'] = $district;
		return $fields;
	}

	/**
	 * @param int $order_id Order.
	 * @return void
	 */
	public static function save( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}
		foreach ( array( 'billing', 'shipping' ) as $type ) {
			$key = $type . '_district';
			if ( ! isset( $_POST[ $key ] ) ) {
				continue;
			}
			$id = (int) wp_unslash( $_POST[ $key ] );
			$order->update_meta_data( '_' . $type . '_district_id', $id );
			if ( $id && class_exists( 'Webino_Shipping_Cities', false ) ) {
				$term = get_term( $id, Webino_Shipping_Cities::TAXONOMY );
				if ( $term && ! is_wp_error( $term ) ) {
					$order->update_meta_data( '_' . $type . '_district', $term->name );
				}
			}
		}
		$order->save();
	}
}
