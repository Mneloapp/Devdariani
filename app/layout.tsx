import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DEVDARIANI | The Art of Orchestrics",
  description:
    "DEVDARIANI transforms complexity into coordinated systems through Orchestrics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
