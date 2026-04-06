import { redirect } from 'next/navigation';
import { getServerAuthRepository } from '@/shared/lib/server-auth';
import { businessPortalRoutes } from '@vado/loyalty';

export async function StaffGuard({
    children,
    redirectToLogin = businessPortalRoutes.login,
    redirectToOnboarding = businessPortalRoutes.onboarding,
}: {
    children: React.ReactNode;
    redirectToLogin?: string;
    redirectToOnboarding?: string;
}) {
    const authRepository = getServerAuthRepository();
    const user = await authRepository.getCurrentUser();
    if (!user) {
        redirect(redirectToLogin);
    }

    const [isOwner, isStaff] = await Promise.all([
        authRepository.isBusinessOwner(),
        authRepository.isBusinessStaff(),
    ]);

    if (!isOwner && !isStaff) {
        redirect(redirectToOnboarding);
    }

    return <>{children}</>;
}
