'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';
import { useMutation } from '@tanstack/react-query';

import { Loader2 } from 'lucide-react';
import { ScanActivityForm } from './scan-activity-form';
import { ScanFlowStickyHeader } from './scan-flow-sticky-header';

import { profilesRepository, membershipRepository, programsRepository } from '@/infrastructure';

import { Button, FormRadioGroup, Input, Label, cn } from '@vado/shared/ui';
import type { ProfileByContact } from '@vado/loyalty';
import { MembershipCardPreview } from '@vado/loyalty/ui/components';
import { useMembershipByClientId } from '@vado/loyalty/hooks/memberships/useMembershipByClientId';
import { usePrograms, UseProgramsResult } from '@vado/loyalty/hooks/programs/usePrograms';

type Step = 'phone' | 'select-program' | 'activity';

const STEP_ORDER: Step[] = ['phone', 'select-program', 'activity'];

const STEP_LABEL: Record<Step, string> = {
    phone: 'Contacto',
    'select-program': 'Programa',
    activity: 'Actividad',
};

const STEP_META: Record<Step, { title: string; subtitle: string }> = {
    phone: {
        title: 'Teléfono o correo del cliente',
        subtitle: 'Lo usaremos para encontrar su perfil, igual que al registrarlo.',
    },
    'select-program': {
        title: 'Programa de fidelidad',
        subtitle: 'Elige en qué tarjeta registrar la visita o la venta.',
    },
    activity: {
        title: 'Registrar actividad',
        subtitle: 'Marca visita o venta en la tarjeta del cliente.',
    },
};

const FIELD_INPUT_CLASS = 'h-14 min-h-14 text-lg md:h-16 md:min-h-16 md:text-xl';

/** Padre en scan/page: `fixed inset-0 flex flex-col`. Misma columna que el formulario de nuevo cliente. */
const FLOW_ROOT = 'flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background';

