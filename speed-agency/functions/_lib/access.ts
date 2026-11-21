/**
 * Defence in depth for /admin and /api/admin: Cloudflare Access sits in front
 * of these paths, and this verifies the Access JWT as well, so a mistake in the
 * Access policy doesn't expose leads.
 */
import type { Env } from './env';

type Jwk = JsonWebKey & { kid?: string };
let certCache: { at: number; keys: Jwk[] } | null = null;

const b64urlDecode = (s: string) => {
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function keys(team: string): Promise<Jwk[]> {
  if (certCache && Date.now() - certCache.at < 10 * 60_000) return certCache.keys;
  const res = await fetch(`https://${team}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`Access certs ${res.status}`);
  const data = (await res.json()) as { keys: Jwk[] };
  certCache = { at: Date.now(), keys: data.keys };
  return data.keys;
}

export async function verifyAccess(req: Request, env: Env): Promise<{ ok: true; email: string } | { ok: false; status: number; reason: string }> {
  if (env.ALLOW_ADMIN_WITHOUT_ACCESS === '1') return { ok: true, email: 'local-dev' };
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return { ok: false, status: 503, reason: 'Cloudflare Access is not configured' };
  const token = req.headers.get('cf-access-jwt-assertion');
  if (!token) return { ok: false, status: 401, reason: 'Missing Access token' };
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return { ok: false, status: 401, reason: 'Malformed token' };
  try {
    const header = JSON.parse(new TextDecoder().decode(b64urlDecode(h))) as { kid?: string; alg?: string };
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(p))) as { aud?: string | string[]; exp?: number; iss?: string; email?: string };
    if (header.alg !== 'RS256') return { ok: false, status: 401, reason: 'Bad alg' };
    const jwk = (await keys(env.ACCESS_TEAM_DOMAIN)).find((k) => k.kid === header.kid);
    if (!jwk) return { ok: false, status: 401, reason: 'Unknown key' };
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlDecode(s), new TextEncoder().encode(`${h}.${p}`));
    if (!valid) return { ok: false, status: 401, reason: 'Bad signature' };
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!aud.includes(env.ACCESS_AUD)) return { ok: false, status: 403, reason: 'Wrong audience' };
    if (!payload.exp || payload.exp * 1000 < Date.now()) return { ok: false, status: 401, reason: 'Expired' };
    if (payload.iss !== `https://${env.ACCESS_TEAM_DOMAIN}`) return { ok: false, status: 401, reason: 'Wrong issuer' };
    return { ok: true, email: payload.email ?? '' };
  } catch {
    return { ok: false, status: 401, reason: 'Invalid token' };
  }
}
