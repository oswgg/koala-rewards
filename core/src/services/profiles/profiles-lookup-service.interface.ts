export type CreateProfileAndMembershipsInput = {
    name: string;
    phone: string;
    programsPublicIds: string[];
};

/** Result of `find_profile_by_contact` (staff RPC). */
export type ProfileByContact = {
    profileId: string;
    name: string;
};

export interface BusinessProfilesLookupService {
    /** Resolves profile by phone or email; staff-only RPC. */
    findProfileByContact(input: string): Promise<ProfileByContact | null>;
    findNameByContact(emailOrPhone: string): Promise<string | null>;
    createProfileAndMemberships(input: CreateProfileAndMembershipsInput): Promise<void>;
}
