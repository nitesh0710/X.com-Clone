/**
 * First-party, cookieless event tracking. Loaded on every page (tiny).
 * - Session id: random per page load, memory only. No cookie, no storage.
 * - UTM parameters: captured on landing into sessionStorage (not a cookie)
 *   and attached to enquiries.
 */
type Name =
  | 'cta_click'
  | 'call_click'
  | 'email_click'
  | 'form_start'
  | 'form_submit'
  | 'form_error'
  | 'demo_view'
  | 'pricing_view';

const sid = Math.random().toString(36).slice(2) + Date.now().toString(36);

export function track(name: Name, label = ''): void {
  try {
    const body = JSON.stringify({ name, label, page: location.pathname, session_id: sid });
    const blob = new Blob([body], { type: 'application/json' });
    if (!navigator.sendBeacon || !navigator.sendBeacon('/api/event', blob)) {
      void fetch('/api/event', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } });
    }
  } catch {
    /* analytics must never break the page */
  }
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'] as const;

export function captureUtm(): void {
  try {
    const params = new URLSearchParams(location.search);
    if (UTM_KEYS.some((k) => params.get(k))) {
      for (const k of UTM_KEYS) sessionStorage.setItem(k, (params.get(k) ?? '').slice(0, 200));
    }
  } catch {
    /* storage can be blocked */
  }
}

export function readUtm(): Record<(typeof UTM_KEYS)[number], string> {
  const out = { utm_source: '', utm_medium: '', utm_campaign: '' };
  try {
    for (const k of UTM_KEYS) out[k] = sessionStorage.getItem(k) ?? '';
  } catch {
    /* ignore */
  }
  return out;
}

/** Delegated click tracking for CTAs, tel: and mailto: links. */
export function initClickTracking(): void {
  document.addEventListener(
    'click',
    (e) => {
      const el = (e.target as Element | null)?.closest('a, button');
      if (!el) return;
      const loc = el.closest('[data-loc]')?.getAttribute('data-loc') ?? '';
      const href = el.getAttribute('href') ?? '';
      if (href.startsWith('tel:') || href.startsWith('sms:')) track('call_click', el.getAttribute('data-cta') ?? loc);
      else if (href.startsWith('mailto:')) track('email_click', el.getAttribute('data-cta') ?? loc);
      else {
        const cta = el.getAttribute('data-cta');
        if (cta) track('cta_click', cta);
      }
    },
    { capture: true },
  );
}
