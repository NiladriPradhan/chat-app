import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChatLayout,
  Sidebar,
  ChatHeader,
  MessagesContainer,
  MessageInput,
  ConversationItem,
  Message,
  TypingIndicator,
  InfoPanel,
  EmptyState,
  LogoutModal,
  NewChatModal,
} from "@/components/chat";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { useSocket } from "@/store/SocketContext";
import type {
  IncomingMessage,
  TypingEvent,
  MessageSeenEvent,
} from "@/store/SocketContext";
import { toast } from "react-hot-toast";
import {
  getConversations,
  getMessages,
  sendMessage as apiSendMessage,
  uploadAttachment,
  deleteMessage as apiDeleteMessage,
  deleteConversation as apiDeleteConversation,
  searchUsers,
  createDirectConversation,
} from "@/features/chat/api/chat";
import { getServerBaseUrl } from "@/lib/api";

// ── helpers ───────────────────────────────────────────────────────────────────

const param = (id: unknown) =>
  typeof id === "object" && id !== null
    ? ((id as any)._id ?? id)
    : String(id ?? "");

export default function ChatDashboard() {
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [conversationSearchQuery, setConversationSearchQuery] = useState("");

  // Typing: map of conversationId → array of typingUsers
  const [typingUsers, setTypingUsers] = useState<
    Record<string, { userId: string; userName: string }[]>
  >({});

  const { user, logout } = useAuth();
  const {
    socket,
    isConnected,
    onlineUserIds,
    joinConversation,
    leaveConversation,
    sendMessage: socketSendMessage,
    startTyping,
    stopTyping,
    markSeen,
  } = useSocket();

  const queryClient = useQueryClient();
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevConvoRef = useRef<string | null>(null);
  const [forwardingMessageId, setForwardingMessageId] = useState<string | null>(
    null,
  );
  const [forwardSearchQuery, setForwardSearchQuery] = useState("");
  const [forwardTargetUser, setForwardTargetUser] = useState<{
    _id: string;
    name: string;
    email: string;
  } | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [headerSearchActive, setHeaderSearchActive] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [clearedConversations, setClearedConversations] = useState<
    Record<string, string>
  >({});
  const moreOptionsRef = useRef<HTMLDivElement | null>(null);

  console.log(isVideoCallActive);

  const { data: forwardSearchData, isFetching: isSearchingUsers } = useQuery({
    queryKey: ["users:forward-search", forwardSearchQuery],
    queryFn: () => searchUsers(forwardSearchQuery),
    enabled:
      forwardingMessageId !== null && forwardSearchQuery.trim().length >= 1,
    staleTime: 30_000,
  });

  const forwardSearchResults: any[] =
    forwardSearchData?.data?.users ?? forwardSearchData?.data ?? [];

  // ── Data fetching ─────────────────────────────────────────────────────────

  // ── Data fetching ─────────────────────────────────────────────────────────

  const { data: conversationsData } = useQuery<{
    data: { conversations: any[] };
  }>({
    queryKey: ["conversations"],
    queryFn: getConversations,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000, // ✅ renamed from cacheTime
  });
  const conversations: any[] = conversationsData?.data?.conversations ?? [];

  const { data: messagesData } = useQuery<{ data: { messages: any[] } }>({
    queryKey: ["messages", selectedConversation],
    queryFn: () => getMessages(selectedConversation!),
    enabled: !!selectedConversation,
  });
  const messages: any[] = messagesData?.data?.messages ?? [];

  // ── REST send (fallback / optimistic) ────────────────────────────────────

  const sendMessageMutation = useMutation({
    mutationFn: (data: { content: string; attachments?: any[] }) =>
      apiSendMessage(selectedConversation!, data),
  });

  const deleteMessageMutation = useMutation({
    mutationFn: ({
      conversationId,
      messageId,
    }: {
      conversationId: string;
      messageId: string;
    }) => apiDeleteMessage(conversationId, messageId),
    onSuccess: (data, { conversationId, messageId }) => {
      // Replace the message in cache with the soft-deleted version
      const deletedMsg = data?.data?.message;
      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            messages: (old.data?.messages ?? []).map((m: any) =>
              m._id === messageId
                ? (deletedMsg ?? {
                    ...m,
                    isDeleted: true,
                    content: "",
                    attachments: [],
                  })
                : m,
            ),
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: any, vars, _context) => {
      console.error("Delete message failed", err, vars);
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Failed to delete message";
      toast.error(msg);
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: (conversationId: string) =>
      apiDeleteConversation(conversationId),
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.removeQueries({ queryKey: ["messages", conversationId] });
      setSelectedConversation(null);
      setShowInfoPanel(false);
      toast.success("Chat deleted");
    },
    onError: (err: any) => {
      console.error("Delete conversation failed", err);
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Failed to delete chat";
      toast.error(msg);
    },
  });

  const handleCallStart = () => {
    setIsCallActive(true);
    setIsVideoCallActive(false);
    toast.success("Starting voice call");
  };

  const handleVideoStart = () => {
    setIsCallActive(true);
    setIsVideoCallActive(true);
    toast.success("Starting video call");
  };

  const handleCallEnd = () => {
    setIsCallActive(false);
    setIsVideoCallActive(false);
    toast.success("Call ended");
  };

  const handleHeaderSearchToggle = () => {
    setHeaderSearchActive((s) => !s);
    if (headerSearchActive) setHeaderSearchQuery("");
  };

  const handleHeaderSearchChange = (q: string) => setHeaderSearchQuery(q);

  const handleToggleMute = () => {
    setIsMuted((current) => !current);
    setShowMoreOptions(false);
    toast.success(isMuted ? "Notifications unmuted" : "Notifications muted");
  };

  const handleClearMessages = () => {
    if (!selectedConversation) return;

    const clearedAt = new Date().toISOString();
    const updated = {
      ...clearedConversations,
      [selectedConversation]: clearedAt,
    };

    setClearedConversations(updated);
    localStorage.setItem(
      "chat-app-cleared-conversations",
      JSON.stringify(updated),
    );
    setShowMoreOptions(false);
    toast.success("Messages cleared");
  };

  const handleOpenSettings = () => {
    setShowInfoPanel(true);
    setShowMoreOptions(false);
  };

  const handleMoreOptionsToggle = () => setShowMoreOptions((s) => !s);

  // ── Join / leave conversation room ────────────────────────────────────────

  useEffect(() => {
    if (!isConnected) return;

    if (prevConvoRef.current && prevConvoRef.current !== selectedConversation) {
      leaveConversation(prevConvoRef.current);
    }

    if (selectedConversation) {
      joinConversation(selectedConversation);
    }

    prevConvoRef.current = selectedConversation;
  }, [selectedConversation, isConnected, joinConversation, leaveConversation]);

  useEffect(() => {
    const saved = localStorage.getItem("chat-app-cleared-conversations");
    if (saved) {
      try {
        setClearedConversations(JSON.parse(saved));
      } catch {
        setClearedConversations({});
      }
    }
  }, []);

  useEffect(() => {
    if (!showMoreOptions) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreOptionsRef.current &&
        !moreOptionsRef.current.contains(event.target as Node)
      ) {
        setShowMoreOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMoreOptions]);

  // ── Socket event listeners ────────────────────────────────────────────────

  useEffect(() => {
    if (!socket) return;

    // receive_message — inject into query cache
    const onReceiveMessage = (message: IncomingMessage) => {
      queryClient.setQueryData(
        ["messages", message.conversationId],
        (old: any) => {
          if (!old) return { data: { messages: [message], pagination: {} } };
          const msgs: any[] = old?.data?.messages ?? [];
          // If there's an optimistic message (client-side) matching this content and sender, replace it
          const optIndex = msgs.findIndex(
            (m: any) =>
              m.isOptimistic &&
              (m.sender?._id ?? m.senderId) === message.sender._id &&
              m.content === message.content,
          );
          if (optIndex !== -1) {
            const newMsgs = [...msgs];
            newMsgs[optIndex] = message;
            return { ...old, data: { ...old.data, messages: newMsgs } };
          }
          if (msgs.find((m: any) => m._id === message._id)) return old; // deduplicate
          return {
            ...old,
            data: { ...old.data, messages: [...msgs, message] },
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    // typing_start
    const onTypingStart = (event: TypingEvent) => {
      if (event.userId === user?.id) return;
      setTypingUsers((prev) => {
        const list = prev[event.conversationId] ?? [];
        if (list.find((u) => u.userId === event.userId)) return prev;
        return {
          ...prev,
          [event.conversationId]: [
            ...list,
            { userId: event.userId, userName: event.userName },
          ],
        };
      });
    };

    // typing_stop
    const onTypingStop = (event: {
      conversationId: string;
      userId: string;
    }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [event.conversationId]: (prev[event.conversationId] ?? []).filter(
          (u) => u.userId !== event.userId,
        ),
      }));
    };

    // message_seen — update readBy in cache
    const onMessageSeen = (event: MessageSeenEvent) => {
      queryClient.setQueryData(
        ["messages", event.conversationId],
        (old: any) => {
          if (!old) return old;
          const msgs: any[] = (old?.data?.messages ?? []).map((m: any) =>
            m._id === event.messageId && !m.readBy.includes(event.seenBy)
              ? { ...m, readBy: [...m.readBy, event.seenBy] }
              : m,
          );
          return { ...old, data: { ...old.data, messages: msgs } };
        },
      );
    };

    socket.on("receive_message", onReceiveMessage);
    socket.on("typing_start", onTypingStart);
    socket.on("typing_stop", onTypingStop);
    socket.on("message_seen", onMessageSeen);

    return () => {
      socket.off("receive_message", onReceiveMessage);
      socket.off("typing_start", onTypingStart);
      socket.off("typing_stop", onTypingStop);
      socket.off("message_seen", onMessageSeen);
    };
  }, [socket, user?.id, queryClient]);

  // Auto-mark messages as read when conversation is opened
  useEffect(() => {
    if (!selectedConversation || !messages.length || !user) return;
    const unread = messages.filter(
      (m: any) =>
        !(m.readBy ?? []).includes(user.id) && param(m.senderId) !== user.id,
    );
    unread.forEach((m: any) => markSeen(m._id, selectedConversation));
  }, [messages, selectedConversation, user, markSeen]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
  };

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (
      !selectedConversation ||
      (!content.trim() && (!files || files.length === 0))
    )
      return;

    // Fast path: optimistic UI for text-only messages
    if ((!files || files.length === 0) && content.trim()) {
      const tmpId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimisticMsg = {
        _id: tmpId,
        conversationId: selectedConversation,
        sender: { _id: user?.id, name: user?.name },
        content,
        attachments: [],
        readBy: [],
        isEdited: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOptimistic: true,
      };

      // Append optimistic message to cache so UI updates instantly
      queryClient.setQueryData(
        ["messages", selectedConversation],
        (old: any) => {
          if (!old)
            return { data: { messages: [optimisticMsg], pagination: {} } };
          const msgs: any[] = old?.data?.messages ?? [];
          return {
            ...old,
            data: { ...old.data, messages: [...msgs, optimisticMsg] },
          };
        },
      );

      // Update conversations list preview immediately
      queryClient.setQueryData(["conversations"], (old: any) => {
        if (!old) return old;
        const convs: any[] = old?.data?.conversations ?? [];
        return {
          ...old,
          data: {
            ...old.data,
            conversations: convs.map((c: any) => {
              const id = c._id ?? c.id;
              if (id === selectedConversation) {
                return {
                  ...c,
                  lastMessage: { content, createdAt: optimisticMsg.createdAt },
                };
              }
              return c;
            }),
          },
        };
      });

      // Send via socket if available, otherwise fallback to REST and replace optimistic on success
      if (isConnected) {
        socketSendMessage(selectedConversation, content, []);
      } else {
        try {
          const res = await sendMessageMutation.mutateAsync({
            content,
            attachments: [],
          });
          const sentMsg = res?.data?.message;
          if (sentMsg) {
            queryClient.setQueryData(
              ["messages", selectedConversation],
              (old: any) => {
                if (!old) return old;
                const msgs: any[] = old?.data?.messages ?? [];
                return {
                  ...old,
                  data: {
                    ...old.data,
                    messages: msgs.map((m: any) =>
                      m._id === tmpId ? sentMsg : m,
                    ),
                  },
                };
              },
            );
          }
        } catch (err) {
          queryClient.setQueryData(
            ["messages", selectedConversation],
            (old: any) => {
              if (!old) return old;
              const msgs: any[] = old?.data?.messages ?? [];
              return {
                ...old,
                data: {
                  ...old.data,
                  messages: msgs.map((m: any) =>
                    m._id === tmpId ? { ...m, isFailed: true } : m,
                  ),
                },
              };
            },
          );
          toast.error("Failed to send message");
        }
      }

      // Stop typing indicator
      stopTyping(selectedConversation);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

      return;
    }

    // Files or other complex messages: upload attachments first
    let attachedData: any[] = [];
    if (files && files.length > 0) {
      try {
        const uploadPromises = files.map((file) =>
          uploadAttachment(selectedConversation, file),
        );
        const results = await Promise.all(uploadPromises);
        attachedData = results.map((res) => ({
          fileUrl: res.data.attachment.fileUrl,
          fileType: res.data.attachment.fileType,
          fileName: res.data.attachment.fileName,
        }));
      } catch (error) {
        console.error("Failed to upload attachments", error);
        return;
      }
    }

    // Prefer socket for real-time delivery; fall back to REST
    if (isConnected) {
      socketSendMessage(selectedConversation, content, attachedData);
    } else {
      sendMessageMutation.mutate({ content, attachments: attachedData });
    }

    // Stop typing indicator
    stopTyping(selectedConversation);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedConversation) return;
    try {
      await deleteMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        messageId,
      });
      toast.success("Message deleted");
    } catch (err) {
      // onError already shows toast; log for debugging
      console.error("handleDeleteMessage error", err);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!conversationId) return;
    try {
      await deleteConversationMutation.mutateAsync(conversationId);
    } catch (err) {
      console.error("handleDeleteConversation error", err);
    }
  };

  const handlePinMessage = (messageId: string) => {
    if (!selectedConversation) return;
    queryClient.setQueryData(["messages", selectedConversation], (old: any) => {
      if (!old) return old;
      const msgs: any[] = (old.data?.messages ?? []).map((m: any) =>
        m._id === messageId ? { ...m, isPinned: !m.isPinned } : m,
      );
      return { ...old, data: { ...old.data, messages: msgs } };
    });
  };

  const handleForwardMessage = (messageId: string) => {
    setForwardingMessageId(messageId);
    setForwardSearchQuery("");
    setForwardTargetUser(null);
  };

  const handleCancelForward = () => {
    setForwardingMessageId(null);
    setForwardSearchQuery("");
    setForwardTargetUser(null);
  };

  const handleConfirmForward = async () => {
    if (!forwardingMessageId || !forwardTargetUser) return;

    const msg = messages.find((m: any) => m._id === forwardingMessageId);
    if (!msg) return;

    try {
      const result = await createDirectConversation(forwardTargetUser._id);
      const conversationId =
        result?.data?.conversation?._id ?? result?.data?.conversation?.id;
      if (!conversationId) throw new Error("Could not open conversation");

      // Normalize forwarded content: strip any leading (Fwd) markers and whitespace,
      // then prepend a single `(Fwd)` header so we don't end up with `(Fwd)(Fwd)`.
      const forwardedPrefix = "(Fwd)";
      let content = "";
      if (msg.content) {
        const stripped = String(msg.content)
          .replace(/^\s*(\(Fwd\)\s*)+/, "")
          .trimStart();
        content = `${forwardedPrefix} ${stripped}`.trim();
      }
      const attachments = (msg.attachments ?? []).map((att: any) => ({
        fileUrl: att.fileUrl || att.url || "",
        fileType: att.fileType || att.type || "",
        fileName: att.fileName || att.name || "Attachment",
      }));

      await apiSendMessage(conversationId, { content, attachments });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setSelectedConversation(conversationId);
      toast.success("Message forwarded");
      handleCancelForward();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          err.message ??
          "Failed to forward message",
      );
      console.error("Failed to forward message", err);
    }
  };

  const handleTyping = () => {
    if (!selectedConversation) return;
    startTyping(selectedConversation);

    // Auto stop after 3 s of inactivity
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      stopTyping(selectedConversation);
    }, 3000);
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  const currentConversation = conversations.find(
    (c: any) => (c._id ?? c.id) === selectedConversation,
  );

  const getConvoName = useCallback(
    (c: any) =>
      c?.name ||
      c?.participants?.find((p: any) => (p._id ?? p) !== user?.id)?.name ||
      "Chat",
    [user?.id],
  );

  const filteredConversations = useMemo(
    () =>
      conversations.filter((c: any) =>
        getConvoName(c)
          .toLowerCase()
          .includes(conversationSearchQuery.toLowerCase()),
      ),
    [conversations, conversationSearchQuery, getConvoName],
  );

  const pinnedConversations = useMemo(
    () => filteredConversations.filter((c: any) => c.isPinned),
    [filteredConversations],
  );

  const unpinnedConversations = useMemo(
    () => filteredConversations.filter((c: any) => !c.isPinned),
    [filteredConversations],
  );

  const currentTypers = (typingUsers[selectedConversation ?? ""] ?? []).map(
    (u) => u.userName,
  );

  const displayMessages = messages.map((m: any) => {
    const senderObj = m.sender ?? m.senderId;
    const senderId = param(senderObj);
    const senderName =
      typeof senderObj === "object" ? senderObj?.name : "Unknown";
    return {
      id: m._id,
      content: m.content,
      attachments: m.attachments,
      isDeleted: !!m.isDeleted,
      isPinned: !!m.isPinned,
      author: { id: senderId, name: senderName },
      timestamp: new Date(m.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdAt: new Date(m.createdAt).toISOString(),
      isOwn: senderId === user?.id,
      status: (m.readBy?.length ?? 0) > 1 ? "read" : "delivered",
    };
  });

  const clearedAt = selectedConversation
    ? clearedConversations[selectedConversation]
    : undefined;
  const visibleMessages = displayMessages.filter(
    (m: any) => !clearedAt || m.createdAt > clearedAt,
  );

  const messagesToShow =
    headerSearchActive && headerSearchQuery.trim()
      ? visibleMessages.filter((m: any) =>
          (m.content ?? "")
            .toLowerCase()
            .includes(headerSearchQuery.toLowerCase()),
        )
      : visibleMessages;

  const mediaItems = messagesToShow.flatMap((message, msgIndex) => {
    if (message.isDeleted) return [];

    const urlRegex = /https?:\/\/[^\s]+/g;
    const links = Array.from(message.content.match(urlRegex) ?? []).map(
      (link, index) => ({
        id: `link-${msgIndex}-${index}`,
        type: "link" as const,
        title: link,
        url: link,
      }),
    );

    const attachments = (message.attachments ?? []).map(
      (att: any, index: number) => {
        const fileUrl = att.fileUrl || att.url || "";
        const url = getServerBaseUrl() + fileUrl;
        const fileType = att.fileType || att.type || "";
        const isImage = fileType.startsWith("image/");
        const isDoc =
          fileType === "application/pdf" ||
          fileType.includes("officedocument") ||
          fileType.includes("msword");
        return {
          id: `att-${msgIndex}-${index}`,
          type: isImage
            ? ("image" as const)
            : isDoc
              ? ("doc" as const)
              : ("file" as const),
          title: att.fileName || att.name || "Attachment",
          url,
        };
      },
    );

    return [...links, ...attachments];
  });

  const isParticipantOnline = (c: any) =>
    c?.participants?.some(
      (p: any) =>
        (p._id ?? p).toString() !== user?.id &&
        onlineUserIds.includes((p._id ?? p).toString()),
    );

  // ── Render ────────────────────────────────────────────────────────────────

  const renderConversationItem = useCallback(
    (conversation: any) => {
      const cId = conversation._id ?? conversation.id;
      const clearedAt = clearedConversations[cId];
      const lastMessage = conversation.lastMessage;
      const hasRecentLastMessage =
        lastMessage?.createdAt &&
        (!clearedAt || new Date(lastMessage.createdAt) > new Date(clearedAt));

      return (
        <ConversationItem
          key={cId}
          id={cId}
          name={getConvoName(conversation)}
          lastMessage={
            hasRecentLastMessage ? lastMessage.content : "No messages yet"
          }
          timestamp={
            hasRecentLastMessage && lastMessage.createdAt
              ? new Date(lastMessage.createdAt).toLocaleDateString()
              : ""
          }
          unreadCount={conversation.unreadCount ?? 0}
          isPinned={!!conversation.isPinned}
          isSelected={selectedConversation === cId}
          status={isParticipantOnline(conversation) ? "online" : "offline"}
          onSelect={handleSelectConversation}
          onPin={() => console.log("pin " + cId)}
          onRemove={() => console.log("remove " + cId)}
        />
      );
    },
    [
      selectedConversation,
      getConvoName,
      isParticipantOnline,
      handleSelectConversation,
      clearedConversations,
    ],
  );

  return (
    <>
      <ChatLayout
        sidebar={
          <Sidebar
            currentUser={{
              id: user?.id ?? "",
              name: user?.name ?? "You",
              status: "online",
            }}
            onNewChat={() => setIsNewChatOpen(true)}
            onSearch={(q: string) => setConversationSearchQuery(q)}
            onSettings={() => console.log("Settings")}
            onLogoClick={() => {
              // Leave any active conversation and clear UI state to "exit" the chat
              if (prevConvoRef.current) {
                leaveConversation(prevConvoRef.current);
              }

              // clear selection and panels
              setSelectedConversation(null);
              setShowInfoPanel(false);

              // reset header/search state
              setHeaderSearchActive(false);
              setHeaderSearchQuery("");
              setShowMoreOptions(false);

              // reset forwarding state
              setForwardingMessageId(null);
              setForwardSearchQuery("");
              setForwardTargetUser(null);

              // reset calls and media states
              setIsCallActive(false);
              setIsVideoCallActive(false);

              // reset conversation list search
              setConversationSearchQuery("");

              // clear timers and refs
              if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
                typingTimerRef.current = null;
              }
              prevConvoRef.current = null;

              // navigate to landing route
              navigate("/");
            }}
            onLogout={() => setIsLogoutModalOpen(true)}
            moreOptions={[
              {
                label: isMuted ? "Unmute notifications" : "Mute notifications",
                onClick: handleToggleMute,
              },
              {
                label: "Clear messages",
                onClick: handleClearMessages,
              },
              {
                label: "Settings",
                onClick: handleOpenSettings,
              },
            ]}
          >
            {pinnedConversations.length > 0 && (
              <div className="px-2 py-3 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground px-2 py-1">
                  PINNED
                </p>
                {pinnedConversations.map(renderConversationItem)}
              </div>
            )}

            {unpinnedConversations.length > 0 && (
              <div className="px-2 py-3 space-y-1">
                {pinnedConversations.length > 0 && (
                  <p className="text-xs font-semibold text-muted-foreground px-2 py-1">
                    ALL MESSAGES
                  </p>
                )}
                {unpinnedConversations.map(renderConversationItem)}
              </div>
            )}
          </Sidebar>
        }
        header={
          selectedConversation ? (
            <div className="relative">
              <ChatHeader
                title={
                  getConvoName(currentConversation) || "Select a conversation"
                }
                status={
                  isParticipantOnline(currentConversation)
                    ? "online"
                    : "offline"
                }
                onCallStart={handleCallStart}
                onVideoStart={handleVideoStart}
                onSearch={handleHeaderSearchToggle}
                searchActive={headerSearchActive}
                searchQuery={headerSearchQuery}
                onSearchChange={handleHeaderSearchChange}
                onSearchClose={() => setHeaderSearchActive(false)}
                onInfo={() => setShowInfoPanel(!showInfoPanel)}
                onMoreOptions={handleMoreOptionsToggle}
                isCallActive={isCallActive}
                onCallEnd={handleCallEnd}
              />

              {showMoreOptions && (
                <div
                  ref={moreOptionsRef}
                  className="absolute top-16 right-6 z-40 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg py-1"
                >
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-800"
                    onClick={handleToggleMute}
                  >
                    {isMuted ? "Unmute notifications" : "Mute notifications"}
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-800"
                    onClick={handleClearMessages}
                  >
                    Clear messages
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-800"
                    onClick={handleOpenSettings}
                  >
                    Settings
                  </button>
                </div>
              )}
            </div>
          ) : null
        }
        content={
          selectedConversation ? (
            <MessagesContainer autoScroll={true}>
              {messagesToShow.map((msg: any, idx: number) => (
                <Message
                  key={msg.id}
                  id={msg.id}
                  content={msg.content}
                  attachments={msg.attachments}
                  author={msg.author}
                  timestamp={msg.timestamp}
                  isOwn={msg.isOwn}
                  status={msg.status}
                  isDeleted={msg.isDeleted}
                  isPinned={msg.isPinned}
                  onDelete={handleDeleteMessage}
                  onPin={handlePinMessage}
                  onForward={handleForwardMessage}
                  showAvatar={
                    !msg.isOwn &&
                    (idx === messagesToShow.length - 1 ||
                      messagesToShow[idx + 1].author.id !== msg.author.id)
                  }
                  showTimestamp={true}
                />
              ))}

              {currentTypers.length > 0 && (
                <TypingIndicator
                  userName={
                    currentTypers.length === 1
                      ? currentTypers[0]
                      : `${currentTypers.slice(0, -1).join(", ")} and ${currentTypers.at(-1)}`
                  }
                />
              )}

              {!headerSearchActive &&
                messagesToShow.length === 0 &&
                clearedAt && (
                  <div className="px-6 py-8 text-center text-sm text-zinc-400">
                    Messages cleared. New messages will appear here.
                  </div>
                )}

              {headerSearchActive && messagesToShow.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-zinc-400">
                  No messages match "{headerSearchQuery}"
                </div>
              )}
            </MessagesContainer>
          ) : (
            <EmptyState
              title="Select a conversation"
              description="Choose a conversation from the list to start messaging"
              icon={<MessageCircle className="w-12 h-12" />}
            />
          )
        }
        input={
          selectedConversation ? (
            <MessageInput
              onSendMessage={handleSendMessage}
              onAttach={(files: FileList) => console.log("Files:", files)}
              onEmojiClick={() => console.log("Emoji")}
              onVoiceStart={() => console.log("Voice")}
              placeholder="Type your message here..."
              onChange={handleTyping}
            />
          ) : null
        }
        infoPanelOpen={showInfoPanel}
        infoPanel={
          currentConversation ? (
            <InfoPanel
              title={getConvoName(currentConversation)}
              description={
                isParticipantOnline(currentConversation)
                  ? "Active now"
                  : "Offline"
              }
              isGroup={!!currentConversation.isGroup}
              members={(currentConversation.participants ?? []).map(
                (p: any) => ({
                  id: p._id ?? p,
                  name: p.name ?? "Unknown",
                  status: onlineUserIds.includes((p._id ?? p).toString())
                    ? "online"
                    : "offline",
                }),
              )}
              mediaItems={mediaItems}
              onClose={() => setShowInfoPanel(false)}
              onMute={handleToggleMute}
              onDelete={() =>
                handleDeleteConversation(
                  currentConversation._id ?? currentConversation.id,
                )
              }
              canDelete={param(currentConversation.createdBy) === user?.id}
              onShare={() => toast("Share contact feature coming soon")}
              isMuted={isMuted}
            />
          ) : null
        }
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          logout();
        }}
      />

      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onConversationCreated={(id) => {
          setIsNewChatOpen(false);
          setSelectedConversation(id);
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }}
      />

      {forwardingMessageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Forward message
                </h2>
                <p className="text-sm text-zinc-400">
                  Select a user to forward this message to
                </p>
              </div>
              <button
                onClick={handleCancelForward}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-full hover:bg-zinc-800"
              >
                ×
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={forwardSearchQuery}
                  onChange={(e) => setForwardSearchQuery(e.target.value)}
                  placeholder="Search users by name or email…"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {forwardTargetUser && (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-600/50 bg-blue-600/10 px-4 py-3 text-sm text-blue-100">
                  <div>
                    <p className="font-medium">{forwardTargetUser.name}</p>
                    <p className="text-xs text-blue-200">
                      {forwardTargetUser.email}
                    </p>
                  </div>
                  <button
                    onClick={() => setForwardTargetUser(null)}
                    className="text-xs text-blue-100 hover:text-white"
                  >
                    Change
                  </button>
                </div>
              )}

              <div className="max-h-72 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950">
                {forwardSearchQuery.trim().length < 1 ? (
                  <p className="p-5 text-sm text-zinc-500">
                    Type to search users.
                  </p>
                ) : isSearchingUsers ? (
                  <p className="p-5 text-sm text-zinc-500">Searching users…</p>
                ) : forwardSearchResults.filter(
                    (u: any) => (u._id ?? u.id) !== user?.id,
                  ).length === 0 ? (
                  <p className="p-5 text-sm text-zinc-500">No users found.</p>
                ) : (
                  forwardSearchResults
                    .filter((u: any) => (u._id ?? u.id) !== user?.id)
                    .map((userItem: any) => {
                      const id = userItem._id ?? userItem.id;
                      const isSelected = forwardTargetUser?._id === id;
                      return (
                        <button
                          key={id}
                          onClick={() =>
                            setForwardTargetUser({
                              _id: id,
                              name: userItem.name ?? "Unknown",
                              email: userItem.email ?? "",
                            })
                          }
                          className={`w-full text-left px-4 py-3 transition-colors ${isSelected ? "bg-blue-600/20 text-white" : "hover:bg-zinc-900 text-zinc-200"}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium truncate">
                                {userItem.name ?? "Unknown"}
                              </p>
                              <p className="text-xs text-zinc-500 truncate">
                                {userItem.email ?? "No email"}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="text-xs text-blue-300">
                                Selected
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-4 border-t border-zinc-800">
              <button
                onClick={handleCancelForward}
                className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmForward}
                disabled={!forwardTargetUser}
                className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Forward
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
