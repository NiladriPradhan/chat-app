"use client";

import { memo } from "react";
import { Avatar } from "./avatar";
import { Pin, X } from "lucide-react";

interface ConversationItemProps {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isPinned?: boolean;
  isSelected?: boolean;
  status?: "online" | "away" | "offline" | "busy";
  onSelect: (id: string) => void;
  onPin?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export const ConversationItem = memo(function ConversationItem({
  id,
  name,
  avatar,
  lastMessage,
  timestamp,
  unreadCount = 0,
  isPinned = false,
  isSelected = false,
  status = "offline",
  onSelect,
  onPin,
  onRemove,
}: ConversationItemProps) {
  return (
    <div
      className={`group flex items-center gap-3 p-3 rounded-3xl cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-[#1E1E1E] border border-[#3B82F6]/40 shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
          : "bg-[#171717] hover:bg-[#252525] border border-transparent"
      }`}
      onClick={() => onSelect(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onSelect(id);
        }
      }}
    >
      <Avatar
        alt={name}
        name={name}
        src={avatar}
        status={status}
        showStatus={true}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm text-white truncate">{name}</h3>
          <span className="text-xs text-[#71717A] shrink-0">{timestamp}</span>
        </div>
        <p className="text-sm text-[#A1A1AA] truncate">{lastMessage}</p>
      </div>

      {unreadCount > 0 && (
        <div className="ml-2 shrink-0">
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#3B82F6] rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        </div>
      )}

      <div className="hidden group-hover:flex items-center gap-1 shrink-0">
        {onPin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin(id);
            }}
            className="p-1.5 rounded-2xl bg-[#1A1A1A] hover:bg-[#252525] transition-colors"
            aria-label={isPinned ? "Unpin conversation" : "Pin conversation"}
          >
            <Pin
              className={`w-4 h-4 ${isPinned ? "fill-[#3B82F6] text-[#3B82F6]" : "text-[#A1A1AA]"}`}
            />
          </button>
        )}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
            className="p-1.5 rounded-2xl bg-[#1A1A1A] hover:bg-[#252525] transition-colors"
            aria-label="Remove conversation"
          >
            <X className="w-4 h-4 text-[#A1A1AA]" />
          </button>
        )}
      </div>
    </div>
  );
});
