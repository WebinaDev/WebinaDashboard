import * as __webin_ext_0_ns from "react";
const __webin_ext_0 = __webin_ext_0_ns.default ?? __webin_ext_0_ns;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a2, b) => (typeof require !== "undefined" ? require : a2)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e2) {
    throw mod = 0, e2;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/void-elements/index.js
var require_void_elements = __commonJS({
  "node_modules/void-elements/index.js"(exports, module) {
    module.exports = {
      "area": true,
      "base": true,
      "br": true,
      "col": true,
      "embed": true,
      "hr": true,
      "img": true,
      "input": true,
      "link": true,
      "meta": true,
      "param": true,
      "source": true,
      "track": true,
      "wbr": true
    };
  }
});

// node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js
var require_use_sync_external_store_shim_production = __commonJS({
  "node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js"(exports) {
    "use strict";
    var React3 = __webin_ext_0;
    function is(x, y) {
      return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
    }
    var objectIs = "function" === typeof Object.is ? Object.is : is;
    var useState2 = React3.useState;
    var useEffect2 = React3.useEffect;
    var useLayoutEffect = React3.useLayoutEffect;
    var useDebugValue = React3.useDebugValue;
    function useSyncExternalStore$2(subscribe, getSnapshot) {
      var value = getSnapshot(), _useState = useState2({ inst: { value, getSnapshot } }), inst = _useState[0].inst, forceUpdate = _useState[1];
      useLayoutEffect(
        function() {
          inst.value = value;
          inst.getSnapshot = getSnapshot;
          checkIfSnapshotChanged(inst) && forceUpdate({ inst });
        },
        [subscribe, value, getSnapshot]
      );
      useEffect2(
        function() {
          checkIfSnapshotChanged(inst) && forceUpdate({ inst });
          return subscribe(function() {
            checkIfSnapshotChanged(inst) && forceUpdate({ inst });
          });
        },
        [subscribe]
      );
      useDebugValue(value);
      return value;
    }
    function checkIfSnapshotChanged(inst) {
      var latestGetSnapshot = inst.getSnapshot;
      inst = inst.value;
      try {
        var nextValue = latestGetSnapshot();
        return !objectIs(inst, nextValue);
      } catch (error) {
        return true;
      }
    }
    function useSyncExternalStore$1(subscribe, getSnapshot) {
      return getSnapshot();
    }
    var shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
    exports.useSyncExternalStore = void 0 !== React3.useSyncExternalStore ? React3.useSyncExternalStore : shim;
  }
});

// node_modules/use-sync-external-store/shim/index.js
var require_shim = __commonJS({
  "node_modules/use-sync-external-store/shim/index.js"(exports, module) {
    "use strict";
    if (true) {
      module.exports = require_use_sync_external_store_shim_production();
    } else {
      module.exports = null;
    }
  }
});

// node_modules/react-i18next/dist/es/Trans.js
import { useContext } from "react";

// node_modules/react-i18next/dist/es/TransWithoutContext.js
import { Fragment, isValidElement, cloneElement, createElement, Children } from "react";
import { keyFromSelector } from "i18next";

// node_modules/html-parse-stringify/dist/html-parse-stringify.module.js
var import_void_elements = __toESM(require_void_elements());
var t = /\s([^'"/\s><]+?)[\s/>]|([^\s=]+)=\s?(".*?"|'.*?')/g;
function n(n2) {
  var r2 = { type: "tag", name: "", voidElement: false, attrs: {}, children: [] }, i2 = n2.match(/<\/?([^\s]+?)[/\s>]/);
  if (i2 && (r2.name = i2[1], (import_void_elements.default[i2[1]] || "/" === n2.charAt(n2.length - 2)) && (r2.voidElement = true), r2.name.startsWith("!--"))) {
    var s2 = n2.indexOf("-->");
    return { type: "comment", comment: -1 !== s2 ? n2.slice(4, s2) : "" };
  }
  for (var a2 = new RegExp(t), c2 = null; null !== (c2 = a2.exec(n2)); ) if (c2[0].trim()) if (c2[1]) {
    var o = c2[1].trim(), l = [o, ""];
    o.indexOf("=") > -1 && (l = o.split("=")), r2.attrs[l[0]] = l[1], a2.lastIndex--;
  } else c2[2] && (r2.attrs[c2[2]] = c2[3].trim().substring(1, c2[3].length - 1));
  return r2;
}
var r = /<[a-zA-Z0-9\-\!\/](?:"[^"]*"|'[^']*'|[^'">])*>/g;
var i = /^\s*$/;
var s = /* @__PURE__ */ Object.create(null);
function a(e2, t2) {
  switch (t2.type) {
    case "text":
      return e2 + t2.content;
    case "tag":
      return e2 += "<" + t2.name + (t2.attrs ? (function(e3) {
        var t3 = [];
        for (var n2 in e3) t3.push(n2 + '="' + e3[n2] + '"');
        return t3.length ? " " + t3.join(" ") : "";
      })(t2.attrs) : "") + (t2.voidElement ? "/>" : ">"), t2.voidElement ? e2 : e2 + t2.children.reduce(a, "") + "</" + t2.name + ">";
    case "comment":
      return e2 + "<!--" + t2.comment + "-->";
  }
}
var c = { parse: function(e2, t2) {
  t2 || (t2 = {}), t2.components || (t2.components = s);
  var a2, c2 = [], o = [], l = -1, m = false;
  if (0 !== e2.indexOf("<")) {
    var u = e2.indexOf("<");
    c2.push({ type: "text", content: -1 === u ? e2 : e2.substring(0, u) });
  }
  return e2.replace(r, function(r2, s2) {
    if (m) {
      if (r2 !== "</" + a2.name + ">") return;
      m = false;
    }
    var u2, f = "/" !== r2.charAt(1), h = r2.startsWith("<!--"), p = s2 + r2.length, d = e2.charAt(p);
    if (h) {
      var v = n(r2);
      return l < 0 ? (c2.push(v), c2) : ((u2 = o[l]).children.push(v), c2);
    }
    if (f && (l++, "tag" === (a2 = n(r2)).type && t2.components[a2.name] && (a2.type = "component", m = true), a2.voidElement || m || !d || "<" === d || a2.children.push({ type: "text", content: e2.slice(p, e2.indexOf("<", p)) }), 0 === l && c2.push(a2), (u2 = o[l - 1]) && u2.children.push(a2), o[l] = a2), (!f || a2.voidElement) && (l > -1 && (a2.voidElement || a2.name === r2.slice(2, -1)) && (l--, a2 = -1 === l ? c2 : o[l]), !m && "<" !== d && d)) {
      u2 = -1 === l ? c2 : o[l].children;
      var x = e2.indexOf("<", p), g = e2.slice(p, -1 === x ? void 0 : x);
      i.test(g) && (g = " "), (x > -1 && l + u2.length >= 0 || " " !== g) && u2.push({ type: "text", content: g });
    }
  }), c2;
}, stringify: function(e2) {
  return e2.reduce(function(e3, t2) {
    return e3 + a("", t2);
  }, "");
} };
var html_parse_stringify_module_default = c;

// node_modules/react-i18next/dist/es/utils.js
var warn = (i18n, code, msg, rest) => {
  const args = [msg, {
    code,
    ...rest || {}
  }];
  if (i18n?.services?.logger?.forward) {
    return i18n.services.logger.forward(args, "warn", "react-i18next::", true);
  }
  if (isString(args[0])) args[0] = `react-i18next:: ${args[0]}`;
  if (i18n?.services?.logger?.warn) {
    i18n.services.logger.warn(...args);
  } else if (console?.warn) {
    console.warn(...args);
  }
};
var alreadyWarned = {};
var warnOnce = (i18n, code, msg, rest) => {
  if (isString(msg) && alreadyWarned[msg]) return;
  if (isString(msg)) alreadyWarned[msg] = /* @__PURE__ */ new Date();
  warn(i18n, code, msg, rest);
};
var loadedClb = (i18n, cb) => () => {
  if (i18n.isInitialized) {
    cb();
  } else {
    const initialized = () => {
      setTimeout(() => {
        i18n.off("initialized", initialized);
      }, 0);
      cb();
    };
    i18n.on("initialized", initialized);
  }
};
var loadNamespaces = (i18n, ns, cb) => {
  i18n.loadNamespaces(ns, loadedClb(i18n, cb));
};
var loadLanguages = (i18n, lng, ns, cb) => {
  if (isString(ns)) ns = [ns];
  if (i18n.options.preload && i18n.options.preload.indexOf(lng) > -1) return loadNamespaces(i18n, ns, cb);
  ns.forEach((n2) => {
    if (i18n.options.ns.indexOf(n2) < 0) i18n.options.ns.push(n2);
  });
  i18n.loadLanguages(lng, loadedClb(i18n, cb));
};
var hasLoadedNamespace = (ns, i18n, options = {}) => {
  if (!i18n.languages || !i18n.languages.length) {
    warnOnce(i18n, "NO_LANGUAGES", "i18n.languages were undefined or empty", {
      languages: i18n.languages
    });
    return true;
  }
  return i18n.hasLoadedNamespace(ns, {
    lng: options.lng,
    precheck: (i18nInstance2, loadNotPending) => {
      if (options.bindI18n && options.bindI18n.indexOf("languageChanging") > -1 && i18nInstance2.services.backendConnector.backend && i18nInstance2.isLanguageChangingTo && !loadNotPending(i18nInstance2.isLanguageChangingTo, ns)) return false;
    }
  });
};
var getDisplayName = (Component) => Component.displayName || Component.name || (isString(Component) && Component.length > 0 ? Component : "Unknown");
var isString = (obj) => typeof obj === "string";
var isObject = (obj) => typeof obj === "object" && obj !== null;

// node_modules/react-i18next/dist/es/unescape.js
var matchHtmlEntity = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34|nbsp|#160|copy|#169|reg|#174|hellip|#8230|#x2F|#47);/g;
var htmlEntities = {
  "&amp;": "&",
  "&#38;": "&",
  "&lt;": "<",
  "&#60;": "<",
  "&gt;": ">",
  "&#62;": ">",
  "&apos;": "'",
  "&#39;": "'",
  "&quot;": '"',
  "&#34;": '"',
  "&nbsp;": " ",
  "&#160;": " ",
  "&copy;": "\xA9",
  "&#169;": "\xA9",
  "&reg;": "\xAE",
  "&#174;": "\xAE",
  "&hellip;": "\u2026",
  "&#8230;": "\u2026",
  "&#x2F;": "/",
  "&#47;": "/"
};
var unescapeHtmlEntity = (m) => htmlEntities[m];
var unescape = (text) => text.replace(matchHtmlEntity, unescapeHtmlEntity);

// node_modules/react-i18next/dist/es/defaults.js
var defaultOptions = {
  bindI18n: "languageChanged",
  bindI18nStore: "",
  transEmptyNodeValue: "",
  transSupportBasicHtmlNodes: true,
  transWrapTextNodes: "",
  transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p"],
  useSuspense: true,
  unescape,
  transDefaultProps: void 0
};
var setDefaults = (options = {}) => {
  defaultOptions = {
    ...defaultOptions,
    ...options
  };
};
var getDefaults = () => defaultOptions;

// node_modules/react-i18next/dist/es/i18nInstance.js
var i18nInstance;
var setI18n = (instance) => {
  i18nInstance = instance;
};
var getI18n = () => i18nInstance;

// node_modules/react-i18next/dist/es/TransWithoutContext.js
var hasChildren = (node, checkLength) => {
  if (!node) return false;
  const base = node.props?.children ?? node.children;
  if (checkLength) return base.length > 0;
  return !!base;
};
var getChildren = (node) => {
  if (!node) return [];
  const children = node.props?.children ?? node.children;
  return node.props?.i18nIsDynamicList ? getAsArray(children) : children;
};
var hasValidReactChildren = (children) => Array.isArray(children) && children.every(isValidElement);
var getAsArray = (data) => Array.isArray(data) ? data : [data];
var mergeProps = (source, target) => {
  const newTarget = {
    ...target
  };
  newTarget.props = {
    ...target.props,
    ...source.props
  };
  return newTarget;
};
var getValuesFromChildren = (children) => {
  const values = {};
  if (!children) return values;
  const getData = (childs) => {
    const childrenArray = getAsArray(childs);
    childrenArray.forEach((child) => {
      if (isString(child)) return;
      if (hasChildren(child)) getData(getChildren(child));
      else if (isObject(child) && !isValidElement(child)) Object.assign(values, child);
    });
  };
  getData(children);
  return values;
};
var nodesToString = (children, i18nOptions, i18n, i18nKey) => {
  if (!children) return "";
  let stringNode = "";
  const childrenArray = getAsArray(children);
  const keepArray = i18nOptions?.transSupportBasicHtmlNodes ? i18nOptions.transKeepBasicHtmlNodesFor ?? [] : [];
  childrenArray.forEach((child, childIndex) => {
    if (isString(child)) {
      stringNode += `${child}`;
      return;
    }
    if (isValidElement(child)) {
      const {
        props,
        type
      } = child;
      const childPropsCount = Object.keys(props).length;
      const shouldKeepChild = keepArray.indexOf(type) > -1;
      const childChildren = props.children;
      if (!childChildren && shouldKeepChild && !childPropsCount) {
        stringNode += `<${type}/>`;
        return;
      }
      if (!childChildren && (!shouldKeepChild || childPropsCount) || props.i18nIsDynamicList) {
        stringNode += `<${childIndex}></${childIndex}>`;
        return;
      }
      if (shouldKeepChild && childPropsCount <= 1) {
        const cnt = isString(childChildren) ? childChildren : nodesToString(childChildren, i18nOptions, i18n, i18nKey);
        stringNode += `<${type}>${cnt}</${type}>`;
        return;
      }
      const content = nodesToString(childChildren, i18nOptions, i18n, i18nKey);
      stringNode += `<${childIndex}>${content}</${childIndex}>`;
      return;
    }
    if (child === null) {
      warn(i18n, "TRANS_NULL_VALUE", `Passed in a null value as child`, {
        i18nKey
      });
      return;
    }
    if (isObject(child)) {
      const {
        format,
        ...clone
      } = child;
      const keys = Object.keys(clone);
      if (keys.length === 1) {
        const value = format ? `${keys[0]}, ${format}` : keys[0];
        stringNode += `{{${value}}}`;
        return;
      }
      warn(i18n, "TRANS_INVALID_OBJ", `Invalid child - Object should only have keys {{ value, format }} (format is optional).`, {
        i18nKey,
        child
      });
      return;
    }
    warn(i18n, "TRANS_INVALID_VAR", `Passed in a variable like {number} - pass variables for interpolation as full objects like {{number}}.`, {
      i18nKey,
      child
    });
  });
  return stringNode;
};
var escapeLiteralLessThan = (str, keepArray = [], knownComponentsMap = {}) => {
  if (!str) return str;
  const knownNames = Object.keys(knownComponentsMap);
  const allValidNames = [...keepArray, ...knownNames];
  let result = "";
  let i2 = 0;
  while (i2 < str.length) {
    if (str[i2] === "<") {
      let isValidTag = false;
      const closingMatch = str.slice(i2).match(/^<\/(\d+|[a-zA-Z][a-zA-Z0-9_-]*)>/);
      if (closingMatch) {
        const tagName = closingMatch[1];
        if (/^\d+$/.test(tagName) || allValidNames.includes(tagName)) {
          isValidTag = true;
          result += closingMatch[0];
          i2 += closingMatch[0].length;
        }
      }
      if (!isValidTag) {
        const openingMatch = str.slice(i2).match(/^<(\d+|[a-zA-Z][a-zA-Z0-9_-]*)(\s+[\w-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*(\/)?>/);
        if (openingMatch) {
          const tagName = openingMatch[1];
          if (/^\d+$/.test(tagName) || allValidNames.includes(tagName)) {
            isValidTag = true;
            result += openingMatch[0];
            i2 += openingMatch[0].length;
          }
        }
      }
      if (!isValidTag) {
        result += "&lt;";
        i2 += 1;
      }
    } else {
      result += str[i2];
      i2 += 1;
    }
  }
  return result;
};
var renderNodes = (children, knownComponentsMap, targetString, i18n, i18nOptions, combinedTOpts, shouldUnescape) => {
  if (targetString === "") return [];
  const keepArray = i18nOptions.transKeepBasicHtmlNodesFor || [];
  const emptyChildrenButNeedsHandling = targetString && new RegExp(keepArray.map((keep) => `<${keep}`).join("|")).test(targetString);
  if (!children && !knownComponentsMap && !emptyChildrenButNeedsHandling && !shouldUnescape) return [targetString];
  const data = knownComponentsMap ?? {};
  const getData = (childs) => {
    const childrenArray = getAsArray(childs);
    childrenArray.forEach((child) => {
      if (isString(child)) return;
      if (hasChildren(child)) getData(getChildren(child));
      else if (isObject(child) && !isValidElement(child)) Object.assign(data, child);
    });
  };
  getData(children);
  const escapedString = escapeLiteralLessThan(targetString, keepArray, data);
  const ast = html_parse_stringify_module_default.parse(`<0>${escapedString}</0>`);
  const opts = {
    ...data,
    ...combinedTOpts
  };
  const renderInner = (child, node, rootReactNode) => {
    const childs = getChildren(child);
    const mappedChildren = mapAST(childs, node.children, rootReactNode);
    return hasValidReactChildren(childs) && mappedChildren.length === 0 || child.props?.i18nIsDynamicList ? childs : mappedChildren;
  };
  const pushTranslatedJSX = (child, inner, mem, i2, isVoid) => {
    if (child.dummy) {
      child.children = inner;
      mem.push(cloneElement(child, {
        key: i2
      }, isVoid ? void 0 : inner));
    } else {
      mem.push(...Children.map([child], (c2) => {
        if (c2.type === Fragment || c2.props?.i18nIsDynamicList !== void 0) {
          const freshProps = {
            key: i2
          };
          if (c2 && c2.props) {
            Object.keys(c2.props).forEach((k) => {
              if (k === "children" || k === "i18nIsDynamicList") return;
              freshProps[k] = c2.props[k];
            });
          }
          return createElement(c2.type, freshProps, isVoid ? null : inner);
        }
        const override = {
          key: i2
        };
        if (c2 && c2.props) {
          Object.keys(c2.props).forEach((k) => {
            if (k === "ref" || k === "children") return;
            override[k] = c2.props[k];
          });
        }
        return cloneElement(c2, override, isVoid ? null : inner);
      }));
    }
  };
  const mapAST = (reactNode, astNode, rootReactNode) => {
    const reactNodes = getAsArray(reactNode);
    const astNodes = getAsArray(astNode);
    return astNodes.reduce((mem, node, i2) => {
      const translationContent = node.children?.[0]?.content && i18n.services.interpolator.interpolate(node.children[0].content, opts, i18n.language);
      if (node.type === "tag") {
        let tmp = reactNodes[parseInt(node.name, 10)];
        if (!tmp && knownComponentsMap) tmp = knownComponentsMap[node.name];
        if (rootReactNode.length === 1 && !tmp) tmp = rootReactNode[0][node.name];
        if (!tmp) tmp = {};
        const props = {
          ...node.attrs
        };
        if (shouldUnescape) {
          Object.keys(props).forEach((p) => {
            const val = props[p];
            if (isString(val)) {
              props[p] = unescape(val);
            }
          });
        }
        const child = Object.keys(props).length !== 0 ? mergeProps({
          props
        }, tmp) : tmp;
        const isElement = isValidElement(child);
        const isValidTranslationWithChildren = isElement && hasChildren(node, true) && !node.voidElement;
        const isEmptyTransWithHTML = emptyChildrenButNeedsHandling && isObject(child) && child.dummy && !isElement;
        const isKnownComponent = isObject(knownComponentsMap) && Object.hasOwnProperty.call(knownComponentsMap, node.name);
        if (isString(child)) {
          const value = i18n.services.interpolator.interpolate(child, opts, i18n.language);
          mem.push(value);
        } else if (hasChildren(child) || isValidTranslationWithChildren) {
          const inner = renderInner(child, node, rootReactNode);
          pushTranslatedJSX(child, inner, mem, i2);
        } else if (isEmptyTransWithHTML) {
          const inner = mapAST(reactNodes, node.children, rootReactNode);
          pushTranslatedJSX(child, inner, mem, i2);
        } else if (Number.isNaN(parseFloat(node.name))) {
          if (isKnownComponent) {
            const inner = renderInner(child, node, rootReactNode);
            pushTranslatedJSX(child, inner, mem, i2, node.voidElement);
          } else if (i18nOptions.transSupportBasicHtmlNodes && keepArray.indexOf(node.name) > -1) {
            if (node.voidElement) {
              mem.push(createElement(node.name, {
                key: `${node.name}-${i2}`
              }));
            } else {
              const inner = mapAST(reactNodes, node.children, rootReactNode);
              mem.push(createElement(node.name, {
                key: `${node.name}-${i2}`
              }, inner));
            }
          } else if (node.voidElement) {
            mem.push(`<${node.name} />`);
          } else {
            const inner = mapAST(reactNodes, node.children, rootReactNode);
            mem.push(`<${node.name}>${inner}</${node.name}>`);
          }
        } else if (isObject(child) && !isElement) {
          const content = node.children[0] ? translationContent : null;
          if (content) mem.push(content);
        } else {
          pushTranslatedJSX(child, translationContent, mem, i2, node.children.length !== 1 || !translationContent);
        }
      } else if (node.type === "text") {
        const wrapTextNodes = i18nOptions.transWrapTextNodes;
        const unescapeFn = typeof i18nOptions.unescape === "function" ? i18nOptions.unescape : getDefaults().unescape;
        const content = shouldUnescape ? unescapeFn(i18n.services.interpolator.interpolate(node.content, opts, i18n.language)) : i18n.services.interpolator.interpolate(node.content, opts, i18n.language);
        if (wrapTextNodes) {
          mem.push(createElement(wrapTextNodes, {
            key: `${node.name}-${i2}`
          }, content));
        } else {
          mem.push(content);
        }
      }
      return mem;
    }, []);
  };
  const result = mapAST([{
    dummy: true,
    children: children || []
  }], ast, getAsArray(children || []));
  return getChildren(result[0]);
};
var fixComponentProps = (component, index, translation) => {
  const componentKey = component.key || index;
  const comp = cloneElement(component, {
    key: componentKey
  });
  if (!comp.props || !comp.props.children || translation.indexOf(`${index}/>`) < 0 && translation.indexOf(`${index} />`) < 0) {
    return comp;
  }
  function Componentized() {
    return createElement(Fragment, null, comp);
  }
  return createElement(Componentized, {
    key: componentKey
  });
};
var generateArrayComponents = (components, translation) => components.map((c2, index) => fixComponentProps(c2, index, translation));
var generateObjectComponents = (components, translation) => {
  const componentMap = {};
  Object.keys(components).forEach((c2) => {
    Object.assign(componentMap, {
      [c2]: fixComponentProps(components[c2], c2, translation)
    });
  });
  return componentMap;
};
var generateComponents = (components, translation, i18n, i18nKey) => {
  if (!components) return null;
  if (Array.isArray(components)) {
    return generateArrayComponents(components, translation);
  }
  if (isObject(components)) {
    return generateObjectComponents(components, translation);
  }
  warnOnce(i18n, "TRANS_INVALID_COMPONENTS", `<Trans /> "components" prop expects an object or array`, {
    i18nKey
  });
  return null;
};
var isComponentsMap = (object) => {
  if (!isObject(object)) return false;
  if (Array.isArray(object)) return false;
  return Object.keys(object).reduce((acc, key) => acc && Number.isNaN(Number.parseFloat(key)), true);
};
function Trans({
  children,
  count,
  parent,
  i18nKey,
  context,
  tOptions = {},
  values,
  defaults,
  components,
  ns,
  i18n: i18nFromProps,
  t: tFromProps,
  shouldUnescape,
  ...additionalProps
}) {
  const i18n = i18nFromProps || getI18n();
  if (!i18n) {
    warnOnce(i18n, "NO_I18NEXT_INSTANCE", `Trans: You need to pass in an i18next instance using i18nextReactModule`, {
      i18nKey
    });
    return children;
  }
  const t2 = tFromProps || i18n.t.bind(i18n) || ((k) => k);
  const reactI18nextOptions = {
    ...getDefaults(),
    ...i18n.options?.react
  };
  let namespaces = ns || t2.ns || i18n.options?.defaultNS;
  namespaces = isString(namespaces) ? [namespaces] : namespaces || ["translation"];
  const {
    transDefaultProps
  } = reactI18nextOptions;
  const mergedTOptions = transDefaultProps?.tOptions ? {
    ...transDefaultProps.tOptions,
    ...tOptions
  } : tOptions;
  const mergedShouldUnescape = shouldUnescape ?? transDefaultProps?.shouldUnescape;
  const mergedValues = transDefaultProps?.values ? {
    ...transDefaultProps.values,
    ...values
  } : values;
  const mergedComponents = transDefaultProps?.components ? {
    ...transDefaultProps.components,
    ...components
  } : components;
  const nodeAsString = nodesToString(children, reactI18nextOptions, i18n, i18nKey);
  const defaultValue = defaults || mergedTOptions?.defaultValue || nodeAsString || reactI18nextOptions.transEmptyNodeValue || (typeof i18nKey === "function" ? keyFromSelector(i18nKey) : i18nKey);
  const {
    hashTransKey
  } = reactI18nextOptions;
  const key = i18nKey || (hashTransKey ? hashTransKey(nodeAsString || defaultValue) : nodeAsString || defaultValue);
  if (i18n.options?.interpolation?.defaultVariables) {
    values = mergedValues && Object.keys(mergedValues).length > 0 ? {
      ...mergedValues,
      ...i18n.options.interpolation.defaultVariables
    } : {
      ...i18n.options.interpolation.defaultVariables
    };
  } else {
    values = mergedValues;
  }
  const valuesFromChildren = getValuesFromChildren(children);
  if (valuesFromChildren && typeof valuesFromChildren.count === "number" && count === void 0) {
    count = valuesFromChildren.count;
  }
  const interpolationOverride = values || count !== void 0 && !i18n.options?.interpolation?.alwaysFormat || !children ? mergedTOptions.interpolation : {
    interpolation: {
      ...mergedTOptions.interpolation,
      prefix: "#$?",
      suffix: "?$#"
    }
  };
  const combinedTOpts = {
    ...mergedTOptions,
    context: context || mergedTOptions.context,
    count,
    ...values,
    ...interpolationOverride,
    defaultValue,
    ns: namespaces
  };
  let translation = key ? t2(key, combinedTOpts) : defaultValue;
  if (translation === key && defaultValue) translation = defaultValue;
  const generatedComponents = generateComponents(mergedComponents, translation, i18n, i18nKey);
  let indexedChildren = generatedComponents || children;
  let componentsMap = null;
  if (isComponentsMap(generatedComponents)) {
    componentsMap = generatedComponents;
    indexedChildren = children;
  }
  const content = renderNodes(indexedChildren, componentsMap, translation, i18n, reactI18nextOptions, combinedTOpts, mergedShouldUnescape);
  const useAsParent = parent ?? reactI18nextOptions.defaultTransParent;
  return useAsParent ? createElement(useAsParent, additionalProps, content) : content;
}

// node_modules/react-i18next/dist/es/context.js
import { createContext } from "react";

// node_modules/react-i18next/dist/es/initReactI18next.js
var initReactI18next = {
  type: "3rdParty",
  init(instance) {
    setDefaults(instance.options.react);
    setI18n(instance);
  }
};

// node_modules/react-i18next/dist/es/context.js
var I18nContext = createContext();
var ReportNamespaces = class {
  constructor() {
    this.usedNamespaces = {};
  }
  addUsedNamespaces(namespaces) {
    namespaces.forEach((ns) => {
      if (!this.usedNamespaces[ns]) this.usedNamespaces[ns] = true;
    });
  }
  getUsedNamespaces() {
    return Object.keys(this.usedNamespaces);
  }
};
var composeInitialProps = (ForComponent) => async (ctx) => {
  const componentsInitialProps = await ForComponent.getInitialProps?.(ctx) ?? {};
  const i18nInitialProps = getInitialProps();
  return {
    ...componentsInitialProps,
    ...i18nInitialProps
  };
};
var getInitialProps = () => {
  const i18n = getI18n();
  if (!i18n) {
    console.warn("react-i18next:: getInitialProps: You will need to pass in an i18next instance by using initReactI18next");
    return {};
  }
  const namespaces = i18n.reportNamespaces?.getUsedNamespaces() ?? [];
  const ret = {};
  const initialI18nStore = {};
  i18n.languages.forEach((l) => {
    initialI18nStore[l] = {};
    namespaces.forEach((ns) => {
      initialI18nStore[l][ns] = i18n.getResourceBundle(l, ns) || {};
    });
  });
  ret.initialI18nStore = initialI18nStore;
  ret.initialLanguage = i18n.language;
  return ret;
};

// node_modules/react-i18next/dist/es/Trans.js
function Trans2({
  children,
  count,
  parent,
  i18nKey,
  context,
  tOptions = {},
  values,
  defaults,
  components,
  ns,
  i18n: i18nFromProps,
  t: tFromProps,
  shouldUnescape,
  ...additionalProps
}) {
  const {
    i18n: i18nFromContext,
    defaultNS: defaultNSFromContext
  } = useContext(I18nContext) || {};
  const i18n = i18nFromProps || i18nFromContext || getI18n();
  const t2 = tFromProps || i18n?.t.bind(i18n);
  return Trans({
    children,
    count,
    parent,
    i18nKey,
    context,
    tOptions,
    values,
    defaults,
    components,
    ns: ns || t2?.ns || defaultNSFromContext || i18n?.options?.defaultNS,
    i18n,
    t: tFromProps,
    shouldUnescape,
    ...additionalProps
  });
}

// node_modules/react-i18next/dist/es/IcuTrans.js
import { useContext as useContext2 } from "react";

// node_modules/react-i18next/dist/es/IcuTransWithoutContext.js
import React2 from "react";

// node_modules/react-i18next/dist/es/IcuTransUtils/TranslationParserError.js
var TranslationParserError = class _TranslationParserError extends Error {
  constructor(message, position, translationString) {
    super(message);
    this.name = "TranslationParserError";
    this.position = position;
    this.translationString = translationString;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, _TranslationParserError);
    }
  }
};

// node_modules/react-i18next/dist/es/IcuTransUtils/htmlEntityDecoder.js
var commonEntities = {
  "&nbsp;": "\xA0",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&copy;": "\xA9",
  "&reg;": "\xAE",
  "&trade;": "\u2122",
  "&hellip;": "\u2026",
  "&ndash;": "\u2013",
  "&mdash;": "\u2014",
  "&lsquo;": "\u2018",
  "&rsquo;": "\u2019",
  "&sbquo;": "\u201A",
  "&ldquo;": "\u201C",
  "&rdquo;": "\u201D",
  "&bdquo;": "\u201E",
  "&dagger;": "\u2020",
  "&Dagger;": "\u2021",
  "&bull;": "\u2022",
  "&prime;": "\u2032",
  "&Prime;": "\u2033",
  "&lsaquo;": "\u2039",
  "&rsaquo;": "\u203A",
  "&sect;": "\xA7",
  "&para;": "\xB6",
  "&middot;": "\xB7",
  "&ensp;": "\u2002",
  "&emsp;": "\u2003",
  "&thinsp;": "\u2009",
  "&euro;": "\u20AC",
  "&pound;": "\xA3",
  "&yen;": "\xA5",
  "&cent;": "\xA2",
  "&curren;": "\xA4",
  "&times;": "\xD7",
  "&divide;": "\xF7",
  "&minus;": "\u2212",
  "&plusmn;": "\xB1",
  "&ne;": "\u2260",
  "&le;": "\u2264",
  "&ge;": "\u2265",
  "&asymp;": "\u2248",
  "&equiv;": "\u2261",
  "&infin;": "\u221E",
  "&int;": "\u222B",
  "&sum;": "\u2211",
  "&prod;": "\u220F",
  "&radic;": "\u221A",
  "&part;": "\u2202",
  "&permil;": "\u2030",
  "&deg;": "\xB0",
  "&micro;": "\xB5",
  "&larr;": "\u2190",
  "&uarr;": "\u2191",
  "&rarr;": "\u2192",
  "&darr;": "\u2193",
  "&harr;": "\u2194",
  "&crarr;": "\u21B5",
  "&lArr;": "\u21D0",
  "&uArr;": "\u21D1",
  "&rArr;": "\u21D2",
  "&dArr;": "\u21D3",
  "&hArr;": "\u21D4",
  "&alpha;": "\u03B1",
  "&beta;": "\u03B2",
  "&gamma;": "\u03B3",
  "&delta;": "\u03B4",
  "&epsilon;": "\u03B5",
  "&zeta;": "\u03B6",
  "&eta;": "\u03B7",
  "&theta;": "\u03B8",
  "&iota;": "\u03B9",
  "&kappa;": "\u03BA",
  "&lambda;": "\u03BB",
  "&mu;": "\u03BC",
  "&nu;": "\u03BD",
  "&xi;": "\u03BE",
  "&omicron;": "\u03BF",
  "&pi;": "\u03C0",
  "&rho;": "\u03C1",
  "&sigma;": "\u03C3",
  "&tau;": "\u03C4",
  "&upsilon;": "\u03C5",
  "&phi;": "\u03C6",
  "&chi;": "\u03C7",
  "&psi;": "\u03C8",
  "&omega;": "\u03C9",
  "&Alpha;": "\u0391",
  "&Beta;": "\u0392",
  "&Gamma;": "\u0393",
  "&Delta;": "\u0394",
  "&Epsilon;": "\u0395",
  "&Zeta;": "\u0396",
  "&Eta;": "\u0397",
  "&Theta;": "\u0398",
  "&Iota;": "\u0399",
  "&Kappa;": "\u039A",
  "&Lambda;": "\u039B",
  "&Mu;": "\u039C",
  "&Nu;": "\u039D",
  "&Xi;": "\u039E",
  "&Omicron;": "\u039F",
  "&Pi;": "\u03A0",
  "&Rho;": "\u03A1",
  "&Sigma;": "\u03A3",
  "&Tau;": "\u03A4",
  "&Upsilon;": "\u03A5",
  "&Phi;": "\u03A6",
  "&Chi;": "\u03A7",
  "&Psi;": "\u03A8",
  "&Omega;": "\u03A9",
  "&Agrave;": "\xC0",
  "&Aacute;": "\xC1",
  "&Acirc;": "\xC2",
  "&Atilde;": "\xC3",
  "&Auml;": "\xC4",
  "&Aring;": "\xC5",
  "&AElig;": "\xC6",
  "&Ccedil;": "\xC7",
  "&Egrave;": "\xC8",
  "&Eacute;": "\xC9",
  "&Ecirc;": "\xCA",
  "&Euml;": "\xCB",
  "&Igrave;": "\xCC",
  "&Iacute;": "\xCD",
  "&Icirc;": "\xCE",
  "&Iuml;": "\xCF",
  "&ETH;": "\xD0",
  "&Ntilde;": "\xD1",
  "&Ograve;": "\xD2",
  "&Oacute;": "\xD3",
  "&Ocirc;": "\xD4",
  "&Otilde;": "\xD5",
  "&Ouml;": "\xD6",
  "&Oslash;": "\xD8",
  "&Ugrave;": "\xD9",
  "&Uacute;": "\xDA",
  "&Ucirc;": "\xDB",
  "&Uuml;": "\xDC",
  "&Yacute;": "\xDD",
  "&THORN;": "\xDE",
  "&szlig;": "\xDF",
  "&agrave;": "\xE0",
  "&aacute;": "\xE1",
  "&acirc;": "\xE2",
  "&atilde;": "\xE3",
  "&auml;": "\xE4",
  "&aring;": "\xE5",
  "&aelig;": "\xE6",
  "&ccedil;": "\xE7",
  "&egrave;": "\xE8",
  "&eacute;": "\xE9",
  "&ecirc;": "\xEA",
  "&euml;": "\xEB",
  "&igrave;": "\xEC",
  "&iacute;": "\xED",
  "&icirc;": "\xEE",
  "&iuml;": "\xEF",
  "&eth;": "\xF0",
  "&ntilde;": "\xF1",
  "&ograve;": "\xF2",
  "&oacute;": "\xF3",
  "&ocirc;": "\xF4",
  "&otilde;": "\xF5",
  "&ouml;": "\xF6",
  "&oslash;": "\xF8",
  "&ugrave;": "\xF9",
  "&uacute;": "\xFA",
  "&ucirc;": "\xFB",
  "&uuml;": "\xFC",
  "&yacute;": "\xFD",
  "&thorn;": "\xFE",
  "&yuml;": "\xFF",
  "&iexcl;": "\xA1",
  "&iquest;": "\xBF",
  "&fnof;": "\u0192",
  "&circ;": "\u02C6",
  "&tilde;": "\u02DC",
  "&OElig;": "\u0152",
  "&oelig;": "\u0153",
  "&Scaron;": "\u0160",
  "&scaron;": "\u0161",
  "&Yuml;": "\u0178",
  "&ordf;": "\xAA",
  "&ordm;": "\xBA",
  "&macr;": "\xAF",
  "&acute;": "\xB4",
  "&cedil;": "\xB8",
  "&sup1;": "\xB9",
  "&sup2;": "\xB2",
  "&sup3;": "\xB3",
  "&frac14;": "\xBC",
  "&frac12;": "\xBD",
  "&frac34;": "\xBE",
  "&spades;": "\u2660",
  "&clubs;": "\u2663",
  "&hearts;": "\u2665",
  "&diams;": "\u2666",
  "&loz;": "\u25CA",
  "&oline;": "\u203E",
  "&frasl;": "\u2044",
  "&weierp;": "\u2118",
  "&image;": "\u2111",
  "&real;": "\u211C",
  "&alefsym;": "\u2135"
};
var entityPattern = new RegExp(Object.keys(commonEntities).map((entity) => entity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");
var decodeHtmlEntities = (text) => text.replace(entityPattern, (match) => commonEntities[match]).replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10))).replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

