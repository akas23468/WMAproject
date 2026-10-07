import React, { useState } from 'react';
import { X, Server, Play, RefreshCw, Cpu } from 'lucide-react';
import { getHealthStatus } from '../services/api';
import { firebaseConfig, isFirebaseConfigured } from '../firebase';

interface ApiDocsModalProps {
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ onClose }) => {
  const [healthResult, setHealthResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testHealthCheck = async () => {
    try {
      setLoading(true);
      const res = await getHealthStatus();
      setHealthResult(JSON.stringify(res, null, 2));
    } catch (err: unknown) {
      setHealthResult(JSON.stringify({ error: err instanceof Error ? err.message : 'Error' }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-bold shadow-2xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">CampusFind Core Services</h2>
              <p className="text-xs text-amber-900/70 font-medium">Distributed REST API & Real-Time Query System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-amber-100 text-slate-600 flex items-center justify-center border border-amber-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-sm">
          {/* Live Ping Box */}
          <div className="bg-slate-950 text-slate-100 p-4 rounded-2xl border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                GET /api/health
              </span>
              <button
                onClick={testHealthCheck}
                disabled={loading}
                className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition"
              >
                {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                <span>Inspect Feed Latency</span>
              </button>
            </div>
            {healthResult ? (
              <pre className="text-xs font-mono text-amber-300 bg-slate-900 p-2.5 rounded-lg overflow-x-auto border border-amber-950">
                {healthResult}
              </pre>
            ) : (
              <p className="text-xs text-slate-400">Click &quot;Inspect Feed Latency&quot; to ping the live CampusFind engine.</p>
            )}
          </div>

          {/* Firebase Cloud Storage Card */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                {isFirebaseConfigured ? 'Firebase Cloud Connected' : 'Firebase Ready (.env config)'}
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                v10.x SDK
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-700 pt-1">
              <div className="bg-white p-2 rounded-lg border border-amber-200/80">
                <span className="text-[10px] text-slate-400 block font-sans">Storage Bucket:</span>
                <span className="font-bold text-amber-900 break-all">{firebaseConfig.storageBucket || 'Configured via .env'}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-amber-200/80">
                <span className="text-[10px] text-slate-400 block font-sans">Project ID:</span>
                <span className="font-bold text-amber-900">{firebaseConfig.projectId || 'Configured via .env'}</span>
              </div>
            </div>
          </div>

          {/* Endpoints Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">Documented Service Endpoints</h3>
            
            <div className="border border-amber-200 rounded-2xl divide-y divide-amber-100 overflow-hidden text-xs">
              <div className="p-3 flex items-center justify-between bg-amber-50/40">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-200 text-amber-900">GET</span>
                  <span className="font-mono font-bold text-slate-900">/api/items</span>
                </div>
                <span className="text-slate-600 font-medium">Filter by classification, status, query string</span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-200 text-amber-900">GET</span>
                  <span className="font-mono font-bold text-slate-900">/api/items/:id</span>
                </div>
                <span className="text-slate-600 font-medium">Retrieve verified record by unique token</span>
              </div>

              <div className="p-3 flex items-center justify-between bg-amber-50/40">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-200 text-emerald-900">POST</span>
                  <span className="font-mono font-bold text-slate-900">/api/items</span>
                </div>
                <span className="text-slate-600 font-medium">Publish notice with authenticated bearer header</span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-yellow-200 text-yellow-900">PUT</span>
                  <span className="font-mono font-bold text-slate-900">/api/items/:id</span>
                </div>
                <span className="text-slate-600 font-medium">Update details or mark item as successfully returned</span>
              </div>

              <div className="p-3 flex items-center justify-between bg-amber-50/40">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-rose-200 text-rose-900">DELETE</span>
                  <span className="font-mono font-bold text-slate-900">/api/items/:id</span>
                </div>
                <span className="text-slate-600 font-medium">Revoke notice entry from system</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
