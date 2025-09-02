import React from 'react';
import { TrendingUp, DollarSign, Calendar, FileText, PieChart, Building2 } from 'lucide-react';
import { ProcessedCompanyData } from '../utils/companyUtils';

interface IndicatorCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  className?: string;
}

const IndicatorCard: React.FC<IndicatorCardProps> = ({ title, value, icon, trend, subtitle, className = "" }) => (
  <div className={`indicator-card ${className}`}>
    <div className="flex items-start justify-between">
      <div className="flex flex-col items-start justify-between w-full min-h-[80px]">
        <div className="indicator-icon mb-4">
          {icon}
        </div>
        <div className="w-full min-w-0">
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className="text-lg lg:text-base xl:text-lg font-bold text-gray-900 mb-1 break-words leading-tight overflow-hidden">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 font-medium break-words">{subtitle}</p>
          )}
        </div>
      </div>
      {trend && (
        <div className={`p-2 rounded-full shadow-sm flex-shrink-0 ${
          trend === 'up' ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 
          trend === 'down' ? 'bg-gradient-to-br from-red-50 to-rose-50' : 
          'bg-gradient-to-br from-gray-50 to-slate-50'
        }`}>
          <TrendingUp className={`h-4 w-4 ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600 rotate-180' : 
            'text-gray-600'
          }`} />
        </div>
      )}
    </div>
  </div>
);

interface KeyIndicatorsProps {
  companyData?: ProcessedCompanyData | null;
}

const KeyIndicators: React.FC<KeyIndicatorsProps> = ({ companyData }) => {
  return (
    <div className="card-elevated p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Key Indicators</h2>
          <p className="text-gray-600">Essential financial metrics and company information</p>
        </div>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
      </div>
      
      {/* Fixed grid with better overflow handling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
        <IndicatorCard
          title="Authorised Capital"
          value={companyData?.formattedAuthorisedCapital || "₹476.85 Cr"}
          icon={<DollarSign className="h-6 w-6" />}
          trend="neutral"
          className="sm:col-span-1"
        />
        <IndicatorCard
          title="Paid Up Capital"
          value={companyData?.formattedPaidUpCapital || "₹424.50 Cr"}
          icon={<PieChart className="h-6 w-6" />}
          trend="up"
          className="sm:col-span-1"
        />
        <IndicatorCard 
  title="Company Age"
  value={
    companyData?.companyAge !== undefined 
      ? companyData.companyAge === 0 
        ? `${companyData.companyAgeInMonths} Months`
        : `${companyData.companyAge} Years`
      : '0 Months'
  }
  icon={<Calendar className="h-6 w-6" />}
  subtitle={`Since ${companyData?.dateOfIncorporation ? 
    (companyData.dateOfIncorporation.includes('/') ? 
      companyData.dateOfIncorporation.split('/')[2] : 
      new Date(companyData.dateOfIncorporation).getFullYear()
    ) : 'Unknown'}`}
  className="sm:col-span-1 lg:col-span-1" 
/>
        <IndicatorCard
          title="Last Filing with ROC"
          value="Not available"
          icon={<FileText className="h-6 w-6" />}
          trend="up"
          className="sm:col-span-1 lg:col-span-1"
        />
        <IndicatorCard
          title="Open Charges"
          value={companyData?.formattedOpenCharges || "₹0"}
          icon={<TrendingUp className="h-6 w-6" />}
          trend="up"
          className="sm:col-span-1 lg:col-span-1"
        />
      </div>
    </div>
  );
};

export default KeyIndicators;