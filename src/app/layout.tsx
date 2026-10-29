import type { Metadata } from "next";
import "./globals.css";
import { ResourceProvider } from "@/app/context/ResourceContext";
import { ToastProvider } from "@/components/Toast/ToastContext";

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
          <ToastProvider>
            {children}
          </ToastProvider>
        </ResourceProvider>
      </body>
    </html>
  );
}
