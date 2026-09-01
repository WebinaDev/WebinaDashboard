import { useMutation as e, useQuery as t, useQueryClient as n } from "@tanstack/react-query";
import * as r from "react";
import i, { createContext as a, createElement as o, forwardRef as s, useCallback as c, useContext as l, useEffect as u, useLayoutEffect as d, useMemo as f, useRef as p, useState as m } from "react";
import { initReactI18next as h, useTranslation as g } from "react-i18next";
import { toast as _ } from "sonner";
import * as v from "react-dom";
import y from "react-dom";
import { Fragment as b, jsx as x, jsxs as S } from "react/jsx-runtime";
import { Link as C, useMatch as w, useNavigate as T, useParams as E } from "react-router-dom";
import ee from "i18next";
//#region \0rolldown/runtime.js
var D = Object.defineProperty, O = (e, t) => () => (e && (t = e(e = 0)), t), k = (e, t) => {
	let n = {};
	for (var r in e) D(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || D(n, Symbol.toStringTag, { value: "Module" }), n;
};
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function A(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") if (Array.isArray(e)) {
		var i = e.length;
		for (t = 0; t < i; t++) e[t] && (n = A(e[t])) && (r && (r += " "), r += n);
	} else for (n in e) e[n] && (r && (r += " "), r += n);
	return r;
}
function j() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = A(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/class-variance-authority/dist/index.mjs
var M = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, N = j, te = (e, t) => (n) => {
	if (t?.variants == null) return N(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = M(t) || M(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return N(e, a, t?.compoundVariants?.reduce((e, t) => {
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
function P(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function ne(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = P(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : P(e[t], null);
			}
		};
	};
}
function F(...e) {
	return r.useCallback(ne(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function re(e) {
	let t = /* @__PURE__ */ ie(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(L);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ x(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ x(t, {
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
			let e = oe(n), a = ae(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? ne(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var I = Symbol("radix.slottable");
function L(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === I;
}
function ae(e, t) {
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
function oe(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/dist/index.mjs
var R = [
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
		return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ x(o, {
			...a,
			ref: r
		});
	});
	return i.displayName = `Primitive.${t}`, {
		...e,
		[t]: i
	};
}, {});
function se(e, t) {
	e && v.flushSync(() => e.dispatchEvent(t));
}
//#endregion
//#region node_modules/@radix-ui/react-visually-hidden/dist/index.mjs
var ce = Object.freeze({
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
}), le = "VisuallyHidden", ue = r.forwardRef((e, t) => /* @__PURE__ */ x(R.span, {
	...e,
	ref: t,
	style: {
		...ce,
		...e.style
	}
}));
ue.displayName = le;
//#endregion
//#region node_modules/@radix-ui/react-context/dist/index.mjs
function de(e, t) {
	let n = r.createContext(t), i = (e) => {
		let { children: t, ...i } = e, a = r.useMemo(() => i, Object.values(i));
		return /* @__PURE__ */ x(n.Provider, {
			value: a,
			children: t
		});
	};
	i.displayName = e + "Provider";
	function a(i) {
		let a = r.useContext(n);
		if (a) return a;
		if (t !== void 0) return t;
		throw Error(`\`${i}\` must be used within \`${e}\``);
	}
	return [i, a];
}
function fe(e, t = []) {
	let n = [];
	function i(t, i) {
		let a = r.createContext(i), o = n.length;
		n = [...n, i];
		let s = (t) => {
			let { scope: n, children: i, ...s } = t, c = n?.[e]?.[o] || a, l = r.useMemo(() => s, Object.values(s));
			return /* @__PURE__ */ x(c.Provider, {
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
			return /* @__PURE__ */ x(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ x(t, {
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
			return n.type !== r.Fragment && (a.ref = t ? ne(t, e) : e), r.cloneElement(n, a);
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
		return /* @__PURE__ */ x(a, {
			scope: t,
			itemMap: o,
			collectionRef: r,
			children: n
		});
	};
	s.displayName = t;
	let c = e + "CollectionSlot", l = /* @__PURE__ */ me(c), u = i.forwardRef((e, t) => {
		let { scope: n, children: r } = e;
		return /* @__PURE__ */ x(l, {
			ref: F(t, o(c, n).collectionRef),
			children: r
		});
	});
	u.displayName = c;
	let d = e + "CollectionItemSlot", f = "data-radix-collection-item", p = /* @__PURE__ */ me(d), m = i.forwardRef((e, t) => {
		let { scope: n, children: r, ...a } = e, s = i.useRef(null), c = F(t, s), l = o(d, n);
		return i.useEffect(() => (l.itemMap.set(s, {
			ref: s,
			...a
		}), () => void l.itemMap.delete(s))), /* @__PURE__ */ x(p, {
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
function z(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var xe = globalThis?.document ? r.useLayoutEffect : () => {}, Se = r.useInsertionEffect || xe;
function Ce({ prop: e, defaultProp: t, onChange: n = () => {}, caller: i }) {
	let [a, o, s] = we({
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
			let n = Te(t) ? t(e) : t;
			n !== e && s.current?.(n);
		} else o(t);
	}, [
		c,
		e,
		o,
		s
	])];
}
function we({ defaultProp: e, onChange: t }) {
	let [n, i] = r.useState(e), a = r.useRef(n), o = r.useRef(t);
	return Se(() => {
		o.current = t;
	}, [t]), r.useEffect(() => {
		a.current !== n && (o.current?.(n), a.current = n);
	}, [n, a]), [
		n,
		i,
		o
	];
}
function Te(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/@radix-ui/react-presence/dist/index.mjs
function Ee(e, t) {
	return r.useReducer((e, n) => t[e][n] ?? e, e);
}
var De = (e) => {
	let { present: t, children: n } = e, i = Oe(t), a = typeof n == "function" ? n({ present: i.isPresent }) : r.Children.only(n), o = F(i.ref, Ae(a));
	return typeof n == "function" || i.isPresent ? r.cloneElement(a, { ref: o }) : null;
};
De.displayName = "Presence";
function Oe(e) {
	let [t, n] = r.useState(), i = r.useRef(null), a = r.useRef(e), o = r.useRef("none"), [s, c] = Ee(e ? "mounted" : "unmounted", {
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
		let e = ke(i.current);
		o.current = s === "mounted" ? e : "none";
	}, [s]), xe(() => {
		let t = i.current, n = a.current;
		if (n !== e) {
			let r = o.current, i = ke(t);
			e ? c("MOUNT") : i === "none" || t?.display === "none" ? c("UNMOUNT") : c(n && r !== i ? "ANIMATION_OUT" : "UNMOUNT"), a.current = e;
		}
	}, [e, c]), xe(() => {
		if (t) {
			let e, n = t.ownerDocument.defaultView ?? window, r = (r) => {
				let o = ke(i.current).includes(CSS.escape(r.animationName));
				if (r.target === t && o && (c("ANIMATION_END"), !a.current)) {
					let r = t.style.animationFillMode;
					t.style.animationFillMode = "forwards", e = n.setTimeout(() => {
						t.style.animationFillMode === "forwards" && (t.style.animationFillMode = r);
					});
				}
			}, s = (e) => {
				e.target === t && (o.current = ke(i.current));
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
function ke(e) {
	return e?.animationName || "none";
}
function Ae(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-id/dist/index.mjs
var je = r.useId || (() => void 0), Me = 0;
function Ne(e) {
	let [t, n] = r.useState(je());
	return xe(() => {
		e || n((e) => e ?? String(Me++));
	}, [e]), e || (t ? `radix-${t}` : "");
}
//#endregion
//#region node_modules/@radix-ui/react-direction/dist/index.mjs
var Pe = r.createContext(void 0);
function Fe(e) {
	let t = r.useContext(Pe);
	return e || t || "ltr";
}
//#endregion
//#region node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
function Ie(e) {
	let t = r.useRef(e);
	return r.useEffect(() => {
		t.current = e;
	}), r.useMemo(() => (...e) => t.current?.(...e), []);
}
//#endregion
//#region node_modules/@radix-ui/react-use-escape-keydown/dist/index.mjs
function Le(e, t = globalThis?.document) {
	let n = Ie(e);
	r.useEffect(() => {
		let e = (e) => {
			e.key === "Escape" && n(e);
		};
		return t.addEventListener("keydown", e, { capture: !0 }), () => t.removeEventListener("keydown", e, { capture: !0 });
	}, [n, t]);
}
//#endregion
//#region node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var Re = "DismissableLayer", ze = "dismissableLayer.update", Be = "dismissableLayer.pointerDownOutside", Ve = "dismissableLayer.focusOutside", He, Ue = r.createContext({
	layers: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), We = r.forwardRef((e, t) => {
	let { disableOutsidePointerEvents: n = !1, onEscapeKeyDown: i, onPointerDownOutside: a, onFocusOutside: o, onInteractOutside: s, onDismiss: c, ...l } = e, u = r.useContext(Ue), [d, f] = r.useState(null), p = d?.ownerDocument ?? globalThis?.document, [, m] = r.useState({}), h = F(t, (e) => f(e)), g = Array.from(u.layers), [_] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1), v = g.indexOf(_), y = d ? g.indexOf(d) : -1, b = u.layersWithOutsidePointerEventsDisabled.size > 0, S = y >= v, C = qe((e) => {
		let t = e.target, n = [...u.branches].some((e) => e.contains(t));
		!S || n || (a?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p), w = Je((e) => {
		let t = e.target;
		[...u.branches].some((e) => e.contains(t)) || (o?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p);
	return Le((e) => {
		y === u.layers.size - 1 && (i?.(e), !e.defaultPrevented && c && (e.preventDefault(), c()));
	}, p), r.useEffect(() => {
		if (d) return n && (u.layersWithOutsidePointerEventsDisabled.size === 0 && (He = p.body.style.pointerEvents, p.body.style.pointerEvents = "none"), u.layersWithOutsidePointerEventsDisabled.add(d)), u.layers.add(d), Ye(), () => {
			n && u.layersWithOutsidePointerEventsDisabled.size === 1 && (p.body.style.pointerEvents = He);
		};
	}, [
		d,
		p,
		n,
		u
	]), r.useEffect(() => () => {
		d && (u.layers.delete(d), u.layersWithOutsidePointerEventsDisabled.delete(d), Ye());
	}, [d, u]), r.useEffect(() => {
		let e = () => m({});
		return document.addEventListener(ze, e), () => document.removeEventListener(ze, e);
	}, []), /* @__PURE__ */ x(R.div, {
		...l,
		ref: h,
		style: {
			pointerEvents: b ? S ? "auto" : "none" : void 0,
			...e.style
		},
		onFocusCapture: z(e.onFocusCapture, w.onFocusCapture),
		onBlurCapture: z(e.onBlurCapture, w.onBlurCapture),
		onPointerDownCapture: z(e.onPointerDownCapture, C.onPointerDownCapture)
	});
});
We.displayName = Re;
var Ge = "DismissableLayerBranch", Ke = r.forwardRef((e, t) => {
	let n = r.useContext(Ue), i = r.useRef(null), a = F(t, i);
	return r.useEffect(() => {
		let e = i.current;
		if (e) return n.branches.add(e), () => {
			n.branches.delete(e);
		};
	}, [n.branches]), /* @__PURE__ */ x(R.div, {
		...e,
		ref: a
	});
});
Ke.displayName = Ge;
function qe(e, t = globalThis?.document) {
	let n = Ie(e), i = r.useRef(!1), a = r.useRef(() => {});
	return r.useEffect(() => {
		let e = (e) => {
			if (e.target && !i.current) {
				let r = function() {
					Xe(Be, n, i, { discrete: !0 });
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
function Je(e, t = globalThis?.document) {
	let n = Ie(e), i = r.useRef(!1);
	return r.useEffect(() => {
		let e = (e) => {
			e.target && !i.current && Xe(Ve, n, { originalEvent: e }, { discrete: !1 });
		};
		return t.addEventListener("focusin", e), () => t.removeEventListener("focusin", e);
	}, [t, n]), {
		onFocusCapture: () => i.current = !0,
		onBlurCapture: () => i.current = !1
	};
}
function Ye() {
	let e = new CustomEvent(ze);
	document.dispatchEvent(e);
}
function Xe(e, t, n, { discrete: r }) {
	let i = n.originalEvent.target, a = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && i.addEventListener(e, t, { once: !0 }), r ? se(i, a) : i.dispatchEvent(a);
}
//#endregion
//#region node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var Ze = "focusScope.autoFocusOnMount", Qe = "focusScope.autoFocusOnUnmount", $e = {
	bubbles: !1,
	cancelable: !0
}, et = "FocusScope", tt = r.forwardRef((e, t) => {
	let { loop: n = !1, trapped: i = !1, onMountAutoFocus: a, onUnmountAutoFocus: o, ...s } = e, [c, l] = r.useState(null), u = Ie(a), d = Ie(o), f = r.useRef(null), p = F(t, (e) => l(e)), m = r.useRef({
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
				c.contains(t) ? f.current = t : ct(f.current, { select: !0 });
			}, t = function(e) {
				if (m.paused || !c) return;
				let t = e.relatedTarget;
				t !== null && (c.contains(t) || ct(f.current, { select: !0 }));
			}, n = function(e) {
				if (document.activeElement === document.body) for (let t of e) t.removedNodes.length > 0 && ct(c);
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
			lt.add(m);
			let e = document.activeElement;
			if (!c.contains(e)) {
				let t = new CustomEvent(Ze, $e);
				c.addEventListener(Ze, u), c.dispatchEvent(t), t.defaultPrevented || (nt(ft(it(c)), { select: !0 }), document.activeElement === e && ct(c));
			}
			return () => {
				c.removeEventListener(Ze, u), setTimeout(() => {
					let t = new CustomEvent(Qe, $e);
					c.addEventListener(Qe, d), c.dispatchEvent(t), t.defaultPrevented || ct(e ?? document.body, { select: !0 }), c.removeEventListener(Qe, d), lt.remove(m);
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
			let t = e.currentTarget, [i, a] = rt(t);
			i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n && ct(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n && ct(a, { select: !0 })) : r === t && e.preventDefault();
		}
	}, [
		n,
		i,
		m.paused
	]);
	return /* @__PURE__ */ x(R.div, {
		tabIndex: -1,
		...s,
		ref: p,
		onKeyDown: h
	});
});
tt.displayName = et;
function nt(e, { select: t = !1 } = {}) {
	let n = document.activeElement;
	for (let r of e) if (ct(r, { select: t }), document.activeElement !== n) return;
}
function rt(e) {
	let t = it(e);
	return [at(t, e), at(t.reverse(), e)];
}
function it(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t;
}
function at(e, t) {
	for (let n of e) if (!ot(n, { upTo: t })) return n;
}
function ot(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function st(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function ct(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = document.activeElement;
		e.focus({ preventScroll: !0 }), e !== n && st(e) && t && e.select();
	}
}
var lt = ut();
function ut() {
	let e = [];
	return {
		add(t) {
			let n = e[0];
			t !== n && n?.pause(), e = dt(e, t), e.unshift(t);
		},
		remove(t) {
			e = dt(e, t), e[0]?.resume();
		}
	};
}
function dt(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
function ft(e) {
	return e.filter((e) => e.tagName !== "A");
}
//#endregion
//#region node_modules/@radix-ui/react-portal/dist/index.mjs
var pt = "Portal", mt = r.forwardRef((e, t) => {
	let { container: n, ...i } = e, [a, o] = r.useState(!1);
	xe(() => o(!0), []);
	let s = n || a && globalThis?.document?.body;
	return s ? y.createPortal(/* @__PURE__ */ x(R.div, {
		...i,
		ref: t
	}), s) : null;
});
mt.displayName = pt;
//#endregion
//#region node_modules/@radix-ui/react-focus-guards/dist/index.mjs
var ht = 0;
function gt() {
	r.useEffect(() => {
		let e = document.querySelectorAll("[data-radix-focus-guard]");
		return document.body.insertAdjacentElement("afterbegin", e[0] ?? _t()), document.body.insertAdjacentElement("beforeend", e[1] ?? _t()), ht++, () => {
			ht === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((e) => e.remove()), ht--;
		};
	}, []);
}
function _t() {
	let e = document.createElement("span");
	return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
//#endregion
//#region node_modules/tslib/tslib.es6.mjs
var vt = function() {
	return vt = Object.assign || function(e) {
		for (var t, n = 1, r = arguments.length; n < r; n++) for (var i in t = arguments[n], t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
		return e;
	}, vt.apply(this, arguments);
};
function yt(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
function bt(e, t, n) {
	if (n || arguments.length === 2) for (var r = 0, i = t.length, a; r < i; r++) (a || !(r in t)) && (a || (a = Array.prototype.slice.call(t, 0, r)), a[r] = t[r]);
	return e.concat(a || Array.prototype.slice.call(t));
}
//#endregion
//#region node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var xt = "right-scroll-bar-position", St = "width-before-scroll-bar", Ct = "with-scroll-bars-hidden", wt = "--removed-body-scroll-bar-size";
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/assignRef.js
function Tt(e, t) {
	return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/useRef.js
function Et(e, t) {
	var n = m(function() {
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
var Dt = typeof window < "u" ? r.useLayoutEffect : r.useEffect, Ot = /* @__PURE__ */ new WeakMap();
function kt(e, t) {
	var n = Et(t || null, function(t) {
		return e.forEach(function(e) {
			return Tt(e, t);
		});
	});
	return Dt(function() {
		var t = Ot.get(n);
		if (t) {
			var r = new Set(t), i = new Set(e), a = n.current;
			r.forEach(function(e) {
				i.has(e) || Tt(e, null);
			}), i.forEach(function(e) {
				r.has(e) || Tt(e, a);
			});
		}
		Ot.set(n, e);
	}, [e]), n;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/medium.js
function At(e) {
	return e;
}
function jt(e, t) {
	t === void 0 && (t = At);
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
function Mt(e) {
	e === void 0 && (e = {});
	var t = jt(null);
	return t.options = vt({
		async: !0,
		ssr: !1
	}, e), t;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/exports.js
var Nt = function(e) {
	var t = e.sideCar, n = yt(e, ["sideCar"]);
	if (!t) throw Error("Sidecar: please provide `sideCar` property to import the right car");
	var i = t.read();
	if (!i) throw Error("Sidecar medium not found");
	return r.createElement(i, vt({}, n));
};
Nt.isSideCarExport = !0;
function Pt(e, t) {
	return e.useMedium(t), Nt;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/medium.js
var Ft = Mt(), It = function() {}, Lt = r.forwardRef(function(e, t) {
	var n = r.useRef(null), i = r.useState({
		onScrollCapture: It,
		onWheelCapture: It,
		onTouchMoveCapture: It
	}), a = i[0], o = i[1], s = e.forwardProps, c = e.children, l = e.className, u = e.removeScrollBar, d = e.enabled, f = e.shards, p = e.sideCar, m = e.noRelative, h = e.noIsolation, g = e.inert, _ = e.allowPinchZoom, v = e.as, y = v === void 0 ? "div" : v, b = e.gapMode, x = yt(e, [
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
	]), S = p, C = kt([n, t]), w = vt(vt({}, x), a);
	return r.createElement(r.Fragment, null, d && r.createElement(S, {
		sideCar: Ft,
		removeScrollBar: u,
		shards: f,
		noRelative: m,
		noIsolation: h,
		inert: g,
		setCallbacks: o,
		allowPinchZoom: !!_,
		lockRef: n,
		gapMode: b
	}), s ? r.cloneElement(r.Children.only(c), vt(vt({}, w), { ref: C })) : r.createElement(y, vt({}, w, {
		className: l,
		ref: C
	}), c));
});
Lt.defaultProps = {
	enabled: !0,
	removeScrollBar: !0,
	inert: !1
}, Lt.classNames = {
	fullWidth: St,
	zeroRight: xt
};
//#endregion
//#region node_modules/get-nonce/dist/es2015/index.js
var Rt, zt = function() {
	if (Rt) return Rt;
	if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
//#endregion
//#region node_modules/react-style-singleton/dist/es2015/singleton.js
function Bt() {
	if (!document) return null;
	var e = document.createElement("style");
	e.type = "text/css";
	var t = zt();
	return t && e.setAttribute("nonce", t), e;
}
function Vt(e, t) {
	e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function Ht(e) {
	(document.head || document.getElementsByTagName("head")[0]).appendChild(e);
}
var Ut = function() {
	var e = 0, t = null;
	return {
		add: function(n) {
			e == 0 && (t = Bt()) && (Vt(t, n), Ht(t)), e++;
		},
		remove: function() {
			e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
		}
	};
}, Wt = function() {
	var e = Ut();
	return function(t, n) {
		r.useEffect(function() {
			return e.add(t), function() {
				e.remove();
			};
		}, [t && n]);
	};
}, Gt = function() {
	var e = Wt();
	return function(t) {
		var n = t.styles, r = t.dynamic;
		return e(n, r), null;
	};
}, Kt = {
	left: 0,
	top: 0,
	right: 0,
	gap: 0
}, qt = function(e) {
	return parseInt(e || "", 10) || 0;
}, Jt = function(e) {
	var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
	return [
		qt(n),
		qt(r),
		qt(i)
	];
}, Yt = function(e) {
	if (e === void 0 && (e = "margin"), typeof window > "u") return Kt;
	var t = Jt(e), n = document.documentElement.clientWidth, r = window.innerWidth;
	return {
		left: t[0],
		top: t[1],
		right: t[2],
		gap: Math.max(0, r - n + t[2] - t[0])
	};
}, Xt = Gt(), Zt = "data-scroll-locked", Qt = function(e, t, n, r) {
	var i = e.left, a = e.top, o = e.right, s = e.gap;
	return n === void 0 && (n = "margin"), `
  .${Ct} {
   overflow: hidden ${r};
   padding-right: ${s}px ${r};
  }
  body[${Zt}] {
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
  
  .${xt} {
    right: ${s}px ${r};
  }
  
  .${St} {
    margin-right: ${s}px ${r};
  }
  
  .${xt} .${xt} {
    right: 0 ${r};
  }
  
  .${St} .${St} {
    margin-right: 0 ${r};
  }
  
  body[${Zt}] {
    ${wt}: ${s}px;
  }
`;
}, $t = function() {
	var e = parseInt(document.body.getAttribute("data-scroll-locked") || "0", 10);
	return isFinite(e) ? e : 0;
}, en = function() {
	r.useEffect(function() {
		return document.body.setAttribute(Zt, ($t() + 1).toString()), function() {
			var e = $t() - 1;
			e <= 0 ? document.body.removeAttribute(Zt) : document.body.setAttribute(Zt, e.toString());
		};
	}, []);
}, tn = function(e) {
	var t = e.noRelative, n = e.noImportant, i = e.gapMode, a = i === void 0 ? "margin" : i;
	en();
	var o = r.useMemo(function() {
		return Yt(a);
	}, [a]);
	return r.createElement(Xt, { styles: Qt(o, !t, a, n ? "" : "!important") });
}, nn = !1;
if (typeof window < "u") try {
	var rn = Object.defineProperty({}, "passive", { get: function() {
		return nn = !0, !0;
	} });
	window.addEventListener("test", rn, rn), window.removeEventListener("test", rn, rn);
} catch {
	nn = !1;
}
var an = nn ? { passive: !1 } : !1, on = function(e) {
	return e.tagName === "TEXTAREA";
}, sn = function(e, t) {
	if (!(e instanceof Element)) return !1;
	var n = window.getComputedStyle(e);
	return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !on(e) && n[t] === "visible");
}, cn = function(e) {
	return sn(e, "overflowY");
}, ln = function(e) {
	return sn(e, "overflowX");
}, un = function(e, t) {
	var n = t.ownerDocument, r = t;
	do {
		if (typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host), pn(e, r)) {
			var i = mn(e, r);
			if (i[1] > i[2]) return !0;
		}
		r = r.parentNode;
	} while (r && r !== n.body);
	return !1;
}, dn = function(e) {
	return [
		e.scrollTop,
		e.scrollHeight,
		e.clientHeight
	];
}, fn = function(e) {
	return [
		e.scrollLeft,
		e.scrollWidth,
		e.clientWidth
	];
}, pn = function(e, t) {
	return e === "v" ? cn(t) : ln(t);
}, mn = function(e, t) {
	return e === "v" ? dn(t) : fn(t);
}, hn = function(e, t) {
	return e === "h" && t === "rtl" ? -1 : 1;
}, gn = function(e, t, n, r, i) {
	var a = hn(e, window.getComputedStyle(t).direction), o = a * r, s = n.target, c = t.contains(s), l = !1, u = o > 0, d = 0, f = 0;
	do {
		if (!s) break;
		var p = mn(e, s), m = p[0], h = p[1] - p[2] - a * m;
		(m || h) && pn(e, s) && (d += h, f += m);
		var g = s.parentNode;
		s = g && g.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? g.host : g;
	} while (!c && s !== document.body || c && (t.contains(s) || t === s));
	return (u && (i && Math.abs(d) < 1 || !i && o > d) || !u && (i && Math.abs(f) < 1 || !i && -o > f)) && (l = !0), l;
}, _n = function(e) {
	return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, vn = function(e) {
	return [e.deltaX, e.deltaY];
}, yn = function(e) {
	return e && "current" in e ? e.current : e;
}, bn = function(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}, xn = function(e) {
	return `
  .block-interactivity-${e} {pointer-events: none;}
  .allow-interactivity-${e} {pointer-events: all;}
`;
}, Sn = 0, Cn = [];
function wn(e) {
	var t = r.useRef([]), n = r.useRef([0, 0]), i = r.useRef(), a = r.useState(Sn++)[0], o = r.useState(Gt)[0], s = r.useRef(e);
	r.useEffect(function() {
		s.current = e;
	}, [e]), r.useEffect(function() {
		if (e.inert) {
			document.body.classList.add(`block-interactivity-${a}`);
			var t = bt([e.lockRef.current], (e.shards || []).map(yn), !0).filter(Boolean);
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
		var r = _n(e), a = n.current, o = "deltaX" in e ? e.deltaX : a[0] - r[0], c = "deltaY" in e ? e.deltaY : a[1] - r[1], l, u = e.target, d = Math.abs(o) > Math.abs(c) ? "h" : "v";
		if ("touches" in e && d === "h" && u.type === "range") return !1;
		var f = window.getSelection(), p = f && f.anchorNode;
		if (p && (p === u || p.contains(u))) return !1;
		var m = un(d, u);
		if (!m) return !0;
		if (m ? l = d : (l = d === "v" ? "h" : "v", m = un(d, u)), !m) return !1;
		if (!i.current && "changedTouches" in e && (o || c) && (i.current = l), !l) return !0;
		var h = i.current || l;
		return gn(h, t, e, h === "h" ? o : c, !0);
	}, []), l = r.useCallback(function(e) {
		var n = e;
		if (!(!Cn.length || Cn[Cn.length - 1] !== o)) {
			var r = "deltaY" in n ? vn(n) : _n(n), i = t.current.filter(function(e) {
				return e.name === n.type && (e.target === n.target || n.target === e.shadowParent) && bn(e.delta, r);
			})[0];
			if (i && i.should) {
				n.cancelable && n.preventDefault();
				return;
			}
			if (!i) {
				var a = (s.current.shards || []).map(yn).filter(Boolean).filter(function(e) {
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
			shadowParent: Tn(r)
		};
		t.current.push(a), setTimeout(function() {
			t.current = t.current.filter(function(e) {
				return e !== a;
			});
		}, 1);
	}, []), d = r.useCallback(function(e) {
		n.current = _n(e), i.current = void 0;
	}, []), f = r.useCallback(function(t) {
		u(t.type, vn(t), t.target, c(t, e.lockRef.current));
	}, []), p = r.useCallback(function(t) {
		u(t.type, _n(t), t.target, c(t, e.lockRef.current));
	}, []);
	r.useEffect(function() {
		return Cn.push(o), e.setCallbacks({
			onScrollCapture: f,
			onWheelCapture: f,
			onTouchMoveCapture: p
		}), document.addEventListener("wheel", l, an), document.addEventListener("touchmove", l, an), document.addEventListener("touchstart", d, an), function() {
			Cn = Cn.filter(function(e) {
				return e !== o;
			}), document.removeEventListener("wheel", l, an), document.removeEventListener("touchmove", l, an), document.removeEventListener("touchstart", d, an);
		};
	}, []);
	var m = e.removeScrollBar, h = e.inert;
	return r.createElement(r.Fragment, null, h ? r.createElement(o, { styles: xn(a) }) : null, m ? r.createElement(tn, {
		noRelative: e.noRelative,
		gapMode: e.gapMode
	}) : null);
}
function Tn(e) {
	for (var t = null; e !== null;) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
	return t;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/sidecar.js
var En = Pt(Ft, wn), Dn = r.forwardRef(function(e, t) {
	return r.createElement(Lt, vt({}, e, {
		ref: t,
		sideCar: En
	}));
});
Dn.classNames = Lt.classNames;
//#endregion
//#region src/lib/remove-scroll-gate.tsx
var On = r.createContext(!1);
function kn({ allowBodyScroll: e, children: t }) {
	return /* @__PURE__ */ x(On.Provider, {
		value: e,
		children: t
	});
}
function An() {
	return r.useContext(On);
}
//#endregion
//#region src/lib/react-remove-scroll-shim.tsx
var jn = r.forwardRef(function(e, t) {
	let n = An() ? !1 : e.enabled !== !1;
	return /* @__PURE__ */ x(Dn, {
		...e,
		ref: t,
		enabled: n
	});
});
jn.classNames = Dn.classNames;
//#endregion
//#region node_modules/aria-hidden/dist/es2015/index.js
var Mn = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, Nn = /* @__PURE__ */ new WeakMap(), Pn = /* @__PURE__ */ new WeakMap(), Fn = {}, In = 0, Ln = function(e) {
	return e && (e.host || Ln(e.parentNode));
}, Rn = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = Ln(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, zn = function(e, t, n, r) {
	var i = Rn(t, Array.isArray(e) ? e : [e]);
	Fn[n] || (Fn[n] = /* @__PURE__ */ new WeakMap());
	var a = Fn[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		!e || s.has(e) || (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		!e || c.has(e) || Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (Nn.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				Nn.set(e, c), a.set(e, l), o.push(e), c === 1 && i && Pn.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), In++, function() {
		o.forEach(function(e) {
			var t = Nn.get(e) - 1, i = a.get(e) - 1;
			Nn.set(e, t), a.set(e, i), t || (Pn.has(e) || e.removeAttribute(r), Pn.delete(e)), i || e.removeAttribute(n);
		}), In--, In || (Nn = /* @__PURE__ */ new WeakMap(), Nn = /* @__PURE__ */ new WeakMap(), Pn = /* @__PURE__ */ new WeakMap(), Fn = {});
	};
}, Bn = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || Mn(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), zn(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
//#endregion
//#region node_modules/@radix-ui/react-dialog/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function Vn(e) {
	let t = /* @__PURE__ */ Hn(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Wn);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ x(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ x(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function Hn(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Kn(n), a = Gn(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? ne(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Un = Symbol("radix.slottable");
function Wn(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Un;
}
function Gn(e, t) {
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
function Kn(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-dialog/dist/index.mjs
var qn = "Dialog", [Jn, Yn] = fe(qn), [Xn, Zn] = Jn(qn), Qn = (e) => {
	let { __scopeDialog: t, children: n, open: i, defaultOpen: a, onOpenChange: o, modal: s = !0 } = e, c = r.useRef(null), l = r.useRef(null), [u, d] = Ce({
		prop: i,
		defaultProp: a ?? !1,
		onChange: o,
		caller: qn
	});
	return /* @__PURE__ */ x(Xn, {
		scope: t,
		triggerRef: c,
		contentRef: l,
		contentId: Ne(),
		titleId: Ne(),
		descriptionId: Ne(),
		open: u,
		onOpenChange: d,
		onOpenToggle: r.useCallback(() => d((e) => !e), [d]),
		modal: s,
		children: n
	});
};
Qn.displayName = qn;
var $n = "DialogTrigger", er = r.forwardRef((e, t) => {
	let { __scopeDialog: n, ...r } = e, i = Zn($n, n), a = F(t, i.triggerRef);
	return /* @__PURE__ */ x(R.button, {
		type: "button",
		"aria-haspopup": "dialog",
		"aria-expanded": i.open,
		"aria-controls": i.contentId,
		"data-state": br(i.open),
		...r,
		ref: a,
		onClick: z(e.onClick, i.onOpenToggle)
	});
});
er.displayName = $n;
var tr = "DialogPortal", [nr, rr] = Jn(tr, { forceMount: void 0 }), ir = (e) => {
	let { __scopeDialog: t, forceMount: n, children: i, container: a } = e, o = Zn(tr, t);
	return /* @__PURE__ */ x(nr, {
		scope: t,
		forceMount: n,
		children: r.Children.map(i, (e) => /* @__PURE__ */ x(De, {
			present: n || o.open,
			children: /* @__PURE__ */ x(mt, {
				asChild: !0,
				container: a,
				children: e
			})
		}))
	});
};
ir.displayName = tr;
var ar = "DialogOverlay", or = r.forwardRef((e, t) => {
	let n = rr(ar, e.__scopeDialog), { forceMount: r = n.forceMount, ...i } = e, a = Zn(ar, e.__scopeDialog);
	return a.modal ? /* @__PURE__ */ x(De, {
		present: r || a.open,
		children: /* @__PURE__ */ x(cr, {
			...i,
			ref: t
		})
	}) : null;
});
or.displayName = ar;
var sr = /* @__PURE__ */ Vn("DialogOverlay.RemoveScroll"), cr = r.forwardRef((e, t) => {
	let { __scopeDialog: n, ...r } = e, i = Zn(ar, n);
	return /* @__PURE__ */ x(jn, {
		as: sr,
		allowPinchZoom: !0,
		shards: [i.contentRef],
		children: /* @__PURE__ */ x(R.div, {
			"data-state": br(i.open),
			...r,
			ref: t,
			style: {
				pointerEvents: "auto",
				...r.style
			}
		})
	});
}), lr = "DialogContent", ur = r.forwardRef((e, t) => {
	let n = rr(lr, e.__scopeDialog), { forceMount: r = n.forceMount, ...i } = e, a = Zn(lr, e.__scopeDialog);
	return /* @__PURE__ */ x(De, {
		present: r || a.open,
		children: a.modal ? /* @__PURE__ */ x(dr, {
			...i,
			ref: t
		}) : /* @__PURE__ */ x(fr, {
			...i,
			ref: t
		})
	});
});
ur.displayName = lr;
var dr = r.forwardRef((e, t) => {
	let n = Zn(lr, e.__scopeDialog), i = r.useRef(null), a = F(t, n.contentRef, i);
	return r.useEffect(() => {
		let e = i.current;
		if (e) return Bn(e);
	}, []), /* @__PURE__ */ x(pr, {
		...e,
		ref: a,
		trapFocus: n.open,
		disableOutsidePointerEvents: !0,
		onCloseAutoFocus: z(e.onCloseAutoFocus, (e) => {
			e.preventDefault(), n.triggerRef.current?.focus();
		}),
		onPointerDownOutside: z(e.onPointerDownOutside, (e) => {
			let t = e.detail.originalEvent, n = t.button === 0 && t.ctrlKey === !0;
			(t.button === 2 || n) && e.preventDefault();
		}),
		onFocusOutside: z(e.onFocusOutside, (e) => e.preventDefault())
	});
}), fr = r.forwardRef((e, t) => {
	let n = Zn(lr, e.__scopeDialog), i = r.useRef(!1), a = r.useRef(!1);
	return /* @__PURE__ */ x(pr, {
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
}), pr = r.forwardRef((e, t) => {
	let { __scopeDialog: n, trapFocus: i, onOpenAutoFocus: a, onCloseAutoFocus: o, ...s } = e, c = Zn(lr, n), l = r.useRef(null), u = F(t, l);
	return gt(), /* @__PURE__ */ S(b, { children: [/* @__PURE__ */ x(tt, {
		asChild: !0,
		loop: !0,
		trapped: i,
		onMountAutoFocus: a,
		onUnmountAutoFocus: o,
		children: /* @__PURE__ */ x(We, {
			role: "dialog",
			id: c.contentId,
			"aria-describedby": c.descriptionId,
			"aria-labelledby": c.titleId,
			"data-state": br(c.open),
			...s,
			ref: u,
			onDismiss: () => c.onOpenChange(!1)
		})
	}), /* @__PURE__ */ S(b, { children: [/* @__PURE__ */ x(wr, { titleId: c.titleId }), /* @__PURE__ */ x(Er, {
		contentRef: l,
		descriptionId: c.descriptionId
	})] })] });
}), mr = "DialogTitle", hr = r.forwardRef((e, t) => {
	let { __scopeDialog: n, ...r } = e, i = Zn(mr, n);
	return /* @__PURE__ */ x(R.h2, {
		id: i.titleId,
		...r,
		ref: t
	});
});
hr.displayName = mr;
var gr = "DialogDescription", _r = r.forwardRef((e, t) => {
	let { __scopeDialog: n, ...r } = e, i = Zn(gr, n);
	return /* @__PURE__ */ x(R.p, {
		id: i.descriptionId,
		...r,
		ref: t
	});
});
_r.displayName = gr;
var vr = "DialogClose", yr = r.forwardRef((e, t) => {
	let { __scopeDialog: n, ...r } = e, i = Zn(vr, n);
	return /* @__PURE__ */ x(R.button, {
		type: "button",
		...r,
		ref: t,
		onClick: z(e.onClick, () => i.onOpenChange(!1))
	});
});
yr.displayName = vr;
function br(e) {
	return e ? "open" : "closed";
}
var xr = "DialogTitleWarning", [Sr, Cr] = de(xr, {
	contentName: lr,
	titleName: mr,
	docsSlug: "dialog"
}), wr = ({ titleId: e }) => {
	let t = Cr(xr), n = `\`${t.contentName}\` requires a \`${t.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${t.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${t.docsSlug}`;
	return r.useEffect(() => {
		e && (document.getElementById(e) || console.error(n));
	}, [n, e]), null;
}, Tr = "DialogDescriptionWarning", Er = ({ contentRef: e, descriptionId: t }) => {
	let n = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${Cr(Tr).contentName}}.`;
	return r.useEffect(() => {
		let r = e.current?.getAttribute("aria-describedby");
		t && r && (document.getElementById(t) || console.warn(n));
	}, [
		n,
		e,
		t
	]), null;
}, Dr = Qn, Or = er, kr = ir, Ar = or, jr = ur, Mr = hr, Nr = _r, Pr = yr, Fr = Symbol("radix.slottable");
/* @__NO_SIDE_EFFECTS__ */
function Ir(e) {
	let t = ({ children: e }) => /* @__PURE__ */ x(b, { children: e });
	return t.displayName = `${e}.Slottable`, t.__radixId = Fr, t;
}
//#endregion
//#region node_modules/@radix-ui/react-alert-dialog/dist/index.mjs
var Lr = "AlertDialog", [Rr, zr] = fe(Lr, [Yn]), Br = Yn(), Vr = (e) => {
	let { __scopeAlertDialog: t, ...n } = e;
	return /* @__PURE__ */ x(Dr, {
		...Br(t),
		...n,
		modal: !0
	});
};
Vr.displayName = Lr;
var Hr = "AlertDialogTrigger", Ur = r.forwardRef((e, t) => {
	let { __scopeAlertDialog: n, ...r } = e;
	return /* @__PURE__ */ x(Or, {
		...Br(n),
		...r,
		ref: t
	});
});
Ur.displayName = Hr;
var Wr = "AlertDialogPortal", Gr = (e) => {
	let { __scopeAlertDialog: t, ...n } = e;
	return /* @__PURE__ */ x(kr, {
		...Br(t),
		...n
	});
};
Gr.displayName = Wr;
var Kr = "AlertDialogOverlay", qr = r.forwardRef((e, t) => {
	let { __scopeAlertDialog: n, ...r } = e;
	return /* @__PURE__ */ x(Ar, {
		...Br(n),
		...r,
		ref: t
	});
});
qr.displayName = Kr;
var Jr = "AlertDialogContent", [Yr, Xr] = Rr(Jr), Zr = /* @__PURE__ */ Ir("AlertDialogContent"), Qr = r.forwardRef((e, t) => {
	let { __scopeAlertDialog: n, children: i, ...a } = e, o = Br(n), s = r.useRef(null), c = F(t, s), l = r.useRef(null);
	return /* @__PURE__ */ x(Sr, {
		contentName: Jr,
		titleName: $r,
		docsSlug: "alert-dialog",
		children: /* @__PURE__ */ x(Yr, {
			scope: n,
			cancelRef: l,
			children: /* @__PURE__ */ S(jr, {
				role: "alertdialog",
				...o,
				...a,
				ref: c,
				onOpenAutoFocus: z(a.onOpenAutoFocus, (e) => {
					e.preventDefault(), l.current?.focus({ preventScroll: !0 });
				}),
				onPointerDownOutside: (e) => e.preventDefault(),
				onInteractOutside: (e) => e.preventDefault(),
				children: [/* @__PURE__ */ x(Zr, { children: i }), /* @__PURE__ */ x(si, { contentRef: s })]
			})
		})
	});
});
Qr.displayName = Jr;
var $r = "AlertDialogTitle", ei = r.forwardRef((e, t) => {
	let { __scopeAlertDialog: n, ...r } = e;
	return /* @__PURE__ */ x(Mr, {
		...Br(n),
		...r,
		ref: t
	});
});
ei.displayName = $r;
var ti = "AlertDialogDescription", ni = r.forwardRef((e, t) => {
	let { __scopeAlertDialog: n, ...r } = e;
	return /* @__PURE__ */ x(Nr, {
		...Br(n),
		...r,
		ref: t
	});
});
ni.displayName = ti;
var ri = "AlertDialogAction", ii = r.forwardRef((e, t) => {
	let { __scopeAlertDialog: n, ...r } = e;
	return /* @__PURE__ */ x(Pr, {
		...Br(n),
		...r,
		ref: t
	});
});
ii.displayName = ri;
var ai = "AlertDialogCancel", oi = r.forwardRef((e, t) => {
	let { __scopeAlertDialog: n, ...r } = e, { cancelRef: i } = Xr(ai, n), a = Br(n), o = F(t, i);
	return /* @__PURE__ */ x(Pr, {
		...a,
		...r,
		ref: o
	});
});
oi.displayName = ai;
var si = ({ contentRef: e }) => {
	let t = `\`${Jr}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${Jr}\` by passing a \`${ti}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${Jr}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;
	return r.useEffect(() => {
		document.getElementById(e.current?.getAttribute("aria-describedby")) || console.warn(t);
	}, [t, e]), null;
}, ci = Vr, li = Gr, ui = qr, di = Qr, fi = ii, pi = oi, mi = ei, hi = ni;
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function gi(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function _i(e) {
	let [t, n] = r.useState(void 0);
	return xe(() => {
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
var vi = "Checkbox", [yi, bi] = fe(vi), [xi, Si] = yi(vi);
function Ci(e) {
	let { __scopeCheckbox: t, checked: n, children: i, defaultChecked: a, disabled: o, form: s, name: c, onCheckedChange: l, required: u, value: d = "on", internal_do_not_use_render: f } = e, [p, m] = Ce({
		prop: n,
		defaultProp: a ?? !1,
		onChange: l,
		caller: vi
	}), [h, g] = r.useState(null), [_, v] = r.useState(null), y = r.useRef(!1), b = h ? !!s || !!h.closest("form") : !0, S = {
		checked: p,
		disabled: o,
		setChecked: m,
		control: h,
		setControl: g,
		name: c,
		form: s,
		value: d,
		hasConsumerStoppedPropagationRef: y,
		required: u,
		defaultChecked: Mi(a) ? !1 : a,
		isFormControl: b,
		bubbleInput: _,
		setBubbleInput: v
	};
	return /* @__PURE__ */ x(xi, {
		scope: t,
		...S,
		children: ji(f) ? f(S) : i
	});
}
var wi = "CheckboxTrigger", Ti = r.forwardRef(({ __scopeCheckbox: e, onKeyDown: t, onClick: n, ...i }, a) => {
	let { control: o, value: s, disabled: c, checked: l, required: u, setControl: d, setChecked: f, hasConsumerStoppedPropagationRef: p, isFormControl: m, bubbleInput: h } = Si(wi, e), g = F(a, d), _ = r.useRef(l);
	return r.useEffect(() => {
		let e = o?.form;
		if (e) {
			let t = () => f(_.current);
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [o, f]), /* @__PURE__ */ x(R.button, {
		type: "button",
		role: "checkbox",
		"aria-checked": Mi(l) ? "mixed" : l,
		"aria-required": u,
		"data-state": Ni(l),
		"data-disabled": c ? "" : void 0,
		disabled: c,
		value: s,
		...i,
		ref: g,
		onKeyDown: z(t, (e) => {
			e.key === "Enter" && e.preventDefault();
		}),
		onClick: z(n, (e) => {
			f((e) => Mi(e) ? !0 : !e), h && m && (p.current = e.isPropagationStopped(), p.current || e.stopPropagation());
		})
	});
});
Ti.displayName = wi;
var Ei = r.forwardRef((e, t) => {
	let { __scopeCheckbox: n, name: r, checked: i, defaultChecked: a, required: o, disabled: s, value: c, onCheckedChange: l, form: u, ...d } = e;
	return /* @__PURE__ */ x(Ci, {
		__scopeCheckbox: n,
		checked: i,
		defaultChecked: a,
		disabled: s,
		required: o,
		onCheckedChange: l,
		name: r,
		form: u,
		value: c,
		internal_do_not_use_render: ({ isFormControl: e }) => /* @__PURE__ */ S(b, { children: [/* @__PURE__ */ x(Ti, {
			...d,
			ref: t,
			__scopeCheckbox: n
		}), e && /* @__PURE__ */ x(Ai, { __scopeCheckbox: n })] })
	});
});
Ei.displayName = vi;
var Di = "CheckboxIndicator", Oi = r.forwardRef((e, t) => {
	let { __scopeCheckbox: n, forceMount: r, ...i } = e, a = Si(Di, n);
	return /* @__PURE__ */ x(De, {
		present: r || Mi(a.checked) || a.checked === !0,
		children: /* @__PURE__ */ x(R.span, {
			"data-state": Ni(a.checked),
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
Oi.displayName = Di;
var ki = "CheckboxBubbleInput", Ai = r.forwardRef(({ __scopeCheckbox: e, ...t }, n) => {
	let { control: i, hasConsumerStoppedPropagationRef: a, checked: o, defaultChecked: s, required: c, disabled: l, name: u, value: d, form: f, bubbleInput: p, setBubbleInput: m } = Si(ki, e), h = F(n, m), g = gi(o), _ = _i(i);
	r.useEffect(() => {
		let e = p;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, n = Object.getOwnPropertyDescriptor(t, "checked").set, r = !a.current;
		if (g !== o && n) {
			let t = new Event("click", { bubbles: r });
			e.indeterminate = Mi(o), n.call(e, Mi(o) ? !1 : o), e.dispatchEvent(t);
		}
	}, [
		p,
		g,
		o,
		a
	]);
	let v = r.useRef(Mi(o) ? !1 : o);
	return /* @__PURE__ */ x(R.input, {
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
Ai.displayName = ki;
function ji(e) {
	return typeof e == "function";
}
function Mi(e) {
	return e === "indeterminate";
}
function Ni(e) {
	return Mi(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
//#endregion
//#region node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var Pi = [
	"top",
	"right",
	"bottom",
	"left"
], Fi = Math.min, Ii = Math.max, Li = Math.round, Ri = Math.floor, zi = (e) => ({
	x: e,
	y: e
}), Bi = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function Vi(e, t, n) {
	return Ii(e, Fi(t, n));
}
function Hi(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function Ui(e) {
	return e.split("-")[0];
}
function Wi(e) {
	return e.split("-")[1];
}
function Gi(e) {
	return e === "x" ? "y" : "x";
}
function Ki(e) {
	return e === "y" ? "height" : "width";
}
function qi(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function Ji(e) {
	return Gi(qi(e));
}
function Yi(e, t, n) {
	n === void 0 && (n = !1);
	let r = Wi(e), i = Ji(e), a = Ki(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = ia(o)), [o, ia(o)];
}
function Xi(e) {
	let t = ia(e);
	return [
		Zi(e),
		t,
		Zi(t)
	];
}
function Zi(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var Qi = ["left", "right"], $i = ["right", "left"], ea = ["top", "bottom"], ta = ["bottom", "top"];
function na(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? $i : Qi : t ? Qi : $i;
		case "left":
		case "right": return t ? ea : ta;
		default: return [];
	}
}
function ra(e, t, n, r) {
	let i = Wi(e), a = na(Ui(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(Zi)))), a;
}
function ia(e) {
	let t = Ui(e);
	return Bi[t] + e.slice(t.length);
}
function aa(e) {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...e
	};
}
function oa(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : aa(e);
}
function sa(e) {
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
function ca(e, t, n) {
	let { reference: r, floating: i } = e, a = qi(t), o = Ji(t), s = Ki(o), c = Ui(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	switch (Wi(t)) {
		case "start":
			p[o] -= f * (n && l ? -1 : 1);
			break;
		case "end":
			p[o] += f * (n && l ? -1 : 1);
			break;
	}
	return p;
}
async function la(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = Hi(t, e), p = oa(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = sa(await i.getClippingRect({
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
	}, y = sa(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var ua = 50, da = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: la
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = ca(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < ua && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = ca(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, fa = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = Hi(e, t) || {};
		if (l == null) return {};
		let d = oa(u), f = {
			x: n,
			y: r
		}, p = Ji(i), m = Ki(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = Fi(d[_], T), ee = Fi(d[v], T), D = E, O = C - h[m] - ee, k = C / 2 - h[m] / 2 + w, A = Vi(D, k, O), j = !c.arrow && Wi(i) != null && k !== A && a.reference[m] / 2 - (k < D ? E : ee) - h[m] / 2 < 0, M = j ? k < D ? k - D : k - O : 0;
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
}), pa = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = Hi(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = Ui(r), _ = qi(o), v = Ui(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [ia(o)] : Xi(o)), x = p !== "none";
			!d && x && b.push(...ra(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = Yi(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (!(u === "alignment" && _ !== qi(t)) || T.every((e) => qi(e.placement) === _ ? e.overflows[0] > 0 : !0))) return {
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
								let t = qi(e.placement);
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
function ma(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function ha(e) {
	return Pi.some((t) => e[t] >= 0);
}
var ga = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = Hi(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = ma(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: ha(e)
					} };
				}
				case "escaped": {
					let e = ma(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: ha(e)
					} };
				}
				default: return {};
			}
		}
	};
}, _a = /* @__PURE__ */ new Set(["left", "top"]);
async function va(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = Ui(n), s = Wi(n), c = qi(n) === "y", l = _a.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = Hi(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var ya = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await va(t, e);
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
}, ba = function(e) {
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
			} }, ...l } = Hi(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = qi(Ui(i)), p = Gi(f), m = u[p], h = u[f];
			if (o) {
				let e = p === "y" ? "top" : "left", t = p === "y" ? "bottom" : "right", n = m + d[e], r = m - d[t];
				m = Vi(n, m, r);
			}
			if (s) {
				let e = f === "y" ? "top" : "left", t = f === "y" ? "bottom" : "right", n = h + d[e], r = h - d[t];
				h = Vi(n, h, r);
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
}, xa = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = Hi(e, t), u = {
				x: n,
				y: r
			}, d = qi(i), f = Gi(d), p = u[f], m = u[d], h = Hi(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = _a.has(Ui(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, Sa = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			var n, r;
			let { placement: i, rects: a, platform: o, elements: s } = t, { apply: c = () => {}, ...l } = Hi(e, t), u = await o.detectOverflow(t, l), d = Ui(i), f = Wi(i), p = qi(i) === "y", { width: m, height: h } = a.floating, g, _;
			d === "top" || d === "bottom" ? (g = d, _ = f === (await (o.isRTL == null ? void 0 : o.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (_ = d, g = f === "end" ? "top" : "bottom");
			let v = h - u.top - u.bottom, y = m - u.left - u.right, b = Fi(h - u[g], v), x = Fi(m - u[_], y), S = !t.middlewareData.shift, C = b, w = x;
			if ((n = t.middlewareData.shift) != null && n.enabled.x && (w = y), (r = t.middlewareData.shift) != null && r.enabled.y && (C = v), S && !f) {
				let e = Ii(u.left, 0), t = Ii(u.right, 0), n = Ii(u.top, 0), r = Ii(u.bottom, 0);
				p ? w = m - 2 * (e !== 0 || t !== 0 ? e + t : Ii(u.left, u.right)) : C = h - 2 * (n !== 0 || r !== 0 ? n + r : Ii(u.top, u.bottom));
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
function Ca() {
	return typeof window < "u";
}
function wa(e) {
	return Da(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Ta(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Ea(e) {
	return ((Da(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function Da(e) {
	return Ca() ? e instanceof Node || e instanceof Ta(e).Node : !1;
}
function Oa(e) {
	return Ca() ? e instanceof Element || e instanceof Ta(e).Element : !1;
}
function ka(e) {
	return Ca() ? e instanceof HTMLElement || e instanceof Ta(e).HTMLElement : !1;
}
function Aa(e) {
	return !Ca() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Ta(e).ShadowRoot;
}
function ja(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = Ha(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function Ma(e) {
	return /^(table|td|th)$/.test(wa(e));
}
function Na(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var Pa = /transform|translate|scale|rotate|perspective|filter/, Fa = /paint|layout|strict|content/, Ia = (e) => !!e && e !== "none", La;
function Ra(e) {
	let t = Oa(e) ? Ha(e) : e;
	return Ia(t.transform) || Ia(t.translate) || Ia(t.scale) || Ia(t.rotate) || Ia(t.perspective) || !Ba() && (Ia(t.backdropFilter) || Ia(t.filter)) || Pa.test(t.willChange || "") || Fa.test(t.contain || "");
}
function za(e) {
	let t = Wa(e);
	for (; ka(t) && !Va(t);) {
		if (Ra(t)) return t;
		if (Na(t)) return null;
		t = Wa(t);
	}
	return null;
}
function Ba() {
	return La ?? (La = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), La;
}
function Va(e) {
	return /^(html|body|#document)$/.test(wa(e));
}
function Ha(e) {
	return Ta(e).getComputedStyle(e);
}
function Ua(e) {
	return Oa(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function Wa(e) {
	if (wa(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Aa(e) && e.host || Ea(e);
	return Aa(t) ? t.host : t;
}
function Ga(e) {
	let t = Wa(e);
	return Va(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : ka(t) && ja(t) ? t : Ga(t);
}
function Ka(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = Ga(e), i = r === e.ownerDocument?.body, a = Ta(r);
	if (i) {
		let e = qa(a);
		return t.concat(a, a.visualViewport || [], ja(r) ? r : [], e && n ? Ka(e) : []);
	} else return t.concat(r, Ka(r, [], n));
}
function qa(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function Ja(e) {
	let t = Ha(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = ka(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = Li(n) !== a || Li(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function Ya(e) {
	return Oa(e) ? e : e.contextElement;
}
function Xa(e) {
	let t = Ya(e);
	if (!ka(t)) return zi(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = Ja(t), o = (a ? Li(n.width) : n.width) / r, s = (a ? Li(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var Za = /* @__PURE__ */ zi(0);
function Qa(e) {
	let t = Ta(e);
	return !Ba() || !t.visualViewport ? Za : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function $a(e, t, n) {
	return t === void 0 && (t = !1), !n || t && n !== Ta(e) ? !1 : t;
}
function eo(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = Ya(e), o = zi(1);
	t && (r ? Oa(r) && (o = Xa(r)) : o = Xa(e));
	let s = $a(a, n, r) ? Qa(a) : zi(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a) {
		let e = Ta(a), t = r && Oa(r) ? Ta(r) : r, n = e, i = qa(n);
		for (; i && r && t !== n;) {
			let e = Xa(i), t = i.getBoundingClientRect(), r = Ha(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = Ta(i), i = qa(n);
		}
	}
	return sa({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function to(e, t) {
	let n = Ua(e).scrollLeft;
	return t ? t.left + n : eo(Ea(e)).left + n;
}
function no(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - to(e, n),
		y: n.top + t.scrollTop
	};
}
function ro(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = Ea(r), s = t ? Na(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = zi(1), u = zi(0), d = ka(r);
	if ((d || !d && !a) && ((wa(r) !== "body" || ja(o)) && (c = Ua(r)), d)) {
		let e = eo(r);
		l = Xa(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? no(o, c) : zi(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function io(e) {
	return Array.from(e.getClientRects());
}
function ao(e) {
	let t = Ea(e), n = Ua(e), r = e.ownerDocument.body, i = Ii(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), a = Ii(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight), o = -n.scrollLeft + to(e), s = -n.scrollTop;
	return Ha(r).direction === "rtl" && (o += Ii(t.clientWidth, r.clientWidth) - i), {
		width: i,
		height: a,
		x: o,
		y: s
	};
}
var oo = 25;
function so(e, t) {
	let n = Ta(e), r = Ea(e), i = n.visualViewport, a = r.clientWidth, o = r.clientHeight, s = 0, c = 0;
	if (i) {
		a = i.width, o = i.height;
		let e = Ba();
		(!e || e && t === "fixed") && (s = i.offsetLeft, c = i.offsetTop);
	}
	let l = to(r);
	if (l <= 0) {
		let e = r.ownerDocument, t = e.body, n = getComputedStyle(t), i = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, o = Math.abs(r.clientWidth - t.clientWidth - i);
		o <= oo && (a -= o);
	} else l <= oo && (a += l);
	return {
		width: a,
		height: o,
		x: s,
		y: c
	};
}
function co(e, t) {
	let n = eo(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = ka(e) ? Xa(e) : zi(1);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function lo(e, t, n) {
	let r;
	if (t === "viewport") r = so(e, n);
	else if (t === "document") r = ao(Ea(e));
	else if (Oa(t)) r = co(t, n);
	else {
		let n = Qa(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return sa(r);
}
function uo(e, t) {
	let n = Wa(e);
	return n === t || !Oa(n) || Va(n) ? !1 : Ha(n).position === "fixed" || uo(n, t);
}
function fo(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = Ka(e, [], !1).filter((e) => Oa(e) && wa(e) !== "body"), i = null, a = Ha(e).position === "fixed", o = a ? Wa(e) : e;
	for (; Oa(o) && !Va(o);) {
		let t = Ha(o), n = Ra(o);
		!n && t.position === "fixed" && (i = null), (a ? !n && !i : !n && t.position === "static" && i && (i.position === "absolute" || i.position === "fixed") || ja(o) && !n && uo(e, o)) ? r = r.filter((e) => e !== o) : i = t, o = Wa(o);
	}
	return t.set(e, r), r;
}
function po(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? Na(t) ? [] : fo(t, this._c) : [].concat(n), r], o = lo(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = lo(t, a[e], i);
		s = Ii(n.top, s), c = Fi(n.right, c), l = Fi(n.bottom, l), u = Ii(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function mo(e) {
	let { width: t, height: n } = Ja(e);
	return {
		width: t,
		height: n
	};
}
function ho(e, t, n) {
	let r = ka(t), i = Ea(t), a = n === "fixed", o = eo(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = zi(0);
	function l() {
		c.x = to(i);
	}
	if (r || !r && !a) if ((wa(t) !== "body" || ja(i)) && (s = Ua(t)), r) {
		let e = eo(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	} else i && l();
	a && !r && i && l();
	let u = i && !r && !a ? no(i, s) : zi(0);
	return {
		x: o.left + s.scrollLeft - c.x - u.x,
		y: o.top + s.scrollTop - c.y - u.y,
		width: o.width,
		height: o.height
	};
}
function go(e) {
	return Ha(e).position === "static";
}
function _o(e, t) {
	if (!ka(e) || Ha(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Ea(e) === n && (n = n.ownerDocument.body), n;
}
function vo(e, t) {
	let n = Ta(e);
	if (Na(e)) return n;
	if (!ka(e)) {
		let t = Wa(e);
		for (; t && !Va(t);) {
			if (Oa(t) && !go(t)) return t;
			t = Wa(t);
		}
		return n;
	}
	let r = _o(e, t);
	for (; r && Ma(r) && go(r);) r = _o(r, t);
	return r && Va(r) && go(r) && !Ra(r) ? n : r || za(e) || n;
}
var yo = async function(e) {
	let t = this.getOffsetParent || vo, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: ho(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function bo(e) {
	return Ha(e).direction === "rtl";
}
var xo = {
	convertOffsetParentRelativeRectToViewportRelativeRect: ro,
	getDocumentElement: Ea,
	getClippingRect: po,
	getOffsetParent: vo,
	getElementRects: yo,
	getClientRects: io,
	getDimensions: mo,
	getScale: Xa,
	isElement: Oa,
	isRTL: bo
};
function So(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function Co(e, t) {
	let n = null, r, i = Ea(e);
	function a() {
		var e;
		clearTimeout(r), (e = n) == null || e.disconnect(), n = null;
	}
	function o(s, c) {
		s === void 0 && (s = !1), c === void 0 && (c = 1), a();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (s || t(), !f || !p) return;
		let m = Ri(d), h = Ri(i.clientWidth - (u + f)), g = Ri(i.clientHeight - (d + p)), _ = Ri(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: Ii(0, Fi(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (n !== c) {
				if (!y) return o();
				n ? o(!1, n) : r = setTimeout(() => {
					o(!1, 1e-7);
				}, 1e3);
			}
			n === 1 && !So(l, e.getBoundingClientRect()) && o(), y = !1;
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
function wo(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = Ya(e), u = i || a ? [...l ? Ka(l) : [], ...t ? Ka(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n, { passive: !0 }), a && e.addEventListener("resize", n);
	});
	let d = l && s ? Co(l, n) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? eo(e) : null;
	c && g();
	function g() {
		let t = eo(e);
		h && !So(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var To = ya, Eo = ba, Do = pa, Oo = Sa, ko = ga, Ao = fa, jo = xa, Mo = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = {
		platform: xo,
		...n
	}, a = {
		...i.platform,
		_c: r
	};
	return da(e, t, {
		...i,
		platform: a
	});
}, No = typeof document < "u" ? d : function() {};
function Po(e, t) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (typeof e == "function" && e.toString() === t.toString()) return !0;
	let n, r, i;
	if (e && t && typeof e == "object") {
		if (Array.isArray(e)) {
			if (n = e.length, n !== t.length) return !1;
			for (r = n; r-- !== 0;) if (!Po(e[r], t[r])) return !1;
			return !0;
		}
		if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length) return !1;
		for (r = n; r-- !== 0;) if (!{}.hasOwnProperty.call(t, i[r])) return !1;
		for (r = n; r-- !== 0;) {
			let n = i[r];
			if (!(n === "_owner" && e.$$typeof) && !Po(e[n], t[n])) return !1;
		}
		return !0;
	}
	return e !== e && t !== t;
}
function Fo(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Io(e, t) {
	let n = Fo(e);
	return Math.round(t * n) / n;
}
function Lo(e) {
	let t = r.useRef(e);
	return No(() => {
		t.current = e;
	}), t;
}
function Ro(e) {
	e === void 0 && (e = {});
	let { placement: t = "bottom", strategy: n = "absolute", middleware: i = [], platform: a, elements: { reference: o, floating: s } = {}, transform: c = !0, whileElementsMounted: l, open: u } = e, [d, f] = r.useState({
		x: 0,
		y: 0,
		strategy: n,
		placement: t,
		middlewareData: {},
		isPositioned: !1
	}), [p, m] = r.useState(i);
	Po(p, i) || m(i);
	let [h, g] = r.useState(null), [_, y] = r.useState(null), b = r.useCallback((e) => {
		e !== w.current && (w.current = e, g(e));
	}, []), x = r.useCallback((e) => {
		e !== T.current && (T.current = e, y(e));
	}, []), S = o || h, C = s || _, w = r.useRef(null), T = r.useRef(null), E = r.useRef(d), ee = l != null, D = Lo(l), O = Lo(a), k = Lo(u), A = r.useCallback(() => {
		if (!w.current || !T.current) return;
		let e = {
			placement: t,
			strategy: n,
			middleware: p
		};
		O.current && (e.platform = O.current), Mo(w.current, T.current, e).then((e) => {
			let t = {
				...e,
				isPositioned: k.current !== !1
			};
			j.current && !Po(E.current, t) && (E.current = t, v.flushSync(() => {
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
	No(() => {
		u === !1 && E.current.isPositioned && (E.current.isPositioned = !1, f((e) => ({
			...e,
			isPositioned: !1
		})));
	}, [u]);
	let j = r.useRef(!1);
	No(() => (j.current = !0, () => {
		j.current = !1;
	}), []), No(() => {
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
	}), [S, C]), te = r.useMemo(() => {
		let e = {
			position: n,
			left: 0,
			top: 0
		};
		if (!N.floating) return e;
		let t = Io(N.floating, d.x), r = Io(N.floating, d.y);
		return c ? {
			...e,
			transform: "translate(" + t + "px, " + r + "px)",
			...Fo(N.floating) >= 1.5 && { willChange: "transform" }
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
		floatingStyles: te
	}), [
		d,
		A,
		M,
		N,
		te
	]);
}
var zo = (e) => {
	function t(e) {
		return {}.hasOwnProperty.call(e, "current");
	}
	return {
		name: "arrow",
		options: e,
		fn(n) {
			let { element: r, padding: i } = typeof e == "function" ? e(n) : e;
			return r && t(r) ? r.current == null ? {} : Ao({
				element: r.current,
				padding: i
			}).fn(n) : r ? Ao({
				element: r,
				padding: i
			}).fn(n) : {};
		}
	};
}, Bo = (e, t) => {
	let n = To(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Vo = (e, t) => {
	let n = Eo(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Ho = (e, t) => ({
	fn: jo(e).fn,
	options: [e, t]
}), Uo = (e, t) => {
	let n = Do(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Wo = (e, t) => {
	let n = Oo(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Go = (e, t) => {
	let n = ko(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Ko = (e, t) => {
	let n = zo(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, qo = "Arrow", Jo = r.forwardRef((e, t) => {
	let { children: n, width: r = 10, height: i = 5, ...a } = e;
	return /* @__PURE__ */ x(R.svg, {
		...a,
		ref: t,
		width: r,
		height: i,
		viewBox: "0 0 30 10",
		preserveAspectRatio: "none",
		children: e.asChild ? n : /* @__PURE__ */ x("polygon", { points: "0,0 30,0 15,10" })
	});
});
Jo.displayName = qo;
var Yo = Jo, Xo = "Popper", [Zo, Qo] = fe(Xo), [$o, es] = Zo(Xo), ts = (e) => {
	let { __scopePopper: t, children: n } = e, [i, a] = r.useState(null);
	return /* @__PURE__ */ x($o, {
		scope: t,
		anchor: i,
		onAnchorChange: a,
		children: n
	});
};
ts.displayName = Xo;
var ns = "PopperAnchor", rs = r.forwardRef((e, t) => {
	let { __scopePopper: n, virtualRef: i, ...a } = e, o = es(ns, n), s = r.useRef(null), c = F(t, s), l = r.useRef(null);
	return r.useEffect(() => {
		let e = l.current;
		l.current = i?.current || s.current, e !== l.current && o.onAnchorChange(l.current);
	}), i ? null : /* @__PURE__ */ x(R.div, {
		...a,
		ref: c
	});
});
rs.displayName = ns;
var is = "PopperContent", [as, os] = Zo(is), ss = r.forwardRef((e, t) => {
	let { __scopePopper: n, side: i = "bottom", sideOffset: a = 0, align: o = "center", alignOffset: s = 0, arrowPadding: c = 0, avoidCollisions: l = !0, collisionBoundary: u = [], collisionPadding: d = 0, sticky: f = "partial", hideWhenDetached: p = !1, updatePositionStrategy: m = "optimized", onPlaced: h, ...g } = e, _ = es(is, n), [v, y] = r.useState(null), b = F(t, (e) => y(e)), [S, C] = r.useState(null), w = _i(S), T = w?.width ?? 0, E = w?.height ?? 0, ee = i + (o === "center" ? "" : "-" + o), D = typeof d == "number" ? d : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...d
	}, O = Array.isArray(u) ? u : [u], k = O.length > 0, A = {
		padding: D,
		boundary: O.filter(ds),
		altBoundary: k
	}, { refs: j, floatingStyles: M, placement: N, isPositioned: te, middlewareData: P } = Ro({
		strategy: "fixed",
		placement: ee,
		whileElementsMounted: (...e) => wo(...e, { animationFrame: m === "always" }),
		elements: { reference: _.anchor },
		middleware: [
			Bo({
				mainAxis: a + E,
				alignmentAxis: s
			}),
			l && Vo({
				mainAxis: !0,
				crossAxis: !1,
				limiter: f === "partial" ? Ho() : void 0,
				...A
			}),
			l && Uo({ ...A }),
			Wo({
				...A,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--radix-popper-available-width", `${n}px`), o.setProperty("--radix-popper-available-height", `${r}px`), o.setProperty("--radix-popper-anchor-width", `${i}px`), o.setProperty("--radix-popper-anchor-height", `${a}px`);
				}
			}),
			S && Ko({
				element: S,
				padding: c
			}),
			fs({
				arrowWidth: T,
				arrowHeight: E
			}),
			p && Go({
				strategy: "referenceHidden",
				...A
			})
		]
	}), [ne, re] = ps(N), ie = Ie(h);
	xe(() => {
		te && ie?.();
	}, [te, ie]);
	let I = P.arrow?.x, L = P.arrow?.y, ae = P.arrow?.centerOffset !== 0, [oe, se] = r.useState();
	return xe(() => {
		v && se(window.getComputedStyle(v).zIndex);
	}, [v]), /* @__PURE__ */ x("div", {
		ref: j.setFloating,
		"data-radix-popper-content-wrapper": "",
		style: {
			...M,
			transform: te ? M.transform : "translate(0, -200%)",
			minWidth: "max-content",
			zIndex: oe,
			"--radix-popper-transform-origin": [P.transformOrigin?.x, P.transformOrigin?.y].join(" "),
			...P.hide?.referenceHidden && {
				visibility: "hidden",
				pointerEvents: "none"
			}
		},
		dir: e.dir,
		children: /* @__PURE__ */ x(as, {
			scope: n,
			placedSide: ne,
			onArrowChange: C,
			arrowX: I,
			arrowY: L,
			shouldHideArrow: ae,
			children: /* @__PURE__ */ x(R.div, {
				"data-side": ne,
				"data-align": re,
				...g,
				ref: b,
				style: {
					...g.style,
					animation: te ? void 0 : "none"
				}
			})
		})
	});
});
ss.displayName = is;
var cs = "PopperArrow", ls = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
}, us = r.forwardRef(function(e, t) {
	let { __scopePopper: n, ...r } = e, i = os(cs, n), a = ls[i.placedSide];
	return /* @__PURE__ */ x("span", {
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
		children: /* @__PURE__ */ x(Yo, {
			...r,
			ref: t,
			style: {
				...r.style,
				display: "block"
			}
		})
	});
});
us.displayName = cs;
function ds(e) {
	return e !== null;
}
var fs = (e) => ({
	name: "transformOrigin",
	options: e,
	fn(t) {
		let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = ps(n), u = {
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
function ps(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
var ms = ts, hs = rs, gs = ss, _s = us, vs = "rovingFocusGroup.onEntryFocus", ys = {
	bubbles: !1,
	cancelable: !0
}, bs = "RovingFocusGroup", [xs, Ss, Cs] = be(bs), [ws, Ts] = fe(bs, [Cs]), [Es, Ds] = ws(bs), Os = r.forwardRef((e, t) => /* @__PURE__ */ x(xs.Provider, {
	scope: e.__scopeRovingFocusGroup,
	children: /* @__PURE__ */ x(xs.Slot, {
		scope: e.__scopeRovingFocusGroup,
		children: /* @__PURE__ */ x(ks, {
			...e,
			ref: t
		})
	})
}));
Os.displayName = bs;
var ks = r.forwardRef((e, t) => {
	let { __scopeRovingFocusGroup: n, orientation: i, loop: a = !1, dir: o, currentTabStopId: s, defaultCurrentTabStopId: c, onCurrentTabStopIdChange: l, onEntryFocus: u, preventScrollOnEntryFocus: d = !1, ...f } = e, p = r.useRef(null), m = F(t, p), h = Fe(o), [g, _] = Ce({
		prop: s,
		defaultProp: c ?? null,
		onChange: l,
		caller: bs
	}), [v, y] = r.useState(!1), b = Ie(u), S = Ss(n), C = r.useRef(!1), [w, T] = r.useState(0);
	return r.useEffect(() => {
		let e = p.current;
		if (e) return e.addEventListener(vs, b), () => e.removeEventListener(vs, b);
	}, [b]), /* @__PURE__ */ x(Es, {
		scope: n,
		orientation: i,
		dir: h,
		loop: a,
		currentTabStopId: g,
		onItemFocus: r.useCallback((e) => _(e), [_]),
		onItemShiftTab: r.useCallback(() => y(!0), []),
		onFocusableItemAdd: r.useCallback(() => T((e) => e + 1), []),
		onFocusableItemRemove: r.useCallback(() => T((e) => e - 1), []),
		children: /* @__PURE__ */ x(R.div, {
			tabIndex: v || w === 0 ? -1 : 0,
			"data-orientation": i,
			...f,
			ref: m,
			style: {
				outline: "none",
				...e.style
			},
			onMouseDown: z(e.onMouseDown, () => {
				C.current = !0;
			}),
			onFocus: z(e.onFocus, (e) => {
				let t = !C.current;
				if (e.target === e.currentTarget && t && !v) {
					let t = new CustomEvent(vs, ys);
					if (e.currentTarget.dispatchEvent(t), !t.defaultPrevented) {
						let e = S().filter((e) => e.focusable);
						Fs([
							e.find((e) => e.active),
							e.find((e) => e.id === g),
							...e
						].filter(Boolean).map((e) => e.ref.current), d);
					}
				}
				C.current = !1;
			}),
			onBlur: z(e.onBlur, () => y(!1))
		})
	});
}), As = "RovingFocusGroupItem", js = r.forwardRef((e, t) => {
	let { __scopeRovingFocusGroup: n, focusable: i = !0, active: a = !1, tabStopId: o, children: s, ...c } = e, l = Ne(), u = o || l, d = Ds(As, n), f = d.currentTabStopId === u, p = Ss(n), { onFocusableItemAdd: m, onFocusableItemRemove: h, currentTabStopId: g } = d;
	return r.useEffect(() => {
		if (i) return m(), () => h();
	}, [
		i,
		m,
		h
	]), /* @__PURE__ */ x(xs.ItemSlot, {
		scope: n,
		id: u,
		focusable: i,
		active: a,
		children: /* @__PURE__ */ x(R.span, {
			tabIndex: f ? 0 : -1,
			"data-orientation": d.orientation,
			...c,
			ref: t,
			onMouseDown: z(e.onMouseDown, (e) => {
				i ? d.onItemFocus(u) : e.preventDefault();
			}),
			onFocus: z(e.onFocus, () => d.onItemFocus(u)),
			onKeyDown: z(e.onKeyDown, (e) => {
				if (e.key === "Tab" && e.shiftKey) {
					d.onItemShiftTab();
					return;
				}
				if (e.target !== e.currentTarget) return;
				let t = Ps(e, d.orientation, d.dir);
				if (t !== void 0) {
					if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
					e.preventDefault();
					let n = p().filter((e) => e.focusable).map((e) => e.ref.current);
					if (t === "last") n.reverse();
					else if (t === "prev" || t === "next") {
						t === "prev" && n.reverse();
						let r = n.indexOf(e.currentTarget);
						n = d.loop ? Is(n, r + 1) : n.slice(r + 1);
					}
					setTimeout(() => Fs(n));
				}
			}),
			children: typeof s == "function" ? s({
				isCurrentTabStop: f,
				hasTabStop: g != null
			}) : s
		})
	});
});
js.displayName = As;
var Ms = {
	ArrowLeft: "prev",
	ArrowUp: "prev",
	ArrowRight: "next",
	ArrowDown: "next",
	PageUp: "first",
	Home: "first",
	PageDown: "last",
	End: "last"
};
function Ns(e, t) {
	return t === "rtl" ? e === "ArrowLeft" ? "ArrowRight" : e === "ArrowRight" ? "ArrowLeft" : e : e;
}
function Ps(e, t, n) {
	let r = Ns(e.key, n);
	if (!(t === "vertical" && ["ArrowLeft", "ArrowRight"].includes(r)) && !(t === "horizontal" && ["ArrowUp", "ArrowDown"].includes(r))) return Ms[r];
}
function Fs(e, t = !1) {
	let n = document.activeElement;
	for (let r of e) if (r === n || (r.focus({ preventScroll: t }), document.activeElement !== n)) return;
}
function Is(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
var Ls = Os, Rs = js, zs = "Label", Bs = r.forwardRef((e, t) => /* @__PURE__ */ x(R.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
Bs.displayName = zs;
var Vs = Bs;
//#endregion
//#region node_modules/@radix-ui/number/dist/index.mjs
function Hs(e, [t, n]) {
	return Math.min(n, Math.max(t, e));
}
//#endregion
//#region node_modules/@radix-ui/react-select/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function Us(e) {
	let t = /* @__PURE__ */ Ws(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Ks);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ x(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ x(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function Ws(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Js(n), a = qs(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? ne(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Gs = Symbol("radix.slottable");
function Ks(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Gs;
}
function qs(e, t) {
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
function Js(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-select/dist/index.mjs
var Ys = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], Xs = [" ", "Enter"], Zs = "Select", [Qs, $s, ec] = be(Zs), [tc, nc] = fe(Zs, [ec, Qo]), rc = Qo(), [ic, ac] = tc(Zs), [oc, sc] = tc(Zs), cc = (e) => {
	let { __scopeSelect: t, children: n, open: i, defaultOpen: a, onOpenChange: o, value: s, defaultValue: c, onValueChange: l, dir: u, name: d, autoComplete: f, disabled: p, required: m, form: h } = e, g = rc(t), [_, v] = r.useState(null), [y, b] = r.useState(null), [C, w] = r.useState(!1), T = Fe(u), [E, ee] = Ce({
		prop: i,
		defaultProp: a ?? !1,
		onChange: o,
		caller: Zs
	}), [D, O] = Ce({
		prop: s,
		defaultProp: c,
		onChange: l,
		caller: Zs
	}), k = r.useRef(null), A = _ ? h || !!_.closest("form") : !0, [j, M] = r.useState(/* @__PURE__ */ new Set()), N = Array.from(j).map((e) => e.props.value).join(";");
	return /* @__PURE__ */ x(ms, {
		...g,
		children: /* @__PURE__ */ S(ic, {
			required: m,
			scope: t,
			trigger: _,
			onTriggerChange: v,
			valueNode: y,
			onValueNodeChange: b,
			valueNodeHasChildren: C,
			onValueNodeHasChildrenChange: w,
			contentId: Ne(),
			value: D,
			onValueChange: O,
			open: E,
			onOpenChange: ee,
			dir: T,
			triggerPointerDownPosRef: k,
			disabled: p,
			children: [/* @__PURE__ */ x(Qs.Provider, {
				scope: t,
				children: /* @__PURE__ */ x(oc, {
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
			}), A ? /* @__PURE__ */ S(rl, {
				"aria-hidden": !0,
				required: m,
				tabIndex: -1,
				name: d,
				autoComplete: f,
				value: D,
				onChange: (e) => O(e.target.value),
				disabled: p,
				form: h,
				children: [D === void 0 ? /* @__PURE__ */ x("option", { value: "" }) : null, Array.from(j)]
			}, N) : null]
		})
	});
};
cc.displayName = Zs;
var lc = "SelectTrigger", uc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, disabled: i = !1, ...a } = e, o = rc(n), s = ac(lc, n), c = s.disabled || i, l = F(t, s.onTriggerChange), u = $s(n), d = r.useRef("touch"), [f, p, m] = al((e) => {
		let t = u().filter((e) => !e.disabled), n = ol(t, e, t.find((e) => e.value === s.value));
		n !== void 0 && s.onValueChange(n.value);
	}), h = (e) => {
		c || (s.onOpenChange(!0), m()), e && (s.triggerPointerDownPosRef.current = {
			x: Math.round(e.pageX),
			y: Math.round(e.pageY)
		});
	};
	return /* @__PURE__ */ x(hs, {
		asChild: !0,
		...o,
		children: /* @__PURE__ */ x(R.button, {
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
			"data-placeholder": il(s.value) ? "" : void 0,
			...a,
			ref: l,
			onClick: z(a.onClick, (e) => {
				e.currentTarget.focus(), d.current !== "mouse" && h(e);
			}),
			onPointerDown: z(a.onPointerDown, (e) => {
				d.current = e.pointerType;
				let t = e.target;
				t.hasPointerCapture(e.pointerId) && t.releasePointerCapture(e.pointerId), e.button === 0 && e.ctrlKey === !1 && e.pointerType === "mouse" && (h(e), e.preventDefault());
			}),
			onKeyDown: z(a.onKeyDown, (e) => {
				let t = f.current !== "";
				!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && p(e.key), !(t && e.key === " ") && Ys.includes(e.key) && (h(), e.preventDefault());
			})
		})
	});
});
uc.displayName = lc;
var dc = "SelectValue", fc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: r, style: i, children: a, placeholder: o = "", ...s } = e, c = ac(dc, n), { onValueNodeHasChildrenChange: l } = c, u = a !== void 0, d = F(t, c.onValueNodeChange);
	return xe(() => {
		l(u);
	}, [l, u]), /* @__PURE__ */ x(R.span, {
		...s,
		ref: d,
		style: { pointerEvents: "none" },
		children: il(c.value) ? /* @__PURE__ */ x(b, { children: o }) : a
	});
});
fc.displayName = dc;
var pc = "SelectIcon", mc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, children: r, ...i } = e;
	return /* @__PURE__ */ x(R.span, {
		"aria-hidden": !0,
		...i,
		ref: t,
		children: r || "▼"
	});
});
mc.displayName = pc;
var hc = "SelectPortal", gc = (e) => /* @__PURE__ */ x(mt, {
	asChild: !0,
	...e
});
gc.displayName = hc;
var _c = "SelectContent", vc = r.forwardRef((e, t) => {
	let n = ac(_c, e.__scopeSelect), [i, a] = r.useState();
	if (xe(() => {
		a(new DocumentFragment());
	}, []), !n.open) {
		let t = i;
		return t ? v.createPortal(/* @__PURE__ */ x(bc, {
			scope: e.__scopeSelect,
			children: /* @__PURE__ */ x(Qs.Slot, {
				scope: e.__scopeSelect,
				children: /* @__PURE__ */ x("div", { children: e.children })
			})
		}), t) : null;
	}
	return /* @__PURE__ */ x(wc, {
		...e,
		ref: t
	});
});
vc.displayName = _c;
var yc = 10, [bc, xc] = tc(_c), Sc = "SelectContentImpl", Cc = /* @__PURE__ */ Us("SelectContent.RemoveScroll"), wc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, position: i = "item-aligned", onCloseAutoFocus: a, onEscapeKeyDown: o, onPointerDownOutside: s, side: c, sideOffset: l, align: u, alignOffset: d, arrowPadding: f, collisionBoundary: p, collisionPadding: m, sticky: h, hideWhenDetached: g, avoidCollisions: _, ...v } = e, y = ac(_c, n), [b, S] = r.useState(null), [C, w] = r.useState(null), T = F(t, (e) => S(e)), [E, ee] = r.useState(null), [D, O] = r.useState(null), k = $s(n), [A, j] = r.useState(!1), M = r.useRef(!1);
	r.useEffect(() => {
		if (b) return Bn(b);
	}, [b]), gt();
	let N = r.useCallback((e) => {
		let [t, ...n] = k().map((e) => e.ref.current), [r] = n.slice(-1), i = document.activeElement;
		for (let n of e) if (n === i || (n?.scrollIntoView({ block: "nearest" }), n === t && C && (C.scrollTop = 0), n === r && C && (C.scrollTop = C.scrollHeight), n?.focus(), document.activeElement !== i)) return;
	}, [k, C]), te = r.useCallback(() => N([E, b]), [
		N,
		E,
		b
	]);
	r.useEffect(() => {
		A && te();
	}, [A, te]);
	let { onOpenChange: P, triggerPointerDownPosRef: ne } = y;
	r.useEffect(() => {
		if (b) {
			let e = {
				x: 0,
				y: 0
			}, t = (t) => {
				e = {
					x: Math.abs(Math.round(t.pageX) - (ne.current?.x ?? 0)),
					y: Math.abs(Math.round(t.pageY) - (ne.current?.y ?? 0))
				};
			}, n = (n) => {
				e.x <= 10 && e.y <= 10 ? n.preventDefault() : b.contains(n.target) || P(!1), document.removeEventListener("pointermove", t), ne.current = null;
			};
			return ne.current !== null && (document.addEventListener("pointermove", t), document.addEventListener("pointerup", n, {
				capture: !0,
				once: !0
			})), () => {
				document.removeEventListener("pointermove", t), document.removeEventListener("pointerup", n, { capture: !0 });
			};
		}
	}, [
		b,
		P,
		ne
	]), r.useEffect(() => {
		let e = () => P(!1);
		return window.addEventListener("blur", e), window.addEventListener("resize", e), () => {
			window.removeEventListener("blur", e), window.removeEventListener("resize", e);
		};
	}, [P]);
	let [re, ie] = al((e) => {
		let t = k().filter((e) => !e.disabled), n = ol(t, e, t.find((e) => e.ref.current === document.activeElement));
		n && setTimeout(() => n.ref.current.focus());
	}), I = r.useCallback((e, t, n) => {
		let r = !M.current && !n;
		(y.value !== void 0 && y.value === t || r) && (ee(e), r && (M.current = !0));
	}, [y.value]), L = r.useCallback(() => b?.focus(), [b]), ae = r.useCallback((e, t, n) => {
		let r = !M.current && !n;
		(y.value !== void 0 && y.value === t || r) && O(e);
	}, [y.value]), oe = i === "popper" ? Oc : Ec, R = oe === Oc ? {
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
	return /* @__PURE__ */ x(bc, {
		scope: n,
		content: b,
		viewport: C,
		onViewportChange: w,
		itemRefCallback: I,
		selectedItem: E,
		onItemLeave: L,
		itemTextRefCallback: ae,
		focusSelectedItem: te,
		selectedItemText: D,
		position: i,
		isPositioned: A,
		searchRef: re,
		children: /* @__PURE__ */ x(jn, {
			as: Cc,
			allowPinchZoom: !0,
			children: /* @__PURE__ */ x(tt, {
				asChild: !0,
				trapped: y.open,
				onMountAutoFocus: (e) => {
					e.preventDefault();
				},
				onUnmountAutoFocus: z(a, (e) => {
					y.trigger?.focus({ preventScroll: !0 }), e.preventDefault();
				}),
				children: /* @__PURE__ */ x(We, {
					asChild: !0,
					disableOutsidePointerEvents: !0,
					onEscapeKeyDown: o,
					onPointerDownOutside: s,
					onFocusOutside: (e) => e.preventDefault(),
					onDismiss: () => y.onOpenChange(!1),
					children: /* @__PURE__ */ x(oe, {
						role: "listbox",
						id: y.contentId,
						"data-state": y.open ? "open" : "closed",
						dir: y.dir,
						onContextMenu: (e) => e.preventDefault(),
						...v,
						...R,
						onPlaced: () => j(!0),
						ref: T,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none",
							...v.style
						},
						onKeyDown: z(v.onKeyDown, (e) => {
							let t = e.ctrlKey || e.altKey || e.metaKey;
							if (e.key === "Tab" && e.preventDefault(), !t && e.key.length === 1 && ie(e.key), [
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
wc.displayName = Sc;
var Tc = "SelectItemAlignedPosition", Ec = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onPlaced: i, ...a } = e, o = ac(_c, n), s = xc(_c, n), [c, l] = r.useState(null), [u, d] = r.useState(null), f = F(t, (e) => d(e)), p = $s(n), m = r.useRef(!1), h = r.useRef(!0), { viewport: g, selectedItem: _, selectedItemText: v, focusSelectedItem: y } = s, b = r.useCallback(() => {
		if (o.trigger && o.valueNode && c && u && g && _ && v) {
			let e = o.trigger.getBoundingClientRect(), t = u.getBoundingClientRect(), n = o.valueNode.getBoundingClientRect(), r = v.getBoundingClientRect();
			if (o.dir !== "rtl") {
				let i = r.left - t.left, a = n.left - i, o = e.left - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - yc, d = Hs(a, [yc, Math.max(yc, u - l)]);
				c.style.minWidth = s + "px", c.style.left = d + "px";
			} else {
				let i = t.right - r.right, a = window.innerWidth - n.right - i, o = window.innerWidth - e.right - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - yc, d = Hs(a, [yc, Math.max(yc, u - l)]);
				c.style.minWidth = s + "px", c.style.right = d + "px";
			}
			let a = p(), s = window.innerHeight - yc * 2, l = g.scrollHeight, d = window.getComputedStyle(u), f = parseInt(d.borderTopWidth, 10), h = parseInt(d.paddingTop, 10), y = parseInt(d.borderBottomWidth, 10), b = parseInt(d.paddingBottom, 10), x = f + h + l + b + y, S = Math.min(_.offsetHeight * 5, x), C = window.getComputedStyle(g), w = parseInt(C.paddingTop, 10), T = parseInt(C.paddingBottom, 10), E = e.top + e.height / 2 - yc, ee = s - E, D = _.offsetHeight / 2, O = _.offsetTop + D, k = f + h + O, A = x - k;
			if (k <= E) {
				let e = a.length > 0 && _ === a[a.length - 1].ref.current;
				c.style.bottom = "0px";
				let t = u.clientHeight - g.offsetTop - g.offsetHeight, n = k + Math.max(ee, D + (e ? T : 0) + t + y);
				c.style.height = n + "px";
			} else {
				let e = a.length > 0 && _ === a[0].ref.current;
				c.style.top = "0px";
				let t = Math.max(E, f + g.offsetTop + (e ? w : 0) + D) + A;
				c.style.height = t + "px", g.scrollTop = k - E + g.offsetTop;
			}
			c.style.margin = `${yc}px 0`, c.style.minHeight = S + "px", c.style.maxHeight = s + "px", i?.(), requestAnimationFrame(() => m.current = !0);
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
	xe(() => b(), [b]);
	let [S, C] = r.useState();
	return xe(() => {
		u && C(window.getComputedStyle(u).zIndex);
	}, [u]), /* @__PURE__ */ x(kc, {
		scope: n,
		contentWrapper: c,
		shouldExpandOnScrollRef: m,
		onScrollButtonChange: r.useCallback((e) => {
			e && h.current === !0 && (b(), y?.(), h.current = !1);
		}, [b, y]),
		children: /* @__PURE__ */ x("div", {
			ref: l,
			style: {
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: S
			},
			children: /* @__PURE__ */ x(R.div, {
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
Ec.displayName = Tc;
var Dc = "SelectPopperPosition", Oc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, align: r = "start", collisionPadding: i = yc, ...a } = e;
	return /* @__PURE__ */ x(gs, {
		...rc(n),
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
Oc.displayName = Dc;
var [kc, Ac] = tc(_c, {}), jc = "SelectViewport", Mc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, nonce: i, ...a } = e, o = xc(jc, n), s = Ac(jc, n), c = F(t, o.onViewportChange), l = r.useRef(0);
	return /* @__PURE__ */ S(b, { children: [/* @__PURE__ */ x("style", {
		dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" },
		nonce: i
	}), /* @__PURE__ */ x(Qs.Slot, {
		scope: n,
		children: /* @__PURE__ */ x(R.div, {
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
			onScroll: z(a.onScroll, (e) => {
				let t = e.currentTarget, { contentWrapper: n, shouldExpandOnScrollRef: r } = s;
				if (r?.current && n) {
					let e = Math.abs(l.current - t.scrollTop);
					if (e > 0) {
						let r = window.innerHeight - yc * 2, i = parseFloat(n.style.minHeight), a = parseFloat(n.style.height), o = Math.max(i, a);
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
Mc.displayName = jc;
var Nc = "SelectGroup", [Pc, Fc] = tc(Nc), Ic = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = Ne();
	return /* @__PURE__ */ x(Pc, {
		scope: n,
		id: i,
		children: /* @__PURE__ */ x(R.div, {
			role: "group",
			"aria-labelledby": i,
			...r,
			ref: t
		})
	});
});
Ic.displayName = Nc;
var Lc = "SelectLabel", Rc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = Fc(Lc, n);
	return /* @__PURE__ */ x(R.div, {
		id: i.id,
		...r,
		ref: t
	});
});
Rc.displayName = Lc;
var zc = "SelectItem", [Bc, Vc] = tc(zc), Hc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, value: i, disabled: a = !1, textValue: o, ...s } = e, c = ac(zc, n), l = xc(zc, n), u = c.value === i, [d, f] = r.useState(o ?? ""), [p, m] = r.useState(!1), h = F(t, (e) => l.itemRefCallback?.(e, i, a)), g = Ne(), _ = r.useRef("touch"), v = () => {
		a || (c.onValueChange(i), c.onOpenChange(!1));
	};
	if (i === "") throw Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
	return /* @__PURE__ */ x(Bc, {
		scope: n,
		value: i,
		disabled: a,
		textId: g,
		isSelected: u,
		onItemTextChange: r.useCallback((e) => {
			f((t) => t || (e?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ x(Qs.ItemSlot, {
			scope: n,
			value: i,
			disabled: a,
			textValue: d,
			children: /* @__PURE__ */ x(R.div, {
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
				onFocus: z(s.onFocus, () => m(!0)),
				onBlur: z(s.onBlur, () => m(!1)),
				onClick: z(s.onClick, () => {
					_.current !== "mouse" && v();
				}),
				onPointerUp: z(s.onPointerUp, () => {
					_.current === "mouse" && v();
				}),
				onPointerDown: z(s.onPointerDown, (e) => {
					_.current = e.pointerType;
				}),
				onPointerMove: z(s.onPointerMove, (e) => {
					_.current = e.pointerType, a ? l.onItemLeave?.() : _.current === "mouse" && e.currentTarget.focus({ preventScroll: !0 });
				}),
				onPointerLeave: z(s.onPointerLeave, (e) => {
					e.currentTarget === document.activeElement && l.onItemLeave?.();
				}),
				onKeyDown: z(s.onKeyDown, (e) => {
					l.searchRef?.current !== "" && e.key === " " || (Xs.includes(e.key) && v(), e.key === " " && e.preventDefault());
				})
			})
		})
	});
});
Hc.displayName = zc;
var Uc = "SelectItemText", Wc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: i, style: a, ...o } = e, s = ac(Uc, n), c = xc(Uc, n), l = Vc(Uc, n), u = sc(Uc, n), [d, f] = r.useState(null), p = F(t, (e) => f(e), l.onItemTextChange, (e) => c.itemTextRefCallback?.(e, l.value, l.disabled)), m = d?.textContent, h = r.useMemo(() => /* @__PURE__ */ x("option", {
		value: l.value,
		disabled: l.disabled,
		children: m
	}, l.value), [
		l.disabled,
		l.value,
		m
	]), { onNativeOptionAdd: g, onNativeOptionRemove: _ } = u;
	return xe(() => (g(h), () => _(h)), [
		g,
		_,
		h
	]), /* @__PURE__ */ S(b, { children: [/* @__PURE__ */ x(R.span, {
		id: l.textId,
		...o,
		ref: p
	}), l.isSelected && s.valueNode && !s.valueNodeHasChildren ? v.createPortal(o.children, s.valueNode) : null] });
});
Wc.displayName = Uc;
var Gc = "SelectItemIndicator", Kc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return Vc(Gc, n).isSelected ? /* @__PURE__ */ x(R.span, {
		"aria-hidden": !0,
		...r,
		ref: t
	}) : null;
});
Kc.displayName = Gc;
var qc = "SelectScrollUpButton", Jc = r.forwardRef((e, t) => {
	let n = xc(qc, e.__scopeSelect), i = Ac(qc, e.__scopeSelect), [a, o] = r.useState(!1), s = F(t, i.onScrollButtonChange);
	return xe(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				o(t.scrollTop > 0);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ x(Zc, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop -= t.offsetHeight);
		}
	}) : null;
});
Jc.displayName = qc;
var Yc = "SelectScrollDownButton", Xc = r.forwardRef((e, t) => {
	let n = xc(Yc, e.__scopeSelect), i = Ac(Yc, e.__scopeSelect), [a, o] = r.useState(!1), s = F(t, i.onScrollButtonChange);
	return xe(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				let e = t.scrollHeight - t.clientHeight;
				o(Math.ceil(t.scrollTop) < e);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ x(Zc, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop += t.offsetHeight);
		}
	}) : null;
});
Xc.displayName = Yc;
var Zc = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onAutoScroll: i, ...a } = e, o = xc("SelectScrollButton", n), s = r.useRef(null), c = $s(n), l = r.useCallback(() => {
		s.current !== null && (window.clearInterval(s.current), s.current = null);
	}, []);
	return r.useEffect(() => () => l(), [l]), xe(() => {
		c().find((e) => e.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
	}, [c]), /* @__PURE__ */ x(R.div, {
		"aria-hidden": !0,
		...a,
		ref: t,
		style: {
			flexShrink: 0,
			...a.style
		},
		onPointerDown: z(a.onPointerDown, () => {
			s.current === null && (s.current = window.setInterval(i, 50));
		}),
		onPointerMove: z(a.onPointerMove, () => {
			o.onItemLeave?.(), s.current === null && (s.current = window.setInterval(i, 50));
		}),
		onPointerLeave: z(a.onPointerLeave, () => {
			l();
		})
	});
}), Qc = "SelectSeparator", $c = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return /* @__PURE__ */ x(R.div, {
		"aria-hidden": !0,
		...r,
		ref: t
	});
});
$c.displayName = Qc;
var el = "SelectArrow", tl = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = rc(n), a = ac(el, n), o = xc(el, n);
	return a.open && o.position === "popper" ? /* @__PURE__ */ x(_s, {
		...i,
		...r,
		ref: t
	}) : null;
});
tl.displayName = el;
var nl = "SelectBubbleInput", rl = r.forwardRef(({ __scopeSelect: e, value: t, ...n }, i) => {
	let a = r.useRef(null), o = F(i, a), s = gi(t);
	return r.useEffect(() => {
		let e = a.current;
		if (!e) return;
		let n = window.HTMLSelectElement.prototype, r = Object.getOwnPropertyDescriptor(n, "value").set;
		if (s !== t && r) {
			let n = new Event("change", { bubbles: !0 });
			r.call(e, t), e.dispatchEvent(n);
		}
	}, [s, t]), /* @__PURE__ */ x(R.select, {
		...n,
		style: {
			...ce,
			...n.style
		},
		ref: o,
		defaultValue: t
	});
});
rl.displayName = nl;
function il(e) {
	return e === "" || e === void 0;
}
function al(e) {
	let t = Ie(e), n = r.useRef(""), i = r.useRef(0), a = r.useCallback((e) => {
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
function ol(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = sl(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.textValue.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
function sl(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
var cl = cc, ll = uc, ul = fc, dl = mc, fl = gc, pl = vc, ml = Mc, hl = Hc, gl = Wc, _l = Kc, vl = Jc, yl = Xc;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function bl(e) {
	let t = /* @__PURE__ */ Sl(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(wl);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ x(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ x(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
var xl = /* @__PURE__ */ bl("Slot");
/* @__NO_SIDE_EFFECTS__ */
function Sl(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = El(n), a = Tl(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? ne(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Cl = Symbol("radix.slottable");
function wl(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Cl;
}
function Tl(e, t) {
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
function El(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-switch/dist/index.mjs
var Dl = "Switch", [Ol, kl] = fe(Dl), [Al, jl] = Ol(Dl), Ml = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, name: i, checked: a, defaultChecked: o, required: s, disabled: c, value: l = "on", onCheckedChange: u, form: d, ...f } = e, [p, m] = r.useState(null), h = F(t, (e) => m(e)), g = r.useRef(!1), _ = p ? d || !!p.closest("form") : !0, [v, y] = Ce({
		prop: a,
		defaultProp: o ?? !1,
		onChange: u,
		caller: Dl
	});
	return /* @__PURE__ */ S(Al, {
		scope: n,
		checked: v,
		disabled: c,
		children: [/* @__PURE__ */ x(R.button, {
			type: "button",
			role: "switch",
			"aria-checked": v,
			"aria-required": s,
			"data-state": Ll(v),
			"data-disabled": c ? "" : void 0,
			disabled: c,
			value: l,
			...f,
			ref: h,
			onClick: z(e.onClick, (e) => {
				y((e) => !e), _ && (g.current = e.isPropagationStopped(), g.current || e.stopPropagation());
			})
		}), _ && /* @__PURE__ */ x(Il, {
			control: p,
			bubbles: !g.current,
			name: i,
			value: l,
			checked: v,
			required: s,
			disabled: c,
			form: d,
			style: { transform: "translateX(-100%)" }
		})]
	});
});
Ml.displayName = Dl;
var Nl = "SwitchThumb", Pl = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, ...r } = e, i = jl(Nl, n);
	return /* @__PURE__ */ x(R.span, {
		"data-state": Ll(i.checked),
		"data-disabled": i.disabled ? "" : void 0,
		...r,
		ref: t
	});
});
Pl.displayName = Nl;
var Fl = "SwitchBubbleInput", Il = r.forwardRef(({ __scopeSwitch: e, control: t, checked: n, bubbles: i = !0, ...a }, o) => {
	let s = r.useRef(null), c = F(s, o), l = gi(n), u = _i(t);
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
	]), /* @__PURE__ */ x("input", {
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
Il.displayName = Fl;
function Ll(e) {
	return e ? "checked" : "unchecked";
}
var Rl = Ml, zl = Pl, Bl = "Tabs", [Vl, Hl] = fe(Bl, [Ts]), Ul = Ts(), [Wl, Gl] = Vl(Bl), Kl = r.forwardRef((e, t) => {
	let { __scopeTabs: n, value: r, onValueChange: i, defaultValue: a, orientation: o = "horizontal", dir: s, activationMode: c = "automatic", ...l } = e, u = Fe(s), [d, f] = Ce({
		prop: r,
		onChange: i,
		defaultProp: a ?? "",
		caller: Bl
	});
	return /* @__PURE__ */ x(Wl, {
		scope: n,
		baseId: Ne(),
		value: d,
		onValueChange: f,
		orientation: o,
		dir: u,
		activationMode: c,
		children: /* @__PURE__ */ x(R.div, {
			dir: u,
			"data-orientation": o,
			...l,
			ref: t
		})
	});
});
Kl.displayName = Bl;
var ql = "TabsList", Jl = r.forwardRef((e, t) => {
	let { __scopeTabs: n, loop: r = !0, ...i } = e, a = Gl(ql, n);
	return /* @__PURE__ */ x(Ls, {
		asChild: !0,
		...Ul(n),
		orientation: a.orientation,
		dir: a.dir,
		loop: r,
		children: /* @__PURE__ */ x(R.div, {
			role: "tablist",
			"aria-orientation": a.orientation,
			...i,
			ref: t
		})
	});
});
Jl.displayName = ql;
var Yl = "TabsTrigger", Xl = r.forwardRef((e, t) => {
	let { __scopeTabs: n, value: r, disabled: i = !1, ...a } = e, o = Gl(Yl, n), s = Ul(n), c = $l(o.baseId, r), l = eu(o.baseId, r), u = r === o.value;
	return /* @__PURE__ */ x(Rs, {
		asChild: !0,
		...s,
		focusable: !i,
		active: u,
		children: /* @__PURE__ */ x(R.button, {
			type: "button",
			role: "tab",
			"aria-selected": u,
			"aria-controls": l,
			"data-state": u ? "active" : "inactive",
			"data-disabled": i ? "" : void 0,
			disabled: i,
			id: c,
			...a,
			ref: t,
			onMouseDown: z(e.onMouseDown, (e) => {
				!i && e.button === 0 && e.ctrlKey === !1 ? o.onValueChange(r) : e.preventDefault();
			}),
			onKeyDown: z(e.onKeyDown, (e) => {
				[" ", "Enter"].includes(e.key) && o.onValueChange(r);
			}),
			onFocus: z(e.onFocus, () => {
				let e = o.activationMode !== "manual";
				!u && !i && e && o.onValueChange(r);
			})
		})
	});
});
Xl.displayName = Yl;
var Zl = "TabsContent", Ql = r.forwardRef((e, t) => {
	let { __scopeTabs: n, value: i, forceMount: a, children: o, ...s } = e, c = Gl(Zl, n), l = $l(c.baseId, i), u = eu(c.baseId, i), d = i === c.value, f = r.useRef(d);
	return r.useEffect(() => {
		let e = requestAnimationFrame(() => f.current = !1);
		return () => cancelAnimationFrame(e);
	}, []), /* @__PURE__ */ x(De, {
		present: a || d,
		children: ({ present: n }) => /* @__PURE__ */ x(R.div, {
			"data-state": d ? "active" : "inactive",
			"data-orientation": c.orientation,
			role: "tabpanel",
			"aria-labelledby": l,
			hidden: !n,
			id: u,
			tabIndex: 0,
			...s,
			ref: t,
			style: {
				...e.style,
				animationDuration: f.current ? "0s" : void 0
			},
			children: n && o
		})
	});
});
Ql.displayName = Zl;
function $l(e, t) {
	return `${e}-trigger-${t}`;
}
function eu(e, t) {
	return `${e}-content-${t}`;
}
var tu = Kl, nu = Jl, ru = Xl, iu = Ql, au = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, ou = (e, t) => ({
	classGroupId: e,
	validator: t
}), su = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), cu = "-", lu = [], uu = "arbitrary..", du = (e) => {
	let t = mu(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return pu(e);
			let n = e.split(cu);
			return fu(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? au(i, t) : t : i || lu;
			}
			return n[e] || lu;
		}
	};
}, fu = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = fu(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(cu) : e.slice(t).join(cu), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, pu = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? uu + r : void 0;
})(), mu = (e) => {
	let { theme: t, classGroups: n } = e;
	return hu(n, t);
}, hu = (e, t) => {
	let n = su();
	for (let r in e) {
		let i = e[r];
		gu(i, n, r, t);
	}
	return n;
}, gu = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		_u(i, t, n, r);
	}
}, _u = (e, t, n, r) => {
	if (typeof e == "string") {
		vu(e, t, n);
		return;
	}
	if (typeof e == "function") {
		yu(e, t, n, r);
		return;
	}
	bu(e, t, n, r);
}, vu = (e, t, n) => {
	let r = e === "" ? t : xu(t, e);
	r.classGroupId = n;
}, yu = (e, t, n, r) => {
	if (Su(e)) {
		gu(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(ou(n, e));
}, bu = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		gu(o, xu(t, a), n, r);
	}
}, xu = (e, t) => {
	let n = e, r = t.split(cu), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = su(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, Su = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Cu = (e) => {
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
}, wu = "!", Tu = ":", Eu = [], Du = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), Ou = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === Tu) {
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
		s.endsWith(wu) ? (c = s.slice(0, -1), l = !0) : s.startsWith(wu) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return Du(t, l, c, u);
	};
	if (t) {
		let e = t + Tu, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : Du(Eu, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, ku = (e) => {
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
}, Au = (e) => ({
	cache: Cu(e.cacheSize),
	parseClassName: Ou(e),
	sortModifiers: ku(e),
	...du(e)
}), ju = /\s+/, Mu = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(ju), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + wu : g, v = _ + h;
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
}, Nu = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = Pu(n)) && (i && (i += " "), i += r);
	return i;
}, Pu = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = Pu(e[r])) && (n && (n += " "), n += t);
	return n;
}, Fu = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = Au(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = Mu(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(Nu(...e));
}, Iu = [], B = (e) => {
	let t = (t) => t[e] || Iu;
	return t.isThemeGetter = !0, t;
}, Lu = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Ru = /^\((?:(\w[\w-]*):)?(.+)\)$/i, zu = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, Bu = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Vu = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Hu = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, Uu = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Wu = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, Gu = (e) => zu.test(e), V = (e) => !!e && !Number.isNaN(Number(e)), Ku = (e) => !!e && Number.isInteger(Number(e)), qu = (e) => e.endsWith("%") && V(e.slice(0, -1)), Ju = (e) => Bu.test(e), Yu = () => !0, Xu = (e) => Vu.test(e) && !Hu.test(e), Zu = () => !1, Qu = (e) => Uu.test(e), $u = (e) => Wu.test(e), ed = (e) => !H(e) && !U(e), td = (e) => gd(e, bd, Zu), H = (e) => Lu.test(e), nd = (e) => gd(e, xd, Xu), rd = (e) => gd(e, Sd, V), id = (e) => gd(e, wd, Yu), ad = (e) => gd(e, Cd, Zu), od = (e) => gd(e, vd, Zu), sd = (e) => gd(e, yd, $u), cd = (e) => gd(e, Td, Qu), U = (e) => Ru.test(e), ld = (e) => _d(e, xd), ud = (e) => _d(e, Cd), dd = (e) => _d(e, vd), fd = (e) => _d(e, bd), pd = (e) => _d(e, yd), md = (e) => _d(e, Td, !0), hd = (e) => _d(e, wd, !0), gd = (e, t, n) => {
	let r = Lu.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, _d = (e, t, n = !1) => {
	let r = Ru.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, vd = (e) => e === "position" || e === "percentage", yd = (e) => e === "image" || e === "url", bd = (e) => e === "length" || e === "size" || e === "bg-size", xd = (e) => e === "length", Sd = (e) => e === "number", Cd = (e) => e === "family-name", wd = (e) => e === "number" || e === "weight", Td = (e) => e === "shadow", Ed = /* @__PURE__ */ Fu(() => {
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
		Gu,
		"full",
		"auto",
		...w()
	], E = () => [
		Ku,
		"none",
		"subgrid",
		U,
		H
	], ee = () => [
		"auto",
		{ span: [
			"full",
			Ku,
			U,
			H
		] },
		Ku,
		U,
		H
	], D = () => [
		Ku,
		"auto",
		U,
		H
	], O = () => [
		"auto",
		"min",
		"max",
		"fr",
		U,
		H
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
		Gu,
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
		Gu,
		"screen",
		"full",
		"dvw",
		"lvw",
		"svw",
		"min",
		"max",
		"fit",
		...w()
	], te = () => [
		Gu,
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
	], P = () => [
		e,
		U,
		H
	], ne = () => [
		...b(),
		dd,
		od,
		{ position: [U, H] }
	], F = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], re = () => [
		"auto",
		"cover",
		"contain",
		fd,
		td,
		{ size: [U, H] }
	], ie = () => [
		qu,
		ld,
		nd
	], I = () => [
		"",
		"none",
		"full",
		l,
		U,
		H
	], L = () => [
		"",
		V,
		ld,
		nd
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
		V,
		qu,
		dd,
		od
	], se = () => [
		"",
		"none",
		m,
		U,
		H
	], ce = () => [
		"none",
		V,
		U,
		H
	], le = () => [
		"none",
		V,
		U,
		H
	], ue = () => [
		V,
		U,
		H
	], de = () => [
		Gu,
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
			blur: [Ju],
			breakpoint: [Ju],
			color: [Yu],
			container: [Ju],
			"drop-shadow": [Ju],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [ed],
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
			"inset-shadow": [Ju],
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
			radius: [Ju],
			shadow: [Ju],
			spacing: ["px", V],
			text: [Ju],
			"text-shadow": [Ju],
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
				Gu,
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
				Ku,
				"auto",
				U,
				H
			] }],
			basis: [{ basis: [
				Gu,
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
				Gu,
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
				Ku,
				"first",
				"last",
				"none",
				U,
				H
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
			"block-size": [{ block: ["auto", ...te()] }],
			"min-block-size": [{ "min-block": ["auto", ...te()] }],
			"max-block-size": [{ "max-block": ["none", ...te()] }],
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
				ld,
				nd
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				hd,
				id
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
				qu,
				H
			] }],
			"font-family": [{ font: [
				ud,
				ad,
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
				rd
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
			"placeholder-color": [{ placeholder: P() }],
			"text-color": [{ text: P() }],
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			"text-decoration-style": [{ decoration: [...ae(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				V,
				"from-font",
				"auto",
				U,
				nd
			] }],
			"text-decoration-color": [{ decoration: P() }],
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
			"bg-position": [{ bg: ne() }],
			"bg-repeat": [{ bg: F() }],
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
						Ku,
						U,
						H
					],
					radial: [
						"",
						U,
						H
					],
					conic: [
						Ku,
						U,
						H
					]
				},
				pd,
				sd
			] }],
			"bg-color": [{ bg: P() }],
			"gradient-from-pos": [{ from: ie() }],
			"gradient-via-pos": [{ via: ie() }],
			"gradient-to-pos": [{ to: ie() }],
			"gradient-from": [{ from: P() }],
			"gradient-via": [{ via: P() }],
			"gradient-to": [{ to: P() }],
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
			"border-color": [{ border: P() }],
			"border-color-x": [{ "border-x": P() }],
			"border-color-y": [{ "border-y": P() }],
			"border-color-s": [{ "border-s": P() }],
			"border-color-e": [{ "border-e": P() }],
			"border-color-bs": [{ "border-bs": P() }],
			"border-color-be": [{ "border-be": P() }],
			"border-color-t": [{ "border-t": P() }],
			"border-color-r": [{ "border-r": P() }],
			"border-color-b": [{ "border-b": P() }],
			"border-color-l": [{ "border-l": P() }],
			"divide-color": [{ divide: P() }],
			"outline-style": [{ outline: [
				...ae(),
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
				ld,
				nd
			] }],
			"outline-color": [{ outline: P() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				md,
				cd
			] }],
			"shadow-color": [{ shadow: P() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				md,
				cd
			] }],
			"inset-shadow-color": [{ "inset-shadow": P() }],
			"ring-w": [{ ring: L() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: P() }],
			"ring-offset-w": [{ "ring-offset": [V, nd] }],
			"ring-offset-color": [{ "ring-offset": P() }],
			"inset-ring-w": [{ "inset-ring": L() }],
			"inset-ring-color": [{ "inset-ring": P() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				md,
				cd
			] }],
			"text-shadow-color": [{ "text-shadow": P() }],
			opacity: [{ opacity: [
				V,
				U,
				H
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
			"mask-image-linear-pos": [{ "mask-linear": [V] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": R() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": R() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": P() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": P() }],
			"mask-image-t-from-pos": [{ "mask-t-from": R() }],
			"mask-image-t-to-pos": [{ "mask-t-to": R() }],
			"mask-image-t-from-color": [{ "mask-t-from": P() }],
			"mask-image-t-to-color": [{ "mask-t-to": P() }],
			"mask-image-r-from-pos": [{ "mask-r-from": R() }],
			"mask-image-r-to-pos": [{ "mask-r-to": R() }],
			"mask-image-r-from-color": [{ "mask-r-from": P() }],
			"mask-image-r-to-color": [{ "mask-r-to": P() }],
			"mask-image-b-from-pos": [{ "mask-b-from": R() }],
			"mask-image-b-to-pos": [{ "mask-b-to": R() }],
			"mask-image-b-from-color": [{ "mask-b-from": P() }],
			"mask-image-b-to-color": [{ "mask-b-to": P() }],
			"mask-image-l-from-pos": [{ "mask-l-from": R() }],
			"mask-image-l-to-pos": [{ "mask-l-to": R() }],
			"mask-image-l-from-color": [{ "mask-l-from": P() }],
			"mask-image-l-to-color": [{ "mask-l-to": P() }],
			"mask-image-x-from-pos": [{ "mask-x-from": R() }],
			"mask-image-x-to-pos": [{ "mask-x-to": R() }],
			"mask-image-x-from-color": [{ "mask-x-from": P() }],
			"mask-image-x-to-color": [{ "mask-x-to": P() }],
			"mask-image-y-from-pos": [{ "mask-y-from": R() }],
			"mask-image-y-to-pos": [{ "mask-y-to": R() }],
			"mask-image-y-from-color": [{ "mask-y-from": P() }],
			"mask-image-y-to-color": [{ "mask-y-to": P() }],
			"mask-image-radial": [{ "mask-radial": [U, H] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": R() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": R() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": P() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": P() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [V] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": R() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": R() }],
			"mask-image-conic-from-color": [{ "mask-conic-from": P() }],
			"mask-image-conic-to-color": [{ "mask-conic-to": P() }],
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
			"mask-position": [{ mask: ne() }],
			"mask-repeat": [{ mask: F() }],
			"mask-size": [{ mask: re() }],
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
			blur: [{ blur: se() }],
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
				md,
				cd
			] }],
			"drop-shadow-color": [{ "drop-shadow": P() }],
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
			"backdrop-blur": [{ "backdrop-blur": se() }],
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
				U,
				H,
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
			accent: [{ accent: P() }],
			appearance: [{ appearance: ["none", "auto"] }],
			"caret-color": [{ caret: P() }],
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
			fill: [{ fill: ["none", ...P()] }],
			"stroke-w": [{ stroke: [
				V,
				ld,
				nd,
				rd
			] }],
			stroke: [{ stroke: ["none", ...P()] }],
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
	return Ed(j(e));
}
//#endregion
//#region src/components/ui/button.tsx
var Dd = te("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
function G({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ x(r ? xl : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: W(Dd({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/components/ui/card.tsx
var Od = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function K({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ x("div", {
		"data-slot": "card",
		"data-variant": t,
		className: W("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", Od[t], e),
		...n
	});
}
function q({ className: e, ...t }) {
	return /* @__PURE__ */ x("div", {
		"data-slot": "card-header",
		className: W("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function J({ className: e, ...t }) {
	return /* @__PURE__ */ x("div", {
		"data-slot": "card-title",
		className: W("leading-none font-semibold", e),
		...t
	});
}
function Y({ className: e, ...t }) {
	return /* @__PURE__ */ x("div", {
		"data-slot": "card-content",
		className: W("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var kd = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), Ad = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), jd = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), Md = (e) => {
	let t = jd(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, Nd = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, Pd = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, Fd = a({}), Id = () => l(Fd), Ld = s(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: a, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = Id() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return o("svg", {
		ref: l,
		...Nd,
		width: t ?? u ?? Nd.width,
		height: t ?? u ?? Nd.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: kd("lucide", m, i),
		...!a && !Pd(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => o(e, t)), ...Array.isArray(a) ? a : [a]]);
}), Rd = (e, t) => {
	let n = s(({ className: n, ...r }, i) => o(Ld, {
		ref: i,
		iconNode: t,
		className: kd(`lucide-${Ad(Md(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = Md(e), n;
}, zd = Rd("arrow-down", [["path", {
	d: "M12 5v14",
	key: "s699le"
}], ["path", {
	d: "m19 12-7 7-7-7",
	key: "1idqje"
}]]), Bd = Rd("arrow-up", [["path", {
	d: "m5 12 7-7 7 7",
	key: "hav0vg"
}], ["path", {
	d: "M12 19V5",
	key: "x0mq9r"
}]]), Vd = Rd("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]), Hd = Rd("chevron-down", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]), Ud = Rd("chevron-up", [["path", {
	d: "m18 15-6-6-6 6",
	key: "153udz"
}]]), Wd = Rd("pencil", [["path", {
	d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
	key: "1a8usu"
}], ["path", {
	d: "m15 5 4 4",
	key: "1mk7zo"
}]]), Gd = Rd("plus", [["path", {
	d: "M5 12h14",
	key: "1ays0h"
}], ["path", {
	d: "M12 5v14",
	key: "s699le"
}]]), Kd = Rd("search", [["path", {
	d: "m21 21-4.34-4.34",
	key: "14j7rj"
}], ["circle", {
	cx: "11",
	cy: "11",
	r: "8",
	key: "4ej97u"
}]]), qd = Rd("sparkles", [
	["path", {
		d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
		key: "1s2grr"
	}],
	["path", {
		d: "M20 2v4",
		key: "1rf3ol"
	}],
	["path", {
		d: "M22 4h-4",
		key: "gwowj6"
	}],
	["circle", {
		cx: "4",
		cy: "20",
		r: "2",
		key: "6kqj1y"
	}]
]), Jd = Rd("trash-2", [
	["path", {
		d: "M10 11v6",
		key: "nco0om"
	}],
	["path", {
		d: "M14 11v6",
		key: "outv1u"
	}],
	["path", {
		d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
		key: "miytrc"
	}],
	["path", {
		d: "M3 6h18",
		key: "d0wm0j"
	}],
	["path", {
		d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
		key: "e791ji"
	}]
]), Yd = Rd("x", [["path", {
	d: "M18 6 6 18",
	key: "1bl5f8"
}], ["path", {
	d: "m6 6 12 12",
	key: "d8bk6v"
}]]);
//#endregion
//#region src/components/ui/checkbox.tsx
function Xd({ className: e, ...t }) {
	return /* @__PURE__ */ x(Ei, {
		"data-slot": "checkbox",
		className: W("peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary", e),
		...t,
		children: /* @__PURE__ */ x(Oi, {
			"data-slot": "checkbox-indicator",
			className: "grid place-content-center text-current transition-none",
			children: /* @__PURE__ */ x(Vd, { className: "size-3.5" })
		})
	});
}
//#endregion
//#region src/components/ui/input.tsx
function X({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ x("input", {
		type: t,
		"data-slot": "input",
		className: W("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function Z({ className: e, ...t }) {
	return /* @__PURE__ */ x(Vs, {
		"data-slot": "label",
		className: W("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/components/ui/switch.tsx
function Zd({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ x(Rl, {
		"data-slot": "switch",
		"data-size": t,
		className: W("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", e),
		...n,
		dir: "ltr",
		children: /* @__PURE__ */ x(zl, {
			"data-slot": "switch-thumb",
			className: W("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
//#endregion
//#region src/lib/marketplace-api.ts
function Qd(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function $d(e) {
	"@babel/helpers - typeof";
	return $d = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, $d(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function ef(e, t) {
	if ($d(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if ($d(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function tf(e) {
	var t = ef(e, "string");
	return $d(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function nf(e, t, n) {
	return (t = tf(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/lib/apiError.ts
var rf = class extends Error {
	constructor(e, t) {
		super(e), nf(this, "code", void 0), nf(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, af = {
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
function of(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function sf(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function cf(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(Qd(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function lf(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return cf(e, n);
	if (t instanceof rf && t.code) {
		let n = af[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = af[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return of(n) ? e("errors.api.timeout") : sf(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function uf(e, t) {
	_.error(lf(e, t));
}
//#endregion
//#region src/lib/safeUrl.ts
function df(e) {
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
function ff() {
	return window.webinoDashboard;
}
var pf = 3e4;
function mf(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function hf(e) {
	let t = ff();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (mf(e) || df(e)) return e;
	throw new rf("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function gf(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function _f(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : null;
}
function vf(e, t) {
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
function yf(e, t) {
	let n = e.toLowerCase();
	return e.includes("Upstream Error") || e.includes("Forbidden") || t === 403 ? "admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry" : n.includes("timed out") || n.includes("timeout") || t === 504 || t === 524 ? "Request timed out — RSA-4096 generation can take over a minute on weak hosts" : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? `Invalid AJAX response (HTML, HTTP ${t || 0})` : `Invalid AJAX response (HTTP ${t || 0})`;
}
async function bf(e, t, n = {}) {
	let r = _f(e), i = ff();
	if (!r || !i.ajaxUrl) throw new rf("AJAX fallback unavailable", {
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
	let { signal: l, clear: u } = gf({}, t);
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
			throw new rf(yf(t, e.status), {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!n.success) throw new rf(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
			code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
			status: e.status
		});
		return n.data;
	} catch (e) {
		throw e instanceof rf ? e : e instanceof DOMException && e.name === "AbortError" ? new rf("Request timed out", {
			code: "timeout",
			status: 0
		}) : e instanceof TypeError ? new rf("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		u();
	}
}
async function Q(e, t = {}, n = pf) {
	if (_f(e) && ff().ajaxUrl) return bf(e, n, t);
	let r = hf(e), i = ff(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce);
	let { signal: s, clear: c } = gf(t, n);
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
			let t = vf(n, e.status);
			throw new rf(t.message, {
				code: t.code,
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i;
			throw new rf(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
		}
		return i;
	} catch (e) {
		throw e instanceof rf ? e : e instanceof DOMException && e.name === "AbortError" ? new rf("Request timed out", {
			code: "timeout",
			status: 0
		}) : e instanceof TypeError ? new rf("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region src/lib/bootstrapQuery.ts
function xf(e) {
	let { nav_group: t, children: n, navGroup: r, ...i } = e;
	return {
		...i,
		navGroup: r ?? t,
		children: n?.map((e) => xf(e))
	};
}
function Sf(e) {
	return e?.length ? e.map((e) => xf(e)) : e;
}
var Cf = ["bootstrap"];
function wf(e) {
	return Array.isArray(e) ? e.filter((e) => typeof e == "string" && e.length > 0) : [];
}
function Tf(e) {
	return {
		...e,
		capabilities: wf(e.capabilities),
		modules: Sf(e.modules) ?? e.modules,
		installedModuleSlugs: Array.isArray(e.installedModuleSlugs) ? e.installedModuleSlugs.filter((e) => typeof e == "string" && e.length > 0) : e.installedModuleSlugs
	};
}
function Ef() {
	let e = window.webinoDashboard.bootstrap;
	if (e) return Tf(e);
}
//#endregion
//#region src/hooks/useBootstrapQuery.ts
function Df() {
	let e = f(() => Ef(), []), n = !!(e && e.embedMinimal);
	return t({
		queryKey: Cf,
		queryFn: async () => Tf(await Q("bootstrap")),
		initialData: e,
		initialDataUpdatedAt: e ? n ? 0 : Date.now() : void 0,
		staleTime: n ? 0 : 12e4,
		gcTime: 6e5,
		placeholderData: (t) => t ?? e,
		refetchOnMount: n ? "always" : !e,
		refetchOnWindowFocus: !1,
		retry: 1
	});
}
//#endregion
//#region src/lib/aiJobProgress.ts
var Of = [
	"queued",
	"layout",
	"visual",
	"provider",
	"seo",
	"writing",
	"done"
];
function kf(e) {
	if (!e) return "queued";
	if (e.status === "done") return "done";
	if (e.status === "failed") return "failed";
	if (e.status === "cancelled") return "cancelled";
	let t = String(e.result_summary || "").toLowerCase();
	return Of.includes(t) ? t : e.status === "running" ? "provider" : "queued";
}
function Af(e) {
	return {
		queued: 8,
		layout: 22,
		visual: 45,
		provider: 40,
		seo: 65,
		writing: 85,
		done: 100,
		failed: 100,
		cancelled: 100
	}[e] ?? 15;
}
function jf(e) {
	return new Promise((t) => window.setTimeout(t, e));
}
//#endregion
//#region src/components/AiGenerateButton.tsx
var Mf = 2e3, Nf = 480 * 1e3;
function Pf(e) {
	return e === "done" || e === "failed" || e === "cancelled";
}
function Ff({ type: t, id: r = 0, payload: i, onDone: a, size: o = "sm", variant: s = "outline", className: c }) {
	let { t: l } = g(), u = n(), d = (Df().data?.activeModuleClients ?? []).some((e) => e.slug === "ai-content-module"), [f, p] = m(null), [h, v] = m(!1), y = (e) => {
		_.success(l("aiContent.generateDone")), u.invalidateQueries({ queryKey: ["ai-content"] }), t === "product" && r && (u.invalidateQueries({ queryKey: ["coffee-profile", r] }), u.invalidateQueries({ queryKey: ["product", r] }), u.invalidateQueries({ queryKey: [
			"shop",
			"products",
			r
		] })), a?.(), window.setTimeout(() => p(null), 800);
	}, C = e({
		mutationFn: async () => {
			v(!0);
			let e = await Q("ai-content/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: t,
					id: r,
					sync: !1,
					payload: i
				})
			});
			if (!e?.job_id || e.job_id < 1) throw new rf(l("aiContent.jobQueueFailed"), {
				code: "ai_enqueue",
				status: 500
			});
			let n = e.job_id;
			p({
				id: n,
				status: "pending",
				result_summary: "queued"
			}), Q(`ai-content/jobs/${n}/run`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: "{}"
			}, 3e4).then((e) => {
				e?.job && p(e.job);
			}).catch(() => {});
			let a = Date.now() + Nf, o = e.job ?? {
				id: n,
				status: "pending",
				result_summary: "queued"
			};
			for (; Date.now() < a;) {
				await jf(Mf);
				try {
					if (o = await Q(`ai-content/jobs/${n}`), p(o), Pf(o.status)) return o;
				} catch {}
			}
			try {
				o = await Q(`ai-content/jobs/${n}`), p(o);
			} catch {}
			return o;
		},
		onSuccess: (e) => {
			if (v(!1), e.status === "failed") {
				_.error(e.error_message || l("aiContent.generateFailed"));
				return;
			}
			if (e.status === "cancelled") {
				_.message(l("aiContent.jobCancelled"));
				return;
			}
			if (e.status !== "done") {
				_.message(l("aiContent.generateStillRunning"));
				return;
			}
			y(e);
		},
		onError: (e) => {
			if (v(!1), f) {
				_.error(f.error_message || l("aiContent.generateFailed"));
				return;
			}
			if (e instanceof rf && e.code === "invalid_json") {
				_.error(l("aiContent.generateFailed"));
				return;
			}
			uf(l, e), p(null);
		}
	}), w = e({
		mutationFn: async () => f?.id ? Q(`ai-content/jobs/${f.id}/cancel`, { method: "POST" }) : null,
		onSuccess: (e) => {
			e?.job && p(e.job), _.message(l("aiContent.jobCancelRequested")), u.invalidateQueries({ queryKey: ["ai-content"] });
		},
		onError: (e) => uf(l, e)
	});
	if (!d) return null;
	let T = kf(f), E = Af(T), ee = !!f && (h || f?.status === "done" || f?.status === "failed" || f?.status === "cancelled"), D = f ? Pf(f.status) : !1;
	return /* @__PURE__ */ S(b, { children: [/* @__PURE__ */ S(G, {
		type: "button",
		size: o,
		variant: s,
		className: c,
		disabled: h || t !== "blog" && !r,
		onClick: () => void C.mutateAsync(),
		children: [/* @__PURE__ */ x(qd, { className: "me-1 size-4" }), l(h ? "aiContent.generating" : "aiContent.generate")]
	}), ee ? /* @__PURE__ */ x("div", {
		className: "bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4",
		children: /* @__PURE__ */ S("div", {
			className: "bg-card w-full max-w-md space-y-4 rounded-xl border p-6 shadow-lg",
			children: [
				/* @__PURE__ */ S("div", {
					className: "flex items-center gap-2 text-sm font-medium",
					children: [/* @__PURE__ */ x(qd, { className: "size-4" }), l("aiContent.generateProgress")]
				}),
				/* @__PURE__ */ x("div", {
					className: "bg-muted h-2 overflow-hidden rounded-full",
					children: /* @__PURE__ */ x("div", {
						className: "bg-primary h-full transition-[width] duration-500",
						style: { width: `${E}%` }
					})
				}),
				/* @__PURE__ */ x("p", {
					className: "text-muted-foreground text-sm",
					children: l(`aiContent.phase.${T}`, { defaultValue: T })
				}),
				f?.error_message && (f.status === "failed" || f.status === "cancelled") ? /* @__PURE__ */ x("p", {
					className: "text-destructive text-sm whitespace-pre-wrap",
					children: f.error_message
				}) : null,
				/* @__PURE__ */ x("div", {
					className: "flex justify-end gap-2",
					children: D ? /* @__PURE__ */ x(G, {
						type: "button",
						size: "sm",
						variant: "outline",
						onClick: () => p(null),
						children: l("aiContent.dismiss")
					}) : /* @__PURE__ */ x(G, {
						type: "button",
						size: "sm",
						variant: "destructive",
						disabled: w.isPending,
						onClick: () => void w.mutateAsync(),
						children: l("aiContent.jobsCancel")
					})
				})
			]
		})
	}) : null] });
}
//#endregion
//#region ../Modules/coffee-profile-module/client/components/CoffeeFlag.tsx
function If(e) {
	let t = e.toUpperCase();
	return /^[A-Z]{2}$/.test(t) ? String.fromCodePoint(...[...t].map((e) => 127397 + e.charCodeAt(0))) : "";
}
function Lf({ origin: e, useFlagcdn: t = !0, className: n = "size-5 rounded-sm object-cover" }) {
	let r = (e.iso_code || "").toLowerCase();
	if (e.thumbnail_url) return /* @__PURE__ */ x("img", {
		src: e.thumbnail_url,
		alt: "",
		className: n
	});
	if (e.flag_url) return /* @__PURE__ */ x("img", {
		src: e.flag_url,
		alt: "",
		className: n
	});
	if (t && /^[a-z]{2}$/.test(r)) return /* @__PURE__ */ x("img", {
		src: `https://flagcdn.com/w40/${r}.png`,
		alt: "",
		className: n
	});
	let i = e.flag_emoji || If(r);
	return i ? /* @__PURE__ */ x("span", {
		className: "text-base leading-none",
		"aria-hidden": !0,
		children: i
	}) : /* @__PURE__ */ x("span", {
		className: "text-muted-foreground text-xs",
		children: "—"
	});
}
//#endregion
//#region ../Modules/coffee-profile-module/client/components/CoffeeProfileProductPanel.tsx
function Rf() {
	return {
		blend_robusta: 0,
		blend_arabica: 0,
		acidity: {},
		caffeine_mg: 0,
		bitterness: 0,
		sweetness: 0,
		body: 0,
		pack_weight_g: 1e3,
		visible: {
			blend: !0,
			acidity: !0,
			caffeine: !0,
			bitterness: !0,
			sweetness: !0,
			body: !0,
			origin: !0
		},
		origin_ids: []
	};
}
function zf(e) {
	let t = Rf().visible, n = {
		...t,
		...e ?? {}
	};
	return Object.values(n).every((e) => !e) ? t : n;
}
function Bf({ productId: r, registerSave: i }) {
	let { t: a } = g(), o = n(), [s, l] = m(Rf), d = p(s);
	d.current = s;
	let h = p(null), v = p(!1), y = t({
		queryKey: ["coffee-profile", r],
		enabled: !!r,
		queryFn: () => Q(`shop/products/${r}/coffee-profile`)
	});
	u(() => {
		h.current = null, v.current = !1, l(Rf());
	}, [r]), u(() => {
		!y.data?.profile || !r || h.current === r && v.current || (h.current = r, v.current = !1, l({
			...Rf(),
			...y.data.profile,
			visible: zf(y.data.profile.visible)
		}));
	}, [y.data, r]);
	let b = y.data?.settings, C = y.data?.origins ?? [], w = b?.scale_min ?? 0, T = b?.scale_max ?? 10, E = c(async (e) => {
		if (!r || h.current !== r) return;
		let t = await Q(`shop/products/${r}/coffee-profile`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(d.current)
		});
		v.current = !1, t.profile && l({
			...Rf(),
			...t.profile,
			visible: zf(t.profile.visible)
		}), o.setQueryData(["coffee-profile", r], t), e?.toast !== !1 && _.success(a("common.saved"));
	}, [
		r,
		o,
		a
	]);
	u(() => {
		if (i) return i(() => E({ toast: !1 })), () => i(null);
	}, [i, E]);
	let ee = e({
		mutationFn: () => E(),
		onError: (e) => uf(a, e)
	}), D = f(() => new Map(C.map((e) => [e.id, e])), [C]);
	if (!r) return /* @__PURE__ */ S(K, { children: [/* @__PURE__ */ x(q, { children: /* @__PURE__ */ x(J, { children: a("coffeeProfile.productTitle") }) }), /* @__PURE__ */ x(Y, { children: /* @__PURE__ */ x("p", {
		className: "text-muted-foreground text-sm",
		children: a("coffeeProfile.saveProductFirst")
	}) })] });
	if (y.isError) return /* @__PURE__ */ S(K, { children: [/* @__PURE__ */ x(q, { children: /* @__PURE__ */ x(J, { children: a("coffeeProfile.productTitle") }) }), /* @__PURE__ */ S(Y, { children: [/* @__PURE__ */ x("p", {
		className: "text-destructive text-sm",
		children: a("common.loadFailed")
	}), /* @__PURE__ */ x(G, {
		type: "button",
		variant: "outline",
		size: "sm",
		className: "mt-3",
		onClick: () => void y.refetch(),
		children: a("license.retry")
	})] })] });
	if (y.isPending || !b) return /* @__PURE__ */ S(K, { children: [/* @__PURE__ */ x(q, { children: /* @__PURE__ */ x(J, { children: a("coffeeProfile.productTitle") }) }), /* @__PURE__ */ x(Y, { children: /* @__PURE__ */ x("p", {
		className: "text-muted-foreground text-sm",
		children: a("common.loading")
	}) })] });
	function O(e) {
		v.current = !0, l(e);
	}
	function k(e, t) {
		O((n) => {
			let r = {
				...n,
				visible: {
					...n.visible,
					[e]: t
				}
			};
			return e === "blend" && t && n.blend_robusta + n.blend_arabica === 0 && (r.blend_robusta = 70, r.blend_arabica = 30), r;
		});
	}
	function A(e) {
		let t = Math.max(0, Math.min(100, Math.round(e)));
		O((e) => ({
			...e,
			blend_robusta: t,
			blend_arabica: 100 - t,
			visible: {
				...e.visible,
				blend: !0
			}
		}));
	}
	function j(e, t) {
		O((n) => ({
			...n,
			acidity: {
				...n.acidity,
				[e]: t
			},
			visible: {
				...n.visible,
				acidity: !0
			}
		}));
	}
	function M(e, t) {
		O((n) => {
			let r = e === "caffeine_mg" ? "caffeine" : e;
			return {
				...n,
				[e]: t,
				visible: {
					...n.visible,
					[r]: !0
				}
			};
		});
	}
	function N(e, t) {
		O((n) => {
			let r = new Set(n.origin_ids);
			t ? r.add(e) : r.delete(e);
			let i = [...r];
			return {
				...n,
				origin_ids: i,
				visible: {
					...n.visible,
					origin: i.length > 0 ? !0 : n.visible.origin
				}
			};
		});
	}
	return /* @__PURE__ */ S(K, { children: [/* @__PURE__ */ S(q, {
		className: "flex flex-row items-center justify-between gap-3",
		children: [/* @__PURE__ */ x(J, { children: a("coffeeProfile.productTitle") }), /* @__PURE__ */ S("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ x(Ff, {
				type: "product",
				id: r,
				onDone: () => {
					v.current = !1, o.invalidateQueries({ queryKey: ["coffee-profile", r] });
				}
			}), /* @__PURE__ */ x(G, {
				type: "button",
				size: "sm",
				disabled: ee.isPending,
				onClick: () => void ee.mutateAsync(),
				children: a("common.save")
			})]
		})]
	}), /* @__PURE__ */ S(Y, {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ S(Vf, {
				id: "blend",
				label: a("coffeeProfile.showBlend"),
				checked: s.visible.blend,
				onCheckedChange: (e) => k("blend", e),
				children: [/* @__PURE__ */ S("div", {
					className: "flex justify-between text-sm",
					children: [/* @__PURE__ */ S("span", { children: [
						b.robusta_label,
						" ",
						/* @__PURE__ */ S("strong", { children: [s.blend_robusta, "٪"] })
					] }), /* @__PURE__ */ S("span", { children: [
						b.arabica_label,
						" ",
						/* @__PURE__ */ S("strong", { children: [s.blend_arabica, "٪"] })
					] })]
				}), /* @__PURE__ */ x("input", {
					type: "range",
					min: 0,
					max: 100,
					value: s.blend_robusta,
					onChange: (e) => A(Number(e.target.value)),
					className: "w-full accent-primary"
				})]
			}),
			/* @__PURE__ */ x(Vf, {
				id: "acidity",
				label: a("coffeeProfile.showAcidity"),
				checked: s.visible.acidity,
				onCheckedChange: (e) => k("acidity", e),
				children: /* @__PURE__ */ x("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: b.acidity_levels.map((e) => /* @__PURE__ */ S("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ S("div", {
							className: "flex justify-between text-sm",
							children: [/* @__PURE__ */ x(Z, {
								htmlFor: `acid-${e.id}`,
								children: e.label
							}), /* @__PURE__ */ x("span", { children: s.acidity[e.id] ?? w })]
						}), /* @__PURE__ */ x("input", {
							id: `acid-${e.id}`,
							type: "range",
							min: w,
							max: T,
							value: s.acidity[e.id] ?? w,
							onChange: (t) => j(e.id, Number(t.target.value)),
							className: "w-full accent-primary"
						})]
					}, e.id))
				})
			}),
			/* @__PURE__ */ x(Vf, {
				id: "caffeine",
				label: a("coffeeProfile.showCaffeine"),
				checked: s.visible.caffeine,
				onCheckedChange: (e) => k("caffeine", e),
				children: /* @__PURE__ */ S("div", {
					className: "flex flex-wrap items-end gap-3",
					children: [/* @__PURE__ */ S("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ x(Z, {
							htmlFor: "coffee-caffeine",
							children: a("coffeeProfile.caffeineMg")
						}), /* @__PURE__ */ x(X, {
							id: "coffee-caffeine",
							type: "number",
							min: 0,
							max: 5e3,
							value: s.caffeine_mg,
							onChange: (e) => M("caffeine_mg", Number(e.target.value) || 0),
							className: "w-32"
						})]
					}), /* @__PURE__ */ S("p", {
						className: "text-muted-foreground pb-2 text-sm",
						children: [
							s.caffeine_mg,
							" ",
							b.caffeine_unit
						]
					})]
				})
			}),
			[
				["bitterness", "showBitterness"],
				["sweetness", "showSweetness"],
				["body", "showBody"]
			].map(([e, t]) => /* @__PURE__ */ S(Vf, {
				id: e,
				label: a(`coffeeProfile.${t}`),
				checked: s.visible[e],
				onCheckedChange: (t) => k(e, t),
				children: [/* @__PURE__ */ S("div", {
					className: "flex justify-between text-sm",
					children: [/* @__PURE__ */ x("span", { children: a(`coffeeProfile.${e}`) }), /* @__PURE__ */ x("span", { children: s[e] })]
				}), /* @__PURE__ */ x("input", {
					type: "range",
					min: w,
					max: T,
					value: s[e],
					onChange: (t) => M(e, Number(t.target.value)),
					className: "w-full accent-primary"
				})]
			}, e)),
			/* @__PURE__ */ S("div", {
				className: "space-y-2 rounded-lg border p-4",
				children: [
					/* @__PURE__ */ x(Z, {
						htmlFor: "coffee-pack",
						children: a("coffeeProfile.packWeight")
					}),
					/* @__PURE__ */ x(X, {
						id: "coffee-pack",
						type: "number",
						min: 1,
						value: s.pack_weight_g,
						onChange: (e) => O((t) => ({
							...t,
							pack_weight_g: Number(e.target.value) || 1e3
						})),
						className: "w-40"
					}),
					/* @__PURE__ */ x("p", {
						className: "text-muted-foreground text-xs",
						children: a("coffeeProfile.packWeightHint")
					})
				]
			}),
			/* @__PURE__ */ x(Vf, {
				id: "origin",
				label: a("coffeeProfile.showOrigin"),
				checked: s.visible.origin,
				onCheckedChange: (e) => k("origin", e),
				children: C.length === 0 ? /* @__PURE__ */ x("p", {
					className: "text-muted-foreground text-sm",
					children: a("coffeeProfile.noOrigins")
				}) : /* @__PURE__ */ x("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: C.map((e) => /* @__PURE__ */ S("label", {
						className: "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
						children: [
							/* @__PURE__ */ x(Xd, {
								checked: s.origin_ids.includes(e.id),
								onCheckedChange: (t) => N(e.id, t === !0)
							}),
							/* @__PURE__ */ x(Lf, {
								origin: D.get(e.id) ?? e,
								useFlagcdn: b.use_flagcdn
							}),
							/* @__PURE__ */ x("span", { children: e.name })
						]
					}, e.id))
				})
			})
		]
	})] });
}
function Vf({ id: e, label: t, checked: n, onCheckedChange: r, children: i }) {
	return /* @__PURE__ */ S("div", {
		className: "space-y-3 rounded-lg border p-4",
		children: [/* @__PURE__ */ S("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ x(Z, {
				htmlFor: `vis-${e}`,
				children: t
			}), /* @__PURE__ */ x(Zd, {
				id: `vis-${e}`,
				checked: n,
				onCheckedChange: r
			})]
		}), i]
	});
}
//#endregion
//#region src/lib/digits.ts
var Hf = "۰۱۲۳۴۵۶۷۸۹";
function Uf(e) {
	return e.toLowerCase().startsWith("fa");
}
function Wf(e) {
	return e.replace(/\d/g, (e) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(e, 10)] ?? e);
}
//#endregion
//#region src/components/ui/formatted-number-input.tsx
var Gf = Object.fromEntries([...Hf].map((e, t) => [e, String(t)]));
function Kf(e) {
	let t = "", n = !1;
	for (let r of e) {
		if (Gf[r] != null) {
			t += Gf[r];
			continue;
		}
		if (r >= "0" && r <= "9") {
			t += r;
			continue;
		}
		(r === "." || r === "٫") && !n && (n = !0, t += ".");
	}
	return t;
}
function qf(e, t) {
	if (!e) return "";
	let n = e.startsWith("-"), r = n ? e.slice(1) : e, i = r.endsWith("."), [a, o] = r.split("."), s = Number(a || "0");
	if (!Number.isFinite(s) && a !== "") return e;
	let c = Uf(t) ? "fa-IR" : "en-US", l = new Intl.NumberFormat(c, { maximumFractionDigits: 0 }).format(a === "" ? 0 : s);
	if (o != null || i) {
		let e = Uf(t) ? "٫" : ".", n = o ?? "";
		l += e + (Uf(t) ? n.replace(/\d/g, (e) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(e, 10)] ?? e) : n);
	}
	return n ? `-${l}` : l;
}
function Jf({ value: e, onChange: t, className: n, onBlur: r, ...i }) {
	let { i18n: a } = g(), o = a.language, s = f(() => qf(e, o), [e, o]);
	return /* @__PURE__ */ x(X, {
		...i,
		inputMode: "decimal",
		className: W(n),
		value: s,
		onChange: (e) => t(Kf(e.target.value)),
		onBlur: r
	});
}
//#endregion
//#region src/hooks/use-text-direction.ts
function Yf() {
	let { i18n: e } = g();
	return e.dir() === "rtl" ? "rtl" : "ltr";
}
//#endregion
//#region src/components/ui/select.tsx
function Xf({ ...e }) {
	return /* @__PURE__ */ x(cl, {
		"data-slot": "select",
		...e
	});
}
function Zf({ ...e }) {
	return /* @__PURE__ */ x(ul, {
		"data-slot": "select-value",
		...e
	});
}
function Qf({ className: e, size: t = "default", children: n, ...r }) {
	return /* @__PURE__ */ S(ll, {
		"data-slot": "select-trigger",
		"data-size": t,
		dir: Yf(),
		className: W("flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap text-start shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", e),
		...r,
		children: [n, /* @__PURE__ */ x(dl, {
			asChild: !0,
			children: /* @__PURE__ */ x(Hd, { className: "size-4 opacity-50" })
		})]
	});
}
function $f({ className: e, children: t, position: n = "popper", align: r = "start", ...i }) {
	return /* @__PURE__ */ x(kn, {
		allowBodyScroll: !0,
		children: /* @__PURE__ */ x(fl, { children: /* @__PURE__ */ S(pl, {
			"data-slot": "select-content",
			dir: Yf(),
			className: W("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-start text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", e),
			position: n,
			align: r,
			...i,
			children: [
				/* @__PURE__ */ x(ep, {}),
				/* @__PURE__ */ x(ml, {
					className: W("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
					children: t
				}),
				/* @__PURE__ */ x(tp, {})
			]
		}) })
	});
}
function $({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ S(hl, {
		"data-slot": "select-item",
		className: W("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pe-8 ps-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", e),
		...n,
		children: [/* @__PURE__ */ x("span", {
			"data-slot": "select-item-indicator",
			className: "absolute end-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ x(_l, { children: /* @__PURE__ */ x(Vd, { className: "size-4" }) })
		}), /* @__PURE__ */ x(gl, { children: t })]
	});
}
function ep({ className: e, ...t }) {
	return /* @__PURE__ */ x(vl, {
		"data-slot": "select-scroll-up-button",
		className: W("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ x(Ud, { className: "size-4" })
	});
}
function tp({ className: e, ...t }) {
	return /* @__PURE__ */ x(yl, {
		"data-slot": "select-scroll-down-button",
		className: W("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ x(Hd, { className: "size-4" })
	});
}
//#endregion
//#region ../Modules/coffee-profile-module/client/components/CoffeeWeightPricingPanel.tsx
function np({ productId: e }) {
	let { t } = g(), [n, r] = m(""), [i, a] = m([]), [o, s] = m([]), [c, l] = m(!1), [d, f] = m(!1), [p, h] = m(!1);
	async function v(n) {
		if (e) {
			l(!0), h(!1);
			try {
				let t = await Q(`shop/products/${e}/coffee-profile/price-by-attribute${n ? `?attribute=${encodeURIComponent(n)}` : ""}`);
				a(t.attributes ?? []), r(t.attribute ?? ""), s((t.rows ?? []).map((e) => ({
					...e,
					purchase_price: e.purchase_price == null ? "" : String(e.purchase_price),
					stock_quantity: e.stock_quantity == null ? "" : String(e.stock_quantity)
				})));
			} catch (e) {
				h(!0), uf(t, e);
			} finally {
				l(!1);
			}
		}
	}
	u(() => {
		v();
	}, [e]);
	function y(e, t, n) {
		s((r) => r.map((r) => r.term === e ? {
			...r,
			[t]: n
		} : r));
	}
	async function b() {
		if (!e || !n) return;
		f(!0);
		let r = 0, i = 0;
		try {
			for (;;) {
				let t = await Q(`shop/products/${e}/coffee-profile/price-by-attribute`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						attribute: n,
						offset: r,
						rows: o.map((e) => ({
							term: e.term,
							purchase_price: e.purchase_price,
							stock_quantity: e.stock_quantity
						}))
					})
				});
				if (i += t.updated ?? 0, !t.remaining) break;
				r = t.next_offset ?? r;
			}
			_.success(t("coffeeProfile.priceByAttrDone", { count: i })), v(n);
		} catch (e) {
			uf(t, e);
		} finally {
			f(!1);
		}
	}
	return e ? /* @__PURE__ */ S(K, { children: [/* @__PURE__ */ S(q, {
		className: "flex flex-row items-center justify-between gap-3",
		children: [/* @__PURE__ */ x(J, { children: t("coffeeProfile.priceByAttrTitle") }), /* @__PURE__ */ x(G, {
			type: "button",
			size: "sm",
			disabled: d || c || o.length === 0,
			onClick: () => void b(),
			children: t("coffeeProfile.priceByAttrApply")
		})]
	}), /* @__PURE__ */ S(Y, {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ x("p", {
				className: "text-muted-foreground text-xs",
				children: t("coffeeProfile.priceByAttrHint")
			}),
			p ? /* @__PURE__ */ x(G, {
				type: "button",
				variant: "outline",
				size: "sm",
				onClick: () => void v(n),
				children: t("license.retry")
			}) : null,
			i.length > 0 ? /* @__PURE__ */ S("div", {
				className: "max-w-xs space-y-1",
				children: [/* @__PURE__ */ x(Z, { children: t("coffeeProfile.priceByAttrAttribute") }), /* @__PURE__ */ S(Xf, {
					value: n,
					onValueChange: (e) => {
						r(e), v(e);
					},
					children: [/* @__PURE__ */ x(Qf, { children: /* @__PURE__ */ x(Zf, {}) }), /* @__PURE__ */ x($f, { children: i.map((e) => /* @__PURE__ */ x($, {
						value: e.name,
						children: e.label
					}, e.name)) })]
				})]
			}) : null,
			c ? /* @__PURE__ */ x("p", {
				className: "text-muted-foreground text-sm",
				children: t("common.loading")
			}) : /* @__PURE__ */ x("div", {
				className: "space-y-3",
				children: o.map((e) => /* @__PURE__ */ S("div", {
					className: "grid gap-3 rounded-lg border p-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ S("div", { children: [/* @__PURE__ */ x("p", {
							className: "text-sm font-medium",
							children: e.label
						}), /* @__PURE__ */ x("p", {
							className: "text-muted-foreground text-xs",
							children: t("coffeeProfile.priceByAttrCount", { count: e.variation_count })
						})] }),
						/* @__PURE__ */ S("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ x(Z, {
								className: "text-xs",
								children: t("products.fieldPurchase")
							}), /* @__PURE__ */ x(Jf, {
								value: e.purchase_price,
								onChange: (t) => y(e.term, "purchase_price", t)
							})]
						}),
						/* @__PURE__ */ S("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ x(Z, {
								className: "text-xs",
								children: t("products.fieldStock")
							}), /* @__PURE__ */ x(Jf, {
								value: e.stock_quantity,
								onChange: (t) => y(e.term, "stock_quantity", t)
							})]
						})
					]
				}, e.term))
			})
		]
	})] }) : /* @__PURE__ */ S(K, { children: [/* @__PURE__ */ x(q, { children: /* @__PURE__ */ x(J, { children: t("coffeeProfile.priceByAttrTitle") }) }), /* @__PURE__ */ x(Y, { children: /* @__PURE__ */ x("p", {
		className: "text-muted-foreground text-sm",
		children: t("coffeeProfile.saveProductFirst")
	}) })] });
}
//#endregion
//#region src/components/PageShell.tsx
function rp({ title: e, description: t, eyebrow: n, children: r }) {
	return /* @__PURE__ */ S("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ S("header", {
			className: "min-w-0 space-y-1.5",
			children: [
				n ? /* @__PURE__ */ x("p", {
					className: "text-muted-foreground text-xs font-medium tracking-wide uppercase",
					children: n
				}) : null,
				/* @__PURE__ */ x("h1", {
					className: "text-xl font-semibold tracking-tight sm:text-2xl",
					children: e
				}),
				t ? /* @__PURE__ */ x("p", {
					className: "text-muted-foreground max-w-2xl text-sm leading-relaxed",
					children: t
				}) : null
			]
		}), r]
	});
}
//#endregion
//#region src/i18n/locales/fa.json
var ip = /* @__PURE__ */ k({ default: () => ap }), ap, op = O((() => {
	ap = {
		"app.title": "داشبورد",
		"chart.totalVisitors": "کل بازدیدها",
		"chart.descriptionLong": "جمع سه ماه اخیر",
		"chart.descriptionShort": "سه ماه اخیر",
		"chart.range3m": "۳ ماه اخیر",
		"chart.range30d": "۳۰ روز اخیر",
		"chart.range7d": "۷ روز اخیر",
		"chart.visitors": "بازدید",
		"chart.desktop": "دسکتاپ",
		"chart.mobile": "موبایل",
		"commandPalette.title": "پالت فرمان",
		"commandPalette.description": "جستجوی فرمان برای اجرا…",
		"calendar.weekday.0": "ش",
		"calendar.weekday.1": "ی",
		"calendar.weekday.2": "د",
		"calendar.weekday.3": "س",
		"calendar.weekday.4": "چ",
		"calendar.weekday.5": "پ",
		"calendar.weekday.6": "ج",
		"seo.pageDescription": "{{page}} — {{site}}",
		"seo.loginDescription": "ورود به داشبورد فروشگاه ({{site}}).",
		"nav.overview": "داشبورد",
		"nav.logout": "خروج",
		"nav.fullscreen": "تمام‌صفحه",
		"login.title": "ورود",
		"login.registerTitle": "ثبت‌نام",
		"login.subtitle": "ایمیل، نام کاربری یا شماره موبایل متصل به حساب",
		"login.otpSubtitle": "کد یکبارمصرف روی کانال‌های فعال شما ارسال می‌شود",
		"login.identifier": "ایمیل، نام کاربری یا موبایل",
		"login.otpIdentifier": "ایمیل یا شماره موبایل",
		"login.password": "رمز عبور",
		"login.submit": "ادامه",
		"login.remember": "مرا روی این دستگاه به خاطر بسپار",
		"login.backHome": "بازگشت به سایت",
		"login.heroHint": "با همان حساب مدیریتی سایت وارد شوید.",
		"login.error": "ورود ناموفق بود",
		"login.pending": "در حال ورود…",
		"login.modePassword": "رمز عبور",
		"login.modeOtp": "کد یکبارمصرف",
		"login.otpLogin": "ورود",
		"login.otpRegister": "ثبت‌نام",
		"login.otpCode": "کد تأیید",
		"login.otpSend": "ارسال کد",
		"login.otpResend": "ارسال مجدد کد",
		"login.otpSent": "کد تأیید ارسال شد",
		"login.otpSentVia": "ارسال از طریق {{channels}}",
		"login.registerWithOtp": "ثبت‌نام با کد یکبارمصرف",
		"login.channel.sms": "پیامک",
		"login.channel.email": "ایمیل",
		"login.channel.bale": "بله",
		"login.channel.telegram": "تلگرام",
		"login.channelJoin": " و ",
		"nav.moreActions": "بیشتر",
		"nav.visitSite": "مشاهدهٔ سایت",
		"nav.platform": "پلتفرم",
		"nav.section.content": "مدیریت محتوا",
		"nav.section.shop": "مدیریت فروشگاه",
		"nav.section.tools": "ابزار",
		"nav.section.reports": "گزارشات",
		"nav.section.admin": "مدیریت",
		"nav.siteSubtitle": "سایت",
		"nav.projectsSection": "پروژه‌ها",
		"nav.singleNavHint": "فقط «داشبورد» دیده می‌شود چون نقش شما هنوز مجوز بخش‌های دیگر داشبورد را ندارد. از مدیر سایت بخواهید نقش مناسب (مثلاً مدیر فروشگاه یا ویرایشگر) بدهد.",
		"nav.module.home": "داشبورد",
		"nav.module.magazine": "مجله",
		"nav.module.posts": "همهٔ نوشته‌ها",
		"nav.module.post-new": "افزودن نوشته",
		"nav.module.categories": "دسته‌ها",
		"nav.module.media": "کتابخانهٔ رسانه",
		"nav.module.media-library": "رسانه‌ها",
		"nav.module.media-folders": "پوشه‌ها",
		"nav.module.media-categories": "دسته‌ها",
		"nav.module.pages": "برگه‌های سایت",
		"nav.module.shop": "فروشگاه",
		"nav.module.products": "محصولات",
		"nav.module.product-new": "افزودن محصول",
		"nav.module.brands": "برندها",
		"nav.module.product-cats": "دسته محصول",
		"nav.module.attributes": "ویژگی‌های محصول",
		"nav.module.wfcp-bulk": "لیست قیمت (گروهی)",
		"nav.module.wfcp-quick": "افزودن سریع محصول",
		"nav.module.wfcp-price": "تغییر قیمت گروهی",
		"nav.module.bots": "ربات‌ها",
		"nav.module.bale-bot": "ربات بله (WooBale)",
		"nav.module.telegram-bot": "ربات تلگرام",
		"nav.module.bot-broadcast": "پیام همگانی ربات",
		"nav.module.bot-campaigns": "کمپین ربات",
		"nav.module.sms-panel": "پنل پیامکی",
		"nav.module.sms-home": "خانه پیامک",
		"nav.module.sms-send": "ارسال پیامک",
		"nav.module.sms-reports": "گزارش‌ها",
		"nav.module.sms-targeted": "ارسال هدفمند",
		"nav.module.sms-inbox": "صندوق ورودی",
		"nav.module.sms-drafts": "پیش‌نویس‌ها",
		"nav.module.sms-phonebook": "دفترچه تلفن",
		"nav.module.sms-scheduled": "زمان‌بندی",
		"nav.module.sms-patterns": "پترن‌ها",
		"nav.module.sms-secretaries": "منشی پیامک",
		"nav.module.sms-wallet": "کیف پول",
		"nav.module.sms-lines": "خطوط",
		"nav.module.sms-newsletter": "خبرنامه",
		"nav.module.sms-topup": "شارژ کیف پول",
		"nav.module.orders": "سفارشات",
		"nav.module.order-list": "سفارشات",
		"nav.module.partner-orders": "سفارش‌های من",
		"nav.module.partner-account": "حساب من",
		"nav.module.account-portal": "حساب من",
		"nav.module.account-home": "پیشخوان",
		"nav.module.account-orders": "سفارش‌های من",
		"nav.module.account-addresses": "آدرس‌ها",
		"nav.module.account-notifications": "اطلاعیه‌ها",
		"nav.module.account-favorites": "موردعلاقه‌ها",
		"nav.module.account-reviews": "دیدگاه‌ها و پرسش‌ها",
		"nav.module.account-profile": "اطلاعات حساب",
		"nav.module.account-wallet": "کیف پول",
		"nav.module.account-tickets": "پشتیبانی",
		"nav.module.shop-tickets": "تیکت‌های پشتیبانی",
		"nav.module.order-reports": "گزارش‌ها",
		"nav.module.marketing": "بازاریابی",
		"nav.module.coupons": "کدهای تخفیف",
		"nav.module.users": "کاربران",
		"nav.module.user-list": "کاربران",
		"nav.module.user-new": "افزودن کاربر",
		"nav.module.comments": "دیدگاه‌ها",
		"nav.module.analytics": "آمار",
		"nav.module.analytics-overview": "مرور کلی",
		"nav.module.analytics-visitors": "تحلیل بازدیدکنندگان",
		"nav.module.analytics-pages": "تحلیل صفحه‌ها",
		"nav.module.analytics-referrals": "ارجاع‌ها",
		"nav.module.analytics-geo": "جغرافیایی",
		"nav.module.analytics-devices": "دستگاه‌ها",
		"nav.module.analytics-bots": "آمار ربات‌ها",
		"nav.module.marketplace": "بازارچه",
		"nav.module.marketplace-catalog": "فهرست ماژول‌ها",
		"nav.module.my-modules": "ماژول‌های من",
		"datePicker.placeholder": "تاریخ",
		"nav.module.settings": "تنظیمات",
		"nav.module.settings-app": "تنظیمات",
		"nav.module.settings-site": "مدیریت سایت",
		"nav.module.settings-shop": "مدیریت فروشگاه",
		"nav.module.wfcp-dashboard": "داشبورد WFCP",
		"nav.module.wfcp-currency": "واحد پول",
		"nav.module.wfcp-exchange": "نرخ ارز",
		"nav.module.wfcp-retail": "قیمت تکی",
		"nav.module.wfcp-credit": "اعتباری",
		"nav.module.wfcp-installment": "اقساط",
		"nav.module.wfcp-wholesale": "عمده",
		"nav.module.wfcp-notifications": "متن‌ها و توضیحات",
		"nav.module.wfcp-style": "استایل",
		"nav.module.wfcp-advanced": "پیشرفته",
		"nav.module.pos": "صندوق",
		"nav.module.pos-register": "صندوق",
		"nav.module.pos-my-orders": "سفارش‌های صندوق من",
		"nav.module.accounting-module": "حسابداری",
		"nav.module.accounting-overview": "نمای کلی",
		"nav.module.accounting-chart": "کدینگ حساب‌ها",
		"nav.module.accounting-journals": "اسناد حسابداری",
		"nav.module.accounting-persons": "اشخاص",
		"nav.module.accounting-products": "کالاها",
		"nav.module.accounting-invoices": "فاکتور فروش",
		"nav.module.accounting-purchases": "خرید",
		"nav.module.accounting-expenses": "هزینه‌ها",
		"nav.module.accounting-treasury": "خزانه",
		"nav.module.accounting-checks": "چک‌ها",
		"nav.module.accounting-installments": "اقساط",
		"nav.module.accounting-warehouses": "انبار",
		"nav.module.accounting-production": "تولید",
		"nav.module.accounting-moadian": "صف مودیان",
		"nav.module.accounting-hesabfa": "سینک حسابفا",
		"nav.module.accounting-payroll": "حقوق",
		"nav.module.accounting-my-payroll": "فیش حقوق من",
		"nav.module.accounting-projects": "پروژه‌ها",
		"nav.module.accounting-reports": "گزارش‌ها",
		"nav.module.accounting-tools": "ابزارها",
		"nav.module.wallet-withdrawals": "برداشت‌های کیف پول",
		"nav.module.c2c-receipts": "رسیدهای کارت‌به‌کارت",
		"nav.userFallback": "کاربر",
		"home.welcome": "خوش آمدید",
		"home.wooOn": "ماژول فروشگاه فعال است",
		"home.wooOff": "ماژول فروشگاه غیرفعال است",
		"home.wfcpOn": "ماژول قیمت‌گذاری پیشرفته فعال است",
		"home.wfcpOff": "ماژول قیمت‌گذاری پیشرفته غیرفعال است",
		"home.noPosts": "نوشتهٔ اخیری نیست.",
		"home.noOrders": "سفارش اخیری نیست.",
		"home.partner.title": "سفارش‌های من",
		"home.partner.orderCount": "تعداد سفارش",
		"home.partner.lastOrder": "آخرین سفارش",
		"home.flags": "یکپارچگی‌ها",
		"home.recentPosts": "نوشته‌های اخیر",
		"home.recentOrders": "سفارش‌های اخیر",
		"home.recentProducts": "محصولات اخیر",
		"home.ctaNewPost": "نوشتن نوشته",
		"home.ctaViewOrders": "باز کردن سفارش‌ها",
		"home.viewAll": "مشاهده همه",
		"home.noProducts": "محصول اخیری نیست.",
		"home.sections.products": "محصولات",
		"home.sections.sales": "فروش",
		"home.sections.traffic": "ترافیک",
		"home.sections.sms": "پیامک",
		"home.sections.alerts": "هشدارها",
		"home.sections.lists": "فهرست‌ها",
		"home.sections.kpis": "نمای کلی این ماه",
		"home.sections.charts": "نمودارها و بینش‌ها",
		"home.sections.breakdown": "تفکیک سفارش‌ها",
		"home.products.total": "کل محصولات",
		"home.products.byStatusTitle": "بر اساس وضعیت",
		"home.products.byStockTitle": "بر اساس موجودی",
		"home.products.byStatus.publish": "منتشرشده",
		"home.products.byStatus.draft": "پیش‌نویس",
		"home.products.byStatus.pending": "در انتظار",
		"home.products.byStatus.private": "خصوصی",
		"home.products.byStatus.trash": "سطل زباله",
		"home.products.byStock.instock": "موجود",
		"home.products.byStock.outofstock": "ناموجود",
		"home.products.byStock.onbackorder": "پیش‌سفارش",
		"home.sales.last30": "فروش ۳۰ روز اخیر",
		"home.sms.charge": "موجودی پیامک",
		"home.sms.topup": "شارژ",
		"home.sms.lowBalance": "موجودی پیامک کم است.",
		"home.sms.checking": "در حال بررسی موجودی پیامک…",
		"home.sms.fetchFailed": "بروزرسانی موجودی پیامک ناموفق بود.",
		"home.sms.retry": "تلاش مجدد",
		"home.traffic.onlineNow": "آنلاین",
		"home.traffic.highlightVisitors": "بازدیدکنندگان ۷ روز (بدون امروز)",
		"home.traffic.periodsTitle": "آمار دوره‌ای",
		"home.traffic.period": "دوره",
		"home.traffic.periodToday": "امروز",
		"home.traffic.periodYesterday": "دیروز",
		"home.traffic.last7ExclToday": "۷ روز گذشته (بدون امروز)",
		"home.traffic.last14ExclToday": "۱۴ روز گذشته (بدون امروز)",
		"home.traffic.allTime": "کل",
		"home.traffic.changeVsPrev": "تغییر نسبت به دوره قبل",
		"home.traffic.chartTitle": "ترافیک ۳۰ روز اخیر",
		"home.tables.topByViews": "پربازدیدترین محصولات",
		"home.alerts.source.license": "لایسنس",
		"home.alerts.source.sms-panel": "پنل پیامک",
		"home.alerts.source.bale-bot": "ربات بله",
		"home.alerts.source.telegram-bot": "ربات تلگرام",
		"home.disabled.woocommerce": "ماژول فروشگاه غیرفعال است یا دسترسی ندارید.",
		"home.disabled.analytics": "ماژول آمار غیرفعال است.",
		"home.disabled.sms": "پنل پیامک غیرفعال است.",
		"home.disabled.openSettings": "باز کردن تنظیمات",
		"home.sales.thisMonth": "فروش ماه جاری",
		"home.sales.viewDetails": "گزارش کامل فروش",
		"home.traffic.viewDetails": "مشاهده آمار کامل",
		"home.tasks.processing": "در حال آماده‌سازی",
		"home.tasks.onHold": "در انتظار",
		"home.tasks.commentsPending": "نظر در انتظار تأیید",
		"home.tasks.outOfStock": "محصول ناموجود",
		"home.panels.crmWallet": "کیف پول سامانه",
		"home.panels.smsUnitPrice": "هزینه هر پیامک",
		"home.panels.smsUnavailable": "اتصال به کیف پول برقرار نیست",
		"home.panels.smsCharge": "شارژ پنل پیامکی",
		"home.traffic.vsPrevPeriod": "دوره قبلی",
		"home.traffic.last7Recent": "۷ روز اخیر",
		"home.traffic.last14Recent": "۱۴ روز اخیر",
		"home.traffic.onlineVisitors": "بازدیدکنندگان آنلاین",
		"home.traffic.recentDays": "روزهای اخیر",
		"home.panels.license": "لایسنس",
		"home.panels.active": "فعال",
		"home.panels.inactive": "غیرفعال",
		"home.panels.webhookOk": "وب‌هوک فعال",
		"home.panels.webhookOff": "وب‌هوک تنظیم نشده",
		"home.panels.bot.bale": "ربات بله",
		"home.panels.bot.telegram": "ربات تلگرام",
		"home.tables.colOrder": "سفارش",
		"home.tables.colCustomer": "مشتری",
		"home.tables.colStatus": "وضعیت",
		"home.tables.colTotal": "مبلغ",
		"home.tables.colDate": "تاریخ",
		"home.comments.queueTitle": "نظرات در انتظار تأیید",
		"home.orders.emptyMonth": "سفارشی در این ماه ثبت نشده است.",
		"settings.theme": "تم",
		"settings.language": "زبان",
		"settings.pageTitle": "تنظیمات",
		"settings.sectionNav": "بخش‌های تنظیمات",
		"settings.hub.title": "تنظیمات",
		"settings.hub.description": "پیکربندی سایت و فروشگاه.",
		"settings.hub.siteTitle": "مدیریت سایت",
		"settings.hub.siteDescription": "تنظیمات عمومی سایت، حریم خصوصی، لایسنس و ترجیحات داشبورد.",
		"settings.hub.shopTitle": "مدیریت فروشگاه",
		"settings.hub.shopDescription": "تنظیمات فروشگاه آنلاین، فاکتور، پیامک و قیمت‌گذاری.",
		"settings.hub.openSite": "باز کردن تنظیمات سایت",
		"settings.hub.openShop": "باز کردن تنظیمات فروشگاه",
		"settings.modules.stripTitle": "واحدهای تنظیمات",
		"settings.modules.tabsLabel": "بخش‌ها",
		"settings.modules.sectionCount": "{{count}} بخش",
		"settings.modules.activeHint": "تنظیمات این واحد را از تب‌های زیر پیکربندی کنید.",
		"settings.modules.pickHint": "یک کارت را از بالا انتخاب کنید تا تنظیمات آن باز شود.",
		"settings.modules.scrollPrev": "اسکرول کارت‌ها به چپ",
		"settings.modules.scrollNext": "اسکرول کارت‌ها به راست",
		"settings.modules.wfcp.dashboard": "داشبورد",
		"settings.modules.wfcp.platform": "پلتفرم",
		"settings.shop.formTitle": "تنظیمات فروشگاه",
		"settings.shop.formHint": "گزینه‌ها در گروه‌های مرتب نمایش داده می‌شوند.",
		"settings.site.title": "مدیریت سایت",
		"settings.site.description": "پیکربندی عمومی سایت و گزینه‌های داشبورد.",
		"settings.site.sections.general": "عمومی",
		"settings.site.sections.privacy": "حساب کاربری و حریم خصوصی",
		"settings.site.sections.license": "لایسنس",
		"settings.site.sections.dashboard": "داشبورد",
		"coreUpdate.title": "به‌روزرسانی هسته داشبورد",
		"coreUpdate.description": "آخرین نسخه داشبورد را از کانال به‌روزرسانی مجاز نصب کنید. ماژول‌های نصب‌شده حذف نمی‌شوند.",
		"coreUpdate.current": "نصب‌شده",
		"coreUpdate.latest": "آخرین",
		"coreUpdate.available": "به‌روزرسانی موجود",
		"coreUpdate.upToDate": "به‌روز است",
		"coreUpdate.checkAgain": "بررسی مجدد",
		"coreUpdate.install": "نصب به‌روزرسانی",
		"coreUpdate.confirm": "هسته داشبورد اکنون به‌روزرسانی شود؟ یک پشتیبان ساخته می‌شود و پس از اتمام صفحه بارگذاری مجدد می‌شود.",
		"coreUpdate.success": "داشبورد به نسخه {{version}} به‌روز شد. در حال بارگذاری مجدد…",
		"coreUpdate.refreshed": "وضعیت به‌روزرسانی به‌روز شد.",
		"coreUpdate.licenseRequired": "برای بررسی یا نصب به‌روزرسانی هسته، لایسنس فعال لازم است.",
		"coreUpdate.crmUnavailable": "ارتباط با سرویس لایسنس برای اطلاعات به‌روزرسانی برقرار نشد.",
		"coreUpdate.packageMissing": "بسته ریلیز آخر هنوز در دسترس نیست. ابتدا انتشار هسته را در سرویس لایسنس انجام دهید.",
		"buildPipeline.title": "خط لوله ساخت ریلیز",
		"buildPipeline.description": "نصب وابستگی‌های کلاینت، کامپایل داشبورد، اعتبارسنجی دارایی‌ها، کامپایل ترجمه‌ها و ایجاد ZIP ریلیز روی همین سرور (فقط محیط توسعه).",
		"buildPipeline.run": "اجرای خط لولهٔ ریلیز",
		"buildPipeline.cancel": "لغو",
		"buildPipeline.refresh": "به‌روزرسانی وضعیت",
		"buildPipeline.confirm": "خط لولهٔ کامل ریلیز روی این سرور اجرا شود؟ ممکن است چند دقیقه طول بکشد.",
		"buildPipeline.started": "ساخت در پس‌زمینه شروع شد.",
		"buildPipeline.cancelled": "ساخت لغو شد.",
		"buildPipeline.success": "ساخت ریلیز با موفقیت انجام شد.",
		"buildPipeline.licenseRequired": "برای اجرای خط لولهٔ ساخت، لایسنس فعال لازم است.",
		"buildPipeline.statusIdle": "آماده",
		"buildPipeline.statusRunning": "در حال اجرا",
		"buildPipeline.statusSuccess": "موفق",
		"buildPipeline.statusFailed": "ناموفق",
		"buildPipeline.artifact": "فایل ZIP ریلیز",
		"buildPipeline.devOnly": "ساخت ریلیز روی production غیرفعال است. WP_DEBUG را فعال کنید، از host محلی استفاده کنید، یا WEBINO_DASHBOARD_ALLOW_BUILD_PIPELINE را در wp-config.php تنظیم کنید.",
		"digikala.title": "فروشندگان دیجیکالا",
		"digikala.subtitle": "مدیریت اتصال Open API دیجیکالا و یکپارچگی با فروشگاه.",
		"digikala.syncTitle": "همگام‌سازی دیجیکالا",
		"digikala.syncSubtitle": "ثبت job برای همگام‌سازی محصول، انبار و سفارش.",
		"digikala.jobsTitle": "کارهای دیجیکالا",
		"digikala.jobsSubtitle": "پایش jobهای پس‌زمینه و لاگ‌های یکپارچه‌سازی.",
		"digikala.logsTitle": "لاگ‌های دیجیکالا",
		"digikala.clientCode": "کلاینت کد",
		"digikala.clientSecret": "کلاینت سکرت",
		"digikala.authorizationCode": "کد مجوز",
		"digikala.webhookSecret": "رمز webhook",
		"digikala.webhookUrl": "آدرس webhook",
		"digikala.autoSync": "فعال‌سازی همگام‌سازی خودکار از رویدادهای فروشگاه",
		"digikala.testConnection": "تست اتصال",
		"digikala.testOk": "اتصال دیجیکالا تایید شد.",
		"digikala.jobQueued": "کار همگام‌سازی در صف قرار گرفت.",
		"digikala.syncImport": "ورود محصولات",
		"digikala.syncExport": "ارسال محصولات",
		"digikala.syncInventory": "همگام‌سازی انبار",
		"digikala.syncOrdersPull": "دریافت سفارش‌ها",
		"digikala.syncOrdersPush": "ارسال وضعیت سفارش",
		"digikala.syncPhase2Shipments": "همگام‌سازی ارسال/بسته",
		"digikala.syncPhase2Finance": "همگام‌سازی صورتحساب/مالی",
		"digikala.syncPhase2Promotions": "همگام‌سازی پروموشن‌ها",
		"digikala.syncPhase2Sbs": "همگام‌سازی SBS/دراپ‌شیپینگ",
		"digikala.healthTitle": "سلامت یکپارچه‌سازی",
		"digikala.alertsTitle": "هشدارها",
		"digikala.webhookMatrixTitle": "ماتریس webhook",
		"digikala.reconcileAll": "بازتطبیق کامل",
		"digikala.reconcileProducts": "بازتطبیق محصولات",
		"digikala.reconcileOrders": "بازتطبیق سفارش‌ها",
		"digikala.reconcileInventory": "بازتطبیق انبار",
		"digikala.reconcileQueued": "jobهای بازتطبیق در صف قرار گرفت.",
		"digikala.endpointCoverageTitle": "پوشش سطح endpoint",
		"digikala.endpointMethod": "متد",
		"digikala.endpointPath": "مسیر",
		"digikala.endpointStatus": "وضعیت",
		"digikala.endpointSource": "منبع",
		"digikala.endpointSources": "منابع",
		"digikala.endpointJobTypes": "نوع job",
		"digikala.endpointDispatchers": "پردازشگرها",
		"digikala.endpointConfidence": "اعتماد",
		"digikala.endpointFilterStatus": "فیلتر وضعیت: all|implemented|queued|pending",
		"digikala.endpointFilterStatusAll": "همه وضعیت‌ها",
		"digikala.endpointFilterStatusImplemented": "پیاده‌سازی شده",
		"digikala.endpointFilterStatusQueued": "در صف",
		"digikala.endpointFilterStatusPending": "در انتظار",
		"digikala.endpointFilterJobType": "فیلتر بر اساس job type",
		"digikala.endpointFilterDispatcher": "فیلتر بر اساس پردازشگر",
		"torobExtractor.title": "استخراج محصولات ترب",
		"torobExtractor.pageTitle": "استخراج‌کننده محصولات ترب",
		"torobExtractor.runtimeStatus": "وضعیت اجرا",
		"torobExtractor.wcReady": "ووکامرس",
		"torobExtractor.extractor": "استخراج‌کننده",
		"torobExtractor.statusReady": "آماده",
		"torobExtractor.statusMissing": "موجود نیست",
		"torobExtractor.statusLoaded": "بارگذاری شده",
		"torobExtractor.statusNotLoaded": "بارگذاری نشده",
		"torobExtractor.enable": "فعال‌سازی استخراج‌کننده",
		"torobExtractor.feedToken": "توکن فید",
		"torobExtractor.publicKey": "کلید عمومی",
		"torobExtractor.autoSync": "همگام‌سازی خودکار",
		"torobExtractor.syncInterval": "بازه همگام‌سازی (ساعت)",
		"torobpay.title": "ترب‌پی",
		"torobpay.pageTitle": "درگاه ترب‌پی",
		"torobpay.runtimeStatus": "وضعیت اجرا",
		"torobpay.wcReady": "ووکامرس",
		"torobpay.gateway": "درگاه",
		"torobpay.statusReady": "آماده",
		"torobpay.statusMissing": "موجود نیست",
		"torobpay.statusLoaded": "بارگذاری شده",
		"torobpay.statusNotLoaded": "بارگذاری نشده",
		"torobpay.enableGateway": "فعال‌سازی درگاه",
		"torobpay.fieldTitle": "عنوان",
		"torobpay.fieldDescription": "توضیحات",
		"torobpay.merchantCode": "کد پذیرنده",
		"torobpay.apiKey": "کلید API",
		"torobpay.sandbox": "حالت آزمایشی (Sandbox)",
		"snapppay.title": "اسنپ‌پی",
		"snapppay.pageTitle": "درگاه اسنپ‌پی",
		"snapppay.runtimeStatus": "وضعیت اجرا",
		"snapppay.wcReady": "ووکامرس",
		"snapppay.gateway": "درگاه",
		"snapppay.searchwise": "Searchwise",
		"snapppay.statusReady": "آماده",
		"snapppay.statusMissing": "موجود نیست",
		"snapppay.statusLoaded": "بارگذاری شده",
		"snapppay.statusNotLoaded": "بارگذاری نشده",
		"snapppay.enableGateway": "فعال‌سازی درگاه",
		"snapppay.fieldTitle": "عنوان",
		"snapppay.fieldDescription": "توضیحات",
		"snapppay.merchantId": "شناسه پذیرنده",
		"snapppay.clientId": "شناسه کلاینت",
		"snapppay.clientSecret": "سکرت کلاینت",
		"snapppay.sandbox": "حالت آزمایشی (Sandbox)",
		"basalam.title": "باسلام",
		"basalam.subtitle": "یکپارچه‌سازی کامل باسلام با فروشگاه آنلاین و داشبورد.",
		"basalam.settingsTitle": "تنظیمات اتصال",
		"basalam.statusTitle": "وضعیت عملیاتی",
		"basalam.coverageTitle": "پوشش endpointها",
		"basalam.reconcileNow": "اجرای بازتطبیق",
		"basalam.reconcileQueued": "jobهای بازتطبیق در صف قرار گرفت.",
		"basalam.paymentsTitle": "درگاه باسلام",
		"basalam.walletTitle": "کیف پول باسلام",
		"basalam.subscriptionsTitle": "اشتراک‌های باسلام",
		"basalam.webhooksTitle": "وب‌هوک‌های باسلام",
		"basalam.operationsTitle": "عملیات باسلام",
		"basalam.connection": "اتصال",
		"basalam.connectionHint": "غرفه‌ی باسلام را از طریق OAuth متصل کنید.",
		"basalam.oauthWafHint": "اول «اتصال به باسلام» را بزنید (ورود SSO). صفحهٔ انگلیسی 403 CDN یعنی توکن هنوز در دیتابیس ذخیره نشده — URL کامل را از نوار آدرس همان صفحهٔ خطا کپی و پایین بچسبانید. توکن داخل URL به‌تنهایی یعنی اتصال برقرار است نیست.",
		"basalam.oauthPasteTitle": "تکمیل اتصال با آدرس بازگشت",
		"basalam.oauthPasteHint": "کل آدرس نوار آدرس صفحهٔ 403 (شامل access_token) را اینجا بچسبانید و ذخیره کنید. ارسال با admin-ajax است و JWT در GET به CDN نمی‌رود.",
		"basalam.oauthPastePlaceholder": "https://yoursite.com/wp-admin/admin.php?page=basalam-save-token&access_token=…",
		"basalam.oauthPasteSave": "ذخیره توکن از آدرس",
		"basalam.connected": "متصل",
		"basalam.notConnected": "متصل نیست",
		"basalam.connectOAuth": "اتصال به باسلام",
		"basalam.oauthMissingUrl": "آدرس OAuth یافت نشد",
		"basalam.operations": "عملیات",
		"basalam.operationsHint": "همگام‌سازی کامل محصولات و سفارش‌ها با موتور باسلام.",
		"basalam.pullOrders": "دریافت سفارش‌ها",
		"basalam.ordersPullQueued": "جاب دریافت سفارش در صف قرار گرفت.",
		"basalam.webhook": "آدرس وب‌هوک سفارش",
		"basalam.nav.products": "محصولات",
		"basalam.nav.orders": "سفارش‌ها",
		"basalam.nav.categories": "دسته‌بندی",
		"basalam.nav.settings": "تنظیمات",
		"basalam.nav.finance": "مالی",
		"basalam.nav.tickets": "تیکت‌ها",
		"basalam.nav.logs": "لاگ‌ها",
		"basalam.productsTitle": "محصولات باسلام",
		"basalam.productsSubtitle": "ایجاد، بروزرسانی و اتصال خودکار محصولات ووکامرس به باسلام.",
		"basalam.productActions": "اقدامات گروهی",
		"basalam.createAll": "افزودن همه",
		"basalam.updateAll": "بروزرسانی همه",
		"basalam.quickUpdate": "بروزرسانی سریع",
		"basalam.autoConnect": "اتصال خودکار",
		"basalam.cancelJobs": "لغو جاب‌ها",
		"basalam.jobQueued": "جاب در صف قرار گرفت.",
		"basalam.recentJobs": "جاب‌های اخیر",
		"basalam.ordersTitle": "سفارش‌های باسلام",
		"basalam.ordersSubtitle": "دریافت مرسوله‌ها و اقدامات غرفه‌دار.",
		"basalam.vendorActions": "اقدامات غرفه‌دار",
		"basalam.wcOrderId": "شناسه سفارش ووکامرس",
		"basalam.trackingCode": "کد رهگیری",
		"basalam.confirmOrder": "تایید",
		"basalam.cancelOrder": "لغو",
		"basalam.shipOrder": "ارسال / رهگیری",
		"basalam.orderActionOk": "اقدام سفارش ارسال شد.",
		"basalam.categoriesTitle": "نگاشت دسته‌بندی",
		"basalam.categoriesSubtitle": "نگاشت دسته‌های ووکامرس به درخت باسلام.",
		"basalam.addMapping": "افزودن نگاشت",
		"basalam.saveMapping": "ذخیره نگاشت",
		"basalam.mappingSaved": "نگاشت ذخیره شد.",
		"basalam.mappingDeleted": "نگاشت حذف شد.",
		"basalam.mappings": "نگاشت‌ها",
		"basalam.delete": "حذف",
		"basalam.settingsSubtitle": "کلیدهای همگام‌سازی محصول/سفارش (تنظیمات باسلام).",
		"basalam.syncToggles": "کلیدهای همگام‌سازی",
		"basalam.syncProducts": "همگام‌سازی خودکار محصول",
		"basalam.syncOrders": "همگام‌سازی خودکار سفارش",
		"basalam.autoConfirm": "تایید خودکار سفارش",
		"basalam.developerMode": "حالت توسعه‌دهنده",
		"basalam.settingsSaved": "تنظیمات ذخیره شد.",
		"basalam.rawSettings": "همه تنظیمات",
		"basalam.financeTitle": "مالی",
		"basalam.financeSubtitle": "موجودی و تسویه (accounting.basalam.com).",
		"basalam.financeWpAdminHint": "رابط کامل مالی در منوی WP-Admin باسلام نیز در دسترس است.",
		"basalam.financeLoading": "در حال بارگذاری…",
		"basalam.financeError": "دریافت اطلاعات مالی ناموفق بود.",
		"basalam.boothBalance": "تراز غرفه",
		"basalam.balanceAsOf": "تراز غرفه تا {{time}}",
		"basalam.settledBankYtd": "تسویه بانکی سال جاری",
		"basalam.settledWalletYtd": "تسویه کیف پول سال جاری",
		"basalam.futureBalance": "تراز آتی",
		"basalam.toman": "تومان",
		"basalam.activeSettlements": "درخواست‌های تسویه فعال",
		"basalam.activeSettlementsHint": "تسویه‌های در جریان از accounting.basalam.com",
		"basalam.settlementHistory": "ترازهای تسویه شده",
		"basalam.settlementHistoryHint": "تاریخچه تسویه‌های انجام‌شده",
		"basalam.noActiveSettlements": "در حال حاضر درخواست تسویه فعالی وجود ندارد.",
		"basalam.noSettlementHistory": "هنوز تاریخچه تسویه‌ای ثبت نشده است.",
		"basalam.settlementCreated": "ثبت",
		"basalam.settlementPayable": "قابل پرداخت",
		"basalam.balance": "موجودی",
		"basalam.settlements": "تسویه‌ها",
		"basalam.ticketsTitle": "تیکت‌ها",
		"basalam.ticketsSubtitle": "تیکت‌های پشتیبانی همسلام.",
		"basalam.ticketsHint": "برای ایجاد/پاسخ کامل به تیکت از منوی WP-Admin باسلام استفاده کنید.",
		"basalam.logsTitle": "لاگ و پوشش",
		"basalam.logsSubtitle": "جاب‌ها، ماتریس پوشش و راهنمای لاگ.",
		"basalam.coverage": "پوشش API",
		"basalam.oauthConnected": "اتصال باسلام برقرار شد.",
		"basalam.webhookConfigured": "وب‌هوک ثبت شده است.",
		"basalam.webhookPending": "پس از OAuth وب‌هوک تنظیم می‌شود.",
		"basalam.productList": "لیست محصولات",
		"basalam.filter.all": "همه",
		"basalam.filter.connected": "متصل",
		"basalam.filter.unconnected": "نامتصل",
		"basalam.total": "مجموع",
		"basalam.col.name": "نام",
		"basalam.col.basalamId": "شناسه باسلام",
		"basalam.col.status": "وضعیت",
		"basalam.col.actions": "اقدامات",
		"basalam.col.type": "نوع",
		"basalam.col.error": "خطا",
		"basalam.col.invoice": "فاکتور",
		"basalam.col.customer": "مشتری",
		"basalam.col.total": "مبلغ",
		"basalam.createOne": "ایجاد",
		"basalam.updateOne": "بروزرسانی",
		"basalam.disconnect": "قطع اتصال",
		"basalam.connectedOrders": "سفارش‌های متصل",
		"basalam.noOrders": "هنوز سفارش متصلی نیست. دریافت سفارش را اجرا کنید.",
		"basalam.syncFields": "فیلدهای همگام‌سازی",
		"basalam.saveSettings": "ذخیره تنظیمات",
		"basalam.field.defaultWeight": "وزن پیش‌فرض",
		"basalam.field.defaultPackageWeight": "وزن بسته‌بندی",
		"basalam.field.defaultPreparation": "زمان آماده‌سازی",
		"basalam.field.tasksPerMinute": "وظیفه در دقیقه",
		"basalam.field.priceChange": "تغییر قیمت",
		"basalam.field.productPrefix": "پیشوند عنوان",
		"basalam.field.productSuffix": "پسوند عنوان",
		"basalam.field.safeStock": "موجودی ایمن",
		"basalam.gatewaySecret": "کلید امنیتی درگاه (X-Gateway-Secret)",
		"basalam.gatewaySandbox": "حالت آزمایشی درگاه",
		"basalam.saveGateway": "ذخیره درگاه",
		"zarinpal.title": "زرین‌پال",
		"zarinpal.paymentsTitle": "پرداخت زرین‌پال",
		"zarinpal.operationsTitle": "عملیات زرین‌پال",
		"zarinpal.coverageTitle": "پوشش زرین‌پال",
		"zarinpal.settingsSubtitle": "اتصال پذیرنده و حالت آزمایشی",
		"zarinpal.paymentsSubtitle": "عنوان تسویه‌حساب، پیام‌ها و پرداخت‌کننده کارمزد",
		"zarinpal.operationsSubtitle": "همگام‌سازی پرداخت‌های تأییدنشده و جستجوی تراکنش",
		"zarinpal.merchantId": "شناسه پذیرنده",
		"zarinpal.accessToken": "توکن دسترسی (GraphQL)",
		"zarinpal.callbackUrl": "آدرس بازگشت",
		"zarinpal.apiBase": "پایه API",
		"zarinpal.startPay": "StartPay",
		"zarinpal.sandbox": "حالت آزمایشی (Sandbox)",
		"zarinpal.reconcile": "همگام‌سازی الان",
		"zarinpal.reconcileHelp": "لیست unVerified زرین‌پال را می‌گیرد و سفارش‌های در انتظار منطبق را verify می‌کند.",
		"zarinpal.reconcileDone": "همگام‌سازی تمام شد: {{completed}} تکمیل از {{matched}} منطبق",
		"zarinpal.gatewayEnabled": "فعال‌سازی درگاه",
		"zarinpal.testConnection": "تست اتصال",
		"zarinpal.testSuccess": "اتصال موفق",
		"zarinpal.coverage": "پوشش API",
		"zarinpal.coverageMoved": "خلاصه پوشش در صفحه اتصال هم نمایش داده می‌شود.",
		"zarinpal.fieldTitle": "عنوان در تسویه‌حساب",
		"zarinpal.fieldDescription": "توضیحات",
		"zarinpal.fieldInstructions": "دستورالعمل‌ها",
		"zarinpal.successMessage": "پیام موفقیت",
		"zarinpal.failedMessage": "پیام ناموفق",
		"zarinpal.successHint": "جایگزین: {transaction_id}",
		"zarinpal.failedHint": "جایگزین: {fault}",
		"zarinpal.feePayer": "پرداخت‌کننده کارمزد",
		"zarinpal.feePayerMerchant": "فروشنده",
		"zarinpal.feePayerCustomer": "خریدار",
		"zarinpal.lastChecked": "آخرین بررسی",
		"zarinpal.authorities": "Authorityها",
		"zarinpal.matched": "سفارش‌های منطبق",
		"zarinpal.completed": "تکمیل‌شده",
		"zarinpal.skipped": "ردشده",
		"zarinpal.queue": "صف کارها",
		"zarinpal.lookupTitle": "جستجوی تراکنش",
		"zarinpal.authority": "Authority",
		"zarinpal.orderId": "شناسه سفارش",
		"zarinpal.lookup": "جستجو",
		"zarinpal.lookupSuccess": "جستجو انجام شد",
		"accounting.title": "حسابداری",
		"accounting.settingsSubtitle": "شرکت، مودیان، حسابفا، حقوق/تامین و همگام‌سازی ووکامرس",
		"accounting.settings.moadian": "مودیان",
		"accounting.settings.company": "شرکت",
		"accounting.settings.sync": "همگام‌سازی",
		"accounting.settings.tax": "نگاشت مالیاتی",
		"accounting.settings.hesabfa": "حسابفا",
		"accounting.settings.payroll": "حقوق / تامین اجتماعی",
		"accounting.payroll.settingsHelp": "مبالغ قانونی سالانه، نرخ بیمه ۷/۲۰/۳، سقف مشمول و کارگاه پیش‌فرض برای حقوق ایرانی.",
		"accounting.payroll.employeeInsPct": "درصد بیمه سهم کارگر",
		"accounting.payroll.employerInsPct": "درصد بیمه سهم کارفرما",
		"accounting.payroll.unemploymentPct": "درصد بیمه بیکاری",
		"accounting.payroll.minDailyWage": "حداقل مزد روزانه",
		"accounting.payroll.ceilingMultiplier": "ضریب سقف بیمه",
		"accounting.payroll.taxExemption": "معافیت مالیات ماهانه",
		"accounting.payroll.legalFood": "بن خواربار قانونی",
		"accounting.payroll.legalHousing": "حق مسکن قانونی",
		"accounting.payroll.legalMarriage": "حق تأهل قانونی",
		"accounting.payroll.legalSeniority": "پایه سنوات قانونی",
		"accounting.payroll.overtimeRate": "ضریب اضافه‌کاری",
		"accounting.payroll.defaultWorkshopId": "شناسه کارگاه پیش‌فرض",
		"accounting.payroll.taminGuide": "فایل ZIP لیست‌دیسک (DSKKAR00.DBF و DSKWOR00.DBF) از بخش حقوق دانلود و در eservices.tamin.ir بارگذاری می‌شود. ورود به پورتال از داخل پلاگین انجام نمی‌شود.",
		"accounting.payroll.workshops": "کارگاه‌ها",
		"accounting.payroll.workshopCode": "کد کارگاه",
		"accounting.payroll.workshopName": "نام کارگاه",
		"accounting.payroll.branchCode": "کد شعبه",
		"accounting.payroll.rowCode": "ردیف پیمان",
		"accounting.payroll.employees": "کارمندان",
		"accounting.payroll.firstName": "نام",
		"accounting.payroll.lastName": "نام خانوادگی",
		"accounting.payroll.nationalId": "کد ملی",
		"accounting.payroll.insuranceNo": "شماره بیمه",
		"accounting.payroll.dailyWage": "مزد روزانه",
		"accounting.payroll.jobCode": "کد شغل",
		"accounting.payroll.workshopId": "شناسه کارگاه",
		"accounting.payroll.attendance": "کارکرد ماه",
		"accounting.payroll.employeeId": "شناسه کارمند",
		"accounting.payroll.jalaliYear": "سال شمسی",
		"accounting.payroll.jalaliMonth": "ماه",
		"accounting.payroll.absentDays": "روز غیبت",
		"accounting.payroll.leaveDays": "روز مرخصی",
		"accounting.payroll.overtimeHours": "ساعت اضافه‌کار",
		"accounting.payroll.runs": "لیست‌های حقوق",
		"accounting.payroll.recalc": "محاسبه مجدد",
		"accounting.payroll.recalculated": "حقوق دوباره محاسبه شد",
		"accounting.payroll.exportTamin": "خروجی لیست‌دیسک تامین",
		"accounting.payroll.taminExported": "فایل ZIP لیست‌دیسک آماده است",
		"accounting.payroll.payslips": "فیش‌ها",
		"accounting.payroll.daysWorked": "روز کارکرد",
		"accounting.payroll.gross": "ناخالص",
		"accounting.payroll.insurable": "مشمول بیمه",
		"accounting.payroll.empIns": "بیمه کارگر",
		"accounting.payroll.erIns": "بیمه کارفرما",
		"accounting.payroll.unemp": "بیکاری",
		"accounting.payroll.tax": "مالیات",
		"accounting.payroll.net": "خالص",
		"accounting.payroll.volumeQty": "مقدار حجم",
		"accounting.payroll.pieceRate": "نرخ قطعه‌کاری",
		"accounting.payroll.volumePay": "مزد حجمی",
		"accounting.payroll.decrees": "احکام کارگزینی",
		"accounting.payroll.issueDecree": "صدور حکم",
		"accounting.payroll.print": "چاپ",
		"accounting.payroll.myPayroll": "فیش و حکم من",
		"accounting.payroll.myPayrollHelp": "مشاهده و چاپ فیش حقوق و احکام کارگزینی خودتان.",
		"accounting.payroll.nightOtRate": "ضریب اضافه‌کار شب",
		"accounting.payroll.holidayOtRate": "ضریب اضافه‌کار تعطیل",
		"accounting.payroll.childBenefitEach": "حق اولاد به‌ازای هر فرزند",
		"accounting.payroll.volumeInsurable": "کارکرد حجمی مشمول بیمه است",
		"accounting.payroll.sickCountsWorked": "استعلاجی جزو کارکرد (پرداختی)",
		"accounting.payroll.taxBrackets": "پله‌های مالیات حقوق (انباشته سال)",
		"accounting.payroll.bracketUpTo": "تا مبلغ",
		"accounting.payroll.bracketRate": "نرخ ٪",
		"accounting.nav.overview": "نمای کلی",
		"accounting.nav.journals": "اسناد حسابداری",
		"accounting.nav.persons": "اشخاص",
		"accounting.nav.products": "کالاها",
		"accounting.nav.invoices": "فاکتور فروش",
		"accounting.nav.purchases": "خرید",
		"accounting.nav.expenses": "هزینه‌ها",
		"accounting.nav.treasury": "خزانه",
		"accounting.nav.checks": "چک‌ها",
		"accounting.nav.warehouses": "انبار",
		"accounting.nav.moadian": "صف مودیان",
		"accounting.nav.hesabfa": "سینک حسابفا",
		"accounting.nav.payroll": "حقوق",
		"accounting.nav.projects": "پروژه‌ها",
		"accounting.nav.reports": "گزارش‌ها",
		"accounting.kpi.profit": "سود (ماه جاری)",
		"accounting.kpi.margin": "حاشیه فروش (ماه جاری)",
		"accounting.kpi.moadianPending": "مودیان در انتظار",
		"accounting.backfillOrders": "همگام‌سازی سفارش‌های اخیر",
		"accounting.backfillDone": "{{count}} سفارش همگام شد",
		"accounting.posted": "ثبت شد",
		"accounting.post": "ثبت سند",
		"accounting.processMoadian": "پردازش صف مودیان",
		"accounting.moadianProcessed": "{{count}} کار پردازش شد",
		"accounting.personName": "نام شخص",
		"accounting.productName": "نام کالا",
		"accounting.sstid": "شناسه کالا/خدمت",
		"accounting.employeeName": "نام کارمند",
		"accounting.baseSalary": "حقوق پایه",
		"accounting.createPayroll": "ایجاد لیست حقوق",
		"accounting.projectName": "نام پروژه",
		"accounting.cashAccounts": "صندوق / بانک",
		"accounting.vouchers": "رسید و پرداخت",
		"accounting.stock": "موجودی",
		"accounting.col.number": "شماره",
		"accounting.col.date": "تاریخ",
		"accounting.col.status": "وضعیت",
		"accounting.col.description": "شرح",
		"accounting.col.name": "نام",
		"accounting.col.kind": "نوع",
		"accounting.col.nationalId": "کد ملی",
		"accounting.col.mobile": "موبایل",
		"accounting.col.vat": "مالیات %",
		"accounting.col.total": "جمع",
		"accounting.col.moadian": "مودیان",
		"accounting.col.type": "نوع",
		"accounting.col.amount": "مبلغ",
		"accounting.col.due": "سررسید",
		"accounting.col.default": "پیش‌فرض",
		"accounting.col.warehouse": "انبار",
		"accounting.col.product": "کالا",
		"accounting.col.qty": "تعداد",
		"accounting.col.invoice": "فاکتور",
		"accounting.col.action": "عملیات",
		"accounting.col.error": "خطا",
		"accounting.col.code": "کد",
		"accounting.col.budget": "بودجه",
		"accounting.col.debit": "بدهکار",
		"accounting.col.credit": "بستانکار",
		"accounting.col.balance": "مانده",
		"accounting.report.pnl": "سود و زیان",
		"accounting.report.vat": "مالیات خالص",
		"accounting.report.margin": "حاشیه ناخالص",
		"accounting.report.trialBalance": "تراز آزمایشی",
		"accounting.fiscalId": "شناسه حافظه مالیاتی",
		"accounting.privateKey": "کلید خصوصی (PEM)",
		"accounting.certificate": "گواهی (PEM)",
		"accounting.defaultInvoiceType": "نوع صورتحساب پیش‌فرض",
		"accounting.invoiceType1": "نوع ۱ (با خریدار)",
		"accounting.invoiceType2": "نوع ۲",
		"accounting.invoiceType3": "نوع ۳ (پایانه)",
		"accounting.autoSend": "ارسال خودکار به مودیان پس از همگام‌سازی سفارش",
		"accounting.sandbox": "حالت آزمایشی",
		"accounting.moadianHelp": "در tp.tax.gov.ir ثبت‌نام کنید، حافظه مالیاتی بسازید، کلید عمومی را بارگذاری کنید و کلید خصوصی و شناسه حافظه را اینجا وارد کنید.",
		"accounting.testConnection": "تست اتصال مودیان",
		"accounting.testSuccess": "اتصال مودیان موفق",
		"accounting.hesabfa.enabled": "فعال‌سازی سینک دوطرفه حسابفا",
		"accounting.hesabfa.apiKey": "کلید API",
		"accounting.hesabfa.loginToken": "توکن ورود (ترجیحی)",
		"accounting.hesabfa.userId": "نام کاربری / ایمیل (جایگزین)",
		"accounting.hesabfa.password": "رمز عبور (جایگزین)",
		"accounting.hesabfa.yearId": "شناسه سال مالی (۰ = آخرین)",
		"accounting.hesabfa.currency": "ارز حسابفا",
		"accounting.hesabfa.defaultBank": "کد بانک پیش‌فرض",
		"accounting.hesabfa.defaultWarehouse": "کد انبار پیش‌فرض",
		"accounting.hesabfa.hookPassword": "رمز هوک تغییرات",
		"accounting.hesabfa.linkWcOnly": "در ایمپورت، محصولات متصل به ووکامرس را بازنویسی نکن (فقط لینک با SKU/بارکد)",
		"accounting.hesabfa.entities": "موجودیت‌های سینک",
		"accounting.hesabfa.entity.contacts": "اشخاص",
		"accounting.hesabfa.entity.items": "کالاها",
		"accounting.hesabfa.entity.invoices": "فاکتورها",
		"accounting.hesabfa.entity.receipts": "دریافت و پرداخت",
		"accounting.hesabfa.entity.warehouses": "رسید/حواله انبار",
		"accounting.hesabfa.entity.cash_accounts": "بانک / صندوق",
		"accounting.hesabfa.entity.journals": "اسناد حسابداری",
		"accounting.hesabfa.entity.bank_transfers": "انتقال بین بانکی",
		"accounting.hesabfa.entity.categories": "دسته‌ها",
		"accounting.hesabfa.entity.projects": "پروژه‌ها",
		"accounting.hesabfa.entity.accounts": "حساب‌ها",
		"accounting.hesabfa.hookUrl": "آدرس وب‌هوک",
		"accounting.hesabfa.lastChangeId": "کرسر آخرین تغییر",
		"accounting.hesabfa.help": "از API رسمی api.hesabfa.com/v1 استفاده می‌شود. اعتبارنامه را ذخیره کنید، تست کنید، هوک را ثبت کنید، سپس مهاجرت یا سینک مداوم را اجرا کنید.",
		"accounting.hesabfa.test": "تست اتصال حسابفا",
		"accounting.hesabfa.testSuccess": "اتصال حسابفا موفق",
		"accounting.hesabfa.registerHook": "ثبت هوک تغییرات",
		"accounting.hesabfa.hookRegistered": "هوک تغییرات ثبت شد",
		"accounting.hesabfa.syncNow": "دریافت تغییرات الان",
		"accounting.hesabfa.migrate": "مهاجرت از حسابفا",
		"accounting.hesabfa.migrateQueued": "{{count}} مرحله مهاجرت در صف قرار گرفت",
		"accounting.hesabfa.synced": "{{count}} تغییر دریافت شد",
		"accounting.hesabfa.process": "پردازش صف سینک",
		"accounting.hesabfa.processed": "{{count}} جاب حسابفا پردازش شد",
		"accounting.hesabfa.jobs": "جاب‌های سینک",
		"accounting.hesabfa.map": "نقشه لینک شناسه‌ها",
		"accounting.hesabfa.log": "لاگ API",
		"accounting.hesabfa.inquiry": "سرویس‌های استعلام",
		"accounting.hesabfa.inquiryValue": "مقدار",
		"accounting.hesabfa.runInquiry": "اجرای استعلام",
		"accounting.companyName": "نام شرکت",
		"accounting.economicCode": "کد اقتصادی",
		"accounting.nationalId": "شناسه ملی",
		"accounting.postalCode": "کد پستی",
		"accounting.province": "استان",
		"accounting.city": "شهر",
		"accounting.phone": "تلفن",
		"accounting.address": "آدرس",
		"accounting.snapshotCogs": "اسنپ‌شات قیمت خرید WFCP روی اقلام سفارش",
		"accounting.syncStatuses": "وضعیت‌های همگام‌سازی سفارش (با کاما)",
		"accounting.syncHelp": "سفارش‌ها در این وضعیت‌ها فاکتور فروش، سند حسابداری و در صورت نیاز کار مودیان می‌سازند.",
		"accounting.defaultVat": "نرخ مالیات پیش‌فرض ٪",
		"accounting.map.sales": "کد حساب فروش",
		"accounting.map.vat_payable": "کد مالیات پرداختنی",
		"accounting.map.cogs": "کد بهای تمام‌شده",
		"accounting.map.inventory": "کد موجودی",
		"accounting.map.cash": "کد صندوق",
		"accounting.map.bank": "کد بانک",
		"accounting.map.gateway": "کد درگاه پرداخت",
		"accounting.map.receivables": "کد دریافتنی",
		"accounting.map.payables": "کد پرداختنی",
		"accounting.map.payroll_expense": "کد هزینه حقوق",
		"accounting.map.payroll_payable": "کد حقوق پرداختنی",
		"accounting.map.insurance_exp": "هزینه بیمه کارفرما",
		"accounting.map.insurance_pay": "بیمه پرداختنی",
		"marketplace.module.accounting-module": "حسابداری",
		"marketplace.module.accounting-module-connection": "مودیان",
		"marketplace.module.accounting-module-company": "شرکت",
		"marketplace.module.accounting-module-sync": "همگام‌سازی",
		"marketplace.module.accounting-module-tax": "نگاشت مالیاتی",
		"settings.site.sections.modules": "ماژول‌ها",
		"settings.site.sections.bots": "ربات‌ها",
		"settings.site.sections.systemLogs": "لاگ‌های سیستم",
		"settings.site.sections.analytics": "آمار و ردیابی",
		"settings.site.sections.sms": "پیامک سایت",
		"settings.siteSms.title": "تنظیمات پیامک (ورود و ثبت‌نام)",
		"settings.siteSms.enabled": "فعال",
		"settings.siteSms.serviceLine": "خط خدماتی",
		"settings.siteSms.dedicatedLine": "خط اختصاصی",
		"settings.siteSms.otpLogin": "OTP ورود",
		"settings.siteSms.otpLoginTemplate": "متن OTP ورود",
		"settings.siteSms.otpRegister": "OTP ثبت‌نام",
		"settings.siteSms.otpRegisterTemplate": "متن OTP ثبت‌نام",
		"settings.siteSms.shortcodeHint": "از {{code}} برای کد یکبارمصرف استفاده کنید.",
		"settings.siteSms.multiChannelOtpHint": "OTP چندکاناله ورود/ثبت‌نام داشبورد در سیستم اعلان →",
		"settings.siteSms.unavailable": "تنظیمات پیامک سایت از سرویس لایسنس بارگذاری نشد. نمایش حالت پیش‌فرض؛ ذخیره تا برقراری اتصال ممکن نیست.",
		"settings.shopSms.title": "اطلاع‌رسانی سفارش (پیامک)",
		"settings.shopSms.enabled": "فعال",
		"settings.shopSms.balance": "موجودی: {{amount}}",
		"settings.shopSms.adminPhones": "شماره مدیرها (هر خط یک شماره)",
		"settings.shopSms.eventToggles": "وضعیت‌های ارسال",
		"settings.shopSms.notifyCustomer": "پیامک مشتری",
		"settings.shopSms.notifyAdmin": "پیامک مدیر",
		"settings.shopSms.templates": "متن پیامک",
		"settings.shopSms.customerMessage": "متن مشتری",
		"settings.shopSms.adminMessage": "متن مدیر",
		"settings.shopSms.syncPattern": "ثبت/همگام پترن",
		"settings.shopSms.bindPattern": "اتصال کد پترن موجود",
		"settings.shopSms.patternSynced": "پترن همگام شد.",
		"settings.shopSms.patternOnlyHint": "ارسال پیامک سفارش فقط از طریق پترن تأییدشده انجام می‌شود.",
		"settings.shopSms.eventColumn": "رویداد / وضعیت",
		"settings.shopSms.patternColumn": "پترن",
		"settings.shopSms.patternCode": "کد پترن",
		"settings.shopSms.patternCodePlaceholder": "مثلاً wb_xxxx",
		"settings.shopSms.patternStatus.synced": "همگام",
		"settings.shopSms.patternStatus.pending": "در انتظار",
		"settings.shopSms.patternStatus.failed": "خطا",
		"settings.shopSms.patternStatus.none": "بدون پترن",
		"orders.sms.sendCustomer": "پیامک به مشتری",
		"orders.sms.sendAdmin": "پیامک به مدیر",
		"orders.sms.sent": "درخواست ارسال پیامک ثبت شد.",
		"orders.sms.failed": "ارسال پیامک ناموفق بود.",
		"orders.sms.title": "پیامک سفارش",
		"settings.shopSms.events.pending_on_create": "در انتظار پرداخت (ثبت سفارش)",
		"settings.shopSms.events.pending_on_status": "در انتظار پرداخت (تغییر وضعیت)",
		"settings.shopSms.events.processing": "در حال انجام",
		"settings.shopSms.events.sent-to-warehouse": "ارسال شده به انبار",
		"settings.shopSms.events.packaged": "بسته‌بندی شده",
		"settings.shopSms.events.courier": "تحویل پیک",
		"settings.shopSms.events.post": "تحویل پست",
		"settings.shopSms.events.tipax": "تحویل تیپاکس",
		"settings.shopSms.events.on-hold": "در انتظار بررسی",
		"settings.shopSms.events.completed": "تکمیل شده",
		"settings.shopSms.events.cancelled": "لغو شده",
		"settings.shopSms.events.refunded": "مسترد شده",
		"settings.shopSms.events.failed": "ناموفق",
		"settings.shopSms.events.checkout-draft": "پیش‌نویس",
		"settings.shopSms.events.cart-abandoned": "رهاسازی سبدخرید",
		"settings.shopSms.events.order-abandoned": "سفارش رها شده",
		"settings.shopSms.events.user-welcome": "پیام خوش آمدید",
		"settings.shopSms.events.stock-low": "کم بودن موجودی",
		"settings.shopSms.events.stock-out": "تمام شدن موجودی",
		"settings.shopSms.recoveryTitle": "جذب / کوپن اختصاصی",
		"settings.shopSms.recoveryDelay": "تأخیر ارسال (ساعت)",
		"settings.shopSms.recoveryCoupon": "صدور کد تخفیف اختصاصی",
		"settings.shopSms.recoveryCouponType": "نوع تخفیف",
		"settings.shopSms.recoveryPercent": "درصدی",
		"settings.shopSms.recoveryFixed": "مبلغ ثابت سبد",
		"settings.shopSms.recoveryAmount": "مقدار",
		"settings.shopSms.recoveryExpires": "انقضا (روز)",
		"settings.shopSms.recoveryUsage": "حد مصرف",
		"settings.shopSms.postBarcodeMergedHint": "با ثبت بارکد پستی هم از همین پترن «تحویل پست» استفاده می‌شود.",
		"settings.site.fieldSiteTitle": "عنوان سایت",
		"settings.site.fieldTagline": "شعار",
		"settings.site.fieldAdminEmail": "ایمیل مدیر",
		"settings.site.fieldTimezone": "منطقه زمانی",
		"settings.site.identityTitle": "هویت سایت",
		"settings.site.identityHint": "نام و شعار عمومی که در سایت نمایش داده می‌شود.",
		"settings.site.technicalTitle": "فنی",
		"settings.site.technicalHint": "ایمیل مدیر و منطقه زمانی وردپرس.",
		"settings.site.licenseFullPage": "صفحه کامل لایسنس",
		"settings.appearanceTitle": "استودیوی ظاهر",
		"settings.appearanceHint": "زبان، پوسته و رنگ تأکید داشبورد.",
		"settings.moduleOn": "نمایش در نوار کناری",
		"settings.moduleOff": "مخفی از نوار کناری",
		"settings.enabled": "فعال",
		"settings.disabled": "غیرفعال",
		"settings.odBrandingPreview": "پیش‌نمایش برند",
		"settings.shop.title": "مدیریت فروشگاه",
		"settings.shop.description": "تنظیمات فروشگاه آنلاین.",
		"settings.shop.sections.general": "همگانی",
		"settings.shop.sections.products": "محصولات",
		"settings.shop.sections.tax": "مالیات",
		"settings.shop.sections.shipping": "حمل و نقل",
		"settings.shop.sections.payments": "درگاه پرداخت",
		"settings.shop.sections.invoices": "فاکتورها",
		"settings.shop.sections.sms": "پیامک",
		"settings.shop.sections.bots": "تلگرام / بله",
		"settings.shop.sections.emails": "ایمیل‌ها",
		"settings.shop.sections.advanced": "پیشرفته",
		"settings.shop.sections.pricing": "قیمت‌گذاری (WFCP)",
		"settings.shop.productsGeneral": "عمومی",
		"settings.shop.productsInventory": "موجودی",
		"settings.shop.productsDownloadable": "دانلودی",
		"settings.shop.shippingNewZone": "نام منطقه جدید",
		"settings.shop.shippingAddZone": "افزودن منطقه",
		"settings.shop.shippingMethodCount": "{{count}} روش",
		"settings.shop.shippingOptions": "گزینه‌های حمل",
		"settings.shop.gatewayEnabled": "فعال‌سازی درگاه",
		"settings.shop.emailEnabled": "فعال‌سازی ایمیل",
		"settings.shop.emailGlobal": "تنظیمات فرستنده ایمیل",
		"settings.pageDescription": "زبان، تم، رنگ تأکید و ترجیحات داشبورد.",
		"settings.accent": "رنگ تأکید",
		"settings.themeSystem": "هماهنگ با سیستم",
		"settings.themeLight": "روشن",
		"settings.themeDark": "تیره",
		"settings.accentColorful": "رنگی",
		"settings.accentDefault": "خنثی",
		"settings.accentRed": "قرمز",
		"settings.accentRose": "گل‌سرخی",
		"settings.accentOrange": "نارنجی",
		"settings.accentGreen": "سبز",
		"settings.accentBlue": "آبی",
		"settings.accentYellow": "زرد",
		"settings.accentViolet": "بنفش",
		"settings.fullscreenDefault": "باز کردن داشبورد به‌صورت تمام‌صفحه",
		"settings.licenseHint": "فعال‌سازی لایسنس از طریق اندپوینت‌های سرویس لایسنس این سایت انجام می‌شود.",
		"common.loading": "در حال بارگذاری…",
		"common.noResults": "نتیجه‌ای نیست.",
		"common.saving": "در حال ذخیره…",
		"common.loadFailed": "بارگذاری داده ناموفق بود.",
		"common.empty": "موردی نیست.",
		"list.filters": "فیلترها",
		"common.save": "ذخیره",
		"common.saved": "ذخیره شد",
		"common.disabled": "غیرفعال",
		"common.delete": "حذف",
		"common.deleted": "حذف شد",
		"common.edit": "ویرایش",
		"common.view": "مشاهده",
		"common.prevPage": "صفحهٔ قبل",
		"common.nextPage": "صفحهٔ بعد",
		"common.emptyValue": "—",
		"common.cancel": "انصراف",
		"common.back": "بازگشت",
		"common.unlimited": "نامحدود",
		"settings.langEn": "English",
		"settings.langFa": "فارسی",
		"a11y.toggleSubmenu": "باز و بسته کردن زیرمنو",
		"a11y.sidebarTitle": "نوار کناری",
		"a11y.sidebarDescription": "ناوبری اصلی",
		"a11y.toggleSidebar": "باز و بسته کردن نوار کناری",
		"a11y.close": "بستن",
		"a11y.more": "بیشتر",
		"a11y.thumbnail": "تصویر بندانگشتی",
		"a11y.moduleIcon": "آیکون ماژول",
		"common.listSeparator": "، ",
		"date.placeholderGregorian": "YYYY-MM-DD",
		"date.placeholderJalali": "YYYY/MM/DD (شمسی)",
		"date.preview": "نمایش",
		"date.dateTime": "تاریخ و زمان",
		"date.dateTimeHint": "تاریخ را از تقویم انتخاب کنید؛ زمان را در پایین تنظیم کنید.",
		"date.prevMonth": "ماه قبل",
		"date.nextMonth": "ماه بعد",
		"date.pickDate": "انتخاب تاریخ",
		"date.time": "زمان",
		"date.timeSeparator": " ساعت ",
		"errors.api.invalidNonce": "ورود منقضی شده. صفحه را رفرش کنید و دوباره تلاش کنید.",
		"errors.api.generic": "خطایی رخ داد",
		"errors.api.invalid": "درخواست نامعتبر",
		"errors.api.forbidden": "دسترسی مجاز نیست",
		"errors.api.notFound": "یافت نشد",
		"errors.api.invalidRole": "نقش مجاز نیست",
		"errors.api.forbiddenRole": "اجازه تخصیص این نقش را ندارید",
		"errors.api.timeout": "سرور لایسنس در زمان مقرر پاسخ نداد. لطفاً کمی بعد دوباره تلاش کنید.",
		"errors.api.emptyReply": "سرور لایسنس بدون پاسخ اتصال را بست. لطفاً کمی بعد دوباره تلاش کنید.",
		"errors.api.networkOffline": "اتصال برقرار نشد. اینترنت یا دسترسی به سرور را بررسی کنید.",
		"errors.api.siteUpdating": "سایت موقتاً در دسترس نیست (احتمالاً در حال به‌روزرسانی).",
		"errors.api.restCdnBlocked": "دسترسی به API مسدود شده (CDN/WAF). مسیر admin-ajax یا /wp-json را مجاز کنید.",
		"errors.api.transport": "اتصال به سرور لایسنس برقرار نشد. اتصال اینترنت را بررسی کنید.",
		"errors.api.crmUnreachable": "وضعیت ذخیره‌شده نمایش داده می‌شود؛ همگام‌سازی با سرویس لایسنس بعداً انجام خواهد شد.",
		"errors.api.licenseAuth": "احراز هویت لایسنس ناموفق بود. در صورت تکرار با پشتیبانی تماس بگیرید.",
		"errors.api.licenseNotConfigured": "امضای لایسنس روی این سایت پیکربندی نشده است.",
		"errors.api.unknown": "خطای ناشناخته از سرور. دوباره تلاش کنید.",
		"status.post.draft": "پیش‌نویس",
		"status.post.pending": "در انتظار بررسی",
		"status.post.publish": "منتشر شده",
		"status.post.private": "خصوصی",
		"status.post.future": "زمان‌بندی شده",
		"status.post.trash": "سطل زباله",
		"coupons.type.fixed_cart": "تخفیف ثابت سبد",
		"coupons.type.percent": "تخفیف درصدی",
		"coupons.type.fixed_product": "تخفیف ثابت محصول",
		"license.status.active": "فعال",
		"license.status.inactive": "غیرفعال",
		"license.status.demo": "دمو",
		"license.status.expired": "منقضی",
		"license.status.unknown": "نامشخص",
		"license.status.not_found": "ثبت نشده",
		"license.status.cancelled": "لغو شده",
		"shopBot.campaignStatus.pending": "در انتظار",
		"shopBot.campaignStatus.scheduled": "زمان‌بندی شده",
		"shopBot.campaignStatus.sent": "ارسال شده",
		"shopBot.campaignStatus.failed": "ناموفق",
		"shopBot.campaignStatus.cancelled": "لغو شده",
		"wfcp.sort.date_desc": "تاریخ (جدیدترین)",
		"wfcp.sort.date_asc": "تاریخ (قدیمی‌ترین)",
		"wfcp.sort.name_asc": "نام (الف–ی)",
		"wfcp.sort.name_desc": "نام (ی–الف)",
		"bots.logs.channelPlaceholder": "api, webhook…",
		"wfcp.stock.instock": "موجود",
		"wfcp.stock.outofstock": "ناموجود",
		"wfcp.priceMode.fixed": "مبلغ ثابت",
		"wfcp.priceMode.percent": "درصد",
		"wfcp.scope.global": "سراسری",
		"wfcp.scope.category": "دسته",
		"shopBot.tier.basic": "پایه",
		"shopBot.tier.advanced": "پیشرفته",
		"shopBot.currency.toman": "تومان",
		"shopBot.currency.rial": "ریال",
		"products.emptyList": "محصولی با این فیلترها یافت نشد.",
		"errors.notFoundTitle": "صفحه پیدا نشد",
		"errors.notFoundBody": "این آدرس در منوی داشبورد تعریف نشده است.",
		"errors.backHome": "بازگشت به داشبورد",
		"errors.forbiddenTitle": "دسترسی ندارید",
		"errors.forbiddenBody": "مجوز لازم برای این بخش را ندارید.",
		"errors.bootstrapTitle": "بارگذاری داشبورد ناموفق بود",
		"errors.bootstrapBody": "سرور اطلاعات منو و دسترسی‌ها را برنگرداند. صفحه را تازه کنید یا دوباره وارد شوید.",
		"errors.routeTitle": "نمایش این صفحه ممکن نشد",
		"errors.routeBody": "هنگام بارگذاری این صفحه خطایی رخ داد. دوباره تلاش کنید یا به نمای کلی برگردید.",
		"errors.chunkTitle": "بارگذاری صفحه ناموفق بود",
		"errors.chunkBody": "برنامه نتوانست این بخش را دانلود کند. پس از به‌روزرسانی، صفحه را تازه کنید یا کش مرورگر را پاک کنید.",
		"errors.restUnavailable": "API داشبورد در دسترس نیست (خطای سرور). اگر تازه ماژولی نصب کرده‌اید، آن را غیرفعال کنید یا با پشتیبانی تماس بگیرید.",
		"errors.reloadPage": "بارگذاری مجدد",
		"errors.boot.missingRoot": "عنصر ریشهٔ داشبورد یافت نشد.",
		"errors.boot.missingRootDetail": "عنصر #root در HTML صفحه نیست.",
		"errors.boot.missingConfig": "پیکربندی داشبورد بارگذاری نشد.",
		"errors.boot.missingConfigDetail": "window.webinoDashboard موجود نیست. بررسی کنید افزونه و build روی سرور نصب باشد.",
		"errors.boot.i18nFailed": "راه‌اندازی داشبورد ناموفق بود.",
		"errors.boot.loadFailed": "بارگذاری داشبورد ناموفق بود.",
		"posts.title": "نوشته‌ها",
		"posts.listDescription": "فهرست و ورود به ویرایشگر.",
		"posts.add": "افزودن نوشته",
		"posts.emptyHint": "هنوز نوشته‌ای نیست. اولین مطلب را بنویسید.",
		"posts.colTitle": "عنوان",
		"posts.colStatus": "وضعیت",
		"posts.colDate": "تاریخ",
		"posts.colExcerpt": "چکیده",
		"posts.colActions": "اقدامات",
		"posts.toggleColumns": "ستون‌ها",
		"posts.totalCount": "{{count}} نوشته",
		"posts.pageOf": "صفحه {{page}} از {{total}}",
		"posts.perPage": "در هر صفحه",
		"posts.editTitle": "ویرایش نوشته",
		"posts.newTitle": "نوشته جدید",
		"posts.fieldTitle": "عنوان",
		"posts.fieldContent": "محتوا (HTML)",
		"posts.fieldStatus": "وضعیت",
		"posts.fieldCategories": "دسته‌ها",
		"posts.panelPublish": "انتشار",
		"posts.panelCategories": "دسته‌ها",
		"posts.panelTags": "برچسب‌ها",
		"posts.panelFeaturedImage": "تصویر شاخص",
		"posts.statusLabel": "وضعیت",
		"posts.visibilityLabel": "قابلیت مشاهده",
		"posts.discussionLabel": "گفتگو",
		"posts.publishDateLabel": "انتشار",
		"posts.visibilityPublic": "عمومی",
		"posts.visibilityPrivate": "خصوصی",
		"posts.visibilityPassword": "رمزدار",
		"posts.commentsEnabled": "دیدگاه‌ها فعال",
		"posts.commentsDisabled": "دیدگاه‌ها غیرفعال",
		"posts.publishImmediately": "فوری",
		"posts.publishScheduled": "زمان‌بندی",
		"posts.addCategory": "افزودن",
		"posts.addCategoryPlaceholder": "دسته جدید…",
		"posts.tagsPlaceholder": "برچسب بنویسید…",
		"posts.selectFeaturedImage": "انتخاب تصویر",
		"posts.changeFeaturedImage": "تغییر تصویر",
		"posts.removeFeaturedImage": "حذف تصویر",
		"posts.noFeaturedImage": "تصویری انتخاب نشده",
		"posts.editorVisual": "بصری",
		"posts.editorCode": "کد HTML",
		"posts.publishButton": "انتشار",
		"posts.saveDraftButton": "ذخیره پیش‌نویس",
		"posts.dialogClose": "بستن",
		"posts.passwordLabel": "رمز عبور",
		"posts.passwordPlaceholder": "رمز مشاهده",
		"posts.titlePlaceholder": "عنوان نوشته را بنویسید…",
		"posts.contentPlaceholder": "محتوای نوشته را بنویسید…",
		"posts.linkPrompt": "آدرس لینک",
		"posts.imageUrlPrompt": "آدرس تصویر",
		"posts.toolBold": "درشت",
		"posts.toolItalic": "کج",
		"posts.toolStrike": "خط‌خورده",
		"posts.toolHeading": "سرتیتر",
		"posts.toolBulletList": "فهرست نقطه‌ای",
		"posts.toolOrderedList": "فهرست شماره‌دار",
		"posts.toolQuote": "نقل‌قول",
		"posts.toolCodeBlock": "بلوک کد",
		"posts.toolLink": "لینک",
		"posts.toolImage": "تصویر",
		"posts.toolUnderline": "زیرخط",
		"posts.toolUndo": "واگرد",
		"posts.toolRedo": "بازواگرد",
		"posts.toolParagraph": "پاراگراف",
		"posts.toolHeading2": "عنوان ۲",
		"posts.toolHeading3": "عنوان ۳",
		"posts.toolHeading4": "عنوان ۴",
		"posts.toolSuperscript": "بالانویس",
		"posts.toolSubscript": "زیرنویس",
		"posts.toolInlineCode": "کد خطی",
		"posts.toolAlignRight": "تراز راست",
		"posts.toolAlignCenter": "تراز وسط",
		"posts.toolAlignLeft": "تراز چپ",
		"posts.toolJustify": "جاستیفای",
		"posts.toolHr": "خط افقی",
		"posts.toolImageMedia": "از کتابخانه رسانه",
		"posts.toolImageUrl": "از آدرس",
		"posts.toolTable": "جدول",
		"posts.toolTableInsert": "درج جدول",
		"posts.toolTableAddCol": "افزودن ستون",
		"posts.toolTableAddRow": "افزودن ردیف",
		"posts.toolTableDelCol": "حذف ستون",
		"posts.toolTableDelRow": "حذف ردیف",
		"posts.toolTableDelete": "حذف جدول",
		"posts.toolTextColor": "رنگ متن",
		"posts.toolHighlight": "هایلایت",
		"posts.toolClearColor": "حذف رنگ",
		"posts.toolClearHighlight": "حذف هایلایت",
		"posts.toolClearFormat": "پاک‌کردن قالب",
		"posts.toolFullscreen": "تمام‌صفحه",
		"posts.toolExitFullscreen": "خروج از تمام‌صفحه",
		"editor.wordCount": "{{count}} کلمه",
		"editor.charCount": "{{count}} کاراکتر",
		"categories.title": "دسته‌ها",
		"categories.newName": "نام",
		"categories.add": "افزودن دسته",
		"categories.colName": "نام",
		"categories.colCount": "نوشته",
		"categories.fieldName": "نام",
		"categories.fieldNameHint": "این نام همان گونه‌ای است که در وب‌گاه شما نمایان می‌شود.",
		"categories.fieldSlug": "نامک",
		"categories.fieldSlugHint": "«نام اینترنتی» یک نسخه از نام است که برای نشانی وب مناسب است. معمولا با حروف کوچک بوده و تنها شامل حروف، ارقام و خط تیره است.",
		"categories.fieldParent": "دستهٔ مادر",
		"categories.fieldParentNone": "هیچ‌کدام",
		"categories.fieldParentHint": "دسته‌ها برخلاف برچسب‌ها می‌توانند سلسله مراتب داشته باشند.",
		"categories.fieldDescription": "توضیح",
		"categories.fieldDescriptionHint": "توضیح به طور پیش‌فرض پررنگ نیست؛ با این حال، برخی از پوسته‌ها ممکن است آن را نمایش دهند.",
		"categories.hierarchyHint": "مثلاً می‌توانید دسته «موسیقی» و زیردسته‌های «موسیقی ایرانی» یا «موسیقی غربی» داشته باشید.",
		"categories.addSectionTitle": "افزودن دسته",
		"categories.listSectionTitle": "فهرست دسته‌ها",
		"categories.actionEdit": "ویرایش",
		"categories.actionQuickEdit": "ویرایش سریع",
		"categories.actionDelete": "حذف",
		"categories.actionView": "نمایش",
		"categories.quickEditSave": "به‌روزرسانی",
		"categories.quickEditCancel": "لغو",
		"categories.deleteConfirmTitle": "حذف دسته",
		"categories.deleteConfirmBody": "آیا از حذف «{{name}}» مطمئن هستید؟",
		"media.title": "رسانه",
		"media.description": "مرور، آپلود و سازمان‌دهی فایل‌های رسانه.",
		"media.uploaded": "فایل بارگذاری شد",
		"media.empty": "فایلی با این فیلتر نیست. فایل آپلود کنید یا پوشه/دسته را عوض کنید.",
		"media.filterFolder": "پوشه",
		"media.filterCategory": "دسته",
		"media.allFolders": "همهٔ پوشه‌ها",
		"media.allCategories": "همهٔ دسته‌ها",
		"media.searchPlaceholder": "جستجو بر اساس عنوان…",
		"media.upload": "آپلود",
		"media.actionFolder": "پوشه",
		"media.actionCategory": "دسته",
		"media.actionTag": "برچسب",
		"media.actionEdit": "ویرایش",
		"media.editTitle": "ویرایش رسانه",
		"media.fieldSlug": "نامک",
		"media.fieldCaption": "زیرنویس",
		"media.fieldDescription": "توضیحات",
		"media.fieldAlt": "متن جایگزین",
		"media.foldersTitle": "پوشه‌های رسانه",
		"media.categoriesTitle": "دسته‌های رسانه",
		"media.tagsTitle": "برچسب‌ها",
		"media.parentCategory": "دستهٔ والد (اختیاری)",
		"media.parentFolder": "پوشهٔ والد (اختیاری)",
		"media.newFolder": "پوشهٔ جدید",
		"media.newCategory": "دستهٔ جدید",
		"media.newTag": "برچسب جدید",
		"media.addSectionTitle": "افزودن",
		"media.listSectionTitle": "همه",
		"media.fieldName": "نام",
		"media.fieldNameHint": "نامی که در کتابخانه نمایش داده می‌شود.",
		"media.fieldSlugHint": "نسخهٔ URL-friendly نام.",
		"media.fieldParent": "والد",
		"media.fieldParentNone": "بدون والد",
		"media.fieldParentHint": "والد اختیاری برای سلسله‌مراتب.",
		"media.fieldDescriptionHint": "توضیحات اختیاری.",
		"media.actionQuickEdit": "ویرایش سریع",
		"media.actionDelete": "حذف",
		"media.quickEditSave": "به‌روزرسانی",
		"media.quickEditCancel": "انصراف",
		"media.deleteConfirmTitle": "حذف مورد",
		"media.deleteConfirmBody": "آیا از حذف «{{name}}» مطمئن هستید؟",
		"media.assignFolder": "اختصاص پوشه",
		"media.assignCategory": "اختصاص دسته‌ها",
		"media.assignTags": "اختصاص برچسب‌ها",
		"media.noFolder": "بدون پوشه",
		"media.tagsPlaceholder": "افزودن برچسب…",
		"media.pageOf": "صفحه {{page}} از {{total}}",
		"media.totalItems": "{{count}} مورد",
		"media.perPage": "در هر صفحه",
		"settings.modulesTitle": "ماژول‌های سایدبار",
		"settings.modulesHint": "بخش‌ها را برای همهٔ کاربرانی که می‌بینندشان خاموش کنید. داشبورد همیشه روشن است.",
		"settings.orderDocumentsTitle": "اسناد سفارش (چاپ)",
		"settings.orderDocsCommon": "عمومی",
		"settings.orderDocsSender": "فرستنده / فروشنده",
		"settings.orderDocsInvoice": "فاکتور",
		"settings.orderDocsReceipt": "رسید",
		"settings.orderDocsLabel": "برچسب پستی",
		"settings.orderDocsEnable": "فعال‌سازی اسناد",
		"settings.odEnableInvoice": "فاکتور",
		"settings.odEnableReceipt": "رسید",
		"settings.odEnableLabel": "لیبل پستی",
		"settings.odEnableProductLabel": "لیبل انبار محصول",
		"settings.orderDocsLogos": "لوگوها",
		"settings.odInvoiceLogo": "لوگوی فاکتور",
		"settings.odInvoiceLogoHint": "از رسانه انتخاب کنید یا تصویر جدید آپلود کنید.",
		"settings.odLabelLogo": "لوگوی لیبل پستی",
		"settings.odLabelLogoHint": "برای پرینتر حرارتی بهتر است لوگوی ساده و تیره باشد.",
		"settings.odReceiptLogo": "لوگوی رسید",
		"settings.odReceiptLogoHint": "روی رسید فروش چاپ می‌شود.",
		"settings.odNoLogo": "بدون لوگو",
		"settings.odPickLogo": "انتخاب از رسانه",
		"settings.odUploadLogo": "آپلود",
		"settings.odStoreName": "نام فروشگاه",
		"settings.odLogoUrl": "آدرس لوگو",
		"settings.odAccentColor": "رنگ تأکید",
		"settings.odFooterThanks": "متن پایانی تشکر",
		"settings.odFooterSite": "آدرس سایت در پاورقی",
		"settings.odSenderName": "نام فرستنده",
		"settings.odSenderNameHint": "نام فروشنده روی فاکتور و لیبل پستی.",
		"settings.odSenderAddress": "آدرس فرستنده",
		"settings.odSenderAddressHint": "نشانی کامل مطابق فرم پست.",
		"settings.odSenderPostcode": "کد پستی فرستنده",
		"settings.odSenderPostcodeHint": "کدپستی ۱۰ رقمی فروشگاه.",
		"settings.odSenderPhone": "تلفن فرستنده",
		"settings.odSenderPhoneHint": "شماره تماس قابل تماس پیک یا پست.",
		"settings.odSenderEmail": "ایمیل فرستنده",
		"settings.odSenderEmailHint": "اختیاری؛ روی فاکتور نمایش داده می‌شود.",
		"settings.odShowStatus": "نمایش وضعیت سفارش",
		"settings.odShowBarcode": "نمایش بارکد",
		"settings.odShowBarcodeInvoice": "بارکد سفارش روی فاکتور",
		"settings.odShowBarcodeReceipt": "بارکد سفارش روی رسید",
		"settings.odShowBarcodeLabel": "بارکد سفارش روی لیبل پستی",
		"settings.odShowProductImage": "نمایش تصویر محصول",
		"settings.odShowSku": "نمایش کد کالا",
		"settings.odShowItemsTable": "نمایش جدول اقلام",
		"settings.odShowProducts": "نمایش لیست محصولات",
		"settings.odShowPostmanPlaceholder": "نمایش محل برچسب پست",
		"settings.odPostmanTitle": "عنوان محل برچسب پست",
		"settings.odPostmanHint": "راهنمای محل برچسب پست",
		"settings.odInvoiceTheme": "تم فاکتور",
		"settings.odReceiptTheme": "تم رسید",
		"settings.odLabelTheme": "تم لیبل پستی",
		"settings.odThemeClassic": "کلاسیک",
		"settings.odThemeModern": "مدرن",
		"settings.odThemeStacked": "ستونی (فرستنده بالا)",
		"settings.odThemeRows": "دو ردیف (فرستنده بالا)",
		"settings.odThemeBand": "نوار رنگی",
		"settings.odThemeBoxed": "عنوان قاب‌دار",
		"settings.odThemeStripe": "ردیف راه‌راه",
		"settings.odThemeCompact": "فشرده",
		"settings.odThemeLandscape": "افقی",
		"settings.odThemeIran": "فرم پست ایران",
		"settings.odThemeStamp": "محل برچسب پست",
		"settings.odInvoiceOrientation": "جهت فاکتور",
		"settings.odEnablePacking": "برگه انبار",
		"settings.odEnableCustomerLabel": "برچسب مشتری",
		"settings.odEnableStoreLabel": "برچسب فروشگاه",
		"settings.orderDocsPacking": "برگه انبارداری",
		"settings.odPackingTheme": "تم برگه انبار",
		"settings.orderDocsStickers": "برچسب مشتری و فروشگاه",
		"settings.odCustomerLabelSize": "سایز برچسب مشتری",
		"settings.odStoreLabelSize": "سایز برچسب فروشگاه",
		"settings.odInvoiceParties": "ترتیب طرفین فاکتور",
		"settings.odPartiesHint": "کدام بلوک اول چاپ شود.",
		"settings.odPartiesSellerFirst": "اول فروشنده",
		"settings.odPartiesBuyerFirst": "اول خریدار",
		"settings.odLabelOrientation": "جهت لیبل پستی",
		"settings.odLabelOrientationHint": "عمودی: فرستنده بالا، گیرنده پایین. افقی: فرستنده چپ، گیرنده راست با محل برچسب پست.",
		"settings.odOrientationPortrait": "عمودی (بالا / پایین)",
		"settings.odOrientationLandscape": "افقی (چپ / راست)",
		"settings.odInvoiceThanks": "متن تشکر فاکتور",
		"settings.odReceiptThanks": "متن تشکر رسید",
		"settings.odLabelNote": "متن توضیحات لیبل پستی",
		"settings.odLabelSize": "سایز لیبل پستی",
		"settings.odSize100x150": "۱۰۰×۱۵۰ میلی‌متر (استاندارد ایران)",
		"settings.odSize100x100": "۱۰۰×۱۰۰ میلی‌متر",
		"settings.odSizeA5": "A5",
		"settings.orderDocsProductLabel": "لیبل انبار محصول",
		"settings.odSplitVariations": "جداسازی تنوع‌ها",
		"settings.odSplitVariationsHint": "برای هر تنوع محصول یک لیبل جدا چاپ شود.",
		"settings.odProductLabelSize": "سایز لیبل انبار",
		"pages.title": "برگه‌ها",
		"pages.add": "افزودن برگه",
		"pages.listDescription": "مدیریت برگه‌های سایت با تنظیمات انتشار و سلسله‌مراتب.",
		"pages.totalCount": "{{count}} برگه",
		"pages.toggleColumns": "ستون‌ها",
		"pages.colTitle": "عنوان",
		"pages.colStatus": "وضعیت",
		"pages.colDate": "تاریخ",
		"pages.colExcerpt": "خلاصه",
		"pages.colActions": "عملیات",
		"pages.actionEdit": "ویرایش",
		"pages.actionQuickEdit": "ویرایش سریع",
		"pages.actionElementor": "ویرایش با المنتور",
		"pages.actionTrash": "انتقال به زباله‌دان",
		"pages.actionView": "نمایش",
		"pages.trashConfirmTitle": "انتقال برگه به زباله‌دان؟",
		"pages.trashConfirmBody": "«{{name}}» به سطل زباله منتقل می‌شود.",
		"pages.quickEditSave": "به‌روزرسانی",
		"pages.quickEditCancel": "انصراف",
		"pages.panelParent": "برگهٔ والد",
		"pages.parentNone": "بدون والد (سطح بالا)",
		"pages.titlePlaceholder": "عنوان برگه",
		"pages.contentPlaceholder": "شروع نوشتن…",
		"pages.fieldExcerpt": "خلاصه",
		"pages.excerptPlaceholder": "خلاصهٔ کوتاه (اختیاری)",
		"pages.editTitle": "ویرایش برگه",
		"pages.newTitle": "برگه جدید",
		"pages.fieldTitle": "عنوان",
		"pages.fieldContent": "محتوا",
		"pages.fieldStatus": "وضعیت",
		"products.title": "محصولات",
		"products.listDescription": "محصولات فروشگاه با فیلدهای قیمت‌گذاری پیشرفته.",
		"products.add": "افزودن محصول",
		"products.colName": "نام",
		"products.colSku": "SKU",
		"products.colPrice": "قیمت",
		"products.colSale": "تخفیف",
		"products.colStock": "موجودی",
		"products.colWfcpPurchase": "خرید (wfcp)",
		"products.colImage": "تصویر",
		"products.colPurchase": "قیمت خرید",
		"products.colRetail": "خرده",
		"products.colInstallment": "اقساط",
		"products.colCredit": "اعتباری",
		"products.colWholesale": "عمده",
		"products.colDiscount": "تخفیف",
		"products.colBrand": "برند",
		"products.colCategories": "دسته‌ها",
		"products.colTags": "برچسب‌ها",
		"products.colDate": "تاریخ",
		"products.colViews": "بازدید",
		"products.colType": "نوع",
		"products.colMarketplaces": "بازارگاه",
		"products.colStatus": "وضعیت",
		"products.colActions": "عملیات",
		"products.searchPlaceholder": "جستجو با نام یا SKU",
		"products.filterCategory": "دسته",
		"products.filterBrand": "برند",
		"products.filterTag": "برچسب",
		"products.filterType": "نوع محصول",
		"products.filterStock": "وضعیت موجودی",
		"products.filterStatus": "وضعیت",
		"products.filterSort": "مرتب‌سازی",
		"products.filterDateFrom": "از تاریخ",
		"products.filterDateTo": "تا تاریخ",
		"products.filterAll": "همه",
		"products.applyFilters": "اعمال فیلتر",
		"products.resetFilters": "بازنشانی",
		"products.toggleColumns": "ستون‌ها",
		"products.foundCount": "{{count}} محصول یافت شد",
		"products.selectedCount": "{{count}} محصول انتخاب شده",
		"products.selectAll": "انتخاب همه محصولات",
		"products.selectProduct": "انتخاب {{name}}",
		"products.printWarehouseLabels": "چاپ لیبل انبار",
		"products.applyEnglishSlugs": "اعمال اسلاگ انگلیسی",
		"products.applyEnglishSlugsConfirm": "اسلاگ همهٔ محصولات (یا انتخاب‌شده‌ها) از نام انگلیسی ساخته می‌شود. اگر نام انگلیسی خالی باشد با هوش مصنوعی پر می‌شود. برای هر تغییر اسلاگ، ریدایرکت ۳۰۱ در Rank Math از لینک قدیم به جدید ثبت می‌شود.",
		"products.applyEnglishSlugsDone": "{{updated}} به‌روز، {{redirected}} ریدایرکت، {{skipped}} رد شده، {{failed}} ناموفق، {{remaining}} بدون نام انگلیسی مانده",
		"products.printWarehouseLabelsEmpty": "ابتدا یک یا چند محصول را انتخاب کنید.",
		"products.stockIn": "موجود",
		"products.stockOut": "ناموجود",
		"products.stockBackorder": "پیش‌سفارش",
		"products.statusPublish": "منتشر شده",
		"products.statusDraft": "پیش‌نویس",
		"products.statusPending": "در انتظار بررسی",
		"products.statusPrivate": "خصوصی",
		"products.sortDateDesc": "جدیدترین",
		"products.sortDateAsc": "قدیمی‌ترین",
		"products.sortNameAsc": "نام الف–ی",
		"products.sortNameDesc": "نام ی–الف",
		"products.sortPriceAsc": "قیمت کم به زیاد",
		"products.sortPriceDesc": "قیمت زیاد به کم",
		"products.typeGrouped": "گروهی",
		"products.typeExternal": "خارجی",
		"products.actionDuplicate": "کپی",
		"products.actionView": "مشاهده در سایت",
		"products.actionSendChannel": "ارسال به کانال",
		"products.actionSendBale": "ارسال به بله",
		"products.actionSendTelegram": "ارسال به تلگرام",
		"products.channelSyncOk": "محصول به کانال ارسال شد",
		"products.duplicateOk": "محصول کپی شد",
		"products.deleteConfirmTitle": "حذف محصول؟",
		"products.deleteConfirm": "«{{name}}» به سطل زباله منتقل شود؟",
		"products.status.publish": "منتشر شده",
		"products.status.draft": "پیش‌نویس",
		"products.status.pending": "در انتظار",
		"products.status.private": "خصوصی",
		"products.stockStatus.instock": "موجود",
		"products.stockStatus.outofstock": "ناموجود",
		"products.stockStatus.onbackorder": "پیش‌سفارش",
		"products.productType.simple": "ساده",
		"products.productType.variable": "متغیر",
		"products.productType.grouped": "گروهی",
		"products.productType.external": "خارجی",
		"products.editTitle": "ویرایش محصول",
		"products.newTitle": "محصول جدید",
		"products.fieldName": "نام",
		"products.fieldSku": "SKU",
		"products.fieldStatus": "وضعیت (draft/publish)",
		"products.fieldSale": "قیمت فروش ویژه",
		"products.fieldDescription": "توضیحات (نقد و بررسی)",
		"products.fieldShortDescription": "توضیح کوتاه",
		"products.fieldManageStock": "ردیابی موجودی",
		"products.fieldRegular": "قیمت عادی",
		"products.fieldStock": "موجودی",
		"products.wfcpSection": "WFCP",
		"products.fieldPurchase": "قیمت خرید",
		"products.fieldLockPrice": "قفل قیمت",
		"products.createDraft": "ایجاد پیش‌نویس",
		"products.untitled": "محصول بدون عنوان",
		"products.fieldType": "نوع محصول",
		"products.typeSimple": "ساده",
		"products.typeVariable": "متغیر",
		"products.catalogSection": "کاتالوگ (تصاویر، تاکسونومی، ویژگی‌ها)",
		"products.fieldImageId": "تصویر شاخص (شناسهٔ پیوست)",
		"products.fieldGalleryIds": "شناسه‌های تصاویر گالری",
		"products.galleryIdsHint": "شناسه‌های پیوست با ویرگول",
		"products.fieldWeight": "وزن",
		"products.fieldDimensions": "ابعاد (طول × عرض × ارتفاع)",
		"products.dimLength": "طول",
		"products.dimWidth": "عرض",
		"products.dimHeight": "ارتفاع",
		"products.fieldCategories": "دسته‌های محصول",
		"products.fieldBrands": "برندها",
		"products.noCategories": "دسته‌ای نیست.",
		"products.noBrands": "برندی نیست.",
		"products.fieldAttributes": "ویژگی‌های سفارشی",
		"products.attrNamePlaceholder": "نام (مثلاً رنگ)",
		"products.attrOptionsPlaceholder": "گزینه‌ها با ویرگول",
		"products.attrVisible": "نمایش در صفحهٔ محصول",
		"products.attrVariation": "برای متغیرها",
		"products.attrOrderConfig": "کانفیگ سفارش",
		"products.attrOrderConfigDefault": "پیش‌فرض",
		"products.attrOrderConfigHint": "روی PDP مثل تنوع سواچ می‌شود؛ قیمت را عوض نمی‌کند و با «برای متغیرها» هم‌زمان نیست.",
		"products.addAttributeRow": "افزودن ویژگی",
		"products.salePlaceholder": "خالی بگذارید اگر ندارید",
		"products.editor.titleSection": "عنوان محصول",
		"products.editor.namePlaceholder": "نام محصول را وارد کنید",
		"products.editor.slug": "نامک (slug)",
		"products.editor.slugPlaceholder": "مثال: blue-widget",
		"products.editor.slugHint": "نامک معمولاً به انگلیسی است و در آدرس محصول استفاده می‌شود.",
		"products.editor.permalink": "پیوند یکتا",
		"products.editor.permalinkEmpty": "پس از ذخیره، پیوند یکتا نمایش داده می‌شود.",
		"products.editor.editPermalink": "ویرایش",
		"products.editor.okPermalink": "تأیید",
		"products.editor.viewProduct": "مشاهده",
		"products.seo.panelTitle": "سئو",
		"products.seo.scoreHint": "امتیاز سئو: {{score}} از ۱۰۰",
		"products.seo.rankMathMissing": "افزونه سئو تشخیص داده نشد — داده همچنان ذخیره می‌شود",
		"products.seo.tabGeneral": "عمومی",
		"products.seo.tabAdvanced": "پیشرفته",
		"products.seo.tabSchema": "اسکیما",
		"products.seo.tabSocial": "شبکه‌های اجتماعی",
		"products.seo.focusKeyword": "کلمه کلیدی کانونی",
		"products.seo.focusKeywordPlaceholder": "مثلاً: ایرپاد تایگر",
		"products.seo.seoTitle": "عنوان سئو",
		"products.seo.metaDescription": "توضیحات متا",
		"products.seo.metaDescriptionPlaceholder": "توضیح کوتاه برای نتایج جستجو…",
		"products.seo.pillar": "محتوای سنگ‌بنا (Cornerstone)",
		"products.seo.pillarHint": "این صفحه را به‌عنوان محتوای اصلی موضوع علامت بزنید.",
		"products.seo.analysis": "تحلیل پایه سئو",
		"products.seo.checkFocusKeyword": "کلمه کلیدی کانونی تنظیم شده است",
		"products.seo.checkKeywordInTitle": "کلمه کلیدی در عنوان سئو هست",
		"products.seo.checkKeywordInDesc": "کلمه کلیدی در توضیحات متا هست",
		"products.seo.checkKeywordInUrl": "کلمه کلیدی در پیوند یکتا هست",
		"products.seo.checkKeywordInContent": "کلمه کلیدی در محتوای محصول هست",
		"products.seo.checkTitleLength": "طول عنوان سئو مناسب است (۱۰–۶۰)",
		"products.seo.checkDescLength": "طول توضیحات متا مناسب است (۷۰–۱۶۰)",
		"products.seo.robots": "دستورات ربات‌ها (Robots Meta)",
		"products.seo.canonical": "آدرس کنونیکال",
		"products.seo.breadcrumb": "عنوان بردکرامب",
		"products.seo.schemaType": "نوع اسکیما",
		"products.seo.schemaHint": "برای محصولات ووکامرس معمولاً product است.",
		"products.seo.gtin": "GTIN",
		"products.seo.mpn": "MPN",
		"products.seo.isbn": "ISBN",
		"products.seo.skuOverride": "SKU در اسکیما",
		"products.seo.brand": "برند در اسکیما",
		"products.seo.facebook": "فیسبوک / Open Graph",
		"products.seo.twitter": "توییتر",
		"products.seo.ogTitle": "عنوان",
		"products.seo.ogDescription": "توضیحات",
		"products.seo.ogImage": "تصویر",
		"products.seo.twitterCard": "نوع کارت توییتر",
		"products.ishop.panelTitle": "تنظیمات قالب فروشگاه",
		"products.ishop.panelHint": "فیلدهای اختصاصی قالب که روی صفحه محصول فروشگاه نمایش داده می‌شوند.",
		"products.ishop.englishName": "نام انگلیسی / مدل",
		"products.ishop.englishNamePlaceholder": "مثلاً Tiger Air2 Wireless Earbuds",
		"products.ishop.shippingTime": "زمان ارسال (روز)",
		"products.ishop.shippingTimeHint": "۰ یعنی «آماده ارسال».",
		"products.ishop.initialStock": "موجودی اولیه (نوار پیشنهاد)",
		"products.ishop.videoUrl": "آدرس ویدیو محصول",
		"products.ishop.videoCover": "کاور ویدیو",
		"products.ishop.labels": "برچسب‌های محصول",
		"products.ishop.label.check_purchase": "قابل خرید بصورت چک",
		"products.ishop.label.installment_purchase": "قابل خرید بصورت اقساطی",
		"products.ishop.label.credit_purchase": "قابل خرید بصورت اعتباری",
		"products.ishop.label.original_product": "کالای اصل",
		"products.ishop.label.non_original_product": "کالای غیراصل",
		"products.ishop.label.has_warranty": "دارای گارانتی",
		"products.ishop.customLabels": "برچسب‌های سفارشی",
		"products.ishop.addCustomLabel": "افزودن برچسب",
		"products.ishop.noCustomLabels": "برچسب سفارشی‌ای تعریف نشده است.",
		"products.ishop.customLabelText": "متن برچسب",
		"products.ishop.aiReviewSummary": "خلاصه نظرات (AI)",
		"products.ishop.aiReviewSummaryPlaceholder": "خلاصه تولیدشده برای نمایش در صفحه نظرات…",
		"products.ishop.faqs": "پرسش‌های متداول محصول",
		"products.ishop.addFaq": "افزودن پرسش",
		"products.ishop.noFaqs": "پرسشی ثبت نشده است.",
		"products.ishop.faqQuestion": "پرسش",
		"products.ishop.faqAnswer": "پاسخ",
		"products.editor.publishPanel": "انتشار",
		"products.editor.catalogVisibility": "نمایش در فروشگاه",
		"products.editor.visibilityVisible": "فروشگاه و جستجو",
		"products.editor.visibilityCatalog": "فقط فروشگاه",
		"products.editor.visibilitySearch": "فقط جستجو",
		"products.editor.visibilityHidden": "مخفی",
		"products.editor.featured": "محصول ویژه",
		"products.editor.imagesPanel": "تصاویر",
		"products.editor.coverImage": "تصویر کاور",
		"products.editor.gallery": "گالری",
		"products.editor.noGallery": "تصویری در گالری نیست.",
		"products.editor.addGalleryImage": "افزودن به گالری",
		"products.editor.dropImageHere": "تصویر را اینجا رها کنید یا کلیک کنید",
		"products.editor.dropGalleryHere": "تصاویر گالری را اینجا رها کنید یا کلیک کنید",
		"products.editor.uploadImage": "آپلود تصویر",
		"products.editor.uploading": "در حال آپلود…",
		"products.editor.uploadImageOk": "تصویر بارگذاری شد",
		"products.editor.uploadImagesOk": "{{count}} تصویر بارگذاری شد",
		"products.editor.invalidImageType": "فقط فایل تصویری مجاز است",
		"products.editor.moveUp": "بالا",
		"products.editor.moveDown": "پایین",
		"products.editor.tagsPanel": "برچسب‌ها",
		"products.editor.tagsPlaceholder": "جستجو یا افزودن برچسب…",
		"products.editor.shortDescPlaceholder": "توضیح کوتاه محصول…",
		"products.editor.descPlaceholder": "توضیحات کامل محصول…",
		"products.editor.tabs.content": "محتوا",
		"products.editor.tabs.pricing": "قیمت و موجودی",
		"products.editor.tabs.attributes": "ویژگی‌ها",
		"products.editor.tabs.coffee": "قهوه",
		"products.editor.tabs.seo": "سئو",
		"products.editor.tabs.advanced": "پیشرفته",
		"products.editor.taxonomySearch": "جستجوی دسته یا برند…",
		"products.editor.taxonomyNoMatch": "موردی یافت نشد.",
		"products.editor.pricingPanel": "قیمت‌گذاری",
		"products.editor.purchasePrice": "قیمت خرید",
		"products.editor.retailPrice": "قیمت تکی (خرده)",
		"products.editor.wholesalePrice": "قیمت عمده",
		"products.editor.installmentPrice": "قیمت اقساطی",
		"products.editor.creditPrice": "قیمت اعتباری",
		"products.editor.variablePricingHint": "قیمت فروش و قیمت خرید را برای هر ورییشن در بخش متغیرها تنظیم کنید.",
		"products.editor.shippingPanel": "حمل‌ونقل",
		"products.editor.inventoryPanel": "انبار",
		"products.editor.backorders": "پیش‌سفارش",
		"products.editor.backordersNo": "غیرفعال",
		"products.editor.backordersNotify": "مجاز با اطلاع",
		"products.editor.backordersYes": "مجاز",
		"products.editor.variableStockHint": "موجودی هر متغیر جداگانه تنظیم می‌شود.",
		"products.editor.relatedPanel": "محصولات مرتبط",
		"products.editor.upsell": "فروش افزوده (Upsell)",
		"products.editor.crossSell": "فروش متقابل (Cross-sell)",
		"products.editor.attributesPanel": "ویژگی‌ها",
		"products.editor.attributesOrderHint": "ترتیب این لیست بعد از ذخیرهٔ محصول در صفحهٔ فروشگاه نمایش داده می‌شود.",
		"products.editor.dragToReorder": "کشیدن برای جابه‌جایی",
		"products.editor.manageAttributes": "مدیریت ویژگی‌ها",
		"products.editor.addGlobalAttribute": "افزودن از ویژگی سراسری",
		"products.editor.createGlobalAttribute": "ایجاد ویژگی سراسری",
		"products.editor.globalOnlyHint": "ویژگی‌ها همیشه به‌صورت سراسری ووکامرس (با ترم) ذخیره می‌شوند.",
		"products.editor.legacyAttributeHint": "این ویژگی به ویژگی سراسری وصل نیست. حذف کنید و از لیست بالا اضافه کنید.",
		"products.editor.searchAttributes": "جستجوی ویژگی…",
		"products.editor.searchTerms": "جستجوی مقدار…",
		"products.editor.noAttributesSelected": "هنوز ویژگی‌ای انتخاب نشده. از بالا جستجو و اضافه کنید.",
		"products.editor.selectAttribute": "انتخاب ویژگی…",
		"products.editor.attributeGroupImport": "وارد کردن ویژگی گروهی",
		"products.editor.attributeGroupHint": "گروهی از ویژگی‌های سراسری بسازید و همان را روی هر محصول وارد کنید. مقادیر روی هر محصول جدا انتخاب می‌شود.",
		"products.editor.attributeGroupSelect": "گروه",
		"products.editor.attributeGroupSelectPlaceholder": "انتخاب گروه…",
		"products.editor.attributeGroupApply": "وارد کردن",
		"products.editor.attributeGroupSaveCurrent": "ذخیره ویژگی‌های فعلی به‌عنوان گروه",
		"products.editor.attributeGroupName": "نام گروه",
		"products.editor.attributeGroupSave": "ذخیره به‌عنوان گروه",
		"products.editor.attributeGroupManage": "گروه‌ها",
		"products.editor.attributeGroupNew": "گروه جدید",
		"products.editor.attributeGroupEdit": "ویرایش گروه",
		"products.editor.attributeGroupPick": "ویژگی‌های گروه",
		"products.editor.attributeGroupEmpty": "هنوز گروهی ساخته نشده.",
		"products.editor.attributeGroupNoAttrs": "این گروه ویژگی‌ای ندارد.",
		"products.editor.attributeGroupSaved": "گروه ذخیره شد.",
		"products.editor.attributeGroupImported": "{{count}} ویژگی وارد شد.",
		"products.editor.attributeGroupNothingToAdd": "همهٔ ویژگی‌های این گروه از قبل روی محصول هستند.",
		"products.editor.variationsPanel": "متغیرها",
		"products.editor.saveBeforeVariations": "ابتدا محصول را ذخیره کنید تا بتوانید متغیرها را مدیریت کنید.",
		"products.editor.variationsHint": "پس از تعریف ویژگی‌های «برای متغیرها»، متغیرها را اضافه کنید.",
		"products.editor.needVariationAttrs": "برای ساخت تنوع‌ها، حداقل یک ویژگی با تیک «برای متغیرها» و مقدار انتخاب‌شده ذخیره کنید.",
		"products.editor.variationsWfcpHint": "قیمت خرید را روی هر ورییشن تنظیم کنید (همان webina-woo-core). قیمت خرده‌فروشی و اقساط خودکار محاسبه می‌شود.",
		"products.editor.variationAttrs": "ویژگی‌ها",
		"products.editor.videoSection": "ویدیو محصول",
		"products.lockPrice": "قفل قیمت",
		"products.editor.noVariations": "متغیری تعریف نشده است.",
		"products.editor.defaultVariation": "تنوع پیش‌فرض",
		"products.editor.selectAttributeValue": "انتخاب مقدار…",
		"products.editor.variationAttrsRequired": "برای هر ویژگی متغیر یک مقدار انتخاب کنید.",
		"products.editor.orphanVariation": "بدون ویژگی · #{{id}}",
		"products.editor.orphanVariationHint": "مقادیر ویژگی را پایین انتخاب کنید و ذخیره بزنید تا این تنوع شناسایی شود.",
		"products.editor.addVariation": "افزودن متغیر",
		"products.editor.autosaving": "در حال ذخیره…",
		"products.editor.autosaved": "ذخیره شد",
		"products.editor.bulkVariations": "اعمال روی همه متغیرها",
		"products.editor.bulkVariationsHint": "فقط فیلدهای تیک‌خورده روی همه متغیرهای فعلی نوشته می‌شوند. فیلد خالیِ بدون تیک بقیه را پاک نمی‌کند.",
		"products.editor.bulkApply": "اعمال روی همه",
		"products.editor.bulkConfirmTitle": "همه متغیرها به‌روز شوند؟",
		"products.editor.bulkConfirmBody": "مقادیر انتخاب‌شدهٔ قیمت و موجودی روی همه متغیرهای فعلی این محصول بازنویسی می‌شود.",
		"products.editor.bulkUpdated": "{{count}} متغیر به‌روز شد.",
		"products.editor.bulkNeedField": "دست‌کم یک فیلد را برای اعمال انتخاب کنید.",
		"products.editor.generateAll": "ساخت همه تنوع‌ها",
		"products.editor.deleteAllVariations": "حذف همه تنوع‌ها",
		"products.editor.deleteAllVariationsTitle": "همه تنوع‌ها حذف شوند؟",
		"products.editor.deleteAllVariationsBody": "همهٔ تنوع‌های این محصول برای همیشه حذف می‌شوند. بعد از آن می‌توانید فقط بر اساس ویژگی‌های باقی‌مانده (مثلاً وزن) دوباره بسازید.",
		"products.editor.deleteAllVariationsDone": "{{count}} تنوع حذف شد.",
		"products.editor.generateConfirmTitle": "همه ترکیب‌های ویژگی ساخته شوند؟",
		"products.editor.generateConfirmBody": "{{total}} ترکیب ممکن است؛ {{existing}} از قبل وجود دارد و {{missing}} ساخته می‌شود. قیمت کپی نمی‌شود — بعداً با «اعمال روی همه» تنظیم کنید.",
		"products.editor.generateDone": "{{count}} تنوع ساخته شد.",
		"products.editor.typeLockedHint": "به‌دلیل وجود متغیر، نوع محصول قابل تغییر نیست.",
		"brands.title": "برندها",
		"brands.newName": "نام برند",
		"brands.add": "افزودن برند",
		"brands.newTitle": "برند جدید",
		"brands.editTitle": "ویرایش برند",
		"brands.colName": "نام",
		"brands.colSlug": "نامک",
		"brands.colImage": "تصویر",
		"brands.colParent": "والد",
		"brands.colCount": "محصولات",
		"brands.colViews": "بازدید",
		"brands.colActions": "عملیات",
		"brands.searchPlaceholder": "جستجوی برند…",
		"brands.filterParent": "برند والد",
		"brands.filterParentNone": "بدون والد (سطح بالا)",
		"brands.filterParentRoot": "فقط سطح بالا",
		"brands.filterAll": "همه",
		"brands.toggleColumns": "ستون‌ها",
		"brands.foundCount": "{{count}} برند یافت شد",
		"brands.fieldName": "نام",
		"brands.fieldNameHint": "نامی که در وب‌گاه نمایش داده می‌شود.",
		"brands.fieldSlug": "نامک",
		"brands.fieldSlugHint": "نسخهٔ URL-friendly نام؛ معمولاً با حروف کوچک و خط تیره.",
		"brands.fieldParent": "برند والد",
		"brands.fieldParentHint": "برندها می‌توانند برای سلسله‌مراتب والد داشته باشند.",
		"brands.fieldDescription": "توضیحات",
		"brands.fieldDescriptionHint": "اختیاری؛ برخی پوسته‌ها در آرشیو برند نمایش می‌دهند.",
		"brands.fieldThumbnail": "تصویر بندانگشتی",
		"brands.fieldThumbnailHint": "لوگو یا تصویر بندانگشتی برند.",
		"brands.actionEdit": "ویرایش",
		"brands.actionView": "مشاهده در سایت",
		"brands.deleteConfirmTitle": "حذف برند؟",
		"brands.deleteConfirm": "«{{name}}» حذف شود؟ محصولات از این برند جدا می‌شوند.",
		"productCats.title": "دسته محصول",
		"productCats.add": "افزودن دسته",
		"productCats.newTitle": "دستهٔ جدید",
		"productCats.editTitle": "ویرایش دسته",
		"productCats.colName": "نام",
		"productCats.colSlug": "نامک",
		"productCats.colImage": "تصویر",
		"productCats.colParent": "والد",
		"productCats.colCount": "تعداد",
		"productCats.colViews": "بازدید",
		"productCats.colActions": "عملیات",
		"productCats.searchPlaceholder": "جستجوی دسته…",
		"productCats.filterParent": "دستهٔ والد",
		"productCats.filterParentNone": "بدون والد (سطح بالا)",
		"productCats.filterParentRoot": "فقط سطح بالا",
		"productCats.filterAll": "همه",
		"productCats.toggleColumns": "ستون‌ها",
		"productCats.foundCount": "{{count}} دسته یافت شد",
		"productCats.fieldName": "نام",
		"productCats.fieldNameHint": "نامی که در وب‌گاه نمایش داده می‌شود.",
		"productCats.fieldSlug": "نامک",
		"productCats.fieldSlugHint": "نسخهٔ URL-friendly نام؛ معمولاً با حروف کوچک و خط تیره.",
		"productCats.fieldParent": "دستهٔ والد",
		"productCats.fieldParentHint": "دسته‌ها می‌توانند برای سلسله‌مراتب والد داشته باشند.",
		"productCats.fieldDescription": "توضیحات",
		"productCats.fieldDescriptionHint": "اختیاری؛ برخی پوسته‌ها در آرشیو دسته نمایش می‌دهند.",
		"productCats.fieldThumbnail": "تصویر بندانگشتی",
		"productCats.fieldThumbnailHint": "تصویر بندانگشتی دسته.",
		"productCats.actionEdit": "ویرایش",
		"productCats.actionView": "مشاهده در سایت",
		"productCats.deleteConfirmTitle": "حذف دسته؟",
		"productCats.deleteConfirm": "«{{name}}» حذف شود؟ محصولات از این دسته جدا می‌شوند.",
		"attributes.title": "ویژگی‌های محصول",
		"attributes.description": "مدیریت ویژگی‌های سراسری محصول و مقادیر آن‌ها.",
		"attributes.listHint": "ویژگی‌های سراسری بین محصولات مشترک‌اند و برای متغیرها استفاده می‌شوند.",
		"attributes.newButton": "ویژگی جدید",
		"attributes.newTitle": "ویژگی جدید",
		"attributes.newDescription": "ویژگی سراسری بسازید، سپس مقدار (گزینه) اضافه کنید.",
		"attributes.editTitle": "ویرایش ویژگی",
		"attributes.sectionDetails": "تنظیمات ویژگی",
		"attributes.colName": "برچسب",
		"attributes.colSlug": "نامک",
		"attributes.colType": "نوع",
		"attributes.colTerms": "تعداد مقدار",
		"attributes.emptyHint": "ویژگیٔ سراسری یافت نشد.",
		"attributes.deleteConfirmTitle": "حذف ویژگی؟",
		"attributes.deleteConfirmBody": "ویژگی و همهٔ مقادیرش حذف می‌شوند. محصولات مرتبط ممکن است بدون مقدار بمانند.",
		"attributes.field.label": "برچسب",
		"attributes.field.slug": "نامک",
		"attributes.field.type": "نوع",
		"attributes.field.orderBy": "مرتب‌سازی پیش‌فرض",
		"attributes.field.hasArchives": "فعال‌سازی آرشیو",
		"attributes.type.select": "دراپ‌داون",
		"attributes.type.text": "متن",
		"attributes.type.color": "رنگ",
		"attributes.type.image": "تصویر",
		"attributes.type.button": "برچسب",
		"attributes.typeHint.select": "لیست کشویی کلاسیک",
		"attributes.typeHint.color": "دایره‌های رنگی",
		"attributes.typeHint.image": "مربع عکس",
		"attributes.typeHint.button": "برچسب متنی",
		"attributes.typeHint.text": "متن آزاد",
		"attributes.showSwatchLabel": "نمایش نام زیر هر رنگ/عکس",
		"attributes.showSwatchLabelHint": "اگر خاموش باشد نام فقط در راهنمای ماوس و برای صفحه‌خوان می‌آید.",
		"attributes.preview.red": "قرمز",
		"attributes.preview.white": "سفید",
		"attributes.preview.navy": "سرمه‌ای",
		"attributes.preview.addImages": "برای پیش‌نمایش زنده، تصویر اضافه کنید.",
		"attributes.orderBy.menu_order": "ترتیب سفارشی",
		"attributes.orderBy.name": "نام",
		"attributes.orderBy.name_num": "نام (عددی)",
		"attributes.orderBy.id": "شناسه مقدار",
		"attributes.terms.title": "مقادیر (گزینه‌ها)",
		"attributes.terms.add": "افزودن مقدار",
		"attributes.terms.addTitle": "افزودن مقدار",
		"attributes.terms.editTitle": "ویرایش مقدار",
		"attributes.terms.name": "نام",
		"attributes.terms.slug": "نامک",
		"attributes.terms.description": "توضیح",
		"attributes.terms.menuOrder": "ترتیب",
		"attributes.terms.color": "رنگ",
		"attributes.terms.colorPlaceholder": "#ff0000",
		"attributes.terms.image": "تصویر",
		"attributes.terms.noImage": "بدون تصویر",
		"attributes.terms.selectImage": "انتخاب تصویر",
		"attributes.terms.uploadImage": "آپلود تصویر",
		"attributes.terms.empty": "هنوز مقداری نیست.",
		"attributes.terms.colCount": "محصولات",
		"attributes.terms.deleteConfirmTitle": "حذف مقدار؟",
		"attributes.terms.deleteConfirmBody": "محصولاتی که از این مقدار استفاده می‌کنند به‌روز می‌شوند.",
		"orders.title": "سفارشات",
		"orders.detailTitle": "سفارش {{id}}",
		"orders.colNumber": "سفارش",
		"orders.colCustomer": "مشتری",
		"orders.colStatus": "وضعیت",
		"orders.colTotal": "جمع",
		"orders.colDate": "تاریخ",
		"orders.status": "وضعیت",
		"orders.total": "جمع",
		"orders.newStatus": "وضعیت جدید",
		"orders.applyStatus": "اعمال وضعیت",
		"orders.wcStatus.pending": "در انتظار",
		"orders.wcStatus.processing": "در حال پردازش",
		"orders.wcStatus.on-hold": "معلق",
		"orders.wcStatus.completed": "تکمیل‌شده",
		"orders.wcStatus.cancelled": "لغوشده",
		"orders.wcStatus.refunded": "بازپرداخت‌شده",
		"orders.emptyHint": "هنوز سفارشی نیست. سفارش‌های فروشگاه اینجا نمایش داده می‌شوند.",
		"orders.detailNotFound": "بارگذاری سفارش ناموفق بود.",
		"orders.sectionTotals": "جمع و پرداخت",
		"orders.sectionBilling": "صورتحساب",
		"orders.sectionShipping": "ارسال",
		"orders.addrName": "نام",
		"orders.addrCompany": "شرکت",
		"orders.addrEmail": "ایمیل",
		"orders.addrPhone": "تلفن",
		"orders.addrState": "استان",
		"orders.addrCity": "شهر",
		"orders.addrStreet": "آدرس",
		"orders.addrPostcode": "کد پستی",
		"orders.paymentMethod": "روش پرداخت",
		"orders.itemMeta.wfcp_purchase_type": "نوع خرید",
		"orders.purchaseType.cash": "نقدی",
		"orders.purchaseType.credit": "اعتباری",
		"orders.purchaseType.installment": "اقساطی",
		"orders.purchaseType.wholesale": "عمده",
		"orders.orderDate": "تاریخ سفارش",
		"orders.customerNote": "یادداشت مشتری",
		"orders.itemsDetail": "اقلام",
		"orders.colSku": "SKU",
		"orders.colSubtotal": "جمع ردیف",
		"orders.colTotalLine": "مبلغ",
		"orders.shippingLine": "هزینه ارسال",
		"orders.subtotalOrder": "جمع اقلام",
		"orders.listDescription": "مدیریت سفارش‌های فروشگاه با فیلتر، جستجو و عملیات دسته‌جمعی.",
		"orders.myOrdersTitle": "سفارش‌های من",
		"orders.myOrdersDescription": "سفارش‌هایی که با این حساب ثبت شده‌اند.",
		"orders.tabAll": "همه",
		"orders.searchPlaceholder": "جستجو بر اساس شماره، نام، ایمیل یا تلفن…",
		"orders.dateFrom": "از تاریخ",
		"orders.dateTo": "تا تاریخ",
		"orders.totalCount": "{{count}} سفارش",
		"orders.selectedCount": "{{count}} انتخاب‌شده",
		"orders.colShipTo": "ارسال به",
		"orders.colSource": "مبدا",
		"orders.openMaps": "نقشه",
		"orders.selectAll": "انتخاب همه",
		"orders.selectOrder": "انتخاب سفارش {{number}}",
		"orders.bulkActions": "عملیات دسته‌جمعی",
		"orders.bulkChangeStatus": "تغییر وضعیت",
		"orders.bulkSendEmail": "ارسال ایمیل",
		"orders.bulkTrash": "انتقال به زباله‌دان",
		"orders.bulkDelete": "حذف دائمی",
		"orders.bulkApply": "اعمال",
		"orders.bulkDone": "{{ok}} موفق، {{failed}} ناموفق",
		"orders.bulkConfirmTitle": "تأیید عملیات",
		"orders.bulkConfirmBody": "{{count}} سفارش — {{action}}؟",
		"orders.bulk_trash": "انتقال به زباله‌دان",
		"orders.bulk_delete": "حذف دائمی",
		"orders.bulkEmailInvoice": "فاکتور مشتری",
		"orders.bulkEmailProcessing": "ایمیل در حال پردازش",
		"orders.bulkEmailCompleted": "ایمیل تکمیل‌شده",
		"orders.bulkEmailOnHold": "ایمیل معلق",
		"orders.wcStatus.pws-packaged": "بسته‌بندی‌شده",
		"orders.wcStatus.pws-courier": "پیک",
		"orders.wcStatus.failed": "ناموفق",
		"orders.detailTitleNumber": "سفارش #{{number}}",
		"orders.sectionGeneral": "عمومی",
		"orders.paidVia": "پرداخت به وسیله {{method}}",
		"orders.customerIp": "IP مشتری",
		"orders.notEditable": "این سفارش دیگر قابل ویرایش نیست.",
		"orders.customer": "مشتری",
		"orders.guestCustomer": "مهمان",
		"orders.shippingMethod": "روش ارسال",
		"orders.nationalId": "کد ملی",
		"orders.checkoutPhone": "تلفن ثبت سفارش",
		"orders.discount": "تخفیف",
		"orders.printInvoice": "چاپ فاکتور",
		"orders.printLabel": "چاپ لیبل پستی",
		"orders.printReceipt": "چاپ رسید",
		"orders.printPacking": "چاپ برگه انبار",
		"orders.printCustomerLabel": "چاپ برچسب مشتری",
		"orders.printStoreLabel": "چاپ برچسب فروشگاه",
		"orders.printNewLabels": "چاپ لیبل سفارش‌های جدید",
		"orders.printNewLabelsEmpty": "سفارش پردازش‌شده یا در انتظار بدون لیبل چاپ‌نشده پیدا نشد.",
		"orders.panelTracking": "رهگیری پست",
		"orders.trackingCode": "کد رهگیری",
		"orders.trackingProvider": "ارائه‌دهنده",
		"orders.trackingLink": "پیگیری مرسوله",
		"orders.deliverySlot": "زمان تحویل",
		"orders.panelDigipay": "دیجی‌پی",
		"orders.digipayTransaction": "شناسه تراکنش",
		"orders.digipayType": "نوع تراکنش",
		"orders.digipayTrackingCode": "کد رهگیری",
		"orders.digipayProviderId": "شناسه تامین‌کننده",
		"orders.digipayGateway": "درگاه",
		"orders.digipayDelivered": "تحویل به دیجی‌پی",
		"digipay.settingsTitle": "تنظیمات دیجی‌پی",
		"digipay.settingsSubtitle": "تنظیمات اتصال، محیط اجرا و لاگ تراکنش‌های DigiPay UPG.",
		"digipay.transactionsTitle": "تراکنش‌های دیجی‌پی",
		"digipay.testConnection": "تست اتصال",
		"digipay.testSuccess": "اتصال با موفقیت برقرار شد",
		"digipay.environment": "محیط اجرا",
		"digipay.env.staging": "استیجینگ",
		"digipay.env.live": "عملیاتی",
		"digipay.col.time": "زمان",
		"digipay.col.order": "سفارش",
		"digipay.col.endpoint": "اندپوینت",
		"digipay.col.status": "وضعیت",
		"digipay.col.message": "پیام",
		"digipay.status.ok": "موفق",
		"digipay.status.failed": "ناموفق",
		"digipay.field.version": "نسخه دیجی‌پی",
		"digipay.field.clientId": "شناسه کلاینت",
		"digipay.field.clientSecret": "سکرت کلاینت",
		"digipay.field.username": "نام کاربری",
		"digipay.field.password": "رمز عبور",
		"digipay.field.sellerId": "شناسه فروشنده",
		"digipay.field.supplierId": "شناسه تأمین‌کننده",
		"digipay.field.categoryId": "شناسه دسته",
		"digipay.field.productType": "نوع محصول",
		"orders.panelAttribution": "مبدأ سفارش",
		"orders.attrSource": "منبع",
		"orders.attrDevice": "دستگاه",
		"orders.attrSessions": "تعداد نشست",
		"orders.attrUtmSource": "منبع UTM",
		"orders.attrUtmMedium": "رسانه UTM",
		"orders.attrUtmCampaign": "کمپین UTM",
		"orders.attrSourceType.organic": "ارگانیک",
		"orders.attrSourceType.referral": "ارجاع",
		"orders.attrSourceType.typein": "مستقیم",
		"orders.attrSourceType.utm": "UTM",
		"orders.attrSourceType.admin": "مدیریت",
		"orders.attrSourceType.direct": "مستقیم",
		"orders.attrSourceType.paid": "پولی",
		"orders.attrSourceType.social": "شبکه اجتماعی",
		"orders.attrDeviceType.mobile": "موبایل",
		"orders.attrDeviceType.desktop": "دسکتاپ",
		"orders.attrDeviceType.tablet": "تبلت",
		"orders.createdVia.system": "سیستم",
		"orders.createdVia.checkout": "تسویه حساب",
		"orders.createdVia.admin": "مدیریت",
		"orders.createdVia.rest-api": "رابط REST",
		"orders.createdVia.store-api": "رابط فروشگاه",
		"orders.noteAddedBy.system": "سیستم",
		"orders.noteAddedBy.checkout": "تسویه حساب",
		"orders.noteAddedBy.admin": "مدیریت",
		"orders.panelNotes": "یادداشت‌ها",
		"orders.noNotes": "یادداشتی نیست.",
		"orders.notePlaceholder": "یادداشت جدید…",
		"orders.noteToCustomer": "یادداشت به مشتری",
		"orders.addNote": "افزودن یادداشت",
		"orders.noteAdded": "یادداشت افزوده شد",
		"orders.panelCustomerHistory": "سوابق مشتری",
		"orders.historyOrders": "تعداد سفارش",
		"orders.historyRevenue": "مجموع خرید",
		"orders.historyAov": "میانگین سفارش",
		"orders.stats.orders": "سفارش‌ها",
		"orders.stats.revenue": "فروش",
		"orders.stats.aov": "میانگین سفارش",
		"orders.stats.processing": "در حال پردازش",
		"orders.stats.completed": "تکمیل‌شده",
		"orders.stats.pending": "معلق",
		"orders.colState": "استان",
		"orders.colPayment": "درگاه",
		"orders.colUtm": "UTM",
		"orders.filterAll": "همه",
		"orders.filterPayment": "درگاه پرداخت",
		"orders.filterState": "استان",
		"orders.filterShipping": "روش ارسال",
		"orders.filterMarketplace": "مارکت‌پلیس",
		"orders.filterUtmSource": "منبع UTM",
		"orders.filterUtmMedium": "رسانه UTM",
		"orders.filterUtmCampaign": "کمپین UTM",
		"orders.filterCustomer": "مشتری",
		"orders.filterCustomerRole": "نقش مشتری",
		"orders.filterCustomerHint": "شناسه کاربر، ایمیل یا تلفن",
		"orders.filterMinTotal": "حداقل مبلغ",
		"orders.filterMaxTotal": "حداکثر مبلغ",
		"orders.shippingFree": "رایگان",
		"orders.sectionAddress": "آدرس",
		"orders.contact.call": "تماس",
		"orders.contact.sms": "پیامک",
		"orders.contact.whatsapp": "واتساپ",
		"orders.contact.eitaa": "ایتا",
		"orders.contact.bale": "بله",
		"orders.contact.baleUnavailable": "بات بله متصل نیست",
		"orders.contact.telegram": "تلگرام",
		"orders.contact.telegramUnavailable": "بات تلگرام متصل نیست",
		"orders.contact.openUser": "مشاهده کاربر",
		"orders.panelSmsHistory": "تاریخچه پیامک",
		"orders.smsHistoryEmpty": "پیامکی برای این سفارش ثبت نشده.",
		"orders.smsStatus.delivered": "رسیده",
		"orders.smsStatus.failed": "ناموفق",
		"orders.sms.manual": "دستی",
		"orders.customerOrdersList": "سفارش‌ها",
		"orders.selectShippingMethod": "انتخاب روش ارسال",
		"orders.trackingProviderOther": "سایر",
		"orders.postBarcode": "بارکد پست",
		"orders.panelCustomerProfile": "پروفایل مشتری",
		"products.stats.total": "محصولات",
		"products.stats.publish": "منتشرشده",
		"products.stats.draft": "پیش‌نویس",
		"products.stats.outofstock": "ناموجود",
		"products.stats.instock": "موجود",
		"coupons.stats.total": "کوپن‌ها",
		"coupons.stats.active": "فعال",
		"users.stats.total": "کاربران",
		"users.stats.customers": "مشتریان",
		"users.stats.partners": "همکاران",
		"pages.emptyHint": "هنوز برگه‌ای نیست. یک برگه بسازید.",
		"coupons.emptyList": "هنوز کوپنی نیست. یک کد تخفیف بسازید.",
		"coupons.codePlaceholder": "کد",
		"brands.emptyHint": "برندی با این فیلترها یافت نشد.",
		"categories.emptyHint": "هنوز دسته‌ای نیست. در بالا اضافه کنید.",
		"productCats.emptyHint": "دسته‌ای با این فیلترها یافت نشد.",
		"reports.emptyHint": "داده‌ای برای این بازه نیست.",
		"comments.emptyQueue": "دیدگاه در انتظار تأیید نیست.",
		"users.emptyListHint": "کاربری برای این سایت برنگشت.",
		"reports.title": "گزارش فروش",
		"reports.description": "درآمد بازهٔ انتخابی.",
		"reports.revenue": "درآمد",
		"reports.orders": "تعداد سفارش",
		"reports.period30d": "۳۰ روز اخیر",
		"reports.descriptionFull": "گزارش کامل فروش، سفارشات و روندها با مقایسه دوره قبل.",
		"reports.dateFrom": "از تاریخ",
		"reports.dateTo": "تا تاریخ",
		"reports.interval": "بازهٔ نمودار",
		"reports.intervalDay": "روزانه",
		"reports.intervalWeek": "هفتگی",
		"reports.intervalMonth": "ماهانه",
		"reports.comparePrevious": "مقایسه با دوره قبل",
		"reports.comparePeriod": "دوره قبل",
		"reports.statusFilter": "وضعیت سفارش",
		"reports.exportCsv": "خروجی CSV",
		"reports.deltaNew": "جدید",
		"reports.preset.today": "امروز",
		"reports.preset.yesterday": "دیروز",
		"reports.preset.last7": "۷ روز",
		"reports.preset.last30": "۳۰ روز",
		"reports.preset.thisWeek": "این هفته",
		"reports.preset.lastWeek": "هفته قبل",
		"reports.preset.thisMonth": "این ماه",
		"reports.preset.lastMonth": "ماه قبل",
		"reports.preset.thisYear": "امسال",
		"reports.preset.custom": "سفارشی",
		"reports.status.completed": "تکمیل‌شده",
		"reports.status.processing": "در حال پردازش",
		"reports.status.on-hold": "در انتظار",
		"reports.status.pending": "در انتظار پرداخت",
		"reports.status.cancelled": "لغو شده",
		"reports.status.refunded": "استرداد شده",
		"reports.status.failed": "ناموفق",
		"reports.kpi.revenue": "درآمد ناخالص",
		"reports.kpi.netRevenue": "درآمد خالص",
		"reports.kpi.orders": "تعداد سفارش",
		"reports.kpi.aov": "میانگین سفارش",
		"reports.kpi.itemsSold": "اقلام فروخته‌شده",
		"reports.kpi.discounts": "تخفیف‌ها",
		"reports.kpi.shipping": "حمل‌ونقل",
		"reports.kpi.tax": "مالیات",
		"reports.kpi.refunds": "مبلغ استرداد",
		"reports.kpi.refundCount": "تعداد استرداد",
		"reports.kpi.cogs": "بهای تمام‌شده (COGS)",
		"reports.kpi.grossProfit": "سود ناخالص",
		"reports.kpi.grossMargin": "حاشیه سود",
		"reports.kpi.missingCost": "اقلام بدون قیمت خرید",
		"reports.chart.revenueOrders": "درآمد و سفارش در زمان",
		"reports.chart.profit": "درآمد، COGS و سود در زمان",
		"reports.chart.byPriceTier": "بر اساس نوع قیمت",
		"reports.chart.heatmap": "نقشه حرارتی سفارش (روز × ساعت)",
		"reports.chart.byStatus": "بر اساس وضعیت",
		"reports.chart.byPayment": "روش پرداخت",
		"reports.chart.bySource": "منبع سفارش",
		"reports.chart.byHour": "ساعات روز",
		"reports.table.topProducts": "محصولات برتر",
		"reports.table.topCategories": "دسته‌های برتر",
		"reports.table.topCustomers": "مشتریان برتر",
		"reports.table.product": "محصول",
		"reports.table.category": "دسته",
		"reports.table.customer": "مشتری",
		"reports.table.quantity": "تعداد",
		"reports.table.cogs": "COGS",
		"reports.table.profit": "سود",
		"reports.table.margin": "حاشیه",
		"reports.table.topProductsProfit": "محصولات برتر بر اساس سود",
		"reports.table.missingCostQty": "{{count}} بدون قیمت خرید",
		"reports.tier.retail": "خرده (نقد)",
		"reports.tier.credit": "اعتباری",
		"reports.tier.installment": "اقساطی",
		"reports.tier.wholesale": "عمده",
		"reports.heatmap.dow.0": "یکشنبه",
		"reports.heatmap.dow.1": "دوشنبه",
		"reports.heatmap.dow.2": "سه‌شنبه",
		"reports.heatmap.dow.3": "چهارشنبه",
		"reports.heatmap.dow.4": "پنج‌شنبه",
		"reports.heatmap.dow.5": "جمعه",
		"reports.heatmap.dow.6": "شنبه",
		"reports.heatmap.hour": "ساعت {{hour}}",
		"reports.heatmap.legendMin": "کمتر",
		"reports.heatmap.legendMax": "بیشتر",
		"reports.wfcpDisabledHint": "WFCP غیرفعال",
		"reports.cogsApproxHint": "قیمت خرید از متای فعلی محصول است، نه snapshot زمان سفارش.",
		"coupons.title": "کدهای تخفیف",
		"coupons.create": "کوپن جدید",
		"coupons.amount": "مبلغ",
		"coupons.submitCreate": "ایجاد",
		"coupons.editSelected": "ویرایش انتخاب‌شده",
		"coupons.pickRow": "یک ردیف از جدول انتخاب کنید.",
		"coupons.colCode": "کد",
		"coupons.colAmount": "مبلغ",
		"coupons.colType": "نوع",
		"coupons.colExpiry": "انقضا",
		"coupons.colUsage": "مصرف",
		"coupons.fieldDescription": "توضیحات",
		"coupons.fieldExpires": "انقضا (YYYY-MM-DD یا خالی)",
		"coupons.fieldMinAmount": "حداقل خرید",
		"coupons.fieldMaxAmount": "حداکثر خرید",
		"coupons.fieldUsageLimit": "حد مصرف (خالی = نامحدود)",
		"coupons.individualUse": "یک کوپن در سبد",
		"coupons.freeShipping": "ارسال رایگان",
		"coupons.excludeSale": "عدم اعمال روی محصولات حراج",
		"coupons.addCoupon": "افزودن کد تخفیف",
		"coupons.newTitle": "افزودن کوپن جدید",
		"coupons.editTitle": "ویرایش کوپن",
		"coupons.colDescription": "توضیحات",
		"coupons.colProductIds": "شناسه‌های محصول",
		"coupons.colActions": "عملیات",
		"coupons.selectAll": "انتخاب همه",
		"coupons.selectedCount": "{{count}} مورد انتخاب شده",
		"coupons.searchPlaceholder": "جستجوی کد کوپن…",
		"coupons.bulkTrash": "انتقال به زباله‌دان",
		"coupons.bulkConfirmTitle": "انتقال کوپن‌ها به زباله‌دان؟",
		"coupons.bulkConfirmBody": "{{count}} کوپن به زباله‌دان منتقل شود؟",
		"coupons.bulkDone": "{{ok}} موفق، {{failed}} ناموفق",
		"coupons.trashConfirmTitle": "انتقال به زباله‌دان؟",
		"coupons.trashConfirmBody": "کوپن «{{code}}» به زباله‌دان منتقل شود؟",
		"coupons.trashed": "به زباله‌دان منتقل شد",
		"coupons.actionEdit": "ویرایش",
		"coupons.actionTrash": "انتقال به زباله‌دان",
		"coupons.generateCode": "ساخت کد تخفیف",
		"coupons.sectionCode": "کد تخفیف",
		"coupons.sectionGeneral": "اطلاعات کوپن",
		"coupons.sectionUsage": "محدودیت استفاده",
		"coupons.sectionRestrictions": "محدودیت‌های دسترسی",
		"coupons.fieldDiscountType": "نحوه تخفیف",
		"coupons.usageLimitPerUser": "محدودیت مصرف برای هر کاربر",
		"coupons.productsInclude": "محصولات",
		"coupons.productsExclude": "به جز این محصولات",
		"coupons.categoriesInclude": "دسته‌های محصولات",
		"coupons.categoriesExclude": "به جز این دسته‌ها",
		"coupons.brandsInclude": "برندهای محصول",
		"coupons.brandsExclude": "به جز این برندها",
		"coupons.allowedEmails": "ایمیل‌های مجاز",
		"coupons.allowedEmailsHint": "هر ایمیل در یک خط (یا با کاما جدا)",
		"coupons.productSearchPlaceholder": "جستجوی محصول…",
		"coupons.noProductsFound": "محصولی یافت نشد",
		"coupons.restrict.allowedUsers": "کاربران مجاز",
		"coupons.restrict.allowedUsersHint": "خالی = همه کاربران. جستجو با نام، تلفن یا کد ملی.",
		"coupons.restrict.userSearchPlaceholder": "جستجوی نام، تلفن، کد ملی…",
		"coupons.restrict.noUsersFound": "کاربری یافت نشد",
		"coupons.restrict.states": "استان‌ها",
		"coupons.restrict.statesHint": "خالی = همه استان‌ها",
		"coupons.restrict.cities": "شهرها",
		"coupons.restrict.citiesHint": "ابتدا استان را انتخاب کنید. خالی = همه شهرهای استان‌های انتخاب‌شده",
		"coupons.restrict.noStates": "استانی موجود نیست",
		"coupons.restrict.noCities": "شهری برای استان‌های انتخاب‌شده نیست",
		"coupons.restrict.paymentMethods": "درگاه‌های پرداخت",
		"coupons.restrict.paymentMethodsHint": "خالی = همه درگاه‌ها",
		"coupons.restrict.noPayments": "درگاهی موجود نیست",
		"coupons.restrict.purchaseTypes": "نوع خرید",
		"coupons.restrict.purchaseTypesHint": "نقدی، اقساطی، اعتباری… خالی = همه انواع",
		"coupons.restrict.noPurchaseTypes": "نوع خریدی موجود نیست",
		"coupons.restrict.shippingMethods": "روش‌های ارسال",
		"coupons.restrict.shippingMethodsHint": "خالی = همه روش‌های ارسال",
		"coupons.restrict.noShipping": "روش ارسالی موجود نیست",
		"coupons.restrict.channels": "کانال فروش",
		"coupons.restrict.channelsHint": "خالی = سایت و همه ربات‌ها",
		"coupons.restrict.channelSite": "سایت",
		"coupons.restrict.channelBale": "ربات بله",
		"coupons.restrict.channelTelegram": "ربات تلگرام",
		"coupons.publishPanel": "انتشار",
		"users.title": "کاربران",
		"users.editPanel": "ویرایش کاربر",
		"users.pickRow": "یک کاربر را انتخاب کنید.",
		"users.colLogin": "نام کاربری",
		"users.colName": "نام",
		"users.colEmail": "ایمیل",
		"users.createTitle": "افزودن کاربر",
		"users.fieldLogin": "نام کاربری",
		"users.fieldEmail": "ایمیل",
		"users.fieldPassword": "رمز (حداقل ۸)",
		"users.fieldRole": "نقش",
		"users.submitCreate": "ایجاد کاربر",
		"users.roleSubscriber": "مشترک",
		"users.roleCustomer": "مشتری",
		"users.rolePartner": "همکار (عمده)",
		"users.roleAuthor": "نویسنده",
		"users.roleEditor": "ویرایشگر",
		"users.roleShopManager": "مدیر فروشگاه",
		"users.colAvatar": "آواتار",
		"users.colPhone": "تلفن",
		"users.colRole": "نقش",
		"users.colActions": "عملیات",
		"users.editTitle": "ویرایش کاربر: {{login}}",
		"users.myAccountTitle": "حساب من",
		"users.searchPlaceholder": "جستجوی کاربر…",
		"users.filter.botAll": "همه کاربران",
		"users.filter.roleAll": "همه نقش‌ها",
		"users.bulkSelected": "{{count}} کاربر انتخاب شد",
		"users.bulkMakePartner": "تبدیل به همکار",
		"users.bulkMakeCustomer": "لغو همکار (مشتری)",
		"users.bulkRoleDone": "{{count}} کاربر به‌روز شد",
		"users.selectAll": "انتخاب همه",
		"users.selectUser": "انتخاب کاربر",
		"users.filter.botBale": "ربات بله",
		"users.filter.botTelegram": "ربات تلگرام",
		"users.colChatId": "chat_id",
		"users.foundCount": "{{count}} کاربر",
		"users.sectionAccount": "حساب کاربری",
		"users.sectionCommunication": "ارتباط",
		"users.fieldFirstName": "نام",
		"users.fieldLastName": "نام خانوادگی",
		"users.commChannelEmail": "ایمیل",
		"users.commChannelWhatsapp": "واتس‌اپ",
		"users.commSend": "ارسال",
		"users.commNoChannel": "حداقل یک کانال را انتخاب کنید",
		"users.commPartialSuccess": "برخی کانال‌ها ارسال نشدند",
		"users.sectionAddresses": "آدرس‌ها",
		"users.sectionWishlist": "علاقه‌مندی‌ها",
		"users.sectionBots": "اتصال ربات‌ها",
		"users.sectionProfile": "پروفایل عمومی",
		"users.sectionBank": "اطلاعات بانکی",
		"users.actionResetPassword": "بازنشانی رمز",
		"users.actionChangeRole": "تغییر نقش",
		"users.actionSendMessage": "ارسال پیام",
		"users.actionSwitchUserSoon": "سوییچ کاربر (به‌زودی)",
		"users.deleteConfirmTitle": "حذف کاربر؟",
		"users.deleteConfirmBody": "کاربر «{{login}}» حذف شود؟",
		"users.fieldJob": "شغل",
		"users.fieldNationalId": "کد ملی",
		"users.fieldBirthDate": "تاریخ تولد",
		"users.fieldLandline": "تلفن ثابت",
		"users.fieldBankName": "نام بانک",
		"users.fieldBankAccount": "شماره حساب",
		"users.fieldBankCard": "شماره کارت",
		"users.fieldBankSheba": "شبا",
		"users.connected": "متصل",
		"users.disconnected": "قطع",
		"users.disconnectBot": "قطع اتصال",
		"users.botTelegram": "تلگرام",
		"users.botBale": "بله",
		"users.botFilterLabel": "فیلتر ربات",
		"users.resetGenerate": "تولید رمز جدید",
		"users.resetSendEmail": "ارسال ایمیل بازنشانی",
		"users.resetGenerated": "رمز جدید تولید شد",
		"users.resetEmailSent": "ایمیل بازنشانی ارسال شد",
		"users.resetEmailHint": "لینک بازنشانی برای کاربر ایمیل می‌شود (پیشنهادی).",
		"users.messageSent": "پیام ارسال شد",
		"users.messageChannel": "کانال",
		"users.messageBody": "متن پیام",
		"users.sendMessage": "ارسال",
		"users.channelSms": "پیامک",
		"users.channelTelegram": "تلگرام",
		"users.channelBale": "بله",
		"users.noPhone": "بدون تلفن",
		"users.addAddress": "افزودن آدرس",
		"users.defaultAddress": "پیش‌فرض",
		"users.setDefaultAddress": "تنظیم پیش‌فرض",
		"users.addr.label": "برچسب",
		"users.addr.first_name": "نام",
		"users.addr.last_name": "نام خانوادگی",
		"users.addr.state": "استان",
		"users.addr.city": "شهر",
		"users.addr.address_1": "آدرس ۱",
		"users.addr.address_2": "آدرس ۲",
		"users.addr.postcode": "کد پستی",
		"users.addr.phone": "تلفن",
		"users.addr.plaque": "پلاک",
		"users.addr.unit": "واحد",
		"users.addr.lat": "عرض جغرافیایی",
		"users.addr.lng": "طول جغرافیایی",
		"account.homeTitle": "پیشخوان حساب",
		"account.homeSubtitle": "سفارش‌ها، علاقه‌مندی‌ها، کیف پول و پشتیبانی در یک نگاه.",
		"account.cardOrders": "سفارش‌ها",
		"account.cardFavorites": "موردعلاقه‌ها",
		"account.cardNotifications": "اعلان نخوانده",
		"account.cardTickets": "تیکت باز",
		"account.cardWallet": "موجودی کیف پول",
		"account.addressesTitle": "آدرس‌ها",
		"account.addressesSubtitle": "آدرس‌های تحویل، پلاک، واحد و موقعیت روی نقشه.",
		"account.notificationsTitle": "اطلاعیه‌ها",
		"account.notificationsSubtitle": "پیام‌های فروشگاه درباره سفارش و پشتیبانی.",
		"account.markAllRead": "همه را خواندم",
		"account.favoritesTitle": "موردعلاقه‌ها",
		"account.favoritesSubtitle": "محصولاتی که ذخیره کرده‌اید.",
		"account.reviewsTitle": "دیدگاه‌ها و پرسش‌ها",
		"account.reviewsSubtitle": "امتیاز به خریدها و پرسش‌های شما.",
		"account.tabPendingReviews": "در انتظار دیدگاه",
		"account.tabMyReviews": "دیدگاه‌های من",
		"account.tabMyQuestions": "پرسش‌های من",
		"account.rating": "امتیاز",
		"account.ratingValue": "امتیاز {{rating}} از ۵",
		"account.reviewBody": "متن دیدگاه",
		"account.submitReview": "ثبت دیدگاه",
		"account.productId": "شناسه محصول",
		"account.questionBody": "متن پرسش",
		"account.submitQuestion": "ثبت پرسش",
		"account.ticketsTitle": "پشتیبانی",
		"account.ticketsSubtitle": "تیکت جدید باز کنید یا به گفتگوهای قبلی پاسخ دهید.",
		"account.ticketSubject": "موضوع",
		"account.ticketBody": "پیام",
		"account.ticketCreate": "ارسال تیکت",
		"account.ticketDetailTitle": "تیکت",
		"account.ticketReply": "پاسخ",
		"account.ticketSend": "ارسال پاسخ",
		"account.ticketStaff": "پشتیبانی",
		"account.ticketYou": "شما",
		"account.ticketSearch": "جستجوی موضوع…",
		"account.staffTicketsTitle": "صندوق تیکت",
		"account.staffTicketsSubtitle": "تیکت‌های مشتریان را پاسخ دهید و وضعیت را به‌روز کنید.",
		"account.ticketStatus.open": "باز",
		"account.ticketStatus.answered": "پاسخ‌داده‌شده",
		"account.ticketStatus.pending": "در انتظار",
		"account.ticketStatus.closed": "بسته‌شده",
		"settings.smsTitle": "پنل SMS",
		"settings.smsProvider": "ارائه‌دهنده",
		"settings.smsKavenegar": "کاوه‌نگار",
		"settings.smsMelipayamak": "ملی‌پیامک",
		"settings.smsCustom": "سفارشی",
		"settings.smsApiKey": "کلید API",
		"settings.smsSenderLine": "خط ارسال",
		"settings.smsCustomEndpoint": "آدرس API سفارشی",
		"settings.smsModirpayamak": "پنل پیامکی",
		"settings.smsModirpayamakHint": "ارسال از کیف پول سامانه انجام می‌شود. شارژ و مدیریت در پنل پیامکی.",
		"settings.smsSenderLinePlaceholder": "+983000505",
		"settings.shopSms.phonePlaceholder": "0912...",
		"settings.smsModirpayamakBalance": "موجودی کیف پول",
		"settings.smsModirpayamakPanel": "باز کردن پنل پیامکی",
		"marketing.sms.serviceUnavailable": "سرویس پیامک در دسترس نیست. می‌توانید صفحه را ببینید؛ ارسال و شارژ پس از برقراری اتصال فعال می‌شود.",
		"marketing.sms.dashboardTitle": "پنل پیامکی",
		"marketing.botBroadcast": "پیام همگانی ربات",
		"marketing.botCampaigns": "کمپین‌های ربات",
		"marketing.sms.dashboardDesc": "موجودی، ارسال و گزارش از طریق پنل پیامکی.",
		"marketing.sms.balance": "موجودی",
		"marketing.sms.toman": "تومان",
		"marketing.sms.topup": "شارژ",
		"marketing.sms.send": "ارسال",
		"marketing.sms.reports": "گزارش",
		"marketing.sms.phonebook": "دفترچه",
		"marketing.sms.recentSends": "آخرین ارسال‌ها",
		"marketing.sms.noMessages": "هنوز پیامی ثبت نشده.",
		"marketing.sms.sendTitle": "ارسال پیامک",
		"marketing.sms.fromNumber": "خط ارسال",
		"marketing.sms.phone": "موبایل",
		"marketing.sms.message": "متن پیام",
		"marketing.sms.sent": "پیام ارسال شد.",
		"marketing.sms.sendFailed": "ارسال ناموفق بود.",
		"marketing.sms.reportsTitle": "گزارش ارسال",
		"marketing.sms.reportsHint": "لاگ ارسال محلی و تاریخچه اوت‌باکس سرویس‌دهنده.",
		"marketing.sms.localMessagesHint": "پیام‌های ثبت‌شده در این سایت.",
		"marketing.sms.outboxHint": "وضعیت تحویل از سرویس‌دهنده پیامک.",
		"marketing.sms.inboxHint": "پیامک‌های دریافتی روی خطوط شما.",
		"marketing.sms.scheduledHint": "ارسال‌های آینده که هنوز قابل لغو هستند.",
		"marketing.sms.type": "نوع",
		"marketing.sms.status": "وضعیت",
		"marketing.sms.cost": "هزینه",
		"marketing.sms.phonebookTitle": "دفترچه",
		"marketing.sms.phonebookHint": "لیست مخاطبین را مدیریت کنید و به شماره‌های ذخیره‌شده پیامک بفرستید.",
		"marketing.sms.newPhonebook": "دفترچه جدید",
		"marketing.sms.topupTitle": "شارژ کیف پول",
		"marketing.sms.bonus": "هدیه",
		"marketing.sms.buy": "خرید",
		"marketing.sms.paymentVerifying": "در حال تأیید پرداخت…",
		"marketing.sms.paymentSuccess": "پرداخت موفق. اعتبار افزوده شد.",
		"marketing.sms.paymentFailed": "پرداخت ناموفق یا لغو شد.",
		"marketing.sms.paymentCallback": "پرداخت",
		"marketing.sms.patterns": "پترن‌ها",
		"marketing.sms.patternsTitle": "پترن‌های پیامک",
		"marketing.sms.patternsHint": "پترن‌های تأییدشدهٔ IPPanel را ببینید و هر کدام را به یک وضعیت سفارش برای مشتری یا مدیر اختصاص دهید.",
		"marketing.sms.matrixHint": "برای هر وضعیت سفارش، پیامک مشتری و مدیر را فعال کنید، متن و متغیرها را ببینید، و پترن را ثبت یا وصل کنید.",
		"marketing.sms.matrixTestPhone": "شماره تست ارسال",
		"marketing.sms.matrixTestPhoneHint": "برای دکمهٔ تست در هر سلول؛ خالی = شماره پیش‌فرض تنظیمات.",
		"marketing.sms.matrixSearchEvent": "جستجوی وضعیت / رویداد…",
		"marketing.sms.matrixEventCount": "{{count}} وضعیت",
		"marketing.sms.matrixExtra": "اضافی",
		"marketing.sms.matrixPatternVars": "متغیرهای پترن",
		"marketing.sms.matrixNoVars": "متغیری در متن یا پترن نیست.",
		"marketing.sms.matrixSaveCell": "ذخیره سلول",
		"marketing.sms.matrixRegister": "ثبت پترن",
		"marketing.sms.matrixApprovedList": "پترن‌های تأییدشده IPPanel",
		"marketing.sms.matrixApprovedHint": "برای انتخاب سریع در سلول‌های ماتریس؛ می‌توانید جستجو کنید.",
		"marketing.sms.registryTitle": "ثبت پترن پیامک",
		"marketing.sms.registryHint": "کدام پترن به هر رویداد سفارش وصل شده است.",
		"marketing.sms.noRegistry": "هنوز پترنی همگام نشده.",
		"marketing.sms.ippanelPatterns": "لیست پترن",
		"marketing.sms.patternCount": "{{count}} پترن",
		"marketing.sms.searchPatterns": "جستجوی عنوان، کد، وب‌سایت…",
		"marketing.sms.noPatterns": "پترنی از IPPanel برنگشت.",
		"marketing.sms.assignToStatus": "اختصاص به وضعیت",
		"marketing.sms.confirmAssign": "اختصاص پترن",
		"marketing.sms.patternAssigned": "پترن به وضعیت اختصاص داده شد.",
		"marketing.sms.patternCodeMissing": "کد پترن موجود نیست.",
		"marketing.sms.scopeColumn": "نقش",
		"marketing.sms.eventColumn": "رویداد / وضعیت",
		"marketing.sms.scopeCustomer": "مشتری",
		"marketing.sms.scopeAdmin": "مدیر",
		"marketing.sms.changeAssignment": "تغییر",
		"marketing.sms.pickPattern": "انتخاب پترن",
		"marketing.sms.boundTo": "اختصاص‌یافته به",
		"marketing.sms.openShopSms": "تنظیمات پیامک فروشگاه",
		"marketing.sms.newsletter": "خبرنامه محصول",
		"marketing.sms.newsletterTitle": "خبرنامه محصولات",
		"marketing.sms.newsletterCampaign": "ارسال کمپین",
		"marketing.sms.productId": "شناسه محصول (۰ = همه)",
		"marketing.sms.subscriberCount": "{{count}} مشترک",
		"marketing.sms.sendCampaign": "ارسال به مشترکین",
		"marketing.sms.newsletterSent": "{{count}} پیام ارسال شد.",
		"marketing.sms.sendMode": "نوع ارسال",
		"marketing.sms.modeWebservice": "وب‌سرویس",
		"marketing.sms.modePattern": "پترن",
		"marketing.sms.modeP2p": "نظیر به نظیر",
		"marketing.sms.phonesList": "لیست شماره‌ها",
		"marketing.sms.patternCode": "کد پترن",
		"marketing.sms.patternParams": "پارامترهای پترن",
		"marketing.sms.invalidJson": "JSON نامعتبر است.",
		"marketing.sms.invalidPhone": "شماره موبایل معتبر نیست.",
		"marketing.sms.messageRequired": "متن پیام الزامی است.",
		"marketing.sms.patternCodeRequired": "کد پترن الزامی است.",
		"marketing.sms.patternBindHelp": "پترن را در سامانه پیامک ثبت و تأیید کنید، سپس کد تأییدشده را وارد کنید.",
		"marketing.sms.patternBindHint": "پس از دریافت پیام پترن، هر متغیر را به شورت‌کد سایت نگاشت کنید و ذخیره کنید.",
		"marketing.sms.fetchPattern": "دریافت پترن",
		"marketing.sms.mapPatternVars": "نگاشت متغیرهای پترن",
		"marketing.sms.pickSiteVar": "انتخاب متغیر سایت",
		"marketing.sms.compositeFullName": "نام و نام خانوادگی صورتحساب",
		"marketing.sms.paramPreview": "پیش‌نمایش ذخیره",
		"marketing.sms.detachPattern": "جدا کردن پترن",
		"marketing.sms.patternDetached": "پترن از وضعیت جدا شد.",
		"marketing.sms.roleService": "خدماتی",
		"marketing.sms.rolePersonal": "شخصی",
		"marketing.sms.roleMarketing": "شخصی",
		"marketing.sms.noPatternVars": "این پترن متغیر قابل‌ویرایش ندارد.",
		"marketing.sms.sendHint": "ارسال تکی، پترن یا نظیر‌به‌نظیر از خطوط اتچ‌شده.",
		"marketing.sms.newsletterHint": "کمپین فقط با مشترک و متن غیرخالی ارسال می‌شود.",
		"marketing.sms.newsletterNoSubscribers": "مشترکی برای ارسال نیست.",
		"marketing.sms.newsletterDisabled": "خبرنامه در تنظیمات فروشگاه غیرفعال است.",
		"marketing.sms.newsletterPatternBound": "پترن متصل: {{code}}",
		"marketing.sms.newsletterBindHint": "ابتدا در تنظیمات فروشگاه پترن خبرنامه را bind کنید.",
		"marketing.sms.targetedHint": "آمار و گیرندگان ارسال‌های انبوه را ببینید.",
		"marketing.sms.outboxIdPlaceholder": "شناسه اوت‌باکس",
		"marketing.sms.statKey": "شاخص",
		"marketing.sms.statValue": "مقدار",
		"marketing.sms.shortcutsLocal": "مدیریت محلی (بدون نیاز به سرویس)",
		"marketing.sms.shortcutsService": "عملیات وابسته به سرویس پیامک",
		"marketing.sms.estimatePrice": "برآورد هزینه",
		"marketing.sms.estimatedCost": "هزینه تقریبی: {{cost}} تومان",
		"comments.title": "دیدگاه‌ها",
		"comments.colAuthor": "نویسنده",
		"comments.colExcerpt": "متن",
		"comments.colActions": "اقدامات",
		"comments.approve": "تایید",
		"comments.spam": "هرزنامه",
		"comments.tabAll": "همه",
		"comments.tabPending": "در انتظار",
		"comments.tabApproved": "تأییدشده",
		"comments.tabSpam": "هرزنامه",
		"comments.tabTrash": "زباله‌دان",
		"comments.searchPlaceholder": "جستجوی دیدگاه…",
		"comments.foundCount": "{{count}} دیدگاه",
		"comments.toggleColumns": "ستون‌ها",
		"comments.colPost": "نوشته",
		"comments.colDate": "تاریخ",
		"comments.colStatus": "وضعیت",
		"comments.colEmail": "ایمیل",
		"comments.unapprove": "بازگشت به انتظار",
		"comments.trash": "زباله‌دان",
		"comments.viewPost": "مشاهده نوشته",
		"comments.quickEdit": "ویرایش سریع",
		"comments.reply": "پاسخ",
		"comments.replyTo": "پاسخ به",
		"comments.replySend": "ارسال پاسخ",
		"comments.replySent": "پاسخ ارسال شد",
		"comments.inReplyTo": "در پاسخ به",
		"comments.quickEditSave": "ذخیره",
		"comments.quickEditCancel": "انصراف",
		"comments.statusPending": "در انتظار",
		"comments.statusApproved": "تأییدشده",
		"comments.statusSpam": "هرزنامه",
		"comments.statusTrash": "زباله‌دان",
		"comments.deleteConfirmTitle": "حذف دائمی دیدگاه؟",
		"comments.deleteConfirmBody": "این دیدگاه برای همیشه حذف می‌شود.",
		"comments.emptyList": "دیدگاهی یافت نشد.",
		"analytics.title": "آمار",
		"analytics.description": "آمار بازدید سایت، صفحات، ارجاع‌ها، جغرافیا و دستگاه‌ها (موتور بومی، بدون کوکی).",
		"analytics.sectionNav": "بخش‌های آمار",
		"analytics.sections.overview": "مرور کلی",
		"analytics.sections.visitors": "تحلیل بازدیدکنندگان",
		"analytics.sections.pages": "تحلیل صفحه‌ها",
		"analytics.sections.referrals": "ارجاع‌ها",
		"analytics.sections.geo": "جغرافیایی",
		"analytics.sections.devices": "دستگاه‌ها",
		"analytics.sections.bots": "آمار ربات‌ها",
		"analytics.kpi.visitors": "بازدیدکنندگان",
		"analytics.kpi.views": "بازدید صفحه",
		"analytics.kpi.online": "آنلاین",
		"analytics.kpi.topVisitors": "بازدیدکنندگان برتر",
		"analytics.kpi.commerceOrders": "سفارش (فروشگاه)",
		"analytics.kpi.commerceRevenue": "درآمد (فروشگاه)",
		"analytics.chartViews": "بازدید روزانه",
		"analytics.chartVisitors": "بازدیدکنندگان روزانه",
		"analytics.col.visitor": "بازدیدکننده",
		"analytics.col.views": "بازدید",
		"analytics.col.country": "کشور",
		"analytics.col.city": "شهر",
		"analytics.col.lastSeen": "آخرین بازدید",
		"analytics.col.page": "صفحه",
		"analytics.col.uri": "مسیر",
		"analytics.col.category": "دسته",
		"analytics.col.source": "منبع",
		"analytics.col.visits": "بازدید",
		"analytics.ref.direct": "مستقیم",
		"analytics.ref.search": "موتور جستجو",
		"analytics.ref.social": "شبکه اجتماعی",
		"analytics.ref.referral": "ارجاع",
		"analytics.geoDim": "نمایش",
		"analytics.geoCountry": "کشورها",
		"analytics.geoCity": "شهرها",
		"analytics.deviceDim": "بُعد",
		"analytics.deviceBrowser": "مرورگر",
		"analytics.deviceOs": "سیستم‌عامل",
		"analytics.deviceType": "نوع دستگاه",
		"analytics.searchPages": "جستجوی صفحه…",
		"analytics.empty": "داده‌ای برای این بازه نیست.",
		"analytics.unknown": "نامشخص",
		"analytics.orders": "سفارش",
		"analytics.revenue": "درآمد",
		"analytics.period": "بازهٔ زمانی",
		"analytics.period7": "۷ روز",
		"analytics.period30": "۳۰ روز",
		"analytics.period90": "۹۰ روز",
		"analytics.chartTitle": "درآمد روزانه",
		"analytics.emptyChart": "برای این بازه داده‌ای نیست.",
		"analytics.settings.tracking": "ردیابی",
		"analytics.settings.trackingEnabled": "فعال‌سازی ردیابی بازدید",
		"analytics.settings.anonymizeIp": "ناشناس‌سازی IP",
		"analytics.settings.recordLoggedIn": "ثبت بازدید کاربران واردشده",
		"analytics.settings.bypassAdblocker": "نام فایل تصادفی برای دور زدن adblock",
		"analytics.settings.exclusions": "استثناها",
		"analytics.settings.excludeRoles": "نقش‌های مستثنی",
		"analytics.settings.excludeIps": "IPهای مستثنی (هر خط یکی)",
		"analytics.settings.excludeUrls": "مسیرهای مستثنی (هر خط یکی)",
		"analytics.settings.optimization": "بهینه‌سازی",
		"analytics.settings.onlineTimeout": "آستانه آنلاین (دقیقه)",
		"analytics.settings.retentionDays": "نگهداری رویداد خام (روز)",
		"analytics.settings.geoipPath": "مسیر پایگاه GeoLite2",
		"analytics.settings.geoipHint": "اختیاری. در صورت خالی بودن از هدر Cloudflare یا «نامشخص» استفاده می‌شود.",
		"analytics.settings.purgeRebuild": "بازسازی تجمیع‌ها",
		"analytics.settings.purgeDone": "تجمیع برای {{count}} روز بازسازی شد.",
		"license.title": "لایسنس",
		"license.banner.inactive": "لایسنس داشبورد غیرفعال یا منقضی است. فعلاً می‌توانید کار کنید — لطفاً در فرصت مناسب تمدید کنید.",
		"license.banner.unreachable": "سرویس لایسنس موقتاً در دسترس نیست. داشبورد بدون وقفه کار می‌کند — بررسی خودکار ادامه دارد.",
		"license.banner.manage": "مدیریت لایسنس",
		"license.banner.dismiss": "بستن",
		"license.description": "مدیریت و همگام‌سازی لایسنس فقط برای ماژول‌ها و محصولات مارکت‌پلیس انجام می‌شود.",
		"license.domainHint": "دامنهٔ ارسالی به سرویس لایسنس: {{domain}}",
		"license.check": "بررسی وضعیت",
		"serviceWorker.registrationFailedTitle": "کش آفلاین در دسترس نیست",
		"serviceWorker.registrationFailedBody": "پیشخوان همچنان کار می‌کند. پس از به‌روزرسانی صفحه را رفرش کنید یا در صورت خطای بارگذاری، کش مرورگر را پاک کنید.",
		"license.refreshStatus": "بروزرسانی وضعیت",
		"license.zeroTouchHint": "لایسنس وقتی دامنه در CRM فعال باشد خودکار همگام می‌شود. پس از ثبت دامنه، یک‌بار «بروزرسانی وضعیت» را بزنید.",
		"license.zeroTouchBlocked": "این دامنه هنوز در CRM فعال نیست. با پشتیبانی تماس بگیرید — نیازی به وارد کردن کد روی این سایت نیست.",
		"license.lockedBody": "دسترسی به داشبورد به‌دلیل غیرفعال بودن لایسنس بیش از دو روز قفل شده است. برای فعال‌سازی با پشتیبانی تماس بگیرید — نیازی به وارد کردن کد روی این سایت نیست.",
		"license.checkOk": "وضعیت لایسنس به‌روز است.",
		"license.unreachableHint": "اتصال به سرویس لایسنس برقرار نشد. «اجرای عیب‌یابی» را بزنید تا علت دقیق مشخص شود.",
		"license.diagnostics.button": "اجرای عیب‌یابی",
		"license.diagnostics.title": "عیب‌یابی اتصال",
		"license.diagnostics.runError": "عیب‌یابی ناموفق بود",
		"license.diagnostics.probe": "آزمون اتصال",
		"license.diagnostics.latency": "زمان پاسخ",
		"license.diagnostics.httpCode": "کد HTTP",
		"license.diagnostics.fastpath": "مسیر سریع لایسنس",
		"license.diagnostics.fastpathYes": "فعال",
		"license.diagnostics.fastpathNo": "غیرفعال",
		"license.diagnostics.transport": "روش اتصال HTTP",
		"license.diagnostics.error": "پیام خطا",
		"license.diagnostics.body": "نمونهٔ پاسخ",
		"license.diagnostics.sameServer": "همان سرور لایسنس — ابتدا IP محلی امتحان می‌شود:",
		"license.activate": "فعال‌سازی",
		"license.activated": "لایسنس فعال است. در حال هدایت…",
		"license.statusTitle": "وضعیت لایسنس",
		"license.adminOnly": "اگر لایسنس فعال است، «بررسی وضعیت» را بزنید تا این سایت به‌روز شود. دکمهٔ «فعال‌سازی» فقط برای مدیر سایت است.",
		"license.statusHeading": "وضعیت ذخیره‌شده",
		"license.badgeActive": "فعال",
		"license.badgeDemo": "دمو",
		"license.badgePending": "نیاز به فعال‌سازی",
		"license.badgeError": "خطای موقت",
		"license.footerHint": "اگر اخیراً لایسنس را فعال کرده‌اید، یک‌بار «بررسی وضعیت» را بزنید.",
		"license.expiryLabel": "تاریخ انقضا: {{date}}",
		"license.heroSubtitle": "اتصال لایسنس را بررسی کنید، دامنه و تاریخ انقضا را ببینید و در صورت نیاز وضعیت را همگام کنید.",
		"license.cardEyebrow": "همگام‌سازی لایسنس",
		"license.cardTitle": "وضعیت لایسنس این سایت",
		"license.detailsHeading": "جزئیات لایسنس",
		"license.fieldDomain": "دامنهٔ ثبت‌شده",
		"license.fieldExpiry": "انقضا",
		"license.serverMessage": "پیام از سرور",
		"license.helpTitle": "راهنما",
		"license.helpBody": "پس از فعال‌سازی لایسنس، یک‌بار «بررسی وضعیت» را بزنید. مدیر سایت می‌تواند در صورت نیاز «فعال‌سازی» را هم امتحان کند.",
		"license.goDashboard": "بازگشت به داشبورد",
		"license.loadingHint": "در حال بارگذاری وضعیت از سرور…",
		"license.bootstrapErrorTitle": "بارگذاری اطلاعات ناموفق بود",
		"license.bootstrapErrorBody": "نتوانستیم منو و دسترسی‌ها را از سرور بگیریم. اتصال را بررسی کنید یا دوباره وارد شوید.",
		"license.retry": "تلاش دوباره",
		"license.errors.serverUnavailable": "سرور لایسنس در دسترس نیست.",
		"license.errors.serverUnreachable": "سرور لایسنس موقتاً در دسترس نیست.",
		"license.errors.timeout": "سرور لایسنس به‌موقع پاسخ نداد. لطفاً کمی بعد دوباره تلاش کنید.",
		"license.errors.emptyReply": "سرور لایسنس بدون پاسخ اتصال را بست. لطفاً کمی بعد دوباره تلاش کنید.",
		"license.errors.hostnameUnresolved": "نام میزبان سرور لایسنس قابل resolve نیست.",
		"license.errors.secureConnectionFailed": "اتصال امن به سرور لایسنس برقرار نشد.",
		"license.errors.requestTimeLimit": "مهلت درخواست لایسنس تمام شد.",
		"license.errors.rejected": "سرور لایسنس درخواست را رد کرد.",
		"license.errors.httpStatus": "سرور لایسنس پاسخ HTTP نامعتبر برگرداند.",
		"license.errors.noServersConfigured": "سرور لایسنس پیکربندی نشده است.",
		"license.errors.respondTimeout": "سرور لایسنس در زمان مقرر پاسخ نداد.",
		"license.errors.invalidResponse": "پاسخ نامعتبر از سرور لایسنس.",
		"license.errors.serverError": "خطای سرور لایسنس.",
		"license.errors.activationFailed": "درخواست فعال‌سازی ناموفق بود.",
		"license.errors.crmFailed": "درخواست CRM ناموفق بود.",
		"license.errors.inactive": "لایسنس فعال نیست.",
		"license.errors.inactiveOrExpired": "لایسنس داشبورد غیرفعال یا منقضی است.",
		"license.errors.notConfirmed": "لایسنس توسط CRM تأیید نشد.",
		"license.errors.notFoundDomain": "این دامنه در CRM ثبت نشده است. با پشتیبانی تماس بگیرید.",
		"license.errors.domainMismatch": "عدم تطابق دامنه.",
		"license.errors.noEntitlement": "مجوز لایسنس برای این ماژول وجود ندارد.",
		"license.errors.couldNotSave": "ذخیره رکورد لایسنس ممکن نشد.",
		"license.errors.couldNotUpdate": "به‌روزرسانی رکورد لایسنس ممکن نشد.",
		"wfcp.headerSettings": "WFCP — {{tab}}",
		"wfcp.headerBulk": "WFCP — لیست قیمت",
		"wfcp.headerQuickAdd": "WFCP — افزودن سریع",
		"wfcp.headerPriceChanger": "WFCP — تغییر قیمت گروهی",
		"wfcp.settingsTitle": "هستهٔ قیمت (WFCP)",
		"wfcp.settingsDescription": "قیمت‌گذاری چندلایه فروشگاه، همراه این داشبورد.",
		"wfcp.tab.dashboard": "داشبورد",
		"wfcp.tab.currency": "واحد پول",
		"wfcp.tab.exchange": "ارز و نرخ",
		"wfcp.tab.retail": "خرده‌فروشی",
		"wfcp.tab.credit": "اعتباری",
		"wfcp.tab.installment": "اقساطی",
		"wfcp.tab.wholesale": "عمده",
		"wfcp.tab.marketplaces": "بازارگاه",
		"wfcp.tab.search-engines": "موتورهای جستجو",
		"wfcp.tab.notifications": "اعلان‌ها و بج",
		"wfcp.tab.style": "ظاهر باکس محصول",
		"wfcp.tab.advanced": "پیشرفته",
		"wfcp.stats.total": "کل محصولات",
		"wfcp.stats.withPurchase": "با قیمت خرید",
		"wfcp.stats.locked": "قفل‌شده",
		"wfcp.stats.exchange": "نرخ ارز",
		"wfcp.categoryRules": "تخفیف عمده بر اساس دسته",
		"wfcp.badgesTitle": "بج‌ها و لیبل‌ها",
		"wfcp.alertsTitle": "آلرت‌های صفحه",
		"wfcp.stylePreview": "پیش‌نمایش زنده باکس قیمت",
		"wfcp.placement": "جایگاه فرم قیمت",
		"wfcp.placementSummary": "زیر عنوان محصول",
		"wfcp.placementBeforeCart": "قبل از فرم افزودن به سبد",
		"wfcp.placementAfterCart": "بعد از فرم افزودن به سبد",
		"wfcp.placementBeforeTabs": "قبل از تب‌های محصول",
		"wfcp.placementAfterTabs": "بعد از تب‌های محصول",
		"wfcp.placementNone": "بدون هوک خودکار",
		"wfcp.previewAddToCart": "افزودن به سبد",
		"wfcp.field.show_cash_badge": "نمایش بج نقدی",
		"wfcp.field.show_install_badge": "نمایش بج اقساطی",
		"wfcp.field.show_credit_badge": "نمایش بج اعتباری",
		"wfcp.field.show_guaranty_label": "نمایش لیبل گارانتی",
		"wfcp.field.alert_product_text": "آلرت صفحه محصول",
		"wfcp.field.alert_cart_text": "آلرت سبد خرید",
		"wfcp.field.alert_checkout_text": "آلرت تسویه حساب",
		"wfcp.field.border_radius": "شعاع گوشه",
		"wfcp.field.alert_bg": "پس‌زمینه آلرت",
		"wfcp.field.alert_text_color": "متن آلرت",
		"wfcp.field.alert_border_color": "حاشیه آلرت",
		"wfcp.field.alert_accent": "اکسنت آلرت",
		"wfcp.field.badge_cash_bg": "پس‌زمینه بج نقدی",
		"wfcp.field.badge_cash_text": "متن بج نقدی",
		"wfcp.field.badge_credit_bg": "پس‌زمینه بج اعتباری",
		"wfcp.field.badge_credit_text": "متن بج اعتباری",
		"wfcp.field.badge_installment_bg": "پس‌زمینه بج اقساطی",
		"wfcp.field.badge_installment_text": "متن بج اقساطی",
		"wfcp.field.timeline_dot": "رنگ نقطه تایم‌لاین",
		"wfcp.field.timeline_line": "رنگ خط تایم‌لاین",
		"wfcp.field.timeline_today_text": "متن امروز تایم‌لاین",
		"wfcp.field.timeline_future_text": "متن تاریخ‌های بعدی",
		"products.editor.referenceUrl": "آدرس سایت مرجع",
		"products.editor.referenceFetch": "دریافت الان",
		"products.editor.referenceLastSync": "آخرین همگام‌سازی",
		"products.editor.marketplaceGroup": "بازارگاه‌ها",
		"products.editor.searchEngineGroup": "موتورهای جستجو",
		"products.editor.lockPriceHint": "با قفل قیمت، همگام‌سازی خودکار خرده‌فروشی انجام نمی‌شود. باکس روش خرید در فروشگاه همچنان نمایش داده می‌شود.",
		"wfcp.generalEnabled": "فعال بودن WFCP",
		"wfcp.defaultPurchaseType": "روش پرداخت پیش‌فرض سایت",
		"wfcp.defaultPurchaseTypeHint": "وقتی سبد خالی است و مشتری روشی انتخاب نکرده، این نوع روی آیتم‌های جدید اعمال می‌شود.",
		"wfcp.purchaseTypeCash": "نقدی",
		"wfcp.purchaseTypeCredit": "اعتباری",
		"wfcp.purchaseTypeInstallment": "اقساطی",
		"wfcp.paymentGateways": "درگاه‌های پرداخت",
		"wfcp.noGateways": "هیچ درگاه پرداختی یافت نشد",
		"wfcp.currencyCode": "کد ارز",
		"wfcp.exchangeRate": "نرخ تبدیل",
		"wfcp.exchangeRateEnabled": "استفاده از نرخ دستی / API",
		"wfcp.apiKey": "کلید API",
		"wfcp.apiSymbol": "نماد API",
		"wfcp.apiEnabled": "فعال بودن API نرخ",
		"wfcp.testApi": "تست API",
		"wfcp.fetchRate": "دریافت نرخ",
		"wfcp.fetchOk": "نرخ به‌روز شد",
		"wfcp.profitPercent": "درصد سود خرده",
		"wfcp.roundEnabled": "گرد کردن قیمت",
		"wfcp.roundTo": "گرد کردن به",
		"wfcp.creditEnabled": "قیمت اعتباری",
		"wfcp.increasePercent": "افزایش % اعتباری",
		"wfcp.installmentEnabled": "اقساط",
		"wfcp.pdpTheme": "تم نمایش اقساط در صفحه محصول",
		"wfcp.pdpThemeClassic": "کلاسیک",
		"wfcp.pdpThemeTimeline": "تایم‌لاین (تاریخ اقساط)",
		"wfcp.pdpThemeHint": "کلاسیک همان باکس فعلی است. تایم‌لاین مبلغ هر قسط، تاریخ‌ها و انتخاب درگاه را نشان می‌دهد.",
		"wfcp.gatewayLogosOnly": "فقط لوگوی درگاه",
		"wfcp.gatewayLogosOnlyHint": "نام درگاه مخفی می‌شود و فقط با هاور دیده می‌شود.",
		"wfcp.installmentPlansHint": "ماه و سود را پایین ویرایش کنید. قسط ماهانه = نقدی × (۱ + سود) / ماه.",
		"wfcp.wholesaleEnabled": "عمده",
		"wfcp.wholesaleThresholdEnabled": "فروش عمده با آستانه تعداد/وزن",
		"wfcp.wholesaleThresholdHint": "برای مشتری عادی: اگر تعداد یا وزن خط به حداقل برسد همان خط عمده می‌شود و بج عمده می‌گیرد. کمتر از حداقل نقدی می‌ماند و اجبار حداقل نیست.",
		"wfcp.wholesalePartnerEnabled": "فروش عمده با نقش همکار",
		"wfcp.wholesalePartnerHint": "همکار قیمت خرد و عمده و حداقل خرید را می‌بیند. سبد قفل عمده است و حداقل اجباری است.",
		"wfcp.wholesalePartnerOnly": "عمده فقط برای نقش همکار",
		"wfcp.wholesaleHideRetail": "مخفی کردن قیمت خرد از همکار",
		"wfcp.wholesaleMinQty": "حداقل تعداد پیش‌فرض",
		"wfcp.wholesaleMinWeight": "حداقل وزن پیش‌فرض",
		"wfcp.wholesaleQtyStep": "گام تعداد / وزن",
		"wfcp.wholesaleMinDistinct": "حداقل تنوع سبد (SKU)",
		"wfcp.wholesaleMinsHint": "مقدار ۰ یعنی این محور اجباری نیست. در حالت همکار می‌تواند بیشتر از حداقل بخرد.",
		"wfcp.wholesaleModeNormal": "عادی — آستانه تعداد / وزن",
		"wfcp.wholesaleModeAdvanced": "پیشرفته — نقش همکار",
		"wfcp.wholesaleDiscountCascadeHint": "تخفیف عمده: درصد سفارشی محصول، وگرنه اولین دسته با درصد بیشتر از صفر، وگرنه درصد سراسری.",
		"wfcp.wholesaleProductRuleHint": "درصد و حداقل هر محصول را در ویرایشگر محصول یا لیست قیمت تعیین کنید.",
		"wfcp.wholesaleAssignPartnerHint": "برای همکار شدن، نقش کاربر را به «همکار (عمده)» تغییر دهید.",
		"wfcp.wholesaleStrategyHint": "استراتژی تخفیف برای محاسبه قیمت عمده همکار (و خط‌هایی که به آستانه می‌رسند) است.",
		"wfcp.shippingMethods": "روش‌های ارسال عمده",
		"wfcp.shippingMethodsHint": "خالی = همه روش‌ها. اگر حداقل یک خط سبد عمده باشد اعمال می‌شود.",
		"wfcp.noShippingMethods": "روش ارسالی یافت نشد",
		"wfcp.colMinQty": "حداقل تعداد",
		"wfcp.colMinWeight": "حداقل وزن",
		"wfcp.colSellBy": "واحد فروش",
		"wfcp.colDiscount": "تخفیف عمده ٪",
		"wfcp.sellByUnit": "تعداد",
		"wfcp.sellByWeight": "وزن",
		"wfcp.wholesaleCategoryVariety": "حداقل تنوع از هر دسته",
		"wfcp.wholesaleStrategy": "استراتژی",
		"wfcp.discountPercent": "تخفیف سراسری %",
		"wfcp.field.installment_text": "برچسب اقساط",
		"wfcp.field.credit_text": "برچسب اعتباری",
		"wfcp.field.need_review": "متن نیاز به بررسی",
		"wfcp.field.box_background": "پس‌زمینهٔ باکس",
		"wfcp.field.box_border_color": "حاشیهٔ باکس",
		"wfcp.field.button_background": "پس‌زمینهٔ دکمه",
		"wfcp.field.button_text_color": "متن دکمه",
		"wfcp.field.price_color": "رنگ قیمت",
		"wfcp.dryRun": "Dry run (بدون ذخیره)",
		"wfcp.recalculateAll": "محاسبهٔ مجدد همه",
		"wfcp.recalcDone": "{{ok}} محصول به‌روز شد ({{fail}} خطا)",
		"wfcp.recalcQueued": "به‌روزرسانی {{total}} محصول در صف قرار گرفت",
		"wfcp.recalcRunning": "{{processed}} از {{total}} پردازش شد",
		"wfcp.recalcFinished": "پایان: {{ok}} موفق، {{fail}} خطا",
		"wfcp.recalcIdle": "آماده",
		"wfcp.applyAllPrices": "اعمال قیمت روی همهٔ محصولات",
		"wfcp.applyAllPricesHint": "پس از تغییر نرخ ارز یا تنظیمات رند، این دکمه قیمت ووکامرس را از قیمت خرید دوباره محاسبه می‌کند.",
		"wfcp.deleteTransients": "پاک کردن کش قیمت",
		"wfcp.transientsCleared": "کش پاک شد",
		"wfcp.exportSettings": "خروجی JSON تنظیمات",
		"wfcp.exportCopied": "JSON در کلیپ‌بورد کپی شد",
		"wfcp.importJson": "JSON تنظیمات",
		"wfcp.importSettings": "ورود تنظیمات",
		"wfcp.bulkTitle": "لیست قیمت",
		"wfcp.bulkDescription": "قیمت خرید، موجودی و برند (مدیر قیمت WFCP).",
		"wfcp.search": "جستجو",
		"wfcp.filterCategory": "دسته",
		"wfcp.filterBrand": "برند",
		"wfcp.sort": "مرتب‌سازی",
		"wfcp.stock": "فیلتر موجودی",
		"wfcp.all": "همه",
		"wfcp.applyFilters": "اعمال فیلتر",
		"wfcp.colName": "محصول",
		"wfcp.colSku": "SKU",
		"wfcp.colPurchase": "خرید",
		"wfcp.colRetail": "خرده (محاسبه)",
		"wfcp.colWcRegular": "قیمت پایه فروشگاه",
		"wfcp.colStock": "موجودی",
		"wfcp.colBrand": "برند",
		"wfcp.prev": "قبلی",
		"wfcp.next": "بعدی",
		"wfcp.pageOf": "صفحه {{page}} از {{total}}",
		"wfcp.brandNone": "بدون برند",
		"wfcp.quickTitle": "افزودن سریع",
		"wfcp.quickDescription": "محصول ساده با قیمت خرید و خرده.",
		"wfcp.productName": "نام محصول",
		"wfcp.purchasePrice": "قیمت خرید",
		"wfcp.productImage": "تصویر محصول",
		"wfcp.noImage": "تصویری انتخاب نشده",
		"wfcp.selectImage": "انتخاب از رسانه",
		"wfcp.changeImage": "تغییر تصویر",
		"wfcp.removeImage": "حذف تصویر",
		"wfcp.uploadImage": "آپلود تصویر",
		"wfcp.uploadImageOk": "تصویر بارگذاری شد",
		"wfcp.createProduct": "ایجاد محصول",
		"wfcp.quickCreated": "محصول #{{id}} ایجاد شد",
		"wfcp.bpcTitle": "تغییر قیمت گروهی",
		"wfcp.bpcDescription": "صف پس‌زمینه برای افزایش/کاهش قیمت (همان موتور WFCP).",
		"wfcp.bpcType": "نوع تغییر",
		"wfcp.bpcValue": "مقدار",
		"wfcp.bpcApplySale": "اعمال روی قیمت فروش ویژه",
		"wfcp.bpcCategories": "اسلاگ دسته‌ها (با ویرگول)",
		"wfcp.bpcCategoriesHint": "خالی = همهٔ محصولات.",
		"wfcp.bpcRangeRules": "قوانین بازه (اختیاری)",
		"wfcp.bpcRulesCombine": "ترکیب قوانین بازه",
		"wfcp.bpcRounding": "گرد کردن",
		"wfcp.bpcRoundTh": "آستانهٔ گرد کردن",
		"wfcp.bpcRoundVal": "گام گرد کردن",
		"wfcp.bpcStart": "شروع کار",
		"wfcp.bpcQueued": "کار در صف قرار گرفت",
		"wfcp.bpcStateTitle": "وضعیت کار (هر ۵ ثانیه)",
		"bots.baleTitle": "ربات بله (فروشگاه)",
		"bots.telegramTitle": "ربات تلگرام (فروشگاه)",
		"bots.dashboardTitle": "داشبورد {{provider}}",
		"bots.quickLinks": "دسترسی سریع",
		"bots.description": "اتصال فروشگاه به بله یا تلگرام. یکپارچه‌سازی دیگری را با همان توکن ربات همزمان فعال نکنید.",
		"bots.webhookUrls": "آدرس وب‌هوک و سلامت",
		"bots.connectWebhook": "ثبت وب‌هوک",
		"bots.disconnectWebhook": "حذف وب‌هوک",
		"bots.botToken": "توکن ربات",
		"bots.channelId": "شناسه کانال",
		"bots.providerToken": "توکن پرداخت درون‌پیام‌رسان",
		"bots.providerTokenBale": "توکن کیف‌پول بله (provider_token)",
		"bots.providerTokenBaleHint": "از @botfather برای بازوی خود بگیرید. برای تست: WALLET-TEST-1111111111111111",
		"bots.welcomeText": "پیام خوش‌آمد",
		"bots.webhookSet": "وب‌هوک ثبت شد",
		"bots.webhookCurrentUrl": "آدرس وب‌هوک فعلی",
		"bots.webhookNotSet": "ثبت نشده",
		"bots.webhookDeleted": "وب‌هوک حذف شد",
		"bots.tabsNav": "بخش‌های ربات",
		"bots.tabs.dashboard": "داشبورد",
		"bots.tabs.settings": "تنظیمات",
		"bots.tabs.users": "کاربران",
		"bots.tabs.broadcast": "پیام همگانی",
		"bots.tabs.campaigns": "کمپین‌ها",
		"bots.tabs.logs": "لاگ",
		"bots.stats.advanced": "آمار پیشرفته",
		"bots.stats.abandonRecovery": "نرخ بازیابی سبد",
		"bots.stats.usersLinked": "کاربران متصل به ربات",
		"bots.stats.ordersAll": "سفارش‌های ربات (کل)",
		"bots.stats.orders7d": "سفارش ربات (۷ روز اخیر)",
		"bots.stats.sessions24h": "سشن فعال (۲۴ ساعت)",
		"bots.stats.salesCurrentCount": "سفارش ربات (۳۰ روز اخیر)",
		"bots.stats.salesCurrentTotal": "جمع مبلغ (۳۰ روز اخیر)",
		"bots.stats.salesPrevCount": "سفارش ربات (۳۰ روز قبل)",
		"bots.stats.salesPrevTotal": "جمع مبلغ (دورهٔ قبل)",
		"bots.stats.recentOrders": "آخرین سفارش‌های ربات",
		"bots.stats.recentUsers": "آخرین کاربران متصل",
		"bots.stats.colOrder": "سفارش",
		"bots.stats.colTotal": "مبلغ",
		"bots.stats.colStatus": "وضعیت",
		"bots.stats.colDate": "تاریخ",
		"bots.stats.colUser": "کاربر",
		"bots.stats.colPhone": "موبایل",
		"bots.stats.colChatId": "chat_id",
		"bots.stats.empty": "موردی نیست.",
		"bots.users.search": "جستجوی کاربر",
		"bots.users.searchBtn": "جستجو",
		"bots.users.importCsv": "درون‌ریزی مخاطب (CSV)",
		"bots.users.importHint": "ستون اول شماره تماس است. فقط کاربران موجود سایت تطبیق داده می‌شوند.",
		"bots.users.importDone": "درون‌ریزی انجام شد. کل: {{total}} | منطبق: {{matched}} | نامعتبر: {{invalid}} | تکراری: {{duplicate}} | بدون کاربر: {{not_found}}",
		"bots.users.total": "تعداد کاربران متصل: {{count}}",
		"bots.users.colName": "نام",
		"bots.users.colEmail": "ایمیل",
		"bots.users.colPhone": "موبایل",
		"bots.users.colChat": "chat_id",
		"bots.broadcast.status": "وضعیت کار ارسال",
		"bots.broadcast.idle": "ارسال همگانی فعال نیست.",
		"bots.broadcast.cancelJob": "لغو ارسال",
		"bots.broadcast.type": "نوع پیام",
		"bots.broadcast.types.text": "متنی",
		"bots.broadcast.types.photo": "عکس",
		"bots.broadcast.types.video": "ویدیو",
		"bots.broadcast.types.voice": "ویس",
		"bots.broadcast.types.document": "فایل",
		"bots.broadcast.mediaPlanHint": "رسانه فقط در طرح پیشرفته است.",
		"bots.broadcast.text": "متن / کپشن",
		"bots.broadcast.media": "آدرس فایل یا file_id",
		"bots.broadcast.segment": "سگمنت مخاطبان",
		"bots.broadcast.segments.all": "همه کاربران متصل",
		"bots.broadcast.segments.buyers": "خریداران",
		"bots.broadcast.segments.neverBought": "هرگز خرید نکرده",
		"bots.broadcast.segments.recent": "خریداران اخیر",
		"bots.broadcast.segments.vip": "VIP",
		"bots.broadcast.segments.inactive30": "غیرفعال ۳۰ روز",
		"bots.broadcast.start": "شروع ارسال همگانی",
		"bots.broadcast.started": "ارسال همگانی شروع شد",
		"bots.broadcast.cancelled": "ارسال همگانی لغو شد",
		"bots.broadcast.failed": "شروع ارسال ناموفق بود",
		"bots.campaigns.disabled": "کمپین‌ها در طرح پایه غیرفعال است.",
		"bots.errors.noFile": "فایل CSV ارسال نشد.",
		"bots.errors.readFail": "خواندن فایل ناموفق بود.",
		"bots.errors.invalidName": "نام کمپین الزامی است.",
		"bots.campaigns.name": "نام کمپین",
		"bots.campaigns.schedule": "زمان اجرا",
		"bots.campaigns.audience": "مخاطب",
		"bots.campaigns.audienceAll": "همهٔ کاربران متصل به ربات",
		"bots.campaigns.audienceImported": "فقط مخاطبین CSV",
		"bots.campaigns.submit": "ثبت کمپین",
		"bots.campaigns.created": "کمپین ثبت شد",
		"bots.campaigns.list": "فهرست کمپین‌ها",
		"bots.campaigns.colName": "نام",
		"bots.campaigns.colStatus": "وضعیت",
		"bots.campaigns.colWhen": "زمان",
		"bots.campaigns.colSent": "موفق",
		"bots.campaigns.colFailed": "ناموفق",
		"bots.campaigns.empty": "کمپینی ثبت نشده است.",
		"bots.logs.from": "از تاریخ",
		"bots.logs.to": "تا تاریخ",
		"bots.logs.channel": "فیلتر کانال",
		"bots.logs.apply": "اعمال فیلتر",
		"bots.logs.colTime": "زمان",
		"bots.logs.colLevel": "سطح",
		"bots.logs.colChannel": "کانال",
		"bots.logs.colMessage": "پیام",
		"bots.settings.planTokens": "طرح و اتصال",
		"bots.settings.planTier": "سطح طرح",
		"bots.settings.sandboxMode": "حالت آزمایشی (توکن جدا)",
		"bots.settings.sandboxToken": "توکن ربات آزمایشی",
		"bots.settings.webhookRequireSecret": "الزام هدر راز وب‌هوک",
		"bots.settings.webhookSecret": "راز وب‌هوک",
		"bots.settings.proxy": "پراکسی",
		"bots.settings.proxyHint": "فقط ترافیک خروجی ربات به Telegram API از این پراکسی رد می‌شود. وب‌هوک ورودی نیازی به پراکسی ندارد.",
		"bots.settings.proxyType": "نوع پراکسی",
		"bots.settings.proxyTypeNone": "بدون پراکسی",
		"bots.settings.proxyTypeHttp": "HTTP",
		"bots.settings.proxyTypeSocks5": "SOCKS5",
		"bots.settings.proxyHost": "میزبان",
		"bots.settings.proxyPort": "پورت",
		"bots.settings.proxyUsername": "نام کاربری (اختیاری)",
		"bots.settings.proxyPassword": "رمز (اختیاری)",
		"bots.settings.messages": "پیام‌های ربات",
		"bots.settings.errorText": "متن خطای عمومی",
		"bots.settings.contactButton": "برچسب دکمهٔ تماس",
		"bots.settings.storeButton": "برچسب دکمهٔ فروشگاه",
		"bots.settings.authSuccess": "پیام پس از ورود موفق",
		"bots.settings.supportContact": "بلوک پشتیبانی / تماس",
		"bots.settings.linksCommerce": "لینک‌ها و کاتالوگ",
		"bots.settings.manualPaymentTpl": "قالب لینک پرداخت دستی",
		"bots.settings.postTrackingTpl": "قالب URL رهگیری پست",
		"bots.settings.channelContactId": "شناسه تماس کانال",
		"bots.settings.channelBaleLink": "لینک کانال / ربات",
		"bots.settings.productsPerPage": "تعداد محصول در صفحه",
		"bots.settings.currencyUnit": "نمایش واحد پول",
		"bots.settings.currencyDefault": "پیش‌فرض فروشگاه",
		"bots.settings.invoiceRialMultiplier": "ضریب مبلغ فاکتور (ریال)",
		"bots.settings.invoiceRialMultiplierHint": "هنگام تبدیل قیمت فروشگاه به مبلغ فاکتور در پیام‌رسان (مثلاً ۱ برای قیمت ریالی، ۱۰ اگر قیمت‌ها تومان و نیاز به ×۱۰).",
		"bots.settings.hideOutOfStock": "پنهان کردن ناموجودها",
		"bots.settings.orderTemplates": "قالب پیام وضعیت سفارش",
		"bots.settings.notifyStatus": "اعلان به مشتری هنگام تغییر وضعیت",
		"bots.settings.abandonCart": "سبد رها شده",
		"bots.settings.abandonEnabled": "فعال‌سازی یادآوری سبد",
		"bots.settings.abandonDelay": "تأخیر یادآوری (ساعت)",
		"bots.settings.abandonMessage": "متن یادآوری",
		"bots.settings.abandonStage2": "مرحله ۲",
		"bots.settings.abandonDelay2": "تأخیر مرحله ۲ (ساعت)",
		"bots.settings.abandonMessage2": "پیام مرحله ۲",
		"bots.settings.abandonCoupon2": "مبلغ کوپن مرحله ۲",
		"bots.settings.abandonStage3": "مرحله ۳",
		"bots.settings.abandonDelay3": "تأخیر مرحله ۳ (ساعت)",
		"bots.settings.abandonMessage3": "پیام مرحله ۳",
		"bots.settings.abandonCoupon3": "مبلغ کوپن مرحله ۳",
		"bots.settings.forceJoin": "الزام عضویت کانال",
		"bots.settings.forceJoinEnabled": "نیاز به عضویت در کانال",
		"bots.settings.forceJoinChannelId": "شناسه کانال الزامی",
		"bots.settings.forceJoinChannelLink": "لینک عضویت کانال",
		"bots.settings.forceJoinMessage": "متن درخواست عضویت",
		"bots.settings.forceJoinCheckBtn": "برچسب دکمهٔ بررسی عضویت",
		"bots.settings.channelRules": "قوانین ارسال به کانال",
		"bots.settings.ruleCategories": "شناسه دسته‌ها (با ویرگول)",
		"bots.settings.ruleTags": "شناسه برچسب‌ها (با ویرگول)",
		"bots.settings.ruleSaleOnly": "فقط محصولات تخفیف‌دار",
		"bots.settings.ruleMinPrice": "حداقل قیمت",
		"bots.settings.ruleHourStart": "ساعت شروع (۰–۲۳)",
		"bots.settings.ruleHourEnd": "ساعت پایان (۰–۲۳)",
		"bots.settings.adminExtras": "شناسه‌های ادمین و پشتیبانی",
		"bots.settings.orderQuestionBtn": "نمایش دکمهٔ «سوال دربارهٔ سفارش»",
		"bots.settings.orderQuestionText": "برچسب دکمه",
		"bots.settings.supportNotifyChat": "chat_id اعلان پشتیبانی",
		"bots.settings.botAdminChats": "chat_id ادمین‌ها (هر خط یکی)",
		"marketplace.title": "بازارچه ماژول",
		"modules.loadFailed": "رابط ماژول بارگذاری نشد. ماژول را نصب یا باندل کلاینت را دوباره بسازید.",
		"modules.notInstalledRedirect": "این بخش به ماژولی از مارکت‌پلیس نیاز دارد.",
		"modules.retry": "تلاش مجدد",
		"marketplace.subtitle": "ماژول‌های افزودنی داشبورد را مرور و نصب کنید.",
		"marketplace.myModulesTitle": "ماژول‌های من",
		"marketplace.myModulesSubtitle": "ماژول‌های نصب‌شده را فعال/غیرفعال کنید یا تنظیمات را باز کنید.",
		"marketplace.allCategories": "همه",
		"marketplace.free": "رایگان",
		"marketplace.priceValue": "{{price}} {{currency}}",
		"marketplace.details": "جزئیات",
		"marketplace.install": "نصب",
		"marketplace.installing": "در حال نصب… ممکن است چند دقیقه طول بکشد.",
		"marketplace.installFailed": "نصب ناموفق بود: {{message}}",
		"marketplace.installFailedGeneric": "نصب ناموفق بود.",
		"marketplace.installTimedOutGeneric": "مهلت نصب تمام شد.",
		"marketplace.installJobStartFailed": "شروع نصب ناموفق بود.",
		"marketplace.installTimedOut": "مهلت نصب در مرحلهٔ «{{step}}» تمام شد.",
		"marketplace.installWorkerStuck": "نصب پس‌زمینه شروع نشد. WP-Cron، exec/proc_open و لاگ سرور را بررسی کنید و دوباره تلاش کنید.",
		"marketplace.installStep.queued": "آماده‌سازی نصب…",
		"marketplace.installStep.download_token": "بررسی لایسنس و دسترسی دانلود…",
		"marketplace.installStep.download_zip": "در حال دانلود بستهٔ ماژول…",
		"marketplace.installStep.unzip": "در حال استخراج فایل‌ها…",
		"marketplace.installStep.validate": "در حال اعتبارسنجی بسته…",
		"marketplace.installStep.done": "در حال تکمیل نصب…",
		"marketplace.installStep.prepare_dir": "آماده‌سازی پوشهٔ نصب…",
		"marketplace.installStep.module_lookup": "جستجوی ماژول…",
		"marketplace.update": "به‌روزرسانی",
		"marketplace.versionLine": "نسخه: {{line}}",
		"marketplace.fullDetails": "اطلاعات کامل",
		"marketplace.latestVersion": "آخرین نسخه: {{version}}",
		"marketplace.installedVersion": "نسخه نصب‌شده: {{version}}",
		"marketplace.updateAvailable": "نسخه نصب‌شده: {{installed}} · به‌روزرسانی: {{latest}}",
		"marketplace.lastUpdated": "آخرین به‌روزرسانی: {{date}}",
		"marketplace.readmeHeading": "توضیحات",
		"marketplace.detailLoadError": "بارگذاری جزئیات ماژول ناموفق بود.",
		"marketplace.buy": "خرید",
		"marketplace.installed": "نصب‌شده",
		"marketplace.submoduleOf": "زیرماژول: {{name}}",
		"marketplace.packageNotAvailable": "بستهٔ نصب در دسترس نیست",
		"marketplace.enable": "فعال",
		"marketplace.disable": "غیرفعال",
		"marketplace.settings": "تنظیمات",
		"marketplace.loading": "در حال بارگذاری…",
		"marketplace.error": "خطایی رخ داد.",
		"marketplace.errorHint": "اگر ادامه داشت، لایسنس در webina.dev، اتصال CRM از این سرور و refresh سخت را بررسی کنید.",
		"marketplace.debugSummary": "تشخیص کاتالوگ",
		"marketplace.catalogStale": "کاتالوگ از حافظهٔ کش نمایش داده می‌شود؛ اتصال به سرور ماژول برقرار نیست.",
		"marketplace.catalogUnavailable": "کاتالوگ ماژول‌ها در دسترس نیست. اتصال به سرویس لایسنس برقرار نیست.",
		"marketplace.noInstalled": "هنوز ماژولی نصب نشده است.",
		"marketplace.paymentCallback": "پرداخت",
		"marketplace.paymentVerifying": "در حال تأیید پرداخت…",
		"marketplace.paymentSuccess": "پرداخت موفق بود. در حال انتقال…",
		"marketplace.paymentFailed": "پرداخت تأیید نشد.",
		"marketplace.paymentMissing": "پارامترهای پرداخت ناقص است.",
		"marketplace.moduleSettingsTitle": "تنظیمات ماژول",
		"marketplace.moduleSettingsDesc": "پیکربندی ماژول نصب‌شده از بازارچه.",
		"marketplace.moduleSettingsHint": "تنظیمات {{module}} توسط بستهٔ ماژول ارائه می‌شود.",
		"marketplace.openModuleSettings": "باز کردن صفحهٔ تنظیمات ماژول",
		"home.storeModule": "ماژول فروشگاه",
		"nav.module.wfcp-module-quick": "افزودن سریع محصول",
		"nav.module.wfcp-module-bulk": "لیست قیمت (گروهی)",
		"nav.module.wfcp-module-price": "تغییر قیمت گروهی",
		"nav.module.analytics-module": "آمار",
		"nav.module.analytics-module-overview": "مرور کلی",
		"nav.module.analytics-module-visitors": "تحلیل بازدیدکنندگان",
		"nav.module.analytics-module-pages": "تحلیل صفحه‌ها",
		"nav.module.analytics-module-referrals": "ارجاع‌ها",
		"nav.module.analytics-module-geo": "جغرافیایی",
		"nav.module.analytics-module-devices": "دستگاه‌ها",
		"nav.module.analytics-module-bots": "آمار ربات‌ها",
		"nav.module.sms-panel-module": "پنل پیامکی",
		"nav.module.bale-bot-module": "ربات بله (WooBale)",
		"nav.module.telegram-bot-module": "ربات تلگرام",
		"nav.module.bots-bale": "ربات بله (WooBale)",
		"nav.module.bots-telegram": "ربات تلگرام",
		"marketplace.module.analytics-module-settings": "آمار",
		"marketplace.module.bale-bot-module-dashboard": "ربات بله",
		"marketplace.module.telegram-bot-module-dashboard": "ربات تلگرام",
		"marketplace.module.sms-panel-module-dashboard": "پنل پیامکی",
		"marketplace.module.wfcp-module-dashboard": "قیمت‌گذاری (WFCP)",
		"marketplace.module.basalam-module-connection": "اتصال باسلام",
		"marketplace.module.basalam-module-payments": "درگاه باسلام",
		"marketplace.module.basalam-module-wallet": "کیف پول باسلام",
		"marketplace.module.basalam-module-subscriptions": "اشتراک‌های باسلام",
		"marketplace.module.basalam-module-webhooks": "وب‌هوک‌های باسلام",
		"marketplace.module.basalam-module-operations": "عملیات باسلام",
		"marketplace.module.digikala-sellers-module-connection": "دیجیکالا",
		"marketplace.module.digikala-sellers-module-sync": "همگام‌سازی دیجیکالا",
		"marketplace.module.digikala-sellers-module-jobs": "کارهای دیجیکالا",
		"marketplace.module.digipay-upg-module-connection": "دیجی‌پی",
		"marketplace.module.digipay-upg-module-transactions": "تراکنش‌های دیجی‌پی",
		"marketplace.module.snapppay-gateway-module-gateway": "اسنپ‌پی",
		"marketplace.module.torobpay-gateway-module-gateway": "ترب‌پی",
		"marketplace.module.torob-products-extractor-module-connection": "استخراج محصولات ترب",
		"marketplace.module.zarinpal-gateway-module-connection": "زرین‌پال",
		"marketplace.module.zarinpal-gateway-module-payments": "پرداخت زرین‌پال",
		"marketplace.module.zarinpal-gateway-module-operations": "عملیات زرین‌پال",
		"marketplace.module.zarinpal-gateway-module-coverage": "پوشش زرین‌پال",
		"marketplace.module.basalam-module": "باسلام",
		"marketplace.module.digikala-sellers-module": "فروشندگان دیجیکالا",
		"marketplace.module.digipay-upg-module": "دیجی‌پی",
		"marketplace.module.snapppay-gateway-module": "اسنپ‌پی",
		"marketplace.module.torobpay-gateway-module": "ترب‌پی",
		"marketplace.module.torob-products-extractor-module": "استخراج محصولات ترب",
		"marketplace.module.zarinpal-gateway-module": "زرین‌پال",
		"marketplace.module.wfcp-module": "قیمت‌گذاری (WFCP)",
		"marketplace.module.analytics-module": "آمار",
		"marketplace.module.bale-bot-module": "ربات بله",
		"marketplace.module.telegram-bot-module": "ربات تلگرام",
		"marketplace.module.sms-panel-module": "پنل پیامکی",
		"marketplace.module.emalls-module": "ایمالز",
		"marketplace.module.emalls-module-connection": "ایمالز",
		"marketplace.module.zarehbin-module": "ذره‌بین",
		"marketplace.module.zarehbin-module-connection": "ذره‌بین",
		"marketplace.module.tapsishop-module": "تپسی‌شاپ",
		"marketplace.module.tapsishop-module-connection": "تپسی‌شاپ",
		"marketplace.module.snappshop-module": "اسنپ‌شاپ",
		"marketplace.module.snappshop-module-connection": "اسنپ‌شاپ",
		"marketplace.module.technolife-module": "تکنولایف",
		"marketplace.module.technolife-module-connection": "تکنولایف",
		"marketplace.module.torob-connector-module": "اتصال ترب",
		"marketplace.module.torob-connector-module-connection": "اتصال ترب",
		"marketplace.module.ai-content-module": "محتوای هوش مصنوعی",
		"marketplace.module.ai-content-module-settings": "تنظیمات هوش مصنوعی",
		"marketplace.module.wnc-core-module": "بازارچه",
		"wfcp.tab.digikala": "دیجیکالا",
		"wfcp.tab.basalam": "باسلام",
		"wfcp.tab.technolife": "تکنولایف",
		"wfcp.tab.snappshop": "اسنپ‌شاپ",
		"wfcp.tab.tapsishop": "تپسی‌شاپ",
		"wfcp.tab.zarehbin": "ذره‌بین",
		"wfcp.tab.emalls": "ایمالز",
		"wfcp.tab.torob": "ترب",
		"wfcp.scope.product": "به‌ازای محصول",
		"wfcp.formula.overview": "قیمت خرید → ارز (اگر base) → نقدی / اعتباری / اقساط / عمده / کانال‌های بازارگاه.",
		"wfcp.formula.retail": "نقدی = خریدِ تبدیل‌شده × (۱ + درصد سود)",
		"wfcp.formula.credit": "اعتباری = نقدی × (۱ + درصد افزایش) — روی نقدی، نه روی خرید.",
		"wfcp.formula.installment": "قسط ماهانه = نقدی × (۱ + سود) / ماه",
		"wfcp.formula.wholesale": "عمده = خریدِ تبدیل‌شده × (۱ − درصد تخفیف)",
		"wfcp.formula.marketplace": "کانال = نقدی × (۱ + سود) × (۱ + کارمزد) — سپس رند؛ قفل = قیمت دستی.",
		"wfcp.currencyWcOwned": "واحد پول فروشگاه از ووکامرس مدیریت می‌شود (تنظیمات ووکامرس → عمومی).",
		"wfcp.installmentPlans": "پلن‌های اقساط",
		"wfcp.planMonths": "ماه",
		"wfcp.planInterest": "سود %",
		"wfcp.addPlan": "افزودن پلن",
		"wfcp.marketplaceEnabled": "فعال‌سازی قیمت کانال",
		"wfcp.marketplaceProfit": "درصد سود کانال",
		"wfcp.marketplaceExtra": "کارمزد / هزینه اضافی %",
		"wfcp.priceUnit": "واحد ارسال به API",
		"wfcp.unitToman": "تومان",
		"wfcp.unitRial": "ریال",
		"wfcp.purchaseCurrency": "واحد قیمت خرید",
		"wfcp.purchaseCurrencyBase": "پایه (اعمال نرخ ارز)",
		"wfcp.purchaseCurrencyDisplay": "نمایشی (بدون ارز)",
		"wfcp.field.wholesale_description": "توضیح عمده",
		"products.editor.marketplacePrices": "قیمت کانال‌های بازارگاه",
		"products.editor.platformLock": "قفل قیمت {{platform}}",
		"products.editor.platformPrice": "قیمت دستی {{platform}}",
		"products.editor.wholesaleRule": "تخفیف عمدهٔ محصول %",
		"products.editor.wholesaleCustom": "قوانین اختصاصی عمده این محصول",
		"products.editor.wholesaleProductEnabled": "قابل فروش عمده",
		"products.editor.wholesaleSellBy": "فروش بر اساس",
		"products.editor.wholesaleSellByUnit": "تعداد",
		"products.editor.wholesaleSellByWeight": "وزن",
		"products.editor.wholesaleMinQty": "حداقل تعداد",
		"products.editor.wholesaleMinWeight": "حداقل وزن",
		"products.editor.wholesaleQtyStep": "گام تعداد / وزن",
		"products.editor.wholesaleWeightRequired": "برای فروش بر اساس وزن، وزن محصول را در بخش حمل‌ونقل پر کنید.",
		"products.editor.wholesaleUsesGlobal": "از پیش‌فرض‌های سراسری عمده استفاده می‌شود.",
		"wnc.testOk": "اتصال موفق",
		"wnc.pullQueued": "دریافت سفارش در صف قرار گرفت",
		"wnc.syncQueued": "همگام‌سازی در صف قرار گرفت",
		"wnc.platformSubtitle": "تنظیمات کانکتور برای {{platform}}",
		"wnc.live": "API زنده",
		"wnc.openPricingTab": "تب قیمت WFCP",
		"wnc.enabled": "فعال‌سازی پلتفرم",
		"wnc.feedDisabledHint": "پلتفرم غیرفعال است؛ درخواست‌های crawler تا فعال‌سازی کد ۴۰۳ برمی‌گردانند.",
		"wnc.cred.per_page": "تعداد در صفحه",
		"wnc.cred.version": "نسخه",
		"wnc.cred.order_status_enabled": "درگاه وضعیت سفارش",
		"wnc.cred.orders_list_api_enabled": "API لیست سفارش‌های ترب",
		"wnc.cred.product_page_webhook_enabled": "وب‌هوک تغییرات محصول",
		"wnc.torobPreview": "پیش‌نمایش محصولات فید",
		"wnc.torobQueue": "صف وب‌هوک محصول",
		"wnc.torobQueuePending": "در انتظار",
		"wnc.torobQueueLast": "آخرین اجرا",
		"wnc.torobQueueNext": "اجرای بعدی",
		"wnc.autoSync": "همگام‌سازی خودکار قیمت/موجودی",
		"wnc.noCredentialsYet": "اطلاعات اتصال را وارد کنید.",
		"wnc.cred.base_url": "آدرس پایه (base URL)",
		"wnc.cred.token": "توکن / کلید API",
		"wnc.cred.api_key": "کلید API",
		"wnc.cred.username": "نام کاربری",
		"wnc.cred.password": "رمز عبور",
		"wnc.cred.client_id": "شناسه کلاینت",
		"wnc.cred.client_secret": "سکرت کلاینت",
		"wnc.cred.seller_id": "شناسه فروشنده",
		"wnc.cred.vendor_code": "کد فروشنده",
		"wnc.cred.refresh_token": "توکن تازه‌سازی",
		"wnc.testConnection": "تست اتصال",
		"wnc.syncNow": "همگام‌سازی الان",
		"wnc.pullOrders": "دریافت سفارش‌ها",
		"wnc.feedUrl": "آدرس فید",
		"wnc.maps": "نگاشت محصولات",
		"wnc.jobs": "جاب‌های اخیر",
		"wnc.modules.emalls.title": "ایمالز",
		"wnc.modules.emalls.subtitle": "تنظیمات اتصال ایمالز",
		"wnc.modules.zarehbin.title": "ذره‌بین",
		"wnc.modules.zarehbin.subtitle": "تنظیمات اتصال ذره‌بین",
		"wnc.modules.tapsishop.title": "تپسی‌شاپ",
		"wnc.modules.tapsishop.subtitle": "تنظیمات اتصال تپسی‌شاپ",
		"wnc.modules.snappshop.title": "اسنپ‌شاپ",
		"wnc.modules.snappshop.subtitle": "تنظیمات اتصال اسنپ‌شاپ",
		"wnc.modules.technolife.title": "تکنولایف",
		"wnc.modules.technolife.subtitle": "تنظیمات اتصال تکنولایف",
		"wnc.modules.torob.title": "اتصال ترب",
		"wnc.modules.torob.subtitle": "تنظیمات اتصال اتصال ترب",
		"wnc.modules.digikala.title": "اتصال دیجیکالا",
		"wnc.modules.digikala.subtitle": "ارسال قیمت دیجیکالا از طریق Connector و فرمول WFCP",
		"wnc.modules.basalam.title": "اتصال باسلام",
		"wnc.modules.basalam.subtitle": "ارسال قیمت باسلام از طریق Connector و فرمول WFCP",
		"common.yes": "بله",
		"common.no": "خیر",
		"wfcp.priceMode": "حالت قیمت",
		"wfcp.priceModeRetail": "همان قیمت نقدی",
		"wfcp.priceModeMarkup": "سود و کارمزد روی نقدی",
		"wfcp.priceModeHint": "در حالت نقدی، ترب/ذره‌بین/ایمالز بدون سود پلتفرم همان قیمت نقدی را می‌گیرند.",
		"wfcp.formula.compare": "موتورهای مقایسه: همان قیمت نقدی، یا سود/کارمزد روی نقدی.",
		"wnc.productMapTitle": "اتصال محصول به بازارگاه",
		"wnc.productMapHint": "شناسه/لینک دیجیکالا، باسلام، تکنولایف، تپسی‌شاپ و اسنپ‌شاپ برای همگام‌سازی قیمت و موجودی.",
		"wnc.productMapSaveFirst": "ابتدا محصول را ذخیره کنید، سپس شناسه ریموت را اضافه کنید.",
		"wnc.remoteProductId": "شناسه محصول ریموت",
		"wnc.remoteVariantId": "شناسه تنوع ریموت",
		"wnc.remoteUrl": "لینک محصول در پلتفرم",
		"wnc.lastSync": "آخرین همگام‌سازی",
		"wnc.createRemote": "ایجاد روی پلتفرم",
		"wnc.createRemoteOk": "روی پلتفرم ایجاد شد",
		"wnc.createRemoteUnsupported": "این پلتفرم هنوز ایجاد کاتالوگ ندارد — شناسه را دستی وصل کنید.",
		"orders.marketplaceTitle": "بازارگاه",
		"orders.marketplacePlatform": "پلتفرم",
		"orders.marketplaceRemoteId": "شناسه سفارش ریموت",
		"orders.marketplaceRemoteStatus": "وضعیت ریموت",
		"wnc.torobOrderStatusUrl": "API وضعیت سفارش ترب (GET با شماره موبایل)",
		"wnc.torobOrdersListUrl": "API لیست سفارش‌های ترب (GET با torob_clid)",
		"bots.settings.loyalty": "باشگاه مشتریان و چک‌اوت",
		"bots.settings.loyaltyEnabled": "فعال‌سازی امتیاز باشگاه",
		"bots.settings.pointsPerOrder": "امتیاز به‌ازای هر سفارش تکمیل‌شده",
		"bots.settings.minOrderAmount": "حداقل مبلغ سفارش (تومان)",
		"bots.settings.referralEnabled": "فعال‌سازی پاداش دعوت",
		"bots.settings.referralPoints": "امتیاز پاداش دعوت",
		"bots.settings.webappUrl": "آدرس پایه WebApp / چک‌اوت موبایل",
		"bots.settings.checkoutNationalId": "دریافت کد ملی در چک‌اوت",
		"bots.settings.checkoutCompany": "دریافت نام شرکت در چک‌اوت",
		"bots.settings.firstOrderBonus": "پاداش اولین سفارش",
		"bots.settings.redeemPointsCost": "امتیاز لازم برای تبدیل",
		"bots.settings.redeemCouponAmount": "مبلغ کوپن تبدیل امتیاز",
		"bots.settings.welcomeCouponAmount": "مبلغ کوپن خوش‌آمد",
		"bots.settings.inactiveNudgeDays": "یادآوری کاربر غیرفعال (روز)",
		"bots.settings.saleAutoNotify": "اعلان خودکار شروع حراج",
		"bots.settings.menuToggles": "نمایش دکمه‌های منو",
		"bots.settings.menu_show_store": "فروشگاه",
		"bots.settings.menu_show_search": "جستجو",
		"bots.settings.menu_show_wishlist": "علاقه‌مندی",
		"bots.settings.menu_show_cart": "سبد",
		"bots.settings.menu_show_checkout": "تسویه",
		"bots.settings.menu_show_orders": "سفارش‌ها",
		"bots.settings.menu_show_addresses": "آدرس‌ها",
		"bots.settings.menu_show_support": "پشتیبانی",
		"bots.settings.menu_show_sale": "حراج",
		"bots.settings.parityModules": "ماژول‌های پاریتی",
		"bots.settings.siteWidgets": "ویجت‌های سایت",
		"bots.settings.moduleFlags": "فعال‌سازی ماژول‌ها",
		"bots.settings.widget.otp_enabled": "ورود OTP",
		"bots.settings.widget.popup_enabled": "پاپ‌آپ کانال",
		"bots.settings.widget.float_enabled": "چت شناور",
		"bots.settings.widget.filebot_enabled": "فایل‌بات",
		"bots.settings.module.admin_ops": "عملیات ادمین",
		"bots.settings.module.c2c": "کارت‌به‌کارت",
		"bots.settings.module.faq": "سوالات متداول",
		"bots.settings.module.tickets": "تیکت‌ها",
		"bots.settings.module.club": "کلاب",
		"bots.settings.module.channel_publisher": "انتشار کانال",
		"bots.settings.module.site_widgets": "ویجت‌های سایت",
		"bots.settings.module.notify_cascade": "آبشار اعلان",
		"bots.settings.module.outbound_queue": "صف خروجی",
		"bots.settings.stockThreshold": "آستانه موجودی کم",
		"bots.settings.routeHighAov": "مسیریابی سفارش با مبلغ بالا",
		"bots.settings.templatePreview": "پیش‌نمایش قالب",
		"bots.settings.preview": "پیش‌نمایش",
		"bots.settings.templatePreviewUnavailable": "پیش‌نمایش قالب در دسترس نیست",
		"bots.webhookSetFailed": "ثبت وب‌هوک ناموفق بود — توکن و آدرس HTTPS را بررسی کنید",
		"bots.webhookDeleteFailed": "حذف وب‌هوک ناموفق بود",
		"bots.healthOk": "وضعیت سالم (ربات: {{user}})",
		"bots.healthFail": "بررسی سلامت ناموفق: {{error}}",
		"bots.couponsTitle": "کوپن‌های ربات",
		"bots.couponCode": "کد",
		"bots.couponAmount": "مقدار",
		"bots.couponType": "نوع",
		"bots.couponFixedCart": "مبلغ ثابت سبد",
		"bots.couponCreate": "ساخت کوپن",
		"users.blockBot": "مسدود در ربات‌ها",
		"users.unblockBot": "رفع مسدودیت ربات",
		"users.loyaltyPoints": "امتیاز باشگاه",
		"bots.purchaseType.cash": "نقدی",
		"bots.purchaseType.credit": "اعتباری",
		"bots.purchaseType.installment": "اقساطی",
		"bots.purchaseType.wholesale": "عمده",
		"nav.module.ai-content-module": "هوش مصنوعی محتوا",
		"nav.module.ai-content-overview": "نمای کلی",
		"nav.module.ai-content-jobs": "کارها",
		"nav.module.ai-content-calendar": "تقویم محتوا",
		"nav.module.ai-content-products": "محتوای محصول",
		"nav.module.ai-content-titles": "عناوین محصول",
		"nav.module.ai-content-pages": "صفحات سایت",
		"nav.module.ai-content-taxonomies": "دسته‌ها و برندها",
		"nav.module.ai-content-attributes": "قالب ویژگی‌ها",
		"nav.module.ai-content-settings": "تنظیمات",
		"aiContent.overviewTitle": "هوش مصنوعی محتوا",
		"aiContent.calendarTitle": "تقویم محتوا",
		"aiContent.productsTitle": "محتوای محصول",
		"aiContent.titlesPageTitle": "اصلاح عناوین",
		"aiContent.pagesTitle": "صفحات المنتور",
		"aiContent.taxonomiesTitle": "دسته‌ها و برندها",
		"aiContent.attributesTitle": "قالب ویژگی‌ها",
		"aiContent.settingsTitle": "تنظیمات هوش مصنوعی محتوا",
		"aiContent.jobsPageTitle": "کارهای هوش مصنوعی",
		"aiContent.navCalendar": "تقویم",
		"aiContent.navJobs": "کارها",
		"aiContent.navProducts": "محصولات",
		"aiContent.navTaxonomies": "دسته‌ها",
		"aiContent.navAttributes": "ویژگی‌ها",
		"aiContent.navSettings": "تنظیمات",
		"aiContent.stat.pending": "کارهای در صف",
		"aiContent.stat.failed": "ناموفق",
		"aiContent.stat.done": "انجام‌شده",
		"aiContent.stat.calendar": "اسلات‌های آینده",
		"aiContent.incompleteTitle": "محصولات ناقص",
		"aiContent.incompleteCount": "{{count}} محصول نیاز به محتوا دارند",
		"aiContent.jobsTitle": "کارهای اخیر",
		"aiContent.noJobs": "هنوز کاری ثبت نشده.",
		"aiContent.retry": "تلاش مجدد",
		"aiContent.jobRetried": "کار دوباره در صف قرار گرفت",
		"aiContent.jobQueued": "تولید در صف قرار گرفت",
		"aiContent.jobQueueFailed": "کار در صف قرار نگرفت",
		"aiContent.jobsViewAll": "مشاهده همه",
		"aiContent.jobsRunDue": "اجرای صف الان",
		"aiContent.jobsRunDueRunning": "صف در حال اجراست…",
		"aiContent.jobsRunDueDone": "{{count}} کار پردازش شد",
		"aiContent.jobsFilter.all": "همه",
		"aiContent.jobsFilter.pending": "در صف",
		"aiContent.jobsFilter.running": "در حال اجرا",
		"aiContent.jobsFilter.failed": "ناموفق",
		"aiContent.jobsFilter.cancelled": "لغوشده",
		"aiContent.jobsFilter.done": "انجام‌شده",
		"aiContent.jobStatus.pending": "در صف",
		"aiContent.jobStatus.running": "در حال اجرا",
		"aiContent.jobStatus.failed": "ناموفق",
		"aiContent.jobStatus.cancelled": "لغوشده",
		"aiContent.jobStatus.done": "انجام‌شده",
		"aiContent.jobType.product_fill": "محتوای محصول",
		"aiContent.jobType.blog_write": "نوشتن بلاگ",
		"aiContent.jobType.term_fill": "محتوای دسته/برند",
		"aiContent.jobType.attr_template": "قالب ویژگی",
		"aiContent.jobType.suggest_blog_categories": "پیشنهاد دسته بلاگ",
		"aiContent.jobType.suggest_product_categories": "پیشنهاد دسته محصول",
		"aiContent.jobsAttempts": "{{count}} تلاش",
		"aiContent.jobsTokens": "توکن {{inCount}}/{{outCount}}",
		"aiContent.jobId": "#{{id}}",
		"aiContent.jobTokensIn": "ورود {{count}}",
		"aiContent.jobTokensOut": "خروج {{count}}",
		"aiContent.jobUntitled": "بدون نام",
		"aiContent.targetType.product": "محصول",
		"aiContent.targetType.post": "نوشته",
		"aiContent.targetType.product_cat": "دسته محصول",
		"aiContent.targetType.product_brand": "برند",
		"aiContent.targetType.category": "دسته بلاگ",
		"aiContent.targetType.calendar": "تقویم",
		"aiContent.targetType.suggest": "پیشنهاد دسته",
		"aiContent.jobError.timeout": "اتصال به مدل قطع شد (زمان تمام شد)",
		"aiContent.jobError.network": "خطای شبکه هنگام تماس با مدل",
		"aiContent.jobError.contentKw": "کلمه کلیدی در متن محصول نیست",
		"aiContent.jobError.titleKw": "کلمه کلیدی در عنوان نیست",
		"aiContent.jobError.descKw": "کلمه کلیدی در توضیح متای SEO نیست",
		"aiContent.jobError.seoGeneric": "بررسی SEO ناموفق بود",
		"aiContent.errDisabled": "ماژول هوش مصنوعی محتوا خاموش است.",
		"aiContent.errNoKey": "هیچ کلید API برای پروایدر تنظیم نشده است.",
		"aiContent.errJobNotFound": "کار پیدا نشد.",
		"aiContent.batchQueued": "{{count}} کار در صف قرار گرفت",
		"aiContent.generate": "تولید با هوش مصنوعی",
		"aiContent.generating": "در حال تولید…",
		"aiContent.fillIncomplete": "تکمیل محصولات ناقص",
		"aiContent.noIncomplete": "همه محصولات کامل به‌نظر می‌رسند.",
		"aiContent.addSlot": "افزودن اسلات تقویم",
		"aiContent.fieldDate": "تاریخ",
		"aiContent.fieldType": "نوع",
		"aiContent.fieldTopic": "موضوع",
		"aiContent.fieldFocus": "کلمه کانونی",
		"aiContent.typeBlog": "بلاگ",
		"aiContent.typeProduct": "محصول",
		"aiContent.bulkTopics": "موضوعات گروهی",
		"aiContent.bulkHint": "هر خط یک موضوع. اختیاری: موضوع | کلمه کانونی",
		"aiContent.bulkCreate": "ایجاد اسلات‌ها",
		"aiContent.bulkCreated": "{{count}} اسلات ساخته شد",
		"aiContent.calendarList": "تقویم",
		"aiContent.noSlots": "اسلاتی وجود ندارد.",
		"aiContent.runDue": "اجرای اسلات‌های سررسید",
		"aiContent.dueQueued": "اسلات‌های سررسید در صف قرار گرفتند",
		"aiContent.suggestCats": "پیشنهاد دسته‌بندی",
		"aiContent.catalogAssignTitle": "اختصاص دسته و برند به محصولات",
		"aiContent.catalogAssignHint": "هوش مصنوعی از درخت فعلی سایت دسته/برند پیشنهاد می‌دهد؛ ترم جدید فقط در صورت نیاز ساخته می‌شود. هر دستهٔ برگ همراه مادرانش اعمال می‌شود.",
		"aiContent.catalogSuggestProducts": "پیشنهاد برای محصولات",
		"aiContent.catalogApplyAll": "اعمال همه",
		"aiContent.catalogAppliedAll": "{{applied}} اعمال شد، {{failed}} ناموفق",
		"aiContent.noCatalogProposals": "پیشنهادی در صف نیست. ابتدا پیشنهاد را بزنید و بعد از اتمام جاب‌ها اینجا برگردید.",
		"aiContent.proposalApply": "اعمال",
		"aiContent.proposalSkip": "رد",
		"aiContent.proposalApplied": "اعمال شد",
		"aiContent.titleSuggestAll": "پیشنهاد عنوان برای همه",
		"aiContent.titleSuggestAllHint": "یک‌بار برای همه محصولات پیشنهاد می‌سازد؛ بعد یکی‌یکی اعمال کنید.",
		"aiContent.titleCurrent": "نام فعلی",
		"aiContent.titleProposed": "نام پیشنهادی",
		"aiContent.titleRedo": "پیشنهاد دوباره",
		"aiContent.noTitleProposals": "پیشنهاد عنوانی نیست. دکمهٔ بالا را بزنید.",
		"aiContent.settingsCatalog": "دسته، برند و عنوان یکدست",
		"aiContent.catalogAssignCats": "اختصاص دسته‌بندی محصول",
		"aiContent.catalogAssignBrands": "اختصاص برند محصول",
		"aiContent.catalogCreateTerms": "ساخت ترم جدید در صورت نبودن",
		"aiContent.catalogCreateTermsHint": "اگر دسته یا برند مناسب در سایت نباشد، ساخته شود.",
		"aiContent.catalogOnlyMissing": "فقط محصولات بدون دسته/برند",
		"aiContent.catalogOnlyMissingHint": "محصولاتی که از قبل دسته و برند دارند در صف پیشنهاد نیایند.",
		"aiContent.promptCatalog": "دستور طبقه‌بندی",
		"aiContent.titleEnabled": "فعال بودن اصلاح عنوان",
		"aiContent.titlePattern": "الگوی عنوان",
		"aiContent.titlePatternHint": "جایگاه‌ها: {product} {brand} {model} {feature}",
		"aiContent.titleBrandScript": "نوشتن برند",
		"aiContent.titleBrandFa": "همه فارسی",
		"aiContent.titleBrandEn": "همه انگلیسی",
		"aiContent.titleIncludeFeature": "ویژگی/سایز در عنوان",
		"aiContent.titleIncludeFeatureHint": "اگر خاموش باشد {feature} از الگو حذف می‌شود.",
		"aiContent.promptTitle": "دستور یکدست‌سازی عنوان",
		"aiContent.suggest": "پیشنهاد با هوش مصنوعی",
		"aiContent.applySuggestions": "اعمال پیشنهادها",
		"aiContent.noSuggestions": "هنوز پیشنهادی نیست. پیشنهاد را اجرا کنید و تازه‌سازی کنید.",
		"aiContent.catsApplied": "{{count}} دسته ساخته شد",
		"aiContent.fillTerms": "تولید محتوای برند و دسته",
		"aiContent.fillProductCats": "تکمیل دسته‌های محصول",
		"aiContent.fillBrands": "تکمیل برندها",
		"aiContent.attrSuggestTitle": "پیشنهاد قالب ویژگی",
		"aiContent.productCatId": "شناسه دسته محصول",
		"aiContent.confirmTemplate": "تأیید قالب",
		"aiContent.noAttrDraft": "پیش‌نویسی نیست.",
		"aiContent.attrTemplates": "قالب‌های ذخیره‌شده",
		"aiContent.noTemplates": "قالب ویژگی‌ای نیست.",
		"aiContent.settingsProviders": "پروایدرهای هوش مصنوعی",
		"aiContent.defaultProvider": "پروایدر پیش‌فرض",
		"aiContent.leaveBlankKeep": "برای نگه داشتن کلید فعلی خالی بگذارید",
		"aiContent.gapgpt": "گپ‌جی‌پی‌تی",
		"aiContent.gapgptKey": "کلید API گپ‌جی‌پی‌تی",
		"aiContent.gapgptModel": "مدل گپ‌جی‌پی‌تی",
		"aiContent.gapgptSaveKeyFirst": "ابتدا کلید را ذخیره کنید تا فهرست مدل‌ها از گپ‌جی‌پی‌تی گرفته شود.",
		"aiContent.gapgptRefreshModels": "تازه‌سازی مدل‌ها",
		"aiContent.gapgptNoModels": "مدلی برنگشت. کلید را بررسی کنید.",
		"aiContent.settingsProfile": "پروفایل سایت و قوانین سئو",
		"aiContent.siteTopic": "موضوع / حوزه سایت",
		"aiContent.siteDescription": "توضیحات حوزه سایت",
		"aiContent.siteDescriptionHint": "کسب‌وکار، مخاطب، خدمات و هر چیزی که مدل باید برای همه صفحات به خاطر بسپارد.",
		"aiContent.tone": "لحن",
		"aiContent.settingsTones": "لحن نوشتار",
		"aiContent.settingsTonesHint": "لحن‌های روشن با هم در پرامپت ترکیب می‌شوند. حداقل یکی باید روشن بماند.",
		"aiContent.tone.professional": "حرفه‌ای",
		"aiContent.tone.friendly": "دوستانه",
		"aiContent.tone.expert": "کارشناسانه",
		"aiContent.tone.educational": "آموزشی",
		"aiContent.tone.sales": "فروشنده",
		"aiContent.tone.storytelling": "روایی",
		"aiContent.tone.luxury": "لوکس",
		"aiContent.tone.casual": "محاوره‌ای",
		"aiContent.tone.enthusiastic": "پرشور",
		"aiContent.webResearch": "جستجوی وب قبل از نوشتن",
		"aiContent.webResearchHint": "مدل مشخصات را از دانش خودش نمی‌نویسد؛ اول دربارهٔ محصول سرچ می‌کند.",
		"aiContent.reviewEmojis": "ایموجی در نقد و بررسی",
		"aiContent.reviewEmojisHint": "وقتی روشن است، در هر جمله یا پاراگراف توضیحات و نقد یک ایموجی مرتبط بگذار؛ نه در عنوان سئو.",
		"aiContent.internalLinksMin": "حداقل لینک داخلی",
		"aiContent.internalLinksMax": "حداکثر لینک داخلی",
		"aiContent.attrPageLead": "دسته را انتخاب کنید. نام ویژگی‌ها از همان دسته می‌آید؛ مقدار داخل هر ویژگی اگر دقیقاً نبود ساخته می‌شود.",
		"aiContent.attrPickCategory": "دسته‌بندی‌ها",
		"aiContent.attrForCategory": "ویژگی‌های «{{name}}»",
		"aiContent.attrSelectCategoryFirst": "ابتدا یک دسته از فهرست انتخاب کنید.",
		"aiContent.attrMapped": "ذخیره‌شده",
		"aiContent.saveMapping": "ذخیرهٔ نام‌های این دسته",
		"aiContent.noGlobalAttributes": "ویژگی سراسری ووکامرس نیست.",
		"aiContent.noCategoryAttributes": "در محصولات این دسته ویژگی سراسری پیدا نشد.",
		"aiContent.language": "زبان",
		"aiContent.lang.fa": "فارسی",
		"aiContent.lang.en": "انگلیسی",
		"aiContent.dailyBlogQuota": "سهمیه روزانه بلاگ",
		"aiContent.dailyProductQuota": "سهمیه روزانه محصول",
		"aiContent.publishStatus": "وضعیت انتشار",
		"aiContent.autoPublish": "انتشار خودکار (توصیه نمی‌شود)",
		"aiContent.enabled": "فعال‌سازی اتوماسیون AI",
		"aiContent.requireSiteName": "الزام نام سایت در محتوا",
		"aiContent.siteName": "نام سایت",
		"aiContent.temperature": "درجه خلاقیت (Temperature)",
		"aiContent.maxTokens": "حداکثر تعداد توکن‌ها",
		"aiContent.maxTokensHint": "۰ یعنی محدودیت نفرست (رفتار پیش‌فرض پروایدر).",
		"aiContent.seoSep": "جداکننده عنوان سئو",
		"aiContent.settingsSystemPrompt": "دستورالعمل سیستم",
		"aiContent.settingsProduct": "محصول",
		"aiContent.settingsProductCat": "دسته‌بندی محصول",
		"aiContent.settingsBrand": "برند",
		"aiContent.settingsBlog": "بلاگ",
		"aiContent.settingsBlogCat": "دسته بلاگ",
		"aiContent.settingsPageEntity": "صفحات (المنتور)",
		"aiContent.settingsDesign": "حافظه طراحی و پالت",
		"aiContent.paletteMode": "منبع پالت رنگی",
		"aiContent.paletteModeHint": "سایت: از کیت المنتور. پیشنهاد: اگر پالت نبود مدل پیشنهاد می‌دهد.",
		"aiContent.paletteModeSite": "پالت سایت / کیت المنتور",
		"aiContent.paletteModeSuggest": "پیشنهاد پالت توسط هوش مصنوعی",
		"aiContent.designSource": "منبع",
		"aiContent.designLocked": "قفل (صفحات بعدی همین زبان بصری را می‌گیرند)",
		"aiContent.designUnlocked": "باز",
		"aiContent.extractKit": "استخراج از کیت المنتور",
		"aiContent.unlockDesign": "باز کردن قفل",
		"aiContent.resetDesign": "بازنشانی حافظه طراحی",
		"aiContent.designExtracted": "پالت از کیت المنتور ذخیره شد",
		"aiContent.designReset": "حافظه طراحی پاک شد",
		"aiContent.pageSystemPrompt": "دستورالعمل سیستم طراحی صفحه",
		"aiContent.pageProvider": "مدل پروایدر صفحات",
		"aiContent.pageProviderHint": "فقط جاب طراحی صفحه. خالی یعنی همان پروایدر پیش‌فرض بقیهٔ جاب‌ها.",
		"aiContent.pageProviderDefault": "همان پروایدر پیش‌فرض",
		"aiContent.pageModel": "شناسهٔ مدل صفحات",
		"aiContent.pageModelHint": "اگر خالی باشد از مدل همان پروایدر استفاده می‌شود.",
		"aiContent.pageModelPlaceholder": "مثلاً grok-3 یا gpt-4o",
		"aiContent.pageMaxTokens": "حداکثر توکن خروجی صفحات",
		"aiContent.pagesLead": "برای هر صفحه پرامپت محتوا بنویسید؛ طراحی از حافظه برند پیروی می‌کند.",
		"aiContent.pagesList": "صفحات",
		"aiContent.pagesSearch": "جستجوی صفحه…",
		"aiContent.noPages": "صفحه‌ای نیست.",
		"aiContent.pagePromptPlaceholder": "مثلاً: صفحه درباره ما با داستان برند، تیم و CTA تماس…",
		"aiContent.elementorRequired": "برای طراحی صفحات، المنتور باید فعال باشد.",
		"aiContent.hasElementor": "المنتور",
		"aiContent.pageAiCard": "تولید با هوش مصنوعی (المنتور)",
		"aiContent.generatePage": "طراحی و تولید صفحه",
		"aiContent.editSiteDescription": "ویرایش حوزه سایت",
		"aiContent.settingsAutomation": "اتوماسیون و انتشار",
		"aiContent.resetPrompt": "بازنشانی پرامپت",
		"aiContent.doEntity": "تولید این بخش",
		"aiContent.entityPrompt": "پرامپت این بخش",
		"aiContent.unit.words": "کلمه",
		"aiContent.unit.paragraphs": "پاراگراف",
		"aiContent.unit.count": "تعداد",
		"aiContent.field.name": "نام",
		"aiContent.field.slug": "اسلاگ",
		"aiContent.field.english_name": "نام انگلیسی",
		"aiContent.field.short_description": "توضیحات کوتاه",
		"aiContent.field.description": "توضیحات",
		"aiContent.field.ai_review_summary": "نقد و بررسی",
		"aiContent.field.faqs": "پرسش‌های متداول",
		"aiContent.field.attributes": "ویژگی‌ها",
		"aiContent.field.tags": "برچسب‌ها",
		"aiContent.field.seo": "سئو",
		"aiContent.field.title": "عنوان",
		"aiContent.field.excerpt": "خلاصه",
		"aiContent.field.content": "متن",
		"aiContent.field.custom_labels": "برچسب‌های فروشگاهی",
		"aiContent.field.blend_arabica": "عربیکا ٪",
		"aiContent.field.blend_robusta": "روبوستا ٪",
		"aiContent.field.acidity": "اسیدیته",
		"aiContent.field.caffeine_mg": "کافئین (میلی‌گرم)",
		"aiContent.field.bitterness": "تلخی",
		"aiContent.field.sweetness": "شیرینی",
		"aiContent.field.body": "بادی",
		"aiContent.field.origin_ids": "خاستگاه",
		"aiContent.field.visible": "نمایش بخش‌ها",
		"aiContent.phase.queued": "در صف",
		"aiContent.phase.layout": "چیدمان صفحه",
		"aiContent.phase.visual": "طراحی بصری",
		"aiContent.phase.provider": "تماس با مدل",
		"aiContent.phase.seo": "بررسی سئو",
		"aiContent.phase.writing": "نوشتن روی سایت",
		"aiContent.phase.done": "انجام شد",
		"aiContent.phase.failed": "ناموفق",
		"aiContent.generateProgress": "در حال تولید محتوا",
		"aiContent.generateDone": "محتوا تولید شد",
		"aiContent.generateFailed": "تولید ناموفق بود",
		"aiContent.generateStillRunning": "هنوز در حال اجراست — صفحهٔ صف را ببینید. اگر متوقف شود خطا ثبت می‌شود.",
		"aiContent.dismiss": "بستن",
		"aiContent.jobsCancel": "توقف",
		"aiContent.jobsCancelPending": "لغو کارهای در صف",
		"aiContent.jobsCancelledCount": "{{count}} کار در صف لغو شد",
		"aiContent.jobCancelled": "کار لغو شد",
		"aiContent.jobCancelRequested": "توقف درخواست شد — تا پایان تماس فعلی API صبر می‌شود",
		"aiContent.queuePause": "توقف صف",
		"aiContent.queueResume": "ادامهٔ صف",
		"aiContent.queuePaused": "صف متوقف شد",
		"aiContent.queueResumed": "صف از سر گرفته شد",
		"aiContent.queuePausedHint": "صف متوقف است. کارهای ناموفق تا تلاش مجدد دستی جلو نمی‌روند. تا Resume یا اجرای دستی، کار جدیدی شروع نمی‌شود.",
		"aiContent.phase.cancelled": "لغو شد",
		"aiContent.settingsPageTitle": "تنظیمات محتوای هوش مصنوعی",
		"aiContent.settingsPageLead": "پروایدر، پرامپت، فیلدهای محصول و iShop، پروفایل قهوه و اتوماسیون.",
		"aiContent.settingsCoffee": "پروفایل قهوه",
		"aiContent.settingsProductIshop": "محصول و iShop",
		"aiContent.settingsFields": "فیلد",
		"aiContent.settingsLength": "طول",
		"aiContent.temperatureHint": "مقدار کمتر پایدارتر است؛ مقدار بیشتر متنوع‌تر.",
		"aiContent.settingsCost": "هزینه تقریبی",
		"aiContent.costLead": "با مدل انتخاب‌شده، هر کار حدود این هزینه را دارد. روی ردیف بزنید تا همان مدل انتخاب شود؛ سپس ذخیره کنید.",
		"aiContent.costModel": "مدل",
		"aiContent.costIn": "ورودی / ۱ میلیون توکن",
		"aiContent.costOut": "خروجی / ۱ میلیون توکن",
		"aiContent.costUpTo": "تا",
		"aiContent.costFromJobs": "بر اساس کارهای انجام‌شده",
		"aiContent.costMoreModels": "مدل‌های بیشتر",
		"aiContent.costDisclaimer": "تخمینی است (نرخ {{date}}). صورتحساب واقعی از گپ‌جی‌پی‌تی است. هر جاب یک تماس مدل.",
		"aiContent.costPricingLink": "قیمت گپ‌جی‌پی‌تی",
		"aiContent.costEditRates": "ویرایش نرخ تومان (اگر قیمت سایت عوض شد)",
		"aiContent.costUsdToToman": "تبدیل دلار به تومان (هر ۱ دلار)",
		"aiContent.costUsdToTomanHint": "نرخ‌های پیش‌فرض از قیمت رسمی مدل × این عدد است. برای تطبیق با صورتحساب گپ‌جی‌پی‌تی عوض کنید.",
		"aiContent.costBatchHint": "حدود برای هر محصول",
		"aiContent.costPerTerm": "حدود برای هر دسته",
		"aiContent.jobsCostTotal": "جمع این فهرست",
		"aiContent.costApprox": "تقریبی",
		"aiContent.stat.spend": "هزینه ثبت‌شده",
		"aiContent.errEntityOff": "این نوع محتوا در تنظیمات خاموش است.",
		"aiContent.fillBlogCats": "تکمیل دسته‌های بلاگ",
		"aiContent.excerpt": "خلاصه",
		"aiContent.seoPanel": "سئو",
		"common.refresh": "تازه‌سازی",
		"nav.module.shop-reports": "آمار فروشگاه",
		"nav.module.shop-reports-overview": "مرور کلی",
		"nav.module.shop-reports-revenue": "درآمد",
		"nav.module.shop-reports-orders": "سفارش‌ها",
		"nav.module.shop-reports-products": "محصولات",
		"nav.module.shop-reports-variations": "تنوع‌ها",
		"nav.module.shop-reports-categories": "دسته‌ها",
		"nav.module.shop-reports-coupons": "کوپن‌ها",
		"nav.module.shop-reports-taxes": "مالیات",
		"nav.module.shop-reports-customers": "مشتریان",
		"nav.module.shop-reports-downloads": "دانلودها",
		"nav.module.shop-reports-stock": "موجودی",
		"nav.module.shop-reports-sales": "فروش و سود",
		"nav.module.shop-reports-financial": "گزارشات مالی",
		"reports.shopTitle": "آمار فروشگاه",
		"reports.shopDescription": "تحلیل ووکامرس با قیمت خرید، قیمت‌های فروش، ارزش انبار و سود.",
		"reports.sections.overview": "مرور کلی",
		"reports.sections.revenue": "درآمد",
		"reports.sections.orders": "سفارش‌ها",
		"reports.sections.products": "محصولات",
		"reports.sections.variations": "تنوع‌ها",
		"reports.sections.categories": "دسته‌ها",
		"reports.sections.coupons": "کوپن‌ها",
		"reports.sections.taxes": "مالیات",
		"reports.sections.customers": "مشتریان",
		"reports.sections.downloads": "دانلودها",
		"reports.sections.stock": "موجودی",
		"reports.sections.sales": "فروش و سود",
		"reports.sections.financial": "گزارشات مالی",
		"reports.financial.tabs.summary": "خلاصه",
		"reports.financial.tabs.gateways": "درگاه‌ها",
		"reports.financial.tabs.utm": "UTM",
		"reports.financial.tabs.orders": "سفارشات",
		"reports.financial.utmSub.source": "منبع",
		"reports.financial.utmSub.medium": "رسانه",
		"reports.financial.utmSub.campaign": "کمپین",
		"reports.financial.utmSub.combo": "ترکیب‌ها",
		"reports.financial.chart.byUtm": "فروش بر اساس منبع UTM",
		"reports.financial.chart.paymentProfit": "فروش و سود بر اساس درگاه",
		"reports.financial.selectGateway": "یک درگاه را انتخاب کنید تا سفارشاتش نمایش داده شود",
		"reports.financial.selectUtm": "یک مقدار UTM را انتخاب کنید تا سفارشات مرتبط نمایش داده شود",
		"reports.financial.filterPayment": "درگاه پرداخت",
		"reports.financial.filterUtmSource": "منبع UTM",
		"reports.financial.filterUtmMedium": "رسانه UTM",
		"reports.financial.filterUtmCampaign": "کمپین UTM",
		"reports.financial.allPayments": "همه درگاه‌ها",
		"reports.financial.allUtm": "همه",
		"reports.financial.directNone": "مستقیم / بدون UTM",
		"reports.financial.ordersFor": "سفارشات — {label}",
		"reports.financial.clearFilters": "پاک کردن فیلترها",
		"reports.table.aov": "میانگین سفارش",
		"reports.table.gateway": "درگاه",
		"reports.table.utmSource": "منبع UTM",
		"reports.table.utmMedium": "رسانه UTM",
		"reports.table.utmCampaign": "کمپین UTM",
		"reports.table.orderNumber": "سفارش",
		"reports.table.payment": "پرداخت",
		"reports.table.date": "تاریخ",
		"reports.table.status": "وضعیت",
		"reports.chart.overview": "عملکرد در طول زمان",
		"reports.metric.revenue": "فروش ناخالص",
		"reports.metric.net": "فروش خالص",
		"reports.metric.orders": "سفارش‌ها",
		"reports.metric.items": "اقلام فروخته‌شده",
		"reports.metric.refunds": "مرجوعی",
		"reports.metric.coupons": "کوپن / تخفیف",
		"reports.metric.tax": "مالیات",
		"reports.metric.shipping": "ارسال",
		"reports.metric.profit": "سود ناخالص",
		"reports.metric.cogs": "بهای تمام‌شده",
		"reports.searchPlaceholder": "جستجو…",
		"reports.rows": "ردیف",
		"reports.prevPage": "قبلی",
		"reports.nextPage": "بعدی",
		"reports.table.topCoupons": "برترین کوپن‌ها",
		"reports.table.coupon": "کوپن",
		"reports.table.usage": "استفاده",
		"reports.table.intervals": "بازه‌ها",
		"reports.table.period": "بازه",
		"reports.table.avgSell": "میانگین فروش",
		"reports.table.avgCost": "میانگین خرید",
		"reports.table.variation": "تنوع",
		"reports.table.brand": "برند",
		"reports.table.topBrands": "برترین برندها",
		"reports.table.taxName": "نام مالیات",
		"reports.table.taxCode": "کد مالیات",
		"reports.table.taxRate": "نرخ",
		"reports.table.orderTax": "مالیات سفارش",
		"reports.table.shippingTax": "مالیات ارسال",
		"reports.table.taxTotal": "جمع مالیات",
		"reports.table.email": "ایمیل",
		"reports.table.customerType": "نوع",
		"reports.table.downloads": "دانلودها",
		"reports.table.purchasePrice": "قیمت خرید",
		"reports.table.sellPrice": "قیمت فروش",
		"reports.table.currentPrice": "قیمت فعلی",
		"reports.table.sku": "کد کالا",
		"reports.table.stock": "موجودی",
		"reports.table.stockStatus": "وضعیت موجودی",
		"reports.table.stockValue": "ارزش موجودی",
		"reports.table.potentialProfit": "سود بالقوه",
		"reports.customerNew": "جدید",
		"reports.customerReturning": "بازگشتی",
		"reports.kpi.newCustomers": "مشتریان جدید",
		"reports.kpi.returningCustomers": "مشتریان بازگشتی",
		"reports.itemsPerOrder": "اقلام در هر سفارش",
		"reports.downloadsEmpty": "در این بازه دانلودی ثبت نشده است.",
		"reports.targetMarginHint": "حاشیه هدف خرده‌فروشی {{target}}٪ · محقق‌شده {{actual}}٪",
		"reports.stock.skuCount": "تعداد SKU",
		"reports.stock.units": "واحد موجود",
		"reports.stock.outofstock": "ناموجود",
		"reports.stock.low": "موجودی کم",
		"reports.stock.missingCost": "بدون قیمت خرید",
		"reports.stock.valuePurchase": "ارزش با قیمت خرید",
		"reports.stock.valueRetail": "ارزش با قیمت نقدی",
		"reports.stock.valueWholesale": "ارزش با قیمت عمده",
		"reports.stock.potentialProfit": "سود بالقوه",
		"reports.stock.valueBase": "ارزش‌گذاری بر اساس",
		"reports.stockFilter.all": "همه",
		"reports.stockFilter.instock": "موجود",
		"reports.stockFilter.outofstock": "ناموجود",
		"reports.stockFilter.lowstock": "موجودی کم",
		"reports.stockFilter.missing_cost": "بدون قیمت خرید",
		"reports.stock.valueBy.purchase": "بر اساس خرید",
		"reports.stock.valueBy.retail": "بر اساس نقدی",
		"reports.stock.valueBy.current": "بر اساس قیمت فعلی",
		"reports.stock.valueBy.wholesale": "بر اساس عمده",
		"reports.stock.valueBy.credit": "بر اساس اعتباری",
		"reports.stockStatus.instock": "موجود",
		"reports.stockStatus.outofstock": "ناموجود",
		"reports.stockStatus.onbackorder": "پیش‌سفارش",
		"home.traffic.emptyTitle": "هنوز ترافیکی ثبت نشده",
		"home.traffic.emptyHint": "ردیاب آنالیتیکس فعال است؛ هنوز در این بازه hit ثبت نشده.",
		"home.traffic.trackerHint": "کاربران ادمین معمولاً مستثنی‌اند. «ثبت بازدید کاربران واردشده» را روشن کنید یا در پنجرهٔ ناشناس بدون لاگین تست کنید.",
		"home.traffic.wpStatisticsHint": "داده‌ها از افزونه آمار بازدید خوانده می‌شود. ردیابی را بررسی کنید و سایت عمومی را باز کنید.",
		"analytics.source.wpStatistics": "آمار بازدید",
		"analytics.source.wpStatisticsBannerTitle": "همگام با آمار بازدید",
		"analytics.source.wpStatisticsBannerBody": "آمار داشبورد به‌صورت زنده از افزونه آمار بازدید خوانده می‌شود. ردیاب داخلی برای جلوگیری از شمارش دوبل خاموش است.",
		"analytics.source.nativeTrackerDisabled": "تا وقتی افزونه آمار بازدید نصب است، تنظیمات ردیاب داخلی غیرفعال است.",
		"analytics.settings.nativeHint": "بازدیدها بدون کوکی ثبت می‌شوند. اگر آمار صفر ماند، سایت را در پنجرهٔ ناشناس تست کنید.",
		"home.traffic.openAnalyticsSettings": "تنظیمات آنالیتیکس",
		"posts.stats.total": "همه نوشته‌ها",
		"posts.stats.publish": "منتشرشده",
		"posts.stats.draft": "پیش‌نویس",
		"posts.stats.pending": "در انتظار",
		"posts.colSeo": "سئو",
		"pages.stats.total": "همه برگه‌ها",
		"pages.stats.publish": "منتشرشده",
		"pages.stats.draft": "پیش‌نویس",
		"pages.stats.pending": "در انتظار",
		"categories.stats.total": "دسته‌ها",
		"categories.stats.withPosts": "دارای نوشته",
		"categories.stats.empty": "خالی",
		"categories.fieldSeoTitle": "عنوان سئو",
		"categories.fieldSeoDescription": "توضیح سئو",
		"categories.fieldFocusKeyword": "کلمه کلیدی",
		"productCats.levelBadge": "سطح {{level}}",
		"wfcp.colLock": "قفل",
		"wfcp.colWcSale": "قیمت تخفیف",
		"wfcp.colAttrs": "ویژگی‌ها",
		"wfcp.locked": "قفل‌شده",
		"wfcp.unlocked": "آزاد",
		"wfcp.savedInline": "ذخیره شد",
		"wfcp.emptyBulk": "محصولی با این فیلترها نیست.",
		"common.expand": "باز کردن",
		"common.collapse": "بستن",
		"wfcp.sort.price_asc": "قیمت (کم به زیاد)",
		"wfcp.sort.price_desc": "قیمت (زیاد به کم)",
		"users.sectionComments": "نظرات",
		"users.sectionNotes": "یادداشت‌ها",
		"users.commentsEmpty": "نظری از این کاربر نیست.",
		"users.commentsCount": "{{count}} نظر",
		"users.viewAllComments": "همه نظرات",
		"users.notesPlaceholder": "یادداشت داخلی بنویسید…",
		"users.addNote": "افزودن یادداشت",
		"users.notesEmpty": "هنوز یادداشتی نیست.",
		"users.contactLandline": "تلفن ثابت",
		"marketing.sms.messageKind": "نوع پیام",
		"marketing.sms.kindTransactional": "تراکنشی (OTP / سفارش) — خط خدماتی + پترن",
		"marketing.sms.kindMarketing": "بازاریابی / خبرنامه — خط بازاریابی + عادی",
		"marketing.sms.lineHint": "خطوط در WebinaCRM اتچ می‌شوند. تراکنشی از خط خدماتی و بازاریابی از خط عادی استفاده می‌کند.",
		"marketing.sms.addPattern": "درخواست پترن",
		"marketing.sms.patternRulesTitle": "قوانین پترن",
		"marketing.sms.patternRule1": "نام مجموعه/برند را به‌صورت ثابت در متن بیاورید (نه متغیر).",
		"marketing.sms.patternRule2": "نام برند یا لینک را متغیر نکنید.",
		"marketing.sms.patternRule3": "لینک فقط ثابت در متن مجاز است.",
		"marketing.sms.patternRule4": "پترن خدماتی باید غیرتبلیغاتی باشد.",
		"marketing.sms.patternRule5": "در صورت لینک، الزامات اینماد را رعایت کنید.",
		"marketing.sms.patternRule6": "پترن تستی در صورت نیاز کلمه تست داشته باشد.",
		"marketing.sms.patternTitle": "عنوان",
		"marketing.sms.patternDescription": "توضیحات",
		"marketing.sms.patternWebsite": "وب‌سایت (HTTPS)",
		"marketing.sms.patternMessage": "متن پترن",
		"marketing.sms.patternVariables": "متغیرها",
		"marketing.sms.addVariable": "افزودن متغیر",
		"marketing.sms.brandName": "نام برند / مجموعه",
		"marketing.sms.checkBrandInMessage": "نام برند در متن آمده است",
		"marketing.sms.checkNonPromotional": "محتوا غیرتبلیغاتی است",
		"marketing.sms.checkEnamad": "در صورت لینک، اینماد در نظر گرفته شده",
		"marketing.sms.checkTestWord": "در صورت تستی بودن، کلمه تست آمده است",
		"marketing.sms.patternIsShare": "اشتراک با زیرکاربران",
		"marketing.sms.patternRequiredFields": "عنوان، توضیحات و متن الزامی است.",
		"marketing.sms.patternWebsiteHttps": "وب‌سایت باید با https:// شروع شود",
		"marketing.sms.patternBrandMissing": "نام برند باید در متن باشد.",
		"marketing.sms.patternChecklistRequired": "موارد الزامی چک‌لیست را تأیید کنید.",
		"settings.siteSms.linesFromCrm": "خطوط ارسال در WebinaCRM (خدماتی / بازاریابی) اتچ می‌شوند و اینجا فقط نمایشی هستند.",
		"settings.siteSms.usePatternForOtp": "ارسال OTP با پترن تأییدشده",
		"settings.siteSms.usePatternForOtpHint": "به‌جای متن عادی، از خط خدماتی و پترن پیامک استفاده می‌کند.",
		"settings.siteSms.patternCode": "کد پترن OTP",
		"settings.siteSms.otpLength": "طول کد OTP",
		"settings.siteSms.otpExpiry": "انقضا (دقیقه)",
		"settings.siteSms.otpMaxAttempts": "حداکثر تلاش",
		"settings.siteSms.testPhone": "شماره تست",
		"settings.siteSms.testLogin": "تست OTP ورود",
		"settings.siteSms.testRegister": "تست OTP ثبت‌نام",
		"settings.siteSms.testSent": "OTP تست ارسال شد.",
		"settings.shopSms.shortcodesForEditor": "درج شورت‌کد",
		"settings.shopSms.insertIntoCustomer": "در متن مشتری درج می‌شود",
		"settings.shopSms.insertIntoAdmin": "در متن مدیر درج می‌شود",
		"settings.shopSms.templateVars": "متغیرهای قالب",
		"settings.shopSms.tabs.admin": "پیامک مدیر کل",
		"settings.shopSms.tabs.customer": "پیامک مشتری",
		"settings.shopSms.tabs.newsletter": "خبرنامه محصولات",
		"settings.shopSms.tabs.subscribers": "مشترکین خبرنامه",
		"settings.shopSms.botIds": "شناسه یکتا ربات (حداکثر ۵)",
		"settings.shopSms.botIdsHint": "شناسه چت ربات تلگرام/بله برای هشدار آزمایشی، با ویرگول جدا کنید.",
		"settings.shopBots.title": "اعلان سفارش تلگرام / بله",
		"settings.shopBots.hint": "همان رویدادهای سفارش و خبرنامهٔ پیامک فروشگاه — از طریق ربات برای مشتری لینک‌شده و شناسه چت مدیر.",
		"settings.shopBots.connectionSettings": "تنظیمات اتصال ربات",
		"settings.shopBots.tabs.admin": "ربات مدیر",
		"settings.shopBots.tabs.customer": "ربات مشتری",
		"settings.shopBots.tabs.newsletter": "خبرنامه",
		"settings.shopBots.tabs.subscribers": "مشترکین",
		"settings.shopBots.adminChatIds": "شناسه چت مدیر (هر خط یکی، حداکثر ۵)",
		"settings.shopBots.adminChatIdsHint": "شناسه عددی چت مدیران",
		"settings.shopBots.roleEditor": "قالب پیام",
		"settings.shopBots.customerMessage": "متن مشتری",
		"settings.shopBots.adminMessage": "متن مدیر",
		"settings.shopBots.testOrderId": "شناسه سفارش تست (اختیاری)",
		"settings.shopBots.testChatId": "شناسه چت تست (مشتری)",
		"settings.shopBots.testSend": "ارسال تست",
		"settings.shopBots.testSent": "پیام تست ارسال شد.",
		"settings.shopBots.newsletterHint": "ارسال قالب به کاربران لینک‌شده با رضایت خبرنامه (و مدیران در صورت فعال بودن).",
		"settings.shopBots.newsletterNotifyAdmin": "ارسال کمپین به شناسه چت مدیران هم",
		"settings.shopBots.newsletterTemplate": "قالب پیام خبرنامه",
		"settings.shopBots.sendCampaignNow": "ارسال کمپین الان",
		"settings.shopBots.sendCampaign": "ارسال به مشترکین",
		"settings.shopBots.newsletterSent": "به {{count}} گیرنده ارسال شد.",
		"settings.shopBots.subscriberCount": "{{count}} کاربر لینک‌شده",
		"settings.shopBots.subscriberName": "نام",
		"settings.shopBots.optIn": "خبرنامه",
		"settings.shopBots.legacyMovedHint": "قالب‌ها و تاگل وضعیت سفارش به اعلان‌های فروشگاه ربات منتقل شد.",
		"settings.shopBots.openShopNotify": "باز کردن اعلان‌های فروشگاه ربات",
		"settings.shopSms.testSms": "ارسال پیامک تست",
		"settings.shopSms.testPhone": "شماره تست",
		"settings.shopSms.testSent": "درخواست پیامک تست ارسال شد.",
		"settings.shopSms.newsletterEnabled": "فعال‌سازی پیامک خبرنامه محصول",
		"settings.shopSms.newsletterTemplate": "قالب پیام خبرنامه",
		"settings.shopSms.newsletterPattern": "کد پترن خبرنامه",
		"settings.shopSms.subscribersEmpty": "مشترکی وجود ندارد.",
		"settings.shopSms.unsubscribe": "لغو اشتراک",
		"settings.shopSms.roleEditor": "پترن وضعیت انتخاب‌شده",
		"settings.shopSms.patternsMatrixCtaHint": "متن، متغیرها، ثبت و اتصال پترن سفارش در صفحهٔ ماتریس پترن‌ها مدیریت می‌شود.",
		"settings.shopSms.openPatternsMatrix": "ماتریس پترن‌ها",
		"common.all": "همه",
		"marketing.sms.inboxTitle": "پیامک‌های دریافتی",
		"marketing.sms.draftsTitle": "پیام‌های پیش‌فرض",
		"marketing.sms.draftsHint": "متن‌های آماده را ذخیره کنید و از صفحه ارسال استفاده کنید.",
		"marketing.sms.newDraft": "پیش‌فرض جدید",
		"marketing.sms.noDrafts": "پیش‌فرضی ثبت نشده.",
		"marketing.sms.scheduledTitle": "پیام‌های زمان‌بندی‌شده",
		"marketing.sms.cancelScheduled": "لغو",
		"marketing.sms.cancelled": "ارسال زمان‌بندی‌شده لغو شد.",
		"marketing.sms.noScheduled": "پیام زمان‌بندی‌شده‌ای نیست.",
		"marketing.sms.targetedTitle": "گزارش ارسال هدفمند",
		"marketing.sms.pickCampaign": "انتخاب کمپین / اوت‌باکس",
		"marketing.sms.viewStats": "مشاهده آمار",
		"marketing.sms.bulkStats": "آمار انبوه",
		"marketing.sms.recipients": "گیرندگان",
		"marketing.sms.walletTitle": "کیف پول پیامک",
		"marketing.sms.walletHint": "موجودی و تاریخچه تراکنش‌های حساب پیامک.",
		"marketing.sms.ledgerTitle": "تاریخچه تراکنش‌ها",
		"marketing.sms.ledgerEmpty": "تراکنشی ثبت نشده.",
		"marketing.sms.amount": "مبلغ",
		"marketing.sms.note": "یادداشت",
		"marketing.sms.date": "تاریخ",
		"marketing.sms.from": "فرستنده",
		"marketing.sms.linesTitle": "مدیریت خطوط",
		"marketing.sms.linesHint": "خطوط در پنل پیامکی پلتفرم اتچ می‌شوند. اینجا فقط نمایش است.",
		"marketing.sms.noLines": "خطی اتچ نشده.",
		"marketing.sms.secretariesTitle": "منشی‌های پیامکی",
		"marketing.sms.secretariesHint": "قوانین پاسخ خودکار و انتقال پیام بر اساس کلیدواژه.",
		"marketing.sms.newSecretary": "قانون منشی جدید",
		"marketing.sms.secretaryType": "نوع",
		"marketing.sms.secretaryTypes.auto_reply": "منشی پیامکی",
		"marketing.sms.secretaryTypes.inbox_forward": "منشی انتقال‌دهنده",
		"marketing.sms.secretaryTypes.code_reader": "منشی کدخوان",
		"marketing.sms.secretaryTypes.membership": "منشی عضویت",
		"marketing.sms.keywords": "کلیدواژه‌ها",
		"marketing.sms.replyBody": "متن پاسخ / انتقال",
		"marketing.sms.forwardTo": "انتقال به",
		"marketing.sms.processInbox": "پردازش صندوق ورودی",
		"marketing.sms.secretaryProcessed": "پردازش {{processed}}، تطبیق {{matched}}",
		"marketing.sms.noSecretaries": "قانون منشی ثبت نشده.",
		"marketing.sms.name": "نام",
		"marketing.sms.contacts": "مخاطبین",
		"marketing.sms.pickPhonebook": "یک دفترچه انتخاب کنید",
		"marketing.sms.addContact": "افزودن مخاطب",
		"marketing.sms.localMessages": "پیام‌های محلی",
		"marketing.sms.outbox": "خروجی",
		"marketing.sms.sendTime": "زمان ارسال (اختیاری)",
		"marketing.sms.inbox": "صندوق ورودی",
		"marketing.sms.drafts": "پیش‌نویس‌ها",
		"marketing.sms.targeted": "ارسال هدفمند",
		"marketing.sms.scheduled": "زمان‌بندی",
		"marketing.sms.secretaries": "منشی پیامک",
		"marketing.sms.wallet": "کیف پول",
		"marketing.sms.lines": "خطوط",
		"marketing.sms.receivedAt": "زمان دریافت",
		"marketing.sms.sentAt": "زمان ارسال",
		"marketing.sms.recipient": "گیرنده",
		"marketing.sms.sender": "فرستنده",
		"marketing.sms.scheduledFor": "زمان ارسال",
		"marketing.sms.cancelSend": "لغو",
		"marketing.sms.cancelFailed": "لغو ناموفق بود.",
		"marketing.sms.draftSaved": "پیش‌نویس ذخیره شد.",
		"marketing.sms.draftDeleted": "پیش‌نویس حذف شد.",
		"marketing.sms.deleteDraft": "حذف",
		"marketing.sms.secretaryFilter": "فیلتر بر اساس نوع",
		"marketing.sms.secretaryAll": "همه انواع",
		"marketing.sms.secretary_auto_reply": "پاسخ خودکار",
		"marketing.sms.secretary_inbox_forward": "انتقال پیام",
		"marketing.sms.secretary_code_reader": "خواندن کد",
		"marketing.sms.secretary_membership": "عضویت",
		"marketing.sms.secretarySaved": "قانون منشی ذخیره شد.",
		"marketing.sms.secretaryDeleted": "قانون منشی حذف شد.",
		"marketing.sms.addSecretary": "قانون جدید",
		"marketing.sms.secretaryKeyword": "کلمه کلیدی",
		"marketing.sms.secretaryResponse": "پاسخ / عملیات",
		"marketing.sms.secretaryResponseHint": "متن پاسخ برای قوانین پاسخ خودکار",
		"marketing.sms.ledger": "تاریخچه تراکنش",
		"marketing.sms.ledgerDate": "تاریخ",
		"marketing.sms.ledgerAmount": "مبلغ",
		"marketing.sms.ledgerDescription": "شرح",
		"marketing.sms.walletAccount": "جزئیات حساب",
		"marketing.sms.walletDomain": "دامنه",
		"marketing.sms.lineNumber": "شماره",
		"marketing.sms.lineRole": "نقش",
		"marketing.sms.lineLabel": "برچسب",
		"marketing.sms.outboxId": "شناسه",
		"marketing.sms.selectOutbox": "یک ارسال از لیست انتخاب کنید تا جزئیات نمایش داده شود.",
		"marketing.sms.contactPhone": "موبایل",
		"marketing.sms.contactName": "نام",
		"marketing.sms.contactAdded": "مخاطب اضافه شد.",
		"marketing.sms.selectPhonebook": "یک دفترچه انتخاب کنید تا مخاطبین نمایش داده شود.",
		"digikala.rsaTitle": "کلیدهای رمزنگاری RSA",
		"digikala.rsaHint": "کلید RSA-4096 بسازید. کلید عمومی را در پنل دیجیکالا ثبت کنید. کلید خصوصی فقط روی سرور می‌ماند.",
		"digikala.generateKeys": "تولید کلید RSA",
		"digikala.privateStored": "کلید خصوصی روی سرور ذخیره شده (در پاسخ API برنمی‌گردد).",
		"digikala.noPrivate": "هنوز کلید خصوصی نیست — ابتدا کلید بسازید.",
		"digikala.publicKey": "کلید عمومی (برای دیجیکالا)",
		"digikala.copyPublic": "کپی کلید عمومی",
		"digikala.copied": "کپی شد",
		"digikala.keysGenerated": "کلیدهای RSA ساخته شد.",
		"digikala.tokenTitle": "صدور توکن دسترسی",
		"digikala.tokenHint": "کد رمزشده هویت‌سنجی دیجیکالا را بچسبانید و توکن بگیرید.",
		"digikala.encryptedPlaceholder": "کد رمزشده دیجیکالا…",
		"digikala.encryptedDoNotDecrypt": "خودتان کد را رمزگشایی نکنید — همان رشتهٔ خام را بچسبانید؛ سرور با کلید خصوصی decrypt می‌کند و به API توکن می‌فرستد. کد تک‌مصرف است.",
		"digikala.issueToken": "صدور توکن",
		"digikala.tokenIssued": "توکن صادر شد.",
		"digikala.connectionOk": "اتصال موفق",
		"digikala.howtoTitle": "مراحل اعتبارسنجی",
		"digikala.howtoSubtitle": "همان جریان پنل فروشنده دیجیکالا — بدون نیاز به کد کلاینت برای صدور توکن.",
		"digikala.howto.step1": "در همین صفحه «تولید کلید RSA» را بزنید.",
		"digikala.howto.step2": "کلید عمومی را کپی کنید.",
		"digikala.howto.step3": "در پنل دیجیکالا کلید عمومی را ثبت کنید.",
		"digikala.howto.step4": "از پنل، «کد اعتبارسنجی» را کپی کنید (نه کد کلاینت).",
		"digikala.howto.step5": "همان کد خام را اینجا بچسبانید و «صدور توکن» بزنید.",
		"digikala.howto.step6": "URL وب‌هوک HTTPS سایت را در پنل دیجیکالا ثبت کنید.",
		"digikala.howtoClientCodeNote": "خالی بودن «کد کلاینت» طبیعی است. فقط اگر پنل Client ID نشان داد، اختیاری ذخیره کنید.",
		"digikala.authStatus": "وضعیت در وردپرس",
		"digikala.connected": "متصل (توکن ذخیره شده)",
		"digikala.notConnected": "متصل نیست — صدور توکن را انجام دهید",
		"digikala.connectedShort": "متصل",
		"digikala.disconnectedShort": "قطع",
		"digikala.accessExpires": "انقضای access",
		"digikala.refreshExpires": "انقضای refresh",
		"digikala.hasRefresh": "رفرش‌توکن موجود است",
		"digikala.webhookEventsTitle": "رویدادهای وب‌هوک (پردازش روی سرور)",
		"digikala.webhookEventsHint": "این سوییچ‌ها فقط پردازش روی همین سایت وردپرس را قطع/وصل می‌کنند. انتخاب رویداد در پنل فروشنده دیجیکالا جداست.",
		"digikala.saveWebhookEvents": "ذخیره رویدادهای وب‌هوک",
		"digikala.clientCodeOptional": "کد کلاینت (اختیاری)",
		"digikala.clientCodeHint": "برای صدور توکن لازم نیست. اگر پنل Client ID دارد اینجا ذخیره کنید تا تست scopes دقیق‌تر شود.",
		"digikala.clientCodePlaceholder": "مثلاً شناسه کلاینت پنل",
		"digikala.saveClientCode": "ذخیره کد کلاینت",
		"digikala.webhookCardTitle": "وب‌هوک",
		"digikala.webhookCardHint": "این آدرس را در پنل دیجیکالا وارد کنید — نه placeholder نمونهٔ شرکت.",
		"digikala.webhookUrlPending": "در حال بارگذاری…",
		"digikala.copyWebhook": "کپی آدرس وب‌هوک",
		"digikala.webhookHttpsNote": "URL باید HTTPS باشد و IP سرور طبق قوانین پنل داخل ایران باشد. توکن «فعال» در پنل به‌تنهایی یعنی وردپرس توکن دارد نیست.",
		"digikala.baseUrl": "آدرس پایه API",
		"digikala.creditIncrease": "درصد افزایش اعتبار",
		"digikala.nav.products": "محصولات",
		"digikala.nav.orders": "سفارش‌ها",
		"digikala.nav.jobs": "جاب‌ها",
		"digikala.nav.settings": "تنظیمات",
		"digikala.nav.logs": "لاگ‌ها",
		"digikala.productsTitle": "محصولات دیجیکالا",
		"digikala.productsSubtitle": "اتصال DKP و سینک قیمت WFCP و موجودی.",
		"digikala.productActions": "اقدامات",
		"digikala.importProducts": "ورود محصولات",
		"digikala.exportProducts": "ارسال قیمت/موجودی",
		"digikala.recentJobs": "جاب‌های اخیر",
		"digikala.ordersTitle": "سفارش‌های دیجیکالا",
		"digikala.ordersSubtitle": "دریافت سفارش‌ها در ووکامرس و اقدام‌های مجاز دیجیکالا.",
		"digikala.pullOrders": "دریافت سفارش‌ها",
		"digikala.ordersPullQueued": "دریافت سفارش در صف قرار گرفت.",
		"digikala.pushStatus": "ارسال وضعیت",
		"digikala.statusPushed": "ارسال وضعیت در صف قرار گرفت.",
		"digikala.wcOrderId": "شناسه سفارش ووکامرس",
		"digikala.wcOrders": "سفارش‌های ووکامرس",
		"digikala.orderActions": "اقدامات دیجیکالا",
		"digikala.fulfillment": "مدل ارسال",
		"digikala.fulfillment.digikala": "ارسال دیجیکالا",
		"digikala.fulfillment.seller": "ارسال فروشنده",
		"digikala.nativeStatusLabel": "وضعیت بومی",
		"digikala.nativeStatus.active": "فعال",
		"digikala.nativeStatus.warehouse": "در انبار دیجیکالا",
		"digikala.nativeStatus.processed": "پردازش‌شده",
		"digikala.nativeStatus.returned": "مرجوعی",
		"digikala.nativeStatus.canceled": "لغو شده",
		"digikala.nativeStatus.cancelled": "لغو شده",
		"digikala.nativeStatus.processing": "در حال پردازش",
		"digikala.nativeStatus.full_delivered_to_customer": "تحویل به مشتری",
		"digikala.nativeStatus.full_delivered": "تحویل به مشتری",
		"digikala.sbs.processing": "در حال پردازش",
		"digikala.sbs.processed": "پردازش شد",
		"digikala.sbs.delivered": "تحویل کامل",
		"digikala.verificationCode": "کد تایید",
		"digikala.warehouseHint": "سفارش انبار دیجیکالا فقط از طریق لغو آیتم قابل تغییر است.",
		"digikala.cancelItem": "لغو آیتم",
		"digikala.cancelQueued": "لغو آیتم در صف قرار گرفت.",
		"digikala.invalidWooStatus": "این وضعیت برای سفارش دیجیکالا مجاز نیست.",
		"digikala.dkpCode": "کد DKP",
		"digikala.findVariants": "پیدا کردن تنوع",
		"digikala.dkpMapped": "DKP ذخیره شد.",
		"digikala.pickVariant": "چند تنوع پیدا شد — یکی را انتخاب کنید.",
		"digikala.mapDkpTitle": "اتصال DKP",
		"digikala.wcProductId": "شناسه محصول ووکامرس",
		"digikala.mappedProducts": "محصولات مپ‌شده",
		"digikala.syncPriceStock": "سینک قیمت/موجودی",
		"digikala.syncQueued": "سینک قیمت و موجودی در صف قرار گرفت.",
		"marketplace.badge.digikala": "دیجیکالا",
		"marketplace.badge.basalam": "باسلام",
		"marketplace.badge.snappshop": "اسنپ‌شاپ",
		"marketplace.badge.tapsishop": "تپسی‌شاپ",
		"marketplace.badge.technolife": "تکنولایف",
		"digikala.settingsTitle": "تنظیمات دیجیکالا",
		"digikala.settingsSubtitle": "کد کلاینت، آدرس پایه، همگام‌سازی خودکار.",
		"digikala.settingsSaved": "تنظیمات ذخیره شد.",
		"digikala.logsSubtitle": "پوشش API و لاگ‌های ماژول.",
		"digikala.coverage": "پوشش",
		"marketing.sms.statuses.pending": "در انتظار",
		"marketing.sms.statuses.sent": "ارسال‌شده",
		"marketing.sms.statuses.failed": "ناموفق",
		"marketing.sms.statuses.delivered": "تحویل‌شده",
		"marketing.sms.statuses.cancelled": "لغو شده",
		"marketing.sms.statuses.canceled": "لغو شده",
		"marketing.sms.statuses.queued": "در صف",
		"marketing.sms.statuses.success": "موفق",
		"marketing.sms.statuses.error": "خطا",
		"marketing.sms.statuses.processing": "در حال پردازش",
		"marketing.sms.statuses.rejected": "رد شده",
		"marketing.sms.goToWallet": "رفتن به کیف پول",
		"marketing.sms.editDraft": "ویرایش",
		"marketing.sms.phonebookDeleteUnavailable": "حذف دفترچه/مخاطب هنوز در API موجود نیست.",
		"marketing.sms.noPhonebooks": "دفترچه‌ای ثبت نشده.",
		"marketing.sms.noContacts": "مخاطبی در این دفترچه نیست.",
		"marketing.sms.sendFromDraft": "ارسال",
		"marketing.sms.topupHint": "بسته مورد نظر را برای شارژ کیف پول انتخاب کنید.",
		"marketing.sms.home": "خانه",
		"marketplace.module.snapppay-search-module": "اسنپ‌پی سرچ",
		"marketplace.module.snapppay-search-module-connection": "اسنپ‌پی سرچ",
		"wfcp.tab.snapppay-search": "اسنپ‌پی سرچ",
		"wnc.modules.snapppay-search.title": "اسنپ‌پی سرچ",
		"wnc.modules.snapppay-search.subtitle": "تنظیمات اتصال فید جستجوی اسنپ‌پی (SearchWise)",
		"nav.module.coffee-profile-origins": "خاستگاه قهوه",
		"nav.module.coffee-profile-module": "پروفایل قهوه",
		"marketplace.module.coffee-profile-module": "پروفایل قهوه",
		"coffeeProfile.settingsTitle": "پروفایل قهوه",
		"coffeeProfile.settingsHint": "نمودارهای چشایی روی صفحه محصول فروشگاه. رنگ، برچسب، لول‌های اسیدیته و جایگاه از اینجا تنظیم می‌شود. ماژول را از تنظیمات ← ماژول‌ها روشن کنید.",
		"coffeeProfile.originsTitle": "خاستگاه قهوه",
		"coffeeProfile.originsHint": "کشورهای خاستگاه. به هر محصول یک یا چند کشور بدهید؛ پرچم در صفحه محصول نمایش داده می‌شود.",
		"coffeeProfile.originNewTitle": "کشور جدید",
		"coffeeProfile.originEditTitle": "ویرایش کشور خاستگاه",
		"coffeeProfile.originAdd": "افزودن کشور",
		"coffeeProfile.originSearch": "جستجوی کشور…",
		"coffeeProfile.originFound": "{{count}} کشور",
		"coffeeProfile.originEmpty": "هنوز کشوری ثبت نشده.",
		"coffeeProfile.originDeleteTitle": "این کشور حذف شود؟",
		"coffeeProfile.originDeleteConfirm": "«{{name}}» حذف شود؟ از محصولات هم برداشته می‌شود.",
		"coffeeProfile.colFlag": "پرچم",
		"coffeeProfile.colName": "نام",
		"coffeeProfile.colIso": "ISO",
		"coffeeProfile.colCount": "محصولات",
		"coffeeProfile.colActions": "عملیات",
		"coffeeProfile.fieldName": "نام کشور",
		"coffeeProfile.fieldSlug": "نامک",
		"coffeeProfile.fieldIso": "کد ISO کشور",
		"coffeeProfile.fieldIsoHint": "دو حرف، مثلاً ET برای اتیوپی. برای پرچم خودکار استفاده می‌شود.",
		"coffeeProfile.fieldDescription": "توضیح",
		"coffeeProfile.fieldFlagImage": "تصویر پرچم سفارشی",
		"coffeeProfile.fieldFlagImageHint": "اختیاری. جایگزین پرچم ISO می‌شود.",
		"coffeeProfile.flagPreview": "پیش‌نمایش پرچم",
		"coffeeProfile.productTitle": "پروفایل قهوه",
		"coffeeProfile.saveProductFirst": "اول محصول را ذخیره کنید، بعد پروفایل قهوه را پر کنید.",
		"coffeeProfile.priceByAttrTitle": "قیمت بر اساس ویژگی",
		"coffeeProfile.priceByAttrHint": "فقط برای یک ویژگی (معمولاً وزن) قیمت خرید و موجودی بگذارید. همهٔ تنوع‌هایی که آن مقدار را دارند یکجا به‌روز می‌شوند.",
		"coffeeProfile.priceByAttrAttribute": "ویژگی",
		"coffeeProfile.priceByAttrApply": "اعمال روی تنوع‌ها",
		"coffeeProfile.priceByAttrDone": "{{count}} تنوع به‌روز شد.",
		"coffeeProfile.priceByAttrCount": "{{count}} تنوع",
		"coffeeProfile.showBlend": "نمایش ترکیب در صفحه محصول",
		"coffeeProfile.showAcidity": "نمایش اسیدیته در صفحه محصول",
		"coffeeProfile.showCaffeine": "نمایش کافئین در صفحه محصول",
		"coffeeProfile.showBitterness": "نمایش تلخی در صفحه محصول",
		"coffeeProfile.showSweetness": "نمایش شیرینی در صفحه محصول",
		"coffeeProfile.showBody": "نمایش بادی در صفحه محصول",
		"coffeeProfile.showOrigin": "نمایش خاستگاه در صفحه محصول",
		"coffeeProfile.blend": "ترکیب",
		"coffeeProfile.acidity": "اسیدیته",
		"coffeeProfile.caffeine": "کافئین",
		"coffeeProfile.caffeineMg": "مقدار (میلی‌گرم)",
		"coffeeProfile.bitterness": "تلخی",
		"coffeeProfile.sweetness": "شیرینی",
		"coffeeProfile.body": "بادی",
		"coffeeProfile.noOrigins": "هنوز کشوری نیست. از فروشگاه ← خاستگاه قهوه اضافه کنید.",
		"coffeeProfile.sectionGeneral": "برچسب‌ها و جایگاه",
		"coffeeProfile.sectionStyle": "رنگ و چیدمان",
		"coffeeProfile.placement": "جایگاه در صفحه محصول",
		"coffeeProfile.placementSummary": "زیر عنوان محصول",
		"coffeeProfile.placementBeforeCart": "قبل از فرم افزودن به سبد",
		"coffeeProfile.placementAfterCart": "بعد از فرم افزودن به سبد",
		"coffeeProfile.placementBeforeTabs": "قبل از تب‌های محصول",
		"coffeeProfile.placementAfterTabs": "بعد از تب‌های محصول",
		"coffeeProfile.placementNone": "فقط شورتکد ([webino_coffee_profile])",
		"coffeeProfile.robustaLabel": "برچسب روبوستا",
		"coffeeProfile.arabicaLabel": "برچسب عربیکا",
		"coffeeProfile.caffeineUnit": "متن واحد کافئین",
		"coffeeProfile.caffeineMax": "سقف نوار کافئین (میلی‌گرم)",
		"coffeeProfile.scaleMin": "حداقل مقیاس (تلخی / شیرینی / بادی / اسیدیته)",
		"coffeeProfile.scaleMax": "حداکثر مقیاس",
		"coffeeProfile.useFlagcdn": "اگر تصویر سفارشی نباشد، پرچم از flagcdn.com بارگذاری شود",
		"coffeeProfile.acidityLevels": "لول‌های اسیدیته",
		"coffeeProfile.grindOptions": "گزینه‌های آسیاب (فروشگاه)",
		"coffeeProfile.roastOptions": "گزینه‌های رست (فروشگاه)",
		"coffeeProfile.grindEnabled": "انتخاب آسیاب در فروشگاه",
		"coffeeProfile.roastEnabled": "انتخاب رست در فروشگاه",
		"coffeeProfile.fulfillmentHint": "روی قیمت اثر ندارد؛ مشتری در صفحه محصول انتخاب می‌کند و در سفارش برای آماده‌سازی دیده می‌شود.",
		"coffeeProfile.fulfillmentNoAttribute": "ویژگی مربوطه روی این محصول نیست. در تب ویژگی‌ها، آسیاب یا رست را اضافه کنید (با عکس ترم).",
		"coffeeProfile.grindDefault": "پیش‌فرض {{attribute}}",
		"coffeeProfile.roastDefault": "پیش‌فرض {{attribute}}",
		"coffeeProfile.addLevel": "افزودن لول",
		"coffeeProfile.newLevel": "لول جدید",
		"coffeeProfile.livePreview": "پیش‌نمایش زنده",
		"coffeeProfile.fontTitle": "اندازه عنوان (پیکسل)",
		"coffeeProfile.fontLabel": "اندازه برچسب (پیکسل)",
		"coffeeProfile.fontValue": "اندازه عدد (پیکسل)",
		"coffeeProfile.radius": "گردی گوشه (پیکسل)",
		"coffeeProfile.gap": "فاصله بلوک‌ها (پیکسل)",
		"coffeeProfile.barHeight": "ارتفاع نوار (پیکسل)",
		"coffeeProfile.strokeWidth": "ضخامت خط اسیدیته (پیکسل)",
		"coffeeProfile.color.card_bg": "پس‌زمینه کارت",
		"coffeeProfile.color.card_text": "متن کارت",
		"coffeeProfile.color.card_border": "حاشیه کارت",
		"coffeeProfile.color.track": "زمینه نوار",
		"coffeeProfile.color.blend_fill": "پرشدگی ترکیب",
		"coffeeProfile.color.acidity_line": "خط اسیدیته",
		"coffeeProfile.color.acidity_dot": "نقطه‌های اسیدیته",
		"coffeeProfile.color.caffeine_fill": "پرشدگی کافئین",
		"coffeeProfile.color.bitterness_fill": "پرشدگی تلخی",
		"coffeeProfile.color.sweetness_fill": "پرشدگی شیرینی",
		"coffeeProfile.color.body_fill": "پرشدگی بادی",
		"coffeeProfile.color.label": "برچسب‌ها",
		"coffeeProfile.color.value": "اعداد",
		"coffeeProfile.tabProfile": "نمودار چشایی",
		"coffeeProfile.tabBlend": "ترکیب شخصی",
		"coffeeProfile.blendShortcodeHint": "شورتکد فرم: [webino_coffee_blend] — حالت را می‌توانید با mode=\"simple\" یا mode=\"advanced\" قفل کنید.",
		"coffeeProfile.searchShortcodeHint": "شورتکد جستجوی پیشرفته: [webino_coffee_search] — فیلتر نوع دانه، اسیدیته، تلخی و کافئین روی همان صفحه.",
		"coffeeProfile.blendSectionCatalog": "کاتالوگ دان‌ها",
		"coffeeProfile.blendSectionPrice": "قیمت و وزن",
		"coffeeProfile.blendSectionSimple": "حالت ساده (روبوستا / عربیکا)",
		"coffeeProfile.blendSource": "منبع لیست دان‌ها",
		"coffeeProfile.blendSourceProfile": "همه محصولات دارای پروفایل قهوه",
		"coffeeProfile.blendSourceCategory": "دسته‌های انتخاب‌شده",
		"coffeeProfile.blendSourceProducts": "محصولات مشخص",
		"coffeeProfile.blendCategoryIds": "شناسه دسته‌ها (با ویرگول)",
		"coffeeProfile.blendProductIds": "محصولات کاتالوگ",
		"coffeeProfile.blendMode": "حالت پیش‌فرض شورتکد",
		"coffeeProfile.blendModeBoth": "هر دو (سوییچ ساده/پیشرفته)",
		"coffeeProfile.blendModeSimple": "فقط ساده",
		"coffeeProfile.blendModeAdvanced": "فقط پیشرفته",
		"coffeeProfile.blendMinBeans": "حداقل دان (پیشرفته)",
		"coffeeProfile.blendMaxBeans": "حداکثر دان (پیشرفته)",
		"coffeeProfile.blendPriceBasis": "مبنای قیمت",
		"coffeeProfile.blendPricePerKg": "قیمت محصول همان هر کیلوگرم است",
		"coffeeProfile.blendPricePack": "قیمت بسته است؛ هر کیلو از روی وزن بسته حساب شود",
		"coffeeProfile.blendDefaultPack": "وزن بسته پیش‌فرض (گرم)",
		"coffeeProfile.blendGrindFee": "هزینه آسیاب به‌ازای هر کیلو (اختیاری)",
		"coffeeProfile.blendWeights": "وزن‌های قابل خرید (گرم، با ویرگول)",
		"coffeeProfile.blendHolder": "شناسه محصول نگهدارنده سبد",
		"coffeeProfile.blendHolderHint": "اگر خالی بماند هنگام ذخیره یک محصول مخفی ساخته می‌شود.",
		"coffeeProfile.blendRobustaProduct": "محصول نماینده روبوستا",
		"coffeeProfile.blendArabicaProduct": "محصول نماینده عربیکا",
		"coffeeProfile.blendRoasts": "میزان‌های رست",
		"coffeeProfile.blendDevices": "دستگاه‌ها / درجه آسیاب",
		"coffeeProfile.blendSuggestions": "پیشنهادهای نسبت",
		"coffeeProfile.blendSuggestLabel": "برچسب",
		"coffeeProfile.blendSuggestHint": "توضیح کوتاه",
		"coffeeProfile.blendGuide": "متن راهنمای ترکیب",
		"coffeeProfile.packWeight": "وزن بسته این محصول (گرم)",
		"coffeeProfile.packWeightHint": "وقتی مبنای قیمت «بسته» باشد، قیمت هر کیلو از روی این وزن حساب می‌شود.",
		"balePay.title": "پرداخت بله",
		"balePay.subtitle": "فاکتور یک‌بارمصرف کیف‌پول بله از طریق بازوی فروشگاه.",
		"balePay.enabled": "فعال در چک‌اوت",
		"balePay.checkoutTitle": "عنوان درگاه",
		"balePay.description": "توضیح کوتاه چک‌اوت",
		"balePay.instructions": "متن راهنما وقتی چت بله پیدا نشود",
		"balePay.warnBot": "ماژول بازوی بله فعال نیست یا توکن تنظیم نشده.",
		"balePay.warnToken": "توکن پرداخت (provider_token) در تنظیمات بازوی بله نیست.",
		"balePay.botUsername": "نام کاربری بازو",
		"c2c.title": "کارت به کارت",
		"c2c.subtitle": "شماره کارت، شبا و مهلت پرداخت. مشتری رسید را آپلود می‌کند و ادمین از بله، تلگرام یا همین صفحه تأیید می‌کند.",
		"c2c.enabled": "فعال در چک‌اوت",
		"c2c.checkoutTitle": "عنوان درگاه",
		"c2c.instructions": "متن راهنمای مشتری",
		"c2c.iban": "شبا",
		"c2c.deadline": "مهلت پرداخت (ساعت)",
		"c2c.cards": "کارت‌ها",
		"c2c.addCard": "افزودن کارت",
		"c2c.cardNumber": "شماره کارت",
		"c2c.cardName": "صاحب کارت",
		"c2c.cardBank": "بانک",
		"c2c.receiptsTitle": "رسیدهای کارت‌به‌کارت",
		"c2c.receiptsSubtitle": "رسیدهای در انتظار تأیید. پس از تصمیم، دکمه‌های ربات هم با نام تأییدکننده به‌روز می‌شوند.",
		"c2c.empty": "رسید در انتظاری نیست.",
		"c2c.order": "سفارش",
		"c2c.amount": "مبلغ",
		"c2c.customer": "مشتری",
		"c2c.approve": "تأیید",
		"c2c.reject": "رد",
		"c2c.openOrder": "باز کردن سفارش",
		"c2c.noImage": "بدون تصویر",
		"marketplace.module.payment-module": "پرداخت",
		"marketplace.module.wallet-gateway-module": "کیف پول",
		"marketplace.module.card-to-card-gateway-module": "کارت به کارت",
		"paymentsHub.zarinpal": "زرین‌پال",
		"paymentsHub.digipay": "دیجی‌پی",
		"paymentsHub.snapppay": "اسنپ‌پی",
		"paymentsHub.torobpay": "ترب‌پی",
		"paymentsHub.balePay": "بله پی",
		"paymentsHub.wallet": "کیف پول",
		"paymentsHub.c2c": "کارت به کارت",
		"paymentsHub.openSettings": "تنظیمات درگاه",
		"paymentsHub.otherGateways": "سایر درگاه‌ها",
		"paymentsHub.warnModule": "این ماژول فعال نیست.",
		"paymentsHub.warnGateway": "درگاه ووکامرس ثبت نشده است.",
		"paymentsHub.unavailable": "این درگاه در دسترس نیست.",
		"paymentsHub.noOther": "درگاه دیگری ثبت نشده.",
		"bazaarHub.basalam": "باسلام",
		"bazaarHub.digikala": "دیجیکالا",
		"bazaarHub.snappshop": "اسنپ‌شاپ",
		"bazaarHub.tapsishop": "تپسی‌شاپ",
		"bazaarHub.technolife": "تکنولایف",
		"bazaarHub.emalls": "ایمالز",
		"bazaarHub.torob": "ترب",
		"bazaarHub.zarehbin": "ذره‌بین",
		"bazaarHub.snapppaySearch": "اسنپ‌پی سرچ",
		"bazaarHub.openSettings": "تنظیمات اتصال",
		"bazaarHub.warnModule": "این ماژول فعال نیست.",
		"bazaarHub.unavailable": "این اتصال در دسترس نیست.",
		"wallet.title": "کیف پول",
		"wallet.subtitle": "پرداخت از موجودی مشتری در فروشگاه. شارژ با درگاه‌های دیگر انجام می‌شود.",
		"wallet.enabled": "فعال در چک‌اوت",
		"wallet.checkoutTitle": "عنوان درگاه",
		"wallet.minTopup": "حداقل شارژ (تومان)",
		"wallet.minTopupHint": "حداقل مبلغ شارژ: {{amount}}",
		"wallet.accountTitle": "کیف پول",
		"wallet.accountSubtitle": "موجودی، شارژ، برداشت و تاریخچه تراکنش‌ها.",
		"wallet.balance": "موجودی",
		"wallet.topup": "شارژ کیف پول",
		"wallet.topupPay": "پرداخت و شارژ",
		"wallet.withdraw": "برداشت به شبا",
		"wallet.withdrawSubmit": "ثبت درخواست برداشت",
		"wallet.needSheba": "برای برداشت ابتدا شبا را در پروفایل ثبت کنید.",
		"wallet.editProfile": "ویرایش پروفایل",
		"wallet.refundMethod": "روش مرجوعی",
		"wallet.refundWallet": "به کیف پول",
		"wallet.refundBank": "به کارت / شبا",
		"wallet.ledger": "تاریخچه",
		"wallet.ledgerEmpty": "تراکنشی نیست.",
		"wallet.col.date": "تاریخ",
		"wallet.col.reason": "علت",
		"wallet.col.amount": "مبلغ",
		"wallet.col.balance": "مانده",
		"wallet.withdrawalsTitle": "برداشت‌های کیف پول",
		"wallet.withdrawalsSubtitle": "درخواست‌های در انتظار تأیید.",
		"wallet.withdrawalsEmpty": "درخواستی در انتظار نیست.",
		"wallet.approve": "تأیید",
		"wallet.markPaid": "پرداخت شد",
		"wallet.reject": "رد",
		"wallet.credit": "افزایش موجودی",
		"wallet.debit": "کاهش موجودی",
		"wallet.adjust": "اعمال",
		"wallet.reason.topup": "شارژ",
		"wallet.reason.checkout": "خرید",
		"wallet.reason.checkout_restore": "بازگشت خرید",
		"wallet.reason.withdraw_request": "برداشت",
		"wallet.reason.withdraw_rejected": "رد برداشت",
		"wallet.reason.order_refund": "مرجوعی سفارش",
		"wallet.reason.admin_adjust": "تنظیم ادمین",
		"notifications.hubTitle": "سیستم اعلان",
		"notifications.hubSubtitle": "اعلان‌های سایت، پیامک، بله، تلگرام، ایمیل و OTP ورود را از یکجا مدیریت کنید.",
		"notifications.tabs.site": "اعلان سایت",
		"notifications.tabs.sms": "پیامک",
		"notifications.tabs.bale": "بله",
		"notifications.tabs.telegram": "تلگرام",
		"notifications.tabs.email": "ایمیل",
		"notifications.tabs.otp": "ورود OTP",
		"notifications.enabled": "فعال",
		"notifications.otp.title": "OTP چندکاناله",
		"notifications.otp.hint": "همان کد ورود/ثبت‌نام روی همه کانال‌های فعال و قابل‌تحویل (پیامک، ایمیل، بله، تلگرام) ارسال می‌شود.",
		"notifications.otp.loginEnabled": "ورود با OTP",
		"notifications.otp.registerEnabled": "ثبت‌نام با OTP",
		"notifications.otp.siteNotice": "ثبت اعلان سایت پس از ورود موفق با OTP",
		"notifications.otp.length": "طول کد",
		"notifications.otp.expiry": "انقضا (دقیقه)",
		"notifications.otp.maxAttempts": "حداکثر تلاش",
		"notifications.otp.channels": "کانال‌های ارسال",
		"notifications.otp.channelsHint": "فقط کانال‌هایی که برای همان شناسه مقصد دارند استفاده می‌شوند.",
		"notifications.otp.smsPatternsHint": "خط ارسال و الگوهای مدیرپیامک در بخش",
		"notifications.otp.templates": "قالب پیام",
		"notifications.otp.templatesHint": "جایگزین‌ها: {code} و {site_name}.",
		"notifications.otp.templateLogin": "قالب ورود",
		"notifications.otp.templateRegister": "قالب ثبت‌نام",
		"notifications.site.title": "اعلان درون‌برنامه‌ای",
		"notifications.site.hint": "اعلان‌ها در زنگ هدر داشبورد برای مشتری و مدیر ثبت و نمایش داده می‌شوند.",
		"notifications.variablesHint": "متغیرهای قابل استفاده در قالب‌ها:",
		"notifications.eventsMatrix": "رویدادها و مخاطبان",
		"notifications.event": "رویداد",
		"notifications.customer": "مشتری",
		"notifications.admin": "مدیر",
		"notifications.templates": "قالب",
		"notifications.titleCustomer": "عنوان (مشتری)",
		"notifications.bodyCustomer": "متن (مشتری)",
		"notifications.titleAdmin": "عنوان (مدیر)",
		"notifications.bodyAdmin": "متن (مدیر)",
		"notifications.moduleMissing": "ماژول {{module}} نصب یا فعال نیست.",
		"notifications.bellLabel": "اعلان‌ها",
		"notifications.bellTitle": "اعلان‌ها",
		"notifications.unreadCount": "{{count}} خوانده‌نشده",
		"notifications.viewAll": "مشاهده همه",
		"notifications.email.title": "اعلان‌های ایمیل",
		"notifications.email.hint": "قالب و مخاطب هر رویداد را تنظیم کنید. SMTP اختیاری است.",
		"notifications.email.tabTemplates": "قالب‌ها",
		"notifications.email.tabSmtp": "SMTP",
		"notifications.email.tabWc": "ایمیل‌های ووکامرس",
		"notifications.email.subjectCustomer": "موضوع (مشتری)",
		"notifications.email.bodyCustomer": "بدنه HTML (مشتری)",
		"notifications.email.subjectAdmin": "موضوع (مدیر)",
		"notifications.email.bodyAdmin": "بدنه HTML (مدیر)",
		"notifications.email.smtpTitle": "تنظیمات SMTP",
		"notifications.email.smtpHint": "در صورت فعال بودن، همهٔ ایمیل‌های وردپرس از این SMTP عبور می‌کنند.",
		"notifications.email.smtpEnabled": "استفاده از SMTP سفارشی",
		"notifications.email.host": "هاست",
		"notifications.email.port": "پورت",
		"notifications.email.encryption": "رمزنگاری",
		"notifications.email.username": "نام کاربری",
		"notifications.email.password": "رمز عبور",
		"notifications.email.passwordSet": "ذخیره‌شده",
		"notifications.email.fromName": "نام فرستنده",
		"notifications.email.fromEmail": "ایمیل فرستنده",
		"notifications.email.testTo": "گیرندهٔ تست",
		"notifications.email.testToPlaceholder": "خالی = ایمیل مدیر سایت",
		"notifications.email.sendTest": "ارسال تست",
		"notifications.email.testSent": "ایمیل تست ارسال شد",
		"users.roleSeller": "فروشنده",
		"users.roleAccountant": "حسابدار",
		"pos.title": "صندوق",
		"pos.badge": "صندوق",
		"pos.myOrders": "سفارش‌های صندوق من",
		"pos.searchPlaceholder": "جستجو یا اسکن بارکد / کد کالا…",
		"pos.emptyCart": "سبد خالی است",
		"pos.customer": "مشتری",
		"pos.customerSearch": "جستجو با موبایل یا نام…",
		"pos.newPhone": "موبایل",
		"pos.newName": "نام",
		"pos.channel": "کانال فروش",
		"pos.channel.in_store": "حضوری",
		"pos.channel.phone": "تلفنی",
		"pos.channel.bale": "بله",
		"pos.channel.eitaa": "ایتا",
		"pos.channel.rubika": "روبیکا",
		"pos.channel.telegram": "تلگرام",
		"pos.channel.instagram": "اینستاگرام",
		"pos.channel.other": "سایر",
		"pos.tender": "روش پرداخت",
		"pos.tender.cash": "نقدی",
		"pos.tender.card_to_card": "کارت به کارت",
		"pos.tender.pos_terminal": "کارتخوان",
		"pos.tender.online": "آنلاین",
		"pos.tender.other": "سایر",
		"pos.showExtras": "نمایش تخفیف / ارسال",
		"pos.hideExtras": "مخفی کردن موارد اضافی",
		"pos.discount": "تخفیف",
		"pos.shipping": "ارسال / هزینه",
		"pos.amountPaid": "مبلغ دریافتی",
		"pos.subtotal": "جمع جزء",
		"pos.total": "جمع کل",
		"pos.change": "باقی‌مانده به مشتری",
		"pos.remaining": "مانده",
		"pos.checkout": "ثبت فروش",
		"pos.orderCreated": "سفارش #{{id}} ثبت شد",
		"pos.simpleMode": "صندوق ساده",
		"pos.qty": "تعداد",
		"pos.price": "قیمت",
		"pos.address": "آدرس",
		"pos.city": "شهر",
		"pos.state": "استان",
		"pos.buyerTax": "پروفایل مالیاتی خریدار",
		"pos.personNatural": "حقیقی",
		"pos.personLegal": "حقوقی",
		"pos.nationalId": "کد ملی",
		"pos.economicCode": "کد اقتصادی",
		"pos.purchaseType": "نوع خرید",
		"pos.purchase.cash": "نقدی",
		"pos.purchase.credit": "اعتباری",
		"pos.purchase.installment": "اقساطی",
		"pos.purchase.wholesale": "عمده",
		"pos.coupon": "کد تخفیف",
		"pos.sendMoadianAfter": "صف ارسال مودیان پس از ثبت",
		"pos.moadianQueued": "سینک حسابداری / مودیان در صف قرار گرفت",
		"orders.newOrder": "سفارش جدید",
		"orders.editOrder": "ویرایش سفارش",
		"orders.moadianSync": "ساخت / ارسال صورتحساب مودیان",
		"orders.moadianSynced": "سفارش به حسابداری سینک شد",
		"accounting.nav.chart": "کدینگ حساب‌ها",
		"accounting.nav.installments": "اقساط",
		"accounting.nav.production": "تولید",
		"accounting.nav.tools": "ابزارها",
		"accounting.fiscalYears": "سال‌های مالی",
		"accounting.col.postable": "قابل ثبت",
		"accounting.col.from": "از",
		"accounting.col.to": "تا",
		"accounting.col.closed": "بسته",
		"accounting.col.person": "شخص",
		"accounting.col.paid": "پرداخت‌شده",
		"accounting.report.balanceSheet": "ترازنامه (دارایی)",
		"accounting.report.taxable": "درآمد مشمول",
		"accounting.report.exempt": "درآمد معاف",
		"accounting.report.cashFlow": "جریان نقد (خالص)",
		"accounting.backup": "پشتیبان ZIP",
		"accounting.exportCsv": "خروجی CSV فاکتورها",
		"accounting.calculator": "ماشین‌حساب نمونه ٪",
		"accounting.moadianProxy": "پروکسی HTTP (هاست خارج)"
	};
})), sp = /* @__PURE__ */ k({ default: () => cp }), cp, lp = O((() => {
	cp = {
		"app.title": "Dashboard",
		"chart.totalVisitors": "Total visitors",
		"chart.descriptionLong": "Total for the last 3 months",
		"chart.descriptionShort": "Last 3 months",
		"chart.range3m": "Last 3 months",
		"chart.range30d": "Last 30 days",
		"chart.range7d": "Last 7 days",
		"chart.visitors": "Visitors",
		"chart.desktop": "Desktop",
		"chart.mobile": "Mobile",
		"commandPalette.title": "Command palette",
		"commandPalette.description": "Search for a command to run…",
		"calendar.weekday.0": "Su",
		"calendar.weekday.1": "Mo",
		"calendar.weekday.2": "Tu",
		"calendar.weekday.3": "We",
		"calendar.weekday.4": "Th",
		"calendar.weekday.5": "Fr",
		"calendar.weekday.6": "Sa",
		"seo.pageDescription": "{{page}} — {{site}}",
		"seo.loginDescription": "Sign in to the store dashboard ({{site}}).",
		"nav.overview": "Overview",
		"nav.logout": "Sign out",
		"nav.fullscreen": "Fullscreen",
		"login.title": "Sign in",
		"login.registerTitle": "Create account",
		"login.subtitle": "Use email, username, or phone linked to your account",
		"login.otpSubtitle": "We send a one-time code on your enabled channels",
		"login.identifier": "Email, username, or phone",
		"login.otpIdentifier": "Email or mobile number",
		"login.password": "Password",
		"login.submit": "Continue",
		"login.remember": "Stay signed in on this device",
		"login.backHome": "Back to site",
		"login.heroHint": "Sign in with the same account you use to manage this site.",
		"login.error": "Could not sign in",
		"login.pending": "Signing in…",
		"login.modePassword": "Password",
		"login.modeOtp": "One-time code",
		"login.otpLogin": "Sign in",
		"login.otpRegister": "Register",
		"login.otpCode": "Verification code",
		"login.otpSend": "Send code",
		"login.otpResend": "Resend code",
		"login.otpSent": "Verification code sent",
		"login.otpSentVia": "Sent via {{channels}}",
		"login.registerWithOtp": "Register with a one-time code",
		"login.channel.sms": "SMS",
		"login.channel.email": "email",
		"login.channel.bale": "Bale",
		"login.channel.telegram": "Telegram",
		"login.channelJoin": " and ",
		"nav.moreActions": "More",
		"nav.visitSite": "Visit site",
		"nav.platform": "Platform",
		"nav.section.content": "Content",
		"nav.section.shop": "Store",
		"nav.section.tools": "Tools",
		"nav.section.reports": "Reports",
		"nav.section.admin": "Admin",
		"nav.siteSubtitle": "Site",
		"nav.projectsSection": "Projects",
		"nav.singleNavHint": "Only Overview appears because your role has no extra dashboard permissions yet. Ask a site administrator to assign capabilities (e.g. Shop Manager, Editor) if you need store or content sections.",
		"nav.module.home": "Overview",
		"nav.module.magazine": "Magazine",
		"nav.module.posts": "All posts",
		"nav.module.post-new": "Add post",
		"nav.module.categories": "Categories",
		"nav.module.media": "Media library",
		"nav.module.media-library": "Media",
		"nav.module.media-folders": "Folders",
		"nav.module.media-categories": "Categories",
		"nav.module.pages": "Site pages",
		"nav.module.shop": "Store",
		"nav.module.products": "Products",
		"nav.module.product-new": "Add product",
		"nav.module.brands": "Brands",
		"nav.module.product-cats": "Product categories",
		"nav.module.attributes": "Attributes",
		"nav.module.wfcp-bulk": "Price list (bulk)",
		"nav.module.wfcp-quick": "Quick add products",
		"nav.module.wfcp-price": "Bulk price change",
		"nav.module.bots": "Bots",
		"nav.module.bale-bot": "Bale bot (WooBale)",
		"nav.module.telegram-bot": "Telegram bot",
		"nav.module.bot-broadcast": "Bot broadcast",
		"nav.module.bot-campaigns": "Bot campaigns",
		"nav.module.sms-panel": "SMS panel",
		"nav.module.sms-home": "SMS home",
		"nav.module.sms-send": "Send SMS",
		"nav.module.sms-reports": "Reports",
		"nav.module.sms-targeted": "Targeted",
		"nav.module.sms-inbox": "Inbox",
		"nav.module.sms-drafts": "Drafts",
		"nav.module.sms-phonebook": "Phonebook",
		"nav.module.sms-scheduled": "Scheduled",
		"nav.module.sms-patterns": "Patterns",
		"nav.module.sms-secretaries": "Secretaries",
		"nav.module.sms-wallet": "Wallet",
		"nav.module.sms-lines": "Lines",
		"nav.module.sms-newsletter": "Newsletter",
		"nav.module.sms-topup": "Top up",
		"nav.module.orders": "Orders",
		"nav.module.order-list": "Orders",
		"nav.module.partner-orders": "My orders",
		"nav.module.partner-account": "My account",
		"nav.module.account-portal": "My account",
		"nav.module.account-home": "Overview",
		"nav.module.account-orders": "My orders",
		"nav.module.account-addresses": "Addresses",
		"nav.module.account-notifications": "Notifications",
		"nav.module.account-favorites": "Favorites",
		"nav.module.account-reviews": "Reviews & questions",
		"nav.module.account-profile": "Account info",
		"nav.module.account-wallet": "Wallet",
		"nav.module.account-tickets": "Support",
		"nav.module.shop-tickets": "Support tickets",
		"nav.module.order-reports": "Reports",
		"nav.module.marketing": "Marketing",
		"nav.module.coupons": "Coupons",
		"nav.module.users": "Users",
		"nav.module.user-list": "Users",
		"nav.module.user-new": "Add user",
		"nav.module.comments": "Comments",
		"nav.module.analytics": "Analytics",
		"nav.module.analytics-overview": "Overview",
		"nav.module.analytics-visitors": "Visitor analytics",
		"nav.module.analytics-pages": "Page analytics",
		"nav.module.analytics-referrals": "Referrals",
		"nav.module.analytics-geo": "Geography",
		"nav.module.analytics-devices": "Devices",
		"nav.module.analytics-bots": "Bot statistics",
		"nav.module.marketplace": "Marketplace",
		"nav.module.marketplace-catalog": "Browse modules",
		"nav.module.my-modules": "My modules",
		"datePicker.placeholder": "Date",
		"nav.module.settings": "Settings",
		"nav.module.settings-app": "Settings",
		"nav.module.settings-site": "Site management",
		"nav.module.settings-shop": "Shop management",
		"nav.module.wfcp-dashboard": "WFCP dashboard",
		"nav.module.wfcp-currency": "Currency",
		"nav.module.wfcp-exchange": "Exchange rate",
		"nav.module.wfcp-retail": "Retail pricing",
		"nav.module.wfcp-credit": "Credit",
		"nav.module.wfcp-installment": "Installments",
		"nav.module.wfcp-wholesale": "Wholesale",
		"nav.module.wfcp-notifications": "Texts & descriptions",
		"nav.module.wfcp-style": "Styles",
		"nav.module.wfcp-advanced": "Advanced",
		"nav.module.pos": "Cashier",
		"nav.module.pos-register": "Register",
		"nav.module.pos-my-orders": "My POS orders",
		"nav.module.accounting-module": "Accounting",
		"nav.module.accounting-overview": "Overview",
		"nav.module.accounting-chart": "Chart of accounts",
		"nav.module.accounting-journals": "Journals",
		"nav.module.accounting-persons": "Persons",
		"nav.module.accounting-products": "Products",
		"nav.module.accounting-invoices": "Invoices",
		"nav.module.accounting-purchases": "Purchases",
		"nav.module.accounting-expenses": "Expenses",
		"nav.module.accounting-treasury": "Treasury",
		"nav.module.accounting-checks": "Checks",
		"nav.module.accounting-installments": "Installments",
		"nav.module.accounting-warehouses": "Warehouses",
		"nav.module.accounting-production": "Production",
		"nav.module.accounting-moadian": "Moadian",
		"nav.module.accounting-hesabfa": "Hesabfa",
		"nav.module.accounting-payroll": "Payroll",
		"nav.module.accounting-my-payroll": "My payslips",
		"nav.module.accounting-projects": "Projects",
		"nav.module.accounting-reports": "Reports",
		"nav.module.accounting-tools": "Tools",
		"nav.module.wallet-withdrawals": "Wallet withdrawals",
		"nav.module.c2c-receipts": "Card-to-card receipts",
		"nav.userFallback": "Signed in",
		"home.welcome": "Welcome",
		"home.wooOn": "Store module is active",
		"home.wooOff": "Store module is off",
		"home.wfcpOn": "Advanced pricing module is active",
		"home.wfcpOff": "Advanced pricing module is off",
		"home.noPosts": "No recent posts yet.",
		"home.noOrders": "No recent orders yet.",
		"home.partner.title": "My orders",
		"home.partner.orderCount": "Order count",
		"home.partner.lastOrder": "Last order",
		"home.flags": "Integrations",
		"home.recentPosts": "Recent posts",
		"home.recentOrders": "Recent orders",
		"home.recentProducts": "Recent products",
		"home.ctaNewPost": "Write a post",
		"home.ctaViewOrders": "Open orders",
		"home.viewAll": "View all",
		"home.noProducts": "No recent products yet.",
		"home.sections.products": "Products",
		"home.sections.sales": "Sales",
		"home.sections.traffic": "Traffic",
		"home.sections.sms": "SMS",
		"home.sections.alerts": "Alerts",
		"home.sections.lists": "Lists",
		"home.sections.kpis": "This month at a glance",
		"home.sections.charts": "Charts & insights",
		"home.sections.breakdown": "Orders breakdown",
		"home.products.total": "Total products",
		"home.products.byStatusTitle": "By status",
		"home.products.byStockTitle": "By stock",
		"home.products.byStatus.publish": "Published",
		"home.products.byStatus.draft": "Draft",
		"home.products.byStatus.pending": "Pending",
		"home.products.byStatus.private": "Private",
		"home.products.byStatus.trash": "Trash",
		"home.products.byStock.instock": "In stock",
		"home.products.byStock.outofstock": "Out of stock",
		"home.products.byStock.onbackorder": "On backorder",
		"home.sales.last30": "Sales (last 30 days)",
		"home.sms.charge": "SMS balance",
		"home.sms.topup": "Top up",
		"home.sms.lowBalance": "SMS balance is low.",
		"home.sms.checking": "Checking SMS wallet…",
		"home.sms.fetchFailed": "Could not refresh SMS balance.",
		"home.sms.retry": "Retry",
		"home.traffic.onlineNow": "Online now",
		"home.traffic.highlightVisitors": "Visitors (7 days excl. today)",
		"home.traffic.periodsTitle": "Period stats",
		"home.traffic.period": "Period",
		"home.traffic.periodToday": "Today",
		"home.traffic.periodYesterday": "Yesterday",
		"home.traffic.last7ExclToday": "Last 7 days (excl. today)",
		"home.traffic.last14ExclToday": "Last 14 days (excl. today)",
		"home.traffic.allTime": "All time",
		"home.traffic.changeVsPrev": "Change vs previous",
		"home.traffic.chartTitle": "Traffic (last 30 days)",
		"home.tables.topByViews": "Top products by views",
		"home.alerts.source.license": "License",
		"home.alerts.source.sms-panel": "SMS panel",
		"home.alerts.source.bale-bot": "Bale bot",
		"home.alerts.source.telegram-bot": "Telegram bot",
		"home.disabled.woocommerce": "Store module is off or you lack access.",
		"home.disabled.analytics": "Analytics module is disabled.",
		"home.disabled.sms": "SMS panel is disabled.",
		"home.disabled.openSettings": "Open settings",
		"home.sales.thisMonth": "Sales this month",
		"home.sales.viewDetails": "Full sales report",
		"home.traffic.viewDetails": "Full analytics",
		"home.tasks.processing": "Processing",
		"home.tasks.onHold": "On hold",
		"home.tasks.commentsPending": "Comments pending",
		"home.tasks.outOfStock": "Out of stock",
		"home.panels.crmWallet": "Platform wallet",
		"home.panels.smsUnitPrice": "Cost per SMS",
		"home.panels.smsUnavailable": "Wallet connection unavailable",
		"home.panels.smsCharge": "SMS panel balance",
		"home.traffic.vsPrevPeriod": "Previous period",
		"home.traffic.last7Recent": "Last 7 days",
		"home.traffic.last14Recent": "Last 14 days",
		"home.traffic.onlineVisitors": "Online visitors",
		"home.traffic.recentDays": "Recent days",
		"home.panels.license": "License",
		"home.panels.active": "Active",
		"home.panels.inactive": "Inactive",
		"home.panels.webhookOk": "Webhook OK",
		"home.panels.webhookOff": "Webhook not set",
		"home.panels.bot.bale": "Bale bot",
		"home.panels.bot.telegram": "Telegram bot",
		"home.tables.colOrder": "Order",
		"home.tables.colCustomer": "Customer",
		"home.tables.colStatus": "Status",
		"home.tables.colTotal": "Total",
		"home.tables.colDate": "Date",
		"home.comments.queueTitle": "Comments awaiting approval",
		"home.orders.emptyMonth": "No orders this month yet.",
		"settings.theme": "Theme",
		"settings.language": "Language",
		"settings.pageTitle": "Settings",
		"settings.sectionNav": "Settings sections",
		"settings.hub.title": "Settings",
		"settings.hub.description": "Manage site and shop configuration.",
		"settings.hub.siteTitle": "Site management",
		"settings.hub.siteDescription": "General site options, privacy, license, and dashboard preferences.",
		"settings.hub.shopTitle": "Shop management",
		"settings.hub.shopDescription": "Online store settings, invoices, SMS, and pricing.",
		"settings.hub.openSite": "Open site settings",
		"settings.hub.openShop": "Open shop settings",
		"settings.modules.stripTitle": "Settings units",
		"settings.modules.tabsLabel": "Sections",
		"settings.modules.sectionCount": "{{count}} sections",
		"settings.modules.activeHint": "Configure this unit using the tabs below.",
		"settings.modules.pickHint": "Pick a card above to open its settings.",
		"settings.modules.scrollPrev": "Scroll cards left",
		"settings.modules.scrollNext": "Scroll cards right",
		"settings.modules.wfcp.dashboard": "Dashboard",
		"settings.modules.wfcp.platform": "Platform",
		"settings.shop.formTitle": "Shop settings",
		"settings.shop.formHint": "Options are grouped into clear cards.",
		"settings.site.title": "Site management",
		"settings.site.description": "General site configuration and dashboard options.",
		"settings.site.sections.general": "General",
		"settings.site.sections.privacy": "Accounts & privacy",
		"settings.site.sections.license": "License",
		"settings.site.sections.dashboard": "Dashboard",
		"coreUpdate.title": "Dashboard core update",
		"coreUpdate.description": "Install the latest dashboard release from your licensed update channel. Installed modules are not removed.",
		"coreUpdate.current": "Installed",
		"coreUpdate.latest": "Latest",
		"coreUpdate.available": "Update available",
		"coreUpdate.upToDate": "Up to date",
		"coreUpdate.checkAgain": "Check again",
		"coreUpdate.install": "Install update",
		"coreUpdate.confirm": "Update the dashboard core now? A backup will be created and the page will reload when finished.",
		"coreUpdate.success": "Dashboard updated to version {{version}}. Reloading…",
		"coreUpdate.refreshed": "Update status refreshed.",
		"coreUpdate.licenseRequired": "An active license is required to check for or install core updates.",
		"coreUpdate.crmUnavailable": "Could not reach the license service for update information.",
		"coreUpdate.packageMissing": "The latest release package is not available yet. Publish a core release on the license service first.",
		"buildPipeline.title": "Release build pipeline",
		"buildPipeline.description": "Install client dependencies, compile the dashboard, verify assets, compile translations, and create a release ZIP on this server (development hosts only).",
		"buildPipeline.run": "Run release pipeline",
		"buildPipeline.cancel": "Cancel",
		"buildPipeline.refresh": "Refresh status",
		"buildPipeline.confirm": "Run the full release build on this server? This may take several minutes.",
		"buildPipeline.started": "Build pipeline started in background.",
		"buildPipeline.cancelled": "Build cancelled.",
		"buildPipeline.success": "Release build completed successfully.",
		"buildPipeline.licenseRequired": "An active license is required to run the build pipeline.",
		"buildPipeline.statusIdle": "Idle",
		"buildPipeline.statusRunning": "Running",
		"buildPipeline.statusSuccess": "Success",
		"buildPipeline.statusFailed": "Failed",
		"buildPipeline.artifact": "Release ZIP",
		"buildPipeline.devOnly": "Release build is disabled on production. Enable WP_DEBUG, use a local host, or set WEBINO_DASHBOARD_ALLOW_BUILD_PIPELINE in wp-config.php.",
		"digikala.title": "Digikala",
		"digikala.subtitle": "Digikala seller OpenAPI with RSA-4096 authentication.",
		"digikala.syncTitle": "Digikala Sync",
		"digikala.syncSubtitle": "Queue product, inventory, and order sync jobs.",
		"digikala.jobsTitle": "Digikala Jobs",
		"digikala.jobsSubtitle": "Monitor background jobs and integration logs.",
		"digikala.logsTitle": "Digikala Logs",
		"digikala.clientCode": "Client code",
		"digikala.clientSecret": "Client secret",
		"digikala.authorizationCode": "Authorization code",
		"digikala.webhookSecret": "Webhook secret",
		"digikala.webhookUrl": "Webhook URL",
		"digikala.autoSync": "Enable automatic sync from store events",
		"digikala.testConnection": "Test connection",
		"digikala.testOk": "Digikala connection verified.",
		"digikala.jobQueued": "Sync job queued.",
		"digikala.syncImport": "Import products",
		"digikala.syncExport": "Export products",
		"digikala.syncInventory": "Sync inventory",
		"digikala.syncOrdersPull": "Pull orders",
		"digikala.syncOrdersPush": "Push order status",
		"digikala.syncPhase2Shipments": "Sync shipments/package",
		"digikala.syncPhase2Finance": "Sync invoices/finance",
		"digikala.syncPhase2Promotions": "Sync promotions",
		"digikala.syncPhase2Sbs": "Sync SBS/drop shipping",
		"digikala.healthTitle": "Integration health",
		"digikala.alertsTitle": "Alerts",
		"digikala.webhookMatrixTitle": "Webhook matrix",
		"digikala.reconcileAll": "Reconcile all",
		"digikala.reconcileProducts": "Reconcile products",
		"digikala.reconcileOrders": "Reconcile orders",
		"digikala.reconcileInventory": "Reconcile inventory",
		"digikala.reconcileQueued": "Reconciliation jobs queued.",
		"digikala.endpointCoverageTitle": "Endpoint-level coverage",
		"digikala.endpointMethod": "Method",
		"digikala.endpointPath": "Path",
		"digikala.endpointStatus": "Status",
		"digikala.endpointSource": "Source",
		"digikala.endpointSources": "Sources",
		"digikala.endpointJobTypes": "Job types",
		"digikala.endpointDispatchers": "Dispatchers",
		"digikala.endpointConfidence": "Confidence",
		"digikala.endpointFilterStatus": "Status filter: all|implemented|queued|pending",
		"digikala.endpointFilterStatusAll": "All statuses",
		"digikala.endpointFilterStatusImplemented": "Implemented",
		"digikala.endpointFilterStatusQueued": "Queued",
		"digikala.endpointFilterStatusPending": "Pending",
		"digikala.endpointFilterJobType": "Filter by job type",
		"digikala.endpointFilterDispatcher": "Filter by dispatcher",
		"torobExtractor.title": "Torob Extractor",
		"torobExtractor.pageTitle": "Torob Products Extractor",
		"torobExtractor.runtimeStatus": "Runtime status",
		"torobExtractor.wcReady": "WooCommerce",
		"torobExtractor.extractor": "Extractor",
		"torobExtractor.statusReady": "ready",
		"torobExtractor.statusMissing": "missing",
		"torobExtractor.statusLoaded": "loaded",
		"torobExtractor.statusNotLoaded": "not loaded",
		"torobExtractor.enable": "Enable extractor",
		"torobExtractor.feedToken": "Feed token",
		"torobExtractor.publicKey": "Public key",
		"torobExtractor.autoSync": "Auto sync",
		"torobExtractor.syncInterval": "Sync interval (hours)",
		"torobpay.title": "TorobPay",
		"torobpay.pageTitle": "TorobPay Gateway",
		"torobpay.runtimeStatus": "Runtime status",
		"torobpay.wcReady": "WooCommerce",
		"torobpay.gateway": "Gateway",
		"torobpay.statusReady": "ready",
		"torobpay.statusMissing": "missing",
		"torobpay.statusLoaded": "loaded",
		"torobpay.statusNotLoaded": "not loaded",
		"torobpay.enableGateway": "Enable gateway",
		"torobpay.fieldTitle": "Title",
		"torobpay.fieldDescription": "Description",
		"torobpay.merchantCode": "Merchant code",
		"torobpay.apiKey": "API key",
		"torobpay.sandbox": "Sandbox",
		"snapppay.title": "SnappPay",
		"snapppay.pageTitle": "SnappPay Gateway",
		"snapppay.runtimeStatus": "Runtime status",
		"snapppay.wcReady": "WooCommerce",
		"snapppay.gateway": "Gateway",
		"snapppay.searchwise": "Searchwise",
		"snapppay.statusReady": "ready",
		"snapppay.statusMissing": "missing",
		"snapppay.statusLoaded": "loaded",
		"snapppay.statusNotLoaded": "not loaded",
		"snapppay.enableGateway": "Enable gateway",
		"snapppay.fieldTitle": "Title",
		"snapppay.fieldDescription": "Description",
		"snapppay.merchantId": "Merchant ID",
		"snapppay.clientId": "Client ID",
		"snapppay.clientSecret": "Client secret",
		"snapppay.sandbox": "Sandbox",
		"basalam.title": "Basalam",
		"basalam.subtitle": "Full Basalam integration with your online store and dashboard.",
		"basalam.settingsTitle": "Connection settings",
		"basalam.statusTitle": "Operational status",
		"basalam.coverageTitle": "Endpoint coverage",
		"basalam.reconcileNow": "Run reconcile",
		"basalam.reconcileQueued": "Reconciliation jobs queued.",
		"basalam.paymentsTitle": "Basalam Gateway",
		"basalam.walletTitle": "Basalam Wallet",
		"basalam.subscriptionsTitle": "Basalam Subscriptions",
		"basalam.webhooksTitle": "Basalam Webhooks",
		"basalam.operationsTitle": "Basalam Operations",
		"basalam.connection": "Connection",
		"basalam.connectionHint": "Connect your Basalam booth via OAuth.",
		"basalam.oauthWafHint": "First click Connect (Basalam SSO). An English CDN 403 page means the token was NOT saved yet — copy the full address-bar URL from that error page and paste it below. A JWT in the URL alone does not mean the dashboard is connected.",
		"basalam.oauthPasteTitle": "Complete connection from return URL",
		"basalam.oauthPasteHint": "Paste the full address-bar URL from the 403 page (including access_token) and save. It posts via admin-ajax so the JWT never hits the CDN as a GET.",
		"basalam.oauthPastePlaceholder": "https://yoursite.com/wp-admin/admin.php?page=basalam-save-token&access_token=…",
		"basalam.oauthPasteSave": "Save token from URL",
		"basalam.connected": "Connected",
		"basalam.notConnected": "Not connected",
		"basalam.connectOAuth": "Connect with Basalam",
		"basalam.oauthMissingUrl": "OAuth URL missing",
		"basalam.operations": "Operations",
		"basalam.operationsHint": "Sync products and orders with the Basalam engine.",
		"basalam.pullOrders": "Pull orders",
		"basalam.ordersPullQueued": "Order pull job queued.",
		"basalam.webhook": "Order webhook URL",
		"basalam.nav.products": "Products",
		"basalam.nav.orders": "Orders",
		"basalam.nav.categories": "Categories",
		"basalam.nav.settings": "Settings",
		"basalam.nav.finance": "Finance",
		"basalam.nav.tickets": "Tickets",
		"basalam.nav.logs": "Logs",
		"basalam.productsTitle": "Basalam products",
		"basalam.productsSubtitle": "Create, update, and auto-connect WooCommerce products to Basalam.",
		"basalam.productActions": "Bulk actions",
		"basalam.createAll": "Create all",
		"basalam.updateAll": "Update all",
		"basalam.quickUpdate": "Quick update",
		"basalam.autoConnect": "Auto-connect",
		"basalam.cancelJobs": "Cancel jobs",
		"basalam.jobQueued": "Job queued.",
		"basalam.recentJobs": "Recent jobs",
		"basalam.ordersTitle": "Basalam orders",
		"basalam.ordersSubtitle": "Pull Basalam parcels and run vendor actions.",
		"basalam.vendorActions": "Vendor actions",
		"basalam.wcOrderId": "WooCommerce order ID",
		"basalam.trackingCode": "Tracking code",
		"basalam.confirmOrder": "Confirm",
		"basalam.cancelOrder": "Cancel",
		"basalam.shipOrder": "Ship / tracking",
		"basalam.orderActionOk": "Order action sent.",
		"basalam.categoriesTitle": "Category mapping",
		"basalam.categoriesSubtitle": "Map WooCommerce categories to Basalam category tree.",
		"basalam.addMapping": "Add mapping",
		"basalam.saveMapping": "Save mapping",
		"basalam.mappingSaved": "Mapping saved.",
		"basalam.mappingDeleted": "Mapping deleted.",
		"basalam.mappings": "Mappings",
		"basalam.delete": "Delete",
		"basalam.settingsSubtitle": "Product/order sync toggles (Basalam settings).",
		"basalam.syncToggles": "Sync toggles",
		"basalam.syncProducts": "Auto sync products",
		"basalam.syncOrders": "Auto sync orders",
		"basalam.autoConfirm": "Auto-confirm orders",
		"basalam.developerMode": "Developer mode",
		"basalam.settingsSaved": "Settings saved.",
		"basalam.rawSettings": "All settings",
		"basalam.financeTitle": "Finance",
		"basalam.financeSubtitle": "Balance and settlements (accounting.basalam.com).",
		"basalam.financeWpAdminHint": "Full finance UI is also available under the Webino Basalam WP-Admin menu.",
		"basalam.financeLoading": "Loading…",
		"basalam.financeError": "Failed to load finance data.",
		"basalam.boothBalance": "Booth balance",
		"basalam.balanceAsOf": "Balance as of {{time}}",
		"basalam.settledBankYtd": "Bank settlements (YTD)",
		"basalam.settledWalletYtd": "Wallet settlements (YTD)",
		"basalam.futureBalance": "Future balance",
		"basalam.toman": "Toman",
		"basalam.activeSettlements": "Active settlement requests",
		"basalam.activeSettlementsHint": "In-progress settlements from accounting.basalam.com",
		"basalam.settlementHistory": "Settled balances",
		"basalam.settlementHistoryHint": "History of completed settlements",
		"basalam.noActiveSettlements": "There are no active settlement requests.",
		"basalam.noSettlementHistory": "No settlement history yet.",
		"basalam.settlementCreated": "Created",
		"basalam.settlementPayable": "Payable",
		"basalam.balance": "Balance",
		"basalam.settlements": "Settlements",
		"basalam.ticketsTitle": "Tickets",
		"basalam.ticketsSubtitle": "Hamsalam support tickets.",
		"basalam.ticketsHint": "Use WP-Admin Basalam → Tickets for full ticket compose/reply.",
		"basalam.logsTitle": "Logs & coverage",
		"basalam.logsSubtitle": "Jobs, coverage matrix, and log hints.",
		"basalam.coverage": "API coverage",
		"basalam.oauthConnected": "Basalam connected successfully.",
		"basalam.webhookConfigured": "Webhook is registered.",
		"basalam.webhookPending": "Webhook is set up after OAuth.",
		"basalam.productList": "Product list",
		"basalam.filter.all": "All",
		"basalam.filter.connected": "Connected",
		"basalam.filter.unconnected": "Unconnected",
		"basalam.total": "Total",
		"basalam.col.name": "Name",
		"basalam.col.basalamId": "Basalam ID",
		"basalam.col.status": "Status",
		"basalam.col.actions": "Actions",
		"basalam.col.type": "Type",
		"basalam.col.error": "Error",
		"basalam.col.invoice": "Invoice",
		"basalam.col.customer": "Customer",
		"basalam.col.total": "Total",
		"basalam.createOne": "Create",
		"basalam.updateOne": "Update",
		"basalam.disconnect": "Disconnect",
		"basalam.connectedOrders": "Connected orders",
		"basalam.noOrders": "No connected orders yet. Run pull orders.",
		"basalam.syncFields": "Sync fields",
		"basalam.saveSettings": "Save settings",
		"basalam.field.defaultWeight": "Default weight",
		"basalam.field.defaultPackageWeight": "Package weight",
		"basalam.field.defaultPreparation": "Preparation time",
		"basalam.field.tasksPerMinute": "Tasks per minute",
		"basalam.field.priceChange": "Price change",
		"basalam.field.productPrefix": "Title prefix",
		"basalam.field.productSuffix": "Title suffix",
		"basalam.field.safeStock": "Safe stock",
		"basalam.gatewaySecret": "Gateway secret (X-Gateway-Secret)",
		"basalam.gatewaySandbox": "Gateway sandbox mode",
		"basalam.saveGateway": "Save gateway",
		"zarinpal.title": "Zarinpal",
		"zarinpal.paymentsTitle": "Zarinpal Payments",
		"zarinpal.operationsTitle": "Zarinpal Operations",
		"zarinpal.coverageTitle": "Zarinpal Coverage",
		"zarinpal.settingsSubtitle": "Connect merchant credentials and sandbox mode",
		"zarinpal.paymentsSubtitle": "Checkout title, messages, and fee payer",
		"zarinpal.operationsSubtitle": "Reconcile unverified payments and look up transactions",
		"zarinpal.merchantId": "Merchant ID",
		"zarinpal.accessToken": "Access token (GraphQL)",
		"zarinpal.callbackUrl": "Callback URL",
		"zarinpal.apiBase": "API base",
		"zarinpal.startPay": "StartPay",
		"zarinpal.sandbox": "Sandbox",
		"zarinpal.reconcile": "Reconcile now",
		"zarinpal.reconcileHelp": "Fetches unVerified authorities from Zarinpal and verifies matching pending orders.",
		"zarinpal.reconcileDone": "Reconcile finished: {{completed}} completed of {{matched}} matched",
		"zarinpal.gatewayEnabled": "Enable gateway",
		"zarinpal.testConnection": "Test connection",
		"zarinpal.testSuccess": "Connection OK",
		"zarinpal.coverage": "API coverage",
		"zarinpal.coverageMoved": "Coverage summary also appears on the Connection page.",
		"zarinpal.fieldTitle": "Checkout title",
		"zarinpal.fieldDescription": "Description",
		"zarinpal.fieldInstructions": "Instructions",
		"zarinpal.successMessage": "Success message",
		"zarinpal.failedMessage": "Failed message",
		"zarinpal.successHint": "Placeholder: {transaction_id}",
		"zarinpal.failedHint": "Placeholder: {fault}",
		"zarinpal.feePayer": "Fee payer",
		"zarinpal.feePayerMerchant": "Merchant",
		"zarinpal.feePayerCustomer": "Customer",
		"zarinpal.lastChecked": "Last checked",
		"zarinpal.authorities": "Authorities",
		"zarinpal.matched": "Matched orders",
		"zarinpal.completed": "Completed",
		"zarinpal.skipped": "Skipped",
		"zarinpal.queue": "Job queue",
		"zarinpal.lookupTitle": "Transaction lookup",
		"zarinpal.authority": "Authority",
		"zarinpal.orderId": "Order ID",
		"zarinpal.lookup": "Lookup",
		"zarinpal.lookupSuccess": "Lookup complete",
		"accounting.title": "Accounting",
		"accounting.settingsSubtitle": "Company, Moadian, Hesabfa, payroll/Tamin, and WooCommerce sync",
		"accounting.settings.moadian": "Moadian",
		"accounting.settings.company": "Company",
		"accounting.settings.sync": "Sync",
		"accounting.settings.tax": "Tax mapping",
		"accounting.settings.hesabfa": "Hesabfa",
		"accounting.settings.payroll": "Payroll / Social Security",
		"accounting.payroll.settingsHelp": "Annual legal amounts, insurance rates (7/20/3), wage ceiling, and default workshop for Iranian payroll.",
		"accounting.payroll.employeeInsPct": "Employee insurance %",
		"accounting.payroll.employerInsPct": "Employer insurance %",
		"accounting.payroll.unemploymentPct": "Unemployment insurance %",
		"accounting.payroll.minDailyWage": "Minimum daily wage",
		"accounting.payroll.ceilingMultiplier": "Insurance ceiling multiplier",
		"accounting.payroll.taxExemption": "Monthly tax exemption",
		"accounting.payroll.legalFood": "Legal food benefit",
		"accounting.payroll.legalHousing": "Legal housing benefit",
		"accounting.payroll.legalMarriage": "Legal marriage benefit",
		"accounting.payroll.legalSeniority": "Legal seniority base",
		"accounting.payroll.overtimeRate": "Overtime rate multiplier",
		"accounting.payroll.defaultWorkshopId": "Default workshop ID",
		"accounting.payroll.taminGuide": "List-disk ZIP (DSKKAR00.DBF + DSKWOR00.DBF) is downloaded from Payroll and uploaded on eservices.tamin.ir. There is no live portal login from the plugin.",
		"accounting.payroll.workshops": "Workshops",
		"accounting.payroll.workshopCode": "Workshop code",
		"accounting.payroll.workshopName": "Workshop name",
		"accounting.payroll.branchCode": "Branch code",
		"accounting.payroll.rowCode": "Contract row",
		"accounting.payroll.employees": "Employees",
		"accounting.payroll.firstName": "First name",
		"accounting.payroll.lastName": "Last name",
		"accounting.payroll.nationalId": "National ID",
		"accounting.payroll.insuranceNo": "Insurance no.",
		"accounting.payroll.dailyWage": "Daily wage",
		"accounting.payroll.jobCode": "Job code",
		"accounting.payroll.workshopId": "Workshop ID",
		"accounting.payroll.attendance": "Monthly attendance",
		"accounting.payroll.employeeId": "Employee ID",
		"accounting.payroll.jalaliYear": "Jalali year",
		"accounting.payroll.jalaliMonth": "Month",
		"accounting.payroll.absentDays": "Absent days",
		"accounting.payroll.leaveDays": "Leave days",
		"accounting.payroll.overtimeHours": "OT hours",
		"accounting.payroll.runs": "Payroll runs",
		"accounting.payroll.recalc": "Recalculate",
		"accounting.payroll.recalculated": "Payroll recalculated",
		"accounting.payroll.exportTamin": "Export Tamin list-disk",
		"accounting.payroll.taminExported": "List-disk ZIP ready",
		"accounting.payroll.payslips": "Payslips",
		"accounting.payroll.daysWorked": "Days",
		"accounting.payroll.gross": "Gross",
		"accounting.payroll.insurable": "Insurable",
		"accounting.payroll.empIns": "Emp. ins.",
		"accounting.payroll.erIns": "Er. ins.",
		"accounting.payroll.unemp": "Unemp.",
		"accounting.payroll.tax": "Tax",
		"accounting.payroll.net": "Net",
		"accounting.payroll.volumeQty": "Volume qty",
		"accounting.payroll.pieceRate": "Piece rate",
		"accounting.payroll.volumePay": "Volume pay",
		"accounting.payroll.decrees": "Employment decrees",
		"accounting.payroll.issueDecree": "Issue decree",
		"accounting.payroll.print": "Print",
		"accounting.payroll.myPayroll": "My payslips & decrees",
		"accounting.payroll.myPayrollHelp": "View and print your own payslips and employment decrees.",
		"accounting.payroll.nightOtRate": "Night OT multiplier",
		"accounting.payroll.holidayOtRate": "Holiday OT multiplier",
		"accounting.payroll.childBenefitEach": "Child benefit per child",
		"accounting.payroll.volumeInsurable": "Volume pay is SS-insurable",
		"accounting.payroll.sickCountsWorked": "Sick leave counts as worked (paid)",
		"accounting.payroll.taxBrackets": "Income tax brackets (YTD cumulative)",
		"accounting.payroll.bracketUpTo": "Up to amount",
		"accounting.payroll.bracketRate": "Rate %",
		"accounting.nav.overview": "Overview",
		"accounting.nav.journals": "Journals",
		"accounting.nav.persons": "Persons",
		"accounting.nav.products": "Products",
		"accounting.nav.invoices": "Sales invoices",
		"accounting.nav.purchases": "Purchases",
		"accounting.nav.expenses": "Expenses",
		"accounting.nav.treasury": "Treasury",
		"accounting.nav.checks": "Checks",
		"accounting.nav.warehouses": "Warehouses",
		"accounting.nav.moadian": "Moadian queue",
		"accounting.nav.hesabfa": "Hesabfa sync",
		"accounting.nav.payroll": "Payroll",
		"accounting.nav.projects": "Projects",
		"accounting.nav.reports": "Reports",
		"accounting.kpi.profit": "Profit (MTD)",
		"accounting.kpi.margin": "Sales margin (MTD)",
		"accounting.kpi.moadianPending": "Moadian pending",
		"accounting.backfillOrders": "Sync recent orders",
		"accounting.backfillDone": "Synced {{count}} orders",
		"accounting.posted": "Posted",
		"accounting.post": "Post",
		"accounting.processMoadian": "Process Moadian queue",
		"accounting.moadianProcessed": "Processed {{count}} jobs",
		"accounting.personName": "Person name",
		"accounting.productName": "Product name",
		"accounting.sstid": "Goods/services ID (SSTID)",
		"accounting.employeeName": "Employee name",
		"accounting.baseSalary": "Base salary",
		"accounting.createPayroll": "Create payroll run",
		"accounting.projectName": "Project name",
		"accounting.cashAccounts": "Cash / bank accounts",
		"accounting.vouchers": "Receipts & payments",
		"accounting.stock": "Stock",
		"accounting.col.number": "Number",
		"accounting.col.date": "Date",
		"accounting.col.status": "Status",
		"accounting.col.description": "Description",
		"accounting.col.name": "Name",
		"accounting.col.kind": "Kind",
		"accounting.col.nationalId": "National ID",
		"accounting.col.mobile": "Mobile",
		"accounting.col.vat": "VAT %",
		"accounting.col.total": "Total",
		"accounting.col.moadian": "Moadian",
		"accounting.col.type": "Type",
		"accounting.col.amount": "Amount",
		"accounting.col.due": "Due",
		"accounting.col.default": "Default",
		"accounting.col.warehouse": "Warehouse",
		"accounting.col.product": "Product",
		"accounting.col.qty": "Qty",
		"accounting.col.invoice": "Invoice",
		"accounting.col.action": "Action",
		"accounting.col.error": "Error",
		"accounting.col.code": "Code",
		"accounting.col.budget": "Budget",
		"accounting.col.debit": "Debit",
		"accounting.col.credit": "Credit",
		"accounting.col.balance": "Balance",
		"accounting.report.pnl": "Profit & loss",
		"accounting.report.vat": "Net VAT",
		"accounting.report.margin": "Gross margin",
		"accounting.report.trialBalance": "Trial balance",
		"accounting.fiscalId": "Fiscal memory ID",
		"accounting.privateKey": "Private key (PEM)",
		"accounting.certificate": "Certificate (PEM)",
		"accounting.defaultInvoiceType": "Default invoice type",
		"accounting.invoiceType1": "Type 1 (with buyer)",
		"accounting.invoiceType2": "Type 2",
		"accounting.invoiceType3": "Type 3 (POS)",
		"accounting.autoSend": "Auto-send to Moadian after order sync",
		"accounting.sandbox": "Sandbox / test mode",
		"accounting.moadianHelp": "Register on tp.tax.gov.ir, create fiscal memory, upload public key, then paste private key and fiscal ID here.",
		"accounting.testConnection": "Test Moadian connection",
		"accounting.testSuccess": "Moadian connection OK",
		"accounting.hesabfa.enabled": "Enable Hesabfa bidirectional sync",
		"accounting.hesabfa.apiKey": "API key",
		"accounting.hesabfa.loginToken": "Login token (preferred)",
		"accounting.hesabfa.userId": "User ID / email (fallback)",
		"accounting.hesabfa.password": "Password (fallback)",
		"accounting.hesabfa.yearId": "Fiscal year ID (0 = latest)",
		"accounting.hesabfa.currency": "Hesabfa currency",
		"accounting.hesabfa.defaultBank": "Default bank code",
		"accounting.hesabfa.defaultWarehouse": "Default warehouse code",
		"accounting.hesabfa.hookPassword": "Change-hook password",
		"accounting.hesabfa.linkWcOnly": "Do not overwrite WC-linked products on import (link by SKU/barcode only)",
		"accounting.hesabfa.entities": "Entities to sync",
		"accounting.hesabfa.entity.contacts": "Contacts",
		"accounting.hesabfa.entity.items": "Items",
		"accounting.hesabfa.entity.invoices": "Invoices",
		"accounting.hesabfa.entity.receipts": "Receipts / payments",
		"accounting.hesabfa.entity.warehouses": "Warehouse docs",
		"accounting.hesabfa.entity.cash_accounts": "Banks / cash",
		"accounting.hesabfa.entity.journals": "Journal documents",
		"accounting.hesabfa.entity.bank_transfers": "Bank transfers",
		"accounting.hesabfa.entity.categories": "Categories",
		"accounting.hesabfa.entity.projects": "Projects",
		"accounting.hesabfa.entity.accounts": "Chart of accounts",
		"accounting.hesabfa.hookUrl": "Webhook URL",
		"accounting.hesabfa.lastChangeId": "Last change cursor",
		"accounting.hesabfa.help": "Uses official api.hesabfa.com/v1. Save credentials, test, register the change hook, then migrate or keep in sync.",
		"accounting.hesabfa.test": "Test Hesabfa connection",
		"accounting.hesabfa.testSuccess": "Hesabfa connection OK",
		"accounting.hesabfa.registerHook": "Register change hook",
		"accounting.hesabfa.hookRegistered": "Change hook registered",
		"accounting.hesabfa.syncNow": "Pull changes now",
		"accounting.hesabfa.migrate": "Migrate from Hesabfa",
		"accounting.hesabfa.migrateQueued": "Queued {{count}} migration steps",
		"accounting.hesabfa.synced": "Pulled {{count}} changes",
		"accounting.hesabfa.process": "Process sync queue",
		"accounting.hesabfa.processed": "Processed {{count}} Hesabfa jobs",
		"accounting.hesabfa.jobs": "Sync jobs",
		"accounting.hesabfa.map": "ID link map",
		"accounting.hesabfa.log": "API log",
		"accounting.hesabfa.inquiry": "Inquiry services",
		"accounting.hesabfa.inquiryValue": "Value",
		"accounting.hesabfa.runInquiry": "Run inquiry",
		"accounting.companyName": "Company name",
		"accounting.economicCode": "Economic code",
		"accounting.nationalId": "National ID",
		"accounting.postalCode": "Postal code",
		"accounting.province": "Province",
		"accounting.city": "City",
		"accounting.phone": "Phone",
		"accounting.address": "Address",
		"accounting.snapshotCogs": "Snapshot WFCP purchase price on order lines",
		"accounting.syncStatuses": "Sync order statuses (comma-separated)",
		"accounting.syncHelp": "Orders in these statuses create sale invoices, GL postings, and optional Moadian jobs.",
		"accounting.defaultVat": "Default VAT %",
		"accounting.map.sales": "Sales account code",
		"accounting.map.vat_payable": "VAT payable code",
		"accounting.map.cogs": "COGS account code",
		"accounting.map.inventory": "Inventory account code",
		"accounting.map.cash": "Cash account code",
		"accounting.map.bank": "Bank account code",
		"accounting.map.gateway": "Payment gateway account code",
		"accounting.map.receivables": "Receivables code",
		"accounting.map.payables": "Payables code",
		"accounting.map.payroll_expense": "Payroll expense code",
		"accounting.map.payroll_payable": "Payroll payable code",
		"accounting.map.insurance_exp": "Employer insurance expense",
		"accounting.map.insurance_pay": "Insurance payable",
		"marketplace.module.accounting-module": "Accounting",
		"marketplace.module.accounting-module-connection": "Moadian",
		"marketplace.module.accounting-module-company": "Company",
		"marketplace.module.accounting-module-sync": "Sync",
		"marketplace.module.accounting-module-tax": "Tax mapping",
		"settings.site.sections.modules": "Modules",
		"settings.site.sections.bots": "Bots",
		"settings.site.sections.systemLogs": "System logs",
		"settings.site.sections.analytics": "Analytics & tracking",
		"settings.site.sections.sms": "Site SMS",
		"settings.siteSms.title": "Site SMS (login & register)",
		"settings.siteSms.enabled": "Enabled",
		"settings.siteSms.serviceLine": "Service line",
		"settings.siteSms.dedicatedLine": "Dedicated line",
		"settings.siteSms.otpLogin": "Login OTP",
		"settings.siteSms.otpLoginTemplate": "Login OTP message",
		"settings.siteSms.otpRegister": "Register OTP",
		"settings.siteSms.otpRegisterTemplate": "Register OTP message",
		"settings.siteSms.shortcodeHint": "Use {{code}} for the one-time code.",
		"settings.siteSms.multiChannelOtpHint": "Dashboard multi-channel OTP login/register is configured under Notification system →",
		"settings.siteSms.unavailable": "Site SMS settings could not be loaded from the license service. Showing defaults; saving is disabled until the service is reachable.",
		"settings.shopSms.title": "Order SMS notifications",
		"settings.shopSms.enabled": "Enabled",
		"settings.shopSms.balance": "Balance: {{amount}}",
		"settings.shopSms.adminPhones": "Manager phones (one per line)",
		"settings.shopSms.eventToggles": "Send on events",
		"settings.shopSms.notifyCustomer": "Customer SMS",
		"settings.shopSms.notifyAdmin": "Admin SMS",
		"settings.shopSms.templates": "Message templates",
		"settings.shopSms.customerMessage": "Customer text",
		"settings.shopSms.adminMessage": "Admin text",
		"settings.shopSms.syncPattern": "Sync / register pattern",
		"settings.shopSms.bindPattern": "Bind existing pattern code",
		"settings.shopSms.patternSynced": "Pattern synced.",
		"settings.shopSms.patternOnlyHint": "Order SMS is sent only via an approved SMS pattern.",
		"settings.shopSms.eventColumn": "Event / status",
		"settings.shopSms.patternColumn": "Pattern",
		"settings.shopSms.patternCode": "Pattern code",
		"settings.shopSms.patternCodePlaceholder": "e.g. wb_xxxx",
		"settings.shopSms.patternStatus.synced": "Synced",
		"settings.shopSms.patternStatus.pending": "Pending",
		"settings.shopSms.patternStatus.failed": "Failed",
		"settings.shopSms.patternStatus.none": "No pattern",
		"orders.sms.sendCustomer": "SMS customer",
		"orders.sms.sendAdmin": "SMS admin",
		"orders.sms.sent": "SMS send requested.",
		"orders.sms.failed": "SMS send failed.",
		"orders.sms.title": "Order SMS",
		"settings.shopSms.events.pending_on_create": "Pending (on checkout)",
		"settings.shopSms.events.pending_on_status": "Pending (status change)",
		"settings.shopSms.events.processing": "Processing",
		"settings.shopSms.events.sent-to-warehouse": "Sent to warehouse",
		"settings.shopSms.events.packaged": "Packaged",
		"settings.shopSms.events.courier": "Courier delivery",
		"settings.shopSms.events.post": "Post delivery",
		"settings.shopSms.events.tipax": "Tipax delivery",
		"settings.shopSms.events.on-hold": "On hold",
		"settings.shopSms.events.completed": "Completed",
		"settings.shopSms.events.cancelled": "Cancelled",
		"settings.shopSms.events.refunded": "Refunded",
		"settings.shopSms.events.failed": "Failed",
		"settings.shopSms.events.checkout-draft": "Draft",
		"settings.shopSms.events.cart-abandoned": "Abandoned cart",
		"settings.shopSms.events.order-abandoned": "Abandoned unpaid order",
		"settings.shopSms.events.user-welcome": "Welcome after registration",
		"settings.shopSms.events.stock-low": "Low stock",
		"settings.shopSms.events.stock-out": "Out of stock",
		"settings.shopSms.recoveryTitle": "Recovery / personal coupon",
		"settings.shopSms.recoveryDelay": "Send delay (hours)",
		"settings.shopSms.recoveryCoupon": "Issue personal discount code",
		"settings.shopSms.recoveryCouponType": "Discount type",
		"settings.shopSms.recoveryPercent": "Percent",
		"settings.shopSms.recoveryFixed": "Fixed cart amount",
		"settings.shopSms.recoveryAmount": "Amount",
		"settings.shopSms.recoveryExpires": "Expires (days)",
		"settings.shopSms.recoveryUsage": "Usage limit",
		"settings.shopSms.postBarcodeMergedHint": "Saving a post barcode also uses this “Post delivery” pattern.",
		"settings.site.fieldSiteTitle": "Site title",
		"settings.site.fieldTagline": "Tagline",
		"settings.site.fieldAdminEmail": "Admin email",
		"settings.site.fieldTimezone": "Timezone",
		"settings.site.identityTitle": "Site identity",
		"settings.site.identityHint": "Public name and tagline shown across your site.",
		"settings.site.technicalTitle": "Technical",
		"settings.site.technicalHint": "Admin contact and timezone used by WordPress.",
		"settings.site.licenseFullPage": "Full license page",
		"settings.appearanceTitle": "Appearance studio",
		"settings.appearanceHint": "Language, theme, and accent for the dashboard.",
		"settings.moduleOn": "Visible in sidebar",
		"settings.moduleOff": "Hidden from sidebar",
		"settings.enabled": "Enabled",
		"settings.disabled": "Disabled",
		"settings.odBrandingPreview": "Branding preview",
		"settings.shop.title": "Shop management",
		"settings.shop.description": "Online store and shop-specific settings.",
		"settings.shop.sections.general": "General",
		"settings.shop.sections.products": "Products",
		"settings.shop.sections.tax": "Tax",
		"settings.shop.sections.shipping": "Shipping",
		"settings.shop.sections.payments": "Payments",
		"settings.shop.sections.invoices": "Invoices",
		"settings.shop.sections.sms": "SMS",
		"settings.shop.sections.bots": "Telegram / Bale",
		"settings.shop.sections.emails": "Emails",
		"settings.shop.sections.advanced": "Advanced",
		"settings.shop.sections.pricing": "Pricing (WFCP)",
		"settings.shop.productsGeneral": "General",
		"settings.shop.productsInventory": "Inventory",
		"settings.shop.productsDownloadable": "Downloadable",
		"settings.shop.shippingNewZone": "New zone name",
		"settings.shop.shippingAddZone": "Add zone",
		"settings.shop.shippingMethodCount": "{{count}} methods",
		"settings.shop.shippingOptions": "Shipping options",
		"settings.shop.gatewayEnabled": "Enable gateway",
		"settings.shop.emailEnabled": "Enable email",
		"settings.shop.emailGlobal": "Email sender options",
		"settings.pageDescription": "Locale, theme, accent, and dashboard preferences.",
		"settings.accent": "Accent color",
		"settings.themeSystem": "System",
		"settings.themeLight": "Light",
		"settings.themeDark": "Dark",
		"settings.accentColorful": "Colorful",
		"settings.accentDefault": "Neutral",
		"settings.accentRed": "Red",
		"settings.accentRose": "Rose",
		"settings.accentOrange": "Orange",
		"settings.accentGreen": "Green",
		"settings.accentBlue": "Blue",
		"settings.accentYellow": "Yellow",
		"settings.accentViolet": "Violet",
		"settings.fullscreenDefault": "Open dashboard in fullscreen by default",
		"settings.licenseHint": "License activation uses the license service endpoints configured for this site.",
		"common.loading": "Loading…",
		"common.noResults": "No results.",
		"common.saving": "Saving…",
		"common.loadFailed": "Failed to load data.",
		"common.empty": "Nothing here yet.",
		"list.filters": "Filters",
		"common.save": "Save",
		"common.saved": "Saved",
		"common.disabled": "Disabled",
		"common.delete": "Delete",
		"common.deleted": "Deleted",
		"common.edit": "Edit",
		"common.view": "View",
		"common.prevPage": "Previous page",
		"common.nextPage": "Next page",
		"common.emptyValue": "—",
		"common.cancel": "Cancel",
		"common.back": "Back",
		"common.unlimited": "Unlimited",
		"settings.langEn": "English",
		"settings.langFa": "Persian",
		"a11y.toggleSubmenu": "Toggle submenu",
		"a11y.sidebarTitle": "Sidebar",
		"a11y.sidebarDescription": "Main navigation",
		"a11y.toggleSidebar": "Toggle sidebar",
		"a11y.close": "Close",
		"a11y.more": "More",
		"a11y.thumbnail": "Thumbnail image",
		"a11y.moduleIcon": "Module icon",
		"common.listSeparator": ", ",
		"date.placeholderGregorian": "YYYY-MM-DD",
		"date.placeholderJalali": "YYYY/MM/DD (Jalali)",
		"date.preview": "Display",
		"date.dateTime": "Date and time",
		"date.dateTimeHint": "Pick date from the calendar; adjust time below.",
		"date.prevMonth": "Previous month",
		"date.nextMonth": "Next month",
		"date.pickDate": "Pick date",
		"date.time": "Time",
		"date.timeSeparator": " at ",
		"errors.api.invalidNonce": "Login expired. Refresh the page and try again.",
		"errors.api.generic": "Something went wrong",
		"errors.api.invalid": "Invalid request",
		"errors.api.forbidden": "Access denied",
		"errors.api.notFound": "Not found",
		"errors.api.invalidRole": "Role is not allowed",
		"errors.api.forbiddenRole": "You cannot assign this role",
		"errors.api.timeout": "License server did not respond in time. Please try again shortly.",
		"errors.api.emptyReply": "License server closed the connection without a response. Please try again shortly.",
		"errors.api.networkOffline": "Could not connect. Check your internet or server access.",
		"errors.api.siteUpdating": "The site is temporarily unavailable (likely updating).",
		"errors.api.restCdnBlocked": "API access blocked by CDN/WAF. Whitelist admin-ajax.php or /wp-json/.",
		"errors.api.transport": "Could not reach the license server. Check your connection and try again.",
		"errors.api.crmUnreachable": "Showing your last saved license status. We will sync with the license service again later.",
		"errors.api.licenseAuth": "License authentication failed. Contact support if this persists.",
		"errors.api.licenseNotConfigured": "License signing is not configured on this site.",
		"errors.api.unknown": "Unknown server error. Please try again.",
		"status.post.draft": "Draft",
		"status.post.pending": "Pending review",
		"status.post.publish": "Published",
		"status.post.private": "Private",
		"status.post.future": "Scheduled",
		"status.post.trash": "Trashed",
		"coupons.type.fixed_cart": "Fixed cart discount",
		"coupons.type.percent": "Percentage discount",
		"coupons.type.fixed_product": "Fixed product discount",
		"license.status.active": "Active",
		"license.status.inactive": "Inactive",
		"license.status.demo": "Demo",
		"license.status.expired": "Expired",
		"license.status.unknown": "Unknown",
		"license.status.not_found": "Not registered",
		"license.status.cancelled": "Cancelled",
		"shopBot.campaignStatus.pending": "Pending",
		"shopBot.campaignStatus.scheduled": "Scheduled",
		"shopBot.campaignStatus.sent": "Sent",
		"shopBot.campaignStatus.failed": "Failed",
		"shopBot.campaignStatus.cancelled": "Cancelled",
		"wfcp.sort.date_desc": "Date (newest)",
		"wfcp.sort.date_asc": "Date (oldest)",
		"wfcp.sort.name_asc": "Name (A–Z)",
		"wfcp.sort.name_desc": "Name (Z–A)",
		"bots.logs.channelPlaceholder": "api, webhook…",
		"wfcp.stock.instock": "In stock",
		"wfcp.stock.outofstock": "Out of stock",
		"wfcp.priceMode.fixed": "Fixed amount",
		"wfcp.priceMode.percent": "Percentage",
		"wfcp.scope.global": "Global",
		"wfcp.scope.category": "Category",
		"shopBot.tier.basic": "Basic",
		"shopBot.tier.advanced": "Advanced",
		"shopBot.currency.toman": "Toman",
		"shopBot.currency.rial": "Rial",
		"products.emptyList": "No products match your filters.",
		"errors.notFoundTitle": "Page not found",
		"errors.notFoundBody": "This URL is not part of the dashboard menu.",
		"errors.backHome": "Back to overview",
		"errors.forbiddenTitle": "Access denied",
		"errors.forbiddenBody": "You do not have permission for this screen.",
		"errors.bootstrapTitle": "Could not load dashboard",
		"errors.bootstrapBody": "The server did not return menu permissions. Refresh the page or sign in again.",
		"errors.routeTitle": "This screen could not be shown",
		"errors.routeBody": "Something went wrong while loading this page. Try again or return to the overview.",
		"errors.chunkTitle": "Page failed to load",
		"errors.chunkBody": "The app could not download this screen. Refresh the page after a new deploy or clear your browser cache.",
		"errors.restUnavailable": "Dashboard API is unavailable (server error). If you just installed a module, disable it and contact support.",
		"errors.reloadPage": "Reload page",
		"errors.boot.missingRoot": "Dashboard root element is missing.",
		"errors.boot.missingRootDetail": "#root was not found in the page HTML.",
		"errors.boot.missingConfig": "Dashboard configuration failed to load.",
		"errors.boot.missingConfigDetail": "window.webinoDashboard is missing. Check that plugin assets are enqueued and the build exists on the server.",
		"errors.boot.i18nFailed": "Dashboard failed to start.",
		"errors.boot.loadFailed": "Dashboard failed to load.",
		"posts.title": "Posts",
		"posts.listDescription": "List, filter, and open the editor.",
		"posts.add": "Add post",
		"posts.emptyHint": "No posts yet. Write your first article.",
		"posts.colTitle": "Title",
		"posts.colStatus": "Status",
		"posts.colDate": "Date",
		"posts.colExcerpt": "Excerpt",
		"posts.colActions": "Actions",
		"posts.toggleColumns": "Columns",
		"posts.totalCount": "{{count}} posts",
		"posts.pageOf": "Page {{page}} of {{total}}",
		"posts.perPage": "Per page",
		"posts.editTitle": "Edit post",
		"posts.newTitle": "New post",
		"posts.fieldTitle": "Title",
		"posts.fieldContent": "Content (HTML)",
		"posts.fieldStatus": "Status",
		"posts.fieldCategories": "Categories",
		"posts.panelPublish": "Publish",
		"posts.panelCategories": "Categories",
		"posts.panelTags": "Tags",
		"posts.panelFeaturedImage": "Featured image",
		"posts.statusLabel": "Status",
		"posts.visibilityLabel": "Visibility",
		"posts.discussionLabel": "Discussion",
		"posts.publishDateLabel": "Publish",
		"posts.visibilityPublic": "Public",
		"posts.visibilityPrivate": "Private",
		"posts.visibilityPassword": "Password protected",
		"posts.commentsEnabled": "Comments enabled",
		"posts.commentsDisabled": "Comments disabled",
		"posts.publishImmediately": "Immediately",
		"posts.publishScheduled": "Schedule",
		"posts.addCategory": "Add",
		"posts.addCategoryPlaceholder": "New category…",
		"posts.tagsPlaceholder": "Add tags…",
		"posts.selectFeaturedImage": "Select image",
		"posts.changeFeaturedImage": "Change image",
		"posts.removeFeaturedImage": "Remove image",
		"posts.noFeaturedImage": "No image selected",
		"posts.editorVisual": "Visual",
		"posts.editorCode": "HTML code",
		"posts.publishButton": "Publish",
		"posts.saveDraftButton": "Save draft",
		"posts.dialogClose": "Close",
		"posts.passwordLabel": "Password",
		"posts.passwordPlaceholder": "View password",
		"posts.titlePlaceholder": "Enter post title…",
		"posts.contentPlaceholder": "Write your post…",
		"posts.linkPrompt": "Link URL",
		"posts.imageUrlPrompt": "Image URL",
		"posts.toolBold": "Bold",
		"posts.toolItalic": "Italic",
		"posts.toolStrike": "Strikethrough",
		"posts.toolHeading": "Heading",
		"posts.toolBulletList": "Bullet list",
		"posts.toolOrderedList": "Numbered list",
		"posts.toolQuote": "Quote",
		"posts.toolCodeBlock": "Code block",
		"posts.toolLink": "Link",
		"posts.toolImage": "Image",
		"posts.toolUnderline": "Underline",
		"posts.toolUndo": "Undo",
		"posts.toolRedo": "Redo",
		"posts.toolParagraph": "Paragraph",
		"posts.toolHeading2": "Heading 2",
		"posts.toolHeading3": "Heading 3",
		"posts.toolHeading4": "Heading 4",
		"posts.toolSuperscript": "Superscript",
		"posts.toolSubscript": "Subscript",
		"posts.toolInlineCode": "Inline code",
		"posts.toolAlignRight": "Align right",
		"posts.toolAlignCenter": "Align center",
		"posts.toolAlignLeft": "Align left",
		"posts.toolJustify": "Justify",
		"posts.toolHr": "Horizontal line",
		"posts.toolImageMedia": "From media library",
		"posts.toolImageUrl": "From URL",
		"posts.toolTable": "Table",
		"posts.toolTableInsert": "Insert table",
		"posts.toolTableAddCol": "Add column",
		"posts.toolTableAddRow": "Add row",
		"posts.toolTableDelCol": "Delete column",
		"posts.toolTableDelRow": "Delete row",
		"posts.toolTableDelete": "Delete table",
		"posts.toolTextColor": "Text color",
		"posts.toolHighlight": "Highlight",
		"posts.toolClearColor": "Clear color",
		"posts.toolClearHighlight": "Clear highlight",
		"posts.toolClearFormat": "Clear formatting",
		"posts.toolFullscreen": "Fullscreen",
		"posts.toolExitFullscreen": "Exit fullscreen",
		"editor.wordCount": "{{count}} words",
		"editor.charCount": "{{count}} characters",
		"categories.title": "Categories",
		"categories.newName": "Name",
		"categories.add": "Add category",
		"categories.colName": "Name",
		"categories.colCount": "Posts",
		"categories.fieldName": "Name",
		"categories.fieldNameHint": "The name is how it appears on your site.",
		"categories.fieldSlug": "Slug",
		"categories.fieldSlugHint": "The slug is the URL-friendly version of the name. It is usually lowercase and contains only letters, numbers, and hyphens.",
		"categories.fieldParent": "Parent category",
		"categories.fieldParentNone": "None",
		"categories.fieldParentHint": "Categories, unlike tags, can have a hierarchy.",
		"categories.fieldDescription": "Description",
		"categories.fieldDescriptionHint": "The description is not prominent by default; however, some themes may show it.",
		"categories.hierarchyHint": "For example, you can have a Music category with subcategories such as Iranian music or Western music.",
		"categories.addSectionTitle": "Add category",
		"categories.listSectionTitle": "Category list",
		"categories.actionEdit": "Edit",
		"categories.actionQuickEdit": "Quick edit",
		"categories.actionDelete": "Delete",
		"categories.actionView": "View",
		"categories.quickEditSave": "Update",
		"categories.quickEditCancel": "Cancel",
		"categories.deleteConfirmTitle": "Delete category",
		"categories.deleteConfirmBody": "Are you sure you want to delete “{{name}}”?",
		"media.title": "Media library",
		"media.description": "Browse, upload, and organize media files.",
		"media.uploaded": "File uploaded",
		"media.empty": "No files match these filters. Upload a file or adjust folder/category.",
		"media.filterFolder": "Folder",
		"media.filterCategory": "Category",
		"media.allFolders": "All folders",
		"media.allCategories": "All categories",
		"media.searchPlaceholder": "Search by title…",
		"media.upload": "Upload",
		"media.actionFolder": "Folder",
		"media.actionCategory": "Category",
		"media.actionTag": "Tags",
		"media.actionEdit": "Edit",
		"media.editTitle": "Edit media",
		"media.fieldSlug": "Slug",
		"media.fieldCaption": "Caption",
		"media.fieldDescription": "Description",
		"media.fieldAlt": "Alt text",
		"media.foldersTitle": "Media folders",
		"media.categoriesTitle": "Media categories",
		"media.tagsTitle": "Tags",
		"media.parentCategory": "Parent category (optional)",
		"media.parentFolder": "Parent folder (optional)",
		"media.newFolder": "New folder",
		"media.newCategory": "New category",
		"media.newTag": "New tag",
		"media.addSectionTitle": "Add new",
		"media.listSectionTitle": "All items",
		"media.fieldName": "Name",
		"media.fieldNameHint": "The name as shown in the library.",
		"media.fieldSlugHint": "URL-friendly version of the name.",
		"media.fieldParent": "Parent",
		"media.fieldParentNone": "None",
		"media.fieldParentHint": "Optional parent for hierarchy.",
		"media.fieldDescriptionHint": "Optional description.",
		"media.actionQuickEdit": "Quick edit",
		"media.actionDelete": "Delete",
		"media.quickEditSave": "Update",
		"media.quickEditCancel": "Cancel",
		"media.deleteConfirmTitle": "Delete item",
		"media.deleteConfirmBody": "Are you sure you want to delete “{{name}}”?",
		"media.assignFolder": "Assign folder",
		"media.assignCategory": "Assign categories",
		"media.assignTags": "Assign tags",
		"media.noFolder": "No folder",
		"media.tagsPlaceholder": "Add tags…",
		"media.pageOf": "Page {{page}} of {{total}}",
		"media.totalItems": "{{count}} items",
		"media.perPage": "Per page",
		"settings.modulesTitle": "Sidebar modules",
		"settings.modulesHint": "Turn sections off for all users who can see them. Overview always stays on.",
		"settings.orderDocumentsTitle": "Order print documents",
		"settings.orderDocsCommon": "Common",
		"settings.orderDocsSender": "Sender / seller",
		"settings.orderDocsInvoice": "Invoice",
		"settings.orderDocsReceipt": "Receipt",
		"settings.orderDocsLabel": "Postal label",
		"settings.orderDocsEnable": "Enable documents",
		"settings.odEnableInvoice": "Invoice",
		"settings.odEnableReceipt": "Receipt",
		"settings.odEnableLabel": "Shipping label",
		"settings.odEnableProductLabel": "Warehouse product label",
		"settings.orderDocsLogos": "Logos",
		"settings.odInvoiceLogo": "Invoice logo",
		"settings.odInvoiceLogoHint": "Pick from the media library or upload a new image.",
		"settings.odLabelLogo": "Shipping label logo",
		"settings.odLabelLogoHint": "A simple dark logo works best on thermal printers.",
		"settings.odReceiptLogo": "Receipt logo",
		"settings.odReceiptLogoHint": "Printed on the sales receipt.",
		"settings.odNoLogo": "No logo",
		"settings.odPickLogo": "Choose from media",
		"settings.odUploadLogo": "Upload",
		"settings.odStoreName": "Store name",
		"settings.odLogoUrl": "Logo URL",
		"settings.odAccentColor": "Accent color",
		"settings.odFooterThanks": "Footer thank-you text",
		"settings.odFooterSite": "Footer site URL",
		"settings.odSenderName": "Sender name",
		"settings.odSenderNameHint": "Seller name on invoices and shipping labels.",
		"settings.odSenderAddress": "Sender address",
		"settings.odSenderAddressHint": "Full address as on the postal form.",
		"settings.odSenderPostcode": "Sender postcode",
		"settings.odSenderPostcodeHint": "10-digit store postcode.",
		"settings.odSenderPhone": "Sender phone",
		"settings.odSenderPhoneHint": "A number the courier or post can call.",
		"settings.odSenderEmail": "Sender email",
		"settings.odSenderEmailHint": "Optional; shown on the invoice.",
		"settings.odShowStatus": "Show order status",
		"settings.odShowBarcode": "Show barcode",
		"settings.odShowBarcodeInvoice": "Order barcode on invoice",
		"settings.odShowBarcodeReceipt": "Order barcode on receipt",
		"settings.odShowBarcodeLabel": "Order barcode on shipping label",
		"settings.odShowProductImage": "Show product image",
		"settings.odShowSku": "Show SKU",
		"settings.odShowItemsTable": "Show items table",
		"settings.odShowProducts": "Show product list",
		"settings.odShowPostmanPlaceholder": "Show post label placeholder",
		"settings.odPostmanTitle": "Post label placeholder title",
		"settings.odPostmanHint": "Post label placeholder hint",
		"settings.odInvoiceTheme": "Invoice theme",
		"settings.odReceiptTheme": "Receipt theme",
		"settings.odLabelTheme": "Shipping label theme",
		"settings.odThemeClassic": "Classic",
		"settings.odThemeModern": "Modern",
		"settings.odThemeStacked": "Stacked (sender on top)",
		"settings.odThemeRows": "Two rows (sender on top)",
		"settings.odThemeBand": "Color band",
		"settings.odThemeBoxed": "Boxed title",
		"settings.odThemeStripe": "Striped rows",
		"settings.odThemeCompact": "Compact",
		"settings.odThemeLandscape": "Landscape",
		"settings.odThemeIran": "Iran post form",
		"settings.odThemeStamp": "Postal sticker area",
		"settings.odInvoiceOrientation": "Invoice orientation",
		"settings.odEnablePacking": "Packing slip",
		"settings.odEnableCustomerLabel": "Customer sticker",
		"settings.odEnableStoreLabel": "Store sticker",
		"settings.orderDocsPacking": "Warehouse packing slip",
		"settings.odPackingTheme": "Packing slip theme",
		"settings.orderDocsStickers": "Customer and store stickers",
		"settings.odCustomerLabelSize": "Customer sticker size",
		"settings.odStoreLabelSize": "Store sticker size",
		"settings.odInvoiceParties": "Invoice party order",
		"settings.odPartiesHint": "Which block prints first.",
		"settings.odPartiesSellerFirst": "Seller first",
		"settings.odPartiesBuyerFirst": "Buyer first",
		"settings.odLabelOrientation": "Shipping label orientation",
		"settings.odLabelOrientationHint": "Portrait: sender on top, recipient below. Landscape: sender on the left, recipient on the right with a postal sticker area.",
		"settings.odOrientationPortrait": "Portrait (top / bottom)",
		"settings.odOrientationLandscape": "Landscape (left / right)",
		"settings.odInvoiceThanks": "Invoice thank-you text",
		"settings.odReceiptThanks": "Receipt thank-you text",
		"settings.odLabelNote": "Shipping label note",
		"settings.odLabelSize": "Shipping label size",
		"settings.odSize100x150": "100×150 mm (Iran standard)",
		"settings.odSize100x100": "100×100 mm",
		"settings.odSizeA5": "A5",
		"settings.orderDocsProductLabel": "Warehouse product labels",
		"settings.odSplitVariations": "Split variations",
		"settings.odSplitVariationsHint": "Print one warehouse label per product variation.",
		"settings.odProductLabelSize": "Warehouse label size",
		"pages.title": "Pages",
		"pages.add": "Add page",
		"pages.listDescription": "Manage site pages with publish settings and hierarchy.",
		"pages.totalCount": "{{count}} pages",
		"pages.toggleColumns": "Columns",
		"pages.colTitle": "Title",
		"pages.colStatus": "Status",
		"pages.colDate": "Date",
		"pages.colExcerpt": "Excerpt",
		"pages.colActions": "Actions",
		"pages.actionEdit": "Edit",
		"pages.actionQuickEdit": "Quick edit",
		"pages.actionElementor": "Edit with Elementor",
		"pages.actionTrash": "Move to trash",
		"pages.actionView": "View",
		"pages.trashConfirmTitle": "Move page to trash?",
		"pages.trashConfirmBody": "“{{name}}” will be moved to the trash.",
		"pages.quickEditSave": "Update",
		"pages.quickEditCancel": "Cancel",
		"pages.panelParent": "Parent page",
		"pages.parentNone": "No parent (top level)",
		"pages.titlePlaceholder": "Page title",
		"pages.contentPlaceholder": "Start writing…",
		"pages.fieldExcerpt": "Excerpt",
		"pages.excerptPlaceholder": "Optional short summary",
		"pages.editTitle": "Edit page",
		"pages.newTitle": "New page",
		"pages.fieldTitle": "Title",
		"pages.fieldContent": "Content",
		"pages.fieldStatus": "Status",
		"products.title": "Products",
		"products.listDescription": "Store products with advanced pricing fields.",
		"products.add": "Add product",
		"products.colName": "Name",
		"products.colSku": "SKU",
		"products.colPrice": "Price",
		"products.colSale": "Sale",
		"products.colStock": "Stock",
		"products.colWfcpPurchase": "Purchase (wfcp)",
		"products.colImage": "Image",
		"products.colPurchase": "Purchase price",
		"products.colRetail": "Retail",
		"products.colInstallment": "Installment",
		"products.colCredit": "Credit",
		"products.colWholesale": "Wholesale",
		"products.colDiscount": "Discount",
		"products.colBrand": "Brand",
		"products.colCategories": "Categories",
		"products.colTags": "Tags",
		"products.colDate": "Date",
		"products.colViews": "Views",
		"products.colType": "Type",
		"products.colMarketplaces": "Marketplaces",
		"products.colStatus": "Status",
		"products.colActions": "Actions",
		"products.searchPlaceholder": "Search by name or SKU",
		"products.filterCategory": "Category",
		"products.filterBrand": "Brand",
		"products.filterTag": "Tag",
		"products.filterType": "Product type",
		"products.filterStock": "Stock status",
		"products.filterStatus": "Status",
		"products.filterSort": "Sort",
		"products.filterDateFrom": "Date from",
		"products.filterDateTo": "Date to",
		"products.filterAll": "All",
		"products.applyFilters": "Apply filters",
		"products.resetFilters": "Reset",
		"products.toggleColumns": "Columns",
		"products.foundCount": "{{count}} products found",
		"products.selectedCount": "{{count}} products selected",
		"products.selectAll": "Select all products",
		"products.selectProduct": "Select {{name}}",
		"products.printWarehouseLabels": "Print warehouse labels",
		"products.applyEnglishSlugs": "Apply English slugs",
		"products.applyEnglishSlugsConfirm": "Product slugs will be set from the English name. Empty English names are filled with AI (batch limit). Each changed slug gets a Rank Math 301 from the old URL to the new one.",
		"products.applyEnglishSlugsDone": "{{updated}} updated, {{redirected}} redirects, {{skipped}} skipped, {{failed}} failed, {{remaining}} still missing English name",
		"products.printWarehouseLabelsEmpty": "Select one or more products first.",
		"products.stockIn": "In stock",
		"products.stockOut": "Out of stock",
		"products.stockBackorder": "On backorder",
		"products.statusPublish": "Published",
		"products.statusDraft": "Draft",
		"products.statusPending": "Pending review",
		"products.statusPrivate": "Private",
		"products.sortDateDesc": "Newest first",
		"products.sortDateAsc": "Oldest first",
		"products.sortNameAsc": "Name A–Z",
		"products.sortNameDesc": "Name Z–A",
		"products.sortPriceAsc": "Price low to high",
		"products.sortPriceDesc": "Price high to low",
		"products.typeGrouped": "Grouped product",
		"products.typeExternal": "External product",
		"products.actionDuplicate": "Duplicate",
		"products.actionView": "View on site",
		"products.actionSendChannel": "Send to channel",
		"products.actionSendBale": "Send to Bale",
		"products.actionSendTelegram": "Send to Telegram",
		"products.channelSyncOk": "Product sent to channel",
		"products.duplicateOk": "Product duplicated",
		"products.deleteConfirmTitle": "Delete product?",
		"products.deleteConfirm": "Move \"{{name}}\" to trash?",
		"products.status.publish": "Published",
		"products.status.draft": "Draft",
		"products.status.pending": "Pending",
		"products.status.private": "Private",
		"products.stockStatus.instock": "In stock",
		"products.stockStatus.outofstock": "Out of stock",
		"products.stockStatus.onbackorder": "On backorder",
		"products.productType.simple": "Simple",
		"products.productType.variable": "Variable",
		"products.productType.grouped": "Grouped",
		"products.productType.external": "External",
		"products.editTitle": "Edit product",
		"products.newTitle": "New product",
		"products.fieldName": "Name",
		"products.fieldSku": "SKU",
		"products.fieldStatus": "Status (draft/publish)",
		"products.fieldSale": "Sale price",
		"products.fieldDescription": "Description (Review)",
		"products.fieldShortDescription": "Short description",
		"products.fieldManageStock": "Track stock",
		"products.fieldRegular": "Regular price",
		"products.fieldStock": "Stock quantity",
		"products.wfcpSection": "WFCP",
		"products.fieldPurchase": "Purchase price",
		"products.fieldLockPrice": "Lock price",
		"products.createDraft": "Create draft product",
		"products.untitled": "Untitled product",
		"products.fieldType": "Product type",
		"products.typeSimple": "Simple product",
		"products.typeVariable": "Variable product",
		"products.catalogSection": "Catalog (images, taxonomies, attributes)",
		"products.fieldImageId": "Featured image (attachment ID)",
		"products.fieldGalleryIds": "Gallery image IDs",
		"products.galleryIdsHint": "Comma-separated attachment IDs",
		"products.fieldWeight": "Weight",
		"products.fieldDimensions": "Dimensions (L × W × H)",
		"products.dimLength": "Length",
		"products.dimWidth": "Width",
		"products.dimHeight": "Height",
		"products.fieldCategories": "Product categories",
		"products.fieldBrands": "Brands",
		"products.noCategories": "No categories yet.",
		"products.noBrands": "No brands yet.",
		"products.fieldAttributes": "Custom attributes",
		"products.attrNamePlaceholder": "Name (e.g. Color)",
		"products.attrOptionsPlaceholder": "Options, comma-separated",
		"products.attrVisible": "Visible on product page",
		"products.attrVariation": "Used for variations",
		"products.attrOrderConfig": "Order config",
		"products.attrOrderConfigDefault": "Default",
		"products.attrOrderConfigHint": "Shown on the product page as swatches (not a variation). Cannot be used together with “Used for variations”.",
		"products.addAttributeRow": "Add attribute",
		"products.salePlaceholder": "Leave empty if none",
		"products.editor.titleSection": "Product title",
		"products.editor.namePlaceholder": "Enter product name",
		"products.editor.slug": "Slug",
		"products.editor.slugPlaceholder": "e.g. blue-widget",
		"products.editor.slugHint": "Slug is usually in English and used in the product URL.",
		"products.editor.permalink": "Permalink",
		"products.editor.permalinkEmpty": "Permalink appears after the product is saved.",
		"products.editor.editPermalink": "Edit",
		"products.editor.okPermalink": "OK",
		"products.editor.viewProduct": "View",
		"products.seo.panelTitle": "SEO",
		"products.seo.scoreHint": "SEO score: {{score}} / 100",
		"products.seo.rankMathMissing": "SEO plugin not detected — data is still saved to meta",
		"products.seo.tabGeneral": "General",
		"products.seo.tabAdvanced": "Advanced",
		"products.seo.tabSchema": "Schema",
		"products.seo.tabSocial": "Social",
		"products.seo.focusKeyword": "Focus Keyword",
		"products.seo.focusKeywordPlaceholder": "e.g. wireless earbuds",
		"products.seo.seoTitle": "SEO Title",
		"products.seo.metaDescription": "Meta Description",
		"products.seo.metaDescriptionPlaceholder": "Short description for search results…",
		"products.seo.pillar": "Cornerstone Content",
		"products.seo.pillarHint": "Mark this as the main page for the topic.",
		"products.seo.analysis": "Basic SEO analysis",
		"products.seo.checkFocusKeyword": "Focus keyword is set",
		"products.seo.checkKeywordInTitle": "Keyword appears in SEO title",
		"products.seo.checkKeywordInDesc": "Keyword appears in meta description",
		"products.seo.checkKeywordInUrl": "Keyword appears in permalink",
		"products.seo.checkKeywordInContent": "Keyword appears in product content",
		"products.seo.checkTitleLength": "SEO title length is good (10–60)",
		"products.seo.checkDescLength": "Meta description length is good (70–160)",
		"products.seo.robots": "Robots Meta",
		"products.seo.canonical": "Canonical URL",
		"products.seo.breadcrumb": "Breadcrumb Title",
		"products.seo.schemaType": "Schema type",
		"products.seo.schemaHint": "For WooCommerce products this is usually product.",
		"products.seo.gtin": "GTIN",
		"products.seo.mpn": "MPN",
		"products.seo.isbn": "ISBN",
		"products.seo.skuOverride": "Schema SKU",
		"products.seo.brand": "Schema brand",
		"products.seo.facebook": "Facebook / Open Graph",
		"products.seo.twitter": "Twitter",
		"products.seo.ogTitle": "Title",
		"products.seo.ogDescription": "Description",
		"products.seo.ogImage": "Image",
		"products.seo.twitterCard": "Twitter card type",
		"products.ishop.panelTitle": "Store theme settings",
		"products.ishop.panelHint": "Theme-specific fields shown on the storefront product page.",
		"products.ishop.englishName": "English / model name",
		"products.ishop.englishNamePlaceholder": "e.g. Tiger Air2 Wireless Earbuds",
		"products.ishop.shippingTime": "Shipping time (days)",
		"products.ishop.shippingTimeHint": "0 means ready to ship.",
		"products.ishop.initialStock": "Initial stock (offer bar)",
		"products.ishop.videoUrl": "Product video URL",
		"products.ishop.videoCover": "Video cover image",
		"products.ishop.labels": "Product labels",
		"products.ishop.label.check_purchase": "Available for check purchase",
		"products.ishop.label.installment_purchase": "Available for installment purchase",
		"products.ishop.label.credit_purchase": "Available for credit purchase",
		"products.ishop.label.original_product": "Original product",
		"products.ishop.label.non_original_product": "Non-original product",
		"products.ishop.label.has_warranty": "Has warranty",
		"products.ishop.customLabels": "Custom labels",
		"products.ishop.addCustomLabel": "Add label",
		"products.ishop.noCustomLabels": "No custom labels yet.",
		"products.ishop.customLabelText": "Label text",
		"products.ishop.aiReviewSummary": "AI review summary",
		"products.ishop.aiReviewSummaryPlaceholder": "Summary shown on the reviews section…",
		"products.ishop.faqs": "Product FAQs",
		"products.ishop.addFaq": "Add FAQ",
		"products.ishop.noFaqs": "No FAQs yet.",
		"products.ishop.faqQuestion": "Question",
		"products.ishop.faqAnswer": "Answer",
		"products.editor.publishPanel": "Publish",
		"products.editor.catalogVisibility": "Catalog visibility",
		"products.editor.visibilityVisible": "Shop and search",
		"products.editor.visibilityCatalog": "Shop only",
		"products.editor.visibilitySearch": "Search only",
		"products.editor.visibilityHidden": "Hidden",
		"products.editor.featured": "Featured product",
		"products.editor.imagesPanel": "Images",
		"products.editor.coverImage": "Cover image",
		"products.editor.gallery": "Gallery",
		"products.editor.noGallery": "No gallery images yet.",
		"products.editor.addGalleryImage": "Add to gallery",
		"products.editor.dropImageHere": "Drop an image here or click to browse",
		"products.editor.dropGalleryHere": "Drop gallery images here or click to browse",
		"products.editor.uploadImage": "Upload image",
		"products.editor.uploading": "Uploading…",
		"products.editor.uploadImageOk": "Image uploaded",
		"products.editor.uploadImagesOk": "{{count}} images uploaded",
		"products.editor.invalidImageType": "Only image files are allowed",
		"products.editor.moveUp": "Move up",
		"products.editor.moveDown": "Move down",
		"products.editor.tagsPanel": "Tags",
		"products.editor.tagsPlaceholder": "Search or add tags…",
		"products.editor.shortDescPlaceholder": "Short product description…",
		"products.editor.descPlaceholder": "Full product description…",
		"products.editor.tabs.content": "Content",
		"products.editor.tabs.pricing": "Pricing & stock",
		"products.editor.tabs.attributes": "Attributes",
		"products.editor.tabs.coffee": "Coffee",
		"products.editor.tabs.seo": "SEO",
		"products.editor.tabs.advanced": "Advanced",
		"products.editor.taxonomySearch": "Search categories or brands…",
		"products.editor.taxonomyNoMatch": "No matches.",
		"products.editor.pricingPanel": "Pricing",
		"products.editor.purchasePrice": "Purchase price",
		"products.editor.retailPrice": "Retail price",
		"products.editor.wholesalePrice": "Wholesale price",
		"products.editor.installmentPrice": "Installment price",
		"products.editor.creditPrice": "Credit price",
		"products.editor.variablePricingHint": "Set regular/sale and purchase prices per variation in the Variations section.",
		"products.editor.shippingPanel": "Shipping",
		"products.editor.inventoryPanel": "Inventory",
		"products.editor.backorders": "Allow backorders",
		"products.editor.backordersNo": "Do not allow",
		"products.editor.backordersNotify": "Allow, notify customer",
		"products.editor.backordersYes": "Allow",
		"products.editor.variableStockHint": "Stock is managed per variation.",
		"products.editor.relatedPanel": "Related products",
		"products.editor.upsell": "Upsells",
		"products.editor.crossSell": "Cross-sells",
		"products.editor.attributesPanel": "Attributes",
		"products.editor.attributesOrderHint": "Order in this list is shown on the storefront after you save the product.",
		"products.editor.dragToReorder": "Drag to reorder",
		"products.editor.manageAttributes": "Manage attributes",
		"products.editor.addGlobalAttribute": "Add from global attribute",
		"products.editor.createGlobalAttribute": "Create global attribute",
		"products.editor.globalOnlyHint": "Attributes are always WooCommerce global attributes (with terms).",
		"products.editor.legacyAttributeHint": "This attribute is not linked to a global attribute. Remove it and add it from the list above.",
		"products.editor.searchAttributes": "Search attributes…",
		"products.editor.searchTerms": "Search values…",
		"products.editor.noAttributesSelected": "No attributes selected yet. Search and add one above.",
		"products.editor.selectAttribute": "Select attribute…",
		"products.editor.attributeGroupImport": "Import attribute group",
		"products.editor.attributeGroupHint": "Save a named set of global attributes and apply it on any product. Values are chosen per product.",
		"products.editor.attributeGroupSelect": "Group",
		"products.editor.attributeGroupSelectPlaceholder": "Select a group…",
		"products.editor.attributeGroupApply": "Import",
		"products.editor.attributeGroupSaveCurrent": "Save current attributes as a group",
		"products.editor.attributeGroupName": "Group name",
		"products.editor.attributeGroupSave": "Save as group",
		"products.editor.attributeGroupManage": "Groups",
		"products.editor.attributeGroupNew": "New group",
		"products.editor.attributeGroupEdit": "Edit group",
		"products.editor.attributeGroupPick": "Group attributes",
		"products.editor.attributeGroupEmpty": "No groups yet.",
		"products.editor.attributeGroupNoAttrs": "This group has no attributes.",
		"products.editor.attributeGroupSaved": "Group saved.",
		"products.editor.attributeGroupImported": "{{count}} attributes imported.",
		"products.editor.attributeGroupNothingToAdd": "All attributes in this group are already on the product.",
		"products.editor.variationsPanel": "Variations",
		"products.editor.saveBeforeVariations": "Save the product first to manage variations.",
		"products.editor.variationsHint": "After defining variation attributes, add variations here.",
		"products.editor.needVariationAttrs": "To generate variations, save at least one attribute marked “Used for variations” with selected terms.",
		"products.editor.variationsWfcpHint": "Set purchase price on each variation (same as WooCommerce / webina-woo-core). Retail and installment are calculated automatically.",
		"products.editor.variationAttrs": "Attributes",
		"products.editor.videoSection": "Product video",
		"products.lockPrice": "Lock price",
		"products.editor.noVariations": "No variations yet.",
		"products.editor.defaultVariation": "Default variation",
		"products.editor.selectAttributeValue": "Select value…",
		"products.editor.variationAttrsRequired": "Select a value for every variation attribute.",
		"products.editor.orphanVariation": "No attributes · #{{id}}",
		"products.editor.orphanVariationHint": "Pick attribute values below and save to bind this variation.",
		"products.editor.addVariation": "Add variation",
		"products.editor.autosaving": "Saving…",
		"products.editor.autosaved": "Saved",
		"products.editor.bulkVariations": "Apply to all variations",
		"products.editor.bulkVariationsHint": "Checked fields are written on every existing variation. Empty unchecked fields are left alone.",
		"products.editor.bulkApply": "Apply to all",
		"products.editor.bulkConfirmTitle": "Update every variation?",
		"products.editor.bulkConfirmBody": "The selected price and stock values will overwrite those fields on all current variations of this product.",
		"products.editor.bulkUpdated": "{{count}} variations updated.",
		"products.editor.bulkNeedField": "Select at least one field to apply.",
		"products.editor.generateAll": "Generate all variations",
		"products.editor.deleteAllVariations": "Delete all variations",
		"products.editor.deleteAllVariationsTitle": "Delete all variations?",
		"products.editor.deleteAllVariationsBody": "All variations for this product will be permanently removed. You can regenerate from the remaining variation attributes (e.g. weight only).",
		"products.editor.deleteAllVariationsDone": "{{count}} variations deleted.",
		"products.editor.generateConfirmTitle": "Create every attribute combination?",
		"products.editor.generateConfirmBody": "{{total}} combinations possible; {{existing}} already exist and {{missing}} will be created. Prices are not copied — use Apply to all afterwards.",
		"products.editor.generateDone": "{{count}} variations created.",
		"products.editor.typeLockedHint": "Product type cannot change when variations exist.",
		"brands.title": "Brands",
		"brands.newName": "Brand name",
		"brands.add": "Add brand",
		"brands.newTitle": "New brand",
		"brands.editTitle": "Edit brand",
		"brands.colName": "Name",
		"brands.colSlug": "Slug",
		"brands.colImage": "Image",
		"brands.colParent": "Parent",
		"brands.colCount": "Products",
		"brands.colViews": "Views",
		"brands.colActions": "Actions",
		"brands.searchPlaceholder": "Search brands…",
		"brands.filterParent": "Parent brand",
		"brands.filterParentNone": "None (top level)",
		"brands.filterParentRoot": "Top-level only",
		"brands.filterAll": "All",
		"brands.toggleColumns": "Columns",
		"brands.foundCount": "{{count}} brands found",
		"brands.fieldName": "Name",
		"brands.fieldNameHint": "The name is how it appears on your site.",
		"brands.fieldSlug": "Slug",
		"brands.fieldSlugHint": "URL-friendly version of the name; usually lowercase with hyphens.",
		"brands.fieldParent": "Parent brand",
		"brands.fieldParentHint": "Brands can have a parent for hierarchy.",
		"brands.fieldDescription": "Description",
		"brands.fieldDescriptionHint": "Optional; some themes may display it on brand archives.",
		"brands.fieldThumbnail": "Thumbnail",
		"brands.fieldThumbnailHint": "Brand logo or thumbnail image.",
		"brands.actionEdit": "Edit",
		"brands.actionView": "View on site",
		"brands.deleteConfirmTitle": "Delete brand?",
		"brands.deleteConfirm": "Delete “{{name}}”? Products will be unlinked from this brand.",
		"productCats.title": "Product categories",
		"productCats.add": "Add category",
		"productCats.newTitle": "New category",
		"productCats.editTitle": "Edit category",
		"productCats.colName": "Name",
		"productCats.colSlug": "Slug",
		"productCats.colImage": "Image",
		"productCats.colParent": "Parent",
		"productCats.colCount": "Products",
		"productCats.colViews": "Views",
		"productCats.colActions": "Actions",
		"productCats.searchPlaceholder": "Search categories…",
		"productCats.filterParent": "Parent category",
		"productCats.filterParentNone": "None (top level)",
		"productCats.filterParentRoot": "Top-level only",
		"productCats.filterAll": "All",
		"productCats.toggleColumns": "Columns",
		"productCats.foundCount": "{{count}} categories found",
		"productCats.fieldName": "Name",
		"productCats.fieldNameHint": "The name is how it appears on your site.",
		"productCats.fieldSlug": "Slug",
		"productCats.fieldSlugHint": "URL-friendly version of the name; usually lowercase with hyphens.",
		"productCats.fieldParent": "Parent category",
		"productCats.fieldParentHint": "Categories can have a parent for hierarchy.",
		"productCats.fieldDescription": "Description",
		"productCats.fieldDescriptionHint": "Optional; some themes may display it on category archives.",
		"productCats.fieldThumbnail": "Thumbnail",
		"productCats.fieldThumbnailHint": "Category thumbnail image.",
		"productCats.actionEdit": "Edit",
		"productCats.actionView": "View on site",
		"productCats.deleteConfirmTitle": "Delete category?",
		"productCats.deleteConfirm": "Delete “{{name}}”? Products will be unlinked from this category.",
		"attributes.title": "Product attributes",
		"attributes.description": "Manage global product attributes and their values.",
		"attributes.listHint": "Global attributes are shared across products and used for variations.",
		"attributes.newButton": "New attribute",
		"attributes.newTitle": "New attribute",
		"attributes.newDescription": "Create a global attribute, then add terms (values).",
		"attributes.editTitle": "Edit attribute",
		"attributes.sectionDetails": "Attribute settings",
		"attributes.colName": "Label",
		"attributes.colSlug": "Slug",
		"attributes.colType": "Type",
		"attributes.colTerms": "Terms",
		"attributes.emptyHint": "No global attributes found.",
		"attributes.deleteConfirmTitle": "Delete attribute?",
		"attributes.deleteConfirmBody": "This removes the attribute and all its terms. Products using it may lose assignments.",
		"attributes.field.label": "Label",
		"attributes.field.slug": "Slug",
		"attributes.field.type": "Type",
		"attributes.field.orderBy": "Default sort",
		"attributes.field.hasArchives": "Enable archives",
		"attributes.type.select": "Dropdown",
		"attributes.type.text": "Text",
		"attributes.type.color": "Color",
		"attributes.type.image": "Image",
		"attributes.type.button": "Label",
		"attributes.typeHint.select": "Classic dropdown",
		"attributes.typeHint.color": "Color circles",
		"attributes.typeHint.image": "Photo squares",
		"attributes.typeHint.button": "Text pills",
		"attributes.typeHint.text": "Free text",
		"attributes.showSwatchLabel": "Show name under each swatch",
		"attributes.showSwatchLabelHint": "When off, the name is only in the tooltip and screen-reader label.",
		"attributes.preview.red": "Red",
		"attributes.preview.white": "White",
		"attributes.preview.navy": "Navy",
		"attributes.preview.addImages": "Add images to see a live preview.",
		"attributes.orderBy.menu_order": "Custom ordering",
		"attributes.orderBy.name": "Name",
		"attributes.orderBy.name_num": "Name (numeric)",
		"attributes.orderBy.id": "Term ID",
		"attributes.terms.title": "Terms (values)",
		"attributes.terms.add": "Add term",
		"attributes.terms.addTitle": "Add term",
		"attributes.terms.editTitle": "Edit term",
		"attributes.terms.name": "Name",
		"attributes.terms.slug": "Slug",
		"attributes.terms.description": "Description",
		"attributes.terms.menuOrder": "Order",
		"attributes.terms.color": "Color",
		"attributes.terms.colorPlaceholder": "#ff0000",
		"attributes.terms.image": "Image",
		"attributes.terms.noImage": "No image",
		"attributes.terms.selectImage": "Select image",
		"attributes.terms.uploadImage": "Upload image",
		"attributes.terms.empty": "No terms yet.",
		"attributes.terms.colCount": "Products",
		"attributes.terms.deleteConfirmTitle": "Delete term?",
		"attributes.terms.deleteConfirmBody": "Products using this term will be updated.",
		"orders.title": "Orders",
		"orders.detailTitle": "Order #{{id}}",
		"orders.colNumber": "Order",
		"orders.colCustomer": "Customer",
		"orders.colStatus": "Status",
		"orders.colTotal": "Total",
		"orders.colDate": "Date",
		"orders.status": "Status",
		"orders.total": "Total",
		"orders.newStatus": "New status",
		"orders.applyStatus": "Apply status",
		"orders.wcStatus.pending": "Pending",
		"orders.wcStatus.processing": "Processing",
		"orders.wcStatus.on-hold": "On hold",
		"orders.wcStatus.completed": "Completed",
		"orders.wcStatus.cancelled": "Cancelled",
		"orders.wcStatus.refunded": "Refunded",
		"orders.emptyHint": "No orders yet. New store orders will show up here.",
		"orders.detailNotFound": "Order could not be loaded.",
		"orders.sectionTotals": "Totals and payment",
		"orders.sectionBilling": "Billing",
		"orders.sectionShipping": "Shipping",
		"orders.addrName": "Name",
		"orders.addrCompany": "Company",
		"orders.addrEmail": "Email",
		"orders.addrPhone": "Phone",
		"orders.addrState": "State",
		"orders.addrCity": "City",
		"orders.addrStreet": "Address",
		"orders.addrPostcode": "Postcode",
		"orders.paymentMethod": "Payment method",
		"orders.itemMeta.wfcp_purchase_type": "Purchase type",
		"orders.purchaseType.cash": "Cash",
		"orders.purchaseType.credit": "Credit",
		"orders.purchaseType.installment": "Installment",
		"orders.purchaseType.wholesale": "Wholesale",
		"orders.orderDate": "Order date",
		"orders.customerNote": "Customer note",
		"orders.itemsDetail": "Line items",
		"orders.colSku": "SKU",
		"orders.colSubtotal": "Line subtotal",
		"orders.colTotalLine": "Line total",
		"orders.shippingLine": "Shipping",
		"orders.subtotalOrder": "Subtotal",
		"orders.listDescription": "Manage store orders with filters, search, and bulk actions.",
		"orders.myOrdersTitle": "My orders",
		"orders.myOrdersDescription": "Orders placed with this account.",
		"orders.tabAll": "All",
		"orders.searchPlaceholder": "Search by number, name, email, or phone…",
		"orders.dateFrom": "From date",
		"orders.dateTo": "To date",
		"orders.totalCount": "{{count}} orders",
		"orders.selectedCount": "{{count}} selected",
		"orders.colShipTo": "Ship to",
		"orders.colSource": "Origin",
		"orders.openMaps": "Maps",
		"orders.selectAll": "Select all",
		"orders.selectOrder": "Select order {{number}}",
		"orders.bulkActions": "Bulk actions",
		"orders.bulkChangeStatus": "Change status",
		"orders.bulkSendEmail": "Send email",
		"orders.bulkTrash": "Move to trash",
		"orders.bulkDelete": "Delete permanently",
		"orders.bulkApply": "Apply",
		"orders.bulkDone": "{{ok}} succeeded, {{failed}} failed",
		"orders.bulkConfirmTitle": "Confirm action",
		"orders.bulkConfirmBody": "{{count}} orders — {{action}}?",
		"orders.bulk_trash": "move to trash",
		"orders.bulk_delete": "delete permanently",
		"orders.bulkEmailInvoice": "Customer invoice",
		"orders.bulkEmailProcessing": "Processing order email",
		"orders.bulkEmailCompleted": "Completed order email",
		"orders.bulkEmailOnHold": "On-hold order email",
		"orders.wcStatus.pws-packaged": "Packaged",
		"orders.wcStatus.pws-courier": "Courier",
		"orders.wcStatus.failed": "Failed",
		"orders.detailTitleNumber": "Order #{{number}}",
		"orders.sectionGeneral": "General",
		"orders.paidVia": "Paid via {{method}}",
		"orders.customerIp": "Customer IP",
		"orders.notEditable": "This order is no longer editable.",
		"orders.customer": "Customer",
		"orders.guestCustomer": "Guest",
		"orders.shippingMethod": "Shipping method",
		"orders.nationalId": "National ID",
		"orders.checkoutPhone": "Checkout phone",
		"orders.discount": "Discount",
		"orders.printInvoice": "Print invoice",
		"orders.printLabel": "Print postal label",
		"orders.printReceipt": "Print receipt",
		"orders.printPacking": "Print packing slip",
		"orders.printCustomerLabel": "Print customer label",
		"orders.printStoreLabel": "Print store label",
		"orders.printNewLabels": "Print new order labels",
		"orders.printNewLabelsEmpty": "No processing or on-hold orders without a printed shipping label.",
		"orders.panelTracking": "Post tracking",
		"orders.trackingCode": "Tracking code",
		"orders.trackingProvider": "Provider",
		"orders.trackingLink": "Track shipment",
		"orders.deliverySlot": "Delivery slot",
		"orders.panelDigipay": "Digipay",
		"orders.digipayTransaction": "Transaction ID",
		"orders.digipayType": "Transaction type",
		"orders.digipayTrackingCode": "Tracking code",
		"orders.digipayProviderId": "Provider ID",
		"orders.digipayGateway": "Gateway",
		"orders.digipayDelivered": "Delivered",
		"digipay.settingsTitle": "DigiPay settings",
		"digipay.settingsSubtitle": "Configure credentials, environment, and transaction logs for DigiPay UPG.",
		"digipay.transactionsTitle": "DigiPay transactions",
		"digipay.testConnection": "Test connection",
		"digipay.testSuccess": "Connection successful",
		"digipay.environment": "Environment",
		"digipay.env.staging": "Staging",
		"digipay.env.live": "Live",
		"digipay.col.time": "Time",
		"digipay.col.order": "Order",
		"digipay.col.endpoint": "Endpoint",
		"digipay.col.status": "Status",
		"digipay.col.message": "Message",
		"digipay.status.ok": "OK",
		"digipay.status.failed": "Failed",
		"digipay.field.version": "Digipay version",
		"digipay.field.clientId": "Client ID",
		"digipay.field.clientSecret": "Client secret",
		"digipay.field.username": "Username",
		"digipay.field.password": "Password",
		"digipay.field.sellerId": "Seller ID",
		"digipay.field.supplierId": "Supplier ID",
		"digipay.field.categoryId": "Category ID",
		"digipay.field.productType": "Product type",
		"orders.panelAttribution": "Order attribution",
		"orders.attrSource": "Source",
		"orders.attrDevice": "Device",
		"orders.attrSessions": "Session count",
		"orders.attrUtmSource": "UTM Source",
		"orders.attrUtmMedium": "UTM Medium",
		"orders.attrUtmCampaign": "UTM Campaign",
		"orders.attrSourceType.organic": "Organic",
		"orders.attrSourceType.referral": "Referral",
		"orders.attrSourceType.typein": "Direct",
		"orders.attrSourceType.utm": "UTM",
		"orders.attrSourceType.admin": "Admin",
		"orders.attrSourceType.direct": "Direct",
		"orders.attrSourceType.paid": "Paid",
		"orders.attrSourceType.social": "Social",
		"orders.attrDeviceType.mobile": "Mobile",
		"orders.attrDeviceType.desktop": "Desktop",
		"orders.attrDeviceType.tablet": "Tablet",
		"orders.createdVia.system": "System",
		"orders.createdVia.checkout": "Checkout",
		"orders.createdVia.admin": "Admin",
		"orders.createdVia.rest-api": "REST API",
		"orders.createdVia.store-api": "Store API",
		"orders.noteAddedBy.system": "System",
		"orders.noteAddedBy.checkout": "Checkout",
		"orders.noteAddedBy.admin": "Admin",
		"orders.panelNotes": "Order notes",
		"orders.noNotes": "No notes yet.",
		"orders.notePlaceholder": "Add a note…",
		"orders.noteToCustomer": "Note to customer",
		"orders.addNote": "Add note",
		"orders.noteAdded": "Note added",
		"orders.panelCustomerHistory": "Customer history",
		"orders.historyOrders": "Order count",
		"orders.historyRevenue": "Total spent",
		"orders.historyAov": "Average order value",
		"orders.stats.orders": "Orders",
		"orders.stats.revenue": "Revenue",
		"orders.stats.aov": "Avg. order",
		"orders.stats.processing": "Processing",
		"orders.stats.completed": "Completed",
		"orders.stats.pending": "Pending",
		"orders.colState": "Province",
		"orders.colPayment": "Payment",
		"orders.colUtm": "UTM",
		"orders.filterAll": "All",
		"orders.filterPayment": "Payment gateway",
		"orders.filterState": "Province",
		"orders.filterShipping": "Shipping method",
		"orders.filterMarketplace": "Marketplace",
		"orders.filterUtmSource": "UTM source",
		"orders.filterUtmMedium": "UTM medium",
		"orders.filterUtmCampaign": "UTM campaign",
		"orders.filterCustomer": "Customer",
		"orders.filterCustomerRole": "Customer role",
		"orders.filterCustomerHint": "User ID, email, or phone",
		"orders.filterMinTotal": "Min total",
		"orders.filterMaxTotal": "Max total",
		"orders.shippingFree": "Free",
		"orders.sectionAddress": "Address",
		"orders.contact.call": "Call",
		"orders.contact.sms": "SMS",
		"orders.contact.whatsapp": "WhatsApp",
		"orders.contact.eitaa": "Eitaa",
		"orders.contact.bale": "Bale",
		"orders.contact.baleUnavailable": "Bale not connected",
		"orders.contact.telegram": "Telegram",
		"orders.contact.telegramUnavailable": "Telegram not connected",
		"orders.contact.openUser": "Open user",
		"orders.panelSmsHistory": "SMS history",
		"orders.smsHistoryEmpty": "No SMS logs for this order.",
		"orders.smsStatus.delivered": "Delivered",
		"orders.smsStatus.failed": "Failed",
		"orders.sms.manual": "Manual",
		"orders.customerOrdersList": "Orders",
		"orders.selectShippingMethod": "Select shipping method",
		"orders.trackingProviderOther": "Other",
		"orders.postBarcode": "Post barcode",
		"orders.panelCustomerProfile": "Customer profile",
		"products.stats.total": "Products",
		"products.stats.publish": "Published",
		"products.stats.draft": "Draft",
		"products.stats.outofstock": "Out of stock",
		"products.stats.instock": "In stock",
		"coupons.stats.total": "Coupons",
		"coupons.stats.active": "Active",
		"users.stats.total": "Users",
		"users.stats.customers": "Customers",
		"users.stats.partners": "Partners",
		"pages.emptyHint": "No pages yet. Create one to get started.",
		"coupons.emptyList": "No coupons yet. Add a discount code to get started.",
		"coupons.codePlaceholder": "CODE",
		"brands.emptyHint": "No brands match your filters.",
		"categories.emptyHint": "No categories yet. Add one above.",
		"productCats.emptyHint": "No categories match your filters.",
		"comments.emptyQueue": "No comments awaiting moderation.",
		"reports.emptyHint": "No data for this period.",
		"users.emptyListHint": "No users returned for this site.",
		"reports.title": "Sales reports",
		"reports.description": "Revenue for the selected period.",
		"reports.revenue": "Revenue",
		"reports.orders": "Orders",
		"reports.period30d": "Last 30 days",
		"reports.descriptionFull": "Full sales and order analytics with previous-period comparison.",
		"reports.dateFrom": "From date",
		"reports.dateTo": "To date",
		"reports.interval": "Chart interval",
		"reports.intervalDay": "Daily",
		"reports.intervalWeek": "Weekly",
		"reports.intervalMonth": "Monthly",
		"reports.comparePrevious": "Compare to previous period",
		"reports.comparePeriod": "Previous period",
		"reports.statusFilter": "Order status",
		"reports.exportCsv": "Export CSV",
		"reports.deltaNew": "New",
		"reports.preset.today": "Today",
		"reports.preset.yesterday": "Yesterday",
		"reports.preset.last7": "Last 7 days",
		"reports.preset.last30": "Last 30 days",
		"reports.preset.thisWeek": "This week",
		"reports.preset.lastWeek": "Last week",
		"reports.preset.thisMonth": "This month",
		"reports.preset.lastMonth": "Last month",
		"reports.preset.thisYear": "This year",
		"reports.preset.custom": "Custom",
		"reports.status.completed": "Completed",
		"reports.status.processing": "Processing",
		"reports.status.on-hold": "On hold",
		"reports.status.pending": "Pending payment",
		"reports.status.cancelled": "Cancelled",
		"reports.status.refunded": "Refunded",
		"reports.status.failed": "Failed",
		"reports.kpi.revenue": "Gross revenue",
		"reports.kpi.netRevenue": "Net revenue",
		"reports.kpi.orders": "Orders",
		"reports.kpi.aov": "Average order value",
		"reports.kpi.itemsSold": "Items sold",
		"reports.kpi.discounts": "Discounts",
		"reports.kpi.shipping": "Shipping",
		"reports.kpi.tax": "Tax",
		"reports.kpi.refunds": "Refunds amount",
		"reports.kpi.refundCount": "Refunds count",
		"reports.kpi.cogs": "COGS",
		"reports.kpi.grossProfit": "Gross profit",
		"reports.kpi.grossMargin": "Gross margin",
		"reports.kpi.missingCost": "Items missing purchase price",
		"reports.chart.revenueOrders": "Revenue and orders over time",
		"reports.chart.profit": "Revenue, COGS and profit over time",
		"reports.chart.byPriceTier": "By price tier",
		"reports.chart.heatmap": "Orders heatmap (day × hour)",
		"reports.chart.byStatus": "By status",
		"reports.chart.byPayment": "Payment methods",
		"reports.chart.bySource": "Order source",
		"reports.chart.byHour": "Orders by hour",
		"reports.table.topProducts": "Top products",
		"reports.table.topCategories": "Top categories",
		"reports.table.topCustomers": "Top customers",
		"reports.table.product": "Product",
		"reports.table.category": "Category",
		"reports.table.customer": "Customer",
		"reports.table.quantity": "Quantity",
		"reports.table.cogs": "COGS",
		"reports.table.profit": "Profit",
		"reports.table.margin": "Margin",
		"reports.table.topProductsProfit": "Top products by profit",
		"reports.table.missingCostQty": "{{count}} without cost",
		"reports.tier.retail": "Retail (cash)",
		"reports.tier.credit": "Credit",
		"reports.tier.installment": "Installment",
		"reports.tier.wholesale": "Wholesale",
		"reports.heatmap.dow.0": "Sun",
		"reports.heatmap.dow.1": "Mon",
		"reports.heatmap.dow.2": "Tue",
		"reports.heatmap.dow.3": "Wed",
		"reports.heatmap.dow.4": "Thu",
		"reports.heatmap.dow.5": "Fri",
		"reports.heatmap.dow.6": "Sat",
		"reports.heatmap.hour": "{{hour}}:00",
		"reports.heatmap.legendMin": "Fewer orders",
		"reports.heatmap.legendMax": "More orders",
		"reports.wfcpDisabledHint": "WFCP inactive",
		"reports.cogsApproxHint": "Purchase prices use current product meta, not historical snapshots.",
		"coupons.title": "Coupons",
		"coupons.create": "Create coupon",
		"coupons.amount": "Amount",
		"coupons.submitCreate": "Create",
		"coupons.editSelected": "Edit selected",
		"coupons.pickRow": "Select a row in the table.",
		"coupons.colCode": "Code",
		"coupons.colAmount": "Amount",
		"coupons.colType": "Type",
		"coupons.colExpiry": "Expires",
		"coupons.colUsage": "Usage",
		"coupons.fieldDescription": "Description",
		"coupons.fieldExpires": "Expiry (YYYY-MM-DD or empty)",
		"coupons.fieldMinAmount": "Minimum spend",
		"coupons.fieldMaxAmount": "Maximum spend",
		"coupons.fieldUsageLimit": "Usage limit (empty = unlimited)",
		"coupons.individualUse": "Individual use only",
		"coupons.freeShipping": "Free shipping",
		"coupons.excludeSale": "Exclude sale items",
		"coupons.addCoupon": "Add coupon",
		"coupons.newTitle": "Add new coupon",
		"coupons.editTitle": "Edit coupon",
		"coupons.colDescription": "Description",
		"coupons.colProductIds": "Product IDs",
		"coupons.colActions": "Actions",
		"coupons.selectAll": "Select all",
		"coupons.selectedCount": "{{count}} selected",
		"coupons.searchPlaceholder": "Search coupon code…",
		"coupons.bulkTrash": "Move to trash",
		"coupons.bulkConfirmTitle": "Move coupons to trash?",
		"coupons.bulkConfirmBody": "Move {{count}} coupon(s) to trash?",
		"coupons.bulkDone": "{{ok}} succeeded, {{failed}} failed",
		"coupons.trashConfirmTitle": "Move to trash?",
		"coupons.trashConfirmBody": "Move coupon \"{{code}}\" to trash?",
		"coupons.trashed": "Moved to trash",
		"coupons.actionEdit": "Edit",
		"coupons.actionTrash": "Move to trash",
		"coupons.generateCode": "Generate coupon code",
		"coupons.sectionCode": "Coupon code",
		"coupons.sectionGeneral": "Coupon data",
		"coupons.sectionUsage": "Usage limits",
		"coupons.sectionRestrictions": "Usage restrictions",
		"coupons.fieldDiscountType": "Discount type",
		"coupons.usageLimitPerUser": "Usage limit per user",
		"coupons.productsInclude": "Products",
		"coupons.productsExclude": "Exclude products",
		"coupons.categoriesInclude": "Product categories",
		"coupons.categoriesExclude": "Exclude categories",
		"coupons.brandsInclude": "Product brands",
		"coupons.brandsExclude": "Exclude brands",
		"coupons.allowedEmails": "Allowed emails",
		"coupons.allowedEmailsHint": "One email per line (or comma-separated)",
		"coupons.productSearchPlaceholder": "Search products…",
		"coupons.noProductsFound": "No products found",
		"coupons.restrict.allowedUsers": "Allowed users",
		"coupons.restrict.allowedUsersHint": "Leave empty for all users. Search by name, phone, or national ID.",
		"coupons.restrict.userSearchPlaceholder": "Search name, phone, national ID…",
		"coupons.restrict.noUsersFound": "No users found",
		"coupons.restrict.states": "Provinces",
		"coupons.restrict.statesHint": "Empty = all provinces",
		"coupons.restrict.cities": "Cities",
		"coupons.restrict.citiesHint": "Select provinces first. Empty = all cities in selected provinces",
		"coupons.restrict.noStates": "No provinces available",
		"coupons.restrict.noCities": "No cities for selected provinces",
		"coupons.restrict.paymentMethods": "Payment gateways",
		"coupons.restrict.paymentMethodsHint": "Empty = all gateways",
		"coupons.restrict.noPayments": "No payment gateways",
		"coupons.restrict.purchaseTypes": "Purchase type",
		"coupons.restrict.purchaseTypesHint": "Cash, installment, credit… Empty = all types",
		"coupons.restrict.noPurchaseTypes": "No purchase types",
		"coupons.restrict.shippingMethods": "Shipping methods",
		"coupons.restrict.shippingMethodsHint": "Empty = all shipping methods",
		"coupons.restrict.noShipping": "No shipping methods",
		"coupons.restrict.channels": "Sales channel",
		"coupons.restrict.channelsHint": "Empty = website and all bots",
		"coupons.restrict.channelSite": "Website",
		"coupons.restrict.channelBale": "Bale bot",
		"coupons.restrict.channelTelegram": "Telegram bot",
		"coupons.publishPanel": "Publish",
		"users.title": "Users",
		"users.editPanel": "Edit user",
		"users.pickRow": "Select a user row.",
		"users.colLogin": "Username",
		"users.colName": "Name",
		"users.colEmail": "Email",
		"users.createTitle": "Add user",
		"users.fieldLogin": "Username",
		"users.fieldEmail": "Email",
		"users.fieldPassword": "Password (min 8)",
		"users.fieldRole": "Role",
		"users.submitCreate": "Create user",
		"users.roleSubscriber": "Subscriber",
		"users.roleCustomer": "Customer",
		"users.rolePartner": "Partner (wholesale)",
		"users.roleAuthor": "Author",
		"users.roleEditor": "Editor",
		"users.roleShopManager": "Shop manager",
		"users.colAvatar": "Avatar",
		"users.colPhone": "Phone",
		"users.colRole": "Role",
		"users.colActions": "Actions",
		"users.editTitle": "Edit user: {{login}}",
		"users.myAccountTitle": "My account",
		"users.searchPlaceholder": "Search users…",
		"users.filter.botAll": "All users",
		"users.filter.roleAll": "All roles",
		"users.bulkSelected": "{{count}} users selected",
		"users.bulkMakePartner": "Make partner",
		"users.bulkMakeCustomer": "Revert to customer",
		"users.bulkRoleDone": "Updated {{count}} users",
		"users.selectAll": "Select all",
		"users.selectUser": "Select user",
		"users.filter.botBale": "Bale bot",
		"users.filter.botTelegram": "Telegram bot",
		"users.colChatId": "Chat ID",
		"users.foundCount": "{{count}} users found",
		"users.sectionAccount": "Account",
		"users.sectionCommunication": "Communication",
		"users.fieldFirstName": "First name",
		"users.fieldLastName": "Last name",
		"users.commChannelEmail": "Email",
		"users.commChannelWhatsapp": "WhatsApp",
		"users.commSend": "Send",
		"users.commNoChannel": "Select at least one channel",
		"users.commPartialSuccess": "Some channels failed to send",
		"users.sectionAddresses": "Addresses",
		"users.sectionWishlist": "Wishlist",
		"users.sectionBots": "Bot connections",
		"users.sectionProfile": "Public profile",
		"users.sectionBank": "Bank details",
		"users.actionResetPassword": "Reset password",
		"users.actionChangeRole": "Change role",
		"users.actionSendMessage": "Send message",
		"users.actionSwitchUserSoon": "Switch user (coming soon)",
		"users.deleteConfirmTitle": "Delete user?",
		"users.deleteConfirmBody": "Remove user \"{{login}}\" permanently?",
		"users.fieldJob": "Job",
		"users.fieldNationalId": "National ID",
		"users.fieldBirthDate": "Birth date",
		"users.fieldLandline": "Landline",
		"users.fieldBankName": "Bank name",
		"users.fieldBankAccount": "Account number",
		"users.fieldBankCard": "Card number",
		"users.fieldBankSheba": "Sheba (IBAN)",
		"users.connected": "Connected",
		"users.disconnected": "Not connected",
		"users.disconnectBot": "Disconnect",
		"users.botTelegram": "Telegram",
		"users.botBale": "Bale",
		"users.botFilterLabel": "Bot filter",
		"users.resetGenerate": "Generate new password",
		"users.resetSendEmail": "Send reset email",
		"users.resetGenerated": "New password generated",
		"users.resetEmailSent": "Reset email sent",
		"users.resetEmailHint": "A reset link will be emailed to the user (recommended).",
		"users.messageSent": "Message sent",
		"users.messageChannel": "Channel",
		"users.messageBody": "Message",
		"users.sendMessage": "Send",
		"users.channelSms": "SMS",
		"users.channelTelegram": "Telegram",
		"users.channelBale": "Bale",
		"users.noPhone": "no phone",
		"users.addAddress": "Add address",
		"users.defaultAddress": "Default",
		"users.setDefaultAddress": "Set as default",
		"users.addr.label": "Label",
		"users.addr.first_name": "First name",
		"users.addr.last_name": "Last name",
		"users.addr.state": "State",
		"users.addr.city": "City",
		"users.addr.address_1": "Address line 1",
		"users.addr.address_2": "Address line 2",
		"users.addr.postcode": "Postcode",
		"users.addr.phone": "Phone",
		"users.addr.plaque": "Plaque",
		"users.addr.unit": "Unit",
		"users.addr.lat": "Latitude",
		"users.addr.lng": "Longitude",
		"account.homeTitle": "Account overview",
		"account.homeSubtitle": "Orders, favorites, wallet and support at a glance.",
		"account.cardOrders": "Orders",
		"account.cardFavorites": "Favorites",
		"account.cardNotifications": "Unread notifications",
		"account.cardTickets": "Open tickets",
		"account.cardWallet": "Wallet balance",
		"account.addressesTitle": "Addresses",
		"account.addressesSubtitle": "Delivery addresses, plaque, unit and map pin.",
		"account.notificationsTitle": "Notifications",
		"account.notificationsSubtitle": "Store messages about orders and support.",
		"account.markAllRead": "Mark all as read",
		"account.favoritesTitle": "Favorites",
		"account.favoritesSubtitle": "Products you have saved.",
		"account.reviewsTitle": "Reviews & questions",
		"account.reviewsSubtitle": "Rate purchases and see your questions.",
		"account.tabPendingReviews": "Pending reviews",
		"account.tabMyReviews": "My reviews",
		"account.tabMyQuestions": "My questions",
		"account.rating": "Rating",
		"account.ratingValue": "Rating {{rating}} of 5",
		"account.reviewBody": "Review text",
		"account.submitReview": "Submit review",
		"account.productId": "Product ID",
		"account.questionBody": "Question",
		"account.submitQuestion": "Submit question",
		"account.ticketsTitle": "Support",
		"account.ticketsSubtitle": "Open a ticket or reply to previous conversations.",
		"account.ticketSubject": "Subject",
		"account.ticketBody": "Message",
		"account.ticketCreate": "Send ticket",
		"account.ticketDetailTitle": "Ticket",
		"account.ticketReply": "Reply",
		"account.ticketSend": "Send reply",
		"account.ticketStaff": "Support",
		"account.ticketYou": "You",
		"account.ticketSearch": "Search subject…",
		"account.staffTicketsTitle": "Ticket inbox",
		"account.staffTicketsSubtitle": "Reply to customer tickets and update status.",
		"account.ticketStatus.open": "Open",
		"account.ticketStatus.answered": "Answered",
		"account.ticketStatus.pending": "Pending",
		"account.ticketStatus.closed": "Closed",
		"settings.smsTitle": "SMS panel",
		"settings.smsProvider": "Provider",
		"settings.smsKavenegar": "Kavenegar",
		"settings.smsMelipayamak": "MeliPayamak",
		"settings.smsCustom": "Custom HTTP",
		"settings.smsApiKey": "API key",
		"settings.smsSenderLine": "Sender line",
		"settings.smsCustomEndpoint": "Custom endpoint",
		"settings.smsModirpayamak": "SMS panel",
		"settings.smsModirpayamakHint": "SMS is sent via your platform wallet. Top up and manage campaigns in the SMS panel.",
		"settings.smsSenderLinePlaceholder": "+1234567890",
		"settings.shopSms.phonePlaceholder": "555-0100",
		"settings.smsModirpayamakBalance": "Wallet balance",
		"settings.smsModirpayamakPanel": "Open SMS panel",
		"marketing.sms.serviceUnavailable": "SMS service is unavailable. You can browse this page; sending and top-up work once the connection is restored.",
		"marketing.sms.dashboardTitle": "SMS panel",
		"marketing.botBroadcast": "Bot broadcast",
		"marketing.botCampaigns": "Bot campaigns",
		"marketing.sms.dashboardDesc": "Balance, send, and reports via the SMS panel.",
		"marketing.sms.balance": "Balance",
		"marketing.sms.toman": "Toman",
		"marketing.sms.topup": "Top up",
		"marketing.sms.send": "Send",
		"marketing.sms.reports": "Reports",
		"marketing.sms.phonebook": "Phonebook",
		"marketing.sms.recentSends": "Recent messages",
		"marketing.sms.noMessages": "No messages yet.",
		"marketing.sms.sendTitle": "Send SMS",
		"marketing.sms.fromNumber": "Sender line",
		"marketing.sms.phone": "Phone",
		"marketing.sms.message": "Message",
		"marketing.sms.sent": "Message sent.",
		"marketing.sms.sendFailed": "Send failed.",
		"marketing.sms.reportsTitle": "Send reports",
		"marketing.sms.reportsHint": "Local send log and provider outbox history.",
		"marketing.sms.localMessagesHint": "Messages recorded on this site.",
		"marketing.sms.outboxHint": "Delivery status from the SMS provider.",
		"marketing.sms.inboxHint": "Incoming SMS received on your lines.",
		"marketing.sms.scheduledHint": "Future sends that can still be cancelled.",
		"marketing.sms.type": "Type",
		"marketing.sms.status": "Status",
		"marketing.sms.cost": "Cost",
		"marketing.sms.phonebookTitle": "Phonebook",
		"marketing.sms.phonebookHint": "Manage contact lists and send SMS to saved numbers.",
		"marketing.sms.newPhonebook": "New phonebook",
		"marketing.sms.topupTitle": "Top up wallet",
		"marketing.sms.bonus": "bonus",
		"marketing.sms.buy": "Buy",
		"marketing.sms.paymentVerifying": "Verifying payment…",
		"marketing.sms.paymentSuccess": "Payment successful. Credit added.",
		"marketing.sms.paymentFailed": "Payment failed or was cancelled.",
		"marketing.sms.paymentCallback": "Payment",
		"marketing.sms.patterns": "Patterns",
		"marketing.sms.patternsTitle": "SMS patterns",
		"marketing.sms.patternsHint": "Browse approved IPPanel patterns and assign each one to an order status for customer or admin SMS.",
		"marketing.sms.matrixHint": "For each order status, enable customer and admin SMS, review text and variables, then register or bind a pattern.",
		"marketing.sms.matrixTestPhone": "Test phone number",
		"marketing.sms.matrixTestPhoneHint": "Used by each cell’s Test button; leave empty for the default from settings.",
		"marketing.sms.matrixSearchEvent": "Search status / event…",
		"marketing.sms.matrixEventCount": "{{count}} statuses",
		"marketing.sms.matrixExtra": "extra",
		"marketing.sms.matrixPatternVars": "Pattern variables",
		"marketing.sms.matrixNoVars": "No variables in the body or pattern.",
		"marketing.sms.matrixSaveCell": "Save cell",
		"marketing.sms.matrixRegister": "Register pattern",
		"marketing.sms.matrixApprovedList": "Approved IPPanel patterns",
		"marketing.sms.matrixApprovedHint": "Quick pick for matrix cells; search by title or code.",
		"marketing.sms.registryTitle": "SMS pattern registry",
		"marketing.sms.registryHint": "Which pattern is bound to each order event.",
		"marketing.sms.noRegistry": "No synced patterns yet.",
		"marketing.sms.ippanelPatterns": "Pattern list",
		"marketing.sms.patternCount": "{{count}} patterns",
		"marketing.sms.searchPatterns": "Search title, code, website…",
		"marketing.sms.noPatterns": "No patterns returned from IPPanel.",
		"marketing.sms.assignToStatus": "Assign to status",
		"marketing.sms.confirmAssign": "Assign pattern",
		"marketing.sms.patternAssigned": "Pattern assigned to status.",
		"marketing.sms.patternCodeMissing": "Pattern code is missing.",
		"marketing.sms.scopeColumn": "Role",
		"marketing.sms.eventColumn": "Event / status",
		"marketing.sms.scopeCustomer": "Customer",
		"marketing.sms.scopeAdmin": "Admin",
		"marketing.sms.changeAssignment": "Change",
		"marketing.sms.pickPattern": "Choose pattern",
		"marketing.sms.boundTo": "Assigned to",
		"marketing.sms.openShopSms": "Shop SMS settings",
		"marketing.sms.newsletter": "Product newsletter",
		"marketing.sms.newsletterTitle": "Product newsletter",
		"marketing.sms.newsletterCampaign": "Send campaign",
		"marketing.sms.productId": "Product ID (0 = all)",
		"marketing.sms.subscriberCount": "{{count}} subscribers",
		"marketing.sms.sendCampaign": "Send to subscribers",
		"marketing.sms.newsletterSent": "Sent {{count}} messages.",
		"marketing.sms.sendMode": "Send mode",
		"marketing.sms.modeWebservice": "Webservice",
		"marketing.sms.modePattern": "Pattern",
		"marketing.sms.modeP2p": "Peer to peer",
		"marketing.sms.phonesList": "Phone list",
		"marketing.sms.patternCode": "Pattern code",
		"marketing.sms.patternParams": "Pattern parameters",
		"marketing.sms.invalidJson": "Invalid JSON.",
		"marketing.sms.invalidPhone": "Phone number is invalid.",
		"marketing.sms.messageRequired": "Message text is required.",
		"marketing.sms.patternCodeRequired": "Pattern code is required.",
		"marketing.sms.patternBindHelp": "Register and approve the pattern in the SMS panel, then enter the approved code.",
		"marketing.sms.patternBindHint": "After loading the pattern message, map each variable to a site shortcode and save.",
		"marketing.sms.fetchPattern": "Fetch pattern",
		"marketing.sms.mapPatternVars": "Map pattern variables",
		"marketing.sms.pickSiteVar": "Pick site variable",
		"marketing.sms.compositeFullName": "Billing first + last name",
		"marketing.sms.paramPreview": "Saved preview",
		"marketing.sms.detachPattern": "Detach pattern",
		"marketing.sms.patternDetached": "Pattern detached from this status.",
		"marketing.sms.roleService": "Service",
		"marketing.sms.rolePersonal": "Personal",
		"marketing.sms.roleMarketing": "Personal",
		"marketing.sms.noPatternVars": "This pattern has no editable variables.",
		"marketing.sms.sendHint": "Send single, pattern, or peer-to-peer SMS from attached lines.",
		"marketing.sms.newsletterHint": "Campaigns require subscribers and a non-empty message.",
		"marketing.sms.newsletterNoSubscribers": "No subscribers to send to.",
		"marketing.sms.newsletterDisabled": "Newsletter is disabled in shop settings.",
		"marketing.sms.newsletterPatternBound": "Bound pattern: {{code}}",
		"marketing.sms.newsletterBindHint": "Bind a newsletter pattern in shop SMS settings first.",
		"marketing.sms.targetedHint": "Inspect bulk-send stats and recipients.",
		"marketing.sms.outboxIdPlaceholder": "Outbox id",
		"marketing.sms.statKey": "Metric",
		"marketing.sms.statValue": "Value",
		"marketing.sms.shortcutsLocal": "Local management (works offline from CRM)",
		"marketing.sms.shortcutsService": "Actions that need the SMS service",
		"marketing.sms.estimatePrice": "Estimate price",
		"marketing.sms.estimatedCost": "Estimated cost: {{cost}}",
		"comments.title": "Comments",
		"comments.colAuthor": "Author",
		"comments.colExcerpt": "Excerpt",
		"comments.colActions": "Actions",
		"comments.approve": "Approve",
		"comments.spam": "Spam",
		"comments.tabAll": "All",
		"comments.tabPending": "Pending",
		"comments.tabApproved": "Approved",
		"comments.tabSpam": "Spam",
		"comments.tabTrash": "Trash",
		"comments.searchPlaceholder": "Search comments…",
		"comments.foundCount": "{{count}} comments",
		"comments.toggleColumns": "Columns",
		"comments.colPost": "Post",
		"comments.colDate": "Date",
		"comments.colStatus": "Status",
		"comments.colEmail": "Email",
		"comments.unapprove": "Unapprove",
		"comments.trash": "Move to trash",
		"comments.viewPost": "View post",
		"comments.quickEdit": "Quick edit",
		"comments.reply": "Reply",
		"comments.replyTo": "Reply to",
		"comments.replySend": "Send reply",
		"comments.replySent": "Reply sent",
		"comments.inReplyTo": "In reply to",
		"comments.quickEditSave": "Save",
		"comments.quickEditCancel": "Cancel",
		"comments.statusPending": "Pending",
		"comments.statusApproved": "Approved",
		"comments.statusSpam": "Spam",
		"comments.statusTrash": "Trash",
		"comments.deleteConfirmTitle": "Delete comment permanently?",
		"comments.deleteConfirmBody": "This comment will be removed forever.",
		"comments.emptyList": "No comments found.",
		"analytics.title": "Analytics",
		"analytics.description": "Site traffic, pages, referrals, geography, and devices (native engine, cookieless).",
		"analytics.sectionNav": "Analytics sections",
		"analytics.sections.overview": "Overview",
		"analytics.sections.visitors": "Visitor analytics",
		"analytics.sections.pages": "Page analytics",
		"analytics.sections.referrals": "Referrals",
		"analytics.sections.geo": "Geography",
		"analytics.sections.devices": "Devices",
		"analytics.sections.bots": "Bot statistics",
		"analytics.kpi.visitors": "Visitors",
		"analytics.kpi.views": "Page views",
		"analytics.kpi.online": "Online now",
		"analytics.kpi.topVisitors": "Top visitors",
		"analytics.kpi.commerceOrders": "Orders (store)",
		"analytics.kpi.commerceRevenue": "Revenue (store)",
		"analytics.chartViews": "Daily page views",
		"analytics.chartVisitors": "Daily visitors",
		"analytics.col.visitor": "Visitor",
		"analytics.col.views": "Views",
		"analytics.col.country": "Country",
		"analytics.col.city": "City",
		"analytics.col.lastSeen": "Last seen",
		"analytics.col.page": "Page",
		"analytics.col.uri": "Path",
		"analytics.col.category": "Category",
		"analytics.col.source": "Source",
		"analytics.col.visits": "Visits",
		"analytics.ref.direct": "Direct",
		"analytics.ref.search": "Search",
		"analytics.ref.social": "Social",
		"analytics.ref.referral": "Referral",
		"analytics.geoDim": "View",
		"analytics.geoCountry": "Countries",
		"analytics.geoCity": "Cities",
		"analytics.deviceDim": "Dimension",
		"analytics.deviceBrowser": "Browser",
		"analytics.deviceOs": "OS",
		"analytics.deviceType": "Device type",
		"analytics.searchPages": "Search pages…",
		"analytics.empty": "No data for this range.",
		"analytics.unknown": "Unknown",
		"analytics.orders": "Orders",
		"analytics.revenue": "Revenue",
		"analytics.period": "Time range",
		"analytics.period7": "7 days",
		"analytics.period30": "30 days",
		"analytics.period90": "90 days",
		"analytics.chartTitle": "Daily revenue",
		"analytics.emptyChart": "No data for this range.",
		"analytics.settings.tracking": "Tracking",
		"analytics.settings.trackingEnabled": "Enable visit tracking",
		"analytics.settings.anonymizeIp": "Anonymize IP addresses",
		"analytics.settings.recordLoggedIn": "Track logged-in users",
		"analytics.settings.bypassAdblocker": "Random script filename (adblock bypass)",
		"analytics.settings.exclusions": "Exclusions",
		"analytics.settings.excludeRoles": "Excluded roles",
		"analytics.settings.excludeIps": "Excluded IPs (one per line)",
		"analytics.settings.excludeUrls": "Excluded URL paths (one per line)",
		"analytics.settings.optimization": "Optimization",
		"analytics.settings.onlineTimeout": "Online threshold (minutes)",
		"analytics.settings.retentionDays": "Raw event retention (days)",
		"analytics.settings.geoipPath": "GeoLite2 database path",
		"analytics.settings.geoipHint": "Optional. Uses Cloudflare country header or Unknown when empty.",
		"analytics.settings.purgeRebuild": "Rebuild aggregates",
		"analytics.settings.purgeDone": "Rebuilt aggregates for {{count}} days.",
		"license.title": "License",
		"license.banner.inactive": "Your dashboard license is inactive or expired. You can keep working — please renew when you can.",
		"license.banner.unreachable": "The license service is temporarily unreachable. Your dashboard keeps working — we will retry automatically.",
		"license.banner.manage": "Manage license",
		"license.banner.dismiss": "Dismiss",
		"license.description": "License sync and activation apply only to marketplace modules and connected products.",
		"license.domainHint": "Site domain sent to license service: {{domain}}",
		"license.check": "Check status",
		"serviceWorker.registrationFailedTitle": "Offline cache unavailable",
		"serviceWorker.registrationFailedBody": "The dashboard still works. Refresh after deploy or clear cache if pages fail to load.",
		"license.refreshStatus": "Refresh status",
		"license.zeroTouchHint": "License syncs automatically from CRM when your domain is registered as active. Use refresh if you were just provisioned.",
		"license.zeroTouchBlocked": "This domain is not active in CRM yet. Contact support to enable your license — no activation code is required on this site.",
		"license.lockedBody": "Dashboard access is locked because the license has been inactive for more than two days. Contact support to restore your license — no activation code is required on this site.",
		"license.checkOk": "License status is up to date.",
		"license.unreachableHint": "Could not reach the license service. Run diagnostics below to see the exact connection error.",
		"license.diagnostics.button": "Run diagnostics",
		"license.diagnostics.title": "Connection diagnostics",
		"license.diagnostics.runError": "Diagnostics failed",
		"license.diagnostics.probe": "Connection test",
		"license.diagnostics.latency": "Response time",
		"license.diagnostics.httpCode": "HTTP status",
		"license.diagnostics.fastpath": "License fast-path",
		"license.diagnostics.fastpathYes": "Active",
		"license.diagnostics.fastpathNo": "Not active",
		"license.diagnostics.transport": "HTTP transport",
		"license.diagnostics.error": "Error message",
		"license.diagnostics.body": "Response sample",
		"license.diagnostics.sameServer": "Same server detected — trying local IP first:",
		"license.activate": "Activate",
		"license.activated": "License is active. Redirecting…",
		"license.statusTitle": "License status",
		"license.adminOnly": "Use Check status to sync the latest license from the license service. Activate here is limited to site administrators.",
		"license.statusHeading": "Stored status",
		"license.badgeActive": "Active",
		"license.badgeDemo": "Demo",
		"license.badgePending": "Activation required",
		"license.badgeError": "Temporary error",
		"license.footerHint": "If you just activated the license, tap Check status once to refresh this site.",
		"license.expiryLabel": "Expiry: {{date}}",
		"license.heroSubtitle": "Verify your license connection, review domain and expiry, and sync license status when needed.",
		"license.cardEyebrow": "License sync",
		"license.cardTitle": "License status for this site",
		"license.detailsHeading": "License details",
		"license.fieldDomain": "Registered domain",
		"license.fieldExpiry": "Expiry",
		"license.serverMessage": "Message from server",
		"license.helpTitle": "Help",
		"license.helpBody": "After activating your license, tap Check status once. Site administrators can use Activate if required.",
		"license.goDashboard": "Back to dashboard",
		"license.loadingHint": "Loading status from server…",
		"license.bootstrapErrorTitle": "Could not load data",
		"license.bootstrapErrorBody": "We could not fetch menu and permissions from the server. Check your connection or sign in again.",
		"license.retry": "Try again",
		"license.errors.serverUnavailable": "License server is unavailable.",
		"license.errors.serverUnreachable": "License server temporarily unreachable.",
		"license.errors.timeout": "License server did not respond in time. Please try again shortly.",
		"license.errors.emptyReply": "License server closed the connection without a response. Please try again shortly.",
		"license.errors.hostnameUnresolved": "License server hostname could not be resolved.",
		"license.errors.secureConnectionFailed": "Secure connection to the license server failed.",
		"license.errors.requestTimeLimit": "License request exceeded time limit.",
		"license.errors.rejected": "License server rejected the request.",
		"license.errors.httpStatus": "License server returned an invalid HTTP response.",
		"license.errors.noServersConfigured": "No license servers configured.",
		"license.errors.respondTimeout": "License server did not respond within the time limit.",
		"license.errors.invalidResponse": "Invalid response from license server.",
		"license.errors.serverError": "License server error.",
		"license.errors.activationFailed": "Activation request failed.",
		"license.errors.crmFailed": "CRM request failed.",
		"license.errors.inactive": "License is not active.",
		"license.errors.inactiveOrExpired": "Dashboard license is inactive or expired.",
		"license.errors.notConfirmed": "License not confirmed by CRM.",
		"license.errors.notFoundDomain": "This domain is not registered in CRM. Contact support to add it.",
		"license.errors.domainMismatch": "Domain mismatch.",
		"license.errors.noEntitlement": "No license entitlement for this module.",
		"license.errors.couldNotSave": "Could not save license record.",
		"license.errors.couldNotUpdate": "Could not update license record.",
		"wfcp.headerSettings": "WFCP — {{tab}}",
		"wfcp.headerBulk": "WFCP — bulk price list",
		"wfcp.headerQuickAdd": "WFCP — quick add",
		"wfcp.headerPriceChanger": "WFCP — bulk price change",
		"wfcp.settingsTitle": "Pricing core (WFCP)",
		"wfcp.settingsDescription": "Multi-layer store pricing bundled with this dashboard.",
		"wfcp.tab.dashboard": "Dashboard",
		"wfcp.tab.currency": "Currency",
		"wfcp.tab.exchange": "Currency & rates",
		"wfcp.tab.retail": "Retail",
		"wfcp.tab.credit": "Credit",
		"wfcp.tab.installment": "Installments",
		"wfcp.tab.wholesale": "Wholesale",
		"wfcp.tab.marketplaces": "Marketplaces",
		"wfcp.tab.search-engines": "Search engines",
		"wfcp.tab.notifications": "Notifications & badges",
		"wfcp.tab.style": "Product box style",
		"wfcp.tab.advanced": "Advanced",
		"wfcp.stats.total": "Total products",
		"wfcp.stats.withPurchase": "With purchase price",
		"wfcp.stats.locked": "Price locked",
		"wfcp.stats.exchange": "Exchange rate",
		"wfcp.categoryRules": "Wholesale discount by category",
		"wfcp.badgesTitle": "Badges & labels",
		"wfcp.alertsTitle": "Page alerts",
		"wfcp.stylePreview": "Live pricing box preview",
		"wfcp.placement": "Pricing form position",
		"wfcp.placementSummary": "Under the product title",
		"wfcp.placementBeforeCart": "Before add to cart form",
		"wfcp.placementAfterCart": "After add to cart form",
		"wfcp.placementBeforeTabs": "Before product tabs",
		"wfcp.placementAfterTabs": "After product tabs",
		"wfcp.placementNone": "No automatic hook",
		"wfcp.previewAddToCart": "Add to cart",
		"wfcp.field.show_cash_badge": "Show cash badge",
		"wfcp.field.show_install_badge": "Show installment badge",
		"wfcp.field.show_credit_badge": "Show credit badge",
		"wfcp.field.show_guaranty_label": "Show warranty label",
		"wfcp.field.alert_product_text": "Product page alert",
		"wfcp.field.alert_cart_text": "Cart alert",
		"wfcp.field.alert_checkout_text": "Checkout alert",
		"wfcp.field.border_radius": "Border radius",
		"wfcp.field.alert_bg": "Alert background",
		"wfcp.field.alert_text_color": "Alert text",
		"wfcp.field.alert_border_color": "Alert border",
		"wfcp.field.alert_accent": "Alert accent",
		"wfcp.field.badge_cash_bg": "Cash badge background",
		"wfcp.field.badge_cash_text": "Cash badge text",
		"wfcp.field.badge_credit_bg": "Credit badge background",
		"wfcp.field.badge_credit_text": "Credit badge text",
		"wfcp.field.badge_installment_bg": "Installment badge background",
		"wfcp.field.badge_installment_text": "Installment badge text",
		"wfcp.field.timeline_dot": "Timeline dot color",
		"wfcp.field.timeline_line": "Timeline line color",
		"wfcp.field.timeline_today_text": "Timeline today text",
		"wfcp.field.timeline_future_text": "Timeline later dates text",
		"products.editor.referenceUrl": "Reference site URL",
		"products.editor.referenceFetch": "Fetch now",
		"products.editor.referenceLastSync": "Last sync",
		"products.editor.marketplaceGroup": "Marketplaces",
		"products.editor.searchEngineGroup": "Search engines",
		"products.editor.lockPriceHint": "When locked, automatic retail price sync is skipped. The storefront purchase-type box still shows.",
		"wfcp.generalEnabled": "Enable WFCP",
		"wfcp.defaultPurchaseType": "Default site purchase method",
		"wfcp.defaultPurchaseTypeHint": "Used for new cart items when the cart is empty and the shopper has not chosen a method.",
		"wfcp.purchaseTypeCash": "Cash",
		"wfcp.purchaseTypeCredit": "Credit",
		"wfcp.purchaseTypeInstallment": "Installment",
		"wfcp.paymentGateways": "Payment gateways",
		"wfcp.noGateways": "No payment gateways found",
		"wfcp.currencyCode": "Currency code",
		"wfcp.exchangeRate": "Exchange rate",
		"wfcp.exchangeRateEnabled": "Use manual / API exchange rate",
		"wfcp.apiKey": "API key",
		"wfcp.apiSymbol": "API symbol",
		"wfcp.apiEnabled": "Enable exchange API",
		"wfcp.testApi": "Test API",
		"wfcp.fetchRate": "Fetch rate now",
		"wfcp.fetchOk": "Rate updated",
		"wfcp.profitPercent": "Retail profit %",
		"wfcp.roundEnabled": "Round prices",
		"wfcp.roundTo": "Round to",
		"wfcp.creditEnabled": "Enable credit pricing",
		"wfcp.increasePercent": "Credit markup %",
		"wfcp.installmentEnabled": "Enable installments",
		"wfcp.pdpTheme": "Installment layout on product page",
		"wfcp.pdpThemeClassic": "Classic",
		"wfcp.pdpThemeTimeline": "Timeline (due dates)",
		"wfcp.pdpThemeHint": "Classic keeps the current box. Timeline shows monthly amount, due dates, and a selectable gateway.",
		"wfcp.gatewayLogosOnly": "Gateway logo only",
		"wfcp.gatewayLogosOnlyHint": "Hide the gateway name and show it only on hover.",
		"wfcp.installmentPlansHint": "Edit months and interest below. Monthly payment = retail × (1 + interest%) / months.",
		"wfcp.wholesaleEnabled": "Enable wholesale",
		"wfcp.wholesaleThresholdEnabled": "Wholesale by quantity/weight threshold",
		"wfcp.wholesaleThresholdHint": "For regular customers: when a line hits the min qty or weight it becomes wholesale and shows a badge. Below the min it stays retail; mins are not forced.",
		"wfcp.wholesalePartnerEnabled": "Wholesale with partner role",
		"wfcp.wholesalePartnerHint": "Partners see retail, their wholesale price, and the min purchase. The cart stays wholesale and mins are required.",
		"wfcp.wholesalePartnerOnly": "Wholesale for partners only",
		"wfcp.wholesaleHideRetail": "Hide retail prices from partners",
		"wfcp.wholesaleMinQty": "Default minimum quantity",
		"wfcp.wholesaleMinWeight": "Default minimum weight",
		"wfcp.wholesaleQtyStep": "Quantity / weight step",
		"wfcp.wholesaleMinDistinct": "Minimum distinct SKUs in cart",
		"wfcp.wholesaleMinsHint": "0 means that rule is not enforced. Partners may buy more than the minimum.",
		"wfcp.wholesaleModeNormal": "Standard — quantity / weight threshold",
		"wfcp.wholesaleModeAdvanced": "Advanced — partner role",
		"wfcp.wholesaleDiscountCascadeHint": "Wholesale discount: product override, otherwise the first category with a percent above zero, otherwise the global percent.",
		"wfcp.wholesaleProductRuleHint": "Set per-product percent and minimums in the product editor or the price list.",
		"wfcp.wholesaleAssignPartnerHint": "To make someone a partner, change their role to Wholesale partner.",
		"wfcp.wholesaleStrategyHint": "Discount strategy applies to partner wholesale prices and to lines that reach the threshold.",
		"wfcp.shippingMethods": "Wholesale shipping methods",
		"wfcp.shippingMethodsHint": "Empty = all methods. Applied when at least one cart line is wholesale.",
		"wfcp.noShippingMethods": "No shipping methods found",
		"wfcp.colMinQty": "Min qty",
		"wfcp.colMinWeight": "Min weight",
		"wfcp.colSellBy": "Sell by",
		"wfcp.colDiscount": "Wholesale discount %",
		"wfcp.sellByUnit": "Unit",
		"wfcp.sellByWeight": "Weight",
		"wfcp.wholesaleCategoryVariety": "Minimum variety per category",
		"wfcp.wholesaleStrategy": "Strategy",
		"wfcp.discountPercent": "Global discount %",
		"wfcp.field.installment_text": "Installment label",
		"wfcp.field.credit_text": "Credit label",
		"wfcp.field.need_review": "Need review text",
		"wfcp.field.box_background": "Box background",
		"wfcp.field.box_border_color": "Box border",
		"wfcp.field.button_background": "Button background",
		"wfcp.field.button_text_color": "Button text",
		"wfcp.field.price_color": "Price color",
		"wfcp.dryRun": "Dry run (no writes)",
		"wfcp.recalculateAll": "Recalculate all prices",
		"wfcp.recalcDone": "Updated {{ok}} products ({{fail}} failed)",
		"wfcp.recalcQueued": "Queued price sync for {{total}} products",
		"wfcp.recalcRunning": "{{processed}} of {{total}} processed",
		"wfcp.recalcFinished": "Done: {{ok}} ok, {{fail}} failed",
		"wfcp.recalcIdle": "Idle",
		"wfcp.applyAllPrices": "Apply prices to all products",
		"wfcp.applyAllPricesHint": "After changing exchange rate or rounding, recalculates WooCommerce prices from purchase prices.",
		"wfcp.deleteTransients": "Clear price caches",
		"wfcp.transientsCleared": "Caches cleared",
		"wfcp.exportSettings": "Export settings JSON",
		"wfcp.exportCopied": "JSON copied to clipboard",
		"wfcp.importJson": "Paste settings JSON",
		"wfcp.importSettings": "Import settings",
		"wfcp.bulkTitle": "Bulk price list",
		"wfcp.bulkDescription": "Edit purchase prices, stock, and brands (WFCP price manager).",
		"wfcp.search": "Search",
		"wfcp.filterCategory": "Category",
		"wfcp.filterBrand": "Brand",
		"wfcp.sort": "Sort",
		"wfcp.stock": "Stock filter",
		"wfcp.all": "All",
		"wfcp.applyFilters": "Apply filters",
		"wfcp.colName": "Product",
		"wfcp.colSku": "SKU",
		"wfcp.colPurchase": "Purchase",
		"wfcp.colRetail": "Retail (calc)",
		"wfcp.colWcRegular": "Store base price",
		"wfcp.colStock": "Stock",
		"wfcp.colBrand": "Brand",
		"wfcp.prev": "Previous",
		"wfcp.next": "Next",
		"wfcp.pageOf": "Page {{page}} / {{total}}",
		"wfcp.brandNone": "No brand",
		"wfcp.quickTitle": "Quick add product",
		"wfcp.quickDescription": "Create a simple product with purchase and retail price.",
		"wfcp.productName": "Product name",
		"wfcp.purchasePrice": "Purchase price",
		"wfcp.productImage": "Product image",
		"wfcp.noImage": "No image selected",
		"wfcp.selectImage": "Select from media",
		"wfcp.changeImage": "Change image",
		"wfcp.removeImage": "Remove image",
		"wfcp.uploadImage": "Upload image",
		"wfcp.uploadImageOk": "Image uploaded",
		"wfcp.createProduct": "Create product",
		"wfcp.quickCreated": "Product #{{id}} created",
		"wfcp.bpcTitle": "Bulk price change",
		"wfcp.bpcDescription": "Queue a background job to bump prices (same engine as WFCP admin).",
		"wfcp.bpcType": "Bump type",
		"wfcp.bpcValue": "Bump value",
		"wfcp.bpcApplySale": "Apply to sale prices",
		"wfcp.bpcCategories": "Category slugs (comma-separated)",
		"wfcp.bpcCategoriesHint": "Leave empty for all products.",
		"wfcp.bpcRangeRules": "Range rules (optional)",
		"wfcp.bpcRulesCombine": "Combine range rules",
		"wfcp.bpcRounding": "Enable rounding",
		"wfcp.bpcRoundTh": "Rounding threshold",
		"wfcp.bpcRoundVal": "Round to step",
		"wfcp.bpcStart": "Start job",
		"wfcp.bpcQueued": "Job queued",
		"wfcp.bpcStateTitle": "Job state (poll)",
		"bots.baleTitle": "Bale bot (store)",
		"bots.telegramTitle": "Telegram bot (store)",
		"bots.dashboardTitle": "{{provider}} dashboard",
		"bots.quickLinks": "Quick links",
		"bots.description": "Connect your online store to Bale or Telegram. Do not enable another bot integration with the same token at the same time.",
		"bots.webhookUrls": "Webhook and health URLs",
		"bots.connectWebhook": "Register webhook",
		"bots.disconnectWebhook": "Remove webhook",
		"bots.botToken": "Bot token",
		"bots.channelId": "Channel ID",
		"bots.providerToken": "Payment provider token",
		"bots.providerTokenBale": "Bale wallet token (provider_token)",
		"bots.providerTokenBaleHint": "Create via @botfather for your bot. Test token: WALLET-TEST-1111111111111111",
		"bots.welcomeText": "Welcome message",
		"bots.webhookSet": "Webhook registered",
		"bots.webhookCurrentUrl": "Current webhook URL",
		"bots.webhookNotSet": "Not set",
		"bots.webhookDeleted": "Webhook removed",
		"bots.tabsNav": "Bot sections",
		"bots.tabs.dashboard": "Dashboard",
		"bots.tabs.settings": "Settings",
		"bots.tabs.users": "Users",
		"bots.tabs.broadcast": "Broadcast",
		"bots.tabs.campaigns": "Campaigns",
		"bots.tabs.logs": "Logs",
		"bots.stats.advanced": "Advanced stats",
		"bots.stats.abandonRecovery": "Cart recovery rate",
		"bots.stats.usersLinked": "Users linked to bot",
		"bots.stats.ordersAll": "Orders from bot (all time)",
		"bots.stats.orders7d": "Bot orders (last 7 days)",
		"bots.stats.sessions24h": "Active sessions (24h)",
		"bots.stats.salesCurrentCount": "Bot orders (last 30 days)",
		"bots.stats.salesCurrentTotal": "Revenue (last 30 days)",
		"bots.stats.salesPrevCount": "Bot orders (previous 30 days)",
		"bots.stats.salesPrevTotal": "Revenue (previous 30 days)",
		"bots.stats.recentOrders": "Recent bot orders",
		"bots.stats.recentUsers": "Recent linked users",
		"bots.stats.colOrder": "Order",
		"bots.stats.colTotal": "Total",
		"bots.stats.colStatus": "Status",
		"bots.stats.colDate": "Date",
		"bots.stats.colUser": "User",
		"bots.stats.colPhone": "Phone",
		"bots.stats.colChatId": "Chat ID",
		"bots.stats.empty": "Nothing to show.",
		"bots.users.search": "Search users",
		"bots.users.searchBtn": "Search",
		"bots.users.importCsv": "Import contacts (CSV)",
		"bots.users.importHint": "First column must be phone numbers. Only existing store users are matched.",
		"bots.users.importDone": "Import finished. Total: {{total}} | matched: {{matched}} | invalid: {{invalid}} | duplicate: {{duplicate}} | not found: {{not_found}}",
		"bots.users.total": "Linked users (all): {{count}}",
		"bots.users.colName": "Name",
		"bots.users.colEmail": "Email",
		"bots.users.colPhone": "Phone",
		"bots.users.colChat": "Chat ID",
		"bots.broadcast.status": "Job status",
		"bots.broadcast.idle": "No broadcast job is running.",
		"bots.broadcast.cancelJob": "Cancel broadcast",
		"bots.broadcast.type": "Message type",
		"bots.broadcast.types.text": "Text",
		"bots.broadcast.types.photo": "Photo",
		"bots.broadcast.types.video": "Video",
		"bots.broadcast.types.voice": "Voice",
		"bots.broadcast.types.document": "Document",
		"bots.broadcast.mediaPlanHint": "Media types require the advanced plan.",
		"bots.broadcast.text": "Text / caption",
		"bots.broadcast.media": "Media URL or file_id",
		"bots.broadcast.segment": "Audience segment",
		"bots.broadcast.segments.all": "All linked users",
		"bots.broadcast.segments.buyers": "Buyers",
		"bots.broadcast.segments.neverBought": "Never bought",
		"bots.broadcast.segments.recent": "Recent buyers",
		"bots.broadcast.segments.vip": "VIP",
		"bots.broadcast.segments.inactive30": "Inactive 30 days",
		"bots.broadcast.start": "Start broadcast",
		"bots.broadcast.started": "Broadcast started",
		"bots.broadcast.cancelled": "Broadcast cancelled",
		"bots.broadcast.failed": "Could not start broadcast",
		"bots.campaigns.disabled": "Campaigns are disabled on the basic plan.",
		"bots.errors.noFile": "CSV file was not uploaded.",
		"bots.errors.readFail": "Could not read the uploaded file.",
		"bots.errors.invalidName": "Campaign name is required.",
		"bots.campaigns.name": "Campaign name",
		"bots.campaigns.schedule": "Run time",
		"bots.campaigns.audience": "Audience",
		"bots.campaigns.audienceAll": "All users linked to the bot",
		"bots.campaigns.audienceImported": "Only CSV-imported contacts",
		"bots.campaigns.submit": "Create campaign",
		"bots.campaigns.created": "Campaign created",
		"bots.campaigns.list": "Campaigns",
		"bots.campaigns.colName": "Name",
		"bots.campaigns.colStatus": "Status",
		"bots.campaigns.colWhen": "Scheduled",
		"bots.campaigns.colSent": "Sent",
		"bots.campaigns.colFailed": "Failed",
		"bots.campaigns.empty": "No campaigns yet.",
		"bots.logs.from": "From",
		"bots.logs.to": "To",
		"bots.logs.channel": "Channel filter",
		"bots.logs.apply": "Apply filters",
		"bots.logs.colTime": "Time",
		"bots.logs.colLevel": "Level",
		"bots.logs.colChannel": "Channel",
		"bots.logs.colMessage": "Message",
		"bots.settings.planTokens": "Plan & connection",
		"bots.settings.planTier": "Plan tier",
		"bots.settings.sandboxMode": "Sandbox mode (use sandbox bot token)",
		"bots.settings.sandboxToken": "Sandbox bot token",
		"bots.settings.webhookRequireSecret": "Require webhook secret header",
		"bots.settings.webhookSecret": "Webhook secret",
		"bots.settings.proxy": "Proxy",
		"bots.settings.proxyHint": "Only outbound bot traffic to the Telegram API uses this proxy. Incoming webhooks do not need a proxy.",
		"bots.settings.proxyType": "Proxy type",
		"bots.settings.proxyTypeNone": "No proxy",
		"bots.settings.proxyTypeHttp": "HTTP",
		"bots.settings.proxyTypeSocks5": "SOCKS5",
		"bots.settings.proxyHost": "Host",
		"bots.settings.proxyPort": "Port",
		"bots.settings.proxyUsername": "Username (optional)",
		"bots.settings.proxyPassword": "Password (optional)",
		"bots.settings.messages": "Bot messages",
		"bots.settings.errorText": "Generic error text",
		"bots.settings.contactButton": "Contact button label",
		"bots.settings.storeButton": "Store button label",
		"bots.settings.authSuccess": "Auth success text",
		"bots.settings.supportContact": "Support / contact block",
		"bots.settings.linksCommerce": "Links & catalog",
		"bots.settings.manualPaymentTpl": "Manual payment link template",
		"bots.settings.postTrackingTpl": "Post tracking URL template",
		"bots.settings.channelContactId": "Channel contact ID",
		"bots.settings.channelBaleLink": "Channel / bot link",
		"bots.settings.productsPerPage": "Products per page (catalog)",
		"bots.settings.currencyUnit": "Store currency display",
		"bots.settings.currencyDefault": "Default (store)",
		"bots.settings.invoiceRialMultiplier": "Invoice amount multiplier (Rial)",
		"bots.settings.invoiceRialMultiplierHint": "Applied when converting store prices to the messenger invoice (e.g. 1 for Rial prices, 10 if store uses Tomans ×10).",
		"bots.settings.hideOutOfStock": "Hide out-of-stock products",
		"bots.settings.orderTemplates": "Order status message templates",
		"bots.settings.notifyStatus": "Notify customer on status change",
		"bots.settings.abandonCart": "Abandoned cart",
		"bots.settings.abandonEnabled": "Enable abandoned-cart reminders",
		"bots.settings.abandonDelay": "Delay before reminder (hours)",
		"bots.settings.abandonMessage": "Reminder message",
		"bots.settings.abandonStage2": "Stage 2",
		"bots.settings.abandonDelay2": "Stage 2 delay (hours)",
		"bots.settings.abandonMessage2": "Stage 2 message",
		"bots.settings.abandonCoupon2": "Stage 2 coupon amount",
		"bots.settings.abandonStage3": "Stage 3",
		"bots.settings.abandonDelay3": "Stage 3 delay (hours)",
		"bots.settings.abandonMessage3": "Stage 3 message",
		"bots.settings.abandonCoupon3": "Stage 3 coupon amount",
		"bots.settings.forceJoin": "Force channel join",
		"bots.settings.forceJoinEnabled": "Require channel membership",
		"bots.settings.forceJoinChannelId": "Required channel ID",
		"bots.settings.forceJoinChannelLink": "Channel join link",
		"bots.settings.forceJoinMessage": "Prompt message",
		"bots.settings.forceJoinCheckBtn": "Check membership button label",
		"bots.settings.channelRules": "Channel posting rules",
		"bots.settings.ruleCategories": "Category IDs (comma-separated)",
		"bots.settings.ruleTags": "Tag IDs (comma-separated)",
		"bots.settings.ruleSaleOnly": "Only sale products",
		"bots.settings.ruleMinPrice": "Minimum price filter",
		"bots.settings.ruleHourStart": "Hour start (0–23)",
		"bots.settings.ruleHourEnd": "Hour end (0–23)",
		"bots.settings.adminExtras": "Admin & support IDs",
		"bots.settings.orderQuestionBtn": "Show “ask about order” button",
		"bots.settings.orderQuestionText": "Button label",
		"bots.settings.supportNotifyChat": "Support notify chat ID",
		"bots.settings.botAdminChats": "Admin chat IDs (one per line)",
		"marketplace.title": "Module marketplace",
		"modules.loadFailed": "Module UI could not be loaded. Install or rebuild the module client bundle.",
		"modules.notInstalledRedirect": "This feature requires a module from the marketplace.",
		"modules.retry": "Retry",
		"marketplace.subtitle": "Browse and install extensions for your dashboard.",
		"marketplace.myModulesTitle": "My modules",
		"marketplace.myModulesSubtitle": "Enable, disable, or open settings for installed modules.",
		"marketplace.allCategories": "All",
		"marketplace.free": "Free",
		"marketplace.priceValue": "{{price}} {{currency}}",
		"marketplace.details": "Details",
		"marketplace.install": "Install",
		"marketplace.installing": "Installing… this may take a few minutes.",
		"marketplace.installFailed": "Install failed: {{message}}",
		"marketplace.installFailedGeneric": "Install failed.",
		"marketplace.installTimedOutGeneric": "Install timed out.",
		"marketplace.installJobStartFailed": "Install could not be started.",
		"marketplace.installTimedOut": "Install timed out during: {{step}}",
		"marketplace.installWorkerStuck": "Background install did not start. Check WP-Cron, PHP exec/proc_open, or server error logs, then try again.",
		"marketplace.installStep.queued": "Preparing install…",
		"marketplace.installStep.download_token": "Verifying license and download access…",
		"marketplace.installStep.download_zip": "Downloading module package…",
		"marketplace.installStep.unzip": "Extracting files…",
		"marketplace.installStep.validate": "Validating package…",
		"marketplace.installStep.done": "Finishing install…",
		"marketplace.installStep.prepare_dir": "Preparing install directory…",
		"marketplace.installStep.module_lookup": "Looking up module…",
		"marketplace.update": "Update",
		"marketplace.versionLine": "Version: {{line}}",
		"marketplace.fullDetails": "Full details",
		"marketplace.latestVersion": "Latest version: {{version}}",
		"marketplace.installedVersion": "Installed version: {{version}}",
		"marketplace.updateAvailable": "Installed: {{installed}} · Update: {{latest}}",
		"marketplace.lastUpdated": "Last updated: {{date}}",
		"marketplace.readmeHeading": "Description",
		"marketplace.detailLoadError": "Could not load module details.",
		"marketplace.buy": "Buy",
		"marketplace.installed": "Installed",
		"marketplace.submoduleOf": "Submodule: {{name}}",
		"marketplace.packageNotAvailable": "Install package not available",
		"marketplace.enable": "Enable",
		"marketplace.disable": "Disable",
		"marketplace.settings": "Settings",
		"marketplace.loading": "Loading…",
		"marketplace.error": "Something went wrong.",
		"marketplace.errorHint": "If this persists, check your license on webina.dev, CRM connectivity from this server, and try a hard refresh.",
		"marketplace.debugSummary": "Catalog diagnostics",
		"marketplace.catalogStale": "Showing a cached catalog; the module server is unreachable.",
		"marketplace.catalogUnavailable": "Module catalog is unavailable. License service connection failed.",
		"marketplace.noInstalled": "No modules installed yet.",
		"marketplace.paymentCallback": "Payment",
		"marketplace.paymentVerifying": "Verifying payment…",
		"marketplace.paymentSuccess": "Payment successful. Redirecting…",
		"marketplace.paymentFailed": "Payment could not be verified.",
		"marketplace.paymentMissing": "Missing payment parameters.",
		"marketplace.moduleSettingsTitle": "Module settings",
		"marketplace.moduleSettingsDesc": "Configuration for an installed marketplace module.",
		"marketplace.moduleSettingsHint": "Settings for {{module}} are provided by the module package.",
		"marketplace.openModuleSettings": "Open module settings page",
		"home.storeModule": "Store module",
		"nav.module.wfcp-module-quick": "Quick add products",
		"nav.module.wfcp-module-bulk": "Price list (bulk)",
		"nav.module.wfcp-module-price": "Bulk price change",
		"nav.module.analytics-module": "Analytics",
		"nav.module.analytics-module-overview": "Overview",
		"nav.module.analytics-module-visitors": "Visitor analytics",
		"nav.module.analytics-module-pages": "Page analytics",
		"nav.module.analytics-module-referrals": "Referrals",
		"nav.module.analytics-module-geo": "Geography",
		"nav.module.analytics-module-devices": "Devices",
		"nav.module.analytics-module-bots": "Bot statistics",
		"nav.module.sms-panel-module": "SMS panel",
		"nav.module.bale-bot-module": "Bale bot (WooBale)",
		"nav.module.telegram-bot-module": "Telegram bot",
		"nav.module.bots-bale": "Bale bot (WooBale)",
		"nav.module.bots-telegram": "Telegram bot",
		"marketplace.module.analytics-module-settings": "Analytics",
		"marketplace.module.bale-bot-module-dashboard": "Bale bot",
		"marketplace.module.telegram-bot-module-dashboard": "Telegram bot",
		"marketplace.module.sms-panel-module-dashboard": "SMS panel",
		"marketplace.module.wfcp-module-dashboard": "Pricing (WFCP)",
		"marketplace.module.basalam-module-connection": "Basalam connection",
		"marketplace.module.basalam-module-payments": "Basalam gateway",
		"marketplace.module.basalam-module-wallet": "Basalam wallet",
		"marketplace.module.basalam-module-subscriptions": "Basalam subscriptions",
		"marketplace.module.basalam-module-webhooks": "Basalam webhooks",
		"marketplace.module.basalam-module-operations": "Basalam operations",
		"marketplace.module.digikala-sellers-module-connection": "Digikala",
		"marketplace.module.digikala-sellers-module-sync": "Digikala sync",
		"marketplace.module.digikala-sellers-module-jobs": "Digikala jobs",
		"marketplace.module.digipay-upg-module-connection": "DigiPay",
		"marketplace.module.digipay-upg-module-transactions": "DigiPay transactions",
		"marketplace.module.snapppay-gateway-module-gateway": "SnappPay",
		"marketplace.module.torobpay-gateway-module-gateway": "TorobPay",
		"marketplace.module.torob-products-extractor-module-connection": "Torob Extractor",
		"marketplace.module.zarinpal-gateway-module-connection": "Zarinpal",
		"marketplace.module.zarinpal-gateway-module-payments": "Zarinpal payments",
		"marketplace.module.zarinpal-gateway-module-operations": "Zarinpal operations",
		"marketplace.module.zarinpal-gateway-module-coverage": "Zarinpal coverage",
		"marketplace.module.basalam-module": "Basalam",
		"marketplace.module.digikala-sellers-module": "Digikala Sellers",
		"marketplace.module.digipay-upg-module": "DigiPay UPG",
		"marketplace.module.snapppay-gateway-module": "SnappPay",
		"marketplace.module.torobpay-gateway-module": "TorobPay",
		"marketplace.module.torob-products-extractor-module": "Torob Extractor",
		"marketplace.module.zarinpal-gateway-module": "Zarinpal",
		"marketplace.module.wfcp-module": "Pricing (WFCP)",
		"marketplace.module.analytics-module": "Analytics",
		"marketplace.module.bale-bot-module": "Bale bot",
		"marketplace.module.telegram-bot-module": "Telegram bot",
		"marketplace.module.sms-panel-module": "SMS panel",
		"marketplace.module.emalls-module": "Emalls",
		"marketplace.module.emalls-module-connection": "Emalls",
		"marketplace.module.zarehbin-module": "Zarehbin",
		"marketplace.module.zarehbin-module-connection": "Zarehbin",
		"marketplace.module.tapsishop-module": "TapsiShop",
		"marketplace.module.tapsishop-module-connection": "TapsiShop",
		"marketplace.module.snappshop-module": "SnappShop",
		"marketplace.module.snappshop-module-connection": "SnappShop",
		"marketplace.module.technolife-module": "Technolife",
		"marketplace.module.technolife-module-connection": "Technolife",
		"marketplace.module.torob-connector-module": "Torob Connector",
		"marketplace.module.torob-connector-module-connection": "Torob Connector",
		"marketplace.module.ai-content-module": "AI Content",
		"marketplace.module.ai-content-module-settings": "AI Content settings",
		"marketplace.module.wnc-core-module": "Marketplace",
		"wfcp.tab.digikala": "Digikala",
		"wfcp.tab.basalam": "Basalam",
		"wfcp.tab.technolife": "Technolife",
		"wfcp.tab.snappshop": "SnappShop",
		"wfcp.tab.tapsishop": "TapsiShop",
		"wfcp.tab.zarehbin": "Zarehbin",
		"wfcp.tab.emalls": "Emalls",
		"wfcp.tab.torob": "Torob",
		"wfcp.scope.product": "Per product",
		"wfcp.formula.overview": "Purchase → FX (if base) → retail / credit / installment / wholesale / marketplace channels.",
		"wfcp.formula.retail": "retail = converted_purchase × (1 + profit%)",
		"wfcp.formula.credit": "credit = retail × (1 + increase%) — markup on cash/retail, not purchase.",
		"wfcp.formula.installment": "monthly = retail × (1 + interest%) / months (returned as monthly payment).",
		"wfcp.formula.wholesale": "wholesale = converted_purchase × (1 − discount%) — discount on purchase after FX.",
		"wfcp.formula.marketplace": "channel = retail × (1 + profit%) × (1 + extra%) — then optional round; lock uses manual price.",
		"wfcp.currencyWcOwned": "Storefront currency is owned by WooCommerce (WooCommerce → Settings → General).",
		"wfcp.installmentPlans": "Installment plans",
		"wfcp.planMonths": "Months",
		"wfcp.planInterest": "Interest %",
		"wfcp.addPlan": "Add plan",
		"wfcp.marketplaceEnabled": "Enable channel pricing",
		"wfcp.marketplaceProfit": "Channel profit %",
		"wfcp.marketplaceExtra": "Extra fee / commission %",
		"wfcp.priceUnit": "API price unit",
		"wfcp.unitToman": "Toman",
		"wfcp.unitRial": "Rial",
		"wfcp.purchaseCurrency": "Purchase price currency",
		"wfcp.purchaseCurrencyBase": "Base (apply FX)",
		"wfcp.purchaseCurrencyDisplay": "Display (skip FX)",
		"wfcp.field.wholesale_description": "Wholesale description",
		"products.editor.marketplacePrices": "Marketplace channel prices",
		"products.editor.platformLock": "Lock {{platform}} price",
		"products.editor.platformPrice": "{{platform}} manual price",
		"products.editor.wholesaleRule": "Product wholesale discount %",
		"products.editor.wholesaleCustom": "Custom wholesale rules for this product",
		"products.editor.wholesaleProductEnabled": "Available for wholesale",
		"products.editor.wholesaleSellBy": "Sell by",
		"products.editor.wholesaleSellByUnit": "Quantity",
		"products.editor.wholesaleSellByWeight": "Weight",
		"products.editor.wholesaleMinQty": "Minimum quantity",
		"products.editor.wholesaleMinWeight": "Minimum weight",
		"products.editor.wholesaleQtyStep": "Quantity / weight step",
		"products.editor.wholesaleWeightRequired": "Set the product weight in shipping before selling by weight.",
		"products.editor.wholesaleUsesGlobal": "Global wholesale defaults apply.",
		"wnc.testOk": "Connection OK",
		"wnc.pullQueued": "Order pull queued",
		"wnc.syncQueued": "Sync queued",
		"wnc.platformSubtitle": "Connector settings for {{platform}}",
		"wnc.live": "Live API",
		"wnc.openPricingTab": "Open WFCP pricing tab",
		"wnc.enabled": "Enable platform",
		"wnc.feedDisabledHint": "Platform is disabled — crawler requests return HTTP 403 until enabled.",
		"wnc.cred.per_page": "Per page",
		"wnc.cred.version": "Version",
		"wnc.cred.order_status_enabled": "Order status gateway",
		"wnc.cred.orders_list_api_enabled": "Torob orders list API",
		"wnc.cred.product_page_webhook_enabled": "Product change webhooks",
		"wnc.torobPreview": "Feed product preview",
		"wnc.torobQueue": "Product webhook queue",
		"wnc.torobQueuePending": "Pending",
		"wnc.torobQueueLast": "Last run",
		"wnc.torobQueueNext": "Next run",
		"wnc.autoSync": "Auto sync price/stock",
		"wnc.noCredentialsYet": "Add credentials below (saved into WebinaConnector settings).",
		"wnc.cred.base_url": "Base URL",
		"wnc.cred.token": "Token / API key",
		"wnc.cred.api_key": "API key",
		"wnc.cred.username": "Username",
		"wnc.cred.password": "Password",
		"wnc.cred.client_id": "Client ID",
		"wnc.cred.client_secret": "Client secret",
		"wnc.cred.seller_id": "Seller ID",
		"wnc.cred.vendor_code": "Vendor code",
		"wnc.cred.refresh_token": "Refresh token",
		"wnc.testConnection": "Test connection",
		"wnc.syncNow": "Sync now",
		"wnc.pullOrders": "Pull orders",
		"wnc.feedUrl": "Feed URL",
		"wnc.maps": "Product maps",
		"wnc.jobs": "Recent jobs",
		"wnc.modules.emalls.title": "Emalls",
		"wnc.modules.emalls.subtitle": "Emalls marketplace connector settings",
		"wnc.modules.zarehbin.title": "Zarehbin",
		"wnc.modules.zarehbin.subtitle": "Zarehbin marketplace connector settings",
		"wnc.modules.tapsishop.title": "TapsiShop",
		"wnc.modules.tapsishop.subtitle": "TapsiShop marketplace connector settings",
		"wnc.modules.snappshop.title": "SnappShop",
		"wnc.modules.snappshop.subtitle": "SnappShop marketplace connector settings",
		"wnc.modules.technolife.title": "Technolife",
		"wnc.modules.technolife.subtitle": "Technolife marketplace connector settings",
		"wnc.modules.torob.title": "Torob Connector",
		"wnc.modules.torob.subtitle": "Torob Connector marketplace connector settings",
		"wnc.modules.digikala.title": "Digikala Connector",
		"wnc.modules.digikala.subtitle": "Push Digikala prices via WebinaConnector + WFCP formulas",
		"wnc.modules.basalam.title": "Basalam Connector",
		"wnc.modules.basalam.subtitle": "Push Basalam prices via WebinaConnector + WFCP formulas",
		"common.yes": "Yes",
		"common.no": "No",
		"wfcp.priceMode": "Price mode",
		"wfcp.priceModeRetail": "Same as cash (retail)",
		"wfcp.priceModeMarkup": "Markup on cash (profit + fee)",
		"wfcp.priceModeHint": "When set to cash, Torob/Zarehbin/Emalls use the retail price without platform profit.",
		"wfcp.formula.compare": "Comparison engines: use cash price as-is, or apply profit/fee on cash.",
		"wnc.productMapTitle": "Marketplace product links",
		"wnc.productMapHint": "Connect Digikala, Basalam, Technolife, TapsiShop and SnappShop IDs/URLs for price and stock sync.",
		"wnc.productMapSaveFirst": "Save the product first, then add remote IDs.",
		"wnc.remoteProductId": "Remote product ID",
		"wnc.remoteVariantId": "Remote variant ID",
		"wnc.remoteUrl": "Remote product URL",
		"wnc.lastSync": "Last sync",
		"wnc.createRemote": "Create on platform",
		"wnc.createRemoteOk": "Created on remote platform",
		"wnc.createRemoteUnsupported": "This platform does not support catalog create yet — map IDs manually.",
		"orders.marketplaceTitle": "Marketplace",
		"orders.marketplacePlatform": "Platform",
		"orders.marketplaceRemoteId": "Remote order ID",
		"orders.marketplaceRemoteStatus": "Remote status",
		"wnc.torobOrderStatusUrl": "Torob order-status API (GET by phone)",
		"wnc.torobOrdersListUrl": "Torob orders list API (GET by torob_clid)",
		"bots.settings.loyalty": "Loyalty & checkout",
		"bots.settings.loyaltyEnabled": "Enable loyalty points",
		"bots.settings.pointsPerOrder": "Points per completed order",
		"bots.settings.minOrderAmount": "Minimum order amount (toman)",
		"bots.settings.referralEnabled": "Enable referral rewards",
		"bots.settings.referralPoints": "Referral reward points",
		"bots.settings.webappUrl": "WebApp / mobile checkout base URL",
		"bots.settings.checkoutNationalId": "Collect national ID at checkout",
		"bots.settings.checkoutCompany": "Collect company name at checkout",
		"bots.settings.firstOrderBonus": "First-order bonus points",
		"bots.settings.redeemPointsCost": "Points required to redeem",
		"bots.settings.redeemCouponAmount": "Redeem coupon amount",
		"bots.settings.welcomeCouponAmount": "Welcome coupon amount",
		"bots.settings.inactiveNudgeDays": "Inactive nudge after (days)",
		"bots.settings.saleAutoNotify": "Auto-notify on sale start",
		"bots.settings.menuToggles": "Menu button visibility",
		"bots.settings.menu_show_store": "Store",
		"bots.settings.menu_show_search": "Search",
		"bots.settings.menu_show_wishlist": "Wishlist",
		"bots.settings.menu_show_cart": "Cart",
		"bots.settings.menu_show_checkout": "Checkout",
		"bots.settings.menu_show_orders": "Orders",
		"bots.settings.menu_show_addresses": "Addresses",
		"bots.settings.menu_show_support": "Support",
		"bots.settings.menu_show_sale": "Sale",
		"bots.settings.parityModules": "Parity modules",
		"bots.settings.siteWidgets": "Site widgets",
		"bots.settings.moduleFlags": "Module toggles",
		"bots.settings.widget.otp_enabled": "OTP login",
		"bots.settings.widget.popup_enabled": "Channel popup",
		"bots.settings.widget.float_enabled": "Floating chat",
		"bots.settings.widget.filebot_enabled": "File bot",
		"bots.settings.module.admin_ops": "Admin ops",
		"bots.settings.module.c2c": "Card-to-card",
		"bots.settings.module.faq": "FAQ",
		"bots.settings.module.tickets": "Tickets",
		"bots.settings.module.club": "Club",
		"bots.settings.module.channel_publisher": "Channel publisher",
		"bots.settings.module.site_widgets": "Site widgets",
		"bots.settings.module.notify_cascade": "Notify cascade",
		"bots.settings.module.outbound_queue": "Outbound queue",
		"bots.settings.stockThreshold": "Low-stock threshold",
		"bots.settings.routeHighAov": "High-AOV route amount",
		"bots.settings.templatePreview": "Template preview",
		"bots.settings.preview": "Preview",
		"bots.settings.templatePreviewUnavailable": "Template preview endpoint unavailable",
		"bots.webhookSetFailed": "Could not register webhook — check token and HTTPS URL",
		"bots.webhookDeleteFailed": "Could not remove webhook",
		"bots.healthOk": "Health OK (bot: {{user}})",
		"bots.healthFail": "Health check failed: {{error}}",
		"bots.couponsTitle": "Bot coupons",
		"bots.couponCode": "Code",
		"bots.couponAmount": "Amount",
		"bots.couponType": "Type",
		"bots.couponFixedCart": "Fixed cart",
		"bots.couponCreate": "Create coupon",
		"users.blockBot": "Block in bots",
		"users.unblockBot": "Unblock in bots",
		"users.loyaltyPoints": "Loyalty points",
		"bots.purchaseType.cash": "Cash",
		"bots.purchaseType.credit": "Credit",
		"bots.purchaseType.installment": "Installment",
		"bots.purchaseType.wholesale": "Wholesale",
		"nav.module.ai-content-module": "AI Content",
		"nav.module.ai-content-overview": "Overview",
		"nav.module.ai-content-jobs": "Jobs",
		"nav.module.ai-content-calendar": "Content calendar",
		"nav.module.ai-content-products": "Product content",
		"nav.module.ai-content-titles": "Product titles",
		"nav.module.ai-content-pages": "Site pages",
		"nav.module.ai-content-taxonomies": "Categories & brands",
		"nav.module.ai-content-attributes": "Attribute templates",
		"nav.module.ai-content-settings": "Settings",
		"aiContent.overviewTitle": "AI Content",
		"aiContent.calendarTitle": "Content calendar",
		"aiContent.productsTitle": "Product content",
		"aiContent.titlesPageTitle": "Product titles",
		"aiContent.pagesTitle": "Elementor pages",
		"aiContent.taxonomiesTitle": "Categories & brands",
		"aiContent.attributesTitle": "Attribute templates",
		"aiContent.settingsTitle": "AI Content settings",
		"aiContent.jobsPageTitle": "AI jobs",
		"aiContent.navCalendar": "Calendar",
		"aiContent.navJobs": "Jobs",
		"aiContent.navProducts": "Products",
		"aiContent.navTaxonomies": "Categories",
		"aiContent.navAttributes": "Attributes",
		"aiContent.navSettings": "Settings",
		"aiContent.stat.pending": "Pending jobs",
		"aiContent.stat.failed": "Failed jobs",
		"aiContent.stat.done": "Completed jobs",
		"aiContent.stat.calendar": "Upcoming slots",
		"aiContent.incompleteTitle": "Incomplete products",
		"aiContent.incompleteCount": "{{count}} products need content",
		"aiContent.jobsTitle": "Recent jobs",
		"aiContent.noJobs": "No jobs yet.",
		"aiContent.retry": "Retry",
		"aiContent.jobRetried": "Job re-queued",
		"aiContent.jobQueued": "Generation queued",
		"aiContent.jobQueueFailed": "Could not queue the job",
		"aiContent.jobsViewAll": "View all",
		"aiContent.jobsRunDue": "Run queue now",
		"aiContent.jobsRunDueRunning": "Queue is running…",
		"aiContent.jobsRunDueDone": "Processed {{count}} jobs",
		"aiContent.jobsFilter.all": "All",
		"aiContent.jobsFilter.pending": "Queued",
		"aiContent.jobsFilter.running": "Running",
		"aiContent.jobsFilter.failed": "Failed",
		"aiContent.jobsFilter.cancelled": "Cancelled",
		"aiContent.jobsFilter.done": "Done",
		"aiContent.jobStatus.pending": "Queued",
		"aiContent.jobStatus.running": "Running",
		"aiContent.jobStatus.failed": "Failed",
		"aiContent.jobStatus.cancelled": "Cancelled",
		"aiContent.jobStatus.done": "Done",
		"aiContent.jobType.product_fill": "Product content",
		"aiContent.jobType.blog_write": "Blog write",
		"aiContent.jobType.term_fill": "Term content",
		"aiContent.jobType.attr_template": "Attribute template",
		"aiContent.jobType.suggest_blog_categories": "Suggest blog categories",
		"aiContent.jobType.suggest_product_categories": "Suggest product categories",
		"aiContent.jobsAttempts": "{{count}} attempts",
		"aiContent.jobsTokens": "tokens {{inCount}}/{{outCount}}",
		"aiContent.jobId": "#{{id}}",
		"aiContent.jobTokensIn": "in {{count}}",
		"aiContent.jobTokensOut": "out {{count}}",
		"aiContent.jobUntitled": "Untitled",
		"aiContent.targetType.product": "Product",
		"aiContent.targetType.post": "Post",
		"aiContent.targetType.product_cat": "Product category",
		"aiContent.targetType.product_brand": "Brand",
		"aiContent.targetType.category": "Blog category",
		"aiContent.targetType.calendar": "Calendar",
		"aiContent.targetType.suggest": "Category suggestion",
		"aiContent.jobError.timeout": "The model connection timed out",
		"aiContent.jobError.network": "Network error talking to the model",
		"aiContent.jobError.contentKw": "Focus keyword missing from product content",
		"aiContent.jobError.titleKw": "Focus keyword missing from title",
		"aiContent.jobError.descKw": "Focus keyword missing from SEO meta description",
		"aiContent.jobError.seoGeneric": "SEO checks failed",
		"aiContent.errDisabled": "AI Content is disabled.",
		"aiContent.errNoKey": "No AI API key is configured.",
		"aiContent.errJobNotFound": "Job not found.",
		"aiContent.batchQueued": "{{count}} jobs queued",
		"aiContent.generate": "Generate with AI",
		"aiContent.generating": "Generating…",
		"aiContent.fillIncomplete": "Fill incomplete products",
		"aiContent.noIncomplete": "All products look complete.",
		"aiContent.addSlot": "Add calendar slot",
		"aiContent.fieldDate": "Date",
		"aiContent.fieldType": "Type",
		"aiContent.fieldTopic": "Topic",
		"aiContent.fieldFocus": "Focus keyword",
		"aiContent.typeBlog": "Blog",
		"aiContent.typeProduct": "Product",
		"aiContent.bulkTopics": "Bulk topics",
		"aiContent.bulkHint": "One topic per line. Optional: Topic | focus keyword",
		"aiContent.bulkCreate": "Create slots",
		"aiContent.bulkCreated": "Created {{count}} slots",
		"aiContent.calendarList": "Calendar",
		"aiContent.noSlots": "No calendar slots.",
		"aiContent.runDue": "Run due slots now",
		"aiContent.dueQueued": "Due slots queued",
		"aiContent.suggestCats": "Suggest categories",
		"aiContent.catalogAssignTitle": "Assign categories & brands to products",
		"aiContent.catalogAssignHint": "AI proposes categories/brands from the current site tree; new terms only when needed. Leaf categories include all ancestors on apply.",
		"aiContent.catalogSuggestProducts": "Suggest for products",
		"aiContent.catalogApplyAll": "Apply all",
		"aiContent.catalogAppliedAll": "{{applied}} applied, {{failed}} failed",
		"aiContent.noCatalogProposals": "No pending proposals. Run suggest, then return after jobs finish.",
		"aiContent.proposalApply": "Apply",
		"aiContent.proposalSkip": "Skip",
		"aiContent.proposalApplied": "Applied",
		"aiContent.titleSuggestAll": "Suggest titles for all",
		"aiContent.titleSuggestAllHint": "Builds proposals for all products once; then apply one by one.",
		"aiContent.titleCurrent": "Current name",
		"aiContent.titleProposed": "Proposed name",
		"aiContent.titleRedo": "Suggest again",
		"aiContent.noTitleProposals": "No title proposals. Use the button above.",
		"aiContent.settingsCatalog": "Catalog & consistent titles",
		"aiContent.catalogAssignCats": "Assign product categories",
		"aiContent.catalogAssignBrands": "Assign product brands",
		"aiContent.catalogCreateTerms": "Create missing terms",
		"aiContent.catalogCreateTermsHint": "Create a category or brand when none on the site fits.",
		"aiContent.catalogOnlyMissing": "Only products missing category/brand",
		"aiContent.catalogOnlyMissingHint": "Skip products that already have category and brand.",
		"aiContent.promptCatalog": "Catalog classification prompt",
		"aiContent.titleEnabled": "Enable title rewrite",
		"aiContent.titlePattern": "Title pattern",
		"aiContent.titlePatternHint": "Placeholders: {product} {brand} {model} {feature}",
		"aiContent.titleBrandScript": "Brand script",
		"aiContent.titleBrandFa": "All Persian",
		"aiContent.titleBrandEn": "All English",
		"aiContent.titleIncludeFeature": "Include feature/size in title",
		"aiContent.titleIncludeFeatureHint": "When off, {feature} is dropped from the pattern.",
		"aiContent.promptTitle": "Title consistency prompt",
		"aiContent.suggest": "Suggest with AI",
		"aiContent.applySuggestions": "Apply suggestions",
		"aiContent.noSuggestions": "No suggestions yet. Run AI suggest, then refresh.",
		"aiContent.catsApplied": "Created {{count}} categories",
		"aiContent.fillTerms": "Fill brand & category content",
		"aiContent.fillProductCats": "Fill product categories",
		"aiContent.fillBrands": "Fill brands",
		"aiContent.attrSuggestTitle": "Suggest attribute template",
		"aiContent.productCatId": "Product category ID",
		"aiContent.confirmTemplate": "Confirm template",
		"aiContent.noAttrDraft": "No draft yet.",
		"aiContent.attrTemplates": "Saved templates",
		"aiContent.noTemplates": "No attribute templates yet.",
		"aiContent.settingsProviders": "AI providers",
		"aiContent.defaultProvider": "Default provider",
		"aiContent.leaveBlankKeep": "Leave blank to keep existing key",
		"aiContent.gapgpt": "GapGPT",
		"aiContent.gapgptKey": "GapGPT API key",
		"aiContent.gapgptModel": "GapGPT model",
		"aiContent.gapgptSaveKeyFirst": "Save the API key first to load models from GapGPT.",
		"aiContent.gapgptRefreshModels": "Refresh models",
		"aiContent.gapgptNoModels": "No models returned. Check the API key.",
		"aiContent.settingsProfile": "Site profile & SEO rules",
		"aiContent.siteTopic": "Site topic / niche",
		"aiContent.siteDescription": "Site domain description",
		"aiContent.siteDescriptionHint": "Business, audience, services — remembered for every page.",
		"aiContent.tone": "Tone",
		"aiContent.settingsTones": "Writing tone",
		"aiContent.settingsTonesHint": "Enabled tones are combined in the prompt. Keep at least one on.",
		"aiContent.tone.professional": "Professional",
		"aiContent.tone.friendly": "Friendly",
		"aiContent.tone.expert": "Expert",
		"aiContent.tone.educational": "Educational",
		"aiContent.tone.sales": "Sales",
		"aiContent.tone.storytelling": "Storytelling",
		"aiContent.tone.luxury": "Luxury",
		"aiContent.tone.casual": "Casual",
		"aiContent.tone.enthusiastic": "Enthusiastic",
		"aiContent.webResearch": "Search the web before writing",
		"aiContent.webResearchHint": "The model must not invent specs from memory; it researches the product first.",
		"aiContent.reviewEmojis": "Emojis in product reviews",
		"aiContent.reviewEmojisHint": "When on, put a relevant emoji in every sentence or paragraph of the description and review, never in SEO titles.",
		"aiContent.internalLinksMin": "Minimum internal links",
		"aiContent.internalLinksMax": "Maximum internal links",
		"aiContent.attrPageLead": "Pick a category. Attribute names come from that category; values are reused only when they match exactly, otherwise created.",
		"aiContent.attrPickCategory": "Categories",
		"aiContent.attrForCategory": "Attributes for “{{name}}”",
		"aiContent.attrSelectCategoryFirst": "Select a category from the list first.",
		"aiContent.attrMapped": "Saved",
		"aiContent.saveMapping": "Save names for this category",
		"aiContent.noGlobalAttributes": "No global WooCommerce attributes yet.",
		"aiContent.noCategoryAttributes": "No attributes found on products in this category.",
		"aiContent.language": "Language",
		"aiContent.lang.fa": "Persian",
		"aiContent.lang.en": "English",
		"aiContent.dailyBlogQuota": "Daily blog quota",
		"aiContent.dailyProductQuota": "Daily product quota",
		"aiContent.publishStatus": "Publish status",
		"aiContent.autoPublish": "Auto-publish (not recommended)",
		"aiContent.enabled": "Enable AI automation",
		"aiContent.requireSiteName": "Require site name in content",
		"aiContent.siteName": "Site name",
		"aiContent.temperature": "Creativity (temperature)",
		"aiContent.maxTokens": "Max tokens",
		"aiContent.maxTokensHint": "0 means do not send a limit (provider default).",
		"aiContent.seoSep": "SEO title separator",
		"aiContent.settingsSystemPrompt": "System instructions",
		"aiContent.settingsProduct": "Product",
		"aiContent.settingsProductCat": "Product category",
		"aiContent.settingsBrand": "Brand",
		"aiContent.settingsBlog": "Blog",
		"aiContent.settingsBlogCat": "Blog category",
		"aiContent.settingsPageEntity": "Pages (Elementor)",
		"aiContent.settingsDesign": "Design memory & palette",
		"aiContent.paletteMode": "Color palette source",
		"aiContent.paletteModeHint": "Site: Elementor kit. Suggest: AI proposes a palette when the kit has none.",
		"aiContent.paletteModeSite": "Site / Elementor kit palette",
		"aiContent.paletteModeSuggest": "Let AI suggest a palette",
		"aiContent.designSource": "Source",
		"aiContent.designLocked": "Locked (later pages reuse this look)",
		"aiContent.designUnlocked": "Unlocked",
		"aiContent.extractKit": "Extract from Elementor kit",
		"aiContent.unlockDesign": "Unlock",
		"aiContent.resetDesign": "Reset design memory",
		"aiContent.designExtracted": "Palette saved from Elementor kit",
		"aiContent.designReset": "Design memory cleared",
		"aiContent.pageSystemPrompt": "Page design system instructions",
		"aiContent.pageProvider": "Page provider",
		"aiContent.pageProviderHint": "Only for page design jobs. Empty uses the default provider.",
		"aiContent.pageProviderDefault": "Same as default provider",
		"aiContent.pageModel": "Page model ID",
		"aiContent.pageModelHint": "Empty uses that provider’s usual model.",
		"aiContent.pageModelPlaceholder": "e.g. grok-3 or gpt-4o",
		"aiContent.pageMaxTokens": "Page max output tokens",
		"aiContent.pagesLead": "Write a prompt per page; layout follows brand design memory.",
		"aiContent.pagesList": "Pages",
		"aiContent.pagesSearch": "Search pages…",
		"aiContent.noPages": "No pages yet.",
		"aiContent.pagePromptPlaceholder": "e.g. About page with brand story, team, and a contact CTA…",
		"aiContent.elementorRequired": "Elementor must be active to design pages.",
		"aiContent.hasElementor": "Elementor",
		"aiContent.pageAiCard": "Generate with AI (Elementor)",
		"aiContent.generatePage": "Design this page",
		"aiContent.editSiteDescription": "Edit site description",
		"aiContent.settingsAutomation": "Automation & publishing",
		"aiContent.resetPrompt": "Reset prompt",
		"aiContent.doEntity": "Generate this section",
		"aiContent.entityPrompt": "Section prompt",
		"aiContent.unit.words": "words",
		"aiContent.unit.paragraphs": "paragraphs",
		"aiContent.unit.count": "count",
		"aiContent.field.name": "Name",
		"aiContent.field.slug": "Slug",
		"aiContent.field.english_name": "English name",
		"aiContent.field.short_description": "Short description",
		"aiContent.field.description": "Description",
		"aiContent.field.ai_review_summary": "Review",
		"aiContent.field.faqs": "FAQs",
		"aiContent.field.attributes": "Attributes",
		"aiContent.field.tags": "Tags",
		"aiContent.field.seo": "SEO",
		"aiContent.field.title": "Title",
		"aiContent.field.excerpt": "Excerpt",
		"aiContent.field.content": "Content",
		"aiContent.field.custom_labels": "Shop labels",
		"aiContent.field.blend_arabica": "Arabica %",
		"aiContent.field.blend_robusta": "Robusta %",
		"aiContent.field.acidity": "Acidity",
		"aiContent.field.caffeine_mg": "Caffeine (mg)",
		"aiContent.field.bitterness": "Bitterness",
		"aiContent.field.sweetness": "Sweetness",
		"aiContent.field.body": "Body",
		"aiContent.field.origin_ids": "Origins",
		"aiContent.field.visible": "Visible sections",
		"aiContent.phase.queued": "Queued",
		"aiContent.phase.layout": "Planning layout",
		"aiContent.phase.visual": "Designing visuals",
		"aiContent.phase.provider": "Calling the model",
		"aiContent.phase.seo": "Checking SEO",
		"aiContent.phase.writing": "Writing to the site",
		"aiContent.phase.done": "Done",
		"aiContent.phase.failed": "Failed",
		"aiContent.generateProgress": "Generating content",
		"aiContent.generateDone": "Content generated",
		"aiContent.generateFailed": "Generation failed",
		"aiContent.generateStillRunning": "Still running — check the jobs page. The error will be stored if it stops.",
		"aiContent.dismiss": "Close",
		"aiContent.jobsCancel": "Stop",
		"aiContent.jobsCancelPending": "Cancel queued jobs",
		"aiContent.jobsCancelledCount": "Cancelled {{count}} queued jobs",
		"aiContent.jobCancelled": "Job cancelled",
		"aiContent.jobCancelRequested": "Stop requested — waiting for the current API call to end",
		"aiContent.queuePause": "Pause queue",
		"aiContent.queueResume": "Resume queue",
		"aiContent.queuePaused": "Queue paused",
		"aiContent.queueResumed": "Queue resumed",
		"aiContent.queuePausedHint": "The queue is paused. Failed jobs stay stopped until you retry. Nothing runs until you resume or run one job.",
		"aiContent.phase.cancelled": "Cancelled",
		"aiContent.settingsPageTitle": "AI content settings",
		"aiContent.settingsPageLead": "Providers, prompts, product/iShop fields, coffee profile, and automation.",
		"aiContent.settingsCoffee": "Coffee profile",
		"aiContent.settingsProductIshop": "Product & iShop",
		"aiContent.settingsFields": "Field",
		"aiContent.settingsLength": "Length",
		"aiContent.temperatureHint": "Lower is more consistent; higher is more varied.",
		"aiContent.settingsCost": "Estimated cost",
		"aiContent.costLead": "Approximate cost per task with the selected model. Click a row to pick that model, then save.",
		"aiContent.costModel": "Model",
		"aiContent.costIn": "Input / 1M tokens",
		"aiContent.costOut": "Output / 1M tokens",
		"aiContent.costUpTo": "up to",
		"aiContent.costFromJobs": "from completed jobs",
		"aiContent.costMoreModels": "More models",
		"aiContent.costDisclaimer": "Estimates only (rates {{date}}). Your GapGPT invoice is authoritative. One model call per job.",
		"aiContent.costPricingLink": "GapGPT pricing",
		"aiContent.costEditRates": "Edit Toman rates (if GapGPT prices changed)",
		"aiContent.costUsdToToman": "USD to Toman (per $1)",
		"aiContent.costUsdToTomanHint": "Default rates are official model USD prices times this number. Change it to match your GapGPT bill.",
		"aiContent.costBatchHint": "About this much per product",
		"aiContent.costPerTerm": "About this much per category",
		"aiContent.jobsCostTotal": "This list total",
		"aiContent.costApprox": "approx.",
		"aiContent.stat.spend": "Recorded spend",
		"aiContent.errEntityOff": "This AI content type is turned off in settings.",
		"aiContent.fillBlogCats": "Fill blog categories",
		"aiContent.excerpt": "Excerpt",
		"aiContent.seoPanel": "SEO",
		"common.refresh": "Refresh",
		"nav.module.shop-reports": "Store analytics",
		"nav.module.shop-reports-overview": "Overview",
		"nav.module.shop-reports-revenue": "Revenue",
		"nav.module.shop-reports-orders": "Orders",
		"nav.module.shop-reports-products": "Products",
		"nav.module.shop-reports-variations": "Variations",
		"nav.module.shop-reports-categories": "Categories",
		"nav.module.shop-reports-coupons": "Coupons",
		"nav.module.shop-reports-taxes": "Taxes",
		"nav.module.shop-reports-customers": "Customers",
		"nav.module.shop-reports-downloads": "Downloads",
		"nav.module.shop-reports-stock": "Stock",
		"nav.module.shop-reports-sales": "Sales & profit",
		"nav.module.shop-reports-financial": "Financial",
		"reports.shopTitle": "Store analytics",
		"reports.shopDescription": "WooCommerce analytics with purchase cost, sell prices, inventory value and profit.",
		"reports.sections.overview": "Overview",
		"reports.sections.revenue": "Revenue",
		"reports.sections.orders": "Orders",
		"reports.sections.products": "Products",
		"reports.sections.variations": "Variations",
		"reports.sections.categories": "Categories",
		"reports.sections.coupons": "Coupons",
		"reports.sections.taxes": "Taxes",
		"reports.sections.customers": "Customers",
		"reports.sections.downloads": "Downloads",
		"reports.sections.stock": "Stock",
		"reports.sections.sales": "Sales & profit",
		"reports.sections.financial": "Financial",
		"reports.financial.tabs.summary": "Summary",
		"reports.financial.tabs.gateways": "Gateways",
		"reports.financial.tabs.utm": "UTM",
		"reports.financial.tabs.orders": "Orders",
		"reports.financial.utmSub.source": "Source",
		"reports.financial.utmSub.medium": "Medium",
		"reports.financial.utmSub.campaign": "Campaign",
		"reports.financial.utmSub.combo": "Combinations",
		"reports.financial.chart.byUtm": "Revenue by UTM source",
		"reports.financial.chart.paymentProfit": "Revenue and profit by gateway",
		"reports.financial.selectGateway": "Select a gateway to see its orders",
		"reports.financial.selectUtm": "Select a UTM value to see matching orders",
		"reports.financial.filterPayment": "Payment gateway",
		"reports.financial.filterUtmSource": "UTM source",
		"reports.financial.filterUtmMedium": "UTM medium",
		"reports.financial.filterUtmCampaign": "UTM campaign",
		"reports.financial.allPayments": "All gateways",
		"reports.financial.allUtm": "All",
		"reports.financial.directNone": "Direct / none",
		"reports.financial.ordersFor": "Orders — {label}",
		"reports.financial.clearFilters": "Clear filters",
		"reports.table.aov": "AOV",
		"reports.table.gateway": "Gateway",
		"reports.table.utmSource": "UTM source",
		"reports.table.utmMedium": "UTM medium",
		"reports.table.utmCampaign": "UTM campaign",
		"reports.table.orderNumber": "Order",
		"reports.table.payment": "Payment",
		"reports.table.date": "Date",
		"reports.table.status": "Status",
		"reports.chart.overview": "Performance over time",
		"reports.metric.revenue": "Gross revenue",
		"reports.metric.net": "Net revenue",
		"reports.metric.orders": "Orders",
		"reports.metric.items": "Items sold",
		"reports.metric.refunds": "Refunds",
		"reports.metric.coupons": "Coupons / discounts",
		"reports.metric.tax": "Tax",
		"reports.metric.shipping": "Shipping",
		"reports.metric.profit": "Gross profit",
		"reports.metric.cogs": "COGS",
		"reports.searchPlaceholder": "Search…",
		"reports.rows": "rows",
		"reports.prevPage": "Previous",
		"reports.nextPage": "Next",
		"reports.table.topCoupons": "Top coupons",
		"reports.table.coupon": "Coupon",
		"reports.table.usage": "Usage",
		"reports.table.intervals": "Intervals",
		"reports.table.period": "Period",
		"reports.table.avgSell": "Avg. sell price",
		"reports.table.avgCost": "Avg. cost",
		"reports.table.variation": "Variation",
		"reports.table.brand": "Brand",
		"reports.table.topBrands": "Top brands",
		"reports.table.taxName": "Tax name",
		"reports.table.taxCode": "Tax code",
		"reports.table.taxRate": "Rate",
		"reports.table.orderTax": "Order tax",
		"reports.table.shippingTax": "Shipping tax",
		"reports.table.taxTotal": "Tax total",
		"reports.table.email": "Email",
		"reports.table.customerType": "Type",
		"reports.table.downloads": "Downloads",
		"reports.table.purchasePrice": "Purchase price",
		"reports.table.sellPrice": "Sell price",
		"reports.table.currentPrice": "Current price",
		"reports.table.sku": "SKU",
		"reports.table.stock": "Stock",
		"reports.table.stockStatus": "Stock status",
		"reports.table.stockValue": "Stock value",
		"reports.table.potentialProfit": "Potential profit",
		"reports.customerNew": "New",
		"reports.customerReturning": "Returning",
		"reports.kpi.newCustomers": "New customers",
		"reports.kpi.returningCustomers": "Returning customers",
		"reports.itemsPerOrder": "Items per order",
		"reports.downloadsEmpty": "No downloadable product activity in this period.",
		"reports.targetMarginHint": "Target retail margin {{target}}% · realized {{actual}}%",
		"reports.stock.skuCount": "SKUs",
		"reports.stock.units": "Units in stock",
		"reports.stock.outofstock": "Out of stock",
		"reports.stock.low": "Low stock",
		"reports.stock.missingCost": "Missing purchase price",
		"reports.stock.valuePurchase": "Inventory at cost",
		"reports.stock.valueRetail": "Inventory at retail",
		"reports.stock.valueWholesale": "Inventory at wholesale",
		"reports.stock.potentialProfit": "Potential profit",
		"reports.stock.valueBase": "Value by",
		"reports.stockFilter.all": "All stock",
		"reports.stockFilter.instock": "In stock",
		"reports.stockFilter.outofstock": "Out of stock",
		"reports.stockFilter.lowstock": "Low stock",
		"reports.stockFilter.missing_cost": "Missing cost",
		"reports.stock.valueBy.purchase": "Value by purchase",
		"reports.stock.valueBy.retail": "Value by retail",
		"reports.stock.valueBy.current": "Value by current price",
		"reports.stock.valueBy.wholesale": "Value by wholesale",
		"reports.stock.valueBy.credit": "Value by credit",
		"reports.stockStatus.instock": "In stock",
		"reports.stockStatus.outofstock": "Out of stock",
		"reports.stockStatus.onbackorder": "On backorder",
		"home.traffic.emptyTitle": "No traffic yet",
		"home.traffic.emptyHint": "The analytics tracker is on, but there are no hits in this period yet.",
		"home.traffic.trackerHint": "Logged-in admins are often excluded. Enable “record logged-in users” or test in a private window while logged out.",
		"home.traffic.wpStatisticsHint": "Data comes from the traffic statistics plugin. Confirm tracking is enabled and visit the public site.",
		"analytics.source.wpStatistics": "Traffic statistics",
		"analytics.source.wpStatisticsBannerTitle": "Synced with traffic statistics",
		"analytics.source.wpStatisticsBannerBody": "Dashboard analytics read live from the traffic statistics plugin. The built-in tracker is disabled to avoid double counting.",
		"analytics.source.nativeTrackerDisabled": "Native tracking settings are inactive while the traffic statistics plugin is installed.",
		"analytics.settings.nativeHint": "Hits are recorded anonymously (no cookies). Test the public site in a private window if numbers stay at zero.",
		"home.traffic.openAnalyticsSettings": "Analytics settings",
		"posts.stats.total": "All posts",
		"posts.stats.publish": "Published",
		"posts.stats.draft": "Drafts",
		"posts.stats.pending": "Pending",
		"posts.colSeo": "SEO",
		"pages.stats.total": "All pages",
		"pages.stats.publish": "Published",
		"pages.stats.draft": "Drafts",
		"pages.stats.pending": "Pending",
		"categories.stats.total": "Categories",
		"categories.stats.withPosts": "With posts",
		"categories.stats.empty": "Empty",
		"categories.fieldSeoTitle": "SEO title",
		"categories.fieldSeoDescription": "SEO description",
		"categories.fieldFocusKeyword": "Focus keyword",
		"productCats.levelBadge": "Level {{level}}",
		"wfcp.colLock": "Lock",
		"wfcp.colWcSale": "Sale price",
		"wfcp.colAttrs": "Attributes",
		"wfcp.locked": "Locked",
		"wfcp.unlocked": "Unlocked",
		"wfcp.savedInline": "Saved",
		"wfcp.emptyBulk": "No products match these filters.",
		"common.expand": "Expand",
		"common.collapse": "Collapse",
		"wfcp.sort.price_asc": "Price (low to high)",
		"wfcp.sort.price_desc": "Price (high to low)",
		"users.sectionComments": "Comments",
		"users.sectionNotes": "Notes",
		"users.commentsEmpty": "No comments from this user.",
		"users.commentsCount": "{{count}} comments",
		"users.viewAllComments": "All comments",
		"users.notesPlaceholder": "Write an internal note…",
		"users.addNote": "Add note",
		"users.notesEmpty": "No notes yet.",
		"users.contactLandline": "Landline",
		"marketing.sms.messageKind": "Message type",
		"marketing.sms.kindTransactional": "Transactional (OTP / order) — service line + pattern",
		"marketing.sms.kindMarketing": "Marketing / newsletter — marketing line + webservice",
		"marketing.sms.lineHint": "Lines are attached in WebinaCRM. Transactional uses the service line; marketing uses the marketing line.",
		"marketing.sms.addPattern": "Request pattern",
		"marketing.sms.patternRulesTitle": "Pattern rules",
		"marketing.sms.patternRule1": "Include business/brand name as fixed text (not a variable).",
		"marketing.sms.patternRule2": "Do not use brand names or links as variables.",
		"marketing.sms.patternRule3": "Links must be fixed in the message, not variables.",
		"marketing.sms.patternRule4": "Service patterns must be non-promotional.",
		"marketing.sms.patternRule5": "If linking, meet Enamad/compliance requirements.",
		"marketing.sms.patternRule6": "Test patterns should include a test keyword when applicable.",
		"marketing.sms.patternTitle": "Title",
		"marketing.sms.patternDescription": "Description",
		"marketing.sms.patternWebsite": "Website (HTTPS)",
		"marketing.sms.patternMessage": "Pattern message",
		"marketing.sms.patternVariables": "Variables",
		"marketing.sms.addVariable": "Add variable",
		"marketing.sms.brandName": "Brand / business name",
		"marketing.sms.checkBrandInMessage": "Brand name is in the message",
		"marketing.sms.checkNonPromotional": "Content is non-promotional",
		"marketing.sms.checkEnamad": "Enamad considered if message has a link",
		"marketing.sms.checkTestWord": "Test keyword included if test pattern",
		"marketing.sms.patternIsShare": "Share with sub-users",
		"marketing.sms.patternRequiredFields": "Title, description and message are required.",
		"marketing.sms.patternWebsiteHttps": "Website must start with https://",
		"marketing.sms.patternBrandMissing": "Brand name must appear in the message.",
		"marketing.sms.patternChecklistRequired": "Confirm required checklist items.",
		"settings.siteSms.linesFromCrm": "Sender lines are assigned in WebinaCRM (service vs marketing). Read-only here.",
		"settings.siteSms.usePatternForOtp": "Send OTP via approved pattern",
		"settings.siteSms.usePatternForOtpHint": "Uses the service line and SMS pattern instead of plain webservice text.",
		"settings.siteSms.patternCode": "OTP pattern code",
		"settings.siteSms.otpLength": "OTP length",
		"settings.siteSms.otpExpiry": "Expiry (minutes)",
		"settings.siteSms.otpMaxAttempts": "Max attempts",
		"settings.siteSms.testPhone": "Test phone",
		"settings.siteSms.testLogin": "Test login OTP",
		"settings.siteSms.testRegister": "Test register OTP",
		"settings.siteSms.testSent": "Test OTP sent.",
		"settings.shopSms.shortcodesForEditor": "Insert shortcode",
		"settings.shopSms.insertIntoCustomer": "Inserts into customer message",
		"settings.shopSms.insertIntoAdmin": "Inserts into admin message",
		"settings.shopSms.templateVars": "Template variables",
		"settings.shopSms.tabs.admin": "Admin SMS",
		"settings.shopSms.tabs.customer": "Customer SMS",
		"settings.shopSms.tabs.newsletter": "Product newsletter",
		"settings.shopSms.tabs.subscribers": "Newsletter subscribers",
		"settings.shopSms.botIds": "Bot unique IDs (max 5)",
		"settings.shopSms.botIdsHint": "Telegram/Bale bot chat IDs for experimental alerts, comma-separated.",
		"settings.shopBots.title": "Order Telegram / Bale notifications",
		"settings.shopBots.hint": "Same order events and newsletter as shop SMS — sent via your bot to linked customers and admin chat IDs.",
		"settings.shopBots.connectionSettings": "Bot connection settings",
		"settings.shopBots.tabs.admin": "Admin bot",
		"settings.shopBots.tabs.customer": "Customer bot",
		"settings.shopBots.tabs.newsletter": "Newsletter",
		"settings.shopBots.tabs.subscribers": "Subscribers",
		"settings.shopBots.adminChatIds": "Admin chat IDs (one per line, max 5)",
		"settings.shopBots.adminChatIdsHint": "Numeric chat IDs for managers",
		"settings.shopBots.roleEditor": "Message template",
		"settings.shopBots.customerMessage": "Customer message",
		"settings.shopBots.adminMessage": "Admin message",
		"settings.shopBots.testOrderId": "Test order ID (optional)",
		"settings.shopBots.testChatId": "Test chat ID (customer)",
		"settings.shopBots.testSend": "Send test",
		"settings.shopBots.testSent": "Test message sent.",
		"settings.shopBots.newsletterHint": "Broadcast the template to opted-in bot users (and admins if enabled).",
		"settings.shopBots.newsletterNotifyAdmin": "Also send campaigns to admin chat IDs",
		"settings.shopBots.newsletterTemplate": "Newsletter message template",
		"settings.shopBots.sendCampaignNow": "Send campaign now",
		"settings.shopBots.sendCampaign": "Send to subscribers",
		"settings.shopBots.newsletterSent": "Sent to {{count}} recipients.",
		"settings.shopBots.subscriberCount": "{{count}} linked users",
		"settings.shopBots.subscriberName": "Name",
		"settings.shopBots.optIn": "Newsletter",
		"settings.shopBots.legacyMovedHint": "Order status templates and toggles moved to shop bot notifications.",
		"settings.shopBots.openShopNotify": "Open shop bot notifications",
		"settings.shopSms.testSms": "Send test SMS",
		"settings.shopSms.testPhone": "Test phone",
		"settings.shopSms.testSent": "Test SMS requested.",
		"settings.shopSms.newsletterEnabled": "Enable product newsletter SMS",
		"settings.shopSms.newsletterTemplate": "Newsletter message template",
		"settings.shopSms.newsletterPattern": "Newsletter pattern code",
		"settings.shopSms.subscribersEmpty": "No subscribers yet.",
		"settings.shopSms.unsubscribe": "Unsubscribe",
		"settings.shopSms.roleEditor": "Pattern for selected status",
		"settings.shopSms.patternsMatrixCtaHint": "Order SMS text, variables, register, and bind are managed on the patterns matrix page.",
		"settings.shopSms.openPatternsMatrix": "Patterns matrix",
		"common.all": "All",
		"marketing.sms.inboxTitle": "Inbox SMS",
		"marketing.sms.draftsTitle": "Default messages",
		"marketing.sms.draftsHint": "Save reusable message templates and send them from the send page.",
		"marketing.sms.newDraft": "New draft",
		"marketing.sms.noDrafts": "No drafts yet.",
		"marketing.sms.scheduledTitle": "Scheduled messages",
		"marketing.sms.cancelScheduled": "Cancel",
		"marketing.sms.cancelled": "Scheduled send cancelled.",
		"marketing.sms.noScheduled": "No scheduled messages.",
		"marketing.sms.targetedTitle": "Targeted send reports",
		"marketing.sms.pickCampaign": "Pick a campaign / outbox",
		"marketing.sms.viewStats": "View stats",
		"marketing.sms.bulkStats": "Bulk stats",
		"marketing.sms.recipients": "Recipients",
		"marketing.sms.walletTitle": "SMS wallet",
		"marketing.sms.walletHint": "Balance and transaction history for your SMS account.",
		"marketing.sms.ledgerTitle": "Transaction history",
		"marketing.sms.ledgerEmpty": "No ledger entries yet.",
		"marketing.sms.amount": "Amount",
		"marketing.sms.note": "Note",
		"marketing.sms.date": "Date",
		"marketing.sms.from": "From",
		"marketing.sms.linesTitle": "Sender lines",
		"marketing.sms.linesHint": "Lines are attached in the platform SMS panel. Read-only here.",
		"marketing.sms.noLines": "No lines attached.",
		"marketing.sms.secretariesTitle": "SMS secretaries",
		"marketing.sms.secretariesHint": "Auto-reply rules and inbox forwarding based on keywords.",
		"marketing.sms.newSecretary": "New secretary rule",
		"marketing.sms.secretaryType": "Type",
		"marketing.sms.secretaryTypes.auto_reply": "Auto reply",
		"marketing.sms.secretaryTypes.inbox_forward": "Inbox forwarder",
		"marketing.sms.secretaryTypes.code_reader": "Code reader",
		"marketing.sms.secretaryTypes.membership": "Membership",
		"marketing.sms.keywords": "Keywords",
		"marketing.sms.replyBody": "Reply / forward body",
		"marketing.sms.forwardTo": "Forward to",
		"marketing.sms.processInbox": "Process inbox now",
		"marketing.sms.secretaryProcessed": "Processed {{processed}}, matched {{matched}}",
		"marketing.sms.noSecretaries": "No secretary rules yet.",
		"marketing.sms.name": "Name",
		"marketing.sms.contacts": "Contacts",
		"marketing.sms.pickPhonebook": "Select a phonebook",
		"marketing.sms.addContact": "Add contact",
		"marketing.sms.localMessages": "Local messages",
		"marketing.sms.outbox": "Outbox",
		"marketing.sms.sendTime": "Send time (optional)",
		"marketing.sms.inbox": "Inbox",
		"marketing.sms.drafts": "Drafts",
		"marketing.sms.targeted": "Targeted sends",
		"marketing.sms.scheduled": "Scheduled",
		"marketing.sms.secretaries": "Auto-reply",
		"marketing.sms.wallet": "Wallet",
		"marketing.sms.lines": "Phone lines",
		"marketing.sms.receivedAt": "Received at",
		"marketing.sms.sentAt": "Sent at",
		"marketing.sms.recipient": "Recipient",
		"marketing.sms.sender": "Sender",
		"marketing.sms.scheduledFor": "Scheduled for",
		"marketing.sms.cancelSend": "Cancel",
		"marketing.sms.cancelFailed": "Cancel failed.",
		"marketing.sms.draftSaved": "Draft saved.",
		"marketing.sms.draftDeleted": "Draft deleted.",
		"marketing.sms.deleteDraft": "Delete",
		"marketing.sms.secretaryFilter": "Filter by type",
		"marketing.sms.secretaryAll": "All types",
		"marketing.sms.secretary_auto_reply": "Auto-reply",
		"marketing.sms.secretary_inbox_forward": "Inbox forward",
		"marketing.sms.secretary_code_reader": "Code reader",
		"marketing.sms.secretary_membership": "Membership",
		"marketing.sms.secretarySaved": "Secretary rule saved.",
		"marketing.sms.secretaryDeleted": "Secretary rule deleted.",
		"marketing.sms.addSecretary": "New rule",
		"marketing.sms.secretaryKeyword": "Keyword",
		"marketing.sms.secretaryResponse": "Response / action",
		"marketing.sms.secretaryResponseHint": "Reply text for auto-reply rules",
		"marketing.sms.ledger": "Transaction history",
		"marketing.sms.ledgerDate": "Date",
		"marketing.sms.ledgerAmount": "Amount",
		"marketing.sms.ledgerDescription": "Description",
		"marketing.sms.walletAccount": "Account details",
		"marketing.sms.walletDomain": "Domain",
		"marketing.sms.lineNumber": "Number",
		"marketing.sms.lineRole": "Role",
		"marketing.sms.lineLabel": "Label",
		"marketing.sms.outboxId": "ID",
		"marketing.sms.selectOutbox": "Select a send from the list to view details.",
		"marketing.sms.contactPhone": "Phone",
		"marketing.sms.contactName": "Name",
		"marketing.sms.contactAdded": "Contact added.",
		"marketing.sms.selectPhonebook": "Select a phonebook to manage contacts.",
		"digikala.rsaTitle": "RSA encryption keys",
		"digikala.rsaHint": "Generate RSA-4096 keys. Paste the public key into Digikala seller encryption settings. Keep the private key on this server.",
		"digikala.generateKeys": "Generate RSA keys",
		"digikala.privateStored": "Private key is stored on the server (never shown again in API responses).",
		"digikala.noPrivate": "No private key yet — generate keys first.",
		"digikala.publicKey": "Public key (give to Digikala)",
		"digikala.copyPublic": "Copy public key",
		"digikala.copied": "Copied",
		"digikala.keysGenerated": "RSA keys generated.",
		"digikala.tokenTitle": "Issue access token",
		"digikala.tokenHint": "Paste the encrypted authorization code from Digikala, then issue tokens.",
		"digikala.encryptedPlaceholder": "Encrypted code from Digikala…",
		"digikala.encryptedDoNotDecrypt": "Do not decrypt the code yourself — paste the raw string; the server decrypts with the private key and calls Digikala’s token API. The code is single-use.",
		"digikala.issueToken": "Issue token",
		"digikala.tokenIssued": "Token issued.",
		"digikala.connectionOk": "Connection OK",
		"digikala.howtoTitle": "Authorization steps",
		"digikala.howtoSubtitle": "Same flow as Digikala seller panel — client code is not required to issue tokens.",
		"digikala.howto.step1": "Click Generate RSA keys on this page.",
		"digikala.howto.step2": "Copy the public key.",
		"digikala.howto.step3": "Register the public key in Digikala seller panel.",
		"digikala.howto.step4": "Copy the validation/encrypted code from Digikala (not client code).",
		"digikala.howto.step5": "Paste that raw code here and click Issue token.",
		"digikala.howto.step6": "Register this site’s HTTPS webhook URL in Digikala panel.",
		"digikala.howtoClientCodeNote": "An empty client code is normal. Only save it if Digikala shows a Client ID.",
		"digikala.authStatus": "Status in WordPress",
		"digikala.connected": "Connected (token stored)",
		"digikala.notConnected": "Not connected — issue a token",
		"digikala.connectedShort": "Connected",
		"digikala.disconnectedShort": "Disconnected",
		"digikala.accessExpires": "Access expires",
		"digikala.refreshExpires": "Refresh expires",
		"digikala.hasRefresh": "Refresh token present",
		"digikala.webhookEventsTitle": "Webhook events (server processing)",
		"digikala.webhookEventsHint": "Toggles only control whether this WordPress site processes the event. Register the same events in Digikala’s seller panel separately.",
		"digikala.saveWebhookEvents": "Save webhook events",
		"digikala.clientCodeOptional": "Client code (optional)",
		"digikala.clientCodeHint": "Not required for token issue. Save Digikala’s Client ID here for more precise scopes tests.",
		"digikala.clientCodePlaceholder": "Client ID from Digikala panel",
		"digikala.saveClientCode": "Save client code",
		"digikala.webhookCardTitle": "Webhook",
		"digikala.webhookCardHint": "Enter this URL in Digikala panel — not the sample company.com placeholder.",
		"digikala.webhookUrlPending": "Loading…",
		"digikala.copyWebhook": "Copy webhook URL",
		"digikala.webhookHttpsNote": "URL must be HTTPS and the server IP must meet Digikala’s Iran IP rules. An “Active” token in Digikala’s panel alone does not mean WordPress has stored tokens.",
		"digikala.baseUrl": "API base URL",
		"digikala.creditIncrease": "Credit increase %",
		"digikala.nav.products": "Products",
		"digikala.nav.orders": "Orders",
		"digikala.nav.jobs": "Jobs",
		"digikala.nav.settings": "Settings",
		"digikala.nav.logs": "Logs",
		"digikala.productsTitle": "Digikala products",
		"digikala.productsSubtitle": "Map DKP codes and sync WFCP Digikala price and stock.",
		"digikala.productActions": "Actions",
		"digikala.importProducts": "Import products",
		"digikala.exportProducts": "Export price/stock",
		"digikala.recentJobs": "Recent jobs",
		"digikala.ordersTitle": "Digikala orders",
		"digikala.ordersSubtitle": "Pull Digikala orders into WooCommerce and run allowed seller actions.",
		"digikala.pullOrders": "Pull orders",
		"digikala.ordersPullQueued": "Order pull queued.",
		"digikala.pushStatus": "Push status",
		"digikala.statusPushed": "Status push queued.",
		"digikala.wcOrderId": "WooCommerce order ID",
		"digikala.wcOrders": "WooCommerce orders",
		"digikala.orderActions": "Digikala actions",
		"digikala.fulfillment": "Fulfillment",
		"digikala.fulfillment.digikala": "Digikala warehouse",
		"digikala.fulfillment.seller": "Ship by seller",
		"digikala.nativeStatusLabel": "Native status",
		"digikala.nativeStatus.active": "Active",
		"digikala.nativeStatus.warehouse": "In Digikala warehouse",
		"digikala.nativeStatus.processed": "Processed",
		"digikala.nativeStatus.returned": "Returned",
		"digikala.nativeStatus.canceled": "Canceled",
		"digikala.nativeStatus.cancelled": "Canceled",
		"digikala.nativeStatus.processing": "Processing",
		"digikala.nativeStatus.full_delivered_to_customer": "Delivered to customer",
		"digikala.nativeStatus.full_delivered": "Delivered to customer",
		"digikala.sbs.processing": "Processing",
		"digikala.sbs.processed": "Processed",
		"digikala.sbs.delivered": "Fully delivered",
		"digikala.verificationCode": "Verification code",
		"digikala.warehouseHint": "Warehouse-fulfilled orders can only be changed by cancelling an item.",
		"digikala.cancelItem": "Cancel item",
		"digikala.cancelQueued": "Item cancellation queued.",
		"digikala.invalidWooStatus": "This WooCommerce status is not allowed for a Digikala order.",
		"digikala.dkpCode": "DKP code",
		"digikala.findVariants": "Find variants",
		"digikala.dkpMapped": "DKP saved.",
		"digikala.pickVariant": "Multiple variants found — pick one.",
		"digikala.mapDkpTitle": "Map DKP",
		"digikala.wcProductId": "WooCommerce product ID",
		"digikala.mappedProducts": "Mapped products",
		"digikala.syncPriceStock": "Sync price/stock",
		"digikala.syncQueued": "Price and stock sync queued.",
		"marketplace.badge.digikala": "Digikala",
		"marketplace.badge.basalam": "Basalam",
		"marketplace.badge.snappshop": "SnappShop",
		"marketplace.badge.tapsishop": "TapsiShop",
		"marketplace.badge.technolife": "Technolife",
		"digikala.settingsTitle": "Digikala settings",
		"digikala.settingsSubtitle": "Client code, base URL, auto-sync.",
		"digikala.settingsSaved": "Settings saved.",
		"digikala.logsSubtitle": "API coverage and module logs.",
		"digikala.coverage": "Coverage",
		"marketing.sms.statuses.pending": "Pending",
		"marketing.sms.statuses.sent": "Sent",
		"marketing.sms.statuses.failed": "Failed",
		"marketing.sms.statuses.delivered": "Delivered",
		"marketing.sms.statuses.cancelled": "Cancelled",
		"marketing.sms.statuses.canceled": "Cancelled",
		"marketing.sms.statuses.queued": "Queued",
		"marketing.sms.statuses.success": "Success",
		"marketing.sms.statuses.error": "Error",
		"marketing.sms.statuses.processing": "Processing",
		"marketing.sms.statuses.rejected": "Rejected",
		"marketing.sms.goToWallet": "Go to wallet",
		"marketing.sms.editDraft": "Edit",
		"marketing.sms.phonebookDeleteUnavailable": "Delete phonebook/contact is not available in the API yet.",
		"marketing.sms.noPhonebooks": "No phonebooks yet.",
		"marketing.sms.noContacts": "No contacts in this phonebook.",
		"marketing.sms.sendFromDraft": "Send",
		"marketing.sms.topupHint": "Choose a package to top up your SMS wallet.",
		"marketing.sms.home": "Home",
		"marketplace.module.snapppay-search-module": "SnappPay Search",
		"marketplace.module.snapppay-search-module-connection": "SnappPay Search",
		"wfcp.tab.snapppay-search": "SnappPay Search",
		"wnc.modules.snapppay-search.title": "SnappPay Search",
		"wnc.modules.snapppay-search.subtitle": "SnappPay Search (SearchWise) feed connector settings",
		"nav.module.coffee-profile-origins": "Coffee origins",
		"nav.module.coffee-profile-module": "Coffee profile",
		"marketplace.module.coffee-profile-module": "Coffee profile",
		"coffeeProfile.settingsTitle": "Coffee profile",
		"coffeeProfile.settingsHint": "Tasting charts on the storefront product page. Colors, labels, acidity levels, and placement are configured here. Enable the module from Settings → Modules.",
		"coffeeProfile.originsTitle": "Coffee origins",
		"coffeeProfile.originsHint": "Countries of origin. Assign one or more to each product; flags appear on the storefront.",
		"coffeeProfile.originNewTitle": "New origin country",
		"coffeeProfile.originEditTitle": "Edit origin country",
		"coffeeProfile.originAdd": "Add country",
		"coffeeProfile.originSearch": "Search countries…",
		"coffeeProfile.originFound": "{{count}} countries",
		"coffeeProfile.originEmpty": "No origin countries yet.",
		"coffeeProfile.originDeleteTitle": "Delete this country?",
		"coffeeProfile.originDeleteConfirm": "Delete “{{name}}”? Products will lose this origin.",
		"coffeeProfile.colFlag": "Flag",
		"coffeeProfile.colName": "Name",
		"coffeeProfile.colIso": "ISO",
		"coffeeProfile.colCount": "Products",
		"coffeeProfile.colActions": "Actions",
		"coffeeProfile.fieldName": "Country name",
		"coffeeProfile.fieldSlug": "Slug",
		"coffeeProfile.fieldIso": "ISO country code",
		"coffeeProfile.fieldIsoHint": "Two letters, e.g. ET for Ethiopia. Used for the automatic flag.",
		"coffeeProfile.fieldDescription": "Description",
		"coffeeProfile.fieldFlagImage": "Custom flag image",
		"coffeeProfile.fieldFlagImageHint": "Optional. Overrides the ISO flag.",
		"coffeeProfile.flagPreview": "Flag preview",
		"coffeeProfile.productTitle": "Coffee profile",
		"coffeeProfile.saveProductFirst": "Save the product first, then fill in the coffee profile.",
		"coffeeProfile.priceByAttrTitle": "Price by attribute",
		"coffeeProfile.priceByAttrHint": "Set purchase price and stock for one attribute (usually weight). Every variation with that value is updated.",
		"coffeeProfile.priceByAttrAttribute": "Attribute",
		"coffeeProfile.priceByAttrApply": "Apply to variations",
		"coffeeProfile.priceByAttrDone": "{{count}} variations updated.",
		"coffeeProfile.priceByAttrCount": "{{count}} variations",
		"coffeeProfile.showBlend": "Show blend on the product page",
		"coffeeProfile.showAcidity": "Show acidity on the product page",
		"coffeeProfile.showCaffeine": "Show caffeine on the product page",
		"coffeeProfile.showBitterness": "Show bitterness on the product page",
		"coffeeProfile.showSweetness": "Show sweetness on the product page",
		"coffeeProfile.showBody": "Show body on the product page",
		"coffeeProfile.showOrigin": "Show origin on the product page",
		"coffeeProfile.blend": "Blend",
		"coffeeProfile.acidity": "Acidity",
		"coffeeProfile.caffeine": "Caffeine",
		"coffeeProfile.caffeineMg": "Amount (mg)",
		"coffeeProfile.bitterness": "Bitterness",
		"coffeeProfile.sweetness": "Sweetness",
		"coffeeProfile.body": "Body",
		"coffeeProfile.noOrigins": "No origin countries yet. Add them under Store → Coffee origins.",
		"coffeeProfile.sectionGeneral": "Labels and placement",
		"coffeeProfile.sectionStyle": "Colors and layout",
		"coffeeProfile.placement": "Product page position",
		"coffeeProfile.placementSummary": "Under the product title",
		"coffeeProfile.placementBeforeCart": "Before add to cart form",
		"coffeeProfile.placementAfterCart": "After add to cart form",
		"coffeeProfile.placementBeforeTabs": "Before product tabs",
		"coffeeProfile.placementAfterTabs": "After product tabs",
		"coffeeProfile.placementNone": "Shortcode only ([webino_coffee_profile])",
		"coffeeProfile.robustaLabel": "Robusta label",
		"coffeeProfile.arabicaLabel": "Arabica label",
		"coffeeProfile.caffeineUnit": "Caffeine unit text",
		"coffeeProfile.caffeineMax": "Caffeine bar maximum (mg)",
		"coffeeProfile.scaleMin": "Scale minimum (bitterness / sweetness / body / acidity)",
		"coffeeProfile.scaleMax": "Scale maximum",
		"coffeeProfile.useFlagcdn": "Load flags from flagcdn.com when no custom image is set",
		"coffeeProfile.acidityLevels": "Acidity levels",
		"coffeeProfile.grindOptions": "Grind options (storefront)",
		"coffeeProfile.roastOptions": "Roast options (storefront)",
		"coffeeProfile.grindEnabled": "Storefront grind selection",
		"coffeeProfile.roastEnabled": "Storefront roast selection",
		"coffeeProfile.fulfillmentHint": "Does not affect price; the customer picks on the product page and it appears on the order for fulfillment.",
		"coffeeProfile.fulfillmentNoAttribute": "The matching attribute is not on this product. Add grind or roast in the Attributes tab (with term images).",
		"coffeeProfile.grindDefault": "Default {{attribute}}",
		"coffeeProfile.roastDefault": "Default {{attribute}}",
		"coffeeProfile.addLevel": "Add level",
		"coffeeProfile.newLevel": "New level",
		"coffeeProfile.livePreview": "Live preview",
		"coffeeProfile.fontTitle": "Title size (px)",
		"coffeeProfile.fontLabel": "Label size (px)",
		"coffeeProfile.fontValue": "Value size (px)",
		"coffeeProfile.radius": "Corner radius (px)",
		"coffeeProfile.gap": "Block spacing (px)",
		"coffeeProfile.barHeight": "Bar height (px)",
		"coffeeProfile.strokeWidth": "Acidity line thickness (px)",
		"coffeeProfile.color.card_bg": "Card background",
		"coffeeProfile.color.card_text": "Card text",
		"coffeeProfile.color.card_border": "Card border",
		"coffeeProfile.color.track": "Bar track",
		"coffeeProfile.color.blend_fill": "Blend fill",
		"coffeeProfile.color.acidity_line": "Acidity line",
		"coffeeProfile.color.acidity_dot": "Acidity dots",
		"coffeeProfile.color.caffeine_fill": "Caffeine fill",
		"coffeeProfile.color.bitterness_fill": "Bitterness fill",
		"coffeeProfile.color.sweetness_fill": "Sweetness fill",
		"coffeeProfile.color.body_fill": "Body fill",
		"coffeeProfile.color.label": "Labels",
		"coffeeProfile.color.value": "Values",
		"coffeeProfile.tabProfile": "Tasting chart",
		"coffeeProfile.tabBlend": "Custom blend",
		"coffeeProfile.blendShortcodeHint": "Form shortcode: [webino_coffee_blend] — lock a mode with mode=\"simple\" or mode=\"advanced\".",
		"coffeeProfile.searchShortcodeHint": "Advanced finder shortcode: [webino_coffee_search] — filter by bean type, acidity, bitterness, and caffeine on the same page.",
		"coffeeProfile.blendSectionCatalog": "Bean catalog",
		"coffeeProfile.blendSectionPrice": "Price and weight",
		"coffeeProfile.blendSectionSimple": "Simple mode (Robusta / Arabica)",
		"coffeeProfile.blendSource": "Bean list source",
		"coffeeProfile.blendSourceProfile": "All products with a coffee profile",
		"coffeeProfile.blendSourceCategory": "Selected categories",
		"coffeeProfile.blendSourceProducts": "Specific products",
		"coffeeProfile.blendCategoryIds": "Category IDs (comma-separated)",
		"coffeeProfile.blendProductIds": "Catalog products",
		"coffeeProfile.blendMode": "Default shortcode mode",
		"coffeeProfile.blendModeBoth": "Both (simple/advanced toggle)",
		"coffeeProfile.blendModeSimple": "Simple only",
		"coffeeProfile.blendModeAdvanced": "Advanced only",
		"coffeeProfile.blendMinBeans": "Minimum beans (advanced)",
		"coffeeProfile.blendMaxBeans": "Maximum beans (advanced)",
		"coffeeProfile.blendPriceBasis": "Price basis",
		"coffeeProfile.blendPricePerKg": "Product price is per kilogram",
		"coffeeProfile.blendPricePack": "Product price is per pack; derive per-kg from pack weight",
		"coffeeProfile.blendDefaultPack": "Default pack weight (grams)",
		"coffeeProfile.blendGrindFee": "Grinding fee per kilogram (optional)",
		"coffeeProfile.blendWeights": "Buyable weights (grams, comma-separated)",
		"coffeeProfile.blendHolder": "Cart holder product ID",
		"coffeeProfile.blendHolderHint": "If empty, a hidden product is created on save.",
		"coffeeProfile.blendRobustaProduct": "Robusta representative product",
		"coffeeProfile.blendArabicaProduct": "Arabica representative product",
		"coffeeProfile.blendRoasts": "Roast levels",
		"coffeeProfile.blendDevices": "Grind devices / sizes",
		"coffeeProfile.blendSuggestions": "Ratio presets",
		"coffeeProfile.blendSuggestLabel": "Label",
		"coffeeProfile.blendSuggestHint": "Short hint",
		"coffeeProfile.blendGuide": "Blend guide copy",
		"coffeeProfile.packWeight": "This product’s pack weight (grams)",
		"coffeeProfile.packWeightHint": "When price basis is pack, per-kg is computed from this weight.",
		"balePay.title": "Bale Pay",
		"balePay.subtitle": "One-time Bale wallet invoice via the shop bot.",
		"balePay.enabled": "Enable at checkout",
		"balePay.checkoutTitle": "Gateway title",
		"balePay.description": "Short checkout description",
		"balePay.instructions": "Help text when no Bale chat is found",
		"balePay.warnBot": "The Bale bot module is inactive or has no token.",
		"balePay.warnToken": "Payment provider_token is missing in Bale bot settings.",
		"balePay.botUsername": "Bot username",
		"c2c.title": "Card to card",
		"c2c.subtitle": "Card numbers, IBAN, and payment deadline. Customers upload a receipt; admins approve in Bale, Telegram, or this page.",
		"c2c.enabled": "Enable at checkout",
		"c2c.checkoutTitle": "Gateway title",
		"c2c.instructions": "Customer instructions",
		"c2c.iban": "IBAN",
		"c2c.deadline": "Payment deadline (hours)",
		"c2c.cards": "Cards",
		"c2c.addCard": "Add card",
		"c2c.cardNumber": "Card number",
		"c2c.cardName": "Card holder",
		"c2c.cardBank": "Bank",
		"c2c.receiptsTitle": "Card-to-card receipts",
		"c2c.receiptsSubtitle": "Pending receipts. After a decision, bot buttons update with the approver’s name.",
		"c2c.empty": "No pending receipts.",
		"c2c.order": "Order",
		"c2c.amount": "Amount",
		"c2c.customer": "Customer",
		"c2c.approve": "Approve",
		"c2c.reject": "Reject",
		"c2c.openOrder": "Open order",
		"c2c.noImage": "No image",
		"marketplace.module.payment-module": "Payments",
		"marketplace.module.wallet-gateway-module": "Wallet",
		"marketplace.module.card-to-card-gateway-module": "Card to card",
		"paymentsHub.zarinpal": "Zarinpal",
		"paymentsHub.digipay": "DigiPay",
		"paymentsHub.snapppay": "SnappPay",
		"paymentsHub.torobpay": "TorobPay",
		"paymentsHub.balePay": "Bale Pay",
		"paymentsHub.wallet": "Wallet",
		"paymentsHub.c2c": "Card to card",
		"paymentsHub.openSettings": "Gateway settings",
		"paymentsHub.otherGateways": "Other gateways",
		"paymentsHub.warnModule": "This module is not active.",
		"paymentsHub.warnGateway": "WooCommerce gateway is not registered.",
		"paymentsHub.unavailable": "This gateway is not available.",
		"paymentsHub.noOther": "No other gateways registered.",
		"bazaarHub.basalam": "Basalam",
		"bazaarHub.digikala": "Digikala",
		"bazaarHub.snappshop": "Snapp Shop",
		"bazaarHub.tapsishop": "Tapsi Shop",
		"bazaarHub.technolife": "Technolife",
		"bazaarHub.emalls": "Emalls",
		"bazaarHub.torob": "Torob",
		"bazaarHub.zarehbin": "Zarebin",
		"bazaarHub.snapppaySearch": "Snapp Pay Search",
		"bazaarHub.openSettings": "Connector settings",
		"bazaarHub.warnModule": "This module is not active.",
		"bazaarHub.unavailable": "This connector is not available.",
		"wallet.title": "Wallet",
		"wallet.subtitle": "Pay from the customer’s store balance. Top-ups use the other payment gateways.",
		"wallet.enabled": "Enable at checkout",
		"wallet.checkoutTitle": "Gateway title",
		"wallet.minTopup": "Minimum top-up",
		"wallet.minTopupHint": "Minimum top-up amount: {{amount}}",
		"wallet.accountTitle": "Wallet",
		"wallet.accountSubtitle": "Balance, top-up, withdrawal, and ledger.",
		"wallet.balance": "Balance",
		"wallet.topup": "Top up",
		"wallet.topupPay": "Pay and top up",
		"wallet.withdraw": "Withdraw to IBAN",
		"wallet.withdrawSubmit": "Request withdrawal",
		"wallet.needSheba": "Add an IBAN on your profile before withdrawing.",
		"wallet.editProfile": "Edit profile",
		"wallet.refundMethod": "Refund method",
		"wallet.refundWallet": "To wallet",
		"wallet.refundBank": "To card / IBAN",
		"wallet.ledger": "History",
		"wallet.ledgerEmpty": "No transactions yet.",
		"wallet.col.date": "Date",
		"wallet.col.reason": "Reason",
		"wallet.col.amount": "Amount",
		"wallet.col.balance": "Balance",
		"wallet.withdrawalsTitle": "Wallet withdrawals",
		"wallet.withdrawalsSubtitle": "Pending withdrawal requests.",
		"wallet.withdrawalsEmpty": "No pending requests.",
		"wallet.approve": "Approve",
		"wallet.markPaid": "Mark paid",
		"wallet.reject": "Reject",
		"wallet.credit": "Credit",
		"wallet.debit": "Debit",
		"wallet.adjust": "Apply",
		"wallet.reason.topup": "Top-up",
		"wallet.reason.checkout": "Purchase",
		"wallet.reason.checkout_restore": "Purchase reversed",
		"wallet.reason.withdraw_request": "Withdrawal",
		"wallet.reason.withdraw_rejected": "Withdrawal rejected",
		"wallet.reason.order_refund": "Order refund",
		"wallet.reason.admin_adjust": "Staff adjustment",
		"notifications.hubTitle": "Notification system",
		"notifications.hubSubtitle": "Manage site, SMS, Bale, Telegram, email, and OTP login in one place.",
		"notifications.tabs.site": "Site",
		"notifications.tabs.sms": "SMS",
		"notifications.tabs.bale": "Bale",
		"notifications.tabs.telegram": "Telegram",
		"notifications.tabs.email": "Email",
		"notifications.tabs.otp": "OTP login",
		"notifications.enabled": "Enabled",
		"notifications.otp.title": "Multi-channel OTP",
		"notifications.otp.hint": "Send the same login/register code on every enabled channel that can reach the user (SMS, email, Bale, Telegram).",
		"notifications.otp.loginEnabled": "OTP login",
		"notifications.otp.registerEnabled": "OTP registration",
		"notifications.otp.siteNotice": "Record a site notification after successful OTP sign-in",
		"notifications.otp.length": "Code length",
		"notifications.otp.expiry": "Expiry (minutes)",
		"notifications.otp.maxAttempts": "Max attempts",
		"notifications.otp.channels": "Delivery channels",
		"notifications.otp.channelsHint": "Only channels with a deliverable destination for that identifier are used.",
		"notifications.otp.smsPatternsHint": "SMS sender line and ModirPayamak patterns stay under",
		"notifications.otp.templates": "Message templates",
		"notifications.otp.templatesHint": "Placeholders: {code} and {site_name}.",
		"notifications.otp.templateLogin": "Login template",
		"notifications.otp.templateRegister": "Register template",
		"notifications.site.title": "In-app notifications",
		"notifications.site.hint": "Notifications are stored and shown in the dashboard header bell for customers and admins.",
		"notifications.variablesHint": "Template variables:",
		"notifications.eventsMatrix": "Events and recipients",
		"notifications.event": "Event",
		"notifications.customer": "Customer",
		"notifications.admin": "Admin",
		"notifications.templates": "Template",
		"notifications.titleCustomer": "Title (customer)",
		"notifications.bodyCustomer": "Body (customer)",
		"notifications.titleAdmin": "Title (admin)",
		"notifications.bodyAdmin": "Body (admin)",
		"notifications.moduleMissing": "The {{module}} module is not installed or active.",
		"notifications.bellLabel": "Notifications",
		"notifications.bellTitle": "Notifications",
		"notifications.unreadCount": "{{count}} unread",
		"notifications.viewAll": "View all",
		"notifications.email.title": "Email notifications",
		"notifications.email.hint": "Configure per-event templates and recipients. SMTP is optional.",
		"notifications.email.tabTemplates": "Templates",
		"notifications.email.tabSmtp": "SMTP",
		"notifications.email.tabWc": "WooCommerce emails",
		"notifications.email.subjectCustomer": "Subject (customer)",
		"notifications.email.bodyCustomer": "HTML body (customer)",
		"notifications.email.subjectAdmin": "Subject (admin)",
		"notifications.email.bodyAdmin": "HTML body (admin)",
		"notifications.email.smtpTitle": "SMTP settings",
		"notifications.email.smtpHint": "When enabled, all WordPress mail is sent through this SMTP server.",
		"notifications.email.smtpEnabled": "Use custom SMTP",
		"notifications.email.host": "Host",
		"notifications.email.port": "Port",
		"notifications.email.encryption": "Encryption",
		"notifications.email.username": "Username",
		"notifications.email.password": "Password",
		"notifications.email.passwordSet": "saved",
		"notifications.email.fromName": "From name",
		"notifications.email.fromEmail": "From email",
		"notifications.email.testTo": "Test recipient",
		"notifications.email.testToPlaceholder": "Empty = site admin email",
		"notifications.email.sendTest": "Send test",
		"notifications.email.testSent": "Test email sent",
		"users.roleSeller": "Seller",
		"users.roleAccountant": "Accountant",
		"pos.title": "Cashier",
		"pos.badge": "POS",
		"pos.myOrders": "My POS orders",
		"pos.searchPlaceholder": "Search or scan barcode / SKU…",
		"pos.emptyCart": "Cart is empty",
		"pos.customer": "Customer",
		"pos.customerSearch": "Search by phone or name…",
		"pos.newPhone": "Mobile",
		"pos.newName": "Name",
		"pos.channel": "Sales channel",
		"pos.channel.in_store": "In store",
		"pos.channel.phone": "Phone",
		"pos.channel.bale": "Bale",
		"pos.channel.eitaa": "Eitaa",
		"pos.channel.rubika": "Rubika",
		"pos.channel.telegram": "Telegram",
		"pos.channel.instagram": "Instagram",
		"pos.channel.other": "Other",
		"pos.tender": "Payment",
		"pos.tender.cash": "Cash",
		"pos.tender.card_to_card": "Card to card",
		"pos.tender.pos_terminal": "Card terminal",
		"pos.tender.online": "Online",
		"pos.tender.other": "Other",
		"pos.showExtras": "Show discount / shipping",
		"pos.hideExtras": "Hide extras",
		"pos.discount": "Discount",
		"pos.shipping": "Shipping / fee",
		"pos.amountPaid": "Amount paid",
		"pos.subtotal": "Subtotal",
		"pos.total": "Total",
		"pos.change": "Change",
		"pos.remaining": "Remaining",
		"pos.checkout": "Complete sale",
		"pos.orderCreated": "Order #{{id}} created",
		"pos.simpleMode": "Simple cashier",
		"pos.qty": "Qty",
		"pos.price": "Price",
		"pos.address": "Address",
		"pos.city": "City",
		"pos.state": "Province",
		"pos.buyerTax": "Buyer tax profile",
		"pos.personNatural": "Natural person",
		"pos.personLegal": "Legal entity",
		"pos.nationalId": "National ID",
		"pos.economicCode": "Economic code",
		"pos.purchaseType": "Purchase type",
		"pos.purchase.cash": "Cash",
		"pos.purchase.credit": "Credit",
		"pos.purchase.installment": "Installment",
		"pos.purchase.wholesale": "Wholesale",
		"pos.coupon": "Coupon code",
		"pos.sendMoadianAfter": "Queue Moadian invoice after save",
		"pos.moadianQueued": "Accounting sync / Moadian queued",
		"orders.newOrder": "New order",
		"orders.editOrder": "Edit order",
		"orders.moadianSync": "Create / send Moadian invoice",
		"orders.moadianSynced": "Order synced to accounting",
		"accounting.nav.chart": "Chart of accounts",
		"accounting.nav.installments": "Installments",
		"accounting.nav.production": "Production",
		"accounting.nav.tools": "Tools",
		"accounting.fiscalYears": "Fiscal years",
		"accounting.col.postable": "Postable",
		"accounting.col.from": "From",
		"accounting.col.to": "To",
		"accounting.col.closed": "Closed",
		"accounting.col.person": "Person",
		"accounting.col.paid": "Paid",
		"accounting.report.balanceSheet": "Balance sheet (assets)",
		"accounting.report.taxable": "Taxable income",
		"accounting.report.exempt": "Exempt income",
		"accounting.report.cashFlow": "Cash flow (net)",
		"accounting.backup": "Backup ZIP",
		"accounting.exportCsv": "Export invoices CSV",
		"accounting.calculator": "Sample % calculator",
		"accounting.moadianProxy": "HTTP proxy (foreign hosts)"
	};
})), up = (typeof window < "u" ? window.webinoDashboard?.locale : "")?.toLowerCase().startsWith("fa") ? "fa" : "en", dp = /* @__PURE__ */ new Set();
async function fp(e) {
	return e === "fa" ? (await Promise.resolve().then(() => (op(), ip))).default : (await Promise.resolve().then(() => (lp(), sp))).default;
}
function pp(e) {
	return e === "fa" ? "rtl" : "ltr";
}
var mp = {
	type: "postProcessor",
	name: "faDigits",
	process(e, t, n) {
		return n.lng !== "fa" && !n.lng?.startsWith("fa") ? e : Wf(e);
	}
};
(async () => {
	let e = up === "fa" ? "en" : "fa", [t, n] = await Promise.all([fp(up), fp(e)]);
	dp.add(up), dp.add(e), await ee.use(mp).use(h).init({
		resources: {
			[up]: { translation: t },
			[e]: { translation: n }
		},
		lng: up,
		fallbackLng: "en",
		keySeparator: !1,
		nsSeparator: !1,
		interpolation: { escapeValue: !1 },
		postProcess: ["faDigits"],
		react: {
			bindI18n: "languageChanged loaded added",
			useSuspense: !1
		}
	}), document.documentElement.lang = up, document.documentElement.dir = pp(up);
})();
//#endregion
//#region src/components/ui/dialog.tsx
function hp({ ...e }) {
	return /* @__PURE__ */ x(Dr, {
		"data-slot": "dialog",
		...e
	});
}
function gp({ ...e }) {
	return /* @__PURE__ */ x(kr, {
		"data-slot": "dialog-portal",
		...e
	});
}
function _p({ className: e, ...t }) {
	return /* @__PURE__ */ x(Ar, {
		"data-slot": "dialog-overlay",
		className: W("fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	});
}
function vp({ className: e, children: t, showCloseButton: n = !0, ...r }) {
	return /* @__PURE__ */ x(kn, {
		allowBodyScroll: !0,
		children: /* @__PURE__ */ S(gp, {
			"data-slot": "dialog-portal",
			children: [/* @__PURE__ */ x(_p, {}), /* @__PURE__ */ S(jr, {
				"data-slot": "dialog-content",
				className: W("fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg", e),
				...r,
				children: [t, n && /* @__PURE__ */ S(Pr, {
					"data-slot": "dialog-close",
					className: "absolute top-4 end-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
					children: [/* @__PURE__ */ x(Yd, {}), /* @__PURE__ */ x("span", {
						className: "sr-only",
						children: ee.t("a11y.close")
					})]
				})]
			})]
		})
	});
}
function yp({ className: e, ...t }) {
	return /* @__PURE__ */ x("div", {
		"data-slot": "dialog-header",
		className: W("flex flex-col gap-2 text-center sm:text-start", e),
		...t
	});
}
function bp({ className: e, showCloseButton: t = !1, children: n, ...r }) {
	return /* @__PURE__ */ S("div", {
		"data-slot": "dialog-footer",
		className: W("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", e),
		...r,
		children: [n, t && /* @__PURE__ */ x(Pr, {
			asChild: !0,
			children: /* @__PURE__ */ x(G, {
				variant: "outline",
				children: ee.t("a11y.close")
			})
		})]
	});
}
function xp({ className: e, ...t }) {
	return /* @__PURE__ */ x(Mr, {
		"data-slot": "dialog-title",
		className: W("text-lg leading-none font-semibold", e),
		...t
	});
}
//#endregion
//#region src/components/ui/skeleton.tsx
function Sp({ className: e, ...t }) {
	return /* @__PURE__ */ x("div", {
		"data-slot": "skeleton",
		className: W("animate-pulse rounded-md bg-accent", e),
		...t
	});
}
//#endregion
//#region src/lib/categoryTree.ts
function Cp(e) {
	return e.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]+/gu, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function wp(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = n.parent || 0, r = t.get(e) ?? [];
		r.push(n), t.set(e, r);
	}
	for (let e of t.values()) e.sort((e, t) => e.name.localeCompare(t.name, void 0, { sensitivity: "base" }));
	let n = [];
	function r(e, i) {
		for (let a of t.get(e) ?? []) n.push({
			node: a,
			depth: i
		}), r(a.id, i + 1);
	}
	return r(0, 0), n;
}
//#endregion
//#region src/components/magazine/MediaPickerDialog.tsx
function Tp(e, t, n) {
	let r = new URLSearchParams({
		page: "1",
		per_page: "60"
	});
	return e > 0 && r.set("folder", String(e)), t > 0 && r.set("category", String(t)), n.trim() && r.set("search", n.trim()), `content/media?${r.toString()}`;
}
function Ep(e) {
	return {
		...e,
		url: ""
	};
}
function Dp({ open: e, onOpenChange: n, onSelect: r }) {
	let { t: i } = g(), [a, o] = m(0), [s, c] = m(0), [l, d] = m(""), [p, h] = m("");
	u(() => {
		if (!e) return;
		let t = window.setTimeout(() => h(l), 300);
		return () => window.clearTimeout(t);
	}, [e, l]);
	let _ = t({
		queryKey: ["media-terms"],
		queryFn: () => Q("content/media/terms"),
		enabled: e
	}), v = t({
		queryKey: [
			"media",
			"picker",
			a,
			s,
			p
		],
		queryFn: () => Q(Tp(a, s, p)),
		enabled: e
	}), y = f(() => wp((_.data?.folders ?? []).map(Ep)), [_.data?.folders]), b = f(() => wp((_.data?.categories ?? []).map(Ep)), [_.data?.categories]), C = (v.data?.items ?? []).filter((e) => e.mime.startsWith("image/"));
	return /* @__PURE__ */ x(hp, {
		open: e,
		onOpenChange: n,
		children: /* @__PURE__ */ S(vp, {
			className: "max-h-[85vh] overflow-hidden sm:max-w-3xl",
			children: [
				/* @__PURE__ */ x(yp, { children: /* @__PURE__ */ x(xp, { children: i("posts.selectFeaturedImage") }) }),
				/* @__PURE__ */ S("div", {
					className: "grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ S("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ x(Z, { children: i("media.filterFolder") }), /* @__PURE__ */ S(Xf, {
								value: String(a),
								onValueChange: (e) => o(parseInt(e, 10) || 0),
								children: [/* @__PURE__ */ x(Qf, {
									className: "w-full",
									children: /* @__PURE__ */ x(Zf, {})
								}), /* @__PURE__ */ S($f, { children: [/* @__PURE__ */ x($, {
									value: "0",
									children: i("media.allFolders")
								}), y.map(({ node: e, depth: t }) => /* @__PURE__ */ x($, {
									value: String(e.id),
									children: `${"— ".repeat(t)}${e.name}`
								}, e.id))] })]
							})]
						}),
						/* @__PURE__ */ S("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ x(Z, { children: i("media.filterCategory") }), /* @__PURE__ */ S(Xf, {
								value: String(s),
								onValueChange: (e) => c(parseInt(e, 10) || 0),
								children: [/* @__PURE__ */ x(Qf, {
									className: "w-full",
									children: /* @__PURE__ */ x(Zf, {})
								}), /* @__PURE__ */ S($f, { children: [/* @__PURE__ */ x($, {
									value: "0",
									children: i("media.allCategories")
								}), b.map(({ node: e, depth: t }) => /* @__PURE__ */ x($, {
									value: String(e.id),
									children: `${"— ".repeat(t)}${e.name}`
								}, e.id))] })]
							})]
						}),
						/* @__PURE__ */ S("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ x(Z, {
								htmlFor: "media-picker-search",
								children: i("media.searchPlaceholder")
							}), /* @__PURE__ */ x(X, {
								id: "media-picker-search",
								value: l,
								onChange: (e) => d(e.target.value),
								placeholder: i("media.searchPlaceholder")
							})]
						})
					]
				}),
				/* @__PURE__ */ x("div", {
					className: "max-h-[50vh] overflow-y-auto",
					children: v.isLoading ? /* @__PURE__ */ x("div", {
						className: "grid grid-cols-3 gap-3 sm:grid-cols-4",
						children: Array.from({ length: 8 }).map((e, t) => /* @__PURE__ */ x(Sp, { className: "aspect-square rounded-md" }, t))
					}) : C.length === 0 ? /* @__PURE__ */ x("p", {
						className: "py-8 text-center text-sm text-muted-foreground",
						children: i("media.empty")
					}) : /* @__PURE__ */ x("div", {
						className: "grid grid-cols-3 gap-3 sm:grid-cols-4",
						children: C.map((e) => /* @__PURE__ */ x("button", {
							type: "button",
							className: "group overflow-hidden rounded-md border border-border bg-muted/30 transition hover:border-primary hover:ring-2 hover:ring-primary/30",
							onClick: () => {
								e.url && (r({
									id: e.id,
									url: e.url
								}), n(!1));
							},
							children: e.url ? /* @__PURE__ */ x("img", {
								src: e.url,
								alt: e.title,
								className: "aspect-square w-full object-cover transition group-hover:scale-105"
							}) : /* @__PURE__ */ x("div", {
								className: "flex aspect-square items-center justify-center text-xs text-muted-foreground",
								children: e.title
							})
						}, e.id))
					})
				}),
				/* @__PURE__ */ x(bp, { children: /* @__PURE__ */ x(G, {
					type: "button",
					variant: "outline",
					onClick: () => n(!1),
					children: i("posts.dialogClose")
				}) })
			]
		})
	});
}
//#endregion
//#region src/components/ui/lazy-image.tsx
function Op({ className: e, eager: t, loading: n, decoding: r, fetchPriority: i, ...a }) {
	return /* @__PURE__ */ x("img", {
		className: W(e),
		loading: n ?? (t ? "eager" : "lazy"),
		decoding: r ?? "async",
		fetchPriority: i ?? (t ? "high" : "low"),
		referrerPolicy: "no-referrer",
		...a
	});
}
//#endregion
//#region src/components/magazine/PostFeaturedImagePanel.tsx
function kp({ imageId: e, imageUrl: t, onChange: n, onRemove: r }) {
	let { t: i } = g(), [a, o] = m(!1);
	return /* @__PURE__ */ S(b, { children: [/* @__PURE__ */ S(K, {
		className: "gap-4 py-4 shadow-sm",
		children: [/* @__PURE__ */ x(q, {
			className: "px-4 pb-0",
			children: /* @__PURE__ */ x(J, {
				className: "text-sm font-semibold",
				children: i("posts.panelFeaturedImage")
			})
		}), /* @__PURE__ */ S(Y, {
			className: "space-y-3 px-4",
			children: [e > 0 && t ? /* @__PURE__ */ x("div", {
				className: "overflow-hidden rounded-md border border-border",
				children: /* @__PURE__ */ x(Op, {
					src: t,
					alt: i("a11y.thumbnail"),
					className: "aspect-video w-full object-cover",
					eager: !0
				})
			}) : /* @__PURE__ */ x("div", {
				className: "flex aspect-video items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-xs text-muted-foreground",
				children: i("posts.noFeaturedImage")
			}), /* @__PURE__ */ S("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ x(G, {
					type: "button",
					size: "sm",
					variant: "outline",
					onClick: () => o(!0),
					children: i(e > 0 ? "posts.changeFeaturedImage" : "posts.selectFeaturedImage")
				}), e > 0 ? /* @__PURE__ */ x(G, {
					type: "button",
					size: "sm",
					variant: "ghost",
					onClick: r,
					children: i("posts.removeFeaturedImage")
				}) : null]
			})]
		})]
	}), /* @__PURE__ */ x(Dp, {
		open: a,
		onOpenChange: o,
		onSelect: (e) => n(e)
	})] });
}
//#endregion
//#region src/components/ui/alert-dialog.tsx
function Ap({ ...e }) {
	return /* @__PURE__ */ x(ci, {
		"data-slot": "alert-dialog",
		...e
	});
}
function jp({ ...e }) {
	return /* @__PURE__ */ x(li, {
		"data-slot": "alert-dialog-portal",
		...e
	});
}
function Mp({ className: e, ...t }) {
	return /* @__PURE__ */ x(ui, {
		"data-slot": "alert-dialog-overlay",
		className: W("fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	});
}
function Np({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ x(kn, {
		allowBodyScroll: !0,
		children: /* @__PURE__ */ S(jp, { children: [/* @__PURE__ */ x(Mp, {}), /* @__PURE__ */ x(di, {
			"data-slot": "alert-dialog-content",
			"data-size": t,
			className: W("group/alert-dialog-content fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[size=sm]:max-w-xs data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[size=default]:sm:max-w-lg", e),
			...n
		})] })
	});
}
function Pp({ className: e, ...t }) {
	return /* @__PURE__ */ x("div", {
		"data-slot": "alert-dialog-header",
		className: W("grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-start sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]", e),
		...t
	});
}
function Fp({ className: e, ...t }) {
	return /* @__PURE__ */ x("div", {
		"data-slot": "alert-dialog-footer",
		className: W("flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end", e),
		...t
	});
}
function Ip({ className: e, ...t }) {
	return /* @__PURE__ */ x(mi, {
		"data-slot": "alert-dialog-title",
		className: W("text-lg font-semibold sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2", e),
		...t
	});
}
function Lp({ className: e, ...t }) {
	return /* @__PURE__ */ x(hi, {
		"data-slot": "alert-dialog-description",
		className: W("text-sm text-muted-foreground", e),
		...t
	});
}
function Rp({ className: e, variant: t = "default", size: n = "default", ...r }) {
	return /* @__PURE__ */ x(G, {
		variant: t,
		size: n,
		asChild: !0,
		children: /* @__PURE__ */ x(fi, {
			"data-slot": "alert-dialog-action",
			className: W(e),
			...r
		})
	});
}
function zp({ className: e, variant: t = "outline", size: n = "default", ...r }) {
	return /* @__PURE__ */ x(G, {
		variant: t,
		size: n,
		asChild: !0,
		children: /* @__PURE__ */ x(pi, {
			"data-slot": "alert-dialog-cancel",
			className: W(e),
			...r
		})
	});
}
//#endregion
//#region src/components/ui/textarea.tsx
function Bp({ className: e, ...t }) {
	return /* @__PURE__ */ x("textarea", {
		"data-slot": "textarea",
		className: W("flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-start shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40", e),
		...t
	});
}
//#endregion
//#region src/hooks/useQueryErrorToast.ts
function Vp(e) {
	let { t } = g(), n = p(!1);
	u(() => {
		e.isError && e.error ? n.current || (n.current = !0, _.error(lf(t, e.error))) : n.current = !1;
	}, [
		e.isError,
		e.error,
		e.fetchStatus,
		t
	]);
}
//#endregion
//#region ../Modules/coffee-profile-module/client/pages/CoffeeOriginEditorPage.tsx
function Hp() {
	return {
		name: "",
		slug: "",
		description: "",
		iso_code: "",
		thumbnail_id: 0,
		thumbnail_url: ""
	};
}
function Up() {
	let { t: r } = g(), i = n(), a = T(), o = !!w("/shop/coffee-origins/new"), { originId: s } = E(), c = !o && s ? parseInt(s, 10) : void 0, [l, d] = m(Hp), [f, p] = m(!0), [h, v] = m(!1), y = t({
		queryKey: ["coffee-origins", c],
		queryFn: () => Q(`shop/coffee-origins/${c}`),
		enabled: !o && !!c
	});
	Vp(y), u(() => {
		y.data && (d({
			name: y.data.name,
			slug: y.data.slug,
			description: y.data.description ?? "",
			iso_code: y.data.iso_code ?? "",
			thumbnail_id: y.data.thumbnail_id ?? 0,
			thumbnail_url: y.data.thumbnail_url ?? ""
		}), p(!1));
	}, [y.data]);
	let C = e({
		mutationFn: async () => {
			let e = {
				name: l.name.trim(),
				slug: l.slug.trim() || Cp(l.name),
				description: l.description,
				iso_code: l.iso_code.trim(),
				thumbnail_id: l.thumbnail_id > 0 ? l.thumbnail_id : 0
			};
			return o ? Q("shop/coffee-origins", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(e)
			}) : Q(`shop/coffee-origins/${c}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(e)
			});
		},
		onSuccess: (e) => {
			if (_.success(r("common.saved")), i.invalidateQueries({ queryKey: ["coffee-origins"] }), o) {
				let t = e;
				t.id && a(`/shop/coffee-origins/${t.id}`, { replace: !0 });
			}
		},
		onError: (e) => uf(r, e)
	}), ee = e({
		mutationFn: () => Q(`shop/coffee-origins/${c}`, { method: "DELETE" }),
		onSuccess: () => {
			_.success(r("common.deleted")), i.invalidateQueries({ queryKey: ["coffee-origins"] }), a("/shop/coffee-origins", { replace: !0 });
		},
		onError: (e) => uf(r, e)
	}), D = {
		id: c ?? 0,
		name: l.name,
		slug: l.slug,
		description: l.description,
		count: 0,
		iso_code: l.iso_code,
		flag_emoji: "",
		flag_url: "",
		thumbnail_id: l.thumbnail_id || null,
		thumbnail_url: l.thumbnail_url,
		url: ""
	};
	return /* @__PURE__ */ S(rp, {
		title: r(o ? "coffeeProfile.originNewTitle" : "coffeeProfile.originEditTitle"),
		children: [
			/* @__PURE__ */ S("div", {
				className: "mb-4 flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ x(G, {
					type: "button",
					variant: "outline",
					size: "sm",
					onClick: () => a("/shop/coffee-origins"),
					children: r("common.back")
				}), /* @__PURE__ */ S("div", {
					className: "flex flex-wrap gap-2",
					children: [o ? null : /* @__PURE__ */ S(G, {
						type: "button",
						variant: "destructive",
						size: "sm",
						onClick: () => v(!0),
						children: [/* @__PURE__ */ x(Jd, { className: "me-1 size-4" }), r("common.delete")]
					}), /* @__PURE__ */ x(G, {
						type: "button",
						size: "sm",
						disabled: !l.name.trim() || C.isPending,
						onClick: () => void C.mutateAsync(),
						children: r("common.save")
					})]
				})]
			}),
			/* @__PURE__ */ x(K, {
				className: "shadow-sm",
				children: /* @__PURE__ */ x(Y, {
					className: "space-y-6 pt-6",
					children: !o && y.isLoading ? /* @__PURE__ */ S("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ x(Sp, { className: "h-10 w-full max-w-md" }), /* @__PURE__ */ x(Sp, { className: "h-10 w-full max-w-md" })]
					}) : /* @__PURE__ */ S(b, { children: [
						/* @__PURE__ */ S("div", {
							className: "grid gap-4 md:grid-cols-2",
							children: [
								/* @__PURE__ */ S("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ x(Z, {
										htmlFor: "origin-name",
										children: r("coffeeProfile.fieldName")
									}), /* @__PURE__ */ x(X, {
										id: "origin-name",
										value: l.name,
										onChange: (e) => d({
											...l,
											name: e.target.value
										}),
										onBlur: () => {
											f && l.name.trim() && d((e) => ({
												...e,
												slug: Cp(e.name)
											}));
										}
									})]
								}),
								/* @__PURE__ */ S("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ x(Z, {
										htmlFor: "origin-slug",
										children: r("coffeeProfile.fieldSlug")
									}), /* @__PURE__ */ x(X, {
										id: "origin-slug",
										value: l.slug,
										onChange: (e) => {
											p(!1), d({
												...l,
												slug: e.target.value
											});
										}
									})]
								}),
								/* @__PURE__ */ S("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ x(Z, {
											htmlFor: "origin-iso",
											children: r("coffeeProfile.fieldIso")
										}),
										/* @__PURE__ */ x(X, {
											id: "origin-iso",
											maxLength: 2,
											value: l.iso_code,
											onChange: (e) => d({
												...l,
												iso_code: e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2)
											}),
											placeholder: "ET",
											className: "max-w-[6rem] font-mono uppercase"
										}),
										/* @__PURE__ */ x("p", {
											className: "text-muted-foreground text-xs",
											children: r("coffeeProfile.fieldIsoHint")
										})
									]
								}),
								/* @__PURE__ */ S("div", {
									className: "flex items-end gap-3 pb-1",
									children: [/* @__PURE__ */ x(Lf, { origin: D }), /* @__PURE__ */ x("span", {
										className: "text-muted-foreground text-sm",
										children: r("coffeeProfile.flagPreview")
									})]
								})
							]
						}),
						/* @__PURE__ */ S("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ x(Z, {
								htmlFor: "origin-desc",
								children: r("coffeeProfile.fieldDescription")
							}), /* @__PURE__ */ x(Bp, {
								id: "origin-desc",
								value: l.description,
								onChange: (e) => d({
									...l,
									description: e.target.value
								}),
								rows: 3
							})]
						}),
						/* @__PURE__ */ S("div", { children: [
							/* @__PURE__ */ x("p", {
								className: "mb-2 text-sm font-medium",
								children: r("coffeeProfile.fieldFlagImage")
							}),
							/* @__PURE__ */ x("p", {
								className: "text-muted-foreground mb-3 text-xs",
								children: r("coffeeProfile.fieldFlagImageHint")
							}),
							/* @__PURE__ */ x(kp, {
								imageId: l.thumbnail_id,
								imageUrl: l.thumbnail_url,
								onChange: (e) => d({
									...l,
									thumbnail_id: e.id,
									thumbnail_url: e.url
								}),
								onRemove: () => d({
									...l,
									thumbnail_id: 0,
									thumbnail_url: ""
								})
							})
						] })
					] })
				})
			}),
			/* @__PURE__ */ x(Ap, {
				open: h,
				onOpenChange: v,
				children: /* @__PURE__ */ S(Np, { children: [/* @__PURE__ */ S(Pp, { children: [/* @__PURE__ */ x(Ip, { children: r("coffeeProfile.originDeleteTitle") }), /* @__PURE__ */ x(Lp, { children: r("coffeeProfile.originDeleteConfirm", { name: l.name }) })] }), /* @__PURE__ */ S(Fp, { children: [/* @__PURE__ */ x(zp, { children: r("common.cancel") }), /* @__PURE__ */ x(Rp, {
					disabled: ee.isPending,
					onClick: () => void ee.mutateAsync(),
					children: r("common.delete")
				})] })] })
			})
		]
	});
}
//#endregion
//#region src/components/TableListSkeleton.tsx
function Wp({ rows: e = 6, columns: t = 4 }) {
	return /* @__PURE__ */ x("div", {
		className: "p-4 space-y-3",
		"aria-hidden": !0,
		children: Array.from({ length: e }).map((e, n) => /* @__PURE__ */ x("div", {
			className: "flex gap-2",
			children: Array.from({ length: t }).map((e, t) => /* @__PURE__ */ x(Sp, { className: "h-8 flex-1" }, t))
		}, n))
	});
}
//#endregion
//#region src/components/ui/table.tsx
function Gp({ className: e, ...t }) {
	return /* @__PURE__ */ x("div", {
		"data-slot": "table-container",
		className: "relative w-full overflow-x-auto",
		children: /* @__PURE__ */ x("table", {
			"data-slot": "table",
			className: W("w-full caption-bottom text-sm", e),
			...t
		})
	});
}
function Kp({ className: e, ...t }) {
	return /* @__PURE__ */ x("thead", {
		"data-slot": "table-header",
		className: W("[&_tr]:border-b", e),
		...t
	});
}
function qp({ className: e, ...t }) {
	return /* @__PURE__ */ x("tbody", {
		"data-slot": "table-body",
		className: W("[&_tr:last-child]:border-0", e),
		...t
	});
}
function Jp({ className: e, ...t }) {
	return /* @__PURE__ */ x("tr", {
		"data-slot": "table-row",
		className: W("border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted", e),
		...t
	});
}
function Yp({ className: e, ...t }) {
	return /* @__PURE__ */ x("th", {
		"data-slot": "table-head",
		className: W("h-10 px-2 text-start align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]", e),
		...t
	});
}
function Xp({ className: e, ...t }) {
	return /* @__PURE__ */ x("td", {
		"data-slot": "table-cell",
		className: W("p-2 text-start align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]", e),
		...t
	});
}
//#endregion
//#region src/lib/formatNumber.ts
function Zp(e, t) {
	let n = Number.isFinite(e) ? e : 0, r = Uf(t) ? "fa-IR" : "en-US", i = new Intl.NumberFormat(r, { maximumFractionDigits: 2 }).format(n);
	return Uf(t) ? Wf(i) : i;
}
//#endregion
//#region ../Modules/coffee-profile-module/client/pages/CoffeeOriginsPage.tsx
function Qp() {
	let { t: r, i18n: i } = g(), a = n(), [o, s] = m(""), [c, l] = m(""), [d, f] = m(null), [p, h] = m(null);
	u(() => {
		let e = window.setTimeout(() => l(o), 300);
		return () => window.clearTimeout(e);
	}, [o]);
	let v = t({
		queryKey: ["coffee-origins", c],
		queryFn: () => {
			let e = new URLSearchParams();
			c.trim() && e.set("search", c.trim());
			let t = e.toString();
			return Q(`shop/coffee-origins${t ? `?${t}` : ""}`);
		}
	});
	Vp(v);
	let y = e({
		mutationFn: (e) => (f(e), Q(`shop/coffee-origins/${e}`, { method: "DELETE" })),
		onSuccess: () => {
			_.success(r("common.deleted")), a.invalidateQueries({ queryKey: ["coffee-origins"] });
		},
		onError: (e) => uf(r, e),
		onSettled: () => {
			f(null), h(null);
		}
	}), b = v.data?.items ?? [], w = v.data?.found ?? 0, T = b.find((e) => e.id === p);
	return /* @__PURE__ */ S(rp, {
		title: r("coffeeProfile.originsTitle"),
		description: r("coffeeProfile.originsHint"),
		children: [
			/* @__PURE__ */ x("div", {
				className: "mb-4 flex flex-wrap items-center justify-end gap-2",
				children: /* @__PURE__ */ x(G, {
					asChild: !0,
					size: "sm",
					children: /* @__PURE__ */ S(C, {
						to: "/shop/coffee-origins/new",
						children: [/* @__PURE__ */ x(Gd, { className: "size-4" }), r("coffeeProfile.originAdd")]
					})
				})
			}),
			/* @__PURE__ */ x(K, {
				className: "mb-4 shadow-sm",
				children: /* @__PURE__ */ S(Y, {
					className: "pt-6",
					children: [/* @__PURE__ */ S("div", {
						className: "relative min-w-[200px] max-w-md",
						children: [/* @__PURE__ */ x(Kd, {
							className: "text-muted-foreground pointer-events-none absolute top-2.5 start-3 size-4",
							"aria-hidden": !0
						}), /* @__PURE__ */ x(X, {
							className: "ps-9",
							placeholder: r("coffeeProfile.originSearch"),
							value: o,
							onChange: (e) => s(e.target.value)
						})]
					}), w > 0 ? /* @__PURE__ */ x("p", {
						className: "text-muted-foreground mt-3 text-sm",
						children: r("coffeeProfile.originFound", { count: Zp(w, i.language) })
					}) : null]
				})
			}),
			/* @__PURE__ */ x(K, {
				className: "shadow-sm",
				children: /* @__PURE__ */ x(Y, {
					className: "overflow-x-auto p-0",
					children: v.isLoading ? /* @__PURE__ */ x(Wp, {
						rows: 8,
						columns: 5
					}) : /* @__PURE__ */ S(Gp, { children: [/* @__PURE__ */ x(Kp, { children: /* @__PURE__ */ S(Jp, { children: [
						/* @__PURE__ */ x(Yp, {
							className: "w-14",
							children: r("coffeeProfile.colFlag")
						}),
						/* @__PURE__ */ x(Yp, { children: r("coffeeProfile.colName") }),
						/* @__PURE__ */ x(Yp, { children: r("coffeeProfile.colIso") }),
						/* @__PURE__ */ x(Yp, { children: r("coffeeProfile.colCount") }),
						/* @__PURE__ */ x(Yp, {
							className: "w-28",
							children: r("coffeeProfile.colActions")
						})
					] }) }), /* @__PURE__ */ x(qp, { children: b.length === 0 ? /* @__PURE__ */ x(Jp, { children: /* @__PURE__ */ x(Xp, {
						colSpan: 5,
						className: "text-muted-foreground py-8 text-center text-sm",
						children: r("coffeeProfile.originEmpty")
					}) }) : b.map((e) => /* @__PURE__ */ S(Jp, { children: [
						/* @__PURE__ */ x(Xp, { children: /* @__PURE__ */ x(Lf, { origin: e }) }),
						/* @__PURE__ */ x(Xp, {
							className: "font-medium",
							children: /* @__PURE__ */ x(C, {
								to: `/shop/coffee-origins/${e.id}`,
								className: "hover:underline",
								children: e.name
							})
						}),
						/* @__PURE__ */ x(Xp, {
							className: "font-mono text-xs",
							children: e.iso_code || "—"
						}),
						/* @__PURE__ */ x(Xp, { children: Zp(e.count, i.language) }),
						/* @__PURE__ */ x(Xp, { children: /* @__PURE__ */ S("div", {
							className: "flex gap-1",
							children: [/* @__PURE__ */ x(G, {
								asChild: !0,
								size: "icon",
								variant: "ghost",
								className: "size-8",
								children: /* @__PURE__ */ x(C, {
									to: `/shop/coffee-origins/${e.id}`,
									children: /* @__PURE__ */ x(Wd, { className: "size-4" })
								})
							}), /* @__PURE__ */ x(G, {
								type: "button",
								size: "icon",
								variant: "ghost",
								className: "size-8",
								disabled: d === e.id,
								onClick: () => h(e.id),
								children: /* @__PURE__ */ x(Jd, { className: "size-4" })
							})]
						}) })
					] }, e.id)) })] })
				})
			}),
			/* @__PURE__ */ x(Ap, {
				open: p != null,
				onOpenChange: (e) => !e && h(null),
				children: /* @__PURE__ */ S(Np, { children: [/* @__PURE__ */ S(Pp, { children: [/* @__PURE__ */ x(Ip, { children: r("coffeeProfile.originDeleteTitle") }), /* @__PURE__ */ x(Lp, { children: r("coffeeProfile.originDeleteConfirm", { name: T?.name ?? "" }) })] }), /* @__PURE__ */ S(Fp, { children: [/* @__PURE__ */ x(zp, { children: r("common.cancel") }), /* @__PURE__ */ x(Rp, {
					disabled: y.isPending || !p,
					onClick: () => p && void y.mutateAsync(p),
					children: r("common.delete")
				})] })] })
			})
		]
	});
}
//#endregion
//#region src/components/ui/tabs.tsx
function $p({ className: e, orientation: t = "horizontal", dir: n, ...r }) {
	let i = Yf();
	return /* @__PURE__ */ x(tu, {
		"data-slot": "tabs",
		"data-orientation": t,
		orientation: t,
		dir: n ?? i,
		className: W("group/tabs flex gap-2 data-[orientation=horizontal]:flex-col", e),
		...r
	});
}
var em = te("group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none", {
	variants: { variant: {
		default: "bg-muted",
		line: "gap-1 bg-transparent"
	} },
	defaultVariants: { variant: "default" }
});
function tm({ className: e, variant: t = "default", dir: n, ...r }) {
	let i = Yf();
	return /* @__PURE__ */ x(nu, {
		"data-slot": "tabs-list",
		"data-variant": t,
		dir: n ?? i,
		className: W(em({ variant: t }), e),
		...r
	});
}
function nm({ className: e, ...t }) {
	return /* @__PURE__ */ x(ru, {
		"data-slot": "tabs-trigger",
		className: W("relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent", "data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground", "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:inset-inline-end-0 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100", e),
		...t
	});
}
function rm({ className: e, ...t }) {
	return /* @__PURE__ */ x(iu, {
		"data-slot": "tabs-content",
		className: W("flex-1 outline-none", e),
		...t
	});
}
//#endregion
//#region src/components/ui/badge.tsx
var im = te("inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3", {
	variants: { variant: {
		default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
		secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
		destructive: "bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
		outline: "border-primary/30 text-foreground [a&]:hover:bg-primary [a&]:hover:text-primary-foreground",
		ghost: "[a&]:hover:bg-primary/10 [a&]:hover:text-primary",
		link: "text-primary underline-offset-4 [a&]:hover:underline"
	} },
	defaultVariants: { variant: "default" }
});
function am({ className: e, variant: t = "default", asChild: n = !1, ...r }) {
	return /* @__PURE__ */ x(n ? xl : "span", {
		"data-slot": "badge",
		"data-variant": t,
		className: W(im({ variant: t }), e),
		...r
	});
}
//#endregion
//#region src/components/coupons/ProductMultiSelect.tsx
function om({ id: e, label: n, value: r, onChange: i }) {
	let { t: a } = g(), [o, s] = m(""), [c, l] = m(""), [d, f] = m({});
	u(() => {
		let e = window.setTimeout(() => l(o), 300);
		return () => window.clearTimeout(e);
	}, [o]);
	let p = t({
		queryKey: [
			"products",
			"search",
			c
		],
		queryFn: () => Q(`shop/products?page=1&per_page=20${c.trim() ? `&search=${encodeURIComponent(c.trim())}` : ""}`),
		enabled: c.trim().length >= 1
	});
	function h(e) {
		r.includes(e.id) || (f((t) => ({
			...t,
			[e.id]: e.name
		})), i([...r, e.id]), s(""), l(""));
	}
	function _(e) {
		i(r.filter((t) => t !== e));
	}
	return /* @__PURE__ */ S("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ x(Z, {
				htmlFor: e,
				children: n
			}),
			/* @__PURE__ */ x(X, {
				id: e,
				value: o,
				onChange: (e) => s(e.target.value),
				placeholder: a("coupons.productSearchPlaceholder")
			}),
			p.isFetching && c ? /* @__PURE__ */ x("p", {
				className: "text-muted-foreground text-xs",
				children: a("common.loading")
			}) : null,
			p.data?.items && c ? /* @__PURE__ */ x("div", {
				className: "max-h-32 overflow-y-auto rounded-md border border-border p-1 text-sm",
				children: p.data.items.length === 0 ? /* @__PURE__ */ x("p", {
					className: "text-muted-foreground p-2",
					children: a("coupons.noProductsFound")
				}) : p.data.items.map((e) => /* @__PURE__ */ S("button", {
					type: "button",
					className: "hover:bg-muted block w-full rounded px-2 py-1.5 text-start",
					onClick: () => h(e),
					children: [
						e.name,
						" ",
						/* @__PURE__ */ S("span", {
							className: "text-muted-foreground",
							children: ["#", e.id]
						})
					]
				}, e.id))
			}) : null,
			r.length > 0 ? /* @__PURE__ */ x("div", {
				className: "flex flex-wrap gap-1",
				children: r.map((e) => /* @__PURE__ */ S(am, {
					variant: "secondary",
					className: "gap-1 pe-1",
					children: [d[e] ? `${d[e]} (#${e})` : `#${e}`, /* @__PURE__ */ S(G, {
						type: "button",
						size: "icon",
						variant: "ghost",
						className: "size-5",
						onClick: () => _(e),
						children: [/* @__PURE__ */ x(Yd, { className: "size-3" }), /* @__PURE__ */ x("span", {
							className: "sr-only",
							children: a("common.delete")
						})]
					})]
				}, e))
			}) : null
		]
	});
}
//#endregion
//#region ../Modules/coffee-profile-module/client/components/CoffeeBlendSettingsPanel.tsx
function sm() {
	let { t: n } = g(), [r, i] = m(null), a = t({
		queryKey: ["coffee-blend-settings"],
		queryFn: () => Q("shop/coffee-blend/settings")
	});
	Vp(a), u(() => {
		a.data?.settings && i(a.data.settings);
	}, [a.data]);
	let o = e({
		mutationFn: (e) => Q("shop/coffee-blend/settings", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ settings: e })
		}),
		onSuccess: (e) => {
			_.success(n("common.saved")), e.settings && i(e.settings);
		},
		onError: (e) => uf(n, e)
	});
	if (!r) return /* @__PURE__ */ x("p", {
		className: "text-muted-foreground text-sm",
		children: n("common.loading")
	});
	function s(e, t) {
		i((n) => n && {
			...n,
			[e]: t
		});
	}
	return /* @__PURE__ */ S("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ x("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ x(G, {
					type: "button",
					size: "sm",
					disabled: o.isPending,
					onClick: () => void o.mutateAsync(r),
					children: n("common.save")
				})
			}),
			/* @__PURE__ */ S(K, { children: [/* @__PURE__ */ x(q, { children: /* @__PURE__ */ x(J, { children: n("coffeeProfile.blendSectionCatalog") }) }), /* @__PURE__ */ S(Y, {
				className: "grid gap-4 md:grid-cols-2",
				children: [
					/* @__PURE__ */ x("p", {
						className: "text-muted-foreground md:col-span-2 text-sm",
						children: n("coffeeProfile.blendShortcodeHint")
					}),
					/* @__PURE__ */ x("p", {
						className: "text-muted-foreground md:col-span-2 text-sm",
						children: n("coffeeProfile.searchShortcodeHint")
					}),
					/* @__PURE__ */ S("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ x(Z, { children: n("coffeeProfile.blendSource") }), /* @__PURE__ */ S(Xf, {
							value: r.source,
							onValueChange: (e) => i({
								...r,
								source: e
							}),
							children: [/* @__PURE__ */ x(Qf, { children: /* @__PURE__ */ x(Zf, {}) }), /* @__PURE__ */ S($f, { children: [
								/* @__PURE__ */ x($, {
									value: "profile",
									children: n("coffeeProfile.blendSourceProfile")
								}),
								/* @__PURE__ */ x($, {
									value: "category",
									children: n("coffeeProfile.blendSourceCategory")
								}),
								/* @__PURE__ */ x($, {
									value: "products",
									children: n("coffeeProfile.blendSourceProducts")
								})
							] })]
						})]
					}),
					/* @__PURE__ */ S("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ x(Z, { children: n("coffeeProfile.blendMode") }), /* @__PURE__ */ S(Xf, {
							value: r.default_mode,
							onValueChange: (e) => i({
								...r,
								default_mode: e
							}),
							children: [/* @__PURE__ */ x(Qf, { children: /* @__PURE__ */ x(Zf, {}) }), /* @__PURE__ */ S($f, { children: [
								/* @__PURE__ */ x($, {
									value: "both",
									children: n("coffeeProfile.blendModeBoth")
								}),
								/* @__PURE__ */ x($, {
									value: "simple",
									children: n("coffeeProfile.blendModeSimple")
								}),
								/* @__PURE__ */ x($, {
									value: "advanced",
									children: n("coffeeProfile.blendModeAdvanced")
								})
							] })]
						})]
					}),
					r.source === "category" ? /* @__PURE__ */ S("div", {
						className: "space-y-2 md:col-span-2",
						children: [/* @__PURE__ */ x(Z, { children: n("coffeeProfile.blendCategoryIds") }), /* @__PURE__ */ x(X, {
							value: r.category_ids.join(", "),
							onChange: (e) => i({
								...r,
								category_ids: e.target.value.split(/[,\s]+/).map((e) => Number(e)).filter((e) => e > 0)
							})
						})]
					}) : null,
					r.source === "products" ? /* @__PURE__ */ x("div", {
						className: "md:col-span-2",
						children: /* @__PURE__ */ x(om, {
							id: "blend-products",
							label: n("coffeeProfile.blendProductIds"),
							value: r.product_ids,
							onChange: (e) => i({
								...r,
								product_ids: e
							})
						})
					}) : null,
					/* @__PURE__ */ S("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ x(Z, { children: n("coffeeProfile.blendMinBeans") }), /* @__PURE__ */ x(X, {
							type: "number",
							min: 1,
							value: r.min_beans,
							onChange: (e) => i({
								...r,
								min_beans: Number(e.target.value) || 1
							})
						})]
					}),
					/* @__PURE__ */ S("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ x(Z, { children: n("coffeeProfile.blendMaxBeans") }), /* @__PURE__ */ x(X, {
							type: "number",
							min: 1,
							value: r.max_beans,
							onChange: (e) => i({
								...r,
								max_beans: Number(e.target.value) || 2
							})
						})]
					})
				]
			})] }),
			/* @__PURE__ */ S(K, { children: [/* @__PURE__ */ x(q, { children: /* @__PURE__ */ x(J, { children: n("coffeeProfile.blendSectionPrice") }) }), /* @__PURE__ */ S(Y, {
				className: "grid gap-4 md:grid-cols-2",
				children: [
					/* @__PURE__ */ S("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ x(Z, { children: n("coffeeProfile.blendPriceBasis") }), /* @__PURE__ */ S(Xf, {
							value: r.price_basis,
							onValueChange: (e) => i({
								...r,
								price_basis: e
							}),
							children: [/* @__PURE__ */ x(Qf, { children: /* @__PURE__ */ x(Zf, {}) }), /* @__PURE__ */ S($f, { children: [/* @__PURE__ */ x($, {
								value: "per_kg",
								children: n("coffeeProfile.blendPricePerKg")
							}), /* @__PURE__ */ x($, {
								value: "pack",
								children: n("coffeeProfile.blendPricePack")
							})] })]
						})]
					}),
					/* @__PURE__ */ S("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ x(Z, { children: n("coffeeProfile.blendDefaultPack") }), /* @__PURE__ */ x(X, {
							type: "number",
							value: r.default_pack_weight_g,
							onChange: (e) => i({
								...r,
								default_pack_weight_g: Number(e.target.value) || 1e3
							})
						})]
					}),
					/* @__PURE__ */ S("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ x(Z, { children: n("coffeeProfile.blendGrindFee") }), /* @__PURE__ */ x(X, {
							type: "number",
							value: r.grind_fee,
							onChange: (e) => i({
								...r,
								grind_fee: Number(e.target.value) || 0
							})
						})]
					}),
					/* @__PURE__ */ S("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ x(Z, { children: n("coffeeProfile.blendWeights") }), /* @__PURE__ */ x(X, {
							value: r.weights.join(", "),
							onChange: (e) => i({
								...r,
								weights: e.target.value.split(/[,\s]+/).map((e) => Number(e)).filter((e) => e >= 10)
							})
						})]
					}),
					/* @__PURE__ */ S("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ x(Z, { children: n("coffeeProfile.blendHolder") }),
							/* @__PURE__ */ x(X, {
								type: "number",
								value: r.holder_product_id || "",
								onChange: (e) => i({
									...r,
									holder_product_id: Number(e.target.value) || 0
								})
							}),
							/* @__PURE__ */ x("p", {
								className: "text-muted-foreground text-xs",
								children: n("coffeeProfile.blendHolderHint")
							})
						]
					})
				]
			})] }),
			/* @__PURE__ */ S(K, { children: [/* @__PURE__ */ x(q, { children: /* @__PURE__ */ x(J, { children: n("coffeeProfile.blendSectionSimple") }) }), /* @__PURE__ */ S(Y, {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ x(om, {
					id: "blend-robusta",
					label: n("coffeeProfile.blendRobustaProduct"),
					value: r.robusta_product_id ? [r.robusta_product_id] : [],
					onChange: (e) => i({
						...r,
						robusta_product_id: e[e.length - 1] ?? 0
					})
				}), /* @__PURE__ */ x(om, {
					id: "blend-arabica",
					label: n("coffeeProfile.blendArabicaProduct"),
					value: r.arabica_product_id ? [r.arabica_product_id] : [],
					onChange: (e) => i({
						...r,
						arabica_product_id: e[e.length - 1] ?? 0
					})
				})]
			})] }),
			/* @__PURE__ */ x(cm, {
				title: n("coffeeProfile.blendRoasts"),
				items: r.roasts,
				onChange: (e) => s("roasts", e)
			}),
			/* @__PURE__ */ x(cm, {
				title: n("coffeeProfile.blendDevices"),
				items: r.grind_devices,
				onChange: (e) => s("grind_devices", e)
			}),
			/* @__PURE__ */ S(K, { children: [/* @__PURE__ */ S(q, {
				className: "flex flex-row items-center justify-between",
				children: [/* @__PURE__ */ x(J, { children: n("coffeeProfile.blendSuggestions") }), /* @__PURE__ */ S(G, {
					type: "button",
					size: "sm",
					variant: "outline",
					onClick: () => i({
						...r,
						suggestions: [...r.suggestions, {
							id: `s_${Date.now()}`,
							label: "",
							arabica: 80,
							robusta: 20,
							hint: ""
						}]
					}),
					children: [/* @__PURE__ */ x(Gd, { className: "size-4" }), n("coffeeProfile.addLevel")]
				})]
			}), /* @__PURE__ */ x(Y, {
				className: "space-y-3",
				children: r.suggestions.map((e, t) => /* @__PURE__ */ S("div", {
					className: "grid gap-2 md:grid-cols-5",
					children: [
						/* @__PURE__ */ x(X, {
							value: e.label,
							placeholder: n("coffeeProfile.blendSuggestLabel"),
							onChange: (e) => c(t, { label: e.target.value })
						}),
						/* @__PURE__ */ x(X, {
							type: "number",
							value: e.arabica,
							onChange: (e) => c(t, { arabica: Number(e.target.value) || 0 })
						}),
						/* @__PURE__ */ x(X, {
							type: "number",
							value: e.robusta,
							onChange: (e) => c(t, { robusta: Number(e.target.value) || 0 })
						}),
						/* @__PURE__ */ x(X, {
							className: "md:col-span-2",
							value: e.hint,
							placeholder: n("coffeeProfile.blendSuggestHint"),
							onChange: (e) => c(t, { hint: e.target.value })
						})
					]
				}, `${e.id}-${t}`))
			})] }),
			/* @__PURE__ */ S(K, { children: [/* @__PURE__ */ S(q, {
				className: "flex flex-row items-center justify-between",
				children: [/* @__PURE__ */ x(J, { children: n("coffeeProfile.blendGuide") }), /* @__PURE__ */ S(G, {
					type: "button",
					size: "sm",
					variant: "outline",
					onClick: () => i({
						...r,
						guide: [...r.guide, {
							title: "",
							body: ""
						}]
					}),
					children: [/* @__PURE__ */ x(Gd, { className: "size-4" }), n("coffeeProfile.addLevel")]
				})]
			}), /* @__PURE__ */ x(Y, {
				className: "space-y-3",
				children: r.guide.map((e, t) => /* @__PURE__ */ S("div", {
					className: "space-y-2 rounded-md border p-3",
					children: [/* @__PURE__ */ S("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ x(X, {
							value: e.title,
							onChange: (e) => l(t, { title: e.target.value })
						}), /* @__PURE__ */ x(G, {
							type: "button",
							size: "icon",
							variant: "ghost",
							onClick: () => i({
								...r,
								guide: r.guide.filter((e, n) => n !== t)
							}),
							children: /* @__PURE__ */ x(Jd, { className: "size-4" })
						})]
					}), /* @__PURE__ */ x("textarea", {
						className: "border-input min-h-20 w-full rounded-md border bg-transparent p-2 text-sm",
						value: e.body,
						onChange: (e) => l(t, { body: e.target.value })
					})]
				}, `g-${t}`))
			})] })
		]
	});
	function c(e, t) {
		i((n) => n && {
			...n,
			suggestions: n.suggestions.map((n, r) => r === e ? {
				...n,
				...t
			} : n)
		});
	}
	function l(e, t) {
		i((n) => n && {
			...n,
			guide: n.guide.map((n, r) => r === e ? {
				...n,
				...t
			} : n)
		});
	}
}
function cm({ title: e, items: t, onChange: n }) {
	let { t: r } = g();
	return /* @__PURE__ */ S(K, { children: [/* @__PURE__ */ S(q, {
		className: "flex flex-row items-center justify-between",
		children: [/* @__PURE__ */ x(J, { children: e }), /* @__PURE__ */ S(G, {
			type: "button",
			size: "sm",
			variant: "outline",
			onClick: () => n([...t, {
				id: `item_${Date.now()}`,
				label: ""
			}]),
			children: [/* @__PURE__ */ x(Gd, { className: "size-4" }), r("coffeeProfile.addLevel")]
		})]
	}), /* @__PURE__ */ x(Y, {
		className: "space-y-2",
		children: t.map((e, r) => /* @__PURE__ */ S("div", {
			className: "flex gap-2",
			children: [
				/* @__PURE__ */ x(X, {
					className: "max-w-[9rem] font-mono text-xs",
					value: e.id,
					onChange: (e) => n(t.map((t, n) => n === r ? {
						...t,
						id: e.target.value
					} : t))
				}),
				/* @__PURE__ */ x(X, {
					className: "flex-1",
					value: e.label,
					onChange: (e) => n(t.map((t, n) => n === r ? {
						...t,
						label: e.target.value
					} : t))
				}),
				/* @__PURE__ */ x(G, {
					type: "button",
					size: "icon",
					variant: "ghost",
					onClick: () => n(t.filter((e, t) => t !== r)),
					children: /* @__PURE__ */ x(Jd, { className: "size-4" })
				})
			]
		}, `${e.id}-${r}`))
	})] });
}
//#endregion
//#region ../Modules/coffee-profile-module/client/components/CoffeeProfilePreview.tsx
function lm(e, t, n) {
	let r = n - t;
	return r <= 0 ? 0 : Math.max(0, Math.min(100, (e - t) / r * 100));
}
function um({ settings: e, profile: t }) {
	let { t: n } = g(), r = e.colors, i = {
		background: r.card_bg,
		color: r.card_text,
		border: `1px solid ${r.card_border}`,
		borderRadius: e.radius,
		padding: e.gap,
		display: "grid",
		gap: e.gap,
		fontFamily: "inherit"
	}, a = {
		fontSize: e.font_label,
		color: r.label
	}, o = {
		fontSize: e.font_title,
		fontWeight: 700,
		margin: 0,
		color: r.card_text
	}, s = {
		fontSize: e.font_value,
		fontWeight: 700,
		color: r.value
	}, c = t.blend_robusta, l = t.blend_arabica, u = Math.max(1, c + l);
	return /* @__PURE__ */ S("div", {
		style: i,
		dir: "rtl",
		children: [
			/* @__PURE__ */ S("div", { children: [
				/* @__PURE__ */ x("p", {
					style: o,
					children: n("coffeeProfile.blend")
				}),
				/* @__PURE__ */ S("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						margin: "6px 0",
						...a
					},
					children: [/* @__PURE__ */ S("span", { children: [
						e.robusta_label,
						" ",
						/* @__PURE__ */ S("strong", {
							style: s,
							children: [c, "٪"]
						})
					] }), /* @__PURE__ */ S("span", { children: [
						e.arabica_label,
						" ",
						/* @__PURE__ */ S("strong", {
							style: s,
							children: [l, "٪"]
						})
					] })]
				}),
				/* @__PURE__ */ x(dm, {
					track: r.track,
					fill: r.blend_fill,
					height: e.bar_height,
					width: 100 * c / u
				})
			] }),
			/* @__PURE__ */ S("div", { children: [/* @__PURE__ */ x("p", {
				style: o,
				children: n("coffeeProfile.acidity")
			}), /* @__PURE__ */ S("div", {
				style: {
					position: "relative",
					padding: "22px 0 18px"
				},
				children: [/* @__PURE__ */ x("div", { style: {
					position: "absolute",
					insetInline: 8,
					top: "50%",
					height: e.stroke_width,
					background: r.acidity_line,
					transform: "translateY(-50%)"
				} }), /* @__PURE__ */ x("div", {
					style: {
						position: "relative",
						display: "grid",
						gridTemplateColumns: `repeat(${Math.max(1, e.acidity_levels.length)}, minmax(0,1fr))`
					},
					children: e.acidity_levels.map((n) => /* @__PURE__ */ S("div", {
						style: {
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 4,
							textAlign: "center"
						},
						children: [
							/* @__PURE__ */ x("span", {
								style: {
									...a,
									maxWidth: "100%",
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap"
								},
								children: n.label
							}),
							/* @__PURE__ */ x("span", { style: {
								width: 12,
								height: 12,
								borderRadius: 99,
								background: r.acidity_dot,
								boxShadow: `0 0 0 2px ${r.acidity_dot}`,
								border: `2px solid ${r.card_bg}`
							} }),
							/* @__PURE__ */ x("span", {
								style: s,
								children: t.acidity[n.id] ?? e.scale_min
							})
						]
					}, n.id))
				})]
			})] }),
			/* @__PURE__ */ S("div", { children: [
				/* @__PURE__ */ x("p", {
					style: o,
					children: n("coffeeProfile.caffeine")
				}),
				/* @__PURE__ */ S("p", {
					style: {
						...s,
						margin: "6px 0"
					},
					children: [
						t.caffeine_mg,
						" ",
						e.caffeine_unit
					]
				}),
				/* @__PURE__ */ x(dm, {
					track: r.track,
					fill: r.caffeine_fill,
					height: e.bar_height,
					width: Math.min(100, 100 * t.caffeine_mg / Math.max(1, e.caffeine_max))
				})
			] }),
			[
				[
					"bitterness",
					n("coffeeProfile.bitterness"),
					r.bitterness_fill
				],
				[
					"sweetness",
					n("coffeeProfile.sweetness"),
					r.sweetness_fill
				],
				[
					"body",
					n("coffeeProfile.body"),
					r.body_fill
				]
			].map(([n, i, a]) => {
				let c = t[n], l = lm(c, e.scale_min, e.scale_max);
				return /* @__PURE__ */ S("div", { children: [/* @__PURE__ */ S("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "baseline"
					},
					children: [/* @__PURE__ */ x("p", {
						style: o,
						children: i
					}), /* @__PURE__ */ x("span", {
						style: s,
						children: c
					})]
				}), /* @__PURE__ */ S("div", {
					style: {
						position: "relative",
						marginTop: 6
					},
					children: [/* @__PURE__ */ x(dm, {
						track: r.track,
						fill: a,
						height: e.bar_height,
						width: l
					}), /* @__PURE__ */ x("span", { style: {
						position: "absolute",
						top: "50%",
						insetInlineStart: `${l}%`,
						width: e.bar_height + 6,
						height: e.bar_height + 6,
						borderRadius: 99,
						background: r.value,
						border: `2px solid ${r.card_bg}`,
						transform: "translate(-50%, -50%)"
					} })]
				})] }, n);
			})
		]
	});
}
function dm({ track: e, fill: t, height: n, width: r }) {
	return /* @__PURE__ */ x("div", {
		style: {
			height: n,
			background: e,
			borderRadius: 99,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ x("div", { style: {
			height: "100%",
			width: `${Math.max(0, Math.min(100, r))}%`,
			background: t,
			borderRadius: "inherit"
		} })
	});
}
//#endregion
//#region ../Modules/coffee-profile-module/client/pages/CoffeeProfileSettingsPage.tsx
var fm = [
	"card_bg",
	"card_text",
	"card_border",
	"track",
	"blend_fill",
	"acidity_line",
	"acidity_dot",
	"caffeine_fill",
	"bitterness_fill",
	"sweetness_fill",
	"body_fill",
	"label",
	"value"
];
function pm(e) {
	let t = {};
	return e.acidity_levels.forEach((n, r) => {
		t[n.id] = Math.min(e.scale_max, e.scale_min + 2 + r);
	}), {
		blend_robusta: 70,
		blend_arabica: 30,
		acidity: t,
		caffeine_mg: 80,
		bitterness: Math.min(e.scale_max, e.scale_min + 6),
		sweetness: Math.min(e.scale_max, e.scale_min + 5),
		body: Math.min(e.scale_max, e.scale_min + 7),
		pack_weight_g: 1e3,
		visible: {
			blend: !0,
			acidity: !0,
			caffeine: !0,
			bitterness: !0,
			sweetness: !0,
			body: !0,
			origin: !0
		},
		origin_ids: [],
		pack_weight_g: 1e3
	};
}
function mm() {
	let { t: n } = g(), [r, i] = m(null), a = t({
		queryKey: ["coffee-profile-settings"],
		queryFn: () => Q("shop/coffee-profile/settings")
	});
	Vp(a), u(() => {
		a.data?.settings && i(a.data.settings);
	}, [a.data]);
	let o = e({
		mutationFn: (e) => Q("shop/coffee-profile/settings", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ settings: e })
		}),
		onSuccess: (e) => {
			_.success(n("common.saved")), e.settings && i(e.settings);
		},
		onError: (e) => uf(n, e)
	}), s = f(() => r ? pm(r) : null, [r]);
	if (!r) return /* @__PURE__ */ x(rp, {
		title: n("coffeeProfile.settingsTitle"),
		children: /* @__PURE__ */ x("p", {
			className: "text-muted-foreground text-sm",
			children: n("common.loading")
		})
	});
	function c(e, t) {
		i((n) => {
			if (!n) return n;
			let r = n.acidity_levels.map((n, r) => r === e ? {
				...n,
				...t
			} : n);
			return {
				...n,
				acidity_levels: r
			};
		});
	}
	function l(e, t) {
		i((n) => {
			if (!n) return n;
			let r = [...n.acidity_levels], i = e + t;
			if (i < 0 || i >= r.length) return n;
			let a = r[e];
			return r[e] = r[i], r[i] = a, {
				...n,
				acidity_levels: r
			};
		});
	}
	function d(e, t, n) {
		i((r) => {
			if (!r) return r;
			let i = r[e].map((e, r) => r === t ? {
				...e,
				...n
			} : e);
			return {
				...r,
				[e]: i
			};
		});
	}
	function p(e, t, n) {
		i((r) => {
			if (!r) return r;
			let i = [...r[e]], a = t + n;
			if (a < 0 || a >= i.length) return r;
			let o = i[t];
			return i[t] = i[a], i[a] = o, {
				...r,
				[e]: i
			};
		});
	}
	function h(e, t) {
		if (!r) return null;
		let a = r[e];
		return /* @__PURE__ */ S(K, { children: [/* @__PURE__ */ S(q, {
			className: "flex flex-row items-center justify-between",
			children: [/* @__PURE__ */ x(J, { children: n(t) }), /* @__PURE__ */ S(G, {
				type: "button",
				size: "sm",
				variant: "outline",
				onClick: () => i({
					...r,
					[e]: [...a, {
						id: `${e}_${Date.now()}`,
						label: ""
					}]
				}),
				children: [/* @__PURE__ */ x(Gd, { className: "size-4" }), n("coffeeProfile.addLevel")]
			})]
		}), /* @__PURE__ */ x(Y, {
			className: "space-y-2",
			children: a.map((t, n) => /* @__PURE__ */ S("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ x(X, {
						className: "max-w-[8rem] font-mono text-xs",
						value: t.id,
						onChange: (t) => d(e, n, { id: t.target.value })
					}),
					/* @__PURE__ */ x(X, {
						className: "min-w-[8rem] flex-1",
						value: t.label,
						onChange: (t) => d(e, n, { label: t.target.value })
					}),
					/* @__PURE__ */ x(G, {
						type: "button",
						size: "icon",
						variant: "ghost",
						className: "size-8",
						onClick: () => p(e, n, -1),
						disabled: n === 0,
						children: /* @__PURE__ */ x(Bd, { className: "size-4" })
					}),
					/* @__PURE__ */ x(G, {
						type: "button",
						size: "icon",
						variant: "ghost",
						className: "size-8",
						onClick: () => p(e, n, 1),
						disabled: n === a.length - 1,
						children: /* @__PURE__ */ x(zd, { className: "size-4" })
					}),
					/* @__PURE__ */ x(G, {
						type: "button",
						size: "icon",
						variant: "ghost",
						className: "size-8",
						onClick: () => i({
							...r,
							[e]: a.filter((e, t) => t !== n)
						}),
						disabled: a.length <= 1,
						children: /* @__PURE__ */ x(Jd, { className: "size-4" })
					})
				]
			}, `${t.id}-${n}`))
		})] });
	}
	return /* @__PURE__ */ x(rp, {
		title: n("coffeeProfile.settingsTitle"),
		description: n("coffeeProfile.settingsHint"),
		children: /* @__PURE__ */ S($p, {
			defaultValue: "profile",
			className: "gap-4",
			children: [
				/* @__PURE__ */ S(tm, { children: [/* @__PURE__ */ x(nm, {
					value: "profile",
					children: n("coffeeProfile.tabProfile")
				}), /* @__PURE__ */ x(nm, {
					value: "blend",
					children: n("coffeeProfile.tabBlend")
				})] }),
				/* @__PURE__ */ S(rm, {
					value: "profile",
					children: [/* @__PURE__ */ x("div", {
						className: "mb-4 flex justify-end",
						children: /* @__PURE__ */ x(G, {
							type: "button",
							size: "sm",
							disabled: o.isPending,
							onClick: () => void o.mutateAsync(r),
							children: n("common.save")
						})
					}), /* @__PURE__ */ S("div", {
						className: "grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]",
						children: [/* @__PURE__ */ S("div", {
							className: "space-y-6",
							children: [
								/* @__PURE__ */ S(K, { children: [/* @__PURE__ */ x(q, { children: /* @__PURE__ */ x(J, { children: n("coffeeProfile.sectionGeneral") }) }), /* @__PURE__ */ S(Y, {
									className: "grid gap-4 md:grid-cols-2",
									children: [
										/* @__PURE__ */ S("div", {
											className: "space-y-2 md:col-span-2",
											children: [/* @__PURE__ */ x(Z, { children: n("coffeeProfile.placement") }), /* @__PURE__ */ S(Xf, {
												value: r.placement,
												onValueChange: (e) => i({
													...r,
													placement: e
												}),
												children: [/* @__PURE__ */ x(Qf, {
													className: "max-w-md",
													children: /* @__PURE__ */ x(Zf, {})
												}), /* @__PURE__ */ S($f, { children: [
													/* @__PURE__ */ x($, {
														value: "summary",
														children: n("coffeeProfile.placementSummary")
													}),
													/* @__PURE__ */ x($, {
														value: "before_cart",
														children: n("coffeeProfile.placementBeforeCart")
													}),
													/* @__PURE__ */ x($, {
														value: "after_cart",
														children: n("coffeeProfile.placementAfterCart")
													}),
													/* @__PURE__ */ x($, {
														value: "before_tabs",
														children: n("coffeeProfile.placementBeforeTabs")
													}),
													/* @__PURE__ */ x($, {
														value: "after_tabs",
														children: n("coffeeProfile.placementAfterTabs")
													}),
													/* @__PURE__ */ x($, {
														value: "none",
														children: n("coffeeProfile.placementNone")
													})
												] })]
											})]
										}),
										/* @__PURE__ */ S("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ x(Z, {
												htmlFor: "robusta-label",
												children: n("coffeeProfile.robustaLabel")
											}), /* @__PURE__ */ x(X, {
												id: "robusta-label",
												value: r.robusta_label,
												onChange: (e) => i({
													...r,
													robusta_label: e.target.value
												})
											})]
										}),
										/* @__PURE__ */ S("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ x(Z, {
												htmlFor: "arabica-label",
												children: n("coffeeProfile.arabicaLabel")
											}), /* @__PURE__ */ x(X, {
												id: "arabica-label",
												value: r.arabica_label,
												onChange: (e) => i({
													...r,
													arabica_label: e.target.value
												})
											})]
										}),
										/* @__PURE__ */ S("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ x(Z, {
												htmlFor: "caffeine-unit",
												children: n("coffeeProfile.caffeineUnit")
											}), /* @__PURE__ */ x(X, {
												id: "caffeine-unit",
												value: r.caffeine_unit,
												onChange: (e) => i({
													...r,
													caffeine_unit: e.target.value
												})
											})]
										}),
										/* @__PURE__ */ S("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ x(Z, {
												htmlFor: "caffeine-max",
												children: n("coffeeProfile.caffeineMax")
											}), /* @__PURE__ */ x(X, {
												id: "caffeine-max",
												type: "number",
												min: 1,
												value: r.caffeine_max,
												onChange: (e) => i({
													...r,
													caffeine_max: Number(e.target.value) || 1
												})
											})]
										}),
										/* @__PURE__ */ S("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ x(Z, {
												htmlFor: "scale-min",
												children: n("coffeeProfile.scaleMin")
											}), /* @__PURE__ */ x(X, {
												id: "scale-min",
												type: "number",
												value: r.scale_min,
												onChange: (e) => i({
													...r,
													scale_min: Number(e.target.value) || 0
												})
											})]
										}),
										/* @__PURE__ */ S("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ x(Z, {
												htmlFor: "scale-max",
												children: n("coffeeProfile.scaleMax")
											}), /* @__PURE__ */ x(X, {
												id: "scale-max",
												type: "number",
												value: r.scale_max,
												onChange: (e) => i({
													...r,
													scale_max: Number(e.target.value) || 1
												})
											})]
										}),
										/* @__PURE__ */ S("label", {
											className: "flex items-center gap-2 md:col-span-2",
											children: [/* @__PURE__ */ x(Xd, {
												checked: r.use_flagcdn,
												onCheckedChange: (e) => i({
													...r,
													use_flagcdn: e === !0
												})
											}), /* @__PURE__ */ x("span", {
												className: "text-sm",
												children: n("coffeeProfile.useFlagcdn")
											})]
										})
									]
								})] }),
								/* @__PURE__ */ S(K, { children: [/* @__PURE__ */ S(q, {
									className: "flex flex-row items-center justify-between",
									children: [/* @__PURE__ */ x(J, { children: n("coffeeProfile.acidityLevels") }), /* @__PURE__ */ S(G, {
										type: "button",
										size: "sm",
										variant: "outline",
										onClick: () => i({
											...r,
											acidity_levels: [...r.acidity_levels, {
												id: `level_${Date.now()}`,
												label: n("coffeeProfile.newLevel")
											}]
										}),
										children: [/* @__PURE__ */ x(Gd, { className: "size-4" }), n("coffeeProfile.addLevel")]
									})]
								}), /* @__PURE__ */ x(Y, {
									className: "space-y-2",
									children: r.acidity_levels.map((e, t) => /* @__PURE__ */ S("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [
											/* @__PURE__ */ x(X, {
												className: "max-w-[8rem] font-mono text-xs",
												value: e.id,
												onChange: (e) => c(t, { id: e.target.value })
											}),
											/* @__PURE__ */ x(X, {
												className: "min-w-[8rem] flex-1",
												value: e.label,
												onChange: (e) => c(t, { label: e.target.value })
											}),
											/* @__PURE__ */ x(G, {
												type: "button",
												size: "icon",
												variant: "ghost",
												className: "size-8",
												onClick: () => l(t, -1),
												disabled: t === 0,
												children: /* @__PURE__ */ x(Bd, { className: "size-4" })
											}),
											/* @__PURE__ */ x(G, {
												type: "button",
												size: "icon",
												variant: "ghost",
												className: "size-8",
												onClick: () => l(t, 1),
												disabled: t === r.acidity_levels.length - 1,
												children: /* @__PURE__ */ x(zd, { className: "size-4" })
											}),
											/* @__PURE__ */ x(G, {
												type: "button",
												size: "icon",
												variant: "ghost",
												className: "size-8",
												onClick: () => i({
													...r,
													acidity_levels: r.acidity_levels.filter((e, n) => n !== t)
												}),
												disabled: r.acidity_levels.length <= 1,
												children: /* @__PURE__ */ x(Jd, { className: "size-4" })
											})
										]
									}, `${e.id}-${t}`))
								})] }),
								h("grinds", "coffeeProfile.grindOptions"),
								h("roasts", "coffeeProfile.roastOptions"),
								/* @__PURE__ */ S(K, { children: [/* @__PURE__ */ x(q, { children: /* @__PURE__ */ x(J, { children: n("coffeeProfile.sectionStyle") }) }), /* @__PURE__ */ S(Y, {
									className: "grid gap-4 md:grid-cols-2",
									children: [fm.map((e) => /* @__PURE__ */ S("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ x("input", {
											type: "color",
											value: r.colors[e],
											onChange: (t) => i({
												...r,
												colors: {
													...r.colors,
													[e]: t.target.value
												}
											}),
											className: "size-8 cursor-pointer rounded border bg-transparent",
											"aria-label": n(`coffeeProfile.color.${e}`)
										}), /* @__PURE__ */ S("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ x(Z, {
												className: "text-xs",
												children: n(`coffeeProfile.color.${e}`)
											}), /* @__PURE__ */ x(X, {
												value: r.colors[e],
												onChange: (t) => i({
													...r,
													colors: {
														...r.colors,
														[e]: t.target.value
													}
												}),
												className: "h-8 font-mono text-xs"
											})]
										})]
									}, e)), [
										["font_title", "fontTitle"],
										["font_label", "fontLabel"],
										["font_value", "fontValue"],
										["radius", "radius"],
										["gap", "gap"],
										["bar_height", "barHeight"],
										["stroke_width", "strokeWidth"]
									].map(([e, t]) => /* @__PURE__ */ S("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ x(Z, {
											htmlFor: `style-${e}`,
											children: n(`coffeeProfile.${t}`)
										}), /* @__PURE__ */ x(X, {
											id: `style-${e}`,
											type: "number",
											value: r[e],
											onChange: (t) => i({
												...r,
												[e]: Number(t.target.value) || 0
											})
										})]
									}, e))]
								})] })
							]
						}), /* @__PURE__ */ x("div", {
							className: "xl:sticky xl:top-4 h-fit",
							children: /* @__PURE__ */ S(K, { children: [/* @__PURE__ */ x(q, { children: /* @__PURE__ */ x(J, { children: n("coffeeProfile.livePreview") }) }), /* @__PURE__ */ x(Y, { children: s ? /* @__PURE__ */ x(um, {
								settings: r,
								profile: s
							}) : null })] })
						})]
					})]
				}),
				/* @__PURE__ */ x(rm, {
					value: "blend",
					children: /* @__PURE__ */ x(sm, {})
				})
			]
		})
	});
}
//#endregion
//#region ../Modules/coffee-profile-module/client/module-entry.tsx
var hm = {
	"shop/coffee-origins": Qp,
	"shop/coffee-origins/new": Up,
	"shop/coffee-origins/:originId": Up,
	"settings/shop/coffee-profile": mm
}, gm = {
	CoffeeProfileProductPanel: Bf,
	CoffeeWeightPricingPanel: np
}, _m = {
	routes: hm,
	components: gm
};
//#endregion
export { gm as components, _m as default, hm as routes };
