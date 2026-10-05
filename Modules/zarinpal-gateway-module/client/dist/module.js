import { useMutation as e, useQuery as t, useQueryClient as n } from "@tanstack/react-query";
import * as r from "react";
import i, { createContext as a, createElement as o, forwardRef as s, useContext as c, useLayoutEffect as l, useMemo as u, useState as d } from "react";
import { useTranslation as f } from "react-i18next";
import { useLocation as p } from "react-router-dom";
import { toast as m } from "sonner";
import { Fragment as h, jsx as g, jsxs as _ } from "react/jsx-runtime";
import * as v from "react-dom";
import y from "react-dom";
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var b = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), x = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), S = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), C = (e) => {
	let t = S(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, w = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, T = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, E = a({}), D = () => c(E), O = s(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: a, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = D() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return o("svg", {
		ref: l,
		...w,
		width: t ?? u ?? w.width,
		height: t ?? u ?? w.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: b("lucide", m, i),
		...!a && !T(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => o(e, t)), ...Array.isArray(a) ? a : [a]]);
}), k = (e, t) => {
	let n = s(({ className: n, ...r }, i) => o(O, {
		ref: i,
		iconNode: t,
		className: b(`lucide-${x(C(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = C(e), n;
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
function I() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = F(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/class-variance-authority/dist/index.mjs
var L = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, ee = I, te = (e, t) => (n) => {
	if (t?.variants == null) return ee(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = L(t) || L(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return ee(e, a, t?.compoundVariants?.reduce((e, t) => {
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
function ne(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function R(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = ne(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : ne(e[t], null);
			}
		};
	};
}
function z(...e) {
	return r.useCallback(R(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function re(e) {
	let t = /* @__PURE__ */ ie(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(ae);
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
function ie(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = se(n), a = oe(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? R(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var B = Symbol("radix.slottable");
function ae(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === B;
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
var V = [
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
function ce(e, t) {
	e && v.flushSync(() => e.dispatchEvent(t));
}
//#endregion
//#region node_modules/@radix-ui/react-visually-hidden/dist/index.mjs
var le = Object.freeze({
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
}), ue = "VisuallyHidden", de = r.forwardRef((e, t) => /* @__PURE__ */ g(V.span, {
	...e,
	ref: t,
	style: {
		...le,
		...e.style
	}
}));
de.displayName = ue;
//#endregion
//#region node_modules/@radix-ui/react-context/dist/index.mjs
function fe(e, t = []) {
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
	return a.scopeName = e, [i, pe(a, ...t)];
}
function pe(...e) {
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
function me(e) {
	let t = /* @__PURE__ */ he(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(_e);
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
function he(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = ye(n), a = ve(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? R(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var ge = Symbol("radix.slottable");
function _e(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === ge;
}
function ve(e, t) {
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
function ye(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function be(e) {
	let t = e + "CollectionProvider", [n, r] = fe(t), [a, o] = n(t, {
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
	let c = e + "CollectionSlot", l = /* @__PURE__ */ me(c), u = i.forwardRef((e, t) => {
		let { scope: n, children: r } = e;
		return /* @__PURE__ */ g(l, {
			ref: z(t, o(c, n).collectionRef),
			children: r
		});
	});
	u.displayName = c;
	let d = e + "CollectionItemSlot", f = "data-radix-collection-item", p = /* @__PURE__ */ me(d), m = i.forwardRef((e, t) => {
		let { scope: n, children: r, ...a } = e, s = i.useRef(null), c = z(t, s), l = o(d, n);
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
function H(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var U = globalThis?.document ? r.useLayoutEffect : () => {}, xe = r.useInsertionEffect || U;
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
//#region node_modules/@radix-ui/react-id/dist/index.mjs
var Te = r.useId || (() => void 0), Ee = 0;
function De(e) {
	let [t, n] = r.useState(Te());
	return U(() => {
		e || n((e) => e ?? String(Ee++));
	}, [e]), e || (t ? `radix-${t}` : "");
}
//#endregion
//#region node_modules/@radix-ui/react-direction/dist/index.mjs
var Oe = r.createContext(void 0);
function ke(e) {
	let t = r.useContext(Oe);
	return e || t || "ltr";
}
//#endregion
//#region node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
function Ae(e) {
	let t = r.useRef(e);
	return r.useEffect(() => {
		t.current = e;
	}), r.useMemo(() => (...e) => t.current?.(...e), []);
}
//#endregion
//#region node_modules/@radix-ui/react-use-escape-keydown/dist/index.mjs
function je(e, t = globalThis?.document) {
	let n = Ae(e);
	r.useEffect(() => {
		let e = (e) => {
			e.key === "Escape" && n(e);
		};
		return t.addEventListener("keydown", e, { capture: !0 }), () => t.removeEventListener("keydown", e, { capture: !0 });
	}, [n, t]);
}
//#endregion
//#region node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var Me = "DismissableLayer", Ne = "dismissableLayer.update", Pe = "dismissableLayer.pointerDownOutside", Fe = "dismissableLayer.focusOutside", Ie, Le = r.createContext({
	layers: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), Re = r.forwardRef((e, t) => {
	let { disableOutsidePointerEvents: n = !1, onEscapeKeyDown: i, onPointerDownOutside: a, onFocusOutside: o, onInteractOutside: s, onDismiss: c, ...l } = e, u = r.useContext(Le), [d, f] = r.useState(null), p = d?.ownerDocument ?? globalThis?.document, [, m] = r.useState({}), h = z(t, (e) => f(e)), _ = Array.from(u.layers), [v] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1), y = _.indexOf(v), b = d ? _.indexOf(d) : -1, x = u.layersWithOutsidePointerEventsDisabled.size > 0, S = b >= y, C = Ve((e) => {
		let t = e.target, n = [...u.branches].some((e) => e.contains(t));
		!S || n || (a?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p), w = He((e) => {
		let t = e.target;
		[...u.branches].some((e) => e.contains(t)) || (o?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p);
	return je((e) => {
		b === u.layers.size - 1 && (i?.(e), !e.defaultPrevented && c && (e.preventDefault(), c()));
	}, p), r.useEffect(() => {
		if (d) return n && (u.layersWithOutsidePointerEventsDisabled.size === 0 && (Ie = p.body.style.pointerEvents, p.body.style.pointerEvents = "none"), u.layersWithOutsidePointerEventsDisabled.add(d)), u.layers.add(d), Ue(), () => {
			n && u.layersWithOutsidePointerEventsDisabled.size === 1 && (p.body.style.pointerEvents = Ie);
		};
	}, [
		d,
		p,
		n,
		u
	]), r.useEffect(() => () => {
		d && (u.layers.delete(d), u.layersWithOutsidePointerEventsDisabled.delete(d), Ue());
	}, [d, u]), r.useEffect(() => {
		let e = () => m({});
		return document.addEventListener(Ne, e), () => document.removeEventListener(Ne, e);
	}, []), /* @__PURE__ */ g(V.div, {
		...l,
		ref: h,
		style: {
			pointerEvents: x ? S ? "auto" : "none" : void 0,
			...e.style
		},
		onFocusCapture: H(e.onFocusCapture, w.onFocusCapture),
		onBlurCapture: H(e.onBlurCapture, w.onBlurCapture),
		onPointerDownCapture: H(e.onPointerDownCapture, C.onPointerDownCapture)
	});
});
Re.displayName = Me;
var ze = "DismissableLayerBranch", Be = r.forwardRef((e, t) => {
	let n = r.useContext(Le), i = r.useRef(null), a = z(t, i);
	return r.useEffect(() => {
		let e = i.current;
		if (e) return n.branches.add(e), () => {
			n.branches.delete(e);
		};
	}, [n.branches]), /* @__PURE__ */ g(V.div, {
		...e,
		ref: a
	});
});
Be.displayName = ze;
function Ve(e, t = globalThis?.document) {
	let n = Ae(e), i = r.useRef(!1), a = r.useRef(() => {});
	return r.useEffect(() => {
		let e = (e) => {
			if (e.target && !i.current) {
				let r = function() {
					We(Pe, n, i, { discrete: !0 });
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
function He(e, t = globalThis?.document) {
	let n = Ae(e), i = r.useRef(!1);
	return r.useEffect(() => {
		let e = (e) => {
			e.target && !i.current && We(Fe, n, { originalEvent: e }, { discrete: !1 });
		};
		return t.addEventListener("focusin", e), () => t.removeEventListener("focusin", e);
	}, [t, n]), {
		onFocusCapture: () => i.current = !0,
		onBlurCapture: () => i.current = !1
	};
}
function Ue() {
	let e = new CustomEvent(Ne);
	document.dispatchEvent(e);
}
function We(e, t, n, { discrete: r }) {
	let i = n.originalEvent.target, a = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && i.addEventListener(e, t, { once: !0 }), r ? ce(i, a) : i.dispatchEvent(a);
}
//#endregion
//#region node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var Ge = "focusScope.autoFocusOnMount", Ke = "focusScope.autoFocusOnUnmount", qe = {
	bubbles: !1,
	cancelable: !0
}, Je = "FocusScope", Ye = r.forwardRef((e, t) => {
	let { loop: n = !1, trapped: i = !1, onMountAutoFocus: a, onUnmountAutoFocus: o, ...s } = e, [c, l] = r.useState(null), u = Ae(a), d = Ae(o), f = r.useRef(null), p = z(t, (e) => l(e)), m = r.useRef({
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
				c.contains(t) ? f.current = t : nt(f.current, { select: !0 });
			}, t = function(e) {
				if (m.paused || !c) return;
				let t = e.relatedTarget;
				t !== null && (c.contains(t) || nt(f.current, { select: !0 }));
			}, n = function(e) {
				if (document.activeElement === document.body) for (let t of e) t.removedNodes.length > 0 && nt(c);
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
			rt.add(m);
			let e = document.activeElement;
			if (!c.contains(e)) {
				let t = new CustomEvent(Ge, qe);
				c.addEventListener(Ge, u), c.dispatchEvent(t), t.defaultPrevented || (Xe(ot(Qe(c)), { select: !0 }), document.activeElement === e && nt(c));
			}
			return () => {
				c.removeEventListener(Ge, u), setTimeout(() => {
					let t = new CustomEvent(Ke, qe);
					c.addEventListener(Ke, d), c.dispatchEvent(t), t.defaultPrevented || nt(e ?? document.body, { select: !0 }), c.removeEventListener(Ke, d), rt.remove(m);
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
			let t = e.currentTarget, [i, a] = Ze(t);
			i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n && nt(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n && nt(a, { select: !0 })) : r === t && e.preventDefault();
		}
	}, [
		n,
		i,
		m.paused
	]);
	return /* @__PURE__ */ g(V.div, {
		tabIndex: -1,
		...s,
		ref: p,
		onKeyDown: h
	});
});
Ye.displayName = Je;
function Xe(e, { select: t = !1 } = {}) {
	let n = document.activeElement;
	for (let r of e) if (nt(r, { select: t }), document.activeElement !== n) return;
}
function Ze(e) {
	let t = Qe(e);
	return [$e(t, e), $e(t.reverse(), e)];
}
function Qe(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t;
}
function $e(e, t) {
	for (let n of e) if (!et(n, { upTo: t })) return n;
}
function et(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function tt(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function nt(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = document.activeElement;
		e.focus({ preventScroll: !0 }), e !== n && tt(e) && t && e.select();
	}
}
var rt = it();
function it() {
	let e = [];
	return {
		add(t) {
			let n = e[0];
			t !== n && n?.pause(), e = at(e, t), e.unshift(t);
		},
		remove(t) {
			e = at(e, t), e[0]?.resume();
		}
	};
}
function at(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
function ot(e) {
	return e.filter((e) => e.tagName !== "A");
}
//#endregion
//#region node_modules/@radix-ui/react-portal/dist/index.mjs
var st = "Portal", ct = r.forwardRef((e, t) => {
	let { container: n, ...i } = e, [a, o] = r.useState(!1);
	U(() => o(!0), []);
	let s = n || a && globalThis?.document?.body;
	return s ? y.createPortal(/* @__PURE__ */ g(V.div, {
		...i,
		ref: t
	}), s) : null;
});
ct.displayName = st;
//#endregion
//#region node_modules/@radix-ui/react-focus-guards/dist/index.mjs
var lt = 0;
function ut() {
	r.useEffect(() => {
		let e = document.querySelectorAll("[data-radix-focus-guard]");
		return document.body.insertAdjacentElement("afterbegin", e[0] ?? dt()), document.body.insertAdjacentElement("beforeend", e[1] ?? dt()), lt++, () => {
			lt === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((e) => e.remove()), lt--;
		};
	}, []);
}
function dt() {
	let e = document.createElement("span");
	return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
//#endregion
//#region node_modules/tslib/tslib.es6.mjs
var ft = function() {
	return ft = Object.assign || function(e) {
		for (var t, n = 1, r = arguments.length; n < r; n++) for (var i in t = arguments[n], t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
		return e;
	}, ft.apply(this, arguments);
};
function pt(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
function mt(e, t, n) {
	if (n || arguments.length === 2) for (var r = 0, i = t.length, a; r < i; r++) (a || !(r in t)) && (a || (a = Array.prototype.slice.call(t, 0, r)), a[r] = t[r]);
	return e.concat(a || Array.prototype.slice.call(t));
}
//#endregion
//#region node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var ht = "right-scroll-bar-position", gt = "width-before-scroll-bar", _t = "with-scroll-bars-hidden", vt = "--removed-body-scroll-bar-size";
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/assignRef.js
function yt(e, t) {
	return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/useRef.js
function bt(e, t) {
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
var xt = typeof window < "u" ? r.useLayoutEffect : r.useEffect, St = /* @__PURE__ */ new WeakMap();
function Ct(e, t) {
	var n = bt(t || null, function(t) {
		return e.forEach(function(e) {
			return yt(e, t);
		});
	});
	return xt(function() {
		var t = St.get(n);
		if (t) {
			var r = new Set(t), i = new Set(e), a = n.current;
			r.forEach(function(e) {
				i.has(e) || yt(e, null);
			}), i.forEach(function(e) {
				r.has(e) || yt(e, a);
			});
		}
		St.set(n, e);
	}, [e]), n;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/medium.js
function wt(e) {
	return e;
}
function Tt(e, t) {
	t === void 0 && (t = wt);
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
function Et(e) {
	e === void 0 && (e = {});
	var t = Tt(null);
	return t.options = ft({
		async: !0,
		ssr: !1
	}, e), t;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/exports.js
var Dt = function(e) {
	var t = e.sideCar, n = pt(e, ["sideCar"]);
	if (!t) throw Error("Sidecar: please provide `sideCar` property to import the right car");
	var i = t.read();
	if (!i) throw Error("Sidecar medium not found");
	return r.createElement(i, ft({}, n));
};
Dt.isSideCarExport = !0;
function Ot(e, t) {
	return e.useMedium(t), Dt;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/medium.js
var kt = Et(), At = function() {}, jt = r.forwardRef(function(e, t) {
	var n = r.useRef(null), i = r.useState({
		onScrollCapture: At,
		onWheelCapture: At,
		onTouchMoveCapture: At
	}), a = i[0], o = i[1], s = e.forwardProps, c = e.children, l = e.className, u = e.removeScrollBar, d = e.enabled, f = e.shards, p = e.sideCar, m = e.noRelative, h = e.noIsolation, g = e.inert, _ = e.allowPinchZoom, v = e.as, y = v === void 0 ? "div" : v, b = e.gapMode, x = pt(e, [
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
	]), S = p, C = Ct([n, t]), w = ft(ft({}, x), a);
	return r.createElement(r.Fragment, null, d && r.createElement(S, {
		sideCar: kt,
		removeScrollBar: u,
		shards: f,
		noRelative: m,
		noIsolation: h,
		inert: g,
		setCallbacks: o,
		allowPinchZoom: !!_,
		lockRef: n,
		gapMode: b
	}), s ? r.cloneElement(r.Children.only(c), ft(ft({}, w), { ref: C })) : r.createElement(y, ft({}, w, {
		className: l,
		ref: C
	}), c));
});
jt.defaultProps = {
	enabled: !0,
	removeScrollBar: !0,
	inert: !1
}, jt.classNames = {
	fullWidth: gt,
	zeroRight: ht
};
//#endregion
//#region node_modules/get-nonce/dist/es2015/index.js
var Mt, Nt = function() {
	if (Mt) return Mt;
	if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
//#endregion
//#region node_modules/react-style-singleton/dist/es2015/singleton.js
function Pt() {
	if (!document) return null;
	var e = document.createElement("style");
	e.type = "text/css";
	var t = Nt();
	return t && e.setAttribute("nonce", t), e;
}
function Ft(e, t) {
	e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function It(e) {
	(document.head || document.getElementsByTagName("head")[0]).appendChild(e);
}
var Lt = function() {
	var e = 0, t = null;
	return {
		add: function(n) {
			e == 0 && (t = Pt()) && (Ft(t, n), It(t)), e++;
		},
		remove: function() {
			e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
		}
	};
}, Rt = function() {
	var e = Lt();
	return function(t, n) {
		r.useEffect(function() {
			return e.add(t), function() {
				e.remove();
			};
		}, [t && n]);
	};
}, zt = function() {
	var e = Rt();
	return function(t) {
		var n = t.styles, r = t.dynamic;
		return e(n, r), null;
	};
}, Bt = {
	left: 0,
	top: 0,
	right: 0,
	gap: 0
}, Vt = function(e) {
	return parseInt(e || "", 10) || 0;
}, Ht = function(e) {
	var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
	return [
		Vt(n),
		Vt(r),
		Vt(i)
	];
}, Ut = function(e) {
	if (e === void 0 && (e = "margin"), typeof window > "u") return Bt;
	var t = Ht(e), n = document.documentElement.clientWidth, r = window.innerWidth;
	return {
		left: t[0],
		top: t[1],
		right: t[2],
		gap: Math.max(0, r - n + t[2] - t[0])
	};
}, Wt = zt(), Gt = "data-scroll-locked", Kt = function(e, t, n, r) {
	var i = e.left, a = e.top, o = e.right, s = e.gap;
	return n === void 0 && (n = "margin"), `
  .${_t} {
   overflow: hidden ${r};
   padding-right: ${s}px ${r};
  }
  body[${Gt}] {
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
  
  .${ht} {
    right: ${s}px ${r};
  }
  
  .${gt} {
    margin-right: ${s}px ${r};
  }
  
  .${ht} .${ht} {
    right: 0 ${r};
  }
  
  .${gt} .${gt} {
    margin-right: 0 ${r};
  }
  
  body[${Gt}] {
    ${vt}: ${s}px;
  }
`;
}, qt = function() {
	var e = parseInt(document.body.getAttribute("data-scroll-locked") || "0", 10);
	return isFinite(e) ? e : 0;
}, Jt = function() {
	r.useEffect(function() {
		return document.body.setAttribute(Gt, (qt() + 1).toString()), function() {
			var e = qt() - 1;
			e <= 0 ? document.body.removeAttribute(Gt) : document.body.setAttribute(Gt, e.toString());
		};
	}, []);
}, Yt = function(e) {
	var t = e.noRelative, n = e.noImportant, i = e.gapMode, a = i === void 0 ? "margin" : i;
	Jt();
	var o = r.useMemo(function() {
		return Ut(a);
	}, [a]);
	return r.createElement(Wt, { styles: Kt(o, !t, a, n ? "" : "!important") });
}, Xt = !1;
if (typeof window < "u") try {
	var Zt = Object.defineProperty({}, "passive", { get: function() {
		return Xt = !0, !0;
	} });
	window.addEventListener("test", Zt, Zt), window.removeEventListener("test", Zt, Zt);
} catch {
	Xt = !1;
}
var Qt = Xt ? { passive: !1 } : !1, $t = function(e) {
	return e.tagName === "TEXTAREA";
}, en = function(e, t) {
	if (!(e instanceof Element)) return !1;
	var n = window.getComputedStyle(e);
	return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !$t(e) && n[t] === "visible");
}, tn = function(e) {
	return en(e, "overflowY");
}, nn = function(e) {
	return en(e, "overflowX");
}, rn = function(e, t) {
	var n = t.ownerDocument, r = t;
	do {
		if (typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host), sn(e, r)) {
			var i = cn(e, r);
			if (i[1] > i[2]) return !0;
		}
		r = r.parentNode;
	} while (r && r !== n.body);
	return !1;
}, an = function(e) {
	return [
		e.scrollTop,
		e.scrollHeight,
		e.clientHeight
	];
}, on = function(e) {
	return [
		e.scrollLeft,
		e.scrollWidth,
		e.clientWidth
	];
}, sn = function(e, t) {
	return e === "v" ? tn(t) : nn(t);
}, cn = function(e, t) {
	return e === "v" ? an(t) : on(t);
}, ln = function(e, t) {
	return e === "h" && t === "rtl" ? -1 : 1;
}, un = function(e, t, n, r, i) {
	var a = ln(e, window.getComputedStyle(t).direction), o = a * r, s = n.target, c = t.contains(s), l = !1, u = o > 0, d = 0, f = 0;
	do {
		if (!s) break;
		var p = cn(e, s), m = p[0], h = p[1] - p[2] - a * m;
		(m || h) && sn(e, s) && (d += h, f += m);
		var g = s.parentNode;
		s = g && g.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? g.host : g;
	} while (!c && s !== document.body || c && (t.contains(s) || t === s));
	return (u && (i && Math.abs(d) < 1 || !i && o > d) || !u && (i && Math.abs(f) < 1 || !i && -o > f)) && (l = !0), l;
}, dn = function(e) {
	return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, fn = function(e) {
	return [e.deltaX, e.deltaY];
}, pn = function(e) {
	return e && "current" in e ? e.current : e;
}, mn = function(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}, hn = function(e) {
	return `
  .block-interactivity-${e} {pointer-events: none;}
  .allow-interactivity-${e} {pointer-events: all;}
`;
}, gn = 0, _n = [];
function vn(e) {
	var t = r.useRef([]), n = r.useRef([0, 0]), i = r.useRef(), a = r.useState(gn++)[0], o = r.useState(zt)[0], s = r.useRef(e);
	r.useEffect(function() {
		s.current = e;
	}, [e]), r.useEffect(function() {
		if (e.inert) {
			document.body.classList.add(`block-interactivity-${a}`);
			var t = mt([e.lockRef.current], (e.shards || []).map(pn), !0).filter(Boolean);
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
		var r = dn(e), a = n.current, o = "deltaX" in e ? e.deltaX : a[0] - r[0], c = "deltaY" in e ? e.deltaY : a[1] - r[1], l, u = e.target, d = Math.abs(o) > Math.abs(c) ? "h" : "v";
		if ("touches" in e && d === "h" && u.type === "range") return !1;
		var f = window.getSelection(), p = f && f.anchorNode;
		if (p && (p === u || p.contains(u))) return !1;
		var m = rn(d, u);
		if (!m) return !0;
		if (m ? l = d : (l = d === "v" ? "h" : "v", m = rn(d, u)), !m) return !1;
		if (!i.current && "changedTouches" in e && (o || c) && (i.current = l), !l) return !0;
		var h = i.current || l;
		return un(h, t, e, h === "h" ? o : c, !0);
	}, []), l = r.useCallback(function(e) {
		var n = e;
		if (!(!_n.length || _n[_n.length - 1] !== o)) {
			var r = "deltaY" in n ? fn(n) : dn(n), i = t.current.filter(function(e) {
				return e.name === n.type && (e.target === n.target || n.target === e.shadowParent) && mn(e.delta, r);
			})[0];
			if (i && i.should) {
				n.cancelable && n.preventDefault();
				return;
			}
			if (!i) {
				var a = (s.current.shards || []).map(pn).filter(Boolean).filter(function(e) {
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
			shadowParent: yn(r)
		};
		t.current.push(a), setTimeout(function() {
			t.current = t.current.filter(function(e) {
				return e !== a;
			});
		}, 1);
	}, []), d = r.useCallback(function(e) {
		n.current = dn(e), i.current = void 0;
	}, []), f = r.useCallback(function(t) {
		u(t.type, fn(t), t.target, c(t, e.lockRef.current));
	}, []), p = r.useCallback(function(t) {
		u(t.type, dn(t), t.target, c(t, e.lockRef.current));
	}, []);
	r.useEffect(function() {
		return _n.push(o), e.setCallbacks({
			onScrollCapture: f,
			onWheelCapture: f,
			onTouchMoveCapture: p
		}), document.addEventListener("wheel", l, Qt), document.addEventListener("touchmove", l, Qt), document.addEventListener("touchstart", d, Qt), function() {
			_n = _n.filter(function(e) {
				return e !== o;
			}), document.removeEventListener("wheel", l, Qt), document.removeEventListener("touchmove", l, Qt), document.removeEventListener("touchstart", d, Qt);
		};
	}, []);
	var m = e.removeScrollBar, h = e.inert;
	return r.createElement(r.Fragment, null, h ? r.createElement(o, { styles: hn(a) }) : null, m ? r.createElement(Yt, {
		noRelative: e.noRelative,
		gapMode: e.gapMode
	}) : null);
}
function yn(e) {
	for (var t = null; e !== null;) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
	return t;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/sidecar.js
var bn = Ot(kt, vn), xn = r.forwardRef(function(e, t) {
	return r.createElement(jt, ft({}, e, {
		ref: t,
		sideCar: bn
	}));
});
xn.classNames = jt.classNames;
//#endregion
//#region src/lib/remove-scroll-gate.tsx
var Sn = r.createContext(!1);
function Cn({ allowBodyScroll: e, children: t }) {
	return /* @__PURE__ */ g(Sn.Provider, {
		value: e,
		children: t
	});
}
function wn() {
	return r.useContext(Sn);
}
//#endregion
//#region src/lib/react-remove-scroll-shim.tsx
var Tn = r.forwardRef(function(e, t) {
	let n = wn() ? !1 : e.enabled !== !1;
	return /* @__PURE__ */ g(xn, {
		...e,
		ref: t,
		enabled: n
	});
});
Tn.classNames = xn.classNames;
//#endregion
//#region node_modules/aria-hidden/dist/es2015/index.js
var En = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, Dn = /* @__PURE__ */ new WeakMap(), On = /* @__PURE__ */ new WeakMap(), kn = {}, An = 0, jn = function(e) {
	return e && (e.host || jn(e.parentNode));
}, Mn = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = jn(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, Nn = function(e, t, n, r) {
	var i = Mn(t, Array.isArray(e) ? e : [e]);
	kn[n] || (kn[n] = /* @__PURE__ */ new WeakMap());
	var a = kn[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		!e || s.has(e) || (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		!e || c.has(e) || Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (Dn.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				Dn.set(e, c), a.set(e, l), o.push(e), c === 1 && i && On.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), An++, function() {
		o.forEach(function(e) {
			var t = Dn.get(e) - 1, i = a.get(e) - 1;
			Dn.set(e, t), a.set(e, i), t || (On.has(e) || e.removeAttribute(r), On.delete(e)), i || e.removeAttribute(n);
		}), An--, An || (Dn = /* @__PURE__ */ new WeakMap(), Dn = /* @__PURE__ */ new WeakMap(), On = /* @__PURE__ */ new WeakMap(), kn = {});
	};
}, Pn = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || En(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), Nn(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function Fn(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function In(e) {
	let [t, n] = r.useState(void 0);
	return U(() => {
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
var Ln = [
	"top",
	"right",
	"bottom",
	"left"
], Rn = Math.min, W = Math.max, zn = Math.round, Bn = Math.floor, Vn = (e) => ({
	x: e,
	y: e
}), Hn = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function Un(e, t, n) {
	return W(e, Rn(t, n));
}
function Wn(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function Gn(e) {
	return e.split("-")[0];
}
function Kn(e) {
	return e.split("-")[1];
}
function qn(e) {
	return e === "x" ? "y" : "x";
}
function Jn(e) {
	return e === "y" ? "height" : "width";
}
function Yn(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function Xn(e) {
	return qn(Yn(e));
}
function Zn(e, t, n) {
	n === void 0 && (n = !1);
	let r = Kn(e), i = Xn(e), a = Jn(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = or(o)), [o, or(o)];
}
function Qn(e) {
	let t = or(e);
	return [
		$n(e),
		t,
		$n(t)
	];
}
function $n(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var er = ["left", "right"], tr = ["right", "left"], nr = ["top", "bottom"], rr = ["bottom", "top"];
function ir(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? tr : er : t ? er : tr;
		case "left":
		case "right": return t ? nr : rr;
		default: return [];
	}
}
function ar(e, t, n, r) {
	let i = Kn(e), a = ir(Gn(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map($n)))), a;
}
function or(e) {
	let t = Gn(e);
	return Hn[t] + e.slice(t.length);
}
function sr(e) {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...e
	};
}
function cr(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : sr(e);
}
function lr(e) {
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
function ur(e, t, n) {
	let { reference: r, floating: i } = e, a = Yn(t), o = Xn(t), s = Jn(o), c = Gn(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	switch (Kn(t)) {
		case "start":
			p[o] -= f * (n && l ? -1 : 1);
			break;
		case "end":
			p[o] += f * (n && l ? -1 : 1);
			break;
	}
	return p;
}
async function dr(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = Wn(t, e), p = cr(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = lr(await i.getClippingRect({
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
	}, y = lr(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var fr = 50, pr = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: dr
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = ur(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < fr && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = ur(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, mr = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = Wn(e, t) || {};
		if (l == null) return {};
		let d = cr(u), f = {
			x: n,
			y: r
		}, p = Xn(i), m = Jn(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = Rn(d[_], T), D = Rn(d[v], T), O = E, k = C - h[m] - D, A = C / 2 - h[m] / 2 + w, j = Un(O, A, k), M = !c.arrow && Kn(i) != null && A !== j && a.reference[m] / 2 - (A < O ? E : D) - h[m] / 2 < 0, N = M ? A < O ? A - O : A - k : 0;
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
}), hr = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = Wn(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = Gn(r), _ = Yn(o), v = Gn(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [or(o)] : Qn(o)), x = p !== "none";
			!d && x && b.push(...ar(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = Zn(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (!(u === "alignment" && _ !== Yn(t)) || T.every((e) => Yn(e.placement) === _ ? e.overflows[0] > 0 : !0))) return {
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
								let t = Yn(e.placement);
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
function gr(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function _r(e) {
	return Ln.some((t) => e[t] >= 0);
}
var vr = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = Wn(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = gr(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: _r(e)
					} };
				}
				case "escaped": {
					let e = gr(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: _r(e)
					} };
				}
				default: return {};
			}
		}
	};
}, yr = /* @__PURE__ */ new Set(["left", "top"]);
async function br(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = Gn(n), s = Kn(n), c = Yn(n) === "y", l = yr.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = Wn(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var xr = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await br(t, e);
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
}, Sr = function(e) {
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
			} }, ...l } = Wn(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = Yn(Gn(i)), p = qn(f), m = u[p], h = u[f];
			if (o) {
				let e = p === "y" ? "top" : "left", t = p === "y" ? "bottom" : "right", n = m + d[e], r = m - d[t];
				m = Un(n, m, r);
			}
			if (s) {
				let e = f === "y" ? "top" : "left", t = f === "y" ? "bottom" : "right", n = h + d[e], r = h - d[t];
				h = Un(n, h, r);
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
}, Cr = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = Wn(e, t), u = {
				x: n,
				y: r
			}, d = Yn(i), f = qn(d), p = u[f], m = u[d], h = Wn(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = yr.has(Gn(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, wr = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			var n, r;
			let { placement: i, rects: a, platform: o, elements: s } = t, { apply: c = () => {}, ...l } = Wn(e, t), u = await o.detectOverflow(t, l), d = Gn(i), f = Kn(i), p = Yn(i) === "y", { width: m, height: h } = a.floating, g, _;
			d === "top" || d === "bottom" ? (g = d, _ = f === (await (o.isRTL == null ? void 0 : o.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (_ = d, g = f === "end" ? "top" : "bottom");
			let v = h - u.top - u.bottom, y = m - u.left - u.right, b = Rn(h - u[g], v), x = Rn(m - u[_], y), S = !t.middlewareData.shift, C = b, w = x;
			if ((n = t.middlewareData.shift) != null && n.enabled.x && (w = y), (r = t.middlewareData.shift) != null && r.enabled.y && (C = v), S && !f) {
				let e = W(u.left, 0), t = W(u.right, 0), n = W(u.top, 0), r = W(u.bottom, 0);
				p ? w = m - 2 * (e !== 0 || t !== 0 ? e + t : W(u.left, u.right)) : C = h - 2 * (n !== 0 || r !== 0 ? n + r : W(u.top, u.bottom));
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
function Tr() {
	return typeof window < "u";
}
function Er(e) {
	return Or(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function G(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Dr(e) {
	return ((Or(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function Or(e) {
	return Tr() ? e instanceof Node || e instanceof G(e).Node : !1;
}
function K(e) {
	return Tr() ? e instanceof Element || e instanceof G(e).Element : !1;
}
function kr(e) {
	return Tr() ? e instanceof HTMLElement || e instanceof G(e).HTMLElement : !1;
}
function Ar(e) {
	return !Tr() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof G(e).ShadowRoot;
}
function jr(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = q(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function Mr(e) {
	return /^(table|td|th)$/.test(Er(e));
}
function Nr(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var Pr = /transform|translate|scale|rotate|perspective|filter/, Fr = /paint|layout|strict|content/, Ir = (e) => !!e && e !== "none", Lr;
function Rr(e) {
	let t = K(e) ? q(e) : e;
	return Ir(t.transform) || Ir(t.translate) || Ir(t.scale) || Ir(t.rotate) || Ir(t.perspective) || !Br() && (Ir(t.backdropFilter) || Ir(t.filter)) || Pr.test(t.willChange || "") || Fr.test(t.contain || "");
}
function zr(e) {
	let t = Ur(e);
	for (; kr(t) && !Vr(t);) {
		if (Rr(t)) return t;
		if (Nr(t)) return null;
		t = Ur(t);
	}
	return null;
}
function Br() {
	return Lr ?? (Lr = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), Lr;
}
function Vr(e) {
	return /^(html|body|#document)$/.test(Er(e));
}
function q(e) {
	return G(e).getComputedStyle(e);
}
function Hr(e) {
	return K(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function Ur(e) {
	if (Er(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Ar(e) && e.host || Dr(e);
	return Ar(t) ? t.host : t;
}
function Wr(e) {
	let t = Ur(e);
	return Vr(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : kr(t) && jr(t) ? t : Wr(t);
}
function Gr(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = Wr(e), i = r === e.ownerDocument?.body, a = G(r);
	if (i) {
		let e = Kr(a);
		return t.concat(a, a.visualViewport || [], jr(r) ? r : [], e && n ? Gr(e) : []);
	} else return t.concat(r, Gr(r, [], n));
}
function Kr(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function qr(e) {
	let t = q(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = kr(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = zn(n) !== a || zn(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function Jr(e) {
	return K(e) ? e : e.contextElement;
}
function Yr(e) {
	let t = Jr(e);
	if (!kr(t)) return Vn(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = qr(t), o = (a ? zn(n.width) : n.width) / r, s = (a ? zn(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var Xr = /* @__PURE__ */ Vn(0);
function Zr(e) {
	let t = G(e);
	return !Br() || !t.visualViewport ? Xr : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function Qr(e, t, n) {
	return t === void 0 && (t = !1), !n || t && n !== G(e) ? !1 : t;
}
function $r(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = Jr(e), o = Vn(1);
	t && (r ? K(r) && (o = Yr(r)) : o = Yr(e));
	let s = Qr(a, n, r) ? Zr(a) : Vn(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a) {
		let e = G(a), t = r && K(r) ? G(r) : r, n = e, i = Kr(n);
		for (; i && r && t !== n;) {
			let e = Yr(i), t = i.getBoundingClientRect(), r = q(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = G(i), i = Kr(n);
		}
	}
	return lr({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function ei(e, t) {
	let n = Hr(e).scrollLeft;
	return t ? t.left + n : $r(Dr(e)).left + n;
}
function ti(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - ei(e, n),
		y: n.top + t.scrollTop
	};
}
function ni(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = Dr(r), s = t ? Nr(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = Vn(1), u = Vn(0), d = kr(r);
	if ((d || !d && !a) && ((Er(r) !== "body" || jr(o)) && (c = Hr(r)), d)) {
		let e = $r(r);
		l = Yr(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? ti(o, c) : Vn(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function ri(e) {
	return Array.from(e.getClientRects());
}
function ii(e) {
	let t = Dr(e), n = Hr(e), r = e.ownerDocument.body, i = W(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), a = W(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight), o = -n.scrollLeft + ei(e), s = -n.scrollTop;
	return q(r).direction === "rtl" && (o += W(t.clientWidth, r.clientWidth) - i), {
		width: i,
		height: a,
		x: o,
		y: s
	};
}
var ai = 25;
function oi(e, t) {
	let n = G(e), r = Dr(e), i = n.visualViewport, a = r.clientWidth, o = r.clientHeight, s = 0, c = 0;
	if (i) {
		a = i.width, o = i.height;
		let e = Br();
		(!e || e && t === "fixed") && (s = i.offsetLeft, c = i.offsetTop);
	}
	let l = ei(r);
	if (l <= 0) {
		let e = r.ownerDocument, t = e.body, n = getComputedStyle(t), i = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, o = Math.abs(r.clientWidth - t.clientWidth - i);
		o <= ai && (a -= o);
	} else l <= ai && (a += l);
	return {
		width: a,
		height: o,
		x: s,
		y: c
	};
}
function si(e, t) {
	let n = $r(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = kr(e) ? Yr(e) : Vn(1);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function ci(e, t, n) {
	let r;
	if (t === "viewport") r = oi(e, n);
	else if (t === "document") r = ii(Dr(e));
	else if (K(t)) r = si(t, n);
	else {
		let n = Zr(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return lr(r);
}
function li(e, t) {
	let n = Ur(e);
	return n === t || !K(n) || Vr(n) ? !1 : q(n).position === "fixed" || li(n, t);
}
function ui(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = Gr(e, [], !1).filter((e) => K(e) && Er(e) !== "body"), i = null, a = q(e).position === "fixed", o = a ? Ur(e) : e;
	for (; K(o) && !Vr(o);) {
		let t = q(o), n = Rr(o);
		!n && t.position === "fixed" && (i = null), (a ? !n && !i : !n && t.position === "static" && i && (i.position === "absolute" || i.position === "fixed") || jr(o) && !n && li(e, o)) ? r = r.filter((e) => e !== o) : i = t, o = Ur(o);
	}
	return t.set(e, r), r;
}
function di(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? Nr(t) ? [] : ui(t, this._c) : [].concat(n), r], o = ci(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = ci(t, a[e], i);
		s = W(n.top, s), c = Rn(n.right, c), l = Rn(n.bottom, l), u = W(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function fi(e) {
	let { width: t, height: n } = qr(e);
	return {
		width: t,
		height: n
	};
}
function pi(e, t, n) {
	let r = kr(t), i = Dr(t), a = n === "fixed", o = $r(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = Vn(0);
	function l() {
		c.x = ei(i);
	}
	if (r || !r && !a) if ((Er(t) !== "body" || jr(i)) && (s = Hr(t)), r) {
		let e = $r(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	} else i && l();
	a && !r && i && l();
	let u = i && !r && !a ? ti(i, s) : Vn(0);
	return {
		x: o.left + s.scrollLeft - c.x - u.x,
		y: o.top + s.scrollTop - c.y - u.y,
		width: o.width,
		height: o.height
	};
}
function mi(e) {
	return q(e).position === "static";
}
function hi(e, t) {
	if (!kr(e) || q(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Dr(e) === n && (n = n.ownerDocument.body), n;
}
function gi(e, t) {
	let n = G(e);
	if (Nr(e)) return n;
	if (!kr(e)) {
		let t = Ur(e);
		for (; t && !Vr(t);) {
			if (K(t) && !mi(t)) return t;
			t = Ur(t);
		}
		return n;
	}
	let r = hi(e, t);
	for (; r && Mr(r) && mi(r);) r = hi(r, t);
	return r && Vr(r) && mi(r) && !Rr(r) ? n : r || zr(e) || n;
}
var _i = async function(e) {
	let t = this.getOffsetParent || gi, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: pi(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function vi(e) {
	return q(e).direction === "rtl";
}
var yi = {
	convertOffsetParentRelativeRectToViewportRelativeRect: ni,
	getDocumentElement: Dr,
	getClippingRect: di,
	getOffsetParent: gi,
	getElementRects: _i,
	getClientRects: ri,
	getDimensions: fi,
	getScale: Yr,
	isElement: K,
	isRTL: vi
};
function bi(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function xi(e, t) {
	let n = null, r, i = Dr(e);
	function a() {
		var e;
		clearTimeout(r), (e = n) == null || e.disconnect(), n = null;
	}
	function o(s, c) {
		s === void 0 && (s = !1), c === void 0 && (c = 1), a();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (s || t(), !f || !p) return;
		let m = Bn(d), h = Bn(i.clientWidth - (u + f)), g = Bn(i.clientHeight - (d + p)), _ = Bn(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: W(0, Rn(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (n !== c) {
				if (!y) return o();
				n ? o(!1, n) : r = setTimeout(() => {
					o(!1, 1e-7);
				}, 1e3);
			}
			n === 1 && !bi(l, e.getBoundingClientRect()) && o(), y = !1;
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
function Si(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = Jr(e), u = i || a ? [...l ? Gr(l) : [], ...t ? Gr(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n, { passive: !0 }), a && e.addEventListener("resize", n);
	});
	let d = l && s ? xi(l, n) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? $r(e) : null;
	c && g();
	function g() {
		let t = $r(e);
		h && !bi(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var Ci = xr, wi = Sr, Ti = hr, Ei = wr, Di = vr, Oi = mr, ki = Cr, Ai = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = {
		platform: yi,
		...n
	}, a = {
		...i.platform,
		_c: r
	};
	return pr(e, t, {
		...i,
		platform: a
	});
}, ji = typeof document < "u" ? l : function() {};
function Mi(e, t) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (typeof e == "function" && e.toString() === t.toString()) return !0;
	let n, r, i;
	if (e && t && typeof e == "object") {
		if (Array.isArray(e)) {
			if (n = e.length, n !== t.length) return !1;
			for (r = n; r-- !== 0;) if (!Mi(e[r], t[r])) return !1;
			return !0;
		}
		if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length) return !1;
		for (r = n; r-- !== 0;) if (!{}.hasOwnProperty.call(t, i[r])) return !1;
		for (r = n; r-- !== 0;) {
			let n = i[r];
			if (!(n === "_owner" && e.$$typeof) && !Mi(e[n], t[n])) return !1;
		}
		return !0;
	}
	return e !== e && t !== t;
}
function Ni(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Pi(e, t) {
	let n = Ni(e);
	return Math.round(t * n) / n;
}
function Fi(e) {
	let t = r.useRef(e);
	return ji(() => {
		t.current = e;
	}), t;
}
function Ii(e) {
	e === void 0 && (e = {});
	let { placement: t = "bottom", strategy: n = "absolute", middleware: i = [], platform: a, elements: { reference: o, floating: s } = {}, transform: c = !0, whileElementsMounted: l, open: u } = e, [d, f] = r.useState({
		x: 0,
		y: 0,
		strategy: n,
		placement: t,
		middlewareData: {},
		isPositioned: !1
	}), [p, m] = r.useState(i);
	Mi(p, i) || m(i);
	let [h, g] = r.useState(null), [_, y] = r.useState(null), b = r.useCallback((e) => {
		e !== w.current && (w.current = e, g(e));
	}, []), x = r.useCallback((e) => {
		e !== T.current && (T.current = e, y(e));
	}, []), S = o || h, C = s || _, w = r.useRef(null), T = r.useRef(null), E = r.useRef(d), D = l != null, O = Fi(l), k = Fi(a), A = Fi(u), j = r.useCallback(() => {
		if (!w.current || !T.current) return;
		let e = {
			placement: t,
			strategy: n,
			middleware: p
		};
		k.current && (e.platform = k.current), Ai(w.current, T.current, e).then((e) => {
			let t = {
				...e,
				isPositioned: A.current !== !1
			};
			M.current && !Mi(E.current, t) && (E.current = t, v.flushSync(() => {
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
	ji(() => {
		u === !1 && E.current.isPositioned && (E.current.isPositioned = !1, f((e) => ({
			...e,
			isPositioned: !1
		})));
	}, [u]);
	let M = r.useRef(!1);
	ji(() => (M.current = !0, () => {
		M.current = !1;
	}), []), ji(() => {
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
		let t = Pi(P.floating, d.x), r = Pi(P.floating, d.y);
		return c ? {
			...e,
			transform: "translate(" + t + "px, " + r + "px)",
			...Ni(P.floating) >= 1.5 && { willChange: "transform" }
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
var Li = (e) => {
	function t(e) {
		return {}.hasOwnProperty.call(e, "current");
	}
	return {
		name: "arrow",
		options: e,
		fn(n) {
			let { element: r, padding: i } = typeof e == "function" ? e(n) : e;
			return r && t(r) ? r.current == null ? {} : Oi({
				element: r.current,
				padding: i
			}).fn(n) : r ? Oi({
				element: r,
				padding: i
			}).fn(n) : {};
		}
	};
}, Ri = (e, t) => {
	let n = Ci(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, zi = (e, t) => {
	let n = wi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Bi = (e, t) => ({
	fn: ki(e).fn,
	options: [e, t]
}), Vi = (e, t) => {
	let n = Ti(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Hi = (e, t) => {
	let n = Ei(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Ui = (e, t) => {
	let n = Di(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Wi = (e, t) => {
	let n = Li(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Gi = "Arrow", Ki = r.forwardRef((e, t) => {
	let { children: n, width: r = 10, height: i = 5, ...a } = e;
	return /* @__PURE__ */ g(V.svg, {
		...a,
		ref: t,
		width: r,
		height: i,
		viewBox: "0 0 30 10",
		preserveAspectRatio: "none",
		children: e.asChild ? n : /* @__PURE__ */ g("polygon", { points: "0,0 30,0 15,10" })
	});
});
Ki.displayName = Gi;
var qi = Ki, Ji = "Popper", [Yi, Xi] = fe(Ji), [Zi, Qi] = Yi(Ji), $i = (e) => {
	let { __scopePopper: t, children: n } = e, [i, a] = r.useState(null);
	return /* @__PURE__ */ g(Zi, {
		scope: t,
		anchor: i,
		onAnchorChange: a,
		children: n
	});
};
$i.displayName = Ji;
var ea = "PopperAnchor", ta = r.forwardRef((e, t) => {
	let { __scopePopper: n, virtualRef: i, ...a } = e, o = Qi(ea, n), s = r.useRef(null), c = z(t, s), l = r.useRef(null);
	return r.useEffect(() => {
		let e = l.current;
		l.current = i?.current || s.current, e !== l.current && o.onAnchorChange(l.current);
	}), i ? null : /* @__PURE__ */ g(V.div, {
		...a,
		ref: c
	});
});
ta.displayName = ea;
var na = "PopperContent", [ra, ia] = Yi(na), aa = r.forwardRef((e, t) => {
	let { __scopePopper: n, side: i = "bottom", sideOffset: a = 0, align: o = "center", alignOffset: s = 0, arrowPadding: c = 0, avoidCollisions: l = !0, collisionBoundary: u = [], collisionPadding: d = 0, sticky: f = "partial", hideWhenDetached: p = !1, updatePositionStrategy: m = "optimized", onPlaced: h, ..._ } = e, v = Qi(na, n), [y, b] = r.useState(null), x = z(t, (e) => b(e)), [S, C] = r.useState(null), w = In(S), T = w?.width ?? 0, E = w?.height ?? 0, D = i + (o === "center" ? "" : "-" + o), O = typeof d == "number" ? d : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...d
	}, k = Array.isArray(u) ? u : [u], A = k.length > 0, j = {
		padding: O,
		boundary: k.filter(la),
		altBoundary: A
	}, { refs: M, floatingStyles: N, placement: P, isPositioned: F, middlewareData: I } = Ii({
		strategy: "fixed",
		placement: D,
		whileElementsMounted: (...e) => Si(...e, { animationFrame: m === "always" }),
		elements: { reference: v.anchor },
		middleware: [
			Ri({
				mainAxis: a + E,
				alignmentAxis: s
			}),
			l && zi({
				mainAxis: !0,
				crossAxis: !1,
				limiter: f === "partial" ? Bi() : void 0,
				...j
			}),
			l && Vi({ ...j }),
			Hi({
				...j,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--radix-popper-available-width", `${n}px`), o.setProperty("--radix-popper-available-height", `${r}px`), o.setProperty("--radix-popper-anchor-width", `${i}px`), o.setProperty("--radix-popper-anchor-height", `${a}px`);
				}
			}),
			S && Wi({
				element: S,
				padding: c
			}),
			ua({
				arrowWidth: T,
				arrowHeight: E
			}),
			p && Ui({
				strategy: "referenceHidden",
				...j
			})
		]
	}), [L, ee] = da(P), te = Ae(h);
	U(() => {
		F && te?.();
	}, [F, te]);
	let ne = I.arrow?.x, R = I.arrow?.y, re = I.arrow?.centerOffset !== 0, [ie, B] = r.useState();
	return U(() => {
		y && B(window.getComputedStyle(y).zIndex);
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
		children: /* @__PURE__ */ g(ra, {
			scope: n,
			placedSide: L,
			onArrowChange: C,
			arrowX: ne,
			arrowY: R,
			shouldHideArrow: re,
			children: /* @__PURE__ */ g(V.div, {
				"data-side": L,
				"data-align": ee,
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
aa.displayName = na;
var oa = "PopperArrow", sa = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
}, ca = r.forwardRef(function(e, t) {
	let { __scopePopper: n, ...r } = e, i = ia(oa, n), a = sa[i.placedSide];
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
		children: /* @__PURE__ */ g(qi, {
			...r,
			ref: t,
			style: {
				...r.style,
				display: "block"
			}
		})
	});
});
ca.displayName = oa;
function la(e) {
	return e !== null;
}
var ua = (e) => ({
	name: "transformOrigin",
	options: e,
	fn(t) {
		let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = da(n), u = {
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
function da(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
var fa = $i, pa = ta, ma = aa, ha = ca, ga = "Label", _a = r.forwardRef((e, t) => /* @__PURE__ */ g(V.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
_a.displayName = ga;
var va = _a;
//#endregion
//#region node_modules/@radix-ui/number/dist/index.mjs
function ya(e, [t, n]) {
	return Math.min(n, Math.max(t, e));
}
//#endregion
//#region node_modules/@radix-ui/react-select/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function ba(e) {
	let t = /* @__PURE__ */ xa(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Ca);
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
function xa(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Ta(n), a = wa(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? R(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Sa = Symbol("radix.slottable");
function Ca(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Sa;
}
function wa(e, t) {
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
function Ta(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-select/dist/index.mjs
var Ea = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], Da = [" ", "Enter"], Oa = "Select", [ka, Aa, ja] = be(Oa), [Ma, Na] = fe(Oa, [ja, Xi]), Pa = Xi(), [Fa, Ia] = Ma(Oa), [La, Ra] = Ma(Oa), za = (e) => {
	let { __scopeSelect: t, children: n, open: i, defaultOpen: a, onOpenChange: o, value: s, defaultValue: c, onValueChange: l, dir: u, name: d, autoComplete: f, disabled: p, required: m, form: h } = e, v = Pa(t), [y, b] = r.useState(null), [x, S] = r.useState(null), [C, w] = r.useState(!1), T = ke(u), [E, D] = Se({
		prop: i,
		defaultProp: a ?? !1,
		onChange: o,
		caller: Oa
	}), [O, k] = Se({
		prop: s,
		defaultProp: c,
		onChange: l,
		caller: Oa
	}), A = r.useRef(null), j = y ? h || !!y.closest("form") : !0, [M, N] = r.useState(/* @__PURE__ */ new Set()), P = Array.from(M).map((e) => e.props.value).join(";");
	return /* @__PURE__ */ g(fa, {
		...v,
		children: /* @__PURE__ */ _(Fa, {
			required: m,
			scope: t,
			trigger: y,
			onTriggerChange: b,
			valueNode: x,
			onValueNodeChange: S,
			valueNodeHasChildren: C,
			onValueNodeHasChildrenChange: w,
			contentId: De(),
			value: O,
			onValueChange: k,
			open: E,
			onOpenChange: D,
			dir: T,
			triggerPointerDownPosRef: A,
			disabled: p,
			children: [/* @__PURE__ */ g(ka.Provider, {
				scope: t,
				children: /* @__PURE__ */ g(La, {
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
			}), j ? /* @__PURE__ */ _(Fo, {
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
za.displayName = Oa;
var Ba = "SelectTrigger", Va = r.forwardRef((e, t) => {
	let { __scopeSelect: n, disabled: i = !1, ...a } = e, o = Pa(n), s = Ia(Ba, n), c = s.disabled || i, l = z(t, s.onTriggerChange), u = Aa(n), d = r.useRef("touch"), [f, p, m] = Lo((e) => {
		let t = u().filter((e) => !e.disabled), n = Ro(t, e, t.find((e) => e.value === s.value));
		n !== void 0 && s.onValueChange(n.value);
	}), h = (e) => {
		c || (s.onOpenChange(!0), m()), e && (s.triggerPointerDownPosRef.current = {
			x: Math.round(e.pageX),
			y: Math.round(e.pageY)
		});
	};
	return /* @__PURE__ */ g(pa, {
		asChild: !0,
		...o,
		children: /* @__PURE__ */ g(V.button, {
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
			"data-placeholder": Io(s.value) ? "" : void 0,
			...a,
			ref: l,
			onClick: H(a.onClick, (e) => {
				e.currentTarget.focus(), d.current !== "mouse" && h(e);
			}),
			onPointerDown: H(a.onPointerDown, (e) => {
				d.current = e.pointerType;
				let t = e.target;
				t.hasPointerCapture(e.pointerId) && t.releasePointerCapture(e.pointerId), e.button === 0 && e.ctrlKey === !1 && e.pointerType === "mouse" && (h(e), e.preventDefault());
			}),
			onKeyDown: H(a.onKeyDown, (e) => {
				let t = f.current !== "";
				!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && p(e.key), !(t && e.key === " ") && Ea.includes(e.key) && (h(), e.preventDefault());
			})
		})
	});
});
Va.displayName = Ba;
var Ha = "SelectValue", Ua = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: r, style: i, children: a, placeholder: o = "", ...s } = e, c = Ia(Ha, n), { onValueNodeHasChildrenChange: l } = c, u = a !== void 0, d = z(t, c.onValueNodeChange);
	return U(() => {
		l(u);
	}, [l, u]), /* @__PURE__ */ g(V.span, {
		...s,
		ref: d,
		style: { pointerEvents: "none" },
		children: Io(c.value) ? /* @__PURE__ */ g(h, { children: o }) : a
	});
});
Ua.displayName = Ha;
var Wa = "SelectIcon", Ga = r.forwardRef((e, t) => {
	let { __scopeSelect: n, children: r, ...i } = e;
	return /* @__PURE__ */ g(V.span, {
		"aria-hidden": !0,
		...i,
		ref: t,
		children: r || "▼"
	});
});
Ga.displayName = Wa;
var Ka = "SelectPortal", qa = (e) => /* @__PURE__ */ g(ct, {
	asChild: !0,
	...e
});
qa.displayName = Ka;
var Ja = "SelectContent", Ya = r.forwardRef((e, t) => {
	let n = Ia(Ja, e.__scopeSelect), [i, a] = r.useState();
	if (U(() => {
		a(new DocumentFragment());
	}, []), !n.open) {
		let t = i;
		return t ? v.createPortal(/* @__PURE__ */ g(Za, {
			scope: e.__scopeSelect,
			children: /* @__PURE__ */ g(ka.Slot, {
				scope: e.__scopeSelect,
				children: /* @__PURE__ */ g("div", { children: e.children })
			})
		}), t) : null;
	}
	return /* @__PURE__ */ g(to, {
		...e,
		ref: t
	});
});
Ya.displayName = Ja;
var Xa = 10, [Za, Qa] = Ma(Ja), $a = "SelectContentImpl", eo = /* @__PURE__ */ ba("SelectContent.RemoveScroll"), to = r.forwardRef((e, t) => {
	let { __scopeSelect: n, position: i = "item-aligned", onCloseAutoFocus: a, onEscapeKeyDown: o, onPointerDownOutside: s, side: c, sideOffset: l, align: u, alignOffset: d, arrowPadding: f, collisionBoundary: p, collisionPadding: m, sticky: h, hideWhenDetached: _, avoidCollisions: v, ...y } = e, b = Ia(Ja, n), [x, S] = r.useState(null), [C, w] = r.useState(null), T = z(t, (e) => S(e)), [E, D] = r.useState(null), [O, k] = r.useState(null), A = Aa(n), [j, M] = r.useState(!1), N = r.useRef(!1);
	r.useEffect(() => {
		if (x) return Pn(x);
	}, [x]), ut();
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
	let { onOpenChange: I, triggerPointerDownPosRef: L } = b;
	r.useEffect(() => {
		if (x) {
			let e = {
				x: 0,
				y: 0
			}, t = (t) => {
				e = {
					x: Math.abs(Math.round(t.pageX) - (L.current?.x ?? 0)),
					y: Math.abs(Math.round(t.pageY) - (L.current?.y ?? 0))
				};
			}, n = (n) => {
				e.x <= 10 && e.y <= 10 ? n.preventDefault() : x.contains(n.target) || I(!1), document.removeEventListener("pointermove", t), L.current = null;
			};
			return L.current !== null && (document.addEventListener("pointermove", t), document.addEventListener("pointerup", n, {
				capture: !0,
				once: !0
			})), () => {
				document.removeEventListener("pointermove", t), document.removeEventListener("pointerup", n, { capture: !0 });
			};
		}
	}, [
		x,
		I,
		L
	]), r.useEffect(() => {
		let e = () => I(!1);
		return window.addEventListener("blur", e), window.addEventListener("resize", e), () => {
			window.removeEventListener("blur", e), window.removeEventListener("resize", e);
		};
	}, [I]);
	let [ee, te] = Lo((e) => {
		let t = A().filter((e) => !e.disabled), n = Ro(t, e, t.find((e) => e.ref.current === document.activeElement));
		n && setTimeout(() => n.ref.current.focus());
	}), ne = r.useCallback((e, t, n) => {
		let r = !N.current && !n;
		(b.value !== void 0 && b.value === t || r) && (D(e), r && (N.current = !0));
	}, [b.value]), R = r.useCallback(() => x?.focus(), [x]), re = r.useCallback((e, t, n) => {
		let r = !N.current && !n;
		(b.value !== void 0 && b.value === t || r) && k(e);
	}, [b.value]), ie = i === "popper" ? ao : ro, B = ie === ao ? {
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
	return /* @__PURE__ */ g(Za, {
		scope: n,
		content: x,
		viewport: C,
		onViewportChange: w,
		itemRefCallback: ne,
		selectedItem: E,
		onItemLeave: R,
		itemTextRefCallback: re,
		focusSelectedItem: F,
		selectedItemText: O,
		position: i,
		isPositioned: j,
		searchRef: ee,
		children: /* @__PURE__ */ g(Tn, {
			as: eo,
			allowPinchZoom: !0,
			children: /* @__PURE__ */ g(Ye, {
				asChild: !0,
				trapped: b.open,
				onMountAutoFocus: (e) => {
					e.preventDefault();
				},
				onUnmountAutoFocus: H(a, (e) => {
					b.trigger?.focus({ preventScroll: !0 }), e.preventDefault();
				}),
				children: /* @__PURE__ */ g(Re, {
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
						...B,
						onPlaced: () => M(!0),
						ref: T,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none",
							...y.style
						},
						onKeyDown: H(y.onKeyDown, (e) => {
							let t = e.ctrlKey || e.altKey || e.metaKey;
							if (e.key === "Tab" && e.preventDefault(), !t && e.key.length === 1 && te(e.key), [
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
to.displayName = $a;
var no = "SelectItemAlignedPosition", ro = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onPlaced: i, ...a } = e, o = Ia(Ja, n), s = Qa(Ja, n), [c, l] = r.useState(null), [u, d] = r.useState(null), f = z(t, (e) => d(e)), p = Aa(n), m = r.useRef(!1), h = r.useRef(!0), { viewport: _, selectedItem: v, selectedItemText: y, focusSelectedItem: b } = s, x = r.useCallback(() => {
		if (o.trigger && o.valueNode && c && u && _ && v && y) {
			let e = o.trigger.getBoundingClientRect(), t = u.getBoundingClientRect(), n = o.valueNode.getBoundingClientRect(), r = y.getBoundingClientRect();
			if (o.dir !== "rtl") {
				let i = r.left - t.left, a = n.left - i, o = e.left - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - Xa, d = ya(a, [Xa, Math.max(Xa, u - l)]);
				c.style.minWidth = s + "px", c.style.left = d + "px";
			} else {
				let i = t.right - r.right, a = window.innerWidth - n.right - i, o = window.innerWidth - e.right - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - Xa, d = ya(a, [Xa, Math.max(Xa, u - l)]);
				c.style.minWidth = s + "px", c.style.right = d + "px";
			}
			let a = p(), s = window.innerHeight - Xa * 2, l = _.scrollHeight, d = window.getComputedStyle(u), f = parseInt(d.borderTopWidth, 10), h = parseInt(d.paddingTop, 10), g = parseInt(d.borderBottomWidth, 10), b = parseInt(d.paddingBottom, 10), x = f + h + l + b + g, S = Math.min(v.offsetHeight * 5, x), C = window.getComputedStyle(_), w = parseInt(C.paddingTop, 10), T = parseInt(C.paddingBottom, 10), E = e.top + e.height / 2 - Xa, D = s - E, O = v.offsetHeight / 2, k = v.offsetTop + O, A = f + h + k, j = x - A;
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
			c.style.margin = `${Xa}px 0`, c.style.minHeight = S + "px", c.style.maxHeight = s + "px", i?.(), requestAnimationFrame(() => m.current = !0);
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
	U(() => x(), [x]);
	let [S, C] = r.useState();
	return U(() => {
		u && C(window.getComputedStyle(u).zIndex);
	}, [u]), /* @__PURE__ */ g(oo, {
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
			children: /* @__PURE__ */ g(V.div, {
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
ro.displayName = no;
var io = "SelectPopperPosition", ao = r.forwardRef((e, t) => {
	let { __scopeSelect: n, align: r = "start", collisionPadding: i = Xa, ...a } = e;
	return /* @__PURE__ */ g(ma, {
		...Pa(n),
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
ao.displayName = io;
var [oo, so] = Ma(Ja, {}), co = "SelectViewport", lo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, nonce: i, ...a } = e, o = Qa(co, n), s = so(co, n), c = z(t, o.onViewportChange), l = r.useRef(0);
	return /* @__PURE__ */ _(h, { children: [/* @__PURE__ */ g("style", {
		dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" },
		nonce: i
	}), /* @__PURE__ */ g(ka.Slot, {
		scope: n,
		children: /* @__PURE__ */ g(V.div, {
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
			onScroll: H(a.onScroll, (e) => {
				let t = e.currentTarget, { contentWrapper: n, shouldExpandOnScrollRef: r } = s;
				if (r?.current && n) {
					let e = Math.abs(l.current - t.scrollTop);
					if (e > 0) {
						let r = window.innerHeight - Xa * 2, i = parseFloat(n.style.minHeight), a = parseFloat(n.style.height), o = Math.max(i, a);
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
lo.displayName = co;
var uo = "SelectGroup", [fo, po] = Ma(uo), mo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = De();
	return /* @__PURE__ */ g(fo, {
		scope: n,
		id: i,
		children: /* @__PURE__ */ g(V.div, {
			role: "group",
			"aria-labelledby": i,
			...r,
			ref: t
		})
	});
});
mo.displayName = uo;
var ho = "SelectLabel", go = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = po(ho, n);
	return /* @__PURE__ */ g(V.div, {
		id: i.id,
		...r,
		ref: t
	});
});
go.displayName = ho;
var _o = "SelectItem", [vo, yo] = Ma(_o), bo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, value: i, disabled: a = !1, textValue: o, ...s } = e, c = Ia(_o, n), l = Qa(_o, n), u = c.value === i, [d, f] = r.useState(o ?? ""), [p, m] = r.useState(!1), h = z(t, (e) => l.itemRefCallback?.(e, i, a)), _ = De(), v = r.useRef("touch"), y = () => {
		a || (c.onValueChange(i), c.onOpenChange(!1));
	};
	if (i === "") throw Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
	return /* @__PURE__ */ g(vo, {
		scope: n,
		value: i,
		disabled: a,
		textId: _,
		isSelected: u,
		onItemTextChange: r.useCallback((e) => {
			f((t) => t || (e?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ g(ka.ItemSlot, {
			scope: n,
			value: i,
			disabled: a,
			textValue: d,
			children: /* @__PURE__ */ g(V.div, {
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
				onFocus: H(s.onFocus, () => m(!0)),
				onBlur: H(s.onBlur, () => m(!1)),
				onClick: H(s.onClick, () => {
					v.current !== "mouse" && y();
				}),
				onPointerUp: H(s.onPointerUp, () => {
					v.current === "mouse" && y();
				}),
				onPointerDown: H(s.onPointerDown, (e) => {
					v.current = e.pointerType;
				}),
				onPointerMove: H(s.onPointerMove, (e) => {
					v.current = e.pointerType, a ? l.onItemLeave?.() : v.current === "mouse" && e.currentTarget.focus({ preventScroll: !0 });
				}),
				onPointerLeave: H(s.onPointerLeave, (e) => {
					e.currentTarget === document.activeElement && l.onItemLeave?.();
				}),
				onKeyDown: H(s.onKeyDown, (e) => {
					l.searchRef?.current !== "" && e.key === " " || (Da.includes(e.key) && y(), e.key === " " && e.preventDefault());
				})
			})
		})
	});
});
bo.displayName = _o;
var xo = "SelectItemText", So = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: i, style: a, ...o } = e, s = Ia(xo, n), c = Qa(xo, n), l = yo(xo, n), u = Ra(xo, n), [d, f] = r.useState(null), p = z(t, (e) => f(e), l.onItemTextChange, (e) => c.itemTextRefCallback?.(e, l.value, l.disabled)), m = d?.textContent, y = r.useMemo(() => /* @__PURE__ */ g("option", {
		value: l.value,
		disabled: l.disabled,
		children: m
	}, l.value), [
		l.disabled,
		l.value,
		m
	]), { onNativeOptionAdd: b, onNativeOptionRemove: x } = u;
	return U(() => (b(y), () => x(y)), [
		b,
		x,
		y
	]), /* @__PURE__ */ _(h, { children: [/* @__PURE__ */ g(V.span, {
		id: l.textId,
		...o,
		ref: p
	}), l.isSelected && s.valueNode && !s.valueNodeHasChildren ? v.createPortal(o.children, s.valueNode) : null] });
});
So.displayName = xo;
var Co = "SelectItemIndicator", wo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return yo(Co, n).isSelected ? /* @__PURE__ */ g(V.span, {
		"aria-hidden": !0,
		...r,
		ref: t
	}) : null;
});
wo.displayName = Co;
var To = "SelectScrollUpButton", Eo = r.forwardRef((e, t) => {
	let n = Qa(To, e.__scopeSelect), i = so(To, e.__scopeSelect), [a, o] = r.useState(!1), s = z(t, i.onScrollButtonChange);
	return U(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				o(t.scrollTop > 0);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ g(ko, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop -= t.offsetHeight);
		}
	}) : null;
});
Eo.displayName = To;
var Do = "SelectScrollDownButton", Oo = r.forwardRef((e, t) => {
	let n = Qa(Do, e.__scopeSelect), i = so(Do, e.__scopeSelect), [a, o] = r.useState(!1), s = z(t, i.onScrollButtonChange);
	return U(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				let e = t.scrollHeight - t.clientHeight;
				o(Math.ceil(t.scrollTop) < e);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ g(ko, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop += t.offsetHeight);
		}
	}) : null;
});
Oo.displayName = Do;
var ko = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onAutoScroll: i, ...a } = e, o = Qa("SelectScrollButton", n), s = r.useRef(null), c = Aa(n), l = r.useCallback(() => {
		s.current !== null && (window.clearInterval(s.current), s.current = null);
	}, []);
	return r.useEffect(() => () => l(), [l]), U(() => {
		c().find((e) => e.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
	}, [c]), /* @__PURE__ */ g(V.div, {
		"aria-hidden": !0,
		...a,
		ref: t,
		style: {
			flexShrink: 0,
			...a.style
		},
		onPointerDown: H(a.onPointerDown, () => {
			s.current === null && (s.current = window.setInterval(i, 50));
		}),
		onPointerMove: H(a.onPointerMove, () => {
			o.onItemLeave?.(), s.current === null && (s.current = window.setInterval(i, 50));
		}),
		onPointerLeave: H(a.onPointerLeave, () => {
			l();
		})
	});
}), Ao = "SelectSeparator", jo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return /* @__PURE__ */ g(V.div, {
		"aria-hidden": !0,
		...r,
		ref: t
	});
});
jo.displayName = Ao;
var Mo = "SelectArrow", No = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = Pa(n), a = Ia(Mo, n), o = Qa(Mo, n);
	return a.open && o.position === "popper" ? /* @__PURE__ */ g(ha, {
		...i,
		...r,
		ref: t
	}) : null;
});
No.displayName = Mo;
var Po = "SelectBubbleInput", Fo = r.forwardRef(({ __scopeSelect: e, value: t, ...n }, i) => {
	let a = r.useRef(null), o = z(i, a), s = Fn(t);
	return r.useEffect(() => {
		let e = a.current;
		if (!e) return;
		let n = window.HTMLSelectElement.prototype, r = Object.getOwnPropertyDescriptor(n, "value").set;
		if (s !== t && r) {
			let n = new Event("change", { bubbles: !0 });
			r.call(e, t), e.dispatchEvent(n);
		}
	}, [s, t]), /* @__PURE__ */ g(V.select, {
		...n,
		style: {
			...le,
			...n.style
		},
		ref: o,
		defaultValue: t
	});
});
Fo.displayName = Po;
function Io(e) {
	return e === "" || e === void 0;
}
function Lo(e) {
	let t = Ae(e), n = r.useRef(""), i = r.useRef(0), a = r.useCallback((e) => {
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
function Ro(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = zo(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.textValue.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
function zo(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
var Bo = za, Vo = Va, Ho = Ua, Uo = Ga, Wo = qa, Go = Ya, Ko = lo, qo = bo, Jo = So, Yo = wo, Xo = Eo, Zo = Oo;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function Qo(e) {
	let t = /* @__PURE__ */ es(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(ns);
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
var $o = /* @__PURE__ */ Qo("Slot");
/* @__NO_SIDE_EFFECTS__ */
function es(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = is(n), a = rs(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? R(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var ts = Symbol("radix.slottable");
function ns(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === ts;
}
function rs(e, t) {
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
function is(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-switch/dist/index.mjs
var as = "Switch", [os, ss] = fe(as), [cs, ls] = os(as), us = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, name: i, checked: a, defaultChecked: o, required: s, disabled: c, value: l = "on", onCheckedChange: u, form: d, ...f } = e, [p, m] = r.useState(null), h = z(t, (e) => m(e)), v = r.useRef(!1), y = p ? d || !!p.closest("form") : !0, [b, x] = Se({
		prop: a,
		defaultProp: o ?? !1,
		onChange: u,
		caller: as
	});
	return /* @__PURE__ */ _(cs, {
		scope: n,
		checked: b,
		disabled: c,
		children: [/* @__PURE__ */ g(V.button, {
			type: "button",
			role: "switch",
			"aria-checked": b,
			"aria-required": s,
			"data-state": hs(b),
			"data-disabled": c ? "" : void 0,
			disabled: c,
			value: l,
			...f,
			ref: h,
			onClick: H(e.onClick, (e) => {
				x((e) => !e), y && (v.current = e.isPropagationStopped(), v.current || e.stopPropagation());
			})
		}), y && /* @__PURE__ */ g(ms, {
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
us.displayName = as;
var ds = "SwitchThumb", fs = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, ...r } = e, i = ls(ds, n);
	return /* @__PURE__ */ g(V.span, {
		"data-state": hs(i.checked),
		"data-disabled": i.disabled ? "" : void 0,
		...r,
		ref: t
	});
});
fs.displayName = ds;
var ps = "SwitchBubbleInput", ms = r.forwardRef(({ __scopeSwitch: e, control: t, checked: n, bubbles: i = !0, ...a }, o) => {
	let s = r.useRef(null), c = z(s, o), l = Fn(n), u = In(t);
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
ms.displayName = ps;
function hs(e) {
	return e ? "checked" : "unchecked";
}
var gs = us, _s = fs, vs = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, ys = (e, t) => ({
	classGroupId: e,
	validator: t
}), bs = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), xs = "-", Ss = [], Cs = "arbitrary..", ws = (e) => {
	let t = Ds(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return Es(e);
			let n = e.split(xs);
			return Ts(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? vs(i, t) : t : i || Ss;
			}
			return n[e] || Ss;
		}
	};
}, Ts = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = Ts(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(xs) : e.slice(t).join(xs), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, Es = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? Cs + r : void 0;
})(), Ds = (e) => {
	let { theme: t, classGroups: n } = e;
	return Os(n, t);
}, Os = (e, t) => {
	let n = bs();
	for (let r in e) {
		let i = e[r];
		ks(i, n, r, t);
	}
	return n;
}, ks = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		As(i, t, n, r);
	}
}, As = (e, t, n, r) => {
	if (typeof e == "string") {
		js(e, t, n);
		return;
	}
	if (typeof e == "function") {
		Ms(e, t, n, r);
		return;
	}
	Ns(e, t, n, r);
}, js = (e, t, n) => {
	let r = e === "" ? t : Ps(t, e);
	r.classGroupId = n;
}, Ms = (e, t, n, r) => {
	if (Fs(e)) {
		ks(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(ys(n, e));
}, Ns = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		ks(o, Ps(t, a), n, r);
	}
}, Ps = (e, t) => {
	let n = e, r = t.split(xs), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = bs(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, Fs = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Is = (e) => {
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
}, Ls = "!", Rs = ":", zs = [], Bs = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), Vs = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === Rs) {
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
		s.endsWith(Ls) ? (c = s.slice(0, -1), l = !0) : s.startsWith(Ls) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return Bs(t, l, c, u);
	};
	if (t) {
		let e = t + Rs, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : Bs(zs, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, Hs = (e) => {
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
}, Us = (e) => ({
	cache: Is(e.cacheSize),
	parseClassName: Vs(e),
	sortModifiers: Hs(e),
	...ws(e)
}), Ws = /\s+/, Gs = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(Ws), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + Ls : g, v = _ + h;
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
}, Ks = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = qs(n)) && (i && (i += " "), i += r);
	return i;
}, qs = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = qs(e[r])) && (n && (n += " "), n += t);
	return n;
}, Js = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = Us(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = Gs(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(Ks(...e));
}, Ys = [], J = (e) => {
	let t = (t) => t[e] || Ys;
	return t.isThemeGetter = !0, t;
}, Xs = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Zs = /^\((?:(\w[\w-]*):)?(.+)\)$/i, Qs = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, $s = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, ec = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, tc = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, nc = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, rc = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, ic = (e) => Qs.test(e), Y = (e) => !!e && !Number.isNaN(Number(e)), ac = (e) => !!e && Number.isInteger(Number(e)), oc = (e) => e.endsWith("%") && Y(e.slice(0, -1)), sc = (e) => $s.test(e), cc = () => !0, lc = (e) => ec.test(e) && !tc.test(e), uc = () => !1, dc = (e) => nc.test(e), fc = (e) => rc.test(e), pc = (e) => !X(e) && !Z(e), mc = (e) => kc(e, Nc, uc), X = (e) => Xs.test(e), hc = (e) => kc(e, Pc, lc), gc = (e) => kc(e, Fc, Y), _c = (e) => kc(e, Lc, cc), vc = (e) => kc(e, Ic, uc), yc = (e) => kc(e, jc, uc), bc = (e) => kc(e, Mc, fc), xc = (e) => kc(e, Rc, dc), Z = (e) => Zs.test(e), Sc = (e) => Ac(e, Pc), Cc = (e) => Ac(e, Ic), wc = (e) => Ac(e, jc), Tc = (e) => Ac(e, Nc), Ec = (e) => Ac(e, Mc), Dc = (e) => Ac(e, Rc, !0), Oc = (e) => Ac(e, Lc, !0), kc = (e, t, n) => {
	let r = Xs.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, Ac = (e, t, n = !1) => {
	let r = Zs.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, jc = (e) => e === "position" || e === "percentage", Mc = (e) => e === "image" || e === "url", Nc = (e) => e === "length" || e === "size" || e === "bg-size", Pc = (e) => e === "length", Fc = (e) => e === "number", Ic = (e) => e === "family-name", Lc = (e) => e === "number" || e === "weight", Rc = (e) => e === "shadow", zc = /* @__PURE__ */ Js(() => {
	let e = J("color"), t = J("font"), n = J("text"), r = J("font-weight"), i = J("tracking"), a = J("leading"), o = J("breakpoint"), s = J("container"), c = J("spacing"), l = J("radius"), u = J("shadow"), d = J("inset-shadow"), f = J("text-shadow"), p = J("drop-shadow"), m = J("blur"), h = J("perspective"), g = J("aspect"), _ = J("ease"), v = J("animate"), y = () => [
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
		Z,
		X
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
		Z,
		X,
		c
	], T = () => [
		ic,
		"full",
		"auto",
		...w()
	], E = () => [
		ac,
		"none",
		"subgrid",
		Z,
		X
	], D = () => [
		"auto",
		{ span: [
			"full",
			ac,
			Z,
			X
		] },
		ac,
		Z,
		X
	], O = () => [
		ac,
		"auto",
		Z,
		X
	], k = () => [
		"auto",
		"min",
		"max",
		"fr",
		Z,
		X
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
		ic,
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
		ic,
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
		ic,
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
		Z,
		X
	], L = () => [
		...b(),
		wc,
		yc,
		{ position: [Z, X] }
	], ee = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], te = () => [
		"auto",
		"cover",
		"contain",
		Tc,
		mc,
		{ size: [Z, X] }
	], ne = () => [
		oc,
		Sc,
		hc
	], R = () => [
		"",
		"none",
		"full",
		l,
		Z,
		X
	], z = () => [
		"",
		Y,
		Sc,
		hc
	], re = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	], ie = () => [
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
	], B = () => [
		Y,
		oc,
		wc,
		yc
	], ae = () => [
		"",
		"none",
		m,
		Z,
		X
	], oe = () => [
		"none",
		Y,
		Z,
		X
	], se = () => [
		"none",
		Y,
		Z,
		X
	], V = () => [
		Y,
		Z,
		X
	], ce = () => [
		ic,
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
			blur: [sc],
			breakpoint: [sc],
			color: [cc],
			container: [sc],
			"drop-shadow": [sc],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [pc],
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
			"inset-shadow": [sc],
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
			radius: [sc],
			shadow: [sc],
			spacing: ["px", Y],
			text: [sc],
			"text-shadow": [sc],
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
				ic,
				X,
				Z,
				g
			] }],
			container: ["container"],
			columns: [{ columns: [
				Y,
				X,
				Z,
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
				ac,
				"auto",
				Z,
				X
			] }],
			basis: [{ basis: [
				ic,
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
				Y,
				ic,
				"auto",
				"initial",
				"none",
				X
			] }],
			grow: [{ grow: [
				"",
				Y,
				Z,
				X
			] }],
			shrink: [{ shrink: [
				"",
				Y,
				Z,
				X
			] }],
			order: [{ order: [
				ac,
				"first",
				"last",
				"none",
				Z,
				X
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
				Sc,
				hc
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				Oc,
				_c
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
				oc,
				X
			] }],
			"font-family": [{ font: [
				Cc,
				vc,
				t
			] }],
			"font-features": [{ "font-features": [X] }],
			"fvn-normal": ["normal-nums"],
			"fvn-ordinal": ["ordinal"],
			"fvn-slashed-zero": ["slashed-zero"],
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			tracking: [{ tracking: [
				i,
				Z,
				X
			] }],
			"line-clamp": [{ "line-clamp": [
				Y,
				"none",
				Z,
				gc
			] }],
			leading: [{ leading: [a, ...w()] }],
			"list-image": [{ "list-image": [
				"none",
				Z,
				X
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				Z,
				X
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
			"text-decoration-style": [{ decoration: [...re(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				Y,
				"from-font",
				"auto",
				Z,
				hc
			] }],
			"text-decoration-color": [{ decoration: I() }],
			"underline-offset": [{ "underline-offset": [
				Y,
				"auto",
				Z,
				X
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
				Z,
				X
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
				Z,
				X
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
			"bg-position": [{ bg: L() }],
			"bg-repeat": [{ bg: ee() }],
			"bg-size": [{ bg: te() }],
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
						ac,
						Z,
						X
					],
					radial: [
						"",
						Z,
						X
					],
					conic: [
						ac,
						Z,
						X
					]
				},
				Ec,
				bc
			] }],
			"bg-color": [{ bg: I() }],
			"gradient-from-pos": [{ from: ne() }],
			"gradient-via-pos": [{ via: ne() }],
			"gradient-to-pos": [{ to: ne() }],
			"gradient-from": [{ from: I() }],
			"gradient-via": [{ via: I() }],
			"gradient-to": [{ to: I() }],
			rounded: [{ rounded: R() }],
			"rounded-s": [{ "rounded-s": R() }],
			"rounded-e": [{ "rounded-e": R() }],
			"rounded-t": [{ "rounded-t": R() }],
			"rounded-r": [{ "rounded-r": R() }],
			"rounded-b": [{ "rounded-b": R() }],
			"rounded-l": [{ "rounded-l": R() }],
			"rounded-ss": [{ "rounded-ss": R() }],
			"rounded-se": [{ "rounded-se": R() }],
			"rounded-ee": [{ "rounded-ee": R() }],
			"rounded-es": [{ "rounded-es": R() }],
			"rounded-tl": [{ "rounded-tl": R() }],
			"rounded-tr": [{ "rounded-tr": R() }],
			"rounded-br": [{ "rounded-br": R() }],
			"rounded-bl": [{ "rounded-bl": R() }],
			"border-w": [{ border: z() }],
			"border-w-x": [{ "border-x": z() }],
			"border-w-y": [{ "border-y": z() }],
			"border-w-s": [{ "border-s": z() }],
			"border-w-e": [{ "border-e": z() }],
			"border-w-bs": [{ "border-bs": z() }],
			"border-w-be": [{ "border-be": z() }],
			"border-w-t": [{ "border-t": z() }],
			"border-w-r": [{ "border-r": z() }],
			"border-w-b": [{ "border-b": z() }],
			"border-w-l": [{ "border-l": z() }],
			"divide-x": [{ "divide-x": z() }],
			"divide-x-reverse": ["divide-x-reverse"],
			"divide-y": [{ "divide-y": z() }],
			"divide-y-reverse": ["divide-y-reverse"],
			"border-style": [{ border: [
				...re(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...re(),
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
				...re(),
				"none",
				"hidden"
			] }],
			"outline-offset": [{ "outline-offset": [
				Y,
				Z,
				X
			] }],
			"outline-w": [{ outline: [
				"",
				Y,
				Sc,
				hc
			] }],
			"outline-color": [{ outline: I() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				Dc,
				xc
			] }],
			"shadow-color": [{ shadow: I() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				Dc,
				xc
			] }],
			"inset-shadow-color": [{ "inset-shadow": I() }],
			"ring-w": [{ ring: z() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: I() }],
			"ring-offset-w": [{ "ring-offset": [Y, hc] }],
			"ring-offset-color": [{ "ring-offset": I() }],
			"inset-ring-w": [{ "inset-ring": z() }],
			"inset-ring-color": [{ "inset-ring": I() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				Dc,
				xc
			] }],
			"text-shadow-color": [{ "text-shadow": I() }],
			opacity: [{ opacity: [
				Y,
				Z,
				X
			] }],
			"mix-blend": [{ "mix-blend": [
				...ie(),
				"plus-darker",
				"plus-lighter"
			] }],
			"bg-blend": [{ "bg-blend": ie() }],
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
			"mask-image-linear-pos": [{ "mask-linear": [Y] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": B() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": B() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": I() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": I() }],
			"mask-image-t-from-pos": [{ "mask-t-from": B() }],
			"mask-image-t-to-pos": [{ "mask-t-to": B() }],
			"mask-image-t-from-color": [{ "mask-t-from": I() }],
			"mask-image-t-to-color": [{ "mask-t-to": I() }],
			"mask-image-r-from-pos": [{ "mask-r-from": B() }],
			"mask-image-r-to-pos": [{ "mask-r-to": B() }],
			"mask-image-r-from-color": [{ "mask-r-from": I() }],
			"mask-image-r-to-color": [{ "mask-r-to": I() }],
			"mask-image-b-from-pos": [{ "mask-b-from": B() }],
			"mask-image-b-to-pos": [{ "mask-b-to": B() }],
			"mask-image-b-from-color": [{ "mask-b-from": I() }],
			"mask-image-b-to-color": [{ "mask-b-to": I() }],
			"mask-image-l-from-pos": [{ "mask-l-from": B() }],
			"mask-image-l-to-pos": [{ "mask-l-to": B() }],
			"mask-image-l-from-color": [{ "mask-l-from": I() }],
			"mask-image-l-to-color": [{ "mask-l-to": I() }],
			"mask-image-x-from-pos": [{ "mask-x-from": B() }],
			"mask-image-x-to-pos": [{ "mask-x-to": B() }],
			"mask-image-x-from-color": [{ "mask-x-from": I() }],
			"mask-image-x-to-color": [{ "mask-x-to": I() }],
			"mask-image-y-from-pos": [{ "mask-y-from": B() }],
			"mask-image-y-to-pos": [{ "mask-y-to": B() }],
			"mask-image-y-from-color": [{ "mask-y-from": I() }],
			"mask-image-y-to-color": [{ "mask-y-to": I() }],
			"mask-image-radial": [{ "mask-radial": [Z, X] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": B() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": B() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": I() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": I() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [Y] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": B() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": B() }],
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
			"mask-position": [{ mask: L() }],
			"mask-repeat": [{ mask: ee() }],
			"mask-size": [{ mask: te() }],
			"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
			"mask-image": [{ mask: [
				"none",
				Z,
				X
			] }],
			filter: [{ filter: [
				"",
				"none",
				Z,
				X
			] }],
			blur: [{ blur: ae() }],
			brightness: [{ brightness: [
				Y,
				Z,
				X
			] }],
			contrast: [{ contrast: [
				Y,
				Z,
				X
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				Dc,
				xc
			] }],
			"drop-shadow-color": [{ "drop-shadow": I() }],
			grayscale: [{ grayscale: [
				"",
				Y,
				Z,
				X
			] }],
			"hue-rotate": [{ "hue-rotate": [
				Y,
				Z,
				X
			] }],
			invert: [{ invert: [
				"",
				Y,
				Z,
				X
			] }],
			saturate: [{ saturate: [
				Y,
				Z,
				X
			] }],
			sepia: [{ sepia: [
				"",
				Y,
				Z,
				X
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				Z,
				X
			] }],
			"backdrop-blur": [{ "backdrop-blur": ae() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				Y,
				Z,
				X
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				Y,
				Z,
				X
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				Y,
				Z,
				X
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				Y,
				Z,
				X
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				Y,
				Z,
				X
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				Y,
				Z,
				X
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				Y,
				Z,
				X
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				Y,
				Z,
				X
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
				Z,
				X
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				Y,
				"initial",
				Z,
				X
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				Z,
				X
			] }],
			delay: [{ delay: [
				Y,
				Z,
				X
			] }],
			animate: [{ animate: [
				"none",
				v,
				Z,
				X
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				Z,
				X
			] }],
			"perspective-origin": [{ "perspective-origin": x() }],
			rotate: [{ rotate: oe() }],
			"rotate-x": [{ "rotate-x": oe() }],
			"rotate-y": [{ "rotate-y": oe() }],
			"rotate-z": [{ "rotate-z": oe() }],
			scale: [{ scale: se() }],
			"scale-x": [{ "scale-x": se() }],
			"scale-y": [{ "scale-y": se() }],
			"scale-z": [{ "scale-z": se() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: V() }],
			"skew-x": [{ "skew-x": V() }],
			"skew-y": [{ "skew-y": V() }],
			transform: [{ transform: [
				Z,
				X,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: x() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: ce() }],
			"translate-x": [{ "translate-x": ce() }],
			"translate-y": [{ "translate-y": ce() }],
			"translate-z": [{ "translate-z": ce() }],
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
				Z,
				X
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
				Z,
				X
			] }],
			fill: [{ fill: ["none", ...I()] }],
			"stroke-w": [{ stroke: [
				Y,
				Sc,
				hc,
				gc
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
function Q(...e) {
	return zc(I(e));
}
//#endregion
//#region src/components/ui/button.tsx
var Bc = te("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
function Vc({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ g(r ? $o : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: Q(Bc({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/components/ui/card.tsx
var Hc = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function Uc({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ g("div", {
		"data-slot": "card",
		"data-variant": t,
		className: Q("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", Hc[t], e),
		...n
	});
}
function Wc({ className: e, ...t }) {
	return /* @__PURE__ */ g("div", {
		"data-slot": "card-header",
		className: Q("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function Gc({ className: e, ...t }) {
	return /* @__PURE__ */ g("div", {
		"data-slot": "card-title",
		className: Q("leading-none font-semibold", e),
		...t
	});
}
function Kc({ className: e, ...t }) {
	return /* @__PURE__ */ g("div", {
		"data-slot": "card-description",
		className: Q("text-sm text-muted-foreground", e),
		...t
	});
}
function qc({ className: e, ...t }) {
	return /* @__PURE__ */ g("div", {
		"data-slot": "card-content",
		className: Q("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region src/components/ui/input.tsx
function Jc({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ g("input", {
		type: t,
		"data-slot": "input",
		className: Q("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function Yc({ className: e, ...t }) {
	return /* @__PURE__ */ g(va, {
		"data-slot": "label",
		className: Q("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/components/ui/switch.tsx
function Xc({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ g(gs, {
		"data-slot": "switch",
		"data-size": t,
		className: Q("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", e),
		...n,
		dir: "ltr",
		children: /* @__PURE__ */ g(_s, {
			"data-slot": "switch-thumb",
			className: Q("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
//#endregion
//#region src/components/payments/GatewaySettingsLayout.tsx
function Zc({ title: e, description: t, notice: n, meta: r, sections: i, actions: a, children: o }) {
	let { t: s } = f(), c = async (e) => {
		try {
			await navigator.clipboard.writeText(e), m.success(s("common.copied", { defaultValue: "Copied" }));
		} catch {
			m.error(s("common.copyFailed", { defaultValue: "Copy failed" }));
		}
	};
	return /* @__PURE__ */ g(P, {
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
							}), e.copyable && e.value ? /* @__PURE__ */ g(Vc, {
								type: "button",
								size: "icon",
								variant: "outline",
								className: "size-8 shrink-0",
								onClick: () => void c(e.value),
								children: /* @__PURE__ */ g(N, { className: "size-3.5" })
							}) : null]
						})]
					}, e.label))
				}) : null,
				i.length > 1 ? /* @__PURE__ */ g("nav", {
					className: "flex flex-wrap gap-2",
					"aria-label": e,
					children: i.map((e) => /* @__PURE__ */ g(Vc, {
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
					children: i.map((e) => /* @__PURE__ */ _(Uc, {
						id: e.id,
						className: "scroll-mt-24",
						children: [/* @__PURE__ */ _(Wc, { children: [/* @__PURE__ */ g(Gc, {
							className: "text-base",
							children: e.title
						}), e.description ? /* @__PURE__ */ g(Kc, { children: e.description }) : null] }), /* @__PURE__ */ g(qc, { children: e.children })]
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
function Qc({ label: e, value: t, onChange: n, type: r = "text", placeholder: i, hint: a, className: o }) {
	return /* @__PURE__ */ _("div", {
		className: Q("space-y-2", o),
		children: [
			/* @__PURE__ */ g(Yc, { children: e }),
			/* @__PURE__ */ g(Jc, {
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
function $c({ label: e, description: t, checked: n, onChange: r }) {
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
		}), /* @__PURE__ */ g(Xc, {
			checked: n,
			onCheckedChange: (e) => r(!!e),
			className: "mt-0.5 shrink-0"
		})]
	});
}
function el({ children: e }) {
	return /* @__PURE__ */ g("div", {
		className: "grid gap-4 md:grid-cols-2",
		children: e
	});
}
function tl({ children: e }) {
	return /* @__PURE__ */ g("div", {
		className: "grid gap-3 md:grid-cols-2",
		children: e
	});
}
//#endregion
//#region src/components/data/DumpUi.tsx
function nl({ rows: e, emptyLabel: t = "—", className: n }) {
	return e.length ? /* @__PURE__ */ g("dl", {
		className: Q("divide-border divide-y text-sm", n),
		children: e.map((e, n) => /* @__PURE__ */ _("div", {
			className: "flex flex-wrap items-start justify-between gap-2 py-2",
			children: [/* @__PURE__ */ g("dt", {
				className: "text-muted-foreground",
				children: e.label
			}), /* @__PURE__ */ g("dd", {
				className: "max-w-full break-words text-end font-medium",
				children: e.value ?? t
			})]
		}, n))
	}) : /* @__PURE__ */ g("p", {
		className: "text-muted-foreground text-sm",
		children: t
	});
}
function rl({ data: e, emptyLabel: t }) {
	let n = Object.entries(e ?? {});
	return n.length ? /* @__PURE__ */ g("div", {
		className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
		children: n.map(([e, t]) => {
			let n = Array.isArray(t) ? t.map(String) : [String(t)];
			return /* @__PURE__ */ _("div", {
				className: "bg-muted/40 rounded-lg border p-3",
				children: [/* @__PURE__ */ g("p", {
					className: "mb-2 text-sm font-medium capitalize",
					children: e
				}), /* @__PURE__ */ g("ul", {
					className: "text-muted-foreground space-y-1 text-xs",
					children: n.map((e) => /* @__PURE__ */ _("li", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ g("span", { className: "text-primary mt-1 size-1.5 shrink-0 rounded-full bg-current" }), /* @__PURE__ */ g("span", { children: e.replace(/_/g, " ") })]
					}, e))
				})]
			}, e);
		})
	}) : /* @__PURE__ */ g("p", {
		className: "text-muted-foreground text-sm",
		children: t
	});
}
//#endregion
//#region src/hooks/use-text-direction.ts
function il() {
	let { i18n: e } = f();
	return e.dir() === "rtl" ? "rtl" : "ltr";
}
//#endregion
//#region src/components/ui/select.tsx
function al({ ...e }) {
	return /* @__PURE__ */ g(Bo, {
		"data-slot": "select",
		...e
	});
}
function ol({ ...e }) {
	return /* @__PURE__ */ g(Ho, {
		"data-slot": "select-value",
		...e
	});
}
function sl({ className: e, size: t = "default", children: n, ...r }) {
	return /* @__PURE__ */ _(Vo, {
		"data-slot": "select-trigger",
		"data-size": t,
		dir: il(),
		className: Q("flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap text-start shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", e),
		...r,
		children: [n, /* @__PURE__ */ g(Uo, {
			asChild: !0,
			children: /* @__PURE__ */ g(j, { className: "size-4 opacity-50" })
		})]
	});
}
function cl({ className: e, children: t, position: n = "popper", align: r = "start", ...i }) {
	return /* @__PURE__ */ g(Cn, {
		allowBodyScroll: !0,
		children: /* @__PURE__ */ g(Wo, { children: /* @__PURE__ */ _(Go, {
			"data-slot": "select-content",
			dir: il(),
			className: Q("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-start text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", e),
			position: n,
			align: r,
			...i,
			children: [
				/* @__PURE__ */ g(ul, {}),
				/* @__PURE__ */ g(Ko, {
					className: Q("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
					children: t
				}),
				/* @__PURE__ */ g(dl, {})
			]
		}) })
	});
}
function ll({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ _(qo, {
		"data-slot": "select-item",
		className: Q("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pe-8 ps-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", e),
		...n,
		children: [/* @__PURE__ */ g("span", {
			"data-slot": "select-item-indicator",
			className: "absolute end-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ g(Yo, { children: /* @__PURE__ */ g(A, { className: "size-4" }) })
		}), /* @__PURE__ */ g(Jo, { children: t })]
	});
}
function ul({ className: e, ...t }) {
	return /* @__PURE__ */ g(Xo, {
		"data-slot": "select-scroll-up-button",
		className: Q("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ g(M, { className: "size-4" })
	});
}
function dl({ className: e, ...t }) {
	return /* @__PURE__ */ g(Zo, {
		"data-slot": "select-scroll-down-button",
		className: Q("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ g(j, { className: "size-4" })
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
var $ = class extends Error {
	constructor(e, t) {
		super(e), gl(this, "code", void 0), gl(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, _l = {
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
function vl(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function yl(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function bl(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(fl(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function xl(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return bl(e, n);
	if (t instanceof $ && t.code) {
		let n = _l[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = _l[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return vl(n) ? e("errors.api.timeout") : yl(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function Sl(e, t) {
	m.error(xl(e, t));
}
//#endregion
//#region src/lib/safeUrl.ts
function Cl(e) {
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
function wl() {
	return window.webinoDashboard;
}
var Tl = 3e4;
function El(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function Dl(e) {
	let t = wl();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (El(e) || Cl(e)) return e;
	throw new $("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function Ol(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function kl(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : /^(payments|torobpay|snapppay|digipay|zarinpal|bale-pay|wallet|c2c)(\/|$)/.test(t) ? "webino_dashboard_payments_rest" : null;
}
function Al(e, t) {
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
function jl(e, t) {
	let n = e.toLowerCase();
	return e.includes("Upstream Error") || e.includes("Forbidden") || t === 403 ? "admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry" : n.includes("timed out") || n.includes("timeout") || t === 504 || t === 524 ? "Request timed out — RSA-4096 generation can take over a minute on weak hosts" : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? `Invalid AJAX response (HTML, HTTP ${t || 0})` : `Invalid AJAX response (HTTP ${t || 0})`;
}
async function Ml(e, t, n = {}) {
	let r = kl(e), i = wl();
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
	let { signal: l, clear: u } = Ol({}, t);
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
			throw new $(jl(t, e.status), {
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
async function Nl(e, t = {}, n = Tl) {
	if (kl(e) && wl().ajaxUrl) return Ml(e, n, t);
	let r = Dl(e), i = wl(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce), !Object.keys(a).some((e) => e.toLowerCase() === "content-type") && typeof t.body == "string" && t.body.length > 0 && (a["Content-Type"] = "application/json");
	let { signal: s, clear: c } = Ol(t, n);
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
			let t = Al(n, e.status);
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
//#region ../Modules/zarinpal-gateway-module/client/pages/zarinpal/ZarinpalSettingsPage.tsx
function Pl({ label: e, value: t, onChange: n, type: r = "text", placeholder: i }) {
	return /* @__PURE__ */ _("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ g(Yc, { children: e }), /* @__PURE__ */ g(Jc, {
			type: r,
			value: t,
			placeholder: i,
			onChange: (e) => n(e.target.value)
		})]
	});
}
function Fl({ label: e, value: t, onChange: n, hint: r }) {
	return /* @__PURE__ */ _("div", {
		className: "space-y-2 md:col-span-2",
		children: [
			/* @__PURE__ */ g(Yc, { children: e }),
			/* @__PURE__ */ g("textarea", {
				className: "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
				value: t,
				onChange: (e) => n(e.target.value)
			}),
			r ? /* @__PURE__ */ g("p", {
				className: "text-muted-foreground text-xs",
				children: r
			}) : null
		]
	});
}
function Il() {
	let { t: r } = f(), i = n(), a = p().pathname, o = a.endsWith("/payments"), s = a.endsWith("/operations"), c = a.endsWith("/coverage"), l = !o && !s && !c, v = t({
		queryKey: ["zarinpal", "settings"],
		queryFn: async () => Nl("zarinpal/settings")
	}), y = t({
		queryKey: ["zarinpal", "status"],
		queryFn: async () => Nl("zarinpal/status"),
		enabled: s || l
	}), b = t({
		queryKey: ["zarinpal", "coverage"],
		queryFn: async () => Nl("zarinpal/coverage/endpoints"),
		enabled: l || c
	}), [x, S] = d(null), [C, w] = d(""), [T, E] = d(""), [D, O] = d(null), k = u(() => {
		let e = v.data?.settings;
		return e ? x || (S({
			...e,
			access_token: ""
		}), {
			...e,
			access_token: ""
		}) : x;
	}, [v.data?.settings, x]), A = e({
		mutationFn: async () => Nl("zarinpal/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(k)
		}),
		onSuccess: async (e) => {
			m.success(r("common.saved")), S({
				...e.settings,
				access_token: ""
			}), await i.invalidateQueries({ queryKey: ["zarinpal", "settings"] }), await i.invalidateQueries({ queryKey: ["payment-gateways"] });
		},
		onError: (e) => Sl(r, e)
	}), j = e({
		mutationFn: async () => Nl("zarinpal/test-connection", { method: "POST" }),
		onSuccess: () => m.success(r("zarinpal.testSuccess")),
		onError: (e) => Sl(r, e)
	}), M = e({
		mutationFn: async () => Nl("zarinpal/reconcile", { method: "POST" }),
		onSuccess: async (e) => {
			m.success(r("zarinpal.reconcileDone", {
				completed: e.result?.completed ?? 0,
				matched: e.result?.matched ?? 0
			})), await i.invalidateQueries({ queryKey: ["zarinpal", "status"] });
		},
		onError: (e) => Sl(r, e)
	}), N = e({
		mutationFn: async () => Nl("zarinpal/lookup", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				authority: C || void 0,
				order_id: T ? Number(T) : void 0
			})
		}),
		onSuccess: (e) => {
			O(e.lookup), m.success(r("zarinpal.lookupSuccess"));
		},
		onError: (e) => Sl(r, e)
	}), F = r(o ? "zarinpal.paymentsTitle" : s ? "zarinpal.operationsTitle" : c ? "zarinpal.coverageTitle" : "zarinpal.title"), I = r(o ? "zarinpal.paymentsSubtitle" : s ? "zarinpal.operationsSubtitle" : "zarinpal.settingsSubtitle");
	return v.isLoading || !k ? /* @__PURE__ */ g(P, {
		title: F,
		subtitle: I,
		children: /* @__PURE__ */ g("div", { children: r("common.loading") })
	}) : l ? /* @__PURE__ */ g(Zc, {
		title: r("zarinpal.title"),
		description: r("zarinpal.settingsSubtitle"),
		meta: [{
			label: r("gateway.meta.callback"),
			value: k.callback_url || "",
			copyable: !0
		}, {
			label: r("zarinpal.apiBase"),
			value: String(k.api_base ?? "")
		}],
		sections: [{
			id: "connection",
			title: r("gateway.section.connection"),
			children: /* @__PURE__ */ _("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ _(tl, { children: [/* @__PURE__ */ g($c, {
					label: r("zarinpal.gatewayEnabled"),
					checked: k.gateway_enabled,
					onChange: (e) => S((t) => ({
						...t,
						gateway_enabled: e
					}))
				}), /* @__PURE__ */ g($c, {
					label: r("zarinpal.sandbox"),
					description: r("zarinpal.sandboxHint"),
					checked: k.sandbox,
					onChange: (e) => S((t) => ({
						...t,
						sandbox: e
					}))
				})] }), /* @__PURE__ */ _(el, { children: [
					/* @__PURE__ */ g(Qc, {
						label: r("zarinpal.merchantId"),
						value: k.merchant_id,
						onChange: (e) => S((t) => ({
							...t,
							merchant_id: e
						}))
					}),
					/* @__PURE__ */ g(Qc, {
						label: r("zarinpal.accessToken"),
						type: "password",
						value: k.access_token ?? "",
						placeholder: k.has_access_token ? "••••••••" : "",
						onChange: (e) => S((t) => ({
							...t,
							access_token: e
						}))
					}),
					/* @__PURE__ */ g(Qc, {
						className: "md:col-span-2",
						label: r("zarinpal.callbackUrl"),
						value: k.callback_url,
						onChange: (e) => S((t) => ({
							...t,
							callback_url: e
						}))
					})
				] })]
			})
		}],
		actions: /* @__PURE__ */ _(h, { children: [/* @__PURE__ */ g(Vc, {
			onClick: () => void A.mutate(),
			disabled: A.isPending,
			children: r("common.save")
		}), /* @__PURE__ */ g(Vc, {
			variant: "outline",
			onClick: () => void j.mutate(),
			disabled: j.isPending,
			children: r("zarinpal.testConnection")
		})] })
	}) : /* @__PURE__ */ _(P, {
		title: F,
		subtitle: I,
		children: [
			null,
			o ? /* @__PURE__ */ _("section", {
				className: "space-y-4 rounded-lg border border-border p-4",
				children: [/* @__PURE__ */ _("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [
						/* @__PURE__ */ g(Pl, {
							label: r("zarinpal.fieldTitle"),
							value: k.title,
							onChange: (e) => S((t) => ({
								...t,
								title: e
							}))
						}),
						/* @__PURE__ */ _("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ g(Yc, { children: r("zarinpal.feePayer") }), /* @__PURE__ */ _(al, {
								value: k.fee_payer,
								onValueChange: (e) => S((t) => ({
									...t,
									fee_payer: e
								})),
								children: [/* @__PURE__ */ g(sl, { children: /* @__PURE__ */ g(ol, {}) }), /* @__PURE__ */ _(cl, { children: [/* @__PURE__ */ g(ll, {
									value: "merchant",
									children: r("zarinpal.feePayerMerchant")
								}), /* @__PURE__ */ g(ll, {
									value: "customer",
									children: r("zarinpal.feePayerCustomer")
								})] })]
							})]
						}),
						/* @__PURE__ */ g(Pl, {
							label: r("zarinpal.orderButtonText"),
							value: k.order_button_text ?? "",
							onChange: (e) => S((t) => ({
								...t,
								order_button_text: e
							}))
						}),
						/* @__PURE__ */ g(Pl, {
							label: r("zarinpal.feeLabel"),
							value: k.fee_label ?? "",
							onChange: (e) => S((t) => ({
								...t,
								fee_label: e
							}))
						}),
						/* @__PURE__ */ _("div", {
							className: "space-y-2 md:col-span-2",
							children: [/* @__PURE__ */ g(Yc, { children: r("zarinpal.iconUrl") }), /* @__PURE__ */ _("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ g("img", {
									src: k.icon_url?.trim() || k.resolved_icon_url || k.default_icon_url || "",
									alt: "",
									className: "h-10 w-10 shrink-0 rounded border border-border object-contain bg-background"
								}), /* @__PURE__ */ _("div", {
									className: "min-w-0 flex-1 space-y-1",
									children: [/* @__PURE__ */ g(Jc, {
										type: "url",
										value: k.icon_url ?? "",
										placeholder: r("zarinpal.iconUrlPlaceholder"),
										onChange: (e) => S((t) => ({
											...t,
											icon_url: e.target.value
										}))
									}), /* @__PURE__ */ g("p", {
										className: "text-muted-foreground text-xs",
										children: r("zarinpal.iconUrlHint")
									})]
								})]
							})]
						}),
						/* @__PURE__ */ g(Fl, {
							label: r("zarinpal.fieldDescription"),
							value: k.description,
							onChange: (e) => S((t) => ({
								...t,
								description: e
							}))
						}),
						/* @__PURE__ */ g(Fl, {
							label: r("zarinpal.fieldInstructions"),
							value: k.instructions,
							onChange: (e) => S((t) => ({
								...t,
								instructions: e
							}))
						}),
						/* @__PURE__ */ g(Pl, {
							label: r("zarinpal.paymentDescription"),
							value: k.payment_description ?? "",
							onChange: (e) => S((t) => ({
								...t,
								payment_description: e
							})),
							placeholder: "{order_id}"
						}),
						/* @__PURE__ */ g("p", {
							className: "text-muted-foreground -mt-2 text-xs md:col-span-2",
							children: r("zarinpal.paymentDescriptionHint")
						}),
						/* @__PURE__ */ g(Fl, {
							label: r("zarinpal.successMessage"),
							value: k.success_message,
							onChange: (e) => S((t) => ({
								...t,
								success_message: e
							})),
							hint: r("zarinpal.successHint")
						}),
						/* @__PURE__ */ g(Fl, {
							label: r("zarinpal.failedMessage"),
							value: k.failed_message,
							onChange: (e) => S((t) => ({
								...t,
								failed_message: e
							})),
							hint: r("zarinpal.failedHint")
						}),
						/* @__PURE__ */ g(Fl, {
							label: r("zarinpal.cancelledMessage"),
							value: k.cancelled_message ?? "",
							onChange: (e) => S((t) => ({
								...t,
								cancelled_message: e
							})),
							hint: r("zarinpal.cancelledHint")
						}),
						/* @__PURE__ */ g(Fl, {
							label: r("zarinpal.invalidTokenMessage"),
							value: k.invalid_token_message ?? "",
							onChange: (e) => S((t) => ({
								...t,
								invalid_token_message: e
							})),
							hint: r("zarinpal.invalidTokenHint")
						})
					]
				}), /* @__PURE__ */ g(Vc, {
					onClick: () => void A.mutate(),
					disabled: A.isPending,
					children: r("common.save")
				})]
			}) : null,
			s ? /* @__PURE__ */ _("div", {
				className: "grid gap-4",
				children: [/* @__PURE__ */ _("section", {
					className: "space-y-3 rounded-lg border border-border p-4",
					children: [
						/* @__PURE__ */ g("h3", {
							className: "text-sm font-semibold",
							children: r("zarinpal.reconcile")
						}),
						/* @__PURE__ */ g("p", {
							className: "text-muted-foreground text-sm",
							children: r("zarinpal.reconcileHelp")
						}),
						/* @__PURE__ */ g(Vc, {
							onClick: () => void M.mutate(),
							disabled: M.isPending,
							children: r("zarinpal.reconcile")
						}),
						y.data?.last_reconcile ? /* @__PURE__ */ g(nl, {
							emptyLabel: r("common.empty"),
							rows: [
								{
									label: r("zarinpal.lastChecked"),
									value: String(y.data.last_reconcile.checked_at ?? "—")
								},
								{
									label: r("zarinpal.authorities"),
									value: String(y.data.last_reconcile.authorities ?? 0)
								},
								{
									label: r("zarinpal.matched"),
									value: String(y.data.last_reconcile.matched ?? 0)
								},
								{
									label: r("zarinpal.completed"),
									value: String(y.data.last_reconcile.completed ?? 0)
								},
								{
									label: r("zarinpal.skipped"),
									value: String(y.data.last_reconcile.skipped ?? 0)
								}
							]
						}) : null,
						/* @__PURE__ */ _("div", { children: [/* @__PURE__ */ g("h4", {
							className: "mb-2 text-xs font-medium uppercase text-muted-foreground",
							children: r("zarinpal.queue")
						}), (y.data?.jobs ?? []).length === 0 ? /* @__PURE__ */ g("p", {
							className: "text-sm text-muted-foreground",
							children: r("common.empty")
						}) : /* @__PURE__ */ g("ul", {
							className: "space-y-1 text-sm",
							children: (y.data?.jobs ?? []).map((e) => /* @__PURE__ */ _("li", { children: [
								e.type,
								" — ",
								(/* @__PURE__ */ new Date(e.run_after * 1e3)).toISOString()
							] }, e.id))
						})] })
					]
				}), /* @__PURE__ */ _("section", {
					className: "space-y-3 rounded-lg border border-border p-4",
					children: [
						/* @__PURE__ */ g("h3", {
							className: "text-sm font-semibold",
							children: r("zarinpal.lookupTitle")
						}),
						/* @__PURE__ */ _("div", {
							className: "grid gap-4 md:grid-cols-2",
							children: [/* @__PURE__ */ g(Pl, {
								label: r("zarinpal.authority"),
								value: C,
								onChange: w
							}), /* @__PURE__ */ g(Pl, {
								label: r("zarinpal.orderId"),
								value: T,
								onChange: E
							})]
						}),
						/* @__PURE__ */ g(Vc, {
							onClick: () => void N.mutate(),
							disabled: N.isPending,
							children: r("zarinpal.lookup")
						}),
						D ? /* @__PURE__ */ g("pre", {
							className: "max-h-80 overflow-auto rounded-md border bg-muted/40 p-3 text-xs",
							children: JSON.stringify(D, null, 2)
						}) : null
					]
				})]
			}) : null,
			c ? /* @__PURE__ */ _("section", {
				className: "rounded-lg border border-border p-4",
				children: [/* @__PURE__ */ g("p", {
					className: "mb-3 text-sm text-muted-foreground",
					children: r("zarinpal.coverageMoved")
				}), b.data ? /* @__PURE__ */ g(rl, {
					data: b.data,
					emptyLabel: r("common.empty")
				}) : /* @__PURE__ */ g("div", { children: r("common.loading") })]
			}) : null
		]
	});
}
//#endregion
//#region ../Modules/zarinpal-gateway-module/client/module-entry.tsx
var Ll = {
	"settings/shop/zarinpal": Il,
	"settings/shop/zarinpal/payments": Il,
	"settings/shop/zarinpal/operations": Il,
	"settings/shop/zarinpal/coverage": Il
}, Rl = { routes: Ll };
//#endregion
export { Rl as default, Ll as routes };
