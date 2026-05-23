import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import BottomNavbar from '../components/BottomNavbar';
import { getSalons } from '../services/salonService';

const SalonList = () => {
  const [salons, setSalons] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const resp = await getSalons();
        setSalons(resp.data || []);
      } catch (e) {
        setSalons([]);
      }
    };

    fetch();
  }, []);

  return (
    <div className="site-shell site-shell--home">
      <TopNavbar active="Home" />
      <main className="page-main page-main--home">
        <section className="page-hero">
          <h1>Browse Salons</h1>
        </section>

        <section className="salon-list">
          {salons.map((salon) => (
            <article key={salon._id} className="salon-card">
              <div className="salon-card__title">{salon.name}</div>
              <div className="salon-card__desc">{salon.description}</div>
              <div className="salon-card__meta">{salon.address}</div>
              <Link to={`/salons/${salon._id}`} className="salon-card__link">View</Link>
            </article>
          ))}
        </section>
      </main>
      <BottomNavbar active="Home" />
    </div>
  );
};

export default SalonList;
