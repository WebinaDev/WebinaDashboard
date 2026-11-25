import { useMutation as e, useQuery as t, useQueryClient as n } from "@tanstack/react-query";
import * as r from "react";
import i, { createContext as a, createElement as o, forwardRef as s, useContext as c, useEffect as l, useLayoutEffect as u, useState as d } from "react";
import { useTranslation as f } from "react-i18next";
import { Link as p } from "react-router-dom";
import { toast as m } from "sonner";
import { Fragment as h, jsx as g, jsxs as _ } from "react/jsx-runtime";
import * as v from "react-dom";
import y from "react-dom";
//#region node_modules/clsx/dist/clsx.mjs
function b(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") if (Array.isArray(e)) {
		var i = e.length;
		for (t = 0; t < i; t++) e[t] && (n = b(e[t])) && (r && (r += " "), r += n);
	} else for (n in e) e[n] && (r && (r += " "), r += n);
	return r;
}
function x() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = b(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/tailwind-merge/dist/bundle-mjs.mjs
var S = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, C = (e, t) => ({
	classGroupId: e,
	validator: t
}), w = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), T = "-", E = [], ee = "arbitrary..", D = (e) => {
	let t = A(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return k(e);
			let n = e.split(T);
			return O(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? S(i, t) : t : i || E;
			}
			return n[e] || E;
		}
	};
}, O = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = O(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(T) : e.slice(t).join(T), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, k = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? ee + r : void 0;
})(), A = (e) => {
	let { theme: t, classGroups: n } = e;
	return j(n, t);
}, j = (e, t) => {
	let n = w();
	for (let r in e) {
		let i = e[r];
		M(i, n, r, t);
	}
	return n;
}, M = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		N(i, t, n, r);
	}
}, N = (e, t, n, r) => {
	if (typeof e == "string") {
		P(e, t, n);
		return;
	}
	if (typeof e == "function") {
		F(e, t, n, r);
		return;
	}
	te(e, t, n, r);
}, P = (e, t, n) => {
	let r = e === "" ? t : ne(t, e);
	r.classGroupId = n;
}, F = (e, t, n, r) => {
	if (re(e)) {
		M(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(C(n, e));
}, te = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		M(o, ne(t, a), n, r);
	}
}, ne = (e, t) => {
	let n = e, r = t.split(T), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = w(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, re = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, ie = (e) => {
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
}, I = "!", L = ":", ae = [], oe = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), R = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === L) {
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
		s.endsWith(I) ? (c = s.slice(0, -1), l = !0) : s.startsWith(I) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return oe(t, l, c, u);
	};
	if (t) {
		let e = t + L, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : oe(ae, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, se = (e) => {
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
}, ce = (e) => ({
	cache: ie(e.cacheSize),
	parseClassName: R(e),
	sortModifiers: se(e),
	...D(e)
}), le = /\s+/, ue = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(le), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + I : g, v = _ + h;
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
}, de = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = fe(n)) && (i && (i += " "), i += r);
	return i;
}, fe = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = fe(e[r])) && (n && (n += " "), n += t);
	return n;
}, pe = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = ce(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = ue(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(de(...e));
}, me = [], z = (e) => {
	let t = (t) => t[e] || me;
	return t.isThemeGetter = !0, t;
}, he = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, ge = /^\((?:(\w[\w-]*):)?(.+)\)$/i, _e = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, ve = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, ye = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, be = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, xe = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Se = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, Ce = (e) => _e.test(e), B = (e) => !!e && !Number.isNaN(Number(e)), we = (e) => !!e && Number.isInteger(Number(e)), Te = (e) => e.endsWith("%") && B(e.slice(0, -1)), Ee = (e) => ve.test(e), De = () => !0, Oe = (e) => ye.test(e) && !be.test(e), ke = () => !1, Ae = (e) => xe.test(e), je = (e) => Se.test(e), Me = (e) => !V(e) && !H(e), Ne = (e) => Je(e, Qe, ke), V = (e) => he.test(e), Pe = (e) => Je(e, $e, Oe), Fe = (e) => Je(e, et, B), Ie = (e) => Je(e, nt, De), Le = (e) => Je(e, tt, ke), Re = (e) => Je(e, Xe, ke), ze = (e) => Je(e, Ze, je), Be = (e) => Je(e, rt, Ae), H = (e) => ge.test(e), Ve = (e) => Ye(e, $e), He = (e) => Ye(e, tt), Ue = (e) => Ye(e, Xe), We = (e) => Ye(e, Qe), Ge = (e) => Ye(e, Ze), Ke = (e) => Ye(e, rt, !0), qe = (e) => Ye(e, nt, !0), Je = (e, t, n) => {
	let r = he.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, Ye = (e, t, n = !1) => {
	let r = ge.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, Xe = (e) => e === "position" || e === "percentage", Ze = (e) => e === "image" || e === "url", Qe = (e) => e === "length" || e === "size" || e === "bg-size", $e = (e) => e === "length", et = (e) => e === "number", tt = (e) => e === "family-name", nt = (e) => e === "number" || e === "weight", rt = (e) => e === "shadow", it = /* @__PURE__ */ pe(() => {
	let e = z("color"), t = z("font"), n = z("text"), r = z("font-weight"), i = z("tracking"), a = z("leading"), o = z("breakpoint"), s = z("container"), c = z("spacing"), l = z("radius"), u = z("shadow"), d = z("inset-shadow"), f = z("text-shadow"), p = z("drop-shadow"), m = z("blur"), h = z("perspective"), g = z("aspect"), _ = z("ease"), v = z("animate"), y = () => [
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
		H,
		V
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
		H,
		V,
		c
	], T = () => [
		Ce,
		"full",
		"auto",
		...w()
	], E = () => [
		we,
		"none",
		"subgrid",
		H,
		V
	], ee = () => [
		"auto",
		{ span: [
			"full",
			we,
			H,
			V
		] },
		we,
		H,
		V
	], D = () => [
		we,
		"auto",
		H,
		V
	], O = () => [
		"auto",
		"min",
		"max",
		"fr",
		H,
		V
	], k = () => [
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
	], A = () => [
		"start",
		"end",
		"center",
		"stretch",
		"center-safe",
		"end-safe"
	], j = () => ["auto", ...w()], M = () => [
		Ce,
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
	], N = () => [
		Ce,
		"screen",
		"full",
		"dvw",
		"lvw",
		"svw",
		"min",
		"max",
		"fit",
		...w()
	], P = () => [
		Ce,
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
	], F = () => [
		e,
		H,
		V
	], te = () => [
		...b(),
		Ue,
		Re,
		{ position: [H, V] }
	], ne = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], re = () => [
		"auto",
		"cover",
		"contain",
		We,
		Ne,
		{ size: [H, V] }
	], ie = () => [
		Te,
		Ve,
		Pe
	], I = () => [
		"",
		"none",
		"full",
		l,
		H,
		V
	], L = () => [
		"",
		B,
		Ve,
		Pe
	], ae = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	], oe = () => [
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
	], R = () => [
		B,
		Te,
		Ue,
		Re
	], se = () => [
		"",
		"none",
		m,
		H,
		V
	], ce = () => [
		"none",
		B,
		H,
		V
	], le = () => [
		"none",
		B,
		H,
		V
	], ue = () => [
		B,
		H,
		V
	], de = () => [
		Ce,
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
			blur: [Ee],
			breakpoint: [Ee],
			color: [De],
			container: [Ee],
			"drop-shadow": [Ee],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [Me],
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
			"inset-shadow": [Ee],
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
			radius: [Ee],
			shadow: [Ee],
			spacing: ["px", B],
			text: [Ee],
			"text-shadow": [Ee],
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
				Ce,
				V,
				H,
				g
			] }],
			container: ["container"],
			columns: [{ columns: [
				B,
				V,
				H,
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
				we,
				"auto",
				H,
				V
			] }],
			basis: [{ basis: [
				Ce,
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
				B,
				Ce,
				"auto",
				"initial",
				"none",
				V
			] }],
			grow: [{ grow: [
				"",
				B,
				H,
				V
			] }],
			shrink: [{ shrink: [
				"",
				B,
				H,
				V
			] }],
			order: [{ order: [
				we,
				"first",
				"last",
				"none",
				H,
				V
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
			"auto-cols": [{ "auto-cols": O() }],
			"auto-rows": [{ "auto-rows": O() }],
			gap: [{ gap: w() }],
			"gap-x": [{ "gap-x": w() }],
			"gap-y": [{ "gap-y": w() }],
			"justify-content": [{ justify: [...k(), "normal"] }],
			"justify-items": [{ "justify-items": [...A(), "normal"] }],
			"justify-self": [{ "justify-self": ["auto", ...A()] }],
			"align-content": [{ content: ["normal", ...k()] }],
			"align-items": [{ items: [...A(), { baseline: ["", "last"] }] }],
			"align-self": [{ self: [
				"auto",
				...A(),
				{ baseline: ["", "last"] }
			] }],
			"place-content": [{ "place-content": k() }],
			"place-items": [{ "place-items": [...A(), "baseline"] }],
			"place-self": [{ "place-self": ["auto", ...A()] }],
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
			m: [{ m: j() }],
			mx: [{ mx: j() }],
			my: [{ my: j() }],
			ms: [{ ms: j() }],
			me: [{ me: j() }],
			mbs: [{ mbs: j() }],
			mbe: [{ mbe: j() }],
			mt: [{ mt: j() }],
			mr: [{ mr: j() }],
			mb: [{ mb: j() }],
			ml: [{ ml: j() }],
			"space-x": [{ "space-x": w() }],
			"space-x-reverse": ["space-x-reverse"],
			"space-y": [{ "space-y": w() }],
			"space-y-reverse": ["space-y-reverse"],
			size: [{ size: M() }],
			"inline-size": [{ inline: ["auto", ...N()] }],
			"min-inline-size": [{ "min-inline": ["auto", ...N()] }],
			"max-inline-size": [{ "max-inline": ["none", ...N()] }],
			"block-size": [{ block: ["auto", ...P()] }],
			"min-block-size": [{ "min-block": ["auto", ...P()] }],
			"max-block-size": [{ "max-block": ["none", ...P()] }],
			w: [{ w: [
				s,
				"screen",
				...M()
			] }],
			"min-w": [{ "min-w": [
				s,
				"screen",
				"none",
				...M()
			] }],
			"max-w": [{ "max-w": [
				s,
				"screen",
				"none",
				"prose",
				{ screen: [o] },
				...M()
			] }],
			h: [{ h: [
				"screen",
				"lh",
				...M()
			] }],
			"min-h": [{ "min-h": [
				"screen",
				"lh",
				"none",
				...M()
			] }],
			"max-h": [{ "max-h": [
				"screen",
				"lh",
				...M()
			] }],
			"font-size": [{ text: [
				"base",
				n,
				Ve,
				Pe
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				qe,
				Ie
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
				Te,
				V
			] }],
			"font-family": [{ font: [
				He,
				Le,
				t
			] }],
			"font-features": [{ "font-features": [V] }],
			"fvn-normal": ["normal-nums"],
			"fvn-ordinal": ["ordinal"],
			"fvn-slashed-zero": ["slashed-zero"],
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			tracking: [{ tracking: [
				i,
				H,
				V
			] }],
			"line-clamp": [{ "line-clamp": [
				B,
				"none",
				H,
				Fe
			] }],
			leading: [{ leading: [a, ...w()] }],
			"list-image": [{ "list-image": [
				"none",
				H,
				V
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				H,
				V
			] }],
			"text-alignment": [{ text: [
				"left",
				"center",
				"right",
				"justify",
				"start",
				"end"
			] }],
			"placeholder-color": [{ placeholder: F() }],
			"text-color": [{ text: F() }],
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			"text-decoration-style": [{ decoration: [...ae(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				B,
				"from-font",
				"auto",
				H,
				Pe
			] }],
			"text-decoration-color": [{ decoration: F() }],
			"underline-offset": [{ "underline-offset": [
				B,
				"auto",
				H,
				V
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
				H,
				V
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
				H,
				V
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
			"bg-position": [{ bg: te() }],
			"bg-repeat": [{ bg: ne() }],
			"bg-size": [{ bg: re() }],
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
						we,
						H,
						V
					],
					radial: [
						"",
						H,
						V
					],
					conic: [
						we,
						H,
						V
					]
				},
				Ge,
				ze
			] }],
			"bg-color": [{ bg: F() }],
			"gradient-from-pos": [{ from: ie() }],
			"gradient-via-pos": [{ via: ie() }],
			"gradient-to-pos": [{ to: ie() }],
			"gradient-from": [{ from: F() }],
			"gradient-via": [{ via: F() }],
			"gradient-to": [{ to: F() }],
			rounded: [{ rounded: I() }],
			"rounded-s": [{ "rounded-s": I() }],
			"rounded-e": [{ "rounded-e": I() }],
			"rounded-t": [{ "rounded-t": I() }],
			"rounded-r": [{ "rounded-r": I() }],
			"rounded-b": [{ "rounded-b": I() }],
			"rounded-l": [{ "rounded-l": I() }],
			"rounded-ss": [{ "rounded-ss": I() }],
			"rounded-se": [{ "rounded-se": I() }],
			"rounded-ee": [{ "rounded-ee": I() }],
			"rounded-es": [{ "rounded-es": I() }],
			"rounded-tl": [{ "rounded-tl": I() }],
			"rounded-tr": [{ "rounded-tr": I() }],
			"rounded-br": [{ "rounded-br": I() }],
			"rounded-bl": [{ "rounded-bl": I() }],
			"border-w": [{ border: L() }],
			"border-w-x": [{ "border-x": L() }],
			"border-w-y": [{ "border-y": L() }],
			"border-w-s": [{ "border-s": L() }],
			"border-w-e": [{ "border-e": L() }],
			"border-w-bs": [{ "border-bs": L() }],
			"border-w-be": [{ "border-be": L() }],
			"border-w-t": [{ "border-t": L() }],
			"border-w-r": [{ "border-r": L() }],
			"border-w-b": [{ "border-b": L() }],
			"border-w-l": [{ "border-l": L() }],
			"divide-x": [{ "divide-x": L() }],
			"divide-x-reverse": ["divide-x-reverse"],
			"divide-y": [{ "divide-y": L() }],
			"divide-y-reverse": ["divide-y-reverse"],
			"border-style": [{ border: [
				...ae(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...ae(),
				"hidden",
				"none"
			] }],
			"border-color": [{ border: F() }],
			"border-color-x": [{ "border-x": F() }],
			"border-color-y": [{ "border-y": F() }],
			"border-color-s": [{ "border-s": F() }],
			"border-color-e": [{ "border-e": F() }],
			"border-color-bs": [{ "border-bs": F() }],
			"border-color-be": [{ "border-be": F() }],
			"border-color-t": [{ "border-t": F() }],
			"border-color-r": [{ "border-r": F() }],
			"border-color-b": [{ "border-b": F() }],
			"border-color-l": [{ "border-l": F() }],
			"divide-color": [{ divide: F() }],
			"outline-style": [{ outline: [
				...ae(),
				"none",
				"hidden"
			] }],
			"outline-offset": [{ "outline-offset": [
				B,
				H,
				V
			] }],
			"outline-w": [{ outline: [
				"",
				B,
				Ve,
				Pe
			] }],
			"outline-color": [{ outline: F() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				Ke,
				Be
			] }],
			"shadow-color": [{ shadow: F() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				Ke,
				Be
			] }],
			"inset-shadow-color": [{ "inset-shadow": F() }],
			"ring-w": [{ ring: L() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: F() }],
			"ring-offset-w": [{ "ring-offset": [B, Pe] }],
			"ring-offset-color": [{ "ring-offset": F() }],
			"inset-ring-w": [{ "inset-ring": L() }],
			"inset-ring-color": [{ "inset-ring": F() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				Ke,
				Be
			] }],
			"text-shadow-color": [{ "text-shadow": F() }],
			opacity: [{ opacity: [
				B,
				H,
				V
			] }],
			"mix-blend": [{ "mix-blend": [
				...oe(),
				"plus-darker",
				"plus-lighter"
			] }],
			"bg-blend": [{ "bg-blend": oe() }],
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
			"mask-image-linear-pos": [{ "mask-linear": [B] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": R() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": R() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": F() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": F() }],
			"mask-image-t-from-pos": [{ "mask-t-from": R() }],
			"mask-image-t-to-pos": [{ "mask-t-to": R() }],
			"mask-image-t-from-color": [{ "mask-t-from": F() }],
			"mask-image-t-to-color": [{ "mask-t-to": F() }],
			"mask-image-r-from-pos": [{ "mask-r-from": R() }],
			"mask-image-r-to-pos": [{ "mask-r-to": R() }],
			"mask-image-r-from-color": [{ "mask-r-from": F() }],
			"mask-image-r-to-color": [{ "mask-r-to": F() }],
			"mask-image-b-from-pos": [{ "mask-b-from": R() }],
			"mask-image-b-to-pos": [{ "mask-b-to": R() }],
			"mask-image-b-from-color": [{ "mask-b-from": F() }],
			"mask-image-b-to-color": [{ "mask-b-to": F() }],
			"mask-image-l-from-pos": [{ "mask-l-from": R() }],
			"mask-image-l-to-pos": [{ "mask-l-to": R() }],
			"mask-image-l-from-color": [{ "mask-l-from": F() }],
			"mask-image-l-to-color": [{ "mask-l-to": F() }],
			"mask-image-x-from-pos": [{ "mask-x-from": R() }],
			"mask-image-x-to-pos": [{ "mask-x-to": R() }],
			"mask-image-x-from-color": [{ "mask-x-from": F() }],
			"mask-image-x-to-color": [{ "mask-x-to": F() }],
			"mask-image-y-from-pos": [{ "mask-y-from": R() }],
			"mask-image-y-to-pos": [{ "mask-y-to": R() }],
			"mask-image-y-from-color": [{ "mask-y-from": F() }],
			"mask-image-y-to-color": [{ "mask-y-to": F() }],
			"mask-image-radial": [{ "mask-radial": [H, V] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": R() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": R() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": F() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": F() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [B] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": R() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": R() }],
			"mask-image-conic-from-color": [{ "mask-conic-from": F() }],
			"mask-image-conic-to-color": [{ "mask-conic-to": F() }],
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
			"mask-position": [{ mask: te() }],
			"mask-repeat": [{ mask: ne() }],
			"mask-size": [{ mask: re() }],
			"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
			"mask-image": [{ mask: [
				"none",
				H,
				V
			] }],
			filter: [{ filter: [
				"",
				"none",
				H,
				V
			] }],
			blur: [{ blur: se() }],
			brightness: [{ brightness: [
				B,
				H,
				V
			] }],
			contrast: [{ contrast: [
				B,
				H,
				V
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				Ke,
				Be
			] }],
			"drop-shadow-color": [{ "drop-shadow": F() }],
			grayscale: [{ grayscale: [
				"",
				B,
				H,
				V
			] }],
			"hue-rotate": [{ "hue-rotate": [
				B,
				H,
				V
			] }],
			invert: [{ invert: [
				"",
				B,
				H,
				V
			] }],
			saturate: [{ saturate: [
				B,
				H,
				V
			] }],
			sepia: [{ sepia: [
				"",
				B,
				H,
				V
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				H,
				V
			] }],
			"backdrop-blur": [{ "backdrop-blur": se() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				B,
				H,
				V
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				B,
				H,
				V
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				B,
				H,
				V
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				B,
				H,
				V
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				B,
				H,
				V
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				B,
				H,
				V
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				B,
				H,
				V
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				B,
				H,
				V
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
				H,
				V
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				B,
				"initial",
				H,
				V
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				H,
				V
			] }],
			delay: [{ delay: [
				B,
				H,
				V
			] }],
			animate: [{ animate: [
				"none",
				v,
				H,
				V
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				H,
				V
			] }],
			"perspective-origin": [{ "perspective-origin": x() }],
			rotate: [{ rotate: ce() }],
			"rotate-x": [{ "rotate-x": ce() }],
			"rotate-y": [{ "rotate-y": ce() }],
			"rotate-z": [{ "rotate-z": ce() }],
			scale: [{ scale: le() }],
			"scale-x": [{ "scale-x": le() }],
			"scale-y": [{ "scale-y": le() }],
			"scale-z": [{ "scale-z": le() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: ue() }],
			"skew-x": [{ "skew-x": ue() }],
			"skew-y": [{ "skew-y": ue() }],
			transform: [{ transform: [
				H,
				V,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: x() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: de() }],
			"translate-x": [{ "translate-x": de() }],
			"translate-y": [{ "translate-y": de() }],
			"translate-z": [{ "translate-z": de() }],
			"translate-none": ["translate-none"],
			accent: [{ accent: F() }],
			appearance: [{ appearance: ["none", "auto"] }],
			"caret-color": [{ caret: F() }],
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
				H,
				V
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
				H,
				V
			] }],
			fill: [{ fill: ["none", ...F()] }],
			"stroke-w": [{ stroke: [
				B,
				Ve,
				Pe,
				Fe
			] }],
			stroke: [{ stroke: ["none", ...F()] }],
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
function U(...e) {
	return it(x(e));
}
//#endregion
//#region src/components/currency/IrtIcon.tsx
function at({ className: e }) {
	return /* @__PURE__ */ _("svg", {
		width: "13",
		height: "12",
		viewBox: "0 0 13 12",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		className: U("inline-block h-[0.85em] w-auto shrink-0 align-[-0.12em]", e),
		"aria-hidden": !0,
		children: [
			/* @__PURE__ */ g("path", {
				d: "M2.32002 6.11782C2.63548 5.96391 2.87208 5.81 3.10867 5.57913C3.2664 5.34826 3.42413 5.11739 3.58186 4.88652C3.66073 4.57869 3.73959 4.27087 3.73959 3.96304H11.2318C11.705 3.96304 12.0993 3.80913 12.4147 3.57826C12.6513 3.27043 12.8091 2.88565 12.8091 2.34696V0.5H11.7838V2.27C11.7838 2.65478 11.5472 2.88565 11.1529 2.88565H3.73959V2.50087C3.73959 2.11609 3.66073 1.88522 3.58186 1.57739C3.58186 1.34652 3.42413 1.11565 3.2664 0.961739C3.10867 0.807826 2.95094 0.730869 2.79321 0.653913C2.55662 0.576956 2.32002 0.5 2.16229 0.5C1.84683 0.5 1.61024 0.576956 1.37364 0.653913C1.21591 0.807826 0.979316 0.884782 0.900451 1.11565C0.742721 1.26956 0.584991 1.42348 0.584991 1.65435C0.506126 1.88522 0.427261 2.11609 0.427261 2.34696C0.427261 2.57782 0.427261 2.80869 0.506126 3.03956C0.584991 3.27043 0.663856 3.42435 0.742721 3.57826C0.900451 3.65521 1.05818 3.80913 1.29478 3.88608C1.53137 3.96304 1.76797 3.96304 2.16229 3.96304H2.79321C2.79321 4.11695 2.71435 4.27087 2.71435 4.42478C2.63548 4.57869 2.47775 4.7326 2.39889 4.88652C2.32002 4.96347 2.16229 5.04043 1.9257 5.11739C1.76797 5.19434 1.53137 5.2713 1.29478 5.2713H0.269531V6.34869H1.29478C1.6891 6.27173 2.00456 6.19478 2.32002 6.11782ZM2.16229 2.88565C1.84683 2.88565 1.6891 2.88565 1.53137 2.73174C1.45251 2.65478 1.37364 2.50087 1.37364 2.27C1.37364 2.03913 1.45251 1.80826 1.53137 1.7313C1.6891 1.65435 1.84683 1.57739 2.08343 1.57739C2.32002 1.57739 2.47775 1.65435 2.63548 1.80826C2.79321 1.96217 2.79321 2.19304 2.79321 2.50087V2.96261H2.16229V2.88565Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ g("path", {
				d: "M10.4422 0.5H7.44531V1.42348H10.4422V0.5Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ g("path", {
				d: "M12.7298 8.50383C12.6509 8.27296 12.5721 8.11905 12.4143 7.96514C12.2566 7.81122 12.0989 7.65731 11.8623 7.58035C11.7046 7.5034 11.468 7.42644 11.2314 7.42644C10.9948 7.42644 10.7582 7.5034 10.5216 7.58035C10.285 7.65731 10.1273 7.81122 9.96953 7.96514C9.8118 8.11905 9.73293 8.27296 9.65407 8.50383C9.5752 8.7347 9.5752 8.96557 9.5752 9.19644V9.42731C9.5752 9.65818 9.49634 9.73513 9.41747 9.88905C9.25974 9.966 9.10201 10.043 8.86542 10.043H8.54996C8.39223 10.043 8.2345 9.966 8.15563 9.88905C8.07677 9.73513 7.9979 9.58122 7.9979 9.42731V5.7334H6.97266V9.58122C6.97266 9.88905 6.97266 10.1199 7.05152 10.2738C7.13039 10.4277 7.20925 10.5817 7.36698 10.7356C7.52471 10.8125 7.60358 10.9664 7.84017 10.9664C7.9979 11.0434 8.15563 11.0434 8.39223 11.0434H8.94428C9.10201 11.0434 9.33861 10.9664 9.49634 10.8895C9.65407 10.8125 9.89066 10.6586 9.96953 10.4277C10.1273 10.6586 10.285 10.8125 10.5216 10.8895C10.7582 10.9664 10.9948 11.0434 11.3102 11.0434C11.7834 11.0434 12.2566 10.8895 12.4932 10.5817C12.8087 10.2738 12.9664 9.81209 12.9664 9.2734C12.8875 8.96557 12.8087 8.7347 12.7298 8.50383ZM11.2314 9.966C10.9948 9.966 10.837 9.88905 10.7582 9.81209C10.5216 9.65818 10.5216 9.50427 10.5216 9.2734C10.5216 9.04253 10.6004 8.88861 10.6793 8.7347C10.7582 8.58079 10.9948 8.50383 11.2314 8.50383C11.468 8.50383 11.7046 8.58079 11.7834 8.7347C11.8623 8.88861 11.9412 9.04253 11.9412 9.2734C11.8623 9.73513 11.6257 9.966 11.2314 9.966Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ g("path", {
				d: "M4.92256 8.50364C4.92256 8.73451 4.92256 8.88842 4.8437 9.11929C4.76484 9.2732 4.68597 9.42712 4.60711 9.58103C4.44938 9.73494 4.29165 9.8119 4.13392 9.88886C3.97619 9.96581 3.73959 10.0428 3.42413 10.0428H2.71435C2.47775 10.0428 2.24116 10.0428 2.00456 9.96581C1.84683 9.8119 1.6891 9.73494 1.61024 9.58103C1.53137 9.42712 1.37364 9.2732 1.37364 9.11929C1.29478 8.96538 1.29478 8.73451 1.29478 8.50364V7.65712H0.269531V8.5806C0.269531 9.35016 0.506126 9.96581 0.900451 10.4276C1.29478 10.8893 1.84683 11.1202 2.63548 11.1202H3.42413C3.81846 11.1202 4.13392 11.0432 4.44938 10.8893C4.76484 10.7354 5.00143 10.5815 5.23803 10.3506C5.47462 10.1197 5.63235 9.8119 5.71122 9.50407C5.79008 9.19625 5.86894 8.88842 5.86894 8.50364V5.73321L4.8437 5.65625L4.92256 8.50364Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ g("path", {
				d: "M3.73962 7.42578H2.55664V8.50317H3.73962V7.42578Z",
				fill: "currentColor"
			})
		]
	});
}
//#endregion
//#region src/lib/currency.ts
var ot = /تومان|toman|irt/i;
function st(e) {
	return e.replace(/&nbsp;/gi, " ").replace(/&#160;/g, " ").replace(/&#x0*a0;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, "\"").replace(/&#(\d+);/g, (e, t) => {
		let n = Number(t);
		return Number.isFinite(n) ? String.fromCharCode(n) : e;
	}).replace(/\u00a0/g, " ");
}
function ct(e, t) {
	let n = (e ?? "").trim(), r = (t ?? "").trim();
	if (!n && !r) return !1;
	let i = n.toUpperCase();
	return !!(i === "IRT" || i === "TOMAN" || i === "IRHT" || ot.test(n) || ot.test(r));
}
var lt = {
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
function ut(e) {
	return e.toLowerCase().startsWith("fa");
}
function dt(e) {
	return e.replace(/\d/g, (e) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(e, 10)] ?? e);
}
function ft(e) {
	return e.replace(/[۰-۹٠-٩]/g, (e) => lt[e] ?? e);
}
function pt(e, t) {
	return ut(t) ? dt(e) : e;
}
//#endregion
//#region src/lib/formatNumber.ts
function mt(e, t) {
	let n = Number.isFinite(e) ? e : 0, r = ut(t) ? "fa-IR" : "en-US", i = new Intl.NumberFormat(r, { maximumFractionDigits: 2 }).format(n);
	return ut(t) ? dt(i) : i;
}
//#endregion
//#region src/components/currency/MoneyDisplay.tsx
var ht = /تومان|toman|irt/gi;
function gt(e) {
	if (typeof e == "number") return Number.isFinite(e) ? e : 0;
	let t = ft(st(e)).replace(ht, "").replace(/[^\d.-]/g, ""), n = parseFloat(t);
	return Number.isFinite(n) ? n : NaN;
}
function _t({ amount: e, currency: t, currencySymbol: n, locale: r, className: i, amountClassName: a, prefix: o }) {
	let s = gt(e), c = Number.isFinite(s) ? mt(s, r) : pt(ft(st(String(e))).replace(ht, "").trim(), r), l = ct(t, n) || !t?.trim() && !n?.trim();
	return /* @__PURE__ */ _("span", {
		className: U("inline-flex items-baseline gap-1", i),
		dir: "ltr",
		children: [
			o,
			l ? /* @__PURE__ */ g(at, {}) : null,
			/* @__PURE__ */ g("span", {
				className: a,
				children: c
			}),
			!l && t ? /* @__PURE__ */ g("span", {
				className: "text-muted-foreground text-[0.85em]",
				children: t
			}) : null
		]
	});
}
//#endregion
//#region src/components/PageShell.tsx
function vt({ title: e, description: t, eyebrow: n, children: r }) {
	return /* @__PURE__ */ _("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ _("header", {
			className: "min-w-0 space-y-1.5",
			children: [
				n ? /* @__PURE__ */ g("p", {
					className: "text-muted-foreground text-xs font-medium tracking-wide uppercase",
					children: n
				}) : null,
				/* @__PURE__ */ g("h1", {
					className: "text-xl font-semibold tracking-tight sm:text-2xl",
					children: e
				}),
				t ? /* @__PURE__ */ g("p", {
					className: "text-muted-foreground max-w-2xl text-sm leading-relaxed",
					children: t
				}) : null
			]
		}), r]
	});
}
//#endregion
//#region node_modules/class-variance-authority/dist/index.mjs
var yt = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, bt = x, xt = (e, t) => (n) => {
	if (t?.variants == null) return bt(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = yt(t) || yt(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return bt(e, a, t?.compoundVariants?.reduce((e, t) => {
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
function St(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function Ct(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = St(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : St(e[t], null);
			}
		};
	};
}
function W(...e) {
	return r.useCallback(Ct(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function wt(e) {
	let t = /* @__PURE__ */ Tt(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Dt);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ g(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ g(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function Tt(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = kt(n), a = Ot(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? Ct(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Et = Symbol("radix.slottable");
function Dt(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Et;
}
function Ot(e, t) {
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
function kt(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/dist/index.mjs
var G = [
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
	let n = /* @__PURE__ */ wt(`Primitive.${t}`), i = r.forwardRef((e, r) => {
		let { asChild: i, ...a } = e, o = i ? n : t;
		return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ g(o, {
			...a,
			ref: r
		});
	});
	return i.displayName = `Primitive.${t}`, {
		...e,
		[t]: i
	};
}, {});
function At(e, t) {
	e && v.flushSync(() => e.dispatchEvent(t));
}
//#endregion
//#region node_modules/@radix-ui/react-visually-hidden/dist/index.mjs
var jt = Object.freeze({
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
}), Mt = "VisuallyHidden", Nt = r.forwardRef((e, t) => /* @__PURE__ */ g(G.span, {
	...e,
	ref: t,
	style: {
		...jt,
		...e.style
	}
}));
Nt.displayName = Mt;
//#endregion
//#region node_modules/@radix-ui/react-context/dist/index.mjs
function Pt(e, t = []) {
	let n = [];
	function i(t, i) {
		let a = r.createContext(i), o = n.length;
		n = [...n, i];
		let s = (t) => {
			let { scope: n, children: i, ...s } = t, c = n?.[e]?.[o] || a, l = r.useMemo(() => s, Object.values(s));
			return /* @__PURE__ */ g(c.Provider, {
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
	return a.scopeName = e, [i, Ft(a, ...t)];
}
function Ft(...e) {
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
function It(e) {
	let t = /* @__PURE__ */ Lt(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(zt);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ g(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ g(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function Lt(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Vt(n), a = Bt(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? Ct(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Rt = Symbol("radix.slottable");
function zt(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Rt;
}
function Bt(e, t) {
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
function Vt(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function Ht(e) {
	let t = e + "CollectionProvider", [n, r] = Pt(t), [a, o] = n(t, {
		collectionRef: { current: null },
		itemMap: /* @__PURE__ */ new Map()
	}), s = (e) => {
		let { scope: t, children: n } = e, r = i.useRef(null), o = i.useRef(/* @__PURE__ */ new Map()).current;
		return /* @__PURE__ */ g(a, {
			scope: t,
			itemMap: o,
			collectionRef: r,
			children: n
		});
	};
	s.displayName = t;
	let c = e + "CollectionSlot", l = /* @__PURE__ */ It(c), u = i.forwardRef((e, t) => {
		let { scope: n, children: r } = e;
		return /* @__PURE__ */ g(l, {
			ref: W(t, o(c, n).collectionRef),
			children: r
		});
	});
	u.displayName = c;
	let d = e + "CollectionItemSlot", f = "data-radix-collection-item", p = /* @__PURE__ */ It(d), m = i.forwardRef((e, t) => {
		let { scope: n, children: r, ...a } = e, s = i.useRef(null), c = W(t, s), l = o(d, n);
		return i.useEffect(() => (l.itemMap.set(s, {
			ref: s,
			...a
		}), () => void l.itemMap.delete(s))), /* @__PURE__ */ g(p, {
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
function K(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var q = globalThis?.document ? r.useLayoutEffect : () => {}, Ut = r.useInsertionEffect || q;
function Wt({ prop: e, defaultProp: t, onChange: n = () => {}, caller: i }) {
	let [a, o, s] = Gt({
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
			let n = Kt(t) ? t(e) : t;
			n !== e && s.current?.(n);
		} else o(t);
	}, [
		c,
		e,
		o,
		s
	])];
}
function Gt({ defaultProp: e, onChange: t }) {
	let [n, i] = r.useState(e), a = r.useRef(n), o = r.useRef(t);
	return Ut(() => {
		o.current = t;
	}, [t]), r.useEffect(() => {
		a.current !== n && (o.current?.(n), a.current = n);
	}, [n, a]), [
		n,
		i,
		o
	];
}
function Kt(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/@radix-ui/react-id/dist/index.mjs
var qt = r.useId || (() => void 0), Jt = 0;
function Yt(e) {
	let [t, n] = r.useState(qt());
	return q(() => {
		e || n((e) => e ?? String(Jt++));
	}, [e]), e || (t ? `radix-${t}` : "");
}
//#endregion
//#region node_modules/@radix-ui/react-direction/dist/index.mjs
var Xt = r.createContext(void 0);
function Zt(e) {
	let t = r.useContext(Xt);
	return e || t || "ltr";
}
//#endregion
//#region node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
function Qt(e) {
	let t = r.useRef(e);
	return r.useEffect(() => {
		t.current = e;
	}), r.useMemo(() => (...e) => t.current?.(...e), []);
}
//#endregion
//#region node_modules/@radix-ui/react-use-escape-keydown/dist/index.mjs
function $t(e, t = globalThis?.document) {
	let n = Qt(e);
	r.useEffect(() => {
		let e = (e) => {
			e.key === "Escape" && n(e);
		};
		return t.addEventListener("keydown", e, { capture: !0 }), () => t.removeEventListener("keydown", e, { capture: !0 });
	}, [n, t]);
}
//#endregion
//#region node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var en = "DismissableLayer", tn = "dismissableLayer.update", nn = "dismissableLayer.pointerDownOutside", rn = "dismissableLayer.focusOutside", an, on = r.createContext({
	layers: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), sn = r.forwardRef((e, t) => {
	let { disableOutsidePointerEvents: n = !1, onEscapeKeyDown: i, onPointerDownOutside: a, onFocusOutside: o, onInteractOutside: s, onDismiss: c, ...l } = e, u = r.useContext(on), [d, f] = r.useState(null), p = d?.ownerDocument ?? globalThis?.document, [, m] = r.useState({}), h = W(t, (e) => f(e)), _ = Array.from(u.layers), [v] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1), y = _.indexOf(v), b = d ? _.indexOf(d) : -1, x = u.layersWithOutsidePointerEventsDisabled.size > 0, S = b >= y, C = un((e) => {
		let t = e.target, n = [...u.branches].some((e) => e.contains(t));
		!S || n || (a?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p), w = dn((e) => {
		let t = e.target;
		[...u.branches].some((e) => e.contains(t)) || (o?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p);
	return $t((e) => {
		b === u.layers.size - 1 && (i?.(e), !e.defaultPrevented && c && (e.preventDefault(), c()));
	}, p), r.useEffect(() => {
		if (d) return n && (u.layersWithOutsidePointerEventsDisabled.size === 0 && (an = p.body.style.pointerEvents, p.body.style.pointerEvents = "none"), u.layersWithOutsidePointerEventsDisabled.add(d)), u.layers.add(d), fn(), () => {
			n && u.layersWithOutsidePointerEventsDisabled.size === 1 && (p.body.style.pointerEvents = an);
		};
	}, [
		d,
		p,
		n,
		u
	]), r.useEffect(() => () => {
		d && (u.layers.delete(d), u.layersWithOutsidePointerEventsDisabled.delete(d), fn());
	}, [d, u]), r.useEffect(() => {
		let e = () => m({});
		return document.addEventListener(tn, e), () => document.removeEventListener(tn, e);
	}, []), /* @__PURE__ */ g(G.div, {
		...l,
		ref: h,
		style: {
			pointerEvents: x ? S ? "auto" : "none" : void 0,
			...e.style
		},
		onFocusCapture: K(e.onFocusCapture, w.onFocusCapture),
		onBlurCapture: K(e.onBlurCapture, w.onBlurCapture),
		onPointerDownCapture: K(e.onPointerDownCapture, C.onPointerDownCapture)
	});
});
sn.displayName = en;
var cn = "DismissableLayerBranch", ln = r.forwardRef((e, t) => {
	let n = r.useContext(on), i = r.useRef(null), a = W(t, i);
	return r.useEffect(() => {
		let e = i.current;
		if (e) return n.branches.add(e), () => {
			n.branches.delete(e);
		};
	}, [n.branches]), /* @__PURE__ */ g(G.div, {
		...e,
		ref: a
	});
});
ln.displayName = cn;
function un(e, t = globalThis?.document) {
	let n = Qt(e), i = r.useRef(!1), a = r.useRef(() => {});
	return r.useEffect(() => {
		let e = (e) => {
			if (e.target && !i.current) {
				let r = function() {
					pn(nn, n, i, { discrete: !0 });
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
function dn(e, t = globalThis?.document) {
	let n = Qt(e), i = r.useRef(!1);
	return r.useEffect(() => {
		let e = (e) => {
			e.target && !i.current && pn(rn, n, { originalEvent: e }, { discrete: !1 });
		};
		return t.addEventListener("focusin", e), () => t.removeEventListener("focusin", e);
	}, [t, n]), {
		onFocusCapture: () => i.current = !0,
		onBlurCapture: () => i.current = !1
	};
}
function fn() {
	let e = new CustomEvent(tn);
	document.dispatchEvent(e);
}
function pn(e, t, n, { discrete: r }) {
	let i = n.originalEvent.target, a = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && i.addEventListener(e, t, { once: !0 }), r ? At(i, a) : i.dispatchEvent(a);
}
//#endregion
//#region node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var mn = "focusScope.autoFocusOnMount", hn = "focusScope.autoFocusOnUnmount", gn = {
	bubbles: !1,
	cancelable: !0
}, _n = "FocusScope", vn = r.forwardRef((e, t) => {
	let { loop: n = !1, trapped: i = !1, onMountAutoFocus: a, onUnmountAutoFocus: o, ...s } = e, [c, l] = r.useState(null), u = Qt(a), d = Qt(o), f = r.useRef(null), p = W(t, (e) => l(e)), m = r.useRef({
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
				c.contains(t) ? f.current = t : Tn(f.current, { select: !0 });
			}, t = function(e) {
				if (m.paused || !c) return;
				let t = e.relatedTarget;
				t !== null && (c.contains(t) || Tn(f.current, { select: !0 }));
			}, n = function(e) {
				if (document.activeElement === document.body) for (let t of e) t.removedNodes.length > 0 && Tn(c);
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
			En.add(m);
			let e = document.activeElement;
			if (!c.contains(e)) {
				let t = new CustomEvent(mn, gn);
				c.addEventListener(mn, u), c.dispatchEvent(t), t.defaultPrevented || (yn(kn(xn(c)), { select: !0 }), document.activeElement === e && Tn(c));
			}
			return () => {
				c.removeEventListener(mn, u), setTimeout(() => {
					let t = new CustomEvent(hn, gn);
					c.addEventListener(hn, d), c.dispatchEvent(t), t.defaultPrevented || Tn(e ?? document.body, { select: !0 }), c.removeEventListener(hn, d), En.remove(m);
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
			let t = e.currentTarget, [i, a] = bn(t);
			i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n && Tn(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n && Tn(a, { select: !0 })) : r === t && e.preventDefault();
		}
	}, [
		n,
		i,
		m.paused
	]);
	return /* @__PURE__ */ g(G.div, {
		tabIndex: -1,
		...s,
		ref: p,
		onKeyDown: h
	});
});
vn.displayName = _n;
function yn(e, { select: t = !1 } = {}) {
	let n = document.activeElement;
	for (let r of e) if (Tn(r, { select: t }), document.activeElement !== n) return;
}
function bn(e) {
	let t = xn(e);
	return [Sn(t, e), Sn(t.reverse(), e)];
}
function xn(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t;
}
function Sn(e, t) {
	for (let n of e) if (!Cn(n, { upTo: t })) return n;
}
function Cn(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function wn(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function Tn(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = document.activeElement;
		e.focus({ preventScroll: !0 }), e !== n && wn(e) && t && e.select();
	}
}
var En = Dn();
function Dn() {
	let e = [];
	return {
		add(t) {
			let n = e[0];
			t !== n && n?.pause(), e = On(e, t), e.unshift(t);
		},
		remove(t) {
			e = On(e, t), e[0]?.resume();
		}
	};
}
function On(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
function kn(e) {
	return e.filter((e) => e.tagName !== "A");
}
//#endregion
//#region node_modules/@radix-ui/react-portal/dist/index.mjs
var An = "Portal", jn = r.forwardRef((e, t) => {
	let { container: n, ...i } = e, [a, o] = r.useState(!1);
	q(() => o(!0), []);
	let s = n || a && globalThis?.document?.body;
	return s ? y.createPortal(/* @__PURE__ */ g(G.div, {
		...i,
		ref: t
	}), s) : null;
});
jn.displayName = An;
//#endregion
//#region node_modules/@radix-ui/react-focus-guards/dist/index.mjs
var Mn = 0;
function Nn() {
	r.useEffect(() => {
		let e = document.querySelectorAll("[data-radix-focus-guard]");
		return document.body.insertAdjacentElement("afterbegin", e[0] ?? Pn()), document.body.insertAdjacentElement("beforeend", e[1] ?? Pn()), Mn++, () => {
			Mn === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((e) => e.remove()), Mn--;
		};
	}, []);
}
function Pn() {
	let e = document.createElement("span");
	return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
//#endregion
//#region node_modules/tslib/tslib.es6.mjs
var Fn = function() {
	return Fn = Object.assign || function(e) {
		for (var t, n = 1, r = arguments.length; n < r; n++) for (var i in t = arguments[n], t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
		return e;
	}, Fn.apply(this, arguments);
};
function In(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
function Ln(e, t, n) {
	if (n || arguments.length === 2) for (var r = 0, i = t.length, a; r < i; r++) (a || !(r in t)) && (a || (a = Array.prototype.slice.call(t, 0, r)), a[r] = t[r]);
	return e.concat(a || Array.prototype.slice.call(t));
}
//#endregion
//#region node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var Rn = "right-scroll-bar-position", zn = "width-before-scroll-bar", Bn = "with-scroll-bars-hidden", Vn = "--removed-body-scroll-bar-size";
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/assignRef.js
function Hn(e, t) {
	return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/useRef.js
function Un(e, t) {
	var n = d(function() {
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
var Wn = typeof window < "u" ? r.useLayoutEffect : r.useEffect, Gn = /* @__PURE__ */ new WeakMap();
function Kn(e, t) {
	var n = Un(t || null, function(t) {
		return e.forEach(function(e) {
			return Hn(e, t);
		});
	});
	return Wn(function() {
		var t = Gn.get(n);
		if (t) {
			var r = new Set(t), i = new Set(e), a = n.current;
			r.forEach(function(e) {
				i.has(e) || Hn(e, null);
			}), i.forEach(function(e) {
				r.has(e) || Hn(e, a);
			});
		}
		Gn.set(n, e);
	}, [e]), n;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/medium.js
function qn(e) {
	return e;
}
function Jn(e, t) {
	t === void 0 && (t = qn);
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
function Yn(e) {
	e === void 0 && (e = {});
	var t = Jn(null);
	return t.options = Fn({
		async: !0,
		ssr: !1
	}, e), t;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/exports.js
var Xn = function(e) {
	var t = e.sideCar, n = In(e, ["sideCar"]);
	if (!t) throw Error("Sidecar: please provide `sideCar` property to import the right car");
	var i = t.read();
	if (!i) throw Error("Sidecar medium not found");
	return r.createElement(i, Fn({}, n));
};
Xn.isSideCarExport = !0;
function Zn(e, t) {
	return e.useMedium(t), Xn;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/medium.js
var Qn = Yn(), $n = function() {}, er = r.forwardRef(function(e, t) {
	var n = r.useRef(null), i = r.useState({
		onScrollCapture: $n,
		onWheelCapture: $n,
		onTouchMoveCapture: $n
	}), a = i[0], o = i[1], s = e.forwardProps, c = e.children, l = e.className, u = e.removeScrollBar, d = e.enabled, f = e.shards, p = e.sideCar, m = e.noRelative, h = e.noIsolation, g = e.inert, _ = e.allowPinchZoom, v = e.as, y = v === void 0 ? "div" : v, b = e.gapMode, x = In(e, [
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
	]), S = p, C = Kn([n, t]), w = Fn(Fn({}, x), a);
	return r.createElement(r.Fragment, null, d && r.createElement(S, {
		sideCar: Qn,
		removeScrollBar: u,
		shards: f,
		noRelative: m,
		noIsolation: h,
		inert: g,
		setCallbacks: o,
		allowPinchZoom: !!_,
		lockRef: n,
		gapMode: b
	}), s ? r.cloneElement(r.Children.only(c), Fn(Fn({}, w), { ref: C })) : r.createElement(y, Fn({}, w, {
		className: l,
		ref: C
	}), c));
});
er.defaultProps = {
	enabled: !0,
	removeScrollBar: !0,
	inert: !1
}, er.classNames = {
	fullWidth: zn,
	zeroRight: Rn
};
//#endregion
//#region node_modules/get-nonce/dist/es2015/index.js
var tr, nr = function() {
	if (tr) return tr;
	if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
//#endregion
//#region node_modules/react-style-singleton/dist/es2015/singleton.js
function rr() {
	if (!document) return null;
	var e = document.createElement("style");
	e.type = "text/css";
	var t = nr();
	return t && e.setAttribute("nonce", t), e;
}
function ir(e, t) {
	e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function ar(e) {
	(document.head || document.getElementsByTagName("head")[0]).appendChild(e);
}
var or = function() {
	var e = 0, t = null;
	return {
		add: function(n) {
			e == 0 && (t = rr()) && (ir(t, n), ar(t)), e++;
		},
		remove: function() {
			e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
		}
	};
}, sr = function() {
	var e = or();
	return function(t, n) {
		r.useEffect(function() {
			return e.add(t), function() {
				e.remove();
			};
		}, [t && n]);
	};
}, cr = function() {
	var e = sr();
	return function(t) {
		var n = t.styles, r = t.dynamic;
		return e(n, r), null;
	};
}, lr = {
	left: 0,
	top: 0,
	right: 0,
	gap: 0
}, ur = function(e) {
	return parseInt(e || "", 10) || 0;
}, dr = function(e) {
	var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
	return [
		ur(n),
		ur(r),
		ur(i)
	];
}, fr = function(e) {
	if (e === void 0 && (e = "margin"), typeof window > "u") return lr;
	var t = dr(e), n = document.documentElement.clientWidth, r = window.innerWidth;
	return {
		left: t[0],
		top: t[1],
		right: t[2],
		gap: Math.max(0, r - n + t[2] - t[0])
	};
}, pr = cr(), mr = "data-scroll-locked", hr = function(e, t, n, r) {
	var i = e.left, a = e.top, o = e.right, s = e.gap;
	return n === void 0 && (n = "margin"), `
  .${Bn} {
   overflow: hidden ${r};
   padding-right: ${s}px ${r};
  }
  body[${mr}] {
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
  
  .${Rn} {
    right: ${s}px ${r};
  }
  
  .${zn} {
    margin-right: ${s}px ${r};
  }
  
  .${Rn} .${Rn} {
    right: 0 ${r};
  }
  
  .${zn} .${zn} {
    margin-right: 0 ${r};
  }
  
  body[${mr}] {
    ${Vn}: ${s}px;
  }
`;
}, gr = function() {
	var e = parseInt(document.body.getAttribute("data-scroll-locked") || "0", 10);
	return isFinite(e) ? e : 0;
}, _r = function() {
	r.useEffect(function() {
		return document.body.setAttribute(mr, (gr() + 1).toString()), function() {
			var e = gr() - 1;
			e <= 0 ? document.body.removeAttribute(mr) : document.body.setAttribute(mr, e.toString());
		};
	}, []);
}, vr = function(e) {
	var t = e.noRelative, n = e.noImportant, i = e.gapMode, a = i === void 0 ? "margin" : i;
	_r();
	var o = r.useMemo(function() {
		return fr(a);
	}, [a]);
	return r.createElement(pr, { styles: hr(o, !t, a, n ? "" : "!important") });
}, yr = !1;
if (typeof window < "u") try {
	var br = Object.defineProperty({}, "passive", { get: function() {
		return yr = !0, !0;
	} });
	window.addEventListener("test", br, br), window.removeEventListener("test", br, br);
} catch {
	yr = !1;
}
var xr = yr ? { passive: !1 } : !1, Sr = function(e) {
	return e.tagName === "TEXTAREA";
}, Cr = function(e, t) {
	if (!(e instanceof Element)) return !1;
	var n = window.getComputedStyle(e);
	return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !Sr(e) && n[t] === "visible");
}, wr = function(e) {
	return Cr(e, "overflowY");
}, Tr = function(e) {
	return Cr(e, "overflowX");
}, Er = function(e, t) {
	var n = t.ownerDocument, r = t;
	do {
		if (typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host), kr(e, r)) {
			var i = Ar(e, r);
			if (i[1] > i[2]) return !0;
		}
		r = r.parentNode;
	} while (r && r !== n.body);
	return !1;
}, Dr = function(e) {
	return [
		e.scrollTop,
		e.scrollHeight,
		e.clientHeight
	];
}, Or = function(e) {
	return [
		e.scrollLeft,
		e.scrollWidth,
		e.clientWidth
	];
}, kr = function(e, t) {
	return e === "v" ? wr(t) : Tr(t);
}, Ar = function(e, t) {
	return e === "v" ? Dr(t) : Or(t);
}, jr = function(e, t) {
	return e === "h" && t === "rtl" ? -1 : 1;
}, Mr = function(e, t, n, r, i) {
	var a = jr(e, window.getComputedStyle(t).direction), o = a * r, s = n.target, c = t.contains(s), l = !1, u = o > 0, d = 0, f = 0;
	do {
		if (!s) break;
		var p = Ar(e, s), m = p[0], h = p[1] - p[2] - a * m;
		(m || h) && kr(e, s) && (d += h, f += m);
		var g = s.parentNode;
		s = g && g.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? g.host : g;
	} while (!c && s !== document.body || c && (t.contains(s) || t === s));
	return (u && (i && Math.abs(d) < 1 || !i && o > d) || !u && (i && Math.abs(f) < 1 || !i && -o > f)) && (l = !0), l;
}, Nr = function(e) {
	return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, Pr = function(e) {
	return [e.deltaX, e.deltaY];
}, Fr = function(e) {
	return e && "current" in e ? e.current : e;
}, Ir = function(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}, Lr = function(e) {
	return `
  .block-interactivity-${e} {pointer-events: none;}
  .allow-interactivity-${e} {pointer-events: all;}
`;
}, Rr = 0, zr = [];
function Br(e) {
	var t = r.useRef([]), n = r.useRef([0, 0]), i = r.useRef(), a = r.useState(Rr++)[0], o = r.useState(cr)[0], s = r.useRef(e);
	r.useEffect(function() {
		s.current = e;
	}, [e]), r.useEffect(function() {
		if (e.inert) {
			document.body.classList.add(`block-interactivity-${a}`);
			var t = Ln([e.lockRef.current], (e.shards || []).map(Fr), !0).filter(Boolean);
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
		var r = Nr(e), a = n.current, o = "deltaX" in e ? e.deltaX : a[0] - r[0], c = "deltaY" in e ? e.deltaY : a[1] - r[1], l, u = e.target, d = Math.abs(o) > Math.abs(c) ? "h" : "v";
		if ("touches" in e && d === "h" && u.type === "range") return !1;
		var f = window.getSelection(), p = f && f.anchorNode;
		if (p && (p === u || p.contains(u))) return !1;
		var m = Er(d, u);
		if (!m) return !0;
		if (m ? l = d : (l = d === "v" ? "h" : "v", m = Er(d, u)), !m) return !1;
		if (!i.current && "changedTouches" in e && (o || c) && (i.current = l), !l) return !0;
		var h = i.current || l;
		return Mr(h, t, e, h === "h" ? o : c, !0);
	}, []), l = r.useCallback(function(e) {
		var n = e;
		if (!(!zr.length || zr[zr.length - 1] !== o)) {
			var r = "deltaY" in n ? Pr(n) : Nr(n), i = t.current.filter(function(e) {
				return e.name === n.type && (e.target === n.target || n.target === e.shadowParent) && Ir(e.delta, r);
			})[0];
			if (i && i.should) {
				n.cancelable && n.preventDefault();
				return;
			}
			if (!i) {
				var a = (s.current.shards || []).map(Fr).filter(Boolean).filter(function(e) {
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
			shadowParent: Vr(r)
		};
		t.current.push(a), setTimeout(function() {
			t.current = t.current.filter(function(e) {
				return e !== a;
			});
		}, 1);
	}, []), d = r.useCallback(function(e) {
		n.current = Nr(e), i.current = void 0;
	}, []), f = r.useCallback(function(t) {
		u(t.type, Pr(t), t.target, c(t, e.lockRef.current));
	}, []), p = r.useCallback(function(t) {
		u(t.type, Nr(t), t.target, c(t, e.lockRef.current));
	}, []);
	r.useEffect(function() {
		return zr.push(o), e.setCallbacks({
			onScrollCapture: f,
			onWheelCapture: f,
			onTouchMoveCapture: p
		}), document.addEventListener("wheel", l, xr), document.addEventListener("touchmove", l, xr), document.addEventListener("touchstart", d, xr), function() {
			zr = zr.filter(function(e) {
				return e !== o;
			}), document.removeEventListener("wheel", l, xr), document.removeEventListener("touchmove", l, xr), document.removeEventListener("touchstart", d, xr);
		};
	}, []);
	var m = e.removeScrollBar, h = e.inert;
	return r.createElement(r.Fragment, null, h ? r.createElement(o, { styles: Lr(a) }) : null, m ? r.createElement(vr, {
		noRelative: e.noRelative,
		gapMode: e.gapMode
	}) : null);
}
function Vr(e) {
	for (var t = null; e !== null;) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
	return t;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/sidecar.js
var Hr = Zn(Qn, Br), Ur = r.forwardRef(function(e, t) {
	return r.createElement(er, Fn({}, e, {
		ref: t,
		sideCar: Hr
	}));
});
Ur.classNames = er.classNames;
//#endregion
//#region src/lib/remove-scroll-gate.tsx
var Wr = r.createContext(!1);
function Gr({ allowBodyScroll: e, children: t }) {
	return /* @__PURE__ */ g(Wr.Provider, {
		value: e,
		children: t
	});
}
function Kr() {
	return r.useContext(Wr);
}
//#endregion
//#region src/lib/react-remove-scroll-shim.tsx
var qr = r.forwardRef(function(e, t) {
	let n = Kr() ? !1 : e.enabled !== !1;
	return /* @__PURE__ */ g(Ur, {
		...e,
		ref: t,
		enabled: n
	});
});
qr.classNames = Ur.classNames;
//#endregion
//#region node_modules/aria-hidden/dist/es2015/index.js
var Jr = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, Yr = /* @__PURE__ */ new WeakMap(), Xr = /* @__PURE__ */ new WeakMap(), Zr = {}, Qr = 0, $r = function(e) {
	return e && (e.host || $r(e.parentNode));
}, ei = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = $r(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, ti = function(e, t, n, r) {
	var i = ei(t, Array.isArray(e) ? e : [e]);
	Zr[n] || (Zr[n] = /* @__PURE__ */ new WeakMap());
	var a = Zr[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		!e || s.has(e) || (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		!e || c.has(e) || Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (Yr.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				Yr.set(e, c), a.set(e, l), o.push(e), c === 1 && i && Xr.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), Qr++, function() {
		o.forEach(function(e) {
			var t = Yr.get(e) - 1, i = a.get(e) - 1;
			Yr.set(e, t), a.set(e, i), t || (Xr.has(e) || e.removeAttribute(r), Xr.delete(e)), i || e.removeAttribute(n);
		}), Qr--, Qr || (Yr = /* @__PURE__ */ new WeakMap(), Yr = /* @__PURE__ */ new WeakMap(), Xr = /* @__PURE__ */ new WeakMap(), Zr = {});
	};
}, ni = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || Jr(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), ti(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function ri(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function ii(e) {
	let [t, n] = r.useState(void 0);
	return q(() => {
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
//#region node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var ai = [
	"top",
	"right",
	"bottom",
	"left"
], oi = Math.min, J = Math.max, si = Math.round, ci = Math.floor, li = (e) => ({
	x: e,
	y: e
}), ui = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function di(e, t, n) {
	return J(e, oi(t, n));
}
function fi(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function pi(e) {
	return e.split("-")[0];
}
function mi(e) {
	return e.split("-")[1];
}
function hi(e) {
	return e === "x" ? "y" : "x";
}
function gi(e) {
	return e === "y" ? "height" : "width";
}
function _i(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function vi(e) {
	return hi(_i(e));
}
function yi(e, t, n) {
	n === void 0 && (n = !1);
	let r = mi(e), i = vi(e), a = gi(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = Oi(o)), [o, Oi(o)];
}
function bi(e) {
	let t = Oi(e);
	return [
		xi(e),
		t,
		xi(t)
	];
}
function xi(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var Si = ["left", "right"], Ci = ["right", "left"], wi = ["top", "bottom"], Ti = ["bottom", "top"];
function Ei(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? Ci : Si : t ? Si : Ci;
		case "left":
		case "right": return t ? wi : Ti;
		default: return [];
	}
}
function Di(e, t, n, r) {
	let i = mi(e), a = Ei(pi(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(xi)))), a;
}
function Oi(e) {
	let t = pi(e);
	return ui[t] + e.slice(t.length);
}
function ki(e) {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...e
	};
}
function Ai(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : ki(e);
}
function ji(e) {
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
function Mi(e, t, n) {
	let { reference: r, floating: i } = e, a = _i(t), o = vi(t), s = gi(o), c = pi(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	switch (mi(t)) {
		case "start":
			p[o] -= f * (n && l ? -1 : 1);
			break;
		case "end":
			p[o] += f * (n && l ? -1 : 1);
			break;
	}
	return p;
}
async function Ni(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = fi(t, e), p = Ai(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = ji(await i.getClippingRect({
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
	}, y = ji(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var Pi = 50, Fi = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: Ni
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = Mi(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < Pi && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = Mi(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, Ii = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = fi(e, t) || {};
		if (l == null) return {};
		let d = Ai(u), f = {
			x: n,
			y: r
		}, p = vi(i), m = gi(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = oi(d[_], T), ee = oi(d[v], T), D = E, O = C - h[m] - ee, k = C / 2 - h[m] / 2 + w, A = di(D, k, O), j = !c.arrow && mi(i) != null && k !== A && a.reference[m] / 2 - (k < D ? E : ee) - h[m] / 2 < 0, M = j ? k < D ? k - D : k - O : 0;
		return {
			[p]: f[p] + M,
			data: {
				[p]: A,
				centerOffset: k - A - M,
				...j && { alignmentOffset: M }
			},
			reset: j
		};
	}
}), Li = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = fi(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = pi(r), _ = _i(o), v = pi(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [Oi(o)] : bi(o)), x = p !== "none";
			!d && x && b.push(...Di(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = yi(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (!(u === "alignment" && _ !== _i(t)) || T.every((e) => _i(e.placement) === _ ? e.overflows[0] > 0 : !0))) return {
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
								let t = _i(e.placement);
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
function Ri(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function zi(e) {
	return ai.some((t) => e[t] >= 0);
}
var Bi = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = fi(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = Ri(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: zi(e)
					} };
				}
				case "escaped": {
					let e = Ri(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: zi(e)
					} };
				}
				default: return {};
			}
		}
	};
}, Vi = /* @__PURE__ */ new Set(["left", "top"]);
async function Hi(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = pi(n), s = mi(n), c = _i(n) === "y", l = Vi.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = fi(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var Ui = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await Hi(t, e);
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
}, Wi = function(e) {
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
			} }, ...l } = fi(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = _i(pi(i)), p = hi(f), m = u[p], h = u[f];
			if (o) {
				let e = p === "y" ? "top" : "left", t = p === "y" ? "bottom" : "right", n = m + d[e], r = m - d[t];
				m = di(n, m, r);
			}
			if (s) {
				let e = f === "y" ? "top" : "left", t = f === "y" ? "bottom" : "right", n = h + d[e], r = h - d[t];
				h = di(n, h, r);
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
}, Gi = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = fi(e, t), u = {
				x: n,
				y: r
			}, d = _i(i), f = hi(d), p = u[f], m = u[d], h = fi(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = Vi.has(pi(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, Ki = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			var n, r;
			let { placement: i, rects: a, platform: o, elements: s } = t, { apply: c = () => {}, ...l } = fi(e, t), u = await o.detectOverflow(t, l), d = pi(i), f = mi(i), p = _i(i) === "y", { width: m, height: h } = a.floating, g, _;
			d === "top" || d === "bottom" ? (g = d, _ = f === (await (o.isRTL == null ? void 0 : o.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (_ = d, g = f === "end" ? "top" : "bottom");
			let v = h - u.top - u.bottom, y = m - u.left - u.right, b = oi(h - u[g], v), x = oi(m - u[_], y), S = !t.middlewareData.shift, C = b, w = x;
			if ((n = t.middlewareData.shift) != null && n.enabled.x && (w = y), (r = t.middlewareData.shift) != null && r.enabled.y && (C = v), S && !f) {
				let e = J(u.left, 0), t = J(u.right, 0), n = J(u.top, 0), r = J(u.bottom, 0);
				p ? w = m - 2 * (e !== 0 || t !== 0 ? e + t : J(u.left, u.right)) : C = h - 2 * (n !== 0 || r !== 0 ? n + r : J(u.top, u.bottom));
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
function qi() {
	return typeof window < "u";
}
function Ji(e) {
	return Xi(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Y(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Yi(e) {
	return ((Xi(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function Xi(e) {
	return qi() ? e instanceof Node || e instanceof Y(e).Node : !1;
}
function X(e) {
	return qi() ? e instanceof Element || e instanceof Y(e).Element : !1;
}
function Zi(e) {
	return qi() ? e instanceof HTMLElement || e instanceof Y(e).HTMLElement : !1;
}
function Qi(e) {
	return !qi() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Y(e).ShadowRoot;
}
function $i(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = Z(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function ea(e) {
	return /^(table|td|th)$/.test(Ji(e));
}
function ta(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var na = /transform|translate|scale|rotate|perspective|filter/, ra = /paint|layout|strict|content/, ia = (e) => !!e && e !== "none", aa;
function oa(e) {
	let t = X(e) ? Z(e) : e;
	return ia(t.transform) || ia(t.translate) || ia(t.scale) || ia(t.rotate) || ia(t.perspective) || !ca() && (ia(t.backdropFilter) || ia(t.filter)) || na.test(t.willChange || "") || ra.test(t.contain || "");
}
function sa(e) {
	let t = da(e);
	for (; Zi(t) && !la(t);) {
		if (oa(t)) return t;
		if (ta(t)) return null;
		t = da(t);
	}
	return null;
}
function ca() {
	return aa ?? (aa = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), aa;
}
function la(e) {
	return /^(html|body|#document)$/.test(Ji(e));
}
function Z(e) {
	return Y(e).getComputedStyle(e);
}
function ua(e) {
	return X(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function da(e) {
	if (Ji(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Qi(e) && e.host || Yi(e);
	return Qi(t) ? t.host : t;
}
function fa(e) {
	let t = da(e);
	return la(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : Zi(t) && $i(t) ? t : fa(t);
}
function pa(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = fa(e), i = r === e.ownerDocument?.body, a = Y(r);
	if (i) {
		let e = ma(a);
		return t.concat(a, a.visualViewport || [], $i(r) ? r : [], e && n ? pa(e) : []);
	} else return t.concat(r, pa(r, [], n));
}
function ma(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function ha(e) {
	let t = Z(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = Zi(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = si(n) !== a || si(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function ga(e) {
	return X(e) ? e : e.contextElement;
}
function _a(e) {
	let t = ga(e);
	if (!Zi(t)) return li(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = ha(t), o = (a ? si(n.width) : n.width) / r, s = (a ? si(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var va = /* @__PURE__ */ li(0);
function ya(e) {
	let t = Y(e);
	return !ca() || !t.visualViewport ? va : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function ba(e, t, n) {
	return t === void 0 && (t = !1), !n || t && n !== Y(e) ? !1 : t;
}
function xa(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = ga(e), o = li(1);
	t && (r ? X(r) && (o = _a(r)) : o = _a(e));
	let s = ba(a, n, r) ? ya(a) : li(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a) {
		let e = Y(a), t = r && X(r) ? Y(r) : r, n = e, i = ma(n);
		for (; i && r && t !== n;) {
			let e = _a(i), t = i.getBoundingClientRect(), r = Z(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = Y(i), i = ma(n);
		}
	}
	return ji({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function Sa(e, t) {
	let n = ua(e).scrollLeft;
	return t ? t.left + n : xa(Yi(e)).left + n;
}
function Ca(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - Sa(e, n),
		y: n.top + t.scrollTop
	};
}
function wa(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = Yi(r), s = t ? ta(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = li(1), u = li(0), d = Zi(r);
	if ((d || !d && !a) && ((Ji(r) !== "body" || $i(o)) && (c = ua(r)), d)) {
		let e = xa(r);
		l = _a(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? Ca(o, c) : li(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function Ta(e) {
	return Array.from(e.getClientRects());
}
function Ea(e) {
	let t = Yi(e), n = ua(e), r = e.ownerDocument.body, i = J(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), a = J(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight), o = -n.scrollLeft + Sa(e), s = -n.scrollTop;
	return Z(r).direction === "rtl" && (o += J(t.clientWidth, r.clientWidth) - i), {
		width: i,
		height: a,
		x: o,
		y: s
	};
}
var Da = 25;
function Oa(e, t) {
	let n = Y(e), r = Yi(e), i = n.visualViewport, a = r.clientWidth, o = r.clientHeight, s = 0, c = 0;
	if (i) {
		a = i.width, o = i.height;
		let e = ca();
		(!e || e && t === "fixed") && (s = i.offsetLeft, c = i.offsetTop);
	}
	let l = Sa(r);
	if (l <= 0) {
		let e = r.ownerDocument, t = e.body, n = getComputedStyle(t), i = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, o = Math.abs(r.clientWidth - t.clientWidth - i);
		o <= Da && (a -= o);
	} else l <= Da && (a += l);
	return {
		width: a,
		height: o,
		x: s,
		y: c
	};
}
function ka(e, t) {
	let n = xa(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = Zi(e) ? _a(e) : li(1);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function Aa(e, t, n) {
	let r;
	if (t === "viewport") r = Oa(e, n);
	else if (t === "document") r = Ea(Yi(e));
	else if (X(t)) r = ka(t, n);
	else {
		let n = ya(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return ji(r);
}
function ja(e, t) {
	let n = da(e);
	return n === t || !X(n) || la(n) ? !1 : Z(n).position === "fixed" || ja(n, t);
}
function Ma(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = pa(e, [], !1).filter((e) => X(e) && Ji(e) !== "body"), i = null, a = Z(e).position === "fixed", o = a ? da(e) : e;
	for (; X(o) && !la(o);) {
		let t = Z(o), n = oa(o);
		!n && t.position === "fixed" && (i = null), (a ? !n && !i : !n && t.position === "static" && i && (i.position === "absolute" || i.position === "fixed") || $i(o) && !n && ja(e, o)) ? r = r.filter((e) => e !== o) : i = t, o = da(o);
	}
	return t.set(e, r), r;
}
function Na(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? ta(t) ? [] : Ma(t, this._c) : [].concat(n), r], o = Aa(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = Aa(t, a[e], i);
		s = J(n.top, s), c = oi(n.right, c), l = oi(n.bottom, l), u = J(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function Pa(e) {
	let { width: t, height: n } = ha(e);
	return {
		width: t,
		height: n
	};
}
function Fa(e, t, n) {
	let r = Zi(t), i = Yi(t), a = n === "fixed", o = xa(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = li(0);
	function l() {
		c.x = Sa(i);
	}
	if (r || !r && !a) if ((Ji(t) !== "body" || $i(i)) && (s = ua(t)), r) {
		let e = xa(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	} else i && l();
	a && !r && i && l();
	let u = i && !r && !a ? Ca(i, s) : li(0);
	return {
		x: o.left + s.scrollLeft - c.x - u.x,
		y: o.top + s.scrollTop - c.y - u.y,
		width: o.width,
		height: o.height
	};
}
function Ia(e) {
	return Z(e).position === "static";
}
function La(e, t) {
	if (!Zi(e) || Z(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Yi(e) === n && (n = n.ownerDocument.body), n;
}
function Ra(e, t) {
	let n = Y(e);
	if (ta(e)) return n;
	if (!Zi(e)) {
		let t = da(e);
		for (; t && !la(t);) {
			if (X(t) && !Ia(t)) return t;
			t = da(t);
		}
		return n;
	}
	let r = La(e, t);
	for (; r && ea(r) && Ia(r);) r = La(r, t);
	return r && la(r) && Ia(r) && !oa(r) ? n : r || sa(e) || n;
}
var za = async function(e) {
	let t = this.getOffsetParent || Ra, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: Fa(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function Ba(e) {
	return Z(e).direction === "rtl";
}
var Va = {
	convertOffsetParentRelativeRectToViewportRelativeRect: wa,
	getDocumentElement: Yi,
	getClippingRect: Na,
	getOffsetParent: Ra,
	getElementRects: za,
	getClientRects: Ta,
	getDimensions: Pa,
	getScale: _a,
	isElement: X,
	isRTL: Ba
};
function Ha(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function Ua(e, t) {
	let n = null, r, i = Yi(e);
	function a() {
		var e;
		clearTimeout(r), (e = n) == null || e.disconnect(), n = null;
	}
	function o(s, c) {
		s === void 0 && (s = !1), c === void 0 && (c = 1), a();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (s || t(), !f || !p) return;
		let m = ci(d), h = ci(i.clientWidth - (u + f)), g = ci(i.clientHeight - (d + p)), _ = ci(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: J(0, oi(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (n !== c) {
				if (!y) return o();
				n ? o(!1, n) : r = setTimeout(() => {
					o(!1, 1e-7);
				}, 1e3);
			}
			n === 1 && !Ha(l, e.getBoundingClientRect()) && o(), y = !1;
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
function Wa(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = ga(e), u = i || a ? [...l ? pa(l) : [], ...t ? pa(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n, { passive: !0 }), a && e.addEventListener("resize", n);
	});
	let d = l && s ? Ua(l, n) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? xa(e) : null;
	c && g();
	function g() {
		let t = xa(e);
		h && !Ha(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var Ga = Ui, Ka = Wi, qa = Li, Ja = Ki, Ya = Bi, Xa = Ii, Za = Gi, Qa = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = {
		platform: Va,
		...n
	}, a = {
		...i.platform,
		_c: r
	};
	return Fi(e, t, {
		...i,
		platform: a
	});
}, $a = typeof document < "u" ? u : function() {};
function eo(e, t) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (typeof e == "function" && e.toString() === t.toString()) return !0;
	let n, r, i;
	if (e && t && typeof e == "object") {
		if (Array.isArray(e)) {
			if (n = e.length, n !== t.length) return !1;
			for (r = n; r-- !== 0;) if (!eo(e[r], t[r])) return !1;
			return !0;
		}
		if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length) return !1;
		for (r = n; r-- !== 0;) if (!{}.hasOwnProperty.call(t, i[r])) return !1;
		for (r = n; r-- !== 0;) {
			let n = i[r];
			if (!(n === "_owner" && e.$$typeof) && !eo(e[n], t[n])) return !1;
		}
		return !0;
	}
	return e !== e && t !== t;
}
function to(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function no(e, t) {
	let n = to(e);
	return Math.round(t * n) / n;
}
function ro(e) {
	let t = r.useRef(e);
	return $a(() => {
		t.current = e;
	}), t;
}
function io(e) {
	e === void 0 && (e = {});
	let { placement: t = "bottom", strategy: n = "absolute", middleware: i = [], platform: a, elements: { reference: o, floating: s } = {}, transform: c = !0, whileElementsMounted: l, open: u } = e, [d, f] = r.useState({
		x: 0,
		y: 0,
		strategy: n,
		placement: t,
		middlewareData: {},
		isPositioned: !1
	}), [p, m] = r.useState(i);
	eo(p, i) || m(i);
	let [h, g] = r.useState(null), [_, y] = r.useState(null), b = r.useCallback((e) => {
		e !== w.current && (w.current = e, g(e));
	}, []), x = r.useCallback((e) => {
		e !== T.current && (T.current = e, y(e));
	}, []), S = o || h, C = s || _, w = r.useRef(null), T = r.useRef(null), E = r.useRef(d), ee = l != null, D = ro(l), O = ro(a), k = ro(u), A = r.useCallback(() => {
		if (!w.current || !T.current) return;
		let e = {
			placement: t,
			strategy: n,
			middleware: p
		};
		O.current && (e.platform = O.current), Qa(w.current, T.current, e).then((e) => {
			let t = {
				...e,
				isPositioned: k.current !== !1
			};
			j.current && !eo(E.current, t) && (E.current = t, v.flushSync(() => {
				f(t);
			}));
		});
	}, [
		p,
		t,
		n,
		O,
		k
	]);
	$a(() => {
		u === !1 && E.current.isPositioned && (E.current.isPositioned = !1, f((e) => ({
			...e,
			isPositioned: !1
		})));
	}, [u]);
	let j = r.useRef(!1);
	$a(() => (j.current = !0, () => {
		j.current = !1;
	}), []), $a(() => {
		if (S && (w.current = S), C && (T.current = C), S && C) {
			if (D.current) return D.current(S, C, A);
			A();
		}
	}, [
		S,
		C,
		A,
		D,
		ee
	]);
	let M = r.useMemo(() => ({
		reference: w,
		floating: T,
		setReference: b,
		setFloating: x
	}), [b, x]), N = r.useMemo(() => ({
		reference: S,
		floating: C
	}), [S, C]), P = r.useMemo(() => {
		let e = {
			position: n,
			left: 0,
			top: 0
		};
		if (!N.floating) return e;
		let t = no(N.floating, d.x), r = no(N.floating, d.y);
		return c ? {
			...e,
			transform: "translate(" + t + "px, " + r + "px)",
			...to(N.floating) >= 1.5 && { willChange: "transform" }
		} : {
			position: n,
			left: t,
			top: r
		};
	}, [
		n,
		c,
		N.floating,
		d.x,
		d.y
	]);
	return r.useMemo(() => ({
		...d,
		update: A,
		refs: M,
		elements: N,
		floatingStyles: P
	}), [
		d,
		A,
		M,
		N,
		P
	]);
}
var ao = (e) => {
	function t(e) {
		return {}.hasOwnProperty.call(e, "current");
	}
	return {
		name: "arrow",
		options: e,
		fn(n) {
			let { element: r, padding: i } = typeof e == "function" ? e(n) : e;
			return r && t(r) ? r.current == null ? {} : Xa({
				element: r.current,
				padding: i
			}).fn(n) : r ? Xa({
				element: r,
				padding: i
			}).fn(n) : {};
		}
	};
}, oo = (e, t) => {
	let n = Ga(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, so = (e, t) => {
	let n = Ka(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, co = (e, t) => ({
	fn: Za(e).fn,
	options: [e, t]
}), lo = (e, t) => {
	let n = qa(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, uo = (e, t) => {
	let n = Ja(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, fo = (e, t) => {
	let n = Ya(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, po = (e, t) => {
	let n = ao(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, mo = "Arrow", ho = r.forwardRef((e, t) => {
	let { children: n, width: r = 10, height: i = 5, ...a } = e;
	return /* @__PURE__ */ g(G.svg, {
		...a,
		ref: t,
		width: r,
		height: i,
		viewBox: "0 0 30 10",
		preserveAspectRatio: "none",
		children: e.asChild ? n : /* @__PURE__ */ g("polygon", { points: "0,0 30,0 15,10" })
	});
});
ho.displayName = mo;
var go = ho, _o = "Popper", [vo, yo] = Pt(_o), [bo, xo] = vo(_o), So = (e) => {
	let { __scopePopper: t, children: n } = e, [i, a] = r.useState(null);
	return /* @__PURE__ */ g(bo, {
		scope: t,
		anchor: i,
		onAnchorChange: a,
		children: n
	});
};
So.displayName = _o;
var Co = "PopperAnchor", wo = r.forwardRef((e, t) => {
	let { __scopePopper: n, virtualRef: i, ...a } = e, o = xo(Co, n), s = r.useRef(null), c = W(t, s), l = r.useRef(null);
	return r.useEffect(() => {
		let e = l.current;
		l.current = i?.current || s.current, e !== l.current && o.onAnchorChange(l.current);
	}), i ? null : /* @__PURE__ */ g(G.div, {
		...a,
		ref: c
	});
});
wo.displayName = Co;
var To = "PopperContent", [Eo, Do] = vo(To), Oo = r.forwardRef((e, t) => {
	let { __scopePopper: n, side: i = "bottom", sideOffset: a = 0, align: o = "center", alignOffset: s = 0, arrowPadding: c = 0, avoidCollisions: l = !0, collisionBoundary: u = [], collisionPadding: d = 0, sticky: f = "partial", hideWhenDetached: p = !1, updatePositionStrategy: m = "optimized", onPlaced: h, ..._ } = e, v = xo(To, n), [y, b] = r.useState(null), x = W(t, (e) => b(e)), [S, C] = r.useState(null), w = ii(S), T = w?.width ?? 0, E = w?.height ?? 0, ee = i + (o === "center" ? "" : "-" + o), D = typeof d == "number" ? d : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...d
	}, O = Array.isArray(u) ? u : [u], k = O.length > 0, A = {
		padding: D,
		boundary: O.filter(Mo),
		altBoundary: k
	}, { refs: j, floatingStyles: M, placement: N, isPositioned: P, middlewareData: F } = io({
		strategy: "fixed",
		placement: ee,
		whileElementsMounted: (...e) => Wa(...e, { animationFrame: m === "always" }),
		elements: { reference: v.anchor },
		middleware: [
			oo({
				mainAxis: a + E,
				alignmentAxis: s
			}),
			l && so({
				mainAxis: !0,
				crossAxis: !1,
				limiter: f === "partial" ? co() : void 0,
				...A
			}),
			l && lo({ ...A }),
			uo({
				...A,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--radix-popper-available-width", `${n}px`), o.setProperty("--radix-popper-available-height", `${r}px`), o.setProperty("--radix-popper-anchor-width", `${i}px`), o.setProperty("--radix-popper-anchor-height", `${a}px`);
				}
			}),
			S && po({
				element: S,
				padding: c
			}),
			No({
				arrowWidth: T,
				arrowHeight: E
			}),
			p && fo({
				strategy: "referenceHidden",
				...A
			})
		]
	}), [te, ne] = Po(N), re = Qt(h);
	q(() => {
		P && re?.();
	}, [P, re]);
	let ie = F.arrow?.x, I = F.arrow?.y, L = F.arrow?.centerOffset !== 0, [ae, oe] = r.useState();
	return q(() => {
		y && oe(window.getComputedStyle(y).zIndex);
	}, [y]), /* @__PURE__ */ g("div", {
		ref: j.setFloating,
		"data-radix-popper-content-wrapper": "",
		style: {
			...M,
			transform: P ? M.transform : "translate(0, -200%)",
			minWidth: "max-content",
			zIndex: ae,
			"--radix-popper-transform-origin": [F.transformOrigin?.x, F.transformOrigin?.y].join(" "),
			...F.hide?.referenceHidden && {
				visibility: "hidden",
				pointerEvents: "none"
			}
		},
		dir: e.dir,
		children: /* @__PURE__ */ g(Eo, {
			scope: n,
			placedSide: te,
			onArrowChange: C,
			arrowX: ie,
			arrowY: I,
			shouldHideArrow: L,
			children: /* @__PURE__ */ g(G.div, {
				"data-side": te,
				"data-align": ne,
				..._,
				ref: x,
				style: {
					..._.style,
					animation: P ? void 0 : "none"
				}
			})
		})
	});
});
Oo.displayName = To;
var ko = "PopperArrow", Ao = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
}, jo = r.forwardRef(function(e, t) {
	let { __scopePopper: n, ...r } = e, i = Do(ko, n), a = Ao[i.placedSide];
	return /* @__PURE__ */ g("span", {
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
		children: /* @__PURE__ */ g(go, {
			...r,
			ref: t,
			style: {
				...r.style,
				display: "block"
			}
		})
	});
});
jo.displayName = ko;
function Mo(e) {
	return e !== null;
}
var No = (e) => ({
	name: "transformOrigin",
	options: e,
	fn(t) {
		let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = Po(n), u = {
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
function Po(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
var Fo = So, Io = wo, Lo = Oo, Ro = jo, zo = "Label", Bo = r.forwardRef((e, t) => /* @__PURE__ */ g(G.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
Bo.displayName = zo;
var Vo = Bo;
//#endregion
//#region node_modules/@radix-ui/number/dist/index.mjs
function Ho(e, [t, n]) {
	return Math.min(n, Math.max(t, e));
}
//#endregion
//#region node_modules/@radix-ui/react-select/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function Uo(e) {
	let t = /* @__PURE__ */ Wo(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Ko);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ g(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ g(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function Wo(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Jo(n), a = qo(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? Ct(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Go = Symbol("radix.slottable");
function Ko(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Go;
}
function qo(e, t) {
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
function Jo(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-select/dist/index.mjs
var Yo = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], Xo = [" ", "Enter"], Zo = "Select", [Qo, $o, es] = Ht(Zo), [ts, ns] = Pt(Zo, [es, yo]), rs = yo(), [is, as] = ts(Zo), [os, ss] = ts(Zo), cs = (e) => {
	let { __scopeSelect: t, children: n, open: i, defaultOpen: a, onOpenChange: o, value: s, defaultValue: c, onValueChange: l, dir: u, name: d, autoComplete: f, disabled: p, required: m, form: h } = e, v = rs(t), [y, b] = r.useState(null), [x, S] = r.useState(null), [C, w] = r.useState(!1), T = Zt(u), [E, ee] = Wt({
		prop: i,
		defaultProp: a ?? !1,
		onChange: o,
		caller: Zo
	}), [D, O] = Wt({
		prop: s,
		defaultProp: c,
		onChange: l,
		caller: Zo
	}), k = r.useRef(null), A = y ? h || !!y.closest("form") : !0, [j, M] = r.useState(/* @__PURE__ */ new Set()), N = Array.from(j).map((e) => e.props.value).join(";");
	return /* @__PURE__ */ g(Fo, {
		...v,
		children: /* @__PURE__ */ _(is, {
			required: m,
			scope: t,
			trigger: y,
			onTriggerChange: b,
			valueNode: x,
			onValueNodeChange: S,
			valueNodeHasChildren: C,
			onValueNodeHasChildrenChange: w,
			contentId: Yt(),
			value: D,
			onValueChange: O,
			open: E,
			onOpenChange: ee,
			dir: T,
			triggerPointerDownPosRef: k,
			disabled: p,
			children: [/* @__PURE__ */ g(Qo.Provider, {
				scope: t,
				children: /* @__PURE__ */ g(os, {
					scope: e.__scopeSelect,
					onNativeOptionAdd: r.useCallback((e) => {
						M((t) => new Set(t).add(e));
					}, []),
					onNativeOptionRemove: r.useCallback((e) => {
						M((t) => {
							let n = new Set(t);
							return n.delete(e), n;
						});
					}, []),
					children: n
				})
			}), A ? /* @__PURE__ */ _(nc, {
				"aria-hidden": !0,
				required: m,
				tabIndex: -1,
				name: d,
				autoComplete: f,
				value: D,
				onChange: (e) => O(e.target.value),
				disabled: p,
				form: h,
				children: [D === void 0 ? /* @__PURE__ */ g("option", { value: "" }) : null, Array.from(j)]
			}, N) : null]
		})
	});
};
cs.displayName = Zo;
var ls = "SelectTrigger", us = r.forwardRef((e, t) => {
	let { __scopeSelect: n, disabled: i = !1, ...a } = e, o = rs(n), s = as(ls, n), c = s.disabled || i, l = W(t, s.onTriggerChange), u = $o(n), d = r.useRef("touch"), [f, p, m] = ic((e) => {
		let t = u().filter((e) => !e.disabled), n = ac(t, e, t.find((e) => e.value === s.value));
		n !== void 0 && s.onValueChange(n.value);
	}), h = (e) => {
		c || (s.onOpenChange(!0), m()), e && (s.triggerPointerDownPosRef.current = {
			x: Math.round(e.pageX),
			y: Math.round(e.pageY)
		});
	};
	return /* @__PURE__ */ g(Io, {
		asChild: !0,
		...o,
		children: /* @__PURE__ */ g(G.button, {
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
			"data-placeholder": rc(s.value) ? "" : void 0,
			...a,
			ref: l,
			onClick: K(a.onClick, (e) => {
				e.currentTarget.focus(), d.current !== "mouse" && h(e);
			}),
			onPointerDown: K(a.onPointerDown, (e) => {
				d.current = e.pointerType;
				let t = e.target;
				t.hasPointerCapture(e.pointerId) && t.releasePointerCapture(e.pointerId), e.button === 0 && e.ctrlKey === !1 && e.pointerType === "mouse" && (h(e), e.preventDefault());
			}),
			onKeyDown: K(a.onKeyDown, (e) => {
				let t = f.current !== "";
				!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && p(e.key), !(t && e.key === " ") && Yo.includes(e.key) && (h(), e.preventDefault());
			})
		})
	});
});
us.displayName = ls;
var ds = "SelectValue", fs = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: r, style: i, children: a, placeholder: o = "", ...s } = e, c = as(ds, n), { onValueNodeHasChildrenChange: l } = c, u = a !== void 0, d = W(t, c.onValueNodeChange);
	return q(() => {
		l(u);
	}, [l, u]), /* @__PURE__ */ g(G.span, {
		...s,
		ref: d,
		style: { pointerEvents: "none" },
		children: rc(c.value) ? /* @__PURE__ */ g(h, { children: o }) : a
	});
});
fs.displayName = ds;
var ps = "SelectIcon", ms = r.forwardRef((e, t) => {
	let { __scopeSelect: n, children: r, ...i } = e;
	return /* @__PURE__ */ g(G.span, {
		"aria-hidden": !0,
		...i,
		ref: t,
		children: r || "▼"
	});
});
ms.displayName = ps;
var hs = "SelectPortal", gs = (e) => /* @__PURE__ */ g(jn, {
	asChild: !0,
	...e
});
gs.displayName = hs;
var _s = "SelectContent", vs = r.forwardRef((e, t) => {
	let n = as(_s, e.__scopeSelect), [i, a] = r.useState();
	if (q(() => {
		a(new DocumentFragment());
	}, []), !n.open) {
		let t = i;
		return t ? v.createPortal(/* @__PURE__ */ g(ys, {
			scope: e.__scopeSelect,
			children: /* @__PURE__ */ g(Qo.Slot, {
				scope: e.__scopeSelect,
				children: /* @__PURE__ */ g("div", { children: e.children })
			})
		}), t) : null;
	}
	return /* @__PURE__ */ g(Cs, {
		...e,
		ref: t
	});
});
vs.displayName = _s;
var Q = 10, [ys, bs] = ts(_s), xs = "SelectContentImpl", Ss = /* @__PURE__ */ Uo("SelectContent.RemoveScroll"), Cs = r.forwardRef((e, t) => {
	let { __scopeSelect: n, position: i = "item-aligned", onCloseAutoFocus: a, onEscapeKeyDown: o, onPointerDownOutside: s, side: c, sideOffset: l, align: u, alignOffset: d, arrowPadding: f, collisionBoundary: p, collisionPadding: m, sticky: h, hideWhenDetached: _, avoidCollisions: v, ...y } = e, b = as(_s, n), [x, S] = r.useState(null), [C, w] = r.useState(null), T = W(t, (e) => S(e)), [E, ee] = r.useState(null), [D, O] = r.useState(null), k = $o(n), [A, j] = r.useState(!1), M = r.useRef(!1);
	r.useEffect(() => {
		if (x) return ni(x);
	}, [x]), Nn();
	let N = r.useCallback((e) => {
		let [t, ...n] = k().map((e) => e.ref.current), [r] = n.slice(-1), i = document.activeElement;
		for (let n of e) if (n === i || (n?.scrollIntoView({ block: "nearest" }), n === t && C && (C.scrollTop = 0), n === r && C && (C.scrollTop = C.scrollHeight), n?.focus(), document.activeElement !== i)) return;
	}, [k, C]), P = r.useCallback(() => N([E, x]), [
		N,
		E,
		x
	]);
	r.useEffect(() => {
		A && P();
	}, [A, P]);
	let { onOpenChange: F, triggerPointerDownPosRef: te } = b;
	r.useEffect(() => {
		if (x) {
			let e = {
				x: 0,
				y: 0
			}, t = (t) => {
				e = {
					x: Math.abs(Math.round(t.pageX) - (te.current?.x ?? 0)),
					y: Math.abs(Math.round(t.pageY) - (te.current?.y ?? 0))
				};
			}, n = (n) => {
				e.x <= 10 && e.y <= 10 ? n.preventDefault() : x.contains(n.target) || F(!1), document.removeEventListener("pointermove", t), te.current = null;
			};
			return te.current !== null && (document.addEventListener("pointermove", t), document.addEventListener("pointerup", n, {
				capture: !0,
				once: !0
			})), () => {
				document.removeEventListener("pointermove", t), document.removeEventListener("pointerup", n, { capture: !0 });
			};
		}
	}, [
		x,
		F,
		te
	]), r.useEffect(() => {
		let e = () => F(!1);
		return window.addEventListener("blur", e), window.addEventListener("resize", e), () => {
			window.removeEventListener("blur", e), window.removeEventListener("resize", e);
		};
	}, [F]);
	let [ne, re] = ic((e) => {
		let t = k().filter((e) => !e.disabled), n = ac(t, e, t.find((e) => e.ref.current === document.activeElement));
		n && setTimeout(() => n.ref.current.focus());
	}), ie = r.useCallback((e, t, n) => {
		let r = !M.current && !n;
		(b.value !== void 0 && b.value === t || r) && (ee(e), r && (M.current = !0));
	}, [b.value]), I = r.useCallback(() => x?.focus(), [x]), L = r.useCallback((e, t, n) => {
		let r = !M.current && !n;
		(b.value !== void 0 && b.value === t || r) && O(e);
	}, [b.value]), ae = i === "popper" ? Ds : Ts, oe = ae === Ds ? {
		side: c,
		sideOffset: l,
		align: u,
		alignOffset: d,
		arrowPadding: f,
		collisionBoundary: p,
		collisionPadding: m,
		sticky: h,
		hideWhenDetached: _,
		avoidCollisions: v
	} : {};
	return /* @__PURE__ */ g(ys, {
		scope: n,
		content: x,
		viewport: C,
		onViewportChange: w,
		itemRefCallback: ie,
		selectedItem: E,
		onItemLeave: I,
		itemTextRefCallback: L,
		focusSelectedItem: P,
		selectedItemText: D,
		position: i,
		isPositioned: A,
		searchRef: ne,
		children: /* @__PURE__ */ g(qr, {
			as: Ss,
			allowPinchZoom: !0,
			children: /* @__PURE__ */ g(vn, {
				asChild: !0,
				trapped: b.open,
				onMountAutoFocus: (e) => {
					e.preventDefault();
				},
				onUnmountAutoFocus: K(a, (e) => {
					b.trigger?.focus({ preventScroll: !0 }), e.preventDefault();
				}),
				children: /* @__PURE__ */ g(sn, {
					asChild: !0,
					disableOutsidePointerEvents: !0,
					onEscapeKeyDown: o,
					onPointerDownOutside: s,
					onFocusOutside: (e) => e.preventDefault(),
					onDismiss: () => b.onOpenChange(!1),
					children: /* @__PURE__ */ g(ae, {
						role: "listbox",
						id: b.contentId,
						"data-state": b.open ? "open" : "closed",
						dir: b.dir,
						onContextMenu: (e) => e.preventDefault(),
						...y,
						...oe,
						onPlaced: () => j(!0),
						ref: T,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none",
							...y.style
						},
						onKeyDown: K(y.onKeyDown, (e) => {
							let t = e.ctrlKey || e.altKey || e.metaKey;
							if (e.key === "Tab" && e.preventDefault(), !t && e.key.length === 1 && re(e.key), [
								"ArrowUp",
								"ArrowDown",
								"Home",
								"End"
							].includes(e.key)) {
								let t = k().filter((e) => !e.disabled).map((e) => e.ref.current);
								if (["ArrowUp", "End"].includes(e.key) && (t = t.slice().reverse()), ["ArrowUp", "ArrowDown"].includes(e.key)) {
									let n = e.target, r = t.indexOf(n);
									t = t.slice(r + 1);
								}
								setTimeout(() => N(t)), e.preventDefault();
							}
						})
					})
				})
			})
		})
	});
});
Cs.displayName = xs;
var ws = "SelectItemAlignedPosition", Ts = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onPlaced: i, ...a } = e, o = as(_s, n), s = bs(_s, n), [c, l] = r.useState(null), [u, d] = r.useState(null), f = W(t, (e) => d(e)), p = $o(n), m = r.useRef(!1), h = r.useRef(!0), { viewport: _, selectedItem: v, selectedItemText: y, focusSelectedItem: b } = s, x = r.useCallback(() => {
		if (o.trigger && o.valueNode && c && u && _ && v && y) {
			let e = o.trigger.getBoundingClientRect(), t = u.getBoundingClientRect(), n = o.valueNode.getBoundingClientRect(), r = y.getBoundingClientRect();
			if (o.dir !== "rtl") {
				let i = r.left - t.left, a = n.left - i, o = e.left - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - Q, d = Ho(a, [Q, Math.max(Q, u - l)]);
				c.style.minWidth = s + "px", c.style.left = d + "px";
			} else {
				let i = t.right - r.right, a = window.innerWidth - n.right - i, o = window.innerWidth - e.right - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - Q, d = Ho(a, [Q, Math.max(Q, u - l)]);
				c.style.minWidth = s + "px", c.style.right = d + "px";
			}
			let a = p(), s = window.innerHeight - Q * 2, l = _.scrollHeight, d = window.getComputedStyle(u), f = parseInt(d.borderTopWidth, 10), h = parseInt(d.paddingTop, 10), g = parseInt(d.borderBottomWidth, 10), b = parseInt(d.paddingBottom, 10), x = f + h + l + b + g, S = Math.min(v.offsetHeight * 5, x), C = window.getComputedStyle(_), w = parseInt(C.paddingTop, 10), T = parseInt(C.paddingBottom, 10), E = e.top + e.height / 2 - Q, ee = s - E, D = v.offsetHeight / 2, O = v.offsetTop + D, k = f + h + O, A = x - k;
			if (k <= E) {
				let e = a.length > 0 && v === a[a.length - 1].ref.current;
				c.style.bottom = "0px";
				let t = u.clientHeight - _.offsetTop - _.offsetHeight, n = k + Math.max(ee, D + (e ? T : 0) + t + g);
				c.style.height = n + "px";
			} else {
				let e = a.length > 0 && v === a[0].ref.current;
				c.style.top = "0px";
				let t = Math.max(E, f + _.offsetTop + (e ? w : 0) + D) + A;
				c.style.height = t + "px", _.scrollTop = k - E + _.offsetTop;
			}
			c.style.margin = `${Q}px 0`, c.style.minHeight = S + "px", c.style.maxHeight = s + "px", i?.(), requestAnimationFrame(() => m.current = !0);
		}
	}, [
		p,
		o.trigger,
		o.valueNode,
		c,
		u,
		_,
		v,
		y,
		o.dir,
		i
	]);
	q(() => x(), [x]);
	let [S, C] = r.useState();
	return q(() => {
		u && C(window.getComputedStyle(u).zIndex);
	}, [u]), /* @__PURE__ */ g(Os, {
		scope: n,
		contentWrapper: c,
		shouldExpandOnScrollRef: m,
		onScrollButtonChange: r.useCallback((e) => {
			e && h.current === !0 && (x(), b?.(), h.current = !1);
		}, [x, b]),
		children: /* @__PURE__ */ g("div", {
			ref: l,
			style: {
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: S
			},
			children: /* @__PURE__ */ g(G.div, {
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
Ts.displayName = ws;
var Es = "SelectPopperPosition", Ds = r.forwardRef((e, t) => {
	let { __scopeSelect: n, align: r = "start", collisionPadding: i = Q, ...a } = e;
	return /* @__PURE__ */ g(Lo, {
		...rs(n),
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
Ds.displayName = Es;
var [Os, ks] = ts(_s, {}), As = "SelectViewport", js = r.forwardRef((e, t) => {
	let { __scopeSelect: n, nonce: i, ...a } = e, o = bs(As, n), s = ks(As, n), c = W(t, o.onViewportChange), l = r.useRef(0);
	return /* @__PURE__ */ _(h, { children: [/* @__PURE__ */ g("style", {
		dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" },
		nonce: i
	}), /* @__PURE__ */ g(Qo.Slot, {
		scope: n,
		children: /* @__PURE__ */ g(G.div, {
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
			onScroll: K(a.onScroll, (e) => {
				let t = e.currentTarget, { contentWrapper: n, shouldExpandOnScrollRef: r } = s;
				if (r?.current && n) {
					let e = Math.abs(l.current - t.scrollTop);
					if (e > 0) {
						let r = window.innerHeight - Q * 2, i = parseFloat(n.style.minHeight), a = parseFloat(n.style.height), o = Math.max(i, a);
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
js.displayName = As;
var Ms = "SelectGroup", [Ns, Ps] = ts(Ms), Fs = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = Yt();
	return /* @__PURE__ */ g(Ns, {
		scope: n,
		id: i,
		children: /* @__PURE__ */ g(G.div, {
			role: "group",
			"aria-labelledby": i,
			...r,
			ref: t
		})
	});
});
Fs.displayName = Ms;
var Is = "SelectLabel", Ls = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = Ps(Is, n);
	return /* @__PURE__ */ g(G.div, {
		id: i.id,
		...r,
		ref: t
	});
});
Ls.displayName = Is;
var Rs = "SelectItem", [zs, Bs] = ts(Rs), Vs = r.forwardRef((e, t) => {
	let { __scopeSelect: n, value: i, disabled: a = !1, textValue: o, ...s } = e, c = as(Rs, n), l = bs(Rs, n), u = c.value === i, [d, f] = r.useState(o ?? ""), [p, m] = r.useState(!1), h = W(t, (e) => l.itemRefCallback?.(e, i, a)), _ = Yt(), v = r.useRef("touch"), y = () => {
		a || (c.onValueChange(i), c.onOpenChange(!1));
	};
	if (i === "") throw Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
	return /* @__PURE__ */ g(zs, {
		scope: n,
		value: i,
		disabled: a,
		textId: _,
		isSelected: u,
		onItemTextChange: r.useCallback((e) => {
			f((t) => t || (e?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ g(Qo.ItemSlot, {
			scope: n,
			value: i,
			disabled: a,
			textValue: d,
			children: /* @__PURE__ */ g(G.div, {
				role: "option",
				"aria-labelledby": _,
				"data-highlighted": p ? "" : void 0,
				"aria-selected": u && p,
				"data-state": u ? "checked" : "unchecked",
				"aria-disabled": a || void 0,
				"data-disabled": a ? "" : void 0,
				tabIndex: a ? void 0 : -1,
				...s,
				ref: h,
				onFocus: K(s.onFocus, () => m(!0)),
				onBlur: K(s.onBlur, () => m(!1)),
				onClick: K(s.onClick, () => {
					v.current !== "mouse" && y();
				}),
				onPointerUp: K(s.onPointerUp, () => {
					v.current === "mouse" && y();
				}),
				onPointerDown: K(s.onPointerDown, (e) => {
					v.current = e.pointerType;
				}),
				onPointerMove: K(s.onPointerMove, (e) => {
					v.current = e.pointerType, a ? l.onItemLeave?.() : v.current === "mouse" && e.currentTarget.focus({ preventScroll: !0 });
				}),
				onPointerLeave: K(s.onPointerLeave, (e) => {
					e.currentTarget === document.activeElement && l.onItemLeave?.();
				}),
				onKeyDown: K(s.onKeyDown, (e) => {
					l.searchRef?.current !== "" && e.key === " " || (Xo.includes(e.key) && y(), e.key === " " && e.preventDefault());
				})
			})
		})
	});
});
Vs.displayName = Rs;
var Hs = "SelectItemText", Us = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: i, style: a, ...o } = e, s = as(Hs, n), c = bs(Hs, n), l = Bs(Hs, n), u = ss(Hs, n), [d, f] = r.useState(null), p = W(t, (e) => f(e), l.onItemTextChange, (e) => c.itemTextRefCallback?.(e, l.value, l.disabled)), m = d?.textContent, y = r.useMemo(() => /* @__PURE__ */ g("option", {
		value: l.value,
		disabled: l.disabled,
		children: m
	}, l.value), [
		l.disabled,
		l.value,
		m
	]), { onNativeOptionAdd: b, onNativeOptionRemove: x } = u;
	return q(() => (b(y), () => x(y)), [
		b,
		x,
		y
	]), /* @__PURE__ */ _(h, { children: [/* @__PURE__ */ g(G.span, {
		id: l.textId,
		...o,
		ref: p
	}), l.isSelected && s.valueNode && !s.valueNodeHasChildren ? v.createPortal(o.children, s.valueNode) : null] });
});
Us.displayName = Hs;
var Ws = "SelectItemIndicator", Gs = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return Bs(Ws, n).isSelected ? /* @__PURE__ */ g(G.span, {
		"aria-hidden": !0,
		...r,
		ref: t
	}) : null;
});
Gs.displayName = Ws;
var Ks = "SelectScrollUpButton", qs = r.forwardRef((e, t) => {
	let n = bs(Ks, e.__scopeSelect), i = ks(Ks, e.__scopeSelect), [a, o] = r.useState(!1), s = W(t, i.onScrollButtonChange);
	return q(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				o(t.scrollTop > 0);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ g(Xs, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop -= t.offsetHeight);
		}
	}) : null;
});
qs.displayName = Ks;
var Js = "SelectScrollDownButton", Ys = r.forwardRef((e, t) => {
	let n = bs(Js, e.__scopeSelect), i = ks(Js, e.__scopeSelect), [a, o] = r.useState(!1), s = W(t, i.onScrollButtonChange);
	return q(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				let e = t.scrollHeight - t.clientHeight;
				o(Math.ceil(t.scrollTop) < e);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ g(Xs, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop += t.offsetHeight);
		}
	}) : null;
});
Ys.displayName = Js;
var Xs = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onAutoScroll: i, ...a } = e, o = bs("SelectScrollButton", n), s = r.useRef(null), c = $o(n), l = r.useCallback(() => {
		s.current !== null && (window.clearInterval(s.current), s.current = null);
	}, []);
	return r.useEffect(() => () => l(), [l]), q(() => {
		c().find((e) => e.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
	}, [c]), /* @__PURE__ */ g(G.div, {
		"aria-hidden": !0,
		...a,
		ref: t,
		style: {
			flexShrink: 0,
			...a.style
		},
		onPointerDown: K(a.onPointerDown, () => {
			s.current === null && (s.current = window.setInterval(i, 50));
		}),
		onPointerMove: K(a.onPointerMove, () => {
			o.onItemLeave?.(), s.current === null && (s.current = window.setInterval(i, 50));
		}),
		onPointerLeave: K(a.onPointerLeave, () => {
			l();
		})
	});
}), Zs = "SelectSeparator", Qs = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return /* @__PURE__ */ g(G.div, {
		"aria-hidden": !0,
		...r,
		ref: t
	});
});
Qs.displayName = Zs;
var $s = "SelectArrow", ec = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = rs(n), a = as($s, n), o = bs($s, n);
	return a.open && o.position === "popper" ? /* @__PURE__ */ g(Ro, {
		...i,
		...r,
		ref: t
	}) : null;
});
ec.displayName = $s;
var tc = "SelectBubbleInput", nc = r.forwardRef(({ __scopeSelect: e, value: t, ...n }, i) => {
	let a = r.useRef(null), o = W(i, a), s = ri(t);
	return r.useEffect(() => {
		let e = a.current;
		if (!e) return;
		let n = window.HTMLSelectElement.prototype, r = Object.getOwnPropertyDescriptor(n, "value").set;
		if (s !== t && r) {
			let n = new Event("change", { bubbles: !0 });
			r.call(e, t), e.dispatchEvent(n);
		}
	}, [s, t]), /* @__PURE__ */ g(G.select, {
		...n,
		style: {
			...jt,
			...n.style
		},
		ref: o,
		defaultValue: t
	});
});
nc.displayName = tc;
function rc(e) {
	return e === "" || e === void 0;
}
function ic(e) {
	let t = Qt(e), n = r.useRef(""), i = r.useRef(0), a = r.useCallback((e) => {
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
function ac(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = oc(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.textValue.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
function oc(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
var sc = cs, cc = us, lc = fs, uc = ms, dc = gs, fc = vs, pc = js, mc = Vs, hc = Us, gc = Gs, _c = qs, vc = Ys;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function yc(e) {
	let t = /* @__PURE__ */ xc(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Cc);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ g(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ g(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
var bc = /* @__PURE__ */ yc("Slot");
/* @__NO_SIDE_EFFECTS__ */
function xc(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Tc(n), a = wc(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? Ct(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Sc = Symbol("radix.slottable");
function Cc(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Sc;
}
function wc(e, t) {
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
function Tc(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-switch/dist/index.mjs
var Ec = "Switch", [Dc, Oc] = Pt(Ec), [kc, Ac] = Dc(Ec), jc = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, name: i, checked: a, defaultChecked: o, required: s, disabled: c, value: l = "on", onCheckedChange: u, form: d, ...f } = e, [p, m] = r.useState(null), h = W(t, (e) => m(e)), v = r.useRef(!1), y = p ? d || !!p.closest("form") : !0, [b, x] = Wt({
		prop: a,
		defaultProp: o ?? !1,
		onChange: u,
		caller: Ec
	});
	return /* @__PURE__ */ _(kc, {
		scope: n,
		checked: b,
		disabled: c,
		children: [/* @__PURE__ */ g(G.button, {
			type: "button",
			role: "switch",
			"aria-checked": b,
			"aria-required": s,
			"data-state": Ic(b),
			"data-disabled": c ? "" : void 0,
			disabled: c,
			value: l,
			...f,
			ref: h,
			onClick: K(e.onClick, (e) => {
				x((e) => !e), y && (v.current = e.isPropagationStopped(), v.current || e.stopPropagation());
			})
		}), y && /* @__PURE__ */ g(Fc, {
			control: p,
			bubbles: !v.current,
			name: i,
			value: l,
			checked: b,
			required: s,
			disabled: c,
			form: d,
			style: { transform: "translateX(-100%)" }
		})]
	});
});
jc.displayName = Ec;
var Mc = "SwitchThumb", Nc = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, ...r } = e, i = Ac(Mc, n);
	return /* @__PURE__ */ g(G.span, {
		"data-state": Ic(i.checked),
		"data-disabled": i.disabled ? "" : void 0,
		...r,
		ref: t
	});
});
Nc.displayName = Mc;
var Pc = "SwitchBubbleInput", Fc = r.forwardRef(({ __scopeSwitch: e, control: t, checked: n, bubbles: i = !0, ...a }, o) => {
	let s = r.useRef(null), c = W(s, o), l = ri(n), u = ii(t);
	return r.useEffect(() => {
		let e = s.current;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, r = Object.getOwnPropertyDescriptor(t, "checked").set;
		if (l !== n && r) {
			let t = new Event("click", { bubbles: i });
			r.call(e, n), e.dispatchEvent(t);
		}
	}, [
		l,
		n,
		i
	]), /* @__PURE__ */ g("input", {
		type: "checkbox",
		"aria-hidden": !0,
		defaultChecked: n,
		...a,
		tabIndex: -1,
		ref: c,
		style: {
			...a.style,
			...u,
			position: "absolute",
			pointerEvents: "none",
			opacity: 0,
			margin: 0
		}
	});
});
Fc.displayName = Pc;
function Ic(e) {
	return e ? "checked" : "unchecked";
}
var Lc = jc, Rc = Nc, zc = xt("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
function Bc({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ g(r ? bc : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: U(zc({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/components/ui/input.tsx
function Vc({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ g("input", {
		type: t,
		"data-slot": "input",
		className: U("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function Hc({ className: e, ...t }) {
	return /* @__PURE__ */ g(Vo, {
		"data-slot": "label",
		className: U("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var Uc = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), Wc = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Gc = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), Kc = (e) => {
	let t = Gc(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, qc = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, Jc = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, Yc = a({}), Xc = () => c(Yc), Zc = s(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: a, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = Xc() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return o("svg", {
		ref: l,
		...qc,
		width: t ?? u ?? qc.width,
		height: t ?? u ?? qc.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: Uc("lucide", m, i),
		...!a && !Jc(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => o(e, t)), ...Array.isArray(a) ? a : [a]]);
}), Qc = (e, t) => {
	let n = s(({ className: n, ...r }, i) => o(Zc, {
		ref: i,
		iconNode: t,
		className: Uc(`lucide-${Wc(Kc(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = Kc(e), n;
}, $c = Qc("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]), el = Qc("chevron-down", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]), tl = Qc("chevron-up", [["path", {
	d: "m18 15-6-6-6 6",
	key: "153udz"
}]]), nl = Qc("copy", [["rect", {
	width: "14",
	height: "14",
	x: "8",
	y: "8",
	rx: "2",
	ry: "2",
	key: "17jyea"
}], ["path", {
	d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
	key: "zix9uf"
}]]);
//#endregion
//#region src/hooks/use-text-direction.ts
function rl() {
	let { i18n: e } = f();
	return e.dir() === "rtl" ? "rtl" : "ltr";
}
//#endregion
//#region src/components/ui/select.tsx
function il({ ...e }) {
	return /* @__PURE__ */ g(sc, {
		"data-slot": "select",
		...e
	});
}
function al({ ...e }) {
	return /* @__PURE__ */ g(lc, {
		"data-slot": "select-value",
		...e
	});
}
function ol({ className: e, size: t = "default", children: n, ...r }) {
	return /* @__PURE__ */ _(cc, {
		"data-slot": "select-trigger",
		"data-size": t,
		dir: rl(),
		className: U("flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap text-start shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", e),
		...r,
		children: [n, /* @__PURE__ */ g(uc, {
			asChild: !0,
			children: /* @__PURE__ */ g(el, { className: "size-4 opacity-50" })
		})]
	});
}
function sl({ className: e, children: t, position: n = "popper", align: r = "start", ...i }) {
	return /* @__PURE__ */ g(Gr, {
		allowBodyScroll: !0,
		children: /* @__PURE__ */ g(dc, { children: /* @__PURE__ */ _(fc, {
			"data-slot": "select-content",
			dir: rl(),
			className: U("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-start text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", e),
			position: n,
			align: r,
			...i,
			children: [
				/* @__PURE__ */ g(ll, {}),
				/* @__PURE__ */ g(pc, {
					className: U("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
					children: t
				}),
				/* @__PURE__ */ g(ul, {})
			]
		}) })
	});
}
function cl({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ _(mc, {
		"data-slot": "select-item",
		className: U("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pe-8 ps-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", e),
		...n,
		children: [/* @__PURE__ */ g("span", {
			"data-slot": "select-item-indicator",
			className: "absolute end-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ g(gc, { children: /* @__PURE__ */ g($c, { className: "size-4" }) })
		}), /* @__PURE__ */ g(hc, { children: t })]
	});
}
function ll({ className: e, ...t }) {
	return /* @__PURE__ */ g(_c, {
		"data-slot": "select-scroll-up-button",
		className: U("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ g(tl, { className: "size-4" })
	});
}
function ul({ className: e, ...t }) {
	return /* @__PURE__ */ g(vc, {
		"data-slot": "select-scroll-down-button",
		className: U("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ g(el, { className: "size-4" })
	});
}
//#endregion
//#region src/lib/marketplace-api.ts
function dl(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function fl(e) {
	"@babel/helpers - typeof";
	return fl = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, fl(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function pl(e, t) {
	if (fl(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (fl(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function ml(e) {
	var t = pl(e, "string");
	return fl(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function hl(e, t, n) {
	return (t = ml(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/lib/apiError.ts
var $ = class extends Error {
	constructor(e, t) {
		super(e), hl(this, "code", void 0), hl(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, gl = {
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
function _l(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function vl(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function yl(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(dl(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function bl(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return yl(e, n);
	if (t instanceof $ && t.code) {
		let n = gl[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = gl[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return _l(n) ? e("errors.api.requestTimeout") : vl(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function xl(e, t) {
	m.error(bl(e, t));
}
//#endregion
//#region src/lib/queryClient.ts
var Sl = null;
function Cl() {
	return Sl;
}
//#endregion
//#region src/lib/authLost.ts
var wl = ["auth", "session"], Tl = new Set([
	"rest_cookie_invalid_nonce",
	"rest_not_logged_in",
	"invalid_nonce",
	"ajax_referer_failed",
	"-1"
]);
function El(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (t.status === 401) return !0;
	let n = typeof t.code == "string" ? t.code : "";
	if (Tl.has(n)) return !0;
	let r = typeof t.message == "string" ? t.message.toLowerCase() : "";
	return !!(r.includes("cookie nonce is invalid") || r.includes("rest_cookie_invalid_nonce") || t.status === 403 && (n === "-1" || r === "-1" || r.includes("are you sure you want to do this")));
}
function Dl(e) {
	let t = e ?? Cl();
	t && t.setQueryData(wl, { logged_in: !1 });
}
var Ol = new Set([
	"rest_cookie_invalid_nonce",
	"invalid_nonce",
	"ajax_referer_failed",
	"-1"
]);
function kl(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (t.status === 401) return !1;
	let n = typeof t.code == "string" ? t.code : "";
	if (Ol.has(n)) return !0;
	let r = typeof t.message == "string" ? t.message.toLowerCase() : "";
	return r.includes("cookie nonce is invalid") || r.includes("rest_cookie_invalid_nonce") || r === "invalid nonce";
}
function Al(e) {
	kl(e) || El(e) && Dl();
}
//#endregion
//#region src/lib/safeUrl.ts
function jl(e) {
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
function Ml() {
	return window.webinoDashboard;
}
var Nl = 3e4;
function Pl(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function Fl(e) {
	let t = Ml();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (Pl(e) || jl(e)) return e;
	throw new $("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function Il(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function Ll(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "license/remote-check" ? "webino_dashboard_license_remote_check" : t === "license/diagnostics" ? "webino_dashboard_license_diagnostics" : t === "license/remote-activate" ? "webino_dashboard_license_remote_activate" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") || t.startsWith("shop/reports") || t.startsWith("shop/product-categories") || t === "comments" || t.startsWith("comments/") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : /^(payments|torobpay|snapppay|digipay|zarinpal|bale-pay|wallet|c2c)(\/|$)/.test(t) ? "webino_dashboard_payments_rest" : t.startsWith("analytics/") && t !== "analytics/hit" ? "webino_dashboard_analytics_rest" : null;
}
function Rl(e, t) {
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
function zl(e, t) {
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
async function Bl(e, t, n = {}) {
	let r = Ll(e), i = Ml();
	if (!r || !i.ajaxUrl) throw new $("AJAX fallback unavailable", {
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
	let { signal: l, clear: u } = Il({}, t);
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
			let n = zl(t, e.status);
			throw new $(n.message, {
				code: n.code,
				status: e.status
			});
		}
		if (!n.success) {
			let t = new $(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
				code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
				status: e.status
			});
			throw Al(t), t;
		}
		return n.data;
	} catch (e) {
		throw e instanceof $ ? (Al(e), e) : e instanceof DOMException && e.name === "AbortError" ? new $("Request timed out", {
			code: "request_timeout",
			status: 0
		}) : e instanceof TypeError ? new $("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		u();
	}
}
var Vl = null;
function Hl(e) {
	let t = Ml();
	t && typeof e == "string" && e.length > 0 && (t.nonce = e);
}
function Ul() {
	if (Vl) return Vl;
	let e = Ml();
	if (!e?.ajaxUrl) return Promise.resolve(!1);
	let t = new URLSearchParams();
	return t.set("action", "webino_dashboard_auth_session"), Vl = fetch(e.ajaxUrl, {
		method: "POST",
		credentials: "same-origin",
		headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
		body: t
	}).then((e) => e.json()).then((e) => {
		let t = !!(e?.success && e.data?.logged_in);
		return t && Hl(e.data?.nonce), t && typeof e.data?.nonce == "string" && e.data.nonce.length > 0;
	}).catch(() => !1).finally(() => {
		window.setTimeout(() => {
			Vl = null;
		}, 0);
	}), Vl;
}
async function Wl(e, t = {}, n = Nl) {
	try {
		return await Gl(e, t, n);
	} catch (r) {
		if (!kl(r)) throw r;
		if (!await Ul()) throw Dl(), r;
		let i = { ...t.headers };
		for (let e of Object.keys(i)) e.toLowerCase() === "x-wp-nonce" && delete i[e];
		return Gl(e, {
			...t,
			headers: i
		}, n);
	}
}
async function Gl(e, t = {}, n = Nl) {
	if (Ll(e) && Ml().ajaxUrl) return Bl(e, n, t);
	let r = Fl(e), i = Ml(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce), !Object.keys(a).some((e) => e.toLowerCase() === "content-type") && typeof t.body == "string" && t.body.length > 0 && (a["Content-Type"] = "application/json");
	let { signal: s, clear: c } = Il(t, n);
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
			let t = Rl(n, e.status);
			throw new $(t.message, {
				code: t.code,
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i, n = new $(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
			throw Al(n), n;
		}
		return i;
	} catch (e) {
		throw e instanceof $ ? (Al(e), e) : e instanceof DOMException && e.name === "AbortError" ? new $("Request timed out", {
			code: "request_timeout",
			status: 0
		}) : e instanceof TypeError ? new $("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region ../Modules/wallet-gateway-module/client/pages/WalletAccountPage.tsx
function Kl() {
	let { t: r, i18n: i } = f(), a = n(), [o, s] = d(""), [c, u] = d(""), [h, v] = d("wallet"), y = t({
		queryKey: ["account", "wallet"],
		queryFn: () => Wl("account/wallet")
	}).data;
	l(() => {
		y?.refund_method && v(y.refund_method);
	}, [y?.refund_method]);
	let b = e({
		mutationFn: async () => Wl("account/wallet/topup", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ amount: Number(o) })
		}),
		onSuccess: (e) => {
			e.payment_url && (window.location.href = e.payment_url);
		},
		onError: (e) => xl(r, e)
	}), x = e({
		mutationFn: async () => Wl("account/wallet/withdraw", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ amount: Number(c) })
		}),
		onSuccess: async () => {
			m.success(r("common.saved")), u(""), await a.invalidateQueries({ queryKey: ["account", "wallet"] });
		},
		onError: (e) => xl(r, e)
	}), S = e({
		mutationFn: async (e) => Wl("account/wallet/prefs", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refund_method: e })
		}),
		onSuccess: () => m.success(r("common.saved")),
		onError: (e) => xl(r, e)
	}), C = h;
	return /* @__PURE__ */ g(vt, {
		title: r("wallet.accountTitle"),
		description: r("wallet.accountSubtitle"),
		children: y ? /* @__PURE__ */ _("div", {
			className: "grid max-w-2xl gap-6",
			children: [
				/* @__PURE__ */ _("section", {
					className: "rounded-xl border border-border p-4",
					children: [/* @__PURE__ */ g("p", {
						className: "text-muted-foreground text-xs",
						children: r("wallet.balance")
					}), /* @__PURE__ */ g("p", {
						className: "mt-1 text-2xl font-semibold",
						children: /* @__PURE__ */ g(_t, {
							amount: y.balance,
							currency: "IRT",
							locale: i.language
						})
					})]
				}),
				/* @__PURE__ */ _("section", {
					className: "grid gap-3 rounded-xl border border-border p-4",
					children: [
						/* @__PURE__ */ g(Hc, { children: r("wallet.topup") }),
						/* @__PURE__ */ g(Vc, {
							type: "number",
							min: y.min_topup ?? 1e3,
							value: o,
							onChange: (e) => s(e.target.value)
						}),
						/* @__PURE__ */ g("p", {
							className: "text-muted-foreground text-xs",
							children: r("wallet.minTopupHint", { amount: y.min_topup ?? 1e3 })
						}),
						/* @__PURE__ */ g(Bc, {
							type: "button",
							disabled: b.isPending,
							onClick: () => void b.mutateAsync(),
							children: r("wallet.topupPay")
						})
					]
				}),
				/* @__PURE__ */ _("section", {
					className: "grid gap-3 rounded-xl border border-border p-4",
					children: [
						/* @__PURE__ */ g(Hc, { children: r("wallet.withdraw") }),
						y.sheba ? /* @__PURE__ */ g("p", {
							className: "font-mono text-sm",
							children: y.sheba
						}) : /* @__PURE__ */ _("p", {
							className: "text-muted-foreground text-sm",
							children: [
								r("wallet.needSheba"),
								" ",
								/* @__PURE__ */ g(p, {
									className: "text-primary underline-offset-4 hover:underline",
									to: "/account/profile",
									children: r("wallet.editProfile")
								})
							]
						}),
						/* @__PURE__ */ g(Vc, {
							type: "number",
							min: y.min_withdraw ?? 1e4,
							value: c,
							onChange: (e) => u(e.target.value)
						}),
						/* @__PURE__ */ g(Bc, {
							type: "button",
							variant: "outline",
							disabled: x.isPending || !y.sheba,
							onClick: () => void x.mutateAsync(),
							children: r("wallet.withdrawSubmit")
						})
					]
				}),
				/* @__PURE__ */ _("section", {
					className: "grid gap-3 rounded-xl border border-border p-4",
					children: [/* @__PURE__ */ g(Hc, { children: r("wallet.refundMethod") }), /* @__PURE__ */ _(il, {
						value: C,
						onValueChange: (e) => {
							v(e), S.mutateAsync(e);
						},
						children: [/* @__PURE__ */ g(ol, { children: /* @__PURE__ */ g(al, {}) }), /* @__PURE__ */ _(sl, { children: [/* @__PURE__ */ g(cl, {
							value: "wallet",
							children: r("wallet.refundWallet")
						}), /* @__PURE__ */ g(cl, {
							value: "bank",
							children: r("wallet.refundBank")
						})] })]
					})]
				}),
				/* @__PURE__ */ _("section", {
					className: "rounded-xl border border-border p-4",
					children: [/* @__PURE__ */ g("h2", {
						className: "mb-3 text-sm font-semibold",
						children: r("wallet.ledger")
					}), (y.ledger.items ?? []).length === 0 ? /* @__PURE__ */ g("p", {
						className: "text-muted-foreground text-sm",
						children: r("wallet.ledgerEmpty")
					}) : /* @__PURE__ */ g("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ _("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ g("thead", { children: /* @__PURE__ */ _("tr", {
								className: "text-muted-foreground text-xs",
								children: [
									/* @__PURE__ */ g("th", {
										className: "px-2 py-2 text-start",
										children: r("wallet.col.date")
									}),
									/* @__PURE__ */ g("th", {
										className: "px-2 py-2 text-start",
										children: r("wallet.col.reason")
									}),
									/* @__PURE__ */ g("th", {
										className: "px-2 py-2 text-start",
										children: r("wallet.col.amount")
									}),
									/* @__PURE__ */ g("th", {
										className: "px-2 py-2 text-start",
										children: r("wallet.col.balance")
									})
								]
							}) }), /* @__PURE__ */ g("tbody", { children: y.ledger.items.map((e) => /* @__PURE__ */ _("tr", {
								className: "border-t",
								children: [
									/* @__PURE__ */ g("td", {
										className: "px-2 py-2",
										children: e.created_at
									}),
									/* @__PURE__ */ g("td", {
										className: "px-2 py-2",
										children: r(`wallet.reason.${e.reason}`, { defaultValue: e.reason })
									}),
									/* @__PURE__ */ _("td", {
										className: "px-2 py-2",
										children: [e.direction === "debit" ? "−" : "+", /* @__PURE__ */ g(_t, {
											amount: e.amount,
											currency: "IRT",
											locale: i.language
										})]
									}),
									/* @__PURE__ */ g("td", {
										className: "px-2 py-2",
										children: /* @__PURE__ */ g(_t, {
											amount: e.balance_after,
											currency: "IRT",
											locale: i.language
										})
									})
								]
							}, e.id)) })]
						})
					})]
				})
			]
		}) : /* @__PURE__ */ g("p", {
			className: "text-muted-foreground text-sm",
			children: r("common.loading")
		})
	});
}
//#endregion
//#region src/components/ui/card.tsx
var ql = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function Jl({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ g("div", {
		"data-slot": "card",
		"data-variant": t,
		className: U("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", ql[t], e),
		...n
	});
}
function Yl({ className: e, ...t }) {
	return /* @__PURE__ */ g("div", {
		"data-slot": "card-header",
		className: U("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function Xl({ className: e, ...t }) {
	return /* @__PURE__ */ g("div", {
		"data-slot": "card-title",
		className: U("leading-none font-semibold", e),
		...t
	});
}
function Zl({ className: e, ...t }) {
	return /* @__PURE__ */ g("div", {
		"data-slot": "card-description",
		className: U("text-sm text-muted-foreground", e),
		...t
	});
}
function Ql({ className: e, ...t }) {
	return /* @__PURE__ */ g("div", {
		"data-slot": "card-content",
		className: U("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region src/components/ui/switch.tsx
function $l({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ g(Lc, {
		"data-slot": "switch",
		"data-size": t,
		className: U("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", e),
		...n,
		dir: "ltr",
		children: /* @__PURE__ */ g(Rc, {
			"data-slot": "switch-thumb",
			className: U("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
//#endregion
//#region src/components/payments/GatewaySettingsLayout.tsx
function eu({ title: e, description: t, notice: n, meta: r, sections: i, actions: a, children: o }) {
	let { t: s } = f(), c = async (e) => {
		try {
			await navigator.clipboard.writeText(e), m.success(s("common.copied", { defaultValue: "Copied" }));
		} catch {
			m.error(s("common.copyFailed", { defaultValue: "Copy failed" }));
		}
	};
	return /* @__PURE__ */ g(vt, {
		title: e,
		description: t,
		children: /* @__PURE__ */ _("div", {
			className: "mx-auto w-full max-w-6xl space-y-6",
			children: [
				n,
				o,
				r && r.length > 0 ? /* @__PURE__ */ g("div", {
					className: "bg-muted/30 grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3",
					children: r.map((e) => /* @__PURE__ */ _("div", {
						className: "min-w-0 space-y-1",
						children: [/* @__PURE__ */ g("p", {
							className: "text-muted-foreground text-xs font-medium",
							children: e.label
						}), /* @__PURE__ */ _("div", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ g("code", {
								className: "bg-background block min-w-0 flex-1 truncate rounded-md border px-2 py-1.5 text-xs",
								children: e.value || "—"
							}), e.copyable && e.value ? /* @__PURE__ */ g(Bc, {
								type: "button",
								size: "icon",
								variant: "outline",
								className: "size-8 shrink-0",
								onClick: () => void c(e.value),
								children: /* @__PURE__ */ g(nl, { className: "size-3.5" })
							}) : null]
						})]
					}, e.label))
				}) : null,
				i.length > 1 ? /* @__PURE__ */ g("nav", {
					className: "flex flex-wrap gap-2",
					"aria-label": e,
					children: i.map((e) => /* @__PURE__ */ g(Bc, {
						asChild: !0,
						size: "sm",
						variant: "outline",
						children: /* @__PURE__ */ g("a", {
							href: `#${e.id}`,
							children: e.title
						})
					}, e.id))
				}) : null,
				/* @__PURE__ */ g("div", {
					className: "space-y-5",
					children: i.map((e) => /* @__PURE__ */ _(Jl, {
						id: e.id,
						className: "scroll-mt-24",
						children: [/* @__PURE__ */ _(Yl, { children: [/* @__PURE__ */ g(Xl, {
							className: "text-base",
							children: e.title
						}), e.description ? /* @__PURE__ */ g(Zl, { children: e.description }) : null] }), /* @__PURE__ */ g(Ql, { children: e.children })]
					}, e.id))
				}),
				a ? /* @__PURE__ */ g("div", {
					className: "bg-background/95 sticky bottom-3 z-10 flex flex-wrap gap-2 rounded-xl border p-3 shadow-sm backdrop-blur",
					children: a
				}) : null
			]
		})
	});
}
function tu({ label: e, value: t, onChange: n, type: r = "text", placeholder: i, hint: a, className: o }) {
	return /* @__PURE__ */ _("div", {
		className: U("space-y-2", o),
		children: [
			/* @__PURE__ */ g(Hc, { children: e }),
			/* @__PURE__ */ g(Vc, {
				type: r,
				value: t,
				placeholder: i,
				onChange: (e) => n(e.target.value)
			}),
			a ? /* @__PURE__ */ g("p", {
				className: "text-muted-foreground text-xs",
				children: a
			}) : null
		]
	});
}
function nu({ label: e, description: t, checked: n, onChange: r }) {
	return /* @__PURE__ */ _("div", {
		className: "flex items-start justify-between gap-4 rounded-lg border border-border/70 px-3 py-3",
		children: [/* @__PURE__ */ _("div", {
			className: "min-w-0 space-y-0.5",
			children: [/* @__PURE__ */ g("p", {
				className: "text-sm font-medium leading-snug",
				children: e
			}), t ? /* @__PURE__ */ g("p", {
				className: "text-muted-foreground text-xs leading-relaxed",
				children: t
			}) : null]
		}), /* @__PURE__ */ g($l, {
			checked: n,
			onCheckedChange: (e) => r(!!e),
			className: "mt-0.5 shrink-0"
		})]
	});
}
function ru({ children: e }) {
	return /* @__PURE__ */ g("div", {
		className: "grid gap-4 md:grid-cols-2",
		children: e
	});
}
//#endregion
//#region ../Modules/wallet-gateway-module/client/pages/WalletSettingsPage.tsx
function iu() {
	let { t: r } = f(), i = n(), [a, o] = d(null), s = t({
		queryKey: ["wallet", "settings"],
		queryFn: () => Wl("wallet/settings")
	});
	l(() => {
		s.data?.settings && o(s.data.settings);
	}, [s.data]);
	let c = e({
		mutationFn: async () => Wl("wallet/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(a)
		}),
		onSuccess: async (e) => {
			m.success(r("common.saved")), e.settings && o(e.settings), await i.invalidateQueries({ queryKey: ["wallet", "settings"] }), await i.invalidateQueries({ queryKey: ["payment-gateways"] }), await i.invalidateQueries({ queryKey: ["payments-hub"] });
		},
		onError: (e) => xl(r, e)
	});
	return a ? /* @__PURE__ */ g(eu, {
		title: r("wallet.title"),
		description: r("wallet.subtitle"),
		sections: [{
			id: "wallet",
			title: r("gateway.section.checkout"),
			description: r("wallet.sectionHint"),
			children: /* @__PURE__ */ _("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ g(nu, {
					label: r("wallet.enabled"),
					description: r("wallet.enabledHint"),
					checked: a.enabled,
					onChange: (e) => o({
						...a,
						enabled: e
					})
				}), /* @__PURE__ */ _(ru, { children: [
					/* @__PURE__ */ g(tu, {
						label: r("wallet.checkoutTitle"),
						value: a.title,
						onChange: (e) => o({
							...a,
							title: e
						})
					}),
					/* @__PURE__ */ g(tu, {
						label: r("gateway.field.orderButtonText"),
						value: a.order_button_text ?? "",
						onChange: (e) => o({
							...a,
							order_button_text: e
						})
					}),
					/* @__PURE__ */ g(tu, {
						label: r("gateway.field.description"),
						value: a.description ?? "",
						onChange: (e) => o({
							...a,
							description: e
						})
					}),
					/* @__PURE__ */ g(tu, {
						label: r("wallet.loginPrompt"),
						value: a.login_prompt ?? "",
						onChange: (e) => o({
							...a,
							login_prompt: e
						})
					}),
					/* @__PURE__ */ g(tu, {
						label: r("wallet.balanceLabel"),
						value: a.balance_label ?? "",
						onChange: (e) => o({
							...a,
							balance_label: e
						}),
						hint: "{balance}"
					}),
					/* @__PURE__ */ g(tu, {
						label: r("wallet.minTopup"),
						type: "number",
						value: String(a.min_topup),
						onChange: (e) => o({
							...a,
							min_topup: Number(e) || 1
						}),
						hint: r("wallet.minTopupHint")
					}),
					/* @__PURE__ */ _("div", {
						className: "space-y-2 md:col-span-2",
						children: [/* @__PURE__ */ g("label", {
							className: "text-sm font-medium",
							children: r("gateway.field.iconUrl")
						}), /* @__PURE__ */ _("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ g("img", {
								src: a.icon_url?.trim() || a.resolved_icon_url || a.default_icon_url || "",
								alt: "",
								className: "h-10 w-10 shrink-0 rounded border object-contain"
							}), /* @__PURE__ */ g("div", {
								className: "min-w-0 flex-1",
								children: /* @__PURE__ */ g(tu, {
									label: "",
									value: a.icon_url ?? "",
									onChange: (e) => o({
										...a,
										icon_url: e
									}),
									hint: r("gateway.field.iconUrlHint")
								})
							})]
						})]
					})
				] })]
			})
		}],
		actions: /* @__PURE__ */ g(Bc, {
			type: "button",
			disabled: c.isPending,
			onClick: () => void c.mutateAsync(),
			children: r("common.save")
		})
	}) : /* @__PURE__ */ g(vt, {
		title: r("wallet.title"),
		children: r("common.loading")
	});
}
//#endregion
//#region ../Modules/wallet-gateway-module/client/pages/WalletWithdrawalsPage.tsx
function au() {
	let { t: r, i18n: i } = f(), a = n(), o = t({
		queryKey: ["wallet", "withdrawals"],
		queryFn: () => Wl("shop/wallet-withdrawals?status=pending")
	}), s = e({
		mutationFn: async (e) => Wl("shop/wallet-withdrawals", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(e)
		}),
		onSuccess: async () => {
			m.success(r("common.saved")), await a.invalidateQueries({ queryKey: ["wallet", "withdrawals"] });
		},
		onError: (e) => xl(r, e)
	}), c = o.data?.items ?? [];
	return /* @__PURE__ */ g(vt, {
		title: r("wallet.withdrawalsTitle"),
		subtitle: r("wallet.withdrawalsSubtitle"),
		children: o.isLoading ? /* @__PURE__ */ g("p", {
			className: "text-muted-foreground text-sm",
			children: r("common.loading")
		}) : c.length === 0 ? /* @__PURE__ */ g("p", {
			className: "text-muted-foreground text-sm",
			children: r("wallet.withdrawalsEmpty")
		}) : /* @__PURE__ */ g("div", {
			className: "grid gap-3",
			children: c.map((e) => /* @__PURE__ */ _("article", {
				className: "grid gap-3 rounded-xl border border-border p-4 md:grid-cols-[1fr_auto] md:items-center",
				children: [/* @__PURE__ */ _("div", {
					className: "space-y-1 text-sm",
					children: [
						/* @__PURE__ */ g("p", {
							className: "font-semibold",
							children: e.user_name || `#${e.user_id}`
						}),
						/* @__PURE__ */ g("p", { children: /* @__PURE__ */ g(_t, {
							amount: e.amount,
							currency: "IRT",
							locale: i.language
						}) }),
						/* @__PURE__ */ g("p", {
							className: "font-mono text-xs",
							children: e.sheba
						}),
						/* @__PURE__ */ g("p", {
							className: "text-muted-foreground text-xs",
							children: e.created_at
						})
					]
				}), /* @__PURE__ */ _("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ g(Bc, {
							type: "button",
							disabled: s.isPending,
							onClick: () => void s.mutateAsync({
								id: e.id,
								status: "approved"
							}),
							children: r("wallet.approve")
						}),
						/* @__PURE__ */ g(Bc, {
							type: "button",
							variant: "secondary",
							disabled: s.isPending,
							onClick: () => void s.mutateAsync({
								id: e.id,
								status: "paid"
							}),
							children: r("wallet.markPaid")
						}),
						/* @__PURE__ */ g(Bc, {
							type: "button",
							variant: "destructive",
							disabled: s.isPending,
							onClick: () => void s.mutateAsync({
								id: e.id,
								status: "rejected"
							}),
							children: r("wallet.reject")
						})
					]
				})]
			}, e.id))
		})
	});
}
//#endregion
//#region ../Modules/wallet-gateway-module/client/module-entry.tsx
var ou = {
	"settings/shop/wallet": iu,
	"shop/wallet-withdrawals": au,
	"account/wallet": Kl
}, su = { routes: ou };
//#endregion
export { su as default, ou as routes };
