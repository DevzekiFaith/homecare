"use client";

import { Zap } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  variant?: "default" | "white";
}

export default function Logo({ className = "", size = "md", href = "/", variant = "default" }: LogoProps) {
  const sizes = {
    sm: "text-lg gap-1.5",
    md: "text-xl gap-2",
    lg: "text-3xl gap-3",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 32,
  };

  const textClass = variant === "white" 
    ? "text-white" 
    : "text-foreground";
  
  const careClass = variant === "white" 
    ? "text-white" 
    : "text-sky-600";

  const Content = (
    <div className={`flex items-center font-heading font-black tracking-tighter ${sizes[size]} ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="relative h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl bg-sky-600 shadow-md shadow-sky-600/25 border border-sky-500">
          <Zap size={iconSizes[size]} className="text-white fill-white" />
        </div>
      </div>
      <span className={textClass}>
        Home<span className={careClass}>Care</span>
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        {Content}
      </Link>
    );
  }

  return Content;
}
