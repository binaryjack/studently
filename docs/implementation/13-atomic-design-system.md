# Atomic Design System for Studently Frontend

## Overview

Implementing **Atomic Design** principles with React, TypeScript, and Tailwind CSS to create a scalable, maintainable UI component architecture. This hierarchical approach decomposes the UI into reusable, testable units from smallest (atoms) to largest (pages).

---

## Atomic Design Hierarchy

```
┌──────────────────────────────────────────────────────────┐
│                    ATOMIC DESIGN                          │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ATOMS (Smallest, Reusable)                              │
│  ├── Button, Input, Label, Icon, Badge, Avatar          │
│  └── Pure presentational, no business logic              │
│                                                            │
│  MOLECULES (Simple Groups)                               │
│  ├── FormField (Label + Input + Error)                   │
│  ├── SearchBox (Input + Icon + Button)                   │
│  ├── Card (Container + Content)                          │
│  └── Combinations of atoms with minimal logic            │
│                                                            │
│  ORGANISMS (Complex Groups)                              │
│  ├── LoginForm (FormFields + Button + Link)             │
│  ├── HeaderNav (Logo + Menu + Avatar)                   │
│  ├── StudentProgressCard (Charts + Stats + Tables)      │
│  └── Feature-complete sections with business logic       │
│                                                            │
│  TEMPLATES (Layout + Composition)                        │
│  ├── AuthLayout (Header + Form + Footer)                │
│  ├── DashboardLayout (Sidebar + TopNav + Content)       │
│  ├── SettingsLayout (Tabs + Forms + Actions)            │
│  └── Structural composition, page-level layout           │
│                                                            │
│  PAGES (Specific Content)                                │
│  ├── LoginPage (Template + Specific Data)               │
│  ├── StudentDashboard (Template + Real Data)            │
│  ├── SettingsPage (Template + User Settings)            │
│  └── Content instances with real data & navigation       │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

## Part 1: Folder Structure

```
src/
├── shared/
│   ├── design/
│   │   ├── design-tokens.ts
│   │   ├── theme.types.ts
│   │   ├── theme-context.tsx
│   │   └── theme-customizer.ts
│   │
│   └── components/
│       ├── atoms/
│       │   ├── button/
│       │   │   ├── button.types.ts
│       │   │   ├── button.tsx
│       │   │   ├── button.test.tsx
│       │   │   └── index.ts
│       │   │
│       │   ├── input/
│       │   │   ├── input.types.ts
│       │   │   ├── input.tsx
│       │   │   ├── input.test.tsx
│       │   │   └── index.ts
│       │   │
│       │   ├── label/
│       │   ├── icon/
│       │   ├── badge/
│       │   ├── avatar/
│       │   ├── spinner/
│       │   ├── divider/
│       │   ├── tooltip/
│       │   └── index.ts (exports all atoms)
│       │
│       ├── molecules/
│       │   ├── form-field/
│       │   │   ├── form-field.types.ts
│       │   │   ├── form-field.tsx
│       │   │   ├── form-field.test.tsx
│       │   │   └── index.ts
│       │   │
│       │   ├── search-box/
│       │   ├── card/
│       │   ├── alert/
│       │   ├── modal/
│       │   ├── dropdown/
│       │   ├── pagination/
│       │   ├── tabs/
│       │   ├── breadcrumb/
│       │   └── index.ts (exports all molecules)
│       │
│       ├── organisms/
│       │   ├── login-form/
│       │   │   ├── login-form.types.ts
│       │   │   ├── login-form.tsx
│       │   │   ├── login-form.test.tsx
│       │   │   └── index.ts
│       │   │
│       │   ├── header-nav/
│       │   ├── student-progress-card/
│       │   ├── role-matrix-editor/
│       │   ├── email-settings-form/
│       │   ├── backup-status-panel/
│       │   ├── theme-customizer/
│       │   ├── data-table/
│       │   └── index.ts (exports all organisms)
│       │
│       └── index.ts (central export)
│
├── domains/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── templates/
│   │   │   │   ├── auth-layout/
│   │   │   │   │   ├── auth-layout.tsx
│   │   │   │   │   ├── auth-layout.test.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── pages/
│   │   │       ├── login-page/
│   │   │       │   ├── login-page.tsx
│   │   │       │   ├── login-page.test.tsx
│   │   │       │   └── index.ts
│   │   │       ├── register-page/
│   │   │       ├── forgot-password-page/
│   │   │       └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── templates/
│   │   │   │   ├── dashboard-layout/
│   │   │   │   └── index.ts
│   │   │   └── pages/
│   │   │       ├── student-dashboard-page/
│   │   │       ├── teacher-dashboard-page/
│   │   │       └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── settings/
│   │   ├── components/
│   │   │   ├── templates/
│   │   │   │   ├── settings-layout/
│   │   │   │   └── index.ts
│   │   │   └── pages/
│   │   │       ├── organization-settings-page/
│   │   │       ├── role-matrix-settings-page/
│   │   │       ├── email-settings-page/
│   │   │       ├── theme-settings-page/
│   │   │       └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   └── [other domains...]
│
└── app.tsx (Root)
```

---

## Part 2: Atoms - Building Blocks

### Button Atom

```typescript
// src/shared/components/atoms/button/button.types.ts

