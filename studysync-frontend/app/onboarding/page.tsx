'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, Zap, GraduationCap, BookOpen, Brain, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { completeOnboarding } from '../../lib/api/auth';
import { useAuthStore } from '../../lib/store/authStore';
import { getMe } from '../../lib/api/auth';

const COURSES = ['CS101','CS201','CS301','CS401','MATH101','MATH201','MATH301','STAT201','DS201','SE401','EE301','PSYC101','ENGL101','BUS201'];
const STUDY_STYLES = [
  { id: 'early_bird', label: 'Early Bird', icon: '🌅', desc: '6am - 12pm' },
  { id: 'night_owl', label: 'Night Owl', icon: '🦉', desc: '10pm - 2am' },
  { id: 'pomodoro', label: 'Pomodoro Lover', icon: '🍅', desc: '25-5 rhythm' },
  { id: 'group_learner', label: 'Group Learner', icon: '👥', desc: 'Better together' },
  { id: 'solo_studier', label: 'Solo Studier', icon: '🎧', desc: 'Deep focus' },
  { id: 'visual', label: 'Visual Learner', icon: '🎨', desc: 'Diagrams & charts' },
];
const AVAILABILITY = [
  { id: 'morning', label: 'Morning', icon: '🌤️', sub: '6am - 12pm' },
  { id: 'afternoon', label: 'Afternoon', icon: '☀️', sub: '12pm - 6pm' },
  { id: 'evening', label: 'Evening', icon: '🌆', sub: '6pm - 10pm' },
  { id: 'night', label: 'Night', icon: '🌙', sub: '10pm - 2am' },
  { id: 'flexible', label: 'Flexible', icon: '⚡', sub: 'Whenever' },
];

const STEPS = ['University', 'Courses', 'Study Style', 'Availability'];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();

  const [data, setData] = useState({
    university: '', program: '', year_of_study: '' as string | number,
    courses: [] as string[], study_style_tags: [] as string[], availability: '',
  });

  const toggleCourse = (c: string) => {
    setData(d => ({ ...d, courses: d.courses.includes(c) ? d.courses.filter(x => x !== c) : [...d.courses, c] }));
  };
  const toggleStyle = (s: string) => {
    setData(d => ({ ...d, study_style_tags: d.study_style_tags.includes(s) ? d.study_style_tags.filter(x => x !== s) : [...d.study_style_tags, s] }));
  };

  const finish = async () => {
    setLoading(true);
    try {
      await completeOnboarding({ ...data, year_of_study: Number(data.year_of_study) || null });
      const user = await getMe();
      setUser(user);
      toast.success('Profile set up! Welcome to StudySynch 🎉');
      router.push('/dashboard');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-full max-w-lg px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-md bg-brand flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-text-primary">StudySynch</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border transition-all duration-200 ${
                i < step ? 'bg-brand border-brand text-white' :
                i === step ? 'border-brand text-brand' : 'border-surface-border text-text-muted'
              }`}>
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px transition-all duration-300 ${i < step ? 'bg-brand' : 'bg-surface-border'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="bg-surface-card border border-surface-border rounded-md p-6 shadow-card"
          >
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-md bg-emerald-950/40 flex items-center justify-center">
                    <GraduationCap className="w-4.5 h-4.5 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">Your university</h2>
                    <p className="text-xs text-text-muted">Where do you study?</p>
                  </div>
                </div>
                <Input label="University" placeholder="University of Toronto" value={data.university}
                  onChange={e => setData(d => ({ ...d, university: e.target.value }))} />
                <Input label="Program / Major" placeholder="Computer Science" value={data.program}
                  onChange={e => setData(d => ({ ...d, program: e.target.value }))} />
                <Input label="Year of study" type="number" placeholder="2" value={data.year_of_study as string}
                  onChange={e => setData(d => ({ ...d, year_of_study: e.target.value }))} />
              </div>
            )}

            {step === 1 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-md bg-emerald-950/40 flex items-center justify-center">
                    <BookOpen className="w-4.5 h-4.5 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">Your courses</h2>
                    <p className="text-xs text-text-muted">Select all that apply ({data.courses.length} selected)</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {COURSES.map(c => (
                    <button key={c} type="button" onClick={() => toggleCourse(c)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                        data.courses.includes(c)
                          ? 'bg-brand border-brand text-white'
                          : 'bg-surface-card border-surface-border text-text-secondary hover:border-brand/50 hover:text-text-primary'
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-md bg-emerald-950/40 flex items-center justify-center">
                    <Brain className="w-4.5 h-4.5 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">Study style</h2>
                    <p className="text-xs text-text-muted">How do you study best? Pick all that fit.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {STUDY_STYLES.map(s => (
                    <button key={s.id} type="button" onClick={() => toggleStyle(s.id)}
                      className={`p-3.5 rounded-md border text-left transition-colors ${
                        data.study_style_tags.includes(s.id)
                          ? 'bg-emerald-950/40 border-brand/40 text-text-primary'
                          : 'bg-surface-card border-surface-border hover:border-brand/30 hover:bg-surface-elevated'
                      }`}>
                      <div className="text-xl mb-1">{s.icon}</div>
                      <div className="text-sm font-medium text-text-primary">{s.label}</div>
                      <div className="text-xs text-text-muted">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-md bg-emerald-950/40 flex items-center justify-center">
                    <Clock className="w-4.5 h-4.5 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">Best time to study</h2>
                    <p className="text-xs text-text-muted">When are you most productive?</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {AVAILABILITY.map(a => (
                    <button key={a.id} type="button" onClick={() => setData(d => ({ ...d, availability: a.id }))}
                      className={`p-3 rounded-md border text-left flex items-center gap-3 transition-colors ${
                        data.availability === a.id
                          ? 'bg-emerald-950/40 border-brand/40'
                          : 'bg-surface-card border-surface-border hover:bg-surface-elevated hover:border-brand/30'
                      }`}>
                      <span className="text-xl">{a.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-text-primary">{a.label}</div>
                        <div className="text-xs text-text-muted">{a.sub}</div>
                      </div>
                      {data.availability === a.id && <Check className="w-4 h-4 text-brand ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 mt-4">
          {step > 0 && (
            <Button variant="secondary" type="button" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <Button
            type="button"
            className="flex-1"
            onClick={step < STEPS.length - 1 ? () => setStep(s => s + 1) : finish}
            loading={loading}
          >
            {step < STEPS.length - 1 ? 'Continue' : 'Finish setup'}
            {step < STEPS.length - 1
              ? <ArrowRight className="w-4 h-4" />
              : <Zap className="w-4 h-4" />
            }
          </Button>
        </div>

        {step < STEPS.length - 1 && (
          <button type="button" onClick={finish} className="w-full text-center text-xs text-text-muted hover:text-text-secondary mt-3 transition-colors">
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