// node_modules/react-i18next/dist/es/IcuTransUtils/tokenizer.js
var tokenize = (translation) => {
  const tokens = [];
  let position = 0;
  let currentText = "";
  const flushText = () => {
    if (currentText) {
      tokens.push({
        type: "Text",
        value: currentText,
        position: position - currentText.length
      });
      currentText = "";
    }
  };
  while (position < translation.length) {
    const char = translation[position];
    if (char === "<") {
      const tagMatch = translation.slice(position).match(/^<(\d+)>/);
      if (tagMatch) {
        flushText();
        tokens.push({
          type: "TagOpen",
          value: tagMatch[0],
          position,
          tagNumber: parseInt(tagMatch[1], 10)
        });
        position += tagMatch[0].length;
      } else {
        const closeTagMatch = translation.slice(position).match(/^<\/(\d+)>/);
        if (closeTagMatch) {
          flushText();
          tokens.push({
            type: "TagClose",
            value: closeTagMatch[0],
            position,
            tagNumber: parseInt(closeTagMatch[1], 10)
          });
          position += closeTagMatch[0].length;
        } else {
          currentText += char;
          position += 1;
        }
      }
    } else {
      currentText += char;
      position += 1;
    }
  }
  flushText();
  return tokens;
};

// node_modules/react-i18next/dist/es/IcuTransUtils/renderTranslation.js
import React from "react";
var renderDeclarationNode = (declaration, children, childDeclarations) => {
  const {
    type,
    props = {}
  } = declaration;
  if (props.children && Array.isArray(props.children) && childDeclarations) {
    const {
      children: _childrenToRemove,
      ...propsWithoutChildren
    } = props;
    return React.createElement(type, propsWithoutChildren, ...children);
  }
  if (children.length === 0) {
    return React.createElement(type, props);
  }
  if (children.length === 1) {
    return React.createElement(type, props, children[0]);
  }
  return React.createElement(type, props, ...children);
};
var renderTranslation = (translation, declarations = []) => {
  if (!translation) {
    return [];
  }
  const tokens = tokenize(translation);
  const result = [];
  const stack = [];
  const literalTagNumbers = /* @__PURE__ */ new Set();
  const getCurrentDeclarations = () => {
    if (stack.length === 0) {
      return declarations;
    }
    const parentFrame = stack[stack.length - 1];
    if (parentFrame.declaration.props?.children && Array.isArray(parentFrame.declaration.props.children)) {
      return parentFrame.declaration.props.children;
    }
    return parentFrame.declarations;
  };
  tokens.forEach((token) => {
    switch (token.type) {
      case "Text":
        {
          const decoded = decodeHtmlEntities(token.value);
          const targetArray = stack.length > 0 ? stack[stack.length - 1].children : result;
          targetArray.push(decoded);
        }
        break;
      case "TagOpen":
        {
          const {
            tagNumber
          } = token;
          const currentDeclarations = getCurrentDeclarations();
          const declaration = currentDeclarations[tagNumber];
          if (!declaration) {
            literalTagNumbers.add(tagNumber);
            const literalText = `<${tagNumber}>`;
            const targetArray = stack.length > 0 ? stack[stack.length - 1].children : result;
            targetArray.push(literalText);
            break;
          }
          stack.push({
            tagNumber,
            children: [],
            position: token.position,
            declaration,
            declarations: currentDeclarations
          });
        }
        break;
      case "TagClose":
        {
          const {
            tagNumber
          } = token;
          if (literalTagNumbers.has(tagNumber)) {
            const literalText = `</${tagNumber}>`;
            const literalTargetArray = stack.length > 0 ? stack[stack.length - 1].children : result;
            literalTargetArray.push(literalText);
            literalTagNumbers.delete(tagNumber);
            break;
          }
          if (stack.length === 0) {
            throw new TranslationParserError(`Unexpected closing tag </${tagNumber}> at position ${token.position}`, token.position, translation);
          }
          const frame = stack.pop();
          if (frame.tagNumber !== tagNumber) {
            throw new TranslationParserError(`Mismatched tags: expected </${frame.tagNumber}> but got </${tagNumber}> at position ${token.position}`, token.position, translation);
          }
          const element = renderDeclarationNode(frame.declaration, frame.children, frame.declarations);
          const elementTargetArray = stack.length > 0 ? stack[stack.length - 1].children : result;
          elementTargetArray.push(element);
        }
        break;
    }
  });
  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
    throw new TranslationParserError(`Unclosed tag <${unclosed.tagNumber}> at position ${unclosed.position}`, unclosed.position, translation);
  }
  return result;
};

