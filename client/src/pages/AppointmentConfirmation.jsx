import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BottomNavbar from '../components/BottomNavbar';
import ChatModal from '../components/ChatModal';
import ConfirmBookingButton from '../components/ConfirmBookingButton';
import ContactActions from '../components/ContactActions';
import DateTimePicker from '../components/DateTimePicker';
import MobileHeader from '../components/MobileHeader';
import PriceSummary from '../components/PriceSummary';
import ServiceList from '../components/ServiceList';
import StylistInfoCard from '../components/StylistInfoCard';
import TopNavbar from '../components/TopNavbar';
import { getAppointmentById, updateAppointment } from '../services/appointmentService';
import { getStylistDetails } from '../services/stylistService';
import { getCustomerId } from '../utils/customerIdentity';

const todayInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const splitDateTime = (value = '') => {
  if (!value) {
    return { date: '', time: '' };
  }

  const dateValue = new Date(value);

  if (Number.isNaN(dateValue.getTime())) {
    return { date: '', time: '' };
  }

  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, '0');
  const day = String(dateValue.getDate()).padStart(2, '0');
  const hours = String(dateValue.getHours()).padStart(2, '0');
  const minutes = String(dateValue.getMinutes()).padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
};

const parseDurationToMinutes = (duration = '') => {
  const value = String(duration).trim().toLowerCase();

  if (!value) {
    return 0;
  }

  const hourMatch = value.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)/);
  if (hourMatch) {
    return Math.round(Number.parseFloat(hourMatch[1]) * 60);
  }

  const minuteMatch = value.match(/(\d+)\s*(m|min|mins|minute|minutes)/);
  if (minuteMatch) {
    return Number.parseInt(minuteMatch[1], 10);
  }

  return 0;
};

