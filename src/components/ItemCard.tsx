import React from 'react';
import { MapPin, Calendar, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { Item } from '../types';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const isLost = item.status === 'Lost';
  const isResolved = item.status === 'Resolved';

  const formattedDate = (() => {
    try {
      const d = new Date(item.date);
      return d.toLocaleDateString('en-US', {
        month: 'short',
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
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-amber-200/80 hover:border-amber-400 shadow-xs hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Top Media / Thumbnail */}
      <div className="relative h-48 w-full bg-amber-50/50 overflow-hidden flex items-center justify-center">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-amber-700/60 p-4 text-center">
            <span className="text-4xl mb-1">{getCategoryIcon(item.category)}</span>
            <span className="text-xs font-bold">No image attached</span>
          </div>
        )}

        {/* Status Badge with fresh CampusFind wording */}
        <div className="absolute top-3 left-3">
          {isLost ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500 text-white shadow-md">
              <AlertCircle className="w-3.5 h-3.5" />
              MISSING
            </span>
          ) : isResolved ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-slate-700 text-white shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              REUNITED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-600 text-white shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              SAFEKEPT
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100/95 backdrop-blur-sm text-amber-950 shadow-xs border border-amber-300 flex items-center gap-1">
            <span>{getCategoryIcon(item.category)}</span>
            <span>{item.category}</span>
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-amber-700 transition line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {item.description || 'Details can be verified with finder/owner.'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-amber-100/80 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate font-medium">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Logged on {formattedDate}</span>
          </div>
          {item.contact && (
            <div className="flex items-center gap-1.5 truncate text-slate-800 font-semibold pt-1">
              <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{item.contact}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
