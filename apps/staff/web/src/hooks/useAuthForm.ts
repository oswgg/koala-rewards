import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authRepository } from '@/infrastructure';
import { scannerPortalRoutes, User } from '@vado/loyalty';

export type AuthFormStep = 'email' | 'otp';
export type AuthFormType = 'signup' | 'login';

export interface UseAuthFormProps {
    type: AuthFormType;
    /** Fallback redirect when onSuccess is not provided. Used for login. */
    redirectTo?: string;
    /** Called after successful signup or login. Overrides default redirect when provided. */
    onSuccess?: (type: AuthFormType) => void | Promise<void>;
}

export interface UseAuthFormReturn {
    step: AuthFormStep;
    type: AuthFormType;
    email: string;
    name: string;
    phone: string;
    otp: string;
    handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleOtpValueChange: (value: string) => void;
    handleSubmitEmail: (e: React.FormEvent) => Promise<void>;
    handleVerifyOtp: (e: React.FormEvent) => Promise<void>;
    handleBackToEmail: () => void;
    handleResendOtp: () => Promise<void>;
    /** Ir al paso OTP sin enviar correo (p. ej. el usuario ya tiene el código). */
    handleGoToOtpStep: () => void;
    /** True si el usuario entró al OTP sin disparar envío en esta sesión. */
    enteredOtpWithoutSending: boolean;
    canSkipToOtp: boolean;
    sendOtpMutation: UseMutationResult<void, Error, void>;
    verifyOtpMutation: UseMutationResult<User, Error, { email: string; code: string }>;
}

export function useAuthForm({
    type,
    redirectTo = scannerPortalRoutes.app,
    onSuccess,
}: UseAuthFormProps): UseAuthFormReturn {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [step, setStep] = useState<AuthFormStep>('email');
    const [otp, setOtp] = useState<string>('');
    const [enteredOtpWithoutSending, setEnteredOtpWithoutSending] = useState(false);

    const sendOtpMutation = useMutation({
        mutationFn: async () => {
            if (type === 'signup') {
                await authRepository.createUser(email.trim(), name.trim(), phone.trim());
            } else {
                await authRepository.sendOtp(email.trim());
            }
        },
        onSuccess: () => {
            setEnteredOtpWithoutSending(false);
            setStep('otp');
        },
    });

    const verifyOtpMutation = useMutation({
        mutationFn: ({ email: emailToVerify, code }: { email: string; code: string }) =>
            authRepository.verifyOtp(emailToVerify, code),
        onSuccess: async () => {
            if (onSuccess) {
                await onSuccess(type);
            } else {
                router.push(redirectTo);
            }
        },
    });

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value);
    };

    const handleOtpValueChange = (value: string) => {
        setOtp(value);
    };

    const handleSubmitEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        if (type === 'signup' && (!name.trim() || !phone.trim())) return;
        await sendOtpMutation.mutateAsync();
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || otp.length < 6) return;
        await verifyOtpMutation.mutateAsync({
            email: email.trim(),
            code: otp.trim(),
        });
    };

    const handleBackToEmail = () => {
        setStep('email');
        setOtp('');
        setEnteredOtpWithoutSending(false);
        sendOtpMutation.reset();
        verifyOtpMutation.reset();
    };

    const canSkipToOtp =
        Boolean(email.trim()) &&
        (type !== 'signup' || (Boolean(name.trim()) && Boolean(phone.trim())));

    const handleGoToOtpStep = () => {
        if (!canSkipToOtp) return;
        sendOtpMutation.reset();
        verifyOtpMutation.reset();
        setOtp('');
        setEnteredOtpWithoutSending(true);
        setStep('otp');
    };

    const handleResendOtp = async () => {
        if (!email.trim()) return;
        if (type === 'signup' && (!name.trim() || !phone.trim())) return;
        await sendOtpMutation.mutateAsync();
    };

    return {
        step,
        type,
        email,
        name,
        phone,
        otp,
        handleEmailChange,
        handleNameChange,
        handlePhoneChange,
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
    };
}
