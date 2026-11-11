import React, { useState } from 'react';
import { Provider, PopUpService, Booking, TimeSlot } from '../types';
import {
  Sparkles,
  Plus,
  Store,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Users,
  Star,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { createNewProvider, createNewService, saveProviders, saveServices } from '../utils/storage';

interface ProviderPortalProps {
  providers: Provider[];
  activeProvider: Provider | null;
  onSelectActiveProvider: (p: Provider) => void;
  onRefreshData: () => void;
  services: PopUpService[];
  bookings: Booking[];
  onOpenServiceDetail: (service: PopUpService) => void;
}

const PRESET_IMAGES = [
  { label: 'Traditional Indian Ustad Craft Workshop', url: '/src/assets/images/indian_artisan_craft_1794215372127.jpg' },
  { label: 'Artisan Whetstone Knife Sharpening', url: '/src/assets/images/service_knife_sharpening_1793716300181.jpg' },
  { label: 'Botanical Plant Care & Repotting Clinic', url: '/src/assets/images/service_plant_care_popup_1793716300748.jpg' },
  { label: 'Mobile Specialty Espresso & Coffee Cart', url: '/src/assets/images/service_mobile_espresso_1793716301575.jpg' },
  { label: 'Mobile Bicycle Repair & Tune-up Van', url: '/src/assets/images/service_bike_tuneup_1793716301403.jpg' },
];

export const ProviderPortal: React.FC<ProviderPortalProps> = ({
  providers,
  activeProvider,
  onSelectActiveProvider,
  onRefreshData,
  services,
  bookings,
  onOpenServiceDetail,
}) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'launch-popup' | 'profile-editor'>('manage');

  // New Profile Form State
  const [isCreatingNewProfile, setIsCreatingNewProfile] = useState(false);
  const [profileBusinessName, setProfileBusinessName] = useState('');
  const [profileOwnerName, setProfileOwnerName] = useState('');
  const [profileCategory, setProfileCategory] = useState('Blade & Cutlery');
  const [profileTagline, setProfileTagline] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileNeighborhood, setProfileNeighborhood] = useState('Arts District');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileInstagram, setProfileInstagram] = useState('');
  const [profileYearsInCraft, setProfileYearsInCraft] = useState('5');
  const [profileAvatar, setProfileAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80');

  // Launch Pop-up Form State
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceCategory, setServiceCategory] = useState(activeProvider?.category || 'Blade & Cutlery');
  const [serviceDate, setServiceDate] = useState('2026-11-04');
  const [serviceDateLabel, setServiceDateLabel] = useState('Tomorrow, Afternoon');
  const [serviceStartTime, setServiceStartTime] = useState('11:00 AM');
  const [serviceEndTime, setServiceEndTime] = useState('04:00 PM');
  const [servicePrice, setServicePrice] = useState('25');
  const [servicePriceUnit, setServicePriceUnit] = useState('per session');
  const [serviceLocationName, setServiceLocationName] = useState('Courtyard @ Arts District Hall');
  const [serviceAddress, setServiceAddress] = useState('428 3rd St, Arts District');
  const [serviceNeighborhood, setServiceNeighborhood] = useState(activeProvider?.neighborhood || 'Arts District');
  const [serviceSpotType, setServiceSpotType] = useState<'courtyard' | 'mobile_van' | 'sidewalk' | 'studio'>('courtyard');
  const [serviceImageUrl, setServiceImageUrl] = useState(PRESET_IMAGES[0].url);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState('30');
  const [spotsPerSlot, setSpotsPerSlot] = useState('2');
  const [includedList, setIncludedList] = useState<string[]>([
    'All professional grade tools and materials provided',
    'One-on-one consultation and inspection',
  ]);
  const [newIncludedItem, setNewIncludedItem] = useState('');
  const [clientReqList, setClientReqList] = useState<string[]>([
    'Arrive 5 minutes before scheduled slot',
  ]);
  const [newReqItem, setNewReqItem] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');

  // Filter services and bookings for active provider
  const providerServices = services.filter((s) => s.providerId === activeProvider?.id);
  const providerBookings = bookings.filter((b) => b.providerName === activeProvider?.businessName);

  const totalSpotsBooked = providerBookings.filter((b) => b.status === 'confirmed').length;
  const totalRevenue = providerBookings
    .filter((b) => b.status === 'confirmed')
    .reduce((acc, b) => acc + b.price, 0);

  // Populate editor when active provider changes
  React.useEffect(() => {
    if (activeProvider) {
      setProfileBusinessName(activeProvider.businessName);
      setProfileOwnerName(activeProvider.ownerName);
      setProfileCategory(activeProvider.category);
      setProfileTagline(activeProvider.tagline);
      setProfileBio(activeProvider.bio);
      setProfileNeighborhood(activeProvider.neighborhood);
      setProfileEmail(activeProvider.contactEmail);
      setProfilePhone(activeProvider.contactPhone);
      setProfileInstagram(activeProvider.instagramHandle || '');
      setProfileYearsInCraft(String(activeProvider.yearsInCraft || 5));
      setProfileAvatar(activeProvider.avatarUrl);
      setServiceCategory(activeProvider.category);
      setServiceNeighborhood(activeProvider.neighborhood);
    }
  }, [activeProvider]);

  const handleCreateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileBusinessName.trim() || !profileOwnerName.trim()) {
      setFormErrorMessage('Please provide a Business Name and Owner Name.');
      return;
    }

    const created = createNewProvider({
      businessName: profileBusinessName.trim(),
      ownerName: profileOwnerName.trim(),
      category: profileCategory,
      tagline: profileTagline.trim(),
      bio: profileBio.trim(),
      neighborhood: profileNeighborhood,
      avatarUrl: profileAvatar,
      contactEmail: profileEmail.trim(),
      contactPhone: profilePhone.trim(),
      instagramHandle: profileInstagram.trim(),
      yearsInCraft: parseInt(profileYearsInCraft, 10) || 5,
    });

    onSelectActiveProvider(created);
    onRefreshData();
    setIsCreatingNewProfile(false);
    setActiveTab('manage');
    setFormSuccessMessage(`Profile created! Welcome to Hunt, ${created.businessName}.`);
    setTimeout(() => setFormSuccessMessage(''), 5000);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProvider) return;

    const all = [...providers];
    const idx = all.findIndex((p) => p.id === activeProvider.id);
    if (idx !== -1) {
      all[idx] = {
        ...all[idx],
        businessName: profileBusinessName.trim(),
        ownerName: profileOwnerName.trim(),
        category: profileCategory,
        tagline: profileTagline.trim(),
        bio: profileBio.trim(),
        neighborhood: profileNeighborhood,
        contactEmail: profileEmail.trim(),
        contactPhone: profilePhone.trim(),
        instagramHandle: profileInstagram.trim(),
        avatarUrl: profileAvatar,
        yearsInCraft: parseInt(profileYearsInCraft, 10) || 5,
      };
      saveProviders(all);
      onSelectActiveProvider(all[idx]);
      onRefreshData();
      setFormSuccessMessage('Profile details saved successfully.');
      setTimeout(() => setFormSuccessMessage(''), 4000);
    }
  };

  const handleLaunchPopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProvider) {
      setFormErrorMessage('Please select or create a provider profile first.');
      return;
    }
    if (!serviceTitle.trim() || !serviceLocationName.trim()) {
      setFormErrorMessage('Please fill in the pop-up title and location name.');
      return;
    }

    // Generate realistic time slots based on start/end time and duration
    const slots: TimeSlot[] = [];
    const capacityNum = parseInt(spotsPerSlot, 10) || 1;
    const duration = parseInt(slotDurationMinutes, 10) || 30;

    // Generate 5-6 sample slots
    const times = ['11:00 AM', '11:45 AM', '12:30 PM', '01:30 PM', '02:15 PM', '03:00 PM'];
    times.forEach((t, i) => {
      slots.push({
        id: `ts-${Date.now()}-${i}`,
        time: t,
        capacity: capacityNum,
        bookedCount: 0,
      });
    });

    // Approximate coordinates based on neighborhood
    let coords = { x: 45, y: 45 };
    if (serviceNeighborhood.includes('Arts')) coords = { x: 32, y: 40 };
    else if (serviceNeighborhood.includes('Greenlake')) coords = { x: 65, y: 30 };
    else if (serviceNeighborhood.includes('River')) coords = { x: 50, y: 62 };
    else if (serviceNeighborhood.includes('South')) coords = { x: 24, y: 70 };

    const newSrv = createNewService({
      providerId: activeProvider.id,
      providerName: activeProvider.businessName,
      providerAvatar: activeProvider.avatarUrl,
      providerRating: activeProvider.rating,
      title: serviceTitle.trim(),
      description: serviceDescription.trim() || 'Specialized pop-up offering by local artisan.',
      category: serviceCategory,
      date: serviceDate,
      dateLabel: serviceDateLabel.trim(),
      startTime: serviceStartTime,
      endTime: serviceEndTime,
      price: parseFloat(servicePrice) || 20,
      priceUnit: servicePriceUnit.trim() || 'per spot',
      locationName: serviceLocationName.trim(),
      address: serviceAddress.trim(),
      neighborhood: serviceNeighborhood,
      coordinates: coords,
      geoCoordinates: {
        lat: 37.7749 + (coords.y - 50) * 0.0003,
        lng: -122.4194 + (coords.x - 50) * 0.0003,
      },
      spotType: serviceSpotType,
      imageUrl: serviceImageUrl,
      totalSpots: slots.length * capacityNum,
      timeSlots: slots,
      includedItems: includedList,
      clientRequirements: clientReqList,
    });

    onRefreshData();
    setActiveTab('manage');
    setFormSuccessMessage(`Your pop-up "${newSrv.title}" is now LIVE on the map and discoverable!`);
    setTimeout(() => setFormSuccessMessage(''), 5000);
  };

  const handleTogglePopUpStatus = (serviceId: string) => {
    const all = [...services];
    const idx = all.findIndex((s) => s.id === serviceId);
    if (idx !== -1) {
      all[idx].status = all[idx].status === 'active' ? 'paused' : 'active';
      all[idx].isLiveNow = all[idx].status === 'active';
      saveServices(all);
      onRefreshData();
    }
  };

  const handleAddIncludedItem = () => {
    if (newIncludedItem.trim()) {
      setIncludedList([...includedList, newIncludedItem.trim()]);
      setNewIncludedItem('');
    }
  };

  const handleAddReqItem = () => {
    if (newReqItem.trim()) {
      setClientReqList([...clientReqList, newReqItem.trim()]);
      setNewReqItem('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner / Switch Active Provider Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {activeProvider ? (
              <img
                src={activeProvider.avatarUrl}
                alt={activeProvider.businessName}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-stone-200 shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500">
                <Store className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900 font-display">
                  {activeProvider ? activeProvider.businessName : 'Provider Studio'}
                </h2>
                {activeProvider?.verified && (
                  <span title="Verified Artisan">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {activeProvider ? `${activeProvider.ownerName} · ${activeProvider.category} · ${activeProvider.neighborhood}` : 'Select a provider or create a new profile'}
              </p>
            </div>
          </div>

          {/* Quick Provider Switcher & New Profile Button */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <select
              value={activeProvider?.id || ''}
              onChange={(e) => {
                const found = providers.find((p) => p.id === e.target.value);
                if (found) onSelectActiveProvider(found);
              }}
              aria-label="Switch Provider Profile"
              className="text-xs font-medium bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-900 cursor-pointer"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  Switch to: {p.businessName}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setIsCreatingNewProfile(true);
                setActiveTab('profile-editor');
              }}
              className="px-3 py-2 text-xs font-semibold text-stone-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 text-stone-900" />
              <span>New Profile</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setIsCreatingNewProfile(false);
              setActiveTab('manage');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'manage' && !isCreatingNewProfile
                ? 'bg-stone-900 text-white font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Dashboard & Bookings
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreatingNewProfile(false);
              setActiveTab('launch-popup');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
              activeTab === 'launch-popup'
                ? 'bg-stone-900 text-white font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            Launch Pop-up Service
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreatingNewProfile(false);
              setActiveTab('profile-editor');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'profile-editor'
                ? 'bg-stone-900 text-white font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {isCreatingNewProfile ? 'Create New Profile' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {formSuccessMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{formSuccessMessage}</span>
        </div>
      )}

      {/* Error Notification Alert */}
      {formErrorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-medium">{formErrorMessage}</span>
        </div>
      )}

      {/* TAB 1: DASHBOARD & ACTIVE POP-UPS */}
      {activeTab === 'manage' && (
        <div className="space-y-8">
          {/* Key Metric Strips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium block">Active Pop-ups</span>
              <span className="text-2xl font-bold text-stone-900 font-display tabular-nums mt-1 block">
                {providerServices.filter((s) => s.status === 'active').length}
              </span>
              <span className="text-[11px] text-stone-400">Live on neighborhood map</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium block">Total Spots Booked</span>
              <span className="text-2xl font-bold text-stone-900 font-display tabular-nums mt-1 block">
                {totalSpotsBooked}
              </span>
              <span className="text-[11px] text-stone-400">Direct client reservations</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium block">Total Revenue</span>
              <span className="text-2xl font-bold text-stone-900 font-display tabular-nums mt-1 block">
                ₹{totalRevenue}
              </span>
              <span className="text-[11px] text-stone-400">0% platform commission</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-medium block">Artisan Rating</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                <span className="text-2xl font-bold text-stone-900 font-display tabular-nums">
                  {activeProvider?.rating.toFixed(2) || '5.00'}
                </span>
              </div>
              <span className="text-[11px] text-stone-400">{activeProvider?.reviewCount || 0} local reviews</span>
            </div>
          </div>

          {/* Active Pop-up Services List */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">
                  Your Pop-Up Services ({providerServices.length})
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Manage availability, view booked spots, or launch another pop-up.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('launch-popup')}
                className="px-3 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Pop Up Service
              </button>
            </div>

            {providerServices.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-stone-200 rounded-xl">
                <Store className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-700">No pop-up services live yet</p>
                <p className="text-xs text-stone-500 mt-1">Launch your first pop-up to start accepting local bookings.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('launch-popup')}
                  className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
                >
                  Create First Pop-up
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {providerServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={srv.imageUrl}
                        alt={srv.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover border border-stone-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span className="font-medium text-stone-800">{srv.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{srv.dateLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-800 font-semibold">{srv.remainingSpots} spots open</span>
                        </div>
                        <h4 className="text-sm font-bold text-stone-900 mt-0.5">{srv.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {srv.locationName}
                          </span>
                          <span className="font-semibold text-stone-900 tabular-nums">
                            ₹{srv.price} / {srv.priceUnit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end md:self-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePopUpStatus(srv.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          srv.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                        }`}
                      >
                        {srv.status === 'active' ? 'Active / Live' : 'Paused'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenServiceDetail(srv)}
                        className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incoming Customer Bookings */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">
                  Incoming Client Bookings ({providerBookings.length})
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Live appointments reserved by local clients for your pop-ups.
                </p>
              </div>
            </div>

            {providerBookings.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-500">
                No client bookings yet. As soon as clients reserve a spot on your pop-up, it will show here!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 font-medium uppercase tracking-wider">
                      <th className="pb-3 pl-2">Pass Ref</th>
                      <th className="pb-3">Client</th>
                      <th className="pb-3">Service & Slot</th>
                      <th className="pb-3">Client Notes</th>
                      <th className="pb-3 text-right">Fee Due</th>
                      <th className="pb-3 text-right pr-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {providerBookings.map((bk) => (
                      <tr key={bk.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3 pl-2 font-mono font-semibold text-stone-900">
                          {bk.bookingCode}
                        </td>
                        <td className="py-3">
                          <span className="font-semibold text-stone-900 block">{bk.clientName}</span>
                          <span className="text-stone-500 text-[11px] block">{bk.clientPhone}</span>
                        </td>
                        <td className="py-3">
                          <span className="font-medium text-stone-900 block truncate max-w-xs">{bk.serviceTitle}</span>
                          <span className="text-stone-500 text-[11px] block">
                            {bk.dateLabel} at {bk.timeSlot}
                          </span>
                        </td>
                        <td className="py-3 text-stone-600 max-w-xs truncate">
                          {bk.specialNotes || '—'}
                        </td>
                        <td className="py-3 text-right font-bold text-stone-900 tabular-nums">
                          ₹{bk.price}
                        </td>
                        <td className="py-3 text-right pr-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              bk.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {bk.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LAUNCH POP-UP FORM */}
      {activeTab === 'launch-popup' && (
        <form onSubmit={handleLaunchPopUpSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-xl font-bold text-stone-900 font-display">
              Pop Up a New Service
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Create a time-bound pop-up event or flash service offering at a specific neighborhood location.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Pop-up Service Title *
              </label>
              <input
                type="text"
                required
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
                placeholder="e.g. Japanese Waterstone Knife Sharpening Pop-up"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Category
              </label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              >
                <option value="Blade & Cutlery">Blade & Cutlery</option>
                <option value="Botanical & Plants">Botanical & Plants</option>
                <option value="Artisan Coffee">Artisan Coffee</option>
                <option value="Bicycle Care">Bicycle Care</option>
                <option value="Leather & Craft">Leather & Craft</option>
                <option value="Home & Diagnostic">Home & Diagnostic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Spot Format
              </label>
              <select
                value={serviceSpotType}
                onChange={(e) => setServiceSpotType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              >
                <option value="courtyard">Open Courtyard / Plaza</option>
                <option value="mobile_van">Mobile Van / Trailer</option>
                <option value="sidewalk">Street Pop-up / Cart</option>
                <option value="studio">Shared Studio Drop-in</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Description & Craft Method
              </label>
              <textarea
                rows={3}
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Describe what customers get, your specialized equipment or technique, and what they can expect."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Date Label (e.g. "Today, Afternoon", "Saturday, Nov 8")
              </label>
              <input
                type="text"
                required
                value={serviceDateLabel}
                onChange={(e) => setServiceDateLabel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-stone-900 mb-1">
                  Start Time
                </label>
                <input
                  type="text"
                  value={serviceStartTime}
                  onChange={(e) => setServiceStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-900 mb-1">
                  End Time
                </label>
                <input
                  type="text"
                  value={serviceEndTime}
                  onChange={(e) => setServiceEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Price per Spot (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Unit (e.g. "per knife", "per 30-min tune", "per consultation")
              </label>
              <input
                type="text"
                value={servicePriceUnit}
                onChange={(e) => setServicePriceUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Pop-up Spot / Venue Name *
              </label>
              <input
                type="text"
                required
                value={serviceLocationName}
                onChange={(e) => setServiceLocationName(e.target.value)}
                placeholder="e.g. Courtyard @ Crafts Hall"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Neighborhood
              </label>
              <select
                value={serviceNeighborhood}
                onChange={(e) => setServiceNeighborhood(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900"
              >
                <option value="Arts District">Arts District</option>
                <option value="Greenlake Commons">Greenlake Commons</option>
                <option value="River North">River North</option>
                <option value="South Market">South Market</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={serviceAddress}
                onChange={(e) => setServiceAddress(e.target.value)}
                placeholder="e.g. 428 3rd Street, Arts District"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900"
              />
            </div>

            {/* Visual Cover Selection */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-900 mb-2">
                Pop-up Cover Photography
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {PRESET_IMAGES.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setServiceImageUrl(img.url)}
                    className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all aspect-4/3 relative ${
                      serviceImageUrl === img.url ? 'border-stone-900 ring-2 ring-stone-900/20' : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {serviceImageUrl === img.url && (
                      <div className="absolute top-1.5 right-1.5 bg-stone-900 text-white rounded-full p-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Included Items Checklist */}
            <div className="sm:col-span-2 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <label className="block text-xs font-semibold text-stone-900 mb-2">
                What's Included in the Pop-up Spot
              </label>
              <div className="space-y-1.5 mb-3">
                {includedList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-stone-700 bg-white px-3 py-1.5 rounded-lg border border-stone-200/80">
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => setIncludedList(includedList.filter((_, i) => i !== idx))}
                      className="text-stone-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIncludedItem}
                  onChange={(e) => setNewIncludedItem(e.target.value)}
                  placeholder="e.g. Free protective blade sleeve wrapping"
                  className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddIncludedItem}
                  className="px-3 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('manage')}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Launch Pop-Up Live
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: CREATE OR EDIT PROFILE */}
      {activeTab === 'profile-editor' && (
        <form
          onSubmit={isCreatingNewProfile ? handleCreateProfileSubmit : handleUpdateProfile}
          className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6"
        >
          <div>
            <h3 className="text-xl font-bold text-stone-900 font-display">
              {isCreatingNewProfile ? 'Create Artisan / Provider Profile' : 'Edit Business Profile'}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Your profile helps neighborhood users discover your background, craft credentials, and pop-up locations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Business / Studio Name *
              </label>
              <input
                type="text"
                required
                value={profileBusinessName}
                onChange={(e) => setProfileBusinessName(e.target.value)}
                placeholder="e.g. Kurogane Edge Lab"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Owner / Artisan Name *
              </label>
              <input
                type="text"
                required
                value={profileOwnerName}
                onChange={(e) => setProfileOwnerName(e.target.value)}
                placeholder="e.g. Kenji Takahashi"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Primary Craft / Category
              </label>
              <select
                value={profileCategory}
                onChange={(e) => setProfileCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              >
                <option value="Blade & Cutlery">Blade & Cutlery</option>
                <option value="Botanical & Plants">Botanical & Plants</option>
                <option value="Artisan Coffee">Artisan Coffee</option>
                <option value="Bicycle Care">Bicycle Care</option>
                <option value="Leather & Craft">Leather & Craft</option>
                <option value="Home & Diagnostic">Home & Diagnostic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Home Neighborhood
              </label>
              <select
                value={profileNeighborhood}
                onChange={(e) => setProfileNeighborhood(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              >
                <option value="Arts District">Arts District</option>
                <option value="Greenlake Commons">Greenlake Commons</option>
                <option value="River North">River North</option>
                <option value="South Market">South Market</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Tagline / One-liner Pitch
              </label>
              <input
                type="text"
                value={profileTagline}
                onChange={(e) => setProfileTagline(e.target.value)}
                placeholder="e.g. Traditional Japanese whetstone cutlery restoration & precision beveling"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Artisan Bio & Experience
              </label>
              <textarea
                rows={4}
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Share your years of practice, tools used, training, and why you love bringing pop-up services to neighbors."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Direct Contact Email
              </label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="e.g. kenji@kuroganeedgelab.com"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Phone Number (For Client Inquiries)
              </label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="e.g. (415) 892-3011"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Instagram Handle
              </label>
              <input
                type="text"
                value={profileInstagram}
                onChange={(e) => setProfileInstagram(e.target.value)}
                placeholder="e.g. @kuroganeedgelab"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Years in Craft / Experience
              </label>
              <input
                type="number"
                min="0"
                value={profileYearsInCraft}
                onChange={(e) => setProfileYearsInCraft(e.target.value)}
                placeholder="e.g. 8"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-900 mb-1">
                Profile Avatar Photo URL
              </label>
              <input
                type="url"
                value={profileAvatar}
                onChange={(e) => setProfileAvatar(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreatingNewProfile(false);
                setActiveTab('manage');
              }}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              {isCreatingNewProfile ? 'Create & Activate Profile' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
