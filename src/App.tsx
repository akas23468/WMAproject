import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ItemCard } from './components/ItemCard';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { ItemFormModal } from './components/ItemFormModal';
import { AuthModal } from './components/AuthModal';
import { ApiDocsModal } from './components/ApiDocsModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Item, User, CATEGORIES } from './types';
import {
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  getHealthStatus,
} from './services/api';
import {
  Filter,
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle2,
  Package,
  Sparkles,
  Inbox,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Lost' | 'Found' | 'Resolved'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showMyReports, setShowMyReports] = useState(false);

  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('campus_user');
      return saved ? JSON.parse(saved) : {
        uid: 'student-123',
        name: 'Rahul Verma',
        email: 'student@viva-technology.org',
        token: 'mock-token-student-123',
      };
    } catch {
      return null;
    }
  });

  // Modals state
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isApiDocsModalOpen, setIsApiDocsModalOpen] = useState(false);

  // API health
  const [apiHealthy, setApiHealthy] = useState(true);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadItems = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);
      const data = await fetchItems({
        status: selectedStatus === 'All' ? undefined : selectedStatus,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined,
        userId: showMyReports && currentUser ? currentUser.uid : undefined,
      });
      setItems(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to connect to CampusFind feed.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadItems();
    getHealthStatus()
      .then((res) => setApiHealthy(res.success))
      .catch(() => setApiHealthy(false));
  }, [selectedStatus, selectedCategory, showMyReports]);

  // Handle Search typing with debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      loadItems();
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('campus_user', JSON.stringify(user));
    } catch {
      // storage unavailable
    }
    showToast(`Authenticated as ${user.name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowMyReports(false);
    try {
      localStorage.removeItem('campus_user');
    } catch {
      // ignore
    }
    showToast('Signed out of CampusFind');
  };

  const handleCreateItem = async (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await createItem(
      {
        ...itemData,
        userId: currentUser?.uid || 'student-123',
        userName: currentUser?.name || 'Campus Resident',
      },
      currentUser?.token
    );
    showToast(`Notice for "${created.name}" is now live!`);
    loadItems();
  };

  const handleUpdateItem = async (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingItem) return;
    const updated = await updateItem(editingItem.id, itemData, currentUser?.token);
    showToast(`Notice for "${updated.name}" updated!`);
    setEditingItem(null);
    if (selectedItem?.id === editingItem.id) {
      setSelectedItem(updated);
    }
    loadItems();
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id, currentUser?.token);
    showToast('Notice withdrawn successfully.');
    setSelectedItem(null);
    loadItems();
  };

  const handleStatusChange = async (item: Item, newStatus: 'Lost' | 'Found' | 'Resolved') => {
    const updated = await updateItem(item.id, { status: newStatus }, currentUser?.token);
    showToast(
      newStatus === 'Resolved'
        ? `"${item.name}" marked as safely reunited!`
        : `Status adjusted to ${newStatus}`
    );
    setSelectedItem(updated);
    loadItems();
  };

  // Stats calculation with new wording
  const stats = useMemo(() => {
    const total = items.length;
    const missing = items.filter((i) => i.status === 'Lost').length;
    const safekept = items.filter((i) => i.status === 'Found').length;
    const reunited = items.filter((i) => i.status === 'Resolved').length;
    return { total, missing, safekept, reunited };
  }, [items]);

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-amber-300 text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl shadow-xl border border-amber-500/40 flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenApiDocsModal={() => setIsApiDocsModalOpen(true)}
        user={currentUser}
        onLogout={handleLogout}
        showMyReports={showMyReports}
        onToggleMyReports={() => setShowMyReports(!showMyReports)}
        apiHealthy={apiHealthy}
      />

      {/* Main Container with Mobile Bottom Nav Clearance */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-28 sm:pb-8">
        {/* Banner Header (CampusFind Wording & Yellow Theme) */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-3xl text-slate-950 p-6 sm:p-8 shadow-xl shadow-amber-300/30 border border-amber-300">
          <div className="relative z-10 max-w-3xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-950 text-amber-300 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              CampusFind Belongings Network • VIVA Institute
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              {showMyReports
                ? 'Your Active Campus Notices'
                : 'Misplaced an essential? Or spotted someone’s belonging?'}
            </h2>
            <p className="text-sm text-slate-900 font-medium leading-relaxed max-w-2xl">
              {showMyReports
                ? 'Review your published missing alerts, manage discovered items in your care, or confirm handover once reunited.'
                : 'CampusFind bridges the gap between students, faculty, and security across VIVA Institute. Broadcast sightings in seconds, cross-check verified claims, and reclaim your belongings with confidence.'}
            </p>

            {/* Quick Action row */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Post a New Notice</span>
              </button>
              {showMyReports && (
                <button
                  onClick={() => setShowMyReports(false)}
                  className="px-4 py-2.5 bg-white/70 hover:bg-white text-slate-950 font-bold text-xs sm:text-sm rounded-xl border border-amber-300 transition"
                >
                  Explore All Listings
                </button>
              )}
            </div>
          </div>

          {/* Background Decorative Shapes */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-white/30 blur-2xl pointer-events-none" />
          <div className="absolute right-32 top-0 -translate-y-12 w-48 h-48 rounded-full bg-amber-200/50 blur-xl pointer-events-none" />
        </div>

        {/* Quick Metrics Bar with fresh wording */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Active Listings</p>
              <p className="text-2xl font-black text-slate-950 mt-0.5">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Under Search</p>
              <p className="text-2xl font-black text-slate-950 mt-0.5">{stats.missing}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">In Safekeeping</p>
              <p className="text-2xl font-black text-slate-950 mt-0.5">{stats.safekept}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Reunited</p>
              <p className="text-2xl font-black text-slate-950 mt-0.5">{stats.reunited}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Status Tabs with fresh wording */}
            <div className="flex items-center gap-1.5 p-1 bg-amber-50 rounded-xl text-xs font-bold overflow-x-auto border border-amber-200/60">
              {(['All', 'Lost', 'Found', 'Resolved'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    selectedStatus === status
                      ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                      : 'text-amber-950 hover:bg-amber-100/60'
                  }`}
                >
                  {status === 'All'
                    ? 'All Listings'
                    : status === 'Lost'
                    ? '🔴 Searching (Missing)'
                    : status === 'Found'
                    ? '🟢 Safekept (Found)'
                    : '⚪ Reunited'}
                </button>
              ))}
            </div>

            {/* Refresh & Item Count */}
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-amber-900/80 font-bold">
                {items.length} {items.length === 1 ? 'record' : 'records'} logged
              </span>
              <button
                onClick={() => loadItems(true)}
                disabled={refreshing}
                title="Synchronize live CampusFind feed"
                className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-900' : ''}`} />
              </button>
            </div>
          </div>

          {/* Categories Pill Slider */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-amber-800 text-xs font-bold uppercase tracking-wider shrink-0 pr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-600" />
              Classification:
            </span>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap transition font-bold ${
                    active
                      ? 'bg-amber-400 text-slate-950 shadow-2xs border border-amber-500'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Items Grid View */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-amber-900">Synchronizing CampusFind inventory...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-black text-rose-900">Connection Interrupted</h3>
            <p className="text-xs text-rose-700">{error}</p>
            <button
              onClick={() => loadItems()}
              className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition"
            >
              Re-establish Feed
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-amber-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Inbox className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">No matching entries logged</h3>
              <p className="text-xs text-slate-600 mt-1">
                {searchQuery || selectedStatus !== 'All' || selectedCategory !== 'All'
                  ? 'No items matched your current filters. Try expanding your search or clearing criteria.'
                  : 'No active inquiries in this category yet. Be the first to register a notice!'}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              {(searchQuery || selectedStatus !== 'All' || selectedCategory !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatus('All');
                    setSelectedCategory('All');
                  }}
                  className="px-3.5 py-2 text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl transition"
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 text-xs font-black bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl shadow-xs border border-amber-400 transition"
              >
                Post a Notice
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200/80 bg-white py-6 mt-12 text-center text-xs text-amber-900/80">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-medium">
          <p>© {new Date().getFullYear()} CampusFind System • VIVA Institute of Technology • Belongings Discovery Network</p>
          <div className="flex items-center gap-4 text-xs font-semibold text-amber-900">
            <button onClick={() => setIsApiDocsModalOpen(true)} className="hover:text-amber-600 underline">
              Service Specs
            </button>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              CampusFind Real-Time Gateway 0.0.0.0:3000
            </span>
          </div>
        </div>
      </footer>

      {/* Item Details Modal */}
      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={(item) => {
            setSelectedItem(null);
            setEditingItem(item);
          }}
          onDelete={handleDeleteItem}
          onStatusChange={handleStatusChange}
          currentUser={currentUser}
        />
      )}

      {/* Add Report Modal */}
      {isReportModalOpen && (
        <ItemFormModal
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={handleCreateItem}
        />
      )}

      {/* Edit Report Modal */}
      {editingItem && (
        <ItemFormModal
          initialItem={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={handleUpdateItem}
        />
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
        />
      )}

      {/* API Docs Modal */}
      {isApiDocsModalOpen && (
        <ApiDocsModal onClose={() => setIsApiDocsModalOpen(false)} />
      )}

      {/* Touch-Friendly Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        showMyReports={showMyReports}
        onSelectFeed={() => setShowMyReports(false)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onToggleMyReports={() => setShowMyReports(!showMyReports)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        user={currentUser}
      />
    </div>
  );
};
