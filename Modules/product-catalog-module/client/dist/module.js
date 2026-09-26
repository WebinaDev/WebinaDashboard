import { useMutation as e, useQuery as t, useQueryClient as n } from "@tanstack/react-query";
import * as r from "react";
import { createContext as i, createElement as a, forwardRef as o, useContext as s, useEffect as c, useRef as l, useState as u } from "react";
import { Link as d } from "react-router-dom";
import { useTranslation as f } from "react-i18next";
import { toast as p } from "sonner";
import "react-dom";
import { jsx as m, jsxs as h } from "react/jsx-runtime";
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var g = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), _ = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), v = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), y = (e) => {
	let t = v(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, b = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, x = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, S = i({}), C = () => s(S), w = o(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: o, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = C() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return a("svg", {
		ref: l,
		...b,
		width: t ?? u ?? b.width,
		height: t ?? u ?? b.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: g("lucide", m, i),
		...!o && !x(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => a(e, t)), ...Array.isArray(o) ? o : [o]]);
}), T = (e, t) => {
	let n = o(({ className: n, ...r }, i) => a(w, {
		ref: i,
		iconNode: t,
		className: g(`lucide-${_(y(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = y(e), n;
}, ee = T("loader-circle", [["path", {
	d: "M21 12a9 9 0 1 1-6.219-8.56",
	key: "13zald"
}]]), te = T("search", [["path", {
	d: "m21 21-4.34-4.34",
	key: "14j7rj"
}], ["circle", {
	cx: "11",
	cy: "11",
	r: "8",
	key: "4ej97u"
}]]);
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function E(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") if (Array.isArray(e)) {
		var i = e.length;
		for (t = 0; t < i; t++) e[t] && (n = E(e[t])) && (r && (r += " "), r += n);
	} else for (n in e) e[n] && (r && (r += " "), r += n);
	return r;
}
function D() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = E(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/class-variance-authority/dist/index.mjs
var O = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, k = D, A = (e, t) => (n) => {
	if (t?.variants == null) return k(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = O(t) || O(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return k(e, a, t?.compoundVariants?.reduce((e, t) => {
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
function j(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function ne(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = j(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : j(e[t], null);
			}
		};
	};
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function re(e) {
	let t = /* @__PURE__ */ M(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(ae);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ m(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ m(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function M(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = se(n), a = oe(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? ne(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var ie = Symbol("radix.slottable");
function ae(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === ie;
}
function oe(e, t) {
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
function se(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/dist/index.mjs
var N = [
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
	let n = /* @__PURE__ */ re(`Primitive.${t}`), i = r.forwardRef((e, r) => {
		let { asChild: i, ...a } = e, o = i ? n : t;
		return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ m(o, {
			...a,
			ref: r
		});
	});
	return i.displayName = `Primitive.${t}`, {
		...e,
		[t]: i
	};
}, {}), P = "Label", F = r.forwardRef((e, t) => /* @__PURE__ */ m(N.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
F.displayName = P;
var ce = F;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function I(e) {
	let t = /* @__PURE__ */ L(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(ue);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ m(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ m(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
var le = /* @__PURE__ */ I("Slot");
/* @__NO_SIDE_EFFECTS__ */
function L(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = de(n), a = z(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? ne(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var R = Symbol("radix.slottable");
function ue(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === R;
}
function z(e, t) {
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
function de(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/tailwind-merge/dist/bundle-mjs.mjs
var fe = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, pe = (e, t) => ({
	classGroupId: e,
	validator: t
}), me = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), he = "-", ge = [], _e = "arbitrary..", ve = (e) => {
	let t = xe(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return be(e);
			let n = e.split(he);
			return ye(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? fe(i, t) : t : i || ge;
			}
			return n[e] || ge;
		}
	};
}, ye = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = ye(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(he) : e.slice(t).join(he), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, be = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? _e + r : void 0;
})(), xe = (e) => {
	let { theme: t, classGroups: n } = e;
	return Se(n, t);
}, Se = (e, t) => {
	let n = me();
	for (let r in e) {
		let i = e[r];
		Ce(i, n, r, t);
	}
	return n;
}, Ce = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		we(i, t, n, r);
	}
}, we = (e, t, n, r) => {
	if (typeof e == "string") {
		Te(e, t, n);
		return;
	}
	if (typeof e == "function") {
		Ee(e, t, n, r);
		return;
	}
	De(e, t, n, r);
}, Te = (e, t, n) => {
	let r = e === "" ? t : Oe(t, e);
	r.classGroupId = n;
}, Ee = (e, t, n, r) => {
	if (ke(e)) {
		Ce(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(pe(n, e));
}, De = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		Ce(o, Oe(t, a), n, r);
	}
}, Oe = (e, t) => {
	let n = e, r = t.split(he), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = me(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, ke = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Ae = (e) => {
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
}, je = "!", Me = ":", Ne = [], Pe = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), Fe = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === Me) {
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
		s.endsWith(je) ? (c = s.slice(0, -1), l = !0) : s.startsWith(je) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return Pe(t, l, c, u);
	};
	if (t) {
		let e = t + Me, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : Pe(Ne, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, Ie = (e) => {
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
}, Le = (e) => ({
	cache: Ae(e.cacheSize),
	parseClassName: Fe(e),
	sortModifiers: Ie(e),
	...ve(e)
}), Re = /\s+/, ze = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(Re), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + je : g, v = _ + h;
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
}, Be = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = Ve(n)) && (i && (i += " "), i += r);
	return i;
}, Ve = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = Ve(e[r])) && (n && (n += " "), n += t);
	return n;
}, He = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = Le(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = ze(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(Be(...e));
}, Ue = [], B = (e) => {
	let t = (t) => t[e] || Ue;
	return t.isThemeGetter = !0, t;
}, We = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Ge = /^\((?:(\w[\w-]*):)?(.+)\)$/i, Ke = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, qe = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Je = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Ye = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, Xe = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Ze = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, V = (e) => Ke.test(e), H = (e) => !!e && !Number.isNaN(Number(e)), U = (e) => !!e && Number.isInteger(Number(e)), Qe = (e) => e.endsWith("%") && H(e.slice(0, -1)), W = (e) => qe.test(e), $e = () => !0, et = (e) => Je.test(e) && !Ye.test(e), tt = () => !1, nt = (e) => Xe.test(e), rt = (e) => Ze.test(e), it = (e) => !G(e) && !q(e), at = (e) => Y(e, bt, tt), G = (e) => We.test(e), K = (e) => Y(e, xt, et), ot = (e) => Y(e, St, H), st = (e) => Y(e, wt, $e), ct = (e) => Y(e, Ct, tt), lt = (e) => Y(e, vt, tt), ut = (e) => Y(e, yt, rt), dt = (e) => Y(e, Tt, nt), q = (e) => Ge.test(e), J = (e) => X(e, xt), ft = (e) => X(e, Ct), pt = (e) => X(e, vt), mt = (e) => X(e, bt), ht = (e) => X(e, yt), gt = (e) => X(e, Tt, !0), _t = (e) => X(e, wt, !0), Y = (e, t, n) => {
	let r = We.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, X = (e, t, n = !1) => {
	let r = Ge.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, vt = (e) => e === "position" || e === "percentage", yt = (e) => e === "image" || e === "url", bt = (e) => e === "length" || e === "size" || e === "bg-size", xt = (e) => e === "length", St = (e) => e === "number", Ct = (e) => e === "family-name", wt = (e) => e === "number" || e === "weight", Tt = (e) => e === "shadow", Et = /* @__PURE__ */ He(() => {
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
		q,
		G
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
		q,
		G,
		c
	], T = () => [
		V,
		"full",
		"auto",
		...w()
	], ee = () => [
		U,
		"none",
		"subgrid",
		q,
		G
	], te = () => [
		"auto",
		{ span: [
			"full",
			U,
			q,
			G
		] },
		U,
		q,
		G
	], E = () => [
		U,
		"auto",
		q,
		G
	], D = () => [
		"auto",
		"min",
		"max",
		"fr",
		q,
		G
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
		V,
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
	], ne = () => [
		V,
		"screen",
		"full",
		"dvw",
		"lvw",
		"svw",
		"min",
		"max",
		"fit",
		...w()
	], re = () => [
		V,
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
	], M = () => [
		e,
		q,
		G
	], ie = () => [
		...b(),
		pt,
		lt,
		{ position: [q, G] }
	], ae = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], oe = () => [
		"auto",
		"cover",
		"contain",
		mt,
		at,
		{ size: [q, G] }
	], se = () => [
		Qe,
		J,
		K
	], N = () => [
		"",
		"none",
		"full",
		l,
		q,
		G
	], P = () => [
		"",
		H,
		J,
		K
	], F = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	], ce = () => [
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
	], I = () => [
		H,
		Qe,
		pt,
		lt
	], le = () => [
		"",
		"none",
		m,
		q,
		G
	], L = () => [
		"none",
		H,
		q,
		G
	], R = () => [
		"none",
		H,
		q,
		G
	], ue = () => [
		H,
		q,
		G
	], z = () => [
		V,
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
			blur: [W],
			breakpoint: [W],
			color: [$e],
			container: [W],
			"drop-shadow": [W],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [it],
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
			"inset-shadow": [W],
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
			radius: [W],
			shadow: [W],
			spacing: ["px", H],
			text: [W],
			"text-shadow": [W],
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
				V,
				G,
				q,
				g
			] }],
			container: ["container"],
			columns: [{ columns: [
				H,
				G,
				q,
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
				U,
				"auto",
				q,
				G
			] }],
			basis: [{ basis: [
				V,
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
				H,
				V,
				"auto",
				"initial",
				"none",
				G
			] }],
			grow: [{ grow: [
				"",
				H,
				q,
				G
			] }],
			shrink: [{ shrink: [
				"",
				H,
				q,
				G
			] }],
			order: [{ order: [
				U,
				"first",
				"last",
				"none",
				q,
				G
			] }],
			"grid-cols": [{ "grid-cols": ee() }],
			"col-start-end": [{ col: te() }],
			"col-start": [{ "col-start": E() }],
			"col-end": [{ "col-end": E() }],
			"grid-rows": [{ "grid-rows": ee() }],
			"row-start-end": [{ row: te() }],
			"row-start": [{ "row-start": E() }],
			"row-end": [{ "row-end": E() }],
			"grid-flow": [{ "grid-flow": [
				"row",
				"col",
				"dense",
				"row-dense",
				"col-dense"
			] }],
			"auto-cols": [{ "auto-cols": D() }],
			"auto-rows": [{ "auto-rows": D() }],
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
			"inline-size": [{ inline: ["auto", ...ne()] }],
			"min-inline-size": [{ "min-inline": ["auto", ...ne()] }],
			"max-inline-size": [{ "max-inline": ["none", ...ne()] }],
			"block-size": [{ block: ["auto", ...re()] }],
			"min-block-size": [{ "min-block": ["auto", ...re()] }],
			"max-block-size": [{ "max-block": ["none", ...re()] }],
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
				J,
				K
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				_t,
				st
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
				Qe,
				G
			] }],
			"font-family": [{ font: [
				ft,
				ct,
				t
			] }],
			"font-features": [{ "font-features": [G] }],
			"fvn-normal": ["normal-nums"],
			"fvn-ordinal": ["ordinal"],
			"fvn-slashed-zero": ["slashed-zero"],
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			tracking: [{ tracking: [
				i,
				q,
				G
			] }],
			"line-clamp": [{ "line-clamp": [
				H,
				"none",
				q,
				ot
			] }],
			leading: [{ leading: [a, ...w()] }],
			"list-image": [{ "list-image": [
				"none",
				q,
				G
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				q,
				G
			] }],
			"text-alignment": [{ text: [
				"left",
				"center",
				"right",
				"justify",
				"start",
				"end"
			] }],
			"placeholder-color": [{ placeholder: M() }],
			"text-color": [{ text: M() }],
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			"text-decoration-style": [{ decoration: [...F(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				H,
				"from-font",
				"auto",
				q,
				K
			] }],
			"text-decoration-color": [{ decoration: M() }],
			"underline-offset": [{ "underline-offset": [
				H,
				"auto",
				q,
				G
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
				q,
				G
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
				q,
				G
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
			"bg-position": [{ bg: ie() }],
			"bg-repeat": [{ bg: ae() }],
			"bg-size": [{ bg: oe() }],
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
						U,
						q,
						G
					],
					radial: [
						"",
						q,
						G
					],
					conic: [
						U,
						q,
						G
					]
				},
				ht,
				ut
			] }],
			"bg-color": [{ bg: M() }],
			"gradient-from-pos": [{ from: se() }],
			"gradient-via-pos": [{ via: se() }],
			"gradient-to-pos": [{ to: se() }],
			"gradient-from": [{ from: M() }],
			"gradient-via": [{ via: M() }],
			"gradient-to": [{ to: M() }],
			rounded: [{ rounded: N() }],
			"rounded-s": [{ "rounded-s": N() }],
			"rounded-e": [{ "rounded-e": N() }],
			"rounded-t": [{ "rounded-t": N() }],
			"rounded-r": [{ "rounded-r": N() }],
			"rounded-b": [{ "rounded-b": N() }],
			"rounded-l": [{ "rounded-l": N() }],
			"rounded-ss": [{ "rounded-ss": N() }],
			"rounded-se": [{ "rounded-se": N() }],
			"rounded-ee": [{ "rounded-ee": N() }],
			"rounded-es": [{ "rounded-es": N() }],
			"rounded-tl": [{ "rounded-tl": N() }],
			"rounded-tr": [{ "rounded-tr": N() }],
			"rounded-br": [{ "rounded-br": N() }],
			"rounded-bl": [{ "rounded-bl": N() }],
			"border-w": [{ border: P() }],
			"border-w-x": [{ "border-x": P() }],
			"border-w-y": [{ "border-y": P() }],
			"border-w-s": [{ "border-s": P() }],
			"border-w-e": [{ "border-e": P() }],
			"border-w-bs": [{ "border-bs": P() }],
			"border-w-be": [{ "border-be": P() }],
			"border-w-t": [{ "border-t": P() }],
			"border-w-r": [{ "border-r": P() }],
			"border-w-b": [{ "border-b": P() }],
			"border-w-l": [{ "border-l": P() }],
			"divide-x": [{ "divide-x": P() }],
			"divide-x-reverse": ["divide-x-reverse"],
			"divide-y": [{ "divide-y": P() }],
			"divide-y-reverse": ["divide-y-reverse"],
			"border-style": [{ border: [
				...F(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...F(),
				"hidden",
				"none"
			] }],
			"border-color": [{ border: M() }],
			"border-color-x": [{ "border-x": M() }],
			"border-color-y": [{ "border-y": M() }],
			"border-color-s": [{ "border-s": M() }],
			"border-color-e": [{ "border-e": M() }],
			"border-color-bs": [{ "border-bs": M() }],
			"border-color-be": [{ "border-be": M() }],
			"border-color-t": [{ "border-t": M() }],
			"border-color-r": [{ "border-r": M() }],
			"border-color-b": [{ "border-b": M() }],
			"border-color-l": [{ "border-l": M() }],
			"divide-color": [{ divide: M() }],
			"outline-style": [{ outline: [
				...F(),
				"none",
				"hidden"
			] }],
			"outline-offset": [{ "outline-offset": [
				H,
				q,
				G
			] }],
			"outline-w": [{ outline: [
				"",
				H,
				J,
				K
			] }],
			"outline-color": [{ outline: M() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				gt,
				dt
			] }],
			"shadow-color": [{ shadow: M() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				gt,
				dt
			] }],
			"inset-shadow-color": [{ "inset-shadow": M() }],
			"ring-w": [{ ring: P() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: M() }],
			"ring-offset-w": [{ "ring-offset": [H, K] }],
			"ring-offset-color": [{ "ring-offset": M() }],
			"inset-ring-w": [{ "inset-ring": P() }],
			"inset-ring-color": [{ "inset-ring": M() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				gt,
				dt
			] }],
			"text-shadow-color": [{ "text-shadow": M() }],
			opacity: [{ opacity: [
				H,
				q,
				G
			] }],
			"mix-blend": [{ "mix-blend": [
				...ce(),
				"plus-darker",
				"plus-lighter"
			] }],
			"bg-blend": [{ "bg-blend": ce() }],
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
			"mask-image-linear-pos": [{ "mask-linear": [H] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": I() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": I() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": M() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": M() }],
			"mask-image-t-from-pos": [{ "mask-t-from": I() }],
			"mask-image-t-to-pos": [{ "mask-t-to": I() }],
			"mask-image-t-from-color": [{ "mask-t-from": M() }],
			"mask-image-t-to-color": [{ "mask-t-to": M() }],
			"mask-image-r-from-pos": [{ "mask-r-from": I() }],
			"mask-image-r-to-pos": [{ "mask-r-to": I() }],
			"mask-image-r-from-color": [{ "mask-r-from": M() }],
			"mask-image-r-to-color": [{ "mask-r-to": M() }],
			"mask-image-b-from-pos": [{ "mask-b-from": I() }],
			"mask-image-b-to-pos": [{ "mask-b-to": I() }],
			"mask-image-b-from-color": [{ "mask-b-from": M() }],
			"mask-image-b-to-color": [{ "mask-b-to": M() }],
			"mask-image-l-from-pos": [{ "mask-l-from": I() }],
			"mask-image-l-to-pos": [{ "mask-l-to": I() }],
			"mask-image-l-from-color": [{ "mask-l-from": M() }],
			"mask-image-l-to-color": [{ "mask-l-to": M() }],
			"mask-image-x-from-pos": [{ "mask-x-from": I() }],
			"mask-image-x-to-pos": [{ "mask-x-to": I() }],
			"mask-image-x-from-color": [{ "mask-x-from": M() }],
			"mask-image-x-to-color": [{ "mask-x-to": M() }],
			"mask-image-y-from-pos": [{ "mask-y-from": I() }],
			"mask-image-y-to-pos": [{ "mask-y-to": I() }],
			"mask-image-y-from-color": [{ "mask-y-from": M() }],
			"mask-image-y-to-color": [{ "mask-y-to": M() }],
			"mask-image-radial": [{ "mask-radial": [q, G] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": I() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": I() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": M() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": M() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [H] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": I() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": I() }],
			"mask-image-conic-from-color": [{ "mask-conic-from": M() }],
			"mask-image-conic-to-color": [{ "mask-conic-to": M() }],
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
			"mask-position": [{ mask: ie() }],
			"mask-repeat": [{ mask: ae() }],
			"mask-size": [{ mask: oe() }],
			"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
			"mask-image": [{ mask: [
				"none",
				q,
				G
			] }],
			filter: [{ filter: [
				"",
				"none",
				q,
				G
			] }],
			blur: [{ blur: le() }],
			brightness: [{ brightness: [
				H,
				q,
				G
			] }],
			contrast: [{ contrast: [
				H,
				q,
				G
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				gt,
				dt
			] }],
			"drop-shadow-color": [{ "drop-shadow": M() }],
			grayscale: [{ grayscale: [
				"",
				H,
				q,
				G
			] }],
			"hue-rotate": [{ "hue-rotate": [
				H,
				q,
				G
			] }],
			invert: [{ invert: [
				"",
				H,
				q,
				G
			] }],
			saturate: [{ saturate: [
				H,
				q,
				G
			] }],
			sepia: [{ sepia: [
				"",
				H,
				q,
				G
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				q,
				G
			] }],
			"backdrop-blur": [{ "backdrop-blur": le() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				H,
				q,
				G
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				H,
				q,
				G
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				H,
				q,
				G
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				H,
				q,
				G
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				H,
				q,
				G
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				H,
				q,
				G
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				H,
				q,
				G
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				H,
				q,
				G
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
				q,
				G
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				H,
				"initial",
				q,
				G
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				q,
				G
			] }],
			delay: [{ delay: [
				H,
				q,
				G
			] }],
			animate: [{ animate: [
				"none",
				v,
				q,
				G
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				q,
				G
			] }],
			"perspective-origin": [{ "perspective-origin": x() }],
			rotate: [{ rotate: L() }],
			"rotate-x": [{ "rotate-x": L() }],
			"rotate-y": [{ "rotate-y": L() }],
			"rotate-z": [{ "rotate-z": L() }],
			scale: [{ scale: R() }],
			"scale-x": [{ "scale-x": R() }],
			"scale-y": [{ "scale-y": R() }],
			"scale-z": [{ "scale-z": R() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: ue() }],
			"skew-x": [{ "skew-x": ue() }],
			"skew-y": [{ "skew-y": ue() }],
			transform: [{ transform: [
				q,
				G,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: x() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: z() }],
			"translate-x": [{ "translate-x": z() }],
			"translate-y": [{ "translate-y": z() }],
			"translate-z": [{ "translate-z": z() }],
			"translate-none": ["translate-none"],
			accent: [{ accent: M() }],
			appearance: [{ appearance: ["none", "auto"] }],
			"caret-color": [{ caret: M() }],
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
				q,
				G
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
				q,
				G
			] }],
			fill: [{ fill: ["none", ...M()] }],
			"stroke-w": [{ stroke: [
				H,
				J,
				K,
				ot
			] }],
			stroke: [{ stroke: ["none", ...M()] }],
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
function Z(...e) {
	return Et(D(e));
}
//#endregion
//#region src/components/ui/button.tsx
var Dt = A("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
function Q({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ m(r ? le : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: Z(Dt({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/components/ui/input.tsx
function Ot({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ m("input", {
		type: t,
		"data-slot": "input",
		className: Z("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function kt({ className: e, ...t }) {
	return /* @__PURE__ */ m(ce, {
		"data-slot": "label",
		className: Z("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/components/ui/card.tsx
var At = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function jt({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ m("div", {
		"data-slot": "card",
		"data-variant": t,
		className: Z("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", At[t], e),
		...n
	});
}
function Mt({ className: e, ...t }) {
	return /* @__PURE__ */ m("div", {
		"data-slot": "card-header",
		className: Z("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function Nt({ className: e, ...t }) {
	return /* @__PURE__ */ m("div", {
		"data-slot": "card-title",
		className: Z("leading-none font-semibold", e),
		...t
	});
}
function Pt({ className: e, ...t }) {
	return /* @__PURE__ */ m("div", {
		"data-slot": "card-description",
		className: Z("text-sm text-muted-foreground", e),
		...t
	});
}
function Ft({ className: e, ...t }) {
	return /* @__PURE__ */ m("div", {
		"data-slot": "card-content",
		className: Z("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region src/components/ui/lazy-image.tsx
function It({ className: e, eager: t, loading: n, decoding: r, fetchPriority: i, ...a }) {
	return /* @__PURE__ */ m("img", {
		className: Z(e),
		loading: n ?? (t ? "eager" : "lazy"),
		decoding: r ?? "async",
		fetchPriority: i ?? (t ? "high" : "low"),
		referrerPolicy: "no-referrer",
		...a
	});
}
//#endregion
//#region src/lib/marketplace-api.ts
function Lt(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function Rt(e) {
	"@babel/helpers - typeof";
	return Rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, Rt(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function zt(e, t) {
	if (Rt(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (Rt(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function Bt(e) {
	var t = zt(e, "string");
	return Rt(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function Vt(e, t, n) {
	return (t = Bt(t)) in e ? Object.defineProperty(e, t, {
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
		super(e), Vt(this, "code", void 0), Vt(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, Ht = {
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
function Ut(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function Wt(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function Gt(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(Lt(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function Kt(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return Gt(e, n);
	if (t instanceof $ && t.code) {
		let n = Ht[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = Ht[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return Ut(n) ? e("errors.api.timeout") : Wt(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function qt(e, t) {
	p.error(Kt(e, t));
}
//#endregion
//#region src/lib/queryClient.ts
var Jt = null;
function Yt() {
	return Jt;
}
//#endregion
//#region src/lib/authLost.ts
var Xt = ["auth", "session"], Zt = new Set([
	"rest_cookie_invalid_nonce",
	"rest_not_logged_in",
	"invalid_nonce",
	"ajax_referer_failed",
	"-1"
]);
function Qt(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (t.status === 401) return !0;
	let n = typeof t.code == "string" ? t.code : "";
	if (Zt.has(n)) return !0;
	let r = typeof t.message == "string" ? t.message.toLowerCase() : "";
	return !!(r.includes("cookie nonce is invalid") || r.includes("rest_cookie_invalid_nonce") || t.status === 403 && (n === "-1" || r === "-1" || r.includes("are you sure you want to do this")));
}
function $t(e) {
	let t = e ?? Yt();
	t && t.setQueryData(Xt, { logged_in: !1 });
}
function en(e) {
	Qt(e) && $t();
}
//#endregion
//#region src/lib/safeUrl.ts
function tn(e) {
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
function nn() {
	return window.webinoDashboard;
}
var rn = 3e4;
function an(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function on(e) {
	let t = nn();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (an(e) || tn(e)) return e;
	throw new $("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function sn(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function cn(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") || t.startsWith("shop/reports") || t.startsWith("shop/product-categories") || t === "comments" || t.startsWith("comments/") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : /^(payments|torobpay|snapppay|digipay|zarinpal|bale-pay|wallet|c2c)(\/|$)/.test(t) ? "webino_dashboard_payments_rest" : t.startsWith("analytics/") && t !== "analytics/hit" ? "webino_dashboard_analytics_rest" : null;
}
function ln(e, t) {
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
function un(e, t) {
	let n = e.toLowerCase();
	return e.includes("Upstream Error") || e.includes("Forbidden") || t === 403 ? "admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry" : n.includes("timed out") || n.includes("timeout") || t === 504 || t === 524 ? "Request timed out — RSA-4096 generation can take over a minute on weak hosts" : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? `Invalid AJAX response (HTML, HTTP ${t || 0})` : `Invalid AJAX response (HTTP ${t || 0})`;
}
async function dn(e, t, n = {}) {
	let r = cn(e), i = nn();
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
	let { signal: l, clear: u } = sn({}, t);
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
			throw new $(un(t, e.status), {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!n.success) {
			let t = new $(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
				code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
				status: e.status
			});
			throw en(t), t;
		}
		return n.data;
	} catch (e) {
		throw e instanceof $ ? (en(e), e) : e instanceof DOMException && e.name === "AbortError" ? new $("Request timed out", {
			code: "timeout",
			status: 0
		}) : e instanceof TypeError ? new $("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		u();
	}
}
async function fn(e, t = {}, n = rn) {
	if (cn(e) && nn().ajaxUrl) return dn(e, n, t);
	let r = on(e), i = nn(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce), !Object.keys(a).some((e) => e.toLowerCase() === "content-type") && typeof t.body == "string" && t.body.length > 0 && (a["Content-Type"] = "application/json");
	let { signal: s, clear: c } = sn(t, n);
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
			let t = ln(n, e.status);
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
			throw en(n), n;
		}
		return i;
	} catch (e) {
		throw e instanceof $ ? (en(e), e) : e instanceof DOMException && e.name === "AbortError" ? new $("Request timed out", {
			code: "timeout",
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
//#region ../Modules/product-catalog-module/client/pages/ProductCatalogPage.tsx
var pn = [
	"food",
	"beauty",
	"pet",
	"general",
	"books",
	"merchandise"
];
function mn() {
	let { t } = f(), [n, r] = u("food"), [i, a] = u(""), [o, s] = u(""), [c, l] = u(1), [g, _] = u([]), [v, y] = u(!1), [b, x] = u(!1), [S, C] = u(null), [w, T] = u(null), E = e({
		mutationFn: (e) => fn("catalog/search", {
			method: "POST",
			body: JSON.stringify({
				category: n,
				q: i.trim(),
				barcode: o.trim(),
				page: e.page
			})
		}),
		onSuccess: (e, n) => {
			x(!0), y(!!e.has_more), _((t) => n.append ? [...t, ...e.items ?? []] : e.items ?? []), e.errors?.length && p.message(e.errors[0]), !(e.items ?? []).length && !n.append && p.message(t("catalog.empty"));
		},
		onError: (e) => qt(t, e)
	}), D = e({
		mutationFn: (e) => (C(e.id), fn("catalog/import", {
			method: "POST",
			body: JSON.stringify({ payload: e })
		})),
		onSuccess: (e, n) => {
			p.success(t("catalog.imported")), T({
				itemId: n.id,
				productId: e.product_id
			}), C(null);
		},
		onError: (e) => {
			C(null), qt(t, e);
		}
	});
	function O() {
		l(1), E.mutate({
			page: 1,
			append: !1
		});
	}
	return /* @__PURE__ */ h("div", {
		className: "mx-auto w-full max-w-[1400px] space-y-6 p-4 pb-10",
		children: [
			/* @__PURE__ */ h("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ h("div", { children: [/* @__PURE__ */ m("h1", {
					className: "text-2xl font-semibold",
					children: t("catalog.pageTitle")
				}), /* @__PURE__ */ m("p", {
					className: "text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed",
					children: t("catalog.pageDesc")
				})] }), /* @__PURE__ */ m(Q, {
					asChild: !0,
					variant: "outline",
					size: "sm",
					children: /* @__PURE__ */ m(d, {
						to: "/settings/shop/product-catalog",
						children: t("catalog.settingsLink")
					})
				})]
			}),
			/* @__PURE__ */ m("div", {
				className: "flex flex-wrap gap-2",
				children: pn.map((e) => /* @__PURE__ */ m(Q, {
					type: "button",
					size: "sm",
					variant: n === e ? "default" : "outline",
					onClick: () => {
						r(e), _([]), x(!1), l(1);
					},
					children: t(`catalog.cat.${e}`)
				}, e))
			}),
			/* @__PURE__ */ h("div", {
				className: "grid gap-3 md:grid-cols-[1fr_12rem_auto]",
				children: [
					/* @__PURE__ */ h("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ m(kt, {
							htmlFor: "catalog-q",
							children: t("catalog.searchLabel")
						}), /* @__PURE__ */ m(Ot, {
							id: "catalog-q",
							value: i,
							onChange: (e) => a(e.target.value),
							placeholder: t("catalog.searchPlaceholder"),
							onKeyDown: (e) => {
								e.key === "Enter" && O();
							}
						})]
					}),
					/* @__PURE__ */ h("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ m(kt, {
							htmlFor: "catalog-bc",
							children: t("catalog.barcodeLabel")
						}), /* @__PURE__ */ m(Ot, {
							id: "catalog-bc",
							dir: "ltr",
							value: o,
							onChange: (e) => s(e.target.value.replace(/\D/g, "").slice(0, 14)),
							placeholder: "EAN / UPC",
							onKeyDown: (e) => {
								e.key === "Enter" && O();
							}
						})]
					}),
					/* @__PURE__ */ m("div", {
						className: "flex items-end",
						children: /* @__PURE__ */ h(Q, {
							type: "button",
							className: "w-full md:w-auto",
							disabled: E.isPending || !i.trim() && !o.trim(),
							onClick: O,
							children: [E.isPending ? /* @__PURE__ */ m(ee, { className: "me-2 size-4 animate-spin" }) : /* @__PURE__ */ m(te, { className: "me-2 size-4" }), t("catalog.search")]
						})
					})
				]
			}),
			E.isPending && !g.length ? /* @__PURE__ */ m("p", {
				className: "text-muted-foreground text-sm",
				children: t("catalog.searching")
			}) : null,
			/* @__PURE__ */ m("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: g.map((e) => /* @__PURE__ */ m(jt, {
					className: "overflow-hidden",
					children: /* @__PURE__ */ h(Ft, {
						className: "flex gap-3 p-3",
						children: [/* @__PURE__ */ m("div", {
							className: "bg-muted size-20 shrink-0 overflow-hidden rounded-md",
							children: e.image_url ? /* @__PURE__ */ m(It, {
								src: e.image_url,
								alt: "",
								className: "size-full object-cover"
							}) : /* @__PURE__ */ m("div", {
								className: "text-muted-foreground flex size-full items-center justify-center text-xs",
								children: "—"
							})
						}), /* @__PURE__ */ h("div", {
							className: "min-w-0 flex-1 space-y-1",
							children: [
								/* @__PURE__ */ m("p", {
									className: "line-clamp-2 text-sm font-medium leading-snug",
									children: e.title
								}),
								e.brand ? /* @__PURE__ */ m("p", {
									className: "text-muted-foreground truncate text-xs",
									children: e.brand
								}) : null,
								e.barcode ? /* @__PURE__ */ m("p", {
									className: "text-muted-foreground font-mono text-[11px]",
									dir: "ltr",
									children: e.barcode
								}) : null,
								/* @__PURE__ */ m(Q, {
									type: "button",
									size: "sm",
									className: "mt-1",
									disabled: D.isPending && S === e.id,
									onClick: () => D.mutate(e),
									children: t("catalog.addDraft")
								}),
								w?.itemId === e.id ? /* @__PURE__ */ m(d, {
									className: "text-primary ms-2 text-xs hover:underline",
									to: `/shop/products/${w.productId}`,
									children: t("catalog.openProduct")
								}) : null
							]
						})]
					})
				}, e.id))
			}),
			b && !E.isPending && g.length === 0 ? /* @__PURE__ */ m("p", {
				className: "text-muted-foreground text-sm",
				children: t("catalog.empty")
			}) : null,
			v ? /* @__PURE__ */ m("div", {
				className: "flex justify-center",
				children: /* @__PURE__ */ m(Q, {
					type: "button",
					variant: "outline",
					disabled: E.isPending,
					onClick: () => {
						let e = c + 1;
						l(e), E.mutate({
							page: e,
							append: !0
						});
					},
					children: t("catalog.loadMore")
				})
			}) : null
		]
	});
}
//#endregion
//#region src/hooks/useQueryErrorToast.ts
function hn(e) {
	let { t } = f(), n = l(!1);
	c(() => {
		e.isError && e.error ? n.current || (n.current = !0, p.error(Kt(t, e.error))) : n.current = !1;
	}, [
		e.isError,
		e.error,
		e.fetchStatus,
		t
	]);
}
//#endregion
//#region ../Modules/product-catalog-module/client/pages/ProductCatalogSettingsPage.tsx
function gn() {
	let { t: r } = f(), i = n(), [a, o] = u({
		google_books_api_key: "",
		barcodenest_api_key: "",
		gtinhub_api_key: "",
		buycott_access_token: ""
	}), s = t({
		queryKey: ["catalog", "settings"],
		queryFn: () => fn("catalog/settings")
	});
	hn(s), c(() => {
		let e = s.data?.settings;
		e && o({
			google_books_api_key: e.google_books_api_key ?? "",
			barcodenest_api_key: e.barcodenest_api_key ?? "",
			gtinhub_api_key: e.gtinhub_api_key ?? "",
			buycott_access_token: e.buycott_access_token ?? ""
		});
	}, [s.data]);
	let l = e({
		mutationFn: () => fn("catalog/settings", {
			method: "POST",
			body: JSON.stringify(a)
		}),
		onSuccess: () => {
			p.success(r("catalog.settingsSaved")), i.invalidateQueries({ queryKey: ["catalog", "settings"] });
		},
		onError: (e) => qt(r, e)
	});
	return /* @__PURE__ */ m("div", {
		className: "mx-auto w-full max-w-xl space-y-4 p-4 pb-10",
		children: /* @__PURE__ */ h(jt, { children: [/* @__PURE__ */ h(Mt, { children: [/* @__PURE__ */ m(Nt, { children: r("catalog.settingsTitle") }), /* @__PURE__ */ m(Pt, { children: r("catalog.settingsDesc") })] }), /* @__PURE__ */ h(Ft, {
			className: "space-y-4",
			children: [[
				["google_books_api_key", "catalog.keyGoogleBooks"],
				["barcodenest_api_key", "catalog.keyBarcodeNest"],
				["gtinhub_api_key", "catalog.keyGtinHub"],
				["buycott_access_token", "catalog.keyBuycott"]
			].map(([e, t]) => /* @__PURE__ */ h("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ m(kt, {
					htmlFor: e,
					children: r(t)
				}), /* @__PURE__ */ m(Ot, {
					id: e,
					dir: "ltr",
					className: "font-mono text-sm",
					type: "password",
					autoComplete: "off",
					value: a[e],
					onChange: (t) => o((n) => ({
						...n,
						[e]: t.target.value
					}))
				})]
			}, e)), /* @__PURE__ */ h(Q, {
				type: "button",
				disabled: l.isPending,
				onClick: () => l.mutate(),
				children: [l.isPending ? /* @__PURE__ */ m(ee, { className: "me-2 size-4 animate-spin" }) : null, r("common.save")]
			})]
		})] })
	});
}
//#endregion
//#region ../Modules/product-catalog-module/client/module-entry.tsx
var _n = {
	"shop/product-catalog": mn,
	"settings/shop/product-catalog": gn
}, vn = { routes: _n };
//#endregion
export { vn as default, _n as routes };