import type { VariantProps } from 'class-variance-authority';
import { buttonVariants } from './button';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
  };

// src/shared/components/atoms/button/button.tsx

import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '@shared/utils/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-base px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark focus:ring-primary dark:bg-primary-light dark:text-primary-dark',
        secondary: 'bg-secondary text-white hover:bg-secondary-dark active:bg-secondary-dark focus:ring-secondary dark:bg-secondary-light dark:text-secondary-dark',
        accent: 'bg-accent text-white hover:brightness-110 focus:ring-accent',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-primary-light dark:text-primary-light',
        ghost: 'text-primary hover:bg-gray-100 dark:text-primary-light dark:hover:bg-gray-800',
        danger: 'bg-danger text-white hover:brightness-110 focus:ring-danger',
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    isLoading,
    icon,
    iconPosition = 'left',
    disabled,
    children,
    ...props
  }, ref) => (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, fullWidth, loading: isLoading, className })}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          {children && <span className="ml-2">{children}</span>}
        </>
      ) : icon ? (
        <>
          {iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </>
      ) : (
        children
      )}
    </button>
  ),
);

Button.displayName = 'Button';

// src/shared/components/atoms/button/index.ts
export * from './button';
export type { ButtonProps } from './button.types';
```

### Input Atom

```typescript
// src/shared/components/atoms/input/input.types.ts

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: InputType;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isInvalid?: boolean;
  variant?: 'default' | 'flat' | 'bordered' | 'flushed';
}

// src/shared/components/atoms/input/input.tsx

import { forwardRef } from 'react';
import { cn } from '@shared/utils/cn';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    icon,
    iconPosition = 'left',
    isInvalid,
    variant = 'default',
    ...props
  }, ref) => {
    const baseStyles = 'w-full px-4 py-2 rounded-base border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantStyles = {
      default: 'border-border bg-background text-text-primary placeholder-text-tertiary focus:ring-primary dark:bg-surface dark:border-border-dark',
      flat: 'border-0 bg-gray-100 text-text-primary placeholder-text-tertiary focus:ring-primary dark:bg-gray-800',
      bordered: 'border-2 border-border bg-transparent focus:ring-primary dark:border-border-dark',
      flushed: 'border-0 border-b-2 border-border bg-transparent rounded-0 focus:ring-0 focus:border-primary dark:border-border-dark',
    };

    const invalidStyles = isInvalid
      ? 'border-danger focus:ring-danger focus:border-transparent'
      : '';

    return (
      <div className="relative w-full">
        {icon && iconPosition === 'left' && (
          <span className="absolute left-3 top-3 text-text-secondary pointer-events-none">
            {icon}
          </span>
        )}

        <input
          ref={ref}
          type={type}
          className={cn(
            baseStyles,
            variantStyles[variant],
            invalidStyles,
            icon && iconPosition === 'left' && 'pl-10',
            icon && iconPosition === 'right' && 'pr-10',
            className,
          )}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <span className="absolute right-3 top-3 text-text-secondary pointer-events-none">
            {icon}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

// src/shared/components/atoms/input/index.ts
export * from './input';
export type { InputProps } from './input.types';
```

### Label Atom

```typescript
// src/shared/components/atoms/label/label.tsx

import { forwardRef } from 'react';
import { cn } from '@shared/utils/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  isRequired?: boolean;
  size?: 'sm' | 'md' | 'lg';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({
    className,
    isRequired,
    size = 'md',
    weight = 'medium',
    children,
    ...props
  }, ref) => (
    <label
      ref={ref}
      className={cn(
        'block text-text-primary transition-colors duration-200',
        size === 'sm' && 'text-sm',
        size === 'md' && 'text-base',
        size === 'lg' && 'text-lg',
        weight === 'normal' && 'font-normal',
        weight === 'medium' && 'font-medium',
        weight === 'semibold' && 'font-semibold',
        weight === 'bold' && 'font-bold',
        className,
      )}
      {...props}
    >
      {children}
      {isRequired && <span className="text-danger ml-1">*</span>}
    </label>
  ),
);

