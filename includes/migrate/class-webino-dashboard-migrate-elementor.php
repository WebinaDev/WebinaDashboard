<?php
/**
 * Elementor → Webino builder document.
 *
 * The converter is pure: it does not require Elementor to be loaded.
 * Webino stores `document` on a page when it has `sections`. Unmapped widgets
 * become an HTML widget so the layout is not blank.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads Elementor meta and builds a builder document the Webino importer can open.
 */
final class Webino_Dashboard_Migrate_Elementor {

	const MAX_DOCUMENT_BYTES = 700000;

	/**
	 * Widget types that map onto a native Webino block.
	 *
	 * @return array<string,string>
	 */
	public static function widget_map() {
		return array(
			'heading'                  => 'heading',
			'theme-post-title'         => 'heading',
			'text-editor'              => 'text',
			'text'                     => 'text',
			'image'                    => 'image',
			'button'                   => 'button',
			'spacer'                   => 'spacer',
			'divider'                  => 'divider',
			'video'                    => 'video',
			'html'                     => 'html',
			'shortcode'                => 'html',
			'icon'                     => 'icon',
			'icon-list'                => 'html',
			'image-gallery'            => 'image',
			'gallery'                  => 'image',
			'image-carousel'           => 'image',
			'form'                     => 'form',
			'contact-form-7'           => 'form',
			'wpforms'                  => 'form',
			'woocommerce-products'     => 'product-grid',
			'wc-products'              => 'product-grid',
			'products'                 => 'product-grid',
			'woocommerce-product-related' => 'product-grid',
			'woocommerce-product-upsell' => 'product-grid',
			'woocommerce-product-title' => 'heading',
			'woocommerce-product-images' => 'image',
			'woocommerce-product-add-to-cart' => 'product-detail',
			'theme-post-content'       => 'html',
		);
	}

	/**
	 * @param mixed $data Elementor JSON string or decoded elements.
	 * @return list<array<string,mixed>>
	 */
	public static function decode_elements( $data ) {
		if ( is_string( $data ) ) {
			$data = trim( $data );
			if ( '' === $data ) {
				return array();
			}
			$decoded = json_decode( $data, true );
			if ( ! is_array( $decoded ) && function_exists( 'wp_unslash' ) ) {
				$decoded = json_decode( wp_unslash( $data ), true );
			}
			$data = $decoded;
		}
		if ( ! is_array( $data ) ) {
			return array();
		}
		if ( isset( $data['elements'] ) && is_array( $data['elements'] ) ) {
			return array_values( $data['elements'] );
		}
		$keys = array_keys( $data );
		$is_list = $keys === range( 0, count( $data ) - 1 );
		return $is_list ? array_values( $data ) : array( $data );
	}

