const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { availableUnits } = require('../utils/availability');
const { nightsBetween, computeBookingPrice } = require('../utils/pricing');

function generateBookingCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `SH-${num}`;
}

async function validateAndPrice({ roomId, checkIn, checkOut, roomsBooked = 1, adults = 1, excludeBookingId }) {
  const room = await Room.findById(roomId);
  if (!room) {
    const err = new Error('Selected room could not be found.');
    err.statusCode = 404;
    throw err;
  }
  if (room.status !== 'active') {
    const err = new Error('This room is not currently available for booking.');
    err.statusCode = 400;
    throw err;
  }
  const nights = nightsBetween(checkIn, checkOut);
  if (!Number.isFinite(nights) || nights < 1) {
    const err = new Error('Check-out date must be after check-in date.');
    err.statusCode = 400;
    throw err;
  }
  const available = await availableUnits(room, checkIn, checkOut, excludeBookingId);
  if (available < roomsBooked) {
    const err = new Error(
      available === 0
        ? 'No units of this room are left for the selected dates.'
        : `Only ${available} unit(s) of this room are left for the selected dates.`
    );
    err.statusCode = 409;
    throw err;
  }
  const price = computeBookingPrice({
    basePrice: room.basePrice,
    taxPercent: room.taxPercent,
    nights,
    roomsBooked,
  });
  return { room, nights, available, price };
}

// POST /api/bookings/quote - public, used by checkout page to render live fare breakdown
async function quoteBooking(req, res) {
  const { roomId, checkIn, checkOut, roomsBooked, adults } = req.body;
  if (!roomId || !checkIn || !checkOut) {
    return res.status(400).json({ message: 'roomId, checkIn and checkOut are required.' });
  }
  const { room, nights, available, price } = await validateAndPrice({
    roomId,
    checkIn,
    checkOut,
    roomsBooked: roomsBooked || 1,
    adults: adults || 1,
  });
  res.json({
    room: { id: room._id, name: room.name, category: room.category, basePrice: room.basePrice },
    nights,
    availableUnits: available,
    ...price,
  });
}

// POST /api/bookings - public, creates a booking (pending until payment confirms)
async function createBooking(req, res) {
  const {
    roomId,
    checkIn,
    checkOut,
    roomsBooked,
    adults,
    children,
    guestName,
    email,
    phone,
    countryCode,
    specialRequests,
    paymentMethod,
    upiTransactionRef,
    paymentProofImage,
  } = req.body;

  if (!roomId || !checkIn || !checkOut || !guestName || !email || !phone || !paymentMethod) {
    return res.status(400).json({ message: 'Missing required booking details.' });
  }
  if (!['upi_qr', 'pay_at_hotel', 'razorpay'].includes(paymentMethod)) {
    return res.status(400).json({ message: 'Invalid payment method.' });
  }

  const { room, nights, price } = await validateAndPrice({
    roomId,
    checkIn,
    checkOut,
    roomsBooked: roomsBooked || 1,
    adults: adults || 1,
  });

  let bookingCode = generateBookingCode();
  // guarantee uniqueness in the unlikely event of a collision
  // eslint-disable-next-line no-await-in-loop
  while (await Booking.exists({ bookingCode })) {
    bookingCode = generateBookingCode();
  }

  const booking = await Booking.create({
    bookingCode,
    room: room._id,
    roomSnapshot: { name: room.name, category: room.category, basePrice: room.basePrice, taxPercent: room.taxPercent },
    checkIn,
    checkOut,
    nights,
    roomsBooked: roomsBooked || 1,
    adults: adults || 1,
    children: children || 0,
    guestName,
    email,
    phone,
    countryCode: countryCode || '+91',
    specialRequests: specialRequests || '',
    roomSubtotal: price.roomSubtotal,
    taxAmount: price.taxAmount,
    totalAmount: price.totalAmount,
    paymentMethod,
    paymentStatus: 'pending',
    bookingStatus: 'pending',
    upiTransactionRef: upiTransactionRef || '',
    paymentProofImage: paymentProofImage || '',
  });

  res.status(201).json({ booking });
}

// POST /api/bookings/:id/confirm-payment - public callback used after UPI submission or payment update
async function confirmPayment(req, res) {
  const { razorpayOrderId, razorpayPaymentId, upiTransactionRef, paymentProofImage } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  booking.paymentStatus = 'paid';
  booking.bookingStatus = 'confirmed';
  if (upiTransactionRef) booking.upiTransactionRef = upiTransactionRef;
  if (paymentProofImage) booking.paymentProofImage = paymentProofImage;
  await booking.save();
  res.json({ booking });
}

// GET /api/bookings/:id - public (used on checkout confirmation page)
async function getBooking(req, res) {
  const booking = await Booking.findById(req.params.id).populate('room');
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  res.json({ booking });
}

// GET /api/bookings - admin, list + filter
async function listBookings(req, res) {
  const { status, from, to, q } = req.query;
  const query = {};
  if (status) query.bookingStatus = status;
  if (from || to) {
    query.checkIn = {};
    if (from) query.checkIn.$gte = new Date(from);
    if (to) query.checkIn.$lte = new Date(to);
  }
  if (q) {
    query.$or = [
      { guestName: new RegExp(q, 'i') },
      { bookingCode: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { phone: new RegExp(q, 'i') },
    ];
  }
  const bookings = await Booking.find(query).populate('room', 'name category').sort({ createdAt: -1 });
  res.json({ bookings });
}

// PUT /api/bookings/:id/status - admin, e.g. check-in / check-out / cancel / mark paid
async function updateBookingStatus(req, res) {
  const { bookingStatus, paymentStatus } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });

  const willBeConfirmed =
    bookingStatus === 'confirmed' ||
    (paymentStatus === 'paid' && (bookingStatus === 'confirmed' || booking.bookingStatus === 'pending'));

  // If transitioning to confirmed status, double-check that units remain available
  if (willBeConfirmed && booking.bookingStatus !== 'confirmed' && booking.bookingStatus !== 'checked_in') {
    const room = await Room.findById(booking.room);
    if (room) {
      const available = await availableUnits(room, booking.checkIn, booking.checkOut, booking._id);
      if (available < booking.roomsBooked) {
        return res.status(409).json({
          message: `Cannot confirm booking: Room '${room.name}' has no available units remaining for dates ${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()}.`,
        });
      }
    }
  }

  if (paymentStatus) {
    booking.paymentStatus = paymentStatus;
    if (paymentStatus === 'paid' && booking.bookingStatus === 'pending') {
      booking.bookingStatus = 'confirmed';
    }
  }
  if (bookingStatus) booking.bookingStatus = bookingStatus;
  await booking.save();
  res.json({ booking });
}

// DELETE /api/bookings/:id - admin/superadmin delete booking
async function deleteBooking(req, res) {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  res.json({ message: 'Booking deleted successfully.' });
}

module.exports = {
  quoteBooking,
  createBooking,
  confirmPayment,
  getBooking,
  listBookings,
  updateBookingStatus,
  deleteBooking,
};
