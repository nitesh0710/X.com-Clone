export const services = [
  { href: '/websites', label: 'Websites for trades', sub: 'The main offer: a site that gets calls' },
  { href: '/get-found', label: 'Get found on Google', sub: 'Google profile and local setup' },
  { href: '/automation', label: 'Never miss a job', sub: 'Missed-call text-back and follow-up' },
] as const;

export const primary = [
  { href: '/work', label: 'Work' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
] as const;

export const industries = [
  { slug: 'plumbers', label: 'Plumbers' },
  { slug: 'electricians', label: 'Electricians' },
  { slug: 'hvac', label: 'HVAC' },
  { slug: 'roofers', label: 'Roofers' },
  { slug: 'painters', label: 'Painters' },
] as const;
