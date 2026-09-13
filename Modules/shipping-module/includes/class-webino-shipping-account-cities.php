<?php
/**
 * Province/city/district selectors on My Account + classic WC order admin.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Webino_Shipping_Account_Cities {

	/**
	 * @return void
	 */
	public static function init() {
		add_filter( 'woocommerce_address_to_edit', array( __CLASS__, 'address_fields' ), 40, 2 );
		add_action( 'woocommerce_customer_save_address', array( __CLASS__, 'save_customer_district' ), 20, 2 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_account' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_admin_order' ) );
		add_action( 'woocommerce_admin_order_data_after_billing_address', array( __CLASS__, 'admin_order_fields' ), 20 );
		add_action( 'woocommerce_process_shop_order_meta', array( __CLASS__, 'save_admin_order' ), 40 );
		add_action( 'wp_ajax_webino_shipping_cities_search', array( __CLASS__, 'ajax_search' ) );
		add_action( 'wp_ajax_nopriv_webino_shipping_cities_search', array( __CLASS__, 'ajax_search' ) );
		add_action( 'wp_ajax_webino_shipping_cities_children', array( __CLASS__, 'ajax_children' ) );
		add_action( 'wp_ajax_nopriv_webino_shipping_cities_children', array( __CLASS__, 'ajax_children' ) );
	}

	/**
	 * @return void
	 */
	public static function ajax_search() {
		$q = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['q'] ) ) : '';
		$state = isset( $_GET['state'] ) ? (int) $_GET['state'] : 0;
		wp_send_json_success( array( 'items' => Webino_Shipping_Cities::search( $q, $state, 40 ) ) );
	}

	/**
	 * @return void
	 */
	public static function ajax_children() {
		$parent = isset( $_GET['parent'] ) ? (int) $_GET['parent'] : 0;
		wp_send_json_success( array( 'items' => Webino_Shipping_Cities::get_children( $parent ) ) );
	}

	/**
	 * @param array  $fields Fields.
	 * @param string $load_address billing|shipping.
	 * @return array
	 */
	public static function address_fields( $fields, $load_address = 'billing' ) {
		$type = ( 'shipping' === $load_address ) ? 'shipping' : 'billing';
		if ( isset( $fields[ $type . '_state' ] ) ) {
			$fields[ $type . '_state' ]['class'] = array_merge(
				(array) ( $fields[ $type . '_state' ]['class'] ?? array() ),
				array( 'webino-state-field' )
			);
		}
		if ( isset( $fields[ $type . '_city' ] ) ) {
			$fields[ $type . '_city' ]['type']    = 'select';
			$fields[ $type . '_city' ]['options'] = array( '' => '—' );
			$fields[ $type . '_city' ]['class']   = array_merge(
				(array) ( $fields[ $type . '_city' ]['class'] ?? array() ),
				array( 'webino-city-field', 'address-field' )
			);
		}
		$fields[ $type . '_district' ] = array(
			'label'    => __( 'محله', 'webino-dashboard' ),
			'required' => false,
			'class'    => array( 'form-row-wide', 'webino-district-field', 'address-field' ),
			'type'     => 'select',
			'options'  => array( '' => '—' ),
			'priority' => 65,
		);
		return $fields;
	}

	/**
	 * @param int    $user_id User.
	 * @param string $load_address Address type.
	 * @return void
	 */
	public static function save_customer_district( $user_id, $load_address ) {
		$type = ( 'shipping' === $load_address ) ? 'shipping' : 'billing';
		$key  = $type . '_district';
		if ( ! isset( $_POST[ $key ] ) ) {
			return;
		}
		$id = (int) wp_unslash( $_POST[ $key ] );
		update_user_meta( $user_id, $key . '_id', $id );
		if ( $id ) {
			$term = get_term( $id, Webino_Shipping_Cities::TAXONOMY );
			if ( $term && ! is_wp_error( $term ) ) {
				update_user_meta( $user_id, $key, $term->name );
			}
		}
	}

	/**
	 * @return void
	 */
	public static function enqueue_account() {
		if ( ! function_exists( 'is_account_page' ) || ! is_account_page() ) {
			return;
		}
		self::enqueue_city_script( 'jquery' );
	}

	/**
	 * @param string $hook Hook.
	 * @return void
	 */
	public static function enqueue_admin_order( $hook ) {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen ) {
			return;
		}
		$ok = in_array( $screen->id, array( 'shop_order', 'woocommerce_page_wc-orders' ), true );
		if ( ! $ok ) {
			return;
		}
		self::enqueue_city_script( 'jquery' );
	}

	/**
	 * @param string $dep Script handle dependency.
	 * @return void
	 */
	private static function enqueue_city_script( $dep ) {
		$states = Webino_Shipping_Cities::get_states();
		wp_add_inline_script(
			$dep,
			'window.webinoCityAjax=' . wp_json_encode(
				array(
					'url'    => admin_url( 'admin-ajax.php' ),
					'states' => $states,
				)
			) . ';'
			. <<<'JS'
jQuery(function($){
  function fillSelect($el, items, useId){
    if(!$el.length) return;
    var cur=$el.val();
    $el.empty().append($('<option/>',{value:'',text:'—'}));
    (items||[]).forEach(function(it){
      $el.append($('<option/>',{value:useId?String(it.id):(it.name||''),text:it.name}));
    });
    if(cur) $el.val(cur);
  }
  function findStateId(val){
    val=String(val||'').trim();
    if(!val) return 0;
    if(/^\d+$/.test(val)) return parseInt(val,10);
    var list=(window.webinoCityAjax&&window.webinoCityAjax.states)||[];
    for(var i=0;i<list.length;i++){
      var s=list[i];
      if(s.name===val) return s.id;
      if(String(s.slug).toLowerCase()===val.toLowerCase()) return s.id;
      if(('IR:'+String(s.slug).toUpperCase())===('IR:'+val.toUpperCase()) || ('IR:'+String(s.slug).toUpperCase())===val.toUpperCase()) return s.id;
    }
    return 0;
  }
  function loadChildren(parent, $target, useId){
    if(!parent){fillSelect($target,[], useId);return;}
    $.get(window.webinoCityAjax.url,{action:'webino_shipping_cities_children',parent:parent},function(res){
      if(res&&res.success) fillSelect($target,res.data.items||[], useId);
    });
  }
  $(document.body).on('change','select[name=webino_billing_state],.webino-state-select',function(){
    var $root=$(this).closest('.webino-admin-cities,form,div');
    loadChildren(parseInt($(this).val(),10)||0, $root.find('.webino-city-select,select[name=webino_billing_city]').first(), true);
    fillSelect($root.find('.webino-district-select,select[name=webino_billing_district]').first(), [], true);
  });
  $(document.body).on('change','select[name=webino_billing_city],.webino-city-select',function(){
    var $root=$(this).closest('.webino-admin-cities,form,div');
    loadChildren(parseInt($(this).val(),10)||0, $root.find('.webino-district-select,select[name=webino_billing_district]').first(), true);
  });
  $(document.body).on('change','#billing_state,#shipping_state,select[name=billing_state],select[name=shipping_state]',function(){
    var isShip=this.id.indexOf('shipping')===0 || (this.name||'').indexOf('shipping')===0;
    var sid=findStateId($(this).val());
    var $city=$(isShip?'#shipping_city':'#billing_city');
    var $dist=$(isShip?'#shipping_district':'#billing_district');
    loadChildren(sid,$city,false);
    fillSelect($dist,[],true);
  });
  $(document.body).on('change','#billing_city,#shipping_city,select[name=billing_city],select[name=shipping_city]',function(){
    var isShip=this.id.indexOf('shipping')===0 || (this.name||'').indexOf('shipping')===0;
    var $dist=$(isShip?'#shipping_district':'#billing_district');
    var name=$(this).val();
    if(!name){fillSelect($dist,[],true);return;}
    $.get(window.webinoCityAjax.url,{action:'webino_shipping_cities_search',q:name},function(res){
      var items=(res&&res.success&&res.data.items)||[];
      var hit=null;
      for(var i=0;i<items.length;i++){ if(items[i].type==='city'&&items[i].name===name){hit=items[i];break;} }
      if(!hit) hit=items[0];
      if(hit) loadChildren(hit.id,$dist,true);
    });
  });
});
JS
		);
	}

	/**
	 * @param WC_Order $order Order.
	 * @return void
	 */
	public static function admin_order_fields( $order ) {
		if ( ! is_a( $order, 'WC_Order' ) ) {
			return;
		}
		$states = Webino_Shipping_Cities::get_states();
		$state  = (int) $order->get_meta( '_billing_state_term_id' );
		$city   = (int) $order->get_meta( '_billing_city_term_id' );
		$dist   = (int) $order->get_meta( '_billing_district_id' );
		echo '<div class="webino-admin-cities" style="margin-top:12px;padding:10px;border:1px solid #ddd;border-radius:6px;">';
		echo '<p><strong>' . esc_html__( 'شهرهای وبینو', 'webino-dashboard' ) . '</strong></p>';
		echo '<p><label>' . esc_html__( 'استان', 'webino-dashboard' ) . '</label><br/><select name="webino_billing_state" class="webino-state-select" style="width:100%">';
		echo '<option value="">—</option>';
		foreach ( $states as $s ) {
			printf( '<option value="%d" %s>%s</option>', (int) $s['id'], selected( $state, (int) $s['id'], false ), esc_html( $s['name'] ) );
		}
		echo '</select></p>';
		echo '<p><label>' . esc_html__( 'شهر', 'webino-dashboard' ) . '</label><br/><select name="webino_billing_city" class="webino-city-select" style="width:100%">';
		echo '<option value="">—</option>';
		if ( $state ) {
			foreach ( Webino_Shipping_Cities::get_cities( $state ) as $c ) {
				printf( '<option value="%d" %s>%s</option>', (int) $c['id'], selected( $city, (int) $c['id'], false ), esc_html( $c['name'] ) );
			}
		}
		echo '</select></p>';
		echo '<p><label>' . esc_html__( 'محله', 'webino-dashboard' ) . '</label><br/><select name="webino_billing_district" class="webino-district-select" style="width:100%">';
		echo '<option value="">—</option>';
		if ( $city ) {
			foreach ( Webino_Shipping_Cities::get_districts( $city ) as $d ) {
				printf( '<option value="%d" %s>%s</option>', (int) $d['id'], selected( $dist, (int) $d['id'], false ), esc_html( $d['name'] ) );
			}
		}
		echo '</select></p></div>';
	}

	/**
	 * @param int $order_id Order.
	 * @return void
	 */
	public static function save_admin_order( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}
		$state = isset( $_POST['webino_billing_state'] ) ? (int) $_POST['webino_billing_state'] : 0;
		$city  = isset( $_POST['webino_billing_city'] ) ? (int) $_POST['webino_billing_city'] : 0;
		$dist  = isset( $_POST['webino_billing_district'] ) ? (int) $_POST['webino_billing_district'] : 0;
		if ( $state ) {
			$order->update_meta_data( '_billing_state_term_id', $state );
			$t = get_term( $state, Webino_Shipping_Cities::TAXONOMY );
			if ( $t && ! is_wp_error( $t ) ) {
				$order->set_billing_state( $t->name );
			}
		}
		if ( $city ) {
			$order->update_meta_data( '_billing_city_term_id', $city );
			$t = get_term( $city, Webino_Shipping_Cities::TAXONOMY );
			if ( $t && ! is_wp_error( $t ) ) {
				$order->set_billing_city( $t->name );
			}
		}
		if ( $dist ) {
			$order->update_meta_data( '_billing_district_id', $dist );
			$t = get_term( $dist, Webino_Shipping_Cities::TAXONOMY );
			if ( $t && ! is_wp_error( $t ) ) {
				$order->update_meta_data( '_billing_district', $t->name );
			}
		}
		$order->save();
	}
}
