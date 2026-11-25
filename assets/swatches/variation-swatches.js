(function ($) {
	'use strict';

	function decodeValue(value) {
		try {
			return decodeURIComponent(String(value || ''));
		} catch (e) {
			return String(value || '');
		}
	}

	// Swatch value ⇄ <option> value matching.
	// WooCommerce may submit the term slug while the swatch holds a label, so compare the raw value,
	// the decoded value AND the other values we stored on the button (data-swatch-slug / -value).
	function valuesMatch(a, b) {
		a = String(a || '');
		b = String(b || '');
		if (a === b) {
			return true;
		}
		return decodeValue(a) === decodeValue(b);
	}

	function swatchCandidates($swatch) {
		return [
			$swatch.attr('data-value'),
			$swatch.attr('data-swatch-value'),
			$swatch.attr('data-swatch-slug'),
		];
	}

	function swatchMatchesOption($swatch, optionValue) {
		var option = String(optionValue || '');
		var candidates = swatchCandidates($swatch);
		for (var i = 0; i < candidates.length; i++) {
			var candidate = String(candidates[i] || '');
			if (candidate !== '' && valuesMatch(candidate, option)) {
				return true;
			}
		}
		return false;
	}

	// Same, but also accepts the visible <option> label (legacy markup stored the label in data-value).
	function swatchMatchesOptionElement($swatch, optionEl) {
		if (!optionEl) {
			return false;
		}
		if (swatchMatchesOption($swatch, optionEl.value)) {
			return true;
		}
		var text = String(optionEl.textContent || '').trim();
		if (text === '') {
			return false;
		}
		var candidates = swatchCandidates($swatch);
		for (var i = 0; i < candidates.length; i++) {
			var candidate = String(candidates[i] || '');
			if (candidate !== '' && valuesMatch(candidate, text)) {
				return true;
			}
		}
		return false;
	}

	// The value the attribute <select> actually accepts for this swatch (never a label WooCommerce
	// does not know about, which would make the select fall back to "" and the UI "jump").
	function resolveOptionValue($select, $swatch) {
		var preferred = String($swatch.attr('data-value') || '');
		if (preferred !== '') {
			var direct = $select.find('option').filter(function () {
				return String(this.value) === preferred;
			});
			if (direct.length) {
				return preferred;
			}
		}
		var resolved = '';
		$select.find('option').each(function () {
			if (resolved === '') {
				if (swatchMatchesOptionElement($swatch, this)) {
					resolved = String(this.value);
				}
			}
		});
		return resolved;
	}

	function isOrderConfigSwatch(el) {
		return Boolean(
			el &&
				(el.getAttribute('data-webino-order-config') ||
					el.getAttribute('data-wcf-select') ||
					$(el).closest('[data-webino-order-config], .wcf-order-config-fields, .webino-order-configs').length)
		);
	}

	function enableOrderConfigSwatches($form) {
		var $scope = $form && $form.length ? $form : $(document);
		$scope
			.find('.wd-swatches[data-webino-order-config] .wd-swatch, .wcf-order-config-fields .wd-swatch, .webino-order-configs .wd-swatch')
			.removeClass('is-disabled')
			.attr('aria-disabled', 'false');
	}

	function syncDisabled($form) {
		$form.find('.wd-swatches').each(function () {
			if (isOrderConfigSwatch(this)) {
				return;
			}
			var $wrap = $(this);
			var $select = $wrap.find('select');
			if (!$select.length) {
				return;
			}
			$wrap.find('.wd-swatch').each(function () {
				var $swatch = $(this);
				var $opt = $select.find('option').filter(function () {
					return swatchMatchesOptionElement($swatch, this);
				});
				var enabled = $opt.length > 0 && !$opt.prop('disabled') && resolveOptionValue($select, $swatch) !== '';
				this.classList.toggle('is-disabled', !enabled);
				this.setAttribute('aria-disabled', enabled ? 'false' : 'true');
			});
		});
		enableOrderConfigSwatches($form);
	}

	function syncSelected($form) {
		$form.find('.wd-swatches').each(function () {
			if (isOrderConfigSwatch(this)) {
				return;
			}
			var $wrap = $(this);
			var $select = $wrap.find('select');
			var selected = String($select.val() || '');
			var $selectedOpt = $select.find('option').filter(function () {
				return String(this.value) === selected;
			}).first();
			$wrap.find('.wd-swatch').each(function () {
				var isSelected = selected !== ''
					&& (swatchMatchesOption($(this), selected)
						|| ($selectedOpt.length > 0 && swatchMatchesOptionElement($(this), $selectedOpt.get(0))));
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
			if ($(this).closest('.wd-swatches[data-wcf-select], .wd-swatches[data-webino-order-config]').length) {
				return;
			}
			e.preventDefault();
			if (this.classList.contains('is-disabled')) {
				return;
			}
			var $wrap = $(this).closest('.wd-swatches');
			var $select = $wrap.find('select');
			var $swatch = $(this);
			if (!$select.length) {
				return;
			}
			var option = resolveOptionValue($select, $swatch);
			if (option === '') {
				return;
			}
			var nativeSelect = $select.get(0);
			$select.val(option);
			// Let WooCommerce (and its `change` listeners) see a real <select> change event so the
			// variation lookup runs with the same value the native select would submit.
			if (typeof window.Event === 'function') {
				nativeSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
			} else {
				$select.trigger('change');
			}
			syncSelected($form);

			// Some WooCommerce builds reset an attribute to "" when the picked combination has no
			// match (e.g. a variation with missing attribute meta). Re-assert once so the choice the
			// shopper clicked is never silently dropped; the storefront then shows "unavailable".
			window.setTimeout(function () {
				if (!$select.val()) {
					$select.val(option);
					if (typeof window.Event === 'function') {
						nativeSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
					} else {
						$select.trigger('change');
					}
				}
				syncSelected($form);
			}, 0);
		});

		$form.on('woocommerce_update_variation_values.wdSwatch check_variations.wdSwatch', function () {
			syncDisabled($form);
			syncSelected($form);
			enableOrderConfigSwatches($form);
		});

		$form.on('reset_data.wdSwatch click.wdSwatch', '.reset_variations', function () {
			window.setTimeout(function () {
				syncSelected($form);
				syncDisabled($form);
				enableOrderConfigSwatches($form);
			}, 0);
		});

		syncDisabled($form);
		syncSelected($form);
		enableOrderConfigSwatches($form);
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

	function findVariationsAnchor($form) {
		var $table = $form.find('table.variations').first();
		if ($table.length) {
			return $table;
		}
		return $form.find('.variations').first();
	}

	function mountOrderConfigHtml(html, cfg) {
		var $form = $('form.variations_form, form.cart').first();
		if (!$form.length || !html) {
			document.body.removeAttribute('data-wd-order-config-bootstrap');
			return Promise.resolve();
		}
		var $html = $(html);
		var $anchor = findVariationsAnchor($form);
		if ($anchor.length) {
			$html.insertAfter($anchor);
		} else {
			var $button = $form.find('.single_add_to_cart_button, button[type="submit"]').first();
			if ($button.length) {
				$html.insertBefore($button.closest('.woocommerce-variation-add-to-cart, .quantity, p').length
					? $button.closest('.woocommerce-variation-add-to-cart, .quantity, p')
					: $button);
			} else {
				$form.append($html);
			}
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
			enableOrderConfigSwatches($form);
			document.body.setAttribute('data-wd-order-config-bootstrap', 'done');
		});
	}

	function bootstrapOrderConfigs() {
		if (document.querySelector('.webino-order-configs, .wcf-order-configs, .wcf-order-config-fields')) {
			enableOrderConfigSwatches($('form.variations_form, form.cart').first());
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
		enableOrderConfigSwatches($(this));
	});

	$(init);
	$(window).on('load', bootstrapOrderConfigs);
})(jQuery);
