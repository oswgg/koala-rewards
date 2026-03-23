'use client';

import { Button } from '@/ui/button';
import { useCreateLoyaltyProgram } from '@/modules/programs/hooks/useCreateLoyaltyProgram';
import { TypeSelect } from '@/modules/programs/components/new/steps/type-select';
import { DetailInfo } from '@/modules/programs/components/new/steps/detail-info';
import { ConfirmStep } from '@/modules/programs/components/new/steps/confirm-step';

export default function NewProgramPage() {
    const { form, step, nextStep, prevStep, isSubmitting } = useCreateLoyaltyProgram();

    return (
        <div className="mx-auto max-w-2xl space-y-6 px-2 md:space-y-8 md:px-0">
            <form.AppForm>
                <form.Subscribe
                    selector={(state) => ({
                        step,
                        fieldMeta: state.fieldMeta,
                        values: state.values,
                    })}
                >
                    {({ step: currentStep }) => (
                        <>
                            {currentStep === 'type' && <TypeSelect nextStep={nextStep} />}
                            {currentStep === 'details' && (
                                <DetailInfo prevStep={prevStep} nextStep={nextStep} />
                            )}
                            {currentStep === 'confirm' && (
                                <ConfirmStep prevStep={prevStep} isSubmitting={isSubmitting} />
                            )}
                        </>
                    )}
                </form.Subscribe>
            </form.AppForm>
        </div>
    );
}
