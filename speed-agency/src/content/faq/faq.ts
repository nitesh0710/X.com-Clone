/**
 * Site-wide FAQ (section 5.6). {{KEY}} tokens are filled from src/config/site.ts.
 * `home: true` marks the five shown on the homepage.
 */
export type FaqItem = { id: string; q: string; a: string; home?: boolean };

export const faq: FaqItem[] = [
  {
    id: 'cost',
    home: true,
    q: 'How much does a website cost?',
    a: "Starter sites start at {{PRICE_STARTER}}. You'll get a fixed quote after a 15-minute call, before you pay anything. See [full pricing](/pricing).",
  },
  {
    id: 'timing',
    home: true,
    q: 'How long does it take?',
    a: "About a week of build time once I have your details. Bigger sites take two to three weeks. I'll give you a date at the start.",
  },
  {
    id: 'calls',
    q: 'Will this get me more calls?',
    a: "A good website makes it much easier for people who find you to call you, and helps you show up in local searches. Nobody can honestly guarantee a number of calls, and I won't. I'll set up a way to count calls and form requests so you can see what's working.",
  },
  {
    id: 'page-one',
    q: 'Will I show up on page 1 of Google?',
    a: "I set your site up correctly for Google and connect it to your Business Profile. Rankings depend on your area, competition and reviews, so I don't promise positions.",
  },
  {
    id: 'photos',
    home: true,
    q: "I don't have photos or a logo.",
    a: "That's fine. I can launch with a clean text logo and quality placeholder images, and swap in your job photos later.",
  },
  {
    id: 'own',
    home: true,
    q: 'Do I own the website?',
    a: "Yes. Your domain and content are yours. If you leave, I'll hand everything over.",
  },
  {
    id: 'contract',
    q: 'Is there a contract?',
    a: 'You approve a short written scope before we start. The care plan is month to month.',
  },
  {
    id: 'based',
    home: true,
    q: 'Where are you based?',
    a: '{{LOCATION_STATEMENT}} All communication is in English during US business hours.',
  },
  {
    id: 'existing',
    q: 'What if I already have a website?',
    a: "Then I'll tell you honestly whether it needs replacing or just fixing. Ask for the [free video review](/contact?topic=review).",
  },
  {
    id: 'pay',
    q: 'How do I pay?',
    a: '{{PAYMENT_METHODS}}, in USD.',
  },
  {
    id: 'after',
    q: 'What happens after launch?',
    a: "Choose the care plan, or I'll hand it over to you with a short guide.",
  },
];
