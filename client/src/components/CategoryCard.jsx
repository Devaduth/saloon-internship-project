const CategoryCard = ({ category, selected, onClick }) => {
  return (
    <button type="button" className={`category-chip ${selected ? 'selected' : ''}`} onClick={onClick} aria-pressed={selected}>
      <span className="category-chip__avatar">
        <img src={category.image} alt={category.name} />
      </span>
      <span className="category-chip__label">{category.name}</span>
    </button>
  );
};

export default CategoryCard;