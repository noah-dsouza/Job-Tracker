"use client";

import Image from "next/image";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <Image
      src="/greenlit.png"
      alt="Greenlit Logo"
      width={48}
      height={48}
      className={className}
    />
  );
}
