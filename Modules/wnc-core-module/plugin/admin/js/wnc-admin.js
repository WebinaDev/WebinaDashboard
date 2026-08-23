(function ($) {
	'use strict';

	function msg($el, text, ok) {
		$el.removeClass('ok err').addClass(ok ? 'ok' : 'err').text(text || '');
	}

	function post(action, data) {
		data = data || {};
		data.action = action;
		data.nonce = wncAdmin.nonce;
		return $.post(wncAdmin.ajaxUrl, data);
	}

	$(document).on('submit', '.wnc-settings-form', function (e) {
		e.preventDefault();
		var $form = $(this);
		var platform = $form.data('platform');
		var data = $form.serializeArray();
		var payload = { platform: platform, enabled: false, auto_sync: false, credentials: {} };
		data.forEach(function (f) {
			if (f.name === 'enabled') payload.enabled = true;
			else if (f.name === 'auto_sync') payload.auto_sync = true;
			else if (f.name.indexOf('credentials[') === 0) {
				var m = f.name.match(/credentials\[([^\]]+)\]/);
				if (m) payload.credentials[m[1]] = f.value;
			}
		});
		// jQuery will flatten nested objects poorly; send flat.
		var req = {
			platform: platform,
			enabled: payload.enabled ? 1 : 0,
			auto_sync: payload.auto_sync ? 1 : 0
		};
		Object.keys(payload.credentials).forEach(function (k) {
			req['credentials[' + k + ']'] = payload.credentials[k];
		});
		post('wnc_save_settings', req).done(function (r) {
			msg($form.find('.wnc-ajax-msg'), r.success ? r.data.message : (r.data && r.data.message) || wncAdmin.i18n.error, !!r.success);
		});
	});

	$(document).on('click', '.wnc-test-connection', function () {
		var platform = $(this).data('platform');
		var $msg = $('.wnc-ajax-msg[data-platform="' + platform + '"]').first();
		if (!$msg.length) $msg = $(this).closest('.wnc-card, .wnc-wrap').find('.wnc-ajax-msg').first();
		post('wnc_test_connection', { platform: platform }).done(function (r) {
			msg($msg, r.success ? r.data.message : (r.data && r.data.message) || wncAdmin.i18n.error, !!r.success);
		});
	});

	$(document).on('click', '.wnc-torob-connectivity', function () {
		var $msg = $(this).closest('form, .wnc-card').find('.wnc-torob-connectivity-msg').first();
		post('wnc_torob_connectivity', {}).done(function (r) {
			msg($msg, r.success ? r.data.message : (r.data && r.data.message) || wncAdmin.i18n.error, !!r.success);
		});
	});

	$(document).on('click', '.wnc-generate-dk-keys', function () {
		var $form = $(this).closest('form');
		var $msg = $form.find('.wnc-ajax-msg');
		if (!window.confirm('جفت کلید RSA 4096 جدید ساخته می‌شود و کلید خصوصی قبلی جایگزین می‌گردد. ادامه؟')) {
			return;
		}
		post('wnc_generate_digikala_keys', {}).done(function (r) {
			msg($msg, r.success ? r.data.message : (r.data && r.data.message) || wncAdmin.i18n.error, !!r.success);
			if (r.success && r.data.public_key) {
				$form.find('#wnc-dk-public-key').val(r.data.public_key);
			}
		});
	});

	$(document).on('click', '.wnc-issue-dk-token', function () {
		var $btn = $(this);
		var $form = $btn.closest('form');
		var $msg = $form.find('.wnc-ajax-msg');
		var data = $form.serializeArray();
		var req = { platform: $form.data('platform') || 'digikala' };
		data.forEach(function (f) {
			if (f.name.indexOf('credentials[') === 0) {
				var m = f.name.match(/credentials\[([^\]]+)\]/);
				// Skip readonly public_key re-save noise; keep encrypted_code + optional private_key.
				if (m) req['credentials[' + m[1] + ']'] = f.value;
			}
		});
		// Persist current form fields then RSA-decrypt + issue token.
		post('wnc_save_settings', $.extend({}, req, {
			enabled: $form.find('[name=enabled]').is(':checked') ? 1 : 0,
			auto_sync: $form.find('[name=auto_sync]').is(':checked') ? 1 : 0
		})).done(function (saveRes) {
			if (!saveRes.success) {
				msg($msg, (saveRes.data && saveRes.data.message) || wncAdmin.i18n.error, false);
				return;
			}
			post('wnc_issue_digikala_token', {}).done(function (r) {
				msg($msg, r.success ? r.data.message : (r.data && r.data.message) || wncAdmin.i18n.error, !!r.success);
				if (r.success) {
					setTimeout(function () { location.reload(); }, 800);
				}
			});
		});
	});

	$(document).on('click', '.wnc-pull-orders', function () {
		var platform = $(this).data('platform') || '';
		var $msg = $(this).closest('.wnc-wrap, .wnc-card').find('.wnc-ajax-msg').first();
		post('wnc_pull_orders', { platform: platform }).done(function (r) {
			msg($msg, r.success ? r.data.message : (r.data && r.data.message) || wncAdmin.i18n.error, !!r.success);
		});
	});

	$(document).on('submit', '.wnc-map-form', function (e) {
		e.preventDefault();
		var $form = $(this);
		post('wnc_save_map', {
			wc_product_id: $form.find('[name=wc_product_id]').val(),
			wc_variation_id: $form.find('[name=wc_variation_id]').val() || 0,
			platform: $form.find('[name=platform]').val(),
			remote_product_id: $form.find('[name=remote_product_id]').val(),
			remote_variant_id: $form.find('[name=remote_variant_id]').val(),
			sync_enabled: 1
		}).done(function (r) {
			msg($form.find('.wnc-ajax-msg'), r.success ? r.data.message : (r.data && r.data.message) || wncAdmin.i18n.error, !!r.success);
			if (r.success) setTimeout(function () { location.reload(); }, 600);
		});
	});

	$(document).on('click', '.wnc-search-remote', function () {
		var $form = $(this).closest('form');
		var platform = $form.find('[name=platform]').val();
		var keyword = $form.find('.wnc-remote-keyword').val();
		var $box = $form.find('.wnc-remote-results');
		$box.html('...');
		post('wnc_search_remote', { platform: platform, keyword: keyword }).done(function (r) {
			if (!r.success) {
				$box.html('<p class="wnc-error">' + ((r.data && r.data.message) || wncAdmin.i18n.error) + '</p>');
				return;
			}
			var html = '';
			(r.data.items || []).forEach(function (item) {
				html += '<div class="item" data-id="' + (item.id || '') + '" data-variant="' + (item.variant_id || '') + '">' +
					'<strong>' + (item.title || item.id) + '</strong> — ' + (item.id || '') + ' / ' + (item.variant_id || '') +
					'</div>';
			});
			$box.html(html || '<p>—</p>');
		});
	});

	$(document).on('click', '.wnc-remote-results .item', function () {
		var $form = $(this).closest('form');
		$form.find('[name=remote_product_id]').val($(this).data('id'));
		$form.find('[name=remote_variant_id]').val($(this).data('variant'));
	});

	$(document).on('click', '.wnc-sync-now', function () {
		var $btn = $(this);
		post('wnc_sync_now', {
			platform: $btn.data('platform'),
			wc_product_id: $btn.data('wc-product') || $btn.data('product') || 0,
			wc_variation_id: $btn.data('wc-variation') || 0,
			product_id: $btn.data('product') || 0
		}).done(function (r) {
			alert(r.success ? r.data.message : ((r.data && r.data.message) || wncAdmin.i18n.error));
		});
	});

	$(document).on('click', '.wnc-delete-map', function () {
		if (!confirm(wncAdmin.i18n.confirm)) return;
		var $btn = $(this);
		post('wnc_delete_map', {
			platform: $btn.data('platform'),
			wc_product_id: $btn.data('wc-product'),
			wc_variation_id: $btn.data('wc-variation') || 0
		}).done(function (r) {
			if (r.success) location.reload();
			else alert((r.data && r.data.message) || wncAdmin.i18n.error);
		});
	});
})(jQuery);
