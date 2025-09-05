import React, { useMemo } from 'react';
import { Star, Quote } from 'lucide-react';

type SingleReview = {
  author: string;
  rating: number; // 1-5
  date: string; // ISO string
  text: string;
};

type CompanyReviewsProps = {
  companyName: string;
  companyUrl: string;
  ratingValue?: number; // average
  reviewCount?: number;
  reviews?: SingleReview[];
};

function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rounded ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

const CompanyReviews: React.FC<CompanyReviewsProps> = ({
  companyName,
  companyUrl,
  ratingValue = 4.8,
  reviewCount = 124,
  reviews = [
    { author: 'Amit S.', rating: 5, date: '2025-01-10', text: 'Accurate, up-to-date company info. Helped our vendor checks.' },
    { author: 'Priya K.', rating: 5, date: '2025-01-06', text: 'Great insights on directors and indicators. Smooth experience.' },
    { author: 'Rahul M.', rating: 4, date: '2025-01-02', text: 'Solid coverage and quick access to compliance data.' },
  ],
}) => {
  const jsonLd = useMemo(() => {
    // Use Organization schema with aggregateRating + review
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: companyName,
      url: companyUrl,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: ratingValue.toFixed(1),
        reviewCount: reviewCount,
      },
      review: reviews.slice(0, 3).map((r) => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: 5,
        },
        author: { '@type': 'Person', name: r.author },
        datePublished: r.date,
        reviewBody: r.text,
      })),
    };
  }, [companyName, companyUrl, ratingValue, reviewCount, reviews]);

  return (
    <section aria-label="User ratings" className="bg-gray-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Stars rating={ratingValue} />
            <div className="text-sm text-gray-700">
              <span className="font-semibold">{ratingValue.toFixed(1)}</span> out of 5 • {reviewCount}+ ratings
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto">
            {reviews.slice(0, 3).map((r, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm min-w-[240px]">
                {/* <Quote className="h-4 w-4 text-gray-300" /> */}
                <div className="text-sm">
                  <div className="text-gray-800 line-clamp-2">{r.text}</div>
                  <div className="text-gray-500 mt-1">— {r.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* JSON-LD for rich results */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
};

export default CompanyReviews;


