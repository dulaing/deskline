import { getSession } from "../features/auth/session";

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number){
        super(message);

        this.name = "ApiError";
        this.status = status;
    }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    const session = getSession();

    if(options.body && !headers.has("Content-Type")){
        headers.set("Content-Type", "application/json");
    }

    if (session && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${session.token}`);
    }

    const response = await fetch(path, {
        ...options,
        headers,
    });

    if (!response.ok) {
       const errorBody = await response.json().catch(() => null) as { message?: string } | null;

       const message = errorBody?.message ?? `Request failed with status ${response.status}`;

       throw new ApiError(message, response.status);
    }

    return response.json() as Promise<T>;
}