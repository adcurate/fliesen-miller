"use client";

import { useEffect } from "react";
import { scrollDestination } from "@/lib/scroll-navigation";

export function InPageNavigation() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const destination = scrollDestination(location.href, link.href, !!document.getElementById("anfrage"));
      if (destination === null) return;
      let target: HTMLElement | null = null;
      if (destination) {
        try { target = document.getElementById(decodeURIComponent(destination.slice(1))); } catch { return; }
        if (!target) return;
      }
      event.preventDefault();
      if (location.hash !== destination) history.pushState(history.state, "", location.pathname + location.search + destination);
      requestAnimationFrame(() => {
        const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
        if (target) target.scrollIntoView({ behavior, block: "start" });
        else window.scrollTo({ top: 0, behavior });
        const focus = target?.querySelector<HTMLElement>("h1,h2,h3") || (!target ? document.querySelector<HTMLElement>("main h1") : target);
        if (focus && !focus.hasAttribute("tabindex")) {
          focus.setAttribute("tabindex", "-1");
          focus.addEventListener("blur", () => focus.removeAttribute("tabindex"), { once: true });
        }
        focus?.focus({ preventScroll: true });
      });
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
  return null;
}
