import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMapsLibrary,
  useMap,
} from '@vis.gl/react-google-maps';
import { PopUpService, GooglePlaceProvider, LocationPermissionStatus } from '../types';
import {
  calculateDistanceKm,
  formatDistance,
  DEFAULT_USER_LOCATION,
  LatLng,
} from '../utils/geo';
import {
  Navigation,
  LocateFixed,
  MapPin,
  Star,
  ExternalLink,
  Phone,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  Layers,
  Search,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Radio,
} from 'lucide-react';

interface GoogleMapViewProps {
  services: PopUpService[];
  selectedService: PopUpService | null;
  onSelectService: (service: PopUpService) => void;
  onOpenBooking: (service: PopUpService) => void;
  userLocation: LatLng;
  onUpdateUserLocation: (loc: LatLng) => void;
  rangeKm: number;
  onChangeRangeKm: (range: number) => void;
  isSyncingLocation: boolean;
  onSyncLocation: () => void;
  locationPermission?: LocationPermissionStatus;
  locationAccuracy?: number | null;
  isWatchingLocation?: boolean;
  onToggleWatchLocation?: () => void;
}

// Fallback high-fidelity local service places in Bengaluru within 1km
const LOCAL_GOOGLE_PLACES_SAMPLE: GooglePlaceProvider[] = [
  {
    id: 'gplace-1',
    name: 'Third Wave Coffee Roasters Lab',
    address: '80 Feet Road, 4th Block, Koramangala, Bengaluru',
    coordinates: { lat: 12.9345, lng: 77.6235 },
    category: 'Artisan Kaapi & Roastery',
    rating: 4.8,
    userRatingCount: 420,
    isOpenNow: true,
    googleMapsUri: 'https://maps.google.com/?q=Third+Wave+Coffee+Koramangala',
    nationalPhoneNumber: '+91 80 4123 4567',
    photoUrl: '/src/assets/images/service_mobile_espresso_1793716301575.jpg',
    isGooglePlace: true,
  },
  {
    id: 'gplace-2',
    name: 'BumsOnTheSaddle (BOTS) Cycle Studio',
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru',
    coordinates: { lat: 12.9715, lng: 77.6405 },
    category: 'Bicycle Service & Pro Overhaul',
    rating: 4.9,
    userRatingCount: 512,
    isOpenNow: true,
    googleMapsUri: 'https://maps.google.com/?q=BumsOnTheSaddle+Indiranagar',
    nationalPhoneNumber: '+91 80 4115 2200',
    photoUrl: '/src/assets/images/service_bike_tuneup_1793716301403.jpg',
    isGooglePlace: true,
  },
  {
    id: 'gplace-3',
    name: 'The Greenery Plant Studio & Bonsai',
    address: '14th Main, Sector 4, HSR Layout, Bengaluru',
    coordinates: { lat: 12.9115, lng: 77.6430 },
    category: 'Botanical & Organic Soil Lab',
    rating: 4.7,
    userRatingCount: 230,
    isOpenNow: true,
    googleMapsUri: 'https://maps.google.com/?q=Plant+Nursery+HSR+Layout',
    nationalPhoneNumber: '+91 99000 88712',
    photoUrl: '/src/assets/images/service_plant_care_popup_1793716300748.jpg',
    isGooglePlace: true,
  },
  {
    id: 'gplace-4',
    name: 'Bengaluru Sneaker & Leather Spa',
    address: '80 Feet Rd, Opp. Sony Signal, Koramangala',
    coordinates: { lat: 12.9355, lng: 77.6205 },
    category: 'Leather Spa & Sneaker Laundry',
    rating: 4.8,
    userRatingCount: 184,
    isOpenNow: true,
    googleMapsUri: 'https://maps.google.com/?q=Sneaker+Spa+Koramangala',
    nationalPhoneNumber: '+91 98455 12009',
    photoUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
    isGooglePlace: true,
  },
  {
    id: 'gplace-5',
    name: 'Cauvery Handicrafts & Heritage Peetal Emporium',
    address: 'MG Road / Church Street Junction, Bengaluru',
    coordinates: { lat: 12.9745, lng: 77.6080 },
    category: 'Heritage Craft & Brassware',
    rating: 4.7,
    userRatingCount: 680,
    isOpenNow: true,
    googleMapsUri: 'https://maps.google.com/?q=Cauvery+Handicrafts+Bangalore',
    photoUrl: 'https://images.unsplash.com/photo-1610448721566-47369c768e70?auto=format&fit=crop&w=600&q=80',
    isGooglePlace: true,
  },
];

