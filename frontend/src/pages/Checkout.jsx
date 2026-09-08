import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon';
import BookingReceipt from '../components/BookingReceipt';
import { fetchRoom } from '../api/rooms';
import { quoteBooking, createBooking } from '../api/bookings';
import { fetchSettings } from '../api/settings';
import ImageUploader from '../components/ImageUploader';
import { getImageUrl } from '../api/client';

const STEPS = ['Suite', 'Details', 'Payment & Fare'];

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roomId = searchParams.get('roomId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const adults = Number(searchParams.get('adults') || 2);
  const roomsBooked = Number(searchParams.get('rooms') || 1);

  const [step, setStep] = useState(0);
  const [room, setRoom] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [guest, setGuest] = useState({ guestName: '', email: '', phone: '', specialRequests: '' });
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi_qr');
  const [upiTransactionRef, setUpiTransactionRef] = useState('');
  const [paymentProofImage, setPaymentProofImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    if (!roomId || !checkIn || !checkOut) {
      setLoadError('Missing booking details. Please select a room again from the Rooms page.');
      setLoading(false);
      return;
    }
    Promise.all([fetchRoom(roomId, { checkIn, checkOut }), fetchSettings()])
      .then(([roomData, settingsData]) => {
        setRoom(roomData.room);
        setSettings(settingsData.settings || null);
      })
      .catch((err) => setLoadError(err?.response?.data?.message || 'Could not load this room.'))
      .finally(() => setLoading(false));
  }, [roomId, checkIn, checkOut]);

  useEffect(() => {
    if (!room) return;
    setQuoteError('');
    quoteBooking({ roomId, checkIn, checkOut, roomsBooked, adults })
      .then(setQuote)
      .catch((err) => setQuoteError(err?.response?.data?.message || 'Could not calculate the fare right now.'));
  }, [room, roomId, checkIn, checkOut, roomsBooked, adults]);

  const nights = quote?.nights;

  async function handleProceedToPay(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      if (paymentMethod === 'upi_qr' && !upiTransactionRef.trim()) {
        setSubmitError('Please enter your 12-digit UPI UTR / Transaction Reference number.');
        setSubmitting(false);
        return;
      }

      const { booking } = await createBooking({
        roomId,
        checkIn,
        checkOut,
        roomsBooked,
        adults,
        children: 0,
        guestName: guest.guestName,
        email: guest.email,
        phone: guest.phone,
        countryCode: '+91',
        specialRequests: guest.specialRequests,
        paymentMethod,
        upiTransactionRef,
        paymentProofImage,
      });

      setConfirmedBooking(booking);
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Could not complete the booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <main className="pt-24 px-gutter-mobile text-center text-body-md text-on-surface-variant">Loading suite...</main>;
  }
  if (loadError) {
    return (
      <main className="pt-24 px-gutter-mobile text-center flex flex-col gap-space-md items-center">
        <p className="text-body-md text-error">{loadError}</p>
        <button onClick={() => navigate('/rooms')} className="text-terracotta font-semibold underline">
          Back to Rooms
        </button>
      </main>
    );
  }

  if (confirmedBooking) {
    return (
      <main className="pt-20 pb-space-2xl px-gutter-mobile flex flex-col items-center">
        <BookingReceipt
          booking={confirmedBooking}
          room={room}
          onHome={() => navigate('/')}
        />
      </main>
    );
  }

  return (
    <main className="pt-20 pb-space-2xl px-gutter-mobile max-w-2xl mx-auto flex flex-col gap-space-lg">
      <div className="flex items-center gap-space-sm">
        <button onClick={() => navigate(-1)}>
          <Icon name="arrow_back" className="text-primary" />
        </button>
        <h1 className="font-display text-headline-sm text-primary">Checkout Booking</h1>
      </div>

      <div className="flex items-center justify-between px-space-md">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-label-md font-bold ${
                i < step
                  ? 'bg-secondary text-white'
                  : i === step
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {i < step ? <Icon name="check" className="text-[16px]" /> : i + 1}
            </div>
            <span className="text-label-sm text-on-surface-variant">{label}</span>
          </div>
        ))}
      </div>

      <div className="relative rounded-2xl overflow-hidden h-40">
        <img src={room.images?.[0]} alt={room.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-space-md">
          <span className="text-label-sm px-space-xs py-0.5 rounded-full bg-surface/80 text-primary w-fit mb-1">
            {room.category}
          </span>
          <h2 className="font-display text-headline-sm text-white">{room.name}</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-space-sm p-space-md rounded-xl bg-surface-container">
        <div>
          <p className="text-label-sm text-secondary uppercase font-bold">Check-in</p>
          <p className="text-label-md font-bold text-primary">{checkIn}</p>
        </div>
        <div>
          <p className="text-label-sm text-secondary uppercase font-bold">Check-out</p>
          <p className="text-label-md font-bold text-primary">{checkOut}</p>
        </div>
        <p className="text-label-md text-on-surface-variant flex items-center gap-1">
          <Icon name="hotel" className="text-[16px]" /> {nights || '-'} Nights · {roomsBooked} Room
          {roomsBooked > 1 ? 's' : ''}
        </p>
        <p className="text-label-md text-on-surface-variant flex items-center gap-1">
          <Icon name="group" className="text-[16px]" /> {adults} Adults
        </p>
      </div>

      {step === 0 && (
        <div className="flex flex-col gap-space-sm">
          <p className="text-body-md text-on-surface-variant">{room.description}</p>
          <div className="flex flex-wrap gap-space-2xs">
            {room.amenities?.map((a) => (
              <span key={a} className="text-label-sm px-space-xs py-1 rounded-full bg-secondary/10 text-primary">
                {a}
              </span>
            ))}
          </div>
          <button
            onClick={() => setStep(1)}
            className="mt-space-sm py-space-sm rounded-full bg-primary text-surface font-label-lg font-bold"
          >
            Continue to Guest Details
          </button>
        </div>
      )}

      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
          className="flex flex-col gap-space-sm"
        >
          <h3 className="font-display text-headline-sm text-primary flex items-center gap-space-xs">
            <Icon name="person" /> Guest Information
          </h3>
          <div>
            <label className="text-label-sm text-secondary uppercase font-bold">Primary Guest Name *</label>
            <input
              required
              value={guest.guestName}
              onChange={(e) => setGuest({ ...guest, guestName: e.target.value })}
              className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40"
              placeholder="e.g. Aditya Sharma"
            />
          </div>
          <div>
            <label className="text-label-sm text-secondary uppercase font-bold">Email Address *</label>
            <input
              required
              type="email"
              value={guest.email}
              onChange={(e) => setGuest({ ...guest, email: e.target.value })}
              className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40"
              placeholder="e.g. aditya.sharma@example.com"
            />
            <p className="text-label-sm text-on-surface-variant mt-1">
              Booking receipt, tax invoice &amp; WhatsApp voucher sent here
            </p>
          </div>
          <div>
            <label className="text-label-sm text-secondary uppercase font-bold">Mobile Number *</label>
            <div className="flex gap-space-xs mt-1">
              <span className="px-space-sm py-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40 text-label-md">
                +91
              </span>
              <input
                required
                value={guest.phone}
                onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                className="flex-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40"
                placeholder="98160 44219"
              />
            </div>
          </div>
          <div>
            <label className="text-label-sm text-secondary uppercase font-bold">Special Requests (optional)</label>
            <textarea
              value={guest.specialRequests}
              onChange={(e) => setGuest({ ...guest, specialRequests: e.target.value })}
              rows={2}
              className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40"
              placeholder="e.g. Quiet corner room, arrival by 2:00 PM, extra feather pillows"
            />
          </div>
          <button type="submit" className="mt-space-sm py-space-sm rounded-full bg-primary text-surface font-label-lg font-bold">
            Continue to Payment &amp; Fare Summary
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleProceedToPay} className="flex flex-col gap-space-md">
          {/* Simple Fare Breakdown */}
          {quoteError && <p className="text-body-sm text-error">{quoteError}</p>}
          {quote && (
            <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs border border-outline-variant/30">
              <h4 className="text-label-md font-bold text-primary flex items-center gap-1 border-b border-outline-variant/30 pb-2">
                <Icon name="receipt_long" className="text-[18px]" /> Fare Summary
              </h4>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">
                  {room.name} ({quote.nights} night{quote.nights > 1 ? 's' : ''} × ₹{room.basePrice.toLocaleString('en-IN')})
                </span>
                <span className="text-on-surface font-semibold">₹{quote.roomSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Himachal Hospitality GST ({quote.taxPercent}%)</span>
                <span className="text-on-surface font-semibold">₹{quote.taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center pt-space-xs border-t border-outline-variant/40 mt-1">
                <span className="font-display text-headline-sm text-primary font-bold">Total Net Payable</span>
                <span className="font-display text-headline-sm text-terracotta font-bold">
                  ₹{quote.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          <h3 className="font-display text-headline-sm text-primary flex items-center gap-space-xs">
            <Icon name="qr_code_scanner" /> Payment Selection
          </h3>

          {/* Option 1: Owner UPI QR Code Scan & Pay */}
          <div
            className={`p-space-md rounded-2xl border-2 flex flex-col gap-space-sm cursor-pointer transition-all ${
              paymentMethod === 'upi_qr'
                ? 'border-primary bg-surface-container-lowest shadow-md'
                : 'border-outline-variant/40 bg-surface-container-low'
            }`}
            onClick={() => setPaymentMethod('upi_qr')}
          >
            <div className="flex items-start gap-space-sm">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'upi_qr'}
                onChange={() => setPaymentMethod('upi_qr')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-label-md font-bold text-primary">Owner UPI QR Scanner (Scan &amp; Pay)</p>
                  <span className="px-space-xs py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-label-sm font-bold">
                    Instant Zero-Fee Transfer
                  </span>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Scan owner UPI QR via GPay, PhonePe, Paytm, or BHIM. Enter your 12-digit UTR/Ref number below.
                </p>
              </div>
            </div>

            {/* UPI QR Display & Ref Form */}
            {paymentMethod === 'upi_qr' && (
              <div className="flex flex-col gap-space-md pt-space-xs border-t border-outline-variant/30 mt-space-2xs animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col sm:flex-row items-center gap-space-md p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/30">
                  {/* QR Image */}
                  <div className="w-44 h-44 rounded-2xl overflow-hidden bg-white p-2 border border-outline-variant/40 shadow-inner flex items-center justify-center flex-shrink-0">
                    <img
                      src={
                        settings?.upiQrImage ? getImageUrl(settings.upiQrImage) :
                        `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                          `upi://pay?pa=${settings?.upiId || '9418703201@upi'}&pn=SudhaHotel&am=${quote?.totalAmount || 0}&cu=INR`
                        )}`
                      }
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                          `upi://pay?pa=${settings?.upiId || '9418703201@upi'}&pn=SudhaHotel&am=${quote?.totalAmount || 0}&cu=INR`
                        )}`;
                      }}
                      alt="Sudha Hotel Owner UPI QR Scanner"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex flex-col gap-space-2xs flex-1 text-center sm:text-left">
                    <span className="text-label-sm text-secondary font-bold uppercase">Hotel Owner UPI ID</span>
                    <div className="flex items-center justify-center sm:justify-start gap-space-xs">
                      <code className="text-headline-sm font-bold text-primary font-mono bg-surface-container-high px-space-xs py-1 rounded-lg">
                        {settings?.upiId || '9418703201@upi'}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(settings?.upiId || '9418703201@upi');
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2000);
                        }}
                        className="px-space-xs py-1 rounded-md bg-primary text-white text-label-sm font-bold"
                      >
                        {copiedUpi ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <span className="text-body-sm text-on-surface-variant font-medium mt-1">
                      Payable Net Amount: <strong className="text-terracotta font-bold text-headline-sm">₹{quote?.totalAmount?.toLocaleString('en-IN')}</strong>
                    </span>
                  </div>
                </div>

                {/* UTR / Transaction Ref Input */}
                <div>
                  <label className="text-label-sm text-secondary uppercase font-bold">
                    UPI 12-Digit UTR / Transaction Reference Number *
                  </label>
                  <input
                    required
                    type="text"
                    value={upiTransactionRef}
                    onChange={(e) => setUpiTransactionRef(e.target.value)}
                    placeholder="e.g. 426810XXXXXX (found in GPay/PhonePe receipt)"
                    className="w-full mt-1 p-space-sm rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-mono text-label-md font-bold focus:outline-none"
                  />
                  <p className="text-label-sm text-on-surface-variant mt-1">
                    Enter the 12-digit UPI Ref/UTR number shown in your payment app receipt.
                  </p>
                </div>

                {/* Optional Payment Screenshot Upload */}
                <ImageUploader
                  label="Upload Payment Screenshot (Optional Verification Proof)"
                  value={paymentProofImage}
                  onChange={setPaymentProofImage}
                  multiple={false}
                />
              </div>
            )}
          </div>

          {/* Option 2: Pay at Hotel */}
          <div
            className={`p-space-md rounded-2xl border-2 flex items-start gap-space-sm cursor-pointer transition-all ${
              paymentMethod === 'pay_at_hotel'
                ? 'border-primary bg-surface-container-lowest shadow-md'
                : 'border-outline-variant/40 bg-surface-container-low'
            }`}
            onClick={() => setPaymentMethod('pay_at_hotel')}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === 'pay_at_hotel'}
              onChange={() => setPaymentMethod('pay_at_hotel')}
              className="mt-1"
            />
            <div>
              <p className="text-label-md font-bold text-primary">Pay at Hotel Desk on Arrival</p>
              <p className="text-body-sm text-on-surface-variant">
                Settle directly at front desk in Amb during check-in via cash, card, or UPI.
              </p>
            </div>
          </div>

          {submitError && <p className="text-body-sm text-error font-bold">{submitError}</p>}

          <button
            type="submit"
            disabled={submitting || !quote}
            className="mt-space-sm py-space-md rounded-full bg-terracotta hover:bg-terracotta/90 text-white font-label-lg font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            <Icon name="check_circle" className="text-[20px]" />
            {submitting ? 'Submitting Request...' : `Submit Booking Request · ₹${quote?.totalAmount?.toLocaleString('en-IN') || ''}`}
          </button>
        </form>
      )}
    </main>
  );
}
