<?php
/**
 * SEO / quality gate for AI-generated content.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Validates generated payloads against Rank Math–style and Google helpful-content heuristics.
 */
final class Webino_Dashboard_AI_Seo_Gate {

	/**
	 * @param array<string,mixed> $data Generated payload.
	 * @param string              $type product|blog|term|page.
	 * @param array<string,mixed> $ctx Context (site_name, focus_keyword, min_words…).
	 * @return true|WP_Error
	 */
	public static function validate( $data, $type, $ctx = array() ) {
		$settings  = Webino_Dashboard_AI_Content_Settings::get();
		$site_name = (string) ( $ctx['site_name'] ?? Webino_Dashboard_AI_Content_Settings::resolved_site_name( $settings ) );
		$focus     = mb_strtolower( trim( (string) ( $ctx['focus_keyword'] ?? ( $data['focus_keyword'] ?? '' ) ) ) );
		$title     = (string) ( $data['title'] ?? $data['name'] ?? $data['h1'] ?? '' );
		$slug      = (string) ( $data['slug'] ?? '' );
		$content   = (string) ( $data['content'] ?? $data['description'] ?? '' );
		if ( 'page' === $type && '' === trim( wp_strip_all_tags( $content ) ) ) {
			$content = self::flatten_page_blueprint( $data );
		}
		$short     = (string) ( $data['short_description'] ?? $data['excerpt'] ?? '' );
		$seo_title = (string) ( $data['seo_title'] ?? ( $data['seo']['title'] ?? '' ) );
		$seo_desc  = (string) ( $data['seo_description'] ?? ( $data['seo']['description'] ?? '' ) );

		$entity = 'product' === $type
			? 'product'
			: ( 'blog' === $type
				? 'blog'
				: ( 'page' === $type
					? 'page'
					: Webino_Dashboard_AI_Content_Settings::entity_for_type( (string) ( $ctx['exclude_type'] ?? 'product_cat' ) ) ) );
		$main_on = 'blog' === $type
			? Webino_Dashboard_AI_Content_Settings::field_enabled( 'blog', 'content' )
			: ( 'product' === $type
				? Webino_Dashboard_AI_Content_Settings::field_enabled( 'product', 'description' )
				: ( 'page' === $type
					? Webino_Dashboard_AI_Content_Settings::field_enabled( 'page', 'content' )
					: Webino_Dashboard_AI_Content_Settings::field_enabled( $entity, 'description' ) ) );
		$seo_on  = Webino_Dashboard_AI_Content_Settings::field_enabled( $entity, 'seo' );

		$text_plain = self::strip( $title . ' ' . $short . ' ' . $content );
		$body_plain = self::strip( $short . ' ' . $content );
		$words      = self::word_count( $text_plain );

		$min = (int) ( $ctx['min_words'] ?? 0 );
		if ( $min <= 0 ) {
			if ( 'blog' === $type ) {
				$min = (int) $settings['min_blog_words'];
			} elseif ( 'product' === $type ) {
				$min = (int) $settings['min_product_words'];
			} elseif ( 'page' === $type ) {
				$min = (int) ( $settings['min_page_words'] ?? 150 );
			} else {
				$min = (int) $settings['min_term_words'];
			}
		}

		if ( $main_on && $words < max( 50, (int) ( $min * 0.7 ) ) ) {
			return new WP_Error( 'ai_thin', sprintf( /* translators: %d: word count */ __( 'Content too thin (%d words).', 'webino-dashboard' ), $words ) );
		}

		if ( $main_on && ! empty( $settings['require_site_name'] ) && '' !== $site_name ) {
			if ( ! self::contains_kw( $text_plain, $site_name ) ) {
				return new WP_Error( 'ai_site_name', __( 'Site name missing from content.', 'webino-dashboard' ) );
			}
		}

		if ( $seo_on && '' === $focus ) {
			return new WP_Error( 'ai_focus', __( 'Focus keyword required.', 'webino-dashboard' ) );
		}

		if ( ! $seo_on ) {
			return true;
		}

		$resolved_title = $seo_title !== '' ? $seo_title : $title;
		$resolved_title = str_replace(
			array( '%title%', '%sitename%', '%sep%' ),
			array( $title, $site_name, (string) $settings['seo_sep'] ),
			$resolved_title
		);

		$checks = array(
			'title_kw' => self::contains_kw( $resolved_title, $focus ) || self::contains_kw( $title, $focus ),
			'slug_kw'  => '' === $slug || self::contains_kw( $slug, self::slugify_kw( $focus ) ),
		);
		if ( $main_on ) {
			// Rank Math–style: keyword must appear in short/body, not only product title / seo.title.
			$checks['content_kw'] = self::contains_kw( $body_plain, $focus );
		}

		if ( $seo_desc !== '' ) {
			$checks['desc_kw'] = self::contains_kw( $seo_desc, $focus );
		}

		$title_len = mb_strlen( self::strip( $resolved_title ) );
		$desc_len  = mb_strlen( self::strip( $seo_desc !== '' ? $seo_desc : $short ) );
		$checks['title_len'] = $title_len >= 10 && $title_len <= 70;
		$checks['desc_len']  = $desc_len >= 50 && $desc_len <= 180;

		$failed = array();
		foreach ( $checks as $id => $ok ) {
			if ( ! $ok ) {
				$failed[] = $id;
			}
		}

		// Allow at most one soft fail among length checks.
		$hard = array_values( array_diff( $failed, array( 'title_len', 'desc_len', 'slug_kw' ) ) );
		if ( count( $hard ) > 0 ) {
			return new WP_Error(
				'ai_seo',
				self::humanize_hard_fails( $hard ),
				array( 'failed' => $hard )
			);
		}

		$dup = self::check_duplicate_focus( $focus, (string) ( $ctx['exclude_type'] ?? '' ), (int) ( $ctx['exclude_id'] ?? 0 ) );
		if ( is_wp_error( $dup ) ) {
			return $dup;
		}

		return true;
	}

	/**
	 * Case-insensitive substring match with Persian/Arabic letter normalization.
	 *
	 * @param string $haystack Text.
	 * @param string $needle   Keyword.
	 * @return bool
	 */
	public static function contains_kw( $haystack, $needle ) {
		$needle = self::normalize_fa( $needle );
		if ( '' === $needle ) {
			return false;
		}
		return false !== mb_stripos( self::normalize_fa( $haystack ), $needle );
	}

	/**
	 * Normalize Persian/Arabic ye/kaf and whitespace for keyword matching.
	 *
	 * @param string $text Text.
	 * @return string
	 */
	public static function normalize_fa( $text ) {
		$text = mb_strtolower( trim( (string) $text ) );
		$text = str_replace( array( 'ي', 'ك', 'ۀ', 'ة' ), array( 'ی', 'ک', 'ه', 'ه' ), $text );
		$text = preg_replace( '/\s+/u', ' ', $text );
		return (string) $text;
	}

	/**
	 * Human-readable SEO hard-fail messages.
	 *
	 * @param array<int,string> $hard Failed check ids.
	 * @return string
	 */
	public static function humanize_hard_fails( array $hard ) {
		$map = array(
			'title_kw'   => __( 'Focus keyword missing from title.', 'webino-dashboard' ),
			'content_kw' => __( 'Focus keyword missing from product content.', 'webino-dashboard' ),
			'desc_kw'    => __( 'Focus keyword missing from SEO meta description.', 'webino-dashboard' ),
		);
		$parts = array();
		foreach ( $hard as $id ) {
			$id = (string) $id;
			$parts[] = isset( $map[ $id ] ) ? $map[ $id ] : $id;
		}
		return implode( ' ', $parts );
	}

