import React, { useState, useMemo } from 'react';
import { Provider, PopUpService } from '../types';
import {
  Star,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  Sparkles,
  Search,
  CheckCircle2,
  Award,
  ChevronRight,
  Send,
  X,
  CreditCard,
  ThumbsUp,
  Filter,
  LocateFixed,
  ExternalLink,
} from 'lucide-react';
import { addStoredProviderReview } from '../utils/storage';
import { LiveLocationDetails, formatDistance } from '../utils/geo';

interface ProviderProfilesViewProps {
  providers: Provider[];
  services: PopUpService[];
  selectedProviderId?: string | null;
  onSelectProviderId?: (id: string) => void;
  onBookService: (service: PopUpService) => void;
  onSelectServiceDetail: (service: PopUpService) => void;
  onRefreshData: () => void;
  onShowToast: (msg: string) => void;
  externalSearchQuery?: string;
  liveLocationDetails?: LiveLocationDetails;
  rangeKm?: number;
  onlyWithin1Km?: boolean;
  onOpenCorrectLocation?: () => void;
}

export const ProviderProfilesView: React.FC<ProviderProfilesViewProps> = ({
  providers,
  services,
  selectedProviderId,
  onSelectProviderId,
  onBookService,
  onSelectServiceDetail,
  onRefreshData,
  onShowToast,
  externalSearchQuery,
  liveLocationDetails,
  rangeKm = 1.0,
  onlyWithin1Km = true,
  onOpenCorrectLocation,
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string>(
    selectedProviderId || (providers[0]?.id ?? '')
  );
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);

  // Sync external search query from Hero search option
  React.useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Write Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerCity, setReviewerCity] = useState('');
  const [reviewServiceTitle, setReviewServiceTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Sync internal selection if prop changes
  React.useEffect(() => {
    if (selectedProviderId) {
      setInternalSelectedId(selectedProviderId);
    }
  }, [selectedProviderId]);

  const activeProvider = useMemo(() => {
    return providers.find((p) => p.id === internalSelectedId) || providers[0] || null;
  }, [providers, internalSelectedId]);

  const providerServices = useMemo(() => {
    if (!activeProvider) return [];
    return services.filter((s) => s.providerId === activeProvider.id && s.status === 'active');
  }, [services, activeProvider]);

  // Filtered providers list for sidebar/selector
  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      // Must be active
      if (p.isActiveNow === false) return false;
      // 1km live radius filter
      if (onlyWithin1Km && p.distanceKm !== undefined && p.distanceKm > rangeKm) return false;

      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (minRatingFilter > 0 && p.rating < minRatingFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.ownerName.toLowerCase().includes(q) || p.businessName.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchNeigh = p.neighborhood.toLowerCase().includes(q);
        const matchSkill = p.skills?.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchCat && !matchNeigh && !matchSkill) return false;
      }
      return true;
    });
  }, [providers, selectedCategory, minRatingFilter, searchQuery, onlyWithin1Km, rangeKm]);

  const categories = useMemo(() => {
    const set = new Set(providers.map((p) => p.category));
    return ['All', ...Array.from(set)];
  }, [providers]);

  const handleSelectProvider = (id: string) => {
    setInternalSelectedId(id);
    if (onSelectProviderId) onSelectProviderId(id);
  };

  const handleOpenReviewModal = () => {
    if (providerServices.length > 0) {
      setReviewServiceTitle(providerServices[0].title);
    }
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProvider) return;
    if (!reviewerName.trim() || !reviewComment.trim()) {
      onShowToast('Please provide your name and review comments.');
      return;
    }

    setIsSubmittingReview(true);
    const result = addStoredProviderReview(activeProvider.id, {
      authorName: reviewerName.trim(),
      authorCity: reviewerCity.trim() || `${activeProvider.neighborhood}, ${activeProvider.city || 'Bengaluru'}`,
      rating: reviewRating,
      comment: reviewComment.trim(),
      serviceTitle: reviewServiceTitle.trim() || activeProvider.category,
    });

    setIsSubmittingReview(false);
    if (result.success) {
      onShowToast(`Thank you! Your ${reviewRating}-star review for ${activeProvider.ownerName} has been recorded.`);
      setIsReviewModalOpen(false);
      setReviewComment('');
      setReviewerName('');
      onRefreshData();
    } else {
      onShowToast('Failed to save review. Please try again.');
    }
  };

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6">
      {/* 1km Live Radar & Google Tag Location Banner */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white border border-stone-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
              <LocateFixed className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm sm:text-base font-display">
                  Live Radar: Active Service Providers within 1 km
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  <span>1 km Strict Live Radius Filter</span>
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-2.5 flex-wrap text-xs text-stone-300">
                <span className="flex items-center gap-1 font-medium text-white">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Live Location: <strong>{liveLocationDetails?.name || 'Local Area Hub'}</strong></span>
                </span>
                <span className="text-stone-500">·</span>
                {liveLocationDetails && (
                  <a
                    href={liveLocationDetails.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-amber-300 bg-amber-950/70 hover:bg-amber-900/80 px-2.5 py-0.5 rounded-md border border-amber-600/60 transition-colors"
                    title={`Google Plus Code: ${liveLocationDetails.fullPlusCode} (Click to open Google Maps)`}
                  >
                    <span className="font-sans font-semibold text-amber-200">Google Tag:</span>
                    <span className="font-bold text-amber-300">{liveLocationDetails.googleTag}</span>
                    <ExternalLink className="w-3 h-3 text-amber-400" />
                  </a>
                )}
                {liveLocationDetails?.landmark && (
                  <>
                    <span className="text-stone-500">·</span>
                    <span className="text-stone-400">Near {liveLocationDetails.landmark}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onOpenCorrectLocation && (
              <button
                type="button"
                onClick={onOpenCorrectLocation}
                className="text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                title="Location wrong? Click to search or correct spot"
              >
                <MapPin className="w-3.5 h-3.5 text-stone-950" />
                <span>Fix / Correct Location</span>
              </button>
            )}
            <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              <span>{filteredProviders.length} Active Ustads in 1 km</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sub-tab Header Narrative */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>Verified Ustads & Local Service Providers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display">
            Provider Profiles, Reviews & Ratings
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Directly connect with vetted local artisans, review authentic neighbor testimonials, star scores, and reserve dedicated time slots.
          </p>
        </div>

        {/* Quick Search & Star Filter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search provider or craft..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-900 w-44 sm:w-56"
            />
          </div>

          <div className="flex items-center gap-1 bg-white border border-stone-200 p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setMinRatingFilter(0)}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                minRatingFilter === 0 ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Stars
            </button>
            <button
              type="button"
              onClick={() => setMinRatingFilter(4.9)}
              className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${
                minRatingFilter === 4.9 ? 'bg-amber-400 text-stone-950 font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>4.9+ ★</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
              selectedCategory === cat
                ? 'bg-amber-900 text-amber-50 shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main 2-Column Layout: Left Providers List / Right Selected Provider Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Providers List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1 px-1">
            <span className="font-semibold text-stone-800">
              {filteredProviders.length} {filteredProviders.length === 1 ? 'Provider' : 'Providers'}
            </span>
            <span>Click to view profile & reviews</span>
          </div>

          <div className="space-y-2.5 max-h-[800px] overflow-y-auto pr-1">
            {filteredProviders.map((provider) => {
              const isSelected = activeProvider?.id === provider.id;
              return (
                <div
                  key={provider.id}
                  onClick={() => handleSelectProvider(provider.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/70 border-amber-800 shadow-sm ring-1 ring-amber-800/20'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={provider.avatarUrl}
                        alt={provider.ownerName}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                      />
                      {provider.verified && (
                        <span className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-600 rounded-full text-white">
                          <CheckCircle2 className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {provider.ownerName}
                        </h4>
                        <div className="flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-bold px-1.5 py-0.2 rounded shrink-0">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{provider.rating.toFixed(2)}</span>
                        </div>
                      </div>

                      <p className="text-[11px] font-medium text-amber-900 truncate mt-0.5">
                        {provider.businessName}
                      </p>

                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-1">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate">{provider.neighborhood}, {provider.city || 'Bengaluru'}</span>
                      </div>

                      {/* Live 1km Proximity Badge */}
                      <div className="mt-1.5 flex items-center justify-between text-[10px] bg-emerald-50 text-emerald-900 border border-emerald-200/90 rounded-md px-2 py-0.5 font-medium">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                          <span>Active Now</span>
                        </span>
                        <span className="font-bold text-emerald-950 font-mono">
                          📍 {formatDistance(provider.distanceKm || 0.25)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-stone-100 text-stone-600">
                        <span className="font-semibold text-emerald-800">
                          {provider.reviewCount} Reviews
                        </span>
                        <span className="text-stone-400">
                          {provider.yearsInCraft} yrs craft
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Provider Profile & Reviews Sheet */}
        {activeProvider ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Provider Profile Hero Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={activeProvider.avatarUrl}
                      alt={activeProvider.ownerName}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-stone-200 shadow-sm"
                    />
                    {activeProvider.verified && (
                      <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-display">
                        {activeProvider.ownerName}
                      </h3>
                      {activeProvider.verified && (
                        <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified Ustad</span>
                        </span>
                      )}
                      <span className="bg-emerald-100 text-emerald-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-2xs font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                        <span>Active within 1 km · 📍 {formatDistance(activeProvider.distanceKm || 0.25)} away</span>
                      </span>
                      {(activeProvider.liveGoogleTag || liveLocationDetails?.googleTag) && (
                        <a
                          href={liveLocationDetails?.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeProvider.liveGoogleTag || liveLocationDetails?.googleTag || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-amber-100 text-amber-900 hover:bg-amber-200 text-[11px] font-bold font-mono px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 transition-colors"
                          title="Open Google Location Tag in Maps"
                        >
                          <MapPin className="w-3 h-3 text-amber-600" />
                          <span>Google Tag: {activeProvider.liveGoogleTag || liveLocationDetails?.googleTag}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-amber-700" />
                        </a>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-amber-900 mt-0.5">
                      {activeProvider.businessName}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-stone-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        {activeProvider.neighborhood}, {activeProvider.city || 'Bengaluru'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-stone-700">
                        {activeProvider.yearsInCraft} Years Experience
                      </span>
                      {activeProvider.aadharNumber && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-800 bg-emerald-100 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" />
                            Aadhaar: {activeProvider.aadharNumber}
                          </span>
                        </>
                      )}
                      {activeProvider.contactPhone && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-stone-700 font-medium">
                            Phone: {activeProvider.contactPhone}
                          </span>
                        </>
                      )}
                      {activeProvider.address && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-stone-600">
                            Address: {activeProvider.address}
                          </span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 font-semibold">
                        Direct UPI: {activeProvider.upiId || 'Verified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Actions on Profile */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-col sm:items-end">
                  <button
                    type="button"
                    onClick={handleOpenReviewModal}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Rate & Review Pro</span>
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(
                      (activeProvider.contactPhone || '+919845021944').replace(/[^0-9]/g, '')
                    )}&text=${encodeURIComponent(
                      `Hello ${activeProvider.ownerName}, I found your profile on Hunt and would like to inquire about your pop-up services.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Pro</span>
                  </a>
                </div>
              </div>

              {/* Tagline & Bio */}
              <div className="mt-5 pt-4 border-t border-stone-100">
                <p className="text-sm font-medium text-stone-800 italic">
                  &ldquo;{activeProvider.tagline}&rdquo;
                </p>
                <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                  {activeProvider.bio}
                </p>
              </div>
            </div>

            {/* Stars & Reviews Summary Card */}
            <div className="bg-gradient-to-br from-amber-50/50 via-stone-50 to-white rounded-2xl border border-amber-900/15 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="bg-white border border-amber-900/20 rounded-2xl p-4 text-center shadow-xs shrink-0 min-w-[110px]">
                    <span className="text-3xl sm:text-4xl font-bold font-display text-stone-900 tabular-nums block">
                      {activeProvider.rating.toFixed(2)}
                    </span>
                    <div className="flex items-center justify-center gap-0.5 mt-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i <= Math.round(activeProvider.rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1 block">out of 5 stars</span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-stone-900 font-display">
                      {activeProvider.reviewCount} Verified Client Reviews
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      100% of reviewers verified appointment completion with zero middleman fee.
                    </p>

                    <div className="mt-3 flex items-center gap-3 text-xs text-stone-600 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <ThumbsUp className="w-3 h-3 text-emerald-600" />
                        99% Satisfaction Rate
                      </span>
                      <span className="flex items-center gap-1 font-medium text-stone-700 bg-white px-2 py-0.5 rounded border border-stone-200">
                        <CreditCard className="w-3 h-3 text-stone-500" />
                        Direct UPI Verified
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenReviewModal}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Star className="w-4 h-4 fill-stone-950 text-stone-950" />
                  <span>Write Review for {activeProvider.ownerName.split(' ')[0]}</span>
                </button>
              </div>

              {/* Star Rating Breakdown Bar */}
              <div className="mt-6 pt-5 border-t border-stone-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-stone-500 font-medium">5 Stars</span>
                    <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full w-[94%]" />
                    </div>
                    <span className="w-8 text-right font-semibold text-stone-800">94%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-stone-500 font-medium">4 Stars</span>
                    <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full w-[6%]" />
                    </div>
                    <span className="w-8 text-right font-semibold text-stone-800">6%</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-stone-500 font-medium">3 Stars</span>
                    <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-stone-300 rounded-full w-[0%]" />
                    </div>
                    <span className="w-8 text-right font-semibold text-stone-800">0%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-stone-500 font-medium">1-2 Stars</span>
                    <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-stone-300 rounded-full w-[0%]" />
                    </div>
                    <span className="w-8 text-right font-semibold text-stone-800">0%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Pop-up Services by this Provider */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold text-stone-900 font-display flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-800" />
                  <span>Available Pop-Up Services ({providerServices.length})</span>
                </h4>
                <span className="text-xs text-stone-500">Book guaranteed spot without lines</span>
              </div>

              {providerServices.length === 0 ? (
                <div className="p-6 bg-stone-50 rounded-xl text-center text-xs text-stone-500">
                  No active pop-ups currently live for this provider. Check back soon or message them directly.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {providerServices.map((service) => (
                    <div
                      key={service.id}
                      className="border border-stone-200 rounded-xl p-4 flex flex-col justify-between hover:border-stone-400 transition-all bg-stone-50/40"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500 mb-1">
                          <span className="font-semibold text-emerald-800">{service.dateLabel}</span>
                          <span className="font-bold text-amber-900">{service.remainingSpots} spots left</span>
                        </div>
                        <h5 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">
                          {service.title}
                        </h5>
                        <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                          {service.description}
                        </p>
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-stone-500">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">{service.locationName}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-200/70 flex items-center justify-between">
                        <div>
                          <span className="text-base font-bold text-stone-900 tabular-nums">
                            ₹{service.price}
                          </span>
                          <span className="text-[11px] text-stone-500 ml-1">/ {service.priceUnit}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectServiceDetail(service)}
                            className="px-2.5 py-1.5 text-xs text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 font-medium transition-colors"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => onBookService(service)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-amber-900 hover:bg-amber-800 rounded-lg transition-colors shadow-xs"
                          >
                            Book Spot
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Individual Reviews List */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h4 className="text-base font-bold text-stone-900 font-display">
                    Customer Testimonials & Verified Stars
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Showing recent community reviews for {activeProvider.ownerName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenReviewModal}
                  className="text-xs text-amber-900 hover:underline font-semibold flex items-center gap-1"
                >
                  + Add Your Review
                </button>
              </div>

              <div className="space-y-4">
                {(activeProvider.reviews || []).length === 0 ? (
                  <div className="p-8 text-center bg-stone-50 rounded-xl text-stone-500 text-xs">
                    Be the first to review {activeProvider.ownerName}! Click above to share your experience.
                  </div>
                ) : (
                  (activeProvider.reviews || []).map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl border border-stone-100 bg-stone-50/60 hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-stone-900">
                              {rev.authorName}
                            </span>
                            {rev.verifiedBooking && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
                                <span>Verified Client</span>
                              </span>
                            )}
                          </div>
                          {rev.authorCity && (
                            <span className="text-[11px] text-stone-400 block mt-0.5">
                              {rev.authorCity}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-stone-400 ml-1.5">{rev.date}</span>
                        </div>
                      </div>

                      {rev.serviceTitle && (
                        <div className="mt-2 text-[11px] font-medium text-amber-900 bg-amber-50/60 px-2 py-0.5 rounded inline-block border border-amber-900/10">
                          Service: {rev.serviceTitle}
                        </div>
                      )}

                      <p className="mt-2 text-xs sm:text-sm text-stone-700 leading-relaxed">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500 text-sm">
            Select a service provider on the left to inspect their profile, reviews, and star ratings.
          </div>
        )}
      </div>

      {/* MODAL: Write a Review & Rate Pro */}
      {isReviewModalOpen && activeProvider && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 border border-stone-200 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>Review & Star Rating</span>
            </div>

            <h3 className="text-xl font-bold text-stone-900 font-display">
              Review {activeProvider.ownerName}
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              Your verified review helps neighbors discover genuine local Ustads and service specialists.
            </p>

            <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Your Rating (Stars) *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = starVal <= (hoverRating || reviewRating);
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setReviewRating(starVal)}
                        className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-hidden"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            isFilled ? 'fill-amber-400 text-amber-500' : 'text-stone-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-bold text-stone-700">
                    {reviewRating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Reviewer Name */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Vikramaditya Rao"
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>

              {/* Reviewer City / Neighborhood */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Your Neighborhood / City
                </label>
                <input
                  type="text"
                  value={reviewerCity}
                  onChange={(e) => setReviewerCity(e.target.value)}
                  placeholder="e.g. Koramangala 4th Block, Bengaluru"
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>

              {/* Service Utilized */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Service Utilized
                </label>
                <input
                  type="text"
                  value={reviewServiceTitle}
                  onChange={(e) => setReviewServiceTitle(e.target.value)}
                  placeholder="e.g. Waterstone Cutlery Honing"
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>

              {/* Review Comments */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Your Feedback & Review Comments *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details of the craft quality, timeliness, and experience..."
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 text-xs font-bold bg-amber-900 hover:bg-amber-800 text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReview ? 'Submitting...' : 'Post Verified Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
