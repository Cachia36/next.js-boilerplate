import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-full px-4 py-2 text-sm transition",
        variant === "default" && "bg-foreground text-background border",
        variant === "outline" && "text-foreground border bg-transparent",
        className,
      )}
      {...props}
    />
  );
}
