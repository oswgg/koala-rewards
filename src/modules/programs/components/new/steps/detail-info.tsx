import { useTypedAppFormContext } from '@/infrastructure/tanstack-form/form-context';
import { createProgramFormOptions } from '@/modules/programs/hooks/useCreateLoyaltyProgram';
import { SwitchDescription } from '@/shared/components/switch-description';
import { Button } from '@/shared/components/ui/button';
import { FieldLabel } from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';

interface DetailInfoProps {
    prevStep: () => void;
    nextStep: () => void;
}

export function DetailInfo({ prevStep, nextStep }: DetailInfoProps) {
    const form = useTypedAppFormContext(createProgramFormOptions);

    return (
        <div className="space-y-8">
            <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Detalles del programa</h1>
                <p className="text-muted-foreground">
                    Ingresa los detalles del programa que quieres crear
                </p>
            </div>
            <form.Subscribe selector={(state) => state.values.type}>
                {(programType) => (
                    <div className="space-y-6 rounded-xl border border-border bg-muted/30 p-6">
                        <form.Field name="name">
                            {(field) => (
                                <div className="space-y-2">
                                    <FieldLabel htmlFor="name">Nombre del programa</FieldLabel>
                                    <Input
                                        id="name"
                                        value={field.state.value ?? ''}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="Ej: Café gratis cada 10 compras"
                                        className="h-10"
                                    />
                                    {field.state.meta.errors?.length ? (
                                        <p className="text-sm text-destructive">
                                            {field.state.meta.errors?.[0]}
                                        </p>
                                    ) : null}
                                </div>
                            )}
                        </form.Field>

                        {programType !== 'cashback' && (
                            <form.Field name="reward_description">
                                {(field) => (
                                    <div className="space-y-2">
                                        <FieldLabel htmlFor="reward_description">
                                            Recompensa
                                        </FieldLabel>
                                        <Input
                                            id="reward_description"
                                            value={field.state.value ?? ''}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="Ej: Café gratis"
                                            className="h-10"
                                        />
                                        {field.state.meta.errors?.length ? (
                                            <p className="text-sm text-destructive">
                                                {field.state.meta.errors?.[0]}
                                            </p>
                                        ) : null}
                                    </div>
                                )}
                            </form.Field>
                        )}

                        {programType === 'stamps' && (
                            <form.Field name="reward_cost">
                                {(field) => (
                                    <div className="space-y-2">
                                        <FieldLabel htmlFor="reward_cost">
                                            Sellos necesarios para canjear
                                        </FieldLabel>
                                        <Input
                                            placeholder="Ej: 10"
                                            id="reward_cost"
                                            type="number"
                                            min={1}
                                            value={
                                                field.state.value == null || field.state.value === 0
                                                    ? ''
                                                    : field.state.value
                                            }
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                field.handleChange(v === '' ? 0 : Number(v));
                                            }}
                                            className="h-10"
                                        />
                                        {field.state.meta.errors?.length ? (
                                            <p className="text-sm text-destructive">
                                                {field.state.meta.errors?.[0]}
                                            </p>
                                        ) : null}
                                    </div>
                                )}
                            </form.Field>
                        )}

                        {programType === 'points' && (
                            <>
                                <form.Field name="points_percentage">
                                    {(field) => (
                                        <div className="space-y-2">
                                            <FieldLabel htmlFor="points_percentage">
                                                % de puntos por $ gastado
                                            </FieldLabel>
                                            <Input
                                                placeholder="Ej: 5"
                                                id="points_percentage"
                                                type="number"
                                                min={1}
                                                value={
                                                    field.state.value == null ||
                                                    field.state.value === 0
                                                        ? ''
                                                        : field.state.value
                                                }
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    field.handleChange(v === '' ? 0 : Number(v));
                                                }}
                                                className="h-10"
                                            />
                                            {field.state.meta.errors?.length ? (
                                                <p className="text-sm text-destructive">
                                                    {field.state.meta.errors?.[0]}
                                                </p>
                                            ) : null}
                                        </div>
                                    )}
                                </form.Field>
                                <form.Field name="reward_cost">
                                    {(field) => (
                                        <div className="space-y-2">
                                            <FieldLabel htmlFor="reward_cost">
                                                Puntos necesarios para canjear
                                            </FieldLabel>
                                            <Input
                                                placeholder="Ej: 100"
                                                id="reward_cost"
                                                type="number"
                                                min={1}
                                                value={
                                                    field.state.value == null ||
                                                    field.state.value === 0
                                                        ? ''
                                                        : field.state.value
                                                }
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    field.handleChange(v === '' ? 0 : Number(v));
                                                }}
                                                className="h-10"
                                            />
                                            {field.state.meta.errors?.length ? (
                                                <p className="text-sm text-destructive">
                                                    {field.state.meta.errors?.[0]}
                                                </p>
                                            ) : null}
                                        </div>
                                    )}
                                </form.Field>
                            </>
                        )}

                        {programType === 'cashback' && (
                            <form.Field name="cashback_percentage">
                                {(field) => (
                                    <div className="space-y-2">
                                        <FieldLabel htmlFor="cashback_percentage">
                                            % de cashback
                                        </FieldLabel>
                                        <Input
                                            placeholder="Ej: 5"
                                            id="cashback_percentage"
                                            type="number"
                                            min={1}
                                            value={
                                                field.state.value == null || field.state.value === 0
                                                    ? ''
                                                    : field.state.value
                                            }
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                field.handleChange(v === '' ? 0 : Number(v));
                                            }}
                                            className="h-10"
                                        />
                                        {field.state.meta.errors?.length ? (
                                            <p className="text-sm text-destructive">
                                                {field.state.meta.errors?.[0]}
                                            </p>
                                        ) : null}
                                    </div>
                                )}
                            </form.Field>
                        )}

                        <form.Field name="limit_one_per_day">
                            {(field) => (
                                <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
                                    <SwitchDescription
                                        id="limit_one_per_day"
                                        label="Limitar a un canje por día"
                                        description="Si se activa, el usuario solo podrá canjear una vez por día."
                                        checked={field.state.value ?? false}
                                        onCheckedChange={(checked) => field.handleChange(checked)}
                                    />
                                    {field.state.meta.errors?.length ? (
                                        <p className="text-sm text-destructive">
                                            {field.state.meta.errors?.[0]}
                                        </p>
                                    ) : null}
                                </div>
                            )}
                        </form.Field>
                    </div>
                )}
            </form.Subscribe>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between pt-2">
                <Button type="button" variant="outline" onClick={prevStep}>
                    Atrás
                </Button>
                <Button type="button" onClick={nextStep}>
                    Continuar
                </Button>
            </div>
        </div>
    );
}
