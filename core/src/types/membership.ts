import { Business } from './business';

export interface ProgramMembership {
    id: string;
    program_id: string;
    profile_id: string;
    balance: number;
    created_at: string;
    public_id: string;
    business: Business;
}
