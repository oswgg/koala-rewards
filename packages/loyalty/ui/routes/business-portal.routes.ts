export const businessPortalRoutes = {
    url: `${process.env.NEXT_PUBLIC_BUSINESS_PORTAL_URL || 'http://localhost:3000/business'}`,
    signup: '/business/signup',
    login: '/business/login',
    dashboard: '/business',
    onboarding: '/business/onboarding',
    programs: '/business/programs',
    newProgram: '/business/programs/new',
    programDetail: (id: string) => `/business/programs/${id}`,
    editProgram: (id: string) => `/business/programs/${id}/edit`,
};
