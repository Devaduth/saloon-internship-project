import { useNavigate } from 'react-router-dom';
import { clearAuthStorage } from '../../utils/auth';

const StaffHome = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthStorage();
    navigate('/staff/login', { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-page__layout auth-page__layout--compact">
        <main className="auth-flow-shell">
          <section className="auth-flow-card auth-flow-card--register">
            <div className="auth-step">Staff workspace</div>
            <h2 className="auth-card__title">Daily appointments</h2>
            <p className="auth-card__description">You are signed in as staff. Use this area for schedule visibility and handling bookings.</p>

            <div className="auth-form">
              <button type="button" className="auth-button auth-button--full" onClick={() => navigate('/booking')}>
                Open booking flow <span className="auth-button__arrow">→</span>
              </button>
              <button type="button" className="auth-button auth-button--full" onClick={handleLogout}>
                Logout <span className="auth-button__arrow">→</span>
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default StaffHome;
