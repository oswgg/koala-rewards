import {
    CreateProfileAndMembershipsInput,
    ProfileByContact,
} from '@koalacards/loyalty/core/domain/types/profile';

export interface ProfilesRemoteDataSource {
    findProfileByContact(input: string): Promise<ProfileByContact | null>;
    findNameByContact(emailOrPhone: string): Promise<string | null>;
    createProfileAndMemberships(input: CreateProfileAndMembershipsInput): Promise<void>;
}
