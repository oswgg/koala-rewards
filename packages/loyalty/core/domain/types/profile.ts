export interface Profile {
    id: string;
    user_id: string | null;
    name: string | null;
    email: string | null;
    phone_number: string | null;
    created_at: string;
}

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
