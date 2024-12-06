'use client'
import React, { ReactNode } from 'react'
import { ModalContextProvider } from './modal'
export default function ModalProvider({children}: {children: ReactNode}) {
  return (
    <ModalContextProvider>
        {children}
    </ModalContextProvider>
  )
}