	/**
	 * Inject exact focus keyword into short/body when only content_kw failed.
	 *
	 * @param array<string,mixed> $data     Payload.
	 * @param array<string,mixed> $gate_ctx Gate context.
	 * @param WP_Error            $gate     Gate error.
	 * @return array<string,mixed>|null Patched data or null if not applicable.
	 */
	public static function rescue_content_kw( array $data, array $gate_ctx, $gate ) {
		if ( ! ( $gate instanceof WP_Error ) || 'ai_seo' !== $gate->get_error_code() ) {
			return null;
		}
		$err_data = $gate->get_error_data( 'ai_seo' );
		$failed   = is_array( $err_data ) && isset( $err_data['failed'] ) && is_array( $err_data['failed'] )
			? array_values( $err_data['failed'] )
			: array();
		if ( array( 'content_kw' ) !== $failed ) {
			return null;
		}

		$focus = trim(
			(string) (
				$gate_ctx['focus_keyword']
				?? $data['focus_keyword']
				?? ( is_array( $data['seo'] ?? null ) ? ( $data['seo']['focus_keyword'] ?? '' ) : '' )
			)
		);
		if ( '' === $focus ) {
			return null;
		}

		if ( array_key_exists( 'short_description', $data ) || ( ! isset( $data['excerpt'] ) && ! isset( $data['description'] ) && ! isset( $data['content'] ) ) ) {
			$short = (string) ( $data['short_description'] ?? '' );
			$data['short_description'] = '' === $short
				? $focus
				: ( self::contains_kw( $short, $focus ) ? $short : ( $focus . '. ' . $short ) );
		} elseif ( array_key_exists( 'excerpt', $data ) ) {
			$excerpt = (string) $data['excerpt'];
			$data['excerpt'] = '' === $excerpt
				? $focus
				: ( self::contains_kw( $excerpt, $focus ) ? $excerpt : ( $focus . '. ' . $excerpt ) );
		} elseif ( array_key_exists( 'description', $data ) ) {
			$desc = (string) $data['description'];
			$data['description'] = '' === trim( wp_strip_all_tags( $desc ) )
				? '<p>' . esc_html( $focus ) . '</p>'
				: ( self::contains_kw( $desc, $focus ) ? $desc : ( '<p>' . esc_html( $focus ) . '</p>' . $desc ) );
		} elseif ( array_key_exists( 'content', $data ) ) {
			$body = (string) $data['content'];
			$data['content'] = '' === trim( wp_strip_all_tags( $body ) )
				? '<p>' . esc_html( $focus ) . '</p>'
				: ( self::contains_kw( $body, $focus ) ? $body : ( '<p>' . esc_html( $focus ) . '</p>' . $body ) );
		} else {
			$data['short_description'] = $focus;
		}

		return $data;
	}

	/**
	 * Visual gate for pass 1 layout skeleton.
	 *
	 * @param array<string,mixed> $data Layout blueprint.
	 * @return true|WP_Error
	 */
	public static function validate_page_layout( $data ) {
		if ( ! is_array( $data ) ) {
			return new WP_Error( 'ai_visual', __( 'Invalid page layout payload.', 'webino-dashboard' ) );
		}
		$sections = isset( $data['sections'] ) && is_array( $data['sections'] ) ? $data['sections'] : array();
		if ( count( $sections ) < 4 ) {
			return new WP_Error(
				'ai_visual',
				sprintf(
					/* translators: %d: section count */
					__( 'Page layout needs at least 4 sections (found %d).', 'webino-dashboard' ),
					count( $sections )
				)
			);
		}

		$block_count     = 0;
		$html_in_hero    = false;
		$html_in_cta     = false;
		$has_any_blocks  = false;

		foreach ( $sections as $si => $section ) {
			if ( ! is_array( $section ) ) {
				continue;
			}
			$blocks = isset( $section['blocks'] ) && is_array( $section['blocks'] ) ? $section['blocks'] : array();
			if ( ! $blocks ) {
				return new WP_Error( 'ai_visual', __( 'Every section must include blocks[].', 'webino-dashboard' ) );
			}
			$has_any_blocks = true;
			$block_count   += count( $blocks );
			$is_hero        = 0 === (int) $si;
			$is_cta         = (int) $si === count( $sections ) - 1;
			foreach ( $blocks as $block ) {
				if ( ! class_exists( 'Webino_Dashboard_AI_Elementor_Catalog', false ) ) {
					continue;
				}
				if ( ! Webino_Dashboard_AI_Elementor_Catalog::block_is_html_capable( $block ) ) {
					continue;
				}
				if ( $is_hero ) {
					$html_in_hero = true;
				}
				if ( $is_cta ) {
					$html_in_cta = true;
				}
			}
		}

		if ( ! $has_any_blocks || $block_count < 4 ) {
			return new WP_Error( 'ai_visual', __( 'Page layout blocks are empty or too sparse.', 'webino-dashboard' ) );
		}
		if ( ! $html_in_hero ) {
			return new WP_Error( 'ai_visual', __( 'Hero section needs an html-capable block (widget=html).', 'webino-dashboard' ) );
		}
		if ( ! $html_in_cta ) {
			return new WP_Error( 'ai_visual', __( 'Final CTA section needs an html-capable block (widget=html).', 'webino-dashboard' ) );
		}

		return true;
	}

