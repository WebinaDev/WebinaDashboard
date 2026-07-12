#!/usr/bin/env python3
"""Unit-style checks for module route validation (mirrors client/src/lib/moduleRoute.ts)."""
from __future__ import annotations

import re
import sys

SAFE_MODULE_ROUTE = re.compile(r"^[a-z0-9][a-z0-9/_:-]*$")


def normalize_module_route_path(path: str) -> str:
    return path.strip().lstrip("/")


def is_safe_module_route_path(path: str) -> bool:
    normalized = normalize_module_route_path(path)
    if not normalized or ".." in normalized or "//" in normalized:
        return False
    return bool(SAFE_MODULE_ROUTE.match(normalized))


def routes_array_to_record(routes):
    if not isinstance(routes, list):
        return None
    out = {}
    for entry in routes:
        if not isinstance(entry, dict):
            continue
        path = entry.get("path")
        if isinstance(path, str):
            path = path.strip().lstrip("/")
        else:
            path = ""
        element = entry.get("element")
        if path and callable(element):
            out[path] = element
    return out if out else None


def unwrap_module_export(raw):
    if callable(raw):
        return unwrap_module_export(raw())
    if isinstance(raw, dict):
        return raw
    return {}


def normalize_module_bundle(mod):
    root = unwrap_module_export(mod.get("default", mod))
    routes_raw = root.get("routes", mod.get("routes"))
    if routes_raw and not isinstance(routes_raw, list) and isinstance(routes_raw, dict):
        routes = routes_raw
    else:
        routes = routes_array_to_record(routes_raw)
    components_raw = root.get("components", mod.get("components"))
    components = components_raw if isinstance(components_raw, dict) and not isinstance(components_raw, list) else None
    return {"routes": routes, "components": components}


def main() -> int:
    failed = 0

    def assert_ok(name: str, cond: bool) -> None:
        nonlocal failed
        if not cond:
            print(f"FAIL: {name}", file=sys.stderr)
            failed = 1
        else:
            print(f"OK: {name}")

    assert_ok("accepts wfcp path", is_safe_module_route_path("shop/wfcp-module/quick-add"))
    assert_ok("accepts param segment", is_safe_module_route_path("analytics-module/:section"))
    assert_ok("accepts settings param", is_safe_module_route_path("settings/wfcp-module/:tab"))
    assert_ok("strips leading slash", is_safe_module_route_path("/shop/wfcp-module/quick-add"))
    assert_ok("rejects traversal", not is_safe_module_route_path("../evil"))
    assert_ok("rejects double slash", not is_safe_module_route_path("shop//evil"))

    def page():
        return None

    from_array = normalize_module_bundle(
        {
            "routes": [
                {"path": "settings/shop/basalam-module", "element": page},
                {"path": "/settings/shop/basalam-module/payments", "element": page},
            ],
        }
    )
    assert_ok(
        "array routes normalize",
        from_array["routes"].get("settings/shop/basalam-module") is page
        and from_array["routes"].get("settings/shop/basalam-module/payments") is page,
    )

    from_fn = normalize_module_bundle({"default": lambda: {"routes": {"bots/bale": page}}})
    assert_ok("function export unwrap", from_fn["routes"].get("bots/bale") is page)

    return failed


if __name__ == "__main__":
    sys.exit(main())
