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
  Men: {
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&q=80',
    description: 'Sharp fades, beard care, grooming rituals',
  },
  Women: {
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=640&q=80',
    description: 'Hair styling, skin care, color and finish',
  },
  Children: {
    image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=640&q=80',
    description: 'Gentle cuts and quick family appointments',
  },
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

  const categories = useMemo(
    () => SALON_CATEGORIES.map((name) => ({ name, image: CATEGORY_META[name]?.image || activeSalon?.images?.[0] || '', description: CATEGORY_META[name]?.description || '' })),
    [activeSalon?.images]
  );

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
    navigate('/stylists', {
      state: {
        category: category.name,
        salon_id: activeSalon?._id || '',
      },
    });
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
    <div className="site-shell site-shell--home app-shell min-h-screen w-full overflow-x-hidden">
      <TopNavbar active="Home" onNavigate={(target) => navigate(target)} />

      <main className="page-main page-main--home app-container">
        <section className="mobile-header mobile-header--mobile-only">
          <MobileHeader title="Home" showMenu centerTitle />
        </section>

        <section className="page-hero page-hero--full">
          <div className="page-hero__content">
            <div className="page-kicker">Premium salon appointments</div>
            <h1>Book your next salon visit beautifully.</h1>
            <p>
              Discover trusted stylists, compare services, and reserve a time that fits your day in a calm, polished booking flow.
            </p>
            <div className="customer-hero__stats">
              <span><strong>{stylists.length || '24+'}</strong> stylists</span>
              <span><strong>4.8</strong> average rating</span>
              <span><strong>Instant</strong> booking</span>
            </div>
          </div>

          <div className="page-hero__panel">
            <SearchBar placeholder="Search your stylist" />
            <PromoBanner />
          </div>
        </section>

        <section className="page-section page-section--categories">
          <div className="section-header-row section-header-row--wide">
            <div>
              <div className="section-heading">Choose your experience</div>
              <div className="section-subheading">Start with a category and we will tailor the stylist list.</div>
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
              <div className="section-heading section-heading--tight">Featured stylists</div>
              <div className="section-subheading">Handpicked specialists available for {selectedCategory || 'your'} appointments.</div>
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
