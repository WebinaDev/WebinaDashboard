(function () {
	'use strict';

	function ready(fn) {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', fn);
		} else {
			fn();
		}
	}

	function restBase() {
		if (window.webinoCoffeeSearch && window.webinoCoffeeSearch.rest) {
			return String(window.webinoCoffeeSearch.rest);
		}
		return '';
	}

	function paramsFromForm(form, page) {
		var data = new FormData(form);
		var out = {
			bean: String(data.get('wcs_bean') || ''),
			acidity: String(data.get('wcs_acidity') || ''),
			bitterness: String(data.get('wcs_bitterness') || ''),
			caffeine: String(data.get('wcs_caffeine') || ''),
			page: String(page || 1)
		};
		return out;
	}

	function updateUrl(params) {
		try {
			var url = new URL(window.location.href);
			url.searchParams.set('wcs', '1');
			url.searchParams.set('wcs_bean', params.bean);
			url.searchParams.set('wcs_acidity', params.acidity);
			url.searchParams.set('wcs_bitterness', params.bitterness);
			url.searchParams.set('wcs_caffeine', params.caffeine);
			url.searchParams.set('wcs_page', params.page);
			window.history.replaceState({}, '', url.toString());
		} catch (e) {
			/* ignore */
		}
	}

	function run(root, page) {
		var form = root.querySelector('.wcs-form');
		var results = root.querySelector('.wcs-results');
		var endpoint = restBase();
		if (!form || !results || !endpoint) {
			return;
		}
		var params = paramsFromForm(form, page);
		params.limit = root.getAttribute('data-limit') || '12';
		params.columns = root.getAttribute('data-columns') || '4';
		var qs = new URLSearchParams(params).toString();
		root.classList.add('is-loading');
		fetch(endpoint + (endpoint.indexOf('?') === -1 ? '?' : '&') + qs, {
			credentials: 'same-origin'
		})
			.then(function (res) {
				return res.json();
			})
			.then(function (data) {
				results.innerHTML = (data && data.html) ? data.html : '';
				updateUrl(params);
				bindPages(root);
			})
			.catch(function () {
				results.innerHTML = '<p class="wcs-empty">جستجو انجام نشد. دوباره تلاش کنید.</p>';
			})
			.finally(function () {
				root.classList.remove('is-loading');
			});
	}

	function bindPages(root) {
		root.querySelectorAll('.wcs-page').forEach(function (btn) {
			btn.addEventListener('click', function () {
				run(root, btn.getAttribute('data-page') || '1');
			});
		});
	}

	ready(function () {
		document.querySelectorAll('.wcs').forEach(function (root) {
			var form = root.querySelector('.wcs-form');
			if (!form) {
				return;
			}
			form.addEventListener('submit', function (e) {
				if (!restBase()) {
					return;
				}
				e.preventDefault();
				run(root, 1);
			});
			bindPages(root);
		});
	});
})();
