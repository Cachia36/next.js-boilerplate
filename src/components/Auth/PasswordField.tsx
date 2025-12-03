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
          "flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 transition-colors duration-200",
          error && "border-red-500 focus-within:ring-red-500"
        )}
      >
        <LockKeyhole />
        <input
          type={show ? "text" : "password"}
          className="w-full text-sm focus:outline-none placeholder:text-foreground/60"
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
          className="flex items-center justify-center w-5 h-5"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <p
        id={errorId}
        className={cn(
          "text-xs text-red-500 px-1 overflow-hidden transition-all duration-300 ease-out transform",
          error
            ? "max-h-10 opacity-100 translate-y-0 mt-1 animate-in fade-in slide-in-from-top-1"
            : "max-h-0 opacity-0 -translate-y-2 mt-0"
        )}
      >
        {error ?? " "}
      </p>
    </div>
  );
}