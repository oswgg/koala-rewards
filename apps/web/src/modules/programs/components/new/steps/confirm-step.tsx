'use client';

import { useTypedAppFormContext } from '@/infrastructure/tanstack-form/form-context';
import { createProgramFormOptions } from '@/modules/programs/hooks/useCreateLoyaltyProgram';
import { Button, FieldLabel } from '@koalacards/shared/ui';
import { MemberShipCardDetailView } from '@/shared/components/wallets/mermbership-card-detail';
import {
    buildProgramJoinUrl,
    CARD_THEME_NAMES,
    CARD_THEMES,
    CardThemeName,
    getCardTheme,
    StoredLoyaltyProgram,
} from '@koalacards/loyalty';

interface ConfirmStepProps {
    prevStep: () => void;
    isSubmitting: boolean;
}

function toPreviewProgram(values: Record<string, unknown>): StoredLoyaltyProgram {
    const base = {
        id: 'preview',
        business_id: '',
        public_id: 'preview',
        created_at: '',
        is_active: true,
        name: String(values.name ?? ''),
        reward_description: String(values.reward_description ?? ''),
        limit_one_per_day: Boolean(values.limit_one_per_day ?? false),
        card_theme: (String(values.card_theme ?? 'neutral') || 'neutral') as CardThemeName,
        business: {
            id: '',
            name: '',
            slug: '',
            created_at: '',
        },
    };
    const type = values.type as 'stamps' | 'points' | 'cashback';
    if (type === 'stamps') {
        return {
            ...base,
            type: 'stamps',
            reward_cost: Number(values.reward_cost ?? 10),
            points_percentage: null,
            cashback_percentage: null,
        };
    }
    if (type === 'points') {
        return {
            ...base,
            type: 'points',
            points_percentage: Number(values.points_percentage ?? 1),
            cashback_percentage: null,
            reward_cost: Number(values.reward_cost ?? 100),
        };
    }
    return {
        ...base,
        type: 'cashback',
        reward_description: null,
        cashback_percentage: Number(values.cashback_percentage ?? 5),
        points_percentage: null,
        reward_cost: null,
    };
}

export function ConfirmStep({ prevStep, isSubmitting }: ConfirmStepProps) {
    const form = useTypedAppFormContext(createProgramFormOptions);

    const handleConfirm = () => form.handleSubmit();

    const baseUrl =
        typeof window !== 'undefined'
            ? window.location.origin
            : (process.env.NEXT_PUBLIC_APP_URL ?? '');

    return (
        <div className="space-y-8">
            <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Confirmar programa</h1>
                <p className="text-muted-foreground">Revisa cómo se verá tu tarjeta de fidelidad</p>
            </div>

            <form.Subscribe selector={(state) => state.values}>
                {(values) => {
                    const program = toPreviewProgram(values as Record<string, unknown>);
                    const joinUrl = buildProgramJoinUrl(baseUrl, program);
                    const theme = getCardTheme(values.card_theme);
                    return (
                        <div className="space-y-6">
                            <form.Field name="card_theme">
                                {(field) => (
                                    <div className="space-y-2">
                                        <FieldLabel>Elige el color de tu tarjeta</FieldLabel>
                                        <div className="grid grid-cols-7 gap-2">
                                            {CARD_THEME_NAMES.map((name) => {
                                                const th = CARD_THEMES[name];
                                                const isSelected =
                                                    (field.state.value ?? 'neutral') === name;
                                                return (
                                                    <button
                                                        key={name}
                                                        type="button"
                                                        title={th.name}
                                                        onClick={() =>
                                                            field.handleChange(
                                                                name as CardThemeName
                                                            )
                                                        }
                                                        className={`flex h-10 flex-col items-center justify-center rounded-lg border-2 transition-colors ${
                                                            isSelected
                                                                ? 'border-primary ring-2 ring-primary/20'
                                                                : 'border-border hover:border-muted-foreground'
                                                        }`}
                                                        style={{ backgroundColor: th.bg }}
                                                    >
                                                        <span
                                                            className="truncate px-1 text-[10px] font-medium max-w-full"
                                                            style={{ color: th.text }}
                                                        >
                                                            {th.name}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </form.Field>

                            <div className="flex justify-center rounded-xl border border-border bg-muted/30 p-8">
                                <div className="min-w-90 overflow-hidden rounded-3xl shadow-lg">
                                    <MemberShipCardDetailView
                                        businessName={program.business.name}
                                        programName={program.name}
                                        programType={program.type}
                                        rewardDescription={program.reward_description}
                                        rewardCost={program.reward_cost ?? 0}
                                        cashbackPercentage={program.cashback_percentage ?? 0}
                                        pointsPercentage={program.points_percentage ?? 0}
                                        balance={0}
                                        qrUrl={joinUrl}
                                        theme={theme}
                                        variant="business"
                                        size="lg"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                }}
            </form.Subscribe>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                <Button type="button" variant="outline" onClick={prevStep} disabled={isSubmitting}>
                    Atrás
                </Button>
                <Button type="button" onClick={handleConfirm} disabled={isSubmitting}>
                    {isSubmitting ? 'Creando...' : 'Crear programa'}
                </Button>
            </div>
        </div>
    );
}
