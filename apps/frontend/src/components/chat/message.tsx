"use client";

/* React import removed (JSX transform handles runtime) */
import { useEffect, useRef, useState } from "react";
import { Avatar } from "./avatar";
import { CheckCheck, Clock, MoreHorizontal } from "lucide-react";

interface MessageProps {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  isOwn: boolean;
  status?: "sent" | "sending" | "delivered" | "read";
  showAvatar?: boolean;
  showTimestamp?: boolean;
  attachments?: {
    fileUrl: string;
    fileType: string;
    fileName: string;
    url?: string;
    type?: string;
  }[];
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  onForward?: (id: string) => void;
  isPinned?: boolean;
  isDeleted?: boolean;
}

export function Message({
  id,
  content = "",
  author,
  timestamp,
  isOwn,
  status = "read",
  showAvatar = true,
  showTimestamp = true,
  attachments = [],
  onDelete,
  onPin,
  onForward,
  isPinned = false,
  isDeleted = false,
}: MessageProps) {
  const isSending = status === "sending";
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const forwardedPrefix = "(Fwd)";
  const isForwardedMessage = content.startsWith(forwardedPrefix);
  let forwardedMessageContent = isForwardedMessage
    ? content.slice(forwardedPrefix.length)
    : content;
  forwardedMessageContent = forwardedMessageContent
    .replace(/^(\s*\(Fwd\)\s*)+/, "")
    .trimStart();

  // FIX: show placeholder whenever isDeleted is true
  const showDeletedPlaceholder = isDeleted;

  useEffect(() => {
    if (!menuOpen && !confirmDelete) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setConfirmDelete(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, confirmDelete]);

  return (
    <div
      className={`flex gap-3 mb-3 animate-in fade-in duration-200 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      id={`message-${id}`}
    >
      {showAvatar && (
        <div className="shrink-0 mt-1">
          <Avatar
            alt={author.name}
            name={author.name}
            src={author.avatar}
            size="sm"
          />
        </div>
      )}

      <div
        className={`flex flex-col ${isOwn ? "items-end" : "items-start"} gap-1 flex-1`}
      >
        <div
          ref={rootRef}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => {
            setHovered(false);
            if (!confirmDelete) {
              setConfirmDelete(false);
            }
          }}
          className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-[30px] transition-all shadow-[0_12px_30px_rgba(0,0,0,0.18)] ${
            isOwn
              ? "bg-[#3B82F6] text-white rounded-br-none"
              : "bg-[#1E1E1E] border border-[#2C2C2C] text-[#F8FAFC] rounded-bl-none"
          } ${isSending ? "opacity-80" : "opacity-100"}`}
        >
          {/* Only show the action menu if the message is NOT deleted */}
          {!isDeleted && (hovered || menuOpen || confirmDelete) && (
            <div className={`absolute top-1 ${isOwn ? "left-1" : "right-1"}`}>
              <button
                onClick={() => setMenuOpen((s) => !s)}
                className="p-1 rounded-full text-[#A1A1AA] hover:bg-[#2C2C2C] transition-all"
                aria-label="More actions"
                title="More actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          )}

          {!isDeleted && (menuOpen || confirmDelete) && (
            <div
              className={`absolute top-8 ${isOwn ? "left-1" : "right-1"} w-40 bg-[#121212] border border-[#2C2C2C] rounded shadow-lg z-10 p-2`}
            >
              {confirmDelete ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#A1A1AA]">Delete?</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        onDelete && onDelete(id);
                        setConfirmDelete(false);
                        setMenuOpen(false);
                      }}
                      className="text-xs px-2 py-0.5 rounded bg-red-600 text-white"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs px-2 py-0.5 rounded bg-[#2C2C2C] text-[#A1A1AA]"
                    >
                      No
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  {onForward && (
                    <button
                      onClick={() => {
                        onForward(id);
                        setMenuOpen(false);
                      }}
                      className="text-left px-2 py-1 rounded hover:bg-[#1E1E1E]"
                    >
                      Forward
                    </button>
                  )}
                  {onPin && (
                    <button
                      onClick={() => {
                        onPin(id);
                        setMenuOpen(false);
                      }}
                      className="text-left px-2 py-1 rounded hover:bg-[#1E1E1E]"
                    >
                      {isPinned ? "Unpin" : "Pin"}
                    </button>
                  )}
                          {onDelete && isOwn && (
                    <button
                      onClick={() => {
                        setMenuOpen(true);
                        setConfirmDelete(true);
                      }}
                      className="text-left px-2 py-1 rounded hover:bg-[#1E1E1E]"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Attachments – hide if deleted */}
          {!isDeleted && attachments.length > 0 && (
            <div className="flex flex-col gap-2 mb-2">
              {attachments.map((att, i) => {
                const url = att.fileUrl || att.url || "";
                const type = att.fileType || att.type || "";
                const name = att.fileName || "Attachment";

                if (type.startsWith("image/")) {
                  return (
                    <a
                      key={i}
                      href={
                        import.meta.env.VITE_API_URL?.replace("/api", "") + url
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={
                          import.meta.env.VITE_API_URL?.replace("/api", "") +
                          url
                        }
                        alt={name}
                        className="max-w-[200px] max-h-[200px] rounded-lg object-cover border border-[#2C2C2C]"
                      />
                    </a>
                  );
                }

                return (
                  <a
                    key={i}
                    href={
                      import.meta.env.VITE_API_URL?.replace("/api", "") + url
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#252525] hover:bg-[#2C2C2C] text-sm text-blue-400 hover:text-blue-300 transition-colors border border-[#333]"
                  >
                    <span className="truncate max-w-[150px]">{name}</span>
                  </a>
                );
              })}
            </div>
          )}

          {/* Pinned label – hide if deleted */}
          {!isDeleted && isPinned && (
            <div className="text-xs text-yellow-300 mb-1">Pinned</div>
          )}

          {showDeletedPlaceholder ? (
            <p className="text-sm leading-6 break-words text-[#A1A1AA] italic">
              Message deleted
            </p>
          ) : (
            <>
              {isForwardedMessage && (
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#A1A1AA] mb-2">
                  (Fwd)
                </p>
              )}
              {forwardedMessageContent && (
                <p className="text-sm leading-6 break-words">
                  {forwardedMessageContent}
                </p>
              )}
            </>
          )}
        </div>

        {showTimestamp && (
          <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
            <span>{timestamp}</span>
            {isOwn && (
              <>
                {status === "sending" && <Clock className="w-3 h-3" />}
                {status === "delivered" && <CheckCheck className="w-3 h-3" />}
                {status === "read" && (
                  <CheckCheck className="w-3 h-3 text-[#BFDBFE]" />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MessageGroupProps {
  messages: MessageProps[];
  showAvatarOnGroupStart?: boolean;
}

export function MessageGroup({
  messages,
  showAvatarOnGroupStart = true,
}: MessageGroupProps) {
  return (
    <div className="space-y-1">
      {messages.map((message, index) => (
        <Message
          key={message.id}
          {...message}
          showAvatar={showAvatarOnGroupStart ? index === 0 : true}
          showTimestamp={index === messages.length - 1}
        />
      ))}
    </div>
  );
}
