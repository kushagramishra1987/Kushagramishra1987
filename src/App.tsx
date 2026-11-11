import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PopUpService, Provider, Booking, CategoryFilter, LocationPermissionStatus, CityPreset } from './types';
import {
  getStoredProviders,
  getStoredServices,
  getStoredBookings,
  getActiveProviderId,
  setActiveProviderId,
  getStoredFavoriteIds,
  saveFavoriteIds,
  toggleStoredFavoriteId,
} from './utils/storage';
import {
  DEFAULT_USER_LOCATION,
  INDIAN_CITIES,
  LatLng,
  calculateDistanceKm,
  formatDistance,
  getLiveLocationDetails,
  LiveLocationDetails,
  fetchReverseGeocode,
} from './utils/geo';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { InteractiveMap } from './components/InteractiveMap';
import { GoogleMapView } from './components/GoogleMapView';
import { ServiceCard } from './components/ServiceCard';
import { BookingModal } from './components/BookingModal';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { ProviderPortal } from './components/ProviderPortal';
import { ProviderProfilesView } from './components/ProviderProfilesView';
import { ProviderSelfRegistration } from './components/ProviderSelfRegistration';
import { CorrectLocationModal } from './components/CorrectLocationModal';
import { MyBookings } from './components/MyBookingsModal';
import { MyFavorites } from './components/MyFavorites';
import {
  MapPin,
  Calendar,
  Grid,
  Map,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Heart,
  Clock,
  LocateFixed,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Radio,
  Compass,
  Building2,
  Star,
  Store,
  Users,
  ExternalLink,
} from 'lucide-react';

const CATEGORIES: CategoryFilter[] = [
  'All',
  'Electronics',
  'Mason',
  'Glass Work',
  'Automobile',
  'Tyre Repair',
  'House Maid (Jhadu-Pochha)',
  'Cook & Maharaj',
  'Auto Driver',
  'Painter',
  'Electrician',
  'Plumber',
  'Blade & Dharwala',
  'Botanical & Balcony',
  'Chai & Specialty Kaapi',
  'Bicycle Clinic',
  'Leather & Sneaker Spa',
  'Heritage & Home Craft',
];

