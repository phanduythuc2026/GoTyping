import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export interface ParsedReadabilityOutput {
  title: string;
  byline?: string;
  excerpt?: string;
  content: string;
  textContent: string;
}

export function extractReadableContent(html: string, url: string): ParsedReadabilityOutput | null {
  try {
    const dom = new JSDOM(html, { url });
    const doc = dom.window.document;

    // Extract meta title and author as early fallbacks
    const metaTitle =
      doc.querySelector("meta[property='og:title']")?.getAttribute("content") ||
      doc.querySelector("meta[name='twitter:title']")?.getAttribute("content") ||
      doc.title?.trim() ||
      "Untitled Article";

    const metaAuthor =
      doc.querySelector("meta[name='author']")?.getAttribute("content") ||
      doc.querySelector("meta[property='article:author']")?.getAttribute("content") ||
      undefined;

    // Remove unwanted non-content elements
    const unwantedSelectors = [
      "script",
      "style",
      "iframe",
      "noscript",
      "nav",
      "header",
      "footer",
      "aside",
      ".advertisement",
      ".ad-banner",
      ".ad-container",
      ".social-share",
      ".newsletter-signup",
      "#cookie-banner",
      ".cookie-consent",
      ".disclaimer",
      ".comments",
      "#comments",
    ];

    unwantedSelectors.forEach((selector) => {
      doc.querySelectorAll(selector).forEach((el) => {
        try {
          el.remove();
        } catch {}
      });
    });

    // Tier 1: Mozilla Readability Engine
    try {
      const clonedDoc = doc.cloneNode(true) as Document;
      const reader = new Readability(clonedDoc, {
        charThreshold: 40,
      });
      const article = reader.parse();

      if (article && article.textContent && article.textContent.trim().length >= 100) {
        return {
          title: article.title?.trim() || metaTitle,
          byline: article.byline?.trim() || metaAuthor,
          excerpt: article.excerpt?.trim() || undefined,
          content: article.content || "",
          textContent: article.textContent.trim(),
        };
      }
    } catch {}

    // Tier 2: Semantic Article Containers
    const containerSelectors = [
      "[itemprop='articleBody']",
      "article",
      "main",
      "[role='main']",
      ".article-body",
      ".article-content",
      ".article__body",
      ".story-body",
      ".story-content",
      ".post-content",
      ".entry-content",
      ".caas-body",
      ".content__article-body",
      "#article-body",
      ".detail-content",
      ".fck_detail",
    ];

    for (const selector of containerSelectors) {
      const container = doc.querySelector(selector);
      if (container) {
        const paragraphs = Array.from(container.querySelectorAll("p, h2, h3, blockquote"))
          .map((el) => el.textContent?.trim() || "")
          .filter((t) => t.length > 25);

        if (paragraphs.length >= 2) {
          const joinedText = paragraphs.join("\n\n");
          if (joinedText.length >= 100) {
            return {
              title: metaTitle,
              byline: metaAuthor,
              content: paragraphs.map((p) => `<p>${p}</p>`).join(""),
              textContent: joinedText,
            };
          }
        }
      }
    }

    // Tier 3: All Valid Paragraphs Fallback
    const allParagraphs = Array.from(doc.querySelectorAll("p"))
      .map((p) => p.textContent?.trim() || "")
      .filter((t) => t.length > 30 && !t.includes("cookie") && !t.includes("copyright"));

    if (allParagraphs.length >= 2) {
      const joinedText = allParagraphs.join("\n\n");
      if (joinedText.length >= 80) {
        return {
          title: metaTitle,
          byline: metaAuthor,
          content: allParagraphs.map((p) => `<p>${p}</p>`).join(""),
          textContent: joinedText,
        };
      }
    }

    // Tier 4: Body text content if nothing else worked
    const bodyText = doc.body?.textContent?.replace(/\s+/g, " ").trim();
    if (bodyText && bodyText.length >= 150) {
      return {
        title: metaTitle,
        byline: metaAuthor,
        content: `<p>${bodyText}</p>`,
        textContent: bodyText,
      };
    }

    return null;
  } catch (error) {
    console.error("Readability parsing error:", error);
    return null;
  }
}
