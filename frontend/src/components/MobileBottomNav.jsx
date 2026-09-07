import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import Icon from './Icon';

const items = [
  { to: '/', icon: 'explore', label: 'Discover', end: true },
  { to: '/rooms', icon: 'bed', label: 'Rooms' },
  { to: '/dining', icon: 'restaurant', label: 'Dining' },
  { to: '/gallery', icon: 'photo_library', label: 'Gallery' },
];

export default function MobileBottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 w-full z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/40 pb-safe">
        <div className="grid grid-cols-5 max-w-container-max mx-auto">
          {items.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-space-xs text-label-sm ${
                  isActive ? 'text-primary font-semibold' : 'text-on-surface-variant'
                }`
              }
            >
              <Icon name={item.icon} className="text-[22px]" />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center gap-0.5 py-space-xs text-label-sm ${
              moreOpen ? 'text-primary font-semibold' : 'text-on-surface-variant'
            }`}
          >
            <Icon name="more_horiz" className="text-[22px]" />
            More
          </button>
        </div>
      </nav>

      {/* More Options Drawer / Overlay */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setMoreOpen(false)}>
          <div className="w-full bg-surface-container-lowest rounded-t-2xl p-space-md shadow-2xl flex flex-col gap-space-md border-t border-outline-variant/40" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-xs">
              <span className="font-display text-title-md text-primary font-bold">More Information &amp; Support</span>
              <button onClick={() => setMoreOpen(false)} className="p-1 text-on-surface-variant hover:text-primary">
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-space-xs">
              <Link to="/gallery" onClick={() => setMoreOpen(false)} className="flex items-center gap-space-xs p-space-xs rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-label-md">
                <Icon name="photo_library" className="text-[20px] text-terracotta" /> Photo Gallery
              </Link>
              <a href="/#restaurant-section" onClick={() => setMoreOpen(false)} className="flex items-center gap-space-xs p-space-xs rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-label-md">
                <Icon name="restaurant_menu" className="text-[20px] text-terracotta" /> Kitchen Menu
              </a>
              <a href="/#banquet-section" onClick={() => setMoreOpen(false)} className="flex items-center gap-space-xs p-space-xs rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-label-md">
                <Icon name="celebration" className="text-[20px] text-terracotta" /> Banquets &amp; Lawn
              </a>
              <a href="/#reviews-section" onClick={() => setMoreOpen(false)} className="flex items-center gap-space-xs p-space-xs rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-label-md">
                <Icon name="star" className="text-[20px] text-terracotta" /> Guest Reviews
              </a>
            </div>

            <div className="pt-space-xs border-t border-outline-variant/30 flex items-center justify-between text-body-sm text-on-surface-variant">
              <span>Hotel Management &amp; Reception Desk</span>
              <Link to="/admin/login" onClick={() => setMoreOpen(false)} className="inline-flex items-center gap-1 text-label-sm font-semibold text-secondary hover:underline">
                <Icon name="lock" className="text-[14px]" /> Staff Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

