export const businessRoutes = {
    signup: '/business/signup',
    login: '/business/login',
    dashboard: '/business',
    onboarding: '/business/onboarding',
    programs: '/business/programs',
    newProgram: '/business/programs/new',
    programDetail: (id: string) => `/business/programs/${id}`,
    editProgram: (id: string) => `/business/programs/${id}/edit`,
    /** Página con lector QR para escanear tarjeta del cliente */
    scan: '/scan',
} as const;

/** Business paths that do not require auth */
export const businessPublicPaths = [businessRoutes.signup, businessRoutes.login] as const;

/** Business paths that require auth but NOT staff (user creates staff here) */
export const businessOnboardingPath = businessRoutes.onboarding;

export function isBusinessPublicPath(pathname: string): boolean {
    return businessPublicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isBusinessProtectedPath(pathname: string): boolean {
    return pathname.startsWith('/business') && !isBusinessPublicPath(pathname);
}

/** Paths that require auth (business protected + scan) */
export function isBusinessAuthPath(pathname: string): boolean {
    return isBusinessProtectedPath(pathname) || pathname.startsWith('/scan');
}

/** Paths that require both auth and staff record (excludes onboarding) */
export function isBusinessStaffPath(pathname: string): boolean {
    const isBusinessOrScan =
        (pathname.startsWith('/business') && !isBusinessPublicPath(pathname)) ||
        pathname.startsWith('/scan');
    return isBusinessOrScan && !isBusinessOnboardingPath(pathname);
}

export function isBusinessOnboardingPath(pathname: string): boolean {
    return pathname === businessOnboardingPath || pathname.startsWith(`${businessOnboardingPath}/`);
}

export const customerRoutes = {
    app: '/',
    signup: '/signup',
    login: '/login',
    /** Join URL uses ?j= query param on app (e.g. /?j=compressedPayload) */
    scan: (membershipPublicId: string) => `/scan/${membershipPublicId}`,
} as const;

export const customerPublicPaths = [customerRoutes.signup, customerRoutes.login] as const;
