import { ProfilesRemoteDataSource } from './remote/profiles.remote.datasource.interface';
import {
    CreateProfileAndMembershipsInput,
    ProfileByContact,
    ProfilesRepository,
} from '@vado/loyalty/core';

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
