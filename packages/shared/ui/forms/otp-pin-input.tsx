'use client';

import * as React from 'react';
import { Input } from './input';
import { cn } from '@vado/shared/lib';
const OTP_LENGTH = 6;

export interface OtpPinInputProps extends Omit<
    React.ComponentProps<'div'>,
    'onChange' | 'value' | 'defaultValue'
> {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    inputClassName?: string;
}

export function OtpPinInput({
    value,
    onChange,
    disabled,
    className,
    inputClassName,
    ...props
}: OtpPinInputProps) {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    const digits = React.useMemo(() => {
        const arr = value.split('').slice(0, OTP_LENGTH);
        while (arr.length < OTP_LENGTH) {
            arr.push('');
        }
        return arr;
    }, [value]);

    const focusInput = React.useCallback((index: number) => {
        inputRefs.current[index]?.focus();
    }, []);

    const handleChange = React.useCallback(
        (index: number, digit: string) => {
            if (!/^\d*$/.test(digit)) return;

            const newDigits = [...digits];
            newDigits[index] = digit.slice(-1);
            const newValue = newDigits.join('');
            onChange(newValue);

            if (digit && index < OTP_LENGTH - 1) {
                focusInput(index + 1);
            }
        },
        [digits, onChange, focusInput]
    );

    const handleKeyDown = React.useCallback(
        (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Backspace' && !digits[index] && index > 0) {
                e.preventDefault();
                const newDigits = [...digits];
                newDigits[index - 1] = '';
                onChange(newDigits.join(''));
                focusInput(index - 1);
            }
        },
        [digits, onChange, focusInput]
    );

    const handlePaste = React.useCallback(
        (e: React.ClipboardEvent) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
            if (pasted) {
                const newDigits = [...digits];
                for (let i = 0; i < pasted.length; i++) {
                    newDigits[i] = pasted[i];
                }
                onChange(newDigits.join(''));
                focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
            }
        },
        [digits, onChange, focusInput]
    );

    return (
        <div className={cn('flex justify-center gap-2', className)} {...props}>
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <Input
                    key={index}
                    id={index === 0 ? 'otp' : undefined}
                    ref={(el) => {
                        inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className={cn(
                        'h-10 w-10 p-0 text-center text-lg font-semibold',
                        inputClassName
                    )}
                    aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                />
            ))}
        </div>
    );
}
