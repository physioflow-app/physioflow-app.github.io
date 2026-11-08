/**
 * Hardened Cloudflare Worker proxy for PhysioFlow's Gemini requests.
 *
 * - Only accepts POST requests from the allowed origins (CORS + Origin check).
 * - Rate limits per client IP with Cloudflare's Rate Limiting binding.
 * - Caps request size and rebuilds the Gemini request from an allowlist of
 *   fields, so the endpoint cannot be used as a general-purpose Gemini proxy
 *   (no model choice, no tools, bounded output).
 * - Keeps the API key in a Worker secret: `wrangler secret put GEMINI_API_KEY`.
 */

const MAX_BODY_BYTES = 64 * 1024;
const MAX_OUTPUT_TOKENS = 8192;

function allowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || 'https://physioflow-app.github.io').split(',').map((origin) => origin.trim());
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

const isText = (value, max) => typeof value === 'string' && value.length > 0 && value.length <= max;

/** Rebuilds a safe Gemini request from the client body, or returns null if it is malformed. */
export function sanitize(body) {
  const system = body?.system_instruction?.parts?.[0]?.text;
  const user = body?.contents?.[0]?.parts?.[0]?.text;
  if (!isText(system, 20000) || !isText(user, 4000) || body.contents.length !== 1) return null;
  const config = body.generationConfig || {};
  const temperature = typeof config.temperature === 'number' ? Math.min(Math.max(config.temperature, 0), 1) : 0.3;
  return {
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: Math.min(Number(config.maxOutputTokens) || MAX_OUTPUT_TOKENS, MAX_OUTPUT_TOKENS),
      responseMimeType: 'application/json',
    },
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (!allowedOrigins(env).includes(origin)) return json(403, { error: 'Origin not allowed' });
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json(405, { error: 'Method not allowed' }, cors);

    if (env.RATE_LIMITER) {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const { success } = await env.RATE_LIMITER.limit({ key: ip });
      if (!success) return json(429, { error: 'Too many requests' }, { ...cors, 'Retry-After': '60' });
    }

    const length = Number(request.headers.get('Content-Length') || 0);
    if (length > MAX_BODY_BYTES) return json(413, { error: 'Request too large' }, cors);
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json(413, { error: 'Request too large' }, cors);

    let body;
    try {
      body = sanitize(JSON.parse(raw));
    } catch {
      body = null;
    }
    if (!body) return json(400, { error: 'Invalid request' }, cors);

    const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify(body),
    });
    // Pass status through (the app retries 429/5xx), but never forward upstream headers.
    return new Response(upstream.body, { status: upstream.status, headers: { 'Content-Type': 'application/json', ...cors } });
  },
};
