import React, { useEffect } from 'react';
import { Shield, Share2, Download, MapPin, Calendar, TrendingUp, Building2, ExternalLink, Globe } from 'lucide-react';
import { ProcessedCompanyData } from '../utils/companyUtils';

interface CompanyHeaderProps {
  companyData?: ProcessedCompanyData | null;
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({ companyData }) => {
  // Helper functions for website handling
  const formatWebsiteUrl = (website: string | undefined): string | null => {
    if (!website || !website.trim()) return null;
    const cleanUrl = website.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return `https://${cleanUrl}`;
    }
    return cleanUrl;
  };

  const getDisplayUrl = (website: string | undefined): string => {
    if (!website) return 'Not Available';
    return website
      .replace(/^https?:\/\//, '') // Remove protocol
      .replace(/^www\./, '')       // Remove www
      .replace(/\/$/, '');         // Remove trailing slash
  };

  // Helper function for logo handling
  const convertBase64ToImageUrl = (base64String: string): string | null => {
    try {
      // Remove data URL prefix if present
      const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Convert base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create blob and return object URL - assume WebP format based on your data
      const blob = new Blob([bytes], { type: 'image/webp' });
      return URL.createObjectURL(blob);
    } catch (error) {
      //console.error('Error converting base64 to image URL:', error);
      return null;
    }
  };

  // Process website data
  const websiteField = companyData?.Website || companyData?.website;
  const websiteUrl = formatWebsiteUrl(websiteField);
  const displayWebsite = getDisplayUrl(websiteField);
  const hasWebsite = !!(websiteField && websiteField.trim());

  // Process logo data - Debug logging
  {/*console.log('Logo processing debug:', {
    logoUrl: companyData?.logoUrl,
    hasLogoUrl: !!(companyData?.logoUrl),
    logoUrlLength: companyData?.logoUrl?.length
  }); */}
  //

  const logoBase64 = companyData?.logoUrl;
  const hasLogo = !!(logoBase64 && logoBase64.trim());
  let logoImageUrl: string | null = null;
  
  if (hasLogo) {
    try {
      logoImageUrl = convertBase64ToImageUrl(logoBase64);
      //console.log('Logo conversion result:', logoImageUrl ? 'success' : 'failed');
    } catch (error) {
      //console.error('Failed to convert logo:', error);
      logoImageUrl = null;
    }
  }
  
  const shouldShowLogo = hasLogo && logoImageUrl;

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (logoImageUrl) {
        URL.revokeObjectURL(logoImageUrl);
      }
    };
  }, [logoImageUrl]);

  return (
    <div className="card-elevated p-4 sm:p-6 md:p-8 mb-6 md:mb-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
        <div className="flex items-start gap-4 md:gap-6 min-w-0 flex-1">
          {/* Company Logo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border border-blue-200/50">
            {shouldShowLogo ? (
              <img 
                src={logoImageUrl}
                alt={`${companyData?.companyName || 'Company'} logo`}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain rounded-xl"
                onError={(e) => {
                  //console.error('Logo failed to load');
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'flex';
                    fallback.classList.remove('hidden');
                  }
                }}
              />
            ) : null}
            {/* Default fallback logo */}
            <div 
              className={`w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg ${shouldShowLogo ? 'hidden' : 'flex'}`}
            >
              <Building2 className="h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white" />
            </div>
          </div>

          {/* Company Info with integrated share button */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-3 md:mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight break-words">
                    {companyData?.companyName || 'Jupiter Wagons Limited'}
                  </h1>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-2.5 py-1 rounded-full border border-green-200/50">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">Verified</span>
                  </div>
                </div>
              </div>
              
              {/* Share button integrated into the layout */}
              <button className="p-2.5 md:p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200/50 flex-shrink-0">
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-3 md:mb-4 leading-relaxed text-sm sm:text-base">
              A leading{' '}
              {companyData?.classOfCompany
                ? companyData.classOfCompany.toLowerCase().includes('public')
                  ? 'public limited company'
                  : companyData.classOfCompany.toLowerCase().includes('private')
                    ? 'private limited company'
                    : companyData.classOfCompany.toLowerCase()
                : 'limited company'}{' '}
              based in {companyData?.location || 'Jabalpur, Madhya Pradesh, India'}, established in{' '}
              {companyData?.formattedIncorporationDate || '1979'}.
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium text-gray-700">
                  Est. {companyData?.dateOfIncorporation || 'Not available'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <MapPin className="h-4 w-4 text-purple-600" />
                </div>
                <span className="font-medium text-gray-700">
                  {companyData?.location || 'Jabalpur, MP'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="font-semibold text-green-600">Active</span>
              </div>
              
              {/* Dynamic Website Section */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <Globe className="h-4 w-4 text-indigo-600" />
                </div>
                {hasWebsite ? (
                  <a
                    href={websiteUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                    title={`Visit ${companyData?.companyName || 'company'} website`}
                  >
                    <span className="text-xs sm:text-sm">{displayWebsite}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="font-medium text-gray-500 text-xs sm:text-sm">
                    No Website
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 md:mt-8 pt-6 border-t border-gray-200/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Authorised Capital</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">
                {companyData?.formattedAuthorisedCapital || '₹2,079.33 Cr'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Paid Up Capital</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">
                {companyData?.formattedPaidUpCapital || '₹908.60 Cr'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200/50">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Status</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">
                {companyData?.listingStatus || 'Listed'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200/50">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Incorporated</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">
                {companyData?.dateOfIncorporation || 'June 25, 2025'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyHeader;