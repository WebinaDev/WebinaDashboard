import { useMutation as e, useQuery as t, useQueryClient as n } from "@tanstack/react-query";
import * as r from "react";
import i, { createContext as a, createElement as o, forwardRef as s, useContext as c, useEffect as l, useLayoutEffect as u, useMemo as d, useRef as f, useState as p } from "react";
import { useTranslation as m } from "react-i18next";
import * as h from "react-dom";
import g from "react-dom";
import { Fragment as _, jsx as v, jsxs as y } from "react/jsx-runtime";
import b from "i18next";
import { Link as x, NavLink as S, useLocation as C } from "react-router-dom";
import { toast as w } from "sonner";
//#region \0rolldown/runtime.js
var T = Object.create, E = Object.defineProperty, ee = Object.getOwnPropertyDescriptor, D = Object.getOwnPropertyNames, te = Object.getPrototypeOf, O = Object.prototype.hasOwnProperty, k = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), A = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = D(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !O.call(e, s) && s !== n && E(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = ee(t, s)) || r.enumerable
	});
	return e;
}, j = (e, t, n) => (n = e == null ? {} : T(te(e)), A(t || !e || !e.__esModule ? E(n, "default", {
	value: e,
	enumerable: !0
}) : n, e)), M = /* @__PURE__ */ k(((e, t) => {
	(function(n, r) {
		typeof e == "object" && t !== void 0 ? t.exports = r() : typeof define == "function" && define.amd ? define(r) : (n = typeof globalThis < "u" ? globalThis : n || self).dayjs = r();
	})(e, (function() {
		var e = 1e3, t = 6e4, n = 36e5, r = "millisecond", i = "second", a = "minute", o = "hour", s = "day", c = "week", l = "month", u = "quarter", d = "year", f = "date", p = "Invalid Date", m = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, h = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, g = {
			name: "en",
			weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
			months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
			ordinal: function(e) {
				var t = [
					"th",
					"st",
					"nd",
					"rd"
				], n = e % 100;
				return "[" + e + (t[(n - 20) % 10] || t[n] || t[0]) + "]";
			}
		}, _ = function(e, t, n) {
			var r = String(e);
			return !r || r.length >= t ? e : "" + Array(t + 1 - r.length).join(n) + e;
		}, v = {
			s: _,
			z: function(e) {
				var t = -e.utcOffset(), n = Math.abs(t), r = Math.floor(n / 60), i = n % 60;
				return (t <= 0 ? "+" : "-") + _(r, 2, "0") + ":" + _(i, 2, "0");
			},
			m: function e(t, n) {
				if (t.date() < n.date()) return -e(n, t);
				var r = 12 * (n.year() - t.year()) + (n.month() - t.month()), i = t.clone().add(r, l), a = n - i < 0, o = t.clone().add(r + (a ? -1 : 1), l);
				return +(-(r + (n - i) / (a ? i - o : o - i)) || 0);
			},
			a: function(e) {
				return e < 0 ? Math.ceil(e) || 0 : Math.floor(e);
			},
			p: function(e) {
				return {
					M: l,
					y: d,
					w: c,
					d: s,
					D: f,
					h: o,
					m: a,
					s: i,
					ms: r,
					Q: u
				}[e] || String(e || "").toLowerCase().replace(/s$/, "");
			},
			u: function(e) {
				return e === void 0;
			}
		}, y = "en", b = {};
		b[y] = g;
		var x = "$isDayjsObject", S = function(e) {
			return e instanceof E || !(!e || !e[x]);
		}, C = function e(t, n, r) {
			var i;
			if (!t) return y;
			if (typeof t == "string") {
				var a = t.toLowerCase();
				b[a] && (i = a), n && (b[a] = n, i = a);
				var o = t.split("-");
				if (!i && o.length > 1) return e(o[0]);
			} else {
				var s = t.name;
				b[s] = t, i = s;
			}
			return !r && i && (y = i), i || !r && y;
		}, w = function(e, t) {
			if (S(e)) return e.clone();
			var n = typeof t == "object" ? t : {};
			return n.date = e, n.args = arguments, new E(n);
		}, T = v;
		T.l = C, T.i = S, T.w = function(e, t) {
			return w(e, {
				locale: t.$L,
				utc: t.$u,
				x: t.$x,
				$offset: t.$offset
			});
		};
		var E = function() {
			function g(e) {
				this.$L = C(e.locale, null, !0), this.parse(e), this.$x = this.$x || e.x || {}, this[x] = !0;
			}
			var _ = g.prototype;
			return _.parse = function(e) {
				this.$d = function(e) {
					var t = e.date, n = e.utc;
					if (t === null) return /* @__PURE__ */ new Date(NaN);
					if (T.u(t)) return /* @__PURE__ */ new Date();
					if (t instanceof Date) return new Date(t);
					if (typeof t == "string" && !/Z$/i.test(t)) {
						var r = t.match(m);
						if (r) {
							var i = r[2] - 1 || 0, a = (r[7] || "0").substring(0, 3);
							return n ? new Date(Date.UTC(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, a)) : new Date(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, a);
						}
					}
					return new Date(t);
				}(e), this.init();
			}, _.init = function() {
				var e = this.$d;
				this.$y = e.getFullYear(), this.$M = e.getMonth(), this.$D = e.getDate(), this.$W = e.getDay(), this.$H = e.getHours(), this.$m = e.getMinutes(), this.$s = e.getSeconds(), this.$ms = e.getMilliseconds();
			}, _.$utils = function() {
				return T;
			}, _.isValid = function() {
				return this.$d.toString() !== p;
			}, _.isSame = function(e, t) {
				var n = w(e);
				return this.startOf(t) <= n && n <= this.endOf(t);
			}, _.isAfter = function(e, t) {
				return w(e) < this.startOf(t);
			}, _.isBefore = function(e, t) {
				return this.endOf(t) < w(e);
			}, _.$g = function(e, t, n) {
				return T.u(e) ? this[t] : this.set(n, e);
			}, _.unix = function() {
				return Math.floor(this.valueOf() / 1e3);
			}, _.valueOf = function() {
				return this.$d.getTime();
			}, _.startOf = function(e, t) {
				var n = this, r = !!T.u(t) || t, u = T.p(e), p = function(e, t) {
					var i = T.w(n.$u ? Date.UTC(n.$y, t, e) : new Date(n.$y, t, e), n);
					return r ? i : i.endOf(s);
				}, m = function(e, t) {
					return T.w(n.toDate()[e].apply(n.toDate("s"), (r ? [
						0,
						0,
						0,
						0
					] : [
						23,
						59,
						59,
						999
					]).slice(t)), n);
				}, h = this.$W, g = this.$M, _ = this.$D, v = "set" + (this.$u ? "UTC" : "");
				switch (u) {
					case d: return r ? p(1, 0) : p(31, 11);
					case l: return r ? p(1, g) : p(0, g + 1);
					case c:
						var y = this.$locale().weekStart || 0, b = (h < y ? h + 7 : h) - y;
						return p(r ? _ - b : _ + (6 - b), g);
					case s:
					case f: return m(v + "Hours", 0);
					case o: return m(v + "Minutes", 1);
					case a: return m(v + "Seconds", 2);
					case i: return m(v + "Milliseconds", 3);
					default: return this.clone();
				}
			}, _.endOf = function(e) {
				return this.startOf(e, !1);
			}, _.$set = function(e, t) {
				var n, c = T.p(e), u = "set" + (this.$u ? "UTC" : ""), p = (n = {}, n[s] = u + "Date", n[f] = u + "Date", n[l] = u + "Month", n[d] = u + "FullYear", n[o] = u + "Hours", n[a] = u + "Minutes", n[i] = u + "Seconds", n[r] = u + "Milliseconds", n)[c], m = c === s ? this.$D + (t - this.$W) : t;
				if (c === l || c === d) {
					var h = this.clone().set(f, 1);
					h.$d[p](m), h.init(), this.$d = h.set(f, Math.min(this.$D, h.daysInMonth())).$d;
				} else p && this.$d[p](m);
				return this.init(), this;
			}, _.set = function(e, t) {
				return this.clone().$set(e, t);
			}, _.get = function(e) {
				return this[T.p(e)]();
			}, _.add = function(r, u) {
				var f, p = this;
				r = Number(r);
				var m = T.p(u), h = function(e) {
					var t = w(p);
					return T.w(t.date(t.date() + Math.round(e * r)), p);
				};
				if (m === l) return this.set(l, this.$M + r);
				if (m === d) return this.set(d, this.$y + r);
				if (m === s) return h(1);
				if (m === c) return h(7);
				var g = (f = {}, f[a] = t, f[o] = n, f[i] = e, f)[m] || 1, _ = this.$d.getTime() + r * g;
				return T.w(_, this);
			}, _.subtract = function(e, t) {
				return this.add(-1 * e, t);
			}, _.format = function(e) {
				var t = this, n = this.$locale();
				if (!this.isValid()) return n.invalidDate || p;
				var r = e || "YYYY-MM-DDTHH:mm:ssZ", i = T.z(this), a = this.$H, o = this.$m, s = this.$M, c = n.weekdays, l = n.months, u = n.meridiem, d = function(e, n, i, a) {
					return e && (e[n] || e(t, r)) || i[n].slice(0, a);
				}, f = function(e) {
					return T.s(a % 12 || 12, e, "0");
				}, m = u || function(e, t, n) {
					var r = e < 12 ? "AM" : "PM";
					return n ? r.toLowerCase() : r;
				};
				return r.replace(h, (function(e, r) {
					return r || function(e) {
						switch (e) {
							case "YY": return String(t.$y).slice(-2);
							case "YYYY": return T.s(t.$y, 4, "0");
							case "M": return s + 1;
							case "MM": return T.s(s + 1, 2, "0");
							case "MMM": return d(n.monthsShort, s, l, 3);
							case "MMMM": return d(l, s);
							case "D": return t.$D;
							case "DD": return T.s(t.$D, 2, "0");
							case "d": return String(t.$W);
							case "dd": return d(n.weekdaysMin, t.$W, c, 2);
							case "ddd": return d(n.weekdaysShort, t.$W, c, 3);
							case "dddd": return c[t.$W];
							case "H": return String(a);
							case "HH": return T.s(a, 2, "0");
							case "h": return f(1);
							case "hh": return f(2);
							case "a": return m(a, o, !0);
							case "A": return m(a, o, !1);
							case "m": return String(o);
							case "mm": return T.s(o, 2, "0");
							case "s": return String(t.$s);
							case "ss": return T.s(t.$s, 2, "0");
							case "SSS": return T.s(t.$ms, 3, "0");
							case "Z": return i;
						}
						return null;
					}(e) || i.replace(":", "");
				}));
			}, _.utcOffset = function() {
				return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
			}, _.diff = function(r, f, p) {
				var m, h = this, g = T.p(f), _ = w(r), v = (_.utcOffset() - this.utcOffset()) * t, y = this - _, b = function() {
					return T.m(h, _);
				};
				switch (g) {
					case d:
						m = b() / 12;
						break;
					case l:
						m = b();
						break;
					case u:
						m = b() / 3;
						break;
					case c:
						m = (y - v) / 6048e5;
						break;
					case s:
						m = (y - v) / 864e5;
						break;
					case o:
						m = y / n;
						break;
					case a:
						m = y / t;
						break;
					case i:
						m = y / e;
						break;
					default: m = y;
				}
				return p ? m : T.a(m);
			}, _.daysInMonth = function() {
				return this.endOf(l).$D;
			}, _.$locale = function() {
				return b[this.$L];
			}, _.locale = function(e, t) {
				if (!e) return this.$L;
				var n = this.clone(), r = C(e, t, !0);
				return r && (n.$L = r), n;
			}, _.clone = function() {
				return T.w(this.$d, this);
			}, _.toDate = function() {
				return new Date(this.valueOf());
			}, _.toJSON = function() {
				return this.isValid() ? this.toISOString() : null;
			}, _.toISOString = function() {
				return this.$d.toISOString();
			}, _.toString = function() {
				return this.$d.toUTCString();
			}, g;
		}(), ee = E.prototype;
		return w.prototype = ee, [
			["$ms", r],
			["$s", i],
			["$m", a],
			["$H", o],
			["$W", s],
			["$M", l],
			["$y", d],
			["$D", f]
		].forEach((function(e) {
			ee[e[1]] = function(t) {
				return this.$g(t, e[0], e[1]);
			};
		})), w.extend = function(e, t) {
			return e.$i || (e(t, E, w), e.$i = !0), w;
		}, w.locale = C, w.isDayjs = S, w.unix = function(e) {
			return w(1e3 * e);
		}, w.en = b[y], w.Ls = b, w.p = {}, w;
	}));
})), ne = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), N = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), re = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), ie = (e) => {
	let t = re(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, ae = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, oe = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, P = a({}), F = () => c(P), se = s(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: a, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = F() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return o("svg", {
		ref: l,
		...ae,
		width: t ?? u ?? ae.width,
		height: t ?? u ?? ae.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: ne("lucide", m, i),
		...!a && !oe(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => o(e, t)), ...Array.isArray(a) ? a : [a]]);
}), I = (e, t) => {
	let n = s(({ className: n, ...r }, i) => o(se, {
		ref: i,
		iconNode: t,
		className: ne(`lucide-${N(ie(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = ie(e), n;
}, L = I("building-2", [
	["path", {
		d: "M10 12h4",
		key: "a56b0p"
	}],
	["path", {
		d: "M10 8h4",
		key: "1sr2af"
	}],
	["path", {
		d: "M14 21v-3a2 2 0 0 0-4 0v3",
		key: "1rgiei"
	}],
	["path", {
		d: "M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2",
		key: "secmi2"
	}],
	["path", {
		d: "M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16",
		key: "16ra0t"
	}]
]), ce = I("calendar", [
	["path", {
		d: "M8 2v4",
		key: "1cmpym"
	}],
	["path", {
		d: "M16 2v4",
		key: "4m81vk"
	}],
	["rect", {
		width: "18",
		height: "18",
		x: "3",
		y: "4",
		rx: "2",
		key: "1hopcy"
	}],
	["path", {
		d: "M3 10h18",
		key: "8toen8"
	}]
]), le = I("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]), ue = I("chevron-down", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]), de = I("chevron-left", [["path", {
	d: "m15 18-6-6 6-6",
	key: "1wnfg3"
}]]), fe = I("chevron-right", [["path", {
	d: "m9 18 6-6-6-6",
	key: "mthhwq"
}]]), pe = I("chevron-up", [["path", {
	d: "m18 15-6-6-6 6",
	key: "153udz"
}]]), me = I("megaphone", [
	["path", {
		d: "M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",
		key: "q8bfy3"
	}],
	["path", {
		d: "M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14",
		key: "1853fq"
	}],
	["path", {
		d: "M8 6v8",
		key: "15ugcq"
	}]
]), he = I("message-square", [["path", {
	d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
	key: "18887p"
}]]), ge = I("puzzle", [["path", {
	d: "M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z",
	key: "w46dr5"
}]]), _e = I("scroll-text", [
	["path", {
		d: "M15 12h-5",
		key: "r7krc0"
	}],
	["path", {
		d: "M15 8h-5",
		key: "1khuty"
	}],
	["path", {
		d: "M19 17V5a2 2 0 0 0-2-2H4",
		key: "zz82l3"
	}],
	["path", {
		d: "M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3",
		key: "1ph1d7"
	}]
]), ve = I("settings", [["path", {
	d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
	key: "1i5ecw"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "3",
	key: "1v7zrd"
}]]), ye = I("store", [
	["path", {
		d: "M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5",
		key: "slp6dd"
	}],
	["path", {
		d: "M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244",
		key: "o0xfot"
	}],
	["path", {
		d: "M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05",
		key: "wn3emo"
	}]
]), be = I("users", [
	["path", {
		d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
		key: "1yyitq"
	}],
	["path", {
		d: "M16 3.128a4 4 0 0 1 0 7.744",
		key: "16gr8j"
	}],
	["path", {
		d: "M22 21v-2a4 4 0 0 0-3-3.87",
		key: "kshegd"
	}],
	["circle", {
		cx: "9",
		cy: "7",
		r: "4",
		key: "nufk8"
	}]
]), xe = /* @__PURE__ */ j(M(), 1);
function Se(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") if (Array.isArray(e)) {
		var i = e.length;
		for (t = 0; t < i; t++) e[t] && (n = Se(e[t])) && (r && (r += " "), r += n);
	} else for (n in e) e[n] && (r && (r += " "), r += n);
	return r;
}
function Ce() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Se(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/class-variance-authority/dist/index.mjs
var we = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, Te = Ce, Ee = (e, t) => (n) => {
	if (t?.variants == null) return Te(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = we(t) || we(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return Te(e, a, t?.compoundVariants?.reduce((e, t) => {
		let { class: n, className: r, ...a } = t;
		return Object.entries(a).every((e) => {
			let [t, n] = e;
			return Array.isArray(n) ? n.includes({
				...i,
				...o
			}[t]) : {
				...i,
				...o
			}[t] === n;
		}) ? [
			...e,
			n,
			r
		] : e;
	}, []), n?.class, n?.className);
};
//#endregion
//#region node_modules/@radix-ui/react-compose-refs/dist/index.mjs
function De(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function Oe(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = De(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : De(e[t], null);
			}
		};
	};
}
function R(...e) {
	return r.useCallback(Oe(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function ke(e) {
	let t = /* @__PURE__ */ Ae(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Me);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ v(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ v(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function Ae(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Pe(n), a = Ne(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? Oe(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var je = Symbol("radix.slottable");
function Me(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === je;
}
function Ne(e, t) {
	let n = { ...t };
	for (let r in t) {
		let i = e[r], a = t[r];
		/^on[A-Z]/.test(r) ? i && a ? n[r] = (...e) => {
			let t = a(...e);
			return i(...e), t;
		} : i && (n[r] = i) : r === "style" ? n[r] = {
			...i,
			...a
		} : r === "className" && (n[r] = [i, a].filter(Boolean).join(" "));
	}
	return {
		...e,
		...n
	};
}
function Pe(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/dist/index.mjs
var z = [
	"a",
	"button",
	"div",
	"form",
	"h2",
	"h3",
	"img",
	"input",
	"label",
	"li",
	"nav",
	"ol",
	"p",
	"select",
	"span",
	"svg",
	"ul"
].reduce((e, t) => {
	let n = /* @__PURE__ */ ke(`Primitive.${t}`), i = r.forwardRef((e, r) => {
		let { asChild: i, ...a } = e, o = i ? n : t;
		return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ v(o, {
			...a,
			ref: r
		});
	});
	return i.displayName = `Primitive.${t}`, {
		...e,
		[t]: i
	};
}, {});
function Fe(e, t) {
	e && h.flushSync(() => e.dispatchEvent(t));
}
//#endregion
//#region node_modules/@radix-ui/react-visually-hidden/dist/index.mjs
var Ie = Object.freeze({
	position: "absolute",
	border: 0,
	width: 1,
	height: 1,
	padding: 0,
	margin: -1,
	overflow: "hidden",
	clip: "rect(0, 0, 0, 0)",
	whiteSpace: "nowrap",
	wordWrap: "normal"
}), Le = "VisuallyHidden", Re = r.forwardRef((e, t) => /* @__PURE__ */ v(z.span, {
	...e,
	ref: t,
	style: {
		...Ie,
		...e.style
	}
}));
Re.displayName = Le;
//#endregion
//#region node_modules/@radix-ui/react-context/dist/index.mjs
function ze(e, t = []) {
	let n = [];
	function i(t, i) {
		let a = r.createContext(i), o = n.length;
		n = [...n, i];
		let s = (t) => {
			let { scope: n, children: i, ...s } = t, c = n?.[e]?.[o] || a, l = r.useMemo(() => s, Object.values(s));
			return /* @__PURE__ */ v(c.Provider, {
				value: l,
				children: i
			});
		};
		s.displayName = t + "Provider";
		function c(n, s) {
			let c = s?.[e]?.[o] || a, l = r.useContext(c);
			if (l) return l;
			if (i !== void 0) return i;
			throw Error(`\`${n}\` must be used within \`${t}\``);
		}
		return [s, c];
	}
	let a = () => {
		let t = n.map((e) => r.createContext(e));
		return function(n) {
			let i = n?.[e] || t;
			return r.useMemo(() => ({ [`__scope${e}`]: {
				...n,
				[e]: i
			} }), [n, i]);
		};
	};
	return a.scopeName = e, [i, Be(a, ...t)];
}
function Be(...e) {
	let t = e[0];
	if (e.length === 1) return t;
	let n = () => {
		let n = e.map((e) => ({
			useScope: e(),
			scopeName: e.scopeName
		}));
		return function(e) {
			let i = n.reduce((t, { useScope: n, scopeName: r }) => {
				let i = n(e)[`__scope${r}`];
				return {
					...t,
					...i
				};
			}, {});
			return r.useMemo(() => ({ [`__scope${t.scopeName}`]: i }), [i]);
		};
	};
	return n.scopeName = t.scopeName, n;
}
//#endregion
//#region node_modules/@radix-ui/react-collection/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function Ve(e) {
	let t = /* @__PURE__ */ He(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(We);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ v(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ v(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function He(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Ke(n), a = Ge(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? Oe(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Ue = Symbol("radix.slottable");
function We(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Ue;
}
function Ge(e, t) {
	let n = { ...t };
	for (let r in t) {
		let i = e[r], a = t[r];
		/^on[A-Z]/.test(r) ? i && a ? n[r] = (...e) => {
			let t = a(...e);
			return i(...e), t;
		} : i && (n[r] = i) : r === "style" ? n[r] = {
			...i,
			...a
		} : r === "className" && (n[r] = [i, a].filter(Boolean).join(" "));
	}
	return {
		...e,
		...n
	};
}
function Ke(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function qe(e) {
	let t = e + "CollectionProvider", [n, r] = ze(t), [a, o] = n(t, {
		collectionRef: { current: null },
		itemMap: /* @__PURE__ */ new Map()
	}), s = (e) => {
		let { scope: t, children: n } = e, r = i.useRef(null), o = i.useRef(/* @__PURE__ */ new Map()).current;
		return /* @__PURE__ */ v(a, {
			scope: t,
			itemMap: o,
			collectionRef: r,
			children: n
		});
	};
	s.displayName = t;
	let c = e + "CollectionSlot", l = /* @__PURE__ */ Ve(c), u = i.forwardRef((e, t) => {
		let { scope: n, children: r } = e;
		return /* @__PURE__ */ v(l, {
			ref: R(t, o(c, n).collectionRef),
			children: r
		});
	});
	u.displayName = c;
	let d = e + "CollectionItemSlot", f = "data-radix-collection-item", p = /* @__PURE__ */ Ve(d), m = i.forwardRef((e, t) => {
		let { scope: n, children: r, ...a } = e, s = i.useRef(null), c = R(t, s), l = o(d, n);
		return i.useEffect(() => (l.itemMap.set(s, {
			ref: s,
			...a
		}), () => void l.itemMap.delete(s))), /* @__PURE__ */ v(p, {
			[f]: "",
			ref: c,
			children: r
		});
	});
	m.displayName = d;
	function h(t) {
		let n = o(e + "CollectionConsumer", t);
		return i.useCallback(() => {
			let e = n.collectionRef.current;
			if (!e) return [];
			let t = Array.from(e.querySelectorAll(`[${f}]`));
			return Array.from(n.itemMap.values()).sort((e, n) => t.indexOf(e.ref.current) - t.indexOf(n.ref.current));
		}, [n.collectionRef, n.itemMap]);
	}
	return [
		{
			Provider: s,
			Slot: u,
			ItemSlot: m
		},
		h,
		r
	];
}
typeof window < "u" && window.document && window.document.createElement;
function B(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var V = globalThis?.document ? r.useLayoutEffect : () => {}, Je = r.useInsertionEffect || V;
function Ye({ prop: e, defaultProp: t, onChange: n = () => {}, caller: i }) {
	let [a, o, s] = Xe({
		defaultProp: t,
		onChange: n
	}), c = e !== void 0, l = c ? e : a;
	{
		let t = r.useRef(e !== void 0);
		r.useEffect(() => {
			let e = t.current;
			e !== c && console.warn(`${i} is changing from ${e ? "controlled" : "uncontrolled"} to ${c ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`), t.current = c;
		}, [c, i]);
	}
	return [l, r.useCallback((t) => {
		if (c) {
			let n = Ze(t) ? t(e) : t;
			n !== e && s.current?.(n);
		} else o(t);
	}, [
		c,
		e,
		o,
		s
	])];
}
function Xe({ defaultProp: e, onChange: t }) {
	let [n, i] = r.useState(e), a = r.useRef(n), o = r.useRef(t);
	return Je(() => {
		o.current = t;
	}, [t]), r.useEffect(() => {
		a.current !== n && (o.current?.(n), a.current = n);
	}, [n, a]), [
		n,
		i,
		o
	];
}
function Ze(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/@radix-ui/react-presence/dist/index.mjs
function Qe(e, t) {
	return r.useReducer((e, n) => t[e][n] ?? e, e);
}
var $e = (e) => {
	let { present: t, children: n } = e, i = et(t), a = typeof n == "function" ? n({ present: i.isPresent }) : r.Children.only(n), o = R(i.ref, nt(a));
	return typeof n == "function" || i.isPresent ? r.cloneElement(a, { ref: o }) : null;
};
$e.displayName = "Presence";
function et(e) {
	let [t, n] = r.useState(), i = r.useRef(null), a = r.useRef(e), o = r.useRef("none"), [s, c] = Qe(e ? "mounted" : "unmounted", {
		mounted: {
			UNMOUNT: "unmounted",
			ANIMATION_OUT: "unmountSuspended"
		},
		unmountSuspended: {
			MOUNT: "mounted",
			ANIMATION_END: "unmounted"
		},
		unmounted: { MOUNT: "mounted" }
	});
	return r.useEffect(() => {
		let e = tt(i.current);
		o.current = s === "mounted" ? e : "none";
	}, [s]), V(() => {
		let t = i.current, n = a.current;
		if (n !== e) {
			let r = o.current, i = tt(t);
			e ? c("MOUNT") : i === "none" || t?.display === "none" ? c("UNMOUNT") : c(n && r !== i ? "ANIMATION_OUT" : "UNMOUNT"), a.current = e;
		}
	}, [e, c]), V(() => {
		if (t) {
			let e, n = t.ownerDocument.defaultView ?? window, r = (r) => {
				let o = tt(i.current).includes(CSS.escape(r.animationName));
				if (r.target === t && o && (c("ANIMATION_END"), !a.current)) {
					let r = t.style.animationFillMode;
					t.style.animationFillMode = "forwards", e = n.setTimeout(() => {
						t.style.animationFillMode === "forwards" && (t.style.animationFillMode = r);
					});
				}
			}, s = (e) => {
				e.target === t && (o.current = tt(i.current));
			};
			return t.addEventListener("animationstart", s), t.addEventListener("animationcancel", r), t.addEventListener("animationend", r), () => {
				n.clearTimeout(e), t.removeEventListener("animationstart", s), t.removeEventListener("animationcancel", r), t.removeEventListener("animationend", r);
			};
		} else c("ANIMATION_END");
	}, [t, c]), {
		isPresent: ["mounted", "unmountSuspended"].includes(s),
		ref: r.useCallback((e) => {
			i.current = e ? getComputedStyle(e) : null, n(e);
		}, [])
	};
}
function tt(e) {
	return e?.animationName || "none";
}
function nt(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-id/dist/index.mjs
var rt = r.useId || (() => void 0), it = 0;
function at(e) {
	let [t, n] = r.useState(rt());
	return V(() => {
		e || n((e) => e ?? String(it++));
	}, [e]), e || (t ? `radix-${t}` : "");
}
//#endregion
//#region node_modules/@radix-ui/react-direction/dist/index.mjs
var ot = r.createContext(void 0);
function st(e) {
	let t = r.useContext(ot);
	return e || t || "ltr";
}
//#endregion
//#region node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
function ct(e) {
	let t = r.useRef(e);
	return r.useEffect(() => {
		t.current = e;
	}), r.useMemo(() => (...e) => t.current?.(...e), []);
}
//#endregion
//#region node_modules/@radix-ui/react-use-escape-keydown/dist/index.mjs
function lt(e, t = globalThis?.document) {
	let n = ct(e);
	r.useEffect(() => {
		let e = (e) => {
			e.key === "Escape" && n(e);
		};
		return t.addEventListener("keydown", e, { capture: !0 }), () => t.removeEventListener("keydown", e, { capture: !0 });
	}, [n, t]);
}
//#endregion
//#region node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var ut = "DismissableLayer", dt = "dismissableLayer.update", ft = "dismissableLayer.pointerDownOutside", pt = "dismissableLayer.focusOutside", mt, ht = r.createContext({
	layers: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), gt = r.forwardRef((e, t) => {
	let { disableOutsidePointerEvents: n = !1, onEscapeKeyDown: i, onPointerDownOutside: a, onFocusOutside: o, onInteractOutside: s, onDismiss: c, ...l } = e, u = r.useContext(ht), [d, f] = r.useState(null), p = d?.ownerDocument ?? globalThis?.document, [, m] = r.useState({}), h = R(t, (e) => f(e)), g = Array.from(u.layers), [_] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1), y = g.indexOf(_), b = d ? g.indexOf(d) : -1, x = u.layersWithOutsidePointerEventsDisabled.size > 0, S = b >= y, C = yt((e) => {
		let t = e.target, n = [...u.branches].some((e) => e.contains(t));
		!S || n || (a?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p), w = bt((e) => {
		let t = e.target;
		[...u.branches].some((e) => e.contains(t)) || (o?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p);
	return lt((e) => {
		b === u.layers.size - 1 && (i?.(e), !e.defaultPrevented && c && (e.preventDefault(), c()));
	}, p), r.useEffect(() => {
		if (d) return n && (u.layersWithOutsidePointerEventsDisabled.size === 0 && (mt = p.body.style.pointerEvents, p.body.style.pointerEvents = "none"), u.layersWithOutsidePointerEventsDisabled.add(d)), u.layers.add(d), xt(), () => {
			n && u.layersWithOutsidePointerEventsDisabled.size === 1 && (p.body.style.pointerEvents = mt);
		};
	}, [
		d,
		p,
		n,
		u
	]), r.useEffect(() => () => {
		d && (u.layers.delete(d), u.layersWithOutsidePointerEventsDisabled.delete(d), xt());
	}, [d, u]), r.useEffect(() => {
		let e = () => m({});
		return document.addEventListener(dt, e), () => document.removeEventListener(dt, e);
	}, []), /* @__PURE__ */ v(z.div, {
		...l,
		ref: h,
		style: {
			pointerEvents: x ? S ? "auto" : "none" : void 0,
			...e.style
		},
		onFocusCapture: B(e.onFocusCapture, w.onFocusCapture),
		onBlurCapture: B(e.onBlurCapture, w.onBlurCapture),
		onPointerDownCapture: B(e.onPointerDownCapture, C.onPointerDownCapture)
	});
});
gt.displayName = ut;
var _t = "DismissableLayerBranch", vt = r.forwardRef((e, t) => {
	let n = r.useContext(ht), i = r.useRef(null), a = R(t, i);
	return r.useEffect(() => {
		let e = i.current;
		if (e) return n.branches.add(e), () => {
			n.branches.delete(e);
		};
	}, [n.branches]), /* @__PURE__ */ v(z.div, {
		...e,
		ref: a
	});
});
vt.displayName = _t;
function yt(e, t = globalThis?.document) {
	let n = ct(e), i = r.useRef(!1), a = r.useRef(() => {});
	return r.useEffect(() => {
		let e = (e) => {
			if (e.target && !i.current) {
				let r = function() {
					St(ft, n, i, { discrete: !0 });
				}, i = { originalEvent: e };
				e.pointerType === "touch" ? (t.removeEventListener("click", a.current), a.current = r, t.addEventListener("click", a.current, { once: !0 })) : r();
			} else t.removeEventListener("click", a.current);
			i.current = !1;
		}, r = window.setTimeout(() => {
			t.addEventListener("pointerdown", e);
		}, 0);
		return () => {
			window.clearTimeout(r), t.removeEventListener("pointerdown", e), t.removeEventListener("click", a.current);
		};
	}, [t, n]), { onPointerDownCapture: () => i.current = !0 };
}
function bt(e, t = globalThis?.document) {
	let n = ct(e), i = r.useRef(!1);
	return r.useEffect(() => {
		let e = (e) => {
			e.target && !i.current && St(pt, n, { originalEvent: e }, { discrete: !1 });
		};
		return t.addEventListener("focusin", e), () => t.removeEventListener("focusin", e);
	}, [t, n]), {
		onFocusCapture: () => i.current = !0,
		onBlurCapture: () => i.current = !1
	};
}
function xt() {
	let e = new CustomEvent(dt);
	document.dispatchEvent(e);
}
function St(e, t, n, { discrete: r }) {
	let i = n.originalEvent.target, a = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && i.addEventListener(e, t, { once: !0 }), r ? Fe(i, a) : i.dispatchEvent(a);
}
//#endregion
//#region node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var Ct = "focusScope.autoFocusOnMount", wt = "focusScope.autoFocusOnUnmount", Tt = {
	bubbles: !1,
	cancelable: !0
}, Et = "FocusScope", Dt = r.forwardRef((e, t) => {
	let { loop: n = !1, trapped: i = !1, onMountAutoFocus: a, onUnmountAutoFocus: o, ...s } = e, [c, l] = r.useState(null), u = ct(a), d = ct(o), f = r.useRef(null), p = R(t, (e) => l(e)), m = r.useRef({
		paused: !1,
		pause() {
			this.paused = !0;
		},
		resume() {
			this.paused = !1;
		}
	}).current;
	r.useEffect(() => {
		if (i) {
			let e = function(e) {
				if (m.paused || !c) return;
				let t = e.target;
				c.contains(t) ? f.current = t : Pt(f.current, { select: !0 });
			}, t = function(e) {
				if (m.paused || !c) return;
				let t = e.relatedTarget;
				t !== null && (c.contains(t) || Pt(f.current, { select: !0 }));
			}, n = function(e) {
				if (document.activeElement === document.body) for (let t of e) t.removedNodes.length > 0 && Pt(c);
			};
			document.addEventListener("focusin", e), document.addEventListener("focusout", t);
			let r = new MutationObserver(n);
			return c && r.observe(c, {
				childList: !0,
				subtree: !0
			}), () => {
				document.removeEventListener("focusin", e), document.removeEventListener("focusout", t), r.disconnect();
			};
		}
	}, [
		i,
		c,
		m.paused
	]), r.useEffect(() => {
		if (c) {
			Ft.add(m);
			let e = document.activeElement;
			if (!c.contains(e)) {
				let t = new CustomEvent(Ct, Tt);
				c.addEventListener(Ct, u), c.dispatchEvent(t), t.defaultPrevented || (Ot(Rt(At(c)), { select: !0 }), document.activeElement === e && Pt(c));
			}
			return () => {
				c.removeEventListener(Ct, u), setTimeout(() => {
					let t = new CustomEvent(wt, Tt);
					c.addEventListener(wt, d), c.dispatchEvent(t), t.defaultPrevented || Pt(e ?? document.body, { select: !0 }), c.removeEventListener(wt, d), Ft.remove(m);
				}, 0);
			};
		}
	}, [
		c,
		u,
		d,
		m
	]);
	let h = r.useCallback((e) => {
		if (!n && !i || m.paused) return;
		let t = e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey, r = document.activeElement;
		if (t && r) {
			let t = e.currentTarget, [i, a] = kt(t);
			i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n && Pt(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n && Pt(a, { select: !0 })) : r === t && e.preventDefault();
		}
	}, [
		n,
		i,
		m.paused
	]);
	return /* @__PURE__ */ v(z.div, {
		tabIndex: -1,
		...s,
		ref: p,
		onKeyDown: h
	});
});
Dt.displayName = Et;
function Ot(e, { select: t = !1 } = {}) {
	let n = document.activeElement;
	for (let r of e) if (Pt(r, { select: t }), document.activeElement !== n) return;
}
function kt(e) {
	let t = At(e);
	return [jt(t, e), jt(t.reverse(), e)];
}
function At(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t;
}
function jt(e, t) {
	for (let n of e) if (!Mt(n, { upTo: t })) return n;
}
function Mt(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function Nt(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function Pt(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = document.activeElement;
		e.focus({ preventScroll: !0 }), e !== n && Nt(e) && t && e.select();
	}
}
var Ft = It();
function It() {
	let e = [];
	return {
		add(t) {
			let n = e[0];
			t !== n && n?.pause(), e = Lt(e, t), e.unshift(t);
		},
		remove(t) {
			e = Lt(e, t), e[0]?.resume();
		}
	};
}
function Lt(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
function Rt(e) {
	return e.filter((e) => e.tagName !== "A");
}
//#endregion
//#region node_modules/@radix-ui/react-portal/dist/index.mjs
var zt = "Portal", Bt = r.forwardRef((e, t) => {
	let { container: n, ...i } = e, [a, o] = r.useState(!1);
	V(() => o(!0), []);
	let s = n || a && globalThis?.document?.body;
	return s ? g.createPortal(/* @__PURE__ */ v(z.div, {
		...i,
		ref: t
	}), s) : null;
});
Bt.displayName = zt;
//#endregion
//#region node_modules/@radix-ui/react-focus-guards/dist/index.mjs
var Vt = 0;
function Ht() {
	r.useEffect(() => {
		let e = document.querySelectorAll("[data-radix-focus-guard]");
		return document.body.insertAdjacentElement("afterbegin", e[0] ?? Ut()), document.body.insertAdjacentElement("beforeend", e[1] ?? Ut()), Vt++, () => {
			Vt === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((e) => e.remove()), Vt--;
		};
	}, []);
}
function Ut() {
	let e = document.createElement("span");
	return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
//#endregion
//#region node_modules/tslib/tslib.es6.mjs
var Wt = function() {
	return Wt = Object.assign || function(e) {
		for (var t, n = 1, r = arguments.length; n < r; n++) for (var i in t = arguments[n], t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
		return e;
	}, Wt.apply(this, arguments);
};
function Gt(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
function Kt(e, t, n) {
	if (n || arguments.length === 2) for (var r = 0, i = t.length, a; r < i; r++) (a || !(r in t)) && (a || (a = Array.prototype.slice.call(t, 0, r)), a[r] = t[r]);
	return e.concat(a || Array.prototype.slice.call(t));
}
//#endregion
//#region node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var qt = "right-scroll-bar-position", Jt = "width-before-scroll-bar", Yt = "with-scroll-bars-hidden", Xt = "--removed-body-scroll-bar-size";
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/assignRef.js
function Zt(e, t) {
	return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/useRef.js
function Qt(e, t) {
	var n = p(function() {
		return {
			value: e,
			callback: t,
			facade: {
				get current() {
					return n.value;
				},
				set current(e) {
					var t = n.value;
					t !== e && (n.value = e, n.callback(e, t));
				}
			}
		};
	})[0];
	return n.callback = t, n.facade;
}
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/useMergeRef.js
var $t = typeof window < "u" ? r.useLayoutEffect : r.useEffect, en = /* @__PURE__ */ new WeakMap();
function tn(e, t) {
	var n = Qt(t || null, function(t) {
		return e.forEach(function(e) {
			return Zt(e, t);
		});
	});
	return $t(function() {
		var t = en.get(n);
		if (t) {
			var r = new Set(t), i = new Set(e), a = n.current;
			r.forEach(function(e) {
				i.has(e) || Zt(e, null);
			}), i.forEach(function(e) {
				r.has(e) || Zt(e, a);
			});
		}
		en.set(n, e);
	}, [e]), n;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/medium.js
function nn(e) {
	return e;
}
function rn(e, t) {
	t === void 0 && (t = nn);
	var n = [], r = !1;
	return {
		read: function() {
			if (r) throw Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
			return n.length ? n[n.length - 1] : e;
		},
		useMedium: function(e) {
			var i = t(e, r);
			return n.push(i), function() {
				n = n.filter(function(e) {
					return e !== i;
				});
			};
		},
		assignSyncMedium: function(e) {
			for (r = !0; n.length;) {
				var t = n;
				n = [], t.forEach(e);
			}
			n = {
				push: function(t) {
					return e(t);
				},
				filter: function() {
					return n;
				}
			};
		},
		assignMedium: function(e) {
			r = !0;
			var t = [];
			if (n.length) {
				var i = n;
				n = [], i.forEach(e), t = n;
			}
			var a = function() {
				var n = t;
				t = [], n.forEach(e);
			}, o = function() {
				return Promise.resolve().then(a);
			};
			o(), n = {
				push: function(e) {
					t.push(e), o();
				},
				filter: function(e) {
					return t = t.filter(e), n;
				}
			};
		}
	};
}
function an(e) {
	e === void 0 && (e = {});
	var t = rn(null);
	return t.options = Wt({
		async: !0,
		ssr: !1
	}, e), t;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/exports.js
var on = function(e) {
	var t = e.sideCar, n = Gt(e, ["sideCar"]);
	if (!t) throw Error("Sidecar: please provide `sideCar` property to import the right car");
	var i = t.read();
	if (!i) throw Error("Sidecar medium not found");
	return r.createElement(i, Wt({}, n));
};
on.isSideCarExport = !0;
function sn(e, t) {
	return e.useMedium(t), on;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/medium.js
var cn = an(), ln = function() {}, un = r.forwardRef(function(e, t) {
	var n = r.useRef(null), i = r.useState({
		onScrollCapture: ln,
		onWheelCapture: ln,
		onTouchMoveCapture: ln
	}), a = i[0], o = i[1], s = e.forwardProps, c = e.children, l = e.className, u = e.removeScrollBar, d = e.enabled, f = e.shards, p = e.sideCar, m = e.noRelative, h = e.noIsolation, g = e.inert, _ = e.allowPinchZoom, v = e.as, y = v === void 0 ? "div" : v, b = e.gapMode, x = Gt(e, [
		"forwardProps",
		"children",
		"className",
		"removeScrollBar",
		"enabled",
		"shards",
		"sideCar",
		"noRelative",
		"noIsolation",
		"inert",
		"allowPinchZoom",
		"as",
		"gapMode"
	]), S = p, C = tn([n, t]), w = Wt(Wt({}, x), a);
	return r.createElement(r.Fragment, null, d && r.createElement(S, {
		sideCar: cn,
		removeScrollBar: u,
		shards: f,
		noRelative: m,
		noIsolation: h,
		inert: g,
		setCallbacks: o,
		allowPinchZoom: !!_,
		lockRef: n,
		gapMode: b
	}), s ? r.cloneElement(r.Children.only(c), Wt(Wt({}, w), { ref: C })) : r.createElement(y, Wt({}, w, {
		className: l,
		ref: C
	}), c));
});
un.defaultProps = {
	enabled: !0,
	removeScrollBar: !0,
	inert: !1
}, un.classNames = {
	fullWidth: Jt,
	zeroRight: qt
};
//#endregion
//#region node_modules/get-nonce/dist/es2015/index.js
var dn, fn = function() {
	if (dn) return dn;
	if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
//#endregion
//#region node_modules/react-style-singleton/dist/es2015/singleton.js
function pn() {
	if (!document) return null;
	var e = document.createElement("style");
	e.type = "text/css";
	var t = fn();
	return t && e.setAttribute("nonce", t), e;
}
function mn(e, t) {
	e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function hn(e) {
	(document.head || document.getElementsByTagName("head")[0]).appendChild(e);
}
var gn = function() {
	var e = 0, t = null;
	return {
		add: function(n) {
			e == 0 && (t = pn()) && (mn(t, n), hn(t)), e++;
		},
		remove: function() {
			e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
		}
	};
}, _n = function() {
	var e = gn();
	return function(t, n) {
		r.useEffect(function() {
			return e.add(t), function() {
				e.remove();
			};
		}, [t && n]);
	};
}, vn = function() {
	var e = _n();
	return function(t) {
		var n = t.styles, r = t.dynamic;
		return e(n, r), null;
	};
}, yn = {
	left: 0,
	top: 0,
	right: 0,
	gap: 0
}, bn = function(e) {
	return parseInt(e || "", 10) || 0;
}, xn = function(e) {
	var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
	return [
		bn(n),
		bn(r),
		bn(i)
	];
}, Sn = function(e) {
	if (e === void 0 && (e = "margin"), typeof window > "u") return yn;
	var t = xn(e), n = document.documentElement.clientWidth, r = window.innerWidth;
	return {
		left: t[0],
		top: t[1],
		right: t[2],
		gap: Math.max(0, r - n + t[2] - t[0])
	};
}, Cn = vn(), wn = "data-scroll-locked", Tn = function(e, t, n, r) {
	var i = e.left, a = e.top, o = e.right, s = e.gap;
	return n === void 0 && (n = "margin"), `
  .${Yt} {
   overflow: hidden ${r};
   padding-right: ${s}px ${r};
  }
  body[${wn}] {
    overflow: hidden ${r};
    overscroll-behavior: contain;
    ${[
		t && `position: relative ${r};`,
		n === "margin" && `
    padding-left: ${i}px;
    padding-top: ${a}px;
    padding-right: ${o}px;
    margin-left:0;
    margin-top:0;
    margin-right: ${s}px ${r};
    `,
		n === "padding" && `padding-right: ${s}px ${r};`
	].filter(Boolean).join("")}
  }
  
  .${qt} {
    right: ${s}px ${r};
  }
  
  .${Jt} {
    margin-right: ${s}px ${r};
  }
  
  .${qt} .${qt} {
    right: 0 ${r};
  }
  
  .${Jt} .${Jt} {
    margin-right: 0 ${r};
  }
  
  body[${wn}] {
    ${Xt}: ${s}px;
  }
`;
}, En = function() {
	var e = parseInt(document.body.getAttribute("data-scroll-locked") || "0", 10);
	return isFinite(e) ? e : 0;
}, Dn = function() {
	r.useEffect(function() {
		return document.body.setAttribute(wn, (En() + 1).toString()), function() {
			var e = En() - 1;
			e <= 0 ? document.body.removeAttribute(wn) : document.body.setAttribute(wn, e.toString());
		};
	}, []);
}, On = function(e) {
	var t = e.noRelative, n = e.noImportant, i = e.gapMode, a = i === void 0 ? "margin" : i;
	Dn();
	var o = r.useMemo(function() {
		return Sn(a);
	}, [a]);
	return r.createElement(Cn, { styles: Tn(o, !t, a, n ? "" : "!important") });
}, kn = !1;
if (typeof window < "u") try {
	var An = Object.defineProperty({}, "passive", { get: function() {
		return kn = !0, !0;
	} });
	window.addEventListener("test", An, An), window.removeEventListener("test", An, An);
} catch {
	kn = !1;
}
var jn = kn ? { passive: !1 } : !1, Mn = function(e) {
	return e.tagName === "TEXTAREA";
}, Nn = function(e, t) {
	if (!(e instanceof Element)) return !1;
	var n = window.getComputedStyle(e);
	return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !Mn(e) && n[t] === "visible");
}, Pn = function(e) {
	return Nn(e, "overflowY");
}, Fn = function(e) {
	return Nn(e, "overflowX");
}, In = function(e, t) {
	var n = t.ownerDocument, r = t;
	do {
		if (typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host), zn(e, r)) {
			var i = Bn(e, r);
			if (i[1] > i[2]) return !0;
		}
		r = r.parentNode;
	} while (r && r !== n.body);
	return !1;
}, Ln = function(e) {
	return [
		e.scrollTop,
		e.scrollHeight,
		e.clientHeight
	];
}, Rn = function(e) {
	return [
		e.scrollLeft,
		e.scrollWidth,
		e.clientWidth
	];
}, zn = function(e, t) {
	return e === "v" ? Pn(t) : Fn(t);
}, Bn = function(e, t) {
	return e === "v" ? Ln(t) : Rn(t);
}, Vn = function(e, t) {
	return e === "h" && t === "rtl" ? -1 : 1;
}, Hn = function(e, t, n, r, i) {
	var a = Vn(e, window.getComputedStyle(t).direction), o = a * r, s = n.target, c = t.contains(s), l = !1, u = o > 0, d = 0, f = 0;
	do {
		if (!s) break;
		var p = Bn(e, s), m = p[0], h = p[1] - p[2] - a * m;
		(m || h) && zn(e, s) && (d += h, f += m);
		var g = s.parentNode;
		s = g && g.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? g.host : g;
	} while (!c && s !== document.body || c && (t.contains(s) || t === s));
	return (u && (i && Math.abs(d) < 1 || !i && o > d) || !u && (i && Math.abs(f) < 1 || !i && -o > f)) && (l = !0), l;
}, Un = function(e) {
	return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, Wn = function(e) {
	return [e.deltaX, e.deltaY];
}, Gn = function(e) {
	return e && "current" in e ? e.current : e;
}, Kn = function(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}, qn = function(e) {
	return `
  .block-interactivity-${e} {pointer-events: none;}
  .allow-interactivity-${e} {pointer-events: all;}
`;
}, Jn = 0, Yn = [];
function Xn(e) {
	var t = r.useRef([]), n = r.useRef([0, 0]), i = r.useRef(), a = r.useState(Jn++)[0], o = r.useState(vn)[0], s = r.useRef(e);
	r.useEffect(function() {
		s.current = e;
	}, [e]), r.useEffect(function() {
		if (e.inert) {
			document.body.classList.add(`block-interactivity-${a}`);
			var t = Kt([e.lockRef.current], (e.shards || []).map(Gn), !0).filter(Boolean);
			return t.forEach(function(e) {
				return e.classList.add(`allow-interactivity-${a}`);
			}), function() {
				document.body.classList.remove(`block-interactivity-${a}`), t.forEach(function(e) {
					return e.classList.remove(`allow-interactivity-${a}`);
				});
			};
		}
	}, [
		e.inert,
		e.lockRef.current,
		e.shards
	]);
	var c = r.useCallback(function(e, t) {
		if ("touches" in e && e.touches.length === 2 || e.type === "wheel" && e.ctrlKey) return !s.current.allowPinchZoom;
		var r = Un(e), a = n.current, o = "deltaX" in e ? e.deltaX : a[0] - r[0], c = "deltaY" in e ? e.deltaY : a[1] - r[1], l, u = e.target, d = Math.abs(o) > Math.abs(c) ? "h" : "v";
		if ("touches" in e && d === "h" && u.type === "range") return !1;
		var f = window.getSelection(), p = f && f.anchorNode;
		if (p && (p === u || p.contains(u))) return !1;
		var m = In(d, u);
		if (!m) return !0;
		if (m ? l = d : (l = d === "v" ? "h" : "v", m = In(d, u)), !m) return !1;
		if (!i.current && "changedTouches" in e && (o || c) && (i.current = l), !l) return !0;
		var h = i.current || l;
		return Hn(h, t, e, h === "h" ? o : c, !0);
	}, []), l = r.useCallback(function(e) {
		var n = e;
		if (!(!Yn.length || Yn[Yn.length - 1] !== o)) {
			var r = "deltaY" in n ? Wn(n) : Un(n), i = t.current.filter(function(e) {
				return e.name === n.type && (e.target === n.target || n.target === e.shadowParent) && Kn(e.delta, r);
			})[0];
			if (i && i.should) {
				n.cancelable && n.preventDefault();
				return;
			}
			if (!i) {
				var a = (s.current.shards || []).map(Gn).filter(Boolean).filter(function(e) {
					return e.contains(n.target);
				});
				(a.length > 0 ? c(n, a[0]) : !s.current.noIsolation) && n.cancelable && n.preventDefault();
			}
		}
	}, []), u = r.useCallback(function(e, n, r, i) {
		var a = {
			name: e,
			delta: n,
			target: r,
			should: i,
			shadowParent: Zn(r)
		};
		t.current.push(a), setTimeout(function() {
			t.current = t.current.filter(function(e) {
				return e !== a;
			});
		}, 1);
	}, []), d = r.useCallback(function(e) {
		n.current = Un(e), i.current = void 0;
	}, []), f = r.useCallback(function(t) {
		u(t.type, Wn(t), t.target, c(t, e.lockRef.current));
	}, []), p = r.useCallback(function(t) {
		u(t.type, Un(t), t.target, c(t, e.lockRef.current));
	}, []);
	r.useEffect(function() {
		return Yn.push(o), e.setCallbacks({
			onScrollCapture: f,
			onWheelCapture: f,
			onTouchMoveCapture: p
		}), document.addEventListener("wheel", l, jn), document.addEventListener("touchmove", l, jn), document.addEventListener("touchstart", d, jn), function() {
			Yn = Yn.filter(function(e) {
				return e !== o;
			}), document.removeEventListener("wheel", l, jn), document.removeEventListener("touchmove", l, jn), document.removeEventListener("touchstart", d, jn);
		};
	}, []);
	var m = e.removeScrollBar, h = e.inert;
	return r.createElement(r.Fragment, null, h ? r.createElement(o, { styles: qn(a) }) : null, m ? r.createElement(On, {
		noRelative: e.noRelative,
		gapMode: e.gapMode
	}) : null);
}
function Zn(e) {
	for (var t = null; e !== null;) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
	return t;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/sidecar.js
var Qn = sn(cn, Xn), $n = r.forwardRef(function(e, t) {
	return r.createElement(un, Wt({}, e, {
		ref: t,
		sideCar: Qn
	}));
});
$n.classNames = un.classNames;
//#endregion
//#region src/lib/remove-scroll-gate.tsx
var er = r.createContext(!1);
function tr({ allowBodyScroll: e, children: t }) {
	return /* @__PURE__ */ v(er.Provider, {
		value: e,
		children: t
	});
}
function nr() {
	return r.useContext(er);
}
//#endregion
//#region src/lib/react-remove-scroll-shim.tsx
var rr = r.forwardRef(function(e, t) {
	let n = nr() ? !1 : e.enabled !== !1;
	return /* @__PURE__ */ v($n, {
		...e,
		ref: t,
		enabled: n
	});
});
rr.classNames = $n.classNames;
//#endregion
//#region node_modules/aria-hidden/dist/es2015/index.js
var ir = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, ar = /* @__PURE__ */ new WeakMap(), or = /* @__PURE__ */ new WeakMap(), sr = {}, cr = 0, lr = function(e) {
	return e && (e.host || lr(e.parentNode));
}, ur = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = lr(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, dr = function(e, t, n, r) {
	var i = ur(t, Array.isArray(e) ? e : [e]);
	sr[n] || (sr[n] = /* @__PURE__ */ new WeakMap());
	var a = sr[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		!e || s.has(e) || (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		!e || c.has(e) || Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (ar.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				ar.set(e, c), a.set(e, l), o.push(e), c === 1 && i && or.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), cr++, function() {
		o.forEach(function(e) {
			var t = ar.get(e) - 1, i = a.get(e) - 1;
			ar.set(e, t), a.set(e, i), t || (or.has(e) || e.removeAttribute(r), or.delete(e)), i || e.removeAttribute(n);
		}), cr--, cr || (ar = /* @__PURE__ */ new WeakMap(), ar = /* @__PURE__ */ new WeakMap(), or = /* @__PURE__ */ new WeakMap(), sr = {});
	};
}, fr = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || ir(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), dr(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function pr(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function mr(e) {
	let [t, n] = r.useState(void 0);
	return V(() => {
		if (e) {
			n({
				width: e.offsetWidth,
				height: e.offsetHeight
			});
			let t = new ResizeObserver((t) => {
				if (!Array.isArray(t) || !t.length) return;
				let r = t[0], i, a;
				if ("borderBoxSize" in r) {
					let e = r.borderBoxSize, t = Array.isArray(e) ? e[0] : e;
					i = t.inlineSize, a = t.blockSize;
				} else i = e.offsetWidth, a = e.offsetHeight;
				n({
					width: i,
					height: a
				});
			});
			return t.observe(e, { box: "border-box" }), () => t.unobserve(e);
		} else n(void 0);
	}, [e]), t;
}
//#endregion
//#region node_modules/@radix-ui/react-checkbox/dist/index.mjs
var hr = "Checkbox", [gr, _r] = ze(hr), [vr, yr] = gr(hr);
function br(e) {
	let { __scopeCheckbox: t, checked: n, children: i, defaultChecked: a, disabled: o, form: s, name: c, onCheckedChange: l, required: u, value: d = "on", internal_do_not_use_render: f } = e, [p, m] = Ye({
		prop: n,
		defaultProp: a ?? !1,
		onChange: l,
		caller: hr
	}), [h, g] = r.useState(null), [_, y] = r.useState(null), b = r.useRef(!1), x = h ? !!s || !!h.closest("form") : !0, S = {
		checked: p,
		disabled: o,
		setChecked: m,
		control: h,
		setControl: g,
		name: c,
		form: s,
		value: d,
		hasConsumerStoppedPropagationRef: b,
		required: u,
		defaultChecked: kr(a) ? !1 : a,
		isFormControl: x,
		bubbleInput: _,
		setBubbleInput: y
	};
	return /* @__PURE__ */ v(vr, {
		scope: t,
		...S,
		children: Or(f) ? f(S) : i
	});
}
var xr = "CheckboxTrigger", Sr = r.forwardRef(({ __scopeCheckbox: e, onKeyDown: t, onClick: n, ...i }, a) => {
	let { control: o, value: s, disabled: c, checked: l, required: u, setControl: d, setChecked: f, hasConsumerStoppedPropagationRef: p, isFormControl: m, bubbleInput: h } = yr(xr, e), g = R(a, d), _ = r.useRef(l);
	return r.useEffect(() => {
		let e = o?.form;
		if (e) {
			let t = () => f(_.current);
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [o, f]), /* @__PURE__ */ v(z.button, {
		type: "button",
		role: "checkbox",
		"aria-checked": kr(l) ? "mixed" : l,
		"aria-required": u,
		"data-state": Ar(l),
		"data-disabled": c ? "" : void 0,
		disabled: c,
		value: s,
		...i,
		ref: g,
		onKeyDown: B(t, (e) => {
			e.key === "Enter" && e.preventDefault();
		}),
		onClick: B(n, (e) => {
			f((e) => kr(e) ? !0 : !e), h && m && (p.current = e.isPropagationStopped(), p.current || e.stopPropagation());
		})
	});
});
Sr.displayName = xr;
var Cr = r.forwardRef((e, t) => {
	let { __scopeCheckbox: n, name: r, checked: i, defaultChecked: a, required: o, disabled: s, value: c, onCheckedChange: l, form: u, ...d } = e;
	return /* @__PURE__ */ v(br, {
		__scopeCheckbox: n,
		checked: i,
		defaultChecked: a,
		disabled: s,
		required: o,
		onCheckedChange: l,
		name: r,
		form: u,
		value: c,
		internal_do_not_use_render: ({ isFormControl: e }) => /* @__PURE__ */ y(_, { children: [/* @__PURE__ */ v(Sr, {
			...d,
			ref: t,
			__scopeCheckbox: n
		}), e && /* @__PURE__ */ v(Dr, { __scopeCheckbox: n })] })
	});
});
Cr.displayName = hr;
var wr = "CheckboxIndicator", Tr = r.forwardRef((e, t) => {
	let { __scopeCheckbox: n, forceMount: r, ...i } = e, a = yr(wr, n);
	return /* @__PURE__ */ v($e, {
		present: r || kr(a.checked) || a.checked === !0,
		children: /* @__PURE__ */ v(z.span, {
			"data-state": Ar(a.checked),
			"data-disabled": a.disabled ? "" : void 0,
			...i,
			ref: t,
			style: {
				pointerEvents: "none",
				...e.style
			}
		})
	});
});
Tr.displayName = wr;
var Er = "CheckboxBubbleInput", Dr = r.forwardRef(({ __scopeCheckbox: e, ...t }, n) => {
	let { control: i, hasConsumerStoppedPropagationRef: a, checked: o, defaultChecked: s, required: c, disabled: l, name: u, value: d, form: f, bubbleInput: p, setBubbleInput: m } = yr(Er, e), h = R(n, m), g = pr(o), _ = mr(i);
	r.useEffect(() => {
		let e = p;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, n = Object.getOwnPropertyDescriptor(t, "checked").set, r = !a.current;
		if (g !== o && n) {
			let t = new Event("click", { bubbles: r });
			e.indeterminate = kr(o), n.call(e, kr(o) ? !1 : o), e.dispatchEvent(t);
		}
	}, [
		p,
		g,
		o,
		a
	]);
	let y = r.useRef(kr(o) ? !1 : o);
	return /* @__PURE__ */ v(z.input, {
		type: "checkbox",
		"aria-hidden": !0,
		defaultChecked: s ?? y.current,
		required: c,
		disabled: l,
		name: u,
		value: d,
		form: f,
		...t,
		tabIndex: -1,
		ref: h,
		style: {
			...t.style,
			..._,
			position: "absolute",
			pointerEvents: "none",
			opacity: 0,
			margin: 0,
			transform: "translateX(-100%)"
		}
	});
});
Dr.displayName = Er;
function Or(e) {
	return typeof e == "function";
}
function kr(e) {
	return e === "indeterminate";
}
function Ar(e) {
	return kr(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
//#endregion
//#region node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var jr = [
	"top",
	"right",
	"bottom",
	"left"
], Mr = Math.min, Nr = Math.max, Pr = Math.round, Fr = Math.floor, Ir = (e) => ({
	x: e,
	y: e
}), Lr = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function Rr(e, t, n) {
	return Nr(e, Mr(t, n));
}
function zr(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function Br(e) {
	return e.split("-")[0];
}
function Vr(e) {
	return e.split("-")[1];
}
function Hr(e) {
	return e === "x" ? "y" : "x";
}
function Ur(e) {
	return e === "y" ? "height" : "width";
}
function Wr(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function Gr(e) {
	return Hr(Wr(e));
}
function Kr(e, t, n) {
	n === void 0 && (n = !1);
	let r = Vr(e), i = Gr(e), a = Ur(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = ti(o)), [o, ti(o)];
}
function qr(e) {
	let t = ti(e);
	return [
		Jr(e),
		t,
		Jr(t)
	];
}
function Jr(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var Yr = ["left", "right"], Xr = ["right", "left"], Zr = ["top", "bottom"], Qr = ["bottom", "top"];
function $r(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? Xr : Yr : t ? Yr : Xr;
		case "left":
		case "right": return t ? Zr : Qr;
		default: return [];
	}
}
function ei(e, t, n, r) {
	let i = Vr(e), a = $r(Br(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(Jr)))), a;
}
function ti(e) {
	let t = Br(e);
	return Lr[t] + e.slice(t.length);
}
function ni(e) {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...e
	};
}
function ri(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : ni(e);
}
function ii(e) {
	let { x: t, y: n, width: r, height: i } = e;
	return {
		width: r,
		height: i,
		top: n,
		left: t,
		right: t + r,
		bottom: n + i,
		x: t,
		y: n
	};
}
//#endregion
//#region node_modules/@floating-ui/core/dist/floating-ui.core.mjs
function ai(e, t, n) {
	let { reference: r, floating: i } = e, a = Wr(t), o = Gr(t), s = Ur(o), c = Br(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
	switch (c) {
		case "top":
			p = {
				x: u,
				y: r.y - i.height
			};
			break;
		case "bottom":
			p = {
				x: u,
				y: r.y + r.height
			};
			break;
		case "right":
			p = {
				x: r.x + r.width,
				y: d
			};
			break;
		case "left":
			p = {
				x: r.x - i.width,
				y: d
			};
			break;
		default: p = {
			x: r.x,
			y: r.y
		};
	}
	switch (Vr(t)) {
		case "start":
			p[o] -= f * (n && l ? -1 : 1);
			break;
		case "end":
			p[o] += f * (n && l ? -1 : 1);
			break;
	}
	return p;
}
async function oi(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = zr(t, e), p = ri(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = ii(await i.getClippingRect({
		element: await (i.isElement == null ? void 0 : i.isElement(m)) ?? !0 ? m : m.contextElement || await (i.getDocumentElement == null ? void 0 : i.getDocumentElement(o.floating)),
		boundary: c,
		rootBoundary: l,
		strategy: s
	})), g = u === "floating" ? {
		x: n,
		y: r,
		width: a.floating.width,
		height: a.floating.height
	} : a.reference, _ = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(o.floating)), v = await (i.isElement == null ? void 0 : i.isElement(_)) && await (i.getScale == null ? void 0 : i.getScale(_)) || {
		x: 1,
		y: 1
	}, y = ii(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
		elements: o,
		rect: g,
		offsetParent: _,
		strategy: s
	}) : g);
	return {
		top: (h.top - y.top + p.top) / v.y,
		bottom: (y.bottom - h.bottom + p.bottom) / v.y,
		left: (h.left - y.left + p.left) / v.x,
		right: (y.right - h.right + p.right) / v.x
	};
}
var si = 50, ci = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: oi
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = ai(l, r, c), f = r, p = 0, m = {};
	for (let n = 0; n < a.length; n++) {
		let h = a[n];
		if (!h) continue;
		let { name: g, fn: _ } = h, { x: v, y, data: b, reset: x } = await _({
			x: u,
			y: d,
			initialPlacement: r,
			placement: f,
			strategy: i,
			middlewareData: m,
			rects: l,
			platform: s,
			elements: {
				reference: e,
				floating: t
			}
		});
		u = v ?? u, d = y ?? d, m[g] = {
			...m[g],
			...b
		}, x && p < si && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = ai(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, li = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = zr(e, t) || {};
		if (l == null) return {};
		let d = ri(u), f = {
			x: n,
			y: r
		}, p = Gr(i), m = Ur(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = Mr(d[_], T), ee = Mr(d[v], T), D = E, te = C - h[m] - ee, O = C / 2 - h[m] / 2 + w, k = Rr(D, O, te), A = !c.arrow && Vr(i) != null && O !== k && a.reference[m] / 2 - (O < D ? E : ee) - h[m] / 2 < 0, j = A ? O < D ? O - D : O - te : 0;
		return {
			[p]: f[p] + j,
			data: {
				[p]: k,
				centerOffset: O - k - j,
				...A && { alignmentOffset: j }
			},
			reset: A
		};
	}
}), ui = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = zr(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = Br(r), _ = Wr(o), v = Br(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [ti(o)] : qr(o)), x = p !== "none";
			!d && x && b.push(...ei(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = Kr(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (!(u === "alignment" && _ !== Wr(t)) || T.every((e) => Wr(e.placement) === _ ? e.overflows[0] > 0 : !0))) return {
					data: {
						index: e,
						overflows: T
					},
					reset: { placement: t }
				};
				let n = T.filter((e) => e.overflows[0] <= 0).sort((e, t) => e.overflows[1] - t.overflows[1])[0]?.placement;
				if (!n) switch (f) {
					case "bestFit": {
						let e = T.filter((e) => {
							if (x) {
								let t = Wr(e.placement);
								return t === _ || t === "y";
							}
							return !0;
						}).map((e) => [e.placement, e.overflows.filter((e) => e > 0).reduce((e, t) => e + t, 0)]).sort((e, t) => e[1] - t[1])[0]?.[0];
						e && (n = e);
						break;
					}
					case "initialPlacement":
						n = o;
						break;
				}
				if (r !== n) return { reset: { placement: n } };
			}
			return {};
		}
	};
};
function di(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function fi(e) {
	return jr.some((t) => e[t] >= 0);
}
var pi = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = zr(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = di(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: fi(e)
					} };
				}
				case "escaped": {
					let e = di(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: fi(e)
					} };
				}
				default: return {};
			}
		}
	};
}, mi = /* @__PURE__ */ new Set(["left", "top"]);
async function hi(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = Br(n), s = Vr(n), c = Wr(n) === "y", l = mi.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = zr(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
		mainAxis: d,
		crossAxis: 0,
		alignmentAxis: null
	} : {
		mainAxis: d.mainAxis || 0,
		crossAxis: d.crossAxis || 0,
		alignmentAxis: d.alignmentAxis
	};
	return s && typeof m == "number" && (p = s === "end" ? m * -1 : m), c ? {
		x: p * u,
		y: f * l
	} : {
		x: f * l,
		y: p * u
	};
}
var gi = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await hi(t, e);
			return a === o.offset?.placement && (n = o.arrow) != null && n.alignmentOffset ? {} : {
				x: r + s.x,
				y: i + s.y,
				data: {
					...s,
					placement: a
				}
			};
		}
	};
}, _i = function(e) {
	return e === void 0 && (e = {}), {
		name: "shift",
		options: e,
		async fn(t) {
			let { x: n, y: r, placement: i, platform: a } = t, { mainAxis: o = !0, crossAxis: s = !1, limiter: c = { fn: (e) => {
				let { x: t, y: n } = e;
				return {
					x: t,
					y: n
				};
			} }, ...l } = zr(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = Wr(Br(i)), p = Hr(f), m = u[p], h = u[f];
			if (o) {
				let e = p === "y" ? "top" : "left", t = p === "y" ? "bottom" : "right", n = m + d[e], r = m - d[t];
				m = Rr(n, m, r);
			}
			if (s) {
				let e = f === "y" ? "top" : "left", t = f === "y" ? "bottom" : "right", n = h + d[e], r = h - d[t];
				h = Rr(n, h, r);
			}
			let g = c.fn({
				...t,
				[p]: m,
				[f]: h
			});
			return {
				...g,
				data: {
					x: g.x - n,
					y: g.y - r,
					enabled: {
						[p]: o,
						[f]: s
					}
				}
			};
		}
	};
}, vi = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = zr(e, t), u = {
				x: n,
				y: r
			}, d = Wr(i), f = Hr(d), p = u[f], m = u[d], h = zr(s, t), g = typeof h == "number" ? {
				mainAxis: h,
				crossAxis: 0
			} : {
				mainAxis: 0,
				crossAxis: 0,
				...h
			};
			if (c) {
				let e = f === "y" ? "height" : "width", t = a.reference[f] - a.floating[e] + g.mainAxis, n = a.reference[f] + a.reference[e] - g.mainAxis;
				p < t ? p = t : p > n && (p = n);
			}
			if (l) {
				let e = f === "y" ? "width" : "height", t = mi.has(Br(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, yi = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			var n, r;
			let { placement: i, rects: a, platform: o, elements: s } = t, { apply: c = () => {}, ...l } = zr(e, t), u = await o.detectOverflow(t, l), d = Br(i), f = Vr(i), p = Wr(i) === "y", { width: m, height: h } = a.floating, g, _;
			d === "top" || d === "bottom" ? (g = d, _ = f === (await (o.isRTL == null ? void 0 : o.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (_ = d, g = f === "end" ? "top" : "bottom");
			let v = h - u.top - u.bottom, y = m - u.left - u.right, b = Mr(h - u[g], v), x = Mr(m - u[_], y), S = !t.middlewareData.shift, C = b, w = x;
			if ((n = t.middlewareData.shift) != null && n.enabled.x && (w = y), (r = t.middlewareData.shift) != null && r.enabled.y && (C = v), S && !f) {
				let e = Nr(u.left, 0), t = Nr(u.right, 0), n = Nr(u.top, 0), r = Nr(u.bottom, 0);
				p ? w = m - 2 * (e !== 0 || t !== 0 ? e + t : Nr(u.left, u.right)) : C = h - 2 * (n !== 0 || r !== 0 ? n + r : Nr(u.top, u.bottom));
			}
			await c({
				...t,
				availableWidth: w,
				availableHeight: C
			});
			let T = await o.getDimensions(s.floating);
			return m !== T.width || h !== T.height ? { reset: { rects: !0 } } : {};
		}
	};
};
//#endregion
//#region node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function bi() {
	return typeof window < "u";
}
function xi(e) {
	return wi(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Si(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Ci(e) {
	return ((wi(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function wi(e) {
	return bi() ? e instanceof Node || e instanceof Si(e).Node : !1;
}
function Ti(e) {
	return bi() ? e instanceof Element || e instanceof Si(e).Element : !1;
}
function Ei(e) {
	return bi() ? e instanceof HTMLElement || e instanceof Si(e).HTMLElement : !1;
}
function Di(e) {
	return !bi() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Si(e).ShadowRoot;
}
function Oi(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = zi(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function ki(e) {
	return /^(table|td|th)$/.test(xi(e));
}
function Ai(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var ji = /transform|translate|scale|rotate|perspective|filter/, Mi = /paint|layout|strict|content/, Ni = (e) => !!e && e !== "none", Pi;
function Fi(e) {
	let t = Ti(e) ? zi(e) : e;
	return Ni(t.transform) || Ni(t.translate) || Ni(t.scale) || Ni(t.rotate) || Ni(t.perspective) || !Li() && (Ni(t.backdropFilter) || Ni(t.filter)) || ji.test(t.willChange || "") || Mi.test(t.contain || "");
}
function Ii(e) {
	let t = Vi(e);
	for (; Ei(t) && !Ri(t);) {
		if (Fi(t)) return t;
		if (Ai(t)) return null;
		t = Vi(t);
	}
	return null;
}
function Li() {
	return Pi ?? (Pi = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), Pi;
}
function Ri(e) {
	return /^(html|body|#document)$/.test(xi(e));
}
function zi(e) {
	return Si(e).getComputedStyle(e);
}
function Bi(e) {
	return Ti(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function Vi(e) {
	if (xi(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Di(e) && e.host || Ci(e);
	return Di(t) ? t.host : t;
}
function Hi(e) {
	let t = Vi(e);
	return Ri(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : Ei(t) && Oi(t) ? t : Hi(t);
}
function Ui(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = Hi(e), i = r === e.ownerDocument?.body, a = Si(r);
	if (i) {
		let e = Wi(a);
		return t.concat(a, a.visualViewport || [], Oi(r) ? r : [], e && n ? Ui(e) : []);
	} else return t.concat(r, Ui(r, [], n));
}
function Wi(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function Gi(e) {
	let t = zi(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = Ei(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = Pr(n) !== a || Pr(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function Ki(e) {
	return Ti(e) ? e : e.contextElement;
}
function qi(e) {
	let t = Ki(e);
	if (!Ei(t)) return Ir(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = Gi(t), o = (a ? Pr(n.width) : n.width) / r, s = (a ? Pr(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var Ji = /* @__PURE__ */ Ir(0);
function Yi(e) {
	let t = Si(e);
	return !Li() || !t.visualViewport ? Ji : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function Xi(e, t, n) {
	return t === void 0 && (t = !1), !n || t && n !== Si(e) ? !1 : t;
}
function Zi(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = Ki(e), o = Ir(1);
	t && (r ? Ti(r) && (o = qi(r)) : o = qi(e));
	let s = Xi(a, n, r) ? Yi(a) : Ir(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a) {
		let e = Si(a), t = r && Ti(r) ? Si(r) : r, n = e, i = Wi(n);
		for (; i && r && t !== n;) {
			let e = qi(i), t = i.getBoundingClientRect(), r = zi(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = Si(i), i = Wi(n);
		}
	}
	return ii({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function Qi(e, t) {
	let n = Bi(e).scrollLeft;
	return t ? t.left + n : Zi(Ci(e)).left + n;
}
function $i(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - Qi(e, n),
		y: n.top + t.scrollTop
	};
}
function ea(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = Ci(r), s = t ? Ai(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = Ir(1), u = Ir(0), d = Ei(r);
	if ((d || !d && !a) && ((xi(r) !== "body" || Oi(o)) && (c = Bi(r)), d)) {
		let e = Zi(r);
		l = qi(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? $i(o, c) : Ir(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function ta(e) {
	return Array.from(e.getClientRects());
}
function na(e) {
	let t = Ci(e), n = Bi(e), r = e.ownerDocument.body, i = Nr(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), a = Nr(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight), o = -n.scrollLeft + Qi(e), s = -n.scrollTop;
	return zi(r).direction === "rtl" && (o += Nr(t.clientWidth, r.clientWidth) - i), {
		width: i,
		height: a,
		x: o,
		y: s
	};
}
var ra = 25;
function ia(e, t) {
	let n = Si(e), r = Ci(e), i = n.visualViewport, a = r.clientWidth, o = r.clientHeight, s = 0, c = 0;
	if (i) {
		a = i.width, o = i.height;
		let e = Li();
		(!e || e && t === "fixed") && (s = i.offsetLeft, c = i.offsetTop);
	}
	let l = Qi(r);
	if (l <= 0) {
		let e = r.ownerDocument, t = e.body, n = getComputedStyle(t), i = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, o = Math.abs(r.clientWidth - t.clientWidth - i);
		o <= ra && (a -= o);
	} else l <= ra && (a += l);
	return {
		width: a,
		height: o,
		x: s,
		y: c
	};
}
function aa(e, t) {
	let n = Zi(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = Ei(e) ? qi(e) : Ir(1);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function oa(e, t, n) {
	let r;
	if (t === "viewport") r = ia(e, n);
	else if (t === "document") r = na(Ci(e));
	else if (Ti(t)) r = aa(t, n);
	else {
		let n = Yi(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return ii(r);
}
function sa(e, t) {
	let n = Vi(e);
	return n === t || !Ti(n) || Ri(n) ? !1 : zi(n).position === "fixed" || sa(n, t);
}
function ca(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = Ui(e, [], !1).filter((e) => Ti(e) && xi(e) !== "body"), i = null, a = zi(e).position === "fixed", o = a ? Vi(e) : e;
	for (; Ti(o) && !Ri(o);) {
		let t = zi(o), n = Fi(o);
		!n && t.position === "fixed" && (i = null), (a ? !n && !i : !n && t.position === "static" && i && (i.position === "absolute" || i.position === "fixed") || Oi(o) && !n && sa(e, o)) ? r = r.filter((e) => e !== o) : i = t, o = Vi(o);
	}
	return t.set(e, r), r;
}
function la(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? Ai(t) ? [] : ca(t, this._c) : [].concat(n), r], o = oa(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = oa(t, a[e], i);
		s = Nr(n.top, s), c = Mr(n.right, c), l = Mr(n.bottom, l), u = Nr(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function ua(e) {
	let { width: t, height: n } = Gi(e);
	return {
		width: t,
		height: n
	};
}
function da(e, t, n) {
	let r = Ei(t), i = Ci(t), a = n === "fixed", o = Zi(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = Ir(0);
	function l() {
		c.x = Qi(i);
	}
	if (r || !r && !a) if ((xi(t) !== "body" || Oi(i)) && (s = Bi(t)), r) {
		let e = Zi(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	} else i && l();
	a && !r && i && l();
	let u = i && !r && !a ? $i(i, s) : Ir(0);
	return {
		x: o.left + s.scrollLeft - c.x - u.x,
		y: o.top + s.scrollTop - c.y - u.y,
		width: o.width,
		height: o.height
	};
}
function fa(e) {
	return zi(e).position === "static";
}
function pa(e, t) {
	if (!Ei(e) || zi(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Ci(e) === n && (n = n.ownerDocument.body), n;
}
function ma(e, t) {
	let n = Si(e);
	if (Ai(e)) return n;
	if (!Ei(e)) {
		let t = Vi(e);
		for (; t && !Ri(t);) {
			if (Ti(t) && !fa(t)) return t;
			t = Vi(t);
		}
		return n;
	}
	let r = pa(e, t);
	for (; r && ki(r) && fa(r);) r = pa(r, t);
	return r && Ri(r) && fa(r) && !Fi(r) ? n : r || Ii(e) || n;
}
var ha = async function(e) {
	let t = this.getOffsetParent || ma, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: da(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function ga(e) {
	return zi(e).direction === "rtl";
}
var _a = {
	convertOffsetParentRelativeRectToViewportRelativeRect: ea,
	getDocumentElement: Ci,
	getClippingRect: la,
	getOffsetParent: ma,
	getElementRects: ha,
	getClientRects: ta,
	getDimensions: ua,
	getScale: qi,
	isElement: Ti,
	isRTL: ga
};
function va(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function ya(e, t) {
	let n = null, r, i = Ci(e);
	function a() {
		var e;
		clearTimeout(r), (e = n) == null || e.disconnect(), n = null;
	}
	function o(s, c) {
		s === void 0 && (s = !1), c === void 0 && (c = 1), a();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (s || t(), !f || !p) return;
		let m = Fr(d), h = Fr(i.clientWidth - (u + f)), g = Fr(i.clientHeight - (d + p)), _ = Fr(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: Nr(0, Mr(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (n !== c) {
				if (!y) return o();
				n ? o(!1, n) : r = setTimeout(() => {
					o(!1, 1e-7);
				}, 1e3);
			}
			n === 1 && !va(l, e.getBoundingClientRect()) && o(), y = !1;
		}
		try {
			n = new IntersectionObserver(b, {
				...v,
				root: i.ownerDocument
			});
		} catch {
			n = new IntersectionObserver(b, v);
		}
		n.observe(e);
	}
	return o(!0), a;
}
function ba(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = Ki(e), u = i || a ? [...l ? Ui(l) : [], ...t ? Ui(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n, { passive: !0 }), a && e.addEventListener("resize", n);
	});
	let d = l && s ? ya(l, n) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? Zi(e) : null;
	c && g();
	function g() {
		let t = Zi(e);
		h && !va(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var xa = gi, Sa = _i, Ca = ui, wa = yi, Ta = pi, Ea = li, Da = vi, Oa = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = {
		platform: _a,
		...n
	}, a = {
		...i.platform,
		_c: r
	};
	return ci(e, t, {
		...i,
		platform: a
	});
}, ka = typeof document < "u" ? u : function() {};
function Aa(e, t) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (typeof e == "function" && e.toString() === t.toString()) return !0;
	let n, r, i;
	if (e && t && typeof e == "object") {
		if (Array.isArray(e)) {
			if (n = e.length, n !== t.length) return !1;
			for (r = n; r-- !== 0;) if (!Aa(e[r], t[r])) return !1;
			return !0;
		}
		if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length) return !1;
		for (r = n; r-- !== 0;) if (!{}.hasOwnProperty.call(t, i[r])) return !1;
		for (r = n; r-- !== 0;) {
			let n = i[r];
			if (!(n === "_owner" && e.$$typeof) && !Aa(e[n], t[n])) return !1;
		}
		return !0;
	}
	return e !== e && t !== t;
}
function ja(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Ma(e, t) {
	let n = ja(e);
	return Math.round(t * n) / n;
}
function Na(e) {
	let t = r.useRef(e);
	return ka(() => {
		t.current = e;
	}), t;
}
function Pa(e) {
	e === void 0 && (e = {});
	let { placement: t = "bottom", strategy: n = "absolute", middleware: i = [], platform: a, elements: { reference: o, floating: s } = {}, transform: c = !0, whileElementsMounted: l, open: u } = e, [d, f] = r.useState({
		x: 0,
		y: 0,
		strategy: n,
		placement: t,
		middlewareData: {},
		isPositioned: !1
	}), [p, m] = r.useState(i);
	Aa(p, i) || m(i);
	let [g, _] = r.useState(null), [v, y] = r.useState(null), b = r.useCallback((e) => {
		e !== w.current && (w.current = e, _(e));
	}, []), x = r.useCallback((e) => {
		e !== T.current && (T.current = e, y(e));
	}, []), S = o || g, C = s || v, w = r.useRef(null), T = r.useRef(null), E = r.useRef(d), ee = l != null, D = Na(l), te = Na(a), O = Na(u), k = r.useCallback(() => {
		if (!w.current || !T.current) return;
		let e = {
			placement: t,
			strategy: n,
			middleware: p
		};
		te.current && (e.platform = te.current), Oa(w.current, T.current, e).then((e) => {
			let t = {
				...e,
				isPositioned: O.current !== !1
			};
			A.current && !Aa(E.current, t) && (E.current = t, h.flushSync(() => {
				f(t);
			}));
		});
	}, [
		p,
		t,
		n,
		te,
		O
	]);
	ka(() => {
		u === !1 && E.current.isPositioned && (E.current.isPositioned = !1, f((e) => ({
			...e,
			isPositioned: !1
		})));
	}, [u]);
	let A = r.useRef(!1);
	ka(() => (A.current = !0, () => {
		A.current = !1;
	}), []), ka(() => {
		if (S && (w.current = S), C && (T.current = C), S && C) {
			if (D.current) return D.current(S, C, k);
			k();
		}
	}, [
		S,
		C,
		k,
		D,
		ee
	]);
	let j = r.useMemo(() => ({
		reference: w,
		floating: T,
		setReference: b,
		setFloating: x
	}), [b, x]), M = r.useMemo(() => ({
		reference: S,
		floating: C
	}), [S, C]), ne = r.useMemo(() => {
		let e = {
			position: n,
			left: 0,
			top: 0
		};
		if (!M.floating) return e;
		let t = Ma(M.floating, d.x), r = Ma(M.floating, d.y);
		return c ? {
			...e,
			transform: "translate(" + t + "px, " + r + "px)",
			...ja(M.floating) >= 1.5 && { willChange: "transform" }
		} : {
			position: n,
			left: t,
			top: r
		};
	}, [
		n,
		c,
		M.floating,
		d.x,
		d.y
	]);
	return r.useMemo(() => ({
		...d,
		update: k,
		refs: j,
		elements: M,
		floatingStyles: ne
	}), [
		d,
		k,
		j,
		M,
		ne
	]);
}
var Fa = (e) => {
	function t(e) {
		return {}.hasOwnProperty.call(e, "current");
	}
	return {
		name: "arrow",
		options: e,
		fn(n) {
			let { element: r, padding: i } = typeof e == "function" ? e(n) : e;
			return r && t(r) ? r.current == null ? {} : Ea({
				element: r.current,
				padding: i
			}).fn(n) : r ? Ea({
				element: r,
				padding: i
			}).fn(n) : {};
		}
	};
}, Ia = (e, t) => {
	let n = xa(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, La = (e, t) => {
	let n = Sa(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Ra = (e, t) => ({
	fn: Da(e).fn,
	options: [e, t]
}), za = (e, t) => {
	let n = Ca(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Ba = (e, t) => {
	let n = wa(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Va = (e, t) => {
	let n = Ta(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Ha = (e, t) => {
	let n = Fa(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Ua = "Arrow", Wa = r.forwardRef((e, t) => {
	let { children: n, width: r = 10, height: i = 5, ...a } = e;
	return /* @__PURE__ */ v(z.svg, {
		...a,
		ref: t,
		width: r,
		height: i,
		viewBox: "0 0 30 10",
		preserveAspectRatio: "none",
		children: e.asChild ? n : /* @__PURE__ */ v("polygon", { points: "0,0 30,0 15,10" })
	});
});
Wa.displayName = Ua;
var Ga = Wa, Ka = "Popper", [qa, Ja] = ze(Ka), [Ya, Xa] = qa(Ka), Za = (e) => {
	let { __scopePopper: t, children: n } = e, [i, a] = r.useState(null);
	return /* @__PURE__ */ v(Ya, {
		scope: t,
		anchor: i,
		onAnchorChange: a,
		children: n
	});
};
Za.displayName = Ka;
var Qa = "PopperAnchor", $a = r.forwardRef((e, t) => {
	let { __scopePopper: n, virtualRef: i, ...a } = e, o = Xa(Qa, n), s = r.useRef(null), c = R(t, s), l = r.useRef(null);
	return r.useEffect(() => {
		let e = l.current;
		l.current = i?.current || s.current, e !== l.current && o.onAnchorChange(l.current);
	}), i ? null : /* @__PURE__ */ v(z.div, {
		...a,
		ref: c
	});
});
$a.displayName = Qa;
var eo = "PopperContent", [to, no] = qa(eo), ro = r.forwardRef((e, t) => {
	let { __scopePopper: n, side: i = "bottom", sideOffset: a = 0, align: o = "center", alignOffset: s = 0, arrowPadding: c = 0, avoidCollisions: l = !0, collisionBoundary: u = [], collisionPadding: d = 0, sticky: f = "partial", hideWhenDetached: p = !1, updatePositionStrategy: m = "optimized", onPlaced: h, ...g } = e, _ = Xa(eo, n), [y, b] = r.useState(null), x = R(t, (e) => b(e)), [S, C] = r.useState(null), w = mr(S), T = w?.width ?? 0, E = w?.height ?? 0, ee = i + (o === "center" ? "" : "-" + o), D = typeof d == "number" ? d : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...d
	}, te = Array.isArray(u) ? u : [u], O = te.length > 0, k = {
		padding: D,
		boundary: te.filter(so),
		altBoundary: O
	}, { refs: A, floatingStyles: j, placement: M, isPositioned: ne, middlewareData: N } = Pa({
		strategy: "fixed",
		placement: ee,
		whileElementsMounted: (...e) => ba(...e, { animationFrame: m === "always" }),
		elements: { reference: _.anchor },
		middleware: [
			Ia({
				mainAxis: a + E,
				alignmentAxis: s
			}),
			l && La({
				mainAxis: !0,
				crossAxis: !1,
				limiter: f === "partial" ? Ra() : void 0,
				...k
			}),
			l && za({ ...k }),
			Ba({
				...k,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--radix-popper-available-width", `${n}px`), o.setProperty("--radix-popper-available-height", `${r}px`), o.setProperty("--radix-popper-anchor-width", `${i}px`), o.setProperty("--radix-popper-anchor-height", `${a}px`);
				}
			}),
			S && Ha({
				element: S,
				padding: c
			}),
			co({
				arrowWidth: T,
				arrowHeight: E
			}),
			p && Va({
				strategy: "referenceHidden",
				...k
			})
		]
	}), [re, ie] = lo(M), ae = ct(h);
	V(() => {
		ne && ae?.();
	}, [ne, ae]);
	let oe = N.arrow?.x, P = N.arrow?.y, F = N.arrow?.centerOffset !== 0, [se, I] = r.useState();
	return V(() => {
		y && I(window.getComputedStyle(y).zIndex);
	}, [y]), /* @__PURE__ */ v("div", {
		ref: A.setFloating,
		"data-radix-popper-content-wrapper": "",
		style: {
			...j,
			transform: ne ? j.transform : "translate(0, -200%)",
			minWidth: "max-content",
			zIndex: se,
			"--radix-popper-transform-origin": [N.transformOrigin?.x, N.transformOrigin?.y].join(" "),
			...N.hide?.referenceHidden && {
				visibility: "hidden",
				pointerEvents: "none"
			}
		},
		dir: e.dir,
		children: /* @__PURE__ */ v(to, {
			scope: n,
			placedSide: re,
			onArrowChange: C,
			arrowX: oe,
			arrowY: P,
			shouldHideArrow: F,
			children: /* @__PURE__ */ v(z.div, {
				"data-side": re,
				"data-align": ie,
				...g,
				ref: x,
				style: {
					...g.style,
					animation: ne ? void 0 : "none"
				}
			})
		})
	});
});
ro.displayName = eo;
var io = "PopperArrow", ao = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
}, oo = r.forwardRef(function(e, t) {
	let { __scopePopper: n, ...r } = e, i = no(io, n), a = ao[i.placedSide];
	return /* @__PURE__ */ v("span", {
		ref: i.onArrowChange,
		style: {
			position: "absolute",
			left: i.arrowX,
			top: i.arrowY,
			[a]: 0,
			transformOrigin: {
				top: "",
				right: "0 0",
				bottom: "center 0",
				left: "100% 0"
			}[i.placedSide],
			transform: {
				top: "translateY(100%)",
				right: "translateY(50%) rotate(90deg) translateX(-50%)",
				bottom: "rotate(180deg)",
				left: "translateY(50%) rotate(-90deg) translateX(50%)"
			}[i.placedSide],
			visibility: i.shouldHideArrow ? "hidden" : void 0
		},
		children: /* @__PURE__ */ v(Ga, {
			...r,
			ref: t,
			style: {
				...r.style,
				display: "block"
			}
		})
	});
});
oo.displayName = io;
function so(e) {
	return e !== null;
}
var co = (e) => ({
	name: "transformOrigin",
	options: e,
	fn(t) {
		let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = lo(n), u = {
			start: "0%",
			center: "50%",
			end: "100%"
		}[l], d = (i.arrow?.x ?? 0) + o / 2, f = (i.arrow?.y ?? 0) + s / 2, p = "", m = "";
		return c === "bottom" ? (p = a ? u : `${d}px`, m = `${-s}px`) : c === "top" ? (p = a ? u : `${d}px`, m = `${r.floating.height + s}px`) : c === "right" ? (p = `${-s}px`, m = a ? u : `${f}px`) : c === "left" && (p = `${r.floating.width + s}px`, m = a ? u : `${f}px`), { data: {
			x: p,
			y: m
		} };
	}
});
function lo(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
var uo = Za, fo = $a, po = ro, mo = oo, ho = "Label", go = r.forwardRef((e, t) => /* @__PURE__ */ v(z.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
go.displayName = ho;
var _o = go;
//#endregion
//#region node_modules/@radix-ui/number/dist/index.mjs
function vo(e, [t, n]) {
	return Math.min(n, Math.max(t, e));
}
//#endregion
//#region node_modules/@radix-ui/react-popover/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function yo(e) {
	let t = /* @__PURE__ */ bo(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(So);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ v(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ v(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function bo(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = wo(n), a = Co(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? Oe(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var xo = Symbol("radix.slottable");
function So(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === xo;
}
function Co(e, t) {
	let n = { ...t };
	for (let r in t) {
		let i = e[r], a = t[r];
		/^on[A-Z]/.test(r) ? i && a ? n[r] = (...e) => {
			let t = a(...e);
			return i(...e), t;
		} : i && (n[r] = i) : r === "style" ? n[r] = {
			...i,
			...a
		} : r === "className" && (n[r] = [i, a].filter(Boolean).join(" "));
	}
	return {
		...e,
		...n
	};
}
function wo(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-popover/dist/index.mjs
var To = "Popover", [Eo, Do] = ze(To, [Ja]), Oo = Ja(), [ko, Ao] = Eo(To), jo = (e) => {
	let { __scopePopover: t, children: n, open: i, defaultOpen: a, onOpenChange: o, modal: s = !1 } = e, c = Oo(t), l = r.useRef(null), [u, d] = r.useState(!1), [f, p] = Ye({
		prop: i,
		defaultProp: a ?? !1,
		onChange: o,
		caller: To
	});
	return /* @__PURE__ */ v(uo, {
		...c,
		children: /* @__PURE__ */ v(ko, {
			scope: t,
			contentId: at(),
			triggerRef: l,
			open: f,
			onOpenChange: p,
			onOpenToggle: r.useCallback(() => p((e) => !e), [p]),
			hasCustomAnchor: u,
			onCustomAnchorAdd: r.useCallback(() => d(!0), []),
			onCustomAnchorRemove: r.useCallback(() => d(!1), []),
			modal: s,
			children: n
		})
	});
};
jo.displayName = To;
var Mo = "PopoverAnchor", No = r.forwardRef((e, t) => {
	let { __scopePopover: n, ...i } = e, a = Ao(Mo, n), o = Oo(n), { onCustomAnchorAdd: s, onCustomAnchorRemove: c } = a;
	return r.useEffect(() => (s(), () => c()), [s, c]), /* @__PURE__ */ v(fo, {
		...o,
		...i,
		ref: t
	});
});
No.displayName = Mo;
var Po = "PopoverTrigger", Fo = r.forwardRef((e, t) => {
	let { __scopePopover: n, ...r } = e, i = Ao(Po, n), a = Oo(n), o = R(t, i.triggerRef), s = /* @__PURE__ */ v(z.button, {
		type: "button",
		"aria-haspopup": "dialog",
		"aria-expanded": i.open,
		"aria-controls": i.contentId,
		"data-state": Xo(i.open),
		...r,
		ref: o,
		onClick: B(e.onClick, i.onOpenToggle)
	});
	return i.hasCustomAnchor ? s : /* @__PURE__ */ v(fo, {
		asChild: !0,
		...a,
		children: s
	});
});
Fo.displayName = Po;
var Io = "PopoverPortal", [Lo, Ro] = Eo(Io, { forceMount: void 0 }), zo = (e) => {
	let { __scopePopover: t, forceMount: n, children: r, container: i } = e, a = Ao(Io, t);
	return /* @__PURE__ */ v(Lo, {
		scope: t,
		forceMount: n,
		children: /* @__PURE__ */ v($e, {
			present: n || a.open,
			children: /* @__PURE__ */ v(Bt, {
				asChild: !0,
				container: i,
				children: r
			})
		})
	});
};
zo.displayName = Io;
var Bo = "PopoverContent", Vo = r.forwardRef((e, t) => {
	let n = Ro(Bo, e.__scopePopover), { forceMount: r = n.forceMount, ...i } = e, a = Ao(Bo, e.__scopePopover);
	return /* @__PURE__ */ v($e, {
		present: r || a.open,
		children: a.modal ? /* @__PURE__ */ v(Uo, {
			...i,
			ref: t
		}) : /* @__PURE__ */ v(Wo, {
			...i,
			ref: t
		})
	});
});
Vo.displayName = Bo;
var Ho = /* @__PURE__ */ yo("PopoverContent.RemoveScroll"), Uo = r.forwardRef((e, t) => {
	let n = Ao(Bo, e.__scopePopover), i = r.useRef(null), a = R(t, i), o = r.useRef(!1);
	return r.useEffect(() => {
		let e = i.current;
		if (e) return fr(e);
	}, []), /* @__PURE__ */ v(rr, {
		as: Ho,
		allowPinchZoom: !0,
		children: /* @__PURE__ */ v(Go, {
			...e,
			ref: a,
			trapFocus: n.open,
			disableOutsidePointerEvents: !0,
			onCloseAutoFocus: B(e.onCloseAutoFocus, (e) => {
				e.preventDefault(), o.current || n.triggerRef.current?.focus();
			}),
			onPointerDownOutside: B(e.onPointerDownOutside, (e) => {
				let t = e.detail.originalEvent, n = t.button === 0 && t.ctrlKey === !0;
				o.current = t.button === 2 || n;
			}, { checkForDefaultPrevented: !1 }),
			onFocusOutside: B(e.onFocusOutside, (e) => e.preventDefault(), { checkForDefaultPrevented: !1 })
		})
	});
}), Wo = r.forwardRef((e, t) => {
	let n = Ao(Bo, e.__scopePopover), i = r.useRef(!1), a = r.useRef(!1);
	return /* @__PURE__ */ v(Go, {
		...e,
		ref: t,
		trapFocus: !1,
		disableOutsidePointerEvents: !1,
		onCloseAutoFocus: (t) => {
			e.onCloseAutoFocus?.(t), t.defaultPrevented || (i.current || n.triggerRef.current?.focus(), t.preventDefault()), i.current = !1, a.current = !1;
		},
		onInteractOutside: (t) => {
			e.onInteractOutside?.(t), t.defaultPrevented || (i.current = !0, t.detail.originalEvent.type === "pointerdown" && (a.current = !0));
			let r = t.target;
			n.triggerRef.current?.contains(r) && t.preventDefault(), t.detail.originalEvent.type === "focusin" && a.current && t.preventDefault();
		}
	});
}), Go = r.forwardRef((e, t) => {
	let { __scopePopover: n, trapFocus: r, onOpenAutoFocus: i, onCloseAutoFocus: a, disableOutsidePointerEvents: o, onEscapeKeyDown: s, onPointerDownOutside: c, onFocusOutside: l, onInteractOutside: u, ...d } = e, f = Ao(Bo, n), p = Oo(n);
	return Ht(), /* @__PURE__ */ v(Dt, {
		asChild: !0,
		loop: !0,
		trapped: r,
		onMountAutoFocus: i,
		onUnmountAutoFocus: a,
		children: /* @__PURE__ */ v(gt, {
			asChild: !0,
			disableOutsidePointerEvents: o,
			onInteractOutside: u,
			onEscapeKeyDown: s,
			onPointerDownOutside: c,
			onFocusOutside: l,
			onDismiss: () => f.onOpenChange(!1),
			children: /* @__PURE__ */ v(po, {
				"data-state": Xo(f.open),
				role: "dialog",
				id: f.contentId,
				...p,
				...d,
				ref: t,
				style: {
					...d.style,
					"--radix-popover-content-transform-origin": "var(--radix-popper-transform-origin)",
					"--radix-popover-content-available-width": "var(--radix-popper-available-width)",
					"--radix-popover-content-available-height": "var(--radix-popper-available-height)",
					"--radix-popover-trigger-width": "var(--radix-popper-anchor-width)",
					"--radix-popover-trigger-height": "var(--radix-popper-anchor-height)"
				}
			})
		})
	});
}), Ko = "PopoverClose", qo = r.forwardRef((e, t) => {
	let { __scopePopover: n, ...r } = e, i = Ao(Ko, n);
	return /* @__PURE__ */ v(z.button, {
		type: "button",
		...r,
		ref: t,
		onClick: B(e.onClick, () => i.onOpenChange(!1))
	});
});
qo.displayName = Ko;
var Jo = "PopoverArrow", Yo = r.forwardRef((e, t) => {
	let { __scopePopover: n, ...r } = e;
	return /* @__PURE__ */ v(mo, {
		...Oo(n),
		...r,
		ref: t
	});
});
Yo.displayName = Jo;
function Xo(e) {
	return e ? "open" : "closed";
}
var Zo = jo, Qo = Fo, $o = zo, es = Vo;
//#endregion
//#region node_modules/@radix-ui/react-select/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function ts(e) {
	let t = /* @__PURE__ */ ns(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(is);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ v(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ v(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function ns(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = os(n), a = as(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? Oe(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var rs = Symbol("radix.slottable");
function is(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === rs;
}
function as(e, t) {
	let n = { ...t };
	for (let r in t) {
		let i = e[r], a = t[r];
		/^on[A-Z]/.test(r) ? i && a ? n[r] = (...e) => {
			let t = a(...e);
			return i(...e), t;
		} : i && (n[r] = i) : r === "style" ? n[r] = {
			...i,
			...a
		} : r === "className" && (n[r] = [i, a].filter(Boolean).join(" "));
	}
	return {
		...e,
		...n
	};
}
function os(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-select/dist/index.mjs
var ss = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], cs = [" ", "Enter"], ls = "Select", [us, ds, fs] = qe(ls), [ps, ms] = ze(ls, [fs, Ja]), hs = Ja(), [gs, _s] = ps(ls), [vs, ys] = ps(ls), bs = (e) => {
	let { __scopeSelect: t, children: n, open: i, defaultOpen: a, onOpenChange: o, value: s, defaultValue: c, onValueChange: l, dir: u, name: d, autoComplete: f, disabled: p, required: m, form: h } = e, g = hs(t), [_, b] = r.useState(null), [x, S] = r.useState(null), [C, w] = r.useState(!1), T = st(u), [E, ee] = Ye({
		prop: i,
		defaultProp: a ?? !1,
		onChange: o,
		caller: ls
	}), [D, te] = Ye({
		prop: s,
		defaultProp: c,
		onChange: l,
		caller: ls
	}), O = r.useRef(null), k = _ ? h || !!_.closest("form") : !0, [A, j] = r.useState(/* @__PURE__ */ new Set()), M = Array.from(A).map((e) => e.props.value).join(";");
	return /* @__PURE__ */ v(uo, {
		...g,
		children: /* @__PURE__ */ y(gs, {
			required: m,
			scope: t,
			trigger: _,
			onTriggerChange: b,
			valueNode: x,
			onValueNodeChange: S,
			valueNodeHasChildren: C,
			onValueNodeHasChildrenChange: w,
			contentId: at(),
			value: D,
			onValueChange: te,
			open: E,
			onOpenChange: ee,
			dir: T,
			triggerPointerDownPosRef: O,
			disabled: p,
			children: [/* @__PURE__ */ v(us.Provider, {
				scope: t,
				children: /* @__PURE__ */ v(vs, {
					scope: e.__scopeSelect,
					onNativeOptionAdd: r.useCallback((e) => {
						j((t) => new Set(t).add(e));
					}, []),
					onNativeOptionRemove: r.useCallback((e) => {
						j((t) => {
							let n = new Set(t);
							return n.delete(e), n;
						});
					}, []),
					children: n
				})
			}), k ? /* @__PURE__ */ y(hc, {
				"aria-hidden": !0,
				required: m,
				tabIndex: -1,
				name: d,
				autoComplete: f,
				value: D,
				onChange: (e) => te(e.target.value),
				disabled: p,
				form: h,
				children: [D === void 0 ? /* @__PURE__ */ v("option", { value: "" }) : null, Array.from(A)]
			}, M) : null]
		})
	});
};
bs.displayName = ls;
var xs = "SelectTrigger", Ss = r.forwardRef((e, t) => {
	let { __scopeSelect: n, disabled: i = !1, ...a } = e, o = hs(n), s = _s(xs, n), c = s.disabled || i, l = R(t, s.onTriggerChange), u = ds(n), d = r.useRef("touch"), [f, p, m] = _c((e) => {
		let t = u().filter((e) => !e.disabled), n = vc(t, e, t.find((e) => e.value === s.value));
		n !== void 0 && s.onValueChange(n.value);
	}), h = (e) => {
		c || (s.onOpenChange(!0), m()), e && (s.triggerPointerDownPosRef.current = {
			x: Math.round(e.pageX),
			y: Math.round(e.pageY)
		});
	};
	return /* @__PURE__ */ v(fo, {
		asChild: !0,
		...o,
		children: /* @__PURE__ */ v(z.button, {
			type: "button",
			role: "combobox",
			"aria-controls": s.contentId,
			"aria-expanded": s.open,
			"aria-required": s.required,
			"aria-autocomplete": "none",
			dir: s.dir,
			"data-state": s.open ? "open" : "closed",
			disabled: c,
			"data-disabled": c ? "" : void 0,
			"data-placeholder": gc(s.value) ? "" : void 0,
			...a,
			ref: l,
			onClick: B(a.onClick, (e) => {
				e.currentTarget.focus(), d.current !== "mouse" && h(e);
			}),
			onPointerDown: B(a.onPointerDown, (e) => {
				d.current = e.pointerType;
				let t = e.target;
				t.hasPointerCapture(e.pointerId) && t.releasePointerCapture(e.pointerId), e.button === 0 && e.ctrlKey === !1 && e.pointerType === "mouse" && (h(e), e.preventDefault());
			}),
			onKeyDown: B(a.onKeyDown, (e) => {
				let t = f.current !== "";
				!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && p(e.key), !(t && e.key === " ") && ss.includes(e.key) && (h(), e.preventDefault());
			})
		})
	});
});
Ss.displayName = xs;
var Cs = "SelectValue", ws = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: r, style: i, children: a, placeholder: o = "", ...s } = e, c = _s(Cs, n), { onValueNodeHasChildrenChange: l } = c, u = a !== void 0, d = R(t, c.onValueNodeChange);
	return V(() => {
		l(u);
	}, [l, u]), /* @__PURE__ */ v(z.span, {
		...s,
		ref: d,
		style: { pointerEvents: "none" },
		children: gc(c.value) ? /* @__PURE__ */ v(_, { children: o }) : a
	});
});
ws.displayName = Cs;
var Ts = "SelectIcon", Es = r.forwardRef((e, t) => {
	let { __scopeSelect: n, children: r, ...i } = e;
	return /* @__PURE__ */ v(z.span, {
		"aria-hidden": !0,
		...i,
		ref: t,
		children: r || "▼"
	});
});
Es.displayName = Ts;
var Ds = "SelectPortal", Os = (e) => /* @__PURE__ */ v(Bt, {
	asChild: !0,
	...e
});
Os.displayName = Ds;
var ks = "SelectContent", As = r.forwardRef((e, t) => {
	let n = _s(ks, e.__scopeSelect), [i, a] = r.useState();
	if (V(() => {
		a(new DocumentFragment());
	}, []), !n.open) {
		let t = i;
		return t ? h.createPortal(/* @__PURE__ */ v(Ms, {
			scope: e.__scopeSelect,
			children: /* @__PURE__ */ v(us.Slot, {
				scope: e.__scopeSelect,
				children: /* @__PURE__ */ v("div", { children: e.children })
			})
		}), t) : null;
	}
	return /* @__PURE__ */ v(Is, {
		...e,
		ref: t
	});
});
As.displayName = ks;
var js = 10, [Ms, Ns] = ps(ks), Ps = "SelectContentImpl", Fs = /* @__PURE__ */ ts("SelectContent.RemoveScroll"), Is = r.forwardRef((e, t) => {
	let { __scopeSelect: n, position: i = "item-aligned", onCloseAutoFocus: a, onEscapeKeyDown: o, onPointerDownOutside: s, side: c, sideOffset: l, align: u, alignOffset: d, arrowPadding: f, collisionBoundary: p, collisionPadding: m, sticky: h, hideWhenDetached: g, avoidCollisions: _, ...y } = e, b = _s(ks, n), [x, S] = r.useState(null), [C, w] = r.useState(null), T = R(t, (e) => S(e)), [E, ee] = r.useState(null), [D, te] = r.useState(null), O = ds(n), [k, A] = r.useState(!1), j = r.useRef(!1);
	r.useEffect(() => {
		if (x) return fr(x);
	}, [x]), Ht();
	let M = r.useCallback((e) => {
		let [t, ...n] = O().map((e) => e.ref.current), [r] = n.slice(-1), i = document.activeElement;
		for (let n of e) if (n === i || (n?.scrollIntoView({ block: "nearest" }), n === t && C && (C.scrollTop = 0), n === r && C && (C.scrollTop = C.scrollHeight), n?.focus(), document.activeElement !== i)) return;
	}, [O, C]), ne = r.useCallback(() => M([E, x]), [
		M,
		E,
		x
	]);
	r.useEffect(() => {
		k && ne();
	}, [k, ne]);
	let { onOpenChange: N, triggerPointerDownPosRef: re } = b;
	r.useEffect(() => {
		if (x) {
			let e = {
				x: 0,
				y: 0
			}, t = (t) => {
				e = {
					x: Math.abs(Math.round(t.pageX) - (re.current?.x ?? 0)),
					y: Math.abs(Math.round(t.pageY) - (re.current?.y ?? 0))
				};
			}, n = (n) => {
				e.x <= 10 && e.y <= 10 ? n.preventDefault() : x.contains(n.target) || N(!1), document.removeEventListener("pointermove", t), re.current = null;
			};
			return re.current !== null && (document.addEventListener("pointermove", t), document.addEventListener("pointerup", n, {
				capture: !0,
				once: !0
			})), () => {
				document.removeEventListener("pointermove", t), document.removeEventListener("pointerup", n, { capture: !0 });
			};
		}
	}, [
		x,
		N,
		re
	]), r.useEffect(() => {
		let e = () => N(!1);
		return window.addEventListener("blur", e), window.addEventListener("resize", e), () => {
			window.removeEventListener("blur", e), window.removeEventListener("resize", e);
		};
	}, [N]);
	let [ie, ae] = _c((e) => {
		let t = O().filter((e) => !e.disabled), n = vc(t, e, t.find((e) => e.ref.current === document.activeElement));
		n && setTimeout(() => n.ref.current.focus());
	}), oe = r.useCallback((e, t, n) => {
		let r = !j.current && !n;
		(b.value !== void 0 && b.value === t || r) && (ee(e), r && (j.current = !0));
	}, [b.value]), P = r.useCallback(() => x?.focus(), [x]), F = r.useCallback((e, t, n) => {
		let r = !j.current && !n;
		(b.value !== void 0 && b.value === t || r) && te(e);
	}, [b.value]), se = i === "popper" ? Bs : Rs, I = se === Bs ? {
		side: c,
		sideOffset: l,
		align: u,
		alignOffset: d,
		arrowPadding: f,
		collisionBoundary: p,
		collisionPadding: m,
		sticky: h,
		hideWhenDetached: g,
		avoidCollisions: _
	} : {};
	return /* @__PURE__ */ v(Ms, {
		scope: n,
		content: x,
		viewport: C,
		onViewportChange: w,
		itemRefCallback: oe,
		selectedItem: E,
		onItemLeave: P,
		itemTextRefCallback: F,
		focusSelectedItem: ne,
		selectedItemText: D,
		position: i,
		isPositioned: k,
		searchRef: ie,
		children: /* @__PURE__ */ v(rr, {
			as: Fs,
			allowPinchZoom: !0,
			children: /* @__PURE__ */ v(Dt, {
				asChild: !0,
				trapped: b.open,
				onMountAutoFocus: (e) => {
					e.preventDefault();
				},
				onUnmountAutoFocus: B(a, (e) => {
					b.trigger?.focus({ preventScroll: !0 }), e.preventDefault();
				}),
				children: /* @__PURE__ */ v(gt, {
					asChild: !0,
					disableOutsidePointerEvents: !0,
					onEscapeKeyDown: o,
					onPointerDownOutside: s,
					onFocusOutside: (e) => e.preventDefault(),
					onDismiss: () => b.onOpenChange(!1),
					children: /* @__PURE__ */ v(se, {
						role: "listbox",
						id: b.contentId,
						"data-state": b.open ? "open" : "closed",
						dir: b.dir,
						onContextMenu: (e) => e.preventDefault(),
						...y,
						...I,
						onPlaced: () => A(!0),
						ref: T,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none",
							...y.style
						},
						onKeyDown: B(y.onKeyDown, (e) => {
							let t = e.ctrlKey || e.altKey || e.metaKey;
							if (e.key === "Tab" && e.preventDefault(), !t && e.key.length === 1 && ae(e.key), [
								"ArrowUp",
								"ArrowDown",
								"Home",
								"End"
							].includes(e.key)) {
								let t = O().filter((e) => !e.disabled).map((e) => e.ref.current);
								if (["ArrowUp", "End"].includes(e.key) && (t = t.slice().reverse()), ["ArrowUp", "ArrowDown"].includes(e.key)) {
									let n = e.target, r = t.indexOf(n);
									t = t.slice(r + 1);
								}
								setTimeout(() => M(t)), e.preventDefault();
							}
						})
					})
				})
			})
		})
	});
});
Is.displayName = Ps;
var Ls = "SelectItemAlignedPosition", Rs = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onPlaced: i, ...a } = e, o = _s(ks, n), s = Ns(ks, n), [c, l] = r.useState(null), [u, d] = r.useState(null), f = R(t, (e) => d(e)), p = ds(n), m = r.useRef(!1), h = r.useRef(!0), { viewport: g, selectedItem: _, selectedItemText: y, focusSelectedItem: b } = s, x = r.useCallback(() => {
		if (o.trigger && o.valueNode && c && u && g && _ && y) {
			let e = o.trigger.getBoundingClientRect(), t = u.getBoundingClientRect(), n = o.valueNode.getBoundingClientRect(), r = y.getBoundingClientRect();
			if (o.dir !== "rtl") {
				let i = r.left - t.left, a = n.left - i, o = e.left - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - js, d = vo(a, [js, Math.max(js, u - l)]);
				c.style.minWidth = s + "px", c.style.left = d + "px";
			} else {
				let i = t.right - r.right, a = window.innerWidth - n.right - i, o = window.innerWidth - e.right - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - js, d = vo(a, [js, Math.max(js, u - l)]);
				c.style.minWidth = s + "px", c.style.right = d + "px";
			}
			let a = p(), s = window.innerHeight - js * 2, l = g.scrollHeight, d = window.getComputedStyle(u), f = parseInt(d.borderTopWidth, 10), h = parseInt(d.paddingTop, 10), v = parseInt(d.borderBottomWidth, 10), b = parseInt(d.paddingBottom, 10), x = f + h + l + b + v, S = Math.min(_.offsetHeight * 5, x), C = window.getComputedStyle(g), w = parseInt(C.paddingTop, 10), T = parseInt(C.paddingBottom, 10), E = e.top + e.height / 2 - js, ee = s - E, D = _.offsetHeight / 2, te = _.offsetTop + D, O = f + h + te, k = x - O;
			if (O <= E) {
				let e = a.length > 0 && _ === a[a.length - 1].ref.current;
				c.style.bottom = "0px";
				let t = u.clientHeight - g.offsetTop - g.offsetHeight, n = O + Math.max(ee, D + (e ? T : 0) + t + v);
				c.style.height = n + "px";
			} else {
				let e = a.length > 0 && _ === a[0].ref.current;
				c.style.top = "0px";
				let t = Math.max(E, f + g.offsetTop + (e ? w : 0) + D) + k;
				c.style.height = t + "px", g.scrollTop = O - E + g.offsetTop;
			}
			c.style.margin = `${js}px 0`, c.style.minHeight = S + "px", c.style.maxHeight = s + "px", i?.(), requestAnimationFrame(() => m.current = !0);
		}
	}, [
		p,
		o.trigger,
		o.valueNode,
		c,
		u,
		g,
		_,
		y,
		o.dir,
		i
	]);
	V(() => x(), [x]);
	let [S, C] = r.useState();
	return V(() => {
		u && C(window.getComputedStyle(u).zIndex);
	}, [u]), /* @__PURE__ */ v(Vs, {
		scope: n,
		contentWrapper: c,
		shouldExpandOnScrollRef: m,
		onScrollButtonChange: r.useCallback((e) => {
			e && h.current === !0 && (x(), b?.(), h.current = !1);
		}, [x, b]),
		children: /* @__PURE__ */ v("div", {
			ref: l,
			style: {
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: S
			},
			children: /* @__PURE__ */ v(z.div, {
				...a,
				ref: f,
				style: {
					boxSizing: "border-box",
					maxHeight: "100%",
					...a.style
				}
			})
		})
	});
});
Rs.displayName = Ls;
var zs = "SelectPopperPosition", Bs = r.forwardRef((e, t) => {
	let { __scopeSelect: n, align: r = "start", collisionPadding: i = js, ...a } = e;
	return /* @__PURE__ */ v(po, {
		...hs(n),
		...a,
		ref: t,
		align: r,
		collisionPadding: i,
		style: {
			boxSizing: "border-box",
			...a.style,
			"--radix-select-content-transform-origin": "var(--radix-popper-transform-origin)",
			"--radix-select-content-available-width": "var(--radix-popper-available-width)",
			"--radix-select-content-available-height": "var(--radix-popper-available-height)",
			"--radix-select-trigger-width": "var(--radix-popper-anchor-width)",
			"--radix-select-trigger-height": "var(--radix-popper-anchor-height)"
		}
	});
});
Bs.displayName = zs;
var [Vs, Hs] = ps(ks, {}), Us = "SelectViewport", Ws = r.forwardRef((e, t) => {
	let { __scopeSelect: n, nonce: i, ...a } = e, o = Ns(Us, n), s = Hs(Us, n), c = R(t, o.onViewportChange), l = r.useRef(0);
	return /* @__PURE__ */ y(_, { children: [/* @__PURE__ */ v("style", {
		dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" },
		nonce: i
	}), /* @__PURE__ */ v(us.Slot, {
		scope: n,
		children: /* @__PURE__ */ v(z.div, {
			"data-radix-select-viewport": "",
			role: "presentation",
			...a,
			ref: c,
			style: {
				position: "relative",
				flex: 1,
				overflow: "hidden auto",
				...a.style
			},
			onScroll: B(a.onScroll, (e) => {
				let t = e.currentTarget, { contentWrapper: n, shouldExpandOnScrollRef: r } = s;
				if (r?.current && n) {
					let e = Math.abs(l.current - t.scrollTop);
					if (e > 0) {
						let r = window.innerHeight - js * 2, i = parseFloat(n.style.minHeight), a = parseFloat(n.style.height), o = Math.max(i, a);
						if (o < r) {
							let i = o + e, a = Math.min(r, i), s = i - a;
							n.style.height = a + "px", n.style.bottom === "0px" && (t.scrollTop = s > 0 ? s : 0, n.style.justifyContent = "flex-end");
						}
					}
				}
				l.current = t.scrollTop;
			})
		})
	})] });
});
Ws.displayName = Us;
var Gs = "SelectGroup", [Ks, qs] = ps(Gs), Js = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = at();
	return /* @__PURE__ */ v(Ks, {
		scope: n,
		id: i,
		children: /* @__PURE__ */ v(z.div, {
			role: "group",
			"aria-labelledby": i,
			...r,
			ref: t
		})
	});
});
Js.displayName = Gs;
var Ys = "SelectLabel", Xs = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = qs(Ys, n);
	return /* @__PURE__ */ v(z.div, {
		id: i.id,
		...r,
		ref: t
	});
});
Xs.displayName = Ys;
var Zs = "SelectItem", [Qs, $s] = ps(Zs), ec = r.forwardRef((e, t) => {
	let { __scopeSelect: n, value: i, disabled: a = !1, textValue: o, ...s } = e, c = _s(Zs, n), l = Ns(Zs, n), u = c.value === i, [d, f] = r.useState(o ?? ""), [p, m] = r.useState(!1), h = R(t, (e) => l.itemRefCallback?.(e, i, a)), g = at(), _ = r.useRef("touch"), y = () => {
		a || (c.onValueChange(i), c.onOpenChange(!1));
	};
	if (i === "") throw Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
	return /* @__PURE__ */ v(Qs, {
		scope: n,
		value: i,
		disabled: a,
		textId: g,
		isSelected: u,
		onItemTextChange: r.useCallback((e) => {
			f((t) => t || (e?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ v(us.ItemSlot, {
			scope: n,
			value: i,
			disabled: a,
			textValue: d,
			children: /* @__PURE__ */ v(z.div, {
				role: "option",
				"aria-labelledby": g,
				"data-highlighted": p ? "" : void 0,
				"aria-selected": u && p,
				"data-state": u ? "checked" : "unchecked",
				"aria-disabled": a || void 0,
				"data-disabled": a ? "" : void 0,
				tabIndex: a ? void 0 : -1,
				...s,
				ref: h,
				onFocus: B(s.onFocus, () => m(!0)),
				onBlur: B(s.onBlur, () => m(!1)),
				onClick: B(s.onClick, () => {
					_.current !== "mouse" && y();
				}),
				onPointerUp: B(s.onPointerUp, () => {
					_.current === "mouse" && y();
				}),
				onPointerDown: B(s.onPointerDown, (e) => {
					_.current = e.pointerType;
				}),
				onPointerMove: B(s.onPointerMove, (e) => {
					_.current = e.pointerType, a ? l.onItemLeave?.() : _.current === "mouse" && e.currentTarget.focus({ preventScroll: !0 });
				}),
				onPointerLeave: B(s.onPointerLeave, (e) => {
					e.currentTarget === document.activeElement && l.onItemLeave?.();
				}),
				onKeyDown: B(s.onKeyDown, (e) => {
					l.searchRef?.current !== "" && e.key === " " || (cs.includes(e.key) && y(), e.key === " " && e.preventDefault());
				})
			})
		})
	});
});
ec.displayName = Zs;
var tc = "SelectItemText", nc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: i, style: a, ...o } = e, s = _s(tc, n), c = Ns(tc, n), l = $s(tc, n), u = ys(tc, n), [d, f] = r.useState(null), p = R(t, (e) => f(e), l.onItemTextChange, (e) => c.itemTextRefCallback?.(e, l.value, l.disabled)), m = d?.textContent, g = r.useMemo(() => /* @__PURE__ */ v("option", {
		value: l.value,
		disabled: l.disabled,
		children: m
	}, l.value), [
		l.disabled,
		l.value,
		m
	]), { onNativeOptionAdd: b, onNativeOptionRemove: x } = u;
	return V(() => (b(g), () => x(g)), [
		b,
		x,
		g
	]), /* @__PURE__ */ y(_, { children: [/* @__PURE__ */ v(z.span, {
		id: l.textId,
		...o,
		ref: p
	}), l.isSelected && s.valueNode && !s.valueNodeHasChildren ? h.createPortal(o.children, s.valueNode) : null] });
});
nc.displayName = tc;
var rc = "SelectItemIndicator", ic = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return $s(rc, n).isSelected ? /* @__PURE__ */ v(z.span, {
		"aria-hidden": !0,
		...r,
		ref: t
	}) : null;
});
ic.displayName = rc;
var ac = "SelectScrollUpButton", oc = r.forwardRef((e, t) => {
	let n = Ns(ac, e.__scopeSelect), i = Hs(ac, e.__scopeSelect), [a, o] = r.useState(!1), s = R(t, i.onScrollButtonChange);
	return V(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				o(t.scrollTop > 0);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ v(lc, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop -= t.offsetHeight);
		}
	}) : null;
});
oc.displayName = ac;
var sc = "SelectScrollDownButton", cc = r.forwardRef((e, t) => {
	let n = Ns(sc, e.__scopeSelect), i = Hs(sc, e.__scopeSelect), [a, o] = r.useState(!1), s = R(t, i.onScrollButtonChange);
	return V(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				let e = t.scrollHeight - t.clientHeight;
				o(Math.ceil(t.scrollTop) < e);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ v(lc, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop += t.offsetHeight);
		}
	}) : null;
});
cc.displayName = sc;
var lc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onAutoScroll: i, ...a } = e, o = Ns("SelectScrollButton", n), s = r.useRef(null), c = ds(n), l = r.useCallback(() => {
		s.current !== null && (window.clearInterval(s.current), s.current = null);
	}, []);
	return r.useEffect(() => () => l(), [l]), V(() => {
		c().find((e) => e.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
	}, [c]), /* @__PURE__ */ v(z.div, {
		"aria-hidden": !0,
		...a,
		ref: t,
		style: {
			flexShrink: 0,
			...a.style
		},
		onPointerDown: B(a.onPointerDown, () => {
			s.current === null && (s.current = window.setInterval(i, 50));
		}),
		onPointerMove: B(a.onPointerMove, () => {
			o.onItemLeave?.(), s.current === null && (s.current = window.setInterval(i, 50));
		}),
		onPointerLeave: B(a.onPointerLeave, () => {
			l();
		})
	});
}), uc = "SelectSeparator", dc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return /* @__PURE__ */ v(z.div, {
		"aria-hidden": !0,
		...r,
		ref: t
	});
});
dc.displayName = uc;
var fc = "SelectArrow", pc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = hs(n), a = _s(fc, n), o = Ns(fc, n);
	return a.open && o.position === "popper" ? /* @__PURE__ */ v(mo, {
		...i,
		...r,
		ref: t
	}) : null;
});
pc.displayName = fc;
var mc = "SelectBubbleInput", hc = r.forwardRef(({ __scopeSelect: e, value: t, ...n }, i) => {
	let a = r.useRef(null), o = R(i, a), s = pr(t);
	return r.useEffect(() => {
		let e = a.current;
		if (!e) return;
		let n = window.HTMLSelectElement.prototype, r = Object.getOwnPropertyDescriptor(n, "value").set;
		if (s !== t && r) {
			let n = new Event("change", { bubbles: !0 });
			r.call(e, t), e.dispatchEvent(n);
		}
	}, [s, t]), /* @__PURE__ */ v(z.select, {
		...n,
		style: {
			...Ie,
			...n.style
		},
		ref: o,
		defaultValue: t
	});
});
hc.displayName = mc;
function gc(e) {
	return e === "" || e === void 0;
}
function _c(e) {
	let t = ct(e), n = r.useRef(""), i = r.useRef(0), a = r.useCallback((e) => {
		let r = n.current + e;
		t(r), (function e(t) {
			n.current = t, window.clearTimeout(i.current), t !== "" && (i.current = window.setTimeout(() => e(""), 1e3));
		})(r);
	}, [t]), o = r.useCallback(() => {
		n.current = "", window.clearTimeout(i.current);
	}, []);
	return r.useEffect(() => () => window.clearTimeout(i.current), []), [
		n,
		a,
		o
	];
}
function vc(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = yc(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.textValue.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
function yc(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
var bc = bs, xc = Ss, Sc = ws, Cc = Es, wc = Os, Tc = As, Ec = Ws, Dc = ec, Oc = nc, kc = ic, Ac = oc, jc = cc;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function Mc(e) {
	let t = /* @__PURE__ */ Pc(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Ic);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ v(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ v(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
var Nc = /* @__PURE__ */ Mc("Slot");
/* @__NO_SIDE_EFFECTS__ */
function Pc(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Rc(n), a = Lc(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? Oe(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Fc = Symbol("radix.slottable");
function Ic(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Fc;
}
function Lc(e, t) {
	let n = { ...t };
	for (let r in t) {
		let i = e[r], a = t[r];
		/^on[A-Z]/.test(r) ? i && a ? n[r] = (...e) => {
			let t = a(...e);
			return i(...e), t;
		} : i && (n[r] = i) : r === "style" ? n[r] = {
			...i,
			...a
		} : r === "className" && (n[r] = [i, a].filter(Boolean).join(" "));
	}
	return {
		...e,
		...n
	};
}
function Rc(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/tailwind-merge/dist/bundle-mjs.mjs
var zc = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, Bc = (e, t) => ({
	classGroupId: e,
	validator: t
}), Vc = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), Hc = "-", Uc = [], Wc = "arbitrary..", Gc = (e) => {
	let t = Jc(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return qc(e);
			let n = e.split(Hc);
			return Kc(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? zc(i, t) : t : i || Uc;
			}
			return n[e] || Uc;
		}
	};
}, Kc = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = Kc(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(Hc) : e.slice(t).join(Hc), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, qc = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? Wc + r : void 0;
})(), Jc = (e) => {
	let { theme: t, classGroups: n } = e;
	return Yc(n, t);
}, Yc = (e, t) => {
	let n = Vc();
	for (let r in e) {
		let i = e[r];
		Xc(i, n, r, t);
	}
	return n;
}, Xc = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		Zc(i, t, n, r);
	}
}, Zc = (e, t, n, r) => {
	if (typeof e == "string") {
		Qc(e, t, n);
		return;
	}
	if (typeof e == "function") {
		$c(e, t, n, r);
		return;
	}
	el(e, t, n, r);
}, Qc = (e, t, n) => {
	let r = e === "" ? t : tl(t, e);
	r.classGroupId = n;
}, $c = (e, t, n, r) => {
	if (nl(e)) {
		Xc(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(Bc(n, e));
}, el = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		Xc(o, tl(t, a), n, r);
	}
}, tl = (e, t) => {
	let n = e, r = t.split(Hc), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = Vc(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, nl = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, rl = (e) => {
	if (e < 1) return {
		get: () => void 0,
		set: () => {}
	};
	let t = 0, n = Object.create(null), r = Object.create(null), i = (i, a) => {
		n[i] = a, t++, t > e && (t = 0, r = n, n = Object.create(null));
	};
	return {
		get(e) {
			let t = n[e];
			if (t !== void 0) return t;
			if ((t = r[e]) !== void 0) return i(e, t), t;
		},
		set(e, t) {
			e in n ? n[e] = t : i(e, t);
		}
	};
}, il = "!", al = ":", ol = [], sl = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), cl = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === al) {
					t.push(e.slice(i, s)), i = s + 1;
					continue;
				}
				if (o === "/") {
					a = s;
					continue;
				}
			}
			o === "[" ? n++ : o === "]" ? n-- : o === "(" ? r++ : o === ")" && r--;
		}
		let s = t.length === 0 ? e : e.slice(i), c = s, l = !1;
		s.endsWith(il) ? (c = s.slice(0, -1), l = !0) : s.startsWith(il) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return sl(t, l, c, u);
	};
	if (t) {
		let e = t + al, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : sl(ol, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, ll = (e) => {
	let t = /* @__PURE__ */ new Map();
	return e.orderSensitiveModifiers.forEach((e, n) => {
		t.set(e, 1e6 + n);
	}), (e) => {
		let n = [], r = [];
		for (let i = 0; i < e.length; i++) {
			let a = e[i], o = a[0] === "[", s = t.has(a);
			o || s ? (r.length > 0 && (r.sort(), n.push(...r), r = []), n.push(a)) : r.push(a);
		}
		return r.length > 0 && (r.sort(), n.push(...r)), n;
	};
}, ul = (e) => ({
	cache: rl(e.cacheSize),
	parseClassName: cl(e),
	sortModifiers: ll(e),
	...Gc(e)
}), dl = /\s+/, fl = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(dl), c = "";
	for (let e = s.length - 1; e >= 0; --e) {
		let t = s[e], { isExternal: l, modifiers: u, hasImportantModifier: d, baseClassName: f, maybePostfixModifierPosition: p } = n(t);
		if (l) {
			c = t + (c.length > 0 ? " " + c : c);
			continue;
		}
		let m = !!p, h = r(m ? f.substring(0, p) : f);
		if (!h) {
			if (!m) {
				c = t + (c.length > 0 ? " " + c : c);
				continue;
			}
			if (h = r(f), !h) {
				c = t + (c.length > 0 ? " " + c : c);
				continue;
			}
			m = !1;
		}
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + il : g, v = _ + h;
		if (o.indexOf(v) > -1) continue;
		o.push(v);
		let y = i(h, m);
		for (let e = 0; e < y.length; ++e) {
			let t = y[e];
			o.push(_ + t);
		}
		c = t + (c.length > 0 ? " " + c : c);
	}
	return c;
}, pl = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = ml(n)) && (i && (i += " "), i += r);
	return i;
}, ml = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = ml(e[r])) && (n && (n += " "), n += t);
	return n;
}, hl = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = ul(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = fl(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(pl(...e));
}, gl = [], H = (e) => {
	let t = (t) => t[e] || gl;
	return t.isThemeGetter = !0, t;
}, _l = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, vl = /^\((?:(\w[\w-]*):)?(.+)\)$/i, yl = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, bl = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, xl = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Sl = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, Cl = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, wl = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, Tl = (e) => yl.test(e), U = (e) => !!e && !Number.isNaN(Number(e)), El = (e) => !!e && Number.isInteger(Number(e)), Dl = (e) => e.endsWith("%") && U(e.slice(0, -1)), Ol = (e) => bl.test(e), kl = () => !0, Al = (e) => xl.test(e) && !Sl.test(e), jl = () => !1, Ml = (e) => Cl.test(e), Nl = (e) => wl.test(e), Pl = (e) => !W(e) && !G(e), Fl = (e) => Xl(e, eu, jl), W = (e) => _l.test(e), Il = (e) => Xl(e, tu, Al), Ll = (e) => Xl(e, nu, U), Rl = (e) => Xl(e, iu, kl), zl = (e) => Xl(e, ru, jl), Bl = (e) => Xl(e, Ql, jl), Vl = (e) => Xl(e, $l, Nl), Hl = (e) => Xl(e, au, Ml), G = (e) => vl.test(e), Ul = (e) => Zl(e, tu), Wl = (e) => Zl(e, ru), Gl = (e) => Zl(e, Ql), Kl = (e) => Zl(e, eu), ql = (e) => Zl(e, $l), Jl = (e) => Zl(e, au, !0), Yl = (e) => Zl(e, iu, !0), Xl = (e, t, n) => {
	let r = _l.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, Zl = (e, t, n = !1) => {
	let r = vl.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, Ql = (e) => e === "position" || e === "percentage", $l = (e) => e === "image" || e === "url", eu = (e) => e === "length" || e === "size" || e === "bg-size", tu = (e) => e === "length", nu = (e) => e === "number", ru = (e) => e === "family-name", iu = (e) => e === "number" || e === "weight", au = (e) => e === "shadow", ou = /* @__PURE__ */ hl(() => {
	let e = H("color"), t = H("font"), n = H("text"), r = H("font-weight"), i = H("tracking"), a = H("leading"), o = H("breakpoint"), s = H("container"), c = H("spacing"), l = H("radius"), u = H("shadow"), d = H("inset-shadow"), f = H("text-shadow"), p = H("drop-shadow"), m = H("blur"), h = H("perspective"), g = H("aspect"), _ = H("ease"), v = H("animate"), y = () => [
		"auto",
		"avoid",
		"all",
		"avoid-page",
		"page",
		"left",
		"right",
		"column"
	], b = () => [
		"center",
		"top",
		"bottom",
		"left",
		"right",
		"top-left",
		"left-top",
		"top-right",
		"right-top",
		"bottom-right",
		"right-bottom",
		"bottom-left",
		"left-bottom"
	], x = () => [
		...b(),
		G,
		W
	], S = () => [
		"auto",
		"hidden",
		"clip",
		"visible",
		"scroll"
	], C = () => [
		"auto",
		"contain",
		"none"
	], w = () => [
		G,
		W,
		c
	], T = () => [
		Tl,
		"full",
		"auto",
		...w()
	], E = () => [
		El,
		"none",
		"subgrid",
		G,
		W
	], ee = () => [
		"auto",
		{ span: [
			"full",
			El,
			G,
			W
		] },
		El,
		G,
		W
	], D = () => [
		El,
		"auto",
		G,
		W
	], te = () => [
		"auto",
		"min",
		"max",
		"fr",
		G,
		W
	], O = () => [
		"start",
		"end",
		"center",
		"between",
		"around",
		"evenly",
		"stretch",
		"baseline",
		"center-safe",
		"end-safe"
	], k = () => [
		"start",
		"end",
		"center",
		"stretch",
		"center-safe",
		"end-safe"
	], A = () => ["auto", ...w()], j = () => [
		Tl,
		"auto",
		"full",
		"dvw",
		"dvh",
		"lvw",
		"lvh",
		"svw",
		"svh",
		"min",
		"max",
		"fit",
		...w()
	], M = () => [
		Tl,
		"screen",
		"full",
		"dvw",
		"lvw",
		"svw",
		"min",
		"max",
		"fit",
		...w()
	], ne = () => [
		Tl,
		"screen",
		"full",
		"lh",
		"dvh",
		"lvh",
		"svh",
		"min",
		"max",
		"fit",
		...w()
	], N = () => [
		e,
		G,
		W
	], re = () => [
		...b(),
		Gl,
		Bl,
		{ position: [G, W] }
	], ie = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], ae = () => [
		"auto",
		"cover",
		"contain",
		Kl,
		Fl,
		{ size: [G, W] }
	], oe = () => [
		Dl,
		Ul,
		Il
	], P = () => [
		"",
		"none",
		"full",
		l,
		G,
		W
	], F = () => [
		"",
		U,
		Ul,
		Il
	], se = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	], I = () => [
		"normal",
		"multiply",
		"screen",
		"overlay",
		"darken",
		"lighten",
		"color-dodge",
		"color-burn",
		"hard-light",
		"soft-light",
		"difference",
		"exclusion",
		"hue",
		"saturation",
		"color",
		"luminosity"
	], L = () => [
		U,
		Dl,
		Gl,
		Bl
	], ce = () => [
		"",
		"none",
		m,
		G,
		W
	], le = () => [
		"none",
		U,
		G,
		W
	], ue = () => [
		"none",
		U,
		G,
		W
	], de = () => [
		U,
		G,
		W
	], fe = () => [
		Tl,
		"full",
		...w()
	];
	return {
		cacheSize: 500,
		theme: {
			animate: [
				"spin",
				"ping",
				"pulse",
				"bounce"
			],
			aspect: ["video"],
			blur: [Ol],
			breakpoint: [Ol],
			color: [kl],
			container: [Ol],
			"drop-shadow": [Ol],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [Pl],
			"font-weight": [
				"thin",
				"extralight",
				"light",
				"normal",
				"medium",
				"semibold",
				"bold",
				"extrabold",
				"black"
			],
			"inset-shadow": [Ol],
			leading: [
				"none",
				"tight",
				"snug",
				"normal",
				"relaxed",
				"loose"
			],
			perspective: [
				"dramatic",
				"near",
				"normal",
				"midrange",
				"distant",
				"none"
			],
			radius: [Ol],
			shadow: [Ol],
			spacing: ["px", U],
			text: [Ol],
			"text-shadow": [Ol],
			tracking: [
				"tighter",
				"tight",
				"normal",
				"wide",
				"wider",
				"widest"
			]
		},
		classGroups: {
			aspect: [{ aspect: [
				"auto",
				"square",
				Tl,
				W,
				G,
				g
			] }],
			container: ["container"],
			columns: [{ columns: [
				U,
				W,
				G,
				s
			] }],
			"break-after": [{ "break-after": y() }],
			"break-before": [{ "break-before": y() }],
			"break-inside": [{ "break-inside": [
				"auto",
				"avoid",
				"avoid-page",
				"avoid-column"
			] }],
			"box-decoration": [{ "box-decoration": ["slice", "clone"] }],
			box: [{ box: ["border", "content"] }],
			display: [
				"block",
				"inline-block",
				"inline",
				"flex",
				"inline-flex",
				"table",
				"inline-table",
				"table-caption",
				"table-cell",
				"table-column",
				"table-column-group",
				"table-footer-group",
				"table-header-group",
				"table-row-group",
				"table-row",
				"flow-root",
				"grid",
				"inline-grid",
				"contents",
				"list-item",
				"hidden"
			],
			sr: ["sr-only", "not-sr-only"],
			float: [{ float: [
				"right",
				"left",
				"none",
				"start",
				"end"
			] }],
			clear: [{ clear: [
				"left",
				"right",
				"both",
				"none",
				"start",
				"end"
			] }],
			isolation: ["isolate", "isolation-auto"],
			"object-fit": [{ object: [
				"contain",
				"cover",
				"fill",
				"none",
				"scale-down"
			] }],
			"object-position": [{ object: x() }],
			overflow: [{ overflow: S() }],
			"overflow-x": [{ "overflow-x": S() }],
			"overflow-y": [{ "overflow-y": S() }],
			overscroll: [{ overscroll: C() }],
			"overscroll-x": [{ "overscroll-x": C() }],
			"overscroll-y": [{ "overscroll-y": C() }],
			position: [
				"static",
				"fixed",
				"absolute",
				"relative",
				"sticky"
			],
			inset: [{ inset: T() }],
			"inset-x": [{ "inset-x": T() }],
			"inset-y": [{ "inset-y": T() }],
			start: [{
				"inset-s": T(),
				start: T()
			}],
			end: [{
				"inset-e": T(),
				end: T()
			}],
			"inset-bs": [{ "inset-bs": T() }],
			"inset-be": [{ "inset-be": T() }],
			top: [{ top: T() }],
			right: [{ right: T() }],
			bottom: [{ bottom: T() }],
			left: [{ left: T() }],
			visibility: [
				"visible",
				"invisible",
				"collapse"
			],
			z: [{ z: [
				El,
				"auto",
				G,
				W
			] }],
			basis: [{ basis: [
				Tl,
				"full",
				"auto",
				s,
				...w()
			] }],
			"flex-direction": [{ flex: [
				"row",
				"row-reverse",
				"col",
				"col-reverse"
			] }],
			"flex-wrap": [{ flex: [
				"nowrap",
				"wrap",
				"wrap-reverse"
			] }],
			flex: [{ flex: [
				U,
				Tl,
				"auto",
				"initial",
				"none",
				W
			] }],
			grow: [{ grow: [
				"",
				U,
				G,
				W
			] }],
			shrink: [{ shrink: [
				"",
				U,
				G,
				W
			] }],
			order: [{ order: [
				El,
				"first",
				"last",
				"none",
				G,
				W
			] }],
			"grid-cols": [{ "grid-cols": E() }],
			"col-start-end": [{ col: ee() }],
			"col-start": [{ "col-start": D() }],
			"col-end": [{ "col-end": D() }],
			"grid-rows": [{ "grid-rows": E() }],
			"row-start-end": [{ row: ee() }],
			"row-start": [{ "row-start": D() }],
			"row-end": [{ "row-end": D() }],
			"grid-flow": [{ "grid-flow": [
				"row",
				"col",
				"dense",
				"row-dense",
				"col-dense"
			] }],
			"auto-cols": [{ "auto-cols": te() }],
			"auto-rows": [{ "auto-rows": te() }],
			gap: [{ gap: w() }],
			"gap-x": [{ "gap-x": w() }],
			"gap-y": [{ "gap-y": w() }],
			"justify-content": [{ justify: [...O(), "normal"] }],
			"justify-items": [{ "justify-items": [...k(), "normal"] }],
			"justify-self": [{ "justify-self": ["auto", ...k()] }],
			"align-content": [{ content: ["normal", ...O()] }],
			"align-items": [{ items: [...k(), { baseline: ["", "last"] }] }],
			"align-self": [{ self: [
				"auto",
				...k(),
				{ baseline: ["", "last"] }
			] }],
			"place-content": [{ "place-content": O() }],
			"place-items": [{ "place-items": [...k(), "baseline"] }],
			"place-self": [{ "place-self": ["auto", ...k()] }],
			p: [{ p: w() }],
			px: [{ px: w() }],
			py: [{ py: w() }],
			ps: [{ ps: w() }],
			pe: [{ pe: w() }],
			pbs: [{ pbs: w() }],
			pbe: [{ pbe: w() }],
			pt: [{ pt: w() }],
			pr: [{ pr: w() }],
			pb: [{ pb: w() }],
			pl: [{ pl: w() }],
			m: [{ m: A() }],
			mx: [{ mx: A() }],
			my: [{ my: A() }],
			ms: [{ ms: A() }],
			me: [{ me: A() }],
			mbs: [{ mbs: A() }],
			mbe: [{ mbe: A() }],
			mt: [{ mt: A() }],
			mr: [{ mr: A() }],
			mb: [{ mb: A() }],
			ml: [{ ml: A() }],
			"space-x": [{ "space-x": w() }],
			"space-x-reverse": ["space-x-reverse"],
			"space-y": [{ "space-y": w() }],
			"space-y-reverse": ["space-y-reverse"],
			size: [{ size: j() }],
			"inline-size": [{ inline: ["auto", ...M()] }],
			"min-inline-size": [{ "min-inline": ["auto", ...M()] }],
			"max-inline-size": [{ "max-inline": ["none", ...M()] }],
			"block-size": [{ block: ["auto", ...ne()] }],
			"min-block-size": [{ "min-block": ["auto", ...ne()] }],
			"max-block-size": [{ "max-block": ["none", ...ne()] }],
			w: [{ w: [
				s,
				"screen",
				...j()
			] }],
			"min-w": [{ "min-w": [
				s,
				"screen",
				"none",
				...j()
			] }],
			"max-w": [{ "max-w": [
				s,
				"screen",
				"none",
				"prose",
				{ screen: [o] },
				...j()
			] }],
			h: [{ h: [
				"screen",
				"lh",
				...j()
			] }],
			"min-h": [{ "min-h": [
				"screen",
				"lh",
				"none",
				...j()
			] }],
			"max-h": [{ "max-h": [
				"screen",
				"lh",
				...j()
			] }],
			"font-size": [{ text: [
				"base",
				n,
				Ul,
				Il
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				Yl,
				Rl
			] }],
			"font-stretch": [{ "font-stretch": [
				"ultra-condensed",
				"extra-condensed",
				"condensed",
				"semi-condensed",
				"normal",
				"semi-expanded",
				"expanded",
				"extra-expanded",
				"ultra-expanded",
				Dl,
				W
			] }],
			"font-family": [{ font: [
				Wl,
				zl,
				t
			] }],
			"font-features": [{ "font-features": [W] }],
			"fvn-normal": ["normal-nums"],
			"fvn-ordinal": ["ordinal"],
			"fvn-slashed-zero": ["slashed-zero"],
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			tracking: [{ tracking: [
				i,
				G,
				W
			] }],
			"line-clamp": [{ "line-clamp": [
				U,
				"none",
				G,
				Ll
			] }],
			leading: [{ leading: [a, ...w()] }],
			"list-image": [{ "list-image": [
				"none",
				G,
				W
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				G,
				W
			] }],
			"text-alignment": [{ text: [
				"left",
				"center",
				"right",
				"justify",
				"start",
				"end"
			] }],
			"placeholder-color": [{ placeholder: N() }],
			"text-color": [{ text: N() }],
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			"text-decoration-style": [{ decoration: [...se(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				U,
				"from-font",
				"auto",
				G,
				Il
			] }],
			"text-decoration-color": [{ decoration: N() }],
			"underline-offset": [{ "underline-offset": [
				U,
				"auto",
				G,
				W
			] }],
			"text-transform": [
				"uppercase",
				"lowercase",
				"capitalize",
				"normal-case"
			],
			"text-overflow": [
				"truncate",
				"text-ellipsis",
				"text-clip"
			],
			"text-wrap": [{ text: [
				"wrap",
				"nowrap",
				"balance",
				"pretty"
			] }],
			indent: [{ indent: w() }],
			"vertical-align": [{ align: [
				"baseline",
				"top",
				"middle",
				"bottom",
				"text-top",
				"text-bottom",
				"sub",
				"super",
				G,
				W
			] }],
			whitespace: [{ whitespace: [
				"normal",
				"nowrap",
				"pre",
				"pre-line",
				"pre-wrap",
				"break-spaces"
			] }],
			break: [{ break: [
				"normal",
				"words",
				"all",
				"keep"
			] }],
			wrap: [{ wrap: [
				"break-word",
				"anywhere",
				"normal"
			] }],
			hyphens: [{ hyphens: [
				"none",
				"manual",
				"auto"
			] }],
			content: [{ content: [
				"none",
				G,
				W
			] }],
			"bg-attachment": [{ bg: [
				"fixed",
				"local",
				"scroll"
			] }],
			"bg-clip": [{ "bg-clip": [
				"border",
				"padding",
				"content",
				"text"
			] }],
			"bg-origin": [{ "bg-origin": [
				"border",
				"padding",
				"content"
			] }],
			"bg-position": [{ bg: re() }],
			"bg-repeat": [{ bg: ie() }],
			"bg-size": [{ bg: ae() }],
			"bg-image": [{ bg: [
				"none",
				{
					linear: [
						{ to: [
							"t",
							"tr",
							"r",
							"br",
							"b",
							"bl",
							"l",
							"tl"
						] },
						El,
						G,
						W
					],
					radial: [
						"",
						G,
						W
					],
					conic: [
						El,
						G,
						W
					]
				},
				ql,
				Vl
			] }],
			"bg-color": [{ bg: N() }],
			"gradient-from-pos": [{ from: oe() }],
			"gradient-via-pos": [{ via: oe() }],
			"gradient-to-pos": [{ to: oe() }],
			"gradient-from": [{ from: N() }],
			"gradient-via": [{ via: N() }],
			"gradient-to": [{ to: N() }],
			rounded: [{ rounded: P() }],
			"rounded-s": [{ "rounded-s": P() }],
			"rounded-e": [{ "rounded-e": P() }],
			"rounded-t": [{ "rounded-t": P() }],
			"rounded-r": [{ "rounded-r": P() }],
			"rounded-b": [{ "rounded-b": P() }],
			"rounded-l": [{ "rounded-l": P() }],
			"rounded-ss": [{ "rounded-ss": P() }],
			"rounded-se": [{ "rounded-se": P() }],
			"rounded-ee": [{ "rounded-ee": P() }],
			"rounded-es": [{ "rounded-es": P() }],
			"rounded-tl": [{ "rounded-tl": P() }],
			"rounded-tr": [{ "rounded-tr": P() }],
			"rounded-br": [{ "rounded-br": P() }],
			"rounded-bl": [{ "rounded-bl": P() }],
			"border-w": [{ border: F() }],
			"border-w-x": [{ "border-x": F() }],
			"border-w-y": [{ "border-y": F() }],
			"border-w-s": [{ "border-s": F() }],
			"border-w-e": [{ "border-e": F() }],
			"border-w-bs": [{ "border-bs": F() }],
			"border-w-be": [{ "border-be": F() }],
			"border-w-t": [{ "border-t": F() }],
			"border-w-r": [{ "border-r": F() }],
			"border-w-b": [{ "border-b": F() }],
			"border-w-l": [{ "border-l": F() }],
			"divide-x": [{ "divide-x": F() }],
			"divide-x-reverse": ["divide-x-reverse"],
			"divide-y": [{ "divide-y": F() }],
			"divide-y-reverse": ["divide-y-reverse"],
			"border-style": [{ border: [
				...se(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...se(),
				"hidden",
				"none"
			] }],
			"border-color": [{ border: N() }],
			"border-color-x": [{ "border-x": N() }],
			"border-color-y": [{ "border-y": N() }],
			"border-color-s": [{ "border-s": N() }],
			"border-color-e": [{ "border-e": N() }],
			"border-color-bs": [{ "border-bs": N() }],
			"border-color-be": [{ "border-be": N() }],
			"border-color-t": [{ "border-t": N() }],
			"border-color-r": [{ "border-r": N() }],
			"border-color-b": [{ "border-b": N() }],
			"border-color-l": [{ "border-l": N() }],
			"divide-color": [{ divide: N() }],
			"outline-style": [{ outline: [
				...se(),
				"none",
				"hidden"
			] }],
			"outline-offset": [{ "outline-offset": [
				U,
				G,
				W
			] }],
			"outline-w": [{ outline: [
				"",
				U,
				Ul,
				Il
			] }],
			"outline-color": [{ outline: N() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				Jl,
				Hl
			] }],
			"shadow-color": [{ shadow: N() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				Jl,
				Hl
			] }],
			"inset-shadow-color": [{ "inset-shadow": N() }],
			"ring-w": [{ ring: F() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: N() }],
			"ring-offset-w": [{ "ring-offset": [U, Il] }],
			"ring-offset-color": [{ "ring-offset": N() }],
			"inset-ring-w": [{ "inset-ring": F() }],
			"inset-ring-color": [{ "inset-ring": N() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				Jl,
				Hl
			] }],
			"text-shadow-color": [{ "text-shadow": N() }],
			opacity: [{ opacity: [
				U,
				G,
				W
			] }],
			"mix-blend": [{ "mix-blend": [
				...I(),
				"plus-darker",
				"plus-lighter"
			] }],
			"bg-blend": [{ "bg-blend": I() }],
			"mask-clip": [{ "mask-clip": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }, "mask-no-clip"],
			"mask-composite": [{ mask: [
				"add",
				"subtract",
				"intersect",
				"exclude"
			] }],
			"mask-image-linear-pos": [{ "mask-linear": [U] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": L() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": L() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": N() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": N() }],
			"mask-image-t-from-pos": [{ "mask-t-from": L() }],
			"mask-image-t-to-pos": [{ "mask-t-to": L() }],
			"mask-image-t-from-color": [{ "mask-t-from": N() }],
			"mask-image-t-to-color": [{ "mask-t-to": N() }],
			"mask-image-r-from-pos": [{ "mask-r-from": L() }],
			"mask-image-r-to-pos": [{ "mask-r-to": L() }],
			"mask-image-r-from-color": [{ "mask-r-from": N() }],
			"mask-image-r-to-color": [{ "mask-r-to": N() }],
			"mask-image-b-from-pos": [{ "mask-b-from": L() }],
			"mask-image-b-to-pos": [{ "mask-b-to": L() }],
			"mask-image-b-from-color": [{ "mask-b-from": N() }],
			"mask-image-b-to-color": [{ "mask-b-to": N() }],
			"mask-image-l-from-pos": [{ "mask-l-from": L() }],
			"mask-image-l-to-pos": [{ "mask-l-to": L() }],
			"mask-image-l-from-color": [{ "mask-l-from": N() }],
			"mask-image-l-to-color": [{ "mask-l-to": N() }],
			"mask-image-x-from-pos": [{ "mask-x-from": L() }],
			"mask-image-x-to-pos": [{ "mask-x-to": L() }],
			"mask-image-x-from-color": [{ "mask-x-from": N() }],
			"mask-image-x-to-color": [{ "mask-x-to": N() }],
			"mask-image-y-from-pos": [{ "mask-y-from": L() }],
			"mask-image-y-to-pos": [{ "mask-y-to": L() }],
			"mask-image-y-from-color": [{ "mask-y-from": N() }],
			"mask-image-y-to-color": [{ "mask-y-to": N() }],
			"mask-image-radial": [{ "mask-radial": [G, W] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": L() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": L() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": N() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": N() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [U] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": L() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": L() }],
			"mask-image-conic-from-color": [{ "mask-conic-from": N() }],
			"mask-image-conic-to-color": [{ "mask-conic-to": N() }],
			"mask-mode": [{ mask: [
				"alpha",
				"luminance",
				"match"
			] }],
			"mask-origin": [{ "mask-origin": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }],
			"mask-position": [{ mask: re() }],
			"mask-repeat": [{ mask: ie() }],
			"mask-size": [{ mask: ae() }],
			"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
			"mask-image": [{ mask: [
				"none",
				G,
				W
			] }],
			filter: [{ filter: [
				"",
				"none",
				G,
				W
			] }],
			blur: [{ blur: ce() }],
			brightness: [{ brightness: [
				U,
				G,
				W
			] }],
			contrast: [{ contrast: [
				U,
				G,
				W
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				Jl,
				Hl
			] }],
			"drop-shadow-color": [{ "drop-shadow": N() }],
			grayscale: [{ grayscale: [
				"",
				U,
				G,
				W
			] }],
			"hue-rotate": [{ "hue-rotate": [
				U,
				G,
				W
			] }],
			invert: [{ invert: [
				"",
				U,
				G,
				W
			] }],
			saturate: [{ saturate: [
				U,
				G,
				W
			] }],
			sepia: [{ sepia: [
				"",
				U,
				G,
				W
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				G,
				W
			] }],
			"backdrop-blur": [{ "backdrop-blur": ce() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				U,
				G,
				W
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				U,
				G,
				W
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				U,
				G,
				W
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				U,
				G,
				W
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				U,
				G,
				W
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				U,
				G,
				W
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				U,
				G,
				W
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				U,
				G,
				W
			] }],
			"border-collapse": [{ border: ["collapse", "separate"] }],
			"border-spacing": [{ "border-spacing": w() }],
			"border-spacing-x": [{ "border-spacing-x": w() }],
			"border-spacing-y": [{ "border-spacing-y": w() }],
			"table-layout": [{ table: ["auto", "fixed"] }],
			caption: [{ caption: ["top", "bottom"] }],
			transition: [{ transition: [
				"",
				"all",
				"colors",
				"opacity",
				"shadow",
				"transform",
				"none",
				G,
				W
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				U,
				"initial",
				G,
				W
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				G,
				W
			] }],
			delay: [{ delay: [
				U,
				G,
				W
			] }],
			animate: [{ animate: [
				"none",
				v,
				G,
				W
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				G,
				W
			] }],
			"perspective-origin": [{ "perspective-origin": x() }],
			rotate: [{ rotate: le() }],
			"rotate-x": [{ "rotate-x": le() }],
			"rotate-y": [{ "rotate-y": le() }],
			"rotate-z": [{ "rotate-z": le() }],
			scale: [{ scale: ue() }],
			"scale-x": [{ "scale-x": ue() }],
			"scale-y": [{ "scale-y": ue() }],
			"scale-z": [{ "scale-z": ue() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: de() }],
			"skew-x": [{ "skew-x": de() }],
			"skew-y": [{ "skew-y": de() }],
			transform: [{ transform: [
				G,
				W,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: x() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: fe() }],
			"translate-x": [{ "translate-x": fe() }],
			"translate-y": [{ "translate-y": fe() }],
			"translate-z": [{ "translate-z": fe() }],
			"translate-none": ["translate-none"],
			accent: [{ accent: N() }],
			appearance: [{ appearance: ["none", "auto"] }],
			"caret-color": [{ caret: N() }],
			"color-scheme": [{ scheme: [
				"normal",
				"dark",
				"light",
				"light-dark",
				"only-dark",
				"only-light"
			] }],
			cursor: [{ cursor: [
				"auto",
				"default",
				"pointer",
				"wait",
				"text",
				"move",
				"help",
				"not-allowed",
				"none",
				"context-menu",
				"progress",
				"cell",
				"crosshair",
				"vertical-text",
				"alias",
				"copy",
				"no-drop",
				"grab",
				"grabbing",
				"all-scroll",
				"col-resize",
				"row-resize",
				"n-resize",
				"e-resize",
				"s-resize",
				"w-resize",
				"ne-resize",
				"nw-resize",
				"se-resize",
				"sw-resize",
				"ew-resize",
				"ns-resize",
				"nesw-resize",
				"nwse-resize",
				"zoom-in",
				"zoom-out",
				G,
				W
			] }],
			"field-sizing": [{ "field-sizing": ["fixed", "content"] }],
			"pointer-events": [{ "pointer-events": ["auto", "none"] }],
			resize: [{ resize: [
				"none",
				"",
				"y",
				"x"
			] }],
			"scroll-behavior": [{ scroll: ["auto", "smooth"] }],
			"scroll-m": [{ "scroll-m": w() }],
			"scroll-mx": [{ "scroll-mx": w() }],
			"scroll-my": [{ "scroll-my": w() }],
			"scroll-ms": [{ "scroll-ms": w() }],
			"scroll-me": [{ "scroll-me": w() }],
			"scroll-mbs": [{ "scroll-mbs": w() }],
			"scroll-mbe": [{ "scroll-mbe": w() }],
			"scroll-mt": [{ "scroll-mt": w() }],
			"scroll-mr": [{ "scroll-mr": w() }],
			"scroll-mb": [{ "scroll-mb": w() }],
			"scroll-ml": [{ "scroll-ml": w() }],
			"scroll-p": [{ "scroll-p": w() }],
			"scroll-px": [{ "scroll-px": w() }],
			"scroll-py": [{ "scroll-py": w() }],
			"scroll-ps": [{ "scroll-ps": w() }],
			"scroll-pe": [{ "scroll-pe": w() }],
			"scroll-pbs": [{ "scroll-pbs": w() }],
			"scroll-pbe": [{ "scroll-pbe": w() }],
			"scroll-pt": [{ "scroll-pt": w() }],
			"scroll-pr": [{ "scroll-pr": w() }],
			"scroll-pb": [{ "scroll-pb": w() }],
			"scroll-pl": [{ "scroll-pl": w() }],
			"snap-align": [{ snap: [
				"start",
				"end",
				"center",
				"align-none"
			] }],
			"snap-stop": [{ snap: ["normal", "always"] }],
			"snap-type": [{ snap: [
				"none",
				"x",
				"y",
				"both"
			] }],
			"snap-strictness": [{ snap: ["mandatory", "proximity"] }],
			touch: [{ touch: [
				"auto",
				"none",
				"manipulation"
			] }],
			"touch-x": [{ "touch-pan": [
				"x",
				"left",
				"right"
			] }],
			"touch-y": [{ "touch-pan": [
				"y",
				"up",
				"down"
			] }],
			"touch-pz": ["touch-pinch-zoom"],
			select: [{ select: [
				"none",
				"text",
				"all",
				"auto"
			] }],
			"will-change": [{ "will-change": [
				"auto",
				"scroll",
				"contents",
				"transform",
				G,
				W
			] }],
			fill: [{ fill: ["none", ...N()] }],
			"stroke-w": [{ stroke: [
				U,
				Ul,
				Il,
				Ll
			] }],
			stroke: [{ stroke: ["none", ...N()] }],
			"forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }]
		},
		conflictingClassGroups: {
			overflow: ["overflow-x", "overflow-y"],
			overscroll: ["overscroll-x", "overscroll-y"],
			inset: [
				"inset-x",
				"inset-y",
				"inset-bs",
				"inset-be",
				"start",
				"end",
				"top",
				"right",
				"bottom",
				"left"
			],
			"inset-x": ["right", "left"],
			"inset-y": ["top", "bottom"],
			flex: [
				"basis",
				"grow",
				"shrink"
			],
			gap: ["gap-x", "gap-y"],
			p: [
				"px",
				"py",
				"ps",
				"pe",
				"pbs",
				"pbe",
				"pt",
				"pr",
				"pb",
				"pl"
			],
			px: ["pr", "pl"],
			py: ["pt", "pb"],
			m: [
				"mx",
				"my",
				"ms",
				"me",
				"mbs",
				"mbe",
				"mt",
				"mr",
				"mb",
				"ml"
			],
			mx: ["mr", "ml"],
			my: ["mt", "mb"],
			size: ["w", "h"],
			"font-size": ["leading"],
			"fvn-normal": [
				"fvn-ordinal",
				"fvn-slashed-zero",
				"fvn-figure",
				"fvn-spacing",
				"fvn-fraction"
			],
			"fvn-ordinal": ["fvn-normal"],
			"fvn-slashed-zero": ["fvn-normal"],
			"fvn-figure": ["fvn-normal"],
			"fvn-spacing": ["fvn-normal"],
			"fvn-fraction": ["fvn-normal"],
			"line-clamp": ["display", "overflow"],
			rounded: [
				"rounded-s",
				"rounded-e",
				"rounded-t",
				"rounded-r",
				"rounded-b",
				"rounded-l",
				"rounded-ss",
				"rounded-se",
				"rounded-ee",
				"rounded-es",
				"rounded-tl",
				"rounded-tr",
				"rounded-br",
				"rounded-bl"
			],
			"rounded-s": ["rounded-ss", "rounded-es"],
			"rounded-e": ["rounded-se", "rounded-ee"],
			"rounded-t": ["rounded-tl", "rounded-tr"],
			"rounded-r": ["rounded-tr", "rounded-br"],
			"rounded-b": ["rounded-br", "rounded-bl"],
			"rounded-l": ["rounded-tl", "rounded-bl"],
			"border-spacing": ["border-spacing-x", "border-spacing-y"],
			"border-w": [
				"border-w-x",
				"border-w-y",
				"border-w-s",
				"border-w-e",
				"border-w-bs",
				"border-w-be",
				"border-w-t",
				"border-w-r",
				"border-w-b",
				"border-w-l"
			],
			"border-w-x": ["border-w-r", "border-w-l"],
			"border-w-y": ["border-w-t", "border-w-b"],
			"border-color": [
				"border-color-x",
				"border-color-y",
				"border-color-s",
				"border-color-e",
				"border-color-bs",
				"border-color-be",
				"border-color-t",
				"border-color-r",
				"border-color-b",
				"border-color-l"
			],
			"border-color-x": ["border-color-r", "border-color-l"],
			"border-color-y": ["border-color-t", "border-color-b"],
			translate: [
				"translate-x",
				"translate-y",
				"translate-none"
			],
			"translate-none": [
				"translate",
				"translate-x",
				"translate-y",
				"translate-z"
			],
			"scroll-m": [
				"scroll-mx",
				"scroll-my",
				"scroll-ms",
				"scroll-me",
				"scroll-mbs",
				"scroll-mbe",
				"scroll-mt",
				"scroll-mr",
				"scroll-mb",
				"scroll-ml"
			],
			"scroll-mx": ["scroll-mr", "scroll-ml"],
			"scroll-my": ["scroll-mt", "scroll-mb"],
			"scroll-p": [
				"scroll-px",
				"scroll-py",
				"scroll-ps",
				"scroll-pe",
				"scroll-pbs",
				"scroll-pbe",
				"scroll-pt",
				"scroll-pr",
				"scroll-pb",
				"scroll-pl"
			],
			"scroll-px": ["scroll-pr", "scroll-pl"],
			"scroll-py": ["scroll-pt", "scroll-pb"],
			touch: [
				"touch-x",
				"touch-y",
				"touch-pz"
			],
			"touch-x": ["touch"],
			"touch-y": ["touch"],
			"touch-pz": ["touch"]
		},
		conflictingClassGroupModifiers: { "font-size": ["leading"] },
		orderSensitiveModifiers: [
			"*",
			"**",
			"after",
			"backdrop",
			"before",
			"details-content",
			"file",
			"first-letter",
			"first-line",
			"marker",
			"placeholder",
			"selection"
		]
	};
});
//#endregion
//#region src/lib/utils.ts
function K(...e) {
	return ou(Ce(e));
}
//#endregion
//#region src/components/ui/button.tsx
var su = Ee("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
			destructive: "bg-destructive text-white hover:bg-destructive/90 hover:text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
			outline: "border border-primary/30 bg-background text-foreground shadow-xs hover:bg-primary hover:text-primary-foreground dark:border-primary/40 dark:bg-input/30 dark:hover:bg-primary dark:hover:text-primary-foreground",
			secondary: "bg-primary/10 text-primary hover:bg-primary/15",
			ghost: "hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/15",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2 has-[>svg]:px-3",
			xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
			sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
			lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
			icon: "size-9",
			"icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
			"icon-sm": "size-8",
			"icon-lg": "size-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function q({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ v(r ? Nc : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: K(su({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region node_modules/dayjs/locale/fa.js
var cu = /* @__PURE__ */ k(((e, t) => {
	(function(n, r) {
		typeof e == "object" && t !== void 0 ? t.exports = r(M()) : typeof define == "function" && define.amd ? define(["dayjs"], r) : (n = typeof globalThis < "u" ? globalThis : n || self).dayjs_locale_fa = r(n.dayjs);
	})(e, (function(e) {
		function t(e) {
			return e && typeof e == "object" && "default" in e ? e : { default: e };
		}
		var n = t(e), r = {
			name: "fa",
			weekdays: "یک‌شنبه_دوشنبه_سه‌شنبه_چهارشنبه_پنج‌شنبه_جمعه_شنبه".split("_"),
			weekdaysShort: "یک‌شنبه_دوشنبه_سه‌شنبه_چهارشنبه_پنج‌شنبه_جمعه_شنبه".split("_"),
			weekdaysMin: "ی_د_س_چ_پ_ج_ش".split("_"),
			weekStart: 6,
			months: "ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر".split("_"),
			monthsShort: "ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر".split("_"),
			ordinal: function(e) {
				return e;
			},
			formats: {
				LT: "HH:mm",
				LTS: "HH:mm:ss",
				L: "DD/MM/YYYY",
				LL: "D MMMM YYYY",
				LLL: "D MMMM YYYY HH:mm",
				LLLL: "dddd, D MMMM YYYY HH:mm"
			},
			relativeTime: {
				future: "در %s",
				past: "%s پیش",
				s: "چند ثانیه",
				m: "یک دقیقه",
				mm: "%d دقیقه",
				h: "یک ساعت",
				hh: "%d ساعت",
				d: "یک روز",
				dd: "%d روز",
				M: "یک ماه",
				MM: "%d ماه",
				y: "یک سال",
				yy: "%d سال"
			}
		};
		return n.default.locale(r, null, !0), r;
	}));
})), lu = /* @__PURE__ */ j((/* @__PURE__ */ k(((e, t) => {
	(function(n, r) {
		typeof e == "object" && t !== void 0 ? t.exports = r() : typeof define == "function" && define.amd ? define(r) : (n = typeof globalThis < "u" ? globalThis : n || self).dayjs_plugin_relativeTime = r();
	})(e, (function() {
		return function(e, t, n) {
			e = e || {};
			var r = t.prototype, i = {
				future: "in %s",
				past: "%s ago",
				s: "a few seconds",
				m: "a minute",
				mm: "%d minutes",
				h: "an hour",
				hh: "%d hours",
				d: "a day",
				dd: "%d days",
				M: "a month",
				MM: "%d months",
				y: "a year",
				yy: "%d years"
			};
			function a(e, t, n, i) {
				return r.fromToBase(e, t, n, i);
			}
			n.en.relativeTime = i, r.fromToBase = function(t, r, a, o, s) {
				for (var c, l, u, d = a.$locale().relativeTime || i, f = e.thresholds || [
					{
						l: "s",
						r: 44,
						d: "second"
					},
					{
						l: "m",
						r: 89
					},
					{
						l: "mm",
						r: 44,
						d: "minute"
					},
					{
						l: "h",
						r: 89
					},
					{
						l: "hh",
						r: 21,
						d: "hour"
					},
					{
						l: "d",
						r: 35
					},
					{
						l: "dd",
						r: 25,
						d: "day"
					},
					{
						l: "M",
						r: 45
					},
					{
						l: "MM",
						r: 10,
						d: "month"
					},
					{
						l: "y",
						r: 17
					},
					{
						l: "yy",
						d: "year"
					}
				], p = f.length, m = 0; m < p; m += 1) {
					var h = f[m];
					h.d && (c = o ? n(t).diff(a, h.d, !0) : a.diff(t, h.d, !0));
					var g = (e.rounding || Math.round)(Math.abs(c));
					if (u = c > 0, g <= h.r || !h.r) {
						g <= 1 && m > 0 && (h = f[m - 1]);
						var _ = d[h.l];
						s && (g = s("" + g)), l = typeof _ == "string" ? _.replace("%d", g) : _(g, r, h.l, u);
						break;
					}
				}
				if (r) return l;
				var v = u ? d.future : d.past;
				return typeof v == "function" ? v(l) : v.replace("%s", l);
			}, r.to = function(e, t) {
				return a(e, t, this, !0);
			}, r.from = function(e, t) {
				return a(e, t, this);
			};
			var o = function(e) {
				return e.$u ? n.utc() : n();
			};
			r.toNow = function(e) {
				return this.to(o(this), e);
			}, r.fromNow = function(e) {
				return this.from(o(this), e);
			};
		};
	}));
})))(), 1), uu = /* @__PURE__ */ j(cu(), 1);
function du(e, t, n) {
	let r = J((e + J(t - 8, 6) + 100100) * 1461, 4) + J(153 * mu(t + 9, 12) + 2, 5) + n - 34840408;
	return r = r - J(J(e + 100100 + J(t - 8, 6), 100) * 3, 4) + 752, r;
}
var fu = [
	-61,
	9,
	38,
	199,
	426,
	686,
	756,
	818,
	1111,
	1181,
	1210,
	1635,
	2060,
	2097,
	2192,
	2262,
	2324,
	2394,
	2456,
	3178
], pu = Math.floor;
function mu(e, t) {
	return e - ~~(e / t) * t;
}
function J(e, t) {
	return ~~(e / t);
}
function hu(e, t) {
	let n = fu.length, r = e + 621, i = -14, a = fu[0], o, s, c, l;
	if (e < a || e >= fu[n - 1]) throw Error(`Invalid Jalaali year ${e}`);
	for (let t = 1; t < n && (o = fu[t], s = o - a, !(e < o)); t += 1) i = i + J(s, 33) * 8 + J(mu(s, 33), 4), a = o;
	l = e - a, i = i + J(l, 33) * 8 + J(mu(l, 33) + 3, 4), mu(s, 33) === 4 && s - l === 4 && (i += 1);
	let u = J(r, 4) - J((J(r, 100) + 1) * 3, 4) - 150, d = 20 + i - u;
	return t ? {
		gy: r,
		march: d
	} : (s - l < 6 && (l = l - s + J(s + 4, 33) * 33), c = mu(mu(l + 1, 33) - 1, 4), c === -1 && (c = 4), {
		leap: c,
		gy: r,
		march: d
	});
}
function gu(e, t, n) {
	let r = hu(e, !0);
	return du(r.gy, 3, r.march) + (t - 1) * 31 - J(t, 7) * (t - 7) + n - 1;
}
function _u(e) {
	let t = 4 * e + 139361631;
	t = t + J(J(4 * e + 183187720, 146097) * 3, 4) * 4 - 3908;
	let n = J(mu(t, 1461), 4) * 5 + 308, r = J(mu(n, 153), 5) + 1, i = mu(J(n, 153), 12) + 1;
	return [
		J(t, 1461) - 100100 + J(8 - i, 6),
		i,
		r
	];
}
function vu(e, t, n) {
	return _u(gu(e, t, n));
}
function yu(e, t, n) {
	let r = {
		year: e,
		month: t,
		day: n
	}, i = [
		0,
		31,
		59,
		90,
		120,
		151,
		181,
		212,
		243,
		273,
		304,
		334
	], a;
	e <= 1600 ? (e -= 621, r.year = 0) : (e -= 1600, r.year = 979);
	let o = e > 2 ? e + 1 : e;
	return a = pu((o + 3) / 4) + 365 * e - pu((o + 99) / 100) - 80 + i[t - 1] + pu((o + 399) / 400) + n, r.year += 33 * pu(a / 12053), a %= 12053, r.year += 4 * pu(a / 1461), a %= 1461, a > 365 && (r.year += pu((a - 1) / 365), a = (a - 1) % 365), r.month = a < 186 ? 1 + pu(a / 31) : 7 + pu((a - 186) / 30), r.day = 1 + (a < 186 ? a % 31 : (a - 186) % 30), [
		r.year,
		r.month,
		r.day
	];
}
var bu = {
	J: (e, t, n) => yu(e, t, n),
	G: (e, t, n) => vu(e, t, n)
}, xu = /^(\d{4})[-/]?(\d{1,2})[-/]?(\d{0,2})(.*)$/, Su = /\[.*?\]|jY{2,4}|jM{1,4}|jD{1,2}|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, Cu = "date", wu = "day", Tu = "month", Eu = "year", Du = "week", Ou = "YYYY-MM-DDTHH:mm:ssZ", ku = { jmonths: "فروردین_اردیبهشت_خرداد_تیر_مرداد_شهریور_مهر_آبان_آذر_دی_بهمن_اسفند".split("_") }, Au = (e, t, n) => {
	let r = t.prototype, i = r.$utils(), a = (e) => e.$C === "jalali", o = i.prettyUnit || i.p, s = i.isUndefined || i.u, c = i.padStart || i.s, l = i.monthDiff || i.m, u = i.absFloor || i.a, d = (e) => function(...t) {
		let n = e.bind(this)(...t);
		return n.$C = this.$C, n.isJalali() && n.InitJalali(), n;
	};
	r.startOf = d(r.startOf), r.endOf = d(r.endOf), r.add = d(r.add), r.subtract = d(r.subtract), r.set = d(r.set);
	let f = r.parse, p = r.init, m = r.startOf, h = r.$set, g = r.add, _ = r.format, v = r.diff, y = r.year, b = r.month, x = r.date, S = r.daysInMonth, C = r.toArray;
	n.$C = "gregory", n.$fdow = 6, n.calendar = function(e) {
		return n.$C = e, n;
	}, r.calendar = function(e) {
		let t = this.clone();
		return t.$C = e, t.isJalali() && t.InitJalali(), t;
	}, r.isJalali = function() {
		return a(this);
	}, n.en.jmonths = "Farvardin_Ordibehesht_Khordaad_Tir_Mordaad_Shahrivar_Mehr_Aabaan_Aazar_Dey_Bahman_Esfand".split("_"), n.locale("fa", {
		...uu.default,
		...ku
	}, !0);
	let w = function(e, t) {
		return n(e, {
			locale: t.$L,
			utc: t.$u,
			calendar: t.$C
		});
	};
	r.init = function(e = {}) {
		p.bind(this)(e), this.isJalali() && this.InitJalali();
	}, r.parse = function(e) {
		if (this.$C = e.calendar || this.$C || n.$C, e.jalali && typeof e.date == "string" && /.*[^Z]$/i.test(e.date)) {
			let t = e.date.match(xu);
			if (t) {
				let [n, r, i] = bu.G(Number.parseInt(t[1], 10), Number.parseInt(t[2], 10), Number.parseInt(t[3] || 1, 10));
				e.date = `${n}-${r}-${i}${t[4] || ""}`;
			}
		}
		return f.bind(this)(e);
	}, r.InitJalali = function() {
		let [e, t, n] = bu.J(this.$y, this.$M + 1, this.$D);
		this.$jy = e, this.$jM = t - 1, this.$jD = n;
	}, r.startOf = function(e, t) {
		if (!a(this)) return m.bind(this)(e, t);
		let r = s(t) ? !0 : t, i = o(e), c = (e, t, n = this.$jy) => {
			let [i, a, o] = bu.G(n, t + 1, e), s = w(new Date(i, a - 1, o), this);
			return (r ? s : s.endOf(wu)).$set("hour", 1);
		}, l = (this.$W + (7 - n.$fdow)) % 7;
		switch (i) {
			case Eu: return r ? c(1, 0) : c(0, 0, this.$jy + 1);
			case Tu: return r ? c(1, this.$jM) : c(0, (this.$jM + 1) % 12, this.$jy + Math.floor((this.$jM + 1) / 12));
			case Du: return c(r ? this.$jD - l : this.$jD + (6 - l), this.$jM);
			default: return m.bind(this)(e, t);
		}
	}, r.$set = function(e, t) {
		if (!a(this)) return h.bind(this)(e, t);
		let n = o(e), r = (e, t, n = this.$jy) => {
			let [r, i, a] = bu.G(n, t + 1, e);
			return this.$d.setFullYear(r), this.$d.setMonth(i - 1), this.$d.setDate(a), this;
		};
		switch (n) {
			case Cu:
			case wu:
				r(t, this.$jM);
				break;
			case Tu:
				r(this.$jD, t);
				break;
			case Eu:
				r(this.$jD, this.$jM, t);
				break;
			default: return h.bind(this)(e, t);
		}
		return this.init(), this;
	}, r.add = function(e, t) {
		if (!a(this)) return g.bind(this)(e, t);
		e = Number(e);
		let n = t && (t.length === 1 || t === "ms") ? t : o(t), r = (t, n) => {
			let r = this.set(Cu, 1).set(t, n + e);
			return r.set(Cu, Math.min(this.$jD, r.daysInMonth()));
		};
		if (["M", Tu].includes(n)) {
			let t = this.$jM + e, n = t < 0 ? -Math.ceil(-t / 12) : Math.floor(t / 12), r = this.$jD, i = this.set(wu, 1).add(n, Eu).set(Tu, t - n * 12);
			return i.set(wu, Math.min(i.daysInMonth(), r));
		}
		if (["y", Eu].includes(n)) return r(Eu, this.$jy);
		if (["d", wu].includes(n)) {
			let t = new Date(this.$d);
			return t.setDate(t.getDate() + e), w(t, this);
		}
		if (["w", Du].includes(n)) {
			let t = new Date(this.$d);
			return t.setDate(t.getDate() + e * 7), w(t, this);
		}
		return g.bind(this)(e, t);
	}, r.format = function(e, t) {
		if (!a(this)) return _.bind(this)(e, t);
		let n = e || Ou, { jmonths: r } = t || this.$locale();
		return n.replace(Su, (e) => {
			if (e.includes("[")) return e.replace(/\[|\]/g, "");
			switch (e) {
				case "YY": return String(this.$jy).slice(-2);
				case "YYYY": return String(this.$jy);
				case "M": return String(this.$jM + 1);
				case "MM": return c(this.$jM + 1, 2, "0");
				case "MMM": return r[this.$jM].slice(0, 3);
				case "MMMM": return r[this.$jM];
				case "D": return String(this.$jD);
				case "DD": return c(this.$jD, 2, "0");
				default: return _.bind(this)(e, t);
			}
		});
	}, r.diff = function(e, t, r) {
		if (!a(this)) return v.bind(this)(e, t, r);
		let i = o(t), s = n(e), c = l(this, s);
		switch (i) {
			case Eu:
				c /= 12;
				break;
			case Tu: break;
			default: return v.bind(this)(e, t, r);
		}
		return r ? c : u(c);
	}, r.$g = function(e, t, n) {
		return s(e) ? this[t] : this.set(n, e);
	}, r.year = function(e) {
		return a(this) ? this.$g(e, "$jy", Eu) : y.bind(this)(e);
	}, r.month = function(e) {
		return a(this) ? this.$g(e, "$jM", Tu) : b.bind(this)(e);
	}, r.date = function(e) {
		return a(this) ? this.$g(e, "$jD", wu) : x.bind(this)(e);
	}, r.daysInMonth = function() {
		return a(this) ? this.endOf(Tu).$jD : S.bind(this)();
	}, C && (r.toArray = function() {
		return a(this) ? [
			this.$jy,
			this.$jM,
			this.$jD,
			this.$H,
			this.$m,
			this.$s,
			this.$ms
		] : C.bind(this)();
	}), r.clone = function() {
		return w(this.toDate(), this);
	};
}, ju = {
	"۰": "0",
	"۱": "1",
	"۲": "2",
	"۳": "3",
	"۴": "4",
	"۵": "5",
	"۶": "6",
	"۷": "7",
	"۸": "8",
	"۹": "9",
	"٠": "0",
	"١": "1",
	"٢": "2",
	"٣": "3",
	"٤": "4",
	"٥": "5",
	"٦": "6",
	"٧": "7",
	"٨": "8",
	"٩": "9"
};
function Mu(e) {
	return e.toLowerCase().startsWith("fa");
}
function Nu(e) {
	return e.replace(/\d/g, (e) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(e, 10)] ?? e);
}
function Pu(e) {
	return e.replace(/[۰-۹٠-٩]/g, (e) => ju[e] ?? e);
}
function Fu(e, t) {
	return Mu(t) ? Nu(e) : e;
}
xe.default.extend(Au), xe.default.extend(lu.default);
function Iu(e) {
	if (e == null || e === "") return !0;
	if (typeof e == "number") return !Number.isFinite(e) || e <= 0;
	if (typeof e == "string") {
		let t = e.trim();
		if (!t || t === "0" || t === "null" || t === "undefined") return !0;
		if (/^\d+$/.test(t)) return Number(t) <= 0;
	}
	return !1;
}
function Lu(e) {
	if (typeof e == "number") return xe.default.unix(e);
	let t = String(e).trim();
	return /^\d+$/.test(t) ? xe.default.unix(Number(t)) : (0, xe.default)(t);
}
function Ru(e, t, n = "—") {
	if (Iu(e)) return n;
	let r = Lu(e);
	if (!r.isValid()) return n;
	if (Mu(t)) {
		let e = b.t("date.timeSeparator");
		return Nu(r.calendar("jalali").locale("fa").format(`D MMMM YYYY${e}HH:mm`));
	}
	return r.locale("en").format("YYYY-MM-DD HH:mm");
}
//#endregion
//#region src/components/calendar/MonthCalendar.tsx
var zu = [
	"calendar.weekday.0",
	"calendar.weekday.1",
	"calendar.weekday.2",
	"calendar.weekday.3",
	"calendar.weekday.4",
	"calendar.weekday.5",
	"calendar.weekday.6"
];
function Bu(e, t) {
	return t ? e.calendar("jalali") : e;
}
function Vu({ value: e, onSelect: t, className: n }) {
	let { i18n: r, t: i } = m(), a = Mu(r.language), [o, s] = p(() => e && e.isValid() ? e : (0, xe.default)()), c = Bu(o, a), l = Fu(c.format(a ? "jMMMM jYYYY" : "MMMM YYYY"), r.language), u = zu.map((e) => i(e)), f = d(() => {
		let e = c.startOf("month"), t = e.daysInMonth(), n = e.day(), r = Array.from({ length: n }, () => null), i = Array.from({ length: t }, (t, n) => e.add(n, "day"));
		return [...r, ...i];
	}, [c, a]), h = e?.isValid() ? e.format("YYYY-MM-DD") : "";
	return /* @__PURE__ */ y("div", {
		className: K("w-[280px] select-none p-2", n),
		dir: a ? "rtl" : "ltr",
		children: [
			/* @__PURE__ */ y("div", {
				className: "mb-2 flex items-center justify-between gap-1",
				children: [
					/* @__PURE__ */ v(q, {
						type: "button",
						variant: "ghost",
						size: "icon",
						className: "size-7",
						"aria-label": i("date.prevMonth"),
						onClick: () => s((e) => Bu(e, a).subtract(1, "month")),
						children: v(a ? fe : de, { className: "size-4" })
					}),
					/* @__PURE__ */ v("span", {
						className: "text-sm font-medium",
						children: l
					}),
					/* @__PURE__ */ v(q, {
						type: "button",
						variant: "ghost",
						size: "icon",
						className: "size-7",
						"aria-label": i("date.nextMonth"),
						onClick: () => s((e) => Bu(e, a).add(1, "month")),
						children: v(a ? de : fe, { className: "size-4" })
					})
				]
			}),
			/* @__PURE__ */ v("div", {
				className: "grid grid-cols-7 gap-0.5 text-center text-xs text-muted-foreground",
				children: u.map((e) => /* @__PURE__ */ v("div", {
					className: "py-1 font-medium",
					children: e
				}, e))
			}),
			/* @__PURE__ */ v("div", {
				className: "grid grid-cols-7 gap-0.5",
				children: f.map((e, n) => {
					if (!e) return /* @__PURE__ */ v("div", { className: "h-8" }, `e-${n}`);
					let i = e.format("YYYY-MM-DD"), o = i === h, s = Fu(a ? e.calendar("jalali").format("jD") : String(e.date()), r.language);
					return /* @__PURE__ */ v(q, {
						type: "button",
						variant: o ? "default" : "ghost",
						size: "icon",
						className: "h-8 w-full text-xs font-normal",
						onClick: () => t(e),
						children: s
					}, i);
				})
			})
		]
	});
}
//#endregion
//#region src/components/ui/input.tsx
function Y({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ v("input", {
		type: t,
		"data-slot": "input",
		className: K("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function X({ className: e, ...t }) {
	return /* @__PURE__ */ v(_o, {
		"data-slot": "label",
		className: K("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/hooks/use-text-direction.ts
function Hu() {
	let { i18n: e } = m();
	return e.dir() === "rtl" ? "rtl" : "ltr";
}
//#endregion
//#region src/components/ui/popover.tsx
function Uu({ modal: e = !1, ...t }) {
	return /* @__PURE__ */ v(Zo, {
		"data-slot": "popover",
		modal: e,
		...t
	});
}
function Wu({ ...e }) {
	return /* @__PURE__ */ v(Qo, {
		"data-slot": "popover-trigger",
		...e
	});
}
function Gu({ className: e, align: t = "center", sideOffset: n = 4, ...r }) {
	return /* @__PURE__ */ v($o, { children: /* @__PURE__ */ v(es, {
		"data-slot": "popover-content",
		dir: Hu(),
		align: t,
		sideOffset: n,
		className: K("z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border bg-popover p-4 text-start text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", e),
		...r
	}) });
}
//#endregion
//#region src/components/DateTimePicker.tsx
function Ku(e) {
	if (e == null || e === "") return null;
	let t = typeof e == "number" ? xe.default.unix(e) : (0, xe.default)(e);
	return t.isValid() ? t : null;
}
function qu({ id: e, label: t, value: n, onChange: r, required: i, className: a }) {
	let { i18n: o, t: s } = m(), c = Ku(n), l = c ? c.format("HH:mm") : "12:00", u = Ru(n, o.language, s("common.emptyValue")), d = c;
	function f(e) {
		let [t, n] = l.split(":").map((e) => parseInt(e, 10));
		r(e.hour(Number.isFinite(t) ? t : 0).minute(Number.isFinite(n) ? n : 0).second(0).unix());
	}
	function p(e) {
		let t = c ?? (0, xe.default)(), [n, i] = e.split(":").map((e) => parseInt(e, 10));
		r(t.hour(Number.isFinite(n) ? n : 0).minute(Number.isFinite(i) ? i : 0).second(0).unix());
	}
	return /* @__PURE__ */ y("div", {
		className: a,
		children: [t ? /* @__PURE__ */ v(X, {
			className: "mb-1 block",
			htmlFor: e,
			children: t
		}) : null, /* @__PURE__ */ y("div", {
			className: "flex flex-col gap-2",
			children: [/* @__PURE__ */ y(Uu, { children: [/* @__PURE__ */ v(Wu, {
				asChild: !0,
				children: /* @__PURE__ */ y(q, {
					type: "button",
					variant: "outline",
					className: "justify-start gap-2 font-normal",
					"aria-label": s("date.pickDate"),
					children: [/* @__PURE__ */ v(ce, {
						className: "size-4 opacity-70",
						"aria-hidden": !0
					}), /* @__PURE__ */ v("span", { children: u })]
				})
			}), /* @__PURE__ */ v(Gu, {
				className: "w-auto p-0",
				align: "start",
				children: /* @__PURE__ */ v(Vu, {
					value: d,
					onSelect: f
				})
			})] }), /* @__PURE__ */ y("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ v(X, {
					htmlFor: `${e ?? "dt"}-time`,
					className: "text-muted-foreground shrink-0 text-xs",
					children: s("date.time")
				}), /* @__PURE__ */ v(Y, {
					id: `${e ?? "dt"}-time`,
					type: "time",
					required: i,
					value: l,
					className: "max-w-[140px]",
					onChange: (e) => p(e.target.value)
				})]
			})]
		})]
	});
}
//#endregion
//#region src/components/ui/skeleton.tsx
function Ju({ className: e, ...t }) {
	return /* @__PURE__ */ v("div", {
		"data-slot": "skeleton",
		className: K("animate-pulse rounded-md bg-accent", e),
		...t
	});
}
//#endregion
//#region src/components/ui/card.tsx
var Yu = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function Xu({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ v("div", {
		"data-slot": "card",
		"data-variant": t,
		className: K("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", Yu[t], e),
		...n
	});
}
function Zu({ className: e, ...t }) {
	return /* @__PURE__ */ v("div", {
		"data-slot": "card-header",
		className: K("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function Qu({ className: e, ...t }) {
	return /* @__PURE__ */ v("div", {
		"data-slot": "card-title",
		className: K("leading-none font-semibold", e),
		...t
	});
}
function $u({ className: e, ...t }) {
	return /* @__PURE__ */ v("div", {
		"data-slot": "card-description",
		className: K("text-sm text-muted-foreground", e),
		...t
	});
}
function ed({ className: e, ...t }) {
	return /* @__PURE__ */ v("div", {
		"data-slot": "card-content",
		className: K("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region src/components/skeletons/PageHeaderSkeleton.tsx
function td({ withDescription: e = !0 }) {
	return /* @__PURE__ */ v(Xu, {
		className: "shadow-sm",
		children: /* @__PURE__ */ y(Zu, {
			className: "pb-4",
			children: [/* @__PURE__ */ v(Qu, {
				className: "text-xl",
				children: /* @__PURE__ */ v(Ju, { className: "h-7 w-48 max-w-full" })
			}), e ? /* @__PURE__ */ v($u, { children: /* @__PURE__ */ v(Ju, { className: "mt-1 h-4 w-64 max-w-full" }) }) : null]
		})
	});
}
//#endregion
//#region src/components/skeletons/FormSettingsSkeleton.tsx
function nd({ cards: e = 2, fieldsPerCard: t = 5 }) {
	return /* @__PURE__ */ y("div", {
		className: "space-y-4 max-w-2xl",
		"aria-busy": "true",
		children: [Array.from({ length: e }).map((e, n) => /* @__PURE__ */ y(Xu, {
			className: "shadow-sm",
			children: [/* @__PURE__ */ v(Zu, { children: /* @__PURE__ */ v(Ju, { className: "h-6 w-40" }) }), /* @__PURE__ */ v(ed, {
				className: "space-y-4",
				children: Array.from({ length: t }).map((e, t) => /* @__PURE__ */ y("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ v(Ju, { className: "h-4 w-28" }), /* @__PURE__ */ v(Ju, { className: "h-10 w-full" })]
				}, t))
			})]
		}, n)), /* @__PURE__ */ v(Ju, { className: "h-9 w-24" })]
	});
}
//#endregion
//#region src/components/TableListSkeleton.tsx
function rd({ rows: e = 6, columns: t = 4 }) {
	return /* @__PURE__ */ v("div", {
		className: "p-4 space-y-3",
		"aria-hidden": !0,
		children: Array.from({ length: e }).map((e, n) => /* @__PURE__ */ v("div", {
			className: "flex gap-2",
			children: Array.from({ length: t }).map((e, t) => /* @__PURE__ */ v(Ju, { className: "h-8 flex-1" }, t))
		}, n))
	});
}
//#endregion
//#region src/components/skeletons/ListPageSkeleton.tsx
function id({ showPageHeader: e = !0, filterFields: t = 4, tableRows: n = 8, tableColumns: r = 5 }) {
	return /* @__PURE__ */ y("div", {
		className: "space-y-4",
		"aria-busy": "true",
		children: [
			e ? /* @__PURE__ */ v(td, {}) : null,
			/* @__PURE__ */ y("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ v(Ju, { className: "h-9 w-32" }), /* @__PURE__ */ v(Ju, { className: "h-9 w-28" })]
			}),
			/* @__PURE__ */ v(Xu, {
				className: "shadow-sm",
				children: /* @__PURE__ */ y(ed, {
					className: "space-y-4 pt-6",
					children: [t > 0 ? /* @__PURE__ */ v("div", {
						className: "flex flex-wrap gap-3",
						children: Array.from({ length: t }).map((e, t) => /* @__PURE__ */ v(Ju, { className: "h-10 min-w-[8rem] flex-1" }, t))
					}) : null, n > 0 ? /* @__PURE__ */ v(rd, {
						rows: n,
						columns: r
					}) : null]
				})
			})
		]
	});
}
//#endregion
//#region src/lib/marketplace-api.ts
function ad(e) {
	return `marketplace.installStep.${e}`;
}
function od() {
	let e = window.webinoDashboard.marketplaceSettingsSections ?? window.webinoDashboard.bootstrap?.marketplaceSettingsSections;
	return Array.isArray(e) ? e : [];
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function sd(e) {
	"@babel/helpers - typeof";
	return sd = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, sd(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function cd(e, t) {
	if (sd(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (sd(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function ld(e) {
	var t = cd(e, "string");
	return sd(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function ud(e, t, n) {
	return (t = ld(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/lib/apiError.ts
var Z = class extends Error {
	constructor(e, t) {
		super(e), ud(this, "code", void 0), ud(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, dd = {
	invalid: "errors.api.invalid",
	ai_disabled: "aiContent.errDisabled",
	ai_entity_off: "aiContent.errEntityOff",
	ai_no_key: "aiContent.errNoKey",
	ai_job_failed: "aiContent.generateFailed",
	ai_job: "aiContent.errJobNotFound",
	forbidden: "errors.api.forbidden",
	not_found: "errors.api.notFound",
	invalid_role: "errors.api.invalidRole",
	forbidden_role: "errors.api.forbiddenRole",
	invalid_nonce: "errors.api.invalidNonce",
	timeout: "errors.api.timeout",
	request_timeout: "errors.api.requestTimeout",
	gateway_timeout: "errors.api.gatewayTimeout",
	server_unavailable: "errors.api.serverUnavailable",
	ajax_unhandled: "errors.api.invalidResponse",
	empty_response: "errors.api.invalidResponse",
	empty_reply: "errors.api.emptyReply",
	transport: "errors.api.transport",
	network_offline: "errors.api.networkOffline",
	site_updating: "errors.api.siteUpdating",
	rest_cdn_blocked: "errors.api.restCdnBlocked",
	crm_unreachable: "errors.api.crmUnreachable",
	campaigns_disabled: "bots.campaigns.disabled",
	no_file: "bots.errors.noFile",
	read_fail: "bots.errors.readFail",
	invalid_name: "bots.errors.invalidName",
	media_plan: "bots.broadcast.mediaPlanHint",
	install_failed: "marketplace.installFailedGeneric",
	install_timeout: "marketplace.installTimedOutGeneric",
	install_worker_failed: "marketplace.installWorkerStuck",
	install_job_start_failed: "marketplace.installJobStartFailed",
	build_dev_only: "buildPipeline.devOnly"
};
function fd(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function pd(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function md(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(ad(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function hd(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return md(e, n);
	if (t instanceof Z && t.code) {
		let n = dd[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = dd[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return fd(n) ? e("errors.api.requestTimeout") : pd(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function gd(e, t) {
	w.error(hd(e, t));
}
//#endregion
//#region src/lib/queryClient.ts
var _d = null;
function vd() {
	return _d;
}
//#endregion
//#region src/lib/authLost.ts
var yd = ["auth", "session"], bd = new Set([
	"rest_cookie_invalid_nonce",
	"rest_not_logged_in",
	"invalid_nonce",
	"ajax_referer_failed",
	"-1"
]);
function xd(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (t.status === 401) return !0;
	let n = typeof t.code == "string" ? t.code : "";
	if (bd.has(n)) return !0;
	let r = typeof t.message == "string" ? t.message.toLowerCase() : "";
	return !!(r.includes("cookie nonce is invalid") || r.includes("rest_cookie_invalid_nonce") || t.status === 403 && (n === "-1" || r === "-1" || r.includes("are you sure you want to do this")));
}
function Sd(e) {
	let t = e ?? vd();
	t && t.setQueryData(yd, { logged_in: !1 });
}
var Cd = new Set([
	"rest_cookie_invalid_nonce",
	"invalid_nonce",
	"ajax_referer_failed",
	"-1"
]);
function wd(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (t.status === 401) return !1;
	let n = typeof t.code == "string" ? t.code : "";
	if (Cd.has(n)) return !0;
	let r = typeof t.message == "string" ? t.message.toLowerCase() : "";
	return r.includes("cookie nonce is invalid") || r.includes("rest_cookie_invalid_nonce") || r === "invalid nonce";
}
function Td(e) {
	wd(e) || xd(e) && Sd();
}
//#endregion
//#region src/lib/safeUrl.ts
function Ed(e) {
	try {
		let t = new URL(e, window.location.origin);
		if (t.protocol !== "https:" && t.protocol !== "http:") return !1;
		let n = t.hostname.toLowerCase(), r = (window.webinoDashboard?.allowedRemoteHosts ?? []).map((e) => e.toLowerCase());
		return window.location.hostname.toLowerCase() === n ? !0 : t.protocol === "http:" ? n === "localhost" || n === "127.0.0.1" || n.endsWith(".local") || n.endsWith(".test") : r.includes(n);
	} catch {
		return !1;
	}
}
//#endregion
//#region src/lib/api.ts
function Dd() {
	return window.webinoDashboard;
}
var Od = 3e4;
function kd(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function Ad(e) {
	let t = Dd();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (kd(e) || Ed(e)) return e;
	throw new Z("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function jd(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function Md(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "license/remote-check" ? "webino_dashboard_license_remote_check" : t === "license/diagnostics" ? "webino_dashboard_license_diagnostics" : t === "license/remote-activate" ? "webino_dashboard_license_remote_activate" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") || t.startsWith("shop/reports") || t.startsWith("shop/product-categories") || t === "comments" || t.startsWith("comments/") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : /^(payments|torobpay|snapppay|digipay|zarinpal|bale-pay|wallet|c2c)(\/|$)/.test(t) ? "webino_dashboard_payments_rest" : t.startsWith("analytics/") && t !== "analytics/hit" ? "webino_dashboard_analytics_rest" : null;
}
function Nd(e, t) {
	let n = e.toLowerCase();
	return n.includes("briefly unavailable for scheduled maintenance") || n.includes("site is undergoing maintenance") || n.includes("در حال به‌روزرسانی") || n.includes("maintenance") ? {
		message: "Site is updating",
		code: "site_updating"
	} : e.includes("Upstream Error") || t === 502 || t === 520 || t === 521 || t === 522 ? {
		message: "REST blocked by CDN/WAF — whitelist /wp-json/ or use admin-ajax",
		code: "rest_cdn_blocked"
	} : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? {
		message: `Invalid JSON response (HTML, HTTP ${t || 0})`,
		code: "invalid_json"
	} : {
		message: "Invalid JSON response",
		code: "invalid_json"
	};
}
function Pd(e, t) {
	let n = e.toLowerCase();
	return t === 504 || t === 524 || n.includes("gateway timeout") || n.includes("gateway time-out") || n.includes("timed out") || n.includes("timeout") ? {
		message: `Gateway timeout (HTTP ${t || 0})`,
		code: "gateway_timeout"
	} : t === 502 || t === 503 || t === 520 || t === 521 || t === 522 ? {
		message: `Server temporarily unavailable (HTTP ${t})`,
		code: "server_unavailable"
	} : e.includes("Upstream Error") || e.includes("Forbidden") || t === 403 ? {
		message: "admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry",
		code: "rest_cdn_blocked"
	} : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? {
		message: `Invalid AJAX response (HTML, HTTP ${t || 0})`,
		code: "invalid_json"
	} : {
		message: `Invalid AJAX response (HTTP ${t || 0})`,
		code: "invalid_json"
	};
}
async function Fd(e, t, n = {}) {
	let r = Md(e), i = Dd();
	if (!r || !i.ajaxUrl) throw new Z("AJAX fallback unavailable", {
		code: "no_ajax_fallback",
		status: 0
	});
	let a = new URLSearchParams();
	a.set("action", r), i.nonce && a.set("nonce", i.nonce);
	let o = e.replace(/^\//, "").split("?")[0], s = e.includes("?") ? e.slice(e.indexOf("?") + 1) : "";
	a.set("rest_path", o);
	let c = (n.method || "GET").toUpperCase();
	if (a.set("rest_method", c), s && a.set("rest_query", s), c !== "GET" && c !== "HEAD" && n.body != null) {
		let e = typeof n.body == "string" ? n.body : "";
		e && a.set("payload", e);
	}
	let { signal: l, clear: u } = jd({}, t);
	try {
		let e = await fetch(i.ajaxUrl, {
			method: "POST",
			credentials: "same-origin",
			headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
			body: a,
			signal: l
		}), t = await e.text(), n;
		try {
			n = JSON.parse(t);
		} catch {
			let n = Pd(t, e.status);
			throw new Z(n.message, {
				code: n.code,
				status: e.status
			});
		}
		if (!n.success) {
			let t = new Z(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
				code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
				status: e.status
			});
			throw Td(t), t;
		}
		return n.data;
	} catch (e) {
		throw e instanceof Z ? (Td(e), e) : e instanceof DOMException && e.name === "AbortError" ? new Z("Request timed out", {
			code: "request_timeout",
			status: 0
		}) : e instanceof TypeError ? new Z("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		u();
	}
}
var Id = null;
function Ld(e) {
	let t = Dd();
	t && typeof e == "string" && e.length > 0 && (t.nonce = e);
}
function Rd() {
	if (Id) return Id;
	let e = Dd();
	if (!e?.ajaxUrl) return Promise.resolve(!1);
	let t = new URLSearchParams();
	return t.set("action", "webino_dashboard_auth_session"), Id = fetch(e.ajaxUrl, {
		method: "POST",
		credentials: "same-origin",
		headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
		body: t
	}).then((e) => e.json()).then((e) => {
		let t = !!(e?.success && e.data?.logged_in);
		return t && Ld(e.data?.nonce), t && typeof e.data?.nonce == "string" && e.data.nonce.length > 0;
	}).catch(() => !1).finally(() => {
		window.setTimeout(() => {
			Id = null;
		}, 0);
	}), Id;
}
async function Q(e, t = {}, n = Od) {
	try {
		return await zd(e, t, n);
	} catch (r) {
		if (!wd(r)) throw r;
		if (!await Rd()) throw Sd(), r;
		let i = { ...t.headers };
		for (let e of Object.keys(i)) e.toLowerCase() === "x-wp-nonce" && delete i[e];
		return zd(e, {
			...t,
			headers: i
		}, n);
	}
}
async function zd(e, t = {}, n = Od) {
	if (Md(e) && Dd().ajaxUrl) return Fd(e, n, t);
	let r = Ad(e), i = Dd(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce), !Object.keys(a).some((e) => e.toLowerCase() === "content-type") && typeof t.body == "string" && t.body.length > 0 && (a["Content-Type"] = "application/json");
	let { signal: s, clear: c } = jd(t, n);
	try {
		let e = await fetch(r, {
			...t,
			credentials: "same-origin",
			headers: a,
			signal: s
		}), n = await e.text(), i;
		try {
			i = JSON.parse(n);
		} catch {
			let t = Nd(n, e.status);
			throw new Z(t.message, {
				code: t.code,
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i, n = new Z(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
			throw Td(n), n;
		}
		return i;
	} catch (e) {
		throw e instanceof Z ? (Td(e), e) : e instanceof DOMException && e.name === "AbortError" ? new Z("Request timed out", {
			code: "request_timeout",
			status: 0
		}) : e instanceof TypeError ? new Z("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region ../Modules/telegram-bot-module/client/components/bots/BotLogsPanel.tsx
function Bd({ provider: e }) {
	let { t: n, i18n: r } = m(), i = `bots/${e}`, [a, o] = p(null), [s, c] = p(null), [l, u] = p(""), d = t({
		queryKey: [
			"bots",
			e,
			"logs",
			a,
			s,
			l
		],
		queryFn: () => {
			let e = new URLSearchParams();
			a != null && e.set("from", String(a)), s != null && e.set("to", String(s)), l.trim() && e.set("channel", l.trim());
			let t = e.toString();
			return Q(`${i}/logs${t ? `?${t}` : ""}`);
		}
	});
	return /* @__PURE__ */ y("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ y("form", {
				className: "flex flex-wrap items-end gap-3 rounded-lg border border-border p-4",
				onSubmit: (e) => {
					e.preventDefault(), d.refetch();
				},
				children: [
					/* @__PURE__ */ v(qu, {
						id: "log-from",
						label: n("bots.logs.from"),
						value: a ?? void 0,
						onChange: o,
						className: "min-w-[200px]"
					}),
					/* @__PURE__ */ v(qu, {
						id: "log-to",
						label: n("bots.logs.to"),
						value: s ?? void 0,
						onChange: c,
						className: "min-w-[200px]"
					}),
					/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
						htmlFor: "log-ch",
						children: n("bots.logs.channel")
					}), /* @__PURE__ */ v(Y, {
						id: "log-ch",
						placeholder: n("bots.logs.channelPlaceholder"),
						value: l,
						onChange: (e) => u(e.target.value),
						className: "mt-1"
					})] }),
					/* @__PURE__ */ v(q, {
						type: "submit",
						variant: "secondary",
						children: n("bots.logs.apply")
					})
				]
			}),
			d.isLoading ? /* @__PURE__ */ v(id, {
				showPageHeader: !1,
				filterFields: 0,
				tableRows: 8,
				tableColumns: 4
			}) : null,
			d.isError && /* @__PURE__ */ v("p", {
				className: "text-sm text-destructive",
				children: n("errors.api.generic")
			}),
			d.data && /* @__PURE__ */ v("div", {
				className: "max-h-[480px] overflow-auto rounded-lg border border-border text-xs",
				children: /* @__PURE__ */ y("table", {
					className: "w-full",
					children: [/* @__PURE__ */ v("thead", {
						className: "sticky top-0 bg-card",
						children: /* @__PURE__ */ y("tr", {
							className: "border-b border-border text-start text-muted-foreground",
							children: [
								/* @__PURE__ */ v("th", {
									className: "p-2",
									children: n("bots.logs.colTime")
								}),
								/* @__PURE__ */ v("th", {
									className: "p-2",
									children: n("bots.logs.colLevel")
								}),
								/* @__PURE__ */ v("th", {
									className: "p-2",
									children: n("bots.logs.colChannel")
								}),
								/* @__PURE__ */ v("th", {
									className: "p-2",
									children: n("bots.logs.colMessage")
								})
							]
						})
					}), /* @__PURE__ */ v("tbody", { children: [...d.data.entries].reverse().map((e, t) => /* @__PURE__ */ y("tr", {
						className: "border-t border-border align-top",
						children: [
							/* @__PURE__ */ v("td", {
								className: "whitespace-nowrap p-2",
								children: Ru(e.ts, r.language)
							}),
							/* @__PURE__ */ v("td", {
								className: "p-2",
								children: e.level
							}),
							/* @__PURE__ */ v("td", {
								className: "p-2",
								children: e.channel
							}),
							/* @__PURE__ */ v("td", {
								className: "p-2 font-mono text-[11px] leading-snug",
								children: e.msg
							})
						]
					}, `${e.ts}-${t}`)) })]
				})
			})
		]
	});
}
//#endregion
//#region src/components/currency/IrtIcon.tsx
function Vd({ className: e }) {
	return /* @__PURE__ */ y("svg", {
		width: "13",
		height: "12",
		viewBox: "0 0 13 12",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		className: K("inline-block h-[0.85em] w-auto shrink-0 align-[-0.12em]", e),
		"aria-hidden": !0,
		children: [
			/* @__PURE__ */ v("path", {
				d: "M2.32002 6.11782C2.63548 5.96391 2.87208 5.81 3.10867 5.57913C3.2664 5.34826 3.42413 5.11739 3.58186 4.88652C3.66073 4.57869 3.73959 4.27087 3.73959 3.96304H11.2318C11.705 3.96304 12.0993 3.80913 12.4147 3.57826C12.6513 3.27043 12.8091 2.88565 12.8091 2.34696V0.5H11.7838V2.27C11.7838 2.65478 11.5472 2.88565 11.1529 2.88565H3.73959V2.50087C3.73959 2.11609 3.66073 1.88522 3.58186 1.57739C3.58186 1.34652 3.42413 1.11565 3.2664 0.961739C3.10867 0.807826 2.95094 0.730869 2.79321 0.653913C2.55662 0.576956 2.32002 0.5 2.16229 0.5C1.84683 0.5 1.61024 0.576956 1.37364 0.653913C1.21591 0.807826 0.979316 0.884782 0.900451 1.11565C0.742721 1.26956 0.584991 1.42348 0.584991 1.65435C0.506126 1.88522 0.427261 2.11609 0.427261 2.34696C0.427261 2.57782 0.427261 2.80869 0.506126 3.03956C0.584991 3.27043 0.663856 3.42435 0.742721 3.57826C0.900451 3.65521 1.05818 3.80913 1.29478 3.88608C1.53137 3.96304 1.76797 3.96304 2.16229 3.96304H2.79321C2.79321 4.11695 2.71435 4.27087 2.71435 4.42478C2.63548 4.57869 2.47775 4.7326 2.39889 4.88652C2.32002 4.96347 2.16229 5.04043 1.9257 5.11739C1.76797 5.19434 1.53137 5.2713 1.29478 5.2713H0.269531V6.34869H1.29478C1.6891 6.27173 2.00456 6.19478 2.32002 6.11782ZM2.16229 2.88565C1.84683 2.88565 1.6891 2.88565 1.53137 2.73174C1.45251 2.65478 1.37364 2.50087 1.37364 2.27C1.37364 2.03913 1.45251 1.80826 1.53137 1.7313C1.6891 1.65435 1.84683 1.57739 2.08343 1.57739C2.32002 1.57739 2.47775 1.65435 2.63548 1.80826C2.79321 1.96217 2.79321 2.19304 2.79321 2.50087V2.96261H2.16229V2.88565Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ v("path", {
				d: "M10.4422 0.5H7.44531V1.42348H10.4422V0.5Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ v("path", {
				d: "M12.7298 8.50383C12.6509 8.27296 12.5721 8.11905 12.4143 7.96514C12.2566 7.81122 12.0989 7.65731 11.8623 7.58035C11.7046 7.5034 11.468 7.42644 11.2314 7.42644C10.9948 7.42644 10.7582 7.5034 10.5216 7.58035C10.285 7.65731 10.1273 7.81122 9.96953 7.96514C9.8118 8.11905 9.73293 8.27296 9.65407 8.50383C9.5752 8.7347 9.5752 8.96557 9.5752 9.19644V9.42731C9.5752 9.65818 9.49634 9.73513 9.41747 9.88905C9.25974 9.966 9.10201 10.043 8.86542 10.043H8.54996C8.39223 10.043 8.2345 9.966 8.15563 9.88905C8.07677 9.73513 7.9979 9.58122 7.9979 9.42731V5.7334H6.97266V9.58122C6.97266 9.88905 6.97266 10.1199 7.05152 10.2738C7.13039 10.4277 7.20925 10.5817 7.36698 10.7356C7.52471 10.8125 7.60358 10.9664 7.84017 10.9664C7.9979 11.0434 8.15563 11.0434 8.39223 11.0434H8.94428C9.10201 11.0434 9.33861 10.9664 9.49634 10.8895C9.65407 10.8125 9.89066 10.6586 9.96953 10.4277C10.1273 10.6586 10.285 10.8125 10.5216 10.8895C10.7582 10.9664 10.9948 11.0434 11.3102 11.0434C11.7834 11.0434 12.2566 10.8895 12.4932 10.5817C12.8087 10.2738 12.9664 9.81209 12.9664 9.2734C12.8875 8.96557 12.8087 8.7347 12.7298 8.50383ZM11.2314 9.966C10.9948 9.966 10.837 9.88905 10.7582 9.81209C10.5216 9.65818 10.5216 9.50427 10.5216 9.2734C10.5216 9.04253 10.6004 8.88861 10.6793 8.7347C10.7582 8.58079 10.9948 8.50383 11.2314 8.50383C11.468 8.50383 11.7046 8.58079 11.7834 8.7347C11.8623 8.88861 11.9412 9.04253 11.9412 9.2734C11.8623 9.73513 11.6257 9.966 11.2314 9.966Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ v("path", {
				d: "M4.92256 8.50364C4.92256 8.73451 4.92256 8.88842 4.8437 9.11929C4.76484 9.2732 4.68597 9.42712 4.60711 9.58103C4.44938 9.73494 4.29165 9.8119 4.13392 9.88886C3.97619 9.96581 3.73959 10.0428 3.42413 10.0428H2.71435C2.47775 10.0428 2.24116 10.0428 2.00456 9.96581C1.84683 9.8119 1.6891 9.73494 1.61024 9.58103C1.53137 9.42712 1.37364 9.2732 1.37364 9.11929C1.29478 8.96538 1.29478 8.73451 1.29478 8.50364V7.65712H0.269531V8.5806C0.269531 9.35016 0.506126 9.96581 0.900451 10.4276C1.29478 10.8893 1.84683 11.1202 2.63548 11.1202H3.42413C3.81846 11.1202 4.13392 11.0432 4.44938 10.8893C4.76484 10.7354 5.00143 10.5815 5.23803 10.3506C5.47462 10.1197 5.63235 9.8119 5.71122 9.50407C5.79008 9.19625 5.86894 8.88842 5.86894 8.50364V5.73321L4.8437 5.65625L4.92256 8.50364Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ v("path", {
				d: "M3.73962 7.42578H2.55664V8.50317H3.73962V7.42578Z",
				fill: "currentColor"
			})
		]
	});
}
//#endregion
//#region src/lib/enumLabels.ts
function Hd(e, t, n) {
	if (!n) return e("common.emptyValue");
	let r = `${t}.${n}`, i = e(r);
	return i === r ? n : i;
}
//#endregion
//#region src/components/ui/checkbox.tsx
function Ud({ className: e, ...t }) {
	return /* @__PURE__ */ v(Cr, {
		"data-slot": "checkbox",
		className: K("peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary", e),
		...t,
		children: /* @__PURE__ */ v(Tr, {
			"data-slot": "checkbox-indicator",
			className: "grid place-content-center text-current transition-none",
			children: /* @__PURE__ */ v(le, { className: "size-3.5" })
		})
	});
}
//#endregion
//#region src/components/ui/select.tsx
function Wd({ ...e }) {
	return /* @__PURE__ */ v(bc, {
		"data-slot": "select",
		...e
	});
}
function Gd({ ...e }) {
	return /* @__PURE__ */ v(Sc, {
		"data-slot": "select-value",
		...e
	});
}
function Kd({ className: e, size: t = "default", children: n, ...r }) {
	return /* @__PURE__ */ y(xc, {
		"data-slot": "select-trigger",
		"data-size": t,
		dir: Hu(),
		className: K("flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap text-start shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", e),
		...r,
		children: [n, /* @__PURE__ */ v(Cc, {
			asChild: !0,
			children: /* @__PURE__ */ v(ue, { className: "size-4 opacity-50" })
		})]
	});
}
function qd({ className: e, children: t, position: n = "popper", align: r = "start", ...i }) {
	return /* @__PURE__ */ v(tr, {
		allowBodyScroll: !0,
		children: /* @__PURE__ */ v(wc, { children: /* @__PURE__ */ y(Tc, {
			"data-slot": "select-content",
			dir: Hu(),
			className: K("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-start text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", e),
			position: n,
			align: r,
			...i,
			children: [
				/* @__PURE__ */ v(Yd, {}),
				/* @__PURE__ */ v(Ec, {
					className: K("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
					children: t
				}),
				/* @__PURE__ */ v(Xd, {})
			]
		}) })
	});
}
function Jd({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ y(Dc, {
		"data-slot": "select-item",
		className: K("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pe-8 ps-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", e),
		...n,
		children: [/* @__PURE__ */ v("span", {
			"data-slot": "select-item-indicator",
			className: "absolute end-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ v(kc, { children: /* @__PURE__ */ v(le, { className: "size-4" }) })
		}), /* @__PURE__ */ v(Oc, { children: t })]
	});
}
function Yd({ className: e, ...t }) {
	return /* @__PURE__ */ v(Ac, {
		"data-slot": "select-scroll-up-button",
		className: K("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ v(pe, { className: "size-4" })
	});
}
function Xd({ className: e, ...t }) {
	return /* @__PURE__ */ v(jc, {
		"data-slot": "select-scroll-down-button",
		className: K("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ v(ue, { className: "size-4" })
	});
}
//#endregion
//#region src/components/ui/textarea.tsx
function Zd({ className: e, ...t }) {
	return /* @__PURE__ */ v("textarea", {
		"data-slot": "textarea",
		className: K("flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-start shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40", e),
		...t
	});
}
//#endregion
//#region ../Modules/telegram-bot-module/client/components/bots/BotSettingsPanel.tsx
var Qd = [
	"menu_show_store",
	"menu_show_search",
	"menu_show_wishlist",
	"menu_show_cart",
	"menu_show_checkout",
	"menu_show_orders",
	"menu_show_addresses",
	"menu_show_support",
	"menu_show_sale"
], $d = [
	"otp_enabled",
	"popup_enabled",
	"float_enabled",
	"filebot_enabled"
], ef = [
	"admin_ops",
	"c2c",
	"faq",
	"tickets",
	"club",
	"channel_publisher",
	"site_widgets",
	"notify_cascade",
	"outbound_queue"
];
function $(e, t, n) {
	return {
		...e,
		[t]: n
	};
}
function tf(e, t, n) {
	return {
		...e,
		[t]: n ? "1" : "0"
	};
}
function nf(e) {
	return e !== "0" && e !== 0 && e !== !1 && e != null && e !== "";
}
function rf(e) {
	return e == null || e === "" || nf(e);
}
async function af(e, t) {
	let n = [`bots/parity/${t}`, `bots/${e}/parity/${t}`];
	for (let e of n) try {
		let t = await Q(e);
		return t && typeof t == "object" && "settings" in t && t.settings && typeof t.settings == "object" ? t.settings : t ?? null;
	} catch (e) {
		if (e instanceof Z && e.status === 404 || e instanceof Z && (e.status === 404 || e.code === "not_found")) continue;
	}
	return null;
}
async function of(e, t, n) {
	let r = [`bots/parity/${t}`, `bots/${e}/parity/${t}`];
	for (let e of r) try {
		return await Q(e, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(n)
		}), !0;
	} catch (e) {
		if (e instanceof Z && (e.status === 404 || e.code === "not_found")) continue;
		throw e;
	}
	return !1;
}
function sf({ provider: r }) {
	let { t: i } = m(), a = n(), o = `bots/${r}`, [s, c] = p({}), [u, d] = p({}), [f, h] = p({}), [g, b] = p({}), [S, C] = p(!1), [T, E] = p(""), [ee, D] = p(""), [te, O] = p(!1), k = t({
		queryKey: [
			"bots",
			r,
			"settings"
		],
		queryFn: () => Q(`${o}/settings`)
	});
	l(() => {
		k.data && c({ ...k.data });
	}, [k.data]), l(() => {
		let e = !1;
		return (async () => {
			let [t, n, i] = await Promise.all([
				af(r, "site-widgets"),
				af(r, "modules"),
				af(r, "admin-ops")
			]);
			e || (t && d(t), n && h(n), i && b(i), C(!0));
		})(), () => {
			e = !0;
		};
	}, [r]);
	let A = t({
		queryKey: [
			"bots",
			r,
			"urls"
		],
		queryFn: () => Q(`${o}/webhook-urls`)
	}), j = e({
		mutationFn: async (e) => {
			let t = await Q(`${o}/settings`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(e)
			});
			return await Promise.all([
				of(r, "site-widgets", u).catch(() => !1),
				of(r, "modules", f).catch(() => !1),
				of(r, "admin-ops", g).catch(() => !1)
			]), t;
		},
		onSuccess: async () => {
			await Promise.all([a.invalidateQueries({ queryKey: [
				"bots",
				r,
				"settings"
			] }), a.invalidateQueries({ queryKey: [
				"bots",
				r,
				"connection-status"
			] })]), w.success(i("common.saved"));
		},
		onError: (e) => gd(i, e)
	}), M = async () => {
		O(!0);
		try {
			let e = ["bots/parity/templates", `bots/${r}/parity/templates`], t = null;
			for (let n of e) try {
				t = await Q(n, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						template: T,
						preview: !0
					})
				});
				break;
			} catch (e) {
				if (e instanceof Z && (e.status === 404 || e.code === "not_found")) continue;
				throw e;
			}
			if (!t) {
				w.error(i("bots.settings.templatePreviewUnavailable", "پیش‌نمایش قالب در دسترس نیست"));
				return;
			}
			D(typeof t.preview == "string" && t.preview || typeof t.rendered == "string" && t.rendered || typeof t.text == "string" && t.text || JSON.stringify(t, null, 2));
		} catch (e) {
			gd(i, e);
		} finally {
			O(!1);
		}
	}, ne = e({
		mutationFn: () => Q(`${o}/set-webhook`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}"
		}),
		onSuccess: () => w.success(i("bots.webhookSet")),
		onError: (e) => {
			gd(i, e), w.error(i("bots.webhookSetFailed"));
		}
	}), N = e({
		mutationFn: () => Q(`${o}/delete-webhook`, {
			method: "POST",
			body: "{}"
		}),
		onSuccess: () => w.success(i("bots.webhookDeleted")),
		onError: (e) => {
			gd(i, e), w.error(i("bots.webhookDeleteFailed"));
		}
	}), re = t({
		queryKey: [
			"bots",
			r,
			"connection-status"
		],
		queryFn: () => Q(`${o}/connection-status`),
		retry: !1
	});
	return /* @__PURE__ */ y("div", {
		className: "mx-auto max-w-3xl space-y-6",
		children: [
			A.data && /* @__PURE__ */ y("section", {
				className: "rounded-lg border border-border p-4 text-sm",
				children: [
					/* @__PURE__ */ v("p", {
						className: "font-medium",
						children: i("bots.webhookUrls")
					}),
					/* @__PURE__ */ v("p", {
						className: "mt-2 break-all text-xs text-muted-foreground",
						children: A.data.rest_webhook
					}),
					/* @__PURE__ */ v("p", {
						className: "mt-1 break-all text-xs text-muted-foreground",
						children: A.data.health_url
					}),
					re.data && /* @__PURE__ */ v("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: re.data.ok ? i("bots.healthOk", { user: re.data.bot?.username ?? "—" }) : i("bots.healthFail", { error: re.data.error ?? "—" })
					}),
					/* @__PURE__ */ y("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ v(q, {
							type: "button",
							size: "sm",
							variant: "secondary",
							disabled: ne.isPending,
							onClick: () => void ne.mutateAsync(),
							children: i("bots.connectWebhook")
						}), /* @__PURE__ */ v(q, {
							type: "button",
							size: "sm",
							variant: "outline",
							disabled: N.isPending,
							onClick: () => void N.mutateAsync(),
							children: i("bots.disconnectWebhook")
						})]
					})
				]
			}),
			k.isLoading ? /* @__PURE__ */ v(nd, {
				cards: 3,
				fieldsPerCard: 5
			}) : null,
			k.isError && /* @__PURE__ */ v("p", {
				className: "text-sm text-destructive",
				children: k.error.message
			}),
			k.data && /* @__PURE__ */ y("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ y("details", {
						className: "rounded-lg border border-border p-4 text-start",
						open: !0,
						children: [/* @__PURE__ */ v("summary", {
							className: "flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden",
							children: i("bots.settings.planTokens")
						}), /* @__PURE__ */ y("div", {
							className: "mt-4 space-y-3",
							children: [
								/* @__PURE__ */ y("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ v(X, {
										htmlFor: "plan_tier",
										children: i("bots.settings.planTier")
									}), /* @__PURE__ */ y(Wd, {
										value: String(s.plan_tier ?? "basic"),
										onValueChange: (e) => c((t) => $(t, "plan_tier", e)),
										children: [/* @__PURE__ */ v(Kd, {
											id: "plan_tier",
											className: "w-full",
											children: /* @__PURE__ */ v(Gd, {})
										}), /* @__PURE__ */ y(qd, { children: [/* @__PURE__ */ v(Jd, {
											value: "basic",
											children: Hd(i, "shopBot.tier", "basic")
										}), /* @__PURE__ */ v(Jd, {
											value: "advanced",
											children: Hd(i, "shopBot.tier", "advanced")
										})] })]
									})]
								}),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "bot_token",
									children: i("bots.botToken")
								}), /* @__PURE__ */ v(Y, {
									id: "bot_token",
									type: "password",
									autoComplete: "off",
									className: "mt-1 font-mono",
									value: String(s.bot_token ?? ""),
									onChange: (e) => c((t) => $(t, "bot_token", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "channel_id",
									children: i("bots.channelId")
								}), /* @__PURE__ */ v(Y, {
									id: "channel_id",
									className: "mt-1",
									value: String(s.channel_id ?? ""),
									onChange: (e) => c((t) => $(t, "channel_id", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "provider_token",
									children: i("bots.providerToken")
								}), /* @__PURE__ */ v(Y, {
									id: "provider_token",
									type: "password",
									autoComplete: "off",
									className: "mt-1 font-mono",
									value: String(s.provider_token ?? ""),
									onChange: (e) => c((t) => $(t, "provider_token", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ v(Ud, {
										id: "sandbox_mode",
										checked: s.sandbox_mode === "1",
										onCheckedChange: (e) => c((t) => tf(t, "sandbox_mode", e === !0))
									}), /* @__PURE__ */ v(X, {
										htmlFor: "sandbox_mode",
										className: "cursor-pointer font-normal",
										children: i("bots.settings.sandboxMode")
									})]
								}),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "bot_token_sandbox",
									children: i("bots.settings.sandboxToken")
								}), /* @__PURE__ */ v(Y, {
									id: "bot_token_sandbox",
									type: "password",
									className: "mt-1 font-mono",
									value: String(s.bot_token_sandbox ?? ""),
									onChange: (e) => c((t) => $(t, "bot_token_sandbox", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ v(Ud, {
										id: "webhook_require_secret",
										checked: s.webhook_require_secret === "1",
										onCheckedChange: (e) => c((t) => tf(t, "webhook_require_secret", e === !0))
									}), /* @__PURE__ */ v(X, {
										htmlFor: "webhook_require_secret",
										className: "cursor-pointer font-normal",
										children: i("bots.settings.webhookRequireSecret")
									})]
								}),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "webhook_secret",
									children: i("bots.settings.webhookSecret")
								}), /* @__PURE__ */ v(Y, {
									id: "webhook_secret",
									className: "mt-1 font-mono",
									value: String(s.webhook_secret ?? ""),
									onChange: (e) => c((t) => $(t, "webhook_secret", e.target.value))
								})] })
							]
						})]
					}),
					r === "telegram" ? /* @__PURE__ */ y("details", {
						className: "rounded-lg border border-border p-4 text-start",
						open: !0,
						children: [/* @__PURE__ */ v("summary", {
							className: "flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden",
							children: i("bots.settings.proxy")
						}), /* @__PURE__ */ y("div", {
							className: "mt-4 space-y-3",
							children: [
								/* @__PURE__ */ v("p", {
									className: "text-xs text-muted-foreground",
									children: i("bots.settings.proxyHint")
								}),
								/* @__PURE__ */ y("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ v(X, {
										htmlFor: "proxy_type",
										children: i("bots.settings.proxyType")
									}), /* @__PURE__ */ y(Wd, {
										value: String(s.proxy_type ?? "none"),
										onValueChange: (e) => c((t) => $(t, "proxy_type", e)),
										children: [/* @__PURE__ */ v(Kd, {
											id: "proxy_type",
											className: "w-full",
											children: /* @__PURE__ */ v(Gd, {})
										}), /* @__PURE__ */ y(qd, { children: [
											/* @__PURE__ */ v(Jd, {
												value: "none",
												children: i("bots.settings.proxyTypeNone")
											}),
											/* @__PURE__ */ v(Jd, {
												value: "http",
												children: i("bots.settings.proxyTypeHttp")
											}),
											/* @__PURE__ */ v(Jd, {
												value: "socks4",
												children: i("bots.settings.proxyTypeSocks4")
											}),
											/* @__PURE__ */ v(Jd, {
												value: "socks5",
												children: i("bots.settings.proxyTypeSocks5")
											})
										] })]
									})]
								}),
								[
									"http",
									"socks4",
									"socks5"
								].includes(String(s.proxy_type ?? "none")) ? /* @__PURE__ */ y(_, { children: [
									/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "proxy_host",
										children: i("bots.settings.proxyHost")
									}), /* @__PURE__ */ v(Y, {
										id: "proxy_host",
										className: "mt-1 font-mono",
										autoComplete: "off",
										value: String(s.proxy_host ?? ""),
										onChange: (e) => c((t) => $(t, "proxy_host", e.target.value))
									})] }),
									/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "proxy_port",
										children: i("bots.settings.proxyPort")
									}), /* @__PURE__ */ v(Y, {
										id: "proxy_port",
										type: "number",
										min: 1,
										max: 65535,
										className: "mt-1 font-mono",
										value: String(s.proxy_port ?? ""),
										onChange: (e) => c((t) => $(t, "proxy_port", e.target.value))
									})] }),
									/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "proxy_username",
										children: i("bots.settings.proxyUsername")
									}), /* @__PURE__ */ v(Y, {
										id: "proxy_username",
										className: "mt-1 font-mono",
										autoComplete: "off",
										value: String(s.proxy_username ?? ""),
										onChange: (e) => c((t) => $(t, "proxy_username", e.target.value))
									})] }),
									/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "proxy_password",
										children: i("bots.settings.proxyPassword")
									}), /* @__PURE__ */ v(Y, {
										id: "proxy_password",
										type: "password",
										className: "mt-1 font-mono",
										autoComplete: "new-password",
										value: String(s.proxy_password ?? ""),
										onChange: (e) => c((t) => $(t, "proxy_password", e.target.value))
									})] }),
									/* @__PURE__ */ v(q, {
										type: "button",
										size: "sm",
										variant: "outline",
										disabled: j.isPending || re.isFetching,
										onClick: async () => {
											try {
												await j.mutateAsync();
												let e = await a.fetchQuery({
													queryKey: [
														"bots",
														r,
														"connection-status"
													],
													queryFn: () => Q(`${o}/connection-status`)
												});
												e.ok ? w.success(i("bots.settings.proxyTestOk", { user: e.bot?.username ?? "—" })) : w.error(i("bots.settings.proxyTestFail", { error: e.error ?? "—" }));
											} catch (e) {
												gd(i, e);
											}
										},
										children: i("bots.settings.proxyTest")
									})
								] }) : null
							]
						})]
					}) : null,
					/* @__PURE__ */ y("details", {
						className: "rounded-lg border border-border p-4 text-start",
						open: !0,
						children: [/* @__PURE__ */ v("summary", {
							className: "flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden",
							children: i("bots.settings.messages")
						}), /* @__PURE__ */ y("div", {
							className: "mt-4 space-y-3",
							children: [
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "welcome_text",
									children: i("bots.welcomeText")
								}), /* @__PURE__ */ v(Zd, {
									id: "welcome_text",
									className: "mt-1 min-h-16",
									value: String(s.welcome_text ?? ""),
									onChange: (e) => c((t) => $(t, "welcome_text", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "error_text",
									children: i("bots.settings.errorText")
								}), /* @__PURE__ */ v(Zd, {
									id: "error_text",
									className: "mt-1 min-h-16",
									value: String(s.error_text ?? ""),
									onChange: (e) => c((t) => $(t, "error_text", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "contact_button_text",
									children: i("bots.settings.contactButton")
								}), /* @__PURE__ */ v(Y, {
									id: "contact_button_text",
									className: "mt-1",
									value: String(s.contact_button_text ?? ""),
									onChange: (e) => c((t) => $(t, "contact_button_text", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "store_button_text",
									children: i("bots.settings.storeButton")
								}), /* @__PURE__ */ v(Y, {
									id: "store_button_text",
									className: "mt-1",
									value: String(s.store_button_text ?? ""),
									onChange: (e) => c((t) => $(t, "store_button_text", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "auth_success_text",
									children: i("bots.settings.authSuccess")
								}), /* @__PURE__ */ v(Zd, {
									id: "auth_success_text",
									className: "mt-1 min-h-12",
									value: String(s.auth_success_text ?? ""),
									onChange: (e) => c((t) => $(t, "auth_success_text", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "support_contact_text",
									children: i("bots.settings.supportContact")
								}), /* @__PURE__ */ v(Zd, {
									id: "support_contact_text",
									className: "mt-1 min-h-12",
									value: String(s.support_contact_text ?? ""),
									onChange: (e) => c((t) => $(t, "support_contact_text", e.target.value))
								})] })
							]
						})]
					}),
					/* @__PURE__ */ y("details", {
						className: "rounded-lg border border-border p-4 text-start",
						children: [/* @__PURE__ */ v("summary", {
							className: "flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden",
							children: i("bots.settings.linksCommerce")
						}), /* @__PURE__ */ y("div", {
							className: "mt-4 space-y-3",
							children: [
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "manual_payment_link_template",
									children: i("bots.settings.manualPaymentTpl")
								}), /* @__PURE__ */ v(Zd, {
									id: "manual_payment_link_template",
									className: "mt-1 min-h-12",
									value: String(s.manual_payment_link_template ?? ""),
									onChange: (e) => c((t) => $(t, "manual_payment_link_template", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "post_tracking_url_template",
									children: i("bots.settings.postTrackingTpl")
								}), /* @__PURE__ */ v(Y, {
									id: "post_tracking_url_template",
									className: "mt-1",
									value: String(s.post_tracking_url_template ?? ""),
									onChange: (e) => c((t) => $(t, "post_tracking_url_template", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "channel_contact_id",
									children: i("bots.settings.channelContactId")
								}), /* @__PURE__ */ v(Y, {
									id: "channel_contact_id",
									className: "mt-1",
									value: String(s.channel_contact_id ?? ""),
									onChange: (e) => c((t) => $(t, "channel_contact_id", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "channel_bale_link",
									children: i("bots.settings.channelBaleLink")
								}), /* @__PURE__ */ v(Y, {
									id: "channel_bale_link",
									className: "mt-1",
									value: String(s.channel_bale_link ?? ""),
									onChange: (e) => c((t) => $(t, "channel_bale_link", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "products_per_page",
									children: i("bots.settings.productsPerPage")
								}), /* @__PURE__ */ v(Y, {
									id: "products_per_page",
									type: "number",
									min: 1,
									max: 20,
									className: "mt-1 w-24",
									value: String(s.products_per_page ?? 5),
									onChange: (e) => c((t) => $(t, "products_per_page", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ v(X, {
										htmlFor: "store_currency_unit",
										children: i("bots.settings.currencyUnit")
									}), /* @__PURE__ */ y(Wd, {
										value: String(s.store_currency_unit ?? "") || "_default",
										onValueChange: (e) => c((t) => $(t, "store_currency_unit", e === "_default" ? "" : e)),
										children: [/* @__PURE__ */ v(Kd, {
											id: "store_currency_unit",
											children: /* @__PURE__ */ v(Gd, {})
										}), /* @__PURE__ */ y(qd, { children: [
											/* @__PURE__ */ v(Jd, {
												value: "_default",
												children: i("bots.settings.currencyDefault")
											}),
											/* @__PURE__ */ v(Jd, {
												value: "toman",
												children: /* @__PURE__ */ y("span", {
													className: "inline-flex items-center gap-1.5",
													children: [/* @__PURE__ */ v(Vd, {}), Hd(i, "shopBot.currency", "toman")]
												})
											}),
											/* @__PURE__ */ v(Jd, {
												value: "rial",
												children: Hd(i, "shopBot.currency", "rial")
											})
										] })]
									})]
								}),
								/* @__PURE__ */ y("div", { children: [
									/* @__PURE__ */ v(X, {
										htmlFor: "invoice_amount_rial_multiplier",
										children: i("bots.settings.invoiceRialMultiplier")
									}),
									/* @__PURE__ */ v(Y, {
										id: "invoice_amount_rial_multiplier",
										type: "number",
										inputMode: "decimal",
										step: "0.01",
										min: .01,
										max: 1e3,
										className: "mt-1 w-32",
										value: String(s.invoice_amount_rial_multiplier ?? 1),
										onChange: (e) => c((t) => $(t, "invoice_amount_rial_multiplier", e.target.value))
									}),
									/* @__PURE__ */ v("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: i("bots.settings.invoiceRialMultiplierHint")
									})
								] }),
								/* @__PURE__ */ y("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ v(Ud, {
										id: "hide_out_of_stock_products",
										checked: s.hide_out_of_stock_products === "1",
										onCheckedChange: (e) => c((t) => tf(t, "hide_out_of_stock_products", e === !0))
									}), /* @__PURE__ */ v(X, {
										htmlFor: "hide_out_of_stock_products",
										className: "cursor-pointer font-normal",
										children: i("bots.settings.hideOutOfStock")
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ y("details", {
						className: "rounded-lg border border-border p-4 text-start",
						children: [/* @__PURE__ */ v("summary", {
							className: "flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden",
							children: i("bots.settings.orderTemplates")
						}), /* @__PURE__ */ y("div", {
							className: "mt-4 space-y-3",
							children: [/* @__PURE__ */ v("p", {
								className: "text-sm text-muted-foreground",
								children: i("settings.shopBots.legacyMovedHint")
							}), /* @__PURE__ */ v(q, {
								asChild: !0,
								variant: "outline",
								size: "sm",
								children: /* @__PURE__ */ v(x, {
									to: "/settings/shop/bots",
									children: i("settings.shopBots.openShopNotify")
								})
							})]
						})]
					}),
					/* @__PURE__ */ y("details", {
						className: "rounded-lg border border-border p-4 text-start",
						children: [/* @__PURE__ */ v("summary", {
							className: "flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden",
							children: i("bots.settings.notifyStatus")
						}), /* @__PURE__ */ y("div", {
							className: "mt-4 space-y-3",
							children: [/* @__PURE__ */ v("p", {
								className: "text-sm text-muted-foreground",
								children: i("settings.shopBots.legacyMovedHint")
							}), /* @__PURE__ */ v(q, {
								asChild: !0,
								variant: "outline",
								size: "sm",
								children: /* @__PURE__ */ v(x, {
									to: "/settings/shop/bots",
									children: i("settings.shopBots.openShopNotify")
								})
							})]
						})]
					}),
					/* @__PURE__ */ y("details", {
						className: "rounded-lg border border-border p-4 text-start",
						children: [/* @__PURE__ */ v("summary", {
							className: "flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden",
							children: i("bots.settings.abandonCart")
						}), /* @__PURE__ */ y("div", {
							className: "mt-4 space-y-3",
							children: [
								/* @__PURE__ */ y("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ v(Ud, {
										id: "abandon_cart_enabled",
										checked: s.abandon_cart_enabled === "1",
										onCheckedChange: (e) => c((t) => tf(t, "abandon_cart_enabled", e === !0))
									}), /* @__PURE__ */ v(X, {
										htmlFor: "abandon_cart_enabled",
										className: "cursor-pointer font-normal",
										children: i("bots.settings.abandonEnabled")
									})]
								}),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "abandon_cart_delay_hours",
									children: i("bots.settings.abandonDelay")
								}), /* @__PURE__ */ v(Y, {
									id: "abandon_cart_delay_hours",
									type: "number",
									min: 1,
									max: 720,
									className: "mt-1 w-28",
									value: String(s.abandon_cart_delay_hours ?? 24),
									onChange: (e) => c((t) => $(t, "abandon_cart_delay_hours", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "abandon_cart_message",
									children: i("bots.settings.abandonMessage")
								}), /* @__PURE__ */ v(Zd, {
									id: "abandon_cart_message",
									className: "mt-1 min-h-16",
									value: String(s.abandon_cart_message ?? ""),
									onChange: (e) => c((t) => $(t, "abandon_cart_message", e.target.value))
								})] }),
								/* @__PURE__ */ v("p", {
									className: "pt-1 text-xs font-medium text-muted-foreground",
									children: i("bots.settings.abandonStage2", "مرحله ۲")
								}),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "abandon_cart_delay_hours_2",
									children: i("bots.settings.abandonDelay2", "تأخیر مرحله ۲ (ساعت)")
								}), /* @__PURE__ */ v(Y, {
									id: "abandon_cart_delay_hours_2",
									type: "number",
									min: 1,
									max: 720,
									className: "mt-1 w-28",
									value: String(s.abandon_cart_delay_hours_2 ?? 48),
									onChange: (e) => c((t) => $(t, "abandon_cart_delay_hours_2", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "abandon_cart_message_2",
									children: i("bots.settings.abandonMessage2", "پیام مرحله ۲")
								}), /* @__PURE__ */ v(Zd, {
									id: "abandon_cart_message_2",
									className: "mt-1 min-h-14",
									value: String(s.abandon_cart_message_2 ?? ""),
									onChange: (e) => c((t) => $(t, "abandon_cart_message_2", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "abandon_cart_coupon_2",
									children: i("bots.settings.abandonCoupon2", "مبلغ کوپن مرحله ۲")
								}), /* @__PURE__ */ v(Y, {
									id: "abandon_cart_coupon_2",
									type: "number",
									min: 0,
									className: "mt-1 w-28",
									value: String(s.abandon_cart_coupon_2 ?? 0),
									onChange: (e) => c((t) => $(t, "abandon_cart_coupon_2", e.target.value))
								})] }),
								/* @__PURE__ */ v("p", {
									className: "pt-1 text-xs font-medium text-muted-foreground",
									children: i("bots.settings.abandonStage3", "مرحله ۳")
								}),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "abandon_cart_delay_hours_3",
									children: i("bots.settings.abandonDelay3", "تأخیر مرحله ۳ (ساعت)")
								}), /* @__PURE__ */ v(Y, {
									id: "abandon_cart_delay_hours_3",
									type: "number",
									min: 1,
									max: 720,
									className: "mt-1 w-28",
									value: String(s.abandon_cart_delay_hours_3 ?? 72),
									onChange: (e) => c((t) => $(t, "abandon_cart_delay_hours_3", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "abandon_cart_message_3",
									children: i("bots.settings.abandonMessage3", "پیام مرحله ۳")
								}), /* @__PURE__ */ v(Zd, {
									id: "abandon_cart_message_3",
									className: "mt-1 min-h-14",
									value: String(s.abandon_cart_message_3 ?? ""),
									onChange: (e) => c((t) => $(t, "abandon_cart_message_3", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "abandon_cart_coupon_3",
									children: i("bots.settings.abandonCoupon3", "مبلغ کوپن مرحله ۳")
								}), /* @__PURE__ */ v(Y, {
									id: "abandon_cart_coupon_3",
									type: "number",
									min: 0,
									className: "mt-1 w-28",
									value: String(s.abandon_cart_coupon_3 ?? 0),
									onChange: (e) => c((t) => $(t, "abandon_cart_coupon_3", e.target.value))
								})] })
							]
						})]
					}),
					/* @__PURE__ */ y("details", {
						className: "rounded-lg border border-border p-4 text-start",
						children: [/* @__PURE__ */ v("summary", {
							className: "flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden",
							children: i("bots.settings.forceJoin")
						}), /* @__PURE__ */ y("div", {
							className: "mt-4 space-y-3",
							children: [
								/* @__PURE__ */ y("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ v(Ud, {
										id: "force_join_enabled",
										checked: s.force_join_enabled === "1",
										onCheckedChange: (e) => c((t) => tf(t, "force_join_enabled", e === !0))
									}), /* @__PURE__ */ v(X, {
										htmlFor: "force_join_enabled",
										className: "cursor-pointer font-normal",
										children: i("bots.settings.forceJoinEnabled")
									})]
								}),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "force_join_channel_id",
									children: i("bots.settings.forceJoinChannelId")
								}), /* @__PURE__ */ v(Y, {
									id: "force_join_channel_id",
									className: "mt-1",
									value: String(s.force_join_channel_id ?? ""),
									onChange: (e) => c((t) => $(t, "force_join_channel_id", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "force_join_channel_link",
									children: i("bots.settings.forceJoinChannelLink")
								}), /* @__PURE__ */ v(Y, {
									id: "force_join_channel_link",
									className: "mt-1",
									value: String(s.force_join_channel_link ?? ""),
									onChange: (e) => c((t) => $(t, "force_join_channel_link", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "force_join_message",
									children: i("bots.settings.forceJoinMessage")
								}), /* @__PURE__ */ v(Zd, {
									id: "force_join_message",
									className: "mt-1 min-h-20",
									value: String(s.force_join_message ?? ""),
									onChange: (e) => c((t) => $(t, "force_join_message", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "force_join_check_button_text",
									children: i("bots.settings.forceJoinCheckBtn")
								}), /* @__PURE__ */ v(Y, {
									id: "force_join_check_button_text",
									className: "mt-1",
									value: String(s.force_join_check_button_text ?? ""),
									onChange: (e) => c((t) => $(t, "force_join_check_button_text", e.target.value))
								})] })
							]
						})]
					}),
					/* @__PURE__ */ y("details", {
						className: "rounded-lg border border-border p-4 text-start",
						children: [/* @__PURE__ */ v("summary", {
							className: "flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden",
							children: i("bots.settings.channelRules")
						}), /* @__PURE__ */ y("div", {
							className: "mt-4 space-y-3",
							children: [
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "channel_rule_category_ids",
									children: i("bots.settings.ruleCategories")
								}), /* @__PURE__ */ v(Y, {
									id: "channel_rule_category_ids",
									className: "mt-1",
									value: String(s.channel_rule_category_ids ?? ""),
									onChange: (e) => c((t) => $(t, "channel_rule_category_ids", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "channel_rule_tag_ids",
									children: i("bots.settings.ruleTags")
								}), /* @__PURE__ */ v(Y, {
									id: "channel_rule_tag_ids",
									className: "mt-1",
									value: String(s.channel_rule_tag_ids ?? ""),
									onChange: (e) => c((t) => $(t, "channel_rule_tag_ids", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ v(Ud, {
										id: "channel_rule_sale_only",
										checked: s.channel_rule_sale_only === "1",
										onCheckedChange: (e) => c((t) => tf(t, "channel_rule_sale_only", e === !0))
									}), /* @__PURE__ */ v(X, {
										htmlFor: "channel_rule_sale_only",
										className: "cursor-pointer font-normal",
										children: i("bots.settings.ruleSaleOnly")
									})]
								}),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "channel_rule_min_price",
									children: i("bots.settings.ruleMinPrice")
								}), /* @__PURE__ */ v(Y, {
									id: "channel_rule_min_price",
									className: "mt-1",
									value: String(s.channel_rule_min_price ?? ""),
									onChange: (e) => c((t) => $(t, "channel_rule_min_price", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", {
									className: "flex gap-3",
									children: [/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "channel_rule_hour_start",
										children: i("bots.settings.ruleHourStart")
									}), /* @__PURE__ */ v(Y, {
										id: "channel_rule_hour_start",
										className: "mt-1 w-20",
										value: String(s.channel_rule_hour_start ?? ""),
										onChange: (e) => c((t) => $(t, "channel_rule_hour_start", e.target.value))
									})] }), /* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "channel_rule_hour_end",
										children: i("bots.settings.ruleHourEnd")
									}), /* @__PURE__ */ v(Y, {
										id: "channel_rule_hour_end",
										className: "mt-1 w-20",
										value: String(s.channel_rule_hour_end ?? ""),
										onChange: (e) => c((t) => $(t, "channel_rule_hour_end", e.target.value))
									})] })]
								})
							]
						})]
					}),
					/* @__PURE__ */ y("details", {
						className: "rounded-lg border border-border p-4 text-start",
						children: [/* @__PURE__ */ v("summary", {
							className: "flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden",
							children: i("bots.settings.loyalty")
						}), /* @__PURE__ */ v("div", {
							className: "mt-4 space-y-3",
							children: (() => {
								let e = s.loyalty || {}, t = (e, t) => {
									c((n) => {
										let r = { ...n.loyalty || {} };
										return r[e] = typeof t == "boolean" ? t ? "1" : "0" : t, {
											...n,
											loyalty: r
										};
									});
								};
								return /* @__PURE__ */ y(_, { children: [
									/* @__PURE__ */ y("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ v(Ud, {
											id: "loyalty_enabled",
											checked: e.enabled === "1",
											onCheckedChange: (e) => t("enabled", e === !0)
										}), /* @__PURE__ */ v(X, {
											htmlFor: "loyalty_enabled",
											className: "cursor-pointer font-normal",
											children: i("bots.settings.loyaltyEnabled")
										})]
									}),
									/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "points_per_order",
										children: i("bots.settings.pointsPerOrder")
									}), /* @__PURE__ */ v(Y, {
										id: "points_per_order",
										type: "number",
										min: 0,
										className: "mt-1 w-28",
										value: String(e.points_per_order ?? 10),
										onChange: (e) => t("points_per_order", e.target.value)
									})] }),
									/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "min_order_amount",
										children: i("bots.settings.minOrderAmount")
									}), /* @__PURE__ */ v(Y, {
										id: "min_order_amount",
										type: "number",
										min: 0,
										className: "mt-1 w-36",
										value: String(e.min_order_amount ?? 0),
										onChange: (e) => t("min_order_amount", e.target.value)
									})] }),
									/* @__PURE__ */ y("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ v(Ud, {
											id: "referral_enabled",
											checked: e.referral_enabled === "1",
											onCheckedChange: (e) => t("referral_enabled", e === !0)
										}), /* @__PURE__ */ v(X, {
											htmlFor: "referral_enabled",
											className: "cursor-pointer font-normal",
											children: i("bots.settings.referralEnabled")
										})]
									}),
									/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "referral_points",
										children: i("bots.settings.referralPoints")
									}), /* @__PURE__ */ v(Y, {
										id: "referral_points",
										type: "number",
										min: 0,
										className: "mt-1 w-28",
										value: String(e.referral_points ?? 50),
										onChange: (e) => t("referral_points", e.target.value)
									})] }),
									/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "webapp_base_url",
										children: i("bots.settings.webappUrl")
									}), /* @__PURE__ */ v(Y, {
										id: "webapp_base_url",
										className: "mt-1",
										value: String(e.webapp_base_url ?? ""),
										onChange: (e) => t("webapp_base_url", e.target.value)
									})] }),
									/* @__PURE__ */ y("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ v(Ud, {
											id: "checkout_national_id",
											checked: (e.checkout_fields?.national_id?.enabled ?? "0") === "1",
											onCheckedChange: (e) => {
												c((t) => {
													let n = { ...t.loyalty || {} }, r = { ...n.checkout_fields || {} };
													return r.national_id = {
														...r.national_id || {},
														enabled: e === !0 ? "1" : "0"
													}, n.checkout_fields = r, {
														...t,
														loyalty: n
													};
												});
											}
										}), /* @__PURE__ */ v(X, {
											htmlFor: "checkout_national_id",
											className: "cursor-pointer font-normal",
											children: i("bots.settings.checkoutNationalId")
										})]
									}),
									/* @__PURE__ */ y("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ v(Ud, {
											id: "checkout_company",
											checked: (e.checkout_fields?.company?.enabled ?? "0") === "1",
											onCheckedChange: (e) => {
												c((t) => {
													let n = { ...t.loyalty || {} }, r = { ...n.checkout_fields || {} };
													return r.company = {
														...r.company || {},
														enabled: e === !0 ? "1" : "0"
													}, n.checkout_fields = r, {
														...t,
														loyalty: n
													};
												});
											}
										}), /* @__PURE__ */ v(X, {
											htmlFor: "checkout_company",
											className: "cursor-pointer font-normal",
											children: i("bots.settings.checkoutCompany", "دریافت نام شرکت در چک‌اوت")
										})]
									}),
									/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "first_order_bonus",
										children: i("bots.settings.firstOrderBonus", "پاداش اولین سفارش")
									}), /* @__PURE__ */ v(Y, {
										id: "first_order_bonus",
										type: "number",
										min: 0,
										className: "mt-1 w-28",
										value: String(e.first_order_bonus ?? 0),
										onChange: (e) => t("first_order_bonus", e.target.value)
									})] }),
									/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "redeem_points_cost",
										children: i("bots.settings.redeemPointsCost", "امتیاز لازم برای تبدیل")
									}), /* @__PURE__ */ v(Y, {
										id: "redeem_points_cost",
										type: "number",
										min: 0,
										className: "mt-1 w-28",
										value: String(e.redeem_points ?? e.redeem_points_cost ?? 100),
										onChange: (e) => t("redeem_points", e.target.value)
									})] }),
									/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "redeem_coupon_amount",
										children: i("bots.settings.redeemCouponAmount", "مبلغ کوپن تبدیل امتیاز")
									}), /* @__PURE__ */ v(Y, {
										id: "redeem_coupon_amount",
										type: "number",
										min: 0,
										className: "mt-1 w-28",
										value: String(e.redeem_coupon_amount ?? 10),
										onChange: (e) => t("redeem_coupon_amount", e.target.value)
									})] }),
									/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "welcome_coupon_amount",
										children: i("bots.settings.welcomeCouponAmount", "مبلغ کوپن خوش‌آمد")
									}), /* @__PURE__ */ v(Y, {
										id: "welcome_coupon_amount",
										type: "number",
										min: 0,
										className: "mt-1 w-28",
										value: String(e.welcome_coupon_amount ?? 0),
										onChange: (e) => t("welcome_coupon_amount", e.target.value)
									})] }),
									/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "inactive_nudge_days",
										children: i("bots.settings.inactiveNudgeDays", "یادآوری کاربر غیرفعال (روز)")
									}), /* @__PURE__ */ v(Y, {
										id: "inactive_nudge_days",
										type: "number",
										min: 0,
										className: "mt-1 w-28",
										value: String(e.inactive_nudge_days ?? 30),
										onChange: (e) => t("inactive_nudge_days", e.target.value)
									})] }),
									/* @__PURE__ */ y("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ v(Ud, {
											id: "sale_auto_notify",
											checked: s.sale_auto_notify === "1",
											onCheckedChange: (e) => c((t) => tf(t, "sale_auto_notify", e === !0))
										}), /* @__PURE__ */ v(X, {
											htmlFor: "sale_auto_notify",
											className: "cursor-pointer font-normal",
											children: i("bots.settings.saleAutoNotify", "اعلان خودکار شروع حراج")
										})]
									})
								] });
							})()
						})]
					}),
					/* @__PURE__ */ y("details", {
						className: "rounded-lg border border-border p-4 text-start",
						children: [/* @__PURE__ */ v("summary", {
							className: "flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden",
							children: i("bots.settings.menuToggles", "نمایش دکمه‌های منو")
						}), /* @__PURE__ */ v("div", {
							className: "mt-4 flex flex-wrap gap-3",
							children: Qd.map((e) => /* @__PURE__ */ y("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ v(Ud, {
									id: e,
									checked: rf(s[e]),
									onCheckedChange: (t) => c((n) => tf(n, e, t === !0))
								}), /* @__PURE__ */ v(X, {
									htmlFor: e,
									className: "cursor-pointer font-normal",
									children: i(`bots.settings.${e}`, e.replace("menu_show_", ""))
								})]
							}, e))
						})]
					}),
					/* @__PURE__ */ y("details", {
						className: "rounded-lg border border-border p-4 text-start",
						children: [/* @__PURE__ */ v("summary", {
							className: "flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden",
							children: i("bots.settings.parityModules", "ماژول‌های پاریتی")
						}), /* @__PURE__ */ y("div", {
							className: "mt-4 space-y-4",
							children: [
								S ? null : /* @__PURE__ */ v("p", {
									className: "text-xs text-muted-foreground",
									children: i("common.loading", "در حال بارگذاری…")
								}),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v("p", {
									className: "mb-2 text-xs font-medium text-muted-foreground",
									children: i("bots.settings.siteWidgets", "ویجت‌های سایت")
								}), /* @__PURE__ */ v("div", {
									className: "flex flex-wrap gap-3",
									children: $d.map((e) => /* @__PURE__ */ y("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ v(Ud, {
											id: `sw-${e}`,
											checked: nf(u[e]),
											onCheckedChange: (t) => d((n) => ({
												...n,
												[e]: t === !0 ? "1" : "0"
											}))
										}), /* @__PURE__ */ v(X, {
											htmlFor: `sw-${e}`,
											className: "cursor-pointer font-normal",
											children: i(`bots.settings.widget.${e}`, e.replace("_enabled", ""))
										})]
									}, e))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v("p", {
									className: "mb-2 text-xs font-medium text-muted-foreground",
									children: i("bots.settings.moduleFlags", "فعال‌سازی ماژول‌ها")
								}), /* @__PURE__ */ v("div", {
									className: "flex flex-wrap gap-3",
									children: ef.map((e) => /* @__PURE__ */ y("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ v(Ud, {
											id: `mod-${e}`,
											checked: nf(f[e]),
											onCheckedChange: (t) => h((n) => ({
												...n,
												[e]: t === !0 ? "1" : "0"
											}))
										}), /* @__PURE__ */ v(X, {
											htmlFor: `mod-${e}`,
											className: "cursor-pointer font-normal",
											children: i(`bots.settings.module.${e}`, e)
										})]
									}, e))
								})] }),
								/* @__PURE__ */ y("div", {
									className: "grid gap-3 sm:grid-cols-2",
									children: [/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "stock_threshold",
										children: i("bots.settings.stockThreshold", "آستانه موجودی کم")
									}), /* @__PURE__ */ v(Y, {
										id: "stock_threshold",
										type: "number",
										min: 0,
										className: "mt-1 w-28",
										value: String(g.stock_threshold ?? ""),
										onChange: (e) => b((t) => ({
											...t,
											stock_threshold: e.target.value
										}))
									})] }), /* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
										htmlFor: "route_high_aov",
										children: i("bots.settings.routeHighAov", "مسیریابی سفارش با مبلغ بالا")
									}), /* @__PURE__ */ v(Y, {
										id: "route_high_aov",
										type: "number",
										min: 0,
										className: "mt-1 w-36",
										value: String(g.route_high_aov ?? ""),
										onChange: (e) => b((t) => ({
											...t,
											route_high_aov: e.target.value
										}))
									})] })]
								})
							]
						})]
					}),
					/* @__PURE__ */ y("details", {
						className: "rounded-lg border border-border p-4 text-start",
						children: [/* @__PURE__ */ v("summary", {
							className: "flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden",
							children: i("bots.settings.templatePreview", "پیش‌نمایش قالب")
						}), /* @__PURE__ */ y("div", {
							className: "mt-4 space-y-3",
							children: [
								/* @__PURE__ */ v(Zd, {
									id: "parity_template",
									className: "min-h-20 font-mono text-xs",
									value: T,
									onChange: (e) => E(e.target.value),
									placeholder: "{order_number} {customer} {total}"
								}),
								/* @__PURE__ */ v(q, {
									type: "button",
									size: "sm",
									variant: "secondary",
									disabled: te || !T.trim(),
									onClick: () => void M(),
									children: i("bots.settings.preview", "پیش‌نمایش")
								}),
								ee ? /* @__PURE__ */ v("pre", {
									className: "max-h-40 overflow-auto rounded bg-muted/20 p-2 text-xs whitespace-pre-wrap",
									children: ee
								}) : null
							]
						})]
					}),
					/* @__PURE__ */ y("details", {
						className: "rounded-lg border border-border p-4 text-start",
						children: [/* @__PURE__ */ v("summary", {
							className: "flex cursor-pointer list-none items-center justify-between text-start text-sm font-semibold [&::-webkit-details-marker]:hidden",
							children: i("bots.settings.adminExtras")
						}), /* @__PURE__ */ y("div", {
							className: "mt-4 space-y-3",
							children: [
								/* @__PURE__ */ y("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ v(Ud, {
										id: "order_question_button_enabled",
										checked: s.order_question_button_enabled === "1",
										onCheckedChange: (e) => c((t) => tf(t, "order_question_button_enabled", e === !0))
									}), /* @__PURE__ */ v(X, {
										htmlFor: "order_question_button_enabled",
										className: "cursor-pointer font-normal",
										children: i("bots.settings.orderQuestionBtn")
									})]
								}),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "order_question_button_text",
									children: i("bots.settings.orderQuestionText")
								}), /* @__PURE__ */ v(Y, {
									id: "order_question_button_text",
									className: "mt-1",
									value: String(s.order_question_button_text ?? ""),
									onChange: (e) => c((t) => $(t, "order_question_button_text", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "support_notify_chat_id",
									children: i("bots.settings.supportNotifyChat")
								}), /* @__PURE__ */ v(Y, {
									id: "support_notify_chat_id",
									className: "mt-1 font-mono text-sm",
									value: String(s.support_notify_chat_id ?? ""),
									onChange: (e) => c((t) => $(t, "support_notify_chat_id", e.target.value))
								})] }),
								/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
									htmlFor: "bot_admin_chat_ids",
									children: i("bots.settings.botAdminChats")
								}), /* @__PURE__ */ v(Zd, {
									id: "bot_admin_chat_ids",
									className: "mt-1 min-h-16 font-mono text-xs",
									value: String(s.bot_admin_chat_ids ?? ""),
									onChange: (e) => c((t) => $(t, "bot_admin_chat_ids", e.target.value))
								})] })
							]
						})]
					}),
					/* @__PURE__ */ v(q, {
						type: "button",
						disabled: j.isPending,
						onClick: () => void j.mutateAsync(s),
						children: i("common.save")
					})
				]
			})
		]
	});
}
//#endregion
//#region src/components/settings/SettingsModuleCardStrip.tsx
function cf({ group: e, active: t }) {
	let n = K("size-4", t ? "text-primary" : "text-muted-foreground");
	return e.moduleSlug === "site-core" ? /* @__PURE__ */ v(L, {
		className: n,
		"aria-hidden": !0
	}) : e.moduleSlug === "shop-core" ? /* @__PURE__ */ v(ye, {
		className: n,
		"aria-hidden": !0
	}) : /* @__PURE__ */ v(ge, {
		className: n,
		"aria-hidden": !0
	});
}
function lf({ groups: e, activeModuleSlug: t, className: n }) {
	let { t: r } = m(), i = f(null);
	if (l(() => {
		let e = i.current;
		!e || !t || e.querySelector(`[data-module-slug="${CSS.escape(t)}"]`)?.scrollIntoView({
			inline: "nearest",
			block: "nearest",
			behavior: "smooth"
		});
	}, [t]), e.length === 0) return null;
	let a = (e) => {
		let t = i.current;
		if (!t) return;
		let n = Math.min(320, t.clientWidth * .7), r = getComputedStyle(t).direction === "rtl";
		t.scrollBy({
			left: e * (r ? -1 : 1) * n,
			behavior: "smooth"
		});
	};
	return /* @__PURE__ */ y("div", {
		className: K("w-full min-w-0 space-y-2", n),
		children: [/* @__PURE__ */ y("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ v("p", {
				className: "text-muted-foreground text-xs font-medium tracking-wide uppercase",
				children: r("settings.modules.stripTitle")
			}), /* @__PURE__ */ y("div", {
				className: "flex shrink-0 gap-1",
				children: [/* @__PURE__ */ v(q, {
					type: "button",
					variant: "outline",
					size: "icon",
					className: "size-8",
					"aria-label": r("settings.modules.scrollPrev"),
					onClick: () => a(-1),
					children: /* @__PURE__ */ v(de, { className: "size-4" })
				}), /* @__PURE__ */ v(q, {
					type: "button",
					variant: "outline",
					size: "icon",
					className: "size-8",
					"aria-label": r("settings.modules.scrollNext"),
					onClick: () => a(1),
					children: /* @__PURE__ */ v(fe, { className: "size-4" })
				})]
			})]
		}), /* @__PURE__ */ v("div", {
			ref: i,
			className: "wd-settings-card-scroll flex w-full min-w-0 gap-2.5 overflow-x-auto overscroll-x-contain touch-pan-x pb-2 snap-x snap-mandatory",
			role: "list",
			"aria-label": r("settings.modules.stripTitle"),
			children: e.filter((e) => e.parentSlug !== "wnc-core-module").map((e) => {
				let n = e.sections[0]?.route ?? `/settings/shop/ext/${e.moduleSlug}`, i = e.moduleSlug === t, a = e.titleKey ? r(e.titleKey, { defaultValue: e.title || e.moduleSlug }) : r(`marketplace.module.${e.moduleSlug}`, { defaultValue: e.title || e.moduleSlug });
				return /* @__PURE__ */ y(S, {
					to: n,
					role: "listitem",
					"data-module-slug": e.moduleSlug,
					className: K("bg-card hover:bg-accent/40 flex w-[10.5rem] shrink-0 snap-start flex-col gap-2 rounded-2xl border px-3.5 py-3 shadow-sm transition-[box-shadow,border-color,background]", i ? "border-primary/40 ring-primary/20 shadow-lift ring-2" : "border-border/70"),
					children: [
						/* @__PURE__ */ v("span", {
							className: K("flex size-9 items-center justify-center rounded-xl", i ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"),
							children: /* @__PURE__ */ v(cf, {
								group: e,
								active: i
							})
						}),
						/* @__PURE__ */ v("span", {
							className: "truncate text-sm font-medium leading-tight",
							children: a
						}),
						/* @__PURE__ */ v("span", {
							className: "text-muted-foreground truncate text-[11px]",
							children: r("settings.modules.sectionCount", { count: e.sections.length })
						})
					]
				}, e.moduleSlug);
			})
		})]
	});
}
//#endregion
//#region src/components/settings/SettingsModuleTabs.tsx
function uf({ sections: e, activeRoute: t, className: n, alwaysShow: r = !1 }) {
	let { t: i } = m();
	if (e.length === 0 || !r && e.length <= 1) return null;
	let a = (t ?? "").replace(/\/$/, "");
	return /* @__PURE__ */ v("nav", {
		className: K("wd-settings-tabs-scroll flex w-full min-w-0 gap-1 overflow-x-auto overscroll-x-contain touch-pan-x border-b border-border pb-px snap-x snap-mandatory", n),
		"aria-label": i("settings.modules.tabsLabel"),
		children: e.map((e) => {
			let t = e.route.replace(/\/$/, ""), n = a === t || a.startsWith(t + "/"), r = e.titleKey ? i(e.titleKey, { defaultValue: e.title }) : e.title;
			return /* @__PURE__ */ v(S, {
				to: e.route,
				className: K("shrink-0 snap-start border-b-2 px-3.5 py-2.5 text-sm whitespace-nowrap transition-colors", n ? "border-primary text-foreground font-medium" : "text-muted-foreground hover:text-foreground border-transparent"),
				children: r
			}, e.id);
		})
	});
}
//#endregion
//#region src/components/PageShell.tsx
function df({ title: e, description: t, eyebrow: n, children: r }) {
	return /* @__PURE__ */ y("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ y("header", {
			className: "min-w-0 space-y-1.5",
			children: [
				n ? /* @__PURE__ */ v("p", {
					className: "text-muted-foreground text-xs font-medium tracking-wide uppercase",
					children: n
				}) : null,
				/* @__PURE__ */ v("h1", {
					className: "text-xl font-semibold tracking-tight sm:text-2xl",
					children: e
				}),
				t ? /* @__PURE__ */ v("p", {
					className: "text-muted-foreground max-w-2xl text-sm leading-relaxed",
					children: t
				}) : null
			]
		}), r]
	});
}
//#endregion
//#region src/lib/settings-nav.ts
var ff = [
	"general",
	"privacy",
	"license",
	"dashboard",
	"style",
	"pwa",
	"modules",
	"bots",
	"system-logs",
	"analytics",
	"sms",
	"notifications"
], pf = [
	"general",
	"products",
	"tax",
	"shipping",
	"payments",
	"invoices",
	"sms",
	"bots",
	"emails",
	"advanced"
], mf = new Set(["bale-bot-module", "telegram-bot-module"]), hf = "bots-hub";
function gf(e) {
	let t = (e.moduleSlug || e.slug.replace(/-[a-z0-9]+$/i, "") || e.slug).trim(), n = e.route.startsWith("/") ? e.route : `/${e.route}`;
	return {
		id: e.sectionId || e.slug,
		title: e.title,
		titleKey: e.titleKey,
		route: n,
		slug: e.slug,
		moduleSlug: e.moduleSlug || t,
		moduleTitle: e.moduleTitle || e.title,
		area: e.area === "site" ? "site" : "shop"
	};
}
function _f() {
	return {
		moduleSlug: "site-core",
		title: "Site",
		titleKey: "settings.hub.siteTitle",
		area: "core",
		kind: "core",
		sections: ff.map((e) => ({
			id: e,
			title: e,
			titleKey: `settings.site.sections.${e === "system-logs" ? "systemLogs" : e}`,
			route: `/settings/site/${e}`,
			slug: `site-${e}`
		}))
	};
}
function vf() {
	return {
		moduleSlug: "shop-core",
		title: "Shop",
		titleKey: "settings.hub.shopTitle",
		area: "core",
		kind: "core",
		sections: pf.map((e) => ({
			id: e,
			title: e,
			titleKey: `settings.shop.sections.${e}`,
			route: `/settings/shop/${e}`,
			slug: `shop-${e}`
		}))
	};
}
function yf(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of od()) {
		if (e && n.area !== e) continue;
		let r = (n.parentSlug || "").trim();
		if (r === "payment-module" || n.moduleSlug === "payment-module") continue;
		let i = gf(n), a = mf.has(i.moduleSlug), o = a ? hf : i.moduleSlug, s = t.get(o);
		s || (s = {
			moduleSlug: o,
			title: a ? "Bots" : i.moduleTitle,
			titleKey: a ? "nav.module.bots" : `marketplace.module.${i.moduleSlug}`,
			area: i.area,
			kind: "module",
			parentSlug: a ? void 0 : r || void 0,
			sections: []
		}, t.set(o, s));
		let c = i.id, l = i.titleKey || (i.moduleSlug === "wfcp-module" && c ? `wfcp.tab.${c}` : `marketplace.module.${i.slug}`);
		s.sections.push({
			id: i.id,
			title: i.title,
			titleKey: l,
			route: i.route,
			slug: i.slug
		});
	}
	let n = t.get(hf);
	return n && n.sections.sort((e, t) => {
		let n = (e) => e.route.includes("/bale") ? 0 : e.route.includes("/telegram") ? 1 : 99;
		return n(e) - n(t);
	}), (!e || e === "shop") && window.webinoDashboard.flags?.wfcp && !t.has("wfcp-module") && t.set("wfcp-module", {
		moduleSlug: "wfcp-module",
		title: "Pricing",
		titleKey: "settings.shop.sections.pricing",
		area: "shop",
		kind: "module",
		sections: [
			{
				id: "dashboard",
				title: "Dashboard",
				titleKey: "wfcp.tab.dashboard",
				route: "/settings/shop/pricing/dashboard",
				slug: "wfcp-dashboard"
			},
			{
				id: "exchange",
				title: "Exchange",
				titleKey: "wfcp.tab.exchange",
				route: "/settings/shop/pricing/exchange",
				slug: "wfcp-exchange"
			},
			{
				id: "retail",
				title: "Retail",
				titleKey: "wfcp.tab.retail",
				route: "/settings/shop/pricing/retail",
				slug: "wfcp-retail"
			},
			{
				id: "credit",
				title: "Credit",
				titleKey: "wfcp.tab.credit",
				route: "/settings/shop/pricing/credit",
				slug: "wfcp-credit"
			},
			{
				id: "installment",
				title: "Installment",
				titleKey: "wfcp.tab.installment",
				route: "/settings/shop/pricing/installment",
				slug: "wfcp-installment"
			},
			{
				id: "wholesale",
				title: "Wholesale",
				titleKey: "wfcp.tab.wholesale",
				route: "/settings/shop/pricing/wholesale",
				slug: "wfcp-wholesale"
			},
			{
				id: "marketplaces",
				title: "Marketplaces",
				titleKey: "wfcp.tab.marketplaces",
				route: "/settings/shop/pricing/marketplaces",
				slug: "wfcp-marketplaces"
			},
			{
				id: "search-engines",
				title: "Search engines",
				titleKey: "wfcp.tab.search-engines",
				route: "/settings/shop/pricing/search-engines",
				slug: "wfcp-search-engines"
			},
			{
				id: "notifications",
				title: "Notifications",
				titleKey: "wfcp.tab.notifications",
				route: "/settings/shop/pricing/notifications",
				slug: "wfcp-notifications"
			},
			{
				id: "style",
				title: "Style",
				titleKey: "wfcp.tab.style",
				route: "/settings/shop/pricing/style",
				slug: "wfcp-style"
			},
			{
				id: "advanced",
				title: "Advanced",
				titleKey: "wfcp.tab.advanced",
				route: "/settings/shop/pricing/advanced",
				slug: "wfcp-advanced"
			}
		]
	}), Array.from(t.values()).sort((e, t) => e.title.localeCompare(t.title));
}
function bf() {
	return [
		_f(),
		vf(),
		...yf()
	];
}
var xf = /^\/settings\/shop\/(general|products|tax|shipping|payments|invoices|sms|emails|advanced)(\/|$)/, Sf = /^\/settings\/site\/(general|privacy|license|dashboard|style|pwa|modules|bots|system-logs|analytics|sms|notifications)(\/|$)/;
function Cf(e, t) {
	let n = t.replace(/\/$/, "") || "/";
	if (Sf.test(n)) return e.find((e) => e.moduleSlug === "site-core");
	if (xf.test(n) || n === "/settings" || n === "/settings/shop") return e.find((e) => e.moduleSlug === "shop-core");
	if (n === "/settings/site") return e.find((e) => e.moduleSlug === "site-core");
	let r = e.filter((e) => e.kind === "module");
	for (let e of r) {
		for (let t of e.sections) {
			let r = t.route.replace(/\/$/, "");
			if (n === r || n.startsWith(r + "/")) return e;
		}
		if (n.includes(`/ext/${e.moduleSlug}`)) return e;
		let t = `/settings/shop/${e.moduleSlug.replace(/-module$/, "")}`;
		if (n === t || n.startsWith(t + "/")) return e;
		if (e.moduleSlug.endsWith("-module")) {
			let t = `/settings/shop/${e.moduleSlug.replace(/-module$/, "")}`;
			if (n === t || n.startsWith(t + "/")) return e;
		}
	}
}
function wf(e, t) {
	let n = t.replace(/\/$/, "") || "/";
	return e.sections.find((e) => {
		let t = e.route.replace(/\/$/, "");
		return n === t || n.startsWith(t + "/");
	}) ?? e.sections[0];
}
//#endregion
//#region src/components/settings/SettingsModulesChrome.tsx
function Tf({ children: e, titleKey: t, descriptionKey: n, eyebrowKey: r = "settings.hub.title" }) {
	let { t: i } = m(), a = C(), o = d(() => bf(), []), s = d(() => Cf(o, a.pathname), [o, a.pathname]), c = s ? wf(s, a.pathname) : void 0, l = d(() => o.filter((e) => e.parentSlug !== "wnc-core-module"), [o]), u = s?.parentSlug === "wnc-core-module" ? "wnc-core-module" : s?.moduleSlug, f = t ?? (s?.moduleSlug === "site-core" ? "settings.site.title" : s?.moduleSlug === "shop-core" ? "settings.shop.title" : s?.titleKey ?? "settings.hub.title"), p = n ?? (s?.moduleSlug === "site-core" ? "settings.site.description" : s?.moduleSlug === "shop-core" ? "settings.shop.description" : "settings.modules.activeHint");
	return /* @__PURE__ */ v(df, {
		title: i(f, { defaultValue: s?.title ?? i("settings.hub.title") }),
		description: i(p),
		eyebrow: r ? i(r) : void 0,
		children: /* @__PURE__ */ y("div", {
			className: "flex w-full min-w-0 flex-col gap-4",
			children: [/* @__PURE__ */ v(lf, {
				groups: l,
				activeModuleSlug: u
			}), s ? /* @__PURE__ */ y(_, { children: [/* @__PURE__ */ v(uf, {
				sections: s.sections,
				activeRoute: c?.route ?? a.pathname,
				alwaysShow: s.kind === "core" || s.sections.length > 1
			}), /* @__PURE__ */ v("div", {
				className: "min-w-0",
				children: e
			})] }) : /* @__PURE__ */ y("div", {
				className: "min-w-0 space-y-3",
				children: [/* @__PURE__ */ v("p", {
					className: "text-muted-foreground text-sm",
					children: i("settings.modules.pickHint")
				}), e]
			})]
		})
	});
}
//#endregion
//#region ../Modules/telegram-bot-module/client/components/bots/BotCouponsPanel.tsx
function Ef({ provider: r }) {
	let { t: i } = m(), a = n(), o = `bots/${r}`, [s, c] = p(""), [l, u] = p("10"), [d, f] = p("percent"), h = t({
		queryKey: [
			"bots",
			r,
			"coupons"
		],
		queryFn: () => Q(`${o}/coupons`)
	}), g = e({
		mutationFn: () => Q(`${o}/coupons`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				code: s,
				amount: Number(l),
				type: d
			})
		}),
		onSuccess: async () => {
			c(""), await a.invalidateQueries({ queryKey: [
				"bots",
				r,
				"coupons"
			] }), w.success(i("common.saved"));
		},
		onError: (e) => gd(i, e)
	});
	return /* @__PURE__ */ y("div", {
		className: "space-y-4 rounded-lg border border-border p-4",
		children: [
			/* @__PURE__ */ v("p", {
				className: "text-sm font-medium",
				children: i("bots.couponsTitle")
			}),
			/* @__PURE__ */ y("div", {
				className: "flex flex-wrap items-end gap-3",
				children: [
					/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
						htmlFor: "bot-coupon-code",
						children: i("bots.couponCode")
					}), /* @__PURE__ */ v(Y, {
						id: "bot-coupon-code",
						className: "mt-1 w-40",
						value: s,
						onChange: (e) => c(e.target.value),
						placeholder: "BOT…"
					})] }),
					/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, {
						htmlFor: "bot-coupon-amount",
						children: i("bots.couponAmount")
					}), /* @__PURE__ */ v(Y, {
						id: "bot-coupon-amount",
						type: "number",
						className: "mt-1 w-28",
						value: l,
						onChange: (e) => u(e.target.value)
					})] }),
					/* @__PURE__ */ y("div", { children: [/* @__PURE__ */ v(X, { children: i("bots.couponType") }), /* @__PURE__ */ y(Wd, {
						value: d,
						onValueChange: f,
						children: [/* @__PURE__ */ v(Kd, {
							className: "mt-1 w-40",
							children: /* @__PURE__ */ v(Gd, {})
						}), /* @__PURE__ */ y(qd, { children: [/* @__PURE__ */ v(Jd, {
							value: "percent",
							children: "%"
						}), /* @__PURE__ */ v(Jd, {
							value: "fixed_cart",
							children: i("bots.couponFixedCart")
						})] })]
					})] }),
					/* @__PURE__ */ v(q, {
						type: "button",
						size: "sm",
						disabled: g.isPending,
						onClick: () => void g.mutateAsync(),
						children: i("bots.couponCreate")
					})
				]
			}),
			h.isLoading && /* @__PURE__ */ v("p", {
				className: "text-xs text-muted-foreground",
				children: "…"
			}),
			/* @__PURE__ */ v("ul", {
				className: "space-y-1 text-sm",
				children: (h.data?.items ?? []).map((e) => /* @__PURE__ */ y("li", {
					className: "font-mono text-xs",
					children: [
						e.code,
						" — ",
						e.amount,
						e.type === "percent" ? "%" : ""
					]
				}, e.id))
			})
		]
	});
}
//#endregion
//#region src/lib/currency.ts
var Df = /تومان|toman|irt/i;
function Of(e) {
	return e.replace(/&nbsp;/gi, " ").replace(/&#160;/g, " ").replace(/&#x0*a0;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, "\"").replace(/&#(\d+);/g, (e, t) => {
		let n = Number(t);
		return Number.isFinite(n) ? String.fromCharCode(n) : e;
	}).replace(/\u00a0/g, " ");
}
function kf(e, t) {
	let n = (e ?? "").trim(), r = (t ?? "").trim();
	if (!n && !r) return !1;
	let i = n.toUpperCase();
	return !!(i === "IRT" || i === "TOMAN" || i === "IRHT" || Df.test(n) || Df.test(r));
}
function Af(e) {
	let t = Of(e).trim();
	return t ? Df.test(t) ? {
		amount: t.replace(Df, "").replace(/\s+/g, " ").trim(),
		isToman: !0
	} : /^[\d\s.,٬٫]+$/.test(t) ? {
		amount: t.replace(/\s+/g, " ").trim(),
		isToman: !1
	} : {
		amount: t,
		isToman: !1
	} : {
		amount: "",
		isToman: !1
	};
}
//#endregion
//#region src/lib/formatNumber.ts
function jf(e, t) {
	let n = Number.isFinite(e) ? e : 0, r = Mu(t) ? "fa-IR" : "en-US", i = new Intl.NumberFormat(r, { maximumFractionDigits: 2 }).format(n);
	return Mu(t) ? Nu(i) : i;
}
//#endregion
//#region src/components/currency/MoneyDisplay.tsx
var Mf = /تومان|toman|irt/gi;
function Nf(e) {
	if (typeof e == "number") return Number.isFinite(e) ? e : 0;
	let t = Pu(Of(e)).replace(Mf, "").replace(/[^\d.-]/g, ""), n = parseFloat(t);
	return Number.isFinite(n) ? n : NaN;
}
function Pf({ amount: e, currency: t, currencySymbol: n, locale: r, className: i, amountClassName: a, prefix: o }) {
	let s = Nf(e), c = Number.isFinite(s) ? jf(s, r) : Fu(Pu(Of(String(e))).replace(Mf, "").trim(), r), l = kf(t, n) || !t?.trim() && !n?.trim();
	return /* @__PURE__ */ y("span", {
		className: K("inline-flex items-baseline gap-1", i),
		dir: "ltr",
		children: [
			o,
			l ? /* @__PURE__ */ v(Vd, {}) : null,
			/* @__PURE__ */ v("span", {
				className: a,
				children: c
			}),
			!l && t ? /* @__PURE__ */ v("span", {
				className: "text-muted-foreground text-[0.85em]",
				children: t
			}) : null
		]
	});
}
var Ff = /تومان|toman|irt/i;
function If({ text: e, className: t, locale: n = "en" }) {
	let r = Af(e), i = Of(e);
	return r.isToman || Ff.test(i) ? /* @__PURE__ */ y("span", {
		className: K("inline-flex items-baseline gap-1", t),
		dir: "ltr",
		children: [/* @__PURE__ */ v(Vd, {}), /* @__PURE__ */ v("span", { children: Fu(Pu(r.amount || i.replace(Ff, "").trim()), n) })]
	}) : /* @__PURE__ */ v("span", {
		className: t,
		children: Fu(i, n)
	});
}
//#endregion
//#region src/components/QueryErrorState.tsx
function Lf({ message: e, onRetry: t, className: n }) {
	let { t: r } = m(), [i, a] = p(!1), o = async () => {
		if (!(!t || i)) {
			a(!0);
			try {
				await t();
			} finally {
				a(!1);
			}
		}
	};
	return /* @__PURE__ */ y("div", {
		className: n ?? "space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center",
		children: [/* @__PURE__ */ v("p", {
			className: "text-sm text-destructive",
			children: e ?? r("common.loadFailed")
		}), t ? /* @__PURE__ */ v(q, {
			type: "button",
			variant: "outline",
			size: "sm",
			disabled: i,
			"aria-busy": i,
			onClick: () => void o(),
			children: r("license.retry")
		}) : null]
	});
}
//#endregion
//#region src/lib/bootstrapQuery.ts
function Rf(e) {
	let { nav_group: t, children: n, navGroup: r, ...i } = e;
	return {
		...i,
		navGroup: r ?? t,
		children: n?.map((e) => Rf(e))
	};
}
function zf(e) {
	return e?.length ? e.map((e) => Rf(e)) : e;
}
var Bf = ["bootstrap"];
function Vf(e) {
	return Array.isArray(e) ? e.filter((e) => typeof e == "string" && e.length > 0) : [];
}
function Hf(e) {
	return {
		...e,
		capabilities: Vf(e.capabilities),
		modules: zf(e.modules) ?? e.modules,
		installedModuleSlugs: Array.isArray(e.installedModuleSlugs) ? e.installedModuleSlugs.filter((e) => typeof e == "string" && e.length > 0) : e.installedModuleSlugs
	};
}
function Uf() {
	let e = window.webinoDashboard.bootstrap;
	if (e) return Hf(e);
}
//#endregion
//#region src/hooks/useBootstrapQuery.ts
function Wf() {
	let e = d(() => Uf(), []), n = !!(e && e.embedMinimal);
	return t({
		queryKey: Bf,
		queryFn: async () => Hf(await Q("bootstrap")),
		initialData: e,
		initialDataUpdatedAt: e ? n ? 0 : Date.now() : void 0,
		staleTime: n ? 0 : 12e4,
		gcTime: 6e5,
		placeholderData: (t) => t ?? e,
		refetchOnMount: n ? "always" : !e,
		refetchOnWindowFocus: !1,
		retry: 2,
		retryDelay: (e) => Math.min(1500 * 2 ** e, 8e3)
	});
}
//#endregion
//#region src/hooks/useStoreCurrency.ts
function Gf() {
	let e = Wf(), t = e.data?.site.currency ?? "", n = e.data?.site.currency_symbol ?? "";
	return {
		currency: t,
		currencySymbol: n,
		isToman: kf(t, n)
	};
}
//#endregion
//#region src/hooks/useQueryErrorToast.ts
function Kf(e) {
	let { t } = m(), n = f(!1);
	l(() => {
		e.isError && e.error ? n.current || (n.current = !0, w.error(hd(t, e.error))) : n.current = !1;
	}, [
		e.isError,
		e.error,
		e.fetchStatus,
		t
	]);
}
//#endregion
//#region ../Modules/telegram-bot-module/client/components/bots/BotDashboardPanel.tsx
function qf({ block: e, locale: t, currency: n, currencySymbol: r }) {
	return e.total_text && e.total_text.trim() !== "" ? Af(e.total_text).isToman ? /* @__PURE__ */ v(If, { text: e.total_text }) : /* @__PURE__ */ v("span", { children: e.total_text }) : /* @__PURE__ */ v(Pf, {
		amount: Math.round(e.total),
		currency: n,
		currencySymbol: r,
		locale: t
	});
}
function Jf({ provider: e }) {
	let { t: n, i18n: r } = m(), i = Gf(), a = `bots/${e}`, o = t({
		queryKey: [
			"bots",
			e,
			"dashboard-stats"
		],
		queryFn: () => Q(`${a}/dashboard-stats`)
	});
	Kf(o);
	let s = [
		{
			to: `/settings/site/bots?provider=${e}`,
			icon: ve,
			label: n("bots.tabs.settings")
		},
		{
			to: `/users/list?bot=${e}`,
			icon: be,
			label: n("bots.tabs.users")
		},
		{
			to: `/marketing/bot-broadcast?provider=${e}`,
			icon: me,
			label: n("bots.tabs.broadcast")
		},
		{
			to: `/marketing/bot-campaigns?provider=${e}`,
			icon: he,
			label: n("bots.tabs.campaigns")
		},
		{
			to: `/settings/site/system-logs?provider=${e}`,
			icon: _e,
			label: n("bots.tabs.logs")
		}
	];
	if (o.isLoading) return /* @__PURE__ */ y("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ v("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
			children: Array.from({ length: 4 }).map((e, t) => /* @__PURE__ */ v(Xu, {
				className: "shadow-sm",
				children: /* @__PURE__ */ y(ed, {
					className: "space-y-2 pt-6",
					children: [/* @__PURE__ */ v(Ju, { className: "h-4 w-24" }), /* @__PURE__ */ v(Ju, { className: "h-8 w-16" })]
				})
			}, t))
		}), /* @__PURE__ */ v(rd, {
			rows: 6,
			columns: 4
		})]
	});
	if (o.isError || !o.data) return /* @__PURE__ */ v(Lf, { onRetry: () => void o.refetch() });
	let c = o.data;
	return /* @__PURE__ */ y("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ y(Xu, {
				className: "shadow-sm",
				children: [/* @__PURE__ */ v(Zu, {
					className: "pb-3",
					children: /* @__PURE__ */ v(Qu, {
						className: "text-base",
						children: n("bots.quickLinks")
					})
				}), /* @__PURE__ */ v(ed, {
					className: "flex flex-wrap gap-2",
					children: s.map(({ to: e, icon: t, label: n }) => /* @__PURE__ */ v(q, {
						variant: "outline",
						size: "sm",
						asChild: !0,
						children: /* @__PURE__ */ y(x, {
							to: e,
							children: [/* @__PURE__ */ v(t, {
								className: "size-4",
								"aria-hidden": !0
							}), n]
						})
					}, e))
				})]
			}),
			/* @__PURE__ */ y("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ v(Xf, {
						label: n("bots.stats.usersLinked"),
						value: jf(c.users_linked, r.language)
					}),
					/* @__PURE__ */ v(Xf, {
						label: n("bots.stats.ordersAll"),
						value: jf(c.orders_all, r.language)
					}),
					/* @__PURE__ */ v(Xf, {
						label: n("bots.stats.orders7d"),
						value: jf(c.orders_7d, r.language)
					}),
					/* @__PURE__ */ v(Xf, {
						label: n("bots.stats.sessions24h"),
						value: jf(c.sessions_24h, r.language)
					})
				]
			}),
			/* @__PURE__ */ y("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ v(Xf, {
						label: n("bots.stats.salesCurrentCount"),
						value: jf(c.sales_compare.current.count, r.language)
					}),
					/* @__PURE__ */ v(Xf, {
						label: n("bots.stats.salesCurrentTotal"),
						value: /* @__PURE__ */ v(qf, {
							block: c.sales_compare.current,
							locale: r.language,
							currency: i.currency,
							currencySymbol: i.currencySymbol
						})
					}),
					/* @__PURE__ */ v(Xf, {
						label: n("bots.stats.salesPrevCount"),
						value: jf(c.sales_compare.previous.count, r.language)
					}),
					/* @__PURE__ */ v(Xf, {
						label: n("bots.stats.salesPrevTotal"),
						value: /* @__PURE__ */ v(qf, {
							block: c.sales_compare.previous,
							locale: r.language,
							currency: i.currency,
							currencySymbol: i.currencySymbol
						})
					})
				]
			}),
			/* @__PURE__ */ y("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ y(Xu, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ v(Zu, {
						className: "pb-2",
						children: /* @__PURE__ */ v(Qu, {
							className: "text-base",
							children: n("bots.stats.recentOrders")
						})
					}), /* @__PURE__ */ v(ed, {
						className: "overflow-x-auto p-0 pb-2",
						children: /* @__PURE__ */ y("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ v("thead", { children: /* @__PURE__ */ y("tr", {
								className: "border-b border-border text-left text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ v("th", {
										className: "p-2",
										children: n("bots.stats.colOrder")
									}),
									/* @__PURE__ */ v("th", {
										className: "p-2",
										children: n("bots.stats.colTotal")
									}),
									/* @__PURE__ */ v("th", {
										className: "p-2",
										children: n("bots.stats.colStatus")
									}),
									/* @__PURE__ */ v("th", {
										className: "p-2",
										children: n("bots.stats.colDate")
									})
								]
							}) }), /* @__PURE__ */ v("tbody", { children: c.recent_orders.length === 0 ? /* @__PURE__ */ v("tr", { children: /* @__PURE__ */ v("td", {
								colSpan: 4,
								className: "p-3 text-muted-foreground",
								children: n("bots.stats.empty")
							}) }) : c.recent_orders.map((e) => /* @__PURE__ */ y("tr", {
								className: "border-t border-border",
								children: [
									/* @__PURE__ */ v("td", {
										className: "p-2",
										children: /* @__PURE__ */ y(x, {
											to: `/orders/list/${e.id}`,
											className: "text-primary underline-offset-4 hover:underline",
											children: ["#", Fu(e.number, r.language)]
										})
									}),
									/* @__PURE__ */ v("td", {
										className: "p-2",
										children: /* @__PURE__ */ v(If, {
											text: e.total_text,
											locale: r.language
										})
									}),
									/* @__PURE__ */ v("td", {
										className: "p-2",
										children: e.status_name
									}),
									/* @__PURE__ */ v("td", {
										className: "p-2 text-xs text-muted-foreground",
										children: e.date
									})
								]
							}, e.id)) })]
						})
					})]
				}), /* @__PURE__ */ y(Xu, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ v(Zu, {
						className: "pb-2",
						children: /* @__PURE__ */ v(Qu, {
							className: "text-base",
							children: n("bots.stats.recentUsers")
						})
					}), /* @__PURE__ */ v(ed, {
						className: "overflow-x-auto p-0 pb-2",
						children: /* @__PURE__ */ y("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ v("thead", { children: /* @__PURE__ */ y("tr", {
								className: "border-b border-border text-left text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ v("th", {
										className: "p-2",
										children: n("bots.stats.colUser")
									}),
									/* @__PURE__ */ v("th", {
										className: "p-2",
										children: n("bots.stats.colPhone")
									}),
									/* @__PURE__ */ v("th", {
										className: "p-2",
										children: n("bots.stats.colChatId")
									})
								]
							}) }), /* @__PURE__ */ v("tbody", { children: c.recent_users.length === 0 ? /* @__PURE__ */ v("tr", { children: /* @__PURE__ */ v("td", {
								colSpan: 3,
								className: "p-3 text-muted-foreground",
								children: n("bots.stats.empty")
							}) }) : c.recent_users.map((e) => /* @__PURE__ */ y("tr", {
								className: "border-t border-border",
								children: [
									/* @__PURE__ */ v("td", {
										className: "p-2",
										children: /* @__PURE__ */ v(x, {
											to: `/users/${e.id}`,
											className: "text-primary underline-offset-4 hover:underline",
											children: e.display_name
										})
									}),
									/* @__PURE__ */ v("td", {
										className: "p-2",
										children: Fu(e.phone, r.language)
									}),
									/* @__PURE__ */ v("td", {
										className: "p-2 font-mono text-xs",
										children: e.chat_id
									})
								]
							}, e.id)) })]
						})
					})]
				})]
			}),
			/* @__PURE__ */ v(Yf, { provider: e }),
			/* @__PURE__ */ v(Ef, { provider: e })
		]
	});
}
function Yf({ provider: e }) {
	let { t: n, i18n: r } = m(), i = t({
		queryKey: [
			"bots",
			e,
			"stats-advanced"
		],
		queryFn: () => Q(`bots/${e}/stats/advanced`)
	});
	if (i.isError || !i.data) return null;
	let a = i.data, o = a.by_payment_method || {};
	return /* @__PURE__ */ y(Xu, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ y(Zu, {
			className: "flex flex-row items-center justify-between gap-2 pb-2",
			children: [/* @__PURE__ */ v(Qu, {
				className: "text-base",
				children: n("bots.stats.advanced")
			}), /* @__PURE__ */ v(q, {
				type: "button",
				size: "sm",
				variant: "outline",
				onClick: () => {
					let t = [[
						"method",
						"count",
						"total"
					]];
					for (let [e, n] of Object.entries(o)) t.push([
						e,
						String(n.count ?? 0),
						String(n.total ?? 0)
					]);
					t.push([
						"abandon_recovery_rate",
						String(a.abandon_recovery_rate ?? ""),
						""
					]), t.push([
						"coupons_issued",
						String(a.coupons_issued ?? ""),
						""
					]), t.push([
						"coupons_used",
						String(a.coupons_used ?? ""),
						""
					]);
					let n = new Blob([t.map((e) => e.join(",")).join("\n")], { type: "text/csv;charset=utf-8" }), r = URL.createObjectURL(n), i = document.createElement("a");
					i.href = r, i.download = `bot-stats-${e}.csv`, i.click(), URL.revokeObjectURL(r);
				},
				children: "CSV"
			})]
		}), /* @__PURE__ */ y(ed, {
			className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm",
			children: [Object.entries(o).map(([e, t]) => /* @__PURE__ */ y("div", {
				className: "rounded-md border border-border p-2",
				children: [
					/* @__PURE__ */ v("p", {
						className: "text-xs text-muted-foreground",
						children: e
					}),
					/* @__PURE__ */ v("p", {
						className: "font-semibold tabular-nums",
						children: jf(t.count, r.language)
					}),
					/* @__PURE__ */ v("p", {
						className: "text-xs text-muted-foreground tabular-nums",
						children: jf(Math.round(t.total), r.language)
					})
				]
			}, e)), typeof a.abandon_recovery_rate == "number" ? /* @__PURE__ */ y("div", {
				className: "rounded-md border border-border p-2",
				children: [/* @__PURE__ */ v("p", {
					className: "text-xs text-muted-foreground",
					children: n("bots.stats.abandonRecovery")
				}), /* @__PURE__ */ y("p", {
					className: "font-semibold tabular-nums",
					children: [jf(a.abandon_recovery_rate, r.language), "%"]
				})]
			}) : null]
		})]
	});
}
function Xf({ label: e, value: t }) {
	return /* @__PURE__ */ v(Xu, {
		className: "shadow-sm",
		children: /* @__PURE__ */ y(ed, {
			className: "pt-6",
			children: [/* @__PURE__ */ v("p", {
				className: "text-2xl font-semibold tabular-nums",
				children: t
			}), /* @__PURE__ */ v("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: e
			})]
		})
	});
}
//#endregion
//#region ../Modules/telegram-bot-module/client/pages/bots/TelegramBotDashboardPage.tsx
function Zf() {
	return /* @__PURE__ */ v(Tf, { children: /* @__PURE__ */ v(Jf, { provider: "telegram" }) });
}
//#endregion
//#region ../Modules/telegram-bot-module/client/module-entry.tsx
var Qf = { "bots/telegram": Zf }, $f = {
	BotSettingsPanel: sf,
	BotLogsPanel: Bd
}, ep = {
	routes: Qf,
	components: $f
};
//#endregion
export { $f as components, ep as default, Qf as routes };
