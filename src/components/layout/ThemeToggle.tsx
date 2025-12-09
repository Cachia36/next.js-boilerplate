import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  isDark: boolean;
  onToggle: () => void;
};

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // We intentionally set mounted here to avoid a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const checked = mounted ? isDark : false;

  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={checked}
      className="flex items-center gap-2 focus:outline-none"
    >
      <span
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full border transition-colors",
          isDark ? "bg-foreground border-foreground" : "bg-foreground border-foreground",
        )}
      >
        <span
          className={cn(
            "bg-background inline-block h-5 w-5 transform-gpu rounded-full shadow transition-transform",
            // Only move the thumb after we’re mounted to avoid SSR/client mismatch
            mounted && isDark ? "translate-x-5" : "translate-x-1",
          )}
        />
      </span>
    </button>
  );
}
