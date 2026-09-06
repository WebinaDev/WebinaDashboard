(function () {
	'use strict';

	function paths() {
		return (window.webinoCoffeeCardFlags && window.webinoCoffeeCardFlags.paths) || {};
	}

	function normalize(path) {
		if (!path) {
			return '';
		}
		try {
			path = decodeURI(path);
		} catch (e) {
			/* keep encoded */
		}
		return String(path).replace(/\/+$/, '') || '/';
	}

	function flagsForHref(href) {
		var lookup = paths();
		if (!href || !lookup) {
			return '';
		}
		var pathname;
		try {
			pathname = new URL(href, window.location.href).pathname;
		} catch (e) {
			return '';
		}
		var key = normalize(pathname);
		if (lookup[key]) {
			return lookup[key];
		}
		if (lookup[pathname]) {
			return lookup[pathname];
		}
		if (lookup[key + '/']) {
			return lookup[key + '/'];
		}
		return '';
	}

	function inject(root) {
		if (!root || !root.querySelectorAll) {
			return;
		}
		var nodes = root.querySelectorAll('.product-card-wrapper .product-card--image');
		Array.prototype.forEach.call(nodes, function (el) {
			if (el.querySelector('.wcp-card-flags')) {
				return;
			}
			var a = el.querySelector('a[href]');
			if (!a) {
				return;
			}
			var html = flagsForHref(a.getAttribute('href'));
			if (!html) {
				return;
			}
			el.insertAdjacentHTML('beforeend', html);
		});
	}

	function ready(fn) {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', fn);
		} else {
			fn();
		}
	}

	ready(function () {
		inject(document);
		if (!window.MutationObserver || !document.body) {
			return;
		}
		var timer;
		var obs = new MutationObserver(function () {
			window.clearTimeout(timer);
			timer = window.setTimeout(function () {
				inject(document);
			}, 80);
		});
		obs.observe(document.body, { childList: true, subtree: true });
	});
})();
