'use client';

import { Loader2 } from 'lucide-react';

import { newCustomerFormOptions } from '@/hooks/useNewCustomerForm';
import { programsRepository } from '@/infrastructure/programs';
import { useTypedAppFormContext } from '@/infrastructure/tanstack-form/form-context';

import { FormCheckboxGroup } from '@vado/shared/ui';
import {
    type UseProgramsResult,
    usePrograms,
} from '@vado/loyalty/hooks/programs/usePrograms';

export function SelectProgramStep() {
    const form = useTypedAppFormContext(newCustomerFormOptions);
    const { programs, isLoading, isError, error }: UseProgramsResult = usePrograms({
        programsRepository,
    });

    if (isLoading) {
        return (
            <div className="flex w-full max-w-md items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Cargando programas…
            </div>
        );
    }

    if (isError) {
        return (
            <p className="text-sm text-destructive" role="alert">
                {error?.message ?? 'No se pudieron cargar los programas.'}
            </p>
        );
    }

    const activePrograms = programs.filter((p) => p.is_active);

    if (activePrograms.length === 0) {
        return (
            <p className="max-w-md text-sm text-muted-foreground">
                No hay programas activos. Crea o activa un programa para poder inscribir clientes.
            </p>
        );
    }

    return (
        <form.Field name="selectedProgramIds">
            {(field) => (
                <div className="w-full max-w-md space-y-3">
                    <FormCheckboxGroup
                        value={field.state.value ?? []}
                        onValueChange={(ids) => field.handleChange(ids)}
                        options={activePrograms.map((program) => ({
                            value: program.public_id,
                            label: program.name,
                            description:
                                program.type === 'stamps'
                                    ? 'Sellos'
                                    : program.type === 'points'
                                      ? 'Puntos'
                                      : 'Cashback',
                        }))}
                    />
                    {field.state.meta.errors?.[0] ? (
                        <p className="text-sm text-destructive" role="alert">
                            {String(field.state.meta.errors[0])}
                        </p>
                    ) : null}
                </div>
            )}
        </form.Field>
    );
}
