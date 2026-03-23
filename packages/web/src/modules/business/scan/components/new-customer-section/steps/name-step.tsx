'use client';

import { useEffect } from 'react';
import { useStore } from '@tanstack/react-store';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useTypedAppFormContext } from '@/infrastructure/tanstack-form/form-context';
import { newCustomerFormOptions } from '../../../hooks/useNewCustomerForm';
import { useProfileNameByContactQuery } from '../../../hooks/useProfileNameByContactQuery';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';

const FIELD_INPUT_CLASS = 'h-14 min-h-14 text-lg md:h-16 md:min-h-16 md:text-xl';

export function NameStep() {
    const form = useTypedAppFormContext(newCustomerFormOptions);
    const phone = useStore(form.store, (s) => String(s.values.phone ?? '').trim());

    const query = useProfileNameByContactQuery(phone);

    const lookupPending = phone.length > 0 && query.isPending;
    const profileLookupFound = query.isSuccess && query.data != null;

    useEffect(() => {
        if (!phone) {
            form.setFieldValue('name', '');
            return;
        }
        if (query.isSuccess) {
            form.setFieldValue('name', query.data ?? '');
        }
    }, [phone, query.isSuccess, query.data, form]);

    return (
        <form.Field name="name">
            {(field) => (
                <div className="w-full max-w-md space-y-2">
                    <Label htmlFor={`new-customer-field-${field.name}`} className="sr-only">
                        Nombre
                    </Label>
                    {lookupPending ? (
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
                            Buscando cliente…
                        </p>
                    ) : null}
                    <Input
                        id={`new-customer-field-${field.name}`}
                        name={field.name}
                        type="text"
                        autoComplete="name"
                        enterKeyHint="next"
                        placeholder="Ej: María García"
                        aria-invalid={field.state.meta.errors?.length ? true : undefined}
                        aria-busy={lookupPending}
                        disabled={lookupPending || profileLookupFound}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={cn(FIELD_INPUT_CLASS, lookupPending && 'opacity-80')}
                    />
                    {profileLookupFound ? (
                        <p className="flex items-center gap-2.5 text-green-800">
                            <CheckCircle className="size-3.5 shrink-0" aria-hidden />
                            El cliente ya existe en nuestro sistema. Ve a la siguiente paso.
                        </p>
                    ) : null}
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
