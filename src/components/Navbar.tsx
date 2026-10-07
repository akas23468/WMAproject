import React from 'react';
import { Search, Plus, User as UserIcon, LogOut, Radio } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenReportModal: () => void;
  onOpenAuthModal: () => void;
  onOpenApiDocsModal: () => void;
  user: User | null;
  onLogout: () => void;
  showMyReports: boolean;
  onToggleMyReports: () => void;
  apiHealthy: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenReportModal,
  onOpenAuthModal,
  onOpenApiDocsModal,
  user,
  onLogout,
  showMyReports,
  onToggleMyReports,
  apiHealthy,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & App Title: Campus Find */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => {
              if (showMyReports) onToggleMyReports();
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-300/40 border border-amber-300">
              <span className="text-xl font-black">⚡</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-slate-900 text-lg leading-tight tracking-tight">
                  Campus<span className="text-amber-500">Find</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                  VIVA Hub
                </span>
              </div>
              <p className="text-[11px] text-amber-900/70 font-semibold hidden sm:block">
                Smart Belongings Discovery & Recovery Network
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600/70" />
              <input
                type="text"
                placeholder="Search lost belongings, lecture rooms, item types..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-amber-50/60 hover:bg-amber-50 focus:bg-white text-sm rounded-xl border border-amber-200/80 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none transition text-slate-900 placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-700 hover:text-amber-900 bg-amber-200/70 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* API Health indicator */}
            <button
              onClick={onOpenApiDocsModal}
              title={apiHealthy ? 'CampusFind Cloud Feed Live' : 'Checking Connectivity'}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-950 hover:bg-amber-100 border border-amber-200 transition"
            >
              <Radio
                className={`w-3 h-3 ${
                  apiHealthy ? 'text-emerald-600 animate-pulse' : 'text-amber-500'
                }`}
              />
              <span>Live Network</span>
            </button>

            {/* My Notices Toggle Button */}
            {user && (
              <button
                onClick={onToggleMyReports}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                  showMyReports
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-200'
                }`}
              >
                {showMyReports ? 'All Listings' : 'My Notices'}
              </button>
            )}

            {/* Post Notice Button */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 active:scale-95 text-slate-950 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black shadow-sm shadow-amber-300/50 border border-amber-300 transition"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Post a Notice</span>
            </button>

            {/* User Profile / Login */}
            {user ? (
              <div className="flex items-center gap-1.5 bg-amber-50/90 py-1 px-2 rounded-xl border border-amber-200">
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs uppercase shadow-2xs">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden xl:block text-left pr-1">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[95px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-amber-800/80 leading-none truncate max-w-[95px]">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign out of CampusFind"
                  className="p-1 hover:bg-amber-200/60 rounded text-amber-800 hover:text-slate-950 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-slate-900 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border border-amber-200 transition"
              >
                <UserIcon className="w-4 h-4 text-amber-700" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600/60" />
            <input
              type="text"
              placeholder="Search lost items, classrooms..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-amber-50/70 text-sm rounded-xl border border-amber-200 focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
