import api from './client';

export const generateQuiz = (topic: string, difficulty: string, count: number) =>
  api.post('/api/ai/quiz/', { topic, difficulty, count }).then(r => r.data);

export const generateFlashcards = (topic: string, deck_name: string, count: number) =>
  api.post('/api/ai/flashcards/', { topic, deck_name, count }).then(r => r.data);

export const summarizeNotes = (notes: string) =>
  api.post('/api/ai/summarize/', { notes }).then(r => r.data);

export const explainConcept = (concept: string, level: string) =>
  api.post('/api/ai/explain/', { concept, level }).then(r => r.data);

export const getFlashcards = () => api.get('/api/ai/flashcards/list/').then(r => r.data);

export async function streamAIChat(
  messages: { role: string; content: string }[],
  onChunk: (chunk: string) => void,
  onDone: () => void
) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai/chat/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ messages }),
  });
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    const lines = text.split('\n').filter(l => l.startsWith('data: '));
    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') { onDone(); return; }
      try { onChunk(JSON.parse(data).chunk); } catch { /* skip */ }
    }
  }
  onDone();
}
