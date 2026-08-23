(function () {
  var cfg = window.webinoAnalytics;
  if (!cfg || !cfg.endpoint || !cfg.token) return;

  function param(name) {
    try {
      return new URLSearchParams(window.location.search).get(name) || '';
    } catch (e) {
      return '';
    }
  }

  var body = JSON.stringify({
    uri: window.location.pathname + window.location.search,
    referrer: document.referrer || '',
    title: document.title || '',
    utm_source: param('utm_source'),
    utm_medium: param('utm_medium'),
    utm_campaign: param('utm_campaign'),
  });

  var url = cfg.endpoint + (cfg.endpoint.indexOf('?') >= 0 ? '&' : '?') + 'token=' + encodeURIComponent(cfg.token);

  // Prefer fetch without cookies so logged-in admins are not silently skipped server-side.
  try {
    if (typeof fetch === 'function') {
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webino-Analytics-Token': cfg.token,
        },
        body: body,
        keepalive: true,
        credentials: 'omit',
        mode: 'cors',
      }).catch(function () {});
      return;
    }
  } catch (e) {
    /* fall through */
  }

  try {
    if (navigator.sendBeacon) {
      var blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    }
  } catch (e2) {
    /* ignore */
  }
})();
