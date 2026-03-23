'use client';

import { useTypedAppFormContext } from '@/infrastructure/tanstack-form/form-context';
import { newCustomerFormOptions } from '../../../hooks/useNewCustomerForm';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const FIELD_INPUT_CLASS = 'h-14 min-h-14 text-lg md:h-16 md:min-h-16 md:text-xl';

export function PhoneStep() {
    const form = useTypedAppFormContext(newCustomerFormOptions);

    return (
        <form.Field name="phone">
            {(field) => (
                <div className="w-full max-w-md space-y-2">
                    <Label htmlFor={`new-customer-field-${field.name}`} className="sr-only">
                        Teléfono
                    </Label>
                    <Input
                        id={`new-customer-field-${field.name}`}
                        name={field.name}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        enterKeyHint="next"
                        placeholder="Ej: 555 123 4567"
                        aria-invalid={field.state.meta.errors?.length ? true : undefined}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={FIELD_INPUT_CLASS}
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
