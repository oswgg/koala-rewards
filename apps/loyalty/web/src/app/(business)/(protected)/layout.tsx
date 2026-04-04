import { AuthGuard } from '@/shared/components/auth/auth-guard';
import { businessPortalRoutes } from '@vado/loyalty';

export default function ProtectedBusinessLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard redirectTo={businessPortalRoutes.login}>{children}</AuthGuard>;
}
