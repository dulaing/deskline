import type { User } from "../features/requests/types";
import { users } from "./data";

const TOKEN_PREFIX = "Bearer deskline-token:";

export function getAuthenticatedUser (httpRequest: globalThis.Request): User | null {
    const authorization = httpRequest.headers.get("Authorization");

    if (!authorization || !authorization.startsWith(TOKEN_PREFIX)){
        return null;
    }

    const userId = authorization.slice(TOKEN_PREFIX.length);

    return (users.find((user) => user.id === userId) ?? null);
}