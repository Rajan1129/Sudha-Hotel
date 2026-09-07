const MS_PER_DAY = 1000 * 60 * 60 * 24;

function nightsBetween(checkIn, checkOut) {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diff = Math.round((outDate.getTime() - inDate.getTime()) / MS_PER_DAY);
  return diff;
}

function computeBookingPrice({ basePrice, taxPercent = 12, nights, roomsBooked = 1 }) {
  const roomSubtotal = basePrice * nights * roomsBooked;
  const taxAmount = Math.round((roomSubtotal * taxPercent) / 100);
  const totalAmount = roomSubtotal + taxAmount;

  return {
    nights,
    roomSubtotal,
    taxAmount,
    taxPercent,
    totalAmount,
  };
}

module.exports = { nightsBetween, computeBookingPrice };
