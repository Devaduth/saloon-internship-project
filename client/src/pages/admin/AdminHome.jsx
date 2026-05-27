import { useNavigate } from 'react-router-dom';
import { clearAuthStorage } from '../../utils/auth';

const AdminHome = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthStorage();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-page__layout auth-page__layout--compact">
        <main className="auth-flow-shell">
          <section className="auth-flow-card auth-flow-card--register">
            <div className="auth-step">Admin panel</div>
            <h2 className="auth-card__title">Salon management</h2>
            <p className="auth-card__description">You are signed in as admin. Use this space for salon, staff, and booking controls.</p>

            <div className="auth-form">
              <button type="button" className="auth-button auth-button--full" onClick={() => navigate('/salons')}>
                Open salon listings <span className="auth-button__arrow">→</span>
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

export default AdminHome;
