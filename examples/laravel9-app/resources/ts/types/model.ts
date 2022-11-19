export type Post = {
    id: number;
    title: string;
    body: string;
    user_id: number;
    created_at: string;
    updated_at: string;
};
export type User = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    password: string;
    remember_token: string;
    created_at: string;
    updated_at: string;
};
