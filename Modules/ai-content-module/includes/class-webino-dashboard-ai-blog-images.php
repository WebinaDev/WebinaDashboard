<?php
/**
 * AI blog featured / inline image generation.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Build style-consistent blog images via GapGPT OpenAI image API.
 */
final class Webino_Dashboard_AI_Blog_Images {

	/**
	 * Generate featured (+ optional inline) images for a post.
	 *
	 * @param int                 $post_id Post ID.
	 * @param array<string,mixed> $opts Options: force, topic, focus_keyword.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function generate_for_post( $post_id, $opts = array() ) {
		$post_id = (int) $post_id;
		$post    = get_post( $post_id );
		if ( ! $post || 'post' !== $post->post_type ) {
			return new WP_Error( 'ai_blog_image', __( 'Post not found.', 'webino-dashboard' ), array( 'status' => 404 ) );
		}

		$settings = Webino_Dashboard_AI_Content_Settings::get();
		if ( empty( $settings['do_blog_image'] ) && empty( $opts['force'] ) ) {
			return array(
				'skipped' => true,
				'reason'  => 'disabled',
				'post_id' => $post_id,
			);
		}

		if ( ! empty( $settings['blog_image_skip_if_thumb'] ) && empty( $opts['force'] ) && has_post_thumbnail( $post_id ) ) {
			return array(
				'skipped' => true,
				'reason'  => 'has_thumbnail',
				'post_id' => $post_id,
			);
		}

		$topic = sanitize_text_field( (string) ( $opts['topic'] ?? $post->post_title ) );
		$focus = sanitize_text_field( (string) ( $opts['focus_keyword'] ?? '' ) );
		if ( '' === $focus ) {
			$focus = (string) get_post_meta( $post_id, 'rank_math_focus_keyword', true );
		}
		if ( '' === $focus ) {
			$focus = $topic;
		}

		$style_bible = self::style_bible( $settings );
		$scene       = self::scene_brief( $topic, $focus, $settings, 'hero' );
		$prompt      = self::compose_prompt( $scene, $style_bible, $settings, 'hero' );

		$size = self::size_for_aspect( (string) ( $settings['blog_image_aspect'] ?? '16:9' ) );
		$gen  = Webino_Dashboard_AI_Providers::generate_image(
			$prompt,
			array(
				'provider' => (string) ( $settings['blog_image_provider'] ?? 'gapgpt' ),
				'model'    => (string) ( $settings['blog_image_model'] ?? 'gpt-image-1' ),
				'size'     => $size,
				'quality'  => (string) ( $settings['blog_image_quality'] ?? 'hd' ),
			)
		);
		if ( is_wp_error( $gen ) ) {
			return $gen;
		}

		$att_id = self::sideload_to_media( $gen, $post_id, $topic );
		if ( is_wp_error( $att_id ) ) {
			return $att_id;
		}

		set_post_thumbnail( $post_id, (int) $att_id );
		update_post_meta( $post_id, '_webino_ai_blog_image_id', (int) $att_id );
		update_post_meta( $post_id, '_webino_ai_blog_image_prompt', $prompt );

		$inline_ids = array();
		$inline_n   = min( 3, max( 0, (int) ( $settings['blog_image_inline_count'] ?? 0 ) ) );
		if ( $inline_n > 0 ) {
			$inline_ids = self::generate_inline( $post_id, $topic, $focus, $settings, $style_bible, $inline_n );
		}

		return array(
			'ok'            => true,
			'post_id'       => $post_id,
			'attachment_id' => (int) $att_id,
			'inline_ids'    => $inline_ids,
			'provider'      => (string) ( $gen['provider'] ?? '' ),
			'model'         => (string) ( $gen['model'] ?? '' ),
			'summary'       => 'Featured image #' . (int) $att_id . ( $inline_ids ? ' + ' . count( $inline_ids ) . ' inline' : '' ),
		);
	}

	/**
	 * @param array<string,mixed> $settings Settings.
	 * @return string
	 */
	public static function style_bible( $settings ) {
		$aesthetic = (string) ( $settings['blog_image_aesthetic'] ?? 'vintage' );
		$era       = (string) ( $settings['blog_image_era'] ?? 'generic' );
		$medium    = (string) ( $settings['blog_image_medium'] ?? 'photorealistic' );
		$lighting  = (string) ( $settings['blog_image_lighting'] ?? 'natural' );
		$camera    = (string) ( $settings['blog_image_camera'] ?? '50mm' );
		$subject   = (string) ( $settings['blog_image_subject'] ?? 'product_lifestyle' );
		$site      = Webino_Dashboard_AI_Content_Settings::resolved_site_name( $settings );
		$topic     = (string) ( $settings['site_topic'] ?? '' );

		$parts = array(
			'Cohesive brand visual system for "' . $site . '" (' . $topic . ').',
			'Aesthetic: ' . str_replace( '_', ' ', $aesthetic ) . '.',
		);
		if ( in_array( $aesthetic, array( 'vintage', 'retro' ), true ) && 'generic' !== $era ) {
			$parts[] = 'Era reference: ' . $era . '.';
		}
		$parts[] = 'Medium/technique: ' . str_replace( '_', ' ', $medium ) . '.';
		$parts[] = 'Subject framing: ' . str_replace( '_', ' ', $subject ) . '.';
		$parts[] = 'Lighting: ' . str_replace( '_', ' ', $lighting ) . '.';

		$photo_media = array( 'photorealistic', 'cinematic_photo', 'film_photography', 'analog_film' );
		if ( in_array( $medium, $photo_media, true ) ) {
			$parts[] = 'Camera/lens feel: ' . $camera . '.';
			$parts[] = 'Photorealistic, real textures, natural materials — not CGI fake plastic.';
		}

		if ( ! empty( $settings['blog_image_use_palette'] ) ) {
			$memory  = class_exists( 'Webino_Dashboard_AI_Design_Memory', false )
				? Webino_Dashboard_AI_Design_Memory::get()
				: array();
			$palette = isset( $memory['palette'] ) && is_array( $memory['palette'] ) ? $memory['palette'] : array();
			$primary = (string) ( $palette['primary'] ?? '' );
			$accent  = (string) ( $palette['accent'] ?? '' );
			$weight  = (string) ( $settings['blog_image_palette_weight'] ?? 'dominant' );
			if ( $primary || $accent ) {
				$color_bits = array_filter( array( $primary, $accent ) );
				if ( 'subtle' === $weight ) {
					$parts[] = 'Subtle color grading influenced by brand hex ' . implode( ' and ', $color_bits ) . '.';
				} elseif ( 'overlay' === $weight ) {
					$parts[] = 'Strong color overlay / grade using brand hex ' . implode( ' / ', $color_bits ) . ' as dominant mood.';
				} else {
					$parts[] = 'Dominant brand colors in props, backgrounds, and grade: ' . implode( ', ', $color_bits ) . '.';
				}
			}
		}

		if ( ! empty( $settings['blog_image_no_text'] ) ) {
			$parts[] = 'No text, letters, logos, watermarks, captions, or UI chrome in the image.';
		}

		$extra = trim( (string) ( $settings['prompt_blog_image'] ?? '' ) );
		if ( '' !== $extra ) {
			$parts[] = $extra;
		}

		return implode( ' ', $parts );
	}

