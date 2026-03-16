import type { NextRequest, NextResponse } from 'next/server';
import type { User } from '@/shared/types/user';

/** Cookie store from Next.js cookies() - Promise in Next.js 15+ */
export type CookieStore = Awaited<ReturnType<typeof import('next/headers').cookies>>;

export interface Staff {
    id: number;
    business_id: string;
    user_id: string;
    type: string;
    name: string;
    email: string;
}

export interface ServerAuthService {
    /**
     * Gets session from a NextRequest (e.g. in proxy/middleware).
     * Returns user and the response with refreshed cookies.
     */
    getSessionFromRequest(
        request: NextRequest
    ): Promise<{ user: User | null; response: NextResponse }>;

    /**
     * Gets session and staff record from a NextRequest (e.g. in proxy).
     * Returns user, staff (if any), and the response with refreshed cookies.
     */
    getSessionAndStaffFromRequest(
        request: NextRequest
    ): Promise<{ user: User | null; staff: Staff | null; response: NextResponse }>;

    /**
     * Gets session from Next.js cookie store (e.g. in Server Components).
     */
    getSessionFromCookies(cookieStore: CookieStore): Promise<User | null>;
}
