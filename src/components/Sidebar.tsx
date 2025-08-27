// Minimal stub replaces broken legacy code
import React from 'react';

const Sidebar: React.FC = () => null;
export default Sidebar;

/* Legacy code below disabled
import React from 'react';
import { Shield } from 'lucide-react';

export interface SidebarItem {
  label: string;
  icon: React.FC<{ className?: string }>;
  locked?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  activeLabel: string;
  onNavigate?: (label: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, activeLabel, onNavigate }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit sticky top-24">
    <nav className="space-y-1">
      {items.map((item, index) => {
        const isActive = item.label === activeLabel;
        return (
          <button
            key={index}
            onClick={() => !item.locked && onNavigate?.(item.label)}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                : item.locked
                ? 'text-gray-400 hover:text-gray-500'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <item.icon
              className={`mr-3 h-5 w-5 ${
                isActive ? 'text-blue-600' : item.locked ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <span className="flex-1 text-left">{item.label}</span>
            {item.locked && <Shield className="h-4 w-4 text-gray-400" />}
          </button>
        );
      })}
    </nav>
  </div>
);


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit sticky top-24">

  { label: 'Company Details', icon: FileText },
  { label: 'Key Indicators', icon: TrendingUp },
  { label: 'Directors', icon: Users },
  { label: 'Financial', icon: DollarSign },
  { label: 'Shareholding Structure', icon: GitCompare },
  { label: 'Charges', icon: Scale },
  { label: 'Employees', icon: Users },
  { label: 'Credit Ratings', icon: Award },
  { label: 'Recent Activity', icon: TrendingUp },
  { label: 'Recent News', icon: FileText },
  { label: 'People & Contacts', icon: Users },
  { label: 'Charges', icon: Scale },
  { label: 'Control & Ownership', icon: Shield, locked: true },
  { label: 'Financials', icon: DollarSign, locked: true },
  { label: 'Peer Comparison', icon: GitCompare, locked: true },
  { label: 'Compliance Check', icon: Shield, locked: true },
  { label: 'Litigation & Alerts', icon: AlertTriangle, locked: true },




      <nav className="space-y-1">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => !item.locked && onNavigate?.(item.label)}
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                : item.locked
                ? 'text-gray-400 hover:text-gray-500'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <item.icon className={`mr-3 h-5 w-5 ${
              item.label === activeLabel ? 'text-blue-600' : item.locked ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.locked && (
              <Shield className="h-4 w-4 text-gray-400" />
            )}
          </button>
        ))}
      </nav>
    </div>


};

export default Sidebar;
*/