	/**
	 * @param string              $topic Topic.
	 * @param string              $focus Focus keyword.
	 * @param array<string,mixed> $settings Settings.
	 * @param string              $role hero|inline.
	 * @return string
	 */
	private static function scene_brief( $topic, $focus, $settings, $role ) {
		$subject = (string) ( $settings['blog_image_subject'] ?? 'product_lifestyle' );
		$niche   = (string) ( $settings['site_topic'] ?? '' );
		$base    = 'Scene for blog ' . ( 'hero' === $role ? 'hero/featured' : 'inline editorial' ) . ' image.';
		$base   .= ' Topic: ' . $topic . '. Focus: ' . $focus . '. Niche: ' . $niche . '.';
		$map     = array(
			'product_lifestyle' => 'Lifestyle product moment that fits an e-commerce niche, tasteful and inviting.',
			'still_life'        => 'Artful still-life composition of related objects on a surface.',
			'scene'             => 'Environmental scene that evokes the article theme without clutter.',
			'people'            => 'Tasteful people interacting with the theme (no identifiable celebrity faces).',
			'abstract'          => 'Abstract visual metaphor for the topic, brand-aligned.',
		);
		$base .= ' ' . ( $map[ $subject ] ?? $map['product_lifestyle'] );
		return $base;
	}

