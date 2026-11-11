import { Booking, PopUpService, Provider } from '../types';
import { INITIAL_BOOKINGS, INITIAL_PROVIDERS, INITIAL_SERVICES } from '../data/initialData';

const PROVIDERS_KEY = 'popcraft_providers';
const SERVICES_KEY = 'popcraft_services';
const BOOKINGS_KEY = 'popcraft_bookings';
const ACTIVE_PROVIDER_KEY = 'popcraft_active_provider_id';
const FAVORITES_KEY = 'popcraft_favorite_service_ids';
const DATA_VERSION_KEY = 'hunt_india_data_version';
const CURRENT_DATA_VERSION = 'india_v3_new_categories';

function ensureIndiaDataInitialized() {
  try {
    const version = localStorage.getItem(DATA_VERSION_KEY);
    if (version !== CURRENT_DATA_VERSION) {
      localStorage.setItem(PROVIDERS_KEY, JSON.stringify(INITIAL_PROVIDERS));
      localStorage.setItem(SERVICES_KEY, JSON.stringify(INITIAL_SERVICES));
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
      localStorage.setItem(ACTIVE_PROVIDER_KEY, 'prov-1');
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    }
  } catch (e) {
    console.error('Data initialization error', e);
  }
}

export function getStoredFavoriteIds(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveFavoriteIds(ids: string[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save favorites', e);
  }
}

export function toggleStoredFavoriteId(id: string): { isFavorite: boolean; favorites: string[] } {
  const current = getStoredFavoriteIds();
  const exists = current.includes(id);
  const updated = exists ? current.filter((favId) => favId !== id) : [...current, id];
  saveFavoriteIds(updated);
  return { isFavorite: !exists, favorites: updated };
}

export function getStoredProviders(): Provider[] {
  ensureIndiaDataInitialized();
  try {
    const raw = localStorage.getItem(PROVIDERS_KEY);
    if (!raw) {
      localStorage.setItem(PROVIDERS_KEY, JSON.stringify(INITIAL_PROVIDERS));
      return INITIAL_PROVIDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROVIDERS;
  }
}

export function saveProviders(providers: Provider[]) {
  try {
    localStorage.setItem(PROVIDERS_KEY, JSON.stringify(providers));
  } catch (e) {
    console.error('Failed to save providers', e);
  }
}

export function addStoredProviderReview(
  providerId: string,
  reviewData: {
    authorName: string;
    authorCity?: string;
    rating: number;
    comment: string;
    serviceTitle?: string;
  }
): { success: boolean; provider?: Provider } {
  const providers = getStoredProviders();
  const providerIndex = providers.findIndex((p) => p.id === providerId);
  if (providerIndex === -1) return { success: false };

  const provider = providers[providerIndex];
  const newReview = {
    id: `rev-${Date.now()}`,
    ...reviewData,
    date: 'Just now',
    verifiedBooking: true,
  };

  const existingReviews = provider.reviews || [];
  const updatedReviews = [newReview, ...existingReviews];
  const newReviewCount = (provider.reviewCount || 0) + 1;
  const currentTotalScore = (provider.rating || 5) * (provider.reviewCount || 1);
  const updatedRating = Number(((currentTotalScore + reviewData.rating) / (newReviewCount || 1)).toFixed(2));

  const updatedProvider: Provider = {
    ...provider,
    rating: updatedRating,
    reviewCount: newReviewCount,
    reviews: updatedReviews,
  };

  providers[providerIndex] = updatedProvider;
  saveProviders(providers);
  return { success: true, provider: updatedProvider };
}

export function getStoredServices(): PopUpService[] {
  ensureIndiaDataInitialized();
  try {
    const raw = localStorage.getItem(SERVICES_KEY);
    if (!raw) {
      localStorage.setItem(SERVICES_KEY, JSON.stringify(INITIAL_SERVICES));
      return INITIAL_SERVICES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SERVICES;
  }
}

export function saveServices(services: PopUpService[]) {
  try {
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  } catch (e) {
    console.error('Failed to save services', e);
  }
}

export function getStoredBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export function saveBookings(bookings: Booking[]) {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save bookings', e);
  }
}

export function getActiveProviderId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROVIDER_KEY) || 'prov-1';
  } catch {
    return 'prov-1';
  }
}

export function setActiveProviderId(id: string) {
  try {
    localStorage.setItem(ACTIVE_PROVIDER_KEY, id);
  } catch (e) {
    console.error('Failed to save active provider id', e);
  }
}

