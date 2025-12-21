"use client";

import Image from "next/image";

export default function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/greenlit.png"
      width={100}
      height={100}
      alt="Greenlit Logo"
      className={className}
    />
  );
}
