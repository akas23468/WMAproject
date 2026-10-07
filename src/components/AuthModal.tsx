import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDemoStudent = () => {
    onLogin({
      uid: 'student-123',
      name: 'Rahul Verma',
      email: 'student@viva-technology.org',
      token: 'mock-token-student-123',
    });
    onClose();
  };

  const handleDemoAdmin = () => {
    onLogin({
      uid: 'admin-456',
      name: 'Campus Security & Helpdesk',
      email: 'security@viva-technology.org',
      token: 'mock-token-admin-456',
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide your credentials.');
      return;
    }
    const cleanEmail = email.trim();
    const uid = 'user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const displayName = isRegister && name.trim() ? name.trim() : cleanEmail.split('@')[0];

    onLogin({
      uid,
      name: displayName,
      email: cleanEmail,
      token: `mock-token-${uid}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-amber-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between bg-amber-50/60 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {isRegister ? 'Join CampusFind' : 'CampusFind Gate'}
              </h2>
              <p className="text-xs text-amber-900/70 font-medium">Verify identity to manage notices and arrange returns</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-amber-100 text-slate-600 flex items-center justify-center border border-amber-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Switchers */}
        <div className="p-6 pt-4 space-y-4">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
            <p className="text-[11px] font-extrabold text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Instant Access Pass (One-Click)</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoStudent}
                className="py-2 px-2.5 bg-white hover:bg-amber-400 hover:text-slate-950 text-slate-900 rounded-xl text-xs font-bold border border-amber-200 shadow-2xs transition text-center"
              >
                👤 Student (Rahul)
              </button>
              <button
                type="button"
                onClick={handleDemoAdmin}
                className="py-2 px-2.5 bg-white hover:bg-amber-400 hover:text-slate-950 text-slate-900 rounded-xl text-xs font-bold border border-amber-200 shadow-2xs transition text-center"
              >
                🛡️ Security Officer
              </button>
            </div>
          </div>

          <div className="relative text-center my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] text-amber-900/60 font-bold uppercase">
              Or authenticate with institutional ID
            </span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-amber-50/40 border border-amber-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campus Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" />
                <input
                  type="email"
                  required
                  placeholder="e.g. student@viva-technology.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-amber-50/40 border border-amber-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Portal Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-amber-50/40 border border-amber-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-sm shadow-amber-300/50 border border-amber-300 transition"
            >
              {isRegister ? 'Create CampusFind ID' : 'Access Hub'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-amber-900 hover:text-amber-700 font-bold"
            >
              {isRegister ? 'Already registered? Log into Hub' : "New to CampusFind? Create an account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
