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

    // Remove unwanted elements that readability might occasionally preserve
    const unwantedSelectors = [
      "script",
      "style",
      "iframe",
      "noscript",
      "header nav",
      "footer",
      ".advertisement",
      ".ad-banner",
      ".social-share",
      ".newsletter-signup",
      "#cookie-banner",
      ".disclaimer",
    ];

    unwantedSelectors.forEach((selector) => {
      doc.querySelectorAll(selector).forEach((el) => el.remove());
    });

    const reader = new Readability(doc, {
      charThreshold: 100,
    });

    const article = reader.parse();

    if (!article || !article.textContent) {
      return null;
    }

    return {
      title: article.title || "Untitled Article",
      byline: article.byline || undefined,
      excerpt: article.excerpt || undefined,
      content: article.content || "",
      textContent: article.textContent || "",
    };
  } catch (error) {
    console.error("Readability parsing error:", error);
    return null;
  }
}
