import { formOptions } from '@tanstack/react-form';
import { useCallback, useState } from 'react';
import { useCreateProfileAndMembershipMutation } from './useCreateProfileAndMembershipMutation';
import { z } from 'zod';
import { useAppForm } from '@/infrastructure/tanstack-form/form-context';

export const newCustomerFormSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    phone: z.string().min(1, 'El teléfono es requerido'),
    selectedProgramIds: z.array(z.string()).min(1, 'Selecciona al menos un programa'),
});

export const newCustomerFormOptions = formOptions({
    defaultValues: {
        name: '',
        phone: '',
        selectedProgramIds: [] as string[],
    },
    validators: {
        onSubmit: newCustomerFormSchema,
    },
});

export type NewCustomerFormStep = 'phone' | 'name' | 'select-program';

const stepFields: Partial<
    Record<NewCustomerFormStep, Array<keyof z.infer<typeof newCustomerFormSchema>>>
> = {
    phone: ['phone'],
    name: ['name'],
    'select-program': ['selectedProgramIds'],
};

const defaultFormValues = newCustomerFormOptions.defaultValues;

export function useNewCustomerForm() {
    const createProfileAndMembershipsMutation = useCreateProfileAndMembershipMutation();

    const [step, setStep] = useState<NewCustomerFormStep>('phone');
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useAppForm({
        ...newCustomerFormOptions,
        onSubmit: async ({ value }: { value: z.infer<typeof newCustomerFormSchema> }) => {
            await createProfileAndMembershipsMutation.mutateAsync({
                name: value.name,
                phone: value.phone,
                programsPublicIds: value.selectedProgramIds,
            });
            setIsSuccess(true);
        },
    });

    const resetForNewCustomer = useCallback(() => {
        setIsSuccess(false);
        setStep('phone');
        form.reset(defaultFormValues);
        form.setErrorMap({ onSubmit: { fields: {} } });
    }, [form]);

    const validateStep = useCallback(async (): Promise<boolean> => {
        const fields = stepFields[step];
        if (!fields) return true;

        const values = form.state.values;
        const result = newCustomerFormSchema.safeParse(values);
        if (result.success) return true;

        const errors = z.treeifyError(result.error).properties ?? {};
        const errorMap: Record<string, unknown> = {};
        let hasError = false;

        for (const field of fields) {
            const fieldError = errors[field]?.errors;
            if (fieldError?.length) {
                errorMap[field] = fieldError;
                hasError = true;
            }
        }

        if (!hasError) return true;

        form.setErrorMap({
            onSubmit: {
                fields: errorMap,
            },
        });
        return false;
    }, [form, step]);

    const goToNextStep = useCallback(() => {
        if (step === 'phone') setStep('name');
        else if (step === 'name') setStep('select-program');
    }, [step]);

    const prevStep = () => {
        form.setErrorMap({ onSubmit: { fields: {} } });
        if (step === 'name') setStep('phone');
        else if (step === 'select-program') setStep('name');
    };

    return {
        form,
        step,
        validateStep,
        goToNextStep,
        prevStep,
        isSuccess,
        resetForNewCustomer,
        isSubmitting: createProfileAndMembershipsMutation.isPending,
    };
}
