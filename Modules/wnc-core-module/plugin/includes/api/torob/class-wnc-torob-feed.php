<?php
/**
 * Torob port — adapted from official plugin 2.3.0.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

class WNC_Torob_Feed
{
    private const API_VERSION = 'torob_woocommerce_products_v1';
    private const INFORMATIONAL_PRODUCT_FIELDS = [
        'parent_id',
        'date_added',
        'date_updated',
        'product_type'
    ];

    public function __construct() {}

    public function register_products_route(WNC_Torob_Token $validator): void
    {
        $version = '1';
        $namespace = 'wcpe/v' . $version;
        $base = 'products';
        register_rest_route(
            $namespace,
            '/' . $base,
            array(
                array(
                    'methods'             => 'POST',
                    'callback'            => array( $this, 'get_products' ),
                    'permission_callback' => array( $validator, 'validate_token' ),
                    'args'                => array(),
                ),
            ),
            true
        );

        // Torob-Sync Product API v3 (current).
        register_rest_route(
            'torob_api/v3',
            '/products',
            array(
                array(
                    'methods'             => 'POST',
                    'callback'            => array( $this, 'get_products_v3' ),
                    'permission_callback' => array( $validator, 'validate_token' ),
                    'args'                => array(),
                ),
            ),
            true
        );
    }

    public function get_products(WP_REST_Request $request): WP_REST_Response
    {
        $settings = WNC_Settings::get_platform( 'torob' );
        if ( empty( $settings['enabled'] ) ) {
            return new WP_REST_Response(
                array( 'error' => 'Torob platform is disabled in WebinaConnector' ),
                403
            );
        }

        // Get Parameters — setting expand_variations forces Basalam-style expansion.
        $show_variations = rest_sanitize_boolean($request->get_param('variation'))
            || ( class_exists( 'WNC_Torob_Options', false ) && WNC_Torob_Options::isExpandVariationsEnabled() );
        $limit = intval($request->get_param('limit'));
        $page = intval($request->get_param('page'));
        if (!empty($request->get_param('products'))) {
            $product_list = explode(',', sanitize_text_field($request->get_param('products')));
            if (is_array($product_list)) {
                foreach ($product_list as $key => $field) {
                    $product_list[$key] = intval($field);
                }
            }
        }
        if (!empty($request->get_param('slugs'))) {
            $slug_list = explode(',', sanitize_text_field(urldecode($request->get_param('slugs'))));
        }

        $data = [];
        if (!empty($product_list)) {
            $data = $this->get_list_products($product_list);
        } elseif (!empty($slug_list)) {
            $data = $this->get_list_slugs($slug_list);
        } else {
            $data = $this->get_all_products($show_variations, $limit, $page);
        }
        $data['api_version'] = self::API_VERSION;
        $data['metadata'] = $this->build_metadata();

        return new WP_REST_Response($data, 200);
    }

    /**
     * Get single product values.
     *
     * @param WC_Product $product The product to extract values from.
     * @param WC_Product|null $parent The valid parent product when extracting a variation.
     *
     * @return stdClass The extracted product data.
     */
    public function get_product_values(WC_Product $product, ?WC_Product $parent = null): stdClass
    {
        $source_product = $parent ?? $product;

        $temp_product = new stdClass();
        $expand = class_exists( 'WNC_Torob_Options', false ) && WNC_Torob_Options::isExpandVariationsEnabled();
        $temp_product->title = ( $parent && $expand )
            ? $this->build_variation_title( $product, $parent )
            : ( $parent ? $parent->get_name() : $product->get_name() );
        $temp_product->subtitle = get_post_meta($source_product->get_id(), 'product_english_name', true);
        $cat_ids = $source_product->get_category_ids();
        $temp_product->parent_id = $parent ? $parent->get_id() : 0;
        $temp_product->page_unique = WNC_Torob_Extraction_Utils::get_page_unique($product);
        $temp_product->availability = $product->get_stock_status();
        if ($parent === null && $product->is_type('variable')) {
            $temp_product->current_price = 0;
            $temp_product->old_price = 0;
        } else {
            $prices = $this->get_wfcp_prices( $product );
            $temp_product->current_price = $prices['current'];
            $temp_product->old_price     = $prices['old'];
        }
        if ($cat_ids) {
            $temp_product->category_name = get_term_by('id', end($cat_ids), 'product_cat', 'ARRAY_A')['name'];
        }
        $temp_product->image_links = [];
        $attachment_ids = $product->get_gallery_image_ids();
        foreach ($attachment_ids as $attachment_id) {
            $t_link = wp_get_attachment_image_src($attachment_id, 'full');
            if ($t_link) {
                $temp_product->image_links[] = $t_link[0];
            }
        }
        $t_image = wp_get_attachment_image_src($product->get_image_id(), 'full');
        if ($t_image) {
            $temp_product->image_link = $t_image[0];
            if (!in_array($t_image[0], $temp_product->image_links, true)) {
                $temp_product->image_links[] = $t_image[0];
            }
        } else {
            $temp_product->image_link = null;
        }
        $temp_product->page_url = WNC_Torob_Extraction_Utils::get_page_url($product);
        $temp_product->short_desc = $product->get_short_description();
        $temp_product->spec = [];
        $temp_product->date_added = $product->get_date_created()
            ? $product->get_date_created()->format(DATE_ATOM)
            : null;
        $temp_product->date_updated = $product->get_date_modified()
            ? $product->get_date_modified()->format(DATE_ATOM)
            : null;
        $temp_product->product_type = $product->get_type();
        $temp_product->guarantee = '';

        if ($parent === null) {
            if ($product->is_type('variable')) {
                // Find price for default attributes. If it can't find return max WFCP price of variations
                $variation_id = $this->find_matching_variation($product, $product->get_default_attributes());
                if ($variation_id !== 0) {
                    $variation = wc_get_product($variation_id);
                    if ( $variation ) {
                        $prices = $this->get_wfcp_prices( $variation );
                        $temp_product->current_price = $prices['current'];
                        $temp_product->old_price     = $prices['old'];
                        $temp_product->availability  = $variation->get_stock_status();
                    }
                } else {
                    $max_current = 0;
                    $max_old     = 0;
                    foreach ( $product->get_children() as $child_id ) {
                        $child = wc_get_product( $child_id );
                        if ( ! $child ) {
                            continue;
                        }
                        $p = $this->get_wfcp_prices( $child );
                        $cur = (float) $p['current'];
                        if ( $cur > $max_current ) {
                            $max_current = $cur;
                            $max_old     = (float) $p['old'];
                        }
                    }
                    $temp_product->current_price = $this->normalize_display_price( $max_current );
                    $temp_product->old_price     = $this->normalize_display_price( $max_old > 0 ? $max_old : $max_current );
                }
                // Extract default attributes
                foreach ($product->get_default_attributes() as $key => $value) {
                    if (empty($value)) {
                        continue;
                    }

                    if (substr($key, 0, 3) === 'pa_') {
                        $value = get_term_by('slug', $value, $key);
                        if ($value) {
                            $value = $value->name;
                        } else {
                            $value = '';
                        }
                        $key = wc_attribute_label($key);
                    }
                    $temp_product->spec[urldecode($key)] = rawurldecode($value);
                }
            }
            // add remain attributes
            foreach ($product->get_attributes() as $attribute) {
                if (!$attribute['visible']) {
                    continue;
                }

                $name = wc_attribute_label($attribute['name']);
                if (substr($attribute['name'], 0, 3) === 'pa_') {
                    $values = wc_get_product_terms($product->get_id(), $attribute['name'], ['fields' => 'names']);
                } else {
                    $values = $attribute['options'];
                }
                if (!array_key_exists($name, $temp_product->spec)) {
                    $temp_product->spec[$name] = implode(', ', $values);
                }
            }
        } else {
            foreach ($product->get_attributes() as $key => $value) {
                if (empty($value)) {
                    continue;
                }

                if (substr($key, 0, 3) === 'pa_') {
                    $value = get_term_by('slug', $value, $key);
                    if ($value) {
                        $value = $value->name;
                    } else {
                        $value = '';
                    }
                    $key = wc_attribute_label($key);
                }
                $temp_product->spec[urldecode($key)] = rawurldecode($value);
            }
        }

        $guarantee_keys = [
            'گارانتی',
            'guarantee',
            'warranty',
            'garanty',
            'گارانتی:',
            'گارانتی محصول',
            'گارانتی محصول:',
            'ضمانت',
            'ضمانت:'
        ];

        foreach ($guarantee_keys as $guarantee) {
            if (empty($temp_product->spec[$guarantee])) {
                continue;
            }

            $temp_product->guarantee = $temp_product->spec[$guarantee];
        }

        if (!array_key_exists('شناسه کالا', $temp_product->spec)) {
            $sku = $product->get_sku();
            if ($sku !== '') {
                $temp_product->spec['شناسه کالا'] = $sku;
            }
        }

        if (count($temp_product->spec) > 0) {
            $temp_product->spec = [$temp_product->spec];
        }

        return $temp_product;
    }

    /**
     * Parent name + variation attribute display values (Basalam-style standalone titles).
     *
     * @param WC_Product $variation Variation product.
     * @param WC_Product $parent    Parent variable product.
     * @return string
     */
    private function build_variation_title( WC_Product $variation, WC_Product $parent ): string {
        if ( class_exists( 'WNC_Variation_Title', false ) ) {
            return WNC_Variation_Title::build( $variation, $parent, 500 );
        }
        // Fallback mirrors WNC_Variation_Title::build (Basalam-style).
        $base  = $parent->get_name();
        $parts = array();
        $attrs = method_exists( $variation, 'get_variation_attributes' )
            ? $variation->get_variation_attributes()
            : $variation->get_attributes();
        if ( ! is_array( $attrs ) ) {
            $attrs = array();
        }
        foreach ( $attrs as $attribute_name => $attribute_value ) {
            if ( '' === $attribute_value || null === $attribute_value ) {
                continue;
            }
            $taxonomy = str_replace( 'attribute_', '', (string) $attribute_name );
            $value    = rawurldecode( (string) $attribute_value );
            if ( $taxonomy && taxonomy_exists( $taxonomy ) ) {
                $term = get_term_by( 'slug', $attribute_value, $taxonomy );
                if ( $term && ! is_wp_error( $term ) ) {
                    $value = (string) $term->name;
                }
            }
            $value = trim( str_replace( '-', ' ', $value ) );
            if ( '' !== $value ) {
                $parts[] = $value;
            }
        }
        $combined = $parts ? trim( $base . ' ' . implode( ' ', $parts ) ) : $base;
        return mb_substr( $combined, 0, 500 );
    }

    /**
     * WFCP Torob prices (current = feed price, old = WC regular if higher).
     *
     * @param WC_Product $product Product.
     * @return array{current:string|int|float,old:string|int|float}
     */
    private function get_wfcp_prices( $product ) {
        $feed = (float) WNC_Pricing::get_price( $product->get_id(), 'torob' );
        $reg  = (float) $product->get_regular_price();
        $current = $this->get_display_price( $product, $feed );
        $old     = ( $reg > $feed && $reg > 0 )
            ? $this->get_display_price( $product, $reg )
            : $current;
        return array(
            'current' => $current,
            'old'     => $old,
        );
    }

    /**
     * Convert a raw WooCommerce product price to the same tax display mode used on product pages.
     *
     * @param WC_Product $product Product used for tax class/rate lookup.
     * @param mixed $price Raw product price.
     *
     * @return mixed Display price, preserving unchanged raw values.
     */
    private function get_display_price(WC_Product $product, $price)
    {
        if ($price === '' || !wc_tax_enabled() || !$product->is_taxable()) {
            return $price;
        }

        $display_price = wc_get_price_to_display($product, [
            'price' => (float) $price
        ]);

        return $this->normalize_display_price($display_price);
    }

    private function normalize_display_price($price)
    {
        if ($price === '') {
            return $price;
        }

        $display_price = (float) $price;
        if (abs($display_price - round($display_price)) < 0.000_001) {
            return (string) intval(round($display_price));
        }

        return wc_format_decimal($display_price, wc_get_price_decimals());
    }

    /**
     * Get all products with pagination.
     *
     * @param bool $show_variations Whether to include product variations.
     * @param int $limit The number of products to retrieve per page.
     * @param int $page The current page number.
     * @param bool $include_informational_fields Whether to include fields useful for debugging but not directly shown in Torob.
     *
     * @return array The data containing products, count, current page, and max pages.
     */
    public function get_all_products(
        bool $show_variations,
        int $limit,
        int $page,
        bool $include_informational_fields = true
    ): array {
        $args = [
            'posts_per_page' => $limit,
            'paged' => $page,
            'post_status' => 'publish',
            'orderby' => 'ID',
            'order' => 'DESC',
            'post_type' => ['product'],
            'update_post_term_cache' => true,
            'update_post_meta_cache' => true,
            'cache_results' => false
        ];
        if ($show_variations) {
            $args['post_type'] = ['product', 'product_variation'];
        }
        $query = new WP_Query($args);
        // Product data is already cached, so calling wc_get_product() must cause no queries at all.
        $products = array_filter(array_map('wc_get_product', $query->posts));
        $data['count'] = $query->found_posts;
        $data['current_page'] = $page;
        $data['max_pages'] = $query->max_num_pages;
        $data['products'] = [];
        $this->fill_image_caches($products);
        // Retrieve and send data in json
        foreach ($products as $product) {
            $is_variation = $product->is_type('variation');
            $parent = $is_variation ? $this->get_valid_parent($product) : null;
            if ($is_variation && (!$product->get_price() || $parent === null)) {
                continue;
            }
            if ($show_variations && $product->is_type('variable')) {
                continue;
            }

            $data['products'][] = $this->get_product_values($product, $parent);
        }

        if (!$include_informational_fields) {
            $data['products'] = $this->remove_informational_product_fields($data['products']);
        }

        return $data;
    }

    /**
     * Remove fields that help diagnostics but do not directly affect Torob-visible product data.
     */
    private function remove_informational_product_fields(array $products): array
    {
        return array_map(static function ($product) {
            if (!is_object($product)) {
                return $product;
            }

            $filtered_product = clone $product;
            foreach (self::INFORMATIONAL_PRODUCT_FIELDS as $field) {
                unset($filtered_product->{$field});
            }

            return $filtered_product;
        }, $products);
    }

    /**
     * Get a list of products by their IDs.
     *
     * @param array $product_list An array of product IDs to retrieve.
     *
     * @return array The list of products with their details.
     */
    public function get_list_products(array $product_list): array
    {
        $data['products'] = [];
        // Retrieve and send data in json
        foreach ($product_list as $pid) {
            $product = wc_get_product($pid);
            if ($product && $product->get_status() === 'publish') {
                $is_variation = $product->is_type('variation');
                $parent = $is_variation ? $this->get_valid_parent($product) : null;
                if ($is_variation && (!$product->get_price() || $parent === null)) {
                    continue;
                }

                $data['products'][] = $this->get_product_values($product, $parent);
            }
        }

        return $data;
    }

    private function get_valid_parent(WC_Product $product): ?WC_Product
    {
        $parent_id = $product->get_parent_id();
        if ($parent_id === 0) {
            return null;
        }

        $parent = wc_get_product($parent_id);

        return $parent instanceof WC_Product ? $parent : null;
    }

    /**
     * Get a list of slugs and retrieve product data by their links.
     *
     * @param array $slug_list An array of product slugs to retrieve.
     *
     * @return array The list of products with their details.
     */
    public function get_list_slugs(array $slug_list): array
    {
        $data['products'] = [];
        // Retrieve and send data in json
        foreach ($slug_list as $sid) {
            $product = get_page_by_path($sid, OBJECT, 'product');
            if ($product && $product->post_status === 'publish') {
                $data['products'][] = $this->get_product_values(wc_get_product($product->ID));
            }
        }

        return $data;
    }

    /**
     * Find matching product and variation.
     *
     * @param WC_Product $product The variable product.
     * @param array $attributes The attributes to match.
     *
     * @return int The matching variation ID, or 0 if not found.
     */
    public function find_matching_variation(WC_Product $product, array $attributes): int
    {
        foreach ($attributes as $key => $value) {
            if (strpos($key, 'attribute_') === 0) {
                continue;
            }
            unset($attributes[$key]);
            $attributes[sprintf('attribute_%s', $key)] = $value;
        }
        if (class_exists('WC_Data_Store')) {
            $data_store = WC_Data_Store::load('product');

            return $data_store->find_matching_product_variation($product, $attributes);
        } else {
            return $product->get_matching_variation($attributes);
        }
    }

    /**
     * Prime WordPress caches for product images in one batch query.
     *
     * @param WC_Product[] $products Array of products to cache images for.
     *
     * @return void
     */
    private function fill_image_caches(array $products): void
    {
        $attachment_ids = [];
        foreach ($products as $product) {
            // Collect attachment IDs (featured image + gallery)
            $image_id = $product->get_image_id();
            if ($image_id) {
                $attachment_ids[] = $image_id;
            }
            $gallery_ids = $product->get_gallery_image_ids();
            if (!empty($gallery_ids)) {
                $attachment_ids = array_merge($attachment_ids, $gallery_ids);
            }
        }
        // Prime attachment post + meta cache in one batch query
        $attachment_ids = array_unique(array_filter($attachment_ids));
        if (!empty($attachment_ids)) {
            _prime_post_caches($attachment_ids, false, true);
        }
    }

    /**
     * Build metadata array for the response.
     *
     * @return array The metadata array.
     */
    public function build_metadata(): array
    {
        return [
            'wordpress_version' => WNC_Torob_Site_Data::wordpress_version(),
            'php_version' => WNC_Torob_Site_Data::php_version(),
            'plugin_version' => WNC_VERSION,
            'woocommerce_version' => WNC_Torob_Site_Data::woocommerce_version(),
            'beta_test_plugin_version' => WNC_Torob_Site_Data::beta_test_plugin_version(),
            'libsodium_version' => WNC_Torob_Site_Data::libsodium_version(),
            'hpos_enabled' => WNC_Torob_Options::isHposEnabled(),
            'options' => $this->build_options_metadata()
        ];
    }

    /**
     * Build normalized plugin options metadata without exposing secret option values.
     *
     * @return array The plugin options metadata.
     */
    private function build_options_metadata(): array
    {
        return [
            'order_status_enabled' => WNC_Torob_Options::isOrderStatusEnabled(),
            'orders_list_api_enabled' => WNC_Torob_Options::isOrdersListApiEnabled(),
            'product_page_webhook_enabled' => WNC_Torob_Options::isProductPageWebhookEnabled(),
            'action_tracking_enabled' => WNC_Torob_Options::isActionTrackingEnabled(),
            'has_torob_token' => WNC_Torob_Options::getToken() !== '',
            'torob_token_set_at' => WNC_Torob_Options::getTokenSetAt()
        ];
    }

    /**
     * Torob-Sync Product API v3 handler.
     *
     * @see https://github.com/torob/Torob-Sync/blob/main/product_api_v3.md
     */
    public function get_products_v3(WP_REST_Request $request): WP_REST_Response
    {
        $settings = WNC_Settings::get_platform('torob');
        if (empty($settings['enabled'])) {
            return new WP_REST_Response(
                ['error' => 'Torob platform is disabled'],
                403
            );
        }

        $body = $request->get_json_params();
        if (!is_array($body) || $body === []) {
            return new WP_REST_Response(['error' => 'Request body is empty or invalid'], 400);
        }

        $has_urls = isset($body['page_urls']) && is_array($body['page_urls']);
        $has_uniques = isset($body['page_uniques']) && is_array($body['page_uniques']);
        $has_page = array_key_exists('page', $body);
        $has_sort = array_key_exists('sort', $body);

        if ($has_urls) {
            if (count($body['page_urls']) < 1) {
                return new WP_REST_Response(['error' => 'page_urls must contain at least one item'], 400);
            }
            $products = $this->get_v3_products_by_urls($body['page_urls']);
            return new WP_REST_Response($this->wrap_v3_response($products, 1, count($products), 1), 200);
        }

        if ($has_uniques) {
            if (count($body['page_uniques']) < 1) {
                return new WP_REST_Response(['error' => 'page_uniques must contain at least one item'], 400);
            }
            $products = $this->get_v3_products_by_uniques($body['page_uniques']);
            return new WP_REST_Response($this->wrap_v3_response($products, 1, count($products), 1), 200);
        }

        if ($has_page || $has_sort) {
            if (!$has_page || !$has_sort) {
                return new WP_REST_Response(
                    ['error' => $has_page ? 'sort parameter is not provided' : 'page parameter is not provided'],
                    400
                );
            }
            $page = (int) $body['page'];
            $sort = (string) $body['sort'];
            if ($page < 1) {
                return new WP_REST_Response(['error' => 'page must be >= 1'], 400);
            }
            if (!in_array($sort, ['date_added_desc', 'date_updated_desc'], true)) {
                return new WP_REST_Response(['error' => 'sort must be date_added_desc or date_updated_desc'], 400);
            }
            $data = $this->get_all_products_v3($page, $sort);
            return new WP_REST_Response($data, 200);
        }

        return new WP_REST_Response(['error' => 'Invalid request parameters'], 400);
    }

    /**
     * @param array<int,array<string,mixed>> $products Products.
     */
    private function wrap_v3_response(array $products, int $current_page, int $total, int $max_pages): array
    {
        return [
            'api_version' => 'torob_api_v3',
            'current_page' => $current_page,
            'total' => $total,
            'max_pages' => max(1, $max_pages),
            'products' => array_values($products),
        ];
    }

    /**
     * @param array<int,mixed> $urls Absolute product URLs.
     * @return array<int,array<string,mixed>>
     */
    private function get_v3_products_by_urls(array $urls): array
    {
        $out = [];
        foreach ($urls as $url) {
            $url = esc_url_raw((string) $url);
            if ($url === '') {
                continue;
            }
            $product = $this->resolve_product_from_url($url);
            if (!$product instanceof WC_Product || $product->get_status() !== 'publish') {
                continue;
            }
            $row = $this->serialize_product_v3($product);
            if ($row !== null) {
                $out[] = $row;
            }
        }
        return $out;
    }

    /**
     * @param array<int,mixed> $uniques page_unique values.
     * @return array<int,array<string,mixed>>
     */
    private function get_v3_products_by_uniques(array $uniques): array
    {
        $out = [];
        foreach ($uniques as $unique) {
            $id = absint($unique);
            if ($id < 1) {
                continue;
            }
            $product = wc_get_product($id);
            if (!$product instanceof WC_Product || $product->get_status() !== 'publish') {
                continue;
            }
            $row = $this->serialize_product_v3($product);
            if ($row !== null) {
                $out[] = $row;
            }
        }
        return $out;
    }

    private function resolve_product_from_url(string $url): ?WC_Product
    {
        $path = (string) wp_parse_url($url, PHP_URL_PATH);
        if ($path === '') {
            return null;
        }
        $post_id = url_to_postid($url);
        if ($post_id > 0) {
            $product = wc_get_product($post_id);
            return $product instanceof WC_Product ? $product : null;
        }
        $slug = trim(basename(untrailingslashit($path)));
        if ($slug === '') {
            return null;
        }
        $post = get_page_by_path($slug, OBJECT, 'product');
        if ($post && $post->post_status === 'publish') {
            $product = wc_get_product($post->ID);
            return $product instanceof WC_Product ? $product : null;
        }
        return null;
    }

    /**
     * Paginated Product API v3 list (100 per page).
     *
     * @return array<string,mixed>
     */
    public function get_all_products_v3(int $page, string $sort): array
    {
        $per_page = 100;
        $orderby = $sort === 'date_updated_desc' ? 'modified' : 'date';
        $expand  = class_exists( 'WNC_Torob_Options', false ) && WNC_Torob_Options::isExpandVariationsEnabled();
        $args = [
            'posts_per_page' => $per_page,
            'paged' => $page,
            'post_status' => 'publish',
            'orderby' => $orderby,
            'order' => 'DESC',
            'post_type' => $expand ? ['product', 'product_variation'] : ['product'],
            'update_post_term_cache' => true,
            'update_post_meta_cache' => true,
            'cache_results' => false,
        ];

        $query = new WP_Query($args);
        $wc_products = array_filter(array_map('wc_get_product', $query->posts));
        $products = [];
        $this->fill_image_caches($wc_products);
        foreach ($wc_products as $product) {
            if (!$product instanceof WC_Product) {
                continue;
            }
            $row = $this->serialize_product_v3($product, $expand);
            if ($row !== null) {
                $products[] = $row;
            }
        }

        $total = (int) $query->found_posts;
        $max_pages = (int) $query->max_num_pages;
        return $this->wrap_v3_response($products, $page, $total, max(1, $max_pages));
    }

    /**
     * Serialize a WooCommerce product to Torob Product API v3 schema.
     *
     * @param WC_Product $product Product or variation.
     * @param bool|null  $expand  When null, reads WNC_Torob_Options.
     * @return array<string,mixed>|null
     */
    public function serialize_product_v3(WC_Product $product, ?bool $expand = null): ?array
    {
        if ( null === $expand ) {
            $expand = class_exists( 'WNC_Torob_Options', false ) && WNC_Torob_Options::isExpandVariationsEnabled();
        }
        $is_variation = $product->is_type('variation');
        $parent = $is_variation ? $this->get_valid_parent($product) : null;
        if ($is_variation && ($parent === null || !$product->get_price())) {
            return null;
        }
        if ($expand && $product->is_type('variable')) {
            // Variable parents are represented by variations when expand is on.
            return null;
        }
        if (!$expand && $is_variation) {
            return null;
        }

        $legacy = $this->get_product_values($product, $parent);
        $availability = $product->is_in_stock() && $product->get_stock_status() === 'instock';
        $current = $this->to_toman_int($legacy->current_price ?? 0);
        $old = $this->to_toman_int($legacy->old_price ?? $current);
        if (!$availability) {
            $current = 0;
        }

        $image_links = [];
        $main = wp_get_attachment_image_src($product->get_image_id(), 'full');
        if ($main) {
            $image_links[] = $main[0];
        }
        foreach ($product->get_gallery_image_ids() as $attachment_id) {
            $t_link = wp_get_attachment_image_src($attachment_id, 'full');
            if ($t_link && !in_array($t_link[0], $image_links, true)) {
                $image_links[] = $t_link[0];
            }
        }

        $spec = [];
        if (is_array($legacy->spec ?? null)) {
            // Legacy wraps dict in a one-element list for Woo plugin parity.
            if (isset($legacy->spec[0]) && is_array($legacy->spec[0])) {
                $spec = $legacy->spec[0];
            } elseif ($this->is_assoc_array($legacy->spec)) {
                $spec = $legacy->spec;
            }
        }

        $date_added = $product->get_date_created()
            ? $product->get_date_created()->format(DATE_ATOM)
            : gmdate(DATE_ATOM);
        $date_updated = $product->get_date_modified()
            ? $product->get_date_modified()->format(DATE_ATOM)
            : null;

        $row = [
            'page_unique' => (string) WNC_Torob_Extraction_Utils::get_page_unique($product),
            'page_url' => (string) WNC_Torob_Extraction_Utils::get_page_url($product),
            'title' => mb_substr((string) ($legacy->title ?? $product->get_name()), 0, 500),
            'current_price' => $current,
            'availability' => (bool) $availability,
            'image_links' => $image_links,
            'spec' => is_array($spec) ? $spec : [],
            'date_added' => $date_added,
        ];

        $subtitle = (string) ($legacy->subtitle ?? '');
        if ($subtitle !== '') {
            $row['subtitle'] = mb_substr($subtitle, 0, 500);
        }
        if ($parent) {
            $row['product_group_id'] = (string) $parent->get_id();
        }
        if ($old > 0 && $old !== $current) {
            $row['old_price'] = $old;
        }
        if (!empty($legacy->category_name)) {
            $row['category_name'] = mb_substr((string) $legacy->category_name, 0, 200);
        }
        $short = wp_strip_all_tags((string) ($legacy->short_desc ?? ''));
        if ($short !== '') {
            $row['short_desc'] = mb_substr($short, 0, 500);
        }
        $guarantee = (string) ($legacy->guarantee ?? '');
        if ($guarantee !== '') {
            $row['guarantee'] = mb_substr($guarantee, 0, 200);
        }
        if ($date_updated) {
            $row['date_updated'] = $date_updated;
        }

        return $row;
    }

    /**
     * Round shop display price (toman) to int for Torob.
     *
     * @param mixed $price Raw price in shop display unit (toman).
     */
    private function to_toman_int($price): int
    {
        if ($price === '' || $price === null) {
            return 0;
        }
        return (int) round((float) $price);
    }

    /**
     * @param array<mixed> $arr Candidate array.
     */
    private function is_assoc_array(array $arr): bool
    {
        if ($arr === []) {
            return true;
        }
        return array_keys($arr) !== range(0, count($arr) - 1);
    }
}
