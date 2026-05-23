import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearAuthStorage, getStoredAuthToken, isTokenValid } from '../utils/auth';

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getStoredAuthToken();

    if (!token || !isTokenValid(token)) {
      clearAuthStorage();
      navigate('/auth', { replace: true, state: { from: location.pathname } });
      return;
    }

    setChecking(false);
  }, [location.pathname, navigate]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8f3] px-6 text-center text-[#2f1b10]">
        <div>
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#ffd2ae] border-t-[#ff7a18]" />
          <p className="mt-4 text-sm font-medium text-[#7f6658]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;