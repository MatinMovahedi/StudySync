'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ChevronLeft, ChevronRight, Plus, X, Trash2, ExternalLink, MapPin, Link2 } from 'lucide-react';
import { startOfWeek, addDays, addWeeks, subWeeks, format, isToday, isSameDay, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { getSessions, createSession, deleteSession, type StudySession } from '../../../lib/api/sessions';
import { getMyGroups } from '../../../lib/api/groups';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { popIn } from '../../../lib/utils/animations';
import type { StudyGroup } from '../../../lib/types';

// ── Grid constants ────────────────────────────────────────────────────────────
const HOUR_START = 7;
const HOUR_END = 22;
const HOUR_H = 40;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => i + HOUR_START);

// ── Group accent colors (text only — backgrounds stay neutral) ────────────────
const ACCENTS = ['text-brand', 'text-violet-400', 'text-amber-400', 'text-cyan-400', 'text-rose-400'];
const accent = (groupId: number) => ACCENTS[groupId % ACCENTS.length];

// ── Time helpers ──────────────────────────────────────────────────────────────
const timeToY = (iso: string) => {
  const d = parseISO(iso);
  return Math.max(0, (d.getHours() + d.getMinutes() / 60 - HOUR_START) * HOUR_H);
};
const nowToY = (d: Date) => Math.max(0, (d.getHours() + d.getMinutes() / 60 - HOUR_START) * HOUR_H);
const durationToH = (mins: number) => Math.max(14, (mins / 60) * HOUR_H);
const yToTime = (y: number) => {
  const raw = y / HOUR_H + HOUR_START;
  const hours = Math.min(HOUR_END - 1, Math.max(HOUR_START, Math.floor(raw)));
  const minutes = Math.round(((raw - hours) * 60) / 15) * 15;
  return { hours, minutes: minutes >= 60 ? 0 : minutes };
};

// ── Overlap layout ────────────────────────────────────────────────────────────
interface Placed { session: StudySession; col: number; totalCols: number }
function layoutDay(sessions: StudySession[]): Placed[] {
  const sorted = [...sessions].sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  const columns: number[] = [];
  const placed: { session: StudySession; col: number }[] = [];
  for (const s of sorted) {
    const start = parseISO(s.scheduled_at).getTime();
    const end = start + s.duration_minutes * 60000;
    let col = columns.findIndex(e => e <= start);
    if (col === -1) { col = columns.length; columns.push(0); }
    columns[col] = end;
    placed.push({ session: s, col });
  }
  const totalCols = Math.max(1, columns.length);
  return placed.map(p => ({ ...p, totalCols }));
}

// ── Form types ────────────────────────────────────────────────────────────────
interface SessionForm {
  title: string; group: number; date: string; time: string;
  duration_minutes: number; is_online: boolean; join_link: string; location: string;
}