export function createNewProvider(provider: Omit<Provider, 'id' | 'rating' | 'reviewCount' | 'verified' | 'servicesCount'>): Provider {
  const current = getStoredProviders();
  const newProvider: Provider = {
    ...provider,
    id: `prov-${Date.now()}`,
    rating: 5.0,
    reviewCount: 1,
    verified: true,
    servicesCount: 0,
  };
  const updated = [newProvider, ...current];
  saveProviders(updated);
  setActiveProviderId(newProvider.id);
  return newProvider;
}

export function createNewService(service: Omit<PopUpService, 'id' | 'createdAt' | 'remainingSpots' | 'isLiveNow' | 'status'>): PopUpService {
  const current = getStoredServices();
  const totalSpots = service.timeSlots.reduce((acc, slot) => acc + (slot.capacity - slot.bookedCount), 0);
  
  // Calculate fallback geoCoordinates if missing
  const fallbackLat = 37.7749 + (service.coordinates.y - 50) * 0.0003;
  const fallbackLng = -122.4194 + (service.coordinates.x - 50) * 0.0003;

  const newService: PopUpService = {
    ...service,
    geoCoordinates: service.geoCoordinates || { lat: fallbackLat, lng: fallbackLng },
    id: `srv-${Date.now()}`,
    remainingSpots: totalSpots,
    isLiveNow: true,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  const updated = [newService, ...current];
  saveServices(updated);

  // Update provider services count
  const providers = getStoredProviders();
  const pIndex = providers.findIndex((p) => p.id === service.providerId);
  if (pIndex !== -1) {
    providers[pIndex].servicesCount = (providers[pIndex].servicesCount || 0) + 1;
    saveProviders(providers);
  }

  return newService;
}

export function bookAppointment(params: {
  serviceId: string;
  timeSlotId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  societyApartment?: string;
  flatNumber?: string;
  houseSize?: string;
  paymentMethod?: 'upi' | 'cash_on_spot';
  upiTransactionRef?: string;
  specialNotes?: string;
}): { booking: Booking; service: PopUpService } {
  const services = getStoredServices();
  const sIndex = services.findIndex((s) => s.id === params.serviceId);
  if (sIndex === -1) throw new Error('Service not found');

  const targetService = services[sIndex];
  const slotIndex = targetService.timeSlots.findIndex((t) => t.id === params.timeSlotId);
  if (slotIndex === -1) throw new Error('Time slot not found');

  const slot = targetService.timeSlots[slotIndex];
  if (slot.bookedCount >= slot.capacity) {
    throw new Error('This time slot was just booked out.');
  }

  // Update spot counts
  slot.bookedCount += 1;
  targetService.remainingSpots = Math.max(0, targetService.remainingSpots - 1);
  services[sIndex] = targetService;
  saveServices(services);

  // Retrieve provider details
  const providers = getStoredProviders();
  const provider = providers.find((p) => p.id === targetService.providerId);

  // Create booking with Indian reference code
  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const newBooking: Booking = {
    id: `bk-${Date.now()}`,
    serviceId: targetService.id,
    serviceTitle: targetService.title,
    serviceImageUrl: targetService.imageUrl,
    providerName: targetService.providerName,
    providerEmail: provider?.contactEmail || 'artisan@hunt.in',
    providerPhone: provider?.contactPhone || '+91 98450 21944',
    locationName: targetService.locationName,
    address: targetService.address,
    city: targetService.city || 'Bengaluru',
    societyApartment: params.societyApartment,
    flatNumber: params.flatNumber,
    houseSize: params.houseSize,
    date: targetService.date,
    dateLabel: targetService.dateLabel,
    timeSlot: slot.time,
    clientName: params.clientName,
    clientEmail: params.clientEmail,
    clientPhone: params.clientPhone,
    paymentMethod: params.paymentMethod || 'upi',
    upiTransactionRef: params.paymentMethod === 'upi' ? `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}` : undefined,
    specialNotes: params.specialNotes,
    price: targetService.price,
    status: 'confirmed',
    bookedAt: new Date().toISOString(),
    bookingCode: `HUNT-${randomCode}`,
  };

  const bookings = getStoredBookings();
  saveBookings([newBooking, ...bookings]);

  return { booking: newBooking, service: targetService };
}

export function cancelBooking(bookingId: string) {
  const bookings = getStoredBookings();
  const bIndex = bookings.findIndex((b) => b.id === bookingId);
  if (bIndex === -1) return;

  const booking = bookings[bIndex];
  booking.status = 'cancelled';
  saveBookings(bookings);

  // Return the spot to the service
  const services = getStoredServices();
  const sIndex = services.findIndex((s) => s.id === booking.serviceId);
  if (sIndex !== -1) {
    const service = services[sIndex];
    const slot = service.timeSlots.find((t) => t.time === booking.timeSlot);
    if (slot && slot.bookedCount > 0) {
      slot.bookedCount -= 1;
      service.remainingSpots += 1;
      saveServices(services);
    }
  }
}
