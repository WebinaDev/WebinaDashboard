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
function ee(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function D(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = ee(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : ee(e[t], null);
			}
		};
	};
}
function O(...e) {
	return r.useCallback(D(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function k(e) {
	let t = /* @__PURE__ */ A(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(M);
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
function A(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = te(n), a = N(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? D(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var j = Symbol("radix.slottable");
function M(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === j;
}
function N(e, t) {
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
var P = [
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
	let n = /* @__PURE__ */ k(`Primitive.${t}`), i = r.forwardRef((e, r) => {
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
	e && g.flushSync(() => e.dispatchEvent(t));
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
}), ie = "VisuallyHidden", ae = r.forwardRef((e, t) => /* @__PURE__ */ y(P.span, {
	...e,
	ref: t,
	style: {
		...re,
		...e.style
	}
}));
ae.displayName = ie;
//#endregion
//#region node_modules/@radix-ui/react-context/dist/index.mjs
function F(e, t = []) {
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
	return a.scopeName = e, [i, I(a, ...t)];
}
function I(...e) {
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
function oe(e) {
	let t = /* @__PURE__ */ se(e), n = r.forwardRef((e, n) => {
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
function se(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = ue(n), a = le(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? D(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var L = Symbol("radix.slottable");
function ce(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === L;
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
	let t = e + "CollectionProvider", [n, r] = F(t), [a, o] = n(t, {
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
	let c = e + "CollectionSlot", l = /* @__PURE__ */ oe(c), u = i.forwardRef((e, t) => {
		let { scope: n, children: r } = e;
		return /* @__PURE__ */ y(l, {
			ref: O(t, o(c, n).collectionRef),
			children: r
		});
	});
	u.displayName = c;
	let d = e + "CollectionItemSlot", f = "data-radix-collection-item", p = /* @__PURE__ */ oe(d), m = i.forwardRef((e, t) => {
		let { scope: n, children: r, ...a } = e, s = i.useRef(null), c = O(t, s), l = o(d, n);
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
function R(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var fe = globalThis?.document ? r.useLayoutEffect : () => {}, pe = r.useInsertionEffect || fe;
function me({ prop: e, defaultProp: t, onChange: n = () => {}, caller: i }) {
	let [a, o, s] = he({
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
			let n = ge(t) ? t(e) : t;
			n !== e && s.current?.(n);
		} else o(t);
	}, [
		c,
		e,
		o,
		s
	])];
}
function he({ defaultProp: e, onChange: t }) {
	let [n, i] = r.useState(e), a = r.useRef(n), o = r.useRef(t);
	return pe(() => {
		o.current = t;
	}, [t]), r.useEffect(() => {
		a.current !== n && (o.current?.(n), a.current = n);
	}, [n, a]), [
		n,
		i,
		o
	];
}
function ge(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/@radix-ui/react-id/dist/index.mjs
var _e = r.useId || (() => void 0), ve = 0;
function ye(e) {
	let [t, n] = r.useState(_e());
	return fe(() => {
		e || n((e) => e ?? String(ve++));
	}, [e]), e || (t ? `radix-${t}` : "");
}
//#endregion
//#region node_modules/@radix-ui/react-direction/dist/index.mjs
var be = r.createContext(void 0);
function xe(e) {
	let t = r.useContext(be);
	return e || t || "ltr";
}
//#endregion
//#region node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
function Se(e) {
	let t = r.useRef(e);
	return r.useEffect(() => {
		t.current = e;
	}), r.useMemo(() => (...e) => t.current?.(...e), []);
}
//#endregion
//#region node_modules/@radix-ui/react-use-escape-keydown/dist/index.mjs
function Ce(e, t = globalThis?.document) {
	let n = Se(e);
	r.useEffect(() => {
		let e = (e) => {
			e.key === "Escape" && n(e);
		};
		return t.addEventListener("keydown", e, { capture: !0 }), () => t.removeEventListener("keydown", e, { capture: !0 });
	}, [n, t]);
}
//#endregion
//#region node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var we = "DismissableLayer", Te = "dismissableLayer.update", Ee = "dismissableLayer.pointerDownOutside", De = "dismissableLayer.focusOutside", Oe, ke = r.createContext({
	layers: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), Ae = r.forwardRef((e, t) => {
	let { disableOutsidePointerEvents: n = !1, onEscapeKeyDown: i, onPointerDownOutside: a, onFocusOutside: o, onInteractOutside: s, onDismiss: c, ...l } = e, u = r.useContext(ke), [d, f] = r.useState(null), p = d?.ownerDocument ?? globalThis?.document, [, m] = r.useState({}), h = O(t, (e) => f(e)), g = Array.from(u.layers), [_] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1), v = g.indexOf(_), b = d ? g.indexOf(d) : -1, x = u.layersWithOutsidePointerEventsDisabled.size > 0, S = b >= v, C = Ne((e) => {
		let t = e.target, n = [...u.branches].some((e) => e.contains(t));
		!S || n || (a?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p), w = Pe((e) => {
		let t = e.target;
		[...u.branches].some((e) => e.contains(t)) || (o?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p);
	return Ce((e) => {
		b === u.layers.size - 1 && (i?.(e), !e.defaultPrevented && c && (e.preventDefault(), c()));
	}, p), r.useEffect(() => {
		if (d) return n && (u.layersWithOutsidePointerEventsDisabled.size === 0 && (Oe = p.body.style.pointerEvents, p.body.style.pointerEvents = "none"), u.layersWithOutsidePointerEventsDisabled.add(d)), u.layers.add(d), Fe(), () => {
			n && u.layersWithOutsidePointerEventsDisabled.size === 1 && (p.body.style.pointerEvents = Oe);
		};
	}, [
		d,
		p,
		n,
		u
	]), r.useEffect(() => () => {
		d && (u.layers.delete(d), u.layersWithOutsidePointerEventsDisabled.delete(d), Fe());
	}, [d, u]), r.useEffect(() => {
		let e = () => m({});
		return document.addEventListener(Te, e), () => document.removeEventListener(Te, e);
	}, []), /* @__PURE__ */ y(P.div, {
		...l,
		ref: h,
		style: {
			pointerEvents: x ? S ? "auto" : "none" : void 0,
			...e.style
		},
		onFocusCapture: R(e.onFocusCapture, w.onFocusCapture),
		onBlurCapture: R(e.onBlurCapture, w.onBlurCapture),
		onPointerDownCapture: R(e.onPointerDownCapture, C.onPointerDownCapture)
	});
});
Ae.displayName = we;
var je = "DismissableLayerBranch", Me = r.forwardRef((e, t) => {
	let n = r.useContext(ke), i = r.useRef(null), a = O(t, i);
	return r.useEffect(() => {
		let e = i.current;
		if (e) return n.branches.add(e), () => {
			n.branches.delete(e);
		};
	}, [n.branches]), /* @__PURE__ */ y(P.div, {
		...e,
		ref: a
	});
});
Me.displayName = je;
function Ne(e, t = globalThis?.document) {
	let n = Se(e), i = r.useRef(!1), a = r.useRef(() => {});
	return r.useEffect(() => {
		let e = (e) => {
			if (e.target && !i.current) {
				let r = function() {
					Ie(Ee, n, i, { discrete: !0 });
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
function Pe(e, t = globalThis?.document) {
	let n = Se(e), i = r.useRef(!1);
	return r.useEffect(() => {
		let e = (e) => {
			e.target && !i.current && Ie(De, n, { originalEvent: e }, { discrete: !1 });
		};
		return t.addEventListener("focusin", e), () => t.removeEventListener("focusin", e);
	}, [t, n]), {
		onFocusCapture: () => i.current = !0,
		onBlurCapture: () => i.current = !1
	};
}
function Fe() {
	let e = new CustomEvent(Te);
	document.dispatchEvent(e);
}
function Ie(e, t, n, { discrete: r }) {
	let i = n.originalEvent.target, a = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && i.addEventListener(e, t, { once: !0 }), r ? ne(i, a) : i.dispatchEvent(a);
}
//#endregion
//#region node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var Le = "focusScope.autoFocusOnMount", Re = "focusScope.autoFocusOnUnmount", ze = {
	bubbles: !1,
	cancelable: !0
}, Be = "FocusScope", Ve = r.forwardRef((e, t) => {
	let { loop: n = !1, trapped: i = !1, onMountAutoFocus: a, onUnmountAutoFocus: o, ...s } = e, [c, l] = r.useState(null), u = Se(a), d = Se(o), f = r.useRef(null), p = O(t, (e) => l(e)), m = r.useRef({
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
				c.contains(t) ? f.current = t : Je(f.current, { select: !0 });
			}, t = function(e) {
				if (m.paused || !c) return;
				let t = e.relatedTarget;
				t !== null && (c.contains(t) || Je(f.current, { select: !0 }));
			}, n = function(e) {
				if (document.activeElement === document.body) for (let t of e) t.removedNodes.length > 0 && Je(c);
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
			Ye.add(m);
			let e = document.activeElement;
			if (!c.contains(e)) {
				let t = new CustomEvent(Le, ze);
				c.addEventListener(Le, u), c.dispatchEvent(t), t.defaultPrevented || (He(Qe(We(c)), { select: !0 }), document.activeElement === e && Je(c));
			}
			return () => {
				c.removeEventListener(Le, u), setTimeout(() => {
					let t = new CustomEvent(Re, ze);
					c.addEventListener(Re, d), c.dispatchEvent(t), t.defaultPrevented || Je(e ?? document.body, { select: !0 }), c.removeEventListener(Re, d), Ye.remove(m);
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
			let t = e.currentTarget, [i, a] = Ue(t);
			i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n && Je(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n && Je(a, { select: !0 })) : r === t && e.preventDefault();
		}
	}, [
		n,
		i,
		m.paused
	]);
	return /* @__PURE__ */ y(P.div, {
		tabIndex: -1,
		...s,
		ref: p,
		onKeyDown: h
	});
});
Ve.displayName = Be;
function He(e, { select: t = !1 } = {}) {
	let n = document.activeElement;
	for (let r of e) if (Je(r, { select: t }), document.activeElement !== n) return;
}
function Ue(e) {
	let t = We(e);
	return [Ge(t, e), Ge(t.reverse(), e)];
}
function We(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t;
}
function Ge(e, t) {
	for (let n of e) if (!Ke(n, { upTo: t })) return n;
}
function Ke(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function qe(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function Je(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = document.activeElement;
		e.focus({ preventScroll: !0 }), e !== n && qe(e) && t && e.select();
	}
}
var Ye = Xe();
function Xe() {
	let e = [];
	return {
		add(t) {
			let n = e[0];
			t !== n && n?.pause(), e = Ze(e, t), e.unshift(t);
		},
		remove(t) {
			e = Ze(e, t), e[0]?.resume();
		}
	};
}
function Ze(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
function Qe(e) {
	return e.filter((e) => e.tagName !== "A");
}
//#endregion
//#region node_modules/@radix-ui/react-portal/dist/index.mjs
var $e = "Portal", et = r.forwardRef((e, t) => {
	let { container: n, ...i } = e, [a, o] = r.useState(!1);
	fe(() => o(!0), []);
	let s = n || a && globalThis?.document?.body;
	return s ? _.createPortal(/* @__PURE__ */ y(P.div, {
		...i,
		ref: t
	}), s) : null;
});
et.displayName = $e;
//#endregion
//#region node_modules/@radix-ui/react-focus-guards/dist/index.mjs
var tt = 0;
function nt() {
	r.useEffect(() => {
		let e = document.querySelectorAll("[data-radix-focus-guard]");
		return document.body.insertAdjacentElement("afterbegin", e[0] ?? rt()), document.body.insertAdjacentElement("beforeend", e[1] ?? rt()), tt++, () => {
			tt === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((e) => e.remove()), tt--;
		};
	}, []);
}
function rt() {
	let e = document.createElement("span");
	return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
//#endregion
//#region node_modules/tslib/tslib.es6.mjs
var it = function() {
	return it = Object.assign || function(e) {
		for (var t, n = 1, r = arguments.length; n < r; n++) for (var i in t = arguments[n], t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
		return e;
	}, it.apply(this, arguments);
};
function at(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
function ot(e, t, n) {
	if (n || arguments.length === 2) for (var r = 0, i = t.length, a; r < i; r++) (a || !(r in t)) && (a || (a = Array.prototype.slice.call(t, 0, r)), a[r] = t[r]);
	return e.concat(a || Array.prototype.slice.call(t));
}
//#endregion
//#region node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var st = "right-scroll-bar-position", ct = "width-before-scroll-bar", lt = "with-scroll-bars-hidden", ut = "--removed-body-scroll-bar-size";
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/assignRef.js
function dt(e, t) {
	return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/useRef.js
function ft(e, t) {
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
var pt = typeof window < "u" ? r.useLayoutEffect : r.useEffect, mt = /* @__PURE__ */ new WeakMap();
function ht(e, t) {
	var n = ft(t || null, function(t) {
		return e.forEach(function(e) {
			return dt(e, t);
		});
	});
	return pt(function() {
		var t = mt.get(n);
		if (t) {
			var r = new Set(t), i = new Set(e), a = n.current;
			r.forEach(function(e) {
				i.has(e) || dt(e, null);
			}), i.forEach(function(e) {
				r.has(e) || dt(e, a);
			});
		}
		mt.set(n, e);
	}, [e]), n;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/medium.js
function gt(e) {
	return e;
}
function _t(e, t) {
	t === void 0 && (t = gt);
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
function vt(e) {
	e === void 0 && (e = {});
	var t = _t(null);
	return t.options = it({
		async: !0,
		ssr: !1
	}, e), t;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/exports.js
var yt = function(e) {
	var t = e.sideCar, n = at(e, ["sideCar"]);
	if (!t) throw Error("Sidecar: please provide `sideCar` property to import the right car");
	var i = t.read();
	if (!i) throw Error("Sidecar medium not found");
	return r.createElement(i, it({}, n));
};
yt.isSideCarExport = !0;
function bt(e, t) {
	return e.useMedium(t), yt;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/medium.js
var xt = vt(), St = function() {}, Ct = r.forwardRef(function(e, t) {
	var n = r.useRef(null), i = r.useState({
		onScrollCapture: St,
		onWheelCapture: St,
		onTouchMoveCapture: St
	}), a = i[0], o = i[1], s = e.forwardProps, c = e.children, l = e.className, u = e.removeScrollBar, d = e.enabled, f = e.shards, p = e.sideCar, m = e.noRelative, h = e.noIsolation, g = e.inert, _ = e.allowPinchZoom, v = e.as, y = v === void 0 ? "div" : v, b = e.gapMode, x = at(e, [
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
	]), S = p, C = ht([n, t]), w = it(it({}, x), a);
	return r.createElement(r.Fragment, null, d && r.createElement(S, {
		sideCar: xt,
		removeScrollBar: u,
		shards: f,
		noRelative: m,
		noIsolation: h,
		inert: g,
		setCallbacks: o,
		allowPinchZoom: !!_,
		lockRef: n,
		gapMode: b
	}), s ? r.cloneElement(r.Children.only(c), it(it({}, w), { ref: C })) : r.createElement(y, it({}, w, {
		className: l,
		ref: C
	}), c));
});
Ct.defaultProps = {
	enabled: !0,
	removeScrollBar: !0,
	inert: !1
}, Ct.classNames = {
	fullWidth: ct,
	zeroRight: st
};
//#endregion
//#region node_modules/get-nonce/dist/es2015/index.js
var wt, Tt = function() {
	if (wt) return wt;
	if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
//#endregion
//#region node_modules/react-style-singleton/dist/es2015/singleton.js
function Et() {
	if (!document) return null;
	var e = document.createElement("style");
	e.type = "text/css";
	var t = Tt();
	return t && e.setAttribute("nonce", t), e;
}
function Dt(e, t) {
	e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function Ot(e) {
	(document.head || document.getElementsByTagName("head")[0]).appendChild(e);
}
var kt = function() {
	var e = 0, t = null;
	return {
		add: function(n) {
			e == 0 && (t = Et()) && (Dt(t, n), Ot(t)), e++;
		},
		remove: function() {
			e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
		}
	};
}, At = function() {
	var e = kt();
	return function(t, n) {
		r.useEffect(function() {
			return e.add(t), function() {
				e.remove();
			};
		}, [t && n]);
	};
}, jt = function() {
	var e = At();
	return function(t) {
		var n = t.styles, r = t.dynamic;
		return e(n, r), null;
	};
}, Mt = {
	left: 0,
	top: 0,
	right: 0,
	gap: 0
}, Nt = function(e) {
	return parseInt(e || "", 10) || 0;
}, Pt = function(e) {
	var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
	return [
		Nt(n),
		Nt(r),
		Nt(i)
	];
}, Ft = function(e) {
	if (e === void 0 && (e = "margin"), typeof window > "u") return Mt;
	var t = Pt(e), n = document.documentElement.clientWidth, r = window.innerWidth;
	return {
		left: t[0],
		top: t[1],
		right: t[2],
		gap: Math.max(0, r - n + t[2] - t[0])
	};
}, It = jt(), Lt = "data-scroll-locked", Rt = function(e, t, n, r) {
	var i = e.left, a = e.top, o = e.right, s = e.gap;
	return n === void 0 && (n = "margin"), `
  .${lt} {
   overflow: hidden ${r};
   padding-right: ${s}px ${r};
  }
  body[${Lt}] {
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
  
  .${st} {
    right: ${s}px ${r};
  }
  
  .${ct} {
    margin-right: ${s}px ${r};
  }
  
  .${st} .${st} {
    right: 0 ${r};
  }
  
  .${ct} .${ct} {
    margin-right: 0 ${r};
  }
  
  body[${Lt}] {
    ${ut}: ${s}px;
  }
`;
}, zt = function() {
	var e = parseInt(document.body.getAttribute("data-scroll-locked") || "0", 10);
	return isFinite(e) ? e : 0;
}, Bt = function() {
	r.useEffect(function() {
		return document.body.setAttribute(Lt, (zt() + 1).toString()), function() {
			var e = zt() - 1;
			e <= 0 ? document.body.removeAttribute(Lt) : document.body.setAttribute(Lt, e.toString());
		};
	}, []);
}, Vt = function(e) {
	var t = e.noRelative, n = e.noImportant, i = e.gapMode, a = i === void 0 ? "margin" : i;
	Bt();
	var o = r.useMemo(function() {
		return Ft(a);
	}, [a]);
	return r.createElement(It, { styles: Rt(o, !t, a, n ? "" : "!important") });
}, Ht = !1;
if (typeof window < "u") try {
	var Ut = Object.defineProperty({}, "passive", { get: function() {
		return Ht = !0, !0;
	} });
	window.addEventListener("test", Ut, Ut), window.removeEventListener("test", Ut, Ut);
} catch {
	Ht = !1;
}
var Wt = Ht ? { passive: !1 } : !1, Gt = function(e) {
	return e.tagName === "TEXTAREA";
}, Kt = function(e, t) {
	if (!(e instanceof Element)) return !1;
	var n = window.getComputedStyle(e);
	return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !Gt(e) && n[t] === "visible");
}, qt = function(e) {
	return Kt(e, "overflowY");
}, Jt = function(e) {
	return Kt(e, "overflowX");
}, Yt = function(e, t) {
	var n = t.ownerDocument, r = t;
	do {
		if (typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host), Qt(e, r)) {
			var i = $t(e, r);
			if (i[1] > i[2]) return !0;
		}
		r = r.parentNode;
	} while (r && r !== n.body);
	return !1;
}, Xt = function(e) {
	return [
		e.scrollTop,
		e.scrollHeight,
		e.clientHeight
	];
}, Zt = function(e) {
	return [
		e.scrollLeft,
		e.scrollWidth,
		e.clientWidth
	];
}, Qt = function(e, t) {
	return e === "v" ? qt(t) : Jt(t);
}, $t = function(e, t) {
	return e === "v" ? Xt(t) : Zt(t);
}, en = function(e, t) {
	return e === "h" && t === "rtl" ? -1 : 1;
}, tn = function(e, t, n, r, i) {
	var a = en(e, window.getComputedStyle(t).direction), o = a * r, s = n.target, c = t.contains(s), l = !1, u = o > 0, d = 0, f = 0;
	do {
		if (!s) break;
		var p = $t(e, s), m = p[0], h = p[1] - p[2] - a * m;
		(m || h) && Qt(e, s) && (d += h, f += m);
		var g = s.parentNode;
		s = g && g.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? g.host : g;
	} while (!c && s !== document.body || c && (t.contains(s) || t === s));
	return (u && (i && Math.abs(d) < 1 || !i && o > d) || !u && (i && Math.abs(f) < 1 || !i && -o > f)) && (l = !0), l;
}, nn = function(e) {
	return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, rn = function(e) {
	return [e.deltaX, e.deltaY];
}, an = function(e) {
	return e && "current" in e ? e.current : e;
}, on = function(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}, sn = function(e) {
	return `
  .block-interactivity-${e} {pointer-events: none;}
  .allow-interactivity-${e} {pointer-events: all;}
`;
}, cn = 0, ln = [];
function un(e) {
	var t = r.useRef([]), n = r.useRef([0, 0]), i = r.useRef(), a = r.useState(cn++)[0], o = r.useState(jt)[0], s = r.useRef(e);
	r.useEffect(function() {
		s.current = e;
	}, [e]), r.useEffect(function() {
		if (e.inert) {
			document.body.classList.add(`block-interactivity-${a}`);
			var t = ot([e.lockRef.current], (e.shards || []).map(an), !0).filter(Boolean);
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
		var r = nn(e), a = n.current, o = "deltaX" in e ? e.deltaX : a[0] - r[0], c = "deltaY" in e ? e.deltaY : a[1] - r[1], l, u = e.target, d = Math.abs(o) > Math.abs(c) ? "h" : "v";
		if ("touches" in e && d === "h" && u.type === "range") return !1;
		var f = window.getSelection(), p = f && f.anchorNode;
		if (p && (p === u || p.contains(u))) return !1;
		var m = Yt(d, u);
		if (!m) return !0;
		if (m ? l = d : (l = d === "v" ? "h" : "v", m = Yt(d, u)), !m) return !1;
		if (!i.current && "changedTouches" in e && (o || c) && (i.current = l), !l) return !0;
		var h = i.current || l;
		return tn(h, t, e, h === "h" ? o : c, !0);
	}, []), l = r.useCallback(function(e) {
		var n = e;
		if (!(!ln.length || ln[ln.length - 1] !== o)) {
			var r = "deltaY" in n ? rn(n) : nn(n), i = t.current.filter(function(e) {
				return e.name === n.type && (e.target === n.target || n.target === e.shadowParent) && on(e.delta, r);
			})[0];
			if (i && i.should) {
				n.cancelable && n.preventDefault();
				return;
			}
			if (!i) {
				var a = (s.current.shards || []).map(an).filter(Boolean).filter(function(e) {
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
			shadowParent: dn(r)
		};
		t.current.push(a), setTimeout(function() {
			t.current = t.current.filter(function(e) {
				return e !== a;
			});
		}, 1);
	}, []), d = r.useCallback(function(e) {
		n.current = nn(e), i.current = void 0;
	}, []), f = r.useCallback(function(t) {
		u(t.type, rn(t), t.target, c(t, e.lockRef.current));
	}, []), p = r.useCallback(function(t) {
		u(t.type, nn(t), t.target, c(t, e.lockRef.current));
	}, []);
	r.useEffect(function() {
		return ln.push(o), e.setCallbacks({
			onScrollCapture: f,
			onWheelCapture: f,
			onTouchMoveCapture: p
		}), document.addEventListener("wheel", l, Wt), document.addEventListener("touchmove", l, Wt), document.addEventListener("touchstart", d, Wt), function() {
			ln = ln.filter(function(e) {
				return e !== o;
			}), document.removeEventListener("wheel", l, Wt), document.removeEventListener("touchmove", l, Wt), document.removeEventListener("touchstart", d, Wt);
		};
	}, []);
	var m = e.removeScrollBar, h = e.inert;
	return r.createElement(r.Fragment, null, h ? r.createElement(o, { styles: sn(a) }) : null, m ? r.createElement(Vt, {
		noRelative: e.noRelative,
		gapMode: e.gapMode
	}) : null);
}
function dn(e) {
	for (var t = null; e !== null;) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
	return t;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/sidecar.js
var fn = bt(xt, un), pn = r.forwardRef(function(e, t) {
	return r.createElement(Ct, it({}, e, {
		ref: t,
		sideCar: fn
	}));
});
pn.classNames = Ct.classNames;
//#endregion
//#region src/lib/remove-scroll-gate.tsx
var mn = r.createContext(!1);
function hn({ allowBodyScroll: e, children: t }) {
	return /* @__PURE__ */ y(mn.Provider, {
		value: e,
		children: t
	});
}
function gn() {
	return r.useContext(mn);
}
//#endregion
//#region src/lib/react-remove-scroll-shim.tsx
var _n = r.forwardRef(function(e, t) {
	let n = gn() ? !1 : e.enabled !== !1;
	return /* @__PURE__ */ y(pn, {
		...e,
		ref: t,
		enabled: n
	});
});
_n.classNames = pn.classNames;
//#endregion
//#region node_modules/aria-hidden/dist/es2015/index.js
var vn = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, yn = /* @__PURE__ */ new WeakMap(), bn = /* @__PURE__ */ new WeakMap(), xn = {}, Sn = 0, Cn = function(e) {
	return e && (e.host || Cn(e.parentNode));
}, wn = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = Cn(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, Tn = function(e, t, n, r) {
	var i = wn(t, Array.isArray(e) ? e : [e]);
	xn[n] || (xn[n] = /* @__PURE__ */ new WeakMap());
	var a = xn[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		!e || s.has(e) || (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		!e || c.has(e) || Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (yn.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				yn.set(e, c), a.set(e, l), o.push(e), c === 1 && i && bn.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), Sn++, function() {
		o.forEach(function(e) {
			var t = yn.get(e) - 1, i = a.get(e) - 1;
			yn.set(e, t), a.set(e, i), t || (bn.has(e) || e.removeAttribute(r), bn.delete(e)), i || e.removeAttribute(n);
		}), Sn--, Sn || (yn = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), bn = /* @__PURE__ */ new WeakMap(), xn = {});
	};
}, En = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || vn(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), Tn(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function Dn(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function On(e) {
	let [t, n] = r.useState(void 0);
	return fe(() => {
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
var kn = [
	"top",
	"right",
	"bottom",
	"left"
], An = Math.min, jn = Math.max, Mn = Math.round, Nn = Math.floor, Pn = (e) => ({
	x: e,
	y: e
}), Fn = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function In(e, t, n) {
	return jn(e, An(t, n));
}
function Ln(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function Rn(e) {
	return e.split("-")[0];
}
function zn(e) {
	return e.split("-")[1];
}
function Bn(e) {
	return e === "x" ? "y" : "x";
}
function Vn(e) {
	return e === "y" ? "height" : "width";
}
function Hn(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function Un(e) {
	return Bn(Hn(e));
}
function Wn(e, t, n) {
	n === void 0 && (n = !1);
	let r = zn(e), i = Un(e), a = Vn(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = $n(o)), [o, $n(o)];
}
function Gn(e) {
	let t = $n(e);
	return [
		Kn(e),
		t,
		Kn(t)
	];
}
function Kn(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var qn = ["left", "right"], Jn = ["right", "left"], Yn = ["top", "bottom"], Xn = ["bottom", "top"];
function Zn(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? Jn : qn : t ? qn : Jn;
		case "left":
		case "right": return t ? Yn : Xn;
		default: return [];
	}
}
function Qn(e, t, n, r) {
	let i = zn(e), a = Zn(Rn(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(Kn)))), a;
}
function $n(e) {
	let t = Rn(e);
	return Fn[t] + e.slice(t.length);
}
function er(e) {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...e
	};
}
function tr(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : er(e);
}
function nr(e) {
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
function rr(e, t, n) {
	let { reference: r, floating: i } = e, a = Hn(t), o = Un(t), s = Vn(o), c = Rn(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	switch (zn(t)) {
		case "start":
			p[o] -= f * (n && l ? -1 : 1);
			break;
		case "end":
			p[o] += f * (n && l ? -1 : 1);
			break;
	}
	return p;
}
async function ir(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = Ln(t, e), p = tr(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = nr(await i.getClippingRect({
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
	}, y = nr(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var ar = 50, or = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: ir
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = rr(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < ar && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = rr(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, sr = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = Ln(e, t) || {};
		if (l == null) return {};
		let d = tr(u), f = {
			x: n,
			y: r
		}, p = Un(i), m = Vn(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = An(d[_], T), ee = An(d[v], T), D = E, O = C - h[m] - ee, k = C / 2 - h[m] / 2 + w, A = In(D, k, O), j = !c.arrow && zn(i) != null && k !== A && a.reference[m] / 2 - (k < D ? E : ee) - h[m] / 2 < 0, M = j ? k < D ? k - D : k - O : 0;
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
}), cr = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = Ln(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = Rn(r), _ = Hn(o), v = Rn(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [$n(o)] : Gn(o)), x = p !== "none";
			!d && x && b.push(...Qn(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = Wn(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (!(u === "alignment" && _ !== Hn(t)) || T.every((e) => Hn(e.placement) === _ ? e.overflows[0] > 0 : !0))) return {
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
								let t = Hn(e.placement);
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
function lr(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function ur(e) {
	return kn.some((t) => e[t] >= 0);
}
var dr = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = Ln(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = lr(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: ur(e)
					} };
				}
				case "escaped": {
					let e = lr(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: ur(e)
					} };
				}
				default: return {};
			}
		}
	};
}, fr = /* @__PURE__ */ new Set(["left", "top"]);
async function pr(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = Rn(n), s = zn(n), c = Hn(n) === "y", l = fr.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = Ln(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var mr = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await pr(t, e);
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
}, hr = function(e) {
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
			} }, ...l } = Ln(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = Hn(Rn(i)), p = Bn(f), m = u[p], h = u[f];
			if (o) {
				let e = p === "y" ? "top" : "left", t = p === "y" ? "bottom" : "right", n = m + d[e], r = m - d[t];
				m = In(n, m, r);
			}
			if (s) {
				let e = f === "y" ? "top" : "left", t = f === "y" ? "bottom" : "right", n = h + d[e], r = h - d[t];
				h = In(n, h, r);
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
}, gr = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = Ln(e, t), u = {
				x: n,
				y: r
			}, d = Hn(i), f = Bn(d), p = u[f], m = u[d], h = Ln(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = fr.has(Rn(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, _r = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			var n, r;
			let { placement: i, rects: a, platform: o, elements: s } = t, { apply: c = () => {}, ...l } = Ln(e, t), u = await o.detectOverflow(t, l), d = Rn(i), f = zn(i), p = Hn(i) === "y", { width: m, height: h } = a.floating, g, _;
			d === "top" || d === "bottom" ? (g = d, _ = f === (await (o.isRTL == null ? void 0 : o.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (_ = d, g = f === "end" ? "top" : "bottom");
			let v = h - u.top - u.bottom, y = m - u.left - u.right, b = An(h - u[g], v), x = An(m - u[_], y), S = !t.middlewareData.shift, C = b, w = x;
			if ((n = t.middlewareData.shift) != null && n.enabled.x && (w = y), (r = t.middlewareData.shift) != null && r.enabled.y && (C = v), S && !f) {
				let e = jn(u.left, 0), t = jn(u.right, 0), n = jn(u.top, 0), r = jn(u.bottom, 0);
				p ? w = m - 2 * (e !== 0 || t !== 0 ? e + t : jn(u.left, u.right)) : C = h - 2 * (n !== 0 || r !== 0 ? n + r : jn(u.top, u.bottom));
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
function vr() {
	return typeof window < "u";
}
function yr(e) {
	return Sr(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function br(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function xr(e) {
	return ((Sr(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function Sr(e) {
	return vr() ? e instanceof Node || e instanceof br(e).Node : !1;
}
function Cr(e) {
	return vr() ? e instanceof Element || e instanceof br(e).Element : !1;
}
function wr(e) {
	return vr() ? e instanceof HTMLElement || e instanceof br(e).HTMLElement : !1;
}
function Tr(e) {
	return !vr() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof br(e).ShadowRoot;
}
function Er(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = Lr(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function Dr(e) {
	return /^(table|td|th)$/.test(yr(e));
}
function Or(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var kr = /transform|translate|scale|rotate|perspective|filter/, Ar = /paint|layout|strict|content/, jr = (e) => !!e && e !== "none", Mr;
function Nr(e) {
	let t = Cr(e) ? Lr(e) : e;
	return jr(t.transform) || jr(t.translate) || jr(t.scale) || jr(t.rotate) || jr(t.perspective) || !Fr() && (jr(t.backdropFilter) || jr(t.filter)) || kr.test(t.willChange || "") || Ar.test(t.contain || "");
}
function Pr(e) {
	let t = zr(e);
	for (; wr(t) && !Ir(t);) {
		if (Nr(t)) return t;
		if (Or(t)) return null;
		t = zr(t);
	}
	return null;
}
function Fr() {
	return Mr ?? (Mr = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), Mr;
}
function Ir(e) {
	return /^(html|body|#document)$/.test(yr(e));
}
function Lr(e) {
	return br(e).getComputedStyle(e);
}
function Rr(e) {
	return Cr(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function zr(e) {
	if (yr(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Tr(e) && e.host || xr(e);
	return Tr(t) ? t.host : t;
}
function Br(e) {
	let t = zr(e);
	return Ir(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : wr(t) && Er(t) ? t : Br(t);
}
function Vr(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = Br(e), i = r === e.ownerDocument?.body, a = br(r);
	if (i) {
		let e = Hr(a);
		return t.concat(a, a.visualViewport || [], Er(r) ? r : [], e && n ? Vr(e) : []);
	} else return t.concat(r, Vr(r, [], n));
}
function Hr(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function Ur(e) {
	let t = Lr(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = wr(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = Mn(n) !== a || Mn(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function Wr(e) {
	return Cr(e) ? e : e.contextElement;
}
function Gr(e) {
	let t = Wr(e);
	if (!wr(t)) return Pn(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = Ur(t), o = (a ? Mn(n.width) : n.width) / r, s = (a ? Mn(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var Kr = /* @__PURE__ */ Pn(0);
function qr(e) {
	let t = br(e);
	return !Fr() || !t.visualViewport ? Kr : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function Jr(e, t, n) {
	return t === void 0 && (t = !1), !n || t && n !== br(e) ? !1 : t;
}
function Yr(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = Wr(e), o = Pn(1);
	t && (r ? Cr(r) && (o = Gr(r)) : o = Gr(e));
	let s = Jr(a, n, r) ? qr(a) : Pn(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a) {
		let e = br(a), t = r && Cr(r) ? br(r) : r, n = e, i = Hr(n);
		for (; i && r && t !== n;) {
			let e = Gr(i), t = i.getBoundingClientRect(), r = Lr(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = br(i), i = Hr(n);
		}
	}
	return nr({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function Xr(e, t) {
	let n = Rr(e).scrollLeft;
	return t ? t.left + n : Yr(xr(e)).left + n;
}
function Zr(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - Xr(e, n),
		y: n.top + t.scrollTop
	};
}
function Qr(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = xr(r), s = t ? Or(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = Pn(1), u = Pn(0), d = wr(r);
	if ((d || !d && !a) && ((yr(r) !== "body" || Er(o)) && (c = Rr(r)), d)) {
		let e = Yr(r);
		l = Gr(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? Zr(o, c) : Pn(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function $r(e) {
	return Array.from(e.getClientRects());
}
function ei(e) {
	let t = xr(e), n = Rr(e), r = e.ownerDocument.body, i = jn(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), a = jn(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight), o = -n.scrollLeft + Xr(e), s = -n.scrollTop;
	return Lr(r).direction === "rtl" && (o += jn(t.clientWidth, r.clientWidth) - i), {
		width: i,
		height: a,
		x: o,
		y: s
	};
}
var ti = 25;
function ni(e, t) {
	let n = br(e), r = xr(e), i = n.visualViewport, a = r.clientWidth, o = r.clientHeight, s = 0, c = 0;
	if (i) {
		a = i.width, o = i.height;
		let e = Fr();
		(!e || e && t === "fixed") && (s = i.offsetLeft, c = i.offsetTop);
	}
	let l = Xr(r);
	if (l <= 0) {
		let e = r.ownerDocument, t = e.body, n = getComputedStyle(t), i = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, o = Math.abs(r.clientWidth - t.clientWidth - i);
		o <= ti && (a -= o);
	} else l <= ti && (a += l);
	return {
		width: a,
		height: o,
		x: s,
		y: c
	};
}
function ri(e, t) {
	let n = Yr(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = wr(e) ? Gr(e) : Pn(1);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function ii(e, t, n) {
	let r;
	if (t === "viewport") r = ni(e, n);
	else if (t === "document") r = ei(xr(e));
	else if (Cr(t)) r = ri(t, n);
	else {
		let n = qr(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return nr(r);
}
function ai(e, t) {
	let n = zr(e);
	return n === t || !Cr(n) || Ir(n) ? !1 : Lr(n).position === "fixed" || ai(n, t);
}
function oi(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = Vr(e, [], !1).filter((e) => Cr(e) && yr(e) !== "body"), i = null, a = Lr(e).position === "fixed", o = a ? zr(e) : e;
	for (; Cr(o) && !Ir(o);) {
		let t = Lr(o), n = Nr(o);
		!n && t.position === "fixed" && (i = null), (a ? !n && !i : !n && t.position === "static" && i && (i.position === "absolute" || i.position === "fixed") || Er(o) && !n && ai(e, o)) ? r = r.filter((e) => e !== o) : i = t, o = zr(o);
	}
	return t.set(e, r), r;
}
function si(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? Or(t) ? [] : oi(t, this._c) : [].concat(n), r], o = ii(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = ii(t, a[e], i);
		s = jn(n.top, s), c = An(n.right, c), l = An(n.bottom, l), u = jn(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function ci(e) {
	let { width: t, height: n } = Ur(e);
	return {
		width: t,
		height: n
	};
}
function li(e, t, n) {
	let r = wr(t), i = xr(t), a = n === "fixed", o = Yr(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = Pn(0);
	function l() {
		c.x = Xr(i);
	}
	if (r || !r && !a) if ((yr(t) !== "body" || Er(i)) && (s = Rr(t)), r) {
		let e = Yr(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	} else i && l();
	a && !r && i && l();
	let u = i && !r && !a ? Zr(i, s) : Pn(0);
	return {
		x: o.left + s.scrollLeft - c.x - u.x,
		y: o.top + s.scrollTop - c.y - u.y,
		width: o.width,
		height: o.height
	};
}
function ui(e) {
	return Lr(e).position === "static";
}
function di(e, t) {
	if (!wr(e) || Lr(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return xr(e) === n && (n = n.ownerDocument.body), n;
}
function fi(e, t) {
	let n = br(e);
	if (Or(e)) return n;
	if (!wr(e)) {
		let t = zr(e);
		for (; t && !Ir(t);) {
			if (Cr(t) && !ui(t)) return t;
			t = zr(t);
		}
		return n;
	}
	let r = di(e, t);
	for (; r && Dr(r) && ui(r);) r = di(r, t);
	return r && Ir(r) && ui(r) && !Nr(r) ? n : r || Pr(e) || n;
}
var pi = async function(e) {
	let t = this.getOffsetParent || fi, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: li(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function mi(e) {
	return Lr(e).direction === "rtl";
}
var hi = {
	convertOffsetParentRelativeRectToViewportRelativeRect: Qr,
	getDocumentElement: xr,
	getClippingRect: si,
	getOffsetParent: fi,
	getElementRects: pi,
	getClientRects: $r,
	getDimensions: ci,
	getScale: Gr,
	isElement: Cr,
	isRTL: mi
};
function gi(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function _i(e, t) {
	let n = null, r, i = xr(e);
	function a() {
		var e;
		clearTimeout(r), (e = n) == null || e.disconnect(), n = null;
	}
	function o(s, c) {
		s === void 0 && (s = !1), c === void 0 && (c = 1), a();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (s || t(), !f || !p) return;
		let m = Nn(d), h = Nn(i.clientWidth - (u + f)), g = Nn(i.clientHeight - (d + p)), _ = Nn(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: jn(0, An(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (n !== c) {
				if (!y) return o();
				n ? o(!1, n) : r = setTimeout(() => {
					o(!1, 1e-7);
				}, 1e3);
			}
			n === 1 && !gi(l, e.getBoundingClientRect()) && o(), y = !1;
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
function vi(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = Wr(e), u = i || a ? [...l ? Vr(l) : [], ...t ? Vr(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n, { passive: !0 }), a && e.addEventListener("resize", n);
	});
	let d = l && s ? _i(l, n) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? Yr(e) : null;
	c && g();
	function g() {
		let t = Yr(e);
		h && !gi(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var yi = mr, bi = hr, xi = cr, Si = _r, Ci = dr, wi = sr, Ti = gr, Ei = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = {
		platform: hi,
		...n
	}, a = {
		...i.platform,
		_c: r
	};
	return or(e, t, {
		...i,
		platform: a
	});
}, Di = typeof document < "u" ? u : function() {};
function Oi(e, t) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (typeof e == "function" && e.toString() === t.toString()) return !0;
	let n, r, i;
	if (e && t && typeof e == "object") {
		if (Array.isArray(e)) {
			if (n = e.length, n !== t.length) return !1;
			for (r = n; r-- !== 0;) if (!Oi(e[r], t[r])) return !1;
			return !0;
		}
		if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length) return !1;
		for (r = n; r-- !== 0;) if (!{}.hasOwnProperty.call(t, i[r])) return !1;
		for (r = n; r-- !== 0;) {
			let n = i[r];
			if (!(n === "_owner" && e.$$typeof) && !Oi(e[n], t[n])) return !1;
		}
		return !0;
	}
	return e !== e && t !== t;
}
function ki(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Ai(e, t) {
	let n = ki(e);
	return Math.round(t * n) / n;
}
function ji(e) {
	let t = r.useRef(e);
	return Di(() => {
		t.current = e;
	}), t;
}
function Mi(e) {
	e === void 0 && (e = {});
	let { placement: t = "bottom", strategy: n = "absolute", middleware: i = [], platform: a, elements: { reference: o, floating: s } = {}, transform: c = !0, whileElementsMounted: l, open: u } = e, [d, f] = r.useState({
		x: 0,
		y: 0,
		strategy: n,
		placement: t,
		middlewareData: {},
		isPositioned: !1
	}), [p, m] = r.useState(i);
	Oi(p, i) || m(i);
	let [h, _] = r.useState(null), [v, y] = r.useState(null), b = r.useCallback((e) => {
		e !== w.current && (w.current = e, _(e));
	}, []), x = r.useCallback((e) => {
		e !== T.current && (T.current = e, y(e));
	}, []), S = o || h, C = s || v, w = r.useRef(null), T = r.useRef(null), E = r.useRef(d), ee = l != null, D = ji(l), O = ji(a), k = ji(u), A = r.useCallback(() => {
		if (!w.current || !T.current) return;
		let e = {
			placement: t,
			strategy: n,
			middleware: p
		};
		O.current && (e.platform = O.current), Ei(w.current, T.current, e).then((e) => {
			let t = {
				...e,
				isPositioned: k.current !== !1
			};
			j.current && !Oi(E.current, t) && (E.current = t, g.flushSync(() => {
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
	Di(() => {
		u === !1 && E.current.isPositioned && (E.current.isPositioned = !1, f((e) => ({
			...e,
			isPositioned: !1
		})));
	}, [u]);
	let j = r.useRef(!1);
	Di(() => (j.current = !0, () => {
		j.current = !1;
	}), []), Di(() => {
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
		let t = Ai(N.floating, d.x), r = Ai(N.floating, d.y);
		return c ? {
			...e,
			transform: "translate(" + t + "px, " + r + "px)",
			...ki(N.floating) >= 1.5 && { willChange: "transform" }
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
var Ni = (e) => {
	function t(e) {
		return {}.hasOwnProperty.call(e, "current");
	}
	return {
		name: "arrow",
		options: e,
		fn(n) {
			let { element: r, padding: i } = typeof e == "function" ? e(n) : e;
			return r && t(r) ? r.current == null ? {} : wi({
				element: r.current,
				padding: i
			}).fn(n) : r ? wi({
				element: r,
				padding: i
			}).fn(n) : {};
		}
	};
}, Pi = (e, t) => {
	let n = yi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Fi = (e, t) => {
	let n = bi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Ii = (e, t) => ({
	fn: Ti(e).fn,
	options: [e, t]
}), Li = (e, t) => {
	let n = xi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Ri = (e, t) => {
	let n = Si(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, zi = (e, t) => {
	let n = Ci(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Bi = (e, t) => {
	let n = Ni(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Vi = "Arrow", Hi = r.forwardRef((e, t) => {
	let { children: n, width: r = 10, height: i = 5, ...a } = e;
	return /* @__PURE__ */ y(P.svg, {
		...a,
		ref: t,
		width: r,
		height: i,
		viewBox: "0 0 30 10",
		preserveAspectRatio: "none",
		children: e.asChild ? n : /* @__PURE__ */ y("polygon", { points: "0,0 30,0 15,10" })
	});
});
Hi.displayName = Vi;
var Ui = Hi, Wi = "Popper", [Gi, Ki] = F(Wi), [qi, Ji] = Gi(Wi), Yi = (e) => {
	let { __scopePopper: t, children: n } = e, [i, a] = r.useState(null);
	return /* @__PURE__ */ y(qi, {
		scope: t,
		anchor: i,
		onAnchorChange: a,
		children: n
	});
};
Yi.displayName = Wi;
var Xi = "PopperAnchor", Zi = r.forwardRef((e, t) => {
	let { __scopePopper: n, virtualRef: i, ...a } = e, o = Ji(Xi, n), s = r.useRef(null), c = O(t, s), l = r.useRef(null);
	return r.useEffect(() => {
		let e = l.current;
		l.current = i?.current || s.current, e !== l.current && o.onAnchorChange(l.current);
	}), i ? null : /* @__PURE__ */ y(P.div, {
		...a,
		ref: c
	});
});
Zi.displayName = Xi;
var Qi = "PopperContent", [$i, ea] = Gi(Qi), ta = r.forwardRef((e, t) => {
	let { __scopePopper: n, side: i = "bottom", sideOffset: a = 0, align: o = "center", alignOffset: s = 0, arrowPadding: c = 0, avoidCollisions: l = !0, collisionBoundary: u = [], collisionPadding: d = 0, sticky: f = "partial", hideWhenDetached: p = !1, updatePositionStrategy: m = "optimized", onPlaced: h, ...g } = e, _ = Ji(Qi, n), [v, b] = r.useState(null), x = O(t, (e) => b(e)), [S, C] = r.useState(null), w = On(S), T = w?.width ?? 0, E = w?.height ?? 0, ee = i + (o === "center" ? "" : "-" + o), D = typeof d == "number" ? d : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...d
	}, k = Array.isArray(u) ? u : [u], A = k.length > 0, j = {
		padding: D,
		boundary: k.filter(aa),
		altBoundary: A
	}, { refs: M, floatingStyles: N, placement: te, isPositioned: ne, middlewareData: re } = Mi({
		strategy: "fixed",
		placement: ee,
		whileElementsMounted: (...e) => vi(...e, { animationFrame: m === "always" }),
		elements: { reference: _.anchor },
		middleware: [
			Pi({
				mainAxis: a + E,
				alignmentAxis: s
			}),
			l && Fi({
				mainAxis: !0,
				crossAxis: !1,
				limiter: f === "partial" ? Ii() : void 0,
				...j
			}),
			l && Li({ ...j }),
			Ri({
				...j,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--radix-popper-available-width", `${n}px`), o.setProperty("--radix-popper-available-height", `${r}px`), o.setProperty("--radix-popper-anchor-width", `${i}px`), o.setProperty("--radix-popper-anchor-height", `${a}px`);
				}
			}),
			S && Bi({
				element: S,
				padding: c
			}),
			oa({
				arrowWidth: T,
				arrowHeight: E
			}),
			p && zi({
				strategy: "referenceHidden",
				...j
			})
		]
	}), [ie, ae] = sa(te), F = Se(h);
	fe(() => {
		ne && F?.();
	}, [ne, F]);
	let I = re.arrow?.x, oe = re.arrow?.y, se = re.arrow?.centerOffset !== 0, [L, ce] = r.useState();
	return fe(() => {
		v && ce(window.getComputedStyle(v).zIndex);
	}, [v]), /* @__PURE__ */ y("div", {
		ref: M.setFloating,
		"data-radix-popper-content-wrapper": "",
		style: {
			...N,
			transform: ne ? N.transform : "translate(0, -200%)",
			minWidth: "max-content",
			zIndex: L,
			"--radix-popper-transform-origin": [re.transformOrigin?.x, re.transformOrigin?.y].join(" "),
			...re.hide?.referenceHidden && {
				visibility: "hidden",
				pointerEvents: "none"
			}
		},
		dir: e.dir,
		children: /* @__PURE__ */ y($i, {
			scope: n,
			placedSide: ie,
			onArrowChange: C,
			arrowX: I,
			arrowY: oe,
			shouldHideArrow: se,
			children: /* @__PURE__ */ y(P.div, {
				"data-side": ie,
				"data-align": ae,
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
ta.displayName = Qi;
var na = "PopperArrow", ra = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
}, ia = r.forwardRef(function(e, t) {
	let { __scopePopper: n, ...r } = e, i = ea(na, n), a = ra[i.placedSide];
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
		children: /* @__PURE__ */ y(Ui, {
			...r,
			ref: t,
			style: {
				...r.style,
				display: "block"
			}
		})
	});
});
ia.displayName = na;
function aa(e) {
	return e !== null;
}
var oa = (e) => ({
	name: "transformOrigin",
	options: e,
	fn(t) {
		let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = sa(n), u = {
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
function sa(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
var ca = Yi, la = Zi, ua = ta, da = ia, fa = "Label", pa = r.forwardRef((e, t) => /* @__PURE__ */ y(P.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
pa.displayName = fa;
var ma = pa;
//#endregion
//#region node_modules/@radix-ui/number/dist/index.mjs
function ha(e, [t, n]) {
	return Math.min(n, Math.max(t, e));
}
//#endregion
//#region node_modules/@radix-ui/react-select/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function ga(e) {
	let t = /* @__PURE__ */ _a(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(ya);
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
function _a(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = xa(n), a = ba(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? D(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var va = Symbol("radix.slottable");
function ya(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === va;
}
function ba(e, t) {
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
function xa(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-select/dist/index.mjs
var Sa = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], Ca = [" ", "Enter"], wa = "Select", [Ta, Ea, Da] = de(wa), [Oa, ka] = F(wa, [Da, Ki]), Aa = Ki(), [ja, Ma] = Oa(wa), [Na, Pa] = Oa(wa), Fa = (e) => {
	let { __scopeSelect: t, children: n, open: i, defaultOpen: a, onOpenChange: o, value: s, defaultValue: c, onValueChange: l, dir: u, name: d, autoComplete: f, disabled: p, required: m, form: h } = e, g = Aa(t), [_, v] = r.useState(null), [x, S] = r.useState(null), [C, w] = r.useState(!1), T = xe(u), [E, ee] = me({
		prop: i,
		defaultProp: a ?? !1,
		onChange: o,
		caller: wa
	}), [D, O] = me({
		prop: s,
		defaultProp: c,
		onChange: l,
		caller: wa
	}), k = r.useRef(null), A = _ ? h || !!_.closest("form") : !0, [j, M] = r.useState(/* @__PURE__ */ new Set()), N = Array.from(j).map((e) => e.props.value).join(";");
	return /* @__PURE__ */ y(ca, {
		...g,
		children: /* @__PURE__ */ b(ja, {
			required: m,
			scope: t,
			trigger: _,
			onTriggerChange: v,
			valueNode: x,
			onValueNodeChange: S,
			valueNodeHasChildren: C,
			onValueNodeHasChildrenChange: w,
			contentId: ye(),
			value: D,
			onValueChange: O,
			open: E,
			onOpenChange: ee,
			dir: T,
			triggerPointerDownPosRef: k,
			disabled: p,
			children: [/* @__PURE__ */ y(Ta.Provider, {
				scope: t,
				children: /* @__PURE__ */ y(Na, {
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
			}), A ? /* @__PURE__ */ b(jo, {
				"aria-hidden": !0,
				required: m,
				tabIndex: -1,
				name: d,
				autoComplete: f,
				value: D,
				onChange: (e) => O(e.target.value),
				disabled: p,
				form: h,
				children: [D === void 0 ? /* @__PURE__ */ y("option", { value: "" }) : null, Array.from(j)]
			}, N) : null]
		})
	});
};
Fa.displayName = wa;
var Ia = "SelectTrigger", La = r.forwardRef((e, t) => {
	let { __scopeSelect: n, disabled: i = !1, ...a } = e, o = Aa(n), s = Ma(Ia, n), c = s.disabled || i, l = O(t, s.onTriggerChange), u = Ea(n), d = r.useRef("touch"), [f, p, m] = No((e) => {
		let t = u().filter((e) => !e.disabled), n = Po(t, e, t.find((e) => e.value === s.value));
		n !== void 0 && s.onValueChange(n.value);
	}), h = (e) => {
		c || (s.onOpenChange(!0), m()), e && (s.triggerPointerDownPosRef.current = {
			x: Math.round(e.pageX),
			y: Math.round(e.pageY)
		});
	};
	return /* @__PURE__ */ y(la, {
		asChild: !0,
		...o,
		children: /* @__PURE__ */ y(P.button, {
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
			"data-placeholder": Mo(s.value) ? "" : void 0,
			...a,
			ref: l,
			onClick: R(a.onClick, (e) => {
				e.currentTarget.focus(), d.current !== "mouse" && h(e);
			}),
			onPointerDown: R(a.onPointerDown, (e) => {
				d.current = e.pointerType;
				let t = e.target;
				t.hasPointerCapture(e.pointerId) && t.releasePointerCapture(e.pointerId), e.button === 0 && e.ctrlKey === !1 && e.pointerType === "mouse" && (h(e), e.preventDefault());
			}),
			onKeyDown: R(a.onKeyDown, (e) => {
				let t = f.current !== "";
				!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && p(e.key), !(t && e.key === " ") && Sa.includes(e.key) && (h(), e.preventDefault());
			})
		})
	});
});
La.displayName = Ia;
var Ra = "SelectValue", za = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: r, style: i, children: a, placeholder: o = "", ...s } = e, c = Ma(Ra, n), { onValueNodeHasChildrenChange: l } = c, u = a !== void 0, d = O(t, c.onValueNodeChange);
	return fe(() => {
		l(u);
	}, [l, u]), /* @__PURE__ */ y(P.span, {
		...s,
		ref: d,
		style: { pointerEvents: "none" },
		children: Mo(c.value) ? /* @__PURE__ */ y(v, { children: o }) : a
	});
});
za.displayName = Ra;
var Ba = "SelectIcon", Va = r.forwardRef((e, t) => {
	let { __scopeSelect: n, children: r, ...i } = e;
	return /* @__PURE__ */ y(P.span, {
		"aria-hidden": !0,
		...i,
		ref: t,
		children: r || "▼"
	});
});
Va.displayName = Ba;
var Ha = "SelectPortal", Ua = (e) => /* @__PURE__ */ y(et, {
	asChild: !0,
	...e
});
Ua.displayName = Ha;
var Wa = "SelectContent", Ga = r.forwardRef((e, t) => {
	let n = Ma(Wa, e.__scopeSelect), [i, a] = r.useState();
	if (fe(() => {
		a(new DocumentFragment());
	}, []), !n.open) {
		let t = i;
		return t ? g.createPortal(/* @__PURE__ */ y(qa, {
			scope: e.__scopeSelect,
			children: /* @__PURE__ */ y(Ta.Slot, {
				scope: e.__scopeSelect,
				children: /* @__PURE__ */ y("div", { children: e.children })
			})
		}), t) : null;
	}
	return /* @__PURE__ */ y(Za, {
		...e,
		ref: t
	});
});
Ga.displayName = Wa;
var Ka = 10, [qa, Ja] = Oa(Wa), Ya = "SelectContentImpl", Xa = /* @__PURE__ */ ga("SelectContent.RemoveScroll"), Za = r.forwardRef((e, t) => {
	let { __scopeSelect: n, position: i = "item-aligned", onCloseAutoFocus: a, onEscapeKeyDown: o, onPointerDownOutside: s, side: c, sideOffset: l, align: u, alignOffset: d, arrowPadding: f, collisionBoundary: p, collisionPadding: m, sticky: h, hideWhenDetached: g, avoidCollisions: _, ...v } = e, b = Ma(Wa, n), [x, S] = r.useState(null), [C, w] = r.useState(null), T = O(t, (e) => S(e)), [E, ee] = r.useState(null), [D, k] = r.useState(null), A = Ea(n), [j, M] = r.useState(!1), N = r.useRef(!1);
	r.useEffect(() => {
		if (x) return En(x);
	}, [x]), nt();
	let te = r.useCallback((e) => {
		let [t, ...n] = A().map((e) => e.ref.current), [r] = n.slice(-1), i = document.activeElement;
		for (let n of e) if (n === i || (n?.scrollIntoView({ block: "nearest" }), n === t && C && (C.scrollTop = 0), n === r && C && (C.scrollTop = C.scrollHeight), n?.focus(), document.activeElement !== i)) return;
	}, [A, C]), P = r.useCallback(() => te([E, x]), [
		te,
		E,
		x
	]);
	r.useEffect(() => {
		j && P();
	}, [j, P]);
	let { onOpenChange: ne, triggerPointerDownPosRef: re } = b;
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
				e.x <= 10 && e.y <= 10 ? n.preventDefault() : x.contains(n.target) || ne(!1), document.removeEventListener("pointermove", t), re.current = null;
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
		ne,
		re
	]), r.useEffect(() => {
		let e = () => ne(!1);
		return window.addEventListener("blur", e), window.addEventListener("resize", e), () => {
			window.removeEventListener("blur", e), window.removeEventListener("resize", e);
		};
	}, [ne]);
	let [ie, ae] = No((e) => {
		let t = A().filter((e) => !e.disabled), n = Po(t, e, t.find((e) => e.ref.current === document.activeElement));
		n && setTimeout(() => n.ref.current.focus());
	}), F = r.useCallback((e, t, n) => {
		let r = !N.current && !n;
		(b.value !== void 0 && b.value === t || r) && (ee(e), r && (N.current = !0));
	}, [b.value]), I = r.useCallback(() => x?.focus(), [x]), oe = r.useCallback((e, t, n) => {
		let r = !N.current && !n;
		(b.value !== void 0 && b.value === t || r) && k(e);
	}, [b.value]), se = i === "popper" ? to : $a, L = se === to ? {
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
	return /* @__PURE__ */ y(qa, {
		scope: n,
		content: x,
		viewport: C,
		onViewportChange: w,
		itemRefCallback: F,
		selectedItem: E,
		onItemLeave: I,
		itemTextRefCallback: oe,
		focusSelectedItem: P,
		selectedItemText: D,
		position: i,
		isPositioned: j,
		searchRef: ie,
		children: /* @__PURE__ */ y(_n, {
			as: Xa,
			allowPinchZoom: !0,
			children: /* @__PURE__ */ y(Ve, {
				asChild: !0,
				trapped: b.open,
				onMountAutoFocus: (e) => {
					e.preventDefault();
				},
				onUnmountAutoFocus: R(a, (e) => {
					b.trigger?.focus({ preventScroll: !0 }), e.preventDefault();
				}),
				children: /* @__PURE__ */ y(Ae, {
					asChild: !0,
					disableOutsidePointerEvents: !0,
					onEscapeKeyDown: o,
					onPointerDownOutside: s,
					onFocusOutside: (e) => e.preventDefault(),
					onDismiss: () => b.onOpenChange(!1),
					children: /* @__PURE__ */ y(se, {
						role: "listbox",
						id: b.contentId,
						"data-state": b.open ? "open" : "closed",
						dir: b.dir,
						onContextMenu: (e) => e.preventDefault(),
						...v,
						...L,
						onPlaced: () => M(!0),
						ref: T,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none",
							...v.style
						},
						onKeyDown: R(v.onKeyDown, (e) => {
							let t = e.ctrlKey || e.altKey || e.metaKey;
							if (e.key === "Tab" && e.preventDefault(), !t && e.key.length === 1 && ae(e.key), [
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
								setTimeout(() => te(t)), e.preventDefault();
							}
						})
					})
				})
			})
		})
	});
});
Za.displayName = Ya;
var Qa = "SelectItemAlignedPosition", $a = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onPlaced: i, ...a } = e, o = Ma(Wa, n), s = Ja(Wa, n), [c, l] = r.useState(null), [u, d] = r.useState(null), f = O(t, (e) => d(e)), p = Ea(n), m = r.useRef(!1), h = r.useRef(!0), { viewport: g, selectedItem: _, selectedItemText: v, focusSelectedItem: b } = s, x = r.useCallback(() => {
		if (o.trigger && o.valueNode && c && u && g && _ && v) {
			let e = o.trigger.getBoundingClientRect(), t = u.getBoundingClientRect(), n = o.valueNode.getBoundingClientRect(), r = v.getBoundingClientRect();
			if (o.dir !== "rtl") {
				let i = r.left - t.left, a = n.left - i, o = e.left - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - Ka, d = ha(a, [Ka, Math.max(Ka, u - l)]);
				c.style.minWidth = s + "px", c.style.left = d + "px";
			} else {
				let i = t.right - r.right, a = window.innerWidth - n.right - i, o = window.innerWidth - e.right - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - Ka, d = ha(a, [Ka, Math.max(Ka, u - l)]);
				c.style.minWidth = s + "px", c.style.right = d + "px";
			}
			let a = p(), s = window.innerHeight - Ka * 2, l = g.scrollHeight, d = window.getComputedStyle(u), f = parseInt(d.borderTopWidth, 10), h = parseInt(d.paddingTop, 10), y = parseInt(d.borderBottomWidth, 10), b = parseInt(d.paddingBottom, 10), x = f + h + l + b + y, S = Math.min(_.offsetHeight * 5, x), C = window.getComputedStyle(g), w = parseInt(C.paddingTop, 10), T = parseInt(C.paddingBottom, 10), E = e.top + e.height / 2 - Ka, ee = s - E, D = _.offsetHeight / 2, O = _.offsetTop + D, k = f + h + O, A = x - k;
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
			c.style.margin = `${Ka}px 0`, c.style.minHeight = S + "px", c.style.maxHeight = s + "px", i?.(), requestAnimationFrame(() => m.current = !0);
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
	fe(() => x(), [x]);
	let [S, C] = r.useState();
	return fe(() => {
		u && C(window.getComputedStyle(u).zIndex);
	}, [u]), /* @__PURE__ */ y(no, {
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
			children: /* @__PURE__ */ y(P.div, {
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
$a.displayName = Qa;
var eo = "SelectPopperPosition", to = r.forwardRef((e, t) => {
	let { __scopeSelect: n, align: r = "start", collisionPadding: i = Ka, ...a } = e;
	return /* @__PURE__ */ y(ua, {
		...Aa(n),
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
to.displayName = eo;
var [no, ro] = Oa(Wa, {}), io = "SelectViewport", ao = r.forwardRef((e, t) => {
	let { __scopeSelect: n, nonce: i, ...a } = e, o = Ja(io, n), s = ro(io, n), c = O(t, o.onViewportChange), l = r.useRef(0);
	return /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y("style", {
		dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" },
		nonce: i
	}), /* @__PURE__ */ y(Ta.Slot, {
		scope: n,
		children: /* @__PURE__ */ y(P.div, {
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
			onScroll: R(a.onScroll, (e) => {
				let t = e.currentTarget, { contentWrapper: n, shouldExpandOnScrollRef: r } = s;
				if (r?.current && n) {
					let e = Math.abs(l.current - t.scrollTop);
					if (e > 0) {
						let r = window.innerHeight - Ka * 2, i = parseFloat(n.style.minHeight), a = parseFloat(n.style.height), o = Math.max(i, a);
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
ao.displayName = io;
var oo = "SelectGroup", [so, co] = Oa(oo), lo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = ye();
	return /* @__PURE__ */ y(so, {
		scope: n,
		id: i,
		children: /* @__PURE__ */ y(P.div, {
			role: "group",
			"aria-labelledby": i,
			...r,
			ref: t
		})
	});
});
lo.displayName = oo;
var uo = "SelectLabel", fo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = co(uo, n);
	return /* @__PURE__ */ y(P.div, {
		id: i.id,
		...r,
		ref: t
	});
});
fo.displayName = uo;
var po = "SelectItem", [mo, ho] = Oa(po), go = r.forwardRef((e, t) => {
	let { __scopeSelect: n, value: i, disabled: a = !1, textValue: o, ...s } = e, c = Ma(po, n), l = Ja(po, n), u = c.value === i, [d, f] = r.useState(o ?? ""), [p, m] = r.useState(!1), h = O(t, (e) => l.itemRefCallback?.(e, i, a)), g = ye(), _ = r.useRef("touch"), v = () => {
		a || (c.onValueChange(i), c.onOpenChange(!1));
	};
	if (i === "") throw Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
	return /* @__PURE__ */ y(mo, {
		scope: n,
		value: i,
		disabled: a,
		textId: g,
		isSelected: u,
		onItemTextChange: r.useCallback((e) => {
			f((t) => t || (e?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ y(Ta.ItemSlot, {
			scope: n,
			value: i,
			disabled: a,
			textValue: d,
			children: /* @__PURE__ */ y(P.div, {
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
				onFocus: R(s.onFocus, () => m(!0)),
				onBlur: R(s.onBlur, () => m(!1)),
				onClick: R(s.onClick, () => {
					_.current !== "mouse" && v();
				}),
				onPointerUp: R(s.onPointerUp, () => {
					_.current === "mouse" && v();
				}),
				onPointerDown: R(s.onPointerDown, (e) => {
					_.current = e.pointerType;
				}),
				onPointerMove: R(s.onPointerMove, (e) => {
					_.current = e.pointerType, a ? l.onItemLeave?.() : _.current === "mouse" && e.currentTarget.focus({ preventScroll: !0 });
				}),
				onPointerLeave: R(s.onPointerLeave, (e) => {
					e.currentTarget === document.activeElement && l.onItemLeave?.();
				}),
				onKeyDown: R(s.onKeyDown, (e) => {
					l.searchRef?.current !== "" && e.key === " " || (Ca.includes(e.key) && v(), e.key === " " && e.preventDefault());
				})
			})
		})
	});
});
go.displayName = po;
var _o = "SelectItemText", vo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: i, style: a, ...o } = e, s = Ma(_o, n), c = Ja(_o, n), l = ho(_o, n), u = Pa(_o, n), [d, f] = r.useState(null), p = O(t, (e) => f(e), l.onItemTextChange, (e) => c.itemTextRefCallback?.(e, l.value, l.disabled)), m = d?.textContent, h = r.useMemo(() => /* @__PURE__ */ y("option", {
		value: l.value,
		disabled: l.disabled,
		children: m
	}, l.value), [
		l.disabled,
		l.value,
		m
	]), { onNativeOptionAdd: _, onNativeOptionRemove: x } = u;
	return fe(() => (_(h), () => x(h)), [
		_,
		x,
		h
	]), /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y(P.span, {
		id: l.textId,
		...o,
		ref: p
	}), l.isSelected && s.valueNode && !s.valueNodeHasChildren ? g.createPortal(o.children, s.valueNode) : null] });
});
vo.displayName = _o;
var yo = "SelectItemIndicator", bo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return ho(yo, n).isSelected ? /* @__PURE__ */ y(P.span, {
		"aria-hidden": !0,
		...r,
		ref: t
	}) : null;
});
bo.displayName = yo;
var xo = "SelectScrollUpButton", So = r.forwardRef((e, t) => {
	let n = Ja(xo, e.__scopeSelect), i = ro(xo, e.__scopeSelect), [a, o] = r.useState(!1), s = O(t, i.onScrollButtonChange);
	return fe(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				o(t.scrollTop > 0);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ y(To, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop -= t.offsetHeight);
		}
	}) : null;
});
So.displayName = xo;
var Co = "SelectScrollDownButton", wo = r.forwardRef((e, t) => {
	let n = Ja(Co, e.__scopeSelect), i = ro(Co, e.__scopeSelect), [a, o] = r.useState(!1), s = O(t, i.onScrollButtonChange);
	return fe(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				let e = t.scrollHeight - t.clientHeight;
				o(Math.ceil(t.scrollTop) < e);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ y(To, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop += t.offsetHeight);
		}
	}) : null;
});
wo.displayName = Co;
var To = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onAutoScroll: i, ...a } = e, o = Ja("SelectScrollButton", n), s = r.useRef(null), c = Ea(n), l = r.useCallback(() => {
		s.current !== null && (window.clearInterval(s.current), s.current = null);
	}, []);
	return r.useEffect(() => () => l(), [l]), fe(() => {
		c().find((e) => e.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
	}, [c]), /* @__PURE__ */ y(P.div, {
		"aria-hidden": !0,
		...a,
		ref: t,
		style: {
			flexShrink: 0,
			...a.style
		},
		onPointerDown: R(a.onPointerDown, () => {
			s.current === null && (s.current = window.setInterval(i, 50));
		}),
		onPointerMove: R(a.onPointerMove, () => {
			o.onItemLeave?.(), s.current === null && (s.current = window.setInterval(i, 50));
		}),
		onPointerLeave: R(a.onPointerLeave, () => {
			l();
		})
	});
}), Eo = "SelectSeparator", Do = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return /* @__PURE__ */ y(P.div, {
		"aria-hidden": !0,
		...r,
		ref: t
	});
});
Do.displayName = Eo;
var Oo = "SelectArrow", ko = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = Aa(n), a = Ma(Oo, n), o = Ja(Oo, n);
	return a.open && o.position === "popper" ? /* @__PURE__ */ y(da, {
		...i,
		...r,
		ref: t
	}) : null;
});
ko.displayName = Oo;
var Ao = "SelectBubbleInput", jo = r.forwardRef(({ __scopeSelect: e, value: t, ...n }, i) => {
	let a = r.useRef(null), o = O(i, a), s = Dn(t);
	return r.useEffect(() => {
		let e = a.current;
		if (!e) return;
		let n = window.HTMLSelectElement.prototype, r = Object.getOwnPropertyDescriptor(n, "value").set;
		if (s !== t && r) {
			let n = new Event("change", { bubbles: !0 });
			r.call(e, t), e.dispatchEvent(n);
		}
	}, [s, t]), /* @__PURE__ */ y(P.select, {
		...n,
		style: {
			...re,
			...n.style
		},
		ref: o,
		defaultValue: t
	});
});
jo.displayName = Ao;
function Mo(e) {
	return e === "" || e === void 0;
}
function No(e) {
	let t = Se(e), n = r.useRef(""), i = r.useRef(0), a = r.useCallback((e) => {
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
function Po(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = Fo(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.textValue.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
function Fo(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
var Io = Fa, Lo = La, Ro = za, zo = Va, Bo = Ua, Vo = Ga, Ho = ao, Uo = go, Wo = vo, Go = bo, Ko = So, qo = wo;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function Jo(e) {
	let t = /* @__PURE__ */ Xo(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Qo);
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
var Yo = /* @__PURE__ */ Jo("Slot");
/* @__NO_SIDE_EFFECTS__ */
function Xo(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = es(n), a = $o(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? D(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Zo = Symbol("radix.slottable");
function Qo(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Zo;
}
function $o(e, t) {
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
function es(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-switch/dist/index.mjs
var ts = "Switch", [ns, rs] = F(ts), [is, as] = ns(ts), os = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, name: i, checked: a, defaultChecked: o, required: s, disabled: c, value: l = "on", onCheckedChange: u, form: d, ...f } = e, [p, m] = r.useState(null), h = O(t, (e) => m(e)), g = r.useRef(!1), _ = p ? d || !!p.closest("form") : !0, [v, x] = me({
		prop: a,
		defaultProp: o ?? !1,
		onChange: u,
		caller: ts
	});
	return /* @__PURE__ */ b(is, {
		scope: n,
		checked: v,
		disabled: c,
		children: [/* @__PURE__ */ y(P.button, {
			type: "button",
			role: "switch",
			"aria-checked": v,
			"aria-required": s,
			"data-state": ds(v),
			"data-disabled": c ? "" : void 0,
			disabled: c,
			value: l,
			...f,
			ref: h,
			onClick: R(e.onClick, (e) => {
				x((e) => !e), _ && (g.current = e.isPropagationStopped(), g.current || e.stopPropagation());
			})
		}), _ && /* @__PURE__ */ y(us, {
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
os.displayName = ts;
var ss = "SwitchThumb", cs = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, ...r } = e, i = as(ss, n);
	return /* @__PURE__ */ y(P.span, {
		"data-state": ds(i.checked),
		"data-disabled": i.disabled ? "" : void 0,
		...r,
		ref: t
	});
});
cs.displayName = ss;
var ls = "SwitchBubbleInput", us = r.forwardRef(({ __scopeSwitch: e, control: t, checked: n, bubbles: i = !0, ...a }, o) => {
	let s = r.useRef(null), c = O(s, o), l = Dn(n), u = On(t);
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
us.displayName = ls;
function ds(e) {
	return e ? "checked" : "unchecked";
}
var fs = os, ps = cs, ms = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, hs = (e, t) => ({
	classGroupId: e,
	validator: t
}), gs = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), _s = "-", vs = [], ys = "arbitrary..", bs = (e) => {
	let t = Cs(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return Ss(e);
			let n = e.split(_s);
			return xs(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? ms(i, t) : t : i || vs;
			}
			return n[e] || vs;
		}
	};
}, xs = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = xs(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(_s) : e.slice(t).join(_s), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, Ss = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? ys + r : void 0;
})(), Cs = (e) => {
	let { theme: t, classGroups: n } = e;
	return ws(n, t);
}, ws = (e, t) => {
	let n = gs();
	for (let r in e) {
		let i = e[r];
		Ts(i, n, r, t);
	}
	return n;
}, Ts = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		Es(i, t, n, r);
	}
}, Es = (e, t, n, r) => {
	if (typeof e == "string") {
		Ds(e, t, n);
		return;
	}
	if (typeof e == "function") {
		Os(e, t, n, r);
		return;
	}
	ks(e, t, n, r);
}, Ds = (e, t, n) => {
	let r = e === "" ? t : As(t, e);
	r.classGroupId = n;
}, Os = (e, t, n, r) => {
	if (js(e)) {
		Ts(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(hs(n, e));
}, ks = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		Ts(o, As(t, a), n, r);
	}
}, As = (e, t) => {
	let n = e, r = t.split(_s), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = gs(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, js = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Ms = (e) => {
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
}, Ns = "!", Ps = ":", Fs = [], Is = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), Ls = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === Ps) {
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
		s.endsWith(Ns) ? (c = s.slice(0, -1), l = !0) : s.startsWith(Ns) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return Is(t, l, c, u);
	};
	if (t) {
		let e = t + Ps, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : Is(Fs, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, Rs = (e) => {
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
}, zs = (e) => ({
	cache: Ms(e.cacheSize),
	parseClassName: Ls(e),
	sortModifiers: Rs(e),
	...bs(e)
}), Bs = /\s+/, Vs = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(Bs), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + Ns : g, v = _ + h;
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
}, Hs = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = Us(n)) && (i && (i += " "), i += r);
	return i;
}, Us = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = Us(e[r])) && (n && (n += " "), n += t);
	return n;
}, Ws = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = zs(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = Vs(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(Hs(...e));
}, Gs = [], z = (e) => {
	let t = (t) => t[e] || Gs;
	return t.isThemeGetter = !0, t;
}, Ks = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, qs = /^\((?:(\w[\w-]*):)?(.+)\)$/i, Js = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, Ys = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Xs = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Zs = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, Qs = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, $s = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, ec = (e) => Js.test(e), B = (e) => !!e && !Number.isNaN(Number(e)), tc = (e) => !!e && Number.isInteger(Number(e)), nc = (e) => e.endsWith("%") && B(e.slice(0, -1)), rc = (e) => Ys.test(e), ic = () => !0, ac = (e) => Xs.test(e) && !Zs.test(e), oc = () => !1, sc = (e) => Qs.test(e), cc = (e) => $s.test(e), lc = (e) => !V(e) && !H(e), uc = (e) => Tc(e, kc, oc), V = (e) => Ks.test(e), dc = (e) => Tc(e, Ac, ac), fc = (e) => Tc(e, jc, B), pc = (e) => Tc(e, Nc, ic), mc = (e) => Tc(e, Mc, oc), hc = (e) => Tc(e, Dc, oc), gc = (e) => Tc(e, Oc, cc), _c = (e) => Tc(e, Pc, sc), H = (e) => qs.test(e), vc = (e) => Ec(e, Ac), yc = (e) => Ec(e, Mc), bc = (e) => Ec(e, Dc), xc = (e) => Ec(e, kc), Sc = (e) => Ec(e, Oc), Cc = (e) => Ec(e, Pc, !0), wc = (e) => Ec(e, Nc, !0), Tc = (e, t, n) => {
	let r = Ks.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, Ec = (e, t, n = !1) => {
	let r = qs.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, Dc = (e) => e === "position" || e === "percentage", Oc = (e) => e === "image" || e === "url", kc = (e) => e === "length" || e === "size" || e === "bg-size", Ac = (e) => e === "length", jc = (e) => e === "number", Mc = (e) => e === "family-name", Nc = (e) => e === "number" || e === "weight", Pc = (e) => e === "shadow", Fc = /* @__PURE__ */ Ws(() => {
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
		ec,
		"full",
		"auto",
		...w()
	], E = () => [
		tc,
		"none",
		"subgrid",
		H,
		V
	], ee = () => [
		"auto",
		{ span: [
			"full",
			tc,
			H,
			V
		] },
		tc,
		H,
		V
	], D = () => [
		tc,
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
		ec,
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
		ec,
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
		ec,
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
		H,
		V
	], ne = () => [
		...b(),
		bc,
		hc,
		{ position: [H, V] }
	], re = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], ie = () => [
		"auto",
		"cover",
		"contain",
		xc,
		uc,
		{ size: [H, V] }
	], ae = () => [
		nc,
		vc,
		dc
	], F = () => [
		"",
		"none",
		"full",
		l,
		H,
		V
	], I = () => [
		"",
		B,
		vc,
		dc
	], oe = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	], se = () => [
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
		B,
		nc,
		bc,
		hc
	], ce = () => [
		"",
		"none",
		m,
		H,
		V
	], le = () => [
		"none",
		B,
		H,
		V
	], ue = () => [
		"none",
		B,
		H,
		V
	], de = () => [
		B,
		H,
		V
	], R = () => [
		ec,
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
			blur: [rc],
			breakpoint: [rc],
			color: [ic],
			container: [rc],
			"drop-shadow": [rc],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [lc],
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
			"inset-shadow": [rc],
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
			radius: [rc],
			shadow: [rc],
			spacing: ["px", B],
			text: [rc],
			"text-shadow": [rc],
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
				ec,
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
				tc,
				"auto",
				H,
				V
			] }],
			basis: [{ basis: [
				ec,
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
				ec,
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
				tc,
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
				vc,
				dc
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				wc,
				pc
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
				nc,
				V
			] }],
			"font-family": [{ font: [
				yc,
				mc,
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
				fc
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
			"placeholder-color": [{ placeholder: P() }],
			"text-color": [{ text: P() }],
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			"text-decoration-style": [{ decoration: [...oe(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				B,
				"from-font",
				"auto",
				H,
				dc
			] }],
			"text-decoration-color": [{ decoration: P() }],
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
			"bg-position": [{ bg: ne() }],
			"bg-repeat": [{ bg: re() }],
			"bg-size": [{ bg: ie() }],
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
						tc,
						H,
						V
					],
					radial: [
						"",
						H,
						V
					],
					conic: [
						tc,
						H,
						V
					]
				},
				Sc,
				gc
			] }],
			"bg-color": [{ bg: P() }],
			"gradient-from-pos": [{ from: ae() }],
			"gradient-via-pos": [{ via: ae() }],
			"gradient-to-pos": [{ to: ae() }],
			"gradient-from": [{ from: P() }],
			"gradient-via": [{ via: P() }],
			"gradient-to": [{ to: P() }],
			rounded: [{ rounded: F() }],
			"rounded-s": [{ "rounded-s": F() }],
			"rounded-e": [{ "rounded-e": F() }],
			"rounded-t": [{ "rounded-t": F() }],
			"rounded-r": [{ "rounded-r": F() }],
			"rounded-b": [{ "rounded-b": F() }],
			"rounded-l": [{ "rounded-l": F() }],
			"rounded-ss": [{ "rounded-ss": F() }],
			"rounded-se": [{ "rounded-se": F() }],
			"rounded-ee": [{ "rounded-ee": F() }],
			"rounded-es": [{ "rounded-es": F() }],
			"rounded-tl": [{ "rounded-tl": F() }],
			"rounded-tr": [{ "rounded-tr": F() }],
			"rounded-br": [{ "rounded-br": F() }],
			"rounded-bl": [{ "rounded-bl": F() }],
			"border-w": [{ border: I() }],
			"border-w-x": [{ "border-x": I() }],
			"border-w-y": [{ "border-y": I() }],
			"border-w-s": [{ "border-s": I() }],
			"border-w-e": [{ "border-e": I() }],
			"border-w-bs": [{ "border-bs": I() }],
			"border-w-be": [{ "border-be": I() }],
			"border-w-t": [{ "border-t": I() }],
			"border-w-r": [{ "border-r": I() }],
			"border-w-b": [{ "border-b": I() }],
			"border-w-l": [{ "border-l": I() }],
			"divide-x": [{ "divide-x": I() }],
			"divide-x-reverse": ["divide-x-reverse"],
			"divide-y": [{ "divide-y": I() }],
			"divide-y-reverse": ["divide-y-reverse"],
			"border-style": [{ border: [
				...oe(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...oe(),
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
				...oe(),
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
				vc,
				dc
			] }],
			"outline-color": [{ outline: P() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				Cc,
				_c
			] }],
			"shadow-color": [{ shadow: P() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				Cc,
				_c
			] }],
			"inset-shadow-color": [{ "inset-shadow": P() }],
			"ring-w": [{ ring: I() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: P() }],
			"ring-offset-w": [{ "ring-offset": [B, dc] }],
			"ring-offset-color": [{ "ring-offset": P() }],
			"inset-ring-w": [{ "inset-ring": I() }],
			"inset-ring-color": [{ "inset-ring": P() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				Cc,
				_c
			] }],
			"text-shadow-color": [{ "text-shadow": P() }],
			opacity: [{ opacity: [
				B,
				H,
				V
			] }],
			"mix-blend": [{ "mix-blend": [
				...se(),
				"plus-darker",
				"plus-lighter"
			] }],
			"bg-blend": [{ "bg-blend": se() }],
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
			"mask-image-linear-from-pos": [{ "mask-linear-from": L() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": L() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": P() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": P() }],
			"mask-image-t-from-pos": [{ "mask-t-from": L() }],
			"mask-image-t-to-pos": [{ "mask-t-to": L() }],
			"mask-image-t-from-color": [{ "mask-t-from": P() }],
			"mask-image-t-to-color": [{ "mask-t-to": P() }],
			"mask-image-r-from-pos": [{ "mask-r-from": L() }],
			"mask-image-r-to-pos": [{ "mask-r-to": L() }],
			"mask-image-r-from-color": [{ "mask-r-from": P() }],
			"mask-image-r-to-color": [{ "mask-r-to": P() }],
			"mask-image-b-from-pos": [{ "mask-b-from": L() }],
			"mask-image-b-to-pos": [{ "mask-b-to": L() }],
			"mask-image-b-from-color": [{ "mask-b-from": P() }],
			"mask-image-b-to-color": [{ "mask-b-to": P() }],
			"mask-image-l-from-pos": [{ "mask-l-from": L() }],
			"mask-image-l-to-pos": [{ "mask-l-to": L() }],
			"mask-image-l-from-color": [{ "mask-l-from": P() }],
			"mask-image-l-to-color": [{ "mask-l-to": P() }],
			"mask-image-x-from-pos": [{ "mask-x-from": L() }],
			"mask-image-x-to-pos": [{ "mask-x-to": L() }],
			"mask-image-x-from-color": [{ "mask-x-from": P() }],
			"mask-image-x-to-color": [{ "mask-x-to": P() }],
			"mask-image-y-from-pos": [{ "mask-y-from": L() }],
			"mask-image-y-to-pos": [{ "mask-y-to": L() }],
			"mask-image-y-from-color": [{ "mask-y-from": P() }],
			"mask-image-y-to-color": [{ "mask-y-to": P() }],
			"mask-image-radial": [{ "mask-radial": [H, V] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": L() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": L() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": P() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": P() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [B] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": L() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": L() }],
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
			"mask-repeat": [{ mask: re() }],
			"mask-size": [{ mask: ie() }],
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
			blur: [{ blur: ce() }],
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
				Cc,
				_c
			] }],
			"drop-shadow-color": [{ "drop-shadow": P() }],
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
			"backdrop-blur": [{ "backdrop-blur": ce() }],
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
				H,
				V,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: x() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: R() }],
			"translate-x": [{ "translate-x": R() }],
			"translate-y": [{ "translate-y": R() }],
			"translate-z": [{ "translate-z": R() }],
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
			fill: [{ fill: ["none", ...P()] }],
			"stroke-w": [{ stroke: [
				B,
				vc,
				dc,
				fc
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
function U(...e) {
	return Fc(C(e));
}
//#endregion
//#region src/components/ui/button.tsx
var Ic = E("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
	return /* @__PURE__ */ y(r ? Yo : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: U(Ic({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/components/ui/card.tsx
var Lc = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function G({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card",
		"data-variant": t,
		className: U("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", Lc[t], e),
		...n
	});
}
function K({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-header",
		className: U("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function q({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-title",
		className: U("leading-none font-semibold", e),
		...t
	});
}
function Rc({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-description",
		className: U("text-sm text-muted-foreground", e),
		...t
	});
}
function J({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-content",
		className: U("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region src/components/ui/input.tsx
function Y({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ y("input", {
		type: t,
		"data-slot": "input",
		className: U("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function X({ className: e, ...t }) {
	return /* @__PURE__ */ y(ma, {
		"data-slot": "label",
		className: U("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/lib/queryClient.ts
var zc = null;
function Bc() {
	return zc;
}
//#endregion
//#region src/lib/authLost.ts
var Vc = ["auth", "session"], Hc = new Set([
	"rest_cookie_invalid_nonce",
	"rest_not_logged_in",
	"invalid_nonce",
	"ajax_referer_failed",
	"-1"
]);
function Uc(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (t.status === 401) return !0;
	let n = typeof t.code == "string" ? t.code : "";
	if (Hc.has(n)) return !0;
	let r = typeof t.message == "string" ? t.message.toLowerCase() : "";
	return !!(r.includes("cookie nonce is invalid") || r.includes("rest_cookie_invalid_nonce") || t.status === 403 && (n === "-1" || r === "-1" || r.includes("are you sure you want to do this")));
}
function Wc(e) {
	let t = e ?? Bc();
	t && t.setQueryData(Vc, { logged_in: !1 });
}
var Gc = new Set([
	"rest_cookie_invalid_nonce",
	"invalid_nonce",
	"ajax_referer_failed",
	"-1"
]);
function Kc(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (t.status === 401) return !1;
	let n = typeof t.code == "string" ? t.code : "";
	if (Gc.has(n)) return !0;
	let r = typeof t.message == "string" ? t.message.toLowerCase() : "";
	return r.includes("cookie nonce is invalid") || r.includes("rest_cookie_invalid_nonce") || r === "invalid nonce";
}
function qc(e) {
	Kc(e) || Uc(e) && Wc();
}
//#endregion
//#region src/lib/safeUrl.ts
function Jc(e) {
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
function Yc() {
	return window.webinoDashboard;
}
var Xc = 3e4;
function Zc(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function Qc(e) {
	let t = Yc();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (Zc(e) || Jc(e)) return e;
	throw new pl("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function $c(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function el(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "license/remote-check" ? "webino_dashboard_license_remote_check" : t === "license/diagnostics" ? "webino_dashboard_license_diagnostics" : t === "license/remote-activate" ? "webino_dashboard_license_remote_activate" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") || t.startsWith("shop/reports") || t.startsWith("shop/product-categories") || t === "comments" || t.startsWith("comments/") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : /^(payments|torobpay|snapppay|digipay|zarinpal|bale-pay|wallet|c2c)(\/|$)/.test(t) ? "webino_dashboard_payments_rest" : t.startsWith("analytics/") && t !== "analytics/hit" ? "webino_dashboard_analytics_rest" : null;
}
function tl(e, t) {
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
function nl(e, t) {
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
async function rl(e, t, n = {}) {
	let r = el(e), i = Yc();
	if (!r || !i.ajaxUrl) throw new pl("AJAX fallback unavailable", {
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
	let { signal: l, clear: u } = $c({}, t);
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
			let n = nl(t, e.status);
			throw new pl(n.message, {
				code: n.code,
				status: e.status
			});
		}
		if (!n.success) {
			let t = new pl(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
				code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
				status: e.status
			});
			throw qc(t), t;
		}
		return n.data;
	} catch (e) {
		throw e instanceof pl ? (qc(e), e) : e instanceof DOMException && e.name === "AbortError" ? new pl("Request timed out", {
			code: "request_timeout",
			status: 0
		}) : e instanceof TypeError ? new pl("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		u();
	}
}
var il = null;
function al(e) {
	let t = Yc();
	t && typeof e == "string" && e.length > 0 && (t.nonce = e);
}
function ol() {
	if (il) return il;
	let e = Yc();
	if (!e?.ajaxUrl) return Promise.resolve(!1);
	let t = new URLSearchParams();
	return t.set("action", "webino_dashboard_auth_session"), il = fetch(e.ajaxUrl, {
		method: "POST",
		credentials: "same-origin",
		headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
		body: t
	}).then((e) => e.json()).then((e) => {
		let t = !!(e?.success && e.data?.logged_in);
		return t && al(e.data?.nonce), t && typeof e.data?.nonce == "string" && e.data.nonce.length > 0;
	}).catch(() => !1).finally(() => {
		window.setTimeout(() => {
			il = null;
		}, 0);
	}), il;
}
async function Z(e, t = {}, n = Xc) {
	try {
		return await sl(e, t, n);
	} catch (r) {
		if (!Kc(r)) throw r;
		if (!await ol()) throw Wc(), r;
		let i = { ...t.headers };
		for (let e of Object.keys(i)) e.toLowerCase() === "x-wp-nonce" && delete i[e];
		return sl(e, {
			...t,
			headers: i
		}, n);
	}
}
async function sl(e, t = {}, n = Xc) {
	if (el(e) && Yc().ajaxUrl) return rl(e, n, t);
	let r = Qc(e), i = Yc(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce), !Object.keys(a).some((e) => e.toLowerCase() === "content-type") && typeof t.body == "string" && t.body.length > 0 && (a["Content-Type"] = "application/json");
	let { signal: s, clear: c } = $c(t, n);
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
			let t = tl(n, e.status);
			throw new pl(t.message, {
				code: t.code,
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i, n = new pl(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
			throw qc(n), n;
		}
		return i;
	} catch (e) {
		throw e instanceof pl ? (qc(e), e) : e instanceof DOMException && e.name === "AbortError" ? new pl("Request timed out", {
			code: "request_timeout",
			status: 0
		}) : e instanceof TypeError ? new pl("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region src/lib/marketplace-api.ts
function cl(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function ll(e) {
	"@babel/helpers - typeof";
	return ll = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, ll(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function ul(e, t) {
	if (ll(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (ll(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function dl(e) {
	var t = ul(e, "string");
	return ll(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function fl(e, t, n) {
	return (t = dl(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/lib/apiError.ts
var pl = class extends Error {
	constructor(e, t) {
		super(e), fl(this, "code", void 0), fl(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, ml = {
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
function hl(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function gl(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function _l(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(cl(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function vl(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return _l(e, n);
	if (t instanceof pl && t.code) {
		let n = ml[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = ml[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return hl(n) ? e("errors.api.requestTimeout") : gl(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function yl(e, t) {
	h.error(vl(e, t));
}
//#endregion
//#region src/hooks/useQueryErrorToast.ts
function bl(e) {
	let { t } = m(), n = f(!1);
	l(() => {
		e.isError && e.error ? n.current || (n.current = !0, h.error(vl(t, e.error))) : n.current = !1;
	}, [
		e.isError,
		e.error,
		e.fetchStatus,
		t
	]);
}
//#endregion
//#region ../Modules/shipping-module/client/components/OrderMapPanel.tsx
var xl = null;
function Sl() {
	return typeof window > "u" ? Promise.reject(/* @__PURE__ */ Error("no window")) : window.L ? Promise.resolve(window.L) : xl || (xl = new Promise((e, t) => {
		let n = "webino-leaflet-css";
		if (!document.getElementById(n)) {
			let e = document.createElement("link");
			e.id = n, e.rel = "stylesheet", e.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", document.head.appendChild(e);
		}
		let r = document.querySelector("script[data-webino-leaflet]");
		if (r) {
			r.addEventListener("load", () => {
				window.L ? e(window.L) : t(/* @__PURE__ */ Error("Leaflet missing"));
			});
			return;
		}
		let i = document.createElement("script");
		i.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", i.async = !0, i.dataset.webinoLeaflet = "1", i.onload = () => {
			if (window.L) {
				let t = window.L;
				try {
					t.Icon?.Default && (delete t.Icon.Default.prototype._getIconUrl, t.Icon.Default.mergeOptions({
						iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
						iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
						shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
					}));
				} catch {}
				e(window.L);
			} else t(/* @__PURE__ */ Error("Leaflet missing"));
		}, i.onerror = () => t(/* @__PURE__ */ Error("Leaflet failed to load")), document.head.appendChild(i);
	}), xl);
}
function Cl(e) {
	let t = e?.provider || "osm";
	return t === "neshan" && e?.neshan_api_key ? {
		url: "https://static.neshan.org/raster/{z}/{x}/{y}.png",
		attribution: "© Neshan"
	} : t === "mapp" && e?.mapp_api_key ? {
		url: `https://map.ir/raster/styles/main/{z}/{x}/{y}?x-api-key=${encodeURIComponent(e.mapp_api_key)}`,
		attribution: "© Map.ir"
	} : {
		url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
		attribution: "© OSM"
	};
}
function wl({ orderId: r }) {
	let { t: i } = m(), a = n(), o = f(null), s = f(null), c = f(null), [u, d] = p(0), [g, _] = p(0), [v, x] = p(!1), S = t({
		queryKey: ["shipping-order-map", r],
		queryFn: () => Z(`shipping/orders/${r}/map`),
		enabled: r > 0
	});
	bl(S), l(() => {
		if (S.data) {
			let e = S.data.settings?.store_location;
			d(S.data.lat || e?.lat || 35.6892), _(S.data.lng || e?.lng || 51.389);
		}
	}, [S.data]), l(() => {
		let e = !1;
		return Sl().then((t) => {
			if (e || !o.current || s.current) return;
			let n = Cl(S.data?.settings), r = t.map(o.current).setView([u || 35.6892, g || 51.389], 13);
			t.tileLayer(n.url, {
				maxZoom: 19,
				attribution: n.attribution
			}).addTo(r), r.on("click", (e) => {
				d(e.latlng.lat), _(e.latlng.lng);
			}), s.current = r, x(!0), requestAnimationFrame(() => r.invalidateSize());
		}).catch(() => {}), () => {
			e = !0, s.current && (s.current.remove(), s.current = null, c.current = null, x(!1));
		};
	}, [
		S.data?.settings?.provider,
		S.data?.settings?.neshan_api_key,
		S.data?.settings?.mapp_api_key
	]), l(() => {
		if (!v || !s.current || !window.L) return;
		let e = window.L, t = [u, g];
		!Number.isFinite(u) || !Number.isFinite(g) || u === 0 && g === 0 || (s.current.setView(t, (s.current, 13)), c.current ? c.current.setLatLng(t) : c.current = e.marker(t).addTo(s.current));
	}, [
		u,
		g,
		v
	]);
	let C = e({
		mutationFn: () => Z(`shipping/orders/${r}/map`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				lat: u,
				lng: g
			})
		}),
		onSuccess: () => {
			h.success(i("common.saved")), a.invalidateQueries({ queryKey: ["shipping-order-map", r] });
		},
		onError: (e) => yl(i, e)
	});
	return /* @__PURE__ */ b(G, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ y(K, {
			className: "pb-2",
			children: /* @__PURE__ */ y(q, {
				className: "text-base",
				children: i("shipping.orderMapTitle")
			})
		}), /* @__PURE__ */ b(J, {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ y("div", {
					ref: o,
					className: "bg-muted h-64 w-full overflow-hidden rounded-md border z-0",
					dir: "ltr"
				}),
				/* @__PURE__ */ b("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: [/* @__PURE__ */ b("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ y(X, { children: "Lat" }), /* @__PURE__ */ y(Y, {
							type: "number",
							step: "any",
							dir: "ltr",
							value: u,
							onChange: (e) => d(parseFloat(e.target.value) || 0)
						})]
					}), /* @__PURE__ */ b("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ y(X, { children: "Lng" }), /* @__PURE__ */ y(Y, {
							type: "number",
							step: "any",
							dir: "ltr",
							value: g,
							onChange: (e) => _(parseFloat(e.target.value) || 0)
						})]
					})]
				}),
				/* @__PURE__ */ y(W, {
					type: "button",
					size: "sm",
					disabled: C.isPending,
					onClick: () => void C.mutate(),
					children: i("common.save")
				})
			]
		})]
	});
}
//#endregion
//#region src/components/currency/IrtIcon.tsx
function Tl({ className: e }) {
	return /* @__PURE__ */ b("svg", {
		width: "13",
		height: "12",
		viewBox: "0 0 13 12",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		className: U("inline-block h-[0.85em] w-auto shrink-0 align-[-0.12em]", e),
		"aria-hidden": !0,
		children: [
			/* @__PURE__ */ y("path", {
				d: "M2.32002 6.11782C2.63548 5.96391 2.87208 5.81 3.10867 5.57913C3.2664 5.34826 3.42413 5.11739 3.58186 4.88652C3.66073 4.57869 3.73959 4.27087 3.73959 3.96304H11.2318C11.705 3.96304 12.0993 3.80913 12.4147 3.57826C12.6513 3.27043 12.8091 2.88565 12.8091 2.34696V0.5H11.7838V2.27C11.7838 2.65478 11.5472 2.88565 11.1529 2.88565H3.73959V2.50087C3.73959 2.11609 3.66073 1.88522 3.58186 1.57739C3.58186 1.34652 3.42413 1.11565 3.2664 0.961739C3.10867 0.807826 2.95094 0.730869 2.79321 0.653913C2.55662 0.576956 2.32002 0.5 2.16229 0.5C1.84683 0.5 1.61024 0.576956 1.37364 0.653913C1.21591 0.807826 0.979316 0.884782 0.900451 1.11565C0.742721 1.26956 0.584991 1.42348 0.584991 1.65435C0.506126 1.88522 0.427261 2.11609 0.427261 2.34696C0.427261 2.57782 0.427261 2.80869 0.506126 3.03956C0.584991 3.27043 0.663856 3.42435 0.742721 3.57826C0.900451 3.65521 1.05818 3.80913 1.29478 3.88608C1.53137 3.96304 1.76797 3.96304 2.16229 3.96304H2.79321C2.79321 4.11695 2.71435 4.27087 2.71435 4.42478C2.63548 4.57869 2.47775 4.7326 2.39889 4.88652C2.32002 4.96347 2.16229 5.04043 1.9257 5.11739C1.76797 5.19434 1.53137 5.2713 1.29478 5.2713H0.269531V6.34869H1.29478C1.6891 6.27173 2.00456 6.19478 2.32002 6.11782ZM2.16229 2.88565C1.84683 2.88565 1.6891 2.88565 1.53137 2.73174C1.45251 2.65478 1.37364 2.50087 1.37364 2.27C1.37364 2.03913 1.45251 1.80826 1.53137 1.7313C1.6891 1.65435 1.84683 1.57739 2.08343 1.57739C2.32002 1.57739 2.47775 1.65435 2.63548 1.80826C2.79321 1.96217 2.79321 2.19304 2.79321 2.50087V2.96261H2.16229V2.88565Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ y("path", {
				d: "M10.4422 0.5H7.44531V1.42348H10.4422V0.5Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ y("path", {
				d: "M12.7298 8.50383C12.6509 8.27296 12.5721 8.11905 12.4143 7.96514C12.2566 7.81122 12.0989 7.65731 11.8623 7.58035C11.7046 7.5034 11.468 7.42644 11.2314 7.42644C10.9948 7.42644 10.7582 7.5034 10.5216 7.58035C10.285 7.65731 10.1273 7.81122 9.96953 7.96514C9.8118 8.11905 9.73293 8.27296 9.65407 8.50383C9.5752 8.7347 9.5752 8.96557 9.5752 9.19644V9.42731C9.5752 9.65818 9.49634 9.73513 9.41747 9.88905C9.25974 9.966 9.10201 10.043 8.86542 10.043H8.54996C8.39223 10.043 8.2345 9.966 8.15563 9.88905C8.07677 9.73513 7.9979 9.58122 7.9979 9.42731V5.7334H6.97266V9.58122C6.97266 9.88905 6.97266 10.1199 7.05152 10.2738C7.13039 10.4277 7.20925 10.5817 7.36698 10.7356C7.52471 10.8125 7.60358 10.9664 7.84017 10.9664C7.9979 11.0434 8.15563 11.0434 8.39223 11.0434H8.94428C9.10201 11.0434 9.33861 10.9664 9.49634 10.8895C9.65407 10.8125 9.89066 10.6586 9.96953 10.4277C10.1273 10.6586 10.285 10.8125 10.5216 10.8895C10.7582 10.9664 10.9948 11.0434 11.3102 11.0434C11.7834 11.0434 12.2566 10.8895 12.4932 10.5817C12.8087 10.2738 12.9664 9.81209 12.9664 9.2734C12.8875 8.96557 12.8087 8.7347 12.7298 8.50383ZM11.2314 9.966C10.9948 9.966 10.837 9.88905 10.7582 9.81209C10.5216 9.65818 10.5216 9.50427 10.5216 9.2734C10.5216 9.04253 10.6004 8.88861 10.6793 8.7347C10.7582 8.58079 10.9948 8.50383 11.2314 8.50383C11.468 8.50383 11.7046 8.58079 11.7834 8.7347C11.8623 8.88861 11.9412 9.04253 11.9412 9.2734C11.8623 9.73513 11.6257 9.966 11.2314 9.966Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ y("path", {
				d: "M4.92256 8.50364C4.92256 8.73451 4.92256 8.88842 4.8437 9.11929C4.76484 9.2732 4.68597 9.42712 4.60711 9.58103C4.44938 9.73494 4.29165 9.8119 4.13392 9.88886C3.97619 9.96581 3.73959 10.0428 3.42413 10.0428H2.71435C2.47775 10.0428 2.24116 10.0428 2.00456 9.96581C1.84683 9.8119 1.6891 9.73494 1.61024 9.58103C1.53137 9.42712 1.37364 9.2732 1.37364 9.11929C1.29478 8.96538 1.29478 8.73451 1.29478 8.50364V7.65712H0.269531V8.5806C0.269531 9.35016 0.506126 9.96581 0.900451 10.4276C1.29478 10.8893 1.84683 11.1202 2.63548 11.1202H3.42413C3.81846 11.1202 4.13392 11.0432 4.44938 10.8893C4.76484 10.7354 5.00143 10.5815 5.23803 10.3506C5.47462 10.1197 5.63235 9.8119 5.71122 9.50407C5.79008 9.19625 5.86894 8.88842 5.86894 8.50364V5.73321L4.8437 5.65625L4.92256 8.50364Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ y("path", {
				d: "M3.73962 7.42578H2.55664V8.50317H3.73962V7.42578Z",
				fill: "currentColor"
			})
		]
	});
}
//#endregion
//#region src/lib/currency.ts
var El = /تومان|toman|irt/i;
function Dl(e) {
	return e.replace(/&nbsp;/gi, " ").replace(/&#160;/g, " ").replace(/&#x0*a0;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, "\"").replace(/&#(\d+);/g, (e, t) => {
		let n = Number(t);
		return Number.isFinite(n) ? String.fromCharCode(n) : e;
	}).replace(/\u00a0/g, " ");
}
function Ol(e, t) {
	let n = (e ?? "").trim(), r = (t ?? "").trim();
	if (!n && !r) return !1;
	let i = n.toUpperCase();
	return !!(i === "IRT" || i === "TOMAN" || i === "IRHT" || El.test(n) || El.test(r));
}
//#endregion
//#region src/lib/digits.ts
var kl = "۰۱۲۳۴۵۶۷۸۹", Al = {
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
function jl(e) {
	return e.toLowerCase().startsWith("fa");
}
function Ml(e) {
	return e.replace(/\d/g, (e) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(e, 10)] ?? e);
}
function Nl(e) {
	return e.replace(/[۰-۹٠-٩]/g, (e) => Al[e] ?? e);
}
function Pl(e, t) {
	return jl(t) ? Ml(e) : e;
}
//#endregion
//#region src/lib/formatNumber.ts
function Fl(e, t) {
	let n = Number.isFinite(e) ? e : 0, r = jl(t) ? "fa-IR" : "en-US", i = new Intl.NumberFormat(r, { maximumFractionDigits: 2 }).format(n);
	return jl(t) ? Ml(i) : i;
}
//#endregion
//#region src/components/currency/MoneyDisplay.tsx
var Il = /تومان|toman|irt/gi;
function Ll(e) {
	if (typeof e == "number") return Number.isFinite(e) ? e : 0;
	let t = Nl(Dl(e)).replace(Il, "").replace(/[^\d.-]/g, ""), n = parseFloat(t);
	return Number.isFinite(n) ? n : NaN;
}
function Rl({ amount: e, currency: t, currencySymbol: n, locale: r, className: i, amountClassName: a, prefix: o }) {
	let s = Ll(e), c = Number.isFinite(s) ? Fl(s, r) : Pl(Nl(Dl(String(e))).replace(Il, "").trim(), r), l = Ol(t, n) || !t?.trim() && !n?.trim();
	return /* @__PURE__ */ b("span", {
		className: U("inline-flex items-baseline gap-1", i),
		dir: "ltr",
		children: [
			o,
			l ? /* @__PURE__ */ y(Tl, {}) : null,
			/* @__PURE__ */ y("span", {
				className: a,
				children: c
			}),
			!l && t ? /* @__PURE__ */ y("span", {
				className: "text-muted-foreground text-[0.85em]",
				children: t
			}) : null
		]
	});
}
//#endregion
//#region ../Modules/shipping-module/client/components/OrderPackagingPanel.tsx
function zl({ orderId: r, currency: i = "IRT", locale: a = "fa-IR" }) {
	let { t: o } = m(), s = n(), c = t({
		queryKey: ["shipping-order-packaging", r],
		queryFn: () => Z(`shipping/orders/${r}/packaging`),
		enabled: r > 0
	});
	bl(c);
	let l = e({
		mutationFn: () => Z(`shipping/orders/${r}/packaging`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}"
		}),
		onSuccess: (e) => {
			s.setQueryData(["shipping-order-packaging", r], (t) => ({
				...t,
				...e,
				professional_fee: t?.professional_fee ?? e.professional_fee
			})), h.success(o("shipping.recalcOk"));
		},
		onError: (e) => yl(o, e)
	}), u = c.data?.plan, d = c.data?.professional_fee;
	return /* @__PURE__ */ b(G, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ b(K, {
			className: "flex flex-row items-center justify-between gap-2 pb-2",
			children: [/* @__PURE__ */ y(q, {
				className: "text-base",
				children: o("shipping.orderPackagingTitle")
			}), /* @__PURE__ */ y(W, {
				type: "button",
				size: "sm",
				variant: "secondary",
				disabled: l.isPending,
				onClick: () => void l.mutateAsync(),
				children: o("shipping.recalcPlan")
			})]
		}), /* @__PURE__ */ b(J, {
			className: "space-y-2 text-sm",
			children: [c.isPending ? /* @__PURE__ */ y("p", {
				className: "text-muted-foreground",
				children: o("common.loading")
			}) : !u || !u.boxes?.length ? /* @__PURE__ */ y("p", {
				className: "text-muted-foreground",
				children: o("shipping.noPackagingPlan")
			}) : /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y("ul", {
				className: "space-y-1",
				children: u.boxes.map((e, t) => /* @__PURE__ */ b("li", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ b("span", { children: [
						o("shipping.sizeN", { n: e.size }),
						/* @__PURE__ */ b("span", {
							className: "text-muted-foreground ms-2 text-xs",
							dir: "ltr",
							children: [
								e.length,
								"×",
								e.width,
								"×",
								e.height
							]
						}),
						e.oversized ? /* @__PURE__ */ y("span", {
							className: "text-amber-700 ms-2 text-xs dark:text-amber-300",
							children: o("shipping.oversized")
						}) : null
					] }), /* @__PURE__ */ y(Rl, {
						amount: e.price,
						currency: i,
						locale: a
					})]
				}, `${e.size}-${t}`))
			}), /* @__PURE__ */ b("div", {
				className: "flex items-center justify-between border-t border-border pt-2 font-medium",
				children: [/* @__PURE__ */ b("span", { children: [o("shipping.boxCount", { count: u.box_count }), u.oversized ? ` · ${o("shipping.oversized")}` : ""] }), /* @__PURE__ */ y(Rl, {
					amount: u.total_packaging_cost,
					currency: i,
					locale: a
				})]
			})] }), d?.selected ? /* @__PURE__ */ b("div", {
				className: "flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2",
				children: [/* @__PURE__ */ y("span", { children: d.label || o("shipping.professionalFeeOrderSelected") }), /* @__PURE__ */ y(Rl, {
					amount: d.amount || 0,
					currency: i,
					locale: a
				})]
			}) : null]
		})]
	});
}
//#endregion
//#region src/components/PageShell.tsx
function Bl({ title: e, description: t, eyebrow: n, children: r }) {
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
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var Vl = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), Hl = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Ul = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), Wl = (e) => {
	let t = Ul(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, Gl = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, Kl = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, ql = a({}), Jl = () => c(ql), Yl = s(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: a, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = Jl() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return o("svg", {
		ref: l,
		...Gl,
		width: t ?? u ?? Gl.width,
		height: t ?? u ?? Gl.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: Vl("lucide", m, i),
		...!a && !Kl(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => o(e, t)), ...Array.isArray(a) ? a : [a]]);
}), Xl = (e, t) => {
	let n = s(({ className: n, ...r }, i) => o(Yl, {
		ref: i,
		iconNode: t,
		className: Vl(`lucide-${Hl(Wl(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = Wl(e), n;
}, Zl = Xl("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]), Ql = Xl("chevron-down", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]), $l = Xl("chevron-up", [["path", {
	d: "m18 15-6-6-6 6",
	key: "153udz"
}]]), eu = Xl("plus", [["path", {
	d: "M5 12h14",
	key: "1ays0h"
}], ["path", {
	d: "M12 5v14",
	key: "s699le"
}]]), tu = Xl("trash-2", [
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
]), nu = Xl("truck", [
	["path", {
		d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",
		key: "wrbu53"
	}],
	["path", {
		d: "M15 18H9",
		key: "1lyqi6"
	}],
	["path", {
		d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",
		key: "lysw3i"
	}],
	["circle", {
		cx: "17",
		cy: "18",
		r: "2",
		key: "332jqn"
	}],
	["circle", {
		cx: "7",
		cy: "18",
		r: "2",
		key: "19iecd"
	}]
]), ru = Xl("x", [["path", {
	d: "M18 6 6 18",
	key: "1bl5f8"
}], ["path", {
	d: "m6 6 12 12",
	key: "d8bk6v"
}]]);
//#endregion
//#region src/hooks/use-text-direction.ts
function iu() {
	let { i18n: e } = m();
	return e.dir() === "rtl" ? "rtl" : "ltr";
}
//#endregion
//#region src/components/ui/select.tsx
function au({ ...e }) {
	return /* @__PURE__ */ y(Io, {
		"data-slot": "select",
		...e
	});
}
function ou({ ...e }) {
	return /* @__PURE__ */ y(Ro, {
		"data-slot": "select-value",
		...e
	});
}
function su({ className: e, size: t = "default", children: n, ...r }) {
	return /* @__PURE__ */ b(Lo, {
		"data-slot": "select-trigger",
		"data-size": t,
		dir: iu(),
		className: U("flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap text-start shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", e),
		...r,
		children: [n, /* @__PURE__ */ y(zo, {
			asChild: !0,
			children: /* @__PURE__ */ y(Ql, { className: "size-4 opacity-50" })
		})]
	});
}
function cu({ className: e, children: t, position: n = "popper", align: r = "start", ...i }) {
	return /* @__PURE__ */ y(hn, {
		allowBodyScroll: !0,
		children: /* @__PURE__ */ y(Bo, { children: /* @__PURE__ */ b(Vo, {
			"data-slot": "select-content",
			dir: iu(),
			className: U("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-start text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", e),
			position: n,
			align: r,
			...i,
			children: [
				/* @__PURE__ */ y(lu, {}),
				/* @__PURE__ */ y(Ho, {
					className: U("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
					children: t
				}),
				/* @__PURE__ */ y(uu, {})
			]
		}) })
	});
}
function Q({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ b(Uo, {
		"data-slot": "select-item",
		className: U("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pe-8 ps-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", e),
		...n,
		children: [/* @__PURE__ */ y("span", {
			"data-slot": "select-item-indicator",
			className: "absolute end-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ y(Go, { children: /* @__PURE__ */ y(Zl, { className: "size-4" }) })
		}), /* @__PURE__ */ y(Wo, { children: t })]
	});
}
function lu({ className: e, ...t }) {
	return /* @__PURE__ */ y(Ko, {
		"data-slot": "select-scroll-up-button",
		className: U("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ y($l, { className: "size-4" })
	});
}
function uu({ className: e, ...t }) {
	return /* @__PURE__ */ y(qo, {
		"data-slot": "select-scroll-down-button",
		className: U("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ y(Ql, { className: "size-4" })
	});
}
//#endregion
//#region src/components/ui/switch.tsx
function $({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ y(fs, {
		"data-slot": "switch",
		"data-size": t,
		className: U("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", e),
		...n,
		dir: "ltr",
		children: /* @__PURE__ */ y(ps, {
			"data-slot": "switch-thumb",
			className: U("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/CitiesSettingsPage.tsx
function du() {
	let { t: r } = m(), i = n(), [a, o] = p(0), [s, c] = p(0), [u, f] = p(""), [g, _] = p(""), [x, S] = p({}), [C, w] = p(null), [T, E] = p(!1), [ee, D] = p(!1), O = t({
		queryKey: ["shipping-cities-tree"],
		queryFn: () => Z("shipping/cities/tree", {}, 6e4)
	});
	bl(O), l(() => {
		O.data && typeof O.data.enabled == "boolean" && D(O.data.enabled);
	}, [O.data]);
	let k = e({
		mutationFn: (e) => Z("shipping/cities/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ settings: { enabled: e } })
		}),
		onSuccess: (e) => {
			e.settings && D(!!e.settings.enabled), h.success(r("common.saved")), i.invalidateQueries({ queryKey: ["shipping-cities-tree"] }), i.invalidateQueries({ queryKey: ["shipping-hub-status"] }), i.invalidateQueries({ queryKey: ["shop-locations-states"] });
		},
		onError: (e) => yl(r, e)
	}), A = async () => {
		if (!T) {
			E(!0);
			try {
				let e = O.data?.next_key ?? null, t = 0;
				for (; t < 40;) {
					++t;
					let n = await Z("shipping/cities/seed-batch", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(e ? { state_key: e } : {})
					}, 6e4);
					if (w({
						done: n.states_done,
						total: n.states_total
					}), n.installed || !n.next_key) {
						n.ok || n.installed ? h.success(n.message || r("shipping.citiesInstalled")) : h.error(n.message);
						break;
					}
					if (!n.ok) {
						h.error(n.message);
						break;
					}
					e = n.next_key;
				}
				await i.invalidateQueries({ queryKey: ["shipping-cities-tree"] });
			} catch (e) {
				yl(r, e);
			} finally {
				E(!1);
			}
		}
	};
	l(() => {
		!O.data || T || (O.data.needs_seed || !O.data.installed && (O.data.states_total ?? 0) > 0) && A();
	}, [
		O.data?.needs_seed,
		O.data?.installed,
		O.data?.states_total
	]);
	let j = t({
		queryKey: ["shipping-cities-bulk", a],
		queryFn: () => Z(`shipping/cities/bulk/${a}`),
		enabled: a > 0
	});
	bl(j);
	let M = t({
		queryKey: [
			"shipping-cities-search",
			g,
			a
		],
		queryFn: () => Z(`shipping/cities/search?q=${encodeURIComponent(g)}&state=${a || 0}`),
		enabled: g.trim().length >= 2
	});
	l(() => {
		if (!j.data?.rows) return;
		let e = {};
		for (let t of j.data.rows) {
			e[String(t.id)] = {};
			for (let [n, r] of Object.entries(t.prices || {})) e[String(t.id)][n] = r == null ? "" : String(r);
		}
		S(e);
	}, [j.data]), l(() => {
		c(0), f("");
	}, [a]);
	let N = d(() => (j.data?.rows || []).filter((e) => !e.name.startsWith("—")), [j.data]), te = d(() => {
		if (!s || !j.data?.rows) return [];
		let e = j.data.rows, t = e.findIndex((e) => e.id === s);
		if (t < 0) return [];
		let n = [];
		for (let r = t + 1; r < e.length && e[r].name.startsWith("—"); r++) n.push(e[r]);
		return n;
	}, [j.data, s]), P = e({
		mutationFn: async () => (await A(), {
			ok: !0,
			message: r("shipping.citiesInstalled")
		}),
		onError: (e) => yl(r, e)
	}), ne = e({
		mutationFn: () => Z(`shipping/cities/bulk/${a}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ prices: x })
		}),
		onSuccess: () => {
			h.success(r("common.saved")), i.invalidateQueries({ queryKey: ["shipping-cities-bulk", a] });
		},
		onError: (e) => yl(r, e)
	}), re = e({
		mutationFn: () => {
			let e = N.map((e) => e.id);
			return Z("shipping/cities/create-zones", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ city_ids: e.slice(0, 20) })
			});
		},
		onSuccess: () => h.success(r("shipping.zonesCreated")),
		onError: (e) => yl(r, e)
	}), ie = e({
		mutationFn: () => Z("shipping/cities/district", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				city_id: s,
				name: u
			})
		}),
		onSuccess: (e) => {
			e.ok ? (h.success(e.message), f(""), i.invalidateQueries({ queryKey: ["shipping-cities-bulk", a] })) : h.error(e.message);
		},
		onError: (e) => yl(r, e)
	}), ae = e({
		mutationFn: (e) => Z(`shipping/cities/district/${e}`, { method: "DELETE" }),
		onSuccess: (e) => {
			e.ok ? (h.success(e.message), i.invalidateQueries({ queryKey: ["shipping-cities-bulk", a] })) : h.error(e.message);
		},
		onError: (e) => yl(r, e)
	}), F = O.data?.states ?? [], I = j.data?.columns ?? [], oe = j.data?.rows ?? [], se = C && C.total > 0 ? r("shipping.citiesSeedProgress", {
		done: C.done,
		total: C.total
	}) : O.data?.states_total ? r("shipping.citiesSeedProgress", {
		done: O.data.states_done ?? 0,
		total: O.data.states_total
	}) : null;
	return /* @__PURE__ */ b(Bl, {
		title: r("shipping.citiesTitle"),
		description: r("shipping.citiesHint"),
		children: [
			/* @__PURE__ */ y(G, {
				className: "mb-4 border-primary/20 shadow-sm",
				children: /* @__PURE__ */ y(J, {
					className: "pt-4",
					children: /* @__PURE__ */ b("label", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y("div", {
							className: "font-medium",
							children: r("shipping.citiesMasterEnable")
						}), /* @__PURE__ */ y("p", {
							className: "text-muted-foreground text-xs",
							children: r("shipping.citiesMasterHint")
						})] }), /* @__PURE__ */ y($, {
							checked: ee,
							disabled: k.isPending,
							onCheckedChange: (e) => {
								D(e), k.mutate(e);
							}
						})]
					})
				})
			}),
			/* @__PURE__ */ b("div", {
				className: "mb-4 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ y(W, {
					type: "button",
					variant: "secondary",
					disabled: T || P.isPending,
					onClick: () => void A(),
					children: r("shipping.reinstallCities")
				}), a > 0 && /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y(W, {
					type: "button",
					disabled: ne.isPending,
					onClick: () => void ne.mutate(),
					children: r("common.save")
				}), /* @__PURE__ */ y(W, {
					type: "button",
					variant: "outline",
					disabled: re.isPending,
					onClick: () => void re.mutate(),
					children: r("shipping.createZonesFromCities")
				})] })]
			}),
			/* @__PURE__ */ b(G, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ b(K, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(q, {
						className: "text-base",
						children: r("shipping.pickState")
					}), /* @__PURE__ */ y(Rc, { children: T || O.isFetching ? se || r("shipping.citiesLoading") : O.data?.installed ? r("shipping.citiesInstalled") : r("shipping.citiesSeeding") })]
				}), /* @__PURE__ */ b(J, {
					className: "grid gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ b("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ y(X, { children: r("tapin.province") }), /* @__PURE__ */ b(au, {
							value: a ? String(a) : void 0,
							onValueChange: (e) => o(parseInt(e, 10) || 0),
							children: [/* @__PURE__ */ y(su, { children: /* @__PURE__ */ y(ou, { placeholder: r("tapin.pickProvince") }) }), /* @__PURE__ */ y(cu, { children: F.map((e) => /* @__PURE__ */ y(Q, {
								value: String(e.id),
								children: e.name
							}, e.id)) })]
						})]
					}), /* @__PURE__ */ b("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ y(X, { children: r("shipping.citySearch") }),
							/* @__PURE__ */ y(Y, {
								value: g,
								onChange: (e) => _(e.target.value),
								placeholder: r("shipping.citySearchPlaceholder")
							}),
							M.data?.items?.length ? /* @__PURE__ */ y("ul", {
								className: "border-border max-h-40 overflow-auto rounded-md border text-sm",
								children: M.data.items.map((e) => /* @__PURE__ */ y("li", { children: /* @__PURE__ */ b("button", {
									type: "button",
									className: "hover:bg-muted w-full px-2 py-1.5 text-start",
									onClick: () => {
										if (e.type === "state") {
											o(e.id), c(0);
											return;
										}
										if (e.type === "city" || e.type === "district") {
											let t = e.state_id || (e.type === "city" ? e.parent : 0);
											t > 0 && t !== a && o(t), e.type === "city" && setTimeout(() => c(e.id), 0), h.message(`${e.name} (${e.type})`);
										}
									},
									children: [
										e.name,
										" ",
										/* @__PURE__ */ b("span", {
											className: "text-muted-foreground text-xs",
											children: [
												"(",
												e.type,
												")"
											]
										})
									]
								}) }, e.id))
							}) : null
						]
					})]
				})]
			}),
			a > 0 && /* @__PURE__ */ b(G, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ b(K, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(q, {
						className: "text-base",
						children: r("shipping.districtsTitle")
					}), /* @__PURE__ */ y(Rc, { children: r("shipping.districtsHint") })]
				}), /* @__PURE__ */ b(J, {
					className: "space-y-3",
					children: [/* @__PURE__ */ b("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(X, { children: r("tapin.city") }), /* @__PURE__ */ b(au, {
								value: s ? String(s) : void 0,
								onValueChange: (e) => c(parseInt(e, 10) || 0),
								children: [/* @__PURE__ */ y(su, { children: /* @__PURE__ */ y(ou, { placeholder: r("tapin.pickCity") }) }), /* @__PURE__ */ y(cu, { children: N.map((e) => /* @__PURE__ */ y(Q, {
									value: String(e.id),
									children: e.name
								}, e.id)) })]
							})]
						}), /* @__PURE__ */ b("div", {
							className: "flex items-end gap-2",
							children: [/* @__PURE__ */ b("div", {
								className: "flex-1 space-y-1.5",
								children: [/* @__PURE__ */ y(X, { children: r("shipping.districtName") }), /* @__PURE__ */ y(Y, {
									value: u,
									onChange: (e) => f(e.target.value),
									disabled: !s
								})]
							}), /* @__PURE__ */ y(W, {
								type: "button",
								disabled: !s || !u.trim() || ie.isPending,
								onClick: () => void ie.mutate(),
								children: r("shipping.addDistrict")
							})]
						})]
					}), s > 0 && /* @__PURE__ */ y("ul", {
						className: "divide-border divide-y text-sm",
						children: te.length === 0 ? /* @__PURE__ */ y("li", {
							className: "text-muted-foreground py-2",
							children: r("shipping.noDistricts")
						}) : te.map((e) => /* @__PURE__ */ b("li", {
							className: "flex items-center justify-between gap-2 py-2",
							children: [/* @__PURE__ */ y("span", { children: e.name.replace(/^—\s*/, "") }), /* @__PURE__ */ y(W, {
								type: "button",
								size: "sm",
								variant: "ghost",
								disabled: ae.isPending,
								onClick: () => void ae.mutate(e.id),
								children: r("common.delete")
							})]
						}, e.id))
					})]
				})]
			}),
			a > 0 && /* @__PURE__ */ b(G, {
				className: "shadow-sm",
				children: [/* @__PURE__ */ y(K, {
					className: "pb-2",
					children: /* @__PURE__ */ y(q, {
						className: "text-base",
						children: r("shipping.bulkPrices")
					})
				}), /* @__PURE__ */ y(J, {
					className: "overflow-x-auto",
					children: j.isPending ? /* @__PURE__ */ y("p", {
						className: "text-muted-foreground text-sm",
						children: r("common.loading")
					}) : /* @__PURE__ */ b("table", {
						className: "w-full min-w-[640px] border-collapse text-sm",
						children: [/* @__PURE__ */ y("thead", { children: /* @__PURE__ */ b("tr", {
							className: "border-b text-start",
							children: [/* @__PURE__ */ y("th", {
								className: "p-2 text-start",
								children: r("tapin.city")
							}), I.map((e) => /* @__PURE__ */ b("th", {
								className: "p-2 text-start whitespace-nowrap",
								children: [e.label, e.method_id.includes("tipax") ? ` / ${r("shipping.tipaxOn")}` : ""]
							}, e.key))]
						}) }), /* @__PURE__ */ y("tbody", { children: oe.map((e) => /* @__PURE__ */ b("tr", {
							className: "border-b border-border/60",
							children: [/* @__PURE__ */ y("td", {
								className: "p-2 whitespace-nowrap",
								children: e.name
							}), I.map((t) => /* @__PURE__ */ b("td", {
								className: "p-2 align-top",
								children: [/* @__PURE__ */ y(Y, {
									className: "mb-1 h-8",
									dir: "ltr",
									value: x[String(e.id)]?.[t.key] ?? "",
									onChange: (n) => S((r) => ({
										...r,
										[String(e.id)]: {
											...r[String(e.id)] || {},
											[t.key]: n.target.value
										}
									}))
								}), t.method_id.includes("tipax") && /* @__PURE__ */ b("label", {
									className: "text-muted-foreground flex items-center gap-1 text-xs",
									children: [/* @__PURE__ */ y("input", {
										type: "checkbox",
										checked: x[String(e.id)]?.[`${t.key}_on`] === "1",
										onChange: (n) => S((r) => ({
											...r,
											[String(e.id)]: {
												...r[String(e.id)] || {},
												[`${t.key}_on`]: n.target.checked ? "1" : ""
											}
										}))
									}), r("shipping.tipaxOn")]
								})]
							}, t.key))]
						}, e.id)) })]
					})
				})]
			})
		]
	});
}
//#endregion
//#region src/components/ui/badge.tsx
var fu = E("inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3", {
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
function pu({ className: e, variant: t = "default", asChild: n = !1, ...r }) {
	return /* @__PURE__ */ y(n ? Yo : "span", {
		"data-slot": "badge",
		"data-variant": t,
		className: U(fu({ variant: t }), e),
		...r
	});
}
//#endregion
//#region src/components/coupons/ProductMultiSelect.tsx
function mu({ id: e, label: n, value: r, onChange: i }) {
	let { t: a } = m(), [o, s] = p(""), [c, u] = p(""), [d, f] = p({});
	l(() => {
		let e = window.setTimeout(() => u(o), 300);
		return () => window.clearTimeout(e);
	}, [o]);
	let h = t({
		queryKey: [
			"products",
			"search",
			c
		],
		queryFn: () => Z(`shop/products?page=1&per_page=20${c.trim() ? `&search=${encodeURIComponent(c.trim())}` : ""}`),
		enabled: c.trim().length >= 1
	});
	function g(e) {
		r.includes(e.id) || (f((t) => ({
			...t,
			[e.id]: e.name
		})), i([...r, e.id]), s(""), u(""));
	}
	function _(e) {
		i(r.filter((t) => t !== e));
	}
	return /* @__PURE__ */ b("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ y(X, {
				htmlFor: e,
				children: n
			}),
			/* @__PURE__ */ y(Y, {
				id: e,
				value: o,
				onChange: (e) => s(e.target.value),
				placeholder: a("coupons.productSearchPlaceholder")
			}),
			h.isFetching && c ? /* @__PURE__ */ y("p", {
				className: "text-muted-foreground text-xs",
				children: a("common.loading")
			}) : null,
			h.data?.items && c ? /* @__PURE__ */ y("div", {
				className: "max-h-32 overflow-y-auto rounded-md border border-border p-1 text-sm",
				children: h.data.items.length === 0 ? /* @__PURE__ */ y("p", {
					className: "text-muted-foreground p-2",
					children: a("coupons.noProductsFound")
				}) : h.data.items.map((e) => /* @__PURE__ */ b("button", {
					type: "button",
					className: "hover:bg-muted block w-full rounded px-2 py-1.5 text-start",
					onClick: () => g(e),
					children: [
						e.name,
						" ",
						/* @__PURE__ */ b("span", {
							className: "text-muted-foreground",
							children: ["#", e.id]
						})
					]
				}, e.id))
			}) : null,
			r.length > 0 ? /* @__PURE__ */ y("div", {
				className: "flex flex-wrap gap-1",
				children: r.map((e) => /* @__PURE__ */ b(pu, {
					variant: "secondary",
					className: "gap-1 pe-1",
					children: [d[e] ? `${d[e]} (#${e})` : `#${e}`, /* @__PURE__ */ b(W, {
						type: "button",
						size: "icon",
						variant: "ghost",
						className: "size-5",
						onClick: () => _(e),
						children: [/* @__PURE__ */ y(ru, { className: "size-3" }), /* @__PURE__ */ y("span", {
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
//#region src/components/ui/formatted-number-input.tsx
var hu = Object.fromEntries([...kl].map((e, t) => [e, String(t)]));
function gu(e) {
	let t = "", n = !1;
	for (let r of e) {
		if (hu[r] != null) {
			t += hu[r];
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
function _u(e, t) {
	if (!e) return "";
	let n = e.startsWith("-"), r = n ? e.slice(1) : e, i = r.endsWith("."), [a, o] = r.split("."), s = Number(a || "0");
	if (!Number.isFinite(s) && a !== "") return e;
	let c = jl(t) ? "fa-IR" : "en-US", l = new Intl.NumberFormat(c, { maximumFractionDigits: 0 }).format(a === "" ? 0 : s);
	if (o != null || i) {
		let e = jl(t) ? "٫" : ".", n = o ?? "";
		l += e + (jl(t) ? n.replace(/\d/g, (e) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(e, 10)] ?? e) : n);
	}
	return n ? `-${l}` : l;
}
function vu({ value: e, onChange: t, className: n, onBlur: r, ...i }) {
	let { i18n: a } = m(), o = a.language, s = d(() => _u(e, o), [e, o]);
	return /* @__PURE__ */ y(Y, {
		...i,
		inputMode: "decimal",
		className: U(n),
		value: s,
		onChange: (e) => t(gu(e.target.value)),
		onBlur: r
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/ItemCostSettingsPage.tsx
var yu = () => ({
	id: `set_${Date.now()}_${Math.floor(Math.random() * 1e4)}`,
	name: "",
	product_ids: [],
	cost: ""
}), bu = () => ({
	enabled: !1,
	mode: "max",
	multiply_by_qty: !0,
	default_cost_once: !1,
	virtual_skip: !0,
	category_children: !0,
	skip_with_free_coupon: !1,
	skip_free_methods: !0,
	skip_local_pickup: !0,
	default_cost: "",
	min_free_amount: "",
	product_costs: {},
	set_costs: [],
	category_costs: {},
	brand_costs: {},
	rule_qty_modes: {
		products: {},
		sets: {},
		categories: {},
		brands: {}
	},
	gateway_costs: []
});
function xu(e) {
	let t = {
		products: {},
		sets: {},
		categories: {},
		brands: {}
	};
	if (!e || typeof e != "object") return t;
	let n = e;
	for (let e of [
		"products",
		"sets",
		"categories",
		"brands"
	]) {
		let r = n[e];
		if (r && typeof r == "object" && !Array.isArray(r)) for (let [n, i] of Object.entries(r)) (i === "per_qty" || i === "once") && (t[e][n] = i);
	}
	return t;
}
function Su(e) {
	if (e == null || e === "") return "";
	let t = Number(e);
	return Number.isFinite(t) && t > 0 ? String(t) : t === 0 ? "0" : "";
}
function Cu(e) {
	let t = {};
	if (e && typeof e == "object") for (let [n, r] of Object.entries(e)) {
		let e = Number(r);
		/^\d+$/.test(n) && Number.isFinite(e) && (t[n] = String(e));
	}
	return t;
}
function wu(e) {
	let t = Number(gu(e || "") || "0");
	return Number.isFinite(t) && t >= 0 ? t : 0;
}
function Tu({ id: e, items: t, loading: n, placeholder: r, onAdd: i }) {
	let [a, o] = p(""), s = d(() => {
		let e = a.trim().toLowerCase();
		return e ? t.filter((t) => t.name.toLowerCase().includes(e)).slice(0, 30) : [];
	}, [t, a]);
	return /* @__PURE__ */ b("div", {
		className: "relative",
		children: [/* @__PURE__ */ y(Y, {
			id: e,
			value: a,
			placeholder: r,
			onChange: (e) => o(e.target.value),
			autoComplete: "off",
			"aria-label": r
		}), a.trim() ? /* @__PURE__ */ y("div", {
			className: "absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover shadow-md",
			children: n ? /* @__PURE__ */ y("p", {
				className: "text-muted-foreground px-3 py-2 text-xs",
				children: "…"
			}) : s.length === 0 ? /* @__PURE__ */ y("p", {
				className: "text-muted-foreground px-3 py-2 text-xs",
				children: "—"
			}) : s.map((e) => /* @__PURE__ */ y("button", {
				type: "button",
				className: "hover:bg-muted block w-full px-3 py-2 text-start text-sm",
				onClick: () => {
					i(e), o("");
				},
				children: e.name
			}, e.id))
		}) : null]
	});
}
function Eu({ onAdd: e }) {
	let { t: n } = m(), [r, i] = p(""), a = r.trim(), o = t({
		queryKey: ["item-cost-products", a],
		queryFn: () => Z(`shop/products?page=1&per_page=20&search=${encodeURIComponent(a)}`),
		enabled: a.length >= 1,
		staleTime: 3e4
	}), s = o.data?.items ?? [];
	return /* @__PURE__ */ b("div", {
		className: "relative",
		children: [/* @__PURE__ */ y(Y, {
			value: r,
			onChange: (e) => i(e.target.value),
			placeholder: n("shipping.itemCost.productSearchPlaceholder"),
			autoComplete: "off",
			"aria-label": n("shipping.itemCost.productSearchPlaceholder")
		}), a ? /* @__PURE__ */ y("div", {
			className: "absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover shadow-md",
			children: o.isLoading ? /* @__PURE__ */ y("p", {
				className: "text-muted-foreground px-3 py-2 text-xs",
				children: "…"
			}) : s.length === 0 ? /* @__PURE__ */ y("p", {
				className: "text-muted-foreground px-3 py-2 text-xs",
				children: "—"
			}) : s.map((t) => /* @__PURE__ */ y("button", {
				type: "button",
				className: "hover:bg-muted block w-full px-3 py-2 text-start text-sm",
				onClick: () => {
					e(t), i("");
				},
				children: t.name
			}, t.id))
		}) : null]
	});
}
function Du({ value: e, onChange: t }) {
	let { t: n } = m();
	return /* @__PURE__ */ b(au, {
		value: e,
		onValueChange: (e) => t(e),
		children: [/* @__PURE__ */ y(su, {
			className: "h-9 w-36 text-xs",
			"aria-label": n("shipping.itemCost.qtyModeLabel"),
			children: /* @__PURE__ */ y(ou, {})
		}), /* @__PURE__ */ b(cu, { children: [
			/* @__PURE__ */ y(Q, {
				value: "inherit",
				children: n("shipping.itemCost.qtyModeInherit")
			}),
			/* @__PURE__ */ y(Q, {
				value: "per_qty",
				children: n("shipping.itemCost.qtyModePerQty")
			}),
			/* @__PURE__ */ y(Q, {
				value: "once",
				children: n("shipping.itemCost.qtyModeOnce")
			})
		] })]
	});
}
function Ou({ id: e, label: t, value: n, showQtyMode: r, qtyMode: i, onQtyModeChange: a, onChange: o, onRemove: s }) {
	let { t: c } = m();
	return /* @__PURE__ */ b("li", {
		className: "flex flex-wrap items-center gap-2 rounded-xl border p-2",
		children: [
			/* @__PURE__ */ y("span", {
				className: "min-w-0 flex-1 truncate text-sm font-medium",
				title: t,
				children: t
			}),
			r && a ? /* @__PURE__ */ y(Du, {
				value: i ?? "inherit",
				onChange: a
			}) : null,
			/* @__PURE__ */ y(vu, {
				id: e,
				inputMode: "numeric",
				value: n,
				onChange: o,
				placeholder: "150,000",
				className: "w-36 text-sm",
				"aria-label": c("shipping.itemCost.costField")
			}),
			/* @__PURE__ */ y(W, {
				type: "button",
				variant: "ghost",
				size: "icon",
				className: "text-destructive size-9",
				onClick: s,
				"aria-label": c("common.delete"),
				children: /* @__PURE__ */ y(tu, { className: "size-4" })
			})
		]
	});
}
function ku() {
	let { t: r } = m(), i = n(), [a, o] = p(null), [s, c] = p({
		products: {},
		categories: {},
		brands: {}
	}), u = t({
		queryKey: ["shipping-item-cost"],
		queryFn: () => Z("shipping/item-cost/settings")
	});
	bl(u);
	let d = t({
		queryKey: ["gateway-discounts", "gateways"],
		queryFn: () => Z("marketing/gateway-discounts/gateways"),
		staleTime: 6e4
	}), f = t({
		queryKey: ["product-categories"],
		queryFn: () => Z("shop/product-categories"),
		staleTime: 6e4
	}), g = t({
		queryKey: ["brands"],
		queryFn: () => Z("shop/brands"),
		staleTime: 6e4
	});
	l(() => {
		if (!u.data?.settings) return;
		let e = u.data.settings, t = (e) => e == null ? "" : String(e), n = Array.isArray(e.gateway_costs) ? e.gateway_costs.map((e) => ({
			gateway: String(e.gateway ?? ""),
			type: e.type === "add" ? "add" : "override",
			amount: Su(e.amount),
			enabled: !0
		})) : [], r = Array.isArray(e.set_costs) ? e.set_costs.map((e, t) => ({
			id: String(e.id ?? `set_${t}`),
			name: String(e.name ?? ""),
			product_ids: Array.isArray(e.product_ids) ? e.product_ids.map((e) => Number(e) || 0).filter((e) => e > 0) : [],
			cost: Su(e.cost)
		})) : [];
		o({
			...bu(),
			enabled: !!e.enabled,
			mode: e.mode === "each" || e.mode === "once" || e.mode === "max" ? e.mode : "max",
			multiply_by_qty: e.multiply_by_qty !== !1,
			default_cost_once: !!e.default_cost_once,
			virtual_skip: e.virtual_skip !== !1,
			category_children: e.category_children !== !1,
			skip_with_free_coupon: !!e.skip_with_free_coupon,
			skip_free_methods: e.skip_free_methods !== !1,
			skip_local_pickup: e.skip_local_pickup !== !1,
			default_cost: t(e.default_cost),
			min_free_amount: t(e.min_free_amount),
			product_costs: Cu(e.product_costs),
			set_costs: r,
			category_costs: Cu(e.category_costs),
			brand_costs: Cu(e.brand_costs),
			rule_qty_modes: xu(e.rule_qty_modes),
			gateway_costs: n
		});
	}, [u.data]), l(() => {
		if (!a) return;
		let e = Array.from(new Set([...Object.keys(a.product_costs).map(Number), ...a.set_costs.flatMap((e) => e.product_ids)])).filter((e) => e > 0), t = Object.keys(a.category_costs).map(Number).filter((e) => e > 0), n = Object.keys(a.brand_costs).map(Number).filter((e) => e > 0);
		if (e.length === 0 && t.length === 0 && n.length === 0) return;
		let r = !1, i = new URLSearchParams();
		return e.length && i.set("products", e.join(",")), t.length && i.set("categories", t.join(",")), n.length && i.set("brands", n.join(",")), Z(`shipping/item-cost/names?${i.toString()}`).then((e) => {
			r || c((t) => ({
				products: {
					...t.products,
					...e.products ?? {}
				},
				categories: {
					...t.categories,
					...e.categories ?? {}
				},
				brands: {
					...t.brands,
					...e.brands ?? {}
				}
			}));
		}).catch(() => void 0), () => {
			r = !0;
		};
	}, [
		a ? Object.keys(a.product_costs).sort().join(",") : "",
		a ? a.set_costs.flatMap((e) => e.product_ids).sort().join(",") : "",
		a ? Object.keys(a.category_costs).sort().join(",") : "",
		a ? Object.keys(a.brand_costs).sort().join(",") : ""
	]);
	let _ = e({
		mutationFn: () => {
			if (!a) throw Error("no draft");
			let e = (e) => e.trim() === "" ? "" : wu(e), t = (e) => {
				let t = {};
				for (let [n, r] of Object.entries(e)) /^\d+$/.test(n) && (t[n] = wu(r));
				return t;
			}, n = (e, t) => {
				let n = {};
				for (let [r, i] of Object.entries(e)) t.has(r) && (i === "per_qty" || i === "once") && (n[r] = i);
				return n;
			}, r = {
				enabled: a.enabled,
				mode: a.mode,
				multiply_by_qty: a.multiply_by_qty,
				default_cost_once: a.default_cost_once,
				virtual_skip: a.virtual_skip,
				category_children: a.category_children,
				skip_with_free_coupon: a.skip_with_free_coupon,
				skip_free_methods: a.skip_free_methods,
				skip_local_pickup: a.skip_local_pickup,
				default_cost: e(a.default_cost),
				min_free_amount: e(a.min_free_amount),
				product_costs: t(a.product_costs),
				set_costs: a.set_costs.map((e) => ({
					id: e.id,
					name: e.name.trim(),
					product_ids: e.product_ids,
					cost: wu(e.cost)
				})),
				category_costs: t(a.category_costs),
				brand_costs: t(a.brand_costs),
				rule_qty_modes: {
					products: n(a.rule_qty_modes.products, new Set(Object.keys(a.product_costs))),
					sets: n(a.rule_qty_modes.sets, new Set(a.set_costs.map((e) => e.id))),
					categories: n(a.rule_qty_modes.categories, new Set(Object.keys(a.category_costs))),
					brands: n(a.rule_qty_modes.brands, new Set(Object.keys(a.brand_costs)))
				},
				gateway_costs: a.gateway_costs.filter((e) => e.enabled && e.gateway.trim() !== "").map((e) => ({
					gateway: e.gateway,
					type: e.type,
					amount: wu(e.amount)
				}))
			};
			return Z("shipping/item-cost/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ settings: r })
			});
		},
		onSuccess: () => {
			h.success(r("common.saved")), i.invalidateQueries({ queryKey: ["shipping-item-cost"] }), i.invalidateQueries({ queryKey: ["shipping-hub-status"] });
		},
		onError: (e) => yl(r, e)
	});
	if (!a) return /* @__PURE__ */ y(Bl, {
		title: r("shipping.itemCost.title"),
		children: /* @__PURE__ */ y("p", {
			className: "text-muted-foreground text-sm",
			children: r("common.loading")
		})
	});
	let x = f.data?.items ?? [], S = g.data?.items ?? [], C = [...d.data?.items ?? []];
	for (let e of a.gateway_costs) C.some((t) => t.id === e.gateway) || C.push({
		id: e.gateway,
		title: e.gateway,
		enabled: !1,
		preset: !0
	});
	let w = (e) => o((t) => t && {
		...t,
		...e
	}), T = (e, t) => o((n) => n && {
		...n,
		[e]: t
	}), E = (e, t, n) => o((r) => {
		if (!r) return r;
		let i = { ...r.rule_qty_modes[e] };
		return n === "inherit" ? delete i[t] : i[t] = n, {
			...r,
			rule_qty_modes: {
				...r.rule_qty_modes,
				[e]: i
			}
		};
	}), ee = (e, t, n) => o((r) => {
		if (!r) return r;
		let i = Object.fromEntries(Object.entries(r[e]).filter(([e]) => e !== n)), a = { ...r.rule_qty_modes[t] };
		return delete a[n], {
			...r,
			[e]: i,
			rule_qty_modes: {
				...r.rule_qty_modes,
				[t]: a
			}
		};
	}), D = a.mode === "each", O = (e, t) => s[e][t] ?? x.find((e) => String(e.id) === t)?.name ?? S.find((e) => String(e.id) === t)?.name ?? `#${t}`, k = Object.keys(a.product_costs).length + Object.keys(a.category_costs).length + Object.keys(a.brand_costs).length + a.set_costs.length + a.gateway_costs.filter((e) => e.enabled).length;
	return /* @__PURE__ */ b(Bl, {
		title: r("shipping.itemCost.title"),
		description: r("shipping.itemCost.description"),
		children: [
			/* @__PURE__ */ y(G, {
				className: U("border-2", a.enabled ? "border-primary/50" : "border-border"),
				children: /* @__PURE__ */ b(J, {
					className: "flex flex-wrap items-center justify-between gap-4 py-4",
					children: [/* @__PURE__ */ b("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ y("div", {
							className: "bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-2xl",
							children: /* @__PURE__ */ y(nu, {
								className: "size-5",
								"aria-hidden": !0
							})
						}), /* @__PURE__ */ b("div", {
							className: "max-w-xl",
							children: [/* @__PURE__ */ y("p", {
								className: "font-semibold",
								children: r("shipping.itemCost.enable")
							}), /* @__PURE__ */ y("p", {
								className: "text-muted-foreground text-sm leading-relaxed",
								children: r("shipping.itemCost.enableHint")
							})]
						})]
					}), /* @__PURE__ */ y($, {
						checked: a.enabled,
						onCheckedChange: (e) => w({ enabled: e }),
						"aria-label": r("shipping.itemCost.enable")
					})]
				})
			}),
			/* @__PURE__ */ b(G, { children: [/* @__PURE__ */ b(K, { children: [/* @__PURE__ */ y(q, {
				className: "text-base",
				children: r("shipping.itemCost.modeTitle")
			}), /* @__PURE__ */ y(Rc, { children: r("shipping.itemCost.modeHint") })] }), /* @__PURE__ */ b(J, {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ b("div", {
						className: "grid gap-2",
						children: [
							/* @__PURE__ */ y(X, {
								htmlFor: "ic-mode",
								children: r("shipping.itemCost.modeLabel")
							}),
							/* @__PURE__ */ b(au, {
								value: a.mode,
								onValueChange: (e) => w({ mode: e }),
								children: [/* @__PURE__ */ y(su, {
									id: "ic-mode",
									className: "w-full",
									children: /* @__PURE__ */ y(ou, {})
								}), /* @__PURE__ */ b(cu, { children: [
									/* @__PURE__ */ y(Q, {
										value: "each",
										children: r("shipping.itemCost.modeEach")
									}),
									/* @__PURE__ */ y(Q, {
										value: "once",
										children: r("shipping.itemCost.modeOnce")
									}),
									/* @__PURE__ */ y(Q, {
										value: "max",
										children: r("shipping.itemCost.modeMax")
									})
								] })]
							}),
							/* @__PURE__ */ y("p", {
								className: "text-muted-foreground text-xs leading-relaxed",
								children: a.mode === "each" ? r("shipping.itemCost.modeEachDesc") : a.mode === "once" ? r("shipping.itemCost.modeOnceDesc") : r("shipping.itemCost.modeMaxDesc")
							})
						]
					}),
					D ? /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ b("div", {
						className: "flex items-center justify-between gap-4 rounded-xl border p-3",
						children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(X, {
							htmlFor: "ic-mul-qty",
							className: "text-sm",
							children: r("shipping.itemCost.multiplyQty")
						}), /* @__PURE__ */ y("p", {
							className: "text-muted-foreground text-xs",
							children: r("shipping.itemCost.multiplyQtyHint")
						})] }), /* @__PURE__ */ y($, {
							id: "ic-mul-qty",
							checked: a.multiply_by_qty,
							onCheckedChange: (e) => w({ multiply_by_qty: e })
						})]
					}), /* @__PURE__ */ b("div", {
						className: "flex items-center justify-between gap-4 rounded-xl border p-3",
						children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(X, {
							htmlFor: "ic-default-once",
							className: "text-sm",
							children: r("shipping.itemCost.defaultCostOnce")
						}), /* @__PURE__ */ y("p", {
							className: "text-muted-foreground text-xs leading-relaxed",
							children: r("shipping.itemCost.defaultCostOnceHint")
						})] }), /* @__PURE__ */ y($, {
							id: "ic-default-once",
							checked: a.default_cost_once,
							onCheckedChange: (e) => w({ default_cost_once: e })
						})]
					})] }) : null,
					/* @__PURE__ */ b("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ b("div", {
							className: "grid gap-2",
							children: [
								/* @__PURE__ */ y(X, {
									htmlFor: "ic-default",
									children: r("shipping.itemCost.defaultCost")
								}),
								/* @__PURE__ */ y(vu, {
									id: "ic-default",
									inputMode: "numeric",
									value: a.default_cost,
									onChange: (e) => w({ default_cost: e }),
									placeholder: "150,000"
								}),
								/* @__PURE__ */ y("p", {
									className: "text-muted-foreground text-[11px] leading-relaxed",
									children: r("shipping.itemCost.defaultCostHint")
								})
							]
						}), /* @__PURE__ */ b("div", {
							className: "grid gap-2",
							children: [
								/* @__PURE__ */ y(X, {
									htmlFor: "ic-min-free",
									children: r("shipping.itemCost.minFree")
								}),
								/* @__PURE__ */ y(vu, {
									id: "ic-min-free",
									inputMode: "numeric",
									value: a.min_free_amount,
									onChange: (e) => w({ min_free_amount: e }),
									placeholder: "5,000,000"
								}),
								/* @__PURE__ */ y("p", {
									className: "text-muted-foreground text-[11px] leading-relaxed",
									children: r("shipping.itemCost.minFreeHint")
								})
							]
						})]
					}),
					/* @__PURE__ */ b("div", {
						className: "grid gap-2",
						children: [
							/* @__PURE__ */ b("div", {
								className: "flex items-center justify-between gap-4 rounded-xl border p-3",
								children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(X, {
									htmlFor: "ic-virtual",
									className: "text-sm",
									children: r("shipping.itemCost.virtualSkip")
								}), /* @__PURE__ */ y("p", {
									className: "text-muted-foreground text-xs",
									children: r("shipping.itemCost.virtualSkipHint")
								})] }), /* @__PURE__ */ y($, {
									id: "ic-virtual",
									checked: a.virtual_skip,
									onCheckedChange: (e) => w({ virtual_skip: e })
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "flex items-center justify-between gap-4 rounded-xl border p-3",
								children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(X, {
									htmlFor: "ic-cat-children",
									className: "text-sm",
									children: r("shipping.itemCost.categoryChildren")
								}), /* @__PURE__ */ y("p", {
									className: "text-muted-foreground text-xs",
									children: r("shipping.itemCost.categoryChildrenHint")
								})] }), /* @__PURE__ */ y($, {
									id: "ic-cat-children",
									checked: a.category_children,
									onCheckedChange: (e) => w({ category_children: e })
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "flex items-center justify-between gap-4 rounded-xl border p-3",
								children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(X, {
									htmlFor: "ic-skip-coupon",
									className: "text-sm",
									children: r("shipping.itemCost.skipFreeCoupon")
								}), /* @__PURE__ */ y("p", {
									className: "text-muted-foreground text-xs",
									children: r("shipping.itemCost.skipFreeCouponHint")
								})] }), /* @__PURE__ */ y($, {
									id: "ic-skip-coupon",
									checked: a.skip_with_free_coupon,
									onCheckedChange: (e) => w({ skip_with_free_coupon: e })
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "flex items-center justify-between gap-4 rounded-xl border p-3",
								children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(X, {
									htmlFor: "ic-skip-free-methods",
									className: "text-sm",
									children: r("shipping.itemCost.skipFreeMethods")
								}), /* @__PURE__ */ y("p", {
									className: "text-muted-foreground text-xs",
									children: r("shipping.itemCost.skipFreeMethodsHint")
								})] }), /* @__PURE__ */ y($, {
									id: "ic-skip-free-methods",
									checked: a.skip_free_methods,
									onCheckedChange: (e) => w({ skip_free_methods: e })
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "flex items-center justify-between gap-4 rounded-xl border p-3",
								children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(X, {
									htmlFor: "ic-skip-pickup",
									className: "text-sm",
									children: r("shipping.itemCost.skipLocalPickup")
								}), /* @__PURE__ */ y("p", {
									className: "text-muted-foreground text-xs",
									children: r("shipping.itemCost.skipLocalPickupHint")
								})] }), /* @__PURE__ */ y($, {
									id: "ic-skip-pickup",
									checked: a.skip_local_pickup,
									onCheckedChange: (e) => w({ skip_local_pickup: e })
								})]
							})
						]
					}),
					/* @__PURE__ */ y("p", {
						className: "text-muted-foreground bg-muted/50 rounded-xl border p-3 text-[11px] leading-relaxed",
						children: r("shipping.itemCost.priorityHint")
					})
				]
			})] }),
			/* @__PURE__ */ b(G, { children: [/* @__PURE__ */ b(K, { children: [/* @__PURE__ */ y(q, {
				className: "text-base",
				children: r("shipping.itemCost.productTitle")
			}), /* @__PURE__ */ y(Rc, { children: r("shipping.itemCost.productHint") })] }), /* @__PURE__ */ b(J, {
				className: "grid gap-3",
				children: [/* @__PURE__ */ y(Eu, { onAdd: (e) => {
					c((t) => ({
						...t,
						products: {
							...t.products,
							[String(e.id)]: e.name
						}
					})), o((t) => t && {
						...t,
						product_costs: {
							...t.product_costs,
							[String(e.id)]: t.product_costs[String(e.id)] ?? ""
						}
					});
				} }), Object.keys(a.product_costs).length === 0 ? /* @__PURE__ */ y("p", {
					className: "text-muted-foreground text-xs",
					children: r("shipping.itemCost.emptyList")
				}) : /* @__PURE__ */ y("ul", {
					className: "grid gap-2",
					children: Object.entries(a.product_costs).map(([e, t]) => /* @__PURE__ */ y(Ou, {
						id: `ic-product-cost-${e}`,
						label: O("products", e),
						value: t,
						showQtyMode: D,
						qtyMode: a.rule_qty_modes.products[e] ?? "inherit",
						onQtyModeChange: (t) => E("products", e, t),
						onChange: (t) => T("product_costs", {
							...a.product_costs,
							[e]: t
						}),
						onRemove: () => ee("product_costs", "products", e)
					}, e))
				})]
			})] }),
			/* @__PURE__ */ b(G, { children: [/* @__PURE__ */ y(K, { children: /* @__PURE__ */ b("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(q, {
					className: "text-base",
					children: r("shipping.itemCost.setsTitle")
				}), /* @__PURE__ */ y(Rc, { children: r("shipping.itemCost.setsHint") })] }), /* @__PURE__ */ b(W, {
					type: "button",
					variant: "secondary",
					size: "sm",
					onClick: () => o((e) => e && {
						...e,
						set_costs: [...e.set_costs, yu()]
					}),
					children: [/* @__PURE__ */ y(eu, { className: "size-4" }), r("shipping.itemCost.addSet")]
				})]
			}) }), /* @__PURE__ */ y(J, {
				className: "grid gap-4",
				children: a.set_costs.length === 0 ? /* @__PURE__ */ y("p", {
					className: "text-muted-foreground text-xs",
					children: r("shipping.itemCost.emptySets")
				}) : a.set_costs.map((e) => /* @__PURE__ */ b("div", {
					className: "grid gap-3 rounded-xl border p-3",
					children: [
						/* @__PURE__ */ b("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ y(Y, {
									value: e.name,
									onChange: (t) => o((n) => n && {
										...n,
										set_costs: n.set_costs.map((n) => n.id === e.id ? {
											...n,
											name: t.target.value
										} : n)
									}),
									placeholder: r("shipping.itemCost.setNamePlaceholder"),
									className: "min-w-40 flex-1",
									"aria-label": r("shipping.itemCost.setName")
								}),
								D ? /* @__PURE__ */ y(Du, {
									value: a.rule_qty_modes.sets[e.id] ?? "inherit",
									onChange: (t) => E("sets", e.id, t)
								}) : null,
								/* @__PURE__ */ y(vu, {
									inputMode: "numeric",
									value: e.cost,
									onChange: (t) => o((n) => n && {
										...n,
										set_costs: n.set_costs.map((n) => n.id === e.id ? {
											...n,
											cost: t
										} : n)
									}),
									placeholder: "100,000",
									className: "w-36",
									"aria-label": r("shipping.itemCost.setCost")
								}),
								/* @__PURE__ */ y(W, {
									type: "button",
									variant: "ghost",
									size: "icon",
									className: "text-destructive size-9",
									onClick: () => o((t) => {
										if (!t) return t;
										let n = { ...t.rule_qty_modes.sets };
										return delete n[e.id], {
											...t,
											set_costs: t.set_costs.filter((t) => t.id !== e.id),
											rule_qty_modes: {
												...t.rule_qty_modes,
												sets: n
											}
										};
									}),
									"aria-label": r("common.delete"),
									children: /* @__PURE__ */ y(tu, { className: "size-4" })
								})
							]
						}),
						/* @__PURE__ */ y(mu, {
							id: `ic-set-products-${e.id}`,
							label: r("shipping.itemCost.setProducts"),
							value: e.product_ids,
							onChange: (t) => o((n) => n && {
								...n,
								set_costs: n.set_costs.map((n) => n.id === e.id ? {
									...n,
									product_ids: t
								} : n)
							})
						}),
						e.product_ids.length === 0 ? /* @__PURE__ */ y("p", {
							className: "text-amber-600 dark:text-amber-400 text-[11px]",
							children: r("shipping.itemCost.setNoProducts")
						}) : null
					]
				}, e.id))
			})] }),
			/* @__PURE__ */ b(G, { children: [/* @__PURE__ */ b(K, { children: [/* @__PURE__ */ y(q, {
				className: "text-base",
				children: r("shipping.itemCost.categoryTitle")
			}), /* @__PURE__ */ y(Rc, { children: r("shipping.itemCost.categoryHint") })] }), /* @__PURE__ */ b(J, {
				className: "grid gap-3",
				children: [/* @__PURE__ */ y(Tu, {
					id: "ic-cat-add",
					items: x,
					loading: f.isLoading,
					placeholder: r("shipping.itemCost.categorySearchPlaceholder"),
					onAdd: (e) => {
						c((t) => ({
							...t,
							categories: {
								...t.categories,
								[String(e.id)]: e.name
							}
						})), o((t) => t && {
							...t,
							category_costs: {
								...t.category_costs,
								[String(e.id)]: t.category_costs[String(e.id)] ?? ""
							}
						});
					}
				}), Object.keys(a.category_costs).length === 0 ? /* @__PURE__ */ y("p", {
					className: "text-muted-foreground text-xs",
					children: r("shipping.itemCost.emptyList")
				}) : /* @__PURE__ */ y("ul", {
					className: "grid gap-2",
					children: Object.entries(a.category_costs).map(([e, t]) => /* @__PURE__ */ y(Ou, {
						id: `ic-cat-cost-${e}`,
						label: O("categories", e),
						value: t,
						showQtyMode: D,
						qtyMode: a.rule_qty_modes.categories[e] ?? "inherit",
						onQtyModeChange: (t) => E("categories", e, t),
						onChange: (t) => T("category_costs", {
							...a.category_costs,
							[e]: t
						}),
						onRemove: () => ee("category_costs", "categories", e)
					}, e))
				})]
			})] }),
			/* @__PURE__ */ b(G, { children: [/* @__PURE__ */ b(K, { children: [/* @__PURE__ */ y(q, {
				className: "text-base",
				children: r("shipping.itemCost.brandTitle")
			}), /* @__PURE__ */ y(Rc, { children: r("shipping.itemCost.brandHint") })] }), /* @__PURE__ */ b(J, {
				className: "grid gap-3",
				children: [/* @__PURE__ */ y(Tu, {
					id: "ic-brand-add",
					items: S,
					loading: g.isLoading,
					placeholder: r("shipping.itemCost.brandSearchPlaceholder"),
					onAdd: (e) => {
						c((t) => ({
							...t,
							brands: {
								...t.brands,
								[String(e.id)]: e.name
							}
						})), o((t) => t && {
							...t,
							brand_costs: {
								...t.brand_costs,
								[String(e.id)]: t.brand_costs[String(e.id)] ?? ""
							}
						});
					}
				}), Object.keys(a.brand_costs).length === 0 ? /* @__PURE__ */ y("p", {
					className: "text-muted-foreground text-xs",
					children: r("shipping.itemCost.emptyList")
				}) : /* @__PURE__ */ y("ul", {
					className: "grid gap-2",
					children: Object.entries(a.brand_costs).map(([e, t]) => /* @__PURE__ */ y(Ou, {
						id: `ic-brand-cost-${e}`,
						label: O("brands", e),
						value: t,
						showQtyMode: D,
						qtyMode: a.rule_qty_modes.brands[e] ?? "inherit",
						onQtyModeChange: (t) => E("brands", e, t),
						onChange: (t) => T("brand_costs", {
							...a.brand_costs,
							[e]: t
						}),
						onRemove: () => ee("brand_costs", "brands", e)
					}, e))
				})]
			})] }),
			/* @__PURE__ */ b(G, { children: [/* @__PURE__ */ b(K, { children: [/* @__PURE__ */ y(q, {
				className: "text-base",
				children: r("shipping.itemCost.gatewayTitle")
			}), /* @__PURE__ */ y(Rc, { children: r("shipping.itemCost.gatewayHint") })] }), /* @__PURE__ */ y(J, {
				className: "grid gap-2",
				children: d.isLoading ? /* @__PURE__ */ y("p", {
					className: "text-muted-foreground text-xs",
					children: r("common.loading")
				}) : C.length === 0 ? /* @__PURE__ */ y("p", {
					className: "text-muted-foreground text-xs",
					children: r("shipping.itemCost.gatewayEmpty")
				}) : C.map((e) => {
					let t = a.gateway_costs.find((t) => t.gateway === e.id), n = !!t?.enabled, i = (n) => {
						o((r) => {
							if (!r) return r;
							let i = r.gateway_costs.filter((t) => t.gateway !== e.id), a = {
								...t ?? {
									gateway: e.id,
									type: "override",
									amount: "",
									enabled: !0
								},
								...n
							};
							return a.enabled ? {
								...r,
								gateway_costs: [...i, a]
							} : {
								...r,
								gateway_costs: i
							};
						});
					};
					return /* @__PURE__ */ b("div", {
						className: "flex flex-wrap items-center gap-2 rounded-xl border p-2",
						children: [
							/* @__PURE__ */ y($, {
								checked: n,
								onCheckedChange: (e) => i({ enabled: e }),
								"aria-label": String(e.title)
							}),
							/* @__PURE__ */ y("span", {
								className: "min-w-0 flex-1",
								children: /* @__PURE__ */ b("span", {
									className: "block truncate text-sm font-medium",
									children: [e.title, e.enabled ? null : /* @__PURE__ */ b("span", {
										className: "text-muted-foreground ms-1 text-[10px]",
										children: [
											"(",
											r("shipping.itemCost.gatewayDisabledSuffix"),
											")"
										]
									})]
								})
							}),
							n ? /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ b(au, {
								value: t?.type ?? "override",
								onValueChange: (e) => i({ type: e }),
								children: [/* @__PURE__ */ y(su, {
									className: "h-9 w-40 text-xs",
									"aria-label": r("shipping.itemCost.gatewayType"),
									children: /* @__PURE__ */ y(ou, {})
								}), /* @__PURE__ */ b(cu, { children: [/* @__PURE__ */ y(Q, {
									value: "override",
									children: r("shipping.itemCost.gatewayOverride")
								}), /* @__PURE__ */ y(Q, {
									value: "add",
									children: r("shipping.itemCost.gatewayAdd")
								})] })]
							}), /* @__PURE__ */ y(vu, {
								inputMode: "numeric",
								value: t?.amount ?? "",
								onChange: (e) => i({ amount: e }),
								placeholder: "100,000",
								className: "h-9 w-36 text-sm",
								"aria-label": r("shipping.itemCost.costField")
							})] }) : null
						]
					}, e.id);
				})
			})] }),
			/* @__PURE__ */ b("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ y("p", {
					className: "text-muted-foreground text-xs",
					children: r("shipping.itemCost.rulesCount", { count: k })
				}), /* @__PURE__ */ y(W, {
					type: "button",
					disabled: _.isPending,
					onClick: () => _.mutate(),
					children: _.isPending ? r("common.saving") : r("common.save")
				})]
			})
		]
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/MapSettingsPage.tsx
function Au() {
	let { t: n } = m(), [r, i] = p(null), a = t({
		queryKey: ["shipping-map"],
		queryFn: () => Z("shipping/map/settings")
	});
	bl(a), l(() => {
		a.data?.settings && i(a.data.settings);
	}, [a.data]);
	let o = e({
		mutationFn: (e) => Z("shipping/map/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ settings: e })
		}),
		onSuccess: () => h.success(n("common.saved")),
		onError: (e) => yl(n, e)
	});
	return r ? /* @__PURE__ */ b(Bl, {
		title: n("shipping.mapTitle"),
		description: n("shipping.mapHint"),
		children: [/* @__PURE__ */ y("div", {
			className: "mb-4 flex justify-end",
			children: /* @__PURE__ */ y(W, {
				disabled: o.isPending,
				onClick: () => o.mutate(r),
				children: n("common.save")
			})
		}), /* @__PURE__ */ b(G, {
			className: "shadow-sm",
			children: [/* @__PURE__ */ y(K, {
				className: "pb-2",
				children: /* @__PURE__ */ y(q, {
					className: "text-base",
					children: n("shipping.mapTitle")
				})
			}), /* @__PURE__ */ b(J, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ b("label", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ y("span", { children: n("shipping.mapEnabled") }), /* @__PURE__ */ y($, {
							checked: r.enabled,
							onCheckedChange: (e) => i({
								...r,
								enabled: e
							})
						})]
					}),
					/* @__PURE__ */ b("label", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ y("span", { children: n("shipping.mapRequired") }), /* @__PURE__ */ y($, {
							checked: r.required_location,
							onCheckedChange: (e) => i({
								...r,
								required_location: e
							})
						})]
					}),
					/* @__PURE__ */ b("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(X, { children: n("shipping.mapProvider") }), /* @__PURE__ */ b(au, {
									value: r.provider,
									onValueChange: (e) => i({
										...r,
										provider: e
									}),
									children: [/* @__PURE__ */ y(su, { children: /* @__PURE__ */ y(ou, {}) }), /* @__PURE__ */ b(cu, { children: [
										/* @__PURE__ */ y(Q, {
											value: "osm",
											children: "OpenStreetMap"
										}),
										/* @__PURE__ */ y(Q, {
											value: "neshan",
											children: "Neshan"
										}),
										/* @__PURE__ */ y(Q, {
											value: "mapp",
											children: "Map.ir"
										})
									] })]
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(X, { children: n("shipping.mapPlacement") }), /* @__PURE__ */ b(au, {
									value: r.checkout_placement,
									onValueChange: (e) => i({
										...r,
										checkout_placement: e
									}),
									children: [/* @__PURE__ */ y(su, { children: /* @__PURE__ */ y(ou, {}) }), /* @__PURE__ */ b(cu, { children: [/* @__PURE__ */ y(Q, {
										value: "after_order_notes",
										children: n("shipping.mapAfterNotes")
									}), /* @__PURE__ */ y(Q, {
										value: "before_customer_details",
										children: n("shipping.mapBeforeDetails")
									})] })]
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(X, { children: n("shipping.mapDistance") }), /* @__PURE__ */ b(au, {
									value: r.distance_mode,
									onValueChange: (e) => i({
										...r,
										distance_mode: e
									}),
									children: [/* @__PURE__ */ y(su, { children: /* @__PURE__ */ y(ou, {}) }), /* @__PURE__ */ b(cu, { children: [
										/* @__PURE__ */ y(Q, {
											value: "none",
											children: n("shipping.mapDistNone")
										}),
										/* @__PURE__ */ y(Q, {
											value: "direct",
											children: n("shipping.mapDistDirect")
										}),
										/* @__PURE__ */ y(Q, {
											value: "real",
											children: n("shipping.mapDistReal")
										})
									] })]
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(X, { children: "Neshan API" }), /* @__PURE__ */ y(Y, {
									dir: "ltr",
									value: r.neshan_api_key,
									onChange: (e) => i({
										...r,
										neshan_api_key: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(X, { children: "Map.ir API" }), /* @__PURE__ */ y(Y, {
									dir: "ltr",
									value: r.mapp_api_key,
									onChange: (e) => i({
										...r,
										mapp_api_key: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(X, { children: "ORS Token" }), /* @__PURE__ */ y(Y, {
									dir: "ltr",
									value: r.ors_token,
									onChange: (e) => i({
										...r,
										ors_token: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(X, { children: n("shipping.storeLat") }), /* @__PURE__ */ y(Y, {
									type: "number",
									dir: "ltr",
									value: r.store_location.lat,
									onChange: (e) => i({
										...r,
										store_location: {
											...r.store_location,
											lat: parseFloat(e.target.value) || 0
										}
									})
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(X, { children: n("shipping.storeLng") }), /* @__PURE__ */ y(Y, {
									type: "number",
									dir: "ltr",
									value: r.store_location.lng,
									onChange: (e) => i({
										...r,
										store_location: {
											...r.store_location,
											lng: parseFloat(e.target.value) || 0
										}
									})
								})]
							})
						]
					})
				]
			})]
		})]
	}) : /* @__PURE__ */ y(Bl, {
		title: n("shipping.mapTitle"),
		children: /* @__PURE__ */ y("p", {
			className: "text-muted-foreground text-sm",
			children: n("common.loading")
		})
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/PackagingSettingsPage.tsx
function ju(e) {
	return Object.values(e.boxes).sort((e, t) => e.size - t.size);
}
function Mu() {
	let { t: n } = m(), [r, i] = p(null), a = t({
		queryKey: ["shipping-packaging-settings"],
		queryFn: () => Z("shipping/packaging/settings")
	});
	bl(a), l(() => {
		a.data?.settings && i(a.data.settings);
	}, [a.data]);
	let o = e({
		mutationFn: (e) => Z("shipping/packaging/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ settings: e })
		}),
		onSuccess: (e) => {
			h.success(n("common.saved")), e.settings && i(e.settings);
		},
		onError: (e) => yl(n, e)
	}), s = d(() => r ? ju(r) : [], [r]);
	return r ? /* @__PURE__ */ b(Bl, {
		title: n("shipping.packagingTitle"),
		description: n("shipping.packagingHint"),
		children: [
			/* @__PURE__ */ y("div", {
				className: "mb-4 flex justify-end",
				children: /* @__PURE__ */ y(W, {
					type: "button",
					disabled: o.isPending,
					onClick: () => o.mutate(r),
					children: n("common.save")
				})
			}),
			/* @__PURE__ */ b(G, {
				className: "mb-4 border-primary/20 shadow-sm",
				children: [/* @__PURE__ */ b(K, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(q, {
						className: "text-base",
						children: n("shipping.packagingMasterTitle")
					}), /* @__PURE__ */ y(Rc, { children: n("shipping.packagingMasterHint") })]
				}), /* @__PURE__ */ y(J, { children: /* @__PURE__ */ b("label", {
					className: "flex items-center justify-between gap-3 text-sm",
					children: [/* @__PURE__ */ y("span", { children: n("shipping.packagingMasterEnable") }), /* @__PURE__ */ y($, {
						checked: !!r.enabled,
						onCheckedChange: (e) => i((t) => t && {
							...t,
							enabled: e
						})
					})]
				}) })]
			}),
			/* @__PURE__ */ b(G, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ b(K, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(q, {
						className: "text-base",
						children: n("shipping.checkoutToggleTitle")
					}), /* @__PURE__ */ y(Rc, { children: n("shipping.checkoutToggleHint") })]
				}), /* @__PURE__ */ y(J, { children: /* @__PURE__ */ b("label", {
					className: "flex items-center gap-3 text-sm",
					children: [/* @__PURE__ */ y($, {
						checked: r.add_packaging_cost_to_checkout,
						onCheckedChange: (e) => i((t) => t && {
							...t,
							add_packaging_cost_to_checkout: e
						})
					}), /* @__PURE__ */ y("span", { children: n("shipping.addPackagingToCheckout") })]
				}) })]
			}),
			/* @__PURE__ */ b(G, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ b(K, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(q, {
						className: "text-base",
						children: n("shipping.professionalFeeTitle")
					}), /* @__PURE__ */ y(Rc, { children: n("shipping.professionalFeeHint") })]
				}), /* @__PURE__ */ b(J, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ b("label", {
							className: "flex items-center gap-3 text-sm",
							children: [/* @__PURE__ */ y($, {
								checked: !!r.professional_fee_enabled,
								onCheckedChange: (e) => i((t) => t && {
									...t,
									professional_fee_enabled: e
								})
							}), /* @__PURE__ */ y("span", { children: n("shipping.professionalFeeEnable") })]
						}),
						/* @__PURE__ */ b("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(X, {
									htmlFor: "prof-fee-label",
									children: n("shipping.professionalFeeLabel")
								}), /* @__PURE__ */ y(Y, {
									id: "prof-fee-label",
									value: r.professional_fee_label ?? "",
									onChange: (e) => i((t) => t && {
										...t,
										professional_fee_label: e.target.value
									}),
									placeholder: n("shipping.professionalFeeLabelPlaceholder")
								})]
							}), /* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(X, {
									htmlFor: "prof-fee-amount",
									children: n("shipping.professionalFeeAmount")
								}), /* @__PURE__ */ y(Y, {
									id: "prof-fee-amount",
									type: "number",
									min: 0,
									step: "1",
									dir: "ltr",
									value: Number.isFinite(r.professional_fee_amount) ? String(r.professional_fee_amount) : "0",
									onChange: (e) => {
										let t = Math.max(0, parseFloat(e.target.value) || 0);
										i((e) => e && {
											...e,
											professional_fee_amount: t
										});
									}
								})]
							})]
						}),
						/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(X, {
								htmlFor: "prof-fee-desc",
								children: n("shipping.professionalFeeDescription")
							}), /* @__PURE__ */ y(Y, {
								id: "prof-fee-desc",
								value: r.professional_fee_description ?? "",
								onChange: (e) => i((t) => t && {
									...t,
									professional_fee_description: e.target.value
								}),
								placeholder: n("shipping.professionalFeeDescriptionPlaceholder")
							})]
						}),
						/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ b("label", {
								className: "flex items-center gap-3 text-sm",
								children: [/* @__PURE__ */ y($, {
									id: "prof-fee-mandatory",
									checked: !!r.professional_fee_mandatory,
									onCheckedChange: (e) => i((t) => t && {
										...t,
										professional_fee_mandatory: e
									})
								}), /* @__PURE__ */ y("span", { children: n("shipping.professionalFeeMandatory") })]
							}), /* @__PURE__ */ y("p", {
								className: "text-muted-foreground text-xs ps-12",
								children: n("shipping.professionalFeeMandatoryHelp")
							})]
						}),
						/* @__PURE__ */ b("label", {
							className: r.professional_fee_mandatory ? "flex items-center gap-3 text-sm opacity-60" : "flex items-center gap-3 text-sm",
							children: [/* @__PURE__ */ y($, {
								checked: !!r.professional_fee_mandatory || !!r.professional_fee_default_selected,
								disabled: !!r.professional_fee_mandatory,
								onCheckedChange: (e) => i((t) => t && {
									...t,
									professional_fee_default_selected: e
								})
							}), /* @__PURE__ */ y("span", { children: n("shipping.professionalFeeDefaultOn") })]
						}),
						/* @__PURE__ */ b("label", {
							className: "flex items-center gap-3 text-sm",
							children: [/* @__PURE__ */ y($, {
								checked: r.professional_fee_replaces_carton !== !1,
								onCheckedChange: (e) => i((t) => t && {
									...t,
									professional_fee_replaces_carton: e
								})
							}), /* @__PURE__ */ y("span", { children: n("shipping.professionalFeeReplacesCarton") })]
						})
					]
				})]
			}),
			/* @__PURE__ */ b(G, {
				className: "shadow-sm",
				children: [/* @__PURE__ */ b(K, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(q, {
						className: "text-base",
						children: n("shipping.boxesTitle")
					}), /* @__PURE__ */ y(Rc, { children: n("shipping.boxesHint") })]
				}), /* @__PURE__ */ b(J, {
					className: "space-y-3",
					children: [/* @__PURE__ */ b("div", {
						className: "hidden grid-cols-[4rem_1fr_7rem_7rem_5rem] gap-3 text-muted-foreground text-xs sm:grid",
						children: [
							/* @__PURE__ */ y("span", { children: n("shipping.boxSize") }),
							/* @__PURE__ */ y("span", { children: n("shipping.boxDims") }),
							/* @__PURE__ */ y("span", { children: n("shipping.boxPrice") }),
							/* @__PURE__ */ y("span", { children: n("shipping.boxTare") }),
							/* @__PURE__ */ y("span", { children: n("shipping.boxEnabled") })
						]
					}), s.map((e) => /* @__PURE__ */ b("div", {
						className: "grid items-center gap-3 rounded-lg border border-border p-3 sm:grid-cols-[4rem_1fr_7rem_7rem_5rem]",
						children: [
							/* @__PURE__ */ y("div", {
								className: "text-sm font-semibold",
								children: n("shipping.sizeN", { n: e.size })
							}),
							/* @__PURE__ */ b("div", {
								className: "text-muted-foreground text-sm",
								dir: "ltr",
								children: [
									e.length,
									" × ",
									e.width,
									" × ",
									e.height,
									" cm"
								]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ y(X, {
									className: "sm:sr-only",
									children: n("shipping.boxPrice")
								}), /* @__PURE__ */ y(Y, {
									type: "number",
									min: 0,
									step: "1",
									dir: "ltr",
									value: Number.isFinite(e.price) ? String(e.price) : "0",
									onChange: (t) => {
										let n = Math.max(0, parseFloat(t.target.value) || 0);
										i((t) => {
											if (!t) return t;
											let r = String(e.size);
											return {
												...t,
												boxes: {
													...t.boxes,
													[r]: {
														...t.boxes[r],
														price: n
													}
												}
											};
										});
									}
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ y(X, {
									className: "sm:sr-only",
									children: n("shipping.boxTare")
								}), /* @__PURE__ */ y(Y, {
									type: "number",
									min: 0,
									step: "1",
									dir: "ltr",
									value: Number.isFinite(e.tare_weight_g) ? String(e.tare_weight_g) : "0",
									onChange: (t) => {
										let n = Math.max(0, parseInt(t.target.value, 10) || 0);
										i((t) => {
											if (!t) return t;
											let r = String(e.size);
											return {
												...t,
												boxes: {
													...t.boxes,
													[r]: {
														...t.boxes[r],
														tare_weight_g: n
													}
												}
											};
										});
									}
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ y($, {
									checked: e.enabled,
									onCheckedChange: (t) => {
										i((n) => {
											if (!n) return n;
											let r = String(e.size);
											return {
												...n,
												boxes: {
													...n.boxes,
													[r]: {
														...n.boxes[r],
														enabled: t
													}
												}
											};
										});
									}
								}), /* @__PURE__ */ y("span", {
									className: "text-xs sm:sr-only",
									children: n("shipping.boxEnabled")
								})]
							})
						]
					}, e.size))]
				})]
			})
		]
	}) : /* @__PURE__ */ y(Bl, {
		title: n("shipping.packagingTitle"),
		children: /* @__PURE__ */ y("p", {
			className: "text-muted-foreground text-sm",
			children: n("common.loading")
		})
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/RulesSettingsPage.tsx
var Nu = [
	"state",
	"city",
	"district",
	"product",
	"category",
	"shipping_class",
	"role",
	"payment_method",
	"weight_min",
	"weight_max",
	"cart_total_min",
	"cart_total_max",
	"item_count_min"
], Pu = [
	"hide_method",
	"force_method",
	"set_cost",
	"free",
	"set_title"
];
function Fu() {
	return {
		id: `r_${Date.now()}`,
		enabled: !0,
		priority: 10,
		title: "",
		conditions: [{
			type: "cart_total_min",
			value: 0
		}],
		actions: [{
			type: "free",
			method_id: "",
			value: 0
		}]
	};
}
function Iu(e, t, n) {
	let r = e.slice();
	return r[t] = {
		...e[t],
		...n
	}, r;
}
function Lu() {
	let { t: n } = m(), [r, i] = p(!1), [a, o] = p([]), s = t({
		queryKey: ["shipping-rules"],
		queryFn: () => Z("shipping/rules")
	});
	bl(s), l(() => {
		s.data && (i(!!s.data.enabled), s.data.rules && o(s.data.rules));
	}, [s.data]);
	let c = e({
		mutationFn: (e) => Z("shipping/rules", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(e)
		}),
		onSuccess: () => h.success(n("common.saved")),
		onError: (e) => yl(n, e)
	});
	return /* @__PURE__ */ b(Bl, {
		title: n("shipping.rulesTitle"),
		description: n("shipping.rulesHint"),
		children: [
			/* @__PURE__ */ y(G, {
				className: "mb-4 border-primary/20 shadow-sm",
				children: /* @__PURE__ */ y(J, {
					className: "pt-4",
					children: /* @__PURE__ */ b("label", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y("div", {
							className: "font-medium",
							children: n("shipping.rulesMasterEnable")
						}), /* @__PURE__ */ y("p", {
							className: "text-muted-foreground text-xs",
							children: n("shipping.rulesMasterHint")
						})] }), /* @__PURE__ */ y($, {
							checked: r,
							onCheckedChange: i
						})]
					})
				})
			}),
			/* @__PURE__ */ b("div", {
				className: "mb-4 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ y(W, {
					type: "button",
					variant: "secondary",
					onClick: () => o((e) => [...e, Fu()]),
					children: n("shipping.addRule")
				}), /* @__PURE__ */ y(W, {
					type: "button",
					disabled: c.isPending,
					onClick: () => c.mutate({
						enabled: r,
						rules: a
					}),
					children: n("common.save")
				})]
			}),
			/* @__PURE__ */ y("div", {
				className: "space-y-4",
				children: a.map((e, t) => /* @__PURE__ */ b(G, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ b(K, {
						className: "flex flex-row items-center justify-between gap-2 pb-2",
						children: [/* @__PURE__ */ y(q, {
							className: "text-base",
							children: e.title || n("shipping.ruleN", { n: t + 1 })
						}), /* @__PURE__ */ b("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ y($, {
								checked: e.enabled,
								onCheckedChange: (e) => o(Iu(a, t, { enabled: e }))
							}), /* @__PURE__ */ y(W, {
								type: "button",
								size: "sm",
								variant: "ghost",
								onClick: () => o(a.filter((e, n) => n !== t)),
								children: n("common.delete")
							})]
						})]
					}), /* @__PURE__ */ b(J, {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ b("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ b("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ y(X, { children: n("shipping.ruleTitle") }), /* @__PURE__ */ y(Y, {
										value: e.title,
										onChange: (e) => o(Iu(a, t, { title: e.target.value }))
									})]
								}), /* @__PURE__ */ b("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ y(X, { children: n("shipping.rulePriority") }), /* @__PURE__ */ y(Y, {
										type: "number",
										dir: "ltr",
										value: e.priority,
										onChange: (e) => o(Iu(a, t, { priority: parseInt(e.target.value, 10) || 0 }))
									})]
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ b("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ y(X, { children: n("shipping.conditions") }), /* @__PURE__ */ y(W, {
										type: "button",
										size: "sm",
										variant: "outline",
										onClick: () => o(Iu(a, t, { conditions: [...e.conditions, {
											type: "cart_total_min",
											value: 0
										}] })),
										children: n("shipping.addCondition")
									})]
								}), (e.conditions.length ? e.conditions : [{
									type: "cart_total_min",
									value: ""
								}]).map((r, i) => /* @__PURE__ */ b("div", {
									className: "grid gap-2 sm:grid-cols-[1fr_1fr_auto]",
									children: [
										/* @__PURE__ */ b(au, {
											value: r.type || "cart_total_min",
											onValueChange: (n) => {
												let s = e.conditions.slice();
												s[i] = {
													...r,
													type: n
												}, o(Iu(a, t, { conditions: s }));
											},
											children: [/* @__PURE__ */ y(su, { children: /* @__PURE__ */ y(ou, {}) }), /* @__PURE__ */ y(cu, { children: Nu.map((e) => /* @__PURE__ */ y(Q, {
												value: e,
												children: e
											}, e)) })]
										}),
										/* @__PURE__ */ y(Y, {
											dir: "ltr",
											value: String(r.value ?? ""),
											onChange: (n) => {
												let s = e.conditions.slice();
												s[i] = {
													...r,
													value: n.target.value
												}, o(Iu(a, t, { conditions: s }));
											}
										}),
										/* @__PURE__ */ y(W, {
											type: "button",
											size: "sm",
											variant: "ghost",
											disabled: e.conditions.length <= 1,
											onClick: () => o(Iu(a, t, { conditions: e.conditions.filter((e, t) => t !== i) })),
											children: n("common.delete")
										})
									]
								}, `${e.id}-c-${i}`))]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ b("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ y(X, { children: n("shipping.actions") }), /* @__PURE__ */ y(W, {
										type: "button",
										size: "sm",
										variant: "outline",
										onClick: () => o(Iu(a, t, { actions: [...e.actions, {
											type: "free",
											method_id: "",
											value: 0
										}] })),
										children: n("shipping.addAction")
									})]
								}), (e.actions.length ? e.actions : [{
									type: "free",
									method_id: "",
									value: ""
								}]).map((r, i) => /* @__PURE__ */ b("div", {
									className: "grid gap-2 sm:grid-cols-4",
									children: [
										/* @__PURE__ */ b(au, {
											value: r.type || "free",
											onValueChange: (n) => {
												let s = e.actions.slice();
												s[i] = {
													...r,
													type: n
												}, o(Iu(a, t, { actions: s }));
											},
											children: [/* @__PURE__ */ y(su, { children: /* @__PURE__ */ y(ou, {}) }), /* @__PURE__ */ y(cu, { children: Pu.map((e) => /* @__PURE__ */ y(Q, {
												value: e,
												children: e
											}, e)) })]
										}),
										/* @__PURE__ */ y(Y, {
											dir: "ltr",
											placeholder: "webino_tapin_pishtaz",
											value: r.method_id || "",
											onChange: (n) => {
												let s = e.actions.slice();
												s[i] = {
													...r,
													method_id: n.target.value
												}, o(Iu(a, t, { actions: s }));
											}
										}),
										/* @__PURE__ */ y(Y, {
											dir: "ltr",
											value: String(r.value ?? ""),
											onChange: (n) => {
												let s = e.actions.slice();
												s[i] = {
													...r,
													value: n.target.value
												}, o(Iu(a, t, { actions: s }));
											}
										}),
										/* @__PURE__ */ y(W, {
											type: "button",
											size: "sm",
											variant: "ghost",
											disabled: e.actions.length <= 1,
											onClick: () => o(Iu(a, t, { actions: e.actions.filter((e, t) => t !== i) })),
											children: n("common.delete")
										})
									]
								}, `${e.id}-a-${i}`))]
							})
						]
					})]
				}, e.id))
			})
		]
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/ToolsSettingsPage.tsx
var Ru = () => ({
	enabled: !1,
	hide_when_free: !1,
	hide_when_courier: !1,
	default_product_weight_g: 500,
	default_package_weight_g: 100,
	post_weight_limit_kg: 30,
	status_enable: !1,
	free_shipping_title: "",
	hide_country: !1,
	swap_state_city: !1,
	disable_default_method: !1,
	free_first_order: !1,
	honor_free_shipping_coupon: !1,
	method_images: {}
});
function zu() {
	let { t: n } = m(), [r, i] = p(null), a = t({
		queryKey: ["shipping-tools"],
		queryFn: () => Z("shipping/tools/settings")
	});
	bl(a), l(() => {
		a.data?.settings && i({
			...Ru(),
			...a.data.settings
		});
	}, [a.data]);
	let o = e({
		mutationFn: (e) => Z("shipping/tools/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ settings: e })
		}),
		onSuccess: () => h.success(n("common.saved")),
		onError: (e) => yl(n, e)
	});
	return r ? /* @__PURE__ */ b(Bl, {
		title: n("shipping.toolsTitle"),
		description: n("shipping.toolsHint"),
		children: [
			/* @__PURE__ */ y("div", {
				className: "mb-4 flex justify-end",
				children: /* @__PURE__ */ y(W, {
					type: "button",
					disabled: o.isPending,
					onClick: () => o.mutate(r),
					children: n("common.save")
				})
			}),
			/* @__PURE__ */ b(G, {
				className: "mb-4 border-primary/20 shadow-sm",
				children: [/* @__PURE__ */ y(K, {
					className: "pb-2",
					children: /* @__PURE__ */ y(q, {
						className: "text-base",
						children: n("shipping.toolsMasterTitle")
					})
				}), /* @__PURE__ */ y(J, { children: /* @__PURE__ */ b("label", {
					className: "flex items-center justify-between gap-3 text-sm",
					children: [/* @__PURE__ */ y("span", { children: n("shipping.toolsMasterEnable") }), /* @__PURE__ */ y($, {
						checked: !!r.enabled,
						onCheckedChange: (e) => i({
							...r,
							enabled: e
						})
					})]
				}) })]
			}),
			/* @__PURE__ */ b(G, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ y(K, {
					className: "pb-2",
					children: /* @__PURE__ */ y(q, {
						className: "text-base",
						children: n("shipping.toolsRatesTitle")
					})
				}), /* @__PURE__ */ b(J, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ b("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ y("span", { children: n("shipping.hideWhenFree") }), /* @__PURE__ */ y($, {
								checked: r.hide_when_free,
								onCheckedChange: (e) => i({
									...r,
									hide_when_free: e
								})
							})]
						}),
						/* @__PURE__ */ b("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ y("span", { children: n("shipping.hideWhenCourier") }), /* @__PURE__ */ y($, {
								checked: r.hide_when_courier,
								onCheckedChange: (e) => i({
									...r,
									hide_when_courier: e
								})
							})]
						}),
						/* @__PURE__ */ b("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ y("span", { children: n("shipping.statusEnable") }), /* @__PURE__ */ y($, {
								checked: r.status_enable,
								onCheckedChange: (e) => i({
									...r,
									status_enable: e
								})
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ b(G, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ y(K, {
					className: "pb-2",
					children: /* @__PURE__ */ y(q, {
						className: "text-base",
						children: n("shipping.toolsWeightTitle")
					})
				}), /* @__PURE__ */ b(J, {
					className: "grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(X, { children: n("shipping.defaultProductWeight") }), /* @__PURE__ */ y(Y, {
								type: "number",
								dir: "ltr",
								value: r.default_product_weight_g,
								onChange: (e) => i({
									...r,
									default_product_weight_g: Math.max(0, parseInt(e.target.value, 10) || 0)
								})
							})]
						}),
						/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(X, { children: n("shipping.defaultPackageWeight") }), /* @__PURE__ */ y(Y, {
								type: "number",
								dir: "ltr",
								value: r.default_package_weight_g,
								onChange: (e) => i({
									...r,
									default_package_weight_g: Math.max(0, parseInt(e.target.value, 10) || 0)
								})
							})]
						}),
						/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(X, { children: n("shipping.postWeightLimit") }), /* @__PURE__ */ y(Y, {
								type: "number",
								dir: "ltr",
								value: r.post_weight_limit_kg,
								onChange: (e) => i({
									...r,
									post_weight_limit_kg: Math.max(0, parseFloat(e.target.value) || 0)
								})
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ b(G, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ y(K, {
					className: "pb-2",
					children: /* @__PURE__ */ y(q, {
						className: "text-base",
						children: n("shipping.proUxTitle")
					})
				}), /* @__PURE__ */ b(J, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(X, { children: n("shipping.freeShippingTitle") }), /* @__PURE__ */ y(Y, {
								value: r.free_shipping_title,
								onChange: (e) => i({
									...r,
									free_shipping_title: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ b("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ y("span", { children: n("shipping.hideCountry") }), /* @__PURE__ */ y($, {
								checked: r.hide_country,
								onCheckedChange: (e) => i({
									...r,
									hide_country: e
								})
							})]
						}),
						/* @__PURE__ */ b("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ y("span", { children: n("shipping.swapStateCity") }), /* @__PURE__ */ y($, {
								checked: r.swap_state_city,
								onCheckedChange: (e) => i({
									...r,
									swap_state_city: e
								})
							})]
						}),
						/* @__PURE__ */ b("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ y("span", { children: n("shipping.disableDefaultMethod") }), /* @__PURE__ */ y($, {
								checked: r.disable_default_method,
								onCheckedChange: (e) => i({
									...r,
									disable_default_method: e
								})
							})]
						}),
						/* @__PURE__ */ b("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ y("span", { children: n("shipping.freeFirstOrder") }), /* @__PURE__ */ y($, {
								checked: r.free_first_order,
								onCheckedChange: (e) => i({
									...r,
									free_first_order: e
								})
							})]
						}),
						/* @__PURE__ */ b("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ y("span", { children: n("shipping.honorFreeCoupon") }), /* @__PURE__ */ y($, {
								checked: r.honor_free_shipping_coupon,
								onCheckedChange: (e) => i({
									...r,
									honor_free_shipping_coupon: e
								})
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ b(G, {
				className: "shadow-sm",
				children: [/* @__PURE__ */ b(K, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(q, {
						className: "text-base",
						children: n("shipping.methodImagesTitle")
					}), /* @__PURE__ */ y(Rc, { children: n("shipping.methodImagesHint") })]
				}), /* @__PURE__ */ y(J, {
					className: "space-y-3",
					children: [
						"webino_tapin_pishtaz",
						"webino_tapin_vip",
						"webino_tapin_tipax",
						"webino_courier",
						"webino_tapin_tipax_api",
						"webino_tapin_alonomic",
						"webino_flat_city"
					].map((e) => /* @__PURE__ */ b("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ y(X, {
							dir: "ltr",
							children: e
						}), /* @__PURE__ */ y(Y, {
							dir: "ltr",
							value: r.method_images[e] || "",
							onChange: (t) => i({
								...r,
								method_images: {
									...r.method_images,
									[e]: t.target.value
								}
							})
						})]
					}, e))
				})]
			})
		]
	}) : /* @__PURE__ */ y(Bl, {
		title: n("shipping.toolsTitle"),
		children: /* @__PURE__ */ y("p", {
			className: "text-muted-foreground text-sm",
			children: n("common.loading")
		})
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/TransportHubPage.tsx
var Bu = [
	{
		to: "/settings/shop/transport/packaging",
		sectionKey: "packaging",
		title: "shipping.packagingTitle",
		hint: "shipping.packagingCardHint",
		cta: "shipping.openPackaging"
	},
	{
		to: "/settings/shop/transport/tapin",
		sectionKey: "tapin",
		title: "tapin.hubCardTitle",
		hint: "tapin.hubCardHint",
		cta: "tapin.openSettings"
	},
	{
		to: "/settings/shop/transport/tapin/ops",
		title: "tapin.opsTitle",
		hint: "tapin.opsHint",
		cta: "tapin.openOps"
	},
	{
		to: "/settings/shop/transport/tapin/finance",
		title: "tapin.financeTitle",
		hint: "tapin.financeHint",
		cta: "tapin.openFinance"
	},
	{
		to: "/settings/shop/transport/tapin/catalog",
		title: "tapin.catalogTitle",
		hint: "tapin.catalogHint",
		cta: "tapin.openCatalog"
	},
	{
		to: "/settings/shop/transport/tools",
		sectionKey: "tools",
		title: "shipping.toolsTitle",
		hint: "shipping.toolsCardHint",
		cta: "shipping.openTools"
	},
	{
		to: "/settings/shop/transport/cities",
		sectionKey: "cities",
		title: "shipping.citiesTitle",
		hint: "shipping.citiesCardHint",
		cta: "shipping.openCities"
	},
	{
		to: "/settings/shop/transport/map",
		sectionKey: "map",
		title: "shipping.mapTitle",
		hint: "shipping.mapCardHint",
		cta: "shipping.openMap"
	},
	{
		to: "/settings/shop/transport/rules",
		sectionKey: "rules",
		title: "shipping.rulesTitle",
		hint: "shipping.rulesCardHint",
		cta: "shipping.openRules"
	},
	{
		to: "/settings/shop/transport/item-cost",
		sectionKey: "item_cost",
		title: "shipping.itemCost.title",
		hint: "shipping.itemCost.cardHint",
		cta: "shipping.itemCost.open"
	},
	{
		to: "/settings/shop/shipping",
		title: "shipping.zonesTitle",
		hint: "shipping.zonesHint",
		cta: "shipping.openZones",
		secondary: !0
	}
];
function Vu() {
	let { t: r } = m(), i = n(), a = t({
		queryKey: ["shipping-hub-status"],
		queryFn: () => Z("shipping/hub/status")
	}), o = e({
		mutationFn: (e) => Z("shipping/hub/toggle", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(e)
		}),
		onSuccess: (e) => {
			i.setQueryData(["shipping-hub-status"], e), i.invalidateQueries({ queryKey: ["shop-locations-states"] }), h.success(r("common.saved"));
		},
		onError: (e) => yl(r, e)
	}), s = a.data?.sections;
	return /* @__PURE__ */ b(Bl, {
		title: r("shipping.hubTitle"),
		children: [/* @__PURE__ */ y("p", {
			className: "text-muted-foreground mb-4 text-sm",
			children: r("shipping.hubHint")
		}), /* @__PURE__ */ y("div", {
			className: "grid gap-4 md:grid-cols-2",
			children: Bu.map((e) => {
				let t = e.sectionKey && s ? !!s[e.sectionKey] : null;
				return /* @__PURE__ */ b(G, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ y(K, {
						className: "pb-2",
						children: /* @__PURE__ */ b("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ b("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ b("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ y(q, {
										className: "text-base",
										children: r(e.title)
									}), e.sectionKey && t !== null ? /* @__PURE__ */ y(pu, {
										variant: t ? "default" : "secondary",
										children: r(t ? "shipping.statusOn" : "shipping.statusOff")
									}) : null]
								}), /* @__PURE__ */ y(Rc, { children: r(e.hint) })]
							}), e.sectionKey ? /* @__PURE__ */ y($, {
								"aria-label": r(e.title),
								checked: !!t,
								disabled: o.isPending || !s,
								onCheckedChange: (t) => e.sectionKey && void o.mutate({
									section: e.sectionKey,
									enabled: t
								})
							}) : null]
						})
					}), /* @__PURE__ */ y(J, { children: /* @__PURE__ */ y(W, {
						asChild: !0,
						variant: e.secondary ? "secondary" : "default",
						children: /* @__PURE__ */ y(x, {
							to: e.to,
							children: r(e.cta)
						})
					}) })]
				}, e.to);
			})
		})]
	});
}
//#endregion
//#region ../Modules/shipping-module/client/module-entry.tsx
var Hu = {
	"settings/shop/transport": Vu,
	"settings/shop/transport/packaging": Mu,
	"settings/shop/transport/tools": zu,
	"settings/shop/transport/cities": du,
	"settings/shop/transport/map": Au,
	"settings/shop/transport/rules": Lu,
	"settings/shop/transport/item-cost": ku
}, Uu = {
	OrderPackagingPanel: zl,
	OrderMapPanel: wl
}, Wu = {
	routes: Hu,
	components: Uu
};
//#endregion
export { Uu as components, Wu as default, Hu as routes };
