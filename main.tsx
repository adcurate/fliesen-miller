import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import { normalizePath } from "./preview/navigation";
import "./styles.css";

const root = document.getElementById("root")!;
// A generated 404 file uses the same not-found component on any unknown URL.
const path = root.dataset.renderedPath || normalizePath(window.location.pathname);
const app = <App path={path} />;
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
