import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="bg-gray-50 py-2 sm:py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 mx-1 sm:mx-2" />}
              {item.href ? (
                <a href={item.href} className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                  {item.label}
                </a>
              ) : (
                <span className="text-gray-700 font-medium truncate max-w-[10rem] sm:max-w-none">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;