import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BottomNavbar from '../components/BottomNavbar';
import MobileHeader from '../components/MobileHeader';
import StylistCard from '../components/StylistCard';
import SubcategoryCard from '../components/SubcategoryCard';
import TopNavbar from '../components/TopNavbar';
import { createAppointment } from '../services/appointmentService';
import { subcategories, stylists } from '../data/salonUiData';

const defaultBranchState = {
  branch_id: 'branch-pusan',
  city_id: 'city-bangalore',
  area_id: 'area-pusan',
  state_id: 'state-karnataka',
};

const StylistList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCategory = location.state?.category || 'Men';
  const customerId = location.state?.customer_id || localStorage.getItem('userId') || 'guest-user';
  const createdBy = location.state?.created_by || customerId;
  const [selectedSubcategory, setSelectedSubcategory] = useState(location.state?.subcategory || subcategories[0].title);
  const [loading, setLoading] = useState(false);
  const [offlineError, setOfflineError] = useState(false);

  useEffect(() => {
    setSelectedSubcategory(location.state?.subcategory || subcategories[0].title);
  }, [location.state?.subcategory]);

  const selectedSubcategoryItem = useMemo(
    () => subcategories.find((subcategory) => subcategory.title === selectedSubcategory) || subcategories[0],
    [selectedSubcategory]
  );

  const handleContinue = async () => {
    if (!navigator.onLine) {
      setOfflineError(true);
      toast.error('Mobile not connected to internet');
      return;
    }

    try {
      setLoading(true);
      setOfflineError(false);

      const appointment = await createAppointment({
        customer_id: customerId,
        main_category: selectedCategory,
        sub_category: selectedSubcategory,
        created_by: createdBy,
        modified_by: createdBy,
        ...defaultBranchState,
      });

      navigate('/stylists', {
        state: {
          appointment_id: appointment?.data?._id,
          customer_id: customerId,
          stylist_id: appointment?.data?.stylist_id || '',
          branch_id: defaultBranchState.branch_id,
          city_id: defaultBranchState.city_id,
          area_id: defaultBranchState.area_id,
          state_id: defaultBranchState.state_id,
          created_by: createdBy,
          category: selectedCategory,
          subcategory: selectedSubcategory,
        },
      });
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to continue right now.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-shell site-shell--subcategories">
      <TopNavbar active="Categories" onNavigate={(target) => navigate(target)} />

      <main className="page-main page-main--subcategory">
        <section className="mobile-header mobile-header--mobile-only">
          <MobileHeader title="subcategories" showBack centerTitle onBack={() => navigate(-1)} />
        </section>

        <section className="page-hero page-hero--subcategory">
          <div className="page-hero__content">
            <div className="page-kicker">Selected category</div>
            <h1>Explore services for {selectedCategory}</h1>
            <p>Discover curated services and stylist recommendations in a responsive grid layout.</p>
            <div className="selection-chip-row">
              {subcategories.map((subcategory) => (
                <button
                  key={subcategory.title}
                  type="button"
                  className={`selection-chip ${selectedSubcategory === subcategory.title ? 'active' : ''}`}
                  onClick={() => setSelectedSubcategory(subcategory.title)}
                >
                  {subcategory.title}
                </button>
              ))}
            </div>
          </div>

          <div className="page-hero__panel page-hero__panel--compact">
            <div className="members-pill">200 members are on same categories</div>
          </div>
        </section>

        <section className="page-section page-section--subcategories">
          <div className="subcategories-grid subcategories-grid-responsive">
            {subcategories.map((subcategory) => (
              <SubcategoryCard
                key={subcategory.title}
                subcategory={subcategory}
                selected={selectedSubcategory === subcategory.title}
                onClick={() => setSelectedSubcategory(subcategory.title)}
              />
            ))}
          </div>

          <div className="continue-selection-card">
            <div>
              <span>Selected subcategory</span>
              <strong>{selectedSubcategoryItem.title}</strong>
            </div>
            <button type="button" className="continue-button" onClick={handleContinue} disabled={loading}>
              {loading ? 'Saving...' : 'Choose Stylists'}
            </button>
          </div>

          {offlineError ? (
            <div className="connection-banner">
              <div>
                <strong>Mobile not connected to internet</strong>
                <span>Retry after reconnecting to continue booking.</span>
              </div>
              <button type="button" className="connection-banner__retry" onClick={handleContinue}>
                Retry
              </button>
            </div>
          ) : null}
        </section>

        <section className="page-section page-section--stylists">
          <div className="section-header-row section-header-row--wide">
            <div>
              <div className="section-heading section-heading--tight">top stylish in this categories</div>
              <div className="section-subheading">Same stylist cards, expanded for desktop</div>
            </div>
            <button type="button" className="text-link" onClick={() => navigate('/')}>View all</button>
          </div>

          <div className="stylist-grid-responsive stylist-grid-responsive--compact">
            {stylists.map((stylist) => (
              <StylistCard key={stylist.name} stylist={stylist} compact />
            ))}
          </div>
        </section>
      </main>

      <BottomNavbar active="Home" onNavigate={(item) => item === 'Home' && navigate('/')} />
    </div>
  );
};

export default StylistList;
