import { jsx as originalJsx, jsxs as originalJsxs } from "react/jsx-runtime";
import { localProps } from "./urls";
export { Fragment } from "react/jsx-runtime";
export type { JSX } from "react/jsx-runtime";

export const jsx: typeof originalJsx = (type, props, key) => originalJsx(type, localProps(type, props), key);
export const jsxs: typeof originalJsxs = (type, props, key) => originalJsxs(type, localProps(type, props), key);