Label.displayName = 'Label';

export type { LabelProps };
```

### Icon Atom

```typescript
// src/shared/components/atoms/icon/icon.tsx

import { forwardRef } from 'react';
import { cn } from '@shared/utils/cn';

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'inherit';
}

const sizeMap = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
};

const colorMap = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  inherit: 'text-current',
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 'md', color = 'inherit', className, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn(sizeMap[size], colorMap[color], className)}
      fill="currentColor"
      viewBox="0 0 20 20"
      {...props}
    />
  ),
);

Icon.displayName = 'Icon';

export type { IconProps };
```

### Badge Atom

```typescript
// src/shared/components/atoms/badge/badge.tsx

import { forwardRef } from 'react';
import { cn } from '@shared/utils/cn';

export type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  onRemove?: () => void;
}

const variantStyles = {
  primary: 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-100',
  secondary: 'bg-secondary-50 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-100',
  accent: 'bg-accent-50 text-accent-700 dark:bg-accent-900 dark:text-accent-100',
  success: 'bg-success-50 text-success-700 dark:bg-success-900 dark:text-success-100',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-900 dark:text-warning-100',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-900 dark:text-danger-100',
  info: 'bg-info-50 text-info-700 dark:bg-info-900 dark:text-info-100',
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1.5 text-sm',
  lg: 'px-3 py-2 text-base',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    icon,
    onRemove,
    children,
    ...props
  }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 inline-flex items-center hover:opacity-70 transition-opacity"
          type="button"
        >
          ✕
        </button>
      )}
    </span>
  ),
);

Badge.displayName = 'Badge';

export type { BadgeProps };
```

### Avatar Atom

```typescript
// src/shared/components/atoms/avatar/avatar.tsx

import { forwardRef } from 'react';
import { cn } from '@shared/utils/cn';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  initials?: string;
  variant?: 'circle' | 'square' | 'rounded';
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const sizeMap = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const variantMap = {
  circle: 'rounded-full',
  square: 'rounded-none',
  rounded: 'rounded-lg',
};

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({
    className,
    size = 'md',
    initials,
    variant = 'circle',
    status,
    src,
    alt = 'Avatar',
    ...props
  }, ref) => (
    <div className="relative inline-flex">
      {src ? (
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={cn(
            'object-cover bg-gray-100 dark:bg-gray-800',
            sizeMap[size],
            variantMap[variant],
            className,
          )}
          {...props}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center bg-primary text-white font-semibold',
            sizeMap[size],
            variantMap[variant],
            className,
          )}
        >
          {initials}
        </div>
      )}

      {status && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-900',
            'w-2.5 h-2.5',
            status === 'online' && 'bg-success',
            status === 'offline' && 'bg-gray-400',
            status === 'away' && 'bg-warning',
            status === 'busy' && 'bg-danger',
          )}
        />
      )}
    </div>
  ),
);

Avatar.displayName = 'Avatar';

export type { AvatarProps };
```

### Atoms Index

```typescript
// src/shared/components/atoms/index.ts

