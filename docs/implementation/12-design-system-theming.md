# Design System & Tailwind CSS Theming Architecture

## Overview

A comprehensive design system using Tailwind CSS with support for:
- **Multiple themes** (Light, Dark, Custom per tenant)
- **Design tokens** (colors, spacing, typography, shadows)
- **Component layer** (reusable UI components)
- **Dynamic runtime theming** (admin settings integration)
- **Swiss/European design aesthetic**

---

## Part 1: Tailwind CSS Base Configuration

### tailwind.config.ts Structure

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './index.html',
  ],
  
  theme: {
    extend: {
      // Design Tokens
      colors: DesignTokens.colors,
      spacing: DesignTokens.spacing,
      fontSize: DesignTokens.fontSize,
      fontWeight: DesignTokens.fontWeight,
      borderRadius: DesignTokens.borderRadius,
      boxShadow: DesignTokens.shadows,
      fontFamily: DesignTokens.fontFamily,
      
      // Gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
        'gradient-secondary': 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%)',
      },
    },
  },
  
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  
  darkMode: ['class', '[data-theme="dark"]'],
} satisfies Config;
```

### Design Tokens Definition

```typescript
// src/shared/design/design-tokens.ts

export const DesignTokens = {
  // Color Palette
  colors: {
    // Primary Colors (Brand)
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Primary
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c3d66',
      950: '#051e3e',
    },
    
    // Secondary Colors
    secondary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Secondary
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#145231',
      950: '#052e16',
    },
    
    // Accent Colors
    accent: {
      50: '#fef3c7',
      100: '#fde68a',
      200: '#fcd34d',
      300: '#fbbf24',
      400: '#f59e0b',
      500: '#f97316', // Accent (Orange)
      600: '#ea580c',
      700: '#c2410c',
      800: '#92400e',
      900: '#78350f',
    },
    
    // Status Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    
    // Neutral (Grayscale)
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
    
    // Semantic Aliases
    background: {
      light: '#ffffff',
      'light-alt': '#f8f9fa',
      dark: '#0f172a',
      'dark-alt': '#1e293b',
    },
    
    border: {
      light: '#e2e8f0',
      dark: '#334155',
    },
    
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      light: '#f3f4f6',
      'light-secondary': '#d1d5db',
    },
  },
  
  // Spacing Scale (8px base)
  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem',  // 8px
    3: '0.75rem', // 12px
    4: '1rem',    // 16px
    5: '1.25rem', // 20px
    6: '1.5rem',  // 24px
    7: '1.75rem', // 28px
    8: '2rem',    // 32px
    10: '2.5rem', // 40px
    12: '3rem',   // 48px
    16: '4rem',   // 64px
    20: '5rem',   // 80px
    24: '6rem',   // 96px
    32: '8rem',   // 128px
  },
  
  // Typography
  fontSize: {
    // xs: 12px / 16px
    xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.5px' }],
    // sm: 14px / 20px
    sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.25px' }],
    // base: 16px / 24px
    base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0px' }],
    // lg: 18px / 28px
    lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0px' }],
    // xl: 20px / 28px
    xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.5px' }],
    // 2xl: 24px / 32px
    '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.5px' }],
    // 3xl: 30px / 36px
    '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-1px' }],
    // 4xl: 36px / 40px
    '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-1px' }],
    // 5xl: 48px / 48px
    '5xl': ['3rem', { lineHeight: '3rem', letterSpacing: '-1.5px' }],
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  fontFamily: {
    // Primary font: Inter (clean, modern)
    sans: ['Inter', ...defaultTheme.fontFamily.sans],
    // Secondary font: Georgia (serifs for emphasis)
    serif: ['Georgia', ...defaultTheme.fontFamily.serif],
    // Monospace: Fira Code
    mono: ['Fira Code', ...defaultTheme.fontFamily.mono],
  },
  
  // Border Radius (Swiss design: subtle)
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px - small elements
    base: '0.5rem',  // 8px - default
    md: '0.75rem',   // 12px - cards, buttons
    lg: '1rem',      // 16px - large components
    xl: '1.5rem',    // 24px - modals, popovers
    full: '9999px',  // Full circular (pills)
  },
  
  // Shadows (Swiss: minimal, refined)
  shadows: {
    none: 'none',
    
    // Subtle shadows
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    
    // Elevated shadows (for modals, cards)
    elevated: '0 15px 30px -10px rgba(0, 0, 0, 0.15)',
    
    // Focus shadows
    'focus-primary': '0 0 0 3px rgba(14, 165, 233, 0.1)',
    'focus-accent': '0 0 0 3px rgba(249, 115, 22, 0.1)',
  },
} as const;

