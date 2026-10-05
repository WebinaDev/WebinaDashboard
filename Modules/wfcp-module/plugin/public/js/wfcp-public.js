/**
 * Public JavaScript — purchase method selection + theme ATC bridge.
 *
 * @package    WFCP
 * @subpackage WFCP/public/js
 */

(function($) {
	'use strict';

	if ( window.wfcpBound ) {
		return;
	}
	window.wfcpBound = true;

	/**
	 * Themes/optimizers sometimes run wp-util before underscore, so wp.template
	 * never registers. WC found_variation then throws and never sets variation_id.
	 */
	function ensureWpTemplate() {
		if ( typeof window.wp === 'undefined' ) {
			window.wp = {};
		}
		if ( typeof window.wp.template === 'function' ) {
			return true;
		}
		if ( typeof window._ === 'undefined' || typeof window._.template !== 'function' ) {
			return false;
		}
		window.wp.template = window._.memoize( function( id ) {
			var compiled;
			var options = {
				evaluate: /<#([\s\S]+?)#>/g,
				interpolate: /\{\{\{([\s\S]+?)\}\}\}/g,
				escape: /\{\{([^\}]+?)\}\}(?!\})/g,
				variable: 'data'
			};
			return function( data ) {
				var el = document.querySelector( 'script#tmpl-' + id );
				if ( ! el ) {
					throw new Error( 'Template not found: #tmpl-' + id );
				}
				compiled = compiled || window._.template( $( el ).html(), options );
				return compiled( data );
			};
		} );
		return true;
	}

	ensureWpTemplate();

	function defaultPurchaseType() {
		var cfg = window.wfcpPublic || {};
		if (cfg.lockPurchaseType) {
			return String(cfg.lockPurchaseType);
		}
		return (cfg.defaultPurchaseType || 'cash').toString();
	}

	function cartPurchaseSelection() {
		var cfg = window.wfcpPublic || {};
		var type = (cfg.cartPurchaseType || '').toString();
		if (!type) {
			return null;
		}
		if (type === 'retail') {
			type = 'cash';
		}
		var months = parseInt(cfg.cartInstallmentMonths, 10) || 0;
		return { type: type, months: months };
	}

	function nearestBox($el) {
		var $box = $el.closest('.wfcp-pricing-box');
		return $box.length ? $box : $('.wfcp-pricing-box').first();
	}

	function nearestCartForm($from) {
		var $scope = $from && $from.length ? $from.closest('.product, .summary, .entry-summary, body') : $('body');
		var $form = $scope.find('form.cart').first();
		if (!$form.length) {
			$form = $('form.cart').first();
		}
		if (!$form.length) {
			$form = $scope.find('form.variations_form').first();
		}
		return $form;
	}

	function getSelection($box) {
		var cfg = window.wfcpPublic || {};
		$box = $box && $box.length ? $box : $('.wfcp-pricing-box').first();
		var gatewayFromUi = function() {
			var gid = ($box.data('selected-gateway') || '').toString();
			var $gw = $box.find('.wfcp-gateway-badge.is-selected[data-gateway-id]').first();
			if ($gw.length) {
				gid = ($gw.data('gateway-id') || gid).toString();
			}
			return gid;
		};

		if (cfg.lockPurchaseType) {
			return { type: String(cfg.lockPurchaseType), months: 0, gateway: gatewayFromUi() };
		}
		var cartSel = cartPurchaseSelection();
		if (cartSel && cartSel.type) {
			cartSel.gateway = gatewayFromUi();
			return cartSel;
		}
		var type = ($box.data('selected-type') || defaultPurchaseType()).toString();
		var months = parseInt($box.data('selected-months'), 10) || 0;
		var gateway = ($box.data('selected-gateway') || '').toString();
		var $active = $box.find('.wfcp-pricing-row.active');
		if ($active.length) {
			type = ($active.data('purchase-type') || type).toString();
			if (type === 'installment') {
				var $plan = $active.find('.wfcp-installment-plan-item.active');
				if ($plan.length) {
					months = parseInt($plan.data('months'), 10) || months;
				} else {
					months = parseInt($active.data('months'), 10) || months;
				}
			}
			var $gw = $active.find('.wfcp-gateway-badge.is-selected[data-gateway-id]').first();
			if ($gw.length) {
				gateway = ($gw.data('gateway-id') || gateway).toString();
			}
		}
		return { type: type, months: months, gateway: gateway };
	}

	/**
	 * Keep hidden fields on WC/theme cart form in sync with selected method.
	 */
	function setPurchaseCookie(type, months, gateway) {
		try {
			var maxAge = 60 * 60 * 6;
			document.cookie = 'wfcp_purchase_type=' + encodeURIComponent(type || 'cash') + '; path=/; max-age=' + maxAge + '; SameSite=Lax';
			if (type === 'installment' && months > 0) {
				document.cookie = 'wfcp_installment_months=' + encodeURIComponent(String(months)) + '; path=/; max-age=' + maxAge + '; SameSite=Lax';
			} else {
				document.cookie = 'wfcp_installment_months=; path=/; max-age=0; SameSite=Lax';
			}
			if (gateway) {
				document.cookie = 'wfcp_gateway=' + encodeURIComponent(gateway) + '; path=/; max-age=' + maxAge + '; SameSite=Lax';
			} else {
				document.cookie = 'wfcp_gateway=; path=/; max-age=0; SameSite=Lax';
			}
		} catch (err) { /* ignore */ }
	}

	function injectPurchaseIntoPayload(data, sel) {
		if (!sel || !sel.type) {
			return data;
		}

		if (typeof data === 'string') {
			data = appendParam(data, 'purchase_type', sel.type);
			if (sel.type === 'installment' && sel.months > 0) {
				data = appendParam(data, 'installment_months', sel.months);
			} else {
				data = data.replace(/(^|&)installment_months=[^&]*/g, '').replace(/^&/, '');
			}
			// ishop nests extras under cart_item_data[...]
			data = appendParam(data, 'cart_item_data[purchase_type]', sel.type);
			if (sel.type === 'installment' && sel.months > 0) {
				data = appendParam(data, 'cart_item_data[installment_months]', sel.months);
			}
			if (sel.gateway) {
				data = appendParam(data, 'wfcp_gateway', sel.gateway);
				data = appendParam(data, 'cart_item_data[wfcp_gateway]', sel.gateway);
			}
			return data;
		}

		if (typeof data === 'object' && data !== null) {
			data.purchase_type = sel.type;
			if (sel.type === 'installment' && sel.months > 0) {
				data.installment_months = sel.months;
			} else {
				delete data.installment_months;
			}

			if (!data.cart_item_data || typeof data.cart_item_data !== 'object') {
				data.cart_item_data = {};
			}
			data.cart_item_data.purchase_type = sel.type;
			if (sel.type === 'installment' && sel.months > 0) {
				data.cart_item_data.installment_months = sel.months;
			} else {
				delete data.cart_item_data.installment_months;
			}
			if (sel.gateway) {
				data.wfcp_gateway = sel.gateway;
				data.cart_item_data.wfcp_gateway = sel.gateway;
			} else {
				delete data.wfcp_gateway;
				delete data.cart_item_data.wfcp_gateway;
			}
			return data;
		}

		var payload = {
			purchase_type: sel.type,
			cart_item_data: {
				purchase_type: sel.type
			}
		};
		if (sel.type === 'installment' && sel.months > 0) {
			payload.installment_months = sel.months;
			payload.cart_item_data.installment_months = sel.months;
		}
		if (sel.gateway) {
			payload.wfcp_gateway = sel.gateway;
			payload.cart_item_data.wfcp_gateway = sel.gateway;
		}
		return payload;
	}

	function syncHiddenFields($box) {
		$box = $box && $box.length ? $box : $('.wfcp-pricing-box').first();
		if (!$box.length) {
			return;
		}

		var sel = getSelection($box);
		$box.data('selected-type', sel.type);
		$box.attr('data-selected-type', sel.type);
		if (sel.months) {
			$box.data('selected-months', sel.months);
			$box.attr('data-selected-months', sel.months);
		}

		setPurchaseCookie(sel.type, sel.months, sel.gateway);

		var $form = nearestCartForm($box);
		var $host = $form.length ? $form : $box;

		var $type = $host.find('input[name="purchase_type"].wfcp-purchase-type-field');
		if (!$type.length) {
			$type = $('<input type="hidden" class="wfcp-purchase-type-field" name="purchase_type" />');
			$host.append($type);
		}
		$type.val(sel.type);

		var $months = $host.find('input[name="installment_months"].wfcp-installment-months-field');
		if (sel.type === 'installment' && sel.months > 0) {
			if (!$months.length) {
				$months = $('<input type="hidden" class="wfcp-installment-months-field" name="installment_months" />');
				$host.append($months);
			}
			$months.val(sel.months);
		} else if ($months.length) {
			$months.remove();
		}

		var $gw = $host.find('input[name="wfcp_gateway"].wfcp-gateway-field');
		if (sel.gateway) {
			if (!$gw.length) {
				$gw = $('<input type="hidden" class="wfcp-gateway-field" name="wfcp_gateway" />');
				$host.append($gw);
			}
			$gw.val(sel.gateway);
			$box.data('selected-gateway', sel.gateway);
			$box.attr('data-selected-gateway', sel.gateway);
		} else if ($gw.length) {
			$gw.remove();
		}
	}

	function selectRow($row) {
		var $box = nearestBox($row);
		$box.find('.wfcp-pricing-row').removeClass('active').attr('aria-pressed', 'false');
		$row.addClass('active').attr('aria-pressed', 'true');
		syncHiddenFields($box);
	}

	function applyVariationPrices($box, data) {
		if (data.formatted_retail) {
			$box.find('.wfcp-pricing-row.cash .wfcp-pricing-amount').html(data.formatted_retail);
		} else {
			$box.find('.wfcp-pricing-row.cash .wfcp-pricing-amount').text('—');
		}

		var $wholeRow = $box.find('.wfcp-pricing-row.wholesale');
		if ($wholeRow.length) {
			if (data.formatted_wholesale) {
				$wholeRow.find('.wfcp-pricing-amount').html(data.formatted_wholesale);
			} else {
				$wholeRow.find('.wfcp-pricing-amount').text('—');
			}
		}

		var $creditRow = $box.find('.wfcp-pricing-row.credit');
		if ($creditRow.length) {
			if (data.formatted_credit) {
				$creditRow.find('.wfcp-pricing-amount').html(data.formatted_credit);
			} else {
				$creditRow.find('.wfcp-pricing-amount').text('—');
			}
		}

		var plans = data.installment_plans || data.wfcp_installment_plans || [];
		$box.find('.wfcp-installment-plan-item').each(function() {
			var $item = $(this);
			var months = parseInt($item.data('months'), 10);
			var plan = null;
			for (var i = 0; i < plans.length; i++) {
				if (parseInt(plans[i].months, 10) === months) {
					plan = plans[i];
					break;
				}
			}
			if (plan && plan.formatted) {
				$item.find('.wfcp-installment-plan-price').html('هر قسط ' + plan.formatted);
				$item.attr('data-monthly', plan.formatted);
			} else {
				$item.find('.wfcp-installment-plan-price').text('هر قسط —');
				$item.attr('data-monthly', '');
			}
		});
		syncTimelineFromPlan($box);
	}

	function parsePlanDates($plan) {
		var raw = $plan.attr('data-dates') || '';
		if (!raw) {
			return [];
		}
		try {
			var parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : [];
		} catch (err) {
			return [];
		}
	}

	function syncTimelineFromPlan($box) {
		var $track = $box.find('.wfcp-timeline-track');
		if (!$track.length) {
			return;
		}
		var $plan = $box.find('.wfcp-pricing-row.installment .wfcp-installment-plan-item.active').first();
		if (!$plan.length) {
			$plan = $box.find('.wfcp-pricing-row.installment .wfcp-installment-plan-item').first();
		}
		if (!$plan.length) {
			return;
		}
		var months = parseInt($plan.data('months'), 10) || 0;
		var monthly = $plan.attr('data-monthly') || '';
		$box.find('.wfcp-timeline-headline').text('جیبت رو الان خالی نکن؛ ' + months + ' قسطه بخر!');
		if (monthly) {
			$box.find('.wfcp-timeline-monthly').html('هر قسط: ' + monthly);
		} else {
			$box.find('.wfcp-timeline-monthly').text('هر قسط: —');
		}
		var dates = parsePlanDates($plan);
		var $ol = $track.find('.wfcp-timeline-dates');
		if (!$ol.length) {
			return;
		}
		$ol.empty();
		if (!dates.length) {
			$track[0].style.setProperty('--wfcp-timeline-count', '1');
			return;
		}
		$track[0].style.setProperty('--wfcp-timeline-count', String(dates.length));
		dates.forEach(function(label, index) {
			var $li = $('<li></li>').addClass(index === 0 ? 'is-today' : 'is-future');
			$li.append($('<span class="wfcp-timeline-dot" aria-hidden="true"></span>'));
			$li.append($('<span class="wfcp-timeline-date"></span>').text(label));
			$ol.append($li);
		});
	}

	function isAddToCartRequest(url, data) {
		var u = (url || '').toString();
		if (u.indexOf('add_to_cart') !== -1 || u.indexOf('add-to-cart') !== -1) {
			return true;
		}
		if (!data) {
			return false;
		}

		// Exclude variation lookup / price-check requests that also carry product_id.
		function looksLikeGetVariation(payload) {
			if (typeof payload === 'string') {
				return payload.indexOf('get_variation') !== -1
					|| payload.indexOf('wc-ajax=get_variation') !== -1
					|| payload.indexOf('action=woocommerce_get_variation') !== -1
					|| payload.indexOf('action=wfcp_get_variation_prices') !== -1;
			}
			if (typeof payload === 'object' && payload !== null) {
				var act = payload.action ? String(payload.action) : '';
				if (act.indexOf('get_variation') !== -1 || act === 'wfcp_get_variation_prices') {
					return true;
				}
			}
			return false;
		}

		if (looksLikeGetVariation(data)) {
			return false;
		}

		if (typeof data === 'string') {
			return data.indexOf('add-to-cart') !== -1
				|| data.indexOf('action=woocommerce_add_to_cart') !== -1
				|| data.indexOf('action=ishop_woocommerce_add_to_cart') !== -1
				|| data.indexOf('ishop_woocommerce_add_to_cart') !== -1
				|| data.indexOf('action=wfcp_add_to_cart') !== -1;
		}
		if (typeof data === 'object') {
			if (data['add-to-cart']) {
				return true;
			}
			if (data.action && String(data.action).indexOf('add_to_cart') !== -1) {
				return true;
			}
		}
		return false;
	}

	function appendParam(serialized, key, value) {
		if (!key) {
			return serialized;
		}
		var re = new RegExp('([?&])' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=[^&]*');
		var pair = encodeURIComponent(key) + '=' + encodeURIComponent(value);
		if (re.test(serialized)) {
			return serialized.replace(re, '$1' + pair);
		}
		return serialized + (serialized.length ? '&' : '') + pair;
	}

	/**
	 * Inject purchase_type into theme / WC add-to-cart AJAX payloads.
	 * ishop uses action=ishop_woocommerce_add_to_cart and nests fields in cart_item_data.
	 */
	$.ajaxPrefilter(function(options) {
		if (!isAddToCartRequest(options.url, options.data)) {
			return;
		}

		var sel = getSelection($('.wfcp-pricing-box').first());
		if (!sel.type) {
			return;
		}

		syncHiddenFields($('.wfcp-pricing-box').first());
		options.data = injectPurchaseIntoPayload(options.data, sel);
	});

	/**
	 * Cached WFCP buttons (if any): select method and click theme ATC instead.
	 */
	function handleLegacyWfcpAdd(e) {
		var target = e.target;
		if (!target || !target.closest) {
			return;
		}
		var btn = target.closest('.wfcp-btn-add');
		if (!btn) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();

		var $button = $(btn);
		var $row = $button.closest('.wfcp-pricing-row');
		if ($row.length) {
			selectRow($row);
		} else {
			syncHiddenFields(nearestBox($button));
		}

		var $themeBtn = $('.single_add_to_cart_button').filter(':visible').first();
		if (!$themeBtn.length) {
			$themeBtn = $('button.single_add_to_cart_button, .single_add_to_cart_button, [name="add-to-cart"]').first();
		}
		if ($themeBtn.length) {
			$themeBtn.trigger('click');
		}
	}

	document.addEventListener('click', handleLegacyWfcpAdd, true);

	$(document).ready(function() {
		// Restore wp.template if a script optimizer broke wp-util, then re-check variations.
		if (ensureWpTemplate()) {
			$('form.variations_form').each(function() {
				$(this).trigger('check_variations');
			});
		}

		var $box = $('.wfcp-pricing-box').first();
		if ($box.length) {
			var preferred = ($box.data('selected-type') || defaultPurchaseType()).toString();
			var $default = $box.find('.wfcp-pricing-row[data-purchase-type="' + preferred + '"]').first();
			if (!$default.length) {
				$default = $box.find('.wfcp-pricing-row.cash').first();
			}
			if ($default.length && !$box.find('.wfcp-pricing-row.active').length) {
				$default.addClass('active').attr('aria-pressed', 'true');
			}
			$box.find('.wfcp-gateways-badges--pick').each(function() {
				var $group = $(this);
				if (!$group.find('.wfcp-gateway-badge.is-selected').length) {
					$group.find('.wfcp-gateway-badge[data-gateway-id]').first().addClass('is-selected');
				}
			});
			syncHiddenFields($box);
		}

		$(document).on('click', '.wfcp-pricing-row[data-purchase-type]', function(e) {
			if ($(e.target).closest('.wfcp-installment-plan-item, .wfcp-gateway-badge, .wfcp-btn-add').length) {
				return;
			}
			selectRow($(this));
		});

		$(document).on('keydown', '.wfcp-pricing-row[data-purchase-type]', function(e) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				selectRow($(this));
			}
		});

		$(document).on('click', '.wfcp-installment-plan-item', function(e) {
			e.stopPropagation();
			var $item = $(this);
			var $row = $item.closest('.wfcp-pricing-row');
			var $boxLocal = nearestBox($item);
			$row.find('.wfcp-installment-plan-item').removeClass('active');
			$item.addClass('active');
			var months = parseInt($item.data('months'), 10) || 0;
			$row.attr('data-months', months).data('months', months);
			selectRow($row);
			syncHiddenFields($boxLocal);
			syncTimelineFromPlan($boxLocal);
		});

		$(document).on('click', '.wfcp-gateway-badge[data-gateway-id]', function(e) {
			e.preventDefault();
			e.stopPropagation();
			var $btn = $(this);
			var $row = $btn.closest('.wfcp-pricing-row');
			var $boxLocal = nearestBox($btn);
			$row.find('.wfcp-gateway-badge[data-gateway-id]').removeClass('is-selected');
			$btn.addClass('is-selected');
			if ($row.length && !$row.hasClass('active')) {
				selectRow($row);
			} else {
				syncHiddenFields($boxLocal);
			}
		});

		// Before theme/WC submits cart form, ensure fields are present.
		$(document).on('submit', 'form.cart, form.variations_form', function() {
			syncHiddenFields($('.wfcp-pricing-box').first());
		});

		$(document).on('click', '.single_add_to_cart_button, [name="add-to-cart"]', function() {
			syncHiddenFields($('.wfcp-pricing-box').first());
		});

		$(document).on('found_variation', 'form.variations_form', function(event, variation) {
			var $form = $(this);
			var $boxLocal = nearestBox($form);
			if (!$boxLocal.length) {
				$boxLocal = $('.wfcp-pricing-box[data-is-variable="1"]').first();
			}
			if (!$boxLocal.length || !variation || !variation.variation_id) {
				return;
			}

			if (variation.wfcp_formatted_retail) {
				applyVariationPrices($boxLocal, {
					formatted_retail: variation.wfcp_formatted_retail,
					formatted_credit: variation.wfcp_formatted_credit || '',
					formatted_wholesale: variation.wfcp_formatted_wholesale || '',
					installment_plans: variation.wfcp_installment_plans || []
				});
				return;
			}

			var productId = $boxLocal.data('product-id');
			var varId = variation.variation_id;

			$.ajax({
				url: typeof wfcpPublic !== 'undefined' ? wfcpPublic.ajaxUrl : '',
				type: 'POST',
				data: {
					action: 'wfcp_get_variation_prices',
					product_id: productId,
					variation_id: varId,
					nonce: typeof wfcpPublic !== 'undefined' ? wfcpPublic.nonce : ''
				},
				success: function(res) {
					if (!res.success || !res.data) {
						return;
					}
					applyVariationPrices($boxLocal, res.data);
				}
			});
		});

		$(document).on('reset_data', 'form.variations_form', function() {
			var $form = $(this);
			var $boxLocal = nearestBox($form);
			if (!$boxLocal.length) {
				$boxLocal = $('.wfcp-pricing-box[data-is-variable="1"]').first();
			}
			if (!$boxLocal.length) {
				return;
			}
			$boxLocal.find('.wfcp-pricing-row.cash .wfcp-pricing-amount').text('—');
			$boxLocal.find('.wfcp-pricing-row.credit .wfcp-pricing-amount').text('—');
			$boxLocal.find('.wfcp-pricing-row.wholesale .wfcp-pricing-amount').text('—');
			$boxLocal.find('.wfcp-installment-plan-item .wfcp-installment-plan-price').text('هر قسط —');
		});

		$(document).on('click', '.wfcp-btn-apply-type', function() {
			var $btn = $(this);
			var newType = $('#wfcp-cart-type-select').val();
			var nonce = $btn.data('nonce') || (typeof wfcpPublic !== 'undefined' ? wfcpPublic.nonce : '');
			if (!newType) {
				return;
			}

			$btn.prop('disabled', true).text('در حال اعمال...');

			var ajaxUrl = (typeof wfcpPublic !== 'undefined' && wfcpPublic.ajaxUrl) ? wfcpPublic.ajaxUrl : '/wp-admin/admin-ajax.php';
			$.ajax({
				url: ajaxUrl,
				type: 'POST',
				data: {
					action: 'wfcp_update_cart_type',
					new_type: newType,
					nonce: nonce
				},
				success: function(res) {
					if (!res || !res.success) {
						$btn.prop('disabled', false).text('اعمال تغییر');
						return;
					}
					// Full reload avoids nested cart HTML from fragment replaceWith on ishop.
					window.location.reload();
				},
				error: function() {
					$btn.prop('disabled', false).text('اعمال تغییر');
				}
			});
		});
	});

})(jQuery);
