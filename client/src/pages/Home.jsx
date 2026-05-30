import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BottomNavbar from '../components/BottomNavbar';
import CategoryCard from '../components/CategoryCard';
import MobileHeader from '../components/MobileHeader';
import PromoBanner from '../components/PromoBanner';
import SearchBar from '../components/SearchBar';
import StylistCard from '../components/StylistCard';
import VoucherCard from '../components/VoucherCard';
import TopNavbar from '../components/TopNavbar';
import { SALON_CATEGORIES } from '../config/appConstants';
import { getSalons } from '../services/salonService';
import { getStylists } from '../services/stylistService';

const toArray = (response) => (Array.isArray(response?.data?.data) ? response.data.data : Array.isArray(response?.data) ? response.data : []);

const CATEGORY_META = {
  Men: { image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80' },
  Women: { image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80' },
  Children: { image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80' },
};

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState(SALON_CATEGORIES[0]);
  const [salons, setSalons] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const [salonResp, stylistResp] = await Promise.all([getSalons(), getStylists()]);

        if (!active) {
          return;
        }

        const nextSalons = toArray(salonResp);
        const nextStylists = toArray(stylistResp);

        setSalons(nextSalons);
        setStylists(nextStylists);

        setSelectedCategory((current) => current || SALON_CATEGORIES[0]);
      } catch (error) {
        if (active) {
          const message = error?.response?.data?.message || 'Failed to load salon data.';
          setErrorMessage(message);
          toast.error(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const activeSalon = salons[0] || null;

  const categories = useMemo(() => SALON_CATEGORIES.map((name) => ({ name, image: CATEGORY_META[name]?.image || activeSalon?.images?.[0] || '' })), [activeSalon?.images]);

  const featuredStylists = useMemo(() => {
    if (!selectedCategory) {
      return stylists;
    }

    return stylists.filter((stylist) => {
      const categories = Array.isArray(stylist.category) ? stylist.category : stylist.category ? [stylist.category] : [stylist.main_category].filter(Boolean);
      return categories.some((category) => String(category).toLowerCase() === String(selectedCategory).toLowerCase());
    });
  }, [selectedCategory, stylists]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
  };

  const handleSelectStylist = () => {
    const category = selectedCategory || categories[0]?.name || '';

    if (!category) {
      toast.error('No categories available yet.');
      return;
    }

    navigate('/stylists', {
      state: {
        category,
        salon_id: activeSalon?._id || '',
      },
    });
  };

  return (
    <div className="site-shell site-shell--home">
      <TopNavbar active="Home" onNavigate={(target) => navigate(target)} />

      <main className="page-main page-main--home">
        <section className="mobile-header mobile-header--mobile-only">
          <MobileHeader title="Home" showMenu />
        </section>

        <section className="page-hero page-hero--full">
          <div className="page-hero__content">
            <div className="page-kicker">Salon booking platform</div>
            <h1>Book stylish salon services with a clean, responsive experience.</h1>
            <p>
              Browse live categories and stylists loaded from the backend, then book services on a layout that feels native on mobile and polished on desktop.
            </p>
          </div>

          <div className="page-hero__panel">
            <SearchBar placeholder="Search your stylist" />
            <PromoBanner />
          </div>
        </section>

        <section className="page-section page-section--categories">
          <div className="section-header-row section-header-row--wide">
            <div>
              <div className="section-heading">Categories</div>
              <div className="section-subheading">Choose a service type to continue</div>
            </div>
            <button type="button" className="text-link" onClick={handleSelectStylist}>
              Select Stylist
            </button>
          </div>

          <div className="category-grid-responsive">
            {loading ? <div className="loading-state">Loading categories...</div> : null}
            {!loading && categories.length ? categories.map((category) => (
              <CategoryCard
                key={category.name}
                category={category}
                selected={selectedCategory === category.name}
                onClick={() => handleCategoryClick(category)}
              />
            )) : null}
          </div>

          {!loading && !categories.length ? <div className="empty-state">No services configured yet.</div> : null}
        </section>

        <section className="page-section page-section--voucher">
          <VoucherCard />
        </section>

        <section className="page-section page-section--stylists">
          <div className="section-header-row section-header-row--wide">
            <div>
              <div className="section-heading section-heading--tight">popular in your city</div>
              <div className="section-subheading">Horizontal cards on mobile, grid on larger screens</div>
            </div>
            <button type="button" className="text-link" onClick={handleSelectStylist}>
              View all
            </button>
          </div>

          <div className="stylist-grid-responsive">
            {loading ? <div className="loading-state">Loading stylists...</div> : null}
            {!loading && featuredStylists.length ? featuredStylists.map((stylist) => (
              <StylistCard key={stylist._id || stylist.id || stylist.name} stylist={stylist} />
            )) : null}
          </div>

          {!loading && !featuredStylists.length ? <div className="empty-state">No stylists available yet.</div> : null}
        </section>

        {errorMessage ? <div className="admin-alert">{errorMessage}</div> : null}
      </main>

      <BottomNavbar active="Home" onNavigate={(item) => item === 'Home' && navigate('/')} />
    </div>
  );
};

export default Home;
