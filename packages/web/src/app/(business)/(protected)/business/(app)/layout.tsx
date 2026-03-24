import { AppSidebar } from '@/modules/dashboard/components/app-sidebar';
import { requireAuthAndStaff } from '@/shared/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    await requireAuthAndStaff();

    return (
        <div className="flex min-h-svh flex-col items-stretch bg-background">
            <div className="flex flex-1">
                <AppSidebar />
                <main className="flex-1 overflow-auto p-4 pt-16 md:p-6 md:pt-6">{children}</main>
            </div>
        </div>
    );
}
