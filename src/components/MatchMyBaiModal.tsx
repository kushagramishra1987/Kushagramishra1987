import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, UserCheck, Clock, Home } from 'lucide-react';
import { CategoryFilter } from '../types';

interface MatchMyBaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (category: CategoryFilter, query: string) => void;
}

export const MatchMyBaiModal: React.FC<MatchMyBaiModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<CategoryFilter>('House Maid (Jhadu-Pochha)');
  const [houseSize, setHouseSize] = useState('2 BHK');
  const [timing, setTiming] = useState('Morning (7 AM - 11 AM)');
  const [dietary, setDietary] = useState('Pure Veg');

  if (!isOpen) return null;

  const handleFinish = () => {
    onApplyFilters(selectedRole, '');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-transparent">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-400 text-stone-950 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Match My Bai in 30 Seconds
              </h3>
              <p className="text-[11px] text-stone-500">
                Step {step} of 3 · AI-assisted domestic staff matching
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-stone-100 h-1">
          <div
            className="bg-amber-400 h-1 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {/* STEP 1: Select Role */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-stone-900 font-display">
                  Kaunsa helper chahiye? (Select staff role)
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Choose the domestic service you need for your home.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    role: 'House Maid (Jhadu-Pochha)' as CategoryFilter,
                    icon: '🧹',
                    desc: 'Sweeping, mopping, utensils & dusting',
                  },
                  {
                    role: 'Home Cook & Maharaj' as CategoryFilter,
                    icon: '👨‍🍳',
                    desc: 'Phulkas, North/South Indian, Jain safe',
                  },
                  {
                    role: 'Baby Care & Nanny' as CategoryFilter,
                    icon: '👶',
                    desc: 'Infant care, feeding & toddler play',
                  },
                  {
                    role: 'Elderly & Patient Care' as CategoryFilter,
                    icon: '👵',
                    desc: 'Senior companion & bedside recovery',
                  },
                  {
                    role: 'Deep Cleaning & Dusting' as CategoryFilter,
                    icon: '✨',
                    desc: 'Kitchen degreasing & bathroom scrub',
                  },
                  {
                    role: 'Driver & Chauffeur' as CategoryFilter,
                    icon: '🚗',
                    desc: 'Daily commute & school drops',
                  },
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setSelectedRole(item.role)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      selectedRole === item.role
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/40 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-stone-900 block truncate">
                        {item.role}
                      </span>
                      <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                        {item.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-xs"
                >
                  <span>Next: Home & Shift</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Home Size & Timing */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-lg font-bold text-stone-900 font-display">
                  Ghar ka size aur shift timing?
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Helps calculate fair monthly market salary & matching availability.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-2">
                  Apartment / Home Size
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {['1 BHK', '2 BHK', '3 BHK', '4 BHK+ / Villa'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setHouseSize(size)}
                      className={`py-2 px-2.5 rounded-xl border text-center font-semibold transition-all ${
                        houseSize === size
                          ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-2">
                  Preferred Shift Timings
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    'Morning (7 AM - 11 AM)',
                    'Afternoon (11 AM - 3 PM)',
                    'Evening (4 PM - 8 PM)',
                    'Full Day (9 AM - 6 PM)',
                    '24-Hour Live-in',
                    'On-Demand / Emergency Today',
                  ].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTiming(t)}
                      className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                        timing === t
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-xs"
                >
                  <span>Next: Final Preferences</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Dietary & Verification Review */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-lg font-bold text-stone-900 font-display">
                  Dietary & Safety Preferences
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  BookMyBai provides 100% verified staff with free replacement guarantee.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-2">
                  Kitchen / Cooking Preference
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {['Pure Veg', 'Veg & Non-Veg', 'Jain Only'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDietary(d)}
                      className={`py-2 px-2.5 rounded-xl border text-center font-semibold transition-all ${
                        dietary === d
                          ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust Callout */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-2 text-xs text-emerald-950">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>BookMyBai Safety Guarantee Included:</span>
                </div>
                <ul className="space-y-1 text-emerald-800 text-[11px]">
                  <li>✓ 100% Verified Police Precinct Clearance Report</li>
                  <li>✓ Aadhaar Biometric identity and address check</li>
                  <li>✓ Free immediate replacement if helper is unavailable</li>
                  <li>✓ Direct UPI settlement, 0% platform fee</li>
                </ul>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Find Matched Candidates ({selectedRole.split(' ')[0]})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
