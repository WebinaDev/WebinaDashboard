import { useMutation as e, useQuery as t, useQueryClient as n } from "@tanstack/react-query";
import * as r from "react";
import { createContext as i, createElement as a, forwardRef as o, useCallback as s, useContext as c, useEffect as l, useMemo as u, useRef as d, useState as f } from "react";
import { Link as p, Navigate as m, useLocation as h, useSearchParams as g } from "react-router-dom";
import { useTranslation as _ } from "react-i18next";
import { toast as v } from "sonner";
import "react-dom";
import { Fragment as y, jsx as b, jsxs as x } from "react/jsx-runtime";
import S from "i18next";
//#region \0rolldown/runtime.js
var C = Object.create, w = Object.defineProperty, T = Object.getOwnPropertyDescriptor, E = Object.getOwnPropertyNames, D = Object.getPrototypeOf, O = Object.prototype.hasOwnProperty, k = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), A = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = E(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !O.call(e, s) && s !== n && w(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = T(t, s)) || r.enumerable
	});
	return e;
}, j = (e, t, n) => (n = e == null ? {} : C(D(e)), A(t || !e || !e.__esModule ? w(n, "default", {
	value: e,
	enumerable: !0
}) : n, e)), M = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), N = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), ee = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), P = (e) => {
	let t = ee(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, F = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, I = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, te = i({}), ne = () => c(te), re = o(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: o, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = ne() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return a("svg", {
		ref: l,
		...F,
		width: t ?? u ?? F.width,
		height: t ?? u ?? F.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: M("lucide", m, i),
		...!o && !I(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => a(e, t)), ...Array.isArray(o) ? o : [o]]);
}), L = ((e, t) => {
	let n = o(({ className: n, ...r }, i) => a(re, {
		ref: i,
		iconNode: t,
		className: M(`lucide-${N(P(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = P(e), n;
})("chevron-down", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]);
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function R(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") if (Array.isArray(e)) {
		var i = e.length;
		for (t = 0; t < i; t++) e[t] && (n = R(e[t])) && (r && (r += " "), r += n);
	} else for (n in e) e[n] && (r && (r += " "), r += n);
	return r;
}
function ie() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = R(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/class-variance-authority/dist/index.mjs
var ae = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, z = ie, oe = (e, t) => (n) => {
	if (t?.variants == null) return z(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = ae(t) || ae(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return z(e, a, t?.compoundVariants?.reduce((e, t) => {
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
function se(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function ce(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = se(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : se(e[t], null);
			}
		};
	};
}
function le(...e) {
	return r.useCallback(ce(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function ue(e) {
	let t = /* @__PURE__ */ de(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(pe);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ b(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ b(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function de(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = he(n), a = me(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? ce(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var fe = Symbol("radix.slottable");
function pe(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === fe;
}
function me(e, t) {
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
function he(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/dist/index.mjs
var ge = [
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
	let n = /* @__PURE__ */ ue(`Primitive.${t}`), i = r.forwardRef((e, r) => {
		let { asChild: i, ...a } = e, o = i ? n : t;
		return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ b(o, {
			...a,
			ref: r
		});
	});
	return i.displayName = `Primitive.${t}`, {
		...e,
		[t]: i
	};
}, {});
//#endregion
//#region node_modules/@radix-ui/react-context/dist/index.mjs
function _e(e, t = []) {
	let n = [];
	function i(t, i) {
		let a = r.createContext(i), o = n.length;
		n = [...n, i];
		let s = (t) => {
			let { scope: n, children: i, ...s } = t, c = n?.[e]?.[o] || a, l = r.useMemo(() => s, Object.values(s));
			return /* @__PURE__ */ b(c.Provider, {
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
	return a.scopeName = e, [i, ve(a, ...t)];
}
function ve(...e) {
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
typeof window < "u" && window.document && window.document.createElement;
function ye(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var be = globalThis?.document ? r.useLayoutEffect : () => {}, xe = r.useInsertionEffect || be;
function Se({ prop: e, defaultProp: t, onChange: n = () => {}, caller: i }) {
	let [a, o, s] = Ce({
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
			let n = we(t) ? t(e) : t;
			n !== e && s.current?.(n);
		} else o(t);
	}, [
		c,
		e,
		o,
		s
	])];
}
function Ce({ defaultProp: e, onChange: t }) {
	let [n, i] = r.useState(e), a = r.useRef(n), o = r.useRef(t);
	return xe(() => {
		o.current = t;
	}, [t]), r.useEffect(() => {
		a.current !== n && (o.current?.(n), a.current = n);
	}, [n, a]), [
		n,
		i,
		o
	];
}
function we(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/@radix-ui/react-presence/dist/index.mjs
function Te(e, t) {
	return r.useReducer((e, n) => t[e][n] ?? e, e);
}
var Ee = (e) => {
	let { present: t, children: n } = e, i = De(t), a = typeof n == "function" ? n({ present: i.isPresent }) : r.Children.only(n), o = le(i.ref, ke(a));
	return typeof n == "function" || i.isPresent ? r.cloneElement(a, { ref: o }) : null;
};
Ee.displayName = "Presence";
function De(e) {
	let [t, n] = r.useState(), i = r.useRef(null), a = r.useRef(e), o = r.useRef("none"), [s, c] = Te(e ? "mounted" : "unmounted", {
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
		let e = Oe(i.current);
		o.current = s === "mounted" ? e : "none";
	}, [s]), be(() => {
		let t = i.current, n = a.current;
		if (n !== e) {
			let r = o.current, i = Oe(t);
			e ? c("MOUNT") : i === "none" || t?.display === "none" ? c("UNMOUNT") : c(n && r !== i ? "ANIMATION_OUT" : "UNMOUNT"), a.current = e;
		}
	}, [e, c]), be(() => {
		if (t) {
			let e, n = t.ownerDocument.defaultView ?? window, r = (r) => {
				let o = Oe(i.current).includes(CSS.escape(r.animationName));
				if (r.target === t && o && (c("ANIMATION_END"), !a.current)) {
					let r = t.style.animationFillMode;
					t.style.animationFillMode = "forwards", e = n.setTimeout(() => {
						t.style.animationFillMode === "forwards" && (t.style.animationFillMode = r);
					});
				}
			}, s = (e) => {
				e.target === t && (o.current = Oe(i.current));
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
function Oe(e) {
	return e?.animationName || "none";
}
function ke(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-id/dist/index.mjs
var Ae = r.useId || (() => void 0), je = 0;
function Me(e) {
	let [t, n] = r.useState(Ae());
	return be(() => {
		e || n((e) => e ?? String(je++));
	}, [e]), e || (t ? `radix-${t}` : "");
}
//#endregion
//#region node_modules/@radix-ui/react-collapsible/dist/index.mjs
var Ne = "Collapsible", [Pe, Fe] = _e(Ne), [Ie, Le] = Pe(Ne), Re = r.forwardRef((e, t) => {
	let { __scopeCollapsible: n, open: i, defaultOpen: a, disabled: o, onOpenChange: s, ...c } = e, [l, u] = Se({
		prop: i,
		defaultProp: a ?? !1,
		onChange: s,
		caller: Ne
	});
	return /* @__PURE__ */ b(Ie, {
		scope: n,
		disabled: o,
		contentId: Me(),
		open: l,
		onOpenToggle: r.useCallback(() => u((e) => !e), [u]),
		children: /* @__PURE__ */ b(ge.div, {
			"data-state": We(l),
			"data-disabled": o ? "" : void 0,
			...c,
			ref: t
		})
	});
});
Re.displayName = Ne;
var ze = "CollapsibleTrigger", Be = r.forwardRef((e, t) => {
	let { __scopeCollapsible: n, ...r } = e, i = Le(ze, n);
	return /* @__PURE__ */ b(ge.button, {
		type: "button",
		"aria-controls": i.contentId,
		"aria-expanded": i.open || !1,
		"data-state": We(i.open),
		"data-disabled": i.disabled ? "" : void 0,
		disabled: i.disabled,
		...r,
		ref: t,
		onClick: ye(e.onClick, i.onOpenToggle)
	});
});
Be.displayName = ze;
var Ve = "CollapsibleContent", He = r.forwardRef((e, t) => {
	let { forceMount: n, ...r } = e, i = Le(Ve, e.__scopeCollapsible);
	return /* @__PURE__ */ b(Ee, {
		present: n || i.open,
		children: ({ present: e }) => /* @__PURE__ */ b(Ue, {
			...r,
			ref: t,
			present: e
		})
	});
});
He.displayName = Ve;
var Ue = r.forwardRef((e, t) => {
	let { __scopeCollapsible: n, present: i, children: a, ...o } = e, s = Le(Ve, n), [c, l] = r.useState(i), u = r.useRef(null), d = le(t, u), f = r.useRef(0), p = f.current, m = r.useRef(0), h = m.current, g = s.open || c, _ = r.useRef(g), v = r.useRef(void 0);
	return r.useEffect(() => {
		let e = requestAnimationFrame(() => _.current = !1);
		return () => cancelAnimationFrame(e);
	}, []), be(() => {
		let e = u.current;
		if (e) {
			v.current = v.current || {
				transitionDuration: e.style.transitionDuration,
				animationName: e.style.animationName
			}, e.style.transitionDuration = "0s", e.style.animationName = "none";
			let t = e.getBoundingClientRect();
			f.current = t.height, m.current = t.width, _.current || (e.style.transitionDuration = v.current.transitionDuration, e.style.animationName = v.current.animationName), l(i);
		}
	}, [s.open, i]), /* @__PURE__ */ b(ge.div, {
		"data-state": We(s.open),
		"data-disabled": s.disabled ? "" : void 0,
		id: s.contentId,
		hidden: !g,
		...o,
		ref: d,
		style: {
			"--radix-collapsible-content-height": p ? `${p}px` : void 0,
			"--radix-collapsible-content-width": h ? `${h}px` : void 0,
			...e.style
		},
		children: g && a
	});
});
function We(e) {
	return e ? "open" : "closed";
}
var Ge = Re;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function Ke(e) {
	let t = /* @__PURE__ */ Je(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Xe);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ b(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ b(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
var qe = /* @__PURE__ */ Ke("Slot");
/* @__NO_SIDE_EFFECTS__ */
function Je(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Qe(n), a = Ze(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? ce(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Ye = Symbol("radix.slottable");
function Xe(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Ye;
}
function Ze(e, t) {
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
function Qe(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/tailwind-merge/dist/bundle-mjs.mjs
var $e = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, et = (e, t) => ({
	classGroupId: e,
	validator: t
}), tt = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), nt = "-", rt = [], it = "arbitrary..", at = (e) => {
	let t = ct(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return st(e);
			let n = e.split(nt);
			return ot(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? $e(i, t) : t : i || rt;
			}
			return n[e] || rt;
		}
	};
}, ot = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = ot(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(nt) : e.slice(t).join(nt), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, st = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? it + r : void 0;
})(), ct = (e) => {
	let { theme: t, classGroups: n } = e;
	return lt(n, t);
}, lt = (e, t) => {
	let n = tt();
	for (let r in e) {
		let i = e[r];
		ut(i, n, r, t);
	}
	return n;
}, ut = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		dt(i, t, n, r);
	}
}, dt = (e, t, n, r) => {
	if (typeof e == "string") {
		ft(e, t, n);
		return;
	}
	if (typeof e == "function") {
		pt(e, t, n, r);
		return;
	}
	mt(e, t, n, r);
}, ft = (e, t, n) => {
	let r = e === "" ? t : ht(t, e);
	r.classGroupId = n;
}, pt = (e, t, n, r) => {
	if (gt(e)) {
		ut(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(et(n, e));
}, mt = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		ut(o, ht(t, a), n, r);
	}
}, ht = (e, t) => {
	let n = e, r = t.split(nt), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = tt(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, gt = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, _t = (e) => {
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
}, vt = "!", yt = ":", bt = [], xt = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), St = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === yt) {
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
		s.endsWith(vt) ? (c = s.slice(0, -1), l = !0) : s.startsWith(vt) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return xt(t, l, c, u);
	};
	if (t) {
		let e = t + yt, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : xt(bt, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, Ct = (e) => {
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
}, wt = (e) => ({
	cache: _t(e.cacheSize),
	parseClassName: St(e),
	sortModifiers: Ct(e),
	...at(e)
}), Tt = /\s+/, Et = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(Tt), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + vt : g, v = _ + h;
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
}, Dt = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = Ot(n)) && (i && (i += " "), i += r);
	return i;
}, Ot = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = Ot(e[r])) && (n && (n += " "), n += t);
	return n;
}, kt = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = wt(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = Et(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(Dt(...e));
}, At = [], B = (e) => {
	let t = (t) => t[e] || At;
	return t.isThemeGetter = !0, t;
}, jt = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Mt = /^\((?:(\w[\w-]*):)?(.+)\)$/i, Nt = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, Pt = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Ft = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, It = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, Lt = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Rt = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, zt = (e) => Nt.test(e), V = (e) => !!e && !Number.isNaN(Number(e)), Bt = (e) => !!e && Number.isInteger(Number(e)), Vt = (e) => e.endsWith("%") && V(e.slice(0, -1)), Ht = (e) => Pt.test(e), Ut = () => !0, Wt = (e) => Ft.test(e) && !It.test(e), Gt = () => !1, Kt = (e) => Lt.test(e), qt = (e) => Rt.test(e), Jt = (e) => !H(e) && !U(e), Yt = (e) => dn(e, hn, Gt), H = (e) => jt.test(e), Xt = (e) => dn(e, gn, Wt), Zt = (e) => dn(e, _n, V), Qt = (e) => dn(e, yn, Ut), $t = (e) => dn(e, vn, Gt), en = (e) => dn(e, pn, Gt), tn = (e) => dn(e, mn, qt), nn = (e) => dn(e, bn, Kt), U = (e) => Mt.test(e), rn = (e) => fn(e, gn), an = (e) => fn(e, vn), on = (e) => fn(e, pn), sn = (e) => fn(e, hn), cn = (e) => fn(e, mn), ln = (e) => fn(e, bn, !0), un = (e) => fn(e, yn, !0), dn = (e, t, n) => {
	let r = jt.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, fn = (e, t, n = !1) => {
	let r = Mt.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, pn = (e) => e === "position" || e === "percentage", mn = (e) => e === "image" || e === "url", hn = (e) => e === "length" || e === "size" || e === "bg-size", gn = (e) => e === "length", _n = (e) => e === "number", vn = (e) => e === "family-name", yn = (e) => e === "number" || e === "weight", bn = (e) => e === "shadow", xn = /* @__PURE__ */ kt(() => {
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
		zt,
		"full",
		"auto",
		...w()
	], E = () => [
		Bt,
		"none",
		"subgrid",
		U,
		H
	], D = () => [
		"auto",
		{ span: [
			"full",
			Bt,
			U,
			H
		] },
		Bt,
		U,
		H
	], O = () => [
		Bt,
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
		zt,
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
	], ee = () => [
		zt,
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
		zt,
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
		U,
		H
	], I = () => [
		...b(),
		on,
		en,
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
		sn,
		Yt,
		{ size: [U, H] }
	], re = () => [
		Vt,
		rn,
		Xt
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
		rn,
		Xt
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
		Vt,
		on,
		en
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
		zt,
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
			blur: [Ht],
			breakpoint: [Ht],
			color: [Ut],
			container: [Ht],
			"drop-shadow": [Ht],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [Jt],
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
			"inset-shadow": [Ht],
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
			radius: [Ht],
			shadow: [Ht],
			spacing: ["px", V],
			text: [Ht],
			"text-shadow": [Ht],
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
				zt,
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
				Bt,
				"auto",
				U,
				H
			] }],
			basis: [{ basis: [
				zt,
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
				zt,
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
				Bt,
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
			"inline-size": [{ inline: ["auto", ...ee()] }],
			"min-inline-size": [{ "min-inline": ["auto", ...ee()] }],
			"max-inline-size": [{ "max-inline": ["none", ...ee()] }],
			"block-size": [{ block: ["auto", ...P()] }],
			"min-block-size": [{ "min-block": ["auto", ...P()] }],
			"max-block-size": [{ "max-block": ["none", ...P()] }],
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
				rn,
				Xt
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				un,
				Qt
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
				Vt,
				H
			] }],
			"font-family": [{ font: [
				an,
				$t,
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
				Zt
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
			"placeholder-color": [{ placeholder: F() }],
			"text-color": [{ text: F() }],
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
				Xt
			] }],
			"text-decoration-color": [{ decoration: F() }],
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
			"bg-position": [{ bg: I() }],
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
						Bt,
						U,
						H
					],
					radial: [
						"",
						U,
						H
					],
					conic: [
						Bt,
						U,
						H
					]
				},
				cn,
				tn
			] }],
			"bg-color": [{ bg: F() }],
			"gradient-from-pos": [{ from: re() }],
			"gradient-via-pos": [{ via: re() }],
			"gradient-to-pos": [{ to: re() }],
			"gradient-from": [{ from: F() }],
			"gradient-via": [{ via: F() }],
			"gradient-to": [{ to: F() }],
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
				rn,
				Xt
			] }],
			"outline-color": [{ outline: F() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				ln,
				nn
			] }],
			"shadow-color": [{ shadow: F() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				ln,
				nn
			] }],
			"inset-shadow-color": [{ "inset-shadow": F() }],
			"ring-w": [{ ring: R() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: F() }],
			"ring-offset-w": [{ "ring-offset": [V, Xt] }],
			"ring-offset-color": [{ "ring-offset": F() }],
			"inset-ring-w": [{ "inset-ring": R() }],
			"inset-ring-color": [{ "inset-ring": F() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				ln,
				nn
			] }],
			"text-shadow-color": [{ "text-shadow": F() }],
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
			"mask-image-linear-from-color": [{ "mask-linear-from": F() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": F() }],
			"mask-image-t-from-pos": [{ "mask-t-from": z() }],
			"mask-image-t-to-pos": [{ "mask-t-to": z() }],
			"mask-image-t-from-color": [{ "mask-t-from": F() }],
			"mask-image-t-to-color": [{ "mask-t-to": F() }],
			"mask-image-r-from-pos": [{ "mask-r-from": z() }],
			"mask-image-r-to-pos": [{ "mask-r-to": z() }],
			"mask-image-r-from-color": [{ "mask-r-from": F() }],
			"mask-image-r-to-color": [{ "mask-r-to": F() }],
			"mask-image-b-from-pos": [{ "mask-b-from": z() }],
			"mask-image-b-to-pos": [{ "mask-b-to": z() }],
			"mask-image-b-from-color": [{ "mask-b-from": F() }],
			"mask-image-b-to-color": [{ "mask-b-to": F() }],
			"mask-image-l-from-pos": [{ "mask-l-from": z() }],
			"mask-image-l-to-pos": [{ "mask-l-to": z() }],
			"mask-image-l-from-color": [{ "mask-l-from": F() }],
			"mask-image-l-to-color": [{ "mask-l-to": F() }],
			"mask-image-x-from-pos": [{ "mask-x-from": z() }],
			"mask-image-x-to-pos": [{ "mask-x-to": z() }],
			"mask-image-x-from-color": [{ "mask-x-from": F() }],
			"mask-image-x-to-color": [{ "mask-x-to": F() }],
			"mask-image-y-from-pos": [{ "mask-y-from": z() }],
			"mask-image-y-to-pos": [{ "mask-y-to": z() }],
			"mask-image-y-from-color": [{ "mask-y-from": F() }],
			"mask-image-y-to-color": [{ "mask-y-to": F() }],
			"mask-image-radial": [{ "mask-radial": [U, H] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": z() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": z() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": F() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": F() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [V] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": z() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": z() }],
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
			"mask-position": [{ mask: I() }],
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
				ln,
				nn
			] }],
			"drop-shadow-color": [{ "drop-shadow": F() }],
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
			fill: [{ fill: ["none", ...F()] }],
			"stroke-w": [{ stroke: [
				V,
				rn,
				Xt,
				Zt
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
function Sn(...e) {
	return xn(ie(e));
}
//#endregion
//#region src/components/ui/button.tsx
var Cn = oe("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
function W({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ b(r ? qe : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: Sn(Cn({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region ../Modules/basalam-module/client/components/BasalamNav.tsx
var wn = [
	{
		to: "/settings/shop/basalam",
		end: !0,
		key: "basalam.nav.connection"
	},
	{
		to: "/settings/shop/basalam/booth",
		key: "basalam.nav.booth"
	},
	{
		to: "/settings/shop/basalam/products",
		key: "basalam.nav.products"
	},
	{
		to: "/orders?marketplace=basalam",
		key: "basalam.nav.orders",
		externalPath: !0
	},
	{
		to: "/settings/shop/basalam/categories",
		key: "basalam.nav.categories"
	},
	{
		to: "/settings/shop/basalam/settings",
		key: "basalam.nav.settings"
	},
	{
		to: "/settings/shop/basalam/finance",
		key: "basalam.nav.finance"
	},
	{
		to: "/settings/shop/basalam/logs",
		key: "basalam.nav.logs"
	}
];
function Tn() {
	let { t: e } = _(), t = h(), n = t.pathname.replace(/\/$/, "") || "/";
	return /* @__PURE__ */ b("nav", {
		className: "mb-4 flex flex-wrap gap-2",
		"aria-label": e("basalam.title"),
		children: wn.map((r) => {
			let i = r.end ? n === "/settings/shop/basalam" : r.to.startsWith("/orders") ? n.startsWith("/orders") && t.search.includes("marketplace=basalam") : n === r.to || n.startsWith(r.to + "/");
			return /* @__PURE__ */ b(W, {
				asChild: !0,
				size: "sm",
				variant: i ? "default" : "outline",
				className: Sn(i && "pointer-events-none"),
				children: /* @__PURE__ */ b(p, {
					to: r.to,
					children: e(r.key)
				})
			}, r.to);
		})
	});
}
//#endregion
//#region src/components/PageShell.tsx
function En({ title: e, description: t, eyebrow: n, children: r }) {
	return /* @__PURE__ */ x("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ x("header", {
			className: "min-w-0 space-y-1.5",
			children: [
				n ? /* @__PURE__ */ b("p", {
					className: "text-muted-foreground text-xs font-medium tracking-wide uppercase",
					children: n
				}) : null,
				/* @__PURE__ */ b("h1", {
					className: "text-xl font-semibold tracking-tight sm:text-2xl",
					children: e
				}),
				t ? /* @__PURE__ */ b("p", {
					className: "text-muted-foreground max-w-2xl text-sm leading-relaxed",
					children: t
				}) : null
			]
		}), r]
	});
}
//#endregion
//#region src/components/ui/card.tsx
var Dn = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function G({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card",
		"data-variant": t,
		className: Sn("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", Dn[t], e),
		...n
	});
}
function K({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-header",
		className: Sn("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function q({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-title",
		className: Sn("leading-none font-semibold", e),
		...t
	});
}
function On({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-description",
		className: Sn("text-sm text-muted-foreground", e),
		...t
	});
}
function J({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-content",
		className: Sn("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region src/components/ui/collapsible.tsx
function kn({ ...e }) {
	return /* @__PURE__ */ b(Ge, {
		"data-slot": "collapsible",
		...e
	});
}
function An({ ...e }) {
	return /* @__PURE__ */ b(Be, {
		"data-slot": "collapsible-trigger",
		...e
	});
}
function jn({ className: e, ...t }) {
	return /* @__PURE__ */ b(He, {
		"data-slot": "collapsible-content",
		className: Sn("overflow-hidden text-start", e),
		...t
	});
}
//#endregion
//#region src/components/ui/input.tsx
function Y({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ b("input", {
		type: t,
		"data-slot": "input",
		className: Sn("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/textarea.tsx
function Mn({ className: e, ...t }) {
	return /* @__PURE__ */ b("textarea", {
		"data-slot": "textarea",
		className: Sn("flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-start shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40", e),
		...t
	});
}
//#endregion
//#region src/lib/marketplace-api.ts
function Nn(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function Pn(e) {
	"@babel/helpers - typeof";
	return Pn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, Pn(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function Fn(e, t) {
	if (Pn(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (Pn(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function In(e) {
	var t = Fn(e, "string");
	return Pn(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function Ln(e, t, n) {
	return (t = In(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/lib/apiError.ts
var X = class extends Error {
	constructor(e, t) {
		super(e), Ln(this, "code", void 0), Ln(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, Rn = {
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
function zn(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function Bn(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function Vn(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(Nn(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function Hn(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return Vn(e, n);
	if (t instanceof X && t.code) {
		let n = Rn[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = Rn[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return zn(n) ? e("errors.api.timeout") : Bn(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function Z(e, t) {
	v.error(Hn(e, t));
}
//#endregion
//#region src/lib/safeUrl.ts
function Un(e) {
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
function Wn() {
	return window.webinoDashboard;
}
var Gn = 3e4;
function Kn(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function qn(e) {
	let t = Wn();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (Kn(e) || Un(e)) return e;
	throw new X("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function Jn(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function Yn(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : /^(payments|torobpay|snapppay|digipay|zarinpal|bale-pay|wallet|c2c)(\/|$)/.test(t) ? "webino_dashboard_payments_rest" : null;
}
function Xn(e, t) {
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
function Zn(e, t) {
	let n = e.toLowerCase();
	return e.includes("Upstream Error") || e.includes("Forbidden") || t === 403 ? "admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry" : n.includes("timed out") || n.includes("timeout") || t === 504 || t === 524 ? "Request timed out — RSA-4096 generation can take over a minute on weak hosts" : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? `Invalid AJAX response (HTML, HTTP ${t || 0})` : `Invalid AJAX response (HTTP ${t || 0})`;
}
async function Qn(e, t, n = {}) {
	let r = Yn(e), i = Wn();
	if (!r || !i.ajaxUrl) throw new X("AJAX fallback unavailable", {
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
	let { signal: l, clear: u } = Jn({}, t);
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
			throw new X(Zn(t, e.status), {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!n.success) throw new X(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
			code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
			status: e.status
		});
		return n.data;
	} catch (e) {
		throw e instanceof X ? e : e instanceof DOMException && e.name === "AbortError" ? new X("Request timed out", {
			code: "timeout",
			status: 0
		}) : e instanceof TypeError ? new X("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		u();
	}
}
async function Q(e, t = {}, n = Gn) {
	if (Yn(e) && Wn().ajaxUrl) return Qn(e, n, t);
	let r = qn(e), i = Wn(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce), !Object.keys(a).some((e) => e.toLowerCase() === "content-type") && typeof t.body == "string" && t.body.length > 0 && (a["Content-Type"] = "application/json");
	let { signal: s, clear: c } = Jn(t, n);
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
			let t = Xn(n, e.status);
			throw new X(t.message, {
				code: t.code,
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i;
			throw new X(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
		}
		return i;
	} catch (e) {
		throw e instanceof X ? e : e instanceof DOMException && e.name === "AbortError" ? new X("Request timed out", {
			code: "timeout",
			status: 0
		}) : e instanceof TypeError ? new X("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region ../Modules/basalam-module/client/pages/basalam/BasalamHomePage.tsx
function $n() {
	let { t: r } = _(), i = n(), [a, o] = g(), [s, c] = f("90"), [u, d] = f(!1), [m, h] = f(""), [y, S] = f(""), [C, w] = f(""), [T, E] = f(""), D = t({
		queryKey: ["basalam", "status"],
		queryFn: () => Q("basalam/status"),
		refetchInterval: 15e3
	}), O = t({
		queryKey: ["basalam", "vendor"],
		queryFn: () => Q("basalam/vendor"),
		enabled: !!D.data?.connected
	});
	l(() => {
		let e = a.get("oauth");
		if (e === "error") {
			let e = a.get("reason");
			v.error(r(e === "vendor" ? "basalam.oauthVendorError" : "basalam.oauthError"));
			let t = new URLSearchParams(a);
			t.delete("oauth"), t.delete("reason"), o(t, { replace: !0 });
			return;
		}
		if (e === "connected" || e === "success") {
			i.invalidateQueries({ queryKey: ["basalam"] });
			let e = new URLSearchParams(a);
			e.delete("oauth"), o(e, { replace: !0 });
		}
	}, [
		a,
		i,
		o,
		r
	]), l(() => {
		let e = a.get("access_token"), t = a.get("oauth");
		if (!e || t !== "handoff" && !a.get("webino_sig")) return;
		let n = !1;
		return (async () => {
			try {
				if (await Q("basalam/oauth/complete", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ callback_url: window.location.href })
				}), n) return;
				v.success(r("basalam.oauthConnected")), await i.invalidateQueries({ queryKey: ["basalam"] });
				let e = a.get("return_url"), t = [
					"access_token",
					"refresh_token",
					"expires_in",
					"vendor_id",
					"is_vendor",
					"webino_sig",
					"webino_ts",
					"webino_hk",
					"oauth",
					"return_url",
					"page",
					"reason"
				];
				if (e) try {
					let t = new URL(e, window.location.origin);
					if (t.origin === window.location.origin) {
						window.location.replace(t.toString());
						return;
					}
				} catch {}
				let s = new URLSearchParams(a);
				for (let e of t) s.delete(e);
				o(s, { replace: !0 });
			} catch (e) {
				n || Z(r, e);
			}
		})(), () => {
			n = !0;
		};
	}, []);
	let k = e({
		mutationFn: () => {
			let e = `${window.location.origin}${window.location.pathname}`;
			return Q("basalam/oauth/start", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ return_url: e })
			});
		},
		onSuccess: (e) => {
			if (e.url) {
				window.location.href = e.url;
				return;
			}
			v.error(r("basalam.oauthMissingUrl"));
		},
		onError: (e) => Z(r, e)
	}), A = e({
		mutationFn: (e) => Q("basalam/oauth/complete", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ callback_url: e })
		}),
		onSuccess: async () => {
			v.success(r("basalam.oauthConnected")), h(""), await i.invalidateQueries({ queryKey: ["basalam"] });
		},
		onError: (e) => Z(r, e)
	}), j = e({
		mutationFn: () => Q("basalam/oauth/manual", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				access_token: y.trim(),
				refresh_token: C.trim(),
				vendor_id: T.trim() || void 0
			})
		}),
		onSuccess: async () => {
			v.success(r("basalam.oauthConnected")), S(""), w(""), E(""), await i.invalidateQueries({ queryKey: ["basalam"] });
		},
		onError: (e) => Z(r, e)
	}), M = e({
		mutationFn: () => Q("basalam/oauth/disconnect", { method: "POST" }),
		onSuccess: async () => {
			v.success(r("basalam.disconnected")), await i.invalidateQueries({ queryKey: ["basalam"] });
		},
		onError: (e) => Z(r, e)
	}), N = e({
		mutationFn: () => Q("basalam/webhook/setup", { method: "POST" }),
		onSuccess: async () => {
			v.success(r("basalam.webhookConfigured")), await i.invalidateQueries({ queryKey: ["basalam"] });
		},
		onError: (e) => Z(r, e)
	}), ee = e({
		mutationFn: () => Q("basalam/sync/orders/pull", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ days: Number(s) || 90 })
		}),
		onSuccess: async () => {
			v.success(r("basalam.ordersPullQueued", { days: s })), await i.invalidateQueries({ queryKey: ["basalam"] });
		},
		onError: (e) => Z(r, e)
	}), P = e({
		mutationFn: () => Q("basalam/sync/products/sync-now", { method: "POST" }),
		onSuccess: () => v.success(r("basalam.productsSyncQueued")),
		onError: (e) => Z(r, e)
	}), F = D.data, I = !!F?.connected, te = O.data?.vendor?.title || (F?.vendor_title ? String(F.vendor_title) : "") || (F?.vendor_id ? r("basalam.boothNamed", { id: String(F.vendor_id) }) : "");
	return /* @__PURE__ */ x(En, {
		title: r("basalam.title"),
		description: r("basalam.subtitle"),
		children: [/* @__PURE__ */ b(Tn, {}), /* @__PURE__ */ x("div", {
			className: "grid max-w-3xl gap-4",
			children: [
				/* @__PURE__ */ x(G, { children: [/* @__PURE__ */ b(K, { children: /* @__PURE__ */ b(q, { children: r("basalam.connection") }) }), /* @__PURE__ */ x(J, {
					className: "space-y-4",
					children: [/* @__PURE__ */ x("p", {
						className: "text-sm",
						children: [I ? /* @__PURE__ */ b("span", {
							className: "text-emerald-700 dark:text-emerald-400",
							children: r("basalam.connected")
						}) : /* @__PURE__ */ b("span", { children: r("basalam.notConnected") }), I && te ? /* @__PURE__ */ x("span", {
							className: "text-muted-foreground",
							children: [" — ", te]
						}) : null]
					}), /* @__PURE__ */ b("div", {
						className: "flex flex-wrap gap-2",
						children: I ? /* @__PURE__ */ b(W, {
							variant: "outline",
							onClick: () => M.mutate(),
							disabled: M.isPending,
							children: r("basalam.disconnect")
						}) : /* @__PURE__ */ b(W, {
							onClick: () => k.mutate(),
							disabled: k.isPending,
							children: r("basalam.connectOAuth")
						})
					})]
				})] }),
				I ? /* @__PURE__ */ x(G, { children: [/* @__PURE__ */ b(K, { children: /* @__PURE__ */ b(q, { children: r("basalam.operations") }) }), /* @__PURE__ */ x(J, {
					className: "flex flex-wrap items-end gap-2",
					children: [
						/* @__PURE__ */ x("div", {
							className: "flex flex-col gap-1",
							children: [/* @__PURE__ */ b("label", {
								htmlFor: "basalam-pull-days",
								className: "text-muted-foreground text-xs font-medium",
								children: r("basalam.pullOrdersDays")
							}), /* @__PURE__ */ x("select", {
								id: "basalam-pull-days",
								className: "border-input bg-background h-9 min-w-[9rem] rounded-md border px-3 text-sm",
								value: s,
								onChange: (e) => c(e.target.value),
								children: [
									/* @__PURE__ */ b("option", {
										value: "7",
										children: r("basalam.pullDays.7")
									}),
									/* @__PURE__ */ b("option", {
										value: "30",
										children: r("basalam.pullDays.30")
									}),
									/* @__PURE__ */ b("option", {
										value: "90",
										children: r("basalam.pullDays.90")
									}),
									/* @__PURE__ */ b("option", {
										value: "180",
										children: r("basalam.pullDays.180")
									}),
									/* @__PURE__ */ b("option", {
										value: "365",
										children: r("basalam.pullDays.365")
									})
								]
							})]
						}),
						/* @__PURE__ */ b(W, {
							onClick: () => ee.mutate(),
							disabled: ee.isPending,
							children: r("basalam.pullOrders")
						}),
						/* @__PURE__ */ b(W, {
							variant: "secondary",
							onClick: () => P.mutate(),
							disabled: P.isPending,
							children: r("basalam.syncProductsNow")
						}),
						/* @__PURE__ */ b(W, {
							variant: "secondary",
							onClick: () => N.mutate(),
							disabled: N.isPending,
							children: r("basalam.setupWebhook")
						}),
						/* @__PURE__ */ b(W, {
							asChild: !0,
							variant: "outline",
							children: /* @__PURE__ */ b(p, {
								to: "/settings/shop/basalam/products",
								children: r("basalam.nav.products")
							})
						}),
						/* @__PURE__ */ b(W, {
							asChild: !0,
							variant: "outline",
							children: /* @__PURE__ */ b(p, {
								to: "/settings/shop/pricing/marketplaces",
								children: r("basalam.openPricing")
							})
						}),
						/* @__PURE__ */ b(W, {
							asChild: !0,
							variant: "outline",
							children: /* @__PURE__ */ b(p, {
								to: "/settings/shop/basalam/settings",
								children: r("basalam.nav.settings")
							})
						})
					]
				})] }) : null,
				/* @__PURE__ */ b(kn, {
					open: u,
					onOpenChange: d,
					children: /* @__PURE__ */ x(G, { children: [/* @__PURE__ */ b(K, {
						className: "pb-3",
						children: /* @__PURE__ */ b(An, {
							asChild: !0,
							children: /* @__PURE__ */ x("button", {
								type: "button",
								className: "flex w-full items-center justify-between text-start",
								children: [/* @__PURE__ */ b(q, {
									className: "text-base",
									children: r("basalam.advanced")
								}), /* @__PURE__ */ b(L, { className: `size-4 transition-transform ${u ? "rotate-180" : ""}` })]
							})
						})
					}), /* @__PURE__ */ b(jn, { children: /* @__PURE__ */ x(J, {
						className: "space-y-5 border-t pt-4",
						children: [
							/* @__PURE__ */ x("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ b("p", {
										className: "text-sm font-medium",
										children: r("basalam.oauthPasteTitle")
									}),
									/* @__PURE__ */ b(Mn, {
										value: m,
										onChange: (e) => h(e.target.value),
										placeholder: r("basalam.oauthPastePlaceholder"),
										rows: 2
									}),
									/* @__PURE__ */ b(W, {
										size: "sm",
										variant: "secondary",
										disabled: A.isPending || !m.trim(),
										onClick: () => A.mutate(m.trim()),
										children: r("basalam.oauthPasteSave")
									})
								]
							}),
							/* @__PURE__ */ x("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ b("p", {
										className: "text-sm font-medium",
										children: r("basalam.manualTokenTitle")
									}),
									/* @__PURE__ */ b(Y, {
										value: y,
										onChange: (e) => S(e.target.value),
										placeholder: r("basalam.fieldAccess")
									}),
									/* @__PURE__ */ b(Y, {
										value: C,
										onChange: (e) => w(e.target.value),
										placeholder: r("basalam.fieldRefresh")
									}),
									/* @__PURE__ */ b(Y, {
										value: T,
										onChange: (e) => E(e.target.value),
										placeholder: r("basalam.fieldVendorOptional")
									}),
									/* @__PURE__ */ b(W, {
										size: "sm",
										variant: "secondary",
										disabled: j.isPending || !y.trim(),
										onClick: () => j.mutate(),
										children: r("basalam.manualTokenSave")
									})
								]
							}),
							F?.webhook_url ? /* @__PURE__ */ x("div", {
								className: "space-y-1",
								children: [
									/* @__PURE__ */ b("p", {
										className: "text-sm font-medium",
										children: r("basalam.webhook")
									}),
									/* @__PURE__ */ b("code", {
										className: "bg-muted block overflow-x-auto rounded-md p-2 text-xs",
										children: F.webhook_url
									}),
									/* @__PURE__ */ b("p", {
										className: "text-muted-foreground text-xs",
										children: F.webhook_id ? r("basalam.webhookConfigured") : r("basalam.webhookPending")
									})
								]
							}) : null
						]
					}) })] })
				})
			]
		})]
	});
}
//#endregion
//#region node_modules/dayjs/dayjs.min.js
var er = /* @__PURE__ */ k(((e, t) => {
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
		}(), D = E.prototype;
		return w.prototype = D, [
			["$ms", r],
			["$s", i],
			["$m", a],
			["$H", o],
			["$W", s],
			["$M", l],
			["$y", d],
			["$D", f]
		].forEach((function(e) {
			D[e[1]] = function(t) {
				return this.$g(t, e[0], e[1]);
			};
		})), w.extend = function(e, t) {
			return e.$i || (e(t, E, w), e.$i = !0), w;
		}, w.locale = C, w.isDayjs = S, w.unix = function(e) {
			return w(1e3 * e);
		}, w.en = b[y], w.Ls = b, w.p = {}, w;
	}));
})), tr = /* @__PURE__ */ k(((e, t) => {
	(function(n, r) {
		typeof e == "object" && t !== void 0 ? t.exports = r(er()) : typeof define == "function" && define.amd ? define(["dayjs"], r) : (n = typeof globalThis < "u" ? globalThis : n || self).dayjs_locale_fa = r(n.dayjs);
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
})), nr = /* @__PURE__ */ k(((e, t) => {
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
})), rr = /* @__PURE__ */ j(er(), 1), ir = /* @__PURE__ */ j(nr(), 1), ar = /* @__PURE__ */ j(tr(), 1);
function or(e, t, n) {
	let r = $((e + $(t - 8, 6) + 100100) * 1461, 4) + $(153 * lr(t + 9, 12) + 2, 5) + n - 34840408;
	return r = r - $($(e + 100100 + $(t - 8, 6), 100) * 3, 4) + 752, r;
}
var sr = [
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
], cr = Math.floor;
function lr(e, t) {
	return e - ~~(e / t) * t;
}
function $(e, t) {
	return ~~(e / t);
}
function ur(e, t) {
	let n = sr.length, r = e + 621, i = -14, a = sr[0], o, s, c, l;
	if (e < a || e >= sr[n - 1]) throw Error(`Invalid Jalaali year ${e}`);
	for (let t = 1; t < n && (o = sr[t], s = o - a, !(e < o)); t += 1) i = i + $(s, 33) * 8 + $(lr(s, 33), 4), a = o;
	l = e - a, i = i + $(l, 33) * 8 + $(lr(l, 33) + 3, 4), lr(s, 33) === 4 && s - l === 4 && (i += 1);
	let u = $(r, 4) - $(($(r, 100) + 1) * 3, 4) - 150, d = 20 + i - u;
	return t ? {
		gy: r,
		march: d
	} : (s - l < 6 && (l = l - s + $(s + 4, 33) * 33), c = lr(lr(l + 1, 33) - 1, 4), c === -1 && (c = 4), {
		leap: c,
		gy: r,
		march: d
	});
}
function dr(e, t, n) {
	let r = ur(e, !0);
	return or(r.gy, 3, r.march) + (t - 1) * 31 - $(t, 7) * (t - 7) + n - 1;
}
function fr(e) {
	let t = 4 * e + 139361631;
	t = t + $($(4 * e + 183187720, 146097) * 3, 4) * 4 - 3908;
	let n = $(lr(t, 1461), 4) * 5 + 308, r = $(lr(n, 153), 5) + 1, i = lr($(n, 153), 12) + 1;
	return [
		$(t, 1461) - 100100 + $(8 - i, 6),
		i,
		r
	];
}
function pr(e, t, n) {
	return fr(dr(e, t, n));
}
function mr(e, t, n) {
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
	return a = cr((o + 3) / 4) + 365 * e - cr((o + 99) / 100) - 80 + i[t - 1] + cr((o + 399) / 400) + n, r.year += 33 * cr(a / 12053), a %= 12053, r.year += 4 * cr(a / 1461), a %= 1461, a > 365 && (r.year += cr((a - 1) / 365), a = (a - 1) % 365), r.month = a < 186 ? 1 + cr(a / 31) : 7 + cr((a - 186) / 30), r.day = 1 + (a < 186 ? a % 31 : (a - 186) % 30), [
		r.year,
		r.month,
		r.day
	];
}
var hr = {
	J: (e, t, n) => mr(e, t, n),
	G: (e, t, n) => pr(e, t, n)
}, gr = /^(\d{4})[-/]?(\d{1,2})[-/]?(\d{0,2})(.*)$/, _r = /\[.*?\]|jY{2,4}|jM{1,4}|jD{1,2}|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, vr = "date", yr = "day", br = "month", xr = "year", Sr = "week", Cr = "YYYY-MM-DDTHH:mm:ssZ", wr = { jmonths: "فروردین_اردیبهشت_خرداد_تیر_مرداد_شهریور_مهر_آبان_آذر_دی_بهمن_اسفند".split("_") }, Tr = (e, t, n) => {
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
		...ar.default,
		...wr
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
			let t = e.date.match(gr);
			if (t) {
				let [n, r, i] = hr.G(Number.parseInt(t[1], 10), Number.parseInt(t[2], 10), Number.parseInt(t[3] || 1, 10));
				e.date = `${n}-${r}-${i}${t[4] || ""}`;
			}
		}
		return f.bind(this)(e);
	}, r.InitJalali = function() {
		let [e, t, n] = hr.J(this.$y, this.$M + 1, this.$D);
		this.$jy = e, this.$jM = t - 1, this.$jD = n;
	}, r.startOf = function(e, t) {
		if (!a(this)) return m.bind(this)(e, t);
		let r = s(t) ? !0 : t, i = o(e), c = (e, t, n = this.$jy) => {
			let [i, a, o] = hr.G(n, t + 1, e), s = w(new Date(i, a - 1, o), this);
			return (r ? s : s.endOf(yr)).$set("hour", 1);
		}, l = (this.$W + (7 - n.$fdow)) % 7;
		switch (i) {
			case xr: return r ? c(1, 0) : c(0, 0, this.$jy + 1);
			case br: return r ? c(1, this.$jM) : c(0, (this.$jM + 1) % 12, this.$jy + Math.floor((this.$jM + 1) / 12));
			case Sr: return c(r ? this.$jD - l : this.$jD + (6 - l), this.$jM);
			default: return m.bind(this)(e, t);
		}
	}, r.$set = function(e, t) {
		if (!a(this)) return h.bind(this)(e, t);
		let n = o(e), r = (e, t, n = this.$jy) => {
			let [r, i, a] = hr.G(n, t + 1, e);
			return this.$d.setFullYear(r), this.$d.setMonth(i - 1), this.$d.setDate(a), this;
		};
		switch (n) {
			case vr:
			case yr:
				r(t, this.$jM);
				break;
			case br:
				r(this.$jD, t);
				break;
			case xr:
				r(this.$jD, this.$jM, t);
				break;
			default: return h.bind(this)(e, t);
		}
		return this.init(), this;
	}, r.add = function(e, t) {
		if (!a(this)) return g.bind(this)(e, t);
		e = Number(e);
		let n = t && (t.length === 1 || t === "ms") ? t : o(t), r = (t, n) => {
			let r = this.set(vr, 1).set(t, n + e);
			return r.set(vr, Math.min(this.$jD, r.daysInMonth()));
		};
		if (["M", br].includes(n)) {
			let t = this.$jM + e, n = t < 0 ? -Math.ceil(-t / 12) : Math.floor(t / 12), r = this.$jD, i = this.set(yr, 1).add(n, xr).set(br, t - n * 12);
			return i.set(yr, Math.min(i.daysInMonth(), r));
		}
		if (["y", xr].includes(n)) return r(xr, this.$jy);
		if (["d", yr].includes(n)) {
			let t = new Date(this.$d);
			return t.setDate(t.getDate() + e), w(t, this);
		}
		if (["w", Sr].includes(n)) {
			let t = new Date(this.$d);
			return t.setDate(t.getDate() + e * 7), w(t, this);
		}
		return g.bind(this)(e, t);
	}, r.format = function(e, t) {
		if (!a(this)) return _.bind(this)(e, t);
		let n = e || Cr, { jmonths: r } = t || this.$locale();
		return n.replace(_r, (e) => {
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
			case xr:
				c /= 12;
				break;
			case br: break;
			default: return v.bind(this)(e, t, r);
		}
		return r ? c : u(c);
	}, r.$g = function(e, t, n) {
		return s(e) ? this[t] : this.set(n, e);
	}, r.year = function(e) {
		return a(this) ? this.$g(e, "$jy", xr) : y.bind(this)(e);
	}, r.month = function(e) {
		return a(this) ? this.$g(e, "$jM", br) : b.bind(this)(e);
	}, r.date = function(e) {
		return a(this) ? this.$g(e, "$jD", yr) : x.bind(this)(e);
	}, r.daysInMonth = function() {
		return a(this) ? this.endOf(br).$jD : S.bind(this)();
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
};
function Er(e) {
	return e.toLowerCase().startsWith("fa");
}
function Dr(e) {
	return e.replace(/\d/g, (e) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(e, 10)] ?? e);
}
rr.default.extend(Tr), rr.default.extend(ir.default);
function Or(e) {
	if (e == null || e === "") return !0;
	if (typeof e == "number") return !Number.isFinite(e) || e <= 0;
	if (typeof e == "string") {
		let t = e.trim();
		if (!t || t === "0" || t === "null" || t === "undefined") return !0;
		if (/^\d+$/.test(t)) return Number(t) <= 0;
	}
	return !1;
}
function kr(...e) {
	for (let t of e) if (!Or(t)) {
		if (typeof t == "number") return t;
		if (typeof t == "string") {
			let e = t.trim();
			return /^\d+$/.test(e) ? Number(e) : e;
		}
	}
}
function Ar(e) {
	if (typeof e == "number") return rr.default.unix(e);
	let t = String(e).trim();
	return /^\d+$/.test(t) ? rr.default.unix(Number(t)) : (0, rr.default)(t);
}
function jr(e, t, n = "—") {
	if (Or(e)) return n;
	let r = Ar(e);
	if (!r.isValid()) return n;
	if (Er(t)) {
		let e = S.t("date.timeSeparator");
		return Dr(r.calendar("jalali").locale("fa").format(`D MMMM YYYY${e}HH:mm`));
	}
	return r.locale("en").format("YYYY-MM-DD HH:mm");
}
//#endregion
//#region ../Modules/basalam-module/client/lib/basalamJobs.ts
function Mr(e) {
	return kr(e.failed_at, e.completed_at, e.started_at, e.created_at, e.updated_at);
}
function Nr(e, t) {
	if (!e || e === "null" || e === "undefined") return "—";
	let n = String(e).trim();
	if (!n) return "—";
	if (n === "cancelled" || n === "user_cancelled") return t("basalam.jobError.cancelled");
	if (n.startsWith("{") || n.startsWith("[")) try {
		let e = JSON.parse(n);
		if (e && typeof e == "object" && !Array.isArray(e)) {
			let t = Object.values(e).map((e) => typeof e == "string" ? e : e == null ? "" : String(e)).filter(Boolean);
			if (t.length) return t[t.length - 1];
		}
		if (Array.isArray(e) && e.length) {
			let t = e[e.length - 1];
			return typeof t == "string" ? t : String(t);
		}
	} catch {}
	return n;
}
var Pr = {
	sync_basalam_create_all_products: "basalam.job.createAllProducts",
	sync_basalam_update_all_products: "basalam.job.updateAllProducts",
	sync_basalam_bulk_update_products: "basalam.job.bulkUpdateProducts",
	sync_basalam_create_single_product: "basalam.job.createProduct",
	sync_basalam_update_single_product: "basalam.job.updateProduct",
	sync_basalam_auto_connect_products: "basalam.job.autoConnect",
	sync_basalam_fetch_orders: "basalam.job.fetchOrders",
	sync_basalam_quick_update: "basalam.job.quickUpdate",
	webino_basalam_discount_tasks: "basalam.job.discounts"
}, Fr = {
	pending: "basalam.jobStatus.pending",
	processing: "basalam.jobStatus.processing",
	completed: "basalam.jobStatus.completed",
	failed: "basalam.jobStatus.failed",
	success: "basalam.jobStatus.completed"
};
function Ir(e) {
	return String(e.job_type || e.type || "");
}
function Lr(e, t) {
	if (!e) return "—";
	let n = Pr[e];
	return n ? t(n) : t(`basalam.job.${e}`, { defaultValue: e.replace(/^sync_basalam_/, "").replace(/_/g, " ") });
}
function Rr(e, t) {
	if (!e) return "—";
	let n = Fr[e];
	return n ? t(n) : t(`basalam.jobStatus.${e}`, { defaultValue: e });
}
//#endregion
//#region ../Modules/basalam-module/client/pages/basalam/BasalamProductsPage.tsx
function zr() {
	let { t: r, i18n: i } = _(), a = n(), [o, s] = f("all"), [c, l] = f({}), u = t({
		queryKey: [
			"basalam",
			"products",
			o
		],
		queryFn: () => Q(`basalam/products?filter=${o}&per_page=50`),
		refetchInterval: 15e3
	}), d = t({
		queryKey: ["basalam", "jobs"],
		queryFn: () => Q("basalam/jobs"),
		refetchInterval: 5e3
	}), p = e({
		mutationFn: (e) => Q(e, { method: "POST" }),
		onSuccess: async (e, t) => {
			if (t.includes("jobs/cancel")) v.success(r("basalam.jobsCancelled"));
			else if (t.includes("create-all")) {
				let t = Number(e?.creatable_count ?? 0);
				t <= 0 ? v.message(r("basalam.createAllNoneEligible")) : v.success(r("basalam.createAllQueued", { count: t }));
			} else v.success(r("basalam.jobQueued"));
			await a.invalidateQueries({ queryKey: ["basalam"] });
		},
		onError: (e) => Z(r, e)
	}), m = e({
		mutationFn: (e) => Q(e.path, {
			method: "POST",
			body: JSON.stringify(e.payload)
		}),
		onSuccess: async () => {
			v.success(r("basalam.jobQueued")), await a.invalidateQueries({ queryKey: ["basalam"] });
		},
		onError: (e) => Z(r, e)
	});
	return /* @__PURE__ */ x(En, {
		title: r("basalam.productsTitle"),
		description: r("basalam.productsSubtitle"),
		children: [
			/* @__PURE__ */ b(Tn, {}),
			/* @__PURE__ */ x(G, {
				className: "mb-4",
				children: [/* @__PURE__ */ b(K, { children: /* @__PURE__ */ b(q, { children: r("basalam.productActions") }) }), /* @__PURE__ */ x(J, {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ b(W, {
							onClick: () => p.mutate("basalam/sync/products/create-all"),
							children: r("basalam.createAll")
						}),
						/* @__PURE__ */ b(W, {
							variant: "secondary",
							onClick: () => p.mutate("basalam/sync/products/update-all"),
							children: r("basalam.updateAll")
						}),
						/* @__PURE__ */ b(W, {
							variant: "secondary",
							onClick: () => Q("basalam/sync/products/update-all", {
								method: "POST",
								body: JSON.stringify({ mode: "quick" })
							}).then(async () => {
								v.success(r("basalam.jobQueued")), await a.invalidateQueries({ queryKey: ["basalam", "jobs"] });
							}).catch((e) => Z(r, e)),
							children: r("basalam.quickUpdate")
						}),
						/* @__PURE__ */ b(W, {
							variant: "outline",
							onClick: () => p.mutate("basalam/sync/products/connect-all"),
							children: r("basalam.autoConnect")
						}),
						/* @__PURE__ */ b(W, {
							variant: "destructive",
							onClick: () => {
								window.confirm(r("basalam.cancelJobsConfirm")) && p.mutate("basalam/jobs/cancel");
							},
							children: r("basalam.cancelJobs")
						})
					]
				})]
			}),
			/* @__PURE__ */ x(G, {
				className: "mb-4",
				children: [/* @__PURE__ */ b(K, { children: /* @__PURE__ */ b(q, { children: r("basalam.productList") }) }), /* @__PURE__ */ x(J, {
					className: "space-y-3",
					children: [/* @__PURE__ */ x("div", {
						className: "flex flex-wrap gap-2",
						children: [[
							"all",
							"connected",
							"unconnected"
						].map((e) => /* @__PURE__ */ b(W, {
							size: "sm",
							variant: o === e ? "default" : "outline",
							onClick: () => s(e),
							children: r(`basalam.filter.${e}`)
						}, e)), /* @__PURE__ */ x("span", {
							className: "text-muted-foreground self-center text-xs",
							children: [
								r("basalam.total"),
								": ",
								u.data?.total ?? 0
							]
						})]
					}), /* @__PURE__ */ b("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ x("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ b("thead", { children: /* @__PURE__ */ x("tr", {
								className: "border-b text-start",
								children: [
									/* @__PURE__ */ b("th", {
										className: "py-2 pe-2",
										children: "ID"
									}),
									/* @__PURE__ */ b("th", {
										className: "py-2 pe-2",
										children: r("basalam.col.name")
									}),
									/* @__PURE__ */ b("th", {
										className: "py-2 pe-2",
										children: r("basalam.col.basalamId")
									}),
									/* @__PURE__ */ b("th", {
										className: "py-2 pe-2",
										children: r("basalam.col.status")
									}),
									/* @__PURE__ */ b("th", {
										className: "py-2",
										children: r("basalam.col.actions")
									})
								]
							}) }), /* @__PURE__ */ b("tbody", { children: (u.data?.products ?? []).map((e) => /* @__PURE__ */ x("tr", {
								className: "border-b",
								children: [
									/* @__PURE__ */ b("td", {
										className: "py-2 pe-2",
										children: e.id
									}),
									/* @__PURE__ */ b("td", {
										className: "py-2 pe-2",
										children: e.name
									}),
									/* @__PURE__ */ b("td", {
										className: "py-2 pe-2",
										children: (e.basalam_product_ids && e.basalam_product_ids.length > 1 ? e.basalam_product_ids.join(", ") : null) ?? e.basalam_product_id ?? "—"
									}),
									/* @__PURE__ */ b("td", {
										className: "py-2 pe-2",
										children: e.connected ? r("basalam.connected") : r("basalam.notConnected")
									}),
									/* @__PURE__ */ x("td", {
										className: "flex flex-wrap gap-1 py-2",
										children: [e.connected ? /* @__PURE__ */ b(W, {
											size: "sm",
											variant: "secondary",
											onClick: () => m.mutate({
												path: "basalam/sync/products/update",
												payload: { product_id: e.id }
											}),
											children: r("basalam.updateOne")
										}) : /* @__PURE__ */ b(W, {
											size: "sm",
											onClick: () => m.mutate({
												path: "basalam/sync/products/create",
												payload: { product_id: e.id }
											}),
											children: r("basalam.createOne")
										}), e.connected ? /* @__PURE__ */ x(y, { children: [
											/* @__PURE__ */ b(W, {
												size: "sm",
												variant: "outline",
												onClick: () => m.mutate({
													path: "basalam/sync/products/disconnect",
													payload: { product_id: e.id }
												}),
												children: r("basalam.disconnect")
											}),
											/* @__PURE__ */ b(W, {
												size: "sm",
												variant: "outline",
												onClick: () => m.mutate({
													path: "basalam/sync/products/archive",
													payload: { product_id: e.id }
												}),
												children: r("basalam.archiveOne")
											}),
											/* @__PURE__ */ b(W, {
												size: "sm",
												variant: "outline",
												onClick: () => m.mutate({
													path: "basalam/sync/products/restore",
													payload: { product_id: e.id }
												}),
												children: r("basalam.restoreOne")
											})
										] }) : /* @__PURE__ */ x("div", {
											className: "flex flex-wrap gap-1",
											children: [/* @__PURE__ */ b(Y, {
												className: "h-8 max-w-[8rem]",
												placeholder: "Basalam ID",
												value: c[e.id] ?? "",
												onChange: (t) => l((n) => ({
													...n,
													[e.id]: t.target.value
												}))
											}), /* @__PURE__ */ b(W, {
												size: "sm",
												variant: "outline",
												disabled: !c[e.id],
												onClick: () => m.mutate({
													path: "basalam/sync/products/connect",
													payload: {
														product_id: e.id,
														basalam_product_id: Number(c[e.id]) || 0
													}
												}),
												children: r("basalam.connectOne")
											})]
										})]
									})
								]
							}, e.id)) })]
						})
					})]
				})]
			}),
			/* @__PURE__ */ x(G, { children: [/* @__PURE__ */ b(K, { children: /* @__PURE__ */ b(q, { children: r("basalam.recentJobs") }) }), /* @__PURE__ */ b(J, { children: /* @__PURE__ */ b("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ x("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ b("thead", { children: /* @__PURE__ */ x("tr", {
						className: "border-b text-start",
						children: [
							/* @__PURE__ */ b("th", {
								className: "py-2 pe-2",
								children: "ID"
							}),
							/* @__PURE__ */ b("th", {
								className: "py-2 pe-2",
								children: r("basalam.col.type")
							}),
							/* @__PURE__ */ b("th", {
								className: "py-2 pe-2",
								children: r("basalam.col.status")
							}),
							/* @__PURE__ */ b("th", {
								className: "py-2 pe-2",
								children: r("basalam.col.time")
							}),
							/* @__PURE__ */ b("th", {
								className: "py-2",
								children: r("basalam.col.error")
							})
						]
					}) }), /* @__PURE__ */ b("tbody", { children: (d.data?.jobs ?? []).slice(0, 30).map((e) => /* @__PURE__ */ x("tr", {
						className: "border-b align-top",
						children: [
							/* @__PURE__ */ b("td", {
								className: "py-2 pe-2",
								children: e.id
							}),
							/* @__PURE__ */ b("td", {
								className: "py-2 pe-2",
								children: Lr(Ir(e), r)
							}),
							/* @__PURE__ */ b("td", {
								className: "py-2 pe-2",
								children: Rr(e.status, r)
							}),
							/* @__PURE__ */ b("td", {
								className: "text-muted-foreground py-2 pe-2 text-xs",
								children: jr(Mr(e), i.language)
							}),
							/* @__PURE__ */ b("td", {
								className: "text-muted-foreground max-w-md break-all py-2 text-xs",
								children: Nr(e.error_message, r)
							})
						]
					}, String(e.id))) })]
				})
			}) })] })
		]
	});
}
//#endregion
//#region ../Modules/basalam-module/client/pages/basalam/BasalamOrdersPage.tsx
function Br() {
	return /* @__PURE__ */ b(m, {
		to: "/orders?marketplace=basalam",
		replace: !0
	});
}
//#endregion
//#region ../Modules/basalam-module/client/pages/basalam/BasalamCategoriesPage.tsx
function Vr(e) {
	return String(e.title ?? e.name ?? e.id);
}
function Hr(e) {
	if (!e) return [];
	if (Array.isArray(e)) return e;
	if (typeof e == "object") {
		let t = e;
		if (Array.isArray(t.data)) return t.data;
		if (Array.isArray(t.categories)) return t.categories;
		if (Array.isArray(t.children)) return t.children;
	}
	return [];
}
function Ur(e) {
	return e ? Array.isArray(e.children) && e.children.length ? e.children : Array.isArray(e.category) && e.category.length ? e.category : [] : [];
}
function Wr() {
	let { t: r } = _(), i = n(), [a, o] = f(""), [s, c] = f(""), [l, d] = f(""), [p, m] = f(""), [h, g] = f(""), [y, S] = f(""), C = t({
		queryKey: ["basalam", "mappings"],
		queryFn: () => Q("basalam/categories/mappings")
	}), w = t({
		queryKey: ["basalam", "option-maps"],
		queryFn: () => Q("basalam/categories/option-maps")
	}), T = t({
		queryKey: ["product-categories", "basalam-map"],
		queryFn: () => Q("shop/product-categories?sort=name_asc&per_page=200")
	}), E = t({
		queryKey: ["basalam", "categories-tree"],
		queryFn: () => Q("basalam/categories")
	}), D = u(() => Hr(E.data?.categories), [E.data]), O = D, k = O.find((e) => String(e.id) === s), A = Ur(k), j = A.find((e) => String(e.id) === l), M = Ur(j), N = (T.data?.items ?? []).find((e) => String(e.id) === a), ee = [
		k,
		j,
		M.find((e) => String(e.id) === p)
	].filter(Boolean).map((e) => Vr(e)).join(" / "), P = e({
		mutationFn: () => Q("basalam/categories/mappings", {
			method: "POST",
			body: JSON.stringify({
				woo_category_id: Number(a) || 0,
				woo_category_name: N?.name || "",
				basalam_category_level1: Number(s) || null,
				basalam_category_level2: Number(l) || null,
				basalam_category_level3: Number(p) || null,
				basalam_category_name: ee
			})
		}),
		onSuccess: async () => {
			v.success(r("basalam.mappingSaved")), await i.invalidateQueries({ queryKey: ["basalam", "mappings"] });
		},
		onError: (e) => Z(r, e)
	}), F = e({
		mutationFn: (e) => Q("basalam/categories/mappings/delete", {
			method: "POST",
			body: JSON.stringify({ id: e })
		}),
		onSuccess: async () => {
			v.success(r("basalam.mappingDeleted")), await i.invalidateQueries({ queryKey: ["basalam", "mappings"] });
		},
		onError: (e) => Z(r, e)
	}), I = e({
		mutationFn: () => Q("basalam/categories/detect", {
			method: "POST",
			body: JSON.stringify({ title: N?.name || "" })
		}),
		onSuccess: (e) => {
			v.success(r("basalam.detectOk"));
			let t = e.prediction;
			if (t && (t.level1 && c(String(t.level1)), t.level2 && d(String(t.level2)), (t.level3 || t.category_id) && m(String(t.level3 || t.category_id)), !t.level1 && t.category_id)) for (let e of D) {
				for (let n of Ur(e)) {
					for (let r of Ur(n)) if (r.id === t.category_id) {
						c(String(e.id)), d(String(n.id)), m(String(r.id));
						return;
					}
					if (n.id === t.category_id) {
						c(String(e.id)), d(String(n.id)), m("");
						return;
					}
				}
				e.id === t.category_id && (c(String(e.id)), d(""), m(""));
			}
		},
		onError: (e) => Z(r, e)
	}), te = e({
		mutationFn: () => Q("basalam/categories/option-maps", {
			method: "POST",
			body: JSON.stringify({
				woo_attr_name: h,
				basalam_attr_name: y
			})
		}),
		onSuccess: async () => {
			v.success(r("basalam.optionMapSaved")), g(""), S(""), await i.invalidateQueries({ queryKey: ["basalam", "option-maps"] });
		},
		onError: (e) => Z(r, e)
	});
	return /* @__PURE__ */ x(En, {
		title: r("basalam.categoriesTitle"),
		description: r("basalam.categoriesSubtitle"),
		children: [
			/* @__PURE__ */ b(Tn, {}),
			/* @__PURE__ */ x(G, {
				className: "mb-4 max-w-3xl",
				children: [/* @__PURE__ */ b(K, { children: /* @__PURE__ */ b(q, { children: r("basalam.addMapping") }) }), /* @__PURE__ */ x(J, {
					className: "grid gap-3 md:grid-cols-2",
					children: [
						/* @__PURE__ */ x("label", {
							className: "space-y-1 text-sm md:col-span-2",
							children: [/* @__PURE__ */ b("span", { children: r("basalam.wooCategory") }), /* @__PURE__ */ x("select", {
								className: "border-input bg-background h-9 w-full rounded-md border px-3 text-sm",
								value: a,
								onChange: (e) => o(e.target.value),
								children: [/* @__PURE__ */ b("option", {
									value: "",
									children: r("basalam.selectWooCategory")
								}), (T.data?.items ?? []).map((e) => /* @__PURE__ */ b("option", {
									value: String(e.id),
									children: e.name
								}, e.id))]
							})]
						}),
						/* @__PURE__ */ x("label", {
							className: "space-y-1 text-sm",
							children: [/* @__PURE__ */ b("span", { children: r("basalam.bslLevel1") }), /* @__PURE__ */ x("select", {
								className: "border-input bg-background h-9 w-full rounded-md border px-3 text-sm",
								value: s,
								onChange: (e) => {
									c(e.target.value), d(""), m("");
								},
								children: [/* @__PURE__ */ b("option", {
									value: "",
									children: r("basalam.selectCategory")
								}), O.map((e) => /* @__PURE__ */ b("option", {
									value: String(e.id),
									children: Vr(e)
								}, e.id))]
							})]
						}),
						/* @__PURE__ */ x("label", {
							className: "space-y-1 text-sm",
							children: [/* @__PURE__ */ b("span", { children: r("basalam.bslLevel2") }), /* @__PURE__ */ x("select", {
								className: "border-input bg-background h-9 w-full rounded-md border px-3 text-sm",
								value: l,
								disabled: !s,
								onChange: (e) => {
									d(e.target.value), m("");
								},
								children: [/* @__PURE__ */ b("option", {
									value: "",
									children: r("basalam.selectCategory")
								}), A.map((e) => /* @__PURE__ */ b("option", {
									value: String(e.id),
									children: Vr(e)
								}, e.id))]
							})]
						}),
						/* @__PURE__ */ x("label", {
							className: "space-y-1 text-sm md:col-span-2",
							children: [/* @__PURE__ */ b("span", { children: r("basalam.bslLevel3") }), /* @__PURE__ */ x("select", {
								className: "border-input bg-background h-9 w-full rounded-md border px-3 text-sm",
								value: p,
								disabled: !l,
								onChange: (e) => m(e.target.value),
								children: [/* @__PURE__ */ b("option", {
									value: "",
									children: r("basalam.selectCategory")
								}), M.map((e) => /* @__PURE__ */ b("option", {
									value: String(e.id),
									children: Vr(e)
								}, e.id))]
							})]
						}),
						/* @__PURE__ */ x("div", {
							className: "flex flex-wrap gap-2 md:col-span-2",
							children: [/* @__PURE__ */ b(W, {
								onClick: () => P.mutate(),
								disabled: P.isPending || !a || !s,
								children: r("basalam.saveMapping")
							}), /* @__PURE__ */ b(W, {
								variant: "secondary",
								onClick: () => I.mutate(),
								disabled: I.isPending || !a,
								children: r("basalam.autoSuggest")
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ x(G, {
				className: "mb-4 max-w-3xl",
				children: [/* @__PURE__ */ b(K, { children: /* @__PURE__ */ b(q, { children: r("basalam.mappings") }) }), /* @__PURE__ */ x(J, {
					className: "space-y-2",
					children: [(C.data?.mappings ?? []).map((e) => /* @__PURE__ */ x("div", {
						className: "flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm",
						children: [/* @__PURE__ */ x("span", { children: [
							String(e.woo_category_name || e.woo_category_id),
							" →",
							" ",
							String(e.basalam_category_name || "—")
						] }), /* @__PURE__ */ b(W, {
							size: "sm",
							variant: "destructive",
							onClick: () => F.mutate(Number(e.id)),
							children: r("basalam.delete")
						})]
					}, String(e.id))), C.data?.mappings?.length ? null : /* @__PURE__ */ b("p", {
						className: "text-muted-foreground text-sm",
						children: r("common.empty")
					})]
				})]
			}),
			/* @__PURE__ */ x(G, {
				className: "max-w-3xl",
				children: [/* @__PURE__ */ b(K, { children: /* @__PURE__ */ b(q, { children: r("basalam.optionMaps") }) }), /* @__PURE__ */ x(J, {
					className: "grid gap-3 md:grid-cols-3",
					children: [
						/* @__PURE__ */ b(Y, {
							value: h,
							onChange: (e) => g(e.target.value),
							placeholder: r("basalam.wooAttrName")
						}),
						/* @__PURE__ */ b(Y, {
							value: y,
							onChange: (e) => S(e.target.value),
							placeholder: r("basalam.basalamAttrName")
						}),
						/* @__PURE__ */ b(W, {
							onClick: () => te.mutate(),
							disabled: te.isPending || !h || !y,
							children: r("basalam.saveOptionMap")
						}),
						/* @__PURE__ */ b("div", {
							className: "md:col-span-3 space-y-1 text-sm",
							children: (w.data?.maps ?? []).map((e, t) => /* @__PURE__ */ x("div", {
								className: "text-muted-foreground",
								children: [
									String(e.woo_name ?? e.woo_attr ?? ""),
									" → ",
									String(e.webino_basalam_name ?? e.basalam_attr ?? "")
								]
							}, t))
						})
					]
				})]
			})
		]
	});
}
//#endregion
//#region ../Modules/basalam-module/client/pages/basalam/BasalamSyncSettingsPage.tsx
function Gr() {
	let { t: r } = _(), i = n(), [a, o] = f({}), [c, u] = f(!1), p = d(!1), m = t({
		queryKey: ["basalam", "settings"],
		queryFn: () => Q("basalam/settings")
	}), h = t({
		queryKey: ["basalam", "commission"],
		queryFn: () => Q("basalam/commission")
	});
	l(() => {
		m.data?.settings && !p.current && o(m.data.settings);
	}, [m.data]);
	let g = e({
		mutationFn: (e) => Q("basalam/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(e)
		}),
		onSuccess: async () => {
			p.current = !1, v.success(r("basalam.settingsSaved")), await i.invalidateQueries({ queryKey: ["basalam", "settings"] }), await i.invalidateQueries({ queryKey: ["basalam", "commission"] });
		},
		onError: (e) => Z(r, e)
	}), y = s(async (e) => {
		try {
			await Q("basalam/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(e)
			}), p.current = !1, await i.invalidateQueries({ queryKey: ["basalam", "settings"] });
		} catch (e) {
			Z(r, e);
		}
	}, [i, r]), S = e({
		mutationFn: async () => Q("basalam/commission", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				action: "seed",
				enable_commission: !0
			})
		}),
		onSuccess: async (e) => {
			v.success(r("basalam.commission.seedOk", {
				matched: e.matched ?? e.row_count ?? 0,
				unmatched: e.unmatched ?? 0
			})), p.current = !1, await i.invalidateQueries({ queryKey: ["basalam"] }), o((e) => ({
				...e,
				price_change_value: "commission"
			}));
		},
		onError: (e) => Z(r, e)
	}), C = e({
		mutationFn: () => Q("basalam/sync/products/update-all", { method: "POST" }),
		onSuccess: () => v.success(r("basalam.commission.applyQueued")),
		onError: (e) => Z(r, e)
	}), w = e({
		mutationFn: async () => {
			let e = (await Q("shop/products?per_page=20&status=publish")).items ?? [], t = 0, n = 0, r = 0, i = 0;
			for (let a of e) {
				let e = Number(a.weight);
				Number.isFinite(e) && e > 0 && (t += e, n += 1), typeof a.stock_quantity == "number" && a.stock_quantity >= 0 && (r += a.stock_quantity, i += 1);
			}
			let s = { ...a };
			return n > 0 && (!s.default_weight || Number(s.default_weight) === 0) && (s.default_weight = Math.round(t / n)), n > 0 && (!s.default_package_weight || Number(s.default_package_weight) === 0) && (s.default_package_weight = Math.max(50, Math.round(t / n / 10))), i > 0 && (!s.default_stock_quantity || Number(s.default_stock_quantity) === 0) && (s.default_stock_quantity = Math.max(1, Math.round(r / i))), (!s.default_preparation || Number(s.default_preparation) === 0) && (s.default_preparation = 3), p.current = !0, o(s), s;
		},
		onSuccess: () => v.success(r("basalam.defaultsFilled")),
		onError: (e) => Z(r, e)
	}), T = a, E = (e, t) => {
		p.current = !0, o((n) => ({
			...n,
			[e]: t
		}));
	}, D = (e) => e === !0 || e === "yes" || e === 1 || e === "1" || e === "true" || e === "all", O = String(T.price_change_value ?? "") === "commission", k = !O && T.price_change_value !== void 0 && T.price_change_value !== null && T.price_change_value !== "" && T.price_change_value !== "0" && T.price_change_value !== 0 ? String(T.price_change_value) : "", A = (e) => {
		let t = new Set([
			"add_attr_to_desc_product",
			"add_short_desc_to_desc_product",
			"add_full_desc_to_desc_product",
			"cap_preparation_to_category_max"
		]), n;
		n = t.has(e) ? D(T[e]) ? "no" : "yes" : e === "round_price" ? T[e] && T[e] !== "none" ? "none" : "up" : e === "all_products_wholesale" ? T[e] && T[e] !== "none" ? "none" : "all" : !D(T[e]), p.current = !0, o((t) => ({
			...t,
			[e]: n
		})), y({ [e]: n });
	}, j = (e, t) => {
		p.current = !0, o((n) => ({
			...n,
			[e]: t
		})), y({ [e]: t });
	}, M = (e) => e === "round_price" || e === "all_products_wholesale" ? !!(T[e] && T[e] !== "none") : (e === "add_full_desc_to_desc_product" || e === "chat_notify_admins") && (T[e] === void 0 || T[e] === null || T[e] === "") || D(T[e]), N = h.data, ee = N?.imported_at ? new Date(N.imported_at).toLocaleString() : r("basalam.commission.neverImported"), P = [
		{
			key: "sync_status_product",
			label: r("basalam.syncProducts")
		},
		{
			key: "sync_status_order",
			label: r("basalam.syncOrders")
		},
		{
			key: "auto_confirm_order",
			label: r("basalam.autoConfirm")
		},
		{
			key: "round_price",
			label: r("basalam.roundPrice")
		},
		{
			key: "add_full_desc_to_desc_product",
			label: r("basalam.addFullDesc")
		},
		{
			key: "add_attr_to_desc_product",
			label: r("basalam.addAttrToDesc")
		},
		{
			key: "add_short_desc_to_desc_product",
			label: r("basalam.addShortDesc")
		},
		{
			key: "all_products_wholesale",
			label: r("basalam.allWholesale")
		},
		{
			key: "cap_preparation_to_category_max",
			label: r("basalam.capPrep")
		},
		{
			key: "chat_notify_admins",
			label: r("basalam.chatNotify")
		}
	], F = [
		"sync_product_field_name",
		"sync_product_field_photos",
		"sync_product_field_price",
		"sync_product_field_stock",
		"sync_product_field_weight",
		"sync_product_field_description",
		"sync_product_field_attr",
		"sync_product_field_video",
		"sync_product_field_variant_price",
		"sync_product_field_variant_stock"
	], I = (e) => r(`basalam.syncField.${e.replace("sync_product_field_", "")}`, { defaultValue: e.replace("sync_product_field_", "") });
	return /* @__PURE__ */ x(En, {
		title: r("basalam.settingsTitle"),
		description: r("basalam.settingsSubtitle"),
		children: [
			/* @__PURE__ */ b(Tn, {}),
			/* @__PURE__ */ x(G, {
				className: "mb-4",
				children: [/* @__PURE__ */ b(K, { children: /* @__PURE__ */ b(q, { children: r("basalam.commission.title") }) }), /* @__PURE__ */ x(J, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ b("p", {
							className: "text-muted-foreground text-sm",
							children: r("basalam.commission.hint")
						}),
						/* @__PURE__ */ b("p", {
							className: "text-sm",
							children: r("basalam.commission.status", {
								count: N?.row_count ?? 0,
								unmatched: N?.unmatched ?? 0,
								at: ee
							})
						}),
						/* @__PURE__ */ x("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ b(W, {
									variant: O ? "default" : "outline",
									onClick: () => {
										let e = O ? "0" : "commission";
										E("price_change_value", e), y({ price_change_value: e });
									},
									children: r("basalam.commission.enable")
								}),
								/* @__PURE__ */ b(W, {
									variant: "secondary",
									disabled: S.isPending,
									onClick: () => S.mutate(),
									children: r("basalam.commission.seedTariff")
								}),
								/* @__PURE__ */ b(W, {
									variant: "outline",
									disabled: C.isPending || !(N?.row_count || O || k),
									onClick: () => C.mutate(),
									children: r("basalam.commission.applyUpdate")
								}),
								/* @__PURE__ */ b(W, {
									onClick: () => g.mutate(a),
									disabled: g.isPending,
									children: r("basalam.saveSettings")
								})
							]
						}),
						/* @__PURE__ */ x("label", {
							className: "block max-w-md space-y-1 text-sm",
							children: [
								/* @__PURE__ */ b("span", { children: r("basalam.commission.manualPercent") }),
								/* @__PURE__ */ b(Y, {
									type: "number",
									min: -35,
									max: 35,
									step: .5,
									value: k,
									placeholder: "0",
									onChange: (e) => {
										let t = e.target.value.trim();
										E("price_change_value", t === "" ? "0" : t);
									},
									onBlur: () => {
										if (O) return;
										let e = Number(T.price_change_value), t = String(Number.isFinite(e) ? Math.max(-35, Math.min(35, e)) : 0);
										E("price_change_value", t), y({ price_change_value: t });
									}
								}),
								/* @__PURE__ */ b("span", {
									className: "text-muted-foreground text-xs",
									children: r("basalam.commission.manualPercentHint")
								})
							]
						}),
						/* @__PURE__ */ x("label", {
							className: "block max-w-md space-y-1 text-sm",
							children: [/* @__PURE__ */ b("span", { children: r("basalam.field.productPriceField") }), /* @__PURE__ */ b(Y, {
								value: String(T.product_price_field ?? "original_price"),
								onChange: (e) => E("product_price_field", e.target.value),
								placeholder: "original_price | sale_price | sale_strikethrough_price"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ x(G, {
				className: "mb-4",
				children: [/* @__PURE__ */ b(K, { children: /* @__PURE__ */ b(q, { children: r("basalam.syncToggles") }) }), /* @__PURE__ */ x(J, {
					className: "space-y-3",
					children: [/* @__PURE__ */ b("div", {
						className: "flex flex-wrap gap-2",
						children: P.map((e) => /* @__PURE__ */ b(W, {
							variant: M(e.key) ? "default" : "outline",
							onClick: () => A(e.key),
							children: e.label
						}, e.key))
					}), /* @__PURE__ */ b(W, {
						onClick: () => g.mutate(a),
						disabled: g.isPending,
						children: r("basalam.saveSettings")
					})]
				})]
			}),
			/* @__PURE__ */ x(G, {
				className: "mb-4",
				children: [/* @__PURE__ */ b(K, { children: /* @__PURE__ */ b(q, { children: r("basalam.selectiveSync") }) }), /* @__PURE__ */ x(J, {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ b(W, {
							variant: T.sync_product_fields === "all" ? "default" : "outline",
							onClick: () => j("sync_product_fields", "all"),
							children: r("basalam.syncAllFields")
						}),
						/* @__PURE__ */ b(W, {
							variant: T.sync_product_fields === "custom" ? "default" : "outline",
							onClick: () => j("sync_product_fields", "custom"),
							children: r("basalam.syncCustomFields")
						}),
						T.sync_product_fields === "custom" ? F.map((e) => /* @__PURE__ */ b(W, {
							size: "sm",
							variant: T[e] ? "default" : "outline",
							onClick: () => j(e, !T[e]),
							children: I(e)
						}, e)) : null
					]
				})]
			}),
			/* @__PURE__ */ x(G, {
				className: "mb-4",
				children: [/* @__PURE__ */ b(K, { children: /* @__PURE__ */ b(q, { children: r("basalam.defaultProductValues") }) }), /* @__PURE__ */ x(J, {
					className: "grid gap-3 md:grid-cols-2",
					children: [
						/* @__PURE__ */ b("p", {
							className: "text-muted-foreground text-xs md:col-span-2",
							children: r("basalam.packagingWeightHint")
						}),
						[
							["default_weight", "basalam.field.defaultWeight"],
							["default_package_weight", "basalam.field.defaultPackageWeight"],
							["default_preparation", "basalam.field.defaultPreparation"],
							["default_stock_quantity", "basalam.field.defaultStock"],
							["discount_duration", "basalam.field.discountDays"],
							["discount_reduction_percent", "basalam.field.discountPercent"],
							["safe_stock", "basalam.field.safeStock"],
							["product_prefix_title", "basalam.field.productPrefix"],
							["product_suffix_title", "basalam.field.productSuffix"]
						].map(([e, t]) => /* @__PURE__ */ x("label", {
							className: "space-y-1 text-sm",
							children: [/* @__PURE__ */ b("span", { children: r(t) }), /* @__PURE__ */ b(Y, {
								value: String(T[e] ?? ""),
								onChange: (t) => E(e, e.includes("title") || e.includes("prefix") || e.includes("suffix") ? t.target.value : Number(t.target.value) || t.target.value)
							})]
						}, e)),
						/* @__PURE__ */ x("div", {
							className: "flex flex-wrap gap-2 md:col-span-2",
							children: [/* @__PURE__ */ b(W, {
								variant: "secondary",
								onClick: () => w.mutate(),
								disabled: w.isPending,
								children: r("basalam.fillFromCatalog")
							}), /* @__PURE__ */ b(W, {
								onClick: () => g.mutate(a),
								disabled: g.isPending,
								children: r("basalam.saveSettings")
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ b(kn, {
				open: c,
				onOpenChange: u,
				children: /* @__PURE__ */ x(G, { children: [/* @__PURE__ */ b(K, {
					className: "pb-3",
					children: /* @__PURE__ */ b(An, {
						asChild: !0,
						children: /* @__PURE__ */ x("button", {
							type: "button",
							className: "flex w-full items-center justify-between text-start",
							children: [/* @__PURE__ */ b(q, {
								className: "text-base",
								children: r("basalam.advanced")
							}), /* @__PURE__ */ b(L, { className: `size-4 transition-transform ${c ? "rotate-180" : ""}` })]
						})
					})
				}), /* @__PURE__ */ b(jn, { children: /* @__PURE__ */ x(J, {
					className: "grid gap-3 border-t pt-4 md:grid-cols-2",
					children: [
						/* @__PURE__ */ b(W, {
							variant: T.developer_mode ? "default" : "outline",
							onClick: () => E("developer_mode", !T.developer_mode),
							children: r("basalam.developerMode")
						}),
						/* @__PURE__ */ b(W, {
							variant: T.tasks_per_minute_auto ? "default" : "outline",
							onClick: () => E("tasks_per_minute_auto", !T.tasks_per_minute_auto),
							children: r("basalam.tasksAuto")
						}),
						[
							["tasks_per_minute", "basalam.field.tasksPerMinute"],
							["video_meta_key", "basalam.field.videoMeta"],
							["video_source", "basalam.field.videoSource"],
							["video_inherit_mode", "basalam.field.videoInherit"],
							["order_statues_type", "basalam.field.orderStatusMode"],
							["order_shipping_method", "basalam.field.shippingMethod"],
							["variable_product_stock_source", "basalam.field.variableStockSource"],
							["customer_prefix_name", "basalam.field.customerPrefix"],
							["customer_suffix_name", "basalam.field.customerSuffix"]
						].map(([e, t]) => /* @__PURE__ */ x("label", {
							className: "space-y-1 text-sm",
							children: [/* @__PURE__ */ b("span", { children: r(t) }), /* @__PURE__ */ b(Y, {
								value: String(T[e] ?? ""),
								onChange: (t) => E(e, t.target.value)
							})]
						}, e)),
						/* @__PURE__ */ b("div", {
							className: "md:col-span-2",
							children: /* @__PURE__ */ b(W, {
								onClick: () => g.mutate(a),
								disabled: g.isPending,
								children: r("basalam.saveSettings")
							})
						})
					]
				}) })] })
			})
		]
	});
}
//#endregion
//#region src/lib/formatNumber.ts
function Kr(e, t) {
	let n = Number.isFinite(e) ? e : 0, r = Er(t) ? "fa-IR" : "en-US", i = new Intl.NumberFormat(r, { maximumFractionDigits: 2 }).format(n);
	return Er(t) ? Dr(i) : i;
}
//#endregion
//#region ../Modules/basalam-module/client/pages/basalam/BasalamFinancePage.tsx
function qr(e) {
	return typeof e != "number" || !Number.isFinite(e) ? null : Math.trunc(e / 10);
}
function Jr(e, t, n = "—") {
	let r = qr(e);
	return r === null ? n : Kr(r, t);
}
function Yr(e) {
	return typeof e.status_label == "string" && e.status_label ? e.status_label : typeof e.status?.description == "string" && e.status.description ? e.status.description : "—";
}
function Xr({ envelope: e, emptyLabel: t, locale: n }) {
	let { t: r } = _();
	if (!e) return /* @__PURE__ */ b("p", {
		className: "text-muted-foreground text-sm",
		children: r("basalam.financeLoading")
	});
	if (!e.success) return /* @__PURE__ */ b("p", {
		className: "text-destructive text-sm",
		children: e.message || r("basalam.financeError")
	});
	let i = Array.isArray(e.data?.data) ? e.data.data : [], a = typeof e.data?.total == "number" ? e.data.total : i.length;
	return i.length === 0 || a === 0 ? /* @__PURE__ */ b("p", {
		className: "text-muted-foreground text-sm",
		children: t
	}) : /* @__PURE__ */ b("ul", {
		className: "space-y-3",
		children: i.map((e, t) => {
			let i = e.id ?? t;
			return /* @__PURE__ */ x("li", {
				className: "bg-muted/40 rounded-lg border p-3 text-sm",
				children: [
					/* @__PURE__ */ x("div", {
						className: "flex flex-wrap items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ x("span", {
							className: "font-medium",
							children: ["#", e.id ?? "—"]
						}), /* @__PURE__ */ x("span", {
							className: "font-semibold",
							children: [
								Jr(e.amount, n),
								" ",
								r("basalam.toman")
							]
						})]
					}),
					/* @__PURE__ */ x("div", {
						className: "text-muted-foreground mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs",
						children: [
							/* @__PURE__ */ b("span", { children: Yr(e) }),
							e.method?.description ? /* @__PURE__ */ b("span", { children: e.method.description }) : null,
							/* @__PURE__ */ x("span", { children: [
								r("basalam.settlementCreated"),
								": ",
								jr(e.created_at, n)
							] }),
							e.payable_at ? /* @__PURE__ */ x("span", { children: [
								r("basalam.settlementPayable"),
								": ",
								jr(e.payable_at, n)
							] }) : null
						]
					}),
					e.status_description ? /* @__PURE__ */ b("p", {
						className: "text-muted-foreground mt-2 text-xs leading-relaxed",
						children: e.status_description
					}) : null
				]
			}, String(i));
		})
	});
}
function Zr() {
	let { t: r, i18n: i } = _(), a = i.language, o = n(), [s, c] = f(""), [l, u] = f("1"), [d, p] = f(""), m = t({
		queryKey: ["basalam", "finance"],
		queryFn: () => Q("basalam/finance/balance")
	}), h = t({
		queryKey: [
			"basalam",
			"finance",
			"banks"
		],
		queryFn: () => Q("basalam/finance/banks")
	}), g = e({
		mutationFn: () => Q("basalam/finance/settlement", {
			method: "POST",
			body: JSON.stringify({
				amount: Number(s) || 0,
				method: Number(l) || 1,
				bank_account_id: d ? Number(d) : void 0
			})
		}),
		onSuccess: async () => {
			v.success(r("basalam.settlementCreatedOk")), c(""), await o.invalidateQueries({ queryKey: ["basalam", "finance"] });
		},
		onError: (e) => Z(r, e)
	}), y = m.data?.balance, S = y?.success && y.data && typeof y.data == "object" ? y.data : void 0, C = typeof S?.future_balance == "number" && S.future_balance !== 0, w = Array.isArray(h.data?.banks?.data) || Array.isArray(h.data?.banks?.data) ? h.data.banks.data : [];
	return /* @__PURE__ */ x(En, {
		title: r("basalam.financeTitle"),
		description: r("basalam.financeSubtitle"),
		children: [
			/* @__PURE__ */ b(Tn, {}),
			m.isLoading ? /* @__PURE__ */ b("p", {
				className: "text-muted-foreground text-sm",
				children: r("basalam.financeLoading")
			}) : null,
			m.isError ? /* @__PURE__ */ b("p", {
				className: "text-destructive text-sm",
				children: r("basalam.financeError")
			}) : null,
			/* @__PURE__ */ x("div", {
				className: "mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ x(G, { children: [/* @__PURE__ */ x(K, {
						className: "pb-2",
						children: [/* @__PURE__ */ b(q, {
							className: "text-base",
							children: r("basalam.boothBalance")
						}), /* @__PURE__ */ b(On, { children: S?.calculated_at ? r("basalam.balanceAsOf", { time: jr(S.calculated_at, a) }) : r("basalam.balance") })]
					}), /* @__PURE__ */ b(J, { children: y && !y.success ? /* @__PURE__ */ b("p", {
						className: "text-destructive text-sm",
						children: y.message || r("basalam.financeError")
					}) : /* @__PURE__ */ x("p", {
						className: "text-2xl font-semibold tracking-tight",
						children: [
							Jr(S?.balance, a),
							" ",
							/* @__PURE__ */ b("span", {
								className: "text-muted-foreground text-sm font-normal",
								children: r("basalam.toman")
							})
						]
					}) })] }),
					/* @__PURE__ */ x(G, { children: [/* @__PURE__ */ b(K, {
						className: "pb-2",
						children: /* @__PURE__ */ b(q, {
							className: "text-base",
							children: r("basalam.settledBankYtd")
						})
					}), /* @__PURE__ */ b(J, { children: /* @__PURE__ */ x("p", {
						className: "text-2xl font-semibold tracking-tight",
						children: [
							Jr(S?.settled?.cash, a),
							" ",
							/* @__PURE__ */ b("span", {
								className: "text-muted-foreground text-sm font-normal",
								children: r("basalam.toman")
							})
						]
					}) })] }),
					/* @__PURE__ */ x(G, { children: [/* @__PURE__ */ b(K, {
						className: "pb-2",
						children: /* @__PURE__ */ b(q, {
							className: "text-base",
							children: r("basalam.settledWalletYtd")
						})
					}), /* @__PURE__ */ b(J, { children: /* @__PURE__ */ x("p", {
						className: "text-2xl font-semibold tracking-tight",
						children: [
							Jr(S?.settled?.credit, a),
							" ",
							/* @__PURE__ */ b("span", {
								className: "text-muted-foreground text-sm font-normal",
								children: r("basalam.toman")
							})
						]
					}) })] }),
					C ? /* @__PURE__ */ x(G, {
						className: "sm:col-span-2 lg:col-span-3",
						children: [/* @__PURE__ */ b(K, {
							className: "pb-2",
							children: /* @__PURE__ */ b(q, {
								className: "text-base",
								children: r("basalam.futureBalance")
							})
						}), /* @__PURE__ */ b(J, { children: /* @__PURE__ */ x("p", {
							className: "text-xl font-semibold tracking-tight",
							children: [
								Jr(S?.future_balance, a),
								" ",
								/* @__PURE__ */ b("span", {
									className: "text-muted-foreground text-sm font-normal",
									children: r("basalam.toman")
								})
							]
						}) })]
					}) : null
				]
			}),
			/* @__PURE__ */ x(G, {
				className: "mb-4",
				children: [/* @__PURE__ */ x(K, { children: [/* @__PURE__ */ b(q, { children: r("basalam.createSettlement") }), /* @__PURE__ */ b(On, { children: r("basalam.createSettlementHint") })] }), /* @__PURE__ */ x(J, {
					className: "grid gap-3 md:grid-cols-4",
					children: [
						/* @__PURE__ */ b(Y, {
							type: "number",
							placeholder: r("basalam.settlementAmount"),
							value: s,
							onChange: (e) => c(e.target.value)
						}),
						/* @__PURE__ */ x("select", {
							className: "border-input bg-background h-9 rounded-md border px-3 text-sm",
							value: l,
							onChange: (e) => u(e.target.value),
							children: [/* @__PURE__ */ b("option", {
								value: "1",
								children: r("basalam.settleMethod.bank")
							}), /* @__PURE__ */ b("option", {
								value: "2",
								children: r("basalam.settleMethod.wallet")
							})]
						}),
						/* @__PURE__ */ x("select", {
							className: "border-input bg-background h-9 rounded-md border px-3 text-sm",
							value: d,
							onChange: (e) => p(e.target.value),
							children: [/* @__PURE__ */ b("option", {
								value: "",
								children: r("basalam.selectBank")
							}), w.map((e) => /* @__PURE__ */ b("option", {
								value: String(e.id ?? ""),
								children: e.card_number || e.sheba || r("basalam.bankAccount")
							}, String(e.id)))]
						}),
						/* @__PURE__ */ b(W, {
							onClick: () => g.mutate(),
							disabled: g.isPending || !s,
							children: r("basalam.submitSettlement")
						})
					]
				})]
			}),
			/* @__PURE__ */ x("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ x(G, { children: [/* @__PURE__ */ x(K, { children: [/* @__PURE__ */ b(q, { children: r("basalam.activeSettlements") }), /* @__PURE__ */ b(On, { children: r("basalam.activeSettlementsHint") })] }), /* @__PURE__ */ b(J, { children: /* @__PURE__ */ b(Xr, {
					envelope: m.data?.settlements,
					emptyLabel: r("basalam.noActiveSettlements"),
					locale: a
				}) })] }), /* @__PURE__ */ x(G, { children: [/* @__PURE__ */ x(K, { children: [/* @__PURE__ */ b(q, { children: r("basalam.settlementHistory") }), /* @__PURE__ */ b(On, { children: r("basalam.settlementHistoryHint") })] }), /* @__PURE__ */ b(J, { children: /* @__PURE__ */ b(Xr, {
					envelope: m.data?.history,
					emptyLabel: r("basalam.noSettlementHistory"),
					locale: a
				}) })] })]
			})
		]
	});
}
//#endregion
//#region ../Modules/basalam-module/client/pages/basalam/BasalamLogsPage.tsx
function Qr() {
	let { t: e, i18n: n } = _(), r = t({
		queryKey: [
			"basalam",
			"jobs",
			"all"
		],
		queryFn: () => Q("basalam/jobs"),
		refetchInterval: 8e3
	}).data?.jobs ?? [], i = r.filter((e) => e.status === "pending" || e.status === "processing").length, a = r.filter((e) => e.status === "failed").length, o = r.filter((e) => e.status === "completed" || e.status === "success").length;
	return /* @__PURE__ */ x(En, {
		title: e("basalam.logsTitle"),
		description: e("basalam.logsSubtitle"),
		children: [
			/* @__PURE__ */ b(Tn, {}),
			/* @__PURE__ */ x("div", {
				className: "mb-4 grid max-w-3xl gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ x(G, { children: [/* @__PURE__ */ b(K, {
						className: "pb-2",
						children: /* @__PURE__ */ b(q, {
							className: "text-base",
							children: e("basalam.syncStatus.pending")
						})
					}), /* @__PURE__ */ b(J, {
						className: "text-2xl font-semibold",
						children: i
					})] }),
					/* @__PURE__ */ x(G, { children: [/* @__PURE__ */ b(K, {
						className: "pb-2",
						children: /* @__PURE__ */ b(q, {
							className: "text-base",
							children: e("basalam.syncStatus.done")
						})
					}), /* @__PURE__ */ b(J, {
						className: "text-2xl font-semibold",
						children: o
					})] }),
					/* @__PURE__ */ x(G, { children: [/* @__PURE__ */ b(K, {
						className: "pb-2",
						children: /* @__PURE__ */ b(q, {
							className: "text-base",
							children: e("basalam.syncStatus.failed")
						})
					}), /* @__PURE__ */ b(J, {
						className: "text-2xl font-semibold",
						children: a
					})] })
				]
			}),
			/* @__PURE__ */ x(G, {
				className: "max-w-4xl",
				children: [/* @__PURE__ */ b(K, { children: /* @__PURE__ */ b(q, { children: e("basalam.recentJobs") }) }), /* @__PURE__ */ x(J, {
					className: "overflow-x-auto",
					children: [/* @__PURE__ */ x("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ b("thead", { children: /* @__PURE__ */ x("tr", {
							className: "border-b text-start",
							children: [
								/* @__PURE__ */ b("th", {
									className: "py-2 pe-2",
									children: "ID"
								}),
								/* @__PURE__ */ b("th", {
									className: "py-2 pe-2",
									children: e("basalam.col.type")
								}),
								/* @__PURE__ */ b("th", {
									className: "py-2 pe-2",
									children: e("basalam.col.status")
								}),
								/* @__PURE__ */ b("th", {
									className: "py-2 pe-2",
									children: e("basalam.col.time")
								}),
								/* @__PURE__ */ b("th", {
									className: "py-2",
									children: e("basalam.col.error")
								})
							]
						}) }), /* @__PURE__ */ b("tbody", { children: r.map((t) => /* @__PURE__ */ x("tr", {
							className: "border-b align-top",
							children: [
								/* @__PURE__ */ b("td", {
									className: "py-2 pe-2",
									children: t.id
								}),
								/* @__PURE__ */ b("td", {
									className: "py-2 pe-2",
									children: Lr(Ir(t), e)
								}),
								/* @__PURE__ */ b("td", {
									className: "py-2 pe-2",
									children: Rr(t.status, e)
								}),
								/* @__PURE__ */ b("td", {
									className: "text-muted-foreground py-2 pe-2 text-xs",
									children: jr(Mr(t), n.language)
								}),
								/* @__PURE__ */ b("td", {
									className: "text-muted-foreground max-w-md break-all py-2 text-xs",
									children: Nr(t.error_message, e)
								})
							]
						}, String(t.id))) })]
					}), r.length ? null : /* @__PURE__ */ b("p", {
						className: "text-muted-foreground mt-3 text-sm",
						children: e("common.empty")
					})]
				})]
			})
		]
	});
}
//#endregion
//#region ../Modules/basalam-module/client/pages/basalam/BasalamBoothPage.tsx
function $r(e) {
	if (Array.isArray(e)) return e;
	if (e && typeof e == "object") {
		let t = e.data;
		if (Array.isArray(t)) return t;
	}
	return [];
}
function ei(e) {
	return String(e.title ?? e.name ?? e.label ?? e.id ?? "—");
}
function ti() {
	let { t: r } = _(), i = n(), [a, o] = f(""), [s, c] = f(""), [d, p] = f(""), [m, h] = f(""), [g, y] = f("10"), [S, C] = f(!1), [w, T] = f(!1), [E, D] = f(!0), O = t({
		queryKey: ["basalam", "status"],
		queryFn: () => Q("basalam/status")
	}), k = t({
		queryKey: ["basalam", "vendor"],
		queryFn: () => Q("basalam/vendor")
	}), A = t({
		queryKey: ["basalam", "shipping"],
		queryFn: () => Q("basalam/shipping")
	}), j = t({
		queryKey: ["basalam", "webhooks"],
		queryFn: () => Q("basalam/webhooks")
	}), M = t({
		queryKey: ["basalam", "discounts"],
		queryFn: () => Q("basalam/discounts")
	}), N = t({
		queryKey: [
			"basalam",
			"products",
			"connected-lite"
		],
		queryFn: () => Q("basalam/products?filter=connected&per_page=100")
	}), ee = t({
		queryKey: ["basalam", "settings"],
		queryFn: () => Q("basalam/settings")
	}), P = t({
		queryKey: ["basalam", "chat"],
		queryFn: () => Q("basalam/chat/token"),
		enabled: S
	});
	l(() => {
		let e = k.data?.vendor;
		e && (o(String(e.title ?? "")), c(String(e.summary ?? "")));
	}, [k.data]), l(() => {
		let e = ee.data?.settings;
		e && (typeof e.chat_notify_admins == "boolean" ? D(e.chat_notify_admins) : (e.chat_notify_admins === 0 || e.chat_notify_admins === "0" || e.chat_notify_admins === "no") && D(!1));
	}, [ee.data]), l(() => {
		if (!S) return;
		let e = P.data?.token, t = P.data?.script_url;
		if (!e || !t || document.getElementById("basalam-chat-widget-script")) return;
		let n = document.createElement("script");
		return n.id = "basalam-chat-widget-script", n.src = t, n.setAttribute("token", e), n.async = !0, document.body.appendChild(n), Q("basalam/chat/notify", {
			method: "POST",
			body: JSON.stringify({ event: "widget_opened" })
		}).catch(() => void 0), () => {
			n.remove();
		};
	}, [S, P.data]);
	let F = e({
		mutationFn: () => Q("basalam/vendor", {
			method: "POST",
			body: JSON.stringify({
				title: a,
				summary: s
			})
		}),
		onSuccess: async () => {
			v.success(r("basalam.boothSaved")), await i.invalidateQueries({ queryKey: ["basalam", "vendor"] });
		},
		onError: (e) => Z(r, e)
	}), I = e({
		mutationFn: () => Q("basalam/shipping", {
			method: "POST",
			body: JSON.stringify({ title: d.trim() })
		}),
		onSuccess: async () => {
			v.success(r("basalam.shippingSaved")), p(""), await i.invalidateQueries({ queryKey: ["basalam", "shipping"] });
		},
		onError: (e) => Z(r, e)
	}), te = e({
		mutationFn: (e) => Q("basalam/shipping", {
			method: "POST",
			body: JSON.stringify({
				action: "delete_profile",
				profile_id: e
			})
		}),
		onSuccess: async () => {
			v.success(r("basalam.shippingProfileDeleted")), await i.invalidateQueries({ queryKey: ["basalam", "shipping"] });
		},
		onError: (e) => Z(r, e)
	}), ne = e({
		mutationFn: () => Q("basalam/webhook/setup", { method: "POST" }),
		onSuccess: async () => {
			v.success(r("basalam.ordersAutoOk")), await i.invalidateQueries({ queryKey: ["basalam", "webhooks"] });
		},
		onError: (e) => Z(r, e)
	}), re = e({
		mutationFn: () => Q("basalam/webhooks/rotate", { method: "POST" }),
		onSuccess: async () => {
			v.success(r("basalam.ordersAutoReset")), await i.invalidateQueries({ queryKey: ["basalam", "webhooks"] });
		},
		onError: (e) => Z(r, e)
	}), R = e({
		mutationFn: () => Q("basalam/discounts", {
			method: "POST",
			body: JSON.stringify({
				product_id: Number(m) || 0,
				discount: Number(g) || 0
			})
		}),
		onSuccess: async () => {
			v.success(r("basalam.discountCreated")), h(""), await i.invalidateQueries({ queryKey: ["basalam", "discounts"] });
		},
		onError: (e) => Z(r, e)
	}), ie = e({
		mutationFn: (e) => Q("basalam/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ chat_notify_admins: e })
		}),
		onSuccess: async (e, t) => {
			D(t), v.success(r("basalam.settingsSaved")), await i.invalidateQueries({ queryKey: ["basalam", "settings"] });
		},
		onError: (e) => Z(r, e)
	}), ae = !!O.data?.connected, z = k.data?.vendor?.title || a || r("basalam.boothUntitled"), oe = k.data?.vendor?.id || O.data?.vendor_id, se = (Array.isArray(j.data?.webhooks) ? j.data.webhooks : []).length > 0 || !!j.data?.webhook_url, ce = u(() => $r(A.data?.profiles ?? A.data?.shipping), [A.data]), le = u(() => $r(A.data?.carriers), [A.data]), ue = u(() => $r(A.data?.vendor_carriers), [A.data]), de = u(() => $r(M.data?.discounts), [M.data]), fe = (N.data?.products ?? []).filter((e) => e.basalam_product_id);
	return /* @__PURE__ */ x(En, {
		title: r("basalam.boothTitle"),
		description: r("basalam.boothSubtitle"),
		children: [
			/* @__PURE__ */ b(Tn, {}),
			/* @__PURE__ */ b(G, {
				className: "mb-4 max-w-4xl overflow-hidden border-border/70 bg-gradient-to-l from-muted/40 to-background",
				children: /* @__PURE__ */ x(J, {
					className: "flex flex-wrap items-start justify-between gap-4 py-5",
					children: [/* @__PURE__ */ x("div", {
						className: "space-y-1",
						children: [
							/* @__PURE__ */ b("p", {
								className: "text-muted-foreground text-xs font-medium tracking-wide",
								children: r("basalam.boothIdentity")
							}),
							/* @__PURE__ */ b("h2", {
								className: "text-xl font-semibold tracking-tight",
								children: z || "—"
							}),
							/* @__PURE__ */ x("p", {
								className: "text-sm",
								children: [ae ? /* @__PURE__ */ b("span", {
									className: "text-emerald-700 dark:text-emerald-400",
									children: r("basalam.connected")
								}) : /* @__PURE__ */ b("span", { children: r("basalam.notConnected") }), oe ? /* @__PURE__ */ x("span", {
									className: "text-muted-foreground",
									children: [" · ", r("basalam.boothIdLabel", { id: String(oe) })]
								}) : null]
							})
						]
					}), /* @__PURE__ */ x("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ b(W, {
							variant: S ? "default" : "secondary",
							onClick: () => C((e) => !e),
							disabled: !ae,
							children: r(S ? "basalam.chatHide" : "basalam.chatWithBuyer")
						}), /* @__PURE__ */ b(W, {
							variant: E ? "default" : "outline",
							onClick: () => ie.mutate(!E),
							disabled: ie.isPending || !ae,
							children: r("basalam.chatNotify")
						})]
					})]
				})
			}),
			/* @__PURE__ */ x("div", {
				className: "grid max-w-4xl gap-4 lg:grid-cols-2",
				children: [
					/* @__PURE__ */ x(G, { children: [/* @__PURE__ */ x(K, { children: [/* @__PURE__ */ b(q, { children: r("basalam.boothProfile") }), /* @__PURE__ */ b(On, { children: r("basalam.boothProfileHint") })] }), /* @__PURE__ */ x(J, {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ x("label", {
								className: "space-y-1 text-sm",
								children: [/* @__PURE__ */ b("span", { children: r("basalam.boothTitleField") }), /* @__PURE__ */ b(Y, {
									value: a,
									onChange: (e) => o(e.target.value)
								})]
							}),
							/* @__PURE__ */ x("label", {
								className: "space-y-1 text-sm",
								children: [/* @__PURE__ */ b("span", { children: r("basalam.boothSummaryField") }), /* @__PURE__ */ b(Mn, {
									value: s,
									onChange: (e) => c(e.target.value),
									rows: 4
								})]
							}),
							/* @__PURE__ */ b(W, {
								onClick: () => F.mutate(),
								disabled: F.isPending || !ae,
								children: r("basalam.saveBooth")
							})
						]
					})] }),
					/* @__PURE__ */ x(G, { children: [/* @__PURE__ */ x(K, { children: [/* @__PURE__ */ b(q, { children: r("basalam.ordersAutoTitle") }), /* @__PURE__ */ b(On, { children: r(se ? "basalam.ordersAutoOn" : "basalam.ordersAutoOff") })] }), /* @__PURE__ */ b(J, {
						className: "flex flex-wrap gap-2",
						children: /* @__PURE__ */ b(W, {
							onClick: () => ne.mutate(),
							disabled: ne.isPending || !ae,
							children: r(se ? "basalam.ordersAutoResetBtn" : "basalam.ordersAutoEnable")
						})
					})] }),
					/* @__PURE__ */ x(G, {
						className: "lg:col-span-2",
						children: [/* @__PURE__ */ x(K, { children: [/* @__PURE__ */ b(q, { children: r("basalam.shippingTitle") }), /* @__PURE__ */ b(On, { children: r("basalam.shippingHint") })] }), /* @__PURE__ */ x(J, {
							className: "grid gap-6 md:grid-cols-2",
							children: [/* @__PURE__ */ x("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ b("p", {
										className: "text-sm font-medium",
										children: r("basalam.shippingProfiles")
									}),
									/* @__PURE__ */ x("div", {
										className: "flex flex-wrap gap-2",
										children: [/* @__PURE__ */ b(Y, {
											className: "min-w-[12rem] flex-1",
											value: d,
											onChange: (e) => p(e.target.value),
											placeholder: r("basalam.shippingProfileTitle")
										}), /* @__PURE__ */ b(W, {
											onClick: () => I.mutate(),
											disabled: I.isPending || !d.trim() || !ae,
											children: r("basalam.createShippingProfile")
										})]
									}),
									/* @__PURE__ */ x("ul", {
										className: "space-y-2 text-sm",
										children: [ce.map((e) => /* @__PURE__ */ x("li", {
											className: "flex items-center justify-between gap-2 border-b py-2",
											children: [/* @__PURE__ */ b("span", { children: ei(e) }), /* @__PURE__ */ b(W, {
												size: "sm",
												variant: "destructive",
												onClick: () => te.mutate(Number(e.id)),
												disabled: te.isPending,
												children: r("basalam.delete")
											})]
										}, String(e.id))), ce.length ? null : /* @__PURE__ */ b("li", {
											className: "text-muted-foreground text-sm",
											children: r("basalam.noShippingProfiles")
										})]
									})
								]
							}), /* @__PURE__ */ b("div", {
								className: "space-y-4",
								children: /* @__PURE__ */ x("div", { children: [/* @__PURE__ */ b("p", {
									className: "mb-2 text-sm font-medium",
									children: r("basalam.shippingCarriers")
								}), /* @__PURE__ */ x("ul", {
									className: "text-muted-foreground space-y-1 text-sm",
									children: [(ue.length ? ue : le).slice(0, 12).map((e, t) => /* @__PURE__ */ b("li", { children: ei(e) }, String(e.id ?? t))), !ue.length && !le.length ? /* @__PURE__ */ b("li", { children: r("basalam.noCarriers") }) : null]
								})] })
							})]
						})]
					}),
					/* @__PURE__ */ x(G, {
						className: "lg:col-span-2",
						children: [/* @__PURE__ */ x(K, { children: [/* @__PURE__ */ b(q, { children: r("basalam.discountsTitle") }), /* @__PURE__ */ b(On, { children: r("basalam.discountsHint") })] }), /* @__PURE__ */ x(J, {
							className: "grid gap-4 md:grid-cols-[1fr_8rem_auto]",
							children: [
								/* @__PURE__ */ x("select", {
									className: "border-input bg-background h-9 w-full rounded-md border px-3 text-sm",
									value: m,
									onChange: (e) => h(e.target.value),
									children: [/* @__PURE__ */ b("option", {
										value: "",
										children: r("basalam.selectProduct")
									}), fe.map((e) => /* @__PURE__ */ b("option", {
										value: String(e.basalam_product_id),
										children: e.name || `#${e.id}`
									}, e.id))]
								}),
								/* @__PURE__ */ b(Y, {
									type: "number",
									min: 1,
									max: 99,
									value: g,
									onChange: (e) => y(e.target.value),
									placeholder: r("basalam.discountPercent")
								}),
								/* @__PURE__ */ b(W, {
									onClick: () => R.mutate(),
									disabled: R.isPending || !m || !ae,
									children: r("basalam.createDiscount")
								}),
								de.length ? /* @__PURE__ */ b("ul", {
									className: "text-muted-foreground space-y-1 text-sm md:col-span-3",
									children: de.slice(0, 8).map((e, t) => /* @__PURE__ */ x("li", { children: [String(e.title ?? e.product_id ?? e.id ?? "—"), e.discount == null ? "" : ` — ${String(e.discount)}%`] }, String(e.id ?? t)))
								}) : null
							]
						})]
					}),
					/* @__PURE__ */ b(kn, {
						open: w,
						onOpenChange: T,
						className: "lg:col-span-2",
						children: /* @__PURE__ */ x(G, { children: [/* @__PURE__ */ b(K, {
							className: "pb-3",
							children: /* @__PURE__ */ b(An, {
								asChild: !0,
								children: /* @__PURE__ */ x("button", {
									type: "button",
									className: "flex w-full items-center justify-between text-start",
									children: [/* @__PURE__ */ b(q, {
										className: "text-base",
										children: r("basalam.advanced")
									}), /* @__PURE__ */ b(L, { className: `size-4 transition-transform ${w ? "rotate-180" : ""}` })]
								})
							})
						}), /* @__PURE__ */ b(jn, { children: /* @__PURE__ */ x(J, {
							className: "space-y-3 border-t pt-4",
							children: [j.data?.webhook_url ? /* @__PURE__ */ b("code", {
								className: "bg-muted block overflow-x-auto rounded-md p-2 text-xs",
								children: j.data.webhook_url
							}) : null, /* @__PURE__ */ b(W, {
								size: "sm",
								variant: "secondary",
								onClick: () => re.mutate(),
								disabled: re.isPending || !ae,
								children: r("basalam.rotateWebhook")
							})]
						}) })] })
					})
				]
			})
		]
	});
}
//#endregion
//#region ../Modules/basalam-module/client/module-entry.tsx
var ni = {
	"settings/shop/basalam": $n,
	"settings/shop/basalam/products": zr,
	"settings/shop/basalam/orders": Br,
	"settings/shop/basalam/categories": Wr,
	"settings/shop/basalam/settings": Gr,
	"settings/shop/basalam/finance": Zr,
	"settings/shop/basalam/booth": ti,
	"settings/shop/basalam/tickets": $n,
	"settings/shop/basalam/logs": Qr,
	"settings/shop/basalam/payments": $n,
	"settings/shop/basalam/wallet": Zr,
	"settings/shop/basalam/subscriptions": $n,
	"settings/shop/basalam/webhooks": ti,
	"settings/shop/basalam/operations": zr
}, ri = { routes: ni };
//#endregion
export { ri as default, ni as routes };
