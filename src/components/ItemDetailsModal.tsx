import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Phone,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Edit3,
  Trash2,
  CheckSquare,
  ShieldCheck,
} from 'lucide-react';
import { Item, User } from '../types';

interface ItemDetailsModalProps {
  item: Item;
  onClose: () => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onStatusChange: (item: Item, newStatus: 'Lost' | 'Found' | 'Resolved') => void;
  currentUser: User | null;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  currentUser,
}) => {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwner =
    !currentUser ||
    !item.userId ||
    item.userId === currentUser.uid ||
    currentUser.uid === 'admin-456' ||
    currentUser.uid === 'demo-user-123';

  const copyContact = () => {
    navigator.clipboard.writeText(item.contact);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = (() => {
    try {
      return new Date(item.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return item.date;
    }
  })();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Documents':
        return '📄';
      case 'Electronics':
        return '🎧';
      case 'Accessories':
        return '☂️';
      case 'Books':
        return '📚';
      case 'Clothing':
        return '🧥';
      default:
        return '📦';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-amber-200 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-950/80 text-white flex items-center justify-center backdrop-blur-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 w-full bg-amber-50 flex items-center justify-center">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-amber-700/60">
              <span className="text-6xl mb-2">{getCategoryIcon(item.category)}</span>
              <p className="text-sm font-bold">No visual reference uploaded</p>
            </div>
          )}

          {/* Status Overlay */}
          <div className="absolute bottom-4 left-4 flex gap-2 items-center flex-wrap">
            {item.status === 'Lost' ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-500 text-white flex items-center gap-1.5 shadow-md">
                <AlertCircle className="w-3.5 h-3.5" />
                ACTIVE SEARCH • MISSING
              </span>
            ) : item.status === 'Resolved' ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-700 text-white flex items-center gap-1.5 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                VERIFIED & REUNITED
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-600 text-white flex items-center gap-1.5 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                IN SAFEKEEPING • DISCOVERED
              </span>
            )}

            <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950 shadow-md border border-amber-300 flex items-center gap-1">
              <span>{getCategoryIcon(item.category)}</span>
              <span>{item.category}</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                Notice #{item.id.slice(-6)}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">{item.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-amber-800/80">
              <UserIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Logged by {item.userName || 'Campus Resident'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Campus Verified
              </span>
            </div>
          </div>

          {/* Location & Date Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 text-sm">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 mt-0.5 border border-amber-200">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-amber-800/70 font-bold uppercase tracking-wider">Discovery / Sighting Spot</p>
                <p className="font-extrabold text-slate-900">{item.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 mt-0.5 border border-amber-200">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-amber-800/70 font-bold uppercase tracking-wider">Logged Timestamp</p>
                <p className="font-extrabold text-slate-900">{formattedDate}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">Item Clues & Characteristics</h4>
            <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/60 text-sm text-slate-800 leading-relaxed font-medium">
              {item.description || 'No additional notes provided. Cross-check identifying marks directly.'}
            </div>
          </div>

          {/* Direct Claim & Handover Channel */}
          <div className="bg-gradient-to-r from-amber-100/90 via-amber-50 to-yellow-100/80 border border-amber-300 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <p className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">Handover & Verification Channel</p>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 text-amber-700" />
                <span className="text-base font-black text-slate-900">{item.contact}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {item.contact.includes('@') ? (
                <a
                  href={`mailto:${item.contact}?subject=Regarding%20CampusFind%20Item:%20${encodeURIComponent(item.name)}`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-400 shadow-xs transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              ) : (
                <a
                  href={`tel:${item.contact.replace(/[^\d+]/g, '')}`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-400 shadow-xs transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Directly</span>
                </a>
              )}
              <button
                onClick={copyContact}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-amber-50 text-slate-900 border border-amber-300 shadow-xs transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-700" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-amber-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {item.status !== 'Resolved' ? (
                <button
                  onClick={() => onStatusChange(item, 'Resolved')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300 transition"
                >
                  <CheckSquare className="w-4 h-4 text-emerald-700" />
                  <span>Confirm Handover & Mark Reunited</span>
                </button>
              ) : (
                <button
                  onClick={() => onStatusChange(item, 'Lost')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 transition"
                >
                  <span>Re-open Active Search</span>
                </button>
              )}
            </div>

            {isOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(item)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-slate-900 border border-amber-300 transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-800" />
                  <span>Modify Notice</span>
                </button>

                {confirmDelete ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onDelete(item.id)}
                      className="px-3 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white transition"
                    >
                      Confirm Removal
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Withdraw</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
