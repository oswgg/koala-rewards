import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
    dest: 'public',
    disable: false,
    cacheStartUrl: true,
    dynamicStartUrl: false,
    extendDefaultRuntimeCaching: true,
    fallbacks: {
        document: '/_offline',
    },
    workboxOptions: {
        runtimeCaching: [
            {
                urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'supabase-api-cache',
                    expiration: {
                        maxEntries: 100,
                        maxAgeSeconds: 60 * 60 * 24 * 7,
                    },
                    networkTimeoutSeconds: 10,
                    cacheableResponse: {
                        statuses: [0, 200],
                    },
                },
            },
            {
                urlPattern: /^https?:\/\/[^/]*\/api\/.*/i,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'app-api-cache',
                    expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 60 * 60 * 24,
                    },
                    networkTimeoutSeconds: 10,
                    cacheableResponse: {
                        statuses: [0, 200],
                    },
                },
            },
            {
                urlPattern: ({ request }) => request.mode === "navigate",
                handler: "NetworkFirst",
                options: {
                    cacheName: "pages-cache",
                    networkTimeoutSeconds: 3,
                    expiration: {
                        maxEntries: 200,
                        maxAgeSeconds: 60 * 60 * 24 * 30,
                    },
                    cacheableResponse: {
                        statuses: [0, 200],
                    },
                },
            }
        ],
    },
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA(nextConfig);
