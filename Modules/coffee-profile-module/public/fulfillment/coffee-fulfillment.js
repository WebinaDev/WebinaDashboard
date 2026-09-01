(function ($) {
  'use strict';

  function syncSelected($root) {
    $root.find('.wd-swatches[data-wcf-select]').each(function () {
      var $wrap = $(this);
      var $select = $wrap.find('select');
      if (!$select.length) {
        return;
      }
      var selected = String($select.val() || '');
      $wrap.find('.wd-swatch').each(function () {
        var isSelected = (this.getAttribute('data-value') || '') === selected && selected !== '';
        this.classList.toggle('is-selected', isSelected);
        this.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      });
      var $field = $wrap.closest('.wcf-field, [class*="variation-pa_"]');
      if (selected) {
        $field.addClass('is-valid');
      }
    });
  }

  function bindRoot($root) {
    if (!$root || !$root.length) {
      return;
    }
    if ($root.data('wcfBound')) {
      syncSelected($root);
      return;
    }
    $root.data('wcfBound', true);

    $root.on('click.wcf', '.wd-swatch', function (e) {
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
      $select.val(value);
      syncSelected($root);
      $root.removeClass('is-invalid');
    });

    $root.on('change.wcf', 'select.wcf-plain-select, .wd-swatch-select-hidden select, .wd-swatches[data-wcf-select] select', function () {
      syncSelected($root);
    });

    syncSelected($root);
  }

  function bindForm($form) {
    if (!$form.length) {
      return;
    }
    bindRoot($form);
    if ($form.data('wcfFormBound')) {
      return;
    }
    $form.data('wcfFormBound', true);
  }

  function injectOrderConfigs() {
    $('.wcf-order-configs').each(function () {
      var $block = $(this);
      if ($block.data('wcfInjected')) {
        return;
      }
      var $rows = $block.children('.wcf-field, [class*="variation-pa_"]');
      if (!$rows.length) {
        $block.remove();
        $block.data('wcfInjected', true);
        return;
      }

      var $form = $block.closest('form.variations_form');
      if (!$form.length) {
        $form = $('form.variations_form').first();
      }

      var $target = $form.find('.variations').first();
      if (!$target.length) {
        $target = $form.find('table.variations tbody').first();
      }

      if ($target.length) {
        $target.addClass('wcf-fulfillment');
        $rows.appendTo($target);
        $block.remove();
        if ($form.length) {
          bindForm($form);
        }
      } else {
        $block.attr('data-wcf-inject-failed', '1');
        bindRoot($block);
      }

      $block.data('wcfInjected', true);
    });
  }

  function init() {
    injectOrderConfigs();
    $('.wcf-fulfillment').each(function () {
      bindRoot($(this));
    });
    $('form.variations_form').each(function () {
      bindForm($(this));
    });
  }

  window.webinoOrderConfigsInit = init;

  $(document).ready(init);
  $(window).on('load', init);
  $(document).on('wc_variation_form', 'form.variations_form', init);
  $(window).on('elementor/frontend/init', init);

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.classList || !form.classList.contains('cart')) {
      return;
    }
    var fields = form.querySelectorAll('.wcf-field');
    if (!fields.length) {
      return;
    }
    var ok = true;
    fields.forEach(function (field) {
      var select = field.querySelector('select');
      if (select && !select.value) {
        ok = false;
        field.classList.remove('is-valid');
      }
    });
    if (!ok) {
      e.preventDefault();
      var root = form.querySelector('.wcf-fulfillment') || form;
      if (root && root.classList) {
        root.classList.add('is-invalid');
      }
    }
  });
})(jQuery);
