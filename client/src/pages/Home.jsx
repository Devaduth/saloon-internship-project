import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';
import CategoryCard from '../components/CategoryCard';
import MobileHeader from '../components/MobileHeader';
import PromoBanner from '../components/PromoBanner';
import SearchBar from '../components/SearchBar';
import StylistCard from '../components/StylistCard';
import VoucherCard from '../components/VoucherCard';
import TopNavbar from '../components/TopNavbar';
import { categories, stylists } from '../data/salonUiData';

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('Men');
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
  };

  const handleSelectStylist = () => {
    navigate('/stylists', { state: { category: selectedCategory } });
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
              Browse categories, explore top stylists, and book services on a layout that feels native on mobile and
              polished on desktop.
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
            {categories.map((category) => (
              <CategoryCard
                key={category.name}
                category={category}
                selected={selectedCategory === category.name}
                onClick={() => handleCategoryClick(category)}
              />
            ))}
          </div>
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
            {stylists.map((stylist) => (
              <StylistCard key={stylist.name} stylist={stylist} />
            ))}
          </div>
        </section>
      </main>

      <BottomNavbar active="Home" onNavigate={(item) => item === 'Home' && navigate('/')} />
    </div>
  );
};

export default Home;
