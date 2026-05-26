'use client';
import { motion } from 'framer-motion';

interface HeatmapDay {
  date: string;
  minutes: number;
  intensity: number;
}

interface StudyHeatmapProps {
  data: HeatmapDay[];
}

const INTENSITY_CLASSES = [
  'bg-surface-elevated',
  'bg-brand/20',
  'bg-brand/40',
  'bg-brand/65',
  'bg-brand',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function formatMinutes(minutes: number): string {
  if (minutes === 0) return 'No study';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function StudyHeatmap({ data }: StudyHeatmapProps) {
  // Build week grid (52 columns × 7 rows)
  const weeks: HeatmapDay[][] = [];
  let week: HeatmapDay[] = [];

  if (data.length > 0) {
    const firstDay = new Date(data[0].date).getDay();
    const paddingDays = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < paddingDays; i++) {
      week.push({ date: '', minutes: 0, intensity: -1 });
    }
  }

  for (const day of data) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push({ date: '', minutes: 0, intensity: -1 });
    weeks.push(week);
  }

  // Which column each month first appears
  const monthAtCol: (string | null)[] = weeks.map(() => null);
  let lastMonth = -1;
  weeks.forEach((w, i) => {
    const realDay = w.find(d => d.date);
    if (realDay) {
      const m = new Date(realDay.date).getMonth();
      if (m !== lastMonth) {
        monthAtCol[i] = MONTHS[m];
        lastMonth = m;
      }
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-0.5">
        {/* Day label column */}
        <div className="flex flex-col gap-0.5 mr-1 flex-shrink-0 w-6">
          <div className="h-4" />
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="h-3 text-[9px] text-text-muted flex items-center justify-end pr-1">
              {d}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {weeks.map((w, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-0.5 flex-shrink-0 w-3">
            {/* Month label row */}
            <div className="h-4 flex items-end overflow-visible">
              {monthAtCol[colIdx] && (
                <span className="text-[9px] text-text-muted whitespace-nowrap leading-none">
                  {monthAtCol[colIdx]}
                </span>
              )}
            </div>

            {/* Day cells */}
            {w.map((day, rowIdx) => {
              if (day.intensity === -1 || !day.date) {
                return <div key={rowIdx} className="w-3 h-3 rounded-[2px] opacity-0" />;
              }
              return (
                <div key={rowIdx} className="relative group w-3 h-3">
                  <motion.div
                    className={`w-3 h-3 rounded-[2px] cursor-pointer ${INTENSITY_CLASSES[day.intensity]} hover:ring-1 hover:ring-brand/50 transition-[box-shadow]`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: colIdx * 0.004, duration: 0.12 }}
                  />
                  {/* Hover tooltip — no inline styles needed */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 pointer-events-none">
                    <div className="bg-surface-card border border-surface-border rounded-md px-2.5 py-1.5 text-xs shadow-card whitespace-nowrap">
                      <p className="font-medium text-text-primary">{formatMinutes(day.minutes)}</p>
                      <p className="text-text-muted">{formatDate(day.date)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-text-muted">Less</span>
        {INTENSITY_CLASSES.map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-[2px] ${cls}`} />
        ))}
        <span className="text-[10px] text-text-muted">More</span>
      </div>
    </div>
  );
}
