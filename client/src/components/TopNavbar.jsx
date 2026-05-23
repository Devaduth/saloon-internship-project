import { useNavigate } from 'react-router-dom';
import { clearAuthStorage, getAuthSnapshot } from '../utils/auth';

const TopNavbar = ({ active = 'Home', onNavigate }) => {
  const navigate = useNavigate();
  const { isAuthenticated, customer } = getAuthSnapshot();

  const handleLogout = () => {
    clearAuthStorage();
    navigate('/auth', { replace: true });
  };

  return (
    <header className="top-navbar desktop-only" aria-label="Desktop navigation">
      <div className="top-navbar__brand">
        <div>
          <div className="top-navbar__name">Salon Book</div>
          <div className="top-navbar__tagline">Modern booking experience</div>
        </div>
      </div>

      <nav className="top-navbar__links" aria-label="Primary">
        {isAuthenticated ? (
          <>
            <button
              type="button"
              className={`top-navbar__link ${active === 'Home' ? 'active' : ''}`}
              onClick={() => onNavigate?.('/')}
            >
              Home
            </button>
            <button type="button" className="top-navbar__link" onClick={() => onNavigate?.('/orders')}>
              Orders
            </button>
            <button type="button" className="top-navbar__link" onClick={() => onNavigate?.('/profile')}>
              Profile
            </button>
            <button type="button" className="top-navbar__link top-navbar__link--logout" onClick={handleLogout}>
              Logout
            </button>
            {customer?.name ? <span className="top-navbar__badge">{customer.name}</span> : null}
          </>
        ) : (
          <button type="button" className="top-navbar__link top-navbar__link--login" onClick={() => navigate('/auth')}>
            Login
          </button>
        )}
      </nav>
    </header>
  );
};

export default TopNavbar;