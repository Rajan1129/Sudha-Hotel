import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireSuperAdmin = false }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="text-body-md text-on-surface-variant">Loading...</span>
      </div>
    );
  }
  if (!admin) return <Navigate to="/admin/login" replace />;
  if (requireSuperAdmin && admin.role !== 'super_admin') return <Navigate to="/admin/dashboard" replace />;
  return children;
}