function StepIndicator({ activeStep }: { activeStep: Step }) {
    const activeIndex = STEP_ORDER.indexOf(activeStep);
    const total = STEP_ORDER.length;

    return (
        <nav className="w-full space-y-2" aria-label="Progreso">
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

interface ActivityByPhoneFlowProps {
    onBack: () => void;
    onCancel: () => void;
}

const cancelButtonClass = 'text-destructive hover:bg-destructive/10 hover:text-destructive';

export function ActivityByPhoneFlow({ onBack, onCancel }: ActivityByPhoneFlowProps) {
    const [step, setStep] = useState<Step>('phone');
    const [phoneInput, setPhoneInput] = useState('');
    const [foundProfile, setFoundProfile] = useState<ProfileByContact | null>(null);
    const [selectedProgramPublicId, setSelectedProgramPublicId] = useState<string | null>(null);

    const {
        programs,
        isLoading: programsLoading,
        isError: programsError,
        error: programsErr,
    }: UseProgramsResult = usePrograms({ programsRepository });

    /** Mismo origen que en el paso final (ScanActivityForm): saldo real por programa + perfil */
    const {
        data: membershipForPreview,
        isLoading: membershipPreviewLoading,
        isError: membershipPreviewError,
    } = useMembershipByClientId({
        membershipRepository,
        programPublicId: selectedProgramPublicId ?? undefined,
        profileId: foundProfile?.profileId ?? undefined,
    });

    const findMutation = useMutation({
        mutationFn: () => profilesRepository.findProfileByContact(phoneInput),
    });

    const resetFlow = () => {
        setStep('phone');
        setPhoneInput('');
        setFoundProfile(null);
        setSelectedProgramPublicId(null);
        findMutation.reset();
    };

    const handleSearch = () => {
        const trimmed = phoneInput.trim();
        if (!trimmed) return;
        findMutation.mutate(undefined, {
            onSuccess: (profile) => {
                if (!profile) return;
                setFoundProfile(profile);
                setStep('select-program');
            },
        });
    };

    const handleContinueProgram = () => {
        if (!selectedProgramPublicId) return;
        setStep('activity');
    };

    const backToPhone = () => {
        setStep('phone');
        setSelectedProgramPublicId(null);
        setFoundProfile(null);
        findMutation.reset();
    };

    const activePrograms = programs.filter((p) => p.is_active);

    /** Al entrar al paso, preseleccionar el 1.º programa si aún no hay elección (evita Continuar bloqueado si el radio falla) */
    useEffect(() => {
        if (step !== 'select-program') return;
        const active = programs.filter((p) => p.is_active);
        if (active.length === 0 || !active[0]?.public_id) return;
        setSelectedProgramPublicId((prev) => prev ?? active[0]!.public_id);
    }, [step, programs]);

    useEffect(() => {
        if (step !== 'phone') return;
        const frame = requestAnimationFrame(() => {
            document.getElementById('activity-by-phone-field-contact')?.focus();
        });
        return () => cancelAnimationFrame(frame);
    }, [step]);

    const handleWizardKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== 'Enter' || e.shiftKey) return;
        if (step === 'select-program') return;
        const t = e.target as HTMLElement;
        if (t.tagName === 'TEXTAREA') return;
        e.preventDefault();
        if (step === 'phone') void handleSearch();
    };

    if (step === 'activity' && foundProfile && selectedProgramPublicId) {
        const { title, subtitle } = STEP_META.activity;
        return (
            <div className={FLOW_ROOT}>
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
                        <StepIndicator activeStep="activity" />
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => setStep('select-program')}
                            className="h-12 w-full touch-manipulation text-base md:h-14"
                        >
                            Volver al programa
                        </Button>
                    </ScanFlowStickyHeader>

                    <div className="flex min-h-0 flex-1 flex-col px-4 pt-5 md:px-6 md:pt-6">
                        <header className="mx-auto max-w-md space-y-3 text-left">
                            <p className="text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-3xl">
                                <span className="text-primary">{foundProfile.name}</span>
                            </p>
                            <h2 className="text-lg font-semibold tracking-tight text-foreground/90 md:text-xl">
                                {title}
                            </h2>
                            <p className="text-sm text-muted-foreground md:text-base">{subtitle}</p>
                        </header>

                        <div className="mx-auto w-full max-w-md py-6 md:py-8">
                            <ScanActivityForm
                                programPublicId={selectedProgramPublicId}
                                profileId={foundProfile.profileId}
                                onScanAnother={resetFlow}
                                scanAnotherLabel="Registrar otra actividad"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'select-program' && foundProfile) {
        const { title, subtitle } = STEP_META['select-program'];
        const canContinue = Boolean(selectedProgramPublicId) && activePrograms.length > 0;
        const selectedProgram = selectedProgramPublicId
            ? activePrograms.find((p) => p.public_id === selectedProgramPublicId)
            : undefined;

        return (
            <div className={FLOW_ROOT} onKeyDown={handleWizardKeyDown}>
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
                        <StepIndicator activeStep="select-program" />
                        <div className="flex flex-row flex-nowrap gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={backToPhone}
                                className="h-12 min-w-0 flex-1 touch-manipulation text-base md:h-14"
                            >
                                Volver
                            </Button>
                            <Button
                                type="button"
                                size="lg"
                                disabled={!canContinue}
                                onClick={handleContinueProgram}
                                className="h-12 min-w-0 flex-1 touch-manipulation text-base md:h-14"
                            >
                                Continuar
                            </Button>
                        </div>
                    </ScanFlowStickyHeader>

                    <div className="flex min-h-0 flex-1 flex-col px-4 pb-6 pt-5 md:px-6 md:pb-8 md:pt-6">
                        <header className="mx-auto max-w-md space-y-3 text-center">
                            <p className="text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-3xl">
                                <span className="text-primary">{foundProfile.name}</span>
                            </p>
                            <div className="space-y-1.5">
                                <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                                    {title}
                                </h2>
                                <p className="text-sm text-muted-foreground md:text-base">
                                    {subtitle}
                                </p>
                            </div>
                        </header>

                        <div className="mx-auto w-full max-w-md py-6 md:py-8">
                            {programsLoading ? (
                                <div className="flex w-full items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                                    <Loader2 className="size-5 animate-spin" aria-hidden />
                                    Cargando programas…
                                </div>
                            ) : programsError ? (
                                <p className="text-center text-sm text-destructive" role="alert">
                                    {programsErr?.message ?? 'No se pudieron cargar los programas.'}
                                </p>
                            ) : activePrograms.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground">
                                    No hay programas activos.
                                </p>
                            ) : (
                                <FormRadioGroup
                                    value={selectedProgramPublicId ?? undefined}
                                    onValueChange={(v) => setSelectedProgramPublicId(v)}
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
                            )}
                        </div>

                        {selectedProgram ? (
                            <div className="mx-auto w-full max-w-md px-1">
                                <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Vista previa de la tarjeta
                                </p>
                                {membershipPreviewLoading ? (
                                    <p className="mb-3 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                                        <Loader2 className="size-4 animate-spin" aria-hidden />
                                        Cargando saldo del cliente…
                                    </p>
                                ) : membershipPreviewError ? (
                                    <p
                                        className="mb-3 text-center text-sm text-destructive"
                                        role="alert"
                                    >
                                        No se pudo cargar el saldo. Puedes continuar igualmente.
                                    </p>
                                ) : null}
                                <MembershipCardPreview
                                    businessName={selectedProgram.business.name}
                                    programName={selectedProgram.name}
                                    programType={selectedProgram.type}
                                    rewardDescription={selectedProgram.reward_description}
                                    rewardCost={selectedProgram.reward_cost ?? 0}
                                    cashbackPercentage={selectedProgram.cashback_percentage ?? 0}
                                    pointsPercentage={selectedProgram.points_percentage ?? 0}
                                    balance={Number(membershipForPreview?.balance ?? 0)}
                                    cardTheme={selectedProgram.card_theme}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }

    const { title, subtitle } = STEP_META.phone;

    return (
        <div className={FLOW_ROOT} onKeyDown={handleWizardKeyDown}>
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
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={onBack}
                        >
                            Atrás
                        </Button>
                    </div>
                    <StepIndicator activeStep="phone" />
                    <Button
                        type="button"
                        size="lg"
                        disabled={!phoneInput.trim() || findMutation.isPending}
                        onClick={() => void handleSearch()}
                        className="h-12 w-full touch-manipulation text-base md:h-14"
                    >
                        {findMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 size-5 animate-spin" aria-hidden />
                                Buscando…
                            </>
                        ) : (
                            'Buscar'
                        )}
                    </Button>
                </ScanFlowStickyHeader>

                <div className="flex min-h-0 flex-1 flex-col px-4 pb-6 pt-5 md:px-6 md:pb-8 md:pt-6">
                    <header className="space-y-1.5 text-left">
                        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                            {title}
                        </h2>
                        <p className="max-w-md text-sm text-muted-foreground md:text-base">
                            {subtitle}
                        </p>
                    </header>

                    <div className="flex min-h-0 w-full py-6 md:py-8">
                        <div className="w-full max-w-md space-y-2">
                            <Label htmlFor="activity-by-phone-field-contact" className="sr-only">
                                Contacto
                            </Label>
                            <Input
                                id="activity-by-phone-field-contact"
                                type="text"
                                inputMode="tel"
                                autoComplete="tel"
                                enterKeyHint="search"
                                placeholder="Ej: 555 123 4567"
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value)}
                                disabled={findMutation.isPending}
                                className={FIELD_INPUT_CLASS}
                            />

                            {findMutation.isError && (
                                <p className="text-sm text-destructive" role="alert">
                                    No se pudo buscar. Intenta de nuevo.
                                </p>
                            )}

                            {findMutation.isSuccess &&
                                findMutation.data === null &&
                                !findMutation.isPending && (
                                    <p
                                        className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                                        role="alert"
                                    >
                                        No encontramos un cliente con ese contacto. Verifica el dato
                                        o regístralo primero.
                                    </p>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
