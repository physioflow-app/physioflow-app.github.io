const escapeHtml = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Sets per-page title, description and canonical URL in the built HTML template. */
export function applyMeta(html, meta) {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  let out = html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${description}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${title}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${description}`);
  if (meta.canonical) {
    out = out
      .replace(/(<link rel="canonical" href=")[^"]*/, `$1${meta.canonical}`)
      .replace(/(<meta property="og:url" content=")[^"]*/, `$1${meta.canonical}`);
  } else {
    out = out
      .replace(/\s*<link rel="canonical" href="[^"]*" \/>/, '')
      .replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>');
  }
  return out;
}
