'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { getGrades, createGrade, updateGrade, deleteGrade, Assessment, CourseGrade } from '../../../lib/api/grades';
import { GlassCard } from '../../../components/shared/GlassCard';
import { Skeleton } from '../../../components/ui/skeleton';
import { staggerContainer, staggerItem, popIn } from '../../../lib/utils/animations';

const ASSESSMENT_TYPES = ['assignment', 'quiz', 'midterm', 'final', 'project'] as const;

function gradeColor(avg: number | null) {
  if (avg === null) return 'text-text-muted';
  if (avg >= 90) return 'text-brand';
  if (avg >= 80) return 'text-cyan-400';
  if (avg >= 70) return 'text-amber-400';
  return 'text-rose-400';
}

function CourseCard({ course, onDelete }: { course: CourseGrade; onDelete: () => void }) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [newA, setNewA] = useState({ name: '', score: '', max_score: '100', weight: '', type: 'assignment' as Assessment['type'] });

  const updateMutation = useMutation({
    mutationFn: (assessments: Assessment[]) => updateGrade(course.id, { ...course, assessments }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grades'] }),
  });

  const addAssessment = () => {
    if (!newA.name || !newA.score || !newA.weight) return;
    const next = [...course.assessments, {
      name: newA.name,
      score: Number(newA.score),
      max_score: Number(newA.max_score),
      weight: Number(newA.weight),
      type: newA.type,
    }];
    updateMutation.mutate(next);
    setNewA({ name: '', score: '', max_score: '100', weight: '', type: 'assignment' });
  };

  const removeAssessment = (idx: number) => {
    const next = course.assessments.filter((_, i) => i !== idx);
    updateMutation.mutate(next);
  };

  const avg = course.weighted_average;

  return (
    <GlassCard className="p-5" hover={false}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-text-primary font-semibold text-lg">{course.course_name}</h3>
            {course.target_grade && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated border border-surface-border text-text-muted">
                Target: {course.target_grade}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className={`text-3xl font-bold ${gradeColor(avg)}`}>
              {avg !== null ? `${avg}%` : '—'}
            </span>
            {avg !== null && (
              <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${avg >= 90 ? 'bg-brand' : avg >= 80 ? 'bg-cyan-400' : avg >= 70 ? 'bg-amber-400' : 'bg-rose-400'}`}
                  animate={{ width: `${Math.min(avg, 100)}%` }}
                  initial={{ width: '0%' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-2 rounded-md hover:bg-surface-elevated text-text-muted transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={onDelete} className="p-2 rounded-md hover:bg-rose-500/10 text-text-muted hover:text-rose-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-4 space-y-2">
              {course.assessments.length === 0 && (
                <p className="text-text-muted text-sm text-center py-3">No assessments yet</p>
              )}
              {course.assessments.map((a, i) => (
                <div key={i} className="flex items-center gap-3 text-sm bg-surface-elevated rounded-md px-3 py-2">
                  <span className="flex-1 text-text-primary">{a.name}</span>
                  <span className="text-text-muted text-xs px-2 py-0.5 rounded-full bg-surface-card">{a.type}</span>
                  <span className="text-text-secondary">{a.score}/{a.max_score}</span>
                  <span className="text-text-muted w-12 text-right">{a.weight}%</span>
                  <button onClick={() => removeAssessment(i)} className="text-text-muted hover:text-rose-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
              <input
                className="col-span-2 sm:col-span-1 bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
                placeholder="Name"
                value={newA.name}
                onChange={e => setNewA(p => ({ ...p, name: e.target.value }))}
              />
              <input
                className="bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
                placeholder="Score"
                type="number"
                value={newA.score}
                onChange={e => setNewA(p => ({ ...p, score: e.target.value }))}
              />
              <input
                className="bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
                placeholder="Max"
                type="number"
                value={newA.max_score}
                onChange={e => setNewA(p => ({ ...p, max_score: e.target.value }))}
              />
              <input
                className="bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
                placeholder="Weight %"
                type="number"
                value={newA.weight}
                onChange={e => setNewA(p => ({ ...p, weight: e.target.value }))}
              />
              <div className="flex gap-2">
                <select
                  className="flex-1 bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-brand"
                  value={newA.type}
                  onChange={e => setNewA(p => ({ ...p, type: e.target.value as Assessment['type'] }))}
                >
                  {ASSESSMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button
                  onClick={addAssessment}
                  className="px-3 py-2 rounded-md bg-brand text-white text-sm hover:bg-brand/90 transition-colors whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

export default function GradesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['grades'], queryFn: getGrades });
  const [showAdd, setShowAdd] = useState(false);
  const [newCourse, setNewCourse] = useState({ course_name: '', target_grade: '' });

  const addMutation = useMutation({
    mutationFn: () => createGrade({ course_name: newCourse.course_name, target_grade: newCourse.target_grade }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grades'] });
      setNewCourse({ course_name: '', target_grade: '' });
      setShowAdd(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGrade,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grades'] }),
  });

  const grades: CourseGrade[] = data?.results ?? (Array.isArray(data) ? data : []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand/10">
              <BookOpen className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Grade Tracker</h1>
              <p className="text-text-muted text-sm">Track assessments and monitor your academic progress</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(s => !s)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </motion.div>

        <AnimatePresence>
          {showAdd && (
            <motion.div variants={popIn} initial="hidden" animate="visible" exit="hidden" className="mb-6">
              <GlassCard className="p-4" hover={false}>
                <div className="flex gap-3">
                  <input
                    className="flex-1 bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
                    placeholder="Course name (e.g. CS401)"
                    value={newCourse.course_name}
                    onChange={e => setNewCourse(p => ({ ...p, course_name: e.target.value }))}
                  />
                  <input
                    className="w-24 bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
                    placeholder="Target"
                    value={newCourse.target_grade}
                    onChange={e => setNewCourse(p => ({ ...p, target_grade: e.target.value }))}
                  />
                  <button
                    onClick={() => addMutation.mutate()}
                    disabled={!newCourse.course_name || addMutation.isPending}
                    className="px-4 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand/90 disabled:opacity-50 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-md" />)}
          </div>
        ) : grades.length === 0 ? (
          <motion.div variants={staggerItem} className="text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-text-primary font-medium text-lg mb-2">No courses yet</h3>
            <p className="text-text-muted text-sm">Add your first course to start tracking grades</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {grades.map(g => (
              <motion.div key={g.id} variants={staggerItem}>
                <CourseCard course={g} onDelete={() => deleteMutation.mutate(g.id)} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
