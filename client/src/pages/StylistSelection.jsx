import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BottomNavbar from '../components/BottomNavbar';
import BranchInfo from '../components/BranchInfo';
import BrandCard from '../components/BrandCard';
import CertificationModal from '../components/CertificationModal';
import GalleryModal from '../components/GalleryModal';
import MobileHeader from '../components/MobileHeader';
import ServiceSelection from '../components/ServiceSelection';
import StylistCard from '../components/StylistCard';
import StylistDetailModal from '../components/StylistDetailModal';
import TopNavbar from '../components/TopNavbar';
import { brands, branchInfo, selectionStylists } from '../data/stylistSelectionData';
import {
  getStylistCertifications,
  getStylistDetails,
  getStylistGallery,
  getStylists,
  updateAppointmentStylist,
} from '../services/stylistService';

const normalizeStylist = (stylist) => ({
  ...stylist,
  id: stylist.id || stylist._id,
  image: stylist.image || stylist.stylist_photo,
  distance: stylist.area || stylist.branch_name || stylist.city,
  serviceTag: stylist.specialization,
});

const normalizeArray = (items = []) => items.map((item, index) => (typeof item === 'string' ? { id: `${index}`, image: item } : item));

const StylistSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedCategory = location.state?.category || 'Men';
  const selectedSubcategory = location.state?.subcategory || 'Hair care';
  const appointmentId = location.state?.appointment_id || '';
  const customerId = location.state?.customer_id || localStorage.getItem('userId') || 'guest-user';
  const createdBy = location.state?.created_by || customerId;

  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeStylistId, setActiveStylistId] = useState(location.state?.stylist_id || '');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [detailStylist, setDetailStylist] = useState(null);
  const [certModal, setCertModal] = useState(null);
  const [galleryModal, setGalleryModal] = useState(null);

  const filterParams = useMemo(
    () => ({
      status: 'AA',
      category: selectedCategory,
      subcategory: selectedSubcategory,
      branch_id: location.state?.branch_id || 'branch-pusan',
      city_id: location.state?.city_id || 'city-bangalore',
      area_id: location.state?.area_id || 'area-pusan',
      state_id: location.state?.state_id || 'state-karnataka',
    }),
    [location.state?.area_id, location.state?.branch_id, location.state?.city_id, location.state?.state_id, selectedCategory, selectedSubcategory]
  );

  useEffect(() => {
    let active = true;

    const loadStylists = async () => {
      try {
        setLoading(true);
        setLoadError('');

        const result = await getStylists(filterParams);
        const apiStylists = Array.isArray(result?.data) ? result.data.map(normalizeStylist) : [];
        const filteredFallback = selectionStylists
          .filter((stylist) => {
            const categoryMatch = stylist.category.toLowerCase() === selectedCategory.toLowerCase();
            const subcategoryMatch = stylist.subcategory.toLowerCase() === selectedSubcategory.toLowerCase();
            return categoryMatch || subcategoryMatch;
          })
          .map(normalizeStylist);

        const nextStylists = apiStylists.length ? apiStylists : filteredFallback.length ? filteredFallback : selectionStylists.map(normalizeStylist);

        if (active) {
          setStylists(nextStylists);
          setActiveStylistId((currentStylistId) => currentStylistId || nextStylists[0]?.id || '');
          setSelectedServiceIds((currentServiceIds) =>
            currentServiceIds.length
              ? currentServiceIds
              : nextStylists[0]?.services?.[0]
                ? [nextStylists[0].services[0].id || nextStylists[0].services[0].name]
                : []
          );

          if (!apiStylists.length) {
            setLoadError('Showing demo stylists because no live records were returned yet.');
          }
        }
      } catch (error) {
        if (active) {
          const fallbackStylists = selectionStylists.filter((stylist) => stylist.status === 'AA').map(normalizeStylist);
          setStylists(fallbackStylists);
          setActiveStylistId((currentStylistId) => currentStylistId || fallbackStylists[0]?.id || '');
          setSelectedServiceIds((currentServiceIds) =>
            currentServiceIds.length
              ? currentServiceIds
              : fallbackStylists[0]?.services?.[0]
                ? [fallbackStylists[0].services[0].id || fallbackStylists[0].services[0].name]
                : []
          );
          setLoadError(error?.response?.data?.message || 'Unable to load stylists right now.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadStylists();

    return () => {
      active = false;
    };
  }, [filterParams, selectedCategory, selectedSubcategory]);

  const activeStylist = stylists.find((stylist) => stylist.id === activeStylistId) || stylists[0] || null;

  useEffect(() => {
    if (activeStylist?.services?.length) {
      setSelectedServiceIds((currentServiceIds) =>
        currentServiceIds.length ? currentServiceIds : [activeStylist.services[0].id || activeStylist.services[0].name]
      );
    }
  }, [activeStylist]);

  const branchDetails = {
    ...branchInfo,
    name: activeStylist?.branch_name || branchInfo.name,
    area: activeStylist?.area || branchInfo.area,
    city: activeStylist?.city || branchInfo.city,
    rating: activeStylist?.rating || branchInfo.rating,
  };

  const openDetailModal = async (stylist) => {
    try {
      const result = await getStylistDetails(stylist.id);
      setDetailStylist(normalizeStylist(result?.data || stylist));
    } catch {
      setDetailStylist(stylist);
    }
  };

  const handleCertifications = async (stylist) => {
    try {
      const result = await getStylistCertifications(stylist.id);
      setCertModal({ stylist, certifications: normalizeArray(result?.data?.certifications || stylist.certifications || []) });
    } catch {
      setCertModal({ stylist, certifications: normalizeArray(stylist.certifications || []) });
    }
  };

  const handleGallery = async (stylist) => {
    try {
      const result = await getStylistGallery(stylist.id);
      setGalleryModal({ stylist, images: normalizeArray(result?.data?.professional_gallery || stylist.professional_gallery || []) });
    } catch {
      setGalleryModal({ stylist, images: normalizeArray(stylist.professional_gallery || []) });
    }
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
      toast.error('Select a stylist to continue booking.');
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

      toast.success('Stylist selected successfully.');
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
          <MobileHeader title="Stylists" showBack centerTitle onBack={() => navigate(-1)} />
        </section>

        {loadError ? (
          <div className="connection-banner connection-banner--inline">
            <div>
              <strong>Stylist data notice</strong>
              <span>{loadError}</span>
            </div>
            <button type="button" className="connection-banner__retry" onClick={() => setLoadError('')}>
              Retry
            </button>
          </div>
        ) : null}

        <section className="page-hero page-hero--selection">
          <div className="page-hero__content">
            <div className="page-kicker">Stylist Selection Screen</div>
            <h1>Select a stylist, view services, and continue booking.</h1>
            <p>
              Choose stylists filtered by your category and subcategory, review certifications and galleries, then continue the booking workflow.
            </p>

            <div className="selection-chip-row">
              <span className="selection-chip selection-chip--static">{selectedCategory}</span>
              <span className="selection-chip selection-chip--static">{selectedSubcategory}</span>
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

              {loading ? (
                <div className="loading-state">Loading stylists...</div>
              ) : (
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
              )}
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
                  <div className="section-heading">Stylists</div>
                  <div className="section-subheading">Based on your selected category and branch</div>
                </div>
              </div>

              <div className="selection-stylists-grid">
                {stylists.map((stylist) => (
                  <StylistCard
                    key={stylist.id}
                    stylist={stylist}
                    selected={activeStylist?.id === stylist.id}
                    onSelect={(stylistItem) => {
                      setActiveStylistId(stylistItem.id);
                      setSelectedServiceIds(
                        stylistItem.services?.length ? [stylistItem.services[0].id || stylistItem.services[0].name] : []
                      );
                    }}
                    onViewMore={openDetailModal}
                    onCertifications={handleCertifications}
                    onGallery={handleGallery}
                  />
                ))}
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

      <StylistDetailModal
        isOpen={Boolean(detailStylist)}
        stylist={detailStylist}
        onClose={() => setDetailStylist(null)}
        onOpenCertifications={handleCertifications}
        onOpenGallery={handleGallery}
      />

      <CertificationModal
        isOpen={Boolean(certModal)}
        stylist={certModal?.stylist}
        certifications={certModal?.certifications || []}
        onClose={() => setCertModal(null)}
      />

      <GalleryModal
        isOpen={Boolean(galleryModal)}
        stylist={galleryModal?.stylist}
        images={galleryModal?.images || []}
        onClose={() => setGalleryModal(null)}
      />
    </div>
  );
};

export default StylistSelection;