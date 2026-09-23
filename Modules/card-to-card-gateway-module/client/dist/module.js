import { useMutation as e, useQuery as t, useQueryClient as n } from "@tanstack/react-query";
import { useTranslation as r } from "react-i18next";
import { toast as i } from "sonner";
import { jsx as a, jsxs as o } from "react/jsx-runtime";
import * as s from "react";
import { createContext as c, createElement as l, forwardRef as u, useContext as d, useEffect as f, useState as p } from "react";
import "react-dom";
//#region src/components/PageShell.tsx
function m({ title: e, description: t, eyebrow: n, children: r }) {
	return /* @__PURE__ */ o("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ o("header", {
			className: "min-w-0 space-y-1.5",
			children: [
				n ? /* @__PURE__ */ a("p", {
					className: "text-muted-foreground text-xs font-medium tracking-wide uppercase",
					children: n
				}) : null,
				/* @__PURE__ */ a("h1", {
					className: "text-xl font-semibold tracking-tight sm:text-2xl",
					children: e
				}),
				t ? /* @__PURE__ */ a("p", {
					className: "text-muted-foreground max-w-2xl text-sm leading-relaxed",
					children: t
				}) : null
			]
		}), r]
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function h(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") if (Array.isArray(e)) {
		var i = e.length;
		for (t = 0; t < i; t++) e[t] && (n = h(e[t])) && (r && (r += " "), r += n);
	} else for (n in e) e[n] && (r && (r += " "), r += n);
	return r;
}
function g() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = h(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/class-variance-authority/dist/index.mjs
var _ = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, v = g, y = (e, t) => (n) => {
	if (t?.variants == null) return v(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = _(t) || _(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return v(e, a, t?.compoundVariants?.reduce((e, t) => {
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
function b(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function x(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = b(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : b(e[t], null);
			}
		};
	};
}
function S(...e) {
	return s.useCallback(x(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function ee(e) {
	let t = /* @__PURE__ */ C(e), n = s.forwardRef((e, n) => {
		let { children: r, ...i } = e, o = s.Children.toArray(r), c = o.find(te);
		if (c) {
			let e = c.props.children, r = o.map((t) => t === c ? s.Children.count(e) > 1 ? s.Children.only(null) : s.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ a(t, {
				...i,
				ref: n,
				children: s.isValidElement(e) ? s.cloneElement(e, void 0, r) : null
			});
		}
		return /* @__PURE__ */ a(t, {
			...i,
			ref: n,
			children: r
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function C(e) {
	let t = s.forwardRef((e, t) => {
		let { children: n, ...r } = e;
		if (s.isValidElement(n)) {
			let e = T(n), i = ne(r, n.props);
			return n.type !== s.Fragment && (i.ref = t ? x(t, e) : e), s.cloneElement(n, i);
		}
		return s.Children.count(n) > 1 ? s.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var w = Symbol("radix.slottable");
function te(e) {
	return s.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === w;
}
function ne(e, t) {
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
function T(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/dist/index.mjs
var E = [
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
	let n = /* @__PURE__ */ ee(`Primitive.${t}`), r = s.forwardRef((e, r) => {
		let { asChild: i, ...o } = e, s = i ? n : t;
		return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ a(s, {
			...o,
			ref: r
		});
	});
	return r.displayName = `Primitive.${t}`, {
		...e,
		[t]: r
	};
}, {});
//#endregion
//#region node_modules/@radix-ui/react-context/dist/index.mjs
function re(e, t = []) {
	let n = [];
	function r(t, r) {
		let i = s.createContext(r), o = n.length;
		n = [...n, r];
		let c = (t) => {
			let { scope: n, children: r, ...c } = t, l = n?.[e]?.[o] || i, u = s.useMemo(() => c, Object.values(c));
			return /* @__PURE__ */ a(l.Provider, {
				value: u,
				children: r
			});
		};
		c.displayName = t + "Provider";
		function l(n, a) {
			let c = a?.[e]?.[o] || i, l = s.useContext(c);
			if (l) return l;
			if (r !== void 0) return r;
			throw Error(`\`${n}\` must be used within \`${t}\``);
		}
		return [c, l];
	}
	let i = () => {
		let t = n.map((e) => s.createContext(e));
		return function(n) {
			let r = n?.[e] || t;
			return s.useMemo(() => ({ [`__scope${e}`]: {
				...n,
				[e]: r
			} }), [n, r]);
		};
	};
	return i.scopeName = e, [r, D(i, ...t)];
}
function D(...e) {
	let t = e[0];
	if (e.length === 1) return t;
	let n = () => {
		let n = e.map((e) => ({
			useScope: e(),
			scopeName: e.scopeName
		}));
		return function(e) {
			let r = n.reduce((t, { useScope: n, scopeName: r }) => {
				let i = n(e)[`__scope${r}`];
				return {
					...t,
					...i
				};
			}, {});
			return s.useMemo(() => ({ [`__scope${t.scopeName}`]: r }), [r]);
		};
	};
	return n.scopeName = t.scopeName, n;
}
typeof window < "u" && window.document && window.document.createElement;
function O(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var k = globalThis?.document ? s.useLayoutEffect : () => {}, ie = s.useInsertionEffect || k;
function ae({ prop: e, defaultProp: t, onChange: n = () => {}, caller: r }) {
	let [i, a, o] = A({
		defaultProp: t,
		onChange: n
	}), c = e !== void 0, l = c ? e : i;
	{
		let t = s.useRef(e !== void 0);
		s.useEffect(() => {
			let e = t.current;
			e !== c && console.warn(`${r} is changing from ${e ? "controlled" : "uncontrolled"} to ${c ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`), t.current = c;
		}, [c, r]);
	}
	return [l, s.useCallback((t) => {
		if (c) {
			let n = oe(t) ? t(e) : t;
			n !== e && o.current?.(n);
		} else a(t);
	}, [
		c,
		e,
		a,
		o
	])];
}
function A({ defaultProp: e, onChange: t }) {
	let [n, r] = s.useState(e), i = s.useRef(n), a = s.useRef(t);
	return ie(() => {
		a.current = t;
	}, [t]), s.useEffect(() => {
		i.current !== n && (a.current?.(n), i.current = n);
	}, [n, i]), [
		n,
		r,
		a
	];
}
function oe(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function se(e) {
	let t = s.useRef({
		value: e,
		previous: e
	});
	return s.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function ce(e) {
	let [t, n] = s.useState(void 0);
	return k(() => {
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
var le = "Label", j = s.forwardRef((e, t) => /* @__PURE__ */ a(E.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
j.displayName = le;
var M = j;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function N(e) {
	let t = /* @__PURE__ */ P(e), n = s.forwardRef((e, n) => {
		let { children: r, ...i } = e, o = s.Children.toArray(r), c = o.find(F);
		if (c) {
			let e = c.props.children, r = o.map((t) => t === c ? s.Children.count(e) > 1 ? s.Children.only(null) : s.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ a(t, {
				...i,
				ref: n,
				children: s.isValidElement(e) ? s.cloneElement(e, void 0, r) : null
			});
		}
		return /* @__PURE__ */ a(t, {
			...i,
			ref: n,
			children: r
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
var ue = /* @__PURE__ */ N("Slot");
/* @__NO_SIDE_EFFECTS__ */
function P(e) {
	let t = s.forwardRef((e, t) => {
		let { children: n, ...r } = e;
		if (s.isValidElement(n)) {
			let e = fe(n), i = I(r, n.props);
			return n.type !== s.Fragment && (i.ref = t ? x(t, e) : e), s.cloneElement(n, i);
		}
		return s.Children.count(n) > 1 ? s.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var de = Symbol("radix.slottable");
function F(e) {
	return s.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === de;
}
function I(e, t) {
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
function fe(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-switch/dist/index.mjs
var L = "Switch", [pe, me] = re(L), [he, ge] = pe(L), _e = s.forwardRef((e, t) => {
	let { __scopeSwitch: n, name: r, checked: i, defaultChecked: c, required: l, disabled: u, value: d = "on", onCheckedChange: f, form: p, ...m } = e, [h, g] = s.useState(null), _ = S(t, (e) => g(e)), v = s.useRef(!1), y = h ? p || !!h.closest("form") : !0, [b, x] = ae({
		prop: i,
		defaultProp: c ?? !1,
		onChange: f,
		caller: L
	});
	return /* @__PURE__ */ o(he, {
		scope: n,
		checked: b,
		disabled: u,
		children: [/* @__PURE__ */ a(E.button, {
			type: "button",
			role: "switch",
			"aria-checked": b,
			"aria-required": l,
			"data-state": Se(b),
			"data-disabled": u ? "" : void 0,
			disabled: u,
			value: d,
			...m,
			ref: _,
			onClick: O(e.onClick, (e) => {
				x((e) => !e), y && (v.current = e.isPropagationStopped(), v.current || e.stopPropagation());
			})
		}), y && /* @__PURE__ */ a(xe, {
			control: h,
			bubbles: !v.current,
			name: r,
			value: d,
			checked: b,
			required: l,
			disabled: u,
			form: p,
			style: { transform: "translateX(-100%)" }
		})]
	});
});
_e.displayName = L;
var ve = "SwitchThumb", ye = s.forwardRef((e, t) => {
	let { __scopeSwitch: n, ...r } = e, i = ge(ve, n);
	return /* @__PURE__ */ a(E.span, {
		"data-state": Se(i.checked),
		"data-disabled": i.disabled ? "" : void 0,
		...r,
		ref: t
	});
});
ye.displayName = ve;
var be = "SwitchBubbleInput", xe = s.forwardRef(({ __scopeSwitch: e, control: t, checked: n, bubbles: r = !0, ...i }, o) => {
	let c = s.useRef(null), l = S(c, o), u = se(n), d = ce(t);
	return s.useEffect(() => {
		let e = c.current;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, i = Object.getOwnPropertyDescriptor(t, "checked").set;
		if (u !== n && i) {
			let t = new Event("click", { bubbles: r });
			i.call(e, n), e.dispatchEvent(t);
		}
	}, [
		u,
		n,
		r
	]), /* @__PURE__ */ a("input", {
		type: "checkbox",
		"aria-hidden": !0,
		defaultChecked: n,
		...i,
		tabIndex: -1,
		ref: l,
		style: {
			...i.style,
			...d,
			position: "absolute",
			pointerEvents: "none",
			opacity: 0,
			margin: 0
		}
	});
});
xe.displayName = be;
function Se(e) {
	return e ? "checked" : "unchecked";
}
var Ce = _e, we = ye, Te = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, Ee = (e, t) => ({
	classGroupId: e,
	validator: t
}), De = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), Oe = "-", ke = [], Ae = "arbitrary..", je = (e) => {
	let t = Pe(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return Ne(e);
			let n = e.split(Oe);
			return Me(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? Te(i, t) : t : i || ke;
			}
			return n[e] || ke;
		}
	};
}, Me = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = Me(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(Oe) : e.slice(t).join(Oe), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, Ne = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? Ae + r : void 0;
})(), Pe = (e) => {
	let { theme: t, classGroups: n } = e;
	return Fe(n, t);
}, Fe = (e, t) => {
	let n = De();
	for (let r in e) {
		let i = e[r];
		Ie(i, n, r, t);
	}
	return n;
}, Ie = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		Le(i, t, n, r);
	}
}, Le = (e, t, n, r) => {
	if (typeof e == "string") {
		Re(e, t, n);
		return;
	}
	if (typeof e == "function") {
		ze(e, t, n, r);
		return;
	}
	Be(e, t, n, r);
}, Re = (e, t, n) => {
	let r = e === "" ? t : Ve(t, e);
	r.classGroupId = n;
}, ze = (e, t, n, r) => {
	if (He(e)) {
		Ie(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(Ee(n, e));
}, Be = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		Ie(o, Ve(t, a), n, r);
	}
}, Ve = (e, t) => {
	let n = e, r = t.split(Oe), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = De(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, He = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Ue = (e) => {
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
}, We = "!", Ge = ":", Ke = [], qe = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), Je = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === Ge) {
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
		s.endsWith(We) ? (c = s.slice(0, -1), l = !0) : s.startsWith(We) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return qe(t, l, c, u);
	};
	if (t) {
		let e = t + Ge, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : qe(Ke, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, Ye = (e) => {
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
}, Xe = (e) => ({
	cache: Ue(e.cacheSize),
	parseClassName: Je(e),
	sortModifiers: Ye(e),
	...je(e)
}), Ze = /\s+/, Qe = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(Ze), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + We : g, v = _ + h;
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
}, $e = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = et(n)) && (i && (i += " "), i += r);
	return i;
}, et = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = et(e[r])) && (n && (n += " "), n += t);
	return n;
}, tt = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = Xe(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = Qe(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a($e(...e));
}, nt = [], R = (e) => {
	let t = (t) => t[e] || nt;
	return t.isThemeGetter = !0, t;
}, rt = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, it = /^\((?:(\w[\w-]*):)?(.+)\)$/i, at = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, ot = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, st = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, ct = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, lt = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, ut = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, z = (e) => at.test(e), B = (e) => !!e && !Number.isNaN(Number(e)), V = (e) => !!e && Number.isInteger(Number(e)), dt = (e) => e.endsWith("%") && B(e.slice(0, -1)), H = (e) => ot.test(e), ft = () => !0, pt = (e) => st.test(e) && !ct.test(e), mt = () => !1, ht = (e) => lt.test(e), gt = (e) => ut.test(e), _t = (e) => !U(e) && !G(e), vt = (e) => q(e, Nt, mt), U = (e) => rt.test(e), W = (e) => q(e, Pt, pt), yt = (e) => q(e, Ft, B), bt = (e) => q(e, Lt, ft), xt = (e) => q(e, It, mt), St = (e) => q(e, jt, mt), Ct = (e) => q(e, Mt, gt), wt = (e) => q(e, Rt, ht), G = (e) => it.test(e), K = (e) => J(e, Pt), Tt = (e) => J(e, It), Et = (e) => J(e, jt), Dt = (e) => J(e, Nt), Ot = (e) => J(e, Mt), kt = (e) => J(e, Rt, !0), At = (e) => J(e, Lt, !0), q = (e, t, n) => {
	let r = rt.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, J = (e, t, n = !1) => {
	let r = it.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, jt = (e) => e === "position" || e === "percentage", Mt = (e) => e === "image" || e === "url", Nt = (e) => e === "length" || e === "size" || e === "bg-size", Pt = (e) => e === "length", Ft = (e) => e === "number", It = (e) => e === "family-name", Lt = (e) => e === "number" || e === "weight", Rt = (e) => e === "shadow", zt = /* @__PURE__ */ tt(() => {
	let e = R("color"), t = R("font"), n = R("text"), r = R("font-weight"), i = R("tracking"), a = R("leading"), o = R("breakpoint"), s = R("container"), c = R("spacing"), l = R("radius"), u = R("shadow"), d = R("inset-shadow"), f = R("text-shadow"), p = R("drop-shadow"), m = R("blur"), h = R("perspective"), g = R("aspect"), _ = R("ease"), v = R("animate"), y = () => [
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
		U
	], S = () => [
		"auto",
		"hidden",
		"clip",
		"visible",
		"scroll"
	], ee = () => [
		"auto",
		"contain",
		"none"
	], C = () => [
		G,
		U,
		c
	], w = () => [
		z,
		"full",
		"auto",
		...C()
	], te = () => [
		V,
		"none",
		"subgrid",
		G,
		U
	], ne = () => [
		"auto",
		{ span: [
			"full",
			V,
			G,
			U
		] },
		V,
		G,
		U
	], T = () => [
		V,
		"auto",
		G,
		U
	], E = () => [
		"auto",
		"min",
		"max",
		"fr",
		G,
		U
	], re = () => [
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
	], D = () => [
		"start",
		"end",
		"center",
		"stretch",
		"center-safe",
		"end-safe"
	], O = () => ["auto", ...C()], k = () => [
		z,
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
		...C()
	], ie = () => [
		z,
		"screen",
		"full",
		"dvw",
		"lvw",
		"svw",
		"min",
		"max",
		"fit",
		...C()
	], ae = () => [
		z,
		"screen",
		"full",
		"lh",
		"dvh",
		"lvh",
		"svh",
		"min",
		"max",
		"fit",
		...C()
	], A = () => [
		e,
		G,
		U
	], oe = () => [
		...b(),
		Et,
		St,
		{ position: [G, U] }
	], se = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], ce = () => [
		"auto",
		"cover",
		"contain",
		Dt,
		vt,
		{ size: [G, U] }
	], le = () => [
		dt,
		K,
		W
	], j = () => [
		"",
		"none",
		"full",
		l,
		G,
		U
	], M = () => [
		"",
		B,
		K,
		W
	], N = () => [
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
		B,
		dt,
		Et,
		St
	], de = () => [
		"",
		"none",
		m,
		G,
		U
	], F = () => [
		"none",
		B,
		G,
		U
	], I = () => [
		"none",
		B,
		G,
		U
	], fe = () => [
		B,
		G,
		U
	], L = () => [
		z,
		"full",
		...C()
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
			blur: [H],
			breakpoint: [H],
			color: [ft],
			container: [H],
			"drop-shadow": [H],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [_t],
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
			"inset-shadow": [H],
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
			radius: [H],
			shadow: [H],
			spacing: ["px", B],
			text: [H],
			"text-shadow": [H],
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
				z,
				U,
				G,
				g
			] }],
			container: ["container"],
			columns: [{ columns: [
				B,
				U,
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
			overscroll: [{ overscroll: ee() }],
			"overscroll-x": [{ "overscroll-x": ee() }],
			"overscroll-y": [{ "overscroll-y": ee() }],
			position: [
				"static",
				"fixed",
				"absolute",
				"relative",
				"sticky"
			],
			inset: [{ inset: w() }],
			"inset-x": [{ "inset-x": w() }],
			"inset-y": [{ "inset-y": w() }],
			start: [{
				"inset-s": w(),
				start: w()
			}],
			end: [{
				"inset-e": w(),
				end: w()
			}],
			"inset-bs": [{ "inset-bs": w() }],
			"inset-be": [{ "inset-be": w() }],
			top: [{ top: w() }],
			right: [{ right: w() }],
			bottom: [{ bottom: w() }],
			left: [{ left: w() }],
			visibility: [
				"visible",
				"invisible",
				"collapse"
			],
			z: [{ z: [
				V,
				"auto",
				G,
				U
			] }],
			basis: [{ basis: [
				z,
				"full",
				"auto",
				s,
				...C()
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
				z,
				"auto",
				"initial",
				"none",
				U
			] }],
			grow: [{ grow: [
				"",
				B,
				G,
				U
			] }],
			shrink: [{ shrink: [
				"",
				B,
				G,
				U
			] }],
			order: [{ order: [
				V,
				"first",
				"last",
				"none",
				G,
				U
			] }],
			"grid-cols": [{ "grid-cols": te() }],
			"col-start-end": [{ col: ne() }],
			"col-start": [{ "col-start": T() }],
			"col-end": [{ "col-end": T() }],
			"grid-rows": [{ "grid-rows": te() }],
			"row-start-end": [{ row: ne() }],
			"row-start": [{ "row-start": T() }],
			"row-end": [{ "row-end": T() }],
			"grid-flow": [{ "grid-flow": [
				"row",
				"col",
				"dense",
				"row-dense",
				"col-dense"
			] }],
			"auto-cols": [{ "auto-cols": E() }],
			"auto-rows": [{ "auto-rows": E() }],
			gap: [{ gap: C() }],
			"gap-x": [{ "gap-x": C() }],
			"gap-y": [{ "gap-y": C() }],
			"justify-content": [{ justify: [...re(), "normal"] }],
			"justify-items": [{ "justify-items": [...D(), "normal"] }],
			"justify-self": [{ "justify-self": ["auto", ...D()] }],
			"align-content": [{ content: ["normal", ...re()] }],
			"align-items": [{ items: [...D(), { baseline: ["", "last"] }] }],
			"align-self": [{ self: [
				"auto",
				...D(),
				{ baseline: ["", "last"] }
			] }],
			"place-content": [{ "place-content": re() }],
			"place-items": [{ "place-items": [...D(), "baseline"] }],
			"place-self": [{ "place-self": ["auto", ...D()] }],
			p: [{ p: C() }],
			px: [{ px: C() }],
			py: [{ py: C() }],
			ps: [{ ps: C() }],
			pe: [{ pe: C() }],
			pbs: [{ pbs: C() }],
			pbe: [{ pbe: C() }],
			pt: [{ pt: C() }],
			pr: [{ pr: C() }],
			pb: [{ pb: C() }],
			pl: [{ pl: C() }],
			m: [{ m: O() }],
			mx: [{ mx: O() }],
			my: [{ my: O() }],
			ms: [{ ms: O() }],
			me: [{ me: O() }],
			mbs: [{ mbs: O() }],
			mbe: [{ mbe: O() }],
			mt: [{ mt: O() }],
			mr: [{ mr: O() }],
			mb: [{ mb: O() }],
			ml: [{ ml: O() }],
			"space-x": [{ "space-x": C() }],
			"space-x-reverse": ["space-x-reverse"],
			"space-y": [{ "space-y": C() }],
			"space-y-reverse": ["space-y-reverse"],
			size: [{ size: k() }],
			"inline-size": [{ inline: ["auto", ...ie()] }],
			"min-inline-size": [{ "min-inline": ["auto", ...ie()] }],
			"max-inline-size": [{ "max-inline": ["none", ...ie()] }],
			"block-size": [{ block: ["auto", ...ae()] }],
			"min-block-size": [{ "min-block": ["auto", ...ae()] }],
			"max-block-size": [{ "max-block": ["none", ...ae()] }],
			w: [{ w: [
				s,
				"screen",
				...k()
			] }],
			"min-w": [{ "min-w": [
				s,
				"screen",
				"none",
				...k()
			] }],
			"max-w": [{ "max-w": [
				s,
				"screen",
				"none",
				"prose",
				{ screen: [o] },
				...k()
			] }],
			h: [{ h: [
				"screen",
				"lh",
				...k()
			] }],
			"min-h": [{ "min-h": [
				"screen",
				"lh",
				"none",
				...k()
			] }],
			"max-h": [{ "max-h": [
				"screen",
				"lh",
				...k()
			] }],
			"font-size": [{ text: [
				"base",
				n,
				K,
				W
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				At,
				bt
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
				dt,
				U
			] }],
			"font-family": [{ font: [
				Tt,
				xt,
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
				G,
				U
			] }],
			"line-clamp": [{ "line-clamp": [
				B,
				"none",
				G,
				yt
			] }],
			leading: [{ leading: [a, ...C()] }],
			"list-image": [{ "list-image": [
				"none",
				G,
				U
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				G,
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
			"placeholder-color": [{ placeholder: A() }],
			"text-color": [{ text: A() }],
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			"text-decoration-style": [{ decoration: [...N(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				B,
				"from-font",
				"auto",
				G,
				W
			] }],
			"text-decoration-color": [{ decoration: A() }],
			"underline-offset": [{ "underline-offset": [
				B,
				"auto",
				G,
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
			indent: [{ indent: C() }],
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
				G,
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
			"bg-position": [{ bg: oe() }],
			"bg-repeat": [{ bg: se() }],
			"bg-size": [{ bg: ce() }],
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
						V,
						G,
						U
					],
					radial: [
						"",
						G,
						U
					],
					conic: [
						V,
						G,
						U
					]
				},
				Ot,
				Ct
			] }],
			"bg-color": [{ bg: A() }],
			"gradient-from-pos": [{ from: le() }],
			"gradient-via-pos": [{ via: le() }],
			"gradient-to-pos": [{ to: le() }],
			"gradient-from": [{ from: A() }],
			"gradient-via": [{ via: A() }],
			"gradient-to": [{ to: A() }],
			rounded: [{ rounded: j() }],
			"rounded-s": [{ "rounded-s": j() }],
			"rounded-e": [{ "rounded-e": j() }],
			"rounded-t": [{ "rounded-t": j() }],
			"rounded-r": [{ "rounded-r": j() }],
			"rounded-b": [{ "rounded-b": j() }],
			"rounded-l": [{ "rounded-l": j() }],
			"rounded-ss": [{ "rounded-ss": j() }],
			"rounded-se": [{ "rounded-se": j() }],
			"rounded-ee": [{ "rounded-ee": j() }],
			"rounded-es": [{ "rounded-es": j() }],
			"rounded-tl": [{ "rounded-tl": j() }],
			"rounded-tr": [{ "rounded-tr": j() }],
			"rounded-br": [{ "rounded-br": j() }],
			"rounded-bl": [{ "rounded-bl": j() }],
			"border-w": [{ border: M() }],
			"border-w-x": [{ "border-x": M() }],
			"border-w-y": [{ "border-y": M() }],
			"border-w-s": [{ "border-s": M() }],
			"border-w-e": [{ "border-e": M() }],
			"border-w-bs": [{ "border-bs": M() }],
			"border-w-be": [{ "border-be": M() }],
			"border-w-t": [{ "border-t": M() }],
			"border-w-r": [{ "border-r": M() }],
			"border-w-b": [{ "border-b": M() }],
			"border-w-l": [{ "border-l": M() }],
			"divide-x": [{ "divide-x": M() }],
			"divide-x-reverse": ["divide-x-reverse"],
			"divide-y": [{ "divide-y": M() }],
			"divide-y-reverse": ["divide-y-reverse"],
			"border-style": [{ border: [
				...N(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...N(),
				"hidden",
				"none"
			] }],
			"border-color": [{ border: A() }],
			"border-color-x": [{ "border-x": A() }],
			"border-color-y": [{ "border-y": A() }],
			"border-color-s": [{ "border-s": A() }],
			"border-color-e": [{ "border-e": A() }],
			"border-color-bs": [{ "border-bs": A() }],
			"border-color-be": [{ "border-be": A() }],
			"border-color-t": [{ "border-t": A() }],
			"border-color-r": [{ "border-r": A() }],
			"border-color-b": [{ "border-b": A() }],
			"border-color-l": [{ "border-l": A() }],
			"divide-color": [{ divide: A() }],
			"outline-style": [{ outline: [
				...N(),
				"none",
				"hidden"
			] }],
			"outline-offset": [{ "outline-offset": [
				B,
				G,
				U
			] }],
			"outline-w": [{ outline: [
				"",
				B,
				K,
				W
			] }],
			"outline-color": [{ outline: A() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				kt,
				wt
			] }],
			"shadow-color": [{ shadow: A() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				kt,
				wt
			] }],
			"inset-shadow-color": [{ "inset-shadow": A() }],
			"ring-w": [{ ring: M() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: A() }],
			"ring-offset-w": [{ "ring-offset": [B, W] }],
			"ring-offset-color": [{ "ring-offset": A() }],
			"inset-ring-w": [{ "inset-ring": M() }],
			"inset-ring-color": [{ "inset-ring": A() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				kt,
				wt
			] }],
			"text-shadow-color": [{ "text-shadow": A() }],
			opacity: [{ opacity: [
				B,
				G,
				U
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
			"mask-image-linear-pos": [{ "mask-linear": [B] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": P() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": P() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": A() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": A() }],
			"mask-image-t-from-pos": [{ "mask-t-from": P() }],
			"mask-image-t-to-pos": [{ "mask-t-to": P() }],
			"mask-image-t-from-color": [{ "mask-t-from": A() }],
			"mask-image-t-to-color": [{ "mask-t-to": A() }],
			"mask-image-r-from-pos": [{ "mask-r-from": P() }],
			"mask-image-r-to-pos": [{ "mask-r-to": P() }],
			"mask-image-r-from-color": [{ "mask-r-from": A() }],
			"mask-image-r-to-color": [{ "mask-r-to": A() }],
			"mask-image-b-from-pos": [{ "mask-b-from": P() }],
			"mask-image-b-to-pos": [{ "mask-b-to": P() }],
			"mask-image-b-from-color": [{ "mask-b-from": A() }],
			"mask-image-b-to-color": [{ "mask-b-to": A() }],
			"mask-image-l-from-pos": [{ "mask-l-from": P() }],
			"mask-image-l-to-pos": [{ "mask-l-to": P() }],
			"mask-image-l-from-color": [{ "mask-l-from": A() }],
			"mask-image-l-to-color": [{ "mask-l-to": A() }],
			"mask-image-x-from-pos": [{ "mask-x-from": P() }],
			"mask-image-x-to-pos": [{ "mask-x-to": P() }],
			"mask-image-x-from-color": [{ "mask-x-from": A() }],
			"mask-image-x-to-color": [{ "mask-x-to": A() }],
			"mask-image-y-from-pos": [{ "mask-y-from": P() }],
			"mask-image-y-to-pos": [{ "mask-y-to": P() }],
			"mask-image-y-from-color": [{ "mask-y-from": A() }],
			"mask-image-y-to-color": [{ "mask-y-to": A() }],
			"mask-image-radial": [{ "mask-radial": [G, U] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": P() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": P() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": A() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": A() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [B] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": P() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": P() }],
			"mask-image-conic-from-color": [{ "mask-conic-from": A() }],
			"mask-image-conic-to-color": [{ "mask-conic-to": A() }],
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
			"mask-position": [{ mask: oe() }],
			"mask-repeat": [{ mask: se() }],
			"mask-size": [{ mask: ce() }],
			"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
			"mask-image": [{ mask: [
				"none",
				G,
				U
			] }],
			filter: [{ filter: [
				"",
				"none",
				G,
				U
			] }],
			blur: [{ blur: de() }],
			brightness: [{ brightness: [
				B,
				G,
				U
			] }],
			contrast: [{ contrast: [
				B,
				G,
				U
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				kt,
				wt
			] }],
			"drop-shadow-color": [{ "drop-shadow": A() }],
			grayscale: [{ grayscale: [
				"",
				B,
				G,
				U
			] }],
			"hue-rotate": [{ "hue-rotate": [
				B,
				G,
				U
			] }],
			invert: [{ invert: [
				"",
				B,
				G,
				U
			] }],
			saturate: [{ saturate: [
				B,
				G,
				U
			] }],
			sepia: [{ sepia: [
				"",
				B,
				G,
				U
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				G,
				U
			] }],
			"backdrop-blur": [{ "backdrop-blur": de() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				B,
				G,
				U
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				B,
				G,
				U
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				B,
				G,
				U
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				B,
				G,
				U
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				B,
				G,
				U
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				B,
				G,
				U
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				B,
				G,
				U
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				B,
				G,
				U
			] }],
			"border-collapse": [{ border: ["collapse", "separate"] }],
			"border-spacing": [{ "border-spacing": C() }],
			"border-spacing-x": [{ "border-spacing-x": C() }],
			"border-spacing-y": [{ "border-spacing-y": C() }],
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
				U
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				B,
				"initial",
				G,
				U
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				G,
				U
			] }],
			delay: [{ delay: [
				B,
				G,
				U
			] }],
			animate: [{ animate: [
				"none",
				v,
				G,
				U
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				G,
				U
			] }],
			"perspective-origin": [{ "perspective-origin": x() }],
			rotate: [{ rotate: F() }],
			"rotate-x": [{ "rotate-x": F() }],
			"rotate-y": [{ "rotate-y": F() }],
			"rotate-z": [{ "rotate-z": F() }],
			scale: [{ scale: I() }],
			"scale-x": [{ "scale-x": I() }],
			"scale-y": [{ "scale-y": I() }],
			"scale-z": [{ "scale-z": I() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: fe() }],
			"skew-x": [{ "skew-x": fe() }],
			"skew-y": [{ "skew-y": fe() }],
			transform: [{ transform: [
				G,
				U,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: x() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: L() }],
			"translate-x": [{ "translate-x": L() }],
			"translate-y": [{ "translate-y": L() }],
			"translate-z": [{ "translate-z": L() }],
			"translate-none": ["translate-none"],
			accent: [{ accent: A() }],
			appearance: [{ appearance: ["none", "auto"] }],
			"caret-color": [{ caret: A() }],
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
			"scroll-m": [{ "scroll-m": C() }],
			"scroll-mx": [{ "scroll-mx": C() }],
			"scroll-my": [{ "scroll-my": C() }],
			"scroll-ms": [{ "scroll-ms": C() }],
			"scroll-me": [{ "scroll-me": C() }],
			"scroll-mbs": [{ "scroll-mbs": C() }],
			"scroll-mbe": [{ "scroll-mbe": C() }],
			"scroll-mt": [{ "scroll-mt": C() }],
			"scroll-mr": [{ "scroll-mr": C() }],
			"scroll-mb": [{ "scroll-mb": C() }],
			"scroll-ml": [{ "scroll-ml": C() }],
			"scroll-p": [{ "scroll-p": C() }],
			"scroll-px": [{ "scroll-px": C() }],
			"scroll-py": [{ "scroll-py": C() }],
			"scroll-ps": [{ "scroll-ps": C() }],
			"scroll-pe": [{ "scroll-pe": C() }],
			"scroll-pbs": [{ "scroll-pbs": C() }],
			"scroll-pbe": [{ "scroll-pbe": C() }],
			"scroll-pt": [{ "scroll-pt": C() }],
			"scroll-pr": [{ "scroll-pr": C() }],
			"scroll-pb": [{ "scroll-pb": C() }],
			"scroll-pl": [{ "scroll-pl": C() }],
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
				U
			] }],
			fill: [{ fill: ["none", ...A()] }],
			"stroke-w": [{ stroke: [
				B,
				K,
				W,
				yt
			] }],
			stroke: [{ stroke: ["none", ...A()] }],
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
function Y(...e) {
	return zt(g(e));
}
//#endregion
//#region src/components/ui/button.tsx
var Bt = y("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
function X({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ a(r ? ue : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: Y(Bt({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/lib/marketplace-api.ts
function Vt(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function Z(e) {
	"@babel/helpers - typeof";
	return Z = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, Z(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function Ht(e, t) {
	if (Z(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (Z(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function Ut(e) {
	var t = Ht(e, "string");
	return Z(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function Wt(e, t, n) {
	return (t = Ut(t)) in e ? Object.defineProperty(e, t, {
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
		super(e), Wt(this, "code", void 0), Wt(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, Gt = {
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
function Kt(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function qt(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function Jt(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(Vt(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function Yt(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return Jt(e, n);
	if (t instanceof Q && t.code) {
		let n = Gt[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = Gt[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return Kt(n) ? e("errors.api.timeout") : qt(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function Xt(e, t) {
	i.error(Yt(e, t));
}
//#endregion
//#region src/lib/safeUrl.ts
function Zt(e) {
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
function Qt() {
	return window.webinoDashboard;
}
var $t = 3e4;
function en(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function tn(e) {
	let t = Qt();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (en(e) || Zt(e)) return e;
	throw new Q("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function nn(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function rn(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : /^(payments|torobpay|snapppay|digipay|zarinpal|bale-pay|wallet|c2c)(\/|$)/.test(t) ? "webino_dashboard_payments_rest" : null;
}
function an(e, t) {
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
function on(e, t) {
	let n = e.toLowerCase();
	return e.includes("Upstream Error") || e.includes("Forbidden") || t === 403 ? "admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry" : n.includes("timed out") || n.includes("timeout") || t === 504 || t === 524 ? "Request timed out — RSA-4096 generation can take over a minute on weak hosts" : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? `Invalid AJAX response (HTML, HTTP ${t || 0})` : `Invalid AJAX response (HTTP ${t || 0})`;
}
async function sn(e, t, n = {}) {
	let r = rn(e), i = Qt();
	if (!r || !i.ajaxUrl) throw new Q("AJAX fallback unavailable", {
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
	let { signal: l, clear: u } = nn({}, t);
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
			throw new Q(on(t, e.status), {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!n.success) throw new Q(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
			code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
			status: e.status
		});
		return n.data;
	} catch (e) {
		throw e instanceof Q ? e : e instanceof DOMException && e.name === "AbortError" ? new Q("Request timed out", {
			code: "timeout",
			status: 0
		}) : e instanceof TypeError ? new Q("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		u();
	}
}
async function cn(e, t = {}, n = $t) {
	if (rn(e) && Qt().ajaxUrl) return sn(e, n, t);
	let r = tn(e), i = Qt(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce), !Object.keys(a).some((e) => e.toLowerCase() === "content-type") && typeof t.body == "string" && t.body.length > 0 && (a["Content-Type"] = "application/json");
	let { signal: s, clear: c } = nn(t, n);
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
			let t = an(n, e.status);
			throw new Q(t.message, {
				code: t.code,
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
		}) : e instanceof TypeError ? new Q("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region ../Modules/card-to-card-gateway-module/client/pages/C2CReceiptsPage.tsx
function ln() {
	let { t: s } = r(), c = n(), l = t({
		queryKey: ["c2c", "receipts"],
		queryFn: () => cn("c2c/receipts?status=pending")
	}), u = e({
		mutationFn: async (e) => cn(`c2c/receipts/${e.id}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ action: e.action })
		}),
		onSuccess: async () => {
			i.success(s("common.saved")), await c.invalidateQueries({ queryKey: ["c2c", "receipts"] });
		},
		onError: (e) => Xt(s, e)
	}), d = l.data?.items ?? [];
	return /* @__PURE__ */ a(m, {
		title: s("c2c.receiptsTitle"),
		subtitle: s("c2c.receiptsSubtitle"),
		children: l.isLoading ? /* @__PURE__ */ a("p", {
			className: "text-muted-foreground text-sm",
			children: s("common.loading")
		}) : d.length === 0 ? /* @__PURE__ */ a("p", {
			className: "text-muted-foreground text-sm",
			children: s("c2c.empty")
		}) : /* @__PURE__ */ a("div", {
			className: "grid gap-4",
			children: d.map((e) => /* @__PURE__ */ o("article", {
				className: "grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[180px_1fr_auto] md:items-center",
				children: [
					/* @__PURE__ */ a("div", {
						className: "overflow-hidden rounded-md border bg-muted",
						children: e.thumb_url ? /* @__PURE__ */ a("a", {
							href: e.receipt_url || e.thumb_url,
							target: "_blank",
							rel: "noreferrer",
							children: /* @__PURE__ */ a("img", {
								src: e.thumb_url,
								alt: "",
								className: "h-40 w-full object-cover"
							})
						}) : /* @__PURE__ */ a("div", {
							className: "text-muted-foreground flex h-40 items-center justify-center text-xs",
							children: s("c2c.noImage")
						})
					}),
					/* @__PURE__ */ o("div", {
						className: "space-y-1 text-sm",
						children: [
							/* @__PURE__ */ o("p", {
								className: "font-semibold",
								children: [
									s("c2c.order"),
									" #",
									e.number
								]
							}),
							/* @__PURE__ */ o("p", { children: [
								s("c2c.amount"),
								":",
								" ",
								/* @__PURE__ */ a("span", { dangerouslySetInnerHTML: { __html: e.total_html } })
							] }),
							e.customer ? /* @__PURE__ */ o("p", { children: [
								s("c2c.customer"),
								": ",
								e.customer
							] }) : null,
							e.date ? /* @__PURE__ */ a("p", {
								className: "text-muted-foreground",
								children: e.date
							}) : null,
							e.edit_url ? /* @__PURE__ */ a("p", { children: /* @__PURE__ */ a("a", {
								className: "text-primary underline-offset-4 hover:underline",
								href: e.edit_url,
								children: s("c2c.openOrder")
							}) }) : null
						]
					}),
					/* @__PURE__ */ o("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ a(X, {
							type: "button",
							disabled: u.isPending,
							onClick: () => void u.mutateAsync({
								id: e.id,
								action: "approve"
							}),
							children: s("c2c.approve")
						}), /* @__PURE__ */ a(X, {
							type: "button",
							variant: "destructive",
							disabled: u.isPending,
							onClick: () => void u.mutateAsync({
								id: e.id,
								action: "reject"
							}),
							children: s("c2c.reject")
						})]
					})
				]
			}, e.id))
		})
	});
}
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var un = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), dn = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), fn = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), pn = (e) => {
	let t = fn(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, mn = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, hn = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, gn = c({}), _n = () => d(gn), vn = u(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: a, iconNode: o, ...s }, c) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = _n() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return l("svg", {
		ref: c,
		...mn,
		width: t ?? u ?? mn.width,
		height: t ?? u ?? mn.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: un("lucide", m, i),
		...!a && !hn(s) && { "aria-hidden": "true" },
		...s
	}, [...o.map(([e, t]) => l(e, t)), ...Array.isArray(a) ? a : [a]]);
}), yn = ((e, t) => {
	let n = u(({ className: n, ...r }, i) => l(vn, {
		ref: i,
		iconNode: t,
		className: un(`lucide-${dn(pn(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = pn(e), n;
})("copy", [["rect", {
	width: "14",
	height: "14",
	x: "8",
	y: "8",
	rx: "2",
	ry: "2",
	key: "17jyea"
}], ["path", {
	d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
	key: "zix9uf"
}]]), bn = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function xn({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ a("div", {
		"data-slot": "card",
		"data-variant": t,
		className: Y("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", bn[t], e),
		...n
	});
}
function Sn({ className: e, ...t }) {
	return /* @__PURE__ */ a("div", {
		"data-slot": "card-header",
		className: Y("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function Cn({ className: e, ...t }) {
	return /* @__PURE__ */ a("div", {
		"data-slot": "card-title",
		className: Y("leading-none font-semibold", e),
		...t
	});
}
function wn({ className: e, ...t }) {
	return /* @__PURE__ */ a("div", {
		"data-slot": "card-description",
		className: Y("text-sm text-muted-foreground", e),
		...t
	});
}
function Tn({ className: e, ...t }) {
	return /* @__PURE__ */ a("div", {
		"data-slot": "card-content",
		className: Y("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region src/components/ui/input.tsx
function En({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ a("input", {
		type: t,
		"data-slot": "input",
		className: Y("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function Dn({ className: e, ...t }) {
	return /* @__PURE__ */ a(M, {
		"data-slot": "label",
		className: Y("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/components/ui/switch.tsx
function On({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ a(Ce, {
		"data-slot": "switch",
		"data-size": t,
		className: Y("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", e),
		...n,
		dir: "ltr",
		children: /* @__PURE__ */ a(we, {
			"data-slot": "switch-thumb",
			className: Y("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
//#endregion
//#region src/components/ui/textarea.tsx
function kn({ className: e, ...t }) {
	return /* @__PURE__ */ a("textarea", {
		"data-slot": "textarea",
		className: Y("flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-start shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40", e),
		...t
	});
}
//#endregion
//#region src/components/payments/GatewaySettingsLayout.tsx
function An({ title: e, description: t, notice: n, meta: s, sections: c, actions: l, children: u }) {
	let { t: d } = r(), f = async (e) => {
		try {
			await navigator.clipboard.writeText(e), i.success(d("common.copied", { defaultValue: "Copied" }));
		} catch {
			i.error(d("common.copyFailed", { defaultValue: "Copy failed" }));
		}
	};
	return /* @__PURE__ */ a(m, {
		title: e,
		description: t,
		children: /* @__PURE__ */ o("div", {
			className: "mx-auto w-full max-w-6xl space-y-6",
			children: [
				n,
				u,
				s && s.length > 0 ? /* @__PURE__ */ a("div", {
					className: "bg-muted/30 grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3",
					children: s.map((e) => /* @__PURE__ */ o("div", {
						className: "min-w-0 space-y-1",
						children: [/* @__PURE__ */ a("p", {
							className: "text-muted-foreground text-xs font-medium",
							children: e.label
						}), /* @__PURE__ */ o("div", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ a("code", {
								className: "bg-background block min-w-0 flex-1 truncate rounded-md border px-2 py-1.5 text-xs",
								children: e.value || "—"
							}), e.copyable && e.value ? /* @__PURE__ */ a(X, {
								type: "button",
								size: "icon",
								variant: "outline",
								className: "size-8 shrink-0",
								onClick: () => void f(e.value),
								children: /* @__PURE__ */ a(yn, { className: "size-3.5" })
							}) : null]
						})]
					}, e.label))
				}) : null,
				c.length > 1 ? /* @__PURE__ */ a("nav", {
					className: "flex flex-wrap gap-2",
					"aria-label": e,
					children: c.map((e) => /* @__PURE__ */ a(X, {
						asChild: !0,
						size: "sm",
						variant: "outline",
						children: /* @__PURE__ */ a("a", {
							href: `#${e.id}`,
							children: e.title
						})
					}, e.id))
				}) : null,
				/* @__PURE__ */ a("div", {
					className: "space-y-5",
					children: c.map((e) => /* @__PURE__ */ o(xn, {
						id: e.id,
						className: "scroll-mt-24",
						children: [/* @__PURE__ */ o(Sn, { children: [/* @__PURE__ */ a(Cn, {
							className: "text-base",
							children: e.title
						}), e.description ? /* @__PURE__ */ a(wn, { children: e.description }) : null] }), /* @__PURE__ */ a(Tn, { children: e.children })]
					}, e.id))
				}),
				l ? /* @__PURE__ */ a("div", {
					className: "bg-background/95 sticky bottom-3 z-10 flex flex-wrap gap-2 rounded-xl border p-3 shadow-sm backdrop-blur",
					children: l
				}) : null
			]
		})
	});
}
function $({ label: e, value: t, onChange: n, type: r = "text", placeholder: i, hint: s, className: c }) {
	return /* @__PURE__ */ o("div", {
		className: Y("space-y-2", c),
		children: [
			/* @__PURE__ */ a(Dn, { children: e }),
			/* @__PURE__ */ a(En, {
				type: r,
				value: t,
				placeholder: i,
				onChange: (e) => n(e.target.value)
			}),
			s ? /* @__PURE__ */ a("p", {
				className: "text-muted-foreground text-xs",
				children: s
			}) : null
		]
	});
}
function jn({ label: e, value: t, onChange: n, hint: r, className: i }) {
	return /* @__PURE__ */ o("div", {
		className: Y("space-y-2", i),
		children: [
			/* @__PURE__ */ a(Dn, { children: e }),
			/* @__PURE__ */ a(kn, {
				value: t,
				onChange: (e) => n(e.target.value),
				rows: 3
			}),
			r ? /* @__PURE__ */ a("p", {
				className: "text-muted-foreground text-xs",
				children: r
			}) : null
		]
	});
}
function Mn({ label: e, description: t, checked: n, onChange: r }) {
	return /* @__PURE__ */ o("div", {
		className: "flex items-start justify-between gap-4 rounded-lg border border-border/70 px-3 py-3",
		children: [/* @__PURE__ */ o("div", {
			className: "min-w-0 space-y-0.5",
			children: [/* @__PURE__ */ a("p", {
				className: "text-sm font-medium leading-snug",
				children: e
			}), t ? /* @__PURE__ */ a("p", {
				className: "text-muted-foreground text-xs leading-relaxed",
				children: t
			}) : null]
		}), /* @__PURE__ */ a(On, {
			checked: n,
			onCheckedChange: (e) => r(!!e),
			className: "mt-0.5 shrink-0"
		})]
	});
}
function Nn({ children: e }) {
	return /* @__PURE__ */ a("div", {
		className: "grid gap-4 md:grid-cols-2",
		children: e
	});
}
//#endregion
//#region ../Modules/card-to-card-gateway-module/client/pages/C2CSettingsPage.tsx
var Pn = () => ({
	number: "",
	name: "",
	bank: ""
});
function Fn() {
	let { t: s } = r(), c = n(), [l, u] = p(null), d = t({
		queryKey: ["c2c", "settings"],
		queryFn: () => cn("c2c/settings")
	});
	f(() => {
		if (!d.data?.settings) return;
		let e = d.data.settings;
		u({
			...e,
			cards: e.cards?.length ? e.cards : [Pn()]
		});
	}, [d.data]);
	let h = e({
		mutationFn: async () => cn("c2c/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				...l,
				cards: (l?.cards ?? []).filter((e) => e.number.trim() !== "")
			})
		}),
		onSuccess: async (e) => {
			i.success(s("common.saved")), e.settings && u({
				...e.settings,
				cards: e.settings.cards?.length ? e.settings.cards : [Pn()]
			}), await c.invalidateQueries({ queryKey: ["c2c", "settings"] }), await c.invalidateQueries({ queryKey: ["payment-gateways"] });
		},
		onError: (e) => Xt(s, e)
	}), g = (e, t) => {
		if (!l) return;
		let n = l.cards.map((n, r) => r === e ? {
			...n,
			...t
		} : n);
		u({
			...l,
			cards: n
		});
	};
	return l ? /* @__PURE__ */ a(An, {
		title: s("c2c.title"),
		description: s("c2c.subtitle"),
		sections: [{
			id: "checkout",
			title: s("gateway.section.checkout"),
			children: /* @__PURE__ */ o("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ a(Mn, {
					label: s("c2c.enabled"),
					description: s("c2c.enabledHint"),
					checked: l.enabled,
					onChange: (e) => u({
						...l,
						enabled: e
					})
				}), /* @__PURE__ */ o(Nn, { children: [
					/* @__PURE__ */ a($, {
						label: s("c2c.checkoutTitle"),
						value: l.title,
						onChange: (e) => u({
							...l,
							title: e
						})
					}),
					/* @__PURE__ */ a($, {
						label: s("gateway.field.orderButtonText"),
						value: l.order_button_text ?? "",
						onChange: (e) => u({
							...l,
							order_button_text: e
						})
					}),
					/* @__PURE__ */ a($, {
						label: s("c2c.deadline"),
						type: "number",
						value: String(l.deadline_h),
						onChange: (e) => u({
							...l,
							deadline_h: Number(e) || 1
						}),
						hint: s("c2c.deadlineHint")
					}),
					/* @__PURE__ */ a(jn, {
						className: "md:col-span-2",
						label: s("gateway.field.description"),
						value: l.description ?? "",
						onChange: (e) => u({
							...l,
							description: e
						})
					}),
					/* @__PURE__ */ a(jn, {
						className: "md:col-span-2",
						label: s("c2c.instructions"),
						value: l.instructions,
						onChange: (e) => u({
							...l,
							instructions: e
						})
					}),
					/* @__PURE__ */ o("div", {
						className: "space-y-2 md:col-span-2",
						children: [/* @__PURE__ */ a("label", {
							className: "text-sm font-medium",
							children: s("gateway.field.iconUrl")
						}), /* @__PURE__ */ o("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ a("img", {
								src: l.icon_url?.trim() || l.resolved_icon_url || l.default_icon_url || "",
								alt: "",
								className: "h-10 w-10 shrink-0 rounded border object-contain"
							}), /* @__PURE__ */ a("div", {
								className: "min-w-0 flex-1",
								children: /* @__PURE__ */ a($, {
									label: "",
									value: l.icon_url ?? "",
									onChange: (e) => u({
										...l,
										icon_url: e
									}),
									hint: s("gateway.field.iconUrlHint")
								})
							})]
						})]
					}),
					/* @__PURE__ */ a($, {
						className: "md:col-span-2",
						label: s("c2c.iban"),
						value: l.iban,
						onChange: (e) => u({
							...l,
							iban: e
						})
					})
				] })]
			})
		}, {
			id: "cards",
			title: s("c2c.cards"),
			description: s("c2c.cardsHint"),
			children: /* @__PURE__ */ o("div", {
				className: "space-y-3",
				children: [l.cards.map((e, t) => /* @__PURE__ */ o("div", {
					className: "grid gap-2 rounded-lg border p-3 md:grid-cols-3",
					children: [
						/* @__PURE__ */ o("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ a(Dn, {
								className: "text-xs",
								children: s("c2c.cardNumber")
							}), /* @__PURE__ */ a(En, {
								value: e.number,
								className: "font-mono",
								onChange: (e) => g(t, { number: e.target.value })
							})]
						}),
						/* @__PURE__ */ o("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ a(Dn, {
								className: "text-xs",
								children: s("c2c.cardName")
							}), /* @__PURE__ */ a(En, {
								value: e.name,
								onChange: (e) => g(t, { name: e.target.value })
							})]
						}),
						/* @__PURE__ */ o("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ a(Dn, {
								className: "text-xs",
								children: s("c2c.cardBank")
							}), /* @__PURE__ */ a(En, {
								value: e.bank,
								onChange: (e) => g(t, { bank: e.target.value })
							})]
						})
					]
				}, t)), /* @__PURE__ */ a(X, {
					type: "button",
					variant: "outline",
					onClick: () => u({
						...l,
						cards: [...l.cards, Pn()]
					}),
					children: s("c2c.addCard")
				})]
			})
		}],
		actions: /* @__PURE__ */ a(X, {
			type: "button",
			disabled: h.isPending,
			onClick: () => void h.mutateAsync(),
			children: s("common.save")
		})
	}) : /* @__PURE__ */ a(m, {
		title: s("c2c.title"),
		children: s("common.loading")
	});
}
//#endregion
//#region ../Modules/card-to-card-gateway-module/client/module-entry.tsx
var In = {
	"settings/shop/c2c": Fn,
	"shop/c2c-receipts": ln
}, Ln = { routes: In };
//#endregion
export { Ln as default, In as routes };
