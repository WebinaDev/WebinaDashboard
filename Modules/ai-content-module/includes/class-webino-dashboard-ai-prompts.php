<?php
/**
 * Prompt builders for AI content jobs.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * System + user prompts and JSON schemas.
 */
final class Webino_Dashboard_AI_Prompts {

	/**
	 * @return string
	 */
	public static function system_rules() {
		$s = Webino_Dashboard_AI_Content_Settings::get();
		$tpl = (string) ( $s['prompt_system'] ?? '' );
		if ( '' === trim( $tpl ) ) {
			$defs = Webino_Dashboard_AI_Content_Settings::default_prompts();
			$tpl  = $defs['prompt_system'];
		}
		return Webino_Dashboard_AI_Content_Settings::interpolate_prompt( $tpl, $s );
	}

	/**
	 * @param string $entity Entity.
	 * @return string
	 */
	public static function entity_instructions( $entity ) {
		$s    = Webino_Dashboard_AI_Content_Settings::get();
		$map  = array(
			'product'       => 'prompt_product',
			'product_cat'   => 'prompt_product_cat',
			'product_brand' => 'prompt_product_brand',
			'blog'          => 'prompt_blog',
			'blog_cat'      => 'prompt_blog_cat',
			'coffee'        => 'prompt_coffee',
		);
		$key = isset( $map[ $entity ] ) ? $map[ $entity ] : '';
		$tpl = $key ? (string) ( $s[ $key ] ?? '' ) : '';
		if ( '' === trim( $tpl ) && $key ) {
			$defs = Webino_Dashboard_AI_Content_Settings::default_prompts();
			$tpl  = (string) ( $defs[ $key ] ?? '' );
		}
		return Webino_Dashboard_AI_Content_Settings::interpolate_prompt( $tpl, $s );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function product_schema() {
		$full = array(
			'name'              => 'string',
			'slug'              => 'string-kebab',
			'short_description' => 'html-short',
			'description'       => 'html-long-with-h2-h3',
			'english_name'      => 'string',
			'tags'              => array( 'string' ),
			'focus_keyword'     => 'string',
			'seo'               => array(
				'title'                => 'string',
				'description'          => 'string',
				'focus_keyword'        => 'string',
				'breadcrumb_title'     => 'string',
				'facebook_title'       => 'string',
				'facebook_description' => 'string',
				'twitter_title'        => 'string',
				'twitter_description'  => 'string',
				'schema_type'          => 'product',
				'brand'                => 'string',
			),
			'faqs'              => array(
				array( 'question' => 'string', 'answer' => 'string' ),
			),
			'custom_labels'     => array(
				array( 'text' => 'string-short-shop-badge', 'color' => '#hex' ),
			),
			'ai_review_summary' => 'string',
			'attributes'        => array(
				array( 'name' => 'string', 'options' => array( 'string' ) ),
			),
			'related_product_ids' => array( 'int-from-related_products' ),
		);
		if ( Webino_Dashboard_AI_Content_Settings::coffee_enabled() ) {
			$full['coffee'] = array(
				'blend_arabica' => 'int-0-100',
				'blend_robusta' => 'int-0-100-sum-with-arabica-is-100',
				'acidity'       => (object) array( 'level_id' => 'int-within-scale' ),
				'caffeine_mg'   => 'int',
				'bitterness'    => 'int-within-scale',
				'sweetness'     => 'int-within-scale',
				'body'          => 'int-within-scale',
				'origin_ids'    => array( 'int-from-provided-origins' ),
				'visible'       => array(
					'blend'      => 'bool',
					'acidity'    => 'bool',
					'caffeine'   => 'bool',
					'bitterness' => 'bool',
					'sweetness'  => 'bool',
					'body'       => 'bool',
					'origin'     => 'bool',
				),
			);
		}
		return self::filter_schema( 'product', $full );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function blog_schema() {
		$full = array(
			'title'          => 'string',
			'slug'           => 'string-kebab',
			'excerpt'        => 'string',
			'content'        => 'html-long-with-h2-h3',
			'focus_keyword'  => 'string',
			'tags'           => array( 'string' ),
			'category_names' => array( 'string' ),
			'seo'            => array(
				'title'            => 'string',
				'description'      => 'string',
				'focus_keyword'    => 'string',
				'breadcrumb_title' => 'string',
				'schema_type'      => 'article',
			),
		);
		return self::filter_schema( 'blog', $full );
	}

	/**
	 * @param string $taxonomy Taxonomy.
	 * @return array<string,mixed>
	 */
	public static function term_schema( $taxonomy = 'product_cat' ) {
		$entity = Webino_Dashboard_AI_Content_Settings::entity_for_type( $taxonomy );
		$full   = array(
			'description'   => 'html-long',
			'focus_keyword' => 'string',
			'seo'           => array(
				'title'         => 'string',
				'description'   => 'string',
				'focus_keyword' => 'string',
				'schema_type'   => 'collectionpage',
			),
		);
		return self::filter_schema( $entity, $full );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function categories_schema() {
		return array(
			'categories' => array(
				array(
					'name'        => 'string',
					'slug'        => 'string',
					'description' => 'string',
					'parent'      => 'string-or-empty',
					'children'    => array( 'string' ),
				),
			),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function attribute_template_schema() {
		return array(
			'attributes' => array(
				array(
					'label'   => 'string',
					'slug'    => 'string',
					'options' => array( 'string' ),
				),
			),
		);
	}

	/**
	 * @param array<string,mixed> $ctx Context.
	 * @return string
	 */
	public static function product_user( $ctx ) {
		$s    = Webino_Dashboard_AI_Content_Settings::get();
		$faqs = Webino_Dashboard_AI_Content_Settings::field_spec( 'product', 'faqs' );
		$out  = array(
			'task'                  => self::entity_instructions( 'product' ),
			'product'               => $ctx,
			'min_description_words' => (int) $s['min_product_words'],
			'include_faqs'          => $faqs['enabled'] ? max( 1, $faqs['length'] ) : 0,
			'attribute_template'    => $ctx['attribute_template'] ?? array(),
			'related_products'      => $ctx['related'] ?? array(),
			'research_notes'        => $ctx['research_notes'] ?? '',
			'review_emojis'         => ! empty( $s['review_emojis'] ),
			'length_rules'          => Webino_Dashboard_AI_Content_Settings::length_instructions( 'product' ),
			'enabled_fields'        => array_keys( self::product_schema() ),
			'do_not_generate'       => array( 'video_url', 'video_cover_url', 'initial_stock_quantity', 'prices', 'images' ),
		);
		if ( ! empty( $ctx['coffee'] ) && Webino_Dashboard_AI_Content_Settings::coffee_enabled() ) {
			$out['coffee_task']         = self::entity_instructions( 'coffee' );
			$out['coffee']              = $ctx['coffee'];
			$out['coffee_length_rules'] = Webino_Dashboard_AI_Content_Settings::length_instructions( 'coffee' );
		}
		return wp_json_encode( $out, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT );
	}

	/**
	 * @param array<string,mixed> $ctx Context.
	 * @return string
	 */
	public static function blog_user( $ctx ) {
		$s = Webino_Dashboard_AI_Content_Settings::get();
		return wp_json_encode(
			array(
				'task'          => self::entity_instructions( 'blog' ),
				'topic'         => $ctx['topic'] ?? '',
				'focus_keyword' => $ctx['focus_keyword'] ?? '',
				'secondary'     => $ctx['secondary_keywords'] ?? array(),
				'category'      => $ctx['category'] ?? '',
				'related'       => $ctx['related'] ?? array(),
				'min_words'     => (int) $s['min_blog_words'],
				'publish_as'    => $s['auto_publish'] ? $s['publish_status'] : 'draft',
				'length_rules'  => Webino_Dashboard_AI_Content_Settings::length_instructions( 'blog' ),
				'enabled_fields'=> array_keys( self::blog_schema() ),
			),
			JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
		);
	}

	/**
	 * @param array<string,mixed> $ctx Context.
	 * @return string
	 */
	public static function term_user( $ctx ) {
		$tax    = sanitize_key( (string) ( $ctx['taxonomy'] ?? 'product_cat' ) );
		$entity = Webino_Dashboard_AI_Content_Settings::entity_for_type( $tax );
		$s      = Webino_Dashboard_AI_Content_Settings::get();
		return wp_json_encode(
			array(
				'task'          => self::entity_instructions( $entity ),
				'term'          => $ctx,
				'min_words'     => (int) $s['min_term_words'],
				'focus_keyword' => $ctx['focus_keyword'] ?? ( $ctx['name'] ?? '' ),
				'length_rules'  => Webino_Dashboard_AI_Content_Settings::length_instructions( $entity ),
				'enabled_fields'=> array_keys( self::term_schema( $tax ) ),
			),
			JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
		);
	}

	/**
	 * @param string              $kind blog|product.
	 * @param array<string,mixed> $ctx Context.
	 * @return string
	 */
	public static function suggest_categories_user( $kind, $ctx ) {
		$settings = Webino_Dashboard_AI_Content_Settings::get();
		$task     = 'blog' === $kind
			? 'Suggest blog category tree for this site niche.'
			: 'Suggest product categories for uncategorized products.';
		return wp_json_encode(
			array(
				'task'            => $task,
				'site_topic'      => $settings['site_topic'],
				'existing'        => $ctx['existing'] ?? array(),
				'product_samples' => $ctx['product_samples'] ?? array(),
				'regenerate_hint' => (string) ( $ctx['regenerate_hint'] ?? '' ),
			),
			JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
		);
	}

	/**
	 * @param array<string,mixed> $ctx Context.
	 * @return string
	 */
	public static function attr_template_user( $ctx ) {
		return wp_json_encode(
			array(
				'task'            => 'Propose WooCommerce global attributes for this product category. Fixed attribute set for all products in the category.',
				'category'        => $ctx['category'] ?? array(),
				'sample_products' => $ctx['sample_products'] ?? array(),
				'regenerate_hint' => (string) ( $ctx['regenerate_hint'] ?? '' ),
			),
			JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
		);
	}

	/**
	 * Drop disabled fields from a schema.
	 *
	 * @param string              $entity Entity.
	 * @param array<string,mixed> $schema Schema.
	 * @return array<string,mixed>
	 */
	private static function filter_schema( $entity, $schema ) {
		$out = array();
		foreach ( $schema as $key => $shape ) {
			$field = $key;
			if ( 'focus_keyword' === $key ) {
				$field = 'seo';
			}
			if ( ! Webino_Dashboard_AI_Content_Settings::field_enabled( $entity, $field ) ) {
				continue;
			}
			$out[ $key ] = $shape;
		}
		return $out ? $out : $schema;
	}
}
