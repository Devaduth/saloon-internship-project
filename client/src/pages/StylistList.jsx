import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BottomNavbar from '../components/BottomNavbar';
import BranchInfo from '../components/BranchInfo';
import MobileHeader from '../components/MobileHeader';
import StylistCard from '../components/StylistCard';
import TopNavbar from '../components/TopNavbar';
import { createAppointment } from '../services/appointmentService';
import { branchInfo, selectionStylists } from '../data/stylistSelectionData';
import { getCustomerId } from '../utils/customerIdentity';

const defaultBranchState = {
  branch_id: 'branch-pusan',
  city_id: 'city-bangalore',
  area_id: 'area-pusan',
  state_id: 'state-karnataka',
};

const getGuestCustomerId = () => {
  const storageKey = 'salonGuestCustomerId';
  const existingGuestId = localStorage.getItem(storageKey);

  if (existingGuestId) {
    return existingGuestId;
  }

  const generatedGuestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(storageKey, generatedGuestId);

  return generatedGuestId;
};

const StylistList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCategory = location.state?.category || 'Men';
  const customerId = getCustomerId(location.state?.customer_id || '');
  const createdBy = location.state?.created_by || customerId;
  const [selectedStylistId, setSelectedStylistId] = useState(location.state?.stylist_id || '');
  const [loadingStylistId, setLoadingStylistId] = useState('');
  const [offlineError, setOfflineError] = useState(false);

  const availableStylists = useMemo(() => {
    const matchedStylists = selectionStylists.filter(
      (stylist) => stylist.status === 'AA' && stylist.category?.toLowerCase() === selectedCategory.toLowerCase()
    );

    return matchedStylists.length ? matchedStylists : selectionStylists.filter((stylist) => stylist.status === 'AA');
  }, [selectedCategory]);

  useEffect(() => {
    if (!availableStylists.length) {
      return;
    }

    const hasSelectedStylist = availableStylists.some((stylist) => stylist.id === selectedStylistId);

    if (!hasSelectedStylist) {
      setSelectedStylistId(availableStylists[0].id);
    }
  }, [availableStylists, selectedStylistId]);

  const handleSelectStylist = async (stylist) => {
    if (!navigator.onLine) {
      setOfflineError(true);
      toast.error('Mobile not connected to internet');
      return;
    }

    try {
      setLoadingStylistId(stylist.id);
      setOfflineError(false);
      setSelectedStylistId(stylist.id);

      const appointment = await createAppointment({
        customer_id: customerId,
        main_category: selectedCategory,
        sub_category: stylist.subcategory || '',
        stylist_id: stylist.id,
        created_by: createdBy,
        modified_by: createdBy,
        ...defaultBranchState,
        branch_id: stylist.branch_id || defaultBranchState.branch_id,
        city_id: stylist.city_id || defaultBranchState.city_id,
        area_id: stylist.area_id || defaultBranchState.area_id,
        state_id: stylist.state_id || defaultBranchState.state_id,
      });

      navigate('/services', {
        state: {
          appointment_id: appointment?.data?._id,
          customer_id: customerId,
          stylist_id: stylist.id,
          branch_id: stylist.branch_id || defaultBranchState.branch_id,
          city_id: stylist.city_id || defaultBranchState.city_id,
          area_id: stylist.area_id || defaultBranchState.area_id,
          state_id: stylist.state_id || defaultBranchState.state_id,
          created_by: createdBy,
          category: selectedCategory,
          subcategory: stylist.subcategory || '',
        },
      });
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to select this stylist right now.';
      toast.error(message);
    } finally {
      setLoadingStylistId('');
    }
  };

  const activeStylist = availableStylists.find((stylist) => stylist.id === selectedStylistId) || availableStylists[0] || null;

  return (
    <div className="site-shell site-shell--subcategories">
      <TopNavbar active="Categories" onNavigate={(target) => navigate(target)} />

      <main className="page-main page-main--subcategory">
        <section className="mobile-header mobile-header--mobile-only">
          <MobileHeader title="Stylists" showBack centerTitle onBack={() => navigate(-1)} />
        </section>

        <section className="page-hero page-hero--subcategory">
          <div className="page-hero__content">
            <div className="page-kicker">Stylist selection</div>
            <h1>Choose a stylist for {selectedCategory}</h1>
            <p>Pick one stylist to create the booking draft and continue to the services page.</p>
            <div className="selection-chip-row">
              <span className="selection-chip selection-chip--static">{selectedCategory}</span>
            </div>
          </div>

          <div className="page-hero__panel page-hero__panel--selection">
            <BranchInfo branch={branchInfo} />
          </div>
        </section>

        {offlineError ? (
          <div className="connection-banner connection-banner--inline">
            <div>
              <strong>Mobile not connected to internet</strong>
              <span>Reconnect before selecting a stylist to continue booking.</span>
            </div>
            <button type="button" className="connection-banner__retry" onClick={() => setOfflineError(false)}>
              Retry
            </button>
          </div>
        ) : null}

        <section className="page-section page-section--stylists">
          <div className="section-header-row section-header-row--wide">
            <div>
              <div className="section-heading section-heading--tight">Available stylists</div>
              <div className="section-subheading">Select one stylist to move into services and booking</div>
            </div>
            <button type="button" className="text-link" onClick={() => navigate('/')}>Change category</button>
          </div>

          <div className="selection-stylists-grid">
            {availableStylists.map((stylist) => (
              <StylistCard
                key={stylist.id}
                stylist={stylist}
                selected={selectedStylistId === stylist.id}
                loading={loadingStylistId === stylist.id}
                onSelect={handleSelectStylist}
              />
            ))}
          </div>
        </section>
      </main>

      <BottomNavbar active="Home" onNavigate={(item) => item === 'Home' && navigate('/')} />
    </div>
  );
};

export default StylistList;
