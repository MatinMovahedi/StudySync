'use client';
import { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Edit3, Save, X, GraduationCap, Book, Clock, Flame, Trophy, Plus, ExternalLink, Trash2, Globe, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api/client';
import { useAuthStore } from '../../../lib/store/authStore';
import { useGamificationStore } from '../../../lib/store/gamificationStore';
import { getStreak } from '../../../lib/api/analytics';
import { GlassCard } from '../../../components/shared/GlassCard';
import { BadgeGrid } from '../../../components/shared/BadgeGrid';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Avatar } from '../../../components/ui/avatar';
import { staggerContainer, staggerItem } from '../../../lib/utils/animations';
import { formatStudyHours } from '../../../lib/utils/format';

interface Project {
  title: string;
  description: string;
  url: string;
  tech_stack: string[];
}

const STUDY_STYLES: Record<string, string> = {
  early_bird: 'Early Bird 🌅', night_owl: 'Night Owl 🦉', pomodoro: 'Pomodoro 🍅',
  group_learner: 'Group Learner 👥', solo_studier: 'Solo Studier 🎧', visual: 'Visual 🎨',
};

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { profile: gamification } = useGamificationStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bio: user?.profile?.bio || '',
    university: user?.profile?.university || '',
    program: user?.profile?.program || '',
    linkedin: user?.profile?.linkedin || '',
    github: user?.profile?.github || '',
  });

  // Skills state
  const [skills, setSkills] = useState<string[]>(user?.profile?.skills || []);
  const [skillInput, setSkillInput] = useState('');

  // Projects state
  const [projects, setProjects] = useState<Project[]>(user?.profile?.projects || []);
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', url: '', tech_stack: '' });

  const { data: streak } = useQuery({ queryKey: ['streak'], queryFn: getStreak });

  const save = async () => {
    setSaving(true);
    try {
      await api.patch('/api/users/profile/', { ...form, skills, projects });
      const { data: updated } = await api.get('/api/users/me/');
      setUser(updated);
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  const handleSkillKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  };

  const addProject = () => {
    if (!projectForm.title) return;
    const proj: Project = {
      title: projectForm.title,
      description: projectForm.description,
      url: projectForm.url,
      tech_stack: projectForm.tech_stack ? projectForm.tech_stack.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    setProjects(prev => [...prev, proj]);
    setProjectForm({ title: '', description: '', url: '', tech_stack: '' });
    setShowAddProject(false);
  };

  if (!user) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem} className="mb-6">
          <p className="text-xs text-text-muted mb-1">Account</p>
          <h1 className="text-2xl font-semibold text-text-primary">My Profile</h1>
        </motion.div>

        {/* Profile header card */}
        <motion.div variants={staggerItem}>
          <GlassCard className="mb-6 overflow-hidden p-0" hover={false}>
            <div className="h-16 bg-surface-elevated border-b border-surface-border" />
            <div className="px-6 pb-6">
              <div className="flex items-end justify-between -mt-10 mb-4">
                <Avatar name={`${user.first_name} ${user.last_name}`} src={user.profile?.avatar} size="xl"
                  className="border-4 border-surface-card" />
                {!editing ? (
                  <Button variant="secondary" size="sm" onClick={() => setEditing(true)} className="gap-2">
                    <Edit3 className="w-3.5 h-3.5" />Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="danger" size="sm" onClick={() => setEditing(false)}><X className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" onClick={save} loading={saving} className="gap-2"><Save className="w-3.5 h-3.5" />Save</Button>
                  </div>
                )}
              </div>

              {!editing ? (
                <>
                  <h2 className="text-2xl font-bold text-text-primary">{user.first_name} {user.last_name}</h2>
                  <p className="text-text-muted text-sm">{user.email}</p>
                  {user.profile?.bio && <p className="text-text-secondary text-sm mt-3 leading-relaxed">{user.profile.bio}</p>}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {user.profile?.university && (
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <GraduationCap className="w-3.5 h-3.5" />{user.profile.university}
                      </div>
                    )}
                    {user.profile?.program && (
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <Book className="w-3.5 h-3.5" />{user.profile.program}
                        {user.profile.year_of_study && ` · Year ${user.profile.year_of_study}`}
                      </div>
                    )}
                    {user.profile?.availability && (
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <Clock className="w-3.5 h-3.5" />{user.profile.availability.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="University" value={form.university} onChange={e => setForm(f => ({...f, university: e.target.value}))} />
                    <Input label="Program" value={form.program} onChange={e => setForm(f => ({...f, program: e.target.value}))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="GitHub username" value={form.github} onChange={e => setForm(f => ({...f, github: e.target.value}))} />
                    <Input label="LinkedIn username" value={form.linkedin} onChange={e => setForm(f => ({...f, linkedin: e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary mb-1.5 block">Bio</label>
                    <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} rows={3}
                      className="w-full bg-surface-card border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 resize-none transition-colors" />
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Gamification card */}
        {gamification && (
          <motion.div variants={staggerItem} className="mb-6">
            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Level {gamification.level}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{gamification.xp.toLocaleString()} XP total · {gamification.next_level_xp} to next level</p>
                </div>
                <div className="text-xs text-text-muted">{gamification.achievements.length} / {gamification.all_achievements.length} badges</div>
              </div>
              <div className="h-2 bg-surface-elevated rounded-full mb-5">
                <motion.div
                  className="h-full bg-brand rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((gamification.xp % 500) / 500) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <BadgeGrid earned={gamification.achievements} all={gamification.all_achievements} />
            </GlassCard>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats */}
          <motion.div variants={staggerItem}>
            <GlassCard hover={false}>
              <h3 className="text-base font-semibold text-text-primary mb-4">Study Stats</h3>
              <div className="space-y-3">
                {[
                  { label: 'Study Streak', value: `${streak?.current_streak || 0} days`, icon: <Flame className="w-4 h-4 text-amber-500" /> },
                  { label: 'Best Streak', value: `${streak?.longest_streak || 0} days`, icon: <Trophy className="w-4 h-4 text-text-muted" /> },
                  { label: 'Total Hours', value: formatStudyHours(user.profile?.total_study_hours || 0), icon: <Clock className="w-4 h-4 text-text-muted" /> },
                  { label: 'Sessions', value: `${user.profile?.total_sessions || 0}`, icon: <GraduationCap className="w-4 h-4 text-text-muted" /> },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {s.icon}
                    <span className="text-sm text-text-secondary flex-1">{s.label}</span>
                    <span className="text-sm font-semibold text-text-primary tabular-nums">{s.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Courses & Tags */}
          <motion.div variants={staggerItem} className="space-y-4">
            {user.profile?.courses && user.profile.courses.length > 0 && (
              <GlassCard hover={false}>
                <h3 className="text-base font-semibold text-text-primary mb-3">Courses</h3>
                <div className="flex flex-wrap gap-2">
                  {user.profile.courses.map((c: string) => <Badge key={c} variant="muted" className="text-xs">{c}</Badge>)}
                </div>
              </GlassCard>
            )}
            {user.profile?.study_style_tags && user.profile.study_style_tags.length > 0 && (
              <GlassCard hover={false}>
                <h3 className="text-base font-semibold text-text-primary mb-3">Study Style</h3>
                <div className="flex flex-wrap gap-2">
                  {user.profile.study_style_tags.map((t: string) => (
                    <Badge key={t} variant="purple" className="text-xs">{STUDY_STYLES[t] || t}</Badge>
                  ))}
                </div>
              </GlassCard>
            )}
          </motion.div>
        </div>

        {/* Social links display */}
        {(user.profile?.github || user.profile?.linkedin) && (
          <motion.div variants={staggerItem} className="mt-6">
            <GlassCard hover={false} className="flex flex-wrap gap-4 px-5 py-4">
              {user.profile?.github && (
                <a href={`https://github.com/${user.profile.github}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
                  <Link2 className="w-4 h-4" />{user.profile.github}
                </a>
              )}
              {user.profile?.linkedin && (
                <a href={`https://linkedin.com/in/${user.profile.linkedin}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-text-muted hover:text-brand transition-colors">
                  <Globe className="w-4 h-4" />{user.profile.linkedin}
                </a>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* Skills section */}
        <motion.div variants={staggerItem} className="mt-6">
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary">Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map(skill => (
                <span key={skill} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-brand/10 text-brand border border-brand/20">
                  {skill}
                  <button type="button" aria-label={`Remove ${skill}`} onClick={() => setSkills(prev => prev.filter(s => s !== skill))} className="hover:text-rose-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-surface-elevated border border-surface-border rounded-md px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
                placeholder="Add skill (press Enter)"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKey}
              />
              <button type="button" onClick={addSkill} className="px-3 py-1.5 rounded-md bg-surface-elevated border border-surface-border text-text-muted hover:text-text-primary transition-colors text-sm">
                Add
              </button>
            </div>
            {skills.length > 0 && (
              <button type="button" onClick={async () => { await api.patch('/api/users/profile/', { skills }); toast.success('Skills saved'); }}
                className="mt-3 flex items-center gap-1.5 text-xs text-brand hover:text-brand/80 transition-colors">
                <Save className="w-3 h-3" /> Save skills
              </button>
            )}
          </GlassCard>
        </motion.div>

        {/* Projects section */}
        <motion.div variants={staggerItem} className="mt-6">
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary">Projects</h3>
              <button type="button" onClick={() => setShowAddProject(s => !s)} className="flex items-center gap-1.5 text-xs text-brand hover:text-brand/80 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {showAddProject && (
              <div className="mb-4 p-4 bg-surface-elevated rounded-md space-y-2.5">
                <input className="w-full bg-surface-card border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
                  placeholder="Project title *" value={projectForm.title} onChange={e => setProjectForm(p => ({ ...p, title: e.target.value }))} />
                <textarea className="w-full bg-surface-card border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand resize-none"
                  placeholder="Short description" rows={2} value={projectForm.description} onChange={e => setProjectForm(p => ({ ...p, description: e.target.value }))} />
                <input className="w-full bg-surface-card border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
                  placeholder="URL (optional)" value={projectForm.url} onChange={e => setProjectForm(p => ({ ...p, url: e.target.value }))} />
                <input className="w-full bg-surface-card border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
                  placeholder="Tech stack (comma-separated)" value={projectForm.tech_stack} onChange={e => setProjectForm(p => ({ ...p, tech_stack: e.target.value }))} />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddProject(false)} className="flex-1 px-3 py-1.5 rounded-md border border-surface-border text-text-muted text-sm hover:bg-surface-card transition-colors">Cancel</button>
                  <button type="button" onClick={addProject} disabled={!projectForm.title} className="flex-1 px-3 py-1.5 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand/90 disabled:opacity-50 transition-colors">Add</button>
                </div>
              </div>
            )}

            {projects.length === 0 && !showAddProject && (
              <p className="text-text-muted text-sm">No projects added yet</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projects.map((p, i) => (
                <div key={i} className="p-3 bg-surface-elevated rounded-md border border-surface-border">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-text-primary font-medium text-sm">{p.title}</p>
                    <div className="flex gap-1">
                      {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${p.title}`} className="text-text-muted hover:text-brand transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>}
                      <button type="button" aria-label={`Delete ${p.title}`} onClick={() => { setProjects(prev => prev.filter((_, j) => j !== i)); }} className="text-text-muted hover:text-rose-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  {p.description && <p className="text-text-muted text-xs mt-1 line-clamp-2">{p.description}</p>}
                  {p.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.tech_stack.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-card border border-surface-border text-text-muted">{t}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {projects.length > 0 && (
              <button type="button" onClick={async () => { await api.patch('/api/users/profile/', { projects }); toast.success('Projects saved'); }}
                className="mt-3 flex items-center gap-1.5 text-xs text-brand hover:text-brand/80 transition-colors">
                <Save className="w-3 h-3" /> Save projects
              </button>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
