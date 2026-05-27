'use client';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, Save, Clock, Wifi, WifiOff, MessageSquare,
  StickyNote, LayoutTemplate, Sparkles, Download, Camera, X, ChevronDown,
  Trash2, RotateCcw, Timer,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getGroup, getWhiteboard, saveWhiteboard, getSnapshots, saveSnapshot, deleteSnapshot, restoreSnapshot } from '../../../../../lib/api/groups';
import { generateDiagram } from '../../../../../lib/api/ai';
import { Avatar } from '../../../../../components/ui/avatar';
import { useThemeStore } from '../../../../../lib/store/themeStore';
import { usePomodoroStore } from '../../../../../lib/store/pomodoroStore';
import type { WhiteboardCanvasHandle } from '../../../../../components/shared/WhiteboardCanvas';

const WhiteboardCanvas = dynamic(
  () => import('../../../../../components/shared/WhiteboardCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-sm">Loading whiteboard…</p>
        </div>
      </div>
    ),
  }
);

// ─── Excalidraw element helpers ──────────────────────────────────────────────
let _uid = 0;
function uid() { return `wb_${Date.now()}_${++_uid}_${Math.random().toString(36).slice(2, 5)}`; }
function nonce() { return Math.floor(Math.random() * 1e9); }

function base(type: string, x: number, y: number, w: number, h: number, extra: Record<string, unknown> = {}) {
  return {
    id: uid(), type, x, y, width: w, height: h, angle: 0,
    strokeColor: '#6366f1', backgroundColor: 'transparent', fillStyle: 'solid',
    strokeWidth: 1.5, strokeStyle: 'solid', roughness: 1, opacity: 100,
    roundness: { type: 3 }, version: 1, versionNonce: nonce(),
    isDeleted: false, groupIds: [], frameId: null, boundElements: null,
    updated: Date.now(), link: null, locked: false, ...extra,
  };
}
function textEl(x: number, y: number, w: number, h: number, text: string, extra: Record<string, unknown> = {}) {
  return { ...base('text', x, y, w, h, extra), text, originalText: text, fontSize: 14, fontFamily: 1, textAlign: 'center', verticalAlign: 'middle', containerId: null, lineHeight: 1.25, strokeColor: '#1e1e1e' };
}
function rectEl(x: number, y: number, w: number, h: number, extra: Record<string, unknown> = {}) {
  return base('rectangle', x, y, w, h, extra);
}
function ellipseEl(x: number, y: number, w: number, h: number, extra: Record<string, unknown> = {}) {
  return base('ellipse', x, y, w, h, extra);
}
function arrowEl(x: number, y: number, dx: number, dy: number) {
  return base('arrow', x, y, Math.abs(dx), Math.abs(dy), {
    points: [[0, 0], [dx, dy]], startBinding: null, endBinding: null,
    startArrowhead: null, endArrowhead: 'arrow', lastCommittedPoint: null, strokeColor: '#9ca3af',
  });
}

