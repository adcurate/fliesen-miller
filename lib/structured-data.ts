import pages from "@/content/seo-pages.json";
import { cities, site } from "./site";

/** Describe only the existing public content; all regional pages share one business. */
export function structuredData(path: string, url: (path: string) => string) {
  const page = pages.find(page => page.path === path);
  if (!page) return null;
  const businessId = `${url("/")}#business`;
  const websiteId = `${url("/")}#website`;
  const pageType = path === "/kontakt" ? "ContactPage" : path === "/ueber-uns" ? "AboutPage" :
    ["/referenzen", "/einsatzgebiete"].includes(path) ? "CollectionPage" : "WebPage";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HomeAndConstructionBusiness", "@id": businessId,
        name: site.name, url: url("/"), telephone: site.phoneHref.slice(4), email: site.email,
        logo: url("/media/logo.webp"), image: url("/media/gallery-06.webp"),
        address: {
          "@type": "PostalAddress", streetAddress: site.street,
          addressLocality: "Cloppenburg", postalCode: "49661", addressCountry: "DE",
        },
        areaServed: cities.map(city => ({ "@type": "City", name: city.name })),
        sameAs: [site.instagram],
      },
      {
        "@type": "WebSite", "@id": websiteId, url: url("/"), name: site.name,
        inLanguage: "de-DE", publisher: { "@id": businessId },
      },
      {
        "@type": pageType, "@id": `${url(path)}#webpage`, url: url(path),
        name: page.title, description: page.description, inLanguage: "de-DE",
        isPartOf: { "@id": websiteId }, about: { "@id": businessId },
        ...(pageType === "ContactPage" || pageType === "AboutPage" ? { mainEntity: { "@id": businessId } } : {}),
      },
    ],
  };
}

export function serializeStructuredData(data: unknown): string {
  // A future copy change must never be able to close the JSON-LD script element.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
