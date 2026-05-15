'use client'

import { useState } from 'react'
import { Upload, Mail, Link2, Bot } from 'lucide-react'
import { Project } from '@/types'
import ScanFilesModal from '@/components/files/ScanFilesModal'
import Address from '@/components/Address'
import ShareableLink from '@/components/ShareableLink'
import FormModal from '@/components/ui/Popup'

interface FirstRunSourcePickerProps {
  project: Project
  plan: string
  subscriptionType?: string
  is_project_owner: boolean
  linkOwner: string
  onManualSetup: () => void
}

type OpenModal = 'upload' | 'email' | 'share' | null

interface SourceCardConfig {
  key: Exclude<OpenModal, null>
  icon: typeof Upload
  title: string
  description: string
  ownerOnly?: boolean
}

const SOURCE_CARDS: SourceCardConfig[] = [
  {
    key: 'upload',
    icon: Upload,
    title: 'Upload Files',
    description: 'Drag and drop or browse from your computer.',
  },
  {
    key: 'email',
    icon: Mail,
    title: 'Email Forward',
    description: "Forward attachments to your agent's email address.",
  },
  {
    key: 'share',
    icon: Link2,
    title: 'Shareable Link',
    description: 'Generate a link for teammates or clients to upload.',
    ownerOnly: true,
  },
]

export default function FirstRunSourcePicker({
  project,
  plan,
  subscriptionType,
  is_project_owner,
  linkOwner,
  onManualSetup,
}: FirstRunSourcePickerProps) {
  const [openModal, setOpenModal] = useState<OpenModal>(null)

  const visibleCards = SOURCE_CARDS.filter(
    (card) => !card.ownerOnly || is_project_owner
  )

  return (
    <div
      data-testid="first-run-source-picker"
      className="h-full w-full overflow-y-auto"
    >
      <div className="min-h-full flex items-center justify-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Live · Waiting for your first document…
          </span>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mb-4">
            <Bot size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Where will your files come from?
          </h2>
          <p className="mt-2 text-gray-500 text-sm sm:text-base">
            Pick a source — your agent starts the moment a file lands.
          </p>
        </div>

        <div
          className={`grid grid-cols-1 ${
            visibleCards.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
          } gap-4`}
        >
          {visibleCards.map((card) => {
            const Icon = card.icon
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setOpenModal(card.key)}
                data-testid={`source-card-${card.key}`}
                className="group flex flex-col items-center text-center gap-3 p-5 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors">
                  <Icon size={22} />
                </div>
                <span className="font-semibold text-gray-900">{card.title}</span>
                <span className="text-xs text-gray-500 leading-relaxed">
                  {card.description}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={onManualSetup}
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors underline-offset-2 hover:underline"
          >
            or set up columns manually →
          </button>
        </div>
      </div>
      </div>

      {openModal === 'upload' && (
        <ScanFilesModal
          projectId={project.id}
          linkOwner={linkOwner}
          plan={plan}
          subscriptionType={subscriptionType}
          isOpen={true}
          onClose={() => setOpenModal(null)}
        />
      )}

      {openModal === 'email' && (
        <FormModal
          visible={true}
          onCancel={() => setOpenModal(null)}
          position="center"
          size="small"
          isHeaderHidden
        >
          <Address
            address={project.address_domain ?? ''}
            setIsAddressPopupVisible={() => setOpenModal(null)}
          />
        </FormModal>
      )}

      {openModal === 'share' && is_project_owner && (
        <FormModal
          visible={true}
          onCancel={() => setOpenModal(null)}
          position="center"
          size="small"
          isHeaderHidden
        >
          <ShareableLink
            shareableLink={project.shareable_link ?? ''}
            project={project}
            projectId={project.id}
            isLinkActive={project.link_is_active ?? false}
            setIsShareLinkPopupVisible={() => setOpenModal(null)}
          />
        </FormModal>
      )}
    </div>
  )
}
