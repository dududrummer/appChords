import React from "react";
import { cn } from "@/lib/utils";

interface NeubrutalistButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "orange" | "yellow" | "white";
  size?: "sm" | "md" | "lg" | "xl";
}

export const NeubrutalistButton = ({
  className,
  variant = "orange",
  size = "md",
  ...props
}: NeubrutalistButtonProps) => {
  const variants = {
    orange: "bg-neo-orange text-white",
    yellow: "bg-neo-yellow text-black",
    white: "bg-white text-black",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base font-bold",
    lg: "px-8 py-4 text-lg font-black uppercase tracking-tight",
    xl: "px-10 py-5 text-2xl font-black uppercase tracking-tighter",
  };

  return (
    <button
      className={cn(
        "neo-brutalism-button inline-flex items-center justify-center rounded-none transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};
