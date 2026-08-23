(function ($) {
	'use strict';

	function syncDisabled($form) {
		$form.find('.wd-swatches').each(function () {
			var $wrap = $(this);
			var $select = $wrap.find('select');
			if (!$select.length) {
				return;
			}
			$wrap.find('.wd-swatch').each(function () {
				var value = this.getAttribute('data-value') || '';
				var $opt = $select.find('option').filter(function () {
					return this.value === value;
				});
				var enabled = $opt.length > 0 && !$opt.prop('disabled') && value !== '';
				this.classList.toggle('is-disabled', !enabled);
				this.setAttribute('aria-disabled', enabled ? 'false' : 'true');
			});
		});
	}

	function syncSelected($form) {
		$form.find('.wd-swatches').each(function () {
			var $wrap = $(this);
			var selected = String($wrap.find('select').val() || '');
			$wrap.find('.wd-swatch').each(function () {
				var isSelected = (this.getAttribute('data-value') || '') === selected && selected !== '';
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

	function init() {
		$('form.variations_form').each(function () {
			bindForm($(this));
		});
	}

	$(document).on('wc_variation_form', 'form.variations_form', function () {
		bindForm($(this));
	});

	$(init);
})(jQuery);
