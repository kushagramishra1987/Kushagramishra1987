import React from 'react';
import { PopUpService } from '../types';
import { MapPin, Star, Clock, ChevronRight, Heart } from 'lucide-react';
import { formatDistance } from '../utils/geo';

interface ServiceCardProps {
  service: PopUpService;
  onSelect: (service: PopUpService) => void;
  onBook: (service: PopUpService) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (serviceId: string) => void;
  onSelectProviderProfile?: (providerId: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onSelect,
  onBook,
  isFavorite = false,
  onToggleFavorite,
  onSelectProviderProfile,
}) => {
  return (
    <div className="group flex flex-col bg-white rounded-xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative">
      {/* 4:3 Image Container with Resilient Fallback */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden cursor-pointer" onClick={() => onSelect(service)}>
        <img
          src={service.imageUrl}
          alt={service.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          onError={(e) => {
            // Resilient fallback styling container
            e.currentTarget.style.display = 'none';
          }}
        />
        
        {/* Subtle Live Now or Limited tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {service.isLiveNow ? (
            <span className="bg-stone-900/90 text-amber-300 text-xs px-2.5 py-1 rounded-md backdrop-blur-xs font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Chalu Hai (Live)
            </span>
          ) : (
            <span className="bg-white/90 text-stone-700 text-xs px-2.5 py-1 rounded-md backdrop-blur-xs font-medium border border-stone-200">
              {service.dateLabel}
            </span>
          )}

          {service.distanceKm !== undefined && service.distanceKm <= 1.0 && (
            <span className="bg-emerald-950/90 text-emerald-300 text-xs px-2.5 py-1 rounded-md backdrop-blur-xs font-semibold border border-emerald-700/60">
              Within 1km
            </span>
          )}
        </div>

        {/* Favorite Heart Toggle Button */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(service.id);
            }}
            aria-label={isFavorite ? `Remove ${service.title} from favorites` : `Add ${service.title} to favorites`}
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-150 z-20 cursor-pointer shadow-sm ${
              isFavorite
                ? 'bg-white text-rose-600 ring-2 ring-rose-500/20 scale-105'
                : 'bg-stone-900/40 text-white hover:bg-white hover:text-rose-600 hover:scale-105'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-150 ${
                isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'text-current'
              }`}
            />
          </button>
        )}

        <div className="absolute bottom-3 right-3 bg-stone-900/90 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-xs tabular-nums font-bold z-10 flex items-center gap-1">
          <span>₹{service.price}</span>
          <span className="font-normal text-stone-300 text-[10px]">/{service.priceUnit ? service.priceUnit.replace('per ', '') : 'spot'}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Zero-Pill Quiet Inline Metadata */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5 flex-wrap">
            <span className="font-medium text-stone-700">{service.category}</span>
            <span aria-hidden="true">·</span>
            <span>{service.neighborhood}</span>
            {service.distanceKm !== undefined && (
              <>
                <span aria-hidden="true">·</span>
                <span className={service.distanceKm <= 1 ? 'font-semibold text-emerald-800' : 'text-stone-600'}>
                  {formatDistance(service.distanceKm)}
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className={service.remainingSpots <= 2 ? 'text-amber-700 font-medium' : 'text-stone-600'}>
              {service.remainingSpots} of {service.totalSpots} spots left
            </span>
          </div>

          {/* Service Title */}
          <h3
            onClick={() => onSelect(service)}
            className="text-base font-semibold text-stone-900 leading-snug line-clamp-2 hover:text-amber-900 cursor-pointer transition-colors"
          >
            {service.title}
          </h3>

          <p className="text-xs text-stone-600 line-clamp-2 mt-1.5 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Location & Time Snippet */}
        <div className="mt-3.5 pt-3 border-t border-stone-100 flex flex-col gap-1.5 text-xs text-stone-500">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{service.locationName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>{service.startTime} – {service.endTime}</span>
          </div>
        </div>

        {/* Provider Footer & Action with direct profile link */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
          <div
            onClick={(e) => {
              if (onSelectProviderProfile) {
                e.stopPropagation();
                onSelectProviderProfile(service.providerId);
              }
            }}
            className={`flex items-center gap-2 min-w-0 ${
              onSelectProviderProfile ? 'cursor-pointer group/prov' : ''
            }`}
            title="Click to view Provider Profile, Reviews & Stars"
          >
            <img
              src={service.providerAvatar}
              alt={service.providerName}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover border border-stone-200 shrink-0 group-hover/prov:ring-2 group-hover/prov:ring-amber-500 transition-all"
            />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-stone-900 block truncate group-hover/prov:text-amber-900 transition-colors">
                {service.providerName}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-stone-500">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span className="tabular-nums font-bold text-stone-800">{service.providerRating.toFixed(2)}</span>
                <span className="text-[10px] text-amber-900 font-medium hidden sm:inline">· View Profile</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onBook(service)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1 shrink-0"
          >
            Book Spot
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