export type DesignTokens = typeof DesignTokens;
```

---

## Part 2: Theme System Architecture

### Theme Definition

```typescript
// src/shared/design/theme.types.ts

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ThemeScope = 'system' | 'tenant' | 'user';

export interface ThemeColors {
  // Primary brand color
  primary: string; // hex
  'primary-light': string;
  'primary-dark': string;
  
  // Secondary brand color
  secondary: string;
  'secondary-light': string;
  'secondary-dark': string;
  
  // Accent
  accent: string;
  
  // Status
  success: string;
  warning: string;
  danger: string;
  info: string;
  
  // Backgrounds
  background: string;
  'background-secondary': string;
  surface: string;
  'surface-hover': string;
  
  // Text
  'text-primary': string;
  'text-secondary': string;
  'text-tertiary': string;
  'text-inverse': string;
  
  // Borders
  border: string;
  'border-light': string;
  'border-dark': string;
  
  // Divider
  divider: string;
}

export interface Theme {
  // Identity
  id: string;
  name: string;
  mode: 'light' | 'dark';
  
  // Colors
  colors: ThemeColors;
  
  // Typography
  typography: {
    fontFamily: {
      sans: string;
      serif: string;
      mono: string;
    };
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    letterSpacing: Record<string, string>;
    lineHeight: Record<string, string>;
  };
  
  // Spacing
  spacing: Record<string, string>;
  
  // Components
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  
  // Transitions
  transitions: {
    fast: string;
    base: string;
    slow: string;
  };
  
  // Metadata
  scope: ThemeScope;
  isCustom: boolean;
  isActive: boolean;
}

export interface SystemTheme extends Theme {
  scope: 'system';
  variants: {
    light: Theme;
    dark: Theme;
  };
}

export interface TenantTheme extends Theme {
  scope: 'tenant';
  tenantId: string;
}

export interface UserTheme extends Theme {
  scope: 'user';
  userId: string;
  tenantId: string;
}
```

### Theme Provider Setup

```typescript
// src/shared/design/theme-context.tsx

