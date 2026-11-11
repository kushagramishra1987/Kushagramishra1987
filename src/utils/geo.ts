import { CityPreset } from '../types';

export interface LatLng {
  lat: number;
  lng: number;
}

// Default center: Koramangala 4th Block, Bengaluru, India
export const DEFAULT_USER_LOCATION: LatLng = {
  lat: 12.9352,
  lng: 77.6245,
};

export const INDIAN_CITIES: CityPreset[] = [
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    label: 'Bengaluru',
    state: 'Karnataka',
    coordinates: { lat: 12.9352, lng: 77.6245 },
    neighborhoods: [
      'All Neighborhoods',
      'Koramangala',
      'Indiranagar',
      'HSR Layout',
      'Church Street',
      'Whitefield',
      'Jayanagar',
      'Malleshwaram',
    ],
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    label: 'Lucknow',
    state: 'Uttar Pradesh',
    coordinates: { lat: 26.8467, lng: 80.9462 },
    neighborhoods: [
      'All Neighborhoods',
      'Hazratganj',
      'Gomti Nagar',
      'Indira Nagar',
      'Aliganj',
      'Mahanagar',
      'Aminabad',
      'Chowk',
    ],
  },
  {
    id: 'delhi',
    name: 'Delhi NCR',
    label: 'Delhi NCR',
    state: 'Delhi',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    neighborhoods: [
      'All Neighborhoods',
      'Connaught Place',
      'Hauz Khas Village',
      'Khan Market',
      'Saket',
      'Lajpat Nagar',
      'CyberHub Gurgaon',
      'Noida Sector 18',
    ],
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    label: 'Mumbai',
    state: 'Maharashtra',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    neighborhoods: [
      'All Neighborhoods',
      'Bandra West',
      'Colaba Causeway',
      'Juhu',
      'Dadar',
      'Andheri West',
      'Powai',
      'Lower Parel',
    ],
  },
  {
    id: 'noida',
    name: 'Noida',
    label: 'Noida',
    state: 'Uttar Pradesh',
    coordinates: { lat: 28.5355, lng: 77.3910 },
    neighborhoods: [
      'All Neighborhoods',
      'Sector 18',
      'Sector 62',
      'Sector 50',
      'Sector 137',
      'Sector 76',
      'Greater Noida',
    ],
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    label: 'Hyderabad',
    state: 'Telangana',
    coordinates: { lat: 17.3850, lng: 78.4867 },
    neighborhoods: [
      'All Neighborhoods',
      'Gachibowli',
      'Hitec City',
      'Banjara Hills',
      'Jubilee Hills',
      'Madhapur',
      'Kondapur',
    ],
  },
  {
    id: 'pune',
    name: 'Pune',
    label: 'Pune',
    state: 'Maharashtra',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    neighborhoods: [
      'All Neighborhoods',
      'Koregaon Park',
      'Baner',
      'Kothrud',
      'Viman Nagar',
      'Hinjewadi',
      'Wakad',
    ],
  },
  {
    id: 'chennai',
    name: 'Chennai',
    label: 'Chennai',
    state: 'Tamil Nadu',
    coordinates: { lat: 13.0827, lng: 80.2707 },
    neighborhoods: [
      'All Neighborhoods',
      'T. Nagar',
      'Adyar',
      'Mylapore',
      'Anna Nagar',
      'Velachery',
      'Besant Nagar',
    ],
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    label: 'Kolkata',
    state: 'West Bengal',
    coordinates: { lat: 22.5726, lng: 88.3639 },
    neighborhoods: [
      'All Neighborhoods',
      'Park Street',
      'Salt Lake Sector V',
      'New Town',
      'Ballygunge',
      'Alipore',
    ],
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    label: 'Ahmedabad',
    state: 'Gujarat',
    coordinates: { lat: 23.0225, lng: 72.5714 },
    neighborhoods: [
      'All Neighborhoods',
      'SG Highway',
      'Bodakdev',
      'Navrangpura',
      'Satellite',
      'Vastrapur',
    ],
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    label: 'Jaipur',
    state: 'Rajasthan',
    coordinates: { lat: 26.9124, lng: 75.7873 },
    neighborhoods: [
      'All Neighborhoods',
      'C-Scheme',
      'Malviya Nagar',
      'Vaishali Nagar',
      'Raja Park',
      'Mansarovar',
    ],
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh',
    label: 'Chandigarh',
    state: 'Punjab / Haryana',
    coordinates: { lat: 30.7333, lng: 76.7794 },
    neighborhoods: [
      'All Neighborhoods',
      'Sector 17',
      'Sector 35',
      'Sector 8',
      'Mohali Phase 7',
      'Panchkula',
    ],
  },
];

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(coord1: LatLng, coord2: LatLng): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = deg2rad(coord2.lat - coord1.lat);
  const dLng = deg2rad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coord1.lat)) *
      Math.cos(deg2rad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Format distance in user-friendly metric string
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Checks if a target coordinate is within maxDistanceKm of origin
 */
export function isWithinRange(origin: LatLng, target: LatLng, maxDistanceKm: number): boolean {
  const dist = calculateDistanceKm(origin, target);
  return dist <= maxDistanceKm;
}

// Plus Code (Open Location Code) Alphabet used by Google Maps
const OLC_ALPHABET = '23456789CFGHJMPQRVWX';

/**
 * Encodes latitude & longitude into an official Google Plus Code / Google Location Tag
 */
export function encodeGooglePlusCode(lat: number, lng: number): string {
  lat = Math.min(90, Math.max(-90, lat));
  while (lng < -180) lng += 360;
  while (lng >= 180) lng -= 360;

  let latVal = Math.min(lat + 90, 180);
  let lngVal = Math.min(lng + 180, 360);

  let code = '';
  // 4 pairs of 20x20
  for (let i = 0; i < 4; i++) {
    const latDigit = Math.floor(latVal / 20);
    const lngDigit = Math.floor(lngVal / 20);
    code += OLC_ALPHABET[latDigit] + OLC_ALPHABET[lngDigit];
    latVal = (latVal % 20) * 20;
    lngVal = (lngVal % 20) * 20;
  }

  code += '+';

  // 5th pair (sub-block resolution ~13.7 meters)
  const latDigit = Math.floor(latVal / 20);
  const lngDigit = Math.floor(lngVal / 20);
  code += OLC_ALPHABET[latDigit] + OLC_ALPHABET[lngDigit];

  return code;
}

export interface LiveLocationDetails {
  name: string;
  neighborhood: string;
  city: string;
  state: string;
  googleTag: string; // e.g. "7J4V+3J Bengaluru" or "7MR2+2F Lucknow"
  fullPlusCode: string; // e.g. "7J4VJH3J+8C"
  googleMapsUrl: string;
  landmark: string;
  postcode?: string;
  isCustomCorrected?: boolean;
}

export interface GeocodedSearchResult {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  neighborhood?: string;
  city?: string;
  state?: string;
}

// In-memory cache for reverse geocode results to avoid repeated network calls
const reverseGeocodeCache = new Map<string, Partial<LiveLocationDetails>>();

/**
 * Asynchronously queries real reverse-geocoding to identify actual street,
 * neighborhood, city, and state from device GPS coordinates anywhere in India/World.
 */
export async function fetchReverseGeocode(coords: LatLng): Promise<Partial<LiveLocationDetails> | null> {
  const cacheKey = `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}`;
  if (reverseGeocodeCache.has(cacheKey)) {
    return reverseGeocodeCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.address) return null;

    const addr = data.address;
    const road = addr.road || addr.pedestrian || addr.suburb_district || addr.residential || '';
    const neighborhood =
      addr.suburb ||
      addr.neighbourhood ||
      addr.residential ||
      addr.colony ||
      addr.sector ||
      addr.commercial ||
      addr.quarter ||
      addr.village ||
      addr.hamlet ||
      road ||
      'Local Area';

    const city =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.county ||
      addr.state_district ||
      addr.district ||
      '';

    const state = addr.state || '';
    const postcode = addr.postcode || '';

    let locationName = '';
    if (neighborhood && city && neighborhood.toLowerCase() !== city.toLowerCase()) {
      locationName = `${neighborhood}, ${city}`;
    } else if (city) {
      locationName = state ? `${city}, ${state}` : city;
    } else {
      locationName = data.display_name?.split(',').slice(0, 2).join(', ') || 'Live Location';
    }

    const landmark = road && road !== neighborhood ? `${road} (Near ${neighborhood})` : (data.name || neighborhood);

    const result: Partial<LiveLocationDetails> = {
      name: locationName,
      neighborhood,
      city: city || 'Local Area',
      state,
      landmark,
      postcode,
    };

    reverseGeocodeCache.set(cacheKey, result);
    return result;
  } catch (err) {
    // Graceful fallback on network timeout or offline
    return null;
  }
}

