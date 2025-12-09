"use client";

import { LockKeyhole, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordFieldProps = {
  value: string;
  error?: string;
  placeholder: string;
  show: boolean;
  onChange: (value: string) => void;
  onBlur: (value: string) => void;
  onToggleShow: () => void;
  errorId: string;
};

export function PasswordField({
  value,
  error,
  placeholder,
  show,
  onChange,
  onBlur,
  onToggleShow,
  errorId,
}: PasswordFieldProps) {
  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors duration-200 focus-within:ring-2",
          error && "border-red-500 focus-within:ring-red-500",
        )}
      >
        <LockKeyhole />
        <input
          type={show ? "text" : "password"}
          className="placeholder:text-foreground/60 w-full text-sm focus:outline-none"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={errorId}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="flex h-5 w-5 items-center justify-center"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <p
        id={errorId}
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
