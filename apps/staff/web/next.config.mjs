import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    cacheStartUrl: true,
    dynamicStartUrl: false,
    extendDefaultRuntimeCaching: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        '@vado/loyalty',
        '@vado/shared',
    ],
    turbopack: {}
};

export default withPWA(nextConfig);
