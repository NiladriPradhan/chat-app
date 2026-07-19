import { useState, useEffect, useRef } from 'react';
import { Search, X, Users, User, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchUsers, createDirectConversation, createGroupConversation } from '@/features/chat/api/chat';
import { toast } from 'react-hot-toast';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
}

export function NewChatModal({ isOpen, onClose, onConversationCreated }: NewChatModalProps) {
  const [mode, setMode]               = useState<'direct' | 'group'>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName]     = useState('');
  const [selectedUsers, setSelectedUsers] = useState<{ _id: string; name: string; email: string }[]>([]);
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedUsers([]);
      setGroupName('');
      setMode('direct');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search users (blank query returns all users)
  const { data: searchData, isFetching } = useQuery({
    queryKey: ['users:search', searchQuery],
    queryFn: () => searchUsers(searchQuery),
    enabled: true,
    staleTime: 30_000,
  });

  const searchResults: any[] = searchData?.data?.users ?? searchData?.data ?? [];

  const createDirectMutation = useMutation({
    mutationFn: (userId: string) => createDirectConversation(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      onConversationCreated(data.data.conversation._id);
      onClose();
      toast.success('Conversation opened');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to create conversation'),
  });

  const createGroupMutation = useMutation({
    mutationFn: () =>
      createGroupConversation({
        participantIds: selectedUsers.map((u) => u._id),
        name: groupName.trim(),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      onConversationCreated(data.data.conversation._id);
      onClose();
      toast.success('Group created');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to create group'),
  });

  const toggleUser = (user: any) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user],
    );
  };

  const isSelected = (userId: string) => selectedUsers.some((u) => u._id === userId);

  const handleConfirm = () => {
    if (mode === 'direct') {
      if (selectedUsers.length !== 1) return;
      createDirectMutation.mutate(selectedUsers[0]._id);
    } else {
      if (selectedUsers.length < 2 || !groupName.trim()) return;
      createGroupMutation.mutate();
    }
  };

  const isPending = createDirectMutation.isPending || createGroupMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">New Conversation</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-full hover:bg-zinc-800">
            <X size={18} />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex mx-5 mt-4 rounded-xl bg-zinc-950 border border-zinc-800 p-1 gap-1">
          {(['direct', 'group'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setSelectedUsers([]); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {m === 'direct' ? <User size={15} /> : <Users size={15} />}
              {m === 'direct' ? 'Direct' : 'Group'}
            </button>
          ))}
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* Group name field */}
          {mode === 'group' && (
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name (required)"
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email…"
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isFetching && (
              <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 animate-spin" />
            )}
          </div>

          {/* Selected chips */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((u) => (
                <span key={u._id} className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/20 border border-blue-600/40 rounded-full text-xs text-blue-300">
                  {u.name}
                  <button onClick={() => toggleUser(u)} className="hover:text-white"><X size={11} /></button>
                </span>
              ))}
            </div>
          )}

          {/* Results */}
          <div className="max-h-56 overflow-y-auto rounded-xl divide-y divide-zinc-800">
            {!isFetching && searchResults.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-500">No users found</p>
            )}
            {searchResults.map((u: any) => {
              const selected = isSelected(u._id);
              return (
                <button
                  key={u._id}
                  onClick={() => mode === 'direct' ? setSelectedUsers([u]) : toggleUser(u)}
                  className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-zinc-800 transition-colors text-left ${
                    selected ? 'bg-zinc-800' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {u.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{u.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                  </div>
                  {selected && <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"><X size={10} className="text-white" /></div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              isPending ||
              (mode === 'direct' && selectedUsers.length !== 1) ||
              (mode === 'group' && (selectedUsers.length < 2 || !groupName.trim()))
            }
            className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {mode === 'direct' ? 'Start Chat' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}
