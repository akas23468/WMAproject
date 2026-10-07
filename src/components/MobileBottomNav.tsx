import React from 'react';
import { Home, Plus, Bookmark, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface MobileBottomNavProps {
  showMyReports: boolean;
  onSelectFeed: () => void;
  onOpenReportModal: () => void;
  onToggleMyReports: () => void;
  onOpenAuthModal: () => void;
  user: User | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  showMyReports,
  onSelectFeed,
  onOpenReportModal,
  onToggleMyReports,
  onOpenAuthModal,
  user,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-amber-200/90 shadow-[0_-4px_20px_rgba(245,158,11,0.08)] pb-safe"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {/* Feed Tab */}
        <button
          onClick={onSelectFeed}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all ${
            !showMyReports
              ? 'text-amber-900 font-extrabold scale-105'
              : 'text-slate-500 hover:text-amber-800 font-medium'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${!showMyReports ? 'bg-amber-100 text-amber-900' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Feed</span>
        </button>

        {/* Center Post Notice Action (Big Touch Target) */}
        <button
          onClick={onOpenReportModal}
          className="flex flex-col items-center justify-center -translate-y-3 group focus:outline-hidden"
          aria-label="Post a Notice"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/40 border-2 border-white active:scale-90 transition-transform">
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-black text-amber-950 mt-0.5">Post</span>
        </button>

        {/* My Notices Tab */}
        <button
          onClick={() => {
            if (!user) {
              onOpenAuthModal();
            } else {
              onToggleMyReports();
            }
          }}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all ${
            showMyReports
              ? 'text-amber-900 font-extrabold scale-105'
              : 'text-slate-500 hover:text-amber-800 font-medium'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${showMyReports ? 'bg-amber-100 text-amber-900' : ''}`}>
            <Bookmark className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Notices</span>
        </button>

        {/* Account Tab */}
        <button
          onClick={onOpenAuthModal}
          className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-slate-500 hover:text-amber-800 font-medium transition-all"
        >
          <div className="p-1.5 rounded-xl">
            {user ? (
              <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center uppercase">
                {user.name.charAt(0)}
              </div>
            ) : (
              <UserIcon className="w-5 h-5" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">{user ? 'Account' : 'Sign In'}</span>
        </button>
      </div>
    </nav>
  );
};
