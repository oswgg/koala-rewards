import { User } from '@loyalty/core';

export interface AuthIdentityRemoteDatasource {
    getCurrentUser(): Promise<User | null>;
}
