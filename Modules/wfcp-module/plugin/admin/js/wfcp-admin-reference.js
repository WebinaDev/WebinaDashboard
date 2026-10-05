/**
 * Reference price sync admin JS (product edit + settings tab).
 *
 * @package WFCP
 */

(function ($) {
	'use strict';

	function cfg() {
		return window.wfcpReference || { ajaxUrl: '', nonce: '', adminNonce: '', i18n: {} };
	}

	function setStatus($box, text, isError) {
		var $el = $box.find('.wfcp-reference-status');
		if (!$el.length) {
			return;
		}
		$el.text(text || '');
		$el.css('color', isError ? '#b91c1c' : '#0f766e');
	}

	function fetchOne($btn) {
		var $box = $btn.closest('.wfcp-reference-box');
		var productId = parseInt($box.data('product-id'), 10) || 0;
		var url = $.trim($box.find('.wfcp-reference-url').val() || '');
		var c = cfg();

		if (!productId) {
			setStatus($box, c.i18n.error || 'Error', true);
			return;
		}
		if (!url) {
			setStatus($box, 'لینک مرجع را وارد کنید', true);
			return;
		}

		$btn.prop('disabled', true);
		setStatus($box, c.i18n.fetching || '…', false);

		$.post(c.ajaxUrl, {
			action: 'wfcp_fetch_reference',
			nonce: c.nonce,
			product_id: productId,
			url: url
		})
			.done(function (res) {
				if (res && res.success) {
					var msg = (res.data && res.data.message) ? res.data.message : (c.i18n.success || 'OK');
					if (res.data && res.data.purchase_price) {
						msg += ' — قیمت خرید: ' + res.data.purchase_price;
						var $purchase = $('#_wfcp_purchase_price');
						if ($purchase.length && String($box.data('product-id')) === String($('#post_ID').val() || productId)) {
							$purchase.val(res.data.purchase_price);
						}
						var $varPurchase = $box.closest('.wfcp-var-pricing').find('input[name^="wfcp_variation_purchase"]');
						if ($varPurchase.length) {
							$varPurchase.val(res.data.purchase_price);
						}
					}
					setStatus($box, msg, false);
				} else {
					var err = (res && res.data && res.data.message) ? res.data.message : (c.i18n.error || 'Error');
					setStatus($box, err, true);
				}
			})
			.fail(function () {
				setStatus($box, c.i18n.error || 'Error', true);
			})
			.always(function () {
				$btn.prop('disabled', false);
			});
	}

	$(document).on('click', '.wfcp-fetch-reference', function (e) {
		e.preventDefault();
		fetchOne($(this));
	});

	$(document).on('click', '#wfcp-sync-all-references', function (e) {
		e.preventDefault();
		var $btn = $(this);
		var $status = $('#wfcp-reference-sync-status');
		var c = cfg();
		var admin = window.wfcpAdmin || {};
		var nonce = admin.nonce || c.adminNonce;

		$btn.prop('disabled', true);
		$status.text(c.i18n.queueing || '…').css('color', '#475569');

		$.post(c.ajaxUrl || admin.ajaxUrl, {
			action: 'wfcp_sync_all_references',
			nonce: nonce
		})
			.done(function (res) {
				if (res && res.success) {
					$status.text((res.data && res.data.message) ? res.data.message : 'OK').css('color', '#0f766e');
				} else {
					$status.text((res && res.data && res.data.message) ? res.data.message : (c.i18n.error || 'Error')).css('color', '#b91c1c');
				}
			})
			.fail(function () {
				$status.text(c.i18n.error || 'Error').css('color', '#b91c1c');
			})
			.always(function () {
				$btn.prop('disabled', false);
			});
	});
})(jQuery);
