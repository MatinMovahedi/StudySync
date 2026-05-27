'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Users, Clock, Wifi, Coffee, Monitor, List, Map } from 'lucide-react';
import { getSpots } from '../../../lib/api/campus';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { staggerContainer, staggerItem } from '../../../lib/utils/animations';
import { StudySpot } from '../../../lib/types';

const SpotMap = dynamic(() => import('../../../components/shared/SpotMap'), { ssr: false, loading: () => <div className="h-96 rounded-md bg-surface-elevated animate-pulse" /> });

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  wifi: Wifi,
  coffee: Coffee,
  computers: Monitor,
};

const NOISE_VARIANT: Record<string, 'default' | 'muted' | 'amber'> = {
  silent: 'default',
  quiet: 'muted',
  moderate: 'amber',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="tabular-nums text-xs text-amber-500 font-medium">
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))} {rating.toFixed(1)}
    </span>
  );
}

export default function SpotsPage() {
  const { data: spots, isLoading } = useQuery({ queryKey: ['spots'], queryFn: getSpots });
  const list: StudySpot[] = spots ?? [];
  const [view, setView] = useState<'list' | 'map'>('list');
  const mappable = list.filter(s => s.latitude != null && s.longitude != null);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem} className="flex items-center justify-between mb-7">
          <div>
            <p className="text-xs text-text-muted mb-1">Campus</p>
            <h1 className="text-2xl font-semibold text-text-primary">Study Spots</h1>
            <p className="text-text-muted text-xs mt-1">Find the perfect place to focus on campus</p>
          </div>

          {!isLoading && list.length > 0 && (
            <div className="flex items-center border border-surface-border rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => setView('list')}
                className={`flex items-center gap-1.5 px-3 h-8 text-xs font-medium transition-colors ${view === 'list' ? 'bg-brand text-white' : 'text-text-muted hover:text-text-secondary hover:bg-surface-elevated'}`}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
              <button
                type="button"
                onClick={() => setView('map')}
                disabled={mappable.length === 0}
                className={`flex items-center gap-1.5 px-3 h-8 text-xs font-medium transition-colors disabled:opacity-40 ${view === 'map' ? 'bg-brand text-white' : 'text-text-muted hover:text-text-secondary hover:bg-surface-elevated'}`}
              >
                <Map className="w-3.5 h-3.5" />
                Map
              </button>
            </div>
          )}
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-md" />)}
          </div>
        ) : list.length === 0 ? (
          <div className="border border-surface-border rounded-md py-16 text-center bg-surface-card">
            <MapPin className="w-6 h-6 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">No study spots listed yet</p>
          </div>
        ) : view === 'map' ? (
          <motion.div variants={staggerItem}>
            <SpotMap spots={mappable} />
          </motion.div>
        ) : (
          <motion.div
            className="border border-surface-border rounded-md overflow-hidden divide-y divide-surface-border"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {list.map((spot) => (
              <motion.div
                key={spot.id}
                variants={staggerItem}
                className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 bg-surface-card hover:bg-surface-elevated transition-colors"
              >
                <div className="w-9 h-9 rounded-md bg-surface-elevated flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-text-muted" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-text-primary">{spot.name}</span>
                    {spot.is_open_24h && (
                      <Badge variant="default" className="text-[10px]">24h</Badge>
                    )}
                    {spot.noise_level && (
                      <Badge variant={NOISE_VARIANT[spot.noise_level] ?? 'muted'} className="text-[10px] capitalize">
                        {spot.noise_level}
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {spot.location}
                  </div>

                  {spot.amenities?.length > 0 && (
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {spot.amenities.slice(0, 5).map((a) => {
                        const Icon = AMENITY_ICONS[a.toLowerCase()];
                        return (
                          <span key={a} className="flex items-center gap-1 text-[11px] text-text-muted">
                            {Icon && <Icon className="w-3 h-3" />}
                            {a}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 flex-shrink-0">
                  <StarRating rating={spot.rating} />
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Users className="w-3 h-3" />
                    {spot.capacity}
                  </div>
                  {spot.hours && !spot.is_open_24h && (
                    <div className="flex items-center gap-1 text-[11px] text-text-muted">
                      <Clock className="w-3 h-3" />
                      {spot.hours}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
