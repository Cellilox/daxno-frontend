"use client";

import SmartAuthGuard from "@/components/auth/SmartAuthGuard";

export default function AcceptInviteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SmartAuthGuard>{children}</SmartAuthGuard>;
}
