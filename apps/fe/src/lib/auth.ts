import { StrapiUser } from "@/types/strapi";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export interface AuthResponse {
    jwt: string;
    user: StrapiUser;
}

export interface LoginPayload {
    identifier: string;
    password: string;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
}

export const setToken = (token: string) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("strapi_jwt", token);
    }
};

export const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("strapi_jwt");
    }
    return null;
};

export const setUser = (user: StrapiUser) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("strapi_user", JSON.stringify(user));
    }
};

export const getUser = (): StrapiUser | null => {
    if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("strapi_user");
        if (userStr) return JSON.parse(userStr);
    }
    return null;
};

export const logout = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("strapi_jwt");
        localStorage.removeItem("strapi_user");
        window.location.href = "/";
    }
};

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message || "Login failed");
    }

    const data = await response.json();
    setToken(data.jwt);

    // Fetch full user details with role
    try {
        const meRes = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
            headers: {
                Authorization: `Bearer ${data.jwt}`,
            },
        });
        if (meRes.ok) {
            const meData = await meRes.json();
            setUser(meData); // Set full user data with role
            return { jwt: data.jwt, user: meData };
        }
    } catch (e) {
        console.error("Failed to fetch user role", e);
    }

    // Fallback to basic user data
    setUser(data.user);
    return data;
};

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message || "Registration failed");
    }

    const data = await response.json();
    setToken(data.jwt);
    setUser(data.user);
    return data;
};
