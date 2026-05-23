import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import BottomNavbar from '../components/BottomNavbar';
import { getSalon, getSalonStylists } from '../services/salonService';
import SlotPicker from '../components/SlotPicker';
import { createBooking } from '../services/bookingService';
import { toast } from 'react-toastify';

const SalonProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [stylists, setStylists] = useState([]);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const resp = await getSalon(id);
        setSalon(resp.data || null);
        const sResp = await getSalonStylists(id);
        setStylists(sResp.data || []);
      } catch (e) {
        setSalon(null);
      }
    };

    fetch();
  }, [id]);

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  const handleConfirmBooking = async () => {
    if (!selectedStylist) {
      toast.error('Please select a stylist');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select a slot');
      return;
    }

    try {
      const payload = {
        salon_id: id,
        stylist_id: selectedStylist._id,
        slot_id: selectedSlot._id,
        service_ids: [],
      };

      const resp = await createBooking(payload);
      toast.success('Booking confirmed');
      navigate('/booking');
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to create booking';
      toast.error(message);
    }
  };

  if (!salon) {
    return (
      <div className="site-shell">
        <TopNavbar />
        <main className="page-main">
          <div>Loading salon...</div>
        </main>
        <BottomNavbar />
      </div>
    );
  }

  return (
    <div className="site-shell">
      <TopNavbar active="Home" />
      <main className="page-main">
        <section className="salon-profile">
          <h1>{salon.name}</h1>
          <p>{salon.description}</p>
          <div>{salon.address}</div>

          <h2>Stylists</h2>
          <div className="stylists-list">
            {stylists.map((st) => (
              <button key={st._id} type="button" onClick={() => setSelectedStylist(st)} className={`stylist-item ${selectedStylist?._id === st._id ? 'selected' : ''}`}>
                {st.name}
              </button>
            ))}
          </div>

          <h2>Choose slot</h2>
          <SlotPicker salonId={id} stylistId={selectedStylist?._id} onSelect={handleSelectSlot} />

          <div style={{ marginTop: 16 }}>
            <button type="button" onClick={handleConfirmBooking} className="auth-button">
              Confirm Booking
            </button>
          </div>
        </section>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default SalonProfile;
