const SubcategoryCard = ({ subcategory }) => {
  return (
    <button type="button" className={`subcategory-card ${subcategory.selected ? 'selected' : ''}`} aria-pressed={subcategory.selected}>
      <img src={subcategory.image} alt={subcategory.title} className="subcategory-card__image" />
      <div className="subcategory-card__overlay" />
      <span className="subcategory-card__title">{subcategory.title}</span>
      <span className="subcategory-card__check" aria-hidden="true">✓</span>
    </button>
  );
};

export default SubcategoryCard;