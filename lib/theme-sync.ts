/**
 * 主题同步工具
 * 用于同步颜色主题和深浅主题的切换
 */

export interface ThemeState {
  colorTheme: string; // 颜色主题 ID (purple-pink, blue-purple 等)
  darkTheme: string;  // 深浅主题 (dark, light, tokyo, solarized)
}

const THEME_STORAGE_KEY = 'theme-preference';
const DARK_THEME_STORAGE_KEY = 'theme';

/**
 * 获取当前主题状态
 */
export function getThemeState(): ThemeState {
  if (typeof window === 'undefined') {
    return { colorTheme: 'purple-pink', darkTheme: 'dark' };
  }

  return {
    colorTheme: localStorage.getItem(THEME_STORAGE_KEY) || 'purple-pink',
    darkTheme: localStorage.getItem(DARK_THEME_STORAGE_KEY) || 'dark',
  };
}

/**
 * 保存主题状态
 */
export function saveThemeState(state: ThemeState): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(THEME_STORAGE_KEY, state.colorTheme);
  localStorage.setItem(DARK_THEME_STORAGE_KEY, state.darkTheme);
}

/**
 * 应用颜色主题
 */
export function applyColorTheme(themeId: string): void {
  if (typeof document === 'undefined') return;

  const colorThemes = [
    'purple-pink',
    'blue-purple',
    'cyan-blue',
    'green-teal',
    'orange-red',
    'pink-rose',
  ];

  // 移除所有颜色主题类
  colorThemes.forEach((t) => {
    document.documentElement.classList.remove(`theme-${t}`);
  });

  // 添加新颜色主题类
  document.documentElement.classList.add(`theme-${themeId}`);

  // 更新 CSS 变量
  const gradientMap: Record<string, [string, string]> = {
    'purple-pink': ['#9333ea', '#db2777'],
    'blue-purple': ['#2563eb', '#9333ea'],
    'cyan-blue': ['#06b6d4', '#2563eb'],
    'green-teal': ['#16a34a', '#14b8a6'],
    'orange-red': ['#ea580c', '#dc2626'],
    'pink-rose': ['#db2777', '#e11d48'],
  };

  const [from, to] = gradientMap[themeId] || gradientMap['purple-pink'];
  document.documentElement.style.setProperty('--gradient-from', from);
  document.documentElement.style.setProperty('--gradient-to', to);

  // 触发事件
  window.dispatchEvent(
    new CustomEvent('colorThemeChanged', {
      detail: { colorTheme: themeId },
    })
  );
}

/**
 * 应用深浅主题 - 仅在官网应用
 */
export function applyDarkTheme(themeId: string): void {
  if (typeof document === 'undefined') return;

  // 只在官网路径应用主题，不影响系统和用户端
  if (typeof window !== 'undefined') {
    const isWebsite = !window.location.pathname.startsWith('/dashboard') && 
                     !window.location.pathname.startsWith('/admin') &&
                     !window.location.pathname.startsWith('/client') &&
                     !window.location.pathname.startsWith('/user');
    
    if (!isWebsite) {
      return;
    }
  }

  // 设置新的深浅主题到 html 元素
  document.documentElement.setAttribute('data-theme', themeId);
  
  // 同时更新 next-themes 的 data-theme 属性
  const htmlElement = document.documentElement;
  htmlElement.style.colorScheme = themeId === 'light' || themeId === 'solarized' ? 'light' : 'dark';

  // 触发事件
  window.dispatchEvent(
    new CustomEvent('darkThemeChanged', {
      detail: { darkTheme: themeId },
    })
  );
}

/**
 * 初始化主题系统 - 仅在官网初始化
 */
export function initializeThemes(): void {
  if (typeof window === 'undefined') return;

  // 只在官网路径初始化，不影响系统和用户端
  const isWebsite = !window.location.pathname.startsWith('/dashboard') && 
                   !window.location.pathname.startsWith('/admin') &&
                   !window.location.pathname.startsWith('/client') &&
                   !window.location.pathname.startsWith('/user');
  
  if (!isWebsite) {
    return;
  }

  const state = getThemeState();

  // 应用保存的主题
  applyColorTheme(state.colorTheme);
  applyDarkTheme(state.darkTheme);

  // 监听主题变化事件
  window.addEventListener('colorThemeChanged', (event: Event) => {
    const customEvent = event as CustomEvent;
    const newState = getThemeState();
    newState.colorTheme = customEvent.detail.colorTheme;
    saveThemeState(newState);
  });

  window.addEventListener('darkThemeChanged', (event: Event) => {
    const customEvent = event as CustomEvent;
    const newState = getThemeState();
    newState.darkTheme = customEvent.detail.darkTheme;
    saveThemeState(newState);
  });
}

/**
 * 同时切换两个主题
 */
export function switchThemes(colorTheme: string, darkTheme: string): void {
  const state: ThemeState = { colorTheme, darkTheme };
  saveThemeState(state);
  applyColorTheme(colorTheme);
  applyDarkTheme(darkTheme);
}