// ─── Templates ───────────────────────────────────────────────────────────────
const TEMPLATES: Record<string, { label: string; icon: string; build: () => unknown[] }> = {
  mindmap: {
    label: 'Mind Map', icon: '🧠',
    build() {
      const cx = 300; const cy = 240;
      const branches = [
        { label: 'Branch 1', dx: -220, dy: -120 },
        { label: 'Branch 2', dx: 220, dy: -120 },
        { label: 'Branch 3', dx: -220, dy: 120 },
        { label: 'Branch 4', dx: 220, dy: 120 },
      ];
      return [
        rectEl(cx - 60, cy - 22, 120, 44, { backgroundColor: '#ede9fe', strokeColor: '#6366f1', fillStyle: 'solid' }),
        textEl(cx - 60, cy - 22, 120, 44, 'Main Topic', { strokeColor: '#4338ca', fontSize: 15 }),
        ...branches.flatMap(b => [
          arrowEl(cx + (b.dx > 0 ? 60 : 0), cy, b.dx > 0 ? b.dx - 100 : b.dx + 100, b.dy),
          rectEl(cx + b.dx - 50, cy + b.dy - 18, 100, 36, { strokeColor: '#8b5cf6', roundness: { type: 3 } }),
          textEl(cx + b.dx - 50, cy + b.dy - 18, 100, 36, b.label, { fontSize: 13, strokeColor: '#4c1d95' }),
        ]),
      ];
    },
  },
  cornell: {
    label: 'Cornell Notes', icon: '📓',
    build() {
      return [
        rectEl(20, 20, 760, 540, { strokeColor: '#374151', strokeWidth: 1 }),
        textEl(20, 20, 760, 40, 'Title / Topic', { fontSize: 18, strokeColor: '#111827', verticalAlign: 'middle' }),
        rectEl(20, 60, 200, 460, { strokeColor: '#9ca3af', strokeWidth: 1, strokeStyle: 'dashed' }),
        textEl(25, 60, 190, 24, 'Cues / Keywords', { fontSize: 11, strokeColor: '#6b7280', textAlign: 'left' }),
        rectEl(220, 60, 560, 460, { strokeColor: 'transparent' }),
        textEl(225, 60, 550, 24, 'Notes Area', { fontSize: 11, strokeColor: '#6b7280', textAlign: 'left' }),
        rectEl(20, 520, 760, 40, { strokeColor: '#9ca3af', strokeWidth: 1, strokeStyle: 'dashed', backgroundColor: '#f9fafb', fillStyle: 'solid' }),
        textEl(20, 520, 760, 40, 'Summary', { fontSize: 11, strokeColor: '#6b7280' }),
      ];
    },
  },
  kanban: {
    label: 'Kanban', icon: '📋',
    build() {
      const cols = [
        { label: 'To Do', x: 20, color: '#fef3c7', stroke: '#f59e0b' },
        { label: 'In Progress', x: 280, color: '#dbeafe', stroke: '#3b82f6' },
        { label: 'Done', x: 540, color: '#d1fae5', stroke: '#10b981' },
      ];
      return cols.flatMap(c => [
        rectEl(c.x, 20, 220, 520, { backgroundColor: '#f9fafb', strokeColor: '#e5e7eb', fillStyle: 'solid', roundness: { type: 3 } }),
        rectEl(c.x, 20, 220, 44, { backgroundColor: c.color, strokeColor: c.stroke, fillStyle: 'solid', roundness: { type: 3 } }),
        textEl(c.x, 20, 220, 44, c.label, { fontSize: 14, strokeColor: '#111827' }),
      ]);
    },
  },
  venn: {
    label: 'Venn Diagram', icon: '⭕',
    build() {
      return [
        ellipseEl(80, 100, 320, 280, { backgroundColor: '#ede9fe', strokeColor: '#6366f1', fillStyle: 'solid', opacity: 60 }),
        ellipseEl(240, 100, 320, 280, { backgroundColor: '#dbeafe', strokeColor: '#3b82f6', fillStyle: 'solid', opacity: 60 }),
        textEl(100, 220, 140, 30, 'Set A', { fontSize: 14, strokeColor: '#4338ca' }),
        textEl(400, 220, 140, 30, 'Set B', { fontSize: 14, strokeColor: '#1d4ed8' }),
        textEl(240, 220, 120, 30, 'Both', { fontSize: 13, strokeColor: '#374151' }),
        textEl(0, 20, 640, 30, 'Venn Diagram', { fontSize: 18, strokeColor: '#111827', textAlign: 'center' }),
      ];
    },
  },
};

