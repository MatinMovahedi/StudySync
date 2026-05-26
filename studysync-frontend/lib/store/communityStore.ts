import { create } from 'zustand';

interface CommunityState {
  joinedSlugs: Set<string>;
  setJoined: (slug: string, joined: boolean) => void;
  voteCache: Record<number, 1 | -1 | 0>;
  setVote: (postId: number, value: 1 | -1 | 0) => void;
  commentVoteCache: Record<number, 1 | -1 | 0>;
  setCommentVote: (commentId: number, value: 1 | -1 | 0) => void;
}

export const useCommunityStore = create<CommunityState>((set) => ({
  joinedSlugs: new Set(),
  setJoined: (slug, joined) =>
    set((state) => {
      const next = new Set(state.joinedSlugs);
      joined ? next.add(slug) : next.delete(slug);
      return { joinedSlugs: next };
    }),
  voteCache: {},
  setVote: (postId, value) =>
    set((state) => ({ voteCache: { ...state.voteCache, [postId]: value } })),
  commentVoteCache: {},
  setCommentVote: (commentId, value) =>
    set((state) => ({ commentVoteCache: { ...state.commentVoteCache, [commentId]: value } })),
}));
