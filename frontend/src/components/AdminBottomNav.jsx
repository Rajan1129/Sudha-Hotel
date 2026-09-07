import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';

export default function AdminBottomNav() {
  const { admin } = useAuth();
  const location = useLocation();

  const items = [
    { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/admin/console', icon: 'admin_panel_settings', label: 'Console' },
    { to: '/admin/console#rooms', icon: 'bed', label: 'Rooms' },
    { to: '/admin/console#menu', icon: 'restaurant_menu', label: 'Menu' },
  ];

  const currentPath = location.pathname + location.hash;

  return (
    <nav className="fixed bottom-0 w-full z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/40 pb-safe">
      <div className="grid max-w-container-max mx-auto" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const isActive = currentPath === item.to || (item.to === '/admin/console' && location.pathname === '/admin/console' && !location.hash);
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 py-space-xs text-label-sm ${
                isActive ? 'text-primary font-semibold' : 'text-on-surface-variant'
              }`}
            >
              <Icon name={item.icon} className="text-[22px]" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
