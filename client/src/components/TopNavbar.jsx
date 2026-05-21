const navItems = [
  { label: 'Home', target: '/' },
  { label: 'Categories', target: '/subcategories' },
  { label: 'Account', target: '/' },
];

const TopNavbar = ({ active = 'Home', onNavigate }) => {
  return (
    <header className="top-navbar desktop-only" aria-label="Desktop navigation">
      <div className="top-navbar__brand">
        <span className="top-navbar__logo">S</span>
        <div>
          <div className="top-navbar__name">Salon Book</div>
          <div className="top-navbar__tagline">Modern booking experience</div>
        </div>
      </div>

      <nav className="top-navbar__links" aria-label="Primary">
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`top-navbar__link ${active === item.label ? 'active' : ''}`}
            onClick={() => onNavigate?.(item.target)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default TopNavbar;