import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  updateThemeColors: (colors: Partial<ThemeColors>) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = function({
  children,
  defaultTheme,
  userThemeService,
}: {
  children: React.ReactNode;
  defaultTheme: Theme;
  userThemeService: IUserThemeService;
}): React.ReactElement {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mode, setMode] = useState<ThemeMode>('auto');
  const [isLoading, setIsLoading] = useState(true);

  // Load user preferences on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const userTheme = await userThemeService.getUserTheme();
        if (userTheme) {
          setTheme(userTheme);
          setMode(userTheme.mode === 'light' ? 'light' : 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [userThemeService]);

  // Apply theme to DOM
  useEffect(() => {
    applyTheme(theme, mode);
  }, [theme, mode]);

  const updateThemeColors = (colors: Partial<ThemeColors>) => {
    const updatedTheme = {
      ...theme,
      colors: { ...theme.colors, ...colors },
    };
    setTheme(updatedTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, updateThemeColors, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = function(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Apply theme to DOM
const applyTheme = function(theme: Theme, mode: ThemeMode): void {
  const root = document.documentElement;
  const isDark = mode === 'dark' || 
    (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Set theme attribute
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  root.classList.toggle('dark', isDark);

  // Set CSS variables for dynamic theming
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  // Store preference
  localStorage.setItem('theme-mode', mode);
};
```

---

## Part 3: Pre-built Themes

### System Themes

```typescript
// src/shared/design/themes/system-themes.ts

export const SystemThemes = {
  light: {
    id: 'system-light',
    name: 'System Light',
    mode: 'light' as const,
    colors: {
      primary: '#0ea5e9',
      'primary-light': '#38bdf8',
      'primary-dark': '#0284c7',
      
      secondary: '#22c55e',
      'secondary-light': '#4ade80',
      'secondary-dark': '#16a34a',
      
      accent: '#f97316',
      
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
      
      background: '#ffffff',
      'background-secondary': '#f8f9fa',
      surface: '#ffffff',
      'surface-hover': '#f3f4f6',
      
      'text-primary': '#1f2937',
      'text-secondary': '#6b7280',
      'text-tertiary': '#9ca3af',
      'text-inverse': '#ffffff',
      
      border: '#e5e7eb',
      'border-light': '#f3f4f6',
      'border-dark': '#d1d5db',
      
      divider: '#e5e7eb',
    },
    typography: {
      fontFamily: {
        sans: 'Inter',
        serif: 'Georgia',
        mono: 'Fira Code',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0em',
        wide: '0.02em',
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
        loose: '2',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.25rem',
      base: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    transitions: {
      fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    scope: 'system' as const,
    isCustom: false,
    isActive: true,
  } as const,

  dark: {
    id: 'system-dark',
    name: 'System Dark',
    mode: 'dark' as const,
    colors: {
      primary: '#38bdf8',
      'primary-light': '#7dd3fc',
      'primary-dark': '#0284c7',
      
      secondary: '#4ade80',
      'secondary-light': '#86efac',
      'secondary-dark': '#16a34a',
      
      accent: '#fb923c',
      
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#f87171',
      info: '#60a5fa',
      
      background: '#0f172a',
      'background-secondary': '#1e293b',
      surface: '#1e293b',
      'surface-hover': '#334155',
      
      'text-primary': '#f1f5f9',
      'text-secondary': '#cbd5e1',
      'text-tertiary': '#94a3b8',
      'text-inverse': '#0f172a',
      
      border: '#334155',
      'border-light': '#475569',
      'border-dark': '#1e293b',
      
      divider: '#334155',
    },
    // ... rest of dark theme
  } as const,
} as const;
```

---

## Part 4: Dynamic Admin Theme Customization

### CSS Variable Injection

```typescript
// src/shared/design/theme-customizer.ts

export const ThemeCustomizer = function(
  settingsService: ISettingsService,
  eventEmitter: IEventEmitter,
) {
  const applyCustomColors = async (
    tenantId: string,
    colors: Partial<ThemeColors>,
  ): Promise<void> => {
    // Store in settings
    await settingsService.updateSetting(
      tenantId,
      'theme.custom-colors',
      colors,
    );

    // Apply to DOM immediately
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Broadcast to other tabs/windows
    await eventEmitter.emit('ThemeCustomized', {
      tenantId,
      colors,
    });
  };

  const getCustomColors = async (tenantId: string): Promise<Partial<ThemeColors>> => {
    return settingsService.getSetting(tenantId, 'theme.custom-colors') || {};
  };

  const resetToDefault = async (tenantId: string): Promise<void> => {
    // Reset in settings
    await settingsService.updateSetting(
      tenantId,
      'theme.custom-colors',
      {},
    );

    // Reload theme
    location.reload();
  };

  return {
    applyCustomColors,
    getCustomColors,
    resetToDefault,
  };
};
```

### CSS Variables in Global Stylesheet

```css
/* src/styles/theme.css */

:root {
  /* Primary Colors */
  --color-primary: #0ea5e9;
  --color-primary-light: #38bdf8;
  --color-primary-dark: #0284c7;
  
  /* Secondary Colors */
  --color-secondary: #22c55e;
  --color-secondary-light: #4ade80;
  --color-secondary-dark: #16a34a;
  
  /* Accent */
  --color-accent: #f97316;
  
  /* Status */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;
  
  /* Backgrounds */
  --color-background: #ffffff;
  --color-background-secondary: #f8f9fa;
  --color-surface: #ffffff;
  --color-surface-hover: #f3f4f6;
  
  /* Text */
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  --color-text-inverse: #ffffff;
  
  /* Borders */
  --color-border: #e5e7eb;
  --color-border-light: #f3f4f6;
  --color-border-dark: #d1d5db;
  
  /* Divider */
  --color-divider: #e5e7eb;
  
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark mode */
[data-theme="dark"] {
  --color-primary: #38bdf8;
  --color-primary-light: #7dd3fc;
  --color-primary-dark: #0284c7;
  
  /* ... rest of dark variables ... */
}

/* System respects prefers-color-scheme */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --color-primary: #38bdf8;
    /* ... */
  }
}
```

---

## Part 5: Component Design System Layer

### Base Component Patterns

```typescript
// src/shared/components/button.tsx

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-base px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: `
          bg-primary text-white hover:bg-primary-dark 
          active:bg-primary-dark focus:ring-primary
          dark:bg-primary-light dark:text-primary-dark
        `,
        secondary: `
          bg-secondary text-white hover:bg-secondary-dark 
          active:bg-secondary-dark focus:ring-secondary
          dark:bg-secondary-light dark:text-secondary-dark
        `,
        accent: `
          bg-accent text-white hover:brightness-110 
          focus:ring-accent
        `,
        outline: `
          border-2 border-primary text-primary 
          hover:bg-primary hover:text-white
          dark:border-primary-light dark:text-primary-light
        `,
        ghost: `
          text-primary hover:bg-gray-100 
          dark:text-primary-light dark:hover:bg-gray-800
        `,
        danger: `
          bg-danger text-white hover:brightness-110 
          focus:ring-danger
        `,
      },
      
      size: {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-2.5 text-lg',
        xl: 'px-6 py-3 text-xl',
      },
      
      fullWidth: {
        true: 'w-full',
      },
      
      loading: {
        true: 'cursor-wait opacity-70',
      },
    },
    
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean;
    icon?: React.ReactNode;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, isLoading, icon, ...props }, ref) => (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, fullWidth, loading: isLoading, className })}
      {...props}
    >
      {isLoading ? (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {props.children}
    </button>
  ),
);
```

### Card Component

```typescript
// src/shared/components/card.tsx

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  hoverable?: boolean;
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevated, hoverable, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg bg-surface text-text-primary transition-all duration-200',
        
        // Variants
        variant === 'default' && 'shadow-base border border-border',
        variant === 'outlined' && 'border border-border',
        variant === 'elevated' && 'shadow-lg',
        
        // Interactive
        hoverable && 'hover:shadow-md hover:border-primary cursor-pointer',
        
        className,
      )}
      {...props}
    />
  ),
);
```

### Form Components

```typescript
// src/shared/components/form-input.tsx

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  isRequired?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, helperText, error, icon, isRequired, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
          {isRequired && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && <span className="absolute left-3 top-3 text-text-secondary">{icon}</span>}
        
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2 rounded-base border border-border',
            'bg-background text-text-primary placeholder-text-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all duration-200',
            'dark:bg-surface dark:border-border-dark',
            error && 'border-danger focus:ring-danger',
            icon && 'pl-10',
            className,
          )}
          {...props}
        />
      </div>
      
      {error && <p className="text-sm text-danger mt-1">{error}</p>}
      {helperText && !error && <p className="text-sm text-text-tertiary mt-1">{helperText}</p>}
    </div>
  ),
);
```

---

## Part 6: Tailwind Config with Admin Settings Integration

```typescript
// src/shared/design/tailwind-dynamic-config.ts

