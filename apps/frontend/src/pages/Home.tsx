import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageCircle, LogOut, Settings } from 'lucide-react';
import { Avatar } from '@/components/chat/avatar';

export default function Home() {
  const navigate = useNavigate();  // use to navigate page
  const { user, logout } = useAuth();

  const handleStartChat = () => {
    navigate('/chat');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-[#0F0F10]">
      {/* Sidebar */}
      <div className="w-64 flex flex-col border-r border-[#2C2C2C] bg-[#171717] p-4 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-white cursor-pointer select-none">ChatApp</h1>
          <p className="text-xs text-[#A1A1AA] mt-1">Welcome back</p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <MessageCircle className="w-16 h-16 text-[#3B82F6] opacity-20" />
        </div>

        {user && (
          <div className="border-t border-[#2C2C2C] pt-4 space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-3xl bg-[#1E1E1E] border border-[#2C2C2C]">
              <Avatar
                alt={user.name}
                name={user.name}
                src={user.avatar}
                status="online"
                showStatus={true}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white truncate">{user.name}</p>
                <p className="text-xs text-[#A1A1AA]">Active</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => console.log('Settings')}
                className="bg-[#1A1A1A] text-[#A1A1AA] hover:bg-[#252525] flex-1"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="bg-[#1A1A1A] text-[#A1A1AA] hover:bg-[#252525] flex-1"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
        <div className="text-center space-y-4">
          <MessageCircle className="w-24 h-24 text-[#3B82F6] mx-auto" />
          <div>
            <h2 className="text-3xl font-bold text-white">Welcome to ChatApp</h2>
            <p className="text-[#A1A1AA] mt-2">Connect and chat with your friends in real-time</p>
          </div>
        </div>

        <Button
          onClick={handleStartChat}
          className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8 py-3 text-lg rounded-2xl font-semibold"
        >
          Start Chatting
        </Button>
      </div>
    </div>
  );
}
