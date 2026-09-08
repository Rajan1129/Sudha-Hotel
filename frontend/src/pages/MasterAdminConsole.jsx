import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import BookingReceipt from '../components/BookingReceipt';
import ImageUploader from '../components/ImageUploader';
import QRScannerModal from '../components/QRScannerModal';
import { fetchDashboardSummary } from '../api/dashboard';
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '../api/rooms';
import { fetchMenu, createMenuItem, updateMenuItem, deleteMenuItem } from '../api/menu';
import { fetchVenuesAdmin, createVenue, updateVenue, deleteVenue } from '../api/venues';
import { fetchBookings, updateBookingStatus, deleteBooking } from '../api/bookings';
import { fetchAllReviews, approveReview, deleteReview } from '../api/reviews';
import { fetchInquiries, resolveInquiry, deleteInquiry, clearAllInquiries } from '../api/inquiries';
import { fetchSettings, updateSettings } from '../api/settings';
import { getImageUrl } from '../api/client';

const EMPTY_ROOM = {
  name: '',
  category: '',
  tagline: '',
  badge: '',
  description: '',
  images: [''],
  sizeSqft: 0,
  bedType: '',
  maxAdults: 2,
  maxChildren: 0,
  amenities: [],
  totalUnits: 1,
  basePrice: 0,
  taxPercent: 12,
  status: 'active',
};

const EMPTY_MENU = { name: '', description: '', price: 0, category: '', emoji: '🍽️', inStock: true };
const EMPTY_VENUE = { name: '', description: '', capacity: 50, basePrice: 0, inclusions: [], image: '', status: 'active' };

function SectionHeader({ icon, title, subtitle, onAdd }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="font-display text-headline-sm text-primary flex items-center gap-2">
          <Icon name={icon} /> {title}
        </h2>
        <p className="text-body-sm text-on-surface-variant">{subtitle}</p>
      </div>
      <button onClick={onAdd} className="px-space-md py-space-xs rounded-full bg-primary text-surface text-label-md font-bold flex items-center gap-1">
        <Icon name="add" className="text-[18px]" /> Add
      </button>
    </div>
  );
}

