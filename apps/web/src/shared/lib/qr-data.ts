/** Base URL for QR payloads (client components: prefer `window.location.origin`). */
export function getAppBaseUrlForQr(): string {
    if (typeof window !== 'undefined') return window.location.origin;
    return process.env.NEXT_PUBLIC_APP_URL ?? '';
}
