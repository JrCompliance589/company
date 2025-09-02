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
  companyAgeInMonths: number;
  formattedIncorporationDate: string;
  formattedAuthorisedCapital: string;
  formattedPaidUpCapital: string;
  location: string;
  classOfCompany: string;
  openCharges: string;
  settledLoans: string;
  formattedOpenCharges: string;
  formattedSettledLoans: string;
}

export interface DirectorData {
  name: string;
  din: string;
  designation: string;
  appointedOn: string;
  formattedAppointedOn: string;
}

export const calculateCompanyAge = (incorporationDate: string): { years: number; months: number; ageInMonths: number } => {
  if (!incorporationDate || incorporationDate === 'N/A') return { years: 0, months: 0, ageInMonths: 0 };
  
  // console.log('calculateCompanyAge input:', incorporationDate);
  
  try {
    let incorporation: Date;
    
    // Handle YYYY-MM-DD format (ISO format)
    if (/^\d{4}-\d{2}-\d{2}$/.test(incorporationDate)) {
      // console.log('Detected YYYY-MM-DD format');
      incorporation = new Date(incorporationDate);
    }
    // Handle MM/DD/YYYY format
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(incorporationDate)) {
      // console.log('Detected MM/DD/YYYY format');
      const [month, day, year] = incorporationDate.split('/');
      incorporation = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Handle DD/MM/YYYY format
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(incorporationDate)) {
      // console.log('Detected DD/MM/YYYY format');
      const [day, month, year] = incorporationDate.split('/');
      incorporation = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Handle DD-MM-YYYY format
    else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(incorporationDate)) {
      // console.log('Detected DD-MM-YYYY format');
      const [day, month, year] = incorporationDate.split('-');
      incorporation = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Handle formats like "31 Mar 2024" or "October 1, 2024"
    else {
      // console.log('Detected text date format, using Date constructor');
      incorporation = new Date(incorporationDate);
    }
    
    // console.log('Parsed incorporation date:', incorporation);
    
    if (isNaN(incorporation.getTime())) {
      console.error(`Invalid date parsed: ${incorporationDate} -> ${incorporation}`);
      return { years: 0, months: 0, ageInMonths: 0 };
    }

    const currentDate = new Date();
    // console.log('Current date:', currentDate);
    
    // Calculate age in years and months
    let years = currentDate.getFullYear() - incorporation.getFullYear();
    let months = currentDate.getMonth() - incorporation.getMonth();
    
    // Adjust if current month/day is before incorporation month/day
    if (months < 0 || (months === 0 && currentDate.getDate() < incorporation.getDate())) {
      years--;
      months += 12;
    }
    
    // Calculate total months for cases where we want to show months instead of years
    const totalMonths = years * 12 + months;
    
    // console.log('Calculated age:', { years, months, totalMonths });
    
    // Return negative values as 0
    if (years < 0) {
      console.warn(`Incorporation date ${incorporationDate} is in the future`);
      return { years: 0, months: 0, ageInMonths: 0 };
    }
    
    return { years, months, ageInMonths: totalMonths };
  } catch (error) {
    console.error('Error calculating company age:', error, 'for date:', incorporationDate);
    return { years: 0, months: 0, ageInMonths: 0 };
  }
};

export const formatDate = (dateString: string): string => {
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
      console.error(`Invalid date format: ${dateString}`);
      return `Error: ${dateString}`;
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
    
    // Format based on Indian numbering system
    if (numericValue >= 10000000) { // 1 crore and above
      const crores = numericValue / 10000000;
      return `₹${crores.toFixed(2)} Cr`;
    } else if (numericValue >= 100000) { // 1 lakh and above
      const lakhs = numericValue / 100000;
      return `₹${lakhs.toFixed(2)} L`;
    } else if (numericValue >= 1000) { // 1 thousand and above
      const thousands = numericValue / 1000;
      return `₹${thousands.toFixed(2)} K`;
    } else {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numericValue);
    }
  } catch (error) {
    console.error('Error formatting currency:', error);
    return amount;
  }
};

export const processChargesData = (data: SearchResult): { openCharges: number; settledLoans: number } => {
  let openChargesTotal = 0;
  let settledLoansTotal = 0;

  try {
    let parsedJsonData: any;
    
    // Parse JsonData if it's a string
    if (typeof data.JsonData === 'string') {
      parsedJsonData = JSON.parse(data.JsonData);
    } else {
      parsedJsonData = data.JsonData;
    }

    // Try different possible paths for charges data
    const chargesData = parsedJsonData?.indexChargesData || 
                       parsedJsonData?.companyData?.indexChargesData ||
                       parsedJsonData?.indexcharges ||
                       parsedJsonData?.companyData?.indexcharges;

    //console.log('Processing charges data:', chargesData);

    if (Array.isArray(chargesData)) {
      chargesData.forEach((charge: any) => {
        const amount = parseFloat(charge.amount || '0');
        const status = (charge.chargeStatus || '').toLowerCase();
        
        //console.log(`Charge: ${charge.chargeHolderName}, Amount: ${amount}, Status: ${status}`);
        
        if (status === 'open' || status === 'active') {
          openChargesTotal += amount;
        } else if (status === 'closed' || status === 'satisfied') {
          settledLoansTotal += amount;
        }
      });
    }

    //console.log(`Total open charges: ${openChargesTotal}, Total settled loans: ${settledLoansTotal}`);
  } catch (error) {
    console.error('Error processing charges data:', error);
  }

  return { openCharges: openChargesTotal, settledLoans: settledLoansTotal };
};

