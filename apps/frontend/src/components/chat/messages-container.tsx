'use client'

import { useEffect, useRef } from 'react'

interface MessagesContainerProps {
  children: React.ReactNode
  autoScroll?: boolean
  className?: string
}

export function MessagesContainer({
  children,
  autoScroll = true,
  className = '',
}: MessagesContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [children, autoScroll])

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto flex flex-col bg-[#0B0B0C] ${className}`}
    >
      <div className="px-6 py-5 space-y-5 flex-1">
        {children}
      </div>
      <div ref={endRef} />
    </div>
  )
}

interface DateSeparatorProps {
  date: string
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-[#2C2C2C]" />
      <span className="text-xs text-[#A1A1AA] font-medium bg-[#151515] px-3 py-1 rounded-full">
        {date}
      </span>
      <div className="flex-1 h-px bg-[#2C2C2C]" />
    </div>
  )
}

interface TypingIndicatorProps {
  userName?: string
}

export function TypingIndicator({ userName = 'Someone' }: TypingIndicatorProps) {
  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#1E1E1E] rounded-full text-sm text-[#A1A1AA] shadow-[0_6px_18px_rgba(0,0,0,0.25)]">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-[#71717A] rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-[#71717A] rounded-full animate-bounce delay-100" />
        <div className="w-2 h-2 bg-[#71717A] rounded-full animate-bounce delay-200" />
      </div>
      <span>{userName} is typing...</span>
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center h-full gap-4 p-8 text-center bg-[#0B0B0C]">
      {icon && <div className="text-4xl text-[#A1A1AA]">{icon}</div>}
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && (
          <p className="text-sm text-[#A1A1AA] mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}
