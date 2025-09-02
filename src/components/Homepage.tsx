import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Users, Target, Shield, ArrowRight, TrendingUp, Building2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { meiliSearchService, SearchResult } from '../services/meiliSearch';
import SearchDropdown from './SearchDropdown';
import Header from './Header';
import Footer from './Footer';

const Homepage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeoutRef = useRef<number | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    setShowDropdown(true);
    setSelectedIndex(-1);

    try {
      const results = await meiliSearchService.search(query, 8);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      // Show error message to user
      //console.log('MeiliSearch connection failed. Please check if the service is running.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle search input changes with debouncing
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  // Handle result selection - Updated with debugging and proper navigation
  const handleSelectResult = (result: SearchResult) => {
    //console.log('Homepage: handleSelectResult called with:', result);
    
    setSearchQuery(result.CompanyName || result.company_name || result.name || '');
    setShowDropdown(false);
    setSelectedIndex(-1);
    
    // Navigate to dynamic company profile URL
    if (result.CIN) {
      const companyNameSlug = (result.CompanyName || result.company_name || result.name || 'unknown')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const navigationUrl = `/company/${companyNameSlug}/${result.CIN}`;
      //console.log('Homepage: Navigating to:', navigationUrl);
      
      // Use setTimeout to ensure state updates complete before navigation
      setTimeout(() => {
        window.location.href = navigationUrl;
      }, 100);
    } else {
      //console.log('Homepage: No CIN found, navigating to default');
      // Fallback to default company page if no CIN
      setTimeout(() => {
        window.location.href = '/company';
      }, 100);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          //console.log('Homepage: Enter key pressed, selecting result:', searchResults[selectedIndex]);
          handleSelectResult(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      // Ignore clicks inside the portal-rendered dropdown
      if (target && target.closest('[data-search-dropdown="true"]')) {
        return;
      }

      if (searchContainerRef.current && !searchContainerRef.current.contains(target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to company profile - for demo purposes, we'll use Jupiter Wagons
      window.location.href = '/company';
    }
  };

  const features = [
    {
      icon: <Building2 className="h-8 w-8 text-blue-600" />,
      title: "Optimize Your B2B Database",
      description: "Eliminate outdated records, refresh current data, and integrate new, verified B2B information.",
      image: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Gain Insights on Companies & Directors",
      description: "Make informed decisions with in-depth intelligence on businesses and key stakeholders.",
      image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    },
    {
      icon: <Target className="h-8 w-8 text-purple-600" />,
      title: "Build Targeted B2B Prospect Lists",
      description: "Maximize outreach with customized marketing lists tailored to your ideal audience.",
      image: "https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Stay Ahead of Risks & Opportunities",
      description: "Be the first to spot changes that impact your key partners and prospects.",
      image: "https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    }
  ];

  const [quickSearchSuggestions, setQuickSearchSuggestions] = useState<string[]>([]);

  // Load quick search suggestions from MeiliSearch
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        // Get some sample companies from the index
        const suggestions = await meiliSearchService.getSuggestions('a', 3);
        if (suggestions.length > 0) {
          setQuickSearchSuggestions(suggestions);
        }
      } catch (error) {
        console.error('Failed to load suggestions:', error);
        // Keep empty array if MeiliSearch is not available
      }
    };

    loadSuggestions();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #1a1054, #255ff1)" }}>
      {/* Header Component */}
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Empowering Your Decisions with{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Actionable Data
              </span>{' '}
              and Insights
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
            >
              Get real-time data and intelligent recommendations to keep your business ahead.
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-gray-400 mb-12 max-w-5xl mx-auto leading-relaxed"
            >
              Make informed decisions with speed and confidence using The VerifyVista. Whether you're evaluating startups or analyzing large enterprises, our platform delivers the most comprehensive and reliable data intelligence tailored for professionals in banking, finance, corporate, and government sectors.
            </motion.p>

            {/* Search Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div ref={searchContainerRef} className="relative">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                      placeholder="Search Company"
                      className="w-full pl-12 pr-32 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-300 text-lg transition-all duration-300 hover:bg-white/15"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 group"
                    >
                      <span>Search</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                </form>
                
                {/* Search Dropdown */}
                <SearchDropdown
                  results={searchResults}
                  isLoading={isLoading}
                  isVisible={showDropdown}
                  onSelectResult={handleSelectResult}
                  onClose={() => setShowDropdown(false)}
                  selectedIndex={selectedIndex}
                  onKeyDown={handleKeyDown}
                  searchContainerRef={searchContainerRef}
                />
              </div>

              {/* Quick Search Suggestions */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {quickSearchSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    onClick={async () => {
                      setSearchQuery(suggestion);
                      try {
                        const results = await meiliSearchService.search(suggestion, 1);
                        if (results.length > 0 && results[0].CIN) {
                          const companyNameSlug = (results[0].CompanyName || results[0].company_name || results[0].name || 'unknown')
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-+|-+$/g, '');
                          
                          window.location.href = `/company/${companyNameSlug}/${results[0].CIN}`;
                        } else {
                          performSearch(suggestion);
                        }
                      } catch (error) {
                        console.error('Error navigating to company:', error);
                        performSearch(suggestion);
                      }
                    }}
                    className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-200 text-sm"
                  >
                    <Search className="h-3 w-3 inline mr-2" />
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <button
                onClick={() => window.location.href = '/company'}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3 mx-auto group"
              >
                <span>Show Company Profile</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Power Your Business with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Data-Driven Insights
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Unlock actionable intelligence to enhance decision-making, optimize outreach, and stay ahead of market changes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-gray-100 to-gray-200">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16 mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { number: "10M+", label: "Companies Tracked", icon: <Building2 className="h-8 w-8 text-blue-600" /> },
              { number: "500K+", label: "Active Users", icon: <Users className="h-8 w-8 text-green-600" /> },
              { number: "99.9%", label: "Data Accuracy", icon: <TrendingUp className="h-8 w-8 text-purple-600" /> },
              { number: "24/7", label: "Real-time Updates", icon: <Zap className="h-8 w-8 text-yellow-600" /> }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6"
              >
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Homepage;