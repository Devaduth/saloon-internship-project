import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AppointmentConfirmation from './pages/AppointmentConfirmation';
import Home from './pages/Home';
import StylistSelection from './pages/StylistSelection';
import StylistList from './pages/StylistList';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stylists" element={<StylistList />} />
        <Route path="/services" element={<StylistSelection />} />
        <Route path="/booking" element={<AppointmentConfirmation />} />
        <Route path="/cart" element={<AppointmentConfirmation />} />
        <Route path="/subcategories" element={<Navigate to="/stylists" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar newestOnTop closeOnClick pauseOnHover />
    </>
  );
};

export default App;
