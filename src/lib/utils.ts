import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Light = "GREEN" | "YELLOW" | "RED";

export function lightToken(light: Light) {
  switch (light) {
    case "GREEN":
      return { color: "var(--success)", label: "Green" };
    case "YELLOW":
      return { color: "var(--warning)", label: "Yellow" };
    case "RED":
      return { color: "var(--error)", label: "Red" };
  }
}
