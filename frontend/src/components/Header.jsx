import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';

const LABELS = {
  '/': 'Home',
  '/rooms': 'Rooms',
  '/dining': 'Dining',
  '/gallery': 'Photo Gallery',
  '/checkout': 'Checkout',
};

export default function Header() {
  const location = useLocation();
  const label = LABELS[location.pathname] || 'Sudha Hotel';

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-gutter-mobile flex items-center justify-between gap-space-xs max-w-container-max mx-auto">
        <Link to="/" className="flex items-center gap-space-xs">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-surface font-display font-bold text-lg">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-display text-headline-sm text-primary tracking-tight leading-none">Sudha</span>
            <span className="text-label-sm uppercase tracking-widest text-on-surface-variant leading-tight">
              Boutique Hotel
            </span>
          </div>
        </Link>
        <div className="hidden sm:flex items-center gap-space-md">
          <Link to="/" className={`text-label-md font-semibold ${location.pathname === '/' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>Home</Link>
          <Link to="/rooms" className={`text-label-md font-semibold ${location.pathname === '/rooms' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>Rooms</Link>
          <Link to="/dining" className={`text-label-md font-semibold ${location.pathname === '/dining' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>Dining</Link>
          <Link to="/gallery" className={`text-label-md font-semibold ${location.pathname === '/gallery' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>Gallery</Link>
        </div>
        <div className="flex items-center gap-space-xs">
          <div className="flex flex-col items-end pr-space-2xs">
            <span className="text-label-sm text-on-surface-variant font-medium">Welcome</span>
            <span className="text-label-md text-primary font-semibold truncate max-w-[120px]">{label}</span>
          </div>
          <Link
            to="/admin/login"
            className="relative flex items-center justify-center p-space-2xs rounded-full hover:bg-surface-variant/40 min-w-[44px] min-h-[44px] transition-colors"
            title="Admin Portal"
          >
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <Icon name="person" className="text-[18px]" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
