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
var I = Object.freeze({
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
}), ne = "VisuallyHidden", re = r.forwardRef((e, t) => /* @__PURE__ */ y(F.span, {
	...e,
	ref: t,
	style: {
		...I,
		...e.style
	}
}));
re.displayName = ne;
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
//#region node_modules/@radix-ui/react-id/dist/index.mjs
var he = r.useId || (() => void 0), ge = 0;
function _e(e) {
	let [t, n] = r.useState(he());
	return ue(() => {
		e || n((e) => e ?? String(ge++));
	}, [e]), e || (t ? `radix-${t}` : "");
}
//#endregion
//#region node_modules/@radix-ui/react-direction/dist/index.mjs
var ve = r.createContext(void 0);
function ye(e) {
	let t = r.useContext(ve);
	return e || t || "ltr";
}
//#endregion
//#region node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
function be(e) {
	let t = r.useRef(e);
	return r.useEffect(() => {
		t.current = e;
	}), r.useMemo(() => (...e) => t.current?.(...e), []);
}
//#endregion
//#region node_modules/@radix-ui/react-use-escape-keydown/dist/index.mjs
function xe(e, t = globalThis?.document) {
	let n = be(e);
	r.useEffect(() => {
		let e = (e) => {
			e.key === "Escape" && n(e);
		};
		return t.addEventListener("keydown", e, { capture: !0 }), () => t.removeEventListener("keydown", e, { capture: !0 });
	}, [n, t]);
}
//#endregion
//#region node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var Se = "DismissableLayer", Ce = "dismissableLayer.update", we = "dismissableLayer.pointerDownOutside", Te = "dismissableLayer.focusOutside", Ee, De = r.createContext({
	layers: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), Oe = r.forwardRef((e, t) => {
	let { disableOutsidePointerEvents: n = !1, onEscapeKeyDown: i, onPointerDownOutside: a, onFocusOutside: o, onInteractOutside: s, onDismiss: c, ...l } = e, u = r.useContext(De), [d, f] = r.useState(null), p = d?.ownerDocument ?? globalThis?.document, [, m] = r.useState({}), h = k(t, (e) => f(e)), g = Array.from(u.layers), [_] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1), v = g.indexOf(_), b = d ? g.indexOf(d) : -1, x = u.layersWithOutsidePointerEventsDisabled.size > 0, S = b >= v, C = je((e) => {
		let t = e.target, n = [...u.branches].some((e) => e.contains(t));
		!S || n || (a?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p), w = Me((e) => {
		let t = e.target;
		[...u.branches].some((e) => e.contains(t)) || (o?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p);
	return xe((e) => {
		b === u.layers.size - 1 && (i?.(e), !e.defaultPrevented && c && (e.preventDefault(), c()));
	}, p), r.useEffect(() => {
		if (d) return n && (u.layersWithOutsidePointerEventsDisabled.size === 0 && (Ee = p.body.style.pointerEvents, p.body.style.pointerEvents = "none"), u.layersWithOutsidePointerEventsDisabled.add(d)), u.layers.add(d), Ne(), () => {
			n && u.layersWithOutsidePointerEventsDisabled.size === 1 && (p.body.style.pointerEvents = Ee);
		};
	}, [
		d,
		p,
		n,
		u
	]), r.useEffect(() => () => {
		d && (u.layers.delete(d), u.layersWithOutsidePointerEventsDisabled.delete(d), Ne());
	}, [d, u]), r.useEffect(() => {
		let e = () => m({});
		return document.addEventListener(Ce, e), () => document.removeEventListener(Ce, e);
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
Oe.displayName = Se;
var ke = "DismissableLayerBranch", Ae = r.forwardRef((e, t) => {
	let n = r.useContext(De), i = r.useRef(null), a = k(t, i);
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
Ae.displayName = ke;
function je(e, t = globalThis?.document) {
	let n = be(e), i = r.useRef(!1), a = r.useRef(() => {});
	return r.useEffect(() => {
		let e = (e) => {
			if (e.target && !i.current) {
				let r = function() {
					Pe(we, n, i, { discrete: !0 });
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
function Me(e, t = globalThis?.document) {
	let n = be(e), i = r.useRef(!1);
	return r.useEffect(() => {
		let e = (e) => {
			e.target && !i.current && Pe(Te, n, { originalEvent: e }, { discrete: !1 });
		};
		return t.addEventListener("focusin", e), () => t.removeEventListener("focusin", e);
	}, [t, n]), {
		onFocusCapture: () => i.current = !0,
		onBlurCapture: () => i.current = !1
	};
}
function Ne() {
	let e = new CustomEvent(Ce);
	document.dispatchEvent(e);
}
function Pe(e, t, n, { discrete: r }) {
	let i = n.originalEvent.target, a = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && i.addEventListener(e, t, { once: !0 }), r ? te(i, a) : i.dispatchEvent(a);
}
//#endregion
//#region node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var Fe = "focusScope.autoFocusOnMount", Ie = "focusScope.autoFocusOnUnmount", Le = {
	bubbles: !1,
	cancelable: !0
}, Re = "FocusScope", ze = r.forwardRef((e, t) => {
	let { loop: n = !1, trapped: i = !1, onMountAutoFocus: a, onUnmountAutoFocus: o, ...s } = e, [c, l] = r.useState(null), u = be(a), d = be(o), f = r.useRef(null), p = k(t, (e) => l(e)), m = r.useRef({
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
				c.contains(t) ? f.current = t : Ke(f.current, { select: !0 });
			}, t = function(e) {
				if (m.paused || !c) return;
				let t = e.relatedTarget;
				t !== null && (c.contains(t) || Ke(f.current, { select: !0 }));
			}, n = function(e) {
				if (document.activeElement === document.body) for (let t of e) t.removedNodes.length > 0 && Ke(c);
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
			qe.add(m);
			let e = document.activeElement;
			if (!c.contains(e)) {
				let t = new CustomEvent(Fe, Le);
				c.addEventListener(Fe, u), c.dispatchEvent(t), t.defaultPrevented || (Be(Xe(He(c)), { select: !0 }), document.activeElement === e && Ke(c));
			}
			return () => {
				c.removeEventListener(Fe, u), setTimeout(() => {
					let t = new CustomEvent(Ie, Le);
					c.addEventListener(Ie, d), c.dispatchEvent(t), t.defaultPrevented || Ke(e ?? document.body, { select: !0 }), c.removeEventListener(Ie, d), qe.remove(m);
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
			let t = e.currentTarget, [i, a] = Ve(t);
			i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n && Ke(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n && Ke(a, { select: !0 })) : r === t && e.preventDefault();
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
ze.displayName = Re;
function Be(e, { select: t = !1 } = {}) {
	let n = document.activeElement;
	for (let r of e) if (Ke(r, { select: t }), document.activeElement !== n) return;
}
function Ve(e) {
	let t = He(e);
	return [Ue(t, e), Ue(t.reverse(), e)];
}
function He(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t;
}
function Ue(e, t) {
	for (let n of e) if (!We(n, { upTo: t })) return n;
}
function We(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function Ge(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function Ke(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = document.activeElement;
		e.focus({ preventScroll: !0 }), e !== n && Ge(e) && t && e.select();
	}
}
var qe = Je();
function Je() {
	let e = [];
	return {
		add(t) {
			let n = e[0];
			t !== n && n?.pause(), e = Ye(e, t), e.unshift(t);
		},
		remove(t) {
			e = Ye(e, t), e[0]?.resume();
		}
	};
}
function Ye(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
function Xe(e) {
	return e.filter((e) => e.tagName !== "A");
}
//#endregion
//#region node_modules/@radix-ui/react-portal/dist/index.mjs
var Ze = "Portal", Qe = r.forwardRef((e, t) => {
	let { container: n, ...i } = e, [a, o] = r.useState(!1);
	ue(() => o(!0), []);
	let s = n || a && globalThis?.document?.body;
	return s ? _.createPortal(/* @__PURE__ */ y(F.div, {
		...i,
		ref: t
	}), s) : null;
});
Qe.displayName = Ze;
//#endregion
//#region node_modules/@radix-ui/react-focus-guards/dist/index.mjs
var $e = 0;
function et() {
	r.useEffect(() => {
		let e = document.querySelectorAll("[data-radix-focus-guard]");
		return document.body.insertAdjacentElement("afterbegin", e[0] ?? tt()), document.body.insertAdjacentElement("beforeend", e[1] ?? tt()), $e++, () => {
			$e === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((e) => e.remove()), $e--;
		};
	}, []);
}
function tt() {
	let e = document.createElement("span");
	return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
//#endregion
//#region node_modules/tslib/tslib.es6.mjs
var nt = function() {
	return nt = Object.assign || function(e) {
		for (var t, n = 1, r = arguments.length; n < r; n++) for (var i in t = arguments[n], t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
		return e;
	}, nt.apply(this, arguments);
};
function rt(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
function it(e, t, n) {
	if (n || arguments.length === 2) for (var r = 0, i = t.length, a; r < i; r++) (a || !(r in t)) && (a || (a = Array.prototype.slice.call(t, 0, r)), a[r] = t[r]);
	return e.concat(a || Array.prototype.slice.call(t));
}
//#endregion
//#region node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var at = "right-scroll-bar-position", ot = "width-before-scroll-bar", st = "with-scroll-bars-hidden", ct = "--removed-body-scroll-bar-size";
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/assignRef.js
function lt(e, t) {
	return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/useRef.js
function ut(e, t) {
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
var dt = typeof window < "u" ? r.useLayoutEffect : r.useEffect, ft = /* @__PURE__ */ new WeakMap();
function pt(e, t) {
	var n = ut(t || null, function(t) {
		return e.forEach(function(e) {
			return lt(e, t);
		});
	});
	return dt(function() {
		var t = ft.get(n);
		if (t) {
			var r = new Set(t), i = new Set(e), a = n.current;
			r.forEach(function(e) {
				i.has(e) || lt(e, null);
			}), i.forEach(function(e) {
				r.has(e) || lt(e, a);
			});
		}
		ft.set(n, e);
	}, [e]), n;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/medium.js
function mt(e) {
	return e;
}
function ht(e, t) {
	t === void 0 && (t = mt);
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
function gt(e) {
	e === void 0 && (e = {});
	var t = ht(null);
	return t.options = nt({
		async: !0,
		ssr: !1
	}, e), t;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/exports.js
var _t = function(e) {
	var t = e.sideCar, n = rt(e, ["sideCar"]);
	if (!t) throw Error("Sidecar: please provide `sideCar` property to import the right car");
	var i = t.read();
	if (!i) throw Error("Sidecar medium not found");
	return r.createElement(i, nt({}, n));
};
_t.isSideCarExport = !0;
function vt(e, t) {
	return e.useMedium(t), _t;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/medium.js
var yt = gt(), bt = function() {}, xt = r.forwardRef(function(e, t) {
	var n = r.useRef(null), i = r.useState({
		onScrollCapture: bt,
		onWheelCapture: bt,
		onTouchMoveCapture: bt
	}), a = i[0], o = i[1], s = e.forwardProps, c = e.children, l = e.className, u = e.removeScrollBar, d = e.enabled, f = e.shards, p = e.sideCar, m = e.noRelative, h = e.noIsolation, g = e.inert, _ = e.allowPinchZoom, v = e.as, y = v === void 0 ? "div" : v, b = e.gapMode, x = rt(e, [
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
	]), S = p, C = pt([n, t]), w = nt(nt({}, x), a);
	return r.createElement(r.Fragment, null, d && r.createElement(S, {
		sideCar: yt,
		removeScrollBar: u,
		shards: f,
		noRelative: m,
		noIsolation: h,
		inert: g,
		setCallbacks: o,
		allowPinchZoom: !!_,
		lockRef: n,
		gapMode: b
	}), s ? r.cloneElement(r.Children.only(c), nt(nt({}, w), { ref: C })) : r.createElement(y, nt({}, w, {
		className: l,
		ref: C
	}), c));
});
xt.defaultProps = {
	enabled: !0,
	removeScrollBar: !0,
	inert: !1
}, xt.classNames = {
	fullWidth: ot,
	zeroRight: at
};
//#endregion
//#region node_modules/get-nonce/dist/es2015/index.js
var St, Ct = function() {
	if (St) return St;
	if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
//#endregion
//#region node_modules/react-style-singleton/dist/es2015/singleton.js
function wt() {
	if (!document) return null;
	var e = document.createElement("style");
	e.type = "text/css";
	var t = Ct();
	return t && e.setAttribute("nonce", t), e;
}
function Tt(e, t) {
	e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function Et(e) {
	(document.head || document.getElementsByTagName("head")[0]).appendChild(e);
}
var Dt = function() {
	var e = 0, t = null;
	return {
		add: function(n) {
			e == 0 && (t = wt()) && (Tt(t, n), Et(t)), e++;
		},
		remove: function() {
			e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
		}
	};
}, Ot = function() {
	var e = Dt();
	return function(t, n) {
		r.useEffect(function() {
			return e.add(t), function() {
				e.remove();
			};
		}, [t && n]);
	};
}, kt = function() {
	var e = Ot();
	return function(t) {
		var n = t.styles, r = t.dynamic;
		return e(n, r), null;
	};
}, At = {
	left: 0,
	top: 0,
	right: 0,
	gap: 0
}, jt = function(e) {
	return parseInt(e || "", 10) || 0;
}, Mt = function(e) {
	var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
	return [
		jt(n),
		jt(r),
		jt(i)
	];
}, Nt = function(e) {
	if (e === void 0 && (e = "margin"), typeof window > "u") return At;
	var t = Mt(e), n = document.documentElement.clientWidth, r = window.innerWidth;
	return {
		left: t[0],
		top: t[1],
		right: t[2],
		gap: Math.max(0, r - n + t[2] - t[0])
	};
}, Pt = kt(), Ft = "data-scroll-locked", It = function(e, t, n, r) {
	var i = e.left, a = e.top, o = e.right, s = e.gap;
	return n === void 0 && (n = "margin"), `
  .${st} {
   overflow: hidden ${r};
   padding-right: ${s}px ${r};
  }
  body[${Ft}] {
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
  
  .${at} {
    right: ${s}px ${r};
  }
  
  .${ot} {
    margin-right: ${s}px ${r};
  }
  
  .${at} .${at} {
    right: 0 ${r};
  }
  
  .${ot} .${ot} {
    margin-right: 0 ${r};
  }
  
  body[${Ft}] {
    ${ct}: ${s}px;
  }
`;
}, Lt = function() {
	var e = parseInt(document.body.getAttribute("data-scroll-locked") || "0", 10);
	return isFinite(e) ? e : 0;
}, Rt = function() {
	r.useEffect(function() {
		return document.body.setAttribute(Ft, (Lt() + 1).toString()), function() {
			var e = Lt() - 1;
			e <= 0 ? document.body.removeAttribute(Ft) : document.body.setAttribute(Ft, e.toString());
		};
	}, []);
}, zt = function(e) {
	var t = e.noRelative, n = e.noImportant, i = e.gapMode, a = i === void 0 ? "margin" : i;
	Rt();
	var o = r.useMemo(function() {
		return Nt(a);
	}, [a]);
	return r.createElement(Pt, { styles: It(o, !t, a, n ? "" : "!important") });
}, Bt = !1;
if (typeof window < "u") try {
	var Vt = Object.defineProperty({}, "passive", { get: function() {
		return Bt = !0, !0;
	} });
	window.addEventListener("test", Vt, Vt), window.removeEventListener("test", Vt, Vt);
} catch {
	Bt = !1;
}
var Ht = Bt ? { passive: !1 } : !1, Ut = function(e) {
	return e.tagName === "TEXTAREA";
}, Wt = function(e, t) {
	if (!(e instanceof Element)) return !1;
	var n = window.getComputedStyle(e);
	return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !Ut(e) && n[t] === "visible");
}, Gt = function(e) {
	return Wt(e, "overflowY");
}, Kt = function(e) {
	return Wt(e, "overflowX");
}, qt = function(e, t) {
	var n = t.ownerDocument, r = t;
	do {
		if (typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host), Xt(e, r)) {
			var i = Zt(e, r);
			if (i[1] > i[2]) return !0;
		}
		r = r.parentNode;
	} while (r && r !== n.body);
	return !1;
}, Jt = function(e) {
	return [
		e.scrollTop,
		e.scrollHeight,
		e.clientHeight
	];
}, Yt = function(e) {
	return [
		e.scrollLeft,
		e.scrollWidth,
		e.clientWidth
	];
}, Xt = function(e, t) {
	return e === "v" ? Gt(t) : Kt(t);
}, Zt = function(e, t) {
	return e === "v" ? Jt(t) : Yt(t);
}, Qt = function(e, t) {
	return e === "h" && t === "rtl" ? -1 : 1;
}, $t = function(e, t, n, r, i) {
	var a = Qt(e, window.getComputedStyle(t).direction), o = a * r, s = n.target, c = t.contains(s), l = !1, u = o > 0, d = 0, f = 0;
	do {
		if (!s) break;
		var p = Zt(e, s), m = p[0], h = p[1] - p[2] - a * m;
		(m || h) && Xt(e, s) && (d += h, f += m);
		var g = s.parentNode;
		s = g && g.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? g.host : g;
	} while (!c && s !== document.body || c && (t.contains(s) || t === s));
	return (u && (i && Math.abs(d) < 1 || !i && o > d) || !u && (i && Math.abs(f) < 1 || !i && -o > f)) && (l = !0), l;
}, en = function(e) {
	return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, tn = function(e) {
	return [e.deltaX, e.deltaY];
}, nn = function(e) {
	return e && "current" in e ? e.current : e;
}, rn = function(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}, an = function(e) {
	return `
  .block-interactivity-${e} {pointer-events: none;}
  .allow-interactivity-${e} {pointer-events: all;}
`;
}, on = 0, sn = [];
function cn(e) {
	var t = r.useRef([]), n = r.useRef([0, 0]), i = r.useRef(), a = r.useState(on++)[0], o = r.useState(kt)[0], s = r.useRef(e);
	r.useEffect(function() {
		s.current = e;
	}, [e]), r.useEffect(function() {
		if (e.inert) {
			document.body.classList.add(`block-interactivity-${a}`);
			var t = it([e.lockRef.current], (e.shards || []).map(nn), !0).filter(Boolean);
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
		var r = en(e), a = n.current, o = "deltaX" in e ? e.deltaX : a[0] - r[0], c = "deltaY" in e ? e.deltaY : a[1] - r[1], l, u = e.target, d = Math.abs(o) > Math.abs(c) ? "h" : "v";
		if ("touches" in e && d === "h" && u.type === "range") return !1;
		var f = window.getSelection(), p = f && f.anchorNode;
		if (p && (p === u || p.contains(u))) return !1;
		var m = qt(d, u);
		if (!m) return !0;
		if (m ? l = d : (l = d === "v" ? "h" : "v", m = qt(d, u)), !m) return !1;
		if (!i.current && "changedTouches" in e && (o || c) && (i.current = l), !l) return !0;
		var h = i.current || l;
		return $t(h, t, e, h === "h" ? o : c, !0);
	}, []), l = r.useCallback(function(e) {
		var n = e;
		if (!(!sn.length || sn[sn.length - 1] !== o)) {
			var r = "deltaY" in n ? tn(n) : en(n), i = t.current.filter(function(e) {
				return e.name === n.type && (e.target === n.target || n.target === e.shadowParent) && rn(e.delta, r);
			})[0];
			if (i && i.should) {
				n.cancelable && n.preventDefault();
				return;
			}
			if (!i) {
				var a = (s.current.shards || []).map(nn).filter(Boolean).filter(function(e) {
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
			shadowParent: ln(r)
		};
		t.current.push(a), setTimeout(function() {
			t.current = t.current.filter(function(e) {
				return e !== a;
			});
		}, 1);
	}, []), d = r.useCallback(function(e) {
		n.current = en(e), i.current = void 0;
	}, []), f = r.useCallback(function(t) {
		u(t.type, tn(t), t.target, c(t, e.lockRef.current));
	}, []), p = r.useCallback(function(t) {
		u(t.type, en(t), t.target, c(t, e.lockRef.current));
	}, []);
	r.useEffect(function() {
		return sn.push(o), e.setCallbacks({
			onScrollCapture: f,
			onWheelCapture: f,
			onTouchMoveCapture: p
		}), document.addEventListener("wheel", l, Ht), document.addEventListener("touchmove", l, Ht), document.addEventListener("touchstart", d, Ht), function() {
			sn = sn.filter(function(e) {
				return e !== o;
			}), document.removeEventListener("wheel", l, Ht), document.removeEventListener("touchmove", l, Ht), document.removeEventListener("touchstart", d, Ht);
		};
	}, []);
	var m = e.removeScrollBar, h = e.inert;
	return r.createElement(r.Fragment, null, h ? r.createElement(o, { styles: an(a) }) : null, m ? r.createElement(zt, {
		noRelative: e.noRelative,
		gapMode: e.gapMode
	}) : null);
}
function ln(e) {
	for (var t = null; e !== null;) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
	return t;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/sidecar.js
var un = vt(yt, cn), dn = r.forwardRef(function(e, t) {
	return r.createElement(xt, nt({}, e, {
		ref: t,
		sideCar: un
	}));
});
dn.classNames = xt.classNames;
//#endregion
//#region src/lib/remove-scroll-gate.tsx
var fn = r.createContext(!1);
function pn({ allowBodyScroll: e, children: t }) {
	return /* @__PURE__ */ y(fn.Provider, {
		value: e,
		children: t
	});
}
function mn() {
	return r.useContext(fn);
}
//#endregion
//#region src/lib/react-remove-scroll-shim.tsx
var hn = r.forwardRef(function(e, t) {
	let n = mn() ? !1 : e.enabled !== !1;
	return /* @__PURE__ */ y(dn, {
		...e,
		ref: t,
		enabled: n
	});
});
hn.classNames = dn.classNames;
//#endregion
//#region node_modules/aria-hidden/dist/es2015/index.js
var gn = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, _n = /* @__PURE__ */ new WeakMap(), vn = /* @__PURE__ */ new WeakMap(), yn = {}, bn = 0, xn = function(e) {
	return e && (e.host || xn(e.parentNode));
}, Sn = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = xn(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, Cn = function(e, t, n, r) {
	var i = Sn(t, Array.isArray(e) ? e : [e]);
	yn[n] || (yn[n] = /* @__PURE__ */ new WeakMap());
	var a = yn[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		!e || s.has(e) || (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		!e || c.has(e) || Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (_n.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				_n.set(e, c), a.set(e, l), o.push(e), c === 1 && i && vn.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), bn++, function() {
		o.forEach(function(e) {
			var t = _n.get(e) - 1, i = a.get(e) - 1;
			_n.set(e, t), a.set(e, i), t || (vn.has(e) || e.removeAttribute(r), vn.delete(e)), i || e.removeAttribute(n);
		}), bn--, bn || (_n = /* @__PURE__ */ new WeakMap(), _n = /* @__PURE__ */ new WeakMap(), vn = /* @__PURE__ */ new WeakMap(), yn = {});
	};
}, wn = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || gn(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), Cn(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function Tn(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function En(e) {
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
var Dn = [
	"top",
	"right",
	"bottom",
	"left"
], On = Math.min, kn = Math.max, An = Math.round, jn = Math.floor, Mn = (e) => ({
	x: e,
	y: e
}), Nn = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function Pn(e, t, n) {
	return kn(e, On(t, n));
}
function Fn(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function In(e) {
	return e.split("-")[0];
}
function Ln(e) {
	return e.split("-")[1];
}
function Rn(e) {
	return e === "x" ? "y" : "x";
}
function zn(e) {
	return e === "y" ? "height" : "width";
}
function Bn(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function Vn(e) {
	return Rn(Bn(e));
}
function Hn(e, t, n) {
	n === void 0 && (n = !1);
	let r = Ln(e), i = Vn(e), a = zn(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = Zn(o)), [o, Zn(o)];
}
function Un(e) {
	let t = Zn(e);
	return [
		Wn(e),
		t,
		Wn(t)
	];
}
function Wn(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var Gn = ["left", "right"], Kn = ["right", "left"], qn = ["top", "bottom"], Jn = ["bottom", "top"];
function Yn(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? Kn : Gn : t ? Gn : Kn;
		case "left":
		case "right": return t ? qn : Jn;
		default: return [];
	}
}
function Xn(e, t, n, r) {
	let i = Ln(e), a = Yn(In(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(Wn)))), a;
}
function Zn(e) {
	let t = In(e);
	return Nn[t] + e.slice(t.length);
}
function Qn(e) {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...e
	};
}
function $n(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : Qn(e);
}
function er(e) {
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
function tr(e, t, n) {
	let { reference: r, floating: i } = e, a = Bn(t), o = Vn(t), s = zn(o), c = In(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	switch (Ln(t)) {
		case "start":
			p[o] -= f * (n && l ? -1 : 1);
			break;
		case "end":
			p[o] += f * (n && l ? -1 : 1);
			break;
	}
	return p;
}
async function nr(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = Fn(t, e), p = $n(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = er(await i.getClippingRect({
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
	}, y = er(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var rr = 50, ir = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: nr
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = tr(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < rr && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = tr(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, ar = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = Fn(e, t) || {};
		if (l == null) return {};
		let d = $n(u), f = {
			x: n,
			y: r
		}, p = Vn(i), m = zn(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = On(d[_], T), D = On(d[v], T), O = E, k = C - h[m] - D, A = C / 2 - h[m] / 2 + w, j = Pn(O, A, k), M = !c.arrow && Ln(i) != null && A !== j && a.reference[m] / 2 - (A < O ? E : D) - h[m] / 2 < 0, N = M ? A < O ? A - O : A - k : 0;
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
}), or = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = Fn(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = In(r), _ = Bn(o), v = In(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [Zn(o)] : Un(o)), x = p !== "none";
			!d && x && b.push(...Xn(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = Hn(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (!(u === "alignment" && _ !== Bn(t)) || T.every((e) => Bn(e.placement) === _ ? e.overflows[0] > 0 : !0))) return {
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
								let t = Bn(e.placement);
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
function sr(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function cr(e) {
	return Dn.some((t) => e[t] >= 0);
}
var lr = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = Fn(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = sr(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: cr(e)
					} };
				}
				case "escaped": {
					let e = sr(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: cr(e)
					} };
				}
				default: return {};
			}
		}
	};
}, ur = /* @__PURE__ */ new Set(["left", "top"]);
async function dr(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = In(n), s = Ln(n), c = Bn(n) === "y", l = ur.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = Fn(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var fr = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await dr(t, e);
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
}, pr = function(e) {
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
			} }, ...l } = Fn(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = Bn(In(i)), p = Rn(f), m = u[p], h = u[f];
			if (o) {
				let e = p === "y" ? "top" : "left", t = p === "y" ? "bottom" : "right", n = m + d[e], r = m - d[t];
				m = Pn(n, m, r);
			}
			if (s) {
				let e = f === "y" ? "top" : "left", t = f === "y" ? "bottom" : "right", n = h + d[e], r = h - d[t];
				h = Pn(n, h, r);
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
}, mr = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = Fn(e, t), u = {
				x: n,
				y: r
			}, d = Bn(i), f = Rn(d), p = u[f], m = u[d], h = Fn(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = ur.has(In(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, hr = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			var n, r;
			let { placement: i, rects: a, platform: o, elements: s } = t, { apply: c = () => {}, ...l } = Fn(e, t), u = await o.detectOverflow(t, l), d = In(i), f = Ln(i), p = Bn(i) === "y", { width: m, height: h } = a.floating, g, _;
			d === "top" || d === "bottom" ? (g = d, _ = f === (await (o.isRTL == null ? void 0 : o.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (_ = d, g = f === "end" ? "top" : "bottom");
			let v = h - u.top - u.bottom, y = m - u.left - u.right, b = On(h - u[g], v), x = On(m - u[_], y), S = !t.middlewareData.shift, C = b, w = x;
			if ((n = t.middlewareData.shift) != null && n.enabled.x && (w = y), (r = t.middlewareData.shift) != null && r.enabled.y && (C = v), S && !f) {
				let e = kn(u.left, 0), t = kn(u.right, 0), n = kn(u.top, 0), r = kn(u.bottom, 0);
				p ? w = m - 2 * (e !== 0 || t !== 0 ? e + t : kn(u.left, u.right)) : C = h - 2 * (n !== 0 || r !== 0 ? n + r : kn(u.top, u.bottom));
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
function gr() {
	return typeof window < "u";
}
function _r(e) {
	return br(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function vr(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function yr(e) {
	return ((br(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function br(e) {
	return gr() ? e instanceof Node || e instanceof vr(e).Node : !1;
}
function xr(e) {
	return gr() ? e instanceof Element || e instanceof vr(e).Element : !1;
}
function Sr(e) {
	return gr() ? e instanceof HTMLElement || e instanceof vr(e).HTMLElement : !1;
}
function Cr(e) {
	return !gr() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof vr(e).ShadowRoot;
}
function wr(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = Fr(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function Tr(e) {
	return /^(table|td|th)$/.test(_r(e));
}
function Er(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var Dr = /transform|translate|scale|rotate|perspective|filter/, Or = /paint|layout|strict|content/, kr = (e) => !!e && e !== "none", Ar;
function jr(e) {
	let t = xr(e) ? Fr(e) : e;
	return kr(t.transform) || kr(t.translate) || kr(t.scale) || kr(t.rotate) || kr(t.perspective) || !Nr() && (kr(t.backdropFilter) || kr(t.filter)) || Dr.test(t.willChange || "") || Or.test(t.contain || "");
}
function Mr(e) {
	let t = Lr(e);
	for (; Sr(t) && !Pr(t);) {
		if (jr(t)) return t;
		if (Er(t)) return null;
		t = Lr(t);
	}
	return null;
}
function Nr() {
	return Ar ?? (Ar = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), Ar;
}
function Pr(e) {
	return /^(html|body|#document)$/.test(_r(e));
}
function Fr(e) {
	return vr(e).getComputedStyle(e);
}
function Ir(e) {
	return xr(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function Lr(e) {
	if (_r(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Cr(e) && e.host || yr(e);
	return Cr(t) ? t.host : t;
}
function Rr(e) {
	let t = Lr(e);
	return Pr(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : Sr(t) && wr(t) ? t : Rr(t);
}
function zr(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = Rr(e), i = r === e.ownerDocument?.body, a = vr(r);
	if (i) {
		let e = Br(a);
		return t.concat(a, a.visualViewport || [], wr(r) ? r : [], e && n ? zr(e) : []);
	} else return t.concat(r, zr(r, [], n));
}
function Br(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function Vr(e) {
	let t = Fr(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = Sr(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = An(n) !== a || An(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function Hr(e) {
	return xr(e) ? e : e.contextElement;
}
function Ur(e) {
	let t = Hr(e);
	if (!Sr(t)) return Mn(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = Vr(t), o = (a ? An(n.width) : n.width) / r, s = (a ? An(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var Wr = /* @__PURE__ */ Mn(0);
function Gr(e) {
	let t = vr(e);
	return !Nr() || !t.visualViewport ? Wr : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function Kr(e, t, n) {
	return t === void 0 && (t = !1), !n || t && n !== vr(e) ? !1 : t;
}
function qr(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = Hr(e), o = Mn(1);
	t && (r ? xr(r) && (o = Ur(r)) : o = Ur(e));
	let s = Kr(a, n, r) ? Gr(a) : Mn(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a) {
		let e = vr(a), t = r && xr(r) ? vr(r) : r, n = e, i = Br(n);
		for (; i && r && t !== n;) {
			let e = Ur(i), t = i.getBoundingClientRect(), r = Fr(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = vr(i), i = Br(n);
		}
	}
	return er({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function Jr(e, t) {
	let n = Ir(e).scrollLeft;
	return t ? t.left + n : qr(yr(e)).left + n;
}
function Yr(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - Jr(e, n),
		y: n.top + t.scrollTop
	};
}
function Xr(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = yr(r), s = t ? Er(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = Mn(1), u = Mn(0), d = Sr(r);
	if ((d || !d && !a) && ((_r(r) !== "body" || wr(o)) && (c = Ir(r)), d)) {
		let e = qr(r);
		l = Ur(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? Yr(o, c) : Mn(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function Zr(e) {
	return Array.from(e.getClientRects());
}
function Qr(e) {
	let t = yr(e), n = Ir(e), r = e.ownerDocument.body, i = kn(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), a = kn(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight), o = -n.scrollLeft + Jr(e), s = -n.scrollTop;
	return Fr(r).direction === "rtl" && (o += kn(t.clientWidth, r.clientWidth) - i), {
		width: i,
		height: a,
		x: o,
		y: s
	};
}
var $r = 25;
function ei(e, t) {
	let n = vr(e), r = yr(e), i = n.visualViewport, a = r.clientWidth, o = r.clientHeight, s = 0, c = 0;
	if (i) {
		a = i.width, o = i.height;
		let e = Nr();
		(!e || e && t === "fixed") && (s = i.offsetLeft, c = i.offsetTop);
	}
	let l = Jr(r);
	if (l <= 0) {
		let e = r.ownerDocument, t = e.body, n = getComputedStyle(t), i = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, o = Math.abs(r.clientWidth - t.clientWidth - i);
		o <= $r && (a -= o);
	} else l <= $r && (a += l);
	return {
		width: a,
		height: o,
		x: s,
		y: c
	};
}
function ti(e, t) {
	let n = qr(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = Sr(e) ? Ur(e) : Mn(1);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function ni(e, t, n) {
	let r;
	if (t === "viewport") r = ei(e, n);
	else if (t === "document") r = Qr(yr(e));
	else if (xr(t)) r = ti(t, n);
	else {
		let n = Gr(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return er(r);
}
function ri(e, t) {
	let n = Lr(e);
	return n === t || !xr(n) || Pr(n) ? !1 : Fr(n).position === "fixed" || ri(n, t);
}
function ii(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = zr(e, [], !1).filter((e) => xr(e) && _r(e) !== "body"), i = null, a = Fr(e).position === "fixed", o = a ? Lr(e) : e;
	for (; xr(o) && !Pr(o);) {
		let t = Fr(o), n = jr(o);
		!n && t.position === "fixed" && (i = null), (a ? !n && !i : !n && t.position === "static" && i && (i.position === "absolute" || i.position === "fixed") || wr(o) && !n && ri(e, o)) ? r = r.filter((e) => e !== o) : i = t, o = Lr(o);
	}
	return t.set(e, r), r;
}
function ai(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? Er(t) ? [] : ii(t, this._c) : [].concat(n), r], o = ni(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = ni(t, a[e], i);
		s = kn(n.top, s), c = On(n.right, c), l = On(n.bottom, l), u = kn(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function oi(e) {
	let { width: t, height: n } = Vr(e);
	return {
		width: t,
		height: n
	};
}
function si(e, t, n) {
	let r = Sr(t), i = yr(t), a = n === "fixed", o = qr(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = Mn(0);
	function l() {
		c.x = Jr(i);
	}
	if (r || !r && !a) if ((_r(t) !== "body" || wr(i)) && (s = Ir(t)), r) {
		let e = qr(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	} else i && l();
	a && !r && i && l();
	let u = i && !r && !a ? Yr(i, s) : Mn(0);
	return {
		x: o.left + s.scrollLeft - c.x - u.x,
		y: o.top + s.scrollTop - c.y - u.y,
		width: o.width,
		height: o.height
	};
}
function ci(e) {
	return Fr(e).position === "static";
}
function li(e, t) {
	if (!Sr(e) || Fr(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return yr(e) === n && (n = n.ownerDocument.body), n;
}
function ui(e, t) {
	let n = vr(e);
	if (Er(e)) return n;
	if (!Sr(e)) {
		let t = Lr(e);
		for (; t && !Pr(t);) {
			if (xr(t) && !ci(t)) return t;
			t = Lr(t);
		}
		return n;
	}
	let r = li(e, t);
	for (; r && Tr(r) && ci(r);) r = li(r, t);
	return r && Pr(r) && ci(r) && !jr(r) ? n : r || Mr(e) || n;
}
var di = async function(e) {
	let t = this.getOffsetParent || ui, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: si(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function fi(e) {
	return Fr(e).direction === "rtl";
}
var pi = {
	convertOffsetParentRelativeRectToViewportRelativeRect: Xr,
	getDocumentElement: yr,
	getClippingRect: ai,
	getOffsetParent: ui,
	getElementRects: di,
	getClientRects: Zr,
	getDimensions: oi,
	getScale: Ur,
	isElement: xr,
	isRTL: fi
};
function mi(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function hi(e, t) {
	let n = null, r, i = yr(e);
	function a() {
		var e;
		clearTimeout(r), (e = n) == null || e.disconnect(), n = null;
	}
	function o(s, c) {
		s === void 0 && (s = !1), c === void 0 && (c = 1), a();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (s || t(), !f || !p) return;
		let m = jn(d), h = jn(i.clientWidth - (u + f)), g = jn(i.clientHeight - (d + p)), _ = jn(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: kn(0, On(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (n !== c) {
				if (!y) return o();
				n ? o(!1, n) : r = setTimeout(() => {
					o(!1, 1e-7);
				}, 1e3);
			}
			n === 1 && !mi(l, e.getBoundingClientRect()) && o(), y = !1;
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
function gi(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = Hr(e), u = i || a ? [...l ? zr(l) : [], ...t ? zr(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n, { passive: !0 }), a && e.addEventListener("resize", n);
	});
	let d = l && s ? hi(l, n) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? qr(e) : null;
	c && g();
	function g() {
		let t = qr(e);
		h && !mi(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var _i = fr, vi = pr, yi = or, bi = hr, xi = lr, Si = ar, Ci = mr, wi = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = {
		platform: pi,
		...n
	}, a = {
		...i.platform,
		_c: r
	};
	return ir(e, t, {
		...i,
		platform: a
	});
}, Ti = typeof document < "u" ? u : function() {};
function Ei(e, t) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (typeof e == "function" && e.toString() === t.toString()) return !0;
	let n, r, i;
	if (e && t && typeof e == "object") {
		if (Array.isArray(e)) {
			if (n = e.length, n !== t.length) return !1;
			for (r = n; r-- !== 0;) if (!Ei(e[r], t[r])) return !1;
			return !0;
		}
		if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length) return !1;
		for (r = n; r-- !== 0;) if (!{}.hasOwnProperty.call(t, i[r])) return !1;
		for (r = n; r-- !== 0;) {
			let n = i[r];
			if (!(n === "_owner" && e.$$typeof) && !Ei(e[n], t[n])) return !1;
		}
		return !0;
	}
	return e !== e && t !== t;
}
function Di(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Oi(e, t) {
	let n = Di(e);
	return Math.round(t * n) / n;
}
function ki(e) {
	let t = r.useRef(e);
	return Ti(() => {
		t.current = e;
	}), t;
}
function Ai(e) {
	e === void 0 && (e = {});
	let { placement: t = "bottom", strategy: n = "absolute", middleware: i = [], platform: a, elements: { reference: o, floating: s } = {}, transform: c = !0, whileElementsMounted: l, open: u } = e, [d, f] = r.useState({
		x: 0,
		y: 0,
		strategy: n,
		placement: t,
		middlewareData: {},
		isPositioned: !1
	}), [p, m] = r.useState(i);
	Ei(p, i) || m(i);
	let [h, _] = r.useState(null), [v, y] = r.useState(null), b = r.useCallback((e) => {
		e !== w.current && (w.current = e, _(e));
	}, []), x = r.useCallback((e) => {
		e !== T.current && (T.current = e, y(e));
	}, []), S = o || h, C = s || v, w = r.useRef(null), T = r.useRef(null), E = r.useRef(d), D = l != null, O = ki(l), k = ki(a), A = ki(u), j = r.useCallback(() => {
		if (!w.current || !T.current) return;
		let e = {
			placement: t,
			strategy: n,
			middleware: p
		};
		k.current && (e.platform = k.current), wi(w.current, T.current, e).then((e) => {
			let t = {
				...e,
				isPositioned: A.current !== !1
			};
			M.current && !Ei(E.current, t) && (E.current = t, g.flushSync(() => {
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
	Ti(() => {
		u === !1 && E.current.isPositioned && (E.current.isPositioned = !1, f((e) => ({
			...e,
			isPositioned: !1
		})));
	}, [u]);
	let M = r.useRef(!1);
	Ti(() => (M.current = !0, () => {
		M.current = !1;
	}), []), Ti(() => {
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
		let t = Oi(P.floating, d.x), r = Oi(P.floating, d.y);
		return c ? {
			...e,
			transform: "translate(" + t + "px, " + r + "px)",
			...Di(P.floating) >= 1.5 && { willChange: "transform" }
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
var ji = (e) => {
	function t(e) {
		return {}.hasOwnProperty.call(e, "current");
	}
	return {
		name: "arrow",
		options: e,
		fn(n) {
			let { element: r, padding: i } = typeof e == "function" ? e(n) : e;
			return r && t(r) ? r.current == null ? {} : Si({
				element: r.current,
				padding: i
			}).fn(n) : r ? Si({
				element: r,
				padding: i
			}).fn(n) : {};
		}
	};
}, Mi = (e, t) => {
	let n = _i(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Ni = (e, t) => {
	let n = vi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Pi = (e, t) => ({
	fn: Ci(e).fn,
	options: [e, t]
}), Fi = (e, t) => {
	let n = yi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, Ii = (e, t) => {
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
	let n = ji(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, zi = "Arrow", Bi = r.forwardRef((e, t) => {
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
Bi.displayName = zi;
var Vi = Bi, Hi = "Popper", [Ui, Wi] = L(Hi), [Gi, Ki] = Ui(Hi), qi = (e) => {
	let { __scopePopper: t, children: n } = e, [i, a] = r.useState(null);
	return /* @__PURE__ */ y(Gi, {
		scope: t,
		anchor: i,
		onAnchorChange: a,
		children: n
	});
};
qi.displayName = Hi;
var Ji = "PopperAnchor", Yi = r.forwardRef((e, t) => {
	let { __scopePopper: n, virtualRef: i, ...a } = e, o = Ki(Ji, n), s = r.useRef(null), c = k(t, s), l = r.useRef(null);
	return r.useEffect(() => {
		let e = l.current;
		l.current = i?.current || s.current, e !== l.current && o.onAnchorChange(l.current);
	}), i ? null : /* @__PURE__ */ y(F.div, {
		...a,
		ref: c
	});
});
Yi.displayName = Ji;
var Xi = "PopperContent", [Zi, Qi] = Ui(Xi), $i = r.forwardRef((e, t) => {
	let { __scopePopper: n, side: i = "bottom", sideOffset: a = 0, align: o = "center", alignOffset: s = 0, arrowPadding: c = 0, avoidCollisions: l = !0, collisionBoundary: u = [], collisionPadding: d = 0, sticky: f = "partial", hideWhenDetached: p = !1, updatePositionStrategy: m = "optimized", onPlaced: h, ...g } = e, _ = Ki(Xi, n), [v, b] = r.useState(null), x = k(t, (e) => b(e)), [S, C] = r.useState(null), w = En(S), T = w?.width ?? 0, E = w?.height ?? 0, D = i + (o === "center" ? "" : "-" + o), O = typeof d == "number" ? d : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...d
	}, A = Array.isArray(u) ? u : [u], j = A.length > 0, M = {
		padding: O,
		boundary: A.filter(ra),
		altBoundary: j
	}, { refs: N, floatingStyles: P, placement: ee, isPositioned: te, middlewareData: I } = Ai({
		strategy: "fixed",
		placement: D,
		whileElementsMounted: (...e) => gi(...e, { animationFrame: m === "always" }),
		elements: { reference: _.anchor },
		middleware: [
			Mi({
				mainAxis: a + E,
				alignmentAxis: s
			}),
			l && Ni({
				mainAxis: !0,
				crossAxis: !1,
				limiter: f === "partial" ? Pi() : void 0,
				...M
			}),
			l && Fi({ ...M }),
			Ii({
				...M,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--radix-popper-available-width", `${n}px`), o.setProperty("--radix-popper-available-height", `${r}px`), o.setProperty("--radix-popper-anchor-width", `${i}px`), o.setProperty("--radix-popper-anchor-height", `${a}px`);
				}
			}),
			S && Ri({
				element: S,
				padding: c
			}),
			ia({
				arrowWidth: T,
				arrowHeight: E
			}),
			p && Li({
				strategy: "referenceHidden",
				...M
			})
		]
	}), [ne, re] = aa(ee), L = be(h);
	ue(() => {
		te && L?.();
	}, [te, L]);
	let R = I.arrow?.x, ie = I.arrow?.y, ae = I.arrow?.centerOffset !== 0, [z, oe] = r.useState();
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
			"--radix-popper-transform-origin": [I.transformOrigin?.x, I.transformOrigin?.y].join(" "),
			...I.hide?.referenceHidden && {
				visibility: "hidden",
				pointerEvents: "none"
			}
		},
		dir: e.dir,
		children: /* @__PURE__ */ y(Zi, {
			scope: n,
			placedSide: ne,
			onArrowChange: C,
			arrowX: R,
			arrowY: ie,
			shouldHideArrow: ae,
			children: /* @__PURE__ */ y(F.div, {
				"data-side": ne,
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
$i.displayName = Xi;
var ea = "PopperArrow", ta = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
}, na = r.forwardRef(function(e, t) {
	let { __scopePopper: n, ...r } = e, i = Qi(ea, n), a = ta[i.placedSide];
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
		children: /* @__PURE__ */ y(Vi, {
			...r,
			ref: t,
			style: {
				...r.style,
				display: "block"
			}
		})
	});
});
na.displayName = ea;
function ra(e) {
	return e !== null;
}
var ia = (e) => ({
	name: "transformOrigin",
	options: e,
	fn(t) {
		let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = aa(n), u = {
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
function aa(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
var oa = qi, sa = Yi, ca = $i, la = na, ua = "Label", da = r.forwardRef((e, t) => /* @__PURE__ */ y(F.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
da.displayName = ua;
var fa = da;
//#endregion
//#region node_modules/@radix-ui/number/dist/index.mjs
function pa(e, [t, n]) {
	return Math.min(n, Math.max(t, e));
}
//#endregion
//#region node_modules/@radix-ui/react-select/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function ma(e) {
	let t = /* @__PURE__ */ ha(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(_a);
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
function ha(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = ya(n), a = va(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? O(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var ga = Symbol("radix.slottable");
function _a(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === ga;
}
function va(e, t) {
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
function ya(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-select/dist/index.mjs
var ba = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], xa = [" ", "Enter"], Sa = "Select", [Ca, wa, Ta] = le(Sa), [Ea, Da] = L(Sa, [Ta, Wi]), Oa = Wi(), [ka, Aa] = Ea(Sa), [ja, Ma] = Ea(Sa), Na = (e) => {
	let { __scopeSelect: t, children: n, open: i, defaultOpen: a, onOpenChange: o, value: s, defaultValue: c, onValueChange: l, dir: u, name: d, autoComplete: f, disabled: p, required: m, form: h } = e, g = Oa(t), [_, v] = r.useState(null), [x, S] = r.useState(null), [C, w] = r.useState(!1), T = ye(u), [E, D] = fe({
		prop: i,
		defaultProp: a ?? !1,
		onChange: o,
		caller: Sa
	}), [O, k] = fe({
		prop: s,
		defaultProp: c,
		onChange: l,
		caller: Sa
	}), A = r.useRef(null), j = _ ? h || !!_.closest("form") : !0, [M, N] = r.useState(/* @__PURE__ */ new Set()), P = Array.from(M).map((e) => e.props.value).join(";");
	return /* @__PURE__ */ y(oa, {
		...g,
		children: /* @__PURE__ */ b(ka, {
			required: m,
			scope: t,
			trigger: _,
			onTriggerChange: v,
			valueNode: x,
			onValueNodeChange: S,
			valueNodeHasChildren: C,
			onValueNodeHasChildrenChange: w,
			contentId: _e(),
			value: O,
			onValueChange: k,
			open: E,
			onOpenChange: D,
			dir: T,
			triggerPointerDownPosRef: A,
			disabled: p,
			children: [/* @__PURE__ */ y(Ca.Provider, {
				scope: t,
				children: /* @__PURE__ */ y(ja, {
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
			}), j ? /* @__PURE__ */ b(ko, {
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
Na.displayName = Sa;
var Pa = "SelectTrigger", Fa = r.forwardRef((e, t) => {
	let { __scopeSelect: n, disabled: i = !1, ...a } = e, o = Oa(n), s = Aa(Pa, n), c = s.disabled || i, l = k(t, s.onTriggerChange), u = wa(n), d = r.useRef("touch"), [f, p, m] = jo((e) => {
		let t = u().filter((e) => !e.disabled), n = Mo(t, e, t.find((e) => e.value === s.value));
		n !== void 0 && s.onValueChange(n.value);
	}), h = (e) => {
		c || (s.onOpenChange(!0), m()), e && (s.triggerPointerDownPosRef.current = {
			x: Math.round(e.pageX),
			y: Math.round(e.pageY)
		});
	};
	return /* @__PURE__ */ y(sa, {
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
			"data-placeholder": Ao(s.value) ? "" : void 0,
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
				!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && p(e.key), !(t && e.key === " ") && ba.includes(e.key) && (h(), e.preventDefault());
			})
		})
	});
});
Fa.displayName = Pa;
var Ia = "SelectValue", La = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: r, style: i, children: a, placeholder: o = "", ...s } = e, c = Aa(Ia, n), { onValueNodeHasChildrenChange: l } = c, u = a !== void 0, d = k(t, c.onValueNodeChange);
	return ue(() => {
		l(u);
	}, [l, u]), /* @__PURE__ */ y(F.span, {
		...s,
		ref: d,
		style: { pointerEvents: "none" },
		children: Ao(c.value) ? /* @__PURE__ */ y(v, { children: o }) : a
	});
});
La.displayName = Ia;
var Ra = "SelectIcon", za = r.forwardRef((e, t) => {
	let { __scopeSelect: n, children: r, ...i } = e;
	return /* @__PURE__ */ y(F.span, {
		"aria-hidden": !0,
		...i,
		ref: t,
		children: r || "▼"
	});
});
za.displayName = Ra;
var Ba = "SelectPortal", Va = (e) => /* @__PURE__ */ y(Qe, {
	asChild: !0,
	...e
});
Va.displayName = Ba;
var Ha = "SelectContent", Ua = r.forwardRef((e, t) => {
	let n = Aa(Ha, e.__scopeSelect), [i, a] = r.useState();
	if (ue(() => {
		a(new DocumentFragment());
	}, []), !n.open) {
		let t = i;
		return t ? g.createPortal(/* @__PURE__ */ y(Ga, {
			scope: e.__scopeSelect,
			children: /* @__PURE__ */ y(Ca.Slot, {
				scope: e.__scopeSelect,
				children: /* @__PURE__ */ y("div", { children: e.children })
			})
		}), t) : null;
	}
	return /* @__PURE__ */ y(Ya, {
		...e,
		ref: t
	});
});
Ua.displayName = Ha;
var Wa = 10, [Ga, Ka] = Ea(Ha), qa = "SelectContentImpl", Ja = /* @__PURE__ */ ma("SelectContent.RemoveScroll"), Ya = r.forwardRef((e, t) => {
	let { __scopeSelect: n, position: i = "item-aligned", onCloseAutoFocus: a, onEscapeKeyDown: o, onPointerDownOutside: s, side: c, sideOffset: l, align: u, alignOffset: d, arrowPadding: f, collisionBoundary: p, collisionPadding: m, sticky: h, hideWhenDetached: g, avoidCollisions: _, ...v } = e, b = Aa(Ha, n), [x, S] = r.useState(null), [C, w] = r.useState(null), T = k(t, (e) => S(e)), [E, D] = r.useState(null), [O, A] = r.useState(null), j = wa(n), [M, N] = r.useState(!1), P = r.useRef(!1);
	r.useEffect(() => {
		if (x) return wn(x);
	}, [x]), et();
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
	let [ne, re] = jo((e) => {
		let t = j().filter((e) => !e.disabled), n = Mo(t, e, t.find((e) => e.ref.current === document.activeElement));
		n && setTimeout(() => n.ref.current.focus());
	}), L = r.useCallback((e, t, n) => {
		let r = !P.current && !n;
		(b.value !== void 0 && b.value === t || r) && (D(e), r && (P.current = !0));
	}, [b.value]), R = r.useCallback(() => x?.focus(), [x]), ie = r.useCallback((e, t, n) => {
		let r = !P.current && !n;
		(b.value !== void 0 && b.value === t || r) && A(e);
	}, [b.value]), ae = i === "popper" ? $a : Za, z = ae === $a ? {
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
	return /* @__PURE__ */ y(Ga, {
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
		children: /* @__PURE__ */ y(hn, {
			as: Ja,
			allowPinchZoom: !0,
			children: /* @__PURE__ */ y(ze, {
				asChild: !0,
				trapped: b.open,
				onMountAutoFocus: (e) => {
					e.preventDefault();
				},
				onUnmountAutoFocus: B(a, (e) => {
					b.trigger?.focus({ preventScroll: !0 }), e.preventDefault();
				}),
				children: /* @__PURE__ */ y(Oe, {
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
Ya.displayName = qa;
var Xa = "SelectItemAlignedPosition", Za = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onPlaced: i, ...a } = e, o = Aa(Ha, n), s = Ka(Ha, n), [c, l] = r.useState(null), [u, d] = r.useState(null), f = k(t, (e) => d(e)), p = wa(n), m = r.useRef(!1), h = r.useRef(!0), { viewport: g, selectedItem: _, selectedItemText: v, focusSelectedItem: b } = s, x = r.useCallback(() => {
		if (o.trigger && o.valueNode && c && u && g && _ && v) {
			let e = o.trigger.getBoundingClientRect(), t = u.getBoundingClientRect(), n = o.valueNode.getBoundingClientRect(), r = v.getBoundingClientRect();
			if (o.dir !== "rtl") {
				let i = r.left - t.left, a = n.left - i, o = e.left - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - Wa, d = pa(a, [Wa, Math.max(Wa, u - l)]);
				c.style.minWidth = s + "px", c.style.left = d + "px";
			} else {
				let i = t.right - r.right, a = window.innerWidth - n.right - i, o = window.innerWidth - e.right - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - Wa, d = pa(a, [Wa, Math.max(Wa, u - l)]);
				c.style.minWidth = s + "px", c.style.right = d + "px";
			}
			let a = p(), s = window.innerHeight - Wa * 2, l = g.scrollHeight, d = window.getComputedStyle(u), f = parseInt(d.borderTopWidth, 10), h = parseInt(d.paddingTop, 10), y = parseInt(d.borderBottomWidth, 10), b = parseInt(d.paddingBottom, 10), x = f + h + l + b + y, S = Math.min(_.offsetHeight * 5, x), C = window.getComputedStyle(g), w = parseInt(C.paddingTop, 10), T = parseInt(C.paddingBottom, 10), E = e.top + e.height / 2 - Wa, D = s - E, O = _.offsetHeight / 2, k = _.offsetTop + O, A = f + h + k, j = x - A;
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
			c.style.margin = `${Wa}px 0`, c.style.minHeight = S + "px", c.style.maxHeight = s + "px", i?.(), requestAnimationFrame(() => m.current = !0);
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
	}, [u]), /* @__PURE__ */ y(eo, {
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
Za.displayName = Xa;
var Qa = "SelectPopperPosition", $a = r.forwardRef((e, t) => {
	let { __scopeSelect: n, align: r = "start", collisionPadding: i = Wa, ...a } = e;
	return /* @__PURE__ */ y(ca, {
		...Oa(n),
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
$a.displayName = Qa;
var [eo, to] = Ea(Ha, {}), no = "SelectViewport", ro = r.forwardRef((e, t) => {
	let { __scopeSelect: n, nonce: i, ...a } = e, o = Ka(no, n), s = to(no, n), c = k(t, o.onViewportChange), l = r.useRef(0);
	return /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y("style", {
		dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" },
		nonce: i
	}), /* @__PURE__ */ y(Ca.Slot, {
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
						let r = window.innerHeight - Wa * 2, i = parseFloat(n.style.minHeight), a = parseFloat(n.style.height), o = Math.max(i, a);
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
ro.displayName = no;
var io = "SelectGroup", [ao, oo] = Ea(io), so = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = _e();
	return /* @__PURE__ */ y(ao, {
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
so.displayName = io;
var co = "SelectLabel", lo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = oo(co, n);
	return /* @__PURE__ */ y(F.div, {
		id: i.id,
		...r,
		ref: t
	});
});
lo.displayName = co;
var uo = "SelectItem", [fo, po] = Ea(uo), mo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, value: i, disabled: a = !1, textValue: o, ...s } = e, c = Aa(uo, n), l = Ka(uo, n), u = c.value === i, [d, f] = r.useState(o ?? ""), [p, m] = r.useState(!1), h = k(t, (e) => l.itemRefCallback?.(e, i, a)), g = _e(), _ = r.useRef("touch"), v = () => {
		a || (c.onValueChange(i), c.onOpenChange(!1));
	};
	if (i === "") throw Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
	return /* @__PURE__ */ y(fo, {
		scope: n,
		value: i,
		disabled: a,
		textId: g,
		isSelected: u,
		onItemTextChange: r.useCallback((e) => {
			f((t) => t || (e?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ y(Ca.ItemSlot, {
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
					l.searchRef?.current !== "" && e.key === " " || (xa.includes(e.key) && v(), e.key === " " && e.preventDefault());
				})
			})
		})
	});
});
mo.displayName = uo;
var ho = "SelectItemText", go = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: i, style: a, ...o } = e, s = Aa(ho, n), c = Ka(ho, n), l = po(ho, n), u = Ma(ho, n), [d, f] = r.useState(null), p = k(t, (e) => f(e), l.onItemTextChange, (e) => c.itemTextRefCallback?.(e, l.value, l.disabled)), m = d?.textContent, h = r.useMemo(() => /* @__PURE__ */ y("option", {
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
go.displayName = ho;
var _o = "SelectItemIndicator", vo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return po(_o, n).isSelected ? /* @__PURE__ */ y(F.span, {
		"aria-hidden": !0,
		...r,
		ref: t
	}) : null;
});
vo.displayName = _o;
var yo = "SelectScrollUpButton", bo = r.forwardRef((e, t) => {
	let n = Ka(yo, e.__scopeSelect), i = to(yo, e.__scopeSelect), [a, o] = r.useState(!1), s = k(t, i.onScrollButtonChange);
	return ue(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				o(t.scrollTop > 0);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ y(Co, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop -= t.offsetHeight);
		}
	}) : null;
});
bo.displayName = yo;
var xo = "SelectScrollDownButton", So = r.forwardRef((e, t) => {
	let n = Ka(xo, e.__scopeSelect), i = to(xo, e.__scopeSelect), [a, o] = r.useState(!1), s = k(t, i.onScrollButtonChange);
	return ue(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				let e = t.scrollHeight - t.clientHeight;
				o(Math.ceil(t.scrollTop) < e);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ y(Co, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop += t.offsetHeight);
		}
	}) : null;
});
So.displayName = xo;
var Co = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onAutoScroll: i, ...a } = e, o = Ka("SelectScrollButton", n), s = r.useRef(null), c = wa(n), l = r.useCallback(() => {
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
}), wo = "SelectSeparator", To = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return /* @__PURE__ */ y(F.div, {
		"aria-hidden": !0,
		...r,
		ref: t
	});
});
To.displayName = wo;
var Eo = "SelectArrow", Do = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = Oa(n), a = Aa(Eo, n), o = Ka(Eo, n);
	return a.open && o.position === "popper" ? /* @__PURE__ */ y(la, {
		...i,
		...r,
		ref: t
	}) : null;
});
Do.displayName = Eo;
var Oo = "SelectBubbleInput", ko = r.forwardRef(({ __scopeSelect: e, value: t, ...n }, i) => {
	let a = r.useRef(null), o = k(i, a), s = Tn(t);
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
			...I,
			...n.style
		},
		ref: o,
		defaultValue: t
	});
});
ko.displayName = Oo;
function Ao(e) {
	return e === "" || e === void 0;
}
function jo(e) {
	let t = be(e), n = r.useRef(""), i = r.useRef(0), a = r.useCallback((e) => {
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
function Mo(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = No(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.textValue.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
function No(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
var Po = Na, Fo = Fa, Io = La, Lo = za, Ro = Va, zo = Ua, Bo = ro, Vo = mo, Ho = go, Uo = vo, Wo = bo, Go = So;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function Ko(e) {
	let t = /* @__PURE__ */ Jo(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Xo);
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
var qo = /* @__PURE__ */ Ko("Slot");
/* @__NO_SIDE_EFFECTS__ */
function Jo(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Qo(n), a = Zo(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? O(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Yo = Symbol("radix.slottable");
function Xo(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Yo;
}
function Zo(e, t) {
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
function Qo(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-switch/dist/index.mjs
var $o = "Switch", [es, ts] = L($o), [ns, rs] = es($o), is = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, name: i, checked: a, defaultChecked: o, required: s, disabled: c, value: l = "on", onCheckedChange: u, form: d, ...f } = e, [p, m] = r.useState(null), h = k(t, (e) => m(e)), g = r.useRef(!1), _ = p ? d || !!p.closest("form") : !0, [v, x] = fe({
		prop: a,
		defaultProp: o ?? !1,
		onChange: u,
		caller: $o
	});
	return /* @__PURE__ */ b(ns, {
		scope: n,
		checked: v,
		disabled: c,
		children: [/* @__PURE__ */ y(F.button, {
			type: "button",
			role: "switch",
			"aria-checked": v,
			"aria-required": s,
			"data-state": ls(v),
			"data-disabled": c ? "" : void 0,
			disabled: c,
			value: l,
			...f,
			ref: h,
			onClick: B(e.onClick, (e) => {
				x((e) => !e), _ && (g.current = e.isPropagationStopped(), g.current || e.stopPropagation());
			})
		}), _ && /* @__PURE__ */ y(cs, {
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
is.displayName = $o;
var as = "SwitchThumb", os = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, ...r } = e, i = rs(as, n);
	return /* @__PURE__ */ y(F.span, {
		"data-state": ls(i.checked),
		"data-disabled": i.disabled ? "" : void 0,
		...r,
		ref: t
	});
});
os.displayName = as;
var ss = "SwitchBubbleInput", cs = r.forwardRef(({ __scopeSwitch: e, control: t, checked: n, bubbles: i = !0, ...a }, o) => {
	let s = r.useRef(null), c = k(s, o), l = Tn(n), u = En(t);
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
cs.displayName = ss;
function ls(e) {
	return e ? "checked" : "unchecked";
}
var us = is, ds = os, fs = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, ps = (e, t) => ({
	classGroupId: e,
	validator: t
}), ms = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), hs = "-", gs = [], _s = "arbitrary..", vs = (e) => {
	let t = xs(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return bs(e);
			let n = e.split(hs);
			return ys(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? fs(i, t) : t : i || gs;
			}
			return n[e] || gs;
		}
	};
}, ys = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = ys(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(hs) : e.slice(t).join(hs), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, bs = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? _s + r : void 0;
})(), xs = (e) => {
	let { theme: t, classGroups: n } = e;
	return Ss(n, t);
}, Ss = (e, t) => {
	let n = ms();
	for (let r in e) {
		let i = e[r];
		Cs(i, n, r, t);
	}
	return n;
}, Cs = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		ws(i, t, n, r);
	}
}, ws = (e, t, n, r) => {
	if (typeof e == "string") {
		Ts(e, t, n);
		return;
	}
	if (typeof e == "function") {
		Es(e, t, n, r);
		return;
	}
	Ds(e, t, n, r);
}, Ts = (e, t, n) => {
	let r = e === "" ? t : Os(t, e);
	r.classGroupId = n;
}, Es = (e, t, n, r) => {
	if (ks(e)) {
		Cs(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(ps(n, e));
}, Ds = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		Cs(o, Os(t, a), n, r);
	}
}, Os = (e, t) => {
	let n = e, r = t.split(hs), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = ms(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, ks = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, As = (e) => {
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
}, js = "!", Ms = ":", Ns = [], Ps = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), Fs = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === Ms) {
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
		s.endsWith(js) ? (c = s.slice(0, -1), l = !0) : s.startsWith(js) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return Ps(t, l, c, u);
	};
	if (t) {
		let e = t + Ms, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : Ps(Ns, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, Is = (e) => {
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
}, Ls = (e) => ({
	cache: As(e.cacheSize),
	parseClassName: Fs(e),
	sortModifiers: Is(e),
	...vs(e)
}), Rs = /\s+/, zs = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(Rs), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + js : g, v = _ + h;
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
}, Bs = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = Vs(n)) && (i && (i += " "), i += r);
	return i;
}, Vs = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = Vs(e[r])) && (n && (n += " "), n += t);
	return n;
}, Hs = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = Ls(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = zs(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(Bs(...e));
}, Us = [], V = (e) => {
	let t = (t) => t[e] || Us;
	return t.isThemeGetter = !0, t;
}, Ws = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Gs = /^\((?:(\w[\w-]*):)?(.+)\)$/i, Ks = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, qs = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Js = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Ys = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, Xs = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Zs = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, Qs = (e) => Ks.test(e), H = (e) => !!e && !Number.isNaN(Number(e)), $s = (e) => !!e && Number.isInteger(Number(e)), ec = (e) => e.endsWith("%") && H(e.slice(0, -1)), tc = (e) => qs.test(e), nc = () => !0, rc = (e) => Js.test(e) && !Ys.test(e), ic = () => !1, ac = (e) => Xs.test(e), oc = (e) => Zs.test(e), sc = (e) => !U(e) && !W(e), cc = (e) => Cc(e, Dc, ic), U = (e) => Ws.test(e), lc = (e) => Cc(e, Oc, rc), uc = (e) => Cc(e, kc, H), dc = (e) => Cc(e, jc, nc), fc = (e) => Cc(e, Ac, ic), pc = (e) => Cc(e, Tc, ic), mc = (e) => Cc(e, Ec, oc), hc = (e) => Cc(e, Mc, ac), W = (e) => Gs.test(e), gc = (e) => wc(e, Oc), _c = (e) => wc(e, Ac), vc = (e) => wc(e, Tc), yc = (e) => wc(e, Dc), bc = (e) => wc(e, Ec), xc = (e) => wc(e, Mc, !0), Sc = (e) => wc(e, jc, !0), Cc = (e, t, n) => {
	let r = Ws.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, wc = (e, t, n = !1) => {
	let r = Gs.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, Tc = (e) => e === "position" || e === "percentage", Ec = (e) => e === "image" || e === "url", Dc = (e) => e === "length" || e === "size" || e === "bg-size", Oc = (e) => e === "length", kc = (e) => e === "number", Ac = (e) => e === "family-name", jc = (e) => e === "number" || e === "weight", Mc = (e) => e === "shadow", Nc = /* @__PURE__ */ Hs(() => {
	let e = V("color"), t = V("font"), n = V("text"), r = V("font-weight"), i = V("tracking"), a = V("leading"), o = V("breakpoint"), s = V("container"), c = V("spacing"), l = V("radius"), u = V("shadow"), d = V("inset-shadow"), f = V("text-shadow"), p = V("drop-shadow"), m = V("blur"), h = V("perspective"), g = V("aspect"), _ = V("ease"), v = V("animate"), y = () => [
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
		W,
		U
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
		W,
		U,
		c
	], T = () => [
		Qs,
		"full",
		"auto",
		...w()
	], E = () => [
		$s,
		"none",
		"subgrid",
		W,
		U
	], D = () => [
		"auto",
		{ span: [
			"full",
			$s,
			W,
			U
		] },
		$s,
		W,
		U
	], O = () => [
		$s,
		"auto",
		W,
		U
	], k = () => [
		"auto",
		"min",
		"max",
		"fr",
		W,
		U
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
		Qs,
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
		Qs,
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
		Qs,
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
		W,
		U
	], te = () => [
		...b(),
		vc,
		pc,
		{ position: [W, U] }
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
		yc,
		cc,
		{ size: [W, U] }
	], re = () => [
		ec,
		gc,
		lc
	], L = () => [
		"",
		"none",
		"full",
		l,
		W,
		U
	], R = () => [
		"",
		H,
		gc,
		lc
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
		H,
		ec,
		vc,
		pc
	], oe = () => [
		"",
		"none",
		m,
		W,
		U
	], se = () => [
		"none",
		H,
		W,
		U
	], ce = () => [
		"none",
		H,
		W,
		U
	], le = () => [
		H,
		W,
		U
	], B = () => [
		Qs,
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
			blur: [tc],
			breakpoint: [tc],
			color: [nc],
			container: [tc],
			"drop-shadow": [tc],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [sc],
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
			"inset-shadow": [tc],
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
			radius: [tc],
			shadow: [tc],
			spacing: ["px", H],
			text: [tc],
			"text-shadow": [tc],
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
				Qs,
				U,
				W,
				g
			] }],
			container: ["container"],
			columns: [{ columns: [
				H,
				U,
				W,
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
				$s,
				"auto",
				W,
				U
			] }],
			basis: [{ basis: [
				Qs,
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
				Qs,
				"auto",
				"initial",
				"none",
				U
			] }],
			grow: [{ grow: [
				"",
				H,
				W,
				U
			] }],
			shrink: [{ shrink: [
				"",
				H,
				W,
				U
			] }],
			order: [{ order: [
				$s,
				"first",
				"last",
				"none",
				W,
				U
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
				gc,
				lc
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				Sc,
				dc
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
				ec,
				U
			] }],
			"font-family": [{ font: [
				_c,
				fc,
				t
			] }],
			"font-features": [{ "font-features": [U] }],
			"fvn-normal": ["normal-nums"],
			"fvn-ordinal": ["ordinal"],
			"fvn-slashed-zero": ["slashed-zero"],
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			tracking: [{ tracking: [
				i,
				W,
				U
			] }],
			"line-clamp": [{ "line-clamp": [
				H,
				"none",
				W,
				uc
			] }],
			leading: [{ leading: [a, ...w()] }],
			"list-image": [{ "list-image": [
				"none",
				W,
				U
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				W,
				U
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
				H,
				"from-font",
				"auto",
				W,
				lc
			] }],
			"text-decoration-color": [{ decoration: F() }],
			"underline-offset": [{ "underline-offset": [
				H,
				"auto",
				W,
				U
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
				W,
				U
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
				W,
				U
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
						$s,
						W,
						U
					],
					radial: [
						"",
						W,
						U
					],
					conic: [
						$s,
						W,
						U
					]
				},
				bc,
				mc
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
				H,
				W,
				U
			] }],
			"outline-w": [{ outline: [
				"",
				H,
				gc,
				lc
			] }],
			"outline-color": [{ outline: F() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				xc,
				hc
			] }],
			"shadow-color": [{ shadow: F() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				xc,
				hc
			] }],
			"inset-shadow-color": [{ "inset-shadow": F() }],
			"ring-w": [{ ring: R() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: F() }],
			"ring-offset-w": [{ "ring-offset": [H, lc] }],
			"ring-offset-color": [{ "ring-offset": F() }],
			"inset-ring-w": [{ "inset-ring": R() }],
			"inset-ring-color": [{ "inset-ring": F() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				xc,
				hc
			] }],
			"text-shadow-color": [{ "text-shadow": F() }],
			opacity: [{ opacity: [
				H,
				W,
				U
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
			"mask-image-linear-pos": [{ "mask-linear": [H] }],
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
			"mask-image-radial": [{ "mask-radial": [W, U] }],
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
			"mask-image-conic-pos": [{ "mask-conic": [H] }],
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
				W,
				U
			] }],
			filter: [{ filter: [
				"",
				"none",
				W,
				U
			] }],
			blur: [{ blur: oe() }],
			brightness: [{ brightness: [
				H,
				W,
				U
			] }],
			contrast: [{ contrast: [
				H,
				W,
				U
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				xc,
				hc
			] }],
			"drop-shadow-color": [{ "drop-shadow": F() }],
			grayscale: [{ grayscale: [
				"",
				H,
				W,
				U
			] }],
			"hue-rotate": [{ "hue-rotate": [
				H,
				W,
				U
			] }],
			invert: [{ invert: [
				"",
				H,
				W,
				U
			] }],
			saturate: [{ saturate: [
				H,
				W,
				U
			] }],
			sepia: [{ sepia: [
				"",
				H,
				W,
				U
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				W,
				U
			] }],
			"backdrop-blur": [{ "backdrop-blur": oe() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				H,
				W,
				U
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				H,
				W,
				U
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				H,
				W,
				U
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				H,
				W,
				U
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				H,
				W,
				U
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				H,
				W,
				U
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				H,
				W,
				U
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				H,
				W,
				U
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
				W,
				U
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				H,
				"initial",
				W,
				U
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				W,
				U
			] }],
			delay: [{ delay: [
				H,
				W,
				U
			] }],
			animate: [{ animate: [
				"none",
				v,
				W,
				U
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				W,
				U
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
				W,
				U,
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
				W,
				U
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
				W,
				U
			] }],
			fill: [{ fill: ["none", ...F()] }],
			"stroke-w": [{ stroke: [
				H,
				gc,
				lc,
				uc
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
function G(...e) {
	return Nc(C(e));
}
//#endregion
//#region src/components/ui/button.tsx
var Pc = E("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
function K({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ y(r ? qo : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: G(Pc({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/components/ui/card.tsx
var Fc = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function q({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card",
		"data-variant": t,
		className: G("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", Fc[t], e),
		...n
	});
}
function J({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-header",
		className: G("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function Y({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-title",
		className: G("leading-none font-semibold", e),
		...t
	});
}
function Ic({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-description",
		className: G("text-sm text-muted-foreground", e),
		...t
	});
}
function X({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-content",
		className: G("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region src/components/ui/input.tsx
function Z({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ y("input", {
		type: t,
		"data-slot": "input",
		className: G("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function Q({ className: e, ...t }) {
	return /* @__PURE__ */ y(fa, {
		"data-slot": "label",
		className: G("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/lib/safeUrl.ts
function Lc(e) {
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
function Rc() {
	return window.webinoDashboard;
}
var zc = 3e4;
function Bc(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function Vc(e) {
	let t = Rc();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (Bc(e) || Lc(e)) return e;
	throw new Qc("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function Hc(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function Uc(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : /^(payments|torobpay|snapppay|digipay|zarinpal|bale-pay|wallet|c2c)(\/|$)/.test(t) ? "webino_dashboard_payments_rest" : null;
}
function Wc(e, t) {
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
function Gc(e, t) {
	let n = e.toLowerCase();
	return e.includes("Upstream Error") || e.includes("Forbidden") || t === 403 ? "admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry" : n.includes("timed out") || n.includes("timeout") || t === 504 || t === 524 ? "Request timed out — RSA-4096 generation can take over a minute on weak hosts" : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? `Invalid AJAX response (HTML, HTTP ${t || 0})` : `Invalid AJAX response (HTTP ${t || 0})`;
}
async function Kc(e, t, n = {}) {
	let r = Uc(e), i = Rc();
	if (!r || !i.ajaxUrl) throw new Qc("AJAX fallback unavailable", {
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
	let { signal: l, clear: u } = Hc({}, t);
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
			throw new Qc(Gc(t, e.status), {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!n.success) throw new Qc(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
			code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
			status: e.status
		});
		return n.data;
	} catch (e) {
		throw e instanceof Qc ? e : e instanceof DOMException && e.name === "AbortError" ? new Qc("Request timed out", {
			code: "timeout",
			status: 0
		}) : e instanceof TypeError ? new Qc("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		u();
	}
}
async function $(e, t = {}, n = zc) {
	if (Uc(e) && Rc().ajaxUrl) return Kc(e, n, t);
	let r = Vc(e), i = Rc(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce), !Object.keys(a).some((e) => e.toLowerCase() === "content-type") && typeof t.body == "string" && t.body.length > 0 && (a["Content-Type"] = "application/json");
	let { signal: s, clear: c } = Hc(t, n);
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
			let t = Wc(n, e.status);
			throw new Qc(t.message, {
				code: t.code,
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i;
			throw new Qc(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
		}
		return i;
	} catch (e) {
		throw e instanceof Qc ? e : e instanceof DOMException && e.name === "AbortError" ? new Qc("Request timed out", {
			code: "timeout",
			status: 0
		}) : e instanceof TypeError ? new Qc("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region src/lib/marketplace-api.ts
function qc(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function Jc(e) {
	"@babel/helpers - typeof";
	return Jc = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, Jc(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function Yc(e, t) {
	if (Jc(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (Jc(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function Xc(e) {
	var t = Yc(e, "string");
	return Jc(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function Zc(e, t, n) {
	return (t = Xc(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/lib/apiError.ts
var Qc = class extends Error {
	constructor(e, t) {
		super(e), Zc(this, "code", void 0), Zc(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, $c = {
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
function el(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function tl(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function nl(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(qc(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function rl(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return nl(e, n);
	if (t instanceof Qc && t.code) {
		let n = $c[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = $c[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return el(n) ? e("errors.api.timeout") : tl(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function il(e, t) {
	h.error(rl(e, t));
}
//#endregion
//#region src/hooks/useQueryErrorToast.ts
function al(e) {
	let { t } = m(), n = f(!1);
	l(() => {
		e.isError && e.error ? n.current || (n.current = !0, h.error(rl(t, e.error))) : n.current = !1;
	}, [
		e.isError,
		e.error,
		e.fetchStatus,
		t
	]);
}
//#endregion
//#region ../Modules/shipping-module/client/components/OrderMapPanel.tsx
var ol = null;
function sl() {
	return typeof window > "u" ? Promise.reject(/* @__PURE__ */ Error("no window")) : window.L ? Promise.resolve(window.L) : ol || (ol = new Promise((e, t) => {
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
	}), ol);
}
function cl(e) {
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
function ll({ orderId: r }) {
	let { t: i } = m(), a = n(), o = f(null), s = f(null), c = f(null), [u, d] = p(0), [g, _] = p(0), [v, x] = p(!1), S = t({
		queryKey: ["shipping-order-map", r],
		queryFn: () => $(`shipping/orders/${r}/map`),
		enabled: r > 0
	});
	al(S), l(() => {
		if (S.data) {
			let e = S.data.settings?.store_location;
			d(S.data.lat || e?.lat || 35.6892), _(S.data.lng || e?.lng || 51.389);
		}
	}, [S.data]), l(() => {
		let e = !1;
		return sl().then((t) => {
			if (e || !o.current || s.current) return;
			let n = cl(S.data?.settings), r = t.map(o.current).setView([u || 35.6892, g || 51.389], 13);
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
		mutationFn: () => $(`shipping/orders/${r}/map`, {
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
		onError: (e) => il(i, e)
	});
	return /* @__PURE__ */ b(q, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ y(J, {
			className: "pb-2",
			children: /* @__PURE__ */ y(Y, {
				className: "text-base",
				children: i("shipping.orderMapTitle")
			})
		}), /* @__PURE__ */ b(X, {
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
						children: [/* @__PURE__ */ y(Q, { children: "Lat" }), /* @__PURE__ */ y(Z, {
							type: "number",
							step: "any",
							dir: "ltr",
							value: u,
							onChange: (e) => d(parseFloat(e.target.value) || 0)
						})]
					}), /* @__PURE__ */ b("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ y(Q, { children: "Lng" }), /* @__PURE__ */ y(Z, {
							type: "number",
							step: "any",
							dir: "ltr",
							value: g,
							onChange: (e) => _(parseFloat(e.target.value) || 0)
						})]
					})]
				}),
				/* @__PURE__ */ y(K, {
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
function ul({ className: e }) {
	return /* @__PURE__ */ b("svg", {
		width: "13",
		height: "12",
		viewBox: "0 0 13 12",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		className: G("inline-block h-[0.85em] w-auto shrink-0 align-[-0.12em]", e),
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
var dl = /تومان|toman|irt/i;
function fl(e) {
	return e.replace(/&nbsp;/gi, " ").replace(/&#160;/g, " ").replace(/&#x0*a0;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, "\"").replace(/&#(\d+);/g, (e, t) => {
		let n = Number(t);
		return Number.isFinite(n) ? String.fromCharCode(n) : e;
	}).replace(/\u00a0/g, " ");
}
function pl(e, t) {
	let n = (e ?? "").trim(), r = (t ?? "").trim();
	if (!n && !r) return !1;
	let i = n.toUpperCase();
	return !!(i === "IRT" || i === "TOMAN" || dl.test(n) || dl.test(r));
}
var ml = {
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
function hl(e) {
	return e.toLowerCase().startsWith("fa");
}
function gl(e) {
	return e.replace(/\d/g, (e) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(e, 10)] ?? e);
}
function _l(e) {
	return e.replace(/[۰-۹٠-٩]/g, (e) => ml[e] ?? e);
}
function vl(e, t) {
	return hl(t) ? gl(e) : e;
}
//#endregion
//#region src/lib/formatNumber.ts
function yl(e, t) {
	let n = Number.isFinite(e) ? e : 0, r = hl(t) ? "fa-IR" : "en-US", i = new Intl.NumberFormat(r, { maximumFractionDigits: 2 }).format(n);
	return hl(t) ? gl(i) : i;
}
//#endregion
//#region src/components/currency/MoneyDisplay.tsx
var bl = /تومان|toman|irt/gi;
function xl(e) {
	if (typeof e == "number") return Number.isFinite(e) ? e : 0;
	let t = _l(fl(e)).replace(bl, "").replace(/[^\d.-]/g, ""), n = parseFloat(t);
	return Number.isFinite(n) ? n : NaN;
}
function Sl({ amount: e, currency: t, currencySymbol: n, locale: r, className: i, amountClassName: a, prefix: o }) {
	let s = xl(e), c = Number.isFinite(s) ? yl(s, r) : vl(_l(fl(String(e))).replace(bl, "").trim(), r), l = pl(t, n) || !t?.trim() && !n?.trim();
	return /* @__PURE__ */ b("span", {
		className: G("inline-flex items-baseline gap-1", i),
		dir: "ltr",
		children: [
			o,
			/* @__PURE__ */ y("span", {
				className: a,
				children: c
			}),
			l ? /* @__PURE__ */ y(ul, {}) : t ? /* @__PURE__ */ y("span", {
				className: "text-muted-foreground text-[0.85em]",
				children: t
			}) : null
		]
	});
}
//#endregion
//#region ../Modules/shipping-module/client/components/OrderPackagingPanel.tsx
function Cl({ orderId: r, currency: i = "IRT", locale: a = "fa-IR" }) {
	let { t: o } = m(), s = n(), c = t({
		queryKey: ["shipping-order-packaging", r],
		queryFn: () => $(`shipping/orders/${r}/packaging`),
		enabled: r > 0
	});
	al(c);
	let l = e({
		mutationFn: () => $(`shipping/orders/${r}/packaging`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}"
		}),
		onSuccess: (e) => {
			s.setQueryData(["shipping-order-packaging", r], e), h.success(o("shipping.recalcOk"));
		},
		onError: (e) => il(o, e)
	}), u = c.data?.plan;
	return /* @__PURE__ */ b(q, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ b(J, {
			className: "flex flex-row items-center justify-between gap-2 pb-2",
			children: [/* @__PURE__ */ y(Y, {
				className: "text-base",
				children: o("shipping.orderPackagingTitle")
			}), /* @__PURE__ */ y(K, {
				type: "button",
				size: "sm",
				variant: "secondary",
				disabled: l.isPending,
				onClick: () => void l.mutateAsync(),
				children: o("shipping.recalcPlan")
			})]
		}), /* @__PURE__ */ y(X, {
			className: "space-y-2 text-sm",
			children: c.isPending ? /* @__PURE__ */ y("p", {
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
					] }), /* @__PURE__ */ y(Sl, {
						amount: e.price,
						currency: i,
						locale: a
					})]
				}, `${e.size}-${t}`))
			}), /* @__PURE__ */ b("div", {
				className: "flex items-center justify-between border-t border-border pt-2 font-medium",
				children: [/* @__PURE__ */ b("span", { children: [o("shipping.boxCount", { count: u.box_count }), u.oversized ? ` · ${o("shipping.oversized")}` : ""] }), /* @__PURE__ */ y(Sl, {
					amount: u.total_packaging_cost,
					currency: i,
					locale: a
				})]
			})] })
		})]
	});
}
//#endregion
//#region src/components/PageShell.tsx
function wl({ title: e, description: t, eyebrow: n, children: r }) {
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
var Tl = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), El = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Dl = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), Ol = (e) => {
	let t = Dl(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, kl = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, Al = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, jl = a({}), Ml = () => c(jl), Nl = s(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: a, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = Ml() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return o("svg", {
		ref: l,
		...kl,
		width: t ?? u ?? kl.width,
		height: t ?? u ?? kl.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: Tl("lucide", m, i),
		...!a && !Al(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => o(e, t)), ...Array.isArray(a) ? a : [a]]);
}), Pl = (e, t) => {
	let n = s(({ className: n, ...r }, i) => o(Nl, {
		ref: i,
		iconNode: t,
		className: Tl(`lucide-${El(Ol(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = Ol(e), n;
}, Fl = Pl("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]), Il = Pl("chevron-down", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]), Ll = Pl("chevron-up", [["path", {
	d: "m18 15-6-6-6 6",
	key: "153udz"
}]]);
//#endregion
//#region src/hooks/use-text-direction.ts
function Rl() {
	let { i18n: e } = m();
	return e.dir() === "rtl" ? "rtl" : "ltr";
}
//#endregion
//#region src/components/ui/select.tsx
function zl({ ...e }) {
	return /* @__PURE__ */ y(Po, {
		"data-slot": "select",
		...e
	});
}
function Bl({ ...e }) {
	return /* @__PURE__ */ y(Io, {
		"data-slot": "select-value",
		...e
	});
}
function Vl({ className: e, size: t = "default", children: n, ...r }) {
	return /* @__PURE__ */ b(Fo, {
		"data-slot": "select-trigger",
		"data-size": t,
		dir: Rl(),
		className: G("flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap text-start shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", e),
		...r,
		children: [n, /* @__PURE__ */ y(Lo, {
			asChild: !0,
			children: /* @__PURE__ */ y(Il, { className: "size-4 opacity-50" })
		})]
	});
}
function Hl({ className: e, children: t, position: n = "popper", align: r = "start", ...i }) {
	return /* @__PURE__ */ y(pn, {
		allowBodyScroll: !0,
		children: /* @__PURE__ */ y(Ro, { children: /* @__PURE__ */ b(zo, {
			"data-slot": "select-content",
			dir: Rl(),
			className: G("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-start text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", e),
			position: n,
			align: r,
			...i,
			children: [
				/* @__PURE__ */ y(Wl, {}),
				/* @__PURE__ */ y(Bo, {
					className: G("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
					children: t
				}),
				/* @__PURE__ */ y(Gl, {})
			]
		}) })
	});
}
function Ul({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ b(Vo, {
		"data-slot": "select-item",
		className: G("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pe-8 ps-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", e),
		...n,
		children: [/* @__PURE__ */ y("span", {
			"data-slot": "select-item-indicator",
			className: "absolute end-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ y(Uo, { children: /* @__PURE__ */ y(Fl, { className: "size-4" }) })
		}), /* @__PURE__ */ y(Ho, { children: t })]
	});
}
function Wl({ className: e, ...t }) {
	return /* @__PURE__ */ y(Wo, {
		"data-slot": "select-scroll-up-button",
		className: G("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ y(Ll, { className: "size-4" })
	});
}
function Gl({ className: e, ...t }) {
	return /* @__PURE__ */ y(Go, {
		"data-slot": "select-scroll-down-button",
		className: G("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ y(Il, { className: "size-4" })
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/CitiesSettingsPage.tsx
function Kl() {
	let { t: r } = m(), i = n(), [a, o] = p(0), [s, c] = p(0), [u, f] = p(""), [g, _] = p(""), [x, S] = p({}), [C, w] = p(null), [T, E] = p(!1), D = t({
		queryKey: ["shipping-cities-tree"],
		queryFn: () => $("shipping/cities/tree", {}, 6e4)
	});
	al(D);
	let O = async () => {
		if (!T) {
			E(!0);
			try {
				let e = D.data?.next_key ?? null, t = 0;
				for (; t < 40;) {
					++t;
					let n = await $("shipping/cities/seed-batch", {
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
				il(r, e);
			} finally {
				E(!1);
			}
		}
	};
	l(() => {
		!D.data || T || (D.data.needs_seed || !D.data.installed && (D.data.states_total ?? 0) > 0) && O();
	}, [
		D.data?.needs_seed,
		D.data?.installed,
		D.data?.states_total
	]);
	let k = t({
		queryKey: ["shipping-cities-bulk", a],
		queryFn: () => $(`shipping/cities/bulk/${a}`),
		enabled: a > 0
	});
	al(k);
	let A = t({
		queryKey: [
			"shipping-cities-search",
			g,
			a
		],
		queryFn: () => $(`shipping/cities/search?q=${encodeURIComponent(g)}&state=${a || 0}`),
		enabled: g.trim().length >= 2
	});
	l(() => {
		if (!k.data?.rows) return;
		let e = {};
		for (let t of k.data.rows) {
			e[String(t.id)] = {};
			for (let [n, r] of Object.entries(t.prices || {})) e[String(t.id)][n] = r == null ? "" : String(r);
		}
		S(e);
	}, [k.data]), l(() => {
		c(0), f("");
	}, [a]);
	let j = d(() => (k.data?.rows || []).filter((e) => !e.name.startsWith("—")), [k.data]), M = d(() => {
		if (!s || !k.data?.rows) return [];
		let e = k.data.rows, t = e.findIndex((e) => e.id === s);
		if (t < 0) return [];
		let n = [];
		for (let r = t + 1; r < e.length && e[r].name.startsWith("—"); r++) n.push(e[r]);
		return n;
	}, [k.data, s]), N = e({
		mutationFn: async () => (await O(), {
			ok: !0,
			message: r("shipping.citiesInstalled")
		}),
		onError: (e) => il(r, e)
	}), P = e({
		mutationFn: () => $(`shipping/cities/bulk/${a}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ prices: x })
		}),
		onSuccess: () => {
			h.success(r("common.saved")), i.invalidateQueries({ queryKey: ["shipping-cities-bulk", a] });
		},
		onError: (e) => il(r, e)
	}), ee = e({
		mutationFn: () => {
			let e = j.map((e) => e.id);
			return $("shipping/cities/create-zones", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ city_ids: e.slice(0, 20) })
			});
		},
		onSuccess: () => h.success(r("shipping.zonesCreated")),
		onError: (e) => il(r, e)
	}), F = e({
		mutationFn: () => $("shipping/cities/district", {
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
		onError: (e) => il(r, e)
	}), te = e({
		mutationFn: (e) => $(`shipping/cities/district/${e}`, { method: "DELETE" }),
		onSuccess: (e) => {
			e.ok ? (h.success(e.message), i.invalidateQueries({ queryKey: ["shipping-cities-bulk", a] })) : h.error(e.message);
		},
		onError: (e) => il(r, e)
	}), I = D.data?.states ?? [], ne = k.data?.columns ?? [], re = k.data?.rows ?? [], L = C && C.total > 0 ? r("shipping.citiesSeedProgress", {
		done: C.done,
		total: C.total
	}) : D.data?.states_total ? r("shipping.citiesSeedProgress", {
		done: D.data.states_done ?? 0,
		total: D.data.states_total
	}) : null;
	return /* @__PURE__ */ b(wl, {
		title: r("shipping.citiesTitle"),
		description: r("shipping.citiesHint"),
		children: [
			/* @__PURE__ */ b("div", {
				className: "mb-4 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ y(K, {
					type: "button",
					variant: "secondary",
					disabled: T || N.isPending,
					onClick: () => void O(),
					children: r("shipping.reinstallCities")
				}), a > 0 && /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y(K, {
					type: "button",
					disabled: P.isPending,
					onClick: () => void P.mutate(),
					children: r("common.save")
				}), /* @__PURE__ */ y(K, {
					type: "button",
					variant: "outline",
					disabled: ee.isPending,
					onClick: () => void ee.mutate(),
					children: r("shipping.createZonesFromCities")
				})] })]
			}),
			/* @__PURE__ */ b(q, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ b(J, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(Y, {
						className: "text-base",
						children: r("shipping.pickState")
					}), /* @__PURE__ */ y(Ic, { children: T || D.isFetching ? L || r("shipping.citiesLoading") : D.data?.installed ? r("shipping.citiesInstalled") : r("shipping.citiesSeeding") })]
				}), /* @__PURE__ */ b(X, {
					className: "grid gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ b("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ y(Q, { children: r("tapin.province") }), /* @__PURE__ */ b(zl, {
							value: a ? String(a) : void 0,
							onValueChange: (e) => o(parseInt(e, 10) || 0),
							children: [/* @__PURE__ */ y(Vl, { children: /* @__PURE__ */ y(Bl, { placeholder: r("tapin.pickProvince") }) }), /* @__PURE__ */ y(Hl, { children: I.map((e) => /* @__PURE__ */ y(Ul, {
								value: String(e.id),
								children: e.name
							}, e.id)) })]
						})]
					}), /* @__PURE__ */ b("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ y(Q, { children: r("shipping.citySearch") }),
							/* @__PURE__ */ y(Z, {
								value: g,
								onChange: (e) => _(e.target.value),
								placeholder: r("shipping.citySearchPlaceholder")
							}),
							A.data?.items?.length ? /* @__PURE__ */ y("ul", {
								className: "border-border max-h-40 overflow-auto rounded-md border text-sm",
								children: A.data.items.map((e) => /* @__PURE__ */ y("li", { children: /* @__PURE__ */ b("button", {
									type: "button",
									className: "hover:bg-muted w-full px-2 py-1.5 text-start",
									onClick: () => {
										(e.type === "city" || e.type === "district") && (a < 1 && e.parent, e.type === "city" && c(e.id), h.message(`${e.name} (${e.type})`));
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
			a > 0 && /* @__PURE__ */ b(q, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ b(J, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(Y, {
						className: "text-base",
						children: r("shipping.districtsTitle")
					}), /* @__PURE__ */ y(Ic, { children: r("shipping.districtsHint") })]
				}), /* @__PURE__ */ b(X, {
					className: "space-y-3",
					children: [/* @__PURE__ */ b("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(Q, { children: r("tapin.city") }), /* @__PURE__ */ b(zl, {
								value: s ? String(s) : void 0,
								onValueChange: (e) => c(parseInt(e, 10) || 0),
								children: [/* @__PURE__ */ y(Vl, { children: /* @__PURE__ */ y(Bl, { placeholder: r("tapin.pickCity") }) }), /* @__PURE__ */ y(Hl, { children: j.map((e) => /* @__PURE__ */ y(Ul, {
									value: String(e.id),
									children: e.name
								}, e.id)) })]
							})]
						}), /* @__PURE__ */ b("div", {
							className: "flex items-end gap-2",
							children: [/* @__PURE__ */ b("div", {
								className: "flex-1 space-y-1.5",
								children: [/* @__PURE__ */ y(Q, { children: r("shipping.districtName") }), /* @__PURE__ */ y(Z, {
									value: u,
									onChange: (e) => f(e.target.value),
									disabled: !s
								})]
							}), /* @__PURE__ */ y(K, {
								type: "button",
								disabled: !s || !u.trim() || F.isPending,
								onClick: () => void F.mutate(),
								children: r("shipping.addDistrict")
							})]
						})]
					}), s > 0 && /* @__PURE__ */ y("ul", {
						className: "divide-border divide-y text-sm",
						children: M.length === 0 ? /* @__PURE__ */ y("li", {
							className: "text-muted-foreground py-2",
							children: r("shipping.noDistricts")
						}) : M.map((e) => /* @__PURE__ */ b("li", {
							className: "flex items-center justify-between gap-2 py-2",
							children: [/* @__PURE__ */ y("span", { children: e.name.replace(/^—\s*/, "") }), /* @__PURE__ */ y(K, {
								type: "button",
								size: "sm",
								variant: "ghost",
								disabled: te.isPending,
								onClick: () => void te.mutate(e.id),
								children: r("common.delete")
							})]
						}, e.id))
					})]
				})]
			}),
			a > 0 && /* @__PURE__ */ b(q, {
				className: "shadow-sm",
				children: [/* @__PURE__ */ y(J, {
					className: "pb-2",
					children: /* @__PURE__ */ y(Y, {
						className: "text-base",
						children: r("shipping.bulkPrices")
					})
				}), /* @__PURE__ */ y(X, {
					className: "overflow-x-auto",
					children: k.isPending ? /* @__PURE__ */ y("p", {
						className: "text-muted-foreground text-sm",
						children: r("common.loading")
					}) : /* @__PURE__ */ b("table", {
						className: "w-full min-w-[640px] border-collapse text-sm",
						children: [/* @__PURE__ */ y("thead", { children: /* @__PURE__ */ b("tr", {
							className: "border-b text-start",
							children: [/* @__PURE__ */ y("th", {
								className: "p-2 text-start",
								children: r("tapin.city")
							}), ne.map((e) => /* @__PURE__ */ b("th", {
								className: "p-2 text-start whitespace-nowrap",
								children: [e.label, e.method_id.includes("tipax") ? ` / ${r("shipping.tipaxOn")}` : ""]
							}, e.key))]
						}) }), /* @__PURE__ */ y("tbody", { children: re.map((e) => /* @__PURE__ */ b("tr", {
							className: "border-b border-border/60",
							children: [/* @__PURE__ */ y("td", {
								className: "p-2 whitespace-nowrap",
								children: e.name
							}), ne.map((t) => /* @__PURE__ */ b("td", {
								className: "p-2 align-top",
								children: [/* @__PURE__ */ y(Z, {
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
//#region src/components/ui/switch.tsx
function ql({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ y(us, {
		"data-slot": "switch",
		"data-size": t,
		className: G("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", e),
		...n,
		dir: "ltr",
		children: /* @__PURE__ */ y(ds, {
			"data-slot": "switch-thumb",
			className: G("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/MapSettingsPage.tsx
function Jl() {
	let { t: n } = m(), [r, i] = p(null), a = t({
		queryKey: ["shipping-map"],
		queryFn: () => $("shipping/map/settings")
	});
	al(a), l(() => {
		a.data?.settings && i(a.data.settings);
	}, [a.data]);
	let o = e({
		mutationFn: (e) => $("shipping/map/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ settings: e })
		}),
		onSuccess: () => h.success(n("common.saved")),
		onError: (e) => il(n, e)
	});
	return r ? /* @__PURE__ */ b(wl, {
		title: n("shipping.mapTitle"),
		description: n("shipping.mapHint"),
		children: [/* @__PURE__ */ y("div", {
			className: "mb-4 flex justify-end",
			children: /* @__PURE__ */ y(K, {
				disabled: o.isPending,
				onClick: () => o.mutate(r),
				children: n("common.save")
			})
		}), /* @__PURE__ */ b(q, {
			className: "shadow-sm",
			children: [/* @__PURE__ */ y(J, {
				className: "pb-2",
				children: /* @__PURE__ */ y(Y, {
					className: "text-base",
					children: n("shipping.mapTitle")
				})
			}), /* @__PURE__ */ b(X, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ b("label", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ y("span", { children: n("shipping.mapEnabled") }), /* @__PURE__ */ y(ql, {
							checked: r.enabled,
							onCheckedChange: (e) => i({
								...r,
								enabled: e
							})
						})]
					}),
					/* @__PURE__ */ b("label", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ y("span", { children: n("shipping.mapRequired") }), /* @__PURE__ */ y(ql, {
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
								children: [/* @__PURE__ */ y(Q, { children: n("shipping.mapProvider") }), /* @__PURE__ */ b(zl, {
									value: r.provider,
									onValueChange: (e) => i({
										...r,
										provider: e
									}),
									children: [/* @__PURE__ */ y(Vl, { children: /* @__PURE__ */ y(Bl, {}) }), /* @__PURE__ */ b(Hl, { children: [
										/* @__PURE__ */ y(Ul, {
											value: "osm",
											children: "OpenStreetMap"
										}),
										/* @__PURE__ */ y(Ul, {
											value: "neshan",
											children: "Neshan"
										}),
										/* @__PURE__ */ y(Ul, {
											value: "mapp",
											children: "Map.ir"
										})
									] })]
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(Q, { children: n("shipping.mapPlacement") }), /* @__PURE__ */ b(zl, {
									value: r.checkout_placement,
									onValueChange: (e) => i({
										...r,
										checkout_placement: e
									}),
									children: [/* @__PURE__ */ y(Vl, { children: /* @__PURE__ */ y(Bl, {}) }), /* @__PURE__ */ b(Hl, { children: [/* @__PURE__ */ y(Ul, {
										value: "after_order_notes",
										children: n("shipping.mapAfterNotes")
									}), /* @__PURE__ */ y(Ul, {
										value: "before_customer_details",
										children: n("shipping.mapBeforeDetails")
									})] })]
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(Q, { children: n("shipping.mapDistance") }), /* @__PURE__ */ b(zl, {
									value: r.distance_mode,
									onValueChange: (e) => i({
										...r,
										distance_mode: e
									}),
									children: [/* @__PURE__ */ y(Vl, { children: /* @__PURE__ */ y(Bl, {}) }), /* @__PURE__ */ b(Hl, { children: [
										/* @__PURE__ */ y(Ul, {
											value: "none",
											children: n("shipping.mapDistNone")
										}),
										/* @__PURE__ */ y(Ul, {
											value: "direct",
											children: n("shipping.mapDistDirect")
										}),
										/* @__PURE__ */ y(Ul, {
											value: "real",
											children: n("shipping.mapDistReal")
										})
									] })]
								})]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(Q, { children: "Neshan API" }), /* @__PURE__ */ y(Z, {
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
								children: [/* @__PURE__ */ y(Q, { children: "Map.ir API" }), /* @__PURE__ */ y(Z, {
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
								children: [/* @__PURE__ */ y(Q, { children: "ORS Token" }), /* @__PURE__ */ y(Z, {
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
								children: [/* @__PURE__ */ y(Q, { children: n("shipping.storeLat") }), /* @__PURE__ */ y(Z, {
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
								children: [/* @__PURE__ */ y(Q, { children: n("shipping.storeLng") }), /* @__PURE__ */ y(Z, {
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
	}) : /* @__PURE__ */ y(wl, {
		title: n("shipping.mapTitle"),
		children: /* @__PURE__ */ y("p", {
			className: "text-muted-foreground text-sm",
			children: n("common.loading")
		})
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/PackagingSettingsPage.tsx
function Yl(e) {
	return Object.values(e.boxes).sort((e, t) => e.size - t.size);
}
function Xl() {
	let { t: n } = m(), [r, i] = p(null), a = t({
		queryKey: ["shipping-packaging-settings"],
		queryFn: () => $("shipping/packaging/settings")
	});
	al(a), l(() => {
		a.data?.settings && i(a.data.settings);
	}, [a.data]);
	let o = e({
		mutationFn: (e) => $("shipping/packaging/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ settings: e })
		}),
		onSuccess: (e) => {
			h.success(n("common.saved")), e.settings && i(e.settings);
		},
		onError: (e) => il(n, e)
	}), s = d(() => r ? Yl(r) : [], [r]);
	return r ? /* @__PURE__ */ b(wl, {
		title: n("shipping.packagingTitle"),
		description: n("shipping.packagingHint"),
		children: [
			/* @__PURE__ */ y("div", {
				className: "mb-4 flex justify-end",
				children: /* @__PURE__ */ y(K, {
					type: "button",
					disabled: o.isPending,
					onClick: () => o.mutate(r),
					children: n("common.save")
				})
			}),
			/* @__PURE__ */ b(q, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ b(J, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(Y, {
						className: "text-base",
						children: n("shipping.checkoutToggleTitle")
					}), /* @__PURE__ */ y(Ic, { children: n("shipping.checkoutToggleHint") })]
				}), /* @__PURE__ */ y(X, { children: /* @__PURE__ */ b("label", {
					className: "flex items-center gap-3 text-sm",
					children: [/* @__PURE__ */ y(ql, {
						checked: r.add_packaging_cost_to_checkout,
						onCheckedChange: (e) => i((t) => t && {
							...t,
							add_packaging_cost_to_checkout: e
						})
					}), /* @__PURE__ */ y("span", { children: n("shipping.addPackagingToCheckout") })]
				}) })]
			}),
			/* @__PURE__ */ b(q, {
				className: "shadow-sm",
				children: [/* @__PURE__ */ b(J, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(Y, {
						className: "text-base",
						children: n("shipping.boxesTitle")
					}), /* @__PURE__ */ y(Ic, { children: n("shipping.boxesHint") })]
				}), /* @__PURE__ */ b(X, {
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
								children: [/* @__PURE__ */ y(Q, {
									className: "sm:sr-only",
									children: n("shipping.boxPrice")
								}), /* @__PURE__ */ y(Z, {
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
								children: [/* @__PURE__ */ y(Q, {
									className: "sm:sr-only",
									children: n("shipping.boxTare")
								}), /* @__PURE__ */ y(Z, {
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
								children: [/* @__PURE__ */ y(ql, {
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
	}) : /* @__PURE__ */ y(wl, {
		title: n("shipping.packagingTitle"),
		children: /* @__PURE__ */ y("p", {
			className: "text-muted-foreground text-sm",
			children: n("common.loading")
		})
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/RulesSettingsPage.tsx
var Zl = [
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
], Ql = [
	"hide_method",
	"force_method",
	"set_cost",
	"free",
	"set_title"
];
function $l() {
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
function eu(e, t, n) {
	let r = e.slice();
	return r[t] = {
		...e[t],
		...n
	}, r;
}
function tu() {
	let { t: n } = m(), [r, i] = p([]), a = t({
		queryKey: ["shipping-rules"],
		queryFn: () => $("shipping/rules")
	});
	al(a), l(() => {
		a.data?.rules && i(a.data.rules);
	}, [a.data]);
	let o = e({
		mutationFn: (e) => $("shipping/rules", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ rules: e })
		}),
		onSuccess: () => h.success(n("common.saved")),
		onError: (e) => il(n, e)
	});
	return /* @__PURE__ */ b(wl, {
		title: n("shipping.rulesTitle"),
		description: n("shipping.rulesHint"),
		children: [/* @__PURE__ */ b("div", {
			className: "mb-4 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ y(K, {
				type: "button",
				variant: "secondary",
				onClick: () => i((e) => [...e, $l()]),
				children: n("shipping.addRule")
			}), /* @__PURE__ */ y(K, {
				type: "button",
				disabled: o.isPending,
				onClick: () => o.mutate(r),
				children: n("common.save")
			})]
		}), /* @__PURE__ */ y("div", {
			className: "space-y-4",
			children: r.map((e, t) => /* @__PURE__ */ b(q, {
				className: "shadow-sm",
				children: [/* @__PURE__ */ b(J, {
					className: "flex flex-row items-center justify-between gap-2 pb-2",
					children: [/* @__PURE__ */ y(Y, {
						className: "text-base",
						children: e.title || n("shipping.ruleN", { n: t + 1 })
					}), /* @__PURE__ */ b("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ y(ql, {
							checked: e.enabled,
							onCheckedChange: (e) => i(eu(r, t, { enabled: e }))
						}), /* @__PURE__ */ y(K, {
							type: "button",
							size: "sm",
							variant: "ghost",
							onClick: () => i(r.filter((e, n) => n !== t)),
							children: n("common.delete")
						})]
					})]
				}), /* @__PURE__ */ b(X, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ b("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(Q, { children: n("shipping.ruleTitle") }), /* @__PURE__ */ y(Z, {
									value: e.title,
									onChange: (e) => i(eu(r, t, { title: e.target.value }))
								})]
							}), /* @__PURE__ */ b("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ y(Q, { children: n("shipping.rulePriority") }), /* @__PURE__ */ y(Z, {
									type: "number",
									dir: "ltr",
									value: e.priority,
									onChange: (e) => i(eu(r, t, { priority: parseInt(e.target.value, 10) || 0 }))
								})]
							})]
						}),
						/* @__PURE__ */ b("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ b("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ y(Q, { children: n("shipping.conditions") }), /* @__PURE__ */ y(K, {
									type: "button",
									size: "sm",
									variant: "outline",
									onClick: () => i(eu(r, t, { conditions: [...e.conditions, {
										type: "cart_total_min",
										value: 0
									}] })),
									children: n("shipping.addCondition")
								})]
							}), (e.conditions.length ? e.conditions : [{
								type: "cart_total_min",
								value: ""
							}]).map((a, o) => /* @__PURE__ */ b("div", {
								className: "grid gap-2 sm:grid-cols-[1fr_1fr_auto]",
								children: [
									/* @__PURE__ */ b(zl, {
										value: a.type || "cart_total_min",
										onValueChange: (n) => {
											let s = e.conditions.slice();
											s[o] = {
												...a,
												type: n
											}, i(eu(r, t, { conditions: s }));
										},
										children: [/* @__PURE__ */ y(Vl, { children: /* @__PURE__ */ y(Bl, {}) }), /* @__PURE__ */ y(Hl, { children: Zl.map((e) => /* @__PURE__ */ y(Ul, {
											value: e,
											children: e
										}, e)) })]
									}),
									/* @__PURE__ */ y(Z, {
										dir: "ltr",
										value: String(a.value ?? ""),
										onChange: (n) => {
											let s = e.conditions.slice();
											s[o] = {
												...a,
												value: n.target.value
											}, i(eu(r, t, { conditions: s }));
										}
									}),
									/* @__PURE__ */ y(K, {
										type: "button",
										size: "sm",
										variant: "ghost",
										disabled: e.conditions.length <= 1,
										onClick: () => i(eu(r, t, { conditions: e.conditions.filter((e, t) => t !== o) })),
										children: n("common.delete")
									})
								]
							}, `${e.id}-c-${o}`))]
						}),
						/* @__PURE__ */ b("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ b("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ y(Q, { children: n("shipping.actions") }), /* @__PURE__ */ y(K, {
									type: "button",
									size: "sm",
									variant: "outline",
									onClick: () => i(eu(r, t, { actions: [...e.actions, {
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
							}]).map((a, o) => /* @__PURE__ */ b("div", {
								className: "grid gap-2 sm:grid-cols-4",
								children: [
									/* @__PURE__ */ b(zl, {
										value: a.type || "free",
										onValueChange: (n) => {
											let s = e.actions.slice();
											s[o] = {
												...a,
												type: n
											}, i(eu(r, t, { actions: s }));
										},
										children: [/* @__PURE__ */ y(Vl, { children: /* @__PURE__ */ y(Bl, {}) }), /* @__PURE__ */ y(Hl, { children: Ql.map((e) => /* @__PURE__ */ y(Ul, {
											value: e,
											children: e
										}, e)) })]
									}),
									/* @__PURE__ */ y(Z, {
										dir: "ltr",
										placeholder: "webino_tapin_pishtaz",
										value: a.method_id || "",
										onChange: (n) => {
											let s = e.actions.slice();
											s[o] = {
												...a,
												method_id: n.target.value
											}, i(eu(r, t, { actions: s }));
										}
									}),
									/* @__PURE__ */ y(Z, {
										dir: "ltr",
										value: String(a.value ?? ""),
										onChange: (n) => {
											let s = e.actions.slice();
											s[o] = {
												...a,
												value: n.target.value
											}, i(eu(r, t, { actions: s }));
										}
									}),
									/* @__PURE__ */ y(K, {
										type: "button",
										size: "sm",
										variant: "ghost",
										disabled: e.actions.length <= 1,
										onClick: () => i(eu(r, t, { actions: e.actions.filter((e, t) => t !== o) })),
										children: n("common.delete")
									})
								]
							}, `${e.id}-a-${o}`))]
						})
					]
				})]
			}, e.id))
		})]
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/ToolsSettingsPage.tsx
var nu = () => ({
	hide_when_free: !1,
	hide_when_courier: !1,
	default_product_weight_g: 500,
	default_package_weight_g: 100,
	post_weight_limit_kg: 30,
	status_enable: !0,
	free_shipping_title: "",
	hide_country: !0,
	swap_state_city: !1,
	disable_default_method: !1,
	free_first_order: !1,
	honor_free_shipping_coupon: !0,
	method_images: {}
});
function ru() {
	let { t: n } = m(), [r, i] = p(null), a = t({
		queryKey: ["shipping-tools"],
		queryFn: () => $("shipping/tools/settings")
	});
	al(a), l(() => {
		a.data?.settings && i({
			...nu(),
			...a.data.settings
		});
	}, [a.data]);
	let o = e({
		mutationFn: (e) => $("shipping/tools/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ settings: e })
		}),
		onSuccess: () => h.success(n("common.saved")),
		onError: (e) => il(n, e)
	});
	return r ? /* @__PURE__ */ b(wl, {
		title: n("shipping.toolsTitle"),
		description: n("shipping.toolsHint"),
		children: [
			/* @__PURE__ */ y("div", {
				className: "mb-4 flex justify-end",
				children: /* @__PURE__ */ y(K, {
					type: "button",
					disabled: o.isPending,
					onClick: () => o.mutate(r),
					children: n("common.save")
				})
			}),
			/* @__PURE__ */ b(q, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ y(J, {
					className: "pb-2",
					children: /* @__PURE__ */ y(Y, {
						className: "text-base",
						children: n("shipping.toolsRatesTitle")
					})
				}), /* @__PURE__ */ b(X, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ b("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ y("span", { children: n("shipping.hideWhenFree") }), /* @__PURE__ */ y(ql, {
								checked: r.hide_when_free,
								onCheckedChange: (e) => i({
									...r,
									hide_when_free: e
								})
							})]
						}),
						/* @__PURE__ */ b("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ y("span", { children: n("shipping.hideWhenCourier") }), /* @__PURE__ */ y(ql, {
								checked: r.hide_when_courier,
								onCheckedChange: (e) => i({
									...r,
									hide_when_courier: e
								})
							})]
						}),
						/* @__PURE__ */ b("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ y("span", { children: n("shipping.statusEnable") }), /* @__PURE__ */ y(ql, {
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
			/* @__PURE__ */ b(q, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ y(J, {
					className: "pb-2",
					children: /* @__PURE__ */ y(Y, {
						className: "text-base",
						children: n("shipping.toolsWeightTitle")
					})
				}), /* @__PURE__ */ b(X, {
					className: "grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(Q, { children: n("shipping.defaultProductWeight") }), /* @__PURE__ */ y(Z, {
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
							children: [/* @__PURE__ */ y(Q, { children: n("shipping.defaultPackageWeight") }), /* @__PURE__ */ y(Z, {
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
							children: [/* @__PURE__ */ y(Q, { children: n("shipping.postWeightLimit") }), /* @__PURE__ */ y(Z, {
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
			/* @__PURE__ */ b(q, {
				className: "mb-4 shadow-sm",
				children: [/* @__PURE__ */ y(J, {
					className: "pb-2",
					children: /* @__PURE__ */ y(Y, {
						className: "text-base",
						children: n("shipping.proUxTitle")
					})
				}), /* @__PURE__ */ b(X, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ b("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ y(Q, { children: n("shipping.freeShippingTitle") }), /* @__PURE__ */ y(Z, {
								value: r.free_shipping_title,
								onChange: (e) => i({
									...r,
									free_shipping_title: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ b("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ y("span", { children: n("shipping.hideCountry") }), /* @__PURE__ */ y(ql, {
								checked: r.hide_country,
								onCheckedChange: (e) => i({
									...r,
									hide_country: e
								})
							})]
						}),
						/* @__PURE__ */ b("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ y("span", { children: n("shipping.swapStateCity") }), /* @__PURE__ */ y(ql, {
								checked: r.swap_state_city,
								onCheckedChange: (e) => i({
									...r,
									swap_state_city: e
								})
							})]
						}),
						/* @__PURE__ */ b("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ y("span", { children: n("shipping.disableDefaultMethod") }), /* @__PURE__ */ y(ql, {
								checked: r.disable_default_method,
								onCheckedChange: (e) => i({
									...r,
									disable_default_method: e
								})
							})]
						}),
						/* @__PURE__ */ b("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ y("span", { children: n("shipping.freeFirstOrder") }), /* @__PURE__ */ y(ql, {
								checked: r.free_first_order,
								onCheckedChange: (e) => i({
									...r,
									free_first_order: e
								})
							})]
						}),
						/* @__PURE__ */ b("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ y("span", { children: n("shipping.honorFreeCoupon") }), /* @__PURE__ */ y(ql, {
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
			/* @__PURE__ */ b(q, {
				className: "shadow-sm",
				children: [/* @__PURE__ */ b(J, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(Y, {
						className: "text-base",
						children: n("shipping.methodImagesTitle")
					}), /* @__PURE__ */ y(Ic, { children: n("shipping.methodImagesHint") })]
				}), /* @__PURE__ */ y(X, {
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
						children: [/* @__PURE__ */ y(Q, {
							dir: "ltr",
							children: e
						}), /* @__PURE__ */ y(Z, {
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
	}) : /* @__PURE__ */ y(wl, {
		title: n("shipping.toolsTitle"),
		children: /* @__PURE__ */ y("p", {
			className: "text-muted-foreground text-sm",
			children: n("common.loading")
		})
	});
}
//#endregion
//#region ../Modules/shipping-module/client/pages/TransportHubPage.tsx
var iu = [
	{
		to: "/settings/shop/transport/packaging",
		title: "shipping.packagingTitle",
		hint: "shipping.packagingCardHint",
		cta: "shipping.openPackaging"
	},
	{
		to: "/settings/shop/transport/tapin",
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
		title: "shipping.toolsTitle",
		hint: "shipping.toolsCardHint",
		cta: "shipping.openTools"
	},
	{
		to: "/settings/shop/transport/cities",
		title: "shipping.citiesTitle",
		hint: "shipping.citiesCardHint",
		cta: "shipping.openCities"
	},
	{
		to: "/settings/shop/transport/map",
		title: "shipping.mapTitle",
		hint: "shipping.mapCardHint",
		cta: "shipping.openMap"
	},
	{
		to: "/settings/shop/transport/rules",
		title: "shipping.rulesTitle",
		hint: "shipping.rulesCardHint",
		cta: "shipping.openRules"
	},
	{
		to: "/settings/shop/shipping",
		title: "shipping.zonesTitle",
		hint: "shipping.zonesHint",
		cta: "shipping.openZones",
		secondary: !0
	}
];
function au() {
	let { t: e } = m();
	return /* @__PURE__ */ b(wl, {
		title: e("shipping.hubTitle"),
		children: [/* @__PURE__ */ y("p", {
			className: "text-muted-foreground mb-4 text-sm",
			children: e("shipping.hubHint")
		}), /* @__PURE__ */ y("div", {
			className: "grid gap-4 md:grid-cols-2",
			children: iu.map((t) => /* @__PURE__ */ b(q, {
				className: "shadow-sm",
				children: [/* @__PURE__ */ b(J, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(Y, {
						className: "text-base",
						children: e(t.title)
					}), /* @__PURE__ */ y(Ic, { children: e(t.hint) })]
				}), /* @__PURE__ */ y(X, { children: /* @__PURE__ */ y(K, {
					asChild: !0,
					variant: "secondary" in t && t.secondary ? "secondary" : "default",
					children: /* @__PURE__ */ y(x, {
						to: t.to,
						children: e(t.cta)
					})
				}) })]
			}, t.to))
		})]
	});
}
//#endregion
//#region ../Modules/shipping-module/client/module-entry.tsx
var ou = {
	"settings/shop/transport": au,
	"settings/shop/transport/packaging": Xl,
	"settings/shop/transport/tools": ru,
	"settings/shop/transport/cities": Kl,
	"settings/shop/transport/map": Jl,
	"settings/shop/transport/rules": tu
}, su = {
	OrderPackagingPanel: Cl,
	OrderMapPanel: ll
}, cu = {
	routes: ou,
	components: su
};
//#endregion
export { su as components, cu as default, ou as routes };
