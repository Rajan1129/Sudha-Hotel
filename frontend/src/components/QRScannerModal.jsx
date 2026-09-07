import { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import Modal from './Modal';

export default function QRScannerModal({ open, onClose, bookings, onUpdateStatus, onViewReceipt }) {
  const [inputCode, setInputCode] = useState('');
  const [matchedBooking, setMatchedBooking] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setInputCode('');
      setMatchedBooking(null);
      setCameraError('');
    }
  }, [open]);

  // Match booking from search/scanner input
  useEffect(() => {
    if (!inputCode.trim()) {
      setMatchedBooking(null);
      return;
    }
    const clean = inputCode.trim().toLowerCase();
    // Match code like #SH-9609, SH-9609, 9609 or URL containing verify=SH-9609
    const match = bookings.find((b) => {
      const bCode = b.bookingCode?.toLowerCase() || '';
      return (
        clean.includes(bCode) ||
        bCode.includes(clean.replace('#', '')) ||
        b.guestName?.toLowerCase().includes(clean) ||
        b.phone?.includes(clean)
      );
    });
    setMatchedBooking(match || null);
  }, [inputCode, bookings]);

  async function startCamera() {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError('Camera access unavailable or permission denied. Please enter the booking code manually.');
      setCameraActive(false);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }

  return (
    <Modal open={open} onClose={onClose} title="Front Desk QR Scanner & Verification">
      <div className="flex flex-col gap-space-md max-w-lg mx-auto">
        {/* Header Description */}
        <div className="flex items-center justify-between p-space-xs rounded-xl bg-surface-container-low border border-outline-variant/30 text-label-sm text-on-surface-variant">
          <span className="flex items-center gap-1 font-semibold text-primary">
            <Icon name="qr_code_scanner" className="text-secondary text-[20px]" /> Scan or Search Guest Voucher
          </span>
          <span className="text-secondary font-bold">Live Desk Verification</span>
        </div>

        {/* Input & Search Bar */}
        <div className="relative w-full">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" />
          <input
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter or scan booking code (e.g. #SH-9609 or guest name)..."
            className="w-full pl-10 pr-10 py-space-sm rounded-xl bg-surface-container-low border border-outline-variant/40 text-label-md font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
          {inputCode && (
            <button
              onClick={() => setInputCode('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          )}
        </div>

        {/* Camera Feed Toggle & Frame */}
        {!cameraActive ? (
          <button
            onClick={startCamera}
            className="w-full py-space-sm px-space-md rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-dashed border-outline-variant/60 text-primary font-label-md font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Icon name="videocam" className="text-[20px] text-terracotta" /> Open Live Camera Scanner
          </button>
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-primary shadow-inner flex flex-col items-center justify-center min-h-[220px]">
            <video ref={videoRef} className="w-full h-56 object-cover" playsInline muted />
            <div className="absolute inset-0 border-2 border-secondary/60 rounded-xl m-8 pointer-events-none animate-pulse flex items-center justify-center">
              <span className="text-label-sm font-bold bg-black/60 text-white px-3 py-1 rounded-full backdrop-blur-md">
                Align QR Code in Frame
              </span>
            </div>
            <button
              onClick={stopCamera}
              className="absolute top-2 right-2 px-3 py-1 rounded-full bg-error text-white text-label-sm font-bold shadow-md"
            >
              Stop Camera
            </button>
          </div>
        )}

        {cameraError && <p className="text-label-sm text-terracotta text-center font-medium">{cameraError}</p>}

        {/* Matched Booking Verification Card */}
        {matchedBooking ? (
          <div className="p-space-md rounded-2xl bg-surface-container-lowest border-2 border-secondary/40 shadow-lg flex flex-col gap-space-sm animate-fade-in">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <div>
                <span className="text-label-sm text-secondary uppercase font-bold tracking-wider">Voucher Verified</span>
                <h3 className="font-display text-headline-sm text-primary font-bold">{matchedBooking.guestName}</h3>
                <p className="text-label-sm text-on-surface-variant font-mono font-bold">#{matchedBooking.bookingCode}</p>
              </div>
              <span
                className={`px-space-xs py-1 rounded-full text-label-sm font-bold uppercase ${
                  matchedBooking.bookingStatus === 'checked_in'
                    ? 'bg-primary text-surface'
                    : matchedBooking.bookingStatus === 'checked_out'
                    ? 'bg-surface-container-high text-on-surface-variant'
                    : 'bg-secondary-container text-on-secondary-container'
                }`}
              >
                {matchedBooking.bookingStatus.replace('_', ' ')}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-space-xs text-body-sm">
              <div>
                <span className="text-label-sm text-on-surface-variant font-semibold">Room:</span>
                <p className="font-bold text-primary">{matchedBooking.room?.name || matchedBooking.roomSnapshot?.name || 'Deluxe Room'}</p>
              </div>
              <div>
                <span className="text-label-sm text-on-surface-variant font-semibold">Total Fare:</span>
                <p className="font-bold text-terracotta">₹{matchedBooking.totalAmount?.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-label-sm text-on-surface-variant font-semibold">Check-In:</span>
                <p className="font-semibold text-primary">{new Date(matchedBooking.checkIn).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <span className="text-label-sm text-on-surface-variant font-semibold">Check-Out:</span>
                <p className="font-semibold text-primary">{new Date(matchedBooking.checkOut).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <span className="text-label-sm text-on-surface-variant font-semibold">Payment Mode:</span>
                <p className="font-bold text-primary capitalize">{matchedBooking.paymentMethod?.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-label-sm text-on-surface-variant font-semibold">Payment Status:</span>
                <p className={`font-bold ${matchedBooking.paymentStatus === 'paid' ? 'text-secondary' : 'text-terracotta'}`}>
                  {matchedBooking.paymentStatus === 'paid' ? 'Verified / Paid' : 'Pay at Hotel (Pending)'}
                </p>
              </div>
            </div>

            {/* Contextual Action Buttons */}
            <div className="flex flex-wrap items-center gap-space-xs pt-space-xs border-t border-outline-variant/20">
              {onViewReceipt && (
                <button
                  onClick={() => {
                    onViewReceipt(matchedBooking);
                    onClose();
                  }}
                  className="px-space-sm py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary text-label-sm font-bold flex items-center gap-1"
                >
                  <Icon name="receipt_long" className="text-[16px]" /> Voucher
                </button>
              )}

              {/* Dynamic Check-in / Check-out button */}
              {matchedBooking.bookingStatus !== 'checked_in' && matchedBooking.bookingStatus !== 'checked_out' && matchedBooking.bookingStatus !== 'cancelled' && (
                <button
                  onClick={async () => {
                    await onUpdateStatus(matchedBooking._id, { bookingStatus: 'checked_in' });
                  }}
                  className="flex-1 py-1.5 rounded-full bg-terracotta hover:bg-terracotta/90 text-white text-label-sm font-bold shadow-md active:scale-95 transition-all"
                >
                  Confirm Check-In
                </button>
              )}

              {matchedBooking.bookingStatus === 'checked_in' && (
                <button
                  onClick={async () => {
                    await onUpdateStatus(matchedBooking._id, { bookingStatus: 'checked_out' });
                  }}
                  className="flex-1 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-surface text-label-sm font-bold shadow-md active:scale-95 transition-all"
                >
                  Process Check-Out
                </button>
              )}

              {matchedBooking.paymentStatus !== 'paid' && (
                <button
                  onClick={async () => {
                    await onUpdateStatus(matchedBooking._id, { paymentStatus: 'paid' });
                  }}
                  className="py-1.5 px-space-sm rounded-full bg-secondary hover:bg-secondary/90 text-white text-label-sm font-bold shadow-md active:scale-95 transition-all"
                >
                  Confirm Payment Received
                </button>
              )}
            </div>
          </div>
        ) : inputCode.trim() ? (
          <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 text-center">
            <p className="text-label-md font-bold text-primary">No booking found matching &quot;{inputCode}&quot;.</p>
            <p className="text-label-sm text-on-surface-variant mt-1">Please verify the code or search by guest phone number.</p>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
