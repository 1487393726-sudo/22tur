'use client';

import React, { useState, useEffect } from 'react';
import { colorStyles } from '@/lib/website/color-system';

type ColorStyle = keyof typeof colorStyles;

interface ColorStyleSwitcherProps {
  onStyleChange?: (style: ColorStyle) => void;
  defaultStyle?: ColorStyle;
}

export const ColorStyleSwitcher: React.FC<ColorStyleSwitcherProps> = ({
  onStyleChange,
  defaultStyle = 'website-default',
}) => {
  const [currentStyle, setCurrentStyle] = useState<ColorStyle>(defaultStyle);
  const [isOpen, setIsOpen] = useState(false);

  const styles: { id: ColorStyle; name: string; description: string }[] = [
    { id: 'website-default', name: '官网默认', description: '深蓝色系，与官网主题对齐' },
    { id: 'black-white', name: '黑白专业', description: '干净、专业的黑白配色' },
    { id: 'blue', name: '蓝色专业', description: '深蓝色系，商务风格' },
    { id: 'green', name: '绿色生态', description: '绿色系，生态友好' },
    { id: 'purple', name: '紫色创意', description: '紫色系，创意十足' },
    { id: 'red', name: '红色现代', description: '红色系，现代活力' },
    { id: 'cyan', name: '青色科技', description: '青色系，科技感强' },
  ];

  useEffect(() => {
    // 从 localStorage 读取保存的风格
    const saved = localStorage.getItem('website-color-style') as ColorStyle;
    if (saved && saved in colorStyles) {
      setCurrentStyle(saved);
      applyStyle(saved);
    } else {
      applyStyle(defaultStyle);
    }
  }, []);

  const applyStyle = (style: ColorStyle) => {
    const palette = colorStyles[style];
    const root = document.documentElement;

    // 应用主色调
    Object.entries(palette.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });

    // 应用次色调
    Object.entries(palette.secondary).forEach(([key, value]) => {
      root.style.setProperty(`--color-secondary-${key}`, value);
    });

    // 应用强调色
    Object.entries(palette.accent).forEach(([key, value]) => {
      root.style.setProperty(`--color-accent-${key}`, value);
    });

    // 应用中性色
    Object.entries(palette.neutral).forEach(([key, value]) => {
      root.style.setProperty(`--color-neutral-${key}`, value);
    });

    // 应用状态色
    root.style.setProperty('--color-success', palette.success);
    root.style.setProperty('--color-warning', palette.warning);
    root.style.setProperty('--color-error', palette.error);
    root.style.setProperty('--color-info', palette.info);

    // 应用背景色
    root.style.setProperty('--color-bg-light', palette.background.light);
    root.style.setProperty('--color-bg-dark', palette.background.dark);
    root.style.setProperty('--color-bg-darker', palette.background.darker);

    // 应用文本色
    root.style.setProperty('--color-text-primary', palette.text.primary);
    root.style.setProperty('--color-text-secondary', palette.text.secondary);
    root.style.setProperty('--color-text-tertiary', palette.text.tertiary);
    root.style.setProperty('--color-text-light', palette.text.light);

    // 应用边框色
    root.style.setProperty('--color-border-light', palette.border.light);
    root.style.setProperty('--color-border-medium', palette.border.medium);
    root.style.setProperty('--color-border-dark', palette.border.dark);
  };

  const handleStyleChange = (style: ColorStyle) => {
    setCurrentStyle(style);
    applyStyle(style);
    localStorage.setItem('website-color-style', style);
    onStyleChange?.(style);
    setIsOpen(false);
  };

  return (
    <div className="color-style-switcher">
      <button
        className="color-style-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        title="切换颜色风格"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="1" />
          <path d="M12 1v6m0 6v6" />
          <path d="M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24" />
          <path d="M1 12h6m6 0h6" />
          <path d="M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
        </svg>
      </button>

      {isOpen && (
        <div className="color-style-switcher-menu">
          <div className="color-style-switcher-header">
            <h3>选择颜色风格</h3>
            <button
              className="color-style-switcher-close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="color-style-switcher-grid">
            {styles.map((style) => (
              <button
                key={style.id}
                className={`color-style-switcher-item ${
                  currentStyle === style.id ? 'active' : ''
                }`}
                onClick={() => handleStyleChange(style.id)}
              >
                <div className="color-style-switcher-preview">
                  <div
                    className="color-style-switcher-color"
                    style={{
                      backgroundColor: colorStyles[style.id].primary[500],
                    }}
                  />
                  <div
                    className="color-style-switcher-color"
                    style={{
                      backgroundColor: colorStyles[style.id].secondary[500],
                    }}
                  />
                  <div
                    className="color-style-switcher-color"
                    style={{
                      backgroundColor: colorStyles[style.id].accent[500],
                    }}
                  />
                </div>
                <div className="color-style-switcher-info">
                  <div className="color-style-switcher-name">{style.name}</div>
                  <div className="color-style-switcher-description">
                    {style.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .color-style-switcher {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
        }

        .color-style-switcher-button {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background-color: var(--color-primary-500);
          color: var(--color-text-light);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }

        .color-style-switcher-button:hover {
          background-color: var(--color-primary-600);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
          transform: scale(1.1);
        }

        .color-style-switcher-menu {
          position: absolute;
          bottom: 4rem;
          right: 0;
          background-color: var(--color-bg-light);
          border: 1px solid var(--color-border-light);
          border-radius: 0.75rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          width: 320px;
          max-height: 500px;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .color-style-switcher-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--color-border-light);
        }

        .color-style-switcher-header h3 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .color-style-switcher-close {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-tertiary);
          font-size: 1.25rem;
          padding: 0;
          width: 1.5rem;
          height: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .color-style-switcher-close:hover {
          color: var(--color-text-primary);
        }

        .color-style-switcher-grid {
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .color-style-switcher-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border: 2px solid transparent;
          border-radius: 0.5rem;
          background: none;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .color-style-switcher-item:hover {
          background-color: var(--color-bg-dark);
          border-color: var(--color-border-light);
        }

        .color-style-switcher-item.active {
          background-color: var(--color-primary-50);
          border-color: var(--color-primary-500);
        }

        .color-style-switcher-preview {
          display: flex;
          gap: 0.25rem;
          flex-shrink: 0;
        }

        .color-style-switcher-color {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 0.25rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .color-style-switcher-info {
          flex: 1;
          min-width: 0;
        }

        .color-style-switcher-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 0.25rem;
        }

        .color-style-switcher-description {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
          line-height: 1.3;
        }

        @media (max-width: 640px) {
          .color-style-switcher {
            bottom: 1rem;
            right: 1rem;
          }

          .color-style-switcher-button {
            width: 2.5rem;
            height: 2.5rem;
          }

          .color-style-switcher-menu {
            width: 280px;
          }
        }
      `}</style>
    </div>
  );
};

export default ColorStyleSwitcher;
