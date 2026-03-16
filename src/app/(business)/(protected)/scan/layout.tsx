import { requireAuthAndStaff } from '@/shared/lib/auth';

export default async function ScanLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAuthAndStaff();
    return <>{children}</>;
}
