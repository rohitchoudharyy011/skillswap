export interface RatingSummary {
  average: number | null;
  count: number;
}

export function summarizeRatings(reviews: { rating: number }[]): RatingSummary {
  if (reviews.length === 0) return { average: null, count: 0 };
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return { average: total / reviews.length, count: reviews.length };
}