export * from './button';
export * from './input';
export * from './label';
export * from './icon';
export * from './badge';
export * from './avatar';
export * from './spinner';
export * from './divider';
export * from './tooltip';
```

---

## Part 3: Molecules - Atomic Groups

### FormField Molecule

```typescript
// src/shared/components/molecules/form-field/form-field.types.ts

import type { InputProps } from '@shared/components/atoms/input';
import type { LabelProps } from '@shared/components/atoms/label';

export interface FormFieldProps extends Omit<InputProps, 'id'> {
  id: string;
  label?: string;
  labelProps?: Omit<LabelProps, 'htmlFor'>;
  helperText?: string;
  error?: string;
  required?: boolean;
}

// src/shared/components/molecules/form-field/form-field.tsx

import { forwardRef } from 'react';
import { Input, Label } from '@shared/components/atoms';
import { cn } from '@shared/utils/cn';

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({
    id,
    label,
    labelProps,
    helperText,
    error,
    required,
    className,
    ...inputProps
  }, ref) => (
    <div className="w-full space-y-1.5">
      {label && (
        <Label htmlFor={id} isRequired={required} {...labelProps}>
          {label}
        </Label>
      )}

      <Input
        ref={ref}
        id={id}
        isInvalid={!!error}
        className={className}
        {...inputProps}
      />

      {error && (
        <p className="text-sm text-danger mt-1">{error}</p>
      )}

      {helperText && !error && (
        <p className="text-sm text-text-tertiary mt-1">{helperText}</p>
      )}
    </div>
  ),
);

FormField.displayName = 'FormField';

export type { FormFieldProps };
```

### Card Molecule

```typescript
// src/shared/components/molecules/card/card.tsx

import { forwardRef } from 'react';
import { cn } from '@shared/utils/cn';

export type CardVariant = 'default' | 'outlined' | 'elevated';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'shadow-base border border-border',
  outlined: 'border border-border',
  elevated: 'shadow-lg',
};

const paddingStyles = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    hoverable,
    padding = 'md',
    ...props
  }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg bg-surface text-text-primary transition-all duration-200',
        variantStyles[variant],
        paddingStyles[padding],
        hoverable && 'hover:shadow-md hover:border-primary cursor-pointer',
        className,
      )}
      {...props}
    />
  ),
);

Card.displayName = 'Card';

export type { CardProps };
```

### SearchBox Molecule

```typescript
// src/shared/components/molecules/search-box/search-box.tsx

import { forwardRef, useState } from 'react';
import { Input, Button, Icon } from '@shared/components/atoms';
import { cn } from '@shared/utils/cn';

export interface SearchBoxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
}

export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
  ({
    className,
    onSearch,
    onClear,
    isLoading,
    onChange,
    value,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value || '');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleSearch = () => {
      onSearch?.(internalValue as string);
    };

    const handleClear = () => {
      setInternalValue('');
      onClear?.();
    };

    return (
      <div className={cn('flex gap-2', className)}>
        <Input
          ref={ref}
          type="text"
          placeholder="Search..."
          value={internalValue}
          onChange={handleChange}
          icon="🔍"
          className="flex-1"
          {...props}
        />
        {internalValue && (
          <Button
            variant="ghost"
            onClick={handleClear}
            disabled={isLoading}
            aria-label="Clear search"
          >
            ✕
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleSearch}
          isLoading={isLoading}
          aria-label="Search"
        >
          Search
        </Button>
      </div>
    );
  },
);

SearchBox.displayName = 'SearchBox';

export type { SearchBoxProps };
```

### Alert Molecule

```typescript
// src/shared/components/molecules/alert/alert.tsx

import { forwardRef } from 'react';
import { cn } from '@shared/utils/cn';

export type AlertVariant = 'success' | 'warning' | 'danger' | 'info';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
}

