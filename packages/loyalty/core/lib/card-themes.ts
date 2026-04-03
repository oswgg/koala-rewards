import type { CardTheme, CardThemeName } from '../domain/types/card-theme';

export type { CardTheme, CardThemeName };

export const CARD_THEMES: Record<CardThemeName, CardTheme> = {
    neutral: {
        name: 'Neutral',
        bg: 'oklch(0.98 0 0)',
        text: 'oklch(0.15 0 0)',
        sub: 'oklch(0.45 0 0)',
        stamp: 'oklch(0.7 0.1 250)',
        stampBg: 'oklch(0.92 0 0)',
        logo: 'oklch(0.9 0 0)',
    },

    ocean: {
        name: 'Ocean',
        bg: '#0ea5e9',
        text: '#f0f9ff',
        sub: 'rgba(255,255,255,0.7)',
        stamp: '#38bdf8',
        stampBg: 'rgba(255,255,255,0.12)',
        logo: 'rgba(255,255,255,0.15)',
    },

    royal: {
        name: 'Royal',
        bg: '#7c3aed',
        text: '#ffffff',
        sub: 'rgba(255,255,255,0.6)',
        stamp: '#c4b5fd',
        stampBg: 'rgba(255,255,255,0.12)',
        logo: 'rgba(255,255,255,0.18)',
    },

    sunset: {
        name: 'Sunset',
        bg: '#f97316',
        text: '#fff7ed',
        sub: 'rgba(255,255,255,0.7)',
        stamp: '#fdba74',
        stampBg: 'rgba(255,255,255,0.12)',
        logo: 'rgba(255,255,255,0.15)',
    },

    rose: {
        name: 'Rose',
        bg: '#e11d48',
        text: '#ffffff',
        sub: 'rgba(255,255,255,0.6)',
        stamp: '#fecdd3',
        stampBg: 'rgba(255,255,255,0.12)',
        logo: 'rgba(255,255,255,0.18)',
    },

    teal: {
        name: 'Teal',
        bg: '#0d9488',
        text: '#ffffff',
        sub: 'rgba(255,255,255,0.6)',
        stamp: '#99f6e4',
        stampBg: 'rgba(255,255,255,0.12)',
        logo: 'rgba(255,255,255,0.18)',
    },

    blue: {
        name: 'Blue',
        bg: '#2563eb',
        text: '#ffffff',
        sub: 'rgba(255,255,255,0.6)',
        stamp: '#bfdbfe',
        stampBg: 'rgba(255,255,255,0.12)',
        logo: 'rgba(255,255,255,0.18)',
    },

    coffee: {
        name: 'Coffee',
        bg: '#3b2f2f',
        text: '#f5f5f4',
        sub: 'rgba(255,255,255,0.6)',
        stamp: '#c4a484',
        stampBg: 'rgba(255,255,255,0.08)',
        logo: 'rgba(255,255,255,0.12)',
    },

    organic: {
        name: 'Organic',
        bg: '#355f2e',
        text: '#f0fdf4',
        sub: 'rgba(255,255,255,0.7)',
        stamp: '#86efac',
        stampBg: 'rgba(255,255,255,0.1)',
        logo: 'rgba(255,255,255,0.12)',
    },

    luxury: {
        name: 'Luxury',
        bg: '#0f172a',
        text: '#f8fafc',
        sub: 'rgba(255,255,255,0.6)',
        stamp: '#facc15',
        stampBg: 'rgba(255,255,255,0.08)',
        logo: 'rgba(255,255,255,0.12)',
    },

    'soft-pink': {
        name: 'Soft Pink',
        bg: '#f9a8d4',
        text: '#831843',
        sub: 'rgba(0,0,0,0.5)',
        stamp: '#ec4899',
        stampBg: 'rgba(0,0,0,0.08)',
        logo: 'rgba(0,0,0,0.1)',
    },

    fresh: {
        name: 'Fresh',
        bg: '#fef9c3',
        text: '#365314',
        sub: 'rgba(0,0,0,0.5)',
        stamp: '#84cc16',
        stampBg: 'rgba(0,0,0,0.08)',
        logo: 'rgba(0,0,0,0.1)',
    },

    warm: {
        name: 'Warm',
        bg: '#ea580c',
        text: '#fff7ed',
        sub: 'rgba(255,255,255,0.7)',
        stamp: '#fdba74',
        stampBg: 'rgba(255,255,255,0.12)',
        logo: 'rgba(255,255,255,0.15)',
    },

    'minimal-light': {
        name: 'Minimal Light',
        bg: '#ffffff',
        text: '#0f172a',
        sub: 'rgba(0,0,0,0.6)',
        stamp: '#2563eb',
        stampBg: 'rgba(0,0,0,0.05)',
        logo: 'rgba(0,0,0,0.08)',
    },
};

/** Orden de temas para iteración por índice (ej. tarjeta 0 → ocean, tarjeta 1 → royal, etc.) */
export const CARD_THEME_NAMES: CardThemeName[] = [
    'neutral',
    'ocean',
    'royal',
    'sunset',
    'rose',
    'teal',
    'blue',
    'coffee',
    'organic',
    'luxury',
    'soft-pink',
    'fresh',
    'warm',
    'minimal-light',
];

/** Obtiene un tema por nombre. Si el nombre no es válido, devuelve neutral. */
export function getCardTheme(themeName: CardThemeName | string | null | undefined): CardTheme {
    if (!themeName || !(themeName in CARD_THEMES)) {
        return CARD_THEMES.neutral;
    }
    return CARD_THEMES[themeName as CardThemeName];
}