	/**
	 * Ensure merged blueprint has visual html after pass 2.
	 *
	 * @param array<string,mixed> $data Merged blueprint.
	 * @return true|WP_Error
	 */
	public static function validate_page_visual( $data ) {
		if ( ! is_array( $data ) ) {
			return new WP_Error( 'ai_visual', __( 'Invalid page visual payload.', 'webino-dashboard' ) );
		}
		$sections = isset( $data['sections'] ) && is_array( $data['sections'] ) ? $data['sections'] : array();
		$html_blocks = 0;
		foreach ( $sections as $section ) {
			if ( ! is_array( $section ) ) {
				continue;
			}
			$blocks = isset( $section['blocks'] ) && is_array( $section['blocks'] ) ? $section['blocks'] : array();
			if ( ! $blocks ) {
				return new WP_Error( 'ai_visual', __( 'Section missing blocks after visual pass.', 'webino-dashboard' ) );
			}
			foreach ( $blocks as $block ) {
				if ( ! is_array( $block ) ) {
					continue;
				}
				$widget = sanitize_key( str_replace( '_', '-', (string) ( $block['widget'] ?? '' ) ) );
				$html   = trim( (string) ( $block['html'] ?? '' ) );
				if ( 'html' === $widget && '' !== $html ) {
					++$html_blocks;
				}
			}
		}
		if ( $html_blocks < 2 ) {
			return new WP_Error( 'ai_visual', __( 'Visual pass must fill at least two html blocks with cinematic markup.', 'webino-dashboard' ) );
		}
		return true;
	}

