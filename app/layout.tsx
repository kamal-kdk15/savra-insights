import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Savra Insights — Principal Dashboard",
  description: "Teacher activity analytics for school administrators",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <SessionProvider session={null}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