const variantStyles = {
  success: 'bg-success-50 border-success-200 text-success-800 dark:bg-success-900 dark:border-success-700 dark:text-success-100',
  warning: 'bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900 dark:border-warning-700 dark:text-warning-100',
  danger: 'bg-danger-50 border-danger-200 text-danger-800 dark:bg-danger-900 dark:border-danger-700 dark:text-danger-100',
  info: 'bg-info-50 border-info-200 text-info-800 dark:bg-info-900 dark:border-info-700 dark:text-info-100',
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({
    className,
    variant = 'info',
    title,
    icon,
    onClose,
    children,
    ...props
  }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border p-4 transition-all duration-200',
        variantStyles[variant],
        className,
      )}
      role="alert"
      {...props}
    >
      <div className="flex items-start gap-3">
        {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}

        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Close alert"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  ),
);

Alert.displayName = 'Alert';

export type { AlertProps };
```

### Molecules Index

```typescript
// src/shared/components/molecules/index.ts

export * from './form-field';
export * from './card';
export * from './search-box';
export * from './alert';
export * from './modal';
export * from './dropdown';
export * from './pagination';
export * from './tabs';
export * from './breadcrumb';
```

---

## Part 4: Organisms - Feature-Complete Sections

### LoginForm Organism

```typescript
// src/shared/components/organisms/login-form/login-form.types.ts

export interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onForgotPassword?: () => void;
  isLoading?: boolean;
  error?: string;
}

// src/shared/components/organisms/login-form/login-form.tsx

import { forwardRef, useState } from 'react';
import { FormField, Alert, Button } from '@shared/components';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = forwardRef<HTMLFormElement, LoginFormProps>(
  ({ onSubmit, onForgotPassword, isLoading, error }, ref) => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
    });

    const onFormSubmit = handleSubmit(async (data) => {
      await onSubmit(data.email, data.password);
    });

    return (
      <form ref={ref} onSubmit={onFormSubmit} className="w-full space-y-6">
        {error && (
          <Alert variant="danger" title="Login Failed">
            {error}
          </Alert>
        )}

        <FormField
          id="email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm text-text-secondary">Remember me</span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>
    );
  },
);

LoginForm.displayName = 'LoginForm';

export type { LoginFormProps };
```

### HeaderNav Organism

```typescript
// src/shared/components/organisms/header-nav/header-nav.tsx

import { useState } from 'react';
import { Button, Avatar, Icon } from '@shared/components/atoms';
import { Dropdown } from '@shared/components/molecules';
import { cn } from '@shared/utils/cn';

export interface HeaderNavProps {
  logo?: React.ReactNode;
  userAvatar?: string;
  userName?: string;
  onLogout?: () => void;
  onSettings?: () => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

export const HeaderNav = function({
  logo,
  userAvatar,
  userName,
  onLogout,
  onSettings,
  onThemeToggle,
  isDarkMode,
}: HeaderNavProps): React.ReactElement {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface shadow-sm dark:border-border-dark">
      <div className="mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          {logo}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onThemeToggle}
            aria-label="Toggle theme"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </Button>

          {/* User menu */}
          <Dropdown
            isOpen={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
            trigger={
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Avatar size="sm" src={userAvatar} initials="JD" />
                <span className="text-sm font-medium">{userName}</span>
              </Button>
            }
            items={[
              { label: 'Settings', onClick: onSettings },
              { label: 'Logout', onClick: onLogout, variant: 'danger' },
            ]}
          />
        </div>
      </div>
    </header>
  );
};

export type { HeaderNavProps };
```

### Organisms Index

```typescript
// src/shared/components/organisms/index.ts

export * from './login-form';
export * from './header-nav';
export * from './student-progress-card';
export * from './role-matrix-editor';
export * from './email-settings-form';
export * from './backup-status-panel';
export * from './theme-customizer';
export * from './data-table';
```

---

## Part 5: Templates - Layout Composition

### AuthLayout Template

```typescript
// src/domains/auth/components/templates/auth-layout/auth-layout.tsx

import { ReactNode } from 'react';
import { Card } from '@shared/components/molecules';

export interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  alternativeAction?: ReactNode;
}

