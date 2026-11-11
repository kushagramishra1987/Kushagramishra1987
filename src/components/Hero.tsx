import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Users,
  Building2,
  Zap,
  UserCheck,
  RefreshCw,
  CheckCircle2,
  LocateFixed,
  User,
  Store,
  ChevronDown,
  Star,
  Check,
  ExternalLink,
} from 'lucide-react';
import { CityPreset, LocationPermissionStatus, Provider } from '../types';
import { LatLng, LiveLocationDetails } from '../utils/geo';

export type SearchOption = 'all' | 'services' | 'providers';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchOption?: SearchOption;
  onSearchOptionChange?: (opt: SearchOption) => void;
  providers?: Provider[];
  onSelectProviderProfile?: (providerId: string) => void;
  onSwitchToProvidersTab?: () => void;
  selectedCity: CityPreset;
  onCityChange: (city: CityPreset) => void;
  cities: CityPreset[];
  availableNeighborhoods: string[];
  selectedNeighborhood: string;
  onNeighborhoodChange: (n: string) => void;
  onOpenLaunchModal: () => void;
  onOpenMatchModal?: () => void;
  activePopupsCount: number;
  activeProvidersCount?: number;
  liveLocationDetails?: LiveLocationDetails;
  isUsingLiveLocation?: boolean;
  onSelectLiveLocation?: () => void;
  isSyncingLocation?: boolean;
  locationPermission?: LocationPermissionStatus;
  locationAccuracy?: number | null;
  liveLocationLabel?: string;
  userLocation?: LatLng;
  onOpenCorrectLocation?: () => void;
}

