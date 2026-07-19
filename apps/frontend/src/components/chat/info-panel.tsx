"use client"
import { Avatar } from './avatar'
import { UserStatus } from './user-status'
import { Button } from '@/components/ui/button'
import {
  X,
  VolumeX,
  Bell,
  Share2,
  FileText,
  Link2,
} from 'lucide-react'

interface Member {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'away' | 'offline' | 'busy'
}

interface MediaItem {
  id: string
  type: 'image' | 'link' | 'doc' | 'file'
  title: string
  url: string
}

interface InfoPanelProps {
  title: string
  description?: string
  avatar?: string
  isGroup?: boolean
  members?: Member[]
  mediaItems?: MediaItem[]
  onClose?: () => void
  onMute?: () => void
  onDelete?: () => void
  onShare?: () => void
  isMuted?: boolean
  canDelete?: boolean
}

export function InfoPanel({
  title,
  description,
  avatar,
  isGroup = false,
  members = [],
  mediaItems,
  onClose,
  onMute,
  onShare,
  isMuted = false,
}: InfoPanelProps) {
  return (
    <div className="w-80 border-l border-[#2C2C2C] bg-[#171717] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#2C2C2C] flex items-center justify-between shrink-0">
        <h2 className="font-semibold text-white">Details</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="bg-[#1A1A1A] text-[#A1A1AA] hover:bg-[#252525]"
          aria-label="Close panel"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-6 p-4">
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="rounded-[28px] bg-[#111111] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
            <Avatar
              alt={title}
              name={title}
              src={avatar}
              size="lg"
            />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{title}</h3>
            {description && (
              <p className="text-sm text-[#A1A1AA]">{description}</p>
            )}
          </div>
        </div>

        {/* Members Section */}
        {isGroup && members.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm text-white mb-3">
              Members ({members.length})
            </h3>
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-3xl bg-[#121212] hover:bg-[#252525] transition-colors"
                >
                  <Avatar
                    alt={member.name}
                    name={member.name}
                    src={member.avatar}
                    status={member.status}
                    showStatus={true}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {member.name}
                    </p>
                    <UserStatus status={member.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-[#2C2C2C]" />

        {/* Media Section */}
        <div>
          <h3 className="font-semibold text-sm text-white mb-3">
            Media, links & docs
            {mediaItems && mediaItems.length > 0 && (
              <span className="ml-2 text-xs text-zinc-500">({mediaItems.length})</span>
            )}
          </h3>
          {mediaItems && mediaItems.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {mediaItems.slice(0, 6).map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="aspect-square overflow-hidden rounded-3xl bg-[#1E1E1E] border border-[#2C2C2C] transition-colors hover:bg-[#252525]"
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-2 px-2 text-center">
                      {item.type === 'link' ? (
                        <Link2 className="w-5 h-5 text-[#A1A1AA]" />
                      ) : (
                        <FileText className="w-5 h-5 text-[#A1A1AA]" />
                      )}
                      <p className="text-[11px] leading-4 text-white truncate">
                        {item.title}
                      </p>
                    </div>
                  )}
                </a>
              ))}
              {mediaItems.length > 6 && (
                <div className="aspect-square rounded-3xl bg-[#1E1E1E] border border-[#2C2C2C] flex items-center justify-center text-sm text-zinc-400">
                  +{mediaItems.length - 6}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No media, links or docs in this conversation yet.</p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#2C2C2C]" />

        {/* Actions Section */}
        <div className="space-y-2">
          {onMute && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-white bg-[#1A1A1A] hover:bg-[#252525]"
              onClick={onMute}
            >
              {isMuted ? (
                <>
                  <Bell className="w-4 h-4" />
                  Unmute notifications
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  Mute notifications
                </>
              )}
            </Button>
          )}

          {onShare && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-white bg-[#1A1A1A] hover:bg-[#252525]"
              onClick={onShare}
            >
              <Share2 className="w-4 h-4" />
              Share contact
            </Button>
          )}

          {/* {onDelete && canDelete && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-[#EF4444] bg-[#1A1A1A] hover:bg-[#3B0A0A]"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
              Delete chat
            </Button>
          )} */}
        </div>
      </div>
    </div>
  )
}
