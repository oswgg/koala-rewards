import { User, Staff } from '@vado/loyalty/core/domain/types/index';

export interface RemoteAuthDataSource {
    createUser: (email: string, name: string, phoneNumber: string) => Promise<void>;
    sendOtp: (email: string) => Promise<void>;
    verifyOtp: (email: string, code: string) => Promise<User>;
    isBusinessOwner: (userId: any) => Promise<boolean>;
    isBusinessStaff: (userId: any) => Promise<boolean>;
    getStaffData: (userId: any) => Promise<Staff | null>;
    signOut: () => Promise<void>;
}
