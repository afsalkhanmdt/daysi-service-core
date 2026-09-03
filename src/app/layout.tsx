import type { Metadata } from "next";
import "./globals.css";
import { ResourceProvider } from "@/app/context/ResourceContext";
import DeviceGuard from "@/components/DeviceGuard";

export const metadata: Metadata = {
  title: "MyFamilii",
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
        <ResourceProvider>
          <DeviceGuard>{children}</DeviceGuard>
        </ResourceProvider>
      </body>
    </html>
  );
}
