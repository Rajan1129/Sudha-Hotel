const Room = require('../models/Room');
const { availableUnits } = require('../utils/availability');
const { nightsBetween } = require('../utils/pricing');

// GET /api/rooms?checkIn=&checkOut=&adults=&sort=
async function listRooms(req, res) {
  const { checkIn, checkOut, adults, sort } = req.query;
  const query = { status: 'active' };
  const rooms = await Room.find(query).sort({ sortOrder: 1, createdAt: 1 });

  let nights = null;
  if (checkIn && checkOut) {
    nights = nightsBetween(checkIn, checkOut);
    if (!Number.isFinite(nights) || nights < 1) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date.' });
    }
  }

  const enriched = await Promise.all(
    rooms.map(async (room) => {
      const available = checkIn && checkOut ? await availableUnits(room, checkIn, checkOut) : room.totalUnits;
      return {
        ...room.toObject(),
        availableUnits: available,
        nights,
        totalForStay: nights ? room.basePrice * nights : null,
      };
    })
  );

  let filtered = enriched;
  if (adults) {
    const reqAdults = Number(adults);
    filtered = filtered.filter((r) => r.maxAdults >= reqAdults);
  }
  if (checkIn && checkOut) {
    // still show sold-out rooms but flagged, matching "Live Availability Engine" UX
  }

  if (sort === 'price_asc') filtered.sort((a, b) => a.basePrice - b.basePrice);
  else if (sort === 'price_desc') filtered.sort((a, b) => b.basePrice - a.basePrice);
  else if (sort === 'capacity') filtered.sort((a, b) => b.maxAdults + b.maxChildren - (a.maxAdults + a.maxChildren));

  res.json({ rooms: filtered, categoryCount: new Set(rooms.map((r) => r.category)).size });
}

// GET /api/rooms/:id?checkIn=&checkOut=
async function getRoom(req, res) {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ message: 'Room not found.' });
  const { checkIn, checkOut } = req.query;
  const available = checkIn && checkOut ? await availableUnits(room, checkIn, checkOut) : room.totalUnits;
  res.json({ room: { ...room.toObject(), availableUnits: available } });
}

// POST /api/rooms (admin)
async function createRoom(req, res) {
  const room = await Room.create(req.body);
  res.status(201).json({ room });
}

// PUT /api/rooms/:id (admin)
async function updateRoom(req, res) {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!room) return res.status(404).json({ message: 'Room not found.' });
  res.json({ room });
}

// DELETE /api/rooms/:id (admin)
async function deleteRoom(req, res) {
  const room = await Room.findByIdAndDelete(req.params.id);
  if (!room) return res.status(404).json({ message: 'Room not found.' });
  res.json({ message: 'Room deleted.' });
}

module.exports = { listRooms, getRoom, createRoom, updateRoom, deleteRoom };
