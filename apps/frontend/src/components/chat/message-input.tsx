'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Paperclip,
  Send,
  Smile,
  Mic,
  X,
} from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (message: string, files: File[]) => void | Promise<void>
  onAttach?: (files: FileList) => void
  onEmojiClick?: () => void
  onVoiceStart?: () => void
  onChange?: () => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSendMessage,
  onAttach,
  onEmojiClick,
  onVoiceStart,
  onChange,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [isSending, setIsSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textInputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = async () => {
    if ((message.trim() || attachedFiles.length > 0) && !isSending) {
      setIsSending(true)
      try {
        await onSendMessage(message.trim(), attachedFiles)
      } finally {
        setIsSending(false)
      }
      setMessage('')
      setAttachedFiles([])
      if (textInputRef.current) {
        textInputRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && !isSending) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(Array.from(e.target.files))
      onAttach?.(e.target.files)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
    onChange?.()
  }

  const removeAttachment = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index))
  }

  return (
    <div className="p-4 border-t border-[#2C2C2C] bg-[#151515] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      {attachedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 bg-[#1E1E1E] rounded-2xl text-sm text-white shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
            >
              <Paperclip className="w-4 h-4 text-[#A1A1AA]" />
              <span className="truncate max-w-xs">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-[#A1A1AA] hover:text-white transition-colors"
                aria-label="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-2 rounded-2xl bg-[#1A1A1A] text-[#A1A1AA] hover:bg-[#252525] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Attach file"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain"
          onChange={handleFileChange}
          className="hidden"
          aria-label="File input"
        />

        <textarea
          ref={textInputRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 px-4 py-3 bg-[#0F0F10] rounded-[26px] text-sm text-white placeholder-[#71717A] resize-none border border-[#2C2C2C] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed max-h-30"
        />

        <button
          onClick={onEmojiClick}
          disabled={disabled}
          className="p-2 rounded-2xl bg-[#1A1A1A] text-[#A1A1AA] hover:bg-[#252525] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Open emoji picker"
          title="Emoji picker"
        >
          <Smile className="w-5 h-5" />
        </button>

        <button
          onClick={onVoiceStart}
          disabled={disabled || message.length > 0}
          className="p-2 rounded-2xl bg-[#1A1A1A] text-[#A1A1AA] hover:bg-[#252525] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Start voice message"
          title="Voice message"
        >
          <Mic className="w-5 h-5" />
        </button>

        <Button
          onClick={handleSend}
          disabled={(!message.trim() && attachedFiles.length === 0) || disabled || isSending}
          size="sm"
          className="gap-2"
          aria-label="Send message"
        >
          {isSending ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{isSending ? 'Sending...' : 'Send'}</span>
        </Button>
      </div>
    </div>
  )
}