export default function MasterAdminConsole() {
  const [summary, setSummary] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [menu, setMenu] = useState([]);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [roomModal, setRoomModal] = useState(null);
  const [menuModal, setMenuModal] = useState(null);
  const [venueModal, setVenueModal] = useState(null);
  const [receiptBooking, setReceiptBooking] = useState(null);
  const [bookingSearch, setBookingSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const [reviews, setReviews] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [settings, setSettings] = useState(null);
  const [settingsModal, setSettingsModal] = useState(null);

  const load = useCallback(() => {
    fetchDashboardSummary().then(setSummary).catch(() => {});
    fetchRooms().then((d) => setRooms(d.rooms || []));
    fetchMenu().then((d) => setMenu(d.items || []));
    fetchVenuesAdmin().then((d) => setVenues(d.venues || []));
    fetchBookings().then((d) => setBookings(d.bookings || []));
    fetchAllReviews().then((d) => setReviews(d.reviews || []));
    fetchInquiries().then((d) => setInquiries(d.inquiries || []));
    fetchSettings().then((d) => setSettings(d.settings || null));
  }, []);

  const location = useLocation();

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [location.hash]);

  function flash(msg) {
    setNotice(msg);
    setTimeout(() => setNotice(''), 2200);
  }

  const filteredBookings = bookings.filter((b) => {
    const q = bookingSearch.toLowerCase();
    return (
      !q ||
      b.guestName?.toLowerCase().includes(q) ||
      b.bookingCode?.toLowerCase().includes(q) ||
      b.phone?.includes(q)
    );
  });

  // ---- Room CRUD ----
  async function saveRoom(payload) {
    setBusy(true);
    try {
      const body = { ...payload, images: (payload.images || []).filter(Boolean) };
      if (payload._id) await updateRoom(payload._id, body);
      else await createRoom(body);
      setRoomModal(null);
      load();
      flash('Room inventory saved.');
    } finally {
      setBusy(false);
    }
  }
  async function removeRoom(id) {
    if (!confirm('Delete this room category permanently?')) return;
    await deleteRoom(id);
    load();
    flash('Room deleted.');
  }

  // ---- Menu CRUD ----
  async function saveMenuItem(payload) {
    setBusy(true);
    try {
      if (payload._id) await updateMenuItem(payload._id, payload);
      else await createMenuItem(payload);
      setMenuModal(null);
      load();
      flash('Menu item saved.');
    } finally {
      setBusy(false);
    }
  }
  async function removeMenuItem(id) {
    if (!confirm('Remove this dish from the menu?')) return;
    await deleteMenuItem(id);
    load();
    flash('Menu item removed.');
  }

  // ---- Venue CRUD ----
  async function saveVenue(payload) {
    setBusy(true);
    try {
      const body = { ...payload, inclusions: Array.isArray(payload.inclusions) ? payload.inclusions : String(payload.inclusions).split(',').map((s) => s.trim()).filter(Boolean) };
      if (payload._id) await updateVenue(payload._id, body);
      else await createVenue(body);
      setVenueModal(null);
      load();
      flash('Venue saved.');
    } finally {
      setBusy(false);
    }
  }
  async function removeVenue(id) {
    if (!confirm('Remove this banquet venue?')) return;
    await deleteVenue(id);
    load();
    flash('Venue removed.');
  }

  // ---- Booking Actions ----
  async function handleBookingAction(id, payload) {
    try {
      const body = typeof payload === 'object' ? payload : { bookingStatus: arguments[1], paymentStatus: arguments[2] };
      await updateBookingStatus(id, body);
      load();
      flash('Booking updated.');
    } catch (err) {
      flash(err?.response?.data?.message || 'Could not update booking status.', 'error');
    }
  }

  async function removeBooking(id) {
    if (!confirm('Delete this booking record permanently?')) return;
    await deleteBooking(id);
    load();
    flash('Booking record deleted.');
  }

  // ---- Review Actions ----
  async function handleApproveReview(id) {
    await approveReview(id);
    load();
    flash('Review status updated.');
  }

  async function handleDeleteReview(id) {
    if (!confirm('Delete this guest review permanently?')) return;
    await deleteReview(id);
    load();
    flash('Review deleted.');
  }

  // ---- Inquiry Actions ----
  async function handleResolveInquiry(id) {
    await resolveInquiry(id);
    load();
    flash('Inquiry marked resolved.');
  }

  async function handleDeleteInquiry(id) {
    if (!confirm('Delete this guest inquiry?')) return;
    await deleteInquiry(id);
    load();
    flash('Inquiry deleted.');
  }

  async function handleClearAllInquiries() {
    if (!confirm('Clear all inquiries from inbox?')) return;
    await clearAllInquiries();
    load();
    flash('All inquiries cleared.');
  }

  // ---- Settings CRUD ----
  async function handleSaveSettings(payload) {
    setBusy(true);
    try {
      await updateSettings(payload);
      setSettingsModal(null);
      load();
      flash('Hotel settings updated.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="pt-32 pb-40 px-gutter-mobile max-w-container-max mx-auto flex flex-col gap-space-lg">
      <div>
        <h1 className="font-display text-headline-md text-primary">Master Operations Control</h1>
        <p className="text-body-sm text-on-surface-variant">Manage rooms, menu, venues &amp; real-time stock sync.</p>
      </div>

      {notice && (
        <div className="p-space-sm rounded-lg bg-secondary-container text-on-secondary-container text-label-md font-semibold">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-2 gap-space-sm">
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
          <p className="text-label-sm text-on-surface-variant uppercase font-bold">Revenue</p>
          <p className="font-display text-headline-sm text-primary">₹{(summary?.revenue?.monthly ?? 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
          <p className="text-label-sm text-on-surface-variant uppercase font-bold">Occupancy</p>
          <p className="font-display text-headline-sm text-primary">{summary?.occupancy?.percent ?? 0}%</p>
        </div>
      </div>

      {/* Rooms Inventory */}
      <section id="rooms" className="flex flex-col gap-space-sm">
        <SectionHeader icon="bed" title="Rooms Inventory" subtitle="Manage room categories, stock &amp; pricing." onAdd={() => setRoomModal({ ...EMPTY_ROOM })} />
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/40 text-secondary uppercase font-bold text-label-sm">
                <th className="p-space-sm">Room Category</th>
                <th className="p-space-sm">Type</th>
                <th className="p-space-sm">Base Price</th>
                <th className="p-space-sm">Inventory</th>
                <th className="p-space-sm">Status</th>
                <th className="p-space-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-space-sm font-semibold text-primary flex items-center gap-space-xs">
                    <img src={getImageUrl(room.images?.[0])} alt={room.name} className="w-10 h-10 rounded-lg object-cover" />
                    <span>{room.name}</span>
                  </td>
                  <td className="p-space-sm text-on-surface-variant">{room.category}</td>
                  <td className="p-space-sm font-bold text-primary">₹{room.basePrice.toLocaleString('en-IN')}/night</td>
                  <td className="p-space-sm font-semibold text-on-surface">{room.totalUnits} Units</td>
                  <td className="p-space-sm">
                    <span className={`text-label-sm px-space-xs py-0.5 rounded-full font-semibold ${room.status === 'active' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="p-space-sm text-right">
                    <div className="flex items-center justify-end gap-space-xs">
                      <button onClick={() => setRoomModal(room)} className="px-space-xs py-1 rounded-md bg-secondary-container text-on-secondary-container text-label-sm font-semibold hover:bg-secondary-container/80">Edit</button>
                      <button onClick={() => removeRoom(room._id)} className="px-space-xs py-1 rounded-md bg-error-container text-on-error-container text-label-sm font-semibold hover:bg-error-container/80">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col gap-space-sm">
          {rooms.map((room) => (
            <div key={room._id} className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex gap-space-sm items-center">
              <img src={getImageUrl(room.images?.[0])} alt={room.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-label-md font-bold text-primary truncate">{room.name}</p>
                <span
                  className={`text-label-sm px-space-xs rounded-full ${
                    room.status === 'active' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'
                  }`}
                >
                  {room.status}
                </span>
                <p className="text-label-sm text-on-surface-variant">₹{room.basePrice}/night · {room.totalUnits} units</p>
              </div>
              <div className="flex flex-col gap-space-2xs">
                <button onClick={() => setRoomModal(room)} className="p-1.5 rounded-full bg-secondary-container text-on-secondary-container">
                  <Icon name="edit" className="text-[16px]" />
                </button>
                <button onClick={() => removeRoom(room._id)} className="p-1.5 rounded-full bg-error-container text-on-error-container">
                  <Icon name="delete" className="text-[16px]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Venues */}
      <section id="venues" className="flex flex-col gap-space-sm">
        <SectionHeader icon="celebration" title="Banquet &amp; Event Venues" subtitle="Weddings, functions &amp; celebration lawn packages." onAdd={() => setVenueModal({ ...EMPTY_VENUE })} />
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/40 text-secondary uppercase font-bold text-label-sm">
                <th className="p-space-sm">Venue</th>
                <th className="p-space-sm">Capacity</th>
                <th className="p-space-sm">Base Price</th>
                <th className="p-space-sm">Status</th>
                <th className="p-space-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v._id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-space-sm font-semibold text-primary flex items-center gap-space-xs">
                    <img src={getImageUrl(v.image)} alt={v.name} className="w-10 h-10 rounded-lg object-cover" />
                    <span>{v.name}</span>
                  </td>
                  <td className="p-space-sm text-on-surface-variant">Up to {v.capacity} Guests</td>
                  <td className="p-space-sm font-bold text-primary">₹{v.basePrice.toLocaleString('en-IN')}</td>
                  <td className="p-space-sm">
                    <span className="text-label-sm px-space-xs py-0.5 rounded-full font-semibold bg-secondary-container text-on-secondary-container">
                      {v.status}
                    </span>
                  </td>
                  <td className="p-space-sm text-right">
                    <div className="flex items-center justify-end gap-space-xs">
                      <button onClick={() => setVenueModal({ ...v, inclusions: v.inclusions.join(', ') })} className="px-space-xs py-1 rounded-md bg-secondary-container text-on-secondary-container text-label-sm font-semibold hover:bg-secondary-container/80">Edit</button>
                      <button onClick={() => removeVenue(v._id)} className="px-space-xs py-1 rounded-md bg-error-container text-on-error-container text-label-sm font-semibold hover:bg-error-container/80">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col gap-space-sm">
          {venues.map((v) => (
            <div key={v._id} className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex gap-space-sm items-center">
              <img src={getImageUrl(v.image)} alt={v.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-label-md font-bold text-primary truncate">{v.name}</p>
                <p className="text-label-sm text-on-surface-variant">Up to {v.capacity} guests · ₹{v.basePrice.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex flex-col gap-space-2xs">
                <button onClick={() => setVenueModal({ ...v, inclusions: v.inclusions.join(', ') })} className="p-1.5 rounded-full bg-secondary-container text-on-secondary-container">
                  <Icon name="edit" className="text-[16px]" />
                </button>
                <button onClick={() => removeVenue(v._id)} className="p-1.5 rounded-full bg-error-container text-on-error-container">
                  <Icon name="delete" className="text-[16px]" />
                </button>
              </div>
            </div>
          ))}
          {venues.length === 0 && <p className="text-body-sm text-on-surface-variant">No venues added yet.</p>}
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="flex flex-col gap-space-sm">
        <SectionHeader icon="restaurant_menu" title="Restaurant &amp; Kitchen Menu" subtitle="Live pricing, staples, seasonal specials." onAdd={() => setMenuModal({ ...EMPTY_MENU })} />
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/40 text-secondary uppercase font-bold text-label-sm">
                <th className="p-space-sm">Dish Name</th>
                <th className="p-space-sm">Category</th>
                <th className="p-space-sm">Price</th>
                <th className="p-space-sm">Stock Status</th>
                <th className="p-space-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menu.map((item) => (
                <tr key={item._id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-space-sm font-semibold text-primary flex items-center gap-space-xs">
                    <span className="text-xl">{item.emoji}</span>
                    <span>{item.name}</span>
                  </td>
                  <td className="p-space-sm text-on-surface-variant">{item.category}</td>
                  <td className="p-space-sm font-bold text-primary">₹{item.price}</td>
                  <td className="p-space-sm">
                    <span className={`text-label-sm px-space-xs py-0.5 rounded-full font-semibold ${item.inStock ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-space-sm text-right">
                    <div className="flex items-center justify-end gap-space-xs">
                      <button onClick={() => setMenuModal(item)} className="px-space-xs py-1 rounded-md bg-secondary-container text-on-secondary-container text-label-sm font-semibold hover:bg-secondary-container/80">Edit</button>
                      <button onClick={() => removeMenuItem(item._id)} className="px-space-xs py-1 rounded-md bg-error-container text-on-error-container text-label-sm font-semibold hover:bg-error-container/80">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col gap-space-sm">
          {menu.map((item) => (
            <div key={item._id} className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-space-sm">
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-label-md font-bold text-primary truncate">{item.name}</p>
                <p className="text-label-sm text-on-surface-variant">{item.category} · ₹{item.price}</p>
              </div>
              <div className="flex flex-col gap-space-2xs">
                <button onClick={() => setMenuModal(item)} className="p-1.5 rounded-full bg-secondary-container text-on-secondary-container">
                  <Icon name="edit" className="text-[16px]" />
                </button>
                <button onClick={() => removeMenuItem(item._id)} className="p-1.5 rounded-full bg-error-container text-on-error-container">
                  <Icon name="delete" className="text-[16px]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active bookings */}
      <section id="bookings" className="flex flex-col gap-space-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
          <h2 className="font-display text-headline-sm text-primary flex items-center gap-2">
            <Icon name="book_online" /> Active Bookings Queue ({filteredBookings.length})
          </h2>
          <div className="relative w-full sm:w-72">
            <Icon name="search" className="absolute left-space-xs top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]" />
            <input
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              placeholder="Search by guest, phone, or code..."
              className="w-full pl-8 pr-space-sm py-space-xs rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-label-md focus:outline-none"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/40 text-secondary uppercase font-bold text-label-sm">
                <th className="p-space-sm">Booking Code &amp; Guest</th>
                <th className="p-space-sm">Room Category</th>
                <th className="p-space-sm">Check-in / Check-out</th>
                <th className="p-space-sm">Total Amount</th>
                <th className="p-space-sm">Status</th>
                <th className="p-space-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b._id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-space-sm font-semibold text-primary">
                    <div>{b.guestName}</div>
                    <div className="text-label-sm text-on-surface-variant font-normal">#{b.bookingCode}</div>
                    {b.upiTransactionRef && (
                      <div className="text-label-xs text-amber-800 font-mono bg-amber-50 px-1 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                        UTR: {b.upiTransactionRef}
                      </div>
                    )}
                  </td>
                  <td className="p-space-sm text-on-surface-variant">{b.room?.name || 'Standard'}</td>
                  <td className="p-space-sm text-on-surface-variant">
                    {new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}
                  </td>
                  <td className="p-space-sm font-bold text-primary">₹{b.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="p-space-sm">
                    <span
                      className={`text-label-sm px-space-xs py-0.5 rounded-full font-semibold ${
                        b.bookingStatus === 'confirmed'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : b.bookingStatus === 'pending'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-primary text-surface'
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                  </td>
                  <td className="p-space-sm text-right">
                    <div className="flex items-center justify-end gap-space-xs">
                      <button onClick={() => setReceiptBooking(b)} className="px-space-xs py-1 rounded-md bg-surface-container-high hover:bg-surface-container-highest text-primary text-label-sm font-semibold flex items-center gap-1">
                        <Icon name="receipt_long" className="text-[14px]" /> Receipt
                      </button>
                      {b.bookingStatus !== 'checked_in' && b.bookingStatus !== 'checked_out' && b.bookingStatus !== 'cancelled' && (
                        <button onClick={() => handleBookingAction(b._id, 'checked_in')} className="px-space-xs py-1 rounded-md bg-terracotta text-white text-label-sm font-semibold hover:opacity-90">Check-in</button>
                      )}
                      {b.bookingStatus === 'checked_in' && (
                        <button onClick={() => handleBookingAction(b._id, 'checked_out')} className="px-space-xs py-1 rounded-md bg-primary text-surface text-label-sm font-semibold hover:opacity-90">Check-out</button>
                      )}
                      {b.paymentStatus !== 'paid' && (
                        <button onClick={() => handleBookingAction(b._id, { paymentStatus: 'paid', bookingStatus: 'confirmed' })} className="px-space-xs py-1 rounded-md bg-secondary text-white text-label-sm font-semibold hover:opacity-90">Mark Paid &amp; Confirm</button>
                      )}
                      {b.bookingStatus !== 'cancelled' && b.bookingStatus !== 'checked_out' && (
                        <button onClick={() => handleBookingAction(b._id, 'cancelled')} className="px-space-xs py-1 rounded-md bg-surface-container-high text-on-surface-variant text-label-sm font-semibold hover:bg-surface-container-highest">Cancel</button>
                      )}
                      <button onClick={() => removeBooking(b._id)} className="px-space-xs py-1 rounded-md bg-error-container text-on-error-container text-label-sm font-semibold hover:bg-error-container/80">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col gap-space-sm">
          {filteredBookings.map((b) => (
            <div key={b._id} className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-md font-bold text-primary">{b.guestName} <span className="text-on-surface-variant font-normal">#{b.bookingCode}</span></p>
                  <p className="text-label-sm text-on-surface-variant">{b.room?.name} · ₹{b.totalAmount.toLocaleString('en-IN')}</p>
                  {b.upiTransactionRef && (
                    <p className="text-label-xs font-mono text-amber-800 font-semibold mt-0.5">UTR: {b.upiTransactionRef}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setReceiptBooking(b)} className="p-1.5 rounded-full bg-surface-container-high text-primary">
                    <Icon name="receipt_long" className="text-[16px]" />
                  </button>
                  <button onClick={() => removeBooking(b._id)} className="p-1.5 rounded-full bg-error-container text-on-error-container">
                    <Icon name="delete" className="text-[16px]" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-space-2xs pt-space-2xs">
                {b.bookingStatus !== 'checked_in' && b.bookingStatus !== 'checked_out' && b.bookingStatus !== 'cancelled' && (
                  <button onClick={() => handleBookingAction(b._id, 'checked_in')} className="flex-1 py-1 rounded-full bg-terracotta text-white text-label-sm font-bold">
                    Check-in
                  </button>
                )}
                {b.bookingStatus === 'checked_in' && (
                  <button onClick={() => handleBookingAction(b._id, 'checked_out')} className="flex-1 py-1 rounded-full bg-primary text-surface text-label-sm font-bold">
                    Check-out
                  </button>
                )}
                {b.paymentStatus !== 'paid' && (
                  <button onClick={() => handleBookingAction(b._id, { paymentStatus: 'paid', bookingStatus: 'confirmed' })} className="px-3 py-1 rounded-full bg-secondary text-white text-label-sm font-bold">
                    Mark Paid &amp; Confirm
                  </button>
                )}
                {b.bookingStatus !== 'cancelled' && b.bookingStatus !== 'checked_out' && (
                  <button onClick={() => handleBookingAction(b._id, 'cancelled')} className="flex-1 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-label-sm font-bold">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredBookings.length === 0 && <p className="text-body-sm text-on-surface-variant text-center py-space-md">No bookings match your search.</p>}
        </div>
      </section>

      {/* Guest Reviews Moderation */}
      <section id="reviews" className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-headline-sm text-primary flex items-center gap-2">
            <Icon name="rate_review" /> Guest Reviews Moderation ({reviews.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          {reviews.map((r) => (
            <div key={r._id} className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col justify-between gap-space-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-label-md font-bold text-primary">{r.guestName}</span>
                  <span className={`text-label-sm px-space-xs py-0.5 rounded-full font-semibold ${r.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {r.approved ? 'Approved' : 'Pending Moderation'}
                  </span>
                </div>
                <p className="text-label-sm text-on-surface-variant italic mt-1">&ldquo;{r.comment}&rdquo;</p>
              </div>
              <div className="flex items-center justify-end gap-space-xs pt-space-xs border-t border-outline-variant/20">
                <button onClick={() => handleApproveReview(r._id)} className="px-space-xs py-1 rounded-md bg-secondary-container text-on-secondary-container text-label-sm font-semibold">
                  {r.approved ? 'Hide' : 'Approve'}
                </button>
                <button onClick={() => handleDeleteReview(r._id)} className="px-space-xs py-1 rounded-md bg-error-container text-on-error-container text-label-sm font-semibold">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-body-sm text-on-surface-variant">No reviews found.</p>}
        </div>
      </section>

      {/* Guest Inquiries Inbox */}
      <section id="inquiries" className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-headline-sm text-primary flex items-center gap-2">
            <Icon name="mail" /> Guest Inquiries Inbox ({inquiries.length})
          </h2>
          {inquiries.length > 0 && (
            <button onClick={handleClearAllInquiries} className="px-space-sm py-1 rounded-full bg-error-container text-on-error-container text-label-sm font-bold">
              Clear All Inquiries
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          {inquiries.map((inq) => (
            <div key={inq._id} className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col justify-between gap-space-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-label-md font-bold text-primary">{inq.guestName || 'Guest Inquiry'}</span>
                  <span className={`text-label-sm px-space-xs py-0.5 rounded-full font-semibold ${inq.status === 'resolved' ? 'bg-secondary-container text-on-secondary-container' : 'bg-terracotta/20 text-terracotta'}`}>
                    {inq.status}
                  </span>
                </div>
                <p className="text-body-sm text-on-surface-variant mt-1">{inq.message}</p>
              </div>
              <div className="flex items-center justify-end gap-space-xs pt-space-xs border-t border-outline-variant/20">
                {inq.status !== 'resolved' && (
                  <button onClick={() => handleResolveInquiry(inq._id)} className="px-space-xs py-1 rounded-md bg-secondary-container text-on-secondary-container text-label-sm font-semibold">
                    Mark Resolved
                  </button>
                )}
                <button onClick={() => handleDeleteInquiry(inq._id)} className="px-space-xs py-1 rounded-md bg-error-container text-on-error-container text-label-sm font-semibold">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {inquiries.length === 0 && <p className="text-body-sm text-on-surface-variant">No inquiries received yet.</p>}
        </div>
      </section>

      {/* Hotel Settings & UPI Scanner Management */}
      <section id="settings" className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-headline-sm text-primary flex items-center gap-2">
              <Icon name="settings" /> Hotel Profile &amp; Owner Payment Scanner
            </h2>
            <p className="text-body-sm text-on-surface-variant">Update contact info, UPI QR code, and location coordinates.</p>
          </div>
          <button onClick={() => setSettingsModal(settings || {})} className="px-space-md py-space-xs rounded-full bg-primary text-surface text-label-md font-bold flex items-center gap-1">
            <Icon name="edit" className="text-[18px]" /> Edit Settings
          </button>
        </div>

        {settings && (
          <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div>
              <span className="text-label-sm text-secondary uppercase font-bold">Address &amp; Desk</span>
              <p className="text-label-md font-bold text-primary">{settings.hotelName}</p>
              <p className="text-label-sm text-on-surface-variant">{settings.address}</p>
              <p className="text-label-sm text-on-surface-variant">Phone: {settings.phone}</p>
            </div>

            <div>
              <span className="text-label-sm text-secondary uppercase font-bold">Owner UPI QR Code</span>
              <p className="text-label-md font-bold text-primary">{settings.upiId || '9418703201@upi'}</p>
              <img
                src={settings.upiQrImage ? getImageUrl(settings.upiQrImage) : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${settings?.upiId || '9418703201@upi'}&pn=SudhaHotel&cu=INR`)}`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                    `upi://pay?pa=${settings?.upiId || '9418703201@upi'}&pn=SudhaHotel&cu=INR`
                  )}`;
                }}
                alt="Owner UPI QR Scanner"
                className="w-24 h-24 mt-1 rounded-lg border object-cover shadow-sm"
              />
            </div>

            <div>
              <span className="text-label-sm text-secondary uppercase font-bold">Policies &amp; GSTIN</span>
              <p className="text-label-sm text-on-surface-variant">Check-in: {settings.checkinPolicy} | Check-out: {settings.checkoutPolicy}</p>
              <p className="text-label-sm text-on-surface-variant">GSTIN: {settings.gstin || 'Not specified'}</p>
            </div>
          </div>
        )}
      </section>

      {/* Room modal */}
      <Modal open={!!roomModal} onClose={() => setRoomModal(null)} title={roomModal?._id ? 'Edit Room Inventory' : 'Add New Room Inventory'}>
        {roomModal && (
          <RoomForm room={roomModal} onCancel={() => setRoomModal(null)} onSave={saveRoom} busy={busy} />
        )}
      </Modal>

      {/* Menu modal */}
      <Modal open={!!menuModal} onClose={() => setMenuModal(null)} title={menuModal?._id ? 'Edit Menu Item' : 'Add Menu Item'}>
        {menuModal && (
          <MenuForm item={menuModal} onCancel={() => setMenuModal(null)} onSave={saveMenuItem} busy={busy} />
        )}
      </Modal>

      {/* Venue modal */}
      <Modal open={!!venueModal} onClose={() => setVenueModal(null)} title={venueModal?._id ? 'Edit Venue' : 'Add Venue'}>
        {venueModal && (
          <VenueForm venue={venueModal} onCancel={() => setVenueModal(null)} onSave={saveVenue} busy={busy} />
        )}
      </Modal>

      {/* Settings modal */}
      <Modal open={!!settingsModal} onClose={() => setSettingsModal(null)} title="Hotel Settings &amp; Owner UPI Scanner">
        {settingsModal && (
          <SettingsForm settings={settingsModal} onCancel={() => setSettingsModal(null)} onSave={handleSaveSettings} busy={busy} />
        )}
      </Modal>

      {/* Receipt Modal */}
      <Modal open={!!receiptBooking} onClose={() => setReceiptBooking(null)} title="Guest Booking Voucher &amp; Receipt">
        {receiptBooking && (
          <BookingReceipt
            booking={receiptBooking}
            room={receiptBooking.room}
            onClose={() => setReceiptBooking(null)}
          />
        )}
      </Modal>
    </main>
  );
}

function RoomForm({ room, onCancel, onSave, busy }) {
  const [form, setForm] = useState({ ...room, images: room.images?.length ? room.images : [] });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="flex flex-col gap-space-sm max-h-[75vh] overflow-y-auto pr-1"
    >
      <div>
        <label className="text-label-sm text-secondary uppercase font-bold">Room Name / Title</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
      </div>
      <div className="grid grid-cols-2 gap-space-sm">
        <div>
          <label className="text-label-sm text-secondary uppercase font-bold">Category</label>
          <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
        </div>
        <div>
          <label className="text-label-sm text-secondary uppercase font-bold">Inventory Units</label>
          <input required type="number" min="0" value={form.totalUnits} onChange={(e) => setForm({ ...form, totalUnits: Number(e.target.value) })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
        </div>
        <div>
          <label className="text-label-sm text-secondary uppercase font-bold">Price Per Night (₹)</label>
          <input required type="number" min="0" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
        </div>
        <div>
          <label className="text-label-sm text-secondary uppercase font-bold">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40">
            <option value="active">Active (Available)</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-label-sm text-secondary uppercase font-bold">Tagline</label>
        <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
      </div>
      <div>
        <label className="text-label-sm text-secondary uppercase font-bold">Description</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
      </div>
      <div className="grid grid-cols-3 gap-space-sm">
        <div>
          <label className="text-label-sm text-secondary uppercase font-bold">Size (sq.ft)</label>
          <input type="number" value={form.sizeSqft} onChange={(e) => setForm({ ...form, sizeSqft: Number(e.target.value) })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
        </div>
        <div>
          <label className="text-label-sm text-secondary uppercase font-bold">Max Adults</label>
          <input type="number" value={form.maxAdults} onChange={(e) => setForm({ ...form, maxAdults: Number(e.target.value) })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
        </div>
        <div>
          <label className="text-label-sm text-secondary uppercase font-bold">Max Children</label>
          <input type="number" value={form.maxChildren} onChange={(e) => setForm({ ...form, maxChildren: Number(e.target.value) })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
        </div>
      </div>
      <div>
        <label className="text-label-sm text-secondary uppercase font-bold">Bed Type</label>
        <input value={form.bedType} onChange={(e) => setForm({ ...form, bedType: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
      </div>
      <div>
        <label className="text-label-sm text-secondary uppercase font-bold">Amenities (comma separated)</label>
        <input
          value={Array.isArray(form.amenities) ? form.amenities.join(', ') : form.amenities}
          onChange={(e) => setForm({ ...form, amenities: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40"
        />
      </div>

      {/* Direct Image File Upload */}
      <ImageUploader
        label="Room Photos (Upload Image Files)"
        value={form.images}
        onChange={(imgs) => setForm({ ...form, images: imgs })}
        multiple={true}
      />

      <div className="flex gap-space-sm pt-space-xs">
        <button type="button" onClick={onCancel} className="flex-1 py-space-sm rounded-full bg-surface-container-high text-on-surface-variant font-label-lg font-bold">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="flex-1 py-space-sm rounded-full bg-terracotta text-white font-label-lg font-bold disabled:opacity-60">
          {busy ? 'Saving...' : 'Save Room'}
        </button>
      </div>
    </form>
  );
}

function MenuForm({ item, onCancel, onSave, busy }) {
  const [form, setForm] = useState({ isVeg: true, ...item });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="flex flex-col gap-space-sm max-h-[75vh] overflow-y-auto pr-1"
    >
      <div>
        <label className="text-label-sm text-secondary uppercase font-bold">Dish Name *</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
      </div>

      {/* Veg vs Non-Veg Dietary Selection */}
      <div className="flex flex-col gap-1">
        <label className="text-label-sm text-secondary uppercase font-bold">Dietary Category *</label>
        <div className="grid grid-cols-2 gap-space-xs mt-1">
          <button
            type="button"
            onClick={() => setForm({ ...form, isVeg: true })}
            className={`py-space-sm px-space-md rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
              form.isVeg
                ? 'border-emerald-700 bg-emerald-50 text-emerald-800 shadow-sm'
                : 'border-outline-variant/40 bg-surface-container-low text-on-surface-variant'
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-emerald-900" />
            Pure Vegetarian
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, isVeg: false })}
            className={`py-space-sm px-space-md rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
              !form.isVeg
                ? 'border-rose-700 bg-rose-50 text-rose-800 shadow-sm'
                : 'border-outline-variant/40 bg-surface-container-low text-on-surface-variant'
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-rose-600 border border-rose-900" />
            Non-Vegetarian
          </button>
        </div>
      </div>

      <div>
        <label className="text-label-sm text-secondary uppercase font-bold">Description</label>
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
      </div>

      <div className="grid grid-cols-2 gap-space-sm">
        <div>
          <label className="text-label-sm text-secondary uppercase font-bold">Price (₹) *</label>
          <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
        </div>
        <div>
          <label className="text-label-sm text-secondary uppercase font-bold">Category *</label>
          <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" placeholder="e.g. Breakfast, Mains, Tandoor" />
        </div>
      </div>

      {/* Direct Dish Image File Upload */}
      <ImageUploader
        label="Dish Photo (Upload Image File)"
        value={form.image}
        onChange={(url) => setForm({ ...form, image: url })}
        multiple={false}
      />

      <div className="flex items-center gap-space-xs">
        <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} className="w-4 h-4 accent-primary" />
        <label className="text-label-md text-on-surface font-semibold">Available / In Stock Today</label>
      </div>

      <div className="flex gap-space-sm pt-space-xs">
        <button type="button" onClick={onCancel} className="flex-1 py-space-sm rounded-full bg-surface-container-high text-on-surface-variant font-label-lg font-bold">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="flex-1 py-space-sm rounded-full bg-terracotta text-white font-label-lg font-bold disabled:opacity-60">
          {busy ? 'Saving...' : 'Save Dish'}
        </button>
      </div>
    </form>
  );
}

function VenueForm({ venue, onCancel, onSave, busy }) {
  const [form, setForm] = useState(venue);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="flex flex-col gap-space-sm max-h-[75vh] overflow-y-auto pr-1"
    >
      <div>
        <label className="text-label-sm text-secondary uppercase font-bold">Venue Name *</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
      </div>
      <div>
        <label className="text-label-sm text-secondary uppercase font-bold">Description</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
      </div>
      <div className="grid grid-cols-2 gap-space-sm">
        <div>
          <label className="text-label-sm text-secondary uppercase font-bold">Capacity (guests)</label>
          <input required type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
        </div>
        <div>
          <label className="text-label-sm text-secondary uppercase font-bold">Base Price (₹)</label>
          <input required type="number" min="0" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
        </div>
      </div>
      <div>
        <label className="text-label-sm text-secondary uppercase font-bold">Inclusions (comma separated)</label>
        <input value={form.inclusions} onChange={(e) => setForm({ ...form, inclusions: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
      </div>

      {/* Direct Venue Image File Upload */}
      <ImageUploader
        label="Venue Photo (Upload Image File)"
        value={form.image}
        onChange={(url) => setForm({ ...form, image: url })}
        multiple={false}
      />

      <div className="flex gap-space-sm pt-space-xs">
        <button type="button" onClick={onCancel} className="flex-1 py-space-sm rounded-full bg-surface-container-high text-on-surface-variant font-label-lg font-bold">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="flex-1 py-space-sm rounded-full bg-terracotta text-white font-label-lg font-bold disabled:opacity-60">
          {busy ? 'Saving...' : 'Save Venue'}
        </button>
      </div>
    </form>
  );
}

function SettingsForm({ settings, onCancel, onSave, busy }) {
  const [form, setForm] = useState({
    hotelName: 'Sudha Hotel & Restaurant',
    address: 'M4G9+P36 Una - Amb Rd, Pratap Nagar, Amb, HP 177203',
    phone: '094187 03201',
    whatsapp: '094187 03201',
    upiId: '9418703201@upi',
    upiQrImage: '',
    checkinPolicy: '12:00 PM',
    checkoutPolicy: '11:00 AM',
    gstin: '',
    ...settings,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="flex flex-col gap-space-sm max-h-[75vh] overflow-y-auto pr-1"
    >
      <div>
        <label className="text-label-sm text-secondary uppercase font-bold">Hotel Title</label>
        <input required value={form.hotelName} onChange={(e) => setForm({ ...form, hotelName: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
      </div>
      <div>
        <label className="text-label-sm text-secondary uppercase font-bold">Address</label>
        <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
      </div>

      <div className="grid grid-cols-2 gap-space-sm">
        <div>
          <label className="text-label-sm text-secondary uppercase font-bold">Front Desk Phone</label>
          <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
        </div>
        <div>
          <label className="text-label-sm text-secondary uppercase font-bold">WhatsApp Number</label>
          <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
        </div>
      </div>

      {/* Owner UPI Scanner & QR Settings */}
      <div className="p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-space-xs">
        <span className="text-label-sm text-primary uppercase font-bold flex items-center gap-1">
          <Icon name="qr_code_scanner" /> Owner UPI Scanner &amp; Online Payment Config
        </span>
        <div>
          <label className="text-label-sm text-secondary uppercase font-bold">Owner UPI ID *</label>
          <input
            required
            value={form.upiId}
            onChange={(e) => setForm({ ...form, upiId: e.target.value })}
            placeholder="e.g. 9418703201@upi or sudhahotel@okicici"
            className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-lowest border border-outline-variant/40 font-mono text-label-md font-bold"
          />
        </div>

        <ImageUploader
          label="Owner UPI QR Scanner Image (Upload File)"
          value={form.upiQrImage}
          onChange={(url) => setForm({ ...form, upiQrImage: url })}
          multiple={false}
        />
      </div>

      <div className="grid grid-cols-2 gap-space-sm">
        <div>
          <label className="text-label-sm text-secondary uppercase font-bold">Check-in Time</label>
          <input value={form.checkinPolicy} onChange={(e) => setForm({ ...form, checkinPolicy: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
        </div>
        <div>
          <label className="text-label-sm text-secondary uppercase font-bold">Check-out Time</label>
          <input value={form.checkoutPolicy} onChange={(e) => setForm({ ...form, checkoutPolicy: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40" />
        </div>
      </div>

      <div>
        <label className="text-label-sm text-secondary uppercase font-bold">GSTIN Registration #</label>
        <input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40 uppercase" />
      </div>

      <div className="flex gap-space-sm pt-space-xs">
        <button type="button" onClick={onCancel} className="flex-1 py-space-sm rounded-full bg-surface-container-high text-on-surface-variant font-label-lg font-bold">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="flex-1 py-space-sm rounded-full bg-terracotta text-white font-label-lg font-bold disabled:opacity-60">
          {busy ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}
