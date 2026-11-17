<?php
/**
 * Province/city selectors on My Account + city/district picker inside the classic WC order admin screen.
 * Note: no district/محله field is exposed to customers (checkout or address book).
 * Storefront customer hooks stay inactive when the Cities shipping section is OFF.
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
		add_filter( 'woocommerce_checkout_fields', array( __CLASS__, 'checkout_fields' ), 30 );
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
		$q     = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['q'] ) ) : '';
		$state = isset( $_GET['state'] ) ? (int) $_GET['state'] : 0;
		wp_send_json_success( array( 'items' => Webino_Shipping_Cities::search( $q, $state, 40 ) ) );
	}

	/**
	 * @return void
	 */
	public static function ajax_children() {
		$parent = isset( $_GET['parent'] ) ? (int) $_GET['parent'] : 0;
		if ( $parent > 0 ) {
			Webino_Shipping_Cities::ensure_state_cities_seeded( $parent );
		}
		wp_send_json_success( array( 'items' => Webino_Shipping_Cities::get_children( $parent ) ) );
	}

	/**
	 * Convert My Account city inputs into dropdowns when Cities section is enabled.
	 *
	 * @param array  $fields Fields.
	 * @param string $load_address billing|shipping.
	 * @return array
	 */
	public static function address_fields( $fields, $load_address = 'billing' ) {
		if ( ! Webino_Shipping_Cities::is_enabled() ) {
			return $fields;
		}
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
		return $fields;
	}

	/**
	 * Convert Checkout city inputs into dropdowns when Cities section is enabled (unless Tapin owns checkout).
	 *
	 * @param array $fields Checkout fields.
	 * @return array
	 */
	public static function checkout_fields( $fields ) {
		if ( ! Webino_Shipping_Cities::is_enabled() ) {
			return $fields;
		}
		if ( class_exists( 'Webino_Tapin_Settings', false ) && Webino_Tapin_Settings::is_enabled()
			&& class_exists( 'Webino_Tapin_Locations', false ) && Webino_Tapin_Locations::is_available() ) {
			return $fields;
		}
		foreach ( array( 'billing', 'shipping' ) as $type ) {
			if ( isset( $fields[ $type ][ $type . '_state' ] ) ) {
				$fields[ $type ][ $type . '_state' ]['class'] = array_merge(
					(array) ( $fields[ $type ][ $type . '_state' ]['class'] ?? array() ),
					array( 'webino-state-field' )
				);
			}
			if ( isset( $fields[ $type ][ $type . '_city' ] ) ) {
				$fields[ $type ][ $type . '_city' ]['type']    = 'select';
				$fields[ $type ][ $type . '_city' ]['options'] = array( '' => '—' );
				$fields[ $type ][ $type . '_city' ]['class']   = array_merge(
					(array) ( $fields[ $type ][ $type . '_city' ]['class'] ?? array() ),
					array( 'webino-city-field', 'address-field' )
				);
			}
		}
		return $fields;
	}

	/**
	 * @return void
	 */
	public static function enqueue_account() {
		if ( ! Webino_Shipping_Cities::is_enabled() ) {
			return;
		}
		$on_account  = function_exists( 'is_account_page' ) && is_account_page();
		$on_checkout = function_exists( 'is_checkout' ) && is_checkout();
		if ( ! $on_account && ! $on_checkout ) {
			return;
		}
		if ( $on_checkout && class_exists( 'Webino_Tapin_Settings', false ) && Webino_Tapin_Settings::is_enabled()
			&& class_exists( 'Webino_Tapin_Locations', false ) && Webino_Tapin_Locations::is_available() ) {
			return;
		}
		self::enqueue_city_script( 'jquery' );
	}

	/**
	 * @param string $hook Hook.
	 * @return void
	 */
	public static function enqueue_admin_order( $hook ) {
		unset( $hook );
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
		$states  = Webino_Shipping_Cities::get_states();
		$aliases = Webino_Shipping_Cities::wc_to_state_key_map();
		wp_add_inline_script(
			$dep,
			'window.webinoCityAjax=' . wp_json_encode(
				array(
					'url'     => admin_url( 'admin-ajax.php' ),
					'states'  => $states,
					'aliases' => $aliases,
				)
			) . ';'
			. <<<'JS'
jQuery(function($){
  function norm(v){
    return String(v||'').replace(/[\u200C\u00A0]/g,' ').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,' ').trim();
  }
  function fillSelect($el, items, useId, preferred){
    if(!$el.length) return;
    var cur=preferred!==undefined&&preferred!==''?preferred:$el.val();
    $el.empty().append($('<option/>',{value:'',text:'—'}));
    (items||[]).forEach(function(it){
      $el.append($('<option/>',{value:useId?String(it.id):(it.name||''),text:it.name}));
    });
    if(cur){
      $el.val(cur);
      if(!$el.val()&&!useId){
        var curN=norm(cur);
        $el.find('option').each(function(){
          if(norm($(this).val())===curN){ $el.val($(this).val()); return false; }
        });
      }
    }
  }
  function findStateId(val, labelText){
    val=String(val||'').trim();
    if(!val && !labelText) return 0;
    if(/^\d+$/.test(val)) return parseInt(val,10);
    var cfg=window.webinoCityAjax||{};
    var list=cfg.states||[];
    var aliases=cfg.aliases||{};
    var clean=val.replace(/^IR:/i,'').toUpperCase();
    var mapped=aliases[clean]||clean;
    var labelN=norm(labelText||'');
    var valN=norm(val);
    for(var i=0;i<list.length;i++){
      var s=list[i];
      var slugU=String(s.slug||'').toUpperCase();
      if(slugU===mapped || slugU===clean) return s.id;
      var sN=norm(s.name);
      if(sN===valN || (labelN && sN===labelN)) return s.id;
    }
    return 0;
  }
  function loadChildren(parent, $target, useId, preferred){
    if(!parent){fillSelect($target,[], useId, preferred);return;}
    $.get(window.webinoCityAjax.url,{action:'webino_shipping_cities_children',parent:parent},function(res){
      if(res&&res.success) fillSelect($target,res.data.items||[], useId, preferred);
    });
  }
  function syncGroup(prefix){
    var $state=$('#'+prefix+'_state,select[name='+prefix+'_state]').first();
    var $city=$('#'+prefix+'_city').first();
    if(!$state.length||!$city.length) return;
    var lbl=$state.is('select')?$state.find('option:selected').text():'';
    var sid=findStateId($state.val(), lbl);
    var pref=$city.attr('data-value')||$city.val()||'';
    loadChildren(sid,$city,false,pref);
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
    var isShip=(this.id||'').indexOf('shipping')===0 || (this.name||'').indexOf('shipping')===0;
    syncGroup(isShip?'shipping':'billing');
  });
  $(document.body).on('updated_checkout country_to_state_changed',function(){
    syncGroup('billing');
    syncGroup('shipping');
  });
  syncGroup('billing');
  syncGroup('shipping');
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
