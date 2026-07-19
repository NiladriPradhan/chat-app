'use client'

/* React import removed (JSX transform handles runtime) */

interface UserStatusProps {
  status: 'online' | 'away' | 'offline' | 'busy'
  size?: 'sm' | 'md' | 'lg'
}

const statusColors = {
  online: 'bg-[#22C55E]',
  away: 'bg-[#FACC15]',
  offline: 'bg-[#71717A]',
  busy: 'bg-[#EF4444]',
}

const statusLabels = {
  online: 'Online',
  away: 'Away',
  offline: 'Offline',
  busy: 'Busy',
}

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
}

export function UserStatus({ status, size = 'md' }: UserStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} ${statusColors[status]} rounded-full shadow-[0_0_0_6px_rgba(15,15,16,0.35)]`}
        title={statusLabels[status]}
        aria-label={statusLabels[status]}
      />
      <span className="text-xs text-[#A1A1AA]">{statusLabels[status]}</span>
    </div>
  )
}

export function StatusIndicator({ status, size = 'md' }: UserStatusProps) {
  return (
    <div
      className={`${sizeClasses[size]} ${statusColors[status]} rounded-full ring-2 ring-[#0B0B0C]`}
      title={statusLabels[status]}
      aria-label={statusLabels[status]}
    />
  )
}
