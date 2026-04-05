'use client';

import * as React from 'react';

import { RadioGroup, RadioGroupItem } from './radio-group';
import { cn } from '@vado/shared/lib';

export interface FormRadioGroupOption<T extends string = string> {
    value: T;
    label: string;
    description?: string;
    icon?: React.ReactNode;
}

export interface FormRadioGroupProps<T extends string = string> {
    value?: T;
    onValueChange?: (value: T) => void;
    options: FormRadioGroupOption<T>[];
    name?: string;
    className?: string;
    optionClassName?: string;
}

export function FormRadioGroup<T extends string = string>({
    value,
    onValueChange,
    options,
    name,
    className,
    optionClassName,
}: FormRadioGroupProps<T>) {
    const id = React.useId();

    return (
        <RadioGroup
            name={name}
            value={value ?? ''}
            onValueChange={(v) => onValueChange?.(v as T)}
            className={cn('grid w-full gap-2', className)}
        >
            {options.map((option) => (
                <label
                    key={option.value}
                    htmlFor={`${id}-${option.value}`}
                    className={cn(
                        'relative flex w-full flex-col cursor-pointer items-center gap-3 rounded-md border border-input p-4 shadow-xs outline-none transition-colors has-data-[state=checked]:border-primary/50',
                        optionClassName
                    )}
                >
                    <RadioGroupItem
                        value={option.value}
                        id={`${id}-${option.value}`}
                        aria-describedby={
                            option.description ? `${id}-${option.value}-description` : undefined
                        }
                        aria-label={option.label}
                        className="order-1 size-5 after:absolute after:inset-0 [&_svg]:size-3"
                    />
                    <div className="grid grow justify-items-center gap-2">
                        {option.icon}
                        <span className="text-center font-medium">{option.label}</span>
                        {option.description && (
                            <p
                                id={`${id}-${option.value}-description`}
                                className="text-center text-xs text-muted-foreground"
                            >
                                {option.description}
                            </p>
                        )}
                    </div>
                </label>
            ))}
        </RadioGroup>
    );
}
