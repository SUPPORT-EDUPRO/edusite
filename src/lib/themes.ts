/**
 * Theme System - Design Tokens for Template Variants
 * Supports: Clean, Playful, Professional, Community
 */

export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    unit: number; // Base spacing unit in pixels
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface ThemeVariant {
  key: string;
  name: string;
  description: string;
  tokens: DesignTokens;
  preview?: string;
}

// ============================================
// THEME VARIANTS
// ============================================

export const THEME_CLEAN: ThemeVariant = {
  key: 'clean',
  name: 'Clean',
  description: 'Minimal design with high whitespace and subtle colors',
  tokens: {
    colors: {
      primary: '#44403c', // stone-700
      secondary: '#d97706', // amber-600
      accent: '#fef3c7', // amber-100
      background: '#ffffff',
      foreground: '#1c1917', // stone-900
      muted: '#f5f5f4', // stone-100
      mutedForeground: '#78716c', // stone-500
      border: '#e7e5e4', // stone-200
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
    },
    spacing: {
      unit: 8,
    },
    radius: {
      sm: 4,
      md: 8,
      lg: 16,
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },
  },
};

export const THEME_PLAYFUL: ThemeVariant = {
  key: 'playful',
  name: 'Playful',
  description: 'Rounded corners, vibrant colors, and fun illustrations',
  tokens: {
    colors: {
      primary: '#ec4899', // pink-500
      secondary: '#8b5cf6', // violet-500
      accent: '#fbbf24', // amber-400
      background: '#ffffff',
      foreground: '#1e293b', // slate-800
      muted: '#f1f5f9', // slate-100
      mutedForeground: '#64748b', // slate-500
      border: '#e2e8f0', // slate-200
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
    },
    spacing: {
      unit: 12,
    },
    radius: {
      sm: 8,
      md: 16,
      lg: 24,
    },
    shadows: {
      sm: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
      md: '0 6px 12px -2px rgb(0 0 0 / 0.15)',
      lg: '0 15px 25px -5px rgb(0 0 0 / 0.2)',
    },
  },
};

export const THEME_PROFESSIONAL: ThemeVariant = {
  key: 'professional',
  name: 'Professional',
  description: 'Traditional design with serif fonts and navy tones',
  tokens: {
    colors: {
      primary: '#1e3a8a', // blue-900
      secondary: '#0284c7', // sky-600
      accent: '#f59e0b', // amber-500
      background: '#ffffff',
      foreground: '#0f172a', // slate-900
      muted: '#f8fafc', // slate-50
      mutedForeground: '#475569', // slate-600
      border: '#cbd5e1', // slate-300
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Inter, sans-serif',
    },
    spacing: {
      unit: 8,
    },
    radius: {
      sm: 2,
      md: 4,
      lg: 8,
    },
    shadows: {
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      md: '0 4px 8px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 20px -5px rgb(0 0 0 / 0.1)',
    },
  },
};

export const THEME_COMMUNITY: ThemeVariant = {
  key: 'community',
  name: 'Community',
  description: 'Warm, earthy tones with a welcoming feel',
  tokens: {
    colors: {
      primary: '#92400e', // amber-800
      secondary: '#16a34a', // green-600
      accent: '#fbbf24', // amber-400
      background: '#fffbeb', // amber-50
      foreground: '#451a03', // amber-950
      muted: '#fef3c7', // amber-100
      mutedForeground: '#78350f', // amber-900
      border: '#fde68a', // amber-200
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
    },
    spacing: {
      unit: 10,
    },
    radius: {
      sm: 6,
      md: 12,
      lg: 20,
    },
    shadows: {
      sm: '0 1px 3px 0 rgb(120 53 15 / 0.1)',
      md: '0 4px 8px -2px rgb(120 53 15 / 0.15)',
      lg: '0 10px 20px -5px rgb(120 53 15 / 0.2)',
    },
  },
};

// ============================================
// THEME REGISTRY
// ============================================

export const THEMES: Record<string, ThemeVariant> = {
  clean: THEME_CLEAN,
  playful: THEME_PLAYFUL,
  professional: THEME_PROFESSIONAL,
  community: THEME_COMMUNITY,
};

/**
 * Get theme variant by key
 */
export function getTheme(key: string): ThemeVariant | undefined {
  return THEMES[key];
}

/**
 * Get all theme variants
 */
export function getAllThemes(): ThemeVariant[] {
  return Object.values(THEMES);
}

/**
 * Apply theme tokens to CSS variables
 */
export function applyThemeToCSS(tokens: DesignTokens): string {
  return `
    :root {
      --color-primary: ${tokens.colors.primary};
      --color-secondary: ${tokens.colors.secondary};
      --color-accent: ${tokens.colors.accent};
      --color-background: ${tokens.colors.background};
      --color-foreground: ${tokens.colors.foreground};
      --color-muted: ${tokens.colors.muted};
      --color-muted-foreground: ${tokens.colors.mutedForeground};
      --color-border: ${tokens.colors.border};
      
      --font-heading: ${tokens.fonts.heading};
      --font-body: ${tokens.fonts.body};
      
      --spacing-unit: ${tokens.spacing.unit}px;
      
      --radius-sm: ${tokens.radius.sm}px;
      --radius-md: ${tokens.radius.md}px;
      --radius-lg: ${tokens.radius.lg}px;
      
      --shadow-sm: ${tokens.shadows.sm};
      --shadow-md: ${tokens.shadows.md};
      --shadow-lg: ${tokens.shadows.lg};
    }
  `.trim();
}

/**
 * Generate Tailwind config from theme tokens
 */
export function generateTailwindConfig(tokens: DesignTokens) {
  return {
    theme: {
      extend: {
        colors: {
          primary: tokens.colors.primary,
          secondary: tokens.colors.secondary,
          accent: tokens.colors.accent,
          muted: tokens.colors.muted,
        },
        fontFamily: {
          heading: [tokens.fonts.heading],
          body: [tokens.fonts.body],
        },
        spacing: {
          unit: `${tokens.spacing.unit}px`,
        },
        borderRadius: {
          sm: `${tokens.radius.sm}px`,
          md: `${tokens.radius.md}px`,
          lg: `${tokens.radius.lg}px`,
        },
        boxShadow: {
          sm: tokens.shadows.sm,
          md: tokens.shadows.md,
          lg: tokens.shadows.lg,
        },
      },
    },
  };
}
