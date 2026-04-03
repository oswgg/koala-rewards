import { redirect } from 'next/navigation';
import { getServerAuthRepository } from '@/shared/lib/auth';
import { customerRoutes } from '@/shared/lib/routes';

export async function AuthGuard({
    children,
    redirectTo = customerRoutes.login,
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
