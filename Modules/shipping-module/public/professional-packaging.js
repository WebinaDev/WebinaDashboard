/**
 * Professional packaging add-on — toggle sync for cart / checkout.
 */
(function ($) {
  if (!$ || !window.webinoProfessionalPackaging) {
    return;
  }

  var cfg = window.webinoProfessionalPackaging;
  var pending = null;

  function refreshTotals() {
    if ($('form.checkout').length) {
      $(document.body).trigger('update_checkout');
      return;
    }
    if ($('button[name="update_cart"]').length) {
      $('[name="update_cart"]').prop('disabled', false).trigger('click');
      return;
    }
    $(document.body).trigger('wc_update_cart');
  }

  function sync(checked) {
    if (pending && pending.abort) {
      try {
        pending.abort();
      } catch (e) {}
    }
    pending = $.post(cfg.ajaxUrl, {
      action: cfg.action,
      nonce: cfg.nonce,
      selected: checked ? '1' : '0',
    });
    pending.always(function () {
      pending = null;
      refreshTotals();
    });
  }

  $(document).on('change', '.webino-prof-pack__input', function () {
    var checked = !!this.checked;
    $('.webino-prof-pack__input').prop('checked', checked);
    sync(checked);
  });
})(window.jQuery);
