import { AuthGuard } from '@/shared/components/auth/auth-guard';
import { MembershipSyncProvider } from '@/modules/memberships/components/membership-sync-provider';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <MembershipSyncProvider>
                <div>{children}</div>
            </MembershipSyncProvider>
        </AuthGuard>
    );
}
