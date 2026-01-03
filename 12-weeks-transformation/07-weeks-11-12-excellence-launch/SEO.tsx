// SEO Component
// Manages meta tags, Open Graph, Twitter Cards, and structured data

import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
  noindex?: boolean;
}

const defaultMeta = {
  siteName: 'Obsidian Note Reviewer',
  title: 'Obsidian Note Reviewer - Transform Your Notes Into Knowledge',
  description: 'The most powerful note review system for Obsidian. Annotate, collaborate, and never forget what you\'ve learned. AI-powered summaries, real-time collaboration, and enterprise security.',
  image: 'https://notereviewer.com/og-image.png',
  url: 'https://notereviewer.com',
  twitterHandle: '@notereview',
  type: 'website' as const,
};

export default function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  article,
  noindex = false,
}: SEOProps) {
  const meta = {
    title: title ? `${title} | ${defaultMeta.siteName}` : defaultMeta.title,
    description: description || defaultMeta.description,
    image: image || defaultMeta.image,
    url: url || defaultMeta.url,
    type,
  };

  // Structured data for rich snippets
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebApplication',
    name: meta.title,
    description: meta.description,
    url: meta.url,
    image: meta.image,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  if (type === 'article' && article) {
    Object.assign(structuredData, {
      headline: title,
      datePublished: article.publishedTime,
      dateModified: article.modifiedTime,
      author: {
        '@type': 'Person',
        name: article.author,
      },
      keywords: article.tags?.join(', '),
    });
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{meta.title}</title>
      <meta name="title" content={meta.title} />
      <meta name="description" content={meta.description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={meta.url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={meta.type} />
      <meta property="og:url" content={meta.url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:site_name" content={defaultMeta.siteName} />

      {/* Article specific */}
      {type === 'article' && article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={meta.url} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      <meta name="twitter:site" content={defaultMeta.twitterHandle} />
      <meta name="twitter:creator" content={defaultMeta.twitterHandle} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#4F46E5" />
      <meta name="msapplication-TileColor" content="#4F46E5" />

      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
}

// Pre-configured SEO for common pages
export const LandingSEO = () => (
  <SEO
    title="Transform Your Obsidian Notes Into Knowledge"
    description="AI-powered note review system with real-time collaboration, smart summaries, and enterprise security. Start free today."
  />
);

export const PricingSEO = () => (
  <SEO
    title="Pricing"
    description="Simple, transparent pricing. Free plan available. Pro starts at $12/month with 14-day trial. Enterprise plans for teams."
    url="https://notereviewer.com/pricing"
  />
);

export const DocsSEO = () => (
  <SEO
    title="Documentation"
    description="Complete documentation for Obsidian Note Reviewer API. Learn how to integrate, authenticate, and build with our platform."
    url="https://notereviewer.com/docs"
  />
);

export const BlogSEO = ({ title, description, image, publishedTime, author, tags }: {
  title: string;
  description: string;
  image?: string;
  publishedTime: string;
  author: string;
  tags?: string[];
}) => (
  <SEO
    title={title}
    description={description}
    image={image}
    type="article"
    article={{
      publishedTime,
      author,
      tags,
    }}
  />
);
