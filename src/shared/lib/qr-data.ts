import type { LoyaltyProgramType, StoredLoyaltyProgram } from '@/shared/types/loyalty-program';
import { customerRoutes } from './routes';

export interface ProgramQRData {
    program_id: string;
    business_id: string;
    program_name: string;
    program_type: LoyaltyProgramType;
    required_quantity: number;
}

export interface CustomerQRData {
    membership_client_id: string;
    program_id: string;
    user_id: string;
}

/**
 * Builds a join URL with embedded program data as query params.
 * Native phone QR readers will open this URL, and the join page
 * can read program details offline from the params.
 */
export function buildProgramJoinUrl(
    baseUrl: string,
    program: Pick<
        StoredLoyaltyProgram,
        'id' | 'public_id' | 'business_id' | 'name' | 'type' | 'reward_cost'
    >
): string {
    const path = customerRoutes.join(program.id);
    const params = new URLSearchParams({
        pid: program.id,
        bid: program.business_id,
        name: program.name,
        type: program.type,
        qty: String(program.reward_cost ?? 0),
    });
    return `${baseUrl}${path}?${params.toString()}`;
}

/**
 * Parses program data from join URL query params.
 * Returns null if required params are missing.
 */
export function parseProgramQRParams(searchParams: URLSearchParams): ProgramQRData | null {
    const bid = searchParams.get('bid');
    const name = searchParams.get('name');
    const type = searchParams.get('type') as LoyaltyProgramType | null;
    const qty = searchParams.get('qty');
    const pid = searchParams.get('pid');

    if (!pid || !bid || !name || !type || !qty) return null;

    const validTypes: LoyaltyProgramType[] = ['stamps', 'points', 'cashback'];
    if (!validTypes.includes(type)) return null;

    return {
        program_id: pid,
        business_id: bid,
        program_name: name,
        program_type: type,
        required_quantity: Number(qty),
    };
}

/**
 * Builds the JSON string for a customer QR code (scanned by staff).
 */
export function buildCustomerQRValue(
    membershipClientId: string,
    programId: string,
    userId: string
): string {
    const data: CustomerQRData = {
        membership_client_id: membershipClientId,
        program_id: programId,
        user_id: userId,
    };
    return JSON.stringify(data);
}

/**
 * Parses a customer QR code value (JSON payload).
 * Returns null if the text is not valid customer QR data.
 */
export function parseCustomerQR(text: string): CustomerQRData | null {
    try {
        const data = JSON.parse(text);
        if (
            typeof data.membership_client_id === 'string' &&
            typeof data.program_id === 'string' &&
            typeof data.user_id === 'string'
        ) {
            return data as CustomerQRData;
        }
        return null;
    } catch {
        return null;
    }
}
