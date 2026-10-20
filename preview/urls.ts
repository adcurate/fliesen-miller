/** Keep all internal links and local assets inside the GitHub project path. */
export function previewUrl(value: unknown): unknown {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return value;
  const base = import.meta.env.BASE_URL;
  return value.startsWith(base) ? value : base + value.slice(1);
}

export function localProps(type: unknown, props: unknown) {
  if (typeof type !== "string" || !props || typeof props !== "object") return props;
  const result: Record<string, unknown> = { ...props };
  for (const key of ["href", "src", "poster"]) {
    if (key in result) result[key] = previewUrl(result[key]);
  }
  return result;
}
