(function () {
	var cfg = window.webinoMigrate || {};
	var running = false;
	var timer = null;

	function post(action, extra) {
		var body = new URLSearchParams();
		body.set('action', action);
		body.set('nonce', cfg.nonce || '');
		Object.keys(extra || {}).forEach(function (key) {
			body.set(key, extra[key]);
		});
		return fetch(cfg.ajaxUrl, {
			method: 'POST',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
			body: body.toString(),
		}).then(function (res) {
			return res.json().then(function (json) {
				return { ok: res.ok && json && json.success, json: json, status: res.status };
			});
		});
	}

	function statusLabel(status) {
		var map = {
			idle: 'آماده',
			running: 'در حال اجرا',
			paused: 'متوقف',
			failed: 'ناموفق',
			completed: 'کامل شد',
		};
		return map[status] || status || 'آماده';
	}

	function renderJob(job) {
		if (!job) return;
		var status = document.getElementById('webino-migrate-status');
		if (status) status.textContent = statusLabel(job.status);
		var err = document.getElementById('webino-migrate-error');
		if (err) err.textContent = job.last_error || '';
		var log = document.getElementById('webino-migrate-log');
		if (log && Array.isArray(job.log)) {
			log.innerHTML = '';
			job.log.forEach(function (row) {
				var li = document.createElement('li');
				li.className = 'is-' + (row.level || 'info');
				var time = document.createElement('time');
				time.textContent = row.ts || '';
				li.appendChild(time);
				li.appendChild(document.createTextNode(' ' + (row.message || '')));
				log.appendChild(li);
			});
			log.scrollTop = log.scrollHeight;
		}
		var bars = document.getElementById('webino-migrate-bars');
		if (bars && job.progress) {
			bars.textContent = '';
			var keys = Object.keys(job.progress);
			if (!keys.length) {
				var empty = document.createElement('p');
				empty.className = 'description';
				empty.textContent = 'هنوز مهاجرتی شروع نشده است.';
				bars.appendChild(empty);
			}
			keys.forEach(function (key) {
				var row = job.progress[key] || {};
				var exported = Number(row.exported || 0);
				var total = job.totals && job.totals[key] ? Number(job.totals[key]) : 0;
				var pct = total > 0 ? Math.min(100, Math.floor((exported / total) * 100)) : row.done ? 100 : 0;
				var label = (cfg.labels && cfg.labels[key]) || key;
				if (row.unsupported) label += ' (منتظر واردکننده وبینو)';
				var wrap = document.createElement('div');
				wrap.className = 'webino-migrate__bar';
				var head = document.createElement('div');
				head.className = 'webino-migrate__bar-label';
				var name = document.createElement('span');
				name.textContent = label;
				var count = document.createElement('span');
				count.textContent = exported + (total ? ' / ' + total : '');
				head.appendChild(name);
				head.appendChild(count);
				var track = document.createElement('div');
				track.className = 'webino-migrate__track';
				track.setAttribute('role', 'progressbar');
				track.setAttribute('aria-valuenow', String(pct));
				track.setAttribute('aria-valuemin', '0');
				track.setAttribute('aria-valuemax', '100');
				var fill = document.createElement('span');
				fill.style.width = pct + '%';
				track.appendChild(fill);
				wrap.appendChild(head);
				wrap.appendChild(track);
				bars.appendChild(wrap);
			});
		}
	}

	function waitFor(job) {
		if (job && job.lock_skipped) return 2000;
		var delay = Math.max(300, Number(cfg.delayMs || 400));
		if (job && job.pause_until) {
			var remain = job.pause_until * 1000 - Date.now();
			if (remain > delay) delay = Math.min(remain, 30000);
		}
		return delay;
	}

	function loop() {
		if (!running) return;
		post('webino_migrate_tick')
			.then(function (res) {
				var job = res.json && res.json.data && res.json.data.job;
				renderJob(job);
				if (!job || job.status !== 'running') {
					running = false;
					return;
				}
				timer = window.setTimeout(loop, waitFor(job));
			})
			.catch(function () {
				timer = window.setTimeout(loop, 3000);
			});
	}

	function startLoop() {
		running = true;
		if (timer) window.clearTimeout(timer);
		loop();
	}

	function setTest(message, ok) {
		var el = document.getElementById('webino-migrate-test-result');
		if (!el) return;
		el.textContent = message || '';
		el.className = 'webino-migrate__test ' + (ok ? 'is-ok' : 'is-err');
	}

	var testBtn = document.getElementById('webino-migrate-test');
	if (testBtn) testBtn.addEventListener('click', function () {
		setTest('در حال آزمایش اتصال…', true);
		post('webino_migrate_test').then(function (res) {
			if (res.ok) {
				setTest((res.json.data && res.json.data.message) || 'اتصال برقرار شد.', true);
				return;
			}
			var message = (res.json && res.json.data && res.json.data.message) || 'اتصال ناموفق بود.';
			setTest(message, false);
		});
	});

	var startBtn = document.getElementById('webino-migrate-start');
	if (startBtn) startBtn.addEventListener('click', function () {
		if (!window.confirm('مهاجرت از ابتدا شروع شود؟ پیشرفت قبلی این کار پاک می‌شود.')) return;
		post('webino_migrate_start', { resume: '0' }).then(function (res) {
			if (!res.ok) {
				window.alert((res.json && res.json.data && res.json.data.message) || 'شروع ناموفق بود.');
				return;
			}
			renderJob(res.json.data.job);
			startLoop();
		});
	});

	var resumeBtn = document.getElementById('webino-migrate-resume');
	if (resumeBtn) resumeBtn.addEventListener('click', function () {
		post('webino_migrate_start', { resume: '1' }).then(function (res) {
			if (!res.ok) {
				window.alert((res.json && res.json.data && res.json.data.message) || 'ادامه ناموفق بود.');
				return;
			}
			renderJob(res.json.data.job);
			startLoop();
		});
	});

	var pauseBtn = document.getElementById('webino-migrate-pause');
	if (pauseBtn) pauseBtn.addEventListener('click', function () {
		running = false;
		if (timer) window.clearTimeout(timer);
		post('webino_migrate_pause').then(function (res) {
			if (res.ok) renderJob(res.json.data.job);
		});
	});

	var resetBtn = document.getElementById('webino-migrate-reset');
	if (resetBtn) resetBtn.addEventListener('click', function () {
		if (!window.confirm('وضعیت مهاجرت پاک شود؟')) return;
		running = false;
		if (timer) window.clearTimeout(timer);
		post('webino_migrate_reset').then(function (res) {
			if (res.ok) renderJob(res.json.data.job);
		});
	});

	post('webino_migrate_status').then(function (res) {
		if (!res.ok) return;
		var job = res.json.data && res.json.data.job;
		renderJob(job);
		if (job && job.status === 'running') startLoop();
	});
})();
