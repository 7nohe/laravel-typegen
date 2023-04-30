export type ProfileUpdateRequest = {
    name: string;
    email?: string;
    age?: number;
    height?: number;
    bio: string;
    address?: {
        country: string;
        city: string;
    };
};
export type LoginRequest = {
    email: string;
    password: string;
};
