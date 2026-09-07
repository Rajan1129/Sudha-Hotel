import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import { useSearch } from '../context/SearchContext';
import { fetchRooms } from '../api/rooms';
import { fetchMenu } from '../api/menu';
import { fetchReviews } from '../api/reviews';
import { fetchVenues } from '../api/venues';
import { fetchSettings } from '../api/settings';
import { submitReview as submitReviewApi } from '../api/reviews';

const HERO_IMAGE = '/hotel_exterior.png';
const RESTAURANT_IMAGE =
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200&auto=format&fit=crop';
const HOST_AVATAR = '/host_profile.jpg';

export default function Home() {
  const navigate = useNavigate();
  const { checkIn, setCheckIn, checkOut, setCheckOut, adults, setAdults, roomsCount, setRoomsCount } = useSearch();

  const [rooms, setRooms] = useState([]);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [venues, setVenues] = useState([]);
  const [settings, setSettings] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ guestName: '', subtitle: '', rating: 5, comment: '' });
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    fetchRooms().then((d) => setRooms((d.rooms || []).slice(0, 3)));
    fetchMenu().then((d) => setMenu(d.items || []));
    fetchReviews().then((d) => setReviews(d.reviews || []));
    fetchVenues().then((d) => setVenues(d.venues || []));
    fetchSettings().then((d) => setSettings(d.settings || null));
  }, []);

  function handleCheckAvailability() {
    setFeedback(`Checking live availability for ${adults} Guest${adults > 1 ? 's' : ''} (${roomsCount} Room) from ${checkIn}...`);
    setTimeout(() => setFeedback('Inventory verified! Redirecting to live room rates...'), 500);
    setTimeout(() => {
      navigate(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&rooms=${roomsCount}`);
    }, 900);
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    try {
      const data = await submitReviewApi(reviewForm);
      setReviewMsg(data.message || 'Thank you for your review!');
      setTimeout(() => {
        setReviewOpen(false);
        setReviewMsg('');
        setReviewForm({ guestName: '', subtitle: '', rating: 5, comment: '' });
      }, 1400);
    } catch (err) {
      setReviewMsg(err?.response?.data?.message || 'Could not submit review. Please try again.');
    }
  }

  const groupedMenu = menu.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const phoneNum = settings?.phone || '094187 03201';
  const whatsappNum = (settings?.whatsapp || '094187 03201').replace(/\D/g, '');

  return (
    <main className="flex flex-col w-full pt-16 pb-40 px-gutter-mobile bg-surface max-w-container-max mx-auto space-y-space-2xl">
      {/* 1. HERO SECTION */}
      <section className="relative w-full rounded-3xl overflow-hidden shadow-2xl mt-space-md bg-primary">
        <div className="relative w-full h-[460px] sm:h-[500px] overflow-hidden">
          <img
            src={HERO_IMAGE}
            alt="Sudha Hotel Amb Una Exterior"
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07241A] via-[#07241A]/60 to-transparent" />
          
          {/* Top Live Property Badge */}
          <div className="absolute top-space-sm right-space-sm flex items-center gap-space-2xs">
            <span className="inline-flex items-center gap-1.5 px-space-sm py-space-2xs rounded-full bg-surface/90 backdrop-blur-md text-primary text-label-sm font-semibold shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-error animate-pulse" />
              Live Amb Property View
            </span>
          </div>

          {/* Hero Main Content */}
          <div className="absolute inset-x-0 bottom-0 p-space-md sm:p-space-lg flex flex-col gap-space-xs text-on-primary">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="inline-flex items-center gap-1.5 px-space-xs py-1 rounded-full bg-surface/20 backdrop-blur-md text-surface text-label-sm font-medium">
                <Icon name="star" filled className="text-[14px] text-tertiary-fixed-dim" />
                <span className="font-bold text-on-primary">{settings?.googleRating ?? '3.9'}</span>
                <span className="text-surface-variant/90">({settings?.googleReviewCount ?? 188} reviews on Google)</span>
              </span>
              <span className="inline-flex items-center gap-1 px-space-xs py-1 rounded-full bg-secondary-container/90 text-on-secondary-fixed text-label-sm font-semibold">
                <Icon name="verified" className="text-[14px]" />
                Warm Himachal Stay
              </span>
            </div>

            <h1 className="font-display text-[#FBF9F5] text-headline-lg-mobile sm:text-headline-lg font-bold tracking-tight drop-shadow-md">
              Sudha Hotel
            </h1>

            <p className="text-body-md text-surface-container-high/90 max-w-lg leading-relaxed">
              Welcome to Sudha Hotel, Amb Una. A warm stay in a quiet corner of Himachal Pradesh, offering comfortable rooms &amp; authentic mountain dining on the Una-Amb highway.
            </p>

            <div className="flex items-center gap-1.5 text-surface-variant/90 text-label-sm pt-space-2xs">
              <Icon name="pin_drop" className="text-[16px] text-tertiary-fixed" />
              <span>{settings?.address || 'Amb, Una, Himachal Pradesh – 177203'}</span>
            </div>

            <div className="flex items-center gap-space-xs pt-space-sm">
              <a
                href="#rooms-section"
                className="flex-1 sm:flex-none text-center py-space-sm px-space-lg rounded-full bg-terracotta hover:bg-terracotta/90 text-white font-label-md font-bold tracking-wide shadow-lg active:scale-95 transition-all"
              >
                Explore Rooms
              </a>
              <a
                href="#restaurant-section"
                className="flex-1 sm:flex-none text-center py-space-sm px-space-lg rounded-full bg-surface-container-lowest/20 hover:bg-surface-container-lowest/30 backdrop-blur-md text-surface font-label-md font-bold tracking-wide active:scale-95 transition-all"
              >
                Dine-in &amp; Food
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE AVAILABILITY SEARCH WIDGET */}
      <section className="relative w-full -mt-space-xl z-20">
        <div className="w-full p-space-md sm:p-space-lg rounded-3xl bg-surface-container-lowest shadow-2xl border border-outline-variant/30 flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <Icon name="calendar_month" className="text-primary text-[22px]" />
              <span className="font-display text-headline-sm text-primary">Live Availability</span>
            </div>
            <span className="inline-flex items-center gap-1 px-space-xs py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-sm font-semibold">
              <Icon name="shield" className="text-[14px]" /> Best Direct Rate
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
            <div className="flex flex-col gap-1 p-space-sm rounded-2xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/30 transition-colors">
              <label className="text-label-sm text-secondary uppercase font-bold tracking-wider">Check-in Date</label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-transparent text-label-md text-on-surface font-bold focus:outline-none"
              />
              <span className="text-label-sm text-on-surface-variant">Arrival after 12:00 PM</span>
            </div>

            <div className="flex flex-col gap-1 p-space-sm rounded-2xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/30 transition-colors">
              <label className="text-label-sm text-secondary uppercase font-bold tracking-wider">Check-out Date</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-transparent text-label-md text-on-surface font-bold focus:outline-none"
              />
              <span className="text-label-sm text-on-surface-variant">Departure by 11:00 AM</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
            <div className="flex items-center justify-between p-space-sm rounded-2xl bg-surface-container-low border border-outline-variant/20">
              <div className="flex flex-col">
                <span className="text-label-sm text-secondary uppercase font-bold">Guests</span>
                <span className="text-label-md text-primary font-bold">{adults} Guests</span>
              </div>
              <div className="flex items-center gap-space-2xs">
                <button
                  onClick={() => setAdults(Math.max(1, adults - 1))}
                  className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold hover:bg-surface-container-high active:scale-90 transition-transform"
                >
                  -
                </button>
                <button
                  onClick={() => setAdults(adults + 1)}
                  className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold hover:bg-primary/90 active:scale-90 transition-transform"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-space-sm rounded-2xl bg-surface-container-low border border-outline-variant/20">
              <div className="flex flex-col">
                <span className="text-label-sm text-secondary uppercase font-bold">Rooms</span>
                <span className="text-label-md text-primary font-bold">
                  {roomsCount} {roomsCount === 1 ? 'Room' : 'Rooms'}
                </span>
              </div>
              <div className="flex items-center gap-space-2xs">
                <button
                  onClick={() => setRoomsCount(Math.max(1, roomsCount - 1))}
                  className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold hover:bg-surface-container-high active:scale-90 transition-transform"
                >
                  -
                </button>
                <button
                  onClick={() => setRoomsCount(roomsCount + 1)}
                  className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold hover:bg-primary/90 active:scale-90 transition-transform"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {feedback && (
            <div className="p-space-xs rounded-xl bg-secondary-container text-on-secondary-container text-label-md font-semibold flex items-center gap-space-2xs animate-fade-in">
              <Icon name="check_circle" className="text-[18px]" />
              <span>{feedback}</span>
            </div>
          )}

          <button
            onClick={handleCheckAvailability}
            className="w-full py-space-md px-space-md rounded-2xl bg-terracotta hover:bg-terracotta/90 text-white font-label-lg font-bold uppercase tracking-wider shadow-[0_4px_20px_rgba(194,109,69,0.35)] active:scale-95 transition-all flex items-center justify-center gap-space-xs"
          >
            <Icon name="search" className="text-[22px]" />
            Check Live Availability
          </button>
        </div>
      </section>

      {/* 3. ABOUT / HIMALAYAN HOSPITALITY SECTION */}
      <section className="flex flex-col gap-space-md">
        <div className="flex flex-col">
          <span className="text-label-sm text-secondary font-bold uppercase tracking-widest">
            Himalayan Hospitality
          </span>
          <h2 className="font-display text-headline-md text-primary">A Comfortable Stay on the Una-Amb Highway</h2>
        </div>

        <p className="text-body-md text-on-surface-variant leading-relaxed">
          Positioned at the tranquil crossroads of Una and Amb, Sudha Hotel provides comfortable respite for pilgrims journeying to Chintpurni Devi, travelers navigating Kangra Valley, and wanderers seeking crisp mountain air.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
          {[
            ['explore', 'Highway Transit Location', 'Prime stop along HP State Highway with swift bypass access.'],
            ['support_agent', '24/7 Front Desk Support', 'Ever-ready reception welcoming late night mountain arrivals with warmth.'],
            ['restaurant', 'In-house Restaurant & Dining', 'Pure authentic Himachali fare, aromatic tandoor, and family dining.'],
            ['local_parking', 'Courtyard Parking', 'Free monitored courtyard parking for sedans, SUVs, and motorbikes.'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-space-2xs">
              <Icon name={icon} className="text-primary text-[26px]" />
              <span className="text-label-md text-primary font-bold">{title}</span>
              <span className="text-body-sm text-on-surface-variant">{desc}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-space-xs p-space-sm rounded-xl bg-surface-container-low text-on-surface-variant text-label-sm border border-outline-variant/20">
          <Icon name="info" className="text-secondary text-[18px]" />
          <span>Live coordinates &amp; room amenities synced via Sudha Hotel Administration Panel</span>
        </div>
      </section>

      {/* 4. FEATURED ROOMS SECTION */}
      <section id="rooms-section" className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-label-sm text-secondary font-bold uppercase tracking-widest">Restful Quarters</span>
            <h2 className="font-display text-headline-md text-primary">Featured Rooms</h2>
          </div>
          <button onClick={() => navigate('/rooms')} className="text-label-md text-terracotta font-bold flex items-center gap-1 hover:underline">
            Explore All Rooms <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          {rooms.map((room) => (
            <div key={room._id} className="rounded-2xl overflow-hidden bg-surface-container-lowest shadow-lg border border-outline-variant/30 flex flex-col group hover:shadow-xl transition-shadow">
              <div className="relative h-48 sm:h-52 overflow-hidden">
                <img src={room.images?.[0]} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {room.badge && (
                  <span className="absolute top-space-xs right-space-xs px-space-xs py-1 rounded-full bg-secondary-container/90 backdrop-blur-sm text-on-secondary-container text-label-sm font-semibold shadow-sm">
                    {room.badge}
                  </span>
                )}
              </div>
              <div className="p-space-md flex flex-col gap-space-xs flex-1 justify-between">
                <div>
                  <span className="text-label-sm text-secondary font-semibold uppercase">{room.category}</span>
                  <h3 className="font-display text-headline-sm text-primary font-bold">{room.name}</h3>
                  <p className="text-body-sm text-on-surface-variant line-clamp-2 mt-1">{room.description}</p>
                </div>

                <div className="flex flex-wrap gap-space-2xs pt-space-2xs">
                  <span className="text-label-sm px-space-xs py-1 rounded-full bg-surface-container-high text-primary font-medium">
                    {room.bedType}
                  </span>
                  {room.amenities?.slice(0, 2).map((a) => (
                    <span key={a} className="text-label-sm px-space-xs py-1 rounded-full bg-surface-container-high text-primary font-medium">
                      {a}
                    </span>
                  ))}
                </div>

                <div className="flex items-end justify-between pt-space-sm border-t border-outline-variant/30 mt-space-xs">
                  <div>
                    <span className="text-label-sm text-on-surface-variant">Starting from</span>
                    <p className="font-display text-headline-sm text-terracotta font-bold">
                      ₹{room.basePrice.toLocaleString('en-IN')}
                      <span className="text-body-sm text-on-surface-variant font-normal"> /night</span>
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/rooms')}
                    className="py-space-xs px-space-md rounded-full bg-primary hover:bg-primary/90 text-surface text-label-md font-semibold active:scale-95 transition-all"
                  >
                    Reserve Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. RESTAURANT & DINING SECTION */}
      <section id="restaurant-section" className="flex flex-col gap-space-md">
        <div className="relative rounded-3xl overflow-hidden h-52 sm:h-60 shadow-lg">
          <img src={RESTAURANT_IMAGE} alt="Sudha In-House Kitchen" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent flex items-end p-space-md sm:p-space-lg">
            <span className="px-space-xs py-space-2xs rounded-full bg-surface/90 backdrop-blur-md text-primary text-label-sm font-semibold">
              Open 7:00 AM – 11:00 PM
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-label-sm text-secondary font-bold uppercase tracking-widest">Dine-in &amp; Takeaway</span>
          <h2 className="font-display text-headline-md text-primary">Sudha In-House Kitchen</h2>
        </div>

        <p className="text-body-md text-on-surface-variant leading-relaxed">
          Savor pure vegetarian and classic non-vegetarian staples made fresh using mountain spices, stone-ground flours, and locally sourced dairy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs">
          {menu.slice(0, 3).map((item) => (
            <div
              key={item._id}
              className="flex flex-col items-center text-center p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 gap-1 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-3xl mb-1">{item.emoji}</span>
              <span className="text-label-md font-bold text-primary">{item.name}</span>
              <span className="text-label-sm text-on-surface-variant line-clamp-2">{item.description}</span>
              <span className="text-label-md font-bold text-terracotta mt-1">₹{item.price}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-space-xs">
          <button
            onClick={() => setMenuOpen(true)}
            className="flex-1 py-space-md rounded-2xl bg-primary hover:bg-primary/90 text-surface text-label-md font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <Icon name="restaurant_menu" className="text-[20px]" /> View Full Menu
          </button>
          <a
            href={`tel:${phoneNum}`}
            className="flex-1 py-space-md rounded-2xl bg-terracotta hover:bg-terracotta/90 text-white text-label-md font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <Icon name="call" className="text-[20px]" /> Order Ahead
          </a>
        </div>
      </section>

      {/* 6. BANQUET & EVENTS SECTION */}
      {venues.length > 0 && (
        <section id="banquet-section" className="flex flex-col gap-space-md">
          <div className="flex flex-col">
            <span className="text-label-sm text-secondary font-bold uppercase tracking-widest">Celebrations &amp; Gatherings</span>
            <h2 className="font-display text-headline-md text-primary">Grand Banquet &amp; Events</h2>
          </div>

          {venues.map((v) => (
            <div key={v._id} className="rounded-3xl overflow-hidden bg-surface-container-lowest shadow-xl border border-outline-variant/30 flex flex-col sm:flex-row">
              <div className="relative sm:w-1/2 h-48 sm:h-auto min-h-[200px]">
                <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                <span className="absolute top-space-xs left-space-xs px-space-xs py-1 rounded-full bg-surface/90 backdrop-blur-md text-primary text-label-sm font-semibold shadow-sm">
                  Up to {v.capacity} Guests
                </span>
              </div>
              <div className="p-space-md sm:p-space-lg flex flex-col justify-between sm:w-1/2 gap-space-xs">
                <div>
                  <h3 className="font-display text-headline-sm text-primary font-bold">{v.name}</h3>
                  <p className="text-body-sm text-on-surface-variant mt-1 leading-relaxed">{v.description}</p>
                </div>
                <div className="flex flex-wrap gap-space-2xs pt-space-2xs">
                  {v.inclusions.map((inc) => (
                    <span key={inc} className="text-label-sm px-space-xs py-1 rounded-full bg-secondary-container text-on-secondary-container font-medium">
                      {inc}
                    </span>
                  ))}
                </div>
                <a
                  href={`https://wa.me/91${whatsappNum}`}
                  className="mt-space-xs text-center py-space-sm rounded-full bg-primary hover:bg-primary/90 text-surface font-label-md font-bold tracking-wide shadow-md active:scale-95 transition-all"
                >
                  Inquire for Banquet Booking
                </a>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 7. MEET YOUR HOST / HOSPITALITY LEADERSHIP SECTION */}
      <section className="flex flex-col gap-space-md">
        <div className="flex flex-col">
          <span className="text-label-sm text-secondary font-bold uppercase tracking-widest">Personal Care &amp; Hospitality</span>
          <h2 className="font-display text-headline-md text-primary">Meet Your Host</h2>
        </div>

        <div className="p-space-md sm:p-space-lg rounded-3xl bg-surface-container-lowest border border-outline-variant/30 shadow-lg flex flex-col sm:flex-row gap-space-md items-center">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary/20 shadow-md">
            <img src={HOST_AVATAR} alt="Sudha Hotel Host & Manager" className="w-full h-full object-cover" />
            <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-secondary border-2 border-surface flex items-center justify-center text-white">
              <Icon name="check" className="text-[14px]" />
            </span>
          </div>

          <div className="flex flex-col gap-space-2xs flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="font-display text-headline-sm text-primary font-bold">On-Site Host &amp; Manager</h3>
              <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-label-sm font-semibold">
                Verified Local
              </span>
            </div>
            <span className="text-label-sm text-on-surface-variant font-medium">Sudha Hotel Leadership</span>
            <p className="text-body-sm text-on-surface-variant italic mt-1">
              &ldquo;Welcome to Sudha Hotel. Whether you are passing through for Chintpurni darshan or staying with family, our team is personally dedicated to making your Himachal visit comfortable and memorable.&rdquo;
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-space-xs pt-space-xs">
              <a
                href={`tel:${phoneNum}`}
                className="inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md font-semibold text-label-sm"
              >
                <Icon name="phone" className="text-[16px] text-terracotta" /> Direct Contact
              </a>
              <a
                href={`https://wa.me/91${whatsappNum}`}
                className="inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md font-semibold text-label-sm"
              >
                <Icon name="chat" className="text-[16px] text-secondary" /> WhatsApp Host
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. GUEST MEMORIES / REVIEWS SECTION */}
      <section id="reviews-section" className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-label-sm text-secondary font-bold uppercase tracking-widest">Traveler Voices</span>
            <h2 className="font-display text-headline-md text-primary">Guest Memories</h2>
          </div>
          <button
            onClick={() => setReviewOpen(true)}
            className="px-space-md py-space-xs rounded-full bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container text-label-md font-bold flex items-center gap-1 transition-colors"
          >
            <Icon name="rate_review" className="text-[16px]" /> + Review Us
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          {reviews.map((r) => (
            <div key={r._id} className="p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col gap-space-xs justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-label-md">
                  {r.guestName
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-label-md font-bold text-primary">{r.guestName}</p>
                  <p className="text-label-sm text-on-surface-variant">{r.subtitle}</p>
                </div>
              </div>
              <StarRating rating={r.rating} size={16} />
              <p className="text-body-sm text-on-surface-variant italic">&ldquo;{r.comment}&rdquo;</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-body-sm text-on-surface-variant col-span-2 text-center py-space-md">
              Be the first to share your Sudha Hotel experience.
            </p>
          )}
        </div>
      </section>

      {/* 9. LOCATION & ACCESS SECTION */}
      <section id="location-section" className="flex flex-col gap-space-md">
        <div className="flex flex-col">
          <span className="text-label-sm text-secondary font-bold uppercase tracking-widest">Find Sanctuary</span>
          <h2 className="font-display text-headline-md text-primary">Location &amp; Access</h2>
        </div>

        <div className="rounded-3xl overflow-hidden h-44 bg-surface-container-high relative border border-outline-variant/30 flex items-center justify-center group">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop"
            alt="Sudha Hotel Location Map Preview"
            className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-primary/30 backdrop-blur-[2px] flex items-center justify-center" />
          <a
            href="https://maps.google.com/?q=Sudha+Hotel+Amb+Una"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute px-space-md py-space-xs rounded-full bg-surface/90 text-primary font-label-md font-bold shadow-lg flex items-center gap-2 hover:bg-surface transition-colors"
          >
            <Icon name="map" className="text-[18px] text-terracotta" /> Open Google Maps
          </a>
        </div>

        <div className="flex items-center gap-space-xs p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
          <Icon name="pin_drop" className="text-primary text-[20px]" />
          <span className="text-body-sm text-on-surface-variant font-medium flex-1">
            {settings?.address || 'M4G9+P36 Una - Amb Rd, Pratap Nagar, Amb, HP 177203'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-space-xs">
          <a href={`tel:${phoneNum}`} className="p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1">
            <Icon name="phone_in_talk" className="text-primary text-[22px]" />
            <span className="text-label-sm text-on-surface-variant font-medium">Front Desk</span>
            <span className="text-label-md font-bold text-primary">{phoneNum}</span>
          </a>
          <a
            href={`https://wa.me/91${whatsappNum}`}
            className="p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1"
          >
            <Icon name="chat" className="text-primary text-[22px]" />
            <span className="text-label-sm text-on-surface-variant font-medium">WhatsApp</span>
            <span className="text-label-md font-bold text-primary">Quick Chat</span>
          </a>
        </div>

        <div className="p-space-md rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-space-xs">
          <span className="text-label-sm text-primary font-bold uppercase tracking-wider">Transit Reference:</span>
          {[
            ['train', 'Amb Andaura Railway Station: ~3.5 km'],
            ['temple_hindu', 'Chintpurni Mata Shrine: ~26 km'],
            ['flight', 'Gaggal Kangra Airport: ~88 km'],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-space-xs text-label-sm text-on-surface-variant">
              <Icon name={icon} className="text-[18px] text-terracotta" /> <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 10. MODALS */}
      {/* Menu Modal */}
      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="Sudha Kitchen · In-House Menu">
        <div className="flex flex-col gap-space-md max-h-[70vh] overflow-y-auto pr-1">
          {Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category} className="flex flex-col gap-space-xs">
              <h4 className="text-label-md uppercase tracking-widest text-secondary font-bold border-b border-outline-variant/40 pb-1">
                {category}
              </h4>
              {items.map((item) => (
                <div key={item._id} className="flex items-center justify-between py-space-xs border-b border-outline-variant/20">
                  <div>
                    <p className="text-label-md font-bold text-primary">{item.name}</p>
                    <p className="text-body-sm text-on-surface-variant">{item.description}</p>
                  </div>
                  <span className="text-label-md font-bold text-terracotta pl-2">₹{item.price}</span>
                </div>
              ))}
            </div>
          ))}
          <a
            href={`tel:${phoneNum}`}
            className="mt-space-sm text-center py-space-md rounded-full bg-primary text-surface font-label-lg font-bold shadow-md"
          >
            Call Kitchen Desk to Order
          </a>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Share Your Experience">
        <form onSubmit={handleReviewSubmit} className="flex flex-col gap-space-sm">
          <div>
            <label className="text-label-sm text-secondary uppercase font-bold">Your Name *</label>
            <input
              required
              value={reviewForm.guestName}
              onChange={(e) => setReviewForm({ ...reviewForm, guestName: e.target.value })}
              className="w-full mt-1 p-space-sm rounded-xl border border-outline-variant/40 bg-surface-container-low text-label-md font-semibold focus:outline-none"
              placeholder="e.g. Vikram Sharma"
            />
          </div>
          <div>
            <label className="text-label-sm text-secondary uppercase font-bold">Trip Context (optional)</label>
            <input
              value={reviewForm.subtitle}
              onChange={(e) => setReviewForm({ ...reviewForm, subtitle: e.target.value })}
              placeholder="e.g. Stayed with family · Delhi to Dharamshala trip"
              className="w-full mt-1 p-space-sm rounded-xl border border-outline-variant/40 bg-surface-container-low text-label-md focus:outline-none"
            />
          </div>
          <div>
            <label className="text-label-sm text-secondary uppercase font-bold">Rating *</label>
            <div className="mt-1">
              <StarRating rating={reviewForm.rating} onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} size={26} />
            </div>
          </div>
          <div>
            <label className="text-label-sm text-secondary uppercase font-bold">Your Feedback *</label>
            <textarea
              required
              rows={3}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="w-full mt-1 p-space-sm rounded-xl border border-outline-variant/40 bg-surface-container-low text-label-md focus:outline-none"
              placeholder="Tell us about your room, service, food, or location convenience..."
            />
          </div>
          {reviewMsg && <p className="text-label-md text-secondary font-semibold">{reviewMsg}</p>}
          <button type="submit" className="mt-space-xs py-space-md rounded-full bg-terracotta text-white font-label-lg font-bold shadow-md">
            Submit Verified Review
          </button>
        </form>
      </Modal>
    </main>
  );
}
