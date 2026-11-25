import * as e from "react";
import t, { createContext as n, createElement as r, forwardRef as i, useContext as a, useEffect as o, useLayoutEffect as s, useMemo as c, useRef as l, useState as u } from "react";
import { useTranslation as d } from "react-i18next";
import { useMutation as f, useQuery as p, useQueryClient as m } from "@tanstack/react-query";
import { toast as h } from "sonner";
import * as g from "react-dom";
import _ from "react-dom";
import { Fragment as v, jsx as y, jsxs as b } from "react/jsx-runtime";
import { Link as x, useLocation as S, useParams as C } from "react-router-dom";
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
function j(...t) {
	return e.useCallback(A(...t), t);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function M(t) {
	let n = /* @__PURE__ */ ee(t), r = e.forwardRef((t, r) => {
		let { children: i, ...a } = t, o = e.Children.toArray(i), s = o.find(te);
		if (s) {
			let t = s.props.children, i = o.map((n) => n === s ? e.Children.count(t) > 1 ? e.Children.only(null) : e.isValidElement(t) ? t.props.children : null : n);
			return /* @__PURE__ */ y(n, {
				...a,
				ref: r,
				children: e.isValidElement(t) ? e.cloneElement(t, void 0, i) : null
			});
		}
		return /* @__PURE__ */ y(n, {
			...a,
			ref: r,
			children: i
		});
	});
	return r.displayName = `${t}.Slot`, r;
}
/* @__NO_SIDE_EFFECTS__ */
function ee(t) {
	let n = e.forwardRef((t, n) => {
		let { children: r, ...i } = t;
		if (e.isValidElement(r)) {
			let t = ne(r), a = P(i, r.props);
			return r.type !== e.Fragment && (a.ref = n ? A(n, t) : t), e.cloneElement(r, a);
		}
		return e.Children.count(r) > 1 ? e.Children.only(null) : null;
	});
	return n.displayName = `${t}.SlotClone`, n;
}
var N = Symbol("radix.slottable");
function te(t) {
	return e.isValidElement(t) && typeof t.type == "function" && "__radixId" in t.type && t.type.__radixId === N;
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
function ne(e) {
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
].reduce((t, n) => {
	let r = /* @__PURE__ */ M(`Primitive.${n}`), i = e.forwardRef((e, t) => {
		let { asChild: i, ...a } = e, o = i ? r : n;
		return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ y(o, {
			...a,
			ref: t
		});
	});
	return i.displayName = `Primitive.${n}`, {
		...t,
		[n]: i
	};
}, {});
function re(e, t) {
	e && g.flushSync(() => e.dispatchEvent(t));
}
//#endregion
//#region node_modules/@radix-ui/react-visually-hidden/dist/index.mjs
var ie = Object.freeze({
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
}), I = "VisuallyHidden", ae = e.forwardRef((e, t) => /* @__PURE__ */ y(F.span, {
	...e,
	ref: t,
	style: {
		...ie,
		...e.style
	}
}));
ae.displayName = I;
//#endregion
//#region node_modules/@radix-ui/react-context/dist/index.mjs
function oe(t, n = []) {
	let r = [];
	function i(n, i) {
		let a = e.createContext(i), o = r.length;
		r = [...r, i];
		let s = (n) => {
			let { scope: r, children: i, ...s } = n, c = r?.[t]?.[o] || a, l = e.useMemo(() => s, Object.values(s));
			return /* @__PURE__ */ y(c.Provider, {
				value: l,
				children: i
			});
		};
		s.displayName = n + "Provider";
		function c(r, s) {
			let c = s?.[t]?.[o] || a, l = e.useContext(c);
			if (l) return l;
			if (i !== void 0) return i;
			throw Error(`\`${r}\` must be used within \`${n}\``);
		}
		return [s, c];
	}
	let a = () => {
		let n = r.map((t) => e.createContext(t));
		return function(r) {
			let i = r?.[t] || n;
			return e.useMemo(() => ({ [`__scope${t}`]: {
				...r,
				[t]: i
			} }), [r, i]);
		};
	};
	return a.scopeName = t, [i, se(a, ...n)];
}
function se(...t) {
	let n = t[0];
	if (t.length === 1) return n;
	let r = () => {
		let r = t.map((e) => ({
			useScope: e(),
			scopeName: e.scopeName
		}));
		return function(t) {
			let i = r.reduce((e, { useScope: n, scopeName: r }) => {
				let i = n(t)[`__scope${r}`];
				return {
					...e,
					...i
				};
			}, {});
			return e.useMemo(() => ({ [`__scope${n.scopeName}`]: i }), [i]);
		};
	};
	return r.scopeName = n.scopeName, r;
}
//#endregion
//#region node_modules/@radix-ui/react-collection/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function ce(t) {
	let n = /* @__PURE__ */ le(t), r = e.forwardRef((t, r) => {
		let { children: i, ...a } = t, o = e.Children.toArray(i), s = o.find(de);
		if (s) {
			let t = s.props.children, i = o.map((n) => n === s ? e.Children.count(t) > 1 ? e.Children.only(null) : e.isValidElement(t) ? t.props.children : null : n);
			return /* @__PURE__ */ y(n, {
				...a,
				ref: r,
				children: e.isValidElement(t) ? e.cloneElement(t, void 0, i) : null
			});
		}
		return /* @__PURE__ */ y(n, {
			...a,
			ref: r,
			children: i
		});
	});
	return r.displayName = `${t}.Slot`, r;
}
/* @__NO_SIDE_EFFECTS__ */
function le(t) {
	let n = e.forwardRef((t, n) => {
		let { children: r, ...i } = t;
		if (e.isValidElement(r)) {
			let t = pe(r), a = fe(i, r.props);
			return r.type !== e.Fragment && (a.ref = n ? A(n, t) : t), e.cloneElement(r, a);
		}
		return e.Children.count(r) > 1 ? e.Children.only(null) : null;
	});
	return n.displayName = `${t}.SlotClone`, n;
}
var ue = Symbol("radix.slottable");
function de(t) {
	return e.isValidElement(t) && typeof t.type == "function" && "__radixId" in t.type && t.type.__radixId === ue;
}
function fe(e, t) {
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
function pe(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function me(e) {
	let n = e + "CollectionProvider", [r, i] = oe(n), [a, o] = r(n, {
		collectionRef: { current: null },
		itemMap: /* @__PURE__ */ new Map()
	}), s = (e) => {
		let { scope: n, children: r } = e, i = t.useRef(null), o = t.useRef(/* @__PURE__ */ new Map()).current;
		return /* @__PURE__ */ y(a, {
			scope: n,
			itemMap: o,
			collectionRef: i,
			children: r
		});
	};
	s.displayName = n;
	let c = e + "CollectionSlot", l = /* @__PURE__ */ ce(c), u = t.forwardRef((e, t) => {
		let { scope: n, children: r } = e;
		return /* @__PURE__ */ y(l, {
			ref: j(t, o(c, n).collectionRef),
			children: r
		});
	});
	u.displayName = c;
	let d = e + "CollectionItemSlot", f = "data-radix-collection-item", p = /* @__PURE__ */ ce(d), m = t.forwardRef((e, n) => {
		let { scope: r, children: i, ...a } = e, s = t.useRef(null), c = j(n, s), l = o(d, r);
		return t.useEffect(() => (l.itemMap.set(s, {
			ref: s,
			...a
		}), () => void l.itemMap.delete(s))), /* @__PURE__ */ y(p, {
			[f]: "",
			ref: c,
			children: i
		});
	});
	m.displayName = d;
	function h(n) {
		let r = o(e + "CollectionConsumer", n);
		return t.useCallback(() => {
			let e = r.collectionRef.current;
			if (!e) return [];
			let t = Array.from(e.querySelectorAll(`[${f}]`));
			return Array.from(r.itemMap.values()).sort((e, n) => t.indexOf(e.ref.current) - t.indexOf(n.ref.current));
		}, [r.collectionRef, r.itemMap]);
	}
	return [
		{
			Provider: s,
			Slot: u,
			ItemSlot: m
		},
		h,
		i
	];
}
typeof window < "u" && window.document && window.document.createElement;
function L(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var he = globalThis?.document ? e.useLayoutEffect : () => {}, ge = e.useInsertionEffect || he;
function _e({ prop: t, defaultProp: n, onChange: r = () => {}, caller: i }) {
	let [a, o, s] = ve({
		defaultProp: n,
		onChange: r
	}), c = t !== void 0, l = c ? t : a;
	{
		let n = e.useRef(t !== void 0);
		e.useEffect(() => {
			let e = n.current;
			e !== c && console.warn(`${i} is changing from ${e ? "controlled" : "uncontrolled"} to ${c ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`), n.current = c;
		}, [c, i]);
	}
	return [l, e.useCallback((e) => {
		if (c) {
			let n = ye(e) ? e(t) : e;
			n !== t && s.current?.(n);
		} else o(e);
	}, [
		c,
		t,
		o,
		s
	])];
}
function ve({ defaultProp: t, onChange: n }) {
	let [r, i] = e.useState(t), a = e.useRef(r), o = e.useRef(n);
	return ge(() => {
		o.current = n;
	}, [n]), e.useEffect(() => {
		a.current !== r && (o.current?.(r), a.current = r);
	}, [r, a]), [
		r,
		i,
		o
	];
}
function ye(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/@radix-ui/react-presence/dist/index.mjs
function be(t, n) {
	return e.useReducer((e, t) => n[e][t] ?? e, t);
}
var xe = (t) => {
	let { present: n, children: r } = t, i = Se(n), a = typeof r == "function" ? r({ present: i.isPresent }) : e.Children.only(r), o = j(i.ref, we(a));
	return typeof r == "function" || i.isPresent ? e.cloneElement(a, { ref: o }) : null;
};
xe.displayName = "Presence";
function Se(t) {
	let [n, r] = e.useState(), i = e.useRef(null), a = e.useRef(t), o = e.useRef("none"), [s, c] = be(t ? "mounted" : "unmounted", {
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
	return e.useEffect(() => {
		let e = Ce(i.current);
		o.current = s === "mounted" ? e : "none";
	}, [s]), he(() => {
		let e = i.current, n = a.current;
		if (n !== t) {
			let r = o.current, i = Ce(e);
			t ? c("MOUNT") : i === "none" || e?.display === "none" ? c("UNMOUNT") : c(n && r !== i ? "ANIMATION_OUT" : "UNMOUNT"), a.current = t;
		}
	}, [t, c]), he(() => {
		if (n) {
			let e, t = n.ownerDocument.defaultView ?? window, r = (r) => {
				let o = Ce(i.current).includes(CSS.escape(r.animationName));
				if (r.target === n && o && (c("ANIMATION_END"), !a.current)) {
					let r = n.style.animationFillMode;
					n.style.animationFillMode = "forwards", e = t.setTimeout(() => {
						n.style.animationFillMode === "forwards" && (n.style.animationFillMode = r);
					});
				}
			}, s = (e) => {
				e.target === n && (o.current = Ce(i.current));
			};
			return n.addEventListener("animationstart", s), n.addEventListener("animationcancel", r), n.addEventListener("animationend", r), () => {
				t.clearTimeout(e), n.removeEventListener("animationstart", s), n.removeEventListener("animationcancel", r), n.removeEventListener("animationend", r);
			};
		} else c("ANIMATION_END");
	}, [n, c]), {
		isPresent: ["mounted", "unmountSuspended"].includes(s),
		ref: e.useCallback((e) => {
			i.current = e ? getComputedStyle(e) : null, r(e);
		}, [])
	};
}
function Ce(e) {
	return e?.animationName || "none";
}
function we(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-id/dist/index.mjs
var Te = e.useId || (() => void 0), Ee = 0;
function De(t) {
	let [n, r] = e.useState(Te());
	return he(() => {
		t || r((e) => e ?? String(Ee++));
	}, [t]), t || (n ? `radix-${n}` : "");
}
//#endregion
//#region node_modules/@radix-ui/react-direction/dist/index.mjs
var Oe = e.createContext(void 0);
function ke(t) {
	let n = e.useContext(Oe);
	return t || n || "ltr";
}
//#endregion
//#region node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
function Ae(t) {
	let n = e.useRef(t);
	return e.useEffect(() => {
		n.current = t;
	}), e.useMemo(() => (...e) => n.current?.(...e), []);
}
//#endregion
//#region node_modules/@radix-ui/react-use-escape-keydown/dist/index.mjs
function je(t, n = globalThis?.document) {
	let r = Ae(t);
	e.useEffect(() => {
		let e = (e) => {
			e.key === "Escape" && r(e);
		};
		return n.addEventListener("keydown", e, { capture: !0 }), () => n.removeEventListener("keydown", e, { capture: !0 });
	}, [r, n]);
}
//#endregion
//#region node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var Me = "DismissableLayer", Ne = "dismissableLayer.update", Pe = "dismissableLayer.pointerDownOutside", Fe = "dismissableLayer.focusOutside", Ie, Le = e.createContext({
	layers: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), Re = e.forwardRef((t, n) => {
	let { disableOutsidePointerEvents: r = !1, onEscapeKeyDown: i, onPointerDownOutside: a, onFocusOutside: o, onInteractOutside: s, onDismiss: c, ...l } = t, u = e.useContext(Le), [d, f] = e.useState(null), p = d?.ownerDocument ?? globalThis?.document, [, m] = e.useState({}), h = j(n, (e) => f(e)), g = Array.from(u.layers), [_] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1), v = g.indexOf(_), b = d ? g.indexOf(d) : -1, x = u.layersWithOutsidePointerEventsDisabled.size > 0, S = b >= v, C = Ve((e) => {
		let t = e.target, n = [...u.branches].some((e) => e.contains(t));
		!S || n || (a?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p), w = He((e) => {
		let t = e.target;
		[...u.branches].some((e) => e.contains(t)) || (o?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p);
	return je((e) => {
		b === u.layers.size - 1 && (i?.(e), !e.defaultPrevented && c && (e.preventDefault(), c()));
	}, p), e.useEffect(() => {
		if (d) return r && (u.layersWithOutsidePointerEventsDisabled.size === 0 && (Ie = p.body.style.pointerEvents, p.body.style.pointerEvents = "none"), u.layersWithOutsidePointerEventsDisabled.add(d)), u.layers.add(d), Ue(), () => {
			r && u.layersWithOutsidePointerEventsDisabled.size === 1 && (p.body.style.pointerEvents = Ie);
		};
	}, [
		d,
		p,
		r,
		u
	]), e.useEffect(() => () => {
		d && (u.layers.delete(d), u.layersWithOutsidePointerEventsDisabled.delete(d), Ue());
	}, [d, u]), e.useEffect(() => {
		let e = () => m({});
		return document.addEventListener(Ne, e), () => document.removeEventListener(Ne, e);
	}, []), /* @__PURE__ */ y(F.div, {
		...l,
		ref: h,
		style: {
			pointerEvents: x ? S ? "auto" : "none" : void 0,
			...t.style
		},
		onFocusCapture: L(t.onFocusCapture, w.onFocusCapture),
		onBlurCapture: L(t.onBlurCapture, w.onBlurCapture),
		onPointerDownCapture: L(t.onPointerDownCapture, C.onPointerDownCapture)
	});
});
Re.displayName = Me;
var ze = "DismissableLayerBranch", Be = e.forwardRef((t, n) => {
	let r = e.useContext(Le), i = e.useRef(null), a = j(n, i);
	return e.useEffect(() => {
		let e = i.current;
		if (e) return r.branches.add(e), () => {
			r.branches.delete(e);
		};
	}, [r.branches]), /* @__PURE__ */ y(F.div, {
		...t,
		ref: a
	});
});
Be.displayName = ze;
function Ve(t, n = globalThis?.document) {
	let r = Ae(t), i = e.useRef(!1), a = e.useRef(() => {});
	return e.useEffect(() => {
		let e = (e) => {
			if (e.target && !i.current) {
				let t = function() {
					We(Pe, r, i, { discrete: !0 });
				}, i = { originalEvent: e };
				e.pointerType === "touch" ? (n.removeEventListener("click", a.current), a.current = t, n.addEventListener("click", a.current, { once: !0 })) : t();
			} else n.removeEventListener("click", a.current);
			i.current = !1;
		}, t = window.setTimeout(() => {
			n.addEventListener("pointerdown", e);
		}, 0);
		return () => {
			window.clearTimeout(t), n.removeEventListener("pointerdown", e), n.removeEventListener("click", a.current);
		};
	}, [n, r]), { onPointerDownCapture: () => i.current = !0 };
}
function He(t, n = globalThis?.document) {
	let r = Ae(t), i = e.useRef(!1);
	return e.useEffect(() => {
		let e = (e) => {
			e.target && !i.current && We(Fe, r, { originalEvent: e }, { discrete: !1 });
		};
		return n.addEventListener("focusin", e), () => n.removeEventListener("focusin", e);
	}, [n, r]), {
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
	t && i.addEventListener(e, t, { once: !0 }), r ? re(i, a) : i.dispatchEvent(a);
}
//#endregion
//#region node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var Ge = "focusScope.autoFocusOnMount", Ke = "focusScope.autoFocusOnUnmount", qe = {
	bubbles: !1,
	cancelable: !0
}, Je = "FocusScope", Ye = e.forwardRef((t, n) => {
	let { loop: r = !1, trapped: i = !1, onMountAutoFocus: a, onUnmountAutoFocus: o, ...s } = t, [c, l] = e.useState(null), u = Ae(a), d = Ae(o), f = e.useRef(null), p = j(n, (e) => l(e)), m = e.useRef({
		paused: !1,
		pause() {
			this.paused = !0;
		},
		resume() {
			this.paused = !1;
		}
	}).current;
	e.useEffect(() => {
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
	]), e.useEffect(() => {
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
	let h = e.useCallback((e) => {
		if (!r && !i || m.paused) return;
		let t = e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey, n = document.activeElement;
		if (t && n) {
			let t = e.currentTarget, [i, a] = Ze(t);
			i && a ? !e.shiftKey && n === a ? (e.preventDefault(), r && nt(i, { select: !0 })) : e.shiftKey && n === i && (e.preventDefault(), r && nt(a, { select: !0 })) : n === t && e.preventDefault();
		}
	}, [
		r,
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
var st = "Portal", ct = e.forwardRef((t, n) => {
	let { container: r, ...i } = t, [a, o] = e.useState(!1);
	he(() => o(!0), []);
	let s = r || a && globalThis?.document?.body;
	return s ? _.createPortal(/* @__PURE__ */ y(F.div, {
		...i,
		ref: n
	}), s) : null;
});
ct.displayName = st;
//#endregion
//#region node_modules/@radix-ui/react-focus-guards/dist/index.mjs
var lt = 0;
function ut() {
	e.useEffect(() => {
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
	var n = u(function() {
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
var xt = typeof window < "u" ? e.useLayoutEffect : e.useEffect, St = /* @__PURE__ */ new WeakMap();
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
var Dt = function(t) {
	var n = t.sideCar, r = pt(t, ["sideCar"]);
	if (!n) throw Error("Sidecar: please provide `sideCar` property to import the right car");
	var i = n.read();
	if (!i) throw Error("Sidecar medium not found");
	return e.createElement(i, ft({}, r));
};
Dt.isSideCarExport = !0;
function Ot(e, t) {
	return e.useMedium(t), Dt;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/medium.js
var kt = Et(), At = function() {}, jt = e.forwardRef(function(t, n) {
	var r = e.useRef(null), i = e.useState({
		onScrollCapture: At,
		onWheelCapture: At,
		onTouchMoveCapture: At
	}), a = i[0], o = i[1], s = t.forwardProps, c = t.children, l = t.className, u = t.removeScrollBar, d = t.enabled, f = t.shards, p = t.sideCar, m = t.noRelative, h = t.noIsolation, g = t.inert, _ = t.allowPinchZoom, v = t.as, y = v === void 0 ? "div" : v, b = t.gapMode, x = pt(t, [
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
	]), S = p, C = Ct([r, n]), w = ft(ft({}, x), a);
	return e.createElement(e.Fragment, null, d && e.createElement(S, {
		sideCar: kt,
		removeScrollBar: u,
		shards: f,
		noRelative: m,
		noIsolation: h,
		inert: g,
		setCallbacks: o,
		allowPinchZoom: !!_,
		lockRef: r,
		gapMode: b
	}), s ? e.cloneElement(e.Children.only(c), ft(ft({}, w), { ref: C })) : e.createElement(y, ft({}, w, {
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
	var t = Lt();
	return function(n, r) {
		e.useEffect(function() {
			return t.add(n), function() {
				t.remove();
			};
		}, [n && r]);
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
	e.useEffect(function() {
		return document.body.setAttribute(Gt, (qt() + 1).toString()), function() {
			var e = qt() - 1;
			e <= 0 ? document.body.removeAttribute(Gt) : document.body.setAttribute(Gt, e.toString());
		};
	}, []);
}, Yt = function(t) {
	var n = t.noRelative, r = t.noImportant, i = t.gapMode, a = i === void 0 ? "margin" : i;
	Jt();
	var o = e.useMemo(function() {
		return Ut(a);
	}, [a]);
	return e.createElement(Wt, { styles: Kt(o, !n, a, r ? "" : "!important") });
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
function vn(t) {
	var n = e.useRef([]), r = e.useRef([0, 0]), i = e.useRef(), a = e.useState(gn++)[0], o = e.useState(zt)[0], s = e.useRef(t);
	e.useEffect(function() {
		s.current = t;
	}, [t]), e.useEffect(function() {
		if (t.inert) {
			document.body.classList.add(`block-interactivity-${a}`);
			var e = mt([t.lockRef.current], (t.shards || []).map(pn), !0).filter(Boolean);
			return e.forEach(function(e) {
				return e.classList.add(`allow-interactivity-${a}`);
			}), function() {
				document.body.classList.remove(`block-interactivity-${a}`), e.forEach(function(e) {
					return e.classList.remove(`allow-interactivity-${a}`);
				});
			};
		}
	}, [
		t.inert,
		t.lockRef.current,
		t.shards
	]);
	var c = e.useCallback(function(e, t) {
		if ("touches" in e && e.touches.length === 2 || e.type === "wheel" && e.ctrlKey) return !s.current.allowPinchZoom;
		var n = dn(e), a = r.current, o = "deltaX" in e ? e.deltaX : a[0] - n[0], c = "deltaY" in e ? e.deltaY : a[1] - n[1], l, u = e.target, d = Math.abs(o) > Math.abs(c) ? "h" : "v";
		if ("touches" in e && d === "h" && u.type === "range") return !1;
		var f = window.getSelection(), p = f && f.anchorNode;
		if (p && (p === u || p.contains(u))) return !1;
		var m = rn(d, u);
		if (!m) return !0;
		if (m ? l = d : (l = d === "v" ? "h" : "v", m = rn(d, u)), !m) return !1;
		if (!i.current && "changedTouches" in e && (o || c) && (i.current = l), !l) return !0;
		var h = i.current || l;
		return un(h, t, e, h === "h" ? o : c, !0);
	}, []), l = e.useCallback(function(e) {
		var t = e;
		if (!(!_n.length || _n[_n.length - 1] !== o)) {
			var r = "deltaY" in t ? fn(t) : dn(t), i = n.current.filter(function(e) {
				return e.name === t.type && (e.target === t.target || t.target === e.shadowParent) && mn(e.delta, r);
			})[0];
			if (i && i.should) {
				t.cancelable && t.preventDefault();
				return;
			}
			if (!i) {
				var a = (s.current.shards || []).map(pn).filter(Boolean).filter(function(e) {
					return e.contains(t.target);
				});
				(a.length > 0 ? c(t, a[0]) : !s.current.noIsolation) && t.cancelable && t.preventDefault();
			}
		}
	}, []), u = e.useCallback(function(e, t, r, i) {
		var a = {
			name: e,
			delta: t,
			target: r,
			should: i,
			shadowParent: yn(r)
		};
		n.current.push(a), setTimeout(function() {
			n.current = n.current.filter(function(e) {
				return e !== a;
			});
		}, 1);
	}, []), d = e.useCallback(function(e) {
		r.current = dn(e), i.current = void 0;
	}, []), f = e.useCallback(function(e) {
		u(e.type, fn(e), e.target, c(e, t.lockRef.current));
	}, []), p = e.useCallback(function(e) {
		u(e.type, dn(e), e.target, c(e, t.lockRef.current));
	}, []);
	e.useEffect(function() {
		return _n.push(o), t.setCallbacks({
			onScrollCapture: f,
			onWheelCapture: f,
			onTouchMoveCapture: p
		}), document.addEventListener("wheel", l, Qt), document.addEventListener("touchmove", l, Qt), document.addEventListener("touchstart", d, Qt), function() {
			_n = _n.filter(function(e) {
				return e !== o;
			}), document.removeEventListener("wheel", l, Qt), document.removeEventListener("touchmove", l, Qt), document.removeEventListener("touchstart", d, Qt);
		};
	}, []);
	var m = t.removeScrollBar, h = t.inert;
	return e.createElement(e.Fragment, null, h ? e.createElement(o, { styles: hn(a) }) : null, m ? e.createElement(Yt, {
		noRelative: t.noRelative,
		gapMode: t.gapMode
	}) : null);
}
function yn(e) {
	for (var t = null; e !== null;) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
	return t;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/sidecar.js
var bn = Ot(kt, vn), xn = e.forwardRef(function(t, n) {
	return e.createElement(jt, ft({}, t, {
		ref: n,
		sideCar: bn
	}));
});
xn.classNames = jt.classNames;
//#endregion
//#region src/lib/remove-scroll-gate.tsx
var Sn = e.createContext(!1);
function Cn({ allowBodyScroll: e, children: t }) {
	return /* @__PURE__ */ y(Sn.Provider, {
		value: e,
		children: t
	});
}
function wn() {
	return e.useContext(Sn);
}
//#endregion
//#region src/lib/react-remove-scroll-shim.tsx
var Tn = e.forwardRef(function(e, t) {
	let n = wn() ? !1 : e.enabled !== !1;
	return /* @__PURE__ */ y(xn, {
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
function Fn(t) {
	let n = e.useRef({
		value: t,
		previous: t
	});
	return e.useMemo(() => (n.current.value !== t && (n.current.previous = n.current.value, n.current.value = t), n.current.previous), [t]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function In(t) {
	let [n, r] = e.useState(void 0);
	return he(() => {
		if (t) {
			r({
				width: t.offsetWidth,
				height: t.offsetHeight
			});
			let e = new ResizeObserver((e) => {
				if (!Array.isArray(e) || !e.length) return;
				let n = e[0], i, a;
				if ("borderBoxSize" in n) {
					let e = n.borderBoxSize, t = Array.isArray(e) ? e[0] : e;
					i = t.inlineSize, a = t.blockSize;
				} else i = t.offsetWidth, a = t.offsetHeight;
				r({
					width: i,
					height: a
				});
			});
			return e.observe(t, { box: "border-box" }), () => e.unobserve(t);
		} else r(void 0);
	}, [t]), n;
}
//#endregion
//#region node_modules/@radix-ui/react-checkbox/dist/index.mjs
var Ln = "Checkbox", [Rn, zn] = oe(Ln), [Bn, Vn] = Rn(Ln);
function Hn(t) {
	let { __scopeCheckbox: n, checked: r, children: i, defaultChecked: a, disabled: o, form: s, name: c, onCheckedChange: l, required: u, value: d = "on", internal_do_not_use_render: f } = t, [p, m] = _e({
		prop: r,
		defaultProp: a ?? !1,
		onChange: l,
		caller: Ln
	}), [h, g] = e.useState(null), [_, v] = e.useState(null), b = e.useRef(!1), x = h ? !!s || !!h.closest("form") : !0, S = {
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
		defaultChecked: Zn(a) ? !1 : a,
		isFormControl: x,
		bubbleInput: _,
		setBubbleInput: v
	};
	return /* @__PURE__ */ y(Bn, {
		scope: n,
		...S,
		children: Xn(f) ? f(S) : i
	});
}
var Un = "CheckboxTrigger", Wn = e.forwardRef(({ __scopeCheckbox: t, onKeyDown: n, onClick: r, ...i }, a) => {
	let { control: o, value: s, disabled: c, checked: l, required: u, setControl: d, setChecked: f, hasConsumerStoppedPropagationRef: p, isFormControl: m, bubbleInput: h } = Vn(Un, t), g = j(a, d), _ = e.useRef(l);
	return e.useEffect(() => {
		let e = o?.form;
		if (e) {
			let t = () => f(_.current);
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [o, f]), /* @__PURE__ */ y(F.button, {
		type: "button",
		role: "checkbox",
		"aria-checked": Zn(l) ? "mixed" : l,
		"aria-required": u,
		"data-state": Qn(l),
		"data-disabled": c ? "" : void 0,
		disabled: c,
		value: s,
		...i,
		ref: g,
		onKeyDown: L(n, (e) => {
			e.key === "Enter" && e.preventDefault();
		}),
		onClick: L(r, (e) => {
			f((e) => Zn(e) ? !0 : !e), h && m && (p.current = e.isPropagationStopped(), p.current || e.stopPropagation());
		})
	});
});
Wn.displayName = Un;
var Gn = e.forwardRef((e, t) => {
	let { __scopeCheckbox: n, name: r, checked: i, defaultChecked: a, required: o, disabled: s, value: c, onCheckedChange: l, form: u, ...d } = e;
	return /* @__PURE__ */ y(Hn, {
		__scopeCheckbox: n,
		checked: i,
		defaultChecked: a,
		disabled: s,
		required: o,
		onCheckedChange: l,
		name: r,
		form: u,
		value: c,
		internal_do_not_use_render: ({ isFormControl: e }) => /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y(Wn, {
			...d,
			ref: t,
			__scopeCheckbox: n
		}), e && /* @__PURE__ */ y(Yn, { __scopeCheckbox: n })] })
	});
});
Gn.displayName = Ln;
var Kn = "CheckboxIndicator", qn = e.forwardRef((e, t) => {
	let { __scopeCheckbox: n, forceMount: r, ...i } = e, a = Vn(Kn, n);
	return /* @__PURE__ */ y(xe, {
		present: r || Zn(a.checked) || a.checked === !0,
		children: /* @__PURE__ */ y(F.span, {
			"data-state": Qn(a.checked),
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
qn.displayName = Kn;
var Jn = "CheckboxBubbleInput", Yn = e.forwardRef(({ __scopeCheckbox: t, ...n }, r) => {
	let { control: i, hasConsumerStoppedPropagationRef: a, checked: o, defaultChecked: s, required: c, disabled: l, name: u, value: d, form: f, bubbleInput: p, setBubbleInput: m } = Vn(Jn, t), h = j(r, m), g = Fn(o), _ = In(i);
	e.useEffect(() => {
		let e = p;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, n = Object.getOwnPropertyDescriptor(t, "checked").set, r = !a.current;
		if (g !== o && n) {
			let t = new Event("click", { bubbles: r });
			e.indeterminate = Zn(o), n.call(e, Zn(o) ? !1 : o), e.dispatchEvent(t);
		}
	}, [
		p,
		g,
		o,
		a
	]);
	let v = e.useRef(Zn(o) ? !1 : o);
	return /* @__PURE__ */ y(F.input, {
		type: "checkbox",
		"aria-hidden": !0,
		defaultChecked: s ?? v.current,
		required: c,
		disabled: l,
		name: u,
		value: d,
		form: f,
		...n,
		tabIndex: -1,
		ref: h,
		style: {
			...n.style,
			..._,
			position: "absolute",
			pointerEvents: "none",
			opacity: 0,
			margin: 0,
			transform: "translateX(-100%)"
		}
	});
});
Yn.displayName = Jn;
function Xn(e) {
	return typeof e == "function";
}
function Zn(e) {
	return e === "indeterminate";
}
function Qn(e) {
	return Zn(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
//#endregion
//#region node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var $n = [
	"top",
	"right",
	"bottom",
	"left"
], er = Math.min, tr = Math.max, nr = Math.round, rr = Math.floor, ir = (e) => ({
	x: e,
	y: e
}), ar = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function or(e, t, n) {
	return tr(e, er(t, n));
}
function sr(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function cr(e) {
	return e.split("-")[0];
}
function lr(e) {
	return e.split("-")[1];
}
function ur(e) {
	return e === "x" ? "y" : "x";
}
function dr(e) {
	return e === "y" ? "height" : "width";
}
function fr(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function pr(e) {
	return ur(fr(e));
}
function mr(e, t, n) {
	n === void 0 && (n = !1);
	let r = lr(e), i = pr(e), a = dr(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = Cr(o)), [o, Cr(o)];
}
function hr(e) {
	let t = Cr(e);
	return [
		gr(e),
		t,
		gr(t)
	];
}
function gr(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var _r = ["left", "right"], vr = ["right", "left"], yr = ["top", "bottom"], br = ["bottom", "top"];
function xr(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? vr : _r : t ? _r : vr;
		case "left":
		case "right": return t ? yr : br;
		default: return [];
	}
}
function Sr(e, t, n, r) {
	let i = lr(e), a = xr(cr(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(gr)))), a;
}
function Cr(e) {
	let t = cr(e);
	return ar[t] + e.slice(t.length);
}
function wr(e) {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...e
	};
}
function Tr(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : wr(e);
}
function Er(e) {
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
function Dr(e, t, n) {
	let { reference: r, floating: i } = e, a = fr(t), o = pr(t), s = dr(o), c = cr(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	switch (lr(t)) {
		case "start":
			p[o] -= f * (n && l ? -1 : 1);
			break;
		case "end":
			p[o] += f * (n && l ? -1 : 1);
			break;
	}
	return p;
}
async function Or(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = sr(t, e), p = Tr(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = Er(await i.getClippingRect({
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
	}, y = Er(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var kr = 50, Ar = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: Or
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = Dr(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < kr && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = Dr(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, jr = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = sr(e, t) || {};
		if (l == null) return {};
		let d = Tr(u), f = {
			x: n,
			y: r
		}, p = pr(i), m = dr(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = er(d[_], T), D = er(d[v], T), O = E, k = C - h[m] - D, A = C / 2 - h[m] / 2 + w, j = or(O, A, k), M = !c.arrow && lr(i) != null && A !== j && a.reference[m] / 2 - (A < O ? E : D) - h[m] / 2 < 0, ee = M ? A < O ? A - O : A - k : 0;
		return {
			[p]: f[p] + ee,
			data: {
				[p]: j,
				centerOffset: A - j - ee,
				...M && { alignmentOffset: ee }
			},
			reset: M
		};
	}
}), Mr = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = sr(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = cr(r), _ = fr(o), v = cr(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [Cr(o)] : hr(o)), x = p !== "none";
			!d && x && b.push(...Sr(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = mr(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (!(u === "alignment" && _ !== fr(t)) || T.every((e) => fr(e.placement) === _ ? e.overflows[0] > 0 : !0))) return {
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
								let t = fr(e.placement);
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
function Nr(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function Pr(e) {
	return $n.some((t) => e[t] >= 0);
}
var Fr = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = sr(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = Nr(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: Pr(e)
					} };
				}
				case "escaped": {
					let e = Nr(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: Pr(e)
					} };
				}
				default: return {};
			}
		}
	};
}, Ir = /* @__PURE__ */ new Set(["left", "top"]);
async function Lr(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = cr(n), s = lr(n), c = fr(n) === "y", l = Ir.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = sr(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var Rr = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await Lr(t, e);
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
}, zr = function(e) {
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
			} }, ...l } = sr(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = fr(cr(i)), p = ur(f), m = u[p], h = u[f];
			if (o) {
				let e = p === "y" ? "top" : "left", t = p === "y" ? "bottom" : "right", n = m + d[e], r = m - d[t];
				m = or(n, m, r);
			}
			if (s) {
				let e = f === "y" ? "top" : "left", t = f === "y" ? "bottom" : "right", n = h + d[e], r = h - d[t];
				h = or(n, h, r);
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
}, Br = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = sr(e, t), u = {
				x: n,
				y: r
			}, d = fr(i), f = ur(d), p = u[f], m = u[d], h = sr(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = Ir.has(cr(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, Vr = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			var n, r;
			let { placement: i, rects: a, platform: o, elements: s } = t, { apply: c = () => {}, ...l } = sr(e, t), u = await o.detectOverflow(t, l), d = cr(i), f = lr(i), p = fr(i) === "y", { width: m, height: h } = a.floating, g, _;
			d === "top" || d === "bottom" ? (g = d, _ = f === (await (o.isRTL == null ? void 0 : o.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (_ = d, g = f === "end" ? "top" : "bottom");
			let v = h - u.top - u.bottom, y = m - u.left - u.right, b = er(h - u[g], v), x = er(m - u[_], y), S = !t.middlewareData.shift, C = b, w = x;
			if ((n = t.middlewareData.shift) != null && n.enabled.x && (w = y), (r = t.middlewareData.shift) != null && r.enabled.y && (C = v), S && !f) {
				let e = tr(u.left, 0), t = tr(u.right, 0), n = tr(u.top, 0), r = tr(u.bottom, 0);
				p ? w = m - 2 * (e !== 0 || t !== 0 ? e + t : tr(u.left, u.right)) : C = h - 2 * (n !== 0 || r !== 0 ? n + r : tr(u.top, u.bottom));
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
function Hr() {
	return typeof window < "u";
}
function Ur(e) {
	return Kr(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Wr(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Gr(e) {
	return ((Kr(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function Kr(e) {
	return Hr() ? e instanceof Node || e instanceof Wr(e).Node : !1;
}
function qr(e) {
	return Hr() ? e instanceof Element || e instanceof Wr(e).Element : !1;
}
function Jr(e) {
	return Hr() ? e instanceof HTMLElement || e instanceof Wr(e).HTMLElement : !1;
}
function Yr(e) {
	return !Hr() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Wr(e).ShadowRoot;
}
function Xr(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = si(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function Zr(e) {
	return /^(table|td|th)$/.test(Ur(e));
}
function Qr(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var $r = /transform|translate|scale|rotate|perspective|filter/, ei = /paint|layout|strict|content/, ti = (e) => !!e && e !== "none", ni;
function ri(e) {
	let t = qr(e) ? si(e) : e;
	return ti(t.transform) || ti(t.translate) || ti(t.scale) || ti(t.rotate) || ti(t.perspective) || !ai() && (ti(t.backdropFilter) || ti(t.filter)) || $r.test(t.willChange || "") || ei.test(t.contain || "");
}
function ii(e) {
	let t = li(e);
	for (; Jr(t) && !oi(t);) {
		if (ri(t)) return t;
		if (Qr(t)) return null;
		t = li(t);
	}
	return null;
}
function ai() {
	return ni ?? (ni = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), ni;
}
function oi(e) {
	return /^(html|body|#document)$/.test(Ur(e));
}
function si(e) {
	return Wr(e).getComputedStyle(e);
}
function ci(e) {
	return qr(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function li(e) {
	if (Ur(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Yr(e) && e.host || Gr(e);
	return Yr(t) ? t.host : t;
}
function ui(e) {
	let t = li(e);
	return oi(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : Jr(t) && Xr(t) ? t : ui(t);
}
function di(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = ui(e), i = r === e.ownerDocument?.body, a = Wr(r);
	if (i) {
		let e = fi(a);
		return t.concat(a, a.visualViewport || [], Xr(r) ? r : [], e && n ? di(e) : []);
	} else return t.concat(r, di(r, [], n));
}
function fi(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function pi(e) {
	let t = si(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = Jr(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = nr(n) !== a || nr(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function mi(e) {
	return qr(e) ? e : e.contextElement;
}
function hi(e) {
	let t = mi(e);
	if (!Jr(t)) return ir(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = pi(t), o = (a ? nr(n.width) : n.width) / r, s = (a ? nr(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var gi = /* @__PURE__ */ ir(0);
function _i(e) {
	let t = Wr(e);
	return !ai() || !t.visualViewport ? gi : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function vi(e, t, n) {
	return t === void 0 && (t = !1), !n || t && n !== Wr(e) ? !1 : t;
}
function yi(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = mi(e), o = ir(1);
	t && (r ? qr(r) && (o = hi(r)) : o = hi(e));
	let s = vi(a, n, r) ? _i(a) : ir(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a) {
		let e = Wr(a), t = r && qr(r) ? Wr(r) : r, n = e, i = fi(n);
		for (; i && r && t !== n;) {
			let e = hi(i), t = i.getBoundingClientRect(), r = si(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = Wr(i), i = fi(n);
		}
	}
	return Er({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function bi(e, t) {
	let n = ci(e).scrollLeft;
	return t ? t.left + n : yi(Gr(e)).left + n;
}
function xi(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - bi(e, n),
		y: n.top + t.scrollTop
	};
}
function Si(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = Gr(r), s = t ? Qr(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = ir(1), u = ir(0), d = Jr(r);
	if ((d || !d && !a) && ((Ur(r) !== "body" || Xr(o)) && (c = ci(r)), d)) {
		let e = yi(r);
		l = hi(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? xi(o, c) : ir(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function Ci(e) {
	return Array.from(e.getClientRects());
}
function wi(e) {
	let t = Gr(e), n = ci(e), r = e.ownerDocument.body, i = tr(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), a = tr(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight), o = -n.scrollLeft + bi(e), s = -n.scrollTop;
	return si(r).direction === "rtl" && (o += tr(t.clientWidth, r.clientWidth) - i), {
		width: i,
		height: a,
		x: o,
		y: s
	};
}
var Ti = 25;
function Ei(e, t) {
	let n = Wr(e), r = Gr(e), i = n.visualViewport, a = r.clientWidth, o = r.clientHeight, s = 0, c = 0;
	if (i) {
		a = i.width, o = i.height;
		let e = ai();
		(!e || e && t === "fixed") && (s = i.offsetLeft, c = i.offsetTop);
	}
	let l = bi(r);
	if (l <= 0) {
		let e = r.ownerDocument, t = e.body, n = getComputedStyle(t), i = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, o = Math.abs(r.clientWidth - t.clientWidth - i);
		o <= Ti && (a -= o);
	} else l <= Ti && (a += l);
	return {
		width: a,
		height: o,
		x: s,
		y: c
	};
}
function Di(e, t) {
	let n = yi(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = Jr(e) ? hi(e) : ir(1);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function Oi(e, t, n) {
	let r;
	if (t === "viewport") r = Ei(e, n);
	else if (t === "document") r = wi(Gr(e));
	else if (qr(t)) r = Di(t, n);
	else {
		let n = _i(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return Er(r);
}
function ki(e, t) {
	let n = li(e);
	return n === t || !qr(n) || oi(n) ? !1 : si(n).position === "fixed" || ki(n, t);
}
function Ai(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = di(e, [], !1).filter((e) => qr(e) && Ur(e) !== "body"), i = null, a = si(e).position === "fixed", o = a ? li(e) : e;
	for (; qr(o) && !oi(o);) {
		let t = si(o), n = ri(o);
		!n && t.position === "fixed" && (i = null), (a ? !n && !i : !n && t.position === "static" && i && (i.position === "absolute" || i.position === "fixed") || Xr(o) && !n && ki(e, o)) ? r = r.filter((e) => e !== o) : i = t, o = li(o);
	}
	return t.set(e, r), r;
}
function ji(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? Qr(t) ? [] : Ai(t, this._c) : [].concat(n), r], o = Oi(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = Oi(t, a[e], i);
		s = tr(n.top, s), c = er(n.right, c), l = er(n.bottom, l), u = tr(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function Mi(e) {
	let { width: t, height: n } = pi(e);
	return {
		width: t,
		height: n
	};
}
function Ni(e, t, n) {
	let r = Jr(t), i = Gr(t), a = n === "fixed", o = yi(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = ir(0);
	function l() {
		c.x = bi(i);
	}
	if (r || !r && !a) if ((Ur(t) !== "body" || Xr(i)) && (s = ci(t)), r) {
		let e = yi(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	} else i && l();
	a && !r && i && l();
	let u = i && !r && !a ? xi(i, s) : ir(0);
	return {
		x: o.left + s.scrollLeft - c.x - u.x,
		y: o.top + s.scrollTop - c.y - u.y,
		width: o.width,
		height: o.height
	};
}
function Pi(e) {
	return si(e).position === "static";
}
function Fi(e, t) {
	if (!Jr(e) || si(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Gr(e) === n && (n = n.ownerDocument.body), n;
}
function Ii(e, t) {
	let n = Wr(e);
	if (Qr(e)) return n;
	if (!Jr(e)) {
		let t = li(e);
		for (; t && !oi(t);) {
			if (qr(t) && !Pi(t)) return t;
			t = li(t);
		}
		return n;
	}
	let r = Fi(e, t);
	for (; r && Zr(r) && Pi(r);) r = Fi(r, t);
	return r && oi(r) && Pi(r) && !ri(r) ? n : r || ii(e) || n;
}
var Li = async function(e) {
	let t = this.getOffsetParent || Ii, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: Ni(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function Ri(e) {
	return si(e).direction === "rtl";
}
var zi = {
	convertOffsetParentRelativeRectToViewportRelativeRect: Si,
	getDocumentElement: Gr,
	getClippingRect: ji,
	getOffsetParent: Ii,
	getElementRects: Li,
	getClientRects: Ci,
	getDimensions: Mi,
	getScale: hi,
	isElement: qr,
	isRTL: Ri
};
function Bi(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function Vi(e, t) {
	let n = null, r, i = Gr(e);
	function a() {
		var e;
		clearTimeout(r), (e = n) == null || e.disconnect(), n = null;
	}
	function o(s, c) {
		s === void 0 && (s = !1), c === void 0 && (c = 1), a();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (s || t(), !f || !p) return;
		let m = rr(d), h = rr(i.clientWidth - (u + f)), g = rr(i.clientHeight - (d + p)), _ = rr(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: tr(0, er(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (n !== c) {
				if (!y) return o();
				n ? o(!1, n) : r = setTimeout(() => {
					o(!1, 1e-7);
				}, 1e3);
			}
			n === 1 && !Bi(l, e.getBoundingClientRect()) && o(), y = !1;
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
function Hi(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = mi(e), u = i || a ? [...l ? di(l) : [], ...t ? di(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n, { passive: !0 }), a && e.addEventListener("resize", n);
	});
	let d = l && s ? Vi(l, n) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? yi(e) : null;
	c && g();
	function g() {
		let t = yi(e);
		h && !Bi(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var Ui = Rr, Wi = zr, Gi = Mr, Ki = Vr, qi = Fr, Ji = jr, Yi = Br, Xi = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = {
		platform: zi,
		...n
	}, a = {
		...i.platform,
		_c: r
	};
	return Ar(e, t, {
		...i,
		platform: a
	});
}, Zi = typeof document < "u" ? s : function() {};
function Qi(e, t) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (typeof e == "function" && e.toString() === t.toString()) return !0;
	let n, r, i;
	if (e && t && typeof e == "object") {
		if (Array.isArray(e)) {
			if (n = e.length, n !== t.length) return !1;
			for (r = n; r-- !== 0;) if (!Qi(e[r], t[r])) return !1;
			return !0;
		}
		if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length) return !1;
		for (r = n; r-- !== 0;) if (!{}.hasOwnProperty.call(t, i[r])) return !1;
		for (r = n; r-- !== 0;) {
			let n = i[r];
			if (!(n === "_owner" && e.$$typeof) && !Qi(e[n], t[n])) return !1;
		}
		return !0;
	}
	return e !== e && t !== t;
}
function $i(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function ea(e, t) {
	let n = $i(e);
	return Math.round(t * n) / n;
}
function ta(t) {
	let n = e.useRef(t);
	return Zi(() => {
		n.current = t;
	}), n;
}
function na(t) {
	t === void 0 && (t = {});
	let { placement: n = "bottom", strategy: r = "absolute", middleware: i = [], platform: a, elements: { reference: o, floating: s } = {}, transform: c = !0, whileElementsMounted: l, open: u } = t, [d, f] = e.useState({
		x: 0,
		y: 0,
		strategy: r,
		placement: n,
		middlewareData: {},
		isPositioned: !1
	}), [p, m] = e.useState(i);
	Qi(p, i) || m(i);
	let [h, _] = e.useState(null), [v, y] = e.useState(null), b = e.useCallback((e) => {
		e !== w.current && (w.current = e, _(e));
	}, []), x = e.useCallback((e) => {
		e !== T.current && (T.current = e, y(e));
	}, []), S = o || h, C = s || v, w = e.useRef(null), T = e.useRef(null), E = e.useRef(d), D = l != null, O = ta(l), k = ta(a), A = ta(u), j = e.useCallback(() => {
		if (!w.current || !T.current) return;
		let e = {
			placement: n,
			strategy: r,
			middleware: p
		};
		k.current && (e.platform = k.current), Xi(w.current, T.current, e).then((e) => {
			let t = {
				...e,
				isPositioned: A.current !== !1
			};
			M.current && !Qi(E.current, t) && (E.current = t, g.flushSync(() => {
				f(t);
			}));
		});
	}, [
		p,
		n,
		r,
		k,
		A
	]);
	Zi(() => {
		u === !1 && E.current.isPositioned && (E.current.isPositioned = !1, f((e) => ({
			...e,
			isPositioned: !1
		})));
	}, [u]);
	let M = e.useRef(!1);
	Zi(() => (M.current = !0, () => {
		M.current = !1;
	}), []), Zi(() => {
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
	let ee = e.useMemo(() => ({
		reference: w,
		floating: T,
		setReference: b,
		setFloating: x
	}), [b, x]), N = e.useMemo(() => ({
		reference: S,
		floating: C
	}), [S, C]), te = e.useMemo(() => {
		let e = {
			position: r,
			left: 0,
			top: 0
		};
		if (!N.floating) return e;
		let t = ea(N.floating, d.x), n = ea(N.floating, d.y);
		return c ? {
			...e,
			transform: "translate(" + t + "px, " + n + "px)",
			...$i(N.floating) >= 1.5 && { willChange: "transform" }
		} : {
			position: r,
			left: t,
			top: n
		};
	}, [
		r,
		c,
		N.floating,
		d.x,
		d.y
	]);
	return e.useMemo(() => ({
		...d,
		update: j,
		refs: ee,
		elements: N,
		floatingStyles: te
	}), [
		d,
		j,
		ee,
		N,
		te
	]);
}
var ra = (e) => {
	function t(e) {
		return {}.hasOwnProperty.call(e, "current");
	}
	return {
		name: "arrow",
		options: e,
		fn(n) {
			let { element: r, padding: i } = typeof e == "function" ? e(n) : e;
			return r && t(r) ? r.current == null ? {} : Ji({
				element: r.current,
				padding: i
			}).fn(n) : r ? Ji({
				element: r,
				padding: i
			}).fn(n) : {};
		}
	};
}, ia = (e, t) => {
	let n = Ui(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, aa = (e, t) => {
	let n = Wi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, oa = (e, t) => ({
	fn: Yi(e).fn,
	options: [e, t]
}), sa = (e, t) => {
	let n = Gi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, ca = (e, t) => {
	let n = Ki(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, la = (e, t) => {
	let n = qi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, ua = (e, t) => {
	let n = ra(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, da = "Arrow", fa = e.forwardRef((e, t) => {
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
fa.displayName = da;
var pa = fa, ma = "Popper", [ha, ga] = oe(ma), [_a, va] = ha(ma), ya = (t) => {
	let { __scopePopper: n, children: r } = t, [i, a] = e.useState(null);
	return /* @__PURE__ */ y(_a, {
		scope: n,
		anchor: i,
		onAnchorChange: a,
		children: r
	});
};
ya.displayName = ma;
var ba = "PopperAnchor", xa = e.forwardRef((t, n) => {
	let { __scopePopper: r, virtualRef: i, ...a } = t, o = va(ba, r), s = e.useRef(null), c = j(n, s), l = e.useRef(null);
	return e.useEffect(() => {
		let e = l.current;
		l.current = i?.current || s.current, e !== l.current && o.onAnchorChange(l.current);
	}), i ? null : /* @__PURE__ */ y(F.div, {
		...a,
		ref: c
	});
});
xa.displayName = ba;
var Sa = "PopperContent", [Ca, wa] = ha(Sa), Ta = e.forwardRef((t, n) => {
	let { __scopePopper: r, side: i = "bottom", sideOffset: a = 0, align: o = "center", alignOffset: s = 0, arrowPadding: c = 0, avoidCollisions: l = !0, collisionBoundary: u = [], collisionPadding: d = 0, sticky: f = "partial", hideWhenDetached: p = !1, updatePositionStrategy: m = "optimized", onPlaced: h, ...g } = t, _ = va(Sa, r), [v, b] = e.useState(null), x = j(n, (e) => b(e)), [S, C] = e.useState(null), w = In(S), T = w?.width ?? 0, E = w?.height ?? 0, D = i + (o === "center" ? "" : "-" + o), O = typeof d == "number" ? d : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...d
	}, k = Array.isArray(u) ? u : [u], A = k.length > 0, M = {
		padding: O,
		boundary: k.filter(ka),
		altBoundary: A
	}, { refs: ee, floatingStyles: N, placement: te, isPositioned: P, middlewareData: ne } = na({
		strategy: "fixed",
		placement: D,
		whileElementsMounted: (...e) => Hi(...e, { animationFrame: m === "always" }),
		elements: { reference: _.anchor },
		middleware: [
			ia({
				mainAxis: a + E,
				alignmentAxis: s
			}),
			l && aa({
				mainAxis: !0,
				crossAxis: !1,
				limiter: f === "partial" ? oa() : void 0,
				...M
			}),
			l && sa({ ...M }),
			ca({
				...M,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--radix-popper-available-width", `${n}px`), o.setProperty("--radix-popper-available-height", `${r}px`), o.setProperty("--radix-popper-anchor-width", `${i}px`), o.setProperty("--radix-popper-anchor-height", `${a}px`);
				}
			}),
			S && ua({
				element: S,
				padding: c
			}),
			Aa({
				arrowWidth: T,
				arrowHeight: E
			}),
			p && la({
				strategy: "referenceHidden",
				...M
			})
		]
	}), [re, ie] = ja(te), I = Ae(h);
	he(() => {
		P && I?.();
	}, [P, I]);
	let ae = ne.arrow?.x, oe = ne.arrow?.y, se = ne.arrow?.centerOffset !== 0, [ce, le] = e.useState();
	return he(() => {
		v && le(window.getComputedStyle(v).zIndex);
	}, [v]), /* @__PURE__ */ y("div", {
		ref: ee.setFloating,
		"data-radix-popper-content-wrapper": "",
		style: {
			...N,
			transform: P ? N.transform : "translate(0, -200%)",
			minWidth: "max-content",
			zIndex: ce,
			"--radix-popper-transform-origin": [ne.transformOrigin?.x, ne.transformOrigin?.y].join(" "),
			...ne.hide?.referenceHidden && {
				visibility: "hidden",
				pointerEvents: "none"
			}
		},
		dir: t.dir,
		children: /* @__PURE__ */ y(Ca, {
			scope: r,
			placedSide: re,
			onArrowChange: C,
			arrowX: ae,
			arrowY: oe,
			shouldHideArrow: se,
			children: /* @__PURE__ */ y(F.div, {
				"data-side": re,
				"data-align": ie,
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
Ta.displayName = Sa;
var Ea = "PopperArrow", Da = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
}, Oa = e.forwardRef(function(e, t) {
	let { __scopePopper: n, ...r } = e, i = wa(Ea, n), a = Da[i.placedSide];
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
		children: /* @__PURE__ */ y(pa, {
			...r,
			ref: t,
			style: {
				...r.style,
				display: "block"
			}
		})
	});
});
Oa.displayName = Ea;
function ka(e) {
	return e !== null;
}
var Aa = (e) => ({
	name: "transformOrigin",
	options: e,
	fn(t) {
		let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = ja(n), u = {
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
function ja(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
var Ma = ya, Na = xa, Pa = Ta, Fa = Oa, Ia = "rovingFocusGroup.onEntryFocus", La = {
	bubbles: !1,
	cancelable: !0
}, Ra = "RovingFocusGroup", [za, Ba, Va] = me(Ra), [Ha, Ua] = oe(Ra, [Va]), [Wa, Ga] = Ha(Ra), Ka = e.forwardRef((e, t) => /* @__PURE__ */ y(za.Provider, {
	scope: e.__scopeRovingFocusGroup,
	children: /* @__PURE__ */ y(za.Slot, {
		scope: e.__scopeRovingFocusGroup,
		children: /* @__PURE__ */ y(qa, {
			...e,
			ref: t
		})
	})
}));
Ka.displayName = Ra;
var qa = e.forwardRef((t, n) => {
	let { __scopeRovingFocusGroup: r, orientation: i, loop: a = !1, dir: o, currentTabStopId: s, defaultCurrentTabStopId: c, onCurrentTabStopIdChange: l, onEntryFocus: u, preventScrollOnEntryFocus: d = !1, ...f } = t, p = e.useRef(null), m = j(n, p), h = ke(o), [g, _] = _e({
		prop: s,
		defaultProp: c ?? null,
		onChange: l,
		caller: Ra
	}), [v, b] = e.useState(!1), x = Ae(u), S = Ba(r), C = e.useRef(!1), [w, T] = e.useState(0);
	return e.useEffect(() => {
		let e = p.current;
		if (e) return e.addEventListener(Ia, x), () => e.removeEventListener(Ia, x);
	}, [x]), /* @__PURE__ */ y(Wa, {
		scope: r,
		orientation: i,
		dir: h,
		loop: a,
		currentTabStopId: g,
		onItemFocus: e.useCallback((e) => _(e), [_]),
		onItemShiftTab: e.useCallback(() => b(!0), []),
		onFocusableItemAdd: e.useCallback(() => T((e) => e + 1), []),
		onFocusableItemRemove: e.useCallback(() => T((e) => e - 1), []),
		children: /* @__PURE__ */ y(F.div, {
			tabIndex: v || w === 0 ? -1 : 0,
			"data-orientation": i,
			...f,
			ref: m,
			style: {
				outline: "none",
				...t.style
			},
			onMouseDown: L(t.onMouseDown, () => {
				C.current = !0;
			}),
			onFocus: L(t.onFocus, (e) => {
				let t = !C.current;
				if (e.target === e.currentTarget && t && !v) {
					let t = new CustomEvent(Ia, La);
					if (e.currentTarget.dispatchEvent(t), !t.defaultPrevented) {
						let e = S().filter((e) => e.focusable);
						$a([
							e.find((e) => e.active),
							e.find((e) => e.id === g),
							...e
						].filter(Boolean).map((e) => e.ref.current), d);
					}
				}
				C.current = !1;
			}),
			onBlur: L(t.onBlur, () => b(!1))
		})
	});
}), Ja = "RovingFocusGroupItem", Ya = e.forwardRef((t, n) => {
	let { __scopeRovingFocusGroup: r, focusable: i = !0, active: a = !1, tabStopId: o, children: s, ...c } = t, l = De(), u = o || l, d = Ga(Ja, r), f = d.currentTabStopId === u, p = Ba(r), { onFocusableItemAdd: m, onFocusableItemRemove: h, currentTabStopId: g } = d;
	return e.useEffect(() => {
		if (i) return m(), () => h();
	}, [
		i,
		m,
		h
	]), /* @__PURE__ */ y(za.ItemSlot, {
		scope: r,
		id: u,
		focusable: i,
		active: a,
		children: /* @__PURE__ */ y(F.span, {
			tabIndex: f ? 0 : -1,
			"data-orientation": d.orientation,
			...c,
			ref: n,
			onMouseDown: L(t.onMouseDown, (e) => {
				i ? d.onItemFocus(u) : e.preventDefault();
			}),
			onFocus: L(t.onFocus, () => d.onItemFocus(u)),
			onKeyDown: L(t.onKeyDown, (e) => {
				if (e.key === "Tab" && e.shiftKey) {
					d.onItemShiftTab();
					return;
				}
				if (e.target !== e.currentTarget) return;
				let t = Qa(e, d.orientation, d.dir);
				if (t !== void 0) {
					if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
					e.preventDefault();
					let n = p().filter((e) => e.focusable).map((e) => e.ref.current);
					if (t === "last") n.reverse();
					else if (t === "prev" || t === "next") {
						t === "prev" && n.reverse();
						let r = n.indexOf(e.currentTarget);
						n = d.loop ? eo(n, r + 1) : n.slice(r + 1);
					}
					setTimeout(() => $a(n));
				}
			}),
			children: typeof s == "function" ? s({
				isCurrentTabStop: f,
				hasTabStop: g != null
			}) : s
		})
	});
});
Ya.displayName = Ja;
var Xa = {
	ArrowLeft: "prev",
	ArrowUp: "prev",
	ArrowRight: "next",
	ArrowDown: "next",
	PageUp: "first",
	Home: "first",
	PageDown: "last",
	End: "last"
};
function Za(e, t) {
	return t === "rtl" ? e === "ArrowLeft" ? "ArrowRight" : e === "ArrowRight" ? "ArrowLeft" : e : e;
}
function Qa(e, t, n) {
	let r = Za(e.key, n);
	if (!(t === "vertical" && ["ArrowLeft", "ArrowRight"].includes(r)) && !(t === "horizontal" && ["ArrowUp", "ArrowDown"].includes(r))) return Xa[r];
}
function $a(e, t = !1) {
	let n = document.activeElement;
	for (let r of e) if (r === n || (r.focus({ preventScroll: t }), document.activeElement !== n)) return;
}
function eo(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
var to = Ka, no = Ya, ro = "Label", io = e.forwardRef((e, t) => /* @__PURE__ */ y(F.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
io.displayName = ro;
var ao = io;
//#endregion
//#region node_modules/@radix-ui/number/dist/index.mjs
function oo(e, [t, n]) {
	return Math.min(n, Math.max(t, e));
}
//#endregion
//#region node_modules/@radix-ui/react-select/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function so(t) {
	let n = /* @__PURE__ */ co(t), r = e.forwardRef((t, r) => {
		let { children: i, ...a } = t, o = e.Children.toArray(i), s = o.find(uo);
		if (s) {
			let t = s.props.children, i = o.map((n) => n === s ? e.Children.count(t) > 1 ? e.Children.only(null) : e.isValidElement(t) ? t.props.children : null : n);
			return /* @__PURE__ */ y(n, {
				...a,
				ref: r,
				children: e.isValidElement(t) ? e.cloneElement(t, void 0, i) : null
			});
		}
		return /* @__PURE__ */ y(n, {
			...a,
			ref: r,
			children: i
		});
	});
	return r.displayName = `${t}.Slot`, r;
}
/* @__NO_SIDE_EFFECTS__ */
function co(t) {
	let n = e.forwardRef((t, n) => {
		let { children: r, ...i } = t;
		if (e.isValidElement(r)) {
			let t = po(r), a = fo(i, r.props);
			return r.type !== e.Fragment && (a.ref = n ? A(n, t) : t), e.cloneElement(r, a);
		}
		return e.Children.count(r) > 1 ? e.Children.only(null) : null;
	});
	return n.displayName = `${t}.SlotClone`, n;
}
var lo = Symbol("radix.slottable");
function uo(t) {
	return e.isValidElement(t) && typeof t.type == "function" && "__radixId" in t.type && t.type.__radixId === lo;
}
function fo(e, t) {
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
function po(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-select/dist/index.mjs
var mo = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], ho = [" ", "Enter"], go = "Select", [_o, vo, yo] = me(go), [bo, xo] = oe(go, [yo, ga]), So = ga(), [Co, wo] = bo(go), [To, Eo] = bo(go), Do = (t) => {
	let { __scopeSelect: n, children: r, open: i, defaultOpen: a, onOpenChange: o, value: s, defaultValue: c, onValueChange: l, dir: u, name: d, autoComplete: f, disabled: p, required: m, form: h } = t, g = So(n), [_, v] = e.useState(null), [x, S] = e.useState(null), [C, w] = e.useState(!1), T = ke(u), [E, D] = _e({
		prop: i,
		defaultProp: a ?? !1,
		onChange: o,
		caller: go
	}), [O, k] = _e({
		prop: s,
		defaultProp: c,
		onChange: l,
		caller: go
	}), A = e.useRef(null), j = _ ? h || !!_.closest("form") : !0, [M, ee] = e.useState(/* @__PURE__ */ new Set()), N = Array.from(M).map((e) => e.props.value).join(";");
	return /* @__PURE__ */ y(Ma, {
		...g,
		children: /* @__PURE__ */ b(Co, {
			required: m,
			scope: n,
			trigger: _,
			onTriggerChange: v,
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
			children: [/* @__PURE__ */ y(_o.Provider, {
				scope: n,
				children: /* @__PURE__ */ y(To, {
					scope: t.__scopeSelect,
					onNativeOptionAdd: e.useCallback((e) => {
						ee((t) => new Set(t).add(e));
					}, []),
					onNativeOptionRemove: e.useCallback((e) => {
						ee((t) => {
							let n = new Set(t);
							return n.delete(e), n;
						});
					}, []),
					children: r
				})
			}), j ? /* @__PURE__ */ b(Ss, {
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
			}, N) : null]
		})
	});
};
Do.displayName = go;
var Oo = "SelectTrigger", ko = e.forwardRef((t, n) => {
	let { __scopeSelect: r, disabled: i = !1, ...a } = t, o = So(r), s = wo(Oo, r), c = s.disabled || i, l = j(n, s.onTriggerChange), u = vo(r), d = e.useRef("touch"), [f, p, m] = ws((e) => {
		let t = u().filter((e) => !e.disabled), n = Ts(t, e, t.find((e) => e.value === s.value));
		n !== void 0 && s.onValueChange(n.value);
	}), h = (e) => {
		c || (s.onOpenChange(!0), m()), e && (s.triggerPointerDownPosRef.current = {
			x: Math.round(e.pageX),
			y: Math.round(e.pageY)
		});
	};
	return /* @__PURE__ */ y(Na, {
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
			"data-placeholder": Cs(s.value) ? "" : void 0,
			...a,
			ref: l,
			onClick: L(a.onClick, (e) => {
				e.currentTarget.focus(), d.current !== "mouse" && h(e);
			}),
			onPointerDown: L(a.onPointerDown, (e) => {
				d.current = e.pointerType;
				let t = e.target;
				t.hasPointerCapture(e.pointerId) && t.releasePointerCapture(e.pointerId), e.button === 0 && e.ctrlKey === !1 && e.pointerType === "mouse" && (h(e), e.preventDefault());
			}),
			onKeyDown: L(a.onKeyDown, (e) => {
				let t = f.current !== "";
				!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && p(e.key), !(t && e.key === " ") && mo.includes(e.key) && (h(), e.preventDefault());
			})
		})
	});
});
ko.displayName = Oo;
var Ao = "SelectValue", jo = e.forwardRef((e, t) => {
	let { __scopeSelect: n, className: r, style: i, children: a, placeholder: o = "", ...s } = e, c = wo(Ao, n), { onValueNodeHasChildrenChange: l } = c, u = a !== void 0, d = j(t, c.onValueNodeChange);
	return he(() => {
		l(u);
	}, [l, u]), /* @__PURE__ */ y(F.span, {
		...s,
		ref: d,
		style: { pointerEvents: "none" },
		children: Cs(c.value) ? /* @__PURE__ */ y(v, { children: o }) : a
	});
});
jo.displayName = Ao;
var Mo = "SelectIcon", No = e.forwardRef((e, t) => {
	let { __scopeSelect: n, children: r, ...i } = e;
	return /* @__PURE__ */ y(F.span, {
		"aria-hidden": !0,
		...i,
		ref: t,
		children: r || "▼"
	});
});
No.displayName = Mo;
var Po = "SelectPortal", Fo = (e) => /* @__PURE__ */ y(ct, {
	asChild: !0,
	...e
});
Fo.displayName = Po;
var Io = "SelectContent", Lo = e.forwardRef((t, n) => {
	let r = wo(Io, t.__scopeSelect), [i, a] = e.useState();
	if (he(() => {
		a(new DocumentFragment());
	}, []), !r.open) {
		let e = i;
		return e ? g.createPortal(/* @__PURE__ */ y(zo, {
			scope: t.__scopeSelect,
			children: /* @__PURE__ */ y(_o.Slot, {
				scope: t.__scopeSelect,
				children: /* @__PURE__ */ y("div", { children: t.children })
			})
		}), e) : null;
	}
	return /* @__PURE__ */ y(Uo, {
		...t,
		ref: n
	});
});
Lo.displayName = Io;
var Ro = 10, [zo, Bo] = bo(Io), Vo = "SelectContentImpl", Ho = /* @__PURE__ */ so("SelectContent.RemoveScroll"), Uo = e.forwardRef((t, n) => {
	let { __scopeSelect: r, position: i = "item-aligned", onCloseAutoFocus: a, onEscapeKeyDown: o, onPointerDownOutside: s, side: c, sideOffset: l, align: u, alignOffset: d, arrowPadding: f, collisionBoundary: p, collisionPadding: m, sticky: h, hideWhenDetached: g, avoidCollisions: _, ...v } = t, b = wo(Io, r), [x, S] = e.useState(null), [C, w] = e.useState(null), T = j(n, (e) => S(e)), [E, D] = e.useState(null), [O, k] = e.useState(null), A = vo(r), [M, ee] = e.useState(!1), N = e.useRef(!1);
	e.useEffect(() => {
		if (x) return Pn(x);
	}, [x]), ut();
	let te = e.useCallback((e) => {
		let [t, ...n] = A().map((e) => e.ref.current), [r] = n.slice(-1), i = document.activeElement;
		for (let n of e) if (n === i || (n?.scrollIntoView({ block: "nearest" }), n === t && C && (C.scrollTop = 0), n === r && C && (C.scrollTop = C.scrollHeight), n?.focus(), document.activeElement !== i)) return;
	}, [A, C]), P = e.useCallback(() => te([E, x]), [
		te,
		E,
		x
	]);
	e.useEffect(() => {
		M && P();
	}, [M, P]);
	let { onOpenChange: ne, triggerPointerDownPosRef: F } = b;
	e.useEffect(() => {
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
	]), e.useEffect(() => {
		let e = () => ne(!1);
		return window.addEventListener("blur", e), window.addEventListener("resize", e), () => {
			window.removeEventListener("blur", e), window.removeEventListener("resize", e);
		};
	}, [ne]);
	let [re, ie] = ws((e) => {
		let t = A().filter((e) => !e.disabled), n = Ts(t, e, t.find((e) => e.ref.current === document.activeElement));
		n && setTimeout(() => n.ref.current.focus());
	}), I = e.useCallback((e, t, n) => {
		let r = !N.current && !n;
		(b.value !== void 0 && b.value === t || r) && (D(e), r && (N.current = !0));
	}, [b.value]), ae = e.useCallback(() => x?.focus(), [x]), oe = e.useCallback((e, t, n) => {
		let r = !N.current && !n;
		(b.value !== void 0 && b.value === t || r) && k(e);
	}, [b.value]), se = i === "popper" ? qo : Go, ce = se === qo ? {
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
	return /* @__PURE__ */ y(zo, {
		scope: r,
		content: x,
		viewport: C,
		onViewportChange: w,
		itemRefCallback: I,
		selectedItem: E,
		onItemLeave: ae,
		itemTextRefCallback: oe,
		focusSelectedItem: P,
		selectedItemText: O,
		position: i,
		isPositioned: M,
		searchRef: re,
		children: /* @__PURE__ */ y(Tn, {
			as: Ho,
			allowPinchZoom: !0,
			children: /* @__PURE__ */ y(Ye, {
				asChild: !0,
				trapped: b.open,
				onMountAutoFocus: (e) => {
					e.preventDefault();
				},
				onUnmountAutoFocus: L(a, (e) => {
					b.trigger?.focus({ preventScroll: !0 }), e.preventDefault();
				}),
				children: /* @__PURE__ */ y(Re, {
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
						...ce,
						onPlaced: () => ee(!0),
						ref: T,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none",
							...v.style
						},
						onKeyDown: L(v.onKeyDown, (e) => {
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
Uo.displayName = Vo;
var Wo = "SelectItemAlignedPosition", Go = e.forwardRef((t, n) => {
	let { __scopeSelect: r, onPlaced: i, ...a } = t, o = wo(Io, r), s = Bo(Io, r), [c, l] = e.useState(null), [u, d] = e.useState(null), f = j(n, (e) => d(e)), p = vo(r), m = e.useRef(!1), h = e.useRef(!0), { viewport: g, selectedItem: _, selectedItemText: v, focusSelectedItem: b } = s, x = e.useCallback(() => {
		if (o.trigger && o.valueNode && c && u && g && _ && v) {
			let e = o.trigger.getBoundingClientRect(), t = u.getBoundingClientRect(), n = o.valueNode.getBoundingClientRect(), r = v.getBoundingClientRect();
			if (o.dir !== "rtl") {
				let i = r.left - t.left, a = n.left - i, o = e.left - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - Ro, d = oo(a, [Ro, Math.max(Ro, u - l)]);
				c.style.minWidth = s + "px", c.style.left = d + "px";
			} else {
				let i = t.right - r.right, a = window.innerWidth - n.right - i, o = window.innerWidth - e.right - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - Ro, d = oo(a, [Ro, Math.max(Ro, u - l)]);
				c.style.minWidth = s + "px", c.style.right = d + "px";
			}
			let a = p(), s = window.innerHeight - Ro * 2, l = g.scrollHeight, d = window.getComputedStyle(u), f = parseInt(d.borderTopWidth, 10), h = parseInt(d.paddingTop, 10), y = parseInt(d.borderBottomWidth, 10), b = parseInt(d.paddingBottom, 10), x = f + h + l + b + y, S = Math.min(_.offsetHeight * 5, x), C = window.getComputedStyle(g), w = parseInt(C.paddingTop, 10), T = parseInt(C.paddingBottom, 10), E = e.top + e.height / 2 - Ro, D = s - E, O = _.offsetHeight / 2, k = _.offsetTop + O, A = f + h + k, j = x - A;
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
			c.style.margin = `${Ro}px 0`, c.style.minHeight = S + "px", c.style.maxHeight = s + "px", i?.(), requestAnimationFrame(() => m.current = !0);
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
	he(() => x(), [x]);
	let [S, C] = e.useState();
	return he(() => {
		u && C(window.getComputedStyle(u).zIndex);
	}, [u]), /* @__PURE__ */ y(Jo, {
		scope: r,
		contentWrapper: c,
		shouldExpandOnScrollRef: m,
		onScrollButtonChange: e.useCallback((e) => {
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
Go.displayName = Wo;
var Ko = "SelectPopperPosition", qo = e.forwardRef((e, t) => {
	let { __scopeSelect: n, align: r = "start", collisionPadding: i = Ro, ...a } = e;
	return /* @__PURE__ */ y(Pa, {
		...So(n),
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
qo.displayName = Ko;
var [Jo, Yo] = bo(Io, {}), Xo = "SelectViewport", Zo = e.forwardRef((t, n) => {
	let { __scopeSelect: r, nonce: i, ...a } = t, o = Bo(Xo, r), s = Yo(Xo, r), c = j(n, o.onViewportChange), l = e.useRef(0);
	return /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y("style", {
		dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" },
		nonce: i
	}), /* @__PURE__ */ y(_o.Slot, {
		scope: r,
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
			onScroll: L(a.onScroll, (e) => {
				let t = e.currentTarget, { contentWrapper: n, shouldExpandOnScrollRef: r } = s;
				if (r?.current && n) {
					let e = Math.abs(l.current - t.scrollTop);
					if (e > 0) {
						let r = window.innerHeight - Ro * 2, i = parseFloat(n.style.minHeight), a = parseFloat(n.style.height), o = Math.max(i, a);
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
Zo.displayName = Xo;
var Qo = "SelectGroup", [$o, es] = bo(Qo), ts = e.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = De();
	return /* @__PURE__ */ y($o, {
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
ts.displayName = Qo;
var ns = "SelectLabel", rs = e.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = es(ns, n);
	return /* @__PURE__ */ y(F.div, {
		id: i.id,
		...r,
		ref: t
	});
});
rs.displayName = ns;
var is = "SelectItem", [as, os] = bo(is), ss = e.forwardRef((t, n) => {
	let { __scopeSelect: r, value: i, disabled: a = !1, textValue: o, ...s } = t, c = wo(is, r), l = Bo(is, r), u = c.value === i, [d, f] = e.useState(o ?? ""), [p, m] = e.useState(!1), h = j(n, (e) => l.itemRefCallback?.(e, i, a)), g = De(), _ = e.useRef("touch"), v = () => {
		a || (c.onValueChange(i), c.onOpenChange(!1));
	};
	if (i === "") throw Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
	return /* @__PURE__ */ y(as, {
		scope: r,
		value: i,
		disabled: a,
		textId: g,
		isSelected: u,
		onItemTextChange: e.useCallback((e) => {
			f((t) => t || (e?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ y(_o.ItemSlot, {
			scope: r,
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
				onFocus: L(s.onFocus, () => m(!0)),
				onBlur: L(s.onBlur, () => m(!1)),
				onClick: L(s.onClick, () => {
					_.current !== "mouse" && v();
				}),
				onPointerUp: L(s.onPointerUp, () => {
					_.current === "mouse" && v();
				}),
				onPointerDown: L(s.onPointerDown, (e) => {
					_.current = e.pointerType;
				}),
				onPointerMove: L(s.onPointerMove, (e) => {
					_.current = e.pointerType, a ? l.onItemLeave?.() : _.current === "mouse" && e.currentTarget.focus({ preventScroll: !0 });
				}),
				onPointerLeave: L(s.onPointerLeave, (e) => {
					e.currentTarget === document.activeElement && l.onItemLeave?.();
				}),
				onKeyDown: L(s.onKeyDown, (e) => {
					l.searchRef?.current !== "" && e.key === " " || (ho.includes(e.key) && v(), e.key === " " && e.preventDefault());
				})
			})
		})
	});
});
ss.displayName = is;
var cs = "SelectItemText", ls = e.forwardRef((t, n) => {
	let { __scopeSelect: r, className: i, style: a, ...o } = t, s = wo(cs, r), c = Bo(cs, r), l = os(cs, r), u = Eo(cs, r), [d, f] = e.useState(null), p = j(n, (e) => f(e), l.onItemTextChange, (e) => c.itemTextRefCallback?.(e, l.value, l.disabled)), m = d?.textContent, h = e.useMemo(() => /* @__PURE__ */ y("option", {
		value: l.value,
		disabled: l.disabled,
		children: m
	}, l.value), [
		l.disabled,
		l.value,
		m
	]), { onNativeOptionAdd: _, onNativeOptionRemove: x } = u;
	return he(() => (_(h), () => x(h)), [
		_,
		x,
		h
	]), /* @__PURE__ */ b(v, { children: [/* @__PURE__ */ y(F.span, {
		id: l.textId,
		...o,
		ref: p
	}), l.isSelected && s.valueNode && !s.valueNodeHasChildren ? g.createPortal(o.children, s.valueNode) : null] });
});
ls.displayName = cs;
var us = "SelectItemIndicator", ds = e.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return os(us, n).isSelected ? /* @__PURE__ */ y(F.span, {
		"aria-hidden": !0,
		...r,
		ref: t
	}) : null;
});
ds.displayName = us;
var fs = "SelectScrollUpButton", ps = e.forwardRef((t, n) => {
	let r = Bo(fs, t.__scopeSelect), i = Yo(fs, t.__scopeSelect), [a, o] = e.useState(!1), s = j(n, i.onScrollButtonChange);
	return he(() => {
		if (r.viewport && r.isPositioned) {
			let e = function() {
				o(t.scrollTop > 0);
			}, t = r.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [r.viewport, r.isPositioned]), a ? /* @__PURE__ */ y(gs, {
		...t,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = r;
			e && t && (e.scrollTop -= t.offsetHeight);
		}
	}) : null;
});
ps.displayName = fs;
var ms = "SelectScrollDownButton", hs = e.forwardRef((t, n) => {
	let r = Bo(ms, t.__scopeSelect), i = Yo(ms, t.__scopeSelect), [a, o] = e.useState(!1), s = j(n, i.onScrollButtonChange);
	return he(() => {
		if (r.viewport && r.isPositioned) {
			let e = function() {
				let e = t.scrollHeight - t.clientHeight;
				o(Math.ceil(t.scrollTop) < e);
			}, t = r.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [r.viewport, r.isPositioned]), a ? /* @__PURE__ */ y(gs, {
		...t,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = r;
			e && t && (e.scrollTop += t.offsetHeight);
		}
	}) : null;
});
hs.displayName = ms;
var gs = e.forwardRef((t, n) => {
	let { __scopeSelect: r, onAutoScroll: i, ...a } = t, o = Bo("SelectScrollButton", r), s = e.useRef(null), c = vo(r), l = e.useCallback(() => {
		s.current !== null && (window.clearInterval(s.current), s.current = null);
	}, []);
	return e.useEffect(() => () => l(), [l]), he(() => {
		c().find((e) => e.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
	}, [c]), /* @__PURE__ */ y(F.div, {
		"aria-hidden": !0,
		...a,
		ref: n,
		style: {
			flexShrink: 0,
			...a.style
		},
		onPointerDown: L(a.onPointerDown, () => {
			s.current === null && (s.current = window.setInterval(i, 50));
		}),
		onPointerMove: L(a.onPointerMove, () => {
			o.onItemLeave?.(), s.current === null && (s.current = window.setInterval(i, 50));
		}),
		onPointerLeave: L(a.onPointerLeave, () => {
			l();
		})
	});
}), _s = "SelectSeparator", vs = e.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return /* @__PURE__ */ y(F.div, {
		"aria-hidden": !0,
		...r,
		ref: t
	});
});
vs.displayName = _s;
var ys = "SelectArrow", bs = e.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = So(n), a = wo(ys, n), o = Bo(ys, n);
	return a.open && o.position === "popper" ? /* @__PURE__ */ y(Fa, {
		...i,
		...r,
		ref: t
	}) : null;
});
bs.displayName = ys;
var xs = "SelectBubbleInput", Ss = e.forwardRef(({ __scopeSelect: t, value: n, ...r }, i) => {
	let a = e.useRef(null), o = j(i, a), s = Fn(n);
	return e.useEffect(() => {
		let e = a.current;
		if (!e) return;
		let t = window.HTMLSelectElement.prototype, r = Object.getOwnPropertyDescriptor(t, "value").set;
		if (s !== n && r) {
			let t = new Event("change", { bubbles: !0 });
			r.call(e, n), e.dispatchEvent(t);
		}
	}, [s, n]), /* @__PURE__ */ y(F.select, {
		...r,
		style: {
			...ie,
			...r.style
		},
		ref: o,
		defaultValue: n
	});
});
Ss.displayName = xs;
function Cs(e) {
	return e === "" || e === void 0;
}
function ws(t) {
	let n = Ae(t), r = e.useRef(""), i = e.useRef(0), a = e.useCallback((e) => {
		let t = r.current + e;
		n(t), (function e(t) {
			r.current = t, window.clearTimeout(i.current), t !== "" && (i.current = window.setTimeout(() => e(""), 1e3));
		})(t);
	}, [n]), o = e.useCallback(() => {
		r.current = "", window.clearTimeout(i.current);
	}, []);
	return e.useEffect(() => () => window.clearTimeout(i.current), []), [
		r,
		a,
		o
	];
}
function Ts(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = Es(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.textValue.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
function Es(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
var Ds = Do, Os = ko, ks = jo, As = No, js = Fo, Ms = Lo, Ns = Zo, Ps = ss, Fs = ls, Is = ds, Ls = ps, Rs = hs;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function zs(t) {
	let n = /* @__PURE__ */ Vs(t), r = e.forwardRef((t, r) => {
		let { children: i, ...a } = t, o = e.Children.toArray(i), s = o.find(Us);
		if (s) {
			let t = s.props.children, i = o.map((n) => n === s ? e.Children.count(t) > 1 ? e.Children.only(null) : e.isValidElement(t) ? t.props.children : null : n);
			return /* @__PURE__ */ y(n, {
				...a,
				ref: r,
				children: e.isValidElement(t) ? e.cloneElement(t, void 0, i) : null
			});
		}
		return /* @__PURE__ */ y(n, {
			...a,
			ref: r,
			children: i
		});
	});
	return r.displayName = `${t}.Slot`, r;
}
var Bs = /* @__PURE__ */ zs("Slot");
/* @__NO_SIDE_EFFECTS__ */
function Vs(t) {
	let n = e.forwardRef((t, n) => {
		let { children: r, ...i } = t;
		if (e.isValidElement(r)) {
			let t = Gs(r), a = Ws(i, r.props);
			return r.type !== e.Fragment && (a.ref = n ? A(n, t) : t), e.cloneElement(r, a);
		}
		return e.Children.count(r) > 1 ? e.Children.only(null) : null;
	});
	return n.displayName = `${t}.SlotClone`, n;
}
var Hs = Symbol("radix.slottable");
function Us(t) {
	return e.isValidElement(t) && typeof t.type == "function" && "__radixId" in t.type && t.type.__radixId === Hs;
}
function Ws(e, t) {
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
function Gs(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-switch/dist/index.mjs
var Ks = "Switch", [qs, Js] = oe(Ks), [Ys, Xs] = qs(Ks), Zs = e.forwardRef((t, n) => {
	let { __scopeSwitch: r, name: i, checked: a, defaultChecked: o, required: s, disabled: c, value: l = "on", onCheckedChange: u, form: d, ...f } = t, [p, m] = e.useState(null), h = j(n, (e) => m(e)), g = e.useRef(!1), _ = p ? d || !!p.closest("form") : !0, [v, x] = _e({
		prop: a,
		defaultProp: o ?? !1,
		onChange: u,
		caller: Ks
	});
	return /* @__PURE__ */ b(Ys, {
		scope: r,
		checked: v,
		disabled: c,
		children: [/* @__PURE__ */ y(F.button, {
			type: "button",
			role: "switch",
			"aria-checked": v,
			"aria-required": s,
			"data-state": nc(v),
			"data-disabled": c ? "" : void 0,
			disabled: c,
			value: l,
			...f,
			ref: h,
			onClick: L(t.onClick, (e) => {
				x((e) => !e), _ && (g.current = e.isPropagationStopped(), g.current || e.stopPropagation());
			})
		}), _ && /* @__PURE__ */ y(tc, {
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
Zs.displayName = Ks;
var Qs = "SwitchThumb", $s = e.forwardRef((e, t) => {
	let { __scopeSwitch: n, ...r } = e, i = Xs(Qs, n);
	return /* @__PURE__ */ y(F.span, {
		"data-state": nc(i.checked),
		"data-disabled": i.disabled ? "" : void 0,
		...r,
		ref: t
	});
});
$s.displayName = Qs;
var ec = "SwitchBubbleInput", tc = e.forwardRef(({ __scopeSwitch: t, control: n, checked: r, bubbles: i = !0, ...a }, o) => {
	let s = e.useRef(null), c = j(s, o), l = Fn(r), u = In(n);
	return e.useEffect(() => {
		let e = s.current;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, n = Object.getOwnPropertyDescriptor(t, "checked").set;
		if (l !== r && n) {
			let t = new Event("click", { bubbles: i });
			n.call(e, r), e.dispatchEvent(t);
		}
	}, [
		l,
		r,
		i
	]), /* @__PURE__ */ y("input", {
		type: "checkbox",
		"aria-hidden": !0,
		defaultChecked: r,
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
tc.displayName = ec;
function nc(e) {
	return e ? "checked" : "unchecked";
}
var rc = Zs, ic = $s, ac = "Tabs", [oc, sc] = oe(ac, [Ua]), cc = Ua(), [lc, uc] = oc(ac), dc = e.forwardRef((e, t) => {
	let { __scopeTabs: n, value: r, onValueChange: i, defaultValue: a, orientation: o = "horizontal", dir: s, activationMode: c = "automatic", ...l } = e, u = ke(s), [d, f] = _e({
		prop: r,
		onChange: i,
		defaultProp: a ?? "",
		caller: ac
	});
	return /* @__PURE__ */ y(lc, {
		scope: n,
		baseId: De(),
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
dc.displayName = ac;
var fc = "TabsList", pc = e.forwardRef((e, t) => {
	let { __scopeTabs: n, loop: r = !0, ...i } = e, a = uc(fc, n);
	return /* @__PURE__ */ y(to, {
		asChild: !0,
		...cc(n),
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
pc.displayName = fc;
var mc = "TabsTrigger", hc = e.forwardRef((e, t) => {
	let { __scopeTabs: n, value: r, disabled: i = !1, ...a } = e, o = uc(mc, n), s = cc(n), c = vc(o.baseId, r), l = yc(o.baseId, r), u = r === o.value;
	return /* @__PURE__ */ y(no, {
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
			onMouseDown: L(e.onMouseDown, (e) => {
				!i && e.button === 0 && e.ctrlKey === !1 ? o.onValueChange(r) : e.preventDefault();
			}),
			onKeyDown: L(e.onKeyDown, (e) => {
				[" ", "Enter"].includes(e.key) && o.onValueChange(r);
			}),
			onFocus: L(e.onFocus, () => {
				let e = o.activationMode !== "manual";
				!u && !i && e && o.onValueChange(r);
			})
		})
	});
});
hc.displayName = mc;
var gc = "TabsContent", _c = e.forwardRef((t, n) => {
	let { __scopeTabs: r, value: i, forceMount: a, children: o, ...s } = t, c = uc(gc, r), l = vc(c.baseId, i), u = yc(c.baseId, i), d = i === c.value, f = e.useRef(d);
	return e.useEffect(() => {
		let e = requestAnimationFrame(() => f.current = !1);
		return () => cancelAnimationFrame(e);
	}, []), /* @__PURE__ */ y(xe, {
		present: a || d,
		children: ({ present: e }) => /* @__PURE__ */ y(F.div, {
			"data-state": d ? "active" : "inactive",
			"data-orientation": c.orientation,
			role: "tabpanel",
			"aria-labelledby": l,
			hidden: !e,
			id: u,
			tabIndex: 0,
			...s,
			ref: n,
			style: {
				...t.style,
				animationDuration: f.current ? "0s" : void 0
			},
			children: e && o
		})
	});
});
_c.displayName = gc;
function vc(e, t) {
	return `${e}-trigger-${t}`;
}
function yc(e, t) {
	return `${e}-content-${t}`;
}
var bc = dc, xc = pc, Sc = hc, Cc = _c, wc = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, Tc = (e, t) => ({
	classGroupId: e,
	validator: t
}), Ec = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), Dc = "-", Oc = [], kc = "arbitrary..", Ac = (e) => {
	let t = Nc(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return Mc(e);
			let n = e.split(Dc);
			return jc(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? wc(i, t) : t : i || Oc;
			}
			return n[e] || Oc;
		}
	};
}, jc = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = jc(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(Dc) : e.slice(t).join(Dc), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, Mc = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? kc + r : void 0;
})(), Nc = (e) => {
	let { theme: t, classGroups: n } = e;
	return Pc(n, t);
}, Pc = (e, t) => {
	let n = Ec();
	for (let r in e) {
		let i = e[r];
		Fc(i, n, r, t);
	}
	return n;
}, Fc = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		Ic(i, t, n, r);
	}
}, Ic = (e, t, n, r) => {
	if (typeof e == "string") {
		Lc(e, t, n);
		return;
	}
	if (typeof e == "function") {
		Rc(e, t, n, r);
		return;
	}
	zc(e, t, n, r);
}, Lc = (e, t, n) => {
	let r = e === "" ? t : Bc(t, e);
	r.classGroupId = n;
}, Rc = (e, t, n, r) => {
	if (Vc(e)) {
		Fc(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(Tc(n, e));
}, zc = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		Fc(o, Bc(t, a), n, r);
	}
}, Bc = (e, t) => {
	let n = e, r = t.split(Dc), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = Ec(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, Vc = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Hc = (e) => {
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
}, Uc = "!", Wc = ":", Gc = [], Kc = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), qc = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === Wc) {
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
		s.endsWith(Uc) ? (c = s.slice(0, -1), l = !0) : s.startsWith(Uc) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return Kc(t, l, c, u);
	};
	if (t) {
		let e = t + Wc, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : Kc(Gc, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, Jc = (e) => {
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
}, Yc = (e) => ({
	cache: Hc(e.cacheSize),
	parseClassName: qc(e),
	sortModifiers: Jc(e),
	...Ac(e)
}), Xc = /\s+/, Zc = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(Xc), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + Uc : g, v = _ + h;
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
}, Qc = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = $c(n)) && (i && (i += " "), i += r);
	return i;
}, $c = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = $c(e[r])) && (n && (n += " "), n += t);
	return n;
}, el = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = Yc(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = Zc(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(Qc(...e));
}, tl = [], nl = (e) => {
	let t = (t) => t[e] || tl;
	return t.isThemeGetter = !0, t;
}, rl = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, il = /^\((?:(\w[\w-]*):)?(.+)\)$/i, al = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, ol = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, sl = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, cl = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, ll = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, ul = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, dl = (e) => al.test(e), R = (e) => !!e && !Number.isNaN(Number(e)), fl = (e) => !!e && Number.isInteger(Number(e)), pl = (e) => e.endsWith("%") && R(e.slice(0, -1)), ml = (e) => ol.test(e), hl = () => !0, gl = (e) => sl.test(e) && !cl.test(e), _l = () => !1, vl = (e) => ll.test(e), yl = (e) => ul.test(e), bl = (e) => !z(e) && !B(e), xl = (e) => Il(e, Bl, _l), z = (e) => rl.test(e), Sl = (e) => Il(e, Vl, gl), Cl = (e) => Il(e, Hl, R), wl = (e) => Il(e, Wl, hl), Tl = (e) => Il(e, Ul, _l), El = (e) => Il(e, Rl, _l), Dl = (e) => Il(e, zl, yl), Ol = (e) => Il(e, Gl, vl), B = (e) => il.test(e), kl = (e) => Ll(e, Vl), Al = (e) => Ll(e, Ul), jl = (e) => Ll(e, Rl), Ml = (e) => Ll(e, Bl), Nl = (e) => Ll(e, zl), Pl = (e) => Ll(e, Gl, !0), Fl = (e) => Ll(e, Wl, !0), Il = (e, t, n) => {
	let r = rl.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, Ll = (e, t, n = !1) => {
	let r = il.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, Rl = (e) => e === "position" || e === "percentage", zl = (e) => e === "image" || e === "url", Bl = (e) => e === "length" || e === "size" || e === "bg-size", Vl = (e) => e === "length", Hl = (e) => e === "number", Ul = (e) => e === "family-name", Wl = (e) => e === "number" || e === "weight", Gl = (e) => e === "shadow", Kl = /* @__PURE__ */ el(() => {
	let e = nl("color"), t = nl("font"), n = nl("text"), r = nl("font-weight"), i = nl("tracking"), a = nl("leading"), o = nl("breakpoint"), s = nl("container"), c = nl("spacing"), l = nl("radius"), u = nl("shadow"), d = nl("inset-shadow"), f = nl("text-shadow"), p = nl("drop-shadow"), m = nl("blur"), h = nl("perspective"), g = nl("aspect"), _ = nl("ease"), v = nl("animate"), y = () => [
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
		B,
		z
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
		B,
		z,
		c
	], T = () => [
		dl,
		"full",
		"auto",
		...w()
	], E = () => [
		fl,
		"none",
		"subgrid",
		B,
		z
	], D = () => [
		"auto",
		{ span: [
			"full",
			fl,
			B,
			z
		] },
		fl,
		B,
		z
	], O = () => [
		fl,
		"auto",
		B,
		z
	], k = () => [
		"auto",
		"min",
		"max",
		"fr",
		B,
		z
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
	], M = () => ["auto", ...w()], ee = () => [
		dl,
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
		dl,
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
		dl,
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
		B,
		z
	], ne = () => [
		...b(),
		jl,
		El,
		{ position: [B, z] }
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
		Ml,
		xl,
		{ size: [B, z] }
	], ie = () => [
		pl,
		kl,
		Sl
	], I = () => [
		"",
		"none",
		"full",
		l,
		B,
		z
	], ae = () => [
		"",
		R,
		kl,
		Sl
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
	], ce = () => [
		R,
		pl,
		jl,
		El
	], le = () => [
		"",
		"none",
		m,
		B,
		z
	], ue = () => [
		"none",
		R,
		B,
		z
	], de = () => [
		"none",
		R,
		B,
		z
	], fe = () => [
		R,
		B,
		z
	], pe = () => [
		dl,
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
			blur: [ml],
			breakpoint: [ml],
			color: [hl],
			container: [ml],
			"drop-shadow": [ml],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [bl],
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
			"inset-shadow": [ml],
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
			radius: [ml],
			shadow: [ml],
			spacing: ["px", R],
			text: [ml],
			"text-shadow": [ml],
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
				dl,
				z,
				B,
				g
			] }],
			container: ["container"],
			columns: [{ columns: [
				R,
				z,
				B,
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
				fl,
				"auto",
				B,
				z
			] }],
			basis: [{ basis: [
				dl,
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
				R,
				dl,
				"auto",
				"initial",
				"none",
				z
			] }],
			grow: [{ grow: [
				"",
				R,
				B,
				z
			] }],
			shrink: [{ shrink: [
				"",
				R,
				B,
				z
			] }],
			order: [{ order: [
				fl,
				"first",
				"last",
				"none",
				B,
				z
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
			size: [{ size: ee() }],
			"inline-size": [{ inline: ["auto", ...N()] }],
			"min-inline-size": [{ "min-inline": ["auto", ...N()] }],
			"max-inline-size": [{ "max-inline": ["none", ...N()] }],
			"block-size": [{ block: ["auto", ...te()] }],
			"min-block-size": [{ "min-block": ["auto", ...te()] }],
			"max-block-size": [{ "max-block": ["none", ...te()] }],
			w: [{ w: [
				s,
				"screen",
				...ee()
			] }],
			"min-w": [{ "min-w": [
				s,
				"screen",
				"none",
				...ee()
			] }],
			"max-w": [{ "max-w": [
				s,
				"screen",
				"none",
				"prose",
				{ screen: [o] },
				...ee()
			] }],
			h: [{ h: [
				"screen",
				"lh",
				...ee()
			] }],
			"min-h": [{ "min-h": [
				"screen",
				"lh",
				"none",
				...ee()
			] }],
			"max-h": [{ "max-h": [
				"screen",
				"lh",
				...ee()
			] }],
			"font-size": [{ text: [
				"base",
				n,
				kl,
				Sl
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				Fl,
				wl
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
				pl,
				z
			] }],
			"font-family": [{ font: [
				Al,
				Tl,
				t
			] }],
			"font-features": [{ "font-features": [z] }],
			"fvn-normal": ["normal-nums"],
			"fvn-ordinal": ["ordinal"],
			"fvn-slashed-zero": ["slashed-zero"],
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			tracking: [{ tracking: [
				i,
				B,
				z
			] }],
			"line-clamp": [{ "line-clamp": [
				R,
				"none",
				B,
				Cl
			] }],
			leading: [{ leading: [a, ...w()] }],
			"list-image": [{ "list-image": [
				"none",
				B,
				z
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				B,
				z
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
				R,
				"from-font",
				"auto",
				B,
				Sl
			] }],
			"text-decoration-color": [{ decoration: P() }],
			"underline-offset": [{ "underline-offset": [
				R,
				"auto",
				B,
				z
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
				B,
				z
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
				B,
				z
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
						fl,
						B,
						z
					],
					radial: [
						"",
						B,
						z
					],
					conic: [
						fl,
						B,
						z
					]
				},
				Nl,
				Dl
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
			"border-w": [{ border: ae() }],
			"border-w-x": [{ "border-x": ae() }],
			"border-w-y": [{ "border-y": ae() }],
			"border-w-s": [{ "border-s": ae() }],
			"border-w-e": [{ "border-e": ae() }],
			"border-w-bs": [{ "border-bs": ae() }],
			"border-w-be": [{ "border-be": ae() }],
			"border-w-t": [{ "border-t": ae() }],
			"border-w-r": [{ "border-r": ae() }],
			"border-w-b": [{ "border-b": ae() }],
			"border-w-l": [{ "border-l": ae() }],
			"divide-x": [{ "divide-x": ae() }],
			"divide-x-reverse": ["divide-x-reverse"],
			"divide-y": [{ "divide-y": ae() }],
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
				R,
				B,
				z
			] }],
			"outline-w": [{ outline: [
				"",
				R,
				kl,
				Sl
			] }],
			"outline-color": [{ outline: P() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				Pl,
				Ol
			] }],
			"shadow-color": [{ shadow: P() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				Pl,
				Ol
			] }],
			"inset-shadow-color": [{ "inset-shadow": P() }],
			"ring-w": [{ ring: ae() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: P() }],
			"ring-offset-w": [{ "ring-offset": [R, Sl] }],
			"ring-offset-color": [{ "ring-offset": P() }],
			"inset-ring-w": [{ "inset-ring": ae() }],
			"inset-ring-color": [{ "inset-ring": P() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				Pl,
				Ol
			] }],
			"text-shadow-color": [{ "text-shadow": P() }],
			opacity: [{ opacity: [
				R,
				B,
				z
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
			"mask-image-linear-pos": [{ "mask-linear": [R] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": ce() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": ce() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": P() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": P() }],
			"mask-image-t-from-pos": [{ "mask-t-from": ce() }],
			"mask-image-t-to-pos": [{ "mask-t-to": ce() }],
			"mask-image-t-from-color": [{ "mask-t-from": P() }],
			"mask-image-t-to-color": [{ "mask-t-to": P() }],
			"mask-image-r-from-pos": [{ "mask-r-from": ce() }],
			"mask-image-r-to-pos": [{ "mask-r-to": ce() }],
			"mask-image-r-from-color": [{ "mask-r-from": P() }],
			"mask-image-r-to-color": [{ "mask-r-to": P() }],
			"mask-image-b-from-pos": [{ "mask-b-from": ce() }],
			"mask-image-b-to-pos": [{ "mask-b-to": ce() }],
			"mask-image-b-from-color": [{ "mask-b-from": P() }],
			"mask-image-b-to-color": [{ "mask-b-to": P() }],
			"mask-image-l-from-pos": [{ "mask-l-from": ce() }],
			"mask-image-l-to-pos": [{ "mask-l-to": ce() }],
			"mask-image-l-from-color": [{ "mask-l-from": P() }],
			"mask-image-l-to-color": [{ "mask-l-to": P() }],
			"mask-image-x-from-pos": [{ "mask-x-from": ce() }],
			"mask-image-x-to-pos": [{ "mask-x-to": ce() }],
			"mask-image-x-from-color": [{ "mask-x-from": P() }],
			"mask-image-x-to-color": [{ "mask-x-to": P() }],
			"mask-image-y-from-pos": [{ "mask-y-from": ce() }],
			"mask-image-y-to-pos": [{ "mask-y-to": ce() }],
			"mask-image-y-from-color": [{ "mask-y-from": P() }],
			"mask-image-y-to-color": [{ "mask-y-to": P() }],
			"mask-image-radial": [{ "mask-radial": [B, z] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": ce() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": ce() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": P() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": P() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [R] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": ce() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": ce() }],
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
				B,
				z
			] }],
			filter: [{ filter: [
				"",
				"none",
				B,
				z
			] }],
			blur: [{ blur: le() }],
			brightness: [{ brightness: [
				R,
				B,
				z
			] }],
			contrast: [{ contrast: [
				R,
				B,
				z
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				Pl,
				Ol
			] }],
			"drop-shadow-color": [{ "drop-shadow": P() }],
			grayscale: [{ grayscale: [
				"",
				R,
				B,
				z
			] }],
			"hue-rotate": [{ "hue-rotate": [
				R,
				B,
				z
			] }],
			invert: [{ invert: [
				"",
				R,
				B,
				z
			] }],
			saturate: [{ saturate: [
				R,
				B,
				z
			] }],
			sepia: [{ sepia: [
				"",
				R,
				B,
				z
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				B,
				z
			] }],
			"backdrop-blur": [{ "backdrop-blur": le() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				R,
				B,
				z
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				R,
				B,
				z
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				R,
				B,
				z
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				R,
				B,
				z
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				R,
				B,
				z
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				R,
				B,
				z
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				R,
				B,
				z
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				R,
				B,
				z
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
				B,
				z
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				R,
				"initial",
				B,
				z
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				B,
				z
			] }],
			delay: [{ delay: [
				R,
				B,
				z
			] }],
			animate: [{ animate: [
				"none",
				v,
				B,
				z
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				B,
				z
			] }],
			"perspective-origin": [{ "perspective-origin": x() }],
			rotate: [{ rotate: ue() }],
			"rotate-x": [{ "rotate-x": ue() }],
			"rotate-y": [{ "rotate-y": ue() }],
			"rotate-z": [{ "rotate-z": ue() }],
			scale: [{ scale: de() }],
			"scale-x": [{ "scale-x": de() }],
			"scale-y": [{ "scale-y": de() }],
			"scale-z": [{ "scale-z": de() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: fe() }],
			"skew-x": [{ "skew-x": fe() }],
			"skew-y": [{ "skew-y": fe() }],
			transform: [{ transform: [
				B,
				z,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: x() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: pe() }],
			"translate-x": [{ "translate-x": pe() }],
			"translate-y": [{ "translate-y": pe() }],
			"translate-z": [{ "translate-z": pe() }],
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
				B,
				z
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
				B,
				z
			] }],
			fill: [{ fill: ["none", ...P()] }],
			"stroke-w": [{ stroke: [
				R,
				kl,
				Sl,
				Cl
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
function V(...e) {
	return Kl(T(e));
}
//#endregion
//#region src/components/ui/button.tsx
var ql = O("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
function H({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ y(r ? Bs : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: V(ql({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/components/ui/card.tsx
var Jl = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function U({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card",
		"data-variant": t,
		className: V("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", Jl[t], e),
		...n
	});
}
function W({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-header",
		className: V("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function G({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-title",
		className: V("leading-none font-semibold", e),
		...t
	});
}
function Yl({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-description",
		className: V("text-sm text-muted-foreground", e),
		...t
	});
}
function K({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "card-content",
		className: V("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region src/components/ui/input.tsx
function Xl({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ y("input", {
		type: t,
		"data-slot": "input",
		className: V("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function Zl({ className: e, ...t }) {
	return /* @__PURE__ */ y(ao, {
		"data-slot": "label",
		className: V("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/components/ui/skeleton.tsx
function Ql({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "skeleton",
		className: V("animate-pulse rounded-md bg-accent", e),
		...t
	});
}
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var $l = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), eu = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), tu = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), nu = (e) => {
	let t = tu(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, ru = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, iu = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, au = n({}), ou = () => a(au), su = i(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: i, className: a = "", children: o, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = ou() ?? {}, h = i ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return r("svg", {
		ref: l,
		...ru,
		width: t ?? u ?? ru.width,
		height: t ?? u ?? ru.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: $l("lucide", m, a),
		...!o && !iu(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => r(e, t)), ...Array.isArray(o) ? o : [o]]);
}), cu = (e, t) => {
	let n = i(({ className: n, ...i }, a) => r(su, {
		ref: a,
		iconNode: t,
		className: $l(`lucide-${eu(nu(e))}`, `lucide-${e}`, n),
		...i
	}));
	return n.displayName = nu(e), n;
}, lu = cu("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]), uu = cu("chevron-down", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]), du = cu("chevron-up", [["path", {
	d: "m18 15-6-6-6 6",
	key: "153udz"
}]]);
//#endregion
//#region src/hooks/use-text-direction.ts
function fu() {
	let { i18n: e } = d();
	return e.dir() === "rtl" ? "rtl" : "ltr";
}
//#endregion
//#region src/components/ui/select.tsx
function pu({ ...e }) {
	return /* @__PURE__ */ y(Ds, {
		"data-slot": "select",
		...e
	});
}
function mu({ ...e }) {
	return /* @__PURE__ */ y(ks, {
		"data-slot": "select-value",
		...e
	});
}
function hu({ className: e, size: t = "default", children: n, ...r }) {
	return /* @__PURE__ */ b(Os, {
		"data-slot": "select-trigger",
		"data-size": t,
		dir: fu(),
		className: V("flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap text-start shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", e),
		...r,
		children: [n, /* @__PURE__ */ y(As, {
			asChild: !0,
			children: /* @__PURE__ */ y(uu, { className: "size-4 opacity-50" })
		})]
	});
}
function gu({ className: e, children: t, position: n = "popper", align: r = "start", ...i }) {
	return /* @__PURE__ */ y(Cn, {
		allowBodyScroll: !0,
		children: /* @__PURE__ */ y(js, { children: /* @__PURE__ */ b(Ms, {
			"data-slot": "select-content",
			dir: fu(),
			className: V("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-start text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", e),
			position: n,
			align: r,
			...i,
			children: [
				/* @__PURE__ */ y(vu, {}),
				/* @__PURE__ */ y(Ns, {
					className: V("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
					children: t
				}),
				/* @__PURE__ */ y(yu, {})
			]
		}) })
	});
}
function _u({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ b(Ps, {
		"data-slot": "select-item",
		className: V("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pe-8 ps-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", e),
		...n,
		children: [/* @__PURE__ */ y("span", {
			"data-slot": "select-item-indicator",
			className: "absolute end-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ y(Is, { children: /* @__PURE__ */ y(lu, { className: "size-4" }) })
		}), /* @__PURE__ */ y(Fs, { children: t })]
	});
}
function vu({ className: e, ...t }) {
	return /* @__PURE__ */ y(Ls, {
		"data-slot": "select-scroll-up-button",
		className: V("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ y(du, { className: "size-4" })
	});
}
function yu({ className: e, ...t }) {
	return /* @__PURE__ */ y(Rs, {
		"data-slot": "select-scroll-down-button",
		className: V("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ y(uu, { className: "size-4" })
	});
}
//#endregion
//#region src/components/ui/table.tsx
function bu({ className: e, ...t }) {
	return /* @__PURE__ */ y("div", {
		"data-slot": "table-container",
		className: "relative w-full overflow-x-auto",
		children: /* @__PURE__ */ y("table", {
			"data-slot": "table",
			className: V("w-full caption-bottom text-sm", e),
			...t
		})
	});
}
function xu({ className: e, ...t }) {
	return /* @__PURE__ */ y("thead", {
		"data-slot": "table-header",
		className: V("[&_tr]:border-b", e),
		...t
	});
}
function Su({ className: e, ...t }) {
	return /* @__PURE__ */ y("tbody", {
		"data-slot": "table-body",
		className: V("[&_tr:last-child]:border-0", e),
		...t
	});
}
function q({ className: e, ...t }) {
	return /* @__PURE__ */ y("tr", {
		"data-slot": "table-row",
		className: V("border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted", e),
		...t
	});
}
function J({ className: e, ...t }) {
	return /* @__PURE__ */ y("th", {
		"data-slot": "table-head",
		className: V("h-10 px-2 text-start align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]", e),
		...t
	});
}
function Y({ className: e, ...t }) {
	return /* @__PURE__ */ y("td", {
		"data-slot": "table-cell",
		className: V("p-2 text-start align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]", e),
		...t
	});
}
//#endregion
//#region src/components/ui/tabs.tsx
function Cu({ className: e, orientation: t = "horizontal", dir: n, ...r }) {
	let i = fu();
	return /* @__PURE__ */ y(bc, {
		"data-slot": "tabs",
		"data-orientation": t,
		orientation: t,
		dir: n ?? i,
		className: V("group/tabs flex gap-2 data-[orientation=horizontal]:flex-col", e),
		...r
	});
}
var wu = O("group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none", {
	variants: { variant: {
		default: "bg-muted",
		line: "gap-1 bg-transparent"
	} },
	defaultVariants: { variant: "default" }
});
function Tu({ className: e, variant: t = "default", dir: n, ...r }) {
	let i = fu();
	return /* @__PURE__ */ y(xc, {
		"data-slot": "tabs-list",
		"data-variant": t,
		dir: n ?? i,
		className: V(wu({ variant: t }), e),
		...r
	});
}
function Eu({ className: e, ...t }) {
	return /* @__PURE__ */ y(Sc, {
		"data-slot": "tabs-trigger",
		className: V("relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent", "data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground", "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:inset-inline-end-0 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100", e),
		...t
	});
}
function Du({ className: e, ...t }) {
	return /* @__PURE__ */ y(Cc, {
		"data-slot": "tabs-content",
		className: V("flex-1 outline-none", e),
		...t
	});
}
//#endregion
//#region src/lib/queryClient.ts
var Ou = null;
function ku() {
	return Ou;
}
//#endregion
//#region src/lib/authLost.ts
var Au = ["auth", "session"], ju = new Set([
	"rest_cookie_invalid_nonce",
	"rest_not_logged_in",
	"invalid_nonce",
	"ajax_referer_failed",
	"-1"
]);
function Mu(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (t.status === 401) return !0;
	let n = typeof t.code == "string" ? t.code : "";
	if (ju.has(n)) return !0;
	let r = typeof t.message == "string" ? t.message.toLowerCase() : "";
	return !!(r.includes("cookie nonce is invalid") || r.includes("rest_cookie_invalid_nonce") || t.status === 403 && (n === "-1" || r === "-1" || r.includes("are you sure you want to do this")));
}
function Nu(e) {
	let t = e ?? ku();
	t && t.setQueryData(Au, { logged_in: !1 });
}
var Pu = new Set([
	"rest_cookie_invalid_nonce",
	"invalid_nonce",
	"ajax_referer_failed",
	"-1"
]);
function Fu(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (t.status === 401) return !1;
	let n = typeof t.code == "string" ? t.code : "";
	if (Pu.has(n)) return !0;
	let r = typeof t.message == "string" ? t.message.toLowerCase() : "";
	return r.includes("cookie nonce is invalid") || r.includes("rest_cookie_invalid_nonce") || r === "invalid nonce";
}
function Iu(e) {
	Fu(e) || Mu(e) && Nu();
}
//#endregion
//#region src/lib/safeUrl.ts
function Lu(e) {
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
function Ru() {
	return window.webinoDashboard;
}
var zu = 3e4;
function Bu(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function Vu(e) {
	let t = Ru();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (Bu(e) || Lu(e)) return e;
	throw new nd("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function Hu(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function Uu(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "license/remote-check" ? "webino_dashboard_license_remote_check" : t === "license/diagnostics" ? "webino_dashboard_license_diagnostics" : t === "license/remote-activate" ? "webino_dashboard_license_remote_activate" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") || t.startsWith("shop/reports") || t.startsWith("shop/product-categories") || t === "comments" || t.startsWith("comments/") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : /^(payments|torobpay|snapppay|digipay|zarinpal|bale-pay|wallet|c2c)(\/|$)/.test(t) ? "webino_dashboard_payments_rest" : t.startsWith("analytics/") && t !== "analytics/hit" ? "webino_dashboard_analytics_rest" : null;
}
function Wu(e, t) {
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
function Gu(e, t) {
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
async function Ku(e, t, n = {}) {
	let r = Uu(e), i = Ru();
	if (!r || !i.ajaxUrl) throw new nd("AJAX fallback unavailable", {
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
	let { signal: l, clear: u } = Hu({}, t);
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
			let n = Gu(t, e.status);
			throw new nd(n.message, {
				code: n.code,
				status: e.status
			});
		}
		if (!n.success) {
			let t = new nd(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
				code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
				status: e.status
			});
			throw Iu(t), t;
		}
		return n.data;
	} catch (e) {
		throw e instanceof nd ? (Iu(e), e) : e instanceof DOMException && e.name === "AbortError" ? new nd("Request timed out", {
			code: "request_timeout",
			status: 0
		}) : e instanceof TypeError ? new nd("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		u();
	}
}
var qu = null;
function Ju(e) {
	let t = Ru();
	t && typeof e == "string" && e.length > 0 && (t.nonce = e);
}
function Yu() {
	if (qu) return qu;
	let e = Ru();
	if (!e?.ajaxUrl) return Promise.resolve(!1);
	let t = new URLSearchParams();
	return t.set("action", "webino_dashboard_auth_session"), qu = fetch(e.ajaxUrl, {
		method: "POST",
		credentials: "same-origin",
		headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
		body: t
	}).then((e) => e.json()).then((e) => {
		let t = !!(e?.success && e.data?.logged_in);
		return t && Ju(e.data?.nonce), t && typeof e.data?.nonce == "string" && e.data.nonce.length > 0;
	}).catch(() => !1).finally(() => {
		window.setTimeout(() => {
			qu = null;
		}, 0);
	}), qu;
}
async function X(e, t = {}, n = zu) {
	try {
		return await Xu(e, t, n);
	} catch (r) {
		if (!Fu(r)) throw r;
		if (!await Yu()) throw Nu(), r;
		let i = { ...t.headers };
		for (let e of Object.keys(i)) e.toLowerCase() === "x-wp-nonce" && delete i[e];
		return Xu(e, {
			...t,
			headers: i
		}, n);
	}
}
async function Xu(e, t = {}, n = zu) {
	if (Uu(e) && Ru().ajaxUrl) return Ku(e, n, t);
	let r = Vu(e), i = Ru(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce), !Object.keys(a).some((e) => e.toLowerCase() === "content-type") && typeof t.body == "string" && t.body.length > 0 && (a["Content-Type"] = "application/json");
	let { signal: s, clear: c } = Hu(t, n);
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
			let t = Wu(n, e.status);
			throw new nd(t.message, {
				code: t.code,
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i, n = new nd(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
			throw Iu(n), n;
		}
		return i;
	} catch (e) {
		throw e instanceof nd ? (Iu(e), e) : e instanceof DOMException && e.name === "AbortError" ? new nd("Request timed out", {
			code: "request_timeout",
			status: 0
		}) : e instanceof TypeError ? new nd("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region src/lib/marketplace-api.ts
function Zu(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function Qu(e) {
	"@babel/helpers - typeof";
	return Qu = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, Qu(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function $u(e, t) {
	if (Qu(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (Qu(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function ed(e) {
	var t = $u(e, "string");
	return Qu(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function td(e, t, n) {
	return (t = ed(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/lib/apiError.ts
var nd = class extends Error {
	constructor(e, t) {
		super(e), td(this, "code", void 0), td(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, rd = {
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
function id(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function ad(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function od(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(Zu(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function sd(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return od(e, n);
	if (t instanceof nd && t.code) {
		let n = rd[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = rd[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return id(n) ? e("errors.api.requestTimeout") : ad(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function Z(e, t) {
	h.error(sd(e, t));
}
//#endregion
//#region src/hooks/useQueryErrorToast.ts
function Q(e) {
	let { t } = d(), n = l(!1);
	o(() => {
		e.isError && e.error ? n.current || (n.current = !0, h.error(sd(t, e.error))) : n.current = !1;
	}, [
		e.isError,
		e.error,
		e.fetchStatus,
		t
	]);
}
//#endregion
//#region ../Modules/security-module/client/lib/security-api.ts
var cd = [
	"whois",
	"ip-lookup",
	"diagnostics",
	"integrity-diff",
	"quarantine",
	"snapshots",
	"sessions",
	"password-audit",
	"headers-tester",
	"tls-dns",
	"secrets-search",
	"canary",
	"honeypot",
	"import-export",
	"waf-learning",
	"incident",
	"compat",
	"cli-recipes",
	"heal-wizard",
	"file-browser"
], ld = [
	"executive",
	"firewall",
	"vulnerabilities",
	"malware",
	"hardening",
	"compliance_hint",
	"incident",
	"feed_health"
];
function ud() {
	return X("security/overview");
}
function dd() {
	return X("security/settings");
}
function fd(e) {
	return X("security/settings", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(e)
	});
}
function pd(e) {
	return X("security/settings/profile", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ profile: e })
	});
}
function md() {
	return X("security/settings/schema");
}
function hd() {
	return X("security/diagnostics");
}
function gd(e) {
	let t = new URLSearchParams();
	e?.seconds && t.set("seconds", String(e.seconds));
	let n = t.toString();
	return X(`security/firewall/live${n ? `?${n}` : ""}`);
}
function _d() {
	return X("security/firewall/status");
}
function vd() {
	return X("security/firewall/blocks");
}
function yd(e) {
	return X("security/firewall/blocks", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(e)
	});
}
function bd(e) {
	return X(`security/firewall/blocks?id=${e}`, { method: "DELETE" });
}
function xd() {
	return X("security/firewall/allows");
}
function Sd(e) {
	return X("security/firewall/allows", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(e)
	});
}
function Cd(e) {
	return X(`security/firewall/allows?id=${e}`, { method: "DELETE" });
}
function wd() {
	return X("security/firewall/rules");
}
function Td(e) {
	return X("security/firewall/rules", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(e)
	});
}
function Ed(e) {
	return X("security/firewall/rules", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(e)
	});
}
function Dd(e) {
	return X(`security/firewall/rules?id=${e}`, { method: "DELETE" });
}
function Od(e) {
	return X("security/firewall/rules/test", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(e)
	});
}
function kd(e) {
	return X("security/firewall/learning/promote", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ rule_id: e })
	});
}
function Ad() {
	return X("security/scan");
}
function jd(e) {
	return X("security/scan", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ profile: e })
	});
}
function Md(e) {
	return X(`security/scan/${e}`);
}
function Nd(e) {
	return X(`security/scan/${e}/cancel`, { method: "POST" });
}
function Pd(e) {
	let t = new URLSearchParams();
	e?.status && t.set("status", e.status), e?.severity && t.set("severity", e.severity), e?.scan_id != null && e.scan_id > 0 && t.set("scan_id", String(e.scan_id));
	let n = t.toString();
	return X(`security/findings${n ? `?${n}` : ""}`);
}
function Fd(e, t) {
	return X(`security/findings/${e}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ status: t })
	});
}
function Id(e) {
	return X("security/heal/preview", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ actions: e })
	});
}
function Ld(e) {
	return X("security/heal/apply", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(e)
	});
}
function Rd(e) {
	return X("security/heal/rollback", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ snapshot_id: e })
	});
}
function zd() {
	return X("security/feeds");
}
function Bd() {
	return X("security/feeds/sync", { method: "POST" });
}
function Vd(e, t) {
	let n = new URLSearchParams(t ?? {}).toString();
	return X(`security/tools/${encodeURIComponent(e)}${n ? `?${n}` : ""}`);
}
function Hd(e, t = {}) {
	return X(`security/tools/${encodeURIComponent(e)}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(t)
	});
}
function Ud() {
	return X("security/reports");
}
function Wd(e) {
	return X("security/reports", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ type: e })
	});
}
function Gd(e) {
	return X(`security/reports/${e}`);
}
function Kd() {
	return X("security/audit");
}
function qd() {
	return X("security/incidents");
}
function Jd() {
	return X("security/2fa");
}
function Yd(e) {
	return X("security/2fa", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(e)
	});
}
//#endregion
//#region ../Modules/security-module/client/pages/SecurityShell.tsx
var Xd = [
	{
		path: "/security",
		key: "navOverview"
	},
	{
		path: "/security/firewall",
		key: "navFirewall"
	},
	{
		path: "/security/scan",
		key: "navScan"
	},
	{
		path: "/security/tools",
		key: "navTools"
	},
	{
		path: "/security/reports",
		key: "navReports"
	},
	{
		path: "/security/settings",
		key: "navSettings"
	}
];
function Zd() {
	let { t: e } = d(), { pathname: t } = S();
	return /* @__PURE__ */ y("div", {
		className: "flex flex-wrap gap-2",
		children: Xd.map(({ path: n, key: r }) => {
			let i = t === n || n !== "/security" && t.startsWith(n);
			return /* @__PURE__ */ y(H, {
				asChild: !0,
				variant: i ? "secondary" : "outline",
				size: "sm",
				className: V(i && "font-medium"),
				children: /* @__PURE__ */ y(x, {
					to: n,
					children: e(`security.${r}`)
				})
			}, n);
		})
	});
}
//#endregion
//#region ../Modules/security-module/client/pages/SecurityFirewallBlockingPage.tsx
var Qd = [
	"ip",
	"cidr",
	"ua"
];
function $d({ mode: e, onSubmit: t, pending: n }) {
	let { t: r } = d(), [i, a] = u("ip"), [o, s] = u(""), [c, l] = u(""), [f, p] = u("");
	return /* @__PURE__ */ b("div", {
		className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
		children: [
			/* @__PURE__ */ b("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ y(Zl, { children: r("security.col.type") }), /* @__PURE__ */ b(pu, {
					value: i,
					onValueChange: a,
					children: [/* @__PURE__ */ y(hu, { children: /* @__PURE__ */ y(mu, {}) }), /* @__PURE__ */ y(gu, { children: Qd.map((e) => /* @__PURE__ */ y(_u, {
						value: e,
						children: r(`security.blockType.${e}`)
					}, e)) })]
				})]
			}),
			/* @__PURE__ */ b("div", {
				className: "space-y-1 sm:col-span-2",
				children: [/* @__PURE__ */ y(Zl, { children: r("security.col.value") }), /* @__PURE__ */ y(Xl, {
					value: o,
					onChange: (e) => s(e.target.value),
					placeholder: "203.0.113.10"
				})]
			}),
			/* @__PURE__ */ b("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ y(Zl, { children: r(e === "block" ? "security.col.reason" : "security.col.note") }), /* @__PURE__ */ y(Xl, {
					value: c,
					onChange: (e) => l(e.target.value)
				})]
			}),
			e === "block" ? /* @__PURE__ */ b("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ y(Zl, { children: r("security.col.minutes") }), /* @__PURE__ */ y(Xl, {
					type: "number",
					min: 0,
					value: f,
					onChange: (e) => p(e.target.value),
					placeholder: r("security.optional")
				})]
			}) : null,
			/* @__PURE__ */ y("div", {
				className: "flex items-end",
				children: /* @__PURE__ */ y(H, {
					disabled: n || !o.trim(),
					onClick: () => t({
						type: i,
						value: o.trim(),
						...e === "block" ? {
							reason: c,
							minutes: f ? Number(f) : void 0
						} : { note: c }
					}),
					children: r(e === "block" ? "security.addBlock" : "security.addAllow")
				})
			})
		]
	});
}
function ef() {
	let { t: e } = d(), t = m(), n = p({
		queryKey: [
			"security",
			"firewall",
			"blocks"
		],
		queryFn: vd
	});
	Q(n);
	let r = p({
		queryKey: [
			"security",
			"firewall",
			"allows"
		],
		queryFn: xd
	});
	Q(r);
	let i = f({
		mutationFn: yd,
		onSuccess: () => {
			h.success(e("security.blockAdded")), t.invalidateQueries({ queryKey: [
				"security",
				"firewall",
				"blocks"
			] });
		},
		onError: (t) => Z(e, t)
	}), a = f({
		mutationFn: bd,
		onSuccess: () => {
			h.success(e("security.blockRemoved")), t.invalidateQueries({ queryKey: [
				"security",
				"firewall",
				"blocks"
			] });
		},
		onError: (t) => Z(e, t)
	}), o = f({
		mutationFn: Sd,
		onSuccess: () => {
			h.success(e("security.allowAdded")), t.invalidateQueries({ queryKey: [
				"security",
				"firewall",
				"allows"
			] });
		},
		onError: (t) => Z(e, t)
	}), s = f({
		mutationFn: Cd,
		onSuccess: () => {
			h.success(e("security.allowRemoved")), t.invalidateQueries({ queryKey: [
				"security",
				"firewall",
				"allows"
			] });
		},
		onError: (t) => Z(e, t)
	});
	return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ y(Zd, {}), /* @__PURE__ */ b(Cu, {
			defaultValue: "blocks",
			children: [
				/* @__PURE__ */ b(Tu, { children: [/* @__PURE__ */ y(Eu, {
					value: "blocks",
					children: e("security.tabBlocks")
				}), /* @__PURE__ */ y(Eu, {
					value: "allows",
					children: e("security.tabAllows")
				})] }),
				/* @__PURE__ */ b(Du, {
					value: "blocks",
					className: "space-y-4",
					children: [/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.addBlock") }) }), /* @__PURE__ */ y(K, {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ y($d, {
							mode: "block",
							pending: i.isPending,
							onSubmit: (e) => void i.mutateAsync(e)
						})
					})] }), /* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.tabBlocks") }) }), /* @__PURE__ */ y(K, {
						className: "overflow-x-auto",
						children: n.isPending ? /* @__PURE__ */ y(Ql, { className: "h-32 w-full" }) : (n.data?.items ?? []).length === 0 ? /* @__PURE__ */ y("p", {
							className: "text-sm text-muted-foreground",
							children: e("security.noBlocks")
						}) : /* @__PURE__ */ b(bu, { children: [/* @__PURE__ */ y(xu, { children: /* @__PURE__ */ b(q, { children: [
							/* @__PURE__ */ y(J, { children: e("security.col.type") }),
							/* @__PURE__ */ y(J, { children: e("security.col.value") }),
							/* @__PURE__ */ y(J, { children: e("security.col.reason") }),
							/* @__PURE__ */ y(J, { children: e("security.col.source") }),
							/* @__PURE__ */ y(J, {
								className: "text-right",
								children: e("security.col.actions")
							})
						] }) }), /* @__PURE__ */ y(Su, { children: (n.data?.items ?? []).map((t) => /* @__PURE__ */ b(q, { children: [
							/* @__PURE__ */ y(Y, { children: t.type }),
							/* @__PURE__ */ y(Y, {
								className: "font-mono text-xs",
								children: t.value_text
							}),
							/* @__PURE__ */ y(Y, { children: t.reason || "—" }),
							/* @__PURE__ */ y(Y, { children: t.source }),
							/* @__PURE__ */ y(Y, {
								className: "text-right",
								children: /* @__PURE__ */ y(H, {
									variant: "ghost",
									size: "sm",
									disabled: a.isPending,
									onClick: () => void a.mutateAsync(t.id),
									children: e("security.delete")
								})
							})
						] }, t.id)) })] })
					})] })]
				}),
				/* @__PURE__ */ b(Du, {
					value: "allows",
					className: "space-y-4",
					children: [/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.addAllow") }) }), /* @__PURE__ */ y(K, {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ y($d, {
							mode: "allow",
							pending: o.isPending,
							onSubmit: (e) => void o.mutateAsync(e)
						})
					})] }), /* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.tabAllows") }) }), /* @__PURE__ */ y(K, {
						className: "overflow-x-auto",
						children: r.isPending ? /* @__PURE__ */ y(Ql, { className: "h-32 w-full" }) : (r.data?.items ?? []).length === 0 ? /* @__PURE__ */ y("p", {
							className: "text-sm text-muted-foreground",
							children: e("security.noAllows")
						}) : /* @__PURE__ */ b(bu, { children: [/* @__PURE__ */ y(xu, { children: /* @__PURE__ */ b(q, { children: [
							/* @__PURE__ */ y(J, { children: e("security.col.type") }),
							/* @__PURE__ */ y(J, { children: e("security.col.value") }),
							/* @__PURE__ */ y(J, { children: e("security.col.note") }),
							/* @__PURE__ */ y(J, {
								className: "text-right",
								children: e("security.col.actions")
							})
						] }) }), /* @__PURE__ */ y(Su, { children: (r.data?.items ?? []).map((t) => /* @__PURE__ */ b(q, { children: [
							/* @__PURE__ */ y(Y, { children: t.type }),
							/* @__PURE__ */ y(Y, {
								className: "font-mono text-xs",
								children: t.value_text
							}),
							/* @__PURE__ */ y(Y, { children: t.note || "—" }),
							/* @__PURE__ */ y(Y, {
								className: "text-right",
								children: /* @__PURE__ */ y(H, {
									variant: "ghost",
									size: "sm",
									disabled: s.isPending,
									onClick: () => void s.mutateAsync(t.id),
									children: e("security.delete")
								})
							})
						] }, t.id)) })] })
					})] })]
				})
			]
		})]
	});
}
//#endregion
//#region src/components/ui/badge.tsx
var tf = O("inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3", {
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
function $({ className: e, variant: t = "default", asChild: n = !1, ...r }) {
	return /* @__PURE__ */ y(n ? Bs : "span", {
		"data-slot": "badge",
		"data-variant": t,
		className: V(tf({ variant: t }), e),
		...r
	});
}
//#endregion
//#region ../Modules/security-module/client/pages/SecurityFirewallLivePage.tsx
var nf = [
	"all",
	"block",
	"challenge",
	"log",
	"allow"
];
function rf() {
	let { t: e, i18n: t } = d(), [n, r] = u("all"), [i, a] = u(""), o = p({
		queryKey: [
			"security",
			"firewall",
			"live"
		],
		queryFn: () => gd({ seconds: 300 }),
		refetchInterval: 3e3
	});
	Q(o);
	let s = c(() => {
		let e = o.data?.events ?? [];
		if (n !== "all" && (e = e.filter((e) => e.action === n)), i.trim()) {
			let t = i.trim().toLowerCase();
			e = e.filter((e) => e.path.toLowerCase().includes(t));
		}
		return e;
	}, [
		o.data?.events,
		n,
		i
	]), l = (e) => {
		try {
			return new Intl.DateTimeFormat(t.language, { timeStyle: "medium" }).format(new Date(e));
		} catch {
			return e;
		}
	};
	return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ y(Zd, {}), /* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.liveTrafficTitle") }) }), /* @__PURE__ */ b(K, {
			className: "space-y-4 overflow-x-auto",
			children: [/* @__PURE__ */ b("div", {
				className: "flex flex-wrap gap-4",
				children: [/* @__PURE__ */ b("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ y(Zl, { children: e("security.filterAction") }), /* @__PURE__ */ b(pu, {
						value: n,
						onValueChange: r,
						children: [/* @__PURE__ */ y(hu, {
							className: "w-[160px]",
							children: /* @__PURE__ */ y(mu, {})
						}), /* @__PURE__ */ y(gu, { children: nf.map((t) => /* @__PURE__ */ y(_u, {
							value: t,
							children: t === "all" ? e("security.filterAll") : e(`security.action.${t}`, { defaultValue: t })
						}, t)) })]
					})]
				}), /* @__PURE__ */ b("div", {
					className: "min-w-[200px] flex-1 space-y-1",
					children: [/* @__PURE__ */ y(Zl, {
						htmlFor: "path-filter",
						children: e("security.filterPath")
					}), /* @__PURE__ */ y(Xl, {
						id: "path-filter",
						value: i,
						onChange: (e) => a(e.target.value),
						placeholder: "/wp-login.php"
					})]
				})]
			}), o.isPending ? /* @__PURE__ */ y(Ql, { className: "h-64 w-full" }) : s.length === 0 ? /* @__PURE__ */ y("p", {
				className: "text-sm text-muted-foreground",
				children: e("security.noLiveEvents")
			}) : /* @__PURE__ */ b(bu, { children: [/* @__PURE__ */ y(xu, { children: /* @__PURE__ */ b(q, { children: [
				/* @__PURE__ */ y(J, { children: e("security.col.time") }),
				/* @__PURE__ */ y(J, { children: e("security.col.action") }),
				/* @__PURE__ */ y(J, { children: e("security.col.method") }),
				/* @__PURE__ */ y(J, { children: e("security.col.path") }),
				/* @__PURE__ */ y(J, { children: e("security.col.rule") }),
				/* @__PURE__ */ y(J, { children: e("security.col.country") })
			] }) }), /* @__PURE__ */ y(Su, { children: s.map((t) => /* @__PURE__ */ b(q, { children: [
				/* @__PURE__ */ y(Y, {
					className: "whitespace-nowrap text-xs",
					children: l(t.created_at)
				}),
				/* @__PURE__ */ y(Y, { children: /* @__PURE__ */ y($, {
					variant: t.action === "block" ? "destructive" : "secondary",
					className: "text-xs",
					children: e(`security.action.${t.action}`, { defaultValue: t.action })
				}) }),
				/* @__PURE__ */ y(Y, {
					className: "font-mono text-xs",
					children: t.method
				}),
				/* @__PURE__ */ y(Y, {
					className: "max-w-[240px] truncate font-mono text-xs",
					title: t.path,
					children: t.path
				}),
				/* @__PURE__ */ y(Y, {
					className: "font-mono text-xs",
					children: t.rule_id || "—"
				}),
				/* @__PURE__ */ y(Y, { children: t.country || "—" })
			] }, t.id)) })] })]
		})] })]
	});
}
//#endregion
//#region ../Modules/security-module/client/pages/SecurityFirewallPage.tsx
function af() {
	let { t: e } = d(), t = p({
		queryKey: [
			"security",
			"firewall",
			"status"
		],
		queryFn: _d
	});
	Q(t);
	let n = p({
		queryKey: ["security", "overview"],
		queryFn: ud
	});
	Q(n);
	let r = t.data, i = Object.entries(r?.layers ?? {});
	return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ y(Zd, {}),
			/* @__PURE__ */ b("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ y(H, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ y(x, {
							to: "/security/firewall/live",
							children: e("security.liveTrafficTitle")
						})
					}),
					/* @__PURE__ */ y(H, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ y(x, {
							to: "/security/firewall/rules",
							children: e("security.rulesTitle")
						})
					}),
					/* @__PURE__ */ y(H, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ y(x, {
							to: "/security/firewall/blocking",
							children: e("security.blockingTitle")
						})
					})
				]
			}),
			t.isPending ? /* @__PURE__ */ y(Ql, { className: "h-40 w-full rounded-xl" }) : /* @__PURE__ */ b("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, {
						className: "pb-2",
						children: /* @__PURE__ */ y(G, {
							className: "text-sm font-medium text-muted-foreground",
							children: e("security.firewall.enabled")
						})
					}), /* @__PURE__ */ y(K, { children: /* @__PURE__ */ y($, {
						variant: r?.enabled ? "default" : "secondary",
						children: r?.enabled ? e("security.yes") : e("security.no")
					}) })] }),
					/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, {
						className: "pb-2",
						children: /* @__PURE__ */ y(G, {
							className: "text-sm font-medium text-muted-foreground",
							children: e("security.kpi.wafMode")
						})
					}), /* @__PURE__ */ y(K, { children: /* @__PURE__ */ y($, {
						variant: "outline",
						className: "capitalize",
						children: e(`security.wafMode.${r?.mode ?? "learning"}`, { defaultValue: r?.mode ?? "—" })
					}) })] }),
					/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, {
						className: "pb-2",
						children: /* @__PURE__ */ y(G, {
							className: "text-sm font-medium text-muted-foreground",
							children: e("security.kpi.blocks24h")
						})
					}), /* @__PURE__ */ y(K, { children: /* @__PURE__ */ y("div", {
						className: "text-2xl font-semibold tabular-nums",
						children: n.data?.blocks_24h ?? 0
					}) })] }),
					/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, {
						className: "pb-2",
						children: /* @__PURE__ */ y(G, {
							className: "text-sm font-medium text-muted-foreground",
							children: e("security.firewall.bypass")
						})
					}), /* @__PURE__ */ y(K, { children: /* @__PURE__ */ y($, {
						variant: r?.disabled ? "destructive" : "secondary",
						children: r?.disabled ? e("security.firewall.bypassActive") : e("security.firewall.bypassOff")
					}) })] })
				]
			}),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.firewall.layers") }) }), /* @__PURE__ */ y(K, { children: t.isPending ? /* @__PURE__ */ y(Ql, { className: "h-24 w-full" }) : i.length === 0 ? /* @__PURE__ */ y("p", {
				className: "text-sm text-muted-foreground",
				children: e("security.firewall.noLayers")
			}) : /* @__PURE__ */ y("ul", {
				className: "grid gap-2 sm:grid-cols-2",
				children: i.map(([t, n]) => /* @__PURE__ */ b("li", {
					className: "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
					children: [/* @__PURE__ */ y("span", {
						className: "font-mono text-xs",
						children: t
					}), /* @__PURE__ */ y($, {
						variant: n ? "default" : "outline",
						children: typeof n == "boolean" ? e(n ? "security.active" : "security.inactive") : String(n)
					})]
				}, t))
			}) })] })
		]
	});
}
//#endregion
//#region src/components/ui/switch.tsx
function of({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ y(rc, {
		"data-slot": "switch",
		"data-size": t,
		className: V("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", e),
		...n,
		dir: "ltr",
		children: /* @__PURE__ */ y(ic, {
			"data-slot": "switch-thumb",
			className: V("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
//#endregion
//#region src/components/ui/textarea.tsx
function sf({ className: e, ...t }) {
	return /* @__PURE__ */ y("textarea", {
		"data-slot": "textarea",
		className: V("flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-start shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40", e),
		...t
	});
}
//#endregion
//#region ../Modules/security-module/client/pages/SecurityFirewallRulesPage.tsx
function cf() {
	let { t: e } = d(), t = m(), [n, r] = u(""), [i, a] = u(""), [o, s] = u("block"), [c, l] = u(!1), [g, _] = u("{\"action\":\"block\",\"conditions\":[{\"field\":\"path\",\"op\":\"contains\",\"value\":\"/wp-login.php\"}]}"), [v, S] = u("{\"path\":\"/wp-login.php\",\"payload\":\"\"}"), [C, w] = u(null), T = p({
		queryKey: [
			"security",
			"firewall",
			"rules"
		],
		queryFn: wd
	});
	Q(T);
	let E = f({
		mutationFn: () => Td({
			name: n || "Custom rule",
			action: o,
			enabled: 1,
			learning: +!!c,
			priority: 100,
			conditions: i ? [{
				field: "path",
				op: "contains",
				value: i
			}] : []
		}),
		onSuccess: () => {
			h.success(e("security.ruleCreated")), r(""), a(""), t.invalidateQueries({ queryKey: [
				"security",
				"firewall",
				"rules"
			] });
		},
		onError: (t) => Z(e, t)
	}), D = f({
		mutationFn: ({ id: e, enabled: t }) => Ed({
			id: e,
			enabled: +!!t
		}),
		onSuccess: () => {
			h.success(e("security.ruleUpdated")), t.invalidateQueries({ queryKey: [
				"security",
				"firewall",
				"rules"
			] });
		},
		onError: (t) => Z(e, t)
	}), O = f({
		mutationFn: (e) => Dd(e),
		onSuccess: () => {
			h.success(e("security.ruleDeleted")), t.invalidateQueries({ queryKey: [
				"security",
				"firewall",
				"rules"
			] });
		},
		onError: (t) => Z(e, t)
	}), k = f({
		mutationFn: (e) => kd(e),
		onSuccess: () => {
			h.success(e("security.rulePromoted")), t.invalidateQueries({ queryKey: [
				"security",
				"firewall",
				"rules"
			] });
		},
		onError: (t) => Z(e, t)
	}), A = f({
		mutationFn: async () => {
			let t = {}, n = {};
			try {
				t = JSON.parse(g), n = JSON.parse(v);
			} catch {
				throw Error(e("security.invalidJson"));
			}
			return Od({
				rule: t,
				request: n
			});
		},
		onSuccess: (t) => {
			w(JSON.stringify(t, null, 2)), h.success(e("security.ruleTestDone"));
		},
		onError: (t) => Z(e, t)
	}), j = T.data?.items ?? [];
	return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ y(Zd, {}),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.createRuleTitle") }) }), /* @__PURE__ */ b(K, {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ b("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ y(Zl, {
							htmlFor: "rule-name",
							children: e("security.col.name")
						}), /* @__PURE__ */ y(Xl, {
							id: "rule-name",
							value: n,
							onChange: (e) => r(e.target.value)
						})]
					}),
					/* @__PURE__ */ b("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ y(Zl, {
							htmlFor: "rule-path",
							children: e("security.pathContains")
						}), /* @__PURE__ */ y(Xl, {
							id: "rule-path",
							value: i,
							onChange: (e) => a(e.target.value),
							placeholder: "/evil"
						})]
					}),
					/* @__PURE__ */ b("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ y(Zl, {
							htmlFor: "rule-action",
							children: e("security.col.action")
						}), /* @__PURE__ */ b(pu, {
							value: o,
							onValueChange: s,
							children: [/* @__PURE__ */ y(hu, {
								id: "rule-action",
								className: "w-full",
								children: /* @__PURE__ */ y(mu, {})
							}), /* @__PURE__ */ y(gu, { children: [
								"block",
								"challenge",
								"log",
								"allow"
							].map((t) => /* @__PURE__ */ y(_u, {
								value: t,
								children: e(`security.ruleAction.${t}`, { defaultValue: t.charAt(0).toUpperCase() + t.slice(1) })
							}, t)) })]
						})]
					}),
					/* @__PURE__ */ b("div", {
						className: "flex items-end gap-3",
						children: [/* @__PURE__ */ b("label", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ y(of, {
								checked: c,
								onCheckedChange: l
							}), e("security.learningMode")]
						}), /* @__PURE__ */ y(H, {
							disabled: E.isPending || !i,
							onClick: () => void E.mutateAsync(),
							children: e("security.createRule")
						})]
					})
				]
			})] }),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.rulesTitle") }) }), /* @__PURE__ */ y(K, {
				className: "overflow-x-auto p-0 sm:p-6",
				children: T.isPending ? /* @__PURE__ */ y("div", {
					className: "p-6",
					children: /* @__PURE__ */ y(Ql, { className: "h-48 w-full" })
				}) : j.length === 0 ? /* @__PURE__ */ b("div", {
					className: "space-y-2 p-6",
					children: [/* @__PURE__ */ y("p", {
						className: "text-sm text-muted-foreground",
						children: e("security.noRules")
					}), /* @__PURE__ */ y("p", {
						className: "text-sm text-muted-foreground",
						children: e("security.noRulesHint")
					})]
				}) : /* @__PURE__ */ b(bu, { children: [/* @__PURE__ */ y(xu, { children: /* @__PURE__ */ b(q, { children: [
					/* @__PURE__ */ y(J, { children: e("security.col.name") }),
					/* @__PURE__ */ y(J, { children: e("security.col.ruleId") }),
					/* @__PURE__ */ y(J, { children: e("security.col.action") }),
					/* @__PURE__ */ y(J, { children: e("security.col.priority") }),
					/* @__PURE__ */ y(J, { children: e("security.col.enabled") }),
					/* @__PURE__ */ y(J, {
						className: "text-right",
						children: e("security.col.actions")
					})
				] }) }), /* @__PURE__ */ y(Su, { children: j.map((t) => {
					let n = !!t.enabled, r = !!t.learning;
					return /* @__PURE__ */ b(q, { children: [
						/* @__PURE__ */ y(Y, {
							className: "font-medium",
							children: t.name || t.rule_id
						}),
						/* @__PURE__ */ y(Y, {
							className: "font-mono text-xs",
							children: t.rule_id
						}),
						/* @__PURE__ */ y(Y, { children: /* @__PURE__ */ y($, {
							variant: "outline",
							children: t.action
						}) }),
						/* @__PURE__ */ y(Y, { children: t.priority }),
						/* @__PURE__ */ y(Y, { children: /* @__PURE__ */ y(of, {
							checked: n,
							disabled: D.isPending,
							onCheckedChange: (e) => void D.mutateAsync({
								id: t.id,
								enabled: e
							}),
							"aria-label": e("security.col.enabled")
						}) }),
						/* @__PURE__ */ b(Y, {
							className: "space-x-1 text-right",
							children: [r ? /* @__PURE__ */ y(H, {
								variant: "outline",
								size: "sm",
								disabled: k.isPending,
								onClick: () => void k.mutateAsync(t.rule_id),
								children: e("security.promoteLearning")
							}) : null, /* @__PURE__ */ y(H, {
								variant: "ghost",
								size: "sm",
								disabled: O.isPending,
								onClick: () => void O.mutateAsync(t.id),
								children: e("security.delete")
							})]
						})
					] }, t.id);
				}) })] })
			})] }),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.testRuleTitle") }) }), /* @__PURE__ */ b(K, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ b("div", {
						className: "grid gap-3 md:grid-cols-2",
						children: [/* @__PURE__ */ b("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ y(Zl, {
								htmlFor: "test-rule",
								children: e("security.testRuleJson")
							}), /* @__PURE__ */ y(sf, {
								id: "test-rule",
								rows: 5,
								className: "font-mono text-xs",
								value: g,
								onChange: (e) => _(e.target.value)
							})]
						}), /* @__PURE__ */ b("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ y(Zl, {
								htmlFor: "test-req",
								children: e("security.testRequestJson")
							}), /* @__PURE__ */ y(sf, {
								id: "test-req",
								rows: 5,
								className: "font-mono text-xs",
								value: v,
								onChange: (e) => S(e.target.value)
							})]
						})]
					}),
					/* @__PURE__ */ y(H, {
						disabled: A.isPending,
						onClick: () => void A.mutateAsync(),
						children: e("security.runTest")
					}),
					C ? /* @__PURE__ */ y("pre", {
						className: "max-h-64 overflow-auto rounded-md border bg-muted/40 p-3 text-xs",
						children: C
					}) : null,
					/* @__PURE__ */ y(H, {
						asChild: !0,
						variant: "link",
						className: "px-0",
						children: /* @__PURE__ */ y(x, {
							to: "/security/firewall/live",
							children: e("security.navFirewall")
						})
					})
				]
			})] })
		]
	});
}
//#endregion
//#region ../Modules/security-module/client/pages/SecurityOverviewPage.tsx
var lf = [
	"critical",
	"high",
	"medium",
	"low",
	"info"
];
function uf(e) {
	return e >= 80 ? "text-emerald-600" : e >= 60 ? "text-amber-600" : "text-red-600";
}
function df() {
	let { t: e, i18n: t } = d(), n = p({
		queryKey: ["security", "overview"],
		queryFn: ud,
		refetchInterval: 3e4
	});
	Q(n);
	let r = p({
		queryKey: [
			"security",
			"findings",
			"open"
		],
		queryFn: () => Pd({ status: "open" })
	});
	Q(r);
	let i = p({
		queryKey: ["security", "feeds"],
		queryFn: zd
	});
	Q(i);
	let a = p({
		queryKey: ["security", "diagnostics"],
		queryFn: hd
	});
	Q(a);
	let o = p({
		queryKey: ["security", "incidents"],
		queryFn: qd,
		refetchInterval: 6e4
	});
	Q(o);
	let s = p({
		queryKey: ["security", "audit"],
		queryFn: Kd
	});
	Q(s);
	let c = n.data, l = c?.open_incidents ?? (o.data?.items ?? []).filter((e) => e.status === "open").length, u = c?.suggested_actions ?? [], f = lf.reduce((e, t) => (e[t] = (r.data?.items ?? []).filter((e) => e.severity === t).length, e), {}), m = (i.data?.feeds ?? []).filter((e) => e.last_error).length, h = a.data?.wizard === !0;
	return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ y(Zd, {}),
			h ? /* @__PURE__ */ b(U, {
				className: "border-primary/30 bg-primary/5",
				children: [/* @__PURE__ */ y(W, {
					className: "pb-2",
					children: /* @__PURE__ */ y(G, {
						className: "text-base",
						children: e("security.wizardTitle")
					})
				}), /* @__PURE__ */ b(K, {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ y("p", {
						className: "text-sm text-muted-foreground",
						children: e("security.wizardHint")
					}), /* @__PURE__ */ y(H, {
						asChild: !0,
						size: "sm",
						children: /* @__PURE__ */ y(x, {
							to: "/security/settings",
							children: e("security.wizardCta")
						})
					})]
				})]
			}) : null,
			n.isPending ? /* @__PURE__ */ y(Ql, { className: "h-32 w-full rounded-xl" }) : /* @__PURE__ */ b("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, {
						className: "pb-2",
						children: /* @__PURE__ */ y(G, {
							className: "text-sm font-medium text-muted-foreground",
							children: e("security.kpi.score")
						})
					}), /* @__PURE__ */ y(K, { children: /* @__PURE__ */ y("div", {
						className: `text-3xl font-semibold tabular-nums ${uf(c?.score ?? 0)}`,
						children: c?.score ?? 0
					}) })] }),
					/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, {
						className: "pb-2",
						children: /* @__PURE__ */ y(G, {
							className: "text-sm font-medium text-muted-foreground",
							children: e("security.kpi.blocks24h")
						})
					}), /* @__PURE__ */ y(K, { children: /* @__PURE__ */ y("div", {
						className: "text-3xl font-semibold tabular-nums",
						children: c?.blocks_24h ?? 0
					}) })] }),
					/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, {
						className: "pb-2",
						children: /* @__PURE__ */ y(G, {
							className: "text-sm font-medium text-muted-foreground",
							children: e("security.kpi.openFindings")
						})
					}), /* @__PURE__ */ y(K, { children: /* @__PURE__ */ y("div", {
						className: "text-3xl font-semibold tabular-nums",
						children: c?.open_findings ?? 0
					}) })] }),
					/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, {
						className: "pb-2",
						children: /* @__PURE__ */ y(G, {
							className: "text-sm font-medium text-muted-foreground",
							children: e("security.kpi.wafMode")
						})
					}), /* @__PURE__ */ y(K, { children: /* @__PURE__ */ y($, {
						variant: "outline",
						className: "text-sm capitalize",
						children: e(`security.wafMode.${c?.waf_mode ?? "learning"}`, { defaultValue: c?.waf_mode ?? "—" })
					}) })] })
				]
			}),
			/* @__PURE__ */ b("div", {
				className: "grid gap-3 lg:grid-cols-2",
				children: [/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.lastScanTitle") }) }), /* @__PURE__ */ y(K, {
					className: "space-y-2 text-sm",
					children: n.isPending ? /* @__PURE__ */ y(Ql, { className: "h-16 w-full" }) : c?.last_scan ? /* @__PURE__ */ b(v, { children: [
						/* @__PURE__ */ b("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ y($, {
									variant: "secondary",
									children: c.last_scan.profile
								}),
								/* @__PURE__ */ y($, {
									variant: "outline",
									children: e(`security.scanStatus.${c.last_scan.status}`, { defaultValue: c.last_scan.status })
								}),
								/* @__PURE__ */ y("span", {
									className: "text-muted-foreground",
									children: e("security.findingsCount", { count: c.last_scan.findings_count })
								})
							]
						}),
						/* @__PURE__ */ y("p", {
							className: "text-muted-foreground",
							children: ((n) => {
								if (!n) return e("security.never");
								try {
									return new Intl.DateTimeFormat(t.language, {
										dateStyle: "medium",
										timeStyle: "short"
									}).format(new Date(n));
								} catch {
									return n;
								}
							})(c.last_scan.finished_at ?? c.last_scan.created_at)
						}),
						/* @__PURE__ */ y(H, {
							asChild: !0,
							variant: "link",
							className: "h-auto p-0",
							children: /* @__PURE__ */ y(x, {
								to: `/security/scan/${c.last_scan.id}`,
								children: e("security.viewScan")
							})
						})
					] }) : /* @__PURE__ */ b("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ y("p", {
							className: "text-muted-foreground",
							children: e("security.noScanYet")
						}), /* @__PURE__ */ y(H, {
							asChild: !0,
							size: "sm",
							children: /* @__PURE__ */ y(x, {
								to: "/security/scan",
								children: e("security.startFirstScan", { defaultValue: "Run your first scan" })
							})
						})]
					})
				})] }), /* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.findingsBySeverity") }) }), /* @__PURE__ */ y(K, { children: r.isPending ? /* @__PURE__ */ y(Ql, { className: "h-16 w-full" }) : /* @__PURE__ */ y("div", {
					className: "flex flex-wrap gap-2",
					children: lf.map((t) => /* @__PURE__ */ y(x, {
						to: "/security/scan",
						className: "block",
						children: /* @__PURE__ */ b($, {
							variant: f[t] > 0 ? "destructive" : "secondary",
							className: "cursor-pointer capitalize",
							children: [
								e(`security.severity.${t}`),
								": ",
								f[t]
							]
						})
					}, t))
				}) })] })]
			}),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ b(W, {
				className: "flex flex-row items-center justify-between space-y-0",
				children: [/* @__PURE__ */ y(G, { children: e("security.feedFreshness") }), /* @__PURE__ */ y(H, {
					asChild: !0,
					variant: "ghost",
					size: "sm",
					children: /* @__PURE__ */ y(x, {
						to: "/security/settings",
						children: e("security.manageFeeds")
					})
				})]
			}), /* @__PURE__ */ y(K, { children: i.isPending ? /* @__PURE__ */ y(Ql, { className: "h-12 w-full" }) : (i.data?.feeds ?? []).length === 0 ? /* @__PURE__ */ y("p", {
				className: "text-sm text-muted-foreground",
				children: e("security.noFeeds")
			}) : /* @__PURE__ */ b("div", {
				className: "space-y-2 text-sm",
				children: [/* @__PURE__ */ y("p", {
					className: "text-muted-foreground",
					children: e("security.feedSummary", {
						total: i.data?.feeds.length ?? 0,
						stale: m
					})
				}), /* @__PURE__ */ y("ul", {
					className: "grid gap-1 sm:grid-cols-2",
					children: (i.data?.feeds ?? []).slice(0, 6).map((t) => /* @__PURE__ */ b("li", {
						className: "flex items-center justify-between gap-2 rounded-md border px-2 py-1",
						children: [/* @__PURE__ */ y("span", {
							className: "truncate font-mono text-xs",
							children: t.feed_id
						}), t.last_error ? /* @__PURE__ */ y($, {
							variant: "destructive",
							className: "shrink-0 text-xs",
							children: e("security.feedStale")
						}) : /* @__PURE__ */ y($, {
							variant: "secondary",
							className: "shrink-0 text-xs",
							children: e("security.feedOk")
						})]
					}, t.feed_id))
				})]
			}) })] }),
			/* @__PURE__ */ b("div", {
				className: "grid gap-3 lg:grid-cols-2",
				children: [/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ b(W, {
					className: "flex flex-row items-center justify-between space-y-0",
					children: [/* @__PURE__ */ y(G, { children: e("security.incidentsTitle", { defaultValue: "Open Incidents" }) }), /* @__PURE__ */ y(H, {
						asChild: !0,
						variant: "ghost",
						size: "sm",
						children: /* @__PURE__ */ y(x, {
							to: "/security/tools/incident",
							children: e("security.viewIncidents", { defaultValue: "View all" })
						})
					})]
				}), /* @__PURE__ */ b(K, { children: [o.isPending ? /* @__PURE__ */ y(Ql, { className: "h-12 w-full" }) : /* @__PURE__ */ b("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ y("span", {
						className: `text-3xl font-semibold tabular-nums ${l > 0 ? "text-red-600" : "text-emerald-600"}`,
						children: l
					}), /* @__PURE__ */ y("span", {
						className: "text-sm text-muted-foreground",
						children: l === 1 ? e("security.incidentOpen", { defaultValue: "open incident" }) : e("security.incidentsOpen", { defaultValue: "open incidents" })
					})]
				}), (o.data?.items ?? []).slice(0, 3).map((e) => /* @__PURE__ */ b("div", {
					className: "mt-2 flex items-center justify-between gap-2 rounded-md border px-2 py-1 text-sm",
					children: [/* @__PURE__ */ y("span", {
						className: "truncate",
						children: e.title ?? `Incident #${e.id}`
					}), /* @__PURE__ */ y($, {
						variant: e.severity === "critical" ? "destructive" : "secondary",
						className: "shrink-0 text-xs capitalize",
						children: e.severity ?? "unknown"
					})]
				}, e.id))] })] }), /* @__PURE__ */ b(U, { children: [/* @__PURE__ */ b(W, {
					className: "flex flex-row items-center justify-between space-y-0",
					children: [/* @__PURE__ */ y(G, { children: e("security.suggestedActions", { defaultValue: "Suggested Actions" }) }), /* @__PURE__ */ y(H, {
						asChild: !0,
						variant: "ghost",
						size: "sm",
						children: /* @__PURE__ */ y(x, {
							to: "/security/tools/heal-wizard",
							children: e("security.healWizard", { defaultValue: "Heal Wizard" })
						})
					})]
				}), /* @__PURE__ */ y(K, { children: n.isPending ? /* @__PURE__ */ y(Ql, { className: "h-12 w-full" }) : u.length === 0 ? /* @__PURE__ */ y("p", {
					className: "text-sm text-emerald-600",
					children: e("security.noActions", { defaultValue: "No immediate actions required." })
				}) : /* @__PURE__ */ y("ul", {
					className: "space-y-1",
					children: u.map((e, t) => /* @__PURE__ */ b("li", {
						className: "flex items-start gap-2 text-sm",
						children: [/* @__PURE__ */ y("span", { className: "mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" }), /* @__PURE__ */ y("span", { children: e })]
					}, t))
				}) })] })]
			}),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, {
				className: "flex flex-row items-center justify-between space-y-0",
				children: /* @__PURE__ */ y(G, { children: e("security.auditTitle", { defaultValue: "Audit log" }) })
			}), /* @__PURE__ */ y(K, { children: s.isPending ? /* @__PURE__ */ y(Ql, { className: "h-24 w-full" }) : (s.data?.items ?? []).length === 0 ? /* @__PURE__ */ b("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ y("p", {
					className: "text-sm text-muted-foreground",
					children: e("security.auditEmpty", { defaultValue: "No audit events yet." })
				}), /* @__PURE__ */ y(H, {
					asChild: !0,
					size: "sm",
					variant: "outline",
					children: /* @__PURE__ */ y(x, {
						to: "/security/settings",
						children: e("security.auditEmptyCta", { defaultValue: "Configure security settings" })
					})
				})]
			}) : /* @__PURE__ */ y("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ b(bu, { children: [/* @__PURE__ */ y(xu, { children: /* @__PURE__ */ b(q, { children: [
					/* @__PURE__ */ y(J, { children: e("security.col.time") }),
					/* @__PURE__ */ y(J, { children: e("security.col.action") }),
					/* @__PURE__ */ y(J, { children: e("security.col.path") }),
					/* @__PURE__ */ y(J, { children: e("security.col.user", { defaultValue: "User" }) })
				] }) }), /* @__PURE__ */ y(Su, { children: (s.data?.items ?? []).slice(0, 10).map((e, t) => /* @__PURE__ */ b(q, { children: [
					/* @__PURE__ */ y(Y, {
						className: "text-xs",
						children: String(e.created_at ?? "—")
					}),
					/* @__PURE__ */ y(Y, { children: /* @__PURE__ */ y($, {
						variant: "outline",
						className: "text-xs",
						children: String(e.action ?? e.event ?? "—")
					}) }),
					/* @__PURE__ */ y(Y, {
						className: "max-w-[200px] truncate font-mono text-xs",
						children: String(e.object_id ?? e.path ?? "—")
					}),
					/* @__PURE__ */ y(Y, {
						className: "text-xs",
						children: String(e.user_login ?? e.user_id ?? "—")
					})
				] }, String(e.id ?? t))) })] })
			}) })] }),
			/* @__PURE__ */ b("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ y(H, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ y(x, {
							to: "/security/firewall",
							children: e("security.navFirewall")
						})
					}),
					/* @__PURE__ */ y(H, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ y(x, {
							to: "/security/scan",
							children: e("security.navScan")
						})
					}),
					/* @__PURE__ */ y(H, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ y(x, {
							to: "/security/reports",
							children: e("security.navReports")
						})
					}),
					/* @__PURE__ */ y(H, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ y(x, {
							to: "/security/settings",
							children: e("security.navSettings")
						})
					})
				]
			})
		]
	});
}
//#endregion
//#region ../Modules/security-module/client/pages/SecurityReportDetailPage.tsx
function ff({ payload: e }) {
	let { t } = d();
	if (!e || typeof e != "object") return null;
	let n = e, r = typeof n.title == "string" ? n.title : null, i = typeof n.score == "number" ? n.score : null, a = n.summary, o = Array.isArray(a) ? a.map(String) : typeof a == "string" ? [a] : [], s = Array.isArray(n.sections) ? n.sections : [], c = new Set([
		"title",
		"score",
		"summary",
		"sections"
	]), l = Object.keys(n).filter((e) => !c.has(e));
	return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [
			(r || i !== null) && /* @__PURE__ */ b("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [r ? /* @__PURE__ */ y("p", {
					className: "text-base font-semibold",
					children: r
				}) : null, i === null ? null : /* @__PURE__ */ b($, {
					variant: "outline",
					children: [
						t("security.kpi.score"),
						": ",
						i
					]
				})]
			}),
			o.length > 0 && /* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y("p", {
				className: "mb-1 text-sm font-medium",
				children: t("security.reportSummary", { defaultValue: "Summary" })
			}), /* @__PURE__ */ y("ul", {
				className: "space-y-1",
				children: o.map((e, t) => /* @__PURE__ */ b("li", {
					className: "flex items-start gap-2 text-sm",
					children: [/* @__PURE__ */ y("span", { className: "mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" }), /* @__PURE__ */ y("span", { children: e })]
				}, t))
			})] }),
			s.map((e, t) => {
				let n = typeof e.title == "string" ? e.title : `Section ${t + 1}`, r = Array.isArray(e.items) ? e.items : [];
				return /* @__PURE__ */ b("div", {
					className: "rounded-md border p-3",
					children: [/* @__PURE__ */ y("p", {
						className: "mb-2 text-sm font-medium",
						children: n
					}), r.length > 0 ? /* @__PURE__ */ y("ul", {
						className: "space-y-1",
						children: r.map((e, t) => /* @__PURE__ */ y("li", {
							className: "text-sm text-muted-foreground",
							children: typeof e == "object" ? JSON.stringify(e) : String(e)
						}, t))
					}) : /* @__PURE__ */ y("pre", {
						className: "text-xs text-muted-foreground",
						children: JSON.stringify(e, null, 2)
					})]
				}, t);
			}),
			l.map((e) => /* @__PURE__ */ b("div", {
				className: "rounded-md border p-3",
				children: [/* @__PURE__ */ y("p", {
					className: "mb-1 text-xs font-medium capitalize text-muted-foreground",
					children: e.replace(/_/g, " ")
				}), Array.isArray(n[e]) ? /* @__PURE__ */ y("ul", {
					className: "space-y-1",
					children: n[e].map((e, t) => /* @__PURE__ */ y("li", {
						className: "text-sm",
						children: typeof e == "object" ? JSON.stringify(e) : String(e)
					}, t))
				}) : /* @__PURE__ */ y("p", {
					className: "text-sm",
					children: String(n[e])
				})]
			}, e))
		]
	});
}
function pf() {
	let { t: e, i18n: t } = d(), { reportid: n } = C(), r = Number(n), i = p({
		queryKey: [
			"security",
			"report",
			r
		],
		queryFn: () => Gd(r),
		enabled: Number.isFinite(r) && r > 0
	});
	if (Q(i), !Number.isFinite(r) || r <= 0) return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ y(Zd, {}), /* @__PURE__ */ y("p", {
			className: "text-sm text-muted-foreground",
			children: e("security.invalidReportId")
		})]
	});
	let a = i.data;
	return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ y(Zd, {}),
			/* @__PURE__ */ y(H, {
				asChild: !0,
				variant: "ghost",
				size: "sm",
				children: /* @__PURE__ */ y(x, {
					to: "/security/reports",
					children: e("security.backToReports")
				})
			}),
			i.isPending ? /* @__PURE__ */ y(Ql, { className: "h-64 w-full rounded-xl" }) : a ? /* @__PURE__ */ b(v, { children: [
				/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: a.title || e("security.reportDetailTitle") }) }), /* @__PURE__ */ b(K, {
					className: "flex flex-wrap items-center gap-2 text-sm",
					children: [
						/* @__PURE__ */ y($, {
							variant: "secondary",
							children: e(`security.reportType.${a.report_type}`, { defaultValue: a.report_type })
						}),
						/* @__PURE__ */ b($, {
							variant: "outline",
							children: [
								e("security.kpi.score"),
								": ",
								a.score
							]
						}),
						/* @__PURE__ */ y("span", {
							className: "text-muted-foreground",
							children: ((e) => {
								try {
									return new Intl.DateTimeFormat(t.language, {
										dateStyle: "full",
										timeStyle: "short"
									}).format(new Date(e));
								} catch {
									return e;
								}
							})(a.created_at)
						}),
						/* @__PURE__ */ y(H, {
							size: "sm",
							variant: "outline",
							onClick: () => {
								if (!a) return;
								let e = new Blob([JSON.stringify(a.payload ?? a, null, 2)], { type: "application/json" }), t = URL.createObjectURL(e), n = document.createElement("a");
								n.href = t, n.download = `webino-report-${r}.json`, n.click(), URL.revokeObjectURL(t);
							},
							children: e("security.reportDownload", { defaultValue: "Download JSON" })
						})
					]
				})] }),
				a.payload && typeof a.payload == "object" && /* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.reportStructured", { defaultValue: "Report details" }) }) }), /* @__PURE__ */ y(K, { children: /* @__PURE__ */ y(ff, { payload: a.payload }) })] }),
				/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.reportPayload") }) }), /* @__PURE__ */ y(K, { children: /* @__PURE__ */ b("details", { children: [/* @__PURE__ */ y("summary", {
					className: "cursor-pointer text-sm text-muted-foreground",
					children: e("security.reportRawJson", { defaultValue: "Show raw JSON" })
				}), /* @__PURE__ */ y("pre", {
					className: "mt-2 max-h-[560px] overflow-auto rounded-md border bg-muted/40 p-3 text-xs",
					children: JSON.stringify(a.payload ?? a, null, 2)
				})] }) })] })
			] }) : /* @__PURE__ */ y("p", {
				className: "text-sm text-muted-foreground",
				children: e("security.reportNotFound")
			})
		]
	});
}
//#endregion
//#region ../Modules/security-module/client/pages/SecurityReportsPage.tsx
function mf() {
	let { t: e, i18n: t } = d(), n = m(), r = p({
		queryKey: ["security", "reports"],
		queryFn: Ud
	});
	Q(r);
	let i = f({
		mutationFn: (e) => Wd(e),
		onSuccess: () => {
			h.success(e("security.reportGenerated")), n.invalidateQueries({ queryKey: ["security", "reports"] });
		},
		onError: (t) => Z(e, t)
	}), a = (e) => {
		try {
			return new Intl.DateTimeFormat(t.language, {
				dateStyle: "medium",
				timeStyle: "short"
			}).format(new Date(e));
		} catch {
			return e;
		}
	};
	return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ y(Zd, {}),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.generateReport") }) }), /* @__PURE__ */ y(K, {
				className: "flex flex-wrap gap-2",
				children: ld.map((t) => /* @__PURE__ */ y(H, {
					variant: "outline",
					size: "sm",
					disabled: i.isPending,
					onClick: () => void i.mutateAsync(t),
					children: e(`security.reportType.${t}`)
				}, t))
			})] }),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.generatedReports") }) }), /* @__PURE__ */ y(K, {
				className: "overflow-x-auto",
				children: r.isPending ? /* @__PURE__ */ y(Ql, { className: "h-48 w-full" }) : (r.data?.items ?? []).length === 0 ? /* @__PURE__ */ y("p", {
					className: "text-sm text-muted-foreground",
					children: e("security.noReports")
				}) : /* @__PURE__ */ b(bu, { children: [/* @__PURE__ */ y(xu, { children: /* @__PURE__ */ b(q, { children: [
					/* @__PURE__ */ y(J, { children: "#" }),
					/* @__PURE__ */ y(J, { children: e("security.col.type") }),
					/* @__PURE__ */ y(J, { children: e("security.col.title") }),
					/* @__PURE__ */ y(J, { children: e("security.kpi.score") }),
					/* @__PURE__ */ y(J, { children: e("security.col.created") }),
					/* @__PURE__ */ y(J, {
						className: "text-right",
						children: e("security.col.actions")
					})
				] }) }), /* @__PURE__ */ y(Su, { children: (r.data?.items ?? []).map((t) => /* @__PURE__ */ b(q, { children: [
					/* @__PURE__ */ y(Y, { children: t.id }),
					/* @__PURE__ */ y(Y, { children: /* @__PURE__ */ y($, {
						variant: "secondary",
						children: t.report_type
					}) }),
					/* @__PURE__ */ y(Y, { children: t.title }),
					/* @__PURE__ */ y(Y, { children: t.score }),
					/* @__PURE__ */ y(Y, {
						className: "text-xs",
						children: a(t.created_at)
					}),
					/* @__PURE__ */ y(Y, {
						className: "text-right",
						children: /* @__PURE__ */ y(H, {
							asChild: !0,
							variant: "link",
							size: "sm",
							className: "h-auto p-0",
							children: /* @__PURE__ */ y(x, {
								to: `/security/reports/${t.id}`,
								children: e("security.view")
							})
						})
					})
				] }, t.id)) })] })
			})] })
		]
	});
}
//#endregion
//#region src/components/ui/checkbox.tsx
function hf({ className: e, ...t }) {
	return /* @__PURE__ */ y(Gn, {
		"data-slot": "checkbox",
		className: V("peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary", e),
		...t,
		children: /* @__PURE__ */ y(qn, {
			"data-slot": "checkbox-indicator",
			className: "grid place-content-center text-current transition-none",
			children: /* @__PURE__ */ y(lu, { className: "size-3.5" })
		})
	});
}
//#endregion
//#region ../Modules/security-module/client/pages/SecurityScanJobPage.tsx
function gf(e) {
	return e === "critical" || e === "high" ? "destructive" : e === "medium" ? "secondary" : "outline";
}
function _f(e) {
	let t = e.path_or_object || "";
	return t ? e.category === "integrity" || t.startsWith("wp-includes/") || t.startsWith("wp-admin/") ? {
		type: "restore_core_file",
		path: t,
		target: t
	} : t.includes("wp-content/plugins/") ? {
		type: "restore_plugin_file",
		slug: t.match(/wp-content\/plugins\/([^/]+)\//)?.[1] ?? "",
		path: t.replace(/^.*wp-content\/plugins\/[^/]+\//, ""),
		target: t
	} : {
		type: "quarantine_file",
		path: t,
		target: t
	} : null;
}
function vf() {
	let { t: e } = d(), { jobid: t } = C(), n = Number(t), r = m(), [i, a] = u([]), [o, s] = u(null), [l, g] = u(""), [_, v] = u(null), S = p({
		queryKey: [
			"security",
			"scan",
			n
		],
		queryFn: () => Md(n),
		enabled: Number.isFinite(n) && n > 0,
		refetchInterval: (e) => e.state.data?.status === "running" || e.state.data?.status === "queued" ? 3e3 : !1
	});
	Q(S);
	let w = p({
		queryKey: [
			"security",
			"findings",
			"scan",
			n
		],
		queryFn: () => Pd({
			status: "open",
			scan_id: n
		}),
		enabled: Number.isFinite(n) && n > 0
	});
	Q(w);
	let T = c(() => w.data?.items ?? [], [w.data?.items]), E = f({
		mutationFn: ({ findingId: e, status: t }) => Fd(e, t),
		onSuccess: () => {
			h.success(e("security.findingUpdated")), r.invalidateQueries({ queryKey: ["security", "findings"] }), r.invalidateQueries({ queryKey: [
				"security",
				"scan",
				n
			] });
		},
		onError: (t) => Z(e, t)
	}), D = f({
		mutationFn: async () => {
			let t = T.filter((e) => i.includes(e.id)).map(_f).filter(Boolean);
			if (t.length === 0) throw Error(e("security.healSelectFinding"));
			return Id(t);
		},
		onSuccess: (t) => {
			s(JSON.stringify(t, null, 2)), g(String(t.token ?? "")), h.success(e("security.healPreviewDone"));
		},
		onError: (t) => Z(e, t)
	}), O = f({
		mutationFn: async () => Ld({
			confirmation_token: l,
			actions: T.filter((e) => i.includes(e.id)).map(_f).filter(Boolean)
		}),
		onSuccess: (t) => {
			h.success(e("security.healApplied"));
			let n = (t.results ?? []).map((e) => e.snapshot_id).find((e) => typeof e == "number" && e > 0);
			n && v(n), g(""), r.invalidateQueries({ queryKey: ["security", "findings"] });
		},
		onError: (t) => Z(e, t)
	}), k = f({
		mutationFn: () => {
			if (!_) throw Error(e("security.healNoSnapshot"));
			return Rd(_);
		},
		onSuccess: () => {
			h.success(e("security.healRolledBack")), v(null);
		},
		onError: (t) => Z(e, t)
	}), A = (e, t) => {
		a((n) => t ? [...n, e] : n.filter((t) => t !== e));
	};
	if (!Number.isFinite(n) || n <= 0) return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ y(Zd, {}), /* @__PURE__ */ y("p", {
			className: "text-sm text-muted-foreground",
			children: e("security.invalidScanId")
		})]
	});
	let j = S.data;
	return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ y(Zd, {}),
			S.isPending ? /* @__PURE__ */ y(Ql, { className: "h-32 w-full rounded-xl" }) : j ? /* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ b(G, { children: [
				e("security.scanJobTitle"),
				" #",
				j.id
			] }) }), /* @__PURE__ */ b(K, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ b("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ y($, {
								variant: "secondary",
								children: j.profile
							}),
							/* @__PURE__ */ y($, {
								variant: "outline",
								children: e(`security.scanStatus.${j.status}`, { defaultValue: j.status })
							}),
							/* @__PURE__ */ y("span", {
								className: "text-sm text-muted-foreground",
								children: e("security.findingsCount", { count: j.findings_count })
							})
						]
					}),
					/* @__PURE__ */ b("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ b("div", {
							className: "flex justify-between text-sm",
							children: [/* @__PURE__ */ y("span", { children: e("security.col.progress") }), /* @__PURE__ */ b("span", { children: [j.progress_pct, "%"] })]
						}), /* @__PURE__ */ y("div", {
							className: "h-2 overflow-hidden rounded-full bg-muted",
							children: /* @__PURE__ */ y("div", {
								className: "h-full bg-primary transition-all",
								style: { width: `${Math.min(100, Math.max(0, j.progress_pct))}%` }
							})
						})]
					}),
					j.current_path ? /* @__PURE__ */ y("p", {
						className: "truncate font-mono text-xs text-muted-foreground",
						children: j.current_path
					}) : null
				]
			})] }) : /* @__PURE__ */ y("p", {
				className: "text-sm text-muted-foreground",
				children: e("security.scanNotFound")
			}),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.findingsTitle") }) }), /* @__PURE__ */ y(K, {
				className: "overflow-x-auto",
				children: w.isPending ? /* @__PURE__ */ y(Ql, { className: "h-48 w-full" }) : T.length === 0 ? /* @__PURE__ */ b("div", {
					className: "space-y-3 py-2",
					children: [
						/* @__PURE__ */ y("p", {
							className: "text-sm text-emerald-600",
							children: e("security.noFindings")
						}),
						/* @__PURE__ */ y("p", {
							className: "text-sm text-muted-foreground",
							children: e("security.noFindingsHint", { defaultValue: "This scan found no issues. You can run another scan at any time." })
						}),
						/* @__PURE__ */ y(H, {
							asChild: !0,
							size: "sm",
							variant: "outline",
							children: /* @__PURE__ */ y(x, {
								to: "/security/scan",
								children: e("security.backToScan", { defaultValue: "Back to scans" })
							})
						})
					]
				}) : /* @__PURE__ */ b(bu, { children: [/* @__PURE__ */ y(xu, { children: /* @__PURE__ */ b(q, { children: [
					/* @__PURE__ */ y(J, { className: "w-10" }),
					/* @__PURE__ */ y(J, { children: e("security.col.severity") }),
					/* @__PURE__ */ y(J, { children: e("security.col.title") }),
					/* @__PURE__ */ y(J, { children: e("security.col.path") }),
					/* @__PURE__ */ y(J, { children: e("security.col.status") }),
					/* @__PURE__ */ y(J, {
						className: "text-right",
						children: e("security.col.actions")
					})
				] }) }), /* @__PURE__ */ y(Su, { children: T.map((t) => {
					let n = !!t.auto_heal_available;
					return /* @__PURE__ */ b(q, { children: [
						/* @__PURE__ */ y(Y, { children: /* @__PURE__ */ y(hf, {
							checked: i.includes(t.id),
							disabled: !n,
							onCheckedChange: (e) => A(t.id, !!e),
							"aria-label": n ? e("security.healSelectFinding") : e("security.healNotAvailable", { defaultValue: "Auto-heal not available" }),
							title: n ? void 0 : e("security.healNotAvailable", { defaultValue: "Auto-heal not available for this finding" })
						}) }),
						/* @__PURE__ */ y(Y, { children: /* @__PURE__ */ y($, {
							variant: gf(t.severity),
							className: "capitalize",
							children: e(`security.severity.${t.severity}`, { defaultValue: t.severity })
						}) }),
						/* @__PURE__ */ y(Y, {
							className: "max-w-[200px] truncate",
							children: t.title
						}),
						/* @__PURE__ */ y(Y, {
							className: "max-w-[180px] truncate font-mono text-xs",
							children: t.path_or_object
						}),
						/* @__PURE__ */ y(Y, { children: t.status }),
						/* @__PURE__ */ b(Y, {
							className: "space-x-1 text-right",
							children: [/* @__PURE__ */ y(H, {
								variant: "outline",
								size: "sm",
								disabled: E.isPending,
								onClick: () => void E.mutateAsync({
									findingId: t.id,
									status: "acknowledged"
								}),
								children: e("security.ackFinding")
							}), /* @__PURE__ */ y(H, {
								variant: "ghost",
								size: "sm",
								disabled: E.isPending,
								onClick: () => void E.mutateAsync({
									findingId: t.id,
									status: "ignored"
								}),
								children: e("security.ignoreFinding")
							})]
						})
					] }, t.id);
				}) })] })
			})] }),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.healTitle") }) }), /* @__PURE__ */ b(K, {
				className: "space-y-3",
				children: [/* @__PURE__ */ b("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ y(H, {
							variant: "outline",
							disabled: D.isPending || i.length === 0,
							onClick: () => void D.mutateAsync(),
							children: e("security.healPreview")
						}),
						/* @__PURE__ */ y(H, {
							disabled: O.isPending || !l,
							onClick: () => void O.mutateAsync(),
							children: e("security.healApply")
						}),
						/* @__PURE__ */ y(H, {
							variant: "secondary",
							disabled: k.isPending || !_,
							onClick: () => void k.mutateAsync(),
							children: e("security.healRollback")
						})
					]
				}), o ? /* @__PURE__ */ y("pre", {
					className: "max-h-48 overflow-auto rounded-md border bg-muted/40 p-3 text-xs",
					children: o
				}) : /* @__PURE__ */ y("p", {
					className: "text-sm text-muted-foreground",
					children: e("security.healSelectFinding")
				})]
			})] })
		]
	});
}
//#endregion
//#region ../Modules/security-module/client/pages/SecurityScanPage.tsx
var yf = [
	"quick",
	"standard",
	"deep"
];
function bf() {
	let { t: e, i18n: t } = d(), n = m(), r = p({
		queryKey: ["security", "scans"],
		queryFn: Ad,
		refetchInterval: (e) => (e.state.data?.items ?? []).some((e) => e.status === "queued" || e.status === "running") ? 3e3 : !1
	});
	Q(r);
	let i = f({
		mutationFn: (e) => jd(e),
		onSuccess: (t) => {
			h.success(e("security.scanStarted")), n.invalidateQueries({ queryKey: ["security", "scans"] }), t.id && (window.location.hash = "");
		},
		onError: (t) => Z(e, t)
	}), a = f({
		mutationFn: (e) => Nd(e),
		onSuccess: () => {
			h.success(e("security.scanCancelled")), n.invalidateQueries({ queryKey: ["security", "scans"] });
		},
		onError: (t) => Z(e, t)
	}), o = (e) => {
		if (!e) return "—";
		try {
			return new Intl.DateTimeFormat(t.language, {
				dateStyle: "medium",
				timeStyle: "short"
			}).format(new Date(e));
		} catch {
			return e;
		}
	}, s = r.data?.items ?? [];
	return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ y(Zd, {}),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.startScan") }) }), /* @__PURE__ */ y(K, {
				className: "flex flex-wrap gap-2",
				children: yf.map((t) => /* @__PURE__ */ y(H, {
					variant: "outline",
					disabled: i.isPending,
					onClick: () => void i.mutateAsync(t),
					children: e(`security.scanProfile.${t}`)
				}, t))
			})] }),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.scheduleNoteTitle") }) }), /* @__PURE__ */ y(K, {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ y("p", {
					className: "text-sm text-muted-foreground",
					children: e("security.scheduleNote")
				})
			})] }),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.scanJobs") }) }), /* @__PURE__ */ y(K, {
				className: "overflow-x-auto",
				children: r.isPending ? /* @__PURE__ */ y(Ql, { className: "h-48 w-full" }) : s.length === 0 ? /* @__PURE__ */ y("p", {
					className: "text-sm text-muted-foreground",
					children: e("security.noScans")
				}) : /* @__PURE__ */ b(bu, { children: [/* @__PURE__ */ y(xu, { children: /* @__PURE__ */ b(q, { children: [
					/* @__PURE__ */ y(J, { children: "#" }),
					/* @__PURE__ */ y(J, { children: e("security.col.profile") }),
					/* @__PURE__ */ y(J, { children: e("security.col.status") }),
					/* @__PURE__ */ y(J, { children: e("security.col.progress") }),
					/* @__PURE__ */ y(J, { children: e("security.col.findings") }),
					/* @__PURE__ */ y(J, { children: e("security.col.started") }),
					/* @__PURE__ */ y(J, {
						className: "text-right",
						children: e("security.col.actions")
					})
				] }) }), /* @__PURE__ */ y(Su, { children: s.map((t) => /* @__PURE__ */ b(q, { children: [
					/* @__PURE__ */ y(Y, { children: t.id }),
					/* @__PURE__ */ y(Y, { children: /* @__PURE__ */ y($, {
						variant: "secondary",
						children: t.profile
					}) }),
					/* @__PURE__ */ y(Y, { children: e(`security.scanStatus.${t.status}`, { defaultValue: t.status }) }),
					/* @__PURE__ */ b(Y, { children: [t.progress_pct, "%"] }),
					/* @__PURE__ */ y(Y, { children: t.findings_count }),
					/* @__PURE__ */ y(Y, {
						className: "text-xs",
						children: o(t.started_at ?? t.created_at)
					}),
					/* @__PURE__ */ b(Y, {
						className: "space-x-1 text-right",
						children: [/* @__PURE__ */ y(H, {
							asChild: !0,
							variant: "link",
							size: "sm",
							className: "h-auto p-0",
							children: /* @__PURE__ */ y(x, {
								to: `/security/scan/${t.id}`,
								children: e("security.view")
							})
						}), t.status === "running" || t.status === "queued" ? /* @__PURE__ */ y(H, {
							variant: "ghost",
							size: "sm",
							disabled: a.isPending,
							onClick: () => void a.mutateAsync(t.id),
							children: e("security.cancel")
						}) : null]
					})
				] }, t.id)) })] })
			})] })
		]
	});
}
//#endregion
//#region ../Modules/security-module/client/pages/SecuritySettingsPage.tsx
function xf({ id: e, label: t, hint: n, checked: r, onCheckedChange: i }) {
	return /* @__PURE__ */ b("div", {
		className: "flex max-w-lg items-center justify-between gap-3",
		children: [/* @__PURE__ */ b("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ y(Zl, {
				htmlFor: e,
				className: "cursor-pointer font-normal",
				children: t
			}), n ? /* @__PURE__ */ y("p", {
				className: "text-muted-foreground text-xs",
				children: n
			}) : null]
		}), /* @__PURE__ */ y(of, {
			id: e,
			checked: r,
			onCheckedChange: i
		})]
	});
}
function Sf(e, t, n, r) {
	return {
		...e,
		[t]: {
			...e[t] ?? {},
			[n]: r
		}
	};
}
function Cf(e, t, n, r) {
	return {
		...e,
		[t]: {
			...e[t] ?? {},
			[n]: r
		}
	};
}
function wf() {
	let { t: e } = d(), t = m(), [n, r] = u(null), [i, a] = u("recommended"), [s, c] = u(""), [l, g] = u(null), [_, v] = u(1), S = p({
		queryKey: ["security", "settings"],
		queryFn: dd
	});
	Q(S);
	let C = p({
		queryKey: [
			"security",
			"settings",
			"schema"
		],
		queryFn: md
	});
	Q(C);
	let w = p({
		queryKey: ["security", "diagnostics"],
		queryFn: hd
	});
	Q(w);
	let T = p({
		queryKey: ["security", "feeds"],
		queryFn: zd
	});
	Q(T);
	let E = p({
		queryKey: ["security", "2fa"],
		queryFn: Jd
	});
	Q(E), o(() => {
		if (S.data && !n) {
			r(S.data);
			let e = S.data.general?.profile;
			typeof e == "string" && a(e);
		}
	}, [S.data, n]);
	let D = f({
		mutationFn: () => fd(n ?? {}),
		onSuccess: (n) => {
			r(n), h.success(e("security.settingsSaved")), t.invalidateQueries({ queryKey: ["security"] });
		},
		onError: (t) => Z(e, t)
	}), O = f({
		mutationFn: () => pd(i),
		onSuccess: (n) => {
			r(n), h.success(e("security.profileApplied")), t.invalidateQueries({ queryKey: ["security"] });
		},
		onError: (t) => Z(e, t)
	}), k = f({
		mutationFn: Bd,
		onSuccess: () => {
			h.success(e("security.feedsSynced")), t.invalidateQueries({ queryKey: ["security", "feeds"] });
		},
		onError: (t) => Z(e, t)
	}), A = f({
		mutationFn: () => fd({ general: { wizard_completed: !0 } }),
		onSuccess: () => {
			h.success(e("security.wizardCompleted")), t.invalidateQueries({ queryKey: ["security"] });
		},
		onError: (t) => Z(e, t)
	}), j = f({
		mutationFn: () => Yd({ action: "setup" }),
		onSuccess: (n) => {
			g(String(n.secret ?? n.otpauth ?? "")), h.success(e("security.twoFaSetupReady")), t.invalidateQueries({ queryKey: ["security", "2fa"] });
		},
		onError: (t) => Z(e, t)
	}), M = f({
		mutationFn: () => Yd({
			action: "enable",
			code: s
		}),
		onSuccess: () => {
			h.success(e("security.twoFaEnabled")), c(""), g(null), t.invalidateQueries({ queryKey: ["security", "2fa"] });
		},
		onError: (t) => Z(e, t)
	}), ee = f({
		mutationFn: () => Yd({ action: "disable" }),
		onSuccess: () => {
			h.success(e("security.twoFaDisabled")), t.invalidateQueries({ queryKey: ["security", "2fa"] });
		},
		onError: (t) => Z(e, t)
	}), N = n, te = w.data?.wizard === !0;
	if (S.isPending || !N) return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ y(Zd, {}), /* @__PURE__ */ y(Ql, { className: "h-96 w-full rounded-xl" })]
	});
	let P = N.general ?? {}, ne = N.privacy ?? {}, F = N.waf ?? {}, re = N.login ?? {}, ie = N.headers ?? {}, I = N.scan ?? {}, ae = N.heal ?? {}, oe = N.feeds ?? {}, se = N.notify ?? {};
	return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ y(Zd, {}),
			te ? /* @__PURE__ */ b(U, {
				className: "border-primary/30 bg-primary/5",
				children: [/* @__PURE__ */ b(W, {
					className: "pb-2",
					children: [/* @__PURE__ */ y(G, {
						className: "text-base",
						children: e("security.wizardTitle")
					}), /* @__PURE__ */ y(Yl, { children: e("security.wizardStep", {
						defaultValue: "Step {{step}} of {{total}}",
						step: _,
						total: 6
					}) })]
				}), /* @__PURE__ */ b(K, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ y("div", {
							className: "flex gap-1.5",
							children: Array.from({ length: 6 }, (e, t) => t + 1).map((e) => /* @__PURE__ */ y("div", { className: `h-1.5 flex-1 rounded-full transition-colors ${e < _ ? "bg-primary" : e === _ ? "bg-primary/70" : "bg-muted"}` }, e))
						}),
						_ === 1 && /* @__PURE__ */ b("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ y("p", {
									className: "text-sm font-medium",
									children: e("security.wizard.step1.title", { defaultValue: "Allowlist your admin IP" })
								}),
								/* @__PURE__ */ y("p", {
									className: "text-sm text-muted-foreground",
									children: e("security.wizard.step1.hint", { defaultValue: "Before enabling enforce mode, add your current IP to the allowlist to avoid locking yourself out." })
								}),
								/* @__PURE__ */ y(H, {
									asChild: !0,
									size: "sm",
									variant: "outline",
									children: /* @__PURE__ */ y(x, {
										to: "/security/firewall/blocking",
										children: e("security.wizard.step1.cta", { defaultValue: "Go to blocking / allowlist" })
									})
								})
							]
						}),
						_ === 2 && /* @__PURE__ */ b("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ y("p", {
									className: "text-sm font-medium",
									children: e("security.wizard.step2.title", { defaultValue: "Choose a security profile" })
								}),
								/* @__PURE__ */ y("p", {
									className: "text-sm text-muted-foreground",
									children: e("security.wizard.step2.hint", { defaultValue: "Select the profile that best fits your site and click \"Apply profile\" below." })
								}),
								/* @__PURE__ */ y("p", {
									className: "text-xs text-muted-foreground",
									children: e("security.wizard.step2.profiles", { defaultValue: "Beginner → low friction · Recommended → balanced · Store → e-commerce hardened · Paranoid → maximum" })
								})
							]
						}),
						_ === 3 && /* @__PURE__ */ b("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ y("p", {
									className: "text-sm font-medium",
									children: e("security.wizard.step3.title", { defaultValue: "Scan schedule" })
								}),
								/* @__PURE__ */ y("p", {
									className: "text-sm text-muted-foreground",
									children: e("security.wizard.step3.hint", { defaultValue: "Run a first scan now to establish a baseline, then configure automatic scans via WP-Cron." })
								}),
								/* @__PURE__ */ y(H, {
									asChild: !0,
									size: "sm",
									variant: "outline",
									children: /* @__PURE__ */ y(x, {
										to: "/security/scan",
										children: e("security.wizard.step3.cta", { defaultValue: "Run a scan now" })
									})
								})
							]
						}),
						_ === 4 && /* @__PURE__ */ b("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ y("p", {
									className: "text-sm font-medium",
									children: e("security.wizard.step4.title", { defaultValue: "Enable notifications" })
								}),
								/* @__PURE__ */ y("p", {
									className: "text-sm text-muted-foreground",
									children: e("security.wizard.step4.hint", { defaultValue: "Configure email or dashboard alerts for security events. Settings are in the Notifications section below." })
								}),
								/* @__PURE__ */ y("div", {
									className: "flex flex-wrap gap-2",
									children: [{
										key: "email",
										label: e("security.notify.email")
									}, {
										key: "site",
										label: e("security.notify.site")
									}].map(({ key: e, label: t }) => /* @__PURE__ */ b("label", {
										className: "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm cursor-pointer",
										children: [/* @__PURE__ */ y("input", {
											type: "checkbox",
											checked: !!(N?.notify ?? {})[e],
											onChange: (t) => N && r(Sf(N, "notify", e, t.target.checked)),
											className: "accent-primary"
										}), t]
									}, e))
								})
							]
						}),
						_ === 5 && /* @__PURE__ */ b("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ y("p", {
								className: "text-sm font-medium",
								children: e("security.wizard.step5.title", { defaultValue: "Coexistence check" })
							}), (w.data?.conflicts ?? []).length > 0 ? /* @__PURE__ */ b("div", {
								className: "rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800",
								children: [
									e("security.wizard.step5.conflicts", { defaultValue: "Conflicting plugins detected:" }),
									" ",
									(w.data?.conflicts ?? []).map((e) => e.plugin).join(", "),
									". ",
									e("security.wizard.step5.conflictHint", { defaultValue: "Disable duplicate WAF rules in those plugins before enabling enforce mode." })
								]
							}) : /* @__PURE__ */ y("p", {
								className: "text-sm text-emerald-600",
								children: e("security.wizard.step5.ok", { defaultValue: "No conflicting security plugins detected. You're good to go." })
							})]
						}),
						_ === 6 && /* @__PURE__ */ b("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ y("p", {
									className: "text-sm font-medium",
									children: e("security.wizard.step6.title", { defaultValue: "Complete setup" })
								}),
								/* @__PURE__ */ y("p", {
									className: "text-sm text-muted-foreground",
									children: e("security.wizard.step6.hint", { defaultValue: "Save your settings, then mark the wizard as complete to hide this banner." })
								}),
								/* @__PURE__ */ b("div", {
									className: "flex flex-wrap gap-2",
									children: [/* @__PURE__ */ y(H, {
										variant: "outline",
										disabled: D.isPending,
										onClick: () => void D.mutateAsync(),
										children: e("security.saveSettings")
									}), /* @__PURE__ */ y(H, {
										disabled: A.isPending,
										onClick: () => void A.mutateAsync(),
										children: e("security.wizardComplete")
									})]
								})
							]
						}),
						/* @__PURE__ */ b("div", {
							className: "flex gap-2",
							children: [_ > 1 && /* @__PURE__ */ y(H, {
								size: "sm",
								variant: "ghost",
								onClick: () => v((e) => e - 1),
								children: e("security.wizard.prev", { defaultValue: "← Back" })
							}), _ < 6 && /* @__PURE__ */ y(H, {
								size: "sm",
								onClick: () => v((e) => e + 1),
								children: e("security.wizard.next", { defaultValue: "Next →" })
							})]
						})
					]
				})]
			}) : null,
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.settingsProfile") }) }), /* @__PURE__ */ b(K, {
				className: "flex flex-wrap items-end gap-3",
				children: [
					/* @__PURE__ */ b("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ y(Zl, { children: e("security.profileLabel") }), /* @__PURE__ */ b(pu, {
							value: i,
							onValueChange: a,
							children: [/* @__PURE__ */ y(hu, {
								className: "w-[200px]",
								children: /* @__PURE__ */ y(mu, {})
							}), /* @__PURE__ */ y(gu, { children: (C.data?.profiles ?? [
								"beginner",
								"recommended",
								"store",
								"paranoid"
							]).map((t) => /* @__PURE__ */ y(_u, {
								value: t,
								children: e(`security.profile.${t}`)
							}, t)) })]
						})]
					}),
					/* @__PURE__ */ y(H, {
						variant: "outline",
						disabled: O.isPending,
						onClick: () => void O.mutateAsync(),
						children: e("security.applyProfile")
					}),
					/* @__PURE__ */ y(H, {
						disabled: D.isPending,
						onClick: () => void D.mutateAsync(),
						children: e("security.saveSettings")
					})
				]
			})] }),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.section.general") }) }), /* @__PURE__ */ b(K, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ y(xf, {
						id: "general-enabled",
						label: e("security.general.enabled"),
						checked: !!P.enabled,
						onCheckedChange: (e) => r(Sf(N, "general", "enabled", e))
					}),
					/* @__PURE__ */ y(xf, {
						id: "general-learning",
						label: e("security.general.learningMode"),
						checked: !!P.learning_mode,
						onCheckedChange: (e) => r(Sf(N, "general", "learning_mode", e))
					}),
					/* @__PURE__ */ y(xf, {
						id: "general-self-guard",
						label: e("security.general.selfGuard"),
						checked: !!P.self_guard,
						onCheckedChange: (e) => r(Sf(N, "general", "self_guard", e))
					})
				]
			})] }),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.section.privacy") }) }), /* @__PURE__ */ b(K, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ y(xf, {
						id: "privacy-anonymize",
						label: e("security.privacy.anonymizeIp"),
						checked: !!ne.anonymize_ip,
						onCheckedChange: (e) => r(Sf(N, "privacy", "anonymize_ip", e))
					}),
					/* @__PURE__ */ y(xf, {
						id: "privacy-body",
						label: e("security.privacy.storeBody"),
						checked: !!ne.store_request_body,
						onCheckedChange: (e) => r(Sf(N, "privacy", "store_request_body", e))
					}),
					/* @__PURE__ */ b("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ y(Zl, {
							htmlFor: "retention-events",
							children: e("security.privacy.retentionEvents")
						}), /* @__PURE__ */ y(Xl, {
							id: "retention-events",
							type: "number",
							className: "max-w-[120px]",
							value: String(ne.retention_events_days ?? 30),
							onChange: (e) => r(Cf(N, "privacy", "retention_events_days", e.target.value))
						})]
					})
				]
			})] }),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.section.waf") }) }), /* @__PURE__ */ b(K, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ y(xf, {
						id: "waf-enabled",
						label: e("security.waf.enabled"),
						checked: !!F.enabled,
						onCheckedChange: (e) => r(Sf(N, "waf", "enabled", e))
					}),
					/* @__PURE__ */ b("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ y(Zl, { children: e("security.waf.mode") }), /* @__PURE__ */ b(pu, {
							value: String(F.mode ?? "learning"),
							onValueChange: (e) => r(Cf(N, "waf", "mode", e)),
							children: [/* @__PURE__ */ y(hu, {
								className: "w-[200px]",
								children: /* @__PURE__ */ y(mu, {})
							}), /* @__PURE__ */ y(gu, { children: [
								"off",
								"learning",
								"enforce"
							].map((t) => /* @__PURE__ */ y(_u, {
								value: t,
								children: e(`security.wafMode.${t}`)
							}, t)) })]
						})]
					}),
					/* @__PURE__ */ y(xf, {
						id: "waf-fail-open",
						label: e("security.waf.failOpen"),
						checked: !!F.fail_open,
						onCheckedChange: (e) => r(Sf(N, "waf", "fail_open", e))
					})
				]
			})] }),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.section.login") }) }), /* @__PURE__ */ b(K, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ y(xf, {
						id: "login-protect",
						label: e("security.login.protect"),
						checked: !!re.protect,
						onCheckedChange: (e) => r(Sf(N, "login", "protect", e))
					}),
					/* @__PURE__ */ y(xf, {
						id: "login-xmlrpc",
						label: e("security.login.disableXmlrpc"),
						checked: !!re.disable_xmlrpc,
						onCheckedChange: (e) => r(Sf(N, "login", "disable_xmlrpc", e))
					}),
					/* @__PURE__ */ y(xf, {
						id: "login-honeypot",
						label: e("security.login.honeypot"),
						checked: !!re.honeypot,
						onCheckedChange: (e) => r(Sf(N, "login", "honeypot", e))
					}),
					/* @__PURE__ */ y(xf, {
						id: "login-2fa",
						label: e("security.login.twoFaOptional"),
						checked: !!re["2fa_optional"],
						onCheckedChange: (e) => r({
							...N,
							login: {
								...re,
								"2fa_optional": e
							}
						})
					})
				]
			})] }),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ b(W, { children: [/* @__PURE__ */ y(G, { children: e("security.twoFaTitle") }), /* @__PURE__ */ y(Yl, { children: e("security.twoFaHint") })] }), /* @__PURE__ */ b(K, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ b("p", {
						className: "text-sm text-muted-foreground",
						children: [e("security.twoFaEnabledUsers", { count: E.data?.enabled_users ?? 0 }), E.data?.current_user?.enabled ? ` · ${e("security.twoFaYouEnabled")}` : ""]
					}),
					/* @__PURE__ */ b("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ y(H, {
								variant: "outline",
								disabled: j.isPending,
								onClick: () => void j.mutateAsync(),
								children: e("security.twoFaSetup")
							}),
							/* @__PURE__ */ y(H, {
								disabled: M.isPending || !s,
								onClick: () => void M.mutateAsync(),
								children: e("security.twoFaEnable")
							}),
							/* @__PURE__ */ y(H, {
								variant: "ghost",
								disabled: ee.isPending || !E.data?.current_user?.enabled,
								onClick: () => void ee.mutateAsync(),
								children: e("security.twoFaDisable")
							})
						]
					}),
					l ? /* @__PURE__ */ y("p", {
						className: "break-all font-mono text-xs text-muted-foreground",
						children: l
					}) : null,
					/* @__PURE__ */ b("div", {
						className: "max-w-xs space-y-1",
						children: [/* @__PURE__ */ y(Zl, {
							htmlFor: "totp-code",
							children: e("security.twoFaCode")
						}), /* @__PURE__ */ y(Xl, {
							id: "totp-code",
							value: s,
							onChange: (e) => c(e.target.value),
							placeholder: "123456",
							inputMode: "numeric"
						})]
					})
				]
			})] }),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.section.headers") }) }), /* @__PURE__ */ b(K, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ y(xf, {
						id: "headers-enabled",
						label: e("security.headers.enabled"),
						checked: !!ie.enabled,
						onCheckedChange: (e) => r(Sf(N, "headers", "enabled", e))
					}),
					/* @__PURE__ */ y(xf, {
						id: "headers-hsts",
						label: e("security.headers.hsts"),
						checked: !!ie.hsts,
						onCheckedChange: (e) => r(Sf(N, "headers", "hsts", e))
					}),
					/* @__PURE__ */ b("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ y(Zl, { children: e("security.headers.cspMode") }), /* @__PURE__ */ b(pu, {
							value: String(ie.csp_mode ?? "off"),
							onValueChange: (e) => r(Cf(N, "headers", "csp_mode", e)),
							children: [/* @__PURE__ */ y(hu, {
								className: "w-[200px]",
								children: /* @__PURE__ */ y(mu, {})
							}), /* @__PURE__ */ y(gu, { children: [
								"off",
								"report-only",
								"enforce"
							].map((e) => /* @__PURE__ */ y(_u, {
								value: e,
								children: e
							}, e)) })]
						})]
					})
				]
			})] }),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.section.scan") }) }), /* @__PURE__ */ b(K, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ b("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ y(Zl, { children: e("security.scan.defaultProfile") }), /* @__PURE__ */ b(pu, {
							value: String(I.default_profile ?? "standard"),
							onValueChange: (e) => r(Cf(N, "scan", "default_profile", e)),
							children: [/* @__PURE__ */ y(hu, {
								className: "w-[200px]",
								children: /* @__PURE__ */ y(mu, {})
							}), /* @__PURE__ */ y(gu, { children: [
								"quick",
								"standard",
								"deep"
							].map((t) => /* @__PURE__ */ y(_u, {
								value: t,
								children: e(`security.scanProfile.${t}`)
							}, t)) })]
						})]
					}),
					/* @__PURE__ */ y(xf, {
						id: "scan-db",
						label: e("security.scan.includeDb"),
						checked: !!I.include_db,
						onCheckedChange: (e) => r(Sf(N, "scan", "include_db", e))
					}),
					/* @__PURE__ */ y(xf, {
						id: "scan-vuln",
						label: e("security.scan.includeVuln"),
						checked: !!I.include_vuln,
						onCheckedChange: (e) => r(Sf(N, "scan", "include_vuln", e))
					})
				]
			})] }),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.section.heal") }) }), /* @__PURE__ */ b(K, {
				className: "space-y-3",
				children: [/* @__PURE__ */ y(xf, {
					id: "heal-snapshot",
					label: e("security.heal.snapshotAlways"),
					checked: !!ae.snapshot_always,
					onCheckedChange: (e) => r(Sf(N, "heal", "snapshot_always", e))
				}), /* @__PURE__ */ y(xf, {
					id: "heal-delete",
					label: e("security.heal.allowDelete"),
					checked: !!ae.allow_delete,
					onCheckedChange: (e) => r(Sf(N, "heal", "allow_delete", e))
				})]
			})] }),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ b(W, {
				className: "flex flex-row items-center justify-between space-y-0",
				children: [/* @__PURE__ */ y(G, { children: e("security.section.feeds") }), /* @__PURE__ */ y(H, {
					variant: "outline",
					size: "sm",
					disabled: k.isPending,
					onClick: () => void k.mutateAsync(),
					children: e("security.syncFeeds")
				})]
			}), /* @__PURE__ */ b(K, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ y(xf, {
						id: "feeds-crm",
						label: e("security.feeds.crmMirror"),
						checked: !!oe.crm_mirror,
						onCheckedChange: (e) => r(Sf(N, "feeds", "crm_mirror", e))
					}),
					/* @__PURE__ */ y(xf, {
						id: "feeds-fallback",
						label: e("security.feeds.directFallback"),
						checked: !!oe.direct_fallback,
						onCheckedChange: (e) => r(Sf(N, "feeds", "direct_fallback", e))
					}),
					/* @__PURE__ */ y("p", {
						className: "text-sm text-muted-foreground",
						children: e("security.feedsStatus", { count: T.data?.feeds?.length ?? 0 })
					})
				]
			})] }),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e("security.section.notify") }) }), /* @__PURE__ */ b(K, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ y(xf, {
						id: "notify-email",
						label: e("security.notify.email"),
						checked: !!se.email,
						onCheckedChange: (e) => r(Sf(N, "notify", "email", e))
					}),
					/* @__PURE__ */ y(xf, {
						id: "notify-site",
						label: e("security.notify.site"),
						checked: !!se.site,
						onCheckedChange: (e) => r(Sf(N, "notify", "site", e))
					}),
					/* @__PURE__ */ y(xf, {
						id: "notify-sms",
						label: e("security.notify.sms"),
						checked: !!se.sms,
						onCheckedChange: (e) => r(Sf(N, "notify", "sms", e))
					})
				]
			})] }),
			/* @__PURE__ */ y("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ y(H, {
					disabled: D.isPending,
					onClick: () => void D.mutateAsync(),
					children: e("security.saveSettings")
				})
			})
		]
	});
}
//#endregion
//#region ../Modules/security-module/client/pages/SecurityToolPage.tsx
function Tf({ data: e }) {
	let { t } = d(), n = e.layers ?? {}, r = e.conflicts ?? [];
	return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ y("div", {
				className: "grid gap-2 sm:grid-cols-3",
				children: [
					{
						label: "PHP",
						value: String(e.php ?? "—")
					},
					{
						label: "WordPress",
						value: String(e.wp ?? "—")
					},
					{
						label: t("security.diag.objectCache", { defaultValue: "Object cache" }),
						value: e.object_cache ? "✓" : "✗"
					},
					{
						label: t("security.diag.cron", { defaultValue: "Shield cron" }),
						value: e.cron ? "✓" : "✗"
					}
				].map(({ label: e, value: t }) => /* @__PURE__ */ b("div", {
					className: "rounded-md border px-3 py-2",
					children: [/* @__PURE__ */ y("p", {
						className: "text-xs text-muted-foreground",
						children: e
					}), /* @__PURE__ */ y("p", {
						className: "font-mono text-sm",
						children: t
					})]
				}, e))
			}),
			/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y("p", {
				className: "mb-2 text-sm font-medium",
				children: t("security.diag.layers", { defaultValue: "Active layers" })
			}), /* @__PURE__ */ y("div", {
				className: "flex flex-wrap gap-2",
				children: Object.entries(n).map(([e, t]) => /* @__PURE__ */ b($, {
					variant: t ? "secondary" : "outline",
					className: "capitalize",
					children: [
						e,
						": ",
						String(t)
					]
				}, e))
			})] }),
			r.length > 0 ? /* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y("p", {
				className: "mb-2 text-sm font-medium text-amber-600",
				children: t("security.diag.conflicts", { defaultValue: "Plugin conflicts" })
			}), /* @__PURE__ */ y("ul", {
				className: "space-y-1",
				children: r.map((e, t) => /* @__PURE__ */ b("li", {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ y($, {
						variant: "outline",
						className: "capitalize",
						children: e.severity
					}), /* @__PURE__ */ y("span", { children: e.plugin })]
				}, t))
			})] }) : /* @__PURE__ */ y("p", {
				className: "text-sm text-emerald-600",
				children: t("security.diag.noConflicts", { defaultValue: "No plugin conflicts detected." })
			})
		]
	});
}
function Ef({ data: e }) {
	let { t } = d(), n = e.items ?? [];
	return n.length === 0 ? /* @__PURE__ */ y("p", {
		className: "text-sm text-muted-foreground",
		children: t("security.snapshotsEmpty", { defaultValue: "No snapshots found." })
	}) : /* @__PURE__ */ y("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ b(bu, { children: [/* @__PURE__ */ y(xu, { children: /* @__PURE__ */ b(q, { children: [
			/* @__PURE__ */ y(J, { children: "#" }),
			/* @__PURE__ */ y(J, { children: t("security.col.path") }),
			/* @__PURE__ */ y(J, { children: t("security.col.created") }),
			/* @__PURE__ */ y(J, { children: t("security.fileSize") })
		] }) }), /* @__PURE__ */ y(Su, { children: n.map((e) => /* @__PURE__ */ b(q, { children: [
			/* @__PURE__ */ y(Y, { children: String(e.id ?? e.snapshot_id ?? "—") }),
			/* @__PURE__ */ y(Y, {
				className: "max-w-[280px] truncate font-mono text-xs",
				children: String(e.path ?? e.file ?? "—")
			}),
			/* @__PURE__ */ y(Y, {
				className: "text-xs",
				children: String(e.created_at ?? "—")
			}),
			/* @__PURE__ */ y(Y, {
				className: "text-xs",
				children: e.size == null ? "—" : String(e.size)
			})
		] }, String(e.id ?? e.snapshot_id))) })] })
	});
}
function Df({ data: e }) {
	let { t } = d(), n = e.users ?? [];
	return /* @__PURE__ */ b("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ y("p", {
			className: "text-sm text-muted-foreground",
			children: t("security.passAudit.checked", {
				defaultValue: "Common passwords checked: {{count}}",
				count: e.checked_common_passwords ?? 0
			})
		}), n.length === 0 ? /* @__PURE__ */ y("p", {
			className: "text-sm text-emerald-600",
			children: t("security.passAudit.noIssues", { defaultValue: "All admin/editor accounts look good." })
		}) : /* @__PURE__ */ y("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ b(bu, { children: [/* @__PURE__ */ y(xu, { children: /* @__PURE__ */ b(q, { children: [
				/* @__PURE__ */ y(J, { children: "#" }),
				/* @__PURE__ */ y(J, { children: t("security.col.login", { defaultValue: "Login" }) }),
				/* @__PURE__ */ y(J, { children: t("security.col.issues", { defaultValue: "Issues" }) })
			] }) }), /* @__PURE__ */ y(Su, { children: n.map((e) => /* @__PURE__ */ b(q, { children: [
				/* @__PURE__ */ y(Y, { children: String(e.id) }),
				/* @__PURE__ */ y(Y, {
					className: "font-mono text-sm",
					children: String(e.login ?? "—")
				}),
				/* @__PURE__ */ y(Y, { children: /* @__PURE__ */ y("div", {
					className: "flex flex-wrap gap-1",
					children: (e.issues ?? []).map((e) => /* @__PURE__ */ y($, {
						variant: "destructive",
						className: "text-xs capitalize",
						children: e.replace(/_/g, " ")
					}, e))
				}) })
			] }, String(e.id))) })] })
		})]
	});
}
function Of({ data: e, onRefresh: t, refreshing: n }) {
	let { t: r } = d(), i = e.incidents ?? [];
	return /* @__PURE__ */ b("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ y("div", {
			className: "flex items-center gap-2",
			children: /* @__PURE__ */ y(H, {
				size: "sm",
				variant: "outline",
				disabled: n,
				onClick: t,
				children: r("security.refresh", { defaultValue: "Refresh" })
			})
		}), i.length === 0 ? /* @__PURE__ */ y("p", {
			className: "text-sm text-muted-foreground",
			children: r("security.incidentNoItems", { defaultValue: "No incidents recorded." })
		}) : /* @__PURE__ */ y("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ b(bu, { children: [/* @__PURE__ */ y(xu, { children: /* @__PURE__ */ b(q, { children: [
				/* @__PURE__ */ y(J, { children: "#" }),
				/* @__PURE__ */ y(J, { children: r("security.col.title") }),
				/* @__PURE__ */ y(J, { children: r("security.col.status") }),
				/* @__PURE__ */ y(J, { children: r("security.col.severity", { defaultValue: "Severity" }) }),
				/* @__PURE__ */ y(J, { children: r("security.col.created") })
			] }) }), /* @__PURE__ */ y(Su, { children: i.map((e) => /* @__PURE__ */ b(q, { children: [
				/* @__PURE__ */ y(Y, { children: String(e.id) }),
				/* @__PURE__ */ y(Y, {
					className: "max-w-[220px] truncate",
					children: String(e.title ?? `Incident #${String(e.id)}`)
				}),
				/* @__PURE__ */ y(Y, { children: /* @__PURE__ */ y($, {
					variant: e.status === "open" ? "destructive" : "secondary",
					className: "capitalize text-xs",
					children: String(e.status ?? "—")
				}) }),
				/* @__PURE__ */ y(Y, { children: /* @__PURE__ */ y($, {
					variant: "outline",
					className: "capitalize text-xs",
					children: String(e.severity ?? "—")
				}) }),
				/* @__PURE__ */ y(Y, {
					className: "text-xs",
					children: String(e.created_at ?? "—")
				})
			] }, String(e.id))) })] })
		})]
	});
}
function kf({ data: e, onImport: t, importing: n }) {
	let { t: r } = d(), [i, a] = u(""), o = e.export;
	return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y("p", {
			className: "mb-2 text-sm font-medium",
			children: r("security.importExport.exportTitle", { defaultValue: "Export settings" })
		}), o ? /* @__PURE__ */ b("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ y("div", {
				className: "flex flex-wrap gap-2 text-xs text-muted-foreground",
				children: Object.keys(o).map((e) => /* @__PURE__ */ y($, {
					variant: "outline",
					className: "capitalize",
					children: e
				}, e))
			}), /* @__PURE__ */ y(H, {
				size: "sm",
				variant: "outline",
				onClick: () => {
					let e = new Blob([JSON.stringify(o, null, 2)], { type: "application/json" }), t = URL.createObjectURL(e), n = document.createElement("a");
					n.href = t, n.download = "webino-shield-settings.json", n.click(), URL.revokeObjectURL(t);
				},
				children: r("security.importExport.download", { defaultValue: "Download JSON" })
			})]
		}) : /* @__PURE__ */ y("p", {
			className: "text-sm text-muted-foreground",
			children: r("security.toolNoResult")
		})] }), /* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y("p", {
			className: "mb-2 text-sm font-medium",
			children: r("security.importExport.importTitle", { defaultValue: "Import settings JSON" })
		}), /* @__PURE__ */ b("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ y(sf, {
				rows: 5,
				className: "font-mono text-xs",
				placeholder: "{\"general\": {}, \"waf\": {}}",
				value: i,
				onChange: (e) => a(e.target.value)
			}), /* @__PURE__ */ y(H, {
				size: "sm",
				disabled: n || !i.trim(),
				onClick: () => t(i),
				children: r("security.importExport.import", { defaultValue: "Import" })
			})]
		})] })]
	});
}
var Af = {
	whois: [{
		name: "ip",
		labelKey: "security.toolField.ip",
		placeholder: "203.0.113.1"
	}],
	"ip-lookup": [{
		name: "ip",
		labelKey: "security.toolField.ip"
	}],
	"integrity-diff": [{
		name: "path",
		labelKey: "security.toolField.path",
		placeholder: "wp-includes/version.php"
	}],
	"secrets-search": [{
		name: "path",
		labelKey: "security.toolField.path"
	}],
	"file-browser": [{
		name: "path",
		labelKey: "security.toolField.path",
		placeholder: "wp-content"
	}]
};
function jf({ data: e }) {
	let { t } = d(), n = e.geo || {}, r = e.events || [];
	return /* @__PURE__ */ b("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ b("div", {
			className: "grid gap-2 sm:grid-cols-2",
			children: [/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y("p", {
				className: "text-xs text-muted-foreground",
				children: t("security.toolField.ip")
			}), /* @__PURE__ */ y("p", {
				className: "font-mono text-sm",
				children: String(e.ip ?? "—")
			})] }), /* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y("p", {
				className: "text-xs text-muted-foreground",
				children: t("security.col.country")
			}), /* @__PURE__ */ b("p", {
				className: "text-sm",
				children: [String(n.country ?? n.country_code ?? "—"), n.asn ? ` · ASN ${String(n.asn)}` : ""]
			})] })]
		}), r.length > 0 ? /* @__PURE__ */ y("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ b(bu, { children: [/* @__PURE__ */ y(xu, { children: /* @__PURE__ */ b(q, { children: [
				/* @__PURE__ */ y(J, { children: t("security.col.time") }),
				/* @__PURE__ */ y(J, { children: t("security.col.action") }),
				/* @__PURE__ */ y(J, { children: t("security.col.path") }),
				/* @__PURE__ */ y(J, { children: t("security.col.rule") })
			] }) }), /* @__PURE__ */ y(Su, { children: r.map((e) => /* @__PURE__ */ b(q, { children: [
				/* @__PURE__ */ y(Y, {
					className: "text-xs",
					children: String(e.created_at ?? "")
				}),
				/* @__PURE__ */ y(Y, { children: /* @__PURE__ */ y($, {
					variant: "outline",
					children: String(e.action ?? "")
				}) }),
				/* @__PURE__ */ y(Y, {
					className: "max-w-[200px] truncate font-mono text-xs",
					children: String(e.path ?? "")
				}),
				/* @__PURE__ */ y(Y, {
					className: "font-mono text-xs",
					children: String(e.rule_id ?? "—")
				})
			] }, String(e.id))) })] })
		}) : /* @__PURE__ */ y("p", {
			className: "text-sm text-muted-foreground",
			children: t("security.noLiveEvents")
		})]
	});
}
function Mf({ data: e, onRestore: t, restoring: n }) {
	let { t: r } = d(), i = e.items || [];
	return i.length === 0 ? /* @__PURE__ */ y("p", {
		className: "text-sm text-muted-foreground",
		children: r("security.quarantineEmpty")
	}) : /* @__PURE__ */ y("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ b(bu, { children: [/* @__PURE__ */ y(xu, { children: /* @__PURE__ */ b(q, { children: [
			/* @__PURE__ */ y(J, { children: "#" }),
			/* @__PURE__ */ y(J, { children: r("security.col.path") }),
			/* @__PURE__ */ y(J, { children: r("security.col.created") }),
			/* @__PURE__ */ y(J, {
				className: "text-right",
				children: r("security.col.actions")
			})
		] }) }), /* @__PURE__ */ y(Su, { children: i.map((e) => /* @__PURE__ */ b(q, { children: [
			/* @__PURE__ */ y(Y, { children: String(e.id) }),
			/* @__PURE__ */ y(Y, {
				className: "max-w-[280px] truncate font-mono text-xs",
				children: String(e.path ?? e.original_path ?? "")
			}),
			/* @__PURE__ */ y(Y, {
				className: "text-xs",
				children: String(e.created_at ?? "")
			}),
			/* @__PURE__ */ y(Y, {
				className: "text-right",
				children: /* @__PURE__ */ y(H, {
					size: "sm",
					variant: "outline",
					disabled: n,
					onClick: () => t(Number(e.id)),
					children: r("security.quarantineRestore")
				})
			})
		] }, String(e.id))) })] })
	});
}
function Nf({ data: e, onApply: t, applying: n }) {
	let { t: r } = d(), i = e.actions || [], a = String(e.token ?? "");
	return i.length === 0 ? /* @__PURE__ */ y("p", {
		className: "text-sm text-muted-foreground",
		children: r("security.healNoActions")
	}) : /* @__PURE__ */ b("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ y("ul", {
			className: "space-y-2 text-sm",
			children: i.map((e, t) => /* @__PURE__ */ b("li", {
				className: "rounded-md border p-2",
				children: [
					/* @__PURE__ */ y($, {
						variant: "secondary",
						className: "mr-2",
						children: String(e.action ?? e.type ?? "")
					}),
					/* @__PURE__ */ y("span", {
						className: "font-mono text-xs",
						children: String(e.target ?? "")
					}),
					e.preview ? /* @__PURE__ */ y("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: String(e.preview)
					}) : null
				]
			}, t))
		}), /* @__PURE__ */ y(H, {
			disabled: n || !a,
			onClick: () => t(a, i),
			children: r("security.healApply")
		})]
	});
}
function Pf({ data: e, onNavigate: t }) {
	let { t: n } = d();
	if (e.type === "file") return /* @__PURE__ */ b("div", {
		className: "space-y-1 text-sm",
		children: [
			/* @__PURE__ */ y("p", {
				className: "font-mono",
				children: String(e.path)
			}),
			/* @__PURE__ */ b("p", { children: [
				n("security.fileSize"),
				": ",
				String(e.size ?? "—")
			] }),
			/* @__PURE__ */ b("p", {
				className: "font-mono text-xs",
				children: ["MD5: ", String(e.md5 ?? "—")]
			})
		]
	});
	let r = e.entries || [], i = String(e.path ?? "");
	return /* @__PURE__ */ y("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ b(bu, { children: [/* @__PURE__ */ y(xu, { children: /* @__PURE__ */ b(q, { children: [
			/* @__PURE__ */ y(J, { children: n("security.col.name") }),
			/* @__PURE__ */ y(J, { children: n("security.col.type") }),
			/* @__PURE__ */ y(J, { children: n("security.fileSize") })
		] }) }), /* @__PURE__ */ b(Su, { children: [i ? /* @__PURE__ */ y(q, { children: /* @__PURE__ */ y(Y, {
			colSpan: 3,
			children: /* @__PURE__ */ y(H, {
				variant: "link",
				className: "h-auto p-0",
				onClick: () => {
					let e = i.split("/").filter(Boolean);
					e.pop(), t(e.join("/"));
				},
				children: ".."
			})
		}) }) : null, r.map((e) => {
			let n = String(e.name), r = i ? `${i}/${n}` : n;
			return /* @__PURE__ */ b(q, { children: [
				/* @__PURE__ */ y(Y, { children: e.type === "dir" ? /* @__PURE__ */ b(H, {
					variant: "link",
					className: "h-auto p-0 font-mono text-xs",
					onClick: () => t(r),
					children: [n, "/"]
				}) : /* @__PURE__ */ y(H, {
					variant: "link",
					className: "h-auto p-0 font-mono text-xs",
					onClick: () => t(r),
					children: n
				}) }),
				/* @__PURE__ */ y(Y, { children: String(e.type) }),
				/* @__PURE__ */ y(Y, { children: e.size == null ? "—" : String(e.size) })
			] }, n);
		})] })] })
	});
}
function Ff() {
	let { t: e } = d(), { tool: t = "" } = C(), n = m(), r = cd.includes(t), [i, a] = u({}), [s, l] = u("{}"), [g, _] = u(null);
	o(() => {
		a({}), l("{}"), _(null);
	}, [t]);
	let v = c(() => [
		"whois",
		"ip-lookup",
		"quarantine",
		"heal-wizard",
		"file-browser",
		"diagnostics",
		"snapshots",
		"password-audit",
		"incident",
		"import-export"
	].includes(t), [t]), S = c(() => [
		"quarantine",
		"heal-wizard",
		"diagnostics",
		"snapshots",
		"password-audit",
		"incident",
		"import-export"
	].includes(t), [t]), w = p({
		queryKey: [
			"security",
			"tool",
			t,
			"auto"
		],
		queryFn: () => Vd(t),
		enabled: r && S
	});
	Q(w), o(() => {
		w.data && typeof w.data == "object" && _(w.data);
	}, [w.data]);
	let T = f({
		mutationFn: () => Vd(t, i),
		onSuccess: (e) => {
			_(e);
		},
		onError: (t) => Z(e, t)
	}), E = f({
		mutationFn: async () => {
			let n = {};
			try {
				n = JSON.parse(s);
			} catch {
				throw Error(e("security.invalidJson"));
			}
			return Hd(t, n);
		},
		onSuccess: (t) => {
			_(t), h.success(e("security.toolRunDone"));
		},
		onError: (t) => Z(e, t)
	}), D = f({
		mutationFn: (e) => Hd("quarantine", { restore_id: e }),
		onSuccess: () => {
			h.success(e("security.quarantineRestored")), n.invalidateQueries({ queryKey: [
				"security",
				"tool",
				"quarantine"
			] }), T.mutateAsync();
		},
		onError: (t) => Z(e, t)
	}), O = f({
		mutationFn: ({ token: e, actions: t }) => Ld({
			confirmation_token: e,
			actions: t
		}),
		onSuccess: () => {
			h.success(e("security.healApplied")), n.invalidateQueries({ queryKey: [
				"security",
				"tool",
				"heal-wizard"
			] });
		},
		onError: (t) => Z(e, t)
	}), k = f({
		mutationFn: (e) => Hd("import-export", { import: e }),
		onSuccess: () => {
			h.success(e("security.importExport.importDone", { defaultValue: "Settings imported successfully." })), n.invalidateQueries({ queryKey: ["security"] }), w.refetch();
		},
		onError: (t) => Z(e, t)
	});
	if (!r) return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ y(Zd, {}),
			/* @__PURE__ */ y("p", {
				className: "text-sm text-muted-foreground",
				children: e("security.unknownTool")
			}),
			/* @__PURE__ */ y(H, {
				asChild: !0,
				variant: "outline",
				size: "sm",
				children: /* @__PURE__ */ y(x, {
					to: "/security/tools",
					children: e("security.backToTools")
				})
			})
		]
	});
	let A = Af[t] ?? [], j = g;
	return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ y(Zd, {}),
			/* @__PURE__ */ b("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ y(H, {
					asChild: !0,
					variant: "ghost",
					size: "sm",
					children: /* @__PURE__ */ y(x, {
						to: "/security/tools",
						children: e("security.backToTools")
					})
				}), /* @__PURE__ */ y("span", {
					className: "font-mono text-sm text-muted-foreground",
					children: t
				})]
			}),
			/* @__PURE__ */ b(U, { children: [/* @__PURE__ */ y(W, { children: /* @__PURE__ */ y(G, { children: e(`security.tools.${t}.title`, { defaultValue: t }) }) }), /* @__PURE__ */ b(K, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ y("p", {
						className: "text-sm text-muted-foreground",
						children: e(`security.tools.${t}.desc`, { defaultValue: e("security.toolDefaultDesc") })
					}),
					A.length > 0 ? /* @__PURE__ */ y("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: A.map((t) => /* @__PURE__ */ b("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ y(Zl, {
								htmlFor: `field-${t.name}`,
								children: e(t.labelKey)
							}), /* @__PURE__ */ y(Xl, {
								id: `field-${t.name}`,
								value: i[t.name] ?? "",
								placeholder: t.placeholder,
								onChange: (e) => a((n) => ({
									...n,
									[t.name]: e.target.value
								}))
							})]
						}, t.name))
					}) : null,
					/* @__PURE__ */ b("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ y(H, {
							disabled: T.isPending,
							onClick: () => void T.mutateAsync(),
							children: e("security.toolRunGet")
						}), v ? null : /* @__PURE__ */ y(H, {
							variant: "secondary",
							disabled: E.isPending,
							onClick: () => void E.mutateAsync(),
							children: e("security.toolRunPost")
						})]
					}),
					v ? null : /* @__PURE__ */ b("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ y(Zl, {
							htmlFor: "tool-post",
							children: e("security.toolPostBody")
						}), /* @__PURE__ */ y(sf, {
							id: "tool-post",
							rows: 4,
							className: "font-mono text-xs",
							value: s,
							onChange: (e) => l(e.target.value)
						})]
					}),
					/* @__PURE__ */ b("div", { children: [/* @__PURE__ */ y("p", {
						className: "mb-2 text-sm font-medium",
						children: e("security.toolResult")
					}), T.isPending || w.isPending ? /* @__PURE__ */ y(Ql, { className: "h-40 w-full" }) : j ? t === "whois" || t === "ip-lookup" ? /* @__PURE__ */ y(jf, { data: j }) : t === "quarantine" ? /* @__PURE__ */ y(Mf, {
						data: j,
						restoring: D.isPending,
						onRestore: (e) => void D.mutateAsync(e)
					}) : t === "heal-wizard" ? /* @__PURE__ */ y(Nf, {
						data: j,
						applying: O.isPending,
						onApply: (e, t) => void O.mutateAsync({
							token: e,
							actions: t
						})
					}) : t === "file-browser" ? /* @__PURE__ */ y(Pf, {
						data: j,
						onNavigate: (e) => {
							a({ path: e }), Vd(t, { path: e }).then((e) => _(e));
						}
					}) : t === "diagnostics" ? /* @__PURE__ */ y(Tf, { data: j }) : t === "snapshots" ? /* @__PURE__ */ y(Ef, { data: j }) : t === "password-audit" ? /* @__PURE__ */ y(Df, { data: j }) : t === "incident" ? /* @__PURE__ */ y(Of, {
						data: j,
						refreshing: w.isFetching,
						onRefresh: () => void w.refetch()
					}) : t === "import-export" ? /* @__PURE__ */ y(kf, {
						data: j,
						importing: k.isPending,
						onImport: (e) => void k.mutateAsync(e)
					}) : /* @__PURE__ */ y("pre", {
						className: "max-h-96 overflow-auto rounded-md border bg-muted/40 p-3 text-xs",
						children: JSON.stringify(j, null, 2)
					}) : /* @__PURE__ */ y("p", {
						className: "text-sm text-muted-foreground",
						children: e("security.toolNoResult")
					})] })
				]
			})] })
		]
	});
}
//#endregion
//#region ../Modules/security-module/client/pages/SecurityToolsPage.tsx
function If() {
	let { t: e } = d(), [t, n] = u(""), r = c(() => {
		let n = t.trim().toLowerCase();
		return n ? cd.filter((t) => {
			let r = e(`security.tools.${t}.title`, { defaultValue: t }).toLowerCase(), i = e(`security.tools.${t}.desc`, { defaultValue: "" }).toLowerCase();
			return t.includes(n) || r.includes(n) || i.includes(n);
		}) : cd;
	}, [t, e]);
	return /* @__PURE__ */ b("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ y(Zd, {}),
			/* @__PURE__ */ y(Xl, {
				type: "search",
				placeholder: e("security.toolsSearch", { defaultValue: "Search tools…" }),
				value: t,
				onChange: (e) => n(e.target.value),
				className: "max-w-sm"
			}),
			r.length === 0 ? /* @__PURE__ */ y("p", {
				className: "text-sm text-muted-foreground",
				children: e("security.toolsNoMatch", { defaultValue: "No tools match your search." })
			}) : /* @__PURE__ */ y("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: r.map((t) => /* @__PURE__ */ y(x, {
					to: `/security/tools/${t}`,
					className: "block",
					children: /* @__PURE__ */ b(U, {
						className: "h-full transition-colors hover:bg-muted/40",
						children: [/* @__PURE__ */ b(W, {
							className: "pb-2",
							children: [/* @__PURE__ */ y(G, {
								className: "text-base",
								children: e(`security.tools.${t}.title`, { defaultValue: t })
							}), /* @__PURE__ */ y(Yl, { children: e(`security.tools.${t}.desc`, { defaultValue: e("security.toolDefaultDesc") }) })]
						}), /* @__PURE__ */ y(K, { children: /* @__PURE__ */ y("span", {
							className: "font-mono text-xs text-muted-foreground",
							children: t
						}) })]
					})
				}, t))
			})
		]
	});
}
//#endregion
//#region ../Modules/security-module/client/module-entry.tsx
var Lf = {
	security: df,
	"security/firewall": af,
	"security/firewall/live": rf,
	"security/firewall/rules": cf,
	"security/firewall/blocking": ef,
	"security/scan": bf,
	"security/scan/:jobid": vf,
	"security/tools": If,
	"security/tools/:tool": Ff,
	"security/reports": mf,
	"security/reports/:reportid": pf,
	"security/settings": wf
}, Rf = { routes: Lf };
//#endregion
export { Rf as default, Lf as routes };
