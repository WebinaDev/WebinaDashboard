(function () {
  var cfg = window.webinoAnalytics;
  if (!cfg || !cfg.token) return;
  if (!cfg.endpoint && !cfg.ajaxUrl) return;

  function param(name) {
    try {
      return new URLSearchParams(window.location.search).get(name) || '';
    } catch (e) {
      return '';
    }
  }

  function uuid() {
    try {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '');
    } catch (e) {}
    return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  var SESSION_KEY = 'webino_analytics_sid';
  var PAGE_KEY = 'webino_analytics_pages';
  var sessionId = '';
  try {
    sessionId = sessionStorage.getItem(SESSION_KEY) || '';
    if (!sessionId) {
      sessionId = uuid();
      sessionStorage.setItem(SESSION_KEY, sessionId);
      sessionStorage.setItem(PAGE_KEY, '0');
    }
    var pages = parseInt(sessionStorage.getItem(PAGE_KEY) || '0', 10) || 0;
    sessionStorage.setItem(PAGE_KEY, String(pages + 1));
  } catch (e) {
    sessionId = uuid();
  }

  var started = Date.now();

  function pageCount() {
    try {
      return parseInt(sessionStorage.getItem(PAGE_KEY) || '1', 10) || 1;
    } catch (e2) {
      return 1;
    }
  }

  function sendPayload(payload) {
    var body = JSON.stringify(payload);

    function sendViaAjax() {
      if (!cfg.ajaxUrl) return false;
      try {
        if (typeof fetch === 'function') {
          var fd = new FormData();
          fd.append('action', cfg.ajaxAction || 'webino_dashboard_analytics_hit');
          fd.append('token', cfg.token);
          fd.append('payload', body);
          fetch(cfg.ajaxUrl, {
            method: 'POST',
            body: fd,
            keepalive: true,
            credentials: 'omit',
            mode: 'cors',
          }).catch(function () {});
          return true;
        }
      } catch (e) {}
      return false;
    }

    function sendViaRest() {
      if (!cfg.endpoint) return false;
      var url =
        cfg.endpoint + (cfg.endpoint.indexOf('?') >= 0 ? '&' : '?') + 'token=' + encodeURIComponent(cfg.token);
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
          }).catch(function () {
            sendViaAjax();
          });
          return true;
        }
      } catch (e) {}
      try {
        if (navigator.sendBeacon) {
          var blob = new Blob([body], { type: 'application/json' });
          navigator.sendBeacon(url, blob);
          return true;
        }
      } catch (e2) {}
      return false;
    }

    if (cfg.preferAjax && sendViaAjax()) return;
    if (!sendViaRest()) sendViaAjax();
  }

  sendPayload({
    type: 'pageview',
    uri: window.location.pathname + window.location.search,
    referrer: document.referrer || '',
    title: document.title || '',
    utm_source: param('utm_source'),
    utm_medium: param('utm_medium'),
    utm_campaign: param('utm_campaign'),
    session_id: sessionId,
  });

  var flushed = false;
  function flushSession() {
    if (flushed) return;
    flushed = true;
    sendPayload({
      type: 'session',
      session_id: sessionId,
      duration_ms: Math.max(0, Date.now() - started),
      page_count: pageCount(),
      is_exit: true,
    });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flushSession();
  });
  window.addEventListener('pagehide', flushSession);
})();
