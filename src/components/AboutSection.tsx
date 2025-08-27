import React from 'react';
import { ExternalLink, MapPin, Building2, Calendar, Users } from 'lucide-react';

const AboutSection: React.FC = () => {
  return (
    <div className="card-elevated p-8 mb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">About Jupiter Wagons Limited</h2>
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
            <p className="text-sm font-semibold text-gray-900">28 September 1979</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200/50">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MapPin className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Location</p>
            <p className="text-sm font-semibold text-gray-900">Jabalpur, MP</p>
          </div>
        </div>
      </div>
      
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed mb-6 text-base">
          <span className="font-semibold text-gray-900">Jupiter Wagons Limited</span>, a active public limited company, was established on 28 September 1979 in Jabalpur, Madhya Pradesh, India. Engaging in commercial vehicles & fleet within the manufacturing sector, it holds CIN: L28100MP1979PLC049375. Registered under ROC Roc Gwalior. It is listed on{' '}
          <a href="#" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center transition-colors duration-200">
            BSE: 533272
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center transition-colors duration-200">
            NSE: CEBECO
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
          . It has an authorized capital of ₹476.85 Cr and a paid-up capital of ₹424.50 Cr.
        </p>

        <p className="text-gray-700 leading-relaxed mb-6 text-base">
          Formerly known as Commercial Engineers & Body Builders Co Limited, Commercial Engineers & Body Builders Co Private Limited, it upholds a compliant status. In 2023, it reported revenue of ₹2,079.33 Cr and a net worth of ₹908.60 Cr. Its leadership includes{' '}
          <span className="font-semibold text-gray-900">Vivek Lohia</span> (Director),{' '}
          <span className="font-semibold text-gray-900">Vikash Lohia</span> (Whole-Time Director),{' '}
          <span className="font-semibold text-gray-900">Vivek Lohia</span> (Managing Director). Past directors included Vineet Chandra, Kailash Chand Gupta, Anil Goyal Joshi. It holds ₹2,843.73 Cr open charges and ₹3,559.02 Cr settled loans. Its latest AGM occurred on 12 September 2024, with the balance sheet filed on 31 March 2024. It is based at 46, Vandana Vihar, Narmada Road, Gorakhpur, Jabalpur, Madhya Pradesh, 482001.
        </p>
      </div>
      
      {/* Call to Action */}
      <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">Need More Details?</h4>
            <p className="text-sm text-gray-600">Access comprehensive financial data, director information, and detailed reports.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;