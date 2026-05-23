import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';
import { clearAuthStorage, getStoredAuthToken, isTokenValid } from '../../utils/auth';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const emptyOtp = Array.from({ length: OTP_LENGTH }, () => '');

const authHighlights = ['Fast OTP verification', 'Secure & private', 'JWT protected session'];

const getAuthRequestErrorMessage = (requestError, fallbackMessage) => {
  const responseMessage = requestError?.response?.data?.message;

  if (responseMessage) {
    return responseMessage;
  }

  if (requestError?.code === 'ERR_NETWORK' || requestError?.message?.includes('Network Error')) {
    return 'Unable to reach the auth server. Check that the backend is running and CORS allows this origin.';
  }

  return fallbackMessage;
};

const PhoneAuth = () => {
  const navigate = useNavigate();
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  const [mobileNumber, setMobileNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(emptyOtp);
  const [step, setStep] = useState('mobile');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [initializing, setInitializing] = useState(true);

  const normalizedMobile = useMemo(() => String(mobileNumber).replace(/\D/g, '').slice(0, 10), [mobileNumber]);
  const otpValue = useMemo(() => otpDigits.join(''), [otpDigits]);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    const token = getStoredAuthToken();

    if (token && isTokenValid(token)) {
      navigate('/', { replace: true });
      return () => clearTimer();
    }

    if (token && !isTokenValid(token)) {
      clearAuthStorage();
    }

    setInitializing(false);

    return () => clearTimer();
  }, []);

  useEffect(() => {
    if (timer <= 0) {
      clearTimer();
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setTimer((currentTimer) => {
        if (currentTimer <= 1) {
          clearTimer();
          return 0;
        }

        return currentTimer - 1;
      });
    }, 1000);

    return () => clearTimer();
  }, [timer]);

  const resetOtpState = () => {
    setOtpDigits(emptyOtp);
    setMessage('');
    setError('');
  };

  const validateMobile = () => {
    const strippedMobile = normalizedMobile;

    if (!strippedMobile) {
      setError('Please enter the mobile number to continue');
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(strippedMobile)) {
      setError('Mobile number you entered is invalid');
      return false;
    }

    setError('');
    return true;
  };

  const focusOtpBox = (index) => {
    otpRefs.current[index]?.focus?.();
  };

  const handleMobileChange = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(digitsOnly);

    if (error) {
      setError('');
    }
  };

  const handleSendOtp = async () => {
    if (!validateMobile()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await apiClient.post('/auth/send-otp', {
        mobile_number: normalizedMobile,
      });
      const generatedOtp = response?.data?.generated_otp;

      setStep('otp');
      setTimer(RESEND_SECONDS);
      resetOtpState();
      setMessage(generatedOtp ? `OTP sent successfully. Generated OTP is: ${generatedOtp} (haven't implemented twilio/fast2sms as they are paid services)` : 'OTP sent successfully');
      window.setTimeout(() => focusOtpBox(0), 0);
    } catch (requestError) {
      setError(getAuthRequestErrorMessage(requestError, 'Mobile number you entered is invalid'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);

    setOtpDigits((currentDigits) => {
      const nextDigits = [...currentDigits];
      nextDigits[index] = digit;
      return nextDigits;
    });

    if (digit && index < OTP_LENGTH - 1) {
      focusOtpBox(index + 1);
    }

    if (error) {
      setError('');
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      focusOtpBox(index - 1);
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pastedValue = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);

    if (!pastedValue) {
      return;
    }

    const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => pastedValue[index] || '');
    setOtpDigits(nextDigits);

    const nextFocusIndex = Math.min(pastedValue.length, OTP_LENGTH - 1);
    window.setTimeout(() => focusOtpBox(nextFocusIndex), 0);
  };

  const handleVerifyOtp = async () => {
    if (!otpValue) {
      setError('Please enter the OTP');
      return;
    }

    if (otpValue.length !== OTP_LENGTH) {
      setError('OTP you entered is invalid');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await apiClient.post('/auth/verify-otp', {
        mobile_number: normalizedMobile,
        otp: otpValue,
      });

      const token = response?.data?.token;
      const customer = response?.data?.customer;

      if (token) {
        localStorage.setItem('token', token);
      }

      if (customer) {
        localStorage.setItem('customer', JSON.stringify(customer));
        localStorage.setItem('customer_status', customer.status || 'OS');
      }

      const hasCompleteProfile = Boolean(
        customer?.status === 'AA' && customer?.name && customer?.age && customer?.gender
      );

      navigate(hasCompleteProfile ? '/' : '/register');
    } catch (requestError) {
      const responseMessage = requestError?.response?.data?.message || 'OTP you entered is invalid';
      setError(responseMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0 || resending) {
      return;
    }

    try {
      setResending(true);
      setError('');
      setMessage('');

      const response = await apiClient.post('/auth/send-otp', {
        mobile_number: normalizedMobile,
      });
      const generatedOtp = response?.data?.generated_otp;

      setOtpDigits(emptyOtp);
      setTimer(RESEND_SECONDS);
      setMessage(generatedOtp ? `OTP resent successfully. Generated OTP is: ${generatedOtp}` : 'OTP resent successfully');
      window.setTimeout(() => focusOtpBox(0), 0);
    } catch (requestError) {
      setError(getAuthRequestErrorMessage(requestError, 'Mobile number you entered is invalid'));
    } finally {
      setResending(false);
    }
  };

  const handleChangeMobileNumber = () => {
    setStep('mobile');
    setTimer(0);
    clearTimer();
    setOtpDigits(emptyOtp);
    setMessage('');
    setError('');
  };

  if (initializing) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-card">
          <div className="auth-spinner" />
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

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
              <div className="auth-brand__tagline">Premium Salon Booking Platform</div>
            </div>
          </div>

          <h1 className="auth-rail__title">
            Your beauty.
            <span>Our priority.</span>
          </h1>

          <p className="auth-rail__description">
            A clean, premium sign-in flow designed for fast booking and elegant salon experiences.
          </p>

          <div className="auth-mini-features">
            {authHighlights.map((item) => (
              <span key={item} className="auth-mini-feature">
                {item}
              </span>
            ))}
          </div>

          <div className="auth-rail__accent" />
        </aside>

        <main className="auth-flow-shell">
          <section className={`auth-flow-card auth-flow-card--${step}`}>
            <div className="auth-step">Step {step === 'mobile' ? '1' : '2'} of 2</div>

            {step === 'mobile' ? (
              <div className="auth-step-panel auth-step-panel--active">
                <h2 className="auth-card__title">Verify your phone</h2>
                <p className="auth-card__description">Enter your mobile number to receive a one-time password (OTP).</p>

                <div className="auth-field-group auth-field-group--phone">
                  <div className="auth-country-code">
                    <span>+91</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M7 10l5 5 5-5" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="Enter 10 digit mobile number"
                    value={mobileNumber}
                    onChange={handleMobileChange}
                    className="auth-input"
                  />
                </div>

                {error ? <div className="auth-alert auth-alert--error">{error}</div> : null}
                {message ? <div className="auth-alert auth-alert--success">{message}</div> : null}

                <button type="button" onClick={handleSendOtp} disabled={loading} className="auth-button auth-button--full">
                  <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
                  <span className="auth-button__arrow">→</span>
                </button>

                <div className="auth-note">
                  <span className="auth-note__icon">🔒</span>
                  <span>We will never share your number with anyone.</span>
                </div>
              </div>
            ) : null}

            {step === 'otp' ? (
              <div className="auth-step-panel auth-step-panel--active">
                <h2 className="auth-card__title">Enter OTP</h2>
                <p className="auth-card__description">
                  Enter the 6-digit code sent to <strong>+91 {normalizedMobile || '9876543210'}</strong>.
                </p>

                <div className="auth-countdown">
                  <span>Countdown</span>
                  <strong>{timer > 0 ? `Resend OTP in ${String(timer).padStart(2, '0')}` : 'You can resend now'}</strong>
                </div>

                <div className="auth-otp-grid">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={`otp-${index}`}
                      ref={(element) => {
                        otpRefs.current[index] = element;
                      }}
                      value={digit}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      onPaste={handleOtpPaste}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                      maxLength={1}
                      className="auth-otp-input"
                    />
                  ))}
                </div>

                {error ? <div className="auth-alert auth-alert--error">{error}</div> : null}
                {message ? <div className="auth-alert auth-alert--success">{message}</div> : null}

                <button type="button" onClick={handleVerifyOtp} disabled={loading} className="auth-button auth-button--full">
                  <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
                  <span className="auth-button__arrow">→</span>
                </button>

                <div className="auth-actions-row auth-actions-row--compact">
                  <button type="button" onClick={handleResendOtp} disabled={timer > 0 || resending} className="auth-secondary-button">
                    {resending ? 'Resending...' : 'Resend OTP'}
                  </button>
                  <button type="button" onClick={handleChangeMobileNumber} className="auth-link-button">
                    Change mobile number
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </main>
      </div>
    </div>
  );
};

export default PhoneAuth;