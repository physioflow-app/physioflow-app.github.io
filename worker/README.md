# Gemini proxy Worker

Reference implementation of the Cloudflare Worker at `pt-gemini-proxy.itzsid.workers.dev`
that the app calls to generate programs. The deployed Worker's source is not in this
repository, so compare with it before replacing it.

What it adds over a plain pass-through proxy:

- **Origin allowlist**: requests from other sites are refused (`ALLOWED_ORIGINS`).
- **Per-IP rate limiting** using Cloudflare's Rate Limiting binding (10/minute by default).
- **Request allowlist**: only the system prompt, one user message, and bounded generation
  settings are forwarded. Callers cannot pick a model, enable tools, or raise output limits.
- **Size limits** on the request body and prompt text.

An Origin check stops other websites from using your quota through visitors' browsers, but a
script can fake the header. For stronger protection, add Cloudflare Turnstile and verify its
token here.

Deploy:

```bash
cd worker
cp wrangler.toml.example wrangler.toml   # set GEMINI_MODEL to the model you use today
npx wrangler secret put GEMINI_API_KEY
npx wrangler deploy
```
