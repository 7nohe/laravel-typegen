export type History = {
    id: number;
    log: string;
    created_at?: string;
    updated_at?: string;
};
export type Job = {
    id: number;
    queue: string;
    payload: string;
    attempts: any;
    reserved_at?: number;
    available_at: number;
    created_at: number;
};
export type Post = {
    id: number;
    title: string;
    body: string;
    type: PostType;
    user_id: number;
    created_at?: string;
    updated_at?: string;
    author?: User;
};
export type User = {
    id: number;
    name: string;
    email: string;
    gender: GenderType;
    email_verified_at?: string;
    bio?: string;
    created_at?: string;
    updated_at?: string;
    posts?: Post[];
    user_contacts?: UserContact[];
};
export type UserContact = {
    id: number;
    phone_number: string;
    user_id: number;
    created_at?: string;
    updated_at?: string;
    user?: User;
};
export enum Status {
    DRAFT = "Draft",
    IN_REVIEW = "InReview",
    PUBLISHED = "Published"
}
export enum GenderType {
    Male = "Male",
    Female = "Female",
    Other = "Other"
}
export enum PostType {
    Public = 10,
    Private = 20
}