// ─── Mind-map layout from AI nodes ───────────────────────────────────────────
function buildMindMapFromNodes(nodes: { id: string; label: string; parent: string | null }[]) {
  const root = nodes.find(n => !n.parent);
  if (!root) return [];
  const children = (id: string) => nodes.filter(n => n.parent === id);
  const cx = 400; const cy = 300;
  const elements: unknown[] = [];
  const rootChildren = children(root.id);
  const angleStep = (2 * Math.PI) / Math.max(rootChildren.length, 1);

  elements.push(rectEl(cx - 70, cy - 24, 140, 48, { backgroundColor: '#ede9fe', strokeColor: '#6366f1', fillStyle: 'solid' }));
  elements.push(textEl(cx - 70, cy - 24, 140, 48, root.label, { strokeColor: '#4338ca', fontSize: 14 }));

  rootChildren.forEach((child, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = 200;
    const bx = cx + r * Math.cos(angle); const by = cy + r * Math.sin(angle);
    elements.push(arrowEl(cx + 70 * Math.cos(angle), cy + 24 * Math.sin(angle), bx - cx - 70 * Math.cos(angle) - 50 * Math.cos(angle), by - cy - 24 * Math.sin(angle)));
    elements.push(rectEl(bx - 55, by - 18, 110, 36, { strokeColor: '#8b5cf6', roundness: { type: 3 } }));
    elements.push(textEl(bx - 55, by - 18, 110, 36, child.label, { fontSize: 12, strokeColor: '#4c1d95' }));

    const grandChildren = children(child.id);
    grandChildren.forEach((gc, j) => {
      const subAngle = angle + (j - (grandChildren.length - 1) / 2) * 0.5;
      const gr = 350;
      const gx = cx + gr * Math.cos(subAngle); const gy = cy + gr * Math.sin(subAngle);
      elements.push(arrowEl(bx + 55 * Math.cos(subAngle), by + 18 * Math.sin(subAngle), gx - bx - 55 * Math.cos(subAngle) - 45 * Math.cos(subAngle), gy - by - 18 * Math.sin(subAngle)));
      elements.push(rectEl(gx - 45, gy - 14, 90, 28, { strokeColor: '#a78bfa', strokeWidth: 1 }));
      elements.push(textEl(gx - 45, gy - 14, 90, 28, gc.label, { fontSize: 11, strokeColor: '#5b21b6' }));
    });
  });
  return elements;
}

function timeAgo(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}
function fmt(s: number) { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }

