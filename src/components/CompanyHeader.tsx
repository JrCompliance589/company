import React from 'react';
import { Shield, Share2, Download, MapPin, Calendar, TrendingUp, Building2 } from 'lucide-react';

const CompanyHeader: React.FC = () => {
  return (
    <div className="card-elevated p-4 sm:p-6 md:p-8 mb-6 md:mb-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
        <div className="flex items-start gap-4 md:gap-6 min-w-0 flex-1">
          {/* Company Logo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border border-blue-200/50">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
            </div>
          </div>

          {/* Company Info with integrated share button */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-3 md:mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight break-words">
                    Jupiter Wagons Limited
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
              A leading automotive public limited company based in Jabalpur, Madhya Pradesh, India, established in 1979. Specializing in commercial vehicles & fleet manufacturing.
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium text-gray-700">Est. 1979</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <MapPin className="h-4 w-4 text-purple-600" />
                </div>
                <span className="font-medium text-gray-700">Jabalpur, MP</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="font-semibold text-green-600">Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-gray-100 rounded-lg">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                </div>
                <span className="font-semibold text-gray-600">Website</span>
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
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Revenue</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">₹2,079.33 Cr</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Net Worth</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">₹908.60 Cr</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200/50">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Status</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">Listed</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200/50">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Incorporated</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">June 25, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyHeader;