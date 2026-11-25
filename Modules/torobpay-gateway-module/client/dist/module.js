import { useMutation as e, useQuery as t, useQueryClient as n } from "@tanstack/react-query";
import * as r from "react";
import { createContext as i, createElement as a, forwardRef as o, useContext as s, useEffect as c, useState as l } from "react";
import { useTranslation as u } from "react-i18next";
import { Link as d, useLocation as f } from "react-router-dom";
import { toast as p } from "sonner";
import { Fragment as m, jsx as h, jsxs as g } from "react/jsx-runtime";
import "react-dom";
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var _ = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), v = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), y = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), b = (e) => {
	let t = y(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, x = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, S = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, ee = i({}), C = () => s(ee), w = o(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: i = "", children: o, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = C() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return a("svg", {
		ref: l,
		...x,
		width: t ?? u ?? x.width,
		height: t ?? u ?? x.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: _("lucide", m, i),
		...!o && !S(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => a(e, t)), ...Array.isArray(o) ? o : [o]]);
}), te = ((e, t) => {
	let n = o(({ className: n, ...r }, i) => a(w, {
		ref: i,
		iconNode: t,
		className: _(`lucide-${v(b(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = b(e), n;
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
	return /* @__PURE__ */ g("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ g("header", {
			className: "min-w-0 space-y-1.5",
			children: [
				n ? /* @__PURE__ */ h("p", {
					className: "text-muted-foreground text-xs font-medium tracking-wide uppercase",
					children: n
				}) : null,
				/* @__PURE__ */ h("h1", {
					className: "text-xl font-semibold tracking-tight sm:text-2xl",
					children: e
				}),
				t ? /* @__PURE__ */ h("p", {
					className: "text-muted-foreground max-w-2xl text-sm leading-relaxed",
					children: t
				}) : null
			]
		}), r]
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function E(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") if (Array.isArray(e)) {
		var i = e.length;
		for (t = 0; t < i; t++) e[t] && (n = E(e[t])) && (r && (r += " "), r += n);
	} else for (n in e) e[n] && (r && (r += " "), r += n);
	return r;
}
function ne() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = E(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/class-variance-authority/dist/index.mjs
var D = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, O = ne, k = (e, t) => (n) => {
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
function re(...e) {
	return r.useCallback(j(...e), e);
}
//#endregion
//#region node_modules/@radix-ui/react-primitive/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function M(e) {
	let t = /* @__PURE__ */ ie(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(oe);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ h(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ h(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
/* @__NO_SIDE_EFFECTS__ */
function ie(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = N(n), a = se(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? j(t, e) : e), r.cloneElement(n, a);
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
].reduce((e, t) => {
	let n = /* @__PURE__ */ M(`Primitive.${t}`), i = r.forwardRef((e, r) => {
		let { asChild: i, ...a } = e, o = i ? n : t;
		return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ h(o, {
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
function ce(e, t = []) {
	let n = [];
	function i(t, i) {
		let a = r.createContext(i), o = n.length;
		n = [...n, i];
		let s = (t) => {
			let { scope: n, children: i, ...s } = t, c = n?.[e]?.[o] || a, l = r.useMemo(() => s, Object.values(s));
			return /* @__PURE__ */ h(c.Provider, {
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
function F(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
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
//#region node_modules/@radix-ui/react-use-previous/dist/index.mjs
function he(e) {
	let t = r.useRef({
		value: e,
		previous: e
	});
	return r.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
//#endregion
//#region node_modules/@radix-ui/react-use-size/dist/index.mjs
function ge(e) {
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
//#region node_modules/radix-ui/node_modules/@radix-ui/react-label/dist/index.mjs
var _e = "Label", ve = r.forwardRef((e, t) => /* @__PURE__ */ h(P.label, {
	...e,
	ref: t,
	onMouseDown: (t) => {
		t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
	}
}));
ve.displayName = _e;
var ye = ve;
//#endregion
//#region node_modules/radix-ui/node_modules/@radix-ui/react-slot/dist/index.mjs
/* @__NO_SIDE_EFFECTS__ */
function be(e) {
	let t = /* @__PURE__ */ Se(e), n = r.forwardRef((e, n) => {
		let { children: i, ...a } = e, o = r.Children.toArray(i), s = o.find(we);
		if (s) {
			let e = s.props.children, i = o.map((t) => t === s ? r.Children.count(e) > 1 ? r.Children.only(null) : r.isValidElement(e) ? e.props.children : null : t);
			return /* @__PURE__ */ h(t, {
				...a,
				ref: n,
				children: r.isValidElement(e) ? r.cloneElement(e, void 0, i) : null
			});
		}
		return /* @__PURE__ */ h(t, {
			...a,
			ref: n,
			children: i
		});
	});
	return n.displayName = `${e}.Slot`, n;
}
var xe = /* @__PURE__ */ be("Slot");
/* @__NO_SIDE_EFFECTS__ */
function Se(e) {
	let t = r.forwardRef((e, t) => {
		let { children: n, ...i } = e;
		if (r.isValidElement(n)) {
			let e = Ee(n), a = Te(i, n.props);
			return n.type !== r.Fragment && (a.ref = t ? j(t, e) : e), r.cloneElement(n, a);
		}
		return r.Children.count(n) > 1 ? r.Children.only(null) : null;
	});
	return t.displayName = `${e}.SlotClone`, t;
}
var Ce = Symbol("radix.slottable");
function we(e) {
	return r.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Ce;
}
function Te(e, t) {
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
function Ee(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
//#endregion
//#region node_modules/@radix-ui/react-switch/dist/index.mjs
var De = "Switch", [Oe, ke] = ce(De), [Ae, je] = Oe(De), Me = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, name: i, checked: a, defaultChecked: o, required: s, disabled: c, value: l = "on", onCheckedChange: u, form: d, ...f } = e, [p, m] = r.useState(null), _ = re(t, (e) => m(e)), v = r.useRef(!1), y = p ? d || !!p.closest("form") : !0, [b, x] = fe({
		prop: a,
		defaultProp: o ?? !1,
		onChange: u,
		caller: De
	});
	return /* @__PURE__ */ g(Ae, {
		scope: n,
		checked: b,
		disabled: c,
		children: [/* @__PURE__ */ h(P.button, {
			type: "button",
			role: "switch",
			"aria-checked": b,
			"aria-required": s,
			"data-state": Le(b),
			"data-disabled": c ? "" : void 0,
			disabled: c,
			value: l,
			...f,
			ref: _,
			onClick: F(e.onClick, (e) => {
				x((e) => !e), y && (v.current = e.isPropagationStopped(), v.current || e.stopPropagation());
			})
		}), y && /* @__PURE__ */ h(Ie, {
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
Me.displayName = De;
var Ne = "SwitchThumb", Pe = r.forwardRef((e, t) => {
	let { __scopeSwitch: n, ...r } = e, i = je(Ne, n);
	return /* @__PURE__ */ h(P.span, {
		"data-state": Le(i.checked),
		"data-disabled": i.disabled ? "" : void 0,
		...r,
		ref: t
	});
});
Pe.displayName = Ne;
var Fe = "SwitchBubbleInput", Ie = r.forwardRef(({ __scopeSwitch: e, control: t, checked: n, bubbles: i = !0, ...a }, o) => {
	let s = r.useRef(null), c = re(s, o), l = he(n), u = ge(t);
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
	]), /* @__PURE__ */ h("input", {
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
Ie.displayName = Fe;
function Le(e) {
	return e ? "checked" : "unchecked";
}
var Re = Me, ze = Pe, Be = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, Ve = (e, t) => ({
	classGroupId: e,
	validator: t
}), He = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), Ue = "-", We = [], Ge = "arbitrary..", Ke = (e) => {
	let t = Ye(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return Je(e);
			let n = e.split(Ue);
			return qe(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? Be(i, t) : t : i || We;
			}
			return n[e] || We;
		}
	};
}, qe = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = qe(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(Ue) : e.slice(t).join(Ue), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, Je = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? Ge + r : void 0;
})(), Ye = (e) => {
	let { theme: t, classGroups: n } = e;
	return Xe(n, t);
}, Xe = (e, t) => {
	let n = He();
	for (let r in e) {
		let i = e[r];
		Ze(i, n, r, t);
	}
	return n;
}, Ze = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		Qe(i, t, n, r);
	}
}, Qe = (e, t, n, r) => {
	if (typeof e == "string") {
		$e(e, t, n);
		return;
	}
	if (typeof e == "function") {
		et(e, t, n, r);
		return;
	}
	tt(e, t, n, r);
}, $e = (e, t, n) => {
	let r = e === "" ? t : nt(t, e);
	r.classGroupId = n;
}, et = (e, t, n, r) => {
	if (rt(e)) {
		Ze(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(Ve(n, e));
}, tt = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		Ze(o, nt(t, a), n, r);
	}
}, nt = (e, t) => {
	let n = e, r = t.split(Ue), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = He(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, rt = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, it = (e) => {
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
}, at = "!", ot = ":", st = [], ct = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), lt = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === ot) {
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
		s.endsWith(at) ? (c = s.slice(0, -1), l = !0) : s.startsWith(at) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return ct(t, l, c, u);
	};
	if (t) {
		let e = t + ot, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : ct(st, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, ut = (e) => {
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
}, dt = (e) => ({
	cache: it(e.cacheSize),
	parseClassName: lt(e),
	sortModifiers: ut(e),
	...Ke(e)
}), ft = /\s+/, pt = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(ft), c = "";
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
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + at : g, v = _ + h;
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
}, mt = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = ht(n)) && (i && (i += " "), i += r);
	return i;
}, ht = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = ht(e[r])) && (n && (n += " "), n += t);
	return n;
}, gt = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = dt(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = pt(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(mt(...e));
}, _t = [], I = (e) => {
	let t = (t) => t[e] || _t;
	return t.isThemeGetter = !0, t;
}, vt = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, yt = /^\((?:(\w[\w-]*):)?(.+)\)$/i, bt = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, xt = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, St = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Ct = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, wt = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Tt = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, L = (e) => bt.test(e), R = (e) => !!e && !Number.isNaN(Number(e)), z = (e) => !!e && Number.isInteger(Number(e)), Et = (e) => e.endsWith("%") && R(e.slice(0, -1)), B = (e) => xt.test(e), Dt = () => !0, Ot = (e) => St.test(e) && !Ct.test(e), kt = () => !1, At = (e) => wt.test(e), jt = (e) => Tt.test(e), Mt = (e) => !V(e) && !U(e), Nt = (e) => G(e, Jt, kt), V = (e) => vt.test(e), H = (e) => G(e, Yt, Ot), Pt = (e) => G(e, Xt, R), Ft = (e) => G(e, Qt, Dt), It = (e) => G(e, Zt, kt), Lt = (e) => G(e, Kt, kt), Rt = (e) => G(e, qt, jt), zt = (e) => G(e, $t, At), U = (e) => yt.test(e), W = (e) => K(e, Yt), Bt = (e) => K(e, Zt), Vt = (e) => K(e, Kt), Ht = (e) => K(e, Jt), Ut = (e) => K(e, qt), Wt = (e) => K(e, $t, !0), Gt = (e) => K(e, Qt, !0), G = (e, t, n) => {
	let r = vt.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, K = (e, t, n = !1) => {
	let r = yt.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, Kt = (e) => e === "position" || e === "percentage", qt = (e) => e === "image" || e === "url", Jt = (e) => e === "length" || e === "size" || e === "bg-size", Yt = (e) => e === "length", Xt = (e) => e === "number", Zt = (e) => e === "family-name", Qt = (e) => e === "number" || e === "weight", $t = (e) => e === "shadow", en = /* @__PURE__ */ gt(() => {
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
		U,
		V
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
		U,
		V,
		c
	], w = () => [
		L,
		"full",
		"auto",
		...C()
	], te = () => [
		z,
		"none",
		"subgrid",
		U,
		V
	], T = () => [
		"auto",
		{ span: [
			"full",
			z,
			U,
			V
		] },
		z,
		U,
		V
	], E = () => [
		z,
		"auto",
		U,
		V
	], ne = () => [
		"auto",
		"min",
		"max",
		"fr",
		U,
		V
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
		L,
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
		L,
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
		L,
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
		U,
		V
	], ie = () => [
		...b(),
		Vt,
		Lt,
		{ position: [U, V] }
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
		Ht,
		Nt,
		{ size: [U, V] }
	], se = () => [
		Et,
		W,
		H
	], N = () => [
		"",
		"none",
		"full",
		l,
		U,
		V
	], P = () => [
		"",
		R,
		W,
		H
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
		R,
		Et,
		Vt,
		Lt
	], ue = () => [
		"",
		"none",
		m,
		U,
		V
	], de = () => [
		"none",
		R,
		U,
		V
	], fe = () => [
		"none",
		R,
		U,
		V
	], pe = () => [
		R,
		U,
		V
	], me = () => [
		L,
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
			blur: [B],
			breakpoint: [B],
			color: [Dt],
			container: [B],
			"drop-shadow": [B],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [Mt],
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
			"inset-shadow": [B],
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
			radius: [B],
			shadow: [B],
			spacing: ["px", R],
			text: [B],
			"text-shadow": [B],
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
				L,
				V,
				U,
				g
			] }],
			container: ["container"],
			columns: [{ columns: [
				R,
				V,
				U,
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
				z,
				"auto",
				U,
				V
			] }],
			basis: [{ basis: [
				L,
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
				R,
				L,
				"auto",
				"initial",
				"none",
				V
			] }],
			grow: [{ grow: [
				"",
				R,
				U,
				V
			] }],
			shrink: [{ shrink: [
				"",
				R,
				U,
				V
			] }],
			order: [{ order: [
				z,
				"first",
				"last",
				"none",
				U,
				V
			] }],
			"grid-cols": [{ "grid-cols": te() }],
			"col-start-end": [{ col: T() }],
			"col-start": [{ "col-start": E() }],
			"col-end": [{ "col-end": E() }],
			"grid-rows": [{ "grid-rows": te() }],
			"row-start-end": [{ row: T() }],
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
				W,
				H
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				Gt,
				Ft
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
				Et,
				V
			] }],
			"font-family": [{ font: [
				Bt,
				It,
				t
			] }],
			"font-features": [{ "font-features": [V] }],
			"fvn-normal": ["normal-nums"],
			"fvn-ordinal": ["ordinal"],
			"fvn-slashed-zero": ["slashed-zero"],
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			tracking: [{ tracking: [
				i,
				U,
				V
			] }],
			"line-clamp": [{ "line-clamp": [
				R,
				"none",
				U,
				Pt
			] }],
			leading: [{ leading: [a, ...C()] }],
			"list-image": [{ "list-image": [
				"none",
				U,
				V
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				U,
				V
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
				R,
				"from-font",
				"auto",
				U,
				H
			] }],
			"text-decoration-color": [{ decoration: M() }],
			"underline-offset": [{ "underline-offset": [
				R,
				"auto",
				U,
				V
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
				U,
				V
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
				U,
				V
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
						z,
						U,
						V
					],
					radial: [
						"",
						U,
						V
					],
					conic: [
						z,
						U,
						V
					]
				},
				Ut,
				Rt
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
				R,
				U,
				V
			] }],
			"outline-w": [{ outline: [
				"",
				R,
				W,
				H
			] }],
			"outline-color": [{ outline: M() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				Wt,
				zt
			] }],
			"shadow-color": [{ shadow: M() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				Wt,
				zt
			] }],
			"inset-shadow-color": [{ "inset-shadow": M() }],
			"ring-w": [{ ring: P() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: M() }],
			"ring-offset-w": [{ "ring-offset": [R, H] }],
			"ring-offset-color": [{ "ring-offset": M() }],
			"inset-ring-w": [{ "inset-ring": P() }],
			"inset-ring-color": [{ "inset-ring": M() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				Wt,
				zt
			] }],
			"text-shadow-color": [{ "text-shadow": M() }],
			opacity: [{ opacity: [
				R,
				U,
				V
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
			"mask-image-linear-pos": [{ "mask-linear": [R] }],
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
			"mask-image-radial": [{ "mask-radial": [U, V] }],
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
			"mask-image-conic-pos": [{ "mask-conic": [R] }],
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
				U,
				V
			] }],
			filter: [{ filter: [
				"",
				"none",
				U,
				V
			] }],
			blur: [{ blur: ue() }],
			brightness: [{ brightness: [
				R,
				U,
				V
			] }],
			contrast: [{ contrast: [
				R,
				U,
				V
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				Wt,
				zt
			] }],
			"drop-shadow-color": [{ "drop-shadow": M() }],
			grayscale: [{ grayscale: [
				"",
				R,
				U,
				V
			] }],
			"hue-rotate": [{ "hue-rotate": [
				R,
				U,
				V
			] }],
			invert: [{ invert: [
				"",
				R,
				U,
				V
			] }],
			saturate: [{ saturate: [
				R,
				U,
				V
			] }],
			sepia: [{ sepia: [
				"",
				R,
				U,
				V
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				U,
				V
			] }],
			"backdrop-blur": [{ "backdrop-blur": ue() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				R,
				U,
				V
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				R,
				U,
				V
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				R,
				U,
				V
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				R,
				U,
				V
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				R,
				U,
				V
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				R,
				U,
				V
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				R,
				U,
				V
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				R,
				U,
				V
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
				U,
				V
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				R,
				"initial",
				U,
				V
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				U,
				V
			] }],
			delay: [{ delay: [
				R,
				U,
				V
			] }],
			animate: [{ animate: [
				"none",
				v,
				U,
				V
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				U,
				V
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
				U,
				V,
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
				U,
				V
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
				U,
				V
			] }],
			fill: [{ fill: ["none", ...M()] }],
			"stroke-w": [{ stroke: [
				R,
				W,
				H,
				Pt
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
function q(...e) {
	return en(ne(e));
}
//#endregion
//#region src/components/ui/button.tsx
var tn = k("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
function J({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ h(r ? xe : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: q(tn({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region src/components/ui/card.tsx
var nn = {
	default: "",
	stat: "wd-card-stat",
	hero: "wd-card-hero",
	glass: "wd-card-glass"
};
function rn({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ h("div", {
		"data-slot": "card",
		"data-variant": t,
		className: q("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", nn[t], e),
		...n
	});
}
function an({ className: e, ...t }) {
	return /* @__PURE__ */ h("div", {
		"data-slot": "card-header",
		className: q("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 text-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", e),
		...t
	});
}
function on({ className: e, ...t }) {
	return /* @__PURE__ */ h("div", {
		"data-slot": "card-title",
		className: q("leading-none font-semibold", e),
		...t
	});
}
function sn({ className: e, ...t }) {
	return /* @__PURE__ */ h("div", {
		"data-slot": "card-description",
		className: q("text-sm text-muted-foreground", e),
		...t
	});
}
function cn({ className: e, ...t }) {
	return /* @__PURE__ */ h("div", {
		"data-slot": "card-content",
		className: q("px-6 text-start", e),
		...t
	});
}
//#endregion
//#region src/components/ui/input.tsx
function ln({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ h("input", {
		type: t,
		"data-slot": "input",
		className: q("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-start shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/label.tsx
function un({ className: e, ...t }) {
	return /* @__PURE__ */ h(ye, {
		"data-slot": "label",
		className: q("flex items-center gap-2 text-start text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
//#endregion
//#region src/components/ui/switch.tsx
function dn({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ h(Re, {
		"data-slot": "switch",
		"data-size": t,
		className: q("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", e),
		...n,
		dir: "ltr",
		children: /* @__PURE__ */ h(ze, {
			"data-slot": "switch-thumb",
			className: q("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
//#endregion
//#region src/components/ui/textarea.tsx
function fn({ className: e, ...t }) {
	return /* @__PURE__ */ h("textarea", {
		"data-slot": "textarea",
		className: q("flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-start shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40", e),
		...t
	});
}
//#endregion
//#region src/components/payments/GatewaySettingsLayout.tsx
function pn({ title: e, description: t, notice: n, meta: r, sections: i, actions: a, children: o }) {
	let { t: s } = u(), c = async (e) => {
		try {
			await navigator.clipboard.writeText(e), p.success(s("common.copied", { defaultValue: "Copied" }));
		} catch {
			p.error(s("common.copyFailed", { defaultValue: "Copy failed" }));
		}
	};
	return /* @__PURE__ */ h(T, {
		title: e,
		description: t,
		children: /* @__PURE__ */ g("div", {
			className: "mx-auto w-full max-w-6xl space-y-6",
			children: [
				n,
				o,
				r && r.length > 0 ? /* @__PURE__ */ h("div", {
					className: "bg-muted/30 grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3",
					children: r.map((e) => /* @__PURE__ */ g("div", {
						className: "min-w-0 space-y-1",
						children: [/* @__PURE__ */ h("p", {
							className: "text-muted-foreground text-xs font-medium",
							children: e.label
						}), /* @__PURE__ */ g("div", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ h("code", {
								className: "bg-background block min-w-0 flex-1 truncate rounded-md border px-2 py-1.5 text-xs",
								children: e.value || "—"
							}), e.copyable && e.value ? /* @__PURE__ */ h(J, {
								type: "button",
								size: "icon",
								variant: "outline",
								className: "size-8 shrink-0",
								onClick: () => void c(e.value),
								children: /* @__PURE__ */ h(te, { className: "size-3.5" })
							}) : null]
						})]
					}, e.label))
				}) : null,
				i.length > 1 ? /* @__PURE__ */ h("nav", {
					className: "flex flex-wrap gap-2",
					"aria-label": e,
					children: i.map((e) => /* @__PURE__ */ h(J, {
						asChild: !0,
						size: "sm",
						variant: "outline",
						children: /* @__PURE__ */ h("a", {
							href: `#${e.id}`,
							children: e.title
						})
					}, e.id))
				}) : null,
				/* @__PURE__ */ h("div", {
					className: "space-y-5",
					children: i.map((e) => /* @__PURE__ */ g(rn, {
						id: e.id,
						className: "scroll-mt-24",
						children: [/* @__PURE__ */ g(an, { children: [/* @__PURE__ */ h(on, {
							className: "text-base",
							children: e.title
						}), e.description ? /* @__PURE__ */ h(sn, { children: e.description }) : null] }), /* @__PURE__ */ h(cn, { children: e.children })]
					}, e.id))
				}),
				a ? /* @__PURE__ */ h("div", {
					className: "bg-background/95 sticky bottom-3 z-10 flex flex-wrap gap-2 rounded-xl border p-3 shadow-sm backdrop-blur",
					children: a
				}) : null
			]
		})
	});
}
function Y({ label: e, value: t, onChange: n, type: r = "text", placeholder: i, hint: a, className: o }) {
	return /* @__PURE__ */ g("div", {
		className: q("space-y-2", o),
		children: [
			/* @__PURE__ */ h(un, { children: e }),
			/* @__PURE__ */ h(ln, {
				type: r,
				value: t,
				placeholder: i,
				onChange: (e) => n(e.target.value)
			}),
			a ? /* @__PURE__ */ h("p", {
				className: "text-muted-foreground text-xs",
				children: a
			}) : null
		]
	});
}
function mn({ label: e, value: t, onChange: n, hint: r, className: i }) {
	return /* @__PURE__ */ g("div", {
		className: q("space-y-2", i),
		children: [
			/* @__PURE__ */ h(un, { children: e }),
			/* @__PURE__ */ h(fn, {
				value: t,
				onChange: (e) => n(e.target.value),
				rows: 3
			}),
			r ? /* @__PURE__ */ h("p", {
				className: "text-muted-foreground text-xs",
				children: r
			}) : null
		]
	});
}
function X({ label: e, description: t, checked: n, onChange: r }) {
	return /* @__PURE__ */ g("div", {
		className: "flex items-start justify-between gap-4 rounded-lg border border-border/70 px-3 py-3",
		children: [/* @__PURE__ */ g("div", {
			className: "min-w-0 space-y-0.5",
			children: [/* @__PURE__ */ h("p", {
				className: "text-sm font-medium leading-snug",
				children: e
			}), t ? /* @__PURE__ */ h("p", {
				className: "text-muted-foreground text-xs leading-relaxed",
				children: t
			}) : null]
		}), /* @__PURE__ */ h(dn, {
			checked: n,
			onCheckedChange: (e) => r(!!e),
			className: "mt-0.5 shrink-0"
		})]
	});
}
function hn({ children: e }) {
	return /* @__PURE__ */ h("div", {
		className: "grid gap-4 md:grid-cols-2",
		children: e
	});
}
function gn({ children: e }) {
	return /* @__PURE__ */ h("div", {
		className: "grid gap-3 md:grid-cols-2",
		children: e
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
var Z = class extends Error {
	constructor(e, t) {
		super(e), xn(this, "code", void 0), xn(this, "status", void 0), this.name = "ApiError", this.code = t.code, this.status = t.status;
	}
}, Sn = {
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
	if (t instanceof Z && t.code) {
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
		return Cn(n) ? e("errors.api.requestTimeout") : wn(n) ? e("errors.api.emptyReply") : /^(invalid|forbidden|not found)$/i.test(n) ? e("errors.api.generic") : n && !/^(ok|error|internal server error|bad gateway|service unavailable)$/i.test(n) ? n : e("errors.api.unknown");
	}
	return e("errors.api.generic");
}
function Dn(e, t) {
	p.error(En(e, t));
}
//#endregion
//#region src/lib/queryClient.ts
var On = null;
function kn() {
	return On;
}
//#endregion
//#region src/lib/authLost.ts
var An = ["auth", "session"], jn = new Set([
	"rest_cookie_invalid_nonce",
	"rest_not_logged_in",
	"invalid_nonce",
	"ajax_referer_failed",
	"-1"
]);
function Mn(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (t.status === 401) return !0;
	let n = typeof t.code == "string" ? t.code : "";
	if (jn.has(n)) return !0;
	let r = typeof t.message == "string" ? t.message.toLowerCase() : "";
	return !!(r.includes("cookie nonce is invalid") || r.includes("rest_cookie_invalid_nonce") || t.status === 403 && (n === "-1" || r === "-1" || r.includes("are you sure you want to do this")));
}
function Nn(e) {
	let t = e ?? kn();
	t && t.setQueryData(An, { logged_in: !1 });
}
var Pn = new Set([
	"rest_cookie_invalid_nonce",
	"invalid_nonce",
	"ajax_referer_failed",
	"-1"
]);
function Fn(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (t.status === 401) return !1;
	let n = typeof t.code == "string" ? t.code : "";
	if (Pn.has(n)) return !0;
	let r = typeof t.message == "string" ? t.message.toLowerCase() : "";
	return r.includes("cookie nonce is invalid") || r.includes("rest_cookie_invalid_nonce") || r === "invalid nonce";
}
function In(e) {
	Fn(e) || Mn(e) && Nn();
}
//#endregion
//#region src/lib/safeUrl.ts
function Ln(e) {
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
function Q() {
	return window.webinoDashboard;
}
var Rn = 3e4;
function zn(e) {
	try {
		return new URL(e, window.location.origin).origin === window.location.origin;
	} catch {
		return !1;
	}
}
function Bn(e) {
	let t = Q();
	if (!e.startsWith("http")) return t.restUrl + e.replace(/^\//, "");
	if (zn(e) || Ln(e)) return e;
	throw new Z("Request blocked: URL not allowed", {
		code: "forbidden_url",
		status: 0
	});
}
function Vn(e, t) {
	let n = new AbortController(), r = window.setTimeout(() => n.abort(), t), i = e.signal;
	return i && (i.aborted ? n.abort(i.reason) : i.addEventListener("abort", () => n.abort(i.reason), { once: !0 })), {
		signal: n.signal,
		clear: () => window.clearTimeout(r)
	};
}
function Hn(e) {
	let t = e.replace(/^\//, "").split("?")[0];
	return t === "bootstrap" ? "webino_dashboard_bootstrap" : t === "auth/session" ? "webino_dashboard_auth_session" : t === "dashboard/overview" ? "webino_dashboard_overview" : t === "dashboard/sms-panel" ? "webino_dashboard_sms_panel" : t === "license/remote-check" ? "webino_dashboard_license_remote_check" : t === "license/diagnostics" ? "webino_dashboard_license_diagnostics" : t === "license/remote-activate" ? "webino_dashboard_license_remote_activate" : t === "digikala/keys/generate" ? "webino_dashboard_digikala_keys_generate" : t === "digikala/keys" ? "webino_dashboard_digikala_keys" : t === "digikala/token/issue" ? "webino_dashboard_digikala_token_issue" : t === "digikala/auth/status" ? "webino_dashboard_digikala_auth_status" : t === "digikala/settings" ? "webino_dashboard_digikala_settings" : t === "digikala/products/mapped" ? "webino_dashboard_digikala_products_mapped" : t === "digikala/webhook/subscribe" ? "webino_dashboard_digikala_webhook_subscribe" : /^digikala\/products\/\d+\/map$/.test(t) ? "webino_dashboard_digikala_product_map" : /^digikala\/products\/\d+\/sync$/.test(t) ? "webino_dashboard_digikala_product_sync" : /^digikala\/products\/\d+\/maps$/.test(t) ? "webino_dashboard_digikala_product_maps" : /^digikala\/orders\/\d+\/cancel$/.test(t) ? "webino_dashboard_digikala_order_cancel" : /^digikala\/orders\/\d+\/sbs-status$/.test(t) ? "webino_dashboard_digikala_order_sbs" : t === "basalam/oauth/start" ? "webino_dashboard_basalam_oauth_start" : t === "basalam/oauth/complete" ? "webino_dashboard_basalam_oauth_complete" : t === "shop/products/lookup" || t.startsWith("shop/products") || t.startsWith("shop/reports") || t.startsWith("shop/product-categories") || t === "comments" || t.startsWith("comments/") ? "webino_dashboard_shop_rest" : (t.startsWith("bots/bale/") || t.startsWith("bots/telegram/") || t.startsWith("bots/parity/")) && !/^bots\/(bale|telegram)\/(webhook|health)(\/|$)/.test(t) ? "webino_dashboard_bots_rest" : /^(payments|torobpay|snapppay|digipay|zarinpal|bale-pay|wallet|c2c)(\/|$)/.test(t) ? "webino_dashboard_payments_rest" : t.startsWith("analytics/") && t !== "analytics/hit" ? "webino_dashboard_analytics_rest" : null;
}
function Un(e, t) {
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
function Wn(e, t) {
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
async function Gn(e, t, n = {}) {
	let r = Hn(e), i = Q();
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
	let { signal: l, clear: u } = Vn({}, t);
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
			let n = Wn(t, e.status);
			throw new Z(n.message, {
				code: n.code,
				status: e.status
			});
		}
		if (!n.success) {
			let t = new Z(typeof n.data?.message == "string" && n.data.message || n.message || "Request failed", {
				code: typeof n.data?.code == "string" && n.data.code || "ajax_fallback_failed",
				status: e.status
			});
			throw In(t), t;
		}
		return n.data;
	} catch (e) {
		throw e instanceof Z ? (In(e), e) : e instanceof DOMException && e.name === "AbortError" ? new Z("Request timed out", {
			code: "request_timeout",
			status: 0
		}) : e instanceof TypeError ? new Z("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		u();
	}
}
var Kn = null;
function qn(e) {
	let t = Q();
	t && typeof e == "string" && e.length > 0 && (t.nonce = e);
}
function Jn() {
	if (Kn) return Kn;
	let e = Q();
	if (!e?.ajaxUrl) return Promise.resolve(!1);
	let t = new URLSearchParams();
	return t.set("action", "webino_dashboard_auth_session"), Kn = fetch(e.ajaxUrl, {
		method: "POST",
		credentials: "same-origin",
		headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
		body: t
	}).then((e) => e.json()).then((e) => {
		let t = !!(e?.success && e.data?.logged_in);
		return t && qn(e.data?.nonce), t && typeof e.data?.nonce == "string" && e.data.nonce.length > 0;
	}).catch(() => !1).finally(() => {
		window.setTimeout(() => {
			Kn = null;
		}, 0);
	}), Kn;
}
async function $(e, t = {}, n = Rn) {
	try {
		return await Yn(e, t, n);
	} catch (r) {
		if (!Fn(r)) throw r;
		if (!await Jn()) throw Nn(), r;
		let i = { ...t.headers };
		for (let e of Object.keys(i)) e.toLowerCase() === "x-wp-nonce" && delete i[e];
		return Yn(e, {
			...t,
			headers: i
		}, n);
	}
}
async function Yn(e, t = {}, n = Rn) {
	if (Hn(e) && Q().ajaxUrl) return Gn(e, n, t);
	let r = Bn(e), i = Q(), a = { ...t.headers }, o = Object.keys(a).some((e) => e.toLowerCase() === "x-wp-nonce");
	i.nonce && !o && (a["X-WP-Nonce"] = i.nonce), !Object.keys(a).some((e) => e.toLowerCase() === "content-type") && typeof t.body == "string" && t.body.length > 0 && (a["Content-Type"] = "application/json");
	let { signal: s, clear: c } = Vn(t, n);
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
			let t = Un(n, e.status);
			throw new Z(t.message, {
				code: t.code,
				status: e.status
			});
		}
		if (!e.ok) {
			let t = i, n = new Z(typeof t.message == "string" ? t.message : typeof t.error == "string" ? t.error : t.code || e.statusText, {
				code: t.code,
				status: e.status
			});
			throw In(n), n;
		}
		return i;
	} catch (e) {
		throw e instanceof Z ? (In(e), e) : e instanceof DOMException && e.name === "AbortError" ? new Z("Request timed out", {
			code: "request_timeout",
			status: 0
		}) : e instanceof TypeError ? new Z("Network unavailable", {
			code: "network_offline",
			status: 0
		}) : e;
	} finally {
		c();
	}
}
//#endregion
//#region ../Modules/torobpay-gateway-module/client/pages/TorobPaySettingsPage.tsx
function Xn() {
	let { t: r } = u(), i = n(), a = f().pathname, o = a.endsWith("/display"), s = a.endsWith("/orders"), _ = a.endsWith("/campaign"), v = a.endsWith("/logs"), y = t({
		queryKey: ["torobpay", "settings"],
		queryFn: async () => $("torobpay/settings")
	}), [b, x] = l(null);
	c(() => {
		y.data?.settings && x(y.data.settings);
	}, [y.data]);
	let S = t({
		queryKey: ["torobpay", "orders"],
		queryFn: async () => $("torobpay/orders"),
		enabled: s
	}), ee = t({
		queryKey: ["torobpay", "logs"],
		queryFn: async () => $("torobpay/logs"),
		enabled: v
	}), C = t({
		queryKey: ["torobpay", "campaign"],
		queryFn: async () => $("torobpay/campaign"),
		enabled: _
	}), w = e({
		mutationFn: async () => {
			if (b) return $("torobpay/settings", {
				method: "POST",
				body: JSON.stringify({ settings: b })
			});
		},
		onSuccess: (e) => {
			e?.settings && x(e.settings), i.invalidateQueries({ queryKey: ["torobpay"] }), p.success(r("torobpay.saved"));
		},
		onError: (e) => Dn(r, e)
	}), te = e({
		mutationFn: async () => $("torobpay/test-connection", { method: "POST" }),
		onSuccess: () => p.success(r("torobpay.testOk")),
		onError: (e) => Dn(r, e)
	}), E = e({
		mutationFn: async () => $("torobpay/fetch-credentials", { method: "POST" }),
		onSuccess: (e) => {
			e?.settings && x(e.settings), p.success(r("torobpay.credsOk"));
		},
		onError: (e) => Dn(r, e)
	}), ne = e({
		mutationFn: async (e) => $(`torobpay/orders/${e}/probe`, { method: "POST" }),
		onSuccess: () => {
			i.invalidateQueries({ queryKey: ["torobpay", "orders"] }), p.success(r("torobpay.probed"));
		},
		onError: (e) => Dn(r, e)
	}), D = e({
		mutationFn: async (e) => $(`torobpay/orders/${e}/refund`, {
			method: "POST",
			body: "{}"
		}),
		onSuccess: () => {
			i.invalidateQueries({ queryKey: ["torobpay", "orders"] }), p.success(r("torobpay.refunded"));
		},
		onError: (e) => Dn(r, e)
	}), O = /* @__PURE__ */ g("div", {
		className: "mb-4 flex flex-wrap gap-2",
		children: [
			/* @__PURE__ */ h(J, {
				asChild: !0,
				size: "sm",
				variant: !o && !s && !_ && !v ? "default" : "outline",
				children: /* @__PURE__ */ h(d, {
					to: "/settings/shop/torobpay",
					children: r("torobpay.nav.settings")
				})
			}),
			/* @__PURE__ */ h(J, {
				asChild: !0,
				size: "sm",
				variant: o ? "default" : "outline",
				children: /* @__PURE__ */ h(d, {
					to: "/settings/shop/torobpay/display",
					children: r("torobpay.nav.display")
				})
			}),
			/* @__PURE__ */ h(J, {
				asChild: !0,
				size: "sm",
				variant: s ? "default" : "outline",
				children: /* @__PURE__ */ h(d, {
					to: "/settings/shop/torobpay/orders",
					children: r("torobpay.nav.orders")
				})
			}),
			/* @__PURE__ */ h(J, {
				asChild: !0,
				size: "sm",
				variant: _ ? "default" : "outline",
				children: /* @__PURE__ */ h(d, {
					to: "/settings/shop/torobpay/campaign",
					children: r("torobpay.nav.campaign")
				})
			}),
			/* @__PURE__ */ h(J, {
				asChild: !0,
				size: "sm",
				variant: v ? "default" : "outline",
				children: /* @__PURE__ */ h(d, {
					to: "/settings/shop/torobpay/logs",
					children: r("torobpay.nav.logs")
				})
			})
		]
	});
	if (v) return /* @__PURE__ */ g(T, {
		title: r("torobpay.logsTitle"),
		description: r("torobpay.logsSubtitle"),
		children: [O, /* @__PURE__ */ h("div", {
			className: "mx-auto w-full max-w-6xl space-y-2",
			children: (ee.data?.logs ?? []).map((e, t) => /* @__PURE__ */ h("pre", {
				className: "bg-muted/40 overflow-x-auto rounded-lg border p-3 text-xs",
				children: JSON.stringify(e, null, 2)
			}, t))
		})]
	});
	if (s) return /* @__PURE__ */ g(T, {
		title: r("torobpay.ordersTitle"),
		description: r("torobpay.ordersSubtitle"),
		children: [O, /* @__PURE__ */ g("div", {
			className: "mx-auto w-full max-w-6xl space-y-2",
			children: [(S.data?.items ?? []).map((e) => /* @__PURE__ */ g("div", {
				className: "flex flex-wrap items-center justify-between gap-2 rounded-xl border p-4 text-sm",
				children: [/* @__PURE__ */ g("div", { children: [/* @__PURE__ */ g("div", {
					className: "font-medium",
					children: [
						"#",
						String(e.number),
						" — ",
						String(e.status)
					]
				}), /* @__PURE__ */ g("div", {
					className: "text-muted-foreground text-xs",
					children: [
						r("torobpay.remoteStatus"),
						": ",
						String(e.torob_status || "—"),
						" · ",
						String(e.billing_phone || "")
					]
				})] }), /* @__PURE__ */ g("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ h(J, {
						size: "sm",
						variant: "outline",
						onClick: () => ne.mutate(Number(e.id)),
						children: r("torobpay.probe")
					}), /* @__PURE__ */ h(J, {
						size: "sm",
						variant: "destructive",
						onClick: () => D.mutate(Number(e.id)),
						children: r("torobpay.refund")
					})]
				})]
			}, String(e.id))), !S.isLoading && !(S.data?.items?.length ?? 0) ? /* @__PURE__ */ h("p", {
				className: "text-muted-foreground text-sm",
				children: r("common.empty")
			}) : null]
		})]
	});
	if (_) return /* @__PURE__ */ g(T, {
		title: r("torobpay.campaignTitle"),
		description: r("torobpay.campaignHint"),
		children: [O, /* @__PURE__ */ g("div", {
			className: "mx-auto w-full max-w-6xl",
			children: [C.data?.error ? /* @__PURE__ */ h("p", {
				className: "text-destructive mb-3 text-sm",
				children: C.data.error
			}) : null, /* @__PURE__ */ h("pre", {
				className: "bg-muted/40 overflow-x-auto rounded-xl border p-4 text-xs",
				children: JSON.stringify(C.data?.items ?? {}, null, 2)
			})]
		})]
	});
	if (!b) return /* @__PURE__ */ g(T, {
		title: r("torobpay.title"),
		children: [O, r("common.loading")]
	});
	if (o) return /* @__PURE__ */ h(pn, {
		title: r("torobpay.displayTitle"),
		description: r("torobpay.displaySubtitle"),
		sections: [{
			id: "display",
			title: r("gateway.section.display"),
			description: r("gateway.section.displayHint"),
			children: /* @__PURE__ */ g(gn, { children: [
				/* @__PURE__ */ h(X, {
					label: r("torobpay.flag.widget"),
					description: r("torobpay.flag.widgetHint"),
					checked: b.widget_enabled,
					onChange: (e) => x({
						...b,
						widget_enabled: e
					})
				}),
				/* @__PURE__ */ h(X, {
					label: r("torobpay.flag.badge"),
					description: r("torobpay.flag.badgeHint"),
					checked: b.badge_enabled,
					onChange: (e) => x({
						...b,
						badge_enabled: e
					})
				}),
				/* @__PURE__ */ h(X, {
					label: r("torobpay.flag.marquee"),
					description: r("torobpay.flag.marqueeHint"),
					checked: b.marquee_enabled,
					onChange: (e) => x({
						...b,
						marquee_enabled: e
					})
				}),
				/* @__PURE__ */ h(X, {
					label: r("torobpay.flag.topbar"),
					description: r("torobpay.flag.topbarHint"),
					checked: b.topbar_enabled,
					onChange: (e) => x({
						...b,
						topbar_enabled: e
					})
				}),
				/* @__PURE__ */ h(X, {
					label: r("torobpay.flag.slider"),
					description: r("torobpay.flag.sliderHint"),
					checked: b.slider_enabled,
					onChange: (e) => x({
						...b,
						slider_enabled: e
					})
				})
			] })
		}],
		actions: /* @__PURE__ */ h(J, {
			onClick: () => w.mutate(),
			disabled: w.isPending,
			children: r("common.save")
		}),
		children: O
	});
	let k = String(b.gateway_source ?? "webino"), A = k === "official" ? r("gateway.meta.sourceOfficial") : k === "webino" ? r("gateway.meta.sourceWebino") : k;
	return /* @__PURE__ */ h(pn, {
		title: r("torobpay.title"),
		description: r("torobpay.description"),
		notice: b.official_plugin_active ? /* @__PURE__ */ h("p", {
			className: "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100",
			children: r("torobpay.officialNotice")
		}) : null,
		meta: [{
			label: r("gateway.meta.source"),
			value: A
		}, {
			label: r("gateway.meta.callback"),
			value: String(b.callback_url ?? ""),
			copyable: !0
		}],
		sections: [
			{
				id: "connection",
				title: r("gateway.section.connection"),
				description: r("gateway.section.connectionHint"),
				children: /* @__PURE__ */ g("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ h(X, {
						label: r("torobpay.enabled"),
						description: r("torobpay.enabledHint"),
						checked: b.enabled,
						onChange: (e) => x({
							...b,
							enabled: e
						})
					}), /* @__PURE__ */ g(hn, { children: [
						/* @__PURE__ */ h(Y, {
							label: r("gateway.field.title"),
							value: b.title,
							onChange: (e) => x({
								...b,
								title: e
							})
						}),
						/* @__PURE__ */ h(Y, {
							label: r("gateway.field.description"),
							value: b.description,
							onChange: (e) => x({
								...b,
								description: e
							})
						}),
						/* @__PURE__ */ h(Y, {
							label: r("gateway.field.orderButtonText"),
							value: String(b.order_button_text ?? ""),
							onChange: (e) => x({
								...b,
								order_button_text: e
							})
						}),
						/* @__PURE__ */ g("div", {
							className: "space-y-2 md:col-span-2",
							children: [/* @__PURE__ */ h("label", {
								className: "text-sm font-medium",
								children: r("gateway.field.iconUrl")
							}), /* @__PURE__ */ g("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ h("img", {
									src: String(b.icon_url || b.resolved_icon_url || b.default_icon_url || ""),
									alt: "",
									className: "h-10 w-10 shrink-0 rounded border object-contain"
								}), /* @__PURE__ */ h("div", {
									className: "min-w-0 flex-1 space-y-1",
									children: /* @__PURE__ */ h(Y, {
										label: "",
										value: String(b.icon_url ?? ""),
										onChange: (e) => x({
											...b,
											icon_url: e
										}),
										hint: r("gateway.field.iconUrlHint")
									})
								})]
							})]
						}),
						/* @__PURE__ */ h(Y, {
							label: r("gateway.field.baseUrl"),
							value: b.base_url,
							onChange: (e) => x({
								...b,
								base_url: e
							}),
							hint: r("torobpay.baseUrlHint")
						}),
						/* @__PURE__ */ h(Y, {
							label: r("gateway.field.clientId"),
							value: b.client_id,
							onChange: (e) => x({
								...b,
								client_id: e
							})
						}),
						/* @__PURE__ */ h(Y, {
							label: b.has_client_secret ? r("gateway.field.clientSecretKeep") : r("gateway.field.clientSecret"),
							value: b.client_secret ?? "",
							type: "password",
							onChange: (e) => x({
								...b,
								client_secret: e
							})
						}),
						/* @__PURE__ */ h(Y, {
							label: r("gateway.field.username"),
							value: b.client_username,
							onChange: (e) => x({
								...b,
								client_username: e
							})
						}),
						/* @__PURE__ */ h(Y, {
							label: b.has_client_password ? r("gateway.field.passwordKeep") : r("gateway.field.password"),
							value: b.client_password ?? "",
							type: "password",
							onChange: (e) => x({
								...b,
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
				children: /* @__PURE__ */ g(gn, { children: [
					/* @__PURE__ */ h(X, {
						label: r("gateway.flag.requireMobile"),
						description: r("gateway.flag.requireMobileHint"),
						checked: b.mobile_enabled,
						onChange: (e) => x({
							...b,
							mobile_enabled: e
						})
					}),
					/* @__PURE__ */ h(X, {
						label: r("gateway.flag.requirePostcode"),
						description: r("gateway.flag.requirePostcodeHint"),
						checked: b.postal_enabled,
						onChange: (e) => x({
							...b,
							postal_enabled: e
						})
					}),
					/* @__PURE__ */ h(X, {
						label: r("gateway.flag.defaultEligible"),
						description: r("gateway.flag.defaultEligibleHint"),
						checked: b.default_gateway,
						onChange: (e) => x({
							...b,
							default_gateway: e
						})
					}),
					/* @__PURE__ */ h(X, {
						label: r("gateway.flag.directRedirect"),
						description: r("gateway.flag.directRedirectHint"),
						checked: b.direct_payment,
						onChange: (e) => x({
							...b,
							direct_payment: e
						})
					}),
					/* @__PURE__ */ h(X, {
						label: r("torobpay.flag.disableRetry"),
						description: r("torobpay.flag.disableRetryHint"),
						checked: b.disable_payment_retry,
						onChange: (e) => x({
							...b,
							disable_payment_retry: e
						})
					}),
					/* @__PURE__ */ h(X, {
						label: r("torobpay.flag.utmAuto"),
						description: r("torobpay.flag.utmAutoHint"),
						checked: b.utm_torob_enabled,
						onChange: (e) => x({
							...b,
							utm_torob_enabled: e
						})
					}),
					/* @__PURE__ */ h(X, {
						label: r("torobpay.flag.utmExclusive"),
						description: r("torobpay.flag.utmExclusiveHint"),
						checked: b.utm_exclude_others,
						onChange: (e) => x({
							...b,
							utm_exclude_others: e
						})
					})
				] })
			},
			{
				id: "messages",
				title: r("gateway.section.messages"),
				description: r("gateway.section.messagesHint"),
				children: /* @__PURE__ */ g("div", {
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ h(mn, {
							label: r("gateway.field.successMessage"),
							value: b.success_message || "",
							onChange: (e) => x({
								...b,
								success_message: e
							}),
							hint: r("gateway.field.messageVars")
						}),
						/* @__PURE__ */ h(mn, {
							label: r("gateway.field.failedMessage"),
							value: b.failed_message || "",
							onChange: (e) => x({
								...b,
								failed_message: e
							})
						}),
						/* @__PURE__ */ h(mn, {
							label: r("gateway.field.cancelledMessage"),
							value: String(b.cancelled_message ?? ""),
							onChange: (e) => x({
								...b,
								cancelled_message: e
							})
						})
					]
				})
			},
			{
				id: "advanced",
				title: r("gateway.section.advanced"),
				description: r("gateway.section.advancedHint"),
				children: /* @__PURE__ */ g("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ h(X, {
						label: r("torobpay.flag.smartDns"),
						description: r("torobpay.flag.smartDnsHint"),
						checked: b.dns_smart_resolve_enabled,
						onChange: (e) => x({
							...b,
							dns_smart_resolve_enabled: e
						})
					}), /* @__PURE__ */ h(Y, {
						label: r("torobpay.field.dnsOverride"),
						value: b.dns_ip_override || "",
						onChange: (e) => x({
							...b,
							dns_ip_override: e
						}),
						hint: r("torobpay.field.dnsOverrideHint")
					})]
				})
			}
		],
		actions: /* @__PURE__ */ g(m, { children: [
			/* @__PURE__ */ h(J, {
				onClick: () => w.mutate(),
				disabled: w.isPending,
				children: r("common.save")
			}),
			/* @__PURE__ */ h(J, {
				variant: "outline",
				onClick: () => te.mutate(),
				disabled: te.isPending,
				children: r("torobpay.test")
			}),
			/* @__PURE__ */ h(J, {
				variant: "outline",
				onClick: () => E.mutate(),
				disabled: E.isPending,
				children: r("torobpay.fetchCreds")
			})
		] }),
		children: O
	});
}
//#endregion
//#region ../Modules/torobpay-gateway-module/client/module-entry.tsx
var Zn = {
	"settings/shop/torobpay": Xn,
	"settings/shop/torobpay/display": Xn,
	"settings/shop/torobpay/orders": Xn,
	"settings/shop/torobpay/campaign": Xn,
	"settings/shop/torobpay/logs": Xn
}, Qn = { routes: Zn };
//#endregion
export { Qn as default, Zn as routes };
