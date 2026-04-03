import { AuthRepository } from '@koalacards/loyalty/core/domain/repositories/auth.repo.interface';
import { RemoteAuthDataSource } from './remote/auth.remote.datasource.interface';
import { User } from '@koalacards/loyalty/core';
import { AuthIdentityRemoteDatasource } from './remote/auth.identity.remote.datasource';

export class AuthRepositoryImpl implements AuthRepository {
    constructor(
        private readonly remote: RemoteAuthDataSource,
        private readonly identity: AuthIdentityRemoteDatasource
    ) {}

    async createUser(email: string, name: string, phoneNumber: string): Promise<void> {
        await this.remote.createUser(email, name, phoneNumber);
    }

    async sendOtp(email: string): Promise<void> {
        await this.remote.sendOtp(email);
    }

    async verifyOtp(email: string, code: string): Promise<User> {
        return await this.remote.verifyOtp(email, code);
    }

    async getCurrentUser(): Promise<User | null> {
        return await this.identity.getCurrentUser();
    }

    async isBusinessOwner(): Promise<boolean> {
        const user = await this.getCurrentUser();
        if (!user) return false;

        return await this.remote.isBusinessOwner(user.id);
    }

    async isBusinessStaff(): Promise<boolean> {
        const user = await this.getCurrentUser();
        if (!user) return false;

        return await this.remote.isBusinessStaff(user.id);
    }

    async signOut(): Promise<void> {
        await this.remote.signOut();
    }
}
