export async function getServerSideProps({ res }) {
  const BASE_URL = "https://oreum.제주맹글이.site";

  const urls = [
    {
      loc: `${BASE_URL}/`,
      changefreq: "weekly",
      priority: "1.0",
    },
  ];

  const lastmod = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
