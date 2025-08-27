import React from 'react';
import { Shield } from 'lucide-react';

export interface SidebarItem {
  label: string;
  icon: React.FC<{ className?: string }>;
  locked?: boolean;
}

interface SidebarNavProps {
  items: SidebarItem[];
  activeLabel: string;
  onNavigate: (label: string) => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ items, activeLabel, onNavigate }) => {
  return (
    <div className="card-elevated p-4 sm:p-6 h-fit lg:sticky lg:top-24 backdrop-blur-sm">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Navigation</h3>
        <div className="w-10 sm:w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
      </div>
      
      <nav className="space-y-2">
        {items.map((item, idx) => {
          const isActive = item.label === activeLabel;
          return (
            <button
              key={idx}
              onClick={() => item.locked ? (window.location.href = '/pricing') : onNavigate(item.label)}
              className={`sidebar-item group ${
                isActive
                  ? 'sidebar-item-active'
                  : item.locked
                  ? 'sidebar-item-locked'
                  : 'sidebar-item-inactive'
              }`}
            >
              <div className={`mr-3 p-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-100 text-blue-600' 
                  : item.locked 
                  ? 'bg-gray-100 text-gray-400' 
                  : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'
              }`}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              {item.locked && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">PRO</span>
                  <Shield className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Upgrade CTA */}
      <div className="mt-6 sm:mt-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Unlock Full Access</h4>
        <p className="text-xs text-blue-700 mb-3">Get detailed financial data, director information, and more.</p>
        <button 
          onClick={() => window.location.href = '/pricing'}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

export default SidebarNav;
