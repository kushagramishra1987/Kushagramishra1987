export interface TimeSlot {
  id: string;
  time: string;
  capacity: number;
  bookedCount: number;
}

export interface ProviderReview {
  id: string;
  authorName: string;
  authorCity?: string;
  rating: number; // 1 to 5
  date: string;
  comment: string;
  serviceTitle?: string;
  verifiedBooking?: boolean;
}

export interface Provider {
  id: string;
  businessName: string;
  ownerName: string;
  category: string;
  tagline: string;
  bio: string;
  city?: string;
  neighborhood: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  yearsInCraft: number;
  verified: boolean;
  contactEmail: string;
  contactPhone: string;
  instagramHandle?: string;
  upiId?: string;
  servicesCount?: number;
  reviews?: ProviderReview[];
  aadharNumber?: string;
  address?: string;
  pincode?: string;
  experienceYears?: number;
  experienceDetails?: string;
  skills?: string[];
  policeVerified?: boolean;
  expectedMonthlySalary?: number;
  dailyRate?: number;
  languages?: string[];
  geoCoordinates?: { lat: number; lng: number };
  distanceKm?: number;
  distanceMeters?: number;
  isActiveNow?: boolean;
  liveGoogleTag?: string;
}

export interface PopUpService {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  providerRating: number;
  title: string;
  description: string;
  category: string;
  date: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  price: number; // in INR (₹)
  priceUnit: string;
  locationName: string;
  address: string;
  city?: string;
  neighborhood: string;
  coordinates: { x: number; y: number }; // 0-100 on interactive stylized map
  geoCoordinates?: { lat: number; lng: number }; // Real-world geographic lat/lng for Google Maps
  distanceKm?: number;
  distanceMeters?: number;
  spotType: 'courtyard' | 'mobile_van' | 'sidewalk' | 'studio';
  imageUrl: string;
  totalSpots: number;
  remainingSpots: number;
  timeSlots: TimeSlot[];
  includedItems: string[];
  clientRequirements: string[];
  isLiveNow: boolean;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  upiId?: string;
  monthlySalary?: number;
}

export interface GooglePlaceProvider {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  category: string;
  rating?: number;
  userRatingCount?: number;
  isOpenNow?: boolean;
  distanceMeters?: number;
  distanceKm?: number;
  googleMapsUri?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  photoUrl?: string;
  isGooglePlace: true;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImageUrl: string;
  providerName: string;
  providerEmail: string;
  providerPhone: string;
  locationName: string;
  address: string;
  city?: string;
  societyApartment?: string;
  flatNumber?: string;
  houseSize?: string;
  date: string;
  dateLabel: string;
  timeSlot: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  specialNotes?: string;
  price: number;
  paymentMethod?: 'upi' | 'cash_on_spot';
  upiTransactionRef?: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  bookedAt: string;
  bookingCode: string;
}

export type CategoryFilter = 
  | 'All'
  | 'Blade & Dharwala'
  | 'Botanical & Balcony'
  | 'Chai & Specialty Kaapi'
  | 'Bicycle Clinic'
  | 'Leather & Sneaker Spa'
  | 'Heritage & Home Craft'
  | 'House Maid (Jhadu-Pochha)'
  | 'Cook & Maharaj'
  | 'All-Rounder Househelp'
  | 'Auto Driver'
  | 'Painter'
  | 'Electrician'
  | 'Plumber'
  | 'Electronics'
  | 'Mason'
  | 'Glass Work'
  | 'Automobile'
  | 'Tyre Repair'
  | 'Nanny & Babysitter'
  | 'Elder Care Attendant';

export type SearchRangeFilter = '1km' | '2km' | '5km' | 'all';

export type LocationPermissionStatus = 'prompt' | 'granted' | 'denied' | 'unsupported';

export interface CityPreset {
  id: string;
  name: string;
  label: string;
  state: string;
  coordinates: { lat: number; lng: number };
  neighborhoods: string[];
}

