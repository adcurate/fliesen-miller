import { createContext, useContext } from "react";

export const PathContext = createContext("/");
export function usePathname() { return useContext(PathContext); }
export function normalizePath(path: string) {
  const base = import.meta.env.BASE_URL;
  const local = path.startsWith(base) ? "/" + path.slice(base.length) : path;
  return local.replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";
}