// node_modules/react-i18next/dist/es/IcuTransWithoutContext.js
function IcuTransWithoutContext({
  i18nKey,
  defaultTranslation,
  content,
  ns,
  values = {},
  i18n: i18nFromProps,
  t: tFromProps
}) {
  const i18n = i18nFromProps || getI18n();
  if (!i18n) {
    warnOnce(i18n, "NO_I18NEXT_INSTANCE", `IcuTrans: You need to pass in an i18next instance using i18nextReactModule`, {
      i18nKey
    });
    return React2.createElement(React2.Fragment, {}, defaultTranslation);
  }
  const t2 = tFromProps || i18n.t?.bind(i18n) || ((k) => k);
  let namespaces = ns || t2.ns || i18n.options?.defaultNS;
  namespaces = isString(namespaces) ? [namespaces] : namespaces || ["translation"];
  let mergedValues = values;
  if (i18n.options?.interpolation?.defaultVariables) {
    mergedValues = values && Object.keys(values).length > 0 ? {
      ...values,
      ...i18n.options.interpolation.defaultVariables
    } : {
      ...i18n.options.interpolation.defaultVariables
    };
  }
  const translation = t2(i18nKey, {
    defaultValue: defaultTranslation,
    ...mergedValues,
    ns: namespaces
  });
  try {
    const rendered = renderTranslation(translation, content);
    return React2.createElement(React2.Fragment, {}, ...rendered);
  } catch (error) {
    warn(i18n, "ICU_TRANS_RENDER_ERROR", `IcuTrans component error for key "${i18nKey}": ${error.message}`, {
      i18nKey,
      error
    });
    return React2.createElement(React2.Fragment, {}, translation);
  }
}
IcuTransWithoutContext.displayName = "IcuTransWithoutContext";

