import type { User } from "../requests/types";

const SESSION_KEY = "deskline-user";

export function saveSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}