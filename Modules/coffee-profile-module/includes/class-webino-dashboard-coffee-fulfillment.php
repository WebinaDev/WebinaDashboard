<?php
/**
 * Storefront grind/roast fulfillment (cart meta, not WC variations).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Required grind/roast picks on single-product add-to-cart.
 */
class Webino_Dashboard_Coffee_Fulfillment {

	const CART_GRIND = 'webino_coffee_grind';
	const CART_ROAST = 'webino_coffee_roast';

	/**
	 * @return void
	 */
	public static function init() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}
		add_action( 'woocommerce_after_variations_table', array( __CLASS__, 'render_picker' ), 10 );
		add_action( 'woocommerce_before_add_to_cart_button', array( __CLASS__, 'render_picker_fallback' ), 7 );
		add_filter( 'woocommerce_add_to_cart_validation', array( __CLASS__, 'validate_add_to_cart' ), 20, 5 );
		add_filter( 'woocommerce_add_cart_item_data', array( __CLASS__, 'add_cart_item_data' ), 20, 4 );
		add_filter( 'woocommerce_get_cart_item_from_session', array( __CLASS__, 'cart_item_from_session' ), 20, 2 );
		add_filter( 'woocommerce_get_item_data', array( __CLASS__, 'cart_item_data_display' ), 20, 2 );
		add_action( 'woocommerce_checkout_create_order_line_item', array( __CLASS__, 'order_line_item' ), 20, 4 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
	}

	/**
	 * @var bool
	 */
	private static $picker_rendered = false;

	/**
	 * @param int $product_id Product ID.
	 * @return array<string,mixed>
	 */
	public static function product_fulfillment( $product_id ) {
		$product_id = (int) $product_id;
		$empty      = array(
			'grind_enabled' => false,
			'roast_enabled' => false,
			'grind'         => null,
			'roast'         => null,
		);
		if ( $product_id <= 0 ) {
			return $empty;
		}
		$profile = Webino_Dashboard_Coffee_Profile::get_profile( $product_id );
		return array(
			'grind_enabled' => ! empty( $profile['grind_enabled'] ),
			'roast_enabled' => ! empty( $profile['roast_enabled'] ),
			'grind'         => Webino_Dashboard_Coffee_Profile::fulfillment_axis_config( $product_id, $profile, 'grind' ),
			'roast'         => Webino_Dashboard_Coffee_Profile::fulfillment_axis_config( $product_id, $profile, 'roast' ),
		);
	}

	/**
	 * @param int $product_id Product ID.
	 * @return bool
	 */
	public static function product_needs_picker( $product_id ) {
		$cfg = self::product_fulfillment( $product_id );
		return ( ! empty( $cfg['grind_enabled'] ) && ! empty( $cfg['grind'] ) )
			|| ( ! empty( $cfg['roast_enabled'] ) && ! empty( $cfg['roast'] ) );
	}

	/**
	 * @return void
	 */
	public static function render_picker() {
		self::render_picker_inner( false );
	}

	/**
	 * Fallback when theme does not output variations table.
	 *
	 * @return void
	 */
	public static function render_picker_fallback() {
		self::render_picker_inner( true );
	}

	/**
	 * @param bool $fallback_only Only render if primary hook did not run.
	 * @return void
	 */
	private static function render_picker_inner( $fallback_only ) {
		if ( $fallback_only && self::$picker_rendered ) {
			return;
		}
		if ( ! is_product() ) {
			return;
		}
		global $product;
		if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
			return;
		}
		$parent_id = $product->is_type( 'variation' ) ? (int) $product->get_parent_id() : (int) $product->get_id();
		$cfg       = self::product_fulfillment( $parent_id );
		if ( ! self::product_needs_picker( $parent_id ) ) {
			return;
		}
		self::$picker_rendered = true;
		$rows                  = self::picker_rows_html( $cfg, $product );
		if ( '' === $rows ) {
			return;
		}
		if ( $fallback_only ) {
			echo '<div class="wcf-fulfillment wcf-fulfillment--fallback">';
			echo '<table class="variations wcf-variations" cellspacing="0" role="presentation"><tbody>';
			echo $rows; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo '</tbody></table></div>';
			return;
		}
		echo '<table class="variations wcf-variations" cellspacing="0" role="presentation"><tbody class="wcf-fulfillment">';
		echo $rows; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo '</tbody></table>';
	}

	/**
	 * @param array<string,mixed> $cfg     Fulfillment config.
	 * @param WC_Product          $product Product.
	 * @return string
	 */
	private static function picker_rows_html( $cfg, $product ) {
		$html = '';
		foreach ( array( 'grind', 'roast' ) as $kind ) {
			if ( empty( $cfg[ $kind . '_enabled' ] ) || empty( $cfg[ $kind ] ) || ! is_array( $cfg[ $kind ] ) ) {
				continue;
			}
			$axis = $cfg[ $kind ];
			$html .= self::picker_row_html( $kind, $axis, $product );
		}
		return $html;
	}

	/**
	 * @param string              $kind    grind|roast.
	 * @param array<string,mixed> $axis    Axis config.
	 * @param WC_Product          $product Product.
	 * @return string
	 */
	private static function picker_row_html( $kind, $axis, $product ) {
		$label    = (string) ( $axis['label'] ?? '' );
		$taxonomy = (string) ( $axis['taxonomy'] ?? '' );
		$options  = isset( $axis['options'] ) && is_array( $axis['options'] ) ? $axis['options'] : array();
		$selected = (string) ( $axis['default_slug'] ?? '' );
		$name     = (string) ( $axis['select_name'] ?? '' );
		if ( '' === $label || '' === $name || array() === $options ) {
			return '';
		}
		$swatches = '';
		if ( class_exists( 'Webino_Dashboard_Variation_Swatches', false ) ) {
			$swatches = Webino_Dashboard_Variation_Swatches::render_attribute_swatches(
				$taxonomy,
				$options,
				$selected,
				$name,
				$product,
				$name
			);
		}
		if ( '' === $swatches ) {
			$swatches = self::plain_select_html( $options, $axis['terms'] ?? array(), $selected, $name );
		}
		ob_start();
		?>
		<tr class="wcf-field" data-wcf-field="<?php echo esc_attr( $kind ); ?>">
			<th class="label">
				<label for="<?php echo esc_attr( $name ); ?>"><?php echo esc_html( $label ); ?> <abbr class="required" title="<?php echo esc_attr__( 'required', 'woocommerce' ); ?>">*</abbr></label>
			</th>
			<td class="value">
				<?php echo $swatches; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</td>
		</tr>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * @param array<int,string>              $options  Slugs.
	 * @param array<int,array<string,mixed>> $terms    Term rows.
	 * @param string                         $selected Selected slug.
	 * @param string                         $name     Field name.
	 * @return string
	 */
	private static function plain_select_html( $options, $terms, $selected, $name ) {
		ob_start();
		?>
		<select id="<?php echo esc_attr( $name ); ?>" name="<?php echo esc_attr( $name ); ?>" class="wcf-plain-select">
			<option value=""><?php echo esc_html__( 'Choose an option', 'woocommerce' ); ?></option>
			<?php foreach ( $options as $slug ) : ?>
				<?php
				$slug  = sanitize_title( (string) $slug );
				$label = Webino_Dashboard_Coffee_Profile::label_for_term_slug( $terms, $slug );
				if ( '' === $slug || '' === $label ) {
					continue;
				}
				?>
				<option value="<?php echo esc_attr( $slug ); ?>" <?php selected( $selected, $slug ); ?>><?php echo esc_html( $label ); ?></option>
			<?php endforeach; ?>
		</select>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * @param bool  $passed     Passed.
	 * @param int   $product_id Product ID.
	 * @param int   $quantity   Quantity.
	 * @param int   $variation_id Variation ID.
	 * @param array $variations Variation attrs.
	 * @return bool
	 */
	public static function validate_add_to_cart( $passed, $product_id, $quantity, $variation_id = 0, $variations = array() ) {
		unset( $quantity, $variation_id, $variations );
		if ( ! $passed ) {
			return false;
		}
		$parent_id = self::resolve_parent_id( (int) $product_id );
		$cfg       = self::product_fulfillment( $parent_id );
		foreach ( array(
			'grind' => __( 'لطفاً میزان آسیاب را انتخاب کنید.', 'webino-dashboard' ),
			'roast' => __( 'لطفاً درجه رست را انتخاب کنید.', 'webino-dashboard' ),
		) as $kind => $message ) {
			if ( empty( $cfg[ $kind . '_enabled' ] ) || empty( $cfg[ $kind ] ) || ! is_array( $cfg[ $kind ] ) ) {
				continue;
			}
			$field = 'grind' === $kind ? 'webino_coffee_grind' : 'webino_coffee_roast';
			$slug  = sanitize_title( (string) ( wp_unslash( $_POST[ $field ] ?? '' ) ) );
			$terms = isset( $cfg[ $kind ]['terms'] ) && is_array( $cfg[ $kind ]['terms'] ) ? $cfg[ $kind ]['terms'] : array();
			if ( '' === $slug || '' === Webino_Dashboard_Coffee_Profile::label_for_term_slug( $terms, $slug ) ) {
				wc_add_notice( $message, 'error' );
				return false;
			}
		}
		return true;
	}

	/**
	 * @param array<string,mixed> $cart_item_data Cart item data.
	 * @param int                 $product_id     Product ID.
	 * @param int                 $variation_id   Variation ID.
	 * @param int                 $quantity       Quantity.
	 * @return array<string,mixed>
	 */
	public static function add_cart_item_data( $cart_item_data, $product_id, $variation_id, $quantity ) {
		unset( $variation_id, $quantity );
		$parent_id = self::resolve_parent_id( (int) $product_id );
		$cfg       = self::product_fulfillment( $parent_id );
		$extra     = array();
		foreach ( array(
			self::CART_GRIND => 'grind',
			self::CART_ROAST => 'roast',
		) as $cart_key => $kind ) {
			if ( empty( $cfg[ $kind . '_enabled' ] ) || empty( $cfg[ $kind ] ) || ! is_array( $cfg[ $kind ] ) ) {
				continue;
			}
			$field = 'grind' === $kind ? 'webino_coffee_grind' : 'webino_coffee_roast';
			$slug  = sanitize_title( (string) ( wp_unslash( $_POST[ $field ] ?? '' ) ) );
			$terms = isset( $cfg[ $kind ]['terms'] ) && is_array( $cfg[ $kind ]['terms'] ) ? $cfg[ $kind ]['terms'] : array();
			$label = Webino_Dashboard_Coffee_Profile::label_for_term_slug( $terms, $slug );
			if ( '' === $slug || '' === $label ) {
				continue;
			}
			$extra[ $cart_key ] = array(
				'id'    => $slug,
				'label' => $label,
			);
		}
		if ( array() === $extra ) {
			return $cart_item_data;
		}
		$cart_item_data = array_merge( $cart_item_data, $extra );
		$cart_item_data['unique_key'] = md5( wp_json_encode( $extra ) . ( $cart_item_data['unique_key'] ?? '' ) );
		return $cart_item_data;
	}

	/**
	 * @param int $product_id Product ID.
	 * @return int
	 */
	private static function resolve_parent_id( $product_id ) {
		$product = wc_get_product( $product_id );
		if ( $product && $product->is_type( 'variation' ) ) {
			return (int) $product->get_parent_id();
		}
		return (int) $product_id;
	}

	/**
	 * @param array<string,mixed> $cart_item Item.
	 * @param array<string,mixed> $values    Session values.
	 * @return array<string,mixed>
	 */
	public static function cart_item_from_session( $cart_item, $values ) {
		foreach ( array( self::CART_GRIND, self::CART_ROAST ) as $key ) {
			if ( isset( $values[ $key ] ) && is_array( $values[ $key ] ) ) {
				$cart_item[ $key ] = $values[ $key ];
			}
		}
		return $cart_item;
	}

	/**
	 * @param array<int,array<string,mixed>> $item_data Item data.
	 * @param array<string,mixed>            $cart_item Cart item.
	 * @return array<int,array<string,mixed>>
	 */
	public static function cart_item_data_display( $item_data, $cart_item ) {
		$parent_id = isset( $cart_item['product_id'] ) ? (int) $cart_item['product_id'] : 0;
		$cfg       = self::product_fulfillment( $parent_id );
		if ( ! empty( $cart_item[ self::CART_GRIND ]['label'] ) ) {
			$key = ! empty( $cfg['grind']['label'] ) ? (string) $cfg['grind']['label'] : __( 'میزان آسیاب', 'webino-dashboard' );
			$item_data[] = array(
				'key'   => $key,
				'value' => sanitize_text_field( (string) $cart_item[ self::CART_GRIND ]['label'] ),
			);
		}
		if ( ! empty( $cart_item[ self::CART_ROAST ]['label'] ) ) {
			$key = ! empty( $cfg['roast']['label'] ) ? (string) $cfg['roast']['label'] : __( 'درجه رست', 'webino-dashboard' );
			$item_data[] = array(
				'key'   => $key,
				'value' => sanitize_text_field( (string) $cart_item[ self::CART_ROAST ]['label'] ),
			);
		}
		return $item_data;
	}

	/**
	 * @param WC_Order_Item_Product $item          Line item.
	 * @param string                $cart_item_key Cart key.
	 * @param array<string,mixed>   $values        Cart values.
	 * @param WC_Order              $order         Order.
	 * @return void
	 */
	public static function order_line_item( $item, $cart_item_key, $values, $order ) {
		unset( $cart_item_key, $order );
		$product_id = $item->get_product_id();
		$cfg        = self::product_fulfillment( (int) $product_id );
		if ( ! empty( $values[ self::CART_GRIND ]['label'] ) ) {
			$key = ! empty( $cfg['grind']['label'] ) ? (string) $cfg['grind']['label'] : __( 'میزان آسیاب', 'webino-dashboard' );
			$item->add_meta_data( $key, sanitize_text_field( (string) $values[ self::CART_GRIND ]['label'] ), true );
		}
		if ( ! empty( $values[ self::CART_ROAST ]['label'] ) ) {
			$key = ! empty( $cfg['roast']['label'] ) ? (string) $cfg['roast']['label'] : __( 'درجه رست', 'webino-dashboard' );
			$item->add_meta_data( $key, sanitize_text_field( (string) $values[ self::CART_ROAST ]['label'] ), true );
		}
	}

	/**
	 * @return void
	 */
	public static function enqueue() {
		if ( ! is_product() ) {
			return;
		}
		global $product;
		if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
			return;
		}
		$parent_id = $product->is_type( 'variation' ) ? (int) $product->get_parent_id() : (int) $product->get_id();
		if ( ! self::product_needs_picker( $parent_id ) ) {
			return;
		}
		if ( class_exists( 'Webino_Dashboard_Variation_Swatches', false ) ) {
			Webino_Dashboard_Variation_Swatches::enqueue();
		}
		$base = dirname( __DIR__ ) . '/public/fulfillment/';
		$css  = $base . 'coffee-fulfillment.css';
		$js   = $base . 'coffee-fulfillment.js';
		if ( ! is_readable( $css ) || ! is_readable( $js ) ) {
			return;
		}
		$url_base = defined( 'WEBINO_DASHBOARD_FILE' )
			? plugins_url( 'Modules/coffee-profile-module/public/fulfillment/', WEBINO_DASHBOARD_FILE )
			: plugins_url( 'public/fulfillment/', dirname( __DIR__ ) . '/bootstrap.php' );
		wp_enqueue_style(
			'webino-coffee-fulfillment',
			$url_base . 'coffee-fulfillment.css',
			array( 'webino-variation-swatches' ),
			(string) filemtime( $css )
		);
		wp_enqueue_script(
			'webino-coffee-fulfillment',
			$url_base . 'coffee-fulfillment.js',
			array( 'jquery' ),
			(string) filemtime( $js ),
			true
		);
	}
}
