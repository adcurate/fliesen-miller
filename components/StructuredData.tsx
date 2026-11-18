import { absoluteUrl } from "@/lib/seo";
import { serializeStructuredData, structuredData } from "@/lib/structured-data";

export function StructuredData({ path }: { path: string }) {
  const data = structuredData(path, absoluteUrl);
  return data ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(data) }} /> : null;
}
