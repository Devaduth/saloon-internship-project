const StylistCard = ({
  stylist,
  compact = false,
  selected = false,
  onSelect,
  onViewMore,
  onCertifications,
  onGallery,
}) => {
  const ratingValue = typeof stylist.rating === 'number' ? stylist.rating.toFixed(1) : stylist.rating;

  const renderCompactCard = () => (
    <article className="stylist-card stylist-card--compact-view">
      <img src={stylist.image} alt={stylist.name} className="stylist-card__image" />
      <div className="stylist-card__body">
        <div className="stylist-card__name-row">
          <h3>{stylist.name}</h3>
          <span className="stylist-card__rating">★ {ratingValue}</span>
        </div>
        <div className="stylist-card__meta">{stylist.experience}</div>
        <div className="stylist-card__meta stylist-card__meta--faded">{stylist.distance}</div>
        <div className="stylist-card__tag">{stylist.serviceTag}</div>
      </div>
    </article>
  );

  if (compact) {
    return renderCompactCard();
  }

  return (
    <article className={`stylist-card stylist-card--detail ${selected ? 'selected' : ''}`}>
      <div className="stylist-card__detail-media">
        <img src={stylist.image || stylist.stylist_photo} alt={stylist.name} className="stylist-card__detail-image" />
        <div className="stylist-card__detail-rating">★ {ratingValue}</div>
      </div>
      <div className="stylist-card__detail-body">
        <div className="stylist-card__detail-header">
          <div>
            <h3>{stylist.name}</h3>
            <p>{stylist.specialization || stylist.serviceTag || 'Salon specialist'}</p>
          </div>
          <div className="stylist-card__detail-city">{stylist.city || stylist.distance}</div>
        </div>

        <div className="stylist-card__detail-meta">
          <span>{stylist.experience} years experience</span>
          <span>{stylist.area || stylist.branch_name || 'Near you'}</span>
        </div>

        <p className="stylist-card__summary">{stylist.bio || 'Professional stylist available for booking and service selection.'}</p>

        <div className="stylist-card__detail-actions">
          <button type="button" className="stylist-card__primary-action" onClick={() => onSelect?.(stylist)}>
            {selected ? 'Selected' : 'Select Stylist'}
          </button>
          <button type="button" className="stylist-card__secondary-action" onClick={() => onViewMore?.(stylist)}>
            View More
          </button>
        </div>

        <div className="stylist-card__detail-links">
          <button type="button" className="text-link text-link--accent" onClick={() => onCertifications?.(stylist)}>
            Certifications
          </button>
          <button type="button" className="text-link text-link--accent" onClick={() => onGallery?.(stylist)}>
            Professional Gallery
          </button>
        </div>
      </div>
    </article>
  );
};

export default StylistCard;