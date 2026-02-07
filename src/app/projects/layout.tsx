"use client";

import SmartAuthGuard from "@/components/auth/SmartAuthGuard";

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SmartAuthGuard>{children}</SmartAuthGuard>;
}
