import { useMutation as e, useQuery as t, useQueryClient as n } from "@tanstack/react-query";
import * as r from "react";
import i, { createContext as a, createElement as o, forwardRef as s, useContext as c, useLayoutEffect as l, useMemo as u, useState as d } from "react";
import { Link as f, Navigate as p, useLocation as m, useParams as h } from "react-router-dom";
import { useTranslation as g } from "react-i18next";
import { toast as _ } from "sonner";
import { Fragment as v, jsx as y, jsxs as b } from "react/jsx-runtime";
import * as x from "react-dom";
import S from "react-dom";
//#region src/components/PageShell.tsx
function C({ title: e, description: t, eyebrow: n, children: r }) {
	return /* @__PURE__ */ b("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ b("header", {
			className: "min-w-0 space-y-1.5",
			children: [
				n ? /* @__PURE__ */ y("p", {
					className: "text-muted-foreground text-xs font-medium tracking-wide uppercase",
					children: n
				}) : null,
				/* @__PURE__ */ y("h1", {
					className: "text-xl font-semibold tracking-tight sm:text-2xl",
					children: e
				}),
				t ? /* @__PURE__ */ y("p", {
					className: "text-muted-foreground max-w-2xl text-sm leading-relaxed",
					children: t
				}) : null
			]
		}), r]
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function w(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") if (Array.isArray(e)) {
		var i = e.length;
		for (t = 0; t < i; t++) e[t] && (n = w(e[t])) && (r && (r += " "), r += n);
	} else for (n in e) e[n] && (r && (r += " "), r += n);
	return r;
}
function T() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = w(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/class-variance-authority/dist/index.mjs
var E = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, D = T, O = (e, t) => (n) => {
	if (t?.variants == null) return D(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = E(t) || E(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return D(e, a, t?.compoundVariants?.reduce((e, t) => {
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
function k(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function A(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = k(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : k(e[t], null);
			}
		};
	};
}
function j(...e) {
	return r.useCallback(A(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function M(e) {
	let t = /* @__PURE__ */ N(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(ee);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ y(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ y(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function N(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = te(n), a = F(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? A(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var P = Symbol("radix.slottable");
function ee(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === P;
}
function F(e, t) {
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
function te(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/dist/index.mjs
var I = [
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
	let n = /* @__PURE__ */ M(`Primitive.${t}`), i = r.forwardRef((e, r) => {
		let { asChild: i, ...a } = e, o = i ? n : t;
		return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ y(o, {
			...a,
			ref: r
		});
	});
	return i.displayName = `Primitive.${t}`, {
		...e,
		[t]: i
	};
}, {});
function ne(e, t) {
	e && x.flushSync(() => e.dispatchEvent(t));
}
//#endregion
//#region node_modules/@radix-ui/react-visually-hidden/dist/index.mjs
var re = Object.freeze({
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
}), L = "VisuallyHidden", R = r.forwardRef((e, t) => /* @__PURE__ */ y(I.span, {
	...e,
	ref: t,
	style: {
		...re,
		...e.style
	}
}));
R.displayName = L;
//#endregion
//#region node_modules/@radix-ui/react-context/dist/index.mjs
function ie(e, t = []) {
	let n = [];
	function i(t, i) {
		let a = r.createContext(i), o = n.length;
		n = [...n, i];
		let s = (t) => {
			let { scope: n, children: i, ...s } = t, c = n?.[e]?.[o] || a, l = r.useMemo(() => s, Object.values(s));
			return /* @__PURE__ */ y(c.Provider, {
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
	return a.scopeName = e, [i, ae(a, ...t)];
}
function ae(...e) {
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
function z(e) {
	let t = /* @__PURE__ */ oe(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(ce);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ y(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ y(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function oe(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = ue(n), a = le(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? A(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var se = Symbol("radix.slottable");
function ce(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === se;
}
function le(e, t) {
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
function ue(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function de(e) {
	let t = e + "CollectionProvider", [n, r] = ie(t), [a, o] = n(t, {
		collectionRef: { current: null },
		itemMap: /* @__PURE__ */ new Map()
	}), s = (e) => {
		let { scope: t, children: n } = e, r = i.useRef(null), o = i.useRef(/* @__PURE__ */ new Map()).current;
		return /* @__PURE__ */ y(a, {
			scope: t,
			itemMap: o,
			collectionRef: r,
			children: n
		});
	};
	s.displayName = t;
	let c = e + "CollectionSlot", l = /* @__PURE__ */ z(c), u = i.forwardRef((e, t) => {
		let { scope: n, children: r } = e;
		return /* @__PURE__ */ y(l, {
			ref: j(t, o(c, n).collectionRef),
			children: r
		});
	});
	u.displayName = c;
	let d = e + "CollectionItemSlot", f = "data-radix-collection-item", p = /* @__PURE__ */ z(d), m = i.forwardRef((e, t) => {
		let { scope: n, children: r, ...a } = e, s = i.useRef(null), c = j(t, s), l = o(d, n);
		return i.useEffect(() => (l.itemMap.set(s, {
			ref: s,
			...a
		}), () => void l.itemMap.delete(s))), /* @__PURE__ */ y(p, {
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
var V = globalThis?.document ? r.useLayoutEffect : () => {}, fe = r.useInsertionEffect || V;
function pe({ prop: e, defaultProp: t, onChange: n = () => {}, caller: i }) {
	let [a, o, s] = me({
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
			let n = he(t) ? t(e) : t;
			n !== e && s.current?.(n);
		} else o(t);
	}, [
		c,
		e,
		o,
		s
	])];
}
function me({ defaultProp: e, onChange: t }) {
	let [n, i] = r.useState(e), a = r.useRef(n), o = r.useRef(t);
	return fe(() => {
		o.current = t;
	}, [t]), r.useEffect(() => {
		a.current !== n && (o.current?.(n), a.current = n);
	}, [n, a]), [
		n,
		i,
		o
	];
}
function he(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/@radix-ui/react-presence/dist/index.mjs
function ge(e, t) {
	return r.useReducer((e, n) => t[e][n] ?? e, e);
}
var _e = (e) => {
	let { present: t, children: n } = e, i = ve(t), a = typeof n == "function" ? n({ present: i.isPresent }) : r.Children.only(n), o = j(i.ref, be(a));
	return typeof n == "function" || i.isPresent ? r.cloneElement(a, { ref: o }) : null;
};
_e.displayName = "Presence";
function ve(e) {
	let [t, n] = r.useState(), i = r.useRef(null), a = r.useRef(e), o = r.useRef("none"), [s, c] = ge(e ? "mounted" : "unmounted", {
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
		let e = ye(i.current);
		o.current = s === "mounted" ? e : "none";
	}, [s]), V(() => {
		let t = i.current, n = a.current;
		if (n !== e) {
			let r = o.current, i = ye(t);
			e ? c("MOUNT") : i === "none" || t?.display === "none" ? c("UNMOUNT") : c(n && r !== i ? "ANIMATION_OUT" : "UNMOUNT"), a.current = e;
		}
	}, [e, c]), V(() => {
		if (t) {
			let e, n = t.ownerDocument.defaultView ?? window, r = (r) => {
				let o = ye(i.current).includes(CSS.escape(r.animationName));
				if (r.target === t && o && (c("ANIMATION_END"), !a.current)) {
					let r = t.style.animationFillMode;
					t.style.animationFillMode = "forwards", e = n.setTimeout(() => {
						t.style.animationFillMode === "forwards" && (t.style.animationFillMode = r);
					});
				}
			}, s = (e) => {
				e.target === t && (o.current = ye(i.current));
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
function ye(e) {
	return e?.animationName || "none";
}
function be(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-id/dist/index.mjs
var xe = r.useId || (() => void 0), Se = 0;
function Ce(e) {
	let [t, n] = r.useState(xe());
	return V(() => {
		e || n((e) => e ?? String(Se++));
	}, [e]), e || (t ? `radix-${t}` : "");
}
//#endregion
//#region node_modules/@radix-ui/react-direction/dist/index.mjs
var we = r.createContext(void 0);
function Te(e) {
	let t = r.useContext(we);
	return e || t || "ltr";
}
//#endregion
//#region node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
function Ee(e) {
	let t = r.useRef(e);
	return r.useEffect(() => {
		t.current = e;
	}), r.useMemo(() => (...e) => t.current?.(...e), []);
}
//#endregion
//#region node_modules/@radix-ui/react-use-escape-keydown/dist/index.mjs
function De(e, t = globalThis?.document) {
	let n = Ee(e);
	r.useEffect(() => {
		let e = (e) => {
			e.key === "Escape" && n(e);
		};
		return t.addEventListener("keydown", e, { capture: !0 }), () => t.removeEventListener("keydown", e, { capture: !0 });
	}, [n, t]);
}
//#endregion
//#region node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var Oe = "DismissableLayer", ke = "dismissableLayer.update", Ae = "dismissableLayer.pointerDownOutside", je = "dismissableLayer.focusOutside", Me, Ne = r.createContext({
	layers: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), Pe = r.forwardRef((e, t) => {
	let { disableOutsidePointerEvents: n = !1, onEscapeKeyDown: i, onPointerDownOutside: a, onFocusOutside: o, onInteractOutside: s, onDismiss: c, ...l } = e, u = r.useContext(Ne), [d, f] = r.useState(null), p = d?.ownerDocument ?? globalThis?.document, [, m] = r.useState({}), h = j(t, (e) => f(e)), g = Array.from(u.layers), [_] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1), v = g.indexOf(_), b = d ? g.indexOf(d) : -1, x = u.layersWithOutsidePointerEventsDisabled.size > 0, S = b >= v, C = Le((e) => {
		let t = e.target, n = [...u.branches].some((e) => e.contains(t));
		!S || n || (a?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p), w = Re((e) => {
		let t = e.target;
		[...u.branches].some((e) => e.contains(t)) || (o?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p);
	return De((e) => {
		b === u.layers.size - 1 && (i?.(e), !e.defaultPrevented && c && (e.preventDefault(), c()));
	}, p), r.useEffect(() => {
		if (d) return n && (u.layersWithOutsidePointerEventsDisabled.size === 0 && (Me = p.body.style.pointerEvents, p.body.style.pointerEvents = "none"), u.layersWithOutsidePointerEventsDisabled.add(d)), u.layers.add(d), ze(), () => {
			n && u.layersWithOutsidePointerEventsDisabled.size === 1 && (p.body.style.pointerEvents = Me);
		};
	}, [
		d,
		p,
		n,
		u
	]), r.useEffect(() => () => {
		d && (u.layers.delete(d), u.layersWithOutsidePointerEventsDisabled.delete(d), ze());
	}, [d, u]), r.useEffect(() => {
		let e = () => m({});
		return document.addEventListener(ke, e), () => document.removeEventListener(ke, e);
	}, []), /* @__PURE__ */ y(I.div, {
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
Pe.displayName = Oe;
var Fe = "DismissableLayerBranch", Ie = r.forwardRef((e, t) => {
	let n = r.useContext(Ne), i = r.useRef(null), a = j(t, i);
	return r.useEffect(() => {
		let e = i.current;
		if (e) return n.branches.add(e), () => {
			n.branches.delete(e);
		};
	}, [n.branches]), /* @__PURE__ */ y(I.div, {
		...e,
		ref: a
	});
});
Ie.displayName = Fe;
function Le(e, t = globalThis?.document) {
	let n = Ee(e), i = r.useRef(!1), a = r.useRef(() => {});
	return r.useEffect(() => {
		let e = (e) => {
			if (e.target && !i.current) {
				let r = function() {
					Be(Ae, n, i, { discrete: !0 });
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
function Re(e, t = globalThis?.document) {
	let n = Ee(e), i = r.useRef(!1);
	return r.useEffect(() => {
		let e = (e) => {
			e.target && !i.current && Be(je, n, { originalEvent: e }, { discrete: !1 });
		};
		return t.addEventListener("focusin", e), () => t.removeEventListener("focusin", e);
	}, [t, n]), {
		onFocusCapture: () => i.current = !0,
		onBlurCapture: () => i.current = !1
	};
}
function ze() {
	let e = new CustomEvent(ke);
	document.dispatchEvent(e);
}
function Be(e, t, n, { discrete: r }) {
	let i = n.originalEvent.target, a = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && i.addEventListener(e, t, { once: !0 }), r ? ne(i, a) : i.dispatchEvent(a);
}
//#endregion
//#region node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var Ve = "focusScope.autoFocusOnMount", He = "focusScope.autoFocusOnUnmount", Ue = {
	bubbles: !1,
	cancelable: !0
}, We = "FocusScope", Ge = r.forwardRef((e, t) => {
	let { loop: n = !1, trapped: i = !1, onMountAutoFocus: a, onUnmountAutoFocus: o, ...s } = e, [c, l] = r.useState(null), u = Ee(a), d = Ee(o), f = r.useRef(null), p = j(t, (e) => l(e)), m = r.useRef({
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
				c.contains(t) ? f.current = t : Qe(f.current, { select: !0 });
			}, t = function(e) {
				if (m.paused || !c) return;
				let t = e.relatedTarget;
				t !== null && (c.contains(t) || Qe(f.current, { select: !0 }));
			}, n = function(e) {
				if (document.activeElement === document.body) for (let t of e) t.removedNodes.length > 0 && Qe(c);
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
			$e.add(m);
			let e = document.activeElement;
			if (!c.contains(e)) {
				let t = new CustomEvent(Ve, Ue);
				c.addEventListener(Ve, u), c.dispatchEvent(t), t.defaultPrevented || (Ke(nt(Je(c)), { select: !0 }), document.activeElement === e && Qe(c));
			}
			return () => {
				c.removeEventListener(Ve, u), setTimeout(() => {
					let t = new CustomEvent(He, Ue);
					c.addEventListener(He, d), c.dispatchEvent(t), t.defaultPrevented || Qe(e ?? document.body, { select: !0 }), c.removeEventListener(He, d), $e.remove(m);
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
			let t = e.currentTarget, [i, a] = qe(t);
			i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n && Qe(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n && Qe(a, { select: !0 })) : r === t && e.preventDefault();
		}
	}, [
		n,
		i,
		m.paused
	]);
	return /* @__PURE__ */ y(I.div, {
		tabIndex: -1,
		...s,
		ref: p,
		onKeyDown: h
	});
});
Ge.displayName = We;
function Ke(e, { select: t = !1 } = {}) {
	let n = document.activeElement;
	for (let r of e) if (Qe(r, { select: t }), document.activeElement !== n) return;
}
function qe(e) {
	let t = Je(e);
	return [Ye(t, e), Ye(t.reverse(), e)];
}
function Je(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t;
}
function Ye(e, t) {
	for (let n of e) if (!Xe(n, { upTo: t })) return n;
}
function Xe(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function Ze(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function Qe(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = document.activeElement;
		e.focus({ preventScroll: !0 }), e !== n && Ze(e) && t && e.select();
	}
}
var $e = et();
function et() {
	let e = [];
	return {
		add(t) {
			let n = e[0];
			t !== n && n?.pause(), e = tt(e, t), e.unshift(t);
		},
		remove(t) {
			e = tt(e, t), e[0]?.resume();
		}
	};
}
function tt(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
function nt(e) {
	return e.filter((e) => e.tagName !== "A");
}
//#endregion
//#region node_modules/@radix-ui/react-portal/dist/index.mjs
var rt = "Portal", it = r.forwardRef((e, t) => {
	let { container: n, ...i } = e, [a, o] = r.useState(!1);
	V(() => o(!0), []);
	let s = n || a && globalThis?.document?.body;
	return s ? S.createPortal(/* @__PURE__ */ y(I.div, {
		...i,
		ref: t
	}), s) : null;
});
it.displayName = rt;
//#endregion
//#region node_modules/@radix-ui/react-focus-guards/dist/index.mjs
var at = 0;
function ot() {
	r.useEffect(() => {
		let e = document.querySelectorAll("[data-radix-focus-guard]");
		return document.body.insertAdjacentElement("afterbegin", e[0] ?? st()), document.body.insertAdjacentElement("beforeend", e[1] ?? st()), at++, () => {
			at === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((e) => e.remove()), at--;
		};
	}, []);
}
function st() {
	let e = document.createElement("span");
	return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
//#endregion
//#region node_modules/tslib/tslib.es6.mjs
var ct = function() {
	return ct = Object.assign || function(e) {
		for (var t, n = 1, r = arguments.length; n < r; n++) for (var i in t = arguments[n], t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
		return e;
	}, ct.apply(this, arguments);
};
function lt(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
function ut(e, t, n) {
	if (n || arguments.length === 2) for (var r = 0, i = t.length, a; r < i; r++) (a || !(r in t)) && (a || (a = Array.prototype.slice.call(t, 0, r)), a[r] = t[r]);
	return e.concat(a || Array.prototype.slice.call(t));
}
//#endregion
//#region node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var dt = "right-scroll-bar-position", ft = "width-before-scroll-bar", pt = "with-scroll-bars-hidden", mt = "--removed-body-scroll-bar-size";
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/assignRef.js
function ht(e, t) {
	return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/useRef.js
function gt(e, t) {
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
var _t = typeof window < "u" ? r.useLayoutEffect : r.useEffect, vt = /* @__PURE__ */ new WeakMap();
function yt(e, t) {
	var n = gt(t || null, function(t) {
		return e.forEach(function(e) {
			return ht(e, t);
		});
	});
	return _t(function() {
		var t = vt.get(n);
		if (t) {
			var r = new Set(t), i = new Set(e), a = n.current;
			r.forEach(function(e) {
				i.has(e) || ht(e, null);
			}), i.forEach(function(e) {
				r.has(e) || ht(e, a);
			});
		}
		vt.set(n, e);
	}, [e]), n;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/medium.js
function bt(e) {
	return e;
}
function xt(e, t) {
	t === void 0 && (t = bt);
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
function St(e) {
	e === void 0 && (e = {});
	var t = xt(null);
	return t.options = ct({
		async: !0,
		ssr: !1
	}, e), t;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/exports.js
var Ct = function(e) {
	var t = e.sideCar, n = lt(e, ["sideCar"]);
	if (!t) throw Error("Sidecar: please provide `sideCar` property to import the right car");
	var i = t.read();
	if (!i) throw Error("Sidecar medium not found");
	return r.createElement(i, ct({}, n));
};
Ct.isSideCarExport = !0;
function wt(e, t) {
	return e.useMedium(t), Ct;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/medium.js
var Tt = St(), Et = function() {}, Dt = r.forwardRef(function(e, t) {
	var n = r.useRef(null), i = r.useState({
		onScrollCapture: Et,
		onWheelCapture: Et,
		onTouchMoveCapture: Et
	}), a = i[0], o = i[1], s = e.forwardProps, c = e.children, l = e.className, u = e.removeScrollBar, d = e.enabled, f = e.shards, p = e.sideCar, m = e.noRelative, h = e.noIsolation, g = e.inert, _ = e.allowPinchZoom, v = e.as, y = v === void 0 ? "div" : v, b = e.gapMode, x = lt(e, [
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
	]), S = p, C = yt([n, t]), w = ct(ct({}, x), a);
	return r.createElement(r.Fragment, null, d && r.createElement(S, {
		sideCar: Tt,
		removeScrollBar: u,
		shards: f,
		noRelative: m,
		noIsolation: h,
		inert: g,
		setCallbacks: o,
		allowPinchZoom: !!_,
		lockRef: n,
		gapMode: b
	}), s ? r.cloneElement(r.Children.only(c), ct(ct({}, w), { ref: C })) : r.createElement(y, ct({}, w, {
		className: l,
		ref: C
	}), c));
});
Dt.defaultProps = {
	enabled: !0,
	removeScrollBar: !0,
	inert: !1
}, Dt.classNames = {
	fullWidth: ft,
	zeroRight: dt
};
//#endregion
//#region node_modules/get-nonce/dist/es2015/index.js
var Ot, kt = function() {
	if (Ot) return Ot;
	if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
//#endregion
//#region node_modules/react-style-singleton/dist/es2015/singleton.js
function At() {
	if (!document) return null;
	var e = document.createElement("style");
	e.type = "text/css";
	var t = kt();
	return t && e.setAttribute("nonce", t), e;
}
function jt(e, t) {
	e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function Mt(e) {
	(document.head || document.getElementsByTagName("head")[0]).appendChild(e);
}
var Nt = function() {
	var e = 0, t = null;
	return {
		add: function(n) {
			e == 0 && (t = At()) && (jt(t, n), Mt(t)), e++;
		},
		remove: function() {
			e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
		}
	};
}, Pt = function() {
	var e = Nt();
	return function(t, n) {
		r.useEffect(function() {
			return e.add(t), function() {
				e.remove();
			};
		}, [t && n]);
	};
}, Ft = function() {
	var e = Pt();
	return function(t) {
		var n = t.styles, r = t.dynamic;
		return e(n, r), null;
	};
}, It = {
	left: 0,
	top: 0,
	right: 0,
	gap: 0
}, Lt = function(e) {
	return parseInt(e || "", 10) || 0;
}, Rt = function(e) {
	var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
	return [
		Lt(n),
		Lt(r),
		Lt(i)
	];
}, zt = function(e) {
	if (e === void 0 && (e = "margin"), typeof window > "u") return It;
	var t = Rt(e), n = document.documentElement.clientWidth, r = window.innerWidth;
	return {
		left: t[0],
		top: t[1],
		right: t[2],
		gap: Math.max(0, r - n + t[2] - t[0])
	};
}, Bt = Ft(), Vt = "data-scroll-locked", Ht = function(e, t, n, r) {
	var i = e.left, a = e.top, o = e.right, s = e.gap;
	return n === void 0 && (n = "margin"), `
  .${pt} {
   overflow: hidden ${r};
   padding-right: ${s}px ${r};
  }
  body[${Vt}] {
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
  
  .${dt} {
    right: ${s}px ${r};
  }
  
  .${ft} {
    margin-right: ${s}px ${r};
  }
  
  .${dt} .${dt} {
    right: 0 ${r};
  }
  
  .${ft} .${ft} {
    margin-right: 0 ${r};
  }
  
  body[${Vt}] {
    ${mt}: ${s}px;
  }
`;
}, Ut = function() {
	var e = parseInt(document.body.getAttribute("data-scroll-locked") || "0", 10);
	return isFinite(e) ? e : 0;
}, Wt = function() {
	r.useEffect(function() {
		return document.body.setAttribute(Vt, (Ut() + 1).toString()), function() {
			var e = Ut() - 1;
			e <= 0 ? document.body.removeAttribute(Vt) : document.body.setAttribute(Vt, e.toString());
		};
	}, []);
}, Gt = function(e) {
	var t = e.noRelative, n = e.noImportant, i = e.gapMode, a = i === void 0 ? "margin" : i;
	Wt();
	var o = r.useMemo(function() {
		return zt(a);
	}, [a]);
	return r.createElement(Bt, { styles: Ht(o, !t, a, n ? "" : "!important") });
}, Kt = !1;
if (typeof window < "u") try {
	var qt = Object.defineProperty({}, "passive", { get: function() {
		return Kt = !0, !0;
	} });
	window.addEventListener("test", qt, qt), window.removeEventListener("test", qt, qt);
} catch {
	Kt = !1;
}
var Jt = Kt ? { passive: !1 } : !1, Yt = function(e) {
	return e.tagName === "TEXTAREA";
}, Xt = function(e, t) {
	if (!(e instanceof Element)) return !1;
	var n = window.getComputedStyle(e);
	return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !Yt(e) && n[t] === "visible");
}, Zt = function(e) {
	return Xt(e, "overflowY");
}, Qt = function(e) {
	return Xt(e, "overflowX");
}, $t = function(e, t) {
	var n = t.ownerDocument, r = t;
	do {
		if (typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host), nn(e, r)) {
			var i = rn(e, r);
			if (i[1] > i[2]) return !0;
		}
		r = r.parentNode;
	} while (r && r !== n.body);
	return !1;
}, en = function(e) {
	return [
		e.scrollTop,
		e.scrollHeight,
		e.clientHeight
	];
}, tn = function(e) {
	return [
		e.scrollLeft,
		e.scrollWidth,
		e.clientWidth
	];
}, nn = function(e, t) {
	return e === "v" ? Zt(t) : Qt(t);
}, rn = function(e, t) {
	return e === "v" ? en(t) : tn(t);
}, an = function(e, t) {
	return e === "h" && t === "rtl" ? -1 : 1;
}, on = function(e, t, n, r, i) {
	var a = an(e, window.getComputedStyle(t).direction), o = a * r, s = n.target, c = t.contains(s), l = !1, u = o > 0, d = 0, f = 0;
	do {
		if (!s) break;
		var p = rn(e, s), m = p[0], h = p[1] - p[2] - a * m;
		(m || h) && nn(e, s) && (d += h, f += m);
		var g = s.parentNode;
		s = g && g.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? g.host : g;
	} while (!c && s !== document.body || c && (t.contains(s) || t === s));
	return (u && (i && Math.abs(d) < 1 || !i && o > d) || !u && (i && Math.abs(f) < 1 || !i && -o > f)) && (l = !0), l;
}, sn = function(e) {
	return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, cn = function(e) {
	return [e.deltaX, e.deltaY];
}, ln = function(e) {
	return e && "current" in e ? e.current : e;
}, un = function(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}, dn = function(e) {
	return `
  .block-interactivity-${e} {pointer-events: none;}
  .allow-interactivity-${e} {pointer-events: all;}
`;
}, fn = 0, pn = [];
function mn(e) {
	var t = r.useRef([]), n = r.useRef([0, 0]), i = r.useRef(), a = r.useState(fn++)[0], o = r.useState(Ft)[0], s = r.useRef(e);
	r.useEffect(function() {
		s.current = e;
	}, [e]), r.useEffect(function() {
		if (e.inert) {
			document.body.classList.add(`block-interactivity-${a}`);
			var t = ut([e.lockRef.current], (e.shards || []).map(ln), !0).filter(Boolean);
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
		var r = sn(e), a = n.current, o = "deltaX" in e ? e.deltaX : a[0] - r[0], c = "deltaY" in e ? e.deltaY : a[1] - r[1], l, u = e.target, d = Math.abs(o) > Math.abs(c) ? "h" : "v";
		if ("touches" in e && d === "h" && u.type === "range") return !1;
		var f = window.getSelection(), p = f && f.anchorNode;
		if (p && (p === u || p.contains(u))) return !1;
		var m = $t(d, u);
		if (!m) return !0;
		if (m ? l = d : (l = d === "v" ? "h" : "v", m = $t(d, u)), !m) return !1;
		if (!i.current && "changedTouches" in e && (o || c) && (i.current = l), !l) return !0;
		var h = i.current || l;
		return on(h, t, e, h === "h" ? o : c, !0);
	}, []), l = r.useCallback(function(e) {
		var n = e;
		if (!(!pn.length || pn[pn.length - 1] !== o)) {
			var r = "deltaY" in n ? cn(n) : sn(n), i = t.current.filter(function(e) {
				return e.name === n.type && (e.target === n.target || n.target === e.shadowParent) && un(e.delta, r);
			})[0];
			if (i && i.should) {
				n.cancelable && n.preventDefault();
				return;
			}
			if (!i) {
				var a = (s.current.shards || []).map(ln).filter(Boolean).filter(function(e) {
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
			shadowParent: hn(r)
		};
		t.current.push(a), setTimeout(function() {
			t.current = t.current.filter(function(e) {
				return e !== a;
			});
		}, 1);
	}, []), d = r.useCallback(function(e) {
		n.current = sn(e), i.current = void 0;
	}, []), f = r.useCallback(function(t) {
		u(t.type, cn(t), t.target, c(t, e.lockRef.current));
	}, []), p = r.useCallback(function(t) {
		u(t.type, sn(t), t.target, c(t, e.lockRef.current));
	}, []);
	r.useEffect(function() {
		return pn.push(o), e.setCallbacks({
			onScrollCapture: f,
			onWheelCapture: f,
			onTouchMoveCapture: p
		}), document.addEventListener("wheel", l, Jt), document.addEventListener("touchmove", l, Jt), document.addEventListener("touchstart", d, Jt), function() {
			pn = pn.filter(function(e) {
				return e !== o;
			}), document.removeEventListener("wheel", l, Jt), document.removeEventListener("touchmove", l, Jt), document.removeEventListener("touchstart", d, Jt);
		};
	}, []);
	var m = e.removeScrollBar, h = e.inert;
	return r.createElement(r.Fragment, null, h ? r.createElement(o, { styles: dn(a) }) : null, m ? r.createElement(Gt, {
		noRelative: e.noRelative,
		gapMode: e.gapMode
	}) : null);
}
function hn(e) {
	for (var t = null; e !== null;) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
	return t;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/sidecar.js
var gn = wt(Tt, mn), _n = r.forwardRef(function(e, t) {
	return r.createElement(Dt, ct({}, e, {
		ref: t,
		sideCar: gn
	}));
});
_n.classNames = Dt.classNames;
//#endregion
//#region src/lib/remove-scroll-gate.tsx
var vn = r.createContext(!1);
function yn({ allowBodyScroll: e, children: t }) {
	return /* @__PURE__ */ y(vn.Provider, {
		value: e,
		children: t
	});
}
function bn() {
	return r.useContext(vn);
}
//#endregion
//#region src/lib/react-remove-scroll-shim.tsx
var xn = r.forwardRef(function(e, t) {
	let n = bn() ? !1 : e.enabled !== !1;
	return /* @__PURE__ */ y(_n, {
		...e,
		ref: t,
		enabled: n
	});
});
xn.classNames = _n.classNames;
//#endregion
//#region node_modules/aria-hidden/dist/es2015/index.js
var Sn = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, Cn = /* @__PURE__ */ new WeakMap(), wn = /* @__PURE__ */ new WeakMap(), Tn = {}, En = 0, Dn = function(e) {
	return e && (e.host || Dn(e.parentNode));
}, On = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = Dn(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, kn = function(e, t, n, r) {
	var i = On(t, Array.isArray(e) ? e : [e]);
	Tn[n] || (Tn[n] = /* @__PURE__ */ new WeakMap());
	var a = Tn[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		!e || s.has(e) || (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		!e || c.has(e) || Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (Cn.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				Cn.set(e, c), a.set(e, l), o.push(e), c === 1 && i && wn.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), En++, function() {
		o.forEach(function(e) {
			var t = Cn.get(e) - 1, i = a.get(e) - 1;
			Cn.set(e, t), a.set(e, i), t || (wn.has(e) || e.removeAttribute(r), wn.delete(e)), i || e.removeAttribute(n);
		}), En--, En || (Cn = /* @__PURE__ */ new WeakMap(), Cn = /* @__PURE__ */ new WeakMap(), wn = /* @__PURE__ */ new WeakMap(), Tn = {});
	};
}, An = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || Sn(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), kn(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function jn(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function Mn(e) {
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
var Nn = "Checkbox", [Pn, Fn] = ie(Nn), [In, Ln] = Pn(Nn);
function Rn(e) {
	let { __scopeCheckbox: t, checked: n, children: i, defaultChecked: a, disabled: o, form: s, name: c, onCheckedChange: l, required: u, value: d = "on", internal_do_not_use_render: f } = e, [p, m] = pe({
		prop: n,
		defaultProp: a ?? !1,
		onChange: l,
		caller: Nn
	}), [h, g] = r.useState(null), [_, v] = r.useState(null), b = r.useRef(!1), x = h ? !!s || !!h.closest("form") : !0, S = {
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
		defaultChecked: qn(a) ? !1 : a,
		isFormControl: x,
		bubbleInput: _,
		setBubbleInput: v
	};
	return /* @__PURE__ */ y(In, {
		scope: t,
		...S,
		children: Kn(f) ? f(S) : i
	});
}
var zn = "CheckboxTrigger", Bn = r.forwardRef(({ __scopeCheckbox: e, onKeyDown: t, onClick: n, ...i }, a) => {
	let { control: o, value: s, disabled: c, checked: l, required: u, setControl: d, setChecked: f, hasConsumerStoppedPropagationRef: p, isFormControl: m, bubbleInput: h } = Ln(zn, e), g = j(a, d), _ = r.useRef(l);
	return r.useEffect(() => {
		let e = o?.form;
		if (e) {
			let t = () => f(_.current);
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [o, f]), /* @__PURE__ */ y(I.button, {
		type: "button",
		role: "checkbox",
		"aria-checked": qn(l) ? "mixed" : l,
		"aria-required": u,
		"data-state": Jn(l),
		"data-disabled": c ? "" : void 0,
		disabled: c,
		value: s,
		...i,
		ref: g,
		onKeyDown: B(t, (e) => {
			e.key === "Enter" && e.preventDefault();
		}),
		onClick: B(n, (e) => {
			f((e) => qn(e) ? !0 : !e), h && m && (p.current = e.isPropagationStopped(), p.current || e.stopPropagation());
		})
	});
});
Bn.displayName = zn;
var Vn = r.forwardRef((e, t) => {
	let { __scopeCheckbox: n, name: r, checked: i, defaultChecked: a, required: o, disabled: s, value: c, onCheckedChange: l, form: u, ...d } = e;
	return /* @__PURE__ */ y(Rn, {
		__scopeCheckbox: n,
		checked: i,
		defaultChecked: a,
		disabled: s,
		required: o,
		onCheckedChange: l,
		name: r,
		form: u,
		value: c,
		internal_do_not_use_render: ({ isFormControl: e }) => /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y(Bn, {
			...d,
			ref: t,
			__scopeCheckbox: n
		}), e && /* @__PURE__ */ y(Gn, { __scopeCheckbox: n })] })
	});
});
Vn.displayName = Nn;
var Hn = "CheckboxIndicator", Un = r.forwardRef((e, t) => {
	let { __scopeCheckbox: n, forceMount: r, ...i } = e, a = Ln(Hn, n);
	return /* @__PURE__ */ y(_e, {
		present: r || qn(a.checked) || a.checked === !0,
		children: /* @__PURE__ */ y(I.span, {
			"data-state": Jn(a.checked),
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
Un.displayName = Hn;
var Wn = "CheckboxBubbleInput", Gn = r.forwardRef(({ __scopeCheckbox: e, ...t }, n) => {
	let { control: i, hasConsumerStoppedPropagationRef: a, checked: o, defaultChecked: s, required: c, disabled: l, name: u, value: d, form: f, bubbleInput: p, setBubbleInput: m } = Ln(Wn, e), h = j(n, m), g = jn(o), _ = Mn(i);
	r.useEffect(() => {
		let e = p;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, n = Object.getOwnPropertyDescriptor(t, "checked").set, r = !a.current;
		if (g !== o && n) {
			let t = new Event("click", { bubbles: r });
			e.indeterminate = qn(o), n.call(e, qn(o) ? !1 : o), e.dispatchEvent(t);
		}
	}, [
		p,
		g,
		o,
		a
	]);
	let v = r.useRef(qn(o) ? !1 : o);
	return /* @__PURE__ */ y(I.input, {
		type: "checkbox",
		"aria-hidden": !0,
		defaultChecked: s ?? v.current,
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
Gn.displayName = Wn;
function Kn(e) {
	return typeof e == "function";
}
function qn(e) {
	return e === "indeterminate";
}
function Jn(e) {
	return qn(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
//#endregion
//#region node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var Yn = [
	"top",
	"right",
	"bottom",
	"left"
], Xn = Math.min, Zn = Math.max, Qn = Math.round, $n = Math.floor, er = (e) => ({
	x: e,
	y: e
}), tr = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function nr(e, t, n) {
	return Zn(e, Xn(t, n));
}
function rr(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function ir(e) {
	return e.split("-")[0];
}
function ar(e) {
	return e.split("-")[1];
}
function or(e) {
	return e === "x" ? "y" : "x";
}
function sr(e) {
	return e === "y" ? "height" : "width";
}
function cr(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function lr(e) {
	return or(cr(e));
}
function ur(e, t, n) {
	n === void 0 && (n = !1);
	let r = ar(e), i = lr(e), a = sr(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = yr(o)), [o, yr(o)];
}
function dr(e) {
	let t = yr(e);
	return [
		fr(e),
		t,
		fr(t)
	];
}
function fr(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var pr = ["left", "right"], mr = ["right", "left"], hr = ["top", "bottom"], gr = ["bottom", "top"];
function _r(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? mr : pr : t ? pr : mr;
		case "left":
		case "right": return t ? hr : gr;
		default: return [];
	}
}
function vr(e, t, n, r) {
	let i = ar(e), a = _r(ir(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(fr)))), a;
}
function yr(e) {
	let t = ir(e);
	return tr[t] + e.slice(t.length);
}
function br(e) {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...e
	};
}
function xr(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : br(e);
}
function Sr(e) {
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
function Cr(e, t, n) {
	let { reference: r, floating: i } = e, a = cr(t), o = lr(t), s = sr(o), c = ir(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	switch (ar(t)) {
		case "start":
			p[o] -= f * (n && l ? -1 : 1);
			break;
		case "end":
			p[o] += f * (n && l ? -1 : 1);
			break;
	}
	return p;
}
async function wr(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = rr(t, e), p = xr(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = Sr(await i.getClippingRect({
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
	}, y = Sr(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var Tr = 50, Er = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: wr
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = Cr(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < Tr && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = Cr(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, Dr = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = rr(e, t) || {};
		if (l == null) return {};
		let d = xr(u), f = {
			x: n,
			y: r
		}, p = lr(i), m = sr(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = Xn(d[_], T), D = Xn(d[v], T), O = E, k = C - h[m] - D, A = C / 2 - h[m] / 2 + w, j = nr(O, A, k), M = !c.arrow && ar(i) != null && A !== j && a.reference[m] / 2 - (A < O ? E : D) - h[m] / 2 < 0, N = M ? A < O ? A - O : A - k : 0;
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
}), Or = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = rr(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = ir(r), _ = cr(o), v = ir(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [yr(o)] : dr(o)), x = p !== "none";
			!d && x && b.push(...vr(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = ur(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (!(u === "alignment" && _ !== cr(t)) || T.every((e) => cr(e.placement) === _ ? e.overflows[0] > 0 : !0))) return {
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
								let t = cr(e.placement);
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
function kr(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function Ar(e) {
	return Yn.some((t) => e[t] >= 0);
}
var jr = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = rr(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = kr(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: Ar(e)
					} };
				}
				case "escaped": {
					let e = kr(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: Ar(e)
					} };
				}
				default: return {};
			}
		}
	};
}, Mr = /* @__PURE__ */ new Set(["left", "top"]);
async function Nr(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = ir(n), s = ar(n), c = cr(n) === "y", l = Mr.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = rr(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var Pr = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await Nr(t, e);
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
}, Fr = function(e) {
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
			} }, ...l } = rr(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = cr(ir(i)), p = or(f), m = u[p], h = u[f];
			if (o) {
				let e = p === "y" ? "top" : "left", t = p === "y" ? "bottom" : "right", n = m + d[e], r = m - d[t];
				m = nr(n, m, r);
			}
			if (s) {
				let e = f === "y" ? "top" : "left", t = f === "y" ? "bottom" : "right", n = h + d[e], r = h - d[t];
				h = nr(n, h, r);
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
}, Ir = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = rr(e, t), u = {
				x: n,
				y: r
			}, d = cr(i), f = or(d), p = u[f], m = u[d], h = rr(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = Mr.has(ir(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, Lr = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			var n, r;
			let { placement: i, rects: a, platform: o, elements: s } = t, { apply: c = () => {}, ...l } = rr(e, t), u = await o.detectOverflow(t, l), d = ir(i), f = ar(i), p = cr(i) === "y", { width: m, height: h } = a.floating, g, _;
			d === "top" || d === "bottom" ? (g = d, _ = f === (await (o.isRTL == null ? void 0 : o.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (_ = d, g = f === "end" ? "top" : "bottom");
			let v = h - u.top - u.bottom, y = m - u.left - u.right, b = Xn(h - u[g], v), x = Xn(m - u[_], y), S = !t.middlewareData.shift, C = b, w = x;
			if ((n = t.middlewareData.shift) != null && n.enabled.x && (w = y), (r = t.middlewareData.shift) != null && r.enabled.y && (C = v), S && !f) {
				let e = Zn(u.left, 0), t = Zn(u.right, 0), n = Zn(u.top, 0), r = Zn(u.bottom, 0);
				p ? w = m - 2 * (e !== 0 || t !== 0 ? e + t : Zn(u.left, u.right)) : C = h - 2 * (n !== 0 || r !== 0 ? n + r : Zn(u.top, u.bottom));
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
function Rr() {
	return typeof window < "u";
}
function zr(e) {
	return Hr(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Br(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Vr(e) {
	return ((Hr(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function Hr(e) {
	return Rr() ? e instanceof Node || e instanceof Br(e).Node : !1;
}
function Ur(e) {
	return Rr() ? e instanceof Element || e instanceof Br(e).Element : !1;
}
function Wr(e) {
	return Rr() ? e instanceof HTMLElement || e instanceof Br(e).HTMLElement : !1;
}
function Gr(e) {
	return !Rr() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Br(e).ShadowRoot;
}
function Kr(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = ri(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function qr(e) {
	return /^(table|td|th)$/.test(zr(e));
}
function Jr(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var Yr = /transform|translate|scale|rotate|perspective|filter/, Xr = /paint|layout|strict|content/, Zr = (e) => !!e && e !== "none", Qr;
function $r(e) {
	let t = Ur(e) ? ri(e) : e;
	return Zr(t.transform) || Zr(t.translate) || Zr(t.scale) || Zr(t.rotate) || Zr(t.perspective) || !ti() && (Zr(t.backdropFilter) || Zr(t.filter)) || Yr.test(t.willChange || "") || Xr.test(t.contain || "");
}
function ei(e) {
	let t = ai(e);
	for (; Wr(t) && !ni(t);) {
		if ($r(t)) return t;
		if (Jr(t)) return null;
		t = ai(t);
	}
	return null;
}
function ti() {
	return Qr ?? (Qr = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), Qr;
}
function ni(e) {
	return /^(html|body|#document)$/.test(zr(e));
}
function ri(e) {
	return Br(e).getComputedStyle(e);
}
function ii(e) {
	return Ur(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function ai(e) {
	if (zr(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Gr(e) && e.host || Vr(e);
	return Gr(t) ? t.host : t;
}
function oi(e) {
	let t = ai(e);
	return ni(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : Wr(t) && Kr(t) ? t : oi(t);
}
function si(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = oi(e), i = r === e.ownerDocument?.body, a = Br(r);
	if (i) {
		let e = ci(a);
		return t.concat(a, a.visualViewport || [], Kr(r) ? r : [], e && n ? si(e) : []);
	} else return t.concat(r, si(r, [], n));
}
function ci(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function li(e) {
	let t = ri(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = Wr(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = Qn(n) !== a || Qn(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function ui(e) {
	return Ur(e) ? e : e.contextElement;
}
function di(e) {
	let t = ui(e);
	if (!Wr(t)) return er(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = li(t), o = (a ? Qn(n.width) : n.width) / r, s = (a ? Qn(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var fi = /* @__PURE__ */ er(0);
function pi(e) {
	let t = Br(e);
	return !ti() || !t.visualViewport ? fi : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function mi(e, t, n) {
	return t === void 0 && (t = !1), !n || t && n !== Br(e) ? !1 : t;
}
function hi(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = ui(e), o = er(1);
	t && (r ? Ur(r) && (o = di(r)) : o = di(e));
	let s = mi(a, n, r) ? pi(a) : er(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a) {
		let e = Br(a), t = r && Ur(r) ? Br(r) : r, n = e, i = ci(n);
		for (; i && r && t !== n;) {
			let e = di(i), t = i.getBoundingClientRect(), r = ri(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = Br(i), i = ci(n);
		}
	}
	return Sr({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function gi(e, t) {
	let n = ii(e).scrollLeft;
	return t ? t.left + n : hi(Vr(e)).left + n;
}
function _i(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - gi(e, n),
		y: n.top + t.scrollTop
	};
}
function vi(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = Vr(r), s = t ? Jr(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = er(1), u = er(0), d = Wr(r);
	if ((d || !d && !a) && ((zr(r) !== "body" || Kr(o)) && (c = ii(r)), d)) {
		let e = hi(r);
		l = di(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? _i(o, c) : er(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function yi(e) {
	return Array.from(e.getClientRects());
}
function bi(e) {
	let t = Vr(e), n = ii(e), r = e.ownerDocument.body, i = Zn(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), a = Zn(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight), o = -n.scrollLeft + gi(e), s = -n.scrollTop;
	return ri(r).direction === "rtl" && (o += Zn(t.clientWidth, r.clientWidth) - i), {
		width: i,
		height: a,
		x: o,
		y: s
	};
}
var xi = 25;
function Si(e, t) {
	let n = Br(e), r = Vr(e), i = n.visualViewport, a = r.clientWidth, o = r.clientHeight, s = 0, c = 0;
	if (i) {
		a = i.width, o = i.height;
		let e = ti();
		(!e || e && t === "fixed") && (s = i.offsetLeft, c = i.offsetTop);
	}
	let l = gi(r);
	if (l <= 0) {
		let e = r.ownerDocument, t = e.body, n = getComputedStyle(t), i = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, o = Math.abs(r.clientWidth - t.clientWidth - i);
		o <= xi && (a -= o);
	} else l <= xi && (a += l);
	return {
		width: a,
		height: o,
		x: s,
		y: c
	};
}
function Ci(e, t) {
	let n = hi(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = Wr(e) ? di(e) : er(1);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function wi(e, t, n) {
	let r;
	if (t === "viewport") r = Si(e, n);
	else if (t === "document") r = bi(Vr(e));
	else if (Ur(t)) r = Ci(t, n);
	else {
		let n = pi(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return Sr(r);
}
function Ti(e, t) {
	let n = ai(e);
	return n === t || !Ur(n) || ni(n) ? !1 : ri(n).position === "fixed" || Ti(n, t);
}
function Ei(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = si(e, [], !1).filter((e) => Ur(e) && zr(e) !== "body"), i = null, a = ri(e).position === "fixed", o = a ? ai(e) : e;
	for (; Ur(o) && !ni(o);) {
		let t = ri(o), n = $r(o);
		!n && t.position === "fixed" && (i = null), (a ? !n && !i : !n && t.position === "static" && i && (i.position === "absolute" || i.position === "fixed") || Kr(o) && !n && Ti(e, o)) ? r = r.filter((e) => e !== o) : i = t, o = ai(o);
	}
	return t.set(e, r), r;
}
function Di(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? Jr(t) ? [] : Ei(t, this._c) : [].concat(n), r], o = wi(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = wi(t, a[e], i);
		s = Zn(n.top, s), c = Xn(n.right, c), l = Xn(n.bottom, l), u = Zn(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function Oi(e) {
	let { width: t, height: n } = li(e);
	return {
		width: t,
		height: n
	};
}
function ki(e, t, n) {
	let r = Wr(t), i = Vr(t), a = n === "fixed", o = hi(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = er(0);
	function l() {
		c.x = gi(i);
	}
	if (r || !r && !a) if ((zr(t) !== "body" || Kr(i)) && (s = ii(t)), r) {
		let e = hi(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	} else i && l();
	a && !r && i && l();
	let u = i && !r && !a ? _i(i, s) : er(0);
	return {
		x: o.left + s.scrollLeft - c.x - u.x,
		y: o.top + s.scrollTop - c.y - u.y,
		width: o.width,
		height: o.height
	};
}
function Ai(e) {
	return ri(e).position === "static";
}
function ji(e, t) {
	if (!Wr(e) || ri(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Vr(e) === n && (n = n.ownerDocument.body), n;
}
function Mi(e, t) {
	let n = Br(e);
	if (Jr(e)) return n;
	if (!Wr(e)) {
		let t = ai(e);
		for (; t && !ni(t);) {
			if (Ur(t) && !Ai(t)) return t;
			t = ai(t);
		}
		return n;
	}
	let r = ji(e, t);
	for (; r && qr(r) && Ai(r);) r = ji(r, t);
	return r && ni(r) && Ai(r) && !$r(r) ? n : r || ei(e) || n;
}
var Ni = async function(e) {
	let t = this.getOffsetParent || Mi, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: ki(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function Pi(e) {
	return ri(e).direction === "rtl";
}
var Fi = {
	convertOffsetParentRelativeRectToViewportRelativeRect: vi,
	getDocumentElement: Vr,
	getClippingRect: Di,
	getOffsetParent: Mi,
	getElementRects: Ni,
	getClientRects: yi,
	getDimensions: Oi,
	getScale: di,
	isElement: Ur,
	isRTL: Pi
};
function Ii(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function Li(e, t) {
	let n = null, r, i = Vr(e);
	function a() {
		var e;
		clearTimeout(r), (e = n) == null || e.disconnect(), n = null;
	}
	function o(s, c) {
		s === void 0 && (s = !1), c === void 0 && (c = 1), a();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (s || t(), !f || !p) return;
		let m = $n(d), h = $n(i.clientWidth - (u + f)), g = $n(i.clientHeight - (d + p)), _ = $n(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: Zn(0, Xn(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (n !== c) {
				if (!y) return o();
				n ? o(!1, n) : r = setTimeout(() => {
					o(!1, 1e-7);
				}, 1e3);
			}
			n === 1 && !Ii(l, e.getBoundingClientRect()) && o(), y = !1;
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
function Ri(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = ui(e), u = i || a ? [...l ? si(l) : [], ...t ? si(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n, { passive: !0 }), a && e.addEventListener("resize", n);
	});
	let d = l && s ? Li(l, n) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? hi(e) : null;
	c && g();
	function g() {
		let t = hi(e);
		h && !Ii(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var zi = Pr, Bi = Fr, Vi = Or, Hi = Lr, Ui = jr, Wi = Dr, Gi = Ir, Ki = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = {
		platform: Fi,
		...n
	}, a = {
		...i.platform,
		_c: r
	};
	return Er(e, t, {
		...i,
		platform: a
	});
}, qi = typeof document < "u" ? l : function() {};
function Ji(e, t) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (typeof e == "function" && e.toString() === t.toString()) return !0;
	let n, r, i;
	if (e && t && typeof e == "object") {
		if (Array.isArray(e)) {
			if (n = e.length, n !== t.length) return !1;
			for (r = n; r-- !== 0;) if (!Ji(e[r], t[r])) return !1;
			return !0;
		}
		if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length) return !1;
		for (r = n; r-- !== 0;) if (!{}.hasOwnProperty.call(t, i[r])) return !1;
		for (r = n; r-- !== 0;) {
			let n = i[r];
			if (!(n === "_owner" && e.$$typeof) && !Ji(e[n], t[n])) return !1;
		}
		return !0;
	}
	return e !== e && t !== t;
}
function Yi(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Xi(e, t) {
	let n = Yi(e);
	return Math.round(t * n) / n;
}
function Zi(e) {
	let t = r.useRef(e);
	return qi(() => {
		t.current = e;
	}), t;
}
function Qi(e) {
	e === void 0 && (e = {});
	let { placement: t = "bottom", strategy: n = "absolute", middleware: i = [], platform: a, elements: { reference: o, floating: s } = {}, transform: c = !0, whileElementsMounted: l, open: u } = e, [d, f] = r.useState({
		x: 0,
		y: 0,
		strategy: n,
		placement: t,
		middlewareData: {},
		isPositioned: !1
	}), [p, m] = r.useState(i);
	Ji(p, i) || m(i);
	let [h, g] = r.useState(null), [_, v] = r.useState(null), y = r.useCallback((e) => {
		e !== w.current && (w.current = e, g(e));
	}, []), b = r.useCallback((e) => {
		e !== T.current && (T.current = e, v(e));
	}, []), S = o || h, C = s || _, w = r.useRef(null), T = r.useRef(null), E = r.useRef(d), D = l != null, O = Zi(l), k = Zi(a), A = Zi(u), j = r.useCallback(() => {
		if (!w.current || !T.current) return;
		let e = {
			placement: t,
			strategy: n,
			middleware: p
		};
		k.current && (e.platform = k.current), Ki(w.current, T.current, e).then((e) => {
			let t = {
				...e,
				isPositioned: A.current !== !1
			};
			M.current && !Ji(E.current, t) && (E.current = t, x.flushSync(() => {
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
	qi(() => {
		u === !1 && E.current.isPositioned && (E.current.isPositioned = !1, f((e) => ({
			...e,
			isPositioned: !1
		})));
	}, [u]);
	let M = r.useRef(!1);
	qi(() => (M.current = !0, () => {
		M.current = !1;
	}), []), qi(() => {
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
		setReference: y,
		setFloating: b
	}), [y, b]), P = r.useMemo(() => ({
		reference: S,
		floating: C
	}), [S, C]), ee = r.useMemo(() => {
		let e = {
			position: n,
			left: 0,
			top: 0
		};
		if (!P.floating) return e;
		let t = Xi(P.floating, d.x), r = Xi(P.floating, d.y);
		return c ? {
			...e,
			transform: "translate(" + t + "px, " + r + "px)",
			...Yi(P.floating) >= 1.5 && { willChange: "transform" }
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
		floatingStyles: ee
	}), [
		d,
		j,
		N,
		P,
		ee
	]);
}
var $i = (e) => {
	function t(e) {
		return {}.hasOwnProperty.call(e, "current");
	}
	return {
		name: "arrow",
		options: e,
		fn(n) {
			let { element: r, padding: i } = typeof e == "function" ? e(n) : e;
			return r && t(r) ? r.current == null ? {} : Wi({
				element: r.current,
				padding: i
			}).fn(n) : r ? Wi({
				element: r,
				padding: i
			}).fn(n) : {};
		}
	};
}, ea = (e, t) => {
	let n = zi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, ta = (e, t) => {
	let n = Bi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, na = (e, t) => ({
	fn: Gi(e).fn,
	options: [e, t]
}), ra = (e, t) => {
	let n = Vi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, ia = (e, t) => {
	let n = Hi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, aa = (e, t) => {
	let n = Ui(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, oa = (e, t) => {
	let n = $i(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, sa = "Arrow", ca = r.forwardRef((e, t) => {
	let { children: n, width: r = 10, height: i = 5, ...a } = e;
	return /* @__PURE__ */ y(I.svg, {
		...a,
		ref: t,
		width: r,
		height: i,
		viewBox: "0 0 30 10",
		preserveAspectRatio: "none",
		children: e.asChild ? n : /* @__PURE__ */ y("polygon", { points: "0,0 30,0 15,10" })
	});
});
ca.displayName = sa;
var la = ca, ua = "Popper", [da, fa] = ie(ua), [pa, ma] = da(ua), ha = (e) => {
	let { __scopePopper: t, children: n } = e, [i, a] = r.useState(null);
	return /* @__PURE__ */ y(pa, {
		scope: t,
		anchor: i,
		onAnchorChange: a,
		children: n
	});
};
ha.displayName = ua;
var ga = "PopperAnchor", _a = r.forwardRef((e, t) => {
	let { __scopePopper: n, virtualRef: i, ...a } = e, o = ma(ga, n), s = r.useRef(null), c = j(t, s), l = r.useRef(null);
	return r.useEffect(() => {
		let e = l.current;
		l.current = i?.current || s.current, e !== l.current && o.onAnchorChange(l.current);
	}), i ? null : /* @__PURE__ */ y(I.div, {
		...a,
		ref: c
	});
});
_a.displayName = ga;
var va = "PopperContent", [ya, ba] = da(va), xa = r.forwardRef((e, t) => {
	let { __scopePopper: n, side: i = "bottom", sideOffset: a = 0, align: o = "center", alignOffset: s = 0, arrowPadding: c = 0, avoidCollisions: l = !0, collisionBoundary: u = [], collisionPadding: d = 0, sticky: f = "partial", hideWhenDetached: p = !1, updatePositionStrategy: m = "optimized", onPlaced: h, ...g } = e, _ = ma(va, n), [v, b] = r.useState(null), x = j(t, (e) => b(e)), [S, C] = r.useState(null), w = Mn(S), T = w?.width ?? 0, E = w?.height ?? 0, D = i + (o === "center" ? "" : "-" + o), O = typeof d == "number" ? d : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...d
	}, k = Array.isArray(u) ? u : [u], A = k.length > 0, M = {
		padding: O,
		boundary: k.filter(Ta),
		altBoundary: A
	}, { refs: N, floatingStyles: P, placement: ee, isPositioned: F, middlewareData: te } = Qi({
		strategy: "fixed",
		placement: D,
		whileElementsMounted: (...e) => Ri(...e, { animationFrame: m === "always" }),
		elements: { reference: _.anchor },
		middleware: [
			ea({
				mainAxis: a + E,
				alignmentAxis: s
			}),
			l && ta({
				mainAxis: !0,
				crossAxis: !1,
				limiter: f === "partial" ? na() : void 0,
				...M
			}),
			l && ra({ ...M }),
			ia({
				...M,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--radix-popper-available-width", `${n}px`), o.setProperty("--radix-popper-available-height", `${r}px`), o.setProperty("--radix-popper-anchor-width", `${i}px`), o.setProperty("--radix-popper-anchor-height", `${a}px`);
				}
			}),
			S && oa({
				element: S,
				padding: c
			}),
			Ea({
				arrowWidth: T,
				arrowHeight: E
			}),
			p && aa({
				strategy: "referenceHidden",
				...M
			})
		]
	}), [ne, re] = Da(ee), L = Ee(h);
	V(() => {
		F && L?.();
	}, [F, L]);
	let R = te.arrow?.x, ie = te.arrow?.y, ae = te.arrow?.centerOffset !== 0, [z, oe] = r.useState();
	return V(() => {
		v && oe(window.getComputedStyle(v).zIndex);
	}, [v]), /* @__PURE__ */ y("div", {
		ref: N.setFloating,
		"data-radix-popper-content-wrapper": "",
		style: {
			...P,
			transform: F ? P.transform : "translate(0, -200%)",
			minWidth: "max-content",
			zIndex: z,
			"--radix-popper-transform-origin": [te.transformOrigin?.x, te.transformOrigin?.y].join(" "),
			...te.hide?.referenceHidden && {
				visibility: "hidden",
				pointerEvents: "none"
			}
		},
		dir: e.dir,
		children: /* @__PURE__ */ y(ya, {
			scope: n,
			placedSide: ne,
			onArrowChange: C,
			arrowX: R,
			arrowY: ie,
			shouldHideArrow: ae,
			children: /* @__PURE__ */ y(I.div, {
				"data-side": ne,
				"data-align": re,
				...g,
				ref: x,
				style: {
					...g.style,
					animation: F ? void 0 : "none"
				}
			})
		})
	});
});
xa.displayName = va;
var Sa = "PopperArrow", Ca = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
}, wa = r.forwardRef(function(e, t) {
	let { __scopePopper: n, ...r } = e, i = ba(Sa, n), a = Ca[i.placedSide];
	return /* @__PURE__ */ y("span", {
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
		children: /* @__PURE__ */ y(la, {
			...r,
			ref: t,
			style: {
				...r.style,
				display: "block"
			}
		})
	});
});
wa.displayName = Sa;
function Ta(e) {
	return e !== null;
}
var Ea = (e) => ({
	name: "transformOrigin",
	options: e,
	fn(t) {
		let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = Da(n), u = {
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
function Da(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
var Oa = ha, ka = _a, Aa = xa, ja = wa, Ma = "Label", Na = r.forwardRef((e, t) => /* @__PURE__ */ y(I.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
Na.displayName = Ma;
var Pa = Na;
//#endregion
//#region node_modules/@radix-ui/number/dist/index.mjs
function Fa(e, [t, n]) {
	return Math.min(n, Math.max(t, e));
}
//#endregion
//#region node_modules/@radix-ui/react-select/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function Ia(e) {
	let t = /* @__PURE__ */ La(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(za);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ y(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ y(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function La(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Va(n), a = Ba(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? A(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Ra = Symbol("radix.slottable");
function za(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Ra;
}
function Ba(e, t) {
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
function Va(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-select/dist/index.mjs
var Ha = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], Ua = [" ", "Enter"], Wa = "Select", [Ga, Ka, qa] = de(Wa), [Ja, Ya] = ie(Wa, [qa, fa]), Xa = fa(), [Za, Qa] = Ja(Wa), [$a, eo] = Ja(Wa), to = (e) => {
	let { __scopeSelect: t, children: n, open: i, defaultOpen: a, onOpenChange: o, value: s, defaultValue: c, onValueChange: l, dir: u, name: d, autoComplete: f, disabled: p, required: m, form: h } = e, g = Xa(t), [_, v] = r.useState(null), [x, S] = r.useState(null), [C, w] = r.useState(!1), T = Te(u), [E, D] = pe({
		prop: i,
		defaultProp: a ?? !1,
		onChange: o,
		caller: Wa
	}), [O, k] = pe({
		prop: s,
		defaultProp: c,
		onChange: l,
		caller: Wa
	}), A = r.useRef(null), j = _ ? h || !!_.closest("form") : !0, [M, N] = r.useState(/* @__PURE__ */ new Set()), P = Array.from(M).map((e) => e.props.value).join(";");
	return /* @__PURE__ */ y(Oa, {
		...g,
		children: /* @__PURE__ */ b(Za, {
			required: m,
			scope: t,
			trigger: _,
			onTriggerChange: v,
			valueNode: x,
			onValueNodeChange: S,
			valueNodeHasChildren: C,
			onValueNodeHasChildrenChange: w,
			contentId: Ce(),
			value: O,
			onValueChange: k,
			open: E,
			onOpenChange: D,
			dir: T,
			triggerPointerDownPosRef: A,
			disabled: p,
			children: [/* @__PURE__ */ y(Ga.Provider, {
				scope: t,
				children: /* @__PURE__ */ y($a, {
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
			}), j ? /* @__PURE__ */ b(Zo, {
				"aria-hidden": !0,
				required: m,
				tabIndex: -1,
				name: d,
				autoComplete: f,
				value: O,
				onChange: (e) => k(e.target.value),
				disabled: p,
				form: h,
				children: [O === void 0 ? /* @__PURE__ */ y("option", { value: "" }) : null, Array.from(M)]
			}, P) : null]
		})
	});
};
to.displayName = Wa;
var no = "SelectTrigger", ro = r.forwardRef((e, t) => {
	let { __scopeSelect: n, disabled: i = !1, ...a } = e, o = Xa(n), s = Qa(no, n), c = s.disabled || i, l = j(t, s.onTriggerChange), u = Ka(n), d = r.useRef("touch"), [f, p, m] = $o((e) => {
		let t = u().filter((e) => !e.disabled), n = es(t, e, t.find((e) => e.value === s.value));
		n !== void 0 && s.onValueChange(n.value);
	}), h = (e) => {
		c || (s.onOpenChange(!0), m()), e && (s.triggerPointerDownPosRef.current = {
			x: Math.round(e.pageX),
			y: Math.round(e.pageY)
		});
	};
	return /* @__PURE__ */ y(ka, {
		asChild: !0,
		...o,
		children: /* @__PURE__ */ y(I.button, {
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
			"data-placeholder": Qo(s.value) ? "" : void 0,
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
				!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && p(e.key), !(t && e.key === " ") && Ha.includes(e.key) && (h(), e.preventDefault());
			})
		})
	});
});
ro.displayName = no;
var io = "SelectValue", ao = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: r, style: i, children: a, placeholder: o = "", ...s } = e, c = Qa(io, n), { onValueNodeHasChildrenChange: l } = c, u = a !== void 0, d = j(t, c.onValueNodeChange);
	return V(() => {
		l(u);
	}, [l, u]), /* @__PURE__ */ y(I.span, {
		...s,
		ref: d,
		style: { pointerEvents: "none" },
		children: Qo(c.value) ? /* @__PURE__ */ y(v, { children: o }) : a
	});
});
ao.displayName = io;
var oo = "SelectIcon", so = r.forwardRef((e, t) => {
	let { __scopeSelect: n, children: r, ...i } = e;
	return /* @__PURE__ */ y(I.span, {
		"aria-hidden": !0,
		...i,
		ref: t,
		children: r || "▼"
	});
});
so.displayName = oo;
var co = "SelectPortal", lo = (e) => /* @__PURE__ */ y(it, {
	asChild: !0,
	...e
});
lo.displayName = co;
var uo = "SelectContent", fo = r.forwardRef((e, t) => {
	let n = Qa(uo, e.__scopeSelect), [i, a] = r.useState();
	if (V(() => {
		a(new DocumentFragment());
	}, []), !n.open) {
		let t = i;
		return t ? x.createPortal(/* @__PURE__ */ y(mo, {
			scope: e.__scopeSelect,
			children: /* @__PURE__ */ y(Ga.Slot, {
				scope: e.__scopeSelect,
				children: /* @__PURE__ */ y("div", { children: e.children })
			})
		}), t) : null;
	}
	return /* @__PURE__ */ y(vo, {
		...e,
		ref: t
	});
});
fo.displayName = uo;
var po = 10, [mo, ho] = Ja(uo), go = "SelectContentImpl", _o = /* @__PURE__ */ Ia("SelectContent.RemoveScroll"), vo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, position: i = "item-aligned", onCloseAutoFocus: a, onEscapeKeyDown: o, onPointerDownOutside: s, side: c, sideOffset: l, align: u, alignOffset: d, arrowPadding: f, collisionBoundary: p, collisionPadding: m, sticky: h, hideWhenDetached: g, avoidCollisions: _, ...v } = e, b = Qa(uo, n), [x, S] = r.useState(null), [C, w] = r.useState(null), T = j(t, (e) => S(e)), [E, D] = r.useState(null), [O, k] = r.useState(null), A = Ka(n), [M, N] = r.useState(!1), P = r.useRef(!1);
	r.useEffect(() => {
		if (x) return An(x);
	}, [x]), ot();
	let ee = r.useCallback((e) => {
		let [t, ...n] = A().map((e) => e.ref.current), [r] = n.slice(-1), i = document.activeElement;
		for (let n of e) if (n === i || (n?.scrollIntoView({ block: "nearest" }), n === t && C && (C.scrollTop = 0), n === r && C && (C.scrollTop = C.scrollHeight), n?.focus(), document.activeElement !== i)) return;
	}, [A, C]), F = r.useCallback(() => ee([E, x]), [
		ee,
		E,
		x
	]);
	r.useEffect(() => {
		M && F();
	}, [M, F]);
	let { onOpenChange: te, triggerPointerDownPosRef: I } = b;
	r.useEffect(() => {
		if (x) {
			let e = {
				x: 0,
				y: 0
			}, t = (t) => {
				e = {
					x: Math.abs(Math.round(t.pageX) - (I.current?.x ?? 0)),
					y: Math.abs(Math.round(t.pageY) - (I.current?.y ?? 0))
				};
			}, n = (n) => {
				e.x <= 10 && e.y <= 10 ? n.preventDefault() : x.contains(n.target) || te(!1), document.removeEventListener("pointermove", t), I.current = null;
			};
			return I.current !== null && (document.addEventListener("pointermove", t), document.addEventListener("pointerup", n, {
				capture: !0,
				once: !0
			})), () => {
				document.removeEventListener("pointermove", t), document.removeEventListener("pointerup", n, { capture: !0 });
			};
		}
	}, [
		x,
		te,
		I
	]), r.useEffect(() => {
		let e = () => te(!1);
		return window.addEventListener("blur", e), window.addEventListener("resize", e), () => {
			window.removeEventListener("blur", e), window.removeEventListener("resize", e);
		};
	}, [te]);
	let [ne, re] = $o((e) => {
		let t = A().filter((e) => !e.disabled), n = es(t, e, t.find((e) => e.ref.current === document.activeElement));
		n && setTimeout(() => n.ref.current.focus());
	}), L = r.useCallback((e, t, n) => {
		let r = !P.current && !n;
		(b.value !== void 0 && b.value === t || r) && (D(e), r && (P.current = !0));
	}, [b.value]), R = r.useCallback(() => x?.focus(), [x]), ie = r.useCallback((e, t, n) => {
		let r = !P.current && !n;
		(b.value !== void 0 && b.value === t || r) && k(e);
	}, [b.value]), ae = i === "popper" ? So : bo, z = ae === So ? {
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
	return /* @__PURE__ */ y(mo, {
		scope: n,
		content: x,
		viewport: C,
		onViewportChange: w,
		itemRefCallback: L,
		selectedItem: E,
		onItemLeave: R,
		itemTextRefCallback: ie,
		focusSelectedItem: F,
		selectedItemText: O,
		position: i,
		isPositioned: M,
		searchRef: ne,
		children: /* @__PURE__ */ y(xn, {
			as: _o,
			allowPinchZoom: !0,
			children: /* @__PURE__ */ y(Ge, {
				asChild: !0,
				trapped: b.open,
				onMountAutoFocus: (e) => {
					e.preventDefault();
				},
				onUnmountAutoFocus: B(a, (e) => {
					b.trigger?.focus({ preventScroll: !0 }), e.preventDefault();
				}),
				children: /* @__PURE__ */ y(Pe, {
					asChild: !0,
					disableOutsidePointerEvents: !0,
					onEscapeKeyDown: o,
					onPointerDownOutside: s,
					onFocusOutside: (e) => e.preventDefault(),
					onDismiss: () => b.onOpenChange(!1),
					children: /* @__PURE__ */ y(ae, {
						role: "listbox",
						id: b.contentId,
						"data-state": b.open ? "open" : "closed",
						dir: b.dir,
						onContextMenu: (e) => e.preventDefault(),
						...v,
						...z,
						onPlaced: () => N(!0),
						ref: T,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none",
							...v.style
						},
						onKeyDown: B(v.onKeyDown, (e) => {
							let t = e.ctrlKey || e.altKey || e.metaKey;
							if (e.key === "Tab" && e.preventDefault(), !t && e.key.length === 1 && re(e.key), [
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
								setTimeout(() => ee(t)), e.preventDefault();
							}
						})
					})
				})
			})
		})
	});
});
vo.displayName = go;
var yo = "SelectItemAlignedPosition", bo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onPlaced: i, ...a } = e, o = Qa(uo, n), s = ho(uo, n), [c, l] = r.useState(null), [u, d] = r.useState(null), f = j(t, (e) => d(e)), p = Ka(n), m = r.useRef(!1), h = r.useRef(!0), { viewport: g, selectedItem: _, selectedItemText: v, focusSelectedItem: b } = s, x = r.useCallback(() => {
		if (o.trigger && o.valueNode && c && u && g && _ && v) {
			let e = o.trigger.getBoundingClientRect(), t = u.getBoundingClientRect(), n = o.valueNode.getBoundingClientRect(), r = v.getBoundingClientRect();
			if (o.dir !== "rtl") {
				let i = r.left - t.left, a = n.left - i, o = e.left - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - po, d = Fa(a, [po, Math.max(po, u - l)]);
				c.style.minWidth = s + "px", c.style.left = d + "px";
			} else {
				let i = t.right - r.right, a = window.innerWidth - n.right - i, o = window.innerWidth - e.right - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - po, d = Fa(a, [po, Math.max(po, u - l)]);
				c.style.minWidth = s + "px", c.style.right = d + "px";
			}
			let a = p(), s = window.innerHeight - po * 2, l = g.scrollHeight, d = window.getComputedStyle(u), f = parseInt(d.borderTopWidth, 10), h = parseInt(d.paddingTop, 10), y = parseInt(d.borderBottomWidth, 10), b = parseInt(d.paddingBottom, 10), x = f + h + l + b + y, S = Math.min(_.offsetHeight * 5, x), C = window.getComputedStyle(g), w = parseInt(C.paddingTop, 10), T = parseInt(C.paddingBottom, 10), E = e.top + e.height / 2 - po, D = s - E, O = _.offsetHeight / 2, k = _.offsetTop + O, A = f + h + k, j = x - A;
			if (A <= E) {
				let e = a.length > 0 && _ === a[a.length - 1].ref.current;
				c.style.bottom = "0px";
				let t = u.clientHeight - g.offsetTop - g.offsetHeight, n = A + Math.max(D, O + (e ? T : 0) + t + y);
				c.style.height = n + "px";
			} else {
				let e = a.length > 0 && _ === a[0].ref.current;
				c.style.top = "0px";
				let t = Math.max(E, f + g.offsetTop + (e ? w : 0) + O) + j;
				c.style.height = t + "px", g.scrollTop = A - E + g.offsetTop;
			}
			c.style.margin = `${po}px 0`, c.style.minHeight = S + "px", c.style.maxHeight = s + "px", i?.(), requestAnimationFrame(() => m.current = !0);
		}
	}, [
		p,
		o.trigger,
		o.valueNode,
		c,
		u,
		g,
		_,
		v,
		o.dir,
		i
	]);
	V(() => x(), [x]);
	let [S, C] = r.useState();
	return V(() => {
		u && C(window.getComputedStyle(u).zIndex);
	}, [u]), /* @__PURE__ */ y(Co, {
		scope: n,
		contentWrapper: c,
		shouldExpandOnScrollRef: m,
		onScrollButtonChange: r.useCallback((e) => {
			e && h.current === !0 && (x(), b?.(), h.current = !1);
		}, [x, b]),
		children: /* @__PURE__ */ y("div", {
			ref: l,
			style: {
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: S
			},
			children: /* @__PURE__ */ y(I.div, {
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
bo.displayName = yo;
var xo = "SelectPopperPosition", So = r.forwardRef((e, t) => {
	let { __scopeSelect: n, align: r = "start", collisionPadding: i = po, ...a } = e;
	return /* @__PURE__ */ y(Aa, {
		...Xa(n),
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
So.displayName = xo;
var [Co, wo] = Ja(uo, {}), To = "SelectViewport", Eo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, nonce: i, ...a } = e, o = ho(To, n), s = wo(To, n), c = j(t, o.onViewportChange), l = r.useRef(0);
	return /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y("style", {
		dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" },
		nonce: i
	}), /* @__PURE__ */ y(Ga.Slot, {
		scope: n,
		children: /* @__PURE__ */ y(I.div, {
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
						let r = window.innerHeight - po * 2, i = parseFloat(n.style.minHeight), a = parseFloat(n.style.height), o = Math.max(i, a);
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
Eo.displayName = To;
var Do = "SelectGroup", [Oo, ko] = Ja(Do), Ao = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = Ce();
	return /* @__PURE__ */ y(Oo, {
		scope: n,
		id: i,
		children: /* @__PURE__ */ y(I.div, {
			role: "group",
			"aria-labelledby": i,
			...r,
			ref: t
		})
	});
});
Ao.displayName = Do;
var jo = "SelectLabel", Mo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = ko(jo, n);
	return /* @__PURE__ */ y(I.div, {
		id: i.id,
		...r,
		ref: t
	});
});
Mo.displayName = jo;
var No = "SelectItem", [Po, Fo] = Ja(No), Io = r.forwardRef((e, t) => {
	let { __scopeSelect: n, value: i, disabled: a = !1, textValue: o, ...s } = e, c = Qa(No, n), l = ho(No, n), u = c.value === i, [d, f] = r.useState(o ?? ""), [p, m] = r.useState(!1), h = j(t, (e) => l.itemRefCallback?.(e, i, a)), g = Ce(), _ = r.useRef("touch"), v = () => {
		a || (c.onValueChange(i), c.onOpenChange(!1));
	};
	if (i === "") throw Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
	return /* @__PURE__ */ y(Po, {
		scope: n,
		value: i,
		disabled: a,
		textId: g,
		isSelected: u,
		onItemTextChange: r.useCallback((e) => {
			f((t) => t || (e?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ y(Ga.ItemSlot, {
			scope: n,
			value: i,
			disabled: a,
			textValue: d,
			children: /* @__PURE__ */ y(I.div, {
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
					_.current !== "mouse" && v();
				}),
				onPointerUp: B(s.onPointerUp, () => {
					_.current === "mouse" && v();
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
					l.searchRef?.current !== "" && e.key === " " || (Ua.includes(e.key) && v(), e.key === " " && e.preventDefault());
				})
			})
		})
	});
});
Io.displayName = No;
var Lo = "SelectItemText", Ro = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: i, style: a, ...o } = e, s = Qa(Lo, n), c = ho(Lo, n), l = Fo(Lo, n), u = eo(Lo, n), [d, f] = r.useState(null), p = j(t, (e) => f(e), l.onItemTextChange, (e) => c.itemTextRefCallback?.(e, l.value, l.disabled)), m = d?.textContent, h = r.useMemo(() => /* @__PURE__ */ y("option", {
		value: l.value,
		disabled: l.disabled,
		children: m
	}, l.value), [
		l.disabled,
		l.value,
		m
	]), { onNativeOptionAdd: g, onNativeOptionRemove: _ } = u;
	return V(() => (g(h), () => _(h)), [
		g,
		_,
		h
	]), /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y(I.span, {
		id: l.textId,
		...o,
		ref: p
	}), l.isSelected && s.valueNode && !s.valueNodeHasChildren ? x.createPortal(o.children, s.valueNode) : null] });
});
Ro.displayName = Lo;
var zo = "SelectItemIndicator", Bo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return Fo(zo, n).isSelected ? /* @__PURE__ */ y(I.span, {
		"aria-hidden": !0,
		...r,
		ref: t
	}) : null;
});
Bo.displayName = zo;
var Vo = "SelectScrollUpButton", Ho = r.forwardRef((e, t) => {
	let n = ho(Vo, e.__scopeSelect), i = wo(Vo, e.__scopeSelect), [a, o] = r.useState(!1), s = j(t, i.onScrollButtonChange);
	return V(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				o(t.scrollTop > 0);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ y(Go, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop -= t.offsetHeight);
		}
	}) : null;
});
Ho.displayName = Vo;
var Uo = "SelectScrollDownButton", Wo = r.forwardRef((e, t) => {
	let n = ho(Uo, e.__scopeSelect), i = wo(Uo, e.__scopeSelect), [a, o] = r.useState(!1), s = j(t, i.onScrollButtonChange);
	return V(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				let e = t.scrollHeight - t.clientHeight;
				o(Math.ceil(t.scrollTop) < e);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ y(Go, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop += t.offsetHeight);
		}
	}) : null;
});
Wo.displayName = Uo;
var Go = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onAutoScroll: i, ...a } = e, o = ho("SelectScrollButton", n), s = r.useRef(null), c = Ka(n), l = r.useCallback(() => {
		s.current !== null && (window.clearInterval(s.current), s.current = null);
	}, []);
	return r.useEffect(() => () => l(), [l]), V(() => {
		c().find((e) => e.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
	}, [c]), /* @__PURE__ */ y(I.div, {
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
}), Ko = "SelectSeparator", qo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return /* @__PURE__ */ y(I.div, {
		"aria-hidden": !0,
		...r,
		ref: t
	});
});
qo.displayName = Ko;
var Jo = "SelectArrow", Yo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = Xa(n), a = Qa(Jo, n), o = ho(Jo, n);
	return a.open && o.position === "popper" ? /* @__PURE__ */ y(ja, {
		...i,
		...r,
		ref: t
	}) : null;
});
Yo.displayName = Jo;
var Xo = "SelectBubbleInput", Zo = r.forwardRef(({ __scopeSelect: e, value: t, ...n }, i) => {
	let a = r.useRef(null), o = j(i, a), s = jn(t);
	return r.useEffect(() => {
		let e = a.current;
		if (!e) return;
		let n = window.HTMLSelectElement.prototype, r = Object.getOwnPropertyDescriptor(n, "value").set;
		if (s !== t && r) {
			let n = new Event("change", { bubbles: !0 });
			r.call(e, t), e.dispatchEvent(n);
		}
	}, [s, t]), /* @__PURE__ */ y(I.select, {
		...n,
		style: {
			...re,
			...n.style
		},
		ref: o,
		defaultValue: t
	});
});
Zo.displayName = Xo;
function Qo(e) {
	return e === "" || e === void 0;
}
function $o(e) {
	let t = Ee(e), n = r.useRef(""), i = r.useRef(0), a = r.useCallback((e) => {
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
function es(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = ts(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.textValue.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
function ts(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
var ns = to, rs = ro, is = ao, as = so, os = lo, ss = fo, cs = Eo, ls = Io, us = Ro, ds = Bo, fs = Ho, ps = Wo;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function ms(e) {
	let t = /* @__PURE__ */ gs(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(vs);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ y(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ y(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
var hs = /* @__PURE__ */ ms("Slot");
/* @__NO_SIDE_EFFECTS__ */
function gs(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = bs(n), a = ys(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? A(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var _s = Symbol("radix.slottable");
function vs(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === _s;
}
function ys(e, t) {
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
function bs(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/tailwind-merge/dist/bundle-mjs.mjs
var xs = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, Ss = (e, t) => ({
	classGroupId: e,
	validator: t
}), Cs = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), ws = "-", Ts = [], Es = "arbitrary..", Ds = (e) => {
	let t = As(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return ks(e);
			let n = e.split(ws);
			return Os(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? xs(i, t) : t : i || Ts;
			}
			return n[e] || Ts;
		}
	};
}, Os = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = Os(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(ws) : e.slice(t).join(ws), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, ks = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? Es + r : void 0;
})(), As = (e) => {
	let { theme: t, classGroups: n } = e;
	return js(n, t);
}, js = (e, t) => {
	let n = Cs();
	for (let r in e) {
		let i = e[r];
		Ms(i, n, r, t);
	}
	return n;
}, Ms = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		Ns(i, t, n, r);
	}
}, Ns = (e, t, n, r) => {
	if (typeof e == "string") {
		Ps(e, t, n);
		return;
	}
	if (typeof e == "function") {
		Fs(e, t, n, r);
		return;
	}
	Is(e, t, n, r);
}, Ps = (e, t, n) => {
	let r = e === "" ? t : Ls(t, e);
	r.classGroupId = n;
}, Fs = (e, t, n, r) => {
	if (Rs(e)) {
		Ms(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(Ss(n, e));
}, Is = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		Ms(o, Ls(t, a), n, r);
	}
}, Ls = (e, t) => {
	let n = e, r = t.split(ws), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = Cs(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, Rs = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, zs = (e) => {
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
}, Bs = "!", Vs = ":", Hs = [], Us = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), Ws = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === Vs) {
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
		s.endsWith(Bs) ? (c = s.slice(0, -1), l = !0) : s.startsWith(Bs) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return Us(t, l, c, u);
	};
	if (t) {
		let e = t + Vs, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : Us(Hs, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, Gs = (e) => {
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
}, Ks = (e) => ({
	cache: zs(e.cacheSize),
	parseClassName: Ws(e),
	sortModifiers: Gs(e),
	...Ds(e)
}), qs = /\s+/, Js = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(qs), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + Bs : g, v = _ + h;
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
}, Ys = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = Xs(n)) && (i && (i += " "), i += r);
	return i;
}, Xs = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = Xs(e[r])) && (n && (n += " "), n += t);
	return n;
}, Zs = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = Ks(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = Js(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(Ys(...e));
}, Qs = [], H = (e) => {
	let t = (t) => t[e] || Qs;
	return t.isThemeGetter = !0, t;
}, $s = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, ec = /^\((?:(\w[\w-]*):)?(.+)\)$/i, tc = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, nc = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, rc = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, ic = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, ac = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, oc = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, sc = (e) => tc.test(e), U = (e) => !!e && !Number.isNaN(Number(e)), cc = (e) => !!e && Number.isInteger(Number(e)), lc = (e) => e.endsWith("%") && U(e.slice(0, -1)), uc = (e) => nc.test(e), dc = () => !0, fc = (e) => rc.test(e) && !ic.test(e), pc = () => !1, mc = (e) => ac.test(e), hc = (e) => oc.test(e), gc = (e) => !W(e) && !G(e), _c = (e) => Mc(e, Ic, pc), W = (e) => $s.test(e), vc = (e) => Mc(e, Lc, fc), yc = (e) => Mc(e, Rc, U), bc = (e) => Mc(e, Bc, dc), xc = (e) => Mc(e, zc, pc), Sc = (e) => Mc(e, Pc, pc), Cc = (e) => Mc(e, Fc, hc), wc = (e) => Mc(e, Vc, mc), G = (e) => ec.test(e), Tc = (e) => Nc(e, Lc), Ec = (e) => Nc(e, zc), Dc = (e) => Nc(e, Pc), Oc = (e) => Nc(e, Ic), kc = (e) => Nc(e, Fc), Ac = (e) => Nc(e, Vc, !0), jc = (e) => Nc(e, Bc, !0), Mc = (e, t, n) => {
	let r = $s.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, Nc = (e, t, n = !1) => {
	let r = ec.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, Pc = (e) => e === "position" || e === "percentage", Fc = (e) => e === "image" || e === "url", Ic = (e) => e === "length" || e === "size" || e === "bg-size", Lc = (e) => e === "length", Rc = (e) => e === "number", zc = (e) => e === "family-name", Bc = (e) => e === "number" || e === "weight", Vc = (e) => e === "shadow", Hc = /* @__PURE__ */ Zs(() => {
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
		sc,
		"full",
		"auto",
		...w()
	], E = () => [
		cc,
		"none",
		"subgrid",
		G,
		W
	], D = () => [
		"auto",
		{ span: [
			"full",
			cc,
			G,
			W
		] },
		cc,
		G,
		W
	], O = () => [
		cc,
		"auto",
		G,
		W
	], k = () => [
		"auto",
		"min",
		"max",
		"fr",
		G,
		W
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
		sc,
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
		sc,
		"screen",
		"full",
		"dvw",
		"lvw",
		"svw",
		"min",
		"max",
		"fit",
		...w()
	], ee = () => [
		sc,
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
		G,
		W
	], te = () => [
		...b(),
		Dc,
		Sc,
		{ position: [G, W] }
	], I = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], ne = () => [
		"auto",
		"cover",
		"contain",
		Oc,
		_c,
		{ size: [G, W] }
	], re = () => [
		lc,
		Tc,
		vc
	], L = () => [
		"",
		"none",
		"full",
		l,
		G,
		W
	], R = () => [
		"",
		U,
		Tc,
		vc
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
		U,
		lc,
		Dc,
		Sc
	], oe = () => [
		"",
		"none",
		m,
		G,
		W
	], se = () => [
		"none",
		U,
		G,
		W
	], ce = () => [
		"none",
		U,
		G,
		W
	], le = () => [
		U,
		G,
		W
	], ue = () => [
		sc,
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
			blur: [uc],
			breakpoint: [uc],
			color: [dc],
			container: [uc],
			"drop-shadow": [uc],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [gc],
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
			"inset-shadow": [uc],
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
			radius: [uc],
			shadow: [uc],
			spacing: ["px", U],
			text: [uc],
			"text-shadow": [uc],
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
				sc,
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
				cc,
				"auto",
				G,
				W
			] }],
			basis: [{ basis: [
				sc,
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
				sc,
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
				cc,
				"first",
				"last",
				"none",
				G,
				W
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
			"block-size": [{ block: ["auto", ...ee()] }],
			"min-block-size": [{ "min-block": ["auto", ...ee()] }],
			"max-block-size": [{ "max-block": ["none", ...ee()] }],
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
				Tc,
				vc
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				jc,
				bc
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
				lc,
				W
			] }],
			"font-family": [{ font: [
				Ec,
				xc,
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
				yc
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
				U,
				"from-font",
				"auto",
				G,
				vc
			] }],
			"text-decoration-color": [{ decoration: F() }],
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
			"bg-position": [{ bg: te() }],
			"bg-repeat": [{ bg: I() }],
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
						cc,
						G,
						W
					],
					radial: [
						"",
						G,
						W
					],
					conic: [
						cc,
						G,
						W
					]
				},
				kc,
				Cc
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
				U,
				G,
				W
			] }],
			"outline-w": [{ outline: [
				"",
				U,
				Tc,
				vc
			] }],
			"outline-color": [{ outline: F() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				Ac,
				wc
			] }],
			"shadow-color": [{ shadow: F() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				Ac,
				wc
			] }],
			"inset-shadow-color": [{ "inset-shadow": F() }],
			"ring-w": [{ ring: R() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: F() }],
			"ring-offset-w": [{ "ring-offset": [U, vc] }],
			"ring-offset-color": [{ "ring-offset": F() }],
			"inset-ring-w": [{ "inset-ring": R() }],
			"inset-ring-color": [{ "inset-ring": F() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				Ac,
				wc
			] }],
			"text-shadow-color": [{ "text-shadow": F() }],
			opacity: [{ opacity: [
				U,
				G,
				W
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
			"mask-image-linear-pos": [{ "mask-linear": [U] }],
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
			"mask-image-radial": [{ "mask-radial": [G, W] }],
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
			"mask-image-conic-pos": [{ "mask-conic": [U] }],
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
			"mask-repeat": [{ mask: I() }],
			"mask-size": [{ mask: ne() }],
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
			blur: [{ blur: oe() }],
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
				Ac,
				wc
			] }],
			"drop-shadow-color": [{ "drop-shadow": F() }],
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
			"backdrop-blur": [{ "backdrop-blur": oe() }],
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
				G,
				W,
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
			fill: [{ fill: ["none", ...F()] }],
			"stroke-w": [{ stroke: [
				U,
				Tc,
				vc,
				yc
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
function K(...e) {
	return Hc(T(e));
}
//#endregion
//#region src/components/ui/button.tsx
var Uc = O("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
	return /* @__PURE__ */ y(r ? hs : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: K(Uc({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var Wc = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), Gc = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Kc = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), qc = (e) => {
	let t = Kc(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, Jc = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, Yc = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, Xc = a({}), Zc = () => c(Xc), Qc = s(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: a, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = Zc() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return o("svg", {
		ref: l,
		...Jc,
		width: t ?? u ?? Jc.width,
		height: t ?? u ?? Jc.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: Wc("lucide", m, i),
		...!a && !Yc(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => o(e, t)), ...Array.isArray(a) ? a : [a]]);
}), $c = (e, t) => {
	let n = s(({ className: n, ...r }, i) => o(Qc, {
		ref: i,
		iconNode: t,
		className: Wc(`lucide-${Gc(qc(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = qc(e), n;
}, el = $c("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]), tl = $c("chevron-down", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]), nl = $c("chevron-up", [["path", {
	d: "m18 15-6-6-6 6",
	key: "153udz"
}]]);
//#endregion
//#region src/components/ui/checkbox.tsx
function rl({ className: e, ...t }) {
	return /* @__PURE__ */ y(Vn, {
		"data-slot": "checkbox",
		className: K("peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary", e),
		...t,
		children: /* @__PURE__ */ y(Un, {
			"data-slot": "checkbox-indicator",
			className: "grid place-content-center text-current transition-none",
			children: /* @__PURE__ */ y(el, { className: "size-3.5" })
		})
	});
}
//#endregion
//#region src/components/ui/input.tsx
function J({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ y("input", {
		type: t,
		"data-slot": "input",
		className: K("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function il({ className: e, ...t }) {
	return /* @__PURE__ */ y(Pa, {
		"data-slot": "label",
		className: K("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/hooks/use-text-direction.ts
function al() {
	let { i18n: e } = g();
	return e.dir() === "rtl" ? "rtl" : "ltr";
}
//#endregion
//#region src/components/ui/select.tsx
function ol({ ...e }) {
	return /* @__PURE__ */ y(ns, {
		"data-slot": "select",
		...e
	});
}
function sl({ ...e }) {
	return /* @__PURE__ */ y(is, {
		"data-slot": "select-value",
		...e
	});
}
function cl({ className: e, size: t = "default", children: n, ...r }) {
	return /* @__PURE__ */ b(rs, {
		"data-slot": "select-trigger",
		"data-size": t,
		dir: al(),
		className: K("flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap text-start shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", e),
		...r,
		children: [n, /* @__PURE__ */ y(as, {
			asChild: !0,
			children: /* @__PURE__ */ y(tl, { className: "size-4 opacity-50" })
		})]
	});
}
function ll({ className: e, children: t, position: n = "popper", align: r = "start", ...i }) {
	return /* @__PURE__ */ y(yn, {
		allowBodyScroll: !0,
		children: /* @__PURE__ */ y(os, { children: /* @__PURE__ */ b(ss, {
			"data-slot": "select-content",
			dir: al(),
			className: K("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-start text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", e),
			position: n,
			align: r,
			...i,
			children: [
				/* @__PURE__ */ y(dl, {}),
				/* @__PURE__ */ y(cs, {
					className: K("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
					children: t
				}),
				/* @__PURE__ */ y(fl, {})
			]
		}) })
	});
}
function ul({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ b(ls, {
		"data-slot": "select-item",
		className: K("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pe-8 ps-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", e),
		...n,
		children: [/* @__PURE__ */ y("span", {
			"data-slot": "select-item-indicator",
			className: "absolute end-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ y(ds, { children: /* @__PURE__ */ y(el, { className: "size-4" }) })
		}), /* @__PURE__ */ y(us, { children: t })]
	});
}
function dl({ className: e, ...t }) {
	return /* @__PURE__ */ y(fs, {
		"data-slot": "select-scroll-up-button",
		className: K("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ y(nl, { className: "size-4" })
	});
}
function fl({ className: e, ...t }) {
	return /* @__PURE__ */ y(ps, {
		"data-slot": "select-scroll-down-button",
		className: K("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ y(tl, { className: "size-4" })
	});
}
//#endregion
//#region src/lib/marketplace-api.ts
function pl(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function ml(e) {
	"@babel/helpers - typeof";
	return ml = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, ml(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function hl(e, t) {
	if (ml(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (ml(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function gl(e) {
	var t = hl(e, "string");
	return ml(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function _l(e, t, n) {
	return (t = gl(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/lib/apiError.ts
var vl = class extends Error {
	constructor(e, t) {
		super(e), _l(this, "code", void 0), _l(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, yl = {
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
function bl(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function xl(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function Sl(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(pl(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function Cl(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return Sl(e, n);
	if (t instanceof vl && t.code) {
		let n = yl[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = yl[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return bl(n) ? e("errors.api.timeout") : xl(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function Y(e, t) {
	_.error(Cl(e, t));
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
	throw new vl("Request blocked: URL not allowed", {
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
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : null;
}
function jl(e, t) {
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
function Ml(e, t) {
	let n = e.toLowerCase();
	return e.includes("Upstream Error") || e.includes("Forbidden") || t === 403 ? "admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry" : n.includes("timed out") || n.includes("timeout") || t === 504 || t === 524 ? "Request timed out — RSA-4096 generation can take over a minute on weak hosts" : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? `Invalid AJAX response (HTML, HTTP ${t || 0})` : `Invalid AJAX response (HTTP ${t || 0})`;
}
async function Nl(e, t, n = {}) {
	let r = Al(e), i = Tl();
	if (!r || !i.ajaxUrl) throw new vl("AJAX fallback unavailable", {
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
			throw new vl(Ml(t, e.status), {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!n.success) throw new vl(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
			code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
			status: e.status
		});
		return n.data;
	} catch (e) {
		throw e instanceof vl ? e : e instanceof DOMException && e.name === "AbortError" ? new vl("Request timed out", {
			code: "timeout",
			status: 0
		}) : e instanceof TypeError ? new vl("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		u();
	}
}
async function X(e, t = {}, n = El) {
	if (Al(e) && Tl().ajaxUrl) return Nl(e, n, t);
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
			let t = jl(n, e.status);
			throw new vl(t.message, {
				code: t.code,
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i;
			throw new vl(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
		}
		return i;
	} catch (e) {
		throw e instanceof vl ? e : e instanceof DOMException && e.name === "AbortError" ? new vl("Request timed out", {
			code: "timeout",
			status: 0
		}) : e instanceof TypeError ? new vl("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region ../Modules/accounting-module/client/pages/accounting/AccountingSettingsPage.tsx
var Pl = [
	"contacts",
	"items",
	"invoices",
	"receipts",
	"warehouses",
	"cash_accounts",
	"journals",
	"bank_transfers",
	"categories",
	"projects",
	"accounts"
];
function Z({ label: e, value: t, onChange: n, type: r = "text", placeholder: i }) {
	return /* @__PURE__ */ b("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ y(il, { children: e }), /* @__PURE__ */ y(J, {
			type: r,
			value: t,
			placeholder: i,
			onChange: (e) => n(e.target.value)
		})]
	});
}
function Fl() {
	let { t: r } = g(), i = n(), a = m().pathname, o = a.endsWith("/company") ? "company" : a.endsWith("/sync") ? "sync" : a.endsWith("/tax") ? "tax" : a.endsWith("/hesabfa") ? "hesabfa" : a.endsWith("/payroll") ? "payroll" : "moadian", s = t({
		queryKey: ["accounting", "settings"],
		queryFn: async () => X("accounting/settings")
	}), c = t({
		queryKey: ["accounting", "hesabfa-meta"],
		queryFn: async () => X("accounting/hesabfa/meta"),
		enabled: o === "hesabfa"
	}), [l, f] = d(null), p = u(() => {
		let e = s.data?.settings;
		return e ? l || (f({
			...e,
			private_key: "",
			certificate_pem: (e.has_certificate, ""),
			hesabfa_api_key: "",
			hesabfa_login_token: "",
			hesabfa_password: "",
			hesabfa_hook_password: ""
		}), {
			...e,
			private_key: ""
		}) : l;
	}, [s.data?.settings, l]), h = e({
		mutationFn: async () => X("accounting/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(p)
		}),
		onSuccess: async (e) => {
			_.success(r("common.saved")), f({
				...e.settings,
				private_key: "",
				hesabfa_api_key: "",
				hesabfa_login_token: "",
				hesabfa_password: "",
				hesabfa_hook_password: ""
			}), await i.invalidateQueries({ queryKey: ["accounting", "settings"] });
		},
		onError: (e) => Y(r, e)
	}), x = e({
		mutationFn: async () => X("accounting/test-connection", { method: "POST" }),
		onSuccess: () => _.success(r("accounting.testSuccess")),
		onError: (e) => Y(r, e)
	}), S = e({
		mutationFn: async () => X("accounting/hesabfa/test", { method: "POST" }),
		onSuccess: () => _.success(r("accounting.hesabfa.testSuccess")),
		onError: (e) => Y(r, e)
	}), w = e({
		mutationFn: async () => X("accounting/hesabfa/register-hook", { method: "POST" }),
		onSuccess: async () => {
			_.success(r("accounting.hesabfa.hookRegistered")), await i.invalidateQueries({ queryKey: ["accounting", "hesabfa-meta"] }), await i.invalidateQueries({ queryKey: ["accounting", "settings"] });
		},
		onError: (e) => Y(r, e)
	}), T = e({
		mutationFn: async () => X("accounting/hesabfa/migrate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({})
		}),
		onSuccess: (e) => _.success(r("accounting.hesabfa.migrateQueued", { count: e.queued })),
		onError: (e) => Y(r, e)
	}), E = e({
		mutationFn: async () => X("accounting/hesabfa/sync-now", { method: "POST" }),
		onSuccess: (e) => _.success(r("accounting.hesabfa.synced", { count: e.pulled ?? 0 })),
		onError: (e) => Y(r, e)
	}), D = r(o === "company" ? "accounting.settings.company" : o === "sync" ? "accounting.settings.sync" : o === "tax" ? "accounting.settings.tax" : o === "hesabfa" ? "accounting.settings.hesabfa" : o === "payroll" ? "accounting.settings.payroll" : "accounting.settings.moadian");
	if (!p) return /* @__PURE__ */ y(C, {
		title: D,
		children: /* @__PURE__ */ y("div", { children: r("common.loading") })
	});
	let O = p.hesabfa_sync_entities ?? {};
	return /* @__PURE__ */ y(C, {
		title: D,
		description: r("accounting.settingsSubtitle"),
		children: /* @__PURE__ */ b("section", {
			className: "space-y-4 rounded-lg border border-border p-4",
			children: [
				o === "moadian" ? /* @__PURE__ */ b("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [
						/* @__PURE__ */ y(Z, {
							label: r("accounting.fiscalId"),
							value: p.fiscal_id,
							onChange: (e) => f((t) => ({
								...t,
								fiscal_id: e
							}))
						}),
						/* @__PURE__ */ b("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ y(il, { children: r("accounting.defaultInvoiceType") }), /* @__PURE__ */ b(ol, {
								value: String(p.default_invoice_type),
								onValueChange: (e) => f((t) => ({
									...t,
									default_invoice_type: Number(e)
								})),
								children: [/* @__PURE__ */ y(cl, { children: /* @__PURE__ */ y(sl, {}) }), /* @__PURE__ */ b(ll, { children: [
									/* @__PURE__ */ y(ul, {
										value: "1",
										children: r("accounting.invoiceType1")
									}),
									/* @__PURE__ */ y(ul, {
										value: "2",
										children: r("accounting.invoiceType2")
									}),
									/* @__PURE__ */ y(ul, {
										value: "3",
										children: r("accounting.invoiceType3")
									})
								] })]
							})]
						}),
						/* @__PURE__ */ y(Z, {
							label: r("accounting.privateKey"),
							type: "password",
							value: p.private_key ?? "",
							placeholder: p.has_private_key ? "••••••••" : "",
							onChange: (e) => f((t) => ({
								...t,
								private_key: e
							}))
						}),
						/* @__PURE__ */ b("div", {
							className: "space-y-2 md:col-span-2",
							children: [/* @__PURE__ */ y(il, { children: r("accounting.certificate") }), /* @__PURE__ */ y("textarea", {
								className: "border-input bg-background flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm",
								value: p.certificate_pem ?? "",
								placeholder: p.has_certificate ? "••••••••" : "",
								onChange: (e) => f((t) => ({
									...t,
									certificate_pem: e.target.value
								}))
							})]
						}),
						/* @__PURE__ */ b("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ y(rl, {
								id: "acc-auto",
								checked: p.auto_send_moadian,
								onCheckedChange: (e) => f((t) => ({
									...t,
									auto_send_moadian: e === !0
								}))
							}), /* @__PURE__ */ y(il, {
								htmlFor: "acc-auto",
								children: r("accounting.autoSend")
							})]
						}),
						/* @__PURE__ */ b("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ y(rl, {
								id: "acc-sandbox",
								checked: p.moadian_sandbox,
								onCheckedChange: (e) => f((t) => ({
									...t,
									moadian_sandbox: e === !0
								}))
							}), /* @__PURE__ */ y(il, {
								htmlFor: "acc-sandbox",
								children: r("accounting.sandbox")
							})]
						}),
						/* @__PURE__ */ y(Z, {
							label: r("accounting.moadianProxy"),
							value: p.moadian_proxy ?? "",
							placeholder: "http://user:pass@host:port",
							onChange: (e) => f((t) => ({
								...t,
								moadian_proxy: e
							}))
						}),
						/* @__PURE__ */ y("p", {
							className: "text-muted-foreground md:col-span-2 text-xs",
							children: r("accounting.moadianHelp")
						})
					]
				}) : null,
				o === "company" ? /* @__PURE__ */ b("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [
						/* @__PURE__ */ y(Z, {
							label: r("accounting.companyName"),
							value: p.company_name,
							onChange: (e) => f((t) => ({
								...t,
								company_name: e
							}))
						}),
						/* @__PURE__ */ y(Z, {
							label: r("accounting.economicCode"),
							value: p.economic_code,
							onChange: (e) => f((t) => ({
								...t,
								economic_code: e
							}))
						}),
						/* @__PURE__ */ y(Z, {
							label: r("accounting.nationalId"),
							value: p.national_id,
							onChange: (e) => f((t) => ({
								...t,
								national_id: e
							}))
						}),
						/* @__PURE__ */ y(Z, {
							label: r("accounting.postalCode"),
							value: p.postal_code,
							onChange: (e) => f((t) => ({
								...t,
								postal_code: e
							}))
						}),
						/* @__PURE__ */ y(Z, {
							label: r("accounting.province"),
							value: p.province,
							onChange: (e) => f((t) => ({
								...t,
								province: e
							}))
						}),
						/* @__PURE__ */ y(Z, {
							label: r("accounting.city"),
							value: p.city,
							onChange: (e) => f((t) => ({
								...t,
								city: e
							}))
						}),
						/* @__PURE__ */ y(Z, {
							label: r("accounting.phone"),
							value: p.phone,
							onChange: (e) => f((t) => ({
								...t,
								phone: e
							}))
						}),
						/* @__PURE__ */ b("div", {
							className: "space-y-2 md:col-span-2",
							children: [/* @__PURE__ */ y(il, { children: r("accounting.address") }), /* @__PURE__ */ y("textarea", {
								className: "border-input bg-background flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm",
								value: p.address,
								onChange: (e) => f((t) => ({
									...t,
									address: e.target.value
								}))
							})]
						})
					]
				}) : null,
				o === "sync" ? /* @__PURE__ */ b("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ b("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ y(rl, {
								id: "acc-cogs",
								checked: p.snapshot_cogs,
								onCheckedChange: (e) => f((t) => ({
									...t,
									snapshot_cogs: e === !0
								}))
							}), /* @__PURE__ */ y(il, {
								htmlFor: "acc-cogs",
								children: r("accounting.snapshotCogs")
							})]
						}),
						/* @__PURE__ */ y(Z, {
							label: r("accounting.syncStatuses"),
							value: (p.sync_order_statuses ?? []).join(","),
							onChange: (e) => f((t) => ({
								...t,
								sync_order_statuses: e.split(",").map((e) => e.trim()).filter(Boolean)
							}))
						}),
						/* @__PURE__ */ y("p", {
							className: "text-muted-foreground text-xs",
							children: r("accounting.syncHelp")
						})
					]
				}) : null,
				o === "tax" ? /* @__PURE__ */ b("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [/* @__PURE__ */ y(Z, {
						label: r("accounting.defaultVat"),
						type: "number",
						value: String(p.default_vat_rate),
						onChange: (e) => f((t) => ({
							...t,
							default_vat_rate: Number(e) || 0
						}))
					}), Object.entries(p.account_map ?? {}).map(([e, t]) => /* @__PURE__ */ y(Z, {
						label: r(`accounting.map.${e}`, e),
						value: t,
						onChange: (t) => f((n) => ({
							...n,
							account_map: {
								...n.account_map,
								[e]: t
							}
						}))
					}, e))]
				}) : null,
				o === "hesabfa" ? /* @__PURE__ */ b("div", {
					className: "space-y-6",
					children: [
						/* @__PURE__ */ b("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ y(rl, {
								id: "hesabfa-on",
								checked: !!p.hesabfa_enabled,
								onCheckedChange: (e) => f((t) => ({
									...t,
									hesabfa_enabled: e === !0
								}))
							}), /* @__PURE__ */ y(il, {
								htmlFor: "hesabfa-on",
								children: r("accounting.hesabfa.enabled")
							})]
						}),
						/* @__PURE__ */ b("div", {
							className: "grid gap-4 md:grid-cols-2",
							children: [
								/* @__PURE__ */ y(Z, {
									label: r("accounting.hesabfa.apiKey"),
									type: "password",
									value: p.hesabfa_api_key ?? "",
									placeholder: p.hesabfa_api_key_masked || "",
									onChange: (e) => f((t) => ({
										...t,
										hesabfa_api_key: e
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.hesabfa.loginToken"),
									type: "password",
									value: p.hesabfa_login_token ?? "",
									placeholder: p.has_hesabfa_login_token ? "••••••••" : "",
									onChange: (e) => f((t) => ({
										...t,
										hesabfa_login_token: e
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.hesabfa.userId"),
									value: p.hesabfa_user_id ?? "",
									onChange: (e) => f((t) => ({
										...t,
										hesabfa_user_id: e
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.hesabfa.password"),
									type: "password",
									value: p.hesabfa_password ?? "",
									placeholder: p.has_hesabfa_password ? "••••••••" : "",
									onChange: (e) => f((t) => ({
										...t,
										hesabfa_password: e
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.hesabfa.yearId"),
									type: "number",
									value: String(p.hesabfa_year_id ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										hesabfa_year_id: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ b("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ y(il, { children: r("accounting.hesabfa.currency") }), /* @__PURE__ */ b(ol, {
										value: p.hesabfa_currency ?? "IRT",
										onValueChange: (e) => f((t) => ({
											...t,
											hesabfa_currency: e
										})),
										children: [/* @__PURE__ */ y(cl, { children: /* @__PURE__ */ y(sl, {}) }), /* @__PURE__ */ b(ll, { children: [/* @__PURE__ */ y(ul, {
											value: "IRT",
											children: "IRT (تومان)"
										}), /* @__PURE__ */ y(ul, {
											value: "IRR",
											children: "IRR (ریال)"
										})] })]
									})]
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.hesabfa.defaultBank"),
									value: p.hesabfa_default_bank_code ?? "",
									onChange: (e) => f((t) => ({
										...t,
										hesabfa_default_bank_code: e
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.hesabfa.defaultWarehouse"),
									value: p.hesabfa_default_warehouse_code ?? "",
									onChange: (e) => f((t) => ({
										...t,
										hesabfa_default_warehouse_code: e
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.hesabfa.hookPassword"),
									type: "password",
									value: p.hesabfa_hook_password ?? "",
									placeholder: p.has_hesabfa_hook_password ? "••••••••" : "",
									onChange: (e) => f((t) => ({
										...t,
										hesabfa_hook_password: e
									}))
								})
							]
						}),
						/* @__PURE__ */ b("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ y(rl, {
								id: "hesabfa-link",
								checked: p.hesabfa_link_wc_only !== !1,
								onCheckedChange: (e) => f((t) => ({
									...t,
									hesabfa_link_wc_only: e === !0
								}))
							}), /* @__PURE__ */ y(il, {
								htmlFor: "hesabfa-link",
								children: r("accounting.hesabfa.linkWcOnly")
							})]
						}),
						/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y("p", {
							className: "mb-2 text-sm font-medium",
							children: r("accounting.hesabfa.entities")
						}), /* @__PURE__ */ y("div", {
							className: "grid gap-2 sm:grid-cols-2 md:grid-cols-3",
							children: Pl.map((e) => /* @__PURE__ */ b("label", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ y(rl, {
									checked: O[e] !== !1,
									onCheckedChange: (t) => f((n) => ({
										...n,
										hesabfa_sync_entities: {
											...n.hesabfa_sync_entities ?? {},
											[e]: t === !0
										}
									}))
								}), r(`accounting.hesabfa.entity.${e}`)]
							}, e))
						})] }),
						c.data?.hook_url ? /* @__PURE__ */ b("p", {
							className: "text-muted-foreground break-all text-xs",
							children: [
								r("accounting.hesabfa.hookUrl"),
								": ",
								c.data.hook_url
							]
						}) : null,
						/* @__PURE__ */ b("p", {
							className: "text-muted-foreground text-xs",
							children: [
								r("accounting.hesabfa.lastChangeId"),
								": ",
								p.hesabfa_last_change_id ?? 0
							]
						}),
						/* @__PURE__ */ y("p", {
							className: "text-muted-foreground text-xs",
							children: r("accounting.hesabfa.help")
						})
					]
				}) : null,
				o === "payroll" ? /* @__PURE__ */ b("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ y("p", {
							className: "text-muted-foreground text-sm",
							children: r("accounting.payroll.settingsHelp")
						}),
						/* @__PURE__ */ b("div", {
							className: "grid gap-4 md:grid-cols-2",
							children: [
								/* @__PURE__ */ y(Z, {
									label: r("accounting.payroll.employeeInsPct"),
									type: "number",
									value: String(p.employee_insurance_pct ?? 7),
									onChange: (e) => f((t) => ({
										...t,
										employee_insurance_pct: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.payroll.employerInsPct"),
									type: "number",
									value: String(p.employer_insurance_pct ?? 20),
									onChange: (e) => f((t) => ({
										...t,
										employer_insurance_pct: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.payroll.unemploymentPct"),
									type: "number",
									value: String(p.unemployment_insurance_pct ?? 3),
									onChange: (e) => f((t) => ({
										...t,
										unemployment_insurance_pct: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.payroll.minDailyWage"),
									type: "number",
									value: String(p.payroll_min_daily_wage ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										payroll_min_daily_wage: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.payroll.ceilingMultiplier"),
									type: "number",
									value: String(p.payroll_ceiling_multiplier ?? 7),
									onChange: (e) => f((t) => ({
										...t,
										payroll_ceiling_multiplier: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.payroll.taxExemption"),
									type: "number",
									value: String(p.payroll_tax_exemption ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										payroll_tax_exemption: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.payroll.legalFood"),
									type: "number",
									value: String(p.payroll_legal_food ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										payroll_legal_food: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.payroll.legalHousing"),
									type: "number",
									value: String(p.payroll_legal_housing ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										payroll_legal_housing: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.payroll.legalMarriage"),
									type: "number",
									value: String(p.payroll_legal_marriage ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										payroll_legal_marriage: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.payroll.legalSeniority"),
									type: "number",
									value: String(p.payroll_legal_seniority ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										payroll_legal_seniority: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.payroll.overtimeRate"),
									type: "number",
									value: String(p.payroll_overtime_rate ?? 1.4),
									onChange: (e) => f((t) => ({
										...t,
										payroll_overtime_rate: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.payroll.nightOtRate"),
									type: "number",
									value: String(p.payroll_night_ot_rate ?? 1.35),
									onChange: (e) => f((t) => ({
										...t,
										payroll_night_ot_rate: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.payroll.holidayOtRate"),
									type: "number",
									value: String(p.payroll_holiday_ot_rate ?? 1.4),
									onChange: (e) => f((t) => ({
										...t,
										payroll_holiday_ot_rate: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.payroll.childBenefitEach"),
									type: "number",
									value: String(p.payroll_child_benefit_each ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										payroll_child_benefit_each: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ y(Z, {
									label: r("accounting.payroll.defaultWorkshopId"),
									type: "number",
									value: String(p.default_workshop_id ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										default_workshop_id: Number(e) || 0
									}))
								})
							]
						}),
						/* @__PURE__ */ b("div", {
							className: "flex flex-wrap gap-4",
							children: [/* @__PURE__ */ b("label", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ y(rl, {
									checked: p.payroll_volume_insurable !== !1,
									onCheckedChange: (e) => f((t) => ({
										...t,
										payroll_volume_insurable: e === !0
									}))
								}), r("accounting.payroll.volumeInsurable")]
							}), /* @__PURE__ */ b("label", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ y(rl, {
									checked: p.payroll_sick_counts_worked !== !1,
									onCheckedChange: (e) => f((t) => ({
										...t,
										payroll_sick_counts_worked: e === !0
									}))
								}), r("accounting.payroll.sickCountsWorked")]
							})]
						}),
						/* @__PURE__ */ b("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ y("p", {
								className: "text-sm font-medium",
								children: r("accounting.payroll.taxBrackets")
							}), (p.payroll_tax_brackets ?? []).map((e, t) => /* @__PURE__ */ b("div", {
								className: "flex flex-wrap gap-2",
								children: [/* @__PURE__ */ y(J, {
									className: "max-w-[10rem]",
									type: "number",
									value: String(e.up_to),
									onChange: (e) => f((n) => {
										let r = [...n.payroll_tax_brackets ?? []];
										return r[t] = {
											...r[t],
											up_to: Number(e.target.value) || 0
										}, {
											...n,
											payroll_tax_brackets: r
										};
									}),
									placeholder: r("accounting.payroll.bracketUpTo")
								}), /* @__PURE__ */ y(J, {
									className: "max-w-[6rem]",
									type: "number",
									value: String(e.rate),
									onChange: (e) => f((n) => {
										let r = [...n.payroll_tax_brackets ?? []];
										return r[t] = {
											...r[t],
											rate: Number(e.target.value) || 0
										}, {
											...n,
											payroll_tax_brackets: r
										};
									}),
									placeholder: r("accounting.payroll.bracketRate")
								})]
							}, t))]
						}),
						/* @__PURE__ */ y("p", {
							className: "text-muted-foreground text-xs",
							children: r("accounting.payroll.taminGuide")
						})
					]
				}) : null,
				/* @__PURE__ */ b("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ y(q, {
							onClick: () => void h.mutate(),
							disabled: h.isPending,
							children: r("common.save")
						}),
						o === "moadian" ? /* @__PURE__ */ y(q, {
							variant: "outline",
							onClick: () => void x.mutate(),
							disabled: x.isPending,
							children: r("accounting.testConnection")
						}) : null,
						o === "hesabfa" ? /* @__PURE__ */ b(v, { children: [
							/* @__PURE__ */ y(q, {
								variant: "outline",
								onClick: () => void S.mutate(),
								disabled: S.isPending,
								children: r("accounting.hesabfa.test")
							}),
							/* @__PURE__ */ y(q, {
								variant: "outline",
								onClick: () => void w.mutate(),
								disabled: w.isPending,
								children: r("accounting.hesabfa.registerHook")
							}),
							/* @__PURE__ */ y(q, {
								variant: "outline",
								onClick: () => void E.mutate(),
								disabled: E.isPending,
								children: r("accounting.hesabfa.syncNow")
							}),
							/* @__PURE__ */ y(q, {
								variant: "secondary",
								onClick: () => void T.mutate(),
								disabled: T.isPending,
								children: r("accounting.hesabfa.migrate")
							})
						] }) : null
					]
				})
			]
		})
	});
}
//#endregion
//#region src/components/ui/card.tsx
var Il = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function Ll({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card",
		"data-variant": t,
		className: K("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", Il[t], e),
		...n
	});
}
function Rl({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-header",
		className: K("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function zl({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-title",
		className: K("leading-none font-semibold", e),
		...t
	});
}
function Bl({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-description",
		className: K("text-sm text-muted-foreground", e),
		...t
	});
}
function Vl({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-content",
		className: K("px-6 text-start", e),
		...t
	});
}
function Hl(e) {
	return e.toLowerCase().startsWith("fa");
}
function Ul(e) {
	return e.replace(/\d/g, (e) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(e, 10)] ?? e);
}
//#endregion
//#region src/lib/formatNumber.ts
function Wl(e, t) {
	let n = Number.isFinite(e) ? e : 0, r = Hl(t) ? "fa-IR" : "en-US", i = new Intl.NumberFormat(r, { maximumFractionDigits: 2 }).format(n);
	return Hl(t) ? Ul(i) : i;
}
//#endregion
//#region src/components/reports/BasalamBalanceCard.tsx
function Gl(e) {
	return typeof e != "number" || !Number.isFinite(e) ? null : Math.trunc(e / 10);
}
function Kl() {
	let { t: e, i18n: n } = g(), r = t({
		queryKey: [
			"basalam",
			"finance",
			"balance-lite"
		],
		queryFn: () => X("basalam/finance/balance"),
		retry: !1,
		staleTime: 6e4
	}), i = Gl(r.data?.balance?.data?.balance);
	return r.isError || r.isSuccess && !r.data?.balance?.success && i === null ? null : /* @__PURE__ */ b(Ll, { children: [/* @__PURE__ */ b(Rl, {
		className: "pb-2",
		children: [/* @__PURE__ */ y(zl, {
			className: "text-base",
			children: e("basalam.boothBalance")
		}), /* @__PURE__ */ y(Bl, { children: e("basalam.balanceInReports") })]
	}), /* @__PURE__ */ b(Vl, {
		className: "flex flex-wrap items-center justify-between gap-3",
		children: [/* @__PURE__ */ b("p", {
			className: "text-2xl font-semibold tracking-tight",
			children: [
				r.isLoading ? "…" : i === null ? "—" : Wl(i, n.language),
				" ",
				/* @__PURE__ */ y("span", {
					className: "text-muted-foreground text-sm font-normal",
					children: e("basalam.toman")
				})
			]
		}), /* @__PURE__ */ y(q, {
			asChild: !0,
			size: "sm",
			variant: "outline",
			children: /* @__PURE__ */ y(f, {
				to: "/settings/shop/basalam/finance",
				children: e("basalam.financeDetailsLink")
			})
		})]
	})] });
}
//#endregion
//#region ../Modules/accounting-module/client/pages/accounting/AccountingShell.tsx
var ql = [
	"overview",
	"chart",
	"journals",
	"persons",
	"products",
	"invoices",
	"purchases",
	"expenses",
	"treasury",
	"checks",
	"installments",
	"warehouses",
	"production",
	"moadian",
	"hesabfa",
	"payroll",
	"projects",
	"reports",
	"tools"
];
function Jl(e) {
	return !!e && ql.includes(e);
}
function Yl({ value: e }) {
	return /* @__PURE__ */ y("span", {
		className: "tabular-nums",
		children: Number(e ?? 0).toLocaleString()
	});
}
function Q({ rows: e, columns: t }) {
	return e.length ? /* @__PURE__ */ y("div", {
		className: "overflow-x-auto rounded-md border",
		children: /* @__PURE__ */ b("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ y("thead", { children: /* @__PURE__ */ y("tr", {
				className: "border-b bg-muted/40 text-xs text-muted-foreground",
				children: t.map((e) => /* @__PURE__ */ y("th", {
					className: "px-2 py-2 text-start font-medium",
					children: e.label
				}, e.key))
			}) }), /* @__PURE__ */ y("tbody", { children: e.map((e, n) => /* @__PURE__ */ y("tr", {
				className: "border-b last:border-0",
				children: t.map((t) => /* @__PURE__ */ y("td", {
					className: "px-2 py-2",
					children: String(e[t.key] ?? "—")
				}, t.key))
			}, String(e.id ?? n))) })]
		})
	}) : /* @__PURE__ */ y("p", {
		className: "text-muted-foreground text-sm",
		children: "—"
	});
}
function $(e, n = !0) {
	return t({
		queryKey: ["accounting", e],
		queryFn: async () => X(e),
		enabled: n
	});
}
function Xl() {
	let { t: r } = g(), { section: i } = h(), a = n();
	if (!Jl(i)) return /* @__PURE__ */ y(p, {
		to: "/accounting/overview",
		replace: !0
	});
	let o = t({
		queryKey: ["accounting", "overview"],
		queryFn: async () => X("accounting/overview"),
		enabled: i === "overview"
	}), s = $("accounting/journals", i === "journals"), c = $("accounting/chart", i === "chart"), l = $("accounting/fiscal-years", i === "chart"), m = $("accounting/persons", i === "persons"), x = $("accounting/products", i === "products"), S = $(i === "purchases" ? "accounting/invoices?type=purchase" : "accounting/invoices?type=sale", i === "invoices" || i === "purchases"), w = $("accounting/expenses", i === "expenses"), T = $("accounting/cash-accounts", i === "treasury"), E = $("accounting/vouchers", i === "treasury"), D = $("accounting/checks", i === "checks"), O = $("accounting/installments", i === "installments"), k = $("accounting/warehouses", i === "warehouses"), A = $("accounting/warehouse-stock", i === "warehouses"), j = $("accounting/production", i === "production"), M = $("accounting/moadian/jobs", i === "moadian"), N = $("accounting/hesabfa/jobs", i === "hesabfa"), P = $("accounting/hesabfa/map", i === "hesabfa"), ee = $("accounting/hesabfa/log", i === "hesabfa"), F = $("accounting/employees", i === "payroll"), te = $("accounting/payroll", i === "payroll"), I = $("accounting/workshops", i === "payroll"), ne = $("accounting/decrees", i === "payroll"), re = $("accounting/projects", i === "projects"), [L, R] = d(null), ie = t({
		queryKey: [
			"accounting",
			"payroll-run",
			L
		],
		queryFn: async () => X(`accounting/payroll/${L}`),
		enabled: i === "payroll" && !!L
	}), ae = t({
		queryKey: [
			"accounting",
			"tamin-preview",
			L
		],
		queryFn: async () => X(`accounting/payroll/${L}/tamin-preview`),
		enabled: i === "payroll" && !!L
	}), z = t({
		queryKey: [
			"accounting",
			"reports",
			"bundle"
		],
		queryFn: async () => {
			let [e, t, n, r, i, a, o, s] = await Promise.all([
				X("accounting/reports/pnl"),
				X("accounting/reports/vat"),
				X("accounting/reports/margin"),
				X("accounting/reports/aging"),
				X("accounting/reports/trial-balance"),
				X("accounting/reports/balance-sheet"),
				X("accounting/reports/tax-split"),
				X("accounting/reports/cash-flow")
			]);
			return {
				pnl: e,
				vat: t,
				margin: n,
				aging: r,
				tb: i,
				bs: a,
				taxSplit: o,
				cashFlow: s
			};
		},
		enabled: i === "reports"
	}), [oe, se] = d(""), [ce, le] = d(""), [ue, de] = d(""), [B, V] = d(""), [fe, pe] = d(""), [me, he] = d(""), [ge, _e] = d(""), [ve, ye] = d("0"), [be, xe] = d("0"), [Se, Ce] = d(""), [we, Te] = d(""), [Ee, De] = d(""), [Oe, ke] = d(""), [Ae, je] = d(""), [Me, Ne] = d(""), [Pe, Fe] = d("1404"), [Ie, Le] = d("1"), [Re, ze] = d(""), [Be, Ve] = d(""), [He, Ue] = d("0"), [We, Ge] = d("0"), [Ke, qe] = d("0"), [Je, Ye] = d("0"), [Xe, Ze] = d("0"), [Qe, $e] = d(""), [et, tt] = d("0"), [nt, rt] = d(""), [it, at] = d(""), ot = (e) => {
		let t = window.open("", "_blank");
		t && (t.document.write(e), t.document.close());
	}, st = e({
		mutationFn: async () => X("accounting/persons", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: oe,
				type: "both"
			})
		}),
		onSuccess: async () => {
			_.success(r("common.saved")), se(""), await a.invalidateQueries({ queryKey: ["accounting", "accounting/persons"] });
		},
		onError: (e) => Y(r, e)
	}), ct = e({
		mutationFn: async () => X("accounting/products", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: ce,
				sstid: ue,
				vat_rate: 10
			})
		}),
		onSuccess: async () => {
			_.success(r("common.saved")), le(""), de(""), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), lt = e({
		mutationFn: async () => X("accounting/employees", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				first_name: B,
				last_name: fe,
				name: `${B} ${fe}`.trim(),
				national_id: me,
				insurance_no: ge,
				base_salary: Number(ve) || 0,
				daily_wage: Number(be) || 0,
				job_code: Se,
				workshop_id: we ? Number(we) : void 0
			})
		}),
		onSuccess: async () => {
			_.success(r("common.saved")), V(""), pe(""), he(""), _e(""), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), ut = e({
		mutationFn: async () => X("accounting/workshops", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				code: Ee,
				name: Oe,
				branch_code: Ae,
				row_code: Me,
				is_default: !0
			})
		}),
		onSuccess: async () => {
			_.success(r("common.saved")), De(""), ke(""), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), dt = e({
		mutationFn: async () => X("accounting/payroll/attendance", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				employee_id: Number(Be),
				jalali_year: Number(Pe),
				jalali_month: Number(Ie),
				absent_days: Number(He) || 0,
				leave_days: Number(We) || 0,
				overtime_hours: Number(Ke) || 0,
				volume_qty: Number(Je) || 0,
				piece_rate: Number(Xe) || 0
			})
		}),
		onSuccess: async () => {
			_.success(r("common.saved")), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), ft = e({
		mutationFn: async () => X("accounting/payroll", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				jalali_year: Number(Pe),
				jalali_month: Number(Ie),
				workshop_id: Re ? Number(Re) : void 0
			})
		}),
		onSuccess: async (e) => {
			_.success(r("common.saved")), e?.id && R(e.id), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), pt = e({
		mutationFn: async (e) => X(`accounting/payroll/${e}/post`, { method: "POST" }),
		onSuccess: async () => {
			_.success(r("accounting.posted")), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), mt = e({
		mutationFn: async (e) => X(`accounting/payroll/${e}/recalc`, { method: "POST" }),
		onSuccess: async () => {
			_.success(r("accounting.payroll.recalculated")), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), ht = e({
		mutationFn: async (e) => X(`accounting/payroll/${e}/tamin-dsk`, { method: "POST" }),
		onSuccess: async (e) => {
			_.success(r("accounting.payroll.taminExported")), e.url && window.open(e.url, "_blank", "noopener,noreferrer"), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), gt = e({
		mutationFn: async () => X("accounting/decrees", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				employee_id: Number(Qe),
				decree_type: "hire",
				status: "issued",
				effective_from: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				issue_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				daily_wage: Number(et) || 0,
				job_code: nt
			})
		}),
		onSuccess: async () => {
			_.success(r("common.saved")), $e(""), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), _t = e({
		mutationFn: async () => X("accounting/projects", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: it })
		}),
		onSuccess: async () => {
			_.success(r("common.saved")), at(""), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), vt = e({
		mutationFn: async () => X("accounting/moadian/process", { method: "POST" }),
		onSuccess: async (e) => {
			_.success(r("accounting.moadianProcessed", { count: e.processed })), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), yt = e({
		mutationFn: async () => X("accounting/hesabfa/process", { method: "POST" }),
		onSuccess: async (e) => {
			_.success(r("accounting.hesabfa.processed", { count: e.processed })), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), bt = e({
		mutationFn: async () => X("accounting/hesabfa/sync-now", { method: "POST" }),
		onSuccess: async (e) => {
			_.success(r("accounting.hesabfa.synced", { count: e.pulled ?? 0 })), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), xt = e({
		mutationFn: async () => X("accounting/hesabfa/migrate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}"
		}),
		onSuccess: async (e) => {
			_.success(r("accounting.hesabfa.migrateQueued", { count: e.queued })), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), [St, Ct] = d("iban"), [wt, Tt] = d(""), [Et, Dt] = d(""), Ot = e({
		mutationFn: async () => {
			let e = { type: St };
			return St === "iban" || St === "iban_national" ? e.iban = wt : St === "card" || St === "card_to_iban" || St === "card_national" ? e.card_number = wt : St === "postal" ? e.postal_code = wt : St === "national" || St === "mobile_national" ? e.national_code = wt : St === "credit" || (e.national_code = wt), X("accounting/hesabfa/inquiry", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(e)
			});
		},
		onSuccess: (e) => Dt(JSON.stringify(e.result, null, 2)),
		onError: (e) => Y(r, e)
	}), kt = e({
		mutationFn: async () => X("accounting/sync/backfill", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ limit: 30 })
		}),
		onSuccess: async (e) => {
			_.success(r("accounting.backfillDone", { count: e.synced })), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), At = u(() => ql.map((e) => ({
		id: e,
		label: r(`accounting.nav.${e}`),
		to: `/accounting/${e}`
	})), [r]), jt = r(`accounting.nav.${i}`);
	return /* @__PURE__ */ b(C, {
		title: r("accounting.title"),
		description: jt,
		children: [
			/* @__PURE__ */ y("div", {
				className: "mb-4 flex gap-2 overflow-x-auto pb-1",
				children: At.map((e) => /* @__PURE__ */ y(f, {
					to: e.to,
					className: `shrink-0 rounded-full border px-3 py-1 text-xs ${i === e.id ? "bg-primary text-primary-foreground" : "bg-background"}`,
					children: e.label
				}, e.id))
			}),
			i === "overview" ? /* @__PURE__ */ b("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ y(Zl, {
						title: r("accounting.kpi.profit"),
						value: /* @__PURE__ */ y(Yl, { value: o.data?.profit?.profit })
					}),
					/* @__PURE__ */ y(Zl, {
						title: r("accounting.kpi.margin"),
						value: /* @__PURE__ */ y(Yl, { value: o.data?.margin?.margin })
					}),
					/* @__PURE__ */ y(Zl, {
						title: r("accounting.kpi.moadianPending"),
						value: String(o.data?.moadian_pending ?? 0)
					}),
					/* @__PURE__ */ y("div", {
						className: "md:col-span-3",
						children: /* @__PURE__ */ y(Kl, {})
					}),
					/* @__PURE__ */ b("div", {
						className: "md:col-span-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ y(q, {
							onClick: () => void kt.mutate(),
							disabled: kt.isPending,
							children: r("accounting.backfillOrders")
						}), /* @__PURE__ */ y(q, {
							variant: "outline",
							onClick: () => {
								window.location.href = "/dashboard/settings/shop/accounting";
							},
							children: r("accounting.settings.moadian")
						})]
					})
				]
			}) : null,
			i === "chart" ? /* @__PURE__ */ b("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y("h3", {
					className: "mb-2 text-sm font-semibold",
					children: r("accounting.nav.chart")
				}), /* @__PURE__ */ y(Q, {
					rows: c.data?.items ?? [],
					columns: [
						{
							key: "code",
							label: r("accounting.col.code")
						},
						{
							key: "name",
							label: r("accounting.col.name")
						},
						{
							key: "type",
							label: r("accounting.col.kind")
						},
						{
							key: "is_postable",
							label: r("accounting.col.postable")
						}
					]
				})] }), /* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y("h3", {
					className: "mb-2 text-sm font-semibold",
					children: r("accounting.fiscalYears")
				}), /* @__PURE__ */ y(Q, {
					rows: l.data?.items ?? [],
					columns: [
						{
							key: "id",
							label: "ID"
						},
						{
							key: "title",
							label: r("accounting.col.name")
						},
						{
							key: "starts_on",
							label: r("accounting.col.from")
						},
						{
							key: "ends_on",
							label: r("accounting.col.to")
						},
						{
							key: "is_closed",
							label: r("accounting.col.closed")
						}
					]
				})] })]
			}) : null,
			i === "journals" ? /* @__PURE__ */ y(Q, {
				rows: s.data?.items ?? [],
				columns: [
					{
						key: "id",
						label: "ID"
					},
					{
						key: "document_no",
						label: r("accounting.col.number")
					},
					{
						key: "document_date",
						label: r("accounting.col.date")
					},
					{
						key: "status",
						label: r("accounting.col.status")
					},
					{
						key: "description",
						label: r("accounting.col.description")
					}
				]
			}) : null,
			i === "persons" ? /* @__PURE__ */ b("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ b("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ y(J, {
						className: "max-w-xs",
						value: oe,
						onChange: (e) => se(e.target.value),
						placeholder: r("accounting.personName")
					}), /* @__PURE__ */ y(q, {
						onClick: () => void st.mutate(),
						disabled: !oe || st.isPending,
						children: r("common.save")
					})]
				}), /* @__PURE__ */ y(Q, {
					rows: m.data?.items ?? [],
					columns: [
						{
							key: "id",
							label: "ID"
						},
						{
							key: "name",
							label: r("accounting.col.name")
						},
						{
							key: "person_kind",
							label: r("accounting.col.kind")
						},
						{
							key: "national_id",
							label: r("accounting.col.nationalId")
						},
						{
							key: "mobile",
							label: r("accounting.col.mobile")
						}
					]
				})]
			}) : null,
			i === "products" ? /* @__PURE__ */ b("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ b("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ y(J, {
							className: "max-w-xs",
							value: ce,
							onChange: (e) => le(e.target.value),
							placeholder: r("accounting.productName")
						}),
						/* @__PURE__ */ y(J, {
							className: "max-w-xs",
							value: ue,
							onChange: (e) => de(e.target.value),
							placeholder: r("accounting.sstid")
						}),
						/* @__PURE__ */ y(q, {
							onClick: () => void ct.mutate(),
							disabled: !ce || ct.isPending,
							children: r("common.save")
						})
					]
				}), /* @__PURE__ */ y(Q, {
					rows: x.data?.items ?? [],
					columns: [
						{
							key: "id",
							label: "ID"
						},
						{
							key: "name",
							label: r("accounting.col.name")
						},
						{
							key: "sstid",
							label: r("accounting.sstid")
						},
						{
							key: "vat_rate",
							label: r("accounting.col.vat")
						},
						{
							key: "wc_product_id",
							label: "WC"
						}
					]
				})]
			}) : null,
			i === "invoices" || i === "purchases" ? /* @__PURE__ */ y(Q, {
				rows: S.data?.items ?? [],
				columns: [
					{
						key: "id",
						label: "ID"
					},
					{
						key: "number",
						label: r("accounting.col.number")
					},
					{
						key: "document_date",
						label: r("accounting.col.date")
					},
					{
						key: "total",
						label: r("accounting.col.total")
					},
					{
						key: "status",
						label: r("accounting.col.status")
					},
					{
						key: "moadian_status",
						label: r("accounting.col.moadian")
					}
				]
			}) : null,
			i === "expenses" ? /* @__PURE__ */ y(Q, {
				rows: w.data?.items ?? [],
				columns: [
					{
						key: "id",
						label: "ID"
					},
					{
						key: "number",
						label: r("accounting.col.number")
					},
					{
						key: "total",
						label: r("accounting.col.total")
					},
					{
						key: "status",
						label: r("accounting.col.status")
					}
				]
			}) : null,
			i === "treasury" ? /* @__PURE__ */ b("div", {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ y("h3", {
						className: "text-sm font-semibold",
						children: r("accounting.cashAccounts")
					}),
					/* @__PURE__ */ y(Q, {
						rows: T.data?.items ?? [],
						columns: [
							{
								key: "id",
								label: "ID"
							},
							{
								key: "name",
								label: r("accounting.col.name")
							},
							{
								key: "type",
								label: r("accounting.col.type")
							}
						]
					}),
					/* @__PURE__ */ y("h3", {
						className: "text-sm font-semibold",
						children: r("accounting.vouchers")
					}),
					/* @__PURE__ */ y(Q, {
						rows: E.data?.items ?? [],
						columns: [
							{
								key: "id",
								label: "ID"
							},
							{
								key: "type",
								label: r("accounting.col.type")
							},
							{
								key: "number",
								label: r("accounting.col.number")
							},
							{
								key: "amount",
								label: r("accounting.col.amount")
							},
							{
								key: "status",
								label: r("accounting.col.status")
							}
						]
					})
				]
			}) : null,
			i === "checks" ? /* @__PURE__ */ y(Q, {
				rows: D.data?.items ?? [],
				columns: [
					{
						key: "id",
						label: "ID"
					},
					{
						key: "type",
						label: r("accounting.col.type")
					},
					{
						key: "number",
						label: r("accounting.col.number")
					},
					{
						key: "amount",
						label: r("accounting.col.amount")
					},
					{
						key: "due_date",
						label: r("accounting.col.due")
					},
					{
						key: "status",
						label: r("accounting.col.status")
					}
				]
			}) : null,
			i === "installments" ? /* @__PURE__ */ y(Q, {
				rows: O.data?.items ?? [],
				columns: [
					{
						key: "id",
						label: "ID"
					},
					{
						key: "person_id",
						label: r("accounting.col.person")
					},
					{
						key: "due_on",
						label: r("accounting.col.date")
					},
					{
						key: "amount",
						label: r("accounting.col.total")
					},
					{
						key: "paid_amount",
						label: r("accounting.col.paid")
					},
					{
						key: "status",
						label: r("accounting.col.status")
					},
					{
						key: "direction",
						label: r("accounting.col.kind")
					}
				]
			}) : null,
			i === "warehouses" ? /* @__PURE__ */ b("div", {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ y(Q, {
						rows: k.data?.items ?? [],
						columns: [
							{
								key: "id",
								label: "ID"
							},
							{
								key: "name",
								label: r("accounting.col.name")
							},
							{
								key: "is_default",
								label: r("accounting.col.default")
							}
						]
					}),
					/* @__PURE__ */ y("h3", {
						className: "text-sm font-semibold",
						children: r("accounting.stock")
					}),
					/* @__PURE__ */ y(Q, {
						rows: A.data?.items ?? [],
						columns: [
							{
								key: "warehouse_id",
								label: r("accounting.col.warehouse")
							},
							{
								key: "product_id",
								label: r("accounting.col.product")
							},
							{
								key: "quantity",
								label: r("accounting.col.qty")
							}
						]
					})
				]
			}) : null,
			i === "moadian" ? /* @__PURE__ */ b("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ y(q, {
					onClick: () => void vt.mutate(),
					disabled: vt.isPending,
					children: r("accounting.processMoadian")
				}), /* @__PURE__ */ y(Q, {
					rows: M.data?.items ?? [],
					columns: [
						{
							key: "id",
							label: "ID"
						},
						{
							key: "invoice_id",
							label: r("accounting.col.invoice")
						},
						{
							key: "action",
							label: r("accounting.col.action")
						},
						{
							key: "status",
							label: r("accounting.col.status")
						},
						{
							key: "last_error",
							label: r("accounting.col.error")
						}
					]
				})]
			}) : null,
			i === "hesabfa" ? /* @__PURE__ */ b("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ b("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ y(q, {
								onClick: () => void yt.mutate(),
								disabled: yt.isPending,
								children: r("accounting.hesabfa.process")
							}),
							/* @__PURE__ */ y(q, {
								variant: "outline",
								onClick: () => void bt.mutate(),
								disabled: bt.isPending,
								children: r("accounting.hesabfa.syncNow")
							}),
							/* @__PURE__ */ y(q, {
								variant: "secondary",
								onClick: () => void xt.mutate(),
								disabled: xt.isPending,
								children: r("accounting.hesabfa.migrate")
							}),
							/* @__PURE__ */ y(q, {
								variant: "outline",
								onClick: () => {
									window.location.href = "/dashboard/settings/shop/accounting/hesabfa";
								},
								children: r("accounting.settings.hesabfa")
							})
						]
					}),
					/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y("h3", {
						className: "mb-2 text-sm font-semibold",
						children: r("accounting.hesabfa.jobs")
					}), /* @__PURE__ */ y(Q, {
						rows: N.data?.items ?? [],
						columns: [
							{
								key: "id",
								label: "ID"
							},
							{
								key: "action",
								label: r("accounting.col.action")
							},
							{
								key: "entity_type",
								label: r("accounting.col.kind")
							},
							{
								key: "local_id",
								label: "Local"
							},
							{
								key: "status",
								label: r("accounting.col.status")
							},
							{
								key: "last_error",
								label: r("accounting.col.error")
							}
						]
					})] }),
					/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y("h3", {
						className: "mb-2 text-sm font-semibold",
						children: r("accounting.hesabfa.map")
					}), /* @__PURE__ */ y(Q, {
						rows: P.data?.items ?? [],
						columns: [
							{
								key: "entity_type",
								label: r("accounting.col.kind")
							},
							{
								key: "local_id",
								label: "Local"
							},
							{
								key: "remote_id",
								label: "Remote ID"
							},
							{
								key: "remote_code",
								label: r("accounting.col.code")
							},
							{
								key: "last_direction",
								label: r("accounting.col.action")
							},
							{
								key: "last_synced_at",
								label: r("accounting.col.date")
							}
						]
					})] }),
					/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y("h3", {
						className: "mb-2 text-sm font-semibold",
						children: r("accounting.hesabfa.log")
					}), /* @__PURE__ */ y(Q, {
						rows: ee.data?.items ?? [],
						columns: [
							{
								key: "id",
								label: "ID"
							},
							{
								key: "endpoint",
								label: r("accounting.col.action")
							},
							{
								key: "http_code",
								label: "HTTP"
							},
							{
								key: "direction",
								label: r("accounting.col.kind")
							},
							{
								key: "created_at",
								label: r("accounting.col.date")
							}
						]
					})] }),
					/* @__PURE__ */ b("div", {
						className: "space-y-2 rounded-md border p-3",
						children: [
							/* @__PURE__ */ y("h3", {
								className: "text-sm font-semibold",
								children: r("accounting.hesabfa.inquiry")
							}),
							/* @__PURE__ */ b("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ y(J, {
										className: "max-w-[10rem]",
										value: St,
										onChange: (e) => Ct(e.target.value),
										placeholder: "iban|card|postal|credit"
									}),
									/* @__PURE__ */ y(J, {
										className: "max-w-xs",
										value: wt,
										onChange: (e) => Tt(e.target.value),
										placeholder: r("accounting.hesabfa.inquiryValue")
									}),
									/* @__PURE__ */ y(q, {
										size: "sm",
										onClick: () => void Ot.mutate(),
										disabled: Ot.isPending,
										children: r("accounting.hesabfa.runInquiry")
									})
								]
							}),
							Et ? /* @__PURE__ */ y("pre", {
								className: "bg-muted/40 max-h-48 overflow-auto rounded p-2 text-xs",
								children: Et
							}) : null
						]
					})
				]
			}) : null,
			i === "production" ? /* @__PURE__ */ y(Q, {
				rows: j.data?.items ?? [],
				columns: [
					{
						key: "id",
						label: "ID"
					},
					{
						key: "document_no",
						label: r("accounting.col.number")
					},
					{
						key: "document_date",
						label: r("accounting.col.date")
					},
					{
						key: "output_product_id",
						label: r("accounting.col.product")
					},
					{
						key: "output_qty",
						label: r("accounting.col.qty")
					},
					{
						key: "status",
						label: r("accounting.col.status")
					}
				]
			}) : null,
			i === "payroll" ? /* @__PURE__ */ b("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ b("div", {
						className: "space-y-2 rounded-md border p-3",
						children: [
							/* @__PURE__ */ y("p", {
								className: "text-sm font-medium",
								children: r("accounting.payroll.workshops")
							}),
							/* @__PURE__ */ b("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ y(J, {
										className: "max-w-[8rem]",
										value: Ee,
										onChange: (e) => De(e.target.value),
										placeholder: r("accounting.payroll.workshopCode")
									}),
									/* @__PURE__ */ y(J, {
										className: "max-w-xs",
										value: Oe,
										onChange: (e) => ke(e.target.value),
										placeholder: r("accounting.payroll.workshopName")
									}),
									/* @__PURE__ */ y(J, {
										className: "max-w-[8rem]",
										value: Ae,
										onChange: (e) => je(e.target.value),
										placeholder: r("accounting.payroll.branchCode")
									}),
									/* @__PURE__ */ y(J, {
										className: "max-w-[8rem]",
										value: Me,
										onChange: (e) => Ne(e.target.value),
										placeholder: r("accounting.payroll.rowCode")
									}),
									/* @__PURE__ */ y(q, {
										onClick: () => void ut.mutate(),
										disabled: !Ee || !Oe || ut.isPending,
										children: r("common.save")
									})
								]
							}),
							/* @__PURE__ */ y(Q, {
								rows: I.data?.items ?? [],
								columns: [
									{
										key: "id",
										label: "ID"
									},
									{
										key: "code",
										label: r("accounting.col.code")
									},
									{
										key: "name",
										label: r("accounting.col.name")
									},
									{
										key: "branch_code",
										label: r("accounting.payroll.branchCode")
									},
									{
										key: "is_active",
										label: r("accounting.col.status")
									}
								]
							})
						]
					}),
					/* @__PURE__ */ b("div", {
						className: "space-y-2 rounded-md border p-3",
						children: [
							/* @__PURE__ */ y("p", {
								className: "text-sm font-medium",
								children: r("accounting.payroll.employees")
							}),
							/* @__PURE__ */ b("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ y(J, {
										className: "max-w-[8rem]",
										value: B,
										onChange: (e) => V(e.target.value),
										placeholder: r("accounting.payroll.firstName")
									}),
									/* @__PURE__ */ y(J, {
										className: "max-w-[8rem]",
										value: fe,
										onChange: (e) => pe(e.target.value),
										placeholder: r("accounting.payroll.lastName")
									}),
									/* @__PURE__ */ y(J, {
										className: "max-w-[8rem]",
										value: me,
										onChange: (e) => he(e.target.value),
										placeholder: r("accounting.payroll.nationalId")
									}),
									/* @__PURE__ */ y(J, {
										className: "max-w-[8rem]",
										value: ge,
										onChange: (e) => _e(e.target.value),
										placeholder: r("accounting.payroll.insuranceNo")
									}),
									/* @__PURE__ */ y(J, {
										className: "max-w-[8rem]",
										value: ve,
										onChange: (e) => ye(e.target.value),
										placeholder: r("accounting.baseSalary")
									}),
									/* @__PURE__ */ y(J, {
										className: "max-w-[8rem]",
										value: be,
										onChange: (e) => xe(e.target.value),
										placeholder: r("accounting.payroll.dailyWage")
									}),
									/* @__PURE__ */ y(J, {
										className: "max-w-[6rem]",
										value: Se,
										onChange: (e) => Ce(e.target.value),
										placeholder: r("accounting.payroll.jobCode")
									}),
									/* @__PURE__ */ y(J, {
										className: "max-w-[6rem]",
										value: we,
										onChange: (e) => Te(e.target.value),
										placeholder: r("accounting.payroll.workshopId")
									}),
									/* @__PURE__ */ y(q, {
										onClick: () => void lt.mutate(),
										disabled: !B && !fe || lt.isPending,
										children: r("common.save")
									})
								]
							}),
							/* @__PURE__ */ y(Q, {
								rows: F.data?.items ?? [],
								columns: [
									{
										key: "id",
										label: "ID"
									},
									{
										key: "name",
										label: r("accounting.col.name")
									},
									{
										key: "national_id",
										label: r("accounting.payroll.nationalId")
									},
									{
										key: "insurance_no",
										label: r("accounting.payroll.insuranceNo")
									},
									{
										key: "base_salary",
										label: r("accounting.baseSalary")
									},
									{
										key: "daily_wage",
										label: r("accounting.payroll.dailyWage")
									},
									{
										key: "status",
										label: r("accounting.col.status")
									}
								]
							})
						]
					}),
					/* @__PURE__ */ b("div", {
						className: "space-y-2 rounded-md border p-3",
						children: [/* @__PURE__ */ y("p", {
							className: "text-sm font-medium",
							children: r("accounting.payroll.attendance")
						}), /* @__PURE__ */ b("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ y(J, {
									className: "max-w-[6rem]",
									value: Be,
									onChange: (e) => Ve(e.target.value),
									placeholder: r("accounting.payroll.employeeId")
								}),
								/* @__PURE__ */ y(J, {
									className: "max-w-[5rem]",
									value: Pe,
									onChange: (e) => Fe(e.target.value),
									placeholder: r("accounting.payroll.jalaliYear")
								}),
								/* @__PURE__ */ y(J, {
									className: "max-w-[4rem]",
									value: Ie,
									onChange: (e) => Le(e.target.value),
									placeholder: r("accounting.payroll.jalaliMonth")
								}),
								/* @__PURE__ */ y(J, {
									className: "max-w-[5rem]",
									value: He,
									onChange: (e) => Ue(e.target.value),
									placeholder: r("accounting.payroll.absentDays")
								}),
								/* @__PURE__ */ y(J, {
									className: "max-w-[5rem]",
									value: We,
									onChange: (e) => Ge(e.target.value),
									placeholder: r("accounting.payroll.leaveDays")
								}),
								/* @__PURE__ */ y(J, {
									className: "max-w-[5rem]",
									value: Ke,
									onChange: (e) => qe(e.target.value),
									placeholder: r("accounting.payroll.overtimeHours")
								}),
								/* @__PURE__ */ y(J, {
									className: "max-w-[5rem]",
									value: Je,
									onChange: (e) => Ye(e.target.value),
									placeholder: r("accounting.payroll.volumeQty")
								}),
								/* @__PURE__ */ y(J, {
									className: "max-w-[5rem]",
									value: Xe,
									onChange: (e) => Ze(e.target.value),
									placeholder: r("accounting.payroll.pieceRate")
								}),
								/* @__PURE__ */ y(q, {
									onClick: () => void dt.mutate(),
									disabled: !Be || dt.isPending,
									children: r("common.save")
								})
							]
						})]
					}),
					/* @__PURE__ */ b("div", {
						className: "space-y-2 rounded-md border p-3",
						children: [
							/* @__PURE__ */ y("p", {
								className: "text-sm font-medium",
								children: r("accounting.payroll.decrees")
							}),
							/* @__PURE__ */ b("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ y(J, {
										className: "max-w-[6rem]",
										value: Qe,
										onChange: (e) => $e(e.target.value),
										placeholder: r("accounting.payroll.employeeId")
									}),
									/* @__PURE__ */ y(J, {
										className: "max-w-[8rem]",
										value: et,
										onChange: (e) => tt(e.target.value),
										placeholder: r("accounting.payroll.dailyWage")
									}),
									/* @__PURE__ */ y(J, {
										className: "max-w-[6rem]",
										value: nt,
										onChange: (e) => rt(e.target.value),
										placeholder: r("accounting.payroll.jobCode")
									}),
									/* @__PURE__ */ y(q, {
										onClick: () => void gt.mutate(),
										disabled: !Qe || gt.isPending,
										children: r("accounting.payroll.issueDecree")
									})
								]
							}),
							/* @__PURE__ */ y("div", {
								className: "space-y-2",
								children: (ne.data?.items ?? []).slice(0, 20).map((e) => /* @__PURE__ */ b("div", {
									className: "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
									children: [/* @__PURE__ */ b("span", { children: [
										"#",
										String(e.id),
										" ",
										String(e.decree_no),
										" — emp ",
										String(e.employee_id),
										" — ",
										String(e.status)
									] }), /* @__PURE__ */ y(q, {
										size: "sm",
										variant: "outline",
										onClick: () => void X(`accounting/decrees/${e.id}/print`).then((e) => ot(e.html)).catch((e) => Y(r, e)),
										children: r("accounting.payroll.print")
									})]
								}, String(e.id)))
							})
						]
					}),
					/* @__PURE__ */ b("div", {
						className: "space-y-2 rounded-md border p-3",
						children: [
							/* @__PURE__ */ y("p", {
								className: "text-sm font-medium",
								children: r("accounting.payroll.runs")
							}),
							/* @__PURE__ */ b("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ y(J, {
										className: "max-w-[5rem]",
										value: Pe,
										onChange: (e) => Fe(e.target.value),
										placeholder: r("accounting.payroll.jalaliYear")
									}),
									/* @__PURE__ */ y(J, {
										className: "max-w-[4rem]",
										value: Ie,
										onChange: (e) => Le(e.target.value),
										placeholder: r("accounting.payroll.jalaliMonth")
									}),
									/* @__PURE__ */ y(J, {
										className: "max-w-[6rem]",
										value: Re,
										onChange: (e) => ze(e.target.value),
										placeholder: r("accounting.payroll.workshopId")
									}),
									/* @__PURE__ */ y(q, {
										onClick: () => void ft.mutate(),
										disabled: ft.isPending,
										children: r("accounting.createPayroll")
									})
								]
							}),
							/* @__PURE__ */ y("div", {
								className: "space-y-2",
								children: (te.data?.items ?? []).map((e) => /* @__PURE__ */ b("div", {
									className: "flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm",
									children: [/* @__PURE__ */ b("button", {
										type: "button",
										className: "text-start hover:underline",
										onClick: () => R(Number(e.id)),
										children: [
											String(e.jalali_year ?? ""),
											"/",
											String(e.jalali_month ?? ""),
											" (",
											String(e.year_month),
											") — ",
											String(e.status),
											e.list_status ? ` / ${String(e.list_status)}` : "",
											" — ",
											/* @__PURE__ */ y(Yl, { value: e.total_net })
										]
									}), /* @__PURE__ */ b("div", {
										className: "flex flex-wrap gap-1",
										children: [e.status === "posted" ? null : /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y(q, {
											size: "sm",
											variant: "outline",
											onClick: () => void mt.mutate(Number(e.id)),
											children: r("accounting.payroll.recalc")
										}), /* @__PURE__ */ y(q, {
											size: "sm",
											onClick: () => void pt.mutate(Number(e.id)),
											children: r("accounting.post")
										})] }), /* @__PURE__ */ y(q, {
											size: "sm",
											variant: "secondary",
											onClick: () => void ht.mutate(Number(e.id)),
											disabled: ht.isPending,
											children: r("accounting.payroll.exportTamin")
										})]
									})]
								}, String(e.id)))
							})
						]
					}),
					L && ie.data ? /* @__PURE__ */ b("div", {
						className: "space-y-2 rounded-md border p-3",
						children: [
							/* @__PURE__ */ b("p", {
								className: "text-sm font-medium",
								children: [
									r("accounting.payroll.payslips"),
									" #",
									L
								]
							}),
							/* @__PURE__ */ y("div", {
								className: "space-y-2",
								children: (ie.data.payslips ?? []).map((e) => /* @__PURE__ */ b("div", {
									className: "flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm",
									children: [/* @__PURE__ */ b("span", { children: [
										String(e.employee_name),
										" — ",
										r("accounting.payroll.daysWorked"),
										": ",
										String(e.days_worked),
										" —",
										" ",
										/* @__PURE__ */ y(Yl, { value: e.net })
									] }), /* @__PURE__ */ y(q, {
										size: "sm",
										variant: "outline",
										onClick: () => void X(`accounting/payslips/${e.id}/print`).then((e) => ot(e.html)).catch((e) => Y(r, e)),
										children: r("accounting.payroll.print")
									})]
								}, String(e.id)))
							}),
							/* @__PURE__ */ y(Q, {
								rows: ie.data.payslips ?? [],
								columns: [
									{
										key: "employee_name",
										label: r("accounting.col.name")
									},
									{
										key: "days_worked",
										label: r("accounting.payroll.daysWorked")
									},
									{
										key: "volume_pay",
										label: r("accounting.payroll.volumePay")
									},
									{
										key: "gross",
										label: r("accounting.payroll.gross")
									},
									{
										key: "insurable_capped",
										label: r("accounting.payroll.insurable")
									},
									{
										key: "employee_insurance",
										label: r("accounting.payroll.empIns")
									},
									{
										key: "employer_insurance",
										label: r("accounting.payroll.erIns")
									},
									{
										key: "unemployment_insurance",
										label: r("accounting.payroll.unemp")
									},
									{
										key: "tax",
										label: r("accounting.payroll.tax")
									},
									{
										key: "net",
										label: r("accounting.payroll.net")
									}
								]
							}),
							ae.data?.guide ? /* @__PURE__ */ y("p", {
								className: "text-muted-foreground text-xs",
								children: ae.data.guide
							}) : null,
							ae.data?.workers?.length ? /* @__PURE__ */ y(Q, {
								rows: ae.data.workers,
								columns: [
									{
										key: "DSW_ID1",
										label: r("accounting.payroll.insuranceNo")
									},
									{
										key: "DSW_FNAME",
										label: r("accounting.payroll.firstName")
									},
									{
										key: "DSW_LNAME",
										label: r("accounting.payroll.lastName")
									},
									{
										key: "DSW_DD",
										label: r("accounting.payroll.daysWorked")
									},
									{
										key: "DSW_MASH",
										label: r("accounting.payroll.insurable")
									},
									{
										key: "DSW_BIME",
										label: r("accounting.payroll.empIns")
									}
								]
							}) : null
						]
					}) : null
				]
			}) : null,
			i === "projects" ? /* @__PURE__ */ b("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ b("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ y(J, {
						className: "max-w-xs",
						value: it,
						onChange: (e) => at(e.target.value),
						placeholder: r("accounting.projectName")
					}), /* @__PURE__ */ y(q, {
						onClick: () => void _t.mutate(),
						disabled: !it || _t.isPending,
						children: r("common.save")
					})]
				}), /* @__PURE__ */ y(Q, {
					rows: re.data?.items ?? [],
					columns: [
						{
							key: "id",
							label: "ID"
						},
						{
							key: "code",
							label: r("accounting.col.code")
						},
						{
							key: "name",
							label: r("accounting.col.name")
						},
						{
							key: "status",
							label: r("accounting.col.status")
						},
						{
							key: "budget",
							label: r("accounting.col.budget")
						}
					]
				})]
			}) : null,
			i === "reports" ? /* @__PURE__ */ b("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [
					/* @__PURE__ */ y(Zl, {
						title: r("accounting.report.pnl"),
						value: /* @__PURE__ */ y(Yl, { value: z.data?.pnl?.profit })
					}),
					/* @__PURE__ */ y(Zl, {
						title: r("accounting.report.vat"),
						value: /* @__PURE__ */ y(Yl, { value: z.data?.vat?.net_vat })
					}),
					/* @__PURE__ */ y(Zl, {
						title: r("accounting.report.margin"),
						value: /* @__PURE__ */ y(Yl, { value: z.data?.margin?.margin })
					}),
					/* @__PURE__ */ y(Zl, {
						title: r("accounting.report.balanceSheet"),
						value: /* @__PURE__ */ y(Yl, { value: z.data?.bs?.assets })
					}),
					/* @__PURE__ */ y(Zl, {
						title: r("accounting.report.taxable"),
						value: /* @__PURE__ */ y(Yl, { value: z.data?.taxSplit?.taxable })
					}),
					/* @__PURE__ */ y(Zl, {
						title: r("accounting.report.exempt"),
						value: /* @__PURE__ */ y(Yl, { value: z.data?.taxSplit?.exempt })
					}),
					/* @__PURE__ */ y(Zl, {
						title: r("accounting.report.cashFlow"),
						value: /* @__PURE__ */ y(Yl, { value: z.data?.cashFlow?.net })
					}),
					/* @__PURE__ */ b("div", {
						className: "md:col-span-2",
						children: [/* @__PURE__ */ y("h3", {
							className: "mb-2 text-sm font-semibold",
							children: r("accounting.report.trialBalance")
						}), /* @__PURE__ */ y(Q, {
							rows: Array.isArray(z.data?.tb) ? z.data?.tb : z.data?.tb?.rows ?? [],
							columns: [
								{
									key: "code",
									label: r("accounting.col.code")
								},
								{
									key: "name",
									label: r("accounting.col.name")
								},
								{
									key: "debit",
									label: r("accounting.col.debit")
								},
								{
									key: "credit",
									label: r("accounting.col.credit")
								},
								{
									key: "balance",
									label: r("accounting.col.balance")
								}
							]
						})]
					})
				]
			}) : null,
			i === "tools" ? /* @__PURE__ */ b("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ y(q, {
						type: "button",
						onClick: () => void X("accounting/backup", { method: "POST" }).then((e) => {
							_.success(r("common.saved")), e.url && window.open(e.url, "_blank");
						}).catch((e) => Y(r, e)),
						children: r("accounting.backup")
					}),
					/* @__PURE__ */ y(q, {
						type: "button",
						variant: "outline",
						onClick: () => void X("accounting/export/csv?resource=invoices").then((e) => {
							let t = new Blob([e.csv], { type: "text/csv;charset=utf-8" }), n = document.createElement("a");
							n.href = URL.createObjectURL(t), n.download = e.filename, n.click();
						}).catch((e) => Y(r, e)),
						children: r("accounting.exportCsv")
					}),
					/* @__PURE__ */ y(q, {
						type: "button",
						variant: "outline",
						onClick: () => void X("accounting/calculator", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								op: "percent",
								a: 1e6,
								b: 10
							})
						}).then((e) => _.success(String(e.result ?? ""))).catch((e) => Y(r, e)),
						children: r("accounting.calculator")
					})
				]
			}) : null
		]
	});
}
function Zl({ title: e, value: t }) {
	return /* @__PURE__ */ b("div", {
		className: "rounded-lg border border-border p-4",
		children: [/* @__PURE__ */ y("div", {
			className: "text-muted-foreground text-xs",
			children: e
		}), /* @__PURE__ */ y("div", {
			className: "mt-1 text-xl font-semibold",
			children: t
		})]
	});
}
//#endregion
//#region ../Modules/accounting-module/client/pages/accounting/MyPayrollPage.tsx
function Ql(e) {
	let t = window.open("", "_blank");
	t && (t.document.write(e), t.document.close());
}
function $l() {
	let { t: e } = g(), n = t({
		queryKey: ["accounting", "my-payslips"],
		queryFn: async () => X("accounting/my/payslips")
	}), r = t({
		queryKey: ["accounting", "my-decrees"],
		queryFn: async () => X("accounting/my/decrees")
	}), i = async (t) => {
		try {
			Ql((await X(`accounting/payslips/${t}/print`)).html);
		} catch (t) {
			Y(e, t);
		}
	}, a = async (t) => {
		try {
			Ql((await X(`accounting/decrees/${t}/print`)).html);
		} catch (t) {
			Y(e, t);
		}
	};
	return /* @__PURE__ */ b(C, {
		title: e("accounting.payroll.myPayroll"),
		description: e("accounting.payroll.myPayrollHelp"),
		children: [/* @__PURE__ */ b("section", {
			className: "mb-6 space-y-2",
			children: [/* @__PURE__ */ y("h2", {
				className: "text-sm font-medium",
				children: e("accounting.payroll.payslips")
			}), /* @__PURE__ */ b("div", {
				className: "space-y-2",
				children: [(n.data?.items ?? []).map((t) => /* @__PURE__ */ b("div", {
					className: "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
					children: [/* @__PURE__ */ b("span", { children: [
						"#",
						String(t.id),
						" — ",
						String(t.gross ?? ""),
						" / ",
						String(t.net ?? "")
					] }), /* @__PURE__ */ y(q, {
						size: "sm",
						variant: "outline",
						onClick: () => void i(Number(t.id)),
						children: e("accounting.payroll.print")
					})]
				}, String(t.id))), n.data?.items?.length ? null : /* @__PURE__ */ y("p", {
					className: "text-muted-foreground text-sm",
					children: "—"
				})]
			})]
		}), /* @__PURE__ */ b("section", {
			className: "space-y-2",
			children: [/* @__PURE__ */ y("h2", {
				className: "text-sm font-medium",
				children: e("accounting.payroll.decrees")
			}), /* @__PURE__ */ b("div", {
				className: "space-y-2",
				children: [(r.data?.items ?? []).map((t) => /* @__PURE__ */ b("div", {
					className: "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
					children: [/* @__PURE__ */ b("span", { children: [
						String(t.decree_no),
						" — ",
						String(t.decree_type),
						" — ",
						String(t.status)
					] }), /* @__PURE__ */ y(q, {
						size: "sm",
						variant: "outline",
						onClick: () => void a(Number(t.id)),
						children: e("accounting.payroll.print")
					})]
				}, String(t.id))), r.data?.items?.length ? null : /* @__PURE__ */ y("p", {
					className: "text-muted-foreground text-sm",
					children: "—"
				})]
			})]
		})]
	});
}
//#endregion
//#region ../Modules/accounting-module/client/module-entry.tsx
var eu = {
	"accounting/my-payroll": $l,
	"accounting/:section": Xl,
	"settings/shop/accounting": Fl,
	"settings/shop/accounting/company": Fl,
	"settings/shop/accounting/sync": Fl,
	"settings/shop/accounting/tax": Fl,
	"settings/shop/accounting/hesabfa": Fl,
	"settings/shop/accounting/payroll": Fl
}, tu = { routes: eu };
//#endregion
export { tu as default, eu as routes };
