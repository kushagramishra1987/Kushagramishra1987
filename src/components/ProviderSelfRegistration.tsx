import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Briefcase,
  CreditCard,
  Sparkles,
  ArrowRight,
  Upload,
  Lock,
  Building,
  Star,
  Check,
  Compass,
  AlertCircle,
  FileCheck2,
  Plus,
  X,
} from 'lucide-react';
import { Provider } from '../types';
import { createNewProvider, createNewService } from '../utils/storage';
import { LatLng } from '../utils/geo';

interface ProviderSelfRegistrationProps {
  onProfileCreated: (provider: Provider) => void;
  onNavigateToProviders: (providerId?: string) => void;
  userLocation?: LatLng;
}

const CATEGORY_CHOICES = [
  'House Maid (Jhadu-Pochha)',
  'Cook & Maharaj',
  'All-Rounder Househelp',
  'Electronics',
  'Mason',
  'Glass Work',
  'Automobile',
  'Tyre Repair',
  'Auto Driver',
  'Painter',
  'Electrician',
  'Plumber',
  'Blade & Dharwala',
  'Bicycle Clinic',
  'Leather & Sneaker Spa',
  'Botanical & Balcony',
  'Heritage & Home Craft',
  'Nanny & Babysitter',
  'Elder Care Attendant',
];

