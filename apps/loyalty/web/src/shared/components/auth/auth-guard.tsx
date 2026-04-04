import { redirect } from 'next/navigation';
import { getServerAuthRepository } from '@/shared/lib/server-auth';
import { customerPortalRoutes } from '@vado/loyalty';

export async function AuthGuard({
    children,
    redirectTo = customerPortalRoutes.login,
}: {
    children: React.ReactNode;
    redirectTo?: string;
}) {
    const authRepository = getServerAuthRepository();
    const user = await authRepository.getCurrentUser();
    if (!user) {
        redirect(redirectTo);
    }

    return <>{children}</>;
}
