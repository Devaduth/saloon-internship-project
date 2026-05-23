import { useEffect, useState } from 'react';
import { getSalonSlots } from '../services/salonService';

const SlotPicker = ({ salonId, stylistId, onSelect }) => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const resp = await getSalonSlots(salonId, date);
        setSlots(resp.data || []);
      } catch (e) {
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    if (salonId) fetch();
  }, [salonId, date]);

  return (
    <div className="slot-picker">
      <label>
        Select date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      {loading ? (
        <div>Loading slots…</div>
      ) : (
        <div className="slot-list">
          {slots.length === 0 ? (
            <div>No slots available for selected date.</div>
          ) : (
            slots
              .filter((s) => !s.is_booked)
              .map((s) => (
                <button key={s._id} type="button" onClick={() => onSelect?.(s)} className="slot-item">
                  {s.start_time} - {s.end_time}
                </button>
              ))
          )}
        </div>
      )}
    </div>
  );
};

export default SlotPicker;