	/**
	 * @param string              $scene Scene.
	 * @param string              $style Style bible.
	 * @param array<string,mixed> $settings Settings.
	 * @param string              $role Role.
	 * @return string
	 */
	private static function compose_prompt( $scene, $style, $settings, $role ) {
		$aspect = (string) ( $settings['blog_image_aspect'] ?? '16:9' );
		return trim(
			$scene . "\n\nStyle bible (must match every image in this set):\n" . $style
			. "\n\nComposition: " . $aspect . ' aspect, ' . ( 'hero' === $role ? 'wide editorial hero framing' : 'supporting editorial detail' )
			. ', magazine-quality, cohesive with other images from the same style bible.'
		);
	}

	/**
	 * Map aspect preference to GapGPT / gpt-image supported sizes.
	 * Allowed: 1024x1024, 1024x1536, 1536x1024, auto.
	 *
	 * @param string $aspect Aspect ratio.
	 * @return string OpenAI size string.
	 */
	public static function size_for_aspect( $aspect ) {
		$map = array(
			'16:9' => '1536x1024',
			'4:3'  => '1536x1024',
			'1:1'  => '1024x1024',
			'9:16' => '1024x1536',
			'3:4'  => '1024x1536',
		);
		return isset( $map[ $aspect ] ) ? $map[ $aspect ] : '1536x1024';
	}

	/**
	 * @param int                 $post_id Post.
	 * @param string              $topic Topic.
	 * @param string              $focus Focus.
	 * @param array<string,mixed> $settings Settings.
	 * @param string              $style_bible Style.
	 * @param int                 $count Count.
	 * @return list<int>
	 */
	private static function generate_inline( $post_id, $topic, $focus, $settings, $style_bible, $count ) {
		$ids  = array();
		$size = self::size_for_aspect( (string) ( $settings['blog_image_aspect'] ?? '16:9' ) );
		for ( $i = 1; $i <= $count; $i++ ) {
			$scene  = self::scene_brief( $topic . ' — detail ' . $i, $focus, $settings, 'inline' );
			$prompt = self::compose_prompt( $scene, $style_bible, $settings, 'inline' );
			$gen    = Webino_Dashboard_AI_Providers::generate_image(
				$prompt,
				array(
					'provider' => (string) ( $settings['blog_image_provider'] ?? 'gapgpt' ),
					'model'    => (string) ( $settings['blog_image_model'] ?? 'gpt-image-1' ),
					'size'     => $size,
					'quality'  => (string) ( $settings['blog_image_quality'] ?? 'hd' ),
				)
			);
			if ( is_wp_error( $gen ) ) {
				continue;
			}
			$att = self::sideload_to_media( $gen, $post_id, $topic . ' ' . $i );
			if ( is_wp_error( $att ) ) {
				continue;
			}
			$ids[] = (int) $att;
		}
		if ( $ids ) {
			self::insert_figures_after_h2( $post_id, $ids, $topic );
			update_post_meta( $post_id, '_webino_ai_blog_inline_image_ids', $ids );
		}
		return $ids;
	}

	/**
	 * @param int      $post_id Post.
	 * @param list<int> $att_ids Attachments.
	 * @param string   $alt_base Alt base.
	 * @return void
	 */
	private static function insert_figures_after_h2( $post_id, $att_ids, $alt_base ) {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return;
		}
		$content = (string) $post->post_content;
		if ( '' === $content || ! $att_ids ) {
			return;
		}

