import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  base: "/fliesen-miller/",
  plugins: [react({ jsxImportSource: "@/preview" })],
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
});
