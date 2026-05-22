import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home';
import StylistSelection from './pages/StylistSelection';
import StylistList from './pages/StylistList';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subcategories" element={<StylistList />} />
        <Route path="/stylists" element={<StylistSelection />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar newestOnTop closeOnClick pauseOnHover />
    </>
  );
};

export default App;
