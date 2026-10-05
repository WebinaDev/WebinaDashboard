import { useMutation as e, useQuery as t, useQueryClient as n } from "@tanstack/react-query";
import * as r from "react";
import i, { createContext as a, createElement as o, forwardRef as s, useContext as c, useLayoutEffect as l, useMemo as u, useState as d } from "react";
import { useTranslation as f } from "react-i18next";
import { Link as p, useLocation as m } from "react-router-dom";
import { toast as h } from "sonner";
import { Fragment as g, jsx as _, jsxs as v } from "react/jsx-runtime";
import * as y from "react-dom";
import b from "react-dom";
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var x = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), S = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), C = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), w = (e) => {
	let t = C(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, T = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, E = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, ee = a({}), D = () => c(ee), O = s(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: a, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = D() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return o("svg", {
		ref: l,
		...T,
		width: t ?? u ?? T.width,
		height: t ?? u ?? T.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: x("lucide", m, i),
		...!a && !E(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => o(e, t)), ...Array.isArray(a) ? a : [a]]);
}), k = (e, t) => {
	let n = s(({ className: n, ...r }, i) => o(O, {
		ref: i,
		iconNode: t,
		className: x(`lucide-${S(w(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = w(e), n;
}, A = k("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]), j = k("chevron-down", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]), M = k("chevron-up", [["path", {
	d: "m18 15-6-6-6 6",
	key: "153udz"
}]]), N = k("copy", [["rect", {
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
//#region src/components/PageShell.tsx
function P({ title: e, description: t, eyebrow: n, children: r }) {
	return /* @__PURE__ */ v("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ v("header", {
			className: "min-w-0 space-y-1.5",
			children: [
				n ? /* @__PURE__ */ _("p", {
					className: "text-muted-foreground text-xs font-medium tracking-wide uppercase",
					children: n
				}) : null,
				/* @__PURE__ */ _("h1", {
					className: "text-xl font-semibold tracking-tight sm:text-2xl",
					children: e
				}),
				t ? /* @__PURE__ */ _("p", {
					className: "text-muted-foreground max-w-2xl text-sm leading-relaxed",
					children: t
				}) : null
			]
		}), r]
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function F(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") if (Array.isArray(e)) {
		var i = e.length;
		for (t = 0; t < i; t++) e[t] && (n = F(e[t])) && (r && (r += " "), r += n);
	} else for (n in e) e[n] && (r && (r += " "), r += n);
	return r;
}
function te() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = F(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/class-variance-authority/dist/index.mjs
var ne = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, re = te, ie = (e, t) => (n) => {
	if (t?.variants == null) return re(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = ne(t) || ne(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return re(e, a, t?.compoundVariants?.reduce((e, t) => {
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
function I(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function L(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = I(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : I(e[t], null);
			}
		};
	};
}
function R(...e) {
	return r.useCallback(L(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function ae(e) {
	let t = /* @__PURE__ */ z(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(se);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ _(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ _(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function z(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = le(n), a = ce(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? L(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var oe = Symbol("radix.slottable");
function se(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === oe;
}
function ce(e, t) {
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
function le(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/dist/index.mjs
var B = [
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
	let n = /* @__PURE__ */ ae(`Primitive.${t}`), i = r.forwardRef((e, r) => {
		let { asChild: i, ...a } = e, o = i ? n : t;
		return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ _(o, {
			...a,
			ref: r
		});
	});
	return i.displayName = `Primitive.${t}`, {
		...e,
		[t]: i
	};
}, {});
function ue(e, t) {
	e && y.flushSync(() => e.dispatchEvent(t));
}
//#endregion
//#region node_modules/@radix-ui/react-visually-hidden/dist/index.mjs
var de = Object.freeze({
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
}), fe = "VisuallyHidden", pe = r.forwardRef((e, t) => /* @__PURE__ */ _(B.span, {
	...e,
	ref: t,
	style: {
		...de,
		...e.style
	}
}));
pe.displayName = fe;
//#endregion
//#region node_modules/@radix-ui/react-context/dist/index.mjs
function me(e, t = []) {
	let n = [];
	function i(t, i) {
		let a = r.createContext(i), o = n.length;
		n = [...n, i];
		let s = (t) => {
			let { scope: n, children: i, ...s } = t, c = n?.[e]?.[o] || a, l = r.useMemo(() => s, Object.values(s));
			return /* @__PURE__ */ _(c.Provider, {
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
	return a.scopeName = e, [i, he(a, ...t)];
}
function he(...e) {
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
function ge(e) {
	let t = /* @__PURE__ */ _e(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(ye);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ _(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ _(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function _e(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = xe(n), a = be(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? L(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var ve = Symbol("radix.slottable");
function ye(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === ve;
}
function be(e, t) {
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
function xe(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function Se(e) {
	let t = e + "CollectionProvider", [n, r] = me(t), [a, o] = n(t, {
		collectionRef: { current: null },
		itemMap: /* @__PURE__ */ new Map()
	}), s = (e) => {
		let { scope: t, children: n } = e, r = i.useRef(null), o = i.useRef(/* @__PURE__ */ new Map()).current;
		return /* @__PURE__ */ _(a, {
			scope: t,
			itemMap: o,
			collectionRef: r,
			children: n
		});
	};
	s.displayName = t;
	let c = e + "CollectionSlot", l = /* @__PURE__ */ ge(c), u = i.forwardRef((e, t) => {
		let { scope: n, children: r } = e;
		return /* @__PURE__ */ _(l, {
			ref: R(t, o(c, n).collectionRef),
			children: r
		});
	});
	u.displayName = c;
	let d = e + "CollectionItemSlot", f = "data-radix-collection-item", p = /* @__PURE__ */ ge(d), m = i.forwardRef((e, t) => {
		let { scope: n, children: r, ...a } = e, s = i.useRef(null), c = R(t, s), l = o(d, n);
		return i.useEffect(() => (l.itemMap.set(s, {
			ref: s,
			...a
		}), () => void l.itemMap.delete(s))), /* @__PURE__ */ _(p, {
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
function V(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var H = globalThis?.document ? r.useLayoutEffect : () => {}, Ce = r.useInsertionEffect || H;
function we({ prop: e, defaultProp: t, onChange: n = () => {}, caller: i }) {
	let [a, o, s] = Te({
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
			let n = Ee(t) ? t(e) : t;
			n !== e && s.current?.(n);
		} else o(t);
	}, [
		c,
		e,
		o,
		s
	])];
}
function Te({ defaultProp: e, onChange: t }) {
	let [n, i] = r.useState(e), a = r.useRef(n), o = r.useRef(t);
	return Ce(() => {
		o.current = t;
	}, [t]), r.useEffect(() => {
		a.current !== n && (o.current?.(n), a.current = n);
	}, [n, a]), [
		n,
		i,
		o
	];
}
function Ee(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/@radix-ui/react-id/dist/index.mjs
var De = r.useId || (() => void 0), Oe = 0;
function ke(e) {
	let [t, n] = r.useState(De());
	return H(() => {
		e || n((e) => e ?? String(Oe++));
	}, [e]), e || (t ? `radix-${t}` : "");
}
//#endregion
//#region node_modules/@radix-ui/react-direction/dist/index.mjs
var Ae = r.createContext(void 0);
function je(e) {
	let t = r.useContext(Ae);
	return e || t || "ltr";
}
//#endregion
//#region node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
function Me(e) {
	let t = r.useRef(e);
	return r.useEffect(() => {
		t.current = e;
	}), r.useMemo(() => (...e) => t.current?.(...e), []);
}
//#endregion
//#region node_modules/@radix-ui/react-use-escape-keydown/dist/index.mjs
function Ne(e, t = globalThis?.document) {
	let n = Me(e);
	r.useEffect(() => {
		let e = (e) => {
			e.key === "Escape" && n(e);
		};
		return t.addEventListener("keydown", e, { capture: !0 }), () => t.removeEventListener("keydown", e, { capture: !0 });
	}, [n, t]);
}
//#endregion
//#region node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var Pe = "DismissableLayer", Fe = "dismissableLayer.update", Ie = "dismissableLayer.pointerDownOutside", Le = "dismissableLayer.focusOutside", Re, ze = r.createContext({
	layers: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), Be = r.forwardRef((e, t) => {
	let { disableOutsidePointerEvents: n = !1, onEscapeKeyDown: i, onPointerDownOutside: a, onFocusOutside: o, onInteractOutside: s, onDismiss: c, ...l } = e, u = r.useContext(ze), [d, f] = r.useState(null), p = d?.ownerDocument ?? globalThis?.document, [, m] = r.useState({}), h = R(t, (e) => f(e)), g = Array.from(u.layers), [v] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1), y = g.indexOf(v), b = d ? g.indexOf(d) : -1, x = u.layersWithOutsidePointerEventsDisabled.size > 0, S = b >= y, C = Ue((e) => {
		let t = e.target, n = [...u.branches].some((e) => e.contains(t));
		!S || n || (a?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p), w = We((e) => {
		let t = e.target;
		[...u.branches].some((e) => e.contains(t)) || (o?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p);
	return Ne((e) => {
		b === u.layers.size - 1 && (i?.(e), !e.defaultPrevented && c && (e.preventDefault(), c()));
	}, p), r.useEffect(() => {
		if (d) return n && (u.layersWithOutsidePointerEventsDisabled.size === 0 && (Re = p.body.style.pointerEvents, p.body.style.pointerEvents = "none"), u.layersWithOutsidePointerEventsDisabled.add(d)), u.layers.add(d), Ge(), () => {
			n && u.layersWithOutsidePointerEventsDisabled.size === 1 && (p.body.style.pointerEvents = Re);
		};
	}, [
		d,
		p,
		n,
		u
	]), r.useEffect(() => () => {
		d && (u.layers.delete(d), u.layersWithOutsidePointerEventsDisabled.delete(d), Ge());
	}, [d, u]), r.useEffect(() => {
		let e = () => m({});
		return document.addEventListener(Fe, e), () => document.removeEventListener(Fe, e);
	}, []), /* @__PURE__ */ _(B.div, {
		...l,
		ref: h,
		style: {
			pointerEvents: x ? S ? "auto" : "none" : void 0,
			...e.style
		},
		onFocusCapture: V(e.onFocusCapture, w.onFocusCapture),
		onBlurCapture: V(e.onBlurCapture, w.onBlurCapture),
		onPointerDownCapture: V(e.onPointerDownCapture, C.onPointerDownCapture)
	});
});
Be.displayName = Pe;
var Ve = "DismissableLayerBranch", He = r.forwardRef((e, t) => {
	let n = r.useContext(ze), i = r.useRef(null), a = R(t, i);
	return r.useEffect(() => {
		let e = i.current;
		if (e) return n.branches.add(e), () => {
			n.branches.delete(e);
		};
	}, [n.branches]), /* @__PURE__ */ _(B.div, {
		...e,
		ref: a
	});
});
He.displayName = Ve;
function Ue(e, t = globalThis?.document) {
	let n = Me(e), i = r.useRef(!1), a = r.useRef(() => {});
	return r.useEffect(() => {
		let e = (e) => {
			if (e.target && !i.current) {
				let r = function() {
					Ke(Ie, n, i, { discrete: !0 });
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
function We(e, t = globalThis?.document) {
	let n = Me(e), i = r.useRef(!1);
	return r.useEffect(() => {
		let e = (e) => {
			e.target && !i.current && Ke(Le, n, { originalEvent: e }, { discrete: !1 });
		};
		return t.addEventListener("focusin", e), () => t.removeEventListener("focusin", e);
	}, [t, n]), {
		onFocusCapture: () => i.current = !0,
		onBlurCapture: () => i.current = !1
	};
}
function Ge() {
	let e = new CustomEvent(Fe);
	document.dispatchEvent(e);
}
function Ke(e, t, n, { discrete: r }) {
	let i = n.originalEvent.target, a = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && i.addEventListener(e, t, { once: !0 }), r ? ue(i, a) : i.dispatchEvent(a);
}
//#endregion
//#region node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var qe = "focusScope.autoFocusOnMount", Je = "focusScope.autoFocusOnUnmount", Ye = {
	bubbles: !1,
	cancelable: !0
}, Xe = "FocusScope", Ze = r.forwardRef((e, t) => {
	let { loop: n = !1, trapped: i = !1, onMountAutoFocus: a, onUnmountAutoFocus: o, ...s } = e, [c, l] = r.useState(null), u = Me(a), d = Me(o), f = r.useRef(null), p = R(t, (e) => l(e)), m = r.useRef({
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
				c.contains(t) ? f.current = t : it(f.current, { select: !0 });
			}, t = function(e) {
				if (m.paused || !c) return;
				let t = e.relatedTarget;
				t !== null && (c.contains(t) || it(f.current, { select: !0 }));
			}, n = function(e) {
				if (document.activeElement === document.body) for (let t of e) t.removedNodes.length > 0 && it(c);
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
			at.add(m);
			let e = document.activeElement;
			if (!c.contains(e)) {
				let t = new CustomEvent(qe, Ye);
				c.addEventListener(qe, u), c.dispatchEvent(t), t.defaultPrevented || (Qe(ct(et(c)), { select: !0 }), document.activeElement === e && it(c));
			}
			return () => {
				c.removeEventListener(qe, u), setTimeout(() => {
					let t = new CustomEvent(Je, Ye);
					c.addEventListener(Je, d), c.dispatchEvent(t), t.defaultPrevented || it(e ?? document.body, { select: !0 }), c.removeEventListener(Je, d), at.remove(m);
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
			let t = e.currentTarget, [i, a] = $e(t);
			i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n && it(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n && it(a, { select: !0 })) : r === t && e.preventDefault();
		}
	}, [
		n,
		i,
		m.paused
	]);
	return /* @__PURE__ */ _(B.div, {
		tabIndex: -1,
		...s,
		ref: p,
		onKeyDown: h
	});
});
Ze.displayName = Xe;
function Qe(e, { select: t = !1 } = {}) {
	let n = document.activeElement;
	for (let r of e) if (it(r, { select: t }), document.activeElement !== n) return;
}
function $e(e) {
	let t = et(e);
	return [tt(t, e), tt(t.reverse(), e)];
}
function et(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t;
}
function tt(e, t) {
	for (let n of e) if (!nt(n, { upTo: t })) return n;
}
function nt(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function rt(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function it(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = document.activeElement;
		e.focus({ preventScroll: !0 }), e !== n && rt(e) && t && e.select();
	}
}
var at = ot();
function ot() {
	let e = [];
	return {
		add(t) {
			let n = e[0];
			t !== n && n?.pause(), e = st(e, t), e.unshift(t);
		},
		remove(t) {
			e = st(e, t), e[0]?.resume();
		}
	};
}
function st(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
function ct(e) {
	return e.filter((e) => e.tagName !== "A");
}
//#endregion
//#region node_modules/@radix-ui/react-portal/dist/index.mjs
var lt = "Portal", ut = r.forwardRef((e, t) => {
	let { container: n, ...i } = e, [a, o] = r.useState(!1);
	H(() => o(!0), []);
	let s = n || a && globalThis?.document?.body;
	return s ? b.createPortal(/* @__PURE__ */ _(B.div, {
		...i,
		ref: t
	}), s) : null;
});
ut.displayName = lt;
//#endregion
//#region node_modules/@radix-ui/react-focus-guards/dist/index.mjs
var dt = 0;
function ft() {
	r.useEffect(() => {
		let e = document.querySelectorAll("[data-radix-focus-guard]");
		return document.body.insertAdjacentElement("afterbegin", e[0] ?? pt()), document.body.insertAdjacentElement("beforeend", e[1] ?? pt()), dt++, () => {
			dt === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((e) => e.remove()), dt--;
		};
	}, []);
}
function pt() {
	let e = document.createElement("span");
	return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
//#endregion
//#region node_modules/tslib/tslib.es6.mjs
var mt = function() {
	return mt = Object.assign || function(e) {
		for (var t, n = 1, r = arguments.length; n < r; n++) for (var i in t = arguments[n], t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
		return e;
	}, mt.apply(this, arguments);
};
function ht(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
function gt(e, t, n) {
	if (n || arguments.length === 2) for (var r = 0, i = t.length, a; r < i; r++) (a || !(r in t)) && (a || (a = Array.prototype.slice.call(t, 0, r)), a[r] = t[r]);
	return e.concat(a || Array.prototype.slice.call(t));
}
//#endregion
//#region node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var _t = "right-scroll-bar-position", vt = "width-before-scroll-bar", yt = "with-scroll-bars-hidden", bt = "--removed-body-scroll-bar-size";
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/assignRef.js
function xt(e, t) {
	return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/useRef.js
function St(e, t) {
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
var Ct = typeof window < "u" ? r.useLayoutEffect : r.useEffect, wt = /* @__PURE__ */ new WeakMap();
function Tt(e, t) {
	var n = St(t || null, function(t) {
		return e.forEach(function(e) {
			return xt(e, t);
		});
	});
	return Ct(function() {
		var t = wt.get(n);
		if (t) {
			var r = new Set(t), i = new Set(e), a = n.current;
			r.forEach(function(e) {
				i.has(e) || xt(e, null);
			}), i.forEach(function(e) {
				r.has(e) || xt(e, a);
			});
		}
		wt.set(n, e);
	}, [e]), n;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/medium.js
function Et(e) {
	return e;
}
function Dt(e, t) {
	t === void 0 && (t = Et);
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
function Ot(e) {
	e === void 0 && (e = {});
	var t = Dt(null);
	return t.options = mt({
		async: !0,
		ssr: !1
	}, e), t;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/exports.js
var kt = function(e) {
	var t = e.sideCar, n = ht(e, ["sideCar"]);
	if (!t) throw Error("Sidecar: please provide `sideCar` property to import the right car");
	var i = t.read();
	if (!i) throw Error("Sidecar medium not found");
	return r.createElement(i, mt({}, n));
};
kt.isSideCarExport = !0;
function At(e, t) {
	return e.useMedium(t), kt;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/medium.js
var jt = Ot(), Mt = function() {}, Nt = r.forwardRef(function(e, t) {
	var n = r.useRef(null), i = r.useState({
		onScrollCapture: Mt,
		onWheelCapture: Mt,
		onTouchMoveCapture: Mt
	}), a = i[0], o = i[1], s = e.forwardProps, c = e.children, l = e.className, u = e.removeScrollBar, d = e.enabled, f = e.shards, p = e.sideCar, m = e.noRelative, h = e.noIsolation, g = e.inert, _ = e.allowPinchZoom, v = e.as, y = v === void 0 ? "div" : v, b = e.gapMode, x = ht(e, [
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
	]), S = p, C = Tt([n, t]), w = mt(mt({}, x), a);
	return r.createElement(r.Fragment, null, d && r.createElement(S, {
		sideCar: jt,
		removeScrollBar: u,
		shards: f,
		noRelative: m,
		noIsolation: h,
		inert: g,
		setCallbacks: o,
		allowPinchZoom: !!_,
		lockRef: n,
		gapMode: b
	}), s ? r.cloneElement(r.Children.only(c), mt(mt({}, w), { ref: C })) : r.createElement(y, mt({}, w, {
		className: l,
		ref: C
	}), c));
});
Nt.defaultProps = {
	enabled: !0,
	removeScrollBar: !0,
	inert: !1
}, Nt.classNames = {
	fullWidth: vt,
	zeroRight: _t
};
//#endregion
//#region node_modules/get-nonce/dist/es2015/index.js
var Pt, Ft = function() {
	if (Pt) return Pt;
	if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
//#endregion
//#region node_modules/react-style-singleton/dist/es2015/singleton.js
function It() {
	if (!document) return null;
	var e = document.createElement("style");
	e.type = "text/css";
	var t = Ft();
	return t && e.setAttribute("nonce", t), e;
}
function Lt(e, t) {
	e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function Rt(e) {
	(document.head || document.getElementsByTagName("head")[0]).appendChild(e);
}
var zt = function() {
	var e = 0, t = null;
	return {
		add: function(n) {
			e == 0 && (t = It()) && (Lt(t, n), Rt(t)), e++;
		},
		remove: function() {
			e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
		}
	};
}, Bt = function() {
	var e = zt();
	return function(t, n) {
		r.useEffect(function() {
			return e.add(t), function() {
				e.remove();
			};
		}, [t && n]);
	};
}, Vt = function() {
	var e = Bt();
	return function(t) {
		var n = t.styles, r = t.dynamic;
		return e(n, r), null;
	};
}, Ht = {
	left: 0,
	top: 0,
	right: 0,
	gap: 0
}, Ut = function(e) {
	return parseInt(e || "", 10) || 0;
}, Wt = function(e) {
	var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
	return [
		Ut(n),
		Ut(r),
		Ut(i)
	];
}, Gt = function(e) {
	if (e === void 0 && (e = "margin"), typeof window > "u") return Ht;
	var t = Wt(e), n = document.documentElement.clientWidth, r = window.innerWidth;
	return {
		left: t[0],
		top: t[1],
		right: t[2],
		gap: Math.max(0, r - n + t[2] - t[0])
	};
}, Kt = Vt(), qt = "data-scroll-locked", Jt = function(e, t, n, r) {
	var i = e.left, a = e.top, o = e.right, s = e.gap;
	return n === void 0 && (n = "margin"), `
  .${yt} {
   overflow: hidden ${r};
   padding-right: ${s}px ${r};
  }
  body[${qt}] {
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
  
  .${_t} {
    right: ${s}px ${r};
  }
  
  .${vt} {
    margin-right: ${s}px ${r};
  }
  
  .${_t} .${_t} {
    right: 0 ${r};
  }
  
  .${vt} .${vt} {
    margin-right: 0 ${r};
  }
  
  body[${qt}] {
    ${bt}: ${s}px;
  }
`;
}, Yt = function() {
	var e = parseInt(document.body.getAttribute("data-scroll-locked") || "0", 10);
	return isFinite(e) ? e : 0;
}, Xt = function() {
	r.useEffect(function() {
		return document.body.setAttribute(qt, (Yt() + 1).toString()), function() {
			var e = Yt() - 1;
			e <= 0 ? document.body.removeAttribute(qt) : document.body.setAttribute(qt, e.toString());
		};
	}, []);
}, Zt = function(e) {
	var t = e.noRelative, n = e.noImportant, i = e.gapMode, a = i === void 0 ? "margin" : i;
	Xt();
	var o = r.useMemo(function() {
		return Gt(a);
	}, [a]);
	return r.createElement(Kt, { styles: Jt(o, !t, a, n ? "" : "!important") });
}, Qt = !1;
if (typeof window < "u") try {
	var $t = Object.defineProperty({}, "passive", { get: function() {
		return Qt = !0, !0;
	} });
	window.addEventListener("test", $t, $t), window.removeEventListener("test", $t, $t);
} catch {
	Qt = !1;
}
var en = Qt ? { passive: !1 } : !1, tn = function(e) {
	return e.tagName === "TEXTAREA";
}, nn = function(e, t) {
	if (!(e instanceof Element)) return !1;
	var n = window.getComputedStyle(e);
	return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !tn(e) && n[t] === "visible");
}, rn = function(e) {
	return nn(e, "overflowY");
}, an = function(e) {
	return nn(e, "overflowX");
}, on = function(e, t) {
	var n = t.ownerDocument, r = t;
	do {
		if (typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host), ln(e, r)) {
			var i = un(e, r);
			if (i[1] > i[2]) return !0;
		}
		r = r.parentNode;
	} while (r && r !== n.body);
	return !1;
}, sn = function(e) {
	return [
		e.scrollTop,
		e.scrollHeight,
		e.clientHeight
	];
}, cn = function(e) {
	return [
		e.scrollLeft,
		e.scrollWidth,
		e.clientWidth
	];
}, ln = function(e, t) {
	return e === "v" ? rn(t) : an(t);
}, un = function(e, t) {
	return e === "v" ? sn(t) : cn(t);
}, dn = function(e, t) {
	return e === "h" && t === "rtl" ? -1 : 1;
}, fn = function(e, t, n, r, i) {
	var a = dn(e, window.getComputedStyle(t).direction), o = a * r, s = n.target, c = t.contains(s), l = !1, u = o > 0, d = 0, f = 0;
	do {
		if (!s) break;
		var p = un(e, s), m = p[0], h = p[1] - p[2] - a * m;
		(m || h) && ln(e, s) && (d += h, f += m);
		var g = s.parentNode;
		s = g && g.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? g.host : g;
	} while (!c && s !== document.body || c && (t.contains(s) || t === s));
	return (u && (i && Math.abs(d) < 1 || !i && o > d) || !u && (i && Math.abs(f) < 1 || !i && -o > f)) && (l = !0), l;
}, pn = function(e) {
	return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, mn = function(e) {
	return [e.deltaX, e.deltaY];
}, hn = function(e) {
	return e && "current" in e ? e.current : e;
}, gn = function(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}, _n = function(e) {
	return `
  .block-interactivity-${e} {pointer-events: none;}
  .allow-interactivity-${e} {pointer-events: all;}
`;
}, vn = 0, yn = [];
function bn(e) {
	var t = r.useRef([]), n = r.useRef([0, 0]), i = r.useRef(), a = r.useState(vn++)[0], o = r.useState(Vt)[0], s = r.useRef(e);
	r.useEffect(function() {
		s.current = e;
	}, [e]), r.useEffect(function() {
		if (e.inert) {
			document.body.classList.add(`block-interactivity-${a}`);
			var t = gt([e.lockRef.current], (e.shards || []).map(hn), !0).filter(Boolean);
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
		var r = pn(e), a = n.current, o = "deltaX" in e ? e.deltaX : a[0] - r[0], c = "deltaY" in e ? e.deltaY : a[1] - r[1], l, u = e.target, d = Math.abs(o) > Math.abs(c) ? "h" : "v";
		if ("touches" in e && d === "h" && u.type === "range") return !1;
		var f = window.getSelection(), p = f && f.anchorNode;
		if (p && (p === u || p.contains(u))) return !1;
		var m = on(d, u);
		if (!m) return !0;
		if (m ? l = d : (l = d === "v" ? "h" : "v", m = on(d, u)), !m) return !1;
		if (!i.current && "changedTouches" in e && (o || c) && (i.current = l), !l) return !0;
		var h = i.current || l;
		return fn(h, t, e, h === "h" ? o : c, !0);
	}, []), l = r.useCallback(function(e) {
		var n = e;
		if (!(!yn.length || yn[yn.length - 1] !== o)) {
			var r = "deltaY" in n ? mn(n) : pn(n), i = t.current.filter(function(e) {
				return e.name === n.type && (e.target === n.target || n.target === e.shadowParent) && gn(e.delta, r);
			})[0];
			if (i && i.should) {
				n.cancelable && n.preventDefault();
				return;
			}
			if (!i) {
				var a = (s.current.shards || []).map(hn).filter(Boolean).filter(function(e) {
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
			shadowParent: xn(r)
		};
		t.current.push(a), setTimeout(function() {
			t.current = t.current.filter(function(e) {
				return e !== a;
			});
		}, 1);
	}, []), d = r.useCallback(function(e) {
		n.current = pn(e), i.current = void 0;
	}, []), f = r.useCallback(function(t) {
		u(t.type, mn(t), t.target, c(t, e.lockRef.current));
	}, []), p = r.useCallback(function(t) {
		u(t.type, pn(t), t.target, c(t, e.lockRef.current));
	}, []);
	r.useEffect(function() {
		return yn.push(o), e.setCallbacks({
			onScrollCapture: f,
			onWheelCapture: f,
			onTouchMoveCapture: p
		}), document.addEventListener("wheel", l, en), document.addEventListener("touchmove", l, en), document.addEventListener("touchstart", d, en), function() {
			yn = yn.filter(function(e) {
				return e !== o;
			}), document.removeEventListener("wheel", l, en), document.removeEventListener("touchmove", l, en), document.removeEventListener("touchstart", d, en);
		};
	}, []);
	var m = e.removeScrollBar, h = e.inert;
	return r.createElement(r.Fragment, null, h ? r.createElement(o, { styles: _n(a) }) : null, m ? r.createElement(Zt, {
		noRelative: e.noRelative,
		gapMode: e.gapMode
	}) : null);
}
function xn(e) {
	for (var t = null; e !== null;) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
	return t;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/sidecar.js
var Sn = At(jt, bn), Cn = r.forwardRef(function(e, t) {
	return r.createElement(Nt, mt({}, e, {
		ref: t,
		sideCar: Sn
	}));
});
Cn.classNames = Nt.classNames;
//#endregion
//#region src/lib/remove-scroll-gate.tsx
var wn = r.createContext(!1);
function Tn({ allowBodyScroll: e, children: t }) {
	return /* @__PURE__ */ _(wn.Provider, {
		value: e,
		children: t
	});
}
function En() {
	return r.useContext(wn);
}
//#endregion
//#region src/lib/react-remove-scroll-shim.tsx
var Dn = r.forwardRef(function(e, t) {
	let n = En() ? !1 : e.enabled !== !1;
	return /* @__PURE__ */ _(Cn, {
		...e,
		ref: t,
		enabled: n
	});
});
Dn.classNames = Cn.classNames;
//#endregion
//#region node_modules/aria-hidden/dist/es2015/index.js
var On = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, kn = /* @__PURE__ */ new WeakMap(), An = /* @__PURE__ */ new WeakMap(), jn = {}, Mn = 0, Nn = function(e) {
	return e && (e.host || Nn(e.parentNode));
}, Pn = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = Nn(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, Fn = function(e, t, n, r) {
	var i = Pn(t, Array.isArray(e) ? e : [e]);
	jn[n] || (jn[n] = /* @__PURE__ */ new WeakMap());
	var a = jn[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		!e || s.has(e) || (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		!e || c.has(e) || Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (kn.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				kn.set(e, c), a.set(e, l), o.push(e), c === 1 && i && An.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), Mn++, function() {
		o.forEach(function(e) {
			var t = kn.get(e) - 1, i = a.get(e) - 1;
			kn.set(e, t), a.set(e, i), t || (An.has(e) || e.removeAttribute(r), An.delete(e)), i || e.removeAttribute(n);
		}), Mn--, Mn || (kn = /* @__PURE__ */ new WeakMap(), kn = /* @__PURE__ */ new WeakMap(), An = /* @__PURE__ */ new WeakMap(), jn = {});
	};
}, In = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || On(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), Fn(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function Ln(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function Rn(e) {
	let [t, n] = r.useState(void 0);
	return H(() => {
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
var zn = [
	"top",
	"right",
	"bottom",
	"left"
], Bn = Math.min, U = Math.max, Vn = Math.round, Hn = Math.floor, Un = (e) => ({
	x: e,
	y: e
}), Wn = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function Gn(e, t, n) {
	return U(e, Bn(t, n));
}
function Kn(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function qn(e) {
	return e.split("-")[0];
}
function Jn(e) {
	return e.split("-")[1];
}
function Yn(e) {
	return e === "x" ? "y" : "x";
}
function Xn(e) {
	return e === "y" ? "height" : "width";
}
function Zn(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function Qn(e) {
	return Yn(Zn(e));
}
function $n(e, t, n) {
	n === void 0 && (n = !1);
	let r = Jn(e), i = Qn(e), a = Xn(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = cr(o)), [o, cr(o)];
}
function er(e) {
	let t = cr(e);
	return [
		tr(e),
		t,
		tr(t)
	];
}
function tr(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var nr = ["left", "right"], rr = ["right", "left"], ir = ["top", "bottom"], ar = ["bottom", "top"];
function or(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? rr : nr : t ? nr : rr;
		case "left":
		case "right": return t ? ir : ar;
		default: return [];
	}
}
function sr(e, t, n, r) {
	let i = Jn(e), a = or(qn(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(tr)))), a;
}
function cr(e) {
	let t = qn(e);
	return Wn[t] + e.slice(t.length);
}
function lr(e) {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...e
	};
}
function ur(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : lr(e);
}
function dr(e) {
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
function fr(e, t, n) {
	let { reference: r, floating: i } = e, a = Zn(t), o = Qn(t), s = Xn(o), c = qn(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	switch (Jn(t)) {
		case "start":
			p[o] -= f * (n && l ? -1 : 1);
			break;
		case "end":
			p[o] += f * (n && l ? -1 : 1);
			break;
	}
	return p;
}
async function pr(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = Kn(t, e), p = ur(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = dr(await i.getClippingRect({
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
	}, y = dr(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var mr = 50, hr = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: pr
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = fr(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < mr && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = fr(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, gr = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = Kn(e, t) || {};
		if (l == null) return {};
		let d = ur(u), f = {
			x: n,
			y: r
		}, p = Qn(i), m = Xn(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = Bn(d[_], T), ee = Bn(d[v], T), D = E, O = C - h[m] - ee, k = C / 2 - h[m] / 2 + w, A = Gn(D, k, O), j = !c.arrow && Jn(i) != null && k !== A && a.reference[m] / 2 - (k < D ? E : ee) - h[m] / 2 < 0, M = j ? k < D ? k - D : k - O : 0;
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
}), _r = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = Kn(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = qn(r), _ = Zn(o), v = qn(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [cr(o)] : er(o)), x = p !== "none";
			!d && x && b.push(...sr(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = $n(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (!(u === "alignment" && _ !== Zn(t)) || T.every((e) => Zn(e.placement) === _ ? e.overflows[0] > 0 : !0))) return {
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
								let t = Zn(e.placement);
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
function vr(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function yr(e) {
	return zn.some((t) => e[t] >= 0);
}
var br = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = Kn(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = vr(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: yr(e)
					} };
				}
				case "escaped": {
					let e = vr(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: yr(e)
					} };
				}
				default: return {};
			}
		}
	};
}, xr = /* @__PURE__ */ new Set(["left", "top"]);
async function Sr(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = qn(n), s = Jn(n), c = Zn(n) === "y", l = xr.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = Kn(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var Cr = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await Sr(t, e);
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
}, wr = function(e) {
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
			} }, ...l } = Kn(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = Zn(qn(i)), p = Yn(f), m = u[p], h = u[f];
			if (o) {
				let e = p === "y" ? "top" : "left", t = p === "y" ? "bottom" : "right", n = m + d[e], r = m - d[t];
				m = Gn(n, m, r);
			}
			if (s) {
				let e = f === "y" ? "top" : "left", t = f === "y" ? "bottom" : "right", n = h + d[e], r = h - d[t];
				h = Gn(n, h, r);
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
}, Tr = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = Kn(e, t), u = {
				x: n,
				y: r
			}, d = Zn(i), f = Yn(d), p = u[f], m = u[d], h = Kn(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = xr.has(qn(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, Er = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			var n, r;
			let { placement: i, rects: a, platform: o, elements: s } = t, { apply: c = () => {}, ...l } = Kn(e, t), u = await o.detectOverflow(t, l), d = qn(i), f = Jn(i), p = Zn(i) === "y", { width: m, height: h } = a.floating, g, _;
			d === "top" || d === "bottom" ? (g = d, _ = f === (await (o.isRTL == null ? void 0 : o.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (_ = d, g = f === "end" ? "top" : "bottom");
			let v = h - u.top - u.bottom, y = m - u.left - u.right, b = Bn(h - u[g], v), x = Bn(m - u[_], y), S = !t.middlewareData.shift, C = b, w = x;
			if ((n = t.middlewareData.shift) != null && n.enabled.x && (w = y), (r = t.middlewareData.shift) != null && r.enabled.y && (C = v), S && !f) {
				let e = U(u.left, 0), t = U(u.right, 0), n = U(u.top, 0), r = U(u.bottom, 0);
				p ? w = m - 2 * (e !== 0 || t !== 0 ? e + t : U(u.left, u.right)) : C = h - 2 * (n !== 0 || r !== 0 ? n + r : U(u.top, u.bottom));
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
function Dr() {
	return typeof window < "u";
}
function Or(e) {
	return Ar(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function W(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function kr(e) {
	return ((Ar(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function Ar(e) {
	return Dr() ? e instanceof Node || e instanceof W(e).Node : !1;
}
function G(e) {
	return Dr() ? e instanceof Element || e instanceof W(e).Element : !1;
}
function jr(e) {
	return Dr() ? e instanceof HTMLElement || e instanceof W(e).HTMLElement : !1;
}
function Mr(e) {
	return !Dr() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof W(e).ShadowRoot;
}
function Nr(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = K(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function Pr(e) {
	return /^(table|td|th)$/.test(Or(e));
}
function Fr(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var Ir = /transform|translate|scale|rotate|perspective|filter/, Lr = /paint|layout|strict|content/, Rr = (e) => !!e && e !== "none", zr;
function Br(e) {
	let t = G(e) ? K(e) : e;
	return Rr(t.transform) || Rr(t.translate) || Rr(t.scale) || Rr(t.rotate) || Rr(t.perspective) || !Hr() && (Rr(t.backdropFilter) || Rr(t.filter)) || Ir.test(t.willChange || "") || Lr.test(t.contain || "");
}
function Vr(e) {
	let t = Gr(e);
	for (; jr(t) && !Ur(t);) {
		if (Br(t)) return t;
		if (Fr(t)) return null;
		t = Gr(t);
	}
	return null;
}
function Hr() {
	return zr ?? (zr = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), zr;
}
function Ur(e) {
	return /^(html|body|#document)$/.test(Or(e));
}
function K(e) {
	return W(e).getComputedStyle(e);
}
function Wr(e) {
	return G(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function Gr(e) {
	if (Or(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Mr(e) && e.host || kr(e);
	return Mr(t) ? t.host : t;
}
function Kr(e) {
	let t = Gr(e);
	return Ur(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : jr(t) && Nr(t) ? t : Kr(t);
}
function qr(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = Kr(e), i = r === e.ownerDocument?.body, a = W(r);
	if (i) {
		let e = Jr(a);
		return t.concat(a, a.visualViewport || [], Nr(r) ? r : [], e && n ? qr(e) : []);
	} else return t.concat(r, qr(r, [], n));
}
function Jr(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function Yr(e) {
	let t = K(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = jr(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = Vn(n) !== a || Vn(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function Xr(e) {
	return G(e) ? e : e.contextElement;
}
function Zr(e) {
	let t = Xr(e);
	if (!jr(t)) return Un(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = Yr(t), o = (a ? Vn(n.width) : n.width) / r, s = (a ? Vn(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var Qr = /* @__PURE__ */ Un(0);
function $r(e) {
	let t = W(e);
	return !Hr() || !t.visualViewport ? Qr : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function ei(e, t, n) {
	return t === void 0 && (t = !1), !n || t && n !== W(e) ? !1 : t;
}
function ti(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = Xr(e), o = Un(1);
	t && (r ? G(r) && (o = Zr(r)) : o = Zr(e));
	let s = ei(a, n, r) ? $r(a) : Un(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a) {
		let e = W(a), t = r && G(r) ? W(r) : r, n = e, i = Jr(n);
		for (; i && r && t !== n;) {
			let e = Zr(i), t = i.getBoundingClientRect(), r = K(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = W(i), i = Jr(n);
		}
	}
	return dr({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function ni(e, t) {
	let n = Wr(e).scrollLeft;
	return t ? t.left + n : ti(kr(e)).left + n;
}
function ri(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - ni(e, n),
		y: n.top + t.scrollTop
	};
}
function ii(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = kr(r), s = t ? Fr(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = Un(1), u = Un(0), d = jr(r);
	if ((d || !d && !a) && ((Or(r) !== "body" || Nr(o)) && (c = Wr(r)), d)) {
		let e = ti(r);
		l = Zr(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? ri(o, c) : Un(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function ai(e) {
	return Array.from(e.getClientRects());
}
function oi(e) {
	let t = kr(e), n = Wr(e), r = e.ownerDocument.body, i = U(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), a = U(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight), o = -n.scrollLeft + ni(e), s = -n.scrollTop;
	return K(r).direction === "rtl" && (o += U(t.clientWidth, r.clientWidth) - i), {
		width: i,
		height: a,
		x: o,
		y: s
	};
}
var si = 25;
function ci(e, t) {
	let n = W(e), r = kr(e), i = n.visualViewport, a = r.clientWidth, o = r.clientHeight, s = 0, c = 0;
	if (i) {
		a = i.width, o = i.height;
		let e = Hr();
		(!e || e && t === "fixed") && (s = i.offsetLeft, c = i.offsetTop);
	}
	let l = ni(r);
	if (l <= 0) {
		let e = r.ownerDocument, t = e.body, n = getComputedStyle(t), i = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, o = Math.abs(r.clientWidth - t.clientWidth - i);
		o <= si && (a -= o);
	} else l <= si && (a += l);
	return {
		width: a,
		height: o,
		x: s,
		y: c
	};
}
function li(e, t) {
	let n = ti(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = jr(e) ? Zr(e) : Un(1);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function ui(e, t, n) {
	let r;
	if (t === "viewport") r = ci(e, n);
	else if (t === "document") r = oi(kr(e));
	else if (G(t)) r = li(t, n);
	else {
		let n = $r(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return dr(r);
}
function di(e, t) {
	let n = Gr(e);
	return n === t || !G(n) || Ur(n) ? !1 : K(n).position === "fixed" || di(n, t);
}
function fi(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = qr(e, [], !1).filter((e) => G(e) && Or(e) !== "body"), i = null, a = K(e).position === "fixed", o = a ? Gr(e) : e;
	for (; G(o) && !Ur(o);) {
		let t = K(o), n = Br(o);
		!n && t.position === "fixed" && (i = null), (a ? !n && !i : !n && t.position === "static" && i && (i.position === "absolute" || i.position === "fixed") || Nr(o) && !n && di(e, o)) ? r = r.filter((e) => e !== o) : i = t, o = Gr(o);
	}
	return t.set(e, r), r;
}
function pi(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? Fr(t) ? [] : fi(t, this._c) : [].concat(n), r], o = ui(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = ui(t, a[e], i);
		s = U(n.top, s), c = Bn(n.right, c), l = Bn(n.bottom, l), u = U(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function mi(e) {
	let { width: t, height: n } = Yr(e);
	return {
		width: t,
		height: n
	};
}
function hi(e, t, n) {
	let r = jr(t), i = kr(t), a = n === "fixed", o = ti(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = Un(0);
	function l() {
		c.x = ni(i);
	}
	if (r || !r && !a) if ((Or(t) !== "body" || Nr(i)) && (s = Wr(t)), r) {
		let e = ti(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	} else i && l();
	a && !r && i && l();
	let u = i && !r && !a ? ri(i, s) : Un(0);
	return {
		x: o.left + s.scrollLeft - c.x - u.x,
		y: o.top + s.scrollTop - c.y - u.y,
		width: o.width,
		height: o.height
	};
}
function gi(e) {
	return K(e).position === "static";
}
function _i(e, t) {
	if (!jr(e) || K(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return kr(e) === n && (n = n.ownerDocument.body), n;
}
function vi(e, t) {
	let n = W(e);
	if (Fr(e)) return n;
	if (!jr(e)) {
		let t = Gr(e);
		for (; t && !Ur(t);) {
			if (G(t) && !gi(t)) return t;
			t = Gr(t);
		}
		return n;
	}
	let r = _i(e, t);
	for (; r && Pr(r) && gi(r);) r = _i(r, t);
	return r && Ur(r) && gi(r) && !Br(r) ? n : r || Vr(e) || n;
}
var yi = async function(e) {
	let t = this.getOffsetParent || vi, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: hi(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function bi(e) {
	return K(e).direction === "rtl";
}
var xi = {
	convertOffsetParentRelativeRectToViewportRelativeRect: ii,
	getDocumentElement: kr,
	getClippingRect: pi,
	getOffsetParent: vi,
	getElementRects: yi,
	getClientRects: ai,
	getDimensions: mi,
	getScale: Zr,
	isElement: G,
	isRTL: bi
};
function Si(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function Ci(e, t) {
	let n = null, r, i = kr(e);
	function a() {
		var e;
		clearTimeout(r), (e = n) == null || e.disconnect(), n = null;
	}
	function o(s, c) {
		s === void 0 && (s = !1), c === void 0 && (c = 1), a();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (s || t(), !f || !p) return;
		let m = Hn(d), h = Hn(i.clientWidth - (u + f)), g = Hn(i.clientHeight - (d + p)), _ = Hn(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: U(0, Bn(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (n !== c) {
				if (!y) return o();
				n ? o(!1, n) : r = setTimeout(() => {
					o(!1, 1e-7);
				}, 1e3);
			}
			n === 1 && !Si(l, e.getBoundingClientRect()) && o(), y = !1;
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
function wi(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = Xr(e), u = i || a ? [...l ? qr(l) : [], ...t ? qr(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n, { passive: !0 }), a && e.addEventListener("resize", n);
	});
	let d = l && s ? Ci(l, n) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? ti(e) : null;
	c && g();
	function g() {
		let t = ti(e);
		h && !Si(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var Ti = Cr, Ei = wr, Di = _r, Oi = Er, ki = br, Ai = gr, ji = Tr, Mi = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = {
		platform: xi,
		...n
	}, a = {
		...i.platform,
		_c: r
	};
	return hr(e, t, {
		...i,
		platform: a
	});
}, Ni = typeof document < "u" ? l : function() {};
function Pi(e, t) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (typeof e == "function" && e.toString() === t.toString()) return !0;
	let n, r, i;
	if (e && t && typeof e == "object") {
		if (Array.isArray(e)) {
			if (n = e.length, n !== t.length) return !1;
			for (r = n; r-- !== 0;) if (!Pi(e[r], t[r])) return !1;
			return !0;
		}
		if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length) return !1;
		for (r = n; r-- !== 0;) if (!{}.hasOwnProperty.call(t, i[r])) return !1;
		for (r = n; r-- !== 0;) {
			let n = i[r];
			if (!(n === "_owner" && e.$$typeof) && !Pi(e[n], t[n])) return !1;
		}
		return !0;
	}
	return e !== e && t !== t;
}
function Fi(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Ii(e, t) {
	let n = Fi(e);
	return Math.round(t * n) / n;
}
function Li(e) {
	let t = r.useRef(e);
	return Ni(() => {
		t.current = e;
	}), t;
}
function Ri(e) {
	e === void 0 && (e = {});
	let { placement: t = "bottom", strategy: n = "absolute", middleware: i = [], platform: a, elements: { reference: o, floating: s } = {}, transform: c = !0, whileElementsMounted: l, open: u } = e, [d, f] = r.useState({
		x: 0,
		y: 0,
		strategy: n,
		placement: t,
		middlewareData: {},
		isPositioned: !1
	}), [p, m] = r.useState(i);
	Pi(p, i) || m(i);
	let [h, g] = r.useState(null), [_, v] = r.useState(null), b = r.useCallback((e) => {
		e !== w.current && (w.current = e, g(e));
	}, []), x = r.useCallback((e) => {
		e !== T.current && (T.current = e, v(e));
	}, []), S = o || h, C = s || _, w = r.useRef(null), T = r.useRef(null), E = r.useRef(d), ee = l != null, D = Li(l), O = Li(a), k = Li(u), A = r.useCallback(() => {
		if (!w.current || !T.current) return;
		let e = {
			placement: t,
			strategy: n,
			middleware: p
		};
		O.current && (e.platform = O.current), Mi(w.current, T.current, e).then((e) => {
			let t = {
				...e,
				isPositioned: k.current !== !1
			};
			j.current && !Pi(E.current, t) && (E.current = t, y.flushSync(() => {
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
	Ni(() => {
		u === !1 && E.current.isPositioned && (E.current.isPositioned = !1, f((e) => ({
			...e,
			isPositioned: !1
		})));
	}, [u]);
	let j = r.useRef(!1);
	Ni(() => (j.current = !0, () => {
		j.current = !1;
	}), []), Ni(() => {
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
		let t = Ii(N.floating, d.x), r = Ii(N.floating, d.y);
		return c ? {
			...e,
			transform: "translate(" + t + "px, " + r + "px)",
			...Fi(N.floating) >= 1.5 && { willChange: "transform" }
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
var zi = (e) => {
	function t(e) {
		return {}.hasOwnProperty.call(e, "current");
	}
	return {
		name: "arrow",
		options: e,
		fn(n) {
			let { element: r, padding: i } = typeof e == "function" ? e(n) : e;
			return r && t(r) ? r.current == null ? {} : Ai({
				element: r.current,
				padding: i
			}).fn(n) : r ? Ai({
				element: r,
				padding: i
			}).fn(n) : {};
		}
	};
}, Bi = (e, t) => {
	let n = Ti(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Vi = (e, t) => {
	let n = Ei(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Hi = (e, t) => ({
	fn: ji(e).fn,
	options: [e, t]
}), Ui = (e, t) => {
	let n = Di(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Wi = (e, t) => {
	let n = Oi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Gi = (e, t) => {
	let n = ki(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Ki = (e, t) => {
	let n = zi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, qi = "Arrow", Ji = r.forwardRef((e, t) => {
	let { children: n, width: r = 10, height: i = 5, ...a } = e;
	return /* @__PURE__ */ _(B.svg, {
		...a,
		ref: t,
		width: r,
		height: i,
		viewBox: "0 0 30 10",
		preserveAspectRatio: "none",
		children: e.asChild ? n : /* @__PURE__ */ _("polygon", { points: "0,0 30,0 15,10" })
	});
});
Ji.displayName = qi;
var Yi = Ji, Xi = "Popper", [Zi, Qi] = me(Xi), [$i, ea] = Zi(Xi), ta = (e) => {
	let { __scopePopper: t, children: n } = e, [i, a] = r.useState(null);
	return /* @__PURE__ */ _($i, {
		scope: t,
		anchor: i,
		onAnchorChange: a,
		children: n
	});
};
ta.displayName = Xi;
var na = "PopperAnchor", ra = r.forwardRef((e, t) => {
	let { __scopePopper: n, virtualRef: i, ...a } = e, o = ea(na, n), s = r.useRef(null), c = R(t, s), l = r.useRef(null);
	return r.useEffect(() => {
		let e = l.current;
		l.current = i?.current || s.current, e !== l.current && o.onAnchorChange(l.current);
	}), i ? null : /* @__PURE__ */ _(B.div, {
		...a,
		ref: c
	});
});
ra.displayName = na;
var ia = "PopperContent", [aa, oa] = Zi(ia), sa = r.forwardRef((e, t) => {
	let { __scopePopper: n, side: i = "bottom", sideOffset: a = 0, align: o = "center", alignOffset: s = 0, arrowPadding: c = 0, avoidCollisions: l = !0, collisionBoundary: u = [], collisionPadding: d = 0, sticky: f = "partial", hideWhenDetached: p = !1, updatePositionStrategy: m = "optimized", onPlaced: h, ...g } = e, v = ea(ia, n), [y, b] = r.useState(null), x = R(t, (e) => b(e)), [S, C] = r.useState(null), w = Rn(S), T = w?.width ?? 0, E = w?.height ?? 0, ee = i + (o === "center" ? "" : "-" + o), D = typeof d == "number" ? d : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...d
	}, O = Array.isArray(u) ? u : [u], k = O.length > 0, A = {
		padding: D,
		boundary: O.filter(da),
		altBoundary: k
	}, { refs: j, floatingStyles: M, placement: N, isPositioned: P, middlewareData: F } = Ri({
		strategy: "fixed",
		placement: ee,
		whileElementsMounted: (...e) => wi(...e, { animationFrame: m === "always" }),
		elements: { reference: v.anchor },
		middleware: [
			Bi({
				mainAxis: a + E,
				alignmentAxis: s
			}),
			l && Vi({
				mainAxis: !0,
				crossAxis: !1,
				limiter: f === "partial" ? Hi() : void 0,
				...A
			}),
			l && Ui({ ...A }),
			Wi({
				...A,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--radix-popper-available-width", `${n}px`), o.setProperty("--radix-popper-available-height", `${r}px`), o.setProperty("--radix-popper-anchor-width", `${i}px`), o.setProperty("--radix-popper-anchor-height", `${a}px`);
				}
			}),
			S && Ki({
				element: S,
				padding: c
			}),
			fa({
				arrowWidth: T,
				arrowHeight: E
			}),
			p && Gi({
				strategy: "referenceHidden",
				...A
			})
		]
	}), [te, ne] = pa(N), re = Me(h);
	H(() => {
		P && re?.();
	}, [P, re]);
	let ie = F.arrow?.x, I = F.arrow?.y, L = F.arrow?.centerOffset !== 0, [ae, z] = r.useState();
	return H(() => {
		y && z(window.getComputedStyle(y).zIndex);
	}, [y]), /* @__PURE__ */ _("div", {
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
		children: /* @__PURE__ */ _(aa, {
			scope: n,
			placedSide: te,
			onArrowChange: C,
			arrowX: ie,
			arrowY: I,
			shouldHideArrow: L,
			children: /* @__PURE__ */ _(B.div, {
				"data-side": te,
				"data-align": ne,
				...g,
				ref: x,
				style: {
					...g.style,
					animation: P ? void 0 : "none"
				}
			})
		})
	});
});
sa.displayName = ia;
var ca = "PopperArrow", la = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
}, ua = r.forwardRef(function(e, t) {
	let { __scopePopper: n, ...r } = e, i = oa(ca, n), a = la[i.placedSide];
	return /* @__PURE__ */ _("span", {
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
		children: /* @__PURE__ */ _(Yi, {
			...r,
			ref: t,
			style: {
				...r.style,
				display: "block"
			}
		})
	});
});
ua.displayName = ca;
function da(e) {
	return e !== null;
}
var fa = (e) => ({
	name: "transformOrigin",
	options: e,
	fn(t) {
		let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = pa(n), u = {
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
function pa(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
var ma = ta, ha = ra, ga = sa, _a = ua, va = "Label", ya = r.forwardRef((e, t) => /* @__PURE__ */ _(B.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
ya.displayName = va;
var ba = ya;
//#endregion
//#region node_modules/@radix-ui/number/dist/index.mjs
function xa(e, [t, n]) {
	return Math.min(n, Math.max(t, e));
}
//#endregion
//#region node_modules/@radix-ui/react-select/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function Sa(e) {
	let t = /* @__PURE__ */ Ca(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Ta);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ _(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ _(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function Ca(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Da(n), a = Ea(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? L(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var wa = Symbol("radix.slottable");
function Ta(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === wa;
}
function Ea(e, t) {
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
function Da(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-select/dist/index.mjs
var Oa = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], ka = [" ", "Enter"], Aa = "Select", [ja, Ma, Na] = Se(Aa), [Pa, Fa] = me(Aa, [Na, Qi]), Ia = Qi(), [La, Ra] = Pa(Aa), [za, Ba] = Pa(Aa), Va = (e) => {
	let { __scopeSelect: t, children: n, open: i, defaultOpen: a, onOpenChange: o, value: s, defaultValue: c, onValueChange: l, dir: u, name: d, autoComplete: f, disabled: p, required: m, form: h } = e, g = Ia(t), [y, b] = r.useState(null), [x, S] = r.useState(null), [C, w] = r.useState(!1), T = je(u), [E, ee] = we({
		prop: i,
		defaultProp: a ?? !1,
		onChange: o,
		caller: Aa
	}), [D, O] = we({
		prop: s,
		defaultProp: c,
		onChange: l,
		caller: Aa
	}), k = r.useRef(null), A = y ? h || !!y.closest("form") : !0, [j, M] = r.useState(/* @__PURE__ */ new Set()), N = Array.from(j).map((e) => e.props.value).join(";");
	return /* @__PURE__ */ _(ma, {
		...g,
		children: /* @__PURE__ */ v(La, {
			required: m,
			scope: t,
			trigger: y,
			onTriggerChange: b,
			valueNode: x,
			onValueNodeChange: S,
			valueNodeHasChildren: C,
			onValueNodeHasChildrenChange: w,
			contentId: ke(),
			value: D,
			onValueChange: O,
			open: E,
			onOpenChange: ee,
			dir: T,
			triggerPointerDownPosRef: k,
			disabled: p,
			children: [/* @__PURE__ */ _(ja.Provider, {
				scope: t,
				children: /* @__PURE__ */ _(za, {
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
			}), A ? /* @__PURE__ */ v(Lo, {
				"aria-hidden": !0,
				required: m,
				tabIndex: -1,
				name: d,
				autoComplete: f,
				value: D,
				onChange: (e) => O(e.target.value),
				disabled: p,
				form: h,
				children: [D === void 0 ? /* @__PURE__ */ _("option", { value: "" }) : null, Array.from(j)]
			}, N) : null]
		})
	});
};
Va.displayName = Aa;
var Ha = "SelectTrigger", Ua = r.forwardRef((e, t) => {
	let { __scopeSelect: n, disabled: i = !1, ...a } = e, o = Ia(n), s = Ra(Ha, n), c = s.disabled || i, l = R(t, s.onTriggerChange), u = Ma(n), d = r.useRef("touch"), [f, p, m] = zo((e) => {
		let t = u().filter((e) => !e.disabled), n = Bo(t, e, t.find((e) => e.value === s.value));
		n !== void 0 && s.onValueChange(n.value);
	}), h = (e) => {
		c || (s.onOpenChange(!0), m()), e && (s.triggerPointerDownPosRef.current = {
			x: Math.round(e.pageX),
			y: Math.round(e.pageY)
		});
	};
	return /* @__PURE__ */ _(ha, {
		asChild: !0,
		...o,
		children: /* @__PURE__ */ _(B.button, {
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
			"data-placeholder": Ro(s.value) ? "" : void 0,
			...a,
			ref: l,
			onClick: V(a.onClick, (e) => {
				e.currentTarget.focus(), d.current !== "mouse" && h(e);
			}),
			onPointerDown: V(a.onPointerDown, (e) => {
				d.current = e.pointerType;
				let t = e.target;
				t.hasPointerCapture(e.pointerId) && t.releasePointerCapture(e.pointerId), e.button === 0 && e.ctrlKey === !1 && e.pointerType === "mouse" && (h(e), e.preventDefault());
			}),
			onKeyDown: V(a.onKeyDown, (e) => {
				let t = f.current !== "";
				!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && p(e.key), !(t && e.key === " ") && Oa.includes(e.key) && (h(), e.preventDefault());
			})
		})
	});
});
Ua.displayName = Ha;
var Wa = "SelectValue", Ga = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: r, style: i, children: a, placeholder: o = "", ...s } = e, c = Ra(Wa, n), { onValueNodeHasChildrenChange: l } = c, u = a !== void 0, d = R(t, c.onValueNodeChange);
	return H(() => {
		l(u);
	}, [l, u]), /* @__PURE__ */ _(B.span, {
		...s,
		ref: d,
		style: { pointerEvents: "none" },
		children: Ro(c.value) ? /* @__PURE__ */ _(g, { children: o }) : a
	});
});
Ga.displayName = Wa;
var Ka = "SelectIcon", qa = r.forwardRef((e, t) => {
	let { __scopeSelect: n, children: r, ...i } = e;
	return /* @__PURE__ */ _(B.span, {
		"aria-hidden": !0,
		...i,
		ref: t,
		children: r || "▼"
	});
});
qa.displayName = Ka;
var Ja = "SelectPortal", Ya = (e) => /* @__PURE__ */ _(ut, {
	asChild: !0,
	...e
});
Ya.displayName = Ja;
var Xa = "SelectContent", Za = r.forwardRef((e, t) => {
	let n = Ra(Xa, e.__scopeSelect), [i, a] = r.useState();
	if (H(() => {
		a(new DocumentFragment());
	}, []), !n.open) {
		let t = i;
		return t ? y.createPortal(/* @__PURE__ */ _($a, {
			scope: e.__scopeSelect,
			children: /* @__PURE__ */ _(ja.Slot, {
				scope: e.__scopeSelect,
				children: /* @__PURE__ */ _("div", { children: e.children })
			})
		}), t) : null;
	}
	return /* @__PURE__ */ _(ro, {
		...e,
		ref: t
	});
});
Za.displayName = Xa;
var Qa = 10, [$a, eo] = Pa(Xa), to = "SelectContentImpl", no = /* @__PURE__ */ Sa("SelectContent.RemoveScroll"), ro = r.forwardRef((e, t) => {
	let { __scopeSelect: n, position: i = "item-aligned", onCloseAutoFocus: a, onEscapeKeyDown: o, onPointerDownOutside: s, side: c, sideOffset: l, align: u, alignOffset: d, arrowPadding: f, collisionBoundary: p, collisionPadding: m, sticky: h, hideWhenDetached: g, avoidCollisions: v, ...y } = e, b = Ra(Xa, n), [x, S] = r.useState(null), [C, w] = r.useState(null), T = R(t, (e) => S(e)), [E, ee] = r.useState(null), [D, O] = r.useState(null), k = Ma(n), [A, j] = r.useState(!1), M = r.useRef(!1);
	r.useEffect(() => {
		if (x) return In(x);
	}, [x]), ft();
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
	let [ne, re] = zo((e) => {
		let t = k().filter((e) => !e.disabled), n = Bo(t, e, t.find((e) => e.ref.current === document.activeElement));
		n && setTimeout(() => n.ref.current.focus());
	}), ie = r.useCallback((e, t, n) => {
		let r = !M.current && !n;
		(b.value !== void 0 && b.value === t || r) && (ee(e), r && (M.current = !0));
	}, [b.value]), I = r.useCallback(() => x?.focus(), [x]), L = r.useCallback((e, t, n) => {
		let r = !M.current && !n;
		(b.value !== void 0 && b.value === t || r) && O(e);
	}, [b.value]), ae = i === "popper" ? so : ao, z = ae === so ? {
		side: c,
		sideOffset: l,
		align: u,
		alignOffset: d,
		arrowPadding: f,
		collisionBoundary: p,
		collisionPadding: m,
		sticky: h,
		hideWhenDetached: g,
		avoidCollisions: v
	} : {};
	return /* @__PURE__ */ _($a, {
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
		children: /* @__PURE__ */ _(Dn, {
			as: no,
			allowPinchZoom: !0,
			children: /* @__PURE__ */ _(Ze, {
				asChild: !0,
				trapped: b.open,
				onMountAutoFocus: (e) => {
					e.preventDefault();
				},
				onUnmountAutoFocus: V(a, (e) => {
					b.trigger?.focus({ preventScroll: !0 }), e.preventDefault();
				}),
				children: /* @__PURE__ */ _(Be, {
					asChild: !0,
					disableOutsidePointerEvents: !0,
					onEscapeKeyDown: o,
					onPointerDownOutside: s,
					onFocusOutside: (e) => e.preventDefault(),
					onDismiss: () => b.onOpenChange(!1),
					children: /* @__PURE__ */ _(ae, {
						role: "listbox",
						id: b.contentId,
						"data-state": b.open ? "open" : "closed",
						dir: b.dir,
						onContextMenu: (e) => e.preventDefault(),
						...y,
						...z,
						onPlaced: () => j(!0),
						ref: T,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none",
							...y.style
						},
						onKeyDown: V(y.onKeyDown, (e) => {
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
ro.displayName = to;
var io = "SelectItemAlignedPosition", ao = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onPlaced: i, ...a } = e, o = Ra(Xa, n), s = eo(Xa, n), [c, l] = r.useState(null), [u, d] = r.useState(null), f = R(t, (e) => d(e)), p = Ma(n), m = r.useRef(!1), h = r.useRef(!0), { viewport: g, selectedItem: v, selectedItemText: y, focusSelectedItem: b } = s, x = r.useCallback(() => {
		if (o.trigger && o.valueNode && c && u && g && v && y) {
			let e = o.trigger.getBoundingClientRect(), t = u.getBoundingClientRect(), n = o.valueNode.getBoundingClientRect(), r = y.getBoundingClientRect();
			if (o.dir !== "rtl") {
				let i = r.left - t.left, a = n.left - i, o = e.left - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - Qa, d = xa(a, [Qa, Math.max(Qa, u - l)]);
				c.style.minWidth = s + "px", c.style.left = d + "px";
			} else {
				let i = t.right - r.right, a = window.innerWidth - n.right - i, o = window.innerWidth - e.right - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - Qa, d = xa(a, [Qa, Math.max(Qa, u - l)]);
				c.style.minWidth = s + "px", c.style.right = d + "px";
			}
			let a = p(), s = window.innerHeight - Qa * 2, l = g.scrollHeight, d = window.getComputedStyle(u), f = parseInt(d.borderTopWidth, 10), h = parseInt(d.paddingTop, 10), _ = parseInt(d.borderBottomWidth, 10), b = parseInt(d.paddingBottom, 10), x = f + h + l + b + _, S = Math.min(v.offsetHeight * 5, x), C = window.getComputedStyle(g), w = parseInt(C.paddingTop, 10), T = parseInt(C.paddingBottom, 10), E = e.top + e.height / 2 - Qa, ee = s - E, D = v.offsetHeight / 2, O = v.offsetTop + D, k = f + h + O, A = x - k;
			if (k <= E) {
				let e = a.length > 0 && v === a[a.length - 1].ref.current;
				c.style.bottom = "0px";
				let t = u.clientHeight - g.offsetTop - g.offsetHeight, n = k + Math.max(ee, D + (e ? T : 0) + t + _);
				c.style.height = n + "px";
			} else {
				let e = a.length > 0 && v === a[0].ref.current;
				c.style.top = "0px";
				let t = Math.max(E, f + g.offsetTop + (e ? w : 0) + D) + A;
				c.style.height = t + "px", g.scrollTop = k - E + g.offsetTop;
			}
			c.style.margin = `${Qa}px 0`, c.style.minHeight = S + "px", c.style.maxHeight = s + "px", i?.(), requestAnimationFrame(() => m.current = !0);
		}
	}, [
		p,
		o.trigger,
		o.valueNode,
		c,
		u,
		g,
		v,
		y,
		o.dir,
		i
	]);
	H(() => x(), [x]);
	let [S, C] = r.useState();
	return H(() => {
		u && C(window.getComputedStyle(u).zIndex);
	}, [u]), /* @__PURE__ */ _(co, {
		scope: n,
		contentWrapper: c,
		shouldExpandOnScrollRef: m,
		onScrollButtonChange: r.useCallback((e) => {
			e && h.current === !0 && (x(), b?.(), h.current = !1);
		}, [x, b]),
		children: /* @__PURE__ */ _("div", {
			ref: l,
			style: {
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: S
			},
			children: /* @__PURE__ */ _(B.div, {
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
ao.displayName = io;
var oo = "SelectPopperPosition", so = r.forwardRef((e, t) => {
	let { __scopeSelect: n, align: r = "start", collisionPadding: i = Qa, ...a } = e;
	return /* @__PURE__ */ _(ga, {
		...Ia(n),
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
so.displayName = oo;
var [co, lo] = Pa(Xa, {}), uo = "SelectViewport", fo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, nonce: i, ...a } = e, o = eo(uo, n), s = lo(uo, n), c = R(t, o.onViewportChange), l = r.useRef(0);
	return /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _("style", {
		dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" },
		nonce: i
	}), /* @__PURE__ */ _(ja.Slot, {
		scope: n,
		children: /* @__PURE__ */ _(B.div, {
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
			onScroll: V(a.onScroll, (e) => {
				let t = e.currentTarget, { contentWrapper: n, shouldExpandOnScrollRef: r } = s;
				if (r?.current && n) {
					let e = Math.abs(l.current - t.scrollTop);
					if (e > 0) {
						let r = window.innerHeight - Qa * 2, i = parseFloat(n.style.minHeight), a = parseFloat(n.style.height), o = Math.max(i, a);
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
fo.displayName = uo;
var po = "SelectGroup", [mo, ho] = Pa(po), go = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = ke();
	return /* @__PURE__ */ _(mo, {
		scope: n,
		id: i,
		children: /* @__PURE__ */ _(B.div, {
			role: "group",
			"aria-labelledby": i,
			...r,
			ref: t
		})
	});
});
go.displayName = po;
var _o = "SelectLabel", vo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = ho(_o, n);
	return /* @__PURE__ */ _(B.div, {
		id: i.id,
		...r,
		ref: t
	});
});
vo.displayName = _o;
var yo = "SelectItem", [bo, xo] = Pa(yo), So = r.forwardRef((e, t) => {
	let { __scopeSelect: n, value: i, disabled: a = !1, textValue: o, ...s } = e, c = Ra(yo, n), l = eo(yo, n), u = c.value === i, [d, f] = r.useState(o ?? ""), [p, m] = r.useState(!1), h = R(t, (e) => l.itemRefCallback?.(e, i, a)), g = ke(), v = r.useRef("touch"), y = () => {
		a || (c.onValueChange(i), c.onOpenChange(!1));
	};
	if (i === "") throw Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
	return /* @__PURE__ */ _(bo, {
		scope: n,
		value: i,
		disabled: a,
		textId: g,
		isSelected: u,
		onItemTextChange: r.useCallback((e) => {
			f((t) => t || (e?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ _(ja.ItemSlot, {
			scope: n,
			value: i,
			disabled: a,
			textValue: d,
			children: /* @__PURE__ */ _(B.div, {
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
				onFocus: V(s.onFocus, () => m(!0)),
				onBlur: V(s.onBlur, () => m(!1)),
				onClick: V(s.onClick, () => {
					v.current !== "mouse" && y();
				}),
				onPointerUp: V(s.onPointerUp, () => {
					v.current === "mouse" && y();
				}),
				onPointerDown: V(s.onPointerDown, (e) => {
					v.current = e.pointerType;
				}),
				onPointerMove: V(s.onPointerMove, (e) => {
					v.current = e.pointerType, a ? l.onItemLeave?.() : v.current === "mouse" && e.currentTarget.focus({ preventScroll: !0 });
				}),
				onPointerLeave: V(s.onPointerLeave, (e) => {
					e.currentTarget === document.activeElement && l.onItemLeave?.();
				}),
				onKeyDown: V(s.onKeyDown, (e) => {
					l.searchRef?.current !== "" && e.key === " " || (ka.includes(e.key) && y(), e.key === " " && e.preventDefault());
				})
			})
		})
	});
});
So.displayName = yo;
var Co = "SelectItemText", wo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: i, style: a, ...o } = e, s = Ra(Co, n), c = eo(Co, n), l = xo(Co, n), u = Ba(Co, n), [d, f] = r.useState(null), p = R(t, (e) => f(e), l.onItemTextChange, (e) => c.itemTextRefCallback?.(e, l.value, l.disabled)), m = d?.textContent, h = r.useMemo(() => /* @__PURE__ */ _("option", {
		value: l.value,
		disabled: l.disabled,
		children: m
	}, l.value), [
		l.disabled,
		l.value,
		m
	]), { onNativeOptionAdd: b, onNativeOptionRemove: x } = u;
	return H(() => (b(h), () => x(h)), [
		b,
		x,
		h
	]), /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _(B.span, {
		id: l.textId,
		...o,
		ref: p
	}), l.isSelected && s.valueNode && !s.valueNodeHasChildren ? y.createPortal(o.children, s.valueNode) : null] });
});
wo.displayName = Co;
var To = "SelectItemIndicator", Eo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return xo(To, n).isSelected ? /* @__PURE__ */ _(B.span, {
		"aria-hidden": !0,
		...r,
		ref: t
	}) : null;
});
Eo.displayName = To;
var Do = "SelectScrollUpButton", Oo = r.forwardRef((e, t) => {
	let n = eo(Do, e.__scopeSelect), i = lo(Do, e.__scopeSelect), [a, o] = r.useState(!1), s = R(t, i.onScrollButtonChange);
	return H(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				o(t.scrollTop > 0);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ _(jo, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop -= t.offsetHeight);
		}
	}) : null;
});
Oo.displayName = Do;
var ko = "SelectScrollDownButton", Ao = r.forwardRef((e, t) => {
	let n = eo(ko, e.__scopeSelect), i = lo(ko, e.__scopeSelect), [a, o] = r.useState(!1), s = R(t, i.onScrollButtonChange);
	return H(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				let e = t.scrollHeight - t.clientHeight;
				o(Math.ceil(t.scrollTop) < e);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ _(jo, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop += t.offsetHeight);
		}
	}) : null;
});
Ao.displayName = ko;
var jo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onAutoScroll: i, ...a } = e, o = eo("SelectScrollButton", n), s = r.useRef(null), c = Ma(n), l = r.useCallback(() => {
		s.current !== null && (window.clearInterval(s.current), s.current = null);
	}, []);
	return r.useEffect(() => () => l(), [l]), H(() => {
		c().find((e) => e.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
	}, [c]), /* @__PURE__ */ _(B.div, {
		"aria-hidden": !0,
		...a,
		ref: t,
		style: {
			flexShrink: 0,
			...a.style
		},
		onPointerDown: V(a.onPointerDown, () => {
			s.current === null && (s.current = window.setInterval(i, 50));
		}),
		onPointerMove: V(a.onPointerMove, () => {
			o.onItemLeave?.(), s.current === null && (s.current = window.setInterval(i, 50));
		}),
		onPointerLeave: V(a.onPointerLeave, () => {
			l();
		})
	});
}), Mo = "SelectSeparator", No = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return /* @__PURE__ */ _(B.div, {
		"aria-hidden": !0,
		...r,
		ref: t
	});
});
No.displayName = Mo;
var Po = "SelectArrow", Fo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = Ia(n), a = Ra(Po, n), o = eo(Po, n);
	return a.open && o.position === "popper" ? /* @__PURE__ */ _(_a, {
		...i,
		...r,
		ref: t
	}) : null;
});
Fo.displayName = Po;
var Io = "SelectBubbleInput", Lo = r.forwardRef(({ __scopeSelect: e, value: t, ...n }, i) => {
	let a = r.useRef(null), o = R(i, a), s = Ln(t);
	return r.useEffect(() => {
		let e = a.current;
		if (!e) return;
		let n = window.HTMLSelectElement.prototype, r = Object.getOwnPropertyDescriptor(n, "value").set;
		if (s !== t && r) {
			let n = new Event("change", { bubbles: !0 });
			r.call(e, t), e.dispatchEvent(n);
		}
	}, [s, t]), /* @__PURE__ */ _(B.select, {
		...n,
		style: {
			...de,
			...n.style
		},
		ref: o,
		defaultValue: t
	});
});
Lo.displayName = Io;
function Ro(e) {
	return e === "" || e === void 0;
}
function zo(e) {
	let t = Me(e), n = r.useRef(""), i = r.useRef(0), a = r.useCallback((e) => {
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
function Bo(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = Vo(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.textValue.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
function Vo(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
var Ho = Va, Uo = Ua, Wo = Ga, Go = qa, Ko = Ya, qo = Za, Jo = fo, Yo = So, Xo = wo, Zo = Eo, Qo = Oo, $o = Ao;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function es(e) {
	let t = /* @__PURE__ */ ns(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(is);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ _(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ _(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
var ts = /* @__PURE__ */ es("Slot");
/* @__NO_SIDE_EFFECTS__ */
function ns(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = os(n), a = as(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? L(t, e) : e), r.cloneElement(n, a);
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
//#region node_modules/tailwind-merge/dist/bundle-mjs.mjs
var ss = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, cs = (e, t) => ({
	classGroupId: e,
	validator: t
}), ls = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), us = "-", ds = [], fs = "arbitrary..", ps = (e) => {
	let t = gs(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return hs(e);
			let n = e.split(us);
			return ms(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? ss(i, t) : t : i || ds;
			}
			return n[e] || ds;
		}
	};
}, ms = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = ms(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(us) : e.slice(t).join(us), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, hs = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? fs + r : void 0;
})(), gs = (e) => {
	let { theme: t, classGroups: n } = e;
	return _s(n, t);
}, _s = (e, t) => {
	let n = ls();
	for (let r in e) {
		let i = e[r];
		vs(i, n, r, t);
	}
	return n;
}, vs = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		ys(i, t, n, r);
	}
}, ys = (e, t, n, r) => {
	if (typeof e == "string") {
		bs(e, t, n);
		return;
	}
	if (typeof e == "function") {
		xs(e, t, n, r);
		return;
	}
	Ss(e, t, n, r);
}, bs = (e, t, n) => {
	let r = e === "" ? t : Cs(t, e);
	r.classGroupId = n;
}, xs = (e, t, n, r) => {
	if (ws(e)) {
		vs(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(cs(n, e));
}, Ss = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		vs(o, Cs(t, a), n, r);
	}
}, Cs = (e, t) => {
	let n = e, r = t.split(us), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = ls(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, ws = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Ts = (e) => {
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
}, Es = "!", Ds = ":", Os = [], ks = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), As = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === Ds) {
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
		s.endsWith(Es) ? (c = s.slice(0, -1), l = !0) : s.startsWith(Es) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return ks(t, l, c, u);
	};
	if (t) {
		let e = t + Ds, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : ks(Os, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, js = (e) => {
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
}, Ms = (e) => ({
	cache: Ts(e.cacheSize),
	parseClassName: As(e),
	sortModifiers: js(e),
	...ps(e)
}), Ns = /\s+/, Ps = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(Ns), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + Es : g, v = _ + h;
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
}, Fs = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = Is(n)) && (i && (i += " "), i += r);
	return i;
}, Is = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = Is(e[r])) && (n && (n += " "), n += t);
	return n;
}, Ls = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = Ms(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = Ps(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(Fs(...e));
}, Rs = [], q = (e) => {
	let t = (t) => t[e] || Rs;
	return t.isThemeGetter = !0, t;
}, zs = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Bs = /^\((?:(\w[\w-]*):)?(.+)\)$/i, Vs = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, Hs = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Us = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Ws = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, Gs = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Ks = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, qs = (e) => Vs.test(e), J = (e) => !!e && !Number.isNaN(Number(e)), Js = (e) => !!e && Number.isInteger(Number(e)), Ys = (e) => e.endsWith("%") && J(e.slice(0, -1)), Xs = (e) => Hs.test(e), Zs = () => !0, Qs = (e) => Us.test(e) && !Ws.test(e), $s = () => !1, ec = (e) => Gs.test(e), tc = (e) => Ks.test(e), nc = (e) => !Y(e) && !X(e), rc = (e) => vc(e, Sc, $s), Y = (e) => zs.test(e), ic = (e) => vc(e, Cc, Qs), ac = (e) => vc(e, wc, J), oc = (e) => vc(e, Ec, Zs), sc = (e) => vc(e, Tc, $s), cc = (e) => vc(e, bc, $s), lc = (e) => vc(e, xc, tc), uc = (e) => vc(e, Dc, ec), X = (e) => Bs.test(e), dc = (e) => yc(e, Cc), fc = (e) => yc(e, Tc), pc = (e) => yc(e, bc), mc = (e) => yc(e, Sc), hc = (e) => yc(e, xc), gc = (e) => yc(e, Dc, !0), _c = (e) => yc(e, Ec, !0), vc = (e, t, n) => {
	let r = zs.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, yc = (e, t, n = !1) => {
	let r = Bs.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, bc = (e) => e === "position" || e === "percentage", xc = (e) => e === "image" || e === "url", Sc = (e) => e === "length" || e === "size" || e === "bg-size", Cc = (e) => e === "length", wc = (e) => e === "number", Tc = (e) => e === "family-name", Ec = (e) => e === "number" || e === "weight", Dc = (e) => e === "shadow", Oc = /* @__PURE__ */ Ls(() => {
	let e = q("color"), t = q("font"), n = q("text"), r = q("font-weight"), i = q("tracking"), a = q("leading"), o = q("breakpoint"), s = q("container"), c = q("spacing"), l = q("radius"), u = q("shadow"), d = q("inset-shadow"), f = q("text-shadow"), p = q("drop-shadow"), m = q("blur"), h = q("perspective"), g = q("aspect"), _ = q("ease"), v = q("animate"), y = () => [
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
		X,
		Y
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
		X,
		Y,
		c
	], T = () => [
		qs,
		"full",
		"auto",
		...w()
	], E = () => [
		Js,
		"none",
		"subgrid",
		X,
		Y
	], ee = () => [
		"auto",
		{ span: [
			"full",
			Js,
			X,
			Y
		] },
		Js,
		X,
		Y
	], D = () => [
		Js,
		"auto",
		X,
		Y
	], O = () => [
		"auto",
		"min",
		"max",
		"fr",
		X,
		Y
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
		qs,
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
		qs,
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
		qs,
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
		X,
		Y
	], te = () => [
		...b(),
		pc,
		cc,
		{ position: [X, Y] }
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
		mc,
		rc,
		{ size: [X, Y] }
	], ie = () => [
		Ys,
		dc,
		ic
	], I = () => [
		"",
		"none",
		"full",
		l,
		X,
		Y
	], L = () => [
		"",
		J,
		dc,
		ic
	], R = () => [
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
		J,
		Ys,
		pc,
		cc
	], oe = () => [
		"",
		"none",
		m,
		X,
		Y
	], se = () => [
		"none",
		J,
		X,
		Y
	], ce = () => [
		"none",
		J,
		X,
		Y
	], le = () => [
		J,
		X,
		Y
	], B = () => [
		qs,
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
			blur: [Xs],
			breakpoint: [Xs],
			color: [Zs],
			container: [Xs],
			"drop-shadow": [Xs],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [nc],
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
			"inset-shadow": [Xs],
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
			radius: [Xs],
			shadow: [Xs],
			spacing: ["px", J],
			text: [Xs],
			"text-shadow": [Xs],
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
				qs,
				Y,
				X,
				g
			] }],
			container: ["container"],
			columns: [{ columns: [
				J,
				Y,
				X,
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
				Js,
				"auto",
				X,
				Y
			] }],
			basis: [{ basis: [
				qs,
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
				J,
				qs,
				"auto",
				"initial",
				"none",
				Y
			] }],
			grow: [{ grow: [
				"",
				J,
				X,
				Y
			] }],
			shrink: [{ shrink: [
				"",
				J,
				X,
				Y
			] }],
			order: [{ order: [
				Js,
				"first",
				"last",
				"none",
				X,
				Y
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
				dc,
				ic
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				_c,
				oc
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
				Ys,
				Y
			] }],
			"font-family": [{ font: [
				fc,
				sc,
				t
			] }],
			"font-features": [{ "font-features": [Y] }],
			"fvn-normal": ["normal-nums"],
			"fvn-ordinal": ["ordinal"],
			"fvn-slashed-zero": ["slashed-zero"],
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			tracking: [{ tracking: [
				i,
				X,
				Y
			] }],
			"line-clamp": [{ "line-clamp": [
				J,
				"none",
				X,
				ac
			] }],
			leading: [{ leading: [a, ...w()] }],
			"list-image": [{ "list-image": [
				"none",
				X,
				Y
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				X,
				Y
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
			"text-decoration-style": [{ decoration: [...R(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				J,
				"from-font",
				"auto",
				X,
				ic
			] }],
			"text-decoration-color": [{ decoration: F() }],
			"underline-offset": [{ "underline-offset": [
				J,
				"auto",
				X,
				Y
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
				X,
				Y
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
				X,
				Y
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
						Js,
						X,
						Y
					],
					radial: [
						"",
						X,
						Y
					],
					conic: [
						Js,
						X,
						Y
					]
				},
				hc,
				lc
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
				...R(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...R(),
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
				...R(),
				"none",
				"hidden"
			] }],
			"outline-offset": [{ "outline-offset": [
				J,
				X,
				Y
			] }],
			"outline-w": [{ outline: [
				"",
				J,
				dc,
				ic
			] }],
			"outline-color": [{ outline: F() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				gc,
				uc
			] }],
			"shadow-color": [{ shadow: F() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				gc,
				uc
			] }],
			"inset-shadow-color": [{ "inset-shadow": F() }],
			"ring-w": [{ ring: L() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: F() }],
			"ring-offset-w": [{ "ring-offset": [J, ic] }],
			"ring-offset-color": [{ "ring-offset": F() }],
			"inset-ring-w": [{ "inset-ring": L() }],
			"inset-ring-color": [{ "inset-ring": F() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				gc,
				uc
			] }],
			"text-shadow-color": [{ "text-shadow": F() }],
			opacity: [{ opacity: [
				J,
				X,
				Y
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
			"mask-image-linear-pos": [{ "mask-linear": [J] }],
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
			"mask-image-radial": [{ "mask-radial": [X, Y] }],
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
			"mask-image-conic-pos": [{ "mask-conic": [J] }],
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
			"mask-position": [{ mask: te() }],
			"mask-repeat": [{ mask: ne() }],
			"mask-size": [{ mask: re() }],
			"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
			"mask-image": [{ mask: [
				"none",
				X,
				Y
			] }],
			filter: [{ filter: [
				"",
				"none",
				X,
				Y
			] }],
			blur: [{ blur: oe() }],
			brightness: [{ brightness: [
				J,
				X,
				Y
			] }],
			contrast: [{ contrast: [
				J,
				X,
				Y
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				gc,
				uc
			] }],
			"drop-shadow-color": [{ "drop-shadow": F() }],
			grayscale: [{ grayscale: [
				"",
				J,
				X,
				Y
			] }],
			"hue-rotate": [{ "hue-rotate": [
				J,
				X,
				Y
			] }],
			invert: [{ invert: [
				"",
				J,
				X,
				Y
			] }],
			saturate: [{ saturate: [
				J,
				X,
				Y
			] }],
			sepia: [{ sepia: [
				"",
				J,
				X,
				Y
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				X,
				Y
			] }],
			"backdrop-blur": [{ "backdrop-blur": oe() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				J,
				X,
				Y
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				J,
				X,
				Y
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				J,
				X,
				Y
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				J,
				X,
				Y
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				J,
				X,
				Y
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				J,
				X,
				Y
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				J,
				X,
				Y
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				J,
				X,
				Y
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
				X,
				Y
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				J,
				"initial",
				X,
				Y
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				X,
				Y
			] }],
			delay: [{ delay: [
				J,
				X,
				Y
			] }],
			animate: [{ animate: [
				"none",
				v,
				X,
				Y
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				X,
				Y
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
				X,
				Y,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: x() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: B() }],
			"translate-x": [{ "translate-x": B() }],
			"translate-y": [{ "translate-y": B() }],
			"translate-z": [{ "translate-z": B() }],
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
				X,
				Y
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
				X,
				Y
			] }],
			fill: [{ fill: ["none", ...F()] }],
			"stroke-w": [{ stroke: [
				J,
				dc,
				ic,
				ac
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
function Z(...e) {
	return Oc(te(e));
}
//#endregion
//#region src/components/ui/button.tsx
var kc = ie("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
function Ac({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ _(r ? ts : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: Z(kc({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/components/ui/card.tsx
var jc = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function Mc({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ _("div", {
		"data-slot": "card",
		"data-variant": t,
		className: Z("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", jc[t], e),
		...n
	});
}
function Nc({ className: e, ...t }) {
	return /* @__PURE__ */ _("div", {
		"data-slot": "card-header",
		className: Z("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function Pc({ className: e, ...t }) {
	return /* @__PURE__ */ _("div", {
		"data-slot": "card-title",
		className: Z("leading-none font-semibold", e),
		...t
	});
}
function Fc({ className: e, ...t }) {
	return /* @__PURE__ */ _("div", {
		"data-slot": "card-description",
		className: Z("text-sm text-muted-foreground", e),
		...t
	});
}
function Ic({ className: e, ...t }) {
	return /* @__PURE__ */ _("div", {
		"data-slot": "card-content",
		className: Z("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region src/components/ui/input.tsx
function Lc({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ _("input", {
		type: t,
		"data-slot": "input",
		className: Z("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function Rc({ className: e, ...t }) {
	return /* @__PURE__ */ _(ba, {
		"data-slot": "label",
		className: Z("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/components/payments/GatewaySettingsLayout.tsx
function zc({ title: e, description: t, notice: n, meta: r, sections: i, actions: a, children: o }) {
	let { t: s } = f(), c = async (e) => {
		try {
			await navigator.clipboard.writeText(e), h.success(s("common.copied", { defaultValue: "Copied" }));
		} catch {
			h.error(s("common.copyFailed", { defaultValue: "Copy failed" }));
		}
	};
	return /* @__PURE__ */ _(P, {
		title: e,
		description: t,
		children: /* @__PURE__ */ v("div", {
			className: "mx-auto w-full max-w-6xl space-y-6",
			children: [
				n,
				o,
				r && r.length > 0 ? /* @__PURE__ */ _("div", {
					className: "bg-muted/30 grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3",
					children: r.map((e) => /* @__PURE__ */ v("div", {
						className: "min-w-0 space-y-1",
						children: [/* @__PURE__ */ _("p", {
							className: "text-muted-foreground text-xs font-medium",
							children: e.label
						}), /* @__PURE__ */ v("div", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ _("code", {
								className: "bg-background block min-w-0 flex-1 truncate rounded-md border px-2 py-1.5 text-xs",
								children: e.value || "—"
							}), e.copyable && e.value ? /* @__PURE__ */ _(Ac, {
								type: "button",
								size: "icon",
								variant: "outline",
								className: "size-8 shrink-0",
								onClick: () => void c(e.value),
								children: /* @__PURE__ */ _(N, { className: "size-3.5" })
							}) : null]
						})]
					}, e.label))
				}) : null,
				i.length > 1 ? /* @__PURE__ */ _("nav", {
					className: "flex flex-wrap gap-2",
					"aria-label": e,
					children: i.map((e) => /* @__PURE__ */ _(Ac, {
						asChild: !0,
						size: "sm",
						variant: "outline",
						children: /* @__PURE__ */ _("a", {
							href: `#${e.id}`,
							children: e.title
						})
					}, e.id))
				}) : null,
				/* @__PURE__ */ _("div", {
					className: "space-y-5",
					children: i.map((e) => /* @__PURE__ */ v(Mc, {
						id: e.id,
						className: "scroll-mt-24",
						children: [/* @__PURE__ */ v(Nc, { children: [/* @__PURE__ */ _(Pc, {
							className: "text-base",
							children: e.title
						}), e.description ? /* @__PURE__ */ _(Fc, { children: e.description }) : null] }), /* @__PURE__ */ _(Ic, { children: e.children })]
					}, e.id))
				}),
				a ? /* @__PURE__ */ _("div", {
					className: "bg-background/95 sticky bottom-3 z-10 flex flex-wrap gap-2 rounded-xl border p-3 shadow-sm backdrop-blur",
					children: a
				}) : null
			]
		})
	});
}
function Q({ label: e, value: t, onChange: n, type: r = "text", placeholder: i, hint: a, className: o }) {
	return /* @__PURE__ */ v("div", {
		className: Z("space-y-2", o),
		children: [
			/* @__PURE__ */ _(Rc, { children: e }),
			/* @__PURE__ */ _(Lc, {
				type: r,
				value: t,
				placeholder: i,
				onChange: (e) => n(e.target.value)
			}),
			a ? /* @__PURE__ */ _("p", {
				className: "text-muted-foreground text-xs",
				children: a
			}) : null
		]
	});
}
function Bc({ children: e }) {
	return /* @__PURE__ */ _("div", {
		className: "grid gap-4 md:grid-cols-2",
		children: e
	});
}
//#endregion
//#region src/hooks/use-text-direction.ts
function Vc() {
	let { i18n: e } = f();
	return e.dir() === "rtl" ? "rtl" : "ltr";
}
//#endregion
//#region src/components/ui/select.tsx
function Hc({ ...e }) {
	return /* @__PURE__ */ _(Ho, {
		"data-slot": "select",
		...e
	});
}
function Uc({ ...e }) {
	return /* @__PURE__ */ _(Wo, {
		"data-slot": "select-value",
		...e
	});
}
function Wc({ className: e, size: t = "default", children: n, ...r }) {
	return /* @__PURE__ */ v(Uo, {
		"data-slot": "select-trigger",
		"data-size": t,
		dir: Vc(),
		className: Z("flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap text-start shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", e),
		...r,
		children: [n, /* @__PURE__ */ _(Go, {
			asChild: !0,
			children: /* @__PURE__ */ _(j, { className: "size-4 opacity-50" })
		})]
	});
}
function Gc({ className: e, children: t, position: n = "popper", align: r = "start", ...i }) {
	return /* @__PURE__ */ _(Tn, {
		allowBodyScroll: !0,
		children: /* @__PURE__ */ _(Ko, { children: /* @__PURE__ */ v(qo, {
			"data-slot": "select-content",
			dir: Vc(),
			className: Z("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-start text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", e),
			position: n,
			align: r,
			...i,
			children: [
				/* @__PURE__ */ _(qc, {}),
				/* @__PURE__ */ _(Jo, {
					className: Z("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
					children: t
				}),
				/* @__PURE__ */ _(Jc, {})
			]
		}) })
	});
}
function Kc({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ v(Yo, {
		"data-slot": "select-item",
		className: Z("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pe-8 ps-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", e),
		...n,
		children: [/* @__PURE__ */ _("span", {
			"data-slot": "select-item-indicator",
			className: "absolute end-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ _(Zo, { children: /* @__PURE__ */ _(A, { className: "size-4" }) })
		}), /* @__PURE__ */ _(Xo, { children: t })]
	});
}
function qc({ className: e, ...t }) {
	return /* @__PURE__ */ _(Qo, {
		"data-slot": "select-scroll-up-button",
		className: Z("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ _(M, { className: "size-4" })
	});
}
function Jc({ className: e, ...t }) {
	return /* @__PURE__ */ _($o, {
		"data-slot": "select-scroll-down-button",
		className: Z("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ _(j, { className: "size-4" })
	});
}
//#endregion
//#region src/lib/marketplace-api.ts
function Yc(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function Xc(e) {
	"@babel/helpers - typeof";
	return Xc = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, Xc(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function Zc(e, t) {
	if (Xc(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (Xc(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function Qc(e) {
	var t = Zc(e, "string");
	return Xc(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function $c(e, t, n) {
	return (t = Qc(t)) in e ? Object.defineProperty(e, t, {
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
		super(e), $c(this, "code", void 0), $c(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, el = {
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
function tl(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function nl(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function rl(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(Yc(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function il(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return rl(e, n);
	if (t instanceof $ && t.code) {
		let n = el[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = el[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return tl(n) ? e("errors.api.timeout") : nl(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function al(e, t) {
	h.error(il(e, t));
}
//#endregion
//#region src/lib/safeUrl.ts
function ol(e) {
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
function sl() {
	return window.webinoDashboard;
}
var cl = 3e4;
function ll(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function ul(e) {
	let t = sl();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (ll(e) || ol(e)) return e;
	throw new $("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function dl(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function fl(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : /^(payments|torobpay|snapppay|digipay|zarinpal|bale-pay|wallet|c2c)(\/|$)/.test(t) ? "webino_dashboard_payments_rest" : null;
}
function pl(e, t) {
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
function ml(e, t) {
	let n = e.toLowerCase();
	return e.includes("Upstream Error") || e.includes("Forbidden") || t === 403 ? "admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry" : n.includes("timed out") || n.includes("timeout") || t === 504 || t === 524 ? "Request timed out — RSA-4096 generation can take over a minute on weak hosts" : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? `Invalid AJAX response (HTML, HTTP ${t || 0})` : `Invalid AJAX response (HTTP ${t || 0})`;
}
async function hl(e, t, n = {}) {
	let r = fl(e), i = sl();
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
	let { signal: l, clear: u } = dl({}, t);
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
			throw new $(ml(t, e.status), {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!n.success) throw new $(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
			code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
			status: e.status
		});
		return n.data;
	} catch (e) {
		throw e instanceof $ ? e : e instanceof DOMException && e.name === "AbortError" ? new $("Request timed out", {
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
async function gl(e, t = {}, n = cl) {
	if (fl(e) && sl().ajaxUrl) return hl(e, n, t);
	let r = ul(e), i = sl(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce), !Object.keys(a).some((e) => e.toLowerCase() === "content-type") && typeof t.body == "string" && t.body.length > 0 && (a["Content-Type"] = "application/json");
	let { signal: s, clear: c } = dl(t, n);
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
			let t = pl(n, e.status);
			throw new $(t.message, {
				code: t.code,
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i;
			throw new $(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
		}
		return i;
	} catch (e) {
		throw e instanceof $ ? e : e instanceof DOMException && e.name === "AbortError" ? new $("Request timed out", {
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
//#region ../Modules/digipay-upg-module/client/pages/DigipaySettingsPage.tsx
function _l() {
	let { t: r } = f(), i = n(), a = m().pathname.endsWith("/transactions"), o = t({
		queryKey: ["digipay", "settings"],
		queryFn: async () => gl("digipay/settings")
	}), s = t({
		queryKey: ["digipay", "logs"],
		queryFn: async () => gl("digipay/transactions"),
		enabled: a
	}), [c, l] = d(null), y = u(() => {
		let e = o.data?.settings;
		return e ? c || (l(e), e) : c;
	}, [o.data?.settings, c]), b = e({
		mutationFn: async () => gl("digipay/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(y)
		}),
		onSuccess: async (e) => {
			h.success(r("common.saved")), l({
				...e.settings,
				client_secret: "",
				password: ""
			}), await i.invalidateQueries({ queryKey: ["digipay", "settings"] }), await i.invalidateQueries({ queryKey: ["payment-gateways"] }), await i.invalidateQueries({ queryKey: ["payments-hub"] });
		},
		onError: (e) => al(r, e)
	}), x = e({
		mutationFn: async () => gl("digipay/test-connection", { method: "POST" }),
		onSuccess: () => h.success(r("digipay.testSuccess")),
		onError: (e) => al(r, e)
	}), S = /* @__PURE__ */ v("div", {
		className: "mb-2 flex flex-wrap gap-2",
		children: [/* @__PURE__ */ _(Ac, {
			asChild: !0,
			size: "sm",
			variant: a ? "outline" : "default",
			children: /* @__PURE__ */ _(p, {
				to: "/settings/shop/digipay",
				children: r("digipay.nav.settings")
			})
		}), /* @__PURE__ */ _(Ac, {
			asChild: !0,
			size: "sm",
			variant: a ? "default" : "outline",
			children: /* @__PURE__ */ _(p, {
				to: "/settings/shop/digipay/transactions",
				children: r("digipay.nav.transactions")
			})
		})]
	});
	return a ? /* @__PURE__ */ _(P, {
		title: r("digipay.transactionsTitle"),
		description: r("digipay.transactionsSubtitle"),
		children: /* @__PURE__ */ v("div", {
			className: "mx-auto w-full max-w-6xl space-y-4",
			children: [S, /* @__PURE__ */ v("div", {
				className: "overflow-x-auto rounded-xl border",
				children: [/* @__PURE__ */ v("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ _("thead", { children: /* @__PURE__ */ v("tr", {
						className: "text-muted-foreground border-b text-xs",
						children: [
							/* @__PURE__ */ _("th", {
								className: "px-3 py-2 text-start",
								children: r("digipay.col.time")
							}),
							/* @__PURE__ */ _("th", {
								className: "px-3 py-2 text-start",
								children: r("digipay.col.order")
							}),
							/* @__PURE__ */ _("th", {
								className: "px-3 py-2 text-start",
								children: r("digipay.col.endpoint")
							}),
							/* @__PURE__ */ _("th", {
								className: "px-3 py-2 text-start",
								children: r("digipay.col.status")
							}),
							/* @__PURE__ */ _("th", {
								className: "px-3 py-2 text-start",
								children: r("digipay.col.message")
							})
						]
					}) }), /* @__PURE__ */ _("tbody", { children: (s.data?.items ?? []).map((e, t) => /* @__PURE__ */ v("tr", {
						className: "border-t",
						children: [
							/* @__PURE__ */ _("td", {
								className: "px-3 py-2",
								children: e.time
							}),
							/* @__PURE__ */ v("td", {
								className: "px-3 py-2",
								children: ["#", e.order_id]
							}),
							/* @__PURE__ */ _("td", {
								className: "px-3 py-2",
								children: e.endpoint
							}),
							/* @__PURE__ */ _("td", {
								className: "px-3 py-2",
								children: e.success ? r("digipay.status.ok") : r("digipay.status.failed")
							}),
							/* @__PURE__ */ _("td", {
								className: "px-3 py-2",
								children: e.message
							})
						]
					}, `${e.time}-${t}`)) })]
				}), !s.isLoading && !(s.data?.items?.length ?? 0) ? /* @__PURE__ */ _("p", {
					className: "text-muted-foreground p-4 text-sm",
					children: r("common.empty")
				}) : null]
			})]
		})
	}) : y ? /* @__PURE__ */ _(zc, {
		title: r("digipay.settingsTitle"),
		description: r("digipay.settingsSubtitle"),
		notice: y.official_plugin_active ? /* @__PURE__ */ _("p", {
			className: "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100",
			children: r("digipay.officialNotice")
		}) : null,
		meta: [{
			label: r("gateway.meta.callback"),
			value: String(y.callback_url ?? ""),
			copyable: !0
		}, {
			label: r("digipay.environment"),
			value: y.environment === "live" ? r("digipay.env.live") : r("digipay.env.staging")
		}],
		sections: [
			{
				id: "connection",
				title: r("gateway.section.connection"),
				description: r("digipay.section.connectionHint"),
				children: /* @__PURE__ */ v(Bc, { children: [
					/* @__PURE__ */ v("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ _(Rc, { children: r("digipay.environment") }), /* @__PURE__ */ v(Hc, {
							value: y.environment ?? "staging",
							onValueChange: (e) => l((t) => ({
								...t,
								environment: e
							})),
							children: [/* @__PURE__ */ _(Wc, { children: /* @__PURE__ */ _(Uc, {}) }), /* @__PURE__ */ v(Gc, { children: [/* @__PURE__ */ _(Kc, {
								value: "staging",
								children: r("digipay.env.staging")
							}), /* @__PURE__ */ _(Kc, {
								value: "live",
								children: r("digipay.env.live")
							})] })]
						})]
					}),
					/* @__PURE__ */ _(Q, {
						label: r("digipay.field.version"),
						value: y.digipay_version ?? "",
						onChange: (e) => l((t) => ({
							...t,
							digipay_version: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("gateway.field.clientId"),
						value: y.client_id ?? "",
						onChange: (e) => l((t) => ({
							...t,
							client_id: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("gateway.field.clientSecret"),
						type: "password",
						value: y.client_secret ?? "",
						placeholder: y.has_client_secret ? "••••••••" : "",
						onChange: (e) => l((t) => ({
							...t,
							client_secret: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("gateway.field.username"),
						value: y.username ?? "",
						onChange: (e) => l((t) => ({
							...t,
							username: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("gateway.field.password"),
						type: "password",
						value: y.password ?? "",
						onChange: (e) => l((t) => ({
							...t,
							password: e
						}))
					})
				] })
			},
			{
				id: "merchant",
				title: r("digipay.section.merchant"),
				description: r("digipay.section.merchantHint"),
				children: /* @__PURE__ */ v(Bc, { children: [
					/* @__PURE__ */ _(Q, {
						label: r("digipay.field.sellerId"),
						value: y.seller_id ?? "",
						onChange: (e) => l((t) => ({
							...t,
							seller_id: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("digipay.field.supplierId"),
						value: y.supplier_id ?? "",
						onChange: (e) => l((t) => ({
							...t,
							supplier_id: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("digipay.field.categoryId"),
						value: y.category_id ?? "",
						onChange: (e) => l((t) => ({
							...t,
							category_id: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("digipay.field.productType"),
						type: "number",
						value: String(y.product_type ?? 1),
						onChange: (e) => l((t) => ({
							...t,
							product_type: parseInt(e || "1", 10)
						}))
					})
				] })
			},
			{
				id: "checkout",
				title: r("gateway.section.checkout"),
				description: r("digipay.section.checkoutHint"),
				children: /* @__PURE__ */ v(Bc, { children: [
					/* @__PURE__ */ _(Q, {
						label: r("digipay.field.titleIpg"),
						value: y.title_ipg ?? "",
						onChange: (e) => l((t) => ({
							...t,
							title_ipg: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("digipay.field.titleWallet"),
						value: y.title_wallet ?? "",
						onChange: (e) => l((t) => ({
							...t,
							title_wallet: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("digipay.field.titleCpg"),
						value: y.title_cpg ?? "",
						onChange: (e) => l((t) => ({
							...t,
							title_cpg: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("digipay.field.titleBpg"),
						value: y.title_bpg ?? "",
						onChange: (e) => l((t) => ({
							...t,
							title_bpg: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("digipay.field.descIpg"),
						value: y.description_ipg ?? "",
						onChange: (e) => l((t) => ({
							...t,
							description_ipg: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("digipay.field.descWallet"),
						value: y.description_wallet ?? "",
						onChange: (e) => l((t) => ({
							...t,
							description_wallet: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("digipay.field.descCpg"),
						value: y.description_cpg ?? "",
						onChange: (e) => l((t) => ({
							...t,
							description_cpg: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("digipay.field.descBpg"),
						value: y.description_bpg ?? "",
						onChange: (e) => l((t) => ({
							...t,
							description_bpg: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("gateway.field.orderButtonText"),
						value: y.order_button_text ?? "",
						onChange: (e) => l((t) => ({
							...t,
							order_button_text: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("gateway.field.successMessage"),
						value: y.success_message ?? "",
						onChange: (e) => l((t) => ({
							...t,
							success_message: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("gateway.field.failedMessage"),
						value: y.failed_message ?? "",
						onChange: (e) => l((t) => ({
							...t,
							failed_message: e
						}))
					}),
					/* @__PURE__ */ _(Q, {
						label: r("gateway.field.cancelledMessage"),
						value: y.cancelled_message ?? "",
						onChange: (e) => l((t) => ({
							...t,
							cancelled_message: e
						}))
					}),
					/* @__PURE__ */ v("div", {
						className: "space-y-2 md:col-span-2",
						children: [/* @__PURE__ */ _(Rc, { children: r("gateway.field.iconUrl") }), /* @__PURE__ */ v("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ _("img", {
								src: y.icon_url?.trim() || y.resolved_icon_url || y.default_icon_url || "",
								alt: "",
								className: "h-10 w-10 shrink-0 rounded border object-contain"
							}), /* @__PURE__ */ _("div", {
								className: "min-w-0 flex-1 space-y-1",
								children: /* @__PURE__ */ _(Q, {
									label: "",
									value: y.icon_url ?? "",
									onChange: (e) => l((t) => ({
										...t,
										icon_url: e
									})),
									hint: r("gateway.field.iconUrlHint")
								})
							})]
						})]
					})
				] })
			}
		],
		actions: /* @__PURE__ */ v(g, { children: [/* @__PURE__ */ _(Ac, {
			onClick: () => void b.mutate(),
			disabled: b.isPending,
			children: r("common.save")
		}), /* @__PURE__ */ _(Ac, {
			variant: "outline",
			onClick: () => void x.mutate(),
			disabled: x.isPending,
			children: r("digipay.testConnection")
		})] }),
		children: S
	}) : /* @__PURE__ */ v(P, {
		title: r("digipay.settingsTitle"),
		children: [S, r("common.loading")]
	});
}
//#endregion
//#region ../Modules/digipay-upg-module/client/module-entry.tsx
var vl = {
	"settings/shop/digipay": _l,
	"settings/shop/digipay/transactions": _l
}, yl = { routes: vl };
//#endregion
export { yl as default, vl as routes };
