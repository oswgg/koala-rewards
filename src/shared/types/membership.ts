import { Business } from './business';

export interface ProgramMembership {
    id: string;
    program_id: string;
    user_id: string;
    membership_client_id: string;
    balance: number;
    created_at: string;
    public_id: string;
    business: Business;
}
