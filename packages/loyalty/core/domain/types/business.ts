export interface Business {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}

export interface CreateBusinessInput {
    name: string;
    slug: string;
}
