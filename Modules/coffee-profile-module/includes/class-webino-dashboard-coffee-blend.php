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
			'source'               => 'pricing',
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
		$source = sanitize_key( (string) ( $input['source'] ?? 'pricing' ) );
		if ( ! in_array( $source, array( 'pricing', 'profile', 'category', 'products' ), true ) ) {
			$source = 'pricing';
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
	 * When source === 'pricing' (default), all main beans configured in Coffee Pricing are returned directly,
	 * enriched with WooCommerce product metadata if linked.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	public static function catalog() {
		$settings = self::get_settings();
		$source   = sanitize_key( (string) ( $settings['source'] ?? 'pricing' ) );

		if ( ( 'pricing' === $source || '' === $source ) && class_exists( 'Webino_Dashboard_Coffee_Pricing', false ) ) {
			$computed = Webino_Dashboard_Coffee_Pricing::computed();
			$out      = array();
			foreach ( (array) ( $computed['beans'] ?? array() ) as $b ) {
				$mapped = self::map_pricing_bean( $b, false );
				if ( $mapped ) {
					$out[] = $mapped;
				}
			}
			return $out;
		}

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
		$source   = sanitize_key( (string) ( $settings['source'] ?? 'pricing' ) );
		$bean_ids = class_exists( 'Webino_Dashboard_Coffee_Pricing', false )
			? Webino_Dashboard_Coffee_Pricing::bean_product_ids()
			: array();
		$ids      = array();

		if ( 'pricing' === $source || '' === $source ) {
			$ids = $bean_ids;
		} elseif ( 'products' === $source && $settings['product_ids'] ) {
			$ids = $settings['product_ids'];
		} elseif ( 'category' === $source && $settings['category_ids'] ) {
			$q_args = array(
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
			);
			$vis = Webino_Dashboard_Coffee_Profile::storefront_visibility_tax_clause();
			if ( $vis ) {
				$q_args['tax_query'][]           = $vis;
				$q_args['tax_query']['relation'] = 'AND';
			}
			$q   = new WP_Query( $q_args );
			$ids = array_map( 'intval', $q->posts );
		} else {
			// Legacy "profile" source: intersect with linked pricing beans if configured so mixes never leak.
			$q_args = array(
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
			);
			$vis = Webino_Dashboard_Coffee_Profile::storefront_visibility_tax_clause();
			if ( $vis ) {
				$q_args['tax_query'] = array( $vis );
			}
			$q   = new WP_Query( $q_args );
			$ids = array_map( 'intval', $q->posts );
			if ( $bean_ids ) {
				$allowed = array_fill_keys( $bean_ids, true );
				$ids     = array_values(
					array_filter(
						$ids,
						static function ( $id ) use ( $allowed ) {
							return isset( $allowed[ (int) $id ] );
						}
					)
				);
			}
		}

		$ids = array_values( array_unique( array_filter( array_map( 'intval', $ids ) ) ) );

		if ( ( 'pricing' === $source || '' === $source ) && $bean_ids ) {
			$ids = array_values( array_intersect( $bean_ids, $ids ) );
		}

		if ( $holder > 0 ) {
			$ids = array_values( array_diff( $ids, array( $holder ) ) );
		}
		return $ids;
	}

	/**
	 * Default sensory indicators when a main bean has no linked WooCommerce tasting profile.
	 *
	 * @param string $kind robusta|arabica.
	 * @return array<string,mixed>
	 */
	private static function default_tasting_for_kind( $kind ) {
		if ( 'robusta' === $kind ) {
			return array(
				'blend_robusta' => 100,
				'blend_arabica' => 0,
				'caffeine_mg'   => 170,
				'bitterness'    => 7,
				'sweetness'     => 3,
				'body'          => 7,
				'acidity_avg'   => 3,
				'acidity'       => array(),
			);
		}
		return array(
			'blend_robusta' => 0,
			'blend_arabica' => 100,
			'caffeine_mg'   => 95,
			'bitterness'    => 4,
			'sweetness'     => 7,
			'body'          => 5,
			'acidity_avg'   => 7,
			'acidity'       => array(),
		);
	}

	/**
	 * Map a bean row from Webino_Dashboard_Coffee_Pricing::computed() (with optional WC product enrichment).
	 *
	 * @param array<string,mixed> $bean Computed bean row.
	 * @param bool                $include_purchase Include purchase/kg (server only).
	 * @return array<string,mixed>|null
	 */
	public static function map_pricing_bean( $bean, $include_purchase = false ) {
		if ( ! is_array( $bean ) || empty( $bean['id'] ) ) {
			return null;
		}
		$bean_id  = (string) $bean['id'];
		$kind     = 'robusta' === ( $bean['kind'] ?? '' ) ? 'robusta' : 'arabica';
		$pid      = (int) ( $bean['product_id'] ?? 0 );
		$product  = ( $pid > 0 && function_exists( 'wc_get_product' ) ) ? wc_get_product( $pid ) : null;
		$defaults = self::default_tasting_for_kind( $kind );

		$in_stock  = true;
		$image     = '';
		$origins   = array();
		$name      = (string) ( $bean['name'] ?? $bean_id );
		$price_id  = $pid;
		$rob       = $defaults['blend_robusta'];
		$ara       = $defaults['blend_arabica'];
		$caffeine  = $defaults['caffeine_mg'];
		$bitter    = $defaults['bitterness'];
		$sweet     = $defaults['sweetness'];
		$body      = $defaults['body'];
		$acidity   = array();
		$acid_avg  = $defaults['acidity_avg'];

		if ( $product ) {
			$in_stock = $product->is_in_stock();
			$image_id = (int) $product->get_image_id();
			if ( $image_id > 0 ) {
				$image = (string) wp_get_attachment_image_url( $image_id, 'woocommerce_thumbnail' );
			}
			$pname = $product->get_name();
			if ( '' !== $pname ) {
				$name = $pname;
			}
			$origins = Webino_Dashboard_Coffee_Origins::items_for_product( $pid );
			$profile = Webino_Dashboard_Coffee_Profile::get_profile( $pid );
			if ( ( (int) $profile['blend_robusta'] + (int) $profile['blend_arabica'] ) > 0 ) {
				$rob = (int) $profile['blend_robusta'];
				$ara = (int) $profile['blend_arabica'];
			}
			if ( (int) $profile['caffeine_mg'] > 0 ) {
				$caffeine = (int) $profile['caffeine_mg'];
			}
			if ( (int) $profile['bitterness'] > 0 ) {
				$bitter = (int) $profile['bitterness'];
			}
			if ( (int) $profile['sweetness'] > 0 ) {
				$sweet = (int) $profile['sweetness'];
			}
			if ( (int) $profile['body'] > 0 ) {
				$body = (int) $profile['body'];
			}
			if ( ! empty( $profile['acidity'] ) && is_array( $profile['acidity'] ) && array_sum( $profile['acidity'] ) > 0 ) {
				$acidity  = $profile['acidity'];
				$acid_avg = (int) round( array_sum( $acidity ) / max( 1, count( $acidity ) ) );
			}
		}

		$per_kg = isset( $bean['after_roast'] ) ? (float) $bean['after_roast'] : 0.0;
		if ( $per_kg <= 0 && $product ) {
			$resolved = self::resolve_wc_product_per_kg( $product );
			$per_kg   = $resolved['per_kg'];
			$price_id = $resolved['price_id'];
		}

		$retail = self::tier_price( $per_kg, 'retail', $price_id );
		$item   = array(
			'id'            => $bean_id,
			'bean_id'       => $bean_id,
			'product_id'    => $pid,
			'kind'          => $kind,
			'name'          => $name,
			'image'         => $image,
			'in_stock'      => $in_stock,
			'blend_robusta' => $rob,
			'blend_arabica' => $ara,
			'caffeine_mg'   => $caffeine,
			'bitterness'    => $bitter,
			'sweetness'     => $sweet,
			'body'          => $body,
			'acidity_avg'   => $acid_avg,
			'acidity'       => $acidity,
			'origins'       => $origins,
			'retail_per_kg' => $retail,
			'retail_html'   => self::format_money( $retail ),
		);
		if ( $include_purchase ) {
			$item['purchase_per_kg']  = $per_kg;
			$item['price_product_id'] = $price_id;
		}
		return $item;
	}

	/**
	 * Map a base mix from Webino_Dashboard_Coffee_Pricing::computed() into a blend item (used for simple mode & presets).
	 *
	 * @param string                   $mix_id Mix ID.
	 * @param array<string,mixed>|null $computed Computed table.
	 * @param bool                     $include_purchase Include purchase/kg.
	 * @return array<string,mixed>|null
	 */
	public static function map_pricing_mix( $mix_id, $computed = null, $include_purchase = false ) {
		if ( ! class_exists( 'Webino_Dashboard_Coffee_Pricing', false ) ) {
			return null;
		}
		$c   = is_array( $computed ) ? $computed : Webino_Dashboard_Coffee_Pricing::computed();
		$mix = null;
		foreach ( (array) ( $c['base_mixes'] ?? array() ) as $m ) {
			if ( is_array( $m ) && ( $m['id'] ?? '' ) === $mix_id ) {
				$mix = $m;
				break;
			}
		}
		if ( ! $mix ) {
			return null;
		}

		$beans_by_id = array();
		foreach ( (array) ( $c['beans'] ?? array() ) as $b ) {
			if ( is_array( $b ) && ! empty( $b['id'] ) ) {
				$beans_by_id[ (string) $b['id'] ] = self::map_pricing_bean( $b, true );
			}
		}

		$per_kg   = 0.0;
		$rob      = 0.0;
		$ara      = 0.0;
		$caffeine = 0.0;
		$bitter   = 0.0;
		$sweet    = 0.0;
		$body     = 0.0;
		$acidity  = array();
		$parts_desc = array();
		$w_sum    = 0.0;
		$parts    = (array) ( $mix['parts'] ?? array() );

		foreach ( $parts as $p ) {
			$bid = (string) ( $p['bean_id'] ?? '' );
			$pct = (float) ( $p['percent'] ?? 0 );
			if ( '' === $bid || $pct <= 0 || empty( $beans_by_id[ $bid ] ) ) {
				continue;
			}
			$w_sum += $pct;
		}
		if ( $w_sum <= 0 ) {
			return null;
		}
		foreach ( $parts as $p ) {
			$bid = (string) ( $p['bean_id'] ?? '' );
			$pct = (float) ( $p['percent'] ?? 0 );
			if ( '' === $bid || $pct <= 0 || empty( $beans_by_id[ $bid ] ) ) {
				continue;
			}
			$b    = $beans_by_id[ $bid ];
			$frac = $pct / $w_sum;
			$per_kg   += (float) $b['purchase_per_kg'] * $frac;
			$rob      += (float) $b['blend_robusta'] * $frac;
			$ara      += (float) $b['blend_arabica'] * $frac;
			$caffeine += (float) $b['caffeine_mg'] * $frac;
			$bitter   += (float) $b['bitterness'] * $frac;
			$sweet    += (float) $b['sweetness'] * $frac;
			$body     += (float) $b['body'] * $frac;
			if ( ! empty( $b['acidity'] ) && is_array( $b['acidity'] ) ) {
				foreach ( $b['acidity'] as $lid => $val ) {
					$acidity[ $lid ] = ( $acidity[ $lid ] ?? 0.0 ) + ( (float) $val * $frac );
				}
			}
			$parts_desc[] = (int) round( $pct ) . '٪ ' . $b['name'];
		}

		$kind   = 'robusta' === ( $mix['kind'] ?? '' ) ? 'robusta' : 'arabica';
		$retail = self::tier_price( $per_kg, 'retail', 0 );
		$key    = 'mix:' . $mix_id;
		$item   = array(
			'id'            => $key,
			'bean_id'       => $key,
			'mix_id'        => $mix_id,
			'product_id'    => 0,
			'kind'          => $kind,
			'name'          => (string) $mix['name'],
			'subtitle'      => implode( ' + ', $parts_desc ),
			'parts'         => $parts,
			'image'         => '',
			'in_stock'      => true,
			'blend_robusta' => (int) round( $rob ),
			'blend_arabica' => (int) round( $ara ),
			'caffeine_mg'   => (int) round( $caffeine ),
			'bitterness'    => (int) round( $bitter ),
			'sweetness'     => (int) round( $sweet ),
			'body'          => (int) round( $body ),
			'acidity_avg'   => $acidity ? (int) round( array_sum( $acidity ) / max( 1, count( $acidity ) ) ) : ( 'robusta' === $kind ? 3 : 7 ),
			'acidity'       => array_map( 'intval', array_map( 'round', $acidity ) ),
			'origins'       => array(),
			'retail_per_kg' => $retail,
			'retail_html'   => self::format_money( $retail ),
		);
		if ( $include_purchase ) {
			$item['purchase_per_kg']  = $per_kg;
			$item['price_product_id'] = 0;
		}
		return $item;
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
		$profile  = Webino_Dashboard_Coffee_Profile::get_profile( (int) $product_id );
		$origins  = Webino_Dashboard_Coffee_Origins::items_for_product( (int) $product_id );
		$resolved = self::resolve_wc_product_per_kg( $product, $profile );
		$per_kg   = $resolved['per_kg'];
		$price_id = $resolved['price_id'];
		$image_id = (int) $product->get_image_id();
		$acidity  = isset( $profile['acidity'] ) && is_array( $profile['acidity'] ) ? $profile['acidity'] : array();
		$acid_avg = 0;
		if ( $acidity ) {
			$acid_avg = (int) round( array_sum( $acidity ) / max( 1, count( $acidity ) ) );
		}
		$item = array(
			'id'             => (int) $product_id,
			'bean_id'        => '',
			'product_id'     => (int) $product_id,
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
			$item['purchase_per_kg']  = $per_kg;
			$item['price_product_id'] = $price_id;
		}
		return $item;
	}

	/**
	 * Resolve a recipe bean entry (bean_id string, mix:<id>, or WC product_id).
	 *
	 * @param array<string,mixed>      $bean_row Recipe row.
	 * @param array<string,mixed>|null $computed Computed pricing.
	 * @param bool                     $include_purchase Include purchase/kg.
	 * @return array<string,mixed>|null
	 */
	private static function resolve_recipe_bean( $bean_row, $computed = null, $include_purchase = true ) {
		$key = isset( $bean_row['bean_id'] ) && '' !== (string) $bean_row['bean_id']
			? (string) $bean_row['bean_id']
			: (string) ( $bean_row['id'] ?? '' );

		if ( '' !== $key && 0 === strpos( $key, 'mix:' ) ) {
			return self::map_pricing_mix( substr( $key, 4 ), $computed, $include_purchase );
		}

		if ( '' !== $key && class_exists( 'Webino_Dashboard_Coffee_Pricing', false ) ) {
			$c = is_array( $computed ) ? $computed : Webino_Dashboard_Coffee_Pricing::computed();
			foreach ( (array) ( $c['beans'] ?? array() ) as $b ) {
				if ( is_array( $b ) && (string) ( $b['id'] ?? '' ) === $key ) {
					return self::map_pricing_bean( $b, $include_purchase );
				}
			}
		}

		$pid = (int) ( $bean_row['product_id'] ?? 0 );
		if ( $pid > 0 ) {
			if ( class_exists( 'Webino_Dashboard_Coffee_Pricing', false ) ) {
				$c = is_array( $computed ) ? $computed : Webino_Dashboard_Coffee_Pricing::computed();
				foreach ( (array) ( $c['beans'] ?? array() ) as $b ) {
					if ( is_array( $b ) && (int) ( $b['product_id'] ?? 0 ) === $pid ) {
						return self::map_pricing_bean( $b, $include_purchase );
					}
				}
			}
			return self::map_bean( $pid, $include_purchase );
		}

		return null;
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
		$computed = class_exists( 'Webino_Dashboard_Coffee_Pricing', false )
			? Webino_Dashboard_Coffee_Pricing::computed()
			: null;
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
		$lines     = array();
		$price_pid = 0;
		foreach ( $recipe['beans'] as $bean ) {
			$mapped = self::resolve_recipe_bean( $bean, $computed, true );
			if ( ! $mapped || empty( $mapped['in_stock'] ) ) {
				return new WP_Error( 'invalid_bean', __( 'یک دان انتخاب‌شده ناموجود است.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}
			if ( 0 === $price_pid && ! empty( $mapped['price_product_id'] ) ) {
				$price_pid = (int) $mapped['price_product_id'];
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
				'id'          => $mapped['id'],
				'bean_id'     => (string) ( $mapped['bean_id'] ?? '' ),
				'product_id'  => (int) ( $mapped['product_id'] ?? 0 ),
				'name'        => $mapped['name'],
				'subtitle'    => (string) ( $mapped['subtitle'] ?? '' ),
				'percent'     => (float) $bean['percent'],
				'roast'       => $bean['roast'],
				'roast_label' => $roast_label,
			);
		}

		$weight_g = (int) $recipe['weight_g'];
		$line_purchase = $sum_kg * ( $weight_g / 1000 );
		if ( 'ground' === $recipe['grind'] && (float) $settings['grind_fee'] > 0 ) {
			$line_purchase += (float) $settings['grind_fee'] * ( $weight_g / 1000 );
		}

		if ( 0 === $price_pid ) {
			$price_pid = (int) ( $settings['holder_product_id'] ?? 0 );
		}
		$retail    = self::tier_price( $line_purchase, 'retail', $price_pid );
		$credit    = self::tier_price( $line_purchase, 'credit', $price_pid );
		$wholesale = self::tier_price( $line_purchase, 'wholesale', $price_pid );
		$plans     = self::installment_plans( $line_purchase, $price_pid );

		$chosen_type = $recipe['purchase_type'];
		$line_price  = $retail;
		if ( 'credit' === $chosen_type ) {
			$line_price = $credit > 0 ? $credit : $retail;
		} elseif ( 'wholesale' === $chosen_type ) {
			$line_price = $wholesale > 0 ? $wholesale : $retail;
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
			'wholesale'    => $wholesale,
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
		$settings  = self::get_settings();
		$mode      = sanitize_key( (string) ( $raw['mode'] ?? 'advanced' ) );
		if ( ! in_array( $mode, array( 'simple', 'advanced' ), true ) ) {
			$mode = 'advanced';
		}
		$beans_in  = isset( $raw['beans'] ) && is_array( $raw['beans'] ) ? $raw['beans'] : array();
		$beans     = array();
		$allowed   = self::allowed_bean_keys( $mode, $settings );
		$roast_ids = array();
		foreach ( $settings['roasts'] as $r ) {
			$roast_ids[] = $r['id'];
		}
		$pct_sum = 0.0;
		foreach ( $beans_in as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$pct = (float) ( $row['percent'] ?? 0 );
			if ( $pct <= 0 ) {
				continue;
			}
			$raw_bean_id = (string) ( $row['bean_id'] ?? '' );
			$raw_pid     = $row['product_id'] ?? '';
			$raw_id      = $row['id'] ?? '';

			$candidate_key = '';
			if ( '' !== $raw_bean_id ) {
				$candidate_key = $raw_bean_id;
			} elseif ( '' !== (string) $raw_id ) {
				$candidate_key = (string) $raw_id;
			} elseif ( is_string( $raw_pid ) && ! ctype_digit( $raw_pid ) && '' !== $raw_pid ) {
				$candidate_key = $raw_pid;
			} elseif ( (int) $raw_pid > 0 ) {
				$candidate_key = (string) (int) $raw_pid;
			}

			if ( '' === $candidate_key || ! in_array( $candidate_key, $allowed, true ) ) {
				return new WP_Error( 'invalid_bean', __( 'دان انتخاب‌شده در کاتالوگ نیست.', 'webino-dashboard' ), array( 'status' => 400 ) );
			}

			$pid     = ctype_digit( $candidate_key ) ? (int) $candidate_key : (int) $raw_pid;
			$bean_id = ctype_digit( $candidate_key ) ? '' : $candidate_key;
			$roast   = sanitize_key( (string) ( $row['roast'] ?? 'medium' ) );
			if ( ! in_array( $roast, $roast_ids, true ) ) {
				$roast = $roast_ids ? $roast_ids[0] : 'medium';
			}
			$beans[]  = array(
				'id'         => '' !== $bean_id ? $bean_id : $pid,
				'bean_id'    => $bean_id,
				'product_id' => max( 0, $pid ),
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
		if ( ! in_array( $type, array( 'cash', 'retail', 'credit', 'installment', 'wholesale' ), true ) ) {
			$type = 'cash';
		}
		if ( 'retail' === $type ) {
			$type = 'cash';
		}
		$months = max( 0, (int) ( $raw['installment_months'] ?? 0 ) );

		$blend_name = sanitize_text_field( (string) ( $raw['blend_name'] ?? '' ) );
		$blend_name = trim( $blend_name );
		if ( function_exists( 'mb_substr' ) ) {
			$blend_name = mb_substr( $blend_name, 0, 40 );
		} else {
			$blend_name = substr( $blend_name, 0, 40 );
		}

		return array(
			'mode'               => $mode,
			'beans'              => $beans,
			'grind'              => $grind,
			'grind_device'       => $device,
			'weight_g'           => $weight,
			'purchase_type'      => $type,
			'installment_months' => $months,
			'blend_name'         => $blend_name,
		);
	}

	/**
	 * Allowed bean/mix keys for a given mode.
	 *
	 * @param string              $mode Mode.
	 * @param array<string,mixed> $settings Settings.
	 * @return list<string>
	 */
	private static function allowed_bean_keys( $mode, $settings ) {
		$keys     = array();
		$has_pricing = class_exists( 'Webino_Dashboard_Coffee_Pricing', false );
		$computed    = $has_pricing ? Webino_Dashboard_Coffee_Pricing::computed() : array();

		if ( 'simple' === $mode ) {
			if ( (int) $settings['robusta_product_id'] > 0 ) {
				$keys[] = (string) (int) $settings['robusta_product_id'];
			}
			if ( (int) $settings['arabica_product_id'] > 0 ) {
				$keys[] = (string) (int) $settings['arabica_product_id'];
			}
			foreach ( (array) ( $computed['base_mixes'] ?? array() ) as $m ) {
				if ( is_array( $m ) && ! empty( $m['id'] ) ) {
					$keys[] = 'mix:' . (string) $m['id'];
				}
			}
			foreach ( (array) ( $computed['beans'] ?? array() ) as $b ) {
				if ( is_array( $b ) && ! empty( $b['id'] ) ) {
					$keys[] = (string) $b['id'];
				}
			}
			return array_values( array_unique( $keys ) );
		}

		$source = sanitize_key( (string) ( $settings['source'] ?? 'pricing' ) );
		if ( ( 'pricing' === $source || '' === $source ) && $has_pricing ) {
			foreach ( (array) ( $computed['beans'] ?? array() ) as $b ) {
				if ( is_array( $b ) && ! empty( $b['id'] ) ) {
					$keys[] = (string) $b['id'];
					if ( ! empty( $b['product_id'] ) ) {
						$keys[] = (string) (int) $b['product_id'];
					}
				}
			}
			foreach ( (array) ( $computed['base_mixes'] ?? array() ) as $m ) {
				if ( is_array( $m ) && ! empty( $m['id'] ) ) {
					$keys[] = 'mix:' . (string) $m['id'];
				}
			}
			return array_values( array_unique( $keys ) );
		}

		foreach ( self::catalog_product_ids() as $pid ) {
			$keys[] = (string) (int) $pid;
		}
		return array_values( array_unique( $keys ) );
	}

	/**
	 * Build Simple-mode style groups (Classic / Luxury / Economy) derived from main beans.
	 *
	 * @param array<string,mixed>|null $computed Computed pricing.
	 * @return array<int,array<string,mixed>>
	 */
	private static function build_simple_styles( $computed ) {
		if ( ! is_array( $computed ) ) {
			return array();
		}
		$styles     = array();
		$shop_cfg   = isset( $computed['shop_styles'] ) && is_array( $computed['shop_styles'] ) ? $computed['shop_styles'] : array();
		$classic_r  = self::map_pricing_mix( (string) ( $shop_cfg['classic']['robusta_mix_id'] ?? 'classic_robusta' ), $computed );
		$classic_a  = self::map_pricing_mix( (string) ( $shop_cfg['classic']['arabica_mix_id'] ?? 'classic_arabica' ), $computed );
		if ( $classic_r || $classic_a ) {
			$styles[] = array(
				'id'      => 'classic',
				'label'   => 'کلاسیک',
				'robusta' => $classic_r,
				'arabica' => $classic_a,
			);
		}
		$luxury_r = self::map_pricing_mix( (string) ( $shop_cfg['luxury']['robusta_mix_id'] ?? 'base_arabica' ), $computed );
		$luxury_a = self::map_pricing_mix( (string) ( $shop_cfg['luxury']['arabica_mix_id'] ?? 'luxury_arabica' ), $computed );
		if ( $luxury_r || $luxury_a ) {
			$styles[] = array(
				'id'      => 'luxury',
				'label'   => 'لاکچری',
				'robusta' => $luxury_r,
				'arabica' => $luxury_a,
			);
		}
		$eco      = isset( $computed['economy'] ) && is_array( $computed['economy'] ) ? $computed['economy'] : array();
		$eco_r_id = (string) ( $eco['robusta_bean_id'] ?? '' );
		$eco_a_id = (string) ( $eco['arabica_bean_id'] ?? '' );
		$eco_r    = null;
		$eco_a    = null;
		foreach ( (array) ( $computed['beans'] ?? array() ) as $b ) {
			if ( is_array( $b ) && ( $b['id'] ?? '' ) === $eco_r_id ) {
				$eco_r = self::map_pricing_bean( $b, false );
			}
			if ( is_array( $b ) && ( $b['id'] ?? '' ) === $eco_a_id ) {
				$eco_a = self::map_pricing_bean( $b, false );
			}
		}
		if ( $eco_r || $eco_a ) {
			$styles[] = array(
				'id'      => 'economy',
				'label'   => 'اقتصادی',
				'robusta' => $eco_r,
				'arabica' => $eco_a,
			);
		}
		return $styles;
	}

	/**
	 * Public payload for the wizard.
	 *
	 * @return array<string,mixed>
	 */
	public static function public_config() {
		$settings = self::get_settings();
		$profile  = Webino_Dashboard_Coffee_Profile::get_settings();
		$computed = class_exists( 'Webino_Dashboard_Coffee_Pricing', false )
			? Webino_Dashboard_Coffee_Pricing::computed()
			: null;

		$simple_styles = self::build_simple_styles( $computed );
		$simple        = array(
			'robusta' => (int) $settings['robusta_product_id'] > 0
				? self::map_bean( (int) $settings['robusta_product_id'] )
				: ( $simple_styles[0]['robusta'] ?? null ),
			'arabica' => (int) $settings['arabica_product_id'] > 0
				? self::map_bean( (int) $settings['arabica_product_id'] )
				: ( $simple_styles[0]['arabica'] ?? null ),
		);

		$presets = array();
		if ( is_array( $computed ) ) {
			foreach ( (array) ( $computed['base_mixes'] ?? array() ) as $mix ) {
				$mapped_mix = self::map_pricing_mix( (string) ( $mix['id'] ?? '' ), $computed, false );
				if ( $mapped_mix ) {
					$presets[] = $mapped_mix;
				}
			}
		}

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
			'simple_styles'    => ( (int) $settings['robusta_product_id'] > 0 || (int) $settings['arabica_product_id'] > 0 ) ? array() : $simple_styles,
			'presets'          => $presets,
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
		$blend_name = isset( $quote['recipe']['blend_name'] ) ? trim( (string) $quote['recipe']['blend_name'] ) : '';
		if ( '' !== $blend_name ) {
			$item_data[] = array(
				'key'   => __( 'نام ترکیب', 'webino-dashboard' ),
				'value' => $blend_name,
			);
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
		foreach ( $cart->get_cart() as $cart_item_key => $item ) {
			if ( empty( $item[ self::CART_KEY ] ) || empty( $item['data'] ) || ! is_array( $item[ self::CART_KEY ] ) ) {
				continue;
			}
			$recipe = $item[ self::CART_KEY ];
			if ( ! empty( $item['wfcp_purchase_type'] ) ) {
				$ptype = sanitize_key( (string) $item['wfcp_purchase_type'] );
				if ( in_array( $ptype, array( 'cash', 'retail', 'credit', 'installment', 'wholesale' ), true ) ) {
					$recipe['purchase_type'] = 'retail' === $ptype ? 'cash' : $ptype;
				}
			}
			if ( ! empty( $item['wfcp_installment_months'] ) ) {
				$recipe['installment_months'] = (int) $item['wfcp_installment_months'];
			}
			$quote = self::quote( $recipe );
			if ( is_wp_error( $quote ) ) {
				continue;
			}
			$item['data']->set_price( (float) $quote['line_price'] );
			if ( isset( $cart->cart_contents[ $cart_item_key ] ) ) {
				$cart->cart_contents[ $cart_item_key ][ self::CART_KEY ] = $quote['recipe'];
				if ( 'installment' === $quote['recipe']['purchase_type'] ) {
					$cart->cart_contents[ $cart_item_key ]['wfcp_installment_total'] = (float) $quote['line_price'];
				}
			}
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
		$blend_name = isset( $quote['recipe']['blend_name'] ) ? trim( (string) $quote['recipe']['blend_name'] ) : '';
		if ( '' !== $blend_name ) {
			$item->add_meta_data( __( 'نام ترکیب', 'webino-dashboard' ), $blend_name, false );
		}
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
		$blend_name = isset( $quote['recipe']['blend_name'] ) ? trim( (string) $quote['recipe']['blend_name'] ) : '';
		$name_len   = function_exists( 'mb_strlen' ) ? mb_strlen( $blend_name ) : strlen( $blend_name );
		if ( $name_len < 2 ) {
			wp_send_json_error( array( 'message' => __( 'برای افزودن به سبد، نام ترکیب را وارد کنید.', 'webino-dashboard' ) ), 400 );
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
	 * Resolve accurate per-kg purchase price & WFCP context product ID for a WooCommerce product.
	 * Uses coffee pricing composition first when available, then picks the matching variation and scales by variation grams.
	 *
	 * @param WC_Product               $product Product.
	 * @param array<string,mixed>|null $profile Optional coffee profile.
	 * @return array{per_kg:float,price_id:int}
	 */
	private static function resolve_wc_product_per_kg( $product, $profile = null ) {
		$pid     = (int) $product->get_id();
		$profile = is_array( $profile ) ? $profile : Webino_Dashboard_Coffee_Profile::get_profile( $pid );
		$settings = self::get_settings();

		if ( class_exists( 'Webino_Dashboard_Coffee_Pricing', false ) ) {
			$from_recipe = Webino_Dashboard_Coffee_Pricing::purchase_per_kg_for_profile( $profile );
			if ( ! is_wp_error( $from_recipe ) && (float) $from_recipe > 0 ) {
				return array(
					'per_kg'   => (float) $from_recipe,
					'price_id' => self::pricing_product_id( $product ),
				);
			}
		}

		$target_id = $pid;
		$target    = $product;
		$grams     = isset( $profile['pack_weight_g'] ) ? (int) $profile['pack_weight_g'] : (int) $settings['default_pack_weight_g'];

		if ( $product->is_type( 'variable' ) ) {
			$best_vid   = 0;
			$best_v     = null;
			$best_grams = 0;
			foreach ( $product->get_children() as $vid ) {
				$vid = (int) $vid;
				$v   = function_exists( 'wc_get_product' ) ? wc_get_product( $vid ) : null;
				if ( ! $v ) {
					continue;
				}
				$vg = class_exists( 'Webino_Dashboard_Coffee_Pricing', false )
					? Webino_Dashboard_Coffee_Pricing::grams_from_variation( $v )
					: 0;
				$has_pp = class_exists( 'WFCP_Helper', false ) && null !== WFCP_Helper::get_product_purchase_price( $vid ) && (float) WFCP_Helper::get_product_purchase_price( $vid ) > 0;
				if ( 1000 === $vg && ( $has_pp || (float) $v->get_price() > 0 ) ) {
					$best_vid   = $vid;
					$best_v     = $v;
					$best_grams = 1000;
					break;
				}
				if ( 0 === $best_vid && ( $has_pp || (float) $v->get_price() > 0 ) ) {
					$best_vid   = $vid;
					$best_v     = $v;
					$best_grams = $vg;
				}
			}
			if ( $best_vid > 0 && $best_v ) {
				$target_id = $best_vid;
				$target    = $best_v;
				if ( $best_grams > 0 ) {
					$grams = $best_grams;
				}
			}
		}

		$purchase = self::product_purchase( $target_id, $target );
		if ( 'pack' !== $settings['price_basis'] ) {
			return array(
				'per_kg'   => (float) $purchase,
				'price_id' => $target_id,
			);
		}
		$grams = max( 1, (int) $grams );
		return array(
			'per_kg'   => (float) $purchase / ( $grams / 1000 ),
			'price_id' => $target_id,
		);
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
	 * @param WC_Product $product Product or variation.
	 * @return float
	 */
	private static function product_purchase( $product_id, $product ) {
		if ( class_exists( 'WFCP_Helper', false ) ) {
			$pp = WFCP_Helper::get_product_purchase_price( $product_id );
			if ( null !== $pp && $pp > 0 ) {
				return (float) $pp;
			}
		}
		$src = ( (int) $product_id !== (int) $product->get_id() && function_exists( 'wc_get_product' ) )
			? ( wc_get_product( $product_id ) ?: $product )
			: $product;
		$reg = (float) $src->get_regular_price();
		if ( $reg <= 0 ) {
			$reg = (float) $src->get_price();
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
		$name = isset( $recipe['blend_name'] ) ? trim( (string) $recipe['blend_name'] ) : '';
		if ( '' !== $name ) {
			$prefix = 'قهوه';
			$starts = function_exists( 'mb_stripos' )
				? ( 0 === mb_stripos( $name, $prefix ) )
				: ( 0 === stripos( $name, $prefix ) );
			return $starts ? $name : $prefix . ' ' . $name;
		}
		$bits = array();
		foreach ( $lines as $line ) {
			$bits[] = $line['name'] . ' ' . (int) round( $line['percent'] ) . '٪';
		}
		$w = (int) $recipe['weight_g'];
		return __( 'ترکیب شخصی', 'webino-dashboard' ) . ': ' . implode( ' + ', $bits ) . ' · ' . $w . 'g';
	}
}
