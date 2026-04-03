import { OnboardingForm } from '@/modules/business-auth/onboarding/components/onboarding-form';

export default function OnboardingPage() {
    return (
        <div className="flex min-h-svh flex-col items-center p-6 pt-24 gap-6 bg-background">
            <div className="w-full max-w-sm">
                <OnboardingForm />
            </div>
        </div>
    );
}
