// Regular visitors get the exact same static SPA as before. The only
// thing this server does differently from a plain static file server is:
// when a known link-preview bot (Slack, Twitter, iMessage, Discord, etc.)
// requests a specific property/destination/blog post URL, it fetches that
// resource from the API and serves a version of index.html with the
// og:title/og:description/og:image tags swapped to match that resource,
// instead of the generic site-wide ones baked in at build time. Bots
// don't run JavaScript, so this can't be done client-side -- it has to
// happen here, before the HTML is sent. See server/metaHtml.js for the
// actual (unit-tested) templating logic.
import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { isBotRequest, renderMetaHtml, truncateForPreview } from "./server/metaHtml.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "dist");
const PORT = process.env.PORT || 5173;

const API_BASE_URL = (process.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1").replace(/\/$/, "");
const SITE_URL = (process.env.VITE_SITE_URL || "http://localhost:5173").replace(/\/$/, "");
const FALLBACK_IMAGE = `${SITE_URL}/og-image.png`;

const indexHtmlTemplate = fs.readFileSync(path.join(DIST_DIR, "index.html"), "utf-8");

async function fetchJson(apiPath) {
  try {
    const response = await fetch(`${API_BASE_URL}${apiPath}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

const app = express();

app.get("/properties/:slug", async (req, res, next) => {
  if (!isBotRequest(req.headers["user-agent"])) return next();

  const data = await fetchJson(`/properties/${req.params.slug}`);
  if (!data?.property) return next();

  const { property } = data;
  const html = renderMetaHtml(indexHtmlTemplate, {
    title: `${property.title} | T10 Properties LLC`,
    description: truncateForPreview(property.description) || "An accessible home from T10 Properties LLC.",
    imageUrl: property.photo_urls?.[0] || FALLBACK_IMAGE,
    pageUrl: `${SITE_URL}/properties/${property.slug}`,
    fallbackImage: FALLBACK_IMAGE
  });
  res.set("Content-Type", "text/html").send(html);
});

app.get("/destinations/:slug", async (req, res, next) => {
  if (!isBotRequest(req.headers["user-agent"])) return next();

  const data = await fetchJson(`/destinations/${req.params.slug}`);
  if (!data?.destination) return next();

  const { destination } = data;
  const html = renderMetaHtml(indexHtmlTemplate, {
    title: `${destination.name} \u2014 T10 rating ${destination.t10_rating}/10 | T10 Properties LLC`,
    description: truncateForPreview(destination.description) || "A destination rated for real wheelchair accessibility.",
    imageUrl: destination.photo_urls?.[0] || FALLBACK_IMAGE,
    pageUrl: `${SITE_URL}/destinations/${destination.slug}`,
    fallbackImage: FALLBACK_IMAGE
  });
  res.set("Content-Type", "text/html").send(html);
});

app.get("/blog/:slug", async (req, res, next) => {
  if (!isBotRequest(req.headers["user-agent"])) return next();

  const data = await fetchJson(`/blog_posts/${req.params.slug}`);
  if (!data?.blog_post) return next();

  const { blog_post: post } = data;
  const html = renderMetaHtml(indexHtmlTemplate, {
    title: `${post.title} | T10 Properties LLC`,
    description: truncateForPreview(post.excerpt) || "From the T10 Properties blog.",
    imageUrl: post.cover_image_url || FALLBACK_IMAGE,
    pageUrl: `${SITE_URL}/blog/${post.slug}`,
    fallbackImage: FALLBACK_IMAGE
  });
  res.set("Content-Type", "text/html").send(html);
});

// Everything else: plain static file serving, same as `serve -s dist` did.
app.use(express.static(DIST_DIR));

// SPA fallback so client-side routing (React Router) works on refresh/deep links.
app.get("*", (_req, res) => {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`T10 Properties frontend listening on port ${PORT}`);
});
