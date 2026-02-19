import type { Metadata } from "next";
import "./globals.css";
import { ResourceProvider } from "@/app/context/ResourceContext";

export const metadata: Metadata = {
  title: "Daysi",
  description: "Daysi Calender Application",
  icons: {
    icon: "/favicon.ico",
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
        <ResourceProvider>{children}</ResourceProvider>
      </body>
    </html>
  );
}
