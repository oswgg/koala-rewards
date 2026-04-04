import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    cacheStartUrl: true,
    dynamicStartUrl: false,
    extendDefaultRuntimeCaching: true,
    workboxOptions: {
        runtimeCaching: [
            {
                // Supabase → NO cachear agresivamente
                urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
                handler: 'NetworkOnly',
            },
            {
                // APIs públicas seguras
                urlPattern: ({ url, request }) =>
                    url.pathname.startsWith('/api/public') &&
                    request.method === 'GET',
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'public-api-cache',
                    expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 60 * 60, // 1h
                    },
                },
            },
            {
                // navegación
                urlPattern: ({ request }) => request.mode === 'navigate',
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'pages-cache',
                    networkTimeoutSeconds: 5,
                    expiration: {
                        maxEntries: 200,
                        maxAgeSeconds: 60 * 60 * 24 * 30,
                    },
                },
            },
        ],
    },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        '@vado/shared/ui',
        '@vado/loyalty',
    ],
}

export default withPWA(nextConfig);