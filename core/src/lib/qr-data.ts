import LZString from 'lz-string';
import type { StoredLoyaltyProgram } from '../types/loyalty-program';
import type { CardThemeName } from '../types/card-theme';

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
    /** `profiles.id` (query param `u` in scan URLs). */
    profile_id: string;
}

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
 * Full URL for the staff scan flow. Native phone scanners open this in the browser.
 * Query: `p` = program public id, `u` = customer profile id (`profiles.id`).
 */
export function buildCustomerScanUrl(
    baseUrl: string,
    programPublicId: string,
    profileId: string
): string {
    const base = baseUrl.replace(/\/$/, '');
    const params = new URLSearchParams({ p: programPublicId, u: profileId });
    return `${base}/scan?${params.toString()}`;
}

export function parseCustomerQR(text: string): CustomerQRData | null {
    const trimmed = text.trim();
    if (!trimmed) return null;

    try {
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            const url = new URL(trimmed);
            const p = url.searchParams.get('p');
            const u = url.searchParams.get('u');
            if (p && u) return { program_public_id: p, profile_id: u };
        }
    } catch {
        /* ignore */
    }

    try {
        if (trimmed.startsWith('?')) {
            const url = new URL(trimmed, 'http://local');
            const p = url.searchParams.get('p');
            const u = url.searchParams.get('u');
            if (p && u) return { program_public_id: p, profile_id: u };
        }
    } catch {
        /* ignore */
    }

    try {
        const data = JSON.parse(trimmed) as unknown;
        if (
            data &&
            typeof data === 'object' &&
            'program_public_id' in data &&
            typeof (data as CustomerQRData).program_public_id === 'string'
        ) {
            const legacy = data as {
                program_public_id: string;
                user_id?: string;
                profile_id?: string;
            };
            const profileId = legacy.profile_id ?? legacy.user_id;
            if (typeof profileId === 'string') {
                return { program_public_id: legacy.program_public_id, profile_id: profileId };
            }
        }
    } catch {
        /* ignore */
    }

    return null;
}
