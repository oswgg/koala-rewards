import LZString from 'lz-string';
import type { StoredLoyaltyProgram } from '@/shared/types/loyalty-program';
import { CardThemeName } from './card-themes';

export interface JoinProgramQRData {
    businessName: string;
    programPublicId: string;
    programName: string;
    programType: string;
    programReward: string;
    programRewardCost: number;
    programCashBackPercentage: number;
    programPointsPercentage: number;
    programTheme: CardThemeName;
}

export interface CustomerQRData {
    program_public_id: string;
    user_id: string;
}

/**
 * Builds a compressed join URL for a program.
 * Uses short keys and LZString compression for a smaller QR code.
 * https://34de-2806-109f-d-6c6e-ec7a-226b-1e6e-a5e4.ngrok-free.app/?j=/N4IgRiBcILIJYAIAqcCmA7AJnALgQwQDkBXVANzxABoQ4oQBWJgZgDMwBOANgFpm8ALAEYeA5gA4Axjw4AGBgHYZrTOObMhmBePGUa6egAUATnAC2qYwhMB7AObG8ZvSBz0AzvjMAHd9RCSUEKyNJIQkCEg3t5Qkcb0AMJ4rACXCADijjhwfjQ4ABb0xjYAnngANiAAvkA
 */
export function buildProgramJoinUrl(baseUrl: string, program: StoredLoyaltyProgram): string {
    const payload = {
        b: program.business.name,
        i: program.public_id,
        n: program.name,
        t: program.type,
        c: program.reward_cost ?? 0,
        cb: program.cashback_percentage ?? 0,
        pp: program.points_percentage ?? 0,
        r: program.reward_description?.slice(0, 80) ?? '',
        th: program.card_theme ?? 'neutral',
    };

    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(payload));

    return `${baseUrl.replace(/\/$/, '')}?j=${compressed}`;
}

/**
 * Parses a join program QR (compressed format).
 * Supports full URL (e.g. https://x.com/?j=...), query string (?j=...), or raw compressed payload.
 * https://34de-2806-109f-d-6c6e-ec7a-226b-1e6e-a5e4.ngrok-free.app/?j=N4IgRiBcILIJYAIAqcCmA7AJnALgQwQDkBXVANzxABoQ4oQBWJgZgDMwBOANgFpm8ALAEYeA5gA4Axjw4AGBgHYZrTOObMhmBePGUa6egAUATnAC2qYwhMB7AObG8ZvSBz0AzvjMAHd9RCSUEKyNJIQkCEg3t5Qkcb0AMJ4rACXCADijjhwfjQ4ABb0xjYAnngANiAAvkA
 */
export function parseProgramQR(text: string): JoinProgramQRData | null {
    try {
        let compressed: string | null = null;
        if (text.startsWith('http://') || text.startsWith('https://')) {
            const url = new URL(text);
            compressed = url.searchParams.get('j');
        } else if (text.startsWith('?j=')) {
            compressed = text.slice(3);
        } else {
            compressed = text;
        }

        if (!compressed || compressed.length === 0) return null;

        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
        if (!decompressed) return null;

        const raw = JSON.parse(decompressed) as Record<string, unknown>;

        return {
            businessName: String(raw.b ?? ''),
            programPublicId: String(raw.i ?? ''),
            programName: String(raw.n ?? ''),
            programType: String(raw.t ?? ''),
            programReward: String(raw.r ?? ''),
            programRewardCost: Number(raw.c ?? 0),
            programCashBackPercentage: Number(raw.cb ?? 0),
            programPointsPercentage: Number(raw.pp ?? 0),
            programTheme: (String(raw.th ?? 'neutral') || 'neutral') as CardThemeName,
        };
    } catch {
        return null;
    }
}

/**
 * Builds the JSON string for a customer QR code (scanned by staff).
 */
export function buildCustomerQRValue(programPublicId: string, userId: string): string {
    const data: CustomerQRData = {
        program_public_id: programPublicId,
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
        console.log('data', data);
        if (typeof data.program_public_id === 'string' && typeof data.user_id === 'string') {
            return data as CustomerQRData;
        }
        return null;
    } catch {
        return null;
    }
}
