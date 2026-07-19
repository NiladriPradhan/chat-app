'use client'

/* React import removed (JSX transform handles runtime) */
import { StatusIndicator } from './user-status'

interface AvatarProps {
  src?: string
  alt: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'away' | 'offline' | 'busy'
  showStatus?: boolean
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const statusSizeClasses = {
  sm: 'w-3 h-3 -bottom-0.5 -right-0.5',
  md: 'w-3 h-3 -bottom-0.5 -right-0.5',
  lg: 'w-4 h-4 -bottom-1 -right-1',
  xl: 'w-5 h-5 -bottom-1 -right-1',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-[#2563EB]',
    'bg-[#8B5CF6]',
    'bg-[#22C55E]',
    'bg-[#0EA5E9]',
    'bg-[#F97316]',
    'bg-[#0F766E]',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function Avatar({
  src,
  alt,
  name = 'User',
  size = 'md',
  status,
  showStatus = false,
}: AvatarProps) {
  return (
    <div className="relative">
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeClasses[size]} rounded-full object-cover border border-[#2C2C2C] shadow-[0_8px_20px_rgba(0,0,0,0.16)]`}
          loading="lazy"
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white border border-[#2C2C2C] shadow-[0_8px_20px_rgba(0,0,0,0.16)] ${getColorFromName(name)}`}
        >
          {getInitials(name)}
        </div>
      )}
      {showStatus && status && (
        <div
          className={`absolute ${statusSizeClasses[size]} border-2 border-[#0B0B0C] rounded-full`}
        >
          <StatusIndicator status={status} size={size === 'xl' ? 'lg' : 'md'} />
        </div>
      )}
    </div>
  )
}
