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
}), T = "-", E = [], D = "arbitrary..", O = (e) => {
	let t = j(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return A(e);
			let n = e.split(T);
			return k(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? S(i, t) : t : i || E;
			}
			return n[e] || E;
		}
	};
}, k = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = k(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(T) : e.slice(t).join(T), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, A = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? D + r : void 0;
})(), j = (e) => {
	let { theme: t, classGroups: n } = e;
	return M(n, t);
}, M = (e, t) => {
	let n = w();
	for (let r in e) {
		let i = e[r];
		N(i, n, r, t);
	}
	return n;
}, N = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		P(i, t, n, r);
	}
}, P = (e, t, n, r) => {
	if (typeof e == "string") {
		F(e, t, n);
		return;
	}
	if (typeof e == "function") {
		I(e, t, n, r);
		return;
	}
	ee(e, t, n, r);
}, F = (e, t, n) => {
	let r = e === "" ? t : te(t, e);
	r.classGroupId = n;
}, I = (e, t, n, r) => {
	if (ne(e)) {
		N(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(C(n, e));
}, ee = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		N(o, te(t, a), n, r);
	}
}, te = (e, t) => {
	let n = e, r = t.split(T), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = w(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, ne = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, re = (e) => {
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
}, L = "!", R = ":", ie = [], ae = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), z = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === R) {
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
		s.endsWith(L) ? (c = s.slice(0, -1), l = !0) : s.startsWith(L) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return ae(t, l, c, u);
	};
	if (t) {
		let e = t + R, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : ae(ie, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, oe = (e) => {
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
}, se = (e) => ({
	cache: re(e.cacheSize),
	parseClassName: z(e),
	sortModifiers: oe(e),
	...O(e)
}), ce = /\s+/, le = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(ce), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + L : g, v = _ + h;
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
}, ue = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = de(n)) && (i && (i += " "), i += r);
	return i;
}, de = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = de(e[r])) && (n && (n += " "), n += t);
	return n;
}, fe = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = se(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = le(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(ue(...e));
}, pe = [], B = (e) => {
	let t = (t) => t[e] || pe;
	return t.isThemeGetter = !0, t;
}, me = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, he = /^\((?:(\w[\w-]*):)?(.+)\)$/i, ge = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, _e = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, ve = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, ye = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, be = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, xe = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, Se = (e) => ge.test(e), V = (e) => !!e && !Number.isNaN(Number(e)), Ce = (e) => !!e && Number.isInteger(Number(e)), we = (e) => e.endsWith("%") && V(e.slice(0, -1)), Te = (e) => _e.test(e), Ee = () => !0, De = (e) => ve.test(e) && !ye.test(e), Oe = () => !1, ke = (e) => be.test(e), Ae = (e) => xe.test(e), je = (e) => !H(e) && !U(e), Me = (e) => qe(e, Ze, Oe), H = (e) => me.test(e), Ne = (e) => qe(e, Qe, De), Pe = (e) => qe(e, $e, V), Fe = (e) => qe(e, tt, Ee), Ie = (e) => qe(e, et, Oe), Le = (e) => qe(e, Ye, Oe), Re = (e) => qe(e, Xe, Ae), ze = (e) => qe(e, nt, ke), U = (e) => he.test(e), Be = (e) => Je(e, Qe), Ve = (e) => Je(e, et), He = (e) => Je(e, Ye), Ue = (e) => Je(e, Ze), We = (e) => Je(e, Xe), Ge = (e) => Je(e, nt, !0), Ke = (e) => Je(e, tt, !0), qe = (e, t, n) => {
	let r = me.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, Je = (e, t, n = !1) => {
	let r = he.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, Ye = (e) => e === "position" || e === "percentage", Xe = (e) => e === "image" || e === "url", Ze = (e) => e === "length" || e === "size" || e === "bg-size", Qe = (e) => e === "length", $e = (e) => e === "number", et = (e) => e === "family-name", tt = (e) => e === "number" || e === "weight", nt = (e) => e === "shadow", rt = /* @__PURE__ */ fe(() => {
	let e = B("color"), t = B("font"), n = B("text"), r = B("font-weight"), i = B("tracking"), a = B("leading"), o = B("breakpoint"), s = B("container"), c = B("spacing"), l = B("radius"), u = B("shadow"), d = B("inset-shadow"), f = B("text-shadow"), p = B("drop-shadow"), m = B("blur"), h = B("perspective"), g = B("aspect"), _ = B("ease"), v = B("animate"), y = () => [
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
		U,
		H
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
		U,
		H,
		c
	], T = () => [
		Se,
		"full",
		"auto",
		...w()
	], E = () => [
		Ce,
		"none",
		"subgrid",
		U,
		H
	], D = () => [
		"auto",
		{ span: [
			"full",
			Ce,
			U,
			H
		] },
		Ce,
		U,
		H
	], O = () => [
		Ce,
		"auto",
		U,
		H
	], k = () => [
		"auto",
		"min",
		"max",
		"fr",
		U,
		H
	], A = () => [
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
	], j = () => [
		"start",
		"end",
		"center",
		"stretch",
		"center-safe",
		"end-safe"
	], M = () => ["auto", ...w()], N = () => [
		Se,
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
	], P = () => [
		Se,
		"screen",
		"full",
		"dvw",
		"lvw",
		"svw",
		"min",
		"max",
		"fit",
		...w()
	], F = () => [
		Se,
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
	], I = () => [
		e,
		U,
		H
	], ee = () => [
		...b(),
		He,
		Le,
		{ position: [U, H] }
	], te = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], ne = () => [
		"auto",
		"cover",
		"contain",
		Ue,
		Me,
		{ size: [U, H] }
	], re = () => [
		we,
		Be,
		Ne
	], L = () => [
		"",
		"none",
		"full",
		l,
		U,
		H
	], R = () => [
		"",
		V,
		Be,
		Ne
	], ie = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	], ae = () => [
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
	], z = () => [
		V,
		we,
		He,
		Le
	], oe = () => [
		"",
		"none",
		m,
		U,
		H
	], se = () => [
		"none",
		V,
		U,
		H
	], ce = () => [
		"none",
		V,
		U,
		H
	], le = () => [
		V,
		U,
		H
	], ue = () => [
		Se,
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
			blur: [Te],
			breakpoint: [Te],
			color: [Ee],
			container: [Te],
			"drop-shadow": [Te],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [je],
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
			"inset-shadow": [Te],
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
			radius: [Te],
			shadow: [Te],
			spacing: ["px", V],
			text: [Te],
			"text-shadow": [Te],
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
				Se,
				H,
				U,
				g
			] }],
			container: ["container"],
			columns: [{ columns: [
				V,
				H,
				U,
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
				Ce,
				"auto",
				U,
				H
			] }],
			basis: [{ basis: [
				Se,
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
				V,
				Se,
				"auto",
				"initial",
				"none",
				H
			] }],
			grow: [{ grow: [
				"",
				V,
				U,
				H
			] }],
			shrink: [{ shrink: [
				"",
				V,
				U,
				H
			] }],
			order: [{ order: [
				Ce,
				"first",
				"last",
				"none",
				U,
				H
			] }],
			"grid-cols": [{ "grid-cols": E() }],
			"col-start-end": [{ col: D() }],
			"col-start": [{ "col-start": O() }],
			"col-end": [{ "col-end": O() }],
			"grid-rows": [{ "grid-rows": E() }],
			"row-start-end": [{ row: D() }],
			"row-start": [{ "row-start": O() }],
			"row-end": [{ "row-end": O() }],
			"grid-flow": [{ "grid-flow": [
				"row",
				"col",
				"dense",
				"row-dense",
				"col-dense"
			] }],
			"auto-cols": [{ "auto-cols": k() }],
			"auto-rows": [{ "auto-rows": k() }],
			gap: [{ gap: w() }],
			"gap-x": [{ "gap-x": w() }],
			"gap-y": [{ "gap-y": w() }],
			"justify-content": [{ justify: [...A(), "normal"] }],
			"justify-items": [{ "justify-items": [...j(), "normal"] }],
			"justify-self": [{ "justify-self": ["auto", ...j()] }],
			"align-content": [{ content: ["normal", ...A()] }],
			"align-items": [{ items: [...j(), { baseline: ["", "last"] }] }],
			"align-self": [{ self: [
				"auto",
				...j(),
				{ baseline: ["", "last"] }
			] }],
			"place-content": [{ "place-content": A() }],
			"place-items": [{ "place-items": [...j(), "baseline"] }],
			"place-self": [{ "place-self": ["auto", ...j()] }],
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
			m: [{ m: M() }],
			mx: [{ mx: M() }],
			my: [{ my: M() }],
			ms: [{ ms: M() }],
			me: [{ me: M() }],
			mbs: [{ mbs: M() }],
			mbe: [{ mbe: M() }],
			mt: [{ mt: M() }],
			mr: [{ mr: M() }],
			mb: [{ mb: M() }],
			ml: [{ ml: M() }],
			"space-x": [{ "space-x": w() }],
			"space-x-reverse": ["space-x-reverse"],
			"space-y": [{ "space-y": w() }],
			"space-y-reverse": ["space-y-reverse"],
			size: [{ size: N() }],
			"inline-size": [{ inline: ["auto", ...P()] }],
			"min-inline-size": [{ "min-inline": ["auto", ...P()] }],
			"max-inline-size": [{ "max-inline": ["none", ...P()] }],
			"block-size": [{ block: ["auto", ...F()] }],
			"min-block-size": [{ "min-block": ["auto", ...F()] }],
			"max-block-size": [{ "max-block": ["none", ...F()] }],
			w: [{ w: [
				s,
				"screen",
				...N()
			] }],
			"min-w": [{ "min-w": [
				s,
				"screen",
				"none",
				...N()
			] }],
			"max-w": [{ "max-w": [
				s,
				"screen",
				"none",
				"prose",
				{ screen: [o] },
				...N()
			] }],
			h: [{ h: [
				"screen",
				"lh",
				...N()
			] }],
			"min-h": [{ "min-h": [
				"screen",
				"lh",
				"none",
				...N()
			] }],
			"max-h": [{ "max-h": [
				"screen",
				"lh",
				...N()
			] }],
			"font-size": [{ text: [
				"base",
				n,
				Be,
				Ne
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				Ke,
				Fe
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
				we,
				H
			] }],
			"font-family": [{ font: [
				Ve,
				Ie,
				t
			] }],
			"font-features": [{ "font-features": [H] }],
			"fvn-normal": ["normal-nums"],
			"fvn-ordinal": ["ordinal"],
			"fvn-slashed-zero": ["slashed-zero"],
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			tracking: [{ tracking: [
				i,
				U,
				H
			] }],
			"line-clamp": [{ "line-clamp": [
				V,
				"none",
				U,
				Pe
			] }],
			leading: [{ leading: [a, ...w()] }],
			"list-image": [{ "list-image": [
				"none",
				U,
				H
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				U,
				H
			] }],
			"text-alignment": [{ text: [
				"left",
				"center",
				"right",
				"justify",
				"start",
				"end"
			] }],
			"placeholder-color": [{ placeholder: I() }],
			"text-color": [{ text: I() }],
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			"text-decoration-style": [{ decoration: [...ie(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				V,
				"from-font",
				"auto",
				U,
				Ne
			] }],
			"text-decoration-color": [{ decoration: I() }],
			"underline-offset": [{ "underline-offset": [
				V,
				"auto",
				U,
				H
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
				U,
				H
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
				U,
				H
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
			"bg-position": [{ bg: ee() }],
			"bg-repeat": [{ bg: te() }],
			"bg-size": [{ bg: ne() }],
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
						Ce,
						U,
						H
					],
					radial: [
						"",
						U,
						H
					],
					conic: [
						Ce,
						U,
						H
					]
				},
				We,
				Re
			] }],
			"bg-color": [{ bg: I() }],
			"gradient-from-pos": [{ from: re() }],
			"gradient-via-pos": [{ via: re() }],
			"gradient-to-pos": [{ to: re() }],
			"gradient-from": [{ from: I() }],
			"gradient-via": [{ via: I() }],
			"gradient-to": [{ to: I() }],
			rounded: [{ rounded: L() }],
			"rounded-s": [{ "rounded-s": L() }],
			"rounded-e": [{ "rounded-e": L() }],
			"rounded-t": [{ "rounded-t": L() }],
			"rounded-r": [{ "rounded-r": L() }],
			"rounded-b": [{ "rounded-b": L() }],
			"rounded-l": [{ "rounded-l": L() }],
			"rounded-ss": [{ "rounded-ss": L() }],
			"rounded-se": [{ "rounded-se": L() }],
			"rounded-ee": [{ "rounded-ee": L() }],
			"rounded-es": [{ "rounded-es": L() }],
			"rounded-tl": [{ "rounded-tl": L() }],
			"rounded-tr": [{ "rounded-tr": L() }],
			"rounded-br": [{ "rounded-br": L() }],
			"rounded-bl": [{ "rounded-bl": L() }],
			"border-w": [{ border: R() }],
			"border-w-x": [{ "border-x": R() }],
			"border-w-y": [{ "border-y": R() }],
			"border-w-s": [{ "border-s": R() }],
			"border-w-e": [{ "border-e": R() }],
			"border-w-bs": [{ "border-bs": R() }],
			"border-w-be": [{ "border-be": R() }],
			"border-w-t": [{ "border-t": R() }],
			"border-w-r": [{ "border-r": R() }],
			"border-w-b": [{ "border-b": R() }],
			"border-w-l": [{ "border-l": R() }],
			"divide-x": [{ "divide-x": R() }],
			"divide-x-reverse": ["divide-x-reverse"],
			"divide-y": [{ "divide-y": R() }],
			"divide-y-reverse": ["divide-y-reverse"],
			"border-style": [{ border: [
				...ie(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...ie(),
				"hidden",
				"none"
			] }],
			"border-color": [{ border: I() }],
			"border-color-x": [{ "border-x": I() }],
			"border-color-y": [{ "border-y": I() }],
			"border-color-s": [{ "border-s": I() }],
			"border-color-e": [{ "border-e": I() }],
			"border-color-bs": [{ "border-bs": I() }],
			"border-color-be": [{ "border-be": I() }],
			"border-color-t": [{ "border-t": I() }],
			"border-color-r": [{ "border-r": I() }],
			"border-color-b": [{ "border-b": I() }],
			"border-color-l": [{ "border-l": I() }],
			"divide-color": [{ divide: I() }],
			"outline-style": [{ outline: [
				...ie(),
				"none",
				"hidden"
			] }],
			"outline-offset": [{ "outline-offset": [
				V,
				U,
				H
			] }],
			"outline-w": [{ outline: [
				"",
				V,
				Be,
				Ne
			] }],
			"outline-color": [{ outline: I() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				Ge,
				ze
			] }],
			"shadow-color": [{ shadow: I() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				Ge,
				ze
			] }],
			"inset-shadow-color": [{ "inset-shadow": I() }],
			"ring-w": [{ ring: R() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: I() }],
			"ring-offset-w": [{ "ring-offset": [V, Ne] }],
			"ring-offset-color": [{ "ring-offset": I() }],
			"inset-ring-w": [{ "inset-ring": R() }],
			"inset-ring-color": [{ "inset-ring": I() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				Ge,
				ze
			] }],
			"text-shadow-color": [{ "text-shadow": I() }],
			opacity: [{ opacity: [
				V,
				U,
				H
			] }],
			"mix-blend": [{ "mix-blend": [
				...ae(),
				"plus-darker",
				"plus-lighter"
			] }],
			"bg-blend": [{ "bg-blend": ae() }],
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
			"mask-image-linear-pos": [{ "mask-linear": [V] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": z() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": z() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": I() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": I() }],
			"mask-image-t-from-pos": [{ "mask-t-from": z() }],
			"mask-image-t-to-pos": [{ "mask-t-to": z() }],
			"mask-image-t-from-color": [{ "mask-t-from": I() }],
			"mask-image-t-to-color": [{ "mask-t-to": I() }],
			"mask-image-r-from-pos": [{ "mask-r-from": z() }],
			"mask-image-r-to-pos": [{ "mask-r-to": z() }],
			"mask-image-r-from-color": [{ "mask-r-from": I() }],
			"mask-image-r-to-color": [{ "mask-r-to": I() }],
			"mask-image-b-from-pos": [{ "mask-b-from": z() }],
			"mask-image-b-to-pos": [{ "mask-b-to": z() }],
			"mask-image-b-from-color": [{ "mask-b-from": I() }],
			"mask-image-b-to-color": [{ "mask-b-to": I() }],
			"mask-image-l-from-pos": [{ "mask-l-from": z() }],
			"mask-image-l-to-pos": [{ "mask-l-to": z() }],
			"mask-image-l-from-color": [{ "mask-l-from": I() }],
			"mask-image-l-to-color": [{ "mask-l-to": I() }],
			"mask-image-x-from-pos": [{ "mask-x-from": z() }],
			"mask-image-x-to-pos": [{ "mask-x-to": z() }],
			"mask-image-x-from-color": [{ "mask-x-from": I() }],
			"mask-image-x-to-color": [{ "mask-x-to": I() }],
			"mask-image-y-from-pos": [{ "mask-y-from": z() }],
			"mask-image-y-to-pos": [{ "mask-y-to": z() }],
			"mask-image-y-from-color": [{ "mask-y-from": I() }],
			"mask-image-y-to-color": [{ "mask-y-to": I() }],
			"mask-image-radial": [{ "mask-radial": [U, H] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": z() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": z() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": I() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": I() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [V] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": z() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": z() }],
			"mask-image-conic-from-color": [{ "mask-conic-from": I() }],
			"mask-image-conic-to-color": [{ "mask-conic-to": I() }],
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
			"mask-position": [{ mask: ee() }],
			"mask-repeat": [{ mask: te() }],
			"mask-size": [{ mask: ne() }],
			"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
			"mask-image": [{ mask: [
				"none",
				U,
				H
			] }],
			filter: [{ filter: [
				"",
				"none",
				U,
				H
			] }],
			blur: [{ blur: oe() }],
			brightness: [{ brightness: [
				V,
				U,
				H
			] }],
			contrast: [{ contrast: [
				V,
				U,
				H
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				Ge,
				ze
			] }],
			"drop-shadow-color": [{ "drop-shadow": I() }],
			grayscale: [{ grayscale: [
				"",
				V,
				U,
				H
			] }],
			"hue-rotate": [{ "hue-rotate": [
				V,
				U,
				H
			] }],
			invert: [{ invert: [
				"",
				V,
				U,
				H
			] }],
			saturate: [{ saturate: [
				V,
				U,
				H
			] }],
			sepia: [{ sepia: [
				"",
				V,
				U,
				H
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				U,
				H
			] }],
			"backdrop-blur": [{ "backdrop-blur": oe() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				V,
				U,
				H
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				V,
				U,
				H
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				V,
				U,
				H
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				V,
				U,
				H
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				V,
				U,
				H
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				V,
				U,
				H
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				V,
				U,
				H
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				V,
				U,
				H
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
				U,
				H
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				V,
				"initial",
				U,
				H
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				U,
				H
			] }],
			delay: [{ delay: [
				V,
				U,
				H
			] }],
			animate: [{ animate: [
				"none",
				v,
				U,
				H
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				U,
				H
			] }],
			"perspective-origin": [{ "perspective-origin": x() }],
			rotate: [{ rotate: se() }],
			"rotate-x": [{ "rotate-x": se() }],
			"rotate-y": [{ "rotate-y": se() }],
			"rotate-z": [{ "rotate-z": se() }],
			scale: [{ scale: ce() }],
			"scale-x": [{ "scale-x": ce() }],
			"scale-y": [{ "scale-y": ce() }],
			"scale-z": [{ "scale-z": ce() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: le() }],
			"skew-x": [{ "skew-x": le() }],
			"skew-y": [{ "skew-y": le() }],
			transform: [{ transform: [
				U,
				H,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: x() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: ue() }],
			"translate-x": [{ "translate-x": ue() }],
			"translate-y": [{ "translate-y": ue() }],
			"translate-z": [{ "translate-z": ue() }],
			"translate-none": ["translate-none"],
			accent: [{ accent: I() }],
			appearance: [{ appearance: ["none", "auto"] }],
			"caret-color": [{ caret: I() }],
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
				U,
				H
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
				U,
				H
			] }],
			fill: [{ fill: ["none", ...I()] }],
			"stroke-w": [{ stroke: [
				V,
				Be,
				Ne,
				Pe
			] }],
			stroke: [{ stroke: ["none", ...I()] }],
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
function W(...e) {
	return rt(x(e));
}
//#endregion
//#region src/components/currency/IrtIcon.tsx
function it({ className: e }) {
	return /* @__PURE__ */ _("svg", {
		width: "13",
		height: "12",
		viewBox: "0 0 13 12",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		className: W("inline-block h-[0.85em] w-auto shrink-0 align-[-0.12em]", e),
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
var at = /تومان|toman|irt/i;
function ot(e) {
	return e.replace(/&nbsp;/gi, " ").replace(/&#160;/g, " ").replace(/&#x0*a0;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, "\"").replace(/&#(\d+);/g, (e, t) => {
		let n = Number(t);
		return Number.isFinite(n) ? String.fromCharCode(n) : e;
	}).replace(/\u00a0/g, " ");
}
function st(e, t) {
	let n = (e ?? "").trim(), r = (t ?? "").trim();
	if (!n && !r) return !1;
	let i = n.toUpperCase();
	return !!(i === "IRT" || i === "TOMAN" || at.test(n) || at.test(r));
}
function ct(e) {
	return e.toLowerCase().startsWith("fa");
}
function lt(e) {
	return e.replace(/\d/g, (e) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(e, 10)] ?? e);
}
//#endregion
//#region src/lib/formatNumber.ts
function ut(e, t) {
	let n = Number.isFinite(e) ? e : 0, r = ct(t) ? "fa-IR" : "en-US", i = new Intl.NumberFormat(r, { maximumFractionDigits: 2 }).format(n);
	return ct(t) ? lt(i) : i;
}
//#endregion
//#region src/components/currency/MoneyDisplay.tsx
function dt({ amount: e, currency: t, currencySymbol: n, locale: r, className: i, amountClassName: a, prefix: o }) {
	let s = typeof e == "string" ? ot(e).replace(/[^\d.-]/g, "") : "", c = typeof e == "number" ? e : parseFloat(s), l = typeof e == "string" && Number.isNaN(c) ? ot(e) : ut(Number.isFinite(c) ? c : 0, r), u = st(t, n) || !t?.trim() && !n?.trim();
	return /* @__PURE__ */ _("span", {
		className: W("inline-flex items-baseline gap-1", i),
		children: [
			o,
			/* @__PURE__ */ g("span", {
				className: a,
				children: l
			}),
			u ? /* @__PURE__ */ g(it, {}) : t ? /* @__PURE__ */ g("span", {
				className: "text-muted-foreground text-[0.85em]",
				children: t
			}) : null
		]
	});
}
//#endregion
//#region src/components/PageShell.tsx
function ft({ title: e, description: t, eyebrow: n, children: r }) {
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
var pt = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, mt = x, ht = (e, t) => (n) => {
	if (t?.variants == null) return mt(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = pt(t) || pt(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return mt(e, a, t?.compoundVariants?.reduce((e, t) => {
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
function gt(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function _t(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = gt(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : gt(e[t], null);
			}
		};
	};
}
function G(...e) {
	return r.useCallback(_t(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function vt(e) {
	let t = /* @__PURE__ */ yt(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(xt);
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
function yt(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Ct(n), a = St(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? _t(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var bt = Symbol("radix.slottable");
function xt(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === bt;
}
function St(e, t) {
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
function Ct(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/dist/index.mjs
var K = [
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
	let n = /* @__PURE__ */ vt(`Primitive.${t}`), i = r.forwardRef((e, r) => {
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
function wt(e, t) {
	e && v.flushSync(() => e.dispatchEvent(t));
}
//#endregion
//#region node_modules/@radix-ui/react-visually-hidden/dist/index.mjs
var Tt = Object.freeze({
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
}), Et = "VisuallyHidden", Dt = r.forwardRef((e, t) => /* @__PURE__ */ g(K.span, {
	...e,
	ref: t,
	style: {
		...Tt,
		...e.style
	}
}));
Dt.displayName = Et;
//#endregion
//#region node_modules/@radix-ui/react-context/dist/index.mjs
function Ot(e, t = []) {
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
	return a.scopeName = e, [i, kt(a, ...t)];
}
function kt(...e) {
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
function At(e) {
	let t = /* @__PURE__ */ jt(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Nt);
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
function jt(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Ft(n), a = Pt(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? _t(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Mt = Symbol("radix.slottable");
function Nt(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Mt;
}
function Pt(e, t) {
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
function Ft(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function It(e) {
	let t = e + "CollectionProvider", [n, r] = Ot(t), [a, o] = n(t, {
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
	let c = e + "CollectionSlot", l = /* @__PURE__ */ At(c), u = i.forwardRef((e, t) => {
		let { scope: n, children: r } = e;
		return /* @__PURE__ */ g(l, {
			ref: G(t, o(c, n).collectionRef),
			children: r
		});
	});
	u.displayName = c;
	let d = e + "CollectionItemSlot", f = "data-radix-collection-item", p = /* @__PURE__ */ At(d), m = i.forwardRef((e, t) => {
		let { scope: n, children: r, ...a } = e, s = i.useRef(null), c = G(t, s), l = o(d, n);
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
function q(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var J = globalThis?.document ? r.useLayoutEffect : () => {}, Lt = r.useInsertionEffect || J;
function Rt({ prop: e, defaultProp: t, onChange: n = () => {}, caller: i }) {
	let [a, o, s] = zt({
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
			let n = Bt(t) ? t(e) : t;
			n !== e && s.current?.(n);
		} else o(t);
	}, [
		c,
		e,
		o,
		s
	])];
}
function zt({ defaultProp: e, onChange: t }) {
	let [n, i] = r.useState(e), a = r.useRef(n), o = r.useRef(t);
	return Lt(() => {
		o.current = t;
	}, [t]), r.useEffect(() => {
		a.current !== n && (o.current?.(n), a.current = n);
	}, [n, a]), [
		n,
		i,
		o
	];
}
function Bt(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/@radix-ui/react-presence/dist/index.mjs
function Vt(e, t) {
	return r.useReducer((e, n) => t[e][n] ?? e, e);
}
var Ht = (e) => {
	let { present: t, children: n } = e, i = Ut(t), a = typeof n == "function" ? n({ present: i.isPresent }) : r.Children.only(n), o = G(i.ref, Gt(a));
	return typeof n == "function" || i.isPresent ? r.cloneElement(a, { ref: o }) : null;
};
Ht.displayName = "Presence";
function Ut(e) {
	let [t, n] = r.useState(), i = r.useRef(null), a = r.useRef(e), o = r.useRef("none"), [s, c] = Vt(e ? "mounted" : "unmounted", {
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
		let e = Wt(i.current);
		o.current = s === "mounted" ? e : "none";
	}, [s]), J(() => {
		let t = i.current, n = a.current;
		if (n !== e) {
			let r = o.current, i = Wt(t);
			e ? c("MOUNT") : i === "none" || t?.display === "none" ? c("UNMOUNT") : c(n && r !== i ? "ANIMATION_OUT" : "UNMOUNT"), a.current = e;
		}
	}, [e, c]), J(() => {
		if (t) {
			let e, n = t.ownerDocument.defaultView ?? window, r = (r) => {
				let o = Wt(i.current).includes(CSS.escape(r.animationName));
				if (r.target === t && o && (c("ANIMATION_END"), !a.current)) {
					let r = t.style.animationFillMode;
					t.style.animationFillMode = "forwards", e = n.setTimeout(() => {
						t.style.animationFillMode === "forwards" && (t.style.animationFillMode = r);
					});
				}
			}, s = (e) => {
				e.target === t && (o.current = Wt(i.current));
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
function Wt(e) {
	return e?.animationName || "none";
}
function Gt(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-id/dist/index.mjs
var Kt = r.useId || (() => void 0), qt = 0;
function Jt(e) {
	let [t, n] = r.useState(Kt());
	return J(() => {
		e || n((e) => e ?? String(qt++));
	}, [e]), e || (t ? `radix-${t}` : "");
}
//#endregion
//#region node_modules/@radix-ui/react-direction/dist/index.mjs
var Yt = r.createContext(void 0);
function Xt(e) {
	let t = r.useContext(Yt);
	return e || t || "ltr";
}
//#endregion
//#region node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
function Zt(e) {
	let t = r.useRef(e);
	return r.useEffect(() => {
		t.current = e;
	}), r.useMemo(() => (...e) => t.current?.(...e), []);
}
//#endregion
//#region node_modules/@radix-ui/react-use-escape-keydown/dist/index.mjs
function Qt(e, t = globalThis?.document) {
	let n = Zt(e);
	r.useEffect(() => {
		let e = (e) => {
			e.key === "Escape" && n(e);
		};
		return t.addEventListener("keydown", e, { capture: !0 }), () => t.removeEventListener("keydown", e, { capture: !0 });
	}, [n, t]);
}
//#endregion
//#region node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var $t = "DismissableLayer", en = "dismissableLayer.update", tn = "dismissableLayer.pointerDownOutside", nn = "dismissableLayer.focusOutside", rn, an = r.createContext({
	layers: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), on = r.forwardRef((e, t) => {
	let { disableOutsidePointerEvents: n = !1, onEscapeKeyDown: i, onPointerDownOutside: a, onFocusOutside: o, onInteractOutside: s, onDismiss: c, ...l } = e, u = r.useContext(an), [d, f] = r.useState(null), p = d?.ownerDocument ?? globalThis?.document, [, m] = r.useState({}), h = G(t, (e) => f(e)), _ = Array.from(u.layers), [v] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1), y = _.indexOf(v), b = d ? _.indexOf(d) : -1, x = u.layersWithOutsidePointerEventsDisabled.size > 0, S = b >= y, C = ln((e) => {
		let t = e.target, n = [...u.branches].some((e) => e.contains(t));
		!S || n || (a?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p), w = un((e) => {
		let t = e.target;
		[...u.branches].some((e) => e.contains(t)) || (o?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p);
	return Qt((e) => {
		b === u.layers.size - 1 && (i?.(e), !e.defaultPrevented && c && (e.preventDefault(), c()));
	}, p), r.useEffect(() => {
		if (d) return n && (u.layersWithOutsidePointerEventsDisabled.size === 0 && (rn = p.body.style.pointerEvents, p.body.style.pointerEvents = "none"), u.layersWithOutsidePointerEventsDisabled.add(d)), u.layers.add(d), dn(), () => {
			n && u.layersWithOutsidePointerEventsDisabled.size === 1 && (p.body.style.pointerEvents = rn);
		};
	}, [
		d,
		p,
		n,
		u
	]), r.useEffect(() => () => {
		d && (u.layers.delete(d), u.layersWithOutsidePointerEventsDisabled.delete(d), dn());
	}, [d, u]), r.useEffect(() => {
		let e = () => m({});
		return document.addEventListener(en, e), () => document.removeEventListener(en, e);
	}, []), /* @__PURE__ */ g(K.div, {
		...l,
		ref: h,
		style: {
			pointerEvents: x ? S ? "auto" : "none" : void 0,
			...e.style
		},
		onFocusCapture: q(e.onFocusCapture, w.onFocusCapture),
		onBlurCapture: q(e.onBlurCapture, w.onBlurCapture),
		onPointerDownCapture: q(e.onPointerDownCapture, C.onPointerDownCapture)
	});
});
on.displayName = $t;
var sn = "DismissableLayerBranch", cn = r.forwardRef((e, t) => {
	let n = r.useContext(an), i = r.useRef(null), a = G(t, i);
	return r.useEffect(() => {
		let e = i.current;
		if (e) return n.branches.add(e), () => {
			n.branches.delete(e);
		};
	}, [n.branches]), /* @__PURE__ */ g(K.div, {
		...e,
		ref: a
	});
});
cn.displayName = sn;
function ln(e, t = globalThis?.document) {
	let n = Zt(e), i = r.useRef(!1), a = r.useRef(() => {});
	return r.useEffect(() => {
		let e = (e) => {
			if (e.target && !i.current) {
				let r = function() {
					fn(tn, n, i, { discrete: !0 });
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
function un(e, t = globalThis?.document) {
	let n = Zt(e), i = r.useRef(!1);
	return r.useEffect(() => {
		let e = (e) => {
			e.target && !i.current && fn(nn, n, { originalEvent: e }, { discrete: !1 });
		};
		return t.addEventListener("focusin", e), () => t.removeEventListener("focusin", e);
	}, [t, n]), {
		onFocusCapture: () => i.current = !0,
		onBlurCapture: () => i.current = !1
	};
}
function dn() {
	let e = new CustomEvent(en);
	document.dispatchEvent(e);
}
function fn(e, t, n, { discrete: r }) {
	let i = n.originalEvent.target, a = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && i.addEventListener(e, t, { once: !0 }), r ? wt(i, a) : i.dispatchEvent(a);
}
//#endregion
//#region node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var pn = "focusScope.autoFocusOnMount", mn = "focusScope.autoFocusOnUnmount", hn = {
	bubbles: !1,
	cancelable: !0
}, gn = "FocusScope", _n = r.forwardRef((e, t) => {
	let { loop: n = !1, trapped: i = !1, onMountAutoFocus: a, onUnmountAutoFocus: o, ...s } = e, [c, l] = r.useState(null), u = Zt(a), d = Zt(o), f = r.useRef(null), p = G(t, (e) => l(e)), m = r.useRef({
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
				c.contains(t) ? f.current = t : wn(f.current, { select: !0 });
			}, t = function(e) {
				if (m.paused || !c) return;
				let t = e.relatedTarget;
				t !== null && (c.contains(t) || wn(f.current, { select: !0 }));
			}, n = function(e) {
				if (document.activeElement === document.body) for (let t of e) t.removedNodes.length > 0 && wn(c);
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
			Tn.add(m);
			let e = document.activeElement;
			if (!c.contains(e)) {
				let t = new CustomEvent(pn, hn);
				c.addEventListener(pn, u), c.dispatchEvent(t), t.defaultPrevented || (vn(On(bn(c)), { select: !0 }), document.activeElement === e && wn(c));
			}
			return () => {
				c.removeEventListener(pn, u), setTimeout(() => {
					let t = new CustomEvent(mn, hn);
					c.addEventListener(mn, d), c.dispatchEvent(t), t.defaultPrevented || wn(e ?? document.body, { select: !0 }), c.removeEventListener(mn, d), Tn.remove(m);
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
			let t = e.currentTarget, [i, a] = yn(t);
			i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n && wn(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n && wn(a, { select: !0 })) : r === t && e.preventDefault();
		}
	}, [
		n,
		i,
		m.paused
	]);
	return /* @__PURE__ */ g(K.div, {
		tabIndex: -1,
		...s,
		ref: p,
		onKeyDown: h
	});
});
_n.displayName = gn;
function vn(e, { select: t = !1 } = {}) {
	let n = document.activeElement;
	for (let r of e) if (wn(r, { select: t }), document.activeElement !== n) return;
}
function yn(e) {
	let t = bn(e);
	return [xn(t, e), xn(t.reverse(), e)];
}
function bn(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t;
}
function xn(e, t) {
	for (let n of e) if (!Sn(n, { upTo: t })) return n;
}
function Sn(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function Cn(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function wn(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = document.activeElement;
		e.focus({ preventScroll: !0 }), e !== n && Cn(e) && t && e.select();
	}
}
var Tn = En();
function En() {
	let e = [];
	return {
		add(t) {
			let n = e[0];
			t !== n && n?.pause(), e = Dn(e, t), e.unshift(t);
		},
		remove(t) {
			e = Dn(e, t), e[0]?.resume();
		}
	};
}
function Dn(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
function On(e) {
	return e.filter((e) => e.tagName !== "A");
}
//#endregion
//#region node_modules/@radix-ui/react-portal/dist/index.mjs
var kn = "Portal", An = r.forwardRef((e, t) => {
	let { container: n, ...i } = e, [a, o] = r.useState(!1);
	J(() => o(!0), []);
	let s = n || a && globalThis?.document?.body;
	return s ? y.createPortal(/* @__PURE__ */ g(K.div, {
		...i,
		ref: t
	}), s) : null;
});
An.displayName = kn;
//#endregion
//#region node_modules/@radix-ui/react-focus-guards/dist/index.mjs
var jn = 0;
function Mn() {
	r.useEffect(() => {
		let e = document.querySelectorAll("[data-radix-focus-guard]");
		return document.body.insertAdjacentElement("afterbegin", e[0] ?? Nn()), document.body.insertAdjacentElement("beforeend", e[1] ?? Nn()), jn++, () => {
			jn === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((e) => e.remove()), jn--;
		};
	}, []);
}
function Nn() {
	let e = document.createElement("span");
	return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
//#endregion
//#region node_modules/tslib/tslib.es6.mjs
var Pn = function() {
	return Pn = Object.assign || function(e) {
		for (var t, n = 1, r = arguments.length; n < r; n++) for (var i in t = arguments[n], t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
		return e;
	}, Pn.apply(this, arguments);
};
function Fn(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
function In(e, t, n) {
	if (n || arguments.length === 2) for (var r = 0, i = t.length, a; r < i; r++) (a || !(r in t)) && (a || (a = Array.prototype.slice.call(t, 0, r)), a[r] = t[r]);
	return e.concat(a || Array.prototype.slice.call(t));
}
//#endregion
//#region node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var Ln = "right-scroll-bar-position", Rn = "width-before-scroll-bar", zn = "with-scroll-bars-hidden", Bn = "--removed-body-scroll-bar-size";
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/assignRef.js
function Vn(e, t) {
	return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/useRef.js
function Hn(e, t) {
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
var Un = typeof window < "u" ? r.useLayoutEffect : r.useEffect, Wn = /* @__PURE__ */ new WeakMap();
function Gn(e, t) {
	var n = Hn(t || null, function(t) {
		return e.forEach(function(e) {
			return Vn(e, t);
		});
	});
	return Un(function() {
		var t = Wn.get(n);
		if (t) {
			var r = new Set(t), i = new Set(e), a = n.current;
			r.forEach(function(e) {
				i.has(e) || Vn(e, null);
			}), i.forEach(function(e) {
				r.has(e) || Vn(e, a);
			});
		}
		Wn.set(n, e);
	}, [e]), n;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/medium.js
function Kn(e) {
	return e;
}
function qn(e, t) {
	t === void 0 && (t = Kn);
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
function Jn(e) {
	e === void 0 && (e = {});
	var t = qn(null);
	return t.options = Pn({
		async: !0,
		ssr: !1
	}, e), t;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/exports.js
var Yn = function(e) {
	var t = e.sideCar, n = Fn(e, ["sideCar"]);
	if (!t) throw Error("Sidecar: please provide `sideCar` property to import the right car");
	var i = t.read();
	if (!i) throw Error("Sidecar medium not found");
	return r.createElement(i, Pn({}, n));
};
Yn.isSideCarExport = !0;
function Xn(e, t) {
	return e.useMedium(t), Yn;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/medium.js
var Zn = Jn(), Qn = function() {}, $n = r.forwardRef(function(e, t) {
	var n = r.useRef(null), i = r.useState({
		onScrollCapture: Qn,
		onWheelCapture: Qn,
		onTouchMoveCapture: Qn
	}), a = i[0], o = i[1], s = e.forwardProps, c = e.children, l = e.className, u = e.removeScrollBar, d = e.enabled, f = e.shards, p = e.sideCar, m = e.noRelative, h = e.noIsolation, g = e.inert, _ = e.allowPinchZoom, v = e.as, y = v === void 0 ? "div" : v, b = e.gapMode, x = Fn(e, [
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
	]), S = p, C = Gn([n, t]), w = Pn(Pn({}, x), a);
	return r.createElement(r.Fragment, null, d && r.createElement(S, {
		sideCar: Zn,
		removeScrollBar: u,
		shards: f,
		noRelative: m,
		noIsolation: h,
		inert: g,
		setCallbacks: o,
		allowPinchZoom: !!_,
		lockRef: n,
		gapMode: b
	}), s ? r.cloneElement(r.Children.only(c), Pn(Pn({}, w), { ref: C })) : r.createElement(y, Pn({}, w, {
		className: l,
		ref: C
	}), c));
});
$n.defaultProps = {
	enabled: !0,
	removeScrollBar: !0,
	inert: !1
}, $n.classNames = {
	fullWidth: Rn,
	zeroRight: Ln
};
//#endregion
//#region node_modules/get-nonce/dist/es2015/index.js
var er, tr = function() {
	if (er) return er;
	if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
//#endregion
//#region node_modules/react-style-singleton/dist/es2015/singleton.js
function nr() {
	if (!document) return null;
	var e = document.createElement("style");
	e.type = "text/css";
	var t = tr();
	return t && e.setAttribute("nonce", t), e;
}
function rr(e, t) {
	e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function ir(e) {
	(document.head || document.getElementsByTagName("head")[0]).appendChild(e);
}
var ar = function() {
	var e = 0, t = null;
	return {
		add: function(n) {
			e == 0 && (t = nr()) && (rr(t, n), ir(t)), e++;
		},
		remove: function() {
			e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
		}
	};
}, or = function() {
	var e = ar();
	return function(t, n) {
		r.useEffect(function() {
			return e.add(t), function() {
				e.remove();
			};
		}, [t && n]);
	};
}, sr = function() {
	var e = or();
	return function(t) {
		var n = t.styles, r = t.dynamic;
		return e(n, r), null;
	};
}, cr = {
	left: 0,
	top: 0,
	right: 0,
	gap: 0
}, lr = function(e) {
	return parseInt(e || "", 10) || 0;
}, ur = function(e) {
	var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
	return [
		lr(n),
		lr(r),
		lr(i)
	];
}, dr = function(e) {
	if (e === void 0 && (e = "margin"), typeof window > "u") return cr;
	var t = ur(e), n = document.documentElement.clientWidth, r = window.innerWidth;
	return {
		left: t[0],
		top: t[1],
		right: t[2],
		gap: Math.max(0, r - n + t[2] - t[0])
	};
}, fr = sr(), pr = "data-scroll-locked", mr = function(e, t, n, r) {
	var i = e.left, a = e.top, o = e.right, s = e.gap;
	return n === void 0 && (n = "margin"), `
  .${zn} {
   overflow: hidden ${r};
   padding-right: ${s}px ${r};
  }
  body[${pr}] {
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
  
  .${Ln} {
    right: ${s}px ${r};
  }
  
  .${Rn} {
    margin-right: ${s}px ${r};
  }
  
  .${Ln} .${Ln} {
    right: 0 ${r};
  }
  
  .${Rn} .${Rn} {
    margin-right: 0 ${r};
  }
  
  body[${pr}] {
    ${Bn}: ${s}px;
  }
`;
}, hr = function() {
	var e = parseInt(document.body.getAttribute("data-scroll-locked") || "0", 10);
	return isFinite(e) ? e : 0;
}, gr = function() {
	r.useEffect(function() {
		return document.body.setAttribute(pr, (hr() + 1).toString()), function() {
			var e = hr() - 1;
			e <= 0 ? document.body.removeAttribute(pr) : document.body.setAttribute(pr, e.toString());
		};
	}, []);
}, _r = function(e) {
	var t = e.noRelative, n = e.noImportant, i = e.gapMode, a = i === void 0 ? "margin" : i;
	gr();
	var o = r.useMemo(function() {
		return dr(a);
	}, [a]);
	return r.createElement(fr, { styles: mr(o, !t, a, n ? "" : "!important") });
}, vr = !1;
if (typeof window < "u") try {
	var yr = Object.defineProperty({}, "passive", { get: function() {
		return vr = !0, !0;
	} });
	window.addEventListener("test", yr, yr), window.removeEventListener("test", yr, yr);
} catch {
	vr = !1;
}
var br = vr ? { passive: !1 } : !1, xr = function(e) {
	return e.tagName === "TEXTAREA";
}, Sr = function(e, t) {
	if (!(e instanceof Element)) return !1;
	var n = window.getComputedStyle(e);
	return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !xr(e) && n[t] === "visible");
}, Cr = function(e) {
	return Sr(e, "overflowY");
}, wr = function(e) {
	return Sr(e, "overflowX");
}, Tr = function(e, t) {
	var n = t.ownerDocument, r = t;
	do {
		if (typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host), Or(e, r)) {
			var i = kr(e, r);
			if (i[1] > i[2]) return !0;
		}
		r = r.parentNode;
	} while (r && r !== n.body);
	return !1;
}, Er = function(e) {
	return [
		e.scrollTop,
		e.scrollHeight,
		e.clientHeight
	];
}, Dr = function(e) {
	return [
		e.scrollLeft,
		e.scrollWidth,
		e.clientWidth
	];
}, Or = function(e, t) {
	return e === "v" ? Cr(t) : wr(t);
}, kr = function(e, t) {
	return e === "v" ? Er(t) : Dr(t);
}, Ar = function(e, t) {
	return e === "h" && t === "rtl" ? -1 : 1;
}, jr = function(e, t, n, r, i) {
	var a = Ar(e, window.getComputedStyle(t).direction), o = a * r, s = n.target, c = t.contains(s), l = !1, u = o > 0, d = 0, f = 0;
	do {
		if (!s) break;
		var p = kr(e, s), m = p[0], h = p[1] - p[2] - a * m;
		(m || h) && Or(e, s) && (d += h, f += m);
		var g = s.parentNode;
		s = g && g.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? g.host : g;
	} while (!c && s !== document.body || c && (t.contains(s) || t === s));
	return (u && (i && Math.abs(d) < 1 || !i && o > d) || !u && (i && Math.abs(f) < 1 || !i && -o > f)) && (l = !0), l;
}, Mr = function(e) {
	return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, Nr = function(e) {
	return [e.deltaX, e.deltaY];
}, Pr = function(e) {
	return e && "current" in e ? e.current : e;
}, Fr = function(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}, Ir = function(e) {
	return `
  .block-interactivity-${e} {pointer-events: none;}
  .allow-interactivity-${e} {pointer-events: all;}
`;
}, Lr = 0, Rr = [];
function zr(e) {
	var t = r.useRef([]), n = r.useRef([0, 0]), i = r.useRef(), a = r.useState(Lr++)[0], o = r.useState(sr)[0], s = r.useRef(e);
	r.useEffect(function() {
		s.current = e;
	}, [e]), r.useEffect(function() {
		if (e.inert) {
			document.body.classList.add(`block-interactivity-${a}`);
			var t = In([e.lockRef.current], (e.shards || []).map(Pr), !0).filter(Boolean);
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
		var r = Mr(e), a = n.current, o = "deltaX" in e ? e.deltaX : a[0] - r[0], c = "deltaY" in e ? e.deltaY : a[1] - r[1], l, u = e.target, d = Math.abs(o) > Math.abs(c) ? "h" : "v";
		if ("touches" in e && d === "h" && u.type === "range") return !1;
		var f = window.getSelection(), p = f && f.anchorNode;
		if (p && (p === u || p.contains(u))) return !1;
		var m = Tr(d, u);
		if (!m) return !0;
		if (m ? l = d : (l = d === "v" ? "h" : "v", m = Tr(d, u)), !m) return !1;
		if (!i.current && "changedTouches" in e && (o || c) && (i.current = l), !l) return !0;
		var h = i.current || l;
		return jr(h, t, e, h === "h" ? o : c, !0);
	}, []), l = r.useCallback(function(e) {
		var n = e;
		if (!(!Rr.length || Rr[Rr.length - 1] !== o)) {
			var r = "deltaY" in n ? Nr(n) : Mr(n), i = t.current.filter(function(e) {
				return e.name === n.type && (e.target === n.target || n.target === e.shadowParent) && Fr(e.delta, r);
			})[0];
			if (i && i.should) {
				n.cancelable && n.preventDefault();
				return;
			}
			if (!i) {
				var a = (s.current.shards || []).map(Pr).filter(Boolean).filter(function(e) {
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
			shadowParent: Br(r)
		};
		t.current.push(a), setTimeout(function() {
			t.current = t.current.filter(function(e) {
				return e !== a;
			});
		}, 1);
	}, []), d = r.useCallback(function(e) {
		n.current = Mr(e), i.current = void 0;
	}, []), f = r.useCallback(function(t) {
		u(t.type, Nr(t), t.target, c(t, e.lockRef.current));
	}, []), p = r.useCallback(function(t) {
		u(t.type, Mr(t), t.target, c(t, e.lockRef.current));
	}, []);
	r.useEffect(function() {
		return Rr.push(o), e.setCallbacks({
			onScrollCapture: f,
			onWheelCapture: f,
			onTouchMoveCapture: p
		}), document.addEventListener("wheel", l, br), document.addEventListener("touchmove", l, br), document.addEventListener("touchstart", d, br), function() {
			Rr = Rr.filter(function(e) {
				return e !== o;
			}), document.removeEventListener("wheel", l, br), document.removeEventListener("touchmove", l, br), document.removeEventListener("touchstart", d, br);
		};
	}, []);
	var m = e.removeScrollBar, h = e.inert;
	return r.createElement(r.Fragment, null, h ? r.createElement(o, { styles: Ir(a) }) : null, m ? r.createElement(_r, {
		noRelative: e.noRelative,
		gapMode: e.gapMode
	}) : null);
}
function Br(e) {
	for (var t = null; e !== null;) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
	return t;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/sidecar.js
var Vr = Xn(Zn, zr), Hr = r.forwardRef(function(e, t) {
	return r.createElement($n, Pn({}, e, {
		ref: t,
		sideCar: Vr
	}));
});
Hr.classNames = $n.classNames;
//#endregion
//#region src/lib/remove-scroll-gate.tsx
var Ur = r.createContext(!1);
function Wr({ allowBodyScroll: e, children: t }) {
	return /* @__PURE__ */ g(Ur.Provider, {
		value: e,
		children: t
	});
}
function Gr() {
	return r.useContext(Ur);
}
//#endregion
//#region src/lib/react-remove-scroll-shim.tsx
var Kr = r.forwardRef(function(e, t) {
	let n = Gr() ? !1 : e.enabled !== !1;
	return /* @__PURE__ */ g(Hr, {
		...e,
		ref: t,
		enabled: n
	});
});
Kr.classNames = Hr.classNames;
//#endregion
//#region node_modules/aria-hidden/dist/es2015/index.js
var qr = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, Jr = /* @__PURE__ */ new WeakMap(), Yr = /* @__PURE__ */ new WeakMap(), Xr = {}, Zr = 0, Qr = function(e) {
	return e && (e.host || Qr(e.parentNode));
}, $r = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = Qr(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, ei = function(e, t, n, r) {
	var i = $r(t, Array.isArray(e) ? e : [e]);
	Xr[n] || (Xr[n] = /* @__PURE__ */ new WeakMap());
	var a = Xr[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		!e || s.has(e) || (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		!e || c.has(e) || Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (Jr.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				Jr.set(e, c), a.set(e, l), o.push(e), c === 1 && i && Yr.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), Zr++, function() {
		o.forEach(function(e) {
			var t = Jr.get(e) - 1, i = a.get(e) - 1;
			Jr.set(e, t), a.set(e, i), t || (Yr.has(e) || e.removeAttribute(r), Yr.delete(e)), i || e.removeAttribute(n);
		}), Zr--, Zr || (Jr = /* @__PURE__ */ new WeakMap(), Jr = /* @__PURE__ */ new WeakMap(), Yr = /* @__PURE__ */ new WeakMap(), Xr = {});
	};
}, ti = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || qr(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), ei(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function ni(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function ri(e) {
	let [t, n] = r.useState(void 0);
	return J(() => {
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
var ii = "Checkbox", [ai, oi] = Ot(ii), [si, ci] = ai(ii);
function li(e) {
	let { __scopeCheckbox: t, checked: n, children: i, defaultChecked: a, disabled: o, form: s, name: c, onCheckedChange: l, required: u, value: d = "on", internal_do_not_use_render: f } = e, [p, m] = Rt({
		prop: n,
		defaultProp: a ?? !1,
		onChange: l,
		caller: ii
	}), [h, _] = r.useState(null), [v, y] = r.useState(null), b = r.useRef(!1), x = h ? !!s || !!h.closest("form") : !0, S = {
		checked: p,
		disabled: o,
		setChecked: m,
		control: h,
		setControl: _,
		name: c,
		form: s,
		value: d,
		hasConsumerStoppedPropagationRef: b,
		required: u,
		defaultChecked: vi(a) ? !1 : a,
		isFormControl: x,
		bubbleInput: v,
		setBubbleInput: y
	};
	return /* @__PURE__ */ g(si, {
		scope: t,
		...S,
		children: _i(f) ? f(S) : i
	});
}
var ui = "CheckboxTrigger", di = r.forwardRef(({ __scopeCheckbox: e, onKeyDown: t, onClick: n, ...i }, a) => {
	let { control: o, value: s, disabled: c, checked: l, required: u, setControl: d, setChecked: f, hasConsumerStoppedPropagationRef: p, isFormControl: m, bubbleInput: h } = ci(ui, e), _ = G(a, d), v = r.useRef(l);
	return r.useEffect(() => {
		let e = o?.form;
		if (e) {
			let t = () => f(v.current);
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [o, f]), /* @__PURE__ */ g(K.button, {
		type: "button",
		role: "checkbox",
		"aria-checked": vi(l) ? "mixed" : l,
		"aria-required": u,
		"data-state": yi(l),
		"data-disabled": c ? "" : void 0,
		disabled: c,
		value: s,
		...i,
		ref: _,
		onKeyDown: q(t, (e) => {
			e.key === "Enter" && e.preventDefault();
		}),
		onClick: q(n, (e) => {
			f((e) => vi(e) ? !0 : !e), h && m && (p.current = e.isPropagationStopped(), p.current || e.stopPropagation());
		})
	});
});
di.displayName = ui;
var fi = r.forwardRef((e, t) => {
	let { __scopeCheckbox: n, name: r, checked: i, defaultChecked: a, required: o, disabled: s, value: c, onCheckedChange: l, form: u, ...d } = e;
	return /* @__PURE__ */ g(li, {
		__scopeCheckbox: n,
		checked: i,
		defaultChecked: a,
		disabled: s,
		required: o,
		onCheckedChange: l,
		name: r,
		form: u,
		value: c,
		internal_do_not_use_render: ({ isFormControl: e }) => /* @__PURE__ */ _(h, { children: [/* @__PURE__ */ g(di, {
			...d,
			ref: t,
			__scopeCheckbox: n
		}), e && /* @__PURE__ */ g(gi, { __scopeCheckbox: n })] })
	});
});
fi.displayName = ii;
var pi = "CheckboxIndicator", mi = r.forwardRef((e, t) => {
	let { __scopeCheckbox: n, forceMount: r, ...i } = e, a = ci(pi, n);
	return /* @__PURE__ */ g(Ht, {
		present: r || vi(a.checked) || a.checked === !0,
		children: /* @__PURE__ */ g(K.span, {
			"data-state": yi(a.checked),
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
mi.displayName = pi;
var hi = "CheckboxBubbleInput", gi = r.forwardRef(({ __scopeCheckbox: e, ...t }, n) => {
	let { control: i, hasConsumerStoppedPropagationRef: a, checked: o, defaultChecked: s, required: c, disabled: l, name: u, value: d, form: f, bubbleInput: p, setBubbleInput: m } = ci(hi, e), h = G(n, m), _ = ni(o), v = ri(i);
	r.useEffect(() => {
		let e = p;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, n = Object.getOwnPropertyDescriptor(t, "checked").set, r = !a.current;
		if (_ !== o && n) {
			let t = new Event("click", { bubbles: r });
			e.indeterminate = vi(o), n.call(e, vi(o) ? !1 : o), e.dispatchEvent(t);
		}
	}, [
		p,
		_,
		o,
		a
	]);
	let y = r.useRef(vi(o) ? !1 : o);
	return /* @__PURE__ */ g(K.input, {
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
			...v,
			position: "absolute",
			pointerEvents: "none",
			opacity: 0,
			margin: 0,
			transform: "translateX(-100%)"
		}
	});
});
gi.displayName = hi;
function _i(e) {
	return typeof e == "function";
}
function vi(e) {
	return e === "indeterminate";
}
function yi(e) {
	return vi(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
//#endregion
//#region node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var bi = [
	"top",
	"right",
	"bottom",
	"left"
], xi = Math.min, Y = Math.max, Si = Math.round, Ci = Math.floor, wi = (e) => ({
	x: e,
	y: e
}), Ti = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function Ei(e, t, n) {
	return Y(e, xi(t, n));
}
function Di(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function Oi(e) {
	return e.split("-")[0];
}
function ki(e) {
	return e.split("-")[1];
}
function Ai(e) {
	return e === "x" ? "y" : "x";
}
function ji(e) {
	return e === "y" ? "height" : "width";
}
function Mi(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function Ni(e) {
	return Ai(Mi(e));
}
function Pi(e, t, n) {
	n === void 0 && (n = !1);
	let r = ki(e), i = Ni(e), a = ji(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = Ui(o)), [o, Ui(o)];
}
function Fi(e) {
	let t = Ui(e);
	return [
		Ii(e),
		t,
		Ii(t)
	];
}
function Ii(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var Li = ["left", "right"], Ri = ["right", "left"], zi = ["top", "bottom"], Bi = ["bottom", "top"];
function Vi(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? Ri : Li : t ? Li : Ri;
		case "left":
		case "right": return t ? zi : Bi;
		default: return [];
	}
}
function Hi(e, t, n, r) {
	let i = ki(e), a = Vi(Oi(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(Ii)))), a;
}
function Ui(e) {
	let t = Oi(e);
	return Ti[t] + e.slice(t.length);
}
function Wi(e) {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...e
	};
}
function Gi(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : Wi(e);
}
function Ki(e) {
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
function qi(e, t, n) {
	let { reference: r, floating: i } = e, a = Mi(t), o = Ni(t), s = ji(o), c = Oi(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	switch (ki(t)) {
		case "start":
			p[o] -= f * (n && l ? -1 : 1);
			break;
		case "end":
			p[o] += f * (n && l ? -1 : 1);
			break;
	}
	return p;
}
async function Ji(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = Di(t, e), p = Gi(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = Ki(await i.getClippingRect({
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
	}, y = Ki(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var Yi = 50, Xi = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: Ji
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = qi(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < Yi && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = qi(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, Zi = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = Di(e, t) || {};
		if (l == null) return {};
		let d = Gi(u), f = {
			x: n,
			y: r
		}, p = Ni(i), m = ji(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = xi(d[_], T), D = xi(d[v], T), O = E, k = C - h[m] - D, A = C / 2 - h[m] / 2 + w, j = Ei(O, A, k), M = !c.arrow && ki(i) != null && A !== j && a.reference[m] / 2 - (A < O ? E : D) - h[m] / 2 < 0, N = M ? A < O ? A - O : A - k : 0;
		return {
			[p]: f[p] + N,
			data: {
				[p]: j,
				centerOffset: A - j - N,
				...M && { alignmentOffset: N }
			},
			reset: M
		};
	}
}), Qi = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = Di(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = Oi(r), _ = Mi(o), v = Oi(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [Ui(o)] : Fi(o)), x = p !== "none";
			!d && x && b.push(...Hi(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = Pi(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (!(u === "alignment" && _ !== Mi(t)) || T.every((e) => Mi(e.placement) === _ ? e.overflows[0] > 0 : !0))) return {
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
								let t = Mi(e.placement);
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
function $i(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function ea(e) {
	return bi.some((t) => e[t] >= 0);
}
var ta = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = Di(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = $i(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: ea(e)
					} };
				}
				case "escaped": {
					let e = $i(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: ea(e)
					} };
				}
				default: return {};
			}
		}
	};
}, na = /* @__PURE__ */ new Set(["left", "top"]);
async function ra(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = Oi(n), s = ki(n), c = Mi(n) === "y", l = na.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = Di(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var ia = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await ra(t, e);
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
}, aa = function(e) {
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
			} }, ...l } = Di(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = Mi(Oi(i)), p = Ai(f), m = u[p], h = u[f];
			if (o) {
				let e = p === "y" ? "top" : "left", t = p === "y" ? "bottom" : "right", n = m + d[e], r = m - d[t];
				m = Ei(n, m, r);
			}
			if (s) {
				let e = f === "y" ? "top" : "left", t = f === "y" ? "bottom" : "right", n = h + d[e], r = h - d[t];
				h = Ei(n, h, r);
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
}, oa = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = Di(e, t), u = {
				x: n,
				y: r
			}, d = Mi(i), f = Ai(d), p = u[f], m = u[d], h = Di(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = na.has(Oi(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, sa = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			var n, r;
			let { placement: i, rects: a, platform: o, elements: s } = t, { apply: c = () => {}, ...l } = Di(e, t), u = await o.detectOverflow(t, l), d = Oi(i), f = ki(i), p = Mi(i) === "y", { width: m, height: h } = a.floating, g, _;
			d === "top" || d === "bottom" ? (g = d, _ = f === (await (o.isRTL == null ? void 0 : o.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (_ = d, g = f === "end" ? "top" : "bottom");
			let v = h - u.top - u.bottom, y = m - u.left - u.right, b = xi(h - u[g], v), x = xi(m - u[_], y), S = !t.middlewareData.shift, C = b, w = x;
			if ((n = t.middlewareData.shift) != null && n.enabled.x && (w = y), (r = t.middlewareData.shift) != null && r.enabled.y && (C = v), S && !f) {
				let e = Y(u.left, 0), t = Y(u.right, 0), n = Y(u.top, 0), r = Y(u.bottom, 0);
				p ? w = m - 2 * (e !== 0 || t !== 0 ? e + t : Y(u.left, u.right)) : C = h - 2 * (n !== 0 || r !== 0 ? n + r : Y(u.top, u.bottom));
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
function ca() {
	return typeof window < "u";
}
function la(e) {
	return da(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function X(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function ua(e) {
	return ((da(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function da(e) {
	return ca() ? e instanceof Node || e instanceof X(e).Node : !1;
}
function Z(e) {
	return ca() ? e instanceof Element || e instanceof X(e).Element : !1;
}
function fa(e) {
	return ca() ? e instanceof HTMLElement || e instanceof X(e).HTMLElement : !1;
}
function pa(e) {
	return !ca() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof X(e).ShadowRoot;
}
function ma(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = Q(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function ha(e) {
	return /^(table|td|th)$/.test(la(e));
}
function ga(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var _a = /transform|translate|scale|rotate|perspective|filter/, va = /paint|layout|strict|content/, ya = (e) => !!e && e !== "none", ba;
function xa(e) {
	let t = Z(e) ? Q(e) : e;
	return ya(t.transform) || ya(t.translate) || ya(t.scale) || ya(t.rotate) || ya(t.perspective) || !Ca() && (ya(t.backdropFilter) || ya(t.filter)) || _a.test(t.willChange || "") || va.test(t.contain || "");
}
function Sa(e) {
	let t = Ea(e);
	for (; fa(t) && !wa(t);) {
		if (xa(t)) return t;
		if (ga(t)) return null;
		t = Ea(t);
	}
	return null;
}
function Ca() {
	return ba ?? (ba = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), ba;
}
function wa(e) {
	return /^(html|body|#document)$/.test(la(e));
}
function Q(e) {
	return X(e).getComputedStyle(e);
}
function Ta(e) {
	return Z(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function Ea(e) {
	if (la(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || pa(e) && e.host || ua(e);
	return pa(t) ? t.host : t;
}
function Da(e) {
	let t = Ea(e);
	return wa(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : fa(t) && ma(t) ? t : Da(t);
}
function Oa(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = Da(e), i = r === e.ownerDocument?.body, a = X(r);
	if (i) {
		let e = ka(a);
		return t.concat(a, a.visualViewport || [], ma(r) ? r : [], e && n ? Oa(e) : []);
	} else return t.concat(r, Oa(r, [], n));
}
function ka(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function Aa(e) {
	let t = Q(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = fa(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = Si(n) !== a || Si(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function ja(e) {
	return Z(e) ? e : e.contextElement;
}
function Ma(e) {
	let t = ja(e);
	if (!fa(t)) return wi(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = Aa(t), o = (a ? Si(n.width) : n.width) / r, s = (a ? Si(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var Na = /* @__PURE__ */ wi(0);
function Pa(e) {
	let t = X(e);
	return !Ca() || !t.visualViewport ? Na : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function Fa(e, t, n) {
	return t === void 0 && (t = !1), !n || t && n !== X(e) ? !1 : t;
}
function Ia(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = ja(e), o = wi(1);
	t && (r ? Z(r) && (o = Ma(r)) : o = Ma(e));
	let s = Fa(a, n, r) ? Pa(a) : wi(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a) {
		let e = X(a), t = r && Z(r) ? X(r) : r, n = e, i = ka(n);
		for (; i && r && t !== n;) {
			let e = Ma(i), t = i.getBoundingClientRect(), r = Q(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = X(i), i = ka(n);
		}
	}
	return Ki({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function La(e, t) {
	let n = Ta(e).scrollLeft;
	return t ? t.left + n : Ia(ua(e)).left + n;
}
function Ra(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - La(e, n),
		y: n.top + t.scrollTop
	};
}
function za(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = ua(r), s = t ? ga(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = wi(1), u = wi(0), d = fa(r);
	if ((d || !d && !a) && ((la(r) !== "body" || ma(o)) && (c = Ta(r)), d)) {
		let e = Ia(r);
		l = Ma(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? Ra(o, c) : wi(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function Ba(e) {
	return Array.from(e.getClientRects());
}
function Va(e) {
	let t = ua(e), n = Ta(e), r = e.ownerDocument.body, i = Y(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), a = Y(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight), o = -n.scrollLeft + La(e), s = -n.scrollTop;
	return Q(r).direction === "rtl" && (o += Y(t.clientWidth, r.clientWidth) - i), {
		width: i,
		height: a,
		x: o,
		y: s
	};
}
var Ha = 25;
function Ua(e, t) {
	let n = X(e), r = ua(e), i = n.visualViewport, a = r.clientWidth, o = r.clientHeight, s = 0, c = 0;
	if (i) {
		a = i.width, o = i.height;
		let e = Ca();
		(!e || e && t === "fixed") && (s = i.offsetLeft, c = i.offsetTop);
	}
	let l = La(r);
	if (l <= 0) {
		let e = r.ownerDocument, t = e.body, n = getComputedStyle(t), i = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, o = Math.abs(r.clientWidth - t.clientWidth - i);
		o <= Ha && (a -= o);
	} else l <= Ha && (a += l);
	return {
		width: a,
		height: o,
		x: s,
		y: c
	};
}
function Wa(e, t) {
	let n = Ia(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = fa(e) ? Ma(e) : wi(1);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function Ga(e, t, n) {
	let r;
	if (t === "viewport") r = Ua(e, n);
	else if (t === "document") r = Va(ua(e));
	else if (Z(t)) r = Wa(t, n);
	else {
		let n = Pa(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return Ki(r);
}
function Ka(e, t) {
	let n = Ea(e);
	return n === t || !Z(n) || wa(n) ? !1 : Q(n).position === "fixed" || Ka(n, t);
}
function qa(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = Oa(e, [], !1).filter((e) => Z(e) && la(e) !== "body"), i = null, a = Q(e).position === "fixed", o = a ? Ea(e) : e;
	for (; Z(o) && !wa(o);) {
		let t = Q(o), n = xa(o);
		!n && t.position === "fixed" && (i = null), (a ? !n && !i : !n && t.position === "static" && i && (i.position === "absolute" || i.position === "fixed") || ma(o) && !n && Ka(e, o)) ? r = r.filter((e) => e !== o) : i = t, o = Ea(o);
	}
	return t.set(e, r), r;
}
function Ja(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? ga(t) ? [] : qa(t, this._c) : [].concat(n), r], o = Ga(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = Ga(t, a[e], i);
		s = Y(n.top, s), c = xi(n.right, c), l = xi(n.bottom, l), u = Y(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function Ya(e) {
	let { width: t, height: n } = Aa(e);
	return {
		width: t,
		height: n
	};
}
function Xa(e, t, n) {
	let r = fa(t), i = ua(t), a = n === "fixed", o = Ia(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = wi(0);
	function l() {
		c.x = La(i);
	}
	if (r || !r && !a) if ((la(t) !== "body" || ma(i)) && (s = Ta(t)), r) {
		let e = Ia(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	} else i && l();
	a && !r && i && l();
	let u = i && !r && !a ? Ra(i, s) : wi(0);
	return {
		x: o.left + s.scrollLeft - c.x - u.x,
		y: o.top + s.scrollTop - c.y - u.y,
		width: o.width,
		height: o.height
	};
}
function Za(e) {
	return Q(e).position === "static";
}
function Qa(e, t) {
	if (!fa(e) || Q(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return ua(e) === n && (n = n.ownerDocument.body), n;
}
function $a(e, t) {
	let n = X(e);
	if (ga(e)) return n;
	if (!fa(e)) {
		let t = Ea(e);
		for (; t && !wa(t);) {
			if (Z(t) && !Za(t)) return t;
			t = Ea(t);
		}
		return n;
	}
	let r = Qa(e, t);
	for (; r && ha(r) && Za(r);) r = Qa(r, t);
	return r && wa(r) && Za(r) && !xa(r) ? n : r || Sa(e) || n;
}
var eo = async function(e) {
	let t = this.getOffsetParent || $a, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: Xa(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function to(e) {
	return Q(e).direction === "rtl";
}
var no = {
	convertOffsetParentRelativeRectToViewportRelativeRect: za,
	getDocumentElement: ua,
	getClippingRect: Ja,
	getOffsetParent: $a,
	getElementRects: eo,
	getClientRects: Ba,
	getDimensions: Ya,
	getScale: Ma,
	isElement: Z,
	isRTL: to
};
function ro(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function io(e, t) {
	let n = null, r, i = ua(e);
	function a() {
		var e;
		clearTimeout(r), (e = n) == null || e.disconnect(), n = null;
	}
	function o(s, c) {
		s === void 0 && (s = !1), c === void 0 && (c = 1), a();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (s || t(), !f || !p) return;
		let m = Ci(d), h = Ci(i.clientWidth - (u + f)), g = Ci(i.clientHeight - (d + p)), _ = Ci(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: Y(0, xi(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (n !== c) {
				if (!y) return o();
				n ? o(!1, n) : r = setTimeout(() => {
					o(!1, 1e-7);
				}, 1e3);
			}
			n === 1 && !ro(l, e.getBoundingClientRect()) && o(), y = !1;
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
function ao(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = ja(e), u = i || a ? [...l ? Oa(l) : [], ...t ? Oa(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n, { passive: !0 }), a && e.addEventListener("resize", n);
	});
	let d = l && s ? io(l, n) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? Ia(e) : null;
	c && g();
	function g() {
		let t = Ia(e);
		h && !ro(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var oo = ia, so = aa, co = Qi, lo = sa, uo = ta, fo = Zi, po = oa, mo = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = {
		platform: no,
		...n
	}, a = {
		...i.platform,
		_c: r
	};
	return Xi(e, t, {
		...i,
		platform: a
	});
}, ho = typeof document < "u" ? u : function() {};
function go(e, t) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (typeof e == "function" && e.toString() === t.toString()) return !0;
	let n, r, i;
	if (e && t && typeof e == "object") {
		if (Array.isArray(e)) {
			if (n = e.length, n !== t.length) return !1;
			for (r = n; r-- !== 0;) if (!go(e[r], t[r])) return !1;
			return !0;
		}
		if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length) return !1;
		for (r = n; r-- !== 0;) if (!{}.hasOwnProperty.call(t, i[r])) return !1;
		for (r = n; r-- !== 0;) {
			let n = i[r];
			if (!(n === "_owner" && e.$$typeof) && !go(e[n], t[n])) return !1;
		}
		return !0;
	}
	return e !== e && t !== t;
}
function _o(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function vo(e, t) {
	let n = _o(e);
	return Math.round(t * n) / n;
}
function yo(e) {
	let t = r.useRef(e);
	return ho(() => {
		t.current = e;
	}), t;
}
function bo(e) {
	e === void 0 && (e = {});
	let { placement: t = "bottom", strategy: n = "absolute", middleware: i = [], platform: a, elements: { reference: o, floating: s } = {}, transform: c = !0, whileElementsMounted: l, open: u } = e, [d, f] = r.useState({
		x: 0,
		y: 0,
		strategy: n,
		placement: t,
		middlewareData: {},
		isPositioned: !1
	}), [p, m] = r.useState(i);
	go(p, i) || m(i);
	let [h, g] = r.useState(null), [_, y] = r.useState(null), b = r.useCallback((e) => {
		e !== w.current && (w.current = e, g(e));
	}, []), x = r.useCallback((e) => {
		e !== T.current && (T.current = e, y(e));
	}, []), S = o || h, C = s || _, w = r.useRef(null), T = r.useRef(null), E = r.useRef(d), D = l != null, O = yo(l), k = yo(a), A = yo(u), j = r.useCallback(() => {
		if (!w.current || !T.current) return;
		let e = {
			placement: t,
			strategy: n,
			middleware: p
		};
		k.current && (e.platform = k.current), mo(w.current, T.current, e).then((e) => {
			let t = {
				...e,
				isPositioned: A.current !== !1
			};
			M.current && !go(E.current, t) && (E.current = t, v.flushSync(() => {
				f(t);
			}));
		});
	}, [
		p,
		t,
		n,
		k,
		A
	]);
	ho(() => {
		u === !1 && E.current.isPositioned && (E.current.isPositioned = !1, f((e) => ({
			...e,
			isPositioned: !1
		})));
	}, [u]);
	let M = r.useRef(!1);
	ho(() => (M.current = !0, () => {
		M.current = !1;
	}), []), ho(() => {
		if (S && (w.current = S), C && (T.current = C), S && C) {
			if (O.current) return O.current(S, C, j);
			j();
		}
	}, [
		S,
		C,
		j,
		O,
		D
	]);
	let N = r.useMemo(() => ({
		reference: w,
		floating: T,
		setReference: b,
		setFloating: x
	}), [b, x]), P = r.useMemo(() => ({
		reference: S,
		floating: C
	}), [S, C]), F = r.useMemo(() => {
		let e = {
			position: n,
			left: 0,
			top: 0
		};
		if (!P.floating) return e;
		let t = vo(P.floating, d.x), r = vo(P.floating, d.y);
		return c ? {
			...e,
			transform: "translate(" + t + "px, " + r + "px)",
			..._o(P.floating) >= 1.5 && { willChange: "transform" }
		} : {
			position: n,
			left: t,
			top: r
		};
	}, [
		n,
		c,
		P.floating,
		d.x,
		d.y
	]);
	return r.useMemo(() => ({
		...d,
		update: j,
		refs: N,
		elements: P,
		floatingStyles: F
	}), [
		d,
		j,
		N,
		P,
		F
	]);
}
var xo = (e) => {
	function t(e) {
		return {}.hasOwnProperty.call(e, "current");
	}
	return {
		name: "arrow",
		options: e,
		fn(n) {
			let { element: r, padding: i } = typeof e == "function" ? e(n) : e;
			return r && t(r) ? r.current == null ? {} : fo({
				element: r.current,
				padding: i
			}).fn(n) : r ? fo({
				element: r,
				padding: i
			}).fn(n) : {};
		}
	};
}, So = (e, t) => {
	let n = oo(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Co = (e, t) => {
	let n = so(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, wo = (e, t) => ({
	fn: po(e).fn,
	options: [e, t]
}), To = (e, t) => {
	let n = co(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Eo = (e, t) => {
	let n = lo(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Do = (e, t) => {
	let n = uo(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Oo = (e, t) => {
	let n = xo(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, ko = "Arrow", Ao = r.forwardRef((e, t) => {
	let { children: n, width: r = 10, height: i = 5, ...a } = e;
	return /* @__PURE__ */ g(K.svg, {
		...a,
		ref: t,
		width: r,
		height: i,
		viewBox: "0 0 30 10",
		preserveAspectRatio: "none",
		children: e.asChild ? n : /* @__PURE__ */ g("polygon", { points: "0,0 30,0 15,10" })
	});
});
Ao.displayName = ko;
var jo = Ao, Mo = "Popper", [No, Po] = Ot(Mo), [Fo, Io] = No(Mo), Lo = (e) => {
	let { __scopePopper: t, children: n } = e, [i, a] = r.useState(null);
	return /* @__PURE__ */ g(Fo, {
		scope: t,
		anchor: i,
		onAnchorChange: a,
		children: n
	});
};
Lo.displayName = Mo;
var Ro = "PopperAnchor", zo = r.forwardRef((e, t) => {
	let { __scopePopper: n, virtualRef: i, ...a } = e, o = Io(Ro, n), s = r.useRef(null), c = G(t, s), l = r.useRef(null);
	return r.useEffect(() => {
		let e = l.current;
		l.current = i?.current || s.current, e !== l.current && o.onAnchorChange(l.current);
	}), i ? null : /* @__PURE__ */ g(K.div, {
		...a,
		ref: c
	});
});
zo.displayName = Ro;
var Bo = "PopperContent", [Vo, Ho] = No(Bo), Uo = r.forwardRef((e, t) => {
	let { __scopePopper: n, side: i = "bottom", sideOffset: a = 0, align: o = "center", alignOffset: s = 0, arrowPadding: c = 0, avoidCollisions: l = !0, collisionBoundary: u = [], collisionPadding: d = 0, sticky: f = "partial", hideWhenDetached: p = !1, updatePositionStrategy: m = "optimized", onPlaced: h, ..._ } = e, v = Io(Bo, n), [y, b] = r.useState(null), x = G(t, (e) => b(e)), [S, C] = r.useState(null), w = ri(S), T = w?.width ?? 0, E = w?.height ?? 0, D = i + (o === "center" ? "" : "-" + o), O = typeof d == "number" ? d : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...d
	}, k = Array.isArray(u) ? u : [u], A = k.length > 0, j = {
		padding: O,
		boundary: k.filter(qo),
		altBoundary: A
	}, { refs: M, floatingStyles: N, placement: P, isPositioned: F, middlewareData: I } = bo({
		strategy: "fixed",
		placement: D,
		whileElementsMounted: (...e) => ao(...e, { animationFrame: m === "always" }),
		elements: { reference: v.anchor },
		middleware: [
			So({
				mainAxis: a + E,
				alignmentAxis: s
			}),
			l && Co({
				mainAxis: !0,
				crossAxis: !1,
				limiter: f === "partial" ? wo() : void 0,
				...j
			}),
			l && To({ ...j }),
			Eo({
				...j,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--radix-popper-available-width", `${n}px`), o.setProperty("--radix-popper-available-height", `${r}px`), o.setProperty("--radix-popper-anchor-width", `${i}px`), o.setProperty("--radix-popper-anchor-height", `${a}px`);
				}
			}),
			S && Oo({
				element: S,
				padding: c
			}),
			Jo({
				arrowWidth: T,
				arrowHeight: E
			}),
			p && Do({
				strategy: "referenceHidden",
				...j
			})
		]
	}), [ee, te] = Yo(P), ne = Zt(h);
	J(() => {
		F && ne?.();
	}, [F, ne]);
	let re = I.arrow?.x, L = I.arrow?.y, R = I.arrow?.centerOffset !== 0, [ie, ae] = r.useState();
	return J(() => {
		y && ae(window.getComputedStyle(y).zIndex);
	}, [y]), /* @__PURE__ */ g("div", {
		ref: M.setFloating,
		"data-radix-popper-content-wrapper": "",
		style: {
			...N,
			transform: F ? N.transform : "translate(0, -200%)",
			minWidth: "max-content",
			zIndex: ie,
			"--radix-popper-transform-origin": [I.transformOrigin?.x, I.transformOrigin?.y].join(" "),
			...I.hide?.referenceHidden && {
				visibility: "hidden",
				pointerEvents: "none"
			}
		},
		dir: e.dir,
		children: /* @__PURE__ */ g(Vo, {
			scope: n,
			placedSide: ee,
			onArrowChange: C,
			arrowX: re,
			arrowY: L,
			shouldHideArrow: R,
			children: /* @__PURE__ */ g(K.div, {
				"data-side": ee,
				"data-align": te,
				..._,
				ref: x,
				style: {
					..._.style,
					animation: F ? void 0 : "none"
				}
			})
		})
	});
});
Uo.displayName = Bo;
var Wo = "PopperArrow", Go = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
}, Ko = r.forwardRef(function(e, t) {
	let { __scopePopper: n, ...r } = e, i = Ho(Wo, n), a = Go[i.placedSide];
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
		children: /* @__PURE__ */ g(jo, {
			...r,
			ref: t,
			style: {
				...r.style,
				display: "block"
			}
		})
	});
});
Ko.displayName = Wo;
function qo(e) {
	return e !== null;
}
var Jo = (e) => ({
	name: "transformOrigin",
	options: e,
	fn(t) {
		let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = Yo(n), u = {
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
function Yo(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
var Xo = Lo, Zo = zo, Qo = Uo, $o = Ko, es = "Label", ts = r.forwardRef((e, t) => /* @__PURE__ */ g(K.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
ts.displayName = es;
var ns = ts;
//#endregion
//#region node_modules/@radix-ui/number/dist/index.mjs
function rs(e, [t, n]) {
	return Math.min(n, Math.max(t, e));
}
//#endregion
//#region node_modules/@radix-ui/react-select/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function is(e) {
	let t = /* @__PURE__ */ as(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(ss);
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
function as(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = ls(n), a = cs(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? _t(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var os = Symbol("radix.slottable");
function ss(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === os;
}
function cs(e, t) {
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
function ls(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-select/dist/index.mjs
var us = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], ds = [" ", "Enter"], fs = "Select", [ps, ms, hs] = It(fs), [gs, _s] = Ot(fs, [hs, Po]), vs = Po(), [ys, bs] = gs(fs), [xs, Ss] = gs(fs), Cs = (e) => {
	let { __scopeSelect: t, children: n, open: i, defaultOpen: a, onOpenChange: o, value: s, defaultValue: c, onValueChange: l, dir: u, name: d, autoComplete: f, disabled: p, required: m, form: h } = e, v = vs(t), [y, b] = r.useState(null), [x, S] = r.useState(null), [C, w] = r.useState(!1), T = Xt(u), [E, D] = Rt({
		prop: i,
		defaultProp: a ?? !1,
		onChange: o,
		caller: fs
	}), [O, k] = Rt({
		prop: s,
		defaultProp: c,
		onChange: l,
		caller: fs
	}), A = r.useRef(null), j = y ? h || !!y.closest("form") : !0, [M, N] = r.useState(/* @__PURE__ */ new Set()), P = Array.from(M).map((e) => e.props.value).join(";");
	return /* @__PURE__ */ g(Xo, {
		...v,
		children: /* @__PURE__ */ _(ys, {
			required: m,
			scope: t,
			trigger: y,
			onTriggerChange: b,
			valueNode: x,
			onValueNodeChange: S,
			valueNodeHasChildren: C,
			onValueNodeHasChildrenChange: w,
			contentId: Jt(),
			value: O,
			onValueChange: k,
			open: E,
			onOpenChange: D,
			dir: T,
			triggerPointerDownPosRef: A,
			disabled: p,
			children: [/* @__PURE__ */ g(ps.Provider, {
				scope: t,
				children: /* @__PURE__ */ g(xs, {
					scope: e.__scopeSelect,
					onNativeOptionAdd: r.useCallback((e) => {
						N((t) => new Set(t).add(e));
					}, []),
					onNativeOptionRemove: r.useCallback((e) => {
						N((t) => {
							let n = new Set(t);
							return n.delete(e), n;
						});
					}, []),
					children: n
				})
			}), j ? /* @__PURE__ */ _(_c, {
				"aria-hidden": !0,
				required: m,
				tabIndex: -1,
				name: d,
				autoComplete: f,
				value: O,
				onChange: (e) => k(e.target.value),
				disabled: p,
				form: h,
				children: [O === void 0 ? /* @__PURE__ */ g("option", { value: "" }) : null, Array.from(M)]
			}, P) : null]
		})
	});
};
Cs.displayName = fs;
var ws = "SelectTrigger", Ts = r.forwardRef((e, t) => {
	let { __scopeSelect: n, disabled: i = !1, ...a } = e, o = vs(n), s = bs(ws, n), c = s.disabled || i, l = G(t, s.onTriggerChange), u = ms(n), d = r.useRef("touch"), [f, p, m] = yc((e) => {
		let t = u().filter((e) => !e.disabled), n = bc(t, e, t.find((e) => e.value === s.value));
		n !== void 0 && s.onValueChange(n.value);
	}), h = (e) => {
		c || (s.onOpenChange(!0), m()), e && (s.triggerPointerDownPosRef.current = {
			x: Math.round(e.pageX),
			y: Math.round(e.pageY)
		});
	};
	return /* @__PURE__ */ g(Zo, {
		asChild: !0,
		...o,
		children: /* @__PURE__ */ g(K.button, {
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
			"data-placeholder": vc(s.value) ? "" : void 0,
			...a,
			ref: l,
			onClick: q(a.onClick, (e) => {
				e.currentTarget.focus(), d.current !== "mouse" && h(e);
			}),
			onPointerDown: q(a.onPointerDown, (e) => {
				d.current = e.pointerType;
				let t = e.target;
				t.hasPointerCapture(e.pointerId) && t.releasePointerCapture(e.pointerId), e.button === 0 && e.ctrlKey === !1 && e.pointerType === "mouse" && (h(e), e.preventDefault());
			}),
			onKeyDown: q(a.onKeyDown, (e) => {
				let t = f.current !== "";
				!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && p(e.key), !(t && e.key === " ") && us.includes(e.key) && (h(), e.preventDefault());
			})
		})
	});
});
Ts.displayName = ws;
var Es = "SelectValue", Ds = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: r, style: i, children: a, placeholder: o = "", ...s } = e, c = bs(Es, n), { onValueNodeHasChildrenChange: l } = c, u = a !== void 0, d = G(t, c.onValueNodeChange);
	return J(() => {
		l(u);
	}, [l, u]), /* @__PURE__ */ g(K.span, {
		...s,
		ref: d,
		style: { pointerEvents: "none" },
		children: vc(c.value) ? /* @__PURE__ */ g(h, { children: o }) : a
	});
});
Ds.displayName = Es;
var Os = "SelectIcon", ks = r.forwardRef((e, t) => {
	let { __scopeSelect: n, children: r, ...i } = e;
	return /* @__PURE__ */ g(K.span, {
		"aria-hidden": !0,
		...i,
		ref: t,
		children: r || "▼"
	});
});
ks.displayName = Os;
var As = "SelectPortal", js = (e) => /* @__PURE__ */ g(An, {
	asChild: !0,
	...e
});
js.displayName = As;
var Ms = "SelectContent", Ns = r.forwardRef((e, t) => {
	let n = bs(Ms, e.__scopeSelect), [i, a] = r.useState();
	if (J(() => {
		a(new DocumentFragment());
	}, []), !n.open) {
		let t = i;
		return t ? v.createPortal(/* @__PURE__ */ g(Ps, {
			scope: e.__scopeSelect,
			children: /* @__PURE__ */ g(ps.Slot, {
				scope: e.__scopeSelect,
				children: /* @__PURE__ */ g("div", { children: e.children })
			})
		}), t) : null;
	}
	return /* @__PURE__ */ g(Rs, {
		...e,
		ref: t
	});
});
Ns.displayName = Ms;
var $ = 10, [Ps, Fs] = gs(Ms), Is = "SelectContentImpl", Ls = /* @__PURE__ */ is("SelectContent.RemoveScroll"), Rs = r.forwardRef((e, t) => {
	let { __scopeSelect: n, position: i = "item-aligned", onCloseAutoFocus: a, onEscapeKeyDown: o, onPointerDownOutside: s, side: c, sideOffset: l, align: u, alignOffset: d, arrowPadding: f, collisionBoundary: p, collisionPadding: m, sticky: h, hideWhenDetached: _, avoidCollisions: v, ...y } = e, b = bs(Ms, n), [x, S] = r.useState(null), [C, w] = r.useState(null), T = G(t, (e) => S(e)), [E, D] = r.useState(null), [O, k] = r.useState(null), A = ms(n), [j, M] = r.useState(!1), N = r.useRef(!1);
	r.useEffect(() => {
		if (x) return ti(x);
	}, [x]), Mn();
	let P = r.useCallback((e) => {
		let [t, ...n] = A().map((e) => e.ref.current), [r] = n.slice(-1), i = document.activeElement;
		for (let n of e) if (n === i || (n?.scrollIntoView({ block: "nearest" }), n === t && C && (C.scrollTop = 0), n === r && C && (C.scrollTop = C.scrollHeight), n?.focus(), document.activeElement !== i)) return;
	}, [A, C]), F = r.useCallback(() => P([E, x]), [
		P,
		E,
		x
	]);
	r.useEffect(() => {
		j && F();
	}, [j, F]);
	let { onOpenChange: I, triggerPointerDownPosRef: ee } = b;
	r.useEffect(() => {
		if (x) {
			let e = {
				x: 0,
				y: 0
			}, t = (t) => {
				e = {
					x: Math.abs(Math.round(t.pageX) - (ee.current?.x ?? 0)),
					y: Math.abs(Math.round(t.pageY) - (ee.current?.y ?? 0))
				};
			}, n = (n) => {
				e.x <= 10 && e.y <= 10 ? n.preventDefault() : x.contains(n.target) || I(!1), document.removeEventListener("pointermove", t), ee.current = null;
			};
			return ee.current !== null && (document.addEventListener("pointermove", t), document.addEventListener("pointerup", n, {
				capture: !0,
				once: !0
			})), () => {
				document.removeEventListener("pointermove", t), document.removeEventListener("pointerup", n, { capture: !0 });
			};
		}
	}, [
		x,
		I,
		ee
	]), r.useEffect(() => {
		let e = () => I(!1);
		return window.addEventListener("blur", e), window.addEventListener("resize", e), () => {
			window.removeEventListener("blur", e), window.removeEventListener("resize", e);
		};
	}, [I]);
	let [te, ne] = yc((e) => {
		let t = A().filter((e) => !e.disabled), n = bc(t, e, t.find((e) => e.ref.current === document.activeElement));
		n && setTimeout(() => n.ref.current.focus());
	}), re = r.useCallback((e, t, n) => {
		let r = !N.current && !n;
		(b.value !== void 0 && b.value === t || r) && (D(e), r && (N.current = !0));
	}, [b.value]), L = r.useCallback(() => x?.focus(), [x]), R = r.useCallback((e, t, n) => {
		let r = !N.current && !n;
		(b.value !== void 0 && b.value === t || r) && k(e);
	}, [b.value]), ie = i === "popper" ? Hs : Bs, ae = ie === Hs ? {
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
	return /* @__PURE__ */ g(Ps, {
		scope: n,
		content: x,
		viewport: C,
		onViewportChange: w,
		itemRefCallback: re,
		selectedItem: E,
		onItemLeave: L,
		itemTextRefCallback: R,
		focusSelectedItem: F,
		selectedItemText: O,
		position: i,
		isPositioned: j,
		searchRef: te,
		children: /* @__PURE__ */ g(Kr, {
			as: Ls,
			allowPinchZoom: !0,
			children: /* @__PURE__ */ g(_n, {
				asChild: !0,
				trapped: b.open,
				onMountAutoFocus: (e) => {
					e.preventDefault();
				},
				onUnmountAutoFocus: q(a, (e) => {
					b.trigger?.focus({ preventScroll: !0 }), e.preventDefault();
				}),
				children: /* @__PURE__ */ g(on, {
					asChild: !0,
					disableOutsidePointerEvents: !0,
					onEscapeKeyDown: o,
					onPointerDownOutside: s,
					onFocusOutside: (e) => e.preventDefault(),
					onDismiss: () => b.onOpenChange(!1),
					children: /* @__PURE__ */ g(ie, {
						role: "listbox",
						id: b.contentId,
						"data-state": b.open ? "open" : "closed",
						dir: b.dir,
						onContextMenu: (e) => e.preventDefault(),
						...y,
						...ae,
						onPlaced: () => M(!0),
						ref: T,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none",
							...y.style
						},
						onKeyDown: q(y.onKeyDown, (e) => {
							let t = e.ctrlKey || e.altKey || e.metaKey;
							if (e.key === "Tab" && e.preventDefault(), !t && e.key.length === 1 && ne(e.key), [
								"ArrowUp",
								"ArrowDown",
								"Home",
								"End"
							].includes(e.key)) {
								let t = A().filter((e) => !e.disabled).map((e) => e.ref.current);
								if (["ArrowUp", "End"].includes(e.key) && (t = t.slice().reverse()), ["ArrowUp", "ArrowDown"].includes(e.key)) {
									let n = e.target, r = t.indexOf(n);
									t = t.slice(r + 1);
								}
								setTimeout(() => P(t)), e.preventDefault();
							}
						})
					})
				})
			})
		})
	});
});
Rs.displayName = Is;
var zs = "SelectItemAlignedPosition", Bs = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onPlaced: i, ...a } = e, o = bs(Ms, n), s = Fs(Ms, n), [c, l] = r.useState(null), [u, d] = r.useState(null), f = G(t, (e) => d(e)), p = ms(n), m = r.useRef(!1), h = r.useRef(!0), { viewport: _, selectedItem: v, selectedItemText: y, focusSelectedItem: b } = s, x = r.useCallback(() => {
		if (o.trigger && o.valueNode && c && u && _ && v && y) {
			let e = o.trigger.getBoundingClientRect(), t = u.getBoundingClientRect(), n = o.valueNode.getBoundingClientRect(), r = y.getBoundingClientRect();
			if (o.dir !== "rtl") {
				let i = r.left - t.left, a = n.left - i, o = e.left - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - $, d = rs(a, [$, Math.max($, u - l)]);
				c.style.minWidth = s + "px", c.style.left = d + "px";
			} else {
				let i = t.right - r.right, a = window.innerWidth - n.right - i, o = window.innerWidth - e.right - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - $, d = rs(a, [$, Math.max($, u - l)]);
				c.style.minWidth = s + "px", c.style.right = d + "px";
			}
			let a = p(), s = window.innerHeight - $ * 2, l = _.scrollHeight, d = window.getComputedStyle(u), f = parseInt(d.borderTopWidth, 10), h = parseInt(d.paddingTop, 10), g = parseInt(d.borderBottomWidth, 10), b = parseInt(d.paddingBottom, 10), x = f + h + l + b + g, S = Math.min(v.offsetHeight * 5, x), C = window.getComputedStyle(_), w = parseInt(C.paddingTop, 10), T = parseInt(C.paddingBottom, 10), E = e.top + e.height / 2 - $, D = s - E, O = v.offsetHeight / 2, k = v.offsetTop + O, A = f + h + k, j = x - A;
			if (A <= E) {
				let e = a.length > 0 && v === a[a.length - 1].ref.current;
				c.style.bottom = "0px";
				let t = u.clientHeight - _.offsetTop - _.offsetHeight, n = A + Math.max(D, O + (e ? T : 0) + t + g);
				c.style.height = n + "px";
			} else {
				let e = a.length > 0 && v === a[0].ref.current;
				c.style.top = "0px";
				let t = Math.max(E, f + _.offsetTop + (e ? w : 0) + O) + j;
				c.style.height = t + "px", _.scrollTop = A - E + _.offsetTop;
			}
			c.style.margin = `${$}px 0`, c.style.minHeight = S + "px", c.style.maxHeight = s + "px", i?.(), requestAnimationFrame(() => m.current = !0);
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
	J(() => x(), [x]);
	let [S, C] = r.useState();
	return J(() => {
		u && C(window.getComputedStyle(u).zIndex);
	}, [u]), /* @__PURE__ */ g(Us, {
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
			children: /* @__PURE__ */ g(K.div, {
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
Bs.displayName = zs;
var Vs = "SelectPopperPosition", Hs = r.forwardRef((e, t) => {
	let { __scopeSelect: n, align: r = "start", collisionPadding: i = $, ...a } = e;
	return /* @__PURE__ */ g(Qo, {
		...vs(n),
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
Hs.displayName = Vs;
var [Us, Ws] = gs(Ms, {}), Gs = "SelectViewport", Ks = r.forwardRef((e, t) => {
	let { __scopeSelect: n, nonce: i, ...a } = e, o = Fs(Gs, n), s = Ws(Gs, n), c = G(t, o.onViewportChange), l = r.useRef(0);
	return /* @__PURE__ */ _(h, { children: [/* @__PURE__ */ g("style", {
		dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" },
		nonce: i
	}), /* @__PURE__ */ g(ps.Slot, {
		scope: n,
		children: /* @__PURE__ */ g(K.div, {
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
			onScroll: q(a.onScroll, (e) => {
				let t = e.currentTarget, { contentWrapper: n, shouldExpandOnScrollRef: r } = s;
				if (r?.current && n) {
					let e = Math.abs(l.current - t.scrollTop);
					if (e > 0) {
						let r = window.innerHeight - $ * 2, i = parseFloat(n.style.minHeight), a = parseFloat(n.style.height), o = Math.max(i, a);
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
Ks.displayName = Gs;
var qs = "SelectGroup", [Js, Ys] = gs(qs), Xs = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = Jt();
	return /* @__PURE__ */ g(Js, {
		scope: n,
		id: i,
		children: /* @__PURE__ */ g(K.div, {
			role: "group",
			"aria-labelledby": i,
			...r,
			ref: t
		})
	});
});
Xs.displayName = qs;
var Zs = "SelectLabel", Qs = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = Ys(Zs, n);
	return /* @__PURE__ */ g(K.div, {
		id: i.id,
		...r,
		ref: t
	});
});
Qs.displayName = Zs;
var $s = "SelectItem", [ec, tc] = gs($s), nc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, value: i, disabled: a = !1, textValue: o, ...s } = e, c = bs($s, n), l = Fs($s, n), u = c.value === i, [d, f] = r.useState(o ?? ""), [p, m] = r.useState(!1), h = G(t, (e) => l.itemRefCallback?.(e, i, a)), _ = Jt(), v = r.useRef("touch"), y = () => {
		a || (c.onValueChange(i), c.onOpenChange(!1));
	};
	if (i === "") throw Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
	return /* @__PURE__ */ g(ec, {
		scope: n,
		value: i,
		disabled: a,
		textId: _,
		isSelected: u,
		onItemTextChange: r.useCallback((e) => {
			f((t) => t || (e?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ g(ps.ItemSlot, {
			scope: n,
			value: i,
			disabled: a,
			textValue: d,
			children: /* @__PURE__ */ g(K.div, {
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
				onFocus: q(s.onFocus, () => m(!0)),
				onBlur: q(s.onBlur, () => m(!1)),
				onClick: q(s.onClick, () => {
					v.current !== "mouse" && y();
				}),
				onPointerUp: q(s.onPointerUp, () => {
					v.current === "mouse" && y();
				}),
				onPointerDown: q(s.onPointerDown, (e) => {
					v.current = e.pointerType;
				}),
				onPointerMove: q(s.onPointerMove, (e) => {
					v.current = e.pointerType, a ? l.onItemLeave?.() : v.current === "mouse" && e.currentTarget.focus({ preventScroll: !0 });
				}),
				onPointerLeave: q(s.onPointerLeave, (e) => {
					e.currentTarget === document.activeElement && l.onItemLeave?.();
				}),
				onKeyDown: q(s.onKeyDown, (e) => {
					l.searchRef?.current !== "" && e.key === " " || (ds.includes(e.key) && y(), e.key === " " && e.preventDefault());
				})
			})
		})
	});
});
nc.displayName = $s;
var rc = "SelectItemText", ic = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: i, style: a, ...o } = e, s = bs(rc, n), c = Fs(rc, n), l = tc(rc, n), u = Ss(rc, n), [d, f] = r.useState(null), p = G(t, (e) => f(e), l.onItemTextChange, (e) => c.itemTextRefCallback?.(e, l.value, l.disabled)), m = d?.textContent, y = r.useMemo(() => /* @__PURE__ */ g("option", {
		value: l.value,
		disabled: l.disabled,
		children: m
	}, l.value), [
		l.disabled,
		l.value,
		m
	]), { onNativeOptionAdd: b, onNativeOptionRemove: x } = u;
	return J(() => (b(y), () => x(y)), [
		b,
		x,
		y
	]), /* @__PURE__ */ _(h, { children: [/* @__PURE__ */ g(K.span, {
		id: l.textId,
		...o,
		ref: p
	}), l.isSelected && s.valueNode && !s.valueNodeHasChildren ? v.createPortal(o.children, s.valueNode) : null] });
});
ic.displayName = rc;
var ac = "SelectItemIndicator", oc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return tc(ac, n).isSelected ? /* @__PURE__ */ g(K.span, {
		"aria-hidden": !0,
		...r,
		ref: t
	}) : null;
});
oc.displayName = ac;
var sc = "SelectScrollUpButton", cc = r.forwardRef((e, t) => {
	let n = Fs(sc, e.__scopeSelect), i = Ws(sc, e.__scopeSelect), [a, o] = r.useState(!1), s = G(t, i.onScrollButtonChange);
	return J(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				o(t.scrollTop > 0);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ g(dc, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop -= t.offsetHeight);
		}
	}) : null;
});
cc.displayName = sc;
var lc = "SelectScrollDownButton", uc = r.forwardRef((e, t) => {
	let n = Fs(lc, e.__scopeSelect), i = Ws(lc, e.__scopeSelect), [a, o] = r.useState(!1), s = G(t, i.onScrollButtonChange);
	return J(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				let e = t.scrollHeight - t.clientHeight;
				o(Math.ceil(t.scrollTop) < e);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ g(dc, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop += t.offsetHeight);
		}
	}) : null;
});
uc.displayName = lc;
var dc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onAutoScroll: i, ...a } = e, o = Fs("SelectScrollButton", n), s = r.useRef(null), c = ms(n), l = r.useCallback(() => {
		s.current !== null && (window.clearInterval(s.current), s.current = null);
	}, []);
	return r.useEffect(() => () => l(), [l]), J(() => {
		c().find((e) => e.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
	}, [c]), /* @__PURE__ */ g(K.div, {
		"aria-hidden": !0,
		...a,
		ref: t,
		style: {
			flexShrink: 0,
			...a.style
		},
		onPointerDown: q(a.onPointerDown, () => {
			s.current === null && (s.current = window.setInterval(i, 50));
		}),
		onPointerMove: q(a.onPointerMove, () => {
			o.onItemLeave?.(), s.current === null && (s.current = window.setInterval(i, 50));
		}),
		onPointerLeave: q(a.onPointerLeave, () => {
			l();
		})
	});
}), fc = "SelectSeparator", pc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return /* @__PURE__ */ g(K.div, {
		"aria-hidden": !0,
		...r,
		ref: t
	});
});
pc.displayName = fc;
var mc = "SelectArrow", hc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = vs(n), a = bs(mc, n), o = Fs(mc, n);
	return a.open && o.position === "popper" ? /* @__PURE__ */ g($o, {
		...i,
		...r,
		ref: t
	}) : null;
});
hc.displayName = mc;
var gc = "SelectBubbleInput", _c = r.forwardRef(({ __scopeSelect: e, value: t, ...n }, i) => {
	let a = r.useRef(null), o = G(i, a), s = ni(t);
	return r.useEffect(() => {
		let e = a.current;
		if (!e) return;
		let n = window.HTMLSelectElement.prototype, r = Object.getOwnPropertyDescriptor(n, "value").set;
		if (s !== t && r) {
			let n = new Event("change", { bubbles: !0 });
			r.call(e, t), e.dispatchEvent(n);
		}
	}, [s, t]), /* @__PURE__ */ g(K.select, {
		...n,
		style: {
			...Tt,
			...n.style
		},
		ref: o,
		defaultValue: t
	});
});
_c.displayName = gc;
function vc(e) {
	return e === "" || e === void 0;
}
function yc(e) {
	let t = Zt(e), n = r.useRef(""), i = r.useRef(0), a = r.useCallback((e) => {
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
function bc(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = xc(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.textValue.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
function xc(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
var Sc = Cs, Cc = Ts, wc = Ds, Tc = ks, Ec = js, Dc = Ns, Oc = Ks, kc = nc, Ac = ic, jc = oc, Mc = cc, Nc = uc;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function Pc(e) {
	let t = /* @__PURE__ */ Ic(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Rc);
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
var Fc = /* @__PURE__ */ Pc("Slot");
/* @__NO_SIDE_EFFECTS__ */
function Ic(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Bc(n), a = zc(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? _t(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Lc = Symbol("radix.slottable");
function Rc(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Lc;
}
function zc(e, t) {
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
function Bc(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region src/components/ui/button.tsx
var Vc = ht("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
function Hc({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ g(r ? Fc : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: W(Vc({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/components/ui/input.tsx
function Uc({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ g("input", {
		type: t,
		"data-slot": "input",
		className: W("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function Wc({ className: e, ...t }) {
	return /* @__PURE__ */ g(ns, {
		"data-slot": "label",
		className: W("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var Gc = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), Kc = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), qc = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), Jc = (e) => {
	let t = qc(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, Yc = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, Xc = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, Zc = a({}), Qc = () => c(Zc), $c = s(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: a, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = Qc() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return o("svg", {
		ref: l,
		...Yc,
		width: t ?? u ?? Yc.width,
		height: t ?? u ?? Yc.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: Gc("lucide", m, i),
		...!a && !Xc(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => o(e, t)), ...Array.isArray(a) ? a : [a]]);
}), el = (e, t) => {
	let n = s(({ className: n, ...r }, i) => o($c, {
		ref: i,
		iconNode: t,
		className: Gc(`lucide-${Kc(Jc(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = Jc(e), n;
}, tl = el("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]), nl = el("chevron-down", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]), rl = el("chevron-up", [["path", {
	d: "m18 15-6-6-6 6",
	key: "153udz"
}]]);
//#endregion
//#region src/hooks/use-text-direction.ts
function il() {
	let { i18n: e } = f();
	return e.dir() === "rtl" ? "rtl" : "ltr";
}
//#endregion
//#region src/components/ui/select.tsx
function al({ ...e }) {
	return /* @__PURE__ */ g(Sc, {
		"data-slot": "select",
		...e
	});
}
function ol({ ...e }) {
	return /* @__PURE__ */ g(wc, {
		"data-slot": "select-value",
		...e
	});
}
function sl({ className: e, size: t = "default", children: n, ...r }) {
	return /* @__PURE__ */ _(Cc, {
		"data-slot": "select-trigger",
		"data-size": t,
		dir: il(),
		className: W("flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap text-start shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", e),
		...r,
		children: [n, /* @__PURE__ */ g(Tc, {
			asChild: !0,
			children: /* @__PURE__ */ g(nl, { className: "size-4 opacity-50" })
		})]
	});
}
function cl({ className: e, children: t, position: n = "popper", align: r = "start", ...i }) {
	return /* @__PURE__ */ g(Wr, {
		allowBodyScroll: !0,
		children: /* @__PURE__ */ g(Ec, { children: /* @__PURE__ */ _(Dc, {
			"data-slot": "select-content",
			dir: il(),
			className: W("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-start text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", e),
			position: n,
			align: r,
			...i,
			children: [
				/* @__PURE__ */ g(ul, {}),
				/* @__PURE__ */ g(Oc, {
					className: W("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
					children: t
				}),
				/* @__PURE__ */ g(dl, {})
			]
		}) })
	});
}
function ll({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ _(kc, {
		"data-slot": "select-item",
		className: W("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pe-8 ps-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", e),
		...n,
		children: [/* @__PURE__ */ g("span", {
			"data-slot": "select-item-indicator",
			className: "absolute end-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ g(jc, { children: /* @__PURE__ */ g(tl, { className: "size-4" }) })
		}), /* @__PURE__ */ g(Ac, { children: t })]
	});
}
function ul({ className: e, ...t }) {
	return /* @__PURE__ */ g(Mc, {
		"data-slot": "select-scroll-up-button",
		className: W("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ g(rl, { className: "size-4" })
	});
}
function dl({ className: e, ...t }) {
	return /* @__PURE__ */ g(Nc, {
		"data-slot": "select-scroll-down-button",
		className: W("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ g(nl, { className: "size-4" })
	});
}
//#endregion
//#region src/lib/marketplace-api.ts
function fl(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function pl(e) {
	"@babel/helpers - typeof";
	return pl = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, pl(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function ml(e, t) {
	if (pl(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (pl(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function hl(e) {
	var t = ml(e, "string");
	return pl(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function gl(e, t, n) {
	return (t = hl(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/lib/apiError.ts
var _l = class extends Error {
	constructor(e, t) {
		super(e), gl(this, "code", void 0), gl(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, vl = {
	invalid: "errors.api.invalid",
	forbidden: "errors.api.forbidden",
	not_found: "errors.api.notFound",
	invalid_role: "errors.api.invalidRole",
	forbidden_role: "errors.api.forbiddenRole",
	invalid_nonce: "errors.api.invalidNonce",
	timeout: "errors.api.timeout",
	empty_reply: "errors.api.emptyReply",
	transport: "errors.api.transport",
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
function yl(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function bl(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function xl(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(fl(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function Sl(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return xl(e, n);
	if (t instanceof _l && t.code) {
		let n = vl[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = vl[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return yl(n) ? e("errors.api.timeout") : bl(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function Cl(e, t) {
	m.error(Sl(e, t));
}
//#endregion
//#region src/lib/safeUrl.ts
function wl(e) {
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
function Tl() {
	return window.webinoDashboard;
}
var El = 3e4;
function Dl(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function Ol(e) {
	let t = Tl();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (Dl(e) || wl(e)) return e;
	throw new _l("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function kl(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function Al(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : null;
}
function jl(e, t) {
	let n = e.toLowerCase();
	return e.includes("Upstream Error") || e.includes("Forbidden") || t === 403 ? "admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry" : n.includes("timed out") || n.includes("timeout") || t === 504 || t === 524 ? "Request timed out — RSA-4096 generation can take over a minute on weak hosts" : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? `Invalid AJAX response (HTML, HTTP ${t || 0})` : `Invalid AJAX response (HTTP ${t || 0})`;
}
async function Ml(e, t, n = {}) {
	let r = Al(e), i = Tl();
	if (!r || !i.ajaxUrl) throw new _l("AJAX fallback unavailable", {
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
	let { signal: l, clear: u } = kl({}, t);
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
			throw new _l(jl(t, e.status), {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!n.success) throw new _l(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
			code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
			status: e.status
		});
		return n.data;
	} finally {
		u();
	}
}
async function Nl(e, t = {}, n = El) {
	if (Al(e) && Tl().ajaxUrl) return Ml(e, n, t);
	let r = Ol(e), i = Tl(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce);
	let { signal: s, clear: c } = kl(t, n);
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
			throw new _l(n.includes("Upstream Error") || n.includes("Forbidden") ? "REST blocked by CDN/WAF — use admin-ajax fallback or whitelist /wp-json/" : "Invalid JSON response", {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i;
			throw new _l(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
		}
		return i;
	} catch (e) {
		throw e instanceof _l ? e : e instanceof DOMException && e.name === "AbortError" ? new _l("Request timed out", {
			code: "timeout",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region ../Modules/wallet-gateway-module/client/pages/WalletAccountPage.tsx
function Pl() {
	let { t: r, i18n: i } = f(), a = n(), [o, s] = d(""), [c, u] = d(""), [h, v] = d("wallet"), y = t({
		queryKey: ["account", "wallet"],
		queryFn: () => Nl("account/wallet")
	}).data;
	l(() => {
		y?.refund_method && v(y.refund_method);
	}, [y?.refund_method]);
	let b = e({
		mutationFn: async () => Nl("account/wallet/topup", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ amount: Number(o) })
		}),
		onSuccess: (e) => {
			e.payment_url && (window.location.href = e.payment_url);
		},
		onError: (e) => Cl(r, e)
	}), x = e({
		mutationFn: async () => Nl("account/wallet/withdraw", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ amount: Number(c) })
		}),
		onSuccess: async () => {
			m.success(r("common.saved")), u(""), await a.invalidateQueries({ queryKey: ["account", "wallet"] });
		},
		onError: (e) => Cl(r, e)
	}), S = e({
		mutationFn: async (e) => Nl("account/wallet/prefs", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refund_method: e })
		}),
		onSuccess: () => m.success(r("common.saved")),
		onError: (e) => Cl(r, e)
	}), C = h;
	return /* @__PURE__ */ g(ft, {
		title: r("wallet.accountTitle"),
		subtitle: r("wallet.accountSubtitle"),
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
						children: /* @__PURE__ */ g(dt, {
							amount: y.balance,
							currency: "IRT",
							locale: i.language
						})
					})]
				}),
				/* @__PURE__ */ _("section", {
					className: "grid gap-3 rounded-xl border border-border p-4",
					children: [
						/* @__PURE__ */ g(Wc, { children: r("wallet.topup") }),
						/* @__PURE__ */ g(Uc, {
							type: "number",
							min: y.min_topup ?? 1e3,
							value: o,
							onChange: (e) => s(e.target.value)
						}),
						/* @__PURE__ */ g("p", {
							className: "text-muted-foreground text-xs",
							children: r("wallet.minTopupHint", { amount: y.min_topup ?? 1e3 })
						}),
						/* @__PURE__ */ g(Hc, {
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
						/* @__PURE__ */ g(Wc, { children: r("wallet.withdraw") }),
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
									to: "/account",
									children: r("wallet.editProfile")
								})
							]
						}),
						/* @__PURE__ */ g(Uc, {
							type: "number",
							min: y.min_withdraw ?? 1e4,
							value: c,
							onChange: (e) => u(e.target.value)
						}),
						/* @__PURE__ */ g(Hc, {
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
					children: [/* @__PURE__ */ g(Wc, { children: r("wallet.refundMethod") }), /* @__PURE__ */ _(al, {
						value: C,
						onValueChange: (e) => {
							v(e), S.mutateAsync(e);
						},
						children: [/* @__PURE__ */ g(sl, { children: /* @__PURE__ */ g(ol, {}) }), /* @__PURE__ */ _(cl, { children: [/* @__PURE__ */ g(ll, {
							value: "wallet",
							children: r("wallet.refundWallet")
						}), /* @__PURE__ */ g(ll, {
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
										children: [e.direction === "debit" ? "−" : "+", /* @__PURE__ */ g(dt, {
											amount: e.amount,
											currency: "IRT",
											locale: i.language
										})]
									}),
									/* @__PURE__ */ g("td", {
										className: "px-2 py-2",
										children: /* @__PURE__ */ g(dt, {
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
//#region src/components/ui/checkbox.tsx
function Fl({ className: e, ...t }) {
	return /* @__PURE__ */ g(fi, {
		"data-slot": "checkbox",
		className: W("peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary", e),
		...t,
		children: /* @__PURE__ */ g(mi, {
			"data-slot": "checkbox-indicator",
			className: "grid place-content-center text-current transition-none",
			children: /* @__PURE__ */ g(tl, { className: "size-3.5" })
		})
	});
}
//#endregion
//#region ../Modules/wallet-gateway-module/client/pages/WalletSettingsPage.tsx
function Il() {
	let { t: r } = f(), i = n(), [a, o] = d(null), s = t({
		queryKey: ["wallet", "settings"],
		queryFn: () => Nl("wallet/settings")
	});
	l(() => {
		s.data?.settings && o(s.data.settings);
	}, [s.data]);
	let c = e({
		mutationFn: async () => Nl("wallet/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(a)
		}),
		onSuccess: async (e) => {
			m.success(r("common.saved")), e.settings && o(e.settings), await i.invalidateQueries({ queryKey: ["wallet", "settings"] }), await i.invalidateQueries({ queryKey: ["payment-gateways"] }), await i.invalidateQueries({ queryKey: ["payments-hub"] });
		},
		onError: (e) => Cl(r, e)
	});
	return /* @__PURE__ */ g(ft, {
		title: r("wallet.title"),
		subtitle: r("wallet.subtitle"),
		children: a ? /* @__PURE__ */ _("div", {
			className: "grid max-w-xl gap-4",
			children: [
				/* @__PURE__ */ _("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ g(Fl, {
						id: "wallet-enabled",
						checked: a.enabled,
						onCheckedChange: (e) => o({
							...a,
							enabled: e === !0
						})
					}), /* @__PURE__ */ g(Wc, {
						htmlFor: "wallet-enabled",
						children: r("wallet.enabled")
					})]
				}),
				/* @__PURE__ */ _("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ g(Wc, { children: r("wallet.checkoutTitle") }), /* @__PURE__ */ g(Uc, {
						value: a.title,
						onChange: (e) => o({
							...a,
							title: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ _("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ g(Wc, { children: r("wallet.minTopup") }), /* @__PURE__ */ g(Uc, {
						type: "number",
						min: 1,
						value: a.min_topup,
						onChange: (e) => o({
							...a,
							min_topup: Number(e.target.value) || 1
						})
					})]
				}),
				/* @__PURE__ */ g("div", { children: /* @__PURE__ */ g(Hc, {
					type: "button",
					disabled: c.isPending,
					onClick: () => void c.mutateAsync(),
					children: r("common.save")
				}) })
			]
		}) : /* @__PURE__ */ g("p", {
			className: "text-muted-foreground text-sm",
			children: r("common.loading")
		})
	});
}
//#endregion
//#region ../Modules/wallet-gateway-module/client/pages/WalletWithdrawalsPage.tsx
function Ll() {
	let { t: r, i18n: i } = f(), a = n(), o = t({
		queryKey: ["wallet", "withdrawals"],
		queryFn: () => Nl("shop/wallet-withdrawals?status=pending")
	}), s = e({
		mutationFn: async (e) => Nl("shop/wallet-withdrawals", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(e)
		}),
		onSuccess: async () => {
			m.success(r("common.saved")), await a.invalidateQueries({ queryKey: ["wallet", "withdrawals"] });
		},
		onError: (e) => Cl(r, e)
	}), c = o.data?.items ?? [];
	return /* @__PURE__ */ g(ft, {
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
						/* @__PURE__ */ g("p", { children: /* @__PURE__ */ g(dt, {
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
						/* @__PURE__ */ g(Hc, {
							type: "button",
							disabled: s.isPending,
							onClick: () => void s.mutateAsync({
								id: e.id,
								status: "approved"
							}),
							children: r("wallet.approve")
						}),
						/* @__PURE__ */ g(Hc, {
							type: "button",
							variant: "secondary",
							disabled: s.isPending,
							onClick: () => void s.mutateAsync({
								id: e.id,
								status: "paid"
							}),
							children: r("wallet.markPaid")
						}),
						/* @__PURE__ */ g(Hc, {
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
var Rl = {
	"settings/shop/wallet": Il,
	"shop/wallet-withdrawals": Ll,
	"account/wallet": Pl
}, zl = { routes: Rl };
//#endregion
export { zl as default, Rl as routes };
