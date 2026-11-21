import { config, facts, hasFact, optional } from '@/config/site';

export type Crumb = { name: string; href: string };

const abs = (path: string) => new URL(path, config.siteUrl).toString().replace(/\/$/, '') || config.siteUrl;

export function organizationLd(): Record<string, unknown> {
  const sameAs = Object.values(optional.SOCIAL).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${config.siteUrl}/#org`,
    name: config.siteName,
    url: config.siteUrl,
    logo: `${config.siteUrl}/images/logo.png`,
    description:
      'A small web studio that builds websites for plumbers, electricians, HVAC techs, roofers and other trade businesses.',
    ...(hasFact('CONTACT_EMAIL') ? { email: facts.CONTACT_EMAIL } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${config.siteUrl}/#website`,
    name: config.siteName,
    url: config.siteUrl,
    publisher: { '@id': `${config.siteUrl}/#org` },
    inLanguage: 'en-US',
  };
}

export function breadcrumbLd(crumbs: Crumb[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.href),
    })),
  };
}

/** Parses '$1,200' → '1200'. Returns null if the price isn't set or isn't numeric. */
function numericPrice(raw: string): string | null {
  const n = raw.replace(/[^\d.]/g, '');
  return n && !Number.isNaN(Number(n)) ? n : null;
}

export function serviceLd(opts: {
  name: string;
  description: string;
  path: string;
  priceKey?: 'PRICE_STARTER' | 'PRICE_GET_FOUND' | 'PRICE_AUTOMATION';
}): Record<string, unknown> {
  const price = opts.priceKey && hasFact(opts.priceKey) ? numericPrice(facts[opts.priceKey]) : null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    url: abs(opts.path),
    provider: { '@id': `${config.siteUrl}/#org` },
    areaServed: { '@type': 'Country', name: 'US' },
    ...(price
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            priceSpecification: { '@type': 'PriceSpecification', minPrice: price, priceCurrency: 'USD' },
          },
        }
      : {}),
  };
}

export function personLd(): Record<string, unknown> | null {
  if (!hasFact('FOUNDER_NAME')) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: facts.FOUNDER_NAME,
    jobTitle: 'Founder',
    worksFor: { '@id': `${config.siteUrl}/#org` },
    ...(hasFact('FOUNDER_PHOTO') ? { image: abs(facts.FOUNDER_PHOTO) } : {}),
    url: abs('/about'),
  };
}

export function articleLd(opts: {
  title: string;
  description: string;
  path: string;
  published: Date;
  updated?: Date | undefined;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: abs(opts.path),
    mainEntityOfPage: abs(opts.path),
    datePublished: opts.published.toISOString(),
    dateModified: (opts.updated ?? opts.published).toISOString(),
    author: hasFact('FOUNDER_NAME')
      ? { '@type': 'Person', name: facts.FOUNDER_NAME, url: abs('/about') }
      : { '@id': `${config.siteUrl}/#org` },
    publisher: { '@id': `${config.siteUrl}/#org` },
    image: abs('/og/default.png'),
  };
}

export function faqLd(items: { q: string; a: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}
