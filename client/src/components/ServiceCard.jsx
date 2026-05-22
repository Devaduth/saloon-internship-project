const ServiceCard = ({ service, selected, onToggle }) => {
  return (
    <article className={`service-card ${selected ? 'selected' : ''}`}>
      <div className="service-card__name">{service.name}</div>
      <div className="service-card__meta">
        <span>{service.duration}</span>
        <strong>₹{service.price}</strong>
      </div>
      <button type="button" className="service-card__action" onClick={() => onToggle?.(service)}>
        {selected ? 'Selected' : 'Select Service'}
      </button>
    </article>
  );
};

export default ServiceCard;