/**
 * Webino storefront coupons:
 *  - gift popup (24h) + offer chips (product page)
 *  - floating "next coupon" progress widget (bottom-left, live updates)
 *  - coupon chooser (classic cart/checkout is server-rendered; block cart/checkout is mounted here)
 * Server enforces "one coupon per order"; this file only renders and calls endpoints.
 */
(function () {
  'use strict'

  var cfg = window.webinoOffers || {}
  var i18n = cfg.i18n || {}
  var settings = cfg.settings || {}
  var STORAGE_KEY = 'webino_offers_popup_at'
  var DISMISS_KEY = 'webino_cprog_dismissed'
  var COLLAPSE_KEY = 'webino_cprog_collapsed'
  var DAY_MS = 24 * 60 * 60 * 1000
  var lastState = null
  var timer = null
  var inflight = null
  var queued = false
  var popupDone = false

  function $(sel, root) {
    return (root || document).querySelector(sel)
  }

  function endpoint(action) {
    var base = String(cfg.ajaxUrl || '')
    if (!base) return ''
    return base.replace('%%endpoint%%', encodeURIComponent(action))
  }

  function fmtNum(n) {
    try {
      return new Intl.NumberFormat(cfg.isRtl ? 'fa-IR' : undefined).format(Math.round(Number(n) || 0))
    } catch (e) {
      return String(Math.round(Number(n) || 0))
    }
  }

  function sprintf1(tpl, val) {
    return String(tpl || '%s').replace('%s', val)
  }

  function ssGet(k) {
    try {
      return window.sessionStorage.getItem(k)
    } catch (e) {
      return null
    }
  }

  function ssSet(k, v) {
    try {
      if (v === null) window.sessionStorage.removeItem(k)
      else window.sessionStorage.setItem(k, v)
    } catch (e) {}
  }

  function cartHasItemsCookie() {
    return /(?:^|;\s*)woocommerce_items_in_cart=1/.test(document.cookie || '')
  }

  function hasBlockCart() {
    return !!document.querySelector('.wp-block-woocommerce-cart, .wp-block-woocommerce-checkout')
  }

  /* ------------------------------------------------------------------ popup */

  function shouldShowPopup() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return true
      var t = parseInt(raw, 10)
      if (!t || isNaN(t)) return true
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

  function fallbackCopy(text) {
    var ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
    } catch (e) {}
    document.body.removeChild(ta)
  }

  function copyText(text, btn) {
    function done() {
      if (!btn) return
      var prev = btn.textContent
      btn.textContent = i18n.copied || 'Copied'
      setTimeout(function () {
        btn.textContent = prev
      }, 1500)
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

  function ensureRoot() {
    var el = document.getElementById('webino-offers-root')
    if (el) return el
    el = document.createElement('div')
    el.id = 'webino-offers-root'
    el.className = 'webino-offers-root'
    el.setAttribute('dir', cfg.isRtl ? 'rtl' : 'ltr')
    document.body.appendChild(el)
    return el
  }

  function showPopup(gift, payload) {
    if (popupDone || !cfg.popup || !gift || !shouldShowPopup()) return
    popupDone = true
    var root = ensureRoot()
    var backdrop = document.createElement('div')
    backdrop.className = 'webino-offers-popup-backdrop'
    backdrop.setAttribute('role', 'dialog')
    backdrop.setAttribute('aria-modal', 'true')
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

    $('.webino-offers-popup__title', backdrop).textContent = gift.gift_copy || gift.title || i18n.giftTitle || ''
    $('.webino-offers-popup__hint', backdrop).textContent = gift.condition_label || i18n.giftHint || ''
    var codeEl = $('code', backdrop)
    var copyBtn = $('.wo-copy', backdrop)
    if (gift.code) {
      codeEl.textContent = gift.code
      copyBtn.textContent = i18n.copy || 'Copy'
    } else {
      $('.webino-offers-popup__code', backdrop).style.display = 'none'
    }
    var cta = $('.wo-cta', backdrop)
    cta.textContent = i18n.cta || 'Shop'
    cta.href = (payload && payload.shop_url) || '/'
    var closeBtn = $('.wo-close', backdrop)
    closeBtn.textContent = i18n.close || 'Close'

    function dismiss() {
      markPopupShown()
      document.removeEventListener('keydown', onKey)
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop)
    }
    function onKey(e) {
      if (e.key === 'Escape') dismiss()
    }
    copyBtn.addEventListener('click', function () {
      copyText(gift.code || '', copyBtn)
    })
    closeBtn.addEventListener('click', dismiss)
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) dismiss()
    })
    document.addEventListener('keydown', onKey)
    root.appendChild(backdrop)
  }

  /* ------------------------------------------------------------------ chips */

  function renderChips(offers) {
    if (!cfg.chips) return
    var host = document.querySelector('.single-product .summary .price, .product .summary .price')
    var old = document.querySelector('.webino-offers-chips')
    if (old && old.parentNode) old.parentNode.removeChild(old)
    if (!host || !host.parentNode || !offers || !offers.length) return
    var wrap = document.createElement('div')
    wrap.className = 'webino-offers-chips'
    offers.slice(0, 4).forEach(function (o, i) {
      var chip = document.createElement('span')
      chip.className = 'webino-offers-chip'
      chip.style.animationDelay = i * 0.05 + 's'
      chip.textContent = o.title || ''
      if (chip.textContent) wrap.appendChild(chip)
    })
    if (wrap.childNodes.length) host.parentNode.insertBefore(wrap, host.nextSibling)
  }

  /* ------------------------------------------------------------------ toast */

  function toast(text, type) {
    if (!text) return
    var root = ensureRoot()
    var el = document.createElement('div')
    el.className = 'webino-coupon-toast webino-coupon-toast--' + (type || 'notice')
    el.setAttribute('role', type === 'error' ? 'alert' : 'status')
    el.textContent = text
    // Stack above the floating progress widget so the two never overlap.
    var widget = document.getElementById('webino-coupon-progress')
    if (widget && widget.getBoundingClientRect) {
      var rect = widget.getBoundingClientRect()
      if (rect.height > 0) {
        el.style.bottom = Math.max(16, Math.round(window.innerHeight - rect.top + 8)) + 'px'
      }
    }
    root.appendChild(el)
    setTimeout(function () {
      el.classList.add('is-leaving')
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el)
      }, 400)
    }, 4500)
  }

  /* --------------------------------------------------------- progress widget */

  function removeWidget() {
    var el = document.getElementById('webino-coupon-progress')
    if (el && el.parentNode) el.parentNode.removeChild(el)
  }

  function renderWidget(state) {
    if (!settings.progress_widget || !state || state.empty || !state.next) {
      removeWidget()
      return
    }
    var n = state.next
    if (ssGet(DISMISS_KEY) === String(n.id)) {
      removeWidget()
      return
    }
    var ratio = Math.max(0, Math.min(1, Number(n.ratio) || 0))
    var pct = Math.round(ratio * 100)
    var root = ensureRoot()
    var el = document.getElementById('webino-coupon-progress')
    if (!el) {
      el = document.createElement('section')
      el.id = 'webino-coupon-progress'
      el.className = 'webino-cprog'
      el.setAttribute('aria-live', 'polite')
      el.innerHTML =
        '<button type="button" class="webino-cprog__pill" aria-expanded="false">' +
        '<span class="webino-cprog__pill-icon" aria-hidden="true">🎁</span>' +
        '<span class="webino-cprog__pill-bar" aria-hidden="true"><span class="webino-cprog__pill-fill"></span></span>' +
        '<span class="webino-cprog__pill-pct"></span></button>' +
        '<div class="webino-cprog__card">' +
        '<div class="webino-cprog__head">' +
        '<span class="webino-cprog__eyebrow"></span>' +
        '<span class="webino-cprog__actions">' +
        '<button type="button" class="webino-cprog__min" aria-label=""><span aria-hidden="true">–</span></button>' +
        '<button type="button" class="webino-cprog__close" aria-label=""><span aria-hidden="true">×</span></button>' +
        '</span></div>' +
        '<p class="webino-cprog__title"></p>' +
        '<p class="webino-cprog__cta"></p>' +
        '<div class="webino-cprog__track" role="progressbar" aria-valuemin="0"><div class="webino-cprog__fill"></div></div>' +
        '<div class="webino-cprog__range"><span class="webino-cprog__cur"></span><span class="webino-cprog__pct"></span><span class="webino-cprog__target"></span></div>' +
        '</div>'
      root.appendChild(el)
      $('.webino-cprog__close', el).addEventListener('click', function () {
        if (lastState && lastState.next) ssSet(DISMISS_KEY, String(lastState.next.id))
        removeWidget()
      })
      $('.webino-cprog__min', el).addEventListener('click', function () {
        ssSet(COLLAPSE_KEY, '1')
        setCollapsed(el, true)
      })
      $('.webino-cprog__pill', el).addEventListener('click', function () {
        ssSet(COLLAPSE_KEY, '0')
        setCollapsed(el, false)
      })
      var stored = ssGet(COLLAPSE_KEY)
      var small = window.matchMedia && window.matchMedia('(max-width: 640px)').matches
      // Cart / checkout: start as the compact pill so it never covers the totals or the checkout button
      // (RTL themes put the totals column on the left). The customer can still expand it.
      var compactPage = !!(cfg.isCart || cfg.isCheckout)
      setCollapsed(el, compactPage ? true : stored === null ? small : stored === '1')
    }
    el.setAttribute('dir', cfg.isRtl ? 'rtl' : 'ltr')
    $('.webino-cprog__eyebrow', el).textContent = i18n.nextCoupon || 'Your next coupon'
    $('.webino-cprog__title', el).textContent = n.title || ''
    $('.webino-cprog__cta', el).textContent = n.cta || ''
    $('.webino-cprog__min', el).setAttribute('aria-label', i18n.hide || 'Hide')
    $('.webino-cprog__min', el).setAttribute('title', i18n.hide || 'Hide')
    $('.webino-cprog__close', el).setAttribute('aria-label', i18n.close || 'Close')
    $('.webino-cprog__close', el).setAttribute('title', i18n.close || 'Close')
    $('.webino-cprog__pill', el).setAttribute('aria-label', (i18n.show || '') + ' — ' + (n.message || ''))
    $('.webino-cprog__pill-pct', el).textContent = fmtNum(pct) + (cfg.isRtl ? '٪' : '%')
    $('.webino-cprog__pill-fill', el).style.width = pct + '%'
    var track = $('.webino-cprog__track', el)
    track.setAttribute('aria-valuemax', String(n.target))
    track.setAttribute('aria-valuenow', String(Math.min(Number(n.current) || 0, Number(n.target) || 0)))
    track.setAttribute('aria-valuetext', (n.current_text || '') + ' / ' + (n.target_text || ''))
    track.setAttribute('aria-label', n.message || '')
    $('.webino-cprog__fill', el).style.width = pct + '%'
    $('.webino-cprog__cur', el).textContent = n.current_text || ''
    $('.webino-cprog__target', el).textContent = n.target_text || ''
    $('.webino-cprog__pct', el).textContent = fmtNum(pct) + (cfg.isRtl ? '٪' : '%')
  }

  function setCollapsed(el, collapsed) {
    el.classList.toggle('is-collapsed', !!collapsed)
    var pill = $('.webino-cprog__pill', el)
    if (pill) pill.setAttribute('aria-expanded', collapsed ? 'false' : 'true')
  }

  /* ------------------------------------------------------ block cart chooser */

  function blockStore() {
    try {
      if (!window.wp || !wp.data || !wp.data.select) return null
      var sel = wp.data.select('wc/store/cart')
      var disp = wp.data.dispatch('wc/store/cart')
      if (!sel || !disp || typeof sel.getCartData !== 'function') return null
      return { select: sel, dispatch: disp }
    } catch (e) {
      return null
    }
  }

  function chooserMarkup(state) {
    var wrap = document.createElement('div')
    wrap.className = 'webino-coupon-chooser webino-coupon-chooser--block'
    wrap.setAttribute('role', 'region')
    wrap.setAttribute('aria-label', i18n.chooserTitle || '')
    var title = document.createElement('p')
    title.className = 'webino-coupon-chooser__title'
    title.textContent = i18n.chooserTitle || ''
    var hint = document.createElement('p')
    hint.className = 'webino-coupon-chooser__hint'
    hint.textContent = i18n.chooserHint || ''
    var list = document.createElement('ul')
    list.className = 'webino-coupon-chooser__list'
    state.eligible.forEach(function (row) {
      var li = document.createElement('li')
      li.className = 'webino-coupon-chooser__item' + (row.applied ? ' is-applied' : '')
      var text = document.createElement('div')
      text.className = 'webino-coupon-chooser__text'
      var name = document.createElement('strong')
      name.className = 'webino-coupon-chooser__name'
      name.textContent = row.title
      text.appendChild(name)
      if (row.benefit && row.benefit !== row.title) {
        var b = document.createElement('span')
        b.className = 'webino-coupon-chooser__benefit'
        b.textContent = row.benefit
        text.appendChild(b)
      }
      if (row.saving_text) {
        var s = document.createElement('span')
        s.className = 'webino-coupon-chooser__saving'
        s.textContent = sprintf1(i18n.youSave, row.saving_text)
        text.appendChild(s)
      }
      var btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'webino-coupon-chooser__btn' + (row.applied ? ' is-applied' : '')
      if (row.applied) {
        btn.setAttribute('data-webino-coupon-remove', '1')
        btn.setAttribute('data-webino-coupon-code', row.code)
        btn.textContent = i18n.appliedRm || 'Remove'
      } else {
        btn.setAttribute('data-webino-coupon-id', String(row.id))
        btn.setAttribute('data-webino-coupon-code', row.code)
        btn.textContent = state.applied && state.applied.length ? i18n.useInstead || 'Use' : i18n.apply || 'Apply'
      }
      li.appendChild(text)
      li.appendChild(btn)
      list.appendChild(li)
    })
    var msg = document.createElement('p')
    msg.className = 'webino-coupon-chooser__msg'
    msg.setAttribute('aria-live', 'polite')
    wrap.appendChild(title)
    wrap.appendChild(hint)
    wrap.appendChild(list)
    wrap.appendChild(msg)
    return wrap
  }

  function renderBlockChooser(state) {
    if (!hasBlockCart()) return
    var old = document.querySelector('.webino-coupon-chooser--block')
    if (!settings.cart_chooser || !state || state.empty || !state.eligible || !state.eligible.length) {
      if (old && old.parentNode) old.parentNode.removeChild(old)
      return
    }
    var anchor =
      document.querySelector('.wp-block-woocommerce-cart-order-summary-coupon-form-block') ||
      document.querySelector('.wp-block-woocommerce-checkout-order-summary-coupon-form-block') ||
      document.querySelector('.wc-block-components-totals-coupon')
    var sidebar =
      document.querySelector('.wc-block-cart__sidebar') ||
      document.querySelector('.wc-block-checkout__sidebar') ||
      document.querySelector('.wp-block-woocommerce-cart, .wp-block-woocommerce-checkout')
    var node = chooserMarkup(state)
    if (old && old.parentNode) {
      old.parentNode.replaceChild(node, old)
      return
    }
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(node, anchor.nextSibling)
    else if (sidebar) sidebar.insertBefore(node, sidebar.firstChild)
  }

  /* ------------------------------------------------------------- selection */

  function setBusy(chooser, busy) {
    if (!chooser) return
    chooser.classList.toggle('is-busy', !!busy)
    Array.prototype.forEach.call(chooser.querySelectorAll('button'), function (b) {
      b.disabled = !!busy
    })
  }

  function chooserMessage(chooser, text, type) {
    var el = chooser && chooser.querySelector('.webino-coupon-chooser__msg')
    if (el) {
      el.textContent = text || ''
      el.className = 'webino-coupon-chooser__msg' + (type === 'error' ? ' is-error' : '')
    }
    if (text) toast(text, type)
  }

  function afterChange() {
    var jq = window.jQuery
    if (jq) {
      if (document.querySelector('form.woocommerce-cart-form')) {
        jq(document).trigger('wc_update_cart')
      } else if (document.querySelector('form.checkout')) {
        jq(document.body).trigger('update_checkout')
      }
      jq(document.body).trigger('wc_fragment_refresh')
    }
    schedule(150)
  }

  function postSelect(data) {
    var nonce = (lastState && lastState.nonce) || ''
    var body = new URLSearchParams()
    body.set('nonce', nonce)
    Object.keys(data).forEach(function (k) {
      body.set(k, data[k])
    })
    return fetch(endpoint(cfg.selectAction || 'webino_coupon_select'), {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: body.toString(),
    })
      .then(function (r) {
        return r.json().catch(function () {
          return { success: false, data: {} }
        })
      })
      .then(function (res) {
        if (res && res.data && res.data.nonce && lastState) lastState.nonce = res.data.nonce
        return res
      })
  }

  function onChooserClick(e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-webino-coupon-id], [data-webino-coupon-remove]') : null
    if (!btn) return
    var chooser = btn.closest('.webino-coupon-chooser')
    if (!chooser) return
    e.preventDefault()
    var remove = btn.hasAttribute('data-webino-coupon-remove')
    var id = btn.getAttribute('data-webino-coupon-id')
    var code = btn.getAttribute('data-webino-coupon-code') || ''
    setBusy(chooser, true)

    var store = chooser.classList.contains('webino-coupon-chooser--block') ? blockStore() : null
    if (store && code && typeof store.dispatch.applyCoupon === 'function') {
      // Store API: server-side single-coupon rule replaces the previous coupon in the same request.
      var p = remove ? store.dispatch.removeCoupon(code) : store.dispatch.applyCoupon(code)
      Promise.resolve(p)
        .then(function () {
          schedule(50)
        })
        .catch(function (err) {
          chooserMessage(chooser, (err && err.message) || i18n.error, 'error')
        })
        .then(function () {
          setBusy(chooser, false)
        })
      return
    }

    var payload = remove ? { remove: '1' } : { coupon_id: id }
    var run = function (retry) {
      return postSelect(payload).then(function (res) {
        if (res && res.success) {
          if (res.data) applyState(res.data)
          chooserMessage(chooser, res.data && res.data.message, 'success')
          afterChange()
          return
        }
        if (!retry && res && res.data && res.data.nonce) return run(true)
        chooserMessage(chooser, (res && res.data && res.data.message) || i18n.error, 'error')
      })
    }
    run(false)
      .catch(function () {
        chooserMessage(chooser, i18n.error, 'error')
      })
      .then(function () {
        setBusy(chooser, false)
      })
  }

  /* --------------------------------------------------------------- state */

  function applyState(state) {
    if (!state) return
    lastState = state
    if (state.messages && state.messages.length) {
      state.messages.forEach(function (m) {
        toast(m.text, m.type)
      })
      state.messages = []
    }
    renderWidget(state)
    renderBlockChooser(state)
    var offers = state.offers
    if (offers && offers.offers) {
      showPopup(offers.gift, offers)
      renderChips(
        offers.offers.filter(function (o) {
          return !o.eligible
        }),
      )
    }
  }

  function fetchState() {
    var url = endpoint(cfg.stateAction || 'webino_coupons_state')
    if (!url) return
    if (inflight) {
      queued = true
      return
    }
    inflight = fetch(url + (url.indexOf('?') >= 0 ? '&' : '?') + '_=' + Date.now(), {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
      .then(function (r) {
        return r.json()
      })
      .then(function (res) {
        if (res && res.success && res.data) applyState(res.data)
      })
      .catch(function () {})
      .then(function () {
        inflight = null
        if (queued) {
          queued = false
          schedule(100)
        }
      })
  }

  function schedule(delay) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(fetchState, typeof delay === 'number' ? delay : 350)
  }

  function watchBlockStore() {
    var store = blockStore()
    if (!store || !wp.data.subscribe) return false
    var last = ''
    wp.data.subscribe(function () {
      var key = ''
      try {
        var data = store.select.getCartData()
        var totals = store.select.getCartTotals ? store.select.getCartTotals() : {}
        key = JSON.stringify([
          data && data.itemsCount,
          totals && totals.total_items,
          totals && totals.total_discount,
          ((data && data.coupons) || []).map(function (c) {
            return c.code
          }),
        ])
      } catch (e) {
        return
      }
      if (key !== last) {
        var first = last === ''
        last = key
        if (!first) schedule()
      }
    })
    return true
  }

  function boot() {
    var events =
      'added_to_cart removed_from_cart updated_cart_totals updated_wc_div wc_fragments_refreshed ' +
      'updated_checkout applied_coupon removed_coupon wc_cart_emptied updated_shipping_method'
    if (window.jQuery) {
      window.jQuery(document.body).on(events, function () {
        schedule()
      })
    }
    ;['wc-blocks_added_to_cart', 'wc-blocks_removed_from_cart'].forEach(function (ev) {
      document.body.addEventListener(ev, function () {
        schedule()
      })
    })
    document.addEventListener('click', onChooserClick)

    if (!watchBlockStore() && hasBlockCart()) {
      setTimeout(watchBlockStore, 1500)
    }

    // Skip the request entirely when the cart is empty (cookie set by WooCommerce), except on cart/checkout.
    if (cartHasItemsCookie() || cfg.isCart || cfg.isCheckout || (cfg.popup && !cartHasItemsCookie() && shouldShowPopup())) {
      schedule(0)
    }

    if (hasBlockCart() && window.MutationObserver) {
      var mo = new MutationObserver(function () {
        if (lastState && settings.cart_chooser && lastState.eligible && lastState.eligible.length && !document.querySelector('.webino-coupon-chooser--block')) {
          renderBlockChooser(lastState)
        }
      })
      mo.observe(document.body, { childList: true, subtree: true })
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
