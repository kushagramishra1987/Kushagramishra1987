import React, { useState } from 'react';
import { PopUpService } from '../types';
import { MapPin, Navigation, Clock, ChevronRight } from 'lucide-react';

interface InteractiveMapProps {
  services: PopUpService[];
  selectedService: PopUpService | null;
  onSelectService: (service: PopUpService) => void;
  onOpenBooking: (service: PopUpService) => void;
  isPickingLocation?: boolean;
  onPickCoordinates?: (coords: { x: number; y: number }, addressSnippet: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  services,
  selectedService,
  onSelectService,
  onOpenBooking,
  isPickingLocation,
  onPickCoordinates,
}) => {
  const [hoveredService, setHoveredService] = useState<PopUpService | null>(null);

  const activeFocusService = selectedService || hoveredService;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPickingLocation || !onPickCoordinates) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    let approxNeighborhood = 'Downtown District';
    if (x < 45 && y < 55) approxNeighborhood = 'Arts District';
    else if (x >= 45 && y < 50) approxNeighborhood = 'Greenlake Commons';
    else if (x >= 40 && y >= 50) approxNeighborhood = 'River North';
    else if (x < 40 && y >= 50) approxNeighborhood = 'South Market';

    onPickCoordinates({ x, y }, `${approxNeighborhood} Courtyard (Near Pin)`);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm select-none">
      {/* Top Map Bar / Status */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-stone-200/80 shadow-xs text-xs">
        <span className="font-semibold text-stone-900 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-stone-700" />
          Neighborhood Radar
        </span>
        <span className="text-stone-300">|</span>
        <span className="text-stone-500 font-mono tabular-nums">{services.length} active pop-ups</span>
        {isPickingLocation && (
          <span className="ml-2 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded">
            Click map to drop your pop-up pin
          </span>
        )}
      </div>

      {/* SVG Stylized Neighborhood Map */}
      <svg
        viewBox="0 0 1000 620"
        className={`w-full h-[400px] md:h-[480px] object-cover transition-all ${
          isPickingLocation ? 'cursor-crosshair' : 'cursor-default'
        }`}
        onClick={handleSvgClick}
      >
        <defs>
          <pattern id="streetGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e7e5e4" strokeWidth="1" />
          </pattern>
          <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="parkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dcfce7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#bbf7d0" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Base Ground */}
        <rect width="1000" height="620" fill="#f5f5f4" />
        <rect width="1000" height="620" fill="url(#streetGrid)" />

        {/* River Curve */}
        <path
          d="M 460 -20 C 490 180, 560 300, 680 430 C 780 540, 920 580, 1020 600 L 1020 640 L 400 640 C 430 520, 480 340, 420 180 C 400 80, 380 -20, 380 -20 Z"
          fill="url(#riverGrad)"
          opacity="0.8"
        />

        {/* Greenlake Park Zone */}
        <rect x="580" y="80" width="280" height="180" rx="24" fill="url(#parkGrad)" />
        <text x="630" y="140" fill="#15803d" fontSize="13" fontWeight="600" opacity="0.75" letterSpacing="1">
          GREENLAKE COMMONS
        </text>
        <circle cx="720" cy="180" r="45" fill="#a7f3d0" opacity="0.6" />

        {/* Arts District Plaza */}
        <rect x="180" y="160" width="220" height="190" rx="16" fill="#fef3c7" opacity="0.7" />
        <text x="210" y="210" fill="#b45309" fontSize="13" fontWeight="600" opacity="0.75" letterSpacing="1">
          ARTS DISTRICT PLAZA
        </text>

        {/* River North Waterfront Walk */}
        <rect x="470" y="320" width="240" height="160" rx="18" fill="#e0e7ff" opacity="0.6" />
        <text x="500" y="370" fill="#4338ca" fontSize="13" fontWeight="600" opacity="0.75" letterSpacing="1">
          RIVER NORTH WALK
        </text>

        {/* South Market Courtyard */}
        <rect x="100" y="390" width="260" height="170" rx="16" fill="#fae8ff" opacity="0.5" />
        <text x="130" y="440" fill="#86198f" fontSize="13" fontWeight="600" opacity="0.7" letterSpacing="1">
          SOUTH MARKET COMMONS
        </text>

        {/* Major Arterial Roads */}
        <line x1="0" y1="260" x2="1000" y2="260" stroke="#d6d3d1" strokeWidth="6" strokeLinecap="round" />
        <line x1="0" y1="260" x2="1000" y2="260" stroke="#fafaf9" strokeWidth="2" strokeDasharray="12,12" />

        <line x1="380" y1="0" x2="380" y2="620" stroke="#d6d3d1" strokeWidth="6" strokeLinecap="round" />
        <line x1="380" y1="0" x2="380" y2="620" stroke="#fafaf9" strokeWidth="2" strokeDasharray="12,12" />

        <line x1="720" y1="0" x2="720" y2="620" stroke="#e7e5e4" strokeWidth="4" strokeLinecap="round" />
        <line x1="0" y1="460" x2="1000" y2="460" stroke="#e7e5e4" strokeWidth="4" strokeLinecap="round" />

        {/* Service Pop-up Markers */}
        {services.map((service) => {
          const isSelected = selectedService?.id === service.id;
          const isHovered = hoveredService?.id === service.id;
          const px = (service.coordinates.x / 100) * 1000;
          const py = (service.coordinates.y / 100) * 620;

          return (
            <g
              key={service.id}
              transform={`translate(${px}, ${py})`}
              className="cursor-pointer transition-transform duration-200"
              onClick={() => onSelectService(service)}
              onMouseEnter={() => setHoveredService(service)}
              onMouseLeave={() => setHoveredService(null)}
            >
              {/* Pulse ripple if selected or live */}
              {service.isLiveNow && (
                <circle cx="0" cy="0" r={isSelected ? 26 : 20} fill="#f59e0b" opacity="0.25">
                  <animate attributeName="r" values="16;28;16" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.05;0.4" dur="2.4s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Pin Shadow */}
              <ellipse cx="0" cy="12" rx="10" ry="4" fill="#0c0a09" opacity="0.2" />

              {/* Pin Base */}
              <path
                d="M 0 8 C -14 8 -16 -12 0 -22 C 16 -12 14 8 0 8 Z"
                fill={isSelected ? '#1c1917' : service.isLiveNow ? '#d97706' : '#292524'}
                stroke="#ffffff"
                strokeWidth="2.5"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
              />

              {/* Pin inner dot */}
              <circle cx="0" cy="-6" r="4" fill="#ffffff" />

              {/* Floating Mini Price Tag */}
              <g transform="translate(14, -14)">
                <rect
                  x="-2"
                  y="-12"
                  width="44"
                  height="18"
                  rx="6"
                  fill={isSelected ? '#1c1917' : '#ffffff'}
                  stroke="#e7e5e4"
                  strokeWidth="1"
                />
                <text
                  x="20"
                  y="1"
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : '#1c1917'}
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="sans-serif"
                >
                  ₹{service.price}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Floating Service Preview Card at Bottom Right */}
      {activeFocusService && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-20 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-stone-200 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex gap-3 items-start">
            <img
              src={activeFocusService.imageUrl}
              alt={activeFocusService.title}
              referrerPolicy="no-referrer"
              className="w-18 h-18 rounded-lg object-cover shrink-0 border border-stone-200"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                <span>{activeFocusService.category}</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-800 font-medium">
                  {activeFocusService.remainingSpots} spots left
                </span>
              </div>
              <h4 className="text-sm font-semibold text-stone-900 truncate">
                {activeFocusService.title}
              </h4>
              <p className="text-xs text-stone-600 truncate mt-0.5">
                by {activeFocusService.providerName}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                <span className="truncate">{activeFocusService.locationName}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
            <div>
              <span className="text-base font-bold text-stone-900 tabular-nums">
                ₹{activeFocusService.price}
              </span>
              <span className="text-xs text-stone-500 ml-1">/ {activeFocusService.priceUnit}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectService(activeFocusService)}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => onOpenBooking(activeFocusService)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1"
              >
                Book Spot
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