/**
 * Searches places, colonies, PIN codes, and cities online via geocoding
 */
export async function searchPlacesOnline(query: string): Promise<GeocodedSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const cleanQuery = query.trim();
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQuery
    )}&limit=6&addressdetails=1&countrycodes=in`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const items = await res.json();
    if (!Array.isArray(items)) return [];

    return items.map((item: any) => {
      const addr = item.address || {};
      const neighborhood =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.colony ||
        addr.road ||
        item.name;
      const city =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.state_district ||
        addr.county ||
        '';
      const state = addr.state || '';

      return {
        name: item.name || neighborhood,
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        neighborhood,
        city,
        state,
      };
    });
  } catch (err) {
    return [];
  }
}

/**
 * Resolves comprehensive Name and official Google Tag for any GPS coordinate,
 * seamlessly blending live reverse geocode overrides when available.
 */
export function getLiveLocationDetails(
  coords: LatLng,
  preferredCity?: CityPreset,
  overrides?: Partial<LiveLocationDetails> | null
): LiveLocationDetails {
  const plusCode = encodeGooglePlusCode(coords.lat, coords.lng);

  // If we have verified reverse-geocoded data from Nominatim / Google Geocoder:
  if (overrides && overrides.name) {
    const detectedCity = overrides.city || preferredCity?.name || 'Local Area';
    const shortPair =
      plusCode.length >= 11 ? `${plusCode.slice(0, 4)}+${plusCode.slice(5, 7)}` : plusCode;
    const googleTag = `${shortPair} ${detectedCity}`;

    return {
      name: overrides.name,
      neighborhood: overrides.neighborhood || 'Local Area',
      city: detectedCity,
      state: overrides.state || preferredCity?.state || 'India',
      googleTag,
      fullPlusCode: plusCode,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`,
      landmark: overrides.landmark || `${overrides.neighborhood || 'Central'} Live Hub`,
      postcode: overrides.postcode,
      isCustomCorrected: overrides.isCustomCorrected,
    };
  }

  // Find closest preset city from coordinates
  let closestCity = preferredCity || INDIAN_CITIES[0];
  let minDistance = calculateDistanceKm(coords, closestCity.coordinates);
  for (const c of INDIAN_CITIES) {
    const dist = calculateDistanceKm(coords, c.coordinates);
    if (dist < minDistance) {
      minDistance = dist;
      closestCity = c;
    }
  }

  let neighborhood = closestCity.neighborhoods[1] || 'Central Area';
  let landmark = `${closestCity.name} Central Hub`;
  let locationName = `${neighborhood}, ${closestCity.name}`;

  // If the user's coordinates are close to the matched preset city (< 30km)
  if (minDistance < 30) {
    if (closestCity.id === 'bengaluru') {
      const dKoramangala = calculateDistanceKm(coords, { lat: 12.9352, lng: 77.6245 });
      const dIndiranagar = calculateDistanceKm(coords, { lat: 12.9784, lng: 77.6408 });
      const dHSR = calculateDistanceKm(coords, { lat: 12.9121, lng: 77.6446 });
      const dChurchSt = calculateDistanceKm(coords, { lat: 12.9750, lng: 77.6050 });
      const dWhitefield = calculateDistanceKm(coords, { lat: 12.9698, lng: 77.7500 });

      if (dIndiranagar < 3.0) {
        neighborhood = 'Indiranagar';
        landmark = '100 Feet Rd (Near CMH Metro)';
        locationName = 'Indiranagar 100 Feet Road, Bengaluru';
      } else if (dHSR < 3.0) {
        neighborhood = 'HSR Layout';
        landmark = 'Sector 4, 14th Main Commercial Rd';
        locationName = 'HSR Layout Sector 4, Bengaluru';
      } else if (dChurchSt < 3.0) {
        neighborhood = 'Church Street';
        landmark = 'Church Street & Brigade Road';
        locationName = 'Church Street Central, Bengaluru';
      } else if (dWhitefield < 4.0) {
        neighborhood = 'Whitefield';
        landmark = 'ITPL Main Road';
        locationName = 'Whitefield Tech Corridor, Bengaluru';
      } else if (dKoramangala < 3.0) {
        neighborhood = 'Koramangala';
        landmark = '4th Block, 80 Feet Road (Sony Signal)';
        locationName = 'Koramangala 4th Block, Bengaluru';
      } else {
        neighborhood = 'Bengaluru Urban';
        landmark = 'Outer Ring Road Hub';
        locationName = 'Bengaluru Urban Area';
      }
    } else if (closestCity.id === 'lucknow') {
      const dGanj = calculateDistanceKm(coords, { lat: 26.8467, lng: 80.9462 });
      const dGomti = calculateDistanceKm(coords, { lat: 26.8524, lng: 80.9995 });
      const dIndira = calculateDistanceKm(coords, { lat: 26.8872, lng: 80.9850 });
      if (dGomti < 3.5) {
        neighborhood = 'Gomti Nagar';
        landmark = 'Vibhuti Khand / Patrakarpuram';
        locationName = 'Gomti Nagar, Lucknow';
      } else if (dIndira < 3.5) {
        neighborhood = 'Indira Nagar';
        landmark = 'Bhoothnath Market / Munshipulia';
        locationName = 'Indira Nagar, Lucknow';
      } else {
        neighborhood = 'Hazratganj';
        landmark = 'MG Marg / Hazratganj Chauraha';
        locationName = 'Hazratganj, Lucknow';
      }
    } else if (closestCity.id === 'mumbai') {
      const dBandra = calculateDistanceKm(coords, { lat: 19.0596, lng: 72.8295 });
      const dJuhu = calculateDistanceKm(coords, { lat: 19.1075, lng: 72.8263 });
      if (dJuhu < 3.0) {
        neighborhood = 'Juhu';
        landmark = 'Juhu Tara Rd (Near Prithvi Theatre)';
        locationName = 'Juhu Beach Road, Mumbai';
      } else if (dBandra < 3.5) {
        neighborhood = 'Bandra West';
        landmark = 'Hill Road & Perry Cross Road';
        locationName = 'Bandra West, Mumbai';
      } else {
        neighborhood = 'Andheri West';
        landmark = 'Lokhandwala Complex';
        locationName = 'Andheri West, Mumbai';
      }
    } else if (closestCity.id === 'delhi') {
      neighborhood = 'Connaught Place';
      landmark = 'Inner Circle / Rajiv Chowk';
      locationName = 'Connaught Place, Delhi';
    } else if (closestCity.id === 'noida') {
      neighborhood = 'Sector 18';
      landmark = 'Atta Market / Mall of India';
      locationName = 'Noida Sector 18';
    } else {
      neighborhood = closestCity.neighborhoods[1] || closestCity.name;
      landmark = `${closestCity.name} Commercial Sector`;
      locationName = `${neighborhood}, ${closestCity.name}`;
    }
  } else {
    // If coords are far away from all preset cities (> 30 km)
    neighborhood = 'Local Live Zone';
    landmark = `GPS Location (${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E)`;
    locationName = `GPS Point (${coords.lat.toFixed(3)}°N, ${coords.lng.toFixed(3)}°E)`;
  }

  // Google Tag format: Standard Plus Code compound tag + city
  // e.g. "7J4V+3J Bengaluru" or "7MR2+2F Lucknow"
  const shortPair =
    plusCode.length >= 11 ? `${plusCode.slice(0, 4)}+${plusCode.slice(5, 7)}` : plusCode;
  const tagName = minDistance < 50 ? closestCity.name : 'GPS';
  const googleTag = `${shortPair} ${tagName}`;

  return {
    name: locationName,
    neighborhood,
    city: minDistance < 50 ? closestCity.name : 'Local Area',
    state: minDistance < 50 ? closestCity.state : 'India',
    googleTag,
    fullPlusCode: plusCode,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`,
    landmark,
  };
}
