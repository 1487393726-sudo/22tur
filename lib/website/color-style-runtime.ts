import { colorStyles } from "@/lib/website/color-system";

export type WebsiteColorStyleId = keyof typeof colorStyles;

/**
 * 将指定的官网颜色风格应用到当前文档的 CSS 变量上
 * 仅在 data-route-type="website" 时生效
 */
export function applyWebsiteColorStyle(styleId: WebsiteColorStyleId) {
  if (typeof window === "undefined") return;

  const palette = colorStyles[styleId];
  if (!palette) return;

  const root = document.documentElement;
  const routeType = root.getAttribute("data-route-type");

  // 只影响官网路由
  if (routeType && routeType !== "website") return;

  // 1) 主/次/强调/中性色阶
  (["primary", "secondary", "accent", "neutral"] as const).forEach((key) => {
    const scale = palette[key] as Record<string, string>;
    Object.entries(scale).forEach(([level, value]) => {
      root.style.setProperty(`--color-${key}-${level}`, value);
    });
  });

  // 2) 状态色
  root.style.setProperty("--color-success", palette.success);
  root.style.setProperty("--color-warning", palette.warning);
  root.style.setProperty("--color-error", palette.error);
  root.style.setProperty("--color-info", palette.info);

  // 3) 背景 / 文本 / 边框
  root.style.setProperty("--color-bg-light", palette.background.light);
  root.style.setProperty("--color-bg-dark", palette.background.dark);
  root.style.setProperty("--color-bg-darker", palette.background.darker);

  root.style.setProperty("--color-text-primary", palette.text.primary);
  root.style.setProperty("--color-text-secondary", palette.text.secondary);
  root.style.setProperty("--color-text-tertiary", palette.text.tertiary);
  root.style.setProperty("--color-text-light", palette.text.light);

  root.style.setProperty("--color-border-light", palette.border.light);
  root.style.setProperty("--color-border-medium", palette.border.medium);
  root.style.setProperty("--color-border-dark", palette.border.dark);

  // 4) 渐变：与 color-system 的逻辑保持一致
  root.style.setProperty(
    "--gradient-primary",
    `linear-gradient(135deg, ${palette.primary[500]} 0%, ${palette.secondary[500]} 100%)`,
  );
  root.style.setProperty(
    "--gradient-secondary",
    `linear-gradient(135deg, ${palette.secondary[500]} 0%, ${palette.accent[500]} 100%)`,
  );
  root.style.setProperty(
    "--gradient-accent",
    `linear-gradient(135deg, ${palette.accent[500]} 0%, ${palette.primary[500]} 100%)`,
  );
  root.style.setProperty(
    "--gradient-subtle",
    `linear-gradient(135deg, ${palette.primary[50]} 0%, ${palette.secondary[50]} 100%)`,
  );
  root.style.setProperty(
    "--gradient-dark",
    `linear-gradient(135deg, ${palette.primary[900]} 0%, ${palette.primary[800]} 100%)`,
  );
}

