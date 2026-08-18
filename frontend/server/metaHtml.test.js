import { describe, it, expect } from "vitest";
import { escapeHtml, isBotRequest, removeMetaTag, renderMetaHtml, replaceMetaContent, truncateForPreview } from "./metaHtml.js";

// A trimmed-down stand-in for the real built index.html -- same meta tag
// shapes/attribute ordering, so the regexes are exercised the same way,
// without depending on the actual file existing on disk.
const SAMPLE_TEMPLATE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>T10 Properties LLC</title>
    <meta
      name="description"
      content="Homes built for real accessibility, plus restaurants, hotels, and venues rated 1-10."
    />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="T10 Properties LLC" />
    <meta
      property="og:description"
      content="Homes built for real accessibility, plus restaurants, hotels, and venues rated 1-10."
    />
    <meta property="og:image" content="https://example.com/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="https://example.com/" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="T10 Properties LLC" />
    <meta
      name="twitter:description"
      content="Homes built for real accessibility, plus restaurants, hotels, and venues rated 1-10."
    />
    <meta name="twitter:image" content="https://example.com/og-image.png" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

const FALLBACK_IMAGE = "https://example.com/og-image.png";

describe("isBotRequest", () => {
  it("recognizes known link-preview bots", () => {
    expect(isBotRequest("Slackbot-LinkExpanding 1.0")).toBe(true);
    expect(isBotRequest("Twitterbot/1.0")).toBe(true);
    expect(isBotRequest("facebookexternalhit/1.1")).toBe(true);
    expect(isBotRequest("Mozilla/5.0 (compatible; Discordbot/2.0;+https://discordapp.com)")).toBe(true);
  });

  it("does not treat regular browsers as bots", () => {
    expect(isBotRequest("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15")).toBe(false);
  });

  it("handles a missing user agent", () => {
    expect(isBotRequest(undefined)).toBe(false);
    expect(isBotRequest("")).toBe(false);
  });
});

describe("truncateForPreview", () => {
  it("leaves short text untouched", () => {
    expect(truncateForPreview("A short description.")).toBe("A short description.");
  });

  it("truncates long text with an ellipsis, respecting the max length", () => {
    const long = "x".repeat(250);
    const result = truncateForPreview(long, 200);
    expect(result.length).toBe(200);
    expect(result.endsWith("\u2026")).toBe(true);
  });

  it("trims trailing whitespace before adding the ellipsis", () => {
    // 195 x's + 5 spaces + 50 y's = 250 chars. Slicing to 199 chars lands
    // inside the run of spaces (195 x's + 4 of the 5 spaces), which is
    // exactly the case trimEnd() needs to handle.
    const text = `${"x".repeat(195)}     ${"y".repeat(50)}`;
    const result = truncateForPreview(text, 200);
    expect(result).not.toMatch(/\s\u2026$/);
  });

  it("passes through falsy values unchanged", () => {
    expect(truncateForPreview(null)).toBeNull();
    expect(truncateForPreview(undefined)).toBeUndefined();
    expect(truncateForPreview("")).toBe("");
  });
});

describe("escapeHtml", () => {
  it("escapes HTML-significant characters", () => {
    expect(escapeHtml(`<script>alert("hi")</script> & 'quote'`)).toBe(
      "&lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt; &amp; &#39;quote&#39;"
    );
  });
});

describe("replaceMetaContent", () => {
  it("replaces only the targeted meta tag's content", () => {
    const html = replaceMetaContent(SAMPLE_TEMPLATE, 'property="og:title"', "New Title");
    expect(html).toContain('<meta property="og:title" content="New Title" />');
    // twitter:title, which also contains "title", must be untouched
    expect(html).toContain('<meta name="twitter:title" content="T10 Properties LLC" />');
  });

  it("works across a multi-line meta tag", () => {
    const html = replaceMetaContent(SAMPLE_TEMPLATE, 'property="og:description"', "New description");
    expect(html).toContain('property="og:description"\n      content="New description"');
  });

  it('does not confuse name="description" with name="twitter:description"', () => {
    const html = replaceMetaContent(SAMPLE_TEMPLATE, 'name="description"', "Plain description");
    // the plain <meta name="description"> tag was updated
    expect(html).toMatch(/<meta\s*\n\s*name="description"\s*\n\s*content="Plain description"/);
    // twitter:description's own content must be untouched
    expect(html).toMatch(/name="twitter:description"\s*\n\s*content="Homes built for real accessibility/);
  });
});

describe("removeMetaTag", () => {
  it("removes the matched tag entirely", () => {
    const html = removeMetaTag(SAMPLE_TEMPLATE, 'property="og:image:width"');
    expect(html).not.toContain("og:image:width");
  });
});

describe("renderMetaHtml", () => {
  it("substitutes title, description, image, and url for a real page", () => {
    const html = renderMetaHtml(SAMPLE_TEMPLATE, {
      title: "Riverfront Loft | T10 Properties LLC",
      description: "A lovely accessible loft downtown.",
      imageUrl: "https://cdn.example.com/photos/riverfront.jpg",
      pageUrl: "https://example.com/properties/riverfront-loft",
      fallbackImage: FALLBACK_IMAGE
    });

    expect(html).toContain("<title>Riverfront Loft | T10 Properties LLC</title>");
    expect(html).toContain('<meta property="og:title" content="Riverfront Loft | T10 Properties LLC" />');
    expect(html).toContain('<meta property="og:image" content="https://cdn.example.com/photos/riverfront.jpg" />');
    expect(html).toContain('<meta property="og:url" content="https://example.com/properties/riverfront-loft" />');
    expect(html).toContain('<meta name="twitter:image" content="https://cdn.example.com/photos/riverfront.jpg" />');
  });

  it("strips the 1200x630 dimension hints when using a real (non-fallback) photo", () => {
    const html = renderMetaHtml(SAMPLE_TEMPLATE, {
      title: "Riverfront Loft",
      description: "A lovely loft.",
      imageUrl: "https://cdn.example.com/photos/riverfront.jpg",
      pageUrl: "https://example.com/properties/riverfront-loft",
      fallbackImage: FALLBACK_IMAGE
    });

    expect(html).not.toContain("og:image:width");
    expect(html).not.toContain("og:image:height");
  });

  it("keeps the dimension hints when falling back to the generic image", () => {
    const html = renderMetaHtml(SAMPLE_TEMPLATE, {
      title: "A Destination With No Photos",
      description: "No photos uploaded yet.",
      imageUrl: FALLBACK_IMAGE,
      pageUrl: "https://example.com/destinations/no-photos",
      fallbackImage: FALLBACK_IMAGE
    });

    expect(html).toContain('<meta property="og:image:width" content="1200" />');
    expect(html).toContain('<meta property="og:image:height" content="630" />');
  });

  it("escapes HTML-significant characters in dynamic content", () => {
    const html = renderMetaHtml(SAMPLE_TEMPLATE, {
      title: `A "Great" Place & More`,
      description: "Fine <em>print</em> here",
      imageUrl: FALLBACK_IMAGE,
      pageUrl: "https://example.com/destinations/quoted",
      fallbackImage: FALLBACK_IMAGE
    });

    expect(html).toContain("A &quot;Great&quot; Place &amp; More");
    expect(html).toContain("Fine &lt;em&gt;print&lt;/em&gt; here");
    expect(html).not.toContain('content="A "Great"');
  });
});