// Inner map child component that can use `useMap()` and `useMapsLibrary()`
const MapController: React.FC<{
  userLocation: LatLng;
  rangeKm: number;
  onPlacesLoaded: (places: GooglePlaceProvider[]) => void;
}> = ({ userLocation, rangeKm, onPlacesLoaded }) => {
  const map = useMap();
  const placesLibrary = useMapsLibrary('places');
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  // Recenter map on user location change
  useEffect(() => {
    if (map) {
      map.panTo(userLocation);
    }
  }, [map, userLocation]);

  // Modern Places API (New) nearby search
  const performNearbySearch = useCallback(async () => {
    if (!placesLibrary || !userLocation) {
      // Fallback to sample local establishments
      onPlacesLoaded(
        LOCAL_GOOGLE_PLACES_SAMPLE.map((p) => {
          const dist = calculateDistanceKm(userLocation, p.coordinates);
          return { ...p, distanceKm: dist, distanceMeters: Math.round(dist * 1000) };
        })
      );
      return;
    }

    try {
      setIsSearchingPlaces(true);
      const PlaceClass = (placesLibrary as any).Place;
      if (PlaceClass && typeof PlaceClass.searchNearby === 'function') {
        const radiusMeters = Math.round(rangeKm * 1000);
        const response = await PlaceClass.searchNearby({
          fields: [
            'id',
            'displayName',
            'formattedAddress',
            'location',
            'rating',
            'userRatingCount',
            'primaryTypeDisplayName',
            'regularOpeningHours',
            'nationalPhoneNumber',
            'websiteURI',
            'googleMapsURI',
          ],
          locationRestriction: {
            center: userLocation,
            radius: radiusMeters,
          },
          includedPrimaryTypes: [
            'bicycle_repair_shop',
            'hardware_store',
            'coffee_shop',
            'florist',
            'locksmith',
            'hair_salon',
            'shoe_repair_shop',
            'car_repair',
          ],
          maxResultCount: 10,
        });

        if (response && response.places && response.places.length > 0) {
          const mapped: GooglePlaceProvider[] = response.places.map((pl: any) => {
            const lat = typeof pl.location?.lat === 'function' ? pl.location.lat() : pl.location?.lat || userLocation.lat;
            const lng = typeof pl.location?.lng === 'function' ? pl.location.lng() : pl.location?.lng || userLocation.lng;
            const dist = calculateDistanceKm(userLocation, { lat, lng });
            return {
              id: pl.id || `gpl-${Date.now()}-${Math.random()}`,
              name: pl.displayName || 'Local Service Provider',
              address: pl.formattedAddress || 'Local Address',
              coordinates: { lat, lng },
              category: pl.primaryTypeDisplayName || 'Local Service',
              rating: pl.rating || 4.8,
              userRatingCount: pl.userRatingCount || 50,
              isOpenNow: pl.regularOpeningHours?.openNow ?? true,
              distanceKm: dist,
              distanceMeters: Math.round(dist * 1000),
              googleMapsUri: pl.googleMapsURI || `https://maps.google.com/?q=${encodeURIComponent(pl.displayName || '')}`,
              websiteUri: pl.websiteURI,
              nationalPhoneNumber: pl.nationalPhoneNumber,
              isGooglePlace: true,
            };
          });
          onPlacesLoaded(mapped);
          return;
        }
      }
    } catch (err) {
      console.warn('Places API New searchNearby caught:', err);
    } finally {
      setIsSearchingPlaces(false);
    }

    // Graceful fallback with calculated distances
    onPlacesLoaded(
      LOCAL_GOOGLE_PLACES_SAMPLE.map((p) => {
        const dist = calculateDistanceKm(userLocation, p.coordinates);
        return { ...p, distanceKm: dist, distanceMeters: Math.round(dist * 1000) };
      })
    );
  }, [placesLibrary, userLocation, rangeKm, onPlacesLoaded]);

  useEffect(() => {
    performNearbySearch();
  }, [performNearbySearch]);

  return null;
};

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  services,
  selectedService,
  onSelectService,
  onOpenBooking,
  userLocation,
  onUpdateUserLocation,
  rangeKm,
  onChangeRangeKm,
  isSyncingLocation,
  onSyncLocation,
  locationPermission = 'prompt',
  locationAccuracy = null,
  isWatchingLocation = false,
  onToggleWatchLocation,
}) => {
  const [googlePlaces, setGooglePlaces] = useState<GooglePlaceProvider[]>([]);
  const [activePlaceInfo, setActivePlaceInfo] = useState<GooglePlaceProvider | null>(null);
  const [activeServiceInfo, setActiveServiceInfo] = useState<PopUpService | null>(selectedService);
  const [showPlacesOnMap, setShowPlacesOnMap] = useState(true);

  // Sync selected service if changed from outside
  useEffect(() => {
    if (selectedService) {
      setActiveServiceInfo(selectedService);
      setActivePlaceInfo(null);
    }
  }, [selectedService]);

  // Calculate distance for all services
  const servicesWithDistance = useMemo(() => {
    return services.map((s) => {
      const coords = s.geoCoordinates || { lat: 37.7749, lng: -122.4194 };
      const dist = calculateDistanceKm(userLocation, coords);
      return {
        ...s,
        distanceKm: dist,
        distanceMeters: Math.round(dist * 1000),
      };
    });
  }, [services, userLocation]);

  // Filter services within range (default 1km)
  const inRangeServices = useMemo(() => {
    return servicesWithDistance.filter((s) => s.distanceKm! <= rangeKm);
  }, [servicesWithDistance, rangeKm]);

  // Filter Google Places within range (default 1km)
  const inRangePlaces = useMemo(() => {
    return googlePlaces.filter((p) => (p.distanceKm || 0) <= rangeKm);
  }, [googlePlaces, rangeKm]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm flex flex-col">
      {/* Top Controls Bar */}
      <div className="p-3 bg-white/95 backdrop-blur-md border-b border-stone-200 z-10 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: GPS Sync & Permission Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onSyncLocation}
            disabled={isSyncingLocation}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-xs ${
              locationPermission === 'granted'
                ? 'bg-stone-900 hover:bg-stone-800 text-white'
                : 'bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold'
            }`}
          >
            <LocateFixed className={`w-3.5 h-3.5 ${isSyncingLocation ? 'animate-spin' : locationPermission === 'granted' ? 'text-amber-400' : 'text-stone-950'}`} />
            <span>
              {isSyncingLocation
                ? 'Syncing GPS...'
                : locationPermission === 'granted'
                ? 'Sync GPS'
                : 'Switch On Location'}
            </span>
          </button>

          {/* Location Permission Pill */}
          <div
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 border ${
              locationPermission === 'granted'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : locationPermission === 'denied'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            {locationPermission === 'granted' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Permission: ON</span>
                {locationAccuracy && (
                  <span className="text-emerald-700/80 font-mono text-[10px]">
                    (±{Math.round(locationAccuracy)}m)
                  </span>
                )}
              </>
            ) : locationPermission === 'denied' ? (
              <>
                <AlertCircle className="w-3 h-3 text-red-600" />
                <span>Blocked</span>
              </>
            ) : (
              <>
                <Radio className="w-3 h-3 text-amber-700 animate-pulse" />
                <span>Permission Pending</span>
              </>
            )}
          </div>

          {/* Live Watch Tracking Button */}
          {locationPermission === 'granted' && onToggleWatchLocation && (
            <button
              type="button"
              onClick={onToggleWatchLocation}
              title={isWatchingLocation ? 'Stop live GPS tracking' : 'Turn on live GPS tracking as you walk'}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1 transition-all ${
                isWatchingLocation
                  ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isWatchingLocation ? 'bg-white animate-ping' : 'bg-stone-400'}`} />
              <span>{isWatchingLocation ? 'Live Tracking ON' : 'Live Walk Tracking'}</span>
            </button>
          )}

          <span className="text-stone-400 hidden sm:inline">|</span>

          <span className="text-stone-600 font-mono tabular-nums text-[11px] hidden sm:inline">
            {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </span>
        </div>

        {/* Middle: 1km Radius Selector (Key User Requirement!) */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200/80">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider px-1.5">
            Radius:
          </span>
          <button
            type="button"
            onClick={() => onChangeRangeKm(0.5)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
              rangeKm === 0.5 ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            500 m
          </button>
          <button
            type="button"
            onClick={() => onChangeRangeKm(1.0)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              rangeKm === 1.0
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-amber-300" />
            1 km (Walking)
          </button>
          <button
            type="button"
            onClick={() => onChangeRangeKm(2.0)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
              rangeKm === 2.0 ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            2 km
          </button>
          <button
            type="button"
            onClick={() => onChangeRangeKm(5.0)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
              rangeKm === 5.0 ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            5 km
          </button>
        </div>

        {/* Right: Providers Count & Layer Toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 hover:text-stone-900 select-none">
            <input
              type="checkbox"
              checked={showPlacesOnMap}
              onChange={(e) => setShowPlacesOnMap(e.target.checked)}
              className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <span>Google Places ({inRangePlaces.length})</span>
          </label>
          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-mono font-semibold">
            {inRangeServices.length + (showPlacesOnMap ? inRangePlaces.length : 0)} in {rangeKm}km
          </span>
        </div>
      </div>

      {/* Real Google Maps Container */}
      <div className="relative w-full h-[450px] md:h-[520px]">
        <APIProvider apiKey={apiKey}>
          <GoogleMap
            mapId="DEMO_MAP_ID"
            defaultCenter={userLocation}
            defaultZoom={15}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Dynamic Map Controller for Location & Places Search */}
            <MapController
              userLocation={userLocation}
              rangeKm={rangeKm}
              onPlacesLoaded={(places) => setGooglePlaces(places)}
            />

            {/* User GPS Beacon Marker */}
            <AdvancedMarker position={userLocation} zIndex={100}>
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-50" />
                <div className="relative w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
                  ●
                </div>
              </div>
            </AdvancedMarker>

            {/* Pop-Up Service Markers */}
            {inRangeServices.map((service) => {
              const pos = service.geoCoordinates || { lat: 37.7749, lng: -122.4194 };
              const isSelected = activeServiceInfo?.id === service.id;

              return (
                <AdvancedMarker
                  key={service.id}
                  position={pos}
                  onClick={() => {
                    setActiveServiceInfo(service);
                    setActivePlaceInfo(null);
                    onSelectService(service);
                  }}
                  zIndex={isSelected ? 90 : 50}
                >
                  <div className="cursor-pointer group">
                    <div
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1 border ${
                        isSelected
                          ? 'bg-stone-950 text-white border-white scale-110'
                          : service.isLiveNow
                          ? 'bg-amber-600 text-white border-amber-400'
                          : 'bg-stone-900 text-amber-200 border-stone-700'
                      }`}
                    >
                      <span>₹{service.price}</span>
                      <span className="text-[10px] font-normal text-stone-200">
                        {formatDistance(service.distanceKm || 0)}
                      </span>
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Google Places Markers */}
            {showPlacesOnMap &&
              inRangePlaces.map((place) => {
                const isSelected = activePlaceInfo?.id === place.id;
                return (
                  <AdvancedMarker
                    key={place.id}
                    position={place.coordinates}
                    onClick={() => {
                      setActivePlaceInfo(place);
                      setActiveServiceInfo(null);
                    }}
                    zIndex={isSelected ? 85 : 40}
                  >
                    <div className="cursor-pointer">
                      <div
                        className={`p-1.5 rounded-full border-2 border-white shadow-md transition-transform ${
                          isSelected ? 'bg-emerald-700 scale-125' : 'bg-emerald-600 hover:scale-110'
                        } text-white flex items-center justify-center`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* InfoWindow for Active Pop-up Service */}
            {activeServiceInfo && (
              <InfoWindow
                position={activeServiceInfo.geoCoordinates || userLocation}
                onCloseClick={() => setActiveServiceInfo(null)}
              >
                <div className="p-1 max-w-[260px] text-stone-900">
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1">
                    <span className="font-semibold text-stone-800">{activeServiceInfo.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-800 font-bold">
                      {formatDistance(activeServiceInfo.distanceKm || 0)} away
                    </span>
                  </div>
                  <h4 className="text-sm font-bold leading-tight">{activeServiceInfo.title}</h4>
                  <p className="text-xs text-stone-500 mt-0.5 truncate">{activeServiceInfo.locationName}</p>
                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-sm font-bold tabular-nums">
                      ₹{activeServiceInfo.price}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenBooking(activeServiceInfo)}
                      className="px-2.5 py-1 bg-stone-900 text-white rounded text-xs font-semibold hover:bg-stone-800"
                    >
                      Book Spot
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* InfoWindow for Google Place */}
            {activePlaceInfo && (
              <InfoWindow
                position={activePlaceInfo.coordinates}
                onCloseClick={() => setActivePlaceInfo(null)}
              >
                <div className="p-1 max-w-[260px] text-stone-900">
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium mb-1">
                    <span>Google Place</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDistance(activePlaceInfo.distanceKm || 0)}</span>
                  </div>
                  <h4 className="text-sm font-bold leading-tight">{activePlaceInfo.name}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">{activePlaceInfo.address}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{activePlaceInfo.rating?.toFixed(1) || '4.8'}</span>
                      <span className="text-stone-400 font-normal">({activePlaceInfo.userRatingCount})</span>
                    </div>
                    {activePlaceInfo.googleMapsUri && (
                      <a
                        href={activePlaceInfo.googleMapsUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-900 underline font-semibold flex items-center gap-0.5"
                      >
                        Directions
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </APIProvider>

        {/* 1km Range Radar Badge Overlay */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-stone-200/90 shadow-md text-xs">
          <div className="flex items-center gap-2 text-stone-800 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Radar Range: {rangeKm} km</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            {inRangeServices.length} Pop-ups + {showPlacesOnMap ? inRangePlaces.length : 0} Google Places within {rangeKm}km
          </span>
        </div>
      </div>
    </div>
  );
};
