import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { useSearch } from '../context/SearchContext';

export default function RoomCard({ room, onDetails }) {
  const navigate = useNavigate();
  const { checkIn, checkOut, adults, roomsCount } = useSearch();
  const [favorite, setFavorite] = useState(false);
  const soldOut = room.availableUnits === 0;

  function handleBook() {
    const params = new URLSearchParams({
      roomId: room._id,
      checkIn,
      checkOut,
      adults: String(adults),
      rooms: String(roomsCount),
    });
    navigate(`/checkout?${params.toString()}`);
  }

  const imageCount = room.images?.length || 1;

  return (
    <div className="rounded-3xl overflow-hidden bg-surface-container-lowest shadow-xl border border-outline-variant/30 flex flex-col group transition-all duration-300 hover:shadow-2xl">
      {/* Room Image Container */}
      <div className="relative h-64 sm:h-72 overflow-hidden">
        <img
          src={room.images?.[0]}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Top Left Badges */}
        <div className="absolute top-space-sm left-space-sm flex flex-col gap-1 items-start z-10">
          {room.badge && (
            <span className="px-space-xs py-1 rounded-full bg-primary text-surface text-label-sm font-extrabold uppercase tracking-wider shadow-md">
              {room.badge}
            </span>
          )}
          <span className="px-space-xs py-0.5 rounded-full bg-surface/90 backdrop-blur-md text-primary text-label-sm font-semibold shadow-sm">
            Sample Room Category · Configurable in Admin
          </span>
        </div>

        {/* Top Right Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setFavorite(!favorite);
          }}
          className="absolute top-space-sm right-space-sm w-10 h-10 rounded-full bg-surface/80 backdrop-blur-md text-primary hover:bg-surface flex items-center justify-center shadow-md z-10 active:scale-90 transition-all"
        >
          <Icon name={favorite ? 'favorite' : 'favorite_border'} filled={favorite} className={`text-[20px] ${favorite ? 'text-terracotta' : 'text-primary'}`} />
        </button>

        {/* Bottom Right Photo Counter */}
        <span className="absolute bottom-space-sm right-space-sm px-space-xs py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-label-sm font-semibold">
          1 / {imageCount} Photos
        </span>
      </div>

      {/* Room Details Content */}
      <div className="p-space-md sm:p-space-lg flex flex-col gap-space-sm flex-1 justify-between">
        <div>
          <h3 className="font-display text-headline-sm text-primary font-bold tracking-tight">{room.name}</h3>
          <p className="text-body-sm text-on-surface-variant font-medium flex items-center gap-1 mt-1">
            <Icon name="bed" className="text-[16px] text-terracotta" /> {room.tagline || `${room.bedType} · Ensuite Bath`}
          </p>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-3 gap-space-xs">
          <div className="flex flex-col items-center text-center p-space-xs rounded-xl bg-surface-container-low border border-outline-variant/20">
            <Icon name="square_foot" className="text-primary text-[18px]" />
            <span className="text-label-md font-bold text-primary">{room.sizeSqft} sq.ft</span>
            <span className="text-label-sm text-on-surface-variant">Size</span>
          </div>

          <div className="flex flex-col items-center text-center p-space-xs rounded-xl bg-surface-container-low border border-outline-variant/20">
            <Icon name="king_bed" className="text-primary text-[18px]" />
            <span className="text-label-md font-bold text-primary truncate w-full">{room.bedType?.split('·')[0] || 'King Bed'}</span>
            <span className="text-label-sm text-on-surface-variant">Bed</span>
          </div>

          <div className="flex flex-col items-center text-center p-space-xs rounded-xl bg-surface-container-low border border-outline-variant/20">
            <Icon name="groups" className="text-primary text-[18px]" />
            <span className="text-label-md font-bold text-primary">
              {room.maxAdults} Ad{room.maxChildren ? `, ${room.maxChildren} Ch` : ''}
            </span>
            <span className="text-label-sm text-on-surface-variant">Max {room.maxAdults + room.maxChildren} Guests</span>
          </div>
        </div>

        {/* Amenities Chips */}
        <div className="flex flex-wrap gap-space-2xs">
          {room.amenities?.slice(0, 4).map((a) => (
            <span key={a} className="px-space-xs py-1 rounded-full bg-secondary-container/60 text-on-secondary-container text-label-sm font-semibold">
              {a}
            </span>
          ))}
        </div>

        {/* Availability Inventory Tag */}
        {room.availableUnits !== undefined && (
          <div className="flex items-center justify-between text-label-sm border-t border-outline-variant/20 pt-space-xs">
            <span className={`font-semibold ${soldOut ? 'text-error' : 'text-secondary'}`}>
              {soldOut ? 'Currently Sold Out' : `Live Inventory: ${room.availableUnits} Room${room.availableUnits > 1 ? 's' : ''} Available`}
            </span>
            <span className="text-on-surface-variant">Instant Online Confirmation</span>
          </div>
        )}

        {/* Price & Book Row */}
        <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant/30 mt-space-2xs">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-headline-md text-terracotta font-bold">₹{room.basePrice.toLocaleString('en-IN')}</span>
              <span className="text-body-sm text-on-surface-variant font-normal"> / night</span>
            </div>
            <p className="text-label-sm text-on-surface-variant">+ {room.taxPercent || 12}% taxes &amp; fees</p>
          </div>

          <div className="flex items-center gap-space-xs">
            <button
              onClick={() => onDetails(room)}
              className="py-space-xs px-space-md rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md font-bold transition-colors"
            >
              Details
            </button>
            <button
              onClick={handleBook}
              disabled={soldOut}
              className="py-space-xs px-space-lg rounded-full bg-terracotta hover:bg-terracotta/90 text-white font-label-md font-bold tracking-wide shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              BOOK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
