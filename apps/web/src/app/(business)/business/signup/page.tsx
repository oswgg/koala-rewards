import { AuthForm } from '@/shared/components/auth-form';
import { businessPortalRoutes } from '@koalacards/loyalty';

export default function SignupPage() {
    return (
        <div className="flex min-h-svh flex-col items-center p-6 pt-24 gap-6 bg-background">
            <div className="w-full max-w-sm">
                <AuthForm
                    type="signup"
                    redirectTo={businessPortalRoutes.onboarding}
                    redirectOnChange={{
                        login: businessPortalRoutes.login,
                        signup: businessPortalRoutes.signup,
                    }}
                />
            </div>
        </div>
    );
}
