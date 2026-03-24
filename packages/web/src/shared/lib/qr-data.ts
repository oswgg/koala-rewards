export {
    buildProgramJoinUrl,
    parseProgramQR,
    buildCustomerScanUrl,
    parseCustomerQR,
} from '@koalacards/core/src/lib/qr-data';
export type { JoinProgramQRData, CustomerQRData } from '@koalacards/core/src/lib/qr-data';

/** Base URL for QR payloads (client components: prefer `window.location.origin`). */
export function getAppBaseUrlForQr(): string {
    if (typeof window !== 'undefined') return window.location.origin;
    return process.env.NEXT_PUBLIC_APP_URL ?? '';
}
