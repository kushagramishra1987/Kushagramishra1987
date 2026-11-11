import React from 'react';
import { PopUpService, Provider } from '../types';
import { X, MapPin, Clock, Star, ShieldCheck, CheckCircle2, ChevronRight, Calendar, User, Heart } from 'lucide-react';

interface ServiceDetailModalProps {
  service: PopUpService | null;
  provider: Provider | undefined;
  onClose: () => void;
  onBook: (service: PopUpService) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (serviceId: string) => void;
  onViewProviderProfile?: (providerId: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  provider,
  onClose,
  onBook,
  isFavorite = false,
  onToggleFavorite,
  onViewProviderProfile,
}) => {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="font-semibold text-stone-900">{service.category}</span>
            <span aria-hidden="true">·</span>
            <span>{service.neighborhood}</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-800 font-semibold">{service.remainingSpots} spots open</span>
          </div>
          
          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(service.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isFavorite
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900 hover:bg-stone-50'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                <span>{isFavorite ? 'Saved' : 'Save'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Main Visual */}
          <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-100">
            <img
              src={service.imageUrl}
              alt={service.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>{service.dateLabel} ({service.startTime} – {service.endTime})</span>
            </div>
            <div className="absolute bottom-3 right-3 bg-stone-900/90 text-white text-sm font-bold px-3 py-1.5 rounded-lg tabular-nums flex items-center gap-1">
              <span>₹{service.price}</span>
              <span className="text-xs font-normal text-stone-300">/ {service.priceUnit}</span>
            </div>
          </div>

          {/* Title & Overview */}
          <div>
            <h2 className="text-2xl font-bold text-stone-900 font-display leading-tight">
              {service.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-stone-500 mt-2">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-medium text-stone-800">{service.locationName}</span>
              <span aria-hidden="true">·</span>
              <span>{service.address}</span>
            </div>
          </div>

          <p className="text-sm text-stone-700 leading-relaxed">
            {service.description}
          </p>

          {/* What's Included & Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
              <span className="font-semibold text-stone-900 block mb-2">What Pro Provides:</span>
              <ul className="space-y-1.5 text-stone-600">
                {service.includedItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
              <span className="font-semibold text-stone-900 block mb-2">What to Bring / Requirements:</span>
              <ul className="space-y-1.5 text-stone-600">
                {service.clientRequirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-stone-400 font-bold">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* About the Artisan Profile Card */}
          {provider && (
            <div className="p-5 rounded-2xl border border-stone-200 bg-white shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block mb-3">
                Hosted by Verified Local Artisan
              </span>
              <div className="flex items-start gap-4">
                <img
                  src={provider.avatarUrl}
                  alt={provider.businessName}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-stone-900 truncate">
                      {provider.businessName}
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-xs text-stone-500 font-medium">
                    {provider.ownerName} · {provider.yearsInCraft} years in craft · {provider.neighborhood}
                  </p>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {provider.bio}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-stone-500">
                    <div className="flex items-center gap-1 font-semibold text-stone-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{provider.rating.toFixed(2)}</span>
                      <span className="text-stone-400 font-normal">({provider.reviewCount} reviews)</span>
                    </div>
                    {(service.upiId || provider.upiId) && (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
                        UPI: {service.upiId || provider.upiId}
                      </span>
                    )}
                  </div>

                  {onViewProviderProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewProviderProfile(provider.id);
                      }}
                      className="mt-3.5 text-xs font-bold text-amber-900 hover:text-amber-800 hover:underline flex items-center gap-1 group/link"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>View Full Provider Profile, Reviews ({provider.reviewCount}) & Star Breakdown</span>
                      <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer Bar with Primary CTA */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between gap-4 sticky bottom-0">
          <div>
            <span className="text-xs text-stone-500 block">Spot Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-stone-900 tabular-nums">
                ₹{service.price}
              </span>
              <span className="text-xs text-stone-500">/ {service.priceUnit}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onBook(service);
              }}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>Reserve Your Time Slot</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
