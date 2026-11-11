import React from 'react';
import { PopUpService } from '../types';
import { ServiceCard } from './ServiceCard';
import { Heart, ChevronRight, Sparkles, Navigation, Trash2, MapPin } from 'lucide-react';

interface MyFavoritesProps {
  favoriteServices: PopUpService[];
  favoriteIds: string[];
  onToggleFavorite: (serviceId: string) => void;
  onClearAllFavorites: () => void;
  onSelectService: (service: PopUpService) => void;
  onBookService: (service: PopUpService) => void;
  onExplorePopups: () => void;
}

export const MyFavorites: React.FC<MyFavoritesProps> = ({
  favoriteServices,
  favoriteIds,
  onToggleFavorite,
  onClearAllFavorites,
  onSelectService,
  onBookService,
  onExplorePopups,
}) => {
  const within1KmCount = favoriteServices.filter(
    (s) => s.distanceKm !== undefined && s.distanceKm <= 1.0
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-600">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-stone-900 font-display">
                  My Saved Pop-ups
                </h2>
                <span className="bg-rose-50 text-rose-700 text-xs font-semibold font-mono px-2.5 py-0.5 rounded-full border border-rose-200">
                  {favoriteServices.length} {favoriteServices.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Saved craftspeople and pop-up workshops for fast booking and neighborhood tracking.
              </p>
            </div>
          </div>
        </div>

        {favoriteServices.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExplorePopups}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:border-stone-400 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Explore More</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Remove all saved pop-ups from your favorites?')) {
                  onClearAllFavorites();
                }
              }}
              className="px-3 py-2 text-xs font-medium text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
              title="Clear all saved favorites"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* 1km Walking Radar Context Strip */}
      {favoriteServices.length > 0 && within1KmCount > 0 && (
        <div className="mt-4 px-4 py-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong className="font-semibold">{within1KmCount}</strong> of your saved {within1KmCount === 1 ? 'pop-up is' : 'pop-ups are'} currently within <strong className="font-semibold">1km</strong> walking range of your GPS location!
            </span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md hidden sm:inline">
            Walking distance
          </span>
        </div>
      )}

      {/* Content Area */}
      <div className="mt-6">
        {favoriteServices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs my-4 max-w-xl mx-auto">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 fill-rose-100 text-rose-500" />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-display">
              No saved pop-up services yet
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1.5 leading-relaxed">
              When exploring local blade sharpeners, botanical clinics, bicycle tune-ups, and artisan coffee roasters, tap the heart icon on any card to save them here for quick access.
            </p>

            <button
              type="button"
              onClick={onExplorePopups}
              className="mt-6 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs inline-flex items-center gap-2 hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Explore Active Pop-ups</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {favoriteServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isFavorite={favoriteIds.includes(service.id)}
                onToggleFavorite={onToggleFavorite}
                onSelect={(s) => onSelectService(s)}
                onBook={(s) => onBookService(s)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
