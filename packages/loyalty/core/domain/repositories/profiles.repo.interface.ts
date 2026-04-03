import { CreateProfileAndMembershipsInput, ProfileByContact } from '../types/profile';

export interface ProfilesRepository {
    findProfileByContact(input: string): Promise<ProfileByContact | null>;
    findNameByContact(emailOrPhone: string): Promise<string | null>;
    createProfileAndMemberships(input: CreateProfileAndMembershipsInput): Promise<void>;
}
