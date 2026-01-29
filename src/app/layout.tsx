import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import Footer from "@/components/Footer";
import Header from "@/components/header/header";
import OfflineSyncManager from "@/components/OfflineSyncManager";
import GlobalUsageLimitHandler from "@/components/modals/GlobalUsageLimitHandler";


const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "Cellilox | Home",
    description: "Welcome to Cellilox, your smart system for document processing and data entry!",
    icons: {
        icon: "/favicon.ico",
    },
    manifest: "/manifest.json",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body
                    suppressHydrationWarning
                    className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                >
                    <Header />
                    <OfflineSyncManager />
                    <GlobalUsageLimitHandler />
                    {children}

                    <Footer />

                </body>
            </html>
        </ClerkProvider>
    );
}
