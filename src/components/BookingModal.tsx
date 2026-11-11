import React, { useState } from 'react';
import { PopUpService, Booking } from '../types';
import { X, Calendar, Clock, MapPin, CheckCircle2, Download, AlertCircle, ArrowRight, Star, ShieldCheck, Home, Phone, Building2 } from 'lucide-react';
import { bookAppointment } from '../utils/storage';
import { downloadIcsFile } from '../utils/calendar';

interface BookingModalProps {
  service: PopUpService | null;
  onClose: () => void;
  onBookingComplete: (newBooking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  service,
  onClose,
  onBookingComplete,
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [societyApartment, setSocietyApartment] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [houseSize, setHouseSize] = useState('2 BHK');
  const [specialNotes, setSpecialNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash_on_spot'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!service) return null;

  // Auto select first available slot
  React.useEffect(() => {
    if (service && !selectedSlotId) {
      const available = service.timeSlots.find((s) => s.bookedCount < s.capacity);
      if (available) setSelectedSlotId(available.id);
    }
  }, [service, selectedSlotId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId) {
      setErrorMessage('Please select an interview / trial time slot.');
      return;
    }
    if (!clientName.trim() || !clientPhone.trim() || !societyApartment.trim()) {
      setErrorMessage('Please provide your name, WhatsApp phone number, and society/apartment name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      const { booking } = bookAppointment({
        serviceId: service.id,
        timeSlotId: selectedSlotId,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim() || `${clientPhone.replace(/\D/g, '')}@hunt.in`,
        clientPhone: clientPhone.trim(),
        societyApartment: societyApartment.trim(),
        flatNumber: flatNumber.trim(),
        houseSize: houseSize,
        paymentMethod: paymentMethod,
        specialNotes: specialNotes.trim(),
      });
      setConfirmedBooking(booking);
      onBookingComplete(booking);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete booking. Please try another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="font-bold text-stone-900">
              {confirmedBooking ? 'Home Trial Confirmed' : 'Book My Bai · Schedule Home Trial'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{service.category}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {confirmedBooking ? (
          /* Confirmation Pass Screen */
          <div className="p-6 sm:p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 font-display">
                Home Trial Confirmed!
              </h2>
              <p className="text-sm text-stone-600 mt-1">
                Your appointment pass has been issued for {confirmedBooking.providerName}.
              </p>
            </div>

            {/* Pass Ticket Design */}
            <div className="mt-6 bg-gradient-to-br from-stone-50 to-stone-100/60 rounded-2xl border border-stone-200 p-5 relative overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
                    Pass Reference
                  </span>
                  <span className="text-lg font-bold font-mono text-stone-900 block mt-0.5">
                    {confirmedBooking.bookingCode}
                  </span>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
                    Verified Staff
                  </span>
                </div>
              </div>

              <div className="my-4 border-t border-dashed border-stone-200" />

              <div className="space-y-2 text-xs text-stone-700">
                <div className="flex justify-between">
                  <span className="text-stone-500">Service:</span>
                  <span className="font-semibold text-stone-900">{confirmedBooking.serviceTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Helper:</span>
                  <span className="font-semibold text-stone-900">{confirmedBooking.providerName} ({confirmedBooking.providerPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Scheduled Time:</span>
                  <span className="font-semibold text-stone-900">{confirmedBooking.dateLabel} · {confirmedBooking.timeSlot}</span>
                </div>
                {confirmedBooking.societyApartment && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Address:</span>
                    <span className="font-semibold text-stone-900">{confirmedBooking.flatNumber ? `${confirmedBooking.flatNumber}, ` : ''}{confirmedBooking.societyApartment}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Trial Fee & Payment:</span>
                  <span className="font-semibold text-stone-900">
                    ₹{confirmedBooking.price} ({confirmedBooking.paymentMethod === 'upi' ? 'Direct UPI' : 'Cash on Trial'})
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Free Replacement Guarantee
                </span>
                <span>Zero platform commission</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => downloadIcsFile(confirmedBooking)}
                className="flex-1 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Add to Google / Apple Calendar</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `*Book My Bai (Hunt) Trial Pass: ${confirmedBooking.bookingCode}*\nService: ${confirmedBooking.serviceTitle}\nHelper: ${confirmedBooking.providerName} (${confirmedBooking.providerPhone})\nTime: ${confirmedBooking.dateLabel} · ${confirmedBooking.timeSlot}\nLocation: ${confirmedBooking.flatNumber ? `${confirmedBooking.flatNumber}, ` : ''}${confirmedBooking.societyApartment || confirmedBooking.locationName}\nAmount: ₹${confirmedBooking.price} (${confirmedBooking.paymentMethod === 'upi' ? 'UPI' : 'Cash'})`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>Share Pass on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Input Booking Form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Service Summary Banner */}
            <div className="flex gap-4 p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 items-center">
              <img
                src={service.imageUrl}
                alt={service.title}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stone-200"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  ✓ Verified Domestic Staff
                </span>
                <h3 className="text-sm font-bold text-stone-900 truncate mt-1">
                  {service.title}
                </h3>
                <p className="text-xs text-stone-500 truncate">
                  Candidate: {service.providerName} · {service.neighborhood}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="font-bold text-stone-900 tabular-nums">
                    ₹{service.price} Trial Visit
                  </span>
                  {service.monthlySalary && service.monthlySalary > 0 && (
                    <span className="text-stone-500 font-medium">
                      (₹{service.monthlySalary.toLocaleString('en-IN')}/mo)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Step 1: Select Shift Slot */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  1. Choose Interview / Trial Time Slot
                </label>
                <span className="text-xs text-stone-500">{service.dateLabel}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {service.timeSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  const left = slot.capacity - slot.bookedCount;
                  const isAvailable = left > 0;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-2.5 text-left rounded-xl border transition-all text-xs flex flex-col justify-between ${
                        !isAvailable
                          ? 'border-stone-100 bg-stone-50 text-stone-400 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                          : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                      }`}
                    >
                      <span className="font-semibold text-sm">{slot.time}</span>
                      <span
                        className={`text-[11px] mt-1 ${
                          isSelected ? 'text-amber-200' : isAvailable ? 'text-stone-500' : 'text-stone-400'
                        }`}
                      >
                        {isAvailable ? `${left} slot available` : 'Fully booked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Household & Society Address */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
                2. Your Home & Society Details
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <span className="text-xs text-stone-600 font-medium block mb-1">
                    Apartment / Gated Community / Society *
                  </span>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={societyApartment}
                      onChange={(e) => setSocietyApartment(e.target.value)}
                      placeholder="e.g. Prestige Acropolis, Block A"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-xs text-stone-600 font-medium block mb-1">
                    Flat / House No.
                  </span>
                  <div className="relative">
                    <Home className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={flatNumber}
                      onChange={(e) => setFlatNumber(e.target.value)}
                      placeholder="e.g. 402"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs text-stone-600 font-medium block mb-1">
                  Home Size / Requirement
                </span>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {['1 BHK', '2 BHK', '3 BHK', '4 BHK+ / Villa'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setHouseSize(size)}
                      className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-all ${
                        houseSize === size
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Contact Details */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
                3. Contact Information (For Pass & OTP)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-stone-600 font-medium block mb-1">Your Name *</span>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <span className="text-xs text-stone-600 font-medium block mb-1">WhatsApp Mobile Number *</span>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+91 98450 12345"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs text-stone-600 font-medium block mb-1">Special Instructions (Optional)</span>
                <input
                  type="text"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Vegetarian kitchen only, or need trial at sharp 8:30 AM"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            {/* Step 4: Payment Mode */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
                4. Trial Payment (Payable after visit)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between text-xs cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-600'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">⚡</span>
                    <div>
                      <span className="block font-semibold">UPI Direct QR</span>
                      <span className="text-[10px] text-stone-500 font-normal">GPay, PhonePe, Paytm, BHIM</span>
                    </div>
                  </div>
                  {paymentMethod === 'upi' && <span className="text-emerald-700 font-bold text-sm">✓</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_on_spot')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between text-xs cursor-pointer ${
                    paymentMethod === 'cash_on_spot'
                      ? 'border-stone-900 bg-stone-100 text-stone-950 font-semibold ring-1 ring-stone-900'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">💵</span>
                    <div>
                      <span className="block font-semibold">Cash on Trial</span>
                      <span className="text-[10px] text-stone-500 font-normal">Pay pro directly in cash</span>
                    </div>
                  </div>
                  {paymentMethod === 'cash_on_spot' && <span className="text-stone-900 font-bold text-sm">✓</span>}
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-stone-500 block">Total Trial Fee</span>
                <span className="text-lg font-bold text-stone-900 tabular-nums">
                  ₹{service.price}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{isSubmitting ? 'Confirming...' : 'Confirm Trial & Get Pass'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
