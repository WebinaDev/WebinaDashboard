<?php
/**
 * Custom coffee blend builder (catalog, quote, cart, shortcode).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Personal coffee blend form + virtual cart line.
 */
class Webino_Dashboard_Coffee_Blend {

	const OPTION_KEY = 'webino_coffee_blend_settings';
	const CART_KEY   = 'webino_coffee_blend';

	/**
	 * @return void
	 */
	public static function init() {
		add_shortcode( 'webino_coffee_blend', array( __CLASS__, 'shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
		add_filter( 'woocommerce_add_cart_item_data', array( __CLASS__, 'add_cart_item_data' ), 20, 3 );
		add_filter( 'woocommerce_get_cart_item_from_session', array( __CLASS__, 'cart_item_from_session' ), 20, 2 );
		add_filter( 'woocommerce_get_item_data', array( __CLASS__, 'cart_item_data_display' ), 10, 2 );
		add_filter( 'woocommerce_cart_item_name', array( __CLASS__, 'cart_item_name' ), 10, 3 );
		add_filter( 'woocommerce_cart_item_permalink', array( __CLASS__, 'cart_item_permalink' ), 10, 3 );
		add_action( 'woocommerce_before_calculate_totals', array( __CLASS__, 'apply_cart_price' ), 99, 1 );
		add_action( 'woocommerce_checkout_create_order_line_item', array( __CLASS__, 'order_line_item' ), 20, 4 );
		add_action( 'wc_ajax_webino_coffee_blend_add', array( __CLASS__, 'ajax_add_to_cart' ) );
		add_action( 'wp_ajax_webino_coffee_blend_add', array( __CLASS__, 'ajax_add_to_cart' ) );
		add_action( 'wp_ajax_nopriv_webino_coffee_blend_add', array( __CLASS__, 'ajax_add_to_cart' ) );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function default_settings() {
		return array(
			'source'               => 'profile',
			'category_ids'         => array(),
			'product_ids'          => array(),
			'min_beans'            => 2,
			'max_beans'            => 4,
			'default_mode'         => 'both',
			'price_basis'          => 'per_kg',
			'default_pack_weight_g'=> 1000,
			'holder_product_id'    => 0,
			'robusta_product_id'   => 0,
			'arabica_product_id'   => 0,
			'grind_fee'            => 0,
			'weights'              => array( 250, 500, 1000 ),
			'roasts'               => array(
				array(
					'id'    => 'light',
					'label' => 'لایت',
				),
				array(
					'id'    => 'medium_light',
					'label' => 'مدیوم به لایت',
				),
				array(
					'id'    => 'medium',
					'label' => 'مدیوم',
				),
				array(
					'id'    => 'medium_dark',
					'label' => 'مدیوم به دارک',
				),
				array(
					'id'    => 'dark',
					'label' => 'دارک',
				),
				array(
					'id'    => 'shop',
					'label' => 'به انتخاب مجموعه',
				),
			),
			'grind_devices'        => array(
				array(
					'id'    => 'espresso',
					'label' => 'اسپرسوساز',
				),
				array(
					'id'    => 'moka',
					'label' => 'موکاپات',
				),
				array(
					'id'    => 'turkish',
					'label' => 'قهوه ترک / جذوه',
				),
				array(
					'id'    => 'v60',
					'label' => 'V60 / دریپر',
				),
				array(
					'id'    => 'chemex',
					'label' => 'کمکس',
				),
				array(
					'id'    => 'french_press',
					'label' => 'فرنچ پرس',
				),
				array(
					'id'    => 'aeropress',
					'label' => 'ایروپرس',
				),
				array(
					'id'    => 'siphon',
					'label' => 'سایفون',
				),
				array(
					'id'    => 'cold_brew',
					'label' => 'دم سرد',
				),
			),
			'suggestions'          => array(
				array(
					'id'      => 'balanced',
					'label'   => 'متعادل ۸۰/۲۰',
					'arabica' => 80,
					'robusta' => 20,
					'hint'    => 'عطر عالی و کافئین متعادل؛ نه خیلی تلخ نه خیلی ترش.',
				),
				array(
					'id'      => 'bold',
					'label'   => 'تلخ و پرانرژی ۳۰/۷۰',
					'arabica' => 30,
					'robusta' => 70,
					'hint'    => 'تلخی و کافئین بالاتر برای اسپرسو و ترک.',
				),
				array(
					'id'      => 'aromatic',
					'label'   => 'معطر ۹۰/۱۰',
					'arabica' => 90,
					'robusta' => 10,
					'hint'    => 'اسیدیته و پیچیدگی طعمی بیشتر برای دم‌آوری فیلتری.',
				),
			),
			'guide'                => self::default_guide(),
		);
	}

	/**
	 * @return array<int,array{title:string,body:string}>
	 */
	public static function default_guide() {
		return array(
			array(
				'title' => 'چرا قهوه را ترکیب می‌کنیم؟',
				'body'  => 'هدف بلند، رسیدن به طعم و خصوصیات دلخواه شماست. قهوه ترکیبی از چند خاستگاه ساخته می‌شود تا کمبود تک‌خاستگاه‌ها جبران شود: عطر عربیکا با بدنه و کافئین روبوستا.',
			),
			array(
				'title' => 'عربیکا در برابر روبوستا',
				'body'  => 'عربیکا معمولاً عطر پیچیده‌تر و اسیدیته بالاتر دارد. روبوستا تلخ‌تر است و کافئین بیشتری می‌دهد. ترکیب ۸۰٪ عربیکا و ۲۰٪ روبوستا نقطه شروع متعادل است. برای تلخی و انرژی بیشتر سهم روبوستا را بالا ببرید.',
			),
			array(
				'title' => 'رست چه می‌کند؟',
				'body'  => 'لایت اسیدیته و نت‌های میوه‌ای را نگه می‌دارد. مدیوم تعادل عطر و شیرینی است. دارک تلخی، بدنه و نت‌های شکلاتی/دودی را پررنگ می‌کند. «به انتخاب مجموعه» یعنی رست تازه‌روز فروشگاه.',
			),
			array(
				'title' => 'دان یا پودر؟',
				'body'  => 'دان تازگی را بهتر حفظ می‌کند اگر آسیاب خانگی دارید. پودر باید دقیقاً مطابق دستگاه باشد: اسپرسو ریز، V60 متوسط‌ریز، فرنچ‌پرس درشت، ترک بسیار ریز.',
			),
			array(
				'title' => 'نسبت‌ها را چطور قفل کنیم؟',
				'body'  => 'جمع درصدها باید ۱۰۰ باشد. از ۲ تا ۴ دان استفاده کنید تا طعم‌ها گم نشوند. پیشنهادهای آماده را می‌توانید پایه بگذارید و بعد تنظیم کنید.',
			),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function get_settings() {
		$saved = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $saved ) ) {
			$saved = array();
		}
		return self::sanitize_settings( array_replace_recursive( self::default_settings(), $saved ) );
	}

	/**
	 * @param array<string,mixed> $input Raw.
	 * @return array<string,mixed>
	 */
	public static function sanitize_settings( $input ) {
		$defaults = self::default_settings();
		if ( ! is_array( $input ) ) {
			return $defaults;
		}
		$source = sanitize_key( (string) ( $input['source'] ?? 'profile' ) );
		if ( ! in_array( $source, array( 'profile', 'category', 'products' ), true ) ) {
			$source = 'profile';
		}
		$mode = sanitize_key( (string) ( $input['default_mode'] ?? 'both' ) );
		if ( ! in_array( $mode, array( 'both', 'simple', 'advanced' ), true ) ) {
			$mode = 'both';
		}
		$basis = sanitize_key( (string) ( $input['price_basis'] ?? 'per_kg' ) );
		if ( ! in_array( $basis, array( 'per_kg', 'pack' ), true ) ) {
			$basis = 'per_kg';
		}
		$min_beans = max( 1, min( 8, (int) ( $input['min_beans'] ?? 2 ) ) );
		$max_beans = max( $min_beans, min( 8, (int) ( $input['max_beans'] ?? 4 ) ) );

		$weights_in = isset( $input['weights'] ) && is_array( $input['weights'] ) ? $input['weights'] : $defaults['weights'];
		$weights    = array();
		foreach ( $weights_in as $w ) {
			$n = (int) $w;
			if ( $n >= 10 && $n <= 10000 ) {
				$weights[] = $n;
			}
		}
		$weights = array_values( array_unique( $weights ) );
		if ( array() === $weights ) {
			$weights = $defaults['weights'];
		}

		return array(
			'source'                => $source,
			'category_ids'          => self::id_list( $input['category_ids'] ?? array() ),
			'product_ids'           => self::id_list( $input['product_ids'] ?? array() ),
			'min_beans'             => $min_beans,
			'max_beans'             => $max_beans,
			'default_mode'          => $mode,
			'price_basis'           => $basis,
			'default_pack_weight_g' => max( 1, min( 50000, (int) ( $input['default_pack_weight_g'] ?? 1000 ) ) ),
			'holder_product_id'     => max( 0, (int) ( $input['holder_product_id'] ?? 0 ) ),
			'robusta_product_id'    => max( 0, (int) ( $input['robusta_product_id'] ?? 0 ) ),
			'arabica_product_id'    => max( 0, (int) ( $input['arabica_product_id'] ?? 0 ) ),
			'grind_fee'             => max( 0, (float) ( $input['grind_fee'] ?? 0 ) ),
			'weights'               => $weights,
			'roasts'                => self::sanitize_id_label_list( $input['roasts'] ?? $defaults['roasts'], $defaults['roasts'] ),
			'grind_devices'         => self::sanitize_id_label_list( $input['grind_devices'] ?? $defaults['grind_devices'], $defaults['grind_devices'] ),
			'suggestions'           => self::sanitize_suggestions( $input['suggestions'] ?? $defaults['suggestions'] ),
			'guide'                 => self::sanitize_guide( $input['guide'] ?? $defaults['guide'] ),
		);
	}

	/**
	 * @param array<string,mixed> $settings Settings.
	 * @return array<string,mixed>
	 */
	public static function save_settings( $settings ) {
		$clean = self::sanitize_settings( $settings );
		if ( $clean['holder_product_id'] < 1 ) {
			$clean['holder_product_id'] = self::create_holder_product();
		}
		update_option( self::OPTION_KEY, $clean, false );
		return $clean;
	}

	/**
	 * @return int
	 */
	public static function ensure_holder_product() {
		$settings = self::get_settings();
		$id       = (int) $settings['holder_product_id'];
		if ( $id > 0 && function_exists( 'wc_get_product' ) ) {
			$p = wc_get_product( $id );
			if ( $p ) {
				return $id;
			}
		}
		$created = self::create_holder_product();
		if ( $created > 0 ) {
			$settings['holder_product_id'] = $created;
			update_option( self::OPTION_KEY, $settings, false );
		}
		return $created;
	}

	/**
	 * @return int
	 */
	private static function create_holder_product() {
		if ( ! class_exists( 'WC_Product_Simple' ) ) {
			return 0;
		}
		$p = new WC_Product_Simple();
		$p->set_name( __( 'ترکیب شخصی قهوه', 'webino-dashboard' ) );
		$p->set_status( 'publish' );
		$p->set_catalog_visibility( 'hidden' );
		$p->set_regular_price( '0' );
		$p->set_price( '0' );
		$p->set_sold_individually( false );
		$p->set_virtual( false );
		$p->set_reviews_allowed( false );
		$p->update_meta_data( '_webino_coffee_blend_holder', '1' );
		return (int) $p->save();
	}

	/**
	 * Public catalog of beans.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	public static function catalog() {
		$ids = self::catalog_product_ids();
		$out = array();
		foreach ( $ids as $id ) {
			$bean = self::map_bean( $id, false );
			if ( $bean ) {
				$out[] = $bean;
			}
		}
		return $out;
	}

	/**
	 * @return array<int,int>
	 */
	public static function catalog_product_ids() {
		$settings = self::get_settings();
		$holder   = (int) $settings['holder_product_id'];
		$ids      = array();
		if ( 'products' === $settings['source'] && $settings['product_ids'] ) {
			$ids = $settings['product_ids'];
		} elseif ( 'category' === $settings['source'] && $settings['category_ids'] ) {
			$q = new WP_Query(
				array(
					'post_type'      => 'product',
					'post_status'    => 'publish',
					'posts_per_page' => 80,
					'fields'         => 'ids',
					'orderby'        => 'title',
					'order'          => 'ASC',
					'tax_query'      => array(
						array(
							'taxonomy' => 'product_cat',
							'field'    => 'term_id',
							'terms'    => $settings['category_ids'],
						),
					),
				)
			);
			$ids = array_map( 'intval', $q->posts );
		} else {
			$q = new WP_Query(
				array(
					'post_type'      => 'product',
					'post_status'    => 'publish',
					'posts_per_page' => 80,
					'fields'         => 'ids',
					'orderby'        => 'title',
					'order'          => 'ASC',
					'meta_query'     => array(
						array(
							'key'     => Webino_Dashboard_Coffee_Profile::META_KEY,
							'compare' => 'EXISTS',
						),
					),
				)
			);
			$ids = array_map( 'intval', $q->posts );
		}
		$ids = array_values( array_unique( array_filter( $ids ) ) );
		if ( $holder > 0 ) {
			$ids = array_values( array_diff( $ids, array( $holder ) ) );
		}
		return $ids;
	}

	/**
	 * @param int  $product_id Product ID.
	 * @param bool $include_purchase Include purchase/kg (server only).
	 * @return array<string,mixed>|null
	 */
	public static function map_bean( $product_id, $include_purchase = false ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return null;
		}
		$product = wc_get_product( (int) $product_id );
		if ( ! $product || ! $product->is_purchasable() ) {
			return null;
		}
		$profile = Webino_Dashboard_Coffee_Profile::get_profile( (int) $product_id );
		$origins = Webino_Dashboard_Coffee_Origins::items_for_product( (int) $product_id );
		$price_id = self::pricing_product_id( $product );
		$purchase = self::product_purchase( $price_id, $product );
		$per_kg   = self::purchase_per_kg( $purchase, $profile );
		$image_id = (int) $product->get_image_id();
		$acidity  = isset( $profile['acidity'] ) && is_array( $profile['acidity'] ) ? $profile['acidity'] : array();
		$acid_avg = 0;
		if ( $acidity ) {
			$acid_avg = (int) round( array_sum( $acidity ) / max( 1, count( $acidity ) ) );
		}
		$item = array(
			'id'             => (int) $product_id,
			'name'           => $product->get_name(),
			'image'          => $image_id > 0 ? (string) wp_get_attachment_image_url( $image_id, 'woocommerce_thumbnail' ) : '',
			'in_stock'       => $product->is_in_stock(),
			'blend_robusta'  => (int) $profile['blend_robusta'],
			'blend_arabica'  => (int) $profile['blend_arabica'],
			'caffeine_mg'    => (int) $profile['caffeine_mg'],
			'bitterness'     => (int) $profile['bitterness'],
			'sweetness'      => (int) $profile['sweetness'],
			'body'           => (int) $profile['body'],
			'acidity_avg'    => $acid_avg,
			'acidity'        => $acidity,
			'origins'        => $origins,
			'retail_per_kg'  => self::tier_price( $per_kg, 'retail', $price_id ),
			'retail_html'    => self::format_money( self::tier_price( $per_kg, 'retail', $price_id ) ),
		);
		if ( $include_purchase ) {
			$item['purchase_per_kg'] = $per_kg;
			$item['price_product_id'] = $price_id;
		}
		return $item;
	}

	/**
	 * Validate recipe and return quote + tasting + labels.
	 *
	 * @param array<string,mixed> $raw Recipe.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function quote( $raw ) {
		$recipe = self::sanitize_recipe( $raw );
		if ( is_wp_error( $recipe ) ) {
			return $recipe;
		}
		$settings = self::get_settings();
		$sum_kg   = 0.0;
		$tasting  = array(
			'blend_robusta' => 0.0,
			'blend_arabica' => 0.0,
			'caffeine_mg'   => 0.0,
			'bitterness'    => 0.0,
			'sweetness'     => 0.0,
			'body'          => 0.0,
			'acidity'       => array(),
		);
		$lines = array();
		foreach ( $recipe['beans'] as $bean ) {
			$mapped = self::map_bean( (int) $bean['product_id'], true );
			if ( ! $mapped || empty( $mapped['in_stock'] ) ) {
				return new WP_Error( 'invalid_bean', __( 'یک دان انتخاب‌شده ناموجود است.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
			$pct     = (float) $bean['percent'] / 100;
			$sum_kg += (float) $mapped['purchase_per_kg'] * $pct;
			$tasting['blend_robusta'] += (float) $mapped['blend_robusta'] * $pct;
			$tasting['blend_arabica'] += (float) $mapped['blend_arabica'] * $pct;
			$tasting['caffeine_mg']   += (float) $mapped['caffeine_mg'] * $pct;
			$tasting['bitterness']    += (float) $mapped['bitterness'] * $pct;
			$tasting['sweetness']     += (float) $mapped['sweetness'] * $pct;
			$tasting['body']          += (float) $mapped['body'] * $pct;
			if ( isset( $mapped['acidity'] ) && is_array( $mapped['acidity'] ) ) {
				foreach ( $mapped['acidity'] as $lid => $val ) {
					if ( ! isset( $tasting['acidity'][ $lid ] ) ) {
						$tasting['acidity'][ $lid ] = 0.0;
					}
					$tasting['acidity'][ $lid ] += (float) $val * $pct;
				}
			}
			$roast_label = self::label_for( $settings['roasts'], $bean['roast'] );
			$lines[]     = array(
				'product_id' => (int) $bean['product_id'],
				'name'       => $mapped['name'],
				'percent'    => (float) $bean['percent'],
				'roast'      => $bean['roast'],
				'roast_label'=> $roast_label,
			);
		}

		$weight_g = (int) $recipe['weight_g'];
		$line_purchase = $sum_kg * ( $weight_g / 1000 );
		if ( 'ground' === $recipe['grind'] && (float) $settings['grind_fee'] > 0 ) {
			$line_purchase += (float) $settings['grind_fee'] * ( $weight_g / 1000 );
		}

		$price_pid = isset( $recipe['beans'][0]['product_id'] ) ? (int) $recipe['beans'][0]['product_id'] : 0;
		$retail    = self::tier_price( $line_purchase, 'retail', $price_pid );
		$credit    = self::tier_price( $line_purchase, 'credit', $price_pid );
		$plans     = self::installment_plans( $line_purchase, $price_pid );

		$chosen_type = $recipe['purchase_type'];
		$line_price  = $retail;
		if ( 'credit' === $chosen_type ) {
			$line_price = $credit > 0 ? $credit : $retail;
		} elseif ( 'installment' === $chosen_type ) {
			$months = (int) $recipe['installment_months'];
			foreach ( $plans as $plan ) {
				if ( (int) $plan['months'] === $months ) {
					$line_price = (float) $plan['total_price'];
					break;
				}
			}
		}

		$title = self::recipe_title( $lines, $recipe );

		return array(
			'recipe'       => $recipe,
			'lines'        => $lines,
			'title'        => $title,
			'tasting'      => array(
				'blend_robusta' => (int) round( $tasting['blend_robusta'] ),
				'blend_arabica' => (int) round( $tasting['blend_arabica'] ),
				'caffeine_mg'   => (int) round( $tasting['caffeine_mg'] ),
				'bitterness'    => (int) round( $tasting['bitterness'] ),
				'sweetness'     => (int) round( $tasting['sweetness'] ),
				'body'          => (int) round( $tasting['body'] ),
				'acidity'       => array_map( 'intval', array_map( 'round', $tasting['acidity'] ) ),
			),
			'purchase'     => $line_purchase,
			'retail'       => $retail,
			'credit'       => $credit,
			'installment'  => $plans,
			'line_price'   => $line_price,
			'grind_label'  => self::grind_label( $recipe, $settings ),
			'weight_g'     => $weight_g,
			'formatted'    => array(
				'retail'      => self::format_money( $retail ),
				'credit'      => self::format_money( $credit ),
				'line_price'  => self::format_money( $line_price ),
			),
		);
	}

	/**
	 * @param array<string,mixed> $raw Raw recipe.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function sanitize_recipe( $raw ) {
		if ( ! is_array( $raw ) ) {
			return new WP_Error( 'invalid', __( 'دستور پخت نامعتبر است.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$settings = self::get_settings();
		$mode     = sanitize_key( (string) ( $raw['mode'] ?? 'advanced' ) );
		if ( ! in_array( $mode, array( 'simple', 'advanced' ), true ) ) {
			$mode = 'advanced';
		}
		$beans_in = isset( $raw['beans'] ) && is_array( $raw['beans'] ) ? $raw['beans'] : array();
		$beans    = array();
		$allowed  = self::allowed_bean_ids( $mode, $settings );
		$roast_ids = array();
		foreach ( $settings['roasts'] as $r ) {
			$roast_ids[] = $r['id'];
		}
		$pct_sum = 0.0;
		foreach ( $beans_in as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$pid = (int) ( $row['product_id'] ?? 0 );
			$pct = (float) ( $row['percent'] ?? 0 );
			if ( $pid < 1 || $pct <= 0 ) {
				continue;
			}
			if ( ! in_array( $pid, $allowed, true ) ) {
				return new WP_Error( 'invalid_bean', __( 'دان انتخاب‌شده در کاتالوگ نیست.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
			$roast = sanitize_key( (string) ( $row['roast'] ?? 'medium' ) );
			if ( ! in_array( $roast, $roast_ids, true ) ) {
				$roast = $roast_ids ? $roast_ids[0] : 'medium';
			}
			$beans[]  = array(
				'product_id' => $pid,
				'percent'    => $pct,
				'roast'      => $roast,
			);
			$pct_sum += $pct;
		}
		$min = 'simple' === $mode ? 1 : (int) $settings['min_beans'];
		$max = 'simple' === $mode ? 2 : (int) $settings['max_beans'];
		if ( count( $beans ) < $min || count( $beans ) > $max ) {
			return new WP_Error( 'bean_count', __( 'تعداد دان‌های انتخاب‌شده مجاز نیست.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		if ( abs( $pct_sum - 100 ) > 1 ) {
			return new WP_Error( 'percent', __( 'جمع درصدها باید ۱۰۰ باشد.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		foreach ( $beans as $i => $b ) {
			$beans[ $i ]['percent'] = round( $b['percent'] * 100 / $pct_sum, 2 );
		}

		$grind = sanitize_key( (string) ( $raw['grind'] ?? 'whole' ) );
		if ( ! in_array( $grind, array( 'whole', 'ground' ), true ) ) {
			$grind = 'whole';
		}
		$device = sanitize_key( (string) ( $raw['grind_device'] ?? '' ) );
		$dev_ids = array();
		foreach ( $settings['grind_devices'] as $d ) {
			$dev_ids[] = $d['id'];
		}
		if ( 'ground' === $grind ) {
			if ( ! in_array( $device, $dev_ids, true ) ) {
				return new WP_Error( 'grind', __( 'دستگاه آسیاب را انتخاب کنید.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
		} else {
			$device = '';
		}

		$weight = (int) ( $raw['weight_g'] ?? 0 );
		if ( ! in_array( $weight, $settings['weights'], true ) ) {
			return new WP_Error( 'weight', __( 'وزن انتخاب‌شده مجاز نیست.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}

		$type = sanitize_key( (string) ( $raw['purchase_type'] ?? 'cash' ) );
		if ( ! in_array( $type, array( 'cash', 'retail', 'credit', 'installment' ), true ) ) {
			$type = 'cash';
		}
		if ( 'retail' === $type ) {
			$type = 'cash';
		}
		$months = max( 0, (int) ( $raw['installment_months'] ?? 0 ) );

		return array(
			'mode'                => $mode,
			'beans'               => $beans,
			'grind'               => $grind,
			'grind_device'        => $device,
			'weight_g'            => $weight,
			'purchase_type'       => $type,
			'installment_months'  => $months,
		);
	}

	/**
	 * @param string               $mode Mode.
	 * @param array<string,mixed>  $settings Settings.
	 * @return array<int,int>
	 */
	private static function allowed_bean_ids( $mode, $settings ) {
		if ( 'simple' === $mode ) {
			$ids = array();
			if ( (int) $settings['robusta_product_id'] > 0 ) {
				$ids[] = (int) $settings['robusta_product_id'];
			}
			if ( (int) $settings['arabica_product_id'] > 0 ) {
				$ids[] = (int) $settings['arabica_product_id'];
			}
			return array_values( array_unique( $ids ) );
		}
		return self::catalog_product_ids();
	}

	/**
	 * Public payload for the wizard.
	 *
	 * @return array<string,mixed>
	 */
	public static function public_config() {
		$settings = self::get_settings();
		$profile  = Webino_Dashboard_Coffee_Profile::get_settings();
		$simple   = array(
			'robusta' => (int) $settings['robusta_product_id'] > 0 ? self::map_bean( (int) $settings['robusta_product_id'] ) : null,
			'arabica' => (int) $settings['arabica_product_id'] > 0 ? self::map_bean( (int) $settings['arabica_product_id'] ) : null,
		);
		return array(
			'mode'             => $settings['default_mode'],
			'min_beans'        => (int) $settings['min_beans'],
			'max_beans'        => (int) $settings['max_beans'],
			'weights'          => $settings['weights'],
			'roasts'           => $settings['roasts'],
			'grind_devices'    => $settings['grind_devices'],
			'suggestions'      => $settings['suggestions'],
			'guide'            => $settings['guide'],
			'catalog'          => self::catalog(),
			'simple'           => $simple,
			'labels'           => array(
				'robusta' => (string) $profile['robusta_label'],
				'arabica' => (string) $profile['arabica_label'],
			),
			'profile_settings' => array(
				'scale_min'      => (int) $profile['scale_min'],
				'scale_max'      => (int) $profile['scale_max'],
				'caffeine_max'   => (int) $profile['caffeine_max'],
				'caffeine_unit'  => (string) $profile['caffeine_unit'],
				'acidity_levels' => $profile['acidity_levels'],
			),
			'credit_enabled'   => class_exists( 'WFCP_Helper', false ) && WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'credit', 'enabled' ) ),
			'installment_on'   => class_exists( 'WFCP_Helper', false ) && WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'installment', 'enabled' ) ),
			'rest'             => rest_url( Webino_Dashboard_REST_Coffee_Blend::NS . '/public/coffee-blend/' ),
			'ajax'             => array(
				'url'   => admin_url( 'admin-ajax.php' ),
				'wc'    => function_exists( 'WC_AJAX' ) && method_exists( 'WC_AJAX', 'get_endpoint' ) ? WC_AJAX::get_endpoint( 'webino_coffee_blend_add' ) : add_query_arg( 'wc-ajax', 'webino_coffee_blend_add', home_url( '/' ) ),
				'nonce' => wp_create_nonce( 'webino_coffee_blend' ),
			),
		);
	}

	/**
	 * @param array<string,mixed>|string $atts Shortcode atts.
	 * @return string
	 */
	public static function shortcode( $atts ) {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return '';
		}
		$atts = shortcode_atts(
			array(
				'mode' => '',
			),
			is_array( $atts ) ? $atts : array()
		);
		self::enqueue_assets();
		$config = self::public_config();
		$mode   = sanitize_key( (string) $atts['mode'] );
		if ( in_array( $mode, array( 'both', 'simple', 'advanced' ), true ) ) {
			$config['mode'] = $mode;
		}
		ob_start();
		$blend_config = $config;
		include dirname( __DIR__ ) . '/public/partials/blend.php';
		return (string) ob_get_clean();
	}

	/**
	 * @return void
	 */
	public static function enqueue() {
		if ( is_admin() ) {
			return;
		}
		$need = is_singular() && has_shortcode( (string) get_post_field( 'post_content', get_the_ID() ), 'webino_coffee_blend' );
		if ( $need ) {
			self::enqueue_assets();
		}
	}

	/**
	 * @return void
	 */
	public static function enqueue_assets() {
		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;
		$dir  = dirname( __DIR__ ) . '/public/blend/';
		$base = defined( 'WEBINO_DASHBOARD_FILE' )
			? plugins_url( 'Modules/coffee-profile-module/public/blend/', WEBINO_DASHBOARD_FILE )
			: plugins_url( 'public/blend/', dirname( __DIR__ ) . '/bootstrap.php' );
		$css = $dir . 'coffee-blend.css';
		$js  = $dir . 'coffee-blend.js';
		if ( is_readable( $css ) ) {
			wp_enqueue_style( 'webino-coffee-blend', $base . 'coffee-blend.css', array(), (string) filemtime( $css ) );
		}
		if ( is_readable( $js ) ) {
			wp_enqueue_script( 'webino-coffee-blend', $base . 'coffee-blend.js', array(), (string) filemtime( $js ), true );
		}
	}

	/**
	 * @param array<string,mixed> $cart_item_data Data.
	 * @param int                 $product_id Product ID.
	 * @param int                 $variation_id Variation ID.
	 * @return array<string,mixed>
	 */
	public static function add_cart_item_data( $cart_item_data, $product_id, $variation_id = 0 ) {
		if ( isset( $cart_item_data[ self::CART_KEY ] ) && is_array( $cart_item_data[ self::CART_KEY ] ) ) {
			$cart_item_data['unique_key'] = md5( wp_json_encode( $cart_item_data[ self::CART_KEY ] ) );
		}
		return $cart_item_data;
	}

	/**
	 * @param array<string,mixed> $cart_item Item.
	 * @param array<string,mixed> $values Session values.
	 * @return array<string,mixed>
	 */
	public static function cart_item_from_session( $cart_item, $values ) {
		if ( isset( $values[ self::CART_KEY ] ) ) {
			$cart_item[ self::CART_KEY ] = $values[ self::CART_KEY ];
		}
		if ( isset( $values['unique_key'] ) ) {
			$cart_item['unique_key'] = $values['unique_key'];
		}
		return $cart_item;
	}

	/**
	 * @param array<int,array<string,mixed>> $item_data Rows.
	 * @param array<string,mixed>            $cart_item Item.
	 * @return array<int,array<string,mixed>>
	 */
	public static function cart_item_data_display( $item_data, $cart_item ) {
		if ( empty( $cart_item[ self::CART_KEY ] ) || ! is_array( $cart_item[ self::CART_KEY ] ) ) {
			return $item_data;
		}
		$quote = self::quote( $cart_item[ self::CART_KEY ] );
		if ( is_wp_error( $quote ) ) {
			return $item_data;
		}
		foreach ( $quote['lines'] as $line ) {
			$item_data[] = array(
				'key'   => $line['name'],
				'value' => (int) round( $line['percent'] ) . '٪ · ' . $line['roast_label'],
			);
		}
		$item_data[] = array(
			'key'   => __( 'آسیاب', 'webino-dashboard' ),
			'value' => $quote['grind_label'],
		);
		$item_data[] = array(
			'key'   => __( 'وزن', 'webino-dashboard' ),
			'value' => $quote['weight_g'] . 'g',
		);
		return $item_data;
	}

	/**
	 * @param string              $name Name.
	 * @param array<string,mixed> $cart_item Item.
	 * @param string              $cart_item_key Key.
	 * @return string
	 */
	public static function cart_item_name( $name, $cart_item, $cart_item_key ) {
		if ( empty( $cart_item[ self::CART_KEY ] ) || ! is_array( $cart_item[ self::CART_KEY ] ) ) {
			return $name;
		}
		$quote = self::quote( $cart_item[ self::CART_KEY ] );
		if ( is_wp_error( $quote ) ) {
			return $name;
		}
		return esc_html( (string) $quote['title'] );
	}

	/**
	 * @param string              $permalink Permalink.
	 * @param array<string,mixed> $cart_item Item.
	 * @param string              $cart_item_key Key.
	 * @return string
	 */
	public static function cart_item_permalink( $permalink, $cart_item, $cart_item_key ) {
		if ( ! empty( $cart_item[ self::CART_KEY ] ) ) {
			return '';
		}
		return $permalink;
	}

	/**
	 * @param WC_Cart $cart Cart.
	 * @return void
	 */
	public static function apply_cart_price( $cart ) {
		if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
			return;
		}
		if ( ! $cart || ! is_a( $cart, 'WC_Cart' ) ) {
			return;
		}
		if ( class_exists( 'WFCP_Storefront_Price', false ) ) {
			WFCP_Storefront_Price::suspend( true );
		}
		foreach ( $cart->get_cart() as $item ) {
			if ( empty( $item[ self::CART_KEY ] ) || empty( $item['data'] ) ) {
				continue;
			}
			$quote = self::quote( $item[ self::CART_KEY ] );
			if ( is_wp_error( $quote ) ) {
				continue;
			}
			$item['data']->set_price( (float) $quote['line_price'] );
		}
		if ( class_exists( 'WFCP_Storefront_Price', false ) ) {
			WFCP_Storefront_Price::suspend( false );
		}
	}

	/**
	 * @param WC_Order_Item_Product $item Item.
	 * @param string                $cart_item_key Key.
	 * @param array<string,mixed>   $values Values.
	 * @param WC_Order              $order Order.
	 * @return void
	 */
	public static function order_line_item( $item, $cart_item_key, $values, $order ) {
		if ( empty( $values[ self::CART_KEY ] ) || ! is_array( $values[ self::CART_KEY ] ) ) {
			return;
		}
		$quote = self::quote( $values[ self::CART_KEY ] );
		if ( is_wp_error( $quote ) ) {
			return;
		}
		$item->add_meta_data( '_webino_coffee_blend', wp_json_encode( $quote['recipe'] ), true );
		$item->set_name( (string) $quote['title'] );
		foreach ( $quote['lines'] as $line ) {
			$item->add_meta_data( $line['name'], (int) round( $line['percent'] ) . '٪ · ' . $line['roast_label'], false );
		}
		$item->add_meta_data( __( 'آسیاب', 'webino-dashboard' ), $quote['grind_label'], false );
		$item->add_meta_data( __( 'وزن', 'webino-dashboard' ), $quote['weight_g'] . 'g', false );
	}

	/**
	 * @return void
	 */
	public static function ajax_add_to_cart() {
		check_ajax_referer( 'webino_coffee_blend', 'nonce' );
		if ( ! function_exists( 'WC' ) ) {
			wp_send_json_error( array( 'message' => __( 'فروشگاه در دسترس نیست.', 'webino-dashboard' ) ), 400 );
		}
		$raw = isset( $_POST['recipe'] ) ? wp_unslash( $_POST['recipe'] ) : '';
		if ( is_string( $raw ) ) {
			$decoded = json_decode( $raw, true );
			$raw     = is_array( $decoded ) ? $decoded : array();
		}
		if ( ! is_array( $raw ) ) {
			$raw = array();
		}
		$quote = self::quote( $raw );
		if ( is_wp_error( $quote ) ) {
			wp_send_json_error( array( 'message' => $quote->get_error_message() ), 400 );
		}
		$holder = self::ensure_holder_product();
		if ( $holder < 1 ) {
			wp_send_json_error( array( 'message' => __( 'محصول نگهدارنده ساخته نشد.', 'webino-dashboard' ) ), 500 );
		}
		if ( null === WC()->cart ) {
			wc_load_cart();
		}
		$cart_data = array(
			self::CART_KEY       => $quote['recipe'],
			'wfcp_purchase_type' => $quote['recipe']['purchase_type'],
		);
		if ( 'installment' === $quote['recipe']['purchase_type'] && $quote['recipe']['installment_months'] > 0 ) {
			$cart_data['wfcp_installment_months'] = (int) $quote['recipe']['installment_months'];
		}
		$key = WC()->cart->add_to_cart( $holder, 1, 0, array(), $cart_data );
		if ( ! $key ) {
			wp_send_json_error( array( 'message' => __( 'افزودن به سبد انجام نشد.', 'webino-dashboard' ) ), 400 );
		}
		wp_send_json_success(
			array(
				'cart_url' => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : '',
				'key'      => $key,
			)
		);
	}

	/**
	 * @param mixed $ids IDs.
	 * @return array<int,int>
	 */
	private static function id_list( $ids ) {
		if ( ! is_array( $ids ) ) {
			$ids = preg_split( '/[\s,]+/', (string) $ids );
		}
		$out = array();
		foreach ( (array) $ids as $id ) {
			$n = (int) $id;
			if ( $n > 0 ) {
				$out[] = $n;
			}
		}
		return array_values( array_unique( $out ) );
	}

	/**
	 * @param mixed $rows Rows.
	 * @param array $fallback Fallback.
	 * @return array<int,array{id:string,label:string}>
	 */
	private static function sanitize_id_label_list( $rows, $fallback ) {
		$out = array();
		$used = array();
		if ( ! is_array( $rows ) ) {
			return $fallback;
		}
		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$label = sanitize_text_field( (string) ( $row['label'] ?? '' ) );
			if ( '' === $label ) {
				continue;
			}
			$id = sanitize_key( (string) ( $row['id'] ?? $label ) );
			if ( '' === $id || isset( $used[ $id ] ) ) {
				continue;
			}
			$used[ $id ] = true;
			$out[]       = array(
				'id'    => $id,
				'label' => $label,
			);
		}
		return $out ? $out : $fallback;
	}

	/**
	 * @param mixed $rows Rows.
	 * @return array<int,array<string,mixed>>
	 */
	private static function sanitize_suggestions( $rows ) {
		$out = array();
		if ( ! is_array( $rows ) ) {
			return self::default_settings()['suggestions'];
		}
		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$label = sanitize_text_field( (string) ( $row['label'] ?? '' ) );
			if ( '' === $label ) {
				continue;
			}
			$arabica = max( 0, min( 100, (int) ( $row['arabica'] ?? 0 ) ) );
			$robusta = max( 0, min( 100, (int) ( $row['robusta'] ?? 0 ) ) );
			if ( $arabica + $robusta !== 100 && $arabica + $robusta > 0 ) {
				$arabica = (int) round( $arabica * 100 / ( $arabica + $robusta ) );
				$robusta = 100 - $arabica;
			}
			$out[] = array(
				'id'      => sanitize_key( (string) ( $row['id'] ?? $label ) ),
				'label'   => $label,
				'arabica' => $arabica,
				'robusta' => $robusta,
				'hint'    => sanitize_text_field( (string) ( $row['hint'] ?? '' ) ),
			);
		}
		return $out ? $out : self::default_settings()['suggestions'];
	}

	/**
	 * @param mixed $rows Rows.
	 * @return array<int,array{title:string,body:string}>
	 */
	private static function sanitize_guide( $rows ) {
		$out = array();
		if ( ! is_array( $rows ) ) {
			return self::default_guide();
		}
		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$title = sanitize_text_field( (string) ( $row['title'] ?? '' ) );
			$body  = wp_kses_post( (string) ( $row['body'] ?? '' ) );
			if ( '' === $title || '' === $body ) {
				continue;
			}
			$out[] = array(
				'title' => $title,
				'body'  => $body,
			);
		}
		return $out ? $out : self::default_guide();
	}

	/**
	 * @param WC_Product $product Product.
	 * @return int
	 */
	private static function pricing_product_id( $product ) {
		$id = (int) $product->get_id();
		if ( $product->is_type( 'variable' ) ) {
			foreach ( $product->get_children() as $vid ) {
				$vid = (int) $vid;
				if ( class_exists( 'WFCP_Helper', false ) && null !== WFCP_Helper::get_product_purchase_price( $vid ) ) {
					return $vid;
				}
			}
		}
		return $id;
	}

	/**
	 * @param int        $product_id Pricing product ID.
	 * @param WC_Product $product Product.
	 * @return float
	 */
	private static function product_purchase( $product_id, $product ) {
		if ( class_exists( 'WFCP_Helper', false ) ) {
			$pp = WFCP_Helper::get_product_purchase_price( $product_id );
			if ( null !== $pp && $pp > 0 ) {
				return (float) $pp;
			}
		}
		$reg = (float) $product->get_regular_price();
		if ( $reg <= 0 ) {
			$reg = (float) $product->get_price();
		}
		return max( 0, $reg );
	}

	/**
	 * @param float                $purchase Purchase for pack or kg.
	 * @param array<string,mixed>  $profile Profile.
	 * @return float
	 */
	private static function purchase_per_kg( $purchase, $profile ) {
		$settings = self::get_settings();
		if ( 'pack' !== $settings['price_basis'] ) {
			return (float) $purchase;
		}
		$pack = isset( $profile['pack_weight_g'] ) ? (int) $profile['pack_weight_g'] : (int) $settings['default_pack_weight_g'];
		$pack = max( 1, $pack );
		return (float) $purchase / ( $pack / 1000 );
	}

	/**
	 * @param float $purchase Purchase amount.
	 * @param string $type Tier.
	 * @param int $product_id Product ID.
	 * @return float
	 */
	private static function tier_price( $purchase, $type, $product_id ) {
		$purchase = (float) $purchase;
		if ( $purchase <= 0 ) {
			return 0.0;
		}
		if ( class_exists( 'WFCP_Calculator', false ) ) {
			if ( 'credit' === $type && class_exists( 'WFCP_Helper', false ) && ! WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'credit', 'enabled' ) ) ) {
				return 0.0;
			}
			return (float) WFCP_Calculator::calculate_price( $purchase, $type, $product_id );
		}
		return $purchase;
	}

	/**
	 * @param float $purchase Purchase.
	 * @param int   $product_id Product ID.
	 * @return array<int,array<string,mixed>>
	 */
	private static function installment_plans( $purchase, $product_id ) {
		$plans = array();
		if ( ! class_exists( 'WFCP_Helper', false ) || ! WFCP_Helper::to_bool( WFCP_Helper::get_settings( 'installment', 'enabled' ) ) ) {
			return $plans;
		}
		$config = WFCP_Helper::get_settings( 'installment', 'plans' );
		if ( ! is_array( $config ) ) {
			return $plans;
		}
		foreach ( $config as $plan ) {
			$months = isset( $plan['months'] ) ? (int) $plan['months'] : 0;
			if ( $months <= 0 ) {
				continue;
			}
			$monthly = class_exists( 'WFCP_Calculator', false )
				? (float) WFCP_Calculator::calculate_price( $purchase, 'installment', $product_id, array( 'months' => $months ) )
				: $purchase / $months;
			$total = class_exists( 'WFCP_Helper', false )
				? (float) WFCP_Helper::get_full_installment_total( $purchase, $months, $product_id )
				: $monthly * $months;
			$plans[] = array(
				'months'        => $months,
				'monthly_price' => $monthly,
				'total_price'   => $total,
				'monthly_html'  => self::format_money( $monthly ),
				'total_html'    => self::format_money( $total ),
			);
		}
		return $plans;
	}

	/**
	 * @param float $amount Amount.
	 * @return string
	 */
	private static function format_money( $amount ) {
		if ( class_exists( 'WFCP_Helper', false ) ) {
			return WFCP_Helper::format_price_with_irt_symbol( $amount );
		}
		if ( function_exists( 'wc_price' ) ) {
			return wc_price( $amount );
		}
		return (string) $amount;
	}

	/**
	 * @param array<int,array<string,mixed>> $list List.
	 * @param string                         $id ID.
	 * @return string
	 */
	private static function label_for( $list, $id ) {
		foreach ( $list as $row ) {
			if ( $row['id'] === $id ) {
				return (string) $row['label'];
			}
		}
		return (string) $id;
	}

	/**
	 * @param array<string,mixed> $recipe Recipe.
	 * @param array<string,mixed> $settings Settings.
	 * @return string
	 */
	private static function grind_label( $recipe, $settings ) {
		if ( 'whole' === $recipe['grind'] ) {
			return __( 'دان قهوه', 'webino-dashboard' );
		}
		$dev = self::label_for( $settings['grind_devices'], $recipe['grind_device'] );
		return __( 'پودر', 'webino-dashboard' ) . ( $dev ? ' · ' . $dev : '' );
	}

	/**
	 * @param array<int,array<string,mixed>> $lines Lines.
	 * @param array<string,mixed>            $recipe Recipe.
	 * @return string
	 */
	private static function recipe_title( $lines, $recipe ) {
		$bits = array();
		foreach ( $lines as $line ) {
			$bits[] = $line['name'] . ' ' . (int) round( $line['percent'] ) . '٪';
		}
		$w = (int) $recipe['weight_g'];
		return __( 'ترکیب شخصی', 'webino-dashboard' ) . ': ' . implode( ' + ', $bits ) . ' · ' . $w . 'g';
	}
}
