/** Keep all internal links and local assets inside the GitHub project path. */
export function previewUrl(value: unknown): unknown {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return value;
  const base = import.meta.env.BASE_URL;
  const local = value.startsWith(base) ? "/" + value.slice(base.length) : value;
  const [, path, suffix = ""] = local.match(/^([^?#]*)(.*)$/)!;
  const isPage = path !== "/" && !path.endsWith("/") && !path.split("/").at(-1)!.includes(".");
  return base + (isPage ? path + "/" : path).slice(1) + suffix;
}

export function localProps(type: unknown, props: unknown) {
  if (typeof type !== "string" || !props || typeof props !== "object") return props;
  const result: Record<string, unknown> = { ...props };
  for (const key of ["href", "src", "poster"]) {
    if (key in result) result[key] = previewUrl(result[key]);
  }
  if (typeof result.srcSet === "string") result.srcSet = result.srcSet.split(",").map(candidate => candidate.trim().replace(/^(\S+)(.*)$/, (_, url: string, descriptor: string) => String(previewUrl(url)) + descriptor)).join(", ");
  return result;
}
