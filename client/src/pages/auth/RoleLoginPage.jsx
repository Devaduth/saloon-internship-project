import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';
import { clearAuthStorage, getAuthRedirectPath, getStoredAuthRole, getStoredAuthToken, isTokenValid, parseJwtPayload, storeAuthSession } from '../../utils/auth';

const authHighlights = {
  admin: ['Salon control center', 'Manage bookings & staff', 'Secure admin access'],
  staff: ['Daily appointment view', 'Fast staff sign-in', 'Protected workspace'],
};

const RoleLoginPage = ({ role = 'admin' }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = getStoredAuthToken();

    if (token && isTokenValid(token)) {
      const payload = parseJwtPayload(token);
      const existingRole = getStoredAuthRole() || payload?.role || (payload?.customer_id ? 'customer' : '');
      navigate(getAuthRedirectPath(existingRole), { replace: true });
      return;
    }

    if (token && !isTokenValid(token)) {
      clearAuthStorage();
    }

    setInitializing(false);
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await apiClient.post(`/${role}/login`, {
        email: email.trim(),
        password: password.trim(),
      });

      const token = response?.data?.token || '';
      const user = response?.data?.user || null;
      const userRole = response?.data?.role || role;

      storeAuthSession({
        token,
        role: userRole,
        userId: user?._id || user?.id || '',
        user,
      });

      navigate(getAuthRedirectPath(userRole), { replace: true });
    } catch (requestError) {
      const responseMessage = requestError?.response?.data?.message || `Unable to sign in as ${role}`;
      setErrorMessage(responseMessage);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-card">
          <div className="auth-spinner" />
          <p>Loading login...</p>
        </div>
      </div>
    );
  }

  const roleLabel = role === 'admin' ? 'Admin' : 'Staff';

  return (
    <div className="auth-page">
      <div className="auth-page__backdrop auth-page__backdrop--one" />
      <div className="auth-page__backdrop auth-page__backdrop--two" />

      <div className="auth-page__layout auth-page__layout--compact">
        <aside className="auth-rail">
          <div className="auth-brand auth-brand--compact">
            <div className="auth-brand__mark">✂</div>
            <div>
              <div className="auth-brand__name">SalonBook</div>
              <div className="auth-brand__tagline">{roleLabel} Access</div>
            </div>
          </div>

          <h1 className="auth-rail__title">
            {roleLabel} login.
            <span>Premium access.</span>
          </h1>

          <p className="auth-rail__description">
            Sign in with your work email and password to access the {role} workspace.
          </p>

          <div className="auth-mini-features">
            {(authHighlights[role] || authHighlights.admin).map((item) => (
              <span key={item} className="auth-mini-feature">
                {item}
              </span>
            ))}
          </div>

          <div className="auth-rail__accent" />
        </aside>

        <main className="auth-flow-shell">
          <section className="auth-flow-card auth-flow-card--register">
            <div className="auth-step">Secure login</div>
            <h2 className="auth-card__title">Welcome back</h2>
            <p className="auth-card__description">Enter your credentials to continue.</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-form__field">
                <span className="auth-form__label">Work email</span>
                <div className="auth-field-group">
                  <span className="auth-field-group__icon">✉</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@salon.com"
                    className="auth-input"
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="auth-form__field">
                <span className="auth-form__label">Password</span>
                <div className="auth-field-group">
                  <span className="auth-field-group__icon">🔑</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    className="auth-input"
                    autoComplete="current-password"
                  />
                </div>
              </label>

              {errorMessage ? <div className="auth-alert auth-alert--error">{errorMessage}</div> : null}

              <button type="submit" disabled={loading} className="auth-button auth-button--full">
                {loading ? `Signing in as ${roleLabel}...` : `Sign in as ${roleLabel}`}
                <span className="auth-button__arrow">→</span>
              </button>

              <button type="button" className="auth-back-link" onClick={() => navigate('/auth')}>
                ← Back to customer login
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default RoleLoginPage;
