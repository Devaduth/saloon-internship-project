import RatingStars from './RatingStars';

const BranchInfo = ({ branch }) => {
  return (
    <article className="branch-info-card">
      <div className="branch-info-card__title-row">
        <div>
          <div className="branch-info-card__eyebrow">Branch Information</div>
          <h2>{branch.name}</h2>
        </div>
        <div className="branch-info-card__city">{branch.city}</div>
      </div>

      <div className="branch-info-card__grid">
        <div>
          <span>Area</span>
          <strong>{branch.area}</strong>
        </div>
        <div>
          <span>Working hours</span>
          <strong>{branch.working_hours}</strong>
        </div>
        <div>
          <span>Ratings</span>
          <strong>{branch.rating.toFixed(1)}</strong>
          <RatingStars value={branch.rating} />
        </div>
        <div>
          <span>City</span>
          <strong>{branch.city}</strong>
        </div>
      </div>
    </article>
  );
};

export default BranchInfo;