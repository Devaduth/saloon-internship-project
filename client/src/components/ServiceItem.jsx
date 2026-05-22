const ServiceItem = ({ service }) => {
  const serviceName = service.service_name || service.name || '';

  return (
    <article className="booking-service-item">
      <div>
        <div className="booking-service-item__name">{serviceName}</div>
        <div className="booking-service-item__meta">{service.duration || 'Duration not set'}</div>
      </div>
      <div className="booking-service-item__price">₹{Number(service.price || 0)}</div>
    </article>
  );
};

export default ServiceItem;