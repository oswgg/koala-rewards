import {
    CreateProfileAndMembershipsInput,
    ProfileByContact,
} from '@koalacards/loyalty/core/domain/types/profile';
import { ProfilesRemoteDataSource } from './remote/profiles.remote.datasource.interface';
import { ProfilesRepository } from '@koalacards/loyalty/core/domain/repositories/profiles.repo.interface';

export class ProfilesRepositoryImpl implements ProfilesRepository {
    constructor(private readonly remote: ProfilesRemoteDataSource) {}

    async findProfileByContact(input: string): Promise<ProfileByContact | null> {
        return await this.remote.findProfileByContact(input);
    }

    async findNameByContact(emailOrPhone: string): Promise<string | null> {
        return await this.remote.findNameByContact(emailOrPhone);
    }

    async createProfileAndMemberships(input: CreateProfileAndMembershipsInput): Promise<void> {
        await this.remote.createProfileAndMemberships(input);
    }
}
