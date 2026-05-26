'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Plus, User, Clock, BookOpen, CheckCircle, XCircle, MessageSquare, X } from 'lucide-react';
import {
  getTutorListings, createTutorListing, updateTutorListing, deleteTutorListing,
  requestTutoring, getIncomingRequests, getOutgoingRequests, respondToRequest,
  TutorListing, TutoringRequest,
} from '../../../lib/api/tutoring';
import { GlassCard } from '../../../components/shared/GlassCard';
import { Skeleton } from '../../../components/ui/skeleton';
import { staggerContainer, staggerItem, popIn } from '../../../lib/utils/animations';

const STATUS_COLORS = {
  pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  accepted: 'text-brand bg-brand/10 border-brand/20',
  declined: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
};

function TutorCard({ listing, onRequest }: { listing: TutorListing; onRequest: (id: number) => void }) {
  return (
    <GlassCard className="p-5" hover={false}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center flex-shrink-0">
          {listing.tutor_avatar ? (
            <img src={listing.tutor_avatar} alt={listing.tutor_name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-text-muted" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-text-primary font-semibold">{listing.tutor_name}</h3>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {listing.subjects.map(s => (
              <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">{s}</span>
            ))}
          </div>
          <p className="text-text-muted text-sm mt-2 line-clamp-2">{listing.bio}</p>
          <div className="flex items-center gap-1.5 mt-2 text-text-muted text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{listing.availability}</span>
          </div>
        </div>
        <button
          onClick={() => onRequest(listing.id)}
          className="px-3 py-1.5 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors flex-shrink-0"
        >
          Request
        </button>
      </div>
    </GlassCard>
  );
}

function RequestModal({ listingId, onClose }: { listingId: number; onClose: () => void }) {
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const mutation = useMutation({
    mutationFn: () => requestTutoring(listingId, message),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tutoring-outgoing'] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div variants={popIn} initial="hidden" animate="visible" className="w-full max-w-md">
        <GlassCard className="p-6" hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-text-primary font-semibold">Request Tutoring Session</h2>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-surface-elevated text-text-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <textarea
            className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand resize-none"
            placeholder="Introduce yourself and explain what you need help with..."
            rows={4}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-md border border-surface-border text-text-muted text-sm hover:bg-surface-elevated transition-colors">
              Cancel
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={!message || mutation.isPending}
              className="flex-1 px-4 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand/90 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default function TutoringPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'find' | 'mine'>('find');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [requestTarget, setRequestTarget] = useState<number | null>(null);
  const [showListingForm, setShowListingForm] = useState(false);
  const [listingForm, setListingForm] = useState({ subjects: '', bio: '', availability: '' });

  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['tutoring-listings', subjectFilter],
    queryFn: () => getTutorListings(subjectFilter || undefined),
  });
  const { data: incoming } = useQuery({ queryKey: ['tutoring-incoming'], queryFn: getIncomingRequests, enabled: tab === 'mine' });
  const { data: outgoing } = useQuery({ queryKey: ['tutoring-outgoing'], queryFn: getOutgoingRequests, enabled: tab === 'mine' });

  const createMutation = useMutation({
    mutationFn: () => createTutorListing({
      subjects: listingForm.subjects.split(',').map(s => s.trim()).filter(Boolean),
      bio: listingForm.bio,
      availability: listingForm.availability,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tutoring-listings'] }); setShowListingForm(false); },
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'accepted' | 'declined' }) => respondToRequest(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tutoring-incoming'] }),
  });

  const listings: TutorListing[] = listingsData?.results ?? (Array.isArray(listingsData) ? listingsData : []);
  const incomingList: TutoringRequest[] = incoming?.results ?? (Array.isArray(incoming) ? incoming : []);
  const outgoingList: TutoringRequest[] = outgoing?.results ?? (Array.isArray(outgoing) ? outgoing : []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand/10">
              <GraduationCap className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Peer Tutoring</h1>
              <p className="text-text-muted text-sm">Connect with fellow students for free volunteer tutoring</p>
            </div>
          </div>
          <button
            onClick={() => setShowListingForm(s => !s)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Offer Tutoring
          </button>
        </motion.div>

        <AnimatePresence>
          {showListingForm && (
            <motion.div variants={popIn} initial="hidden" animate="visible" exit="hidden" className="mb-6">
              <GlassCard className="p-5" hover={false}>
                <h3 className="text-text-primary font-medium mb-4">Create Tutor Listing</h3>
                <div className="space-y-3">
                  <input
                    className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
                    placeholder="Subjects (comma-separated, e.g. CS401, MATH201)"
                    value={listingForm.subjects}
                    onChange={e => setListingForm(p => ({ ...p, subjects: e.target.value }))}
                  />
                  <textarea
                    className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand resize-none"
                    placeholder="About you — your experience, teaching style, etc."
                    rows={3}
                    value={listingForm.bio}
                    onChange={e => setListingForm(p => ({ ...p, bio: e.target.value }))}
                  />
                  <input
                    className="w-full bg-surface-elevated border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
                    placeholder="Availability (e.g. Weekday evenings, Saturday mornings)"
                    value={listingForm.availability}
                    onChange={e => setListingForm(p => ({ ...p, availability: e.target.value }))}
                  />
                  <button
                    onClick={() => createMutation.mutate()}
                    disabled={!listingForm.subjects || !listingForm.bio || createMutation.isPending}
                    className="w-full px-4 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand/90 disabled:opacity-50 transition-colors"
                  >
                    {createMutation.isPending ? 'Publishing...' : 'Publish Listing'}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={staggerItem} className="flex gap-1 p-1 bg-surface-elevated rounded-lg mb-6 w-fit">
          {(['find', 'mine'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-brand text-white' : 'text-text-muted hover:text-text-primary'}`}
            >
              {t === 'find' ? 'Find a Tutor' : 'My Listings & Requests'}
            </button>
          ))}
        </motion.div>

        {tab === 'find' && (
          <>
            <motion.div variants={staggerItem} className="mb-4">
              <input
                className="w-full max-w-xs bg-surface-card border border-surface-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand"
                placeholder="Filter by subject..."
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
              />
            </motion.div>
            {listingsLoading ? (
              <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-md" />)}</div>
            ) : listings.length === 0 ? (
              <motion.div variants={staggerItem} className="text-center py-20">
                <div className="text-5xl mb-4">🎓</div>
                <h3 className="text-text-primary font-medium text-lg mb-2">No tutors available</h3>
                <p className="text-text-muted text-sm">Be the first to offer tutoring to your peers</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {listings.map(l => (
                  <motion.div key={l.id} variants={staggerItem}>
                    <TutorCard listing={l} onRequest={setRequestTarget} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'mine' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-text-primary font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Incoming Requests
              </h2>
              {incomingList.length === 0 ? (
                <p className="text-text-muted text-sm">No incoming requests yet</p>
              ) : (
                <div className="space-y-3">
                  {incomingList.map(req => (
                    <GlassCard key={req.id} className="p-4" hover={false}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-text-primary font-medium text-sm">{req.requester_name}</p>
                          <p className="text-text-muted text-sm mt-1">{req.message}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {req.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => respondMutation.mutate({ id: req.id, status: 'accepted' })}
                                className="p-1.5 rounded-md bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => respondMutation.mutate({ id: req.id, status: 'declined' })}
                                className="p-1.5 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_COLORS[req.status]}`}>{req.status}</span>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-text-primary font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                My Requests
              </h2>
              {outgoingList.length === 0 ? (
                <p className="text-text-muted text-sm">You haven&apos;t sent any requests yet</p>
              ) : (
                <div className="space-y-3">
                  {outgoingList.map(req => (
                    <GlassCard key={req.id} className="p-4" hover={false}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-text-primary font-medium text-sm">To: {req.tutor_name}</p>
                          <p className="text-text-muted text-sm mt-0.5 line-clamp-1">{req.message}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${STATUS_COLORS[req.status]}`}>{req.status}</span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {requestTarget !== null && (
          <RequestModal listingId={requestTarget} onClose={() => setRequestTarget(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