	/**
	 * @param mixed               $data Elementor data.
	 * @param array<string,mixed> $args html, css, title, external_id.
	 * @return array<string,mixed>
	 */
	public static function convert( $data, array $args = array() ) {
		$sections = array();
		foreach ( self::decode_elements( $data ) as $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}
			$built = self::convert_top( $element );
			if ( $built ) {
				$sections[] = $built;
			}
		}
		$html = isset( $args['html'] ) ? (string) $args['html'] : '';
		if ( ! $sections && '' !== trim( $html ) ) {
			$sections[] = self::html_section(
				isset( $args['external_id'] ) ? (string) $args['external_id'] : 'fallback',
				isset( $args['title'] ) ? (string) $args['title'] : '',
				$html
			);
		}
		$document = array(
			'version'  => 1,
			'source'   => 'elementor',
			'sections' => $sections,
		);
		$css = isset( $args['css'] ) ? trim( (string) $args['css'] ) : '';
		if ( '' !== $css ) {
			$document['styles'] = array(
				'css' => $css,
			);
		}
		$encoded = wp_json_encode( $document );
		if ( is_string( $encoded ) && strlen( $encoded ) > self::MAX_DOCUMENT_BYTES ) {
			unset( $document['styles'] );
			$document['styles_omitted'] = true;
		}
		return $document;
	}

	/**
	 * Merge Elementor, SEO, and rendered HTML onto a page or post row.
	 *
	 * @param array<string,mixed> $raw  Content row.
	 * @param WP_Post             $post Post.
	 * @return array<string,mixed>
	 */
	public static function enrich_content( array $raw, $post ) {
		$post_id = is_object( $post ) && isset( $post->ID ) ? (int) $post->ID : 0;
		$raw['seo'] = self::seo_for_post( $post_id );
		$elementor  = self::meta_for_post( $post_id );
		if ( ! $elementor['data'] && '' === $elementor['css'] ) {
			if ( is_array( $raw['featured_image'] ?? null ) ) {
				$raw['cover'] = $raw['featured_image'];
			}
			return $raw;
		}
		$rendered = self::rendered_html( $post );
		$document = self::convert(
			$elementor['data'],
			array(
				'html'        => '' !== $rendered ? $rendered : (string) ( $raw['content'] ?? '' ),
				'css'         => $elementor['css'],
				'title'       => (string) ( $raw['title'] ?? '' ),
				'external_id' => (string) $post_id,
			)
		);
		$raw['content_raw']      = (string) ( $raw['content'] ?? '' );
		$raw['content_rendered'] = $rendered;
		if ( '' !== trim( $rendered ) ) {
			$raw['content'] = $rendered;
		}
		$raw['document']  = $document;
		$raw['elementor'] = $elementor;
		if ( is_array( $raw['featured_image'] ?? null ) ) {
			$raw['cover'] = $raw['featured_image'];
		}
		return $raw;
	}

	/**
	 * @param int $post_id Post id.
	 * @return array<string,mixed>
	 */
	public static function meta_for_post( $post_id ) {
		$post_id = (int) $post_id;
		$empty   = array(
			'data'          => array(),
			'page_settings' => array(),
			'css'           => '',
			'css_url'       => '',
			'template_type' => '',
			'location'      => '',
			'conditions'    => array(),
			'edit_mode'     => '',
		);
		if ( $post_id <= 0 || ! function_exists( 'get_post_meta' ) ) {
			return $empty;
		}
		$data     = self::decode_elements( get_post_meta( $post_id, '_elementor_data', true ) );
		$settings = get_post_meta( $post_id, '_elementor_page_settings', true );
		$settings = is_array( $settings ) ? $settings : array();
		$css_meta = get_post_meta( $post_id, '_elementor_css', true );
		$css      = '';
		if ( is_string( $css_meta ) ) {
			$css = $css_meta;
		} elseif ( is_array( $css_meta ) && isset( $css_meta['css'] ) && is_string( $css_meta['css'] ) ) {
			$css = $css_meta['css'];
		}
		if ( isset( $settings['custom_css'] ) && is_string( $settings['custom_css'] ) ) {
			$css = trim( $css . "\n" . $settings['custom_css'] );
		}
		$css_url = '';
		if ( function_exists( 'wp_upload_dir' ) ) {
			$uploads = wp_upload_dir();
			if ( is_array( $uploads ) && ! empty( $uploads['baseurl'] ) ) {
				$css_url = Webino_Dashboard_Migrate_Schema::public_url( trailingslashit( (string) $uploads['baseurl'] ) . 'elementor/css/post-' . $post_id . '.css' );
			}
		}
		$conditions = get_post_meta( $post_id, '_elementor_conditions', true );
		return array(
			'data'          => $data,
			'page_settings' => self::public_settings( $settings ),
			'css'           => $css,
			'css_url'       => $css_url,
			'template_type' => (string) get_post_meta( $post_id, '_elementor_template_type', true ),
			'location'      => (string) get_post_meta( $post_id, '_elementor_location', true ),
			'conditions'    => is_array( $conditions ) ? $conditions : array(),
			'edit_mode'     => (string) get_post_meta( $post_id, '_elementor_edit_mode', true ),
		);
	}

	/**
	 * Rank Math, then Yoast. No plugin secrets.
	 *
	 * @param int $post_id Post id.
	 * @return array<string,string>
	 */
	public static function seo_for_post( $post_id ) {
		$post_id = (int) $post_id;
		if ( $post_id <= 0 || ! function_exists( 'get_post_meta' ) ) {
			return array();
		}
		$rank_title = (string) get_post_meta( $post_id, 'rank_math_title', true );
		$yoast_title = (string) get_post_meta( $post_id, '_yoast_wpseo_title', true );
		$title = '' !== $rank_title ? $rank_title : $yoast_title;
		$rank_desc = (string) get_post_meta( $post_id, 'rank_math_description', true );
		$yoast_desc = (string) get_post_meta( $post_id, '_yoast_wpseo_metadesc', true );
		$description = '' !== $rank_desc ? $rank_desc : $yoast_desc;
		$rank_kw = (string) get_post_meta( $post_id, 'rank_math_focus_keyword', true );
		$yoast_kw = (string) get_post_meta( $post_id, '_yoast_wpseo_focuskw', true );
		$keyword = '' !== $rank_kw ? $rank_kw : $yoast_kw;
		$rank_canon = (string) get_post_meta( $post_id, 'rank_math_canonical_url', true );
		$yoast_canon = (string) get_post_meta( $post_id, '_yoast_wpseo_canonical', true );
		$canonical = '' !== $rank_canon ? $rank_canon : $yoast_canon;
		$source = '';
		if ( '' !== $rank_title || '' !== $rank_desc || '' !== $rank_kw ) {
			$source = 'rank_math';
		} elseif ( '' !== $yoast_title || '' !== $yoast_desc || '' !== $yoast_kw ) {
			$source = 'yoast';
		}
		if ( '' === $title && '' === $description && '' === $keyword && '' === $canonical ) {
			return array();
		}
		return array(
			'title'         => $title,
			'description'   => $description,
			'focus_keyword' => $keyword,
			'canonical'     => $canonical,
			'source'        => $source,
		);
	}

	/**
	 * @param WP_Post $post Post.
	 * @return string
	 */
	public static function rendered_html( $post ) {
		$post_id = is_object( $post ) && isset( $post->ID ) ? (int) $post->ID : 0;
		if ( $post_id > 0 && class_exists( '\Elementor\Plugin' ) ) {
			try {
				$plugin = \Elementor\Plugin::$instance;
				if ( is_object( $plugin ) && isset( $plugin->frontend ) && method_exists( $plugin->frontend, 'get_builder_content' ) ) {
					$html = $plugin->frontend->get_builder_content( $post_id, false );
					if ( is_string( $html ) && '' !== trim( $html ) ) {
						return $html;
					}
				}
			} catch ( Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
				unset( $e );
			}
		}
		$content = is_object( $post ) && isset( $post->post_content ) ? (string) $post->post_content : '';
		if ( '' !== $content && function_exists( 'apply_filters' ) ) {
			$filtered = apply_filters( 'the_content', $content );
			if ( is_string( $filtered ) && '' !== trim( $filtered ) ) {
				return $filtered;
			}
		}
		return $content;
	}

	/**
	 * @param array<string,mixed> $element Top-level element.
	 * @return array<string,mixed>|null
	 */
	public static function convert_top( array $element ) {
		$type = isset( $element['elType'] ) ? (string) $element['elType'] : '';
		if ( 'widget' === $type ) {
			$widget = self::convert_widget( $element );
			if ( ! $widget ) {
				return null;
			}
			return self::section_shell( self::element_id( $element, 'sec' ), array( self::column_shell( self::element_id( $element, 'col' ), 12, array( $widget ) ) ) );
		}
		if ( ! in_array( $type, array( 'section', 'container', '' ), true ) && empty( $element['elements'] ) ) {
			return null;
		}
		$columns = self::columns_from( isset( $element['elements'] ) && is_array( $element['elements'] ) ? $element['elements'] : array() );
		if ( ! $columns ) {
			return null;
		}
		return self::section_shell( self::element_id( $element, 'sec' ), $columns );
	}

	/**
	 * @param list<array<string,mixed>> $elements Children.
	 * @return list<array<string,mixed>>
	 */
	public static function columns_from( array $elements ) {
		$columns = array();
		$loose   = array();
		foreach ( $elements as $child ) {
			if ( ! is_array( $child ) ) {
				continue;
			}
			$el_type = isset( $child['elType'] ) ? (string) $child['elType'] : '';
			if ( 'column' === $el_type || ( 'container' === $el_type && self::looks_like_column( $child ) ) ) {
				$columns[] = self::column_from( $child );
				continue;
			}
			if ( 'widget' === $el_type ) {
				$widget = self::convert_widget( $child );
				if ( $widget ) {
					$loose[] = $widget;
				}
				continue;
			}
			if ( in_array( $el_type, array( 'section', 'container' ), true ) ) {
				$nested = self::widgets_from_tree( $child );
				foreach ( $nested as $widget ) {
					$loose[] = $widget;
				}
			}
		}
		if ( $loose ) {
			array_unshift( $columns, self::column_shell( 'col_loose_' . substr( md5( wp_json_encode( $loose ) ), 0, 8 ), 12, $loose ) );
		}
		return array_values( array_filter( $columns ) );
	}

	/**
	 * @param array<string,mixed> $element Column or container.
	 * @return array<string,mixed>
	 */
	public static function column_from( array $element ) {
		$settings = isset( $element['settings'] ) && is_array( $element['settings'] ) ? $element['settings'] : array();
		$size     = 100;
		if ( isset( $settings['_column_size'] ) ) {
			$size = (float) $settings['_column_size'];
		} elseif ( isset( $settings['width']['size'] ) ) {
			$size = (float) $settings['width']['size'];
		}
		$span    = (int) max( 1, min( 12, (int) round( $size / 100 * 12 ) ) );
		$widgets = self::widgets_from_tree( $element );
		return self::column_shell( self::element_id( $element, 'col' ), $span, $widgets );
	}

	/**
	 * @param array<string,mixed> $element Element.
	 * @return list<array<string,mixed>>
	 */
	public static function widgets_from_tree( array $element ) {
		$out = array();
		if ( isset( $element['elType'] ) && 'widget' === $element['elType'] ) {
			$widget = self::convert_widget( $element );
			if ( $widget ) {
				$out[] = $widget;
			}
			return $out;
		}
		$children = isset( $element['elements'] ) && is_array( $element['elements'] ) ? $element['elements'] : array();
		foreach ( $children as $child ) {
			if ( ! is_array( $child ) ) {
				continue;
			}
			foreach ( self::widgets_from_tree( $child ) as $widget ) {
				$out[] = $widget;
			}
		}
		return $out;
	}

	/**
	 * @param array<string,mixed> $element Widget element.
	 * @return array<string,mixed>|null
	 */
	public static function convert_widget( array $element ) {
		$widget_type = isset( $element['widgetType'] ) ? strtolower( (string) $element['widgetType'] ) : '';
		$settings    = isset( $element['settings'] ) && is_array( $element['settings'] ) ? $element['settings'] : array();
		$id          = self::element_id( $element, 'w' );
		$map         = self::widget_map();
		$target      = isset( $map[ $widget_type ] ) ? $map[ $widget_type ] : '';
		if ( 'heading' === $target ) {
			$text = self::setting_string( $settings, array( 'title', 'title_text', 'header_title' ) );
			$tag  = strtolower( self::setting_string( $settings, array( 'header_size', 'size', 'tag' ) ) );
			if ( ! in_array( $tag, array( 'h1', 'h2', 'h3' ), true ) ) {
				$tag = 'h2';
			}
			return self::widget( $id, 'heading', array( 'text' => $text, 'tag' => $tag ) );
		}
		if ( 'text' === $target ) {
			$html = self::setting_string( $settings, array( 'editor', 'text', 'content', 'html' ) );
			if ( false !== strpos( $html, '<' ) ) {
				return self::widget( $id, 'html', array( 'html' => $html ) );
			}
			return self::widget( $id, 'text', array( 'text' => $html ) );
		}
		if ( 'image' === $target && in_array( $widget_type, array( 'image-gallery', 'gallery', 'image-carousel' ), true ) ) {
			return self::gallery_widget( $id, $settings );
		}
		if ( 'image' === $target ) {
			$image = isset( $settings['image'] ) && is_array( $settings['image'] ) ? $settings['image'] : array();
			$url   = '';
			if ( isset( $image['url'] ) ) {
				$url = (string) $image['url'];
			}
			if ( '' === $url ) {
				$url = self::setting_string( $settings, array( 'image_url', 'url' ) );
			}
			$alt = isset( $image['alt'] ) ? (string) $image['alt'] : self::setting_string( $settings, array( 'alt', 'caption' ) );
			return self::widget( $id, 'image', array( 'src' => $url, 'alt' => $alt ) );
		}
		if ( 'button' === $target ) {
			$link = isset( $settings['link'] ) && is_array( $settings['link'] ) ? $settings['link'] : array();
			$href = isset( $link['url'] ) ? (string) $link['url'] : self::setting_string( $settings, array( 'url', 'link' ) );
			return self::widget(
				$id,
				'button',
				array(
					'label' => self::setting_string( $settings, array( 'text', 'button_text', 'title' ) ),
					'href'  => $href,
				)
			);
		}
		if ( 'spacer' === $target ) {
			$size = 32;
			if ( isset( $settings['space']['size'] ) ) {
				$size = (int) $settings['space']['size'];
			} elseif ( isset( $settings['space'] ) && is_numeric( $settings['space'] ) ) {
				$size = (int) $settings['space'];
			}
			return self::widget( $id, 'spacer', array( 'size' => max( 4, min( 240, $size ) ) ) );
		}
		if ( 'divider' === $target ) {
			return self::widget( $id, 'divider', array( 'color' => self::setting_string( $settings, array( 'color' ) ) ) );
		}
		if ( 'video' === $target ) {
			$src = self::setting_string( $settings, array( 'youtube_url', 'vimeo_url', 'hosted_url', 'url', 'link' ) );
			return self::widget( $id, 'video', array( 'src' => $src ) );
		}
		if ( 'icon' === $target ) {
			return self::widget(
				$id,
				'icon',
				array(
					'name'  => 'spark',
					'label' => self::setting_string( $settings, array( 'title_text', 'title', 'text' ) ),
				)
			);
		}
		if ( 'form' === $target ) {
			return self::widget(
				$id,
				'form',
				array(
					'title'  => self::setting_string( $settings, array( 'form_name', 'title', 'heading' ) ) ?: 'فرم',
					'submit' => self::setting_string( $settings, array( 'button_text', 'submit' ) ) ?: 'ارسال',
				)
			);
		}
		if ( 'product-grid' === $target ) {
			$columns = isset( $settings['columns'] ) ? (int) $settings['columns'] : 4;
			$rows    = isset( $settings['rows'] ) ? (int) $settings['rows'] : 1;
			$limit   = max( 1, min( 12, $columns * max( 1, $rows ) ) );
			return self::widget(
				$id,
				'product-grid',
				array(
					'title'  => self::setting_string( $settings, array( 'title', 'section_title' ) ),
					'limit'  => $limit,
					'source' => 'new',
				)
			);
		}
		if ( 'product-detail' === $target ) {
			return self::widget( $id, 'product-detail', array() );
		}
		if ( 'html' === $target && 'icon-list' === $widget_type ) {
			return self::widget( $id, 'html', array( 'html' => self::icon_list_html( $settings ) ) );
		}
		if ( 'html' === $target ) {
			$html = self::setting_string( $settings, array( 'html', 'editor', 'shortcode', 'content' ) );
			return self::widget( $id, 'html', array( 'html' => '' !== $html ? $html : self::unmapped_html( $widget_type, $settings ) ) );
		}
		return self::widget(
			$id,
			'html',
			array(
				'html'             => self::unmapped_html( $widget_type, $settings ),
				'elementor_widget' => $widget_type,
			)
		);
	}

	/**
	 * @param string              $id       Widget id.
	 * @param array<string,mixed> $settings Settings.
	 * @return array<string,mixed>
	 */
	private static function gallery_widget( $id, array $settings ) {
		$gallery = array();
		foreach ( array( 'gallery', 'wp_gallery', 'carousel' ) as $key ) {
			if ( isset( $settings[ $key ] ) && is_array( $settings[ $key ] ) ) {
				$gallery = $settings[ $key ];
				break;
			}
		}
		$html = '';
		foreach ( $gallery as $image ) {
			if ( ! is_array( $image ) ) {
				continue;
			}
			$url = isset( $image['url'] ) ? (string) $image['url'] : '';
			$alt = isset( $image['alt'] ) ? (string) $image['alt'] : '';
			if ( '' === $url ) {
				continue;
			}
			$html .= '<img src="' . self::esc( $url ) . '" alt="' . self::esc( $alt ) . '" />';
		}
		if ( '' === $html ) {
			$html = self::unmapped_html( 'gallery', $settings );
		}
		return self::widget( $id, 'html', array( 'html' => $html ) );
	}

	/**
	 * @param array<string,mixed> $settings Settings.
	 * @return string
	 */
	private static function icon_list_html( array $settings ) {
		$items = isset( $settings['icon_list'] ) && is_array( $settings['icon_list'] ) ? $settings['icon_list'] : array();
		$html  = '<ul>';
		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$text = isset( $item['text'] ) ? (string) $item['text'] : '';
			if ( '' === $text ) {
				continue;
			}
			$html .= '<li>' . self::esc( $text ) . '</li>';
		}
		$html .= '</ul>';
		return $html;
	}

	/**
	 * @param string              $widget_type Widget type.
	 * @param array<string,mixed> $settings    Settings.
	 * @return string
	 */
	public static function unmapped_html( $widget_type, array $settings ) {
		$text = self::setting_string( $settings, array( 'title', 'editor', 'text', 'description', 'content', 'html' ) );
		$safe = '' !== $widget_type ? $widget_type : 'widget';
		$body = '' !== $text ? $text : '';
		return '<div data-webino-unmapped="' . self::esc( $safe ) . '">' . $body . '</div>';
	}

	/**
	 * @param string $external_id External id.
	 * @param string $title       Title.
	 * @param string $html        HTML.
	 * @return array<string,mixed>
	 */
	public static function html_section( $external_id, $title, $html ) {
		$widgets = array();
		if ( '' !== trim( $title ) ) {
			$widgets[] = self::widget( 'w_title_' . $external_id, 'heading', array( 'text' => $title, 'tag' => 'h1' ) );
		}
		$widgets[] = self::widget( 'w_html_' . $external_id, 'html', array( 'html' => $html ) );
		return self::section_shell( 'sec_html_' . $external_id, array( self::column_shell( 'col_html_' . $external_id, 12, $widgets ) ) );
	}

	/**
	 * @param array<string,mixed> $element Element.
	 * @return bool
	 */
	private static function looks_like_column( array $element ) {
		$settings = isset( $element['settings'] ) && is_array( $element['settings'] ) ? $element['settings'] : array();
		if ( isset( $settings['_column_size'] ) || isset( $settings['width']['size'] ) ) {
			return true;
		}
		$children = isset( $element['elements'] ) && is_array( $element['elements'] ) ? $element['elements'] : array();
		foreach ( $children as $child ) {
			if ( is_array( $child ) && isset( $child['elType'] ) && 'widget' === $child['elType'] ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param array<string,mixed> $settings Settings.
	 * @return array<string,mixed>
	 */
	private static function public_settings( array $settings ) {
		$clean = array();
		foreach ( $settings as $key => $value ) {
			if ( ! is_string( $key ) ) {
				continue;
			}
			if ( preg_match( '/password|secret|token|api[_-]?key|license/i', $key ) ) {
				continue;
			}
			if ( is_scalar( $value ) || is_array( $value ) ) {
				$clean[ $key ] = $value;
			}
		}
		return $clean;
	}

	/**
	 * @param array<string,mixed> $settings Settings.
	 * @param list<string>        $keys     Candidate keys.
	 * @return string
	 */
	private static function setting_string( array $settings, array $keys ) {
		foreach ( $keys as $key ) {
			if ( ! isset( $settings[ $key ] ) || is_array( $settings[ $key ] ) ) {
				continue;
			}
			$text = trim( (string) $settings[ $key ] );
			if ( '' !== $text ) {
				return $text;
			}
		}
		return '';
	}

	/**
	 * @param array<string,mixed> $element Element.
	 * @param string              $prefix  Prefix.
	 * @return string
	 */
	private static function element_id( array $element, $prefix ) {
		$raw = isset( $element['id'] ) ? (string) $element['id'] : '';
		$raw = strtolower( (string) preg_replace( '/[^a-z0-9_-]+/i', '', $raw ) );
		if ( '' === $raw ) {
			$raw = substr( md5( wp_json_encode( $element ) ), 0, 8 );
		}
		return $prefix . '_' . substr( $raw, 0, 40 );
	}

	/**
	 * @param string                    $id      Section id.
	 * @param list<array<string,mixed>> $columns Columns.
	 * @return array<string,mixed>
	 */
	private static function section_shell( $id, array $columns ) {
		return array(
			'id'      => $id,
			'columns' => $columns,
		);
	}

	/**
	 * @param string                    $id      Column id.
	 * @param int                       $span    Span.
	 * @param list<array<string,mixed>> $widgets Widgets.
	 * @return array<string,mixed>
	 */
	private static function column_shell( $id, $span, array $widgets ) {
		return array(
			'id'      => $id,
			'span'    => (int) $span,
			'widgets' => array_values( $widgets ),
		);
	}

	/**
	 * @param string              $id    Id.
	 * @param string              $type  Widget type.
	 * @param array<string,mixed> $props Props.
	 * @return array<string,mixed>
	 */
	private static function widget( $id, $type, array $props ) {
		return array(
			'id'    => $id,
			'type'  => $type,
			'props' => $props,
		);
	}

	/**
	 * @param string $value Value.
	 * @return string
	 */
	private static function esc( $value ) {
		return htmlspecialchars( (string) $value, ENT_QUOTES, 'UTF-8' );
	}
}
