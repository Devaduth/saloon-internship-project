import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BottomNavbar from '../components/BottomNavbar';
import BranchInfo from '../components/BranchInfo';
import BrandCard from '../components/BrandCard';
import MobileHeader from '../components/MobileHeader';
import ServiceSelection from '../components/ServiceSelection';
import TopNavbar from '../components/TopNavbar';
import { brands, branchInfo, selectionStylists } from '../data/stylistSelectionData';
import { updateAppointmentStylist } from '../services/stylistService';
import { getCustomerId } from '../utils/customerIdentity';

const StylistSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedCategory = location.state?.category || 'Men';
  const selectedSubcategory = location.state?.subcategory || 'Hair care';
  const appointmentId = location.state?.appointment_id || '';
  const customerId = getCustomerId(location.state?.customer_id || '');
  const createdBy = location.state?.created_by || customerId;

  const [activeStylistId, setActiveStylistId] = useState(location.state?.stylist_id || '');
  const [selectedServiceIds, setSelectedServiceIds] = useState(
    () => location.state?.selected_services?.map((service) => service.id || service.name).filter(Boolean) || []
  );
  const [bookingLoading, setBookingLoading] = useState(false);

  const activeStylist = useMemo(
    () => selectionStylists.find((stylist) => stylist.id === activeStylistId) || selectionStylists[0] || null,
    [activeStylistId]
  );


  useEffect(() => {
    const providedServiceIds = location.state?.selected_services?.map((service) => service.id || service.name).filter(Boolean) || [];

    if (providedServiceIds.length) {
      setSelectedServiceIds(providedServiceIds);
      return;
    }

    if (activeStylist?.services?.length) {
      setSelectedServiceIds((currentServiceIds) =>
        currentServiceIds.length ? currentServiceIds : [activeStylist.services[0].id || activeStylist.services[0].name]
      );
    }
  }, [activeStylist, location.state?.selected_services]);

  const branchDetails = {
    ...branchInfo,
    name: activeStylist?.branch_name || branchInfo.name,
    area: activeStylist?.area || branchInfo.area,
    city: activeStylist?.city || branchInfo.city,
    rating: activeStylist?.rating || branchInfo.rating,
  };

  const handleContinueBooking = async () => {
    if (!navigator.onLine) {
      toast.error('Mobile not connected to internet');
      return;
    }

    if (!appointmentId) {
      toast.error('No appointment was created on the previous screen.');
      return;
    }

    if (!activeStylist) {
      toast.error('No stylist was selected on the previous screen.');
      return;
    }

    if (!selectedServiceIds.length) {
      toast.error('Select a service to continue booking.');
      return;
    }

    const selectedServices = activeStylist.services?.filter((service) => selectedServiceIds.includes(service.id || service.name)) || [];

    try {
      setBookingLoading(true);
      await updateAppointmentStylist(appointmentId, {
        stylist_id: activeStylist.id,
        branch_id: activeStylist.branch_id || location.state?.branch_id || '',
        city_id: activeStylist.city_id || location.state?.city_id || '',
        area_id: activeStylist.area_id || location.state?.area_id || '',
        state_id: activeStylist.state_id || location.state?.state_id || '',
        modified_by: createdBy,
        selected_service: selectedServices[0]?.name || '',
        selected_services: selectedServices,
      });

      navigate('/booking', {
        state: {
          appointment_id: appointmentId,
          customer_id: customerId,
          stylist_id: activeStylist.id,
          branch_id: activeStylist.branch_id || location.state?.branch_id || '',
          city_id: activeStylist.city_id || location.state?.city_id || '',
          area_id: activeStylist.area_id || location.state?.area_id || '',
          state_id: activeStylist.state_id || location.state?.state_id || '',
          created_by: createdBy,
          category: selectedCategory,
          subcategory: activeStylist.subcategory || selectedSubcategory,
          selected_services: selectedServices,
        },
      });
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to update the appointment right now.';
      toast.error(message);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="site-shell site-shell--selection">
      <TopNavbar active="Home" onNavigate={(target) => navigate(target)} />

      <main className="page-main page-main--selection">
        <section className="mobile-header mobile-header--mobile-only">
          <MobileHeader title="Services" showBack centerTitle onBack={() => navigate(-1)} />
        </section>

        <section className="page-hero page-hero--selection">
          <div className="page-hero__content">
            <div className="page-kicker">Services and booking</div>
            <h1>Select services for {activeStylist?.name || 'your stylist'}.</h1>
            <p>Review the available services, choose what you need, and continue to booking.</p>

            <div className="selection-chip-row">
              <span className="selection-chip selection-chip--static">{selectedCategory}</span>
              <span className="selection-chip selection-chip--static">{activeStylist?.subcategory || selectedSubcategory}</span>
            </div>
          </div>

          <div className="page-hero__panel page-hero__panel--selection">
            <BranchInfo branch={branchDetails} />
          </div>
        </section>

        <section className="selection-layout">
          <div className="selection-layout__main">
            <section className="page-section selection-section">
              <div className="section-header-row section-header-row--wide">
                <div>
                  <div className="section-heading">Services</div>
                  <div className="section-subheading">Select a service before continuing</div>
                </div>
              </div>

              <ServiceSelection
                services={activeStylist?.services || []}
                selectedServiceIds={selectedServiceIds}
                onToggleService={(service) => {
                  const serviceKey = service.id || service.name;
                  setSelectedServiceIds((currentServiceIds) =>
                    currentServiceIds.includes(serviceKey)
                      ? currentServiceIds.filter((currentServiceId) => currentServiceId !== serviceKey)
                      : [...currentServiceIds, serviceKey]
                  );
                }}
              />
            </section>

            <section className="page-section selection-section">
              <div className="section-header-row section-header-row--wide">
                <div>
                  <div className="section-heading">Brands</div>
                  <div className="section-subheading">Supported salon brand partners</div>
                </div>
              </div>

              <div className="brand-grid">
                {brands.map((brand) => (
                  <BrandCard key={brand.name} brand={brand} />
                ))}
              </div>
            </section>

            <section className="page-section selection-section">
              <div className="section-header-row section-header-row--wide">
                <div>
                  <div className="section-heading">Booking summary</div>
                  <div className="section-subheading">Your stylist was selected on the previous screen</div>
                </div>
              </div>

              <div className="selection-summary-card selection-summary-card--full">
                <div className="selection-summary-card__title">Current stylist</div>
                <div className="selection-summary-card__value">{activeStylist?.name || 'Select a stylist first'}</div>
                <div className="selection-summary-card__meta">{activeStylist?.specialization || 'Stylist details will appear here.'}</div>
              </div>
            </section>
          </div>

          <aside className="selection-layout__sidebar desktop-only">
            <div className="selection-summary-card">
              <div className="selection-summary-card__title">Current selection</div>
              <div className="selection-summary-card__value">{activeStylist?.name || 'Select a stylist'}</div>
              <div className="selection-summary-card__meta">{activeStylist?.specialization || 'Stylist details will appear here.'}</div>

              <div className="selection-summary-card__services">
                <span>Chosen service</span>
                <strong>
                  {selectedServiceIds.length
                    ? activeStylist?.services
                        ?.filter((service) => selectedServiceIds.includes(service.id || service.name))
                        .map((service) => service.name)
                        .join(', ')
                    : 'None selected'}
                </strong>
              </div>

                <div className="selection-summary-card__services selection-summary-card__services--compact">
                  <span>Total selected</span>
                  <strong>{selectedServiceIds.length} services</strong>
                </div>

              <button type="button" className="continue-button continue-button--wide" onClick={handleContinueBooking} disabled={bookingLoading}>
                {bookingLoading ? 'Updating...' : 'Continue Booking'}
              </button>
            </div>
          </aside>
        </section>
      </main>

      <BottomNavbar active="Home" onNavigate={(item) => item === 'Home' && navigate('/')} />
    </div>
  );
};

export default StylistSelection;