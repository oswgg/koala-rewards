'use client';

import * as React from 'react';

import { cn } from '@/shared/lib/utils';
import { Checkbox } from '@/shared/components/ui/checkbox';

export interface FormCheckboxGroupOption<T extends string = string> {
    value: T;
    label: string;
    description?: string;
    icon?: React.ReactNode;
}

export interface FormCheckboxGroupProps<T extends string = string> {
    value: T[];
    onValueChange: (value: T[]) => void;
    options: FormCheckboxGroupOption<T>[];
    className?: string;
    optionClassName?: string;
}

export function FormCheckboxGroup<T extends string = string>({
    value,
    onValueChange,
    options,
    className,
    optionClassName,
}: FormCheckboxGroupProps<T>) {
    const id = React.useId();

    const toggle = (optionValue: T, checked: boolean) => {
        if (checked) {
            if (value.includes(optionValue)) return;
            onValueChange([...value, optionValue]);
        } else {
            onValueChange(value.filter((v) => v !== optionValue));
        }
    };

    return (
        <div className={cn('grid w-full gap-2', className)} role="group">
            {options.map((option) => {
                const isChecked = value.includes(option.value);
                return (
                    <label
                        key={option.value}
                        htmlFor={`${id}-${option.value}`}
                        className={cn(
                            'relative flex w-full cursor-pointer flex-row items-start gap-3 rounded-md border border-input p-4 shadow-xs outline-none transition-colors has-data-[state=checked]:border-primary/50',
                            optionClassName
                        )}
                    >
                        <Checkbox
                            id={`${id}-${option.value}`}
                            checked={isChecked}
                            onCheckedChange={(c) => toggle(option.value, c === true)}
                            aria-describedby={
                                option.description ? `${id}-${option.value}-description` : undefined
                            }
                            aria-label={option.label}
                            className="mt-0.5 size-5 shrink-0 after:absolute after:inset-0 [&_svg]:size-3"
                        />
                        <div className="min-w-0 flex-1 space-y-1 text-left">
                            {option.icon ? (
                                <div className="flex justify-center pb-1">{option.icon}</div>
                            ) : null}
                            <span className="block font-medium leading-snug">{option.label}</span>
                            {option.description ? (
                                <p
                                    id={`${id}-${option.value}-description`}
                                    className="text-sm text-muted-foreground"
                                >
                                    {option.description}
                                </p>
                            ) : null}
                        </div>
                    </label>
                );
            })}
        </div>
    );
}
