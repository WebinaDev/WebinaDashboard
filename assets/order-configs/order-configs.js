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
      var $field = $wrap.closest('.wcf-field, tr.wcf-field, [class*="variation-pa_"]');
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

    $root.on(
      'change.wcf',
      'select.wcf-plain-select, .wd-swatch-select-hidden select, .wd-swatches[data-wcf-select] select',
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
    bindRoot($form);
    if ($form.data('wcfFormBound')) {
      return;
    }
    $form.data('wcfFormBound', true);
  }

  function rowNodes($block) {
    var $rows = $block.find('tr.wcf-field');
    if ($rows.length) {
      return $rows;
    }
    return $block.children('.wcf-field, [class*="variation-pa_"]');
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
    $div.append($('<div class="value"></div>').html(valueHtml));
    return $div;
  }

  function injectOrderConfigs() {
    $('table.webino-order-configs, .wcf-order-configs').each(function () {
      var $block = $(this);
      if ($block.data('wcfInjected')) {
        return;
      }

      var $rows = rowNodes($block);
      if (!$rows.length) {
        $block.data('wcfInjected', true);
        return;
      }

      var $form = $block.closest('form.variations_form, form.cart');
      if (!$form.length) {
        $form = $('form.variations_form, form.cart').first();
      }

      var $tbody = $form.find('table.variations tbody').first();
      var $blockTable = $block.is('table') ? $block : $block.find('table.variations').first();

      if ($tbody.length) {
        if ($blockTable.length && $blockTable.get(0) === $tbody.closest('table').get(0)) {
          $tbody.addClass('wcf-fulfillment');
          bindForm($form);
          $block.data('wcfInjected', true);
          return;
        }

        $tbody.addClass('wcf-fulfillment');
        $rows.appendTo($tbody);
        $block.remove();
        bindForm($form);
        $block.data('wcfInjected', true);
        return;
      }

      var $divVariations = $form.find('.variations').not('table').first();
      if ($divVariations.length) {
        $divVariations.addClass('wcf-fulfillment');
        $rows.each(function () {
          var $node = $(this);
          if ($node.is('tr')) {
            $node = convertRowToDiv($node);
          }
          $divVariations.append($node);
        });
        $block.remove();
        bindRoot($divVariations);
        bindForm($form);
        $block.data('wcfInjected', true);
        return;
      }

      if ($form.length) {
        $block.addClass('wcf-fulfillment wcf-fulfillment--standalone');
        bindForm($form);
      } else {
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
    $('form.variations_form, form.cart').each(function () {
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
    var fields = form.querySelectorAll('.wcf-field, tr.wcf-field');
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
