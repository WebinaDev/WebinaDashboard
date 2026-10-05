import { useMutation as e, useQuery as t, useQueryClient as n } from "@tanstack/react-query";
import * as r from "react";
import { useEffect as i, useMemo as a, useState as o } from "react";
import { Link as s } from "react-router-dom";
import { useTranslation as c } from "react-i18next";
import { toast as l } from "sonner";
import "react-dom";
import { jsx as u, jsxs as d } from "react/jsx-runtime";
import f from "i18next";
//#region \0rolldown/runtime.js
var p = Object.create, m = Object.defineProperty, h = Object.getOwnPropertyDescriptor, g = Object.getOwnPropertyNames, _ = Object.getPrototypeOf, v = Object.prototype.hasOwnProperty, y = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), b = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = g(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !v.call(e, s) && s !== n && m(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = h(t, s)) || r.enumerable
	});
	return e;
}, x = (e, t, n) => (n = e == null ? {} : p(_(e)), b(t || !e || !e.__esModule ? m(n, "default", {
	value: e,
	enumerable: !0
}) : n, e));
//#endregion
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
function ee(...e) {
	return r.useCallback(O(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function te(e) {
	let t = /* @__PURE__ */ k(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(ne);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ u(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ u(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function k(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = ie(n), a = re(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? O(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var A = Symbol("radix.slottable");
function ne(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === A;
}
function re(e, t) {
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
function ie(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/dist/index.mjs
var j = [
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
	let n = /* @__PURE__ */ te(`Primitive.${t}`), i = r.forwardRef((e, r) => {
		let { asChild: i, ...a } = e, o = i ? n : t;
		return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ u(o, {
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
function ae(e, t = []) {
	let n = [];
	function i(t, i) {
		let a = r.createContext(i), o = n.length;
		n = [...n, i];
		let s = (t) => {
			let { scope: n, children: i, ...s } = t, c = n?.[e]?.[o] || a, l = r.useMemo(() => s, Object.values(s));
			return /* @__PURE__ */ u(c.Provider, {
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
	return a.scopeName = e, [i, oe(a, ...t)];
}
function oe(...e) {
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
function se(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var ce = globalThis?.document ? r.useLayoutEffect : () => {}, M = r.useInsertionEffect || ce;
function N({ prop: e, defaultProp: t, onChange: n = () => {}, caller: i }) {
	let [a, o, s] = le({
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
			let n = ue(t) ? t(e) : t;
			n !== e && s.current?.(n);
		} else o(t);
	}, [
		c,
		e,
		o,
		s
	])];
}
function le({ defaultProp: e, onChange: t }) {
	let [n, i] = r.useState(e), a = r.useRef(n), o = r.useRef(t);
	return M(() => {
		o.current = t;
	}, [t]), r.useEffect(() => {
		a.current !== n && (o.current?.(n), a.current = n);
	}, [n, a]), [
		n,
		i,
		o
	];
}
function ue(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function P(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function de(e) {
	let [t, n] = r.useState(void 0);
	return ce(() => {
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
//#region node_modules/radix-ui/node_modules/@radix-ui/react-label/dist/index.mjs
var fe = "Label", pe = r.forwardRef((e, t) => /* @__PURE__ */ u(j.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
pe.displayName = fe;
var me = pe;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function he(e) {
	let t = /* @__PURE__ */ _e(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(ye);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ u(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ u(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
var ge = /* @__PURE__ */ he("Slot");
/* @__NO_SIDE_EFFECTS__ */
function _e(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = xe(n), a = be(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? O(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var ve = Symbol("radix.slottable");
function ye(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === ve;
}
function be(e, t) {
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
function xe(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-switch/dist/index.mjs
var Se = "Switch", [Ce, we] = ae(Se), [Te, Ee] = Ce(Se), De = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, name: i, checked: a, defaultChecked: o, required: s, disabled: c, value: l = "on", onCheckedChange: f, form: p, ...m } = e, [h, g] = r.useState(null), _ = ee(t, (e) => g(e)), v = r.useRef(!1), y = h ? p || !!h.closest("form") : !0, [b, x] = N({
		prop: a,
		defaultProp: o ?? !1,
		onChange: f,
		caller: Se
	});
	return /* @__PURE__ */ d(Te, {
		scope: n,
		checked: b,
		disabled: c,
		children: [/* @__PURE__ */ u(j.button, {
			type: "button",
			role: "switch",
			"aria-checked": b,
			"aria-required": s,
			"data-state": Me(b),
			"data-disabled": c ? "" : void 0,
			disabled: c,
			value: l,
			...m,
			ref: _,
			onClick: se(e.onClick, (e) => {
				x((e) => !e), y && (v.current = e.isPropagationStopped(), v.current || e.stopPropagation());
			})
		}), y && /* @__PURE__ */ u(je, {
			control: h,
			bubbles: !v.current,
			name: i,
			value: l,
			checked: b,
			required: s,
			disabled: c,
			form: p,
			style: { transform: "translateX(-100%)" }
		})]
	});
});
De.displayName = Se;
var Oe = "SwitchThumb", ke = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, ...r } = e, i = Ee(Oe, n);
	return /* @__PURE__ */ u(j.span, {
		"data-state": Me(i.checked),
		"data-disabled": i.disabled ? "" : void 0,
		...r,
		ref: t
	});
});
ke.displayName = Oe;
var Ae = "SwitchBubbleInput", je = r.forwardRef(({ __scopeSwitch: e, control: t, checked: n, bubbles: i = !0, ...a }, o) => {
	let s = r.useRef(null), c = ee(s, o), l = P(n), d = de(t);
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
	]), /* @__PURE__ */ u("input", {
		type: "checkbox",
		"aria-hidden": !0,
		defaultChecked: n,
		...a,
		tabIndex: -1,
		ref: c,
		style: {
			...a.style,
			...d,
			position: "absolute",
			pointerEvents: "none",
			opacity: 0,
			margin: 0
		}
	});
});
je.displayName = Ae;
function Me(e) {
	return e ? "checked" : "unchecked";
}
var Ne = De, Pe = ke, Fe = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, Ie = (e, t) => ({
	classGroupId: e,
	validator: t
}), Le = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), Re = "-", ze = [], Be = "arbitrary..", Ve = (e) => {
	let t = We(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return Ue(e);
			let n = e.split(Re);
			return He(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? Fe(i, t) : t : i || ze;
			}
			return n[e] || ze;
		}
	};
}, He = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = He(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(Re) : e.slice(t).join(Re), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, Ue = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? Be + r : void 0;
})(), We = (e) => {
	let { theme: t, classGroups: n } = e;
	return Ge(n, t);
}, Ge = (e, t) => {
	let n = Le();
	for (let r in e) {
		let i = e[r];
		Ke(i, n, r, t);
	}
	return n;
}, Ke = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		qe(i, t, n, r);
	}
}, qe = (e, t, n, r) => {
	if (typeof e == "string") {
		Je(e, t, n);
		return;
	}
	if (typeof e == "function") {
		Ye(e, t, n, r);
		return;
	}
	Xe(e, t, n, r);
}, Je = (e, t, n) => {
	let r = e === "" ? t : Ze(t, e);
	r.classGroupId = n;
}, Ye = (e, t, n, r) => {
	if (Qe(e)) {
		Ke(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(Ie(n, e));
}, Xe = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		Ke(o, Ze(t, a), n, r);
	}
}, Ze = (e, t) => {
	let n = e, r = t.split(Re), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = Le(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, Qe = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, $e = (e) => {
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
}, et = "!", tt = ":", nt = [], rt = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), it = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === tt) {
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
		s.endsWith(et) ? (c = s.slice(0, -1), l = !0) : s.startsWith(et) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return rt(t, l, c, u);
	};
	if (t) {
		let e = t + tt, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : rt(nt, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, at = (e) => {
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
}, ot = (e) => ({
	cache: $e(e.cacheSize),
	parseClassName: it(e),
	sortModifiers: at(e),
	...Ve(e)
}), st = /\s+/, ct = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(st), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + et : g, v = _ + h;
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
}, lt = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = ut(n)) && (i && (i += " "), i += r);
	return i;
}, ut = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = ut(e[r])) && (n && (n += " "), n += t);
	return n;
}, dt = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = ot(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = ct(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(lt(...e));
}, ft = [], F = (e) => {
	let t = (t) => t[e] || ft;
	return t.isThemeGetter = !0, t;
}, pt = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, mt = /^\((?:(\w[\w-]*):)?(.+)\)$/i, ht = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, gt = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, _t = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, vt = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, yt = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, bt = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, I = (e) => ht.test(e), L = (e) => !!e && !Number.isNaN(Number(e)), xt = (e) => !!e && Number.isInteger(Number(e)), St = (e) => e.endsWith("%") && L(e.slice(0, -1)), R = (e) => gt.test(e), Ct = () => !0, wt = (e) => _t.test(e) && !vt.test(e), Tt = () => !1, Et = (e) => yt.test(e), Dt = (e) => bt.test(e), Ot = (e) => !z(e) && !B(e), kt = (e) => Wt(e, Jt, Tt), z = (e) => pt.test(e), At = (e) => Wt(e, Yt, wt), jt = (e) => Wt(e, Xt, L), Mt = (e) => Wt(e, Qt, Ct), Nt = (e) => Wt(e, Zt, Tt), Pt = (e) => Wt(e, Kt, Tt), Ft = (e) => Wt(e, qt, Dt), It = (e) => Wt(e, $t, Et), B = (e) => mt.test(e), Lt = (e) => Gt(e, Yt), Rt = (e) => Gt(e, Zt), zt = (e) => Gt(e, Kt), Bt = (e) => Gt(e, Jt), Vt = (e) => Gt(e, qt), Ht = (e) => Gt(e, $t, !0), Ut = (e) => Gt(e, Qt, !0), Wt = (e, t, n) => {
	let r = pt.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, Gt = (e, t, n = !1) => {
	let r = mt.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, Kt = (e) => e === "position" || e === "percentage", qt = (e) => e === "image" || e === "url", Jt = (e) => e === "length" || e === "size" || e === "bg-size", Yt = (e) => e === "length", Xt = (e) => e === "number", Zt = (e) => e === "family-name", Qt = (e) => e === "number" || e === "weight", $t = (e) => e === "shadow", en = /* @__PURE__ */ dt(() => {
	let e = F("color"), t = F("font"), n = F("text"), r = F("font-weight"), i = F("tracking"), a = F("leading"), o = F("breakpoint"), s = F("container"), c = F("spacing"), l = F("radius"), u = F("shadow"), d = F("inset-shadow"), f = F("text-shadow"), p = F("drop-shadow"), m = F("blur"), h = F("perspective"), g = F("aspect"), _ = F("ease"), v = F("animate"), y = () => [
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
		I,
		"full",
		"auto",
		...w()
	], E = () => [
		xt,
		"none",
		"subgrid",
		B,
		z
	], D = () => [
		"auto",
		{ span: [
			"full",
			xt,
			B,
			z
		] },
		xt,
		B,
		z
	], O = () => [
		xt,
		"auto",
		B,
		z
	], ee = () => [
		"auto",
		"min",
		"max",
		"fr",
		B,
		z
	], te = () => [
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
	], A = () => ["auto", ...w()], ne = () => [
		I,
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
	], re = () => [
		I,
		"screen",
		"full",
		"dvw",
		"lvw",
		"svw",
		"min",
		"max",
		"fit",
		...w()
	], ie = () => [
		I,
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
	], j = () => [
		e,
		B,
		z
	], ae = () => [
		...b(),
		zt,
		Pt,
		{ position: [B, z] }
	], oe = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], se = () => [
		"auto",
		"cover",
		"contain",
		Bt,
		kt,
		{ size: [B, z] }
	], ce = () => [
		St,
		Lt,
		At
	], M = () => [
		"",
		"none",
		"full",
		l,
		B,
		z
	], N = () => [
		"",
		L,
		Lt,
		At
	], le = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	], ue = () => [
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
	], P = () => [
		L,
		St,
		zt,
		Pt
	], de = () => [
		"",
		"none",
		m,
		B,
		z
	], fe = () => [
		"none",
		L,
		B,
		z
	], pe = () => [
		"none",
		L,
		B,
		z
	], me = () => [
		L,
		B,
		z
	], he = () => [
		I,
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
			color: [Ct],
			container: [R],
			"drop-shadow": [R],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [Ot],
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
				I,
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
				xt,
				"auto",
				B,
				z
			] }],
			basis: [{ basis: [
				I,
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
				I,
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
				xt,
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
			"auto-cols": [{ "auto-cols": ee() }],
			"auto-rows": [{ "auto-rows": ee() }],
			gap: [{ gap: w() }],
			"gap-x": [{ "gap-x": w() }],
			"gap-y": [{ "gap-y": w() }],
			"justify-content": [{ justify: [...te(), "normal"] }],
			"justify-items": [{ "justify-items": [...k(), "normal"] }],
			"justify-self": [{ "justify-self": ["auto", ...k()] }],
			"align-content": [{ content: ["normal", ...te()] }],
			"align-items": [{ items: [...k(), { baseline: ["", "last"] }] }],
			"align-self": [{ self: [
				"auto",
				...k(),
				{ baseline: ["", "last"] }
			] }],
			"place-content": [{ "place-content": te() }],
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
			size: [{ size: ne() }],
			"inline-size": [{ inline: ["auto", ...re()] }],
			"min-inline-size": [{ "min-inline": ["auto", ...re()] }],
			"max-inline-size": [{ "max-inline": ["none", ...re()] }],
			"block-size": [{ block: ["auto", ...ie()] }],
			"min-block-size": [{ "min-block": ["auto", ...ie()] }],
			"max-block-size": [{ "max-block": ["none", ...ie()] }],
			w: [{ w: [
				s,
				"screen",
				...ne()
			] }],
			"min-w": [{ "min-w": [
				s,
				"screen",
				"none",
				...ne()
			] }],
			"max-w": [{ "max-w": [
				s,
				"screen",
				"none",
				"prose",
				{ screen: [o] },
				...ne()
			] }],
			h: [{ h: [
				"screen",
				"lh",
				...ne()
			] }],
			"min-h": [{ "min-h": [
				"screen",
				"lh",
				"none",
				...ne()
			] }],
			"max-h": [{ "max-h": [
				"screen",
				"lh",
				...ne()
			] }],
			"font-size": [{ text: [
				"base",
				n,
				Lt,
				At
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				Ut,
				Mt
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
				St,
				z
			] }],
			"font-family": [{ font: [
				Rt,
				Nt,
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
				jt
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
			"placeholder-color": [{ placeholder: j() }],
			"text-color": [{ text: j() }],
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			"text-decoration-style": [{ decoration: [...le(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				L,
				"from-font",
				"auto",
				B,
				At
			] }],
			"text-decoration-color": [{ decoration: j() }],
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
			"bg-position": [{ bg: ae() }],
			"bg-repeat": [{ bg: oe() }],
			"bg-size": [{ bg: se() }],
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
						xt,
						B,
						z
					],
					radial: [
						"",
						B,
						z
					],
					conic: [
						xt,
						B,
						z
					]
				},
				Vt,
				Ft
			] }],
			"bg-color": [{ bg: j() }],
			"gradient-from-pos": [{ from: ce() }],
			"gradient-via-pos": [{ via: ce() }],
			"gradient-to-pos": [{ to: ce() }],
			"gradient-from": [{ from: j() }],
			"gradient-via": [{ via: j() }],
			"gradient-to": [{ to: j() }],
			rounded: [{ rounded: M() }],
			"rounded-s": [{ "rounded-s": M() }],
			"rounded-e": [{ "rounded-e": M() }],
			"rounded-t": [{ "rounded-t": M() }],
			"rounded-r": [{ "rounded-r": M() }],
			"rounded-b": [{ "rounded-b": M() }],
			"rounded-l": [{ "rounded-l": M() }],
			"rounded-ss": [{ "rounded-ss": M() }],
			"rounded-se": [{ "rounded-se": M() }],
			"rounded-ee": [{ "rounded-ee": M() }],
			"rounded-es": [{ "rounded-es": M() }],
			"rounded-tl": [{ "rounded-tl": M() }],
			"rounded-tr": [{ "rounded-tr": M() }],
			"rounded-br": [{ "rounded-br": M() }],
			"rounded-bl": [{ "rounded-bl": M() }],
			"border-w": [{ border: N() }],
			"border-w-x": [{ "border-x": N() }],
			"border-w-y": [{ "border-y": N() }],
			"border-w-s": [{ "border-s": N() }],
			"border-w-e": [{ "border-e": N() }],
			"border-w-bs": [{ "border-bs": N() }],
			"border-w-be": [{ "border-be": N() }],
			"border-w-t": [{ "border-t": N() }],
			"border-w-r": [{ "border-r": N() }],
			"border-w-b": [{ "border-b": N() }],
			"border-w-l": [{ "border-l": N() }],
			"divide-x": [{ "divide-x": N() }],
			"divide-x-reverse": ["divide-x-reverse"],
			"divide-y": [{ "divide-y": N() }],
			"divide-y-reverse": ["divide-y-reverse"],
			"border-style": [{ border: [
				...le(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...le(),
				"hidden",
				"none"
			] }],
			"border-color": [{ border: j() }],
			"border-color-x": [{ "border-x": j() }],
			"border-color-y": [{ "border-y": j() }],
			"border-color-s": [{ "border-s": j() }],
			"border-color-e": [{ "border-e": j() }],
			"border-color-bs": [{ "border-bs": j() }],
			"border-color-be": [{ "border-be": j() }],
			"border-color-t": [{ "border-t": j() }],
			"border-color-r": [{ "border-r": j() }],
			"border-color-b": [{ "border-b": j() }],
			"border-color-l": [{ "border-l": j() }],
			"divide-color": [{ divide: j() }],
			"outline-style": [{ outline: [
				...le(),
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
				Lt,
				At
			] }],
			"outline-color": [{ outline: j() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				Ht,
				It
			] }],
			"shadow-color": [{ shadow: j() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				Ht,
				It
			] }],
			"inset-shadow-color": [{ "inset-shadow": j() }],
			"ring-w": [{ ring: N() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: j() }],
			"ring-offset-w": [{ "ring-offset": [L, At] }],
			"ring-offset-color": [{ "ring-offset": j() }],
			"inset-ring-w": [{ "inset-ring": N() }],
			"inset-ring-color": [{ "inset-ring": j() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				Ht,
				It
			] }],
			"text-shadow-color": [{ "text-shadow": j() }],
			opacity: [{ opacity: [
				L,
				B,
				z
			] }],
			"mix-blend": [{ "mix-blend": [
				...ue(),
				"plus-darker",
				"plus-lighter"
			] }],
			"bg-blend": [{ "bg-blend": ue() }],
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
			"mask-image-linear-from-pos": [{ "mask-linear-from": P() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": P() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": j() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": j() }],
			"mask-image-t-from-pos": [{ "mask-t-from": P() }],
			"mask-image-t-to-pos": [{ "mask-t-to": P() }],
			"mask-image-t-from-color": [{ "mask-t-from": j() }],
			"mask-image-t-to-color": [{ "mask-t-to": j() }],
			"mask-image-r-from-pos": [{ "mask-r-from": P() }],
			"mask-image-r-to-pos": [{ "mask-r-to": P() }],
			"mask-image-r-from-color": [{ "mask-r-from": j() }],
			"mask-image-r-to-color": [{ "mask-r-to": j() }],
			"mask-image-b-from-pos": [{ "mask-b-from": P() }],
			"mask-image-b-to-pos": [{ "mask-b-to": P() }],
			"mask-image-b-from-color": [{ "mask-b-from": j() }],
			"mask-image-b-to-color": [{ "mask-b-to": j() }],
			"mask-image-l-from-pos": [{ "mask-l-from": P() }],
			"mask-image-l-to-pos": [{ "mask-l-to": P() }],
			"mask-image-l-from-color": [{ "mask-l-from": j() }],
			"mask-image-l-to-color": [{ "mask-l-to": j() }],
			"mask-image-x-from-pos": [{ "mask-x-from": P() }],
			"mask-image-x-to-pos": [{ "mask-x-to": P() }],
			"mask-image-x-from-color": [{ "mask-x-from": j() }],
			"mask-image-x-to-color": [{ "mask-x-to": j() }],
			"mask-image-y-from-pos": [{ "mask-y-from": P() }],
			"mask-image-y-to-pos": [{ "mask-y-to": P() }],
			"mask-image-y-from-color": [{ "mask-y-from": j() }],
			"mask-image-y-to-color": [{ "mask-y-to": j() }],
			"mask-image-radial": [{ "mask-radial": [B, z] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": P() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": P() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": j() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": j() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [L] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": P() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": P() }],
			"mask-image-conic-from-color": [{ "mask-conic-from": j() }],
			"mask-image-conic-to-color": [{ "mask-conic-to": j() }],
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
			"mask-position": [{ mask: ae() }],
			"mask-repeat": [{ mask: oe() }],
			"mask-size": [{ mask: se() }],
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
			blur: [{ blur: de() }],
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
				Ht,
				It
			] }],
			"drop-shadow-color": [{ "drop-shadow": j() }],
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
			"backdrop-blur": [{ "backdrop-blur": de() }],
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
			rotate: [{ rotate: fe() }],
			"rotate-x": [{ "rotate-x": fe() }],
			"rotate-y": [{ "rotate-y": fe() }],
			"rotate-z": [{ "rotate-z": fe() }],
			scale: [{ scale: pe() }],
			"scale-x": [{ "scale-x": pe() }],
			"scale-y": [{ "scale-y": pe() }],
			"scale-z": [{ "scale-z": pe() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: me() }],
			"skew-x": [{ "skew-x": me() }],
			"skew-y": [{ "skew-y": me() }],
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
			translate: [{ translate: he() }],
			"translate-x": [{ "translate-x": he() }],
			"translate-y": [{ "translate-y": he() }],
			"translate-z": [{ "translate-z": he() }],
			"translate-none": ["translate-none"],
			accent: [{ accent: j() }],
			appearance: [{ appearance: ["none", "auto"] }],
			"caret-color": [{ caret: j() }],
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
			fill: [{ fill: ["none", ...j()] }],
			"stroke-w": [{ stroke: [
				L,
				Lt,
				At,
				jt
			] }],
			stroke: [{ stroke: ["none", ...j()] }],
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
	return en(C(e));
}
//#endregion
//#region src/components/ui/badge.tsx
var tn = E("inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3", {
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
function nn({ className: e, variant: t = "default", asChild: n = !1, ...r }) {
	return /* @__PURE__ */ u(n ? ge : "span", {
		"data-slot": "badge",
		"data-variant": t,
		className: V(tn({ variant: t }), e),
		...r
	});
}
//#endregion
//#region src/components/data/DumpUi.tsx
var rn = {
	default: "",
	success: "border-transparent bg-emerald-600 text-white dark:bg-emerald-500",
	warning: "border-transparent bg-amber-500 text-white",
	destructive: "",
	secondary: ""
};
function an(e) {
	let t = String(e ?? "").toLowerCase();
	return t === "done" || t === "completed" || t === "success" || t === "ok" ? "success" : t === "failed" || t === "error" || t === "cancelled" || t === "canceled" ? "destructive" : t === "running" || t === "processing" ? "warning" : t === "pending" || t === "queued" ? "secondary" : "default";
}
function on({ status: e, tone: t, className: n }) {
	let r = t ?? an(e), i = e == null || e === "" ? "—" : String(e);
	return /* @__PURE__ */ u(nn, {
		variant: r === "destructive" ? "destructive" : r === "secondary" ? "secondary" : "outline",
		className: V(rn[r], n),
		children: i
	});
}
function sn({ rows: e, emptyLabel: t = "—", className: n }) {
	return e.length ? /* @__PURE__ */ u("dl", {
		className: V("divide-border divide-y text-sm", n),
		children: e.map((e, n) => /* @__PURE__ */ d("div", {
			className: "flex flex-wrap items-start justify-between gap-2 py-2",
			children: [/* @__PURE__ */ u("dt", {
				className: "text-muted-foreground",
				children: e.label
			}), /* @__PURE__ */ u("dd", {
				className: "max-w-full break-words text-end font-medium",
				children: e.value ?? t
			})]
		}, n))
	}) : /* @__PURE__ */ u("p", {
		className: "text-muted-foreground text-sm",
		children: t
	});
}
function cn({ jobs: e, emptyLabel: t, typeLabel: n = "Type", statusLabel: r = "Status", errorLabel: i = "Error" }) {
	return e.length ? /* @__PURE__ */ u("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ d("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ u("thead", { children: /* @__PURE__ */ d("tr", {
				className: "border-b text-start",
				children: [
					/* @__PURE__ */ u("th", {
						className: "py-2 pe-2",
						children: "ID"
					}),
					/* @__PURE__ */ u("th", {
						className: "py-2 pe-2",
						children: n
					}),
					/* @__PURE__ */ u("th", {
						className: "py-2 pe-2",
						children: r
					}),
					/* @__PURE__ */ u("th", {
						className: "py-2",
						children: i
					})
				]
			}) }), /* @__PURE__ */ u("tbody", { children: e.map((e) => /* @__PURE__ */ d("tr", {
				className: "border-b align-top",
				children: [
					/* @__PURE__ */ u("td", {
						className: "py-2 pe-2 font-mono text-xs",
						children: e.id ?? "—"
					}),
					/* @__PURE__ */ u("td", {
						className: "py-2 pe-2 font-mono text-xs",
						children: String(e.type ?? e.job_type ?? "—")
					}),
					/* @__PURE__ */ u("td", {
						className: "py-2 pe-2",
						children: /* @__PURE__ */ u(on, { status: e.status })
					}),
					/* @__PURE__ */ u("td", {
						className: "text-muted-foreground py-2 text-xs",
						children: String(e.error_message ?? e.error ?? "—")
					})
				]
			}, String(e.id ?? `${e.type}-${e.created_at}`))) })]
		})
	}) : /* @__PURE__ */ u("p", {
		className: "text-muted-foreground text-sm",
		children: t
	});
}
function ln({ data: e, emptyLabel: t }) {
	let n = Object.entries(e ?? {});
	return n.length ? /* @__PURE__ */ u("div", {
		className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
		children: n.map(([e, t]) => {
			let n = Array.isArray(t) ? t.map(String) : [String(t)];
			return /* @__PURE__ */ d("div", {
				className: "bg-muted/40 rounded-lg border p-3",
				children: [/* @__PURE__ */ u("p", {
					className: "mb-2 text-sm font-medium capitalize",
					children: e
				}), /* @__PURE__ */ u("ul", {
					className: "text-muted-foreground space-y-1 text-xs",
					children: n.map((e) => /* @__PURE__ */ d("li", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ u("span", { className: "text-primary mt-1 size-1.5 shrink-0 rounded-full bg-current" }), /* @__PURE__ */ u("span", { children: e.replace(/_/g, " ") })]
					}, e))
				})]
			}, e);
		})
	}) : /* @__PURE__ */ u("p", {
		className: "text-muted-foreground text-sm",
		children: t
	});
}
function un({ items: e, emptyLabel: t }) {
	return e.length ? /* @__PURE__ */ u("ul", {
		className: "max-h-96 space-y-2 overflow-auto",
		children: e.map((e, t) => {
			let n = String(e.level ?? e.severity ?? "info"), r = String(e.message ?? e.msg ?? e.event ?? JSON.stringify(e)), i = String(e.created_at ?? e.time ?? e.timestamp ?? ""), a = String(e.context ?? e.channel ?? e.source ?? "");
			return /* @__PURE__ */ d("li", {
				className: "bg-muted/30 rounded-md border p-2 text-xs",
				children: [/* @__PURE__ */ d("div", {
					className: "mb-1 flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ u(on, {
							status: n,
							tone: n === "error" || n === "critical" ? "destructive" : n === "warning" ? "warning" : "secondary"
						}),
						a ? /* @__PURE__ */ u("span", {
							className: "text-muted-foreground font-mono",
							children: a
						}) : null,
						i ? /* @__PURE__ */ u("span", {
							className: "text-muted-foreground ms-auto",
							children: i
						}) : null
					]
				}), /* @__PURE__ */ u("p", {
					className: "leading-relaxed whitespace-pre-wrap",
					children: r
				})]
			}, String(e.id ?? t));
		})
	}) : /* @__PURE__ */ u("p", {
		className: "text-muted-foreground text-sm",
		children: t
	});
}
//#endregion
//#region src/components/PageShell.tsx
function dn({ title: e, description: t, eyebrow: n, children: r }) {
	return /* @__PURE__ */ d("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ d("header", {
			className: "min-w-0 space-y-1.5",
			children: [
				n ? /* @__PURE__ */ u("p", {
					className: "text-muted-foreground text-xs font-medium tracking-wide uppercase",
					children: n
				}) : null,
				/* @__PURE__ */ u("h1", {
					className: "text-xl font-semibold tracking-tight sm:text-2xl",
					children: e
				}),
				t ? /* @__PURE__ */ u("p", {
					className: "text-muted-foreground max-w-2xl text-sm leading-relaxed",
					children: t
				}) : null
			]
		}), r]
	});
}
//#endregion
//#region src/components/ui/button.tsx
var fn = E("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
	return /* @__PURE__ */ u(r ? ge : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: V(fn({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/components/ui/card.tsx
var pn = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function U({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ u("div", {
		"data-slot": "card",
		"data-variant": t,
		className: V("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", pn[t], e),
		...n
	});
}
function W({ className: e, ...t }) {
	return /* @__PURE__ */ u("div", {
		"data-slot": "card-header",
		className: V("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function G({ className: e, ...t }) {
	return /* @__PURE__ */ u("div", {
		"data-slot": "card-title",
		className: V("leading-none font-semibold", e),
		...t
	});
}
function mn({ className: e, ...t }) {
	return /* @__PURE__ */ u("div", {
		"data-slot": "card-description",
		className: V("text-sm text-muted-foreground", e),
		...t
	});
}
function K({ className: e, ...t }) {
	return /* @__PURE__ */ u("div", {
		"data-slot": "card-content",
		className: V("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region src/components/ui/input.tsx
function hn({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ u("input", {
		type: t,
		"data-slot": "input",
		className: V("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/switch.tsx
function gn({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ u(Ne, {
		"data-slot": "switch",
		"data-size": t,
		className: V("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", e),
		...n,
		dir: "ltr",
		children: /* @__PURE__ */ u(Pe, {
			"data-slot": "switch-thumb",
			className: V("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
//#endregion
//#region src/components/ui/textarea.tsx
function _n({ className: e, ...t }) {
	return /* @__PURE__ */ u("textarea", {
		"data-slot": "textarea",
		className: V("flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-start shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40", e),
		...t
	});
}
//#endregion
//#region src/lib/marketplace-api.ts
function vn(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function yn(e) {
	"@babel/helpers - typeof";
	return yn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, yn(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function bn(e, t) {
	if (yn(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (yn(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function xn(e) {
	var t = bn(e, "string");
	return yn(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function Sn(e, t, n) {
	return (t = xn(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/lib/apiError.ts
var q = class extends Error {
	constructor(e, t) {
		super(e), Sn(this, "code", void 0), Sn(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, Cn = {
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
function wn(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function Tn(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function En(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(vn(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function Dn(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return En(e, n);
	if (t instanceof q && t.code) {
		let n = Cn[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = Cn[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return wn(n) ? e("errors.api.timeout") : Tn(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function J(e, t) {
	l.error(Dn(e, t));
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
	throw new q("Request blocked: URL not allowed", {
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
	if (!r || !i.ajaxUrl) throw new q("AJAX fallback unavailable", {
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
			throw new q(Fn(t, e.status), {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!n.success) throw new q(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
			code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
			status: e.status
		});
		return n.data;
	} finally {
		c();
	}
}
async function Y(e, t = {}, n = An) {
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
			throw new q(n.includes("Upstream Error") || n.includes("Forbidden") ? "REST blocked by CDN/WAF — use admin-ajax fallback or whitelist /wp-json/" : "Invalid JSON response", {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i;
			throw new q(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
		}
		return i;
	} catch (e) {
		throw e instanceof q ? e : e instanceof DOMException && e.name === "AbortError" ? new q("Request timed out", {
			code: "timeout",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region node_modules/dayjs/dayjs.min.js
var Ln = /* @__PURE__ */ y(((e, t) => {
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
})), Rn = /* @__PURE__ */ y(((e, t) => {
	(function(n, r) {
		typeof e == "object" && t !== void 0 ? t.exports = r(Ln()) : typeof define == "function" && define.amd ? define(["dayjs"], r) : (n = typeof globalThis < "u" ? globalThis : n || self).dayjs_locale_fa = r(n.dayjs);
	})(e, (function(e) {
		function t(e) {
			return e && typeof e == "object" && "default" in e ? e : { default: e };
		}
		var n = t(e), r = {
			name: "fa",
			weekdays: "یک‌شنبه_دوشنبه_سه‌شنبه_چهارشنبه_پنج‌شنبه_جمعه_شنبه".split("_"),
			weekdaysShort: "یک‌شنبه_دوشنبه_سه‌شنبه_چهارشنبه_پنج‌شنبه_جمعه_شنبه".split("_"),
			weekdaysMin: "ی_د_س_چ_پ_ج_ش".split("_"),
			weekStart: 6,
			months: "ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر".split("_"),
			monthsShort: "ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر".split("_"),
			ordinal: function(e) {
				return e;
			},
			formats: {
				LT: "HH:mm",
				LTS: "HH:mm:ss",
				L: "DD/MM/YYYY",
				LL: "D MMMM YYYY",
				LLL: "D MMMM YYYY HH:mm",
				LLLL: "dddd, D MMMM YYYY HH:mm"
			},
			relativeTime: {
				future: "در %s",
				past: "%s پیش",
				s: "چند ثانیه",
				m: "یک دقیقه",
				mm: "%d دقیقه",
				h: "یک ساعت",
				hh: "%d ساعت",
				d: "یک روز",
				dd: "%d روز",
				M: "یک ماه",
				MM: "%d ماه",
				y: "یک سال",
				yy: "%d سال"
			}
		};
		return n.default.locale(r, null, !0), r;
	}));
})), zn = /* @__PURE__ */ y(((e, t) => {
	(function(n, r) {
		typeof e == "object" && t !== void 0 ? t.exports = r() : typeof define == "function" && define.amd ? define(r) : (n = typeof globalThis < "u" ? globalThis : n || self).dayjs_plugin_relativeTime = r();
	})(e, (function() {
		return function(e, t, n) {
			e = e || {};
			var r = t.prototype, i = {
				future: "in %s",
				past: "%s ago",
				s: "a few seconds",
				m: "a minute",
				mm: "%d minutes",
				h: "an hour",
				hh: "%d hours",
				d: "a day",
				dd: "%d days",
				M: "a month",
				MM: "%d months",
				y: "a year",
				yy: "%d years"
			};
			function a(e, t, n, i) {
				return r.fromToBase(e, t, n, i);
			}
			n.en.relativeTime = i, r.fromToBase = function(t, r, a, o, s) {
				for (var c, l, u, d = a.$locale().relativeTime || i, f = e.thresholds || [
					{
						l: "s",
						r: 44,
						d: "second"
					},
					{
						l: "m",
						r: 89
					},
					{
						l: "mm",
						r: 44,
						d: "minute"
					},
					{
						l: "h",
						r: 89
					},
					{
						l: "hh",
						r: 21,
						d: "hour"
					},
					{
						l: "d",
						r: 35
					},
					{
						l: "dd",
						r: 25,
						d: "day"
					},
					{
						l: "M",
						r: 45
					},
					{
						l: "MM",
						r: 10,
						d: "month"
					},
					{
						l: "y",
						r: 17
					},
					{
						l: "yy",
						d: "year"
					}
				], p = f.length, m = 0; m < p; m += 1) {
					var h = f[m];
					h.d && (c = o ? n(t).diff(a, h.d, !0) : a.diff(t, h.d, !0));
					var g = (e.rounding || Math.round)(Math.abs(c));
					if (u = c > 0, g <= h.r || !h.r) {
						g <= 1 && m > 0 && (h = f[m - 1]);
						var _ = d[h.l];
						s && (g = s("" + g)), l = typeof _ == "string" ? _.replace("%d", g) : _(g, r, h.l, u);
						break;
					}
				}
				if (r) return l;
				var v = u ? d.future : d.past;
				return typeof v == "function" ? v(l) : v.replace("%s", l);
			}, r.to = function(e, t) {
				return a(e, t, this, !0);
			}, r.from = function(e, t) {
				return a(e, t, this);
			};
			var o = function(e) {
				return e.$u ? n.utc() : n();
			};
			r.toNow = function(e) {
				return this.to(o(this), e);
			}, r.fromNow = function(e) {
				return this.from(o(this), e);
			};
		};
	}));
})), Bn = /* @__PURE__ */ x(Ln(), 1), Vn = /* @__PURE__ */ x(zn(), 1), Hn = /* @__PURE__ */ x(Rn(), 1);
function Un(e, t, n) {
	let r = Z((e + Z(t - 8, 6) + 100100) * 1461, 4) + Z(153 * X(t + 9, 12) + 2, 5) + n - 34840408;
	return r = r - Z(Z(e + 100100 + Z(t - 8, 6), 100) * 3, 4) + 752, r;
}
var Wn = [
	-61,
	9,
	38,
	199,
	426,
	686,
	756,
	818,
	1111,
	1181,
	1210,
	1635,
	2060,
	2097,
	2192,
	2262,
	2324,
	2394,
	2456,
	3178
], Gn = Math.floor;
function X(e, t) {
	return e - ~~(e / t) * t;
}
function Z(e, t) {
	return ~~(e / t);
}
function Kn(e, t) {
	let n = Wn.length, r = e + 621, i = -14, a = Wn[0], o, s, c, l;
	if (e < a || e >= Wn[n - 1]) throw Error(`Invalid Jalaali year ${e}`);
	for (let t = 1; t < n && (o = Wn[t], s = o - a, !(e < o)); t += 1) i = i + Z(s, 33) * 8 + Z(X(s, 33), 4), a = o;
	l = e - a, i = i + Z(l, 33) * 8 + Z(X(l, 33) + 3, 4), X(s, 33) === 4 && s - l === 4 && (i += 1);
	let u = Z(r, 4) - Z((Z(r, 100) + 1) * 3, 4) - 150, d = 20 + i - u;
	return t ? {
		gy: r,
		march: d
	} : (s - l < 6 && (l = l - s + Z(s + 4, 33) * 33), c = X(X(l + 1, 33) - 1, 4), c === -1 && (c = 4), {
		leap: c,
		gy: r,
		march: d
	});
}
function qn(e, t, n) {
	let r = Kn(e, !0);
	return Un(r.gy, 3, r.march) + (t - 1) * 31 - Z(t, 7) * (t - 7) + n - 1;
}
function Jn(e) {
	let t = 4 * e + 139361631;
	t = t + Z(Z(4 * e + 183187720, 146097) * 3, 4) * 4 - 3908;
	let n = Z(X(t, 1461), 4) * 5 + 308, r = Z(X(n, 153), 5) + 1, i = X(Z(n, 153), 12) + 1;
	return [
		Z(t, 1461) - 100100 + Z(8 - i, 6),
		i,
		r
	];
}
function Yn(e, t, n) {
	return Jn(qn(e, t, n));
}
function Xn(e, t, n) {
	let r = {
		year: e,
		month: t,
		day: n
	}, i = [
		0,
		31,
		59,
		90,
		120,
		151,
		181,
		212,
		243,
		273,
		304,
		334
	], a;
	e <= 1600 ? (e -= 621, r.year = 0) : (e -= 1600, r.year = 979);
	let o = e > 2 ? e + 1 : e;
	return a = Gn((o + 3) / 4) + 365 * e - Gn((o + 99) / 100) - 80 + i[t - 1] + Gn((o + 399) / 400) + n, r.year += 33 * Gn(a / 12053), a %= 12053, r.year += 4 * Gn(a / 1461), a %= 1461, a > 365 && (r.year += Gn((a - 1) / 365), a = (a - 1) % 365), r.month = a < 186 ? 1 + Gn(a / 31) : 7 + Gn((a - 186) / 30), r.day = 1 + (a < 186 ? a % 31 : (a - 186) % 30), [
		r.year,
		r.month,
		r.day
	];
}
var Zn = {
	J: (e, t, n) => Xn(e, t, n),
	G: (e, t, n) => Yn(e, t, n)
}, Qn = /^(\d{4})[-/]?(\d{1,2})[-/]?(\d{0,2})(.*)$/, $n = /\[.*?\]|jY{2,4}|jM{1,4}|jD{1,2}|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, er = "date", tr = "day", nr = "month", rr = "year", ir = "week", ar = "YYYY-MM-DDTHH:mm:ssZ", or = { jmonths: "فروردین_اردیبهشت_خرداد_تیر_مرداد_شهریور_مهر_آبان_آذر_دی_بهمن_اسفند".split("_") }, sr = (e, t, n) => {
	let r = t.prototype, i = r.$utils(), a = (e) => e.$C === "jalali", o = i.prettyUnit || i.p, s = i.isUndefined || i.u, c = i.padStart || i.s, l = i.monthDiff || i.m, u = i.absFloor || i.a, d = (e) => function(...t) {
		let n = e.bind(this)(...t);
		return n.$C = this.$C, n.isJalali() && n.InitJalali(), n;
	};
	r.startOf = d(r.startOf), r.endOf = d(r.endOf), r.add = d(r.add), r.subtract = d(r.subtract), r.set = d(r.set);
	let f = r.parse, p = r.init, m = r.startOf, h = r.$set, g = r.add, _ = r.format, v = r.diff, y = r.year, b = r.month, x = r.date, S = r.daysInMonth, C = r.toArray;
	n.$C = "gregory", n.$fdow = 6, n.calendar = function(e) {
		return n.$C = e, n;
	}, r.calendar = function(e) {
		let t = this.clone();
		return t.$C = e, t.isJalali() && t.InitJalali(), t;
	}, r.isJalali = function() {
		return a(this);
	}, n.en.jmonths = "Farvardin_Ordibehesht_Khordaad_Tir_Mordaad_Shahrivar_Mehr_Aabaan_Aazar_Dey_Bahman_Esfand".split("_"), n.locale("fa", {
		...Hn.default,
		...or
	}, !0);
	let w = function(e, t) {
		return n(e, {
			locale: t.$L,
			utc: t.$u,
			calendar: t.$C
		});
	};
	r.init = function(e = {}) {
		p.bind(this)(e), this.isJalali() && this.InitJalali();
	}, r.parse = function(e) {
		if (this.$C = e.calendar || this.$C || n.$C, e.jalali && typeof e.date == "string" && /.*[^Z]$/i.test(e.date)) {
			let t = e.date.match(Qn);
			if (t) {
				let [n, r, i] = Zn.G(Number.parseInt(t[1], 10), Number.parseInt(t[2], 10), Number.parseInt(t[3] || 1, 10));
				e.date = `${n}-${r}-${i}${t[4] || ""}`;
			}
		}
		return f.bind(this)(e);
	}, r.InitJalali = function() {
		let [e, t, n] = Zn.J(this.$y, this.$M + 1, this.$D);
		this.$jy = e, this.$jM = t - 1, this.$jD = n;
	}, r.startOf = function(e, t) {
		if (!a(this)) return m.bind(this)(e, t);
		let r = s(t) ? !0 : t, i = o(e), c = (e, t, n = this.$jy) => {
			let [i, a, o] = Zn.G(n, t + 1, e), s = w(new Date(i, a - 1, o), this);
			return (r ? s : s.endOf(tr)).$set("hour", 1);
		}, l = (this.$W + (7 - n.$fdow)) % 7;
		switch (i) {
			case rr: return r ? c(1, 0) : c(0, 0, this.$jy + 1);
			case nr: return r ? c(1, this.$jM) : c(0, (this.$jM + 1) % 12, this.$jy + Math.floor((this.$jM + 1) / 12));
			case ir: return c(r ? this.$jD - l : this.$jD + (6 - l), this.$jM);
			default: return m.bind(this)(e, t);
		}
	}, r.$set = function(e, t) {
		if (!a(this)) return h.bind(this)(e, t);
		let n = o(e), r = (e, t, n = this.$jy) => {
			let [r, i, a] = Zn.G(n, t + 1, e);
			return this.$d.setFullYear(r), this.$d.setMonth(i - 1), this.$d.setDate(a), this;
		};
		switch (n) {
			case er:
			case tr:
				r(t, this.$jM);
				break;
			case nr:
				r(this.$jD, t);
				break;
			case rr:
				r(this.$jD, this.$jM, t);
				break;
			default: return h.bind(this)(e, t);
		}
		return this.init(), this;
	}, r.add = function(e, t) {
		if (!a(this)) return g.bind(this)(e, t);
		e = Number(e);
		let n = t && (t.length === 1 || t === "ms") ? t : o(t), r = (t, n) => {
			let r = this.set(er, 1).set(t, n + e);
			return r.set(er, Math.min(this.$jD, r.daysInMonth()));
		};
		if (["M", nr].includes(n)) {
			let t = this.$jM + e, n = t < 0 ? -Math.ceil(-t / 12) : Math.floor(t / 12), r = this.$jD, i = this.set(tr, 1).add(n, rr).set(nr, t - n * 12);
			return i.set(tr, Math.min(i.daysInMonth(), r));
		}
		if (["y", rr].includes(n)) return r(rr, this.$jy);
		if (["d", tr].includes(n)) {
			let t = new Date(this.$d);
			return t.setDate(t.getDate() + e), w(t, this);
		}
		if (["w", ir].includes(n)) {
			let t = new Date(this.$d);
			return t.setDate(t.getDate() + e * 7), w(t, this);
		}
		return g.bind(this)(e, t);
	}, r.format = function(e, t) {
		if (!a(this)) return _.bind(this)(e, t);
		let n = e || ar, { jmonths: r } = t || this.$locale();
		return n.replace($n, (e) => {
			if (e.includes("[")) return e.replace(/\[|\]/g, "");
			switch (e) {
				case "YY": return String(this.$jy).slice(-2);
				case "YYYY": return String(this.$jy);
				case "M": return String(this.$jM + 1);
				case "MM": return c(this.$jM + 1, 2, "0");
				case "MMM": return r[this.$jM].slice(0, 3);
				case "MMMM": return r[this.$jM];
				case "D": return String(this.$jD);
				case "DD": return c(this.$jD, 2, "0");
				default: return _.bind(this)(e, t);
			}
		});
	}, r.diff = function(e, t, r) {
		if (!a(this)) return v.bind(this)(e, t, r);
		let i = o(t), s = n(e), c = l(this, s);
		switch (i) {
			case rr:
				c /= 12;
				break;
			case nr: break;
			default: return v.bind(this)(e, t, r);
		}
		return r ? c : u(c);
	}, r.$g = function(e, t, n) {
		return s(e) ? this[t] : this.set(n, e);
	}, r.year = function(e) {
		return a(this) ? this.$g(e, "$jy", rr) : y.bind(this)(e);
	}, r.month = function(e) {
		return a(this) ? this.$g(e, "$jM", nr) : b.bind(this)(e);
	}, r.date = function(e) {
		return a(this) ? this.$g(e, "$jD", tr) : x.bind(this)(e);
	}, r.daysInMonth = function() {
		return a(this) ? this.endOf(nr).$jD : S.bind(this)();
	}, C && (r.toArray = function() {
		return a(this) ? [
			this.$jy,
			this.$jM,
			this.$jD,
			this.$H,
			this.$m,
			this.$s,
			this.$ms
		] : C.bind(this)();
	}), r.clone = function() {
		return w(this.toDate(), this);
	};
};
function cr(e) {
	return e.toLowerCase().startsWith("fa");
}
function lr(e) {
	return e.replace(/\d/g, (e) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(e, 10)] ?? e);
}
Bn.default.extend(sr), Bn.default.extend(Vn.default);
function ur(e, t, n = "—") {
	if (e == null || e === "") return n;
	let r = typeof e == "number" ? Bn.default.unix(e) : (0, Bn.default)(e);
	if (!r.isValid()) return n;
	if (cr(t)) {
		let e = f.t("date.timeSeparator");
		return lr(r.calendar("jalali").locale("fa").format(`D MMMM YYYY${e}HH:mm`));
	}
	return r.locale("en").format("YYYY-MM-DD HH:mm");
}
//#endregion
//#region ../Modules/digikala-sellers-module/client/pages/digikala/DigikalaHomePage.tsx
var dr = [
	"digikala.howto.step1",
	"digikala.howto.step2",
	"digikala.howto.step3",
	"digikala.howto.step4",
	"digikala.howto.step5",
	"digikala.howto.step6"
], fr = [
	"variant_status",
	"order_shipping_status",
	"package_status",
	"commission",
	"product_upsert",
	"brand_request",
	"warranty_request",
	"color_request",
	"size_request",
	"order_finalized",
	"order_item_cancelled",
	"order_returned"
], pr = {
	variant_status: "تغییر وضعیت تنوع کالایی",
	order_shipping_status: "تغییر وضعیت ارسال سفارش",
	package_status: "تغییر وضعیت محموله ها",
	commission: "تغییر در کمیسیون ها",
	product_upsert: "ساخت و ویرایش محصول",
	brand_request: "درخواست برند",
	warranty_request: "درخواست گارانتی",
	color_request: "درخواست رنگ",
	size_request: "درخواست سایز",
	order_finalized: "نهایی شدن سفارش",
	order_item_cancelled: "لغو آیتم سفارش",
	order_returned: "مرجوعی سفارش"
};
function mr(e) {
	let t = {};
	for (let e of fr) t[e] = !0;
	if (!e || typeof e != "object") return t;
	for (let n of fr) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = !!e[n]);
	return t;
}
function hr() {
	let { t: r, i18n: f } = c(), p = n(), [m, h] = o(""), [g, _] = o(""), [v, y] = o(() => mr(null)), b = t({
		queryKey: ["digikala", "keys"],
		queryFn: () => Y("digikala/keys")
	}), x = t({
		queryKey: ["digikala", "auth"],
		queryFn: () => Y("digikala/auth/status")
	}), S = t({
		queryKey: ["digikala", "settings"],
		queryFn: () => Y("digikala/settings")
	});
	i(() => {
		let e = S.data?.settings?.client_code;
		typeof e == "string" && _(e), y(mr(S.data?.settings?.webhook_events));
	}, [S.data?.settings?.client_code, S.data?.settings?.webhook_events]);
	let C = e({
		mutationFn: () => Y("digikala/keys/generate", { method: "POST" }, 12e4),
		onSuccess: async (e) => {
			l.success(e.message ?? r("digikala.keysGenerated")), await p.invalidateQueries({ queryKey: ["digikala"] });
		},
		onError: (e) => J(r, e)
	}), w = e({
		mutationFn: () => Y("digikala/token/issue", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ encrypted_code: m })
		}),
		onSuccess: async () => {
			l.success(r("digikala.tokenIssued")), h(""), await p.invalidateQueries({ queryKey: ["digikala"] });
		},
		onError: (e) => J(r, e)
	}), T = e({
		mutationFn: () => Y("digikala/test-connection", { method: "POST" }),
		onSuccess: () => l.success(r("digikala.connectionOk")),
		onError: (e) => J(r, e)
	}), E = e({
		mutationFn: (e) => Y("digikala/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(e)
		}),
		onSuccess: async () => {
			l.success(r("digikala.settingsSaved")), await p.invalidateQueries({ queryKey: ["digikala", "settings"] });
		},
		onError: (e) => J(r, e)
	}), D = b.data?.public_key ?? "", O = typeof S.data?.settings?.webhook_url == "string" ? S.data.settings.webhook_url : "", ee = S.data?.settings?.webhook_event_labels, te = a(() => {
		let e = { ...pr };
		if (ee && typeof ee == "object") for (let [t, n] of Object.entries(ee)) typeof n == "string" && n && (e[t] = n);
		return e;
	}, [ee]), k = x.data ?? S.data?.auth, A = !!k?.connected;
	return /* @__PURE__ */ d(dn, {
		title: r("digikala.title"),
		description: r("digikala.subtitle"),
		children: [
			/* @__PURE__ */ d("div", {
				className: "mb-4 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ u(H, {
						asChild: !0,
						variant: "secondary",
						children: /* @__PURE__ */ u(s, {
							to: "/settings/shop/digikala/products",
							children: r("digikala.nav.products")
						})
					}),
					/* @__PURE__ */ u(H, {
						asChild: !0,
						variant: "secondary",
						children: /* @__PURE__ */ u(s, {
							to: "/settings/shop/digikala/orders",
							children: r("digikala.nav.orders")
						})
					}),
					/* @__PURE__ */ u(H, {
						asChild: !0,
						variant: "secondary",
						children: /* @__PURE__ */ u(s, {
							to: "/settings/shop/digikala/jobs",
							children: r("digikala.nav.jobs")
						})
					}),
					/* @__PURE__ */ u(H, {
						asChild: !0,
						variant: "secondary",
						children: /* @__PURE__ */ u(s, {
							to: "/settings/shop/digikala/settings",
							children: r("digikala.nav.settings")
						})
					}),
					/* @__PURE__ */ u(H, {
						asChild: !0,
						variant: "secondary",
						children: /* @__PURE__ */ u(s, {
							to: "/settings/shop/digikala/logs",
							children: r("digikala.nav.logs")
						})
					})
				]
			}),
			/* @__PURE__ */ u(U, {
				className: "mb-4 border-primary/20",
				children: /* @__PURE__ */ d(K, {
					className: "flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ d("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ d("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ u("span", {
									className: "text-muted-foreground text-sm",
									children: r("digikala.authStatus")
								}),
								/* @__PURE__ */ u(nn, {
									variant: A ? "default" : "destructive",
									className: A ? "bg-emerald-600 hover:bg-emerald-600" : "",
									children: r(A ? "digikala.connectedShort" : "digikala.disconnectedShort")
								}),
								k?.has_refresh ? /* @__PURE__ */ u(on, {
									status: r("digikala.hasRefresh"),
									tone: "secondary"
								}) : null
							]
						}), /* @__PURE__ */ u(sn, {
							rows: [{
								label: r("digikala.accessExpires"),
								value: k?.access_expires_at ? ur(k.access_expires_at, f.language) : "—"
							}, {
								label: r("digikala.refreshExpires"),
								value: k?.refresh_expires_at ? ur(k.refresh_expires_at, f.language) : "—"
							}],
							className: "max-w-md"
						})]
					}), /* @__PURE__ */ u(H, {
						className: A ? "bg-emerald-600 hover:bg-emerald-700" : "",
						variant: A ? "default" : "destructive",
						onClick: () => T.mutate(),
						disabled: T.isPending,
						children: r("digikala.testConnection")
					})]
				})
			}),
			/* @__PURE__ */ d(U, {
				className: "mb-4",
				children: [/* @__PURE__ */ d(W, { children: [/* @__PURE__ */ u(G, { children: r("digikala.howtoTitle") }), /* @__PURE__ */ u(mn, { children: r("digikala.howtoSubtitle") })] }), /* @__PURE__ */ d(K, { children: [/* @__PURE__ */ u("ol", {
					className: "text-muted-foreground list-decimal space-y-1.5 pe-5 text-sm leading-relaxed",
					children: dr.map((e) => /* @__PURE__ */ u("li", { children: r(e) }, e))
				}), /* @__PURE__ */ u("p", {
					className: "text-muted-foreground mt-3 text-xs leading-relaxed",
					children: r("digikala.howtoClientCodeNote")
				})] })]
			}),
			/* @__PURE__ */ d("div", {
				className: "mb-4 grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ d(U, { children: [/* @__PURE__ */ d(W, { children: [/* @__PURE__ */ u(G, { children: r("digikala.clientCodeOptional") }), /* @__PURE__ */ u(mn, { children: r("digikala.clientCodeHint") })] }), /* @__PURE__ */ u(K, {
					className: "space-y-3",
					children: /* @__PURE__ */ d("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ u(hn, {
							value: g,
							onChange: (e) => _(e.target.value),
							placeholder: r("digikala.clientCodePlaceholder"),
							className: "max-w-xs font-mono text-sm"
						}), /* @__PURE__ */ u(H, {
							variant: "secondary",
							disabled: E.isPending,
							onClick: () => E.mutate({ client_code: g.trim() }),
							children: r("digikala.saveClientCode")
						})]
					})
				})] }), /* @__PURE__ */ d(U, { children: [/* @__PURE__ */ d(W, { children: [/* @__PURE__ */ u(G, { children: r("digikala.webhookCardTitle") }), /* @__PURE__ */ u(mn, { children: r("digikala.webhookCardHint") })] }), /* @__PURE__ */ d(K, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ u("code", {
							className: "bg-muted block overflow-x-auto rounded-md p-3 text-xs",
							children: O || r("digikala.webhookUrlPending")
						}),
						/* @__PURE__ */ u(H, {
							type: "button",
							variant: "outline",
							disabled: !O,
							onClick: () => {
								navigator.clipboard.writeText(O), l.success(r("digikala.copied"));
							},
							children: r("digikala.copyWebhook")
						}),
						/* @__PURE__ */ u("p", {
							className: "text-muted-foreground text-xs leading-relaxed",
							children: r("digikala.webhookHttpsNote")
						})
					]
				})] })]
			}),
			/* @__PURE__ */ d(U, {
				className: "mb-4",
				children: [/* @__PURE__ */ d(W, { children: [/* @__PURE__ */ u(G, { children: r("digikala.webhookEventsTitle") }), /* @__PURE__ */ u(mn, { children: r("digikala.webhookEventsHint") })] }), /* @__PURE__ */ d(K, {
					className: "space-y-4",
					children: [/* @__PURE__ */ u("ul", {
						className: "divide-border divide-y",
						children: fr.map((e) => /* @__PURE__ */ d("li", {
							className: "flex items-center justify-between gap-3 py-3",
							children: [/* @__PURE__ */ d("div", { children: [/* @__PURE__ */ u("p", {
								className: "text-sm font-medium",
								children: te[e] ?? e
							}), /* @__PURE__ */ u("p", {
								className: "text-muted-foreground font-mono text-[11px]",
								children: e
							})] }), /* @__PURE__ */ u(gn, {
								checked: v[e] !== !1,
								onCheckedChange: (t) => y((n) => ({
									...n,
									[e]: t
								}))
							})]
						}, e))
					}), /* @__PURE__ */ u(H, {
						disabled: E.isPending,
						onClick: () => E.mutate({ webhook_events: v }),
						children: r("digikala.saveWebhookEvents")
					})]
				})]
			}),
			/* @__PURE__ */ d("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ d(U, { children: [/* @__PURE__ */ d(W, { children: [/* @__PURE__ */ u(G, { children: r("digikala.rsaTitle") }), /* @__PURE__ */ u(mn, { children: r("digikala.rsaHint") })] }), /* @__PURE__ */ d(K, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ u(H, {
							onClick: () => C.mutate(),
							disabled: C.isPending,
							children: r("digikala.generateKeys")
						}),
						/* @__PURE__ */ u("p", {
							className: "text-muted-foreground text-xs",
							children: b.data?.has_private_key ? r("digikala.privateStored") : r("digikala.noPrivate")
						}),
						/* @__PURE__ */ u("label", {
							className: "text-sm font-medium",
							children: r("digikala.publicKey")
						}),
						/* @__PURE__ */ u(_n, {
							readOnly: !0,
							rows: 5,
							value: D,
							className: "font-mono text-xs"
						}),
						/* @__PURE__ */ u(H, {
							type: "button",
							variant: "outline",
							disabled: !D,
							onClick: () => {
								navigator.clipboard.writeText(D), l.success(r("digikala.copied"));
							},
							children: r("digikala.copyPublic")
						})
					]
				})] }), /* @__PURE__ */ d(U, { children: [/* @__PURE__ */ d(W, { children: [/* @__PURE__ */ u(G, { children: r("digikala.tokenTitle") }), /* @__PURE__ */ u(mn, { children: r("digikala.tokenHint") })] }), /* @__PURE__ */ d(K, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ u(_n, {
							rows: 4,
							value: m,
							onChange: (e) => h(e.target.value),
							placeholder: r("digikala.encryptedPlaceholder"),
							className: "font-mono text-xs"
						}),
						/* @__PURE__ */ u("p", {
							className: "text-muted-foreground text-xs leading-relaxed",
							children: r("digikala.encryptedDoNotDecrypt")
						}),
						/* @__PURE__ */ u(H, {
							onClick: () => w.mutate(),
							disabled: w.isPending || !m.trim(),
							children: r("digikala.issueToken")
						})
					]
				})] })]
			})
		]
	});
}
//#endregion
//#region src/components/ui/label.tsx
function gr({ className: e, ...t }) {
	return /* @__PURE__ */ u(me, {
		"data-slot": "label",
		className: V("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/components/ui/table.tsx
function _r({ className: e, ...t }) {
	return /* @__PURE__ */ u("div", {
		"data-slot": "table-container",
		className: "relative w-full overflow-x-auto",
		children: /* @__PURE__ */ u("table", {
			"data-slot": "table",
			className: V("w-full caption-bottom text-sm", e),
			...t
		})
	});
}
function vr({ className: e, ...t }) {
	return /* @__PURE__ */ u("thead", {
		"data-slot": "table-header",
		className: V("[&_tr]:border-b", e),
		...t
	});
}
function yr({ className: e, ...t }) {
	return /* @__PURE__ */ u("tbody", {
		"data-slot": "table-body",
		className: V("[&_tr:last-child]:border-0", e),
		...t
	});
}
function br({ className: e, ...t }) {
	return /* @__PURE__ */ u("tr", {
		"data-slot": "table-row",
		className: V("border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted", e),
		...t
	});
}
function Q({ className: e, ...t }) {
	return /* @__PURE__ */ u("th", {
		"data-slot": "table-head",
		className: V("h-10 px-2 text-start align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]", e),
		...t
	});
}
function $({ className: e, ...t }) {
	return /* @__PURE__ */ u("td", {
		"data-slot": "table-cell",
		className: V("p-2 text-start align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]", e),
		...t
	});
}
//#endregion
//#region ../Modules/digikala-sellers-module/client/pages/digikala/DigikalaProductsPage.tsx
function xr() {
	let { t: r } = c(), i = n(), [a, f] = o(""), [p, m] = o(""), h = e({
		mutationFn: (e) => Y(e, {
			method: "POST",
			body: "{}"
		}),
		onSuccess: async () => {
			l.success(r("digikala.jobQueued")), await i.invalidateQueries({ queryKey: ["digikala", "jobs"] });
		},
		onError: (e) => J(r, e)
	}), g = t({
		queryKey: ["digikala", "jobs"],
		queryFn: () => Y("digikala/jobs")
	}), _ = t({
		queryKey: ["digikala", "mapped"],
		queryFn: () => Y("digikala/products/mapped")
	}), v = e({
		mutationFn: () => Y(`digikala/products/${Number(a) || 0}/map`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ dkp: p })
		}),
		onSuccess: async () => {
			l.success(r("digikala.dkpMapped")), m(""), await i.invalidateQueries({ queryKey: ["digikala", "mapped"] });
		},
		onError: (e) => J(r, e)
	}), y = e({
		mutationFn: (e) => Y(`digikala/products/${e.wc_product_id}/sync`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ variation_id: e.wc_variation_id })
		}),
		onSuccess: () => l.success(r("digikala.syncQueued")),
		onError: (e) => J(r, e)
	}), b = _.data?.items ?? [];
	return /* @__PURE__ */ d(dn, {
		title: r("digikala.productsTitle"),
		description: r("digikala.productsSubtitle"),
		children: [
			/* @__PURE__ */ d(U, {
				className: "mb-4",
				children: [/* @__PURE__ */ u(W, { children: /* @__PURE__ */ u(G, { children: r("digikala.productActions") }) }), /* @__PURE__ */ d(K, {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ u(H, {
							onClick: () => h.mutate("digikala/sync/products/import"),
							children: r("digikala.importProducts")
						}),
						/* @__PURE__ */ u(H, {
							variant: "secondary",
							onClick: () => h.mutate("digikala/sync/products/export"),
							children: r("digikala.exportProducts")
						}),
						/* @__PURE__ */ u(H, {
							variant: "outline",
							onClick: () => h.mutate("digikala/sync/inventory"),
							children: r("digikala.syncInventory")
						})
					]
				})]
			}),
			/* @__PURE__ */ d(U, {
				className: "mb-4",
				children: [/* @__PURE__ */ u(W, { children: /* @__PURE__ */ u(G, { children: r("digikala.mapDkpTitle") }) }), /* @__PURE__ */ d(K, {
					className: "flex flex-wrap items-end gap-2",
					children: [
						/* @__PURE__ */ d("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ u(gr, {
								className: "text-xs",
								children: r("digikala.wcProductId")
							}), /* @__PURE__ */ u(hn, {
								value: a,
								onChange: (e) => f(e.target.value),
								className: "w-32",
								dir: "ltr"
							})]
						}),
						/* @__PURE__ */ d("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ u(gr, {
								className: "text-xs",
								children: r("digikala.dkpCode")
							}), /* @__PURE__ */ u(hn, {
								value: p,
								onChange: (e) => m(e.target.value),
								placeholder: "DKP-10252314",
								className: "w-48",
								dir: "ltr"
							})]
						}),
						/* @__PURE__ */ u(H, {
							onClick: () => void v.mutateAsync(),
							disabled: !a || !p || v.isPending,
							children: r("digikala.findVariants")
						})
					]
				})]
			}),
			/* @__PURE__ */ d(U, {
				className: "mb-4",
				children: [/* @__PURE__ */ u(W, { children: /* @__PURE__ */ u(G, { children: r("digikala.mappedProducts") }) }), /* @__PURE__ */ u(K, { children: /* @__PURE__ */ d(_r, { children: [/* @__PURE__ */ u(vr, { children: /* @__PURE__ */ d(br, { children: [
					/* @__PURE__ */ u(Q, { children: r("products.colName") }),
					/* @__PURE__ */ u(Q, { children: r("digikala.dkpCode") }),
					/* @__PURE__ */ u(Q, { children: r("wnc.remoteVariantId") }),
					/* @__PURE__ */ u(Q, { children: r("wnc.lastSync") }),
					/* @__PURE__ */ u(Q, {})
				] }) }), /* @__PURE__ */ u(yr, { children: b.length === 0 ? /* @__PURE__ */ u(br, { children: /* @__PURE__ */ u($, {
					colSpan: 5,
					className: "text-muted-foreground p-6 text-center text-sm",
					children: r("common.empty")
				}) }) : b.map((e) => /* @__PURE__ */ d(br, { children: [
					/* @__PURE__ */ d($, { children: [/* @__PURE__ */ u(s, {
						to: `/shop/products/${e.wc_product_id}`,
						className: "hover:underline",
						children: e.name || `#${e.wc_product_id}`
					}), e.wc_variation_id > 0 ? /* @__PURE__ */ d("span", {
						className: "text-muted-foreground text-xs",
						children: [" · #", e.wc_variation_id]
					}) : null] }),
					/* @__PURE__ */ u($, {
						className: "font-mono text-xs",
						dir: "ltr",
						children: e.dk_product_id ? `DKP-${e.dk_product_id}` : "—"
					}),
					/* @__PURE__ */ u($, {
						className: "font-mono text-xs",
						children: e.dk_variant_id || "—"
					}),
					/* @__PURE__ */ u($, {
						className: "text-muted-foreground text-xs",
						children: e.last_sync_at || "—"
					}),
					/* @__PURE__ */ u($, { children: /* @__PURE__ */ u(H, {
						size: "sm",
						variant: "outline",
						disabled: y.isPending || !e.dk_variant_id,
						onClick: () => void y.mutateAsync(e),
						children: r("digikala.syncPriceStock")
					}) })
				] }, `${e.wc_product_id}-${e.wc_variation_id}`)) })] }) })]
			}),
			/* @__PURE__ */ d(U, { children: [/* @__PURE__ */ u(W, { children: /* @__PURE__ */ u(G, { children: r("digikala.recentJobs") }) }), /* @__PURE__ */ u(K, { children: /* @__PURE__ */ u(cn, {
				jobs: g.data?.jobs ?? [],
				emptyLabel: r("common.empty"),
				typeLabel: r("digikala.col.type", "Type"),
				statusLabel: r("digikala.col.status", "Status"),
				errorLabel: r("digikala.col.error", "Error")
			}) })] })
		]
	});
}
//#endregion
//#region src/components/orders/DigikalaOrderActions.tsx
function Sr(e, t) {
	return t ? e(`digikala.nativeStatus.${t}`, { defaultValue: t }) : "";
}
function Cr({ orderId: t, order: r, onDone: i }) {
	let { t: a } = c(), s = n(), [f, p] = o(""), m = r.digikala_fulfillment || "digikala", h = m === "seller", g = e({
		mutationFn: () => Y(`digikala/orders/${t}/cancel`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ cancellation_reason_id: -1 })
		}),
		onSuccess: () => {
			l.success(a("digikala.cancelQueued")), i(), s.invalidateQueries({ queryKey: ["order", t] });
		},
		onError: (e) => J(a, e)
	}), _ = e({
		mutationFn: (e) => Y(`digikala/orders/${t}/sbs-status`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				action: e,
				verification_code: f
			})
		}),
		onSuccess: () => {
			l.success(a("digikala.statusPushed")), i(), s.invalidateQueries({ queryKey: ["order", t] });
		},
		onError: (e) => J(a, e)
	});
	return /* @__PURE__ */ d("div", {
		className: "space-y-3 rounded-md border border-border/70 p-3",
		children: [
			/* @__PURE__ */ d("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ u("p", {
					className: "text-sm font-medium",
					children: a("digikala.orderActions")
				}), /* @__PURE__ */ d("p", {
					className: "text-muted-foreground text-xs",
					children: [
						a("digikala.fulfillment"),
						":           ",
						a(`digikala.fulfillment.${m}`, { defaultValue: m }),
						r.digikala_native_status || r.remote_status ? ` · ${Sr(a, r.digikala_native_status || r.remote_status)}` : ""
					]
				})]
			}),
			h ? /* @__PURE__ */ d("div", {
				className: "flex flex-wrap items-end gap-2",
				children: [
					/* @__PURE__ */ d("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ u(gr, {
							className: "text-xs",
							children: a("digikala.verificationCode")
						}), /* @__PURE__ */ u(hn, {
							value: f,
							onChange: (e) => p(e.target.value),
							className: "w-32",
							dir: "ltr"
						})]
					}),
					/* @__PURE__ */ u(H, {
						type: "button",
						size: "sm",
						variant: "secondary",
						disabled: _.isPending,
						onClick: () => void _.mutateAsync("processing"),
						children: a("digikala.sbs.processing")
					}),
					/* @__PURE__ */ u(H, {
						type: "button",
						size: "sm",
						variant: "secondary",
						disabled: _.isPending,
						onClick: () => void _.mutateAsync("processed"),
						children: a("digikala.sbs.processed")
					}),
					/* @__PURE__ */ u(H, {
						type: "button",
						size: "sm",
						disabled: _.isPending,
						onClick: () => void _.mutateAsync("full_delivered_to_customer"),
						children: a("digikala.sbs.delivered")
					})
				]
			}) : /* @__PURE__ */ u("p", {
				className: "text-muted-foreground text-xs",
				children: a("digikala.warehouseHint")
			}),
			/* @__PURE__ */ u(H, {
				type: "button",
				size: "sm",
				variant: "destructive",
				disabled: g.isPending,
				onClick: () => void g.mutateAsync(),
				children: a("digikala.cancelItem")
			})
		]
	});
}
//#endregion
//#region ../Modules/digikala-sellers-module/client/pages/digikala/DigikalaOrdersPage.tsx
function wr() {
	let { t: r } = c(), i = n(), a = e({
		mutationFn: () => Y("digikala/sync/orders/pull", {
			method: "POST",
			body: "{}"
		}),
		onSuccess: async () => {
			l.success(r("digikala.ordersPullQueued")), await i.invalidateQueries({ queryKey: ["orders"] }), await i.invalidateQueries({ queryKey: ["digikala"] });
		},
		onError: (e) => J(r, e)
	}), o = t({
		queryKey: ["orders", "digikala"],
		queryFn: () => Y("shop/orders?marketplace=digikala&per_page=50&orderby=date&order=desc")
	}).data?.items ?? [];
	return /* @__PURE__ */ d(dn, {
		title: r("digikala.ordersTitle"),
		description: r("digikala.ordersSubtitle"),
		children: [/* @__PURE__ */ d(U, {
			className: "mb-4",
			children: [/* @__PURE__ */ u(W, { children: /* @__PURE__ */ u(G, { children: r("digikala.pullOrders") }) }), /* @__PURE__ */ u(K, { children: /* @__PURE__ */ u(H, {
				onClick: () => a.mutate(),
				disabled: a.isPending,
				children: r("digikala.pullOrders")
			}) })]
		}), /* @__PURE__ */ d(U, { children: [/* @__PURE__ */ u(W, { children: /* @__PURE__ */ u(G, { children: r("digikala.wcOrders") }) }), /* @__PURE__ */ u(K, { children: /* @__PURE__ */ d(_r, { children: [/* @__PURE__ */ u(vr, { children: /* @__PURE__ */ d(br, { children: [
			/* @__PURE__ */ u(Q, { children: r("orders.colNumber") }),
			/* @__PURE__ */ u(Q, { children: r("orders.marketplaceRemoteId") }),
			/* @__PURE__ */ u(Q, { children: r("orders.colStatus") }),
			/* @__PURE__ */ u(Q, { children: r("digikala.nativeStatusLabel") }),
			/* @__PURE__ */ u(Q, { children: r("digikala.fulfillment") }),
			/* @__PURE__ */ u(Q, {})
		] }) }), /* @__PURE__ */ u(yr, { children: o.length === 0 ? /* @__PURE__ */ u(br, { children: /* @__PURE__ */ u($, {
			colSpan: 6,
			className: "text-muted-foreground p-6 text-center text-sm",
			children: r("common.empty")
		}) }) : o.map((e) => /* @__PURE__ */ d(br, { children: [
			/* @__PURE__ */ u($, { children: /* @__PURE__ */ d(s, {
				to: `/orders/list/${e.id}`,
				className: "text-primary font-medium hover:underline",
				children: ["#", e.number]
			}) }),
			/* @__PURE__ */ u($, {
				className: "font-mono text-xs",
				children: e.remote_order_id || "—"
			}),
			/* @__PURE__ */ u($, {
				className: "text-sm",
				children: e.status
			}),
			/* @__PURE__ */ u($, {
				className: "text-sm",
				children: r(`digikala.nativeStatus.${e.remote_status || "active"}`, e.remote_status || "—")
			}),
			/* @__PURE__ */ u($, {
				className: "text-sm",
				children: r(`digikala.fulfillment.${e.digikala_fulfillment || "digikala"}`, e.digikala_fulfillment || "—")
			}),
			/* @__PURE__ */ u($, { children: /* @__PURE__ */ u(Cr, {
				orderId: e.id,
				order: {
					marketplace: "digikala",
					digikala_fulfillment: e.digikala_fulfillment,
					digikala_native_status: e.remote_status,
					remote_status: e.remote_status,
					remote_order_id: e.remote_order_id,
					status: e.status
				},
				onDone: () => void i.invalidateQueries({ queryKey: ["orders", "digikala"] })
			}) })
		] }, e.id)) })] }) })] })]
	});
}
//#endregion
//#region ../Modules/digikala-sellers-module/client/pages/digikala/DigikalaJobsPage.tsx
function Tr() {
	let { t: e } = c(), n = t({
		queryKey: [
			"digikala",
			"jobs",
			"page"
		],
		queryFn: () => Y("digikala/jobs"),
		refetchInterval: 5e3
	}).data?.jobs ?? [];
	return /* @__PURE__ */ u(dn, {
		title: e("digikala.jobsTitle"),
		description: e("digikala.jobsSubtitle"),
		children: /* @__PURE__ */ d(U, { children: [/* @__PURE__ */ u(W, { children: /* @__PURE__ */ u(G, { children: e("digikala.jobsTitle") }) }), /* @__PURE__ */ u(K, { children: /* @__PURE__ */ u(cn, {
			jobs: n,
			emptyLabel: e("common.empty"),
			typeLabel: e("digikala.col.type", "Type"),
			statusLabel: e("digikala.col.status", "Status"),
			errorLabel: e("digikala.col.error", "Error")
		}) })] })
	});
}
//#endregion
//#region ../Modules/digikala-sellers-module/client/pages/digikala/DigikalaSettingsPageFull.tsx
function Er() {
	let { t: r } = c(), i = n(), a = t({
		queryKey: ["digikala", "settings"],
		queryFn: () => Y("digikala/settings")
	}).data?.settings ?? {}, o = e({
		mutationFn: (e) => Y("digikala/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(e)
		}),
		onSuccess: async () => {
			l.success(r("digikala.settingsSaved")), await i.invalidateQueries({ queryKey: ["digikala", "settings"] });
		},
		onError: (e) => J(r, e)
	});
	return /* @__PURE__ */ u(dn, {
		title: r("digikala.settingsTitle"),
		description: r("digikala.settingsSubtitle"),
		children: /* @__PURE__ */ d(U, { children: [/* @__PURE__ */ u(W, { children: /* @__PURE__ */ u(G, { children: r("digikala.settingsTitle") }) }), /* @__PURE__ */ d(K, {
			className: "grid max-w-xl gap-4",
			children: [
				/* @__PURE__ */ d("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ u("label", {
						className: "text-sm font-medium",
						htmlFor: "dk-base",
						children: r("digikala.baseUrl")
					}), /* @__PURE__ */ u(hn, {
						defaultValue: String(a.base_url ?? ""),
						placeholder: "https://seller.digikala.com",
						id: "dk-base",
						onBlur: (e) => o.mutate({ base_url: e.target.value })
					}, `base-${String(a.base_url ?? "")}`)]
				}),
				/* @__PURE__ */ d("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ u("label", {
							className: "text-sm font-medium",
							htmlFor: "dk-client",
							children: r("digikala.clientCodeOptional")
						}),
						/* @__PURE__ */ u(mn, {
							className: "text-xs",
							children: r("digikala.clientCodeHint")
						}),
						/* @__PURE__ */ u(hn, {
							defaultValue: String(a.client_code ?? ""),
							placeholder: r("digikala.clientCodePlaceholder"),
							id: "dk-client",
							onBlur: (e) => o.mutate({ client_code: e.target.value })
						}, `client-${String(a.client_code ?? "")}`)
					]
				}),
				/* @__PURE__ */ d("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ u("label", {
						className: "text-sm font-medium",
						htmlFor: "dk-credit",
						children: r("digikala.creditIncrease")
					}), /* @__PURE__ */ u(hn, {
						type: "number",
						defaultValue: String(a.credit_increase_percentage ?? 0),
						id: "dk-credit",
						onBlur: (e) => o.mutate({ credit_increase_percentage: Number(e.target.value) || 0 })
					}, `credit-${String(a.credit_increase_percentage ?? 0)}`)]
				}),
				typeof a.webhook_url == "string" && a.webhook_url ? /* @__PURE__ */ d("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ u("label", {
						className: "text-sm font-medium",
						children: r("digikala.webhookUrl")
					}), /* @__PURE__ */ u("code", {
						className: "bg-muted block overflow-x-auto rounded-md p-2 text-xs",
						children: a.webhook_url
					})]
				}) : null,
				/* @__PURE__ */ u(H, {
					variant: a.auto_sync ? "default" : "outline",
					onClick: () => o.mutate({ auto_sync: !a.auto_sync }),
					children: r("digikala.autoSync")
				})
			]
		})] })
	});
}
//#endregion
//#region ../Modules/digikala-sellers-module/client/pages/digikala/DigikalaLogsPage.tsx
function Dr() {
	let { t: e } = c(), n = t({
		queryKey: ["digikala", "logs"],
		queryFn: () => Y("digikala/logs")
	}), r = t({
		queryKey: ["digikala", "coverage"],
		queryFn: () => Y("digikala/coverage")
	}), i = n.data?.items ?? n.data?.logs ?? [];
	return /* @__PURE__ */ d(dn, {
		title: e("digikala.logsTitle"),
		description: e("digikala.logsSubtitle"),
		children: [/* @__PURE__ */ d(U, {
			className: "mb-4",
			children: [/* @__PURE__ */ u(W, { children: /* @__PURE__ */ u(G, { children: e("digikala.coverage") }) }), /* @__PURE__ */ u(K, { children: /* @__PURE__ */ u(ln, {
				data: r.data,
				emptyLabel: e("common.empty")
			}) })]
		}), /* @__PURE__ */ d(U, { children: [/* @__PURE__ */ u(W, { children: /* @__PURE__ */ u(G, { children: e("digikala.logsTitle") }) }), /* @__PURE__ */ u(K, { children: /* @__PURE__ */ u(un, {
			items: i,
			emptyLabel: e("common.empty")
		}) })] })]
	});
}
//#endregion
//#region ../Modules/digikala-sellers-module/client/module-entry.tsx
var Or = {
	"settings/shop/digikala": hr,
	"settings/shop/digikala/products": xr,
	"settings/shop/digikala/orders": wr,
	"settings/shop/digikala/jobs": Tr,
	"settings/shop/digikala/settings": Er,
	"settings/shop/digikala/logs": Dr,
	"settings/shop/digikala/sync": xr
}, kr = { routes: Or };
//#endregion
export { kr as default, Or as routes };
