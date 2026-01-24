"use client";

import SmartAuthGuard from "@/components/auth/SmartAuthGuard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SmartAuthGuard>{children}</SmartAuthGuard>;
}
