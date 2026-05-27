import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';
import { clearAuthStorage, getAuthRedirectPath, getStoredAuthRole, getStoredAuthToken, getStoredCustomer, isTokenValid, parseJwtPayload, storeAuthSession } from '../../utils/auth';

const authHighlights = ['Personalized recommendations', 'Faster booking experience', 'Exclusive offers & rewards'];

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = getStoredAuthToken();

    if (!token) {
      navigate('/auth', { replace: true });
      return;
    }

    if (!isTokenValid(token)) {
      clearAuthStorage();
      navigate('/auth', { replace: true });
      return;
    }

    const payload = parseJwtPayload(token);
    const role = getStoredAuthRole() || payload?.role || (payload?.customer_id ? 'customer' : '');

    if (role && role !== 'customer') {
      navigate(getAuthRedirectPath(role), { replace: true });
      return;
    }

    const storedCustomer = getStoredCustomer();

    if (storedCustomer?.status === 'AA' && storedCustomer?.name && storedCustomer?.age && storedCustomer?.gender) {
      navigate('/', { replace: true });
      return;
    }

    setInitializing(false);
  }, [navigate]);

  const validateForm = () => {
    const nextFieldErrors = {};
    const trimmedName = name.trim();
    const trimmedAge = String(age).trim();
    const normalizedAge = Number(trimmedAge);

    if (!trimmedName || !trimmedAge || !gender) {
      setErrorMessage('Please fill name, age, gender');
      setFieldErrors({
        name: trimmedName ? '' : 'Required',
        age: trimmedAge ? '' : 'Required',
        gender: gender ? '' : 'Required',
      });
      return null;
    }

    if (trimmedName.length < 3 || trimmedName.length > 20) {
      nextFieldErrors.name = 'Name must be between 3 and 20 characters';
    }

    if (!Number.isInteger(normalizedAge) || normalizedAge < 1 || normalizedAge > 146) {
      nextFieldErrors.age = 'Age you entered is invalid';
    }

    if (!['Male', 'Female', 'Other'].includes(gender)) {
      nextFieldErrors.gender = 'Please select a gender';
    }

    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      setErrorMessage(nextFieldErrors.age || nextFieldErrors.name || nextFieldErrors.gender || 'Please fill name, age, gender');
      return null;
    }

    setFieldErrors({});
    setErrorMessage('');
    return {
      name: trimmedName,
      age: normalizedAge,
      gender,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = validateForm();
    if (!payload) {
      return;
    }

    const token = getStoredAuthToken();
    if (!token) {
      navigate('/auth', { replace: true });
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await apiClient.post('/auth/register', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const customer = response?.data?.customer;

      if (customer) {
        storeAuthSession({ token, role: 'customer', userId: customer?._id || customer?.id || '', customer });
      }

      setSuccessMessage(response?.data?.message || 'You have successfully registered into the app');

      window.setTimeout(() => {
        navigate('/');
      }, 700);
    } catch (requestError) {
      const responseMessage = requestError?.response?.data?.message || 'Something went wrong while registering';
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
          <p>Loading registration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-page__backdrop auth-page__backdrop--one" />
      <div className="auth-page__backdrop auth-page__backdrop--two" />

      <div className="auth-page__layout auth-page__layout--compact">
        <aside className="auth-rail auth-rail--register">
          <div className="auth-brand auth-brand--compact">
            <div className="auth-brand__mark">✂</div>
            <div>
              <div className="auth-brand__name">SalonBook</div>
              <div className="auth-brand__tagline">Premium Salon Booking Platform</div>
            </div>
          </div>

          <button type="button" onClick={() => navigate('/auth')} className="auth-back-link">
            ← Back to login
          </button>

          <h1 className="auth-rail__title">
            Create your account.
            <span>Feel instantly at home.</span>
          </h1>

          <p className="auth-rail__description">
            Tell us just enough to personalize your booking experience and keep the flow fast.
          </p>

          <div className="auth-mini-features">
            {authHighlights.map((item) => (
              <span key={item} className="auth-mini-feature">
                {item}
              </span>
            ))}
          </div>

          <div className="auth-rail__accent auth-rail__accent--register" />
        </aside>

        <main className="auth-flow-shell auth-flow-shell--register">
          <section className="auth-flow-card auth-flow-card--register">
            <div className="auth-step">Step 2 of 2</div>
            <h2 className="auth-card__title">Create your account</h2>
            <p className="auth-card__description">Finish your profile to continue with a polished booking experience.</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-form__field">
                <span className="auth-form__label">Full name</span>
                <div className="auth-field-group">
                  <span className="auth-field-group__icon">👤</span>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your full name"
                    className="auth-input"
                  />
                </div>
                {fieldErrors.name ? <p className="auth-field-error">{fieldErrors.name}</p> : null}
              </label>

              <div className="auth-form__row">
                <label className="auth-form__field">
                  <span className="auth-form__label">Age</span>
                  <div className="auth-field-group">
                    <span className="auth-field-group__icon">🎂</span>
                    <input
                      id="age"
                      type="number"
                      min="1"
                      max="146"
                      value={age}
                      onChange={(event) => setAge(event.target.value)}
                      placeholder="Enter your age"
                      className="auth-input"
                    />
                  </div>
                  {fieldErrors.age ? <p className="auth-field-error">{fieldErrors.age}</p> : null}
                </label>

                <label className="auth-form__field">
                  <span className="auth-form__label">Gender</span>
                  <div className="auth-field-group">
                    <span className="auth-field-group__icon">⚲</span>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(event) => setGender(event.target.value)}
                      className="auth-input auth-select"
                    >
                      <option value="">Select your gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {fieldErrors.gender ? <p className="auth-field-error">{fieldErrors.gender}</p> : null}
                </label>
              </div>

              {errorMessage ? <div className="auth-alert auth-alert--error">{errorMessage}</div> : null}
              {successMessage ? <div className="auth-alert auth-alert--success">{successMessage}</div> : null}

              <button type="submit" disabled={loading} className="auth-button auth-button--full">
                {loading ? (
                  <span className="auth-loading-inline">
                    <span className="auth-spinner auth-spinner--small" />
                    Registering...
                  </span>
                ) : (
                  <>
                    Continue
                    <span className="auth-button__arrow">→</span>
                  </>
                )}
              </button>

              <div className="auth-note">
                <span className="auth-note__icon">🔒</span>
                <span>Your information is secure and private.</span>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Register;