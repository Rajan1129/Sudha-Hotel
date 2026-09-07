import { Link } from 'react-router-dom';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';

export default function AdminHeader({ title, subtitle }) {
  const { admin, logout } = useAuth();

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl shadow-sm">
      <div className="h-16 px-gutter-mobile flex items-center justify-between max-w-container-max mx-auto">
        <Link to="/admin/dashboard" className="flex items-center gap-space-xs">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-surface font-display font-bold text-lg">
            S
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-headline-sm text-primary">Sudha</span>
            <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">Boutique Hotel</span>
          </div>
        </Link>
        <div className="flex items-center gap-space-sm">
          <div className="flex flex-col items-end">
            <span className="text-label-sm text-on-surface-variant">Welcome</span>
            <span className="text-label-md font-semibold text-primary">{admin?.name || 'Admin'}</span>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant"
          >
            <Icon name="logout" className="text-[18px]" />
          </button>
        </div>
      </div>
      {(title || subtitle) && (
        <div className="px-gutter-mobile pb-space-sm max-w-container-max mx-auto flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span
              className={`px-space-xs py-0.5 rounded-full text-label-sm font-semibold ${
                admin?.role === 'super_admin' ? 'bg-tertiary-container text-white' : 'bg-secondary-container text-on-secondary-container'
              }`}
            >
              {admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </span>
            <span className="text-label-sm text-secondary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /> Live Console
            </span>
          </div>
          <Link to="/" className="text-label-sm text-terracotta font-semibold flex items-center gap-1">
            View Public Site <Icon name="open_in_new" className="text-[14px]" />
          </Link>
        </div>
      )}
    </header>
  );
}
