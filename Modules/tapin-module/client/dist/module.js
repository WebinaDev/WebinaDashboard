import { useMutation as e, useQuery as t, useQueryClient as n } from "@tanstack/react-query";
import * as r from "react";
import i, { createContext as a, createElement as o, forwardRef as s, useContext as c, useEffect as l, useLayoutEffect as u, useMemo as d, useRef as f, useState as p } from "react";
import { useTranslation as m } from "react-i18next";
import { toast as h } from "sonner";
import * as g from "react-dom";
import _ from "react-dom";
import { Fragment as v, jsx as y, jsxs as b } from "react/jsx-runtime";
import { Link as x } from "react-router-dom";
//#region node_modules/clsx/dist/clsx.mjs
function S(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") if (Array.isArray(e)) {
		var i = e.length;
		for (t = 0; t < i; t++) e[t] && (n = S(e[t])) && (r && (r += " "), r += n);
	} else for (n in e) e[n] && (r && (r += " "), r += n);
	return r;
}
function C() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = S(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/class-variance-authority/dist/index.mjs
var w = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, T = C, E = (e, t) => (n) => {
	if (t?.variants == null) return T(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = w(t) || w(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return T(e, a, t?.compoundVariants?.reduce((e, t) => {
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
function D(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function O(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = D(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : D(e[t], null);
			}
		};
	};
}
function k(...e) {
	return r.useCallback(O(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function A(e) {
	let t = /* @__PURE__ */ j(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(N);
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
function j(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = ee(n), a = P(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? O(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var M = Symbol("radix.slottable");
function N(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === M;
}
function P(e, t) {
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
function ee(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/dist/index.mjs
var F = [
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
	let n = /* @__PURE__ */ A(`Primitive.${t}`), i = r.forwardRef((e, r) => {
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
function te(e, t) {
	e && g.flushSync(() => e.dispatchEvent(t));
}
//#endregion
//#region node_modules/@radix-ui/react-visually-hidden/dist/index.mjs
var ne = Object.freeze({
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
}), I = "VisuallyHidden", re = r.forwardRef((e, t) => /* @__PURE__ */ y(F.span, {
	...e,
	ref: t,
	style: {
		...ne,
		...e.style
	}
}));
re.displayName = I;
//#endregion
//#region node_modules/@radix-ui/react-context/dist/index.mjs
function L(e, t = []) {
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
	return a.scopeName = e, [i, R(a, ...t)];
}
function R(...e) {
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
function ie(e) {
	let t = /* @__PURE__ */ ae(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(oe);
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
function ae(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = ce(n), a = se(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? O(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var z = Symbol("radix.slottable");
function oe(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === z;
}
function se(e, t) {
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
function ce(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function le(e) {
	let t = e + "CollectionProvider", [n, r] = L(t), [a, o] = n(t, {
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
	let c = e + "CollectionSlot", l = /* @__PURE__ */ ie(c), u = i.forwardRef((e, t) => {
		let { scope: n, children: r } = e;
		return /* @__PURE__ */ y(l, {
			ref: k(t, o(c, n).collectionRef),
			children: r
		});
	});
	u.displayName = c;
	let d = e + "CollectionItemSlot", f = "data-radix-collection-item", p = /* @__PURE__ */ ie(d), m = i.forwardRef((e, t) => {
		let { scope: n, children: r, ...a } = e, s = i.useRef(null), c = k(t, s), l = o(d, n);
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
var ue = globalThis?.document ? r.useLayoutEffect : () => {}, de = r.useInsertionEffect || ue;
function fe({ prop: e, defaultProp: t, onChange: n = () => {}, caller: i }) {
	let [a, o, s] = pe({
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
			let n = me(t) ? t(e) : t;
			n !== e && s.current?.(n);
		} else o(t);
	}, [
		c,
		e,
		o,
		s
	])];
}
function pe({ defaultProp: e, onChange: t }) {
	let [n, i] = r.useState(e), a = r.useRef(n), o = r.useRef(t);
	return de(() => {
		o.current = t;
	}, [t]), r.useEffect(() => {
		a.current !== n && (o.current?.(n), a.current = n);
	}, [n, a]), [
		n,
		i,
		o
	];
}
function me(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/@radix-ui/react-presence/dist/index.mjs
function he(e, t) {
	return r.useReducer((e, n) => t[e][n] ?? e, e);
}
var ge = (e) => {
	let { present: t, children: n } = e, i = _e(t), a = typeof n == "function" ? n({ present: i.isPresent }) : r.Children.only(n), o = k(i.ref, ye(a));
	return typeof n == "function" || i.isPresent ? r.cloneElement(a, { ref: o }) : null;
};
ge.displayName = "Presence";
function _e(e) {
	let [t, n] = r.useState(), i = r.useRef(null), a = r.useRef(e), o = r.useRef("none"), [s, c] = he(e ? "mounted" : "unmounted", {
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
		let e = ve(i.current);
		o.current = s === "mounted" ? e : "none";
	}, [s]), ue(() => {
		let t = i.current, n = a.current;
		if (n !== e) {
			let r = o.current, i = ve(t);
			e ? c("MOUNT") : i === "none" || t?.display === "none" ? c("UNMOUNT") : c(n && r !== i ? "ANIMATION_OUT" : "UNMOUNT"), a.current = e;
		}
	}, [e, c]), ue(() => {
		if (t) {
			let e, n = t.ownerDocument.defaultView ?? window, r = (r) => {
				let o = ve(i.current).includes(CSS.escape(r.animationName));
				if (r.target === t && o && (c("ANIMATION_END"), !a.current)) {
					let r = t.style.animationFillMode;
					t.style.animationFillMode = "forwards", e = n.setTimeout(() => {
						t.style.animationFillMode === "forwards" && (t.style.animationFillMode = r);
					});
				}
			}, s = (e) => {
				e.target === t && (o.current = ve(i.current));
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
function ve(e) {
	return e?.animationName || "none";
}
function ye(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-id/dist/index.mjs
var be = r.useId || (() => void 0), xe = 0;
function Se(e) {
	let [t, n] = r.useState(be());
	return ue(() => {
		e || n((e) => e ?? String(xe++));
	}, [e]), e || (t ? `radix-${t}` : "");
}
//#endregion
//#region node_modules/@radix-ui/react-direction/dist/index.mjs
var Ce = r.createContext(void 0);
function we(e) {
	let t = r.useContext(Ce);
	return e || t || "ltr";
}
//#endregion
//#region node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
function Te(e) {
	let t = r.useRef(e);
	return r.useEffect(() => {
		t.current = e;
	}), r.useMemo(() => (...e) => t.current?.(...e), []);
}
//#endregion
//#region node_modules/@radix-ui/react-use-escape-keydown/dist/index.mjs
function Ee(e, t = globalThis?.document) {
	let n = Te(e);
	r.useEffect(() => {
		let e = (e) => {
			e.key === "Escape" && n(e);
		};
		return t.addEventListener("keydown", e, { capture: !0 }), () => t.removeEventListener("keydown", e, { capture: !0 });
	}, [n, t]);
}
//#endregion
//#region node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var De = "DismissableLayer", Oe = "dismissableLayer.update", ke = "dismissableLayer.pointerDownOutside", Ae = "dismissableLayer.focusOutside", je, Me = r.createContext({
	layers: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), Ne = r.forwardRef((e, t) => {
	let { disableOutsidePointerEvents: n = !1, onEscapeKeyDown: i, onPointerDownOutside: a, onFocusOutside: o, onInteractOutside: s, onDismiss: c, ...l } = e, u = r.useContext(Me), [d, f] = r.useState(null), p = d?.ownerDocument ?? globalThis?.document, [, m] = r.useState({}), h = k(t, (e) => f(e)), g = Array.from(u.layers), [_] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1), v = g.indexOf(_), b = d ? g.indexOf(d) : -1, x = u.layersWithOutsidePointerEventsDisabled.size > 0, S = b >= v, C = Ie((e) => {
		let t = e.target, n = [...u.branches].some((e) => e.contains(t));
		!S || n || (a?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p), w = Le((e) => {
		let t = e.target;
		[...u.branches].some((e) => e.contains(t)) || (o?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p);
	return Ee((e) => {
		b === u.layers.size - 1 && (i?.(e), !e.defaultPrevented && c && (e.preventDefault(), c()));
	}, p), r.useEffect(() => {
		if (d) return n && (u.layersWithOutsidePointerEventsDisabled.size === 0 && (je = p.body.style.pointerEvents, p.body.style.pointerEvents = "none"), u.layersWithOutsidePointerEventsDisabled.add(d)), u.layers.add(d), Re(), () => {
			n && u.layersWithOutsidePointerEventsDisabled.size === 1 && (p.body.style.pointerEvents = je);
		};
	}, [
		d,
		p,
		n,
		u
	]), r.useEffect(() => () => {
		d && (u.layers.delete(d), u.layersWithOutsidePointerEventsDisabled.delete(d), Re());
	}, [d, u]), r.useEffect(() => {
		let e = () => m({});
		return document.addEventListener(Oe, e), () => document.removeEventListener(Oe, e);
	}, []), /* @__PURE__ */ y(F.div, {
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
Ne.displayName = De;
var Pe = "DismissableLayerBranch", Fe = r.forwardRef((e, t) => {
	let n = r.useContext(Me), i = r.useRef(null), a = k(t, i);
	return r.useEffect(() => {
		let e = i.current;
		if (e) return n.branches.add(e), () => {
			n.branches.delete(e);
		};
	}, [n.branches]), /* @__PURE__ */ y(F.div, {
		...e,
		ref: a
	});
});
Fe.displayName = Pe;
function Ie(e, t = globalThis?.document) {
	let n = Te(e), i = r.useRef(!1), a = r.useRef(() => {});
	return r.useEffect(() => {
		let e = (e) => {
			if (e.target && !i.current) {
				let r = function() {
					ze(ke, n, i, { discrete: !0 });
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
function Le(e, t = globalThis?.document) {
	let n = Te(e), i = r.useRef(!1);
	return r.useEffect(() => {
		let e = (e) => {
			e.target && !i.current && ze(Ae, n, { originalEvent: e }, { discrete: !1 });
		};
		return t.addEventListener("focusin", e), () => t.removeEventListener("focusin", e);
	}, [t, n]), {
		onFocusCapture: () => i.current = !0,
		onBlurCapture: () => i.current = !1
	};
}
function Re() {
	let e = new CustomEvent(Oe);
	document.dispatchEvent(e);
}
function ze(e, t, n, { discrete: r }) {
	let i = n.originalEvent.target, a = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && i.addEventListener(e, t, { once: !0 }), r ? te(i, a) : i.dispatchEvent(a);
}
//#endregion
//#region node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var Be = "focusScope.autoFocusOnMount", Ve = "focusScope.autoFocusOnUnmount", He = {
	bubbles: !1,
	cancelable: !0
}, Ue = "FocusScope", We = r.forwardRef((e, t) => {
	let { loop: n = !1, trapped: i = !1, onMountAutoFocus: a, onUnmountAutoFocus: o, ...s } = e, [c, l] = r.useState(null), u = Te(a), d = Te(o), f = r.useRef(null), p = k(t, (e) => l(e)), m = r.useRef({
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
				c.contains(t) ? f.current = t : Ze(f.current, { select: !0 });
			}, t = function(e) {
				if (m.paused || !c) return;
				let t = e.relatedTarget;
				t !== null && (c.contains(t) || Ze(f.current, { select: !0 }));
			}, n = function(e) {
				if (document.activeElement === document.body) for (let t of e) t.removedNodes.length > 0 && Ze(c);
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
			Qe.add(m);
			let e = document.activeElement;
			if (!c.contains(e)) {
				let t = new CustomEvent(Be, He);
				c.addEventListener(Be, u), c.dispatchEvent(t), t.defaultPrevented || (Ge(tt(qe(c)), { select: !0 }), document.activeElement === e && Ze(c));
			}
			return () => {
				c.removeEventListener(Be, u), setTimeout(() => {
					let t = new CustomEvent(Ve, He);
					c.addEventListener(Ve, d), c.dispatchEvent(t), t.defaultPrevented || Ze(e ?? document.body, { select: !0 }), c.removeEventListener(Ve, d), Qe.remove(m);
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
			let t = e.currentTarget, [i, a] = Ke(t);
			i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n && Ze(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n && Ze(a, { select: !0 })) : r === t && e.preventDefault();
		}
	}, [
		n,
		i,
		m.paused
	]);
	return /* @__PURE__ */ y(F.div, {
		tabIndex: -1,
		...s,
		ref: p,
		onKeyDown: h
	});
});
We.displayName = Ue;
function Ge(e, { select: t = !1 } = {}) {
	let n = document.activeElement;
	for (let r of e) if (Ze(r, { select: t }), document.activeElement !== n) return;
}
function Ke(e) {
	let t = qe(e);
	return [Je(t, e), Je(t.reverse(), e)];
}
function qe(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t;
}
function Je(e, t) {
	for (let n of e) if (!Ye(n, { upTo: t })) return n;
}
function Ye(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function Xe(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function Ze(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = document.activeElement;
		e.focus({ preventScroll: !0 }), e !== n && Xe(e) && t && e.select();
	}
}
var Qe = $e();
function $e() {
	let e = [];
	return {
		add(t) {
			let n = e[0];
			t !== n && n?.pause(), e = et(e, t), e.unshift(t);
		},
		remove(t) {
			e = et(e, t), e[0]?.resume();
		}
	};
}
function et(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
function tt(e) {
	return e.filter((e) => e.tagName !== "A");
}
//#endregion
//#region node_modules/@radix-ui/react-portal/dist/index.mjs
var nt = "Portal", rt = r.forwardRef((e, t) => {
	let { container: n, ...i } = e, [a, o] = r.useState(!1);
	ue(() => o(!0), []);
	let s = n || a && globalThis?.document?.body;
	return s ? _.createPortal(/* @__PURE__ */ y(F.div, {
		...i,
		ref: t
	}), s) : null;
});
rt.displayName = nt;
//#endregion
//#region node_modules/@radix-ui/react-focus-guards/dist/index.mjs
var it = 0;
function at() {
	r.useEffect(() => {
		let e = document.querySelectorAll("[data-radix-focus-guard]");
		return document.body.insertAdjacentElement("afterbegin", e[0] ?? ot()), document.body.insertAdjacentElement("beforeend", e[1] ?? ot()), it++, () => {
			it === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((e) => e.remove()), it--;
		};
	}, []);
}
function ot() {
	let e = document.createElement("span");
	return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
//#endregion
//#region node_modules/tslib/tslib.es6.mjs
var st = function() {
	return st = Object.assign || function(e) {
		for (var t, n = 1, r = arguments.length; n < r; n++) for (var i in t = arguments[n], t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
		return e;
	}, st.apply(this, arguments);
};
function ct(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
function lt(e, t, n) {
	if (n || arguments.length === 2) for (var r = 0, i = t.length, a; r < i; r++) (a || !(r in t)) && (a || (a = Array.prototype.slice.call(t, 0, r)), a[r] = t[r]);
	return e.concat(a || Array.prototype.slice.call(t));
}
//#endregion
//#region node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var ut = "right-scroll-bar-position", dt = "width-before-scroll-bar", ft = "with-scroll-bars-hidden", pt = "--removed-body-scroll-bar-size";
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/assignRef.js
function mt(e, t) {
	return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/useRef.js
function ht(e, t) {
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
var gt = typeof window < "u" ? r.useLayoutEffect : r.useEffect, _t = /* @__PURE__ */ new WeakMap();
function vt(e, t) {
	var n = ht(t || null, function(t) {
		return e.forEach(function(e) {
			return mt(e, t);
		});
	});
	return gt(function() {
		var t = _t.get(n);
		if (t) {
			var r = new Set(t), i = new Set(e), a = n.current;
			r.forEach(function(e) {
				i.has(e) || mt(e, null);
			}), i.forEach(function(e) {
				r.has(e) || mt(e, a);
			});
		}
		_t.set(n, e);
	}, [e]), n;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/medium.js
function yt(e) {
	return e;
}
function bt(e, t) {
	t === void 0 && (t = yt);
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
function xt(e) {
	e === void 0 && (e = {});
	var t = bt(null);
	return t.options = st({
		async: !0,
		ssr: !1
	}, e), t;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/exports.js
var St = function(e) {
	var t = e.sideCar, n = ct(e, ["sideCar"]);
	if (!t) throw Error("Sidecar: please provide `sideCar` property to import the right car");
	var i = t.read();
	if (!i) throw Error("Sidecar medium not found");
	return r.createElement(i, st({}, n));
};
St.isSideCarExport = !0;
function Ct(e, t) {
	return e.useMedium(t), St;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/medium.js
var wt = xt(), Tt = function() {}, Et = r.forwardRef(function(e, t) {
	var n = r.useRef(null), i = r.useState({
		onScrollCapture: Tt,
		onWheelCapture: Tt,
		onTouchMoveCapture: Tt
	}), a = i[0], o = i[1], s = e.forwardProps, c = e.children, l = e.className, u = e.removeScrollBar, d = e.enabled, f = e.shards, p = e.sideCar, m = e.noRelative, h = e.noIsolation, g = e.inert, _ = e.allowPinchZoom, v = e.as, y = v === void 0 ? "div" : v, b = e.gapMode, x = ct(e, [
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
	]), S = p, C = vt([n, t]), w = st(st({}, x), a);
	return r.createElement(r.Fragment, null, d && r.createElement(S, {
		sideCar: wt,
		removeScrollBar: u,
		shards: f,
		noRelative: m,
		noIsolation: h,
		inert: g,
		setCallbacks: o,
		allowPinchZoom: !!_,
		lockRef: n,
		gapMode: b
	}), s ? r.cloneElement(r.Children.only(c), st(st({}, w), { ref: C })) : r.createElement(y, st({}, w, {
		className: l,
		ref: C
	}), c));
});
Et.defaultProps = {
	enabled: !0,
	removeScrollBar: !0,
	inert: !1
}, Et.classNames = {
	fullWidth: dt,
	zeroRight: ut
};
//#endregion
//#region node_modules/get-nonce/dist/es2015/index.js
var Dt, Ot = function() {
	if (Dt) return Dt;
	if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
//#endregion
//#region node_modules/react-style-singleton/dist/es2015/singleton.js
function kt() {
	if (!document) return null;
	var e = document.createElement("style");
	e.type = "text/css";
	var t = Ot();
	return t && e.setAttribute("nonce", t), e;
}
function At(e, t) {
	e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function jt(e) {
	(document.head || document.getElementsByTagName("head")[0]).appendChild(e);
}
var Mt = function() {
	var e = 0, t = null;
	return {
		add: function(n) {
			e == 0 && (t = kt()) && (At(t, n), jt(t)), e++;
		},
		remove: function() {
			e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
		}
	};
}, Nt = function() {
	var e = Mt();
	return function(t, n) {
		r.useEffect(function() {
			return e.add(t), function() {
				e.remove();
			};
		}, [t && n]);
	};
}, Pt = function() {
	var e = Nt();
	return function(t) {
		var n = t.styles, r = t.dynamic;
		return e(n, r), null;
	};
}, Ft = {
	left: 0,
	top: 0,
	right: 0,
	gap: 0
}, It = function(e) {
	return parseInt(e || "", 10) || 0;
}, Lt = function(e) {
	var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
	return [
		It(n),
		It(r),
		It(i)
	];
}, Rt = function(e) {
	if (e === void 0 && (e = "margin"), typeof window > "u") return Ft;
	var t = Lt(e), n = document.documentElement.clientWidth, r = window.innerWidth;
	return {
		left: t[0],
		top: t[1],
		right: t[2],
		gap: Math.max(0, r - n + t[2] - t[0])
	};
}, zt = Pt(), Bt = "data-scroll-locked", Vt = function(e, t, n, r) {
	var i = e.left, a = e.top, o = e.right, s = e.gap;
	return n === void 0 && (n = "margin"), `
  .${ft} {
   overflow: hidden ${r};
   padding-right: ${s}px ${r};
  }
  body[${Bt}] {
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
  
  .${ut} {
    right: ${s}px ${r};
  }
  
  .${dt} {
    margin-right: ${s}px ${r};
  }
  
  .${ut} .${ut} {
    right: 0 ${r};
  }
  
  .${dt} .${dt} {
    margin-right: 0 ${r};
  }
  
  body[${Bt}] {
    ${pt}: ${s}px;
  }
`;
}, Ht = function() {
	var e = parseInt(document.body.getAttribute("data-scroll-locked") || "0", 10);
	return isFinite(e) ? e : 0;
}, Ut = function() {
	r.useEffect(function() {
		return document.body.setAttribute(Bt, (Ht() + 1).toString()), function() {
			var e = Ht() - 1;
			e <= 0 ? document.body.removeAttribute(Bt) : document.body.setAttribute(Bt, e.toString());
		};
	}, []);
}, Wt = function(e) {
	var t = e.noRelative, n = e.noImportant, i = e.gapMode, a = i === void 0 ? "margin" : i;
	Ut();
	var o = r.useMemo(function() {
		return Rt(a);
	}, [a]);
	return r.createElement(zt, { styles: Vt(o, !t, a, n ? "" : "!important") });
}, Gt = !1;
if (typeof window < "u") try {
	var Kt = Object.defineProperty({}, "passive", { get: function() {
		return Gt = !0, !0;
	} });
	window.addEventListener("test", Kt, Kt), window.removeEventListener("test", Kt, Kt);
} catch {
	Gt = !1;
}
var qt = Gt ? { passive: !1 } : !1, Jt = function(e) {
	return e.tagName === "TEXTAREA";
}, Yt = function(e, t) {
	if (!(e instanceof Element)) return !1;
	var n = window.getComputedStyle(e);
	return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !Jt(e) && n[t] === "visible");
}, Xt = function(e) {
	return Yt(e, "overflowY");
}, Zt = function(e) {
	return Yt(e, "overflowX");
}, Qt = function(e, t) {
	var n = t.ownerDocument, r = t;
	do {
		if (typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host), tn(e, r)) {
			var i = nn(e, r);
			if (i[1] > i[2]) return !0;
		}
		r = r.parentNode;
	} while (r && r !== n.body);
	return !1;
}, $t = function(e) {
	return [
		e.scrollTop,
		e.scrollHeight,
		e.clientHeight
	];
}, en = function(e) {
	return [
		e.scrollLeft,
		e.scrollWidth,
		e.clientWidth
	];
}, tn = function(e, t) {
	return e === "v" ? Xt(t) : Zt(t);
}, nn = function(e, t) {
	return e === "v" ? $t(t) : en(t);
}, rn = function(e, t) {
	return e === "h" && t === "rtl" ? -1 : 1;
}, an = function(e, t, n, r, i) {
	var a = rn(e, window.getComputedStyle(t).direction), o = a * r, s = n.target, c = t.contains(s), l = !1, u = o > 0, d = 0, f = 0;
	do {
		if (!s) break;
		var p = nn(e, s), m = p[0], h = p[1] - p[2] - a * m;
		(m || h) && tn(e, s) && (d += h, f += m);
		var g = s.parentNode;
		s = g && g.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? g.host : g;
	} while (!c && s !== document.body || c && (t.contains(s) || t === s));
	return (u && (i && Math.abs(d) < 1 || !i && o > d) || !u && (i && Math.abs(f) < 1 || !i && -o > f)) && (l = !0), l;
}, on = function(e) {
	return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, sn = function(e) {
	return [e.deltaX, e.deltaY];
}, cn = function(e) {
	return e && "current" in e ? e.current : e;
}, ln = function(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}, un = function(e) {
	return `
  .block-interactivity-${e} {pointer-events: none;}
  .allow-interactivity-${e} {pointer-events: all;}
`;
}, dn = 0, fn = [];
function pn(e) {
	var t = r.useRef([]), n = r.useRef([0, 0]), i = r.useRef(), a = r.useState(dn++)[0], o = r.useState(Pt)[0], s = r.useRef(e);
	r.useEffect(function() {
		s.current = e;
	}, [e]), r.useEffect(function() {
		if (e.inert) {
			document.body.classList.add(`block-interactivity-${a}`);
			var t = lt([e.lockRef.current], (e.shards || []).map(cn), !0).filter(Boolean);
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
		var r = on(e), a = n.current, o = "deltaX" in e ? e.deltaX : a[0] - r[0], c = "deltaY" in e ? e.deltaY : a[1] - r[1], l, u = e.target, d = Math.abs(o) > Math.abs(c) ? "h" : "v";
		if ("touches" in e && d === "h" && u.type === "range") return !1;
		var f = window.getSelection(), p = f && f.anchorNode;
		if (p && (p === u || p.contains(u))) return !1;
		var m = Qt(d, u);
		if (!m) return !0;
		if (m ? l = d : (l = d === "v" ? "h" : "v", m = Qt(d, u)), !m) return !1;
		if (!i.current && "changedTouches" in e && (o || c) && (i.current = l), !l) return !0;
		var h = i.current || l;
		return an(h, t, e, h === "h" ? o : c, !0);
	}, []), l = r.useCallback(function(e) {
		var n = e;
		if (!(!fn.length || fn[fn.length - 1] !== o)) {
			var r = "deltaY" in n ? sn(n) : on(n), i = t.current.filter(function(e) {
				return e.name === n.type && (e.target === n.target || n.target === e.shadowParent) && ln(e.delta, r);
			})[0];
			if (i && i.should) {
				n.cancelable && n.preventDefault();
				return;
			}
			if (!i) {
				var a = (s.current.shards || []).map(cn).filter(Boolean).filter(function(e) {
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
			shadowParent: mn(r)
		};
		t.current.push(a), setTimeout(function() {
			t.current = t.current.filter(function(e) {
				return e !== a;
			});
		}, 1);
	}, []), d = r.useCallback(function(e) {
		n.current = on(e), i.current = void 0;
	}, []), f = r.useCallback(function(t) {
		u(t.type, sn(t), t.target, c(t, e.lockRef.current));
	}, []), p = r.useCallback(function(t) {
		u(t.type, on(t), t.target, c(t, e.lockRef.current));
	}, []);
	r.useEffect(function() {
		return fn.push(o), e.setCallbacks({
			onScrollCapture: f,
			onWheelCapture: f,
			onTouchMoveCapture: p
		}), document.addEventListener("wheel", l, qt), document.addEventListener("touchmove", l, qt), document.addEventListener("touchstart", d, qt), function() {
			fn = fn.filter(function(e) {
				return e !== o;
			}), document.removeEventListener("wheel", l, qt), document.removeEventListener("touchmove", l, qt), document.removeEventListener("touchstart", d, qt);
		};
	}, []);
	var m = e.removeScrollBar, h = e.inert;
	return r.createElement(r.Fragment, null, h ? r.createElement(o, { styles: un(a) }) : null, m ? r.createElement(Wt, {
		noRelative: e.noRelative,
		gapMode: e.gapMode
	}) : null);
}
function mn(e) {
	for (var t = null; e !== null;) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
	return t;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/sidecar.js
var hn = Ct(wt, pn), gn = r.forwardRef(function(e, t) {
	return r.createElement(Et, st({}, e, {
		ref: t,
		sideCar: hn
	}));
});
gn.classNames = Et.classNames;
//#endregion
//#region src/lib/remove-scroll-gate.tsx
var _n = r.createContext(!1);
function vn({ allowBodyScroll: e, children: t }) {
	return /* @__PURE__ */ y(_n.Provider, {
		value: e,
		children: t
	});
}
function yn() {
	return r.useContext(_n);
}
//#endregion
//#region src/lib/react-remove-scroll-shim.tsx
var bn = r.forwardRef(function(e, t) {
	let n = yn() ? !1 : e.enabled !== !1;
	return /* @__PURE__ */ y(gn, {
		...e,
		ref: t,
		enabled: n
	});
});
bn.classNames = gn.classNames;
//#endregion
//#region node_modules/aria-hidden/dist/es2015/index.js
var xn = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, Sn = /* @__PURE__ */ new WeakMap(), Cn = /* @__PURE__ */ new WeakMap(), wn = {}, Tn = 0, En = function(e) {
	return e && (e.host || En(e.parentNode));
}, Dn = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = En(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, On = function(e, t, n, r) {
	var i = Dn(t, Array.isArray(e) ? e : [e]);
	wn[n] || (wn[n] = /* @__PURE__ */ new WeakMap());
	var a = wn[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		!e || s.has(e) || (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		!e || c.has(e) || Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (Sn.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				Sn.set(e, c), a.set(e, l), o.push(e), c === 1 && i && Cn.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), Tn++, function() {
		o.forEach(function(e) {
			var t = Sn.get(e) - 1, i = a.get(e) - 1;
			Sn.set(e, t), a.set(e, i), t || (Cn.has(e) || e.removeAttribute(r), Cn.delete(e)), i || e.removeAttribute(n);
		}), Tn--, Tn || (Sn = /* @__PURE__ */ new WeakMap(), Sn = /* @__PURE__ */ new WeakMap(), Cn = /* @__PURE__ */ new WeakMap(), wn = {});
	};
}, kn = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || xn(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), On(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function An(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function jn(e) {
	let [t, n] = r.useState(void 0);
	return ue(() => {
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
var Mn = [
	"top",
	"right",
	"bottom",
	"left"
], Nn = Math.min, Pn = Math.max, Fn = Math.round, In = Math.floor, Ln = (e) => ({
	x: e,
	y: e
}), Rn = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function zn(e, t, n) {
	return Pn(e, Nn(t, n));
}
function Bn(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function Vn(e) {
	return e.split("-")[0];
}
function Hn(e) {
	return e.split("-")[1];
}
function Un(e) {
	return e === "x" ? "y" : "x";
}
function Wn(e) {
	return e === "y" ? "height" : "width";
}
function Gn(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function Kn(e) {
	return Un(Gn(e));
}
function qn(e, t, n) {
	n === void 0 && (n = !1);
	let r = Hn(e), i = Kn(e), a = Wn(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = nr(o)), [o, nr(o)];
}
function Jn(e) {
	let t = nr(e);
	return [
		Yn(e),
		t,
		Yn(t)
	];
}
function Yn(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var Xn = ["left", "right"], Zn = ["right", "left"], Qn = ["top", "bottom"], $n = ["bottom", "top"];
function er(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? Zn : Xn : t ? Xn : Zn;
		case "left":
		case "right": return t ? Qn : $n;
		default: return [];
	}
}
function tr(e, t, n, r) {
	let i = Hn(e), a = er(Vn(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(Yn)))), a;
}
function nr(e) {
	let t = Vn(e);
	return Rn[t] + e.slice(t.length);
}
function rr(e) {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...e
	};
}
function ir(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : rr(e);
}
function ar(e) {
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
function or(e, t, n) {
	let { reference: r, floating: i } = e, a = Gn(t), o = Kn(t), s = Wn(o), c = Vn(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	switch (Hn(t)) {
		case "start":
			p[o] -= f * (n && l ? -1 : 1);
			break;
		case "end":
			p[o] += f * (n && l ? -1 : 1);
			break;
	}
	return p;
}
async function sr(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = Bn(t, e), p = ir(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = ar(await i.getClippingRect({
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
	}, y = ar(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var cr = 50, lr = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: sr
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = or(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < cr && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = or(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, ur = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = Bn(e, t) || {};
		if (l == null) return {};
		let d = ir(u), f = {
			x: n,
			y: r
		}, p = Kn(i), m = Wn(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = Nn(d[_], T), D = Nn(d[v], T), O = E, k = C - h[m] - D, A = C / 2 - h[m] / 2 + w, j = zn(O, A, k), M = !c.arrow && Hn(i) != null && A !== j && a.reference[m] / 2 - (A < O ? E : D) - h[m] / 2 < 0, N = M ? A < O ? A - O : A - k : 0;
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
}), dr = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = Bn(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = Vn(r), _ = Gn(o), v = Vn(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [nr(o)] : Jn(o)), x = p !== "none";
			!d && x && b.push(...tr(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = qn(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (!(u === "alignment" && _ !== Gn(t)) || T.every((e) => Gn(e.placement) === _ ? e.overflows[0] > 0 : !0))) return {
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
								let t = Gn(e.placement);
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
function fr(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function pr(e) {
	return Mn.some((t) => e[t] >= 0);
}
var mr = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = Bn(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = fr(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: pr(e)
					} };
				}
				case "escaped": {
					let e = fr(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: pr(e)
					} };
				}
				default: return {};
			}
		}
	};
}, hr = /* @__PURE__ */ new Set(["left", "top"]);
async function gr(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = Vn(n), s = Hn(n), c = Gn(n) === "y", l = hr.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = Bn(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var _r = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await gr(t, e);
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
}, vr = function(e) {
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
			} }, ...l } = Bn(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = Gn(Vn(i)), p = Un(f), m = u[p], h = u[f];
			if (o) {
				let e = p === "y" ? "top" : "left", t = p === "y" ? "bottom" : "right", n = m + d[e], r = m - d[t];
				m = zn(n, m, r);
			}
			if (s) {
				let e = f === "y" ? "top" : "left", t = f === "y" ? "bottom" : "right", n = h + d[e], r = h - d[t];
				h = zn(n, h, r);
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
}, yr = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = Bn(e, t), u = {
				x: n,
				y: r
			}, d = Gn(i), f = Un(d), p = u[f], m = u[d], h = Bn(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = hr.has(Vn(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, br = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			var n, r;
			let { placement: i, rects: a, platform: o, elements: s } = t, { apply: c = () => {}, ...l } = Bn(e, t), u = await o.detectOverflow(t, l), d = Vn(i), f = Hn(i), p = Gn(i) === "y", { width: m, height: h } = a.floating, g, _;
			d === "top" || d === "bottom" ? (g = d, _ = f === (await (o.isRTL == null ? void 0 : o.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (_ = d, g = f === "end" ? "top" : "bottom");
			let v = h - u.top - u.bottom, y = m - u.left - u.right, b = Nn(h - u[g], v), x = Nn(m - u[_], y), S = !t.middlewareData.shift, C = b, w = x;
			if ((n = t.middlewareData.shift) != null && n.enabled.x && (w = y), (r = t.middlewareData.shift) != null && r.enabled.y && (C = v), S && !f) {
				let e = Pn(u.left, 0), t = Pn(u.right, 0), n = Pn(u.top, 0), r = Pn(u.bottom, 0);
				p ? w = m - 2 * (e !== 0 || t !== 0 ? e + t : Pn(u.left, u.right)) : C = h - 2 * (n !== 0 || r !== 0 ? n + r : Pn(u.top, u.bottom));
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
function xr() {
	return typeof window < "u";
}
function Sr(e) {
	return Tr(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Cr(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function wr(e) {
	return ((Tr(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function Tr(e) {
	return xr() ? e instanceof Node || e instanceof Cr(e).Node : !1;
}
function Er(e) {
	return xr() ? e instanceof Element || e instanceof Cr(e).Element : !1;
}
function Dr(e) {
	return xr() ? e instanceof HTMLElement || e instanceof Cr(e).HTMLElement : !1;
}
function Or(e) {
	return !xr() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Cr(e).ShadowRoot;
}
function kr(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = Br(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function Ar(e) {
	return /^(table|td|th)$/.test(Sr(e));
}
function jr(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var Mr = /transform|translate|scale|rotate|perspective|filter/, Nr = /paint|layout|strict|content/, Pr = (e) => !!e && e !== "none", Fr;
function Ir(e) {
	let t = Er(e) ? Br(e) : e;
	return Pr(t.transform) || Pr(t.translate) || Pr(t.scale) || Pr(t.rotate) || Pr(t.perspective) || !Rr() && (Pr(t.backdropFilter) || Pr(t.filter)) || Mr.test(t.willChange || "") || Nr.test(t.contain || "");
}
function Lr(e) {
	let t = Hr(e);
	for (; Dr(t) && !zr(t);) {
		if (Ir(t)) return t;
		if (jr(t)) return null;
		t = Hr(t);
	}
	return null;
}
function Rr() {
	return Fr ?? (Fr = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), Fr;
}
function zr(e) {
	return /^(html|body|#document)$/.test(Sr(e));
}
function Br(e) {
	return Cr(e).getComputedStyle(e);
}
function Vr(e) {
	return Er(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function Hr(e) {
	if (Sr(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Or(e) && e.host || wr(e);
	return Or(t) ? t.host : t;
}
function Ur(e) {
	let t = Hr(e);
	return zr(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : Dr(t) && kr(t) ? t : Ur(t);
}
function Wr(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = Ur(e), i = r === e.ownerDocument?.body, a = Cr(r);
	if (i) {
		let e = Gr(a);
		return t.concat(a, a.visualViewport || [], kr(r) ? r : [], e && n ? Wr(e) : []);
	} else return t.concat(r, Wr(r, [], n));
}
function Gr(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function Kr(e) {
	let t = Br(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = Dr(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = Fn(n) !== a || Fn(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function qr(e) {
	return Er(e) ? e : e.contextElement;
}
function Jr(e) {
	let t = qr(e);
	if (!Dr(t)) return Ln(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = Kr(t), o = (a ? Fn(n.width) : n.width) / r, s = (a ? Fn(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var Yr = /* @__PURE__ */ Ln(0);
function Xr(e) {
	let t = Cr(e);
	return !Rr() || !t.visualViewport ? Yr : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function Zr(e, t, n) {
	return t === void 0 && (t = !1), !n || t && n !== Cr(e) ? !1 : t;
}
function Qr(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = qr(e), o = Ln(1);
	t && (r ? Er(r) && (o = Jr(r)) : o = Jr(e));
	let s = Zr(a, n, r) ? Xr(a) : Ln(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a) {
		let e = Cr(a), t = r && Er(r) ? Cr(r) : r, n = e, i = Gr(n);
		for (; i && r && t !== n;) {
			let e = Jr(i), t = i.getBoundingClientRect(), r = Br(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = Cr(i), i = Gr(n);
		}
	}
	return ar({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function $r(e, t) {
	let n = Vr(e).scrollLeft;
	return t ? t.left + n : Qr(wr(e)).left + n;
}
function ei(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - $r(e, n),
		y: n.top + t.scrollTop
	};
}
function ti(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = wr(r), s = t ? jr(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = Ln(1), u = Ln(0), d = Dr(r);
	if ((d || !d && !a) && ((Sr(r) !== "body" || kr(o)) && (c = Vr(r)), d)) {
		let e = Qr(r);
		l = Jr(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? ei(o, c) : Ln(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function ni(e) {
	return Array.from(e.getClientRects());
}
function ri(e) {
	let t = wr(e), n = Vr(e), r = e.ownerDocument.body, i = Pn(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), a = Pn(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight), o = -n.scrollLeft + $r(e), s = -n.scrollTop;
	return Br(r).direction === "rtl" && (o += Pn(t.clientWidth, r.clientWidth) - i), {
		width: i,
		height: a,
		x: o,
		y: s
	};
}
var ii = 25;
function ai(e, t) {
	let n = Cr(e), r = wr(e), i = n.visualViewport, a = r.clientWidth, o = r.clientHeight, s = 0, c = 0;
	if (i) {
		a = i.width, o = i.height;
		let e = Rr();
		(!e || e && t === "fixed") && (s = i.offsetLeft, c = i.offsetTop);
	}
	let l = $r(r);
	if (l <= 0) {
		let e = r.ownerDocument, t = e.body, n = getComputedStyle(t), i = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, o = Math.abs(r.clientWidth - t.clientWidth - i);
		o <= ii && (a -= o);
	} else l <= ii && (a += l);
	return {
		width: a,
		height: o,
		x: s,
		y: c
	};
}
function oi(e, t) {
	let n = Qr(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = Dr(e) ? Jr(e) : Ln(1);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function si(e, t, n) {
	let r;
	if (t === "viewport") r = ai(e, n);
	else if (t === "document") r = ri(wr(e));
	else if (Er(t)) r = oi(t, n);
	else {
		let n = Xr(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return ar(r);
}
function ci(e, t) {
	let n = Hr(e);
	return n === t || !Er(n) || zr(n) ? !1 : Br(n).position === "fixed" || ci(n, t);
}
function li(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = Wr(e, [], !1).filter((e) => Er(e) && Sr(e) !== "body"), i = null, a = Br(e).position === "fixed", o = a ? Hr(e) : e;
	for (; Er(o) && !zr(o);) {
		let t = Br(o), n = Ir(o);
		!n && t.position === "fixed" && (i = null), (a ? !n && !i : !n && t.position === "static" && i && (i.position === "absolute" || i.position === "fixed") || kr(o) && !n && ci(e, o)) ? r = r.filter((e) => e !== o) : i = t, o = Hr(o);
	}
	return t.set(e, r), r;
}
function ui(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? jr(t) ? [] : li(t, this._c) : [].concat(n), r], o = si(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = si(t, a[e], i);
		s = Pn(n.top, s), c = Nn(n.right, c), l = Nn(n.bottom, l), u = Pn(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function di(e) {
	let { width: t, height: n } = Kr(e);
	return {
		width: t,
		height: n
	};
}
function fi(e, t, n) {
	let r = Dr(t), i = wr(t), a = n === "fixed", o = Qr(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = Ln(0);
	function l() {
		c.x = $r(i);
	}
	if (r || !r && !a) if ((Sr(t) !== "body" || kr(i)) && (s = Vr(t)), r) {
		let e = Qr(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	} else i && l();
	a && !r && i && l();
	let u = i && !r && !a ? ei(i, s) : Ln(0);
	return {
		x: o.left + s.scrollLeft - c.x - u.x,
		y: o.top + s.scrollTop - c.y - u.y,
		width: o.width,
		height: o.height
	};
}
function pi(e) {
	return Br(e).position === "static";
}
function mi(e, t) {
	if (!Dr(e) || Br(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return wr(e) === n && (n = n.ownerDocument.body), n;
}
function hi(e, t) {
	let n = Cr(e);
	if (jr(e)) return n;
	if (!Dr(e)) {
		let t = Hr(e);
		for (; t && !zr(t);) {
			if (Er(t) && !pi(t)) return t;
			t = Hr(t);
		}
		return n;
	}
	let r = mi(e, t);
	for (; r && Ar(r) && pi(r);) r = mi(r, t);
	return r && zr(r) && pi(r) && !Ir(r) ? n : r || Lr(e) || n;
}
var gi = async function(e) {
	let t = this.getOffsetParent || hi, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: fi(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function _i(e) {
	return Br(e).direction === "rtl";
}
var vi = {
	convertOffsetParentRelativeRectToViewportRelativeRect: ti,
	getDocumentElement: wr,
	getClippingRect: ui,
	getOffsetParent: hi,
	getElementRects: gi,
	getClientRects: ni,
	getDimensions: di,
	getScale: Jr,
	isElement: Er,
	isRTL: _i
};
function yi(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function bi(e, t) {
	let n = null, r, i = wr(e);
	function a() {
		var e;
		clearTimeout(r), (e = n) == null || e.disconnect(), n = null;
	}
	function o(s, c) {
		s === void 0 && (s = !1), c === void 0 && (c = 1), a();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (s || t(), !f || !p) return;
		let m = In(d), h = In(i.clientWidth - (u + f)), g = In(i.clientHeight - (d + p)), _ = In(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: Pn(0, Nn(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (n !== c) {
				if (!y) return o();
				n ? o(!1, n) : r = setTimeout(() => {
					o(!1, 1e-7);
				}, 1e3);
			}
			n === 1 && !yi(l, e.getBoundingClientRect()) && o(), y = !1;
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
function xi(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = qr(e), u = i || a ? [...l ? Wr(l) : [], ...t ? Wr(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n, { passive: !0 }), a && e.addEventListener("resize", n);
	});
	let d = l && s ? bi(l, n) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? Qr(e) : null;
	c && g();
	function g() {
		let t = Qr(e);
		h && !yi(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var Si = _r, Ci = vr, wi = dr, Ti = br, Ei = mr, Di = ur, Oi = yr, ki = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = {
		platform: vi,
		...n
	}, a = {
		...i.platform,
		_c: r
	};
	return lr(e, t, {
		...i,
		platform: a
	});
}, Ai = typeof document < "u" ? u : function() {};
function ji(e, t) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (typeof e == "function" && e.toString() === t.toString()) return !0;
	let n, r, i;
	if (e && t && typeof e == "object") {
		if (Array.isArray(e)) {
			if (n = e.length, n !== t.length) return !1;
			for (r = n; r-- !== 0;) if (!ji(e[r], t[r])) return !1;
			return !0;
		}
		if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length) return !1;
		for (r = n; r-- !== 0;) if (!{}.hasOwnProperty.call(t, i[r])) return !1;
		for (r = n; r-- !== 0;) {
			let n = i[r];
			if (!(n === "_owner" && e.$$typeof) && !ji(e[n], t[n])) return !1;
		}
		return !0;
	}
	return e !== e && t !== t;
}
function Mi(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Ni(e, t) {
	let n = Mi(e);
	return Math.round(t * n) / n;
}
function Pi(e) {
	let t = r.useRef(e);
	return Ai(() => {
		t.current = e;
	}), t;
}
function Fi(e) {
	e === void 0 && (e = {});
	let { placement: t = "bottom", strategy: n = "absolute", middleware: i = [], platform: a, elements: { reference: o, floating: s } = {}, transform: c = !0, whileElementsMounted: l, open: u } = e, [d, f] = r.useState({
		x: 0,
		y: 0,
		strategy: n,
		placement: t,
		middlewareData: {},
		isPositioned: !1
	}), [p, m] = r.useState(i);
	ji(p, i) || m(i);
	let [h, _] = r.useState(null), [v, y] = r.useState(null), b = r.useCallback((e) => {
		e !== w.current && (w.current = e, _(e));
	}, []), x = r.useCallback((e) => {
		e !== T.current && (T.current = e, y(e));
	}, []), S = o || h, C = s || v, w = r.useRef(null), T = r.useRef(null), E = r.useRef(d), D = l != null, O = Pi(l), k = Pi(a), A = Pi(u), j = r.useCallback(() => {
		if (!w.current || !T.current) return;
		let e = {
			placement: t,
			strategy: n,
			middleware: p
		};
		k.current && (e.platform = k.current), ki(w.current, T.current, e).then((e) => {
			let t = {
				...e,
				isPositioned: A.current !== !1
			};
			M.current && !ji(E.current, t) && (E.current = t, g.flushSync(() => {
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
	Ai(() => {
		u === !1 && E.current.isPositioned && (E.current.isPositioned = !1, f((e) => ({
			...e,
			isPositioned: !1
		})));
	}, [u]);
	let M = r.useRef(!1);
	Ai(() => (M.current = !0, () => {
		M.current = !1;
	}), []), Ai(() => {
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
	}), [S, C]), ee = r.useMemo(() => {
		let e = {
			position: n,
			left: 0,
			top: 0
		};
		if (!P.floating) return e;
		let t = Ni(P.floating, d.x), r = Ni(P.floating, d.y);
		return c ? {
			...e,
			transform: "translate(" + t + "px, " + r + "px)",
			...Mi(P.floating) >= 1.5 && { willChange: "transform" }
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
var Ii = (e) => {
	function t(e) {
		return {}.hasOwnProperty.call(e, "current");
	}
	return {
		name: "arrow",
		options: e,
		fn(n) {
			let { element: r, padding: i } = typeof e == "function" ? e(n) : e;
			return r && t(r) ? r.current == null ? {} : Di({
				element: r.current,
				padding: i
			}).fn(n) : r ? Di({
				element: r,
				padding: i
			}).fn(n) : {};
		}
	};
}, Li = (e, t) => {
	let n = Si(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Ri = (e, t) => {
	let n = Ci(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, zi = (e, t) => ({
	fn: Oi(e).fn,
	options: [e, t]
}), Bi = (e, t) => {
	let n = wi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Vi = (e, t) => {
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
	let n = Ii(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Wi = "Arrow", Gi = r.forwardRef((e, t) => {
	let { children: n, width: r = 10, height: i = 5, ...a } = e;
	return /* @__PURE__ */ y(F.svg, {
		...a,
		ref: t,
		width: r,
		height: i,
		viewBox: "0 0 30 10",
		preserveAspectRatio: "none",
		children: e.asChild ? n : /* @__PURE__ */ y("polygon", { points: "0,0 30,0 15,10" })
	});
});
Gi.displayName = Wi;
var Ki = Gi, qi = "Popper", [Ji, Yi] = L(qi), [Xi, Zi] = Ji(qi), Qi = (e) => {
	let { __scopePopper: t, children: n } = e, [i, a] = r.useState(null);
	return /* @__PURE__ */ y(Xi, {
		scope: t,
		anchor: i,
		onAnchorChange: a,
		children: n
	});
};
Qi.displayName = qi;
var $i = "PopperAnchor", ea = r.forwardRef((e, t) => {
	let { __scopePopper: n, virtualRef: i, ...a } = e, o = Zi($i, n), s = r.useRef(null), c = k(t, s), l = r.useRef(null);
	return r.useEffect(() => {
		let e = l.current;
		l.current = i?.current || s.current, e !== l.current && o.onAnchorChange(l.current);
	}), i ? null : /* @__PURE__ */ y(F.div, {
		...a,
		ref: c
	});
});
ea.displayName = $i;
var ta = "PopperContent", [na, ra] = Ji(ta), ia = r.forwardRef((e, t) => {
	let { __scopePopper: n, side: i = "bottom", sideOffset: a = 0, align: o = "center", alignOffset: s = 0, arrowPadding: c = 0, avoidCollisions: l = !0, collisionBoundary: u = [], collisionPadding: d = 0, sticky: f = "partial", hideWhenDetached: p = !1, updatePositionStrategy: m = "optimized", onPlaced: h, ...g } = e, _ = Zi(ta, n), [v, b] = r.useState(null), x = k(t, (e) => b(e)), [S, C] = r.useState(null), w = jn(S), T = w?.width ?? 0, E = w?.height ?? 0, D = i + (o === "center" ? "" : "-" + o), O = typeof d == "number" ? d : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...d
	}, A = Array.isArray(u) ? u : [u], j = A.length > 0, M = {
		padding: O,
		boundary: A.filter(ca),
		altBoundary: j
	}, { refs: N, floatingStyles: P, placement: ee, isPositioned: te, middlewareData: ne } = Fi({
		strategy: "fixed",
		placement: D,
		whileElementsMounted: (...e) => xi(...e, { animationFrame: m === "always" }),
		elements: { reference: _.anchor },
		middleware: [
			Li({
				mainAxis: a + E,
				alignmentAxis: s
			}),
			l && Ri({
				mainAxis: !0,
				crossAxis: !1,
				limiter: f === "partial" ? zi() : void 0,
				...M
			}),
			l && Bi({ ...M }),
			Vi({
				...M,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--radix-popper-available-width", `${n}px`), o.setProperty("--radix-popper-available-height", `${r}px`), o.setProperty("--radix-popper-anchor-width", `${i}px`), o.setProperty("--radix-popper-anchor-height", `${a}px`);
				}
			}),
			S && Ui({
				element: S,
				padding: c
			}),
			la({
				arrowWidth: T,
				arrowHeight: E
			}),
			p && Hi({
				strategy: "referenceHidden",
				...M
			})
		]
	}), [I, re] = ua(ee), L = Te(h);
	ue(() => {
		te && L?.();
	}, [te, L]);
	let R = ne.arrow?.x, ie = ne.arrow?.y, ae = ne.arrow?.centerOffset !== 0, [z, oe] = r.useState();
	return ue(() => {
		v && oe(window.getComputedStyle(v).zIndex);
	}, [v]), /* @__PURE__ */ y("div", {
		ref: N.setFloating,
		"data-radix-popper-content-wrapper": "",
		style: {
			...P,
			transform: te ? P.transform : "translate(0, -200%)",
			minWidth: "max-content",
			zIndex: z,
			"--radix-popper-transform-origin": [ne.transformOrigin?.x, ne.transformOrigin?.y].join(" "),
			...ne.hide?.referenceHidden && {
				visibility: "hidden",
				pointerEvents: "none"
			}
		},
		dir: e.dir,
		children: /* @__PURE__ */ y(na, {
			scope: n,
			placedSide: I,
			onArrowChange: C,
			arrowX: R,
			arrowY: ie,
			shouldHideArrow: ae,
			children: /* @__PURE__ */ y(F.div, {
				"data-side": I,
				"data-align": re,
				...g,
				ref: x,
				style: {
					...g.style,
					animation: te ? void 0 : "none"
				}
			})
		})
	});
});
ia.displayName = ta;
var aa = "PopperArrow", oa = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
}, sa = r.forwardRef(function(e, t) {
	let { __scopePopper: n, ...r } = e, i = ra(aa, n), a = oa[i.placedSide];
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
		children: /* @__PURE__ */ y(Ki, {
			...r,
			ref: t,
			style: {
				...r.style,
				display: "block"
			}
		})
	});
});
sa.displayName = aa;
function ca(e) {
	return e !== null;
}
var la = (e) => ({
	name: "transformOrigin",
	options: e,
	fn(t) {
		let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = ua(n), u = {
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
function ua(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
var da = Qi, fa = ea, pa = ia, ma = sa, ha = "rovingFocusGroup.onEntryFocus", ga = {
	bubbles: !1,
	cancelable: !0
}, _a = "RovingFocusGroup", [va, ya, ba] = le(_a), [xa, Sa] = L(_a, [ba]), [Ca, wa] = xa(_a), Ta = r.forwardRef((e, t) => /* @__PURE__ */ y(va.Provider, {
	scope: e.__scopeRovingFocusGroup,
	children: /* @__PURE__ */ y(va.Slot, {
		scope: e.__scopeRovingFocusGroup,
		children: /* @__PURE__ */ y(Ea, {
			...e,
			ref: t
		})
	})
}));
Ta.displayName = _a;
var Ea = r.forwardRef((e, t) => {
	let { __scopeRovingFocusGroup: n, orientation: i, loop: a = !1, dir: o, currentTabStopId: s, defaultCurrentTabStopId: c, onCurrentTabStopIdChange: l, onEntryFocus: u, preventScrollOnEntryFocus: d = !1, ...f } = e, p = r.useRef(null), m = k(t, p), h = we(o), [g, _] = fe({
		prop: s,
		defaultProp: c ?? null,
		onChange: l,
		caller: _a
	}), [v, b] = r.useState(!1), x = Te(u), S = ya(n), C = r.useRef(!1), [w, T] = r.useState(0);
	return r.useEffect(() => {
		let e = p.current;
		if (e) return e.addEventListener(ha, x), () => e.removeEventListener(ha, x);
	}, [x]), /* @__PURE__ */ y(Ca, {
		scope: n,
		orientation: i,
		dir: h,
		loop: a,
		currentTabStopId: g,
		onItemFocus: r.useCallback((e) => _(e), [_]),
		onItemShiftTab: r.useCallback(() => b(!0), []),
		onFocusableItemAdd: r.useCallback(() => T((e) => e + 1), []),
		onFocusableItemRemove: r.useCallback(() => T((e) => e - 1), []),
		children: /* @__PURE__ */ y(F.div, {
			tabIndex: v || w === 0 ? -1 : 0,
			"data-orientation": i,
			...f,
			ref: m,
			style: {
				outline: "none",
				...e.style
			},
			onMouseDown: B(e.onMouseDown, () => {
				C.current = !0;
			}),
			onFocus: B(e.onFocus, (e) => {
				let t = !C.current;
				if (e.target === e.currentTarget && t && !v) {
					let t = new CustomEvent(ha, ga);
					if (e.currentTarget.dispatchEvent(t), !t.defaultPrevented) {
						let e = S().filter((e) => e.focusable);
						Ma([
							e.find((e) => e.active),
							e.find((e) => e.id === g),
							...e
						].filter(Boolean).map((e) => e.ref.current), d);
					}
				}
				C.current = !1;
			}),
			onBlur: B(e.onBlur, () => b(!1))
		})
	});
}), Da = "RovingFocusGroupItem", Oa = r.forwardRef((e, t) => {
	let { __scopeRovingFocusGroup: n, focusable: i = !0, active: a = !1, tabStopId: o, children: s, ...c } = e, l = Se(), u = o || l, d = wa(Da, n), f = d.currentTabStopId === u, p = ya(n), { onFocusableItemAdd: m, onFocusableItemRemove: h, currentTabStopId: g } = d;
	return r.useEffect(() => {
		if (i) return m(), () => h();
	}, [
		i,
		m,
		h
	]), /* @__PURE__ */ y(va.ItemSlot, {
		scope: n,
		id: u,
		focusable: i,
		active: a,
		children: /* @__PURE__ */ y(F.span, {
			tabIndex: f ? 0 : -1,
			"data-orientation": d.orientation,
			...c,
			ref: t,
			onMouseDown: B(e.onMouseDown, (e) => {
				i ? d.onItemFocus(u) : e.preventDefault();
			}),
			onFocus: B(e.onFocus, () => d.onItemFocus(u)),
			onKeyDown: B(e.onKeyDown, (e) => {
				if (e.key === "Tab" && e.shiftKey) {
					d.onItemShiftTab();
					return;
				}
				if (e.target !== e.currentTarget) return;
				let t = ja(e, d.orientation, d.dir);
				if (t !== void 0) {
					if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
					e.preventDefault();
					let n = p().filter((e) => e.focusable).map((e) => e.ref.current);
					if (t === "last") n.reverse();
					else if (t === "prev" || t === "next") {
						t === "prev" && n.reverse();
						let r = n.indexOf(e.currentTarget);
						n = d.loop ? Na(n, r + 1) : n.slice(r + 1);
					}
					setTimeout(() => Ma(n));
				}
			}),
			children: typeof s == "function" ? s({
				isCurrentTabStop: f,
				hasTabStop: g != null
			}) : s
		})
	});
});
Oa.displayName = Da;
var ka = {
	ArrowLeft: "prev",
	ArrowUp: "prev",
	ArrowRight: "next",
	ArrowDown: "next",
	PageUp: "first",
	Home: "first",
	PageDown: "last",
	End: "last"
};
function Aa(e, t) {
	return t === "rtl" ? e === "ArrowLeft" ? "ArrowRight" : e === "ArrowRight" ? "ArrowLeft" : e : e;
}
function ja(e, t, n) {
	let r = Aa(e.key, n);
	if (!(t === "vertical" && ["ArrowLeft", "ArrowRight"].includes(r)) && !(t === "horizontal" && ["ArrowUp", "ArrowDown"].includes(r))) return ka[r];
}
function Ma(e, t = !1) {
	let n = document.activeElement;
	for (let r of e) if (r === n || (r.focus({ preventScroll: t }), document.activeElement !== n)) return;
}
function Na(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
var Pa = Ta, Fa = Oa, Ia = "Label", La = r.forwardRef((e, t) => /* @__PURE__ */ y(F.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
La.displayName = Ia;
var Ra = La;
//#endregion
//#region node_modules/@radix-ui/number/dist/index.mjs
function za(e, [t, n]) {
	return Math.min(n, Math.max(t, e));
}
//#endregion
//#region node_modules/@radix-ui/react-select/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function Ba(e) {
	let t = /* @__PURE__ */ Va(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Ua);
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
function Va(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Ga(n), a = Wa(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? O(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Ha = Symbol("radix.slottable");
function Ua(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Ha;
}
function Wa(e, t) {
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
function Ga(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-select/dist/index.mjs
var Ka = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], qa = [" ", "Enter"], Ja = "Select", [Ya, Xa, Za] = le(Ja), [Qa, $a] = L(Ja, [Za, Yi]), eo = Yi(), [to, no] = Qa(Ja), [ro, io] = Qa(Ja), ao = (e) => {
	let { __scopeSelect: t, children: n, open: i, defaultOpen: a, onOpenChange: o, value: s, defaultValue: c, onValueChange: l, dir: u, name: d, autoComplete: f, disabled: p, required: m, form: h } = e, g = eo(t), [_, v] = r.useState(null), [x, S] = r.useState(null), [C, w] = r.useState(!1), T = we(u), [E, D] = fe({
		prop: i,
		defaultProp: a ?? !1,
		onChange: o,
		caller: Ja
	}), [O, k] = fe({
		prop: s,
		defaultProp: c,
		onChange: l,
		caller: Ja
	}), A = r.useRef(null), j = _ ? h || !!_.closest("form") : !0, [M, N] = r.useState(/* @__PURE__ */ new Set()), P = Array.from(M).map((e) => e.props.value).join(";");
	return /* @__PURE__ */ y(da, {
		...g,
		children: /* @__PURE__ */ b(to, {
			required: m,
			scope: t,
			trigger: _,
			onTriggerChange: v,
			valueNode: x,
			onValueNodeChange: S,
			valueNodeHasChildren: C,
			onValueNodeHasChildrenChange: w,
			contentId: Se(),
			value: O,
			onValueChange: k,
			open: E,
			onOpenChange: D,
			dir: T,
			triggerPointerDownPosRef: A,
			disabled: p,
			children: [/* @__PURE__ */ y(Ya.Provider, {
				scope: t,
				children: /* @__PURE__ */ y(ro, {
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
			}), j ? /* @__PURE__ */ b(ts, {
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
ao.displayName = Ja;
var oo = "SelectTrigger", so = r.forwardRef((e, t) => {
	let { __scopeSelect: n, disabled: i = !1, ...a } = e, o = eo(n), s = no(oo, n), c = s.disabled || i, l = k(t, s.onTriggerChange), u = Xa(n), d = r.useRef("touch"), [f, p, m] = rs((e) => {
		let t = u().filter((e) => !e.disabled), n = is(t, e, t.find((e) => e.value === s.value));
		n !== void 0 && s.onValueChange(n.value);
	}), h = (e) => {
		c || (s.onOpenChange(!0), m()), e && (s.triggerPointerDownPosRef.current = {
			x: Math.round(e.pageX),
			y: Math.round(e.pageY)
		});
	};
	return /* @__PURE__ */ y(fa, {
		asChild: !0,
		...o,
		children: /* @__PURE__ */ y(F.button, {
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
			"data-placeholder": ns(s.value) ? "" : void 0,
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
				!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && p(e.key), !(t && e.key === " ") && Ka.includes(e.key) && (h(), e.preventDefault());
			})
		})
	});
});
so.displayName = oo;
var co = "SelectValue", lo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: r, style: i, children: a, placeholder: o = "", ...s } = e, c = no(co, n), { onValueNodeHasChildrenChange: l } = c, u = a !== void 0, d = k(t, c.onValueNodeChange);
	return ue(() => {
		l(u);
	}, [l, u]), /* @__PURE__ */ y(F.span, {
		...s,
		ref: d,
		style: { pointerEvents: "none" },
		children: ns(c.value) ? /* @__PURE__ */ y(v, { children: o }) : a
	});
});
lo.displayName = co;
var uo = "SelectIcon", fo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, children: r, ...i } = e;
	return /* @__PURE__ */ y(F.span, {
		"aria-hidden": !0,
		...i,
		ref: t,
		children: r || "▼"
	});
});
fo.displayName = uo;
var po = "SelectPortal", mo = (e) => /* @__PURE__ */ y(rt, {
	asChild: !0,
	...e
});
mo.displayName = po;
var ho = "SelectContent", go = r.forwardRef((e, t) => {
	let n = no(ho, e.__scopeSelect), [i, a] = r.useState();
	if (ue(() => {
		a(new DocumentFragment());
	}, []), !n.open) {
		let t = i;
		return t ? g.createPortal(/* @__PURE__ */ y(vo, {
			scope: e.__scopeSelect,
			children: /* @__PURE__ */ y(Ya.Slot, {
				scope: e.__scopeSelect,
				children: /* @__PURE__ */ y("div", { children: e.children })
			})
		}), t) : null;
	}
	return /* @__PURE__ */ y(So, {
		...e,
		ref: t
	});
});
go.displayName = ho;
var _o = 10, [vo, yo] = Qa(ho), bo = "SelectContentImpl", xo = /* @__PURE__ */ Ba("SelectContent.RemoveScroll"), So = r.forwardRef((e, t) => {
	let { __scopeSelect: n, position: i = "item-aligned", onCloseAutoFocus: a, onEscapeKeyDown: o, onPointerDownOutside: s, side: c, sideOffset: l, align: u, alignOffset: d, arrowPadding: f, collisionBoundary: p, collisionPadding: m, sticky: h, hideWhenDetached: g, avoidCollisions: _, ...v } = e, b = no(ho, n), [x, S] = r.useState(null), [C, w] = r.useState(null), T = k(t, (e) => S(e)), [E, D] = r.useState(null), [O, A] = r.useState(null), j = Xa(n), [M, N] = r.useState(!1), P = r.useRef(!1);
	r.useEffect(() => {
		if (x) return kn(x);
	}, [x]), at();
	let ee = r.useCallback((e) => {
		let [t, ...n] = j().map((e) => e.ref.current), [r] = n.slice(-1), i = document.activeElement;
		for (let n of e) if (n === i || (n?.scrollIntoView({ block: "nearest" }), n === t && C && (C.scrollTop = 0), n === r && C && (C.scrollTop = C.scrollHeight), n?.focus(), document.activeElement !== i)) return;
	}, [j, C]), F = r.useCallback(() => ee([E, x]), [
		ee,
		E,
		x
	]);
	r.useEffect(() => {
		M && F();
	}, [M, F]);
	let { onOpenChange: te, triggerPointerDownPosRef: ne } = b;
	r.useEffect(() => {
		if (x) {
			let e = {
				x: 0,
				y: 0
			}, t = (t) => {
				e = {
					x: Math.abs(Math.round(t.pageX) - (ne.current?.x ?? 0)),
					y: Math.abs(Math.round(t.pageY) - (ne.current?.y ?? 0))
				};
			}, n = (n) => {
				e.x <= 10 && e.y <= 10 ? n.preventDefault() : x.contains(n.target) || te(!1), document.removeEventListener("pointermove", t), ne.current = null;
			};
			return ne.current !== null && (document.addEventListener("pointermove", t), document.addEventListener("pointerup", n, {
				capture: !0,
				once: !0
			})), () => {
				document.removeEventListener("pointermove", t), document.removeEventListener("pointerup", n, { capture: !0 });
			};
		}
	}, [
		x,
		te,
		ne
	]), r.useEffect(() => {
		let e = () => te(!1);
		return window.addEventListener("blur", e), window.addEventListener("resize", e), () => {
			window.removeEventListener("blur", e), window.removeEventListener("resize", e);
		};
	}, [te]);
	let [I, re] = rs((e) => {
		let t = j().filter((e) => !e.disabled), n = is(t, e, t.find((e) => e.ref.current === document.activeElement));
		n && setTimeout(() => n.ref.current.focus());
	}), L = r.useCallback((e, t, n) => {
		let r = !P.current && !n;
		(b.value !== void 0 && b.value === t || r) && (D(e), r && (P.current = !0));
	}, [b.value]), R = r.useCallback(() => x?.focus(), [x]), ie = r.useCallback((e, t, n) => {
		let r = !P.current && !n;
		(b.value !== void 0 && b.value === t || r) && A(e);
	}, [b.value]), ae = i === "popper" ? Eo : wo, z = ae === Eo ? {
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
	return /* @__PURE__ */ y(vo, {
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
		searchRef: I,
		children: /* @__PURE__ */ y(bn, {
			as: xo,
			allowPinchZoom: !0,
			children: /* @__PURE__ */ y(We, {
				asChild: !0,
				trapped: b.open,
				onMountAutoFocus: (e) => {
					e.preventDefault();
				},
				onUnmountAutoFocus: B(a, (e) => {
					b.trigger?.focus({ preventScroll: !0 }), e.preventDefault();
				}),
				children: /* @__PURE__ */ y(Ne, {
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
								let t = j().filter((e) => !e.disabled).map((e) => e.ref.current);
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
So.displayName = bo;
var Co = "SelectItemAlignedPosition", wo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onPlaced: i, ...a } = e, o = no(ho, n), s = yo(ho, n), [c, l] = r.useState(null), [u, d] = r.useState(null), f = k(t, (e) => d(e)), p = Xa(n), m = r.useRef(!1), h = r.useRef(!0), { viewport: g, selectedItem: _, selectedItemText: v, focusSelectedItem: b } = s, x = r.useCallback(() => {
		if (o.trigger && o.valueNode && c && u && g && _ && v) {
			let e = o.trigger.getBoundingClientRect(), t = u.getBoundingClientRect(), n = o.valueNode.getBoundingClientRect(), r = v.getBoundingClientRect();
			if (o.dir !== "rtl") {
				let i = r.left - t.left, a = n.left - i, o = e.left - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - _o, d = za(a, [_o, Math.max(_o, u - l)]);
				c.style.minWidth = s + "px", c.style.left = d + "px";
			} else {
				let i = t.right - r.right, a = window.innerWidth - n.right - i, o = window.innerWidth - e.right - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - _o, d = za(a, [_o, Math.max(_o, u - l)]);
				c.style.minWidth = s + "px", c.style.right = d + "px";
			}
			let a = p(), s = window.innerHeight - _o * 2, l = g.scrollHeight, d = window.getComputedStyle(u), f = parseInt(d.borderTopWidth, 10), h = parseInt(d.paddingTop, 10), y = parseInt(d.borderBottomWidth, 10), b = parseInt(d.paddingBottom, 10), x = f + h + l + b + y, S = Math.min(_.offsetHeight * 5, x), C = window.getComputedStyle(g), w = parseInt(C.paddingTop, 10), T = parseInt(C.paddingBottom, 10), E = e.top + e.height / 2 - _o, D = s - E, O = _.offsetHeight / 2, k = _.offsetTop + O, A = f + h + k, j = x - A;
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
			c.style.margin = `${_o}px 0`, c.style.minHeight = S + "px", c.style.maxHeight = s + "px", i?.(), requestAnimationFrame(() => m.current = !0);
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
	ue(() => x(), [x]);
	let [S, C] = r.useState();
	return ue(() => {
		u && C(window.getComputedStyle(u).zIndex);
	}, [u]), /* @__PURE__ */ y(Do, {
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
			children: /* @__PURE__ */ y(F.div, {
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
wo.displayName = Co;
var To = "SelectPopperPosition", Eo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, align: r = "start", collisionPadding: i = _o, ...a } = e;
	return /* @__PURE__ */ y(pa, {
		...eo(n),
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
Eo.displayName = To;
var [Do, Oo] = Qa(ho, {}), ko = "SelectViewport", Ao = r.forwardRef((e, t) => {
	let { __scopeSelect: n, nonce: i, ...a } = e, o = yo(ko, n), s = Oo(ko, n), c = k(t, o.onViewportChange), l = r.useRef(0);
	return /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y("style", {
		dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" },
		nonce: i
	}), /* @__PURE__ */ y(Ya.Slot, {
		scope: n,
		children: /* @__PURE__ */ y(F.div, {
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
						let r = window.innerHeight - _o * 2, i = parseFloat(n.style.minHeight), a = parseFloat(n.style.height), o = Math.max(i, a);
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
Ao.displayName = ko;
var jo = "SelectGroup", [Mo, No] = Qa(jo), Po = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = Se();
	return /* @__PURE__ */ y(Mo, {
		scope: n,
		id: i,
		children: /* @__PURE__ */ y(F.div, {
			role: "group",
			"aria-labelledby": i,
			...r,
			ref: t
		})
	});
});
Po.displayName = jo;
var Fo = "SelectLabel", Io = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = No(Fo, n);
	return /* @__PURE__ */ y(F.div, {
		id: i.id,
		...r,
		ref: t
	});
});
Io.displayName = Fo;
var Lo = "SelectItem", [Ro, zo] = Qa(Lo), Bo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, value: i, disabled: a = !1, textValue: o, ...s } = e, c = no(Lo, n), l = yo(Lo, n), u = c.value === i, [d, f] = r.useState(o ?? ""), [p, m] = r.useState(!1), h = k(t, (e) => l.itemRefCallback?.(e, i, a)), g = Se(), _ = r.useRef("touch"), v = () => {
		a || (c.onValueChange(i), c.onOpenChange(!1));
	};
	if (i === "") throw Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
	return /* @__PURE__ */ y(Ro, {
		scope: n,
		value: i,
		disabled: a,
		textId: g,
		isSelected: u,
		onItemTextChange: r.useCallback((e) => {
			f((t) => t || (e?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ y(Ya.ItemSlot, {
			scope: n,
			value: i,
			disabled: a,
			textValue: d,
			children: /* @__PURE__ */ y(F.div, {
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
					l.searchRef?.current !== "" && e.key === " " || (qa.includes(e.key) && v(), e.key === " " && e.preventDefault());
				})
			})
		})
	});
});
Bo.displayName = Lo;
var Vo = "SelectItemText", Ho = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: i, style: a, ...o } = e, s = no(Vo, n), c = yo(Vo, n), l = zo(Vo, n), u = io(Vo, n), [d, f] = r.useState(null), p = k(t, (e) => f(e), l.onItemTextChange, (e) => c.itemTextRefCallback?.(e, l.value, l.disabled)), m = d?.textContent, h = r.useMemo(() => /* @__PURE__ */ y("option", {
		value: l.value,
		disabled: l.disabled,
		children: m
	}, l.value), [
		l.disabled,
		l.value,
		m
	]), { onNativeOptionAdd: _, onNativeOptionRemove: x } = u;
	return ue(() => (_(h), () => x(h)), [
		_,
		x,
		h
	]), /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y(F.span, {
		id: l.textId,
		...o,
		ref: p
	}), l.isSelected && s.valueNode && !s.valueNodeHasChildren ? g.createPortal(o.children, s.valueNode) : null] });
});
Ho.displayName = Vo;
var Uo = "SelectItemIndicator", Wo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return zo(Uo, n).isSelected ? /* @__PURE__ */ y(F.span, {
		"aria-hidden": !0,
		...r,
		ref: t
	}) : null;
});
Wo.displayName = Uo;
var Go = "SelectScrollUpButton", Ko = r.forwardRef((e, t) => {
	let n = yo(Go, e.__scopeSelect), i = Oo(Go, e.__scopeSelect), [a, o] = r.useState(!1), s = k(t, i.onScrollButtonChange);
	return ue(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				o(t.scrollTop > 0);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ y(Yo, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop -= t.offsetHeight);
		}
	}) : null;
});
Ko.displayName = Go;
var qo = "SelectScrollDownButton", Jo = r.forwardRef((e, t) => {
	let n = yo(qo, e.__scopeSelect), i = Oo(qo, e.__scopeSelect), [a, o] = r.useState(!1), s = k(t, i.onScrollButtonChange);
	return ue(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				let e = t.scrollHeight - t.clientHeight;
				o(Math.ceil(t.scrollTop) < e);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ y(Yo, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop += t.offsetHeight);
		}
	}) : null;
});
Jo.displayName = qo;
var Yo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onAutoScroll: i, ...a } = e, o = yo("SelectScrollButton", n), s = r.useRef(null), c = Xa(n), l = r.useCallback(() => {
		s.current !== null && (window.clearInterval(s.current), s.current = null);
	}, []);
	return r.useEffect(() => () => l(), [l]), ue(() => {
		c().find((e) => e.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
	}, [c]), /* @__PURE__ */ y(F.div, {
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
}), Xo = "SelectSeparator", Zo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return /* @__PURE__ */ y(F.div, {
		"aria-hidden": !0,
		...r,
		ref: t
	});
});
Zo.displayName = Xo;
var Qo = "SelectArrow", $o = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = eo(n), a = no(Qo, n), o = yo(Qo, n);
	return a.open && o.position === "popper" ? /* @__PURE__ */ y(ma, {
		...i,
		...r,
		ref: t
	}) : null;
});
$o.displayName = Qo;
var es = "SelectBubbleInput", ts = r.forwardRef(({ __scopeSelect: e, value: t, ...n }, i) => {
	let a = r.useRef(null), o = k(i, a), s = An(t);
	return r.useEffect(() => {
		let e = a.current;
		if (!e) return;
		let n = window.HTMLSelectElement.prototype, r = Object.getOwnPropertyDescriptor(n, "value").set;
		if (s !== t && r) {
			let n = new Event("change", { bubbles: !0 });
			r.call(e, t), e.dispatchEvent(n);
		}
	}, [s, t]), /* @__PURE__ */ y(F.select, {
		...n,
		style: {
			...ne,
			...n.style
		},
		ref: o,
		defaultValue: t
	});
});
ts.displayName = es;
function ns(e) {
	return e === "" || e === void 0;
}
function rs(e) {
	let t = Te(e), n = r.useRef(""), i = r.useRef(0), a = r.useCallback((e) => {
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
function is(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = as(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.textValue.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
function as(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
var os = ao, ss = so, cs = lo, ls = fo, us = mo, ds = go, fs = Ao, ps = Bo, ms = Ho, hs = Wo, gs = Ko, _s = Jo;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function vs(e) {
	let t = /* @__PURE__ */ bs(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Ss);
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
var ys = /* @__PURE__ */ vs("Slot");
/* @__NO_SIDE_EFFECTS__ */
function bs(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = ws(n), a = Cs(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? O(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var xs = Symbol("radix.slottable");
function Ss(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === xs;
}
function Cs(e, t) {
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
function ws(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-switch/dist/index.mjs
var Ts = "Switch", [Es, Ds] = L(Ts), [Os, ks] = Es(Ts), As = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, name: i, checked: a, defaultChecked: o, required: s, disabled: c, value: l = "on", onCheckedChange: u, form: d, ...f } = e, [p, m] = r.useState(null), h = k(t, (e) => m(e)), g = r.useRef(!1), _ = p ? d || !!p.closest("form") : !0, [v, x] = fe({
		prop: a,
		defaultProp: o ?? !1,
		onChange: u,
		caller: Ts
	});
	return /* @__PURE__ */ b(Os, {
		scope: n,
		checked: v,
		disabled: c,
		children: [/* @__PURE__ */ y(F.button, {
			type: "button",
			role: "switch",
			"aria-checked": v,
			"aria-required": s,
			"data-state": Fs(v),
			"data-disabled": c ? "" : void 0,
			disabled: c,
			value: l,
			...f,
			ref: h,
			onClick: B(e.onClick, (e) => {
				x((e) => !e), _ && (g.current = e.isPropagationStopped(), g.current || e.stopPropagation());
			})
		}), _ && /* @__PURE__ */ y(Ps, {
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
As.displayName = Ts;
var js = "SwitchThumb", Ms = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, ...r } = e, i = ks(js, n);
	return /* @__PURE__ */ y(F.span, {
		"data-state": Fs(i.checked),
		"data-disabled": i.disabled ? "" : void 0,
		...r,
		ref: t
	});
});
Ms.displayName = js;
var Ns = "SwitchBubbleInput", Ps = r.forwardRef(({ __scopeSwitch: e, control: t, checked: n, bubbles: i = !0, ...a }, o) => {
	let s = r.useRef(null), c = k(s, o), l = An(n), u = jn(t);
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
	]), /* @__PURE__ */ y("input", {
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
Ps.displayName = Ns;
function Fs(e) {
	return e ? "checked" : "unchecked";
}
var Is = As, Ls = Ms, Rs = "Tabs", [zs, Bs] = L(Rs, [Sa]), Vs = Sa(), [Hs, Us] = zs(Rs), Ws = r.forwardRef((e, t) => {
	let { __scopeTabs: n, value: r, onValueChange: i, defaultValue: a, orientation: o = "horizontal", dir: s, activationMode: c = "automatic", ...l } = e, u = we(s), [d, f] = fe({
		prop: r,
		onChange: i,
		defaultProp: a ?? "",
		caller: Rs
	});
	return /* @__PURE__ */ y(Hs, {
		scope: n,
		baseId: Se(),
		value: d,
		onValueChange: f,
		orientation: o,
		dir: u,
		activationMode: c,
		children: /* @__PURE__ */ y(F.div, {
			dir: u,
			"data-orientation": o,
			...l,
			ref: t
		})
	});
});
Ws.displayName = Rs;
var Gs = "TabsList", Ks = r.forwardRef((e, t) => {
	let { __scopeTabs: n, loop: r = !0, ...i } = e, a = Us(Gs, n);
	return /* @__PURE__ */ y(Pa, {
		asChild: !0,
		...Vs(n),
		orientation: a.orientation,
		dir: a.dir,
		loop: r,
		children: /* @__PURE__ */ y(F.div, {
			role: "tablist",
			"aria-orientation": a.orientation,
			...i,
			ref: t
		})
	});
});
Ks.displayName = Gs;
var qs = "TabsTrigger", Js = r.forwardRef((e, t) => {
	let { __scopeTabs: n, value: r, disabled: i = !1, ...a } = e, o = Us(qs, n), s = Vs(n), c = Zs(o.baseId, r), l = Qs(o.baseId, r), u = r === o.value;
	return /* @__PURE__ */ y(Fa, {
		asChild: !0,
		...s,
		focusable: !i,
		active: u,
		children: /* @__PURE__ */ y(F.button, {
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
			onMouseDown: B(e.onMouseDown, (e) => {
				!i && e.button === 0 && e.ctrlKey === !1 ? o.onValueChange(r) : e.preventDefault();
			}),
			onKeyDown: B(e.onKeyDown, (e) => {
				[" ", "Enter"].includes(e.key) && o.onValueChange(r);
			}),
			onFocus: B(e.onFocus, () => {
				let e = o.activationMode !== "manual";
				!u && !i && e && o.onValueChange(r);
			})
		})
	});
});
Js.displayName = qs;
var Ys = "TabsContent", Xs = r.forwardRef((e, t) => {
	let { __scopeTabs: n, value: i, forceMount: a, children: o, ...s } = e, c = Us(Ys, n), l = Zs(c.baseId, i), u = Qs(c.baseId, i), d = i === c.value, f = r.useRef(d);
	return r.useEffect(() => {
		let e = requestAnimationFrame(() => f.current = !1);
		return () => cancelAnimationFrame(e);
	}, []), /* @__PURE__ */ y(ge, {
		present: a || d,
		children: ({ present: n }) => /* @__PURE__ */ y(F.div, {
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
Xs.displayName = Ys;
function Zs(e, t) {
	return `${e}-trigger-${t}`;
}
function Qs(e, t) {
	return `${e}-content-${t}`;
}
var $s = Ws, ec = Ks, tc = Js, nc = Xs, rc = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, ic = (e, t) => ({
	classGroupId: e,
	validator: t
}), ac = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), oc = "-", sc = [], cc = "arbitrary..", lc = (e) => {
	let t = fc(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return dc(e);
			let n = e.split(oc);
			return uc(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? rc(i, t) : t : i || sc;
			}
			return n[e] || sc;
		}
	};
}, uc = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = uc(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(oc) : e.slice(t).join(oc), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, dc = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? cc + r : void 0;
})(), fc = (e) => {
	let { theme: t, classGroups: n } = e;
	return pc(n, t);
}, pc = (e, t) => {
	let n = ac();
	for (let r in e) {
		let i = e[r];
		mc(i, n, r, t);
	}
	return n;
}, mc = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		hc(i, t, n, r);
	}
}, hc = (e, t, n, r) => {
	if (typeof e == "string") {
		gc(e, t, n);
		return;
	}
	if (typeof e == "function") {
		_c(e, t, n, r);
		return;
	}
	vc(e, t, n, r);
}, gc = (e, t, n) => {
	let r = e === "" ? t : yc(t, e);
	r.classGroupId = n;
}, _c = (e, t, n, r) => {
	if (bc(e)) {
		mc(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(ic(n, e));
}, vc = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		mc(o, yc(t, a), n, r);
	}
}, yc = (e, t) => {
	let n = e, r = t.split(oc), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = ac(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, bc = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, xc = (e) => {
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
}, Sc = "!", Cc = ":", wc = [], Tc = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), Ec = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === Cc) {
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
		s.endsWith(Sc) ? (c = s.slice(0, -1), l = !0) : s.startsWith(Sc) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return Tc(t, l, c, u);
	};
	if (t) {
		let e = t + Cc, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : Tc(wc, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, Dc = (e) => {
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
}, Oc = (e) => ({
	cache: xc(e.cacheSize),
	parseClassName: Ec(e),
	sortModifiers: Dc(e),
	...lc(e)
}), kc = /\s+/, Ac = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(kc), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + Sc : g, v = _ + h;
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
}, jc = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = Mc(n)) && (i && (i += " "), i += r);
	return i;
}, Mc = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = Mc(e[r])) && (n && (n += " "), n += t);
	return n;
}, Nc = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = Oc(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = Ac(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(jc(...e));
}, Pc = [], Fc = (e) => {
	let t = (t) => t[e] || Pc;
	return t.isThemeGetter = !0, t;
}, Ic = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Lc = /^\((?:(\w[\w-]*):)?(.+)\)$/i, Rc = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, zc = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Bc = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Vc = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, Hc = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Uc = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, Wc = (e) => Rc.test(e), V = (e) => !!e && !Number.isNaN(Number(e)), Gc = (e) => !!e && Number.isInteger(Number(e)), Kc = (e) => e.endsWith("%") && V(e.slice(0, -1)), qc = (e) => zc.test(e), Jc = () => !0, Yc = (e) => Bc.test(e) && !Vc.test(e), Xc = () => !1, Zc = (e) => Hc.test(e), Qc = (e) => Uc.test(e), $c = (e) => !H(e) && !U(e), el = (e) => hl(e, yl, Xc), H = (e) => Ic.test(e), tl = (e) => hl(e, bl, Yc), nl = (e) => hl(e, xl, V), rl = (e) => hl(e, Cl, Jc), il = (e) => hl(e, Sl, Xc), al = (e) => hl(e, _l, Xc), ol = (e) => hl(e, vl, Qc), sl = (e) => hl(e, wl, Zc), U = (e) => Lc.test(e), cl = (e) => gl(e, bl), ll = (e) => gl(e, Sl), ul = (e) => gl(e, _l), dl = (e) => gl(e, yl), fl = (e) => gl(e, vl), pl = (e) => gl(e, wl, !0), ml = (e) => gl(e, Cl, !0), hl = (e, t, n) => {
	let r = Ic.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, gl = (e, t, n = !1) => {
	let r = Lc.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, _l = (e) => e === "position" || e === "percentage", vl = (e) => e === "image" || e === "url", yl = (e) => e === "length" || e === "size" || e === "bg-size", bl = (e) => e === "length", xl = (e) => e === "number", Sl = (e) => e === "family-name", Cl = (e) => e === "number" || e === "weight", wl = (e) => e === "shadow", Tl = /* @__PURE__ */ Nc(() => {
	let e = Fc("color"), t = Fc("font"), n = Fc("text"), r = Fc("font-weight"), i = Fc("tracking"), a = Fc("leading"), o = Fc("breakpoint"), s = Fc("container"), c = Fc("spacing"), l = Fc("radius"), u = Fc("shadow"), d = Fc("inset-shadow"), f = Fc("text-shadow"), p = Fc("drop-shadow"), m = Fc("blur"), h = Fc("perspective"), g = Fc("aspect"), _ = Fc("ease"), v = Fc("animate"), y = () => [
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
		Wc,
		"full",
		"auto",
		...w()
	], E = () => [
		Gc,
		"none",
		"subgrid",
		U,
		H
	], D = () => [
		"auto",
		{ span: [
			"full",
			Gc,
			U,
			H
		] },
		Gc,
		U,
		H
	], O = () => [
		Gc,
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
		Wc,
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
		Wc,
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
		Wc,
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
	], te = () => [
		...b(),
		ul,
		al,
		{ position: [U, H] }
	], ne = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], I = () => [
		"auto",
		"cover",
		"contain",
		dl,
		el,
		{ size: [U, H] }
	], re = () => [
		Kc,
		cl,
		tl
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
		cl,
		tl
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
		Kc,
		ul,
		al
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
	], B = () => [
		Wc,
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
			blur: [qc],
			breakpoint: [qc],
			color: [Jc],
			container: [qc],
			"drop-shadow": [qc],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [$c],
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
			"inset-shadow": [qc],
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
			radius: [qc],
			shadow: [qc],
			spacing: ["px", V],
			text: [qc],
			"text-shadow": [qc],
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
				Wc,
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
				Gc,
				"auto",
				U,
				H
			] }],
			basis: [{ basis: [
				Wc,
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
				Wc,
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
				Gc,
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
				cl,
				tl
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				ml,
				rl
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
				Kc,
				H
			] }],
			"font-family": [{ font: [
				ll,
				il,
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
				nl
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
				tl
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
			"bg-position": [{ bg: te() }],
			"bg-repeat": [{ bg: ne() }],
			"bg-size": [{ bg: I() }],
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
						Gc,
						U,
						H
					],
					radial: [
						"",
						U,
						H
					],
					conic: [
						Gc,
						U,
						H
					]
				},
				fl,
				ol
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
				cl,
				tl
			] }],
			"outline-color": [{ outline: F() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				pl,
				sl
			] }],
			"shadow-color": [{ shadow: F() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				pl,
				sl
			] }],
			"inset-shadow-color": [{ "inset-shadow": F() }],
			"ring-w": [{ ring: R() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: F() }],
			"ring-offset-w": [{ "ring-offset": [V, tl] }],
			"ring-offset-color": [{ "ring-offset": F() }],
			"inset-ring-w": [{ "inset-ring": R() }],
			"inset-ring-color": [{ "inset-ring": F() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				pl,
				sl
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
			"mask-position": [{ mask: te() }],
			"mask-repeat": [{ mask: ne() }],
			"mask-size": [{ mask: I() }],
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
				pl,
				sl
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
				cl,
				tl,
				nl
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
function W(...e) {
	return Tl(C(e));
}
//#endregion
//#region src/components/ui/button.tsx
var El = E("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
	return /* @__PURE__ */ y(r ? ys : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: W(El({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/components/ui/card.tsx
var Dl = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function K({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card",
		"data-variant": t,
		className: W("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", Dl[t], e),
		...n
	});
}
function q({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-header",
		className: W("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function J({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-title",
		className: W("leading-none font-semibold", e),
		...t
	});
}
function Ol({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-description",
		className: W("text-sm text-muted-foreground", e),
		...t
	});
}
function Y({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-content",
		className: W("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region src/components/ui/input.tsx
function X({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ y("input", {
		type: t,
		"data-slot": "input",
		className: W("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function Z({ className: e, ...t }) {
	return /* @__PURE__ */ y(Ra, {
		"data-slot": "label",
		className: W("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var kl = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), Al = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), jl = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), Ml = (e) => {
	let t = jl(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, Nl = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, Pl = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, Fl = a({}), Il = () => c(Fl), Ll = s(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: a, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = Il() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return o("svg", {
		ref: l,
		...Nl,
		width: t ?? u ?? Nl.width,
		height: t ?? u ?? Nl.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: kl("lucide", m, i),
		...!a && !Pl(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => o(e, t)), ...Array.isArray(a) ? a : [a]]);
}), Rl = (e, t) => {
	let n = s(({ className: n, ...r }, i) => o(Ll, {
		ref: i,
		iconNode: t,
		className: kl(`lucide-${Al(Ml(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = Ml(e), n;
}, zl = Rl("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]), Bl = Rl("chevron-down", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]), Vl = Rl("chevron-up", [["path", {
	d: "m18 15-6-6-6 6",
	key: "153udz"
}]]);
//#endregion
//#region src/hooks/use-text-direction.ts
function Hl() {
	let { i18n: e } = m();
	return e.dir() === "rtl" ? "rtl" : "ltr";
}
//#endregion
//#region src/components/ui/select.tsx
function Ul({ ...e }) {
	return /* @__PURE__ */ y(os, {
		"data-slot": "select",
		...e
	});
}
function Wl({ ...e }) {
	return /* @__PURE__ */ y(cs, {
		"data-slot": "select-value",
		...e
	});
}
function Gl({ className: e, size: t = "default", children: n, ...r }) {
	return /* @__PURE__ */ b(ss, {
		"data-slot": "select-trigger",
		"data-size": t,
		dir: Hl(),
		className: W("flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap text-start shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", e),
		...r,
		children: [n, /* @__PURE__ */ y(ls, {
			asChild: !0,
			children: /* @__PURE__ */ y(Bl, { className: "size-4 opacity-50" })
		})]
	});
}
function Kl({ className: e, children: t, position: n = "popper", align: r = "start", ...i }) {
	return /* @__PURE__ */ y(vn, {
		allowBodyScroll: !0,
		children: /* @__PURE__ */ y(us, { children: /* @__PURE__ */ b(ds, {
			"data-slot": "select-content",
			dir: Hl(),
			className: W("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-start text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", e),
			position: n,
			align: r,
			...i,
			children: [
				/* @__PURE__ */ y(Jl, {}),
				/* @__PURE__ */ y(fs, {
					className: W("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
					children: t
				}),
				/* @__PURE__ */ y(Yl, {})
			]
		}) })
	});
}
function ql({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ b(ps, {
		"data-slot": "select-item",
		className: W("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pe-8 ps-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", e),
		...n,
		children: [/* @__PURE__ */ y("span", {
			"data-slot": "select-item-indicator",
			className: "absolute end-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ y(hs, { children: /* @__PURE__ */ y(zl, { className: "size-4" }) })
		}), /* @__PURE__ */ y(ms, { children: t })]
	});
}
function Jl({ className: e, ...t }) {
	return /* @__PURE__ */ y(gs, {
		"data-slot": "select-scroll-up-button",
		className: W("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ y(Vl, { className: "size-4" })
	});
}
function Yl({ className: e, ...t }) {
	return /* @__PURE__ */ y(_s, {
		"data-slot": "select-scroll-down-button",
		className: W("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ y(Bl, { className: "size-4" })
	});
}
//#endregion
//#region src/lib/safeUrl.ts
function Xl(e) {
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
function Zl() {
	return window.webinoDashboard;
}
var Ql = 3e4;
function $l(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function eu(e) {
	let t = Zl();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if ($l(e) || Xl(e)) return e;
	throw new du("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function tu(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function nu(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : null;
}
function ru(e, t) {
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
function iu(e, t) {
	let n = e.toLowerCase();
	return e.includes("Upstream Error") || e.includes("Forbidden") || t === 403 ? "admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry" : n.includes("timed out") || n.includes("timeout") || t === 504 || t === 524 ? "Request timed out — RSA-4096 generation can take over a minute on weak hosts" : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? `Invalid AJAX response (HTML, HTTP ${t || 0})` : `Invalid AJAX response (HTTP ${t || 0})`;
}
async function au(e, t, n = {}) {
	let r = nu(e), i = Zl();
	if (!r || !i.ajaxUrl) throw new du("AJAX fallback unavailable", {
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
	let { signal: l, clear: u } = tu({}, t);
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
			throw new du(iu(t, e.status), {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!n.success) throw new du(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
			code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
			status: e.status
		});
		return n.data;
	} catch (e) {
		throw e instanceof du ? e : e instanceof DOMException && e.name === "AbortError" ? new du("Request timed out", {
			code: "timeout",
			status: 0
		}) : e instanceof TypeError ? new du("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		u();
	}
}
async function Q(e, t = {}, n = Ql) {
	if (nu(e) && Zl().ajaxUrl) return au(e, n, t);
	let r = eu(e), i = Zl(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce), !Object.keys(a).some((e) => e.toLowerCase() === "content-type") && typeof t.body == "string" && t.body.length > 0 && (a["Content-Type"] = "application/json");
	let { signal: s, clear: c } = tu(t, n);
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
			let t = ru(n, e.status);
			throw new du(t.message, {
				code: t.code,
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i;
			throw new du(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
		}
		return i;
	} catch (e) {
		throw e instanceof du ? e : e instanceof DOMException && e.name === "AbortError" ? new du("Request timed out", {
			code: "timeout",
			status: 0
		}) : e instanceof TypeError ? new du("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region src/lib/marketplace-api.ts
function ou(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function su(e) {
	"@babel/helpers - typeof";
	return su = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, su(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function cu(e, t) {
	if (su(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (su(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function lu(e) {
	var t = cu(e, "string");
	return su(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function uu(e, t, n) {
	return (t = lu(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/lib/apiError.ts
var du = class extends Error {
	constructor(e, t) {
		super(e), uu(this, "code", void 0), uu(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, fu = {
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
function pu(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function mu(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function hu(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(ou(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function gu(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return hu(e, n);
	if (t instanceof du && t.code) {
		let n = fu[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = fu[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return pu(n) ? e("errors.api.timeout") : mu(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function $(e, t) {
	h.error(gu(e, t));
}
//#endregion
//#region src/hooks/useQueryErrorToast.ts
function _u(e) {
	let { t } = m(), n = f(!1);
	l(() => {
		e.isError && e.error ? n.current || (n.current = !0, h.error(gu(t, e.error))) : n.current = !1;
	}, [
		e.isError,
		e.error,
		e.fetchStatus,
		t
	]);
}
//#endregion
//#region ../Modules/tapin-module/client/components/OrderTapinPanel.tsx
function vu(e) {
	let t = window.open("", "_blank");
	t && (t.document.write(e), t.document.close());
}
function yu({ orderId: r }) {
	let { t: i } = m(), a = n(), [o, s] = p(0), [c, u] = p(0), [d, f] = p(1), [g, _] = p(1), [x, S] = p(0), [C, w] = p(0), [T, E] = p(""), D = t({
		queryKey: ["tapin-order", r],
		queryFn: () => Q(`shipping/tapin/orders/${r}`),
		enabled: r > 0
	});
	_u(D);
	let O = t({
		queryKey: ["tapin-kiosks"],
		queryFn: () => Q("shipping/tapin/kiosks"),
		enabled: !!D.data?.shipment?.connected
	});
	l(() => {
		if (D.data?.shipment) {
			let e = D.data.shipment;
			s(e.province_code || 0), u(e.city_code || 0), f(e.box_id || 1), _(e.content_type || 1), S(e.weight || 0), w(e.kiosk_id || 0);
		}
	}, [D.data]);
	let k = t({
		queryKey: ["tapin-cities", o],
		queryFn: () => Q(`shipping/tapin/cities?province=${o}`),
		enabled: o > 0
	}), A = () => {
		a.invalidateQueries({ queryKey: ["tapin-order", r] }), a.invalidateQueries({ queryKey: ["order", r] });
	}, j = e({
		mutationFn: () => Q(`shipping/tapin/orders/${r}/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				box_id: d,
				content_type: g,
				weight: x,
				kiosk_id: C
			})
		}),
		onSuccess: (e) => {
			e.ok ? h.success(e.message) : h.error(e.message), A();
		},
		onError: (e) => $(i, e)
	}), M = e({
		mutationFn: () => Q(`shipping/tapin/orders/${r}/edit`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				province_code: o,
				city_code: c,
				box_id: d,
				content_type: g,
				package_weight: x,
				kiosk_id: C
			})
		}),
		onSuccess: (e) => {
			e.ok ? h.success(e.message) : h.error(e.message), A();
		},
		onError: (e) => $(i, e)
	}), N = e({
		mutationFn: () => Q(`shipping/tapin/orders/${r}/detail`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}"
		}),
		onSuccess: (e) => {
			e.ok ? (h.success(e.message), E(JSON.stringify(e.detail ?? {}, null, 2))) : h.error(e.message), A();
		},
		onError: (e) => $(i, e)
	}), P = e({
		mutationFn: () => Q(`shipping/tapin/orders/${r}/ready`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}"
		}),
		onSuccess: (e) => {
			e.ok ? h.success(e.message) : h.error(e.message), A();
		},
		onError: (e) => $(i, e)
	}), ee = e({
		mutationFn: () => Q(`shipping/tapin/orders/${r}/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}"
		}),
		onSuccess: (e) => {
			e.ok ? h.success(e.message) : h.error(e.message), A();
		},
		onError: (e) => $(i, e)
	}), F = e({
		mutationFn: (e) => Q(`shipping/tapin/orders/${r}/label`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ kind: e })
		}),
		onSuccess: (e) => {
			if (!e.ok) {
				h.error(e.message);
				return;
			}
			h.success(e.message), e.html && vu(e.html);
		},
		onError: (e) => $(i, e)
	}), te = e({
		mutationFn: () => Q(`shipping/tapin/orders/${r}/location`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				province_code: o,
				city_code: c
			})
		}),
		onSuccess: () => {
			h.success(i("common.saved")), A();
		},
		onError: (e) => $(i, e)
	}), ne = e({
		mutationFn: () => Q(`shipping/tapin/orders/${r}/meta`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				box_id: d,
				content_type: g,
				weight: x,
				kiosk_id: C
			})
		}),
		onSuccess: () => h.success(i("common.saved")),
		onError: (e) => $(i, e)
	}), I = D.data?.shipment, re = D.data?.provinces ?? [], L = k.data?.items ?? [], R = I?.packing_boxes ?? [], ie = O.data?.items ?? [];
	return /* @__PURE__ */ b(K, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ y(q, {
			className: "pb-2",
			children: /* @__PURE__ */ y(J, {
				className: "text-base",
				children: i("tapin.orderTitle")
			})
		}), /* @__PURE__ */ y(Y, {
			className: "space-y-3 text-sm",
			children: D.isPending ? /* @__PURE__ */ y("p", {
				className: "text-muted-foreground",
				children: i("common.loading")
			}) : /* @__PURE__ */ b(v, { children: [
				/* @__PURE__ */ b("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: [/* @__PURE__ */ b("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ y(Z, { children: i("tapin.province") }), /* @__PURE__ */ b(Ul, {
							value: o ? String(o) : void 0,
							onValueChange: (e) => {
								s(parseInt(e, 10) || 0), u(0);
							},
							children: [/* @__PURE__ */ y(Gl, { children: /* @__PURE__ */ y(Wl, { placeholder: i("tapin.pickProvince") }) }), /* @__PURE__ */ y(Kl, { children: re.map((e) => /* @__PURE__ */ y(ql, {
								value: String(e.code),
								children: e.title
							}, e.code)) })]
						})]
					}), /* @__PURE__ */ b("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ y(Z, { children: i("tapin.city") }), /* @__PURE__ */ b(Ul, {
							value: c ? String(c) : void 0,
							onValueChange: (e) => u(parseInt(e, 10) || 0),
							children: [/* @__PURE__ */ y(Gl, { children: /* @__PURE__ */ y(Wl, { placeholder: i("tapin.pickCity") }) }), /* @__PURE__ */ y(Kl, { children: L.map((e) => /* @__PURE__ */ y(ql, {
								value: String(e.code),
								children: e.title
							}, e.code)) })]
						})]
					})]
				}),
				/* @__PURE__ */ y(G, {
					type: "button",
					size: "sm",
					variant: "secondary",
					disabled: te.isPending,
					onClick: () => void te.mutate(),
					children: i("tapin.saveAddress")
				}),
				/* @__PURE__ */ b("div", {
					className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ b("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ y(Z, { children: i("tapin.boxSize") }), /* @__PURE__ */ b(Ul, {
								value: String(d),
								onValueChange: (e) => f(parseInt(e, 10) || 1),
								children: [/* @__PURE__ */ y(Gl, { children: /* @__PURE__ */ y(Wl, {}) }), /* @__PURE__ */ y(Kl, { children: (R.length ? R : Array.from({ length: 13 }, (e, t) => ({
									id: t + 1,
									title: String(t + 1)
								}))).map((e) => /* @__PURE__ */ y(ql, {
									value: String(e.id),
									children: e.title
								}, e.id)) })]
							})]
						}),
						/* @__PURE__ */ b("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ y(Z, { children: i("tapin.contentType") }), /* @__PURE__ */ y(X, {
								type: "number",
								dir: "ltr",
								value: g,
								onChange: (e) => _(parseInt(e.target.value, 10) || 1)
							})]
						}),
						/* @__PURE__ */ b("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ y(Z, { children: i("tapin.orderWeight") }), /* @__PURE__ */ y(X, {
								type: "number",
								dir: "ltr",
								value: x,
								onChange: (e) => S(parseInt(e.target.value, 10) || 0)
							})]
						}),
						/* @__PURE__ */ b("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ y(Z, { children: i("tapin.kiosk") }), /* @__PURE__ */ b(Ul, {
								value: String(C),
								onValueChange: (e) => w(parseInt(e, 10) || 0),
								children: [/* @__PURE__ */ y(Gl, { children: /* @__PURE__ */ y(Wl, {}) }), /* @__PURE__ */ b(Kl, { children: [/* @__PURE__ */ y(ql, {
									value: "0",
									children: i("tapin.kioskNone")
								}), ie.map((e) => {
									let t = Number(e.id ?? e.kiosk_id ?? 0);
									return /* @__PURE__ */ y(ql, {
										value: String(t),
										children: e.title || e.name || String(t)
									}, t);
								})] })]
							})]
						})
					]
				}),
				/* @__PURE__ */ y(G, {
					type: "button",
					size: "sm",
					variant: "outline",
					disabled: ne.isPending,
					onClick: () => void ne.mutate(),
					children: i("tapin.saveParcelMeta")
				}),
				/* @__PURE__ */ b("div", {
					className: "rounded-lg bg-muted/40 px-3 py-2 text-xs leading-relaxed space-y-1",
					children: [
						I?.barcode ? /* @__PURE__ */ b("p", { children: [
							i("tapin.barcode"),
							": ",
							/* @__PURE__ */ y("span", {
								dir: "ltr",
								children: I.barcode
							})
						] }) : /* @__PURE__ */ y("p", {
							className: "text-muted-foreground",
							children: i("tapin.noBarcode")
						}),
						/* @__PURE__ */ b("p", { children: [
							i("tapin.status"),
							": ",
							I?.status_label || "—"
						] }),
						I?.order_id ? /* @__PURE__ */ b("p", { children: [
							i("tapin.tapinOrderId"),
							": ",
							/* @__PURE__ */ y("span", {
								dir: "ltr",
								children: I.order_id
							})
						] }) : null
					]
				}),
				/* @__PURE__ */ b("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ y(G, {
							type: "button",
							size: "sm",
							disabled: !I?.connected || j.isPending,
							onClick: () => void j.mutate(),
							children: i("tapin.registerShipment")
						}),
						/* @__PURE__ */ y(G, {
							type: "button",
							size: "sm",
							variant: "secondary",
							disabled: !I?.order_id || M.isPending,
							onClick: () => void M.mutate(),
							children: i("tapin.editShipment")
						}),
						/* @__PURE__ */ y(G, {
							type: "button",
							size: "sm",
							variant: "secondary",
							disabled: !I?.order_id || P.isPending,
							onClick: () => void P.mutate(),
							children: i("tapin.readyToShip")
						}),
						/* @__PURE__ */ y(G, {
							type: "button",
							size: "sm",
							variant: "secondary",
							disabled: !I?.order_id || F.isPending,
							onClick: () => void F.mutate("html"),
							children: i("tapin.printLabel")
						}),
						/* @__PURE__ */ y(G, {
							type: "button",
							size: "sm",
							variant: "outline",
							disabled: !I?.order_id || F.isPending,
							onClick: () => void F.mutate("label"),
							children: i("tapin.printLabelNative")
						}),
						/* @__PURE__ */ y(G, {
							type: "button",
							size: "sm",
							variant: "outline",
							disabled: !I?.order_id || F.isPending,
							onClick: () => void F.mutate("barcode"),
							children: i("tapin.printBarcode")
						}),
						/* @__PURE__ */ y(G, {
							type: "button",
							size: "sm",
							variant: "outline",
							disabled: !I?.order_id || N.isPending,
							onClick: () => void N.mutate(),
							children: i("tapin.fetchDetail")
						}),
						/* @__PURE__ */ y(G, {
							type: "button",
							size: "sm",
							variant: "outline",
							disabled: !I?.order_id || ee.isPending,
							onClick: () => void ee.mutate(),
							children: i("tapin.refreshStatus")
						}),
						/* @__PURE__ */ y(G, {
							type: "button",
							size: "sm",
							variant: "destructive",
							disabled: !I?.order_id && !I?.barcode,
							onClick: () => {
								window.confirm(i("tapin.clearLocalConfirm")) && Q(`shipping/tapin/orders/${r}/clear`, {
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: "{}"
								}).then((e) => {
									e.ok ? h.success(e.message) : h.error(e.message), A();
								}).catch((e) => $(i, e));
							},
							children: i("tapin.clearLocal")
						})
					]
				}),
				T ? /* @__PURE__ */ y("pre", {
					className: "bg-muted/30 max-h-48 overflow-auto rounded-md p-2 text-[11px]",
					dir: "ltr",
					children: T
				}) : null
			] })
		})]
	});
}
//#endregion
//#region src/components/PageShell.tsx
function bu({ title: e, description: t, eyebrow: n, children: r }) {
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
//#region src/components/ui/tabs.tsx
function xu({ className: e, orientation: t = "horizontal", dir: n, ...r }) {
	let i = Hl();
	return /* @__PURE__ */ y($s, {
		"data-slot": "tabs",
		"data-orientation": t,
		orientation: t,
		dir: n ?? i,
		className: W("group/tabs flex gap-2 data-[orientation=horizontal]:flex-col", e),
		...r
	});
}
var Su = E("group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none", {
	variants: { variant: {
		default: "bg-muted",
		line: "gap-1 bg-transparent"
	} },
	defaultVariants: { variant: "default" }
});
function Cu({ className: e, variant: t = "default", dir: n, ...r }) {
	let i = Hl();
	return /* @__PURE__ */ y(ec, {
		"data-slot": "tabs-list",
		"data-variant": t,
		dir: n ?? i,
		className: W(Su({ variant: t }), e),
		...r
	});
}
function wu({ className: e, ...t }) {
	return /* @__PURE__ */ y(tc, {
		"data-slot": "tabs-trigger",
		className: W("relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent", "data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground", "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:inset-inline-end-0 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100", e),
		...t
	});
}
function Tu({ className: e, ...t }) {
	return /* @__PURE__ */ y(nc, {
		"data-slot": "tabs-content",
		className: W("flex-1 outline-none", e),
		...t
	});
}
//#endregion
//#region ../Modules/tapin-module/client/pages/TapinCatalogPage.tsx
function Eu() {
	let { t: r } = m(), i = n(), [a, o] = p(1), [s, c] = p(""), [l, u] = p(""), [d, f] = p(0), [g, _] = p(100), [v, S] = p(""), [C, w] = p(""), T = t({
		queryKey: ["tapin-products", a],
		queryFn: () => Q(`shipping/tapin/products?page=${a}&count=30`)
	});
	_u(T);
	let E = t({
		queryKey: ["tapin-customers"],
		queryFn: () => Q("shipping/tapin/customers?page=1&count=40")
	}), D = t({
		queryKey: ["tapin-product-categories"],
		queryFn: () => Q("shipping/tapin/products/categories")
	}), O = t({
		queryKey: ["tapin-customer-categories"],
		queryFn: () => Q("shipping/tapin/customers/categories")
	}), k = t({
		queryKey: ["tapin-employees"],
		queryFn: () => Q("shipping/tapin/employees?page=1&count=40")
	}), A = t({
		queryKey: ["tapin-tasks"],
		queryFn: () => Q("shipping/tapin/tasks?page=1&count=30")
	}), j = e({
		mutationFn: () => Q("shipping/tapin/products/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: l,
				price: d,
				weight: g
			})
		}),
		onSuccess: (e) => {
			e.ok ? (h.success(e.message), u(""), i.invalidateQueries({ queryKey: ["tapin-products"] })) : h.error(e.message);
		},
		onError: (e) => $(r, e)
	}), M = e({
		mutationFn: () => Q("shipping/tapin/products/push-wc", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ product_id: parseInt(s, 10) || 0 })
		}),
		onSuccess: (e) => {
			e.ok ? (h.success(e.message), i.invalidateQueries({ queryKey: ["tapin-products"] })) : h.error(e.message);
		},
		onError: (e) => $(r, e)
	}), N = e({
		mutationFn: (e) => Q("shipping/tapin/products/delete", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ product_id: e })
		}),
		onSuccess: (e) => {
			e.ok ? (h.success(e.message), i.invalidateQueries({ queryKey: ["tapin-products"] })) : h.error(e.message);
		},
		onError: (e) => $(r, e)
	}), P = e({
		mutationFn: () => Q("shipping/tapin/tasks/detail", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ task_id: v })
		}),
		onSuccess: (e) => {
			e.ok ? (h.success(e.message), w(JSON.stringify(e.detail ?? {}, null, 2))) : h.error(e.message);
		},
		onError: (e) => $(r, e)
	});
	return /* @__PURE__ */ b(bu, {
		title: r("tapin.catalogTitle"),
		description: r("tapin.catalogHint"),
		children: [/* @__PURE__ */ b("div", {
			className: "mb-4 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ y(G, {
				asChild: !0,
				variant: "outline",
				size: "sm",
				children: /* @__PURE__ */ y(x, {
					to: "/settings/shop/transport/tapin",
					children: r("tapin.openSettings")
				})
			}), /* @__PURE__ */ y(G, {
				asChild: !0,
				variant: "outline",
				size: "sm",
				children: /* @__PURE__ */ y(x, {
					to: "/settings/shop/transport/tapin/ops",
					children: r("tapin.opsTitle")
				})
			})]
		}), /* @__PURE__ */ b(xu, {
			defaultValue: "products",
			children: [
				/* @__PURE__ */ b(Cu, { children: [
					/* @__PURE__ */ y(wu, {
						value: "products",
						children: r("tapin.products")
					}),
					/* @__PURE__ */ y(wu, {
						value: "categories",
						children: r("tapin.productCategories")
					}),
					/* @__PURE__ */ y(wu, {
						value: "customers",
						children: r("tapin.customers")
					}),
					/* @__PURE__ */ y(wu, {
						value: "employees",
						children: r("tapin.employees")
					}),
					/* @__PURE__ */ y(wu, {
						value: "tasks",
						children: r("tapin.tasks")
					})
				] }),
				/* @__PURE__ */ b(Tu, {
					value: "products",
					className: "space-y-4",
					children: [
						/* @__PURE__ */ b(K, {
							className: "shadow-sm",
							children: [/* @__PURE__ */ y(q, {
								className: "pb-2",
								children: /* @__PURE__ */ y(J, {
									className: "text-base",
									children: r("tapin.createProduct")
								})
							}), /* @__PURE__ */ b(Y, {
								className: "grid gap-2 sm:grid-cols-4",
								children: [
									/* @__PURE__ */ y(X, {
										value: l,
										onChange: (e) => u(e.target.value),
										placeholder: r("tapin.productTitle")
									}),
									/* @__PURE__ */ y(X, {
										type: "number",
										dir: "ltr",
										value: d,
										onChange: (e) => f(parseInt(e.target.value, 10) || 0),
										placeholder: r("tapin.price")
									}),
									/* @__PURE__ */ y(X, {
										type: "number",
										dir: "ltr",
										value: g,
										onChange: (e) => _(parseInt(e.target.value, 10) || 0),
										placeholder: r("tapin.orderWeight")
									}),
									/* @__PURE__ */ y(G, {
										type: "button",
										disabled: !l || j.isPending,
										onClick: () => void j.mutate(),
										children: r("common.create")
									})
								]
							})]
						}),
						/* @__PURE__ */ b(K, {
							className: "shadow-sm",
							children: [/* @__PURE__ */ y(q, {
								className: "pb-2",
								children: /* @__PURE__ */ y(J, {
									className: "text-base",
									children: r("tapin.pushWcProduct")
								})
							}), /* @__PURE__ */ b(Y, {
								className: "flex flex-wrap items-end gap-2",
								children: [/* @__PURE__ */ b("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ y(Z, { children: r("tapin.wcProductId") }), /* @__PURE__ */ y(X, {
										dir: "ltr",
										value: s,
										onChange: (e) => c(e.target.value)
									})]
								}), /* @__PURE__ */ y(G, {
									type: "button",
									disabled: M.isPending,
									onClick: () => void M.mutate(),
									children: r("tapin.syncToTapin")
								})]
							})]
						}),
						/* @__PURE__ */ y(K, {
							className: "shadow-sm",
							children: /* @__PURE__ */ b(Y, {
								className: "overflow-x-auto pt-4",
								children: [/* @__PURE__ */ b("table", {
									className: "w-full min-w-[560px] text-sm",
									children: [/* @__PURE__ */ y("thead", { children: /* @__PURE__ */ b("tr", {
										className: "border-b text-start",
										children: [
											/* @__PURE__ */ y("th", {
												className: "p-2",
												children: "ID"
											}),
											/* @__PURE__ */ y("th", {
												className: "p-2",
												children: r("tapin.productTitle")
											}),
											/* @__PURE__ */ y("th", {
												className: "p-2",
												children: r("tapin.price")
											}),
											/* @__PURE__ */ y("th", { className: "p-2" })
										]
									}) }), /* @__PURE__ */ y("tbody", { children: (T.data?.items ?? []).map((e, t) => {
										let n = String(e.product_id ?? e.id ?? "");
										return /* @__PURE__ */ b("tr", {
											className: "border-b border-border/50",
											children: [
												/* @__PURE__ */ y("td", {
													className: "p-2",
													dir: "ltr",
													children: n || "—"
												}),
												/* @__PURE__ */ y("td", {
													className: "p-2",
													children: String(e.title ?? "—")
												}),
												/* @__PURE__ */ y("td", {
													className: "p-2",
													dir: "ltr",
													children: String(e.price ?? "—")
												}),
												/* @__PURE__ */ y("td", {
													className: "p-2",
													children: n ? /* @__PURE__ */ y(G, {
														type: "button",
														size: "sm",
														variant: "ghost",
														onClick: () => void N.mutate(n),
														children: r("common.delete")
													}) : null
												})
											]
										}, n || t);
									}) })]
								}), /* @__PURE__ */ b("div", {
									className: "mt-2 flex gap-2",
									children: [/* @__PURE__ */ y(G, {
										type: "button",
										size: "sm",
										variant: "outline",
										disabled: a <= 1,
										onClick: () => o((e) => e - 1),
										children: r("common.prev")
									}), /* @__PURE__ */ y(G, {
										type: "button",
										size: "sm",
										variant: "outline",
										onClick: () => o((e) => e + 1),
										children: r("common.next")
									})]
								})]
							})
						})
					]
				}),
				/* @__PURE__ */ y(Tu, {
					value: "categories",
					children: /* @__PURE__ */ b("div", {
						className: "grid gap-4 md:grid-cols-2",
						children: [/* @__PURE__ */ b(K, {
							className: "shadow-sm",
							children: [/* @__PURE__ */ y(q, {
								className: "pb-2",
								children: /* @__PURE__ */ y(J, {
									className: "text-base",
									children: r("tapin.productCategories")
								})
							}), /* @__PURE__ */ y(Y, {
								className: "overflow-x-auto",
								children: /* @__PURE__ */ y("ul", {
									className: "space-y-1 text-sm",
									children: (D.data?.items ?? []).map((e, t) => /* @__PURE__ */ y("li", {
										className: "border-b border-border/40 py-1.5",
										children: String(e.title ?? e.name ?? e.category_id ?? "—")
									}, String(e.category_id ?? t)))
								})
							})]
						}), /* @__PURE__ */ b(K, {
							className: "shadow-sm",
							children: [/* @__PURE__ */ y(q, {
								className: "pb-2",
								children: /* @__PURE__ */ y(J, {
									className: "text-base",
									children: r("tapin.customerCategories")
								})
							}), /* @__PURE__ */ y(Y, {
								className: "overflow-x-auto",
								children: /* @__PURE__ */ y("ul", {
									className: "space-y-1 text-sm",
									children: (O.data?.items ?? []).map((e, t) => /* @__PURE__ */ y("li", {
										className: "border-b border-border/40 py-1.5",
										children: String(e.title ?? e.name ?? e.category_id ?? "—")
									}, String(e.category_id ?? t)))
								})
							})]
						})]
					})
				}),
				/* @__PURE__ */ y(Tu, {
					value: "customers",
					children: /* @__PURE__ */ y(K, {
						className: "shadow-sm",
						children: /* @__PURE__ */ y(Y, {
							className: "overflow-x-auto pt-4",
							children: /* @__PURE__ */ b("table", {
								className: "w-full min-w-[560px] text-sm",
								children: [/* @__PURE__ */ y("thead", { children: /* @__PURE__ */ b("tr", {
									className: "border-b text-start",
									children: [
										/* @__PURE__ */ y("th", {
											className: "p-2",
											children: r("tapin.recipient")
										}),
										/* @__PURE__ */ y("th", {
											className: "p-2",
											children: r("tapin.mobile")
										}),
										/* @__PURE__ */ y("th", {
											className: "p-2",
											children: r("tapin.createdAt")
										})
									]
								}) }), /* @__PURE__ */ y("tbody", { children: (E.data?.items ?? []).map((e, t) => /* @__PURE__ */ b("tr", {
									className: "border-b border-border/50",
									children: [
										/* @__PURE__ */ b("td", {
											className: "p-2",
											children: [
												String(e.first_name ?? ""),
												" ",
												String(e.last_name ?? "")
											]
										}),
										/* @__PURE__ */ y("td", {
											className: "p-2",
											dir: "ltr",
											children: String(e.mobile ?? "—")
										}),
										/* @__PURE__ */ y("td", {
											className: "p-2",
											dir: "ltr",
											children: String(e.created_at ?? "—")
										})
									]
								}, String(e.customer_id ?? t))) })]
							})
						})
					})
				}),
				/* @__PURE__ */ y(Tu, {
					value: "employees",
					children: /* @__PURE__ */ y(K, {
						className: "shadow-sm",
						children: /* @__PURE__ */ y(Y, {
							className: "overflow-x-auto pt-4",
							children: /* @__PURE__ */ b("table", {
								className: "w-full min-w-[480px] text-sm",
								children: [/* @__PURE__ */ y("thead", { children: /* @__PURE__ */ b("tr", {
									className: "border-b text-start",
									children: [
										/* @__PURE__ */ y("th", {
											className: "p-2",
											children: r("tapin.recipient")
										}),
										/* @__PURE__ */ y("th", {
											className: "p-2",
											children: r("tapin.employeeCode")
										}),
										/* @__PURE__ */ y("th", {
											className: "p-2",
											children: "username"
										})
									]
								}) }), /* @__PURE__ */ y("tbody", { children: (k.data?.items ?? []).map((e, t) => /* @__PURE__ */ b("tr", {
									className: "border-b border-border/50",
									children: [
										/* @__PURE__ */ b("td", {
											className: "p-2",
											children: [
												String(e.first_name ?? ""),
												" ",
												String(e.last_name ?? "")
											]
										}),
										/* @__PURE__ */ y("td", {
											className: "p-2",
											dir: "ltr",
											children: String(e.employee_code ?? "—")
										}),
										/* @__PURE__ */ y("td", {
											className: "p-2",
											dir: "ltr",
											children: String(e.username ?? "—")
										})
									]
								}, t)) })]
							})
						})
					})
				}),
				/* @__PURE__ */ b(Tu, {
					value: "tasks",
					className: "space-y-4",
					children: [/* @__PURE__ */ y(K, {
						className: "shadow-sm",
						children: /* @__PURE__ */ y(Y, {
							className: "overflow-x-auto pt-4",
							children: /* @__PURE__ */ b("table", {
								className: "w-full min-w-[480px] text-sm",
								children: [/* @__PURE__ */ y("thead", { children: /* @__PURE__ */ b("tr", {
									className: "border-b text-start",
									children: [
										/* @__PURE__ */ y("th", {
											className: "p-2",
											children: "ID"
										}),
										/* @__PURE__ */ y("th", {
											className: "p-2",
											children: "type"
										}),
										/* @__PURE__ */ y("th", {
											className: "p-2",
											children: r("tapin.status")
										}),
										/* @__PURE__ */ y("th", {
											className: "p-2",
											children: r("tapin.createdAt")
										})
									]
								}) }), /* @__PURE__ */ y("tbody", { children: (A.data?.items ?? []).map((e, t) => /* @__PURE__ */ b("tr", {
									className: "border-b border-border/50",
									children: [
										/* @__PURE__ */ y("td", {
											className: "p-2",
											dir: "ltr",
											children: /* @__PURE__ */ y("button", {
												type: "button",
												className: "underline",
												onClick: () => S(String(e.id ?? "")),
												children: String(e.id ?? "—")
											})
										}),
										/* @__PURE__ */ y("td", {
											className: "p-2",
											children: String(e.task_type ?? "—")
										}),
										/* @__PURE__ */ y("td", {
											className: "p-2",
											children: String(e.task_status ?? "—")
										}),
										/* @__PURE__ */ y("td", {
											className: "p-2",
											dir: "ltr",
											children: String(e.created_at ?? "—")
										})
									]
								}, String(e.id ?? t))) })]
							})
						})
					}), /* @__PURE__ */ b(K, {
						className: "shadow-sm",
						children: [/* @__PURE__ */ y(q, {
							className: "pb-2",
							children: /* @__PURE__ */ y(J, {
								className: "text-base",
								children: r("tapin.taskDetail")
							})
						}), /* @__PURE__ */ b(Y, {
							className: "flex flex-wrap items-end gap-2",
							children: [
								/* @__PURE__ */ y(X, {
									dir: "ltr",
									value: v,
									onChange: (e) => S(e.target.value),
									placeholder: "task_id"
								}),
								/* @__PURE__ */ y(G, {
									type: "button",
									disabled: !v || P.isPending,
									onClick: () => void P.mutate(),
									children: r("tapin.fetchDetail")
								}),
								C ? /* @__PURE__ */ y("pre", {
									className: "bg-muted/30 max-h-64 w-full overflow-auto rounded-md p-2 text-[11px]",
									dir: "ltr",
									children: C
								}) : null
							]
						})]
					})]
				})
			]
		})]
	});
}
//#endregion
//#region ../Modules/tapin-module/client/pages/TapinFinancePage.tsx
function Du() {
	let { t: r } = m(), i = n(), [a, o] = p(1e5), [s, c] = p(1), [l, u] = p(""), [d, f] = p(""), [g, _] = p(""), [v, S] = p(""), C = t({
		queryKey: ["tapin-credit-history", s],
		queryFn: () => Q(`shipping/tapin/credit/history?page=${s}&count=20`)
	});
	_u(C);
	let w = t({
		queryKey: ["tapin-shop-detail"],
		queryFn: () => Q("shipping/tapin/shop/detail")
	}), T = e({
		mutationFn: () => Q("shipping/tapin/credit/topup", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				price: a,
				redirect_page: window.location.href
			})
		}),
		onSuccess: (e) => {
			if (!e.ok) {
				h.error(e.message);
				return;
			}
			h.success(e.message), e.url && window.open(e.url, "_blank"), i.invalidateQueries({ queryKey: ["tapin-credit-history"] });
		},
		onError: (e) => $(r, e)
	}), E = e({
		mutationFn: () => Q("shipping/tapin/shop/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				shop_name: l,
				mobile: d,
				first_name: g,
				last_name: v
			})
		}),
		onSuccess: (e) => {
			e.ok ? (h.success(e.message), i.invalidateQueries({ queryKey: ["tapin-shop-detail"] })) : h.error(e.message);
		},
		onError: (e) => $(r, e)
	});
	return /* @__PURE__ */ b(bu, {
		title: r("tapin.financeTitle"),
		description: r("tapin.financeHint"),
		children: [
			/* @__PURE__ */ b("div", {
				className: "mb-4 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ y(G, {
					asChild: !0,
					variant: "outline",
					size: "sm",
					children: /* @__PURE__ */ y(x, {
						to: "/settings/shop/transport/tapin",
						children: r("tapin.openSettings")
					})
				}), /* @__PURE__ */ y(G, {
					asChild: !0,
					variant: "outline",
					size: "sm",
					children: /* @__PURE__ */ y(x, {
						to: "/settings/shop/transport/tapin/ops",
						children: r("tapin.opsTitle")
					})
				})]
			}),
			/* @__PURE__ */ b(K, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ y(q, {
					className: "pb-2",
					children: /* @__PURE__ */ y(J, {
						className: "text-base",
						children: r("tapin.credit")
					})
				}), /* @__PURE__ */ b(Y, {
					className: "space-y-3",
					children: [/* @__PURE__ */ y("p", {
						className: "text-lg",
						dir: "ltr",
						children: C.data?.credit == null ? "—" : C.data.credit.toLocaleString()
					}), /* @__PURE__ */ b("div", {
						className: "flex flex-wrap items-end gap-2",
						children: [/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(Z, { children: r("tapin.topupAmount") }), /* @__PURE__ */ y(X, {
								type: "number",
								dir: "ltr",
								value: a,
								onChange: (e) => o(parseInt(e.target.value, 10) || 0)
							})]
						}), /* @__PURE__ */ y(G, {
							type: "button",
							disabled: T.isPending || a < 1,
							onClick: () => void T.mutate(),
							children: r("tapin.startTopup")
						})]
					})]
				})]
			}),
			/* @__PURE__ */ b(K, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ y(q, {
					className: "pb-2",
					children: /* @__PURE__ */ y(J, {
						className: "text-base",
						children: r("tapin.creditHistory")
					})
				}), /* @__PURE__ */ b(Y, {
					className: "space-y-3",
					children: [/* @__PURE__ */ y("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ b("table", {
							className: "w-full min-w-[520px] text-sm",
							children: [/* @__PURE__ */ y("thead", { children: /* @__PURE__ */ b("tr", {
								className: "border-b text-start",
								children: [
									/* @__PURE__ */ y("th", {
										className: "p-2",
										children: r("tapin.price")
									}),
									/* @__PURE__ */ y("th", {
										className: "p-2",
										children: r("tapin.status")
									}),
									/* @__PURE__ */ y("th", {
										className: "p-2",
										children: r("tapin.createdAt")
									})
								]
							}) }), /* @__PURE__ */ y("tbody", { children: (C.data?.items ?? []).map((e, t) => /* @__PURE__ */ b("tr", {
								className: "border-b border-border/50",
								children: [
									/* @__PURE__ */ y("td", {
										className: "p-2",
										dir: "ltr",
										children: String(e.price ?? "—")
									}),
									/* @__PURE__ */ y("td", {
										className: "p-2",
										children: String(e.status_description ?? e.status ?? "—")
									}),
									/* @__PURE__ */ y("td", {
										className: "p-2",
										dir: "ltr",
										children: String(e.create_at ?? e.created_at ?? "—")
									})
								]
							}, String(e.id ?? t))) })]
						})
					}), /* @__PURE__ */ b("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ y(G, {
							type: "button",
							size: "sm",
							variant: "outline",
							disabled: s <= 1,
							onClick: () => c((e) => e - 1),
							children: r("common.prev")
						}), /* @__PURE__ */ y(G, {
							type: "button",
							size: "sm",
							variant: "outline",
							onClick: () => c((e) => e + 1),
							children: r("common.next")
						})]
					})]
				})]
			}),
			/* @__PURE__ */ b(K, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ y(q, {
					className: "pb-2",
					children: /* @__PURE__ */ y(J, {
						className: "text-base",
						children: r("tapin.shopDetail")
					})
				}), /* @__PURE__ */ y(Y, { children: /* @__PURE__ */ y("pre", {
					className: "bg-muted/30 max-h-80 overflow-auto rounded-md p-2 text-[11px]",
					dir: "ltr",
					children: JSON.stringify(w.data?.detail ?? { message: w.data?.message }, null, 2)
				}) })]
			}),
			/* @__PURE__ */ b(K, {
				className: "shadow-sm",
				children: [/* @__PURE__ */ y(q, {
					className: "pb-2",
					children: /* @__PURE__ */ y(J, {
						className: "text-base",
						children: r("tapin.createShop")
					})
				}), /* @__PURE__ */ b(Y, {
					className: "grid gap-2 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(Z, { children: r("tapin.shopName") }), /* @__PURE__ */ y(X, {
								value: l,
								onChange: (e) => u(e.target.value)
							})]
						}),
						/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(Z, { children: r("tapin.mobile") }), /* @__PURE__ */ y(X, {
								dir: "ltr",
								value: d,
								onChange: (e) => f(e.target.value)
							})]
						}),
						/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(Z, { children: r("tapin.firstName") }), /* @__PURE__ */ y(X, {
								value: g,
								onChange: (e) => _(e.target.value)
							})]
						}),
						/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(Z, { children: r("tapin.lastName") }), /* @__PURE__ */ y(X, {
								value: v,
								onChange: (e) => S(e.target.value)
							})]
						}),
						/* @__PURE__ */ y("div", {
							className: "sm:col-span-2",
							children: /* @__PURE__ */ y(G, {
								type: "button",
								disabled: !l || E.isPending,
								onClick: () => void E.mutate(),
								children: r("tapin.createShop")
							})
						})
					]
				})]
			})
		]
	});
}
//#endregion
//#region ../Modules/tapin-module/client/pages/TapinOpsPage.tsx
function Ou(e) {
	let t = window.open("", "_blank");
	t && (t.document.write(e), t.document.close());
}
function ku() {
	let { t: n } = m(), [r, i] = p(1), [a, o] = p(""), [s, c] = p(2), [l, u] = p(""), [d, f] = p(""), g = t({
		queryKey: ["tapin-orders-list", r],
		queryFn: () => Q(`shipping/tapin/orders-list?page=${r}&count=20`)
	});
	_u(g);
	let _ = t({
		queryKey: ["tapin-change-report"],
		queryFn: () => Q("shipping/tapin/status/change-report")
	}), v = t({
		queryKey: ["tapin-last-change"],
		queryFn: () => Q("shipping/tapin/status/last-change")
	}), [S, C] = p(""), [w, T] = p(null), E = () => a.split(/[,\s]+/).map((e) => parseInt(e, 10)).filter((e) => e > 0), D = e({
		mutationFn: () => Q("shipping/tapin/status/report", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ orders_id: S.split(/[,\s]+/).map((e) => e.trim()).filter(Boolean) })
		}),
		onSuccess: (e) => {
			e.ok ? (h.success(e.message), T(e.entries)) : h.error(e.message);
		},
		onError: (e) => $(n, e)
	}), O = e({
		mutationFn: () => Q("shipping/tapin/orders/bulk-status", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				order_ids: E(),
				status: s
			})
		}),
		onSuccess: (e) => e.ok ? h.success(e.message) : h.error(e.message),
		onError: (e) => $(n, e)
	}), k = e({
		mutationFn: () => Q("shipping/tapin/orders/bulk-labels", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ order_ids: E() })
		}),
		onSuccess: (e) => {
			if (!e.ok) {
				h.error(e.message);
				return;
			}
			h.success(e.message), e.html && Ou(e.html);
		},
		onError: (e) => $(n, e)
	}), A = e({
		mutationFn: () => Q("shipping/tapin/labels/by-date", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				from_date: l,
				to_date: d
			})
		}),
		onSuccess: (e) => {
			if (!e.ok) {
				h.error(e.message);
				return;
			}
			h.success(e.message), e.html && Ou(e.html);
		},
		onError: (e) => $(n, e)
	}), j = g.data?.items ?? [];
	return /* @__PURE__ */ b(bu, {
		title: n("tapin.opsTitle"),
		description: n("tapin.opsHint"),
		children: [
			/* @__PURE__ */ b("div", {
				className: "mb-4 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ y(G, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ y(x, {
							to: "/settings/shop/transport/tapin",
							children: n("tapin.openSettings")
						})
					}),
					/* @__PURE__ */ y(G, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ y(x, {
							to: "/settings/shop/transport/tapin/finance",
							children: n("tapin.financeTitle")
						})
					}),
					/* @__PURE__ */ y(G, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ y(x, {
							to: "/settings/shop/transport/tapin/catalog",
							children: n("tapin.catalogTitle")
						})
					})
				]
			}),
			/* @__PURE__ */ b(K, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ y(q, {
					className: "pb-2",
					children: /* @__PURE__ */ y(J, {
						className: "text-base",
						children: n("tapin.tapinOrdersList")
					})
				}), /* @__PURE__ */ b(Y, {
					className: "space-y-3",
					children: [g.isPending ? /* @__PURE__ */ y("p", {
						className: "text-muted-foreground text-sm",
						children: n("common.loading")
					}) : /* @__PURE__ */ y("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ b("table", {
							className: "w-full min-w-[640px] text-sm",
							children: [/* @__PURE__ */ y("thead", { children: /* @__PURE__ */ b("tr", {
								className: "border-b text-start",
								children: [
									/* @__PURE__ */ y("th", {
										className: "p-2",
										children: "ID"
									}),
									/* @__PURE__ */ y("th", {
										className: "p-2",
										children: n("tapin.barcode")
									}),
									/* @__PURE__ */ y("th", {
										className: "p-2",
										children: n("tapin.status")
									}),
									/* @__PURE__ */ y("th", {
										className: "p-2",
										children: n("tapin.recipient")
									})
								]
							}) }), /* @__PURE__ */ y("tbody", { children: j.map((e, t) => /* @__PURE__ */ b("tr", {
								className: "border-b border-border/50",
								children: [
									/* @__PURE__ */ y("td", {
										className: "p-2",
										dir: "ltr",
										children: String(e.order_id ?? e.id ?? "—")
									}),
									/* @__PURE__ */ y("td", {
										className: "p-2",
										dir: "ltr",
										children: String(e.barcode ?? "—")
									}),
									/* @__PURE__ */ y("td", {
										className: "p-2",
										children: String(e.status ?? "—")
									}),
									/* @__PURE__ */ b("td", {
										className: "p-2",
										children: [
											String(e.first_name ?? ""),
											" ",
											String(e.last_name ?? "")
										]
									})
								]
							}, String(e.id ?? e.order_id ?? t))) })]
						})
					}), /* @__PURE__ */ b("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ y(G, {
							type: "button",
							size: "sm",
							variant: "outline",
							disabled: r <= 1,
							onClick: () => i((e) => e - 1),
							children: n("common.prev")
						}), /* @__PURE__ */ y(G, {
							type: "button",
							size: "sm",
							variant: "outline",
							onClick: () => i((e) => e + 1),
							children: n("common.next")
						})]
					})]
				})]
			}),
			/* @__PURE__ */ b(K, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ y(q, {
					className: "pb-2",
					children: /* @__PURE__ */ y(J, {
						className: "text-base",
						children: n("tapin.bulkOps")
					})
				}), /* @__PURE__ */ b(Y, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(Z, { children: n("tapin.wcOrderIds") }), /* @__PURE__ */ y(X, {
								dir: "ltr",
								value: a,
								onChange: (e) => o(e.target.value),
								placeholder: "101, 102, 103"
							})]
						}),
						/* @__PURE__ */ b("div", {
							className: "flex flex-wrap items-end gap-2",
							children: [
								/* @__PURE__ */ b("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ y(Z, { children: n("tapin.bulkStatus") }), /* @__PURE__ */ y(X, {
										type: "number",
										dir: "ltr",
										value: s,
										onChange: (e) => c(parseInt(e.target.value, 10) || 2)
									})]
								}),
								/* @__PURE__ */ y(G, {
									type: "button",
									disabled: O.isPending,
									onClick: () => void O.mutate(),
									children: n("tapin.applyBulkStatus")
								}),
								/* @__PURE__ */ y(G, {
									type: "button",
									variant: "secondary",
									disabled: k.isPending,
									onClick: () => void k.mutate(),
									children: n("tapin.bulkLabels")
								})
							]
						}),
						/* @__PURE__ */ b("div", {
							className: "grid gap-2 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ b("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ y(Z, { children: n("tapin.fromDate") }), /* @__PURE__ */ y(X, {
										dir: "ltr",
										value: l,
										onChange: (e) => u(e.target.value),
										placeholder: "1403-12-01"
									})]
								}),
								/* @__PURE__ */ b("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ y(Z, { children: n("tapin.toDate") }), /* @__PURE__ */ y(X, {
										dir: "ltr",
										value: d,
										onChange: (e) => f(e.target.value),
										placeholder: "1404-01-01"
									})]
								}),
								/* @__PURE__ */ y("div", {
									className: "flex items-end",
									children: /* @__PURE__ */ y(G, {
										type: "button",
										variant: "outline",
										disabled: A.isPending,
										onClick: () => void A.mutate(),
										children: n("tapin.labelsByDate")
									})
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ b("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ b(K, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ y(q, {
						className: "pb-2",
						children: /* @__PURE__ */ y(J, {
							className: "text-base",
							children: n("tapin.changeReport")
						})
					}), /* @__PURE__ */ y(Y, { children: /* @__PURE__ */ y("pre", {
						className: "bg-muted/30 max-h-64 overflow-auto rounded-md p-2 text-[11px]",
						dir: "ltr",
						children: JSON.stringify(_.data?.entries ?? {}, null, 2)
					}) })]
				}), /* @__PURE__ */ b(K, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ y(q, {
						className: "pb-2",
						children: /* @__PURE__ */ y(J, {
							className: "text-base",
							children: n("tapin.lastChange")
						})
					}), /* @__PURE__ */ y(Y, { children: /* @__PURE__ */ y("pre", {
						className: "bg-muted/30 max-h-64 overflow-auto rounded-md p-2 text-[11px]",
						dir: "ltr",
						children: JSON.stringify(v.data?.entries ?? {}, null, 2)
					}) })]
				})]
			}),
			/* @__PURE__ */ b(K, {
				className: "mt-4 shadow-sm",
				children: [/* @__PURE__ */ y(q, {
					className: "pb-2",
					children: /* @__PURE__ */ y(J, {
						className: "text-base",
						children: n("tapin.statusReport")
					})
				}), /* @__PURE__ */ b(Y, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(Z, { children: n("tapin.tapinOrderIds") }), /* @__PURE__ */ y(X, {
								dir: "ltr",
								value: S,
								onChange: (e) => C(e.target.value),
								placeholder: "uuid-1, uuid-2"
							})]
						}),
						/* @__PURE__ */ y(G, {
							type: "button",
							disabled: D.isPending,
							onClick: () => void D.mutate(),
							children: n("tapin.fetchStatusReport")
						}),
						w ? /* @__PURE__ */ y("pre", {
							className: "bg-muted/30 max-h-64 overflow-auto rounded-md p-2 text-[11px]",
							dir: "ltr",
							children: JSON.stringify(w, null, 2)
						}) : null
					]
				})]
			})
		]
	});
}
//#endregion
//#region src/components/ui/switch.tsx
function Au({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ y(Is, {
		"data-slot": "switch",
		"data-size": t,
		className: W("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", e),
		...n,
		dir: "ltr",
		children: /* @__PURE__ */ y(Ls, {
			"data-slot": "switch-thumb",
			className: W("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
//#endregion
//#region ../Modules/tapin-module/client/pages/TapinSettingsPage.tsx
var ju = () => ({
	enabled: !0,
	token: "",
	shop_id: "",
	shop_title: "",
	gateway: "tapin",
	show_credit: !0,
	use_pws_formula: !0,
	content_type: 1,
	tipax_pickup_type: 10,
	tipax_delivery_type: 10,
	origin_province_code: 0,
	origin_city_code: 0,
	auto_register: !1,
	auto_register_status: "processing",
	register_type: 1,
	default_pay_type: 1,
	default_order_type: 0,
	has_insurance: !1,
	employee_code: -1,
	methods: {
		pishtaz: !0,
		vip: !0,
		tipax: !0,
		courier: !0,
		tipax_api: !0,
		alonomic: !1
	},
	courier_base_price: 0,
	courier_per_kg: 0,
	free_shipping_min: 0,
	rate_extra_percent: 0,
	rate_extra_fixed: 0,
	box_id_map: {
		1: 1,
		2: 2,
		3: 3,
		4: 4,
		5: 5,
		6: 6,
		7: 7,
		8: 8,
		9: 9
	},
	default_box_id: 1,
	default_kiosk_id: 0,
	notify_customer_link: !0
});
function Mu({ title: e, rows: t, onChange: n }) {
	let { t: r } = m();
	return /* @__PURE__ */ b("div", {
		className: "space-y-2 rounded-xl border border-border/80 p-3",
		children: [/* @__PURE__ */ b("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ y("p", {
				className: "text-sm font-medium",
				children: e
			}), /* @__PURE__ */ y(G, {
				type: "button",
				size: "sm",
				variant: "secondary",
				onClick: () => n([...t, {
					min_weight_g: 0,
					max_weight_g: 1e3,
					price: 0,
					province_code: 0
				}]),
				children: r("tapin.addRow")
			})]
		}), t.map((e, i) => /* @__PURE__ */ b("div", {
			className: "grid gap-2 sm:grid-cols-4",
			children: [
				/* @__PURE__ */ y(X, {
					type: "number",
					dir: "ltr",
					value: e.min_weight_g,
					onChange: (r) => {
						let a = t.slice();
						a[i] = {
							...e,
							min_weight_g: Math.max(0, parseInt(r.target.value, 10) || 0)
						}, n(a);
					},
					placeholder: r("tapin.minWeight")
				}),
				/* @__PURE__ */ y(X, {
					type: "number",
					dir: "ltr",
					value: e.max_weight_g,
					onChange: (r) => {
						let a = t.slice();
						a[i] = {
							...e,
							max_weight_g: Math.max(0, parseInt(r.target.value, 10) || 0)
						}, n(a);
					},
					placeholder: r("tapin.maxWeight")
				}),
				/* @__PURE__ */ y(X, {
					type: "number",
					dir: "ltr",
					value: e.price,
					onChange: (r) => {
						let a = t.slice();
						a[i] = {
							...e,
							price: Math.max(0, parseFloat(r.target.value) || 0)
						}, n(a);
					},
					placeholder: r("tapin.price")
				}),
				/* @__PURE__ */ y(G, {
					type: "button",
					size: "sm",
					variant: "ghost",
					onClick: () => n(t.filter((e, t) => t !== i)),
					children: r("common.delete")
				})
			]
		}, i))]
	});
}
function Nu() {
	let { t: r } = m(), i = n(), [a, o] = p(null), [s, c] = p([]), [u, f] = p(null), [g, _] = p(null), S = t({
		queryKey: ["tapin-settings"],
		queryFn: () => Q("shipping/tapin/settings")
	});
	_u(S);
	let C = t({
		queryKey: ["tapin-provinces"],
		queryFn: () => Q("shipping/tapin/provinces")
	}), w = t({
		queryKey: ["tapin-tariffs"],
		queryFn: () => Q("shipping/tapin/tariffs")
	});
	l(() => {
		S.data?.settings && o({
			...ju(),
			...S.data.settings,
			methods: {
				...ju().methods,
				...S.data.settings.methods
			}
		}), typeof S.data?.credit == "number" && _(S.data.credit);
	}, [S.data]), l(() => {
		w.data?.tariffs && f(w.data.tariffs);
	}, [w.data]);
	let T = t({
		queryKey: ["tapin-cities", a?.origin_province_code],
		queryFn: () => Q(`shipping/tapin/cities?province=${a?.origin_province_code || 0}`),
		enabled: !!a?.origin_province_code
	}), E = C.data?.items ?? [], D = T.data?.items ?? [], O = S.data?.locations?.count ?? E.length, k = e({
		mutationFn: (e) => Q("shipping/tapin/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ settings: e })
		}),
		onSuccess: (e) => {
			h.success(r("common.saved")), e.settings && o(e.settings), i.invalidateQueries({ queryKey: ["tapin-settings"] });
		},
		onError: (e) => $(r, e)
	}), A = e({
		mutationFn: async () => {
			if (!a) throw Error("no draft");
			return await Q("shipping/tapin/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ settings: { token: a.token } })
			}), Q("shipping/tapin/test", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token: a.token })
			});
		},
		onSuccess: (e) => {
			e.ok ? h.success(e.message || r("tapin.connected")) : h.error(e.message || r("tapin.connectFailed")), c(e.shops ?? []);
		},
		onError: (e) => $(r, e)
	}), j = e({
		mutationFn: () => Q("shipping/tapin/locations/sync", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}"
		}),
		onSuccess: (e) => {
			e.ok ? h.success(e.message) : h.error(e.message), i.invalidateQueries({ queryKey: ["tapin-provinces"] }), i.invalidateQueries({ queryKey: ["tapin-settings"] });
		},
		onError: (e) => $(r, e)
	}), M = e({
		mutationFn: (e) => Q("shipping/tapin/tariffs", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ tariffs: e })
		}),
		onSuccess: (e) => {
			h.success(r("common.saved")), f(e.tariffs);
		},
		onError: (e) => $(r, e)
	}), N = e({
		mutationFn: () => Q("shipping/tapin/packing-boxes/sync", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}"
		}),
		onSuccess: (e) => {
			e.ok ? h.success(e.message) : h.error(e.message);
		},
		onError: (e) => $(r, e)
	}), P = d(() => a?.shop_id ? r(O ? "tapin.readyHint" : "tapin.needLocations") : r("tapin.needShop"), [
		a?.shop_id,
		O,
		r
	]);
	return a ? /* @__PURE__ */ b(bu, {
		title: r("tapin.settingsTitle"),
		description: r("tapin.settingsSubtitle"),
		children: [
			/* @__PURE__ */ b("div", {
				className: "mb-4 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ y(G, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ y(x, {
							to: "/settings/shop/transport/tapin/ops",
							children: r("tapin.openOps")
						})
					}),
					/* @__PURE__ */ y(G, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ y(x, {
							to: "/settings/shop/transport/tapin/finance",
							children: r("tapin.openFinance")
						})
					}),
					/* @__PURE__ */ y(G, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ y(x, {
							to: "/settings/shop/transport/tapin/catalog",
							children: r("tapin.openCatalog")
						})
					})
				]
			}),
			/* @__PURE__ */ b("div", {
				className: "mb-4 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ b("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ y("p", {
						className: "text-muted-foreground max-w-xl text-sm",
						children: P
					}), g != null && /* @__PURE__ */ b("p", {
						className: "text-sm font-medium",
						children: [
							r("tapin.credit"),
							": ",
							/* @__PURE__ */ y("span", {
								dir: "ltr",
								children: g.toLocaleString()
							})
						]
					})]
				}), /* @__PURE__ */ y(G, {
					type: "button",
					disabled: k.isPending,
					onClick: () => k.mutate(a),
					children: r("common.save")
				})]
			}),
			/* @__PURE__ */ b(xu, {
				defaultValue: "connect",
				className: "gap-4",
				children: [
					/* @__PURE__ */ b(Cu, {
						variant: "line",
						className: "w-full justify-start overflow-x-auto",
						children: [
							/* @__PURE__ */ y(wu, {
								value: "connect",
								children: r("tapin.tabConnect")
							}),
							/* @__PURE__ */ y(wu, {
								value: "origin",
								children: r("tapin.tabOrigin")
							}),
							/* @__PURE__ */ y(wu, {
								value: "methods",
								children: r("tapin.tabMethods")
							}),
							/* @__PURE__ */ y(wu, {
								value: "tariffs",
								children: r("tapin.tabTariffs")
							}),
							/* @__PURE__ */ y(wu, {
								value: "ship",
								children: r("tapin.tabShip")
							}),
							/* @__PURE__ */ y(wu, {
								value: "notify",
								children: r("tapin.tabNotify")
							})
						]
					}),
					/* @__PURE__ */ y(Tu, {
						value: "connect",
						className: "space-y-4 outline-none",
						children: /* @__PURE__ */ b(K, {
							className: "overflow-hidden border-border/70 shadow-sm",
							children: [/* @__PURE__ */ b(q, {
								className: "pb-2",
								children: [/* @__PURE__ */ y(J, {
									className: "text-base",
									children: r("tapin.connectTitle")
								}), /* @__PURE__ */ y(Ol, { children: r("tapin.connectHint") })]
							}), /* @__PURE__ */ b(Y, {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ b("label", {
										className: "flex items-center gap-3 text-sm",
										children: [/* @__PURE__ */ y(Au, {
											checked: a.enabled,
											onCheckedChange: (e) => o({
												...a,
												enabled: e
											})
										}), /* @__PURE__ */ y("span", { children: r("tapin.enabled") })]
									}),
									/* @__PURE__ */ b("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ y(Z, { children: r("tapin.gateway") }), /* @__PURE__ */ b(Ul, {
											value: a.gateway,
											onValueChange: (e) => o({
												...a,
												gateway: e === "posteketab" ? "posteketab" : "tapin"
											}),
											children: [/* @__PURE__ */ y(Gl, { children: /* @__PURE__ */ y(Wl, {}) }), /* @__PURE__ */ b(Kl, { children: [/* @__PURE__ */ y(ql, {
												value: "tapin",
												children: "tapin.ir"
											}), /* @__PURE__ */ y(ql, {
												value: "posteketab",
												children: "posteketab.com"
											})] })]
										})]
									}),
									/* @__PURE__ */ b("label", {
										className: "flex items-center gap-3 text-sm",
										children: [/* @__PURE__ */ y(Au, {
											checked: a.show_credit,
											onCheckedChange: (e) => o({
												...a,
												show_credit: e
											})
										}), /* @__PURE__ */ y("span", { children: r("tapin.showCredit") })]
									}),
									/* @__PURE__ */ b("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ y(Z, { children: r("tapin.token") }), /* @__PURE__ */ y(X, {
											type: "password",
											dir: "ltr",
											value: a.token,
											onChange: (e) => o({
												...a,
												token: e.target.value
											}),
											placeholder: r("tapin.tokenPlaceholder")
										})]
									}),
									/* @__PURE__ */ b("div", {
										className: "flex flex-wrap gap-2",
										children: [/* @__PURE__ */ y(G, {
											type: "button",
											variant: "secondary",
											disabled: A.isPending,
											onClick: () => void A.mutate(),
											children: r("tapin.testConnection")
										}), /* @__PURE__ */ y(G, {
											type: "button",
											variant: "outline",
											disabled: j.isPending,
											onClick: () => void j.mutate(),
											children: r("tapin.syncLocations")
										})]
									}),
									(s.length > 0 || a.shop_id) && /* @__PURE__ */ b("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ y(Z, { children: r("tapin.shop") }), /* @__PURE__ */ b(Ul, {
											value: a.shop_id || void 0,
											onValueChange: (e) => {
												let t = s.find((t) => t.id === e);
												o({
													...a,
													shop_id: e,
													shop_title: t?.title || a.shop_title
												});
											},
											children: [/* @__PURE__ */ y(Gl, { children: /* @__PURE__ */ y(Wl, { placeholder: r("tapin.pickShop") }) }), /* @__PURE__ */ y(Kl, { children: (s.length ? s : a.shop_id ? [{
												id: a.shop_id,
												title: a.shop_title || a.shop_id
											}] : []).map((e) => /* @__PURE__ */ y(ql, {
												value: e.id,
												children: e.title
											}, e.id)) })]
										})]
									}),
									/* @__PURE__ */ y("p", {
										className: "text-muted-foreground text-xs",
										children: r("tapin.locationsCount", { count: O })
									})
								]
							})]
						})
					}),
					/* @__PURE__ */ y(Tu, {
						value: "origin",
						className: "space-y-4 outline-none",
						children: /* @__PURE__ */ b(K, {
							className: "shadow-sm",
							children: [/* @__PURE__ */ b(q, {
								className: "pb-2",
								children: [/* @__PURE__ */ y(J, {
									className: "text-base",
									children: r("tapin.originTitle")
								}), /* @__PURE__ */ y(Ol, { children: r("tapin.originHint") })]
							}), /* @__PURE__ */ b(Y, {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ b("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ y(Z, { children: r("tapin.province") }), /* @__PURE__ */ b(Ul, {
										value: a.origin_province_code ? String(a.origin_province_code) : void 0,
										onValueChange: (e) => o({
											...a,
											origin_province_code: parseInt(e, 10) || 0,
											origin_city_code: 0
										}),
										children: [/* @__PURE__ */ y(Gl, { children: /* @__PURE__ */ y(Wl, { placeholder: r("tapin.pickProvince") }) }), /* @__PURE__ */ y(Kl, { children: E.map((e) => /* @__PURE__ */ y(ql, {
											value: String(e.code),
											children: e.title
										}, e.code)) })]
									})]
								}), /* @__PURE__ */ b("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ y(Z, { children: r("tapin.city") }), /* @__PURE__ */ b(Ul, {
										value: a.origin_city_code ? String(a.origin_city_code) : void 0,
										onValueChange: (e) => o({
											...a,
											origin_city_code: parseInt(e, 10) || 0
										}),
										children: [/* @__PURE__ */ y(Gl, { children: /* @__PURE__ */ y(Wl, { placeholder: r("tapin.pickCity") }) }), /* @__PURE__ */ y(Kl, { children: D.map((e) => /* @__PURE__ */ y(ql, {
											value: String(e.code),
											children: e.title
										}, e.code)) })]
									})]
								})]
							})]
						})
					}),
					/* @__PURE__ */ y(Tu, {
						value: "methods",
						className: "space-y-4 outline-none",
						children: /* @__PURE__ */ b(K, {
							className: "shadow-sm",
							children: [/* @__PURE__ */ b(q, {
								className: "pb-2",
								children: [/* @__PURE__ */ y(J, {
									className: "text-base",
									children: r("tapin.methodsTitle")
								}), /* @__PURE__ */ y(Ol, { children: r("tapin.methodsHint") })]
							}), /* @__PURE__ */ b(Y, {
								className: "space-y-3",
								children: [
									[
										["pishtaz", "tapin.methodPishtaz"],
										["vip", "tapin.methodVip"],
										["tipax", "tapin.methodTipax"],
										["tipax_api", "tapin.methodTipaxApi"],
										["alonomic", "tapin.methodAlonomic"],
										["courier", "tapin.methodCourier"]
									].map(([e, t]) => /* @__PURE__ */ b("label", {
										className: "flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5 text-sm",
										children: [/* @__PURE__ */ y("span", { children: r(t) }), /* @__PURE__ */ y(Au, {
											checked: !!a.methods[e],
											onCheckedChange: (t) => o({
												...a,
												methods: {
													...a.methods,
													[e]: t
												}
											})
										})]
									}, e)),
									/* @__PURE__ */ b("div", {
										className: "grid gap-3 sm:grid-cols-3",
										children: [
											/* @__PURE__ */ b("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ y(Z, { children: r("tapin.courierPrice") }), /* @__PURE__ */ y(X, {
													type: "number",
													dir: "ltr",
													value: a.courier_base_price,
													onChange: (e) => o({
														...a,
														courier_base_price: Math.max(0, parseFloat(e.target.value) || 0)
													})
												})]
											}),
											/* @__PURE__ */ b("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ y(Z, { children: r("tapin.courierPerKg") }), /* @__PURE__ */ y(X, {
													type: "number",
													dir: "ltr",
													value: a.courier_per_kg,
													onChange: (e) => o({
														...a,
														courier_per_kg: Math.max(0, parseFloat(e.target.value) || 0)
													})
												})]
											}),
											/* @__PURE__ */ b("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ y(Z, { children: r("tapin.freeMin") }), /* @__PURE__ */ y(X, {
													type: "number",
													dir: "ltr",
													value: a.free_shipping_min,
													onChange: (e) => o({
														...a,
														free_shipping_min: Math.max(0, parseFloat(e.target.value) || 0)
													})
												})]
											}),
											/* @__PURE__ */ b("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ y(Z, { children: r("tapin.extraPercent") }), /* @__PURE__ */ y(X, {
													type: "number",
													dir: "ltr",
													value: a.rate_extra_percent,
													onChange: (e) => o({
														...a,
														rate_extra_percent: parseFloat(e.target.value) || 0
													})
												})]
											}),
											/* @__PURE__ */ b("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ y(Z, { children: r("tapin.extraFixed") }), /* @__PURE__ */ y(X, {
													type: "number",
													dir: "ltr",
													value: a.rate_extra_fixed,
													onChange: (e) => o({
														...a,
														rate_extra_fixed: Math.max(0, parseFloat(e.target.value) || 0)
													})
												})]
											}),
											/* @__PURE__ */ b("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ y(Z, { children: r("tapin.defaultBox") }), /* @__PURE__ */ y(X, {
													type: "number",
													dir: "ltr",
													value: a.default_box_id,
													onChange: (e) => o({
														...a,
														default_box_id: Math.max(1, parseInt(e.target.value, 10) || 1)
													})
												})]
											}),
											/* @__PURE__ */ b("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ y(Z, { children: r("tapin.defaultKiosk") }), /* @__PURE__ */ y(X, {
													type: "number",
													dir: "ltr",
													value: a.default_kiosk_id,
													onChange: (e) => o({
														...a,
														default_kiosk_id: Math.max(0, parseInt(e.target.value, 10) || 0)
													})
												})]
											})
										]
									}),
									/* @__PURE__ */ b("label", {
										className: "flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5 text-sm",
										children: [/* @__PURE__ */ y("span", { children: r("tapin.usePwsFormula") }), /* @__PURE__ */ y(Au, {
											checked: a.use_pws_formula,
											onCheckedChange: (e) => o({
												...a,
												use_pws_formula: e
											})
										})]
									}),
									/* @__PURE__ */ y("p", {
										className: "text-muted-foreground text-xs",
										children: r("tapin.zonesReminder")
									}),
									/* @__PURE__ */ b("div", {
										className: "flex flex-wrap gap-2",
										children: [/* @__PURE__ */ y(G, {
											asChild: !0,
											variant: "secondary",
											size: "sm",
											children: /* @__PURE__ */ y(x, {
												to: "/settings/shop/shipping",
												children: r("shipping.openZones")
											})
										}), /* @__PURE__ */ y(G, {
											type: "button",
											size: "sm",
											variant: "outline",
											disabled: N.isPending,
											onClick: () => void N.mutate(),
											children: r("tapin.syncPackingBoxes")
										})]
									})
								]
							})]
						})
					}),
					/* @__PURE__ */ y(Tu, {
						value: "tariffs",
						className: "space-y-4 outline-none",
						children: /* @__PURE__ */ b(K, {
							className: "shadow-sm",
							children: [/* @__PURE__ */ b(q, {
								className: "flex flex-row items-center justify-between gap-2 pb-2",
								children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(J, {
									className: "text-base",
									children: r("tapin.tariffsTitle")
								}), /* @__PURE__ */ y(Ol, { children: r("tapin.tariffsHint") })] }), /* @__PURE__ */ y(G, {
									type: "button",
									size: "sm",
									disabled: !u || M.isPending,
									onClick: () => u && M.mutate(u),
									children: r("common.save")
								})]
							}), /* @__PURE__ */ y(Y, {
								className: "space-y-4",
								children: u ? /* @__PURE__ */ b(v, { children: [
									/* @__PURE__ */ y(Mu, {
										title: r("tapin.methodPishtaz"),
										rows: u.pishtaz,
										onChange: (e) => f({
											...u,
											pishtaz: e
										})
									}),
									/* @__PURE__ */ y(Mu, {
										title: r("tapin.methodVip"),
										rows: u.vip,
										onChange: (e) => f({
											...u,
											vip: e
										})
									}),
									/* @__PURE__ */ y(Mu, {
										title: r("tapin.methodTipax"),
										rows: u.tipax,
										onChange: (e) => f({
											...u,
											tipax: e
										})
									})
								] }) : /* @__PURE__ */ y("p", {
									className: "text-muted-foreground text-sm",
									children: r("common.loading")
								})
							})]
						})
					}),
					/* @__PURE__ */ y(Tu, {
						value: "ship",
						className: "space-y-4 outline-none",
						children: /* @__PURE__ */ b(K, {
							className: "shadow-sm",
							children: [/* @__PURE__ */ b(q, {
								className: "pb-2",
								children: [/* @__PURE__ */ y(J, {
									className: "text-base",
									children: r("tapin.shipTitle")
								}), /* @__PURE__ */ y(Ol, { children: r("tapin.shipHint") })]
							}), /* @__PURE__ */ b(Y, {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ b("label", {
										className: "flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5 text-sm",
										children: [/* @__PURE__ */ y("span", { children: r("tapin.autoRegister") }), /* @__PURE__ */ y(Au, {
											checked: a.auto_register,
											onCheckedChange: (e) => o({
												...a,
												auto_register: e
											})
										})]
									}),
									/* @__PURE__ */ b("div", {
										className: "grid gap-3 sm:grid-cols-2",
										children: [
											/* @__PURE__ */ b("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ y(Z, { children: r("tapin.payType") }), /* @__PURE__ */ y(X, {
													type: "number",
													dir: "ltr",
													value: a.default_pay_type,
													onChange: (e) => o({
														...a,
														default_pay_type: parseInt(e.target.value, 10) || 1
													})
												})]
											}),
											/* @__PURE__ */ b("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ y(Z, { children: r("tapin.employeeCode") }), /* @__PURE__ */ y(X, {
													type: "number",
													dir: "ltr",
													value: a.employee_code,
													onChange: (e) => o({
														...a,
														employee_code: parseInt(e.target.value, 10) || -1
													})
												})]
											}),
											/* @__PURE__ */ b("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ y(Z, { children: r("tapin.tipaxPickup") }), /* @__PURE__ */ y(X, {
													type: "number",
													dir: "ltr",
													value: a.tipax_pickup_type,
													onChange: (e) => o({
														...a,
														tipax_pickup_type: parseInt(e.target.value, 10) || 10
													})
												})]
											}),
											/* @__PURE__ */ b("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ y(Z, { children: r("tapin.tipaxDelivery") }), /* @__PURE__ */ y(X, {
													type: "number",
													dir: "ltr",
													value: a.tipax_delivery_type,
													onChange: (e) => o({
														...a,
														tipax_delivery_type: parseInt(e.target.value, 10) || 10
													})
												})]
											})
										]
									}),
									/* @__PURE__ */ b("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ y(Z, { children: r("tapin.autoRegisterWhen") }), /* @__PURE__ */ b(Ul, {
											value: a.auto_register_status,
											onValueChange: (e) => o({
												...a,
												auto_register_status: e
											}),
											children: [/* @__PURE__ */ y(Gl, { children: /* @__PURE__ */ y(Wl, {}) }), /* @__PURE__ */ b(Kl, { children: [
												/* @__PURE__ */ y(ql, {
													value: "processing",
													children: r("tapin.statusProcessing")
												}),
												/* @__PURE__ */ y(ql, {
													value: "packaged",
													children: r("tapin.statusPackaged")
												}),
												/* @__PURE__ */ y(ql, {
													value: "completed",
													children: r("tapin.statusCompleted")
												})
											] })]
										})]
									}),
									/* @__PURE__ */ b("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ y(Z, { children: r("tapin.registerType") }), /* @__PURE__ */ b(Ul, {
											value: String(a.register_type),
											onValueChange: (e) => o({
												...a,
												register_type: parseInt(e, 10) || 0
											}),
											children: [/* @__PURE__ */ y(Gl, { children: /* @__PURE__ */ y(Wl, {}) }), /* @__PURE__ */ b(Kl, { children: [
												/* @__PURE__ */ y(ql, {
													value: "0",
													children: r("tapin.registerType0")
												}),
												/* @__PURE__ */ y(ql, {
													value: "1",
													children: r("tapin.registerType1")
												}),
												/* @__PURE__ */ y(ql, {
													value: "2",
													children: r("tapin.registerType2")
												})
											] })]
										})]
									}),
									/* @__PURE__ */ b("label", {
										className: "flex items-center gap-3 text-sm",
										children: [/* @__PURE__ */ y(Au, {
											checked: a.has_insurance,
											onCheckedChange: (e) => o({
												...a,
												has_insurance: e
											})
										}), /* @__PURE__ */ y("span", { children: r("tapin.insurance") })]
									})
								]
							})]
						})
					}),
					/* @__PURE__ */ y(Tu, {
						value: "notify",
						className: "space-y-4 outline-none",
						children: /* @__PURE__ */ b(K, {
							className: "shadow-sm",
							children: [/* @__PURE__ */ b(q, {
								className: "pb-2",
								children: [/* @__PURE__ */ y(J, {
									className: "text-base",
									children: r("tapin.notifyTitle")
								}), /* @__PURE__ */ y(Ol, { children: r("tapin.notifyHint") })]
							}), /* @__PURE__ */ b(Y, {
								className: "space-y-3",
								children: [/* @__PURE__ */ y("p", {
									className: "text-sm leading-relaxed",
									children: r("tapin.notifyBody")
								}), /* @__PURE__ */ y(G, {
									asChild: !0,
									children: /* @__PURE__ */ y(x, {
										to: "/settings/shop/sms",
										children: r("tapin.openSms")
									})
								})]
							})]
						})
					})
				]
			})
		]
	}) : /* @__PURE__ */ y(bu, {
		title: r("tapin.settingsTitle"),
		children: /* @__PURE__ */ y("p", {
			className: "text-muted-foreground text-sm",
			children: r("common.loading")
		})
	});
}
//#endregion
//#region ../Modules/tapin-module/client/module-entry.tsx
var Pu = {
	"settings/shop/transport/tapin": Nu,
	"settings/shop/transport/tapin/ops": ku,
	"settings/shop/transport/tapin/finance": Du,
	"settings/shop/transport/tapin/catalog": Eu
}, Fu = { OrderTapinPanel: yu }, Iu = {
	routes: Pu,
	components: Fu
};
//#endregion
export { Fu as components, Iu as default, Pu as routes };