export default function WhiteboardPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const id = Number(groupId);
  const { theme } = useThemeStore();
  const pomodoro = usePomodoroStore();
  const canvasRef = useRef<WhiteboardCanvasHandle>(null);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [remoteState, setRemoteState] = useState<Record<string, unknown>>({});
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [lastEditor, setLastEditor] = useState<{ id: number; name: string } | null>(null);
  const [online, setOnline] = useState(true);
  const [activeViewers, setActiveViewers] = useState<{ id: number; name: string }[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastRemoteAt = useRef<string>('');

  // Panels
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [snapName, setSnapName] = useState('');
  const [snapSaving, setSnapSaving] = useState(false);
  const [snapshots, setSnapshots] = useState<{ id: number; name: string; created_at: string; created_by: string }[]>([]);

  const { data: group } = useQuery({ queryKey: ['group', id], queryFn: () => getGroup(id) });

  const refreshSnapshots = useCallback(async () => {
    try { setSnapshots(await getSnapshots(id)); } catch {}
  }, [id]);

  // Initial load
  useEffect(() => {
    getWhiteboard(id)
      .then(data => {
        if (data.state && Object.keys(data.state).length > 0) setRemoteState(data.state);
        setLastUpdated(data.updated_at);
        setLastEditor(data.updated_by);
        setActiveViewers(data.active_viewers ?? []);
        lastRemoteAt.current = data.updated_at;
        setOnline(true);
      })
      .catch(() => setOnline(false));
    refreshSnapshots();
  }, [id, refreshSnapshots]);

  // Poll every 5s
  useEffect(() => {
    pollRef.current = setInterval(() => {
      getWhiteboard(id)
        .then(data => {
          setOnline(true);
          setActiveViewers(data.active_viewers ?? []);
          if (data.updated_at !== lastRemoteAt.current) {
            lastRemoteAt.current = data.updated_at;
            setLastUpdated(data.updated_at);
            setLastEditor(data.updated_by);
            if (data.state && Object.keys(data.state).length > 0) setRemoteState({ ...data.state });
          }
        })
        .catch(() => setOnline(false));
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [id]);

  const handleSave = useCallback(async (state: Record<string, unknown>) => {
    setSaveStatus('saving');
    try {
      const result = await saveWhiteboard(id, state);
      lastRemoteAt.current = result.updated_at;
      setLastUpdated(result.updated_at);
      setSaveStatus('saved');
      setOnline(true);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setOnline(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [id]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const addSticky = () => {
    const el = rectEl(80, 80, 160, 120, { backgroundColor: '#fef08a', strokeColor: '#ca8a04', fillStyle: 'solid', roughness: 0, roundness: null });
    const txt = textEl(84, 84, 152, 112, 'Note…', { strokeColor: '#92400e', fontSize: 14, textAlign: 'left', verticalAlign: 'top' });
    canvasRef.current?.addElements([el, txt]);
    toast.success('Sticky note added');
  };

  const applyTemplate = (key: string) => {
    canvasRef.current?.addElements(TEMPLATES[key].build());
    setShowTemplates(false);
    toast.success(`${TEMPLATES[key].label} template added`);
  };

  const handleAIDiagram = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const result = await generateDiagram(aiPrompt);
      const elements = buildMindMapFromNodes(result.nodes ?? []);
      canvasRef.current?.addElements(elements);
      setShowAI(false);
      setAiPrompt('');
      toast.success('Diagram added to whiteboard');
    } catch {
      toast.error('Failed to generate diagram');
    } finally {
      setAiLoading(false);
    }
  };

  const handleExport = () => canvasRef.current?.exportPng();

  const handleSaveSnapshot = async () => {
    if (!snapName.trim()) return;
    setSnapSaving(true);
    try {
      const currentState = remoteState;
      await saveSnapshot(id, snapName.trim(), currentState);
      setSnapName('');
      await refreshSnapshots();
      toast.success('Snapshot saved');
    } catch {
      toast.error('Failed to save snapshot');
    } finally {
      setSnapSaving(false);
    }
  };

  const handleRestoreSnapshot = async (snapId: number) => {
    try {
      const data = await restoreSnapshot(id, snapId);
      setRemoteState({ ...data.state });
      lastRemoteAt.current = data.updated_at;
      setLastUpdated(data.updated_at);
      setShowSnapshots(false);
      toast.success('Snapshot restored');
    } catch {
      toast.error('Failed to restore snapshot');
    }
  };

  const handleDeleteSnapshot = async (snapId: number) => {
    try {
      await deleteSnapshot(id, snapId);
      await refreshSnapshots();
      toast.success('Snapshot deleted');
    } catch {
      toast.error('Failed to delete snapshot');
    }
  };

  const closeAll = () => { setShowTemplates(false); setShowSnapshots(false); setShowAI(false); };

  return (
    <div className="flex flex-col overflow-hidden h-[calc(100dvh-48px)]" onClick={closeAll}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 h-11 flex items-center gap-2 px-3 border-b border-surface-border bg-surface z-20" onClick={e => e.stopPropagation()}>
        <Link href={`/groups/${id}`} className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors text-sm flex-shrink-0">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{group?.name ?? 'Group'}</span>
        </Link>
        <div className="w-px h-4 bg-surface-border mx-1" />
        <span className="text-sm font-semibold text-text-primary flex-shrink-0">Whiteboard</span>

        {/* Active viewers */}
        {activeViewers.length > 0 && (
          <div className="flex items-center -space-x-1.5 ml-1">
            {activeViewers.slice(0, 4).map(v => (
              <Avatar key={v.id} name={v.name} size="xs" className="ring-1 ring-surface" />
            ))}
            {activeViewers.length > 4 && (
              <span className="text-[10px] text-text-muted pl-2">+{activeViewers.length - 4}</span>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-xs text-text-muted">
            {online ? <Wifi className="w-3 h-3 text-brand" /> : <WifiOff className="w-3 h-3 text-rose-400" />}
          </span>
          <span className={`flex items-center gap-1 text-xs transition-colors ${saveStatus === 'saving' ? 'text-amber-400' : saveStatus === 'saved' ? 'text-brand' : saveStatus === 'error' ? 'text-rose-400' : 'text-text-muted'}`}>
            <Save className="w-3 h-3" />
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Error' : 'Auto-save'}
          </span>
          {lastUpdated && (
            <span className="hidden md:flex items-center gap-1 text-xs text-text-muted">
              <Clock className="w-3 h-3" />
              {lastEditor ? `${lastEditor.name}, ` : ''}{timeAgo(lastUpdated)}
            </span>
          )}
          {group && (
            <span className="flex items-center gap-1 text-xs text-text-muted border border-surface-border rounded px-1.5 py-0.5">
              <Users className="w-3 h-3" />
              {group.member_count}
            </span>
          )}
          <Link href={`/groups/${id}/chat`} className="w-7 h-7 rounded flex items-center justify-center text-text-muted hover:bg-surface-elevated hover:text-text-secondary transition-colors" title="Open chat">
            <MessageSquare className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Action toolbar ────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 h-9 flex items-center gap-1 px-3 border-b border-surface-border bg-surface/80 z-10" onClick={e => e.stopPropagation()}>
        {/* Sticky note */}
        <button type="button" onClick={addSticky} title="Add sticky note"
          className="flex items-center gap-1.5 h-7 px-2.5 rounded text-xs text-text-muted hover:bg-surface-elevated hover:text-text-primary transition-colors">
          <StickyNote className="w-3.5 h-3.5" /> Sticky
        </button>

        <div className="w-px h-4 bg-surface-border mx-0.5" />

        {/* Templates */}
        <div className="relative">
          <button type="button" onClick={e => { e.stopPropagation(); setShowTemplates(v => !v); setShowSnapshots(false); setShowAI(false); }}
            className={`flex items-center gap-1.5 h-7 px-2.5 rounded text-xs transition-colors ${showTemplates ? 'bg-brand/10 text-brand' : 'text-text-muted hover:bg-surface-elevated hover:text-text-primary'}`}>
            <LayoutTemplate className="w-3.5 h-3.5" /> Templates <ChevronDown className="w-3 h-3" />
          </button>
          <AnimatePresence>
            {showTemplates && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 mt-1 bg-surface-card border border-surface-border rounded-md shadow-card z-50 p-1 min-w-[160px]"
                onClick={e => e.stopPropagation()}>
                {Object.entries(TEMPLATES).map(([key, tmpl]) => (
                  <button key={key} type="button" onClick={() => applyTemplate(key)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors text-left">
                    <span>{tmpl.icon}</span> {tmpl.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-4 bg-surface-border mx-0.5" />

        {/* AI diagram */}
        <button type="button" onClick={e => { e.stopPropagation(); setShowAI(v => !v); setShowTemplates(false); setShowSnapshots(false); }}
          className={`flex items-center gap-1.5 h-7 px-2.5 rounded text-xs transition-colors ${showAI ? 'bg-violet-500/10 text-violet-400' : 'text-text-muted hover:bg-surface-elevated hover:text-text-primary'}`}>
          <Sparkles className="w-3.5 h-3.5" /> AI Diagram
        </button>

        <div className="w-px h-4 bg-surface-border mx-0.5" />

        {/* Export */}
        <button type="button" onClick={handleExport} title="Export as PNG"
          className="flex items-center gap-1.5 h-7 px-2.5 rounded text-xs text-text-muted hover:bg-surface-elevated hover:text-text-primary transition-colors">
          <Download className="w-3.5 h-3.5" /> Export
        </button>

        <div className="w-px h-4 bg-surface-border mx-0.5" />

        {/* Snapshots */}
        <button type="button" onClick={e => { e.stopPropagation(); setShowSnapshots(v => !v); setShowTemplates(false); setShowAI(false); }}
          className={`flex items-center gap-1.5 h-7 px-2.5 rounded text-xs transition-colors ${showSnapshots ? 'bg-brand/10 text-brand' : 'text-text-muted hover:bg-surface-elevated hover:text-text-primary'}`}>
          <Camera className="w-3.5 h-3.5" /> Snapshots
        </button>

        <div className="ml-auto flex items-center gap-1 text-xs text-brand/70">
          <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          <span className="hidden sm:inline">Syncs every 5s</span>
        </div>
      </div>

      {/* ── Canvas area (relative for overlays) ───────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        <WhiteboardCanvas
          ref={canvasRef}
          initialState={remoteState}
          onSave={handleSave}
          theme={theme === 'dark' ? 'dark' : 'light'}
        />

        {/* ── AI Diagram panel ────────────────────────────────────────────── */}
        <AnimatePresence>
          {showAI && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 w-full max-w-sm bg-surface-card border border-surface-border rounded-md shadow-card z-40 p-4"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-text-primary flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet-400" /> AI Diagram</span>
                <button type="button" title="Close" onClick={() => setShowAI(false)} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-text-muted mb-2">Describe a topic and AI will generate a mind map on the board.</p>
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAIDiagram(); }}
                placeholder="e.g. The water cycle, Recursion in CS, Photosynthesis…"
                rows={3}
                className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 resize-none"
              />
              <button type="button" onClick={handleAIDiagram} disabled={aiLoading || !aiPrompt.trim()}
                className="mt-2 w-full h-8 rounded bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {aiLoading ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</> : <><Sparkles className="w-3.5 h-3.5" /> Generate</>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Snapshot panel ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {showSnapshots && (
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
              className="absolute top-0 right-0 h-full w-72 bg-surface-card border-l border-surface-border shadow-card z-40 flex flex-col"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border flex-shrink-0">
                <span className="text-sm font-semibold text-text-primary flex items-center gap-2"><Camera className="w-4 h-4" /> Snapshots</span>
                <button type="button" title="Close" onClick={() => setShowSnapshots(false)} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
              </div>
              {/* Save new */}
              <div className="px-4 py-3 border-b border-surface-border flex-shrink-0">
                <p className="text-xs text-text-muted mb-2">Save the current state as a named snapshot.</p>
                <div className="flex gap-2">
                  <input value={snapName} onChange={e => setSnapName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveSnapshot()}
                    placeholder="Snapshot name…"
                    className="flex-1 h-8 bg-surface border border-surface-border rounded px-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50" />
                  <button type="button" onClick={handleSaveSnapshot} disabled={snapSaving || !snapName.trim()}
                    className="h-8 px-3 rounded bg-brand hover:bg-brand/90 text-white text-xs font-medium disabled:opacity-50 transition-colors">
                    {snapSaving ? '…' : 'Save'}
                  </button>
                </div>
              </div>
              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {snapshots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <Camera className="w-8 h-8 text-text-muted mb-2" />
                    <p className="text-sm text-text-muted">No snapshots yet.</p>
                    <p className="text-xs text-text-muted mt-1">Save one to restore later.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-surface-border">
                    {snapshots.map(s => (
                      <div key={s.id} className="px-4 py-3 hover:bg-surface-elevated transition-colors group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-text-primary truncate">{s.name}</div>
                            <div className="text-xs text-text-muted">{s.created_by} · {timeAgo(s.created_at)}</div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button type="button" onClick={() => handleRestoreSnapshot(s.id)} title="Restore" className="w-6 h-6 flex items-center justify-center rounded text-brand hover:bg-brand/10">
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" onClick={() => handleDeleteSnapshot(s.id)} title="Delete" className="w-6 h-6 flex items-center justify-center rounded text-rose-400 hover:bg-rose-500/10">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pomodoro overlay ────────────────────────────────────────────── */}
        <AnimatePresence>
          {(pomodoro.isRunning || pomodoro.secondsLeft !== pomodoro.workDuration * 60) && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bottom-4 right-4 z-30 flex items-center gap-2.5 bg-surface-card/95 backdrop-blur border border-surface-border rounded-md px-3 py-2 shadow-card"
              onClick={e => e.stopPropagation()}>
              <Timer className={`w-3.5 h-3.5 ${pomodoro.phase === 'work' ? 'text-brand' : 'text-amber-400'}`} />
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-text-primary leading-none">{fmt(pomodoro.secondsLeft)}</div>
                <div className="text-[10px] text-text-muted capitalize">{pomodoro.phase.replace('_', ' ')}</div>
              </div>
              <button type="button" onClick={() => pomodoro.setRunning(!pomodoro.isRunning)}
                className="w-5 h-5 flex items-center justify-center text-text-muted hover:text-text-primary">
                {pomodoro.isRunning
                  ? <span className="w-2.5 h-2.5 rounded-sm border-2 border-current" />
                  : <span className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-transparent border-l-current" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
