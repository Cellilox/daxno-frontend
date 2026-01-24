"use client";

import SmartAuthGuard from "@/components/auth/SmartAuthGuard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SmartAuthGuard>{children}</SmartAuthGuard>;
}
