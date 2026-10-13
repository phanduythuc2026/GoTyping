import { safeFetchArticleHtml } from "./ssrf-guard";

/**
 * Fetches HTML from article URL with Zero-Trust SSRF defense,
 * IP pinning, manual redirect validation, and a 3MB streaming limit.
 */
export async function fetchArticleHtml(
  url: string,
  timeoutMs: number = 15000
): Promise<string> {
  return safeFetchArticleHtml(url, {
    maxRedirects: 5,
    maxBytes: 10 * 1024 * 1024,
    timeoutMs,
  });
}
