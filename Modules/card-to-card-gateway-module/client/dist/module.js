import { useMutation as e, useQuery as t, useQueryClient as n } from "@tanstack/react-query";
import { useTranslation as r } from "react-i18next";
import { toast as i } from "sonner";
import { Fragment as a, jsx as o, jsxs as s } from "react/jsx-runtime";
import * as c from "react";
import { createContext as l, createElement as u, forwardRef as d, useContext as f, useEffect as p, useState as m } from "react";
import "react-dom";
//#region src/components/PageShell.tsx
function h({ title: e, description: t, eyebrow: n, children: r }) {
	return /* @__PURE__ */ s("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ s("header", {
			className: "min-w-0 space-y-1.5",
			children: [
				n ? /* @__PURE__ */ o("p", {
					className: "text-muted-foreground text-xs font-medium tracking-wide uppercase",
					children: n
				}) : null,
				/* @__PURE__ */ o("h1", {
					className: "text-xl font-semibold tracking-tight sm:text-2xl",
					children: e
				}),
				t ? /* @__PURE__ */ o("p", {
					className: "text-muted-foreground max-w-2xl text-sm leading-relaxed",
					children: t
				}) : null
			]
		}), r]
	});
}
//#endregion
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
var v = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, y = _, ee = (e, t) => (n) => {
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
	return c.useCallback(x(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function C(e) {
	let t = /* @__PURE__ */ w(e), n = c.forwardRef((e, n) => {
		let { children: r, ...i } = e, a = c.Children.toArray(r), s = a.find(ne);
		if (s) {
			let e = s.props.children, r = a.map((t) => t === s ? c.Children.count(e) > 1 ? c.Children.only(null) : c.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ o(t, {
				...i,
				ref: n,
				children: c.isValidElement(e) ? c.cloneElement(e, void 0, r) : null
			});
		}
		return /* @__PURE__ */ o(t, {
			...i,
			ref: n,
			children: r
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function w(e) {
	let t = c.forwardRef((e, t) => {
		let { children: n, ...r } = e;
		if (c.isValidElement(n)) {
			let e = re(n), i = T(r, n.props);
			return n.type !== c.Fragment && (i.ref = t ? x(t, e) : e), c.cloneElement(n, i);
		}
		return c.Children.count(n) > 1 ? c.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var te = Symbol("radix.slottable");
function ne(e) {
	return c.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === te;
}
function T(e, t) {
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
function re(e) {
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
	let n = /* @__PURE__ */ C(`Primitive.${t}`), r = c.forwardRef((e, r) => {
		let { asChild: i, ...a } = e, s = i ? n : t;
		return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ o(s, {
			...a,
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
function D(e, t = []) {
	let n = [];
	function r(t, r) {
		let i = c.createContext(r), a = n.length;
		n = [...n, r];
		let s = (t) => {
			let { scope: n, children: r, ...s } = t, l = n?.[e]?.[a] || i, u = c.useMemo(() => s, Object.values(s));
			return /* @__PURE__ */ o(l.Provider, {
				value: u,
				children: r
			});
		};
		s.displayName = t + "Provider";
		function l(n, o) {
			let s = o?.[e]?.[a] || i, l = c.useContext(s);
			if (l) return l;
			if (r !== void 0) return r;
			throw Error(`\`${n}\` must be used within \`${t}\``);
		}
		return [s, l];
	}
	let i = () => {
		let t = n.map((e) => c.createContext(e));
		return function(n) {
			let r = n?.[e] || t;
			return c.useMemo(() => ({ [`__scope${e}`]: {
				...n,
				[e]: r
			} }), [n, r]);
		};
	};
	return i.scopeName = e, [r, O(i, ...t)];
}
function O(...e) {
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
			return c.useMemo(() => ({ [`__scope${t.scopeName}`]: r }), [r]);
		};
	};
	return n.scopeName = t.scopeName, n;
}
typeof window < "u" && window.document && window.document.createElement;
function k(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var A = globalThis?.document ? c.useLayoutEffect : () => {}, ie = c.useInsertionEffect || A;
function j({ prop: e, defaultProp: t, onChange: n = () => {}, caller: r }) {
	let [i, a, o] = ae({
		defaultProp: t,
		onChange: n
	}), s = e !== void 0, l = s ? e : i;
	{
		let t = c.useRef(e !== void 0);
		c.useEffect(() => {
			let e = t.current;
			e !== s && console.warn(`${r} is changing from ${e ? "controlled" : "uncontrolled"} to ${s ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`), t.current = s;
		}, [s, r]);
	}
	return [l, c.useCallback((t) => {
		if (s) {
			let n = oe(t) ? t(e) : t;
			n !== e && o.current?.(n);
		} else a(t);
	}, [
		s,
		e,
		a,
		o
	])];
}
function ae({ defaultProp: e, onChange: t }) {
	let [n, r] = c.useState(e), i = c.useRef(n), a = c.useRef(t);
	return ie(() => {
		a.current = t;
	}, [t]), c.useEffect(() => {
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
//#region node_modules/@radix-ui/react-presence/dist/index.mjs
function se(e, t) {
	return c.useReducer((e, n) => t[e][n] ?? e, e);
}
var ce = (e) => {
	let { present: t, children: n } = e, r = M(t), i = typeof n == "function" ? n({ present: r.isPresent }) : c.Children.only(n), a = S(r.ref, le(i));
	return typeof n == "function" || r.isPresent ? c.cloneElement(i, { ref: a }) : null;
};
ce.displayName = "Presence";
function M(e) {
	let [t, n] = c.useState(), r = c.useRef(null), i = c.useRef(e), a = c.useRef("none"), [o, s] = se(e ? "mounted" : "unmounted", {
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
	return c.useEffect(() => {
		let e = N(r.current);
		a.current = o === "mounted" ? e : "none";
	}, [o]), A(() => {
		let t = r.current, n = i.current;
		if (n !== e) {
			let r = a.current, o = N(t);
			e ? s("MOUNT") : o === "none" || t?.display === "none" ? s("UNMOUNT") : s(n && r !== o ? "ANIMATION_OUT" : "UNMOUNT"), i.current = e;
		}
	}, [e, s]), A(() => {
		if (t) {
			let e, n = t.ownerDocument.defaultView ?? window, o = (a) => {
				let o = N(r.current).includes(CSS.escape(a.animationName));
				if (a.target === t && o && (s("ANIMATION_END"), !i.current)) {
					let r = t.style.animationFillMode;
					t.style.animationFillMode = "forwards", e = n.setTimeout(() => {
						t.style.animationFillMode === "forwards" && (t.style.animationFillMode = r);
					});
				}
			}, c = (e) => {
				e.target === t && (a.current = N(r.current));
			};
			return t.addEventListener("animationstart", c), t.addEventListener("animationcancel", o), t.addEventListener("animationend", o), () => {
				n.clearTimeout(e), t.removeEventListener("animationstart", c), t.removeEventListener("animationcancel", o), t.removeEventListener("animationend", o);
			};
		} else s("ANIMATION_END");
	}, [t, s]), {
		isPresent: ["mounted", "unmountSuspended"].includes(o),
		ref: c.useCallback((e) => {
			r.current = e ? getComputedStyle(e) : null, n(e);
		}, [])
	};
}
function N(e) {
	return e?.animationName || "none";
}
function le(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function ue(e) {
	let t = c.useRef({
		value: e,
		previous: e
	});
	return c.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function P(e) {
	let [t, n] = c.useState(void 0);
	return A(() => {
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
var F = "Checkbox", [I, de] = D(F), [fe, L] = I(F);
function pe(e) {
	let { __scopeCheckbox: t, checked: n, children: r, defaultChecked: i, disabled: a, form: s, name: l, onCheckedChange: u, required: d, value: f = "on", internal_do_not_use_render: p } = e, [m, h] = j({
		prop: n,
		defaultProp: i ?? !1,
		onChange: u,
		caller: F
	}), [g, _] = c.useState(null), [v, y] = c.useState(null), ee = c.useRef(!1), b = g ? !!s || !!g.closest("form") : !0, x = {
		checked: m,
		disabled: a,
		setChecked: h,
		control: g,
		setControl: _,
		name: l,
		form: s,
		value: f,
		hasConsumerStoppedPropagationRef: ee,
		required: d,
		defaultChecked: R(i) ? !1 : i,
		isFormControl: b,
		bubbleInput: v,
		setBubbleInput: y
	};
	return /* @__PURE__ */ o(fe, {
		scope: t,
		...x,
		children: xe(p) ? p(x) : r
	});
}
var me = "CheckboxTrigger", he = c.forwardRef(({ __scopeCheckbox: e, onKeyDown: t, onClick: n, ...r }, i) => {
	let { control: a, value: s, disabled: l, checked: u, required: d, setControl: f, setChecked: p, hasConsumerStoppedPropagationRef: m, isFormControl: h, bubbleInput: g } = L(me, e), _ = S(i, f), v = c.useRef(u);
	return c.useEffect(() => {
		let e = a?.form;
		if (e) {
			let t = () => p(v.current);
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [a, p]), /* @__PURE__ */ o(E.button, {
		type: "button",
		role: "checkbox",
		"aria-checked": R(u) ? "mixed" : u,
		"aria-required": d,
		"data-state": Se(u),
		"data-disabled": l ? "" : void 0,
		disabled: l,
		value: s,
		...r,
		ref: _,
		onKeyDown: k(t, (e) => {
			e.key === "Enter" && e.preventDefault();
		}),
		onClick: k(n, (e) => {
			p((e) => R(e) ? !0 : !e), g && h && (m.current = e.isPropagationStopped(), m.current || e.stopPropagation());
		})
	});
});
he.displayName = me;
var ge = c.forwardRef((e, t) => {
	let { __scopeCheckbox: n, name: r, checked: i, defaultChecked: c, required: l, disabled: u, value: d, onCheckedChange: f, form: p, ...m } = e;
	return /* @__PURE__ */ o(pe, {
		__scopeCheckbox: n,
		checked: i,
		defaultChecked: c,
		disabled: u,
		required: l,
		onCheckedChange: f,
		name: r,
		form: p,
		value: d,
		internal_do_not_use_render: ({ isFormControl: e }) => /* @__PURE__ */ s(a, { children: [/* @__PURE__ */ o(he, {
			...m,
			ref: t,
			__scopeCheckbox: n
		}), e && /* @__PURE__ */ o(be, { __scopeCheckbox: n })] })
	});
});
ge.displayName = F;
var _e = "CheckboxIndicator", ve = c.forwardRef((e, t) => {
	let { __scopeCheckbox: n, forceMount: r, ...i } = e, a = L(_e, n);
	return /* @__PURE__ */ o(ce, {
		present: r || R(a.checked) || a.checked === !0,
		children: /* @__PURE__ */ o(E.span, {
			"data-state": Se(a.checked),
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
ve.displayName = _e;
var ye = "CheckboxBubbleInput", be = c.forwardRef(({ __scopeCheckbox: e, ...t }, n) => {
	let { control: r, hasConsumerStoppedPropagationRef: i, checked: a, defaultChecked: s, required: l, disabled: u, name: d, value: f, form: p, bubbleInput: m, setBubbleInput: h } = L(ye, e), g = S(n, h), _ = ue(a), v = P(r);
	c.useEffect(() => {
		let e = m;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, n = Object.getOwnPropertyDescriptor(t, "checked").set, r = !i.current;
		if (_ !== a && n) {
			let t = new Event("click", { bubbles: r });
			e.indeterminate = R(a), n.call(e, R(a) ? !1 : a), e.dispatchEvent(t);
		}
	}, [
		m,
		_,
		a,
		i
	]);
	let y = c.useRef(R(a) ? !1 : a);
	return /* @__PURE__ */ o(E.input, {
		type: "checkbox",
		"aria-hidden": !0,
		defaultChecked: s ?? y.current,
		required: l,
		disabled: u,
		name: d,
		value: f,
		form: p,
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
be.displayName = ye;
function xe(e) {
	return typeof e == "function";
}
function R(e) {
	return e === "indeterminate";
}
function Se(e) {
	return R(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-label/dist/index.mjs
var Ce = "Label", we = c.forwardRef((e, t) => /* @__PURE__ */ o(E.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
we.displayName = Ce;
var Te = we;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function Ee(e) {
	let t = /* @__PURE__ */ Oe(e), n = c.forwardRef((e, n) => {
		let { children: r, ...i } = e, a = c.Children.toArray(r), s = a.find(Ae);
		if (s) {
			let e = s.props.children, r = a.map((t) => t === s ? c.Children.count(e) > 1 ? c.Children.only(null) : c.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ o(t, {
				...i,
				ref: n,
				children: c.isValidElement(e) ? c.cloneElement(e, void 0, r) : null
			});
		}
		return /* @__PURE__ */ o(t, {
			...i,
			ref: n,
			children: r
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
var De = /* @__PURE__ */ Ee("Slot");
/* @__NO_SIDE_EFFECTS__ */
function Oe(e) {
	let t = c.forwardRef((e, t) => {
		let { children: n, ...r } = e;
		if (c.isValidElement(n)) {
			let e = Me(n), i = je(r, n.props);
			return n.type !== c.Fragment && (i.ref = t ? x(t, e) : e), c.cloneElement(n, i);
		}
		return c.Children.count(n) > 1 ? c.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var ke = Symbol("radix.slottable");
function Ae(e) {
	return c.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === ke;
}
function je(e, t) {
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
function Me(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/tailwind-merge/dist/bundle-mjs.mjs
var Ne = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, Pe = (e, t) => ({
	classGroupId: e,
	validator: t
}), Fe = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), Ie = "-", Le = [], Re = "arbitrary..", ze = (e) => {
	let t = He(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return Ve(e);
			let n = e.split(Ie);
			return Be(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? Ne(i, t) : t : i || Le;
			}
			return n[e] || Le;
		}
	};
}, Be = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = Be(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(Ie) : e.slice(t).join(Ie), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, Ve = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? Re + r : void 0;
})(), He = (e) => {
	let { theme: t, classGroups: n } = e;
	return Ue(n, t);
}, Ue = (e, t) => {
	let n = Fe();
	for (let r in e) {
		let i = e[r];
		We(i, n, r, t);
	}
	return n;
}, We = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		Ge(i, t, n, r);
	}
}, Ge = (e, t, n, r) => {
	if (typeof e == "string") {
		Ke(e, t, n);
		return;
	}
	if (typeof e == "function") {
		qe(e, t, n, r);
		return;
	}
	Je(e, t, n, r);
}, Ke = (e, t, n) => {
	let r = e === "" ? t : Ye(t, e);
	r.classGroupId = n;
}, qe = (e, t, n, r) => {
	if (Xe(e)) {
		We(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(Pe(n, e));
}, Je = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		We(o, Ye(t, a), n, r);
	}
}, Ye = (e, t) => {
	let n = e, r = t.split(Ie), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = Fe(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, Xe = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Ze = (e) => {
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
}, Qe = "!", $e = ":", et = [], tt = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), nt = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === $e) {
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
		s.endsWith(Qe) ? (c = s.slice(0, -1), l = !0) : s.startsWith(Qe) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return tt(t, l, c, u);
	};
	if (t) {
		let e = t + $e, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : tt(et, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, rt = (e) => {
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
}, it = (e) => ({
	cache: Ze(e.cacheSize),
	parseClassName: nt(e),
	sortModifiers: rt(e),
	...ze(e)
}), at = /\s+/, ot = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(at), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + Qe : g, v = _ + h;
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
}, st = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = ct(n)) && (i && (i += " "), i += r);
	return i;
}, ct = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = ct(e[r])) && (n && (n += " "), n += t);
	return n;
}, lt = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = it(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = ot(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(st(...e));
}, ut = [], z = (e) => {
	let t = (t) => t[e] || ut;
	return t.isThemeGetter = !0, t;
}, dt = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, ft = /^\((?:(\w[\w-]*):)?(.+)\)$/i, pt = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, mt = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, ht = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, gt = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, _t = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, vt = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, B = (e) => pt.test(e), V = (e) => !!e && !Number.isNaN(Number(e)), H = (e) => !!e && Number.isInteger(Number(e)), yt = (e) => e.endsWith("%") && V(e.slice(0, -1)), U = (e) => mt.test(e), bt = () => !0, xt = (e) => ht.test(e) && !gt.test(e), St = () => !1, Ct = (e) => _t.test(e), wt = (e) => vt.test(e), Tt = (e) => !W(e) && !K(e), Et = (e) => q(e, Ht, St), W = (e) => dt.test(e), G = (e) => q(e, Ut, xt), Dt = (e) => q(e, Wt, V), Ot = (e) => q(e, Kt, bt), kt = (e) => q(e, Gt, St), At = (e) => q(e, Bt, St), jt = (e) => q(e, Vt, wt), Mt = (e) => q(e, qt, Ct), K = (e) => ft.test(e), Nt = (e) => J(e, Ut), Pt = (e) => J(e, Gt), Ft = (e) => J(e, Bt), It = (e) => J(e, Ht), Lt = (e) => J(e, Vt), Rt = (e) => J(e, qt, !0), zt = (e) => J(e, Kt, !0), q = (e, t, n) => {
	let r = dt.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, J = (e, t, n = !1) => {
	let r = ft.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, Bt = (e) => e === "position" || e === "percentage", Vt = (e) => e === "image" || e === "url", Ht = (e) => e === "length" || e === "size" || e === "bg-size", Ut = (e) => e === "length", Wt = (e) => e === "number", Gt = (e) => e === "family-name", Kt = (e) => e === "number" || e === "weight", qt = (e) => e === "shadow", Jt = /* @__PURE__ */ lt(() => {
	let e = z("color"), t = z("font"), n = z("text"), r = z("font-weight"), i = z("tracking"), a = z("leading"), o = z("breakpoint"), s = z("container"), c = z("spacing"), l = z("radius"), u = z("shadow"), d = z("inset-shadow"), f = z("text-shadow"), p = z("drop-shadow"), m = z("blur"), h = z("perspective"), g = z("aspect"), _ = z("ease"), v = z("animate"), y = () => [
		"auto",
		"avoid",
		"all",
		"avoid-page",
		"page",
		"left",
		"right",
		"column"
	], ee = () => [
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
	], b = () => [
		...ee(),
		K,
		W
	], x = () => [
		"auto",
		"hidden",
		"clip",
		"visible",
		"scroll"
	], S = () => [
		"auto",
		"contain",
		"none"
	], C = () => [
		K,
		W,
		c
	], w = () => [
		B,
		"full",
		"auto",
		...C()
	], te = () => [
		H,
		"none",
		"subgrid",
		K,
		W
	], ne = () => [
		"auto",
		{ span: [
			"full",
			H,
			K,
			W
		] },
		H,
		K,
		W
	], T = () => [
		H,
		"auto",
		K,
		W
	], re = () => [
		"auto",
		"min",
		"max",
		"fr",
		K,
		W
	], E = () => [
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
		B,
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
	], A = () => [
		B,
		"screen",
		"full",
		"dvw",
		"lvw",
		"svw",
		"min",
		"max",
		"fit",
		...C()
	], ie = () => [
		B,
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
	], j = () => [
		e,
		K,
		W
	], ae = () => [
		...ee(),
		Ft,
		At,
		{ position: [K, W] }
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
		It,
		Et,
		{ size: [K, W] }
	], ce = () => [
		yt,
		Nt,
		G
	], M = () => [
		"",
		"none",
		"full",
		l,
		K,
		W
	], N = () => [
		"",
		V,
		Nt,
		G
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
		V,
		yt,
		Ft,
		At
	], F = () => [
		"",
		"none",
		m,
		K,
		W
	], I = () => [
		"none",
		V,
		K,
		W
	], de = () => [
		"none",
		V,
		K,
		W
	], fe = () => [
		V,
		K,
		W
	], L = () => [
		B,
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
			blur: [U],
			breakpoint: [U],
			color: [bt],
			container: [U],
			"drop-shadow": [U],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [Tt],
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
			"inset-shadow": [U],
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
			radius: [U],
			shadow: [U],
			spacing: ["px", V],
			text: [U],
			"text-shadow": [U],
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
				B,
				W,
				K,
				g
			] }],
			container: ["container"],
			columns: [{ columns: [
				V,
				W,
				K,
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
			"object-position": [{ object: b() }],
			overflow: [{ overflow: x() }],
			"overflow-x": [{ "overflow-x": x() }],
			"overflow-y": [{ "overflow-y": x() }],
			overscroll: [{ overscroll: S() }],
			"overscroll-x": [{ "overscroll-x": S() }],
			"overscroll-y": [{ "overscroll-y": S() }],
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
				H,
				"auto",
				K,
				W
			] }],
			basis: [{ basis: [
				B,
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
				V,
				B,
				"auto",
				"initial",
				"none",
				W
			] }],
			grow: [{ grow: [
				"",
				V,
				K,
				W
			] }],
			shrink: [{ shrink: [
				"",
				V,
				K,
				W
			] }],
			order: [{ order: [
				H,
				"first",
				"last",
				"none",
				K,
				W
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
			"auto-cols": [{ "auto-cols": re() }],
			"auto-rows": [{ "auto-rows": re() }],
			gap: [{ gap: C() }],
			"gap-x": [{ "gap-x": C() }],
			"gap-y": [{ "gap-y": C() }],
			"justify-content": [{ justify: [...E(), "normal"] }],
			"justify-items": [{ "justify-items": [...D(), "normal"] }],
			"justify-self": [{ "justify-self": ["auto", ...D()] }],
			"align-content": [{ content: ["normal", ...E()] }],
			"align-items": [{ items: [...D(), { baseline: ["", "last"] }] }],
			"align-self": [{ self: [
				"auto",
				...D(),
				{ baseline: ["", "last"] }
			] }],
			"place-content": [{ "place-content": E() }],
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
			"inline-size": [{ inline: ["auto", ...A()] }],
			"min-inline-size": [{ "min-inline": ["auto", ...A()] }],
			"max-inline-size": [{ "max-inline": ["none", ...A()] }],
			"block-size": [{ block: ["auto", ...ie()] }],
			"min-block-size": [{ "min-block": ["auto", ...ie()] }],
			"max-block-size": [{ "max-block": ["none", ...ie()] }],
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
				Nt,
				G
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				zt,
				Ot
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
				yt,
				W
			] }],
			"font-family": [{ font: [
				Pt,
				kt,
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
				K,
				W
			] }],
			"line-clamp": [{ "line-clamp": [
				V,
				"none",
				K,
				Dt
			] }],
			leading: [{ leading: [a, ...C()] }],
			"list-image": [{ "list-image": [
				"none",
				K,
				W
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				K,
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
				V,
				"from-font",
				"auto",
				K,
				G
			] }],
			"text-decoration-color": [{ decoration: j() }],
			"underline-offset": [{ "underline-offset": [
				V,
				"auto",
				K,
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
				K,
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
				K,
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
						H,
						K,
						W
					],
					radial: [
						"",
						K,
						W
					],
					conic: [
						H,
						K,
						W
					]
				},
				Lt,
				jt
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
				V,
				K,
				W
			] }],
			"outline-w": [{ outline: [
				"",
				V,
				Nt,
				G
			] }],
			"outline-color": [{ outline: j() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				Rt,
				Mt
			] }],
			"shadow-color": [{ shadow: j() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				Rt,
				Mt
			] }],
			"inset-shadow-color": [{ "inset-shadow": j() }],
			"ring-w": [{ ring: N() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: j() }],
			"ring-offset-w": [{ "ring-offset": [V, G] }],
			"ring-offset-color": [{ "ring-offset": j() }],
			"inset-ring-w": [{ "inset-ring": N() }],
			"inset-ring-color": [{ "inset-ring": j() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				Rt,
				Mt
			] }],
			"text-shadow-color": [{ "text-shadow": j() }],
			opacity: [{ opacity: [
				V,
				K,
				W
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
			"mask-image-linear-pos": [{ "mask-linear": [V] }],
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
			"mask-image-radial": [{ "mask-radial": [K, W] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": P() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": P() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": j() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": j() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": ee() }],
			"mask-image-conic-pos": [{ "mask-conic": [V] }],
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
				K,
				W
			] }],
			filter: [{ filter: [
				"",
				"none",
				K,
				W
			] }],
			blur: [{ blur: F() }],
			brightness: [{ brightness: [
				V,
				K,
				W
			] }],
			contrast: [{ contrast: [
				V,
				K,
				W
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				Rt,
				Mt
			] }],
			"drop-shadow-color": [{ "drop-shadow": j() }],
			grayscale: [{ grayscale: [
				"",
				V,
				K,
				W
			] }],
			"hue-rotate": [{ "hue-rotate": [
				V,
				K,
				W
			] }],
			invert: [{ invert: [
				"",
				V,
				K,
				W
			] }],
			saturate: [{ saturate: [
				V,
				K,
				W
			] }],
			sepia: [{ sepia: [
				"",
				V,
				K,
				W
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				K,
				W
			] }],
			"backdrop-blur": [{ "backdrop-blur": F() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				V,
				K,
				W
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				V,
				K,
				W
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				V,
				K,
				W
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				V,
				K,
				W
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				V,
				K,
				W
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				V,
				K,
				W
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				V,
				K,
				W
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				V,
				K,
				W
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
				K,
				W
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				V,
				"initial",
				K,
				W
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				K,
				W
			] }],
			delay: [{ delay: [
				V,
				K,
				W
			] }],
			animate: [{ animate: [
				"none",
				v,
				K,
				W
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				K,
				W
			] }],
			"perspective-origin": [{ "perspective-origin": b() }],
			rotate: [{ rotate: I() }],
			"rotate-x": [{ "rotate-x": I() }],
			"rotate-y": [{ "rotate-y": I() }],
			"rotate-z": [{ "rotate-z": I() }],
			scale: [{ scale: de() }],
			"scale-x": [{ "scale-x": de() }],
			"scale-y": [{ "scale-y": de() }],
			"scale-z": [{ "scale-z": de() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: fe() }],
			"skew-x": [{ "skew-x": fe() }],
			"skew-y": [{ "skew-y": fe() }],
			transform: [{ transform: [
				K,
				W,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: b() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: L() }],
			"translate-x": [{ "translate-x": L() }],
			"translate-y": [{ "translate-y": L() }],
			"translate-z": [{ "translate-z": L() }],
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
				K,
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
				K,
				W
			] }],
			fill: [{ fill: ["none", ...j()] }],
			"stroke-w": [{ stroke: [
				V,
				Nt,
				G,
				Dt
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
function Y(...e) {
	return Jt(_(e));
}
//#endregion
//#region src/components/ui/button.tsx
var Yt = ee("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
function Xt({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ o(r ? De : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: Y(Yt({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/lib/marketplace-api.ts
function Zt(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function X(e) {
	"@babel/helpers - typeof";
	return X = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, X(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function Qt(e, t) {
	if (X(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (X(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function $t(e) {
	var t = Qt(e, "string");
	return X(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function en(e, t, n) {
	return (t = $t(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/lib/apiError.ts
var Z = class extends Error {
	constructor(e, t) {
		super(e), en(this, "code", void 0), en(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, tn = {
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
function nn(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function rn(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function an(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(Zt(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function on(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return an(e, n);
	if (t instanceof Z && t.code) {
		let n = tn[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = tn[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return nn(n) ? e("errors.api.timeout") : rn(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function sn(e, t) {
	i.error(on(e, t));
}
//#endregion
//#region src/lib/safeUrl.ts
function cn(e) {
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
function ln() {
	return window.webinoDashboard;
}
var un = 3e4;
function dn(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function fn(e) {
	let t = ln();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (dn(e) || cn(e)) return e;
	throw new Z("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function pn(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function mn(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : null;
}
function hn(e, t) {
	let n = e.toLowerCase();
	return e.includes("Upstream Error") || e.includes("Forbidden") || t === 403 ? "admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry" : n.includes("timed out") || n.includes("timeout") || t === 504 || t === 524 ? "Request timed out — RSA-4096 generation can take over a minute on weak hosts" : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? `Invalid AJAX response (HTML, HTTP ${t || 0})` : `Invalid AJAX response (HTTP ${t || 0})`;
}
async function gn(e, t, n = {}) {
	let r = mn(e), i = ln();
	if (!r || !i.ajaxUrl) throw new Z("AJAX fallback unavailable", {
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
	let { signal: l, clear: u } = pn({}, t);
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
			throw new Z(hn(t, e.status), {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!n.success) throw new Z(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
			code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
			status: e.status
		});
		return n.data;
	} finally {
		u();
	}
}
async function _n(e, t = {}, n = un) {
	if (mn(e) && ln().ajaxUrl) return gn(e, n, t);
	let r = fn(e), i = ln(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce);
	let { signal: s, clear: c } = pn(t, n);
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
			throw new Z(n.includes("Upstream Error") || n.includes("Forbidden") ? "REST blocked by CDN/WAF — use admin-ajax fallback or whitelist /wp-json/" : "Invalid JSON response", {
				code: "invalid_json",
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i;
			throw new Z(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
		}
		return i;
	} catch (e) {
		throw e instanceof Z ? e : e instanceof DOMException && e.name === "AbortError" ? new Z("Request timed out", {
			code: "timeout",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region ../Modules/card-to-card-gateway-module/client/pages/C2CReceiptsPage.tsx
function vn() {
	let { t: a } = r(), c = n(), l = t({
		queryKey: ["c2c", "receipts"],
		queryFn: () => _n("c2c/receipts?status=pending")
	}), u = e({
		mutationFn: async (e) => _n(`c2c/receipts/${e.id}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ action: e.action })
		}),
		onSuccess: async () => {
			i.success(a("common.saved")), await c.invalidateQueries({ queryKey: ["c2c", "receipts"] });
		},
		onError: (e) => sn(a, e)
	}), d = l.data?.items ?? [];
	return /* @__PURE__ */ o(h, {
		title: a("c2c.receiptsTitle"),
		subtitle: a("c2c.receiptsSubtitle"),
		children: l.isLoading ? /* @__PURE__ */ o("p", {
			className: "text-muted-foreground text-sm",
			children: a("common.loading")
		}) : d.length === 0 ? /* @__PURE__ */ o("p", {
			className: "text-muted-foreground text-sm",
			children: a("c2c.empty")
		}) : /* @__PURE__ */ o("div", {
			className: "grid gap-4",
			children: d.map((e) => /* @__PURE__ */ s("article", {
				className: "grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[180px_1fr_auto] md:items-center",
				children: [
					/* @__PURE__ */ o("div", {
						className: "overflow-hidden rounded-md border bg-muted",
						children: e.thumb_url ? /* @__PURE__ */ o("a", {
							href: e.receipt_url || e.thumb_url,
							target: "_blank",
							rel: "noreferrer",
							children: /* @__PURE__ */ o("img", {
								src: e.thumb_url,
								alt: "",
								className: "h-40 w-full object-cover"
							})
						}) : /* @__PURE__ */ o("div", {
							className: "text-muted-foreground flex h-40 items-center justify-center text-xs",
							children: a("c2c.noImage")
						})
					}),
					/* @__PURE__ */ s("div", {
						className: "space-y-1 text-sm",
						children: [
							/* @__PURE__ */ s("p", {
								className: "font-semibold",
								children: [
									a("c2c.order"),
									" #",
									e.number
								]
							}),
							/* @__PURE__ */ s("p", { children: [
								a("c2c.amount"),
								":",
								" ",
								/* @__PURE__ */ o("span", { dangerouslySetInnerHTML: { __html: e.total_html } })
							] }),
							e.customer ? /* @__PURE__ */ s("p", { children: [
								a("c2c.customer"),
								": ",
								e.customer
							] }) : null,
							e.date ? /* @__PURE__ */ o("p", {
								className: "text-muted-foreground",
								children: e.date
							}) : null,
							e.edit_url ? /* @__PURE__ */ o("p", { children: /* @__PURE__ */ o("a", {
								className: "text-primary underline-offset-4 hover:underline",
								href: e.edit_url,
								children: a("c2c.openOrder")
							}) }) : null
						]
					}),
					/* @__PURE__ */ s("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ o(Xt, {
							type: "button",
							disabled: u.isPending,
							onClick: () => void u.mutateAsync({
								id: e.id,
								action: "approve"
							}),
							children: a("c2c.approve")
						}), /* @__PURE__ */ o(Xt, {
							type: "button",
							variant: "destructive",
							disabled: u.isPending,
							onClick: () => void u.mutateAsync({
								id: e.id,
								action: "reject"
							}),
							children: a("c2c.reject")
						})]
					})
				]
			}, e.id))
		})
	});
}
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var yn = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), bn = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), xn = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), Sn = (e) => {
	let t = xn(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, Cn = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, wn = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, Tn = l({}), En = () => f(Tn), Dn = d(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: a, iconNode: o, ...s }, c) => {
	let { size: l = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = En() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? l) : n ?? d;
	return u("svg", {
		ref: c,
		...Cn,
		width: t ?? l ?? Cn.width,
		height: t ?? l ?? Cn.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: yn("lucide", m, i),
		...!a && !wn(s) && { "aria-hidden": "true" },
		...s
	}, [...o.map(([e, t]) => u(e, t)), ...Array.isArray(a) ? a : [a]]);
}), On = ((e, t) => {
	let n = d(({ className: n, ...r }, i) => u(Dn, {
		ref: i,
		iconNode: t,
		className: yn(`lucide-${bn(Sn(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = Sn(e), n;
})("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]);
//#endregion
//#region src/components/ui/checkbox.tsx
function kn({ className: e, ...t }) {
	return /* @__PURE__ */ o(ge, {
		"data-slot": "checkbox",
		className: Y("peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary", e),
		...t,
		children: /* @__PURE__ */ o(ve, {
			"data-slot": "checkbox-indicator",
			className: "grid place-content-center text-current transition-none",
			children: /* @__PURE__ */ o(On, { className: "size-3.5" })
		})
	});
}
//#endregion
//#region src/components/ui/input.tsx
function Q({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ o("input", {
		type: t,
		"data-slot": "input",
		className: Y("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function $({ className: e, ...t }) {
	return /* @__PURE__ */ o(Te, {
		"data-slot": "label",
		className: Y("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/components/ui/textarea.tsx
function An({ className: e, ...t }) {
	return /* @__PURE__ */ o("textarea", {
		"data-slot": "textarea",
		className: Y("flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-start shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40", e),
		...t
	});
}
//#endregion
//#region ../Modules/card-to-card-gateway-module/client/pages/C2CSettingsPage.tsx
var jn = () => ({
	number: "",
	name: "",
	bank: ""
});
function Mn() {
	let { t: a } = r(), c = n(), [l, u] = m(null), d = t({
		queryKey: ["c2c", "settings"],
		queryFn: () => _n("c2c/settings")
	});
	p(() => {
		if (!d.data?.settings) return;
		let e = d.data.settings;
		u({
			...e,
			cards: e.cards?.length ? e.cards : [jn()]
		});
	}, [d.data]);
	let f = e({
		mutationFn: async () => _n("c2c/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				...l,
				cards: (l?.cards ?? []).filter((e) => e.number.trim() !== "")
			})
		}),
		onSuccess: async (e) => {
			i.success(a("common.saved")), e.settings && u({
				...e.settings,
				cards: e.settings.cards?.length ? e.settings.cards : [jn()]
			}), await c.invalidateQueries({ queryKey: ["c2c", "settings"] }), await c.invalidateQueries({ queryKey: ["payment-gateways"] });
		},
		onError: (e) => sn(a, e)
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
	return /* @__PURE__ */ o(h, {
		title: a("c2c.title"),
		subtitle: a("c2c.subtitle"),
		children: l ? /* @__PURE__ */ s("div", {
			className: "grid max-w-2xl gap-4",
			children: [
				/* @__PURE__ */ s("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ o(kn, {
						id: "c2c-enabled",
						checked: l.enabled,
						onCheckedChange: (e) => u({
							...l,
							enabled: e === !0
						})
					}), /* @__PURE__ */ o($, {
						htmlFor: "c2c-enabled",
						children: a("c2c.enabled")
					})]
				}),
				/* @__PURE__ */ s("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ o($, { children: a("c2c.checkoutTitle") }), /* @__PURE__ */ o(Q, {
						value: l.title,
						onChange: (e) => u({
							...l,
							title: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ s("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ o($, { children: a("c2c.instructions") }), /* @__PURE__ */ o(An, {
						value: l.instructions,
						onChange: (e) => u({
							...l,
							instructions: e.target.value
						}),
						rows: 3
					})]
				}),
				/* @__PURE__ */ s("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ o($, { children: a("c2c.iban") }), /* @__PURE__ */ o(Q, {
						value: l.iban,
						onChange: (e) => u({
							...l,
							iban: e.target.value
						}),
						className: "font-mono"
					})]
				}),
				/* @__PURE__ */ s("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ o($, { children: a("c2c.deadline") }), /* @__PURE__ */ o(Q, {
						type: "number",
						min: 1,
						max: 72,
						value: l.deadline_h,
						onChange: (e) => u({
							...l,
							deadline_h: Number(e.target.value) || 1
						})
					})]
				}),
				/* @__PURE__ */ s("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ o($, { children: a("c2c.cards") }),
						l.cards.map((e, t) => /* @__PURE__ */ s("div", {
							className: "grid gap-2 rounded-lg border border-border p-3 md:grid-cols-3",
							children: [
								/* @__PURE__ */ o(Q, {
									placeholder: a("c2c.cardNumber"),
									value: e.number,
									className: "font-mono",
									onChange: (e) => g(t, { number: e.target.value })
								}),
								/* @__PURE__ */ o(Q, {
									placeholder: a("c2c.cardName"),
									value: e.name,
									onChange: (e) => g(t, { name: e.target.value })
								}),
								/* @__PURE__ */ o(Q, {
									placeholder: a("c2c.cardBank"),
									value: e.bank,
									onChange: (e) => g(t, { bank: e.target.value })
								})
							]
						}, t)),
						/* @__PURE__ */ o(Xt, {
							type: "button",
							variant: "outline",
							onClick: () => u({
								...l,
								cards: [...l.cards, jn()]
							}),
							children: a("c2c.addCard")
						})
					]
				}),
				/* @__PURE__ */ o("div", { children: /* @__PURE__ */ o(Xt, {
					type: "button",
					disabled: f.isPending,
					onClick: () => void f.mutateAsync(),
					children: a("common.save")
				}) })
			]
		}) : /* @__PURE__ */ o("p", {
			className: "text-muted-foreground text-sm",
			children: a("common.loading")
		})
	});
}
//#endregion
//#region ../Modules/card-to-card-gateway-module/client/module-entry.tsx
var Nn = {
	"settings/shop/c2c": Mn,
	"shop/c2c-receipts": vn
}, Pn = { routes: Nn };
//#endregion
export { Pn as default, Nn as routes };
