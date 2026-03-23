export type CreateProfileAndMembershipsInput = {
    name: string;
    phone: string;
    programsPublicIds: string[];
};

export interface BusinessProfilesLookupService {
    findNameByContact(emailOrPhone: string): Promise<string | null>;
    createProfileAndMemberships(input: CreateProfileAndMembershipsInput): Promise<void>;
}
