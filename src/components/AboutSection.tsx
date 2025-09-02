import React from 'react';
import { ExternalLink, MapPin, Building2, Calendar, Users } from 'lucide-react';
import { ProcessedCompanyData } from '../utils/companyUtils';

interface AboutSectionProps {
  companyData?: ProcessedCompanyData | null;
  rawData?: any; // Raw MeiliSearch data for processing directors
}

const AboutSection: React.FC<AboutSectionProps> = ({ companyData, rawData }) => {
  // Function to determine company type
  const getCompanyType = () => {
    // First check ClassOfCompany field
    if (companyData?.classOfCompany) {
      const classType = companyData.classOfCompany.toLowerCase();
      if (classType.includes('public')) {
        return 'active public limited company';
      } else if (classType.includes('private')) {
        return 'active private limited company';
      }
      // If ClassOfCompany has other values, use it as is
      return `active ${companyData.classOfCompany.toLowerCase()} company`;
    }
    
    // If ClassOfCompany is blank, check company name for "llp"
    const companyName = companyData?.companyName || '';
    if (companyName.toLowerCase().includes('llp')) {
      return 'active LLP';
    }
    
    // Default fallback
    return 'active company';
  };

  // Function to process directors data (same logic as Directors component)
  const processDirectorsData = (data?: any) => {
    //console.log('AboutSection - Processing directors data from:', data);
    
    if (!data) {
      //console.log('AboutSection - No data provided');
      return [];
    }
    
    try {
      let parsedJsonData: any;
      
      // Parse JsonData if it's a string
      if (typeof data.JsonData === 'string') {
        parsedJsonData = JSON.parse(data.JsonData);
      } else {
        parsedJsonData = data.JsonData;
      }
      
      //console.log('AboutSection - Parsed JsonData:', parsedJsonData);
      
      // Try both paths: root level and under companyData
      const directorData = parsedJsonData?.directorData || parsedJsonData?.companyData?.directorData;
      
      //console.log('AboutSection - Found directorData:', directorData);
      //console.log('AboutSection - Is directorData an array?', Array.isArray(directorData));
      
      if (!Array.isArray(directorData)) {
        //console.log('AboutSection - No director data found or not an array');
        return [];
      }
      
      const processedDirectors = directorData.map((director: any) => {
        const firstName = director.FirstName || '';
        const middleName = director.MiddleName || '';
        const lastName = director.LastName || '';
        
        // Construct full name
        const name = [firstName, middleName, lastName].filter(Boolean).join(' ');
        
        // Get designation from MCAUserRole if available, otherwise use direct designation
        let designation = 'Director';
        if (director.MCAUserRole && Array.isArray(director.MCAUserRole) && director.MCAUserRole.length > 0) {
          designation = director.MCAUserRole[0].designation || director.MCAUserRole[0].role || 'Director';
          // Clean up designation text
          if (designation === 'Director/Designated Partner') {
            designation = 'Director';
          }
        }
        
        //console.log('AboutSection - Processed director:', { name, designation });
        
        return {
          name: name || 'Unknown',
          designation: designation
        };
      });
      
      //console.log('AboutSection - All processed directors:', processedDirectors);
      return processedDirectors;
    } catch (error) {
      //console.error('AboutSection - Error processing directors data:', error);
      return [];
    }
  };

  const companyType = getCompanyType();
  const directors = processDirectorsData(rawData);

  // Generate dynamic leadership text
  const getLeadershipText = () => {
    //console.log('AboutSection - Getting leadership text, directors:', directors);
    
    if (directors.length === 0) {
      //console.log('AboutSection - No directors found, using fallback text');
      return 'Vivek Lohia (Director), Vikash Lohia (Whole-Time Director), Vivek Lohia (Managing Director)';
    }
    
    const leadershipText = directors.slice(0, 3).map(director => 
      `${director.name} (${director.designation})`
    ).join(', ');
    
    //console.log('AboutSection - Generated leadership text:', leadershipText);
    return leadershipText;
  };

  return (
    <div className="card-elevated p-8 mb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            About {companyData?.companyName || 'Jupiter Wagons Limited'}
          </h2>
          <p className="text-gray-600">Comprehensive company overview and background information</p>
        </div>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
      </div>
      
      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Industry</p>
            <p className="text-sm font-semibold text-gray-900">Manufacturing</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Established</p>
            <p className="text-sm font-semibold text-gray-900">
              {companyData?.formattedIncorporationDate || '28 September 1979'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200/50">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MapPin className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Location</p>
            <p className="text-sm font-semibold text-gray-900">
              {companyData?.location || 'Jabalpur, MP'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed mb-6 text-base">
          <span className="font-semibold text-gray-900">{companyData?.companyName || 'Jupiter Wagons Limited'}</span>, a {companyType}, was established on {companyData?.formattedIncorporationDate || '28 September 1979'} in {companyData?.location || 'Jabalpur, Madhya Pradesh, India'}. It holds CIN: {companyData?.cin || 'L28100MP1979PLC049375'}. Registered under {companyData?.roc || 'Roc Gwalior'}. It is listed on NSE and BSE{' '}
          {/* 
<a href="#" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center transition-colors duration-200">
  BSE: 533272
  <ExternalLink className="h-3 w-3 ml-1" />
</a>{' '}
and{' '}
<a href="#" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center transition-colors duration-200">
  NSE: CEBECO
  <ExternalLink className="h-3 w-3 ml-1" />
</a>
*/}
          . It has an authorized capital of {companyData?.formattedAuthorisedCapital || '₹476.85 Cr'} and a paid-up capital of {companyData?.formattedPaidUpCapital || '₹424.50 Cr'}.
        </p>

        <p className="text-gray-700 leading-relaxed mb-6 text-base">
           It upholds a compliant status. In 2023, it reported revenue of <span className="relative inline-block">
            <span className="blur-sm select-none">{companyData?.formattedAuthorisedCapital || '₹2,079.33 Cr'}</span>
            <span className="absolute inset-0 bg-gray-200/30"></span>
          </span> and a net worth of <span className="relative inline-block">
            <span className="blur-sm select-none">{companyData?.formattedPaidUpCapital || '₹908.60 Cr'}</span>
            <span className="absolute inset-0 bg-gray-200/30"></span>
          </span>. Its leadership includes{' '}
          <span className="font-semibold text-gray-900">{getLeadershipText()}</span>. It holds {companyData?.formattedOpenCharges || '₹0'} open charges and {companyData?.formattedSettledLoans || '₹0'} settled loans. It is based at {companyData?.location || '46, Vandana Vihar, Narmada Road, Gorakhpur, Jabalpur, Madhya Pradesh, 482001'}.
        </p>
      </div>
      
      {/* Call to Action */}
      <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">Need More Details?</h4>
            <p className="text-sm text-gray-600">Access comprehensive financial data, director information, and detailed reports.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md sm:flex-shrink-0"
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;