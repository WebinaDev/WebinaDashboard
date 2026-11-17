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
var F = Object.freeze({
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
}), re = "VisuallyHidden", ie = r.forwardRef((e, t) => /* @__PURE__ */ y(P.span, {
	...e,
	ref: t,
	style: {
		...F,
		...e.style
	}
}));
ie.displayName = re;
//#endregion
//#region node_modules/@radix-ui/react-context/dist/index.mjs
function I(e, t = []) {
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
	return a.scopeName = e, [i, L(a, ...t)];
}
function L(...e) {
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
function ae(e) {
	let t = /* @__PURE__ */ oe(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(se);
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
			let e = le(n), a = ce(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? D(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var R = Symbol("radix.slottable");
function se(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === R;
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
function ue(e) {
	let t = e + "CollectionProvider", [n, r] = I(t), [a, o] = n(t, {
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
	let c = e + "CollectionSlot", l = /* @__PURE__ */ ae(c), u = i.forwardRef((e, t) => {
		let { scope: n, children: r } = e;
		return /* @__PURE__ */ y(l, {
			ref: O(t, o(c, n).collectionRef),
			children: r
		});
	});
	u.displayName = c;
	let d = e + "CollectionItemSlot", f = "data-radix-collection-item", p = /* @__PURE__ */ ae(d), m = i.forwardRef((e, t) => {
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
function z(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var de = globalThis?.document ? r.useLayoutEffect : () => {}, fe = r.useInsertionEffect || de;
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
//#region node_modules/@radix-ui/react-id/dist/index.mjs
var ge = r.useId || (() => void 0), _e = 0;
function ve(e) {
	let [t, n] = r.useState(ge());
	return de(() => {
		e || n((e) => e ?? String(_e++));
	}, [e]), e || (t ? `radix-${t}` : "");
}
//#endregion
//#region node_modules/@radix-ui/react-direction/dist/index.mjs
var ye = r.createContext(void 0);
function be(e) {
	let t = r.useContext(ye);
	return e || t || "ltr";
}
//#endregion
//#region node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
function xe(e) {
	let t = r.useRef(e);
	return r.useEffect(() => {
		t.current = e;
	}), r.useMemo(() => (...e) => t.current?.(...e), []);
}
//#endregion
//#region node_modules/@radix-ui/react-use-escape-keydown/dist/index.mjs
function Se(e, t = globalThis?.document) {
	let n = xe(e);
	r.useEffect(() => {
		let e = (e) => {
			e.key === "Escape" && n(e);
		};
		return t.addEventListener("keydown", e, { capture: !0 }), () => t.removeEventListener("keydown", e, { capture: !0 });
	}, [n, t]);
}
//#endregion
//#region node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var Ce = "DismissableLayer", we = "dismissableLayer.update", Te = "dismissableLayer.pointerDownOutside", Ee = "dismissableLayer.focusOutside", De, Oe = r.createContext({
	layers: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), ke = r.forwardRef((e, t) => {
	let { disableOutsidePointerEvents: n = !1, onEscapeKeyDown: i, onPointerDownOutside: a, onFocusOutside: o, onInteractOutside: s, onDismiss: c, ...l } = e, u = r.useContext(Oe), [d, f] = r.useState(null), p = d?.ownerDocument ?? globalThis?.document, [, m] = r.useState({}), h = O(t, (e) => f(e)), g = Array.from(u.layers), [_] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1), v = g.indexOf(_), b = d ? g.indexOf(d) : -1, x = u.layersWithOutsidePointerEventsDisabled.size > 0, S = b >= v, C = Me((e) => {
		let t = e.target, n = [...u.branches].some((e) => e.contains(t));
		!S || n || (a?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p), w = Ne((e) => {
		let t = e.target;
		[...u.branches].some((e) => e.contains(t)) || (o?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p);
	return Se((e) => {
		b === u.layers.size - 1 && (i?.(e), !e.defaultPrevented && c && (e.preventDefault(), c()));
	}, p), r.useEffect(() => {
		if (d) return n && (u.layersWithOutsidePointerEventsDisabled.size === 0 && (De = p.body.style.pointerEvents, p.body.style.pointerEvents = "none"), u.layersWithOutsidePointerEventsDisabled.add(d)), u.layers.add(d), Pe(), () => {
			n && u.layersWithOutsidePointerEventsDisabled.size === 1 && (p.body.style.pointerEvents = De);
		};
	}, [
		d,
		p,
		n,
		u
	]), r.useEffect(() => () => {
		d && (u.layers.delete(d), u.layersWithOutsidePointerEventsDisabled.delete(d), Pe());
	}, [d, u]), r.useEffect(() => {
		let e = () => m({});
		return document.addEventListener(we, e), () => document.removeEventListener(we, e);
	}, []), /* @__PURE__ */ y(P.div, {
		...l,
		ref: h,
		style: {
			pointerEvents: x ? S ? "auto" : "none" : void 0,
			...e.style
		},
		onFocusCapture: z(e.onFocusCapture, w.onFocusCapture),
		onBlurCapture: z(e.onBlurCapture, w.onBlurCapture),
		onPointerDownCapture: z(e.onPointerDownCapture, C.onPointerDownCapture)
	});
});
ke.displayName = Ce;
var Ae = "DismissableLayerBranch", je = r.forwardRef((e, t) => {
	let n = r.useContext(Oe), i = r.useRef(null), a = O(t, i);
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
je.displayName = Ae;
function Me(e, t = globalThis?.document) {
	let n = xe(e), i = r.useRef(!1), a = r.useRef(() => {});
	return r.useEffect(() => {
		let e = (e) => {
			if (e.target && !i.current) {
				let r = function() {
					Fe(Te, n, i, { discrete: !0 });
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
function Ne(e, t = globalThis?.document) {
	let n = xe(e), i = r.useRef(!1);
	return r.useEffect(() => {
		let e = (e) => {
			e.target && !i.current && Fe(Ee, n, { originalEvent: e }, { discrete: !1 });
		};
		return t.addEventListener("focusin", e), () => t.removeEventListener("focusin", e);
	}, [t, n]), {
		onFocusCapture: () => i.current = !0,
		onBlurCapture: () => i.current = !1
	};
}
function Pe() {
	let e = new CustomEvent(we);
	document.dispatchEvent(e);
}
function Fe(e, t, n, { discrete: r }) {
	let i = n.originalEvent.target, a = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && i.addEventListener(e, t, { once: !0 }), r ? ne(i, a) : i.dispatchEvent(a);
}
//#endregion
//#region node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var Ie = "focusScope.autoFocusOnMount", Le = "focusScope.autoFocusOnUnmount", Re = {
	bubbles: !1,
	cancelable: !0
}, ze = "FocusScope", Be = r.forwardRef((e, t) => {
	let { loop: n = !1, trapped: i = !1, onMountAutoFocus: a, onUnmountAutoFocus: o, ...s } = e, [c, l] = r.useState(null), u = xe(a), d = xe(o), f = r.useRef(null), p = O(t, (e) => l(e)), m = r.useRef({
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
				c.contains(t) ? f.current = t : qe(f.current, { select: !0 });
			}, t = function(e) {
				if (m.paused || !c) return;
				let t = e.relatedTarget;
				t !== null && (c.contains(t) || qe(f.current, { select: !0 }));
			}, n = function(e) {
				if (document.activeElement === document.body) for (let t of e) t.removedNodes.length > 0 && qe(c);
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
			Je.add(m);
			let e = document.activeElement;
			if (!c.contains(e)) {
				let t = new CustomEvent(Ie, Re);
				c.addEventListener(Ie, u), c.dispatchEvent(t), t.defaultPrevented || (Ve(Ze(Ue(c)), { select: !0 }), document.activeElement === e && qe(c));
			}
			return () => {
				c.removeEventListener(Ie, u), setTimeout(() => {
					let t = new CustomEvent(Le, Re);
					c.addEventListener(Le, d), c.dispatchEvent(t), t.defaultPrevented || qe(e ?? document.body, { select: !0 }), c.removeEventListener(Le, d), Je.remove(m);
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
			let t = e.currentTarget, [i, a] = He(t);
			i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n && qe(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n && qe(a, { select: !0 })) : r === t && e.preventDefault();
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
Be.displayName = ze;
function Ve(e, { select: t = !1 } = {}) {
	let n = document.activeElement;
	for (let r of e) if (qe(r, { select: t }), document.activeElement !== n) return;
}
function He(e) {
	let t = Ue(e);
	return [We(t, e), We(t.reverse(), e)];
}
function Ue(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t;
}
function We(e, t) {
	for (let n of e) if (!Ge(n, { upTo: t })) return n;
}
function Ge(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function Ke(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function qe(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = document.activeElement;
		e.focus({ preventScroll: !0 }), e !== n && Ke(e) && t && e.select();
	}
}
var Je = Ye();
function Ye() {
	let e = [];
	return {
		add(t) {
			let n = e[0];
			t !== n && n?.pause(), e = Xe(e, t), e.unshift(t);
		},
		remove(t) {
			e = Xe(e, t), e[0]?.resume();
		}
	};
}
function Xe(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
function Ze(e) {
	return e.filter((e) => e.tagName !== "A");
}
//#endregion
//#region node_modules/@radix-ui/react-portal/dist/index.mjs
var Qe = "Portal", $e = r.forwardRef((e, t) => {
	let { container: n, ...i } = e, [a, o] = r.useState(!1);
	de(() => o(!0), []);
	let s = n || a && globalThis?.document?.body;
	return s ? _.createPortal(/* @__PURE__ */ y(P.div, {
		...i,
		ref: t
	}), s) : null;
});
$e.displayName = Qe;
//#endregion
//#region node_modules/@radix-ui/react-focus-guards/dist/index.mjs
var et = 0;
function tt() {
	r.useEffect(() => {
		let e = document.querySelectorAll("[data-radix-focus-guard]");
		return document.body.insertAdjacentElement("afterbegin", e[0] ?? nt()), document.body.insertAdjacentElement("beforeend", e[1] ?? nt()), et++, () => {
			et === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((e) => e.remove()), et--;
		};
	}, []);
}
function nt() {
	let e = document.createElement("span");
	return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
//#endregion
//#region node_modules/tslib/tslib.es6.mjs
var rt = function() {
	return rt = Object.assign || function(e) {
		for (var t, n = 1, r = arguments.length; n < r; n++) for (var i in t = arguments[n], t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
		return e;
	}, rt.apply(this, arguments);
};
function it(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
function at(e, t, n) {
	if (n || arguments.length === 2) for (var r = 0, i = t.length, a; r < i; r++) (a || !(r in t)) && (a || (a = Array.prototype.slice.call(t, 0, r)), a[r] = t[r]);
	return e.concat(a || Array.prototype.slice.call(t));
}
//#endregion
//#region node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var ot = "right-scroll-bar-position", st = "width-before-scroll-bar", ct = "with-scroll-bars-hidden", lt = "--removed-body-scroll-bar-size";
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/assignRef.js
function ut(e, t) {
	return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/useRef.js
function dt(e, t) {
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
var ft = typeof window < "u" ? r.useLayoutEffect : r.useEffect, pt = /* @__PURE__ */ new WeakMap();
function mt(e, t) {
	var n = dt(t || null, function(t) {
		return e.forEach(function(e) {
			return ut(e, t);
		});
	});
	return ft(function() {
		var t = pt.get(n);
		if (t) {
			var r = new Set(t), i = new Set(e), a = n.current;
			r.forEach(function(e) {
				i.has(e) || ut(e, null);
			}), i.forEach(function(e) {
				r.has(e) || ut(e, a);
			});
		}
		pt.set(n, e);
	}, [e]), n;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/medium.js
function ht(e) {
	return e;
}
function gt(e, t) {
	t === void 0 && (t = ht);
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
function _t(e) {
	e === void 0 && (e = {});
	var t = gt(null);
	return t.options = rt({
		async: !0,
		ssr: !1
	}, e), t;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/exports.js
var vt = function(e) {
	var t = e.sideCar, n = it(e, ["sideCar"]);
	if (!t) throw Error("Sidecar: please provide `sideCar` property to import the right car");
	var i = t.read();
	if (!i) throw Error("Sidecar medium not found");
	return r.createElement(i, rt({}, n));
};
vt.isSideCarExport = !0;
function yt(e, t) {
	return e.useMedium(t), vt;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/medium.js
var bt = _t(), xt = function() {}, St = r.forwardRef(function(e, t) {
	var n = r.useRef(null), i = r.useState({
		onScrollCapture: xt,
		onWheelCapture: xt,
		onTouchMoveCapture: xt
	}), a = i[0], o = i[1], s = e.forwardProps, c = e.children, l = e.className, u = e.removeScrollBar, d = e.enabled, f = e.shards, p = e.sideCar, m = e.noRelative, h = e.noIsolation, g = e.inert, _ = e.allowPinchZoom, v = e.as, y = v === void 0 ? "div" : v, b = e.gapMode, x = it(e, [
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
	]), S = p, C = mt([n, t]), w = rt(rt({}, x), a);
	return r.createElement(r.Fragment, null, d && r.createElement(S, {
		sideCar: bt,
		removeScrollBar: u,
		shards: f,
		noRelative: m,
		noIsolation: h,
		inert: g,
		setCallbacks: o,
		allowPinchZoom: !!_,
		lockRef: n,
		gapMode: b
	}), s ? r.cloneElement(r.Children.only(c), rt(rt({}, w), { ref: C })) : r.createElement(y, rt({}, w, {
		className: l,
		ref: C
	}), c));
});
St.defaultProps = {
	enabled: !0,
	removeScrollBar: !0,
	inert: !1
}, St.classNames = {
	fullWidth: st,
	zeroRight: ot
};
//#endregion
//#region node_modules/get-nonce/dist/es2015/index.js
var Ct, wt = function() {
	if (Ct) return Ct;
	if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
//#endregion
//#region node_modules/react-style-singleton/dist/es2015/singleton.js
function Tt() {
	if (!document) return null;
	var e = document.createElement("style");
	e.type = "text/css";
	var t = wt();
	return t && e.setAttribute("nonce", t), e;
}
function Et(e, t) {
	e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function Dt(e) {
	(document.head || document.getElementsByTagName("head")[0]).appendChild(e);
}
var Ot = function() {
	var e = 0, t = null;
	return {
		add: function(n) {
			e == 0 && (t = Tt()) && (Et(t, n), Dt(t)), e++;
		},
		remove: function() {
			e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
		}
	};
}, kt = function() {
	var e = Ot();
	return function(t, n) {
		r.useEffect(function() {
			return e.add(t), function() {
				e.remove();
			};
		}, [t && n]);
	};
}, At = function() {
	var e = kt();
	return function(t) {
		var n = t.styles, r = t.dynamic;
		return e(n, r), null;
	};
}, jt = {
	left: 0,
	top: 0,
	right: 0,
	gap: 0
}, Mt = function(e) {
	return parseInt(e || "", 10) || 0;
}, Nt = function(e) {
	var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
	return [
		Mt(n),
		Mt(r),
		Mt(i)
	];
}, Pt = function(e) {
	if (e === void 0 && (e = "margin"), typeof window > "u") return jt;
	var t = Nt(e), n = document.documentElement.clientWidth, r = window.innerWidth;
	return {
		left: t[0],
		top: t[1],
		right: t[2],
		gap: Math.max(0, r - n + t[2] - t[0])
	};
}, Ft = At(), It = "data-scroll-locked", Lt = function(e, t, n, r) {
	var i = e.left, a = e.top, o = e.right, s = e.gap;
	return n === void 0 && (n = "margin"), `
  .${ct} {
   overflow: hidden ${r};
   padding-right: ${s}px ${r};
  }
  body[${It}] {
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
  
  .${ot} {
    right: ${s}px ${r};
  }
  
  .${st} {
    margin-right: ${s}px ${r};
  }
  
  .${ot} .${ot} {
    right: 0 ${r};
  }
  
  .${st} .${st} {
    margin-right: 0 ${r};
  }
  
  body[${It}] {
    ${lt}: ${s}px;
  }
`;
}, Rt = function() {
	var e = parseInt(document.body.getAttribute("data-scroll-locked") || "0", 10);
	return isFinite(e) ? e : 0;
}, zt = function() {
	r.useEffect(function() {
		return document.body.setAttribute(It, (Rt() + 1).toString()), function() {
			var e = Rt() - 1;
			e <= 0 ? document.body.removeAttribute(It) : document.body.setAttribute(It, e.toString());
		};
	}, []);
}, Bt = function(e) {
	var t = e.noRelative, n = e.noImportant, i = e.gapMode, a = i === void 0 ? "margin" : i;
	zt();
	var o = r.useMemo(function() {
		return Pt(a);
	}, [a]);
	return r.createElement(Ft, { styles: Lt(o, !t, a, n ? "" : "!important") });
}, Vt = !1;
if (typeof window < "u") try {
	var Ht = Object.defineProperty({}, "passive", { get: function() {
		return Vt = !0, !0;
	} });
	window.addEventListener("test", Ht, Ht), window.removeEventListener("test", Ht, Ht);
} catch {
	Vt = !1;
}
var Ut = Vt ? { passive: !1 } : !1, Wt = function(e) {
	return e.tagName === "TEXTAREA";
}, Gt = function(e, t) {
	if (!(e instanceof Element)) return !1;
	var n = window.getComputedStyle(e);
	return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !Wt(e) && n[t] === "visible");
}, Kt = function(e) {
	return Gt(e, "overflowY");
}, qt = function(e) {
	return Gt(e, "overflowX");
}, Jt = function(e, t) {
	var n = t.ownerDocument, r = t;
	do {
		if (typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host), Zt(e, r)) {
			var i = Qt(e, r);
			if (i[1] > i[2]) return !0;
		}
		r = r.parentNode;
	} while (r && r !== n.body);
	return !1;
}, Yt = function(e) {
	return [
		e.scrollTop,
		e.scrollHeight,
		e.clientHeight
	];
}, Xt = function(e) {
	return [
		e.scrollLeft,
		e.scrollWidth,
		e.clientWidth
	];
}, Zt = function(e, t) {
	return e === "v" ? Kt(t) : qt(t);
}, Qt = function(e, t) {
	return e === "v" ? Yt(t) : Xt(t);
}, $t = function(e, t) {
	return e === "h" && t === "rtl" ? -1 : 1;
}, en = function(e, t, n, r, i) {
	var a = $t(e, window.getComputedStyle(t).direction), o = a * r, s = n.target, c = t.contains(s), l = !1, u = o > 0, d = 0, f = 0;
	do {
		if (!s) break;
		var p = Qt(e, s), m = p[0], h = p[1] - p[2] - a * m;
		(m || h) && Zt(e, s) && (d += h, f += m);
		var g = s.parentNode;
		s = g && g.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? g.host : g;
	} while (!c && s !== document.body || c && (t.contains(s) || t === s));
	return (u && (i && Math.abs(d) < 1 || !i && o > d) || !u && (i && Math.abs(f) < 1 || !i && -o > f)) && (l = !0), l;
}, tn = function(e) {
	return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, nn = function(e) {
	return [e.deltaX, e.deltaY];
}, rn = function(e) {
	return e && "current" in e ? e.current : e;
}, an = function(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}, on = function(e) {
	return `
  .block-interactivity-${e} {pointer-events: none;}
  .allow-interactivity-${e} {pointer-events: all;}
`;
}, sn = 0, cn = [];
function ln(e) {
	var t = r.useRef([]), n = r.useRef([0, 0]), i = r.useRef(), a = r.useState(sn++)[0], o = r.useState(At)[0], s = r.useRef(e);
	r.useEffect(function() {
		s.current = e;
	}, [e]), r.useEffect(function() {
		if (e.inert) {
			document.body.classList.add(`block-interactivity-${a}`);
			var t = at([e.lockRef.current], (e.shards || []).map(rn), !0).filter(Boolean);
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
		var r = tn(e), a = n.current, o = "deltaX" in e ? e.deltaX : a[0] - r[0], c = "deltaY" in e ? e.deltaY : a[1] - r[1], l, u = e.target, d = Math.abs(o) > Math.abs(c) ? "h" : "v";
		if ("touches" in e && d === "h" && u.type === "range") return !1;
		var f = window.getSelection(), p = f && f.anchorNode;
		if (p && (p === u || p.contains(u))) return !1;
		var m = Jt(d, u);
		if (!m) return !0;
		if (m ? l = d : (l = d === "v" ? "h" : "v", m = Jt(d, u)), !m) return !1;
		if (!i.current && "changedTouches" in e && (o || c) && (i.current = l), !l) return !0;
		var h = i.current || l;
		return en(h, t, e, h === "h" ? o : c, !0);
	}, []), l = r.useCallback(function(e) {
		var n = e;
		if (!(!cn.length || cn[cn.length - 1] !== o)) {
			var r = "deltaY" in n ? nn(n) : tn(n), i = t.current.filter(function(e) {
				return e.name === n.type && (e.target === n.target || n.target === e.shadowParent) && an(e.delta, r);
			})[0];
			if (i && i.should) {
				n.cancelable && n.preventDefault();
				return;
			}
			if (!i) {
				var a = (s.current.shards || []).map(rn).filter(Boolean).filter(function(e) {
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
			shadowParent: un(r)
		};
		t.current.push(a), setTimeout(function() {
			t.current = t.current.filter(function(e) {
				return e !== a;
			});
		}, 1);
	}, []), d = r.useCallback(function(e) {
		n.current = tn(e), i.current = void 0;
	}, []), f = r.useCallback(function(t) {
		u(t.type, nn(t), t.target, c(t, e.lockRef.current));
	}, []), p = r.useCallback(function(t) {
		u(t.type, tn(t), t.target, c(t, e.lockRef.current));
	}, []);
	r.useEffect(function() {
		return cn.push(o), e.setCallbacks({
			onScrollCapture: f,
			onWheelCapture: f,
			onTouchMoveCapture: p
		}), document.addEventListener("wheel", l, Ut), document.addEventListener("touchmove", l, Ut), document.addEventListener("touchstart", d, Ut), function() {
			cn = cn.filter(function(e) {
				return e !== o;
			}), document.removeEventListener("wheel", l, Ut), document.removeEventListener("touchmove", l, Ut), document.removeEventListener("touchstart", d, Ut);
		};
	}, []);
	var m = e.removeScrollBar, h = e.inert;
	return r.createElement(r.Fragment, null, h ? r.createElement(o, { styles: on(a) }) : null, m ? r.createElement(Bt, {
		noRelative: e.noRelative,
		gapMode: e.gapMode
	}) : null);
}
function un(e) {
	for (var t = null; e !== null;) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
	return t;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/sidecar.js
var dn = yt(bt, ln), fn = r.forwardRef(function(e, t) {
	return r.createElement(St, rt({}, e, {
		ref: t,
		sideCar: dn
	}));
});
fn.classNames = St.classNames;
//#endregion
//#region src/lib/remove-scroll-gate.tsx
var pn = r.createContext(!1);
function mn({ allowBodyScroll: e, children: t }) {
	return /* @__PURE__ */ y(pn.Provider, {
		value: e,
		children: t
	});
}
function hn() {
	return r.useContext(pn);
}
//#endregion
//#region src/lib/react-remove-scroll-shim.tsx
var gn = r.forwardRef(function(e, t) {
	let n = hn() ? !1 : e.enabled !== !1;
	return /* @__PURE__ */ y(fn, {
		...e,
		ref: t,
		enabled: n
	});
});
gn.classNames = fn.classNames;
//#endregion
//#region node_modules/aria-hidden/dist/es2015/index.js
var _n = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, vn = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), bn = {}, xn = 0, Sn = function(e) {
	return e && (e.host || Sn(e.parentNode));
}, Cn = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = Sn(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, wn = function(e, t, n, r) {
	var i = Cn(t, Array.isArray(e) ? e : [e]);
	bn[n] || (bn[n] = /* @__PURE__ */ new WeakMap());
	var a = bn[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		!e || s.has(e) || (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		!e || c.has(e) || Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (vn.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				vn.set(e, c), a.set(e, l), o.push(e), c === 1 && i && yn.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), xn++, function() {
		o.forEach(function(e) {
			var t = vn.get(e) - 1, i = a.get(e) - 1;
			vn.set(e, t), a.set(e, i), t || (yn.has(e) || e.removeAttribute(r), yn.delete(e)), i || e.removeAttribute(n);
		}), xn--, xn || (vn = /* @__PURE__ */ new WeakMap(), vn = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), bn = {});
	};
}, Tn = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || _n(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), wn(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function En(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function Dn(e) {
	let [t, n] = r.useState(void 0);
	return de(() => {
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
var On = [
	"top",
	"right",
	"bottom",
	"left"
], kn = Math.min, An = Math.max, jn = Math.round, Mn = Math.floor, Nn = (e) => ({
	x: e,
	y: e
}), Pn = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function Fn(e, t, n) {
	return An(e, kn(t, n));
}
function In(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function Ln(e) {
	return e.split("-")[0];
}
function Rn(e) {
	return e.split("-")[1];
}
function zn(e) {
	return e === "x" ? "y" : "x";
}
function Bn(e) {
	return e === "y" ? "height" : "width";
}
function Vn(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function Hn(e) {
	return zn(Vn(e));
}
function Un(e, t, n) {
	n === void 0 && (n = !1);
	let r = Rn(e), i = Hn(e), a = Bn(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = Qn(o)), [o, Qn(o)];
}
function Wn(e) {
	let t = Qn(e);
	return [
		Gn(e),
		t,
		Gn(t)
	];
}
function Gn(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var Kn = ["left", "right"], qn = ["right", "left"], Jn = ["top", "bottom"], Yn = ["bottom", "top"];
function Xn(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? qn : Kn : t ? Kn : qn;
		case "left":
		case "right": return t ? Jn : Yn;
		default: return [];
	}
}
function Zn(e, t, n, r) {
	let i = Rn(e), a = Xn(Ln(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(Gn)))), a;
}
function Qn(e) {
	let t = Ln(e);
	return Pn[t] + e.slice(t.length);
}
function $n(e) {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...e
	};
}
function er(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : $n(e);
}
function tr(e) {
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
function nr(e, t, n) {
	let { reference: r, floating: i } = e, a = Vn(t), o = Hn(t), s = Bn(o), c = Ln(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	switch (Rn(t)) {
		case "start":
			p[o] -= f * (n && l ? -1 : 1);
			break;
		case "end":
			p[o] += f * (n && l ? -1 : 1);
			break;
	}
	return p;
}
async function rr(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = In(t, e), p = er(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = tr(await i.getClippingRect({
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
	}, y = tr(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var ir = 50, ar = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: rr
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = nr(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < ir && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = nr(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, or = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = In(e, t) || {};
		if (l == null) return {};
		let d = er(u), f = {
			x: n,
			y: r
		}, p = Hn(i), m = Bn(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = kn(d[_], T), ee = kn(d[v], T), D = E, O = C - h[m] - ee, k = C / 2 - h[m] / 2 + w, A = Fn(D, k, O), j = !c.arrow && Rn(i) != null && k !== A && a.reference[m] / 2 - (k < D ? E : ee) - h[m] / 2 < 0, M = j ? k < D ? k - D : k - O : 0;
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
}), sr = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = In(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = Ln(r), _ = Vn(o), v = Ln(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [Qn(o)] : Wn(o)), x = p !== "none";
			!d && x && b.push(...Zn(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = Un(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (!(u === "alignment" && _ !== Vn(t)) || T.every((e) => Vn(e.placement) === _ ? e.overflows[0] > 0 : !0))) return {
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
								let t = Vn(e.placement);
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
function cr(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function lr(e) {
	return On.some((t) => e[t] >= 0);
}
var ur = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = In(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = cr(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: lr(e)
					} };
				}
				case "escaped": {
					let e = cr(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: lr(e)
					} };
				}
				default: return {};
			}
		}
	};
}, dr = /* @__PURE__ */ new Set(["left", "top"]);
async function fr(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = Ln(n), s = Rn(n), c = Vn(n) === "y", l = dr.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = In(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var pr = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await fr(t, e);
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
}, mr = function(e) {
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
			} }, ...l } = In(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = Vn(Ln(i)), p = zn(f), m = u[p], h = u[f];
			if (o) {
				let e = p === "y" ? "top" : "left", t = p === "y" ? "bottom" : "right", n = m + d[e], r = m - d[t];
				m = Fn(n, m, r);
			}
			if (s) {
				let e = f === "y" ? "top" : "left", t = f === "y" ? "bottom" : "right", n = h + d[e], r = h - d[t];
				h = Fn(n, h, r);
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
}, hr = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = In(e, t), u = {
				x: n,
				y: r
			}, d = Vn(i), f = zn(d), p = u[f], m = u[d], h = In(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = dr.has(Ln(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, gr = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			var n, r;
			let { placement: i, rects: a, platform: o, elements: s } = t, { apply: c = () => {}, ...l } = In(e, t), u = await o.detectOverflow(t, l), d = Ln(i), f = Rn(i), p = Vn(i) === "y", { width: m, height: h } = a.floating, g, _;
			d === "top" || d === "bottom" ? (g = d, _ = f === (await (o.isRTL == null ? void 0 : o.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (_ = d, g = f === "end" ? "top" : "bottom");
			let v = h - u.top - u.bottom, y = m - u.left - u.right, b = kn(h - u[g], v), x = kn(m - u[_], y), S = !t.middlewareData.shift, C = b, w = x;
			if ((n = t.middlewareData.shift) != null && n.enabled.x && (w = y), (r = t.middlewareData.shift) != null && r.enabled.y && (C = v), S && !f) {
				let e = An(u.left, 0), t = An(u.right, 0), n = An(u.top, 0), r = An(u.bottom, 0);
				p ? w = m - 2 * (e !== 0 || t !== 0 ? e + t : An(u.left, u.right)) : C = h - 2 * (n !== 0 || r !== 0 ? n + r : An(u.top, u.bottom));
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
function _r() {
	return typeof window < "u";
}
function vr(e) {
	return xr(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function yr(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function br(e) {
	return ((xr(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function xr(e) {
	return _r() ? e instanceof Node || e instanceof yr(e).Node : !1;
}
function Sr(e) {
	return _r() ? e instanceof Element || e instanceof yr(e).Element : !1;
}
function Cr(e) {
	return _r() ? e instanceof HTMLElement || e instanceof yr(e).HTMLElement : !1;
}
function wr(e) {
	return !_r() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof yr(e).ShadowRoot;
}
function Tr(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = Ir(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function Er(e) {
	return /^(table|td|th)$/.test(vr(e));
}
function Dr(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var Or = /transform|translate|scale|rotate|perspective|filter/, kr = /paint|layout|strict|content/, Ar = (e) => !!e && e !== "none", jr;
function Mr(e) {
	let t = Sr(e) ? Ir(e) : e;
	return Ar(t.transform) || Ar(t.translate) || Ar(t.scale) || Ar(t.rotate) || Ar(t.perspective) || !Pr() && (Ar(t.backdropFilter) || Ar(t.filter)) || Or.test(t.willChange || "") || kr.test(t.contain || "");
}
function Nr(e) {
	let t = Rr(e);
	for (; Cr(t) && !Fr(t);) {
		if (Mr(t)) return t;
		if (Dr(t)) return null;
		t = Rr(t);
	}
	return null;
}
function Pr() {
	return jr ?? (jr = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), jr;
}
function Fr(e) {
	return /^(html|body|#document)$/.test(vr(e));
}
function Ir(e) {
	return yr(e).getComputedStyle(e);
}
function Lr(e) {
	return Sr(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function Rr(e) {
	if (vr(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || wr(e) && e.host || br(e);
	return wr(t) ? t.host : t;
}
function zr(e) {
	let t = Rr(e);
	return Fr(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : Cr(t) && Tr(t) ? t : zr(t);
}
function Br(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = zr(e), i = r === e.ownerDocument?.body, a = yr(r);
	if (i) {
		let e = Vr(a);
		return t.concat(a, a.visualViewport || [], Tr(r) ? r : [], e && n ? Br(e) : []);
	} else return t.concat(r, Br(r, [], n));
}
function Vr(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function Hr(e) {
	let t = Ir(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = Cr(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = jn(n) !== a || jn(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function Ur(e) {
	return Sr(e) ? e : e.contextElement;
}
function Wr(e) {
	let t = Ur(e);
	if (!Cr(t)) return Nn(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = Hr(t), o = (a ? jn(n.width) : n.width) / r, s = (a ? jn(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var Gr = /* @__PURE__ */ Nn(0);
function Kr(e) {
	let t = yr(e);
	return !Pr() || !t.visualViewport ? Gr : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function qr(e, t, n) {
	return t === void 0 && (t = !1), !n || t && n !== yr(e) ? !1 : t;
}
function Jr(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = Ur(e), o = Nn(1);
	t && (r ? Sr(r) && (o = Wr(r)) : o = Wr(e));
	let s = qr(a, n, r) ? Kr(a) : Nn(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a) {
		let e = yr(a), t = r && Sr(r) ? yr(r) : r, n = e, i = Vr(n);
		for (; i && r && t !== n;) {
			let e = Wr(i), t = i.getBoundingClientRect(), r = Ir(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = yr(i), i = Vr(n);
		}
	}
	return tr({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function Yr(e, t) {
	let n = Lr(e).scrollLeft;
	return t ? t.left + n : Jr(br(e)).left + n;
}
function Xr(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - Yr(e, n),
		y: n.top + t.scrollTop
	};
}
function Zr(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = br(r), s = t ? Dr(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = Nn(1), u = Nn(0), d = Cr(r);
	if ((d || !d && !a) && ((vr(r) !== "body" || Tr(o)) && (c = Lr(r)), d)) {
		let e = Jr(r);
		l = Wr(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? Xr(o, c) : Nn(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function Qr(e) {
	return Array.from(e.getClientRects());
}
function $r(e) {
	let t = br(e), n = Lr(e), r = e.ownerDocument.body, i = An(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), a = An(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight), o = -n.scrollLeft + Yr(e), s = -n.scrollTop;
	return Ir(r).direction === "rtl" && (o += An(t.clientWidth, r.clientWidth) - i), {
		width: i,
		height: a,
		x: o,
		y: s
	};
}
var ei = 25;
function ti(e, t) {
	let n = yr(e), r = br(e), i = n.visualViewport, a = r.clientWidth, o = r.clientHeight, s = 0, c = 0;
	if (i) {
		a = i.width, o = i.height;
		let e = Pr();
		(!e || e && t === "fixed") && (s = i.offsetLeft, c = i.offsetTop);
	}
	let l = Yr(r);
	if (l <= 0) {
		let e = r.ownerDocument, t = e.body, n = getComputedStyle(t), i = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, o = Math.abs(r.clientWidth - t.clientWidth - i);
		o <= ei && (a -= o);
	} else l <= ei && (a += l);
	return {
		width: a,
		height: o,
		x: s,
		y: c
	};
}
function ni(e, t) {
	let n = Jr(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = Cr(e) ? Wr(e) : Nn(1);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function ri(e, t, n) {
	let r;
	if (t === "viewport") r = ti(e, n);
	else if (t === "document") r = $r(br(e));
	else if (Sr(t)) r = ni(t, n);
	else {
		let n = Kr(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return tr(r);
}
function ii(e, t) {
	let n = Rr(e);
	return n === t || !Sr(n) || Fr(n) ? !1 : Ir(n).position === "fixed" || ii(n, t);
}
function ai(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = Br(e, [], !1).filter((e) => Sr(e) && vr(e) !== "body"), i = null, a = Ir(e).position === "fixed", o = a ? Rr(e) : e;
	for (; Sr(o) && !Fr(o);) {
		let t = Ir(o), n = Mr(o);
		!n && t.position === "fixed" && (i = null), (a ? !n && !i : !n && t.position === "static" && i && (i.position === "absolute" || i.position === "fixed") || Tr(o) && !n && ii(e, o)) ? r = r.filter((e) => e !== o) : i = t, o = Rr(o);
	}
	return t.set(e, r), r;
}
function oi(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? Dr(t) ? [] : ai(t, this._c) : [].concat(n), r], o = ri(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = ri(t, a[e], i);
		s = An(n.top, s), c = kn(n.right, c), l = kn(n.bottom, l), u = An(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function si(e) {
	let { width: t, height: n } = Hr(e);
	return {
		width: t,
		height: n
	};
}
function ci(e, t, n) {
	let r = Cr(t), i = br(t), a = n === "fixed", o = Jr(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = Nn(0);
	function l() {
		c.x = Yr(i);
	}
	if (r || !r && !a) if ((vr(t) !== "body" || Tr(i)) && (s = Lr(t)), r) {
		let e = Jr(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	} else i && l();
	a && !r && i && l();
	let u = i && !r && !a ? Xr(i, s) : Nn(0);
	return {
		x: o.left + s.scrollLeft - c.x - u.x,
		y: o.top + s.scrollTop - c.y - u.y,
		width: o.width,
		height: o.height
	};
}
function li(e) {
	return Ir(e).position === "static";
}
function ui(e, t) {
	if (!Cr(e) || Ir(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return br(e) === n && (n = n.ownerDocument.body), n;
}
function di(e, t) {
	let n = yr(e);
	if (Dr(e)) return n;
	if (!Cr(e)) {
		let t = Rr(e);
		for (; t && !Fr(t);) {
			if (Sr(t) && !li(t)) return t;
			t = Rr(t);
		}
		return n;
	}
	let r = ui(e, t);
	for (; r && Er(r) && li(r);) r = ui(r, t);
	return r && Fr(r) && li(r) && !Mr(r) ? n : r || Nr(e) || n;
}
var fi = async function(e) {
	let t = this.getOffsetParent || di, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: ci(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function pi(e) {
	return Ir(e).direction === "rtl";
}
var mi = {
	convertOffsetParentRelativeRectToViewportRelativeRect: Zr,
	getDocumentElement: br,
	getClippingRect: oi,
	getOffsetParent: di,
	getElementRects: fi,
	getClientRects: Qr,
	getDimensions: si,
	getScale: Wr,
	isElement: Sr,
	isRTL: pi
};
function hi(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function gi(e, t) {
	let n = null, r, i = br(e);
	function a() {
		var e;
		clearTimeout(r), (e = n) == null || e.disconnect(), n = null;
	}
	function o(s, c) {
		s === void 0 && (s = !1), c === void 0 && (c = 1), a();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (s || t(), !f || !p) return;
		let m = Mn(d), h = Mn(i.clientWidth - (u + f)), g = Mn(i.clientHeight - (d + p)), _ = Mn(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: An(0, kn(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (n !== c) {
				if (!y) return o();
				n ? o(!1, n) : r = setTimeout(() => {
					o(!1, 1e-7);
				}, 1e3);
			}
			n === 1 && !hi(l, e.getBoundingClientRect()) && o(), y = !1;
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
function _i(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = Ur(e), u = i || a ? [...l ? Br(l) : [], ...t ? Br(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n, { passive: !0 }), a && e.addEventListener("resize", n);
	});
	let d = l && s ? gi(l, n) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? Jr(e) : null;
	c && g();
	function g() {
		let t = Jr(e);
		h && !hi(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var vi = pr, yi = mr, bi = sr, xi = gr, Si = ur, Ci = or, wi = hr, Ti = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = {
		platform: mi,
		...n
	}, a = {
		...i.platform,
		_c: r
	};
	return ar(e, t, {
		...i,
		platform: a
	});
}, Ei = typeof document < "u" ? u : function() {};
function Di(e, t) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (typeof e == "function" && e.toString() === t.toString()) return !0;
	let n, r, i;
	if (e && t && typeof e == "object") {
		if (Array.isArray(e)) {
			if (n = e.length, n !== t.length) return !1;
			for (r = n; r-- !== 0;) if (!Di(e[r], t[r])) return !1;
			return !0;
		}
		if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length) return !1;
		for (r = n; r-- !== 0;) if (!{}.hasOwnProperty.call(t, i[r])) return !1;
		for (r = n; r-- !== 0;) {
			let n = i[r];
			if (!(n === "_owner" && e.$$typeof) && !Di(e[n], t[n])) return !1;
		}
		return !0;
	}
	return e !== e && t !== t;
}
function Oi(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function ki(e, t) {
	let n = Oi(e);
	return Math.round(t * n) / n;
}
function Ai(e) {
	let t = r.useRef(e);
	return Ei(() => {
		t.current = e;
	}), t;
}
function ji(e) {
	e === void 0 && (e = {});
	let { placement: t = "bottom", strategy: n = "absolute", middleware: i = [], platform: a, elements: { reference: o, floating: s } = {}, transform: c = !0, whileElementsMounted: l, open: u } = e, [d, f] = r.useState({
		x: 0,
		y: 0,
		strategy: n,
		placement: t,
		middlewareData: {},
		isPositioned: !1
	}), [p, m] = r.useState(i);
	Di(p, i) || m(i);
	let [h, _] = r.useState(null), [v, y] = r.useState(null), b = r.useCallback((e) => {
		e !== w.current && (w.current = e, _(e));
	}, []), x = r.useCallback((e) => {
		e !== T.current && (T.current = e, y(e));
	}, []), S = o || h, C = s || v, w = r.useRef(null), T = r.useRef(null), E = r.useRef(d), ee = l != null, D = Ai(l), O = Ai(a), k = Ai(u), A = r.useCallback(() => {
		if (!w.current || !T.current) return;
		let e = {
			placement: t,
			strategy: n,
			middleware: p
		};
		O.current && (e.platform = O.current), Ti(w.current, T.current, e).then((e) => {
			let t = {
				...e,
				isPositioned: k.current !== !1
			};
			j.current && !Di(E.current, t) && (E.current = t, g.flushSync(() => {
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
	Ei(() => {
		u === !1 && E.current.isPositioned && (E.current.isPositioned = !1, f((e) => ({
			...e,
			isPositioned: !1
		})));
	}, [u]);
	let j = r.useRef(!1);
	Ei(() => (j.current = !0, () => {
		j.current = !1;
	}), []), Ei(() => {
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
		let t = ki(N.floating, d.x), r = ki(N.floating, d.y);
		return c ? {
			...e,
			transform: "translate(" + t + "px, " + r + "px)",
			...Oi(N.floating) >= 1.5 && { willChange: "transform" }
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
var Mi = (e) => {
	function t(e) {
		return {}.hasOwnProperty.call(e, "current");
	}
	return {
		name: "arrow",
		options: e,
		fn(n) {
			let { element: r, padding: i } = typeof e == "function" ? e(n) : e;
			return r && t(r) ? r.current == null ? {} : Ci({
				element: r.current,
				padding: i
			}).fn(n) : r ? Ci({
				element: r,
				padding: i
			}).fn(n) : {};
		}
	};
}, Ni = (e, t) => {
	let n = vi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Pi = (e, t) => {
	let n = yi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Fi = (e, t) => ({
	fn: wi(e).fn,
	options: [e, t]
}), Ii = (e, t) => {
	let n = bi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Li = (e, t) => {
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
	let n = Mi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Bi = "Arrow", Vi = r.forwardRef((e, t) => {
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
Vi.displayName = Bi;
var Hi = Vi, Ui = "Popper", [Wi, Gi] = I(Ui), [Ki, qi] = Wi(Ui), Ji = (e) => {
	let { __scopePopper: t, children: n } = e, [i, a] = r.useState(null);
	return /* @__PURE__ */ y(Ki, {
		scope: t,
		anchor: i,
		onAnchorChange: a,
		children: n
	});
};
Ji.displayName = Ui;
var Yi = "PopperAnchor", Xi = r.forwardRef((e, t) => {
	let { __scopePopper: n, virtualRef: i, ...a } = e, o = qi(Yi, n), s = r.useRef(null), c = O(t, s), l = r.useRef(null);
	return r.useEffect(() => {
		let e = l.current;
		l.current = i?.current || s.current, e !== l.current && o.onAnchorChange(l.current);
	}), i ? null : /* @__PURE__ */ y(P.div, {
		...a,
		ref: c
	});
});
Xi.displayName = Yi;
var Zi = "PopperContent", [Qi, $i] = Wi(Zi), ea = r.forwardRef((e, t) => {
	let { __scopePopper: n, side: i = "bottom", sideOffset: a = 0, align: o = "center", alignOffset: s = 0, arrowPadding: c = 0, avoidCollisions: l = !0, collisionBoundary: u = [], collisionPadding: d = 0, sticky: f = "partial", hideWhenDetached: p = !1, updatePositionStrategy: m = "optimized", onPlaced: h, ...g } = e, _ = qi(Zi, n), [v, b] = r.useState(null), x = O(t, (e) => b(e)), [S, C] = r.useState(null), w = Dn(S), T = w?.width ?? 0, E = w?.height ?? 0, ee = i + (o === "center" ? "" : "-" + o), D = typeof d == "number" ? d : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...d
	}, k = Array.isArray(u) ? u : [u], A = k.length > 0, j = {
		padding: D,
		boundary: k.filter(ia),
		altBoundary: A
	}, { refs: M, floatingStyles: N, placement: te, isPositioned: ne, middlewareData: F } = ji({
		strategy: "fixed",
		placement: ee,
		whileElementsMounted: (...e) => _i(...e, { animationFrame: m === "always" }),
		elements: { reference: _.anchor },
		middleware: [
			Ni({
				mainAxis: a + E,
				alignmentAxis: s
			}),
			l && Pi({
				mainAxis: !0,
				crossAxis: !1,
				limiter: f === "partial" ? Fi() : void 0,
				...j
			}),
			l && Ii({ ...j }),
			Li({
				...j,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--radix-popper-available-width", `${n}px`), o.setProperty("--radix-popper-available-height", `${r}px`), o.setProperty("--radix-popper-anchor-width", `${i}px`), o.setProperty("--radix-popper-anchor-height", `${a}px`);
				}
			}),
			S && zi({
				element: S,
				padding: c
			}),
			aa({
				arrowWidth: T,
				arrowHeight: E
			}),
			p && Ri({
				strategy: "referenceHidden",
				...j
			})
		]
	}), [re, ie] = oa(te), I = xe(h);
	de(() => {
		ne && I?.();
	}, [ne, I]);
	let L = F.arrow?.x, ae = F.arrow?.y, oe = F.arrow?.centerOffset !== 0, [R, se] = r.useState();
	return de(() => {
		v && se(window.getComputedStyle(v).zIndex);
	}, [v]), /* @__PURE__ */ y("div", {
		ref: M.setFloating,
		"data-radix-popper-content-wrapper": "",
		style: {
			...N,
			transform: ne ? N.transform : "translate(0, -200%)",
			minWidth: "max-content",
			zIndex: R,
			"--radix-popper-transform-origin": [F.transformOrigin?.x, F.transformOrigin?.y].join(" "),
			...F.hide?.referenceHidden && {
				visibility: "hidden",
				pointerEvents: "none"
			}
		},
		dir: e.dir,
		children: /* @__PURE__ */ y(Qi, {
			scope: n,
			placedSide: re,
			onArrowChange: C,
			arrowX: L,
			arrowY: ae,
			shouldHideArrow: oe,
			children: /* @__PURE__ */ y(P.div, {
				"data-side": re,
				"data-align": ie,
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
ea.displayName = Zi;
var ta = "PopperArrow", na = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
}, ra = r.forwardRef(function(e, t) {
	let { __scopePopper: n, ...r } = e, i = $i(ta, n), a = na[i.placedSide];
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
		children: /* @__PURE__ */ y(Hi, {
			...r,
			ref: t,
			style: {
				...r.style,
				display: "block"
			}
		})
	});
});
ra.displayName = ta;
function ia(e) {
	return e !== null;
}
var aa = (e) => ({
	name: "transformOrigin",
	options: e,
	fn(t) {
		let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = oa(n), u = {
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
function oa(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
var sa = Ji, ca = Xi, la = ea, ua = ra, da = "Label", fa = r.forwardRef((e, t) => /* @__PURE__ */ y(P.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
fa.displayName = da;
var pa = fa;
//#endregion
//#region node_modules/@radix-ui/number/dist/index.mjs
function ma(e, [t, n]) {
	return Math.min(n, Math.max(t, e));
}
//#endregion
//#region node_modules/@radix-ui/react-select/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function ha(e) {
	let t = /* @__PURE__ */ ga(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(va);
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
function ga(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = ba(n), a = ya(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? D(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var _a = Symbol("radix.slottable");
function va(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === _a;
}
function ya(e, t) {
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
function ba(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-select/dist/index.mjs
var xa = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], Sa = [" ", "Enter"], Ca = "Select", [wa, Ta, Ea] = ue(Ca), [Da, Oa] = I(Ca, [Ea, Gi]), ka = Gi(), [Aa, ja] = Da(Ca), [Ma, Na] = Da(Ca), Pa = (e) => {
	let { __scopeSelect: t, children: n, open: i, defaultOpen: a, onOpenChange: o, value: s, defaultValue: c, onValueChange: l, dir: u, name: d, autoComplete: f, disabled: p, required: m, form: h } = e, g = ka(t), [_, v] = r.useState(null), [x, S] = r.useState(null), [C, w] = r.useState(!1), T = be(u), [E, ee] = pe({
		prop: i,
		defaultProp: a ?? !1,
		onChange: o,
		caller: Ca
	}), [D, O] = pe({
		prop: s,
		defaultProp: c,
		onChange: l,
		caller: Ca
	}), k = r.useRef(null), A = _ ? h || !!_.closest("form") : !0, [j, M] = r.useState(/* @__PURE__ */ new Set()), N = Array.from(j).map((e) => e.props.value).join(";");
	return /* @__PURE__ */ y(sa, {
		...g,
		children: /* @__PURE__ */ b(Aa, {
			required: m,
			scope: t,
			trigger: _,
			onTriggerChange: v,
			valueNode: x,
			onValueNodeChange: S,
			valueNodeHasChildren: C,
			onValueNodeHasChildrenChange: w,
			contentId: ve(),
			value: D,
			onValueChange: O,
			open: E,
			onOpenChange: ee,
			dir: T,
			triggerPointerDownPosRef: k,
			disabled: p,
			children: [/* @__PURE__ */ y(wa.Provider, {
				scope: t,
				children: /* @__PURE__ */ y(Ma, {
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
			}), A ? /* @__PURE__ */ b(Ao, {
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
Pa.displayName = Ca;
var Fa = "SelectTrigger", Ia = r.forwardRef((e, t) => {
	let { __scopeSelect: n, disabled: i = !1, ...a } = e, o = ka(n), s = ja(Fa, n), c = s.disabled || i, l = O(t, s.onTriggerChange), u = Ta(n), d = r.useRef("touch"), [f, p, m] = Mo((e) => {
		let t = u().filter((e) => !e.disabled), n = No(t, e, t.find((e) => e.value === s.value));
		n !== void 0 && s.onValueChange(n.value);
	}), h = (e) => {
		c || (s.onOpenChange(!0), m()), e && (s.triggerPointerDownPosRef.current = {
			x: Math.round(e.pageX),
			y: Math.round(e.pageY)
		});
	};
	return /* @__PURE__ */ y(ca, {
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
			"data-placeholder": jo(s.value) ? "" : void 0,
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
				!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && p(e.key), !(t && e.key === " ") && xa.includes(e.key) && (h(), e.preventDefault());
			})
		})
	});
});
Ia.displayName = Fa;
var La = "SelectValue", Ra = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: r, style: i, children: a, placeholder: o = "", ...s } = e, c = ja(La, n), { onValueNodeHasChildrenChange: l } = c, u = a !== void 0, d = O(t, c.onValueNodeChange);
	return de(() => {
		l(u);
	}, [l, u]), /* @__PURE__ */ y(P.span, {
		...s,
		ref: d,
		style: { pointerEvents: "none" },
		children: jo(c.value) ? /* @__PURE__ */ y(v, { children: o }) : a
	});
});
Ra.displayName = La;
var za = "SelectIcon", Ba = r.forwardRef((e, t) => {
	let { __scopeSelect: n, children: r, ...i } = e;
	return /* @__PURE__ */ y(P.span, {
		"aria-hidden": !0,
		...i,
		ref: t,
		children: r || "▼"
	});
});
Ba.displayName = za;
var Va = "SelectPortal", Ha = (e) => /* @__PURE__ */ y($e, {
	asChild: !0,
	...e
});
Ha.displayName = Va;
var Ua = "SelectContent", Wa = r.forwardRef((e, t) => {
	let n = ja(Ua, e.__scopeSelect), [i, a] = r.useState();
	if (de(() => {
		a(new DocumentFragment());
	}, []), !n.open) {
		let t = i;
		return t ? g.createPortal(/* @__PURE__ */ y(Ka, {
			scope: e.__scopeSelect,
			children: /* @__PURE__ */ y(wa.Slot, {
				scope: e.__scopeSelect,
				children: /* @__PURE__ */ y("div", { children: e.children })
			})
		}), t) : null;
	}
	return /* @__PURE__ */ y(Xa, {
		...e,
		ref: t
	});
});
Wa.displayName = Ua;
var Ga = 10, [Ka, qa] = Da(Ua), Ja = "SelectContentImpl", Ya = /* @__PURE__ */ ha("SelectContent.RemoveScroll"), Xa = r.forwardRef((e, t) => {
	let { __scopeSelect: n, position: i = "item-aligned", onCloseAutoFocus: a, onEscapeKeyDown: o, onPointerDownOutside: s, side: c, sideOffset: l, align: u, alignOffset: d, arrowPadding: f, collisionBoundary: p, collisionPadding: m, sticky: h, hideWhenDetached: g, avoidCollisions: _, ...v } = e, b = ja(Ua, n), [x, S] = r.useState(null), [C, w] = r.useState(null), T = O(t, (e) => S(e)), [E, ee] = r.useState(null), [D, k] = r.useState(null), A = Ta(n), [j, M] = r.useState(!1), N = r.useRef(!1);
	r.useEffect(() => {
		if (x) return Tn(x);
	}, [x]), tt();
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
	let { onOpenChange: ne, triggerPointerDownPosRef: F } = b;
	r.useEffect(() => {
		if (x) {
			let e = {
				x: 0,
				y: 0
			}, t = (t) => {
				e = {
					x: Math.abs(Math.round(t.pageX) - (F.current?.x ?? 0)),
					y: Math.abs(Math.round(t.pageY) - (F.current?.y ?? 0))
				};
			}, n = (n) => {
				e.x <= 10 && e.y <= 10 ? n.preventDefault() : x.contains(n.target) || ne(!1), document.removeEventListener("pointermove", t), F.current = null;
			};
			return F.current !== null && (document.addEventListener("pointermove", t), document.addEventListener("pointerup", n, {
				capture: !0,
				once: !0
			})), () => {
				document.removeEventListener("pointermove", t), document.removeEventListener("pointerup", n, { capture: !0 });
			};
		}
	}, [
		x,
		ne,
		F
	]), r.useEffect(() => {
		let e = () => ne(!1);
		return window.addEventListener("blur", e), window.addEventListener("resize", e), () => {
			window.removeEventListener("blur", e), window.removeEventListener("resize", e);
		};
	}, [ne]);
	let [re, ie] = Mo((e) => {
		let t = A().filter((e) => !e.disabled), n = No(t, e, t.find((e) => e.ref.current === document.activeElement));
		n && setTimeout(() => n.ref.current.focus());
	}), I = r.useCallback((e, t, n) => {
		let r = !N.current && !n;
		(b.value !== void 0 && b.value === t || r) && (ee(e), r && (N.current = !0));
	}, [b.value]), L = r.useCallback(() => x?.focus(), [x]), ae = r.useCallback((e, t, n) => {
		let r = !N.current && !n;
		(b.value !== void 0 && b.value === t || r) && k(e);
	}, [b.value]), oe = i === "popper" ? eo : Qa, R = oe === eo ? {
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
	return /* @__PURE__ */ y(Ka, {
		scope: n,
		content: x,
		viewport: C,
		onViewportChange: w,
		itemRefCallback: I,
		selectedItem: E,
		onItemLeave: L,
		itemTextRefCallback: ae,
		focusSelectedItem: P,
		selectedItemText: D,
		position: i,
		isPositioned: j,
		searchRef: re,
		children: /* @__PURE__ */ y(gn, {
			as: Ya,
			allowPinchZoom: !0,
			children: /* @__PURE__ */ y(Be, {
				asChild: !0,
				trapped: b.open,
				onMountAutoFocus: (e) => {
					e.preventDefault();
				},
				onUnmountAutoFocus: z(a, (e) => {
					b.trigger?.focus({ preventScroll: !0 }), e.preventDefault();
				}),
				children: /* @__PURE__ */ y(ke, {
					asChild: !0,
					disableOutsidePointerEvents: !0,
					onEscapeKeyDown: o,
					onPointerDownOutside: s,
					onFocusOutside: (e) => e.preventDefault(),
					onDismiss: () => b.onOpenChange(!1),
					children: /* @__PURE__ */ y(oe, {
						role: "listbox",
						id: b.contentId,
						"data-state": b.open ? "open" : "closed",
						dir: b.dir,
						onContextMenu: (e) => e.preventDefault(),
						...v,
						...R,
						onPlaced: () => M(!0),
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
Xa.displayName = Ja;
var Za = "SelectItemAlignedPosition", Qa = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onPlaced: i, ...a } = e, o = ja(Ua, n), s = qa(Ua, n), [c, l] = r.useState(null), [u, d] = r.useState(null), f = O(t, (e) => d(e)), p = Ta(n), m = r.useRef(!1), h = r.useRef(!0), { viewport: g, selectedItem: _, selectedItemText: v, focusSelectedItem: b } = s, x = r.useCallback(() => {
		if (o.trigger && o.valueNode && c && u && g && _ && v) {
			let e = o.trigger.getBoundingClientRect(), t = u.getBoundingClientRect(), n = o.valueNode.getBoundingClientRect(), r = v.getBoundingClientRect();
			if (o.dir !== "rtl") {
				let i = r.left - t.left, a = n.left - i, o = e.left - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - Ga, d = ma(a, [Ga, Math.max(Ga, u - l)]);
				c.style.minWidth = s + "px", c.style.left = d + "px";
			} else {
				let i = t.right - r.right, a = window.innerWidth - n.right - i, o = window.innerWidth - e.right - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - Ga, d = ma(a, [Ga, Math.max(Ga, u - l)]);
				c.style.minWidth = s + "px", c.style.right = d + "px";
			}
			let a = p(), s = window.innerHeight - Ga * 2, l = g.scrollHeight, d = window.getComputedStyle(u), f = parseInt(d.borderTopWidth, 10), h = parseInt(d.paddingTop, 10), y = parseInt(d.borderBottomWidth, 10), b = parseInt(d.paddingBottom, 10), x = f + h + l + b + y, S = Math.min(_.offsetHeight * 5, x), C = window.getComputedStyle(g), w = parseInt(C.paddingTop, 10), T = parseInt(C.paddingBottom, 10), E = e.top + e.height / 2 - Ga, ee = s - E, D = _.offsetHeight / 2, O = _.offsetTop + D, k = f + h + O, A = x - k;
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
			c.style.margin = `${Ga}px 0`, c.style.minHeight = S + "px", c.style.maxHeight = s + "px", i?.(), requestAnimationFrame(() => m.current = !0);
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
	de(() => x(), [x]);
	let [S, C] = r.useState();
	return de(() => {
		u && C(window.getComputedStyle(u).zIndex);
	}, [u]), /* @__PURE__ */ y(to, {
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
Qa.displayName = Za;
var $a = "SelectPopperPosition", eo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, align: r = "start", collisionPadding: i = Ga, ...a } = e;
	return /* @__PURE__ */ y(la, {
		...ka(n),
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
eo.displayName = $a;
var [to, no] = Da(Ua, {}), ro = "SelectViewport", io = r.forwardRef((e, t) => {
	let { __scopeSelect: n, nonce: i, ...a } = e, o = qa(ro, n), s = no(ro, n), c = O(t, o.onViewportChange), l = r.useRef(0);
	return /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y("style", {
		dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" },
		nonce: i
	}), /* @__PURE__ */ y(wa.Slot, {
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
			onScroll: z(a.onScroll, (e) => {
				let t = e.currentTarget, { contentWrapper: n, shouldExpandOnScrollRef: r } = s;
				if (r?.current && n) {
					let e = Math.abs(l.current - t.scrollTop);
					if (e > 0) {
						let r = window.innerHeight - Ga * 2, i = parseFloat(n.style.minHeight), a = parseFloat(n.style.height), o = Math.max(i, a);
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
io.displayName = ro;
var ao = "SelectGroup", [oo, so] = Da(ao), co = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = ve();
	return /* @__PURE__ */ y(oo, {
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
co.displayName = ao;
var lo = "SelectLabel", uo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = so(lo, n);
	return /* @__PURE__ */ y(P.div, {
		id: i.id,
		...r,
		ref: t
	});
});
uo.displayName = lo;
var fo = "SelectItem", [po, mo] = Da(fo), ho = r.forwardRef((e, t) => {
	let { __scopeSelect: n, value: i, disabled: a = !1, textValue: o, ...s } = e, c = ja(fo, n), l = qa(fo, n), u = c.value === i, [d, f] = r.useState(o ?? ""), [p, m] = r.useState(!1), h = O(t, (e) => l.itemRefCallback?.(e, i, a)), g = ve(), _ = r.useRef("touch"), v = () => {
		a || (c.onValueChange(i), c.onOpenChange(!1));
	};
	if (i === "") throw Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
	return /* @__PURE__ */ y(po, {
		scope: n,
		value: i,
		disabled: a,
		textId: g,
		isSelected: u,
		onItemTextChange: r.useCallback((e) => {
			f((t) => t || (e?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ y(wa.ItemSlot, {
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
					l.searchRef?.current !== "" && e.key === " " || (Sa.includes(e.key) && v(), e.key === " " && e.preventDefault());
				})
			})
		})
	});
});
ho.displayName = fo;
var go = "SelectItemText", _o = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: i, style: a, ...o } = e, s = ja(go, n), c = qa(go, n), l = mo(go, n), u = Na(go, n), [d, f] = r.useState(null), p = O(t, (e) => f(e), l.onItemTextChange, (e) => c.itemTextRefCallback?.(e, l.value, l.disabled)), m = d?.textContent, h = r.useMemo(() => /* @__PURE__ */ y("option", {
		value: l.value,
		disabled: l.disabled,
		children: m
	}, l.value), [
		l.disabled,
		l.value,
		m
	]), { onNativeOptionAdd: _, onNativeOptionRemove: x } = u;
	return de(() => (_(h), () => x(h)), [
		_,
		x,
		h
	]), /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y(P.span, {
		id: l.textId,
		...o,
		ref: p
	}), l.isSelected && s.valueNode && !s.valueNodeHasChildren ? g.createPortal(o.children, s.valueNode) : null] });
});
_o.displayName = go;
var vo = "SelectItemIndicator", yo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return mo(vo, n).isSelected ? /* @__PURE__ */ y(P.span, {
		"aria-hidden": !0,
		...r,
		ref: t
	}) : null;
});
yo.displayName = vo;
var bo = "SelectScrollUpButton", xo = r.forwardRef((e, t) => {
	let n = qa(bo, e.__scopeSelect), i = no(bo, e.__scopeSelect), [a, o] = r.useState(!1), s = O(t, i.onScrollButtonChange);
	return de(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				o(t.scrollTop > 0);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ y(wo, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop -= t.offsetHeight);
		}
	}) : null;
});
xo.displayName = bo;
var So = "SelectScrollDownButton", Co = r.forwardRef((e, t) => {
	let n = qa(So, e.__scopeSelect), i = no(So, e.__scopeSelect), [a, o] = r.useState(!1), s = O(t, i.onScrollButtonChange);
	return de(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				let e = t.scrollHeight - t.clientHeight;
				o(Math.ceil(t.scrollTop) < e);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ y(wo, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop += t.offsetHeight);
		}
	}) : null;
});
Co.displayName = So;
var wo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onAutoScroll: i, ...a } = e, o = qa("SelectScrollButton", n), s = r.useRef(null), c = Ta(n), l = r.useCallback(() => {
		s.current !== null && (window.clearInterval(s.current), s.current = null);
	}, []);
	return r.useEffect(() => () => l(), [l]), de(() => {
		c().find((e) => e.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
	}, [c]), /* @__PURE__ */ y(P.div, {
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
}), To = "SelectSeparator", Eo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return /* @__PURE__ */ y(P.div, {
		"aria-hidden": !0,
		...r,
		ref: t
	});
});
Eo.displayName = To;
var Do = "SelectArrow", Oo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = ka(n), a = ja(Do, n), o = qa(Do, n);
	return a.open && o.position === "popper" ? /* @__PURE__ */ y(ua, {
		...i,
		...r,
		ref: t
	}) : null;
});
Oo.displayName = Do;
var ko = "SelectBubbleInput", Ao = r.forwardRef(({ __scopeSelect: e, value: t, ...n }, i) => {
	let a = r.useRef(null), o = O(i, a), s = En(t);
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
			...F,
			...n.style
		},
		ref: o,
		defaultValue: t
	});
});
Ao.displayName = ko;
function jo(e) {
	return e === "" || e === void 0;
}
function Mo(e) {
	let t = xe(e), n = r.useRef(""), i = r.useRef(0), a = r.useCallback((e) => {
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
function No(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = Po(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.textValue.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
function Po(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
var Fo = Pa, Io = Ia, Lo = Ra, Ro = Ba, zo = Ha, Bo = Wa, Vo = io, Ho = ho, Uo = _o, Wo = yo, Go = xo, Ko = Co;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function qo(e) {
	let t = /* @__PURE__ */ Yo(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Zo);
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
var Jo = /* @__PURE__ */ qo("Slot");
/* @__NO_SIDE_EFFECTS__ */
function Yo(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = $o(n), a = Qo(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? D(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Xo = Symbol("radix.slottable");
function Zo(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Xo;
}
function Qo(e, t) {
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
function $o(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-switch/dist/index.mjs
var es = "Switch", [ts, ns] = I(es), [rs, is] = ts(es), as = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, name: i, checked: a, defaultChecked: o, required: s, disabled: c, value: l = "on", onCheckedChange: u, form: d, ...f } = e, [p, m] = r.useState(null), h = O(t, (e) => m(e)), g = r.useRef(!1), _ = p ? d || !!p.closest("form") : !0, [v, x] = pe({
		prop: a,
		defaultProp: o ?? !1,
		onChange: u,
		caller: es
	});
	return /* @__PURE__ */ b(rs, {
		scope: n,
		checked: v,
		disabled: c,
		children: [/* @__PURE__ */ y(P.button, {
			type: "button",
			role: "switch",
			"aria-checked": v,
			"aria-required": s,
			"data-state": us(v),
			"data-disabled": c ? "" : void 0,
			disabled: c,
			value: l,
			...f,
			ref: h,
			onClick: z(e.onClick, (e) => {
				x((e) => !e), _ && (g.current = e.isPropagationStopped(), g.current || e.stopPropagation());
			})
		}), _ && /* @__PURE__ */ y(ls, {
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
as.displayName = es;
var os = "SwitchThumb", ss = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, ...r } = e, i = is(os, n);
	return /* @__PURE__ */ y(P.span, {
		"data-state": us(i.checked),
		"data-disabled": i.disabled ? "" : void 0,
		...r,
		ref: t
	});
});
ss.displayName = os;
var cs = "SwitchBubbleInput", ls = r.forwardRef(({ __scopeSwitch: e, control: t, checked: n, bubbles: i = !0, ...a }, o) => {
	let s = r.useRef(null), c = O(s, o), l = En(n), u = Dn(t);
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
ls.displayName = cs;
function us(e) {
	return e ? "checked" : "unchecked";
}
var ds = as, fs = ss, ps = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, ms = (e, t) => ({
	classGroupId: e,
	validator: t
}), hs = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), gs = "-", _s = [], vs = "arbitrary..", ys = (e) => {
	let t = Ss(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return xs(e);
			let n = e.split(gs);
			return bs(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? ps(i, t) : t : i || _s;
			}
			return n[e] || _s;
		}
	};
}, bs = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = bs(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(gs) : e.slice(t).join(gs), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, xs = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? vs + r : void 0;
})(), Ss = (e) => {
	let { theme: t, classGroups: n } = e;
	return Cs(n, t);
}, Cs = (e, t) => {
	let n = hs();
	for (let r in e) {
		let i = e[r];
		ws(i, n, r, t);
	}
	return n;
}, ws = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		Ts(i, t, n, r);
	}
}, Ts = (e, t, n, r) => {
	if (typeof e == "string") {
		Es(e, t, n);
		return;
	}
	if (typeof e == "function") {
		Ds(e, t, n, r);
		return;
	}
	Os(e, t, n, r);
}, Es = (e, t, n) => {
	let r = e === "" ? t : ks(t, e);
	r.classGroupId = n;
}, Ds = (e, t, n, r) => {
	if (As(e)) {
		ws(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(ms(n, e));
}, Os = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		ws(o, ks(t, a), n, r);
	}
}, ks = (e, t) => {
	let n = e, r = t.split(gs), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = hs(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, As = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, js = (e) => {
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
}, Ms = "!", Ns = ":", Ps = [], Fs = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), Is = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === Ns) {
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
		s.endsWith(Ms) ? (c = s.slice(0, -1), l = !0) : s.startsWith(Ms) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return Fs(t, l, c, u);
	};
	if (t) {
		let e = t + Ns, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : Fs(Ps, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, Ls = (e) => {
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
}, Rs = (e) => ({
	cache: js(e.cacheSize),
	parseClassName: Is(e),
	sortModifiers: Ls(e),
	...ys(e)
}), zs = /\s+/, Bs = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(zs), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + Ms : g, v = _ + h;
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
}, Vs = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = Hs(n)) && (i && (i += " "), i += r);
	return i;
}, Hs = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = Hs(e[r])) && (n && (n += " "), n += t);
	return n;
}, Us = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = Rs(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = Bs(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(Vs(...e));
}, Ws = [], B = (e) => {
	let t = (t) => t[e] || Ws;
	return t.isThemeGetter = !0, t;
}, Gs = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Ks = /^\((?:(\w[\w-]*):)?(.+)\)$/i, qs = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, Js = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Ys = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Xs = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, Zs = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Qs = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, $s = (e) => qs.test(e), V = (e) => !!e && !Number.isNaN(Number(e)), ec = (e) => !!e && Number.isInteger(Number(e)), tc = (e) => e.endsWith("%") && V(e.slice(0, -1)), nc = (e) => Js.test(e), rc = () => !0, ic = (e) => Ys.test(e) && !Xs.test(e), ac = () => !1, oc = (e) => Zs.test(e), sc = (e) => Qs.test(e), cc = (e) => !H(e) && !U(e), lc = (e) => wc(e, Oc, ac), H = (e) => Gs.test(e), uc = (e) => wc(e, kc, ic), dc = (e) => wc(e, Ac, V), fc = (e) => wc(e, Mc, rc), pc = (e) => wc(e, jc, ac), mc = (e) => wc(e, Ec, ac), hc = (e) => wc(e, Dc, sc), gc = (e) => wc(e, Nc, oc), U = (e) => Ks.test(e), _c = (e) => Tc(e, kc), vc = (e) => Tc(e, jc), yc = (e) => Tc(e, Ec), bc = (e) => Tc(e, Oc), xc = (e) => Tc(e, Dc), Sc = (e) => Tc(e, Nc, !0), Cc = (e) => Tc(e, Mc, !0), wc = (e, t, n) => {
	let r = Gs.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, Tc = (e, t, n = !1) => {
	let r = Ks.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, Ec = (e) => e === "position" || e === "percentage", Dc = (e) => e === "image" || e === "url", Oc = (e) => e === "length" || e === "size" || e === "bg-size", kc = (e) => e === "length", Ac = (e) => e === "number", jc = (e) => e === "family-name", Mc = (e) => e === "number" || e === "weight", Nc = (e) => e === "shadow", Pc = /* @__PURE__ */ Us(() => {
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
		$s,
		"full",
		"auto",
		...w()
	], E = () => [
		ec,
		"none",
		"subgrid",
		U,
		H
	], ee = () => [
		"auto",
		{ span: [
			"full",
			ec,
			U,
			H
		] },
		ec,
		U,
		H
	], D = () => [
		ec,
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
		$s,
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
		$s,
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
		$s,
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
		yc,
		mc,
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
		bc,
		lc,
		{ size: [U, H] }
	], ie = () => [
		tc,
		_c,
		uc
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
		_c,
		uc
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
		tc,
		yc,
		mc
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
	], z = () => [
		$s,
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
			blur: [nc],
			breakpoint: [nc],
			color: [rc],
			container: [nc],
			"drop-shadow": [nc],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [cc],
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
			"inset-shadow": [nc],
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
			radius: [nc],
			shadow: [nc],
			spacing: ["px", V],
			text: [nc],
			"text-shadow": [nc],
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
				$s,
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
				ec,
				"auto",
				U,
				H
			] }],
			basis: [{ basis: [
				$s,
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
				$s,
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
				ec,
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
				_c,
				uc
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				Cc,
				fc
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
				tc,
				H
			] }],
			"font-family": [{ font: [
				vc,
				pc,
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
				dc
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
				uc
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
						ec,
						U,
						H
					],
					radial: [
						"",
						U,
						H
					],
					conic: [
						ec,
						U,
						H
					]
				},
				xc,
				hc
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
				_c,
				uc
			] }],
			"outline-color": [{ outline: P() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				Sc,
				gc
			] }],
			"shadow-color": [{ shadow: P() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				Sc,
				gc
			] }],
			"inset-shadow-color": [{ "inset-shadow": P() }],
			"ring-w": [{ ring: L() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: P() }],
			"ring-offset-w": [{ "ring-offset": [V, uc] }],
			"ring-offset-color": [{ "ring-offset": P() }],
			"inset-ring-w": [{ "inset-ring": L() }],
			"inset-ring-color": [{ "inset-ring": P() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				Sc,
				gc
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
				Sc,
				gc
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
			translate: [{ translate: z() }],
			"translate-x": [{ "translate-x": z() }],
			"translate-y": [{ "translate-y": z() }],
			"translate-z": [{ "translate-z": z() }],
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
				_c,
				uc,
				dc
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
	return Pc(C(e));
}
//#endregion
//#region src/components/ui/button.tsx
var Fc = E("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
	return /* @__PURE__ */ y(r ? Jo : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: W(Fc({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/components/ui/card.tsx
var Ic = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function K({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card",
		"data-variant": t,
		className: W("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", Ic[t], e),
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
function Lc({ className: e, ...t }) {
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
	return /* @__PURE__ */ y(pa, {
		"data-slot": "label",
		className: W("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/lib/queryClient.ts
var Rc = null;
function zc() {
	return Rc;
}
//#endregion
//#region src/lib/authLost.ts
var Bc = ["auth", "session"], Vc = new Set([
	"rest_cookie_invalid_nonce",
	"rest_not_logged_in",
	"invalid_nonce",
	"ajax_referer_failed",
	"-1"
]);
function Hc(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (t.status === 401) return !0;
	let n = typeof t.code == "string" ? t.code : "";
	if (Vc.has(n)) return !0;
	let r = typeof t.message == "string" ? t.message.toLowerCase() : "";
	return !!(r.includes("cookie nonce is invalid") || r.includes("rest_cookie_invalid_nonce") || t.status === 403 && (n === "-1" || r === "-1" || r.includes("are you sure you want to do this")));
}
function Uc(e) {
	let t = e ?? zc();
	t && t.setQueryData(Bc, { logged_in: !1 });
}
var Wc = new Set([
	"rest_cookie_invalid_nonce",
	"invalid_nonce",
	"ajax_referer_failed",
	"-1"
]);
function Gc(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (t.status === 401) return !1;
	let n = typeof t.code == "string" ? t.code : "";
	if (Wc.has(n)) return !0;
	let r = typeof t.message == "string" ? t.message.toLowerCase() : "";
	return r.includes("cookie nonce is invalid") || r.includes("rest_cookie_invalid_nonce") || r === "invalid nonce";
}
function Kc(e) {
	Gc(e) || Hc(e) && Uc();
}
//#endregion
//#region src/lib/safeUrl.ts
function qc(e) {
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
function Jc() {
	return window.webinoDashboard;
}
var Yc = 3e4;
function Xc(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function Zc(e) {
	let t = Jc();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (Xc(e) || qc(e)) return e;
	throw new fl("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function Qc(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function $c(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "license/remote-check" ? "webino_dashboard_license_remote_check" : t === "license/diagnostics" ? "webino_dashboard_license_diagnostics" : t === "license/remote-activate" ? "webino_dashboard_license_remote_activate" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") || t.startsWith("shop/reports") || t.startsWith("shop/product-categories") || t === "comments" || t.startsWith("comments/") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : /^(payments|torobpay|snapppay|digipay|zarinpal|bale-pay|wallet|c2c)(\/|$)/.test(t) ? "webino_dashboard_payments_rest" : t.startsWith("analytics/") && t !== "analytics/hit" ? "webino_dashboard_analytics_rest" : null;
}
function el(e, t) {
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
function tl(e, t) {
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
async function nl(e, t, n = {}) {
	let r = $c(e), i = Jc();
	if (!r || !i.ajaxUrl) throw new fl("AJAX fallback unavailable", {
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
	let { signal: l, clear: u } = Qc({}, t);
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
			let n = tl(t, e.status);
			throw new fl(n.message, {
				code: n.code,
				status: e.status
			});
		}
		if (!n.success) {
			let t = new fl(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
				code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
				status: e.status
			});
			throw Kc(t), t;
		}
		return n.data;
	} catch (e) {
		throw e instanceof fl ? (Kc(e), e) : e instanceof DOMException && e.name === "AbortError" ? new fl("Request timed out", {
			code: "request_timeout",
			status: 0
		}) : e instanceof TypeError ? new fl("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		u();
	}
}
var rl = null;
function il(e) {
	let t = Jc();
	t && typeof e == "string" && e.length > 0 && (t.nonce = e);
}
function al() {
	if (rl) return rl;
	let e = Jc();
	if (!e?.ajaxUrl) return Promise.resolve(!1);
	let t = new URLSearchParams();
	return t.set("action", "webino_dashboard_auth_session"), rl = fetch(e.ajaxUrl, {
		method: "POST",
		credentials: "same-origin",
		headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
		body: t
	}).then((e) => e.json()).then((e) => {
		let t = !!(e?.success && e.data?.logged_in);
		return t && il(e.data?.nonce), t && typeof e.data?.nonce == "string" && e.data.nonce.length > 0;
	}).catch(() => !1).finally(() => {
		window.setTimeout(() => {
			rl = null;
		}, 0);
	}), rl;
}
async function Q(e, t = {}, n = Yc) {
	try {
		return await ol(e, t, n);
	} catch (r) {
		if (!Gc(r)) throw r;
		if (!await al()) throw Uc(), r;
		let i = { ...t.headers };
		for (let e of Object.keys(i)) e.toLowerCase() === "x-wp-nonce" && delete i[e];
		return ol(e, {
			...t,
			headers: i
		}, n);
	}
}
async function ol(e, t = {}, n = Yc) {
	if ($c(e) && Jc().ajaxUrl) return nl(e, n, t);
	let r = Zc(e), i = Jc(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce), !Object.keys(a).some((e) => e.toLowerCase() === "content-type") && typeof t.body == "string" && t.body.length > 0 && (a["Content-Type"] = "application/json");
	let { signal: s, clear: c } = Qc(t, n);
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
			let t = el(n, e.status);
			throw new fl(t.message, {
				code: t.code,
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i, n = new fl(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
			throw Kc(n), n;
		}
		return i;
	} catch (e) {
		throw e instanceof fl ? (Kc(e), e) : e instanceof DOMException && e.name === "AbortError" ? new fl("Request timed out", {
			code: "request_timeout",
			status: 0
		}) : e instanceof TypeError ? new fl("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region src/lib/marketplace-api.ts
function sl(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function cl(e) {
	"@babel/helpers - typeof";
	return cl = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, cl(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function ll(e, t) {
	if (cl(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (cl(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function ul(e) {
	var t = ll(e, "string");
	return cl(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function dl(e, t, n) {
	return (t = ul(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/lib/apiError.ts
var fl = class extends Error {
	constructor(e, t) {
		super(e), dl(this, "code", void 0), dl(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, pl = {
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
function ml(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function hl(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function gl(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(sl(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function _l(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return gl(e, n);
	if (t instanceof fl && t.code) {
		let n = pl[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = pl[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return ml(n) ? e("errors.api.requestTimeout") : hl(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function vl(e, t) {
	h.error(_l(e, t));
}
//#endregion
//#region src/hooks/useQueryErrorToast.ts
function yl(e) {
	let { t } = m(), n = f(!1);
	l(() => {
		e.isError && e.error ? n.current || (n.current = !0, h.error(_l(t, e.error))) : n.current = !1;
	}, [
		e.isError,
		e.error,
		e.fetchStatus,
		t
	]);
}
//#endregion
//#region ../Modules/shipping-module/client/components/OrderMapPanel.tsx
var bl = null;
function xl() {
	return typeof window > "u" ? Promise.reject(/* @__PURE__ */ Error("no window")) : window.L ? Promise.resolve(window.L) : bl || (bl = new Promise((e, t) => {
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
	}), bl);
}
function Sl(e) {
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
function Cl({ orderId: r }) {
	let { t: i } = m(), a = n(), o = f(null), s = f(null), c = f(null), [u, d] = p(0), [g, _] = p(0), [v, x] = p(!1), S = t({
		queryKey: ["shipping-order-map", r],
		queryFn: () => Q(`shipping/orders/${r}/map`),
		enabled: r > 0
	});
	yl(S), l(() => {
		if (S.data) {
			let e = S.data.settings?.store_location;
			d(S.data.lat || e?.lat || 35.6892), _(S.data.lng || e?.lng || 51.389);
		}
	}, [S.data]), l(() => {
		let e = !1;
		return xl().then((t) => {
			if (e || !o.current || s.current) return;
			let n = Sl(S.data?.settings), r = t.map(o.current).setView([u || 35.6892, g || 51.389], 13);
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
		mutationFn: () => Q(`shipping/orders/${r}/map`, {
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
		onError: (e) => vl(i, e)
	});
	return /* @__PURE__ */ b(K, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ y(q, {
			className: "pb-2",
			children: /* @__PURE__ */ y(J, {
				className: "text-base",
				children: i("shipping.orderMapTitle")
			})
		}), /* @__PURE__ */ b(Y, {
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
						children: [/* @__PURE__ */ y(Z, { children: "Lat" }), /* @__PURE__ */ y(X, {
							type: "number",
							step: "any",
							dir: "ltr",
							value: u,
							onChange: (e) => d(parseFloat(e.target.value) || 0)
						})]
					}), /* @__PURE__ */ b("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ y(Z, { children: "Lng" }), /* @__PURE__ */ y(X, {
							type: "number",
							step: "any",
							dir: "ltr",
							value: g,
							onChange: (e) => _(parseFloat(e.target.value) || 0)
						})]
					})]
				}),
				/* @__PURE__ */ y(G, {
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
function wl({ className: e }) {
	return /* @__PURE__ */ b("svg", {
		width: "13",
		height: "12",
		viewBox: "0 0 13 12",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		className: W("inline-block h-[0.85em] w-auto shrink-0 align-[-0.12em]", e),
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
var Tl = /تومان|toman|irt/i;
function El(e) {
	return e.replace(/&nbsp;/gi, " ").replace(/&#160;/g, " ").replace(/&#x0*a0;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, "\"").replace(/&#(\d+);/g, (e, t) => {
		let n = Number(t);
		return Number.isFinite(n) ? String.fromCharCode(n) : e;
	}).replace(/\u00a0/g, " ");
}
function Dl(e, t) {
	let n = (e ?? "").trim(), r = (t ?? "").trim();
	if (!n && !r) return !1;
	let i = n.toUpperCase();
	return !!(i === "IRT" || i === "TOMAN" || i === "IRHT" || Tl.test(n) || Tl.test(r));
}
//#endregion
//#region src/lib/digits.ts
var Ol = "۰۱۲۳۴۵۶۷۸۹", kl = {
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
function Al(e) {
	return e.toLowerCase().startsWith("fa");
}
function jl(e) {
	return e.replace(/\d/g, (e) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(e, 10)] ?? e);
}
function Ml(e) {
	return e.replace(/[۰-۹٠-٩]/g, (e) => kl[e] ?? e);
}
function Nl(e, t) {
	return Al(t) ? jl(e) : e;
}
//#endregion
//#region src/lib/formatNumber.ts
function Pl(e, t) {
	let n = Number.isFinite(e) ? e : 0, r = Al(t) ? "fa-IR" : "en-US", i = new Intl.NumberFormat(r, { maximumFractionDigits: 2 }).format(n);
	return Al(t) ? jl(i) : i;
}
//#endregion
//#region src/components/currency/MoneyDisplay.tsx
var Fl = /تومان|toman|irt/gi;
function Il(e) {
	if (typeof e == "number") return Number.isFinite(e) ? e : 0;
	let t = Ml(El(e)).replace(Fl, "").replace(/[^\d.-]/g, ""), n = parseFloat(t);
	return Number.isFinite(n) ? n : NaN;
}
function Ll({ amount: e, currency: t, currencySymbol: n, locale: r, className: i, amountClassName: a, prefix: o }) {
	let s = Il(e), c = Number.isFinite(s) ? Pl(s, r) : Nl(Ml(El(String(e))).replace(Fl, "").trim(), r), l = Dl(t, n) || !t?.trim() && !n?.trim();
	return /* @__PURE__ */ b("span", {
		className: W("inline-flex items-baseline gap-1", i),
		dir: "ltr",
		children: [
			o,
			l ? /* @__PURE__ */ y(wl, {}) : null,
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
function Rl({ orderId: r, currency: i = "IRT", locale: a = "fa-IR" }) {
	let { t: o } = m(), s = n(), c = t({
		queryKey: ["shipping-order-packaging", r],
		queryFn: () => Q(`shipping/orders/${r}/packaging`),
		enabled: r > 0
	});
	yl(c);
	let l = e({
		mutationFn: () => Q(`shipping/orders/${r}/packaging`, {
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
		onError: (e) => vl(o, e)
	}), u = c.data?.plan, d = c.data?.professional_fee;
	return /* @__PURE__ */ b(K, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ b(q, {
			className: "flex flex-row items-center justify-between gap-2 pb-2",
			children: [/* @__PURE__ */ y(J, {
				className: "text-base",
				children: o("shipping.orderPackagingTitle")
			}), /* @__PURE__ */ y(G, {
				type: "button",
				size: "sm",
				variant: "secondary",
				disabled: l.isPending,
				onClick: () => void l.mutateAsync(),
				children: o("shipping.recalcPlan")
			})]
		}), /* @__PURE__ */ b(Y, {
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
					] }), /* @__PURE__ */ y(Ll, {
						amount: e.price,
						currency: i,
						locale: a
					})]
				}, `${e.size}-${t}`))
			}), /* @__PURE__ */ b("div", {
				className: "flex items-center justify-between border-t border-border pt-2 font-medium",
				children: [/* @__PURE__ */ b("span", { children: [o("shipping.boxCount", { count: u.box_count }), u.oversized ? ` · ${o("shipping.oversized")}` : ""] }), /* @__PURE__ */ y(Ll, {
					amount: u.total_packaging_cost,
					currency: i,
					locale: a
				})]
			})] }), d?.selected ? /* @__PURE__ */ b("div", {
				className: "flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2",
				children: [/* @__PURE__ */ y("span", { children: d.label || o("shipping.professionalFeeOrderSelected") }), /* @__PURE__ */ y(Ll, {
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
function zl({ title: e, description: t, eyebrow: n, children: r }) {
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
var Bl = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), Vl = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Hl = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), Ul = (e) => {
	let t = Hl(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, Wl = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, Gl = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, Kl = a({}), ql = () => c(Kl), Jl = s(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: a, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = ql() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return o("svg", {
		ref: l,
		...Wl,
		width: t ?? u ?? Wl.width,
		height: t ?? u ?? Wl.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: Bl("lucide", m, i),
		...!a && !Gl(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => o(e, t)), ...Array.isArray(a) ? a : [a]]);
}), Yl = (e, t) => {
	let n = s(({ className: n, ...r }, i) => o(Jl, {
		ref: i,
		iconNode: t,
		className: Bl(`lucide-${Vl(Ul(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = Ul(e), n;
}, Xl = Yl("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]), Zl = Yl("chevron-down", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]), Ql = Yl("chevron-up", [["path", {
	d: "m18 15-6-6-6 6",
	key: "153udz"
}]]), $l = Yl("plus", [["path", {
	d: "M5 12h14",
	key: "1ays0h"
}], ["path", {
	d: "M12 5v14",
	key: "s699le"
}]]), eu = Yl("trash-2", [
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
]), tu = Yl("truck", [
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
]), nu = Yl("x", [["path", {
	d: "M18 6 6 18",
	key: "1bl5f8"
}], ["path", {
	d: "m6 6 12 12",
	key: "d8bk6v"
}]]);
//#endregion
//#region src/hooks/use-text-direction.ts
function ru() {
	let { i18n: e } = m();
	return e.dir() === "rtl" ? "rtl" : "ltr";
}
//#endregion
//#region src/components/ui/select.tsx
function iu({ ...e }) {
	return /* @__PURE__ */ y(Fo, {
		"data-slot": "select",
		...e
	});
}
function au({ ...e }) {
	return /* @__PURE__ */ y(Lo, {
		"data-slot": "select-value",
		...e
	});
}
function ou({ className: e, size: t = "default", children: n, ...r }) {
	return /* @__PURE__ */ b(Io, {
		"data-slot": "select-trigger",
		"data-size": t,
		dir: ru(),
		className: W("flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap text-start shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", e),
		...r,
		children: [n, /* @__PURE__ */ y(Ro, {
			asChild: !0,
			children: /* @__PURE__ */ y(Zl, { className: "size-4 opacity-50" })
		})]
	});
}
function su({ className: e, children: t, position: n = "popper", align: r = "start", ...i }) {
	return /* @__PURE__ */ y(mn, {
		allowBodyScroll: !0,
		children: /* @__PURE__ */ y(zo, { children: /* @__PURE__ */ b(Bo, {
			"data-slot": "select-content",
			dir: ru(),
			className: W("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-start text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", e),
			position: n,
			align: r,
			...i,
			children: [
				/* @__PURE__ */ y(lu, {}),
				/* @__PURE__ */ y(Vo, {
					className: W("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
					children: t
				}),
				/* @__PURE__ */ y(uu, {})
			]
		}) })
	});
}
function cu({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ b(Ho, {
		"data-slot": "select-item",
		className: W("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pe-8 ps-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", e),
		...n,
		children: [/* @__PURE__ */ y("span", {
			"data-slot": "select-item-indicator",
			className: "absolute end-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ y(Wo, { children: /* @__PURE__ */ y(Xl, { className: "size-4" }) })
		}), /* @__PURE__ */ y(Uo, { children: t })]
	});
}
function lu({ className: e, ...t }) {
	return /* @__PURE__ */ y(Go, {
		"data-slot": "select-scroll-up-button",
		className: W("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ y(Ql, { className: "size-4" })
	});
}
function uu({ className: e, ...t }) {
	return /* @__PURE__ */ y(Ko, {
		"data-slot": "select-scroll-down-button",
		className: W("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ y(Zl, { className: "size-4" })
	});
}
//#endregion
//#region src/components/ui/switch.tsx
function $({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ y(ds, {
		"data-slot": "switch",
		"data-size": t,
		className: W("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", e),
		...n,
		dir: "ltr",
		children: /* @__PURE__ */ y(fs, {
			"data-slot": "switch-thumb",
			className: W("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/CitiesSettingsPage.tsx
function du() {
	let { t: r } = m(), i = n(), [a, o] = p(0), [s, c] = p(0), [u, f] = p(""), [g, _] = p(""), [x, S] = p({}), [C, w] = p(null), [T, E] = p(!1), [ee, D] = p(!1), O = t({
		queryKey: ["shipping-cities-tree"],
		queryFn: () => Q("shipping/cities/tree", {}, 6e4)
	});
	yl(O), l(() => {
		O.data && typeof O.data.enabled == "boolean" && D(O.data.enabled);
	}, [O.data]);
	let k = e({
		mutationFn: (e) => Q("shipping/cities/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ settings: { enabled: e } })
		}),
		onSuccess: (e) => {
			e.settings && D(!!e.settings.enabled), h.success(r("common.saved")), i.invalidateQueries({ queryKey: ["shipping-cities-tree"] }), i.invalidateQueries({ queryKey: ["shipping-hub-status"] }), i.invalidateQueries({ queryKey: ["shop-locations-states"] });
		},
		onError: (e) => vl(r, e)
	}), A = async () => {
		if (!T) {
			E(!0);
			try {
				let e = O.data?.next_key ?? null, t = 0;
				for (; t < 40;) {
					++t;
					let n = await Q("shipping/cities/seed-batch", {
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
				vl(r, e);
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
		queryFn: () => Q(`shipping/cities/bulk/${a}`),
		enabled: a > 0
	});
	yl(j);
	let M = t({
		queryKey: [
			"shipping-cities-search",
			g,
			a
		],
		queryFn: () => Q(`shipping/cities/search?q=${encodeURIComponent(g)}&state=${a || 0}`),
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
		onError: (e) => vl(r, e)
	}), ne = e({
		mutationFn: () => Q(`shipping/cities/bulk/${a}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ prices: x })
		}),
		onSuccess: () => {
			h.success(r("common.saved")), i.invalidateQueries({ queryKey: ["shipping-cities-bulk", a] });
		},
		onError: (e) => vl(r, e)
	}), F = e({
		mutationFn: () => {
			let e = N.map((e) => e.id);
			return Q("shipping/cities/create-zones", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ city_ids: e.slice(0, 20) })
			});
		},
		onSuccess: () => h.success(r("shipping.zonesCreated")),
		onError: (e) => vl(r, e)
	}), re = e({
		mutationFn: () => Q("shipping/cities/district", {
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
		onError: (e) => vl(r, e)
	}), ie = e({
		mutationFn: (e) => Q(`shipping/cities/district/${e}`, { method: "DELETE" }),
		onSuccess: (e) => {
			e.ok ? (h.success(e.message), i.invalidateQueries({ queryKey: ["shipping-cities-bulk", a] })) : h.error(e.message);
		},
		onError: (e) => vl(r, e)
	}), I = O.data?.states ?? [], L = j.data?.columns ?? [], ae = j.data?.rows ?? [], oe = C && C.total > 0 ? r("shipping.citiesSeedProgress", {
		done: C.done,
		total: C.total
	}) : O.data?.states_total ? r("shipping.citiesSeedProgress", {
		done: O.data.states_done ?? 0,
		total: O.data.states_total
	}) : null;
	return /* @__PURE__ */ b(zl, {
		title: r("shipping.citiesTitle"),
		description: r("shipping.citiesHint"),
		children: [
			/* @__PURE__ */ y(K, {
				className: "mb-4 border-primary/20 shadow-sm",
				children: /* @__PURE__ */ y(Y, {
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
				children: [/* @__PURE__ */ y(G, {
					type: "button",
					variant: "secondary",
					disabled: T || P.isPending,
					onClick: () => void A(),
					children: r("shipping.reinstallCities")
				}), a > 0 && /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y(G, {
					type: "button",
					disabled: ne.isPending,
					onClick: () => void ne.mutate(),
					children: r("common.save")
				}), /* @__PURE__ */ y(G, {
					type: "button",
					variant: "outline",
					disabled: F.isPending,
					onClick: () => void F.mutate(),
					children: r("shipping.createZonesFromCities")
				})] })]
			}),
			/* @__PURE__ */ b(K, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ b(q, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(J, {
						className: "text-base",
						children: r("shipping.pickState")
					}), /* @__PURE__ */ y(Lc, { children: T || O.isFetching ? oe || r("shipping.citiesLoading") : O.data?.installed ? r("shipping.citiesInstalled") : r("shipping.citiesSeeding") })]
				}), /* @__PURE__ */ b(Y, {
					className: "grid gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ b("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ y(Z, { children: r("tapin.province") }), /* @__PURE__ */ b(iu, {
							value: a ? String(a) : void 0,
							onValueChange: (e) => o(parseInt(e, 10) || 0),
							children: [/* @__PURE__ */ y(ou, { children: /* @__PURE__ */ y(au, { placeholder: r("tapin.pickProvince") }) }), /* @__PURE__ */ y(su, { children: I.map((e) => /* @__PURE__ */ y(cu, {
								value: String(e.id),
								children: e.name
							}, e.id)) })]
						})]
					}), /* @__PURE__ */ b("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ y(Z, { children: r("shipping.citySearch") }),
							/* @__PURE__ */ y(X, {
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
			a > 0 && /* @__PURE__ */ b(K, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ b(q, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(J, {
						className: "text-base",
						children: r("shipping.districtsTitle")
					}), /* @__PURE__ */ y(Lc, { children: r("shipping.districtsHint") })]
				}), /* @__PURE__ */ b(Y, {
					className: "space-y-3",
					children: [/* @__PURE__ */ b("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(Z, { children: r("tapin.city") }), /* @__PURE__ */ b(iu, {
								value: s ? String(s) : void 0,
								onValueChange: (e) => c(parseInt(e, 10) || 0),
								children: [/* @__PURE__ */ y(ou, { children: /* @__PURE__ */ y(au, { placeholder: r("tapin.pickCity") }) }), /* @__PURE__ */ y(su, { children: N.map((e) => /* @__PURE__ */ y(cu, {
									value: String(e.id),
									children: e.name
								}, e.id)) })]
							})]
						}), /* @__PURE__ */ b("div", {
							className: "flex items-end gap-2",
							children: [/* @__PURE__ */ b("div", {
								className: "flex-1 space-y-1.5",
								children: [/* @__PURE__ */ y(Z, { children: r("shipping.districtName") }), /* @__PURE__ */ y(X, {
									value: u,
									onChange: (e) => f(e.target.value),
									disabled: !s
								})]
							}), /* @__PURE__ */ y(G, {
								type: "button",
								disabled: !s || !u.trim() || re.isPending,
								onClick: () => void re.mutate(),
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
							children: [/* @__PURE__ */ y("span", { children: e.name.replace(/^—\s*/, "") }), /* @__PURE__ */ y(G, {
								type: "button",
								size: "sm",
								variant: "ghost",
								disabled: ie.isPending,
								onClick: () => void ie.mutate(e.id),
								children: r("common.delete")
							})]
						}, e.id))
					})]
				})]
			}),
			a > 0 && /* @__PURE__ */ b(K, {
				className: "shadow-sm",
				children: [/* @__PURE__ */ y(q, {
					className: "pb-2",
					children: /* @__PURE__ */ y(J, {
						className: "text-base",
						children: r("shipping.bulkPrices")
					})
				}), /* @__PURE__ */ y(Y, {
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
							}), L.map((e) => /* @__PURE__ */ b("th", {
								className: "p-2 text-start whitespace-nowrap",
								children: [e.label, e.method_id.includes("tipax") ? ` / ${r("shipping.tipaxOn")}` : ""]
							}, e.key))]
						}) }), /* @__PURE__ */ y("tbody", { children: ae.map((e) => /* @__PURE__ */ b("tr", {
							className: "border-b border-border/60",
							children: [/* @__PURE__ */ y("td", {
								className: "p-2 whitespace-nowrap",
								children: e.name
							}), L.map((t) => /* @__PURE__ */ b("td", {
								className: "p-2 align-top",
								children: [/* @__PURE__ */ y(X, {
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
	return /* @__PURE__ */ y(n ? Jo : "span", {
		"data-slot": "badge",
		"data-variant": t,
		className: W(fu({ variant: t }), e),
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
		queryFn: () => Q(`shop/products?page=1&per_page=20${c.trim() ? `&search=${encodeURIComponent(c.trim())}` : ""}`),
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
			/* @__PURE__ */ y(Z, {
				htmlFor: e,
				children: n
			}),
			/* @__PURE__ */ y(X, {
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
					children: [d[e] ? `${d[e]} (#${e})` : `#${e}`, /* @__PURE__ */ b(G, {
						type: "button",
						size: "icon",
						variant: "ghost",
						className: "size-5",
						onClick: () => _(e),
						children: [/* @__PURE__ */ y(nu, { className: "size-3" }), /* @__PURE__ */ y("span", {
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
var hu = Object.fromEntries([...Ol].map((e, t) => [e, String(t)]));
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
	let c = Al(t) ? "fa-IR" : "en-US", l = new Intl.NumberFormat(c, { maximumFractionDigits: 0 }).format(a === "" ? 0 : s);
	if (o != null || i) {
		let e = Al(t) ? "٫" : ".", n = o ?? "";
		l += e + (Al(t) ? n.replace(/\d/g, (e) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(e, 10)] ?? e) : n);
	}
	return n ? `-${l}` : l;
}
function vu({ value: e, onChange: t, className: n, onBlur: r, ...i }) {
	let { i18n: a } = m(), o = a.language, s = d(() => _u(e, o), [e, o]);
	return /* @__PURE__ */ y(X, {
		...i,
		inputMode: "decimal",
		className: W(n),
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
	gateway_costs: []
});
function xu(e) {
	if (e == null || e === "") return "";
	let t = Number(e);
	return Number.isFinite(t) && t > 0 ? String(t) : t === 0 ? "0" : "";
}
function Su(e) {
	let t = {};
	if (e && typeof e == "object") for (let [n, r] of Object.entries(e)) {
		let e = Number(r);
		/^\d+$/.test(n) && Number.isFinite(e) && (t[n] = String(e));
	}
	return t;
}
function Cu(e) {
	let t = Number(gu(e || "") || "0");
	return Number.isFinite(t) && t >= 0 ? t : 0;
}
function wu({ id: e, items: t, loading: n, placeholder: r, onAdd: i }) {
	let [a, o] = p(""), s = d(() => {
		let e = a.trim().toLowerCase();
		return e ? t.filter((t) => t.name.toLowerCase().includes(e)).slice(0, 30) : [];
	}, [t, a]);
	return /* @__PURE__ */ b("div", {
		className: "relative",
		children: [/* @__PURE__ */ y(X, {
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
function Tu({ onAdd: e }) {
	let { t: n } = m(), [r, i] = p(""), a = r.trim(), o = t({
		queryKey: ["item-cost-products", a],
		queryFn: () => Q(`shop/products?page=1&per_page=20&search=${encodeURIComponent(a)}`),
		enabled: a.length >= 1,
		staleTime: 3e4
	}), s = o.data?.items ?? [];
	return /* @__PURE__ */ b("div", {
		className: "relative",
		children: [/* @__PURE__ */ y(X, {
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
function Eu({ id: e, label: t, value: n, onChange: r, onRemove: i }) {
	let { t: a } = m();
	return /* @__PURE__ */ b("li", {
		className: "flex items-center gap-2 rounded-xl border p-2",
		children: [
			/* @__PURE__ */ y("span", {
				className: "min-w-0 flex-1 truncate text-sm font-medium",
				title: t,
				children: t
			}),
			/* @__PURE__ */ y(vu, {
				id: e,
				inputMode: "numeric",
				value: n,
				onChange: r,
				placeholder: "150,000",
				className: "w-36 text-sm",
				"aria-label": a("shipping.itemCost.costField")
			}),
			/* @__PURE__ */ y(G, {
				type: "button",
				variant: "ghost",
				size: "icon",
				className: "text-destructive size-9",
				onClick: i,
				"aria-label": a("common.delete"),
				children: /* @__PURE__ */ y(eu, { className: "size-4" })
			})
		]
	});
}
function Du() {
	let { t: r } = m(), i = n(), [a, o] = p(null), [s, c] = p({
		products: {},
		categories: {},
		brands: {}
	}), u = t({
		queryKey: ["shipping-item-cost"],
		queryFn: () => Q("shipping/item-cost/settings")
	});
	yl(u);
	let d = t({
		queryKey: ["gateway-discounts", "gateways"],
		queryFn: () => Q("marketing/gateway-discounts/gateways"),
		staleTime: 6e4
	}), f = t({
		queryKey: ["product-categories"],
		queryFn: () => Q("shop/product-categories"),
		staleTime: 6e4
	}), g = t({
		queryKey: ["brands"],
		queryFn: () => Q("shop/brands"),
		staleTime: 6e4
	});
	l(() => {
		if (!u.data?.settings) return;
		let e = u.data.settings, t = (e) => e == null ? "" : String(e), n = Array.isArray(e.gateway_costs) ? e.gateway_costs.map((e) => ({
			gateway: String(e.gateway ?? ""),
			type: e.type === "add" ? "add" : "override",
			amount: xu(e.amount),
			enabled: !0
		})) : [], r = Array.isArray(e.set_costs) ? e.set_costs.map((e, t) => ({
			id: String(e.id ?? `set_${t}`),
			name: String(e.name ?? ""),
			product_ids: Array.isArray(e.product_ids) ? e.product_ids.map((e) => Number(e) || 0).filter((e) => e > 0) : [],
			cost: xu(e.cost)
		})) : [];
		o({
			...bu(),
			enabled: !!e.enabled,
			mode: e.mode === "each" || e.mode === "once" || e.mode === "max" ? e.mode : "max",
			multiply_by_qty: e.multiply_by_qty !== !1,
			virtual_skip: e.virtual_skip !== !1,
			category_children: e.category_children !== !1,
			skip_with_free_coupon: !!e.skip_with_free_coupon,
			skip_free_methods: e.skip_free_methods !== !1,
			skip_local_pickup: e.skip_local_pickup !== !1,
			default_cost: t(e.default_cost),
			min_free_amount: t(e.min_free_amount),
			product_costs: Su(e.product_costs),
			set_costs: r,
			category_costs: Su(e.category_costs),
			brand_costs: Su(e.brand_costs),
			gateway_costs: n
		});
	}, [u.data]), l(() => {
		if (!a) return;
		let e = Array.from(new Set([...Object.keys(a.product_costs).map(Number), ...a.set_costs.flatMap((e) => e.product_ids)])).filter((e) => e > 0), t = Object.keys(a.category_costs).map(Number).filter((e) => e > 0), n = Object.keys(a.brand_costs).map(Number).filter((e) => e > 0);
		if (e.length === 0 && t.length === 0 && n.length === 0) return;
		let r = !1, i = new URLSearchParams();
		return e.length && i.set("products", e.join(",")), t.length && i.set("categories", t.join(",")), n.length && i.set("brands", n.join(",")), Q(`shipping/item-cost/names?${i.toString()}`).then((e) => {
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
			let e = (e) => e.trim() === "" ? "" : Cu(e), t = (e) => {
				let t = {};
				for (let [n, r] of Object.entries(e)) /^\d+$/.test(n) && (t[n] = Cu(r));
				return t;
			}, n = {
				enabled: a.enabled,
				mode: a.mode,
				multiply_by_qty: a.multiply_by_qty,
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
					cost: Cu(e.cost)
				})),
				category_costs: t(a.category_costs),
				brand_costs: t(a.brand_costs),
				gateway_costs: a.gateway_costs.filter((e) => e.enabled && e.gateway.trim() !== "").map((e) => ({
					gateway: e.gateway,
					type: e.type,
					amount: Cu(e.amount)
				}))
			};
			return Q("shipping/item-cost/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ settings: n })
			});
		},
		onSuccess: () => {
			h.success(r("common.saved")), i.invalidateQueries({ queryKey: ["shipping-item-cost"] });
		},
		onError: (e) => vl(r, e)
	});
	if (!a) return /* @__PURE__ */ y(zl, {
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
	}), E = (e, t) => s[e][t] ?? x.find((e) => String(e.id) === t)?.name ?? S.find((e) => String(e.id) === t)?.name ?? `#${t}`, ee = Object.keys(a.product_costs).length + Object.keys(a.category_costs).length + Object.keys(a.brand_costs).length + a.set_costs.length + a.gateway_costs.filter((e) => e.enabled).length;
	return /* @__PURE__ */ b(zl, {
		title: r("shipping.itemCost.title"),
		description: r("shipping.itemCost.description"),
		children: [
			/* @__PURE__ */ y(K, {
				className: W("border-2", a.enabled ? "border-primary/50" : "border-border"),
				children: /* @__PURE__ */ b(Y, {
					className: "flex flex-wrap items-center justify-between gap-4 py-4",
					children: [/* @__PURE__ */ b("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ y("div", {
							className: "bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-2xl",
							children: /* @__PURE__ */ y(tu, {
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
			/* @__PURE__ */ b(K, { children: [/* @__PURE__ */ b(q, { children: [/* @__PURE__ */ y(J, {
				className: "text-base",
				children: r("shipping.itemCost.modeTitle")
			}), /* @__PURE__ */ y(Lc, { children: r("shipping.itemCost.modeHint") })] }), /* @__PURE__ */ b(Y, {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ b("div", {
						className: "grid gap-2",
						children: [
							/* @__PURE__ */ y(Z, {
								htmlFor: "ic-mode",
								children: r("shipping.itemCost.modeLabel")
							}),
							/* @__PURE__ */ b(iu, {
								value: a.mode,
								onValueChange: (e) => w({ mode: e }),
								children: [/* @__PURE__ */ y(ou, {
									id: "ic-mode",
									className: "w-full",
									children: /* @__PURE__ */ y(au, {})
								}), /* @__PURE__ */ b(su, { children: [
									/* @__PURE__ */ y(cu, {
										value: "each",
										children: r("shipping.itemCost.modeEach")
									}),
									/* @__PURE__ */ y(cu, {
										value: "once",
										children: r("shipping.itemCost.modeOnce")
									}),
									/* @__PURE__ */ y(cu, {
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
					a.mode === "each" ? /* @__PURE__ */ b("div", {
						className: "flex items-center justify-between gap-4 rounded-xl border p-3",
						children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(Z, {
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
					}) : null,
					/* @__PURE__ */ b("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ b("div", {
							className: "grid gap-2",
							children: [
								/* @__PURE__ */ y(Z, {
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
								/* @__PURE__ */ y(Z, {
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
								children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(Z, {
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
								children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(Z, {
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
								children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(Z, {
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
								children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(Z, {
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
								children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(Z, {
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
			/* @__PURE__ */ b(K, { children: [/* @__PURE__ */ b(q, { children: [/* @__PURE__ */ y(J, {
				className: "text-base",
				children: r("shipping.itemCost.productTitle")
			}), /* @__PURE__ */ y(Lc, { children: r("shipping.itemCost.productHint") })] }), /* @__PURE__ */ b(Y, {
				className: "grid gap-3",
				children: [/* @__PURE__ */ y(Tu, { onAdd: (e) => {
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
					children: Object.entries(a.product_costs).map(([e, t]) => /* @__PURE__ */ y(Eu, {
						id: `ic-product-cost-${e}`,
						label: E("products", e),
						value: t,
						onChange: (t) => T("product_costs", {
							...a.product_costs,
							[e]: t
						}),
						onRemove: () => T("product_costs", Object.fromEntries(Object.entries(a.product_costs).filter(([t]) => t !== e)))
					}, e))
				})]
			})] }),
			/* @__PURE__ */ b(K, { children: [/* @__PURE__ */ y(q, { children: /* @__PURE__ */ b("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y(J, {
					className: "text-base",
					children: r("shipping.itemCost.setsTitle")
				}), /* @__PURE__ */ y(Lc, { children: r("shipping.itemCost.setsHint") })] }), /* @__PURE__ */ b(G, {
					type: "button",
					variant: "secondary",
					size: "sm",
					onClick: () => o((e) => e && {
						...e,
						set_costs: [...e.set_costs, yu()]
					}),
					children: [/* @__PURE__ */ y($l, { className: "size-4" }), r("shipping.itemCost.addSet")]
				})]
			}) }), /* @__PURE__ */ y(Y, {
				className: "grid gap-4",
				children: a.set_costs.length === 0 ? /* @__PURE__ */ y("p", {
					className: "text-muted-foreground text-xs",
					children: r("shipping.itemCost.emptySets")
				}) : a.set_costs.map((e) => /* @__PURE__ */ b("div", {
					className: "grid gap-3 rounded-xl border p-3",
					children: [
						/* @__PURE__ */ b("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ y(X, {
									value: e.name,
									onChange: (t) => o((n) => n && {
										...n,
										set_costs: n.set_costs.map((n) => n.id === e.id ? {
											...n,
											name: t.target.value
										} : n)
									}),
									placeholder: r("shipping.itemCost.setNamePlaceholder"),
									className: "flex-1",
									"aria-label": r("shipping.itemCost.setName")
								}),
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
								/* @__PURE__ */ y(G, {
									type: "button",
									variant: "ghost",
									size: "icon",
									className: "text-destructive size-9",
									onClick: () => o((t) => t && {
										...t,
										set_costs: t.set_costs.filter((t) => t.id !== e.id)
									}),
									"aria-label": r("common.delete"),
									children: /* @__PURE__ */ y(eu, { className: "size-4" })
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
			/* @__PURE__ */ b(K, { children: [/* @__PURE__ */ b(q, { children: [/* @__PURE__ */ y(J, {
				className: "text-base",
				children: r("shipping.itemCost.categoryTitle")
			}), /* @__PURE__ */ y(Lc, { children: r("shipping.itemCost.categoryHint") })] }), /* @__PURE__ */ b(Y, {
				className: "grid gap-3",
				children: [/* @__PURE__ */ y(wu, {
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
					children: Object.entries(a.category_costs).map(([e, t]) => /* @__PURE__ */ y(Eu, {
						id: `ic-cat-cost-${e}`,
						label: E("categories", e),
						value: t,
						onChange: (t) => T("category_costs", {
							...a.category_costs,
							[e]: t
						}),
						onRemove: () => T("category_costs", Object.fromEntries(Object.entries(a.category_costs).filter(([t]) => t !== e)))
					}, e))
				})]
			})] }),
			/* @__PURE__ */ b(K, { children: [/* @__PURE__ */ b(q, { children: [/* @__PURE__ */ y(J, {
				className: "text-base",
				children: r("shipping.itemCost.brandTitle")
			}), /* @__PURE__ */ y(Lc, { children: r("shipping.itemCost.brandHint") })] }), /* @__PURE__ */ b(Y, {
				className: "grid gap-3",
				children: [/* @__PURE__ */ y(wu, {
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
					children: Object.entries(a.brand_costs).map(([e, t]) => /* @__PURE__ */ y(Eu, {
						id: `ic-brand-cost-${e}`,
						label: E("brands", e),
						value: t,
						onChange: (t) => T("brand_costs", {
							...a.brand_costs,
							[e]: t
						}),
						onRemove: () => T("brand_costs", Object.fromEntries(Object.entries(a.brand_costs).filter(([t]) => t !== e)))
					}, e))
				})]
			})] }),
			/* @__PURE__ */ b(K, { children: [/* @__PURE__ */ b(q, { children: [/* @__PURE__ */ y(J, {
				className: "text-base",
				children: r("shipping.itemCost.gatewayTitle")
			}), /* @__PURE__ */ y(Lc, { children: r("shipping.itemCost.gatewayHint") })] }), /* @__PURE__ */ y(Y, {
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
							n ? /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ b(iu, {
								value: t?.type ?? "override",
								onValueChange: (e) => i({ type: e }),
								children: [/* @__PURE__ */ y(ou, {
									className: "h-9 w-40 text-xs",
									"aria-label": r("shipping.itemCost.gatewayType"),
									children: /* @__PURE__ */ y(au, {})
								}), /* @__PURE__ */ b(su, { children: [/* @__PURE__ */ y(cu, {
									value: "override",
									children: r("shipping.itemCost.gatewayOverride")
								}), /* @__PURE__ */ y(cu, {
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
					children: r("shipping.itemCost.rulesCount", { count: ee })
				}), /* @__PURE__ */ y(G, {
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
function Ou() {
	let { t: n } = m(), [r, i] = p(null), a = t({
		queryKey: ["shipping-map"],
		queryFn: () => Q("shipping/map/settings")
	});
	yl(a), l(() => {
		a.data?.settings && i(a.data.settings);
	}, [a.data]);
	let o = e({
		mutationFn: (e) => Q("shipping/map/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ settings: e })
		}),
		onSuccess: () => h.success(n("common.saved")),
		onError: (e) => vl(n, e)
	});
	return r ? /* @__PURE__ */ b(zl, {
		title: n("shipping.mapTitle"),
		description: n("shipping.mapHint"),
		children: [/* @__PURE__ */ y("div", {
			className: "mb-4 flex justify-end",
			children: /* @__PURE__ */ y(G, {
				disabled: o.isPending,
				onClick: () => o.mutate(r),
				children: n("common.save")
			})
		}), /* @__PURE__ */ b(K, {
			className: "shadow-sm",
			children: [/* @__PURE__ */ y(q, {
				className: "pb-2",
				children: /* @__PURE__ */ y(J, {
					className: "text-base",
					children: n("shipping.mapTitle")
				})
			}), /* @__PURE__ */ b(Y, {
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
								children: [/* @__PURE__ */ y(Z, { children: n("shipping.mapProvider") }), /* @__PURE__ */ b(iu, {
									value: r.provider,
									onValueChange: (e) => i({
										...r,
										provider: e
									}),
									children: [/* @__PURE__ */ y(ou, { children: /* @__PURE__ */ y(au, {}) }), /* @__PURE__ */ b(su, { children: [
										/* @__PURE__ */ y(cu, {
											value: "osm",
											children: "OpenStreetMap"
										}),
										/* @__PURE__ */ y(cu, {
											value: "neshan",
											children: "Neshan"
										}),
										/* @__PURE__ */ y(cu, {
											value: "mapp",
											children: "Map.ir"
										})
									] })]
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(Z, { children: n("shipping.mapPlacement") }), /* @__PURE__ */ b(iu, {
									value: r.checkout_placement,
									onValueChange: (e) => i({
										...r,
										checkout_placement: e
									}),
									children: [/* @__PURE__ */ y(ou, { children: /* @__PURE__ */ y(au, {}) }), /* @__PURE__ */ b(su, { children: [/* @__PURE__ */ y(cu, {
										value: "after_order_notes",
										children: n("shipping.mapAfterNotes")
									}), /* @__PURE__ */ y(cu, {
										value: "before_customer_details",
										children: n("shipping.mapBeforeDetails")
									})] })]
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(Z, { children: n("shipping.mapDistance") }), /* @__PURE__ */ b(iu, {
									value: r.distance_mode,
									onValueChange: (e) => i({
										...r,
										distance_mode: e
									}),
									children: [/* @__PURE__ */ y(ou, { children: /* @__PURE__ */ y(au, {}) }), /* @__PURE__ */ b(su, { children: [
										/* @__PURE__ */ y(cu, {
											value: "none",
											children: n("shipping.mapDistNone")
										}),
										/* @__PURE__ */ y(cu, {
											value: "direct",
											children: n("shipping.mapDistDirect")
										}),
										/* @__PURE__ */ y(cu, {
											value: "real",
											children: n("shipping.mapDistReal")
										})
									] })]
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(Z, { children: "Neshan API" }), /* @__PURE__ */ y(X, {
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
								children: [/* @__PURE__ */ y(Z, { children: "Map.ir API" }), /* @__PURE__ */ y(X, {
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
								children: [/* @__PURE__ */ y(Z, { children: "ORS Token" }), /* @__PURE__ */ y(X, {
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
								children: [/* @__PURE__ */ y(Z, { children: n("shipping.storeLat") }), /* @__PURE__ */ y(X, {
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
								children: [/* @__PURE__ */ y(Z, { children: n("shipping.storeLng") }), /* @__PURE__ */ y(X, {
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
	}) : /* @__PURE__ */ y(zl, {
		title: n("shipping.mapTitle"),
		children: /* @__PURE__ */ y("p", {
			className: "text-muted-foreground text-sm",
			children: n("common.loading")
		})
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/PackagingSettingsPage.tsx
function ku(e) {
	return Object.values(e.boxes).sort((e, t) => e.size - t.size);
}
function Au() {
	let { t: n } = m(), [r, i] = p(null), a = t({
		queryKey: ["shipping-packaging-settings"],
		queryFn: () => Q("shipping/packaging/settings")
	});
	yl(a), l(() => {
		a.data?.settings && i(a.data.settings);
	}, [a.data]);
	let o = e({
		mutationFn: (e) => Q("shipping/packaging/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ settings: e })
		}),
		onSuccess: (e) => {
			h.success(n("common.saved")), e.settings && i(e.settings);
		},
		onError: (e) => vl(n, e)
	}), s = d(() => r ? ku(r) : [], [r]);
	return r ? /* @__PURE__ */ b(zl, {
		title: n("shipping.packagingTitle"),
		description: n("shipping.packagingHint"),
		children: [
			/* @__PURE__ */ y("div", {
				className: "mb-4 flex justify-end",
				children: /* @__PURE__ */ y(G, {
					type: "button",
					disabled: o.isPending,
					onClick: () => o.mutate(r),
					children: n("common.save")
				})
			}),
			/* @__PURE__ */ b(K, {
				className: "mb-4 border-primary/20 shadow-sm",
				children: [/* @__PURE__ */ b(q, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(J, {
						className: "text-base",
						children: n("shipping.packagingMasterTitle")
					}), /* @__PURE__ */ y(Lc, { children: n("shipping.packagingMasterHint") })]
				}), /* @__PURE__ */ y(Y, { children: /* @__PURE__ */ b("label", {
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
			/* @__PURE__ */ b(K, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ b(q, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(J, {
						className: "text-base",
						children: n("shipping.checkoutToggleTitle")
					}), /* @__PURE__ */ y(Lc, { children: n("shipping.checkoutToggleHint") })]
				}), /* @__PURE__ */ y(Y, { children: /* @__PURE__ */ b("label", {
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
			/* @__PURE__ */ b(K, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ b(q, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(J, {
						className: "text-base",
						children: n("shipping.professionalFeeTitle")
					}), /* @__PURE__ */ y(Lc, { children: n("shipping.professionalFeeHint") })]
				}), /* @__PURE__ */ b(Y, {
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
								children: [/* @__PURE__ */ y(Z, {
									htmlFor: "prof-fee-label",
									children: n("shipping.professionalFeeLabel")
								}), /* @__PURE__ */ y(X, {
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
								children: [/* @__PURE__ */ y(Z, {
									htmlFor: "prof-fee-amount",
									children: n("shipping.professionalFeeAmount")
								}), /* @__PURE__ */ y(X, {
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
							children: [/* @__PURE__ */ y(Z, {
								htmlFor: "prof-fee-desc",
								children: n("shipping.professionalFeeDescription")
							}), /* @__PURE__ */ y(X, {
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
			/* @__PURE__ */ b(K, {
				className: "shadow-sm",
				children: [/* @__PURE__ */ b(q, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(J, {
						className: "text-base",
						children: n("shipping.boxesTitle")
					}), /* @__PURE__ */ y(Lc, { children: n("shipping.boxesHint") })]
				}), /* @__PURE__ */ b(Y, {
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
								children: [/* @__PURE__ */ y(Z, {
									className: "sm:sr-only",
									children: n("shipping.boxPrice")
								}), /* @__PURE__ */ y(X, {
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
								children: [/* @__PURE__ */ y(Z, {
									className: "sm:sr-only",
									children: n("shipping.boxTare")
								}), /* @__PURE__ */ y(X, {
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
	}) : /* @__PURE__ */ y(zl, {
		title: n("shipping.packagingTitle"),
		children: /* @__PURE__ */ y("p", {
			className: "text-muted-foreground text-sm",
			children: n("common.loading")
		})
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/RulesSettingsPage.tsx
var ju = [
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
], Mu = [
	"hide_method",
	"force_method",
	"set_cost",
	"free",
	"set_title"
];
function Nu() {
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
function Pu(e, t, n) {
	let r = e.slice();
	return r[t] = {
		...e[t],
		...n
	}, r;
}
function Fu() {
	let { t: n } = m(), [r, i] = p(!1), [a, o] = p([]), s = t({
		queryKey: ["shipping-rules"],
		queryFn: () => Q("shipping/rules")
	});
	yl(s), l(() => {
		s.data && (i(!!s.data.enabled), s.data.rules && o(s.data.rules));
	}, [s.data]);
	let c = e({
		mutationFn: (e) => Q("shipping/rules", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(e)
		}),
		onSuccess: () => h.success(n("common.saved")),
		onError: (e) => vl(n, e)
	});
	return /* @__PURE__ */ b(zl, {
		title: n("shipping.rulesTitle"),
		description: n("shipping.rulesHint"),
		children: [
			/* @__PURE__ */ y(K, {
				className: "mb-4 border-primary/20 shadow-sm",
				children: /* @__PURE__ */ y(Y, {
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
				children: [/* @__PURE__ */ y(G, {
					type: "button",
					variant: "secondary",
					onClick: () => o((e) => [...e, Nu()]),
					children: n("shipping.addRule")
				}), /* @__PURE__ */ y(G, {
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
				children: a.map((e, t) => /* @__PURE__ */ b(K, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ b(q, {
						className: "flex flex-row items-center justify-between gap-2 pb-2",
						children: [/* @__PURE__ */ y(J, {
							className: "text-base",
							children: e.title || n("shipping.ruleN", { n: t + 1 })
						}), /* @__PURE__ */ b("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ y($, {
								checked: e.enabled,
								onCheckedChange: (e) => o(Pu(a, t, { enabled: e }))
							}), /* @__PURE__ */ y(G, {
								type: "button",
								size: "sm",
								variant: "ghost",
								onClick: () => o(a.filter((e, n) => n !== t)),
								children: n("common.delete")
							})]
						})]
					}), /* @__PURE__ */ b(Y, {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ b("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ b("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ y(Z, { children: n("shipping.ruleTitle") }), /* @__PURE__ */ y(X, {
										value: e.title,
										onChange: (e) => o(Pu(a, t, { title: e.target.value }))
									})]
								}), /* @__PURE__ */ b("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ y(Z, { children: n("shipping.rulePriority") }), /* @__PURE__ */ y(X, {
										type: "number",
										dir: "ltr",
										value: e.priority,
										onChange: (e) => o(Pu(a, t, { priority: parseInt(e.target.value, 10) || 0 }))
									})]
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ b("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ y(Z, { children: n("shipping.conditions") }), /* @__PURE__ */ y(G, {
										type: "button",
										size: "sm",
										variant: "outline",
										onClick: () => o(Pu(a, t, { conditions: [...e.conditions, {
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
										/* @__PURE__ */ b(iu, {
											value: r.type || "cart_total_min",
											onValueChange: (n) => {
												let s = e.conditions.slice();
												s[i] = {
													...r,
													type: n
												}, o(Pu(a, t, { conditions: s }));
											},
											children: [/* @__PURE__ */ y(ou, { children: /* @__PURE__ */ y(au, {}) }), /* @__PURE__ */ y(su, { children: ju.map((e) => /* @__PURE__ */ y(cu, {
												value: e,
												children: e
											}, e)) })]
										}),
										/* @__PURE__ */ y(X, {
											dir: "ltr",
											value: String(r.value ?? ""),
											onChange: (n) => {
												let s = e.conditions.slice();
												s[i] = {
													...r,
													value: n.target.value
												}, o(Pu(a, t, { conditions: s }));
											}
										}),
										/* @__PURE__ */ y(G, {
											type: "button",
											size: "sm",
											variant: "ghost",
											disabled: e.conditions.length <= 1,
											onClick: () => o(Pu(a, t, { conditions: e.conditions.filter((e, t) => t !== i) })),
											children: n("common.delete")
										})
									]
								}, `${e.id}-c-${i}`))]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ b("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ y(Z, { children: n("shipping.actions") }), /* @__PURE__ */ y(G, {
										type: "button",
										size: "sm",
										variant: "outline",
										onClick: () => o(Pu(a, t, { actions: [...e.actions, {
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
										/* @__PURE__ */ b(iu, {
											value: r.type || "free",
											onValueChange: (n) => {
												let s = e.actions.slice();
												s[i] = {
													...r,
													type: n
												}, o(Pu(a, t, { actions: s }));
											},
											children: [/* @__PURE__ */ y(ou, { children: /* @__PURE__ */ y(au, {}) }), /* @__PURE__ */ y(su, { children: Mu.map((e) => /* @__PURE__ */ y(cu, {
												value: e,
												children: e
											}, e)) })]
										}),
										/* @__PURE__ */ y(X, {
											dir: "ltr",
											placeholder: "webino_tapin_pishtaz",
											value: r.method_id || "",
											onChange: (n) => {
												let s = e.actions.slice();
												s[i] = {
													...r,
													method_id: n.target.value
												}, o(Pu(a, t, { actions: s }));
											}
										}),
										/* @__PURE__ */ y(X, {
											dir: "ltr",
											value: String(r.value ?? ""),
											onChange: (n) => {
												let s = e.actions.slice();
												s[i] = {
													...r,
													value: n.target.value
												}, o(Pu(a, t, { actions: s }));
											}
										}),
										/* @__PURE__ */ y(G, {
											type: "button",
											size: "sm",
											variant: "ghost",
											disabled: e.actions.length <= 1,
											onClick: () => o(Pu(a, t, { actions: e.actions.filter((e, t) => t !== i) })),
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
var Iu = () => ({
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
function Lu() {
	let { t: n } = m(), [r, i] = p(null), a = t({
		queryKey: ["shipping-tools"],
		queryFn: () => Q("shipping/tools/settings")
	});
	yl(a), l(() => {
		a.data?.settings && i({
			...Iu(),
			...a.data.settings
		});
	}, [a.data]);
	let o = e({
		mutationFn: (e) => Q("shipping/tools/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ settings: e })
		}),
		onSuccess: () => h.success(n("common.saved")),
		onError: (e) => vl(n, e)
	});
	return r ? /* @__PURE__ */ b(zl, {
		title: n("shipping.toolsTitle"),
		description: n("shipping.toolsHint"),
		children: [
			/* @__PURE__ */ y("div", {
				className: "mb-4 flex justify-end",
				children: /* @__PURE__ */ y(G, {
					type: "button",
					disabled: o.isPending,
					onClick: () => o.mutate(r),
					children: n("common.save")
				})
			}),
			/* @__PURE__ */ b(K, {
				className: "mb-4 border-primary/20 shadow-sm",
				children: [/* @__PURE__ */ y(q, {
					className: "pb-2",
					children: /* @__PURE__ */ y(J, {
						className: "text-base",
						children: n("shipping.toolsMasterTitle")
					})
				}), /* @__PURE__ */ y(Y, { children: /* @__PURE__ */ b("label", {
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
			/* @__PURE__ */ b(K, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ y(q, {
					className: "pb-2",
					children: /* @__PURE__ */ y(J, {
						className: "text-base",
						children: n("shipping.toolsRatesTitle")
					})
				}), /* @__PURE__ */ b(Y, {
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
			/* @__PURE__ */ b(K, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ y(q, {
					className: "pb-2",
					children: /* @__PURE__ */ y(J, {
						className: "text-base",
						children: n("shipping.toolsWeightTitle")
					})
				}), /* @__PURE__ */ b(Y, {
					className: "grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(Z, { children: n("shipping.defaultProductWeight") }), /* @__PURE__ */ y(X, {
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
							children: [/* @__PURE__ */ y(Z, { children: n("shipping.defaultPackageWeight") }), /* @__PURE__ */ y(X, {
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
							children: [/* @__PURE__ */ y(Z, { children: n("shipping.postWeightLimit") }), /* @__PURE__ */ y(X, {
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
			/* @__PURE__ */ b(K, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ y(q, {
					className: "pb-2",
					children: /* @__PURE__ */ y(J, {
						className: "text-base",
						children: n("shipping.proUxTitle")
					})
				}), /* @__PURE__ */ b(Y, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(Z, { children: n("shipping.freeShippingTitle") }), /* @__PURE__ */ y(X, {
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
			/* @__PURE__ */ b(K, {
				className: "shadow-sm",
				children: [/* @__PURE__ */ b(q, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(J, {
						className: "text-base",
						children: n("shipping.methodImagesTitle")
					}), /* @__PURE__ */ y(Lc, { children: n("shipping.methodImagesHint") })]
				}), /* @__PURE__ */ y(Y, {
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
						children: [/* @__PURE__ */ y(Z, {
							dir: "ltr",
							children: e
						}), /* @__PURE__ */ y(X, {
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
	}) : /* @__PURE__ */ y(zl, {
		title: n("shipping.toolsTitle"),
		children: /* @__PURE__ */ y("p", {
			className: "text-muted-foreground text-sm",
			children: n("common.loading")
		})
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/TransportHubPage.tsx
var Ru = [
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
function zu() {
	let { t: r } = m(), i = n(), a = t({
		queryKey: ["shipping-hub-status"],
		queryFn: () => Q("shipping/hub/status")
	}), o = e({
		mutationFn: (e) => Q("shipping/hub/toggle", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(e)
		}),
		onSuccess: (e) => {
			i.setQueryData(["shipping-hub-status"], e), i.invalidateQueries({ queryKey: ["shop-locations-states"] }), h.success(r("common.saved"));
		},
		onError: (e) => vl(r, e)
	}), s = a.data?.sections;
	return /* @__PURE__ */ b(zl, {
		title: r("shipping.hubTitle"),
		children: [/* @__PURE__ */ y("p", {
			className: "text-muted-foreground mb-4 text-sm",
			children: r("shipping.hubHint")
		}), /* @__PURE__ */ y("div", {
			className: "grid gap-4 md:grid-cols-2",
			children: Ru.map((e) => {
				let t = e.sectionKey && s ? !!s[e.sectionKey] : null;
				return /* @__PURE__ */ b(K, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ y(q, {
						className: "pb-2",
						children: /* @__PURE__ */ b("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ b("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ b("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ y(J, {
										className: "text-base",
										children: r(e.title)
									}), e.sectionKey && t !== null ? /* @__PURE__ */ y(pu, {
										variant: t ? "default" : "secondary",
										children: r(t ? "shipping.statusOn" : "shipping.statusOff")
									}) : null]
								}), /* @__PURE__ */ y(Lc, { children: r(e.hint) })]
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
					}), /* @__PURE__ */ y(Y, { children: /* @__PURE__ */ y(G, {
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
var Bu = {
	"settings/shop/transport": zu,
	"settings/shop/transport/packaging": Au,
	"settings/shop/transport/tools": Lu,
	"settings/shop/transport/cities": du,
	"settings/shop/transport/map": Ou,
	"settings/shop/transport/rules": Fu,
	"settings/shop/transport/item-cost": Du
}, Vu = {
	OrderPackagingPanel: Rl,
	OrderMapPanel: Cl
}, Hu = {
	routes: Bu,
	components: Vu
};
//#endregion
export { Vu as components, Hu as default, Bu as routes };
