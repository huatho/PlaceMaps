interface RatingStarsProps {
  rating: number;
}

export function RatingStars({ rating }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < rating;
        return (
          <span key={index} className={filled ? "text-amber-400" : "text-slate-300"} aria-hidden="true">
            ★
          </span>
        );
      })}
      <span className="ml-1 text-sm font-medium text-slate-600">{rating}.0</span>
    </div>
  );
}
