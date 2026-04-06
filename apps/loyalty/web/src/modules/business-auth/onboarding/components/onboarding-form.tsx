'use client';

import { useOnboardingForm } from '@/modules/business-auth/onboarding/hooks/useOnboardingForm';
import { cn } from '@/shared/lib/utils';
import {
    Button,
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    Input,
} from '@vado/shared/ui';

export function OnboardingForm({ className, ...props }: React.ComponentProps<'div'>) {
    const { name, setName, handleSubmit, createBusinessMutation } = useOnboardingForm();

    const error =
        createBusinessMutation.error instanceof Error ? createBusinessMutation.error.message : null;

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <form onSubmit={handleSubmit}>
                <FieldGroup className="items-center">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-xl font-bold">Registra tu negocio</h1>
                        <FieldDescription>
                            Completa la información para configurar tu cuenta
                        </FieldDescription>
                    </div>

                    {error && (
                        <div
                            className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <Field className="items-center">
                        <FieldLabel htmlFor="business-name">Nombre del negocio</FieldLabel>
                        <Input
                            id="business-name"
                            type="text"
                            placeholder="Mi tienda"
                            autoComplete="organization"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={createBusinessMutation.isPending}
                        />
                    </Field>

                    <Field className="items-center">
                        <Button
                            type="submit"
                            disabled={createBusinessMutation.isPending || !name.trim()}
                        >
                            {createBusinessMutation.isPending ? 'Guardando...' : 'Continuar'}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        </div>
    );
}
