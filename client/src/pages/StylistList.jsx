import { useLocation, useNavigate } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';
import MobileHeader from '../components/MobileHeader';
import StylistCard from '../components/StylistCard';
import SubcategoryCard from '../components/SubcategoryCard';
import TopNavbar from '../components/TopNavbar';
import { subcategories, stylists } from '../data/salonUiData';

const StylistList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCategory = location.state?.category || 'Men';

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
          </div>

          <div className="page-hero__panel page-hero__panel--compact">
            <div className="members-pill">200 members are on same categories</div>
          </div>
        </section>

        <section className="page-section page-section--subcategories">
          <div className="subcategories-grid subcategories-grid-responsive">
            {subcategories.map((subcategory) => (
              <SubcategoryCard key={subcategory.title} subcategory={subcategory} />
            ))}
          </div>
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
