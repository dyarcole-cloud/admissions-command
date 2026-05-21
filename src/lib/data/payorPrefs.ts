"use client";

const RECENT_KEY = "acmd:payor:recent:v1";
const FAVORITES_KEY = "acmd:payor:fav:v1";
const MAX_RECENT = 8;

export function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function pushRecent(id: string): string[] {
  const list = readRecent().filter((x) => x !== id);
  list.unshift(id);
  const trimmed = list.slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(trimmed));
  } catch {}
  return trimmed;
}

export function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(id: string): string[] {
  const list = readFavorites();
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function isFavorite(id: string): boolean {
  return readFavorites().includes(id);
}
