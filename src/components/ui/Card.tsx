import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Card({ children, className, header, footer }: CardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm",
        className
      )}
    >
      {header && (
        <div className="border-b border-gray-100 px-6 py-4">{header}</div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="border-t border-gray-100 px-6 py-4">{footer}</div>
      )}
    </div>
  );
}
