import { redirect } from 'next/navigation';
import { getServerAuthRepository } from '@/shared/lib/auth';
import { businessRoutes } from '@/shared/lib/routes';

export async function StaffGuard({
    children,
    redirectToLogin = businessRoutes.login,
    redirectToOnboarding = businessRoutes.onboarding,
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
