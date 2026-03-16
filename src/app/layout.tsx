import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';
import { QueryProvider } from '@/app/_providers/query-provider';
import { ThemeProvider } from '@/app/_providers/theme-provider';
import { cn } from '@/shared/lib/utils';

const APP_NAME = 'KoalaCards';
const APP_DESCRIPTION = 'Tus tarjetas de fidelidad en un solo lugar';

export const metadata: Metadata = {
    applicationName: APP_NAME,
    title: {
        default: 'Mis Tarjetas - KoalaCards',
        template: `%s - ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
    manifest: '/manifest.webmanifest',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Mis Tarjetas',
    },
    formatDetection: {
        telephone: false,
    },
};

export const viewport: Viewport = {
    themeColor: '#0f172a',
};

const fontSans = Geist({
    subsets: ['latin'],
    variable: '--font-sans',
});

const fontMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={cn('antialiased', fontMono.variable, 'font-sans', fontSans.variable)}
        >
            <body>
                <QueryProvider>
                    <ThemeProvider>{children}</ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
