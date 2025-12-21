import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Greenlit Job Tracker",
  description: "Track your applications, OA results, interviews, and offers with Greenlit.",
  icons: {
    icon: "/greenlit.png",
    apple: "/greenlit.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
