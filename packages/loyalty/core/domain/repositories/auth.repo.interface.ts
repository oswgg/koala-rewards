import { User } from '../types';

export interface AuthRepository {
    createUser: (email: string, name: string, phoneNumber: string) => Promise<void>;
    sendOtp: (email: string) => Promise<void>;
    verifyOtp: (email: string, code: string) => Promise<User>;
    getCurrentUser: () => Promise<User | null>;
    isBusinessOwner: () => Promise<boolean>;
    isBusinessStaff: () => Promise<boolean>;
    signOut: () => Promise<void>;
}
