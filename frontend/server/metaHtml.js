// Pure logic, deliberately separated from server.js's Express/file-I/O
// wiring so it can be unit tested without needing a built dist/index.html
// on disk or a running HTTP server.

// Covers the major platforms people actually share links on. Add more
// patterns here if a specific platform's preview isn't picking this up.
export const BOT_USER_AGENT_PATTERN =
  /facebookexternalhit|Facebot|Twitterbot|Slackbot|Discordbot|WhatsApp|TelegramBot|LinkedInBot|Pinterest|SkypeUriPreview|redditbot|Applebot|iMessage|Googlebot|bingbot|W3C_Validator|Iframely|Embedly/i;

export function isBotRequest(userAgent) {
  return BOT_USER_AGENT_PATTERN.test(userAgent || "");
}

export function truncateForPreview(text, maxLength = 200) {
  if (!text) return text;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}\u2026`;
}

export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function replaceMetaContent(html, attrMatch, newContent) {
  const re = new RegExp(`(<meta[^>]*${attrMatch}[^>]*content=")[^"]*(")`);
  return html.replace(re, (_full, pre, post) => `${pre}${escapeHtml(newContent)}${post}`);
}

export function removeMetaTag(html, attrMatch) {
  const re = new RegExp(`\\s*<meta[^>]*${attrMatch}[^>]*/>`);
  return html.replace(re, "");
}

// `template` is the built index.html's contents. `fallbackImage` is the
// generic site-wide og-image.png URL -- when imageUrl matches it, the
// declared 1200x630 dimension hints are kept; otherwise they're removed,
// since a real property/destination photo won't match that aspect ratio
// and an incorrect hint is worse than no hint.
export function renderMetaHtml(template, { title, description, imageUrl, pageUrl, fallbackImage }) {
  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = replaceMetaContent(html, 'name="description"', description);
  html = replaceMetaContent(html, 'property="og:title"', title);
  html = replaceMetaContent(html, 'property="og:description"', description);
  html = replaceMetaContent(html, 'property="og:image"', imageUrl);
  html = replaceMetaContent(html, 'property="og:url"', pageUrl);
  html = replaceMetaContent(html, 'name="twitter:title"', title);
  html = replaceMetaContent(html, 'name="twitter:description"', description);
  html = replaceMetaContent(html, 'name="twitter:image"', imageUrl);

  if (imageUrl !== fallbackImage) {
    html = removeMetaTag(html, 'property="og:image:width"');
    html = removeMetaTag(html, 'property="og:image:height"');
  }

  return html;
}
