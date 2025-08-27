import React from 'react';
import { Mail, Phone, Globe, Smartphone, MapPin, ExternalLink, Lock } from 'lucide-react';

interface DetailItemProps {
  label: string;
  value: string;
  className?: string;
  status?: 'active' | 'pending' | 'inactive';
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, className = "", status }) => (
  <div className={`${className} ${status ? `status-${status}` : 'bg-gradient-to-br from-gray-50 to-slate-50'} rounded-xl p-4 border`}>
    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</dt>
    <dd className="text-sm font-semibold text-gray-900 break-words">{value}</dd>
  </div>
);

const ContactItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value?: string; 
  placeholder?: string;
  action?: () => void;
  actionLabel?: string;
}> = ({ 
  icon, 
  label, 
  value, 
  placeholder,
  action,
  actionLabel
}) => (
  <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl hover:from-gray-100 hover:to-slate-100 transition-all duration-200 border border-gray-200/50">
    <div className="flex-shrink-0 p-3 bg-white rounded-lg shadow-sm border border-gray-200/50">
      {icon}
    </div>
    <div className="flex-1">
      <div className="text-sm font-semibold text-gray-900 mb-1">{label}</div>
      {value ? (
        <div className="text-sm text-gray-600">{value}</div>
      ) : (
        <div className="text-sm text-gray-400">{placeholder || 'Not available'}</div>
      )}
    </div>
    {action && actionLabel && (
      <button 
        onClick={action}
        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
      >
        <span>{actionLabel}</span>
        <ExternalLink className="h-3 w-3" />
      </button>
    )}
  </div>
);

const CompanyDetails: React.FC = () => {
  const isContactLocked = true;

  return (
    <div className="space-y-8">
      {/* Contact Information */}
      <div className="card-elevated p-8 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Information</h3>
            <p className="text-gray-600">Get in touch with the company</p>
          </div>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
        </div>
        
        <div className={`${isContactLocked ? 'blur-sm opacity-80 pointer-events-none select-none' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ContactItem 
              icon={<Mail className="h-5 w-5 text-blue-600" />} 
              label="Email" 
              placeholder="Contact information available in full report"
              action={() => window.location.href = '/pricing'}
              actionLabel="Upgrade"
            />
            <ContactItem 
              icon={<Phone className="h-5 w-5 text-green-600" />} 
              label="Telephone" 
              value="+91-XXXXXXXXXX"
            />
            <ContactItem 
              icon={<Globe className="h-5 w-5 text-purple-600" />} 
              label="Website" 
              placeholder="Visit company website"
              action={() => window.open('https://example.com', '_blank')}
              actionLabel="Visit"
            />
            <ContactItem 
              icon={<Smartphone className="h-5 w-5 text-orange-600" />} 
              label="Mobile Apps" 
              placeholder="Available on App Store & Google Play"
              action={() => window.location.href = '/apps'}
              actionLabel="Download"
            />
          </div>
        </div>

        {isContactLocked && (
          <>
            {/* Center overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm px-4 sm:px-8 text-center">
              <div className="flex items-center space-x-2 text-gray-700 mb-3">
                <Lock className="h-5 w-5" />
                <span className="font-semibold">Contact information locked</span>
              </div>
              <button 
                onClick={() => (window.location.href = '/pricing')}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 text-sm sm:px-5 sm:py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Get instant access
              </button>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">Reveal email, phone, website and more</p>
            </div>

            {/* Bottom message bar (like preview screenshot) */}
            <div className="absolute left-0 right-0 bottom-0 z-20 bg-white/95 border-t border-gray-200">
              <div className="px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-2">
                  <span className="text-center text-xs sm:text-sm text-gray-700">Reveal contact details and communication channels -</span>
                  <button onClick={() => (window.location.href = '/pricing')} className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold underline-offset-2 hover:underline">Get instant access now!</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Company Details */}
      <div className="card-elevated p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Company Details</h3>
            <p className="text-gray-600">Official registration and legal information</p>
          </div>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
        </div>
        
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem 
            label="CIN/LLPIN" 
            value="L28100MP1979PLC049375" 
          />
          <DetailItem 
            label="Registration Number" 
            value="049375" 
          />
          <DetailItem 
            label="Incorporation Date" 
            value="28 September 1979" 
          />
          <DetailItem 
            label="Authorized Capital" 
            value="₹476.85 Cr" 
          />
          <DetailItem 
            label="Paid-Up Capital" 
            value="₹424.50 Cr" 
          />
          <DetailItem 
            label="ROC Code" 
            value="Roc Gwalior" 
          />
          <DetailItem 
            label="Listing Status" 
            value="Listed (BSE: 533272, NSE: CEBECO)" 
          />
          <DetailItem 
            label="Company Status" 
            value="Active" 
            status="active"
          />
        </dl>
      </div>
    </div>
  );
};

export default CompanyDetails;