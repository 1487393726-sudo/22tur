/**
 * HTML 内容安全验证和清理工具
 * 用于防止 XSS 攻击和恶意脚本注入
 */

// 危险的 HTML 标签列表
const DANGEROUS_TAGS = [
  "script",
  "iframe",
  "object",
  "embed",
  "applet",
  "meta",
  "link",
  "style",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option",
];

// 危险的属性列表
const DANGEROUS_ATTRIBUTES = [
  "onclick",
  "onload",
  "onerror",
  "onmouseover",
  "onmouseout",
  "onmousemove",
  "onmouseenter",
  "onmouseleave",
  "onchange",
  "onfocus",
  "onblur",
  "onkeydown",
  "onkeyup",
  "onkeypress",
  "ondblclick",
  "oncontextmenu",
  "ondrag",
  "ondrop",
  "onwheel",
  "onscroll",
  "onresize",
  "onsubmit",
  "onreset",
  "onpaste",
  "oncopy",
  "oncut",
  "onwheel",
  "onanimationstart",
  "onanimationend",
  "ontransitionend",
];

// 允许的 HTML 标签列表
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  "blockquote",
  "pre",
  "code",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "td",
  "th",
  "img",
  "a",
  "div",
  "span",
  "section",
  "article",
  "header",
  "footer",
  "nav",
  "aside",
  "main",
];

// 允许的属性列表
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height"],
  div: ["class", "id"],
  span: ["class", "id"],
  p: ["class", "id"],
  table: ["class", "id", "border", "cellpadding", "cellspacing"],
  tr: ["class", "id"],
  td: ["class", "id", "colspan", "rowspan"],
  th: ["class", "id", "colspan", "rowspan"],
  "*": ["class", "id", "style"],
};

// 允许的 URL 协议
const ALLOWED_PROTOCOLS = ["http", "https", "mailto", "ftp"];

/**
 * 检查 URL 是否安全
 */
export function isSafeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, "http://localhost");
    const protocol = urlObj.protocol.replace(":", "");
    return ALLOWED_PROTOCOLS.includes(protocol);
  } catch {
    // 相对 URL
    return !url.startsWith("javascript:") && !url.startsWith("data:");
  }
}

/**
 * 清理 HTML 内容（基于正则表达式的简单实现）
 */
export function sanitizeHtml(html: string): string {
  try {
    let result = html;

    // 移除危险标签
    for (const tag of DANGEROUS_TAGS) {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, "gi");
      result = result.replace(regex, "");
      // 也移除自闭合标签
      const selfClosingRegex = new RegExp(`<${tag}[^>]*/>`, "gi");
      result = result.replace(selfClosingRegex, "");
    }

    // 移除危险属性
    for (const attr of DANGEROUS_ATTRIBUTES) {
      const regex = new RegExp(`\\s${attr}\\s*=\\s*["\']?[^"\'\\s>]*["\']?`, "gi");
      result = result.replace(regex, "");
    }

    // 移除 javascript: 协议
    result = result.replace(/javascript:/gi, "");

    // 移除 data:text/html 协议
    result = result.replace(/data:text\/html/gi, "");

    return result;
  } catch (error) {
    console.error("HTML 清理失败:", error);
    // 如果清理失败，返回纯文本
    return html.replace(/<[^>]*>/g, "");
  }
}

/**
 * 检查 HTML 内容是否包含恶意脚本
 */
export function containsMaliciousContent(html: string): boolean {
  const lowerHtml = html.toLowerCase();

  // 检查危险标签
  for (const tag of DANGEROUS_TAGS) {
    if (lowerHtml.includes(`<${tag}`)) {
      return true;
    }
  }

  // 检查危险属性
  for (const attr of DANGEROUS_ATTRIBUTES) {
    if (lowerHtml.includes(`${attr}=`)) {
      return true;
    }
  }

  // 检查 javascript: 协议
  if (lowerHtml.includes("javascript:")) {
    return true;
  }

  // 检查 data: 协议（可能包含恶意内容）
  if (lowerHtml.includes("data:text/html")) {
    return true;
  }

  // 检查 vbscript: 协议
  if (lowerHtml.includes("vbscript:")) {
    return true;
  }

  // 检查 expression() 函数
  if (lowerHtml.includes("expression(")) {
    return true;
  }

  // 检查 behavior: 属性
  if (lowerHtml.includes("behavior:")) {
    return true;
  }

  return false;
}

/**
 * 验证 HTML 文件内容
 */
export function validateHtmlContent(html: string): {
  valid: boolean;
  error?: string;
  sanitized?: string;
} {
  // 检查内容长度
  if (html.length > 10 * 1024 * 1024) {
    // 10MB
    return {
      valid: false,
      error: "HTML 文件过大（最大 10MB）",
    };
  }

  // 检查是否包含恶意内容
  if (containsMaliciousContent(html)) {
    return {
      valid: false,
      error: "HTML 文件包含恶意内容",
    };
  }

  // 清理 HTML
  const sanitized = sanitizeHtml(html);

  return {
    valid: true,
    sanitized,
  };
}

/**
 * 生成安全的 iframe 沙箱属性
 */
export function getIframeSandboxAttributes(): string[] {
  return [
    "allow-same-origin",
    "allow-scripts",
    "allow-forms",
    "allow-popups",
    "allow-presentation",
  ];
}

/**
 * 生成内容安全策略 (CSP) 头
 */
export function getContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

// 导出别名以兼容旧代码
export const validateFileContent = validateHtmlContent;
export const sanitizeHTML = sanitizeHtml;
