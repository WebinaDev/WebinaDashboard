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

  var FA = '۰۱۲۳۴۵۶۷۸۹'

  function digits(str) {
    str = String(str == null ? '' : str)
    if (!cfg.faDigits) return str
    return str.replace(/[0-9]/g, function (d) {
      return FA.charAt(+d)
    })
  }

  function pctText(pct) {
    pct = Math.round(Number(pct) || 0)
    return cfg.faDigits ? digits(pct) + '٪' : pct + '%'
  }

  function sprintf1(tpl, val) {
    return String(tpl || '%s').replace('%s', val)
  }

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    })
  }

  var money = cfg.money || {}
  var DIG = '0-9\u06F0-\u06F9\u0660-\u0669'
  var MONEY_RE = new RegExp('([' + DIG + '](?:[' + DIG + ',.\u066B\u066C]*[' + DIG + '])?)(?:\u00A0|&nbsp;|\\s)*(?:تومان|Toman|IRT)', 'g')

  function tomanMarkup(num) {
    return (
      '<span class="webino-money"><span class="webino-money__n">' + num + '</span>' +
      '<span class="webino-toman" aria-hidden="true"></span><span class="webino-sr">' + esc(money.label || 'تومان') + '</span></span>'
    )
  }

  // Escaped text with every "<number> تومان" shown as number + the site's Toman icon.
  function textHtml(text) {
    var html = esc(text)
    if (!money.toman) return html
    return html.replace(MONEY_RE, function (m, num) {
      return tomanMarkup(num)
    })
  }

  function setText(el, text) {
    if (el) el.innerHTML = textHtml(text)
  }

  function moneyHtml(amount) {
    var dec = Math.max(0, parseInt(money.decimals, 10) || 0)
    var parts = (Math.round((Number(amount) || 0) * Math.pow(10, dec)) / Math.pow(10, dec)).toFixed(dec).split('.')
    var num = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, money.thousand == null ? ',' : money.thousand)
    if (parts[1]) num += (money.decimal || '.') + parts[1]
    num = digits(num)
    if (money.toman) return tomanMarkup(esc(num))
    var sym = esc(money.symbol || '')
    return money.symbolFirst ? sym + esc(num) : esc(num) + '\u00A0' + sym
  }

  // Server-rendered price markup (wc_price) – keep only inline tags we know.
  function safeHtml(html, fallback) {
    if (!html) return esc(fallback || '')
    var tpl = document.createElement('template')
    tpl.innerHTML = String(html)
    var bad = tpl.content.querySelectorAll('script,style,iframe,object,embed,img,svg,a,form,input,button,link,meta')
    Array.prototype.forEach.call(bad, function (n) {
      n.parentNode.removeChild(n)
    })
    Array.prototype.forEach.call(tpl.content.querySelectorAll('*'), function (n) {
      Array.prototype.slice.call(n.attributes).forEach(function (a) {
        if (a.name !== 'class' && a.name !== 'aria-hidden' && a.name !== 'dir') n.removeAttribute(a.name)
      })
    })
    return tpl.innerHTML
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
    el.innerHTML = textHtml(text)
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

  var GIFT_SVG =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>' +
    '<path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>'

  function removeWidget() {
    var el = document.getElementById('webino-coupon-progress')
    if (el && el.parentNode) el.parentNode.removeChild(el)
  }

  function productProjection(n) {
    var p = cfg.product
    if (!cfg.isProduct || !p || !(Number(p.price) > 0) || n.kind !== 'amount') return null
    var target = Number(n.target) || 0
    if (target <= 0) return null
    var projected = (Number(n.current) || 0) + Number(p.price)
    return { ratio: Math.max(0, Math.min(1, projected / target)), unlocks: projected >= target, left: Math.max(0, target - projected) }
  }

  function buildWidget() {
    var el = document.createElement('section')
    el.id = 'webino-coupon-progress'
    el.className = 'webino-cprog'
    el.innerHTML =
      '<button type="button" class="webino-cprog__pill" aria-expanded="false">' +
      '<span class="webino-cprog__pill-icon">' + GIFT_SVG + '</span>' +
      '<span class="webino-cprog__pill-body"><span class="webino-cprog__pill-label"></span>' +
      '<span class="webino-cprog__pill-bar" aria-hidden="true"><span class="webino-cprog__pill-fill"></span></span></span>' +
      '<span class="webino-cprog__pill-pct"></span></button>' +
      '<div class="webino-cprog__card">' +
      '<div class="webino-cprog__head">' +
      '<span class="webino-cprog__icon">' + GIFT_SVG + '</span>' +
      '<span class="webino-cprog__heading"><span class="webino-cprog__eyebrow"></span><span class="webino-cprog__title"></span></span>' +
      '<span class="webino-cprog__actions">' +
      '<button type="button" class="webino-cprog__iconbtn webino-cprog__min"><span aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 12h12"/></svg></span></button>' +
      '<button type="button" class="webino-cprog__iconbtn webino-cprog__close"><span aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></span></button>' +
      '</span></div>' +
      '<p class="webino-cprog__cta"></p>' +
      '<div class="webino-cprog__track" role="progressbar" aria-valuemin="0">' +
      '<span class="webino-cprog__ghost"></span><span class="webino-cprog__fill"><span class="webino-cprog__shine"></span></span></div>' +
      '<div class="webino-cprog__range"><span class="webino-cprog__cur"></span><span class="webino-cprog__pct"></span><span class="webino-cprog__target"></span></div>' +
      '<p class="webino-cprog__hint" hidden></p>' +
      '</div>'
    $('.webino-cprog__close', el).addEventListener('click', function () {
      if (lastState && lastState.next) ssSet(DISMISS_KEY, String(lastState.next.id))
      removeWidget()
    })
    $('.webino-cprog__min', el).addEventListener('click', function () {
      ssSet(COLLAPSE_KEY, '1')
      setCollapsed(el, true)
      var pill = $('.webino-cprog__pill', el)
      if (pill) pill.focus()
    })
    $('.webino-cprog__pill', el).addEventListener('click', function () {
      ssSet(COLLAPSE_KEY, '0')
      setCollapsed(el, false)
    })
    var stored = ssGet(COLLAPSE_KEY)
    // Phones, cart and checkout always start as the compact pill (never over add-to-cart, totals or the
    // checkout button); the card opens only when tapped. Desktop remembers the visitor's last choice.
    var compactPage = !!(cfg.isCart || cfg.isCheckout) || isSmall()
    setCollapsed(el, compactPage ? true : stored === '1')
    return el
  }

  function renderWidget(state) {
    if (!settings.progress_widget || !state || !state.next) {
      removeWidget()
      return
    }
    var n = state.next
    if (ssGet(DISMISS_KEY) === String(n.id)) {
      removeWidget()
      return
    }
    var ratio = Math.max(0, Math.min(1, Number(n.ratio) || 0))
    var pct = Math.floor(ratio * 100)
    var root = ensureRoot()
    var el = document.getElementById('webino-coupon-progress')
    var fresh = !el
    if (!el) {
      el = buildWidget()
      el.classList.add('is-entering')
      root.appendChild(el)
    }
    el.setAttribute('dir', cfg.isRtl ? 'rtl' : 'ltr')
    el.setAttribute('aria-label', i18n.nextCoupon || 'Your next coupon')
    var eyebrow = n.first || state.empty ? i18n.firstCoupon || i18n.nextCoupon : i18n.nextCoupon
    $('.webino-cprog__eyebrow', el).textContent = eyebrow || ''
    setText($('.webino-cprog__pill-label', el), n.title || eyebrow || '')
    setText($('.webino-cprog__title', el), n.title || '')
    setText($('.webino-cprog__cta', el), n.cta || '')
    var min = $('.webino-cprog__min', el)
    min.setAttribute('aria-label', i18n.hide || 'Hide')
    min.setAttribute('title', i18n.hide || 'Hide')
    var close = $('.webino-cprog__close', el)
    close.setAttribute('aria-label', i18n.close || 'Close')
    close.setAttribute('title', i18n.close || 'Close')
    $('.webino-cprog__pill', el).setAttribute('aria-label', (i18n.show || '') + ' — ' + (n.message || n.title || ''))
    $('.webino-cprog__pill-pct', el).textContent = pctText(pct)
    $('.webino-cprog__pill-fill', el).style.width = Math.max(pct, 4) + '%'
    var track = $('.webino-cprog__track', el)
    track.setAttribute('aria-valuemax', String(n.target))
    track.setAttribute('aria-valuenow', String(Math.min(Number(n.current) || 0, Number(n.target) || 0)))
    track.setAttribute('aria-valuetext', (n.current_text || '') + ' / ' + (n.target_text || ''))
    track.setAttribute('aria-label', n.message || n.title || '')
    var fill = $('.webino-cprog__fill', el)
    var setFill = function () {
      fill.style.width = (pct > 0 ? Math.max(pct, 3) : 0) + '%'
    }
    if (fresh) requestAnimationFrame(function () { requestAnimationFrame(setFill) })
    else setFill()
    $('.webino-cprog__cur', el).innerHTML = safeHtml(n.current_html, n.current_text)
    $('.webino-cprog__target', el).innerHTML = safeHtml(n.target_html, n.target_text)
    $('.webino-cprog__pct', el).textContent = pctText(pct)

    var proj = productProjection(n)
    var ghost = $('.webino-cprog__ghost', el)
    var hint = $('.webino-cprog__hint', el)
    if (proj && proj.ratio > ratio) {
      ghost.style.width = Math.round(proj.ratio * 100) + '%'
      ghost.hidden = false
      hint.hidden = false
      hint.classList.toggle('is-unlock', proj.unlocks)
      if (proj.unlocks) hint.textContent = i18n.unlocksNow || ''
      else if (i18n.withProductLeft) hint.innerHTML = esc(i18n.withProductLeft).replace('%s', moneyHtml(proj.left))
      else hint.textContent = sprintf1(i18n.withProduct, pctText(Math.floor(proj.ratio * 100)))
    } else {
      ghost.style.width = '0'
      ghost.hidden = true
      hint.hidden = true
      hint.textContent = ''
    }
    if (fresh) {
      setTimeout(function () {
        el.classList.remove('is-entering')
      }, 30)
      setTimeout(placeWidget, 60)
      setTimeout(placeWidget, 1500)
    }
  }

  function isSmall() {
    return !!(window.matchMedia && window.matchMedia('(max-width: 782px)').matches)
  }

  // Keep the widget above fixed/sticky bars at the bottom of the screen (sticky add-to-cart, bottom nav, cookie bars).
  function bottomBarHeight() {
    var vh = window.innerHeight || document.documentElement.clientHeight
    var vw = window.innerWidth || document.documentElement.clientWidth
    var max = 0
    var seen = []
    ;[0.08, 0.3, 0.5, 0.7, 0.92].forEach(function (fx) {
      var stack = document.elementsFromPoint ? document.elementsFromPoint(Math.round(vw * fx), vh - 3) : []
      for (var i = 0; i < stack.length; i++) {
        var n = stack[i]
        while (n && n !== document.body && n !== document.documentElement) {
          if (seen.indexOf(n) >= 0) break
          seen.push(n)
          if (n.id === 'webino-offers-root' || n.id === 'webino-coupon-progress') break
          var pos = getComputedStyle(n).position
          if (pos === 'fixed' || pos === 'sticky') {
            var r = n.getBoundingClientRect()
            if (r.height > 0 && r.height < vh * 0.4 && r.bottom >= vh - 4) max = Math.max(max, vh - r.top)
            break
          }
          n = n.parentElement
        }
      }
    })
    return Math.round(max)
  }

  var placeTimer = null
  function placeWidget() {
    var el = document.getElementById('webino-coupon-progress')
    if (!el) return
    var h = bottomBarHeight()
    el.style.bottom = h > 0 ? 'calc(' + (h + 10) + 'px + env(safe-area-inset-bottom, 0px))' : ''
  }
  function schedulePlace() {
    if (placeTimer) clearTimeout(placeTimer)
    placeTimer = setTimeout(placeWidget, 120)
  }

  function setCollapsed(el, collapsed) {
    el.classList.toggle('is-collapsed', !!collapsed)
    var pill = $('.webino-cprog__pill', el)
    if (pill) pill.setAttribute('aria-expanded', collapsed ? 'false' : 'true')
    var card = $('.webino-cprog__card', el)
    if (card) {
      if (collapsed) card.setAttribute('aria-hidden', 'true')
      else card.removeAttribute('aria-hidden')
    }
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

  function htmlToNode(html) {
    var tpl = document.createElement('template')
    tpl.innerHTML = String(html || '').trim()
    return tpl.content.firstElementChild
  }

  function renderBlockChooser(state) {
    if (!hasBlockCart()) return
    var old = document.querySelector('.webino-coupon-chooser--block')
    if (!settings.cart_chooser || !state || state.empty || !state.eligible || !state.eligible.length || !state.chooser_html) {
      if (old && old.parentNode && !(state && state.eligible && state.eligible.length && !state.chooser_html)) old.parentNode.removeChild(old)
      return
    }
    var node = htmlToNode(state.chooser_html)
    if (!node || node.hasAttribute('hidden')) {
      if (old && old.parentNode) old.parentNode.removeChild(old)
      return
    }
    node.classList.add('webino-coupon-chooser--block')
    if (old && old.parentNode) {
      old.parentNode.replaceChild(node, old)
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
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(node, anchor.nextSibling)
    else if (sidebar) sidebar.insertBefore(node, sidebar.firstChild)
  }

  /* ------------------------------------------------------------- selection */

  function setBusy(chooser, busy, btn) {
    if (!chooser) return
    chooser.classList.toggle('is-busy', !!busy)
    if (busy) chooser.setAttribute('aria-busy', 'true')
    else chooser.removeAttribute('aria-busy')
    Array.prototype.forEach.call(chooser.querySelectorAll('button'), function (b) {
      b.disabled = !!busy
    })
    if (btn) {
      btn.classList.toggle('is-loading', !!busy)
      var label = btn.querySelector('.webino-cc__btn-label')
      if (label) {
        if (busy) {
          label.setAttribute('data-label', label.textContent)
          if (!btn.hasAttribute('data-webino-coupon-remove')) label.textContent = i18n.applying || label.textContent
        } else if (label.getAttribute('data-label')) {
          label.textContent = label.getAttribute('data-label')
        }
      }
    }
  }

  function chooserMessage(chooser, text, type) {
    var el = chooser && chooser.querySelector('.webino-cc__msg')
    if (el) {
      el.innerHTML = textHtml(text || '')
      el.className = 'webino-cc__msg webino-coupon-chooser__msg' + (type === 'error' ? ' is-error' : text ? ' is-success' : '')
    }
    if (text) toast(text, type)
  }

  function replaceChooser(chooser, html) {
    if (!chooser || !chooser.parentNode || !html) return chooser
    var node = htmlToNode(html)
    if (!node) return chooser
    if (chooser.classList.contains('webino-coupon-chooser--block')) node.classList.add('webino-coupon-chooser--block')
    chooser.parentNode.replaceChild(node, chooser)
    return node
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

  function chooserNonce(chooser) {
    return (chooser && chooser.getAttribute('data-nonce')) || (lastState && lastState.nonce) || ''
  }

  function postSelect(data, nonce) {
    var body = new URLSearchParams()
    body.set('nonce', nonce || '')
    body.set('chooser', '1')
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
    if (!btn || btn.disabled) return
    var chooser = btn.closest('.webino-coupon-chooser')
    if (!chooser) return
    e.preventDefault()
    var remove = btn.hasAttribute('data-webino-coupon-remove')
    var id = btn.getAttribute('data-webino-coupon-id')
    var code = btn.getAttribute('data-webino-coupon-code') || ''
    setBusy(chooser, true, btn)

    var store = chooser.classList.contains('webino-coupon-chooser--block') ? blockStore() : null
    if (store && code && typeof store.dispatch.applyCoupon === 'function') {
      // Store API: server-side single-coupon rule replaces the previous coupon in the same request.
      var p = remove ? store.dispatch.removeCoupon(code) : store.dispatch.applyCoupon(code)
      Promise.resolve(p)
        .then(function () {
          schedule(30)
          setTimeout(function () {
            if (document.body.contains(chooser)) setBusy(chooser, false, btn)
          }, 5000)
        })
        .catch(function (err) {
          setBusy(chooser, false, btn)
          chooserMessage(chooser, (err && err.message) || i18n.error, 'error')
        })
      return
    }

    var payload = remove ? { remove: '1' } : { coupon_id: id }
    var current = chooser
    var run = function (nonce, retry) {
      return postSelect(payload, nonce).then(function (res) {
        if (res && res.success) {
          var msg = res.data && res.data.message
          if (res.data) {
            current = replaceChooser(current, res.data.chooser_html)
            applyState(res.data)
          }
          chooserMessage(current, msg, 'success')
          afterChange()
          return
        }
        if (!retry && res && res.data && res.data.nonce) return run(res.data.nonce, true)
        setBusy(current, false, btn)
        chooserMessage(current, (res && res.data && res.data.message) || i18n.error, 'error')
      })
    }
    run(chooserNonce(chooser), false).catch(function () {
      setBusy(current, false, btn)
      chooserMessage(current, i18n.error, 'error')
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
    var q = '_=' + Date.now() + (hasBlockCart() ? '&chooser=1' : '')
    inflight = fetch(url + (url.indexOf('?') >= 0 ? '&' : '?') + q, {
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
        if (!first) schedule(120)
      }
    })
    return true
  }

  var booted = false

  function boot() {
    if (booted) return
    booted = true
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
    window.addEventListener('resize', schedulePlace)
    window.addEventListener('scroll', schedulePlace, { passive: true })

    if (!watchBlockStore() && hasBlockCart()) {
      setTimeout(watchBlockStore, 1500)
    }

    var hasItems = cartHasItemsCookie()
    if (hasItems || cfg.isCart || cfg.isCheckout) {
      // Live, per-visitor state (never baked into cached HTML).
      schedule(0)
    } else {
      // Empty cart: the first coupon tier is the same for everyone, so it ships with the page.
      if (cfg.emptyState) applyState(cfg.emptyState)
      if (cfg.popup && shouldShowPopup()) schedule(0)
    }

    if (hasBlockCart() && window.MutationObserver) {
      var mo = new MutationObserver(function () {
        if (lastState && settings.cart_chooser && lastState.chooser_html && lastState.eligible && lastState.eligible.length && !document.querySelector('.webino-coupon-chooser--block')) {
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
