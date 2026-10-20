import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ตารางปฏิบัติงานจิตอาสา - กก.ตชด.23",
  description: "ระบบจัดการและแสดงผลตารางปฏิบัติงานจิตอาสา กก.ตชด.23",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png", // สำหรับแสดงไอคอนเมื่อกด Add to Home Screen บน iPhone/iPad
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}