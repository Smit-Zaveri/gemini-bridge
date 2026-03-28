import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  key?: string | number;
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div className={cn(
      "glass-card p-6",
      hover && "hover:border-brand-primary/30 hover:bg-bg-glass/80 transition-all duration-300",
      className
    )}>
      {children}
    </div>
  );
}
