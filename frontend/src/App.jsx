import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MobileBottomNav from './components/MobileBottomNav';
import StickyBookingBar from './components/StickyBookingBar';
import AdminHeader from './components/AdminHeader';
import AdminBottomNav from './components/AdminBottomNav';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Dining from './pages/Dining';
import Gallery from './pages/Gallery';
import Checkout from './pages/Checkout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import MasterAdminConsole from './pages/MasterAdminConsole';

function PublicLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <StickyBookingBar />
      <MobileBottomNav />
    </>
  );
}

function AdminLayout({ children }) {
  return (
    <>
      <AdminHeader title />
      {children}
      <AdminBottomNav />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
      <Route
        path="/rooms"
        element={
          <PublicLayout>
            <Rooms />
          </PublicLayout>
        }
      />
      <Route
        path="/dining"
        element={
          <PublicLayout>
            <Dining />
          </PublicLayout>
        }
      />
      <Route
        path="/gallery"
        element={
          <PublicLayout>
            <Gallery />
          </PublicLayout>
        }
      />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/console"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <MasterAdminConsole />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
    </Routes>
  );
}
