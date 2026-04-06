'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    cn,
    Button,
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    Input,
    OtpPinInput,
} from '@vado/shared/ui';
import { useAuthForm } from '@/hooks/useAuthForm';

export interface AuthFormProps {
    type: 'signup' | 'login';
    /** Fallback redirect when onSuccess is not provided. Used for login. */
    redirectTo?: string;
    /** Called after successful signup or login. Overrides default redirect when provided. */
    onSuccess?: (type: 'signup' | 'login') => void | Promise<void>;
    /** When provided, redirects to these URLs when user clicks Sign in / Sign up instead of toggling form. */
    redirectOnChange?: {
        login: string;
        signup: string;
    };
}

export function AuthForm({
    className,
    redirectTo,
    onSuccess,
    redirectOnChange,
    type: initialType,
    ...props
}: React.ComponentProps<'div'> & AuthFormProps) {
    const [type, setType] = useState(initialType);

    return (
        <AuthFormContent
            key={type}
            type={type}
            redirectTo={redirectTo}
            onSuccess={onSuccess}
            redirectOnChange={redirectOnChange}
            onSwitchType={setType}
            className={className}
            {...props}
        />
    );
}

function AuthFormContent({
    type,
    redirectTo,
    onSuccess,
    redirectOnChange,
    onSwitchType,
    className,
    ...props
}: React.ComponentProps<'div'> &
    AuthFormProps & {
        onSwitchType: (type: 'signup' | 'login') => void;
    }) {
    const router = useRouter();

    const handleSwitchToLogin = () => {
        if (redirectOnChange) {
            router.push(redirectOnChange.login);
        } else {
            onSwitchType('login');
        }
    };

    const handleSwitchToSignup = () => {
        if (redirectOnChange) {
            router.push(redirectOnChange.signup);
        } else {
            onSwitchType('signup');
        }
    };
    const {
        step,
        type: authType,
        email,
        otp,
        handleEmailChange,
        handleOtpValueChange,
        handleSubmitEmail,
        handleVerifyOtp,
        handleBackToEmail,
        handleResendOtp,
        handleGoToOtpStep,
        enteredOtpWithoutSending,
        canSkipToOtp,
        sendOtpMutation,
        verifyOtpMutation,
        name,
        phone,
        handleNameChange,
        handlePhoneChange,
    } = useAuthForm({ type, redirectTo, onSuccess });

    const isPending = sendOtpMutation.isPending || verifyOtpMutation.isPending;

    const error =
        (sendOtpMutation.error instanceof Error ? sendOtpMutation.error.message : null) ??
        (verifyOtpMutation.error instanceof Error ? verifyOtpMutation.error.message : null) ??
        null;

    const submitHandler = step === 'email' ? handleSubmitEmail : handleVerifyOtp;

    const emailStepButtonLabel = authType === 'signup' ? 'Create Account' : 'Sign in';

    const emailStepButtonLoadingLabel = sendOtpMutation.isPending
        ? 'Sending...'
        : emailStepButtonLabel;

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <form onSubmit={submitHandler}>
                <FieldGroup className="items-center">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-xl font-bold">Welcome to KoalaCards.</h1>
                        <FieldDescription>
                            {authType === 'signup' ? (
                                <>
                                    Already have an account?{' '}
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="h-auto p-0 font-normal"
                                        onClick={handleSwitchToLogin}
                                    >
                                        Sign in
                                    </Button>
                                </>
                            ) : (
                                <>
                                    Don&apos;t have an account?{' '}
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="h-auto p-0 font-normal"
                                        onClick={handleSwitchToSignup}
                                    >
                                        Sign up
                                    </Button>
                                </>
                            )}
                        </FieldDescription>
                    </div>

                    {error && (
                        <div
                            className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    {step === 'email' && (
                        <>
                            <Field className="items-center">
                                {authType === 'signup' && (
                                    <>
                                        <FieldLabel htmlFor="name">Name</FieldLabel>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="John Doe"
                                            autoComplete="name"
                                            value={name}
                                            onChange={handleNameChange}
                                            required
                                            disabled={isPending}
                                        />
                                        <FieldLabel htmlFor="phone">Phone</FieldLabel>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+1 555 123 4567"
                                            autoComplete="tel"
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            required
                                            disabled={isPending}
                                        />
                                    </>
                                )}
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    autoComplete="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required
                                    disabled={isPending}
                                />
                            </Field>
                            <Field className="items-center">
                                <Button
                                    type="submit"
                                    disabled={
                                        isPending ||
                                        !email.trim() ||
                                        (authType === 'signup' && (!name.trim() || !phone.trim()))
                                    }
                                >
                                    {emailStepButtonLoadingLabel}
                                </Button>
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    className="h-auto text-muted-foreground"
                                    onClick={handleGoToOtpStep}
                                    disabled={isPending || !canSkipToOtp}
                                >
                                    Ya tengo un código
                                </Button>
                            </Field>
                        </>
                    )}

                    {step === 'otp' && (
                        <>
                            <Field className="items-center text-center">
                                <FieldLabel htmlFor="otp">Verification code</FieldLabel>
                                <OtpPinInput
                                    value={otp}
                                    onChange={handleOtpValueChange}
                                    disabled={isPending}
                                />
                                <FieldDescription className="mt-4!">
                                    {enteredOtpWithoutSending ? (
                                        <>
                                            Enter the verification code for{' '}
                                            <span className="font-bold underline">{email}</span>
                                        </>
                                    ) : (
                                        <>
                                            We sent a code to{' '}
                                            <span className="font-bold underline">{email}</span>
                                        </>
                                    )}
                                </FieldDescription>
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    onClick={handleResendOtp}
                                    disabled={isPending}
                                >
                                    {sendOtpMutation.isPending
                                        ? 'Sending...'
                                        : "Didn't receive it? Resend code"}
                                </Button>
                            </Field>
                            <Field className="items-center">
                                <Button type="submit" disabled={isPending || otp.length < 6}>
                                    {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify'}
                                </Button>
                            </Field>
                            <Field className="items-center">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={isPending}
                                    onClick={handleBackToEmail}
                                >
                                    Use a different email
                                </Button>
                            </Field>
                        </>
                    )}
                </FieldGroup>
            </form>
            <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and{' '}
                <a href="#">Privacy Policy</a>.
            </FieldDescription>
        </div>
    );
}
