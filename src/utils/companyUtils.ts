import { SearchResult } from '../services/meiliSearch';

export interface ProcessedCompanyData {
  companyName: string;
  cin: string;
  address: string;
  dateOfIncorporation: string;
  authorisedCapital: string;
  paidUpCapital: string;
  roc: string;
  registrationNumber: string;
  listingStatus: string;
  companyAge: number;
  formattedIncorporationDate: string;
  formattedAuthorisedCapital: string;
  formattedPaidUpCapital: string;
  location: string;
}

export const calculateCompanyAge = (incorporationDate: string): number => {
  if (!incorporationDate || incorporationDate === 'N/A') return 0;
  
  try {
    let incorporation: Date;
    if (incorporationDate.includes('-')) {
      const [year, month, day] = incorporationDate.split('-');
      incorporation = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else if (incorporationDate.includes('/')) {
      const [month, day, year] = incorporationDate.split('/');
      incorporation = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      incorporation = new Date(incorporationDate);
    }
    
    if (isNaN(incorporation.getTime())) {
      throw new Error(`Invalid date: ${incorporationDate}`);
    }

    const currentDate = new Date();
    const ageInMs = currentDate.getTime() - incorporation.getTime();
    const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(ageInYears);
  } catch (error) {
    console.error('Error calculating company age:', error);
    return 0;
  }
};

export const formatDate = (dateString: string): string => {
  if (!dateString || dateString === 'N/A') return 'Not available';
  
  try {
    let date: Date;
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else if (dateString.includes('/')) {
      const [month, day, year] = dateString.split('/');
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${dateString}`);
    }

    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return `Error: ${dateString}`;
  }
};

export const formatCurrency = (amount: string): string => {
  if (!amount) return '';
  
  try {
    const numericValue = parseFloat(amount.replace(/[^\d.]/g, ''));
    if (isNaN(numericValue)) return amount;
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericValue);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return amount;
  }
};

export const processCompanyData = (data: SearchResult): ProcessedCompanyData => {
  const companyName = data.CompanyName || data.company_name || data.name || 'Unknown Company';
  const cin = data.CIN || '';
  const address = data.Address || '';
  const dateOfIncorporation = data.DateOfIncorporation || data.dateOfIncorporation || data.DateofIncorporation || data.date_of_incorporation || 'N/A';
  console.log('Raw MeiliSearch data:', JSON.stringify(data, null, 2));
  console.log('Raw dateOfIncorporation:', data.DateOfIncorporation, data.dateOfIncorporation, data.DateofIncorporation, data.date_of_incorporation);
  console.log('Processed dateOfIncorporation:', dateOfIncorporation);
  const authorisedCapital = data.AuthorisedCapital || data.authorisedCapital || '';
  const paidUpCapital = data.PaidUpCapital || data.paidUpCapital || '';
  const roc = data.ROC || '';
  const registrationNumber = data.RegistrationNumber || data.registerationNumber || data.registrationNumber || '';
  const listingStatus = data.whetherListedOrNot === 'Y' ? 'Listed' : data.whetherListedOrNot === 'N' ? 'Not Listed' : '';

  // Parse JsonData string and handle MCAMDSCompanyAddress array safely
  let addressData: any = {};
  let city = '';
  let state = '';
  let parsedJsonData: any = null;
  
  try {
    // Parse JsonData if it's a string
    if (typeof data.JsonData === 'string') {
      parsedJsonData = JSON.parse(data.JsonData);
    } else {
      parsedJsonData = data.JsonData;
    }
    
    console.log('Parsed JsonData:', JSON.stringify(parsedJsonData, null, 2));
    
    if (parsedJsonData?.companyData?.MCAMDSCompanyAddress && Array.isArray(parsedJsonData.companyData.MCAMDSCompanyAddress)) {
      // First try to find Registered Address, then any active address, then first address
      addressData = parsedJsonData.companyData.MCAMDSCompanyAddress.find((addr: any) => addr.addressType === 'Registered Address') ||
                    parsedJsonData.companyData.MCAMDSCompanyAddress.find((addr: any) => addr.activeStatus === 'Y') ||
                    parsedJsonData.companyData.MCAMDSCompanyAddress[0] || {};
      
      city = addressData?.city || '';
      state = addressData?.state || '';
      
      console.log('Found address data:', addressData);
      console.log('Extracted city:', city, 'state:', state);
    }
  } catch (error) {
    console.error('Error parsing JsonData:', error);
  }
  
  // Fallback to direct address field if JsonData location is not available
  const location = (city && state) ? `${city}, ${state}` : (address ? address : '');

  console.log('Raw JsonData type:', typeof data.JsonData);
  console.log('Parsed JsonData:', JSON.stringify(parsedJsonData, null, 2));
  console.log('Processed addressData:', JSON.stringify(addressData, null, 2));
  console.log('Processed location:', location);
  console.log('City:', city, 'State:', state);
  console.log('Fallback address:', address);

  const companyAge = calculateCompanyAge(dateOfIncorporation);
  const formattedIncorporationDate = formatDate(dateOfIncorporation);
  console.log('FormattedIncorporationDate:', formattedIncorporationDate);
  const formattedAuthorisedCapital = formatCurrency(authorisedCapital);
  const formattedPaidUpCapital = formatCurrency(paidUpCapital);

  return {
    companyName,
    cin,
    address,
    dateOfIncorporation,
    authorisedCapital,
    paidUpCapital,
    roc,
    registrationNumber,
    listingStatus,
    companyAge,
    formattedIncorporationDate,
    formattedAuthorisedCapital,
    formattedPaidUpCapital,
    location
  };
};