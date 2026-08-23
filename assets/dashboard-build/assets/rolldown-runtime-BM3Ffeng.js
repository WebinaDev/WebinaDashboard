import * as __webin_req_ns_0 from "react";
import * as __webin_req_ns_1 from "react/jsx-runtime";
import * as __webin_req_ns_2 from "react/jsx-dev-runtime";
import * as __webin_req_ns_3 from "react-dom";
import * as __webin_req_ns_4 from "react-dom/client";
import * as __webin_req_ns_5 from "react-router-dom";
import * as __webin_req_ns_6 from "@tanstack/query-core";
import * as __webin_req_ns_7 from "@tanstack/react-query";
import * as __webin_req_ns_8 from "i18next";
import * as __webin_req_ns_9 from "react-i18next";
import * as __webin_req_ns_10 from "sonner";
const __webinRequireMap = {
  "react": __webin_req_ns_0.default ?? __webin_req_ns_0,
  "react/jsx-runtime": __webin_req_ns_1.default ?? __webin_req_ns_1,
  "react/jsx-dev-runtime": __webin_req_ns_2.default ?? __webin_req_ns_2,
  "react-dom": __webin_req_ns_3.default ?? __webin_req_ns_3,
  "react-dom/client": __webin_req_ns_4.default ?? __webin_req_ns_4,
  "react-router-dom": __webin_req_ns_5.default ?? __webin_req_ns_5,
  "@tanstack/query-core": __webin_req_ns_6.default ?? __webin_req_ns_6,
  "@tanstack/react-query": __webin_req_ns_7.default ?? __webin_req_ns_7,
  "i18next": __webin_req_ns_8.default ?? __webin_req_ns_8,
  "react-i18next": __webin_req_ns_9.default ?? __webin_req_ns_9,
  "sonner": __webin_req_ns_10.default ?? __webin_req_ns_10,
};
function __webinRequire(id) {
  if (Object.prototype.hasOwnProperty.call(__webinRequireMap, id)) {
    return __webinRequireMap[id];
  }
  throw Error("Calling `require` for \"" + id + "\" in an environment that doesn't expose the `require` function.");
}
var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(e&&(t=e(e=0)),t),s=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),c=(e,n)=>{let r={};for(var i in e)t(r,i,{get:e[i],enumerable:!0});return n||t(r,Symbol.toStringTag,{value:`Module`}),r},l=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},u=(n,r,a)=>(a=n==null?{}:e(i(n)),l(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n)),d=e=>a.call(e,`module.exports`)?e[`module.exports`]:l(t({},`__esModule`,{value:!0}),e),f=(e=>typeof require<`u`?require:typeof Proxy<`u`?new Proxy(e,{get:(e,t)=>(typeof require<`u`?require:e)[t]}):e)(function(e){if(typeof require<`u`)return require.apply(this,arguments);return __webinRequire(e)});export{d as a,f as i,o as n,u as o,c as r,s as t};