import { User } from '@koalacards/loyalty/core';

export interface RemoteAuthDataSource {
    createUser: (email: string, name: string, phoneNumber: string) => Promise<void>;
    sendOtp: (email: string) => Promise<void>;
    verifyOtp: (email: string, code: string) => Promise<User>;
    isBusinessOwner: (userId: any) => Promise<boolean>;
    isBusinessStaff: (userId: any) => Promise<boolean>;
    signOut: () => Promise<void>;
}
