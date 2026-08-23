import { useMutation as e, useQuery as t, useQueryClient as n } from "@tanstack/react-query";
import * as r from "react";
import { createContext as i, createElement as a, forwardRef as o, useContext as s, useEffect as c, useState as l } from "react";
import { Link as u } from "react-router-dom";
import { useTranslation as d } from "react-i18next";
import { toast as f } from "sonner";
import "react-dom";
import { Fragment as p, jsx as m, jsxs as h } from "react/jsx-runtime";
//#region node_modules/clsx/dist/clsx.mjs
function g(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") if (Array.isArray(e)) {
		var i = e.length;
		for (t = 0; t < i; t++) e[t] && (n = g(e[t])) && (r && (r += " "), r += n);
	} else for (n in e) e[n] && (r && (r += " "), r += n);
	return r;
}
function _() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = g(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/class-variance-authority/dist/index.mjs
var v = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, y = _, b = (e, t) => (n) => {
	if (t?.variants == null) return y(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = v(t) || v(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return y(e, a, t?.compoundVariants?.reduce((e, t) => {
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
function x(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function S(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = x(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : x(e[t], null);
			}
		};
	};
}
function C(...e) {
	return r.useCallback(S(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function w(e) {
	let t = /* @__PURE__ */ T(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(te);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ m(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ m(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function T(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = ne(n), a = E(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? S(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var ee = Symbol("radix.slottable");
function te(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === ee;
}
function E(e, t) {
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
var D = [
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
	let n = /* @__PURE__ */ w(`Primitive.${t}`), i = r.forwardRef((e, r) => {
		let { asChild: i, ...a } = e, o = i ? n : t;
		return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ m(o, {
			...a,
			ref: r
		});
	});
	return i.displayName = `Primitive.${t}`, {
		...e,
		[t]: i
	};
}, {});
//#endregion
//#region node_modules/@radix-ui/react-context/dist/index.mjs
function O(e, t = []) {
	let n = [];
	function i(t, i) {
		let a = r.createContext(i), o = n.length;
		n = [...n, i];
		let s = (t) => {
			let { scope: n, children: i, ...s } = t, c = n?.[e]?.[o] || a, l = r.useMemo(() => s, Object.values(s));
			return /* @__PURE__ */ m(c.Provider, {
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
	return a.scopeName = e, [i, k(a, ...t)];
}
function k(...e) {
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
typeof window < "u" && window.document && window.document.createElement;
function A(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var j = globalThis?.document ? r.useLayoutEffect : () => {}, re = r.useInsertionEffect || j;
function M({ prop: e, defaultProp: t, onChange: n = () => {}, caller: i }) {
	let [a, o, s] = ie({
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
			let n = ae(t) ? t(e) : t;
			n !== e && s.current?.(n);
		} else o(t);
	}, [
		c,
		e,
		o,
		s
	])];
}
function ie({ defaultProp: e, onChange: t }) {
	let [n, i] = r.useState(e), a = r.useRef(n), o = r.useRef(t);
	return re(() => {
		o.current = t;
	}, [t]), r.useEffect(() => {
		a.current !== n && (o.current?.(n), a.current = n);
	}, [n, a]), [
		n,
		i,
		o
	];
}
function ae(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/@radix-ui/react-presence/dist/index.mjs
function oe(e, t) {
	return r.useReducer((e, n) => t[e][n] ?? e, e);
}
var se = (e) => {
	let { present: t, children: n } = e, i = N(t), a = typeof n == "function" ? n({ present: i.isPresent }) : r.Children.only(n), o = C(i.ref, ce(a));
	return typeof n == "function" || i.isPresent ? r.cloneElement(a, { ref: o }) : null;
};
se.displayName = "Presence";
function N(e) {
	let [t, n] = r.useState(), i = r.useRef(null), a = r.useRef(e), o = r.useRef("none"), [s, c] = oe(e ? "mounted" : "unmounted", {
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
		let e = P(i.current);
		o.current = s === "mounted" ? e : "none";
	}, [s]), j(() => {
		let t = i.current, n = a.current;
		if (n !== e) {
			let r = o.current, i = P(t);
			e ? c("MOUNT") : i === "none" || t?.display === "none" ? c("UNMOUNT") : c(n && r !== i ? "ANIMATION_OUT" : "UNMOUNT"), a.current = e;
		}
	}, [e, c]), j(() => {
		if (t) {
			let e, n = t.ownerDocument.defaultView ?? window, r = (r) => {
				let o = P(i.current).includes(CSS.escape(r.animationName));
				if (r.target === t && o && (c("ANIMATION_END"), !a.current)) {
					let r = t.style.animationFillMode;
					t.style.animationFillMode = "forwards", e = n.setTimeout(() => {
						t.style.animationFillMode === "forwards" && (t.style.animationFillMode = r);
					});
				}
			}, s = (e) => {
				e.target === t && (o.current = P(i.current));
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
function P(e) {
	return e?.animationName || "none";
}
function ce(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function le(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function F(e) {
	let [t, n] = r.useState(void 0);
	return j(() => {
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
var I = "Checkbox", [L, ue] = O(I), [de, R] = L(I);
function fe(e) {
	let { __scopeCheckbox: t, checked: n, children: i, defaultChecked: a, disabled: o, form: s, name: c, onCheckedChange: l, required: u, value: d = "on", internal_do_not_use_render: f } = e, [p, h] = M({
		prop: n,
		defaultProp: a ?? !1,
		onChange: l,
		caller: I
	}), [g, _] = r.useState(null), [v, y] = r.useState(null), b = r.useRef(!1), x = g ? !!s || !!g.closest("form") : !0, S = {
		checked: p,
		disabled: o,
		setChecked: h,
		control: g,
		setControl: _,
		name: c,
		form: s,
		value: d,
		hasConsumerStoppedPropagationRef: b,
		required: u,
		defaultChecked: z(a) ? !1 : a,
		isFormControl: x,
		bubbleInput: v,
		setBubbleInput: y
	};
	return /* @__PURE__ */ m(de, {
		scope: t,
		...S,
		children: be(f) ? f(S) : i
	});
}
var pe = "CheckboxTrigger", me = r.forwardRef(({ __scopeCheckbox: e, onKeyDown: t, onClick: n, ...i }, a) => {
	let { control: o, value: s, disabled: c, checked: l, required: u, setControl: d, setChecked: f, hasConsumerStoppedPropagationRef: p, isFormControl: h, bubbleInput: g } = R(pe, e), _ = C(a, d), v = r.useRef(l);
	return r.useEffect(() => {
		let e = o?.form;
		if (e) {
			let t = () => f(v.current);
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [o, f]), /* @__PURE__ */ m(D.button, {
		type: "button",
		role: "checkbox",
		"aria-checked": z(l) ? "mixed" : l,
		"aria-required": u,
		"data-state": xe(l),
		"data-disabled": c ? "" : void 0,
		disabled: c,
		value: s,
		...i,
		ref: _,
		onKeyDown: A(t, (e) => {
			e.key === "Enter" && e.preventDefault();
		}),
		onClick: A(n, (e) => {
			f((e) => z(e) ? !0 : !e), g && h && (p.current = e.isPropagationStopped(), p.current || e.stopPropagation());
		})
	});
});
me.displayName = pe;
var he = r.forwardRef((e, t) => {
	let { __scopeCheckbox: n, name: r, checked: i, defaultChecked: a, required: o, disabled: s, value: c, onCheckedChange: l, form: u, ...d } = e;
	return /* @__PURE__ */ m(fe, {
		__scopeCheckbox: n,
		checked: i,
		defaultChecked: a,
		disabled: s,
		required: o,
		onCheckedChange: l,
		name: r,
		form: u,
		value: c,
		internal_do_not_use_render: ({ isFormControl: e }) => /* @__PURE__ */ h(p, { children: [/* @__PURE__ */ m(me, {
			...d,
			ref: t,
			__scopeCheckbox: n
		}), e && /* @__PURE__ */ m(ye, { __scopeCheckbox: n })] })
	});
});
he.displayName = I;
var ge = "CheckboxIndicator", _e = r.forwardRef((e, t) => {
	let { __scopeCheckbox: n, forceMount: r, ...i } = e, a = R(ge, n);
	return /* @__PURE__ */ m(se, {
		present: r || z(a.checked) || a.checked === !0,
		children: /* @__PURE__ */ m(D.span, {
			"data-state": xe(a.checked),
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
_e.displayName = ge;
var ve = "CheckboxBubbleInput", ye = r.forwardRef(({ __scopeCheckbox: e, ...t }, n) => {
	let { control: i, hasConsumerStoppedPropagationRef: a, checked: o, defaultChecked: s, required: c, disabled: l, name: u, value: d, form: f, bubbleInput: p, setBubbleInput: h } = R(ve, e), g = C(n, h), _ = le(o), v = F(i);
	r.useEffect(() => {
		let e = p;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, n = Object.getOwnPropertyDescriptor(t, "checked").set, r = !a.current;
		if (_ !== o && n) {
			let t = new Event("click", { bubbles: r });
			e.indeterminate = z(o), n.call(e, z(o) ? !1 : o), e.dispatchEvent(t);
		}
	}, [
		p,
		_,
		o,
		a
	]);
	let y = r.useRef(z(o) ? !1 : o);
	return /* @__PURE__ */ m(D.input, {
		type: "checkbox",
		"aria-hidden": !0,
		defaultChecked: s ?? y.current,
		required: c,
		disabled: l,
		name: u,
		value: d,
		form: f,
		...t,
		tabIndex: -1,
		ref: g,
		style: {
			...t.style,
			...v,
			position: "absolute",
			pointerEvents: "none",
			opacity: 0,
			margin: 0,
			transform: "translateX(-100%)"
		}
	});
});
ye.displayName = ve;
function be(e) {
	return typeof e == "function";
}
function z(e) {
	return e === "indeterminate";
}
function xe(e) {
	return z(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-label/dist/index.mjs
var Se = "Label", Ce = r.forwardRef((e, t) => /* @__PURE__ */ m(D.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
Ce.displayName = Se;
var we = Ce;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function Te(e) {
	let t = /* @__PURE__ */ De(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(ke);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ m(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ m(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
var Ee = /* @__PURE__ */ Te("Slot");
/* @__NO_SIDE_EFFECTS__ */
function De(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = je(n), a = Ae(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? S(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Oe = Symbol("radix.slottable");
function ke(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Oe;
}
function Ae(e, t) {
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
function je(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/tailwind-merge/dist/bundle-mjs.mjs
var Me = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, Ne = (e, t) => ({
	classGroupId: e,
	validator: t
}), Pe = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), Fe = "-", Ie = [], Le = "arbitrary..", Re = (e) => {
	let t = Ve(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return Be(e);
			let n = e.split(Fe);
			return ze(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? Me(i, t) : t : i || Ie;
			}
			return n[e] || Ie;
		}
	};
}, ze = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = ze(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(Fe) : e.slice(t).join(Fe), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, Be = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? Le + r : void 0;
})(), Ve = (e) => {
	let { theme: t, classGroups: n } = e;
	return He(n, t);
}, He = (e, t) => {
	let n = Pe();
	for (let r in e) {
		let i = e[r];
		Ue(i, n, r, t);
	}
	return n;
}, Ue = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		We(i, t, n, r);
	}
}, We = (e, t, n, r) => {
	if (typeof e == "string") {
		Ge(e, t, n);
		return;
	}
	if (typeof e == "function") {
		Ke(e, t, n, r);
		return;
	}
	qe(e, t, n, r);
}, Ge = (e, t, n) => {
	let r = e === "" ? t : Je(t, e);
	r.classGroupId = n;
}, Ke = (e, t, n, r) => {
	if (Ye(e)) {
		Ue(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(Ne(n, e));
}, qe = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		Ue(o, Je(t, a), n, r);
	}
}, Je = (e, t) => {
	let n = e, r = t.split(Fe), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = Pe(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, Ye = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Xe = (e) => {
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
}, Ze = "!", Qe = ":", $e = [], et = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), tt = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === Qe) {
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
		s.endsWith(Ze) ? (c = s.slice(0, -1), l = !0) : s.startsWith(Ze) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return et(t, l, c, u);
	};
	if (t) {
		let e = t + Qe, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : et($e, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, nt = (e) => {
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
}, rt = (e) => ({
	cache: Xe(e.cacheSize),
	parseClassName: tt(e),
	sortModifiers: nt(e),
	...Re(e)
}), it = /\s+/, at = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(it), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + Ze : g, v = _ + h;
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
}, ot = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = st(n)) && (i && (i += " "), i += r);
	return i;
}, st = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = st(e[r])) && (n && (n += " "), n += t);
	return n;
}, ct = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = rt(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = at(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(ot(...e));
}, lt = [], B = (e) => {
	let t = (t) => t[e] || lt;
	return t.isThemeGetter = !0, t;
}, ut = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, dt = /^\((?:(\w[\w-]*):)?(.+)\)$/i, ft = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, pt = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, mt = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, ht = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, gt = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, _t = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, V = (e) => ft.test(e), H = (e) => !!e && !Number.isNaN(Number(e)), U = (e) => !!e && Number.isInteger(Number(e)), vt = (e) => e.endsWith("%") && H(e.slice(0, -1)), W = (e) => pt.test(e), yt = () => !0, bt = (e) => mt.test(e) && !ht.test(e), xt = () => !1, St = (e) => gt.test(e), Ct = (e) => _t.test(e), wt = (e) => !G(e) && !q(e), Tt = (e) => J(e, Vt, xt), G = (e) => ut.test(e), K = (e) => J(e, Ht, bt), Et = (e) => J(e, Ut, H), Dt = (e) => J(e, Gt, yt), Ot = (e) => J(e, Wt, xt), kt = (e) => J(e, zt, xt), At = (e) => J(e, Bt, Ct), jt = (e) => J(e, Kt, St), q = (e) => dt.test(e), Mt = (e) => Y(e, Ht), Nt = (e) => Y(e, Wt), Pt = (e) => Y(e, zt), Ft = (e) => Y(e, Vt), It = (e) => Y(e, Bt), Lt = (e) => Y(e, Kt, !0), Rt = (e) => Y(e, Gt, !0), J = (e, t, n) => {
	let r = ut.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, Y = (e, t, n = !1) => {
	let r = dt.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, zt = (e) => e === "position" || e === "percentage", Bt = (e) => e === "image" || e === "url", Vt = (e) => e === "length" || e === "size" || e === "bg-size", Ht = (e) => e === "length", Ut = (e) => e === "number", Wt = (e) => e === "family-name", Gt = (e) => e === "number" || e === "weight", Kt = (e) => e === "shadow", qt = /* @__PURE__ */ ct(() => {
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
		q,
		G
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
		q,
		G,
		c
	], T = () => [
		V,
		"full",
		"auto",
		...w()
	], ee = () => [
		U,
		"none",
		"subgrid",
		q,
		G
	], te = () => [
		"auto",
		{ span: [
			"full",
			U,
			q,
			G
		] },
		U,
		q,
		G
	], E = () => [
		U,
		"auto",
		q,
		G
	], ne = () => [
		"auto",
		"min",
		"max",
		"fr",
		q,
		G
	], D = () => [
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
	], O = () => [
		"start",
		"end",
		"center",
		"stretch",
		"center-safe",
		"end-safe"
	], k = () => ["auto", ...w()], A = () => [
		V,
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
	], j = () => [
		V,
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
		V,
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
		q,
		G
	], ie = () => [
		...b(),
		Pt,
		kt,
		{ position: [q, G] }
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
		Ft,
		Tt,
		{ size: [q, G] }
	], se = () => [
		vt,
		Mt,
		K
	], N = () => [
		"",
		"none",
		"full",
		l,
		q,
		G
	], P = () => [
		"",
		H,
		Mt,
		K
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
		H,
		vt,
		Pt,
		kt
	], I = () => [
		"",
		"none",
		m,
		q,
		G
	], L = () => [
		"none",
		H,
		q,
		G
	], ue = () => [
		"none",
		H,
		q,
		G
	], de = () => [
		H,
		q,
		G
	], R = () => [
		V,
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
			blur: [W],
			breakpoint: [W],
			color: [yt],
			container: [W],
			"drop-shadow": [W],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [wt],
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
			"inset-shadow": [W],
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
			radius: [W],
			shadow: [W],
			spacing: ["px", H],
			text: [W],
			"text-shadow": [W],
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
				V,
				G,
				q,
				g
			] }],
			container: ["container"],
			columns: [{ columns: [
				H,
				G,
				q,
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
				U,
				"auto",
				q,
				G
			] }],
			basis: [{ basis: [
				V,
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
				V,
				"auto",
				"initial",
				"none",
				G
			] }],
			grow: [{ grow: [
				"",
				H,
				q,
				G
			] }],
			shrink: [{ shrink: [
				"",
				H,
				q,
				G
			] }],
			order: [{ order: [
				U,
				"first",
				"last",
				"none",
				q,
				G
			] }],
			"grid-cols": [{ "grid-cols": ee() }],
			"col-start-end": [{ col: te() }],
			"col-start": [{ "col-start": E() }],
			"col-end": [{ "col-end": E() }],
			"grid-rows": [{ "grid-rows": ee() }],
			"row-start-end": [{ row: te() }],
			"row-start": [{ "row-start": E() }],
			"row-end": [{ "row-end": E() }],
			"grid-flow": [{ "grid-flow": [
				"row",
				"col",
				"dense",
				"row-dense",
				"col-dense"
			] }],
			"auto-cols": [{ "auto-cols": ne() }],
			"auto-rows": [{ "auto-rows": ne() }],
			gap: [{ gap: w() }],
			"gap-x": [{ "gap-x": w() }],
			"gap-y": [{ "gap-y": w() }],
			"justify-content": [{ justify: [...D(), "normal"] }],
			"justify-items": [{ "justify-items": [...O(), "normal"] }],
			"justify-self": [{ "justify-self": ["auto", ...O()] }],
			"align-content": [{ content: ["normal", ...D()] }],
			"align-items": [{ items: [...O(), { baseline: ["", "last"] }] }],
			"align-self": [{ self: [
				"auto",
				...O(),
				{ baseline: ["", "last"] }
			] }],
			"place-content": [{ "place-content": D() }],
			"place-items": [{ "place-items": [...O(), "baseline"] }],
			"place-self": [{ "place-self": ["auto", ...O()] }],
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
			m: [{ m: k() }],
			mx: [{ mx: k() }],
			my: [{ my: k() }],
			ms: [{ ms: k() }],
			me: [{ me: k() }],
			mbs: [{ mbs: k() }],
			mbe: [{ mbe: k() }],
			mt: [{ mt: k() }],
			mr: [{ mr: k() }],
			mb: [{ mb: k() }],
			ml: [{ ml: k() }],
			"space-x": [{ "space-x": w() }],
			"space-x-reverse": ["space-x-reverse"],
			"space-y": [{ "space-y": w() }],
			"space-y-reverse": ["space-y-reverse"],
			size: [{ size: A() }],
			"inline-size": [{ inline: ["auto", ...j()] }],
			"min-inline-size": [{ "min-inline": ["auto", ...j()] }],
			"max-inline-size": [{ "max-inline": ["none", ...j()] }],
			"block-size": [{ block: ["auto", ...re()] }],
			"min-block-size": [{ "min-block": ["auto", ...re()] }],
			"max-block-size": [{ "max-block": ["none", ...re()] }],
			w: [{ w: [
				s,
				"screen",
				...A()
			] }],
			"min-w": [{ "min-w": [
				s,
				"screen",
				"none",
				...A()
			] }],
			"max-w": [{ "max-w": [
				s,
				"screen",
				"none",
				"prose",
				{ screen: [o] },
				...A()
			] }],
			h: [{ h: [
				"screen",
				"lh",
				...A()
			] }],
			"min-h": [{ "min-h": [
				"screen",
				"lh",
				"none",
				...A()
			] }],
			"max-h": [{ "max-h": [
				"screen",
				"lh",
				...A()
			] }],
			"font-size": [{ text: [
				"base",
				n,
				Mt,
				K
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				Rt,
				Dt
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
				vt,
				G
			] }],
			"font-family": [{ font: [
				Nt,
				Ot,
				t
			] }],
			"font-features": [{ "font-features": [G] }],
			"fvn-normal": ["normal-nums"],
			"fvn-ordinal": ["ordinal"],
			"fvn-slashed-zero": ["slashed-zero"],
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			tracking: [{ tracking: [
				i,
				q,
				G
			] }],
			"line-clamp": [{ "line-clamp": [
				H,
				"none",
				q,
				Et
			] }],
			leading: [{ leading: [a, ...w()] }],
			"list-image": [{ "list-image": [
				"none",
				q,
				G
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				q,
				G
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
				H,
				"from-font",
				"auto",
				q,
				K
			] }],
			"text-decoration-color": [{ decoration: M() }],
			"underline-offset": [{ "underline-offset": [
				H,
				"auto",
				q,
				G
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
				q,
				G
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
				q,
				G
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
						U,
						q,
						G
					],
					radial: [
						"",
						q,
						G
					],
					conic: [
						U,
						q,
						G
					]
				},
				It,
				At
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
				H,
				q,
				G
			] }],
			"outline-w": [{ outline: [
				"",
				H,
				Mt,
				K
			] }],
			"outline-color": [{ outline: M() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				Lt,
				jt
			] }],
			"shadow-color": [{ shadow: M() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				Lt,
				jt
			] }],
			"inset-shadow-color": [{ "inset-shadow": M() }],
			"ring-w": [{ ring: P() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: M() }],
			"ring-offset-w": [{ "ring-offset": [H, K] }],
			"ring-offset-color": [{ "ring-offset": M() }],
			"inset-ring-w": [{ "inset-ring": P() }],
			"inset-ring-color": [{ "inset-ring": M() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				Lt,
				jt
			] }],
			"text-shadow-color": [{ "text-shadow": M() }],
			opacity: [{ opacity: [
				H,
				q,
				G
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
			"mask-image-linear-pos": [{ "mask-linear": [H] }],
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
			"mask-image-radial": [{ "mask-radial": [q, G] }],
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
			"mask-image-conic-pos": [{ "mask-conic": [H] }],
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
				q,
				G
			] }],
			filter: [{ filter: [
				"",
				"none",
				q,
				G
			] }],
			blur: [{ blur: I() }],
			brightness: [{ brightness: [
				H,
				q,
				G
			] }],
			contrast: [{ contrast: [
				H,
				q,
				G
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				Lt,
				jt
			] }],
			"drop-shadow-color": [{ "drop-shadow": M() }],
			grayscale: [{ grayscale: [
				"",
				H,
				q,
				G
			] }],
			"hue-rotate": [{ "hue-rotate": [
				H,
				q,
				G
			] }],
			invert: [{ invert: [
				"",
				H,
				q,
				G
			] }],
			saturate: [{ saturate: [
				H,
				q,
				G
			] }],
			sepia: [{ sepia: [
				"",
				H,
				q,
				G
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				q,
				G
			] }],
			"backdrop-blur": [{ "backdrop-blur": I() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				H,
				q,
				G
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				H,
				q,
				G
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				H,
				q,
				G
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				H,
				q,
				G
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				H,
				q,
				G
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				H,
				q,
				G
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				H,
				q,
				G
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				H,
				q,
				G
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
				q,
				G
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				H,
				"initial",
				q,
				G
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				q,
				G
			] }],
			delay: [{ delay: [
				H,
				q,
				G
			] }],
			animate: [{ animate: [
				"none",
				v,
				q,
				G
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				q,
				G
			] }],
			"perspective-origin": [{ "perspective-origin": x() }],
			rotate: [{ rotate: L() }],
			"rotate-x": [{ "rotate-x": L() }],
			"rotate-y": [{ "rotate-y": L() }],
			"rotate-z": [{ "rotate-z": L() }],
			scale: [{ scale: ue() }],
			"scale-x": [{ "scale-x": ue() }],
			"scale-y": [{ "scale-y": ue() }],
			"scale-z": [{ "scale-z": ue() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: de() }],
			"skew-x": [{ "skew-x": de() }],
			"skew-y": [{ "skew-y": de() }],
			transform: [{ transform: [
				q,
				G,
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
				q,
				G
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
				q,
				G
			] }],
			fill: [{ fill: ["none", ...M()] }],
			"stroke-w": [{ stroke: [
				H,
				Mt,
				K,
				Et
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
function X(...e) {
	return qt(_(e));
}
//#endregion
//#region src/components/ui/badge.tsx
var Jt = b("inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3", {
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
function Yt({ className: e, variant: t = "default", asChild: n = !1, ...r }) {
	return /* @__PURE__ */ m(n ? Ee : "span", {
		"data-slot": "badge",
		"data-variant": t,
		className: X(Jt({ variant: t }), e),
		...r
	});
}
//#endregion
//#region src/components/data/DumpUi.tsx
var Xt = {
	default: "",
	success: "border-transparent bg-emerald-600 text-white dark:bg-emerald-500",
	warning: "border-transparent bg-amber-500 text-white",
	destructive: "",
	secondary: ""
};
function Zt(e) {
	let t = String(e ?? "").toLowerCase();
	return t === "done" || t === "completed" || t === "success" || t === "ok" ? "success" : t === "failed" || t === "error" || t === "cancelled" || t === "canceled" ? "destructive" : t === "running" || t === "processing" ? "warning" : t === "pending" || t === "queued" ? "secondary" : "default";
}
function Qt({ status: e, tone: t, className: n }) {
	let r = t ?? Zt(e), i = e == null || e === "" ? "—" : String(e);
	return /* @__PURE__ */ m(Yt, {
		variant: r === "destructive" ? "destructive" : r === "secondary" ? "secondary" : "outline",
		className: X(Xt[r], n),
		children: i
	});
}
function $t({ rows: e, emptyLabel: t = "—", className: n }) {
	return e.length ? /* @__PURE__ */ m("dl", {
		className: X("divide-border divide-y text-sm", n),
		children: e.map((e, n) => /* @__PURE__ */ h("div", {
			className: "flex flex-wrap items-start justify-between gap-2 py-2",
			children: [/* @__PURE__ */ m("dt", {
				className: "text-muted-foreground",
				children: e.label
			}), /* @__PURE__ */ m("dd", {
				className: "max-w-full break-words text-end font-medium",
				children: e.value ?? t
			})]
		}, n))
	}) : /* @__PURE__ */ m("p", {
		className: "text-muted-foreground text-sm",
		children: t
	});
}
function en({ jobs: e, emptyLabel: t, typeLabel: n = "Type", statusLabel: r = "Status", errorLabel: i = "Error" }) {
	return e.length ? /* @__PURE__ */ m("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ h("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ m("thead", { children: /* @__PURE__ */ h("tr", {
				className: "border-b text-start",
				children: [
					/* @__PURE__ */ m("th", {
						className: "py-2 pe-2",
						children: "ID"
					}),
					/* @__PURE__ */ m("th", {
						className: "py-2 pe-2",
						children: n
					}),
					/* @__PURE__ */ m("th", {
						className: "py-2 pe-2",
						children: r
					}),
					/* @__PURE__ */ m("th", {
						className: "py-2",
						children: i
					})
				]
			}) }), /* @__PURE__ */ m("tbody", { children: e.map((e) => /* @__PURE__ */ h("tr", {
				className: "border-b align-top",
				children: [
					/* @__PURE__ */ m("td", {
						className: "py-2 pe-2 font-mono text-xs",
						children: e.id ?? "—"
					}),
					/* @__PURE__ */ m("td", {
						className: "py-2 pe-2 font-mono text-xs",
						children: String(e.type ?? e.job_type ?? "—")
					}),
					/* @__PURE__ */ m("td", {
						className: "py-2 pe-2",
						children: /* @__PURE__ */ m(Qt, { status: e.status })
					}),
					/* @__PURE__ */ m("td", {
						className: "text-muted-foreground py-2 text-xs",
						children: String(e.error_message ?? e.error ?? "—")
					})
				]
			}, String(e.id ?? `${e.type}-${e.created_at}`))) })]
		})
	}) : /* @__PURE__ */ m("p", {
		className: "text-muted-foreground text-sm",
		children: t
	});
}
//#endregion
//#region src/components/PageShell.tsx
function tn({ title: e, description: t, eyebrow: n, children: r }) {
	return /* @__PURE__ */ h("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ h("header", {
			className: "min-w-0 space-y-1.5",
			children: [
				n ? /* @__PURE__ */ m("p", {
					className: "text-muted-foreground text-xs font-medium tracking-wide uppercase",
					children: n
				}) : null,
				/* @__PURE__ */ m("h1", {
					className: "text-xl font-semibold tracking-tight sm:text-2xl",
					children: e
				}),
				t ? /* @__PURE__ */ m("p", {
					className: "text-muted-foreground max-w-2xl text-sm leading-relaxed",
					children: t
				}) : null
			]
		}), r]
	});
}
//#endregion
//#region src/components/ui/button.tsx
var nn = b("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
function rn({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ m(r ? Ee : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: X(nn({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var an = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), on = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), sn = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), cn = (e) => {
	let t = sn(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, ln = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, un = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, dn = i({}), fn = () => s(dn), pn = o(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: o, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = fn() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return a("svg", {
		ref: l,
		...ln,
		width: t ?? u ?? ln.width,
		height: t ?? u ?? ln.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: an("lucide", m, i),
		...!o && !un(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => a(e, t)), ...Array.isArray(o) ? o : [o]]);
}), mn = ((e, t) => {
	let n = o(({ className: n, ...r }, i) => a(pn, {
		ref: i,
		iconNode: t,
		className: an(`lucide-${on(cn(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = cn(e), n;
})("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]);
//#endregion
//#region src/components/ui/checkbox.tsx
function hn({ className: e, ...t }) {
	return /* @__PURE__ */ m(he, {
		"data-slot": "checkbox",
		className: X("peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary", e),
		...t,
		children: /* @__PURE__ */ m(_e, {
			"data-slot": "checkbox-indicator",
			className: "grid place-content-center text-current transition-none",
			children: /* @__PURE__ */ m(mn, { className: "size-3.5" })
		})
	});
}
//#endregion
//#region src/components/ui/input.tsx
function gn({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ m("input", {
		type: t,
		"data-slot": "input",
		className: X("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function Z({ className: e, ...t }) {
	return /* @__PURE__ */ m(we, {
		"data-slot": "label",
		className: X("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/lib/marketplace-api.ts
function _n(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function vn(e) {
	"@babel/helpers - typeof";
	return vn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, vn(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function yn(e, t) {
	if (vn(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (vn(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function bn(e) {
	var t = yn(e, "string");
	return vn(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function xn(e, t, n) {
	return (t = bn(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/lib/apiError.ts
var Q = class extends Error {
	constructor(e, t) {
		super(e), xn(this, "code", void 0), xn(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, Sn = {
	invalid: "errors.api.invalid",
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
function Cn(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function wn(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function Tn(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(_n(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function En(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return Tn(e, n);
	if (t instanceof Q && t.code) {
		let n = Sn[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = Sn[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return Cn(n) ? e("errors.api.timeout") : wn(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function Dn(e, t) {
	f.error(En(e, t));
}
//#endregion
//#region src/lib/safeUrl.ts
function On(e) {
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
function kn() {
	return window.webinoDashboard;
}
var An = 3e4;
function jn(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function Mn(e) {
	let t = kn();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (jn(e) || On(e)) return e;
	throw new Q("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function Nn(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function Pn(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : null;
}
function Fn(e, t) {
	let n = e.toLowerCase();
	return e.includes("Upstream Error") || e.includes("Forbidden") || t === 403 ? "admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry" : n.includes("timed out") || n.includes("timeout") || t === 504 || t === 524 ? "Request timed out — RSA-4096 generation can take over a minute on weak hosts" : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? `Invalid AJAX response (HTML, HTTP ${t || 0})` : `Invalid AJAX response (HTTP ${t || 0})`;
}
async function In(e, t, n = {}) {
	let r = Pn(e), i = kn();
	if (!r || !i.ajaxUrl) throw new Q("AJAX fallback unavailable", {
		code: "no_ajax_fallback",
		status: 0
	});
	let a = new URLSearchParams();
	a.set("action", r), i.nonce && a.set("nonce", i.nonce), a.set("rest_path", e.replace(/^\//, "").split("?")[0]);
	let o = (n.method || "GET").toUpperCase();
	if (o !== "GET" && o !== "HEAD" && n.body != null) {
		let e = typeof n.body == "string" ? n.body : "";
		e && a.set("payload", e);
	}
	let { signal: s, clear: c } = Nn({}, t);
	try {
		let e = await fetch(i.ajaxUrl, {
			method: "POST",
			credentials: "same-origin",
			headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
			body: a,
			signal: s
		}), t = await e.text(), n;
		try {
			n = JSON.parse(t);
		} catch {
			throw new Q(Fn(t, e.status), {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!n.success) throw new Q(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
			code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
			status: e.status
		});
		return n.data;
	} finally {
		c();
	}
}
async function $(e, t = {}, n = An) {
	if (Pn(e) && kn().ajaxUrl) return In(e, n, t);
	let r = Mn(e), i = kn(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce);
	let { signal: s, clear: c } = Nn(t, n);
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
			throw new Q(n.includes("Upstream Error") || n.includes("Forbidden") ? "REST blocked by CDN/WAF — use admin-ajax fallback or whitelist /wp-json/" : "Invalid JSON response", {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i;
			throw new Q(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
		}
		return i;
	} catch (e) {
		throw e instanceof Q ? e : e instanceof DOMException && e.name === "AbortError" ? new Q("Request timed out", {
			code: "timeout",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region src/components/wnc/WncPlatformPanel.tsx
var Ln = new Set([
	"order_status_enabled",
	"orders_list_api_enabled",
	"product_page_webhook_enabled"
]);
function Rn(e, t) {
	let n = `wnc.cred.${t}`, r = e(n);
	return r === n ? t : r;
}
function zn(e) {
	return e === !0 || e === 1 || e === "1" || e === "true";
}
function Bn({ platform: r, titleKey: i, subtitleKey: a, feedPlatform: o = !1, embedded: s = !1 }) {
	let { t: g } = d(), _ = n(), [v, y] = l({}), b = t({
		queryKey: [
			"wnc",
			r,
			"settings"
		],
		queryFn: () => $(`wnc/${r}/settings`)
	}), x = t({
		queryKey: [
			"wnc",
			r,
			"maps"
		],
		queryFn: () => $(`wnc/${r}/maps`),
		enabled: !o
	}), S = t({
		queryKey: [
			"wnc",
			r,
			"jobs"
		],
		queryFn: () => $(`wnc/${r}/jobs`),
		enabled: !o
	}), C = t({
		queryKey: [
			"wnc",
			r,
			"feed"
		],
		queryFn: () => $(`wnc/${r}/feed-url`),
		enabled: o
	}), w = t({
		queryKey: [
			"wnc",
			"torob",
			"preview"
		],
		queryFn: () => $("wnc/torob/preview"),
		enabled: o && r === "torob" && !!v.enabled
	}), T = t({
		queryKey: [
			"wnc",
			"torob",
			"queue"
		],
		queryFn: () => $("wnc/torob/queue"),
		enabled: o && r === "torob",
		refetchInterval: 15e3
	});
	c(() => {
		b.data?.settings && y(JSON.parse(JSON.stringify(b.data.settings)));
	}, [b.data]);
	let ee = e({
		mutationFn: async () => {
			await $(`wnc/${r}/settings`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ settings: v })
			});
		},
		onSuccess: async () => {
			f.success(g("common.saved")), await _.invalidateQueries({ queryKey: ["wnc", r] }), await _.invalidateQueries({ queryKey: ["wnc", "torob"] });
		},
		onError: (e) => Dn(g, e)
	}), te = e({
		mutationFn: () => $(`wnc/${r}/test-connection`, {
			method: "POST",
			body: "{}"
		}),
		onSuccess: () => f.success(g("wnc.testOk")),
		onError: (e) => Dn(g, e)
	}), E = e({
		mutationFn: () => $(`wnc/${r}/pull-orders`, {
			method: "POST",
			body: "{}"
		}),
		onSuccess: () => f.success(g("wnc.pullQueued")),
		onError: (e) => Dn(g, e)
	}), ne = e({
		mutationFn: () => $(`wnc/${r}/sync-now`, {
			method: "POST",
			body: "{}"
		}),
		onSuccess: () => f.success(g("wnc.syncQueued")),
		onError: (e) => Dn(g, e)
	}), D = v.credentials ?? {}, O = (e, t) => {
		y((n) => ({
			...n,
			credentials: {
				...n.credentials ?? {},
				[e]: t
			}
		}));
	}, k = /* @__PURE__ */ h("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ h("section", {
				className: "wd-card-hero space-y-3 rounded-2xl border border-border/60 p-4 sm:p-5",
				children: [
					/* @__PURE__ */ h("div", {
						className: "flex flex-wrap items-center gap-3 text-sm",
						children: [/* @__PURE__ */ h("span", {
							className: b.data?.live ? "inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
							children: [
								g("wnc.live"),
								": ",
								b.data?.live ? g("common.yes") : g("common.no")
							]
						}), b.data?.pricing_tab ? /* @__PURE__ */ m(u, {
							className: "text-primary text-sm font-medium underline-offset-4 hover:underline",
							to: b.data.pricing_tab,
							children: g("wnc.openPricingTab")
						}) : null]
					}),
					/* @__PURE__ */ h("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ m(hn, {
							id: `wnc-${r}-en`,
							checked: !!v.enabled,
							onCheckedChange: (e) => y((t) => ({
								...t,
								enabled: e === !0
							}))
						}), /* @__PURE__ */ m(Z, {
							htmlFor: `wnc-${r}-en`,
							children: g("wnc.enabled")
						})]
					}),
					o && !v.enabled ? /* @__PURE__ */ m("p", {
						className: "text-amber-700 dark:text-amber-400 text-xs",
						children: g("wnc.feedDisabledHint")
					}) : null,
					o ? null : /* @__PURE__ */ h("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ m(hn, {
							id: `wnc-${r}-auto`,
							checked: !!v.auto_sync,
							onCheckedChange: (e) => y((t) => ({
								...t,
								auto_sync: e === !0
							}))
						}), /* @__PURE__ */ m(Z, {
							htmlFor: `wnc-${r}-auto`,
							children: g("wnc.autoSync")
						})]
					}),
					/* @__PURE__ */ h("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							Object.keys(D).length === 0 ? /* @__PURE__ */ m("p", {
								className: "text-muted-foreground text-sm sm:col-span-2",
								children: g("wnc.noCredentialsYet")
							}) : null,
							Object.entries(D).map(([e, t]) => Ln.has(e) ? /* @__PURE__ */ h("div", {
								className: "flex items-center gap-2 sm:col-span-2",
								children: [/* @__PURE__ */ m(hn, {
									id: `wnc-${r}-cred-${e}`,
									checked: zn(t),
									onCheckedChange: (t) => O(e, t === !0)
								}), /* @__PURE__ */ m(Z, {
									htmlFor: `wnc-${r}-cred-${e}`,
									children: Rn(g, e)
								})]
							}, e) : /* @__PURE__ */ h("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ m(Z, {
									className: "text-xs",
									children: Rn(g, e)
								}), /* @__PURE__ */ m(gn, {
									className: "w-full",
									value: String(t ?? ""),
									onChange: (t) => O(e, t.target.value)
								})]
							}, e)),
							Object.keys(D).length === 0 && !o ? /* @__PURE__ */ h(p, { children: [/* @__PURE__ */ h("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ m(Z, {
									className: "text-xs",
									children: g("wnc.cred.base_url")
								}), /* @__PURE__ */ m(gn, {
									className: "w-full",
									value: "",
									onChange: (e) => O("base_url", e.target.value)
								})]
							}), /* @__PURE__ */ h("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ m(Z, {
									className: "text-xs",
									children: g("wnc.cred.token")
								}), /* @__PURE__ */ m(gn, {
									className: "w-full",
									value: "",
									onChange: (e) => O("token", e.target.value)
								})]
							})] }) : null
						]
					}),
					/* @__PURE__ */ h("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ m(rn, {
								type: "button",
								onClick: () => void ee.mutateAsync(),
								disabled: ee.isPending,
								children: g("common.save")
							}),
							/* @__PURE__ */ m(rn, {
								type: "button",
								variant: "secondary",
								onClick: () => void te.mutateAsync(),
								disabled: te.isPending,
								children: g("wnc.testConnection")
							}),
							o ? null : /* @__PURE__ */ h(p, { children: [/* @__PURE__ */ m(rn, {
								type: "button",
								variant: "secondary",
								onClick: () => void ne.mutateAsync(),
								disabled: ne.isPending,
								children: g("wnc.syncNow")
							}), /* @__PURE__ */ m(rn, {
								type: "button",
								variant: "secondary",
								onClick: () => void E.mutateAsync(),
								disabled: E.isPending,
								children: g("wnc.pullOrders")
							})] })
						]
					})
				]
			}),
			o && C.data?.url ? /* @__PURE__ */ h("section", {
				className: "wd-card-glass space-y-2 rounded-2xl border border-border/60 p-4",
				children: [
					/* @__PURE__ */ m("h3", {
						className: "text-sm font-medium",
						children: g("wnc.feedUrl")
					}),
					/* @__PURE__ */ m("code", {
						className: "bg-muted block break-all rounded-xl p-2 text-xs",
						children: C.data.url
					}),
					C.data.order_status_url ? /* @__PURE__ */ h(p, { children: [/* @__PURE__ */ m("h3", {
						className: "pt-2 text-sm font-medium",
						children: g("wnc.torobOrderStatusUrl")
					}), /* @__PURE__ */ m("code", {
						className: "bg-muted block break-all rounded-xl p-2 text-xs",
						children: C.data.order_status_url
					})] }) : null,
					C.data.orders_list_url ? /* @__PURE__ */ h(p, { children: [/* @__PURE__ */ m("h3", {
						className: "pt-2 text-sm font-medium",
						children: g("wnc.torobOrdersListUrl")
					}), /* @__PURE__ */ m("code", {
						className: "bg-muted block break-all rounded-xl p-2 text-xs",
						children: C.data.orders_list_url
					})] }) : null,
					C.data.note ? /* @__PURE__ */ m("p", {
						className: "text-muted-foreground text-xs",
						children: C.data.note
					}) : null
				]
			}) : null,
			o && r === "torob" ? /* @__PURE__ */ h(p, { children: [/* @__PURE__ */ h("section", {
				className: "wd-card-glass space-y-2 rounded-2xl border border-border/60 p-4",
				children: [/* @__PURE__ */ m("h3", {
					className: "text-sm font-medium",
					children: g("wnc.torobPreview")
				}), (w.data?.products ?? []).length === 0 ? /* @__PURE__ */ m("p", {
					className: "text-muted-foreground text-sm",
					children: g("common.empty")
				}) : /* @__PURE__ */ m("ul", {
					className: "max-h-60 space-y-2 overflow-auto",
					children: (w.data?.products).map((e, t) => /* @__PURE__ */ m("li", {
						className: "bg-muted/40 rounded-lg border p-2 text-xs",
						children: /* @__PURE__ */ m($t, { rows: Object.entries(e).slice(0, 8).map(([e, t]) => ({
							label: e,
							value: String(t ?? "—")
						})) })
					}, String(e.product_id ?? e.id ?? t)))
				})]
			}), /* @__PURE__ */ h("section", {
				className: "wd-card-glass space-y-2 rounded-2xl border border-border/60 p-4",
				children: [
					/* @__PURE__ */ m("h3", {
						className: "text-sm font-medium",
						children: g("wnc.torobQueue")
					}),
					/* @__PURE__ */ h("p", {
						className: "text-muted-foreground text-xs",
						children: [
							g("wnc.torobQueuePending"),
							": ",
							T.data?.pending ?? 0,
							T.data?.last_run ? ` · ${g("wnc.torobQueueLast")}: ${T.data.last_run}` : "",
							T.data?.next_hint ? ` · ${g("wnc.torobQueueNext")}: ${T.data.next_hint}` : ""
						]
					}),
					/* @__PURE__ */ m(en, {
						jobs: T.data?.items ?? [],
						emptyLabel: g("common.empty"),
						typeLabel: g("wnc.jobs"),
						statusLabel: g("digikala.endpointStatus", "Status"),
						errorLabel: g("basalam.col.error", "Error")
					})
				]
			})] }) : null,
			o ? null : /* @__PURE__ */ h(p, { children: [/* @__PURE__ */ h("section", {
				className: "wd-card-glass space-y-2 rounded-2xl border border-border/60 p-4",
				children: [/* @__PURE__ */ m("h3", {
					className: "text-sm font-medium",
					children: g("wnc.maps")
				}), (x.data?.maps ?? []).length === 0 ? /* @__PURE__ */ m("p", {
					className: "text-muted-foreground text-sm",
					children: g("common.empty")
				}) : /* @__PURE__ */ m("ul", {
					className: "max-h-48 space-y-2 overflow-auto",
					children: (x.data?.maps).map((e, t) => /* @__PURE__ */ h("li", {
						className: "bg-muted/40 flex flex-wrap items-center gap-2 rounded-lg border p-2 text-xs",
						children: [
							/* @__PURE__ */ m(Qt, {
								status: e.status ?? "mapped",
								tone: "secondary"
							}),
							/* @__PURE__ */ m("span", {
								className: "font-mono",
								children: String(e.wc_id ?? e.product_id ?? "—")
							}),
							/* @__PURE__ */ m("span", {
								className: "text-muted-foreground",
								children: "→"
							}),
							/* @__PURE__ */ m("span", {
								className: "font-mono",
								children: String(e.ext_id ?? e.remote_id ?? e.platform_id ?? "—")
							})
						]
					}, String(e.id ?? t)))
				})]
			}), /* @__PURE__ */ h("section", {
				className: "wd-card-glass space-y-2 rounded-2xl border border-border/60 p-4",
				children: [/* @__PURE__ */ m("h3", {
					className: "text-sm font-medium",
					children: g("wnc.jobs")
				}), /* @__PURE__ */ m(en, {
					jobs: S.data?.jobs ?? [],
					emptyLabel: g("common.empty"),
					typeLabel: g("wnc.jobs"),
					statusLabel: g("digikala.endpointStatus", "Status"),
					errorLabel: g("basalam.col.error", "Error")
				})]
			})] })
		]
	});
	return s ? k : /* @__PURE__ */ m(tn, {
		eyebrow: g("settings.hub.shopTitle"),
		title: i ? g(i) : b.data?.label ?? r,
		description: a ? g(a) : g("wnc.platformSubtitle", { platform: r }),
		children: k
	});
}
//#endregion
//#region ../Modules/snapppay-search-module/client/pages/SnappPaySearchConnectorPage.tsx
function Vn() {
	return /* @__PURE__ */ m(Bn, {
		platform: "snapppay-search",
		titleKey: "wnc.modules.snapppay-search.title",
		subtitleKey: "wnc.modules.snapppay-search.subtitle",
		feedPlatform: !0
	});
}
//#endregion
//#region ../Modules/snapppay-search-module/client/module-entry.tsx
var Hn = { "settings/shop/snapppay-search": Vn }, Un = { routes: Hn };
//#endregion
export { Un as default, Hn as routes };
