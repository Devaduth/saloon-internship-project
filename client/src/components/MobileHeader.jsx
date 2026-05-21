const MobileHeader = ({ title, showBack = false, showMenu = false, onBack, centerTitle = false }) => {
  return (
    <header className="mobile-header">
      <div className="mobile-header__bar">
        {showBack ? (
          <button type="button" className="icon-button" onClick={onBack} aria-label="Go back">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <div className="header-spacer" />
        )}

        <div className={`mobile-header__title ${centerTitle ? 'mobile-header__title--centered' : ''}`}>{title}</div>

        {showMenu ? (
          <button type="button" className="icon-button" aria-label="Notifications">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 17H9a3 3 0 0 0 6 0zm4-1H5l1.3-1.7A4.9 4.9 0 0 0 7 12V9a5 5 0 1 1 10 0v3a4.9 4.9 0 0 0 .7 2.3z" />
            </svg>
          </button>
        ) : (
          <div className="header-spacer" />
        )}
      </div>
    </header>
  );
};

export default MobileHeader;