const formatMinutes = (minutes = 0) => {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (!hours && !remainingMinutes) {
    return '0 min';
  }

  if (!hours) {
    return `${remainingMinutes} min`;
  }

  if (!remainingMinutes) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }

  return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} min`;
};

const normalizeService = (service) => ({
  id: service?.id || service?.service_id || service?.name || service?.service_name || '',
  name: service?.name || service?.service_name || '',
  service_name: service?.service_name || service?.name || '',
  duration: service?.duration || '',
  price: Number(service?.price || 0),
});

const AppointmentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const appointmentId = location.state?.appointment_id || '';
  const customerId = getCustomerId(location.state?.customer_id || '');
  const createdBy = location.state?.created_by || customerId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [stylist, setStylist] = useState(null);
  const [selectedServices, setSelectedServices] = useState(
    () => location.state?.selected_services?.map(normalizeService).filter((service) => service.id || service.name) || []
  );
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [customerAddress, setCustomerAddress] = useState(location.state?.customer_address || localStorage.getItem('salonCustomerAddress') || '');
  const [addressEditing, setAddressEditing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadBooking = async () => {
      if (!appointmentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const appointmentResult = await getAppointmentById(appointmentId);
        const appointmentData = appointmentResult?.data || null;

        if (!mounted) {
          return;
        }

        setAppointment(appointmentData);

        const bookingServices = Array.isArray(appointmentData?.selected_services)
          ? appointmentData.selected_services.map(normalizeService).filter((service) => service.id || service.name)
          : [];

        if (bookingServices.length) {
          setSelectedServices(bookingServices);
        }

        if (appointmentData?.appointment_date_time) {
          const splitValue = splitDateTime(appointmentData.appointment_date_time);
          setAppointmentDate(splitValue.date);
          setAppointmentTime(splitValue.time);
        }

        if (appointmentData?.customer_address) {
          setCustomerAddress(appointmentData.customer_address);
        }

        const stylistId = appointmentData?.stylist_id || location.state?.stylist_id || '';
        if (stylistId) {
          const stylistResult = await getStylistDetails(stylistId);
          if (mounted) {
            setStylist(stylistResult?.data || null);
          }
        }
      } catch {
        if (mounted) {
          setStylist(location.state?.stylist || null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBooking();

    return () => {
      mounted = false;
    };
  }, [appointmentId, location.state?.stylist]);

  const normalizedServices = useMemo(
    () => (selectedServices.length ? selectedServices : location.state?.selected_services?.map(normalizeService).filter(Boolean) || []),
    [location.state?.selected_services, selectedServices]
  );

  const totalPrice = useMemo(
    () => normalizedServices.reduce((sum, service) => sum + Number(service.price || 0), 0),
    [normalizedServices]
  );

  const totalDuration = useMemo(() => {
    const totalMinutes = normalizedServices.reduce((sum, service) => sum + parseDurationToMinutes(service.duration), 0);
    return formatMinutes(totalMinutes);
  }, [normalizedServices]);

  const minDate = todayInputValue();
  const branchName = stylist?.branch_name || appointment?.branch_id || location.state?.branch_id || 'Salon branch';
  const area = stylist?.area || location.state?.area_id || appointment?.area_id || 'Near you';
  const city = stylist?.city || location.state?.city_id || appointment?.city_id || 'Bangalore';

  const buildDateTime = () => {
    if (!appointmentDate || !appointmentTime) {
      return null;
    }

    const combinedValue = new Date(`${appointmentDate}T${appointmentTime}`);
    return Number.isNaN(combinedValue.getTime()) ? null : combinedValue;
  };

  const handleSaveAddress = () => {
    const trimmedAddress = customerAddress.trim();
    setCustomerAddress(trimmedAddress);
    localStorage.setItem('salonCustomerAddress', trimmedAddress);
    setAddressEditing(false);
    toast.success('Address updated successfully.');
  };

  const handleCallStylist = () => {
    const phone = stylist?.phone || location.state?.phone;

    if (!phone) {
      toast.error('Stylist contact is not available yet.');
      return;
    }

    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  const handleConfirmBooking = async () => {
    if (!navigator.onLine) {
      toast.error('Mobile not connected to internet');
      return;
    }

    const dateTimeValue = buildDateTime();

    if (!dateTimeValue) {
      toast.error('Please enter the Date and Time to confirm');
      return;
    }

    if (dateTimeValue.getTime() < Date.now()) {
      toast.error('Please enter a valid Date and Time');
      return;
    }

    if (!appointmentId) {
      toast.error('No appointment was created on the previous screen.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        appointment_date_time: dateTimeValue.toISOString(),
        customer_address: customerAddress.trim(),
        selected_services: normalizedServices,
        total_price: totalPrice,
        total_duration: totalDuration,
        modified_by: createdBy,
        status: 'IA',
        stylist_id: stylist?.id || location.state?.stylist_id || appointment?.stylist_id || '',
        branch_id: stylist?.branch_id || location.state?.branch_id || appointment?.branch_id || '',
        city_id: stylist?.city_id || location.state?.city_id || appointment?.city_id || '',
        area_id: stylist?.area_id || location.state?.area_id || appointment?.area_id || '',
        state_id: stylist?.state_id || location.state?.state_id || appointment?.state_id || '',
      };

      const response = await updateAppointment(appointmentId, payload);
      setAppointment(response?.data || appointment);
      setSuccessMessage('You have successfully sent a request to Stylist.');
      toast.success('You have successfully sent a request to Stylist.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to confirm the appointment right now.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="site-shell site-shell--booking">
      <TopNavbar active="Home" onNavigate={(target) => navigate(target)} />

      <main className="page-main page-main--booking">
        <section className="mobile-header mobile-header--mobile-only">
          <MobileHeader title="Service Request" showBack centerTitle onBack={() => navigate(-1)} />
        </section>

        {loading ? <div className="loading-state">Loading appointment details...</div> : null}

        <section className="page-hero page-hero--booking">
          <div className="page-hero__content">
            <div className="page-kicker">Cart and appointment confirmation</div>
            <h1>Service Request</h1>
            <p>Review your stylist, selected services, appointment date and time, then send the request to confirm booking.</p>

            {successMessage ? <div className="booking-success-banner">{successMessage}</div> : null}
          </div>

          <div className="page-hero__panel page-hero__panel--booking">
            <StylistInfoCard stylist={stylist || location.state?.stylist} branchName={branchName} area={area} city={city} />
          </div>
        </section>

        <section className="booking-layout">
          <div className="booking-layout__main">
            <article className="booking-card booking-card--address">
              <div className="booking-address-card__header">
                <div>
                  <div className="section-heading">Service Address</div>
                  <div className="section-subheading">Edit the customer address before sending the request</div>
                </div>
                <button type="button" className="text-link text-link--accent" onClick={() => (addressEditing ? handleSaveAddress() : setAddressEditing(true))}>
                  {addressEditing ? 'Save Address' : 'Change Address'}
                </button>
              </div>

              <div className="booking-address-card__body">
                {addressEditing ? (
                  <label className="booking-field booking-field--full">
                    <span>Customer Address</span>
                    <textarea rows="4" value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} placeholder="Enter customer address" />
                  </label>
                ) : (
                  <div className="booking-address-display">{customerAddress || 'No address added yet.'}</div>
                )}
              </div>
            </article>

            <article className="booking-card">
              <div className="section-header-row section-header-row--wide">
                <div>
                  <div className="section-heading">Selected Services</div>
                  <div className="section-subheading">Review the chosen services, duration, and price</div>
                </div>
                <button
                  type="button"
                  className="text-link text-link--accent"
                  onClick={() =>
                    navigate('/services', {
                      state: {
                        appointment_id: appointmentId,
                        customer_id: customerId,
                        stylist_id: stylist?.id || location.state?.stylist_id || '',
                        branch_id: stylist?.branch_id || location.state?.branch_id || '',
                        city_id: stylist?.city_id || location.state?.city_id || '',
                        area_id: stylist?.area_id || location.state?.area_id || '',
                        state_id: stylist?.state_id || location.state?.state_id || '',
                        created_by: createdBy,
                        category: location.state?.category || 'Men',
                        subcategory: location.state?.subcategory || 'Hair care',
                        selected_services: normalizedServices,
                      },
                    })
                  }
                >
                  Add More Services
                </button>
              </div>

              <ServiceList services={normalizedServices} />
            </article>

            <article className="booking-card">
              <div className="section-header-row section-header-row--wide">
                <div>
                  <div className="section-heading">Booking Details</div>
                  <div className="section-subheading">Choose an appointment date and time</div>
                </div>
              </div>

              <DateTimePicker
                appointmentDate={appointmentDate}
                appointmentTime={appointmentTime}
                minDate={minDate}
                onDateChange={setAppointmentDate}
                onTimeChange={setAppointmentTime}
              />
            </article>

            <article className="booking-card">
              <div className="section-header-row section-header-row--wide">
                <div>
                  <div className="section-heading">Contact Actions</div>
                  <div className="section-subheading">Call or chat with the stylist if you need help</div>
                </div>
              </div>

              <ContactActions onCall={handleCallStylist} onChat={() => setChatOpen(true)} />
            </article>

            <article className="booking-summary-card booking-summary-card--mobile mobile-only">
              <div className="booking-summary-card__title">Request summary</div>
              <PriceSummary serviceCount={normalizedServices.length} totalDuration={totalDuration} totalPrice={totalPrice} appointmentId={appointmentId} />
              <ConfirmBookingButton loading={saving} onClick={handleConfirmBooking} />
            </article>
          </div>

          <aside className="booking-layout__sidebar desktop-only">
            <div className="booking-summary-card">
              <div className="booking-summary-card__title">Request summary</div>
              <PriceSummary serviceCount={normalizedServices.length} totalDuration={totalDuration} totalPrice={totalPrice} appointmentId={appointmentId} />
              <ConfirmBookingButton loading={saving} onClick={handleConfirmBooking} />
            </div>
          </aside>
        </section>
      </main>

      <BottomNavbar active="Home" onNavigate={(item) => item === 'Home' && navigate('/')} />

      <ChatModal
        isOpen={chatOpen}
        stylistName={stylist?.name || 'stylist'}
        onClose={() => setChatOpen(false)}
        onSend={() => {
          toast.success('Chat message sent successfully.');
          setChatOpen(false);
          setSuccessMessage('Chat message sent successfully.');
        }}
      />
    </div>
  );
};

export default AppointmentConfirmation;