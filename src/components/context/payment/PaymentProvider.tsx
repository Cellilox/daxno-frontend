"use client"

import React from 'react'
import { PaymentProvider } from './Payment';
export default function PaymentClientProvider({ children }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <PaymentProvider>
            {children}
        </PaymentProvider>
    )
}
