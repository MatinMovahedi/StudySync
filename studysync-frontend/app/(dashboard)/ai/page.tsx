'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Sparkles, BookOpen, Layers, FileText, Lightbulb, RotateCcw, Check, X, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { GlassCard } from '../../../components/shared/GlassCard';
import { Skeleton } from '../../../components/ui/skeleton';
import { streamAIChat, generateQuiz, generateFlashcards, summarizeNotes, explainConcept, deleteFlashcard, reviewFlashcard } from '../../../lib/api/ai';
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

const INPUT_CLASS = 'bg-surface-card border border-surface-border rounded-md px-3 h-9 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors';

function FlipCard({ card, onDelete }: { card: FlashCard; onDelete: () => void }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="relative h-48 group/card" style={{ perspective: 1000 }}>
      <div className="cursor-pointer absolute inset-0" onClick={() => setFlipped(f => !f)}>
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <div className="absolute inset-0 bg-surface-card border border-surface-border rounded-md flex flex-col items-center justify-center p-6 text-center" style={{ backfaceVisibility: 'hidden' }}>
            <div className="text-[10px] text-text-muted uppercase tracking-wider mb-3">Question</div>
            <p className="text-text-primary font-medium text-sm">{card.front}</p>
            <div className="mt-4 text-xs text-text-muted">Click to reveal answer</div>
          </div>
          <div className="absolute inset-0 bg-emerald-950/40 border border-emerald-700/40 rounded-md flex flex-col items-center justify-center p-6 text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="text-[10px] text-brand uppercase tracking-wider mb-3">Answer</div>
            <p className="text-text-primary text-sm">{card.back}</p>
          </div>
        </motion.div>
      </div>
      <button
        type="button"
        aria-label="Delete flashcard"
        onClick={onDelete}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center text-text-muted hover:text-rose-400 rounded-md hover:bg-surface-elevated"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ReviewMode({ cards, onExit }: { cards: FlashCard[]; onExit: () => void }) {
  const [queue, setQueue] = useState([...cards]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState(0);

  const total = cards.length;
  const card = queue[current];

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Review Complete!</h2>
        <p className="text-text-muted mb-6">You mastered {mastered} of {total} cards</p>
        <button type="button" onClick={onExit} className="px-6 py-2 bg-brand text-white rounded-md hover:bg-brand-dark transition-colors text-sm font-medium">
          Back to Flashcards
        </button>
      </div>
    );
  }

  const handleGotIt = () => {
    reviewFlashcard(card.id).catch(() => {});
    setMastered(m => m + 1);
    setFlipped(false);
    const newQueue = queue.filter((_, i) => i !== current);
    setQueue(newQueue);
    setCurrent(c => (newQueue.length > 0 ? c % newQueue.length : 0));
  };

  const handleTryAgain = () => {
    setFlipped(false);
    const newQueue = [...queue.filter((_, i) => i !== current), card];
    setQueue(newQueue);
    setCurrent(c => c >= queue.length - 1 ? 0 : c);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onExit} className="text-xs text-text-muted hover:text-text-secondary transition-colors">
          ← Back to cards
        </button>
        <span className="text-xs text-text-muted">{mastered}/{total} mastered · {queue.length} remaining</span>
      </div>
      <div className="w-full bg-surface-elevated rounded-full h-1">
        <div className="bg-brand h-1 rounded-full transition-all duration-500" style={{ width: `${(mastered / total) * 100}%` }} />
      </div>

      <div className="relative h-64 cursor-pointer" style={{ perspective: 1000 }} onClick={() => setFlipped(f => !f)}>
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        >
          <div className="absolute inset-0 bg-surface-card border border-surface-border rounded-md flex flex-col items-center justify-center p-8 text-center" style={{ backfaceVisibility: 'hidden' }}>
            <div className="text-[10px] text-text-muted uppercase tracking-wider mb-4">Question</div>
            <p className="text-text-primary font-medium">{card.front}</p>
            <div className="mt-6 text-xs text-text-muted">Click to reveal answer</div>
          </div>
          <div className="absolute inset-0 bg-emerald-950/40 border border-emerald-700/40 rounded-md flex flex-col items-center justify-center p-8 text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="text-[10px] text-brand uppercase tracking-wider mb-4">Answer</div>
            <p className="text-text-primary">{card.back}</p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex gap-3"
          >
            <button
              type="button"
              onClick={handleTryAgain}
              className="flex-1 py-3 rounded-md border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors font-medium text-sm"
            >
              ✗ Try again
            </button>
            <button
              type="button"
              onClick={handleGotIt}
              className="flex-1 py-3 rounded-md bg-brand text-white hover:bg-brand-dark transition-colors font-medium text-sm"
            >
              ✓ Got it
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [reviewMode, setReviewMode] = useState(false);

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
        <motion.div variants={staggerItem} className="mb-7">
          <p className="text-xs text-text-muted mb-1">Tools</p>
          <h1 className="text-2xl font-semibold text-text-primary">AI Study Assistant</h1>
          <p className="text-text-muted text-xs mt-1">Quiz generation, flashcards, summaries, and explanations.</p>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={staggerItem} className="flex gap-2 flex-wrap mb-6">
          {TABS.map(t => (
            <button type="button" key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 h-8 px-3 rounded-md text-sm font-medium border transition-colors ${
                tab === t.id
                  ? 'bg-emerald-950/40 border-brand/30 text-brand'
                  : 'bg-surface-card border-surface-border text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
              }`}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            {/* CHAT TAB */}
            {tab === 'chat' && (
              <div className="bg-surface-card border border-surface-border rounded-md overflow-hidden flex flex-col" style={{ height: 560 }}>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-text-primary">StudySynch AI</span>
                  <Badge variant="emerald" className="text-[10px]">Online</Badge>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  {messages.length === 0 && !streaming && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                      <div className="w-10 h-10 rounded-md bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center mb-4">
                        <Brain className="w-5 h-5 text-brand" />
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary mb-1">How can I help you study today?</h3>
                      <p className="text-text-muted text-xs max-w-sm">Ask me to explain concepts, help with assignments, or discuss study strategies.</p>
                      <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        {['Explain recursion', 'What is Big-O notation?', 'Help with calculus', 'Study tips for exams'].map(s => (
                          <button type="button" key={s} onClick={() => setInput(s)}
                            className="border border-surface-border rounded-md px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-md bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center flex-shrink-0 mt-1">
                          <Brain className="w-3.5 h-3.5 text-brand" />
                        </div>
                      )}
                      <div className={`max-w-[75%] rounded-md px-4 py-3 text-sm whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-brand text-white'
                          : 'bg-surface-elevated text-text-primary'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {streaming && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-7 h-7 rounded-md bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center flex-shrink-0 mt-1">
                        <Brain className="w-3.5 h-3.5 text-brand" />
                      </div>
                      <div className="max-w-[75%] rounded-md px-4 py-3 text-sm bg-surface-elevated text-text-primary whitespace-pre-wrap">
                        {currentResponse || (
                          <div className="flex gap-1.5 items-center">
                            {[0,1,2].map(i => (
                              <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-text-muted"
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                            ))}
                          </div>
                        )}
                        {currentResponse && <span className="inline-block w-0.5 h-4 bg-brand ml-0.5 animate-pulse" />}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-surface-border">
                  <div className="flex items-end gap-2 bg-surface-card border border-surface-border rounded-md px-3 py-2 focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/20 transition-colors">
                    <textarea value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                      placeholder="Ask anything about your studies..." rows={1}
                      className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none py-1 max-h-24"
                      style={{ fieldSizing: 'content' } as React.CSSProperties} />
                    <button type="button" onClick={sendChat} disabled={!input.trim() || streaming}
                      className="w-7 h-7 rounded-md bg-brand flex items-center justify-center text-white disabled:opacity-40 hover:bg-brand-dark transition-colors">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* QUIZ TAB */}
            {tab === 'quiz' && (
              <div className="space-y-5">
                <div className="bg-surface-card border border-surface-border rounded-md p-5">
                  <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand" /> Quiz Generator
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input value={quizTopic} onChange={e => setQuizTopic(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleGenQuiz()}
                      placeholder="Topic (e.g. 'Binary Trees', 'Calculus derivatives')"
                      className={`flex-1 ${INPUT_CLASS}`} />
                    <select value={quizDifficulty} onChange={e => setQuizDifficulty(e.target.value)}
                      aria-label="Quiz difficulty"
                      className="bg-surface-card border border-surface-border rounded-md px-3 h-9 text-sm text-text-primary focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                    <Button onClick={handleGenQuiz} loading={quizLoading} disabled={!quizTopic} className="flex-shrink-0">Generate</Button>
                  </div>
                </div>

                {quizLoading && (
                  <div className="space-y-3">{Array.from({length: 3}).map((_,i) => <Skeleton key={i} className="h-28" />)}</div>
                )}

                {quizQuestions.length > 0 && !quizLoading && (
                  <div className="space-y-3">
                    {quizQuestions.map((q, qi) => (
                      <div key={qi} className="bg-surface-card border border-surface-border rounded-md p-5">
                        <div className="flex items-start gap-3 mb-4">
                          <span className="w-6 h-6 rounded-md bg-emerald-950/40 text-brand text-xs font-bold flex items-center justify-center flex-shrink-0">{qi+1}</span>
                          <p className="text-sm font-medium text-text-primary leading-relaxed">{q.question}</p>
                        </div>
                        <div className="space-y-2 ml-9">
                          {q.options.map((opt, oi) => {
                            const letter = ['A','B','C','D'][oi];
                            const selected = selectedAnswers[qi] === letter;
                            const correct = quizRevealed && letter === q.answer;
                            const wrong = quizRevealed && selected && letter !== q.answer;
                            return (
                              <button type="button" key={oi} onClick={() => !quizRevealed && setSelectedAnswers(a => ({...a, [qi]: letter}))}
                                className={`w-full text-left px-4 py-2.5 rounded-md text-sm border transition-colors ${
                                  correct ? 'quiz-correct' :
                                  wrong ? 'quiz-wrong' :
                                  selected ? 'theme-emerald' :
                                  'bg-surface-card border-surface-border text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
                                }`}>
                                <span className="font-medium mr-2">{letter}.</span>{opt}
                                {correct && <Check className="w-3.5 h-3.5 inline ml-2" />}
                                {wrong && <X className="w-3.5 h-3.5 inline ml-2" />}
                              </button>
                            );
                          })}
                        </div>
                        {quizRevealed && (
                          <div className="ml-9 mt-3 p-3 bg-surface border border-surface-border rounded-md">
                            <p className="text-xs text-text-secondary">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-3">
                      <Button onClick={() => setQuizRevealed(true)} disabled={quizRevealed} variant="secondary">Reveal Answers</Button>
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
              <div className="space-y-5">
                {reviewMode && flashCards.length > 0 ? (
                  <ReviewMode cards={flashCards} onExit={() => setReviewMode(false)} />
                ) : (
                  <>
                    <div className="bg-surface-card border border-surface-border rounded-md p-5">
                      <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-text-secondary" /> Flashcard Generator
                      </h2>
                      <div className="flex gap-3">
                        <input value={flashTopic} onChange={e => setFlashTopic(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleGenFlash()}
                          placeholder="Topic to generate flashcards for..."
                          className={`flex-1 ${INPUT_CLASS}`} />
                        <Button onClick={handleGenFlash} loading={flashLoading} disabled={!flashTopic}>Generate</Button>
                        {flashCards.length > 0 && (
                          <Button variant="secondary" onClick={() => setReviewMode(true)}>Review</Button>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-2">Click any card to flip and reveal the answer</p>
                    </div>
                    {flashLoading && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-48" />)}</div>}
                    {flashCards.length > 0 && !flashLoading && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {flashCards.map((c) => (
                          <FlipCard
                            key={c.id}
                            card={c}
                            onDelete={() => {
                              deleteFlashcard(c.id).then(() =>
                                setFlashCards(prev => prev.filter(f => f.id !== c.id))
                              ).catch(() => {});
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* SUMMARIZE TAB */}
            {tab === 'summarize' && (
              <div className="space-y-5">
                <div className="bg-surface-card border border-surface-border rounded-md p-5">
                  <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-text-secondary" /> Note Summarizer
                  </h2>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={8}
                    placeholder="Paste your lecture notes, textbook sections, or any study material here..."
                    className="w-full bg-surface-card border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 resize-none transition-colors" />
                  <Button onClick={handleSummarize} loading={sumLoading} disabled={!notes} className="mt-3">
                    Summarize notes
                  </Button>
                </div>
                {sumLoading && <Skeleton className="h-64" />}
                {summary && !sumLoading && (
                  <div className="bg-surface-card border border-surface-border rounded-md p-5">
                    <pre className="text-text-primary text-sm whitespace-pre-wrap font-sans leading-relaxed">{summary}</pre>
                  </div>
                )}
              </div>
            )}

            {/* EXPLAIN TAB */}
            {tab === 'explain' && (
              <div className="space-y-5">
                <div className="bg-surface-card border border-surface-border rounded-md p-5">
                  <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Concept Explainer
                  </h2>
                  <div className="flex gap-3">
                    <input value={concept} onChange={e => setConcept(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleExplain()}
                      placeholder="e.g. 'Gradient descent', 'Bayes theorem', 'Polymorphism'"
                      className={`flex-1 ${INPUT_CLASS}`} />
                    <Button onClick={handleExplain} loading={expLoading} disabled={!concept}>Explain</Button>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {['Big-O Notation', 'Recursion', 'SQL Joins', 'Eigenvalues', 'SOLID Principles'].map(s => (
                      <button type="button" key={s} onClick={() => setConcept(s)}
                        className="border border-surface-border rounded-md px-3 py-1.5 text-xs text-text-muted hover:bg-surface-elevated hover:text-text-secondary transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {expLoading && <Skeleton className="h-48" />}
                {explanation && !expLoading && (
                  <div className="bg-surface-card border border-surface-border rounded-md p-5">
                    <pre className="text-text-primary text-sm whitespace-pre-wrap font-sans leading-relaxed">{explanation}</pre>
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
