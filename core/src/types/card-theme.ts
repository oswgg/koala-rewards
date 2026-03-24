export interface CardTheme {
    name: string;
    bg: string;
    text: string;
    sub: string;
    stamp: string;
    stampBg: string;
    logo: string;
}

export type CardThemeName =
    | 'neutral'
    | 'ocean'
    | 'royal'
    | 'sunset'
    | 'rose'
    | 'teal'
    | 'blue'
    | 'coffee'
    | 'organic'
    | 'luxury'
    | 'soft-pink'
    | 'fresh'
    | 'warm'
    | 'minimal-light';
