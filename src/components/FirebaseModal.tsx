import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import type { FirebaseConfigSettings } from '../types/game';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({ isOpen, onClose }) => {
  const {
    firebaseConfig,
    isFirebaseConnected,
    firebaseError,
    updateFirebaseConfig,
  } = useGame();

  const [rawJsonInput, setRawJsonInput] = useState('');
  const [apiKey, setApiKey] = useState(firebaseConfig?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(firebaseConfig?.authDomain || '');
  const [projectId, setProjectId] = useState(firebaseConfig?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(firebaseConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(firebaseConfig?.messagingSenderId || '');
  const [appId, setAppId] = useState(firebaseConfig?.appId || '');

  const [parseError, setParseError] = useState<string | null>(null);
  const [copiedRule, setCopiedRule] = useState(false);

  if (!isOpen) return null;

  const handleParseJson = () => {
    try {
      setParseError(null);
      // clean javascript object format or json
      const cleaned = rawJsonInput
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ')
        .replace(/'/g, '"');
      const parsed = JSON.parse(cleaned);

      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);
      setRawJsonInput('');
    } catch {
      setParseError('Could not parse Firebase config JSON. Please check formatting or fill fields manually.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      alert('API Key and Project ID are required to connect to Firebase Firestore.');
      return;
    }

    const newConfig: FirebaseConfigSettings = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    updateFirebaseConfig(newConfig);
    onClose();
  };

  const handleDisconnect = () => {
    if (confirm('Disconnect Firebase cloud sync and revert to local storage?')) {
      updateFirebaseConfig(null);
      setApiKey('');
      setAuthDomain('');
      setProjectId('');
      setStorageBucket('');
      setMessagingSenderId('');
      setAppId('');
      onClose();
    }
  };

  const firestoreRulesSample = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read, write: if true;
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#110915] border-2 border-gold-600/60 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gold-950 border border-gold-600/40 text-gold-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-cinzel font-bold text-white">
                FIREBASE MULTI-DEVICE SYNC
              </h3>
              <p className="text-xs text-zinc-400">Cloud synchronization between Laptop, Projector & Devices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Current status banner */}
        <div
          className={`p-3.5 rounded-xl border mb-4 flex items-center justify-between ${
            isFirebaseConnected
              ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300'
              : 'bg-zinc-950/80 border-zinc-800 text-zinc-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isFirebaseConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Cloud className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold">
                {isFirebaseConnected
                  ? `Connected to Firestore (${firebaseConfig?.projectId})`
                  : 'Local Mode Active (Real-Time Cross-Tab Sync Enabled)'}
              </div>
              <div className="text-[11px] text-zinc-400">
                {isFirebaseConnected
                  ? 'All changes sync live across any connected device and TV projector.'
                  : 'Multiple tabs on this machine sync instantly via BroadcastChannel.'}
              </div>
            </div>
          </div>

          {isFirebaseConnected && (
            <button
              onClick={handleDisconnect}
              className="p-1.5 text-rose-400 hover:bg-rose-950/50 rounded-lg text-xs"
              title="Disconnect Firebase"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {firebaseError && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/80 border border-rose-600 text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong>Firebase Connection Error:</strong> {firebaseError}
            </div>
          </div>
        )}

        {/* JSON Quick Paste */}
        <div className="mb-4 p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
          <label className="block text-xs font-semibold text-gold-400">
            Quick Setup: Paste firebaseConfig object:
          </label>
          <div className="flex gap-2">
            <textarea
              value={rawJsonInput}
              onChange={(e) => setRawJsonInput(e.target.value)}
              placeholder={`{ apiKey: "...", projectId: "...", ... }`}
              rows={2}
              className="w-full px-2.5 py-1.5 bg-[#0a060c] border border-zinc-700 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-gold-500"
            />
            <button
              type="button"
              onClick={handleParseJson}
              disabled={!rawJsonInput.trim()}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-lg text-xs font-bold text-zinc-200 shrink-0"
            >
              Parse
            </button>
          </div>
          {parseError && <p className="text-[11px] text-rose-400">{parseError}</p>}
        </div>

        {/* Manual Configuration Fields */}
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">API Key *</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-gold-500"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Project ID *</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="halloween-rcmg-app"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-gold-500"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Auth Domain (Optional)</label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="project.firebaseapp.com"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">App ID (Optional)</label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:123456789:web:abcdef"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="mt-4 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-2">
            <div className="font-semibold text-zinc-200 flex items-center justify-between">
              <span>Quick Firebase Setup (2 minutes):</span>
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-gold-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                Firebase Console <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p>
              1. Create a Firebase project & create a <strong>Web App</strong> to copy its config.<br />
              2. In <strong>Firestore Database</strong>, create a database in test mode or paste this rule:
            </p>
            <div className="relative bg-black/80 p-2 rounded border border-zinc-800 font-mono text-[10px] text-emerald-400">
              <pre>{firestoreRulesSample}</pre>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(firestoreRulesSample);
                  setCopiedRule(true);
                  setTimeout(() => setCopiedRule(false), 2000);
                }}
                className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white text-[10px]"
              >
                {copiedRule ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-700"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-gold-400 hover:bg-gold-300 font-cinzel shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              SAVE & CONNECT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
