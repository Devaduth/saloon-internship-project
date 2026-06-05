import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './components/ProtectedRoute';
import AppointmentConfirmation from './pages/AppointmentConfirmation';
import AdminHome from './pages/admin/AdminHome';
import CustomerBookings from './pages/CustomerBookings';
import CustomerProfile from './pages/CustomerProfile';
import Home from './pages/Home';
import PaymentGateway from './pages/PaymentGateway';
import PhoneAuth from './pages/auth/PhoneAuth';
import Register from './pages/auth/Register';
import StaffHome from './pages/staff/StaffHome';
import StaffDashboard from './pages/staff/StaffDashboard';
import StylistSelection from './pages/StylistSelection';
import StylistList from './pages/StylistList';
import LuxuryCursor from './components/LuxuryCursor';

const App = () => {
  return (
    <div className="app-shell w-full overflow-x-hidden">
      <LuxuryCursor />
      <Routes>
        <Route path="/login" element={<PhoneAuth />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/auth/*" element={<Navigate to="/login" replace />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/staff/login" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/stylists" element={<StylistList />} />
          <Route path="/services" element={<StylistSelection />} />
          <Route path="/booking" element={<AppointmentConfirmation />} />
          <Route path="/payment" element={<PaymentGateway />} />
          <Route path="/cart" element={<Navigate to="/booking" replace />} />
          <Route path="/bookings" element={<CustomerBookings />} />
          <Route path="/orders" element={<Navigate to="/bookings" replace />} />
          <Route path="/profile" element={<CustomerProfile />} />
          <Route path="/subcategories" element={<Navigate to="/stylists" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/dashboard" element={<AdminHome />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
          <Route path="/staff" element={<StaffHome />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar newestOnTop closeOnClick pauseOnHover />
    </div>
  );
};

export default App;
