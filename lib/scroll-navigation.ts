/** Preserve real, crawlable hrefs while handling local destinations without a reload. */
export function scrollDestination(currentHref: string, href: string, hasInquiry: boolean): string | null {
  const current = new URL(currentHref);
  const target = new URL(href, current);
  if (target.origin !== current.origin || !/^https?:$/.test(target.protocol)) return null;
  const path = (value: string) => value.replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";
  // An embedded inquiry form is the same destination as the standalone inquiry page.
  if (hasInquiry && /\/anfrage\/?$/.test(target.pathname) && !target.search && !target.hash) return "#anfrage";
  if (path(target.pathname) !== path(current.pathname)) return null;
  // A new query can carry meaningful form presets; let normal navigation apply those.
  if (target.search && target.search !== current.search) return null;
  return target.hash || "";
}
