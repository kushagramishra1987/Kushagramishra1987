import React from 'react';
import { Sparkles, Calendar, Store, LocateFixed, Navigation, CheckCircle2, ShieldAlert, Heart, Star, Users, UserPlus, MapPin } from 'lucide-react';
import { LocationPermissionStatus } from '../types';
import { LiveLocationDetails } from '../utils/geo';

interface HeaderProps {
  currentTab: 'explore' | 'providers' | 'create-profile' | 'map' | 'my-favorites' | 'my-bookings' | 'provider-studio';
  onSelectTab: (tab: 'explore' | 'providers' | 'create-profile' | 'map' | 'my-favorites' | 'my-bookings' | 'provider-studio') => void;
  bookingCount: number;
  favoritesCount?: number;
  onOpenLaunchModal: () => void;
  locationPermission?: LocationPermissionStatus;
  isSyncingLocation?: boolean;
  onSyncLocation?: () => void;
  liveLocationDetails?: LiveLocationDetails;
  onOpenCorrectLocation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  bookingCount,
  favoritesCount = 0,
  onOpenLaunchModal,
  locationPermission = 'prompt',
  isSyncingLocation = false,
  onSyncLocation,
  liveLocationDetails,
  onOpenCorrectLocation,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand Logo */}
        <button
          onClick={() => onSelectTab('explore')}
          className="flex items-center shrink-0 hover:opacity-90 transition-opacity text-left focus:outline-hidden"
          aria-label="Hunt Home"
        >
          <img
            src="/assets/aistudio/hunt_1f33bd30.png"
            alt="Hunt"
            className="h-8 sm:h-9 w-auto object-contain max-w-[130px] sm:max-w-[150px]"
          />
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            type="button"
            onClick={() => onSelectTab('explore')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'explore'
                ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-2 decoration-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            Services
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('providers')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'providers'
                ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-2 decoration-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>Service Providers & Reviews</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('create-profile')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'create-profile'
                ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-2 decoration-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-600" />
            <span>Create Profile</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('map')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'map'
                ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-2 decoration-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            1km Radar Map
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('my-favorites')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'my-favorites'
                ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-2 decoration-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-stone-400'}`} />
            <span>Favorites</span>
            {favoritesCount > 0 && (
              <span className="text-xs bg-rose-50 text-rose-700 font-mono font-semibold px-1.5 py-0.2 rounded-full border border-rose-200">
                {favoritesCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('my-bookings')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'my-bookings'
                ? 'text-stone-900 font-semibold underline underline-offset-8 decoration-2 decoration-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            <span>Bookings</span>
            {bookingCount > 0 && (
              <span className="text-xs bg-stone-100 text-stone-800 font-mono font-semibold px-1.5 py-0.2 rounded-full">
                {bookingCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Location Status & Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Location Permission Quick Indicator & Action */}
          {onSyncLocation && (
            <button
              type="button"
              onClick={onSyncLocation}
              disabled={isSyncingLocation}
              title={
                locationPermission === 'granted'
                  ? 'Location permission granted. Click to re-sync GPS.'
                  : locationPermission === 'denied'
                  ? 'Location permission denied. Click to retry.'
                  : 'Click to switch on location permission'
              }
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                locationPermission === 'granted'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : locationPermission === 'denied'
                  ? 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <LocateFixed
                className={`w-3.5 h-3.5 ${
                  isSyncingLocation
                    ? 'animate-spin text-amber-600'
                    : locationPermission === 'granted'
                    ? 'text-emerald-600'
                    : locationPermission === 'denied'
                    ? 'text-red-600'
                    : 'text-amber-700'
                }`}
              />
              <span className="whitespace-nowrap flex items-center gap-1.5">
                {isSyncingLocation ? (
                  'Detecting GPS...'
                ) : locationPermission === 'granted' ? (
                  <>
                    <span className="max-w-[130px] truncate font-bold text-stone-900">
                      {liveLocationDetails?.name || 'Live Location'}
                    </span>
                    {liveLocationDetails?.googleTag && (
                      <span className="bg-emerald-600/10 text-emerald-800 text-[10px] font-mono px-1.5 py-0.5 rounded border border-emerald-300">
                        {liveLocationDetails.googleTag}
                      </span>
                    )}
                    <span className="text-[10px] text-emerald-600 font-bold">(1km)</span>
                  </>
                ) : locationPermission === 'denied' ? (
                  'Location Blocked'
                ) : (
                  'Switch On Location'
                )}
              </span>
              {locationPermission === 'granted' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          )}

          {onOpenCorrectLocation && (
            <button
              type="button"
              onClick={onOpenCorrectLocation}
              title="Wrong location? Click to search or fix your exact spot"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-800" />
              <span>Fix / Change Spot</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenLaunchModal}
            className="px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Pop Up a Service</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden items-center justify-around border-t border-stone-100 px-2 py-2 bg-stone-50/80 text-xs font-medium text-stone-600 overflow-x-auto gap-1">
        <button
          onClick={() => onSelectTab('explore')}
          className={`py-1 px-1.5 rounded whitespace-nowrap ${currentTab === 'explore' ? 'text-stone-900 font-bold' : ''}`}
        >
          Services
        </button>
        <button
          onClick={() => onSelectTab('providers')}
          className={`py-1 px-1.5 rounded whitespace-nowrap flex items-center gap-1 ${currentTab === 'providers' ? 'text-stone-900 font-bold' : ''}`}
        >
          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
          <span>Providers</span>
        </button>
        <button
          onClick={() => onSelectTab('create-profile')}
          className={`py-1 px-1.5 rounded whitespace-nowrap flex items-center gap-1 ${currentTab === 'create-profile' ? 'text-stone-900 font-bold' : ''}`}
        >
          <UserPlus className="w-3 h-3 text-amber-600" />
          <span>Join</span>
        </button>
        <button
          onClick={() => onSelectTab('map')}
          className={`py-1 px-1.5 rounded whitespace-nowrap ${currentTab === 'map' ? 'text-stone-900 font-bold' : ''}`}
        >
          Radar
        </button>
        <button
          onClick={() => onSelectTab('my-favorites')}
          className={`py-1 px-1.5 rounded whitespace-nowrap flex items-center gap-1 ${currentTab === 'my-favorites' ? 'text-stone-900 font-bold' : ''}`}
        >
          <Heart className={`w-3 h-3 ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
          <span>Favorites{favoritesCount > 0 ? ` (${favoritesCount})` : ''}</span>
        </button>
        <button
          onClick={() => onSelectTab('my-bookings')}
          className={`py-1 px-1.5 rounded whitespace-nowrap ${currentTab === 'my-bookings' ? 'text-stone-900 font-bold' : ''}`}
        >
          Bookings ({bookingCount})
        </button>
      </div>
    </header>
  );
};
