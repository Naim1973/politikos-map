import { get, post } from "./client";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Session {
  user: User;
}

interface SignInResponse {
  token: string;
  user: User;
}

const SESSION_TOKEN_KEY = "session_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

function storeToken(token: string) {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(SESSION_TOKEN_KEY);
}

export async function signIn(email: string, password: string) {
  const res = await post<{ token?: string; session?: { token?: string }; user?: User }>("/v1/auth/sign-in/email", { email, password });
  const token = res.token ?? res.session?.token;
  if (token) {
    storeToken(token);
  }
  return res;
}

export function signOut() {
  clearToken();
  return post<void>("/v1/auth/sign-out");
}

export async function getSession(): Promise<Session | null> {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await get<{ session: unknown; user: User | null }>("/v1/auth/get-session");
    if (res.user) return { user: res.user };
    clearToken();
    return null;
  } catch {
    clearToken();
    return null;
  }
}
