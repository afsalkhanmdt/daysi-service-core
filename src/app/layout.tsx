import type { Metadata } from "next";
import "./globals.css";
import icon from "../../public/favicon.ico";

export const metadata: Metadata = {
  title: "Daysi",
  description: "Daysi Calender Application",
  icons: {
    icon: "../../public/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
