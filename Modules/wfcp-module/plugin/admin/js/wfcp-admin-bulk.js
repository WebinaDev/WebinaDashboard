/**
 * Bulk Editor JavaScript
 *
 * AJAX-based product list with inline editing, filtering, pagination,
 * column toggles, and mobile responsive cards.
 *
 * @package    WFCP
 * @subpackage WFCP/admin/js
 */

(function($) {
	'use strict';

	/* ── DOM refs ── */
	var $table, $tbody, $mobileBody, $pagination;
	var visibleColumns = {};

	/* ── Utility ── */
	var formatNumber  = function(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
	var unformat      = function(s) { return s.toString().replace(/[^0-9]/g, ''); };

	var debounceTimer;
	var debounce = function(fn, ms) { clearTimeout(debounceTimer); debounceTimer = setTimeout(fn, ms); };

	/* ── Init ── */
	$(document).ready(function() {
		$table      = $('.wfcp-bulk-table');
		$tbody      = $('#wfcp-bulk-table-body');
		$mobileBody = $('#wfcp-bulk-mobile-body');
		$pagination = $('#wfcp-bulk-pagination');

		if (!$table.length) return; // not on bulk editor page

		initColumnVisibility();
		fetchProducts(1);

		// Filters
		$('#wfcp-category-filter, #wfcp-brand-filter, #wfcp-stock-filter, #wfcp-sort-filter').on('change', function() { fetchProducts(1); });
		$('#wfcp-search').on('keyup', function() { debounce(function() { fetchProducts(1); }, 500); });
		$('#wfcp-search').on('keypress', function(e) { if (e.which === 13) { e.preventDefault(); fetchProducts(1); } });

		// Column toggles
		$('.wfcp-toggle-column').on('click', function() { toggleColumn($(this).data('column')); });

		// Window resize → mobile convert
		var resizeTimer;
		$(window).on('resize', function() { clearTimeout(resizeTimer); resizeTimer = setTimeout(function() { convertToMobile(true); }, 250); });

		/* ── Delegated event handlers ── */

		// Pagination
		$(document).on('click', '.wfcp-pm-pagination .page-numbers', function(e) {
			e.preventDefault();
			var p = $(this).data('page');
			if (p && p > 0) fetchProducts(p);
		});

		// Purchase price change
		$(document).on('change', '.wfcp-purchase-price-input', function() {
			var $input = $(this);
			var $row   = $input.closest('tr');
			var pid    = $row.data('product-id');
			var val    = $input.val();
			if (!val || val <= 0) return;
			updatePurchasePrice(pid, val, $row);
		});
		$(document).on('keypress', '.wfcp-purchase-price-input', function(e) { if (e.which === 13) $(this).trigger('change'); });

		// Lock price
		$(document).on('change', '.wfcp-lock-price-checkbox', function() {
			var $cb = $(this);
			updateLockPrice($cb.data('product-id'), $cb.is(':checked'), $cb);
		});

		// WC Regular/Sale price formatting
		$(document).on('input', '.wfcp-wc-price-input', function() {
			var pos = this.selectionStart, origLen = this.value.length;
			var raw = unformat(this.value);
			this.value = raw ? formatNumber(raw) : '';
			var diff = this.value.length - origLen;
			this.setSelectionRange(pos + diff, pos + diff);
		});
		$(document).on('focus', '.wfcp-wc-price-input', function() {
			var $i = $(this);
			if (!$i.data('original-value')) $i.data('original-value', unformat($i.val()));
		});
		$(document).on('blur', '.wfcp-wc-price-input', function() {
			var $i = $(this), cur = unformat($i.val()), orig = $i.data('original-value') || '';
			if (cur === orig) return;
			saveWCPrice($i);
		});

		// Stock status dropdown
		$(document).on('focus', '.wfcp-stock-select', function() {
			var $s = $(this);
			if (!$s.data('original-value')) $s.data('original-value', $s.val());
		});
		$(document).on('change', '.wfcp-stock-select', function() {
			var $s = $(this), cur = $s.val(), orig = $s.data('original-value') || '';
			if (cur === orig) return;
			saveStockStatus($s);
		});

		// Brand dropdown
		$(document).on('focus', '.wfcp-brand-select', function() {
			var $s = $(this);
			if (typeof $s.attr('data-original-value') === 'undefined') $s.attr('data-original-value', $s.val() || '');
		});
		$(document).on('change', '.wfcp-brand-select', function() {
			var $s = $(this), cur = $s.val() || '', orig = $s.attr('data-original-value') || '';
			if (cur === orig) return;
			saveBrand($s);
		});
	});

	/* ═══════════ AJAX: load products ═══════════ */
	function fetchProducts(page) {
		$tbody.html('<tr><td colspan="12" style="text-align:center;padding:40px 0;"><span class="spinner is-active"></span></td></tr>');
		$pagination.empty();
		$mobileBody.empty();

		$.post(wfcpBulk.ajaxUrl, {
			action:       'wfcp_pm_get_products',
			_ajax_nonce:  wfcpBulk.filterNonce,
			page:         page || 1,
			category:     $('#wfcp-category-filter').val(),
			brand:        $('#wfcp-brand-filter').val(),
			stock_status: $('#wfcp-stock-filter').val(),
			sort:         $('#wfcp-sort-filter').val(),
			search:       $('#wfcp-search').val().trim()
		})
		.done(function(r) {
			if (r.success) {
				$tbody.html(r.data.products_html);
				$pagination.html(r.data.pagination_html);
				applyColumnVisibility();
				convertToMobile(true);
			} else {
				$tbody.html('<tr><td colspan="12">خطا: ' + (r.data || 'نامشخص') + '</td></tr>');
			}
		})
		.fail(function() {
			$tbody.html('<tr><td colspan="12">خطای ارتباط با سرور. لطفاً صفحه را رفرش کنید.</td></tr>');
		});
	}

	/* ═══════════ Save helpers ═══════════ */

	function updatePurchasePrice(pid, price, $row) {
		var $input   = $row.find('.wfcp-purchase-price-input');
		var $spinner = $('<span class="wfcp-spinner"></span>');
		$input.after($spinner).prop('disabled', true);

		$.post(wfcpBulk.ajaxUrl, {
			action: 'wfcp_update_product_price',
			nonce: wfcpBulk.nonce,
			product_id: pid,
			purchase_price: price
		})
		.done(function(r) {
			$spinner.remove();
			$input.prop('disabled', false);
			if (r.success) {
				$row.find('.wfcp-retail-price').text(r.data.retail_price);
				$row.find('.wfcp-credit-price').text(r.data.credit_price);
				$row.find('.wfcp-wholesale-price').text(r.data.wholesale_price);
				if (r.data.digikala_price) $row.find('.wfcp-digikala-price').html(r.data.digikala_price);
				if (r.data.basalam_price) $row.find('.wfcp-basalam-price').html(r.data.basalam_price);
				if (r.data.technolife_price) $row.find('.wfcp-technolife-price').html(r.data.technolife_price);
				if (r.data.snappshop_price) $row.find('.wfcp-snappshop-price').html(r.data.snappshop_price);
				if (r.data.tapsishop_price) $row.find('.wfcp-tapsishop-price').html(r.data.tapsishop_price);
				if (r.data.zarehbin_price) $row.find('.wfcp-zarehbin-price').html(r.data.zarehbin_price);
				if (r.data.emalls_price) $row.find('.wfcp-emalls-price').html(r.data.emalls_price);
				if (r.data.snapppay_search_price) $row.find('.wfcp-snapppay-search-price').html(r.data.snapppay_search_price);
				if (r.data.torob_price) $row.find('.wfcp-torob-price').html(r.data.torob_price);
				showToast('قیمت با موفقیت به‌روزرسانی شد', 'success');
			} else {
				showToast(r.data.message || 'خطا', 'error');
			}
		})
		.fail(function() { $spinner.remove(); $input.prop('disabled', false); showToast('خطای سرور', 'error'); });
	}

	function updateLockPrice(pid, locked, $cb) {
		$cb.prop('disabled', true);
		$.post(wfcpBulk.ajaxUrl, {
			action: 'wfcp_update_lock_price',
			nonce: wfcpBulk.nonce,
			product_id: pid,
			is_locked: locked ? 1 : 0
		})
		.done(function(r) {
			$cb.prop('disabled', false);
			if (r.success) {
				$cb.closest('tr').find('.wfcp-purchase-price-input').prop('disabled', locked);
				showToast(r.data.message || 'قفل قیمت به‌روزرسانی شد', 'success');
			} else {
				$cb.prop('checked', !locked);
				showToast(r.data.message || 'خطا', 'error');
			}
		})
		.fail(function() { $cb.prop('disabled', false); $cb.prop('checked', !locked); showToast('خطای سرور', 'error'); });
	}

	function saveWCPrice($input) {
		var $wrap  = $input.closest('.wfcp-pm-price-wrapper');
		var $st    = $wrap.find('.wfcp-pm-save-status');
		var raw    = unformat($input.val());
		$st.removeClass('success error').addClass('saving');

		$.post(wfcpBulk.ajaxUrl, {
			action:      'wfcp_pm_update_price',
			_ajax_nonce: wfcpBulk.updateNonce,
			id:          $input.data('id'),
			price:       raw,
			price_type:  $input.data('price-type')
		})
		.done(function(r) {
			console.log('WFCP price save response:', JSON.stringify(r));
			$st.removeClass('saving');
			if (r.success) {
				if (r.data && r.data.verified === false) {
					$st.addClass('error');
					showToast('قیمت ذخیره نشد! کنسول مرورگر را چک کنید', 'error');
					console.error('WFCP price NOT verified:', r.data);
				} else {
					$st.addClass('success');
					$input.data('original-value', raw);
					showToast('قیمت ذخیره شد', 'success');
				}
			} else {
				$st.addClass('error');
				showToast((r.data && r.data.message) || 'خطا در ذخیره قیمت', 'error');
				console.error('WFCP price save error:', r);
			}
		})
		.fail(function(xhr) {
			$st.removeClass('saving').addClass('error');
			showToast('خطای سرور - قیمت ذخیره نشد', 'error');
			console.error('WFCP price save AJAX fail:', xhr.status, xhr.responseText);
		})
		.always(function(){ setTimeout(function(){ $st.removeClass('success error'); }, 2500); });
	}

	function saveStockStatus($select) {
		var $wrap = $select.closest('.wfcp-pm-stock-wrapper');
		var $st   = $wrap.find('.wfcp-pm-save-status');
		$st.removeClass('success error').addClass('saving');

		$.post(wfcpBulk.ajaxUrl, {
			action:       'wfcp_pm_update_stock',
			_ajax_nonce:  wfcpBulk.updateNonce,
			id:           $select.data('id'),
			stock_status: $select.val()
		})
		.done(function(r) {
			console.log('WFCP stock save response:', JSON.stringify(r));
			$st.removeClass('saving');
			if (r.success) {
				if (r.data && r.data.verified === false) {
					$st.addClass('error');
					showToast('موجودی ذخیره نشد! کنسول مرورگر را چک کنید', 'error');
					console.error('WFCP stock NOT verified:', r.data);
				} else {
					$st.addClass('success');
					$select.data('original-value', $select.val());
					showToast('وضعیت موجودی ذخیره شد', 'success');
				}
			} else {
				$st.addClass('error');
				showToast((r.data && r.data.message) || 'خطا در ذخیره موجودی', 'error');
				console.error('WFCP stock save error:', r);
			}
		})
		.fail(function(xhr) {
			$st.removeClass('saving').addClass('error');
			showToast('خطای سرور - موجودی ذخیره نشد', 'error');
			console.error('WFCP stock save AJAX fail:', xhr.status, xhr.responseText);
		})
		.always(function(){ setTimeout(function(){ $st.removeClass('success error'); }, 2500); });
	}

	function saveBrand($select) {
		var pid = parseInt($select.data('product-id'), 10);
		if (!pid) return;
		var $wrap = $select.closest('.wfcp-pm-brand-wrapper');
		var $st   = $wrap.find('.wfcp-pm-save-status');
		var val   = $select.val() || '0';
		$st.removeClass('success error').addClass('saving');

		$.post(wfcpBulk.ajaxUrl, {
			action:      'wfcp_pm_update_brand',
			_ajax_nonce: wfcpBulk.updateNonce,
			id:          pid,
			brand_id:    val
		})
		.done(function(r) {
			console.log('WFCP brand save response:', JSON.stringify(r));
			$st.removeClass('saving');
			if (r.success) {
				if (r.data && r.data.verified === false) {
					$st.addClass('error');
					showToast('برند ذخیره نشد! کنسول مرورگر را چک کنید', 'error');
					console.error('WFCP brand NOT verified:', r.data);
				} else {
					$st.addClass('success');
					$('.wfcp-brand-select[data-product-id="' + pid + '"]').each(function() {
						$(this).val(val).attr('data-original-value', val);
					});
					showToast('برند ذخیره شد', 'success');
				}
			} else {
				$st.addClass('error');
				$select.val($select.attr('data-original-value'));
				showToast((r.data && r.data.message) || 'خطا در ذخیره برند', 'error');
				console.error('WFCP brand save error:', r);
			}
		})
		.fail(function(xhr) {
			$st.removeClass('saving').addClass('error');
			$select.val($select.attr('data-original-value'));
			showToast('خطای سرور - برند ذخیره نشد', 'error');
			console.error('WFCP brand save AJAX fail:', xhr.status, xhr.responseText);
		})
		.always(function(){ setTimeout(function(){ $st.removeClass('success error'); }, 2500); });
	}

	/* ═══════════ Column toggles ═══════════ */

	function initColumnVisibility() {
		$('.wfcp-bulk-table').find('th[data-column]').each(function() { visibleColumns[$(this).data('column')] = true; });
	}

	function toggleColumn(col) {
		if (!col) return;
		visibleColumns[col] = !visibleColumns[col];
		$('.wfcp-bulk-table').find('[data-column="' + col + '"]').toggle(visibleColumns[col]);
		$('.wfcp-toggle-column[data-column="' + col + '"]').toggleClass('active', visibleColumns[col]);
	}

	function applyColumnVisibility() {
		for (var col in visibleColumns) {
			if (!visibleColumns[col]) {
				$('.wfcp-bulk-table').find('[data-column="' + col + '"]').hide();
			}
		}
	}

	/* ═══════════ Mobile cards ═══════════ */

	function convertToMobile(force) {
		var isDesktop = $(window).width() > 768;
		if (isDesktop) { $mobileBody.hide(); $table.show(); return; }
		$table.hide(); $mobileBody.show();
		if (!force && $mobileBody.children().length) return;
		$mobileBody.empty();

		$tbody.find('tr').each(function() {
			var $r = $(this), $c = $r.find('td');
			if ($c.length < 5) return;

			var card = '<div class="wfcp-pm-mobile-card">';
			card += '<div class="wfcp-pm-mobile-card-header">' + ($c.filter('[data-column="image"]').html() || '') + '</div>';
			card += '<div class="wfcp-pm-mobile-card-body">';

			$c.each(function() {
				var $td = $(this), col = $td.data('column');
				if (!col || col === 'image') return;
				if (visibleColumns[col] === false) return;

				var label = $table.find('th[data-column="' + col + '"]').text();
				card += '<div class="wfcp-pm-mobile-field"><div class="wfcp-pm-mobile-label">' + label + '</div>';
				card += '<div class="wfcp-pm-mobile-field-content">' + $td.html() + '</div></div>';
			});

			card += '</div></div>';
			$mobileBody.append(card);
		});
	}

	/* ═══════════ Toast ═══════════ */
	function showToast(msg, type) {
		var $t = $('<div class="wfcp-toast ' + (type || 'info') + '">' + msg + '</div>');
		$('body').append($t);
		setTimeout(function() { $t.fadeOut(function() { $(this).remove(); }); }, 3000);
	}

})(jQuery);

