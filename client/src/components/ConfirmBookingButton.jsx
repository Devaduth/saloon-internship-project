const ConfirmBookingButton = ({ loading = false, disabled = false, onClick }) => {
  return (
    <button type="button" className="continue-button continue-button--wide booking-confirm-button" onClick={onClick} disabled={disabled || loading}>
      {loading ? 'Sending request...' : 'Request for Service'}
    </button>
  );
};

export default ConfirmBookingButton;