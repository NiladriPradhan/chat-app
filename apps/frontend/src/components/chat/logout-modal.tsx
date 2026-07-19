import { LogOut, X } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-red-500">
              <LogOut size={20} />
              <h3 className="text-lg font-semibold text-zinc-100">Sign Out</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-300 transition-colors rounded-full p-1 hover:bg-zinc-800"
            >
              <X size={18} />
            </button>
          </div>
          
          <p className="text-zinc-400 text-sm mb-6">
            Are you sure you want to sign out of your account? You will need to log back in to access your messages.
          </p>
          
          <div className="flex space-x-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