// ── Session block ─────────────────────────────────────────────────────────────
function SessionBlock({ session, col, totalCols, onClick }: Placed & { onClick: () => void }) {
  const top = timeToY(session.scheduled_at);
  const height = durationToH(session.duration_minutes);
  const color = accent(session.group);
  const short = height < 40;

  return (
    <button
      type="button"
      aria-label={`Session: ${session.title}`}
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        '--s-top': `${top}px`,
        '--s-height': `${Math.max(22, height)}px`,
        '--s-width': `${100 / totalCols}%`,
        '--s-left': `${(col / totalCols) * 100}%`,
      } as React.CSSProperties}
      className="schedule-session rounded-md border border-surface-border bg-surface-elevated hover:bg-surface-border/40 text-left px-2 py-1 transition-colors cursor-pointer"
    >
      <p className={`font-medium leading-tight text-[11px] ${color} ${short ? 'truncate' : 'line-clamp-2'}`}>
        {session.title}
      </p>
      {!short && (
        <p className="text-[10px] text-text-muted mt-0.5">
          {format(parseISO(session.scheduled_at), 'h:mm a')}
        </p>
      )}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SchedulePage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [now, setNow] = useState(new Date());
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<StudySession | null>(null);
  const [mobileDayIdx, setMobileDayIdx] = useState(() => {
    const d = new Date();
    const wStart = startOfWeek(d, { weekStartsOn: 1 });
    const diff = Math.floor((d.getTime() - wStart.getTime()) / 86400000);
    return Math.max(0, Math.min(6, diff));
  });
  const gridRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const d = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const idx = d.findIndex(day => isToday(day));
    setMobileDayIdx(idx >= 0 ? idx : 0);
  }, [weekStart]);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = Math.max(0, nowToY(new Date()) - 100);
    }
  }, []);

  const weekEnd = addDays(weekStart, 6);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const fromStr = format(weekStart, 'yyyy-MM-dd');
  const toStr = format(weekEnd, 'yyyy-MM-dd');

  const { data: sessions = [], isLoading } = useQuery<StudySession[]>({
    queryKey: ['sessions', fromStr, toStr],
    queryFn: () => getSessions(fromStr, toStr),
  });

  const { data: myGroups = [] } = useQuery<StudyGroup[]>({
    queryKey: ['my-groups'],
    queryFn: getMyGroups,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sessions'] }); setSelected(null); toast.success('Removed'); },
    onError: () => toast.error('Failed to delete'),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createSession(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Scheduled');
      setCreateOpen(false);
      reset();
    },
    onError: () => toast.error('Failed to create'),
  });

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<SessionForm>({
    defaultValues: { duration_minutes: 60, is_online: true },
  });
  const isOnline = watch('is_online');

  const openCreate = useCallback((dateTime?: Date) => {
    reset({ duration_minutes: 60, is_online: true });
    const dt = dateTime || new Date();
    setValue('date', format(dt, 'yyyy-MM-dd'));
    setValue('time', format(dt, 'HH:mm'));
    setCreateOpen(true);
  }, [reset, setValue]);

  const handleColumnClick = (e: React.MouseEvent<HTMLDivElement>, day: Date) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const { hours, minutes } = yToTime(e.clientY - e.currentTarget.getBoundingClientRect().top);
    const dt = new Date(day);
    dt.setHours(hours, minutes, 0, 0);
    openCreate(dt);
  };

  const onSubmit = (data: SessionForm) => {
    createMutation.mutate({
      title: data.title,
      group: Number(data.group),
      scheduled_at: new Date(`${data.date}T${data.time}`).toISOString(),
      duration_minutes: Number(data.duration_minutes),
      is_online: data.is_online,
      join_link: data.is_online ? (data.join_link || '') : '',
      location: data.is_online ? '' : (data.location || ''),
    });
  };

  const sessionsForDay = (day: Date) => sessions.filter(s => isSameDay(parseISO(s.scheduled_at), day));

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold text-text-primary">Schedule</h1>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous week"
              onClick={() => setWeekStart(w => subWeeks(w, 1))}
              className="p-1 text-text-muted hover:text-text-primary transition-colors rounded"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-text-muted tabular-nums hidden md:inline">
              {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d')}
            </span>
            <span className="text-xs text-text-muted tabular-nums md:hidden">
              {format(days[mobileDayIdx], 'EEE, MMM d')}
            </span>
            <button
              type="button"
              aria-label="Next week"
              onClick={() => setWeekStart(w => addWeeks(w, 1))}
              className="p-1 text-text-muted hover:text-text-primary transition-colors rounded"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="text-xs text-text-muted hover:text-brand transition-colors"
          >
            Today
          </button>
        </div>

        <button
          type="button"
          aria-label="New session"
          onClick={() => openCreate()}
          className="w-7 h-7 rounded-md bg-brand/10 hover:bg-brand/20 text-brand flex items-center justify-center transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Calendar ── */}
      <div className="flex flex-col flex-1 overflow-hidden px-4 pb-4">
        <div className="flex flex-col flex-1 border border-surface-border rounded-xl overflow-hidden bg-surface-card">

          {/* Mobile day-picker strip */}
          <div className="md:hidden flex flex-shrink-0 border-b border-surface-border overflow-x-auto">
            {days.map((day, i) => {
              const today = isToday(day);
              const selected = i === mobileDayIdx;
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setMobileDayIdx(i)}
                  className={`flex-1 flex flex-col items-center py-2 border-r border-surface-border last:border-r-0 transition-colors min-w-[42px] ${selected ? 'bg-brand/10' : ''}`}
                >
                  <span className={`text-[9px] font-medium uppercase tracking-widest ${selected ? 'text-brand' : today ? 'text-brand/60' : 'text-text-muted'}`}>
                    {format(day, 'EEE')}
                  </span>
                  <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${selected ? 'bg-brand text-white' : today ? 'text-brand' : 'text-text-secondary'}`}>
                    {format(day, 'd')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Day headers (desktop only) */}
          <div className="hidden md:flex flex-shrink-0 border-b border-surface-border">
            <div className="w-12 flex-shrink-0 border-r border-surface-border" />
            {days.map(day => {
              const today = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className="flex-1 flex flex-col items-center py-2 border-r border-surface-border last:border-r-0"
                >
                  <span className={`text-[9px] font-medium uppercase tracking-widest ${today ? 'text-brand' : 'text-text-muted'}`}>
                    {format(day, 'EEE')}
                  </span>
                  <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${today ? 'bg-brand text-white' : 'text-text-secondary'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div ref={gridRef} className="flex flex-1 overflow-y-auto overflow-x-hidden">
            {/* Hour labels */}
            <div className="w-12 flex-shrink-0 border-r border-surface-border relative schedule-col-height">
              {HOURS.filter(h => h % 2 === 0).map(h => (
                <div
                  key={h}
                  className="schedule-hour-label text-text-muted/50"
                  style={{ '--hour-offset': `${(h - HOUR_START) * HOUR_H}px` } as React.CSSProperties}
                >
                  {h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day, i) => {
              const today = isToday(day);
              const placed = layoutDay(sessionsForDay(day));
              const mobileHidden = i !== mobileDayIdx;

              return (
                <div
                  key={day.toISOString()}
                  className={`flex-1 relative border-r border-surface-border last:border-r-0 cursor-crosshair schedule-col-height ${today ? 'bg-brand/[0.015]' : ''} ${mobileHidden ? 'hidden md:block md:flex-1' : ''}`}
                  onClick={e => handleColumnClick(e, day)}
                >
                  {/* Hour lines */}
                  {HOURS.map(h => (
                    <div
                      key={h}
                      className="schedule-hour-line border-surface-border/30"
                      style={{ '--hour-offset': `${(h - HOUR_START) * HOUR_H}px` } as React.CSSProperties}
                    />
                  ))}

                  {/* Now indicator */}
                  {today && (
                    <div
                      className="schedule-now-line"
                      style={{ '--now-offset': `${nowToY(now)}px` } as React.CSSProperties}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-brand -ml-0.5 flex-shrink-0" />
                      <div className="flex-1 h-px bg-brand/40" />
                    </div>
                  )}

                  {/* Sessions */}
                  {!isLoading && placed.map(p => (
                    <SessionBlock
                      key={p.session.id}
                      session={p.session}
                      col={p.col}
                      totalCols={p.totalCols}
                      onClick={() => setSelected(p.session)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Detail modal ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}
          >
            <motion.div
              variants={popIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-surface-card border border-surface-border rounded-xl w-full max-w-xs shadow-2xl p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-sm font-semibold text-text-primary leading-snug">{selected.title}</p>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setSelected(null)}
                  className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0 -mt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 text-xs text-text-muted mb-4">
                <p>{format(parseISO(selected.scheduled_at), 'EEEE, MMMM d · h:mm a')}</p>
                <p>{selected.duration_minutes} min{selected.group_name ? ` · ${selected.group_name}` : ''}</p>
                {!selected.is_online && selected.location && <p>{selected.location}</p>}
              </div>

              <div className="flex items-center gap-2">
                {selected.is_online && selected.join_link && (
                  <a
                    href={selected.join_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-brand hover:text-brand-dark transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> Join
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(selected.id)}
                  disabled={deleteMutation.isPending}
                  className="ml-auto flex items-center gap-1 text-xs text-text-muted hover:text-rose-400 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-3 h-3" />
                  {deleteMutation.isPending ? 'Removing…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Create modal ── */}
      <AnimatePresence>
        {createOpen && (
          <motion.div
            key="create"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setCreateOpen(false); }}
          >
            <motion.div
              variants={popIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-surface-card border border-surface-border rounded-xl w-full max-w-sm shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
                <p className="text-sm font-semibold text-text-primary">New session</p>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setCreateOpen(false)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-5 flex flex-col gap-3.5">
                <Input
                  label="Title"
                  placeholder="e.g. Midterm prep"
                  error={errors.title?.message}
                  {...register('title', { required: 'Required' })}
                />

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-secondary">Group</label>
                  <select
                    className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 h-9 text-sm text-text-primary outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors"
                    {...register('group', { required: 'Required' })}
                  >
                    <option value="">Select…</option>
                    {myGroups.map((g: StudyGroup) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  {errors.group && <p className="text-xs text-accent-rose">{errors.group.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <Input label="Date" type="date" error={errors.date?.message} {...register('date', { required: 'Required' })} />
                  <Input label="Time" type="time" error={errors.time?.message} {...register('time', { required: 'Required' })} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-secondary">Duration</label>
                  <select
                    className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 h-9 text-sm text-text-primary outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors"
                    {...register('duration_minutes')}
                  >
                    {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Online</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isOnline ? 'true' : 'false'}
                    aria-label="Toggle online session"
                    onClick={() => setValue('is_online', !isOnline)}
                    className={`relative w-8 h-4 rounded-full transition-colors ${isOnline ? 'bg-brand' : 'bg-surface-elevated border border-surface-border'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${isOnline ? 'translate-x-4' : ''}`} />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {isOnline ? (
                    <motion.div key="jl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Input label="Join link" placeholder="https://zoom.us/j/…" icon={<Link2 className="w-3.5 h-3.5" />} {...register('join_link')} />
                    </motion.div>
                  ) : (
                    <motion.div key="loc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Input label="Location" placeholder="Library Room 204" icon={<MapPin className="w-3.5 h-3.5" />} {...register('location')} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end gap-2 pt-0.5">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" size="sm" loading={createMutation.isPending}>Schedule</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
