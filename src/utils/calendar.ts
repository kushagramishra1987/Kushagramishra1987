import { Booking } from '../types';

export function downloadIcsFile(booking: Booking) {
  // Parse date and time into iCal format
  // Example date: '2026-11-03', timeSlot: '11:15 AM'
  const dateParts = booking.date.split('-');
  const year = dateParts[0] || '2026';
  const month = dateParts[1] || '11';
  const day = dateParts[2] || '03';

  // Basic time parsing
  let hour = 11;
  let minute = 0;
  const timeMatch = booking.timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (timeMatch) {
    hour = parseInt(timeMatch[1], 10);
    minute = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3].toUpperCase();
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
  }

  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  const startStr = `${year}${month}${day}T${pad(hour)}${pad(minute)}00`;
  // Default duration 45 mins
  const endHour = hour + Math.floor((minute + 45) / 60);
  const endMin = (minute + 45) % 60;
  const endStr = `${year}${month}${day}T${pad(endHour)}${pad(endMin)}00`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hunt//Local Pop-up Services//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:hunt-${booking.id}@local`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${booking.serviceTitle} (${booking.providerName})`,
    `DESCRIPTION:Hunt Booking Ref: ${booking.bookingCode}\\nProvider: ${booking.providerName}\\nPhone: ${booking.providerPhone}\\nNotes: ${booking.specialNotes || 'None'}`,
    `LOCATION:${booking.locationName}, ${booking.address}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Hunt-${booking.bookingCode}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
