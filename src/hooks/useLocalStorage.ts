import { useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;

    const stored = window.localStorage.getItem(key);
    if (stored == null) return initial;

    try {
      return JSON.parse(stored);
    } catch {
      return stored as unknown as T; // fallback for non JSON theme string (e.g 'dark')
    }
  });

  const update = (newValue: T) => {
    setValue(newValue);

    if (typeof window === "undefined") return;

    if (typeof newValue === "string") {
      window.localStorage.setItem(key, newValue);
    } else {
      window.localStorage.setItem(key, JSON.stringify(newValue));
    }
  };

  return [value, update] as const;
}
