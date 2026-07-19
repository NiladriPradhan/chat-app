'use client'

/* React import removed (JSX transform handles runtime) */
import { Avatar } from './avatar'
import { UserStatus } from './user-status'
import { Button } from '@/components/ui/button'
import {
  Phone,
  Video,
  Search,
  Info,
  MoreVertical,
  PhoneMissed,
  X,
} from 'lucide-react'

interface ChatHeaderProps {
  title: string
  subtitle?: string
  avatar?: string
  status?: 'online' | 'away' | 'offline' | 'busy'
  isGroup?: boolean
  memberCount?: number
  onCallStart?: () => void
  onVideoStart?: () => void
  onSearch?: () => void
  searchActive?: boolean
  searchQuery?: string
  onSearchChange?: (q: string) => void
  onSearchClose?: () => void
  onInfo?: () => void
  onMoreOptions?: () => void
  isCallActive?: boolean
  onCallEnd?: () => void
}

export function ChatHeader({
  title,
  subtitle,
  avatar,
  status = 'offline',
  isGroup = false,
  memberCount = 0,
  onCallStart,
  onVideoStart,
  onSearch,
  searchActive = false,
  searchQuery = '',
  onSearchChange,
  onSearchClose,
  onInfo,
  onMoreOptions,
  isCallActive = false,
  onCallEnd,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-[#2C2C2C] bg-[#151515] h-16">
      <div className="flex items-center gap-3 flex-1">
        <Avatar
          alt={title}
          name={title}
          src={avatar}
          status={status}
          showStatus={!isGroup}
          size="md"
        />

        <div className="flex-1 min-w-0">
          {searchActive ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search messages…"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={onSearchClose}
                className="bg-[#1A1A1A] text-[#A1A1AA] hover:bg-[#252525]"
                aria-label="Close search"
                title="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <h2 className="font-semibold text-white truncate">{title}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                {isGroup ? (
                  <p className="text-sm text-[#A1A1AA]">{memberCount} members</p>
                ) : (
                  <UserStatus status={status} size="sm" />
                )}
                {subtitle && (
                  <>
                    <span className="text-[#71717A]">•</span>
                    <p className="text-sm text-[#A1A1AA] truncate">{subtitle}</p>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isCallActive ? (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1E1E1E] rounded-full border border-[#2C2C2C]">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
              <span className="text-xs text-[#A1A1AA] font-medium">Call active</span>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={onCallEnd}
              className="gap-2"
              aria-label="End call"
            >
              <PhoneMissed className="w-4 h-4" />
              <span className="hidden sm:inline">End</span>
            </Button>
          </>
        ) : (
          <>
            {onCallStart && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCallStart}
                className="bg-[#1A1A1A] text-[#A1A1AA] hover:bg-[#252525]"
                aria-label="Start voice call"
                title="Voice call"
              >
                <Phone className="w-5 h-5" />
              </Button>
            )}

            {onVideoStart && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onVideoStart}
                className="bg-[#1A1A1A] text-[#A1A1AA] hover:bg-[#252525]"
                aria-label="Start video call"
                title="Video call"
              >
                <Video className="w-5 h-5" />
              </Button>
            )}

            {onSearch && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSearch}
                className="bg-[#1A1A1A] text-[#A1A1AA] hover:bg-[#252525]"
                aria-label="Search messages"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </Button>
            )}

            {onInfo && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onInfo}
                className="bg-[#1A1A1A] text-[#A1A1AA] hover:bg-[#252525]"
                aria-label="View chat details"
                title="Info"
              >
                <Info className="w-5 h-5" />
              </Button>
            )}

            {onMoreOptions && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMoreOptions}
                className="bg-[#1A1A1A] text-[#A1A1AA] hover:bg-[#252525]"
                aria-label="More options"
                title="More"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
