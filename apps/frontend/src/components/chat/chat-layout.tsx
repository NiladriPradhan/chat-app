'use client'

/* no React hooks needed here */

interface ChatLayoutProps {
  sidebar: React.ReactNode
  header: React.ReactNode
  content: React.ReactNode
  input: React.ReactNode
  infoPanelOpen?: boolean
  infoPanel?: React.ReactNode
}

export function ChatLayout({
  sidebar,
  header,
  content,
  input,
  infoPanelOpen = false,
  infoPanel,
}: ChatLayoutProps) {
  return (
    <div className="flex h-screen bg-[#0F0F10] text-white">
      {/* Sidebar */}
      <div className="w-64 hidden md:flex flex-col border-r border-[#2C2C2C] shadow-[inset_1px_0_0_rgba(255,255,255,0.03)]">
        {sidebar}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B0B0C]">
        {/* Header */}
        <div className="shrink-0">
          {header}
        </div>

        {/* Messages */}
        <div className="flex-1 flex min-h-0">
          {content}

          {/* Info Panel */}
          {infoPanelOpen && infoPanel && (
            <div className="hidden lg:block border-l border-[#2C2C2C]">
              {infoPanel}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0">
          {input}
        </div>
      </div>
    </div>
  )
}

export function MobileDrawer({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute left-0 top-0 h-full w-64 bg-[#171717] border-r border-[#2C2C2C] shadow-[0_12px_40px_rgba(0,0,0,0.45)] flex flex-col">
        {children}
      </div>
    </div>
  )
}
