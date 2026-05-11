import React from "react";
import { cn } from "@/lib/utils";

interface NeubrutalistCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "white" | "yellow" | "orange";
}

export const NeubrutalistCard = ({
  className,
  variant = "white",
  children,
  ...props
}: NeubrutalistCardProps) => {
  const variants = {
    white: "bg-white",
    yellow: "bg-neo-yellow",
    orange: "bg-neo-orange text-white",
  };

  return (
    <div
      className={cn(
        "neo-brutalism-card p-6 rounded-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
