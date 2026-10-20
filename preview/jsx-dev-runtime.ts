import { jsxDEV as originalJsxDEV } from "react/jsx-dev-runtime";
import { localProps } from "./urls";
export { Fragment } from "react/jsx-dev-runtime";
export type { JSX } from "react/jsx-dev-runtime";
export const jsxDEV: typeof originalJsxDEV = (type, props, key, isStatic, source, self) =>
  originalJsxDEV(type, localProps(type, props), key, isStatic, source, self);
