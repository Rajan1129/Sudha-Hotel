const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Inquiry = require('../models/Inquiry');

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

async function getSummary(req, res) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const activeStatuses = ['pending', 'confirmed', 'checked_in'];

  const [rooms, arrivalsToday, departuresToday, occupiedNow, monthBookingsPaid, lastMonthBookingsPaid, pendingBookings, unreadInquiries, activeQueue] =
    await Promise.all([
      Room.find({ status: { $ne: 'inactive' } }),
      Booking.find({ checkIn: { $gte: todayStart, $lte: todayEnd }, bookingStatus: { $in: activeStatuses } }),
      Booking.find({ checkOut: { $gte: todayStart, $lte: todayEnd }, bookingStatus: { $in: activeStatuses } }),
      Booking.find({
        bookingStatus: { $in: activeStatuses },
        checkIn: { $lte: todayEnd },
        checkOut: { $gt: todayStart },
      }),
      Booking.find({ paymentStatus: 'paid', createdAt: { $gte: monthStart } }),
      Booking.find({ paymentStatus: 'paid', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
      Booking.countDocuments({ bookingStatus: 'pending' }),
      Inquiry.countDocuments({ status: 'unread' }),
      Booking.find({ bookingStatus: { $in: activeStatuses } })
        .populate('room', 'name category')
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

  const totalUnits = rooms.reduce((sum, r) => sum + r.totalUnits, 0);
  const occupiedUnits = occupiedNow.reduce((sum, b) => sum + b.roomsBooked, 0);
  const occupancyPct = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const monthlyRevenue = monthBookingsPaid.reduce((sum, b) => sum + b.totalAmount, 0);
  const lastMonthRevenue = lastMonthBookingsPaid.reduce((sum, b) => sum + b.totalAmount, 0);
  const revenueGrowthPct =
    lastMonthRevenue > 0 ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : null;

  const totalBookings = await Booking.countDocuments({ bookingStatus: { $in: activeStatuses } });

  res.json({
    bookings: totalBookings,
    revenue: { monthly: monthlyRevenue, growthPct: revenueGrowthPct },
    occupancy: { percent: occupancyPct, occupiedUnits, totalUnits },
    movesToday: { in: arrivalsToday.length, out: departuresToday.length },
    pendingBookings,
    unreadInquiries,
    activeQueue,
  });
}

module.exports = { getSummary };
