import { AuthForm } from '@/shared/components/auth-form';
import { businessRoutes } from '@/shared/lib/routes';

export default function SignupPage() {
    return (
        <div className="flex min-h-svh flex-col items-center p-6 pt-24 gap-6 bg-background">
            <div className="w-full max-w-sm">
                <AuthForm
                    type="signup"
                    redirectTo={businessRoutes.onboarding}
                    redirectOnChange={{
                        login: businessRoutes.login,
                        signup: businessRoutes.signup,
                    }}
                />
            </div>
        </div>
    );
}