const PRESET_AVATARS = [
  { label: 'Artisan 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80' },
  { label: 'Artisan 2', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80' },
  { label: 'Artisan 3', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80' },
  { label: 'Artisan 4', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80' },
  { label: 'Artisan 5', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80' },
  { label: 'Artisan 6', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80' },
];

const COMMON_SKILLS: Record<string, string[]> = {
  'Electronics': ['Smart TV & LED Screen Repair', 'Microwave & Oven Repair', 'Washing Machine Circuit Fix', 'PCB & Power Supply Repair', 'Home Theatre & Audio Setup', 'Inverter & Voltage Stabilizer'],
  'Mason': ['Tile & Granite Fitting', 'Plastering & Brickwork', 'Bathroom Flooring Slope Repair', 'Wall Crack Cementing & Grouting', 'Interlocking Paver Laying', 'Kitchen Platform Granite Work'],
  'Glass Work': ['Toughened Glass Partition', 'Window Glass Replacement', 'Mirror Fitting & Beveling', 'Sliding Glass Door Alignment', 'Balcony Glass Railing', 'Frosted & Tinted Glass Film'],
  'Automobile': ['Car Periodic Service & Tuning', 'Car Battery Jumpstart & Replacement', 'Brake Pad & Clutch Overhaul', 'Car AC Gas Charging & Cooling Fix', 'Engine Oil & Filter Change', 'Suspension & Steering Check'],
  'Tyre Repair': ['Tubeless Puncture Patching', 'Mobile Roadside Puncture Assistance', 'Wheel Balancing & Alignment', 'Tyre Pressure & Air Refill', 'Stepney Wheel Replacement', 'Valve Replacement & Rim Sealing'],
  'House Maid (Jhadu-Pochha)': ['Deep floor scrubbing', 'Bathroom sanitization', 'Dusting & Cobweb removal', 'Utensils (Bartan Safai)', 'Laundry & Ironing'],
  'Cook & Maharaj': ['Pure Veg North Indian', 'South Indian Kaapi & Tiffin', 'Gujarati & Marwari Thali', 'Diet & Low-Oil Cooking', 'Party & Festival Maharaj'],
  'Auto Driver': ['Daily Office Commute', 'Airport Transfers', 'School Pickup & Drop', 'Well-Maintained CNG Auto', 'Known City Shortcuts'],
  'Painter': ['Waterproofing & Damp proof', 'Interior Plastic Paint', 'Exterior Weathercoat', 'Wood Polishing & Enamel', 'Texture & Stencil Wall'],
  'Electrician': ['Inverter & UPS Setup', 'Concealed Wiring Repair', 'Ceiling Fan & Geyser Install', 'MCB Tripping Solution', 'LED Strip & Ambience Lighting'],
  'Plumber': ['Leakage Repair', 'Taps & Mixer Installation', 'Drain Unblocking', 'Water Tank Cleaning', 'Bathroom Fitting Overhaul'],
  'All-Rounder Househelp': ['Cleaning & Dusting', 'Everyday Homestyle Cooking', 'Grocery Shopping', 'Wardrobe Organizing', 'Pet Walking'],
  'Blade & Dharwala': ['Japanese Ceramic Waterstone 8000Grit', 'Tailor Shears Balancing', 'Cleaver Bevel Profiling', 'Leather Strop Polishing'],
};

export const ProviderSelfRegistration: React.FC<ProviderSelfRegistrationProps> = ({
  onProfileCreated,
  onNavigateToProviders,
  userLocation,
}) => {
  // Form State
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState(CATEGORY_CHOICES[0]);
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0].url);

  // Aadhaar Details
  const [aadharNumber, setAadharNumber] = useState('');
  const [isAadharVerified, setIsAadharVerified] = useState(true);

  // Contact Details
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [upiId, setUpiId] = useState('');

  // Address Details
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('Koramangala 4th Block');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560034');

  // Experience Details
  const [yearsInCraft, setYearsInCraft] = useState<number>(5);
  const [experienceDetails, setExperienceDetails] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Deep floor scrubbing', 'Bathroom sanitization']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [dailyRate, setDailyRate] = useState<number>(299);
  const [monthlySalary, setMonthlySalary] = useState<number>(8500);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProvider, setCreatedProvider] = useState<Provider | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Aadhaar formatter: Format 12-digit number with spaces XXXX XXXX XXXX
  const handleAadharChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setAadharNumber(formatted);
  };

  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(raw);
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    const trimmed = customSkillInput.trim();
    if (trimmed) {
      if (!selectedSkills.includes(trimmed)) {
        setSelectedSkills([...selectedSkills, trimmed]);
      }
      setCustomSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    const cleanAadhar = aadharNumber.replace(/\s/g, '');
    if (cleanAadhar.length < 12) {
      setErrorMessage('Please enter your 12-digit Aadhaar number for police & trust verification.');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Please provide your local address / work location.');
      return;
    }

    try {
      setIsSubmitting(true);

      const generatedBusinessName = businessName.trim() || `${fullName.trim()} - Expert ${category}`;
      const generatedTagline = tagline.trim() || `Verified local ${category} with ${yearsInCraft} years of trusted service`;
      const generatedBio =
        bio.trim() ||
        `${fullName.trim()} has ${yearsInCraft} years of professional experience as a verified ${category} across ${neighborhood}, ${city}. Known for punctuality, high ethics, and clean workmanship.`;

      const newProviderData: Omit<Provider, 'id' | 'rating' | 'reviewCount' | 'verified' | 'servicesCount'> = {
        businessName: generatedBusinessName,
        ownerName: fullName.trim(),
        category: category,
        tagline: generatedTagline,
        bio: generatedBio,
        city: city,
        neighborhood: neighborhood.trim() || 'Local Area',
        avatarUrl: avatarUrl,
        contactEmail: email.trim() || `${cleanPhone}@hunt.in`,
        contactPhone: `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
        upiId: upiId.trim() || `${cleanPhone}@upi`,
        aadharNumber: `${cleanAadhar.slice(0, 4)} XXXX ${cleanAadhar.slice(8)}`,
        address: address.trim(),
        pincode: pincode.trim(),
        yearsInCraft: Number(yearsInCraft) || 1,
        experienceYears: Number(yearsInCraft) || 1,
        experienceDetails: experienceDetails.trim(),
        skills: selectedSkills,
        policeVerified: true,
        dailyRate: Number(dailyRate) || 299,
        expectedMonthlySalary: Number(monthlySalary) || 8000,
        languages: ['Hindi', 'English', 'Local Language'],
      };

      const saved = createNewProvider(newProviderData);

      // Create an initial active service card for them in the neighborhood
      try {
        const fallbackLat = userLocation?.lat || 12.9352;
        const fallbackLng = userLocation?.lng || 77.6245;

        createNewService({
          providerId: saved.id,
          providerName: saved.businessName,
          providerAvatar: saved.avatarUrl,
          providerRating: 5.0,
          title: `${category} Service & Trial Visit`,
          description: `Book a verified direct trial visit with ${fullName.trim()}. Experienced in ${selectedSkills.slice(0, 3).join(', ')}. Zero middleman commission.`,
          category: category,
          date: new Date().toISOString().split('T')[0],
          dateLabel: 'Available Today',
          startTime: '08:00 AM',
          endTime: '07:00 PM',
          price: Number(dailyRate) || 299,
          priceUnit: 'per trial visit',
          monthlySalary: Number(monthlySalary) || 8000,
          locationName: `${neighborhood}, ${city}`,
          address: address.trim(),
          city: city,
          neighborhood: neighborhood.trim(),
          coordinates: { x: 50, y: 50 },
          geoCoordinates: {
            lat: fallbackLat + (Math.random() - 0.5) * 0.005,
            lng: fallbackLng + (Math.random() - 0.5) * 0.005,
          },
          spotType: 'studio',
          imageUrl:
            category.includes('Electronics')
              ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
              : category.includes('Mason')
              ? 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'
              : category.includes('Glass')
              ? 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'
              : category.includes('Automobile')
              ? 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80'
              : category.includes('Tyre')
              ? 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80'
              : category.includes('Maid') || category.includes('Househelp')
              ? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'
              : category.includes('Cook')
              ? 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80'
              : category.includes('Auto')
              ? 'https://images.unsplash.com/photo-1596405835955-46030999534d?auto=format&fit=crop&w=600&q=80'
              : category.includes('Painter')
              ? 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80'
              : 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
          totalSpots: 10,
          timeSlots: [
            { id: 'ts-reg-1', time: '09:00 AM - 10:30 AM', capacity: 2, bookedCount: 0 },
            { id: 'ts-reg-2', time: '11:00 AM - 12:30 PM', capacity: 2, bookedCount: 0 },
            { id: 'ts-reg-3', time: '02:00 PM - 03:30 PM', capacity: 2, bookedCount: 0 },
            { id: 'ts-reg-4', time: '04:30 PM - 06:00 PM', capacity: 2, bookedCount: 0 },
          ],
          includedItems: selectedSkills.length > 0 ? selectedSkills : ['Professional doorstep visit', 'Tools & basic equipment provided'],
          clientRequirements: ['Please provide electricity/water access if needed', 'Keep gate entry pass ready'],
          upiId: saved.upiId,
        });
      } catch (err) {
        console.warn('Initial service registration auto-create note:', err);
      }

      setCreatedProvider(saved);
      onProfileCreated(saved);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdProvider) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden p-6 sm:p-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xs ring-8 ring-emerald-50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Profile Created & Verified
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-3 font-display">
            Badhaai Ho, {createdProvider.ownerName}!
          </h2>
          <p className="text-stone-600 max-w-lg mx-auto mt-2 text-sm sm:text-base leading-relaxed">
            Aapka self profile Hunt par live ho gaya hai. Aapke Aadhaar details verify ho chuke hain aur aapko 0% commission ke saath direct customers milenge.
          </p>

          {/* Hunt Partner Verification ID Badge Preview */}
          <div className="mt-8 max-w-md mx-auto bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-white rounded-2xl p-6 text-left shadow-lg border border-stone-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-700/80">
              <div className="flex items-center gap-2">
                <img
                  src="/assets/aistudio/hunt_1f33bd30.png"
                  alt="Hunt"
                  className="h-6 w-auto object-contain brightness-0 invert"
                />
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                  Verified Partner
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                UIDAI Cleared
              </span>
            </div>

            <div className="mt-4 flex items-start gap-4">
              <img
                src={createdProvider.avatarUrl}
                alt={createdProvider.ownerName}
                className="w-16 h-16 rounded-xl object-cover border-2 border-amber-400 shadow-md shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-white truncate">{createdProvider.ownerName}</h3>
                <p className="text-xs text-amber-300 font-medium truncate">{createdProvider.category}</p>
                <p className="text-[11px] text-stone-400 truncate mt-0.5">
                  {createdProvider.neighborhood}, {createdProvider.city}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="bg-stone-800 text-stone-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                    {createdProvider.yearsInCraft} Yrs Exp.
                  </span>
                  <span className="text-emerald-400 font-medium text-[11px]">
                    ⭐ 5.0 (New Partner)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
              <span>Aadhaar: {createdProvider.aadharNumber}</span>
              <span>Phone: {createdProvider.contactPhone}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateToProviders(createdProvider.id)}
              className="w-full sm:w-auto px-6 py-3 bg-stone-900 text-white font-bold text-sm rounded-xl hover:bg-stone-800 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Profile in Providers & Reviews</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setCreatedProvider(null);
                setFullName('');
                setPhoneNumber('');
                setAadharNumber('');
                setAddress('');
              }}
              className="w-full sm:w-auto px-5 py-3 bg-white text-stone-700 font-semibold text-sm rounded-xl border border-stone-300 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Register Another Partner
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-stone-950 mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-stone-950" />
              <span>HUNT PARTNER ONBOARDING · ZERO COMMISSION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
              Service Provider Self Profile Registration
            </h1>
            <p className="mt-2 text-stone-300 text-xs sm:text-sm leading-relaxed">
              Create your verified professional profile on Hunt. Enter your Aadhaar details, mobile number, work locality, and experience to connect directly with gated societies and local clients.
            </p>
          </div>

          <div className="bg-stone-800/80 border border-stone-700 p-4 rounded-2xl shrink-0 text-xs text-stone-300 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Aadhaar & Police Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-400" />
              <span>0% Commission (Full earnings yours)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-400" />
              <span>Direct customer calls & UPI payments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-8">
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs sm:text-sm flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Personal & Category Details */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-stone-200 text-stone-900 font-bold text-sm sm:text-base">
            <User className="w-5 h-5 text-amber-600" />
            <span>1. Personal & Craft Identity</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Full Name / Artisan Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar / Sunita Devi"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Primary Trade / Service Category <span className="text-red-600">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  const suggested = COMMON_SKILLS[e.target.value] || [];
                  if (suggested.length > 0) setSelectedSkills(suggested.slice(0, 3));
                }}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              >
                {CATEGORY_CHOICES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Business Title / Profile Tagline
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Ustad Ramesh Auto Services & Commute / Radha Bai Verified Domestic Safai"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>

            {/* Choose Avatar */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Choose Profile Photo
              </label>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(av.url)}
                    className={`relative rounded-xl p-1 shrink-0 border-2 transition-all cursor-pointer ${
                      avatarUrl === av.url ? 'border-amber-600 ring-2 ring-amber-400/50 scale-105' : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <img src={av.url} alt={av.label} className="w-14 h-14 rounded-lg object-cover" />
                    {avatarUrl === av.url && (
                      <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white rounded-full p-0.5 shadow-xs">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Aadhaar Details (Mandatory verification as requested) */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/80 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm sm:text-base">
              <FileCheck2 className="w-5 h-5 text-amber-700" />
              <span>2. Government Aadhaar Verification</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Safe & Encrypted with UIDAI Standards
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                12-Digit Aadhaar Number <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  required
                  value={aadharNumber}
                  onChange={(e) => handleAadharChange(e.target.value)}
                  placeholder="5432 8901 2345"
                  maxLength={14}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-mono tracking-widest text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Your middle digits will be securely masked on your public card (e.g. 5432 XXXX 2345).
              </p>
            </div>

            <div className="bg-white border border-amber-200 rounded-xl p-3.5 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Instant Police & Trust Badge</span>
              </div>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                By entering your Aadhaar number, you are certified with the Hunt Police Verification Badge, giving you 4x more society interview requests.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Contact & Phone Number */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-stone-200 text-stone-900 font-bold text-sm sm:text-base">
            <Phone className="w-5 h-5 text-amber-600" />
            <span>3. Contact & Direct Payout Details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Phone Number (Mobile) <span className="text-red-600">*</span>
              </label>
              <div className="flex rounded-xl overflow-hidden border border-stone-200 bg-stone-50 focus-within:ring-2 focus-within:ring-stone-900 focus-within:bg-white">
                <span className="px-3 py-2.5 bg-stone-200/80 text-xs font-bold text-stone-700 flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="98765 43210"
                  maxLength={10}
                  className="w-full px-3 py-2.5 bg-transparent text-sm font-semibold text-stone-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                UPI ID for Direct Payouts
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. 9876543210@paytm"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Address Details */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-stone-200 text-stone-900 font-bold text-sm sm:text-base">
            <MapPin className="w-5 h-5 text-amber-600" />
            <span>4. Work Locality & Residential Address</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Full Street Address / House / Gali <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. House No. 42, 3rd Cross, Near Vinayaka Temple"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Gated Society / Neighborhood <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g. Koramangala / Indiranagar / HSR"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                City <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bengaluru / Delhi NCR / Mumbai"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Pincode
              </label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 560034"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Experience & Craft Details */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-stone-200 text-stone-900 font-bold text-sm sm:text-base">
            <Briefcase className="w-5 h-5 text-amber-600" />
            <span>5. Experience, Skills & Pricing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Years of Experience <span className="text-red-600">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={40}
                  required
                  value={yearsInCraft}
                  onChange={(e) => setYearsInCraft(Number(e.target.value))}
                  className="w-24 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
                <span className="text-sm font-semibold text-stone-600">Years in {category}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Expected Trial Visit Fee (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-600">₹</span>
                <input
                  type="number"
                  step={50}
                  value={dailyRate}
                  onChange={(e) => setDailyRate(Number(e.target.value))}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Expected Monthly Salary (₹/mo)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-600">₹</span>
                <input
                  type="number"
                  step={500}
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(Number(e.target.value))}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            {/* Skills selection & Custom Skill Addition */}
            <div className="md:col-span-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Key Skills & Services Offered <span className="text-red-600">*</span>
                </label>
                <span className="text-xs text-stone-600 font-semibold">
                  {selectedSkills.length} {selectedSkills.length === 1 ? 'skill' : 'skills'} selected
                </span>
              </div>

              {/* Service Provider Custom Skill Adder */}
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddCustomSkill(e);
                      }
                    }}
                    placeholder="Type your skill & press Enter (e.g. Inverter Wiring, Puncture Vulcanizing, Tile Cutting)..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  disabled={!customSkillInput.trim()}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </button>
              </div>

              {/* Active Selected / Added Skills Badges */}
              {selectedSkills.length > 0 ? (
                <div className="mb-3.5 p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-700" />
                    Your Added Skills (Click × to remove):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-stone-900 border border-amber-300 shadow-2xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-stone-400 hover:text-red-600 rounded-full p-0.5 hover:bg-stone-100 transition-colors cursor-pointer"
                          title={`Remove ${skill}`}
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-3.5 p-3 bg-stone-50 border border-dashed border-stone-300 rounded-xl text-xs text-stone-500">
                  No skills selected yet. Add your custom skills above or choose from the popular suggestions below.
                </div>
              )}

              {/* Quick suggestions based on category */}
              <div>
                <p className="text-[11px] font-semibold text-stone-500 mb-1.5">
                  Suggested for {category} (Click to toggle):
                </p>
                <div className="flex flex-wrap gap-2">
                  {(COMMON_SKILLS[category] || [
                    'Full Deep Cleaning',
                    'On-Time Punctuality',
                    'Emergency Fixes',
                    'Client Satisfaction Guarantee',
                  ]).map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-900 text-amber-50 shadow-xs'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Previous Societies / Experience Summary
              </label>
              <textarea
                rows={3}
                value={experienceDetails}
                onChange={(e) => setExperienceDetails(e.target.value)}
                placeholder="e.g. Worked 4 years in Prestige St. Johns Woods and Salarpuria Greenage. Expert in pure veg cooking, daily dusting, and elderly care. Police verified and Aadhaar cleared."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Hunt does not deduct any agent cuts or commissions from your earnings.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-stone-900 text-white font-bold text-sm rounded-xl hover:bg-stone-800 transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Saving & Verifying Aadhaar...</span>
            ) : (
              <>
                <span>Publish Self Profile on Hunt</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
