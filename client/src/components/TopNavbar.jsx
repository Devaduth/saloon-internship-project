import { useNavigate } from 'react-router-dom';
import { clearAuthStorage, getAuthLoginPath, getAuthSnapshot, getRoleNavigationItems } from '../utils/auth';

const TopNavbar = ({ active = 'Home', onNavigate }) => {
  const navigate = useNavigate();
  const { isAuthenticated, customer, role } = getAuthSnapshot();
  const navItems = getRoleNavigationItems(role);

  const handleLogout = () => {
    clearAuthStorage();
    navigate(getAuthLoginPath(role), { replace: true });
  };

  return (
    <header className="top-navbar desktop-only" aria-label="Desktop navigation">
      <div className="top-navbar__brand">
        <div className="top-navbar__logo">SB</div>
        <div>
          <div className="top-navbar__name">Salon Book</div>
          <div className="top-navbar__tagline">Modern booking experience</div>
        </div>
      </div>

      <nav className="top-navbar__links" aria-label="Primary">
        {isAuthenticated ? (
          <>
            {navItems.map((item) => (
              item.action === 'logout' ? (
                <button key={item.label} type="button" className="top-navbar__link top-navbar__link--logout" onClick={handleLogout}>
                  {item.label}
                </button>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  className={`top-navbar__link ${active === item.label ? 'active' : ''}`}
                  onClick={() => onNavigate?.(item.target)}
                >
                  {item.label}
                </button>
              )
            ))}
            {customer?.name ? <span className="top-navbar__badge">{customer.name}</span> : null}
          </>
        ) : (
          <button type="button" className="top-navbar__link top-navbar__link--login" onClick={() => navigate(getAuthLoginPath('customer'))}>
            Login
          </button>
        )}
      </nav>
    </header>
  );
};

export default TopNavbar;
