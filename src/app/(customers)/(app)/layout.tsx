import { AuthGuard } from '@/shared/components/auth-guard';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    // await requireAuth(customerRoutes.login);

    return (
        <AuthGuard>
            <div>{children}</div>
        </AuthGuard>
    );
}
