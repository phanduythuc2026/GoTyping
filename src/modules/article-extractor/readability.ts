import { parseHTML } from "linkedom";
import { Readability } from "@mozilla/readability";

export interface ParsedReadabilityOutput {
  title: string;
  byline?: string;
  excerpt?: string;
  content: string;
  textContent: string;
}

export function extractReadableContent(html: string, articleUrl?: string): ParsedReadabilityOutput | null {
  try {
    const { document } = parseHTML(html);
    void articleUrl;

    // Extract meta title and author as early fallbacks
    const metaTitle =
      document.querySelector("meta[property='og:title']")?.getAttribute("content") ||
      document.querySelector("meta[name='twitter:title']")?.getAttribute("content") ||
      document.title?.trim() ||
      "Untitled Article";

    const metaAuthor =
      document.querySelector("meta[name='author']")?.getAttribute("content") ||
      document.querySelector("meta[property='article:author']")?.getAttribute("content") ||
      undefined;

    // Clean up unwanted non-content elements
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
      document.querySelectorAll(selector).forEach((el) => {
        try {
          (el as unknown as { remove: () => void }).remove();
        } catch {}
      });
    });

    // Tier 1: Mozilla Readability Engine via lightweight linkedom
    try {
      const reader = new Readability(document, {
        charThreshold: 30,
      });
      const article = reader.parse();

      if (article && article.textContent && article.textContent.trim().length >= 80) {
        return {
          title: article.title?.trim() || metaTitle,
          byline: article.byline?.trim() || metaAuthor,
          excerpt: article.excerpt?.trim() || undefined,
          content: article.content || "",
          textContent: article.textContent.trim(),
        };
      }
    } catch (e) {
      console.warn("Readability linkedom parse fallback:", e);
    }

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
      const container = document.querySelector(selector);
      if (container) {
        const paragraphs = Array.from(container.querySelectorAll("p, h2, h3, blockquote"))
          .map((el) => (el as unknown as { textContent?: string }).textContent?.trim() || "")
          .filter((t) => t.length > 25);

        if (paragraphs.length >= 2) {
          const joinedText = paragraphs.join("\n\n");
          if (joinedText.length >= 80) {
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
    const allParagraphs = Array.from(document.querySelectorAll("p"))
      .map((el) => (el as unknown as { textContent?: string }).textContent?.trim() || "")
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
    const bodyText = document.body?.textContent?.replace(/\s+/g, " ").trim();
    if (bodyText && bodyText.length >= 100) {
      return {
        title: metaTitle,
        byline: metaAuthor,
        content: `<p>${bodyText}</p>`,
        textContent: bodyText,
      };
    }

    return null;
  } catch (error) {
    console.error("Linkedom readability parsing error:", error);
    return null;
  }
}
