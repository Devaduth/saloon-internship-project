const ConfirmBookingButton = ({ loading = false, disabled = false, onClick }) => {
  return (
    <button type="button" className="continue-button continue-button--wide booking-confirm-button" onClick={onClick} disabled={disabled || loading}>
      {loading ? 'Booking...' : 'Book Appointment'}
    </button>
  );
};

export default ConfirmBookingButton;