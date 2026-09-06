(function ($) {
  'use strict';

  /**
   * Coffee-profile fulfillment helpers only.
   * Order-config PDP injection / webinoOrderConfigsInit lives in assets/order-configs/order-configs.js
   * — do not overwrite it or move rows into WC .variations.
   */

  function syncSelected($root) {
    $root.find('.wd-swatches[data-wcf-select], .wd-swatches[data-webino-order-config]').each(function () {
      var $wrap = $(this);
      var $select = $wrap.find('select');
      if (!$select.length) {
        return;
      }
      var selected = String($select.val() || '');
      $wrap.find('.wd-swatch').each(function () {
        var isSelected = (this.getAttribute('data-value') || '') === selected && selected !== '';
        this.classList.toggle('is-selected', isSelected);
        this.classList.remove('is-disabled');
        this.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        this.setAttribute('aria-disabled', 'false');
      });
      var $field = $wrap.closest('.wcf-field');
      if (selected) {
        $field.addClass('is-valid');
      }
    });
  }

  function bindRoot($root) {
    if (!$root || !$root.length) {
      return;
    }
    if ($root.data('wcfCoffeeBound')) {
      syncSelected($root);
      return;
    }
    $root.data('wcfCoffeeBound', true);

    $root.on('click.wcfCoffee', '.wd-swatches[data-wcf-select] .wd-swatch, .wd-swatches[data-webino-order-config] .wd-swatch', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var $wrap = $(this).closest('.wd-swatches');
      var $select = $wrap.find('select');
      var value = this.getAttribute('data-value') || '';
      if (!$select.length) {
        return;
      }
      $select.val(value).trigger('change');
      syncSelected($root);
      $root.removeClass('is-invalid');
    });

    $root.on('change.wcfCoffee', 'select.wcf-plain-select, .wd-swatch-select-hidden select, .wd-swatches[data-wcf-select] select, .wd-swatches[data-webino-order-config] select', function () {
      syncSelected($root);
    });

    syncSelected($root);
  }

  function init() {
    $('.wcf-order-config-fields, .wcf-fulfillment').each(function () {
      bindRoot($(this));
    });
    $('.wcf-order-config-fields .wd-swatch, .wd-swatches[data-webino-order-config] .wd-swatch')
      .removeClass('is-disabled')
      .attr('aria-disabled', 'false');
  }

  $(document).ready(init);
  $(window).on('load', init);
  $(document).on('wc_variation_form', 'form.variations_form', init);
  $(window).on('elementor/frontend/init', init);
})(jQuery);