	/**
	 * Prevent keyword cannibalization across recent runs.
	 *
	 * @param string $focus Focus keyword.
	 * @param string $exclude_type Target type to ignore.
	 * @param int    $exclude_id Target id to ignore.
	 * @return true|WP_Error
	 */
	public static function check_duplicate_focus( $focus, $exclude_type = '', $exclude_id = 0 ) {
		global $wpdb;
		$table = Webino_Dashboard_AI_Content_Db::table( 'runs' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT id, target_type, target_id FROM {$table} WHERE focus_keyword = %s ORDER BY id DESC LIMIT 1",
				mb_strtolower( trim( $focus ) )
			),
			ARRAY_A
		);
		if ( ! $row ) {
			return true;
		}
		if ( $exclude_type && (string) $row['target_type'] === $exclude_type && (int) $row['target_id'] === (int) $exclude_id ) {
			return true;
		}
		return new WP_Error( 'ai_cannibal', __( 'Focus keyword already used recently. Choose another angle.', 'webino-dashboard' ) );
	}

	/**
	 * Record a successful generation for cannibalization checks.
	 *
	 * @param string $target_type Type.
	 * @param int    $target_id ID.
	 * @param string $focus Focus keyword.
	 * @param string $title Title.
	 * @param string $content Content.
	 * @return void
	 */
	public static function record_run( $target_type, $target_id, $focus, $title, $content ) {
		global $wpdb;
		$table = Webino_Dashboard_AI_Content_Db::table( 'runs' );
		$wpdb->insert(
			$table,
			array(
				'target_type'         => sanitize_key( $target_type ),
				'target_id'           => (int) $target_id,
				'focus_keyword'       => mb_strtolower( trim( (string) $focus ) ),
				'title_hash'          => hash( 'sha256', mb_strtolower( trim( self::strip( $title ) ) ) ),
				'content_fingerprint' => hash( 'sha256', mb_substr( self::strip( $content ), 0, 2000 ) ),
				'created_at'          => current_time( 'mysql', true ),
			),
			array( '%s', '%d', '%s', '%s', '%s', '%s' )
		);
	}

	/**
	 * Flatten page blueprint sections into plain text for SEO word counts.
	 *
	 * @param array<string,mixed> $data Blueprint.
	 * @return string
	 */
	public static function flatten_page_blueprint( $data ) {
		$parts = array();
		if ( ! empty( $data['h1'] ) ) {
			$parts[] = (string) $data['h1'];
		}
		if ( ! empty( $data['excerpt'] ) ) {
			$parts[] = (string) $data['excerpt'];
		}
		$sections = isset( $data['sections'] ) && is_array( $data['sections'] ) ? $data['sections'] : array();
		foreach ( $sections as $section ) {
			if ( ! is_array( $section ) ) {
				continue;
			}
			$c = isset( $section['content'] ) && is_array( $section['content'] ) ? $section['content'] : $section;
			foreach ( array( 'heading', 'subheading', 'eyebrow', 'text', 'html', 'cta_text' ) as $k ) {
				if ( ! empty( $c[ $k ] ) ) {
					$parts[] = (string) $c[ $k ];
				}
			}
			if ( ! empty( $c['items'] ) && is_array( $c['items'] ) ) {
				foreach ( $c['items'] as $item ) {
					if ( ! is_array( $item ) ) {
						continue;
					}
					foreach ( array( 'title', 'text', 'description', 'question', 'answer', 'name', 'role' ) as $ik ) {
						if ( ! empty( $item[ $ik ] ) ) {
							$parts[] = (string) $item[ $ik ];
						}
					}
				}
			}
			if ( ! empty( $c['faqs'] ) && is_array( $c['faqs'] ) ) {
				foreach ( $c['faqs'] as $faq ) {
					if ( ! is_array( $faq ) ) {
						continue;
					}
					$parts[] = (string) ( $faq['question'] ?? '' );
					$parts[] = (string) ( $faq['answer'] ?? '' );
				}
			}
			$blocks = isset( $section['blocks'] ) && is_array( $section['blocks'] ) ? $section['blocks'] : array();
			foreach ( $blocks as $block ) {
				if ( ! is_array( $block ) ) {
					continue;
				}
				if ( ! empty( $block['html'] ) ) {
					$parts[] = wp_strip_all_tags( (string) $block['html'] );
				}
				$st = isset( $block['settings'] ) && is_array( $block['settings'] ) ? $block['settings'] : $block;
				foreach ( array( 'title', 'text', 'heading', 'subheading', 'content' ) as $bk ) {
					if ( ! empty( $st[ $bk ] ) && is_string( $st[ $bk ] ) ) {
						$parts[] = $st[ $bk ];
					}
				}
				if ( ! empty( $st['items'] ) && is_array( $st['items'] ) ) {
					foreach ( $st['items'] as $bit ) {
						if ( ! is_array( $bit ) ) {
							continue;
						}
						foreach ( array( 'title', 'text', 'question', 'answer', 'name', 'role' ) as $ik ) {
							if ( ! empty( $bit[ $ik ] ) ) {
								$parts[] = (string) $bit[ $ik ];
							}
						}
					}
				}
			}
		}
		if ( ! empty( $data['page_css'] ) ) {
			// Ignore CSS for word count.
		}
		return implode( ' ', $parts );
	}

	/**
	 * @param string $html HTML.
	 * @return string
	 */
	public static function strip( $html ) {
		return trim( preg_replace( '/\s+/u', ' ', wp_strip_all_tags( (string) $html ) ) );
	}

	/**
	 * @param string $text Text.
	 * @return int
	 */
	public static function word_count( $text ) {
		$text = trim( (string) $text );
		if ( '' === $text ) {
			return 0;
		}
		$parts = preg_split( '/\s+/u', $text );
		return is_array( $parts ) ? count( array_filter( $parts ) ) : 0;
	}

	/**
	 * @param string $kw Keyword.
	 * @return string
	 */
	private static function slugify_kw( $kw ) {
		$kw = mb_strtolower( trim( $kw ) );
		$kw = preg_replace( '/\s+/u', '-', $kw );
		return (string) $kw;
	}
}
