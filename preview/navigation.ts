export function usePathname() {
  const path = window.location.pathname;
  const base = import.meta.env.BASE_URL;
  const local = path.startsWith(base) ? "/" + path.slice(base.length) : path;
  return local.replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";
}
