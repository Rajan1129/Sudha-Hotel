import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const admin = await login(username, password);
      navigate(admin.role === 'super_admin' ? '/admin/console' : '/admin/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-gutter-mobile bg-primary-container">
      <div className="w-full max-w-sm p-space-xl rounded-2xl bg-surface-container-lowest shadow-2xl flex flex-col gap-space-md">
        <div className="flex flex-col items-center gap-space-xs">
          <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-surface font-display font-bold text-2xl">
            S
          </div>
          <h1 className="font-display text-headline-sm text-primary">Sudha Hotel Management Portal</h1>
          <p className="text-body-sm text-on-surface-variant text-center">Amb &amp; Una District Sanctuary Operations</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-space-sm">
          <div>
            <label className="text-label-sm text-secondary uppercase font-bold">Username</label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40"
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-label-sm text-secondary uppercase font-bold">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/40"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-body-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-space-xs py-space-sm rounded-full bg-primary text-surface font-label-lg font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Icon name="lock_open" className="text-[18px]" />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-label-sm text-on-surface-variant text-center">
          Seeded accounts: <strong>admin</strong> / <strong>superadmin</strong> — see backend .env for passwords.
        </p>
      </div>
    </main>
  );
}
