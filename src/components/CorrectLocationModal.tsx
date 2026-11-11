import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MapPin,
  Search,
  LocateFixed,
  Navigation,
  Check,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Compass,
  Building,
} from 'lucide-react';
import {
  LatLng,
  LiveLocationDetails,
  INDIAN_CITIES,
  searchPlacesOnline,
  GeocodedSearchResult,
  formatDistance,
  calculateDistanceKm,
} from '../utils/geo';
import { CityPreset } from '../types';

interface CorrectLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LatLng;
  currentDetails: LiveLocationDetails;
  locationAccuracy: number | null;
  onApplyLocation: (newCoords: LatLng, overrideDetails?: Partial<LiveLocationDetails>) => void;
  onRedetectGps: () => void;
  isSyncingLocation: boolean;
}

export const CorrectLocationModal: React.FC<CorrectLocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  currentDetails,
  locationAccuracy,
  onApplyLocation,
  onRedetectGps,
  isSyncingLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodedSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [customLat, setCustomLat] = useState(currentLocation.lat.toString());
  const [customLng, setCustomLng] = useState(currentLocation.lng.toString());
  const [showManualInputs, setShowManualInputs] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCustomLat(currentLocation.lat.toString());
    setCustomLng(currentLocation.lng.toString());
  }, [currentLocation]);

  // Handle Search Input with debounce
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchPlacesOnline(query);
      setSearchResults(results);
      setIsSearching(false);
    }, 350);
  };

  const handleSelectSearchResult = (result: GeocodedSearchResult) => {
    const coords: LatLng = { lat: result.lat, lng: result.lng };
    const overrides: Partial<LiveLocationDetails> = {
      name: result.name ? `${result.name}, ${result.city || result.state || ''}` : result.displayName,
      neighborhood: result.neighborhood || result.name,
      city: result.city || 'Local Area',
      state: result.state || 'India',
      isCustomCorrected: true,
    };
    onApplyLocation(coords, overrides);
    onClose();
  };

  const handleSelectCityPreset = (city: CityPreset) => {
    const coords = city.coordinates;
    const overrides: Partial<LiveLocationDetails> = {
      name: `${city.neighborhoods[1] || city.name}, ${city.name}`,
      neighborhood: city.neighborhoods[1] || city.name,
      city: city.name,
      state: city.state,
      isCustomCorrected: true,
    };
    onApplyLocation(coords, overrides);
    onClose();
  };

  const handleApplyManualCoords = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      onApplyLocation({ lat, lng }, { isCustomCorrected: true });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
              <MapPin className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-display">
                Correct Live Location
              </h3>
              <p className="text-xs text-stone-500">
                Fix or update your live GPS spot for the 1 km local radar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Current Detected Location Badge */}
          <div className="p-3.5 rounded-xl bg-stone-900 text-white border border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-stone-400">
              <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-amber-300">
                <Compass className="w-3.5 h-3.5" />
                Current Active Location
              </span>
              <span className="font-mono text-stone-300">
                {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-bold text-white">
                  {currentDetails.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-stone-300 mt-0.5">
                  <span className="font-mono text-amber-300 font-semibold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/50">
                    Tag: {currentDetails.googleTag}
                  </span>
                  {locationAccuracy && (
                    <span className="text-[11px] text-emerald-400">
                      ±{Math.round(locationAccuracy)}m accuracy
                    </span>
                  )}
                </div>
              </div>

              <a
                href={currentDetails.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-300 hover:text-amber-100 flex items-center gap-1 shrink-0"
              >
                <span>Verify on Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Quick Option 1: Re-detect GPS Hardware */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Option 1: Re-detect Device GPS (Zero Cache)
            </label>
            <button
              type="button"
              onClick={onRedetectGps}
              disabled={isSyncingLocation}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <LocateFixed className={`w-4 h-4 ${isSyncingLocation ? 'animate-spin' : ''}`} />
              <span>{isSyncingLocation ? 'Detecting Fresh GPS...' : 'Acquire High-Accuracy Device GPS'}</span>
            </button>
            <p className="text-[11px] text-stone-500 mt-1">
              Bypasses browser cache to request real-time satellite/network coordinates from your device.
            </p>
          </div>

          {/* Quick Option 2: Search Area / Landmark / Address */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Option 2: Search Your Exact Colony, Area or Landmark
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Type area (e.g. Hazratganj, Indiranagar, Sector 62, Bandra)..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <span className="w-3.5 h-3.5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin inline-block" />
                </div>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-2 border border-stone-200 rounded-xl divide-y divide-stone-100 bg-white shadow-md max-h-48 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <button
                    key={`${item.lat}-${item.lng}-${idx}`}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left p-2.5 hover:bg-amber-50/70 transition-colors flex items-start gap-2.5 group"
                  >
                    <MapPin className="w-4 h-4 text-amber-600 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-stone-900 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {item.displayName}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Option 3: Choose Major Indian Hub Preset */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Option 3: Fast Switch to City / Hub
            </label>
            <div className="flex flex-wrap gap-1.5">
              {INDIAN_CITIES.map((city) => {
                const dist = calculateDistanceKm(currentLocation, city.coordinates);
                const isNearby = dist < 25;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelectCityPreset(city)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-all flex items-center gap-1 ${
                      isNearby
                        ? 'bg-amber-500 text-stone-950 border-amber-600 font-bold shadow-2xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <span>{city.name}</span>
                    {isNearby && <span className="text-[10px] text-stone-900 font-semibold">• Active</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Option 4: Manual Latitude & Longitude */}
          <div className="border-t border-stone-100 pt-3">
            <button
              type="button"
              onClick={() => setShowManualInputs(!showManualInputs)}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
            >
              <span>{showManualInputs ? '▾ Hide' : '▸ Advanced:'} Enter Specific Lat / Long Coordinates</span>
            </button>

            {showManualInputs && (
              <form onSubmit={handleApplyManualCoords} className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800"
                    placeholder="e.g. 26.8467"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800"
                    placeholder="e.g. 80.9462"
                  />
                </div>
                <div className="col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Set Exact GPS Coordinates
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>1 km live radius automatically recalibrates to your selection.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
