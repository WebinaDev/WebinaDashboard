<?php
/**
 * Platform registry.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Registry of marketplace adapters.
 */
class WNC_Platform_Registry {

	/**
	 * @var array<string,WNC_Platform>|null
	 */
	private static $platforms = null;

	/**
	 * Boot adapters.
	 */
	public static function init() {
		if ( null !== self::$platforms ) {
			return;
		}
		self::$platforms = array(
			'digikala'   => new WNC_Digikala_Adapter(),
			'basalam'    => new WNC_Basalam_Adapter(),
			'technolife' => new WNC_Technolife_Adapter(),
			'snappshop'  => new WNC_Snappshop_Adapter(),
			'tapsishop'  => new WNC_Tapsishop_Adapter(),
			'zarehbin'   => new WNC_Zarehbin_Adapter(),
			'emalls'           => new WNC_Emalls_Adapter(),
			'snapppay-search'  => new WNC_SnappPay_Search_Adapter(),
			'torob'            => new WNC_Torob_Adapter(),
		);
		/**
		 * Filter registered platforms.
		 *
		 * @param array<string,WNC_Platform> $platforms Platforms.
		 */
		self::$platforms = apply_filters( 'wnc_platforms', self::$platforms );
	}

	/**
	 * All platforms.
	 *
	 * @return array<string,WNC_Platform>
	 */
	public static function all() {
		self::init();
		return self::$platforms;
	}

	/**
	 * Get one.
	 *
	 * @param string $id ID.
	 * @return WNC_Platform|null
	 */
	public static function get( $id ) {
		self::init();
		$id = sanitize_key( $id );
		return isset( self::$platforms[ $id ] ) ? self::$platforms[ $id ] : null;
	}

	/**
	 * Labels map.
	 *
	 * @return array<string,string>
	 */
	public static function labels() {
		$out = array();
		foreach ( self::all() as $id => $p ) {
			$out[ $id ] = $p->label();
		}
		return $out;
	}
}
