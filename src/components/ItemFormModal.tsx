import React, { useState } from 'react';
import { X, Upload, AlertCircle, Cloud, CheckCircle, Loader2 } from 'lucide-react';
import { Item, CATEGORIES, CAMPUS_LOCATIONS } from '../types';
import { uploadFileToFirebaseStorage } from '../firebase';

interface ItemFormModalProps {
  initialItem?: Item | null;
  onClose: () => void;
  onSubmit: (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const SAMPLE_PHOTO_PRESETS = [
  { label: 'College ID Card', url: 'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=600&auto=format&fit=crop' },
  { label: 'Scientific Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop' },
  { label: 'Black Umbrella', url: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600&auto=format&fit=crop' },
  { label: 'Bluetooth Earbuds', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop' },
  { label: 'Engineering Textbook', url: 'https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=600&auto=format&fit=crop' },
  { label: 'College Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop' },
];

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  initialItem,
  onClose,
  onSubmit,
}) => {
  const isEditing = Boolean(initialItem);

  const [name, setName] = useState(initialItem?.name || '');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [category, setCategory] = useState(initialItem?.category || 'Documents');
  const [status, setStatus] = useState<'Lost' | 'Found' | 'Resolved'>(initialItem?.status || 'Lost');
  const [location, setLocation] = useState(initialItem?.location || '');
  const [date, setDate] = useState(
    initialItem?.date
      ? new Date(initialItem.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [contact, setContact] = useState(initialItem?.contact || '');
  const [imageUrl, setImageUrl] = useState(initialItem?.imageUrl || '');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file is too large (maximum 10MB).');
        return;
      }
      try {
        setUploadingImage(true);
        setUploadStatus('Uploading to Firebase Storage...');
        setError(null);

        // Upload to Firebase Storage bucket
        const downloadUrl = await uploadFileToFirebaseStorage(file);
        setImageUrl(downloadUrl);
        setUploadStatus('Uploaded to Firebase Storage!');
        setTimeout(() => setUploadStatus(null), 3500);
      } catch (err: unknown) {
        console.warn('Firebase Storage upload notice:', err);
        // Fallback to local Data URL preview if storage rules restrict write
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
        setUploadStatus('Image preview loaded locally');
        setTimeout(() => setUploadStatus(null), 3500);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an item headline.');
      return;
    }
    if (!location.trim()) {
      setError('Please state the campus landmark.');
      return;
    }
    if (!contact.trim()) {
      setError('Please provide your reach-out phone or campus email.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        category,
        status,
        location: location.trim(),
        date: new Date(date).toISOString(),
        contact: contact.trim(),
        imageUrl: imageUrl.trim(),
        userId: initialItem?.userId || 'student-123',
        userName: initialItem?.userName,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to publish notice.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-amber-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {isEditing ? 'Update CampusFind Notice' : 'Lodge a CampusFind Notice'}
            </h2>
            <p className="text-xs text-amber-900/70 font-medium">
              {isEditing ? 'Revise details to speed up identification' : 'Broadcast misplaced belongings or register items found on campus'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-amber-100 text-slate-700 flex items-center justify-center border border-amber-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Switcher (Lost / Found / Resolved) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Notice Classification *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('Lost')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black border transition ${
                  status === 'Lost'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                    : 'bg-amber-50/50 text-slate-700 border-amber-200 hover:bg-amber-100/50'
                }`}
              >
                🔴 SEARCHING (LOST)
              </button>
              <button
                type="button"
                onClick={() => setStatus('Found')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black border transition ${
                  status === 'Found'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-amber-50/50 text-slate-700 border-amber-200 hover:bg-amber-100/50'
                }`}
              >
                🟢 SAFEKEPT (FOUND)
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setStatus('Resolved')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black border transition ${
                    status === 'Resolved'
                      ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                      : 'bg-amber-50/50 text-slate-700 border-amber-200 hover:bg-amber-100/50'
                  }`}
                >
                  ⚪ REUNITED
                </button>
              )}
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Item Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. College ID Card, Scientific Calculator, Black Umbrella"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-3 sm:py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-base sm:text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Classification *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-sm focus:bg-white focus:border-amber-500 outline-none font-medium"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Approximate Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-sm focus:bg-white focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Campus Location */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Landmark / Classroom *
              </label>
              <span className="text-[10px] text-amber-700 font-semibold">Tap campus hotspot:</span>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. VIVA Institute Main Gate, Room 204, Library Stand"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
            />
            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {CAMPUS_LOCATIONS.map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 transition font-medium"
                >
                  + {loc.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Reach-out Phone / Email *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. security@viva-technology.org or +91 9876543210"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
            />
          </div>

          {/* Image Upload or URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Visual Reference (Firebase Storage)
              </label>
              <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                <Cloud className="w-3 h-3 text-amber-700" />
                <span>Firebase Storage Bucket</span>
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Firebase Storage URL or image link (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-amber-50/40 border border-amber-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 outline-none truncate"
                />
                <label className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 shrink-0 transition ${
                  uploadingImage
                    ? 'bg-amber-200 text-amber-900 border-amber-400 cursor-wait'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                }`}>
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-800" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadStatus && (
                <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{uploadStatus}</span>
                </div>
              )}

              {/* Sample Photo Quick Select */}
              <div className="pt-1">
                <p className="text-[11px] text-amber-900/70 font-semibold mb-1">Quick Sample References:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_PHOTO_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setImageUrl(p.url)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                        imageUrl === p.url
                          ? 'bg-amber-400 text-slate-950 border-amber-500'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Thumbnail */}
              {imageUrl && (
                <div className="relative h-28 rounded-xl overflow-hidden border border-amber-300 bg-amber-50 flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setError('Invalid image URL')}
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Distinctive Features & Verification Notes
            </label>
            <textarea
              rows={3}
              placeholder="State identifying marks, color, model, or stickers to help confirm genuine ownership..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none resize-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-amber-200/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 shadow-sm shadow-amber-300/60 border border-amber-300 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />}
              <span>{isEditing ? 'Commit Updates' : 'Publish Notice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
