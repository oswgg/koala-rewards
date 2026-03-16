import { AuthForm } from '@/shared/components/auth-form';
import { customerRoutes } from '@/shared/lib/routes';

export default function LoginPage() {
    return (
        <div className="flex min-h-svh flex-col items-center p-6 pt-24 gap-6 bg-background">
            <div className="w-full max-w-sm">
                <AuthForm
                    type="login"
                    redirectTo={customerRoutes.app}
                    redirectOnChange={{
                        login: customerRoutes.login,
                        signup: customerRoutes.signup,
                    }}
                />
            </div>
        </div>
    );
}
