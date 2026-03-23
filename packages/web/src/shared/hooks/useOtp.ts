export interface UseOTPReturn {
    sendOtp: (email: string) => Promise<void>;
    verifyOtp: (code: string) => Promise<void>;
}

export function useOtp() {
    const sendOtp = async (email: string) => {};

    const verifyOtp = async (email: string, code: string) => {};

    return {
        sendOtp,
        verifyOtp,
    };
}
