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
var ne = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, re = E, D = (e, t) => (n) => {
	if (t?.variants == null) return re(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = ne(t) || ne(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return re(e, a, t?.compoundVariants?.reduce((e, t) => {
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
function O(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
function k(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = O(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : O(e[t], null);
			}
		};
	};
}
function A(...e) {
	return r.useCallback(k(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function ie(e) {
	let t = /* @__PURE__ */ j(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(oe);
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
function j(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = ce(n), a = se(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? k(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var ae = Symbol("radix.slottable");
function oe(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === ae;
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
//#endregion
//#region node_modules/@radix-ui/react-primitive/dist/index.mjs
var M = [
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
	let n = /* @__PURE__ */ ie(`Primitive.${t}`), i = r.forwardRef((e, r) => {
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
function N(e, t = []) {
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
	return a.scopeName = e, [i, le(a, ...t)];
}
function le(...e) {
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
function ue(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return function(r) {
		if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
	};
}
//#endregion
//#region node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var P = globalThis?.document ? r.useLayoutEffect : () => {}, de = r.useInsertionEffect || P;
function fe({ prop: e, defaultProp: t, onChange: n = () => {}, caller: i }) {
	let [a, o, s] = F({
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
			let n = pe(t) ? t(e) : t;
			n !== e && s.current?.(n);
		} else o(t);
	}, [
		c,
		e,
		o,
		s
	])];
}
function F({ defaultProp: e, onChange: t }) {
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
function pe(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function I(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function me(e) {
	let [t, n] = r.useState(void 0);
	return P(() => {
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
var he = "Label", ge = r.forwardRef((e, t) => /* @__PURE__ */ m(M.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
ge.displayName = he;
var _e = ge;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function ve(e) {
	let t = /* @__PURE__ */ be(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(Se);
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
var ye = /* @__PURE__ */ ve("Slot");
/* @__NO_SIDE_EFFECTS__ */
function be(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = we(n), a = Ce(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? k(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var xe = Symbol("radix.slottable");
function Se(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === xe;
}
function Ce(e, t) {
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
function we(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-switch/dist/index.mjs
var Te = "Switch", [Ee, De] = N(Te), [Oe, ke] = Ee(Te), Ae = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, name: i, checked: a, defaultChecked: o, required: s, disabled: c, value: l = "on", onCheckedChange: u, form: d, ...f } = e, [p, g] = r.useState(null), _ = A(t, (e) => g(e)), v = r.useRef(!1), y = p ? d || !!p.closest("form") : !0, [b, x] = fe({
		prop: a,
		defaultProp: o ?? !1,
		onChange: u,
		caller: Te
	});
	return /* @__PURE__ */ h(Oe, {
		scope: n,
		checked: b,
		disabled: c,
		children: [/* @__PURE__ */ m(M.button, {
			type: "button",
			role: "switch",
			"aria-checked": b,
			"aria-required": s,
			"data-state": Fe(b),
			"data-disabled": c ? "" : void 0,
			disabled: c,
			value: l,
			...f,
			ref: _,
			onClick: ue(e.onClick, (e) => {
				x((e) => !e), y && (v.current = e.isPropagationStopped(), v.current || e.stopPropagation());
			})
		}), y && /* @__PURE__ */ m(Pe, {
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
Ae.displayName = Te;
var je = "SwitchThumb", Me = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, ...r } = e, i = ke(je, n);
	return /* @__PURE__ */ m(M.span, {
		"data-state": Fe(i.checked),
		"data-disabled": i.disabled ? "" : void 0,
		...r,
		ref: t
	});
});
Me.displayName = je;
var Ne = "SwitchBubbleInput", Pe = r.forwardRef(({ __scopeSwitch: e, control: t, checked: n, bubbles: i = !0, ...a }, o) => {
	let s = r.useRef(null), c = A(s, o), l = I(n), u = me(t);
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
Pe.displayName = Ne;
function Fe(e) {
	return e ? "checked" : "unchecked";
}
var Ie = Ae, Le = Me, Re = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, ze = (e, t) => ({
	classGroupId: e,
	validator: t
}), Be = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), Ve = "-", He = [], Ue = "arbitrary..", We = (e) => {
	let t = qe(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return Ke(e);
			let n = e.split(Ve);
			return Ge(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? Re(i, t) : t : i || He;
			}
			return n[e] || He;
		}
	};
}, Ge = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = Ge(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(Ve) : e.slice(t).join(Ve), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, Ke = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? Ue + r : void 0;
})(), qe = (e) => {
	let { theme: t, classGroups: n } = e;
	return Je(n, t);
}, Je = (e, t) => {
	let n = Be();
	for (let r in e) {
		let i = e[r];
		Ye(i, n, r, t);
	}
	return n;
}, Ye = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		Xe(i, t, n, r);
	}
}, Xe = (e, t, n, r) => {
	if (typeof e == "string") {
		Ze(e, t, n);
		return;
	}
	if (typeof e == "function") {
		Qe(e, t, n, r);
		return;
	}
	$e(e, t, n, r);
}, Ze = (e, t, n) => {
	let r = e === "" ? t : et(t, e);
	r.classGroupId = n;
}, Qe = (e, t, n, r) => {
	if (tt(e)) {
		Ye(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(ze(n, e));
}, $e = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		Ye(o, et(t, a), n, r);
	}
}, et = (e, t) => {
	let n = e, r = t.split(Ve), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = Be(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, tt = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, nt = (e) => {
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
}, rt = "!", it = ":", at = [], ot = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), st = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === it) {
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
		s.endsWith(rt) ? (c = s.slice(0, -1), l = !0) : s.startsWith(rt) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return ot(t, l, c, u);
	};
	if (t) {
		let e = t + it, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : ot(at, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, ct = (e) => {
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
}, lt = (e) => ({
	cache: nt(e.cacheSize),
	parseClassName: st(e),
	sortModifiers: ct(e),
	...We(e)
}), ut = /\s+/, dt = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(ut), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + rt : g, v = _ + h;
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
}, ft = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = pt(n)) && (i && (i += " "), i += r);
	return i;
}, pt = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = pt(e[r])) && (n && (n += " "), n += t);
	return n;
}, mt = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = lt(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = dt(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(ft(...e));
}, ht = [], L = (e) => {
	let t = (t) => t[e] || ht;
	return t.isThemeGetter = !0, t;
}, gt = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, _t = /^\((?:(\w[\w-]*):)?(.+)\)$/i, vt = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, yt = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, bt = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, xt = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, St = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Ct = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, R = (e) => vt.test(e), z = (e) => !!e && !Number.isNaN(Number(e)), B = (e) => !!e && Number.isInteger(Number(e)), wt = (e) => e.endsWith("%") && z(e.slice(0, -1)), V = (e) => yt.test(e), Tt = () => !0, Et = (e) => bt.test(e) && !xt.test(e), Dt = () => !1, Ot = (e) => St.test(e), kt = (e) => Ct.test(e), At = (e) => !H(e) && !W(e), jt = (e) => K(e, Kt, Dt), H = (e) => gt.test(e), U = (e) => K(e, qt, Et), Mt = (e) => K(e, Jt, z), Nt = (e) => K(e, Xt, Tt), Pt = (e) => K(e, Yt, Dt), Ft = (e) => K(e, Wt, Dt), It = (e) => K(e, Gt, kt), Lt = (e) => K(e, Zt, Ot), W = (e) => _t.test(e), G = (e) => q(e, qt), Rt = (e) => q(e, Yt), zt = (e) => q(e, Wt), Bt = (e) => q(e, Kt), Vt = (e) => q(e, Gt), Ht = (e) => q(e, Zt, !0), Ut = (e) => q(e, Xt, !0), K = (e, t, n) => {
	let r = gt.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, q = (e, t, n = !1) => {
	let r = _t.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, Wt = (e) => e === "position" || e === "percentage", Gt = (e) => e === "image" || e === "url", Kt = (e) => e === "length" || e === "size" || e === "bg-size", qt = (e) => e === "length", Jt = (e) => e === "number", Yt = (e) => e === "family-name", Xt = (e) => e === "number" || e === "weight", Zt = (e) => e === "shadow", Qt = /* @__PURE__ */ mt(() => {
	let e = L("color"), t = L("font"), n = L("text"), r = L("font-weight"), i = L("tracking"), a = L("leading"), o = L("breakpoint"), s = L("container"), c = L("spacing"), l = L("radius"), u = L("shadow"), d = L("inset-shadow"), f = L("text-shadow"), p = L("drop-shadow"), m = L("blur"), h = L("perspective"), g = L("aspect"), _ = L("ease"), v = L("animate"), y = () => [
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
		H
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
		W,
		H,
		c
	], w = () => [
		R,
		"full",
		"auto",
		...C()
	], T = () => [
		B,
		"none",
		"subgrid",
		W,
		H
	], te = () => [
		"auto",
		{ span: [
			"full",
			B,
			W,
			H
		] },
		B,
		W,
		H
	], E = () => [
		B,
		"auto",
		W,
		H
	], ne = () => [
		"auto",
		"min",
		"max",
		"fr",
		W,
		H
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
		R,
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
		R,
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
		R,
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
		W,
		H
	], ae = () => [
		...b(),
		zt,
		Ft,
		{ position: [W, H] }
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
		jt,
		{ size: [W, H] }
	], ce = () => [
		wt,
		G,
		U
	], M = () => [
		"",
		"none",
		"full",
		l,
		W,
		H
	], N = () => [
		"",
		z,
		G,
		U
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
		z,
		wt,
		zt,
		Ft
	], de = () => [
		"",
		"none",
		m,
		W,
		H
	], fe = () => [
		"none",
		z,
		W,
		H
	], F = () => [
		"none",
		z,
		W,
		H
	], pe = () => [
		z,
		W,
		H
	], I = () => [
		R,
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
			blur: [V],
			breakpoint: [V],
			color: [Tt],
			container: [V],
			"drop-shadow": [V],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [At],
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
			"inset-shadow": [V],
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
			radius: [V],
			shadow: [V],
			spacing: ["px", z],
			text: [V],
			"text-shadow": [V],
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
				R,
				H,
				W,
				g
			] }],
			container: ["container"],
			columns: [{ columns: [
				z,
				H,
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
				B,
				"auto",
				W,
				H
			] }],
			basis: [{ basis: [
				R,
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
				z,
				R,
				"auto",
				"initial",
				"none",
				H
			] }],
			grow: [{ grow: [
				"",
				z,
				W,
				H
			] }],
			shrink: [{ shrink: [
				"",
				z,
				W,
				H
			] }],
			order: [{ order: [
				B,
				"first",
				"last",
				"none",
				W,
				H
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
				G,
				U
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				Ut,
				Nt
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
				wt,
				H
			] }],
			"font-family": [{ font: [
				Rt,
				Pt,
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
				W,
				H
			] }],
			"line-clamp": [{ "line-clamp": [
				z,
				"none",
				W,
				Mt
			] }],
			leading: [{ leading: [a, ...C()] }],
			"list-image": [{ "list-image": [
				"none",
				W,
				H
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				W,
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
				z,
				"from-font",
				"auto",
				W,
				U
			] }],
			"text-decoration-color": [{ decoration: j() }],
			"underline-offset": [{ "underline-offset": [
				z,
				"auto",
				W,
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
				W,
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
				W,
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
						B,
						W,
						H
					],
					radial: [
						"",
						W,
						H
					],
					conic: [
						B,
						W,
						H
					]
				},
				Vt,
				It
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
				z,
				W,
				H
			] }],
			"outline-w": [{ outline: [
				"",
				z,
				G,
				U
			] }],
			"outline-color": [{ outline: j() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				Ht,
				Lt
			] }],
			"shadow-color": [{ shadow: j() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				Ht,
				Lt
			] }],
			"inset-shadow-color": [{ "inset-shadow": j() }],
			"ring-w": [{ ring: N() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: j() }],
			"ring-offset-w": [{ "ring-offset": [z, U] }],
			"ring-offset-color": [{ "ring-offset": j() }],
			"inset-ring-w": [{ "inset-ring": N() }],
			"inset-ring-color": [{ "inset-ring": j() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				Ht,
				Lt
			] }],
			"text-shadow-color": [{ "text-shadow": j() }],
			opacity: [{ opacity: [
				z,
				W,
				H
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
			"mask-image-linear-pos": [{ "mask-linear": [z] }],
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
			"mask-image-radial": [{ "mask-radial": [W, H] }],
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
			"mask-image-conic-pos": [{ "mask-conic": [z] }],
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
				W,
				H
			] }],
			filter: [{ filter: [
				"",
				"none",
				W,
				H
			] }],
			blur: [{ blur: de() }],
			brightness: [{ brightness: [
				z,
				W,
				H
			] }],
			contrast: [{ contrast: [
				z,
				W,
				H
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				Ht,
				Lt
			] }],
			"drop-shadow-color": [{ "drop-shadow": j() }],
			grayscale: [{ grayscale: [
				"",
				z,
				W,
				H
			] }],
			"hue-rotate": [{ "hue-rotate": [
				z,
				W,
				H
			] }],
			invert: [{ invert: [
				"",
				z,
				W,
				H
			] }],
			saturate: [{ saturate: [
				z,
				W,
				H
			] }],
			sepia: [{ sepia: [
				"",
				z,
				W,
				H
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				W,
				H
			] }],
			"backdrop-blur": [{ "backdrop-blur": de() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				z,
				W,
				H
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				z,
				W,
				H
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				z,
				W,
				H
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				z,
				W,
				H
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				z,
				W,
				H
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				z,
				W,
				H
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				z,
				W,
				H
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				z,
				W,
				H
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
				W,
				H
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				z,
				"initial",
				W,
				H
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				W,
				H
			] }],
			delay: [{ delay: [
				z,
				W,
				H
			] }],
			animate: [{ animate: [
				"none",
				v,
				W,
				H
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				W,
				H
			] }],
			"perspective-origin": [{ "perspective-origin": x() }],
			rotate: [{ rotate: fe() }],
			"rotate-x": [{ "rotate-x": fe() }],
			"rotate-y": [{ "rotate-y": fe() }],
			"rotate-z": [{ "rotate-z": fe() }],
			scale: [{ scale: F() }],
			"scale-x": [{ "scale-x": F() }],
			"scale-y": [{ "scale-y": F() }],
			"scale-z": [{ "scale-z": F() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: pe() }],
			"skew-x": [{ "skew-x": pe() }],
			"skew-y": [{ "skew-y": pe() }],
			transform: [{ transform: [
				W,
				H,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: x() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: I() }],
			"translate-x": [{ "translate-x": I() }],
			"translate-y": [{ "translate-y": I() }],
			"translate-z": [{ "translate-z": I() }],
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
				W,
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
				W,
				H
			] }],
			fill: [{ fill: ["none", ...j()] }],
			"stroke-w": [{ stroke: [
				z,
				G,
				U,
				Mt
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
function J(...e) {
	return Qt(E(e));
}
//#endregion
//#region src/components/ui/button.tsx
var $t = D("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
function en({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ m(r ? ye : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: J($t({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/components/ui/card.tsx
var tn = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function nn({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ m("div", {
		"data-slot": "card",
		"data-variant": t,
		className: J("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", tn[t], e),
		...n
	});
}
function rn({ className: e, ...t }) {
	return /* @__PURE__ */ m("div", {
		"data-slot": "card-header",
		className: J("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function an({ className: e, ...t }) {
	return /* @__PURE__ */ m("div", {
		"data-slot": "card-title",
		className: J("leading-none font-semibold", e),
		...t
	});
}
function on({ className: e, ...t }) {
	return /* @__PURE__ */ m("div", {
		"data-slot": "card-description",
		className: J("text-sm text-muted-foreground", e),
		...t
	});
}
function sn({ className: e, ...t }) {
	return /* @__PURE__ */ m("div", {
		"data-slot": "card-content",
		className: J("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region src/components/ui/input.tsx
function cn({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ m("input", {
		type: t,
		"data-slot": "input",
		className: J("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function ln({ className: e, ...t }) {
	return /* @__PURE__ */ m(_e, {
		"data-slot": "label",
		className: J("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/components/ui/switch.tsx
function un({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ m(Ie, {
		"data-slot": "switch",
		"data-size": t,
		className: J("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", e),
		...n,
		dir: "ltr",
		children: /* @__PURE__ */ m(Le, {
			"data-slot": "switch-thumb",
			className: J("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
//#endregion
//#region src/components/ui/textarea.tsx
function dn({ className: e, ...t }) {
	return /* @__PURE__ */ m("textarea", {
		"data-slot": "textarea",
		className: J("flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-start shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40", e),
		...t
	});
}
//#endregion
//#region src/components/payments/GatewaySettingsLayout.tsx
function fn({ title: e, description: t, notice: n, meta: r, sections: i, actions: a, children: o }) {
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
							}), e.copyable && e.value ? /* @__PURE__ */ m(en, {
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
					children: i.map((e) => /* @__PURE__ */ m(en, {
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
					children: i.map((e) => /* @__PURE__ */ h(nn, {
						id: e.id,
						className: "scroll-mt-24",
						children: [/* @__PURE__ */ h(rn, { children: [/* @__PURE__ */ m(an, {
							className: "text-base",
							children: e.title
						}), e.description ? /* @__PURE__ */ m(on, { children: e.description }) : null] }), /* @__PURE__ */ m(sn, { children: e.children })]
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
function Y({ label: e, value: t, onChange: n, type: r = "text", placeholder: i, hint: a, className: o }) {
	return /* @__PURE__ */ h("div", {
		className: J("space-y-2", o),
		children: [
			/* @__PURE__ */ m(ln, { children: e }),
			/* @__PURE__ */ m(cn, {
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
function pn({ label: e, value: t, onChange: n, hint: r, className: i }) {
	return /* @__PURE__ */ h("div", {
		className: J("space-y-2", i),
		children: [
			/* @__PURE__ */ m(ln, { children: e }),
			/* @__PURE__ */ m(dn, {
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
function X({ label: e, description: t, checked: n, onChange: r }) {
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
		}), /* @__PURE__ */ m(un, {
			checked: n,
			onCheckedChange: (e) => r(!!e),
			className: "mt-0.5 shrink-0"
		})]
	});
}
function mn({ children: e }) {
	return /* @__PURE__ */ m("div", {
		className: "grid gap-4 md:grid-cols-2",
		children: e
	});
}
function hn({ children: e }) {
	return /* @__PURE__ */ m("div", {
		className: "grid gap-3 md:grid-cols-2",
		children: e
	});
}
//#endregion
//#region src/lib/marketplace-api.ts
function gn(e) {
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
function _n(e, t) {
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
function vn(e) {
	var t = _n(e, "string");
	return Z(t) == "symbol" ? t : t + "";
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
	return t.stuckWorker ? e("marketplace.installWorkerStuck") : t.step && t.code === "install_timeout" ? e("marketplace.installTimedOut", { step: e(gn(t.step), { defaultValue: t.step }) }) : e("marketplace.installTimedOutGeneric");
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
		return xn(n) ? e("errors.api.timeout") : Sn(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function Tn(e, t) {
	f.error(wn(e, t));
}
//#endregion
//#region src/lib/safeUrl.ts
function En(e) {
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
function Dn() {
	return window.webinoDashboard;
}
var On = 3e4;
function kn(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function An(e) {
	let t = Dn();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (kn(e) || En(e)) return e;
	throw new Q("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function jn(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function Mn(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : /^(payments|torobpay|snapppay|digipay|zarinpal|bale-pay|wallet|c2c)(\/|$)/.test(t) ? "webino_dashboard_payments_rest" : null;
}
function Nn(e, t) {
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
function Pn(e, t) {
	let n = e.toLowerCase();
	return e.includes("Upstream Error") || e.includes("Forbidden") || t === 403 ? "admin-ajax blocked by CDN/WAF (Upstream Forbidden) — whitelist admin-ajax.php or retry" : n.includes("timed out") || n.includes("timeout") || t === 504 || t === 524 ? "Request timed out — RSA-4096 generation can take over a minute on weak hosts" : e.trim().startsWith("<") || e.includes("<!DOCTYPE") || e.includes("<html") ? `Invalid AJAX response (HTML, HTTP ${t || 0})` : `Invalid AJAX response (HTTP ${t || 0})`;
}
async function Fn(e, t, n = {}) {
	let r = Mn(e), i = Dn();
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
	let { signal: l, clear: u } = jn({}, t);
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
			throw new Q(Pn(t, e.status), {
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
async function $(e, t = {}, n = On) {
	if (Mn(e) && Dn().ajaxUrl) return Fn(e, n, t);
	let r = An(e), i = Dn(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce), !Object.keys(a).some((e) => e.toLowerCase() === "content-type") && typeof t.body == "string" && t.body.length > 0 && (a["Content-Type"] = "application/json");
	let { signal: s, clear: c } = jn(t, n);
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
			let t = Nn(n, e.status);
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
//#region ../Modules/snapppay-gateway-module/client/pages/SnappPaySettingsPage.tsx
function In() {
	let { t: r } = u(), i = n(), a = d().pathname.endsWith("/logs"), o = t({
		queryKey: ["snapppay", "settings"],
		queryFn: async () => $("snapppay/settings")
	}), s = t({
		queryKey: ["snapppay", "status"],
		queryFn: async () => $("snapppay/status"),
		enabled: !a
	}), g = t({
		queryKey: ["snapppay", "logs"],
		queryFn: async () => $("snapppay/logs"),
		enabled: a
	}), [_, v] = l(null);
	c(() => {
		o.data?.settings && v(o.data.settings);
	}, [o.data]);
	let y = e({
		mutationFn: async () => {
			if (_) return $("snapppay/settings", {
				method: "POST",
				body: JSON.stringify({ settings: _ })
			});
		},
		onSuccess: (e) => {
			e?.settings && v(e.settings), i.invalidateQueries({ queryKey: ["snapppay"] }), f.success(r("snapppay.saved"));
		},
		onError: (e) => Tn(r, e)
	}), b = e({
		mutationFn: async () => $("snapppay/test-connection", { method: "POST" }),
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
	return /* @__PURE__ */ m(fn, {
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
					children: [/* @__PURE__ */ m(X, {
						label: r("snapppay.enabled"),
						description: r("snapppay.enabledHint"),
						checked: _.enabled,
						onChange: (e) => v({
							..._,
							enabled: e
						})
					}), /* @__PURE__ */ h(mn, { children: [
						/* @__PURE__ */ m(Y, {
							label: r("gateway.field.title"),
							value: _.title,
							onChange: (e) => v({
								..._,
								title: e
							})
						}),
						/* @__PURE__ */ m(Y, {
							label: r("gateway.field.description"),
							value: _.description,
							onChange: (e) => v({
								..._,
								description: e
							})
						}),
						/* @__PURE__ */ m(Y, {
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
									children: /* @__PURE__ */ m(Y, {
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
						/* @__PURE__ */ m(Y, {
							label: r("gateway.field.baseUrl"),
							value: _.base_url,
							onChange: (e) => v({
								..._,
								base_url: e
							}),
							hint: r("snapppay.baseUrlHint")
						}),
						/* @__PURE__ */ m(Y, {
							label: r("gateway.field.clientId"),
							value: _.client_id,
							onChange: (e) => v({
								..._,
								client_id: e
							})
						}),
						/* @__PURE__ */ m(Y, {
							label: _.has_client_secret ? r("gateway.field.clientSecretKeep") : r("gateway.field.clientSecret"),
							value: _.client_secret ?? "",
							type: "password",
							onChange: (e) => v({
								..._,
								client_secret: e
							})
						}),
						/* @__PURE__ */ m(Y, {
							label: r("gateway.field.username"),
							value: _.client_username,
							onChange: (e) => v({
								..._,
								client_username: e
							})
						}),
						/* @__PURE__ */ m(Y, {
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
				children: /* @__PURE__ */ h(hn, { children: [
					/* @__PURE__ */ m(X, {
						label: r("gateway.flag.requireMobile"),
						description: r("gateway.flag.requireMobileHint"),
						checked: _.mobile_enabled,
						onChange: (e) => v({
							..._,
							mobile_enabled: e
						})
					}),
					/* @__PURE__ */ m(X, {
						label: r("gateway.flag.requirePostcode"),
						description: r("gateway.flag.requirePostcodeHint"),
						checked: _.postal_enabled,
						onChange: (e) => v({
							..._,
							postal_enabled: e
						})
					}),
					/* @__PURE__ */ m(X, {
						label: r("gateway.flag.defaultEligible"),
						description: r("gateway.flag.defaultEligibleHint"),
						checked: _.default_gateway,
						onChange: (e) => v({
							..._,
							default_gateway: e
						})
					}),
					/* @__PURE__ */ m(X, {
						label: r("gateway.flag.directRedirect"),
						description: r("gateway.flag.directRedirectHint"),
						checked: _.direct_payment,
						onChange: (e) => v({
							..._,
							direct_payment: e
						})
					}),
					/* @__PURE__ */ m(X, {
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
				children: /* @__PURE__ */ h(hn, { children: [/* @__PURE__ */ m(X, {
					label: r("snapppay.flag.pdp"),
					description: r("snapppay.flag.pdpHint"),
					checked: _.has_pdp,
					onChange: (e) => v({
						..._,
						has_pdp: e
					})
				}), /* @__PURE__ */ m(X, {
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
						/* @__PURE__ */ m(pn, {
							label: r("gateway.field.successMessage"),
							value: _.success_message,
							onChange: (e) => v({
								..._,
								success_message: e
							}),
							hint: r("gateway.field.messageVars")
						}),
						/* @__PURE__ */ m(pn, {
							label: r("gateway.field.failedMessage"),
							value: _.failed_message,
							onChange: (e) => v({
								..._,
								failed_message: e
							})
						}),
						/* @__PURE__ */ m(pn, {
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
		actions: /* @__PURE__ */ h(p, { children: [/* @__PURE__ */ m(en, {
			type: "button",
			onClick: () => y.mutate(),
			disabled: y.isPending,
			children: r("common.save")
		}), /* @__PURE__ */ m(en, {
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
var Ln = {
	"settings/shop/snapppay": In,
	"settings/shop/snapppay/logs": In
}, Rn = { routes: Ln };
//#endregion
export { Rn as default, Ln as routes };