export const processDirectorsData = (data: SearchResult): DirectorData[] => {
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

export const processCompanyData = (data: SearchResult): ProcessedCompanyData => {
  const companyName = data.CompanyName || data.company_name || data.name || 'Unknown Company';
  const cin = data.CIN || '';
  const address = data.Address || '';
  const dateOfIncorporation = data.DateOfIncorporation || data.dateOfIncorporation || data.DateofIncorporation || data.date_of_incorporation || 'N/A';
  //console.log('Raw MeiliSearch data:', JSON.stringify(data, null, 2));
  // console.log('Raw dateOfIncorporation fields:', {
  //   DateOfIncorporation: data.DateOfIncorporation,
  //   dateOfIncorporation: data.dateOfIncorporation,
  //   DateofIncorporation: data.DateofIncorporation,
  //   date_of_incorporation: data.date_of_incorporation
  // });
  // console.log('Final processed dateOfIncorporation:', dateOfIncorporation);
  
  const authorisedCapital = data.AuthorisedCapital || data.authorisedCapital || '';
  const paidUpCapital = data.PaidUpCapital || data.paidUpCapital || '';
  const roc = data.RocName || data.rocName || data.roc || '';
  const registrationNumber = data.RegistrationNumber || data.registerationNumber || data.registrationNumber || '';
  const listingStatus = data.whetherListedOrNot === 'Y' ? 'Listed' : data.whetherListedOrNot === 'N' ? 'Not Listed' : '';
  
  // Extract ClassOfCompany field
  const classOfCompany = data.ClassOfCompany || '';

  // Process charges data
  const chargesInfo = processChargesData(data);

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
    
    // console.log('Parsed JsonData:', JSON.stringify(parsedJsonData, null, 2));
    
    if (parsedJsonData?.companyData?.MCAMDSCompanyAddress && Array.isArray(parsedJsonData.companyData.MCAMDSCompanyAddress)) {
      // First try to find Registered Address, then any active address, then first address
      addressData = parsedJsonData.companyData.MCAMDSCompanyAddress.find((addr: any) => addr.addressType === 'Registered Address') ||
                    parsedJsonData.companyData.MCAMDSCompanyAddress.find((addr: any) => addr.activeStatus === 'Y') ||
                    parsedJsonData.companyData.MCAMDSCompanyAddress[0] || {};
      
      city = addressData?.city || '';
      state = addressData?.state || '';
      
      // console.log('Found address data:', addressData);
      // console.log('Extracted city:', city, 'state:', state);
    }
  } catch (error) {
    console.error('Error parsing JsonData:', error);
  }
  
  // Fallback to direct address field if JsonData location is not available
  const location = (city && state) ? `${city}, ${state}` : (address ? address : '');

  // console.log('Raw JsonData type:', typeof data.JsonData);
  // console.log('Parsed JsonData:', JSON.stringify(parsedJsonData, null, 2));
  // console.log('Processed addressData:', JSON.stringify(addressData, null, 2));
  // console.log('Processed location:', location);
  // console.log('City:', city, 'State:', state);
  // console.log('Fallback address:', address);

  const ageData = calculateCompanyAge(dateOfIncorporation);
  const formattedIncorporationDate = formatDate(dateOfIncorporation);
  // console.log('FormattedIncorporationDate:', formattedIncorporationDate);
  // console.log('Age data:', ageData);
  const formattedAuthorisedCapital = formatCurrency(authorisedCapital);
  const formattedPaidUpCapital = formatCurrency(paidUpCapital);
  const formattedOpenCharges = formatCurrency(chargesInfo.openCharges.toString());
  const formattedSettledLoans = formatCurrency(chargesInfo.settledLoans.toString());

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
    companyAge: ageData.years,
    companyAgeInMonths: ageData.ageInMonths,
    formattedIncorporationDate,
    formattedAuthorisedCapital,
    formattedPaidUpCapital,
    location,
    classOfCompany,
    openCharges: chargesInfo.openCharges.toString(),
    settledLoans: chargesInfo.settledLoans.toString(),
    formattedOpenCharges,
    formattedSettledLoans
  };
};