const POPULAR_DOMESTIC_TAGS = [
  'Electronics',
  'Mason',
  'Glass Work',
  'Automobile',
  'Tyre Repair',
  'Jhadu-Pochha Maid',
  'Pure Veg Maharaj Cook',
  'Painter',
  'Electrician',
  'Plumber',
  'Daily Family Driver',
];

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  searchOption = 'all',
  onSearchOptionChange,
  providers = [],
  onSelectProviderProfile,
  onSwitchToProvidersTab,
  selectedCity,
  onCityChange,
  cities,
  availableNeighborhoods,
  selectedNeighborhood,
  onNeighborhoodChange,
  onOpenLaunchModal,
  onOpenMatchModal,
  activePopupsCount,
  activeProvidersCount,
  liveLocationDetails,
  isUsingLiveLocation = false,
  onSelectLiveLocation,
  isSyncingLocation = false,
  locationPermission = 'prompt',
  locationAccuracy = null,
  liveLocationLabel = '',
  userLocation,
  onOpenCorrectLocation,
}) => {
  const [internalOption, setInternalOption] = useState<SearchOption>(searchOption);
  const [isOptionMenuOpen, setIsOptionMenuOpen] = useState(false);
  const [isLiveSuggestOpen, setIsLiveSuggestOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchOption) {
      setInternalOption(searchOption);
    }
  }, [searchOption]);

  // Click outside listener to dismiss search option menu & live suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOptionMenuOpen(false);
        setIsLiveSuggestOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchOption = (opt: SearchOption) => {
    setInternalOption(opt);
    if (onSearchOptionChange) onSearchOptionChange(opt);
    if (opt === 'providers' && onSwitchToProvidersTab) {
      onSwitchToProvidersTab();
    }
  };

  const matchingProviders = React.useMemo(() => {
    if (!providers || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return providers
      .filter((p) => {
        const matchName = p.ownerName.toLowerCase().includes(q) || p.businessName.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchNeigh = p.neighborhood.toLowerCase().includes(q);
        const matchSkill = p.skills?.some((s) => s.toLowerCase().includes(q));
        return matchName || matchCat || matchNeigh || matchSkill;
      })
      .slice(0, 5);
  }, [providers, searchQuery]);

  return (
    <section className="relative bg-white border-b border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        {/* 2-Column Split Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Narrative & Interactive Filter Search */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* User's fancy Hindi headline preserved with Indian Touch */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-[1.3] font-['Rozha_One',serif] [text-wrap:balance]">
                <span className="text-amber-600/80 mr-1.5 select-none" aria-hidden="true">॥</span>
                <span>हो गई है अब </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 font-extrabold underline decoration-amber-400 decoration-wavy decoration-2 underline-offset-4">
                  फुर्सत
                </span>
                <span> क्योंकि </span>
                <span className="relative inline-flex items-center px-2.5 py-0.5 mx-1 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-stone-950 font-black tracking-wider uppercase shadow-xs border border-amber-300 font-sans text-[0.82em] align-middle">
                  Hunt
                </span>
                <span> करे पूरी आपकी सारी </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 font-extrabold underline decoration-amber-400 decoration-wavy decoration-2 underline-offset-4">
                  ज़रूरत
                </span>
                <span className="text-amber-600/80 ml-1.5 select-none" aria-hidden="true">॥</span>
              </h1>

              {/* User's exact requested description */}
              <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
                Need Auto driver, painter, house-help, electrician or any type of services, just search on Hunt and book your services from all the experts available locally.
              </p>
            </div>

            {/* Quick Search, City & Neighborhood Box */}
            <div className="mt-8 bg-stone-50 border border-stone-200/90 rounded-2xl p-3.5 sm:p-5 shadow-xs">
              {/* Live Location Detection & 1 km Radius Indicator */}
              <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-stone-200/70 overflow-x-auto no-scrollbar flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Primary Live Location Detector Status */}
                  <button
                    type="button"
                    onClick={onSelectLiveLocation}
                    disabled={isSyncingLocation}
                    title="Click to re-detect your live location via Google Maps GPS"
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-700 text-white shadow-xs flex items-center gap-2 hover:bg-emerald-800 transition-colors cursor-pointer"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
                    </span>
                    <LocateFixed className={`w-3.5 h-3.5 ${isSyncingLocation ? 'animate-spin text-amber-300' : ''}`} />
                    <span>
                      {isSyncingLocation
                        ? 'Detecting Google Maps GPS...'
                        : `Live Location: ${liveLocationDetails?.name || liveLocationLabel || 'Google Maps GPS Detected'}`}
                    </span>
                    {locationAccuracy && (
                      <span className="text-[10px] bg-emerald-800 text-emerald-100 px-1.5 py-0.2 rounded font-mono">
                        ±{Math.round(locationAccuracy)}m
                      </span>
                    )}
                  </button>

                  {/* Official Google Tag Badge */}
                  {liveLocationDetails && (
                    <a
                      href={liveLocationDetails.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Google Plus Code: ${liveLocationDetails.fullPlusCode} (Click to open on Google Maps)`}
                      className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-700" />
                      <span className="font-sans text-[11px] text-amber-900 font-semibold">Google Tag:</span>
                      <span className="font-mono text-amber-950 bg-white/90 px-1.5 py-0.2 rounded border border-amber-300 font-bold">
                        {liveLocationDetails.googleTag}
                      </span>
                      <ExternalLink className="w-3 h-3 text-amber-700" />
                    </a>
                  )}

                  {/* 1 km Radius Badge */}
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
                    Active within 1 km Radius
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {onOpenCorrectLocation && (
                    <button
                      type="button"
                      onClick={onOpenCorrectLocation}
                      className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Live location wrong? Click to search or fix your exact spot"
                    >
                      <MapPin className="w-3.5 h-3.5 text-stone-950" />
                      <span>Wrong location? Correct it</span>
                    </button>
                  )}

                  {/* Instant Re-detect button */}
                  <button
                    type="button"
                    onClick={onSelectLiveLocation}
                    disabled={isSyncingLocation}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 underline decoration-emerald-500 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncingLocation ? 'animate-spin' : ''}`} />
                    <span>{isSyncingLocation ? 'Detecting...' : 'Re-detect Live GPS'}</span>
                  </button>
                </div>
              </div>

              {/* Input & Neighborhood Dropdown */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div ref={searchContainerRef} className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none z-10" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      onSearchChange(e.target.value);
                      setIsLiveSuggestOpen(true);
                    }}
                    onFocus={() => setIsLiveSuggestOpen(true)}
                    placeholder={
                      internalOption === 'providers'
                        ? 'Search service providers by name (Ramesh, Sunita...), skill, or craft...'
                        : internalOption === 'services'
                        ? 'Search pop-up services, trial visits, pricing within 1km...'
                        : 'Search service providers, maids, cooks, electronics, automobile, tyre repair...'
                    }
                    className="w-full pl-10 pr-36 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-800 focus:border-amber-800 transition-all"
                  />

                  {/* Actions & Search Option Controls inside input right side */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => onSearchChange('')}
                        className="text-xs text-stone-400 hover:text-stone-700 px-1 py-0.5 rounded cursor-pointer"
                        title="Clear search"
                      >
                        Clear
                      </button>
                    )}

                    {/* Search Option Dropdown Trigger */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsOptionMenuOpen(!isOptionMenuOpen)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                          internalOption === 'providers'
                            ? 'bg-amber-800 text-white border-amber-900 ring-2 ring-amber-400/40'
                            : internalOption === 'services'
                            ? 'bg-stone-900 text-white border-stone-800'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200'
                        }`}
                        title="Click to switch search option (Providers vs Services)"
                      >
                        {internalOption === 'providers' ? (
                          <>
                            <User className="w-3.5 h-3.5 text-amber-300" />
                            <span>Providers</span>
                          </>
                        ) : internalOption === 'services' ? (
                          <>
                            <Store className="w-3.5 h-3.5 text-stone-300" />
                            <span>Services</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-3.5 h-3.5 text-stone-500" />
                            <span>All</span>
                          </>
                        )}
                        <ChevronDown className="w-3 h-3 opacity-70" />
                      </button>

                      {/* Dropdown Menu for Search Options */}
                      {isOptionMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-stone-200 shadow-2xl p-2 z-50 divide-y divide-stone-100 animate-in fade-in zoom-in-95 duration-150">
                          <div className="p-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                            Search Option Mode
                          </div>

                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectSearchOption('providers');
                                setIsOptionMenuOpen(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                                internalOption === 'providers' ? 'bg-amber-50 text-amber-950 font-semibold' : 'hover:bg-stone-50 text-stone-800'
                              }`}
                            >
                              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900 shrink-0 mt-0.5">
                                <User className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold flex items-center gap-1.5">
                                  <span>Service Providers (Ustads)</span>
                                  {internalOption === 'providers' && <Check className="w-3 h-3 text-amber-800" />}
                                </div>
                                <div className="text-[11px] text-stone-600 leading-tight mt-0.5">
                                  Search verified artisans by name, trade, experience & reviews
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleSelectSearchOption('services');
                                setIsOptionMenuOpen(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                                internalOption === 'services' ? 'bg-stone-100 text-stone-900 font-semibold' : 'hover:bg-stone-50 text-stone-800'
                              }`}
                            >
                              <div className="p-1.5 rounded-lg bg-stone-200 text-stone-800 shrink-0 mt-0.5">
                                <Store className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold flex items-center gap-1.5">
                                  <span>Pop-Up Services</span>
                                  {internalOption === 'services' && <Check className="w-3 h-3 text-stone-900" />}
                                </div>
                                <div className="text-[11px] text-stone-600 leading-tight mt-0.5">
                                  Search trial bookings and spots available within 1 km
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleSelectSearchOption('all');
                                setIsOptionMenuOpen(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                                internalOption === 'all' ? 'bg-stone-100 text-stone-900 font-semibold' : 'hover:bg-stone-50 text-stone-800'
                              }`}
                            >
                              <div className="p-1.5 rounded-lg bg-stone-100 text-stone-600 shrink-0 mt-0.5">
                                <Search className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold flex items-center gap-1.5">
                                  <span>All (Services + Providers)</span>
                                  {internalOption === 'all' && <Check className="w-3 h-3 text-stone-900" />}
                                </div>
                                <div className="text-[11px] text-stone-600 leading-tight mt-0.5">
                                  Universal search across all services and service providers
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Suggestions Dropdown for Matching Service Providers */}
                  {isLiveSuggestOpen && searchQuery.trim() && matchingProviders.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-stone-200 shadow-2xl z-50 overflow-hidden divide-y divide-stone-100 animate-in fade-in duration-150">
                      <div className="p-2.5 bg-amber-50/70 flex items-center justify-between border-b border-amber-200/60">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-amber-700" />
                          Matching Service Providers ({matchingProviders.length})
                        </span>
                        <span className="text-[11px] text-amber-800 font-medium">
                          Click to view profile & reviews
                        </span>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                        {matchingProviders.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              if (onSelectProviderProfile) onSelectProviderProfile(p.id);
                              if (onSwitchToProvidersTab) onSwitchToProvidersTab();
                              setIsLiveSuggestOpen(false);
                            }}
                            className="w-full text-left p-3 hover:bg-amber-50/40 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={p.avatarUrl}
                                alt={p.ownerName}
                                className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-sm font-bold text-stone-900 truncate">{p.ownerName}</span>
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                                    {p.category}
                                  </span>
                                  {p.verified && (
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  )}
                                </div>
                                <div className="text-xs text-stone-600 truncate mt-0.5">
                                  {p.businessName} · {p.neighborhood}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-xs font-bold text-stone-900 flex items-center justify-end gap-1">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                <span>{p.rating.toFixed(1)}</span>
                                <span className="text-stone-400 font-normal">({p.reviewCount})</span>
                              </div>
                              <div className="text-[10px] text-stone-500">
                                {p.yearsInCraft} yrs exp
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="p-2 bg-stone-50 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSwitchToProvidersTab) onSwitchToProvidersTab();
                            setIsLiveSuggestOpen(false);
                          }}
                          className="text-xs font-bold text-amber-900 hover:text-amber-950 underline decoration-amber-500 cursor-pointer"
                        >
                          View all service providers in directory →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative sm:w-52">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <select
                    value={selectedNeighborhood}
                    onChange={(e) => onNeighborhoodChange(e.target.value)}
                    aria-label="Filter by neighborhood / society"
                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-900 transition-all appearance-none cursor-pointer"
                  >
                    {availableNeighborhoods.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Popular Domestic Service Tags & Service Provider Search Options */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-600" />
                    Quick Roles:
                  </span>
                  {POPULAR_DOMESTIC_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => onSearchChange(tag)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-stone-200/70 hover:bg-amber-100 hover:text-amber-900 text-stone-700 transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Quick Service Provider Search Option Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-stone-200/60">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-700" />
                    Search Service Providers:
                  </span>
                  {[
                    { name: 'Ramesh Kumar', role: 'Automobile' },
                    { name: 'Sunita Devi', role: 'Domestic Maid' },
                    { name: 'Imran Khan', role: 'Tyre Repair' },
                    { name: 'Pooja Sharma', role: 'Maharaj Cook' },
                    { name: 'Suresh Kumar', role: 'Electronics' },
                    { name: 'Master Ramu', role: 'Masonry' },
                    { name: 'Ustad Altaf', role: 'Blade & Tools' },
                  ].map((prov) => (
                    <button
                      key={prov.name}
                      type="button"
                      onClick={() => {
                        onSearchChange(prov.name);
                        handleSelectSearchOption('providers');
                        if (onSwitchToProvidersTab) onSwitchToProvidersTab();
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 transition-colors cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <span>{prov.name}</span>
                      <span className="text-amber-700/80 font-normal">({prov.role})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Count, Callout & Match My Bai CTA */}
              <div className="mt-3.5 flex items-center justify-between text-xs text-stone-500 pt-2.5 border-t border-stone-200/60 flex-wrap gap-2">
                <span className="flex items-center gap-2 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
                  <span className="font-semibold text-stone-800">
                    {activeProvidersCount || 10} active service providers & {activePopupsCount} services available within 1 km radius of {liveLocationDetails?.neighborhood || 'live location'}
                  </span>
                  {liveLocationDetails && (
                    <span className="text-[11px] font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-bold">
                      Tag: {liveLocationDetails.googleTag}
                    </span>
                  )}
                </span>

                <div className="flex items-center gap-3">
                  {onOpenMatchModal && (
                    <button
                      type="button"
                      onClick={onOpenMatchModal}
                      className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 underline decoration-emerald-500"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Match My Bai in 30s</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onOpenLaunchModal}
                    className="font-semibold text-amber-900 hover:text-amber-700 underline decoration-amber-900/30 flex items-center gap-1"
                  >
                    Kaam Chahiye? Register
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Photography with Indian Craft & Domestic Care */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-stone-200 shadow-sm min-h-[320px] lg:min-h-full">
            <img
              src="/src/assets/images/indian_artisan_craft_1794215372127.jpg"
              alt="Traditional Indian craftsman and verified domestic helpers network"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent flex flex-col justify-end p-6 text-white">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-stone-300 font-medium">100% Aadhaar & Police Checked</span>
              </div>
              <p className="text-sm sm:text-base font-semibold leading-snug">
                Hire trusted house maids, home cooks, baby nannies, and patient caregivers near your society.
              </p>
              <div className="mt-2.5 flex items-center gap-3 text-xs text-stone-300 flex-wrap">
                <span>Free trial visit</span>
                <span aria-hidden="true">·</span>
                <span>Immediate replacement</span>
                <span aria-hidden="true">·</span>
                <span>Zero commission</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column BookMyBai Trust Matrix */}
        <div className="mt-10 pt-8 border-t border-stone-100 grid grid-cols-2 md:grid-cols-4 gap-6 text-stone-700">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Police Verified</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-stone-900 font-display tabular-nums">
              100%
            </span>
            <span className="text-xs text-stone-500 mt-0.5">Biometric & court records cleared</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Free Replacement</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-stone-900 font-display tabular-nums">
              Guaranteed
            </span>
            <span className="text-xs text-stone-500 mt-0.5">Instant backup if helper takes leave</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
              <Users className="w-3.5 h-3.5 text-stone-600" />
              <span>Society Range</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-stone-900 font-display tabular-nums">
              &le; 1 km
            </span>
            <span className="text-xs text-stone-500 mt-0.5">Helpers already in your gated society</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Trial Visit First</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-stone-900 font-display tabular-nums">
              Zero Lock-in
            </span>
            <span className="text-xs text-stone-500 mt-0.5">Book trial visit before hiring monthly</span>
          </div>
        </div>
      </div>
    </section>
  );
};
