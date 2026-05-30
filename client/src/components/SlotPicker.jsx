import { useEffect, useState } from 'react';
import { getAvailableSlots } from '../services/slotService';

const SlotPicker = ({ stylistId, onSelect }) => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSlots = async () => {
      setLoading(true);

      try {
        const response = await getAvailableSlots({ date, stylistId, includeAll: true });
        if (active) {
          setSlots(response?.data || []);
        }
      } catch {
        if (active) {
          setSlots([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSlots();

    return () => {
      active = false;
    };
  }, [date, stylistId]);

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
            slots.map((s) => {
              const status = String(s.status || (s.is_booked ? 'BOOKED' : s.is_active === false ? 'UNAVAILABLE' : 'AVAILABLE')).toUpperCase();
              const isClickable = status === 'AVAILABLE';

              return (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => isClickable && onSelect?.({ slot_id: s._id, ...s })}
                  className={`slot-item slot-item--${status.toLowerCase()}`}
                  disabled={!isClickable}
                >
                  <span className="slot-item__time">{s.start_time} - {s.end_time}</span>
                  <span className="slot-item__status">{status.toLowerCase()}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SlotPicker;
