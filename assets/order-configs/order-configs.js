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

  function selectedOptionLabel($select) {
    var val = String($select.val() || '');
    if (!val) {
      return '';
    }
    var label = '';
    $select.find('option').each(function () {
      if (valuesMatch(this.value, val)) {
        label = String($(this).text() || '').trim();
        return false;
      }
    });
    return label;
  }

  function syncFieldLabel($field, selectedLabel) {
    var $name = $field.find('[data-wcf-selected-name]').first();
    if (!$name.length) {
      return;
    }
    if (selectedLabel) {
      $name.text(selectedLabel).show();
      $field.find('[data-wcf-selected-sep]').show();
    } else {
      $name.text('').hide();
      $field.find('[data-wcf-selected-sep]').hide();
    }
  }

  function syncSelected($root) {
    $root.find('.wd-swatches[data-wcf-select], .wd-swatches[data-webino-order-config]').each(function () {
      var $wrap = $(this);
      var $select = $wrap.find('select');
      if (!$select.length) {
        return;
      }
      var selected = String($select.val() || '');
      $wrap.find('.wd-swatch').each(function () {
        var isSelected = valuesMatch(this.getAttribute('data-value') || '', selected) && selected !== '';
        this.classList.toggle('is-selected', isSelected);
        this.classList.remove('is-disabled');
        this.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        this.setAttribute('aria-disabled', 'false');
      });
      var $field = $wrap.closest('.wcf-field, tr.wcf-field');
      var label = selectedOptionLabel($select);
      syncFieldLabel($field, label);
      if (selected) {
        $field.addClass('is-valid');
      }
    });

    $root.find('select.wcf-plain-select').each(function () {
      var $select = $(this);
      var $field = $select.closest('.wcf-field, tr.wcf-field');
      var label = selectedOptionLabel($select);
      syncFieldLabel($field, label);
      if ($select.val()) {
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

    $root.on('click.wcf', '.wd-swatches[data-wcf-select] .wd-swatch, .wd-swatches[data-webino-order-config] .wd-swatch', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var $wrap = $(this).closest('.wd-swatches[data-wcf-select], .wd-swatches[data-webino-order-config]');
      var $select = $wrap.find('select').first();
      var value = this.getAttribute('data-value') || '';
      if (!$select.length) {
        return;
      }
      $select.val(value).trigger('change');
      syncSelected($root);
      $root.removeClass('is-invalid');
    });

    $root.on(
      'change.wcf',
      'select.wcf-plain-select, .wd-swatches[data-wcf-select] select, .wd-swatches[data-webino-order-config] select',
      function () {
        syncSelected($root);
      }
    );

    syncSelected($root);
  }

  function bindForm($form) {
    if (!$form.length) {
      return;
    }
    $form.find('.wcf-order-config-fields, .webino-order-configs, .wcf-order-configs').each(function () {
      bindRoot($(this));
    });
  }

  function rowNodes($block) {
    var $rows = $block.find('tr.wcf-field');
    if ($rows.length) {
      return $rows;
    }
    return $block.children('.wcf-field');
  }

  function convertRowToDiv($row) {
    var $th = $row.find('th.label, .label').first();
    var $td = $row.find('td.value, .value').first();
    var labelHtml = $th.html() || '';
    var valueHtml = $td.html() || '';
    var fieldId = $row.attr('data-wcf-field') || '';
    var classes = ($row.attr('class') || '').replace(/\bwcf-field\b/, '').trim();
    var $div = $('<div class="wcf-field"></div>');
    if (classes) {
      $div.addClass(classes);
    }
    if (fieldId) {
      $div.attr('data-wcf-field', fieldId);
    }
    $div.append($('<div class="label"></div>').html(labelHtml));
    $div.append($('<div class="value wcf-field-value"></div>').html(valueHtml));
    return $div;
  }

  function findVariationsAnchor($form) {
    var $table = $form.find('table.variations').first();
    if ($table.length) {
      return $table;
    }
    return $form.find('.variations').first();
  }

  function placeAfterVariations($form, $node) {
    var $anchor = findVariationsAnchor($form);
    if ($anchor.length) {
      $node.insertAfter($anchor);
      return;
    }
    var $button = $form.find('.single_add_to_cart_button, button[type="submit"]').first();
    if ($button.length) {
      var $wrap = $button.closest('.woocommerce-variation-add-to-cart, .quantity, p');
      $node.insertBefore($wrap.length ? $wrap : $button);
      return;
    }
    $form.append($node);
  }

  function injectOrderConfigs() {
    $('table.webino-order-configs, .webino-order-configs, .wcf-order-configs').each(function () {
      var $block = $(this);
      if ($block.data('wcfInjected')) {
        return;
      }

      // Already a placed standalone block (outside WC .variations).
      if ($block.hasClass('wcf-order-config-fields') || $block.closest('.wcf-order-config-fields').length) {
        bindRoot($block.closest('.wcf-order-config-fields').length ? $block.closest('.wcf-order-config-fields') : $block);
        $block.data('wcfInjected', true);
        return;
      }

      var $rows = rowNodes($block);
      if (!$rows.length) {
        $block.addClass('wcf-order-config-fields wcf-fulfillment');
        bindRoot($block);
        $block.data('wcfInjected', true);
        return;
      }

      var $form = $block.closest('form.variations_form, form.cart');
      if (!$form.length) {
        $form = $('form.variations_form, form.cart').first();
      }

      // Never inject into WC variation table/div — keep a sibling block after it.
      var $configWrap = $('<div class="wcf-order-config-fields wcf-fulfillment"></div>');
      $rows.each(function () {
        var $node = $(this);
        if ($node.is('tr')) {
          $node = convertRowToDiv($node);
        }
        $configWrap.append($node);
      });

      if ($form.length) {
        placeAfterVariations($form, $configWrap);
      } else {
        $block.after($configWrap);
      }
      $block.remove();
      bindRoot($configWrap);
      $block.data('wcfInjected', true);
    });
  }

  function enableAll() {
    $('.wcf-order-config-fields .wd-swatch, .webino-order-configs .wd-swatch, .wd-swatches[data-webino-order-config] .wd-swatch')
      .removeClass('is-disabled')
      .attr('aria-disabled', 'false');
  }

  function init() {
    injectOrderConfigs();
    enableAll();
    $('.wcf-order-config-fields, .webino-order-configs, .wcf-order-configs').each(function () {
      bindRoot($(this));
    });
    $('form.variations_form, form.cart').each(function () {
      bindForm($(this));
    });
  }

  window.webinoOrderConfigsInit = init;

  $(document).ready(init);
  $(window).on('load', init);
  $(document).on('wc_variation_form', 'form.variations_form', function () {
    init();
    enableAll();
  });
  $(window).on('elementor/frontend/init', init);

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.classList || !form.classList.contains('cart')) {
      return;
    }
    var fields = form.querySelectorAll('.wcf-order-config-fields .wcf-field');
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
      var root = form.querySelector('.wcf-order-config-fields') || form.querySelector('.wcf-fulfillment') || form;
      if (root && root.classList) {
        root.classList.add('is-invalid');
      }
    }
  });
})(jQuery);
