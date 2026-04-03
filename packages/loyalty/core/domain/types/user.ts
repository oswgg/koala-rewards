export interface User {
    id: string;
    email: string;
    name: string;
    /** From Supabase `user_metadata.phone_number` when set at signup. */
    phoneNumber?: string;
}
