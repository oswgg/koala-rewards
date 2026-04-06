'use client';

import { useEffect, type KeyboardEvent } from 'react';
import { CheckCircle2, QrCode, UserPlus } from 'lucide-react';

import { ScanFlowStickyHeader } from '../scan-flow-sticky-header';
import { NameStep } from './steps/name-step';
import { PhoneStep } from './steps/phone-step';
import { SelectProgramStep } from './steps/select-program-step';

import { type NewCustomerFormStep, useNewCustomerForm } from '@/hooks/useNewCustomerForm';

import { Button, cn } from '@vado/shared/ui';

type NewCustomerFormProps = {
    onRegisterVisit: () => void;
    onCancel: () => void;
};

const cancelButtonClass = 'text-destructive hover:bg-destructive/10 hover:text-destructive';

const STEP_ORDER: NewCustomerFormStep[] = ['phone', 'name', 'select-program'];

const STEP_LABEL: Record<NewCustomerFormStep, string> = {
    phone: 'Teléfono',
    name: 'Nombre',
    'select-program': 'Programa',
};

const STEP_META: Record<NewCustomerFormStep, { title: string; subtitle: string }> = {
    phone: {
        title: 'Teléfono del cliente',
        subtitle: 'Lo usaremos para identificarlo en futuras visitas.',
    },
    name: {
        title: 'Nombre',
        subtitle: 'Así lo verás en la lista y en la tarjeta.',
    },
    'select-program': {
        title: 'Programas de fidelidad',
        subtitle: 'Marca en cuáles quieres inscribir a este cliente.',
    },
};

function StepIndicator({ activeStep }: { activeStep: NewCustomerFormStep }) {
    const activeIndex = STEP_ORDER.indexOf(activeStep);
    const total = STEP_ORDER.length;

    return (
        <nav className="w-full space-y-2" aria-label="Progreso del registro">
            <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="shrink-0 tabular-nums text-muted-foreground">
                    Paso {activeIndex + 1} de {total}
                </span>
                <span className="min-w-0 truncate text-right font-medium text-foreground">
                    {STEP_LABEL[activeStep]}
                </span>
            </div>
            <div className="flex gap-1.5" role="presentation" aria-hidden>
                {STEP_ORDER.map((id, index) => (
                    <div
                        key={id}
                        className={cn(
                            'h-1 min-w-0 flex-1 rounded-full transition-colors',
                            index <= activeIndex ? 'bg-primary' : 'bg-muted'
                        )}
                    />
                ))}
            </div>
        </nav>
    );
}

export function NewCustomerForm({ onRegisterVisit, onCancel }: NewCustomerFormProps) {
    const {
        form,
        step,
        validateStep,
        goToNextStep,
        prevStep,
        isSuccess,
        resetForNewCustomer,
        isSubmitting,
    } = useNewCustomerForm();
    const { title, subtitle } = STEP_META[step];

    const handleContinue = async () => {
        form.setErrorMap({ onSubmit: { fields: {} } });
        const valid = await validateStep();
        if (!valid) return;
        goToNextStep();
    };

    const handleFinish = async () => {
        form.setErrorMap({ onSubmit: { fields: {} } });
        const valid = await validateStep();
        if (!valid) return;
        await form.handleSubmit();
    };

    useEffect(() => {
        if (step !== 'phone' && step !== 'name') return;
        const id = `new-customer-field-${step}`;
        const frame = requestAnimationFrame(() => {
            document.getElementById(id)?.focus();
        });
        return () => cancelAnimationFrame(frame);
    }, [step]);

    const handleRootKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (isSuccess) return;
        if (e.key !== 'Enter' || e.shiftKey) return;
        if (step === 'select-program') return;
        const t = e.target as HTMLElement;
        if (t.tagName === 'TEXTAREA') return;
        e.preventDefault();
        void handleContinue();
    };

    if (isSuccess) {
        return (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                <ScanFlowStickyHeader>
                    <div className="flex items-center justify-between gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={cancelButtonClass}
                            onClick={onCancel}
                        >
                            Cancelar
                        </Button>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">Registrar cliente</p>
                </ScanFlowStickyHeader>
                <div className="flex min-h-0 flex-1 flex-col px-4 pt-5 md:px-6 md:pt-6">
                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 py-8 text-center md:py-12">
                        <div className="flex max-w-md flex-col items-center gap-3">
                            <CheckCircle2
                                className="size-14 text-emerald-600 dark:text-emerald-500"
                                aria-hidden
                            />
                            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                                Cliente registrado
                            </h2>
                            <p className="text-sm text-muted-foreground md:text-base">
                                El cliente ya está inscrito en los programas elegidos. ¿Qué quieres
                                hacer ahora?
                            </p>
                        </div>
                        <div className="flex w-full max-w-md flex-col gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex flex-col items-center gap-4 p-12"
                                onClick={() => resetForNewCustomer()}
                            >
                                <UserPlus className="size-6" aria-hidden />
                                <span className="text-lg font-medium">Registrar Cliente</span>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="flex flex-col items-center gap-4 p-12"
                                onClick={onRegisterVisit}
                            >
                                <QrCode className="size-6" aria-hidden />
                                <span className="text-lg font-medium">Registrar actividad</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form.AppForm>
            <div
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
                onKeyDown={handleRootKeyDown}
            >
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                    <ScanFlowStickyHeader>
                        <div className="flex items-center justify-between gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={cancelButtonClass}
                                onClick={onCancel}
                            >
                                Cancelar
                            </Button>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Registrar cliente
                        </p>
                        <StepIndicator activeStep={step} />
                        <div className="flex flex-row flex-nowrap gap-3">
                            {step !== 'phone' ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={prevStep}
                                    disabled={isSubmitting}
                                    className="h-12 min-w-0 flex-1 touch-manipulation text-base md:h-14"
                                >
                                    Volver
                                </Button>
                            ) : null}
                            {step !== 'select-program' ? (
                                <Button
                                    type="button"
                                    size="lg"
                                    disabled={isSubmitting}
                                    onClick={() => void handleContinue()}
                                    className={cn(
                                        'h-12 min-w-0 touch-manipulation text-base md:h-14',
                                        step === 'phone' ? 'w-full' : 'flex-1'
                                    )}
                                >
                                    Continuar
                                </Button>
                            ) : (
                                <form.Subscribe
                                    selector={(state) => state.values.selectedProgramIds}
                                >
                                    {(selectedProgramIds) => (
                                        <Button
                                            type="button"
                                            size="lg"
                                            disabled={!selectedProgramIds?.length || isSubmitting}
                                            onClick={() => void handleFinish()}
                                            className="h-12 min-w-0 flex-1 touch-manipulation text-base md:h-14"
                                        >
                                            {isSubmitting ? 'Guardando…' : 'Finalizar'}
                                        </Button>
                                    )}
                                </form.Subscribe>
                            )}
                        </div>
                    </ScanFlowStickyHeader>

                    <div className="flex min-h-0 flex-1 flex-col px-4 pb-6 pt-5 md:px-6 md:pb-8 md:pt-6">
                        <header className="shrink-0 space-y-1.5 text-left">
                            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                                {title}
                            </h2>
                            <p className="max-w-md text-sm text-muted-foreground md:text-base">
                                {subtitle}
                            </p>
                        </header>

                        <div className="flex min-h-0 w-full py-6 md:py-8">
                            {step === 'phone' ? <PhoneStep /> : null}
                            {step === 'name' ? <NameStep /> : null}
                            {step === 'select-program' ? <SelectProgramStep /> : null}
                        </div>
                    </div>
                </div>
            </div>
        </form.AppForm>
    );
}