export default function App() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<PopUpService[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);

  // Nav tab
  const [currentTab, setCurrentTab] = useState<'explore' | 'providers' | 'create-profile' | 'map' | 'my-favorites' | 'my-bookings' | 'provider-studio'>('explore');

  // Sub-tab on Explore view: 'services' or 'providers'
  const [exploreSubTab, setExploreSubTab] = useState<'services' | 'providers'>('services');
  const [selectedProviderProfileId, setSelectedProviderProfileId] = useState<string | null>('prov-1');

  // Favorites state
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Indian Cities state
  const [selectedCity, setSelectedCity] = useState<CityPreset>(INDIAN_CITIES[0]);

  // Google Maps & 1km Range Geolocation State (Restores saved custom location if present)
  const [userLocation, setUserLocation] = useState<LatLng>(() => {
    const saved = localStorage.getItem('hunt_saved_user_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_USER_LOCATION;
  });
  const [reverseGeocoded, setReverseGeocoded] = useState<Partial<LiveLocationDetails> | null>(() => {
    const saved = localStorage.getItem('hunt_saved_location_details');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });
  const [isCorrectLocationModalOpen, setIsCorrectLocationModalOpen] = useState(false);
  const [isUsingLiveLocation, setIsUsingLiveLocation] = useState<boolean>(true);
  const [liveLocationLabel, setLiveLocationLabel] = useState<string>('Live GPS Radar (1km)');
  const [rangeFilterKm, setRangeFilterKm] = useState<number>(1.0); // 1km by default!
  const [onlyWithin1Km, setOnlyWithin1Km] = useState<boolean>(true); // default true for 1km discovery
  const [isSyncingLocation, setIsSyncingLocation] = useState<boolean>(false);
  const [locationPermission, setLocationPermission] = useState<LocationPermissionStatus>('prompt');
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isWatchingLocation, setIsWatchingLocation] = useState<boolean>(false);
  const [mapEngine, setMapEngine] = useState<'google' | 'artisan'>('google');
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOption, setSearchOption] = useState<'all' | 'services' | 'providers'>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All Neighborhoods');
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('grid');
  const [sortBy, setSortBy] = useState<'recommended' | 'distance' | 'price-asc' | 'price-desc' | 'spots-left'>('recommended');

  // Modals
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<PopUpService | null>(null);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<PopUpService | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Tier 2: Quota exceeded event listener (Section 8 Case A)
  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const loadData = () => {
    const provs = getStoredProviders();
    const srvs = getStoredServices();
    const bks = getStoredBookings();
    const favs = getStoredFavoriteIds();
    setProviders(provs);
    setServices(srvs);
    setBookings(bks);
    setFavoriteIds(favs);

    const activeId = getActiveProviderId();
    const matched = provs.find((p) => p.id === activeId) || provs[0] || null;
    setActiveProvider(matched);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectActiveProvider = (p: Provider) => {
    setActiveProvider(p);
    setActiveProviderId(p.id);
  };

  const handleCityChange = (city: CityPreset) => {
    setIsUsingLiveLocation(false);
    setSelectedCity(city);
    setUserLocation(city.coordinates);
    setSelectedNeighborhood('All Neighborhoods');
    showToast(`Switched map radar to ${city.name}, ${city.state}`);
  };

  const handleSelectLiveLocation = () => {
    setIsUsingLiveLocation(true);
    handleSyncLocation(false);
  };

  const handleSelectProviderProfile = (providerId: string) => {
    setSelectedProviderProfileId(providerId);
    setExploreSubTab('providers');
    setCurrentTab('explore');
    const el = document.getElementById('explore-subtabs-anchor');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Real-world GPS Location Synchronization & Permission Management
  const handleSyncLocation = (silent: boolean = false) => {
    if (!navigator.geolocation) {
      setLocationPermission('unsupported');
      if (!silent) showToast('Geolocation is not supported by your browser.');
      return;
    }

    setIsSyncingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(newLoc);
        localStorage.setItem('hunt_saved_user_location', JSON.stringify(newLoc));
        setLocationAccuracy(pos.coords.accuracy);
        setLocationPermission('granted');
        setIsSyncingLocation(false);
        setIsUsingLiveLocation(true);

        // Instant reverse geocode query to get authentic neighborhood & city
        fetchReverseGeocode(newLoc).then((res) => {
          if (res) {
            setReverseGeocoded((prev) => ({ ...prev, ...res }));
            localStorage.setItem('hunt_saved_location_details', JSON.stringify(res));
          }
        });

        // Calculate proximity to Indian cities to match nearest hub
        let closestCity = INDIAN_CITIES[0];
        let minDistance = calculateDistanceKm(newLoc, INDIAN_CITIES[0].coordinates);
        for (const c of INDIAN_CITIES) {
          const dist = calculateDistanceKm(newLoc, c.coordinates);
          if (dist < minDistance) {
            minDistance = dist;
            closestCity = c;
          }
        }
        const locDetails = getLiveLocationDetails(newLoc, closestCity, reverseGeocoded);
        setSelectedCity(closestCity);
        setLiveLocationLabel(`${locDetails.name} · ${locDetails.googleTag}`);

        if (!silent) {
          showToast(`Live GPS Active! ${locDetails.name} · Tag: ${locDetails.googleTag} (Within 1km Radar)`);
        }
      },
      (err) => {
        setIsSyncingLocation(false);
        if (err.code === 1) {
          // PERMISSION_DENIED
          setLocationPermission('denied');
          if (!silent) {
            showToast('Location permission denied. Click "Fix / Change Spot" to search your area.');
          }
        } else if (err.code === 2) {
          // POSITION_UNAVAILABLE
          if (!silent) showToast(`GPS signal unavailable. You can set your spot using "Fix / Change Spot".`);
        } else if (err.code === 3) {
          // TIMEOUT
          if (!silent) showToast('Location request timed out. Please try again or search your area.');
        } else {
          if (!silent) showToast('Unable to determine your GPS location.');
        }
      },
      { timeout: 12000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  // Handler for manual or searched location correction
  const handleApplyCorrectedLocation = (
    newCoords: LatLng,
    overrideDetails?: Partial<LiveLocationDetails>
  ) => {
    setUserLocation(newCoords);
    localStorage.setItem('hunt_saved_user_location', JSON.stringify(newCoords));

    if (overrideDetails) {
      setReverseGeocoded((prev) => ({ ...prev, ...overrideDetails }));
      localStorage.setItem('hunt_saved_location_details', JSON.stringify(overrideDetails));
      if (overrideDetails.city) {
        const matched = INDIAN_CITIES.find(
          (c) => c.name.toLowerCase() === overrideDetails.city?.toLowerCase()
        );
        if (matched) {
          setSelectedCity(matched);
        }
      }
    }

    setLocationPermission('granted');
    setIsUsingLiveLocation(true);
    showToast(`Live location updated to ${overrideDetails?.name || 'Selected Spot'} (1 km Radar active)`);
  };

  // Live Continuous Walk Tracking
  const handleToggleWatchLocation = () => {
    if (isWatchingLocation) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsWatchingLocation(false);
      showToast('Live walk tracking paused.');
    } else {
      if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser.');
        return;
      }
      setIsWatchingLocation(true);
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationAccuracy(pos.coords.accuracy);
          setLocationPermission('granted');
        },
        (err) => {
          console.warn('watchPosition error:', err);
          if (err.code === 1) {
            setLocationPermission('denied');
            setIsWatchingLocation(false);
            showToast('Location permission denied.');
          }
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
      watchIdRef.current = id;
      showToast('Live walk tracking active! 1km radar updates in real-time as you move.');
    }
  };

  // Check Permissions API on load and auto-sync immediately
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationPermission('unsupported');
      return;
    }

    // Auto-detect live GPS location on startup
    handleSyncLocation(true);

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((perm) => {
          setLocationPermission(perm.state as LocationPermissionStatus);

          if (perm.state === 'granted') {
            handleSyncLocation(true);
          }

          perm.onchange = () => {
            setLocationPermission(perm.state as LocationPermissionStatus);
            if (perm.state === 'granted') {
              handleSyncLocation(true);
            }
          };
        })
        .catch(() => {
          // Non-blocking query failure
        });
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Micro-offsets distributed inside 1 km radius (150m to 850m) from userLocation
  const RADIUS_1KM_OFFSETS = [
    { dLat: 0.0018, dLng: 0.0015 }, // ~250m NE
    { dLat: -0.0022, dLng: 0.0012 }, // ~280m SE
    { dLat: 0.0032, dLng: -0.0024 }, // ~440m NW
    { dLat: -0.0015, dLng: -0.0035 }, // ~410m SW
    { dLat: 0.0042, dLng: 0.0030 }, // ~610m NE
    { dLat: -0.0048, dLng: 0.0020 }, // ~570m SE
    { dLat: 0.0055, dLng: -0.0038 }, // ~750m NW
    { dLat: -0.0038, dLng: -0.0050 }, // ~710m SW
    { dLat: 0.0022, dLng: 0.0055 }, // ~650m E
    { dLat: -0.0058, dLng: -0.0012 }, // ~660m S
  ];

  // Calculate distance from current userLocation to each service, localized within 1km radius
  const servicesWithDistances = useMemo(() => {
    return services.map((s, idx) => {
      const offset = RADIUS_1KM_OFFSETS[idx % RADIUS_1KM_OFFSETS.length];
      const localizedCoords = {
        lat: Number((userLocation.lat + offset.dLat).toFixed(6)),
        lng: Number((userLocation.lng + offset.dLng).toFixed(6)),
      };
      const dist = calculateDistanceKm(userLocation, localizedCoords);
      return {
        ...s,
        geoCoordinates: localizedCoords,
        distanceKm: dist,
        distanceMeters: Math.round(dist * 1000),
      };
    });
  }, [services, userLocation]);

  // Reverse geocoding hook for live coordinates
  useEffect(() => {
    let isCancelled = false;
    fetchReverseGeocode(userLocation).then((res) => {
      if (!isCancelled && res) {
        setReverseGeocoded((prev) => ({ ...prev, ...res }));
        if (res.city) {
          const matched = INDIAN_CITIES.find(
            (c) => c.name.toLowerCase() === res.city?.toLowerCase()
          );
          if (matched) {
            setSelectedCity(matched);
          }
        }
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [userLocation.lat, userLocation.lng]);

  // Comprehensive Name and Google Tag of the live location
  const liveLocationDetails = useMemo(() => {
    return getLiveLocationDetails(userLocation, selectedCity, reverseGeocoded);
  }, [userLocation, selectedCity, reverseGeocoded]);

  // Provider micro-offsets distributed within 1 km radius (~120m to 880m) from live location
  const PROVIDER_RADIUS_1KM_OFFSETS = [
    { dLat: 0.0012, dLng: 0.0010 }, // ~160m NE
    { dLat: -0.0018, dLng: 0.0014 }, // ~240m SE
    { dLat: 0.0025, dLng: -0.0018 }, // ~340m NW
    { dLat: -0.0028, dLng: -0.0022 }, // ~410m SW
    { dLat: 0.0038, dLng: 0.0022 }, // ~520m NE
    { dLat: -0.0042, dLng: 0.0026 }, // ~590m SE
    { dLat: 0.0049, dLng: -0.0031 }, // ~670m NW
    { dLat: -0.0051, dLng: -0.0036 }, // ~730m SW
    { dLat: 0.0032, dLng: 0.0050 }, // ~710m E
    { dLat: -0.0056, dLng: -0.0018 }, // ~680m S
    { dLat: 0.0062, dLng: 0.0015 }, // ~780m N
    { dLat: -0.0065, dLng: 0.0024 }, // ~830m S
    { dLat: 0.0020, dLng: -0.0062 }, // ~810m W
    { dLat: -0.0035, dLng: 0.0068 }, // ~870m SE
  ];

  // Calculate distance from live userLocation to each service provider, localized within 1km
  const providersWithDistances = useMemo(() => {
    return providers.map((p, idx) => {
      const offset = PROVIDER_RADIUS_1KM_OFFSETS[idx % PROVIDER_RADIUS_1KM_OFFSETS.length];
      const localizedCoords = {
        lat: Number((userLocation.lat + offset.dLat).toFixed(6)),
        lng: Number((userLocation.lng + offset.dLng).toFixed(6)),
      };
      const dist = calculateDistanceKm(userLocation, localizedCoords);
      const isActive = p.isActiveNow !== false;
      return {
        ...p,
        geoCoordinates: localizedCoords,
        distanceKm: dist,
        distanceMeters: Math.round(dist * 1000),
        isActiveNow: isActive,
        liveGoogleTag: liveLocationDetails.googleTag,
        neighborhood: liveLocationDetails.neighborhood || p.neighborhood,
        city: liveLocationDetails.city || p.city,
      };
    });
  }, [providers, userLocation, liveLocationDetails]);

  // Filter ONLY active service providers within 1 km radius of live location
  const activeProvidersWithin1Km = useMemo(() => {
    return providersWithDistances.filter((p) => {
      if (!p.isActiveNow) return false;
      if (onlyWithin1Km && p.distanceKm !== undefined && p.distanceKm > rangeFilterKm) {
        return false;
      }
      return true;
    });
  }, [providersWithDistances, onlyWithin1Km, rangeFilterKm]);

  // Saved Favorites list with distances
  const favoriteServices = useMemo(() => {
    return servicesWithDistances.filter((s) => favoriteIds.includes(s.id));
  }, [servicesWithDistances, favoriteIds]);

  const handleToggleFavorite = (serviceId: string) => {
    const { isFavorite, favorites } = toggleStoredFavoriteId(serviceId);
    setFavoriteIds(favorites);
    const matched = services.find((s) => s.id === serviceId);
    const title = matched ? matched.title : 'Service';
    showToast(isFavorite ? `Saved "${title}" to your favorites!` : `Removed "${title}" from favorites.`);
  };

  const handleClearAllFavorites = () => {
    saveFavoriteIds([]);
    setFavoriteIds([]);
    showToast('Cleared all saved favorites.');
  };

  // Filter logic
  const filteredServices = servicesWithDistances.filter((s) => {
    // Only show active services in customer views
    if (s.status !== 'active') return false;

    // 1km radius filter
    if (onlyWithin1Km && s.distanceKm !== undefined && s.distanceKm > rangeFilterKm) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'All' && s.category !== selectedCategory) {
      return false;
    }

    // Neighborhood filter
    if (selectedNeighborhood !== 'All Neighborhoods' && s.neighborhood !== selectedNeighborhood) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchProvider = s.providerName.toLowerCase().includes(q);
      const matchCategory = s.category.toLowerCase().includes(q);
      const matchLocation = s.locationName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchProvider && !matchCategory && !matchLocation) {
        return false;
      }
    }

    return true;
  });

  // Sort logic
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortBy === 'distance') {
      return (a.distanceKm || 0) - (b.distanceKm || 0);
    }
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'spots-left') return a.remainingSpots - b.remainingSpots;
    // default recommended: live now first, then distance, then rating
    if (a.isLiveNow && !b.isLiveNow) return -1;
    if (!a.isLiveNow && b.isLiveNow) return 1;
    return (a.distanceKm || 0) - (b.distanceKm || 0);
  });

  const handleBookingCompleted = (booking: Booking) => {
    loadData();
    showToast(`Spot confirmed for ${booking.serviceTitle}! Pass: ${booking.bookingCode}`);
  };

  const activeProviderForModal = selectedServiceForDetail
    ? providers.find((p) => p.id === selectedServiceForDetail.providerId)
    : undefined;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* Tier 2: Quota Exceeded Sticky Banner (Section 8 Case A) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        bookingCount={bookings.filter((b) => b.status === 'confirmed').length}
        favoritesCount={favoriteIds.length}
        locationPermission={locationPermission}
        isSyncingLocation={isSyncingLocation}
        onSyncLocation={() => handleSyncLocation(false)}
        onOpenLaunchModal={() => {
          setCurrentTab('create-profile');
        }}
        liveLocationDetails={liveLocationDetails}
        onOpenCorrectLocation={() => setIsCorrectLocationModalOpen(true)}
      />

      {/* VIEW: EXPLORE POP-UPS */}
      {currentTab === 'explore' && (
        <main className="flex-1">
          {/* Hero Showcase */}
          <Hero
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchOption={searchOption}
            onSearchOptionChange={(opt) => {
              setSearchOption(opt);
              if (opt === 'providers') {
                setExploreSubTab('providers');
              } else if (opt === 'services') {
                setExploreSubTab('services');
              }
            }}
            providers={activeProvidersWithin1Km}
            activeProvidersCount={activeProvidersWithin1Km.length}
            liveLocationDetails={liveLocationDetails}
            onOpenCorrectLocation={() => setIsCorrectLocationModalOpen(true)}
            onSelectProviderProfile={handleSelectProviderProfile}
            onSwitchToProvidersTab={() => {
              setExploreSubTab('providers');
              const el = document.getElementById('explore-subtabs-anchor');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            selectedCity={selectedCity}
            onCityChange={handleCityChange}
            cities={INDIAN_CITIES}
            availableNeighborhoods={selectedCity.neighborhoods}
            selectedNeighborhood={selectedNeighborhood}
            onNeighborhoodChange={setSelectedNeighborhood}
            onOpenLaunchModal={() => setCurrentTab('create-profile')}
            activePopupsCount={services.filter((s) => s.status === 'active').length}
            isUsingLiveLocation={isUsingLiveLocation}
            onSelectLiveLocation={handleSelectLiveLocation}
            isSyncingLocation={isSyncingLocation}
            locationPermission={locationPermission}
            locationAccuracy={locationAccuracy}
            liveLocationLabel={liveLocationLabel}
            userLocation={userLocation}
          />

          {/* MULTI-TAB SWITCHER: Services Sub-Tab vs Service Providers Profile Sub-Tab */}
          <div id="explore-subtabs-anchor" className="max-w-7xl mx-auto px-4 sm:px-6 pt-7 pb-2">
            <div className="flex items-center justify-between border-b border-stone-200 gap-4 flex-wrap pb-1">
              <div className="flex items-center gap-2 sm:gap-6">
                <button
                  type="button"
                  onClick={() => setExploreSubTab('services')}
                  className={`pb-3 px-1 sm:px-2 text-sm sm:text-base font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    exploreSubTab === 'services'
                      ? 'border-amber-900 text-stone-900 font-display'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Store className={`w-4 h-4 ${exploreSubTab === 'services' ? 'text-amber-900' : 'text-stone-400'}`} />
                  <span>Pop-Up Services</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${
                    exploreSubTab === 'services' ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {sortedServices.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setExploreSubTab('providers')}
                  className={`pb-3 px-1 sm:px-2 text-sm sm:text-base font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    exploreSubTab === 'providers'
                      ? 'border-amber-900 text-stone-900 font-display'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Star className={`w-4 h-4 ${exploreSubTab === 'providers' ? 'fill-amber-400 text-amber-500' : 'text-stone-400'}`} />
                  <span>Service Providers & Reviews</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${
                    exploreSubTab === 'providers' ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {activeProvidersWithin1Km.length} Ustads (1km)
                  </span>
                </button>
              </div>

              <div className="text-xs text-stone-500 pb-3 hidden sm:flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>
                  {exploreSubTab === 'services'
                    ? 'Explore real-time spots within 1km'
                    : 'Customer reviews, star ratings & direct appointments'}
                </span>
              </div>
            </div>
          </div>

          {exploreSubTab === 'services' ? (
            <>
              {/* 1km Range Radar & GPS Permission Banner */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
                <div className={`rounded-2xl p-4 sm:p-5 shadow-sm border transition-all ${
                  locationPermission === 'granted'
                    ? 'bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white border-stone-800'
                    : locationPermission === 'denied'
                    ? 'bg-red-950/40 text-stone-100 border-red-900/60'
                    : 'bg-gradient-to-r from-amber-950/60 via-stone-900 to-stone-900 text-white border-amber-900/50'
                }`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
                    locationPermission === 'granted'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : locationPermission === 'denied'
                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                  }`}>
                    {locationPermission === 'granted' ? (
                      <Navigation className="w-5 h-5 text-emerald-400" />
                    ) : locationPermission === 'denied' ? (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base font-display">
                        Google Maps 1km Local Radar · {liveLocationDetails.name}
                      </span>

                      {liveLocationDetails.googleTag && (
                        <a
                          href={liveLocationDetails.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-amber-400/20 text-amber-300 hover:text-amber-100 border border-amber-400/30 text-[11px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                          title="View Plus Code on Google Maps"
                        >
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>Google Tag: {liveLocationDetails.googleTag}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-amber-400" />
                        </a>
                      )}

                      {locationPermission === 'granted' ? (
                        <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                          <span>GPS Active: 1 km Radius</span>
                          {locationAccuracy && (
                            <span className="text-emerald-200/80 font-mono text-[10px]">
                              (±{Math.round(locationAccuracy)}m)
                            </span>
                          )}
                        </span>
                      ) : locationPermission === 'denied' ? (
                        <span className="bg-red-500/20 text-red-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-red-500/30 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-red-400" />
                          <span>Location Blocked in Browser</span>
                        </span>
                      ) : (
                        <span className="bg-amber-500/20 text-amber-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                          <span>1km Live Radar Ready</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-300 mt-1 max-w-xl leading-relaxed">
                      {locationPermission === 'granted'
                        ? `Live GPS coordinates active at ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)} (${liveLocationDetails.neighborhood}, ${liveLocationDetails.city}). Filtering ${activeProvidersWithin1Km.length} active service providers within 1,000 meters.`
                        : locationPermission === 'denied'
                        ? 'Browser location permission was blocked. Please click the lock or settings icon in your address bar to allow location access, then click Retry.'
                        : 'Detecting your live position via Google Maps GPS to show only verified service providers active within 1 km.'}
                    </p>

                    <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Showing {activeProvidersWithin1Km.length} active Ustads within 1 km radius</span>
                      </span>
                      <span className="text-stone-500">•</span>
                      <span className="text-stone-300">
                        Live Location Tag: <span className="font-mono text-amber-300 font-semibold">{liveLocationDetails.googleTag}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
                  {locationPermission !== 'granted' ? (
                    <button
                      type="button"
                      onClick={() => handleSyncLocation(false)}
                      disabled={isSyncingLocation}
                      className="flex-1 lg:flex-none px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <LocateFixed className={`w-4 h-4 ${isSyncingLocation ? 'animate-spin' : 'text-stone-950'}`} />
                      <span>{isSyncingLocation ? 'Requesting Permission...' : 'Switch On Location Permission'}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSyncLocation(false)}
                        disabled={isSyncingLocation}
                        className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-stone-700 shadow-xs"
                      >
                        <LocateFixed className={`w-3.5 h-3.5 ${isSyncingLocation ? 'animate-spin' : 'text-amber-400'}`} />
                        <span>{isSyncingLocation ? 'Syncing...' : 'Re-sync GPS'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleWatchLocation}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          isWatchingLocation
                            ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                            : 'bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isWatchingLocation ? 'bg-white animate-ping' : 'bg-stone-400'}`} />
                        <span>{isWatchingLocation ? 'Live Walk: ON' : 'Live Walk Tracking'}</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsCorrectLocationModalOpen(true)}
                    className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    title="Live location wrong? Click to search or fix your exact spot"
                  >
                    <MapPin className="w-3.5 h-3.5 text-stone-950" />
                    <span>Fix / Change Spot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOnlyWithin1Km(!onlyWithin1Km)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      onlyWithin1Km
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                        : 'bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700'
                    }`}
                  >
                    {onlyWithin1Km ? '✓ Filter: ≤ 1km Only' : 'Filter by ≤ 1km'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Filter Bar & View Toggle */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              {/* Category Filter Buttons (Functional Segmented Control) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-stone-900 text-white font-semibold shadow-xs'
                        : 'bg-white text-stone-600 border border-stone-200 hover:text-stone-900 hover:border-stone-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* View Switcher & Sorting */}
              <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-stone-200 text-xs font-medium text-stone-600">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                      viewMode === 'grid'
                        ? 'bg-stone-100 text-stone-900 font-semibold'
                        : 'hover:text-stone-900'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Grid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                      viewMode === 'split'
                        ? 'bg-stone-100 text-stone-900 font-semibold'
                        : 'hover:text-stone-900'
                    }`}
                  >
                    <Map className="w-3.5 h-3.5" />
                    <span>Map Split</span>
                  </button>
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    aria-label="Sort Pop-ups"
                    className="pl-3 pr-7 py-1.5 text-xs font-medium bg-white border border-stone-200 rounded-lg text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-900 appearance-none cursor-pointer"
                  >
                    <option value="recommended">Featured / Live First</option>
                    <option value="distance">Nearest Distance (GPS)</option>
                    <option value="spots-left">Spots Remaining (Low to High)</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Quiet Count and Active Filters snippet */}
            <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-stone-800 tabular-nums flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>{sortedServices.length} {sortedServices.length === 1 ? 'service' : 'services'} available within 1 km radius of your live location</span>
                </span>
                {onlyWithin1Km && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-semibold">≤ 1 km radius active</span>
                  </>
                )}
                {selectedCategory !== 'All' && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Category: {selectedCategory}</span>
                  </>
                )}
                {selectedNeighborhood !== 'All Neighborhoods' && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>In {selectedNeighborhood}</span>
                  </>
                )}
              </div>
              {(selectedCategory !== 'All' || selectedNeighborhood !== 'All Neighborhoods' || searchQuery || onlyWithin1Km) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedNeighborhood('All Neighborhoods');
                    setSearchQuery('');
                    setOnlyWithin1Km(false);
                  }}
                  className="text-amber-900 hover:underline font-medium"
                >
                  Reset all filters
                </button>
              )}
            </div>
          </section>

          {/* Grid or Map Split Content Area */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {viewMode === 'split' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Google Maps Platform View */}
                <div className="lg:col-span-7 sticky top-20">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-800" />
                      Google Maps 1km Radar View
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setMapEngine(mapEngine === 'google' ? 'artisan' : 'google')}
                        className="text-stone-500 hover:text-stone-800 underline text-[11px]"
                      >
                        {mapEngine === 'google' ? 'Switch to Stylized Map' : 'Switch to Google Maps'}
                      </button>
                    </div>
                  </div>

                  {mapEngine === 'google' ? (
                    <GoogleMapView
                      services={sortedServices}
                      selectedService={selectedServiceForDetail}
                      onSelectService={(s) => setSelectedServiceForDetail(s)}
                      onOpenBooking={(s) => setSelectedServiceForBooking(s)}
                      userLocation={userLocation}
                      onUpdateUserLocation={setUserLocation}
                      rangeKm={rangeFilterKm}
                      onChangeRangeKm={setRangeFilterKm}
                      isSyncingLocation={isSyncingLocation}
                      onSyncLocation={() => handleSyncLocation(false)}
                      locationPermission={locationPermission}
                      locationAccuracy={locationAccuracy}
                      isWatchingLocation={isWatchingLocation}
                      onToggleWatchLocation={handleToggleWatchLocation}
                    />
                  ) : (
                    <InteractiveMap
                      services={sortedServices}
                      selectedService={selectedServiceForDetail}
                      onSelectService={(s) => setSelectedServiceForDetail(s)}
                      onOpenBooking={(s) => setSelectedServiceForBooking(s)}
                    />
                  )}
                </div>

                {/* Right: Scrollable Service List */}
                <div className="lg:col-span-5 space-y-4">
                  {sortedServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      isFavorite={favoriteIds.includes(service.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onSelect={(s) => setSelectedServiceForDetail(s)}
                      onBook={(s) => setSelectedServiceForBooking(s)}
                      onSelectProviderProfile={handleSelectProviderProfile}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Pure 3-Column Desktop Grid */
              <div>
                {sortedServices.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center my-6">
                    <p className="text-base font-semibold text-stone-800">
                      No matching pop-up services found
                    </p>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                      Try clearing your search query or switching neighborhoods to discover active local artisans.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('All');
                        setSelectedNeighborhood('All Neighborhoods');
                        setSearchQuery('');
                      }}
                      className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg"
                    >
                      Show All Pop-ups
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {sortedServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        isFavorite={favoriteIds.includes(service.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onSelect={(s) => setSelectedServiceForDetail(s)}
                        onBook={(s) => setSelectedServiceForBooking(s)}
                        onSelectProviderProfile={handleSelectProviderProfile}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Artisan & Community Story Section */}
          <section className="bg-sky-50/80 border-t border-sky-200/70 py-16 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="max-w-2xl mb-10">
                <div className="text-xs font-bold text-sky-900 tracking-wider uppercase mb-1">
                  How Pop-up Commerce Works in India
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display">
                  Local Ustads and indie specialists bring their workshop to your street corner.
                </h2>
                <p className="text-stone-600 text-sm sm:text-base mt-2 leading-relaxed">
                  Hunt eliminates commercial rent and platform commissions so Indian master artisans retain 100% of their earnings while neighbors get authentic, master craftwork within 1km.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 rounded-2xl border border-sky-200/80 bg-white shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-base font-bold text-stone-900 font-display block">
                      01. Pop-Up Spot Drops
                    </span>
                    <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                      Artisans announce their pop-up spots at local roasters, apartment courtyard benches, or roadside mobile vans with limited slots.
                    </p>
                  </div>
                  <div className="mt-4 text-xs font-semibold text-sky-700">
                    Live Google Maps pins & walk radar
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-sky-200/80 bg-white shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-base font-bold text-stone-900 font-display block">
                      02. Guaranteed Slot Passes
                    </span>
                    <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                      Reserve a guaranteed appointment without waiting in unpredictable lines. Instant pass reference with one-click WhatsApp sharing.
                    </p>
                  </div>
                  <div className="mt-4 text-xs font-semibold text-sky-700">
                    WhatsApp booking pass + Calendar sync
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-sky-200/80 bg-white shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-base font-bold text-stone-900 font-display block">
                      03. Direct UPI or Cash on Spot
                    </span>
                    <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                      Scan the artisan's GPay, PhonePe, Paytm QR code or pay cash directly upon inspection. ₹0 platform surcharge.
                    </p>
                  </div>
                  <div className="mt-4 text-xs font-semibold text-sky-700">
                    100% direct to artisan's UPI ID
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <ProviderProfilesView
          providers={activeProvidersWithin1Km}
          services={services}
          selectedProviderId={selectedProviderProfileId}
          onSelectProviderId={setSelectedProviderProfileId}
          onBookService={(s) => setSelectedServiceForBooking(s)}
          onSelectServiceDetail={(s) => setSelectedServiceForDetail(s)}
          onRefreshData={loadData}
          onShowToast={showToast}
          externalSearchQuery={searchQuery}
          liveLocationDetails={liveLocationDetails}
          rangeKm={rangeFilterKm}
          onlyWithin1Km={onlyWithin1Km}
          onOpenCorrectLocation={() => setIsCorrectLocationModalOpen(true)}
        />
      )}
    </main>
  )}

  {/* VIEW: DIRECT SERVICE PROVIDERS & REVIEWS TAB */}
  {currentTab === 'providers' && (
    <main className="flex-1">
      <ProviderProfilesView
        providers={activeProvidersWithin1Km}
        services={services}
        selectedProviderId={selectedProviderProfileId}
        onSelectProviderId={setSelectedProviderProfileId}
        onBookService={(s) => setSelectedServiceForBooking(s)}
        onSelectServiceDetail={(s) => setSelectedServiceForDetail(s)}
        onRefreshData={loadData}
        onShowToast={showToast}
        externalSearchQuery={searchQuery}
        liveLocationDetails={liveLocationDetails}
        rangeKm={rangeFilterKm}
        onlyWithin1Km={onlyWithin1Km}
        onOpenCorrectLocation={() => setIsCorrectLocationModalOpen(true)}
      />
    </main>
  )}

  {/* VIEW: CREATE SERVICE PROVIDER SELF PROFILE TAB */}
  {currentTab === 'create-profile' && (
    <main className="flex-1">
      <ProviderSelfRegistration
        onProfileCreated={(newProvider) => {
          loadData();
          showToast(`Profile created successfully for ${newProvider.ownerName}! Aadhaar verified.`);
        }}
        onNavigateToProviders={(providerId) => {
          loadData();
          if (providerId) {
            setSelectedProviderProfileId(providerId);
          }
          setCurrentTab('providers');
          setExploreSubTab('providers');
        }}
        userLocation={userLocation}
      />
    </main>
  )}

      {/* VIEW: DEDICATED NEIGHBORHOOD MAP RADAR */}
      {currentTab === 'map' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-stone-900 font-display">
                  Google Maps 1km Local Radar · {liveLocationDetails.name}
                </h2>
                {liveLocationDetails.googleTag && (
                  <a
                    href={liveLocationDetails.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 text-xs font-mono px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Tag: {liveLocationDetails.googleTag}</span>
                    <ExternalLink className="w-3 h-3 text-amber-700" />
                  </a>
                )}
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-300">
                  Range: {rangeFilterKm} km
                </span>
                <span className="bg-stone-100 text-stone-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {activeProvidersWithin1Km.length} Active Ustads
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-stone-500">
                  Finding verified local service providers and pop-ups within 1km using Google Maps Platform.
                </span>
                <span className="text-stone-300 hidden sm:inline">|</span>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-medium text-stone-400">City:</span>
                  {INDIAN_CITIES.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleCityChange(c)}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors ${
                        selectedCity.name === c.name
                          ? 'bg-amber-900 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Engine & Radius Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {locationPermission !== 'granted' ? (
                <button
                  type="button"
                  onClick={() => handleSyncLocation(false)}
                  disabled={isSyncingLocation}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${isSyncingLocation ? 'animate-spin' : 'text-stone-950'}`} />
                  <span>{isSyncingLocation ? 'Switching on...' : 'Switch On Location Permission'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSyncLocation(false)}
                  disabled={isSyncingLocation}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${isSyncingLocation ? 'animate-spin' : 'text-amber-400'}`} />
                  <span>{isSyncingLocation ? 'Syncing...' : 'Sync GPS'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMapEngine(mapEngine === 'google' ? 'artisan' : 'google')}
                className="px-3 py-1.5 bg-white border border-stone-200 hover:border-stone-400 text-stone-700 text-xs font-medium rounded-lg"
              >
                {mapEngine === 'google' ? 'Stylized Map' : 'Google Maps'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              {mapEngine === 'google' ? (
                <GoogleMapView
                  services={sortedServices}
                  selectedService={selectedServiceForDetail}
                  onSelectService={(s) => setSelectedServiceForDetail(s)}
                  onOpenBooking={(s) => setSelectedServiceForBooking(s)}
                  userLocation={userLocation}
                  onUpdateUserLocation={setUserLocation}
                  rangeKm={rangeFilterKm}
                  onChangeRangeKm={setRangeFilterKm}
                  isSyncingLocation={isSyncingLocation}
                  onSyncLocation={() => handleSyncLocation(false)}
                  locationPermission={locationPermission}
                  locationAccuracy={locationAccuracy}
                  isWatchingLocation={isWatchingLocation}
                  onToggleWatchLocation={handleToggleWatchLocation}
                />
              ) : (
                <InteractiveMap
                  services={sortedServices}
                  selectedService={selectedServiceForDetail}
                  onSelectService={(s) => setSelectedServiceForDetail(s)}
                  onOpenBooking={(s) => setSelectedServiceForBooking(s)}
                />
              )}
            </div>

            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider block">
                Active Pop-ups Near Pins ({sortedServices.length})
              </span>
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {sortedServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedServiceForDetail(service)}
                    className="p-3.5 bg-white rounded-xl border border-stone-200 hover:border-stone-400 cursor-pointer transition-all flex gap-3 shadow-xs"
                  >
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stone-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <span className="font-medium text-stone-700">{service.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-800 font-semibold">{service.remainingSpots} left</span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 truncate mt-0.5">
                        {service.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {service.locationName}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-900 tabular-nums">
                          ₹{service.price}
                        </span>
                        <span className="text-amber-900 font-medium">Book &rarr;</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* VIEW: MY FAVORITES */}
      {currentTab === 'my-favorites' && (
        <main className="flex-1">
          <MyFavorites
            favoriteServices={favoriteServices}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onClearAllFavorites={handleClearAllFavorites}
            onSelectService={(s) => setSelectedServiceForDetail(s)}
            onBookService={(s) => setSelectedServiceForBooking(s)}
            onExplorePopups={() => setCurrentTab('explore')}
          />
        </main>
      )}

      {/* VIEW: MY BOOKINGS */}
      {currentTab === 'my-bookings' && (
        <main className="flex-1">
          <MyBookings
            bookings={bookings}
            onRefreshData={loadData}
            onExplorePopups={() => setCurrentTab('explore')}
          />
        </main>
      )}

      {/* VIEW: PROVIDER STUDIO */}
      {currentTab === 'provider-studio' && (
        <main className="flex-1">
          <ProviderPortal
            providers={providers}
            activeProvider={activeProvider}
            onSelectActiveProvider={handleSelectActiveProvider}
            onRefreshData={loadData}
            services={services}
            bookings={bookings}
            onOpenServiceDetail={(s) => setSelectedServiceForDetail(s)}
          />
        </main>
      )}

      {/* FOOTER */}
      <footer className="border-t border-stone-200 bg-white py-10 mt-auto text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/hunt_1f33bd30.png"
              alt="Hunt"
              className="h-7 w-auto object-contain"
            />
            <span className="text-stone-300">|</span>
            <span>Hyperlocal Pop-up Services & Spot Reservations</span>
          </div>

          <div className="flex items-center gap-6 text-stone-600">
            <button
              onClick={() => setCurrentTab('explore')}
              className="hover:text-stone-900 transition-colors"
            >
              Explore
            </button>
            <button
              onClick={() => setCurrentTab('map')}
              className="hover:text-stone-900 transition-colors"
            >
              Map
            </button>
            <button
              onClick={() => setCurrentTab('my-favorites')}
              className="hover:text-stone-900 transition-colors flex items-center gap-1"
            >
              <span>Favorites</span>
              {favoriteIds.length > 0 && (
                <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded-full font-mono border border-rose-200 font-semibold">
                  {favoriteIds.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setCurrentTab('my-bookings')}
              className="hover:text-stone-900 transition-colors"
            >
              Reservations
            </button>
            <button
              onClick={() => setCurrentTab('provider-studio')}
              className="hover:text-stone-900 transition-colors"
            >
              For Providers
            </button>
          </div>

          <div>
            <span>© 2026 Hunt Collective. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* MODAL: Service Detail */}
      {selectedServiceForDetail && (
        <ServiceDetailModal
          service={selectedServiceForDetail}
          provider={activeProviderForModal}
          isFavorite={favoriteIds.includes(selectedServiceForDetail.id)}
          onToggleFavorite={handleToggleFavorite}
          onClose={() => setSelectedServiceForDetail(null)}
          onViewProviderProfile={handleSelectProviderProfile}
          onBook={(s) => {
            setSelectedServiceForDetail(null);
            setSelectedServiceForBooking(s);
          }}
        />
      )}

      {/* MODAL: Booking Flow */}
      {selectedServiceForBooking && (
        <BookingModal
          service={selectedServiceForBooking}
          onClose={() => setSelectedServiceForBooking(null)}
          onBookingComplete={handleBookingCompleted}
        />
      )}

      {/* MODAL: Correct Live Location */}
      <CorrectLocationModal
        isOpen={isCorrectLocationModalOpen}
        onClose={() => setIsCorrectLocationModalOpen(false)}
        currentLocation={userLocation}
        currentDetails={liveLocationDetails}
        locationAccuracy={locationAccuracy}
        onApplyLocation={handleApplyCorrectedLocation}
        onRedetectGps={() => handleSyncLocation(false)}
        isSyncingLocation={isSyncingLocation}
      />
    </div>
  );
}
