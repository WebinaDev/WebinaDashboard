(function ($) {
	'use strict';

	function decodeValue(value) {
		try {
			return decodeURIComponent(String(value || ''));
		} catch (e) {
			return String(value || '');
		}
	}

	function valuesMatch(a, b) {
		a = String(a || '');
		b = String(b || '');
		if (a === b) {
			return true;
		}
		return decodeValue(a) === decodeValue(b);
	}

	function syncDisabled($form) {
		$form.find('.wd-swatches').each(function () {
			if (this.getAttribute('data-wcf-select')) {
				return;
			}
			var $wrap = $(this);
			var $select = $wrap.find('select');
			if (!$select.length) {
				return;
			}
			$wrap.find('.wd-swatch').each(function () {
				var value = this.getAttribute('data-value') || '';
				var $opt = $select.find('option').filter(function () {
					return valuesMatch(this.value, value);
				});
				var enabled = $opt.length > 0 && !$opt.prop('disabled') && value !== '';
				this.classList.toggle('is-disabled', !enabled);
				this.setAttribute('aria-disabled', enabled ? 'false' : 'true');
			});
		});
	}

	function syncSelected($form) {
		$form.find('.wd-swatches').each(function () {
			if (this.getAttribute('data-wcf-select')) {
				return;
			}
			var $wrap = $(this);
			var selected = String($wrap.find('select').val() || '');
			$wrap.find('.wd-swatch').each(function () {
				var isSelected = valuesMatch(this.getAttribute('data-value') || '', selected) && selected !== '';
				this.classList.toggle('is-selected', isSelected);
				this.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
			});
		});
	}

	function bindForm($form) {
		if ($form.data('wdSwatchesBound')) {
			return;
		}
		$form.data('wdSwatchesBound', true);

		$form.on('click.wdSwatch', '.wd-swatch', function (e) {
			if ($(this).closest('.wd-swatches[data-wcf-select]').length) {
				return;
			}
			e.preventDefault();
			if (this.classList.contains('is-disabled')) {
				return;
			}
			var $wrap = $(this).closest('.wd-swatches');
			var $select = $wrap.find('select');
			var value = this.getAttribute('data-value') || '';
			if (!$select.length) {
				return;
			}
			$select.val(value).trigger('change');
			syncSelected($form);
		});

		$form.on('woocommerce_update_variation_values.wdSwatch check_variations.wdSwatch', function () {
			syncDisabled($form);
			syncSelected($form);
		});

		$form.on('reset_data.wdSwatch click.wdSwatch', '.reset_variations', function () {
			window.setTimeout(function () {
				syncSelected($form);
				syncDisabled($form);
			}, 0);
		});

		syncDisabled($form);
		syncSelected($form);
	}

	function loadStyle(href) {
		if (!href || document.querySelector('link[href="' + href + '"]')) {
			return Promise.resolve();
		}
		return new Promise(function (resolve) {
			var link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = href;
			link.onload = resolve;
			link.onerror = resolve;
			document.head.appendChild(link);
		});
	}

	function loadScript(src) {
		if (!src || document.querySelector('script[src="' + src + '"]')) {
			return Promise.resolve();
		}
		return new Promise(function (resolve) {
			var script = document.createElement('script');
			script.src = src;
			script.async = true;
			script.onload = resolve;
			script.onerror = resolve;
			document.body.appendChild(script);
		});
	}

	function mountOrderConfigHtml(html, cfg) {
		var $form = $('form.variations_form, form.cart').first();
		if (!$form.length || !html) {
			document.body.removeAttribute('data-wd-order-config-bootstrap');
			return Promise.resolve();
		}
		var $html = $(html);
		var $target = $form.find('.variations').not('table').first();
		if ($target.length) {
			$html.insertBefore($target);
		} else {
			$form.prepend($html);
		}
		var chain = Promise.resolve();
		if (cfg.orderConfigsCss) {
			chain = chain.then(function () {
				return loadStyle(cfg.orderConfigsCss);
			});
		}
		if (cfg.orderConfigsJs) {
			chain = chain.then(function () {
				return loadScript(cfg.orderConfigsJs);
			});
		}
		return chain.then(function () {
			if (typeof window.webinoOrderConfigsInit === 'function') {
				window.webinoOrderConfigsInit();
			}
			document.body.setAttribute('data-wd-order-config-bootstrap', 'done');
		});
	}

	function bootstrapOrderConfigs() {
		if (document.querySelector('.webino-order-configs, .wcf-order-configs')) {
			return;
		}
		var cfg = window.webinoStorefront;
		if (!cfg || !cfg.productId) {
			return;
		}
		var state = document.body.getAttribute('data-wd-order-config-bootstrap');
		if (state === 'pending' || state === 'done') {
			return;
		}
		document.body.setAttribute('data-wd-order-config-bootstrap', 'pending');

		if (cfg.orderConfigHtml) {
			mountOrderConfigHtml(cfg.orderConfigHtml, cfg).catch(function () {
				document.body.removeAttribute('data-wd-order-config-bootstrap');
			});
			return;
		}

		var url = cfg.orderConfigPickerUrl || cfg.orderConfigPickerUrlAlt || '';
		if (!url) {
			document.body.removeAttribute('data-wd-order-config-bootstrap');
			return;
		}

		fetch(url, { credentials: 'same-origin' })
			.then(function (response) {
				return response.json();
			})
			.then(function (data) {
				if (!data || !data.html) {
					document.body.removeAttribute('data-wd-order-config-bootstrap');
					return;
				}
				return mountOrderConfigHtml(data.html, cfg);
			})
			.catch(function () {
				document.body.removeAttribute('data-wd-order-config-bootstrap');
			});
	}

	function init() {
		$('form.variations_form').each(function () {
			bindForm($(this));
		});
		bootstrapOrderConfigs();
	}

	$(document).on('wc_variation_form', 'form.variations_form', function () {
		bindForm($(this));
		bootstrapOrderConfigs();
	});

	$(init);
	$(window).on('load', bootstrapOrderConfigs);
})(jQuery);
