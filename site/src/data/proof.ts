// Single source for the teaching proof shown in About (ES and EN).
// Update only here; labels and layout stay untouched.
//
// Verified 4 Oct 2026: 743 lessons taught on Preply. The page shows a floor,
// never the exact count, so it does not go stale. Raise `lessons` to 750
// only once the 750th lesson has actually been completed.
export const teaching = {
  lessons: 700,
  students: 60,
  fiveStarReviews: 25,
} as const;
