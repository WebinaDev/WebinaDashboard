import { useMutation as e, useQuery as t, useQueryClient as n } from "@tanstack/react-query";
import * as r from "react";
import i, { createContext as a, createElement as o, forwardRef as s, useContext as c, useLayoutEffect as l, useMemo as u, useState as d } from "react";
import { Link as f, Navigate as p, useLocation as m, useNavigate as h, useParams as g } from "react-router-dom";
import { useTranslation as _ } from "react-i18next";
import { toast as v } from "sonner";
import { Fragment as y, jsx as b, jsxs as x } from "react/jsx-runtime";
import * as S from "react-dom";
import C from "react-dom";
//#region src/components/PageShell.tsx
function w({ title: e, description: t, eyebrow: n, children: r }) {
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
//#region node_modules/clsx/dist/clsx.mjs
function T(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") if (Array.isArray(e)) {
		var i = e.length;
		for (t = 0; t < i; t++) e[t] && (n = T(e[t])) && (r && (r += " "), r += n);
	} else for (n in e) e[n] && (r && (r += " "), r += n);
	return r;
}
function E() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = T(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/class-variance-authority/dist/index.mjs
var D = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, O = E, k = (e, t) => (n) => {
	if (t?.variants == null) return O(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = D(t) || D(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return O(e, a, t?.compoundVariants?.reduce((e, t) => {
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
function A(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function j(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = A(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : A(e[t], null);
			}
		};
	};
}
function M(...e) {
	return r.useCallback(j(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function N(e) {
	let t = /* @__PURE__ */ P(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(F);
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
function P(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = ne(n), a = te(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? j(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var ee = Symbol("radix.slottable");
function F(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === ee;
}
function te(e, t) {
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
	let n = /* @__PURE__ */ N(`Primitive.${t}`), i = r.forwardRef((e, r) => {
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
function re(e, t) {
	e && S.flushSync(() => e.dispatchEvent(t));
}
//#endregion
//#region node_modules/@radix-ui/react-visually-hidden/dist/index.mjs
var L = Object.freeze({
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
}), R = "VisuallyHidden", ie = r.forwardRef((e, t) => /* @__PURE__ */ b(I.span, {
	...e,
	ref: t,
	style: {
		...L,
		...e.style
	}
}));
ie.displayName = R;
//#endregion
//#region node_modules/@radix-ui/react-context/dist/index.mjs
function ae(e, t = []) {
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
	return a.scopeName = e, [i, z(a, ...t)];
}
function z(...e) {
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
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(le);
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
function se(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = de(n), a = ue(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? j(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var ce = Symbol("radix.slottable");
function le(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === ce;
}
function ue(e, t) {
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
function de(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function fe(e) {
	let t = e + "CollectionProvider", [n, r] = ae(t), [a, o] = n(t, {
		collectionRef: { current: null },
		itemMap: /* @__PURE__ */ new Map()
	}), s = (e) => {
		let { scope: t, children: n } = e, r = i.useRef(null), o = i.useRef(/* @__PURE__ */ new Map()).current;
		return /* @__PURE__ */ b(a, {
			scope: t,
			itemMap: o,
			collectionRef: r,
			children: n
		});
	};
	s.displayName = t;
	let c = e + "CollectionSlot", l = /* @__PURE__ */ oe(c), u = i.forwardRef((e, t) => {
		let { scope: n, children: r } = e;
		return /* @__PURE__ */ b(l, {
			ref: M(t, o(c, n).collectionRef),
			children: r
		});
	});
	u.displayName = c;
	let d = e + "CollectionItemSlot", f = "data-radix-collection-item", p = /* @__PURE__ */ oe(d), m = i.forwardRef((e, t) => {
		let { scope: n, children: r, ...a } = e, s = i.useRef(null), c = M(t, s), l = o(d, n);
		return i.useEffect(() => (l.itemMap.set(s, {
			ref: s,
			...a
		}), () => void l.itemMap.delete(s))), /* @__PURE__ */ b(p, {
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
var V = globalThis?.document ? r.useLayoutEffect : () => {}, pe = r.useInsertionEffect || V;
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
//#region node_modules/@radix-ui/react-presence/dist/index.mjs
function _e(e, t) {
	return r.useReducer((e, n) => t[e][n] ?? e, e);
}
var ve = (e) => {
	let { present: t, children: n } = e, i = ye(t), a = typeof n == "function" ? n({ present: i.isPresent }) : r.Children.only(n), o = M(i.ref, xe(a));
	return typeof n == "function" || i.isPresent ? r.cloneElement(a, { ref: o }) : null;
};
ve.displayName = "Presence";
function ye(e) {
	let [t, n] = r.useState(), i = r.useRef(null), a = r.useRef(e), o = r.useRef("none"), [s, c] = _e(e ? "mounted" : "unmounted", {
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
		let e = be(i.current);
		o.current = s === "mounted" ? e : "none";
	}, [s]), V(() => {
		let t = i.current, n = a.current;
		if (n !== e) {
			let r = o.current, i = be(t);
			e ? c("MOUNT") : i === "none" || t?.display === "none" ? c("UNMOUNT") : c(n && r !== i ? "ANIMATION_OUT" : "UNMOUNT"), a.current = e;
		}
	}, [e, c]), V(() => {
		if (t) {
			let e, n = t.ownerDocument.defaultView ?? window, r = (r) => {
				let o = be(i.current).includes(CSS.escape(r.animationName));
				if (r.target === t && o && (c("ANIMATION_END"), !a.current)) {
					let r = t.style.animationFillMode;
					t.style.animationFillMode = "forwards", e = n.setTimeout(() => {
						t.style.animationFillMode === "forwards" && (t.style.animationFillMode = r);
					});
				}
			}, s = (e) => {
				e.target === t && (o.current = be(i.current));
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
function be(e) {
	return e?.animationName || "none";
}
function xe(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-id/dist/index.mjs
var Se = r.useId || (() => void 0), Ce = 0;
function we(e) {
	let [t, n] = r.useState(Se());
	return V(() => {
		e || n((e) => e ?? String(Ce++));
	}, [e]), e || (t ? `radix-${t}` : "");
}
//#endregion
//#region node_modules/@radix-ui/react-direction/dist/index.mjs
var Te = r.createContext(void 0);
function Ee(e) {
	let t = r.useContext(Te);
	return e || t || "ltr";
}
//#endregion
//#region node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
function De(e) {
	let t = r.useRef(e);
	return r.useEffect(() => {
		t.current = e;
	}), r.useMemo(() => (...e) => t.current?.(...e), []);
}
//#endregion
//#region node_modules/@radix-ui/react-use-escape-keydown/dist/index.mjs
function Oe(e, t = globalThis?.document) {
	let n = De(e);
	r.useEffect(() => {
		let e = (e) => {
			e.key === "Escape" && n(e);
		};
		return t.addEventListener("keydown", e, { capture: !0 }), () => t.removeEventListener("keydown", e, { capture: !0 });
	}, [n, t]);
}
//#endregion
//#region node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var ke = "DismissableLayer", Ae = "dismissableLayer.update", je = "dismissableLayer.pointerDownOutside", Me = "dismissableLayer.focusOutside", Ne, Pe = r.createContext({
	layers: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set()
}), Fe = r.forwardRef((e, t) => {
	let { disableOutsidePointerEvents: n = !1, onEscapeKeyDown: i, onPointerDownOutside: a, onFocusOutside: o, onInteractOutside: s, onDismiss: c, ...l } = e, u = r.useContext(Pe), [d, f] = r.useState(null), p = d?.ownerDocument ?? globalThis?.document, [, m] = r.useState({}), h = M(t, (e) => f(e)), g = Array.from(u.layers), [_] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1), v = g.indexOf(_), y = d ? g.indexOf(d) : -1, x = u.layersWithOutsidePointerEventsDisabled.size > 0, S = y >= v, C = Re((e) => {
		let t = e.target, n = [...u.branches].some((e) => e.contains(t));
		!S || n || (a?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p), w = ze((e) => {
		let t = e.target;
		[...u.branches].some((e) => e.contains(t)) || (o?.(e), s?.(e), e.defaultPrevented || c?.());
	}, p);
	return Oe((e) => {
		y === u.layers.size - 1 && (i?.(e), !e.defaultPrevented && c && (e.preventDefault(), c()));
	}, p), r.useEffect(() => {
		if (d) return n && (u.layersWithOutsidePointerEventsDisabled.size === 0 && (Ne = p.body.style.pointerEvents, p.body.style.pointerEvents = "none"), u.layersWithOutsidePointerEventsDisabled.add(d)), u.layers.add(d), Be(), () => {
			n && u.layersWithOutsidePointerEventsDisabled.size === 1 && (p.body.style.pointerEvents = Ne);
		};
	}, [
		d,
		p,
		n,
		u
	]), r.useEffect(() => () => {
		d && (u.layers.delete(d), u.layersWithOutsidePointerEventsDisabled.delete(d), Be());
	}, [d, u]), r.useEffect(() => {
		let e = () => m({});
		return document.addEventListener(Ae, e), () => document.removeEventListener(Ae, e);
	}, []), /* @__PURE__ */ b(I.div, {
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
Fe.displayName = ke;
var Ie = "DismissableLayerBranch", Le = r.forwardRef((e, t) => {
	let n = r.useContext(Pe), i = r.useRef(null), a = M(t, i);
	return r.useEffect(() => {
		let e = i.current;
		if (e) return n.branches.add(e), () => {
			n.branches.delete(e);
		};
	}, [n.branches]), /* @__PURE__ */ b(I.div, {
		...e,
		ref: a
	});
});
Le.displayName = Ie;
function Re(e, t = globalThis?.document) {
	let n = De(e), i = r.useRef(!1), a = r.useRef(() => {});
	return r.useEffect(() => {
		let e = (e) => {
			if (e.target && !i.current) {
				let r = function() {
					Ve(je, n, i, { discrete: !0 });
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
function ze(e, t = globalThis?.document) {
	let n = De(e), i = r.useRef(!1);
	return r.useEffect(() => {
		let e = (e) => {
			e.target && !i.current && Ve(Me, n, { originalEvent: e }, { discrete: !1 });
		};
		return t.addEventListener("focusin", e), () => t.removeEventListener("focusin", e);
	}, [t, n]), {
		onFocusCapture: () => i.current = !0,
		onBlurCapture: () => i.current = !1
	};
}
function Be() {
	let e = new CustomEvent(Ae);
	document.dispatchEvent(e);
}
function Ve(e, t, n, { discrete: r }) {
	let i = n.originalEvent.target, a = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && i.addEventListener(e, t, { once: !0 }), r ? re(i, a) : i.dispatchEvent(a);
}
//#endregion
//#region node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var He = "focusScope.autoFocusOnMount", Ue = "focusScope.autoFocusOnUnmount", We = {
	bubbles: !1,
	cancelable: !0
}, Ge = "FocusScope", Ke = r.forwardRef((e, t) => {
	let { loop: n = !1, trapped: i = !1, onMountAutoFocus: a, onUnmountAutoFocus: o, ...s } = e, [c, l] = r.useState(null), u = De(a), d = De(o), f = r.useRef(null), p = M(t, (e) => l(e)), m = r.useRef({
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
				c.contains(t) ? f.current = t : $e(f.current, { select: !0 });
			}, t = function(e) {
				if (m.paused || !c) return;
				let t = e.relatedTarget;
				t !== null && (c.contains(t) || $e(f.current, { select: !0 }));
			}, n = function(e) {
				if (document.activeElement === document.body) for (let t of e) t.removedNodes.length > 0 && $e(c);
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
			et.add(m);
			let e = document.activeElement;
			if (!c.contains(e)) {
				let t = new CustomEvent(He, We);
				c.addEventListener(He, u), c.dispatchEvent(t), t.defaultPrevented || (qe(rt(Ye(c)), { select: !0 }), document.activeElement === e && $e(c));
			}
			return () => {
				c.removeEventListener(He, u), setTimeout(() => {
					let t = new CustomEvent(Ue, We);
					c.addEventListener(Ue, d), c.dispatchEvent(t), t.defaultPrevented || $e(e ?? document.body, { select: !0 }), c.removeEventListener(Ue, d), et.remove(m);
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
			let t = e.currentTarget, [i, a] = Je(t);
			i && a ? !e.shiftKey && r === a ? (e.preventDefault(), n && $e(i, { select: !0 })) : e.shiftKey && r === i && (e.preventDefault(), n && $e(a, { select: !0 })) : r === t && e.preventDefault();
		}
	}, [
		n,
		i,
		m.paused
	]);
	return /* @__PURE__ */ b(I.div, {
		tabIndex: -1,
		...s,
		ref: p,
		onKeyDown: h
	});
});
Ke.displayName = Ge;
function qe(e, { select: t = !1 } = {}) {
	let n = document.activeElement;
	for (let r of e) if ($e(r, { select: t }), document.activeElement !== n) return;
}
function Je(e) {
	let t = Ye(e);
	return [Xe(t, e), Xe(t.reverse(), e)];
}
function Ye(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	for (; n.nextNode();) t.push(n.currentNode);
	return t;
}
function Xe(e, t) {
	for (let n of e) if (!Ze(n, { upTo: t })) return n;
}
function Ze(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
function Qe(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
function $e(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = document.activeElement;
		e.focus({ preventScroll: !0 }), e !== n && Qe(e) && t && e.select();
	}
}
var et = tt();
function tt() {
	let e = [];
	return {
		add(t) {
			let n = e[0];
			t !== n && n?.pause(), e = nt(e, t), e.unshift(t);
		},
		remove(t) {
			e = nt(e, t), e[0]?.resume();
		}
	};
}
function nt(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
function rt(e) {
	return e.filter((e) => e.tagName !== "A");
}
//#endregion
//#region node_modules/@radix-ui/react-portal/dist/index.mjs
var it = "Portal", at = r.forwardRef((e, t) => {
	let { container: n, ...i } = e, [a, o] = r.useState(!1);
	V(() => o(!0), []);
	let s = n || a && globalThis?.document?.body;
	return s ? C.createPortal(/* @__PURE__ */ b(I.div, {
		...i,
		ref: t
	}), s) : null;
});
at.displayName = it;
//#endregion
//#region node_modules/@radix-ui/react-focus-guards/dist/index.mjs
var ot = 0;
function st() {
	r.useEffect(() => {
		let e = document.querySelectorAll("[data-radix-focus-guard]");
		return document.body.insertAdjacentElement("afterbegin", e[0] ?? ct()), document.body.insertAdjacentElement("beforeend", e[1] ?? ct()), ot++, () => {
			ot === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((e) => e.remove()), ot--;
		};
	}, []);
}
function ct() {
	let e = document.createElement("span");
	return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
//#endregion
//#region node_modules/tslib/tslib.es6.mjs
var lt = function() {
	return lt = Object.assign || function(e) {
		for (var t, n = 1, r = arguments.length; n < r; n++) for (var i in t = arguments[n], t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
		return e;
	}, lt.apply(this, arguments);
};
function ut(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
function dt(e, t, n) {
	if (n || arguments.length === 2) for (var r = 0, i = t.length, a; r < i; r++) (a || !(r in t)) && (a || (a = Array.prototype.slice.call(t, 0, r)), a[r] = t[r]);
	return e.concat(a || Array.prototype.slice.call(t));
}
//#endregion
//#region node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var ft = "right-scroll-bar-position", pt = "width-before-scroll-bar", mt = "with-scroll-bars-hidden", ht = "--removed-body-scroll-bar-size";
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/assignRef.js
function gt(e, t) {
	return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
//#endregion
//#region node_modules/use-callback-ref/dist/es2015/useRef.js
function _t(e, t) {
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
var vt = typeof window < "u" ? r.useLayoutEffect : r.useEffect, yt = /* @__PURE__ */ new WeakMap();
function bt(e, t) {
	var n = _t(t || null, function(t) {
		return e.forEach(function(e) {
			return gt(e, t);
		});
	});
	return vt(function() {
		var t = yt.get(n);
		if (t) {
			var r = new Set(t), i = new Set(e), a = n.current;
			r.forEach(function(e) {
				i.has(e) || gt(e, null);
			}), i.forEach(function(e) {
				r.has(e) || gt(e, a);
			});
		}
		yt.set(n, e);
	}, [e]), n;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/medium.js
function xt(e) {
	return e;
}
function St(e, t) {
	t === void 0 && (t = xt);
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
function Ct(e) {
	e === void 0 && (e = {});
	var t = St(null);
	return t.options = lt({
		async: !0,
		ssr: !1
	}, e), t;
}
//#endregion
//#region node_modules/use-sidecar/dist/es2015/exports.js
var wt = function(e) {
	var t = e.sideCar, n = ut(e, ["sideCar"]);
	if (!t) throw Error("Sidecar: please provide `sideCar` property to import the right car");
	var i = t.read();
	if (!i) throw Error("Sidecar medium not found");
	return r.createElement(i, lt({}, n));
};
wt.isSideCarExport = !0;
function Tt(e, t) {
	return e.useMedium(t), wt;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/medium.js
var Et = Ct(), Dt = function() {}, Ot = r.forwardRef(function(e, t) {
	var n = r.useRef(null), i = r.useState({
		onScrollCapture: Dt,
		onWheelCapture: Dt,
		onTouchMoveCapture: Dt
	}), a = i[0], o = i[1], s = e.forwardProps, c = e.children, l = e.className, u = e.removeScrollBar, d = e.enabled, f = e.shards, p = e.sideCar, m = e.noRelative, h = e.noIsolation, g = e.inert, _ = e.allowPinchZoom, v = e.as, y = v === void 0 ? "div" : v, b = e.gapMode, x = ut(e, [
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
	]), S = p, C = bt([n, t]), w = lt(lt({}, x), a);
	return r.createElement(r.Fragment, null, d && r.createElement(S, {
		sideCar: Et,
		removeScrollBar: u,
		shards: f,
		noRelative: m,
		noIsolation: h,
		inert: g,
		setCallbacks: o,
		allowPinchZoom: !!_,
		lockRef: n,
		gapMode: b
	}), s ? r.cloneElement(r.Children.only(c), lt(lt({}, w), { ref: C })) : r.createElement(y, lt({}, w, {
		className: l,
		ref: C
	}), c));
});
Ot.defaultProps = {
	enabled: !0,
	removeScrollBar: !0,
	inert: !1
}, Ot.classNames = {
	fullWidth: pt,
	zeroRight: ft
};
//#endregion
//#region node_modules/get-nonce/dist/es2015/index.js
var kt, At = function() {
	if (kt) return kt;
	if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
//#endregion
//#region node_modules/react-style-singleton/dist/es2015/singleton.js
function jt() {
	if (!document) return null;
	var e = document.createElement("style");
	e.type = "text/css";
	var t = At();
	return t && e.setAttribute("nonce", t), e;
}
function Mt(e, t) {
	e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function Nt(e) {
	(document.head || document.getElementsByTagName("head")[0]).appendChild(e);
}
var Pt = function() {
	var e = 0, t = null;
	return {
		add: function(n) {
			e == 0 && (t = jt()) && (Mt(t, n), Nt(t)), e++;
		},
		remove: function() {
			e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
		}
	};
}, Ft = function() {
	var e = Pt();
	return function(t, n) {
		r.useEffect(function() {
			return e.add(t), function() {
				e.remove();
			};
		}, [t && n]);
	};
}, It = function() {
	var e = Ft();
	return function(t) {
		var n = t.styles, r = t.dynamic;
		return e(n, r), null;
	};
}, Lt = {
	left: 0,
	top: 0,
	right: 0,
	gap: 0
}, Rt = function(e) {
	return parseInt(e || "", 10) || 0;
}, zt = function(e) {
	var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
	return [
		Rt(n),
		Rt(r),
		Rt(i)
	];
}, Bt = function(e) {
	if (e === void 0 && (e = "margin"), typeof window > "u") return Lt;
	var t = zt(e), n = document.documentElement.clientWidth, r = window.innerWidth;
	return {
		left: t[0],
		top: t[1],
		right: t[2],
		gap: Math.max(0, r - n + t[2] - t[0])
	};
}, Vt = It(), Ht = "data-scroll-locked", Ut = function(e, t, n, r) {
	var i = e.left, a = e.top, o = e.right, s = e.gap;
	return n === void 0 && (n = "margin"), `
  .${mt} {
   overflow: hidden ${r};
   padding-right: ${s}px ${r};
  }
  body[${Ht}] {
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
  
  .${ft} {
    right: ${s}px ${r};
  }
  
  .${pt} {
    margin-right: ${s}px ${r};
  }
  
  .${ft} .${ft} {
    right: 0 ${r};
  }
  
  .${pt} .${pt} {
    margin-right: 0 ${r};
  }
  
  body[${Ht}] {
    ${ht}: ${s}px;
  }
`;
}, Wt = function() {
	var e = parseInt(document.body.getAttribute("data-scroll-locked") || "0", 10);
	return isFinite(e) ? e : 0;
}, Gt = function() {
	r.useEffect(function() {
		return document.body.setAttribute(Ht, (Wt() + 1).toString()), function() {
			var e = Wt() - 1;
			e <= 0 ? document.body.removeAttribute(Ht) : document.body.setAttribute(Ht, e.toString());
		};
	}, []);
}, Kt = function(e) {
	var t = e.noRelative, n = e.noImportant, i = e.gapMode, a = i === void 0 ? "margin" : i;
	Gt();
	var o = r.useMemo(function() {
		return Bt(a);
	}, [a]);
	return r.createElement(Vt, { styles: Ut(o, !t, a, n ? "" : "!important") });
}, qt = !1;
if (typeof window < "u") try {
	var Jt = Object.defineProperty({}, "passive", { get: function() {
		return qt = !0, !0;
	} });
	window.addEventListener("test", Jt, Jt), window.removeEventListener("test", Jt, Jt);
} catch {
	qt = !1;
}
var Yt = qt ? { passive: !1 } : !1, Xt = function(e) {
	return e.tagName === "TEXTAREA";
}, Zt = function(e, t) {
	if (!(e instanceof Element)) return !1;
	var n = window.getComputedStyle(e);
	return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !Xt(e) && n[t] === "visible");
}, Qt = function(e) {
	return Zt(e, "overflowY");
}, $t = function(e) {
	return Zt(e, "overflowX");
}, en = function(e, t) {
	var n = t.ownerDocument, r = t;
	do {
		if (typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host), rn(e, r)) {
			var i = an(e, r);
			if (i[1] > i[2]) return !0;
		}
		r = r.parentNode;
	} while (r && r !== n.body);
	return !1;
}, tn = function(e) {
	return [
		e.scrollTop,
		e.scrollHeight,
		e.clientHeight
	];
}, nn = function(e) {
	return [
		e.scrollLeft,
		e.scrollWidth,
		e.clientWidth
	];
}, rn = function(e, t) {
	return e === "v" ? Qt(t) : $t(t);
}, an = function(e, t) {
	return e === "v" ? tn(t) : nn(t);
}, on = function(e, t) {
	return e === "h" && t === "rtl" ? -1 : 1;
}, sn = function(e, t, n, r, i) {
	var a = on(e, window.getComputedStyle(t).direction), o = a * r, s = n.target, c = t.contains(s), l = !1, u = o > 0, d = 0, f = 0;
	do {
		if (!s) break;
		var p = an(e, s), m = p[0], h = p[1] - p[2] - a * m;
		(m || h) && rn(e, s) && (d += h, f += m);
		var g = s.parentNode;
		s = g && g.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? g.host : g;
	} while (!c && s !== document.body || c && (t.contains(s) || t === s));
	return (u && (i && Math.abs(d) < 1 || !i && o > d) || !u && (i && Math.abs(f) < 1 || !i && -o > f)) && (l = !0), l;
}, cn = function(e) {
	return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, ln = function(e) {
	return [e.deltaX, e.deltaY];
}, un = function(e) {
	return e && "current" in e ? e.current : e;
}, dn = function(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}, fn = function(e) {
	return `
  .block-interactivity-${e} {pointer-events: none;}
  .allow-interactivity-${e} {pointer-events: all;}
`;
}, pn = 0, mn = [];
function hn(e) {
	var t = r.useRef([]), n = r.useRef([0, 0]), i = r.useRef(), a = r.useState(pn++)[0], o = r.useState(It)[0], s = r.useRef(e);
	r.useEffect(function() {
		s.current = e;
	}, [e]), r.useEffect(function() {
		if (e.inert) {
			document.body.classList.add(`block-interactivity-${a}`);
			var t = dt([e.lockRef.current], (e.shards || []).map(un), !0).filter(Boolean);
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
		var r = cn(e), a = n.current, o = "deltaX" in e ? e.deltaX : a[0] - r[0], c = "deltaY" in e ? e.deltaY : a[1] - r[1], l, u = e.target, d = Math.abs(o) > Math.abs(c) ? "h" : "v";
		if ("touches" in e && d === "h" && u.type === "range") return !1;
		var f = window.getSelection(), p = f && f.anchorNode;
		if (p && (p === u || p.contains(u))) return !1;
		var m = en(d, u);
		if (!m) return !0;
		if (m ? l = d : (l = d === "v" ? "h" : "v", m = en(d, u)), !m) return !1;
		if (!i.current && "changedTouches" in e && (o || c) && (i.current = l), !l) return !0;
		var h = i.current || l;
		return sn(h, t, e, h === "h" ? o : c, !0);
	}, []), l = r.useCallback(function(e) {
		var n = e;
		if (!(!mn.length || mn[mn.length - 1] !== o)) {
			var r = "deltaY" in n ? ln(n) : cn(n), i = t.current.filter(function(e) {
				return e.name === n.type && (e.target === n.target || n.target === e.shadowParent) && dn(e.delta, r);
			})[0];
			if (i && i.should) {
				n.cancelable && n.preventDefault();
				return;
			}
			if (!i) {
				var a = (s.current.shards || []).map(un).filter(Boolean).filter(function(e) {
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
			shadowParent: gn(r)
		};
		t.current.push(a), setTimeout(function() {
			t.current = t.current.filter(function(e) {
				return e !== a;
			});
		}, 1);
	}, []), d = r.useCallback(function(e) {
		n.current = cn(e), i.current = void 0;
	}, []), f = r.useCallback(function(t) {
		u(t.type, ln(t), t.target, c(t, e.lockRef.current));
	}, []), p = r.useCallback(function(t) {
		u(t.type, cn(t), t.target, c(t, e.lockRef.current));
	}, []);
	r.useEffect(function() {
		return mn.push(o), e.setCallbacks({
			onScrollCapture: f,
			onWheelCapture: f,
			onTouchMoveCapture: p
		}), document.addEventListener("wheel", l, Yt), document.addEventListener("touchmove", l, Yt), document.addEventListener("touchstart", d, Yt), function() {
			mn = mn.filter(function(e) {
				return e !== o;
			}), document.removeEventListener("wheel", l, Yt), document.removeEventListener("touchmove", l, Yt), document.removeEventListener("touchstart", d, Yt);
		};
	}, []);
	var m = e.removeScrollBar, h = e.inert;
	return r.createElement(r.Fragment, null, h ? r.createElement(o, { styles: fn(a) }) : null, m ? r.createElement(Kt, {
		noRelative: e.noRelative,
		gapMode: e.gapMode
	}) : null);
}
function gn(e) {
	for (var t = null; e !== null;) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
	return t;
}
//#endregion
//#region node_modules/react-remove-scroll/dist/es2015/sidecar.js
var _n = Tt(Et, hn), vn = r.forwardRef(function(e, t) {
	return r.createElement(Ot, lt({}, e, {
		ref: t,
		sideCar: _n
	}));
});
vn.classNames = Ot.classNames;
//#endregion
//#region src/lib/remove-scroll-gate.tsx
var yn = r.createContext(!1);
function bn({ allowBodyScroll: e, children: t }) {
	return /* @__PURE__ */ b(yn.Provider, {
		value: e,
		children: t
	});
}
function xn() {
	return r.useContext(yn);
}
//#endregion
//#region src/lib/react-remove-scroll-shim.tsx
var Sn = r.forwardRef(function(e, t) {
	let n = xn() ? !1 : e.enabled !== !1;
	return /* @__PURE__ */ b(vn, {
		...e,
		ref: t,
		enabled: n
	});
});
Sn.classNames = vn.classNames;
//#endregion
//#region node_modules/aria-hidden/dist/es2015/index.js
var Cn = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, wn = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), En = {}, Dn = 0, On = function(e) {
	return e && (e.host || On(e.parentNode));
}, kn = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = On(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, An = function(e, t, n, r) {
	var i = kn(t, Array.isArray(e) ? e : [e]);
	En[n] || (En[n] = /* @__PURE__ */ new WeakMap());
	var a = En[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		!e || s.has(e) || (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		!e || c.has(e) || Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (wn.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				wn.set(e, c), a.set(e, l), o.push(e), c === 1 && i && Tn.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), Dn++, function() {
		o.forEach(function(e) {
			var t = wn.get(e) - 1, i = a.get(e) - 1;
			wn.set(e, t), a.set(e, i), t || (Tn.has(e) || e.removeAttribute(r), Tn.delete(e)), i || e.removeAttribute(n);
		}), Dn--, Dn || (wn = /* @__PURE__ */ new WeakMap(), wn = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), En = {});
	};
}, jn = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || Cn(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), An(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function Mn(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function Nn(e) {
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
var Pn = "Checkbox", [Fn, In] = ae(Pn), [Ln, Rn] = Fn(Pn);
function zn(e) {
	let { __scopeCheckbox: t, checked: n, children: i, defaultChecked: a, disabled: o, form: s, name: c, onCheckedChange: l, required: u, value: d = "on", internal_do_not_use_render: f } = e, [p, m] = me({
		prop: n,
		defaultProp: a ?? !1,
		onChange: l,
		caller: Pn
	}), [h, g] = r.useState(null), [_, v] = r.useState(null), y = r.useRef(!1), x = h ? !!s || !!h.closest("form") : !0, S = {
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
		defaultChecked: Jn(a) ? !1 : a,
		isFormControl: x,
		bubbleInput: _,
		setBubbleInput: v
	};
	return /* @__PURE__ */ b(Ln, {
		scope: t,
		...S,
		children: qn(f) ? f(S) : i
	});
}
var Bn = "CheckboxTrigger", Vn = r.forwardRef(({ __scopeCheckbox: e, onKeyDown: t, onClick: n, ...i }, a) => {
	let { control: o, value: s, disabled: c, checked: l, required: u, setControl: d, setChecked: f, hasConsumerStoppedPropagationRef: p, isFormControl: m, bubbleInput: h } = Rn(Bn, e), g = M(a, d), _ = r.useRef(l);
	return r.useEffect(() => {
		let e = o?.form;
		if (e) {
			let t = () => f(_.current);
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [o, f]), /* @__PURE__ */ b(I.button, {
		type: "button",
		role: "checkbox",
		"aria-checked": Jn(l) ? "mixed" : l,
		"aria-required": u,
		"data-state": Yn(l),
		"data-disabled": c ? "" : void 0,
		disabled: c,
		value: s,
		...i,
		ref: g,
		onKeyDown: B(t, (e) => {
			e.key === "Enter" && e.preventDefault();
		}),
		onClick: B(n, (e) => {
			f((e) => Jn(e) ? !0 : !e), h && m && (p.current = e.isPropagationStopped(), p.current || e.stopPropagation());
		})
	});
});
Vn.displayName = Bn;
var Hn = r.forwardRef((e, t) => {
	let { __scopeCheckbox: n, name: r, checked: i, defaultChecked: a, required: o, disabled: s, value: c, onCheckedChange: l, form: u, ...d } = e;
	return /* @__PURE__ */ b(zn, {
		__scopeCheckbox: n,
		checked: i,
		defaultChecked: a,
		disabled: s,
		required: o,
		onCheckedChange: l,
		name: r,
		form: u,
		value: c,
		internal_do_not_use_render: ({ isFormControl: e }) => /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b(Vn, {
			...d,
			ref: t,
			__scopeCheckbox: n
		}), e && /* @__PURE__ */ b(Kn, { __scopeCheckbox: n })] })
	});
});
Hn.displayName = Pn;
var Un = "CheckboxIndicator", Wn = r.forwardRef((e, t) => {
	let { __scopeCheckbox: n, forceMount: r, ...i } = e, a = Rn(Un, n);
	return /* @__PURE__ */ b(ve, {
		present: r || Jn(a.checked) || a.checked === !0,
		children: /* @__PURE__ */ b(I.span, {
			"data-state": Yn(a.checked),
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
Wn.displayName = Un;
var Gn = "CheckboxBubbleInput", Kn = r.forwardRef(({ __scopeCheckbox: e, ...t }, n) => {
	let { control: i, hasConsumerStoppedPropagationRef: a, checked: o, defaultChecked: s, required: c, disabled: l, name: u, value: d, form: f, bubbleInput: p, setBubbleInput: m } = Rn(Gn, e), h = M(n, m), g = Mn(o), _ = Nn(i);
	r.useEffect(() => {
		let e = p;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, n = Object.getOwnPropertyDescriptor(t, "checked").set, r = !a.current;
		if (g !== o && n) {
			let t = new Event("click", { bubbles: r });
			e.indeterminate = Jn(o), n.call(e, Jn(o) ? !1 : o), e.dispatchEvent(t);
		}
	}, [
		p,
		g,
		o,
		a
	]);
	let v = r.useRef(Jn(o) ? !1 : o);
	return /* @__PURE__ */ b(I.input, {
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
Kn.displayName = Gn;
function qn(e) {
	return typeof e == "function";
}
function Jn(e) {
	return e === "indeterminate";
}
function Yn(e) {
	return Jn(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
//#endregion
//#region node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var Xn = [
	"top",
	"right",
	"bottom",
	"left"
], Zn = Math.min, Qn = Math.max, $n = Math.round, er = Math.floor, tr = (e) => ({
	x: e,
	y: e
}), nr = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function rr(e, t, n) {
	return Qn(e, Zn(t, n));
}
function ir(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function ar(e) {
	return e.split("-")[0];
}
function or(e) {
	return e.split("-")[1];
}
function sr(e) {
	return e === "x" ? "y" : "x";
}
function cr(e) {
	return e === "y" ? "height" : "width";
}
function lr(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function ur(e) {
	return sr(lr(e));
}
function dr(e, t, n) {
	n === void 0 && (n = !1);
	let r = or(e), i = ur(e), a = cr(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = br(o)), [o, br(o)];
}
function fr(e) {
	let t = br(e);
	return [
		pr(e),
		t,
		pr(t)
	];
}
function pr(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var mr = ["left", "right"], hr = ["right", "left"], gr = ["top", "bottom"], _r = ["bottom", "top"];
function vr(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? hr : mr : t ? mr : hr;
		case "left":
		case "right": return t ? gr : _r;
		default: return [];
	}
}
function yr(e, t, n, r) {
	let i = or(e), a = vr(ar(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(pr)))), a;
}
function br(e) {
	let t = ar(e);
	return nr[t] + e.slice(t.length);
}
function xr(e) {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...e
	};
}
function Sr(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : xr(e);
}
function Cr(e) {
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
function wr(e, t, n) {
	let { reference: r, floating: i } = e, a = lr(t), o = ur(t), s = cr(o), c = ar(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	switch (or(t)) {
		case "start":
			p[o] -= f * (n && l ? -1 : 1);
			break;
		case "end":
			p[o] += f * (n && l ? -1 : 1);
			break;
	}
	return p;
}
async function Tr(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = ir(t, e), p = Sr(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = Cr(await i.getClippingRect({
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
	}, y = Cr(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var Er = 50, Dr = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: Tr
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = wr(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < Er && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = wr(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, Or = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = ir(e, t) || {};
		if (l == null) return {};
		let d = Sr(u), f = {
			x: n,
			y: r
		}, p = ur(i), m = cr(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = Zn(d[_], T), D = Zn(d[v], T), O = E, k = C - h[m] - D, A = C / 2 - h[m] / 2 + w, j = rr(O, A, k), M = !c.arrow && or(i) != null && A !== j && a.reference[m] / 2 - (A < O ? E : D) - h[m] / 2 < 0, N = M ? A < O ? A - O : A - k : 0;
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
}), kr = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = ir(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = ar(r), _ = lr(o), v = ar(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [br(o)] : fr(o)), x = p !== "none";
			!d && x && b.push(...yr(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = dr(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (!(u === "alignment" && _ !== lr(t)) || T.every((e) => lr(e.placement) === _ ? e.overflows[0] > 0 : !0))) return {
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
								let t = lr(e.placement);
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
function Ar(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function jr(e) {
	return Xn.some((t) => e[t] >= 0);
}
var Mr = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = ir(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = Ar(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: jr(e)
					} };
				}
				case "escaped": {
					let e = Ar(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: jr(e)
					} };
				}
				default: return {};
			}
		}
	};
}, Nr = /* @__PURE__ */ new Set(["left", "top"]);
async function Pr(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = ar(n), s = or(n), c = lr(n) === "y", l = Nr.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = ir(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var Fr = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await Pr(t, e);
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
}, Ir = function(e) {
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
			} }, ...l } = ir(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = lr(ar(i)), p = sr(f), m = u[p], h = u[f];
			if (o) {
				let e = p === "y" ? "top" : "left", t = p === "y" ? "bottom" : "right", n = m + d[e], r = m - d[t];
				m = rr(n, m, r);
			}
			if (s) {
				let e = f === "y" ? "top" : "left", t = f === "y" ? "bottom" : "right", n = h + d[e], r = h - d[t];
				h = rr(n, h, r);
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
}, Lr = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = ir(e, t), u = {
				x: n,
				y: r
			}, d = lr(i), f = sr(d), p = u[f], m = u[d], h = ir(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = Nr.has(ar(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, Rr = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			var n, r;
			let { placement: i, rects: a, platform: o, elements: s } = t, { apply: c = () => {}, ...l } = ir(e, t), u = await o.detectOverflow(t, l), d = ar(i), f = or(i), p = lr(i) === "y", { width: m, height: h } = a.floating, g, _;
			d === "top" || d === "bottom" ? (g = d, _ = f === (await (o.isRTL == null ? void 0 : o.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (_ = d, g = f === "end" ? "top" : "bottom");
			let v = h - u.top - u.bottom, y = m - u.left - u.right, b = Zn(h - u[g], v), x = Zn(m - u[_], y), S = !t.middlewareData.shift, C = b, w = x;
			if ((n = t.middlewareData.shift) != null && n.enabled.x && (w = y), (r = t.middlewareData.shift) != null && r.enabled.y && (C = v), S && !f) {
				let e = Qn(u.left, 0), t = Qn(u.right, 0), n = Qn(u.top, 0), r = Qn(u.bottom, 0);
				p ? w = m - 2 * (e !== 0 || t !== 0 ? e + t : Qn(u.left, u.right)) : C = h - 2 * (n !== 0 || r !== 0 ? n + r : Qn(u.top, u.bottom));
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
function zr() {
	return typeof window < "u";
}
function Br(e) {
	return Ur(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Vr(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Hr(e) {
	return ((Ur(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function Ur(e) {
	return zr() ? e instanceof Node || e instanceof Vr(e).Node : !1;
}
function Wr(e) {
	return zr() ? e instanceof Element || e instanceof Vr(e).Element : !1;
}
function Gr(e) {
	return zr() ? e instanceof HTMLElement || e instanceof Vr(e).HTMLElement : !1;
}
function Kr(e) {
	return !zr() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Vr(e).ShadowRoot;
}
function qr(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = ii(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function Jr(e) {
	return /^(table|td|th)$/.test(Br(e));
}
function Yr(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var Xr = /transform|translate|scale|rotate|perspective|filter/, Zr = /paint|layout|strict|content/, Qr = (e) => !!e && e !== "none", $r;
function ei(e) {
	let t = Wr(e) ? ii(e) : e;
	return Qr(t.transform) || Qr(t.translate) || Qr(t.scale) || Qr(t.rotate) || Qr(t.perspective) || !ni() && (Qr(t.backdropFilter) || Qr(t.filter)) || Xr.test(t.willChange || "") || Zr.test(t.contain || "");
}
function ti(e) {
	let t = oi(e);
	for (; Gr(t) && !ri(t);) {
		if (ei(t)) return t;
		if (Yr(t)) return null;
		t = oi(t);
	}
	return null;
}
function ni() {
	return $r ?? ($r = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), $r;
}
function ri(e) {
	return /^(html|body|#document)$/.test(Br(e));
}
function ii(e) {
	return Vr(e).getComputedStyle(e);
}
function ai(e) {
	return Wr(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function oi(e) {
	if (Br(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Kr(e) && e.host || Hr(e);
	return Kr(t) ? t.host : t;
}
function si(e) {
	let t = oi(e);
	return ri(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : Gr(t) && qr(t) ? t : si(t);
}
function ci(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = si(e), i = r === e.ownerDocument?.body, a = Vr(r);
	if (i) {
		let e = li(a);
		return t.concat(a, a.visualViewport || [], qr(r) ? r : [], e && n ? ci(e) : []);
	} else return t.concat(r, ci(r, [], n));
}
function li(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function ui(e) {
	let t = ii(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = Gr(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = $n(n) !== a || $n(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function di(e) {
	return Wr(e) ? e : e.contextElement;
}
function fi(e) {
	let t = di(e);
	if (!Gr(t)) return tr(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = ui(t), o = (a ? $n(n.width) : n.width) / r, s = (a ? $n(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var pi = /* @__PURE__ */ tr(0);
function mi(e) {
	let t = Vr(e);
	return !ni() || !t.visualViewport ? pi : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function hi(e, t, n) {
	return t === void 0 && (t = !1), !n || t && n !== Vr(e) ? !1 : t;
}
function gi(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = di(e), o = tr(1);
	t && (r ? Wr(r) && (o = fi(r)) : o = fi(e));
	let s = hi(a, n, r) ? mi(a) : tr(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a) {
		let e = Vr(a), t = r && Wr(r) ? Vr(r) : r, n = e, i = li(n);
		for (; i && r && t !== n;) {
			let e = fi(i), t = i.getBoundingClientRect(), r = ii(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = Vr(i), i = li(n);
		}
	}
	return Cr({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function _i(e, t) {
	let n = ai(e).scrollLeft;
	return t ? t.left + n : gi(Hr(e)).left + n;
}
function vi(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - _i(e, n),
		y: n.top + t.scrollTop
	};
}
function yi(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = Hr(r), s = t ? Yr(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = tr(1), u = tr(0), d = Gr(r);
	if ((d || !d && !a) && ((Br(r) !== "body" || qr(o)) && (c = ai(r)), d)) {
		let e = gi(r);
		l = fi(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? vi(o, c) : tr(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function bi(e) {
	return Array.from(e.getClientRects());
}
function xi(e) {
	let t = Hr(e), n = ai(e), r = e.ownerDocument.body, i = Qn(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), a = Qn(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight), o = -n.scrollLeft + _i(e), s = -n.scrollTop;
	return ii(r).direction === "rtl" && (o += Qn(t.clientWidth, r.clientWidth) - i), {
		width: i,
		height: a,
		x: o,
		y: s
	};
}
var Si = 25;
function Ci(e, t) {
	let n = Vr(e), r = Hr(e), i = n.visualViewport, a = r.clientWidth, o = r.clientHeight, s = 0, c = 0;
	if (i) {
		a = i.width, o = i.height;
		let e = ni();
		(!e || e && t === "fixed") && (s = i.offsetLeft, c = i.offsetTop);
	}
	let l = _i(r);
	if (l <= 0) {
		let e = r.ownerDocument, t = e.body, n = getComputedStyle(t), i = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, o = Math.abs(r.clientWidth - t.clientWidth - i);
		o <= Si && (a -= o);
	} else l <= Si && (a += l);
	return {
		width: a,
		height: o,
		x: s,
		y: c
	};
}
function wi(e, t) {
	let n = gi(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = Gr(e) ? fi(e) : tr(1);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function Ti(e, t, n) {
	let r;
	if (t === "viewport") r = Ci(e, n);
	else if (t === "document") r = xi(Hr(e));
	else if (Wr(t)) r = wi(t, n);
	else {
		let n = mi(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return Cr(r);
}
function Ei(e, t) {
	let n = oi(e);
	return n === t || !Wr(n) || ri(n) ? !1 : ii(n).position === "fixed" || Ei(n, t);
}
function Di(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = ci(e, [], !1).filter((e) => Wr(e) && Br(e) !== "body"), i = null, a = ii(e).position === "fixed", o = a ? oi(e) : e;
	for (; Wr(o) && !ri(o);) {
		let t = ii(o), n = ei(o);
		!n && t.position === "fixed" && (i = null), (a ? !n && !i : !n && t.position === "static" && i && (i.position === "absolute" || i.position === "fixed") || qr(o) && !n && Ei(e, o)) ? r = r.filter((e) => e !== o) : i = t, o = oi(o);
	}
	return t.set(e, r), r;
}
function Oi(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? Yr(t) ? [] : Di(t, this._c) : [].concat(n), r], o = Ti(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = Ti(t, a[e], i);
		s = Qn(n.top, s), c = Zn(n.right, c), l = Zn(n.bottom, l), u = Qn(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function ki(e) {
	let { width: t, height: n } = ui(e);
	return {
		width: t,
		height: n
	};
}
function Ai(e, t, n) {
	let r = Gr(t), i = Hr(t), a = n === "fixed", o = gi(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = tr(0);
	function l() {
		c.x = _i(i);
	}
	if (r || !r && !a) if ((Br(t) !== "body" || qr(i)) && (s = ai(t)), r) {
		let e = gi(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	} else i && l();
	a && !r && i && l();
	let u = i && !r && !a ? vi(i, s) : tr(0);
	return {
		x: o.left + s.scrollLeft - c.x - u.x,
		y: o.top + s.scrollTop - c.y - u.y,
		width: o.width,
		height: o.height
	};
}
function ji(e) {
	return ii(e).position === "static";
}
function Mi(e, t) {
	if (!Gr(e) || ii(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Hr(e) === n && (n = n.ownerDocument.body), n;
}
function Ni(e, t) {
	let n = Vr(e);
	if (Yr(e)) return n;
	if (!Gr(e)) {
		let t = oi(e);
		for (; t && !ri(t);) {
			if (Wr(t) && !ji(t)) return t;
			t = oi(t);
		}
		return n;
	}
	let r = Mi(e, t);
	for (; r && Jr(r) && ji(r);) r = Mi(r, t);
	return r && ri(r) && ji(r) && !ei(r) ? n : r || ti(e) || n;
}
var Pi = async function(e) {
	let t = this.getOffsetParent || Ni, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: Ai(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function Fi(e) {
	return ii(e).direction === "rtl";
}
var Ii = {
	convertOffsetParentRelativeRectToViewportRelativeRect: yi,
	getDocumentElement: Hr,
	getClippingRect: Oi,
	getOffsetParent: Ni,
	getElementRects: Pi,
	getClientRects: bi,
	getDimensions: ki,
	getScale: fi,
	isElement: Wr,
	isRTL: Fi
};
function Li(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function Ri(e, t) {
	let n = null, r, i = Hr(e);
	function a() {
		var e;
		clearTimeout(r), (e = n) == null || e.disconnect(), n = null;
	}
	function o(s, c) {
		s === void 0 && (s = !1), c === void 0 && (c = 1), a();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (s || t(), !f || !p) return;
		let m = er(d), h = er(i.clientWidth - (u + f)), g = er(i.clientHeight - (d + p)), _ = er(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: Qn(0, Zn(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (n !== c) {
				if (!y) return o();
				n ? o(!1, n) : r = setTimeout(() => {
					o(!1, 1e-7);
				}, 1e3);
			}
			n === 1 && !Li(l, e.getBoundingClientRect()) && o(), y = !1;
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
function zi(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = di(e), u = i || a ? [...l ? ci(l) : [], ...t ? ci(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n, { passive: !0 }), a && e.addEventListener("resize", n);
	});
	let d = l && s ? Ri(l, n) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? gi(e) : null;
	c && g();
	function g() {
		let t = gi(e);
		h && !Li(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var Bi = Fr, Vi = Ir, Hi = kr, Ui = Rr, Wi = Mr, Gi = Or, Ki = Lr, qi = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = {
		platform: Ii,
		...n
	}, a = {
		...i.platform,
		_c: r
	};
	return Dr(e, t, {
		...i,
		platform: a
	});
}, Ji = typeof document < "u" ? l : function() {};
function Yi(e, t) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (typeof e == "function" && e.toString() === t.toString()) return !0;
	let n, r, i;
	if (e && t && typeof e == "object") {
		if (Array.isArray(e)) {
			if (n = e.length, n !== t.length) return !1;
			for (r = n; r-- !== 0;) if (!Yi(e[r], t[r])) return !1;
			return !0;
		}
		if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length) return !1;
		for (r = n; r-- !== 0;) if (!{}.hasOwnProperty.call(t, i[r])) return !1;
		for (r = n; r-- !== 0;) {
			let n = i[r];
			if (!(n === "_owner" && e.$$typeof) && !Yi(e[n], t[n])) return !1;
		}
		return !0;
	}
	return e !== e && t !== t;
}
function Xi(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Zi(e, t) {
	let n = Xi(e);
	return Math.round(t * n) / n;
}
function Qi(e) {
	let t = r.useRef(e);
	return Ji(() => {
		t.current = e;
	}), t;
}
function $i(e) {
	e === void 0 && (e = {});
	let { placement: t = "bottom", strategy: n = "absolute", middleware: i = [], platform: a, elements: { reference: o, floating: s } = {}, transform: c = !0, whileElementsMounted: l, open: u } = e, [d, f] = r.useState({
		x: 0,
		y: 0,
		strategy: n,
		placement: t,
		middlewareData: {},
		isPositioned: !1
	}), [p, m] = r.useState(i);
	Yi(p, i) || m(i);
	let [h, g] = r.useState(null), [_, v] = r.useState(null), y = r.useCallback((e) => {
		e !== w.current && (w.current = e, g(e));
	}, []), b = r.useCallback((e) => {
		e !== T.current && (T.current = e, v(e));
	}, []), x = o || h, C = s || _, w = r.useRef(null), T = r.useRef(null), E = r.useRef(d), D = l != null, O = Qi(l), k = Qi(a), A = Qi(u), j = r.useCallback(() => {
		if (!w.current || !T.current) return;
		let e = {
			placement: t,
			strategy: n,
			middleware: p
		};
		k.current && (e.platform = k.current), qi(w.current, T.current, e).then((e) => {
			let t = {
				...e,
				isPositioned: A.current !== !1
			};
			M.current && !Yi(E.current, t) && (E.current = t, S.flushSync(() => {
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
	Ji(() => {
		u === !1 && E.current.isPositioned && (E.current.isPositioned = !1, f((e) => ({
			...e,
			isPositioned: !1
		})));
	}, [u]);
	let M = r.useRef(!1);
	Ji(() => (M.current = !0, () => {
		M.current = !1;
	}), []), Ji(() => {
		if (x && (w.current = x), C && (T.current = C), x && C) {
			if (O.current) return O.current(x, C, j);
			j();
		}
	}, [
		x,
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
		reference: x,
		floating: C
	}), [x, C]), ee = r.useMemo(() => {
		let e = {
			position: n,
			left: 0,
			top: 0
		};
		if (!P.floating) return e;
		let t = Zi(P.floating, d.x), r = Zi(P.floating, d.y);
		return c ? {
			...e,
			transform: "translate(" + t + "px, " + r + "px)",
			...Xi(P.floating) >= 1.5 && { willChange: "transform" }
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
var ea = (e) => {
	function t(e) {
		return {}.hasOwnProperty.call(e, "current");
	}
	return {
		name: "arrow",
		options: e,
		fn(n) {
			let { element: r, padding: i } = typeof e == "function" ? e(n) : e;
			return r && t(r) ? r.current == null ? {} : Gi({
				element: r.current,
				padding: i
			}).fn(n) : r ? Gi({
				element: r,
				padding: i
			}).fn(n) : {};
		}
	};
}, ta = (e, t) => {
	let n = Bi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, na = (e, t) => {
	let n = Vi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, ra = (e, t) => ({
	fn: Ki(e).fn,
	options: [e, t]
}), ia = (e, t) => {
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
	let n = Wi(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, sa = (e, t) => {
	let n = ea(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, ca = "Arrow", la = r.forwardRef((e, t) => {
	let { children: n, width: r = 10, height: i = 5, ...a } = e;
	return /* @__PURE__ */ b(I.svg, {
		...a,
		ref: t,
		width: r,
		height: i,
		viewBox: "0 0 30 10",
		preserveAspectRatio: "none",
		children: e.asChild ? n : /* @__PURE__ */ b("polygon", { points: "0,0 30,0 15,10" })
	});
});
la.displayName = ca;
var ua = la, da = "Popper", [fa, pa] = ae(da), [ma, ha] = fa(da), ga = (e) => {
	let { __scopePopper: t, children: n } = e, [i, a] = r.useState(null);
	return /* @__PURE__ */ b(ma, {
		scope: t,
		anchor: i,
		onAnchorChange: a,
		children: n
	});
};
ga.displayName = da;
var _a = "PopperAnchor", va = r.forwardRef((e, t) => {
	let { __scopePopper: n, virtualRef: i, ...a } = e, o = ha(_a, n), s = r.useRef(null), c = M(t, s), l = r.useRef(null);
	return r.useEffect(() => {
		let e = l.current;
		l.current = i?.current || s.current, e !== l.current && o.onAnchorChange(l.current);
	}), i ? null : /* @__PURE__ */ b(I.div, {
		...a,
		ref: c
	});
});
va.displayName = _a;
var ya = "PopperContent", [ba, xa] = fa(ya), Sa = r.forwardRef((e, t) => {
	let { __scopePopper: n, side: i = "bottom", sideOffset: a = 0, align: o = "center", alignOffset: s = 0, arrowPadding: c = 0, avoidCollisions: l = !0, collisionBoundary: u = [], collisionPadding: d = 0, sticky: f = "partial", hideWhenDetached: p = !1, updatePositionStrategy: m = "optimized", onPlaced: h, ...g } = e, _ = ha(ya, n), [v, y] = r.useState(null), x = M(t, (e) => y(e)), [S, C] = r.useState(null), w = Nn(S), T = w?.width ?? 0, E = w?.height ?? 0, D = i + (o === "center" ? "" : "-" + o), O = typeof d == "number" ? d : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...d
	}, k = Array.isArray(u) ? u : [u], A = k.length > 0, j = {
		padding: O,
		boundary: k.filter(Ea),
		altBoundary: A
	}, { refs: N, floatingStyles: P, placement: ee, isPositioned: F, middlewareData: te } = $i({
		strategy: "fixed",
		placement: D,
		whileElementsMounted: (...e) => zi(...e, { animationFrame: m === "always" }),
		elements: { reference: _.anchor },
		middleware: [
			ta({
				mainAxis: a + E,
				alignmentAxis: s
			}),
			l && na({
				mainAxis: !0,
				crossAxis: !1,
				limiter: f === "partial" ? ra() : void 0,
				...j
			}),
			l && ia({ ...j }),
			aa({
				...j,
				apply: ({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--radix-popper-available-width", `${n}px`), o.setProperty("--radix-popper-available-height", `${r}px`), o.setProperty("--radix-popper-anchor-width", `${i}px`), o.setProperty("--radix-popper-anchor-height", `${a}px`);
				}
			}),
			S && sa({
				element: S,
				padding: c
			}),
			Da({
				arrowWidth: T,
				arrowHeight: E
			}),
			p && oa({
				strategy: "referenceHidden",
				...j
			})
		]
	}), [ne, re] = Oa(ee), L = De(h);
	V(() => {
		F && L?.();
	}, [F, L]);
	let R = te.arrow?.x, ie = te.arrow?.y, ae = te.arrow?.centerOffset !== 0, [z, oe] = r.useState();
	return V(() => {
		v && oe(window.getComputedStyle(v).zIndex);
	}, [v]), /* @__PURE__ */ b("div", {
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
		children: /* @__PURE__ */ b(ba, {
			scope: n,
			placedSide: ne,
			onArrowChange: C,
			arrowX: R,
			arrowY: ie,
			shouldHideArrow: ae,
			children: /* @__PURE__ */ b(I.div, {
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
Sa.displayName = ya;
var Ca = "PopperArrow", wa = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
}, Ta = r.forwardRef(function(e, t) {
	let { __scopePopper: n, ...r } = e, i = xa(Ca, n), a = wa[i.placedSide];
	return /* @__PURE__ */ b("span", {
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
		children: /* @__PURE__ */ b(ua, {
			...r,
			ref: t,
			style: {
				...r.style,
				display: "block"
			}
		})
	});
});
Ta.displayName = Ca;
function Ea(e) {
	return e !== null;
}
var Da = (e) => ({
	name: "transformOrigin",
	options: e,
	fn(t) {
		let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = Oa(n), u = {
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
function Oa(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
var ka = ga, Aa = va, ja = Sa, Ma = Ta, Na = "Label", Pa = r.forwardRef((e, t) => /* @__PURE__ */ b(I.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
Pa.displayName = Na;
var Fa = Pa;
//#endregion
//#region node_modules/@radix-ui/number/dist/index.mjs
function Ia(e, [t, n]) {
	return Math.min(n, Math.max(t, e));
}
//#endregion
//#region node_modules/@radix-ui/react-select/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function La(e) {
	let t = /* @__PURE__ */ Ra(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Ba);
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
function Ra(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Ha(n), a = Va(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? j(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var za = Symbol("radix.slottable");
function Ba(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === za;
}
function Va(e, t) {
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
function Ha(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-select/dist/index.mjs
var Ua = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], Wa = [" ", "Enter"], Ga = "Select", [Ka, qa, Ja] = fe(Ga), [Ya, Xa] = ae(Ga, [Ja, pa]), Za = pa(), [Qa, $a] = Ya(Ga), [eo, to] = Ya(Ga), no = (e) => {
	let { __scopeSelect: t, children: n, open: i, defaultOpen: a, onOpenChange: o, value: s, defaultValue: c, onValueChange: l, dir: u, name: d, autoComplete: f, disabled: p, required: m, form: h } = e, g = Za(t), [_, v] = r.useState(null), [y, S] = r.useState(null), [C, w] = r.useState(!1), T = Ee(u), [E, D] = me({
		prop: i,
		defaultProp: a ?? !1,
		onChange: o,
		caller: Ga
	}), [O, k] = me({
		prop: s,
		defaultProp: c,
		onChange: l,
		caller: Ga
	}), A = r.useRef(null), j = _ ? h || !!_.closest("form") : !0, [M, N] = r.useState(/* @__PURE__ */ new Set()), P = Array.from(M).map((e) => e.props.value).join(";");
	return /* @__PURE__ */ b(ka, {
		...g,
		children: /* @__PURE__ */ x(Qa, {
			required: m,
			scope: t,
			trigger: _,
			onTriggerChange: v,
			valueNode: y,
			onValueNodeChange: S,
			valueNodeHasChildren: C,
			onValueNodeHasChildrenChange: w,
			contentId: we(),
			value: O,
			onValueChange: k,
			open: E,
			onOpenChange: D,
			dir: T,
			triggerPointerDownPosRef: A,
			disabled: p,
			children: [/* @__PURE__ */ b(Ka.Provider, {
				scope: t,
				children: /* @__PURE__ */ b(eo, {
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
			}), j ? /* @__PURE__ */ x(Qo, {
				"aria-hidden": !0,
				required: m,
				tabIndex: -1,
				name: d,
				autoComplete: f,
				value: O,
				onChange: (e) => k(e.target.value),
				disabled: p,
				form: h,
				children: [O === void 0 ? /* @__PURE__ */ b("option", { value: "" }) : null, Array.from(M)]
			}, P) : null]
		})
	});
};
no.displayName = Ga;
var ro = "SelectTrigger", io = r.forwardRef((e, t) => {
	let { __scopeSelect: n, disabled: i = !1, ...a } = e, o = Za(n), s = $a(ro, n), c = s.disabled || i, l = M(t, s.onTriggerChange), u = qa(n), d = r.useRef("touch"), [f, p, m] = es((e) => {
		let t = u().filter((e) => !e.disabled), n = ts(t, e, t.find((e) => e.value === s.value));
		n !== void 0 && s.onValueChange(n.value);
	}), h = (e) => {
		c || (s.onOpenChange(!0), m()), e && (s.triggerPointerDownPosRef.current = {
			x: Math.round(e.pageX),
			y: Math.round(e.pageY)
		});
	};
	return /* @__PURE__ */ b(Aa, {
		asChild: !0,
		...o,
		children: /* @__PURE__ */ b(I.button, {
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
			"data-placeholder": $o(s.value) ? "" : void 0,
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
				!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && p(e.key), !(t && e.key === " ") && Ua.includes(e.key) && (h(), e.preventDefault());
			})
		})
	});
});
io.displayName = ro;
var ao = "SelectValue", oo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: r, style: i, children: a, placeholder: o = "", ...s } = e, c = $a(ao, n), { onValueNodeHasChildrenChange: l } = c, u = a !== void 0, d = M(t, c.onValueNodeChange);
	return V(() => {
		l(u);
	}, [l, u]), /* @__PURE__ */ b(I.span, {
		...s,
		ref: d,
		style: { pointerEvents: "none" },
		children: $o(c.value) ? /* @__PURE__ */ b(y, { children: o }) : a
	});
});
oo.displayName = ao;
var so = "SelectIcon", co = r.forwardRef((e, t) => {
	let { __scopeSelect: n, children: r, ...i } = e;
	return /* @__PURE__ */ b(I.span, {
		"aria-hidden": !0,
		...i,
		ref: t,
		children: r || "▼"
	});
});
co.displayName = so;
var lo = "SelectPortal", uo = (e) => /* @__PURE__ */ b(at, {
	asChild: !0,
	...e
});
uo.displayName = lo;
var fo = "SelectContent", po = r.forwardRef((e, t) => {
	let n = $a(fo, e.__scopeSelect), [i, a] = r.useState();
	if (V(() => {
		a(new DocumentFragment());
	}, []), !n.open) {
		let t = i;
		return t ? S.createPortal(/* @__PURE__ */ b(ho, {
			scope: e.__scopeSelect,
			children: /* @__PURE__ */ b(Ka.Slot, {
				scope: e.__scopeSelect,
				children: /* @__PURE__ */ b("div", { children: e.children })
			})
		}), t) : null;
	}
	return /* @__PURE__ */ b(yo, {
		...e,
		ref: t
	});
});
po.displayName = fo;
var mo = 10, [ho, go] = Ya(fo), _o = "SelectContentImpl", vo = /* @__PURE__ */ La("SelectContent.RemoveScroll"), yo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, position: i = "item-aligned", onCloseAutoFocus: a, onEscapeKeyDown: o, onPointerDownOutside: s, side: c, sideOffset: l, align: u, alignOffset: d, arrowPadding: f, collisionBoundary: p, collisionPadding: m, sticky: h, hideWhenDetached: g, avoidCollisions: _, ...v } = e, y = $a(fo, n), [x, S] = r.useState(null), [C, w] = r.useState(null), T = M(t, (e) => S(e)), [E, D] = r.useState(null), [O, k] = r.useState(null), A = qa(n), [j, N] = r.useState(!1), P = r.useRef(!1);
	r.useEffect(() => {
		if (x) return jn(x);
	}, [x]), st();
	let ee = r.useCallback((e) => {
		let [t, ...n] = A().map((e) => e.ref.current), [r] = n.slice(-1), i = document.activeElement;
		for (let n of e) if (n === i || (n?.scrollIntoView({ block: "nearest" }), n === t && C && (C.scrollTop = 0), n === r && C && (C.scrollTop = C.scrollHeight), n?.focus(), document.activeElement !== i)) return;
	}, [A, C]), F = r.useCallback(() => ee([E, x]), [
		ee,
		E,
		x
	]);
	r.useEffect(() => {
		j && F();
	}, [j, F]);
	let { onOpenChange: te, triggerPointerDownPosRef: ne } = y;
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
	let [I, re] = es((e) => {
		let t = A().filter((e) => !e.disabled), n = ts(t, e, t.find((e) => e.ref.current === document.activeElement));
		n && setTimeout(() => n.ref.current.focus());
	}), L = r.useCallback((e, t, n) => {
		let r = !P.current && !n;
		(y.value !== void 0 && y.value === t || r) && (D(e), r && (P.current = !0));
	}, [y.value]), R = r.useCallback(() => x?.focus(), [x]), ie = r.useCallback((e, t, n) => {
		let r = !P.current && !n;
		(y.value !== void 0 && y.value === t || r) && k(e);
	}, [y.value]), ae = i === "popper" ? Co : xo, z = ae === Co ? {
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
	return /* @__PURE__ */ b(ho, {
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
		isPositioned: j,
		searchRef: I,
		children: /* @__PURE__ */ b(Sn, {
			as: vo,
			allowPinchZoom: !0,
			children: /* @__PURE__ */ b(Ke, {
				asChild: !0,
				trapped: y.open,
				onMountAutoFocus: (e) => {
					e.preventDefault();
				},
				onUnmountAutoFocus: B(a, (e) => {
					y.trigger?.focus({ preventScroll: !0 }), e.preventDefault();
				}),
				children: /* @__PURE__ */ b(Fe, {
					asChild: !0,
					disableOutsidePointerEvents: !0,
					onEscapeKeyDown: o,
					onPointerDownOutside: s,
					onFocusOutside: (e) => e.preventDefault(),
					onDismiss: () => y.onOpenChange(!1),
					children: /* @__PURE__ */ b(ae, {
						role: "listbox",
						id: y.contentId,
						"data-state": y.open ? "open" : "closed",
						dir: y.dir,
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
yo.displayName = _o;
var bo = "SelectItemAlignedPosition", xo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onPlaced: i, ...a } = e, o = $a(fo, n), s = go(fo, n), [c, l] = r.useState(null), [u, d] = r.useState(null), f = M(t, (e) => d(e)), p = qa(n), m = r.useRef(!1), h = r.useRef(!0), { viewport: g, selectedItem: _, selectedItemText: v, focusSelectedItem: y } = s, x = r.useCallback(() => {
		if (o.trigger && o.valueNode && c && u && g && _ && v) {
			let e = o.trigger.getBoundingClientRect(), t = u.getBoundingClientRect(), n = o.valueNode.getBoundingClientRect(), r = v.getBoundingClientRect();
			if (o.dir !== "rtl") {
				let i = r.left - t.left, a = n.left - i, o = e.left - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - mo, d = Ia(a, [mo, Math.max(mo, u - l)]);
				c.style.minWidth = s + "px", c.style.left = d + "px";
			} else {
				let i = t.right - r.right, a = window.innerWidth - n.right - i, o = window.innerWidth - e.right - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - mo, d = Ia(a, [mo, Math.max(mo, u - l)]);
				c.style.minWidth = s + "px", c.style.right = d + "px";
			}
			let a = p(), s = window.innerHeight - mo * 2, l = g.scrollHeight, d = window.getComputedStyle(u), f = parseInt(d.borderTopWidth, 10), h = parseInt(d.paddingTop, 10), y = parseInt(d.borderBottomWidth, 10), b = parseInt(d.paddingBottom, 10), x = f + h + l + b + y, S = Math.min(_.offsetHeight * 5, x), C = window.getComputedStyle(g), w = parseInt(C.paddingTop, 10), T = parseInt(C.paddingBottom, 10), E = e.top + e.height / 2 - mo, D = s - E, O = _.offsetHeight / 2, k = _.offsetTop + O, A = f + h + k, j = x - A;
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
			c.style.margin = `${mo}px 0`, c.style.minHeight = S + "px", c.style.maxHeight = s + "px", i?.(), requestAnimationFrame(() => m.current = !0);
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
	}, [u]), /* @__PURE__ */ b(wo, {
		scope: n,
		contentWrapper: c,
		shouldExpandOnScrollRef: m,
		onScrollButtonChange: r.useCallback((e) => {
			e && h.current === !0 && (x(), y?.(), h.current = !1);
		}, [x, y]),
		children: /* @__PURE__ */ b("div", {
			ref: l,
			style: {
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: S
			},
			children: /* @__PURE__ */ b(I.div, {
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
xo.displayName = bo;
var So = "SelectPopperPosition", Co = r.forwardRef((e, t) => {
	let { __scopeSelect: n, align: r = "start", collisionPadding: i = mo, ...a } = e;
	return /* @__PURE__ */ b(ja, {
		...Za(n),
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
Co.displayName = So;
var [wo, To] = Ya(fo, {}), Eo = "SelectViewport", Do = r.forwardRef((e, t) => {
	let { __scopeSelect: n, nonce: i, ...a } = e, o = go(Eo, n), s = To(Eo, n), c = M(t, o.onViewportChange), l = r.useRef(0);
	return /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b("style", {
		dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" },
		nonce: i
	}), /* @__PURE__ */ b(Ka.Slot, {
		scope: n,
		children: /* @__PURE__ */ b(I.div, {
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
						let r = window.innerHeight - mo * 2, i = parseFloat(n.style.minHeight), a = parseFloat(n.style.height), o = Math.max(i, a);
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
Do.displayName = Eo;
var Oo = "SelectGroup", [ko, Ao] = Ya(Oo), jo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = we();
	return /* @__PURE__ */ b(ko, {
		scope: n,
		id: i,
		children: /* @__PURE__ */ b(I.div, {
			role: "group",
			"aria-labelledby": i,
			...r,
			ref: t
		})
	});
});
jo.displayName = Oo;
var Mo = "SelectLabel", No = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = Ao(Mo, n);
	return /* @__PURE__ */ b(I.div, {
		id: i.id,
		...r,
		ref: t
	});
});
No.displayName = Mo;
var Po = "SelectItem", [Fo, Io] = Ya(Po), Lo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, value: i, disabled: a = !1, textValue: o, ...s } = e, c = $a(Po, n), l = go(Po, n), u = c.value === i, [d, f] = r.useState(o ?? ""), [p, m] = r.useState(!1), h = M(t, (e) => l.itemRefCallback?.(e, i, a)), g = we(), _ = r.useRef("touch"), v = () => {
		a || (c.onValueChange(i), c.onOpenChange(!1));
	};
	if (i === "") throw Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
	return /* @__PURE__ */ b(Fo, {
		scope: n,
		value: i,
		disabled: a,
		textId: g,
		isSelected: u,
		onItemTextChange: r.useCallback((e) => {
			f((t) => t || (e?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ b(Ka.ItemSlot, {
			scope: n,
			value: i,
			disabled: a,
			textValue: d,
			children: /* @__PURE__ */ b(I.div, {
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
					l.searchRef?.current !== "" && e.key === " " || (Wa.includes(e.key) && v(), e.key === " " && e.preventDefault());
				})
			})
		})
	});
});
Lo.displayName = Po;
var Ro = "SelectItemText", zo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, className: i, style: a, ...o } = e, s = $a(Ro, n), c = go(Ro, n), l = Io(Ro, n), u = to(Ro, n), [d, f] = r.useState(null), p = M(t, (e) => f(e), l.onItemTextChange, (e) => c.itemTextRefCallback?.(e, l.value, l.disabled)), m = d?.textContent, h = r.useMemo(() => /* @__PURE__ */ b("option", {
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
	]), /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b(I.span, {
		id: l.textId,
		...o,
		ref: p
	}), l.isSelected && s.valueNode && !s.valueNodeHasChildren ? S.createPortal(o.children, s.valueNode) : null] });
});
zo.displayName = Ro;
var Bo = "SelectItemIndicator", Vo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return Io(Bo, n).isSelected ? /* @__PURE__ */ b(I.span, {
		"aria-hidden": !0,
		...r,
		ref: t
	}) : null;
});
Vo.displayName = Bo;
var Ho = "SelectScrollUpButton", Uo = r.forwardRef((e, t) => {
	let n = go(Ho, e.__scopeSelect), i = To(Ho, e.__scopeSelect), [a, o] = r.useState(!1), s = M(t, i.onScrollButtonChange);
	return V(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				o(t.scrollTop > 0);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ b(Ko, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop -= t.offsetHeight);
		}
	}) : null;
});
Uo.displayName = Ho;
var Wo = "SelectScrollDownButton", Go = r.forwardRef((e, t) => {
	let n = go(Wo, e.__scopeSelect), i = To(Wo, e.__scopeSelect), [a, o] = r.useState(!1), s = M(t, i.onScrollButtonChange);
	return V(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				let e = t.scrollHeight - t.clientHeight;
				o(Math.ceil(t.scrollTop) < e);
			}, t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), a ? /* @__PURE__ */ b(Ko, {
		...e,
		ref: s,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop += t.offsetHeight);
		}
	}) : null;
});
Go.displayName = Wo;
var Ko = r.forwardRef((e, t) => {
	let { __scopeSelect: n, onAutoScroll: i, ...a } = e, o = go("SelectScrollButton", n), s = r.useRef(null), c = qa(n), l = r.useCallback(() => {
		s.current !== null && (window.clearInterval(s.current), s.current = null);
	}, []);
	return r.useEffect(() => () => l(), [l]), V(() => {
		c().find((e) => e.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
	}, [c]), /* @__PURE__ */ b(I.div, {
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
}), qo = "SelectSeparator", Jo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e;
	return /* @__PURE__ */ b(I.div, {
		"aria-hidden": !0,
		...r,
		ref: t
	});
});
Jo.displayName = qo;
var Yo = "SelectArrow", Xo = r.forwardRef((e, t) => {
	let { __scopeSelect: n, ...r } = e, i = Za(n), a = $a(Yo, n), o = go(Yo, n);
	return a.open && o.position === "popper" ? /* @__PURE__ */ b(Ma, {
		...i,
		...r,
		ref: t
	}) : null;
});
Xo.displayName = Yo;
var Zo = "SelectBubbleInput", Qo = r.forwardRef(({ __scopeSelect: e, value: t, ...n }, i) => {
	let a = r.useRef(null), o = M(i, a), s = Mn(t);
	return r.useEffect(() => {
		let e = a.current;
		if (!e) return;
		let n = window.HTMLSelectElement.prototype, r = Object.getOwnPropertyDescriptor(n, "value").set;
		if (s !== t && r) {
			let n = new Event("change", { bubbles: !0 });
			r.call(e, t), e.dispatchEvent(n);
		}
	}, [s, t]), /* @__PURE__ */ b(I.select, {
		...n,
		style: {
			...L,
			...n.style
		},
		ref: o,
		defaultValue: t
	});
});
Qo.displayName = Zo;
function $o(e) {
	return e === "" || e === void 0;
}
function es(e) {
	let t = De(e), n = r.useRef(""), i = r.useRef(0), a = r.useCallback((e) => {
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
function ts(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = ns(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.textValue.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
function ns(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
var rs = no, is = io, as = oo, os = co, ss = uo, cs = po, ls = Do, us = Lo, ds = zo, fs = Vo, ps = Uo, ms = Go;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function hs(e) {
	let t = /* @__PURE__ */ _s(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(ys);
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
var gs = /* @__PURE__ */ hs("Slot");
/* @__NO_SIDE_EFFECTS__ */
function _s(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = xs(n), a = bs(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? j(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var vs = Symbol("radix.slottable");
function ys(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === vs;
}
function bs(e, t) {
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
function xs(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/tailwind-merge/dist/bundle-mjs.mjs
var Ss = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, Cs = (e, t) => ({
	classGroupId: e,
	validator: t
}), ws = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), Ts = "-", Es = [], Ds = "arbitrary..", Os = (e) => {
	let t = js(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return As(e);
			let n = e.split(Ts);
			return ks(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? Ss(i, t) : t : i || Es;
			}
			return n[e] || Es;
		}
	};
}, ks = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = ks(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(Ts) : e.slice(t).join(Ts), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, As = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? Ds + r : void 0;
})(), js = (e) => {
	let { theme: t, classGroups: n } = e;
	return Ms(n, t);
}, Ms = (e, t) => {
	let n = ws();
	for (let r in e) {
		let i = e[r];
		Ns(i, n, r, t);
	}
	return n;
}, Ns = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		Ps(i, t, n, r);
	}
}, Ps = (e, t, n, r) => {
	if (typeof e == "string") {
		Fs(e, t, n);
		return;
	}
	if (typeof e == "function") {
		Is(e, t, n, r);
		return;
	}
	Ls(e, t, n, r);
}, Fs = (e, t, n) => {
	let r = e === "" ? t : Rs(t, e);
	r.classGroupId = n;
}, Is = (e, t, n, r) => {
	if (zs(e)) {
		Ns(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(Cs(n, e));
}, Ls = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		Ns(o, Rs(t, a), n, r);
	}
}, Rs = (e, t) => {
	let n = e, r = t.split(Ts), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = ws(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, zs = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Bs = (e) => {
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
}, Vs = "!", Hs = ":", Us = [], Ws = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), Gs = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === Hs) {
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
		s.endsWith(Vs) ? (c = s.slice(0, -1), l = !0) : s.startsWith(Vs) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return Ws(t, l, c, u);
	};
	if (t) {
		let e = t + Hs, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : Ws(Us, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, Ks = (e) => {
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
}, qs = (e) => ({
	cache: Bs(e.cacheSize),
	parseClassName: Gs(e),
	sortModifiers: Ks(e),
	...Os(e)
}), Js = /\s+/, Ys = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(Js), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + Vs : g, v = _ + h;
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
}, Xs = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = Zs(n)) && (i && (i += " "), i += r);
	return i;
}, Zs = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = Zs(e[r])) && (n && (n += " "), n += t);
	return n;
}, Qs = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = qs(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = Ys(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(Xs(...e));
}, $s = [], H = (e) => {
	let t = (t) => t[e] || $s;
	return t.isThemeGetter = !0, t;
}, ec = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, tc = /^\((?:(\w[\w-]*):)?(.+)\)$/i, nc = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, rc = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, ic = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, ac = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, oc = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, sc = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, cc = (e) => nc.test(e), U = (e) => !!e && !Number.isNaN(Number(e)), lc = (e) => !!e && Number.isInteger(Number(e)), uc = (e) => e.endsWith("%") && U(e.slice(0, -1)), dc = (e) => rc.test(e), fc = () => !0, pc = (e) => ic.test(e) && !ac.test(e), mc = () => !1, hc = (e) => oc.test(e), gc = (e) => sc.test(e), _c = (e) => !W(e) && !G(e), vc = (e) => Nc(e, Lc, mc), W = (e) => ec.test(e), yc = (e) => Nc(e, Rc, pc), bc = (e) => Nc(e, zc, U), xc = (e) => Nc(e, Vc, fc), Sc = (e) => Nc(e, Bc, mc), Cc = (e) => Nc(e, Fc, mc), wc = (e) => Nc(e, Ic, gc), Tc = (e) => Nc(e, Hc, hc), G = (e) => tc.test(e), Ec = (e) => Pc(e, Rc), Dc = (e) => Pc(e, Bc), Oc = (e) => Pc(e, Fc), kc = (e) => Pc(e, Lc), Ac = (e) => Pc(e, Ic), jc = (e) => Pc(e, Hc, !0), Mc = (e) => Pc(e, Vc, !0), Nc = (e, t, n) => {
	let r = ec.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, Pc = (e, t, n = !1) => {
	let r = tc.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, Fc = (e) => e === "position" || e === "percentage", Ic = (e) => e === "image" || e === "url", Lc = (e) => e === "length" || e === "size" || e === "bg-size", Rc = (e) => e === "length", zc = (e) => e === "number", Bc = (e) => e === "family-name", Vc = (e) => e === "number" || e === "weight", Hc = (e) => e === "shadow", Uc = /* @__PURE__ */ Qs(() => {
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
		cc,
		"full",
		"auto",
		...w()
	], E = () => [
		lc,
		"none",
		"subgrid",
		G,
		W
	], D = () => [
		"auto",
		{ span: [
			"full",
			lc,
			G,
			W
		] },
		lc,
		G,
		W
	], O = () => [
		lc,
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
		cc,
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
		cc,
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
		cc,
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
		Oc,
		Cc,
		{ position: [G, W] }
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
		kc,
		vc,
		{ size: [G, W] }
	], re = () => [
		uc,
		Ec,
		yc
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
		Ec,
		yc
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
		uc,
		Oc,
		Cc
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
		cc,
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
			blur: [dc],
			breakpoint: [dc],
			color: [fc],
			container: [dc],
			"drop-shadow": [dc],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [_c],
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
			"inset-shadow": [dc],
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
			radius: [dc],
			shadow: [dc],
			spacing: ["px", U],
			text: [dc],
			"text-shadow": [dc],
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
				cc,
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
				lc,
				"auto",
				G,
				W
			] }],
			basis: [{ basis: [
				cc,
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
				cc,
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
				lc,
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
				Ec,
				yc
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				Mc,
				xc
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
				uc,
				W
			] }],
			"font-family": [{ font: [
				Dc,
				Sc,
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
				bc
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
				yc
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
						lc,
						G,
						W
					],
					radial: [
						"",
						G,
						W
					],
					conic: [
						lc,
						G,
						W
					]
				},
				Ac,
				wc
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
				Ec,
				yc
			] }],
			"outline-color": [{ outline: F() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				jc,
				Tc
			] }],
			"shadow-color": [{ shadow: F() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				jc,
				Tc
			] }],
			"inset-shadow-color": [{ "inset-shadow": F() }],
			"ring-w": [{ ring: R() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: F() }],
			"ring-offset-w": [{ "ring-offset": [U, yc] }],
			"ring-offset-color": [{ "ring-offset": F() }],
			"inset-ring-w": [{ "inset-ring": R() }],
			"inset-ring-color": [{ "inset-ring": F() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				jc,
				Tc
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
			"mask-repeat": [{ mask: ne() }],
			"mask-size": [{ mask: I() }],
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
				jc,
				Tc
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
				Ec,
				yc,
				bc
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
function Wc(...e) {
	return Uc(E(e));
}
//#endregion
//#region src/components/ui/button.tsx
var Gc = k("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
	return /* @__PURE__ */ b(r ? gs : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: Wc(Gc({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var Kc = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), qc = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Jc = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), Yc = (e) => {
	let t = Jc(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, Xc = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, Zc = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, Qc = a({}), $c = () => c(Qc), el = s(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: a, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = $c() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return o("svg", {
		ref: l,
		...Xc,
		width: t ?? u ?? Xc.width,
		height: t ?? u ?? Xc.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: Kc("lucide", m, i),
		...!a && !Zc(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => o(e, t)), ...Array.isArray(a) ? a : [a]]);
}), tl = (e, t) => {
	let n = s(({ className: n, ...r }, i) => o(el, {
		ref: i,
		iconNode: t,
		className: Kc(`lucide-${qc(Yc(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = Yc(e), n;
}, nl = tl("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]), rl = tl("chevron-down", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]), il = tl("chevron-up", [["path", {
	d: "m18 15-6-6-6 6",
	key: "153udz"
}]]);
//#endregion
//#region src/components/ui/checkbox.tsx
function al({ className: e, ...t }) {
	return /* @__PURE__ */ b(Hn, {
		"data-slot": "checkbox",
		className: Wc("peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary", e),
		...t,
		children: /* @__PURE__ */ b(Wn, {
			"data-slot": "checkbox-indicator",
			className: "grid place-content-center text-current transition-none",
			children: /* @__PURE__ */ b(nl, { className: "size-3.5" })
		})
	});
}
//#endregion
//#region src/components/ui/input.tsx
function q({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ b("input", {
		type: t,
		"data-slot": "input",
		className: Wc("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function J({ className: e, ...t }) {
	return /* @__PURE__ */ b(Fa, {
		"data-slot": "label",
		className: Wc("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/hooks/use-text-direction.ts
function ol() {
	let { i18n: e } = _();
	return e.dir() === "rtl" ? "rtl" : "ltr";
}
//#endregion
//#region src/components/ui/select.tsx
function sl({ ...e }) {
	return /* @__PURE__ */ b(rs, {
		"data-slot": "select",
		...e
	});
}
function cl({ ...e }) {
	return /* @__PURE__ */ b(as, {
		"data-slot": "select-value",
		...e
	});
}
function ll({ className: e, size: t = "default", children: n, ...r }) {
	return /* @__PURE__ */ x(is, {
		"data-slot": "select-trigger",
		"data-size": t,
		dir: ol(),
		className: Wc("flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap text-start shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", e),
		...r,
		children: [n, /* @__PURE__ */ b(os, {
			asChild: !0,
			children: /* @__PURE__ */ b(rl, { className: "size-4 opacity-50" })
		})]
	});
}
function ul({ className: e, children: t, position: n = "popper", align: r = "start", ...i }) {
	return /* @__PURE__ */ b(bn, {
		allowBodyScroll: !0,
		children: /* @__PURE__ */ b(ss, { children: /* @__PURE__ */ x(cs, {
			"data-slot": "select-content",
			dir: ol(),
			className: Wc("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-start text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", e),
			position: n,
			align: r,
			...i,
			children: [
				/* @__PURE__ */ b(fl, {}),
				/* @__PURE__ */ b(ls, {
					className: Wc("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
					children: t
				}),
				/* @__PURE__ */ b(pl, {})
			]
		}) })
	});
}
function dl({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ x(us, {
		"data-slot": "select-item",
		className: Wc("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pe-8 ps-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", e),
		...n,
		children: [/* @__PURE__ */ b("span", {
			"data-slot": "select-item-indicator",
			className: "absolute end-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ b(fs, { children: /* @__PURE__ */ b(nl, { className: "size-4" }) })
		}), /* @__PURE__ */ b(ds, { children: t })]
	});
}
function fl({ className: e, ...t }) {
	return /* @__PURE__ */ b(ps, {
		"data-slot": "select-scroll-up-button",
		className: Wc("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ b(il, { className: "size-4" })
	});
}
function pl({ className: e, ...t }) {
	return /* @__PURE__ */ b(ms, {
		"data-slot": "select-scroll-down-button",
		className: Wc("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ b(rl, { className: "size-4" })
	});
}
//#endregion
//#region src/lib/marketplace-api.ts
function ml(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function hl(e) {
	"@babel/helpers - typeof";
	return hl = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, hl(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function gl(e, t) {
	if (hl(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (hl(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function _l(e) {
	var t = gl(e, "string");
	return hl(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function vl(e, t, n) {
	return (t = _l(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/lib/apiError.ts
var yl = class extends Error {
	constructor(e, t) {
		super(e), vl(this, "code", void 0), vl(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, bl = {
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
function xl(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function Sl(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function Cl(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(ml(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function wl(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return Cl(e, n);
	if (t instanceof yl && t.code) {
		let n = bl[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = bl[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return xl(n) ? e("errors.api.timeout") : Sl(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function Y(e, t) {
	v.error(wl(e, t));
}
//#endregion
//#region src/lib/queryClient.ts
var Tl = null;
function El() {
	return Tl;
}
//#endregion
//#region src/lib/authLost.ts
var Dl = ["auth", "session"], Ol = new Set([
	"rest_cookie_invalid_nonce",
	"rest_not_logged_in",
	"invalid_nonce",
	"ajax_referer_failed",
	"-1"
]);
function kl(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (t.status === 401) return !0;
	let n = typeof t.code == "string" ? t.code : "";
	if (Ol.has(n)) return !0;
	let r = typeof t.message == "string" ? t.message.toLowerCase() : "";
	return !!(r.includes("cookie nonce is invalid") || r.includes("rest_cookie_invalid_nonce") || t.status === 403 && (n === "-1" || r === "-1" || r.includes("are you sure you want to do this")));
}
function Al(e) {
	let t = e ?? El();
	t && t.setQueryData(Dl, { logged_in: !1 });
}
function jl(e) {
	kl(e) && Al();
}
//#endregion
//#region src/lib/safeUrl.ts
function Ml(e) {
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
function Nl() {
	return window.webinoDashboard;
}
var Pl = 3e4;
function Fl(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function Il(e) {
	let t = Nl();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (Fl(e) || Ml(e)) return e;
	throw new yl("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function Ll(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function Rl(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") || t.startsWith("shop/reports") || t.startsWith("shop/product-categories") || t === "comments" || t.startsWith("comments/") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : /^(payments|torobpay|snapppay|digipay|zarinpal|bale-pay|wallet|c2c)(\/|$)/.test(t) ? "webino_dashboard_payments_rest" : t.startsWith("analytics/") && t !== "analytics/hit" ? "webino_dashboard_analytics_rest" : null;
}
function zl(e, t) {
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
function Bl(e, t) {
	let n = e.toLowerCase();
	return e.includes("Upstream Error") || e.includes("Forbidden") || t === 403 ? "admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry" : n.includes("timed out") || n.includes("timeout") || t === 504 || t === 524 ? "Request timed out — RSA-4096 generation can take over a minute on weak hosts" : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? `Invalid AJAX response (HTML, HTTP ${t || 0})` : `Invalid AJAX response (HTTP ${t || 0})`;
}
async function Vl(e, t, n = {}) {
	let r = Rl(e), i = Nl();
	if (!r || !i.ajaxUrl) throw new yl("AJAX fallback unavailable", {
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
	let { signal: l, clear: u } = Ll({}, t);
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
			throw new yl(Bl(t, e.status), {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!n.success) {
			let t = new yl(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
				code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
				status: e.status
			});
			throw jl(t), t;
		}
		return n.data;
	} catch (e) {
		throw e instanceof yl ? (jl(e), e) : e instanceof DOMException && e.name === "AbortError" ? new yl("Request timed out", {
			code: "timeout",
			status: 0
		}) : e instanceof TypeError ? new yl("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		u();
	}
}
async function X(e, t = {}, n = Pl) {
	if (Rl(e) && Nl().ajaxUrl) return Vl(e, n, t);
	let r = Il(e), i = Nl(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce), !Object.keys(a).some((e) => e.toLowerCase() === "content-type") && typeof t.body == "string" && t.body.length > 0 && (a["Content-Type"] = "application/json");
	let { signal: s, clear: c } = Ll(t, n);
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
			let t = zl(n, e.status);
			throw new yl(t.message, {
				code: t.code,
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i, n = new yl(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
			throw jl(n), n;
		}
		return i;
	} catch (e) {
		throw e instanceof yl ? (jl(e), e) : e instanceof DOMException && e.name === "AbortError" ? new yl("Request timed out", {
			code: "timeout",
			status: 0
		}) : e instanceof TypeError ? new yl("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region ../Modules/accounting-module/client/pages/accounting/AccountingSettingsPage.tsx
var Hl = [
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
	return /* @__PURE__ */ x("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ b(J, { children: e }), /* @__PURE__ */ b(q, {
			type: r,
			value: t,
			placeholder: i,
			onChange: (e) => n(e.target.value)
		})]
	});
}
function Ul() {
	let { t: r } = _(), i = n(), a = m().pathname, o = a.endsWith("/company") ? "company" : a.endsWith("/sync") ? "sync" : a.endsWith("/tax") ? "tax" : a.endsWith("/hesabfa") ? "hesabfa" : a.endsWith("/payroll") ? "payroll" : "moadian", s = t({
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
			v.success(r("common.saved")), f({
				...e.settings,
				private_key: "",
				hesabfa_api_key: "",
				hesabfa_login_token: "",
				hesabfa_password: "",
				hesabfa_hook_password: ""
			}), await i.invalidateQueries({ queryKey: ["accounting", "settings"] });
		},
		onError: (e) => Y(r, e)
	}), g = e({
		mutationFn: async () => X("accounting/test-connection", { method: "POST" }),
		onSuccess: () => v.success(r("accounting.testSuccess")),
		onError: (e) => Y(r, e)
	}), S = e({
		mutationFn: async () => X("accounting/hesabfa/test", { method: "POST" }),
		onSuccess: () => v.success(r("accounting.hesabfa.testSuccess")),
		onError: (e) => Y(r, e)
	}), C = e({
		mutationFn: async () => X("accounting/hesabfa/register-hook", { method: "POST" }),
		onSuccess: async () => {
			v.success(r("accounting.hesabfa.hookRegistered")), await i.invalidateQueries({ queryKey: ["accounting", "hesabfa-meta"] }), await i.invalidateQueries({ queryKey: ["accounting", "settings"] });
		},
		onError: (e) => Y(r, e)
	}), T = e({
		mutationFn: async () => X("accounting/hesabfa/migrate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({})
		}),
		onSuccess: (e) => v.success(r("accounting.hesabfa.migrateQueued", { count: e.queued })),
		onError: (e) => Y(r, e)
	}), E = e({
		mutationFn: async () => X("accounting/hesabfa/sync-now", { method: "POST" }),
		onSuccess: (e) => v.success(r("accounting.hesabfa.synced", { count: e.pulled ?? 0 })),
		onError: (e) => Y(r, e)
	}), D = r(o === "company" ? "accounting.settings.company" : o === "sync" ? "accounting.settings.sync" : o === "tax" ? "accounting.settings.tax" : o === "hesabfa" ? "accounting.settings.hesabfa" : o === "payroll" ? "accounting.settings.payroll" : "accounting.settings.moadian");
	if (!p) return /* @__PURE__ */ b(w, {
		title: D,
		children: /* @__PURE__ */ b("div", { children: r("common.loading") })
	});
	let O = p.hesabfa_sync_entities ?? {};
	return /* @__PURE__ */ b(w, {
		title: D,
		description: r("accounting.settingsSubtitle"),
		children: /* @__PURE__ */ x("section", {
			className: "space-y-4 rounded-lg border border-border p-4",
			children: [
				o === "moadian" ? /* @__PURE__ */ x("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [
						/* @__PURE__ */ b(Z, {
							label: r("accounting.fiscalId"),
							value: p.fiscal_id,
							onChange: (e) => f((t) => ({
								...t,
								fiscal_id: e
							}))
						}),
						/* @__PURE__ */ x("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ b(J, { children: r("accounting.taxWizard.transport") }), /* @__PURE__ */ x(sl, {
								value: String(p.moadian_transport ?? "direct"),
								onValueChange: (e) => f((t) => ({
									...t,
									moadian_transport: e
								})),
								children: [/* @__PURE__ */ b(ll, { children: /* @__PURE__ */ b(cl, {}) }), /* @__PURE__ */ x(ul, { children: [/* @__PURE__ */ b(dl, {
									value: "direct",
									children: r("accounting.taxWizard.transportDirect")
								}), /* @__PURE__ */ b(dl, {
									value: "tsp",
									children: r("accounting.taxWizard.transportTsp")
								})] })]
							})]
						}),
						/* @__PURE__ */ b(Z, {
							label: r("accounting.taxWizard.tspUrl"),
							value: String(p.tsp_base_url ?? ""),
							onChange: (e) => f((t) => ({
								...t,
								tsp_base_url: e
							}))
						}),
						/* @__PURE__ */ b(Z, {
							label: r("accounting.taxWizard.tspKey"),
							type: "password",
							value: String(p.tsp_api_key ?? ""),
							placeholder: p.has_tsp_api_key ? "••••••••" : "",
							onChange: (e) => f((t) => ({
								...t,
								tsp_api_key: e
							}))
						}),
						/* @__PURE__ */ x("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ b(J, { children: r("accounting.defaultInvoiceType") }), /* @__PURE__ */ x(sl, {
								value: String(p.default_invoice_type),
								onValueChange: (e) => f((t) => ({
									...t,
									default_invoice_type: Number(e)
								})),
								children: [/* @__PURE__ */ b(ll, { children: /* @__PURE__ */ b(cl, {}) }), /* @__PURE__ */ x(ul, { children: [
									/* @__PURE__ */ b(dl, {
										value: "1",
										children: r("accounting.invoiceType1")
									}),
									/* @__PURE__ */ b(dl, {
										value: "2",
										children: r("accounting.invoiceType2")
									}),
									/* @__PURE__ */ b(dl, {
										value: "3",
										children: r("accounting.invoiceType3")
									})
								] })]
							})]
						}),
						/* @__PURE__ */ b(Z, {
							label: r("accounting.privateKey"),
							type: "password",
							value: p.private_key ?? "",
							placeholder: p.has_private_key ? "••••••••" : "",
							onChange: (e) => f((t) => ({
								...t,
								private_key: e
							}))
						}),
						/* @__PURE__ */ x("div", {
							className: "space-y-2 md:col-span-2",
							children: [/* @__PURE__ */ b(J, { children: r("accounting.certificate") }), /* @__PURE__ */ b("textarea", {
								className: "border-input bg-background flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm",
								value: p.certificate_pem ?? "",
								placeholder: p.has_certificate ? "••••••••" : "",
								onChange: (e) => f((t) => ({
									...t,
									certificate_pem: e.target.value
								}))
							})]
						}),
						/* @__PURE__ */ x("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ b(al, {
								id: "acc-auto",
								checked: p.auto_send_moadian,
								onCheckedChange: (e) => f((t) => ({
									...t,
									auto_send_moadian: e === !0
								}))
							}), /* @__PURE__ */ b(J, {
								htmlFor: "acc-auto",
								children: r("accounting.autoSend")
							})]
						}),
						/* @__PURE__ */ x("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ b(al, {
								id: "acc-sandbox",
								checked: p.moadian_sandbox,
								onCheckedChange: (e) => f((t) => ({
									...t,
									moadian_sandbox: e === !0
								}))
							}), /* @__PURE__ */ b(J, {
								htmlFor: "acc-sandbox",
								children: r("accounting.sandbox")
							})]
						}),
						/* @__PURE__ */ b(Z, {
							label: r("accounting.moadianProxy"),
							value: p.moadian_proxy ?? "",
							placeholder: "http://user:pass@host:port",
							onChange: (e) => f((t) => ({
								...t,
								moadian_proxy: e
							}))
						}),
						/* @__PURE__ */ b("p", {
							className: "text-muted-foreground md:col-span-2 text-xs",
							children: r("accounting.moadianHelp")
						})
					]
				}) : null,
				o === "company" ? /* @__PURE__ */ x("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [
						/* @__PURE__ */ b(Z, {
							label: r("accounting.companyName"),
							value: p.company_name,
							onChange: (e) => f((t) => ({
								...t,
								company_name: e
							}))
						}),
						/* @__PURE__ */ b(Z, {
							label: r("accounting.economicCode"),
							value: p.economic_code,
							onChange: (e) => f((t) => ({
								...t,
								economic_code: e
							}))
						}),
						/* @__PURE__ */ b(Z, {
							label: r("accounting.nationalId"),
							value: p.national_id,
							onChange: (e) => f((t) => ({
								...t,
								national_id: e
							}))
						}),
						/* @__PURE__ */ b(Z, {
							label: r("accounting.postalCode"),
							value: p.postal_code,
							onChange: (e) => f((t) => ({
								...t,
								postal_code: e
							}))
						}),
						/* @__PURE__ */ b(Z, {
							label: r("accounting.province"),
							value: p.province,
							onChange: (e) => f((t) => ({
								...t,
								province: e
							}))
						}),
						/* @__PURE__ */ b(Z, {
							label: r("accounting.city"),
							value: p.city,
							onChange: (e) => f((t) => ({
								...t,
								city: e
							}))
						}),
						/* @__PURE__ */ b(Z, {
							label: r("accounting.phone"),
							value: p.phone,
							onChange: (e) => f((t) => ({
								...t,
								phone: e
							}))
						}),
						/* @__PURE__ */ x("div", {
							className: "space-y-2 md:col-span-2",
							children: [/* @__PURE__ */ b(J, { children: r("accounting.address") }), /* @__PURE__ */ b("textarea", {
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
				o === "sync" ? /* @__PURE__ */ x("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ x("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ b(al, {
								id: "acc-cogs",
								checked: p.snapshot_cogs,
								onCheckedChange: (e) => f((t) => ({
									...t,
									snapshot_cogs: e === !0
								}))
							}), /* @__PURE__ */ b(J, {
								htmlFor: "acc-cogs",
								children: r("accounting.snapshotCogs")
							})]
						}),
						/* @__PURE__ */ b(Z, {
							label: r("accounting.syncStatuses"),
							value: (p.sync_order_statuses ?? []).join(","),
							onChange: (e) => f((t) => ({
								...t,
								sync_order_statuses: e.split(",").map((e) => e.trim()).filter(Boolean)
							}))
						}),
						/* @__PURE__ */ b("p", {
							className: "text-muted-foreground text-xs",
							children: r("accounting.syncHelp")
						})
					]
				}) : null,
				o === "tax" ? /* @__PURE__ */ x("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [/* @__PURE__ */ b(Z, {
						label: r("accounting.defaultVat"),
						type: "number",
						value: String(p.default_vat_rate),
						onChange: (e) => f((t) => ({
							...t,
							default_vat_rate: Number(e) || 0
						}))
					}), Object.entries(p.account_map ?? {}).map(([e, t]) => /* @__PURE__ */ b(Z, {
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
				o === "hesabfa" ? /* @__PURE__ */ x("div", {
					className: "space-y-6",
					children: [
						/* @__PURE__ */ x("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ b(al, {
								id: "hesabfa-on",
								checked: !!p.hesabfa_enabled,
								onCheckedChange: (e) => f((t) => ({
									...t,
									hesabfa_enabled: e === !0
								}))
							}), /* @__PURE__ */ b(J, {
								htmlFor: "hesabfa-on",
								children: r("accounting.hesabfa.enabled")
							})]
						}),
						/* @__PURE__ */ x("div", {
							className: "grid gap-4 md:grid-cols-2",
							children: [
								/* @__PURE__ */ b(Z, {
									label: r("accounting.hesabfa.apiKey"),
									type: "password",
									value: p.hesabfa_api_key ?? "",
									placeholder: p.hesabfa_api_key_masked || "",
									onChange: (e) => f((t) => ({
										...t,
										hesabfa_api_key: e
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.hesabfa.loginToken"),
									type: "password",
									value: p.hesabfa_login_token ?? "",
									placeholder: p.has_hesabfa_login_token ? "••••••••" : "",
									onChange: (e) => f((t) => ({
										...t,
										hesabfa_login_token: e
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.hesabfa.userId"),
									value: p.hesabfa_user_id ?? "",
									onChange: (e) => f((t) => ({
										...t,
										hesabfa_user_id: e
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.hesabfa.password"),
									type: "password",
									value: p.hesabfa_password ?? "",
									placeholder: p.has_hesabfa_password ? "••••••••" : "",
									onChange: (e) => f((t) => ({
										...t,
										hesabfa_password: e
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.hesabfa.yearId"),
									type: "number",
									value: String(p.hesabfa_year_id ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										hesabfa_year_id: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ x("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ b(J, { children: r("accounting.hesabfa.currency") }), /* @__PURE__ */ x(sl, {
										value: p.hesabfa_currency ?? "IRT",
										onValueChange: (e) => f((t) => ({
											...t,
											hesabfa_currency: e
										})),
										children: [/* @__PURE__ */ b(ll, { children: /* @__PURE__ */ b(cl, {}) }), /* @__PURE__ */ x(ul, { children: [/* @__PURE__ */ b(dl, {
											value: "IRT",
											children: "IRT (تومان)"
										}), /* @__PURE__ */ b(dl, {
											value: "IRR",
											children: "IRR (ریال)"
										})] })]
									})]
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.hesabfa.defaultBank"),
									value: p.hesabfa_default_bank_code ?? "",
									onChange: (e) => f((t) => ({
										...t,
										hesabfa_default_bank_code: e
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.hesabfa.defaultWarehouse"),
									value: p.hesabfa_default_warehouse_code ?? "",
									onChange: (e) => f((t) => ({
										...t,
										hesabfa_default_warehouse_code: e
									}))
								}),
								/* @__PURE__ */ b(Z, {
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
						/* @__PURE__ */ x("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ b(al, {
								id: "hesabfa-link",
								checked: p.hesabfa_link_wc_only !== !1,
								onCheckedChange: (e) => f((t) => ({
									...t,
									hesabfa_link_wc_only: e === !0
								}))
							}), /* @__PURE__ */ b(J, {
								htmlFor: "hesabfa-link",
								children: r("accounting.hesabfa.linkWcOnly")
							})]
						}),
						/* @__PURE__ */ x("div", { children: [/* @__PURE__ */ b("p", {
							className: "mb-2 text-sm font-medium",
							children: r("accounting.hesabfa.entities")
						}), /* @__PURE__ */ b("div", {
							className: "grid gap-2 sm:grid-cols-2 md:grid-cols-3",
							children: Hl.map((e) => /* @__PURE__ */ x("label", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ b(al, {
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
						c.data?.hook_url ? /* @__PURE__ */ x("p", {
							className: "text-muted-foreground break-all text-xs",
							children: [
								r("accounting.hesabfa.hookUrl"),
								": ",
								c.data.hook_url
							]
						}) : null,
						/* @__PURE__ */ x("p", {
							className: "text-muted-foreground text-xs",
							children: [
								r("accounting.hesabfa.lastChangeId"),
								": ",
								p.hesabfa_last_change_id ?? 0
							]
						}),
						/* @__PURE__ */ b("p", {
							className: "text-muted-foreground text-xs",
							children: r("accounting.hesabfa.help")
						})
					]
				}) : null,
				o === "payroll" ? /* @__PURE__ */ x("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ b("p", {
							className: "text-muted-foreground text-sm",
							children: r("accounting.payroll.settingsHelp")
						}),
						/* @__PURE__ */ x("div", {
							className: "grid gap-4 md:grid-cols-2",
							children: [
								/* @__PURE__ */ b(Z, {
									label: r("accounting.payroll.employeeInsPct"),
									type: "number",
									value: String(p.employee_insurance_pct ?? 7),
									onChange: (e) => f((t) => ({
										...t,
										employee_insurance_pct: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.payroll.employerInsPct"),
									type: "number",
									value: String(p.employer_insurance_pct ?? 20),
									onChange: (e) => f((t) => ({
										...t,
										employer_insurance_pct: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.payroll.unemploymentPct"),
									type: "number",
									value: String(p.unemployment_insurance_pct ?? 3),
									onChange: (e) => f((t) => ({
										...t,
										unemployment_insurance_pct: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.payroll.minDailyWage"),
									type: "number",
									value: String(p.payroll_min_daily_wage ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										payroll_min_daily_wage: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.payroll.ceilingMultiplier"),
									type: "number",
									value: String(p.payroll_ceiling_multiplier ?? 7),
									onChange: (e) => f((t) => ({
										...t,
										payroll_ceiling_multiplier: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.payroll.taxExemption"),
									type: "number",
									value: String(p.payroll_tax_exemption ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										payroll_tax_exemption: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.payroll.legalFood"),
									type: "number",
									value: String(p.payroll_legal_food ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										payroll_legal_food: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.payroll.legalHousing"),
									type: "number",
									value: String(p.payroll_legal_housing ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										payroll_legal_housing: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.payroll.legalMarriage"),
									type: "number",
									value: String(p.payroll_legal_marriage ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										payroll_legal_marriage: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.payroll.legalSeniority"),
									type: "number",
									value: String(p.payroll_legal_seniority ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										payroll_legal_seniority: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.payroll.overtimeRate"),
									type: "number",
									value: String(p.payroll_overtime_rate ?? 1.4),
									onChange: (e) => f((t) => ({
										...t,
										payroll_overtime_rate: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.payroll.nightOtRate"),
									type: "number",
									value: String(p.payroll_night_ot_rate ?? 1.35),
									onChange: (e) => f((t) => ({
										...t,
										payroll_night_ot_rate: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.payroll.holidayOtRate"),
									type: "number",
									value: String(p.payroll_holiday_ot_rate ?? 1.4),
									onChange: (e) => f((t) => ({
										...t,
										payroll_holiday_ot_rate: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ b(Z, {
									label: r("accounting.payroll.childBenefitEach"),
									type: "number",
									value: String(p.payroll_child_benefit_each ?? 0),
									onChange: (e) => f((t) => ({
										...t,
										payroll_child_benefit_each: Number(e) || 0
									}))
								}),
								/* @__PURE__ */ b(Z, {
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
						/* @__PURE__ */ x("div", {
							className: "flex flex-wrap gap-4",
							children: [/* @__PURE__ */ x("label", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ b(al, {
									checked: p.payroll_volume_insurable !== !1,
									onCheckedChange: (e) => f((t) => ({
										...t,
										payroll_volume_insurable: e === !0
									}))
								}), r("accounting.payroll.volumeInsurable")]
							}), /* @__PURE__ */ x("label", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ b(al, {
									checked: p.payroll_sick_counts_worked !== !1,
									onCheckedChange: (e) => f((t) => ({
										...t,
										payroll_sick_counts_worked: e === !0
									}))
								}), r("accounting.payroll.sickCountsWorked")]
							})]
						}),
						/* @__PURE__ */ x("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ b("p", {
								className: "text-sm font-medium",
								children: r("accounting.payroll.taxBrackets")
							}), (p.payroll_tax_brackets ?? []).map((e, t) => /* @__PURE__ */ x("div", {
								className: "flex flex-wrap gap-2",
								children: [/* @__PURE__ */ b(q, {
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
								}), /* @__PURE__ */ b(q, {
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
						/* @__PURE__ */ b("p", {
							className: "text-muted-foreground text-xs",
							children: r("accounting.payroll.taminGuide")
						})
					]
				}) : null,
				/* @__PURE__ */ x("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ b(K, {
							onClick: () => void h.mutate(),
							disabled: h.isPending,
							children: r("common.save")
						}),
						o === "moadian" ? /* @__PURE__ */ b(K, {
							variant: "outline",
							onClick: () => void g.mutate(),
							disabled: g.isPending,
							children: r("accounting.testConnection")
						}) : null,
						o === "hesabfa" ? /* @__PURE__ */ x(y, { children: [
							/* @__PURE__ */ b(K, {
								variant: "outline",
								onClick: () => void S.mutate(),
								disabled: S.isPending,
								children: r("accounting.hesabfa.test")
							}),
							/* @__PURE__ */ b(K, {
								variant: "outline",
								onClick: () => void C.mutate(),
								disabled: C.isPending,
								children: r("accounting.hesabfa.registerHook")
							}),
							/* @__PURE__ */ b(K, {
								variant: "outline",
								onClick: () => void E.mutate(),
								disabled: E.isPending,
								children: r("accounting.hesabfa.syncNow")
							}),
							/* @__PURE__ */ b(K, {
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
var Wl = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function Gl({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card",
		"data-variant": t,
		className: Wc("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", Wl[t], e),
		...n
	});
}
function Kl({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-header",
		className: Wc("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function ql({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-title",
		className: Wc("leading-none font-semibold", e),
		...t
	});
}
function Jl({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-description",
		className: Wc("text-sm text-muted-foreground", e),
		...t
	});
}
function Yl({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-content",
		className: Wc("px-6 text-start", e),
		...t
	});
}
function Xl(e) {
	return e.toLowerCase().startsWith("fa");
}
function Zl(e) {
	return e.replace(/\d/g, (e) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(e, 10)] ?? e);
}
//#endregion
//#region src/lib/formatNumber.ts
function Ql(e, t) {
	let n = Number.isFinite(e) ? e : 0, r = Xl(t) ? "fa-IR" : "en-US", i = new Intl.NumberFormat(r, { maximumFractionDigits: 2 }).format(n);
	return Xl(t) ? Zl(i) : i;
}
//#endregion
//#region src/components/reports/BasalamBalanceCard.tsx
function $l(e) {
	return typeof e != "number" || !Number.isFinite(e) ? null : Math.trunc(e / 10);
}
function eu() {
	let { t: e, i18n: n } = _(), r = t({
		queryKey: [
			"basalam",
			"finance",
			"balance-lite"
		],
		queryFn: () => X("basalam/finance/balance"),
		retry: !1,
		staleTime: 6e4
	}), i = $l(r.data?.balance?.data?.balance);
	return r.isError || r.isSuccess && !r.data?.balance?.success && i === null ? null : /* @__PURE__ */ x(Gl, { children: [/* @__PURE__ */ x(Kl, {
		className: "pb-2",
		children: [/* @__PURE__ */ b(ql, {
			className: "text-base",
			children: e("basalam.boothBalance")
		}), /* @__PURE__ */ b(Jl, { children: e("basalam.balanceInReports") })]
	}), /* @__PURE__ */ x(Yl, {
		className: "flex flex-wrap items-center justify-between gap-3",
		children: [/* @__PURE__ */ x("p", {
			className: "text-2xl font-semibold tracking-tight",
			children: [
				r.isLoading ? "…" : i === null ? "—" : Ql(i, n.language),
				" ",
				/* @__PURE__ */ b("span", {
					className: "text-muted-foreground text-sm font-normal",
					children: e("basalam.toman")
				})
			]
		}), /* @__PURE__ */ b(K, {
			asChild: !0,
			size: "sm",
			variant: "outline",
			children: /* @__PURE__ */ b(f, {
				to: "/settings/shop/basalam/finance",
				children: e("basalam.financeDetailsLink")
			})
		})]
	})] });
}
//#endregion
//#region ../Modules/accounting-module/client/pages/accounting/AccountingShell.tsx
var tu = [
	"overview",
	"tax",
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
function nu(e) {
	return !!e && tu.includes(e);
}
function ru({ value: e }) {
	return /* @__PURE__ */ b("span", {
		className: "tabular-nums",
		children: Number(e ?? 0).toLocaleString()
	});
}
function Q({ rows: e, columns: t }) {
	return e.length ? /* @__PURE__ */ b("div", {
		className: "overflow-x-auto rounded-md border",
		children: /* @__PURE__ */ x("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ b("thead", { children: /* @__PURE__ */ b("tr", {
				className: "border-b bg-muted/40 text-xs text-muted-foreground",
				children: t.map((e) => /* @__PURE__ */ b("th", {
					className: "px-2 py-2 text-start font-medium",
					children: e.label
				}, e.key))
			}) }), /* @__PURE__ */ b("tbody", { children: e.map((e, n) => /* @__PURE__ */ b("tr", {
				className: "border-b last:border-0",
				children: t.map((t) => /* @__PURE__ */ b("td", {
					className: "px-2 py-2",
					children: String(e[t.key] ?? "—")
				}, t.key))
			}, String(e.id ?? n))) })]
		})
	}) : /* @__PURE__ */ b("p", {
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
function iu() {
	let { t: r } = _(), { section: i } = g(), a = n();
	if (!nu(i)) return /* @__PURE__ */ b(p, {
		to: "/accounting/overview",
		replace: !0
	});
	let o = t({
		queryKey: ["accounting", "overview"],
		queryFn: async () => X("accounting/overview"),
		enabled: i === "overview"
	}), s = t({
		queryKey: ["accounting", "settings"],
		queryFn: async () => X("accounting/settings"),
		enabled: i === "tax"
	}), [c, l] = d(() => {
		let e = /* @__PURE__ */ new Date();
		return e.setDate(e.getDate() - 90), e.toISOString().slice(0, 10);
	}), [m, h] = d(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)), S = t({
		queryKey: [
			"accounting",
			"tax",
			"summary",
			c,
			m
		],
		queryFn: async () => X(`accounting/tax/summary?from=${encodeURIComponent(c)}&to=${encodeURIComponent(m)}`),
		enabled: i === "tax"
	}), C = t({
		queryKey: [
			"accounting",
			"tax",
			"tips"
		],
		queryFn: async () => X("accounting/tax/tips"),
		enabled: i === "tax"
	}), T = e({
		mutationFn: async (e) => X(`accounting/tax/tips/${e}/dismiss`, {
			method: "POST",
			body: "{}"
		}),
		onSuccess: async () => {
			await a.invalidateQueries({ queryKey: [
				"accounting",
				"tax",
				"tips"
			] });
		},
		onError: (e) => Y(r, e)
	}), E = $("accounting/journals", i === "journals"), D = $("accounting/chart", i === "chart"), O = $("accounting/fiscal-years", i === "chart"), k = $("accounting/persons", i === "persons"), A = $("accounting/products", i === "products"), j = $(i === "purchases" ? "accounting/invoices?type=purchase" : "accounting/invoices?type=sale", i === "invoices" || i === "purchases"), M = $("accounting/expenses", i === "expenses"), N = $("accounting/cash-accounts", i === "treasury"), P = $("accounting/vouchers", i === "treasury"), ee = $("accounting/checks", i === "checks"), F = $("accounting/installments", i === "installments"), te = $("accounting/warehouses", i === "warehouses"), ne = $("accounting/warehouse-stock", i === "warehouses"), I = $("accounting/production", i === "production"), re = $("accounting/moadian/jobs", i === "moadian"), L = $("accounting/hesabfa/jobs", i === "hesabfa"), R = $("accounting/hesabfa/map", i === "hesabfa"), ie = $("accounting/hesabfa/log", i === "hesabfa"), ae = $("accounting/employees", i === "payroll"), z = $("accounting/payroll", i === "payroll"), oe = $("accounting/workshops", i === "payroll"), se = $("accounting/decrees", i === "payroll"), ce = $("accounting/projects", i === "projects"), [le, ue] = d(null), de = t({
		queryKey: [
			"accounting",
			"payroll-run",
			le
		],
		queryFn: async () => X(`accounting/payroll/${le}`),
		enabled: i === "payroll" && !!le
	}), fe = t({
		queryKey: [
			"accounting",
			"tamin-preview",
			le
		],
		queryFn: async () => X(`accounting/payroll/${le}/tamin-preview`),
		enabled: i === "payroll" && !!le
	}), B = t({
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
	}), [V, pe] = d(""), [me, he] = d(""), [ge, _e] = d(""), [ve, ye] = d(""), [be, xe] = d(""), [Se, Ce] = d(""), [we, Te] = d(""), [Ee, De] = d("0"), [Oe, ke] = d("0"), [Ae, je] = d(""), [Me, Ne] = d(""), [Pe, Fe] = d(""), [Ie, Le] = d(""), [Re, ze] = d(""), [Be, Ve] = d(""), [He, Ue] = d("1404"), [We, Ge] = d("1"), [Ke, qe] = d(""), [Je, Ye] = d(""), [Xe, Ze] = d("0"), [Qe, $e] = d("0"), [et, tt] = d("0"), [nt, rt] = d("0"), [it, at] = d("0"), [ot, st] = d(""), [ct, lt] = d("0"), [ut, dt] = d(""), [ft, pt] = d(""), mt = (e) => {
		let t = window.open("", "_blank");
		t && (t.document.write(e), t.document.close());
	}, ht = e({
		mutationFn: async () => X("accounting/persons", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: V,
				type: "both"
			})
		}),
		onSuccess: async () => {
			v.success(r("common.saved")), pe(""), await a.invalidateQueries({ queryKey: ["accounting", "accounting/persons"] });
		},
		onError: (e) => Y(r, e)
	}), gt = e({
		mutationFn: async () => X("accounting/products", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: me,
				sstid: ge,
				vat_rate: 10
			})
		}),
		onSuccess: async () => {
			v.success(r("common.saved")), he(""), _e(""), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), _t = e({
		mutationFn: async () => X("accounting/employees", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				first_name: ve,
				last_name: be,
				name: `${ve} ${be}`.trim(),
				national_id: Se,
				insurance_no: we,
				base_salary: Number(Ee) || 0,
				daily_wage: Number(Oe) || 0,
				job_code: Ae,
				workshop_id: Me ? Number(Me) : void 0
			})
		}),
		onSuccess: async () => {
			v.success(r("common.saved")), ye(""), xe(""), Ce(""), Te(""), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), vt = e({
		mutationFn: async () => X("accounting/workshops", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				code: Pe,
				name: Ie,
				branch_code: Re,
				row_code: Be,
				is_default: !0
			})
		}),
		onSuccess: async () => {
			v.success(r("common.saved")), Fe(""), Le(""), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), yt = e({
		mutationFn: async () => X("accounting/payroll/attendance", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				employee_id: Number(Je),
				jalali_year: Number(He),
				jalali_month: Number(We),
				absent_days: Number(Xe) || 0,
				leave_days: Number(Qe) || 0,
				overtime_hours: Number(et) || 0,
				volume_qty: Number(nt) || 0,
				piece_rate: Number(it) || 0
			})
		}),
		onSuccess: async () => {
			v.success(r("common.saved")), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), bt = e({
		mutationFn: async () => X("accounting/payroll", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				jalali_year: Number(He),
				jalali_month: Number(We),
				workshop_id: Ke ? Number(Ke) : void 0
			})
		}),
		onSuccess: async (e) => {
			v.success(r("common.saved")), e?.id && ue(e.id), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), xt = e({
		mutationFn: async (e) => X(`accounting/payroll/${e}/post`, { method: "POST" }),
		onSuccess: async () => {
			v.success(r("accounting.posted")), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), St = e({
		mutationFn: async (e) => X(`accounting/payroll/${e}/recalc`, { method: "POST" }),
		onSuccess: async () => {
			v.success(r("accounting.payroll.recalculated")), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), Ct = e({
		mutationFn: async (e) => X(`accounting/payroll/${e}/tamin-dsk`, { method: "POST" }),
		onSuccess: async (e) => {
			v.success(r("accounting.payroll.taminExported")), e.url && window.open(e.url, "_blank", "noopener,noreferrer"), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), wt = e({
		mutationFn: async () => X("accounting/decrees", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				employee_id: Number(ot),
				decree_type: "hire",
				status: "issued",
				effective_from: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				issue_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				daily_wage: Number(ct) || 0,
				job_code: ut
			})
		}),
		onSuccess: async () => {
			v.success(r("common.saved")), st(""), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), Tt = e({
		mutationFn: async () => X("accounting/projects", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: ft })
		}),
		onSuccess: async () => {
			v.success(r("common.saved")), pt(""), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), Et = e({
		mutationFn: async () => X("accounting/moadian/process", { method: "POST" }),
		onSuccess: async (e) => {
			v.success(r("accounting.moadianProcessed", { count: e.processed })), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), Dt = e({
		mutationFn: async () => X("accounting/hesabfa/process", { method: "POST" }),
		onSuccess: async (e) => {
			v.success(r("accounting.hesabfa.processed", { count: e.processed })), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), Ot = e({
		mutationFn: async () => X("accounting/hesabfa/sync-now", { method: "POST" }),
		onSuccess: async (e) => {
			v.success(r("accounting.hesabfa.synced", { count: e.pulled ?? 0 })), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), kt = e({
		mutationFn: async () => X("accounting/hesabfa/migrate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}"
		}),
		onSuccess: async (e) => {
			v.success(r("accounting.hesabfa.migrateQueued", { count: e.queued })), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), [At, jt] = d("iban"), [Mt, Nt] = d(""), [Pt, Ft] = d(""), It = e({
		mutationFn: async () => {
			let e = { type: At };
			return At === "iban" || At === "iban_national" ? e.iban = Mt : At === "card" || At === "card_to_iban" || At === "card_national" ? e.card_number = Mt : At === "postal" ? e.postal_code = Mt : At === "national" || At === "mobile_national" ? e.national_code = Mt : At === "credit" || (e.national_code = Mt), X("accounting/hesabfa/inquiry", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(e)
			});
		},
		onSuccess: (e) => Ft(JSON.stringify(e.result, null, 2)),
		onError: (e) => Y(r, e)
	}), Lt = e({
		mutationFn: async () => X("accounting/sync/backfill", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ limit: 30 })
		}),
		onSuccess: async (e) => {
			v.success(r("accounting.backfillDone", { count: e.synced })), await a.invalidateQueries({ queryKey: ["accounting"] });
		},
		onError: (e) => Y(r, e)
	}), Rt = u(() => tu.map((e) => ({
		id: e,
		label: r(`accounting.nav.${e}`),
		to: `/accounting/${e}`
	})), [r]), zt = r(`accounting.nav.${i}`);
	return /* @__PURE__ */ x(w, {
		title: r("accounting.title"),
		description: zt,
		children: [
			/* @__PURE__ */ b("div", {
				className: "mb-4 flex gap-2 overflow-x-auto pb-1",
				children: Rt.map((e) => /* @__PURE__ */ b(f, {
					to: e.to,
					className: `shrink-0 rounded-full border px-3 py-1 text-xs ${i === e.id ? "bg-primary text-primary-foreground" : "bg-background"}`,
					children: e.label
				}, e.id))
			}),
			i === "overview" ? /* @__PURE__ */ x("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ b(au, {
						title: r("accounting.kpi.profit"),
						value: /* @__PURE__ */ b(ru, { value: o.data?.profit?.profit })
					}),
					/* @__PURE__ */ b(au, {
						title: r("accounting.kpi.margin"),
						value: /* @__PURE__ */ b(ru, { value: o.data?.margin?.margin })
					}),
					/* @__PURE__ */ b(au, {
						title: r("accounting.kpi.moadianPending"),
						value: String(o.data?.moadian_pending ?? 0)
					}),
					/* @__PURE__ */ b("div", {
						className: "md:col-span-3",
						children: /* @__PURE__ */ b(eu, {})
					}),
					/* @__PURE__ */ x("div", {
						className: "md:col-span-3 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ b(K, {
								onClick: () => void Lt.mutate(),
								disabled: Lt.isPending,
								children: r("accounting.backfillOrders")
							}),
							/* @__PURE__ */ b(K, {
								variant: "outline",
								onClick: () => {
									window.location.href = "/dashboard/settings/shop/accounting";
								},
								children: r("accounting.settings.moadian")
							}),
							/* @__PURE__ */ b(K, {
								variant: "outline",
								asChild: !0,
								children: /* @__PURE__ */ b(f, {
									to: "/accounting/tax",
									children: r("accounting.nav.tax")
								})
							})
						]
					})
				]
			}) : null,
			i === "tax" ? s.data && s.data.wizard_done === !1 ? /* @__PURE__ */ b(p, {
				to: "/accounting/tax-setup",
				replace: !0
			}) : /* @__PURE__ */ x("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ b("p", {
						className: "text-muted-foreground text-xs",
						children: r("accounting.tax.disclaimer")
					}),
					/* @__PURE__ */ x("div", {
						className: "flex flex-wrap items-end gap-3",
						children: [
							/* @__PURE__ */ x("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ b("label", {
									className: "text-xs",
									children: r("accounting.tax.from")
								}), /* @__PURE__ */ b(q, {
									type: "date",
									dir: "ltr",
									value: c,
									onChange: (e) => l(e.target.value)
								})]
							}),
							/* @__PURE__ */ x("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ b("label", {
									className: "text-xs",
									children: r("accounting.tax.to")
								}), /* @__PURE__ */ b(q, {
									type: "date",
									dir: "ltr",
									value: m,
									onChange: (e) => h(e.target.value)
								})]
							}),
							/* @__PURE__ */ b(K, {
								variant: "outline",
								size: "sm",
								asChild: !0,
								children: /* @__PURE__ */ b(f, {
									to: "/accounting/tax-setup",
									children: r("accounting.taxWizard.reopen")
								})
							}),
							/* @__PURE__ */ b(K, {
								variant: "outline",
								size: "sm",
								asChild: !0,
								children: /* @__PURE__ */ b(f, {
									to: "/accounting/moadian",
									children: r("accounting.nav.moadian")
								})
							})
						]
					}),
					/* @__PURE__ */ x("div", {
						className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
						children: [
							/* @__PURE__ */ b(au, {
								title: r("accounting.tax.revenue"),
								value: /* @__PURE__ */ b(ru, { value: S.data?.revenue })
							}),
							/* @__PURE__ */ b(au, {
								title: r("accounting.tax.profit"),
								value: /* @__PURE__ */ b(ru, { value: S.data?.profit })
							}),
							/* @__PURE__ */ b(au, {
								title: r("accounting.tax.loss"),
								value: /* @__PURE__ */ b(ru, { value: S.data?.loss })
							}),
							/* @__PURE__ */ b(au, {
								title: r("accounting.tax.vatNet"),
								value: /* @__PURE__ */ b(ru, { value: S.data?.vat_net })
							}),
							/* @__PURE__ */ b(au, {
								title: r("accounting.tax.incomeTax"),
								value: /* @__PURE__ */ b(ru, { value: S.data?.income_tax_estimate })
							}),
							/* @__PURE__ */ b(au, {
								title: r("accounting.kpi.moadianPending"),
								value: String(S.data?.moadian_pending ?? 0)
							})
						]
					}),
					/* @__PURE__ */ x("div", { children: [/* @__PURE__ */ b("h3", {
						className: "mb-2 text-sm font-semibold",
						children: r("accounting.tax.tips")
					}), (C.data?.items ?? []).length === 0 ? /* @__PURE__ */ b("p", {
						className: "text-muted-foreground text-sm",
						children: "—"
					}) : /* @__PURE__ */ b("ul", {
						className: "space-y-2",
						children: (C.data?.items ?? []).map((e) => /* @__PURE__ */ x("li", {
							className: "flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm",
							children: [/* @__PURE__ */ x("span", { children: [/* @__PURE__ */ b("span", {
								className: "text-muted-foreground me-2 text-xs uppercase",
								children: e.severity
							}), r(e.message_key, e.payload ?? {})] }), /* @__PURE__ */ b(K, {
								type: "button",
								size: "sm",
								variant: "ghost",
								onClick: () => T.mutate(e.id),
								children: r("accounting.tax.dismiss")
							})]
						}, e.id))
					})] })
				]
			}) : null,
			i === "chart" ? /* @__PURE__ */ x("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ x("div", { children: [/* @__PURE__ */ b("h3", {
					className: "mb-2 text-sm font-semibold",
					children: r("accounting.nav.chart")
				}), /* @__PURE__ */ b(Q, {
					rows: D.data?.items ?? [],
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
				})] }), /* @__PURE__ */ x("div", { children: [/* @__PURE__ */ b("h3", {
					className: "mb-2 text-sm font-semibold",
					children: r("accounting.fiscalYears")
				}), /* @__PURE__ */ b(Q, {
					rows: O.data?.items ?? [],
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
			i === "journals" ? /* @__PURE__ */ b(Q, {
				rows: E.data?.items ?? [],
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
			i === "persons" ? /* @__PURE__ */ x("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ x("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ b(q, {
						className: "max-w-xs",
						value: V,
						onChange: (e) => pe(e.target.value),
						placeholder: r("accounting.personName")
					}), /* @__PURE__ */ b(K, {
						onClick: () => void ht.mutate(),
						disabled: !V || ht.isPending,
						children: r("common.save")
					})]
				}), /* @__PURE__ */ b(Q, {
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
			i === "products" ? /* @__PURE__ */ x("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ x("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ b(q, {
							className: "max-w-xs",
							value: me,
							onChange: (e) => he(e.target.value),
							placeholder: r("accounting.productName")
						}),
						/* @__PURE__ */ b(q, {
							className: "max-w-xs",
							value: ge,
							onChange: (e) => _e(e.target.value),
							placeholder: r("accounting.sstid")
						}),
						/* @__PURE__ */ b(K, {
							onClick: () => void gt.mutate(),
							disabled: !me || gt.isPending,
							children: r("common.save")
						})
					]
				}), /* @__PURE__ */ b(Q, {
					rows: A.data?.items ?? [],
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
			i === "invoices" || i === "purchases" ? /* @__PURE__ */ b(Q, {
				rows: j.data?.items ?? [],
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
			i === "expenses" ? /* @__PURE__ */ b(Q, {
				rows: M.data?.items ?? [],
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
			i === "treasury" ? /* @__PURE__ */ x("div", {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ b("h3", {
						className: "text-sm font-semibold",
						children: r("accounting.cashAccounts")
					}),
					/* @__PURE__ */ b(Q, {
						rows: N.data?.items ?? [],
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
					/* @__PURE__ */ b("h3", {
						className: "text-sm font-semibold",
						children: r("accounting.vouchers")
					}),
					/* @__PURE__ */ b(Q, {
						rows: P.data?.items ?? [],
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
			i === "checks" ? /* @__PURE__ */ b(Q, {
				rows: ee.data?.items ?? [],
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
			i === "installments" ? /* @__PURE__ */ b(Q, {
				rows: F.data?.items ?? [],
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
			i === "warehouses" ? /* @__PURE__ */ x("div", {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ b(Q, {
						rows: te.data?.items ?? [],
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
					/* @__PURE__ */ b("h3", {
						className: "text-sm font-semibold",
						children: r("accounting.stock")
					}),
					/* @__PURE__ */ b(Q, {
						rows: ne.data?.items ?? [],
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
			i === "moadian" ? /* @__PURE__ */ x("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ b(K, {
					onClick: () => void Et.mutate(),
					disabled: Et.isPending,
					children: r("accounting.processMoadian")
				}), /* @__PURE__ */ b(Q, {
					rows: re.data?.items ?? [],
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
			i === "hesabfa" ? /* @__PURE__ */ x("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ x("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ b(K, {
								onClick: () => void Dt.mutate(),
								disabled: Dt.isPending,
								children: r("accounting.hesabfa.process")
							}),
							/* @__PURE__ */ b(K, {
								variant: "outline",
								onClick: () => void Ot.mutate(),
								disabled: Ot.isPending,
								children: r("accounting.hesabfa.syncNow")
							}),
							/* @__PURE__ */ b(K, {
								variant: "secondary",
								onClick: () => void kt.mutate(),
								disabled: kt.isPending,
								children: r("accounting.hesabfa.migrate")
							}),
							/* @__PURE__ */ b(K, {
								variant: "outline",
								onClick: () => {
									window.location.href = "/dashboard/settings/shop/accounting/hesabfa";
								},
								children: r("accounting.settings.hesabfa")
							})
						]
					}),
					/* @__PURE__ */ x("div", { children: [/* @__PURE__ */ b("h3", {
						className: "mb-2 text-sm font-semibold",
						children: r("accounting.hesabfa.jobs")
					}), /* @__PURE__ */ b(Q, {
						rows: L.data?.items ?? [],
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
					/* @__PURE__ */ x("div", { children: [/* @__PURE__ */ b("h3", {
						className: "mb-2 text-sm font-semibold",
						children: r("accounting.hesabfa.map")
					}), /* @__PURE__ */ b(Q, {
						rows: R.data?.items ?? [],
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
					/* @__PURE__ */ x("div", { children: [/* @__PURE__ */ b("h3", {
						className: "mb-2 text-sm font-semibold",
						children: r("accounting.hesabfa.log")
					}), /* @__PURE__ */ b(Q, {
						rows: ie.data?.items ?? [],
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
					/* @__PURE__ */ x("div", {
						className: "space-y-2 rounded-md border p-3",
						children: [
							/* @__PURE__ */ b("h3", {
								className: "text-sm font-semibold",
								children: r("accounting.hesabfa.inquiry")
							}),
							/* @__PURE__ */ x("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ b(q, {
										className: "max-w-[10rem]",
										value: At,
										onChange: (e) => jt(e.target.value),
										placeholder: "iban|card|postal|credit"
									}),
									/* @__PURE__ */ b(q, {
										className: "max-w-xs",
										value: Mt,
										onChange: (e) => Nt(e.target.value),
										placeholder: r("accounting.hesabfa.inquiryValue")
									}),
									/* @__PURE__ */ b(K, {
										size: "sm",
										onClick: () => void It.mutate(),
										disabled: It.isPending,
										children: r("accounting.hesabfa.runInquiry")
									})
								]
							}),
							Pt ? /* @__PURE__ */ b("pre", {
								className: "bg-muted/40 max-h-48 overflow-auto rounded p-2 text-xs",
								children: Pt
							}) : null
						]
					})
				]
			}) : null,
			i === "production" ? /* @__PURE__ */ b(Q, {
				rows: I.data?.items ?? [],
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
			i === "payroll" ? /* @__PURE__ */ x("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ x("div", {
						className: "space-y-2 rounded-md border p-3",
						children: [
							/* @__PURE__ */ b("p", {
								className: "text-sm font-medium",
								children: r("accounting.payroll.workshops")
							}),
							/* @__PURE__ */ x("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ b(q, {
										className: "max-w-[8rem]",
										value: Pe,
										onChange: (e) => Fe(e.target.value),
										placeholder: r("accounting.payroll.workshopCode")
									}),
									/* @__PURE__ */ b(q, {
										className: "max-w-xs",
										value: Ie,
										onChange: (e) => Le(e.target.value),
										placeholder: r("accounting.payroll.workshopName")
									}),
									/* @__PURE__ */ b(q, {
										className: "max-w-[8rem]",
										value: Re,
										onChange: (e) => ze(e.target.value),
										placeholder: r("accounting.payroll.branchCode")
									}),
									/* @__PURE__ */ b(q, {
										className: "max-w-[8rem]",
										value: Be,
										onChange: (e) => Ve(e.target.value),
										placeholder: r("accounting.payroll.rowCode")
									}),
									/* @__PURE__ */ b(K, {
										onClick: () => void vt.mutate(),
										disabled: !Pe || !Ie || vt.isPending,
										children: r("common.save")
									})
								]
							}),
							/* @__PURE__ */ b(Q, {
								rows: oe.data?.items ?? [],
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
					/* @__PURE__ */ x("div", {
						className: "space-y-2 rounded-md border p-3",
						children: [
							/* @__PURE__ */ b("p", {
								className: "text-sm font-medium",
								children: r("accounting.payroll.employees")
							}),
							/* @__PURE__ */ x("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ b(q, {
										className: "max-w-[8rem]",
										value: ve,
										onChange: (e) => ye(e.target.value),
										placeholder: r("accounting.payroll.firstName")
									}),
									/* @__PURE__ */ b(q, {
										className: "max-w-[8rem]",
										value: be,
										onChange: (e) => xe(e.target.value),
										placeholder: r("accounting.payroll.lastName")
									}),
									/* @__PURE__ */ b(q, {
										className: "max-w-[8rem]",
										value: Se,
										onChange: (e) => Ce(e.target.value),
										placeholder: r("accounting.payroll.nationalId")
									}),
									/* @__PURE__ */ b(q, {
										className: "max-w-[8rem]",
										value: we,
										onChange: (e) => Te(e.target.value),
										placeholder: r("accounting.payroll.insuranceNo")
									}),
									/* @__PURE__ */ b(q, {
										className: "max-w-[8rem]",
										value: Ee,
										onChange: (e) => De(e.target.value),
										placeholder: r("accounting.baseSalary")
									}),
									/* @__PURE__ */ b(q, {
										className: "max-w-[8rem]",
										value: Oe,
										onChange: (e) => ke(e.target.value),
										placeholder: r("accounting.payroll.dailyWage")
									}),
									/* @__PURE__ */ b(q, {
										className: "max-w-[6rem]",
										value: Ae,
										onChange: (e) => je(e.target.value),
										placeholder: r("accounting.payroll.jobCode")
									}),
									/* @__PURE__ */ b(q, {
										className: "max-w-[6rem]",
										value: Me,
										onChange: (e) => Ne(e.target.value),
										placeholder: r("accounting.payroll.workshopId")
									}),
									/* @__PURE__ */ b(K, {
										onClick: () => void _t.mutate(),
										disabled: !ve && !be || _t.isPending,
										children: r("common.save")
									})
								]
							}),
							/* @__PURE__ */ b(Q, {
								rows: ae.data?.items ?? [],
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
					/* @__PURE__ */ x("div", {
						className: "space-y-2 rounded-md border p-3",
						children: [/* @__PURE__ */ b("p", {
							className: "text-sm font-medium",
							children: r("accounting.payroll.attendance")
						}), /* @__PURE__ */ x("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ b(q, {
									className: "max-w-[6rem]",
									value: Je,
									onChange: (e) => Ye(e.target.value),
									placeholder: r("accounting.payroll.employeeId")
								}),
								/* @__PURE__ */ b(q, {
									className: "max-w-[5rem]",
									value: He,
									onChange: (e) => Ue(e.target.value),
									placeholder: r("accounting.payroll.jalaliYear")
								}),
								/* @__PURE__ */ b(q, {
									className: "max-w-[4rem]",
									value: We,
									onChange: (e) => Ge(e.target.value),
									placeholder: r("accounting.payroll.jalaliMonth")
								}),
								/* @__PURE__ */ b(q, {
									className: "max-w-[5rem]",
									value: Xe,
									onChange: (e) => Ze(e.target.value),
									placeholder: r("accounting.payroll.absentDays")
								}),
								/* @__PURE__ */ b(q, {
									className: "max-w-[5rem]",
									value: Qe,
									onChange: (e) => $e(e.target.value),
									placeholder: r("accounting.payroll.leaveDays")
								}),
								/* @__PURE__ */ b(q, {
									className: "max-w-[5rem]",
									value: et,
									onChange: (e) => tt(e.target.value),
									placeholder: r("accounting.payroll.overtimeHours")
								}),
								/* @__PURE__ */ b(q, {
									className: "max-w-[5rem]",
									value: nt,
									onChange: (e) => rt(e.target.value),
									placeholder: r("accounting.payroll.volumeQty")
								}),
								/* @__PURE__ */ b(q, {
									className: "max-w-[5rem]",
									value: it,
									onChange: (e) => at(e.target.value),
									placeholder: r("accounting.payroll.pieceRate")
								}),
								/* @__PURE__ */ b(K, {
									onClick: () => void yt.mutate(),
									disabled: !Je || yt.isPending,
									children: r("common.save")
								})
							]
						})]
					}),
					/* @__PURE__ */ x("div", {
						className: "space-y-2 rounded-md border p-3",
						children: [
							/* @__PURE__ */ b("p", {
								className: "text-sm font-medium",
								children: r("accounting.payroll.decrees")
							}),
							/* @__PURE__ */ x("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ b(q, {
										className: "max-w-[6rem]",
										value: ot,
										onChange: (e) => st(e.target.value),
										placeholder: r("accounting.payroll.employeeId")
									}),
									/* @__PURE__ */ b(q, {
										className: "max-w-[8rem]",
										value: ct,
										onChange: (e) => lt(e.target.value),
										placeholder: r("accounting.payroll.dailyWage")
									}),
									/* @__PURE__ */ b(q, {
										className: "max-w-[6rem]",
										value: ut,
										onChange: (e) => dt(e.target.value),
										placeholder: r("accounting.payroll.jobCode")
									}),
									/* @__PURE__ */ b(K, {
										onClick: () => void wt.mutate(),
										disabled: !ot || wt.isPending,
										children: r("accounting.payroll.issueDecree")
									})
								]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-2",
								children: (se.data?.items ?? []).slice(0, 20).map((e) => /* @__PURE__ */ x("div", {
									className: "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
									children: [/* @__PURE__ */ x("span", { children: [
										"#",
										String(e.id),
										" ",
										String(e.decree_no),
										" — emp ",
										String(e.employee_id),
										" — ",
										String(e.status)
									] }), /* @__PURE__ */ b(K, {
										size: "sm",
										variant: "outline",
										onClick: () => void X(`accounting/decrees/${e.id}/print`).then((e) => mt(e.html)).catch((e) => Y(r, e)),
										children: r("accounting.payroll.print")
									})]
								}, String(e.id)))
							})
						]
					}),
					/* @__PURE__ */ x("div", {
						className: "space-y-2 rounded-md border p-3",
						children: [
							/* @__PURE__ */ b("p", {
								className: "text-sm font-medium",
								children: r("accounting.payroll.runs")
							}),
							/* @__PURE__ */ x("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ b(q, {
										className: "max-w-[5rem]",
										value: He,
										onChange: (e) => Ue(e.target.value),
										placeholder: r("accounting.payroll.jalaliYear")
									}),
									/* @__PURE__ */ b(q, {
										className: "max-w-[4rem]",
										value: We,
										onChange: (e) => Ge(e.target.value),
										placeholder: r("accounting.payroll.jalaliMonth")
									}),
									/* @__PURE__ */ b(q, {
										className: "max-w-[6rem]",
										value: Ke,
										onChange: (e) => qe(e.target.value),
										placeholder: r("accounting.payroll.workshopId")
									}),
									/* @__PURE__ */ b(K, {
										onClick: () => void bt.mutate(),
										disabled: bt.isPending,
										children: r("accounting.createPayroll")
									})
								]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-2",
								children: (z.data?.items ?? []).map((e) => /* @__PURE__ */ x("div", {
									className: "flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm",
									children: [/* @__PURE__ */ x("button", {
										type: "button",
										className: "text-start hover:underline",
										onClick: () => ue(Number(e.id)),
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
											/* @__PURE__ */ b(ru, { value: e.total_net })
										]
									}), /* @__PURE__ */ x("div", {
										className: "flex flex-wrap gap-1",
										children: [e.status === "posted" ? null : /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b(K, {
											size: "sm",
											variant: "outline",
											onClick: () => void St.mutate(Number(e.id)),
											children: r("accounting.payroll.recalc")
										}), /* @__PURE__ */ b(K, {
											size: "sm",
											onClick: () => void xt.mutate(Number(e.id)),
											children: r("accounting.post")
										})] }), /* @__PURE__ */ b(K, {
											size: "sm",
											variant: "secondary",
											onClick: () => void Ct.mutate(Number(e.id)),
											disabled: Ct.isPending,
											children: r("accounting.payroll.exportTamin")
										})]
									})]
								}, String(e.id)))
							})
						]
					}),
					le && de.data ? /* @__PURE__ */ x("div", {
						className: "space-y-2 rounded-md border p-3",
						children: [
							/* @__PURE__ */ x("p", {
								className: "text-sm font-medium",
								children: [
									r("accounting.payroll.payslips"),
									" #",
									le
								]
							}),
							/* @__PURE__ */ b("div", {
								className: "space-y-2",
								children: (de.data.payslips ?? []).map((e) => /* @__PURE__ */ x("div", {
									className: "flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm",
									children: [/* @__PURE__ */ x("span", { children: [
										String(e.employee_name),
										" — ",
										r("accounting.payroll.daysWorked"),
										": ",
										String(e.days_worked),
										" —",
										" ",
										/* @__PURE__ */ b(ru, { value: e.net })
									] }), /* @__PURE__ */ b(K, {
										size: "sm",
										variant: "outline",
										onClick: () => void X(`accounting/payslips/${e.id}/print`).then((e) => mt(e.html)).catch((e) => Y(r, e)),
										children: r("accounting.payroll.print")
									})]
								}, String(e.id)))
							}),
							/* @__PURE__ */ b(Q, {
								rows: de.data.payslips ?? [],
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
							fe.data?.guide ? /* @__PURE__ */ b("p", {
								className: "text-muted-foreground text-xs",
								children: fe.data.guide
							}) : null,
							fe.data?.workers?.length ? /* @__PURE__ */ b(Q, {
								rows: fe.data.workers,
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
			i === "projects" ? /* @__PURE__ */ x("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ x("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ b(q, {
						className: "max-w-xs",
						value: ft,
						onChange: (e) => pt(e.target.value),
						placeholder: r("accounting.projectName")
					}), /* @__PURE__ */ b(K, {
						onClick: () => void Tt.mutate(),
						disabled: !ft || Tt.isPending,
						children: r("common.save")
					})]
				}), /* @__PURE__ */ b(Q, {
					rows: ce.data?.items ?? [],
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
			i === "reports" ? /* @__PURE__ */ x("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [
					/* @__PURE__ */ b(au, {
						title: r("accounting.report.pnl"),
						value: /* @__PURE__ */ b(ru, { value: B.data?.pnl?.profit })
					}),
					/* @__PURE__ */ b(au, {
						title: r("accounting.report.vat"),
						value: /* @__PURE__ */ b(ru, { value: B.data?.vat?.net_vat })
					}),
					/* @__PURE__ */ b(au, {
						title: r("accounting.report.margin"),
						value: /* @__PURE__ */ b(ru, { value: B.data?.margin?.margin })
					}),
					/* @__PURE__ */ b(au, {
						title: r("accounting.report.balanceSheet"),
						value: /* @__PURE__ */ b(ru, { value: B.data?.bs?.assets })
					}),
					/* @__PURE__ */ b(au, {
						title: r("accounting.report.taxable"),
						value: /* @__PURE__ */ b(ru, { value: B.data?.taxSplit?.taxable })
					}),
					/* @__PURE__ */ b(au, {
						title: r("accounting.report.exempt"),
						value: /* @__PURE__ */ b(ru, { value: B.data?.taxSplit?.exempt })
					}),
					/* @__PURE__ */ b(au, {
						title: r("accounting.report.cashFlow"),
						value: /* @__PURE__ */ b(ru, { value: B.data?.cashFlow?.net })
					}),
					/* @__PURE__ */ x("div", {
						className: "md:col-span-2",
						children: [/* @__PURE__ */ b("h3", {
							className: "mb-2 text-sm font-semibold",
							children: r("accounting.report.trialBalance")
						}), /* @__PURE__ */ b(Q, {
							rows: Array.isArray(B.data?.tb) ? B.data?.tb : B.data?.tb?.rows ?? [],
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
			i === "tools" ? /* @__PURE__ */ x("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ b(K, {
						type: "button",
						onClick: () => void X("accounting/backup", { method: "POST" }).then((e) => {
							v.success(r("common.saved")), e.url && window.open(e.url, "_blank");
						}).catch((e) => Y(r, e)),
						children: r("accounting.backup")
					}),
					/* @__PURE__ */ b(K, {
						type: "button",
						variant: "outline",
						onClick: () => void X("accounting/export/csv?resource=invoices").then((e) => {
							let t = new Blob([e.csv], { type: "text/csv;charset=utf-8" }), n = document.createElement("a");
							n.href = URL.createObjectURL(t), n.download = e.filename, n.click();
						}).catch((e) => Y(r, e)),
						children: r("accounting.exportCsv")
					}),
					/* @__PURE__ */ b(K, {
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
						}).then((e) => v.success(String(e.result ?? ""))).catch((e) => Y(r, e)),
						children: r("accounting.calculator")
					})
				]
			}) : null
		]
	});
}
function au({ title: e, value: t }) {
	return /* @__PURE__ */ x("div", {
		className: "rounded-lg border border-border p-4",
		children: [/* @__PURE__ */ b("div", {
			className: "text-muted-foreground text-xs",
			children: e
		}), /* @__PURE__ */ b("div", {
			className: "mt-1 text-xl font-semibold",
			children: t
		})]
	});
}
//#endregion
//#region ../Modules/accounting-module/client/pages/accounting/MyPayrollPage.tsx
function ou(e) {
	let t = window.open("", "_blank");
	t && (t.document.write(e), t.document.close());
}
function su() {
	let { t: e } = _(), n = t({
		queryKey: ["accounting", "my-payslips"],
		queryFn: async () => X("accounting/my/payslips")
	}), r = t({
		queryKey: ["accounting", "my-decrees"],
		queryFn: async () => X("accounting/my/decrees")
	}), i = async (t) => {
		try {
			ou((await X(`accounting/payslips/${t}/print`)).html);
		} catch (t) {
			Y(e, t);
		}
	}, a = async (t) => {
		try {
			ou((await X(`accounting/decrees/${t}/print`)).html);
		} catch (t) {
			Y(e, t);
		}
	};
	return /* @__PURE__ */ x(w, {
		title: e("accounting.payroll.myPayroll"),
		description: e("accounting.payroll.myPayrollHelp"),
		children: [/* @__PURE__ */ x("section", {
			className: "mb-6 space-y-2",
			children: [/* @__PURE__ */ b("h2", {
				className: "text-sm font-medium",
				children: e("accounting.payroll.payslips")
			}), /* @__PURE__ */ x("div", {
				className: "space-y-2",
				children: [(n.data?.items ?? []).map((t) => /* @__PURE__ */ x("div", {
					className: "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
					children: [/* @__PURE__ */ x("span", { children: [
						"#",
						String(t.id),
						" — ",
						String(t.gross ?? ""),
						" / ",
						String(t.net ?? "")
					] }), /* @__PURE__ */ b(K, {
						size: "sm",
						variant: "outline",
						onClick: () => void i(Number(t.id)),
						children: e("accounting.payroll.print")
					})]
				}, String(t.id))), n.data?.items?.length ? null : /* @__PURE__ */ b("p", {
					className: "text-muted-foreground text-sm",
					children: "—"
				})]
			})]
		}), /* @__PURE__ */ x("section", {
			className: "space-y-2",
			children: [/* @__PURE__ */ b("h2", {
				className: "text-sm font-medium",
				children: e("accounting.payroll.decrees")
			}), /* @__PURE__ */ x("div", {
				className: "space-y-2",
				children: [(r.data?.items ?? []).map((t) => /* @__PURE__ */ x("div", {
					className: "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
					children: [/* @__PURE__ */ x("span", { children: [
						String(t.decree_no),
						" — ",
						String(t.decree_type),
						" — ",
						String(t.status)
					] }), /* @__PURE__ */ b(K, {
						size: "sm",
						variant: "outline",
						onClick: () => void a(Number(t.id)),
						children: e("accounting.payroll.print")
					})]
				}, String(t.id))), r.data?.items?.length ? null : /* @__PURE__ */ b("p", {
					className: "text-muted-foreground text-sm",
					children: "—"
				})]
			})]
		})]
	});
}
//#endregion
//#region ../Modules/accounting-module/client/pages/accounting/TaxSetupWizardPage.tsx
var cu = 6;
function lu() {
	let { t: r } = _(), i = h(), a = n(), [o, s] = d(1), [c, l] = d(""), [p, m] = d({}), [g, S] = d(""), [C, T] = d(""), E = t({
		queryKey: ["accounting", "settings"],
		queryFn: () => X("accounting/settings")
	}), D = t({
		queryKey: [
			"accounting",
			"tax",
			"rates"
		],
		queryFn: () => X("accounting/tax/rates")
	}), O = t({
		queryKey: [
			"accounting",
			"tax",
			"intacodes",
			c
		],
		queryFn: () => X(`accounting/tax/intacodes?q=${encodeURIComponent(c)}`),
		enabled: o === 4
	}), k = u(() => ({
		...E.data ?? {},
		...p
	}), [E.data, p]), A = e({
		mutationFn: (e) => X("accounting/settings", {
			method: "POST",
			body: JSON.stringify(e)
		}),
		onSuccess: () => {
			a.invalidateQueries({ queryKey: ["accounting", "settings"] });
		},
		onError: (e) => Y(r, e)
	}), j = e({
		mutationFn: () => X("accounting/test-connection", {
			method: "POST",
			body: "{}"
		}),
		onSuccess: () => v.success(r("accounting.testSuccess")),
		onError: (e) => Y(r, e)
	});
	function M(e) {
		m((t) => ({
			...t,
			...e
		}));
	}
	async function N(e = {}) {
		let t = {
			taxpayer_type: k.taxpayer_type,
			tax_file_tracking_code: k.tax_file_tracking_code,
			inta_code: k.inta_code,
			inta_profit_ratio: k.inta_profit_ratio,
			inta_vat_liable: k.inta_vat_liable,
			corporate_tax_rate: k.corporate_tax_rate,
			vat_regime: k.vat_regime,
			company_name: k.company_name,
			economic_code: k.economic_code,
			national_id: k.national_id,
			postal_code: k.postal_code,
			fiscal_id: k.fiscal_id,
			moadian_transport: k.moadian_transport ?? "direct",
			tsp_base_url: k.tsp_base_url,
			default_vat_rate: k.default_vat_rate,
			setup_wizard_step: o,
			...e
		};
		g.trim() && (t.private_key = g), C.trim() && (t.tsp_api_key = C), await A.mutateAsync(t);
	}
	async function P() {
		try {
			if (o === cu) {
				await N({
					wizard_done: !0,
					default_vat_rate: D.data?.rate?.vat_general ?? Number(k.default_vat_rate ?? 10),
					setup_wizard_step: cu
				}), v.success(r("accounting.taxWizard.done")), i("/accounting/tax");
				return;
			}
			await N({ setup_wizard_step: o + 1 }), s((e) => e + 1);
		} catch {}
	}
	return /* @__PURE__ */ x(w, {
		title: r("accounting.taxWizard.title"),
		children: [
			/* @__PURE__ */ b("p", {
				className: "text-muted-foreground mb-4 text-sm",
				children: r("accounting.taxWizard.subtitle")
			}),
			/* @__PURE__ */ b("p", {
				className: "mb-4 text-xs text-muted-foreground",
				children: r("accounting.taxWizard.stepOf", {
					step: o,
					total: cu
				})
			}),
			o === 1 ? /* @__PURE__ */ x("div", {
				className: "max-w-md space-y-3",
				children: [/* @__PURE__ */ b(J, { children: r("accounting.taxWizard.taxpayerType") }), /* @__PURE__ */ x(sl, {
					value: k.taxpayer_type || void 0,
					onValueChange: (e) => M({ taxpayer_type: e }),
					children: [/* @__PURE__ */ b(ll, { children: /* @__PURE__ */ b(cl, { placeholder: r("accounting.taxWizard.taxpayerType") }) }), /* @__PURE__ */ x(ul, { children: [/* @__PURE__ */ b(dl, {
						value: "individual",
						children: r("accounting.taxWizard.individual")
					}), /* @__PURE__ */ b(dl, {
						value: "corporate",
						children: r("accounting.taxWizard.corporate")
					})] })]
				})]
			}) : null,
			o === 2 ? /* @__PURE__ */ b("div", {
				className: "grid max-w-xl gap-3 sm:grid-cols-2",
				children: [
					["company_name", "accounting.taxWizard.company"],
					["economic_code", "accounting.taxWizard.economic"],
					["national_id", "accounting.taxWizard.nationalId"],
					["postal_code", "accounting.taxWizard.postal"]
				].map(([e, t]) => /* @__PURE__ */ x("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ b(J, { children: r(t) }), /* @__PURE__ */ b(q, {
						dir: "ltr",
						value: String(k[e] ?? ""),
						onChange: (t) => M({ [e]: t.target.value })
					})]
				}, e))
			}) : null,
			o === 3 ? /* @__PURE__ */ x("div", {
				className: "max-w-md space-y-1.5",
				children: [/* @__PURE__ */ b(J, { children: r("accounting.taxWizard.tracking") }), /* @__PURE__ */ b(q, {
					dir: "ltr",
					value: String(k.tax_file_tracking_code ?? ""),
					onChange: (e) => M({ tax_file_tracking_code: e.target.value })
				})]
			}) : null,
			o === 4 ? /* @__PURE__ */ x("div", {
				className: "max-w-xl space-y-3",
				children: [
					/* @__PURE__ */ x("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ b(J, { children: r("accounting.taxWizard.intaSearch") }), /* @__PURE__ */ b(q, {
							value: c,
							onChange: (e) => l(e.target.value),
							placeholder: "…"
						})]
					}),
					/* @__PURE__ */ b("div", {
						className: "max-h-48 overflow-auto rounded-md border text-sm",
						children: (O.data?.items ?? []).map((e) => /* @__PURE__ */ x("button", {
							type: "button",
							className: "hover:bg-muted block w-full border-b px-3 py-2 text-start last:border-0",
							onClick: () => M({
								inta_code: e.code,
								inta_profit_ratio: Number(e.profit_ratio),
								inta_vat_liable: !!Number(e.vat_liable),
								vat_regime: Number(e.vat_liable) ? "standard" : "exempt"
							}),
							children: [
								/* @__PURE__ */ b("span", {
									className: "font-mono",
									dir: "ltr",
									children: e.code
								}),
								" ",
								"— ",
								e.title
							]
						}, e.code))
					}),
					/* @__PURE__ */ x("div", {
						className: "grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ x("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ b(J, { children: r("accounting.taxWizard.intaCode") }), /* @__PURE__ */ b(q, {
									dir: "ltr",
									value: String(k.inta_code ?? ""),
									onChange: (e) => M({ inta_code: e.target.value })
								})]
							}),
							/* @__PURE__ */ x("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ b(J, { children: r("accounting.taxWizard.profitRatio") }), /* @__PURE__ */ b(q, {
									type: "number",
									dir: "ltr",
									value: String(k.inta_profit_ratio ?? ""),
									onChange: (e) => M({ inta_profit_ratio: Number(e.target.value) })
								})]
							}),
							k.taxpayer_type === "corporate" ? /* @__PURE__ */ x("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ b(J, { children: r("accounting.taxWizard.corporateRate") }), /* @__PURE__ */ b(q, {
									type: "number",
									dir: "ltr",
									value: String(k.corporate_tax_rate ?? 25),
									onChange: (e) => M({ corporate_tax_rate: Number(e.target.value) })
								})]
							}) : null
						]
					})
				]
			}) : null,
			o === 5 ? /* @__PURE__ */ x("div", {
				className: "max-w-xl space-y-3",
				children: [
					/* @__PURE__ */ x("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ b(J, { children: r("accounting.taxWizard.transport") }), /* @__PURE__ */ x(sl, {
							value: k.moadian_transport || "direct",
							onValueChange: (e) => M({ moadian_transport: e }),
							children: [/* @__PURE__ */ b(ll, { children: /* @__PURE__ */ b(cl, {}) }), /* @__PURE__ */ x(ul, { children: [/* @__PURE__ */ b(dl, {
								value: "direct",
								children: r("accounting.taxWizard.transportDirect")
							}), /* @__PURE__ */ b(dl, {
								value: "tsp",
								children: r("accounting.taxWizard.transportTsp")
							})] })]
						})]
					}),
					/* @__PURE__ */ x("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ b(J, { children: r("accounting.fiscalId") }), /* @__PURE__ */ b(q, {
							dir: "ltr",
							value: String(k.fiscal_id ?? ""),
							onChange: (e) => M({ fiscal_id: e.target.value })
						})]
					}),
					/* @__PURE__ */ x("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ b(J, { children: r("accounting.privateKey") }), /* @__PURE__ */ b("textarea", {
							className: "border-input bg-background min-h-28 w-full rounded-md border px-3 py-2 font-mono text-xs",
							dir: "ltr",
							placeholder: k.has_private_key ? "•••• (set to replace)" : "-----BEGIN PRIVATE KEY-----",
							value: g,
							onChange: (e) => S(e.target.value)
						})]
					}),
					k.moadian_transport === "tsp" ? /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ x("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ b(J, { children: r("accounting.taxWizard.tspUrl") }), /* @__PURE__ */ b(q, {
							dir: "ltr",
							value: String(k.tsp_base_url ?? ""),
							onChange: (e) => M({ tsp_base_url: e.target.value })
						})]
					}), /* @__PURE__ */ x("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ b(J, { children: r("accounting.taxWizard.tspKey") }), /* @__PURE__ */ b(q, {
							type: "password",
							dir: "ltr",
							value: C,
							onChange: (e) => T(e.target.value)
						})]
					})] }) : null,
					/* @__PURE__ */ b(K, {
						type: "button",
						variant: "outline",
						disabled: j.isPending,
						onClick: () => j.mutate(),
						children: r("accounting.testConnection")
					})
				]
			}) : null,
			o === 6 ? /* @__PURE__ */ x("div", {
				className: "max-w-lg space-y-2 text-sm",
				children: [
					/* @__PURE__ */ x("p", { children: [
						r("accounting.taxWizard.summaryVat"),
						":",
						" ",
						/* @__PURE__ */ x("strong", {
							dir: "ltr",
							children: [D.data?.rate?.vat_general ?? k.default_vat_rate ?? 10, "%"]
						}),
						D.data?.rate?.label ? ` (${D.data.rate.label})` : null
					] }),
					/* @__PURE__ */ x("p", { children: [
						r("accounting.taxWizard.taxpayerType"),
						":",
						" ",
						k.taxpayer_type === "corporate" ? r("accounting.taxWizard.corporate") : r("accounting.taxWizard.individual")
					] }),
					/* @__PURE__ */ x("p", { children: [
						r("accounting.taxWizard.intaCode"),
						": ",
						/* @__PURE__ */ b("span", {
							dir: "ltr",
							children: String(k.inta_code || "—")
						})
					] }),
					/* @__PURE__ */ b("p", {
						className: "text-muted-foreground text-xs",
						children: r("accounting.taxWizard.disclaimer")
					})
				]
			}) : null,
			/* @__PURE__ */ x("div", {
				className: "mt-6 flex flex-wrap gap-2",
				children: [o > 1 ? /* @__PURE__ */ b(K, {
					type: "button",
					variant: "outline",
					onClick: () => s((e) => e - 1),
					children: r("common.back")
				}) : /* @__PURE__ */ b(K, {
					type: "button",
					variant: "ghost",
					asChild: !0,
					children: /* @__PURE__ */ b(f, {
						to: "/accounting/overview",
						children: r("common.cancel")
					})
				}), /* @__PURE__ */ b(K, {
					type: "button",
					disabled: A.isPending,
					onClick: () => void P(),
					children: r(o === cu ? "accounting.taxWizard.finish" : "common.next")
				})]
			})
		]
	});
}
//#endregion
//#region ../Modules/accounting-module/client/module-entry.tsx
var uu = {
	"accounting/my-payroll": su,
	"accounting/tax-setup": lu,
	"accounting/:section": iu,
	"settings/shop/accounting": Ul,
	"settings/shop/accounting/company": Ul,
	"settings/shop/accounting/sync": Ul,
	"settings/shop/accounting/tax": Ul,
	"settings/shop/accounting/hesabfa": Ul,
	"settings/shop/accounting/payroll": Ul
}, du = { routes: uu };
//#endregion
export { du as default, uu as routes };
