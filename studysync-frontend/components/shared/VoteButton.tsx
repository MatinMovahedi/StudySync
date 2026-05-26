'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { votePost, voteComment } from '../../lib/api/communities';

interface VoteButtonProps {
  id: number;
  score: number;
  userVote: 1 | -1 | 0;
  type: 'post' | 'comment';
  onVoteChange?: (newScore: number, newVote: 1 | -1 | 0) => void;
}

export function VoteButton({ id, score: initialScore, userVote: initialVote, type, onVoteChange }: VoteButtonProps) {
  const [score, setScore] = useState(initialScore);
  const [vote, setVote] = useState<1 | -1 | 0>(initialVote);
  const [bump, setBump] = useState(0);

  const mutation = useMutation({
    mutationFn: (value: 1 | -1 | 0) =>
      type === 'post' ? votePost(id, value) : voteComment(id, value),
    onSuccess: (data) => {
      const newScore = data.score ?? score;
      setScore(newScore);
      onVoteChange?.(newScore, vote);
    },
    onError: () => {
      setScore(initialScore);
      setVote(initialVote);
    },
  });

  const handleVote = (value: 1 | -1) => {
    const next: 1 | -1 | 0 = vote === value ? 0 : value;
    const delta = next - vote;
    setScore(s => s + delta);
    setVote(next);
    setBump(b => b + 1);
    mutation.mutate(next);
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <motion.button
        key={`up-${bump}`}
        animate={vote === 1 ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.2 }}
        onClick={() => handleVote(1)}
        className={`p-1 rounded transition-colors ${vote === 1 ? 'text-brand' : 'text-text-muted hover:text-text-secondary'}`}
        aria-label="Upvote"
      >
        <ChevronUp className="w-4 h-4" />
      </motion.button>

      <span className={`text-xs font-semibold tabular-nums leading-none ${
        vote === 1 ? 'text-brand' : vote === -1 ? 'text-rose-400' : 'text-text-secondary'
      }`}>
        {score}
      </span>

      <motion.button
        key={`down-${bump}`}
        animate={vote === -1 ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.2 }}
        onClick={() => handleVote(-1)}
        className={`p-1 rounded transition-colors ${vote === -1 ? 'text-rose-400' : 'text-text-muted hover:text-text-secondary'}`}
        aria-label="Downvote"
      >
        <ChevronDown className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
