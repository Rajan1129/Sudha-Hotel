const Booking = require('../models/Booking');

const ACTIVE_STATUSES = ['pending', 'confirmed', 'checked_in'];

/**
 * Returns the number of units of `roomId` already booked for any night
 * that overlaps [checkIn, checkOut). Two ranges overlap when
 * existing.checkIn < requested.checkOut AND existing.checkOut > requested.checkIn.
 */
async function unitsBookedInRange(roomId, checkIn, checkOut, excludeBookingId = null) {
  const query = {
    room: roomId,
    bookingStatus: { $in: ACTIVE_STATUSES },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  };
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  const overlapping = await Booking.find(query).select('roomsBooked');
  return overlapping.reduce((sum, b) => sum + b.roomsBooked, 0);
}

async function availableUnits(room, checkIn, checkOut, excludeBookingId = null) {
  if (!checkIn || !checkOut) return room.totalUnits;
  const booked = await unitsBookedInRange(room._id, checkIn, checkOut, excludeBookingId);
  return Math.max(room.totalUnits - booked, 0);
}

module.exports = { unitsBookedInRange, availableUnits };
