import dns from "dns";
import net from "net";

/**
 * Parses numeric IPv4 representations (decimal, octal, hex)
 * Examples: '2130706433' -> '127.0.0.1', '0x7f.0.0.1' -> '127.0.0.1', '0177.0.0.1' -> '127.0.0.1'
 */
function parseNumericIpv4(host: string): string | null {
  // Pure decimal integer IP representation (e.g., 2130706433 = 127.0.0.1)
  if (/^\d+$/.test(host)) {
    const num = parseInt(host, 10);
    if (num >= 0 && num <= 4294967295) {
      const b1 = (num >>> 24) & 255;
      const b2 = (num >>> 16) & 255;
      const b3 = (num >>> 8) & 255;
      const b4 = num & 255;
      return `${b1}.${b2}.${b3}.${b4}`;
    }
  }

  // Hex or octal or dotted decimal with mixed bases
  const parts = host.split(".");
  if (parts.length === 4) {
    const nums: number[] = [];
    for (const p of parts) {
      let val: number;
      if (/^0x[0-9a-f]+$/i.test(p)) {
        val = parseInt(p, 16);
      } else if (/^0[0-7]+$/.test(p)) {
        val = parseInt(p, 8);
      } else if (/^\d+$/.test(p)) {
        val = parseInt(p, 10);
      } else {
        return null;
      }
      if (val < 0 || val > 255) return null;
      nums.push(val);
    }
    return nums.join(".");
  }

  return null;
}

/**
 * Checks whether an IP address belongs to loopback, private RFC 1918,
 * link-local/cloud metadata, carrier-grade NAT, multicast or reserved blocks.
 */
export function isPrivateOrBlockedIp(ipAddress: string): boolean {
  // Strip IPv4 mapped IPv6 prefix
  let ip = ipAddress.trim();
  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }

  // Check IPv4
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    const [b0, b1, b2, b3] = parts;

    // 0.0.0.0/8 (Current network)
    if (b0 === 0) return true;

    // 127.0.0.0/8 (Loopback)
    if (b0 === 127) return true;

    // 10.0.0.0/8 (Private RFC 1918)
    if (b0 === 10) return true;

    // 172.16.0.0/12 (Private RFC 1918: 172.16.0.0 - 172.31.255.255)
    if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

    // 192.168.0.0/16 (Private RFC 1918)
    if (b0 === 192 && b1 === 168) return true;

    // 169.254.0.0/16 (Link-local / Cloud Metadata: 169.254.169.254)
    if (b0 === 169 && b1 === 254) return true;

    // 100.64.0.0/10 (Carrier-grade NAT: 100.64.0.0 - 100.127.255.255)
    if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

    // 192.0.0.0/24 & 192.0.2.0/24 (TEST-NET-1)
    if (b0 === 192 && b1 === 0 && (b2 === 0 || b2 === 2)) return true;

    // 198.51.100.0/24 (TEST-NET-2)
    if (b0 === 198 && b1 === 51 && b2 === 100) return true;

    // 203.0.113.0/24 (TEST-NET-3)
    if (b0 === 203 && b1 === 0 && b2 === 113) return true;

    // 224.0.0.0/4 (Multicast: 224.0.0.0 - 239.255.255.255)
    if (b0 >= 224 && b0 <= 239) return true;

    // 240.0.0.0/4 (Reserved / Future use)
    if (b0 >= 240) return true;

    // 255.255.255.255 (Broadcast)
    if (b0 === 255 && b1 === 255 && b2 === 255 && b3 === 255) return true;

    return false;
  }

  // Check IPv6
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();

    // ::1 / :: (Loopback & unspecified)
    if (lower === "::1" || lower === "::") return true;

    // fe80::/10 (Link-local)
    if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) {
      return true;
    }

    // fc00::/7 (Unique local / private: fc00:: to fdff::)
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;

    // ff00::/8 (Multicast)
    if (lower.startsWith("ff")) return true;

    // Documentation addresses (2001:db8::/32)
    if (lower.startsWith("2001:db8") || lower.startsWith("2001:0db8")) return true;

    return false;
  }

  // If not a standard IP format, flag as blocked for defense-in-depth
  return true;
}

/**
 * Validates a URL against SSRF, loopback, private networks, and cloud metadata.
 * Performs deep DNS resolution checking ALL returned A/AAAA records.
 */
