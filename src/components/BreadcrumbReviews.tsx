import React from 'react';
import { Star, Quote } from 'lucide-react';

type Review = {
  id: string;
  user: string;
  company?: string;
  quote: string;
  rating: number; // 1-5
};

const REVIEWS: Review[] = [
  {
    id: 'r1',
    user: 'Amit S.',
    company: 'Fintech Ops',
    quote: 'Quickly found verified company details for vendor onboarding.',
    rating: 5,
  },
  {
    id: 'r2',
    user: 'Priya K.',
    company: 'SME Exports',
    quote: 'Reliable reports and smooth checkout — saved us hours.',
    rating: 5,
  },
  {
    id: 'r3',
    user: 'Rahul M.',
    company: 'Credit Risk Team',
    quote: 'The indicators and director info are super helpful.',
    rating: 4,
  },
];

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

const BreadcrumbReviews: React.FC = () => {
  return (
    <nav className="bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex flex-wrap items-center gap-2 py-2 text-xs sm:text-sm">
          {REVIEWS.map((r, idx) => (
            <li key={r.id} className="flex items-center">
              {idx > 0 && (
                <svg className="h-4 w-4 text-gray-300 mx-1 sm:mx-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M7.05 4.55L12.5 10l-5.45 5.45 1.4 1.4L15.3 10 8.45 3.15l-1.4 1.4z" />
                </svg>
              )}
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow transition">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100 text-[10px] font-bold">
                  {r.user.split(' ').map(p => p[0]).join('').slice(0,2)}
                </span>
                <span className="hidden sm:inline text-gray-700 font-medium">{r.user}</span>
                <span className="hidden sm:inline text-gray-400">•</span>
                <span className="hidden sm:inline text-gray-600 truncate max-w-[12rem]">{r.company || 'Verified User'}</span>
                <span className="text-gray-400">•</span>
                {renderStars(r.rating)}
                <span className="hidden md:inline-flex items-center text-gray-600">
                  <Quote className="h-3.5 w-3.5 text-gray-300 mr-1" />
                  <span className="max-w-[18rem] truncate">{r.quote}</span>
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default BreadcrumbReviews;