// node_modules/react-i18next/dist/es/IcuTrans.js
function IcuTrans({
  i18nKey,
  defaultTranslation,
  content,
  ns,
  values = {},
  i18n: i18nFromProps,
  t: tFromProps
}) {
  const {
    i18n: i18nFromContext,
    defaultNS: defaultNSFromContext
  } = useContext2(I18nContext) || {};
  const i18n = i18nFromProps || i18nFromContext || getI18n();
  const t2 = tFromProps || i18n?.t.bind(i18n);
  return IcuTransWithoutContext({
    i18nKey,
    defaultTranslation,
    content,
    ns: ns || t2?.ns || defaultNSFromContext || i18n?.options?.defaultNS,
    values,
    i18n,
    t: tFromProps
  });
}
IcuTrans.displayName = "IcuTrans";

// node_modules/react-i18next/dist/es/useTranslation.js
var import_shim = __toESM(require_shim(), 1);
import { useContext as useContext3, useCallback, useMemo, useEffect, useRef, useState } from "react";
var notReadyT = (k, optsOrDefaultValue) => {
  if (isString(optsOrDefaultValue)) return optsOrDefaultValue;
  if (isObject(optsOrDefaultValue) && isString(optsOrDefaultValue.defaultValue)) return optsOrDefaultValue.defaultValue;
  if (typeof k === "function") return "";
  if (Array.isArray(k)) {
    const last = k[k.length - 1];
    return typeof last === "function" ? "" : last;
  }
  return k;
};
var notReadySnapshot = {
  t: notReadyT,
  ready: false
};
var dummySubscribe = () => () => {
};
var useTranslation = (ns, props = {}) => {
  const {
    i18n: i18nFromProps
  } = props;
  const {
    i18n: i18nFromContext,
    defaultNS: defaultNSFromContext
  } = useContext3(I18nContext) || {};
  const i18n = i18nFromProps || i18nFromContext || getI18n();
  if (i18n && !i18n.reportNamespaces) i18n.reportNamespaces = new ReportNamespaces();
  if (!i18n) {
    warnOnce(i18n, "NO_I18NEXT_INSTANCE", "useTranslation: You will need to pass in an i18next instance by using initReactI18next");
  }
  const i18nOptions = useMemo(() => ({
    ...getDefaults(),
    ...i18n?.options?.react,
    ...props
  }), [i18n, props]);
  const {
    useSuspense,
    keyPrefix
  } = i18nOptions;
  const nsOrContext = ns || defaultNSFromContext || i18n?.options?.defaultNS;
  const unstableNamespaces = isString(nsOrContext) ? [nsOrContext] : nsOrContext || ["translation"];
  const namespaces = useMemo(() => unstableNamespaces, unstableNamespaces);
  i18n?.reportNamespaces?.addUsedNamespaces?.(namespaces);
  const revisionRef = useRef(0);
  const subscribe = useCallback((callback) => {
    if (!i18n) return dummySubscribe;
    const {
      bindI18n,
      bindI18nStore
    } = i18nOptions;
    const wrappedCallback = () => {
      revisionRef.current += 1;
      callback();
    };
    if (bindI18n) i18n.on(bindI18n, wrappedCallback);
    if (bindI18nStore) i18n.store.on(bindI18nStore, wrappedCallback);
    return () => {
      if (bindI18n) bindI18n.split(" ").forEach((e2) => i18n.off(e2, wrappedCallback));
      if (bindI18nStore) bindI18nStore.split(" ").forEach((e2) => i18n.store.off(e2, wrappedCallback));
    };
  }, [i18n, i18nOptions]);
  const snapshotRef = useRef();
  const getSnapshot = useCallback(() => {
    if (!i18n) {
      return notReadySnapshot;
    }
    const calculatedReady = !!(i18n.isInitialized || i18n.initializedStoreOnce) && namespaces.every((n2) => hasLoadedNamespace(n2, i18n, i18nOptions));
    const currentLng = props.lng || i18n.language;
    const currentRevision = revisionRef.current;
    const lastSnapshot = snapshotRef.current;
    if (lastSnapshot && lastSnapshot.ready === calculatedReady && lastSnapshot.lng === currentLng && lastSnapshot.keyPrefix === keyPrefix && lastSnapshot.revision === currentRevision) {
      return lastSnapshot;
    }
    const calculatedT = i18n.getFixedT(currentLng, i18nOptions.nsMode === "fallback" ? namespaces : namespaces[0], keyPrefix);
    const newSnapshot = {
      t: calculatedT,
      ready: calculatedReady,
      lng: currentLng,
      keyPrefix,
      revision: currentRevision
    };
    snapshotRef.current = newSnapshot;
    return newSnapshot;
  }, [i18n, namespaces, keyPrefix, i18nOptions, props.lng]);
  const [loadCount, setLoadCount] = useState(0);
  const {
    t: t2,
    ready
  } = (0, import_shim.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
  useEffect(() => {
    if (i18n && !ready && !useSuspense) {
      const onLoaded = () => setLoadCount((c2) => c2 + 1);
      if (props.lng) {
        loadLanguages(i18n, props.lng, namespaces, onLoaded);
      } else {
        loadNamespaces(i18n, namespaces, onLoaded);
      }
    }
  }, [i18n, props.lng, namespaces, ready, useSuspense, loadCount]);
  const finalI18n = i18n || {};
  const wrapperRef = useRef(null);
  const wrapperLangRef = useRef();
  const createI18nWrapper = (original) => {
    const descriptors = Object.getOwnPropertyDescriptors(original);
    if (descriptors.__original) delete descriptors.__original;
    const wrapper = Object.create(Object.getPrototypeOf(original), descriptors);
    if (!Object.prototype.hasOwnProperty.call(wrapper, "__original")) {
      try {
        Object.defineProperty(wrapper, "__original", {
          value: original,
          writable: false,
          enumerable: false,
          configurable: false
        });
      } catch (_) {
      }
    }
    return wrapper;
  };
  const ret = useMemo(() => {
    const original = finalI18n;
    const lang = original?.language;
    let i18nWrapper = original;
    if (original) {
      if (wrapperRef.current && wrapperRef.current.__original === original) {
        if (wrapperLangRef.current !== lang) {
          i18nWrapper = createI18nWrapper(original);
          wrapperRef.current = i18nWrapper;
          wrapperLangRef.current = lang;
        } else {
          i18nWrapper = wrapperRef.current;
        }
      } else {
        i18nWrapper = createI18nWrapper(original);
        wrapperRef.current = i18nWrapper;
        wrapperLangRef.current = lang;
      }
    }
    const effectiveT = !ready && !useSuspense ? (...args) => {
      warnOnce(i18n, "USE_T_BEFORE_READY", "useTranslation: t was called before ready. When using useSuspense: false, make sure to check the ready flag before using t.");
      return t2(...args);
    } : t2;
    const arr = [effectiveT, i18nWrapper, ready];
    arr.t = effectiveT;
    arr.i18n = i18nWrapper;
    arr.ready = ready;
    return arr;
  }, [t2, finalI18n, ready, finalI18n.resolvedLanguage, finalI18n.language, finalI18n.languages]);
  if (i18n && useSuspense && !ready) {
    throw new Promise((resolve) => {
      const onLoaded = () => resolve();
      if (props.lng) {
        loadLanguages(i18n, props.lng, namespaces, onLoaded);
      } else {
        loadNamespaces(i18n, namespaces, onLoaded);
      }
    });
  }
  return ret;
};

// node_modules/react-i18next/dist/es/withTranslation.js
import { createElement as createElement2, forwardRef as forwardRefReact } from "react";
var withTranslation = (ns, options = {}) => function Extend(WrappedComponent) {
  function I18nextWithTranslation({
    forwardedRef,
    ...rest
  }) {
    const [t2, i18n, ready] = useTranslation(ns, {
      ...rest,
      keyPrefix: options.keyPrefix
    });
    const passDownProps = {
      ...rest,
      t: t2,
      i18n,
      tReady: ready
    };
    if (options.withRef && forwardedRef) {
      passDownProps.ref = forwardedRef;
    } else if (!options.withRef && forwardedRef) {
      passDownProps.forwardedRef = forwardedRef;
    }
    return createElement2(WrappedComponent, passDownProps);
  }
  I18nextWithTranslation.displayName = `withI18nextTranslation(${getDisplayName(WrappedComponent)})`;
  I18nextWithTranslation.WrappedComponent = WrappedComponent;
  const forwardRef = (props, ref) => createElement2(I18nextWithTranslation, Object.assign({}, props, {
    forwardedRef: ref
  }));
  return options.withRef ? forwardRefReact(forwardRef) : I18nextWithTranslation;
};

// node_modules/react-i18next/dist/es/Translation.js
var Translation = ({
  ns,
  children,
  ...options
}) => {
  const [t2, i18n, ready] = useTranslation(ns, options);
  return children(t2, {
    i18n,
    lng: i18n?.language
  }, ready);
};

// node_modules/react-i18next/dist/es/I18nextProvider.js
import { createElement as createElement3, useMemo as useMemo2 } from "react";
function I18nextProvider({
  i18n,
  defaultNS,
  children
}) {
  const value = useMemo2(() => ({
    i18n,
    defaultNS
  }), [i18n, defaultNS]);
  return createElement3(I18nContext.Provider, {
    value
  }, children);
}

// node_modules/react-i18next/dist/es/withSSR.js
import { createElement as createElement4 } from "react";

// node_modules/react-i18next/dist/es/useSSR.js
import { useContext as useContext4 } from "react";
var useSSR = (initialI18nStore, initialLanguage, props = {}) => {
  const {
    i18n: i18nFromProps
  } = props;
  const {
    i18n: i18nFromContext
  } = useContext4(I18nContext) || {};
  const i18n = i18nFromProps || i18nFromContext || getI18n();
  if (!i18n) {
    warnOnce(i18n, "NO_I18NEXT_INSTANCE", "useSSR: You will need to pass in an i18next instance by using initReactI18next or by passing it via props or context. In monorepo setups, make sure there is only one instance of react-i18next.");
    return;
  }
  if (i18n.options?.isClone) return;
  if (initialI18nStore && !i18n.initializedStoreOnce) {
    if (!i18n.services?.resourceStore) {
      warnOnce(i18n, "I18N_NOT_INITIALIZED", "useSSR: i18n instance was found but not initialized (services.resourceStore is missing). Make sure you call i18next.init() before using useSSR \u2014 e.g. at module level, not only in getStaticProps/getServerSideProps.");
      return;
    }
    i18n.services.resourceStore.data = initialI18nStore;
    i18n.options.ns = Object.values(initialI18nStore).reduce((mem, lngResources) => {
      Object.keys(lngResources).forEach((ns) => {
        if (mem.indexOf(ns) < 0) mem.push(ns);
      });
      return mem;
    }, i18n.options.ns);
    i18n.initializedStoreOnce = true;
    i18n.isInitialized = true;
  }
  if (initialLanguage && !i18n.initializedLanguageOnce) {
    i18n.changeLanguage(initialLanguage);
    i18n.initializedLanguageOnce = true;
  }
};

// node_modules/react-i18next/dist/es/withSSR.js
var withSSR = () => function Extend(WrappedComponent) {
  function I18nextWithSSR({
    initialI18nStore,
    initialLanguage,
    ...rest
  }) {
    useSSR(initialI18nStore, initialLanguage);
    return createElement4(WrappedComponent, {
      ...rest
    });
  }
  I18nextWithSSR.getInitialProps = composeInitialProps(WrappedComponent);
  I18nextWithSSR.displayName = `withI18nextSSR(${getDisplayName(WrappedComponent)})`;
  I18nextWithSSR.WrappedComponent = WrappedComponent;
  return I18nextWithSSR;
};

// node_modules/react-i18next/dist/es/index.js
var date = () => "";
var time = () => "";
var number = () => "";
var select = () => "";
var plural = () => "";
var selectOrdinal = () => "";
export {
  I18nContext,
  I18nextProvider,
  IcuTrans,
  IcuTransWithoutContext,
  Trans2 as Trans,
  Trans as TransWithoutContext,
  Translation,
  composeInitialProps,
  date,
  getDefaults,
  getI18n,
  getInitialProps,
  initReactI18next,
  nodesToString,
  number,
  plural,
  select,
  selectOrdinal,
  setDefaults,
  setI18n,
  time,
  useSSR,
  useTranslation,
  withSSR,
  withTranslation
};
/*! Bundled license information:

use-sync-external-store/cjs/use-sync-external-store-shim.production.js:
  (**
   * @license React
   * use-sync-external-store-shim.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