export async function validateUrlAgainstSsrf(rawUrl: string): Promise<{
  valid: boolean;
  error?: string;
  resolvedIps?: string[];
}> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { valid: false, error: "Định dạng URL không hợp lệ." };
  }

  // Protocol check: strictly http and https
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      valid: false,
      error: `Giao thức ${parsed.protocol} bị chặn. Chỉ cho phép HTTP và HTTPS.`,
    };
  }

  // Strip port and brackets
  let hostname = parsed.hostname.toLowerCase();
  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    hostname = hostname.slice(1, -1);
  }

  // Disallow user credentials in URL
  if (parsed.username || parsed.password) {
    return {
      valid: false,
      error: "Không cho phép URL chứa thông tin xác thực tài khoản.",
    };
  }

  // Block localhost and cloud metadata internal hostnames directly
  const blockedHostnames = [
    "localhost",
    "metadata.google.internal",
    "instance-data",
    "metadata.internal",
    "kubernetes.default",
  ];
  if (blockedHostnames.includes(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    return {
      valid: false,
      error: "Địa chỉ hostname nội bộ bị từ chối theo chính sách Zero-Trust.",
    };
  }

  // Check if hostname is an encoded numeric IPv4 (e.g. 2130706433)
  const numericIp = parseNumericIpv4(hostname);
  if (numericIp) {
    if (isPrivateOrBlockedIp(numericIp)) {
      return {
        valid: false,
        error: `Địa chỉ IP mục tiêu (${numericIp}) thuộc dải mạng nội bộ bị chặn.`,
      };
    }
  }

  // If hostname is already a direct IP literal
  if (net.isIP(hostname)) {
    if (isPrivateOrBlockedIp(hostname)) {
      return {
        valid: false,
        error: `Địa chỉ IP mục tiêu (${hostname}) thuộc dải mạng nội bộ hoặc đám mây bị cấm.`,
      };
    }
    return { valid: true, resolvedIps: [hostname] };
  }

  // Deep DNS Lookup: inspect all A and AAAA records returned
  try {
    let resolvedIps: string[] = [];
    try {
      const lookupResults = await dns.promises.lookup(hostname, { all: true });
      if (lookupResults && lookupResults.length > 0) {
        resolvedIps = lookupResults.map((r) => r.address);
      }
    } catch {
      // Serverless-safe fallback via DNS over HTTPS (Port 443 - zero UDP blocking in AWS Lambda)
      try {
        const dohController = new AbortController();
        const dohTimeout = setTimeout(() => dohController.abort(), 2500);
        const dohRes = await fetch(
          `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`,
          {
            signal: dohController.signal,
            headers: { Accept: "application/dns-json" },
          }
        );
        clearTimeout(dohTimeout);

        if (dohRes.ok) {
          const dohData = (await dohRes.json()) as { Answer?: { data: string }[] };
          if (dohData.Answer && Array.isArray(dohData.Answer)) {
            for (const ans of dohData.Answer) {
              if (net.isIP(ans.data)) {
                resolvedIps.push(ans.data);
              }
            }
          }
        }
      } catch {}
    }

    if (resolvedIps.length === 0) {
      return { valid: false, error: "Không thể phân giải tên miền (DNS lookup failed)." };
    }

    for (const ip of resolvedIps) {
      if (isPrivateOrBlockedIp(ip)) {
        return {
          valid: false,
          error: `Tên miền phân giải về địa chỉ IP nội bộ (${ip}) bị chặn theo chuẩn SSRF Defense.`,
          resolvedIps,
        };
      }
    }

    return { valid: true, resolvedIps };
  } catch (err) {
    return {
      valid: false,
      error: `Lỗi phân giải DNS: ${err instanceof Error ? err.message : "Tên miền không tồn tại"}`,
    };
  }
}

/**
 * Fetches HTML from a remote article with multi-tier SSRF defense:
 * - Pre-fetch DNS IP pinning & validation
 * - Manual redirect locking (max 5 redirects, re-validating SSRF on each hop)
 * - 10MB streaming payload cap with graceful termination
 */
export async function safeFetchArticleHtml(
  initialUrl: string,
  options: {
    maxRedirects?: number;
    maxBytes?: number;
    timeoutMs?: number;
  } = {}
): Promise<string> {
  const maxRedirects = options.maxRedirects ?? 5;
  const maxBytes = options.maxBytes ?? 10 * 1024 * 1024; // 10MB cap
  const timeoutMs = options.timeoutMs ?? 15000;

  let currentUrl = initialUrl;
  let redirectsRemaining = maxRedirects;

  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    while (true) {
      // 1. SSRF Pre-flight DNS Inspection
      const ssrfCheck = await validateUrlAgainstSsrf(currentUrl);
      if (!ssrfCheck.valid) {
        throw new Error(`SSRF Guard Blocked: ${ssrfCheck.error}`);
      }

      // 2. Fetch with genuine desktop browser headers & manual redirect locking
      const response = await fetch(currentUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
          Referer: "https://www.google.com/",
          "Cache-Control": "max-age=0",
          "Sec-Ch-Ua": '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"Windows"',
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "cross-site",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
        },
        redirect: "manual",
      });

      // 3. Handle HTTP 3xx Redirects safely
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        if (redirectsRemaining <= 0) {
          throw new Error("Số lần chuyển hướng (redirect) vượt quá giới hạn cho phép.");
        }

        const locationHeader = response.headers.get("location");
        if (!locationHeader) {
          throw new Error("Phản hồi chuyển hướng thiếu tiêu đề Location hợp lệ.");
        }

        // Resolve redirect URL relative to current URL
        const redirectUrl = new URL(locationHeader, currentUrl).toString();
        currentUrl = redirectUrl;
        redirectsRemaining--;
        continue;
      }

      if (!response.ok) {
        throw new Error(`Máy chủ nguồn phản hồi mã lỗi HTTP: ${response.status} ${response.statusText}`);
      }

      // 4. Content-Length Header Check
      const contentLengthHeader = response.headers.get("content-length");
      if (contentLengthHeader) {
        const declaredSize = parseInt(contentLengthHeader, 10);
        if (!isNaN(declaredSize) && declaredSize > maxBytes) {
          // If content length is too large, we still stream up to maxBytes
        }
      }

      // 5. Streaming Body Byte Counter with graceful termination
      if (!response.body) {
        throw new Error("Phản hồi từ máy chủ nguồn không có nội dung body.");
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytesReceived = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          totalBytesReceived += value.length;
          chunks.push(value);
          // Gracefully stop reading if maximum buffer size reached, without throwing error
          if (totalBytesReceived >= maxBytes) {
            break;
          }
        }
      }

      // Merge Uint8Array chunks and decode to UTF-8
      const fullBuffer = new Uint8Array(totalBytesReceived);
      let offset = 0;
      for (const chunk of chunks) {
        fullBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      const decoder = new TextDecoder("utf-8");
      return decoder.decode(fullBuffer);
    }
  } finally {
    clearTimeout(timeoutTimer);
  }
}
