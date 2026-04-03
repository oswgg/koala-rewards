import type { Metadata } from 'next';
import { StaffGuard } from '@/shared/components/auth/staff-guard';

export const metadata: Metadata = {
    title: 'Scanner',
    manifest: '/scanner.webmanifest',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Scanner',
    },
};

export default function ScanLayout({ children }: { children: React.ReactNode }) {
    return <StaffGuard>{children}</StaffGuard>;
}
