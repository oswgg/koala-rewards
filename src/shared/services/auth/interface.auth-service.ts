import { User } from '@/shared/types/user';

export interface AuthService {
    createUser: (email: string, name: string, phoneNumber: string) => Promise<void>;
    sendOtp: (email: string) => Promise<void>;
    verifyOtp: (email: string, code: string) => Promise<User>;
    getCurrentUser: () => Promise<User | null>;
    signOut: () => Promise<void>;
    subscribeToAuthChanges: (
        callback: (user: User | null) => void
    ) => () => void;
}
