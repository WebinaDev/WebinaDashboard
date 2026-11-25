import { useMutation as e, useQuery as t, useQueryClient as n } from "@tanstack/react-query";
import * as r from "react";
import { createContext as i, createElement as a, forwardRef as o, useContext as s, useEffect as c, useState as l } from "react";
import { useTranslation as u } from "react-i18next";
import { useLocation as d } from "react-router-dom";
import { toast as f } from "sonner";
import { Fragment as p, jsx as m, jsxs as h } from "react/jsx-runtime";
import "react-dom";
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var g = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), _ = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), v = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), y = (e) => {
	let t = v(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, b = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, x = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, S = i({}), ee = () => s(S), C = o(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: o, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = ee() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return a("svg", {
		ref: l,
		...b,
		width: t ?? u ?? b.width,
		height: t ?? u ?? b.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: g("lucide", m, i),
		...!o && !x(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => a(e, t)), ...Array.isArray(o) ? o : [o]]);
}), w = ((e, t) => {
	let n = o(({ className: n, ...r }, i) => a(C, {
		ref: i,
		iconNode: t,
		className: g(`lucide-${_(y(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = y(e), n;
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
}]]);
//#endregion
//#region src/components/PageShell.tsx
function T({ title: e, description: t, eyebrow: n, children: r }) {
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
//#region node_modules/clsx/dist/clsx.mjs
function te(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") if (Array.isArray(e)) {
		var i = e.length;
		for (t = 0; t < i; t++) e[t] && (n = te(e[t])) && (r && (r += " "), r += n);
	} else for (n in e) e[n] && (r && (r += " "), r += n);
	return r;
}
function E() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = te(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/class-variance-authority/dist/index.mjs
var ne = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, D = E, O = (e, t) => (n) => {
	if (t?.variants == null) return D(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = ne(t) || ne(a);
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
function j(...e) {
	return r.useCallback(A(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function re(e) {
	let t = /* @__PURE__ */ M(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(ae);
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
function M(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = se(n), a = oe(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? A(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var ie = Symbol("radix.slottable");
function ae(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === ie;
}
function oe(e, t) {
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
function se(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/dist/index.mjs
var N = [
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
	let n = /* @__PURE__ */ re(`Primitive.${t}`), i = r.forwardRef((e, r) => {
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
function P(e, t = []) {
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
	return a.scopeName = e, [i, F(a, ...t)];
}
function F(...e) {
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
function ce(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var I = globalThis?.document ? r.useLayoutEffect : () => {}, le = r.useInsertionEffect || I;
function ue({ prop: e, defaultProp: t, onChange: n = () => {}, caller: i }) {
	let [a, o, s] = de({
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
			let n = fe(t) ? t(e) : t;
			n !== e && s.current?.(n);
		} else o(t);
	}, [
		c,
		e,
		o,
		s
	])];
}
function de({ defaultProp: e, onChange: t }) {
	let [n, i] = r.useState(e), a = r.useRef(n), o = r.useRef(t);
	return le(() => {
		o.current = t;
	}, [t]), r.useEffect(() => {
		a.current !== n && (o.current?.(n), a.current = n);
	}, [n, a]), [
		n,
		i,
		o
	];
}
function fe(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function L(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function pe(e) {
	let [t, n] = r.useState(void 0);
	return I(() => {
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
var me = "Label", he = r.forwardRef((e, t) => /* @__PURE__ */ m(N.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
he.displayName = me;
var ge = he;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function _e(e) {
	let t = /* @__PURE__ */ ye(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(xe);
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
var ve = /* @__PURE__ */ _e("Slot");
/* @__NO_SIDE_EFFECTS__ */
function ye(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Ce(n), a = Se(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? A(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var be = Symbol("radix.slottable");
function xe(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === be;
}
function Se(e, t) {
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
function Ce(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-switch/dist/index.mjs
var we = "Switch", [Te, Ee] = P(we), [De, Oe] = Te(we), ke = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, name: i, checked: a, defaultChecked: o, required: s, disabled: c, value: l = "on", onCheckedChange: u, form: d, ...f } = e, [p, g] = r.useState(null), _ = j(t, (e) => g(e)), v = r.useRef(!1), y = p ? d || !!p.closest("form") : !0, [b, x] = ue({
		prop: a,
		defaultProp: o ?? !1,
		onChange: u,
		caller: we
	});
	return /* @__PURE__ */ h(De, {
		scope: n,
		checked: b,
		disabled: c,
		children: [/* @__PURE__ */ m(N.button, {
			type: "button",
			role: "switch",
			"aria-checked": b,
			"aria-required": s,
			"data-state": Pe(b),
			"data-disabled": c ? "" : void 0,
			disabled: c,
			value: l,
			...f,
			ref: _,
			onClick: ce(e.onClick, (e) => {
				x((e) => !e), y && (v.current = e.isPropagationStopped(), v.current || e.stopPropagation());
			})
		}), y && /* @__PURE__ */ m(Ne, {
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
ke.displayName = we;
var Ae = "SwitchThumb", je = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, ...r } = e, i = Oe(Ae, n);
	return /* @__PURE__ */ m(N.span, {
		"data-state": Pe(i.checked),
		"data-disabled": i.disabled ? "" : void 0,
		...r,
		ref: t
	});
});
je.displayName = Ae;
var Me = "SwitchBubbleInput", Ne = r.forwardRef(({ __scopeSwitch: e, control: t, checked: n, bubbles: i = !0, ...a }, o) => {
	let s = r.useRef(null), c = j(s, o), l = L(n), u = pe(t);
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
	]), /* @__PURE__ */ m("input", {
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
Ne.displayName = Me;
function Pe(e) {
	return e ? "checked" : "unchecked";
}
var Fe = ke, Ie = je, Le = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, Re = (e, t) => ({
	classGroupId: e,
	validator: t
}), ze = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), Be = "-", Ve = [], He = "arbitrary..", Ue = (e) => {
	let t = Ke(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return Ge(e);
			let n = e.split(Be);
			return We(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? Le(i, t) : t : i || Ve;
			}
			return n[e] || Ve;
		}
	};
}, We = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = We(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(Be) : e.slice(t).join(Be), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, Ge = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? He + r : void 0;
})(), Ke = (e) => {
	let { theme: t, classGroups: n } = e;
	return qe(n, t);
}, qe = (e, t) => {
	let n = ze();
	for (let r in e) {
		let i = e[r];
		Je(i, n, r, t);
	}
	return n;
}, Je = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		Ye(i, t, n, r);
	}
}, Ye = (e, t, n, r) => {
	if (typeof e == "string") {
		Xe(e, t, n);
		return;
	}
	if (typeof e == "function") {
		Ze(e, t, n, r);
		return;
	}
	Qe(e, t, n, r);
}, Xe = (e, t, n) => {
	let r = e === "" ? t : $e(t, e);
	r.classGroupId = n;
}, Ze = (e, t, n, r) => {
	if (et(e)) {
		Je(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(Re(n, e));
}, Qe = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		Je(o, $e(t, a), n, r);
	}
}, $e = (e, t) => {
	let n = e, r = t.split(Be), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = ze(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, et = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, tt = (e) => {
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
}, nt = "!", rt = ":", it = [], at = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), ot = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === rt) {
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
		s.endsWith(nt) ? (c = s.slice(0, -1), l = !0) : s.startsWith(nt) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return at(t, l, c, u);
	};
	if (t) {
		let e = t + rt, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : at(it, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, st = (e) => {
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
}, ct = (e) => ({
	cache: tt(e.cacheSize),
	parseClassName: ot(e),
	sortModifiers: st(e),
	...Ue(e)
}), lt = /\s+/, ut = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(lt), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + nt : g, v = _ + h;
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
}, dt = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = ft(n)) && (i && (i += " "), i += r);
	return i;
}, ft = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = ft(e[r])) && (n && (n += " "), n += t);
	return n;
}, pt = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = ct(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = ut(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(dt(...e));
}, mt = [], R = (e) => {
	let t = (t) => t[e] || mt;
	return t.isThemeGetter = !0, t;
}, ht = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, gt = /^\((?:(\w[\w-]*):)?(.+)\)$/i, _t = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, vt = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, yt = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, bt = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, xt = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, St = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, z = (e) => _t.test(e), B = (e) => !!e && !Number.isNaN(Number(e)), V = (e) => !!e && Number.isInteger(Number(e)), Ct = (e) => e.endsWith("%") && B(e.slice(0, -1)), H = (e) => vt.test(e), wt = () => !0, Tt = (e) => yt.test(e) && !bt.test(e), Et = () => !1, Dt = (e) => xt.test(e), Ot = (e) => St.test(e), kt = (e) => !U(e) && !G(e), At = (e) => q(e, Gt, Et), U = (e) => ht.test(e), W = (e) => q(e, Kt, Tt), jt = (e) => q(e, qt, B), Mt = (e) => q(e, Yt, wt), Nt = (e) => q(e, Jt, Et), Pt = (e) => q(e, Ut, Et), Ft = (e) => q(e, Wt, Ot), It = (e) => q(e, Xt, Dt), G = (e) => gt.test(e), K = (e) => J(e, Kt), Lt = (e) => J(e, Jt), Rt = (e) => J(e, Ut), zt = (e) => J(e, Gt), Bt = (e) => J(e, Wt), Vt = (e) => J(e, Xt, !0), Ht = (e) => J(e, Yt, !0), q = (e, t, n) => {
	let r = ht.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, J = (e, t, n = !1) => {
	let r = gt.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, Ut = (e) => e === "position" || e === "percentage", Wt = (e) => e === "image" || e === "url", Gt = (e) => e === "length" || e === "size" || e === "bg-size", Kt = (e) => e === "length", qt = (e) => e === "number", Jt = (e) => e === "family-name", Yt = (e) => e === "number" || e === "weight", Xt = (e) => e === "shadow", Zt = /* @__PURE__ */ pt(() => {
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
	], T = () => [
		V,
		"none",
		"subgrid",
		G,
		U
	], te = () => [
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
	], E = () => [
		V,
		"auto",
		G,
		U
	], ne = () => [
		"auto",
		"min",
		"max",
		"fr",
		G,
		U
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
	], k = () => ["auto", ...C()], A = () => [
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
	], j = () => [
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
	], re = () => [
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
	], M = () => [
		e,
		G,
		U
	], ie = () => [
		...b(),
		Rt,
		Pt,
		{ position: [G, U] }
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
		zt,
		At,
		{ size: [G, U] }
	], se = () => [
		Ct,
		K,
		W
	], N = () => [
		"",
		"none",
		"full",
		l,
		G,
		U
	], P = () => [
		"",
		B,
		K,
		W
	], F = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	], ce = () => [
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
	], I = () => [
		B,
		Ct,
		Rt,
		Pt
	], le = () => [
		"",
		"none",
		m,
		G,
		U
	], ue = () => [
		"none",
		B,
		G,
		U
	], de = () => [
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
			color: [wt],
			container: [H],
			"drop-shadow": [H],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [kt],
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
			"grid-cols": [{ "grid-cols": T() }],
			"col-start-end": [{ col: te() }],
			"col-start": [{ "col-start": E() }],
			"col-end": [{ "col-end": E() }],
			"grid-rows": [{ "grid-rows": T() }],
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
			gap: [{ gap: C() }],
			"gap-x": [{ "gap-x": C() }],
			"gap-y": [{ "gap-y": C() }],
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
			"space-x": [{ "space-x": C() }],
			"space-x-reverse": ["space-x-reverse"],
			"space-y": [{ "space-y": C() }],
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
				K,
				W
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				Ht,
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
				Ct,
				U
			] }],
			"font-family": [{ font: [
				Lt,
				Nt,
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
				jt
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
			"placeholder-color": [{ placeholder: M() }],
			"text-color": [{ text: M() }],
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			"text-decoration-style": [{ decoration: [...F(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				B,
				"from-font",
				"auto",
				G,
				W
			] }],
			"text-decoration-color": [{ decoration: M() }],
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
				Bt,
				Ft
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
				...F(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...F(),
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
				...F(),
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
			"outline-color": [{ outline: M() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				Vt,
				It
			] }],
			"shadow-color": [{ shadow: M() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				Vt,
				It
			] }],
			"inset-shadow-color": [{ "inset-shadow": M() }],
			"ring-w": [{ ring: P() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: M() }],
			"ring-offset-w": [{ "ring-offset": [B, W] }],
			"ring-offset-color": [{ "ring-offset": M() }],
			"inset-ring-w": [{ "inset-ring": P() }],
			"inset-ring-color": [{ "inset-ring": M() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				Vt,
				It
			] }],
			"text-shadow-color": [{ "text-shadow": M() }],
			opacity: [{ opacity: [
				B,
				G,
				U
			] }],
			"mix-blend": [{ "mix-blend": [
				...ce(),
				"plus-darker",
				"plus-lighter"
			] }],
			"bg-blend": [{ "bg-blend": ce() }],
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
			"mask-image-linear-from-pos": [{ "mask-linear-from": I() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": I() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": M() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": M() }],
			"mask-image-t-from-pos": [{ "mask-t-from": I() }],
			"mask-image-t-to-pos": [{ "mask-t-to": I() }],
			"mask-image-t-from-color": [{ "mask-t-from": M() }],
			"mask-image-t-to-color": [{ "mask-t-to": M() }],
			"mask-image-r-from-pos": [{ "mask-r-from": I() }],
			"mask-image-r-to-pos": [{ "mask-r-to": I() }],
			"mask-image-r-from-color": [{ "mask-r-from": M() }],
			"mask-image-r-to-color": [{ "mask-r-to": M() }],
			"mask-image-b-from-pos": [{ "mask-b-from": I() }],
			"mask-image-b-to-pos": [{ "mask-b-to": I() }],
			"mask-image-b-from-color": [{ "mask-b-from": M() }],
			"mask-image-b-to-color": [{ "mask-b-to": M() }],
			"mask-image-l-from-pos": [{ "mask-l-from": I() }],
			"mask-image-l-to-pos": [{ "mask-l-to": I() }],
			"mask-image-l-from-color": [{ "mask-l-from": M() }],
			"mask-image-l-to-color": [{ "mask-l-to": M() }],
			"mask-image-x-from-pos": [{ "mask-x-from": I() }],
			"mask-image-x-to-pos": [{ "mask-x-to": I() }],
			"mask-image-x-from-color": [{ "mask-x-from": M() }],
			"mask-image-x-to-color": [{ "mask-x-to": M() }],
			"mask-image-y-from-pos": [{ "mask-y-from": I() }],
			"mask-image-y-to-pos": [{ "mask-y-to": I() }],
			"mask-image-y-from-color": [{ "mask-y-from": M() }],
			"mask-image-y-to-color": [{ "mask-y-to": M() }],
			"mask-image-radial": [{ "mask-radial": [G, U] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": I() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": I() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": M() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": M() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [B] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": I() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": I() }],
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
				G,
				U
			] }],
			filter: [{ filter: [
				"",
				"none",
				G,
				U
			] }],
			blur: [{ blur: le() }],
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
				Vt,
				It
			] }],
			"drop-shadow-color": [{ "drop-shadow": M() }],
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
			"backdrop-blur": [{ "backdrop-blur": le() }],
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
			fill: [{ fill: ["none", ...M()] }],
			"stroke-w": [{ stroke: [
				B,
				K,
				W,
				jt
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
function Y(...e) {
	return Zt(E(e));
}
//#endregion
//#region src/components/ui/button.tsx
var Qt = O("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
function $t({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ m(r ? ve : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: Y(Qt({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/components/ui/card.tsx
var en = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function tn({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ m("div", {
		"data-slot": "card",
		"data-variant": t,
		className: Y("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", en[t], e),
		...n
	});
}
function nn({ className: e, ...t }) {
	return /* @__PURE__ */ m("div", {
		"data-slot": "card-header",
		className: Y("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function rn({ className: e, ...t }) {
	return /* @__PURE__ */ m("div", {
		"data-slot": "card-title",
		className: Y("leading-none font-semibold", e),
		...t
	});
}
function an({ className: e, ...t }) {
	return /* @__PURE__ */ m("div", {
		"data-slot": "card-description",
		className: Y("text-sm text-muted-foreground", e),
		...t
	});
}
function on({ className: e, ...t }) {
	return /* @__PURE__ */ m("div", {
		"data-slot": "card-content",
		className: Y("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region src/components/ui/input.tsx
function sn({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ m("input", {
		type: t,
		"data-slot": "input",
		className: Y("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function cn({ className: e, ...t }) {
	return /* @__PURE__ */ m(ge, {
		"data-slot": "label",
		className: Y("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/components/ui/switch.tsx
function ln({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ m(Fe, {
		"data-slot": "switch",
		"data-size": t,
		className: Y("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", e),
		...n,
		dir: "ltr",
		children: /* @__PURE__ */ m(Ie, {
			"data-slot": "switch-thumb",
			className: Y("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
//#endregion
//#region src/components/ui/textarea.tsx
function un({ className: e, ...t }) {
	return /* @__PURE__ */ m("textarea", {
		"data-slot": "textarea",
		className: Y("flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-start shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40", e),
		...t
	});
}
//#endregion
//#region src/components/payments/GatewaySettingsLayout.tsx
function dn({ title: e, description: t, notice: n, meta: r, sections: i, actions: a, children: o }) {
	let { t: s } = u(), c = async (e) => {
		try {
			await navigator.clipboard.writeText(e), f.success(s("common.copied", { defaultValue: "Copied" }));
		} catch {
			f.error(s("common.copyFailed", { defaultValue: "Copy failed" }));
		}
	};
	return /* @__PURE__ */ m(T, {
		title: e,
		description: t,
		children: /* @__PURE__ */ h("div", {
			className: "mx-auto w-full max-w-6xl space-y-6",
			children: [
				n,
				o,
				r && r.length > 0 ? /* @__PURE__ */ m("div", {
					className: "bg-muted/30 grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3",
					children: r.map((e) => /* @__PURE__ */ h("div", {
						className: "min-w-0 space-y-1",
						children: [/* @__PURE__ */ m("p", {
							className: "text-muted-foreground text-xs font-medium",
							children: e.label
						}), /* @__PURE__ */ h("div", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ m("code", {
								className: "bg-background block min-w-0 flex-1 truncate rounded-md border px-2 py-1.5 text-xs",
								children: e.value || "—"
							}), e.copyable && e.value ? /* @__PURE__ */ m($t, {
								type: "button",
								size: "icon",
								variant: "outline",
								className: "size-8 shrink-0",
								onClick: () => void c(e.value),
								children: /* @__PURE__ */ m(w, { className: "size-3.5" })
							}) : null]
						})]
					}, e.label))
				}) : null,
				i.length > 1 ? /* @__PURE__ */ m("nav", {
					className: "flex flex-wrap gap-2",
					"aria-label": e,
					children: i.map((e) => /* @__PURE__ */ m($t, {
						asChild: !0,
						size: "sm",
						variant: "outline",
						children: /* @__PURE__ */ m("a", {
							href: `#${e.id}`,
							children: e.title
						})
					}, e.id))
				}) : null,
				/* @__PURE__ */ m("div", {
					className: "space-y-5",
					children: i.map((e) => /* @__PURE__ */ h(tn, {
						id: e.id,
						className: "scroll-mt-24",
						children: [/* @__PURE__ */ h(nn, { children: [/* @__PURE__ */ m(rn, {
							className: "text-base",
							children: e.title
						}), e.description ? /* @__PURE__ */ m(an, { children: e.description }) : null] }), /* @__PURE__ */ m(on, { children: e.children })]
					}, e.id))
				}),
				a ? /* @__PURE__ */ m("div", {
					className: "bg-background/95 sticky bottom-3 z-10 flex flex-wrap gap-2 rounded-xl border p-3 shadow-sm backdrop-blur",
					children: a
				}) : null
			]
		})
	});
}
function X({ label: e, value: t, onChange: n, type: r = "text", placeholder: i, hint: a, className: o }) {
	return /* @__PURE__ */ h("div", {
		className: Y("space-y-2", o),
		children: [
			/* @__PURE__ */ m(cn, { children: e }),
			/* @__PURE__ */ m(sn, {
				type: r,
				value: t,
				placeholder: i,
				onChange: (e) => n(e.target.value)
			}),
			a ? /* @__PURE__ */ m("p", {
				className: "text-muted-foreground text-xs",
				children: a
			}) : null
		]
	});
}
function fn({ label: e, value: t, onChange: n, hint: r, className: i }) {
	return /* @__PURE__ */ h("div", {
		className: Y("space-y-2", i),
		children: [
			/* @__PURE__ */ m(cn, { children: e }),
			/* @__PURE__ */ m(un, {
				value: t,
				onChange: (e) => n(e.target.value),
				rows: 3
			}),
			r ? /* @__PURE__ */ m("p", {
				className: "text-muted-foreground text-xs",
				children: r
			}) : null
		]
	});
}
function Z({ label: e, description: t, checked: n, onChange: r }) {
	return /* @__PURE__ */ h("div", {
		className: "flex items-start justify-between gap-4 rounded-lg border border-border/70 px-3 py-3",
		children: [/* @__PURE__ */ h("div", {
			className: "min-w-0 space-y-0.5",
			children: [/* @__PURE__ */ m("p", {
				className: "text-sm font-medium leading-snug",
				children: e
			}), t ? /* @__PURE__ */ m("p", {
				className: "text-muted-foreground text-xs leading-relaxed",
				children: t
			}) : null]
		}), /* @__PURE__ */ m(ln, {
			checked: n,
			onCheckedChange: (e) => r(!!e),
			className: "mt-0.5 shrink-0"
		})]
	});
}
function pn({ children: e }) {
	return /* @__PURE__ */ m("div", {
		className: "grid gap-4 md:grid-cols-2",
		children: e
	});
}
function mn({ children: e }) {
	return /* @__PURE__ */ m("div", {
		className: "grid gap-3 md:grid-cols-2",
		children: e
	});
}
//#endregion
//#region src/lib/marketplace-api.ts
function hn(e) {
	return `marketplace.installStep.${e}`;
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/typeof.js
function gn(e) {
	"@babel/helpers - typeof";
	return gn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, gn(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPrimitive.js
function _n(e, t) {
	if (gn(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (gn(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/toPropertyKey.js
function vn(e) {
	var t = _n(e, "string");
	return gn(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.127.0/helpers/defineProperty.js
function yn(e, t, n) {
	return (t = vn(t)) in e ? Object.defineProperty(e, t, {
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
		super(e), yn(this, "code", void 0), yn(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, bn = {
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
function xn(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 28") || t.includes("timed out") || t.includes("did not respond in time") || t.includes("زمان") && t.includes("پاسخ");
}
function Sn(e) {
	let t = e.toLowerCase();
	return t.includes("curl error 52") || t.includes("empty reply") || t.includes("closed the connection without a response") || t.includes("پاسخ") && t.includes("خالی");
}
function Cn(e, t) {
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(hn(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
}
function wn(e, t) {
	let n = t;
	if (n?.code === "install_timeout" || n?.step && n?.message?.includes("timed out")) return Cn(e, n);
	if (t instanceof Q && t.code) {
		let n = bn[t.code];
		if (n === "marketplace.installFailedGeneric") {
			let n = t.message?.trim();
			return n ? e("marketplace.installFailed", { message: n }) : e("marketplace.installFailedGeneric");
		}
		if (n) return e(n);
	}
	if (t && typeof t == "object" && "code" in t) {
		let n = bn[String(t.code)];
		if (n) return e(n);
	}
	if (t instanceof Error && t.message) {
		let n = t.message.trim();
		return xn(n) ? e("errors.api.requestTimeout") : Sn(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function Tn(e, t) {
	f.error(wn(e, t));
}
//#endregion
//#region src/lib/queryClient.ts
var En = null;
function Dn() {
	return En;
}
//#endregion
//#region src/lib/authLost.ts
var On = ["auth", "session"], kn = new Set([
	"rest_cookie_invalid_nonce",
	"rest_not_logged_in",
	"invalid_nonce",
	"ajax_referer_failed",
	"-1"
]);
function An(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (t.status === 401) return !0;
	let n = typeof t.code == "string" ? t.code : "";
	if (kn.has(n)) return !0;
	let r = typeof t.message == "string" ? t.message.toLowerCase() : "";
	return !!(r.includes("cookie nonce is invalid") || r.includes("rest_cookie_invalid_nonce") || t.status === 403 && (n === "-1" || r === "-1" || r.includes("are you sure you want to do this")));
}
function jn(e) {
	let t = e ?? Dn();
	t && t.setQueryData(On, { logged_in: !1 });
}
var Mn = new Set([
	"rest_cookie_invalid_nonce",
	"invalid_nonce",
	"ajax_referer_failed",
	"-1"
]);
function Nn(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (t.status === 401) return !1;
	let n = typeof t.code == "string" ? t.code : "";
	if (Mn.has(n)) return !0;
	let r = typeof t.message == "string" ? t.message.toLowerCase() : "";
	return r.includes("cookie nonce is invalid") || r.includes("rest_cookie_invalid_nonce") || r === "invalid nonce";
}
function Pn(e) {
	Nn(e) || An(e) && jn();
}
//#endregion
//#region src/lib/safeUrl.ts
function Fn(e) {
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
function $() {
	return window.webinoDashboard;
}
var In = 3e4;
function Ln(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function Rn(e) {
	let t = $();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (Ln(e) || Fn(e)) return e;
	throw new Q("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function zn(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function Bn(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "license/remote-check" ? "webino_dashboard_license_remote_check" : t === "license/diagnostics" ? "webino_dashboard_license_diagnostics" : t === "license/remote-activate" ? "webino_dashboard_license_remote_activate" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") || t.startsWith("shop/reports") || t.startsWith("shop/product-categories") || t === "comments" || t.startsWith("comments/") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : /^(payments|torobpay|snapppay|digipay|zarinpal|bale-pay|wallet|c2c)(\/|$)/.test(t) ? "webino_dashboard_payments_rest" : t.startsWith("analytics/") && t !== "analytics/hit" ? "webino_dashboard_analytics_rest" : null;
}
function Vn(e, t) {
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
function Hn(e, t) {
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
async function Un(e, t, n = {}) {
	let r = Bn(e), i = $();
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
	let { signal: l, clear: u } = zn({}, t);
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
			let n = Hn(t, e.status);
			throw new Q(n.message, {
				code: n.code,
				status: e.status
			});
		}
		if (!n.success) {
			let t = new Q(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
				code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
				status: e.status
			});
			throw Pn(t), t;
		}
		return n.data;
	} catch (e) {
		throw e instanceof Q ? (Pn(e), e) : e instanceof DOMException && e.name === "AbortError" ? new Q("Request timed out", {
			code: "request_timeout",
			status: 0
		}) : e instanceof TypeError ? new Q("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		u();
	}
}
var Wn = null;
function Gn(e) {
	let t = $();
	t && typeof e == "string" && e.length > 0 && (t.nonce = e);
}
function Kn() {
	if (Wn) return Wn;
	let e = $();
	if (!e?.ajaxUrl) return Promise.resolve(!1);
	let t = new URLSearchParams();
	return t.set("action", "webino_dashboard_auth_session"), Wn = fetch(e.ajaxUrl, {
		method: "POST",
		credentials: "same-origin",
		headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
		body: t
	}).then((e) => e.json()).then((e) => {
		let t = !!(e?.success && e.data?.logged_in);
		return t && Gn(e.data?.nonce), t && typeof e.data?.nonce == "string" && e.data.nonce.length > 0;
	}).catch(() => !1).finally(() => {
		window.setTimeout(() => {
			Wn = null;
		}, 0);
	}), Wn;
}
async function qn(e, t = {}, n = In) {
	try {
		return await Jn(e, t, n);
	} catch (r) {
		if (!Nn(r)) throw r;
		if (!await Kn()) throw jn(), r;
		let i = { ...t.headers };
		for (let e of Object.keys(i)) e.toLowerCase() === "x-wp-nonce" && delete i[e];
		return Jn(e, {
			...t,
			headers: i
		}, n);
	}
}
async function Jn(e, t = {}, n = In) {
	if (Bn(e) && $().ajaxUrl) return Un(e, n, t);
	let r = Rn(e), i = $(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce), !Object.keys(a).some((e) => e.toLowerCase() === "content-type") && typeof t.body == "string" && t.body.length > 0 && (a["Content-Type"] = "application/json");
	let { signal: s, clear: c } = zn(t, n);
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
			let t = Vn(n, e.status);
			throw new Q(t.message, {
				code: t.code,
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i, n = new Q(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
			throw Pn(n), n;
		}
		return i;
	} catch (e) {
		throw e instanceof Q ? (Pn(e), e) : e instanceof DOMException && e.name === "AbortError" ? new Q("Request timed out", {
			code: "request_timeout",
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
//#region ../Modules/snapppay-gateway-module/client/pages/SnappPaySettingsPage.tsx
function Yn() {
	let { t: r } = u(), i = n(), a = d().pathname.endsWith("/logs"), o = t({
		queryKey: ["snapppay", "settings"],
		queryFn: async () => qn("snapppay/settings")
	}), s = t({
		queryKey: ["snapppay", "status"],
		queryFn: async () => qn("snapppay/status"),
		enabled: !a
	}), g = t({
		queryKey: ["snapppay", "logs"],
		queryFn: async () => qn("snapppay/logs"),
		enabled: a
	}), [_, v] = l(null);
	c(() => {
		o.data?.settings && v(o.data.settings);
	}, [o.data]);
	let y = e({
		mutationFn: async () => {
			if (_) return qn("snapppay/settings", {
				method: "POST",
				body: JSON.stringify({ settings: _ })
			});
		},
		onSuccess: (e) => {
			e?.settings && v(e.settings), i.invalidateQueries({ queryKey: ["snapppay"] }), f.success(r("snapppay.saved"));
		},
		onError: (e) => Tn(r, e)
	}), b = e({
		mutationFn: async () => qn("snapppay/test-connection", { method: "POST" }),
		onSuccess: () => f.success(r("snapppay.testOk")),
		onError: (e) => Tn(r, e)
	});
	if (a) return /* @__PURE__ */ m(T, {
		title: r("snapppay.logsTitle"),
		description: r("snapppay.logsSubtitle"),
		children: /* @__PURE__ */ h("div", {
			className: "mx-auto w-full max-w-6xl space-y-2",
			children: [(g.data?.logs ?? []).map((e, t) => /* @__PURE__ */ m("pre", {
				className: "bg-muted/40 overflow-x-auto rounded-lg border p-3 text-xs",
				children: JSON.stringify(e, null, 2)
			}, t)), !g.isLoading && (g.data?.logs?.length ?? 0) === 0 ? /* @__PURE__ */ m("p", {
				className: "text-muted-foreground text-sm",
				children: r("snapppay.noLogs")
			}) : null]
		})
	});
	if (!_) return /* @__PURE__ */ m(T, {
		title: r("snapppay.title"),
		children: r("common.loading")
	});
	let x = String(s.data?.gateway_source ?? _.gateway_source ?? "webino"), S = x === "official" ? r("gateway.meta.sourceOfficial") : x === "webino" ? r("gateway.meta.sourceWebino") : x;
	return /* @__PURE__ */ m(dn, {
		title: r("snapppay.title"),
		description: r("snapppay.description"),
		notice: _.official_plugin_active ? /* @__PURE__ */ m("p", {
			className: "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100",
			children: r("snapppay.officialNotice")
		}) : null,
		meta: [
			{
				label: r("gateway.meta.source"),
				value: S
			},
			{
				label: r("gateway.meta.serverIp"),
				value: String(s.data?.server_ip ?? _.server_ip ?? "—")
			},
			{
				label: r("gateway.meta.callback"),
				value: String(_.callback_url ?? ""),
				copyable: !0
			}
		],
		sections: [
			{
				id: "connection",
				title: r("gateway.section.connection"),
				description: r("gateway.section.connectionHint"),
				children: /* @__PURE__ */ h("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ m(Z, {
						label: r("snapppay.enabled"),
						description: r("snapppay.enabledHint"),
						checked: _.enabled,
						onChange: (e) => v({
							..._,
							enabled: e
						})
					}), /* @__PURE__ */ h(pn, { children: [
						/* @__PURE__ */ m(X, {
							label: r("gateway.field.title"),
							value: _.title,
							onChange: (e) => v({
								..._,
								title: e
							})
						}),
						/* @__PURE__ */ m(X, {
							label: r("gateway.field.description"),
							value: _.description,
							onChange: (e) => v({
								..._,
								description: e
							})
						}),
						/* @__PURE__ */ m(X, {
							label: r("gateway.field.orderButtonText"),
							value: _.order_button_text ?? "",
							onChange: (e) => v({
								..._,
								order_button_text: e
							})
						}),
						/* @__PURE__ */ h("div", {
							className: "space-y-2 md:col-span-2",
							children: [/* @__PURE__ */ m("label", {
								className: "text-sm font-medium",
								children: r("gateway.field.iconUrl")
							}), /* @__PURE__ */ h("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ m("img", {
									src: String(_.icon_url || _.resolved_icon_url || _.default_icon_url || ""),
									alt: "",
									className: "h-10 w-10 shrink-0 rounded border object-contain"
								}), /* @__PURE__ */ m("div", {
									className: "min-w-0 flex-1",
									children: /* @__PURE__ */ m(X, {
										label: "",
										value: _.icon_url ?? "",
										onChange: (e) => v({
											..._,
											icon_url: e
										}),
										hint: r("gateway.field.iconUrlHint")
									})
								})]
							})]
						}),
						/* @__PURE__ */ m(X, {
							label: r("gateway.field.baseUrl"),
							value: _.base_url,
							onChange: (e) => v({
								..._,
								base_url: e
							}),
							hint: r("snapppay.baseUrlHint")
						}),
						/* @__PURE__ */ m(X, {
							label: r("gateway.field.clientId"),
							value: _.client_id,
							onChange: (e) => v({
								..._,
								client_id: e
							})
						}),
						/* @__PURE__ */ m(X, {
							label: _.has_client_secret ? r("gateway.field.clientSecretKeep") : r("gateway.field.clientSecret"),
							value: _.client_secret ?? "",
							type: "password",
							onChange: (e) => v({
								..._,
								client_secret: e
							})
						}),
						/* @__PURE__ */ m(X, {
							label: r("gateway.field.username"),
							value: _.client_username,
							onChange: (e) => v({
								..._,
								client_username: e
							})
						}),
						/* @__PURE__ */ m(X, {
							label: _.has_client_password ? r("gateway.field.passwordKeep") : r("gateway.field.password"),
							value: _.client_password ?? "",
							type: "password",
							onChange: (e) => v({
								..._,
								client_password: e
							})
						})
					] })]
				})
			},
			{
				id: "checkout",
				title: r("gateway.section.checkout"),
				description: r("gateway.section.checkoutHint"),
				children: /* @__PURE__ */ h(mn, { children: [
					/* @__PURE__ */ m(Z, {
						label: r("gateway.flag.requireMobile"),
						description: r("gateway.flag.requireMobileHint"),
						checked: _.mobile_enabled,
						onChange: (e) => v({
							..._,
							mobile_enabled: e
						})
					}),
					/* @__PURE__ */ m(Z, {
						label: r("gateway.flag.requirePostcode"),
						description: r("gateway.flag.requirePostcodeHint"),
						checked: _.postal_enabled,
						onChange: (e) => v({
							..._,
							postal_enabled: e
						})
					}),
					/* @__PURE__ */ m(Z, {
						label: r("gateway.flag.defaultEligible"),
						description: r("gateway.flag.defaultEligibleHint"),
						checked: _.default_gateway,
						onChange: (e) => v({
							..._,
							default_gateway: e
						})
					}),
					/* @__PURE__ */ m(Z, {
						label: r("gateway.flag.directRedirect"),
						description: r("gateway.flag.directRedirectHint"),
						checked: _.direct_payment,
						onChange: (e) => v({
							..._,
							direct_payment: e
						})
					}),
					/* @__PURE__ */ m(Z, {
						label: r("snapppay.flag.commission"),
						description: r("snapppay.flag.commissionHint"),
						checked: _.has_comission,
						onChange: (e) => v({
							..._,
							has_comission: e
						})
					})
				] })
			},
			{
				id: "display",
				title: r("gateway.section.display"),
				description: r("gateway.section.displayHint"),
				children: /* @__PURE__ */ h(mn, { children: [/* @__PURE__ */ m(Z, {
					label: r("snapppay.flag.pdp"),
					description: r("snapppay.flag.pdpHint"),
					checked: _.has_pdp,
					onChange: (e) => v({
						..._,
						has_pdp: e
					})
				}), /* @__PURE__ */ m(Z, {
					label: r("snapppay.flag.darkPdp"),
					description: r("snapppay.flag.darkPdpHint"),
					checked: _.dark_pdp,
					onChange: (e) => v({
						..._,
						dark_pdp: e
					})
				})] })
			},
			{
				id: "messages",
				title: r("gateway.section.messages"),
				description: r("gateway.section.messagesHint"),
				children: /* @__PURE__ */ h("div", {
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ m(fn, {
							label: r("gateway.field.successMessage"),
							value: _.success_message,
							onChange: (e) => v({
								..._,
								success_message: e
							}),
							hint: r("gateway.field.messageVars")
						}),
						/* @__PURE__ */ m(fn, {
							label: r("gateway.field.failedMessage"),
							value: _.failed_message,
							onChange: (e) => v({
								..._,
								failed_message: e
							})
						}),
						/* @__PURE__ */ m(fn, {
							label: r("gateway.field.cancelledMessage"),
							value: _.cancelled_message,
							onChange: (e) => v({
								..._,
								cancelled_message: e
							})
						})
					]
				})
			}
		],
		actions: /* @__PURE__ */ h(p, { children: [/* @__PURE__ */ m($t, {
			type: "button",
			onClick: () => y.mutate(),
			disabled: y.isPending,
			children: r("common.save")
		}), /* @__PURE__ */ m($t, {
			type: "button",
			variant: "outline",
			onClick: () => b.mutate(),
			disabled: b.isPending,
			children: r("snapppay.test")
		})] })
	});
}
//#endregion
//#region ../Modules/snapppay-gateway-module/client/module-entry.tsx
var Xn = {
	"settings/shop/snapppay": Yn,
	"settings/shop/snapppay/logs": Yn
}, Zn = { routes: Xn };
//#endregion
export { Zn as default, Xn as routes };
