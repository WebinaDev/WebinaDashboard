<?php
/**
 * Storefront coffee finder shortcode + public REST.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * [webino_coffee_search] — filter coffee products by bean / acidity / bitterness / caffeine.
 */
class Webino_Dashboard_Coffee_Search {

	const REST_NS = 'webino-dashboard/v1';

	/**
	 * @return void
	 */
	public static function init() {
		add_shortcode( 'webino_coffee_search', array( __CLASS__, 'shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		register_rest_route(
			self::REST_NS,
			'/public/coffee-search',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_search' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function rest_search( $request ) {
		$filters = self::sanitize_filters(
			array(
				'bean'       => $request->get_param( 'bean' ),
				'acidity'    => $request->get_param( 'acidity' ),
				'bitterness' => $request->get_param( 'bitterness' ),
				'caffeine'   => $request->get_param( 'caffeine' ),
				'page'       => $request->get_param( 'page' ),
				'limit'      => $request->get_param( 'limit' ),
				'columns'    => $request->get_param( 'columns' ),
			)
		);
		return new WP_REST_Response( self::run_search( $filters ) );
	}

	/**
	 * @return void
	 */
	public static function enqueue() {
		if ( is_admin() ) {
			return;
		}
		$need = is_singular() && has_shortcode( (string) get_post_field( 'post_content', get_the_ID() ), 'webino_coffee_search' );
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
		$dir  = dirname( __DIR__ ) . '/public/search/';
		$base = defined( 'WEBINO_DASHBOARD_FILE' )
			? plugins_url( 'Modules/coffee-profile-module/public/search/', WEBINO_DASHBOARD_FILE )
			: plugins_url( 'public/search/', dirname( __DIR__ ) . '/bootstrap.php' );
		$css = $dir . 'coffee-search.css';
		$js  = $dir . 'coffee-search.js';
		if ( is_readable( $css ) ) {
			wp_enqueue_style( 'webino-coffee-search', $base . 'coffee-search.css', array(), (string) filemtime( $css ) );
		}
		if ( is_readable( $js ) ) {
			wp_enqueue_script( 'webino-coffee-search', $base . 'coffee-search.js', array(), (string) filemtime( $js ), true );
			wp_localize_script(
				'webino-coffee-search',
				'webinoCoffeeSearch',
				array(
					'rest' => rest_url( self::REST_NS . '/public/coffee-search' ),
				)
			);
		}
	}

	/**
	 * @param array<string,mixed>|string $atts Shortcode atts.
	 * @return string
	 */
	public static function shortcode( $atts ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return '';
		}
		self::enqueue_assets();
		$atts = shortcode_atts(
			array(
				'title'   => __( 'قهوه دلخواهت رو پیدا کن', 'webino-dashboard' ),
				'lead'    => __( 'بر اساس نوع دانه، اسیدیته، تلخی و کافئین فیلتر کن و طعم دلخواهت رو کشف کن.', 'webino-dashboard' ),
				'limit'   => 12,
				'columns' => 4,
			),
			is_array( $atts ) ? $atts : array()
		);
		$limit   = max( 1, min( 48, (int) $atts['limit'] ) );
		$columns = max( 2, min( 6, (int) $atts['columns'] ) );
		$posted  = isset( $_GET['wcs'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$filters = self::sanitize_filters(
			array(
				'bean'       => isset( $_GET['wcs_bean'] ) ? wp_unslash( $_GET['wcs_bean'] ) : '', // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				'acidity'    => isset( $_GET['wcs_acidity'] ) ? wp_unslash( $_GET['wcs_acidity'] ) : '', // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				'bitterness' => isset( $_GET['wcs_bitterness'] ) ? wp_unslash( $_GET['wcs_bitterness'] ) : '', // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				'caffeine'   => isset( $_GET['wcs_caffeine'] ) ? wp_unslash( $_GET['wcs_caffeine'] ) : '', // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				'page'       => isset( $_GET['wcs_page'] ) ? wp_unslash( $_GET['wcs_page'] ) : 1, // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				'limit'      => $limit,
				'columns'    => $columns,
			)
		);
		$result = $posted ? self::run_search( $filters ) : array(
			'html'    => '',
			'found'   => 0,
			'pages'   => 0,
			'page'    => 1,
			'message' => '',
		);

		$title = sanitize_text_field( (string) $atts['title'] );
		$lead  = sanitize_text_field( (string) $atts['lead'] );
		$bean  = $filters['bean'];
		$acid  = $filters['acidity'];
		$bitter = $filters['bitterness'];
		$caff  = $filters['caffeine'];

		ob_start();
		$partial = dirname( __DIR__ ) . '/public/partials/search.php';
		if ( is_readable( $partial ) ) {
			include $partial;
		}
		return (string) ob_get_clean();
	}

	/**
	 * @param array<string,mixed> $raw Raw filters.
	 * @return array<string,mixed>
	 */
	public static function sanitize_filters( $raw ) {
		if ( ! is_array( $raw ) ) {
			$raw = array();
		}
		$bean = sanitize_key( (string) ( $raw['bean'] ?? '' ) );
		if ( ! in_array( $bean, array( 'arabica', 'mix', 'single' ), true ) ) {
			$bean = '';
		}
		$levels = array( 'low', 'mid', 'high' );
		$acid   = sanitize_key( (string) ( $raw['acidity'] ?? '' ) );
		$bitter = sanitize_key( (string) ( $raw['bitterness'] ?? '' ) );
		$caff   = sanitize_key( (string) ( $raw['caffeine'] ?? '' ) );
		return array(
			'bean'       => $bean,
			'acidity'    => in_array( $acid, $levels, true ) ? $acid : '',
			'bitterness' => in_array( $bitter, $levels, true ) ? $bitter : '',
			'caffeine'   => in_array( $caff, $levels, true ) ? $caff : '',
			'page'       => max( 1, (int) ( $raw['page'] ?? 1 ) ),
			'limit'      => max( 1, min( 48, (int) ( $raw['limit'] ?? 12 ) ) ),
			'columns'    => max( 2, min( 6, (int) ( $raw['columns'] ?? 4 ) ) ),
		);
	}

	/**
	 * @param array<string,mixed> $filters Filters.
	 * @return array{html:string,found:int,pages:int,page:int,message:string}
	 */
	public static function run_search( $filters ) {
		self::ensure_search_index();
		$settings = Webino_Dashboard_Coffee_Profile::get_settings();
		$meta     = array(
			'relation' => 'AND',
			array(
				'key'     => Webino_Dashboard_Coffee_Profile::META_KEY,
				'compare' => 'EXISTS',
			),
		);

		$holder = 0;
		if ( class_exists( 'Webino_Dashboard_Coffee_Blend', false ) ) {
			$blend  = Webino_Dashboard_Coffee_Blend::get_settings();
			$holder = (int) ( $blend['holder_product_id'] ?? 0 );
		}

		self::append_bean_query( $meta, (string) $filters['bean'] );
		self::append_scale_query( $meta, Webino_Dashboard_Coffee_Profile::INDEX_ACIDITY, (string) $filters['acidity'], (int) $settings['scale_min'], (int) $settings['scale_max'] );
		self::append_scale_query( $meta, Webino_Dashboard_Coffee_Profile::INDEX_BITTERNESS, (string) $filters['bitterness'], (int) $settings['scale_min'], (int) $settings['scale_max'] );
		self::append_caffeine_query( $meta, (string) $filters['caffeine'], (int) $settings['caffeine_max'] );

		$args = array(
			'post_type'           => 'product',
			'post_status'         => 'publish',
			'posts_per_page'      => (int) $filters['limit'],
			'paged'               => (int) $filters['page'],
			'orderby'             => 'title',
			'order'               => 'ASC',
			'ignore_sticky_posts' => true,
			'meta_query'          => $meta,
		);
		if ( taxonomy_exists( 'product_visibility' ) ) {
			$args['tax_query'] = array(
				array(
					'taxonomy' => 'product_visibility',
					'field'    => 'name',
					'terms'    => array( 'exclude-from-catalog', 'exclude-from-search' ),
					'operator' => 'NOT IN',
				),
			);
		}
		if ( $holder > 0 ) {
			$args['post__not_in'] = array( $holder );
		}

		$query = new WP_Query( $args );
		$found = (int) $query->found_posts;
		$pages = max( 1, (int) $query->max_num_pages );
		$page  = (int) $filters['page'];
		$html  = self::render_grid( $query, (int) $filters['columns'], $found, $page, $pages );
		wp_reset_postdata();

		$message = '';
		if ( $found < 1 ) {
			$message = __( 'محصولی با این ترکیب پیدا نشد.', 'webino-dashboard' );
		}

		return array(
			'html'    => $html,
			'found'   => $found,
			'pages'   => $found > 0 ? $pages : 0,
			'page'    => $page,
			'message' => $message,
		);
	}

	/**
	 * @param WP_Query $query   Query.
	 * @param int      $columns Columns.
	 * @param int      $found   Found count.
	 * @param int      $page    Page.
	 * @param int      $pages   Pages.
	 * @return string
	 */
	private static function render_grid( $query, $columns, $found, $page, $pages ) {
		if ( ! $query->have_posts() ) {
			return '<p class="wcs-empty">' . esc_html__( 'محصولی با این ترکیب پیدا نشد.', 'webino-dashboard' ) . '</p>';
		}
		self::ensure_wc_loop();
		$columns = max( 2, min( 6, (int) $columns ) );
		if ( function_exists( 'wc_setup_loop' ) ) {
			wc_setup_loop(
				array(
					'columns'      => $columns,
					'name'         => 'webino_coffee_search',
					'is_shortcode' => true,
					'total'        => $found,
					'total_pages'  => $pages,
					'per_page'     => (int) $query->get( 'posts_per_page' ),
					'current_page' => $page,
				)
			);
		}
		ob_start();
		echo '<div class="wcs-grid woocommerce columns-' . esc_attr( (string) $columns ) . '">';
		if ( function_exists( 'woocommerce_product_loop_start' ) ) {
			woocommerce_product_loop_start();
		} else {
			echo '<ul class="products columns-' . esc_attr( (string) $columns ) . '">';
		}
		while ( $query->have_posts() ) {
			$query->the_post();
			if ( function_exists( 'wc_get_template_part' ) ) {
				wc_get_template_part( 'content', 'product' );
			}
		}
		if ( function_exists( 'woocommerce_product_loop_end' ) ) {
			woocommerce_product_loop_end();
		} else {
			echo '</ul>';
		}
		echo '</div>';
		if ( $pages > 1 ) {
			echo '<nav class="wcs-pages" aria-label="' . esc_attr__( 'صفحات نتایج', 'webino-dashboard' ) . '">';
			for ( $i = 1; $i <= $pages; $i++ ) {
				$cls = $i === $page ? ' is-current' : '';
				echo '<button type="button" class="wcs-page' . esc_attr( $cls ) . '" data-page="' . esc_attr( (string) $i ) . '">' . esc_html( (string) $i ) . '</button>';
			}
			echo '</nav>';
		}
		if ( function_exists( 'wc_reset_loop' ) ) {
			wc_reset_loop();
		}
		return (string) ob_get_clean();
	}

	/**
	 * WooCommerce loop helpers are not always loaded in REST.
	 *
	 * @return void
	 */
	private static function ensure_wc_loop() {
		if ( ! function_exists( 'WC' ) || ! WC() ) {
			return;
		}
		if ( ! function_exists( 'woocommerce_product_loop_start' ) && is_callable( array( WC(), 'frontend_includes' ) ) ) {
			WC()->frontend_includes();
		}
	}

	/**
	 * @param array<int,mixed> $meta Meta query (by ref).
	 * @param string           $bean Bean key.
	 * @return void
	 */
	private static function append_bean_query( &$meta, $bean ) {
		if ( 'arabica' === $bean ) {
			$meta[] = array(
				'key'     => Webino_Dashboard_Coffee_Profile::INDEX_ARABICA,
				'value'   => 90,
				'compare' => '>=',
				'type'    => 'NUMERIC',
			);
			$meta[] = array(
				'key'     => Webino_Dashboard_Coffee_Profile::INDEX_ROBUSTA,
				'value'   => 10,
				'compare' => '<=',
				'type'    => 'NUMERIC',
			);
			return;
		}
		if ( 'mix' === $bean ) {
			$meta[] = array(
				'key'     => Webino_Dashboard_Coffee_Profile::INDEX_ARABICA,
				'value'   => 10,
				'compare' => '>',
				'type'    => 'NUMERIC',
			);
			$meta[] = array(
				'key'     => Webino_Dashboard_Coffee_Profile::INDEX_ROBUSTA,
				'value'   => 10,
				'compare' => '>',
				'type'    => 'NUMERIC',
			);
			return;
		}
		if ( 'single' === $bean ) {
			$meta[] = array(
				'key'     => Webino_Dashboard_Coffee_Profile::INDEX_ARABICA,
				'value'   => 90,
				'compare' => '>=',
				'type'    => 'NUMERIC',
			);
			$meta[] = array(
				'key'     => Webino_Dashboard_Coffee_Profile::INDEX_ORIGIN_COUNT,
				'value'   => 1,
				'compare' => '=',
				'type'    => 'NUMERIC',
			);
		}
	}

	/**
	 * @param array<int,mixed> $meta  Meta query.
	 * @param string           $key   Meta key.
	 * @param string           $level low|mid|high.
	 * @param int              $min   Scale min.
	 * @param int              $max   Scale max.
	 * @return void
	 */
	private static function append_scale_query( &$meta, $key, $level, $min, $max ) {
		$range = self::scale_range( $level, $min, $max );
		if ( ! $range ) {
			return;
		}
		$meta[] = array(
			'key'     => $key,
			'value'   => array( $range[0], $range[1] ),
			'compare' => 'BETWEEN',
			'type'    => 'NUMERIC',
		);
	}

	/**
	 * @param array<int,mixed> $meta  Meta query.
	 * @param string           $level low|mid|high.
	 * @param int              $caff_max Display max mg.
	 * @return void
	 */
	private static function append_caffeine_query( &$meta, $level, $caff_max ) {
		$caff_max = max( 1, (int) $caff_max );
		$low_end  = (int) floor( $caff_max * 0.33 );
		$mid_end  = (int) floor( $caff_max * 0.66 );
		if ( 'low' === $level ) {
			$from = 0;
			$to   = max( 0, $low_end );
		} elseif ( 'mid' === $level ) {
			$from = $low_end + 1;
			$to   = max( $from, $mid_end );
		} elseif ( 'high' === $level ) {
			$from = $mid_end + 1;
			$to   = 5000;
		} else {
			return;
		}
		$meta[] = array(
			'key'     => Webino_Dashboard_Coffee_Profile::INDEX_CAFFEINE,
			'value'   => array( $from, $to ),
			'compare' => 'BETWEEN',
			'type'    => 'NUMERIC',
		);
	}

	/**
	 * @param string $level low|mid|high.
	 * @param int    $min   Min.
	 * @param int    $max   Max.
	 * @return array{0:int,1:int}|null
	 */
	private static function scale_range( $level, $min, $max ) {
		$min = (int) $min;
		$max = (int) $max;
		if ( $max <= $min ) {
			$max = $min + 1;
		}
		$span  = $max - $min;
		$third = (int) floor( $span / 3 );
		$low_to = $min + max( 1, $third );
		$mid_to = $min + max( 2, $third * 2 );
		if ( 'low' === $level ) {
			return array( $min, $low_to );
		}
		if ( 'mid' === $level ) {
			return array( $low_to + 1, $mid_to );
		}
		if ( 'high' === $level ) {
			return array( $mid_to + 1, $max );
		}
		return null;
	}

	/**
	 * Index products that have a profile but no flattened search keys.
	 *
	 * @return void
	 */
	public static function ensure_search_index() {
		$q = new WP_Query(
			array(
				'post_type'              => 'product',
				'post_status'            => 'publish',
				'posts_per_page'         => 200,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
				'meta_query'             => array(
					'relation' => 'AND',
					array(
						'key'     => Webino_Dashboard_Coffee_Profile::META_KEY,
						'compare' => 'EXISTS',
					),
					array(
						'key'     => Webino_Dashboard_Coffee_Profile::INDEX_ARABICA,
						'compare' => 'NOT EXISTS',
					),
				),
			)
		);
		foreach ( (array) $q->posts as $id ) {
			Webino_Dashboard_Coffee_Profile::sync_search_index( (int) $id );
		}
	}
}
