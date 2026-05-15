'use client'

import React from 'react'
import {
  Sparkles,
  ReceiptText,
  Receipt,
  ShoppingCart,
  Ship,
  Landmark,
  CreditCard,
  Wallet,
  FileText,
  FileLock2,
  FileSpreadsheet,
  ShieldCheck,
  Loader2,
} from 'lucide-react'

export const CUSTOM_DOCUMENT_TYPE = 'Custom'

type DocumentType = {
  label: string
  icon: React.ReactNode
}

const DOCUMENT_TYPES: DocumentType[] = [
  { label: CUSTOM_DOCUMENT_TYPE, icon: <Sparkles size={22} /> },
  { label: 'Invoices', icon: <ReceiptText size={22} /> },
  { label: 'Receipts', icon: <Receipt size={22} /> },
  { label: 'Purchase Orders', icon: <ShoppingCart size={22} /> },
  { label: 'Bills of Lading', icon: <Ship size={22} /> },
  { label: 'Bank Statements', icon: <Landmark size={22} /> },
  { label: 'ID Cards', icon: <CreditCard size={22} /> },
  { label: 'Payslips', icon: <Wallet size={22} /> },
  { label: 'Resumes', icon: <FileText size={22} /> },
  { label: 'NDAs', icon: <FileLock2 size={22} /> },
  { label: 'W9 Tax Forms', icon: <FileSpreadsheet size={22} /> },
  { label: 'Insurance Claims', icon: <ShieldCheck size={22} /> },
]

interface DocumentTypePickerProps {
  onPick: (type: string) => void
  onCustom: () => void
  isCreating?: boolean
  creatingLabel?: string | null
}

export default function DocumentTypePicker({
  onPick,
  onCustom,
  isCreating = false,
  creatingLabel = null,
}: DocumentTypePickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {DOCUMENT_TYPES.map((type) => {
        const isCustom = type.label === CUSTOM_DOCUMENT_TYPE
        const isThisCreating = creatingLabel === type.label
        return (
          <button
            key={type.label}
            type="button"
            disabled={isCreating}
            onClick={() => (isCustom ? onCustom() : onPick(type.label))}
            data-testid={`document-type-${type.label.toLowerCase().replace(/\s+/g, '-')}`}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-center transition-all
              ${isCustom
                ? 'border-dashed border-blue-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50'
                : 'border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50'}
              ${isCreating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isThisCreating ? <Loader2 size={22} className="animate-spin" /> : type.icon}
            <span className="text-sm font-medium leading-tight">{type.label}</span>
          </button>
        )
      })}
    </div>
  )
}
