type StarRatingProps = {
  rating: number;
  className?: string;
};

export function StarRating({ rating, className = '' }: StarRatingProps) {
  const normalizedRating = Math.max(0, Math.min(5, rating));
  const fillWidth = `${(normalizedRating / 5) * 100}%`;
  const classNames = className ? `star-rating ${className}` : 'star-rating';

  return (
    <div className={classNames} aria-label={`Рейтинг ${normalizedRating.toFixed(1)} из 5`}>
      <span className="star-rating__icons" aria-hidden="true">
        <span className="star-rating__base">★★★★★</span>
        <span className="star-rating__fill" style={{ width: fillWidth }}>
          ★★★★★
        </span>
      </span>
      <span className="star-rating__value">{normalizedRating.toFixed(1)}</span>
    </div>
  );
}
