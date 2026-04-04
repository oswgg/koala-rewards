import { AppSidebar } from '@/modules/dashboard/components/app-sidebar';
import { StaffGuard } from '@/shared/components/auth/staff-guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <StaffGuard>
            <div className="flex min-h-svh flex-col items-stretch bg-background">
                <div className="flex flex-1">
                    <AppSidebar />
                    <main className="flex-1 overflow-auto p-4 pt-16 md:p-6 md:pt-6">
                        {children}
                    </main>
                </div>
            </div>
        </StaffGuard>
    );
}
