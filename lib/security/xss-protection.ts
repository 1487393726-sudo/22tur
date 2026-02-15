/**
 * XSS 防护工具
 * 提供输入清理、输出编码、内容安全策略等功能
 */

/**
 * HTML 实体编码映射
 */
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * HTML 实体解码映射
 */
const HTML_DECODE_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#x2F;": "/",
  "&#x60;": "`",
  "&#x3D;": "=",
  "&#39;": "'",
  "&apos;": "'",
};

/**
 * HTML 实体编码
 */
export function encodeHtml(str: string): string {
  if (!str) return "";
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * HTML 实体解码
 */
export function decodeHtml(str: string): string {
  if (!str) return "";
  return str.replace(
    /&(?:amp|lt|gt|quot|#x27|#x2F|#x60|#x3D|#39|apos);/g,
    (entity) => HTML_DECODE_ENTITIES[entity] || entity
  );
}

/**
 * JavaScript 字符串编码
 */
export function encodeJs(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\f/g, "\\f")
    .replace(/</g, "\\x3c")
    .replace(/>/g, "\\x3e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/**
 * URL 编码
 */
export function encodeUrl(str: string): string {
  if (!str) return "";
  return encodeURIComponent(str);
}

/**
 * CSS 编码
 */
export function encodeCss(str: string): string {
  if (!str) return "";
  return str.replace(/[<>"'`\\]/g, (char) => `\\${char.charCodeAt(0).toString(16)} `);
}

/**
 * 清理用户输入
 */
export function sanitizeInput(input: string, options: {
  allowHtml?: boolean;
  maxLength?: number;
  trim?: boolean;
  toLowerCase?: boolean;
} = {}): string {
  if (!input) return "";

  let result = input;

  // 移除空字节
  result = result.replace(/\0/g, "");

  // 移除控制字符（保留换行和制表符）
  result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 修剪空白
  if (options.trim !== false) {
    result = result.trim();
  }

  // 转小写
  if (options.toLowerCase) {
    result = result.toLowerCase();
  }

  // 限制长度
  if (options.maxLength && result.length > options.maxLength) {
    result = result.substring(0, options.maxLength);
  }

  // HTML 编码（如果不允许 HTML）
  if (!options.allowHtml) {
    result = encodeHtml(result);
  }

  return result;
}

/**
 * 清理 HTML 内容（保留安全标签）
 */
export function sanitizeHtml(html: string, options: {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  allowedProtocols?: string[];
} = {}): string {
  if (!html) return "";

  const {
    allowedTags = ["p", "br", "b", "i", "u", "strong", "em", "a", "ul", "ol", "li", "span", "div"],
    allowedAttributes = {
      a: ["href", "title", "target"],
      img: ["src", "alt", "title", "width", "height"],
      span: ["class"],
      div: ["class"],
    },
    allowedProtocols = ["http", "https", "mailto"],
  } = options;

  // 移除脚本标签及其内容
  let result = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // 移除样式标签及其内容
  result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // 移除事件处理器属性
  result = result.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");
  result = result.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, "");

  // 移除 javascript: 和 vbscript: 协议
  result = result.replace(/javascript:/gi, "");
  result = result.replace(/vbscript:/gi, "");
  result = result.replace(/data:\s*text\/html/gi, "");

  // 移除不允许的标签
  const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  result = result.replace(tagPattern, (match, tagName) => {
    const tag = tagName.toLowerCase();
    if (allowedTags.includes(tag)) {
      // 清理属性
      return cleanTagAttributes(match, tag, allowedAttributes[tag] || [], allowedProtocols);
    }
    return "";
  });

  return result;
}

/**
 * 清理标签属性
 */
function cleanTagAttributes(
  tag: string,
  tagName: string,
  allowedAttrs: string[],
  allowedProtocols: string[]
): string {
  // 如果是闭合标签，直接返回
  if (tag.startsWith("</")) {
    return `</${tagName}>`;
  }

  // 提取属性
  const attrPattern = /\s+([a-z][a-z0-9-]*)\s*=\s*["']([^"']*)["']/gi;
  const attrs: string[] = [];
  let match;

  while ((match = attrPattern.exec(tag)) !== null) {
    const [, attrName, attrValue] = match;
    const attr = attrName.toLowerCase();

    if (allowedAttrs.includes(attr)) {
      // 检查 URL 属性的协议
      if (["href", "src", "action"].includes(attr)) {
        const protocol = attrValue.split(":")[0].toLowerCase();
        if (attrValue.includes(":") && !allowedProtocols.includes(protocol)) {
          continue;
        }
      }
      attrs.push(`${attr}="${encodeHtml(attrValue)}"`);
    }
  }

  // 检查是否是自闭合标签
  const selfClosing = tag.endsWith("/>");
  const attrStr = attrs.length > 0 ? " " + attrs.join(" ") : "";

  return selfClosing ? `<${tagName}${attrStr} />` : `<${tagName}${attrStr}>`;
}

/**
 * 验证 URL 是否安全
 */
export function isUrlSafe(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url, "http://localhost");

    // 检查协议
    const safeProtocols = ["http:", "https:", "mailto:", "tel:"];
    if (!safeProtocols.includes(parsed.protocol)) {
      return false;
    }

    // 检查是否包含危险字符
    if (url.includes("javascript:") || url.includes("vbscript:") || url.includes("data:")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * 清理 URL
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";

  // 移除危险协议
  let result = url
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/data:\s*text\/html/gi, "");

  // 编码特殊字符
  try {
    const parsed = new URL(result, "http://localhost");
    return parsed.href;
  } catch {
    return encodeUrl(result);
  }
}

/**
 * 生成 CSP（内容安全策略）头
 */
export function generateCspHeader(options: {
  defaultSrc?: string[];
  scriptSrc?: string[];
  styleSrc?: string[];
  imgSrc?: string[];
  fontSrc?: string[];
  connectSrc?: string[];
  frameSrc?: string[];
  objectSrc?: string[];
  mediaSrc?: string[];
  reportUri?: string;
  upgradeInsecureRequests?: boolean;
} = {}): string {
  const directives: string[] = [];

  const {
    defaultSrc = ["'self'"],
    scriptSrc = ["'self'"],
    styleSrc = ["'self'", "'unsafe-inline'"],
    imgSrc = ["'self'", "data:", "https:"],
    fontSrc = ["'self'"],
    connectSrc = ["'self'"],
    frameSrc = ["'none'"],
    objectSrc = ["'none'"],
    mediaSrc = ["'self'"],
    reportUri,
    upgradeInsecureRequests = true,
  } = options;

  directives.push(`default-src ${defaultSrc.join(" ")}`);
  directives.push(`script-src ${scriptSrc.join(" ")}`);
  directives.push(`style-src ${styleSrc.join(" ")}`);
  directives.push(`img-src ${imgSrc.join(" ")}`);
  directives.push(`font-src ${fontSrc.join(" ")}`);
  directives.push(`connect-src ${connectSrc.join(" ")}`);
  directives.push(`frame-src ${frameSrc.join(" ")}`);
  directives.push(`object-src ${objectSrc.join(" ")}`);
  directives.push(`media-src ${mediaSrc.join(" ")}`);

  if (upgradeInsecureRequests) {
    directives.push("upgrade-insecure-requests");
  }

  if (reportUri) {
    directives.push(`report-uri ${reportUri}`);
  }

  return directives.join("; ");
}

/**
 * 生成安全响应头
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": generateCspHeader(),
  };
}

/**
 * XSS 防护中间件配置
 */
export const xssProtectionConfig = {
  // 需要清理的请求体字段
  sanitizeFields: ["name", "title", "description", "content", "comment", "message"],

  // 允许 HTML 的字段
  htmlFields: ["content", "description"],

  // 最大输入长度
  maxLengths: {
    name: 100,
    title: 200,
    description: 5000,
    content: 50000,
    comment: 2000,
    message: 5000,
  } as Record<string, number>,
};

export default {
  encodeHtml,
  decodeHtml,
  encodeJs,
  encodeUrl,
  encodeCss,
  sanitizeInput,
  sanitizeHtml,
  sanitizeUrl,
  isUrlSafe,
  generateCspHeader,
  getSecurityHeaders,
};
