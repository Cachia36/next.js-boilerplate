"use client";

import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";

type EmailFieldProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: (value: string) => void;
};

export function EmailField({ value, error, onChange, onBlur }: EmailFieldProps) {
  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors duration-200 focus-within:ring-2",
          error && "border-red-500 focus-within:ring-red-500",
        )}
      >
        <Mail />
        <input
          type="email"
          className="placeholder:text-foreground/60 w-full text-sm focus:outline-none"
          placeholder="Email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur(e.target.value)}
          aria-invalid={!!error}
          aria-describedby="email-error"
        />
      </div>

      <p
        id="email-error"
        className={cn(
          "transform overflow-hidden px-1 text-xs text-red-500 transition-all duration-300 ease-out",
          error
            ? "animate-in fade-in slide-in-from-top-1 mt-1 max-h-10 translate-y-0 opacity-100"
            : "mt-0 max-h-0 -translate-y-2 opacity-0",
        )}
      >
        {error ?? " "}
      </p>
    </div>
  );
}
