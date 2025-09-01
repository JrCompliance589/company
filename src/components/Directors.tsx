import React from 'react';
import { Lock, ExternalLink, Shield } from 'lucide-react';

interface DirectorData {
  name: string;
  din: string;
  designation: string;
  appointedOn: string;
  formattedAppointedOn: string;
}

interface DirectorsProps {
  rawData?: any; // Raw MeiliSearch data (same structure as in your utils)
}

const formatDate = (dateString: string): string => {
  if (!dateString || dateString === 'N/A') return 'Not available';
  
  try {
    let date: Date;
    
    // Handle YYYY-MM-DD format (ISO format)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      date = new Date(dateString);
    }
    // Handle MM/DD/YYYY format
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      const [month, day, year] = dateString.split('/');
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Handle DD-MM-YYYY format
    else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-');
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Handle text formats like "31 Mar 2024"
    else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

const processDirectorsData = (data?: any): DirectorData[] => {
  // console.log('Processing directors data from:', data);
  
  if (!data) return [];
  
  try {
    let parsedJsonData: any;
    
    // Parse JsonData if it's a string
    if (typeof data.JsonData === 'string') {
      parsedJsonData = JSON.parse(data.JsonData);
    } else {
      parsedJsonData = data.JsonData;
    }
    
    // console.log('Parsed JsonData for directors:', parsedJsonData);
    
    // Try both paths: root level and under companyData
    const directorData = parsedJsonData?.directorData || parsedJsonData?.companyData?.directorData;
    
    // console.log('Found directorData:', directorData);
    // console.log('Type of directorData:', typeof directorData);
    // console.log('Is Array?', Array.isArray(directorData));
    
    if (!Array.isArray(directorData)) {
      // console.log('No director data found or not an array');
      return [];
    }
    
    // console.log('Raw director data array:', directorData);
    
    return directorData.map((director: any) => {
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
      
      const appointedOn = director.dateOfAppointment || '';
      const formattedAppointedOn = formatDate(appointedOn);
      
      // console.log('Processed director:', { name, din: director.DIN, designation, appointedOn, formattedAppointedOn });
      
      return {
        name: name || 'Unknown',
        din: director.DIN || '',
        designation: designation,
        appointedOn: appointedOn,
        formattedAppointedOn: formattedAppointedOn
      };
    });
  } catch (error) {
    console.error('Error processing directors data:', error);
    return [];
  }
};

const TableHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-gray-600 mt-1 text-sm">{subtitle}</p>}
    </div>
    <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
  </div>
);

const Directors: React.FC<DirectorsProps> = ({ rawData }) => {
  // console.log('Directors component received rawData:', rawData);
  
  const allDirectors = processDirectorsData(rawData);
  // console.log('Processed directors:', allDirectors);
  
  // Take only top 3 directors, pad with empty rows if less than 3
  const displayDirectors: (DirectorData | null)[] = [
    ...allDirectors.slice(0, 3),
    ...Array(Math.max(0, 3 - allDirectors.length)).fill(null)
  ];
  
  // console.log('Display directors:', displayDirectors);
  
  // For past directors, we'll show a locked view since this would be premium data
  const hasPastDirectors = allDirectors.length > 3;
  
  return (
    <div className="space-y-8">
      {/* Current Directors */}
      <div className="card-elevated p-6 md:p-8">
        <TableHeader 
          title="Directors" 
          subtitle={`Current board members and key management (${allDirectors.length} total)`} 
        />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DIN</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Designation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Appointed On</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {displayDirectors.map((director, index) => (
                <tr key={index} className={director ? "hover:bg-gray-50" : ""}>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {director?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {director?.din || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {director?.designation || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {director?.formattedAppointedOn || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {allDirectors.length > 3 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <Shield className="inline h-4 w-4 mr-1" />
              Showing top 3 directors. {allDirectors.length - 3} more directors available in premium view.
            </p>
          </div>
        )}
      </div>

      {/* Past Directors (Locked Premium Feature) */}
      <div className="relative card-elevated p-6 md:p-8 overflow-hidden">
        <TableHeader title="Past Directors" subtitle="Historical directorship details (locked)" />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DIN</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Designation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tenure</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {[1, 2, 3].map((idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-400">████████ ████</td>
                  <td className="px-4 py-3 text-sm text-gray-400">████████</td>
                  <td className="px-4 py-3 text-sm text-gray-400">████████</td>
                  <td className="px-4 py-3 text-sm text-gray-400">██ ███ ████</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Blur overlay */}
        <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center text-center px-4">
          <div className="flex items-center space-x-2 text-gray-700 mb-3">
            <Lock className="h-5 w-5" />
            <span className="font-semibold">Past directors details are locked</span>
          </div>
          <a
            href="/pricing"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Upgrade to Unlock
          </a>
          <p className="text-xs text-gray-600 mt-2">Access historical director data, tenure & changes</p>
        </div>
      </div>
    </div>
  );
};

export default Directors;