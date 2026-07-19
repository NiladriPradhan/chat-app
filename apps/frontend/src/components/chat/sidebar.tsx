"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "./avatar";
import { Plus, Search, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SidebarOption {
  label: string;
  onClick: () => void;
}

interface SidebarProps {
  currentUser?: {
    id: string;
    name: string;
    avatar?: string;
    status: "online" | "away" | "offline" | "busy";
  };
  onNewChat?: () => void;
  onSearch?: (query: string) => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onMoreClick?: () => void;
  onLogoClick?: () => void;
  moreOptions?: SidebarOption[];
  children?: React.ReactNode;
}

export function Sidebar({
  currentUser,
  onNewChat,
  onSearch,
  onSettings,
  onLogout,
  children,
}: SidebarProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMoreMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setIsMoreMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMoreMenuOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleRedirect = () => {
    navigate("/");
  };

  function onLogoClick() {
    throw new Error("Function not implemented.");
  }

  return (
    <aside className="flex flex-col h-full w-full bg-[#171717] border-r border-[#2C2C2C]">
      {/* Header */}
      <div className="p-4 space-y-4 shrink-0 border-b border-[#2C2C2C]">
        <div className="flex items-center justify-between gap-3">
          <h1
            role="button"
            tabIndex={0}
            // onClick={() => onLogoClick?.()}
            onClick={handleRedirect}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onLogoClick?.();
            }}
            className="text-2xl font-semibold text-white cursor-pointer select-none"
            title="Exit chat"
          >
            SyncTalk
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              className="bg-[#1A1A1A] text-[#A1A1AA] hover:bg-[#252525]"
              aria-label="Start new chat"
              title="New chat"
            >
              <Plus className="w-5 h-5" />
            </Button>
            {/* <div className="relative" ref={moreMenuRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (moreOptions && moreOptions.length > 0) {
                    setIsMoreMenuOpen((current) => !current);
                    return;
                  }
                  onMoreClick?.();
                }}
                className="bg-[#1A1A1A] text-[#A1A1AA] hover:bg-[#252525]"
                aria-label="More options"
                title="More options"
                aria-haspopup="true"
                aria-expanded={isMoreMenuOpen}
              >
                <MoreVertical className="w-5 h-5" />
              </Button>

              {isMoreMenuOpen && moreOptions && moreOptions.length > 0 && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-[#2C2C2C] bg-[#121212] shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
                  {moreOptions.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        option.onClick();
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#1E1E1E]"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div> */}
          </div>
        </div>

        {/* Search */}
        <div
          className={`relative rounded-3xl border bg-[#121212] transition-colors ${
            isSearchFocused
              ? "border-[#3B82F6] shadow-[0_0_0_1px_rgba(59,130,246,0.7)]"
              : "border-[#2C2C2C]"
          }`}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search conversations..."
            className="w-full pl-12 pr-4 py-3 bg-[#121212] text-sm text-white placeholder-[#71717A] rounded-3xl focus:outline-none transition-colors"
            aria-label="Search conversations"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-3">
        {children}
      </div>

      {/* Footer */}
      <div className="p-4 space-y-3 shrink-0 border-t border-[#2C2C2C]">
        {currentUser && (
          <div className="flex items-center gap-3 p-3 rounded-3xl bg-[#1E1E1E] border border-[#2C2C2C] shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
            <Avatar
              alt={currentUser.name}
              name={currentUser.name}
              src={currentUser.avatar}
              status={currentUser.status}
              showStatus={true}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-[#A1A1AA]">Active</p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettings}
            className="bg-[#1A1A1A] text-[#A1A1AA] hover:bg-[#252525] flex-1"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="bg-[#1A1A1A] text-[#A1A1AA] hover:bg-[#252525] flex-1"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
