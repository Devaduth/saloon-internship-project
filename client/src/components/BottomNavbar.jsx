const navItems = [
  { label: 'Home', icon: 'home' },
  { label: 'My order', icon: 'order' },
  { label: 'Message', icon: 'message' },
  { label: 'Account', icon: 'account' },
];

const iconPaths = {
  home: 'M4 11.5L12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z',
  order: 'M7 6h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm2 3h6m-6 3h6m-6 3h4',
  message: 'M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  account: 'M12 12.5a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-6.5 7.5a6.5 6.5 0 0 1 13 0',
};

const BottomNavbar = ({ active = 'Home', onNavigate }) => {
  return (
    <nav className="bottom-navbar" aria-label="Primary navigation">
      {navItems.map((item) => {
        const isActive = active === item.label;

        return (
          <button key={item.label} type="button" className={`bottom-nav-item ${isActive ? 'active' : ''}`} onClick={() => onNavigate?.(item.label)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={iconPaths[item.icon]} />
            </svg>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavbar;