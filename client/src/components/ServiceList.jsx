import ServiceItem from './ServiceItem';

const ServiceList = ({ services = [] }) => {
  if (!services.length) {
    return <div className="booking-empty-state">No services selected yet.</div>;
  }

  return (
    <div className="booking-service-list">
      {services.map((service, index) => (
        <ServiceItem key={`${service.id || service.service_name || service.name || 'service'}-${index}`} service={service} />
      ))}
    </div>
  );
};

export default ServiceList;