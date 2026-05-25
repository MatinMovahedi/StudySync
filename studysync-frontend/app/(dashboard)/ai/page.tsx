'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Sparkles, BookOpen, Layers, FileText, Lightbulb, RotateCcw, Check, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { GradientText } from '../../../components/shared/GradientText';
import { Badge } from '../../../components/ui/badge';
import { GlassCard } from '../../../components/shared/GlassCard';
import { Skeleton } from '../../../components/ui/skeleton';
import { streamAIChat, generateQuiz, generateFlashcards, summarizeNotes, explainConcept } from '../../../lib/api/ai';
import { staggerContainer, staggerItem } from '../../../lib/utils/animations';
import { QuizQuestion, FlashCard } from '../../../lib/types';

type Tab = 'chat' | 'quiz' | 'flashcards' | 'summarize' | 'explain';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const TABS = [
  { id: 'chat' as Tab, label: 'AI Chat', icon: Brain },
  { id: 'quiz' as Tab, label: 'Quiz', icon: Sparkles },
  { id: 'flashcards' as Tab, label: 'Flashcards', icon: Layers },
  { id: 'summarize' as Tab, label: 'Summarize', icon: FileText },
  { id: 'explain' as Tab, label: 'Explain', icon: Lightbulb },
];

function FlipCard({ card }: { card: FlashCard }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="relative h-48 cursor-pointer" style={{ perspective: 1000 }} onClick={() => setFlipped(f => !f)}>
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0 glass rounded-2xl flex flex-col items-center justify-center p-6 text-center" style={{ backfaceVisibility: 'hidden' }}>
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-3">Question</div>
          <p className="text-text-primary font-medium">{card.front}</p>
          <div className="mt-4 text-xs text-text-muted">Click to reveal answer</div>
        </div>
        <div className="absolute inset-0 glass rounded-2xl flex flex-col items-center justify-center p-6 text-center bg-brand/10 border border-brand/20" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <div className="text-[10px] text-brand-light uppercase tracking-wider mb-3">Answer</div>
          <p className="text-text-primary text-sm">{card.back}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function AIPage() {
  const [tab, setTab] = useState<Tab>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [quizTopic, setQuizTopic] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('medium');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizRevealed, setQuizRevealed] = useState(false);

  const [flashTopic, setFlashTopic] = useState('');
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [flashLoading, setFlashLoading] = useState(false);

  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [sumLoading, setSumLoading] = useState(false);

  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');
  const [expLoading, setExpLoading] = useState(false);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, currentResponse]);

  const sendChat = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(m => [...m, userMsg]);
    setStreaming(true);
    setCurrentResponse('');
    let full = '';
    try {
      await streamAIChat(
        [...messages, userMsg],
        (chunk) => { full += chunk; setCurrentResponse(r => r + chunk); },
        () => {
          setMessages(m => [...m, { role: 'assistant', content: full }]);
          setCurrentResponse('');
          setStreaming(false);
        }
      );
    } catch {
      setStreaming(false);
      setCurrentResponse('');
    }
  }, [input, messages, streaming]);

  const handleGenQuiz = async () => {
    if (!quizTopic) return;
    setQuizLoading(true);
    setSelectedAnswers({});
    setQuizRevealed(false);
    try {
      const data = await generateQuiz(quizTopic, quizDifficulty, 5);
      setQuizQuestions(data.questions);
    } catch { /* noop */ } finally { setQuizLoading(false); }
  };

  const handleGenFlash = async () => {
    if (!flashTopic) return;
    setFlashLoading(true);
    try {
      const data = await generateFlashcards(flashTopic, flashTopic, 6);
      setFlashCards(data.flashcards);
    } catch { /* noop */ } finally { setFlashLoading(false); }
  };

  const handleSummarize = async () => {
    if (!notes) return;
    setSumLoading(true);
    try {
      const data = await summarizeNotes(notes);
      setSummary(data.summary);
    } catch { /* noop */ } finally { setSumLoading(false); }
  };

  const handleExplain = async () => {
    if (!concept) return;
    setExpLoading(true);
    try {
      const data = await explainConcept(concept, 'intermediate');
      setExplanation(data.explanation);
    } catch { /* noop */ } finally { setExpLoading(false); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Brain className="w-5 h-5 text-brand-light" />
            </div>
            <div>
              <h1 className="text-3xl font-bold"><GradientText>AI Study Assistant</GradientText></h1>
              <p className="text-text-muted text-sm">Powered by StudySync AI</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={staggerItem} className="flex gap-2 flex-wrap mb-6">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                tab === t.id ? 'bg-brand/15 border-brand/40 text-brand-light' : 'glass border-surface-border text-text-secondary hover:border-brand/30'
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            {/* CHAT TAB */}
            {tab === 'chat' && (
              <div className="glass gradient-border rounded-2xl overflow-hidden flex flex-col" style={{ height: 560 }}>
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                  <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                  <span className="text-sm font-medium text-text-primary">StudySync AI</span>
                  <Badge variant="emerald" className="text-[10px]">Online</Badge>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {messages.length === 0 && !streaming && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                      <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
                        <Brain className="w-7 h-7 text-brand-light" />
                      </div>
                      <h3 className="text-text-primary font-semibold mb-2">How can I help you study today?</h3>
                      <p className="text-text-muted text-sm max-w-sm">Ask me to explain concepts, help with assignments, discuss topics, or study strategies.</p>
                      <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        {['Explain recursion', 'What is Big-O notation?', 'Help with calculus', 'Study tips for exams'].map(s => (
                          <button key={s} onClick={() => setInput(s)} className="glass px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:border-brand/30 transition-all">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-lg bg-brand/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <Brain className="w-3.5 h-3.5 text-brand-light" />
                        </div>
                      )}
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                        msg.role === 'user' ? 'bg-brand text-white' : 'bg-surface-elevated text-text-primary border border-white/5'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {streaming && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-7 h-7 rounded-lg bg-brand/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Brain className="w-3.5 h-3.5 text-brand-light" />
                      </div>
                      <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm bg-surface-elevated text-text-primary border border-white/5 whitespace-pre-wrap">
                        {currentResponse || (
                          <div className="flex gap-1.5 items-center">
                            {[0,1,2].map(i => (
                              <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-text-muted"
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                            ))}
                          </div>
                        )}
                        {currentResponse && <span className="inline-block w-0.5 h-4 bg-brand-light ml-0.5 animate-pulse" />}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-white/5">
                  <div className="flex items-end gap-2 glass rounded-xl border border-white/10 px-3 py-2">
                    <textarea value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                      placeholder="Ask anything about your studies..." rows={1}
                      className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none py-1 max-h-24"
                      style={{ fieldSizing: 'content' } as React.CSSProperties} />
                    <button onClick={sendChat} disabled={!input.trim() || streaming}
                      className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white disabled:opacity-40 hover:bg-brand-dark transition-colors active:scale-95">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* QUIZ TAB */}
            {tab === 'quiz' && (
              <div className="space-y-6">
                <GlassCard hover={false}>
                  <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-light" /> Quiz Generator
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input value={quizTopic} onChange={e => setQuizTopic(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleGenQuiz()}
                      placeholder="Enter topic (e.g. 'Binary Trees', 'Calculus derivatives')"
                      className="flex-1 bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/40 transition-colors" />
                    <select value={quizDifficulty} onChange={e => setQuizDifficulty(e.target.value)}
                      className="bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand/40">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                    <Button onClick={handleGenQuiz} loading={quizLoading} disabled={!quizTopic} className="flex-shrink-0">Generate</Button>
                  </div>
                </GlassCard>

                {quizLoading && (
                  <div className="space-y-3">{Array.from({length: 3}).map((_,i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
                )}

                {quizQuestions.length > 0 && !quizLoading && (
                  <div className="space-y-4">
                    {quizQuestions.map((q, qi) => (
                      <GlassCard key={qi} hover={false}>
                        <div className="flex items-start gap-3 mb-4">
                          <span className="w-7 h-7 rounded-lg bg-brand/10 text-brand-light text-xs font-bold flex items-center justify-center flex-shrink-0">{qi+1}</span>
                          <p className="text-sm font-medium text-text-primary leading-relaxed">{q.question}</p>
                        </div>
                        <div className="space-y-2 ml-10">
                          {q.options.map((opt, oi) => {
                            const letter = ['A','B','C','D'][oi];
                            const selected = selectedAnswers[qi] === letter;
                            const correct = quizRevealed && letter === q.answer;
                            const wrong = quizRevealed && selected && letter !== q.answer;
                            return (
                              <button key={oi} onClick={() => !quizRevealed && setSelectedAnswers(a => ({...a, [qi]: letter}))}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all ${
                                  correct ? 'bg-accent-emerald/10 border-accent-emerald/40 text-accent-emerald' :
                                  wrong ? 'bg-accent-rose/10 border-accent-rose/40 text-accent-rose' :
                                  selected ? 'bg-brand/10 border-brand/40 text-brand-light' :
                                  'glass border-surface-border text-text-secondary hover:border-brand/30'
                                }`}>
                                <span className="font-medium mr-2">{letter}.</span>{opt}
                                {correct && <Check className="w-3.5 h-3.5 inline ml-2" />}
                                {wrong && <X className="w-3.5 h-3.5 inline ml-2" />}
                              </button>
                            );
                          })}
                        </div>
                        {quizRevealed && (
                          <div className="ml-10 mt-3 p-3 bg-brand/5 border border-brand/10 rounded-xl">
                            <p className="text-xs text-text-secondary">{q.explanation}</p>
                          </div>
                        )}
                      </GlassCard>
                    ))}
                    <div className="flex gap-3">
                      <Button onClick={() => setQuizRevealed(true)} disabled={quizRevealed} variant="glass">Reveal Answers</Button>
                      <Button onClick={() => { setQuizQuestions([]); setSelectedAnswers({}); setQuizRevealed(false); }} variant="secondary">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FLASHCARDS TAB */}
            {tab === 'flashcards' && (
              <div className="space-y-6">
                <GlassCard hover={false}>
                  <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-accent-purple" /> Flashcard Generator
                  </h2>
                  <div className="flex gap-4">
                    <input value={flashTopic} onChange={e => setFlashTopic(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleGenFlash()}
                      placeholder="Topic to generate flashcards for..."
                      className="flex-1 bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/40 transition-colors" />
                    <Button onClick={handleGenFlash} loading={flashLoading} disabled={!flashTopic}>Generate</Button>
                  </div>
                  <p className="text-xs text-text-muted mt-2">Click any card to flip it and reveal the answer</p>
                </GlassCard>
                {flashLoading && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-48 rounded-2xl" />)}</div>}
                {flashCards.length > 0 && !flashLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {flashCards.map((c, i) => <FlipCard key={i} card={c} />)}
                  </div>
                )}
              </div>
            )}

            {/* SUMMARIZE TAB */}
            {tab === 'summarize' && (
              <div className="space-y-6">
                <GlassCard hover={false}>
                  <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-accent-cyan" /> Note Summarizer
                  </h2>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={8}
                    placeholder="Paste your lecture notes, textbook sections, or any study material here..."
                    className="w-full bg-surface-card border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/40 resize-none transition-colors" />
                  <Button onClick={handleSummarize} loading={sumLoading} disabled={!notes} className="mt-4">
                    Summarize notes
                  </Button>
                </GlassCard>
                {sumLoading && <Skeleton className="h-64 rounded-2xl" />}
                {summary && !sumLoading && (
                  <GlassCard hover={false} className="prose prose-sm prose-invert max-w-none">
                    <pre className="text-text-primary text-sm whitespace-pre-wrap font-sans leading-relaxed">{summary}</pre>
                  </GlassCard>
                )}
              </div>
            )}

            {/* EXPLAIN TAB */}
            {tab === 'explain' && (
              <div className="space-y-6">
                <GlassCard hover={false}>
                  <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-accent-amber" /> Concept Explainer
                  </h2>
                  <div className="flex gap-4">
                    <input value={concept} onChange={e => setConcept(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleExplain()}
                      placeholder="e.g. 'Gradient descent', 'Bayes theorem', 'Polymorphism'"
                      className="flex-1 bg-surface-card border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/40 transition-colors" />
                    <Button onClick={handleExplain} loading={expLoading} disabled={!concept}>Explain</Button>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {['Big-O Notation', 'Recursion', 'SQL Joins', 'Eigenvalues', 'SOLID Principles'].map(s => (
                      <button key={s} onClick={() => setConcept(s)} className="glass px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-secondary hover:border-brand/30 transition-all">
                        {s}
                      </button>
                    ))}
                  </div>
                </GlassCard>
                {expLoading && <Skeleton className="h-48 rounded-2xl" />}
                {explanation && !expLoading && (
                  <GlassCard hover={false}>
                    <pre className="text-text-primary text-sm whitespace-pre-wrap font-sans leading-relaxed">{explanation}</pre>
                  </GlassCard>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
