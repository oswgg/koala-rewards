import { programTypeOptions } from '@/modules/programs/data/program-type-options';
import { createProgramFormOptions } from '@/modules/programs/hooks/useCreateLoyaltyProgram';
import { useTypedAppFormContext } from '@/infrastructure/tanstack-form/form-context';
import { Button, FormRadioGroup } from '@koalacards/shared/ui';

interface TypeSelectProps {
    nextStep: () => void;
}

export function TypeSelect({ nextStep }: TypeSelectProps) {
    const form = useTypedAppFormContext(createProgramFormOptions);

    return (
        <>
            <div className="text-center">
                <h1 className="text-2xl font-bold">Tipo de programa</h1>
                <p className="mt-1 text-muted-foreground">
                    Selecciona el tipo de programa que quieres crear
                </p>
            </div>
            <form.Field name="type">
                {(field) => (
                    <div className="space-y-2">
                        <FormRadioGroup
                            value={field.state.value}
                            onValueChange={(v) =>
                                field.handleChange(v as 'stamps' | 'points' | 'cashback')
                            }
                            options={programTypeOptions}
                            className="sm:grid-cols-2"
                        />

                        {field.state.meta.errors?.length ? (
                            <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                        ) : null}
                    </div>
                )}
            </form.Field>
            <div className="flex justify-end">
                <Button type="button" onClick={nextStep}>
                    Continuar
                </Button>
            </div>
        </>
    );
}
