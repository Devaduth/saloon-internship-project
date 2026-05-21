const StylistCard = ({ stylist, compact = false }) => {
  return (
    <article className={`stylist-card ${compact ? 'stylist-card--compact' : ''}`}>
      <img src={stylist.image} alt={stylist.name} className="stylist-card__image" />
      <div className="stylist-card__body">
        <div className="stylist-card__name-row">
          <h3>{stylist.name}</h3>
          <span className="stylist-card__rating">★ {stylist.rating}</span>
        </div>
        <div className="stylist-card__meta">{stylist.experience}</div>
        <div className="stylist-card__meta stylist-card__meta--faded">{stylist.distance}</div>
        <div className="stylist-card__tag">{stylist.serviceTag}</div>
      </div>
    </article>
  );
};

export default StylistCard;