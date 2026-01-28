'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Separate component to handle conditional rendering based on auth/path
function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return children;
  }

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64 transition-all duration-300">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--background)]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Toaster position="top-right" />
          <AdminLayout>{children}</AdminLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
