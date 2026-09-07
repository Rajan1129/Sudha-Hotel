import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import RoomCard from '../components/RoomCard';
import Modal from '../components/Modal';
import { useSearch } from '../context/SearchContext';
import { fetchRooms } from '../api/rooms';

export default function Rooms() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkIn, setCheckIn, checkOut, setCheckOut, adults, setAdults, roomsCount, setRoomsCount } = useSearch();
  
  const [rooms, setRooms] = useState([]);
  const [categoryCount, setCategoryCount] = useState(0);
  const [sort, setSort] = useState('price_asc');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [amenityFilter, setAmenityFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailsRoom, setDetailsRoom] = useState(null);
  const [changeSearchOpen, setChangeSearchOpen] = useState(false);

  useEffect(() => {
    const ci = searchParams.get('checkIn') || checkIn;
    const co = searchParams.get('checkOut') || checkOut;
    if (ci && ci !== checkIn) setCheckIn(ci);
    if (co && co !== checkOut) setCheckOut(co);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchRooms({ checkIn, checkOut, adults, sort })
      .then((data) => {
        setRooms(data.rooms || []);
        setCategoryCount(data.categoryCount || 0);
      })
      .catch((err) => setError(err?.response?.data?.message || 'Could not load rooms right now.'))
      .finally(() => setLoading(false));
  }, [checkIn, checkOut, adults, sort]);

  const nights =
    checkIn && checkOut ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))) : 1;

  const categories = ['All', ...new Set(rooms.map((r) => r.category))];
  const allAmenities = ['All', ...new Set(rooms.flatMap((r) => r.amenities || []))];

  const visibleRooms = rooms.filter((r) => {
    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
    const matchesAmenity = amenityFilter === 'All' || r.amenities?.includes(amenityFilter);
    return matchesCategory && matchesAmenity;
  });

  const dateLabel =
    checkIn && checkOut
      ? `${new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(
          checkOut
        ).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : 'Oct 14 - Oct 16, 2025';

  return (
    <main className="flex flex-col w-full pt-20 pb-40 px-gutter-mobile bg-surface max-w-container-max mx-auto space-y-space-md">
      {/* 1. Date & Guest Summary Bar */}
      <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-md border border-outline-variant/30 flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Icon name="calendar_today" className="text-[20px]" />
          </div>
          <div>
            <p className="text-label-md font-bold text-primary">{dateLabel}</p>
            <p className="text-label-sm text-on-surface-variant">
              {nights} Night{nights !== 1 ? 's' : ''} · {adults} Adult{adults > 1 ? 's' : ''}, {roomsCount} Room
              {roomsCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => setChangeSearchOpen(true)}
          className="px-space-md py-space-xs rounded-full bg-terracotta/10 text-terracotta hover:bg-terracotta/20 text-label-md font-bold flex items-center gap-1.5 transition-colors"
        >
          CHANGE <Icon name="tune" className="text-[16px]" />
        </button>
      </div>

      {/* 2. Category & Amenity Filter Pills */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-xs overflow-x-auto pb-space-2xs">
          <span className="text-label-sm text-secondary font-bold uppercase tracking-wider self-center pr-1">Category:</span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`whitespace-nowrap px-space-md py-space-xs rounded-full text-label-md font-bold transition-all ${
                categoryFilter === c
                  ? 'bg-primary text-surface shadow-md'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {c === 'All' ? 'All Categories' : c}
            </button>
          ))}
        </div>

        {allAmenities.length > 1 && (
          <div className="flex items-center gap-space-xs overflow-x-auto pb-space-2xs">
            <span className="text-label-sm text-secondary font-bold uppercase tracking-wider self-center pr-1">Amenity:</span>
            {allAmenities.map((a) => (
              <button
                key={a}
                onClick={() => setAmenityFilter(a)}
                className={`whitespace-nowrap px-space-sm py-1 rounded-full text-label-sm font-semibold transition-all ${
                  amenityFilter === a
                    ? 'bg-secondary text-white shadow-sm'
                    : 'bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {a === 'All' ? 'All Amenities' : a}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between py-space-xs">
        <span className="text-label-md text-on-surface-variant font-semibold">
          ● {categoryCount} Room Categories Available
        </span>
        <div className="flex items-center gap-1 text-label-md font-bold text-primary">
          <span>Sort:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent text-primary font-bold focus:outline-none cursor-pointer"
          >
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="capacity">Capacity: Highest</option>
          </select>
        </div>
      </div>

      {/* 3. Live Availability Search Connected Banner */}
      <div className="flex items-start gap-space-sm p-space-md rounded-2xl bg-secondary-container/50 text-on-secondary-container border border-secondary-container shadow-sm">
        <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon name="check" className="text-[18px]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-label-md font-bold text-primary">Live Availability Search</span>
            <span className="px-space-xs py-0.5 rounded-full bg-surface/80 text-primary text-label-sm font-semibold">
              Connected to Booking Database
            </span>
          </div>
          <span className="text-label-sm text-on-secondary-container/90 mt-0.5">
            Real-time verification on dates · Instant hold on selected room
          </span>
        </div>
      </div>

      {error && <p className="text-body-md text-error">{error}</p>}
      {loading && <p className="text-body-md text-on-surface-variant">Checking live availability...</p>}

      {/* 4. Room Cards List */}
      <div className="flex flex-col gap-space-lg pt-space-xs">
        {visibleRooms.map((room) => (
          <RoomCard key={room._id} room={room} onDetails={setDetailsRoom} />
        ))}
        {!loading && visibleRooms.length === 0 && !error && (
          <p className="text-body-md text-on-surface-variant text-center py-space-xl">
            No rooms match this filter for the selected dates.
          </p>
        )}
      </div>

      {/* 5. Group Travel Inquiries Card */}
      <div className="p-space-md rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-space-xs mt-space-lg">
        <p className="text-body-md text-primary font-bold">Traveling with a larger family group?</p>
        <p className="text-body-sm text-on-surface-variant">
          Sudha Hotel accommodates family events, wedding guests, and pilgrimages to Chintpurni Shrine with contiguous floor bookings.
        </p>
        <a href="/#location-section" className="text-label-md text-terracotta font-bold underline hover:opacity-90">
          Inquire Multi-Room Block →
        </a>
      </div>

      {/* Change Dates / Search Modal */}
      <Modal open={changeSearchOpen} onClose={() => setChangeSearchOpen(false)} title="Update Search Dates & Guests">
        <div className="flex flex-col gap-space-md">
          <div className="grid grid-cols-2 gap-space-xs">
            <div className="flex flex-col gap-1 p-space-sm rounded-xl bg-surface-container-low">
              <label className="text-label-sm text-secondary uppercase font-bold">Check-in</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-transparent text-label-md font-bold focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1 p-space-sm rounded-xl bg-surface-container-low">
              <label className="text-label-sm text-secondary uppercase font-bold">Check-out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-transparent text-label-md font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-space-xs">
            <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low">
              <div>
                <span className="text-label-sm text-secondary uppercase font-bold">Guests</span>
                <p className="text-label-md font-bold">{adults} Adults</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-7 h-7 rounded-full bg-surface-container-highest font-bold">-</button>
                <button onClick={() => setAdults(adults + 1)} className="w-7 h-7 rounded-full bg-primary text-white font-bold">+</button>
              </div>
            </div>

            <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low">
              <div>
                <span className="text-label-sm text-secondary uppercase font-bold">Rooms</span>
                <p className="text-label-md font-bold">{roomsCount} Room</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setRoomsCount(Math.max(1, roomsCount - 1))} className="w-7 h-7 rounded-full bg-surface-container-highest font-bold">-</button>
                <button onClick={() => setRoomsCount(roomsCount + 1)} className="w-7 h-7 rounded-full bg-primary text-white font-bold">+</button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setChangeSearchOpen(false)}
            className="py-space-md rounded-full bg-terracotta text-white font-label-lg font-bold shadow-md"
          >
            Apply &amp; Search Available Rooms
          </button>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal open={!!detailsRoom} onClose={() => setDetailsRoom(null)} title={detailsRoom?.name || ''}>
        {detailsRoom && (
          <div className="flex flex-col gap-space-sm">
            <img src={detailsRoom.images?.[0]} alt={detailsRoom.name} className="w-full h-52 object-cover rounded-xl" />
            <p className="text-body-md text-on-surface-variant leading-relaxed">{detailsRoom.description}</p>
            <div className="grid grid-cols-2 gap-space-xs py-space-2xs">
              <p className="text-label-md text-on-surface-variant">
                <strong className="text-primary">Size:</strong> {detailsRoom.sizeSqft} sq.ft
              </p>
              <p className="text-label-md text-on-surface-variant">
                <strong className="text-primary">Bed:</strong> {detailsRoom.bedType}
              </p>
              <p className="text-label-md text-on-surface-variant">
                <strong className="text-primary">Occupancy:</strong> {detailsRoom.maxAdults} Adults,{' '}
                {detailsRoom.maxChildren} Children
              </p>
              <p className="text-label-md text-on-surface-variant">
                <strong className="text-primary">Cancellation:</strong>{' '}
                {detailsRoom.freeCancellation ? 'Free' : 'Non-refundable'}
              </p>
            </div>
            <div className="flex flex-wrap gap-space-2xs">
              {detailsRoom.amenities?.map((a) => (
                <span key={a} className="text-label-sm px-space-xs py-1 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