export const AuthLayout = function({
  children,
  title,
  subtitle,
  alternativeAction,
}: AuthLayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 dark:bg-background-dark">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {title || 'Studently'}
          </h1>
          {subtitle && (
            <p className="text-text-secondary">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Card */}
        <Card variant="elevated" padding="lg" className="mb-6">
          {children}
        </Card>

        {/* Alternative Action */}
        {alternativeAction && (
          <div className="text-center">
            {alternativeAction}
          </div>
        )}
      </div>
    </div>
  );
};

export type { AuthLayoutProps };
```

### DashboardLayout Template

```typescript
// src/domains/dashboard/components/templates/dashboard-layout/dashboard-layout.tsx

import { ReactNode } from 'react';
import { HeaderNav } from '@shared/components/organisms';

export interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  onLogout?: () => void;
  onSettings?: () => void;
}

export const DashboardLayout = function({
  children,
  sidebar,
  onLogout,
  onSettings,
}: DashboardLayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-background-dark">
      {/* Header */}
      <HeaderNav
        onLogout={onLogout}
        onSettings={onSettings}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <aside className="hidden md:flex w-64 border-r border-border dark:border-border-dark bg-surface dark:bg-surface">
            {sidebar}
          </aside>
        )}

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export type { DashboardLayoutProps };
```

### SettingsLayout Template

```typescript
// src/domains/settings/components/templates/settings-layout/settings-layout.tsx

import { ReactNode } from 'react';
import { Tabs } from '@shared/components/molecules';

export interface SettingsLayoutProps {
  children: ReactNode;
  tabs?: { label: string; value: string }[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const SettingsLayout = function({
  children,
  tabs,
  activeTab,
  onTabChange,
}: SettingsLayoutProps): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-2">
          Manage your organization and system settings
        </p>
      </div>

      {/* Tabs */}
      {tabs && (
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      )}

      {/* Content */}
      <div>
        {children}
      </div>
    </div>
  );
};

export type { SettingsLayoutProps };
```

---

## Part 6: Pages - Specific Content

### LoginPage

```typescript
// src/domains/auth/components/pages/login-page/login-page.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@auth/components/templates';
import { LoginForm } from '@shared/components/organisms';
import { useAuthService } from '@auth/services/auth.service';

export const LoginPage = function(): React.ReactElement {
  const navigate = useNavigate();
  const authService = useAuthService();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(undefined);
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Welcome back to Studently"
      alternativeAction={
        <p className="text-text-secondary">
          Don't have an account?{' '}
          <a href="/register" className="text-primary hover:underline font-medium">
            Sign up
          </a>
        </p>
      }
    >
      <LoginForm
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
        isLoading={isLoading}
        error={error}
      />
    </AuthLayout>
  );
};
```

### StudentDashboardPage

```typescript
// src/domains/dashboard/components/pages/student-dashboard-page/student-dashboard-page.tsx

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@dashboard/components/templates';
import { Card } from '@shared/components/molecules';
import { Badge } from '@shared/components/atoms';
import { useStudentService } from '@learning/services/student.service';

