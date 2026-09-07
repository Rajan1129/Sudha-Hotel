import { useEffect, useState, useCallback } from 'react';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import BookingReceipt from '../components/BookingReceipt';
import QRScannerModal from '../components/QRScannerModal';
import { fetchDashboardSummary } from '../api/dashboard';
import { fetchBookings, updateBookingStatus } from '../api/bookings';
import { fetchInquiries, resolveInquiry, clearAllInquiries } from '../api/inquiries';
import { fetchSettings, updateSettings } from '../api/settings';

function StatCard({ icon, label, value, sub, positive }) {
  return (
    <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col gap-space-2xs">
      <div className="flex items-center justify-between">
        <span className="text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">{label}</span>
        <Icon name={icon} className="text-secondary text-[20px]" />
      </div>
      <span className="font-display text-headline-sm text-primary font-bold">{value}</span>
      {sub && (
        <span className={`text-label-sm font-semibold ${positive ? 'text-secondary' : 'text-on-surface-variant'}`}>
          {sub}
        </span>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [settings, setSettings] = useState(null);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [error, setError] = useState('');

  // Live Filter & Search & Scanner States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [receiptBooking, setReceiptBooking] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const load = useCallback(() => {
    fetchDashboardSummary().then(setSummary).catch(() => setError('Could not load dashboard summary.'));
    fetchBookings({ status: undefined }).then((d) => setBookings(d.bookings || []));
    fetchInquiries().then((d) => setInquiries((d.inquiries || []).filter((i) => i.status === 'unread')));
    fetchSettings().then((d) => setSettings(d.settings));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleBookingAction(id, payload) {
    const body = typeof payload === 'object' ? payload : { bookingStatus: arguments[1], paymentStatus: arguments[2] };
    await updateBookingStatus(id, body);
    load();
  }

  async function handleResolveInquiry(id) {
    await resolveInquiry(id);
    load();
  }

  async function handleClearAll() {
    await clearAllInquiries();
    setInquiries([]);
    load();
  }

  async function handleSettingsSubmit(e) {
    e.preventDefault();
    try {
      await updateSettings(settings);
      setSettingsMsg('Settings updated successfully.');
      setTimeout(() => setSettingsMsg(''), 2500);
    } catch (err) {
      setSettingsMsg(err?.response?.data?.message || 'Could not save settings.');
    }
  }

  const arrivalsToday = summary?.movesToday?.in ?? 0;
  const departuresToday = summary?.movesToday?.out ?? 0;

  // Filter Bookings by Search Query, Status, and Payment Filter
  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      b.guestName?.toLowerCase().includes(q) ||
      b.bookingCode?.toLowerCase().includes(q) ||
      b.phone?.includes(q);
    const matchesStatus = statusFilter === 'All' || b.bookingStatus === statusFilter;
    const matchesPayment = paymentFilter === 'All' || b.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <main className="pt-24 pb-40 px-gutter-mobile max-w-container-max mx-auto flex flex-col gap-space-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-headline-md text-primary font-bold">Sudha Hotel Management Portal</h1>
          <p className="text-body-sm text-on-surface-variant">Amb &amp; Una District Sanctuary Operations</p>
        </div>

        <button
          onClick={() => setScannerOpen(true)}
          className="px-space-md py-space-xs rounded-full bg-terracotta hover:bg-terracotta/90 text-white font-label-md font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all self-start sm:self-auto"
        >
          <Icon name="qr_code_scanner" className="text-[20px]" /> Scan / Verify Guest QR
        </button>
      </div>

      {error && <p className="text-body-sm text-error">{error}</p>}

      {/* Operational Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
        <StatCard icon="book_online" label="Bookings" value={summary?.bookings ?? '—'} sub={summary?.revenue?.growthPct != null ? `↑ ${summary.revenue.growthPct}% this month` : ''} positive />
        <StatCard
          icon="swap_horiz"
          label="Today's Moves"
          value={`${arrivalsToday} In / ${departuresToday} Out`}
          sub="Luggage holds ready"
        />
        <StatCard
          icon="payments"
          label="Total Revenue"
          value={`₹${(summary?.revenue?.monthly ?? 0).toLocaleString('en-IN')}`}
          sub="Monthly"
        />
        <StatCard
          icon="hotel_class"
          label="Occupancy"
          value={`${summary?.occupancy?.percent ?? 0}%`}
          sub={`(${summary?.occupancy?.occupiedUnits ?? 0}/${summary?.occupancy?.totalUnits ?? 0} Rooms)`}
        />
      </div>

      {/* Guest Inquiries Notification Banner */}
      {inquiries.length > 0 && (
        <div className="p-space-md rounded-2xl bg-primary text-on-primary shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
          <div>
            <p className="text-label-md font-bold flex items-center gap-1">
              <Icon name="mark_email_unread" className="text-[18px]" /> Unread Guest Inquiries ({inquiries.length})
            </p>
            <p className="text-body-sm text-primary-fixed-dim mt-0.5">
              {inquiries[0]?.message?.slice(0, 70)}...
            </p>
          </div>
          <div className="flex items-center gap-space-xs w-full sm:w-auto">
            <button
              onClick={() => handleResolveInquiry(inquiries[0]._id)}
              className="flex-1 sm:flex-initial px-space-md py-space-xs rounded-full bg-terracotta text-white text-label-md font-bold whitespace-nowrap active:scale-95 transition-transform"
            >
              Resolve Current
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 sm:flex-initial px-space-md py-space-xs rounded-full bg-surface-container-high text-on-surface text-label-md font-bold whitespace-nowrap hover:bg-surface-container-highest"
            >
              Clear All Fake / Read
            </button>
          </div>
        </div>
      )}

      {/* Daily Operations Quick Summary */}
      <section id="menu" className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-headline-sm text-primary font-bold">Daily Operations Summary</h2>
          <span className="text-label-sm px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
            Live System Sync
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
          <div className="p-space-sm rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between">
            <span className="text-label-md text-primary font-semibold flex items-center gap-2">
              <Icon name="flight_land" className="text-[18px] text-terracotta" /> Today's Arrivals
            </span>
            <span className="text-label-md font-bold text-primary">{arrivalsToday} Guests</span>
          </div>

          <div className="p-space-sm rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between">
            <span className="text-label-md text-primary font-semibold flex items-center gap-2">
              <Icon name="flight_takeoff" className="text-[18px] text-terracotta" /> Today's Departures
            </span>
            <span className="text-label-md font-bold text-primary">{departuresToday} Guests</span>
          </div>

          <div className="p-space-sm rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between">
            <span className="text-label-md text-primary font-semibold flex items-center gap-2">
              <Icon name="pending_actions" className="text-[18px] text-terracotta" /> Pending Requests
            </span>
            <span className="text-label-md font-bold text-primary">{summary?.pendingBookings ?? 0} Requests</span>
          </div>
        </div>
      </section>

      {/* ACTIVE BOOKINGS QUEUE WITH SEARCH & FILTER BAR */}
      <section id="bookings" className="flex flex-col gap-space-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
          <h2 className="font-display text-headline-sm text-primary font-bold flex items-center gap-2">
            <Icon name="book_online" /> Active Bookings Queue ({filteredBookings.length})
          </h2>
        </div>

        {/* Live Search & Filter Bar */}
        <div className="p-space-sm rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col sm:flex-row items-center gap-space-sm">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Icon name="search" className="absolute left-space-xs top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by guest name, phone, or code #SUD-..."
              className="w-full pl-9 pr-space-sm py-space-xs rounded-xl bg-surface-container-low border border-outline-variant/30 text-label-md font-semibold focus:outline-none"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-space-xs w-full sm:w-auto">
            <span className="text-label-sm text-on-surface-variant font-bold uppercase whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-space-xs py-space-xs rounded-xl bg-surface-container-low border border-outline-variant/30 text-label-md font-bold text-primary focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Filter Dropdown */}
          <div className="flex items-center gap-space-xs w-full sm:w-auto">
            <span className="text-label-sm text-on-surface-variant font-bold uppercase whitespace-nowrap">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-space-xs py-space-xs rounded-xl bg-surface-container-low border border-outline-variant/30 text-label-md font-bold text-primary focus:outline-none"
            >
              <option value="All">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Bookings Queue Cards */}
        <div className="flex flex-col gap-space-sm">
          {filteredBookings.map((b) => (
            <div key={b._id} className="p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col gap-space-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-md font-bold text-primary">
                    {b.guestName} <span className="text-on-surface-variant font-normal">#{b.bookingCode}</span>
                  </p>
                  <p className="text-label-sm text-on-surface-variant">
                    {b.room?.name || 'Deluxe Room'} · {new Date(b.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                    {new Date(b.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span
                  className={`text-label-sm px-space-xs py-0.5 rounded-full font-bold whitespace-nowrap ${
                    b.bookingStatus === 'confirmed'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : b.bookingStatus === 'pending'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : b.bookingStatus === 'checked_in'
                      ? 'bg-primary text-surface'
                      : 'bg-error-container text-on-error-container'
                  }`}
                >
                  {b.bookingStatus === 'pending' ? 'Pending Verification' : b.bookingStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-sm text-on-surface-variant">Total Rate</p>
                  <p className="text-label-lg font-bold text-primary">₹{b.totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <span className={`text-label-sm font-bold ${b.paymentStatus === 'paid' ? 'text-secondary' : 'text-error'}`}>
                  {b.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                </span>
              </div>

              {b.upiTransactionRef && (
                <div className="p-space-xs rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-wrap items-center justify-between text-label-sm">
                  <span className="font-semibold">
                    Submitted UPI UTR: <code className="font-mono font-bold bg-amber-100 px-1 rounded">{b.upiTransactionRef}</code>
                  </span>
                  {b.paymentProofImage && (
                    <a
                      href={b.paymentProofImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold underline hover:text-secondary text-label-xs"
                    >
                      View Proof Screenshot
                    </a>
                  )}
                </div>
              )}

              {/* Action Buttons: Check-in, Check-out, Mark Paid, Cancel, and View Receipt */}
              <div className="flex flex-wrap items-center gap-space-xs pt-space-2xs border-t border-outline-variant/20">
                <button
                  onClick={() => setReceiptBooking(b)}
                  className="py-space-xs px-space-sm rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary text-label-sm font-bold flex items-center justify-center gap-1"
                >
                  <Icon name="receipt_long" className="text-[16px]" /> Receipt
                </button>

                {b.bookingStatus !== 'checked_in' && b.bookingStatus !== 'checked_out' && b.bookingStatus !== 'cancelled' && (
                  <button
                    onClick={() => handleBookingAction(b._id, 'checked_in')}
                    className="flex-1 py-space-xs rounded-full bg-terracotta text-white text-label-sm font-bold shadow-sm active:scale-95 transition-transform"
                  >
                    Check-in
                  </button>
                )}

                {b.bookingStatus === 'checked_in' && (
                  <button
                    onClick={() => handleBookingAction(b._id, 'checked_out')}
                    className="flex-1 py-space-xs rounded-full bg-primary text-surface text-label-sm font-bold shadow-sm active:scale-95 transition-transform"
                  >
                    Check-out
                  </button>
                )}

                {b.bookingStatus === 'checked_out' && (
                  <span className="text-label-sm px-space-xs py-1 rounded-full bg-surface-container-high text-on-surface-variant font-bold">
                    Checked Out
                  </span>
                )}

                {b.paymentStatus !== 'paid' && (
                  <button
                    onClick={() => handleBookingAction(b._id, { paymentStatus: 'paid', bookingStatus: 'confirmed' })}
                    className="py-space-xs px-space-sm rounded-full bg-secondary text-white text-label-sm font-bold shadow-sm active:scale-95 transition-transform"
                  >
                    Mark Paid &amp; Confirm
                  </button>
                )}

                {b.bookingStatus !== 'cancelled' && b.bookingStatus !== 'checked_out' && (
                  <button
                    onClick={() => handleBookingAction(b._id, 'cancelled')}
                    className="py-space-xs px-space-sm rounded-full bg-surface-container-high text-on-surface-variant text-label-sm font-bold hover:bg-surface-container-highest"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredBookings.length === 0 && <p className="text-body-sm text-on-surface-variant text-center py-space-md">No bookings match your search or filter criteria.</p>}
        </div>
      </section>

      {/* Central Hotel Settings */}
      <section id="settings" className="flex flex-col gap-space-sm">
        <h2 className="font-display text-headline-sm text-primary font-bold">Central Hotel Settings</h2>
        <p className="text-body-sm text-on-surface-variant">Synchronized configuration &amp; geo-data</p>
        {settings && (
          <form onSubmit={handleSettingsSubmit} className="grid grid-cols-2 gap-space-sm">
            {[
              ['hotelName', 'Hotel Display Name'],
              ['phone', 'Official Phone'],
              ['checkinPolicy', 'Check-in Policy'],
              ['checkoutPolicy', 'Check-out Policy'],
              ['latitude', 'Latitude'],
              ['longitude', 'Longitude'],
              ['whatsapp', 'WhatsApp Concierge Desk'],
              ['gstin', 'GSTIN Identifier'],
            ].map(([key, label]) => (
              <div key={key} className={key === 'hotelName' ? 'col-span-2' : ''}>
                <label className="text-label-sm text-secondary uppercase font-bold">{label}</label>
                <input
                  value={settings[key] || ''}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  className="w-full mt-1 p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/40 text-label-md font-semibold focus:outline-none"
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="text-label-sm text-secondary uppercase font-bold">Address (Verified Google Listing)</label>
              <textarea
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                rows={2}
                className="w-full mt-1 p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/40 text-label-md focus:outline-none"
              />
            </div>
            {settingsMsg && <p className="col-span-2 text-label-md text-secondary font-semibold">{settingsMsg}</p>}
            <button
              type="submit"
              className="col-span-2 py-space-sm rounded-full bg-terracotta text-white font-label-lg font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <Icon name="save" className="text-[18px]" /> Update Settings
            </button>
          </form>
        )}
      </section>

      {/* Receipt Modal for Reception Staff */}
      <Modal open={!!receiptBooking} onClose={() => setReceiptBooking(null)} title="Guest Booking Voucher & Receipt">
        {receiptBooking && (
          <BookingReceipt
            booking={receiptBooking}
            room={receiptBooking.room}
            onClose={() => setReceiptBooking(null)}
          />
        )}
      </Modal>

      {/* QR Scanner & Desk Verification Modal */}
      <QRScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        bookings={bookings}
        onUpdateStatus={async (id, payload) => {
          await handleBookingAction(id, payload);
        }}
        onViewReceipt={(b) => setReceiptBooking(b)}
      />
    </main>
  );
}
