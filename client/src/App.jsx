import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './components/ProtectedRoute';
import AppointmentConfirmation from './pages/AppointmentConfirmation';
import AdminHome from './pages/admin/AdminHome';
import Home from './pages/Home';
import AdminLogin from './pages/auth/AdminLogin';
import PhoneAuth from './pages/auth/PhoneAuth';
import Register from './pages/auth/Register';
import StaffHome from './pages/staff/StaffHome';
import StaffLogin from './pages/auth/StaffLogin';
import SalonList from './pages/SalonList';
import SalonProfile from './pages/SalonProfile';
import StylistSelection from './pages/StylistSelection';
import StylistList from './pages/StylistList';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/auth" element={<PhoneAuth />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/salons" element={<SalonList />} />
        <Route path="/salons/:id" element={<SalonProfile />} />
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/stylists" element={<StylistList />} />
          <Route path="/services" element={<StylistSelection />} />
          <Route path="/booking" element={<AppointmentConfirmation />} />
          <Route path="/cart" element={<Navigate to="/booking" replace />} />
          <Route path="/orders" element={<Navigate to="/" replace />} />
          <Route path="/profile" element={<Navigate to="/" replace />} />
          <Route path="/subcategories" element={<Navigate to="/stylists" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminHome />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
          <Route path="/staff" element={<StaffHome />} />
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar newestOnTop closeOnClick pauseOnHover />
    </>
  );
};

export default App;
