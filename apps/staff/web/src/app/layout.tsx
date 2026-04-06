import { Geist, Geist_Mono } from 'next/font/google';

import { Viewport } from 'next';
import { QueryProvider } from './_providers/query-provider';
import { ThemeProvider } from './_providers/theme-provider';
import { Inter } from 'next/font/google';
import { cn } from '@vado/shared/ui';
import localFont from 'next/font/local';
import './globals.css';

export const viewport: Viewport = {
    themeColor: '#0f172a',
};

const fontOpenSauce = localFont({
    src: [
        {
            path: '../../public/fonts/open_sauce/OpenSauceOne-Regular.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../../public/fonts/open_sauce/OpenSauceOne-Medium.ttf',
            weight: '500',
            style: 'normal',
        },
        {
            path: '../../public/fonts/open_sauce/OpenSauceOne-Bold.ttf',
            weight: '700',
            style: 'normal',
        },
        {
            path: '../../public/fonts/open_sauce/OpenSauceOne-Black.ttf',
            weight: '900',
            style: 'normal',
        },
    ],
    variable: '--font-open-sauce-family',
});

const fontInter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={cn('antialiased', fontInter.variable)}>
            <body>
                <QueryProvider>
                    <ThemeProvider>{children}</ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
