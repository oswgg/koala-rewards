import { useAppForm } from '@/infrastructure/tanstack-form/form-context';
import { businessRoutes } from '@/shared/lib/routes';
import { formOptions, revalidateLogic } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import { programsQueryKey } from './usePrograms';
import { queryClient } from '@/shared/lib/query-client';
import { programsRepository } from '@/infrastructure';
import { CreateProgramInput } from '@koalacards/loyalty';

type Step = 'type' | 'details' | 'confirm';

const createProgramSchema = z.discriminatedUnion(
    'type',
    [
        z
            .object({
                type: z.literal('stamps'),
                name: z.string('El nombre del programa es requerido').min(1),
                reward_description: z.string('La descripción de la recompensa es requerida').min(1),
                points_percentage: z.preprocess(() => null, z.null()),
                cashback_percentage: z.preprocess(() => null, z.null()),
                reward_cost: z.number('El costo de la recompensa es requerido').min(1),
                limit_one_per_day: z.boolean().default(false),
                card_theme: z.string().default('neutral'),
            })
            .strict(),
        z
            .object({
                type: z.literal('points'),
                name: z.string('El nombre del programa es requerido').min(1),
                reward_description: z.string('La descripción de la recompensa es requerida').min(1),
                points_percentage: z.number('El porcentaje de puntos es requerido').min(1),
                cashback_percentage: z.preprocess(() => null, z.null()),
                reward_cost: z.preprocess(() => null, z.null()),
                limit_one_per_day: z.boolean().default(false),
                card_theme: z.string().default('neutral'),
            })
            .strict(),
        z
            .object({
                type: z.literal('cashback'),
                name: z.string('El nombre del programa es requerido').min(1),
                reward_description: z.preprocess(() => null, z.null()),
                points_percentage: z.preprocess(() => null, z.null()),
                cashback_percentage: z.number('El porcentaje de cashback es requerido').min(1),
                reward_cost: z.preprocess(() => null, z.null()),
                limit_one_per_day: z.boolean().default(false),
                card_theme: z.string().default('neutral'),
            })
            .strict(),
    ],
    {
        error: (issue) => {
            if (issue.code === z.ZodIssueCode.invalid_union) {
                return { message: 'Debes seleccionar un tipo de programa' };
            }
        },
    }
);

export const createProgramFormOptions = formOptions({
    defaultValues: {} as CreateProgramFormValues,
    validationLogic: revalidateLogic(),
    validators: {
        // @ts-expect-error - createProgramSchema is not typed
        onSubmit: createProgramSchema,
    },
});

// Single source of truth — el tipo viene del schema
type CreateProgramFormValues = z.infer<typeof createProgramSchema>;

export function useCreateLoyaltyProgram() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('type');

    const createProgramMutation = useMutation({
        mutationFn: async (program: CreateProgramInput) => {
            return programsRepository.create(program);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: programsQueryKey });
            router.push(businessRoutes.programs);
        },
    });

    const form = useAppForm({
        ...createProgramFormOptions,
        defaultValues: {
            type: 'stamps',
            limit_one_per_day: false,
            card_theme: 'neutral',
        } as CreateProgramFormValues,
        onSubmit: async ({ value }: { value: CreateProgramFormValues }) => {
            await createProgramMutation.mutateAsync(value as CreateProgramInput);
        },
    });

    const validateStep = async (): Promise<boolean> => {
        const fieldsPerStep: Partial<Record<Step, Array<keyof CreateProgramFormValues>>> = {
            type: ['type'],
            details: [
                'name',
                'reward_description',
                'reward_cost',
                'cashback_percentage',
                'points_percentage',
            ],
        };

        const fields = fieldsPerStep[step];
        if (!fields) return true;

        const values = form.state.values;
        const result = createProgramSchema.safeParse(values);

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
    };

    const nextStep = async () => {
        form.setErrorMap({ onSubmit: { fields: {} } });
        const valid = await validateStep();
        if (!valid) return;

        if (step === 'type') setStep('details');
        else if (step === 'details') setStep('confirm');
    };

    const prevStep = () => {
        form.setErrorMap({ onSubmit: { fields: {} } });
        if (step === 'confirm') setStep('details');
        else if (step === 'details') setStep('type');
    };

    return {
        form,
        step,
        nextStep,
        prevStep,
        isSubmitting: createProgramMutation.isPending,
    };
}
