/**
 * Shared enquiry schema. Imported by the browser (fast feedback) and by
 * functions/api/enquiry.ts (the source of truth). Keep it dependency-free
 * apart from Zod so it bundles into both.
 */
import { z } from 'zod';

// No eval/new Function: keeps the strict Content-Security-Policy (no 'unsafe-eval') happy.
z.config({ jitless: true });

export const NEEDS = [
  { value: 'new_website', label: 'New website' },
  { value: 'fix_site', label: 'Fix my current site' },
  { value: 'google_profile', label: 'Google profile' },
  { value: 'missed_call', label: 'Missed-call text-back' },
  { value: 'video_review', label: 'Free video review' },
  { value: 'other', label: 'Something else' },
] as const;

export const TRADES = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'painting', label: 'Painting' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'handyman', label: 'Handyman' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'other', label: 'Other trade' },
] as const;

export const TIMELINES = [
  { value: 'asap', label: 'ASAP' },
  { value: 'month', label: 'Within a month' },
  { value: 'looking', label: 'Just looking' },
] as const;

/** Labels are filled in from site config (BUDGET_LOW / BUDGET_HIGH). */
export const BUDGET_VALUES = ['under_low', 'low_high', 'over_high', 'not_sure'] as const;

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((o) => o.value) as unknown as [T[number]['value'], ...T[number]['value'][]];

const text = (max: number, label: string) =>
  z
    .string({ error: `${label} must be text.` })
    .trim()
    .max(max, { error: `${label} must be ${max.toLocaleString('en-US')} characters or fewer.` });

const optionalText = (max: number, label: string) => text(max, label).optional().default('');

const optionalChoice = <T extends readonly [string, ...string[]]>(opts: T, msg: string) =>
  z.union([z.enum(opts, { error: msg }), z.literal('')]).optional().default('');

export const enquirySchema = z.object({
  form_type: z.enum(['quick', 'brief'], { error: 'Unknown form.' }),
  name: text(100, 'Name').min(1, { error: 'Please enter your name.' }),
  email: text(200, 'Email')
    .min(1, { error: 'Please enter your email address.' })
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, {
      error: 'Please enter a valid email address, like name@example.com.',
    }),
  phone: optionalText(40, 'Phone').refine((v) => v === '' || /^[+()\d\s.-]{7,40}$/.test(v), {
    error: 'Please enter a phone number using digits, spaces, + or dashes.',
  }),
  business_name: text(150, 'Business name').min(1, { error: 'Please enter your business name.' }),
  town_state: text(120, 'Town and state').min(1, {
    error: 'Please enter your town and state, like "Dayton, OH".',
  }),
  need: z.enum(values(NEEDS), { error: 'Please choose what you need.' }),
  message: optionalText(3000, 'Message'),

  // Project brief extras
  website_url: optionalText(300, 'Website address'),
  trade: optionalChoice(values(TRADES), 'Please choose your trade.'),
  services: optionalText(1000, 'Services'),
  towns: optionalText(500, 'Towns covered'),
  timeline: optionalChoice(values(TIMELINES), 'Please choose a timeline.'),
  budget: optionalChoice([...BUDGET_VALUES], 'Please choose a budget.'),

  marketing_consent: z.boolean().optional().default(false),

  // Context
  source_page: optionalText(200, 'Source page'),
  utm_source: optionalText(200, 'utm_source'),
  utm_medium: optionalText(200, 'utm_medium'),
  utm_campaign: optionalText(200, 'utm_campaign'),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type Enquiry = z.output<typeof enquirySchema>;

/** Field → first message. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const EVENT_NAMES = [
  'cta_click',
  'call_click',
  'email_click',
  'form_start',
  'form_submit',
  'form_error',
  'booking_made',
  'demo_view',
  'pricing_view',
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

/** Events the browser may send (booking_made is server-side only). */
export const CLIENT_EVENT_NAMES: readonly EventName[] = EVENT_NAMES.filter((n) => n !== 'booking_made');

export const eventSchema = z.object({
  name: z.enum(EVENT_NAMES),
  page: z.string().max(200).optional().default(''),
  label: z.string().max(120).optional().default(''),
  session_id: z.string().max(64).optional().default(''),
});

export const LEAD_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost', 'spam'] as const;
