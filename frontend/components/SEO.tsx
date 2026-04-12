import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEO({
  title = "LawCaseAI - Legal Intelligence Platform",
  description = "AI-powered legal intelligence platform designed to help lawyers automate case analysis, manage documents securely, and save billable hours instantly.",
  image = "https://lawcaseai.vercel.app/og-image.jpg",
  url = "https://lawcaseai.vercel.app",
  type = "website",
  children,
}: SEOProps & { children?: React.ReactNode }) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="title" content={title} key="title" />
      <meta name="description" content={description} key="description" />

      <meta property="og:type" content={type} key="og:type" />
      <meta property="og:url" content={url} key="og:url" />
      <meta property="og:title" content={title} key="og:title" />
      <meta property="og:description" content={description} key="og:description" />
      <meta property="og:image" content={image} key="og:image" />

      <meta property="twitter:card" content="summary_large_image" key="twitter:card" />
      <meta property="twitter:url" content={url} key="twitter:url" />
      <meta property="twitter:title" content={title} key="twitter:title" />
      <meta property="twitter:description" content={description} key="twitter:description" />
      <meta property="twitter:image" content={image} key="twitter:image" />

      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#020817" />
      {children}
    </Head>
  );
}
