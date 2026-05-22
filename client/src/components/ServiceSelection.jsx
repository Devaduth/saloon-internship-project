import ServiceCard from './ServiceCard';

const ServiceSelection = ({ services, selectedServiceIds = [], onToggleService }) => {
  return (
    <div className="service-selection-grid">
      {services.map((service) => (
        <ServiceCard
          key={service.id || service.name}
          service={service}
          selected={selectedServiceIds.includes(service.id || service.name)}
          onToggle={onToggleService}
        />
      ))}
    </div>
  );
};

export default ServiceSelection;