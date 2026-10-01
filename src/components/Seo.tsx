import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

interface SeoProps {
  title: string;
  description: string;
  type?: "website" | "article" | "product";
  image?: string;
  noindex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
  /** Breadcrumb trail after Home, e.g. [{ name: "Servizi", path: "/servizi" }] */
  breadcrumbs?: { name: string; path: string }[];
}

const SITE_URL = "https://bazhouse.com";

const Seo = ({ title, description, type = "website", image, noindex, jsonLd, breadcrumbs }: SeoProps) => {
  const { pathname } = useLocation();
  const fullTitle = title;
  const desc = description.length > 165 ? description.slice(0, 162).trimEnd() + "…" : description;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? [...jsonLd] : [jsonLd]) : [];
  if (breadcrumbs?.length) {
    const trail = [{ name: "Home", path: "/" }, ...breadcrumbs];
    blocks.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: trail.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: `${SITE_URL}${b.path}`,
      })),
    });
  }
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  const canonical = `${SITE_URL}${cleanPath}`;
  const ogImage = image ? (image.startsWith("http") ? image : `${SITE_URL}${image}`) : `${SITE_URL}/og-image.png`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="it_IT" />
      <meta property="og:site_name" content="Bazhouse" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(b)}</script>
      ))}
    </Helmet>
  );
};

export default Seo;
