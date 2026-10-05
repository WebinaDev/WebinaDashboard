<?php
/**
 * Bulk Editor / Price List Page
 *
 * AJAX-loaded product list with inline editing for purchase price, WC prices,
 * stock status, and brand.
 *
 * @package    WFCP
 * @subpackage WFCP/admin/partials
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

$categories = get_terms( array(
	'taxonomy'   => 'product_cat',
	'hide_empty' => false,
) );

$brands = array();
if ( taxonomy_exists( 'product_brand' ) ) {
	$brands = get_terms( array(
		'taxonomy'   => 'product_brand',
		'hide_empty' => false,
	) );
}
if ( is_wp_error( $brands ) ) {
	$brands = array();
}
?>

<div class="wrap wfcp-admin-wrap">
	<div class="wfcp-admin-header">
		<h1><?php esc_html_e( 'لیست قیمت', 'webina-woo-core' ); ?></h1>
		<p><?php esc_html_e( 'در این صفحه می‌توانید قیمت تمام محصولات و متغیرهای آن‌ها را مشاهده و ویرایش کنید. تغییرات به صورت خودکار ذخیره می‌شوند.', 'webina-woo-core' ); ?></p>
	</div>

	<div class="wfcp-bulk-editor">
		<!-- Filters -->
		<div class="wfcp-bulk-filters">
			<input
				type="text"
				id="wfcp-search"
				class="wfcp-form-control"
				placeholder="<?php esc_attr_e( 'جستجوی محصول...', 'webina-woo-core' ); ?>"
			>

			<select id="wfcp-category-filter" class="wfcp-form-control">
				<option value=""><?php esc_html_e( 'همه دسته‌ها', 'webina-woo-core' ); ?></option>
				<?php if ( ! is_wp_error( $categories ) ) : ?>
					<?php foreach ( $categories as $category ) : ?>
						<option value="<?php echo esc_attr( $category->slug ); ?>">
							<?php echo esc_html( $category->name ); ?>
						</option>
					<?php endforeach; ?>
				<?php endif; ?>
			</select>

			<?php if ( ! empty( $brands ) ) : ?>
				<select id="wfcp-brand-filter" class="wfcp-form-control">
					<option value=""><?php esc_html_e( 'همه برندها', 'webina-woo-core' ); ?></option>
					<?php foreach ( $brands as $brand ) : ?>
						<option value="<?php echo esc_attr( $brand->slug ); ?>">
							<?php echo esc_html( $brand->name ); ?>
						</option>
					<?php endforeach; ?>
				</select>
			<?php endif; ?>

			<select id="wfcp-stock-filter" class="wfcp-form-control">
				<option value=""><?php esc_html_e( 'همه موجودی‌ها', 'webina-woo-core' ); ?></option>
				<option value="instock"><?php esc_html_e( 'موجود', 'webina-woo-core' ); ?></option>
				<option value="outofstock"><?php esc_html_e( 'ناموجود', 'webina-woo-core' ); ?></option>
			</select>

			<select id="wfcp-sort-filter" class="wfcp-form-control">
				<option value="date_desc"><?php esc_html_e( 'جدیدترین', 'webina-woo-core' ); ?></option>
				<option value="date_asc"><?php esc_html_e( 'قدیمی‌ترین', 'webina-woo-core' ); ?></option>
				<option value="name_asc"><?php esc_html_e( 'الفبا (صعودی)', 'webina-woo-core' ); ?></option>
				<option value="name_desc"><?php esc_html_e( 'الفبا (نزولی)', 'webina-woo-core' ); ?></option>
				<option value="price_asc"><?php esc_html_e( 'قیمت (کم به زیاد)', 'webina-woo-core' ); ?></option>
				<option value="price_desc"><?php esc_html_e( 'قیمت (زیاد به کم)', 'webina-woo-core' ); ?></option>
			</select>
		</div>

		<div class="wfcp-bulk-sync-toolbar" style="margin: 15px 0;">
			<button type="button" class="wfcp-btn wfcp-btn-primary wfcp-sync-all-wc-prices">
				<?php esc_html_e( 'بازمحاسبه و همگام‌سازی قیمت ووکامرس', 'webina-woo-core' ); ?>
			</button>
			<small style="display: block; margin-top: 8px; color: #64748b;">
				<?php esc_html_e( 'قیمت تکی (خرده) از روی قیمت خرید برای همهٔ محصولات و تنوع‌ها در متای ووکامرس ذخیره می‌شود؛ محصولات قفل‌شده تغییر نمی‌کنند.', 'webina-woo-core' ); ?>
			</small>
		</div>

		<!-- Column Toggles -->
		<div class="wfcp-toggle-columns-wrapper" style="margin: 15px 0;">
			<strong><?php esc_html_e( 'نمایش ستون‌ها:', 'webina-woo-core' ); ?></strong>
			<div class="wfcp-toggle-columns-buttons" style="display: inline-flex; gap: 10px; margin-right: 15px; flex-wrap: wrap;">
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="image"><?php esc_html_e( 'عکس', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="name"><?php esc_html_e( 'نام', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="attrs"><?php esc_html_e( 'ویژگی‌ها', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="sku"><?php esc_html_e( 'SKU', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="brand"><?php esc_html_e( 'برند', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="stock"><?php esc_html_e( 'موجودی', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="purchase_price"><?php esc_html_e( 'قیمت خرید', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="retail_price"><?php esc_html_e( 'قیمت تکی', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="credit_price"><?php esc_html_e( 'قیمت اعتباری', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="wholesale_price"><?php esc_html_e( 'قیمت عمده', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="digikala_price"><?php esc_html_e( 'دیجیکالا', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="basalam_price"><?php esc_html_e( 'باسلام', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="technolife_price"><?php esc_html_e( 'تکنولایف', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="snappshop_price"><?php esc_html_e( 'اسنپ شاپ', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="tapsishop_price"><?php esc_html_e( 'تپسی شاپ', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="zarehbin_price"><?php esc_html_e( 'ذره‌بین', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="emalls_price"><?php esc_html_e( 'ایمالز', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="snapppay_search_price"><?php esc_html_e( 'اسنپ‌پی سرچ', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="torob_price"><?php esc_html_e( 'ترب', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="regular_price"><?php esc_html_e( 'قیمت ووکامرس', 'webina-woo-core' ); ?></button>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="sale_price"><?php esc_html_e( 'قیمت تخفیف ووکامرس', 'webina-woo-core' ); ?></button>
				<?php
				$extra_cols = apply_filters( 'wfcp_bulk_editor_extra_columns', array() );
				foreach ( $extra_cols as $col_key => $col_label ) :
					?>
				<button type="button" class="wfcp-btn wfcp-btn-secondary wfcp-toggle-column active" data-column="<?php echo esc_attr( $col_key ); ?>"><?php echo esc_html( $col_label ); ?></button>
				<?php endforeach; ?>
			</div>
		</div>

		<!-- Desktop Table -->
		<table class="wfcp-bulk-table">
			<thead>
				<tr>
					<th data-column="image"><?php esc_html_e( 'عکس', 'webina-woo-core' ); ?></th>
					<th data-column="name"><?php esc_html_e( 'نام', 'webina-woo-core' ); ?></th>
					<th data-column="attrs"><?php esc_html_e( 'ویژگی‌ها', 'webina-woo-core' ); ?></th>
					<th data-column="sku"><?php esc_html_e( 'SKU', 'webina-woo-core' ); ?></th>
					<th data-column="brand"><?php esc_html_e( 'برند', 'webina-woo-core' ); ?></th>
					<th data-column="stock"><?php esc_html_e( 'موجودی', 'webina-woo-core' ); ?></th>
					<th data-column="purchase_price"><?php esc_html_e( 'قیمت خرید', 'webina-woo-core' ); ?></th>
					<th data-column="retail_price"><?php esc_html_e( 'قیمت تکی', 'webina-woo-core' ); ?></th>
					<th data-column="credit_price"><?php esc_html_e( 'قیمت اعتباری', 'webina-woo-core' ); ?></th>
					<th data-column="wholesale_price"><?php esc_html_e( 'قیمت عمده', 'webina-woo-core' ); ?></th>
					<th data-column="digikala_price"><?php esc_html_e( 'دیجیکالا', 'webina-woo-core' ); ?></th>
					<th data-column="basalam_price"><?php esc_html_e( 'باسلام', 'webina-woo-core' ); ?></th>
					<th data-column="technolife_price"><?php esc_html_e( 'تکنولایف', 'webina-woo-core' ); ?></th>
					<th data-column="snappshop_price"><?php esc_html_e( 'اسنپ شاپ', 'webina-woo-core' ); ?></th>
					<th data-column="tapsishop_price"><?php esc_html_e( 'تپسی شاپ', 'webina-woo-core' ); ?></th>
					<th data-column="zarehbin_price"><?php esc_html_e( 'ذره‌بین', 'webina-woo-core' ); ?></th>
					<th data-column="emalls_price"><?php esc_html_e( 'ایمالز', 'webina-woo-core' ); ?></th>
					<th data-column="snapppay_search_price"><?php esc_html_e( 'اسنپ‌پی سرچ', 'webina-woo-core' ); ?></th>
					<th data-column="torob_price"><?php esc_html_e( 'ترب', 'webina-woo-core' ); ?></th>
					<th data-column="regular_price"><?php esc_html_e( 'قیمت ووکامرس', 'webina-woo-core' ); ?></th>
					<th data-column="sale_price"><?php esc_html_e( 'تخفیف ووکامرس', 'webina-woo-core' ); ?></th>
					<?php foreach ( apply_filters( 'wfcp_bulk_editor_extra_columns', array() ) as $col_key => $col_label ) : ?>
					<th data-column="<?php echo esc_attr( $col_key ); ?>"><?php echo esc_html( $col_label ); ?></th>
					<?php endforeach; ?>
				</tr>
			</thead>
			<tbody id="wfcp-bulk-table-body">
			</tbody>
		</table>

		<!-- Mobile Card View -->
		<div class="wfcp-bulk-mobile-view" id="wfcp-bulk-mobile-body" style="display:none;"></div>

		<!-- Pagination -->
		<div id="wfcp-bulk-pagination" class="wfcp-pm-pagination-container"></div>
	</div>
</div>