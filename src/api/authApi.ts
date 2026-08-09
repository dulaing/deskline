import type { User } from "../features/requests/types";
import { apiFetch } from "./client";
import { mapApiUser } from "./mappers";
import type { ApiLoginInputDto, ApiLoginResponseDto } from "./types";

export type LoginCredentials = {
    email: string;
    password: string;
}

export type LoginResult = {
    user: User;
    token: string;
}

export async function login (credentials: LoginCredentials): Promise<LoginResult> {
    const input: ApiLoginInputDto = {
        email: credentials.email,
        password: credentials.password,
    };

    const response = await apiFetch<ApiLoginResponseDto>("/login", {
        method: "POST",
        body: JSON.stringify(input),
    });

    return {
        user: mapApiUser(response.user),
        token: response.token,
    };
}