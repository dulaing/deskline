import type { User } from "../requests/types";

const SESSION_KEY = "deskline-session";

export type Session = {
  user: User;
  token: string;
}

export function saveSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  const savedUser = localStorage.getItem(SESSION_KEY);

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser) as Session;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}