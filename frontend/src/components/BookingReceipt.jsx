import Icon from './Icon';

export default function BookingReceipt({ booking, room, onClose, onHome }) {
  if (!booking) return null;

  const roomName = room?.name || booking.room?.name || 'Deluxe Room Category';
  const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const nights = Math.max(
    1,
    Math.round((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))
  );

  const fullAddress = 'M4G9+P36 Sudha hotel, Una - Amb Rd, Pratap Nagar, Amb, Himachal Pradesh 177203';
  const mapsLink = 'https://maps.google.com/?q=M4G9%2BP36+Sudha+hotel+Amb';

  // Generate dynamic QR code URL encoding direct verification link with booking code
  const verificationUrl = `${window.location.origin}/admin/dashboard?verify=${booking.bookingCode}`;
  const qrData = encodeURIComponent(verificationUrl);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;

  // WhatsApp share link text
  const whatsappMsg = encodeURIComponent(
    `*Sudha Hotel Booking Confirmation*\n` +
      `Booking Ref: #${booking.bookingCode}\n` +
      `Guest Name: ${booking.guestName}\n` +
      `Room: ${roomName}\n` +
      `Dates: ${checkInDate} to ${checkOutDate} (${nights} Night${nights > 1 ? 's' : ''})\n` +
      `Total Paid: ₹${booking.totalAmount?.toLocaleString('en-IN')}\n` +
      `Address: ${fullAddress}\n` +
      `Front Desk: 094187 03201\n` +
      `Map: ${mapsLink}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappMsg}`;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex flex-col items-center gap-space-md w-full max-w-xl mx-auto">
      {/* Print styles to print ONLY the receipt card */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #sudha-receipt-card, #sudha-receipt-card * {
            visibility: visible;
          }
          #sudha-receipt-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 1px solid #ccc !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Receipt Voucher Card */}
      <div
        id="sudha-receipt-card"
        className="w-full p-space-md sm:p-space-lg rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xl flex flex-col gap-space-md text-left"
      >
        {/* Voucher Header */}
        <div className="flex items-start justify-between border-b border-outline-variant/30 pb-space-sm">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-surface font-display font-bold flex items-center justify-center text-md">
                S
              </div>
              <span className="font-display text-headline-sm text-primary font-bold">Sudha Hotel &amp; Restaurant</span>
            </div>
            <span className="text-label-sm text-on-surface-variant mt-0.5 font-medium">
              {fullAddress}
            </span>
            <span className="text-label-sm text-secondary font-medium">Front Desk: 094187 03201</span>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`px-space-xs py-1 rounded-full text-label-sm font-bold uppercase tracking-wider ${
                booking.paymentStatus === 'paid'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {booking.paymentStatus === 'paid' ? 'BOOKING CONFIRMED' : 'REQUEST PENDING'}
            </span>
            <span className="text-label-md font-bold text-primary">#{booking.bookingCode}</span>
          </div>
        </div>

        {/* Verification Status Alert Banner */}
        {booking.paymentStatus !== 'paid' ? (
          <div className="p-space-sm rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-space-xs shadow-sm">
            <Icon name="hourglass_empty" className="text-amber-600 text-[22px] flex-shrink-0 mt-0.5" />
            <div className="flex flex-col text-label-sm">
              <strong className="text-label-md font-bold text-amber-950">
                Booking request received. Payment will be verified by the hotel.
              </strong>
              <p className="mt-0.5 text-amber-900">
                Your payment reference has been submitted. Front desk staff will verify your payment and confirm your booking shortly.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-space-sm rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-space-xs shadow-sm">
            <Icon name="check_circle" className="text-emerald-600 text-[22px] flex-shrink-0 mt-0.5" />
            <div className="flex flex-col text-label-sm">
              <strong className="text-label-md font-bold text-emerald-950">
                Booking Confirmed &amp; Payment Verified
              </strong>
              <p className="mt-0.5 text-emerald-900">
                Your booking has been verified by the hotel manager. We look forward to welcoming you!
              </p>
            </div>
          </div>
        )}

        {/* Guest & QR Code Section */}
        <div className="grid grid-cols-3 gap-space-sm items-center bg-surface-container-low p-space-sm rounded-2xl border border-outline-variant/20">
          <div className="col-span-2 flex flex-col gap-1">
            <span className="text-label-sm text-secondary uppercase font-bold tracking-wider">Guest Information</span>
            <p className="text-label-lg font-bold text-primary">{booking.guestName}</p>
            <p className="text-label-sm text-on-surface-variant flex items-center gap-1">
              <Icon name="phone" className="text-[14px]" /> +91 {booking.phone}
            </p>
            {booking.email && (
              <p className="text-label-sm text-on-surface-variant flex items-center gap-1 truncate">
                <Icon name="email" className="text-[14px]" /> {booking.email}
              </p>
            )}
          </div>

          {/* Verification QR Code */}
          <div className="flex flex-col items-center text-center">
            <img src={qrCodeUrl} alt="Booking Verification QR" className="w-20 h-20 rounded-lg border border-outline-variant/40 p-1 bg-white shadow-sm" />
            <span className="text-label-sm text-on-surface-variant mt-1 font-semibold">Scan to Verify</span>
          </div>
        </div>

        {/* Reservation Stay Details Grid */}
        <div className="grid grid-cols-2 gap-space-xs">
          <div className="p-space-xs rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col">
            <span className="text-label-sm text-secondary uppercase font-bold">Check-in</span>
            <span className="text-label-md font-bold text-primary">{checkInDate}</span>
            <span className="text-label-sm text-on-surface-variant">Arrival after 12:00 PM</span>
          </div>

          <div className="p-space-xs rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col">
            <span className="text-label-sm text-secondary uppercase font-bold">Check-out</span>
            <span className="text-label-md font-bold text-primary">{checkOutDate}</span>
            <span className="text-label-sm text-on-surface-variant">Departure by 11:00 AM</span>
          </div>
        </div>

        {/* Room & Occupancy Info */}
        <div className="p-space-xs rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-label-sm text-secondary uppercase font-bold">Reserved Sanctuary</span>
            <p className="text-label-md font-bold text-primary">{roomName}</p>
          </div>
          <div className="text-right">
            <span className="text-label-sm text-secondary uppercase font-bold">Duration</span>
            <p className="text-label-md font-bold text-primary">
              {nights} Night{nights > 1 ? 's' : ''} · {booking.adults || 2} Guests
            </p>
          </div>
        </div>

        {/* Payment & Fare Breakdown */}
        <div className="flex flex-col gap-space-2xs border-t border-outline-variant/30 pt-space-xs">
          <div className="flex justify-between text-body-sm">
            <span className="text-on-surface-variant">Payment Method</span>
            <span className="font-bold text-primary capitalize">
              {booking.paymentMethod === 'upi_qr' ? 'Owner UPI QR Scan & Pay' : booking.paymentMethod?.replace('_', ' ')}
            </span>
          </div>

          {booking.upiTransactionRef && (
            <div className="flex justify-between text-body-sm">
              <span className="text-on-surface-variant">UPI UTR / Ref Number</span>
              <span className="font-bold text-primary font-mono">{booking.upiTransactionRef}</span>
            </div>
          )}

          <div className="flex justify-between text-body-sm">
            <span className="text-on-surface-variant">Payment Status</span>
            <span className={`font-bold ${booking.paymentStatus === 'paid' ? 'text-secondary' : 'text-terracotta'}`}>
              {booking.paymentStatus === 'paid' ? 'Verified / Paid' : 'Pending Verification'}
            </span>
          </div>

          <div className="flex justify-between items-center pt-space-xs border-t border-outline-variant/20 mt-space-2xs">
            <span className="font-display text-headline-sm text-primary font-bold">Total Amount</span>
            <span className="font-display text-headline-sm text-terracotta font-bold">
              ₹{booking.totalAmount?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Front Desk Policies */}
        <div className="p-space-xs rounded-xl bg-surface-container text-on-surface-variant text-label-sm flex items-center gap-space-xs">
          <Icon name="info" className="text-secondary text-[18px] flex-shrink-0" />
          <span>Please present a government-issued photo ID (Aadhaar / Driving License / Passport) at front desk check-in.</span>
        </div>
      </div>

      {/* Interactive Action Buttons */}
      <div className="no-print flex flex-wrap items-center gap-space-xs w-full">
        <button
          onClick={handlePrint}
          className="flex-1 py-space-sm px-space-md rounded-full bg-primary hover:bg-primary/90 text-surface font-label-md font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
        >
          <Icon name="print" className="text-[18px]" /> Print / Save PDF
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-space-sm px-space-md rounded-full bg-secondary hover:bg-secondary/90 text-white font-label-md font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
        >
          <Icon name="chat" className="text-[18px]" /> Share via WhatsApp
        </a>

        {onHome && (
          <button
            onClick={onHome}
            className="w-full py-space-xs rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md font-semibold transition-colors"
          >
            Back to Homepage
          </button>
        )}
      </div>
    </div>
  );
}