export const generateTailwindConfig = (customColors?: Partial<ThemeColors>): Config => {
  const baseColors = DesignTokens.colors;
  const finalColors = customColors
    ? { ...baseColors, ...customColors }
    : baseColors;

  return {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    
    theme: {
      extend: {
        colors: finalColors,
        spacing: DesignTokens.spacing,
        fontSize: DesignTokens.fontSize,
        fontFamily: DesignTokens.fontFamily,
        borderRadius: DesignTokens.borderRadius,
        boxShadow: DesignTokens.shadows,
      },
    },
    
    darkMode: ['class', '[data-theme="dark"]'],
  };
};
```

---

## Part 7: Example: Complete Theme UI Component

```typescript
// src/domains/settings/presentation/theme-customizer-component.tsx

export const ThemeCustomizerComponent = function(): React.ReactElement {
  const { theme, updateThemeColors } = useTheme();
  const themeCustomizer = useThemeCustomizer();
  const { tenantId } = useTenant();

  const [colors, setColors] = useState<Partial<ThemeColors>>(theme.colors);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
    if (preview) {
      updateThemeColors({ [key]: value });
    }
  };

  const handleSave = async () => {
    await themeCustomizer.applyCustomColors(tenantId, colors);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = async () => {
    await themeCustomizer.resetToDefault(tenantId);
    setColors(theme.colors);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Theme Customizer</h1>
        <p className="text-text-secondary">Customize your organization's brand colors</p>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Primary Color */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Primary Color</h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <ColorPicker
                value={colors.primary || theme.colors.primary}
                onChange={(color) => handleColorChange('primary', color)}
              />
            </div>
            <div
              className="w-20 h-20 rounded-lg shadow-base border-4 border-white"
              style={{ backgroundColor: colors.primary || theme.colors.primary }}
            />
          </div>
        </Card>

        {/* Secondary Color */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Secondary Color</h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <ColorPicker
                value={colors.secondary || theme.colors.secondary}
                onChange={(color) => handleColorChange('secondary', color)}
              />
            </div>
            <div
              className="w-20 h-20 rounded-lg shadow-base border-4 border-white"
              style={{ backgroundColor: colors.secondary || theme.colors.secondary }}
            />
          </div>
        </Card>

        {/* ... more colors ... */}
      </div>

      {/* Preview */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Live Preview</h3>
          <Toggle
            checked={preview}
            onChange={setPreview}
            label={preview ? 'Enabled' : 'Disabled'}
          />
        </div>

        {preview && (
          <div className="grid grid-cols-2 gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="accent">Accent Button</Button>
            <Button variant="outline">Outline Button</Button>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button variant="ghost" onClick={handleReset}>
          Reset to Default
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      {saved && (
        <div className="fixed bottom-4 right-4 bg-success text-white px-6 py-3 rounded-lg shadow-lg">
          ✓ Theme saved successfully!
        </div>
      )}
    </div>
  );
};
```

---

## Part 8: CSS Variables for Custom Properties

```css
/* src/styles/custom-properties.css */

:root {
  /* Transitions */
  --transition-duration-fast: 150ms;
  --transition-duration-base: 200ms;
  --transition-duration-slow: 300ms;
  
  --transition-timing-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --transition-timing-out: cubic-bezier(0, 0, 0.2, 1);
  --transition-timing-in: cubic-bezier(0.4, 0, 1, 1);
  
  /* Layers (for z-index organization) */
  --z-index-dropdown: 1000;
  --z-index-sticky: 1020;
  --z-index-fixed: 1030;
  --z-index-modal-backdrop: 1040;
  --z-index-modal: 1050;
  --z-index-popover: 1060;
  --z-index-tooltip: 1070;
  
  /* Border radius helpers */
  --radius-sm: 0.25rem;
  --radius-base: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;
  
  /* Focus ring */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
}
```

---

## Design System Summary

### **Swiss/European Design Aesthetic**
- Clean, minimalist design
- Subtle shadows and borders
- Generous whitespace
- Neutral color palette with accent colors
- Professional typography (Inter sans-serif)
- Smooth, refined interactions

### **Token-Based Approach**
- All colors, spacing, fonts defined in tokens
- Easy to maintain consistency
- Simple to add custom themes
- CSS variables for runtime customization

### **Multi-Level Theming**
- System defaults (Light/Dark)
- Tenant customization (admin settings)
- User preferences (stored in DB)
- Real-time updates (no reload needed)

### **Component Patterns**
- CVA (Class Variance Authority) for variants
- Semantic color names
- Accessible focus states
- Dark mode support built-in
- Responsive by default

### **Admin Integration**
- Settings service integration
- Color picker UI
- Live preview mode
- One-click reset to defaults
- Audit trail for changes

---

**Version**: 1.0  
**Status**: Ready for Implementation  
**Last Updated**: March 17, 2026
