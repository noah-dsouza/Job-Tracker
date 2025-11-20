"use client";

import Image from "next/image";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <Image
      src="/greenlit.png"
      alt="Greenlit logo"
      width={64}
      height={64}
      className={className}
      priority
    />
  );
}

