import { requireAuth } from '@/shared/lib/auth';
import { businessRoutes } from '@/shared/lib/routes';

export default async function ProtectedBusinessLayout({ children }: { children: React.ReactNode }) {
    await requireAuth(businessRoutes.login);
    return <>{children}</>;
}
