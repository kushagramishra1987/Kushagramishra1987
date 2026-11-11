import React from 'react';
import { Booking } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Download,
  XCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { cancelBooking } from '../utils/storage';
import { downloadIcsFile } from '../utils/calendar';

interface MyBookingsProps {
  bookings: Booking[];
  onRefreshData: () => void;
  onExplorePopups: () => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({
  bookings,
  onRefreshData,
  onExplorePopups,
}) => {
  const handleCancel = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this pop-up reservation?')) {
      cancelBooking(bookingId);
      onRefreshData();
    }
  };

  const activeBookings = bookings.filter((b) => b.status === 'confirmed');
  const pastBookings = bookings.filter((b) => b.status !== 'confirmed');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-stone-900 font-display">My Pop-up Reservations</h2>
        <p className="text-xs text-stone-500 mt-1">
          Present your Pass Reference to the artisan when you arrive at their pop-up location.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
          <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-800">No active bookings yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            Discover local knife sharpeners, plant doctors, mobile bike mechanics, and espresso pop-ups near you.
          </p>
          <button
            type="button"
            onClick={onExplorePopups}
            className="mt-5 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5"
          >
            <span>Explore Active Pop-ups</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Passes */}
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-3 font-semibold uppercase tracking-wider">
              <span>Upcoming Appointments ({activeBookings.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Pass Header */}
                    <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                          Pass Code
                        </span>
                        <span className="text-base font-mono font-bold text-stone-900">
                          {b.bookingCode}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Confirmed
                      </span>
                    </div>

                    {/* Service & Time */}
                    <div className="flex gap-3.5 mt-4 items-start">
                      <img
                        src={b.serviceImageUrl}
                        alt={b.serviceTitle}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-stone-900 leading-snug truncate">
                          {b.serviceTitle}
                        </h4>
                        <span className="text-xs text-stone-500 block mt-0.5">
                          by {b.providerName}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-stone-800 mt-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>{b.dateLabel} at {b.timeSlot}</span>
                        </div>
                      </div>
                    </div>

                    {/* Location snippet */}
                    <div className="mt-3.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200/60 text-xs">
                      <div className="flex items-start gap-1.5 text-stone-700">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold block">{b.locationName}</span>
                          <span className="text-stone-500">{b.address}</span>
                        </div>
                      </div>
                      {b.specialNotes && (
                        <div className="mt-2 pt-2 border-t border-stone-200/60 text-[11px] text-stone-500">
                          <span className="font-medium text-stone-600">Your notes: </span>
                          {b.specialNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-bold text-stone-900 tabular-nums">
                      ₹{b.price} <span className="text-[11px] font-normal text-stone-500">via {b.paymentMethod === 'cash_on_spot' ? 'Cash' : 'UPI'}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `🎉 My Booking Pass: ${b.bookingCode}\n${b.serviceTitle} by ${b.providerName}\n${b.dateLabel} at ${b.timeSlot}\nSpot: ${b.locationName}, ${b.address}\nAmount: ₹${b.price}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                        title="Share on WhatsApp"
                      >
                        <span>WhatsApp</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => downloadIcsFile(b)}
                        className="px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Calendar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancel(b.id)}
                        className="px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past / Cancelled History if any */}
          {pastBookings.length > 0 && (
            <div className="mt-8 pt-6 border-t border-stone-200">
              <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider block mb-3">
                Past & Cancelled Bookings
              </span>
              <div className="space-y-2">
                {pastBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 bg-white rounded-xl border border-stone-200/70 flex items-center justify-between text-xs text-stone-500"
                  >
                    <div>
                      <span className="font-medium text-stone-800 mr-2">{b.serviceTitle}</span>
                      <span>{b.dateLabel}</span>
                    </div>
                    <span className="text-[11px] capitalize text-stone-400">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