export const StudentDashboardPage = function(): React.ReactElement {
  const studentService = useStudentService();
  const [progress, setProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const data = await studentService.getMyProgress();
        setProgress(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadProgress();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-text-primary">
            Welcome back, {progress?.studentName}!
          </h1>
          <p className="text-text-secondary mt-2">
            Your learning progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding="lg">
            <h3 className="text-sm font-semibold text-text-secondary mb-2">
              Overall Progress
            </h3>
            <p className="text-3xl font-bold text-primary">
              {progress?.overallProgress}%
            </p>
          </Card>

          <Card padding="lg">
            <h3 className="text-sm font-semibold text-text-secondary mb-2">
              Competencies
            </h3>
            <p className="text-3xl font-bold text-secondary">
              {progress?.competenciesCompleted}/{progress?.totalCompetencies}
            </p>
          </Card>

          <Card padding="lg">
            <h3 className="text-sm font-semibold text-text-secondary mb-2">
              Status
            </h3>
            <Badge variant="success">On Track</Badge>
          </Card>
        </div>

        {/* Competencies */}
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-4">
            My Competencies
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {progress?.competencies?.map((comp: any) => (
              <Card key={comp.id} padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {comp.name}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Level {comp.currentLevel} of {comp.maxLevel}
                    </p>
                  </div>
                  <div className="w-32">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(comp.currentLevel / comp.maxLevel) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
```

---

## Part 7: Component Composition Example

```typescript
// Example: Building a complex form using atomic design

import {
  // Atoms
  Button,
  Input,
  Label,
  
  // Molecules
  FormField,
  Card,
  Alert,
  
  // Organisms
  LoginForm,
} from '@shared/components';

export const ComplexFormExample = function(): React.ReactElement {
  return (
    <Card padding="lg" className="max-w-md mx-auto">
      <div className="space-y-6">
        {/* Using molecules */}
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          required
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          helperText="Must be at least 8 characters"
        />

        {/* Using atoms */}
        <Label>
          <input type="checkbox" className="mr-2" />
          I agree to the terms
        </Label>

        {/* Using atoms for actions */}
        <Button variant="primary" fullWidth>
          Submit
        </Button>

        <Button variant="ghost" fullWidth>
          Cancel
        </Button>

        {/* Using molecules for feedback */}
        <Alert variant="info" title="Info">
          This is a required field
        </Alert>
      </div>
    </Card>
  );
};
```

---

## Testing Strategy by Level

```typescript
// Atoms: Test UI rendering and props
describe('Button', () => {
  it('renders with variant styles', () => {
    const { getByRole } = render(<Button variant="primary">Click me</Button>);
    expect(getByRole('button')).toHaveClass('bg-primary');
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    const { getByRole } = render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});

// Molecules: Test composition and interactions
describe('FormField', () => {
  it('displays label and input', () => {
    const { getByLabelText, getByDisplayValue } = render(
      <FormField id="email" label="Email" />
    );
    expect(getByLabelText('Email')).toBeInTheDocument();
  });

  it('displays error message', () => {
    const { getByText } = render(
      <FormField id="email" label="Email" error="Invalid email" />
    );
    expect(getByText('Invalid email')).toBeInTheDocument();
  });
});

// Organisms: Test business logic and interactions
describe('LoginForm', () => {
  it('submits form with email and password', async () => {
    const onSubmit = vi.fn();
    const { getByLabelText, getByRole } = render(
      <LoginForm onSubmit={onSubmit} />
    );

    fireEvent.change(getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});

// Pages: Test complete user flows
describe('LoginPage', () => {
  it('redirects to dashboard on successful login', async () => {
    const { getByRole } = render(<LoginPage />);
    
    // Fill form
    fireEvent.change(getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(getByRole('button', { name: /sign in/i }));

    // Wait for navigation
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });
});
```

---

## Best Practices

### ✅ DO

- Keep atoms pure and dumb (no logic)
- Compose molecules from atoms
- Use molecules in organisms
- Organize organisms by domain
- Use TypeScript interfaces for all props
- Test each level independently
- Export from index.ts files
- Use semantic HTML
- Keep class names consistent
- Document complex components with Storybook

### ❌ DON'T

- Mix logic in atoms
- Create single-use components
- Skip TypeScript types
- Hardcode colors (use design tokens)
- Make deeply nested components
- Test implementation details
- Skip accessibility attributes
- Create circular dependencies
- Use generic names (div, span, container)
- Skip component documentation

---

## Component Library Growth

```
Phase 1: Core Atoms (Week 1-2)
├── Button, Input, Label, Icon, Badge, Avatar, etc.
└── Full test coverage (95%+)

Phase 2: Common Molecules (Week 3-4)
├── FormField, Card, Alert, Modal, Dropdown, etc.
└── Component composition patterns

Phase 3: Domain Organisms (Week 5-6)
├── LoginForm, HeaderNav, DataTable, Charts, etc.
└── Business logic integration

Phase 4: Templates & Pages (Week 7-8)
├── AuthLayout, DashboardLayout, SettingsLayout, etc.
└── Complete user flows

Phase 5: Storybook & Documentation (Week 9)
├── Interactive component browser
├── Usage examples
└── Design guidelines
```

---

**Version**: 1.0  
**Status**: Ready for Implementation  
**Last Updated**: March 17, 2026
