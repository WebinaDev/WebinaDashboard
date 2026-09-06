(function () {
  'use strict';

  var FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  function fa(n) {
    return String(n).replace(/\d/g, function (d) {
      return FA[Number(d)] || d;
    });
  }

  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var root = document.getElementById('wcb-root');
    if (!root) return;
    var cfg;
    try {
      cfg = JSON.parse(root.getAttribute('data-config') || '{}');
    } catch (e) {
      return;
    }
    var mount = root.querySelector('.wcb-app');
    if (!mount) return;

    var defaultMode = cfg.mode === 'simple' || cfg.mode === 'advanced' ? cfg.mode : 'advanced';
    var state = {
      uiMode: defaultMode,
      step: 0,
      selected: {},
      roasts: {},
      percents: {},
      sharedRoast: 'medium',
      grind: 'whole',
      grind_device: cfg.grind_devices && cfg.grind_devices[0] ? cfg.grind_devices[0].id : '',
      weight_g: cfg.weights && cfg.weights[0] ? cfg.weights[0] : 250,
      purchase_type: 'cash',
      installment_months: 0,
      blend_name: '',
      quote: null,
      error: '',
      busy: false,
    };

    var quoteTimer = null;

    function beans() {
      return (cfg.catalog || []).filter(function (b) {
        return state.selected[b.id];
      });
    }

    function simpleBeans() {
      var out = [];
      if (state.selected.robusta && cfg.simple && cfg.simple.robusta) out.push(cfg.simple.robusta);
      if (state.selected.arabica && cfg.simple && cfg.simple.arabica) out.push(cfg.simple.arabica);
      return out;
    }

    function currentBeans() {
      return state.uiMode === 'simple' ? simpleBeans() : beans();
    }

    function equalize() {
      var list = currentBeans();
      var n = list.length;
      if (!n) {
        state.percents = {};
        return;
      }
      var base = Math.floor(100 / n);
      var rest = 100 - base * n;
      state.percents = {};
      list.forEach(function (b, i) {
        state.percents[b.id] = base + (i === 0 ? rest : 0);
        if (!state.roasts[b.id]) state.roasts[b.id] = state.sharedRoast || 'medium';
      });
    }

    function percentSum() {
      return currentBeans().reduce(function (s, b) {
        return s + Number(state.percents[b.id] || 0);
      }, 0);
    }

    function recipe() {
      var list = currentBeans();
      return {
        mode: state.uiMode,
        beans: list.map(function (b) {
          return {
            product_id: b.id,
            percent: Number(state.percents[b.id] || 0),
            roast: state.uiMode === 'simple' ? state.sharedRoast : state.roasts[b.id] || 'medium',
          };
        }),
        grind: state.grind,
        grind_device: state.grind === 'ground' ? state.grind_device : '',
        weight_g: state.weight_g,
        purchase_type: state.purchase_type,
        installment_months: state.installment_months,
        blend_name: String(state.blend_name || '').trim(),
      };
    }

    function nameOk() {
      var n = String(state.blend_name || '').trim();
      return n.length >= 2 && n.length <= 40;
    }

    function canBuy() {
      return canQuote() && nameOk();
    }

    function canQuote() {
      var list = currentBeans();
      var min = state.uiMode === 'simple' ? 1 : cfg.min_beans || 2;
      if (list.length < min) return false;
      if (Math.abs(percentSum() - 100) > 1) return false;
      if (!state.weight_g) return false;
      if (state.grind === 'ground' && !state.grind_device) return false;
      return true;
    }

    function fetchQuote() {
      if (!canQuote()) {
        state.quote = null;
        render();
        return;
      }
      var url = (cfg.rest || '') + 'quote';
      fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe()),
      })
        .then(function (r) {
          return r.json().then(function (j) {
            return { ok: r.ok, j: j };
          });
        })
        .then(function (res) {
          if (res.ok) {
            state.quote = res.j;
            state.error = '';
            if (res.j.installment && res.j.installment[0] && !state.installment_months) {
              state.installment_months = res.j.installment[0].months;
            }
          } else {
            state.quote = null;
            state.error = (res.j && (res.j.message || (res.j.data && res.j.data.message))) || '';
          }
          render();
        })
        .catch(function () {
          state.error = 'قیمت محاسبه نشد.';
          render();
        });
    }

    function scheduleQuote() {
      window.clearTimeout(quoteTimer);
      quoteTimer = window.setTimeout(fetchQuote, 280);
    }

    function advancedSteps() {
      var steps = ['دان‌ها', 'رست', 'درصد', 'آسیاب'];
      if (state.grind === 'ground') steps.push('دستگاه');
      steps.push('وزن');
      return steps;
    }

    function simpleSteps() {
      return ['گونه', 'رست و درصد', 'آسیاب و وزن'];
    }

    function steps() {
      return state.uiMode === 'simple' ? simpleSteps() : advancedSteps();
    }

    function clampStep() {
      var s = steps();
      if (state.step >= s.length) state.step = s.length - 1;
      if (state.step < 0) state.step = 0;
    }

    function originFlagsHtml(origins) {
      var list = (origins || []).slice(0, 3);
      var flags = [];
      var names = [];
      list.forEach(function (o) {
        if (o && o.name) names.push(o.name);
        if (o && o.flag_url) {
          flags.push(
            '<span class="wcp-card-flag" style="background-image:url(\'' +
              esc(o.flag_url) +
              '\')" aria-hidden="true"></span>'
          );
        } else if (o && o.flag_emoji) {
          flags.push(
            '<span class="wcp-card-flag-emoji" aria-hidden="true">' + esc(o.flag_emoji) + '</span>'
          );
        }
      });
      if (!flags.length) return '';
      var label = names.map(esc).join('، ');
      return (
        '<span class="wcp-card-flags"' +
        (label ? ' aria-label="' + label + '"' : '') +
        '>' +
        flags.join('') +
        '</span>'
      );
    }

    function cardHtml(b, on) {
      var originNames = (b.origins || [])
        .map(function (o) {
          return esc(o.name);
        })
        .filter(Boolean)
        .join('، ');
      var img = b.image
        ? '<img src="' + esc(b.image) + '" alt="">'
        : '<span class="wcb-card-ph"></span>';
      var media =
        '<span class="wcb-card-media">' + img + originFlagsHtml(b.origins) + '</span>';
      return (
        '<button type="button" class="wcb-card' +
        (on ? ' is-on' : '') +
        (b.in_stock ? '' : ' is-off') +
        '" data-id="' +
        b.id +
        '"' +
        (b.in_stock ? '' : ' disabled') +
        '>' +
        media +
        '<span class="wcb-card-body">' +
        '<strong>' +
        esc(b.name) +
        '</strong>' +
        (originNames ? '<span class="wcb-chip">' + originNames + '</span>' : '') +
        '<span class="wcb-meta">' +
        (b.blend_arabica ? '<span class="wcb-chip">' + esc((cfg.labels && cfg.labels.arabica) || 'عربیکا') + ' ' + fa(b.blend_arabica) + '٪</span>' : '') +
        (b.blend_robusta ? '<span class="wcb-chip">' + esc((cfg.labels && cfg.labels.robusta) || 'روبوستا') + ' ' + fa(b.blend_robusta) + '٪</span>' : '') +
        '</span>' +
        '<span class="wcb-stats">' +
        '<span>تلخی ' +
        fa(b.bitterness) +
        '</span><span>اسیدیته ' +
        fa(b.acidity_avg) +
        '</span>' +
        '<span>کافئین ' +
        fa(b.caffeine_mg) +
        '</span><span>بادی ' +
        fa(b.body) +
        '</span>' +
        '</span>' +
        '<span class="wcb-price">' +
        (b.retail_html || '') +
        ' / کیلو</span>' +
        '</span></button>'
      );
    }

    function renderTasting(t) {
      if (!t) return '<p class="wcb-hint">با انتخاب دان‌ها پیش‌نمایش طعم ساخته می‌شود.</p>';
      var r = t.blend_robusta || 0;
      var a = t.blend_arabica || 0;
      var sum = Math.max(1, r + a);
      return (
        '<dl class="wcb-tasting">' +
        '<dt>' +
        esc((cfg.labels && cfg.labels.robusta) || 'روبوستا') +
        ' / ' +
        esc((cfg.labels && cfg.labels.arabica) || 'عربیکا') +
        '</dt>' +
        '<dd>' +
        fa(r) +
        '٪ / ' +
        fa(a) +
        '٪' +
        '<div class="wcb-bar-wrap"><i class="wcb-bar-r" style="width:' +
        (100 * r) / sum +
        '%"></i><i class="wcb-bar-a" style="width:' +
        (100 * a) / sum +
        '%"></i></div></dd>' +
        '<dt>تلخی</dt><dd>' +
        fa(t.bitterness) +
        '</dd>' +
        '<dt>شیرینی</dt><dd>' +
        fa(t.sweetness) +
        '</dd>' +
        '<dt>بادی</dt><dd>' +
        fa(t.body) +
        '</dd>' +
        '<dt>کافئین</dt><dd>' +
        fa(t.caffeine_mg) +
        ' ' +
        esc((cfg.profile_settings && cfg.profile_settings.caffeine_unit) || '') +
        '</dd></dl>'
      );
    }

    function renderMain() {
      clampStep();
      var html = '';
      if (cfg.mode === 'both') {
        html +=
          '<div class="wcb-modes">' +
          '<button type="button" data-act="mode" data-v="simple"' +
          (state.uiMode === 'simple' ? ' class="is-on"' : '') +
          '>حالت ساده</button>' +
          '<button type="button" data-act="mode" data-v="advanced"' +
          (state.uiMode === 'advanced' ? ' class="is-on"' : '') +
          '>حالت پیشرفته</button></div>';
      }
      html += '<div class="wcb-steps">';
      steps().forEach(function (label, i) {
        html +=
          '<button type="button" class="wcb-step' +
          (i === state.step ? ' is-on' : i < state.step ? ' is-done' : '') +
          '" data-act="step" data-v="' +
          i +
          '">' +
          fa(i + 1) +
          '. ' +
          esc(label) +
          '</button>';
      });
      html += '</div>';

      if (state.uiMode === 'advanced') html += renderAdvanced();
      else html += renderSimple();

      var canNext = canGoNext();
      html += '<div class="wcb-footer">';
      html +=
        '<button type="button" class="wcb-btn wcb-btn-ghost" data-act="prev"' +
        (state.step === 0 ? ' disabled' : '') +
        '>قبلی</button>';
      html +=
        '<div><strong>' +
        (state.quote && state.quote.formatted ? state.quote.formatted.line_price : '—') +
        '</strong></div>';
      if (state.step === steps().length - 1) {
        html +=
          '<button type="button" class="wcb-btn wcb-btn-main" data-act="buy"' +
          (!canBuy() || state.busy ? ' disabled' : '') +
          '>افزودن به سبد</button>';
      } else {
        html +=
          '<button type="button" class="wcb-btn wcb-btn-main" data-act="next"' +
          (!canNext ? ' disabled' : '') +
          '>ادامه</button>';
      }
      html += '</div>';
      if (state.error) html += '<p class="wcb-error">' + esc(state.error) + '</p>';
      return html;
    }

    function canGoNext() {
      var min = state.uiMode === 'simple' ? 1 : cfg.min_beans || 2;
      var max = state.uiMode === 'simple' ? 2 : cfg.max_beans || 4;
      var n = currentBeans().length;
      if (state.uiMode === 'advanced') {
        if (state.step === 0) return n >= min && n <= max;
        if (state.step === 2) return Math.abs(percentSum() - 100) < 1;
        if (steps()[state.step] === 'دستگاه') return !!state.grind_device;
      } else {
        if (state.step === 0) return n >= 1;
        if (state.step === 1) return Math.abs(percentSum() - 100) < 1;
      }
      return true;
    }

    function renderAdvanced() {
      var stepName = steps()[state.step];
      if (stepName === 'دان‌ها') {
        var n = beans().length;
        return (
          '<p class="wcb-hint">از ' +
          fa(cfg.min_beans) +
          ' تا ' +
          fa(cfg.max_beans) +
          ' دان انتخاب کنید. (' +
          fa(n) +
          ' انتخاب شده)</p>' +
          '<div class="wcb-grid">' +
          (cfg.catalog || [])
            .map(function (b) {
              return cardHtml(b, !!state.selected[b.id]);
            })
            .join('') +
          '</div>'
        );
      }
      if (stepName === 'رست') {
        return (
          currentBeans()
            .map(function (b) {
              return (
                '<div class="wcb-row"><div><strong>' +
                esc(b.name) +
                '</strong></div><div class="wcb-choices">' +
                (cfg.roasts || [])
                  .map(function (r) {
                    return (
                      '<button type="button" class="wcb-choice' +
                      ((state.roasts[b.id] || 'medium') === r.id ? ' is-on' : '') +
                      '" data-act="roast" data-id="' +
                      b.id +
                      '" data-v="' +
                      esc(r.id) +
                      '">' +
                      esc(r.label) +
                      '</button>'
                    );
                  })
                  .join('') +
                '</div></div>'
              );
            })
            .join('') || '<p class="wcb-hint">اول دان‌ها را انتخاب کنید.</p>'
        );
      }
      if (stepName === 'درصد') {
        var sum = percentSum();
        return (
          '<p class="wcb-hint">جمع درصدها باید ۱۰۰ باشد. الان: <strong>' +
          fa(Math.round(sum)) +
          '٪</strong></p>' +
          currentBeans()
            .map(function (b) {
              var v = Number(state.percents[b.id] || 0);
              return (
                '<div class="wcb-row"><div><strong>' +
                esc(b.name) +
                '</strong><div>' +
                fa(Math.round(v)) +
                '٪</div></div>' +
                '<input class="wcb-range" type="range" min="0" max="100" value="' +
                v +
                '" data-act="pct" data-id="' +
                b.id +
                '"></div>'
              );
            })
            .join('')
        );
      }
      if (stepName === 'آسیاب') {
        return (
          '<p class="wcb-hint">دان تازگی را بهتر نگه می‌دارد. پودر باید مطابق دستگاه آسیاب شود.</p>' +
          '<div class="wcb-choices">' +
          '<button type="button" class="wcb-choice' +
          (state.grind === 'whole' ? ' is-on' : '') +
          '" data-act="grind" data-v="whole">دان قهوه</button>' +
          '<button type="button" class="wcb-choice' +
          (state.grind === 'ground' ? ' is-on' : '') +
          '" data-act="grind" data-v="ground">پودر قهوه</button></div>'
        );
      }
      if (stepName === 'دستگاه') {
        return (
          '<p class="wcb-hint">وسیله دم‌آوری را انتخاب کنید تا درجه آسیاب متناسب اعمال شود.</p>' +
          '<div class="wcb-choices">' +
          (cfg.grind_devices || [])
            .map(function (d) {
              return (
                '<button type="button" class="wcb-choice' +
                (state.grind_device === d.id ? ' is-on' : '') +
                '" data-act="device" data-v="' +
                esc(d.id) +
                '">' +
                esc(d.label) +
                '</button>'
              );
            })
            .join('') +
          '</div>'
        );
      }
      return renderWeightAndPay();
    }

    function renderSimple() {
      if (state.step === 0) {
        var items = [];
        if (cfg.simple && cfg.simple.robusta) items.push({ key: 'robusta', bean: cfg.simple.robusta, label: (cfg.labels && cfg.labels.robusta) || 'روبوستا' });
        if (cfg.simple && cfg.simple.arabica) items.push({ key: 'arabica', bean: cfg.simple.arabica, label: (cfg.labels && cfg.labels.arabica) || 'عربیکا' });
        if (!items.length) {
          return '<p class="wcb-error">محصول نماینده روبوستا/عربیکا در تنظیمات ماژول انتخاب نشده است.</p>';
        }
        return (
          '<p class="wcb-hint">گونه را انتخاب کنید. بعداً درصد هر کدام را تنظیم می‌کنید.</p><div class="wcb-grid">' +
          items
            .map(function (it) {
              return cardHtml(it.bean, !!state.selected[it.key]).replace('data-id="' + it.bean.id + '"', 'data-act="species" data-v="' + it.key + '" data-id="' + it.bean.id + '"');
            })
            .join('') +
          '</div>'
        );
      }
      if (state.step === 1) {
        var chips = (cfg.suggestions || [])
          .map(function (s) {
            return (
              '<button type="button" data-act="suggest" data-arabica="' +
              s.arabica +
              '" data-robusta="' +
              s.robusta +
              '">' +
              esc(s.label) +
              '</button>'
            );
          })
          .join('');
        return (
          '<p class="wcb-hint">یک رست برای کل ترکیب و درصد گونه‌ها.</p>' +
          (chips ? '<div class="wcb-suggest">' + chips + '</div>' : '') +
          '<div class="wcb-choices" style="margin-bottom:1rem">' +
          (cfg.roasts || [])
            .map(function (r) {
              return (
                '<button type="button" class="wcb-choice' +
                (state.sharedRoast === r.id ? ' is-on' : '') +
                '" data-act="shared-roast" data-v="' +
                esc(r.id) +
                '">' +
                esc(r.label) +
                '</button>'
              );
            })
            .join('') +
          '</div>' +
          currentBeans()
            .map(function (b) {
              var v = Number(state.percents[b.id] || 0);
              return (
                '<div class="wcb-row"><div><strong>' +
                esc(b.name) +
                '</strong><div>' +
                fa(Math.round(v)) +
                '٪</div></div>' +
                '<input class="wcb-range" type="range" min="0" max="100" value="' +
                v +
                '" data-act="pct" data-id="' +
                b.id +
                '"></div>'
              );
            })
            .join('')
        );
      }
      return (
        '<p class="wcb-hint">دان یا پودر، سپس وزن بسته را انتخاب کنید.</p>' +
        '<div class="wcb-choices" style="margin-bottom:1rem">' +
        '<button type="button" class="wcb-choice' +
        (state.grind === 'whole' ? ' is-on' : '') +
        '" data-act="grind" data-v="whole">دان قهوه</button>' +
        '<button type="button" class="wcb-choice' +
        (state.grind === 'ground' ? ' is-on' : '') +
        '" data-act="grind" data-v="ground">پودر قهوه</button></div>' +
        (state.grind === 'ground'
          ? '<div class="wcb-choices" style="margin-bottom:1rem">' +
            (cfg.grind_devices || [])
              .map(function (d) {
                return (
                  '<button type="button" class="wcb-choice' +
                  (state.grind_device === d.id ? ' is-on' : '') +
                  '" data-act="device" data-v="' +
                  esc(d.id) +
                  '">' +
                  esc(d.label) +
                  '</button>'
                );
              })
              .join('') +
            '</div>'
          : '') +
        renderWeightAndPay()
      );
    }

    function renderWeightAndPay() {
      var html =
        '<div class="wcb-choices" style="margin-bottom:1rem">' +
        (cfg.weights || [])
          .map(function (w) {
            return (
              '<button type="button" class="wcb-choice' +
              (Number(state.weight_g) === Number(w) ? ' is-on' : '') +
              '" data-act="weight" data-v="' +
              w +
              '">' +
              fa(w) +
              ' گرم</button>'
            );
          })
          .join('') +
        '</div>';
      if (state.quote) {
        html += '<div class="wcb-tiers">';
        html +=
          '<button type="button" class="wcb-tier' +
          (state.purchase_type === 'cash' ? ' is-on' : '') +
          '" data-act="pay" data-v="cash"><strong>نقدی</strong><small>' +
          (state.quote.formatted.retail || '') +
          '</small></button>';
        if (cfg.credit_enabled && state.quote.credit > 0) {
          html +=
            '<button type="button" class="wcb-tier' +
            (state.purchase_type === 'credit' ? ' is-on' : '') +
            '" data-act="pay" data-v="credit"><strong>اعتباری</strong><small>' +
            (state.quote.formatted.credit || '') +
            '</small></button>';
        }
        if (cfg.installment_on && state.quote.installment) {
          state.quote.installment.forEach(function (p) {
            html +=
              '<button type="button" class="wcb-tier' +
              (state.purchase_type === 'installment' && Number(state.installment_months) === Number(p.months) ? ' is-on' : '') +
              '" data-act="pay-inst" data-v="' +
              p.months +
              '"><strong>اقساط ' +
              fa(p.months) +
              ' ماهه</strong><small>' +
              (p.monthly_html || '') +
              ' × ' +
              fa(p.months) +
              ' (کل ' +
              (p.total_html || '') +
              ')</small></button>';
          });
        }
        html += '</div>';
        html += '<p class="wcb-hint">' + esc(state.quote.title || '') + '</p>';
      }
      html +=
        '<div class="wcb-name">' +
        '<label class="wcb-name-label" for="wcb-blend-name">نام ترکیب</label>' +
        '<input id="wcb-blend-name" class="wcb-name-input" type="text" maxlength="40" placeholder="قهوه..." data-act="name" value="' +
        esc(state.blend_name) +
        '" autocomplete="off" />' +
        '<p class="wcb-name-hint">برای ذخیره ترکیب، انتخاب یک نام ضروری است. این نام به شما کمک می‌کند تا ترکیب دلخواهتان را در آینده به‌راحتی پیدا و مجدداً سفارش دهید. همچنین، با انتخاب یک نام، مشتریان دیگر می‌توانند ترکیب شما را جستجو و سفارش دهند. (این نام روی بسته‌بندی قهوه شما چاپ خواهد شد.)</p>' +
        (!nameOk() && String(state.blend_name || '').trim() !== ''
          ? '<p class="wcb-error">نام ترکیب باید بین ۲ تا ۴۰ کاراکتر باشد.</p>'
          : '') +
        '</div>';
      return html;
    }

    function renderSide() {
      var g = (cfg.guide || [])
        .map(function (item) {
          return '<details><summary>' + esc(item.title) + '</summary><p>' + esc(item.body) + '</p></details>';
        })
        .join('');
      var t = state.quote && state.quote.tasting ? state.quote.tasting : null;
      var lines = state.quote && state.quote.lines
        ? state.quote.lines
            .map(function (l) {
              return (
                '<div class="wcb-summary-line"><span>' +
                esc(l.name) +
                '</span><span>' +
                fa(Math.round(l.percent)) +
                '٪ · ' +
                esc(l.roast_label) +
                '</span></div>'
              );
            })
            .join('')
        : '';
      return (
        '<h3 style="margin:0 0 .75rem">دستور پخت و راهنما</h3>' +
        lines +
        (state.quote ? '<div class="wcb-summary-line"><span>آسیاب</span><span>' + esc(state.quote.grind_label) + '</span></div>' : '') +
        renderTasting(t) +
        '<div class="wcb-guide">' +
        g +
        '</div>'
      );
    }

    function render() {
      mount.innerHTML = '<div class="wcb-main">' + renderMain() + '</div><aside class="wcb-side">' + renderSide() + '</aside>';
    }

    mount.addEventListener('click', function (e) {
      var t = e.target.closest('[data-act], .wcb-card');
      if (!t || !mount.contains(t)) return;
      var act = t.getAttribute('data-act');
      if (t.classList.contains('wcb-card') && !act) act = 'pick';
      var v = t.getAttribute('data-v');
      var id = t.getAttribute('data-id');

      if (act === 'mode') {
        state.uiMode = v;
        state.step = 0;
        state.selected = {};
        state.percents = {};
        state.quote = null;
        render();
        return;
      }
      if (act === 'step') {
        state.step = Number(v) || 0;
        render();
        return;
      }
      if (act === 'prev') {
        state.step = Math.max(0, state.step - 1);
        render();
        return;
      }
      if (act === 'next') {
        if (!canGoNext()) return;
        state.step += 1;
        clampStep();
        scheduleQuote();
        render();
        return;
      }
      if (act === 'pick') {
        var pid = Number(id);
        var max = cfg.max_beans || 4;
        if (state.selected[pid]) delete state.selected[pid];
        else {
          if (beans().length >= max) return;
          state.selected[pid] = true;
        }
        equalize();
        scheduleQuote();
        render();
        return;
      }
      if (act === 'species') {
        if (state.selected[v]) delete state.selected[v];
        else state.selected[v] = true;
        equalize();
        scheduleQuote();
        render();
        return;
      }
      if (act === 'roast') {
        state.roasts[id] = v;
        scheduleQuote();
        render();
        return;
      }
      if (act === 'shared-roast') {
        state.sharedRoast = v;
        scheduleQuote();
        render();
        return;
      }
      if (act === 'grind') {
        state.grind = v;
        scheduleQuote();
        render();
        return;
      }
      if (act === 'device') {
        state.grind_device = v;
        scheduleQuote();
        render();
        return;
      }
      if (act === 'weight') {
        state.weight_g = Number(v);
        scheduleQuote();
        render();
        return;
      }
      if (act === 'pay') {
        state.purchase_type = v;
        scheduleQuote();
        render();
        return;
      }
      if (act === 'pay-inst') {
        state.purchase_type = 'installment';
        state.installment_months = Number(v);
        scheduleQuote();
        render();
        return;
      }
      if (act === 'suggest') {
        var arabica = Number(t.getAttribute('data-arabica')) || 0;
        var robusta = Number(t.getAttribute('data-robusta')) || 0;
        if (cfg.simple && cfg.simple.arabica) {
          state.selected.arabica = arabica > 0;
          state.percents[cfg.simple.arabica.id] = arabica;
        }
        if (cfg.simple && cfg.simple.robusta) {
          state.selected.robusta = robusta > 0;
          state.percents[cfg.simple.robusta.id] = robusta;
        }
        scheduleQuote();
        render();
        return;
      }
      if (act === 'buy') {
        addToCart();
      }
    });

    mount.addEventListener('input', function (e) {
      var t = e.target;
      if (!t) return;
      if (t.getAttribute('data-act') === 'name') {
        state.blend_name = t.value;
        var btn = mount.querySelector('[data-act="buy"]');
        if (btn) {
          btn.disabled = !canBuy() || state.busy;
        }
        return;
      }
      if (t.getAttribute('data-act') !== 'pct') return;
      var id = t.getAttribute('data-id');
      var val = Number(t.value) || 0;
      var list = currentBeans();
      if (list.length === 2) {
        var other = list[0].id == id ? list[1].id : list[0].id;
        state.percents[id] = val;
        state.percents[other] = 100 - val;
      } else {
        state.percents[id] = val;
      }
      render();
      scheduleQuote();
    });

    function addToCart() {
      if (!canBuy() || state.busy) return;
      if (!nameOk()) {
        state.error = 'برای افزودن به سبد، نام ترکیب را وارد کنید.';
        render();
        return;
      }
      state.busy = true;
      render();
      var body = new FormData();
      body.append('action', 'webino_coffee_blend_add');
      body.append('nonce', cfg.ajax && cfg.ajax.nonce ? cfg.ajax.nonce : '');
      body.append('recipe', JSON.stringify(recipe()));
      fetch((cfg.ajax && cfg.ajax.url) || '/wp-admin/admin-ajax.php', {
        method: 'POST',
        credentials: 'same-origin',
        body: body,
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (j) {
          state.busy = false;
          if (j && j.success && j.data && j.data.cart_url) {
            window.location.href = j.data.cart_url;
            return;
          }
          state.error = (j && j.data && j.data.message) || 'افزودن به سبد انجام نشد.';
          render();
        })
        .catch(function () {
          state.busy = false;
          state.error = 'افزودن به سبد انجام نشد.';
          render();
        });
    }

    render();
  });
})();