		$parts = preg_split( '/(?=<h2\b[^>]*>)/i', $content );
		if ( ! is_array( $parts ) || count( $parts ) < 2 ) {
			// Append at end.
			$figures = '';
			foreach ( $att_ids as $i => $aid ) {
				$url = wp_get_attachment_image_url( (int) $aid, 'large' );
				if ( ! $url ) {
					continue;
				}
				$alt      = esc_attr( $alt_base . ' ' . ( $i + 1 ) );
				$figures .= '<figure class="webino-ai-blog-figure"><img src="' . esc_url( $url ) . '" alt="' . $alt . '" loading="lazy" /></figure>';
			}
			if ( $figures ) {
				wp_update_post(
					array(
						'ID'           => $post_id,
						'post_content' => $content . "\n\n" . $figures,
					)
				);
			}
			return;
		}

		$idx = 0;
		$out = array();
		foreach ( $parts as $i => $chunk ) {
			$out[] = $chunk;
			if ( $i > 0 && $idx < count( $att_ids ) ) {
				$url = wp_get_attachment_image_url( (int) $att_ids[ $idx ], 'large' );
				if ( $url ) {
					$alt   = esc_attr( $alt_base . ' ' . ( $idx + 1 ) );
					$out[] = "\n<figure class=\"webino-ai-blog-figure\"><img src=\"" . esc_url( $url ) . '" alt="' . $alt . "\" loading=\"lazy\" /></figure>\n";
					++$idx;
				}
			}
		}
		while ( $idx < count( $att_ids ) ) {
			$url = wp_get_attachment_image_url( (int) $att_ids[ $idx ], 'large' );
			if ( $url ) {
				$alt   = esc_attr( $alt_base . ' ' . ( $idx + 1 ) );
				$out[] = "\n<figure class=\"webino-ai-blog-figure\"><img src=\"" . esc_url( $url ) . '" alt="' . $alt . "\" loading=\"lazy\" /></figure>\n";
			}
			++$idx;
		}

		wp_update_post(
			array(
				'ID'           => $post_id,
				'post_content' => implode( '', $out ),
			)
		);
	}

	/**
	 * @param array<string,mixed> $gen Generate result.
	 * @param int                 $post_id Post.
	 * @param string              $title Title/alt.
	 * @return int|WP_Error Attachment ID.
	 */
	private static function sideload_to_media( $gen, $post_id, $title ) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$tmp = '';
		$url = (string) ( $gen['url'] ?? '' );
		$b64 = (string) ( $gen['b64'] ?? '' );

		if ( '' !== $b64 ) {
			$bin = base64_decode( $b64, true );
			if ( false === $bin ) {
				return new WP_Error( 'ai_blog_image', __( 'Invalid image data.', 'webino-dashboard' ) );
			}
			$tmp = wp_tempnam( 'webino-ai-blog.png' );
			if ( ! $tmp ) {
				return new WP_Error( 'ai_blog_image', __( 'Could not create temp file.', 'webino-dashboard' ) );
			}
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			file_put_contents( $tmp, $bin );
		} elseif ( '' !== $url ) {
			$downloaded = download_url( $url, 120 );
			if ( is_wp_error( $downloaded ) ) {
				return $downloaded;
			}
			$tmp = $downloaded;
		} else {
			return new WP_Error( 'ai_blog_image', __( 'No image returned by provider.', 'webino-dashboard' ) );
		}

		$file_array = array(
			'name'     => sanitize_file_name( sanitize_title( $title ) . '-' . wp_generate_password( 6, false ) . '.png' ),
			'tmp_name' => $tmp,
		);

		$att_id = media_handle_sideload( $file_array, (int) $post_id, $title );
		if ( is_wp_error( $att_id ) ) {
			@unlink( $tmp ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			return $att_id;
		}

		update_post_meta( (int) $att_id, '_wp_attachment_image_alt', sanitize_text_field( $title ) );
		return (int) $att_id;
	}
}
