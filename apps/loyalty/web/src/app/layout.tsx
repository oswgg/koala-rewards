import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/app/_providers/query-provider';
import { ThemeProvider } from '@/app/_providers/theme-provider';
import { cn } from '@/shared/lib/utils';
import localFont from 'next/font/local';
import './globals.css';

const APP_NAME = 'KoalaRewards';
const APP_DESCRIPTION = 'Tus tarjetas de fidelidad en un solo lugar';

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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={cn('antialiased', fontInter.variable, fontOpenSauce.variable)}
        >
            <body>
                <QueryProvider>
                    <ThemeProvider>{children}</ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
