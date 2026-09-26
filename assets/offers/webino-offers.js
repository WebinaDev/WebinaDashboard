/**
 * Webino storefront offers: gift popup (24h), offer chips, near-threshold progress.
 */
(function () {
  'use strict'

  var cfg = window.webinoOffers || {}
  var STORAGE_KEY = 'webino_offers_popup_at'
  var DAY_MS = 24 * 60 * 60 * 1000

  function fmt(n) {
    try {
      return new Intl.NumberFormat('fa-IR').format(Math.round(Number(n) || 0))
    } catch (e) {
      return String(Math.round(Number(n) || 0))
    }
  }

  function shouldShowPopup() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return true
      var t = parseInt(raw, 10)
      if (!t || Number.isNaN(t)) return true
      return Date.now() - t >= DAY_MS
    } catch (e) {
      return true
    }
  }

  function markPopupShown() {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    } catch (e) {}
  }

  function copyText(text, btn, i18n) {
    function done() {
      if (btn) {
        var prev = btn.textContent
        btn.textContent = i18n.copied || 'کپی شد'
        setTimeout(function () {
          btn.textContent = prev
        }, 1500)
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text)
        done()
      })
    } else {
      fallbackCopy(text)
      done()
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
    } catch (e) {}
    document.body.removeChild(ta)
  }

  function ensureRoot() {
    var el = document.getElementById('webino-offers-root')
    if (el) return el
    el = document.createElement('div')
    el.id = 'webino-offers-root'
    el.className = 'webino-offers-root'
    document.body.appendChild(el)
    return el
  }

  function giftHeadline(gift, symbol) {
    if (gift.gift_copy) return gift.gift_copy
    var amt = gift.amount
    if (gift.free_shipping) return 'ارسال رایگان برای خریدت'
    if (gift.type === 'percent') return fmt(amt) + '٪ تخفیف برای خریدت'
    return 'برای خریدت ' + fmt(amt) + ' ' + (symbol || 'تومان') + ' هدیه داری'
  }

  function giftHint(gift, symbol) {
    if (gift.condition_label) return gift.condition_label
    if (gift.progress && gift.progress.kind === 'amount') {
      return 'فقط کافیه سبدت به ' + fmt(gift.progress.target) + ' ' + (symbol || 'تومان') + ' برسه'
    }
    return (cfg.i18n && cfg.i18n.giftHint) || ''
  }

  function showPopup(gift, payload) {
    if (!gift || !shouldShowPopup()) return
    var i18n = cfg.i18n || {}
    var root = ensureRoot()
    var backdrop = document.createElement('div')
    backdrop.className = 'webino-offers-popup-backdrop'
    backdrop.setAttribute('role', 'dialog')
    backdrop.innerHTML =
      '<div class="webino-offers-popup">' +
      '<div class="webino-offers-popup__icon" aria-hidden="true">🎁</div>' +
      '<p class="webino-offers-popup__title"></p>' +
      '<p class="webino-offers-popup__hint"></p>' +
      '<div class="webino-offers-popup__code"><code></code>' +
      '<button type="button" class="webino-offers-btn webino-offers-btn--ghost wo-copy"></button></div>' +
      '<div class="webino-offers-popup__actions">' +
      '<a class="webino-offers-btn webino-offers-btn--primary wo-cta" href="#"></a>' +
      '<button type="button" class="webino-offers-btn webino-offers-btn--ghost wo-close"></button>' +
      '</div></div>'

    var titleEl = backdrop.querySelector('.webino-offers-popup__title')
    var hintEl = backdrop.querySelector('.webino-offers-popup__hint')
    var codeEl = backdrop.querySelector('code')
    var copyBtn = backdrop.querySelector('.wo-copy')
    var cta = backdrop.querySelector('.wo-cta')
    var closeBtn = backdrop.querySelector('.wo-close')

    titleEl.textContent = giftHeadline(gift, payload.currency_symbol)
    hintEl.textContent = giftHint(gift, payload.currency_symbol)
    codeEl.textContent = gift.code || ''
    copyBtn.textContent = i18n.copy || 'کپی کد'
    cta.textContent = i18n.cta || 'پرفروش‌ترین‌ها'
    cta.href = payload.shop_url || '/'
    closeBtn.textContent = i18n.close || 'بستن'

    function dismiss() {
      markPopupShown()
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop)
    }

    copyBtn.addEventListener('click', function () {
      copyText(gift.code || '', copyBtn, i18n)
    })
    closeBtn.addEventListener('click', dismiss)
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) dismiss()
    })

    root.appendChild(backdrop)
  }

  function renderChips(offers) {
    var hosts = document.querySelectorAll(
      '.summary .price, .woocommerce-Price-amount, .cart_totals, .woocommerce-cart-form, .product_meta',
    )
    if (!hosts.length || !offers || !offers.length) return
    var host = hosts[0]
    var wrap = document.createElement('div')
    wrap.className = 'webino-offers-chips'
    offers.slice(0, 4).forEach(function (o, i) {
      var chip = document.createElement('span')
      chip.className = 'webino-offers-chip'
      chip.style.animationDelay = i * 0.05 + 's'
      chip.textContent = o.title || o.code
      wrap.appendChild(chip)
    })
    host.parentNode.insertBefore(wrap, host.nextSibling)
  }

  function renderProgress(near, payload) {
    if (!near || !near.progress) return
    var p = near.progress
    var ratio = Math.max(0, Math.min(1, Number(p.ratio) || 0))
    if (ratio < 0.8 || ratio >= 1) return

    var root = ensureRoot()
    var existing = root.querySelector('.webino-offers-progress')
    if (existing) existing.parentNode.removeChild(existing)

    var el = document.createElement('div')
    el.className = 'webino-offers-progress'
    var remLabel = ''
    if (p.kind === 'amount') {
      remLabel = fmt(p.remaining) + ' ' + (payload.currency_symbol || 'تومان') + ' دیگر'
    } else if (p.kind === 'items') {
      remLabel = fmt(p.remaining) + ' قلم دیگر'
    } else {
      remLabel = (cfg.i18n && cfg.i18n.remaining) || ''
    }
    el.innerHTML =
      '<p class="webino-offers-progress__title"></p>' +
      '<p class="webino-offers-progress__meta"></p>' +
      '<div class="webino-offers-progress__track"><div class="webino-offers-progress__fill"></div></div>'
    el.querySelector('.webino-offers-progress__title').textContent = near.title || near.code
    el.querySelector('.webino-offers-progress__meta').textContent = remLabel
    el.querySelector('.webino-offers-progress__fill').style.width = Math.round(ratio * 100) + '%'
    root.appendChild(el)
  }

  function fetchOffers() {
    if (!cfg.restUrl) return
    fetch(cfg.restUrl, {
      credentials: 'same-origin',
      headers: cfg.nonce ? { 'X-WP-Nonce': cfg.nonce } : {},
    })
      .then(function (r) {
        return r.json()
      })
      .then(function (data) {
        if (!data || !data.offers) return
        showPopup(data.gift, data)
        renderChips(data.offers.filter(function (o) { return !o.eligible }))
        renderProgress(data.near, data)
      })
      .catch(function () {})
  }

  function boot() {
    fetchOffers()
    document.body.addEventListener('added_to_cart', fetchOffers)
    document.body.addEventListener('removed_from_cart', fetchOffers)
    document.body.addEventListener('updated_cart_totals', fetchOffers)
    document.body.addEventListener('updated_checkout', fetchOffers)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
