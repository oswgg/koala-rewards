import type { Metadata } from 'next';
import { requireAuthAndStaff } from '@/shared/lib/auth';

export const metadata: Metadata = {
    title: 'Scanner',
    manifest: '/scanner.webmanifest',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Scanner',
    },
};

export default async function ScanLayout({ children }: { children: React.ReactNode }) {
    await requireAuthAndStaff();
    return <>{children}</>;
}
