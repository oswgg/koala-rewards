import { AuthGuard } from '@/shared/components/auth/auth-guard';
import { businessRoutes } from '@/shared/lib/routes';

export default function ProtectedBusinessLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard redirectTo={businessRoutes.login}>{children}</AuthGuard>;
}
