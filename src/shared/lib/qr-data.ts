import type { StoredLoyaltyProgram } from '@/shared/types/loyalty-program';
import { customerRoutes } from './routes';

export interface CustomerQRData {
    membership_client_id: string;
    program_id: string;
    user_id: string;
}

/**
 * Builds a join URL for a program.
 */
export function buildProgramJoinUrl(
    baseUrl: string,
    program: Pick<StoredLoyaltyProgram, 'id' | 'public_id'>
): string {
    const path = customerRoutes.join(program.public_id ?? program.id);
    return `${baseUrl}${path}`;
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
