// Mock auth store apenas para o frontend. Será substituído pelo backend depois.
import { useEffect, useState } from "react";

type Session = { email: string; isAdmin: boolean; subscribed: boolean } | null;
const KEY = "afada_session";
const ADMIN_EMAIL = "andersonsantana5948@gmail.com";

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function getSession(): Session {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
}
export function setSession(s: Session) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(KEY, JSON.stringify(s));
  else localStorage.removeItem(KEY);
  notify();
}
export function login(email: string, password: string): { ok: boolean; error?: string } {
  if (!email.includes("@") || password.length < 4) return { ok: false, error: "Credenciais inválidas." };
  const isAdmin = email.toLowerCase().trim() === ADMIN_EMAIL;
  setSession({ email: email.trim(), isAdmin, subscribed: true });
  return { ok: true };
}
export function logout() { setSession(null); }
export function useSession() {
  const [s, setS] = useState<Session>(() => getSession());
  useEffect(() => {
    const fn = () => setS(getSession());
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return s;
}
