const categories = ['Men', 'Women', 'Child'];

const CategorySelector = ({ value, onChange }) => {
  return (
    <div className="selector-group">
      <div className="section-label">Main Category</div>
      <div className="category-grid" role="list" aria-label="Main categories">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-card ${value === category ? 'active' : ''}`}
            onClick={() => onChange(category)}
            role="listitem"
            aria-pressed={value === category}
          >
            <span className="category-title">{category}</span>
            <span className="category-description">Tap to choose</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
