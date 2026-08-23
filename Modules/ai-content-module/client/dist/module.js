import * as e from "react";
import { createContext as t, createElement as n, forwardRef as r, useContext as i, useEffect as a, useMemo as o, useRef as s, useState as c } from "react";
import { useTranslation as l } from "react-i18next";
import { useMutation as u, useQuery as d, useQueryClient as f } from "@tanstack/react-query";
import { toast as p } from "sonner";
import "react-dom";
import { Fragment as m, jsx as h, jsxs as g } from "react/jsx-runtime";
import { Link as _, useSearchParams as v } from "react-router-dom";
//#region \0rolldown/runtime.js
var y = Object.create, b = Object.defineProperty, x = Object.getOwnPropertyDescriptor, S = Object.getOwnPropertyNames, C = Object.getPrototypeOf, w = Object.prototype.hasOwnProperty, T = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), E = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = S(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !w.call(e, s) && s !== n && b(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = x(t, s)) || r.enumerable
	});
	return e;
}, D = (e, t, n) => (n = e == null ? {} : y(C(e)), E(t || !e || !e.__esModule ? b(n, "default", {
	value: e,
	enumerable: !0
}) : n, e));
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function ee(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") if (Array.isArray(e)) {
		var i = e.length;
		for (t = 0; t < i; t++) e[t] && (n = ee(e[t])) && (r && (r += " "), r += n);
	} else for (n in e) e[n] && (r && (r += " "), r += n);
	return r;
}
function te() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = ee(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/class-variance-authority/dist/index.mjs
var O = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, k = te, A = (e, t) => (n) => {
	if (t?.variants == null) return k(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = O(t) || O(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return k(e, a, t?.compoundVariants?.reduce((e, t) => {
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
function j(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function ne(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = j(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : j(e[t], null);
			}
		};
	};
}
function re(...t) {
	return e.useCallback(ne(...t), t);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function M(t) {
	let n = /* @__PURE__ */ ie(t), r = e.forwardRef((t, r) => {
		let { children: i, ...a } = t, o = e.Children.toArray(i), s = o.find(oe);
		if (s) {
			let t = s.props.children, i = o.map((n) => n === s ? e.Children.count(t) > 1 ? e.Children.only(null) : e.isValidElement(t) ? t.props.children : null : n);
			return /* @__PURE__ */ h(n, {
				...a,
				ref: r,
				children: e.isValidElement(t) ? e.cloneElement(t, void 0, i) : null
			});
		}
		return /* @__PURE__ */ h(n, {
			...a,
			ref: r,
			children: i
		});
	});
	return r.displayName = `${t}.Slot`, r;
}
/* @__NO_SIDE_EFFECTS__ */
function ie(t) {
	let n = e.forwardRef((t, n) => {
		let { children: r, ...i } = t;
		if (e.isValidElement(r)) {
			let t = N(r), a = se(i, r.props);
			return r.type !== e.Fragment && (a.ref = n ? ne(n, t) : t), e.cloneElement(r, a);
		}
		return e.Children.count(r) > 1 ? e.Children.only(null) : null;
	});
	return n.displayName = `${t}.SlotClone`, n;
}
var ae = Symbol("radix.slottable");
function oe(t) {
	return e.isValidElement(t) && typeof t.type == "function" && "__radixId" in t.type && t.type.__radixId === ae;
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
function N(e) {
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
].reduce((t, n) => {
	let r = /* @__PURE__ */ M(`Primitive.${n}`), i = e.forwardRef((e, t) => {
		let { asChild: i, ...a } = e, o = i ? r : n;
		return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ h(o, {
			...a,
			ref: t
		});
	});
	return i.displayName = `Primitive.${n}`, {
		...t,
		[n]: i
	};
}, {});
//#endregion
//#region node_modules/@radix-ui/react-context/dist/index.mjs
function ce(t, n = []) {
	let r = [];
	function i(n, i) {
		let a = e.createContext(i), o = r.length;
		r = [...r, i];
		let s = (n) => {
			let { scope: r, children: i, ...s } = n, c = r?.[t]?.[o] || a, l = e.useMemo(() => s, Object.values(s));
			return /* @__PURE__ */ h(c.Provider, {
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
	return a.scopeName = t, [i, le(a, ...n)];
}
function le(...t) {
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
typeof window < "u" && window.document && window.document.createElement;
function F(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var ue = globalThis?.document ? e.useLayoutEffect : () => {}, de = e.useInsertionEffect || ue;
function fe({ prop: t, defaultProp: n, onChange: r = () => {}, caller: i }) {
	let [a, o, s] = pe({
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
			let n = me(e) ? e(t) : e;
			n !== t && s.current?.(n);
		} else o(e);
	}, [
		c,
		t,
		o,
		s
	])];
}
function pe({ defaultProp: t, onChange: n }) {
	let [r, i] = e.useState(t), a = e.useRef(r), o = e.useRef(n);
	return de(() => {
		o.current = n;
	}, [n]), e.useEffect(() => {
		a.current !== r && (o.current?.(r), a.current = r);
	}, [r, a]), [
		r,
		i,
		o
	];
}
function me(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/@radix-ui/react-presence/dist/index.mjs
function he(t, n) {
	return e.useReducer((e, t) => n[e][t] ?? e, t);
}
var ge = (t) => {
	let { present: n, children: r } = t, i = _e(n), a = typeof r == "function" ? r({ present: i.isPresent }) : e.Children.only(r), o = re(i.ref, ye(a));
	return typeof r == "function" || i.isPresent ? e.cloneElement(a, { ref: o }) : null;
};
ge.displayName = "Presence";
function _e(t) {
	let [n, r] = e.useState(), i = e.useRef(null), a = e.useRef(t), o = e.useRef("none"), [s, c] = he(t ? "mounted" : "unmounted", {
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
		let e = ve(i.current);
		o.current = s === "mounted" ? e : "none";
	}, [s]), ue(() => {
		let e = i.current, n = a.current;
		if (n !== t) {
			let r = o.current, i = ve(e);
			t ? c("MOUNT") : i === "none" || e?.display === "none" ? c("UNMOUNT") : c(n && r !== i ? "ANIMATION_OUT" : "UNMOUNT"), a.current = t;
		}
	}, [t, c]), ue(() => {
		if (n) {
			let e, t = n.ownerDocument.defaultView ?? window, r = (r) => {
				let o = ve(i.current).includes(CSS.escape(r.animationName));
				if (r.target === n && o && (c("ANIMATION_END"), !a.current)) {
					let r = n.style.animationFillMode;
					n.style.animationFillMode = "forwards", e = t.setTimeout(() => {
						n.style.animationFillMode === "forwards" && (n.style.animationFillMode = r);
					});
				}
			}, s = (e) => {
				e.target === n && (o.current = ve(i.current));
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
function ve(e) {
	return e?.animationName || "none";
}
function ye(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function be(t) {
	let n = e.useRef({
		value: t,
		previous: t
	});
	return e.useMemo(() => (n.current.value !== t && (n.current.previous = n.current.value, n.current.value = t), n.current.previous), [t]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function xe(t) {
	let [n, r] = e.useState(void 0);
	return ue(() => {
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
var Se = "Checkbox", [Ce, we] = ce(Se), [Te, Ee] = Ce(Se);
function De(t) {
	let { __scopeCheckbox: n, checked: r, children: i, defaultChecked: a, disabled: o, form: s, name: c, onCheckedChange: l, required: u, value: d = "on", internal_do_not_use_render: f } = t, [p, m] = fe({
		prop: r,
		defaultProp: a ?? !1,
		onChange: l,
		caller: Se
	}), [g, _] = e.useState(null), [v, y] = e.useState(null), b = e.useRef(!1), x = g ? !!s || !!g.closest("form") : !0, S = {
		checked: p,
		disabled: o,
		setChecked: m,
		control: g,
		setControl: _,
		name: c,
		form: s,
		value: d,
		hasConsumerStoppedPropagationRef: b,
		required: u,
		defaultChecked: Ie(a) ? !1 : a,
		isFormControl: x,
		bubbleInput: v,
		setBubbleInput: y
	};
	return /* @__PURE__ */ h(Te, {
		scope: n,
		...S,
		children: Fe(f) ? f(S) : i
	});
}
var Oe = "CheckboxTrigger", ke = e.forwardRef(({ __scopeCheckbox: t, onKeyDown: n, onClick: r, ...i }, a) => {
	let { control: o, value: s, disabled: c, checked: l, required: u, setControl: d, setChecked: f, hasConsumerStoppedPropagationRef: p, isFormControl: m, bubbleInput: g } = Ee(Oe, t), _ = re(a, d), v = e.useRef(l);
	return e.useEffect(() => {
		let e = o?.form;
		if (e) {
			let t = () => f(v.current);
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [o, f]), /* @__PURE__ */ h(P.button, {
		type: "button",
		role: "checkbox",
		"aria-checked": Ie(l) ? "mixed" : l,
		"aria-required": u,
		"data-state": Le(l),
		"data-disabled": c ? "" : void 0,
		disabled: c,
		value: s,
		...i,
		ref: _,
		onKeyDown: F(n, (e) => {
			e.key === "Enter" && e.preventDefault();
		}),
		onClick: F(r, (e) => {
			f((e) => Ie(e) ? !0 : !e), g && m && (p.current = e.isPropagationStopped(), p.current || e.stopPropagation());
		})
	});
});
ke.displayName = Oe;
var Ae = e.forwardRef((e, t) => {
	let { __scopeCheckbox: n, name: r, checked: i, defaultChecked: a, required: o, disabled: s, value: c, onCheckedChange: l, form: u, ...d } = e;
	return /* @__PURE__ */ h(De, {
		__scopeCheckbox: n,
		checked: i,
		defaultChecked: a,
		disabled: s,
		required: o,
		onCheckedChange: l,
		name: r,
		form: u,
		value: c,
		internal_do_not_use_render: ({ isFormControl: e }) => /* @__PURE__ */ g(m, { children: [/* @__PURE__ */ h(ke, {
			...d,
			ref: t,
			__scopeCheckbox: n
		}), e && /* @__PURE__ */ h(Pe, { __scopeCheckbox: n })] })
	});
});
Ae.displayName = Se;
var je = "CheckboxIndicator", Me = e.forwardRef((e, t) => {
	let { __scopeCheckbox: n, forceMount: r, ...i } = e, a = Ee(je, n);
	return /* @__PURE__ */ h(ge, {
		present: r || Ie(a.checked) || a.checked === !0,
		children: /* @__PURE__ */ h(P.span, {
			"data-state": Le(a.checked),
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
Me.displayName = je;
var Ne = "CheckboxBubbleInput", Pe = e.forwardRef(({ __scopeCheckbox: t, ...n }, r) => {
	let { control: i, hasConsumerStoppedPropagationRef: a, checked: o, defaultChecked: s, required: c, disabled: l, name: u, value: d, form: f, bubbleInput: p, setBubbleInput: m } = Ee(Ne, t), g = re(r, m), _ = be(o), v = xe(i);
	e.useEffect(() => {
		let e = p;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, n = Object.getOwnPropertyDescriptor(t, "checked").set, r = !a.current;
		if (_ !== o && n) {
			let t = new Event("click", { bubbles: r });
			e.indeterminate = Ie(o), n.call(e, Ie(o) ? !1 : o), e.dispatchEvent(t);
		}
	}, [
		p,
		_,
		o,
		a
	]);
	let y = e.useRef(Ie(o) ? !1 : o);
	return /* @__PURE__ */ h(P.input, {
		type: "checkbox",
		"aria-hidden": !0,
		defaultChecked: s ?? y.current,
		required: c,
		disabled: l,
		name: u,
		value: d,
		form: f,
		...n,
		tabIndex: -1,
		ref: g,
		style: {
			...n.style,
			...v,
			position: "absolute",
			pointerEvents: "none",
			opacity: 0,
			margin: 0,
			transform: "translateX(-100%)"
		}
	});
});
Pe.displayName = Ne;
function Fe(e) {
	return typeof e == "function";
}
function Ie(e) {
	return e === "indeterminate";
}
function Le(e) {
	return Ie(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-label/dist/index.mjs
var Re = "Label", ze = e.forwardRef((e, t) => /* @__PURE__ */ h(P.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
ze.displayName = Re;
var Be = ze;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function Ve(t) {
	let n = /* @__PURE__ */ Ue(t), r = e.forwardRef((t, r) => {
		let { children: i, ...a } = t, o = e.Children.toArray(i), s = o.find(Ge);
		if (s) {
			let t = s.props.children, i = o.map((n) => n === s ? e.Children.count(t) > 1 ? e.Children.only(null) : e.isValidElement(t) ? t.props.children : null : n);
			return /* @__PURE__ */ h(n, {
				...a,
				ref: r,
				children: e.isValidElement(t) ? e.cloneElement(t, void 0, i) : null
			});
		}
		return /* @__PURE__ */ h(n, {
			...a,
			ref: r,
			children: i
		});
	});
	return r.displayName = `${t}.Slot`, r;
}
var He = /* @__PURE__ */ Ve("Slot");
/* @__NO_SIDE_EFFECTS__ */
function Ue(t) {
	let n = e.forwardRef((t, n) => {
		let { children: r, ...i } = t;
		if (e.isValidElement(r)) {
			let t = qe(r), a = Ke(i, r.props);
			return r.type !== e.Fragment && (a.ref = n ? ne(n, t) : t), e.cloneElement(r, a);
		}
		return e.Children.count(r) > 1 ? e.Children.only(null) : null;
	});
	return n.displayName = `${t}.SlotClone`, n;
}
var We = Symbol("radix.slottable");
function Ge(t) {
	return e.isValidElement(t) && typeof t.type == "function" && "__radixId" in t.type && t.type.__radixId === We;
}
function Ke(e, t) {
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
function qe(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-switch/dist/index.mjs
var Je = "Switch", [Ye, Xe] = ce(Je), [Ze, Qe] = Ye(Je), $e = e.forwardRef((t, n) => {
	let { __scopeSwitch: r, name: i, checked: a, defaultChecked: o, required: s, disabled: c, value: l = "on", onCheckedChange: u, form: d, ...f } = t, [p, m] = e.useState(null), _ = re(n, (e) => m(e)), v = e.useRef(!1), y = p ? d || !!p.closest("form") : !0, [b, x] = fe({
		prop: a,
		defaultProp: o ?? !1,
		onChange: u,
		caller: Je
	});
	return /* @__PURE__ */ g(Ze, {
		scope: r,
		checked: b,
		disabled: c,
		children: [/* @__PURE__ */ h(P.button, {
			type: "button",
			role: "switch",
			"aria-checked": b,
			"aria-required": s,
			"data-state": it(b),
			"data-disabled": c ? "" : void 0,
			disabled: c,
			value: l,
			...f,
			ref: _,
			onClick: F(t.onClick, (e) => {
				x((e) => !e), y && (v.current = e.isPropagationStopped(), v.current || e.stopPropagation());
			})
		}), y && /* @__PURE__ */ h(rt, {
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
$e.displayName = Je;
var et = "SwitchThumb", tt = e.forwardRef((e, t) => {
	let { __scopeSwitch: n, ...r } = e, i = Qe(et, n);
	return /* @__PURE__ */ h(P.span, {
		"data-state": it(i.checked),
		"data-disabled": i.disabled ? "" : void 0,
		...r,
		ref: t
	});
});
tt.displayName = et;
var nt = "SwitchBubbleInput", rt = e.forwardRef(({ __scopeSwitch: t, control: n, checked: r, bubbles: i = !0, ...a }, o) => {
	let s = e.useRef(null), c = re(s, o), l = be(r), u = xe(n);
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
	]), /* @__PURE__ */ h("input", {
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
rt.displayName = nt;
function it(e) {
	return e ? "checked" : "unchecked";
}
var at = $e, ot = tt, st = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, ct = (e, t) => ({
	classGroupId: e,
	validator: t
}), lt = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), ut = "-", dt = [], ft = "arbitrary..", pt = (e) => {
	let t = gt(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return ht(e);
			let n = e.split(ut);
			return mt(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? st(i, t) : t : i || dt;
			}
			return n[e] || dt;
		}
	};
}, mt = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = mt(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(ut) : e.slice(t).join(ut), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, ht = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? ft + r : void 0;
})(), gt = (e) => {
	let { theme: t, classGroups: n } = e;
	return _t(n, t);
}, _t = (e, t) => {
	let n = lt();
	for (let r in e) {
		let i = e[r];
		vt(i, n, r, t);
	}
	return n;
}, vt = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		yt(i, t, n, r);
	}
}, yt = (e, t, n, r) => {
	if (typeof e == "string") {
		bt(e, t, n);
		return;
	}
	if (typeof e == "function") {
		xt(e, t, n, r);
		return;
	}
	St(e, t, n, r);
}, bt = (e, t, n) => {
	let r = e === "" ? t : Ct(t, e);
	r.classGroupId = n;
}, xt = (e, t, n, r) => {
	if (wt(e)) {
		vt(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(ct(n, e));
}, St = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		vt(o, Ct(t, a), n, r);
	}
}, Ct = (e, t) => {
	let n = e, r = t.split(ut), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = lt(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, wt = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Tt = (e) => {
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
}, Et = "!", Dt = ":", Ot = [], kt = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), At = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === Dt) {
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
		s.endsWith(Et) ? (c = s.slice(0, -1), l = !0) : s.startsWith(Et) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return kt(t, l, c, u);
	};
	if (t) {
		let e = t + Dt, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : kt(Ot, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, jt = (e) => {
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
}, Mt = (e) => ({
	cache: Tt(e.cacheSize),
	parseClassName: At(e),
	sortModifiers: jt(e),
	...pt(e)
}), Nt = /\s+/, Pt = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(Nt), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + Et : g, v = _ + h;
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
}, Ft = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = It(n)) && (i && (i += " "), i += r);
	return i;
}, It = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = It(e[r])) && (n && (n += " "), n += t);
	return n;
}, Lt = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = Mt(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = Pt(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(Ft(...e));
}, Rt = [], I = (e) => {
	let t = (t) => t[e] || Rt;
	return t.isThemeGetter = !0, t;
}, zt = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Bt = /^\((?:(\w[\w-]*):)?(.+)\)$/i, Vt = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, Ht = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Ut = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Wt = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, Gt = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Kt = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, qt = (e) => Vt.test(e), L = (e) => !!e && !Number.isNaN(Number(e)), Jt = (e) => !!e && Number.isInteger(Number(e)), Yt = (e) => e.endsWith("%") && L(e.slice(0, -1)), R = (e) => Ht.test(e), Xt = () => !0, Zt = (e) => Ut.test(e) && !Wt.test(e), Qt = () => !1, $t = (e) => Gt.test(e), en = (e) => Kt.test(e), tn = (e) => !z(e) && !B(e), nn = (e) => vn(e, Sn, Qt), z = (e) => zt.test(e), rn = (e) => vn(e, Cn, Zt), an = (e) => vn(e, wn, L), on = (e) => vn(e, En, Xt), sn = (e) => vn(e, Tn, Qt), cn = (e) => vn(e, bn, Qt), ln = (e) => vn(e, xn, en), un = (e) => vn(e, Dn, $t), B = (e) => Bt.test(e), dn = (e) => yn(e, Cn), fn = (e) => yn(e, Tn), pn = (e) => yn(e, bn), mn = (e) => yn(e, Sn), hn = (e) => yn(e, xn), gn = (e) => yn(e, Dn, !0), _n = (e) => yn(e, En, !0), vn = (e, t, n) => {
	let r = zt.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, yn = (e, t, n = !1) => {
	let r = Bt.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, bn = (e) => e === "position" || e === "percentage", xn = (e) => e === "image" || e === "url", Sn = (e) => e === "length" || e === "size" || e === "bg-size", Cn = (e) => e === "length", wn = (e) => e === "number", Tn = (e) => e === "family-name", En = (e) => e === "number" || e === "weight", Dn = (e) => e === "shadow", On = /* @__PURE__ */ Lt(() => {
	let e = I("color"), t = I("font"), n = I("text"), r = I("font-weight"), i = I("tracking"), a = I("leading"), o = I("breakpoint"), s = I("container"), c = I("spacing"), l = I("radius"), u = I("shadow"), d = I("inset-shadow"), f = I("text-shadow"), p = I("drop-shadow"), m = I("blur"), h = I("perspective"), g = I("aspect"), _ = I("ease"), v = I("animate"), y = () => [
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
		qt,
		"full",
		"auto",
		...w()
	], E = () => [
		Jt,
		"none",
		"subgrid",
		B,
		z
	], D = () => [
		"auto",
		{ span: [
			"full",
			Jt,
			B,
			z
		] },
		Jt,
		B,
		z
	], ee = () => [
		Jt,
		"auto",
		B,
		z
	], te = () => [
		"auto",
		"min",
		"max",
		"fr",
		B,
		z
	], O = () => [
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
	], k = () => [
		"start",
		"end",
		"center",
		"stretch",
		"center-safe",
		"end-safe"
	], A = () => ["auto", ...w()], j = () => [
		qt,
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
	], ne = () => [
		qt,
		"screen",
		"full",
		"dvw",
		"lvw",
		"svw",
		"min",
		"max",
		"fit",
		...w()
	], re = () => [
		qt,
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
	], M = () => [
		e,
		B,
		z
	], ie = () => [
		...b(),
		pn,
		cn,
		{ position: [B, z] }
	], ae = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], oe = () => [
		"auto",
		"cover",
		"contain",
		mn,
		nn,
		{ size: [B, z] }
	], se = () => [
		Yt,
		dn,
		rn
	], N = () => [
		"",
		"none",
		"full",
		l,
		B,
		z
	], P = () => [
		"",
		L,
		dn,
		rn
	], ce = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	], le = () => [
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
	], F = () => [
		L,
		Yt,
		pn,
		cn
	], ue = () => [
		"",
		"none",
		m,
		B,
		z
	], de = () => [
		"none",
		L,
		B,
		z
	], fe = () => [
		"none",
		L,
		B,
		z
	], pe = () => [
		L,
		B,
		z
	], me = () => [
		qt,
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
			blur: [R],
			breakpoint: [R],
			color: [Xt],
			container: [R],
			"drop-shadow": [R],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [tn],
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
			"inset-shadow": [R],
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
			radius: [R],
			shadow: [R],
			spacing: ["px", L],
			text: [R],
			"text-shadow": [R],
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
				qt,
				z,
				B,
				g
			] }],
			container: ["container"],
			columns: [{ columns: [
				L,
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
				Jt,
				"auto",
				B,
				z
			] }],
			basis: [{ basis: [
				qt,
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
				L,
				qt,
				"auto",
				"initial",
				"none",
				z
			] }],
			grow: [{ grow: [
				"",
				L,
				B,
				z
			] }],
			shrink: [{ shrink: [
				"",
				L,
				B,
				z
			] }],
			order: [{ order: [
				Jt,
				"first",
				"last",
				"none",
				B,
				z
			] }],
			"grid-cols": [{ "grid-cols": E() }],
			"col-start-end": [{ col: D() }],
			"col-start": [{ "col-start": ee() }],
			"col-end": [{ "col-end": ee() }],
			"grid-rows": [{ "grid-rows": E() }],
			"row-start-end": [{ row: D() }],
			"row-start": [{ "row-start": ee() }],
			"row-end": [{ "row-end": ee() }],
			"grid-flow": [{ "grid-flow": [
				"row",
				"col",
				"dense",
				"row-dense",
				"col-dense"
			] }],
			"auto-cols": [{ "auto-cols": te() }],
			"auto-rows": [{ "auto-rows": te() }],
			gap: [{ gap: w() }],
			"gap-x": [{ "gap-x": w() }],
			"gap-y": [{ "gap-y": w() }],
			"justify-content": [{ justify: [...O(), "normal"] }],
			"justify-items": [{ "justify-items": [...k(), "normal"] }],
			"justify-self": [{ "justify-self": ["auto", ...k()] }],
			"align-content": [{ content: ["normal", ...O()] }],
			"align-items": [{ items: [...k(), { baseline: ["", "last"] }] }],
			"align-self": [{ self: [
				"auto",
				...k(),
				{ baseline: ["", "last"] }
			] }],
			"place-content": [{ "place-content": O() }],
			"place-items": [{ "place-items": [...k(), "baseline"] }],
			"place-self": [{ "place-self": ["auto", ...k()] }],
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
			m: [{ m: A() }],
			mx: [{ mx: A() }],
			my: [{ my: A() }],
			ms: [{ ms: A() }],
			me: [{ me: A() }],
			mbs: [{ mbs: A() }],
			mbe: [{ mbe: A() }],
			mt: [{ mt: A() }],
			mr: [{ mr: A() }],
			mb: [{ mb: A() }],
			ml: [{ ml: A() }],
			"space-x": [{ "space-x": w() }],
			"space-x-reverse": ["space-x-reverse"],
			"space-y": [{ "space-y": w() }],
			"space-y-reverse": ["space-y-reverse"],
			size: [{ size: j() }],
			"inline-size": [{ inline: ["auto", ...ne()] }],
			"min-inline-size": [{ "min-inline": ["auto", ...ne()] }],
			"max-inline-size": [{ "max-inline": ["none", ...ne()] }],
			"block-size": [{ block: ["auto", ...re()] }],
			"min-block-size": [{ "min-block": ["auto", ...re()] }],
			"max-block-size": [{ "max-block": ["none", ...re()] }],
			w: [{ w: [
				s,
				"screen",
				...j()
			] }],
			"min-w": [{ "min-w": [
				s,
				"screen",
				"none",
				...j()
			] }],
			"max-w": [{ "max-w": [
				s,
				"screen",
				"none",
				"prose",
				{ screen: [o] },
				...j()
			] }],
			h: [{ h: [
				"screen",
				"lh",
				...j()
			] }],
			"min-h": [{ "min-h": [
				"screen",
				"lh",
				"none",
				...j()
			] }],
			"max-h": [{ "max-h": [
				"screen",
				"lh",
				...j()
			] }],
			"font-size": [{ text: [
				"base",
				n,
				dn,
				rn
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				_n,
				on
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
				Yt,
				z
			] }],
			"font-family": [{ font: [
				fn,
				sn,
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
				L,
				"none",
				B,
				an
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
			"placeholder-color": [{ placeholder: M() }],
			"text-color": [{ text: M() }],
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			"text-decoration-style": [{ decoration: [...ce(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				L,
				"from-font",
				"auto",
				B,
				rn
			] }],
			"text-decoration-color": [{ decoration: M() }],
			"underline-offset": [{ "underline-offset": [
				L,
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
			"bg-position": [{ bg: ie() }],
			"bg-repeat": [{ bg: ae() }],
			"bg-size": [{ bg: oe() }],
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
						Jt,
						B,
						z
					],
					radial: [
						"",
						B,
						z
					],
					conic: [
						Jt,
						B,
						z
					]
				},
				hn,
				ln
			] }],
			"bg-color": [{ bg: M() }],
			"gradient-from-pos": [{ from: se() }],
			"gradient-via-pos": [{ via: se() }],
			"gradient-to-pos": [{ to: se() }],
			"gradient-from": [{ from: M() }],
			"gradient-via": [{ via: M() }],
			"gradient-to": [{ to: M() }],
			rounded: [{ rounded: N() }],
			"rounded-s": [{ "rounded-s": N() }],
			"rounded-e": [{ "rounded-e": N() }],
			"rounded-t": [{ "rounded-t": N() }],
			"rounded-r": [{ "rounded-r": N() }],
			"rounded-b": [{ "rounded-b": N() }],
			"rounded-l": [{ "rounded-l": N() }],
			"rounded-ss": [{ "rounded-ss": N() }],
			"rounded-se": [{ "rounded-se": N() }],
			"rounded-ee": [{ "rounded-ee": N() }],
			"rounded-es": [{ "rounded-es": N() }],
			"rounded-tl": [{ "rounded-tl": N() }],
			"rounded-tr": [{ "rounded-tr": N() }],
			"rounded-br": [{ "rounded-br": N() }],
			"rounded-bl": [{ "rounded-bl": N() }],
			"border-w": [{ border: P() }],
			"border-w-x": [{ "border-x": P() }],
			"border-w-y": [{ "border-y": P() }],
			"border-w-s": [{ "border-s": P() }],
			"border-w-e": [{ "border-e": P() }],
			"border-w-bs": [{ "border-bs": P() }],
			"border-w-be": [{ "border-be": P() }],
			"border-w-t": [{ "border-t": P() }],
			"border-w-r": [{ "border-r": P() }],
			"border-w-b": [{ "border-b": P() }],
			"border-w-l": [{ "border-l": P() }],
			"divide-x": [{ "divide-x": P() }],
			"divide-x-reverse": ["divide-x-reverse"],
			"divide-y": [{ "divide-y": P() }],
			"divide-y-reverse": ["divide-y-reverse"],
			"border-style": [{ border: [
				...ce(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...ce(),
				"hidden",
				"none"
			] }],
			"border-color": [{ border: M() }],
			"border-color-x": [{ "border-x": M() }],
			"border-color-y": [{ "border-y": M() }],
			"border-color-s": [{ "border-s": M() }],
			"border-color-e": [{ "border-e": M() }],
			"border-color-bs": [{ "border-bs": M() }],
			"border-color-be": [{ "border-be": M() }],
			"border-color-t": [{ "border-t": M() }],
			"border-color-r": [{ "border-r": M() }],
			"border-color-b": [{ "border-b": M() }],
			"border-color-l": [{ "border-l": M() }],
			"divide-color": [{ divide: M() }],
			"outline-style": [{ outline: [
				...ce(),
				"none",
				"hidden"
			] }],
			"outline-offset": [{ "outline-offset": [
				L,
				B,
				z
			] }],
			"outline-w": [{ outline: [
				"",
				L,
				dn,
				rn
			] }],
			"outline-color": [{ outline: M() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				gn,
				un
			] }],
			"shadow-color": [{ shadow: M() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				gn,
				un
			] }],
			"inset-shadow-color": [{ "inset-shadow": M() }],
			"ring-w": [{ ring: P() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: M() }],
			"ring-offset-w": [{ "ring-offset": [L, rn] }],
			"ring-offset-color": [{ "ring-offset": M() }],
			"inset-ring-w": [{ "inset-ring": P() }],
			"inset-ring-color": [{ "inset-ring": M() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				gn,
				un
			] }],
			"text-shadow-color": [{ "text-shadow": M() }],
			opacity: [{ opacity: [
				L,
				B,
				z
			] }],
			"mix-blend": [{ "mix-blend": [
				...le(),
				"plus-darker",
				"plus-lighter"
			] }],
			"bg-blend": [{ "bg-blend": le() }],
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
			"mask-image-linear-pos": [{ "mask-linear": [L] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": F() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": F() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": M() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": M() }],
			"mask-image-t-from-pos": [{ "mask-t-from": F() }],
			"mask-image-t-to-pos": [{ "mask-t-to": F() }],
			"mask-image-t-from-color": [{ "mask-t-from": M() }],
			"mask-image-t-to-color": [{ "mask-t-to": M() }],
			"mask-image-r-from-pos": [{ "mask-r-from": F() }],
			"mask-image-r-to-pos": [{ "mask-r-to": F() }],
			"mask-image-r-from-color": [{ "mask-r-from": M() }],
			"mask-image-r-to-color": [{ "mask-r-to": M() }],
			"mask-image-b-from-pos": [{ "mask-b-from": F() }],
			"mask-image-b-to-pos": [{ "mask-b-to": F() }],
			"mask-image-b-from-color": [{ "mask-b-from": M() }],
			"mask-image-b-to-color": [{ "mask-b-to": M() }],
			"mask-image-l-from-pos": [{ "mask-l-from": F() }],
			"mask-image-l-to-pos": [{ "mask-l-to": F() }],
			"mask-image-l-from-color": [{ "mask-l-from": M() }],
			"mask-image-l-to-color": [{ "mask-l-to": M() }],
			"mask-image-x-from-pos": [{ "mask-x-from": F() }],
			"mask-image-x-to-pos": [{ "mask-x-to": F() }],
			"mask-image-x-from-color": [{ "mask-x-from": M() }],
			"mask-image-x-to-color": [{ "mask-x-to": M() }],
			"mask-image-y-from-pos": [{ "mask-y-from": F() }],
			"mask-image-y-to-pos": [{ "mask-y-to": F() }],
			"mask-image-y-from-color": [{ "mask-y-from": M() }],
			"mask-image-y-to-color": [{ "mask-y-to": M() }],
			"mask-image-radial": [{ "mask-radial": [B, z] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": F() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": F() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": M() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": M() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [L] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": F() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": F() }],
			"mask-image-conic-from-color": [{ "mask-conic-from": M() }],
			"mask-image-conic-to-color": [{ "mask-conic-to": M() }],
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
			"mask-position": [{ mask: ie() }],
			"mask-repeat": [{ mask: ae() }],
			"mask-size": [{ mask: oe() }],
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
			blur: [{ blur: ue() }],
			brightness: [{ brightness: [
				L,
				B,
				z
			] }],
			contrast: [{ contrast: [
				L,
				B,
				z
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				gn,
				un
			] }],
			"drop-shadow-color": [{ "drop-shadow": M() }],
			grayscale: [{ grayscale: [
				"",
				L,
				B,
				z
			] }],
			"hue-rotate": [{ "hue-rotate": [
				L,
				B,
				z
			] }],
			invert: [{ invert: [
				"",
				L,
				B,
				z
			] }],
			saturate: [{ saturate: [
				L,
				B,
				z
			] }],
			sepia: [{ sepia: [
				"",
				L,
				B,
				z
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				B,
				z
			] }],
			"backdrop-blur": [{ "backdrop-blur": ue() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				L,
				B,
				z
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				L,
				B,
				z
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				L,
				B,
				z
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				L,
				B,
				z
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				L,
				B,
				z
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				L,
				B,
				z
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				L,
				B,
				z
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				L,
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
				L,
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
				L,
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
			rotate: [{ rotate: de() }],
			"rotate-x": [{ "rotate-x": de() }],
			"rotate-y": [{ "rotate-y": de() }],
			"rotate-z": [{ "rotate-z": de() }],
			scale: [{ scale: fe() }],
			"scale-x": [{ "scale-x": fe() }],
			"scale-y": [{ "scale-y": fe() }],
			"scale-z": [{ "scale-z": fe() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: pe() }],
			"skew-x": [{ "skew-x": pe() }],
			"skew-y": [{ "skew-y": pe() }],
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
			translate: [{ translate: me() }],
			"translate-x": [{ "translate-x": me() }],
			"translate-y": [{ "translate-y": me() }],
			"translate-z": [{ "translate-z": me() }],
			"translate-none": ["translate-none"],
			accent: [{ accent: M() }],
			appearance: [{ appearance: ["none", "auto"] }],
			"caret-color": [{ caret: M() }],
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
			fill: [{ fill: ["none", ...M()] }],
			"stroke-w": [{ stroke: [
				L,
				dn,
				rn,
				an
			] }],
			stroke: [{ stroke: ["none", ...M()] }],
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
	return On(te(e));
}
//#endregion
//#region src/components/ui/button.tsx
var kn = A("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
	return /* @__PURE__ */ h(r ? He : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: V(kn({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/components/ui/card.tsx
var An = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function U({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ h("div", {
		"data-slot": "card",
		"data-variant": t,
		className: V("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", An[t], e),
		...n
	});
}
function W({ className: e, ...t }) {
	return /* @__PURE__ */ h("div", {
		"data-slot": "card-header",
		className: V("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function G({ className: e, ...t }) {
	return /* @__PURE__ */ h("div", {
		"data-slot": "card-title",
		className: V("leading-none font-semibold", e),
		...t
	});
}
function K({ className: e, ...t }) {
	return /* @__PURE__ */ h("div", {
		"data-slot": "card-content",
		className: V("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var jn = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), Mn = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Nn = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), Pn = (e) => {
	let t = Nn(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, Fn = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, In = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, Ln = t({}), Rn = () => i(Ln), zn = r(({ color: e, size: t, strokeWidth: r, absoluteStrokeWidth: i, className: a = "", children: o, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = Rn() ?? {}, h = i ?? f ? Number(r ?? d) * 24 / Number(t ?? u) : r ?? d;
	return n("svg", {
		ref: l,
		...Fn,
		width: t ?? u ?? Fn.width,
		height: t ?? u ?? Fn.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: jn("lucide", m, a),
		...!o && !In(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => n(e, t)), ...Array.isArray(o) ? o : [o]]);
}), Bn = ((e, t) => {
	let i = r(({ className: r, ...i }, a) => n(zn, {
		ref: a,
		iconNode: t,
		className: jn(`lucide-${Mn(Pn(e))}`, `lucide-${e}`, r),
		...i
	}));
	return i.displayName = Pn(e), i;
})("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]);
//#endregion
//#region src/components/ui/checkbox.tsx
function Vn({ className: e, ...t }) {
	return /* @__PURE__ */ h(Ae, {
		"data-slot": "checkbox",
		className: V("peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary", e),
		...t,
		children: /* @__PURE__ */ h(Me, {
			"data-slot": "checkbox-indicator",
			className: "grid place-content-center text-current transition-none",
			children: /* @__PURE__ */ h(Bn, { className: "size-3.5" })
		})
	});
}
//#endregion
//#region src/components/ui/input.tsx
function q({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ h("input", {
		type: t,
		"data-slot": "input",
		className: V("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/lib/safeUrl.ts
function Hn(e) {
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
function Un() {
	return window.webinoDashboard;
}
var Wn = 3e4;
function Gn(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function Kn(e) {
	let t = Un();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (Gn(e) || Hn(e)) return e;
	throw new Y("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function qn(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function Jn(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : null;
}
function Yn(e, t) {
	let n = e.toLowerCase();
	return e.includes("Upstream Error") || e.includes("Forbidden") || t === 403 ? "admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry" : n.includes("timed out") || n.includes("timeout") || t === 504 || t === 524 ? "Request timed out — RSA-4096 generation can take over a minute on weak hosts" : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? `Invalid AJAX response (HTML, HTTP ${t || 0})` : `Invalid AJAX response (HTTP ${t || 0})`;
}
async function Xn(e, t, n = {}) {
	let r = Jn(e), i = Un();
	if (!r || !i.ajaxUrl) throw new Y("AJAX fallback unavailable", {
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
	let { signal: l, clear: u } = qn({}, t);
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
			throw new Y(Yn(t, e.status), {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!n.success) throw new Y(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
			code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
			status: e.status
		});
		return n.data;
	} finally {
		u();
	}
}
async function J(e, t = {}, n = Wn) {
	if (Jn(e) && Un().ajaxUrl) return Xn(e, n, t);
	let r = Kn(e), i = Un(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce);
	let { signal: s, clear: c } = qn(t, n);
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
			throw new Y(n.includes("Upstream Error") || n.includes("Forbidden") ? "REST blocked by CDN/WAF — use admin-ajax fallback or whitelist /wp-json/" : "Invalid JSON response", {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i;
			throw new Y(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
		}
		return i;
	} catch (e) {
		throw e instanceof Y ? e : e instanceof DOMException && e.name === "AbortError" ? new Y("Request timed out", {
			code: "timeout",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region src/lib/marketplace-api.ts
function Zn(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function Qn(e) {
	"@babel/helpers - typeof";
	return Qn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, Qn(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function $n(e, t) {
	if (Qn(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (Qn(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function er(e) {
	var t = $n(e, "string");
	return Qn(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function tr(e, t, n) {
	return (t = er(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/lib/apiError.ts
var Y = class extends Error {
	constructor(e, t) {
		super(e), tr(this, "code", void 0), tr(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, nr = {
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
function rr(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function ir(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function ar(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(Zn(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function or(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return ar(e, n);
	if (t instanceof Y && t.code) {
		let n = nr[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = nr[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return rr(n) ? e("errors.api.timeout") : ir(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function X(e, t) {
	p.error(or(e, t));
}
//#endregion
//#region src/hooks/useQueryErrorToast.ts
function Z(e) {
	let { t } = l(), n = s(!1);
	a(() => {
		e.isError && e.error ? n.current || (n.current = !0, p.error(or(t, e.error))) : n.current = !1;
	}, [
		e.isError,
		e.error,
		e.fetchStatus,
		t
	]);
}
//#endregion
//#region src/lib/categoryTree.ts
function sr(e) {
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
//#region ../Modules/ai-content-module/client/lib/ai-content-api.ts
function cr() {
	return J("ai-content/overview");
}
function lr() {
	return J("ai-content/settings");
}
function ur(e) {
	return J("ai-content/settings", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(e)
	});
}
function dr(e) {
	let t = !!e && Object.keys(e).length > 0;
	return J("ai-content/cost-estimate", {
		method: t ? "POST" : "GET",
		headers: t ? { "Content-Type": "application/json" } : void 0,
		body: t ? JSON.stringify(e) : void 0
	});
}
function fr(e = !1) {
	let t = new URLSearchParams();
	return e && t.set("refresh", "1"), J(`ai-content/gapgpt/models${t.toString() ? `?${t.toString()}` : ""}`);
}
function pr(e) {
	let t = new URLSearchParams();
	e?.status && t.set("status", e.status), e?.limit && t.set("limit", String(e.limit));
	let n = t.toString();
	return J(`ai-content/jobs${n ? `?${n}` : ""}`);
}
function mr(e) {
	return J(`ai-content/jobs/${e}/retry`, { method: "POST" });
}
function hr(e = 1) {
	return J("ai-content/jobs/run-due", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ limit: e })
	}, 3e4);
}
function gr(e) {
	return J(`ai-content/jobs/${e}/cancel`, { method: "POST" });
}
function _r() {
	return J("ai-content/jobs/cancel-pending", { method: "POST" });
}
function vr() {
	return J("ai-content/queue");
}
function yr(e) {
	return J("ai-content/queue", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ paused: e })
	});
}
function br(e) {
	return J("ai-content/generate", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(e)
	});
}
function xr(e = 50) {
	return J(`ai-content/products/incomplete?limit=${e}`);
}
function Sr(e) {
	return J("ai-content/products/fill-batch", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(e ? { ids: e } : {})
	});
}
function Cr(e, t) {
	let n = new URLSearchParams();
	e && n.set("from", e), t && n.set("to", t);
	let r = n.toString();
	return J(`ai-content/calendar${r ? `?${r}` : ""}`);
}
function wr(e) {
	return J("ai-content/calendar", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(e)
	});
}
function Tr(e) {
	return J("ai-content/calendar/bulk", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(e)
	});
}
function Er(e) {
	return J(`ai-content/calendar/${e}`, { method: "DELETE" });
}
function Dr() {
	return J("ai-content/calendar/run-due", { method: "POST" });
}
function Or() {
	return J("ai-content/attribute-templates");
}
function kr(e) {
	return J(`ai-content/attribute-templates/${e}/suggest`, { method: "POST" });
}
function Ar(e) {
	return J(`ai-content/attribute-templates/${e}/draft`);
}
function jr(e, t) {
	return J("ai-content/attribute-templates", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			product_cat_id: e,
			draft: t
		})
	});
}
function Mr(e, t) {
	return J("ai-content/attribute-templates", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			product_cat_id: e,
			attribute_ids: t
		})
	});
}
function Nr(e) {
	return J(`ai-content/attribute-templates/${e}`, { method: "DELETE" });
}
function Pr(e) {
	return J("ai-content/suggest-categories", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ kind: e })
	});
}
function Fr(e) {
	return J(`ai-content/suggest-categories/${e}`);
}
function Ir(e) {
	return J(`ai-content/suggest-categories/${e}/apply`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({})
	});
}
function Lr(e, t) {
	return J("ai-content/terms/fill-batch", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			taxonomy: e,
			ids: t
		})
	});
}
//#endregion
//#region ../Modules/ai-content-module/client/pages/AiAttributesPage.tsx
function Rr() {
	let { t: e } = l(), t = f(), [n, r] = c(0), [i, _] = c(""), [v, y] = c(null), [b, x] = c([]), S = s(0), C = d({
		queryKey: ["product-categories", "ai-attr"],
		queryFn: () => J("shop/product-categories?sort=name_asc&per_page=500")
	});
	Z(C);
	let w = d({
		queryKey: ["ai-content", "attr-templates"],
		queryFn: Or
	});
	Z(w);
	let T = d({
		queryKey: [
			"ai-content",
			"attr-draft",
			n
		],
		queryFn: () => Ar(n),
		enabled: n > 0
	});
	Z(T);
	let E = C.data?.items ?? [], D = o(() => {
		let e = E.map((e) => ({
			id: e.id,
			name: e.name,
			slug: e.slug ?? "",
			parent: e.parent ?? 0,
			description: "",
			count: 0,
			url: ""
		})), t = sr(e), n = i.trim().toLowerCase();
		if (!n) return t;
		let r = new Set(E.filter((e) => e.name.toLowerCase().includes(n)).map((e) => e.id)), a = new Map(e.map((e) => [e.id, e])), o = /* @__PURE__ */ new Set();
		for (let e of r) {
			let t = e;
			for (; t && t > 0;) o.add(t), t = a.get(t)?.parent;
		}
		return t.filter(({ node: e }) => o.has(e.id));
	}, [E, i]), ee = o(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of w.data?.items ?? []) e.set(t.product_cat_id, (t.labels ?? []).map((e) => e.label));
		return e;
	}, [w.data]), te = o(() => {
		let e = /* @__PURE__ */ new Map(), t = (w.data?.items ?? []).find((e) => e.product_cat_id === n);
		for (let n of t?.labels ?? []) {
			let t = n.attribute_id ?? 0;
			t > 0 && e.set(t, n);
		}
		for (let t of T.data?.discovered ?? []) {
			let n = t.attribute_id ?? 0;
			n > 0 && !e.has(n) && e.set(n, t);
		}
		for (let t of T.data?.template?.labels ?? []) {
			let n = t.attribute_id ?? 0;
			n > 0 && !e.has(n) && e.set(n, t);
		}
		return [...e.values()];
	}, [
		n,
		w.data,
		T.data
	]);
	a(() => {
		if (!n || S.current === n) return;
		let e = T.data?.template?.attribute_ids ?? [];
		if (e.length) {
			x(e), S.current = n;
			return;
		}
		let t = (w.data?.items ?? []).find((e) => e.product_cat_id === n);
		if (t?.attribute_ids?.length) {
			x(t.attribute_ids), S.current = n;
			return;
		}
		T.isFetching || (x((T.data?.discovered ?? []).map((e) => e.attribute_id ?? 0).filter((e) => e > 0)), S.current = n);
	}, [
		n,
		T.data,
		T.isFetching,
		w.data
	]);
	let O = u({
		mutationFn: () => kr(n),
		onSuccess: () => {
			p.success(e("aiContent.jobQueued")), setTimeout(() => void T.refetch(), 3e3);
		},
		onError: (t) => X(e, t)
	}), k = u({
		mutationFn: () => Mr(n, b),
		onSuccess: () => {
			p.success(e("common.saved")), t.invalidateQueries({ queryKey: ["ai-content"] });
		},
		onError: (t) => X(e, t)
	}), A = T.data?.draft?.attributes ?? [], j = v ?? A, ne = u({
		mutationFn: () => jr(n, { attributes: j }),
		onSuccess: () => {
			p.success(e("common.saved")), y(null), t.invalidateQueries({ queryKey: ["ai-content"] });
		},
		onError: (t) => X(e, t)
	}), re = u({
		mutationFn: (e) => Nr(e),
		onSuccess: () => {
			p.success(e("common.deleted")), t.invalidateQueries({ queryKey: ["ai-content"] });
		},
		onError: (t) => X(e, t)
	}), M = (e, t) => {
		x((n) => t ? n.includes(e) ? n : [...n, e] : n.filter((t) => t !== e));
	}, ie = (e) => {
		r(e), S.current = 0, y(null), x((w.data?.items ?? []).find((t) => t.product_cat_id === e)?.attribute_ids ?? []);
	};
	return /* @__PURE__ */ g("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ g("div", { children: [/* @__PURE__ */ h("h1", {
				className: "text-xl font-semibold tracking-tight",
				children: e("aiContent.attributesTitle")
			}), /* @__PURE__ */ h("p", {
				className: "text-muted-foreground mt-1 text-sm",
				children: e("aiContent.attrPageLead")
			})] }),
			/* @__PURE__ */ g("div", {
				className: "grid gap-4 lg:grid-cols-[minmax(16rem,22rem)_1fr]",
				children: [/* @__PURE__ */ g(U, { children: [/* @__PURE__ */ h(W, { children: /* @__PURE__ */ h(G, { children: e("aiContent.attrPickCategory") }) }), /* @__PURE__ */ g(K, {
					className: "space-y-2",
					children: [/* @__PURE__ */ h(q, {
						value: i,
						onChange: (e) => _(e.target.value),
						placeholder: e("products.editor.taxonomySearch"),
						className: "h-8 text-sm"
					}), /* @__PURE__ */ h("div", {
						className: "max-h-[28rem] overflow-y-auto rounded-md border p-1.5 text-sm",
						children: C.isLoading ? /* @__PURE__ */ h("p", {
							className: "text-muted-foreground px-1 py-2 text-xs",
							children: e("common.loading")
						}) : D.length === 0 ? /* @__PURE__ */ h("p", {
							className: "text-muted-foreground px-1 py-2 text-xs",
							children: e("products.noCategories")
						}) : D.map(({ node: t, depth: r }) => {
							let i = ee.has(t.id);
							return /* @__PURE__ */ g("button", {
								type: "button",
								className: `flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start ${n === t.id ? "bg-muted font-medium" : "hover:bg-muted/60"}`,
								style: { paddingInlineStart: `${.5 + r * .875}rem` },
								onClick: () => ie(t.id),
								children: [/* @__PURE__ */ h("span", {
									className: "min-w-0 flex-1 truncate",
									children: t.name
								}), i ? /* @__PURE__ */ h("span", {
									className: "text-muted-foreground shrink-0 text-[10px]",
									children: e("aiContent.attrMapped")
								}) : null]
							}, t.id);
						})
					})]
				})] }), /* @__PURE__ */ g(U, { children: [/* @__PURE__ */ h(W, { children: /* @__PURE__ */ h(G, { children: n ? e("aiContent.attrForCategory", { name: E.find((e) => e.id === n)?.name ?? `#${n}` }) : e("aiContent.attrSelectCategoryFirst") }) }), /* @__PURE__ */ h(K, {
					className: "space-y-4",
					children: n ? /* @__PURE__ */ g(m, { children: [
						/* @__PURE__ */ g("div", {
							className: "max-h-72 space-y-1 overflow-y-auto rounded-md border p-2",
							children: [te.map((e) => {
								let t = e.attribute_id ?? 0, n = e.options ?? [];
								return /* @__PURE__ */ g("label", {
									className: "flex cursor-pointer items-start gap-2 py-1 text-sm",
									children: [/* @__PURE__ */ h(Vn, {
										className: "mt-0.5",
										checked: b.includes(t),
										onCheckedChange: (e) => M(t, e === !0)
									}), /* @__PURE__ */ g("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ h("span", {
											className: "block truncate",
											children: e.label
										}), n.length ? /* @__PURE__ */ h("span", {
											className: "text-muted-foreground block text-xs",
											children: n.join(" · ")
										}) : null]
									})]
								}, t);
							}), te.length ? null : /* @__PURE__ */ h("p", {
								className: "text-muted-foreground text-xs",
								children: e("aiContent.noCategoryAttributes")
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ h(H, {
									size: "sm",
									disabled: k.isPending,
									onClick: () => void k.mutateAsync(),
									children: e("aiContent.saveMapping")
								}),
								/* @__PURE__ */ h(H, {
									size: "sm",
									variant: "outline",
									disabled: O.isPending,
									onClick: () => void O.mutateAsync(),
									children: e("aiContent.suggest")
								}),
								/* @__PURE__ */ h(H, {
									size: "sm",
									variant: "ghost",
									onClick: () => void T.refetch(),
									children: e("common.refresh")
								})
							]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ h("div", {
									className: "text-sm font-medium",
									children: e("aiContent.attrSuggestTitle")
								}),
								j.map((t, n) => /* @__PURE__ */ g("div", {
									className: "space-y-1 rounded-md border p-2 text-sm",
									children: [/* @__PURE__ */ g("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ h(q, {
											className: "h-8",
											value: t.label,
											onChange: (e) => {
												y(j.map((t, r) => r === n ? {
													...t,
													label: e.target.value
												} : t));
											}
										}), /* @__PURE__ */ h(H, {
											size: "sm",
											variant: "ghost",
											onClick: () => y(j.filter((e, t) => t !== n)),
											children: e("common.delete")
										})]
									}), /* @__PURE__ */ h(q, {
										className: "h-8 text-xs",
										value: (t.options ?? []).join(", "),
										onChange: (e) => {
											let t = e.target.value.split(",").map((e) => e.trim()).filter(Boolean);
											y(j.map((e, r) => r === n ? {
												...e,
												options: t
											} : e));
										}
									})]
								}, `${t.label}-${n}`)),
								j.length ? /* @__PURE__ */ h(H, {
									size: "sm",
									variant: "outline",
									disabled: ne.isPending,
									onClick: () => void ne.mutateAsync(),
									children: e("aiContent.confirmTemplate")
								}) : /* @__PURE__ */ h("p", {
									className: "text-muted-foreground text-sm",
									children: e("aiContent.noAttrDraft")
								})
							]
						})
					] }) : /* @__PURE__ */ h("p", {
						className: "text-muted-foreground text-sm",
						children: e("aiContent.attrSelectCategoryFirst")
					})
				})] })]
			}),
			/* @__PURE__ */ g(U, { children: [/* @__PURE__ */ h(W, { children: /* @__PURE__ */ h(G, { children: e("aiContent.attrTemplates") }) }), /* @__PURE__ */ g(K, {
				className: "space-y-2",
				children: [(w.data?.items ?? []).map((t) => /* @__PURE__ */ g("div", {
					className: "flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0",
					children: [/* @__PURE__ */ g("button", {
						type: "button",
						className: "text-start",
						onClick: () => ie(t.product_cat_id),
						children: [/* @__PURE__ */ h("div", {
							className: "font-medium",
							children: t.category_name || `#${t.product_cat_id}`
						}), /* @__PURE__ */ h("div", {
							className: "text-muted-foreground",
							children: (t.labels ?? []).map((e) => e.label).join(" · ") || t.attribute_ids.join(", ")
						})]
					}), /* @__PURE__ */ h(H, {
						size: "sm",
						variant: "destructive",
						onClick: () => void re.mutateAsync(t.product_cat_id),
						children: e("common.delete")
					})]
				}, t.id)), w.data?.items?.length ? null : /* @__PURE__ */ h("p", {
					className: "text-muted-foreground text-sm",
					children: e("aiContent.noTemplates")
				})]
			})] })
		]
	});
}
//#endregion
//#region src/components/ui/label.tsx
var zr = /* @__PURE__ */ D((/* @__PURE__ */ T(((e, t) => {
	(function(n, r) {
		typeof e == "object" && t !== void 0 ? t.exports = r() : typeof define == "function" && define.amd ? define(r) : (n = typeof globalThis < "u" ? globalThis : n || self).dayjs = r();
	})(e, (function() {
		var e = 1e3, t = 6e4, n = 36e5, r = "millisecond", i = "second", a = "minute", o = "hour", s = "day", c = "week", l = "month", u = "quarter", d = "year", f = "date", p = "Invalid Date", m = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, h = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, g = {
			name: "en",
			weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
			months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
			ordinal: function(e) {
				var t = [
					"th",
					"st",
					"nd",
					"rd"
				], n = e % 100;
				return "[" + e + (t[(n - 20) % 10] || t[n] || t[0]) + "]";
			}
		}, _ = function(e, t, n) {
			var r = String(e);
			return !r || r.length >= t ? e : "" + Array(t + 1 - r.length).join(n) + e;
		}, v = {
			s: _,
			z: function(e) {
				var t = -e.utcOffset(), n = Math.abs(t), r = Math.floor(n / 60), i = n % 60;
				return (t <= 0 ? "+" : "-") + _(r, 2, "0") + ":" + _(i, 2, "0");
			},
			m: function e(t, n) {
				if (t.date() < n.date()) return -e(n, t);
				var r = 12 * (n.year() - t.year()) + (n.month() - t.month()), i = t.clone().add(r, l), a = n - i < 0, o = t.clone().add(r + (a ? -1 : 1), l);
				return +(-(r + (n - i) / (a ? i - o : o - i)) || 0);
			},
			a: function(e) {
				return e < 0 ? Math.ceil(e) || 0 : Math.floor(e);
			},
			p: function(e) {
				return {
					M: l,
					y: d,
					w: c,
					d: s,
					D: f,
					h: o,
					m: a,
					s: i,
					ms: r,
					Q: u
				}[e] || String(e || "").toLowerCase().replace(/s$/, "");
			},
			u: function(e) {
				return e === void 0;
			}
		}, y = "en", b = {};
		b[y] = g;
		var x = "$isDayjsObject", S = function(e) {
			return e instanceof E || !(!e || !e[x]);
		}, C = function e(t, n, r) {
			var i;
			if (!t) return y;
			if (typeof t == "string") {
				var a = t.toLowerCase();
				b[a] && (i = a), n && (b[a] = n, i = a);
				var o = t.split("-");
				if (!i && o.length > 1) return e(o[0]);
			} else {
				var s = t.name;
				b[s] = t, i = s;
			}
			return !r && i && (y = i), i || !r && y;
		}, w = function(e, t) {
			if (S(e)) return e.clone();
			var n = typeof t == "object" ? t : {};
			return n.date = e, n.args = arguments, new E(n);
		}, T = v;
		T.l = C, T.i = S, T.w = function(e, t) {
			return w(e, {
				locale: t.$L,
				utc: t.$u,
				x: t.$x,
				$offset: t.$offset
			});
		};
		var E = function() {
			function g(e) {
				this.$L = C(e.locale, null, !0), this.parse(e), this.$x = this.$x || e.x || {}, this[x] = !0;
			}
			var _ = g.prototype;
			return _.parse = function(e) {
				this.$d = function(e) {
					var t = e.date, n = e.utc;
					if (t === null) return /* @__PURE__ */ new Date(NaN);
					if (T.u(t)) return /* @__PURE__ */ new Date();
					if (t instanceof Date) return new Date(t);
					if (typeof t == "string" && !/Z$/i.test(t)) {
						var r = t.match(m);
						if (r) {
							var i = r[2] - 1 || 0, a = (r[7] || "0").substring(0, 3);
							return n ? new Date(Date.UTC(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, a)) : new Date(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, a);
						}
					}
					return new Date(t);
				}(e), this.init();
			}, _.init = function() {
				var e = this.$d;
				this.$y = e.getFullYear(), this.$M = e.getMonth(), this.$D = e.getDate(), this.$W = e.getDay(), this.$H = e.getHours(), this.$m = e.getMinutes(), this.$s = e.getSeconds(), this.$ms = e.getMilliseconds();
			}, _.$utils = function() {
				return T;
			}, _.isValid = function() {
				return this.$d.toString() !== p;
			}, _.isSame = function(e, t) {
				var n = w(e);
				return this.startOf(t) <= n && n <= this.endOf(t);
			}, _.isAfter = function(e, t) {
				return w(e) < this.startOf(t);
			}, _.isBefore = function(e, t) {
				return this.endOf(t) < w(e);
			}, _.$g = function(e, t, n) {
				return T.u(e) ? this[t] : this.set(n, e);
			}, _.unix = function() {
				return Math.floor(this.valueOf() / 1e3);
			}, _.valueOf = function() {
				return this.$d.getTime();
			}, _.startOf = function(e, t) {
				var n = this, r = !!T.u(t) || t, u = T.p(e), p = function(e, t) {
					var i = T.w(n.$u ? Date.UTC(n.$y, t, e) : new Date(n.$y, t, e), n);
					return r ? i : i.endOf(s);
				}, m = function(e, t) {
					return T.w(n.toDate()[e].apply(n.toDate("s"), (r ? [
						0,
						0,
						0,
						0
					] : [
						23,
						59,
						59,
						999
					]).slice(t)), n);
				}, h = this.$W, g = this.$M, _ = this.$D, v = "set" + (this.$u ? "UTC" : "");
				switch (u) {
					case d: return r ? p(1, 0) : p(31, 11);
					case l: return r ? p(1, g) : p(0, g + 1);
					case c:
						var y = this.$locale().weekStart || 0, b = (h < y ? h + 7 : h) - y;
						return p(r ? _ - b : _ + (6 - b), g);
					case s:
					case f: return m(v + "Hours", 0);
					case o: return m(v + "Minutes", 1);
					case a: return m(v + "Seconds", 2);
					case i: return m(v + "Milliseconds", 3);
					default: return this.clone();
				}
			}, _.endOf = function(e) {
				return this.startOf(e, !1);
			}, _.$set = function(e, t) {
				var n, c = T.p(e), u = "set" + (this.$u ? "UTC" : ""), p = (n = {}, n[s] = u + "Date", n[f] = u + "Date", n[l] = u + "Month", n[d] = u + "FullYear", n[o] = u + "Hours", n[a] = u + "Minutes", n[i] = u + "Seconds", n[r] = u + "Milliseconds", n)[c], m = c === s ? this.$D + (t - this.$W) : t;
				if (c === l || c === d) {
					var h = this.clone().set(f, 1);
					h.$d[p](m), h.init(), this.$d = h.set(f, Math.min(this.$D, h.daysInMonth())).$d;
				} else p && this.$d[p](m);
				return this.init(), this;
			}, _.set = function(e, t) {
				return this.clone().$set(e, t);
			}, _.get = function(e) {
				return this[T.p(e)]();
			}, _.add = function(r, u) {
				var f, p = this;
				r = Number(r);
				var m = T.p(u), h = function(e) {
					var t = w(p);
					return T.w(t.date(t.date() + Math.round(e * r)), p);
				};
				if (m === l) return this.set(l, this.$M + r);
				if (m === d) return this.set(d, this.$y + r);
				if (m === s) return h(1);
				if (m === c) return h(7);
				var g = (f = {}, f[a] = t, f[o] = n, f[i] = e, f)[m] || 1, _ = this.$d.getTime() + r * g;
				return T.w(_, this);
			}, _.subtract = function(e, t) {
				return this.add(-1 * e, t);
			}, _.format = function(e) {
				var t = this, n = this.$locale();
				if (!this.isValid()) return n.invalidDate || p;
				var r = e || "YYYY-MM-DDTHH:mm:ssZ", i = T.z(this), a = this.$H, o = this.$m, s = this.$M, c = n.weekdays, l = n.months, u = n.meridiem, d = function(e, n, i, a) {
					return e && (e[n] || e(t, r)) || i[n].slice(0, a);
				}, f = function(e) {
					return T.s(a % 12 || 12, e, "0");
				}, m = u || function(e, t, n) {
					var r = e < 12 ? "AM" : "PM";
					return n ? r.toLowerCase() : r;
				};
				return r.replace(h, (function(e, r) {
					return r || function(e) {
						switch (e) {
							case "YY": return String(t.$y).slice(-2);
							case "YYYY": return T.s(t.$y, 4, "0");
							case "M": return s + 1;
							case "MM": return T.s(s + 1, 2, "0");
							case "MMM": return d(n.monthsShort, s, l, 3);
							case "MMMM": return d(l, s);
							case "D": return t.$D;
							case "DD": return T.s(t.$D, 2, "0");
							case "d": return String(t.$W);
							case "dd": return d(n.weekdaysMin, t.$W, c, 2);
							case "ddd": return d(n.weekdaysShort, t.$W, c, 3);
							case "dddd": return c[t.$W];
							case "H": return String(a);
							case "HH": return T.s(a, 2, "0");
							case "h": return f(1);
							case "hh": return f(2);
							case "a": return m(a, o, !0);
							case "A": return m(a, o, !1);
							case "m": return String(o);
							case "mm": return T.s(o, 2, "0");
							case "s": return String(t.$s);
							case "ss": return T.s(t.$s, 2, "0");
							case "SSS": return T.s(t.$ms, 3, "0");
							case "Z": return i;
						}
						return null;
					}(e) || i.replace(":", "");
				}));
			}, _.utcOffset = function() {
				return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
			}, _.diff = function(r, f, p) {
				var m, h = this, g = T.p(f), _ = w(r), v = (_.utcOffset() - this.utcOffset()) * t, y = this - _, b = function() {
					return T.m(h, _);
				};
				switch (g) {
					case d:
						m = b() / 12;
						break;
					case l:
						m = b();
						break;
					case u:
						m = b() / 3;
						break;
					case c:
						m = (y - v) / 6048e5;
						break;
					case s:
						m = (y - v) / 864e5;
						break;
					case o:
						m = y / n;
						break;
					case a:
						m = y / t;
						break;
					case i:
						m = y / e;
						break;
					default: m = y;
				}
				return p ? m : T.a(m);
			}, _.daysInMonth = function() {
				return this.endOf(l).$D;
			}, _.$locale = function() {
				return b[this.$L];
			}, _.locale = function(e, t) {
				if (!e) return this.$L;
				var n = this.clone(), r = C(e, t, !0);
				return r && (n.$L = r), n;
			}, _.clone = function() {
				return T.w(this.$d, this);
			}, _.toDate = function() {
				return new Date(this.valueOf());
			}, _.toJSON = function() {
				return this.isValid() ? this.toISOString() : null;
			}, _.toISOString = function() {
				return this.$d.toISOString();
			}, _.toString = function() {
				return this.$d.toUTCString();
			}, g;
		}(), D = E.prototype;
		return w.prototype = D, [
			["$ms", r],
			["$s", i],
			["$m", a],
			["$H", o],
			["$W", s],
			["$M", l],
			["$y", d],
			["$D", f]
		].forEach((function(e) {
			D[e[1]] = function(t) {
				return this.$g(t, e[0], e[1]);
			};
		})), w.extend = function(e, t) {
			return e.$i || (e(t, E, w), e.$i = !0), w;
		}, w.locale = C, w.isDayjs = S, w.unix = function(e) {
			return w(1e3 * e);
		}, w.en = b[y], w.Ls = b, w.p = {}, w;
	}));
})))());
function Q({ className: e, ...t }) {
	return /* @__PURE__ */ h(Be, {
		"data-slot": "label",
		className: V("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/components/ui/textarea.tsx
function Br({ className: e, ...t }) {
	return /* @__PURE__ */ h("textarea", {
		"data-slot": "textarea",
		className: V("flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-start shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40", e),
		...t
	});
}
//#endregion
//#region ../Modules/ai-content-module/client/pages/AiCalendarPage.tsx
function Vr() {
	let { t: e } = l(), t = f(), [n, r] = c(""), [i, a] = c(""), [o, s] = c(() => (0, zr.default)().format("YYYY-MM-DD")), [m, _] = c("blog"), [v, y] = c(""), b = d({
		queryKey: ["ai-content", "calendar"],
		queryFn: () => Cr()
	});
	Z(b);
	let x = () => void t.invalidateQueries({ queryKey: ["ai-content"] }), S = u({
		mutationFn: () => wr({
			slot_date: o,
			content_type: m,
			topic: n,
			focus_keyword: i || n
		}),
		onSuccess: () => {
			p.success(e("common.saved")), r(""), a(""), x();
		},
		onError: (t) => X(e, t)
	}), C = u({
		mutationFn: () => Tr({
			topics: v,
			start_date: o,
			content_type: m,
			focus_keyword: i
		}),
		onSuccess: (t) => {
			p.success(e("aiContent.bulkCreated", { count: t.created })), y(""), x();
		},
		onError: (t) => X(e, t)
	}), w = u({
		mutationFn: (e) => Er(e),
		onSuccess: () => {
			p.success(e("common.deleted")), x();
		},
		onError: (t) => X(e, t)
	}), T = u({
		mutationFn: Dr,
		onSuccess: () => {
			p.success(e("aiContent.dueQueued")), x();
		},
		onError: (t) => X(e, t)
	});
	return /* @__PURE__ */ g("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ h("div", {
				className: "flex flex-wrap gap-2",
				children: /* @__PURE__ */ h(H, {
					size: "sm",
					onClick: () => void T.mutateAsync(),
					disabled: T.isPending,
					children: e("aiContent.runDue")
				})
			}),
			/* @__PURE__ */ g(U, { children: [/* @__PURE__ */ h(W, { children: /* @__PURE__ */ h(G, { children: e("aiContent.addSlot") }) }), /* @__PURE__ */ g(K, {
				className: "grid gap-3 md:grid-cols-2",
				children: [
					/* @__PURE__ */ g("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ h(Q, { children: e("aiContent.fieldDate") }), /* @__PURE__ */ h(q, {
							type: "date",
							value: o,
							onChange: (e) => s(e.target.value)
						})]
					}),
					/* @__PURE__ */ g("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ h(Q, { children: e("aiContent.fieldType") }), /* @__PURE__ */ g("select", {
							className: "flex h-9 w-full rounded-md border bg-background px-3 text-sm",
							value: m,
							onChange: (e) => _(e.target.value),
							children: [/* @__PURE__ */ h("option", {
								value: "blog",
								children: e("aiContent.typeBlog")
							}), /* @__PURE__ */ h("option", {
								value: "product",
								children: e("aiContent.typeProduct")
							})]
						})]
					}),
					/* @__PURE__ */ g("div", {
						className: "space-y-1 md:col-span-2",
						children: [/* @__PURE__ */ h(Q, { children: e("aiContent.fieldTopic") }), /* @__PURE__ */ h(q, {
							value: n,
							onChange: (e) => r(e.target.value)
						})]
					}),
					/* @__PURE__ */ g("div", {
						className: "space-y-1 md:col-span-2",
						children: [/* @__PURE__ */ h(Q, { children: e("aiContent.fieldFocus") }), /* @__PURE__ */ h(q, {
							value: i,
							onChange: (e) => a(e.target.value)
						})]
					}),
					/* @__PURE__ */ h(H, {
						disabled: !n.trim() || S.isPending,
						onClick: () => void S.mutateAsync(),
						children: e("common.save")
					})
				]
			})] }),
			/* @__PURE__ */ g(U, { children: [/* @__PURE__ */ h(W, { children: /* @__PURE__ */ h(G, { children: e("aiContent.bulkTopics") }) }), /* @__PURE__ */ g(K, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ h("p", {
						className: "text-sm text-muted-foreground",
						children: e("aiContent.bulkHint")
					}),
					/* @__PURE__ */ h(Br, {
						rows: 6,
						value: v,
						onChange: (e) => y(e.target.value)
					}),
					/* @__PURE__ */ h(H, {
						disabled: !v.trim() || C.isPending,
						onClick: () => void C.mutateAsync(),
						children: e("aiContent.bulkCreate")
					})
				]
			})] }),
			/* @__PURE__ */ g(U, { children: [/* @__PURE__ */ h(W, { children: /* @__PURE__ */ h(G, { children: e("aiContent.calendarList") }) }), /* @__PURE__ */ g(K, {
				className: "space-y-2",
				children: [(b.data?.items ?? []).map((t) => /* @__PURE__ */ g("div", {
					className: "flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0",
					children: [/* @__PURE__ */ g("div", { children: [/* @__PURE__ */ g("div", {
						className: "font-medium",
						children: [
							t.slot_date,
							" · ",
							t.content_type,
							" · ",
							t.status
						]
					}), /* @__PURE__ */ g("div", { children: [
						t.topic,
						" — ",
						/* @__PURE__ */ h("span", {
							className: "text-muted-foreground",
							children: t.focus_keyword
						})
					] })] }), /* @__PURE__ */ h(H, {
						size: "sm",
						variant: "destructive",
						onClick: () => void w.mutateAsync(t.id),
						children: e("common.delete")
					})]
				}, t.id)), b.data?.items?.length ? null : /* @__PURE__ */ h("p", {
					className: "text-sm text-muted-foreground",
					children: e("aiContent.noSlots")
				})]
			})] })
		]
	});
}
//#endregion
//#region src/components/ui/badge.tsx
var Hr = A("inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3", {
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
function Ur({ className: e, variant: t = "default", asChild: n = !1, ...r }) {
	return /* @__PURE__ */ h(n ? He : "span", {
		"data-slot": "badge",
		"data-variant": t,
		className: V(Hr({ variant: t }), e),
		...r
	});
}
//#endregion
//#region src/components/ui/skeleton.tsx
function Wr({ className: e, ...t }) {
	return /* @__PURE__ */ h("div", {
		"data-slot": "skeleton",
		className: V("animate-pulse rounded-md bg-accent", e),
		...t
	});
}
//#endregion
//#region src/lib/aiJobProgress.ts
var Gr = [
	"queued",
	"provider",
	"seo",
	"writing",
	"done"
];
function Kr(e) {
	if (!e) return "queued";
	if (e.status === "done") return "done";
	if (e.status === "failed") return "failed";
	if (e.status === "cancelled") return "cancelled";
	let t = String(e.result_summary || "").toLowerCase();
	return Gr.includes(t) ? t : e.status === "running" ? "provider" : "queued";
}
function qr(e) {
	return {
		queued: 12,
		provider: 40,
		seo: 65,
		writing: 85,
		done: 100,
		failed: 100,
		cancelled: 100
	}[e] ?? 15;
}
//#endregion
//#region src/components/currency/IrtIcon.tsx
function Jr({ className: e }) {
	return /* @__PURE__ */ g("svg", {
		width: "13",
		height: "12",
		viewBox: "0 0 13 12",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		className: V("inline-block h-[0.85em] w-auto shrink-0 align-[-0.12em]", e),
		"aria-hidden": !0,
		children: [
			/* @__PURE__ */ h("path", {
				d: "M2.32002 6.11782C2.63548 5.96391 2.87208 5.81 3.10867 5.57913C3.2664 5.34826 3.42413 5.11739 3.58186 4.88652C3.66073 4.57869 3.73959 4.27087 3.73959 3.96304H11.2318C11.705 3.96304 12.0993 3.80913 12.4147 3.57826C12.6513 3.27043 12.8091 2.88565 12.8091 2.34696V0.5H11.7838V2.27C11.7838 2.65478 11.5472 2.88565 11.1529 2.88565H3.73959V2.50087C3.73959 2.11609 3.66073 1.88522 3.58186 1.57739C3.58186 1.34652 3.42413 1.11565 3.2664 0.961739C3.10867 0.807826 2.95094 0.730869 2.79321 0.653913C2.55662 0.576956 2.32002 0.5 2.16229 0.5C1.84683 0.5 1.61024 0.576956 1.37364 0.653913C1.21591 0.807826 0.979316 0.884782 0.900451 1.11565C0.742721 1.26956 0.584991 1.42348 0.584991 1.65435C0.506126 1.88522 0.427261 2.11609 0.427261 2.34696C0.427261 2.57782 0.427261 2.80869 0.506126 3.03956C0.584991 3.27043 0.663856 3.42435 0.742721 3.57826C0.900451 3.65521 1.05818 3.80913 1.29478 3.88608C1.53137 3.96304 1.76797 3.96304 2.16229 3.96304H2.79321C2.79321 4.11695 2.71435 4.27087 2.71435 4.42478C2.63548 4.57869 2.47775 4.7326 2.39889 4.88652C2.32002 4.96347 2.16229 5.04043 1.9257 5.11739C1.76797 5.19434 1.53137 5.2713 1.29478 5.2713H0.269531V6.34869H1.29478C1.6891 6.27173 2.00456 6.19478 2.32002 6.11782ZM2.16229 2.88565C1.84683 2.88565 1.6891 2.88565 1.53137 2.73174C1.45251 2.65478 1.37364 2.50087 1.37364 2.27C1.37364 2.03913 1.45251 1.80826 1.53137 1.7313C1.6891 1.65435 1.84683 1.57739 2.08343 1.57739C2.32002 1.57739 2.47775 1.65435 2.63548 1.80826C2.79321 1.96217 2.79321 2.19304 2.79321 2.50087V2.96261H2.16229V2.88565Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ h("path", {
				d: "M10.4422 0.5H7.44531V1.42348H10.4422V0.5Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ h("path", {
				d: "M12.7298 8.50383C12.6509 8.27296 12.5721 8.11905 12.4143 7.96514C12.2566 7.81122 12.0989 7.65731 11.8623 7.58035C11.7046 7.5034 11.468 7.42644 11.2314 7.42644C10.9948 7.42644 10.7582 7.5034 10.5216 7.58035C10.285 7.65731 10.1273 7.81122 9.96953 7.96514C9.8118 8.11905 9.73293 8.27296 9.65407 8.50383C9.5752 8.7347 9.5752 8.96557 9.5752 9.19644V9.42731C9.5752 9.65818 9.49634 9.73513 9.41747 9.88905C9.25974 9.966 9.10201 10.043 8.86542 10.043H8.54996C8.39223 10.043 8.2345 9.966 8.15563 9.88905C8.07677 9.73513 7.9979 9.58122 7.9979 9.42731V5.7334H6.97266V9.58122C6.97266 9.88905 6.97266 10.1199 7.05152 10.2738C7.13039 10.4277 7.20925 10.5817 7.36698 10.7356C7.52471 10.8125 7.60358 10.9664 7.84017 10.9664C7.9979 11.0434 8.15563 11.0434 8.39223 11.0434H8.94428C9.10201 11.0434 9.33861 10.9664 9.49634 10.8895C9.65407 10.8125 9.89066 10.6586 9.96953 10.4277C10.1273 10.6586 10.285 10.8125 10.5216 10.8895C10.7582 10.9664 10.9948 11.0434 11.3102 11.0434C11.7834 11.0434 12.2566 10.8895 12.4932 10.5817C12.8087 10.2738 12.9664 9.81209 12.9664 9.2734C12.8875 8.96557 12.8087 8.7347 12.7298 8.50383ZM11.2314 9.966C10.9948 9.966 10.837 9.88905 10.7582 9.81209C10.5216 9.65818 10.5216 9.50427 10.5216 9.2734C10.5216 9.04253 10.6004 8.88861 10.6793 8.7347C10.7582 8.58079 10.9948 8.50383 11.2314 8.50383C11.468 8.50383 11.7046 8.58079 11.7834 8.7347C11.8623 8.88861 11.9412 9.04253 11.9412 9.2734C11.8623 9.73513 11.6257 9.966 11.2314 9.966Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ h("path", {
				d: "M4.92256 8.50364C4.92256 8.73451 4.92256 8.88842 4.8437 9.11929C4.76484 9.2732 4.68597 9.42712 4.60711 9.58103C4.44938 9.73494 4.29165 9.8119 4.13392 9.88886C3.97619 9.96581 3.73959 10.0428 3.42413 10.0428H2.71435C2.47775 10.0428 2.24116 10.0428 2.00456 9.96581C1.84683 9.8119 1.6891 9.73494 1.61024 9.58103C1.53137 9.42712 1.37364 9.2732 1.37364 9.11929C1.29478 8.96538 1.29478 8.73451 1.29478 8.50364V7.65712H0.269531V8.5806C0.269531 9.35016 0.506126 9.96581 0.900451 10.4276C1.29478 10.8893 1.84683 11.1202 2.63548 11.1202H3.42413C3.81846 11.1202 4.13392 11.0432 4.44938 10.8893C4.76484 10.7354 5.00143 10.5815 5.23803 10.3506C5.47462 10.1197 5.63235 9.8119 5.71122 9.50407C5.79008 9.19625 5.86894 8.88842 5.86894 8.50364V5.73321L4.8437 5.65625L4.92256 8.50364Z",
				fill: "currentColor"
			}),
			/* @__PURE__ */ h("path", {
				d: "M3.73962 7.42578H2.55664V8.50317H3.73962V7.42578Z",
				fill: "currentColor"
			})
		]
	});
}
//#endregion
//#region src/lib/currency.ts
var Yr = /تومان|toman|irt/i;
function Xr(e) {
	return e.replace(/&nbsp;/gi, " ").replace(/&#160;/g, " ").replace(/&#x0*a0;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, "\"").replace(/&#(\d+);/g, (e, t) => {
		let n = Number(t);
		return Number.isFinite(n) ? String.fromCharCode(n) : e;
	}).replace(/\u00a0/g, " ");
}
function Zr(e, t) {
	let n = (e ?? "").trim(), r = (t ?? "").trim();
	if (!n && !r) return !1;
	let i = n.toUpperCase();
	return !!(i === "IRT" || i === "TOMAN" || Yr.test(n) || Yr.test(r));
}
function Qr(e) {
	return e.toLowerCase().startsWith("fa");
}
function $r(e) {
	return e.replace(/\d/g, (e) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(e, 10)] ?? e);
}
//#endregion
//#region src/lib/formatNumber.ts
function ei(e, t) {
	let n = Number.isFinite(e) ? e : 0, r = Qr(t) ? "fa-IR" : "en-US", i = new Intl.NumberFormat(r, { maximumFractionDigits: 2 }).format(n);
	return Qr(t) ? $r(i) : i;
}
//#endregion
//#region src/components/currency/MoneyDisplay.tsx
function ti({ amount: e, currency: t, currencySymbol: n, locale: r, className: i, amountClassName: a, prefix: o }) {
	let s = typeof e == "string" ? Xr(e).replace(/[^\d.-]/g, "") : "", c = typeof e == "number" ? e : parseFloat(s), l = typeof e == "string" && Number.isNaN(c) ? Xr(e) : ei(Number.isFinite(c) ? c : 0, r), u = Zr(t, n) || !t?.trim() && !n?.trim();
	return /* @__PURE__ */ g("span", {
		className: V("inline-flex items-baseline gap-1", i),
		children: [
			o,
			/* @__PURE__ */ h("span", {
				className: a,
				children: l
			}),
			u ? /* @__PURE__ */ h(Jr, {}) : t ? /* @__PURE__ */ h("span", {
				className: "text-muted-foreground text-[0.85em]",
				children: t
			}) : null
		]
	});
}
//#endregion
//#region ../Modules/ai-content-module/client/components/AiToman.tsx
function $({ amount: e, locale: t, className: n }) {
	return /* @__PURE__ */ h(ti, {
		amount: Number.isFinite(e) ? e : 0,
		currency: "IRT",
		locale: t,
		className: n
	});
}
//#endregion
//#region ../Modules/ai-content-module/client/pages/AiJobsPage.tsx
var ni = [
	"",
	"pending",
	"running",
	"failed",
	"cancelled",
	"done"
];
function ri(e) {
	return e.target_type === "calendar" ? "/ai-content/calendar" : e.target_id < 1 ? null : e.target_type === "product" ? `/shop/products/${e.target_id}` : e.target_type === "post" ? `/magazine/posts/${e.target_id}` : e.target_type === "product_cat" || e.target_type === "product_brand" ? "/ai-content/taxonomies" : null;
}
function ii(e) {
	return e === "done" ? "default" : e === "failed" || e === "cancelled" ? "destructive" : e === "running" ? "secondary" : "outline";
}
function ai(e) {
	return e.status === "pending" || e.status === "running";
}
function oi() {
	let { t: e, i18n: t } = l(), n = f(), [r, i] = v(), a = r.get("status") ?? "", o = ni.includes(a) ? a : "", s = d({
		queryKey: [
			"ai-content",
			"jobs",
			o
		],
		queryFn: () => pr({
			status: o || void 0,
			limit: 80
		}),
		refetchInterval: (e) => (e.state.data?.items ?? []).some(ai) ? 2e3 : !1
	});
	Z(s);
	let c = d({
		queryKey: ["ai-content", "queue"],
		queryFn: vr
	});
	Z(c);
	let y = !!c.data?.paused, b = u({
		mutationFn: (e) => mr(e),
		onSuccess: () => {
			p.success(e("aiContent.jobRetried")), n.invalidateQueries({ queryKey: ["ai-content"] });
		},
		onError: (t) => X(e, t)
	}), x = u({
		mutationFn: () => hr(1),
		onSuccess: (t) => {
			if (t.paused) {
				p.message(e("aiContent.queuePausedHint"));
				return;
			}
			p.success(e("aiContent.jobsRunDueDone", { count: t.count })), n.invalidateQueries({ queryKey: ["ai-content"] });
		},
		onError: (t) => X(e, t)
	}), S = u({
		mutationFn: (e) => yr(e),
		onSuccess: (t) => {
			n.setQueryData(["ai-content", "queue"], { paused: t.paused }), p.success(t.paused ? e("aiContent.queuePaused") : e("aiContent.queueResumed")), n.invalidateQueries({ queryKey: ["ai-content"] });
		},
		onError: (t) => X(e, t)
	}), C = u({
		mutationFn: (e) => gr(e),
		onSuccess: () => {
			p.success(e("aiContent.jobCancelled")), n.invalidateQueries({ queryKey: ["ai-content"] });
		},
		onError: (t) => X(e, t)
	}), w = u({
		mutationFn: () => _r(),
		onSuccess: (t) => {
			p.success(e("aiContent.jobsCancelledCount", { count: t.count })), n.invalidateQueries({ queryKey: ["ai-content"] });
		},
		onError: (t) => X(e, t)
	}), T = (e) => {
		let t = new URLSearchParams(r);
		e ? t.set("status", e) : t.delete("status"), i(t, { replace: !0 });
	}, E = (s.data?.items ?? []).some((e) => e.status === "pending"), D = s.data?.items ?? [], ee = D.reduce((e, t) => e + (Number(t.cost_toman) || 0), 0), te = D.reduce((e, t) => e + (t.tokens_in || 0), 0), O = D.reduce((e, t) => e + (t.tokens_out || 0), 0);
	return /* @__PURE__ */ g("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ h("div", {
				className: "flex flex-wrap items-center gap-2",
				children: ni.map((t) => /* @__PURE__ */ h(H, {
					size: "sm",
					variant: o === t ? "default" : "outline",
					onClick: () => T(t),
					children: e(t ? `aiContent.jobsFilter.${t}` : "aiContent.jobsFilter.all")
				}, t || "all"))
			}),
			/* @__PURE__ */ g("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ h(H, {
						size: "sm",
						variant: y ? "default" : "outline",
						disabled: S.isPending,
						onClick: () => void S.mutateAsync(!y),
						children: e(y ? "aiContent.queueResume" : "aiContent.queuePause")
					}),
					/* @__PURE__ */ h(H, {
						size: "sm",
						variant: "outline",
						disabled: w.isPending || !E,
						onClick: () => void w.mutateAsync(),
						children: e("aiContent.jobsCancelPending")
					}),
					/* @__PURE__ */ h(H, {
						size: "sm",
						className: "ms-auto",
						disabled: x.isPending || y,
						onClick: () => void x.mutateAsync(),
						children: e("aiContent.jobsRunDue")
					})
				]
			}),
			y ? /* @__PURE__ */ h("p", {
				className: "text-muted-foreground text-sm",
				children: e("aiContent.queuePausedHint")
			}) : null,
			D.length ? /* @__PURE__ */ g("p", {
				className: "text-muted-foreground text-sm",
				children: [
					e("aiContent.jobsCostTotal"),
					" ",
					/* @__PURE__ */ h($, {
						amount: ee,
						locale: t.language
					}),
					te || O ? ` · ${e("aiContent.jobsTokens", {
						inCount: te,
						outCount: O
					})}` : ""
				]
			}) : null,
			/* @__PURE__ */ g(U, { children: [/* @__PURE__ */ h(W, { children: /* @__PURE__ */ h(G, { children: e("aiContent.jobsPageTitle") }) }), /* @__PURE__ */ g(K, {
				className: "space-y-2",
				children: [
					s.isPending ? /* @__PURE__ */ h(Wr, { className: "h-24 w-full rounded-xl" }) : null,
					(s.data?.items ?? []).map((n) => {
						let r = ri(n);
						return /* @__PURE__ */ g("div", {
							className: "flex flex-wrap items-start justify-between gap-2 border-b py-3 text-sm last:border-0",
							children: [/* @__PURE__ */ g("div", {
								className: "min-w-0 space-y-1",
								children: [
									/* @__PURE__ */ g("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [
											/* @__PURE__ */ g("span", {
												className: "font-medium",
												children: ["#", n.id]
											}),
											/* @__PURE__ */ h("span", { children: e(`aiContent.jobType.${n.job_type}`, { defaultValue: n.job_type }) }),
											/* @__PURE__ */ h(Ur, {
												variant: ii(n.status),
												children: e(`aiContent.jobStatus.${n.status}`, { defaultValue: n.status })
											}),
											n.provider ? /* @__PURE__ */ g("span", {
												className: "text-muted-foreground",
												children: [n.provider, n.model ? ` · ${n.model}` : ""]
											}) : null
										]
									}),
									/* @__PURE__ */ g("div", {
										className: "text-muted-foreground",
										children: [
											r ? /* @__PURE__ */ g(_, {
												className: "underline-offset-2 hover:underline",
												to: r,
												children: [n.target_type, n.target_id > 0 ? ` #${n.target_id}` : ""]
											}) : /* @__PURE__ */ g("span", { children: [n.target_type, n.target_id > 0 ? ` #${n.target_id}` : ""] }),
											n.attempts > 0 ? ` · ${e("aiContent.jobsAttempts", { count: n.attempts })}` : "",
											n.tokens_in || n.tokens_out ? ` · ${e("aiContent.jobsTokens", {
												inCount: n.tokens_in || 0,
												outCount: n.tokens_out || 0
											})}` : "",
											Number(n.cost_toman) > 0 ? /* @__PURE__ */ g(m, { children: [
												" · ",
												/* @__PURE__ */ h($, {
													amount: Number(n.cost_toman),
													locale: t.language
												}),
												n.cost_estimated ? ` (${e("aiContent.costApprox")})` : ""
											] }) : null,
											n.created_at ? ` · ${n.created_at}` : ""
										]
									}),
									n.error_message ? /* @__PURE__ */ h("div", {
										className: "text-destructive whitespace-pre-wrap",
										children: n.error_message
									}) : ai(n) ? /* @__PURE__ */ g("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ h("div", {
											className: "bg-muted h-1.5 overflow-hidden rounded-full",
											children: /* @__PURE__ */ h("div", {
												className: "bg-primary h-full transition-[width] duration-500",
												style: { width: `${qr(Kr(n))}%` }
											})
										}), /* @__PURE__ */ h("div", {
											className: "text-muted-foreground text-xs",
											children: e(`aiContent.phase.${Kr(n)}`, { defaultValue: Kr(n) })
										})]
									}) : n.result_summary && ![
										"queued",
										"provider",
										"seo",
										"writing",
										"done",
										"cancelled"
									].includes(n.result_summary) ? /* @__PURE__ */ h("div", {
										className: "text-muted-foreground",
										children: n.result_summary
									}) : null
								]
							}), /* @__PURE__ */ g("div", {
								className: "flex gap-2",
								children: [ai(n) ? /* @__PURE__ */ h(H, {
									size: "sm",
									variant: "outline",
									disabled: C.isPending,
									onClick: () => void C.mutateAsync(n.id),
									children: e("aiContent.jobsCancel")
								}) : null, n.status === "failed" || n.status === "cancelled" ? /* @__PURE__ */ h(H, {
									size: "sm",
									variant: "outline",
									disabled: b.isPending,
									onClick: () => void b.mutateAsync(n.id),
									children: e("aiContent.retry")
								}) : null]
							})]
						}, n.id);
					}),
					!s.isPending && !s.data?.items?.length ? /* @__PURE__ */ h("p", {
						className: "text-sm text-muted-foreground",
						children: e("aiContent.noJobs")
					}) : null
				]
			})] })
		]
	});
}
//#endregion
//#region ../Modules/ai-content-module/client/pages/AiOverviewPage.tsx
var si = {
	pending: "/ai-content/jobs?status=pending",
	failed: "/ai-content/jobs?status=failed",
	done: "/ai-content/jobs?status=done",
	calendar: "/ai-content/calendar"
};
function ci() {
	let { t: e, i18n: t } = l(), n = f(), r = d({
		queryKey: ["ai-content", "overview"],
		queryFn: cr,
		refetchInterval: (e) => (e.state.data?.jobs_pending ?? 0) > 0 ? 3e3 : !1
	});
	Z(r);
	let i = d({
		queryKey: [
			"ai-content",
			"jobs",
			"recent"
		],
		queryFn: () => pr({ limit: 8 }),
		refetchInterval: (e) => (e.state.data?.items ?? []).some((e) => e.status === "pending" || e.status === "running") ? 3e3 : !1
	});
	Z(i);
	let a = u({
		mutationFn: (e) => mr(e),
		onSuccess: () => {
			p.success(e("aiContent.jobRetried")), n.invalidateQueries({ queryKey: ["ai-content"] });
		},
		onError: (t) => X(e, t)
	}), o = r.data;
	return /* @__PURE__ */ g("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ g("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ h(H, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ h(_, {
							to: "/ai-content/jobs",
							children: e("aiContent.navJobs")
						})
					}),
					/* @__PURE__ */ h(H, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ h(_, {
							to: "/ai-content/calendar",
							children: e("aiContent.navCalendar")
						})
					}),
					/* @__PURE__ */ h(H, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ h(_, {
							to: "/ai-content/products",
							children: e("aiContent.navProducts")
						})
					}),
					/* @__PURE__ */ h(H, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ h(_, {
							to: "/ai-content/taxonomies",
							children: e("aiContent.navTaxonomies")
						})
					}),
					/* @__PURE__ */ h(H, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ h(_, {
							to: "/ai-content/attributes",
							children: e("aiContent.navAttributes")
						})
					}),
					/* @__PURE__ */ h(H, {
						asChild: !0,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ h(_, {
							to: "/ai-content/settings",
							children: e("aiContent.navSettings")
						})
					})
				]
			}),
			r.isPending ? /* @__PURE__ */ h(Wr, { className: "h-32 w-full rounded-xl" }) : /* @__PURE__ */ g("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
				children: [[
					["pending", o?.jobs_pending ?? 0],
					["failed", o?.jobs_failed ?? 0],
					["done", o?.jobs_done ?? 0],
					["calendar", o?.calendar_upcoming ?? 0]
				].map(([t, n]) => /* @__PURE__ */ h(_, {
					to: si[String(t)] ?? "/ai-content/jobs",
					className: "block",
					children: /* @__PURE__ */ g(U, {
						className: "h-full transition-colors hover:bg-muted/40",
						children: [/* @__PURE__ */ h(W, {
							className: "pb-2",
							children: /* @__PURE__ */ h(G, {
								className: "text-sm font-medium text-muted-foreground",
								children: e(`aiContent.stat.${t}`)
							})
						}), /* @__PURE__ */ h(K, { children: /* @__PURE__ */ h("div", {
							className: "text-2xl font-semibold",
							children: n
						}) })]
					})
				}, String(t))), /* @__PURE__ */ h(_, {
					to: "/ai-content/jobs",
					className: "block",
					children: /* @__PURE__ */ g(U, {
						className: "h-full transition-colors hover:bg-muted/40",
						children: [/* @__PURE__ */ h(W, {
							className: "pb-2",
							children: /* @__PURE__ */ h(G, {
								className: "text-sm font-medium text-muted-foreground",
								children: e("aiContent.stat.spend")
							})
						}), /* @__PURE__ */ h(K, { children: /* @__PURE__ */ h("div", {
							className: "text-2xl font-semibold",
							children: /* @__PURE__ */ h($, {
								amount: o?.jobs_cost_toman ?? 0,
								locale: t.language
							})
						}) })]
					})
				})]
			}),
			/* @__PURE__ */ g(U, { children: [/* @__PURE__ */ h(W, { children: /* @__PURE__ */ h(G, { children: e("aiContent.incompleteTitle") }) }), /* @__PURE__ */ g(K, {
				className: "space-y-2",
				children: [/* @__PURE__ */ h("p", {
					className: "text-sm text-muted-foreground",
					children: e("aiContent.incompleteCount", { count: o?.incomplete_products ?? 0 })
				}), (o?.sample_incomplete ?? []).map((e) => /* @__PURE__ */ g("div", {
					className: "flex items-center justify-between gap-2 text-sm",
					children: [/* @__PURE__ */ h(_, {
						className: "underline-offset-2 hover:underline",
						to: `/shop/products/${e.id}`,
						children: e.name
					}), /* @__PURE__ */ h("span", {
						className: "text-muted-foreground",
						children: e.missing.join(", ")
					})]
				}, e.id))]
			})] }),
			/* @__PURE__ */ g(U, { children: [/* @__PURE__ */ g(W, {
				className: "flex flex-row items-center justify-between space-y-0",
				children: [/* @__PURE__ */ h(G, { children: e("aiContent.jobsTitle") }), /* @__PURE__ */ h(H, {
					asChild: !0,
					variant: "ghost",
					size: "sm",
					children: /* @__PURE__ */ h(_, {
						to: "/ai-content/jobs",
						children: e("aiContent.jobsViewAll")
					})
				})]
			}), /* @__PURE__ */ g(K, {
				className: "space-y-2",
				children: [(i.data?.items ?? []).map((t) => /* @__PURE__ */ g("div", {
					className: "flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0",
					children: [/* @__PURE__ */ g("div", { children: [/* @__PURE__ */ g("div", {
						className: "font-medium",
						children: [
							"#",
							t.id,
							" · ",
							e(`aiContent.jobType.${t.job_type}`, { defaultValue: t.job_type }),
							" ·",
							" ",
							e(`aiContent.jobStatus.${t.status}`, { defaultValue: t.status })
						]
					}), /* @__PURE__ */ h("div", {
						className: "text-muted-foreground",
						children: t.result_summary || t.error_message || t.provider
					})] }), t.status === "failed" ? /* @__PURE__ */ h(H, {
						size: "sm",
						variant: "outline",
						disabled: a.isPending,
						onClick: () => void a.mutateAsync(t.id),
						children: e("aiContent.retry")
					}) : null]
				}, t.id)), i.data?.items?.length ? null : /* @__PURE__ */ h("p", {
					className: "text-sm text-muted-foreground",
					children: e("aiContent.noJobs")
				})]
			})] })
		]
	});
}
//#endregion
//#region ../Modules/ai-content-module/client/pages/AiProductsPage.tsx
function li() {
	let { t: e, i18n: t } = l(), n = f(), r = d({
		queryKey: ["ai-content", "incomplete"],
		queryFn: () => xr(80)
	});
	Z(r);
	let i = d({
		queryKey: ["ai-content", "cost-estimate"],
		queryFn: () => dr()
	});
	Z(i);
	let a = u({
		mutationFn: () => Sr(),
		onSuccess: (t) => {
			p.success(e("aiContent.batchQueued", { count: t.count })), n.invalidateQueries({ queryKey: ["ai-content"] });
		},
		onError: (t) => X(e, t)
	}), o = u({
		mutationFn: (e) => br({
			type: "product",
			id: e,
			sync: !1
		}),
		onSuccess: (t) => {
			if (!t?.job_id || t.job_id < 1) {
				p.error(e("aiContent.jobQueueFailed"));
				return;
			}
			p.success(e("aiContent.jobQueued")), n.invalidateQueries({ queryKey: ["ai-content"] });
		},
		onError: (t) => X(e, t)
	}), s = r.data?.items?.length ?? 0, c = i.data?.entities.product?.cost_toman.mid ?? 0;
	return /* @__PURE__ */ g("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ g("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ h(H, {
				size: "sm",
				onClick: () => void a.mutateAsync(),
				disabled: a.isPending,
				children: e("aiContent.fillIncomplete")
			}), s > 0 && c > 0 ? /* @__PURE__ */ g("p", {
				className: "text-muted-foreground text-sm",
				children: [
					e("aiContent.costBatchHint", { count: s }),
					" ",
					/* @__PURE__ */ h($, {
						amount: c,
						locale: t.language
					}),
					" × ",
					s,
					" ≈ ",
					/* @__PURE__ */ h($, {
						amount: c * s,
						locale: t.language
					})
				]
			}) : null]
		}), /* @__PURE__ */ g(U, { children: [/* @__PURE__ */ h(W, { children: /* @__PURE__ */ h(G, { children: e("aiContent.incompleteTitle") }) }), /* @__PURE__ */ g(K, {
			className: "space-y-2",
			children: [(r.data?.items ?? []).map((t) => /* @__PURE__ */ g("div", {
				className: "flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0",
				children: [/* @__PURE__ */ g("div", { children: [/* @__PURE__ */ h(_, {
					className: "font-medium underline-offset-2 hover:underline",
					to: `/shop/products/${t.id}`,
					children: t.name
				}), /* @__PURE__ */ h("div", {
					className: "text-muted-foreground",
					children: t.missing.join(", ")
				})] }), /* @__PURE__ */ h(H, {
					size: "sm",
					variant: "outline",
					disabled: o.isPending,
					onClick: () => void o.mutateAsync(t.id),
					children: e("aiContent.generate")
				})]
			}, t.id)), r.data?.items?.length ? null : /* @__PURE__ */ h("p", {
				className: "text-sm text-muted-foreground",
				children: e("aiContent.noIncomplete")
			})]
		})] })]
	});
}
//#endregion
//#region src/components/ui/switch.tsx
function ui({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ h(at, {
		"data-slot": "switch",
		"data-size": t,
		className: V("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", e),
		...n,
		dir: "ltr",
		children: /* @__PURE__ */ h(ot, {
			"data-slot": "switch-thumb",
			className: V("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
//#endregion
//#region ../Modules/ai-content-module/client/components/AiCostCard.tsx
var di = [
	"gpt-5.6-luna",
	"gpt-5.6-terra",
	"gpt-5.6-sol"
];
function fi({ estimate: e, draft: t, onPickModel: n, onUsdToToman: r, onRate: i }) {
	let { t: a, i18n: o } = l(), s = o.language, c = e?.models ?? [], u = (t.gapgpt_model || e?.current.model || "").toLowerCase(), d = c.filter((e) => di.includes(e.id) || e.id === u || e.selected), f = c.filter((e) => !d.some((t) => t.id === e.id)), p = e?.entities.product, m = e?.entities.product_brand, _ = e?.entities.product_cat, v = e?.entities.blog;
	return /* @__PURE__ */ g("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ h("p", {
				className: "text-muted-foreground text-sm",
				children: a("aiContent.costLead")
			}),
			e ? null : /* @__PURE__ */ h("p", {
				className: "text-muted-foreground text-sm",
				children: a("common.loading")
			}),
			p ? /* @__PURE__ */ g("div", {
				className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ h(pi, {
						locale: s,
						label: a("aiContent.settingsProduct"),
						mid: p.cost_toman.mid,
						hi: p.cost_toman.hi,
						source: p.source
					}),
					/* @__PURE__ */ h(pi, {
						locale: s,
						label: a("aiContent.settingsBrand"),
						mid: m?.cost_toman.mid ?? 0,
						hi: m?.cost_toman.hi ?? 0,
						source: m?.source ?? ""
					}),
					/* @__PURE__ */ h(pi, {
						locale: s,
						label: a("aiContent.settingsProductCat"),
						mid: _?.cost_toman.mid ?? 0,
						hi: _?.cost_toman.hi ?? 0,
						source: _?.source ?? ""
					}),
					/* @__PURE__ */ h(pi, {
						locale: s,
						label: a("aiContent.settingsBlog"),
						mid: v?.cost_toman.mid ?? 0,
						hi: v?.cost_toman.hi ?? 0,
						source: v?.source ?? ""
					})
				]
			}) : null,
			/* @__PURE__ */ h("div", {
				className: "overflow-x-auto rounded-lg border",
				children: /* @__PURE__ */ g("table", {
					className: "w-full min-w-[720px] text-sm",
					children: [/* @__PURE__ */ h("thead", {
						className: "bg-muted/40 text-muted-foreground text-xs",
						children: /* @__PURE__ */ g("tr", { children: [
							/* @__PURE__ */ h("th", {
								className: "px-3 py-2 text-start font-medium",
								children: a("aiContent.costModel")
							}),
							/* @__PURE__ */ h("th", {
								className: "px-3 py-2 text-start font-medium",
								children: a("aiContent.costIn")
							}),
							/* @__PURE__ */ h("th", {
								className: "px-3 py-2 text-start font-medium",
								children: a("aiContent.costOut")
							}),
							/* @__PURE__ */ h("th", {
								className: "px-3 py-2 text-start font-medium",
								children: a("aiContent.settingsProduct")
							}),
							/* @__PURE__ */ h("th", {
								className: "px-3 py-2 text-start font-medium",
								children: a("aiContent.settingsBrand")
							}),
							/* @__PURE__ */ h("th", {
								className: "px-3 py-2 text-start font-medium",
								children: a("aiContent.settingsProductCat")
							}),
							/* @__PURE__ */ h("th", {
								className: "px-3 py-2 text-start font-medium",
								children: a("aiContent.settingsBlog")
							})
						] })
					}), /* @__PURE__ */ h("tbody", { children: d.map((e) => /* @__PURE__ */ h(mi, {
						model: e,
						selected: e.id === u,
						locale: s,
						onPick: n
					}, e.id)) })]
				})
			}),
			f.length ? /* @__PURE__ */ g("details", {
				className: "rounded-lg border p-3",
				children: [/* @__PURE__ */ h("summary", {
					className: "cursor-pointer text-sm font-medium",
					children: a("aiContent.costMoreModels")
				}), /* @__PURE__ */ h("div", {
					className: "mt-3 overflow-x-auto",
					children: /* @__PURE__ */ h("table", {
						className: "w-full min-w-[720px] text-sm",
						children: /* @__PURE__ */ h("tbody", { children: f.slice(0, 20).map((e) => /* @__PURE__ */ h(mi, {
							model: e,
							selected: e.id === u,
							locale: s,
							onPick: n
						}, e.id)) })
					})
				})]
			}) : null,
			/* @__PURE__ */ g("p", {
				className: "text-muted-foreground text-xs",
				children: [
					a("aiContent.costDisclaimer", { date: e?.rates_updated_at ?? "" }),
					" ",
					/* @__PURE__ */ h("a", {
						className: "underline-offset-2 hover:underline",
						href: e?.pricing_url,
						target: "_blank",
						rel: "noreferrer",
						children: a("aiContent.costPricingLink")
					})
				]
			}),
			/* @__PURE__ */ g("details", {
				className: "rounded-lg border p-3",
				children: [
					/* @__PURE__ */ h("summary", {
						className: "cursor-pointer text-sm font-medium",
						children: a("aiContent.costEditRates")
					}),
					/* @__PURE__ */ h("div", {
						className: "mt-3 grid gap-3 md:grid-cols-2",
						children: /* @__PURE__ */ g("div", {
							className: "space-y-1",
							children: [
								/* @__PURE__ */ h(Q, { children: a("aiContent.costUsdToToman") }),
								/* @__PURE__ */ h(q, {
									type: "number",
									min: 1e3,
									value: t.usd_to_toman ?? e?.usd_to_toman ?? 1e5,
									onChange: (e) => r(Number(e.target.value))
								}),
								/* @__PURE__ */ h("p", {
									className: "text-muted-foreground text-xs",
									children: a("aiContent.costUsdToTomanHint")
								})
							]
						})
					}),
					/* @__PURE__ */ h("div", {
						className: "mt-3 space-y-2",
						children: d.slice(0, 6).map((e) => {
							let n = t.gapgpt_rates?.[e.id];
							return /* @__PURE__ */ g("div", {
								className: "grid grid-cols-[1fr_auto_auto] items-center gap-2 text-sm",
								children: [
									/* @__PURE__ */ h("span", {
										className: "truncate font-medium",
										children: e.id
									}),
									/* @__PURE__ */ h(q, {
										className: "w-28",
										type: "number",
										min: 0,
										value: n?.in_per_1m ?? Math.round(e.in_per_1m),
										onChange: (t) => i(e.id, "in_per_1m", Number(t.target.value)),
										"aria-label": a("aiContent.costIn")
									}),
									/* @__PURE__ */ h(q, {
										className: "w-28",
										type: "number",
										min: 0,
										value: n?.out_per_1m ?? Math.round(e.out_per_1m),
										onChange: (t) => i(e.id, "out_per_1m", Number(t.target.value)),
										"aria-label": a("aiContent.costOut")
									})
								]
							}, e.id);
						})
					})
				]
			})
		]
	});
}
function pi({ label: e, mid: t, hi: n, locale: r, source: i }) {
	let { t: a } = l();
	return /* @__PURE__ */ g("div", {
		className: "rounded-lg border p-3",
		children: [
			/* @__PURE__ */ h("div", {
				className: "text-muted-foreground text-xs",
				children: e
			}),
			/* @__PURE__ */ h("div", {
				className: "mt-1 text-lg font-semibold",
				children: /* @__PURE__ */ h($, {
					amount: t,
					locale: r
				})
			}),
			/* @__PURE__ */ g("div", {
				className: "text-muted-foreground text-xs",
				children: [
					a("aiContent.costUpTo"),
					" ",
					/* @__PURE__ */ h($, {
						amount: n,
						locale: r
					}),
					i === "jobs" ? ` · ${a("aiContent.costFromJobs")}` : ""
				]
			})
		]
	});
}
function mi({ model: e, selected: t, locale: n, onPick: r }) {
	return /* @__PURE__ */ g("tr", {
		className: `cursor-pointer border-t hover:bg-muted/50 ${t ? "bg-primary/10" : ""}`,
		onClick: () => r(e.id),
		children: [
			/* @__PURE__ */ g("td", {
				className: "px-3 py-2 font-medium",
				children: [e.id, t ? " ✓" : ""]
			}),
			/* @__PURE__ */ h("td", {
				className: "px-3 py-2",
				children: /* @__PURE__ */ h($, {
					amount: e.in_per_1m,
					locale: n
				})
			}),
			/* @__PURE__ */ h("td", {
				className: "px-3 py-2",
				children: /* @__PURE__ */ h($, {
					amount: e.out_per_1m,
					locale: n
				})
			}),
			/* @__PURE__ */ h("td", {
				className: "px-3 py-2",
				children: /* @__PURE__ */ h($, {
					amount: e.costs.product ?? 0,
					locale: n
				})
			}),
			/* @__PURE__ */ h("td", {
				className: "px-3 py-2",
				children: /* @__PURE__ */ h($, {
					amount: e.costs.product_brand ?? 0,
					locale: n
				})
			}),
			/* @__PURE__ */ h("td", {
				className: "px-3 py-2",
				children: /* @__PURE__ */ h($, {
					amount: e.costs.product_cat ?? 0,
					locale: n
				})
			}),
			/* @__PURE__ */ h("td", {
				className: "px-3 py-2",
				children: /* @__PURE__ */ h($, {
					amount: e.costs.blog ?? 0,
					locale: n
				})
			})
		]
	});
}
//#endregion
//#region ../Modules/ai-content-module/client/pages/AiSettingsPage.tsx
var hi = [
	{
		id: "product",
		doKey: "do_product",
		promptKey: "prompt_product",
		titleKey: "aiContent.settingsProductIshop",
		navKey: "aiContent.settingsProduct",
		fields: [
			"name",
			"slug",
			"english_name",
			"short_description",
			"description",
			"ai_review_summary",
			"faqs",
			"custom_labels",
			"attributes",
			"tags",
			"seo"
		]
	},
	{
		id: "coffee",
		doKey: "do_coffee",
		promptKey: "prompt_coffee",
		titleKey: "aiContent.settingsCoffee",
		navKey: "aiContent.settingsCoffee",
		fields: [
			"blend_arabica",
			"blend_robusta",
			"acidity",
			"caffeine_mg",
			"bitterness",
			"sweetness",
			"body",
			"origin_ids",
			"visible"
		]
	},
	{
		id: "product_cat",
		doKey: "do_product_cat",
		promptKey: "prompt_product_cat",
		titleKey: "aiContent.settingsProductCat",
		navKey: "aiContent.settingsProductCat",
		fields: ["description", "seo"]
	},
	{
		id: "product_brand",
		doKey: "do_product_brand",
		promptKey: "prompt_product_brand",
		titleKey: "aiContent.settingsBrand",
		navKey: "aiContent.settingsBrand",
		fields: ["description", "seo"]
	},
	{
		id: "blog",
		doKey: "do_blog",
		promptKey: "prompt_blog",
		titleKey: "aiContent.settingsBlog",
		navKey: "aiContent.settingsBlog",
		fields: [
			"title",
			"slug",
			"excerpt",
			"content",
			"tags",
			"seo"
		]
	},
	{
		id: "blog_cat",
		doKey: "do_blog_cat",
		promptKey: "prompt_blog_cat",
		titleKey: "aiContent.settingsBlogCat",
		navKey: "aiContent.settingsBlogCat",
		fields: ["description", "seo"]
	}
], gi = [
	"professional",
	"friendly",
	"expert",
	"educational",
	"sales",
	"storytelling",
	"luxury",
	"casual",
	"enthusiastic"
], _i = {
	short_description: ["paragraphs", "words"],
	description: ["words", "paragraphs"],
	ai_review_summary: ["words", "paragraphs"],
	faqs: ["count"],
	custom_labels: ["count"],
	excerpt: ["paragraphs", "words"],
	content: ["words", "paragraphs"]
};
function vi() {
	let { t: e } = l(), t = f(), [n, r] = c(null), i = d({
		queryKey: ["ai-content", "settings"],
		queryFn: lr
	});
	Z(i);
	let s = !!i.data?.has_gapgpt_key, m = d({
		queryKey: ["ai-content", "gapgpt-models"],
		queryFn: () => fr(!1),
		enabled: s
	});
	Z(m), a(() => {
		i.data && r({
			...i.data,
			grok_api_key: "",
			gemini_api_key: "",
			openai_api_key: "",
			gapgpt_api_key: ""
		});
	}, [i.data]);
	let _ = u({
		mutationFn: () => ur(n ?? {}),
		onSuccess: async (n) => {
			p.success(e("common.saved")), r({
				...n,
				grok_api_key: "",
				gemini_api_key: "",
				openai_api_key: "",
				gapgpt_api_key: ""
			}), await t.invalidateQueries({ queryKey: ["ai-content", "settings"] }), await t.invalidateQueries({ queryKey: ["ai-content", "gapgpt-models"] });
		},
		onError: (t) => X(e, t)
	}), v = u({
		mutationFn: () => fr(!0),
		onSuccess: (n) => {
			t.setQueryData(["ai-content", "gapgpt-models"], n), p.success(e("aiContent.gapgptRefreshModels"));
		},
		onError: (t) => X(e, t)
	}), y = o(() => {
		let e = (m.data?.models ?? []).map((e) => e.id).filter(Boolean), t = (n?.gapgpt_model || "").trim();
		return t && !e.includes(t) && e.unshift(t), e;
	}, [m.data, n?.gapgpt_model]), b = d({
		queryKey: [
			"ai-content",
			"cost-estimate",
			n?.gapgpt_model,
			n?.default_provider,
			n?.usd_to_toman,
			n?.gapgpt_rates,
			n?.fields,
			n?.do_coffee,
			n?.language
		],
		queryFn: () => dr({
			gapgpt_model: n?.gapgpt_model,
			default_provider: n?.default_provider,
			usd_to_toman: n?.usd_to_toman,
			gapgpt_rates: n?.gapgpt_rates,
			fields: n?.fields,
			do_coffee: n?.do_coffee,
			language: n?.language,
			prompt_system: n?.prompt_system
		}),
		enabled: !!n
	});
	Z(b);
	let x = o(() => hi.filter((e) => e.id !== "coffee" || !!n?.coffee_module), [n?.coffee_module]), S = o(() => [
		{
			id: "providers",
			label: e("aiContent.settingsProviders")
		},
		{
			id: "cost",
			label: e("aiContent.settingsCost")
		},
		{
			id: "site",
			label: e("aiContent.settingsProfile")
		},
		{
			id: "tones",
			label: e("aiContent.settingsTones")
		},
		{
			id: "system",
			label: e("aiContent.settingsSystemPrompt")
		},
		...x.map((t) => ({
			id: t.id,
			label: e(t.navKey)
		})),
		{
			id: "automation",
			label: e("aiContent.settingsAutomation")
		}
	], [x, e]);
	if (!n) return /* @__PURE__ */ h("div", {
		className: "text-sm text-muted-foreground",
		children: e("common.loading")
	});
	let C = (e, t) => {
		r((n) => ({
			...n ?? {},
			[e]: t
		}));
	}, w = (e, t, n) => {
		r((r) => {
			let i = { ...r?.fields ?? {} }, a = i[e]?.[t] ?? {
				enabled: !0,
				length: 0,
				unit: "words"
			};
			return i[e] = {
				...i[e] ?? {},
				[t]: {
					...a,
					...n
				}
			}, {
				...r ?? {},
				fields: i
			};
		});
	};
	return /* @__PURE__ */ g("div", {
		className: "relative space-y-4 pb-20",
		children: [
			/* @__PURE__ */ g("div", { children: [/* @__PURE__ */ h("h1", {
				className: "text-xl font-semibold tracking-tight",
				children: e("aiContent.settingsPageTitle")
			}), /* @__PURE__ */ h("p", {
				className: "text-muted-foreground mt-1 text-sm",
				children: e("aiContent.settingsPageLead")
			})] }),
			/* @__PURE__ */ h("nav", {
				className: "bg-background/95 sticky top-0 z-20 -mx-1 flex flex-wrap gap-1 border-b py-2 backdrop-blur",
				children: S.map((e) => /* @__PURE__ */ h("a", {
					href: `#ai-sec-${e.id}`,
					className: "hover:bg-muted rounded-md px-2.5 py-1.5 text-xs font-medium",
					children: e.label
				}, e.id))
			}),
			/* @__PURE__ */ g(U, {
				id: "ai-sec-providers",
				children: [/* @__PURE__ */ h(W, { children: /* @__PURE__ */ h(G, { children: e("aiContent.settingsProviders") }) }), /* @__PURE__ */ g(K, {
					className: "grid gap-3 md:grid-cols-2",
					children: [
						/* @__PURE__ */ g("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ h(Q, { children: e("aiContent.defaultProvider") }), /* @__PURE__ */ g("select", {
								className: "flex h-9 w-full rounded-md border bg-background px-3 text-sm",
								value: n.default_provider ?? "grok",
								onChange: (e) => C("default_provider", e.target.value),
								children: [
									/* @__PURE__ */ h("option", {
										value: "grok",
										children: "Grok"
									}),
									/* @__PURE__ */ h("option", {
										value: "gemini",
										children: "Gemini"
									}),
									/* @__PURE__ */ h("option", {
										value: "openai",
										children: "ChatGPT"
									}),
									/* @__PURE__ */ h("option", {
										value: "gapgpt",
										children: e("aiContent.gapgpt")
									})
								]
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-1 md:col-span-2",
							children: [/* @__PURE__ */ g(Q, { children: ["Grok API key ", n.has_grok_key ? `(${n.grok_api_key_masked})` : ""] }), /* @__PURE__ */ h(q, {
								type: "password",
								value: n.grok_api_key ?? "",
								onChange: (e) => C("grok_api_key", e.target.value),
								placeholder: e("aiContent.leaveBlankKeep")
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-1 md:col-span-2",
							children: [/* @__PURE__ */ g(Q, { children: ["Gemini API key ", n.has_gemini_key ? `(${n.gemini_api_key_masked})` : ""] }), /* @__PURE__ */ h(q, {
								type: "password",
								value: n.gemini_api_key ?? "",
								onChange: (e) => C("gemini_api_key", e.target.value),
								placeholder: e("aiContent.leaveBlankKeep")
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-1 md:col-span-2",
							children: [/* @__PURE__ */ g(Q, { children: ["OpenAI API key ", n.has_openai_key ? `(${n.openai_api_key_masked})` : ""] }), /* @__PURE__ */ h(q, {
								type: "password",
								value: n.openai_api_key ?? "",
								onChange: (e) => C("openai_api_key", e.target.value),
								placeholder: e("aiContent.leaveBlankKeep")
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-1 md:col-span-2",
							children: [/* @__PURE__ */ g(Q, { children: [
								e("aiContent.gapgptKey"),
								" ",
								n.has_gapgpt_key ? `(${n.gapgpt_api_key_masked})` : ""
							] }), /* @__PURE__ */ h(q, {
								type: "password",
								value: n.gapgpt_api_key ?? "",
								onChange: (e) => C("gapgpt_api_key", e.target.value),
								placeholder: e("aiContent.leaveBlankKeep")
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ h(Q, { children: "Grok model" }), /* @__PURE__ */ h(q, {
								value: n.grok_model ?? "",
								onChange: (e) => C("grok_model", e.target.value)
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ h(Q, { children: "Gemini model" }), /* @__PURE__ */ h(q, {
								value: n.gemini_model ?? "",
								onChange: (e) => C("gemini_model", e.target.value)
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ h(Q, { children: "OpenAI model" }), /* @__PURE__ */ h(q, {
								value: n.openai_model ?? "",
								onChange: (e) => C("openai_model", e.target.value)
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-1 md:col-span-2",
							children: [
								/* @__PURE__ */ h(Q, { children: e("aiContent.gapgptModel") }),
								/* @__PURE__ */ g("div", {
									className: "flex flex-col gap-2 sm:flex-row",
									children: [/* @__PURE__ */ h("select", {
										className: "flex h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-60",
										value: n.gapgpt_model ?? "",
										disabled: !s || m.isLoading,
										onChange: (e) => C("gapgpt_model", e.target.value),
										children: y.length === 0 ? /* @__PURE__ */ h("option", {
											value: n.gapgpt_model ?? "",
											children: n.gapgpt_model || "—"
										}) : y.map((e) => /* @__PURE__ */ h("option", {
											value: e,
											children: e
										}, e))
									}), /* @__PURE__ */ h(H, {
										type: "button",
										variant: "outline",
										disabled: !s || v.isPending || m.isFetching,
										onClick: () => void v.mutateAsync(),
										children: e("aiContent.gapgptRefreshModels")
									})]
								}),
								s ? m.isFetched && y.length === 0 ? /* @__PURE__ */ h("p", {
									className: "text-muted-foreground text-xs",
									children: e("aiContent.gapgptNoModels")
								}) : null : /* @__PURE__ */ h("p", {
									className: "text-muted-foreground text-xs",
									children: e("aiContent.gapgptSaveKeyFirst")
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ g(U, {
				id: "ai-sec-cost",
				children: [/* @__PURE__ */ h(W, { children: /* @__PURE__ */ h(G, { children: e("aiContent.settingsCost") }) }), /* @__PURE__ */ h(K, { children: /* @__PURE__ */ h(fi, {
					estimate: b.data,
					draft: n,
					onPickModel: (e) => {
						C("gapgpt_model", e), C("default_provider", "gapgpt");
					},
					onUsdToToman: (e) => C("usd_to_toman", e),
					onRate: (e, t, r) => {
						let i = n.gapgpt_rates ?? {}, a = i[e] ?? {
							in_per_1m: b.data?.models.find((t) => t.id === e)?.in_per_1m ?? 0,
							out_per_1m: b.data?.models.find((t) => t.id === e)?.out_per_1m ?? 0
						};
						C("gapgpt_rates", {
							...i,
							[e]: {
								...a,
								[t]: r
							}
						});
					}
				}) })]
			}),
			/* @__PURE__ */ g(U, {
				id: "ai-sec-site",
				children: [/* @__PURE__ */ h(W, { children: /* @__PURE__ */ h(G, { children: e("aiContent.settingsProfile") }) }), /* @__PURE__ */ g(K, {
					className: "grid gap-3 md:grid-cols-2",
					children: [
						/* @__PURE__ */ g("div", {
							className: "space-y-1 md:col-span-2",
							children: [/* @__PURE__ */ h(Q, { children: e("aiContent.siteName") }), /* @__PURE__ */ h(q, {
								value: n.site_name ?? "",
								onChange: (e) => C("site_name", e.target.value)
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-1 md:col-span-2",
							children: [/* @__PURE__ */ h(Q, { children: e("aiContent.siteTopic") }), /* @__PURE__ */ h(Br, {
								rows: 2,
								value: n.site_topic ?? "",
								onChange: (e) => C("site_topic", e.target.value)
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ h(Q, { children: e("aiContent.language") }), /* @__PURE__ */ g("select", {
								className: "flex h-9 w-full rounded-md border bg-background px-3 text-sm",
								value: n.language ?? "fa",
								onChange: (e) => C("language", e.target.value),
								children: [/* @__PURE__ */ h("option", {
									value: "fa",
									children: e("aiContent.lang.fa")
								}), /* @__PURE__ */ h("option", {
									value: "en",
									children: e("aiContent.lang.en")
								})]
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-2 md:col-span-2",
							children: [
								/* @__PURE__ */ g("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ h(Q, { children: e("aiContent.temperature") }), /* @__PURE__ */ h("span", {
										className: "text-muted-foreground text-sm tabular-nums",
										children: Number(n.temperature ?? .55).toFixed(2)
									})]
								}),
								/* @__PURE__ */ h("input", {
									type: "range",
									min: 0,
									max: 2,
									step: .05,
									value: n.temperature ?? .55,
									onChange: (e) => C("temperature", Number(e.target.value)),
									className: "w-full accent-primary"
								}),
								/* @__PURE__ */ h("p", {
									className: "text-muted-foreground text-xs",
									children: e("aiContent.temperatureHint")
								})
							]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-1",
							children: [
								/* @__PURE__ */ h(Q, { children: e("aiContent.maxTokens") }),
								/* @__PURE__ */ h(q, {
									type: "number",
									min: 0,
									value: n.max_tokens ?? 0,
									onChange: (e) => C("max_tokens", Number(e.target.value))
								}),
								/* @__PURE__ */ h("p", {
									className: "text-muted-foreground text-xs",
									children: e("aiContent.maxTokensHint")
								})
							]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ h(Q, { children: e("aiContent.seoSep") }), /* @__PURE__ */ h(q, {
								value: n.seo_sep ?? " - ",
								onChange: (e) => C("seo_sep", e.target.value)
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "flex items-center gap-2 pt-6",
							children: [/* @__PURE__ */ h(Vn, {
								checked: !!n.require_site_name,
								onCheckedChange: (e) => C("require_site_name", !!e),
								id: "require_site_name"
							}), /* @__PURE__ */ h(Q, {
								htmlFor: "require_site_name",
								children: e("aiContent.requireSiteName")
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "flex items-center justify-between gap-3 rounded-md border px-3 py-2 md:col-span-2",
							children: [/* @__PURE__ */ g("div", { children: [/* @__PURE__ */ h(Q, {
								htmlFor: "web_research",
								children: e("aiContent.webResearch")
							}), /* @__PURE__ */ h("p", {
								className: "text-muted-foreground text-xs",
								children: e("aiContent.webResearchHint")
							})] }), /* @__PURE__ */ h(ui, {
								id: "web_research",
								checked: n.web_research !== !1,
								onCheckedChange: (e) => C("web_research", !!e)
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "flex items-center justify-between gap-3 rounded-md border px-3 py-2 md:col-span-2",
							children: [/* @__PURE__ */ g("div", { children: [/* @__PURE__ */ h(Q, {
								htmlFor: "review_emojis",
								children: e("aiContent.reviewEmojis")
							}), /* @__PURE__ */ h("p", {
								className: "text-muted-foreground text-xs",
								children: e("aiContent.reviewEmojisHint")
							})] }), /* @__PURE__ */ h(ui, {
								id: "review_emojis",
								checked: !!n.review_emojis,
								onCheckedChange: (e) => C("review_emojis", !!e)
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ h(Q, { children: e("aiContent.internalLinksMin") }), /* @__PURE__ */ h(q, {
								type: "number",
								min: 0,
								value: n.internal_links_min ?? 2,
								onChange: (e) => C("internal_links_min", Number(e.target.value))
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ h(Q, { children: e("aiContent.internalLinksMax") }), /* @__PURE__ */ h(q, {
								type: "number",
								min: 0,
								value: n.internal_links_max ?? 4,
								onChange: (e) => C("internal_links_max", Number(e.target.value))
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ g(U, {
				id: "ai-sec-tones",
				children: [/* @__PURE__ */ h(W, { children: /* @__PURE__ */ h(G, { children: e("aiContent.settingsTones") }) }), /* @__PURE__ */ g(K, {
					className: "space-y-2",
					children: [/* @__PURE__ */ h("p", {
						className: "text-muted-foreground text-sm",
						children: e("aiContent.settingsTonesHint")
					}), /* @__PURE__ */ h("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: gi.map((t) => {
							let r = n.tones ?? {}, i = !!r[t], a = gi.filter((e) => !!r[e]).length;
							return /* @__PURE__ */ g("div", {
								className: "flex items-center justify-between gap-3 rounded-md border px-3 py-2",
								children: [/* @__PURE__ */ h(Q, {
									htmlFor: `tone-${t}`,
									className: "text-sm font-normal",
									children: e(`aiContent.tone.${t}`)
								}), /* @__PURE__ */ h(ui, {
									id: `tone-${t}`,
									checked: i,
									onCheckedChange: (e) => {
										let n = !!e;
										!n && a <= 1 || C("tones", {
											...r,
											[t]: n
										});
									}
								})]
							}, t);
						})
					})]
				})]
			}),
			/* @__PURE__ */ g(U, {
				id: "ai-sec-system",
				children: [/* @__PURE__ */ g(W, {
					className: "flex flex-row items-center justify-between space-y-0",
					children: [/* @__PURE__ */ h(G, { children: e("aiContent.settingsSystemPrompt") }), /* @__PURE__ */ h(H, {
						type: "button",
						size: "sm",
						variant: "outline",
						onClick: () => C("prompt_system", n.prompt_defaults?.prompt_system ?? ""),
						children: e("aiContent.resetPrompt")
					})]
				}), /* @__PURE__ */ h(K, { children: /* @__PURE__ */ g("details", {
					className: "rounded-lg border p-3",
					open: !0,
					children: [/* @__PURE__ */ h("summary", {
						className: "cursor-pointer text-sm font-medium",
						children: e("aiContent.entityPrompt")
					}), /* @__PURE__ */ h(Br, {
						className: "mt-3",
						rows: 10,
						value: n.prompt_system ?? "",
						onChange: (e) => C("prompt_system", e.target.value)
					})]
				}) })]
			}),
			x.map((t) => {
				let r = !!n[t.doKey], i = String(n[t.promptKey] ?? "");
				return /* @__PURE__ */ g(U, {
					id: `ai-sec-${t.id}`,
					children: [/* @__PURE__ */ g(W, {
						className: "flex flex-row items-center justify-between space-y-0",
						children: [/* @__PURE__ */ h(G, { children: e(t.titleKey) }), /* @__PURE__ */ g("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ h(Q, {
								htmlFor: `do-${t.id}`,
								className: "text-sm font-normal",
								children: e("aiContent.doEntity")
							}), /* @__PURE__ */ h(ui, {
								id: `do-${t.id}`,
								checked: r,
								onCheckedChange: (e) => C(t.doKey, !!e)
							})]
						})]
					}), /* @__PURE__ */ g(K, {
						className: "space-y-3",
						children: [/* @__PURE__ */ g("details", {
							className: "rounded-lg border p-3",
							children: [
								/* @__PURE__ */ h("summary", {
									className: "flex cursor-pointer items-center justify-between text-sm font-medium",
									children: /* @__PURE__ */ h("span", { children: e("aiContent.entityPrompt") })
								}),
								/* @__PURE__ */ h("div", {
									className: "mt-2 flex justify-end",
									children: /* @__PURE__ */ h(H, {
										type: "button",
										size: "sm",
										variant: "ghost",
										onClick: () => C(t.promptKey, n.prompt_defaults?.[String(t.promptKey)] ?? ""),
										children: e("aiContent.resetPrompt")
									})
								}),
								/* @__PURE__ */ h(Br, {
									rows: 4,
									disabled: !r,
									value: i,
									onChange: (e) => C(t.promptKey, e.target.value)
								})
							]
						}), /* @__PURE__ */ g("div", {
							className: "overflow-x-auto rounded-lg border",
							children: [/* @__PURE__ */ g("div", {
								className: "bg-muted/40 text-muted-foreground grid grid-cols-[auto_1fr_auto] gap-3 px-3 py-2 text-xs font-medium",
								children: [
									/* @__PURE__ */ h("span", { children: e("aiContent.doEntity") }),
									/* @__PURE__ */ h("span", { children: e("aiContent.settingsFields") }),
									/* @__PURE__ */ h("span", { children: e("aiContent.settingsLength") })
								]
							}), t.fields.map((i) => {
								let a = n.fields?.[t.id]?.[i] ?? {
									enabled: !0,
									length: 0,
									unit: "words"
								}, o = _i[i];
								return /* @__PURE__ */ g("div", {
									className: "grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t px-3 py-2",
									children: [
										/* @__PURE__ */ h(ui, {
											checked: !!a.enabled,
											disabled: !r,
											onCheckedChange: (e) => w(t.id, i, { enabled: !!e })
										}),
										/* @__PURE__ */ h("span", {
											className: "text-sm",
											children: e(`aiContent.field.${i}`)
										}),
										o ? /* @__PURE__ */ g("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ h(q, {
												className: "w-20",
												type: "number",
												min: 0,
												disabled: !r || !a.enabled,
												value: a.length,
												onChange: (e) => w(t.id, i, { length: Number(e.target.value) })
											}), /* @__PURE__ */ h("select", {
												className: "flex h-9 rounded-md border bg-background px-2 text-sm",
												disabled: !r || !a.enabled,
												value: a.unit,
												onChange: (e) => w(t.id, i, { unit: e.target.value }),
												children: o.map((t) => /* @__PURE__ */ h("option", {
													value: t,
													children: e(`aiContent.unit.${t}`)
												}, t))
											})]
										}) : /* @__PURE__ */ h("span", {})
									]
								}, i);
							})]
						})]
					})]
				}, t.id);
			}),
			/* @__PURE__ */ g(U, {
				id: "ai-sec-automation",
				children: [/* @__PURE__ */ h(W, { children: /* @__PURE__ */ h(G, { children: e("aiContent.settingsAutomation") }) }), /* @__PURE__ */ g(K, {
					className: "grid gap-3 md:grid-cols-2",
					children: [
						/* @__PURE__ */ g("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ h(Q, { children: e("aiContent.dailyBlogQuota") }), /* @__PURE__ */ h(q, {
								type: "number",
								value: n.daily_blog_quota ?? 1,
								onChange: (e) => C("daily_blog_quota", Number(e.target.value))
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ h(Q, { children: e("aiContent.dailyProductQuota") }), /* @__PURE__ */ h(q, {
								type: "number",
								value: n.daily_product_quota ?? 5,
								onChange: (e) => C("daily_product_quota", Number(e.target.value))
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ h(Q, { children: e("aiContent.publishStatus") }), /* @__PURE__ */ g("select", {
								className: "flex h-9 w-full rounded-md border bg-background px-3 text-sm",
								value: n.publish_status ?? "draft",
								onChange: (e) => C("publish_status", e.target.value),
								children: [
									/* @__PURE__ */ h("option", {
										value: "draft",
										children: "draft"
									}),
									/* @__PURE__ */ h("option", {
										value: "pending",
										children: "pending"
									}),
									/* @__PURE__ */ h("option", {
										value: "publish",
										children: "publish"
									})
								]
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "flex items-center gap-2 pt-6",
							children: [/* @__PURE__ */ h(Vn, {
								checked: !!n.auto_publish,
								onCheckedChange: (e) => C("auto_publish", !!e),
								id: "auto_publish"
							}), /* @__PURE__ */ h(Q, {
								htmlFor: "auto_publish",
								children: e("aiContent.autoPublish")
							})]
						}),
						/* @__PURE__ */ g("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ h(Vn, {
								checked: !!n.enabled,
								onCheckedChange: (e) => C("enabled", !!e),
								id: "enabled"
							}), /* @__PURE__ */ h(Q, {
								htmlFor: "enabled",
								children: e("aiContent.enabled")
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ h("div", {
				className: "bg-background/95 sticky bottom-0 z-20 -mx-1 flex justify-end border-t px-1 py-3 backdrop-blur",
				children: /* @__PURE__ */ h(H, {
					onClick: () => void _.mutateAsync(),
					disabled: _.isPending,
					children: e("common.save")
				})
			})
		]
	});
}
//#endregion
//#region ../Modules/ai-content-module/client/pages/AiTaxonomiesPage.tsx
function yi() {
	let { t: e, i18n: t } = l(), n = f(), [r, i] = c("blog"), a = d({
		queryKey: [
			"ai-content",
			"suggest",
			r
		],
		queryFn: () => Fr(r)
	});
	Z(a);
	let o = d({
		queryKey: ["ai-content", "cost-estimate"],
		queryFn: () => dr()
	});
	Z(o);
	let s = u({
		mutationFn: () => Pr(r),
		onSuccess: () => {
			p.success(e("aiContent.jobQueued")), setTimeout(() => void n.invalidateQueries({ queryKey: ["ai-content", "suggest"] }), 2500);
		},
		onError: (t) => X(e, t)
	}), m = u({
		mutationFn: () => Ir(r),
		onSuccess: (t) => p.success(e("aiContent.catsApplied", { count: t.count })),
		onError: (t) => X(e, t)
	}), _ = u({
		mutationFn: () => Lr("product_cat"),
		onSuccess: (t) => p.success(e("aiContent.batchQueued", { count: t.count })),
		onError: (t) => X(e, t)
	}), v = u({
		mutationFn: () => Lr("product_brand"),
		onSuccess: (t) => p.success(e("aiContent.batchQueued", { count: t.count })),
		onError: (t) => X(e, t)
	}), y = u({
		mutationFn: () => Lr("category"),
		onSuccess: (t) => p.success(e("aiContent.batchQueued", { count: t.count })),
		onError: (t) => X(e, t)
	}), b = a.data?.suggestions?.categories ?? [];
	return /* @__PURE__ */ g("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ g(U, { children: [/* @__PURE__ */ h(W, { children: /* @__PURE__ */ h(G, { children: e("aiContent.suggestCats") }) }), /* @__PURE__ */ g(K, {
			className: "space-y-3",
			children: [/* @__PURE__ */ g("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ g("select", {
						className: "flex h-9 rounded-md border bg-background px-3 text-sm",
						value: r,
						onChange: (e) => i(e.target.value),
						children: [/* @__PURE__ */ h("option", {
							value: "blog",
							children: e("aiContent.typeBlog")
						}), /* @__PURE__ */ h("option", {
							value: "product",
							children: e("aiContent.typeProduct")
						})]
					}),
					/* @__PURE__ */ h(H, {
						size: "sm",
						onClick: () => void s.mutateAsync(),
						disabled: s.isPending,
						children: e("aiContent.suggest")
					}),
					/* @__PURE__ */ h(H, {
						size: "sm",
						variant: "outline",
						onClick: () => void m.mutateAsync(),
						disabled: m.isPending || !b.length,
						children: e("aiContent.applySuggestions")
					}),
					/* @__PURE__ */ h(H, {
						size: "sm",
						variant: "ghost",
						onClick: () => void a.refetch(),
						children: e("common.refresh")
					})
				]
			}), /* @__PURE__ */ g("div", {
				className: "space-y-2",
				children: [b.map((e, t) => /* @__PURE__ */ g("div", {
					className: "rounded-md border p-2 text-sm",
					children: [
						/* @__PURE__ */ h("div", {
							className: "font-medium",
							children: e.name
						}),
						/* @__PURE__ */ h("div", {
							className: "text-muted-foreground",
							children: e.description
						}),
						e.children?.length ? /* @__PURE__ */ h("div", {
							className: "mt-1 text-xs",
							children: e.children.join(" · ")
						}) : null
					]
				}, `${e.name}-${t}`)), b.length ? null : /* @__PURE__ */ h("p", {
					className: "text-sm text-muted-foreground",
					children: e("aiContent.noSuggestions")
				})]
			})]
		})] }), /* @__PURE__ */ g(U, { children: [/* @__PURE__ */ h(W, { children: /* @__PURE__ */ h(G, { children: e("aiContent.fillTerms") }) }), /* @__PURE__ */ g(K, {
			className: "space-y-3",
			children: [/* @__PURE__ */ g("p", {
				className: "text-muted-foreground text-sm",
				children: [
					e("aiContent.costPerTerm"),
					" ",
					/* @__PURE__ */ h($, {
						amount: o.data?.entities.product_cat?.cost_toman.mid ?? 0,
						locale: t.language
					}),
					" · ",
					e("aiContent.settingsBrand"),
					" ",
					/* @__PURE__ */ h($, {
						amount: o.data?.entities.product_brand?.cost_toman.mid ?? 0,
						locale: t.language
					}),
					" · ",
					e("aiContent.settingsBlogCat"),
					" ",
					/* @__PURE__ */ h($, {
						amount: o.data?.entities.blog_cat?.cost_toman.mid ?? 0,
						locale: t.language
					})
				]
			}), /* @__PURE__ */ g("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ h(H, {
						size: "sm",
						onClick: () => void _.mutateAsync(),
						disabled: _.isPending,
						children: e("aiContent.fillProductCats")
					}),
					/* @__PURE__ */ h(H, {
						size: "sm",
						variant: "outline",
						onClick: () => void v.mutateAsync(),
						disabled: v.isPending,
						children: e("aiContent.fillBrands")
					}),
					/* @__PURE__ */ h(H, {
						size: "sm",
						variant: "outline",
						onClick: () => void y.mutateAsync(),
						disabled: y.isPending,
						children: e("aiContent.fillBlogCats")
					})
				]
			})]
		})] })]
	});
}
//#endregion
//#region ../Modules/ai-content-module/client/module-entry.tsx
var bi = {
	"ai-content": ci,
	"ai-content/jobs": oi,
	"ai-content/calendar": Vr,
	"ai-content/products": li,
	"ai-content/taxonomies": yi,
	"ai-content/attributes": Rr,
	"ai-content/settings": vi
}, xi = { routes: bi };
//#endregion
export { xi as default, bi as routes };
