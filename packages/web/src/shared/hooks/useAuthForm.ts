import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authService } from '@/shared/services/auth/implementation.auth-service';
import { businessRoutes } from '@/shared/lib/routes';
import type { User } from '@/shared/types/user';

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
    sendOtpMutation: UseMutationResult<void, Error, void>;
    verifyOtpMutation: UseMutationResult<User, Error, { email: string; code: string }>;
}

export function useAuthForm({
    type,
    redirectTo = businessRoutes.dashboard,
    onSuccess,
}: UseAuthFormProps): UseAuthFormReturn {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [step, setStep] = useState<AuthFormStep>('email');
    const [otp, setOtp] = useState<string>('');

    const sendOtpMutation = useMutation({
        mutationFn: async () => {
            if (type === 'signup') {
                await authService.createUser(email.trim(), name.trim(), phone.trim());
            } else {
                await authService.sendOtp(email.trim());
            }
        },
        onSuccess: () => {
            setStep('otp');
        },
    });

    const verifyOtpMutation = useMutation({
        mutationFn: ({ email: emailToVerify, code }: { email: string; code: string }) =>
            authService.verifyOtp(emailToVerify, code),
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
        sendOtpMutation.reset();
        verifyOtpMutation.reset();
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
        sendOtpMutation,
        verifyOtpMutation,
    };
}
