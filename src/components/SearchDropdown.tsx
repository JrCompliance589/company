import React, { useEffect, useRef } from 'react';
import { Search, Building2, MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { SearchResult } from '../services/meiliSearch';

interface SearchDropdownProps {
  results: SearchResult[];
  isLoading: boolean;
  isVisible: boolean;
  onSelectResult: (result: SearchResult) => void;
  onClose: () => void;
  selectedIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  results,
  isLoading,
  isVisible,
  onSelectResult,
  onClose,
  selectedIndex = -1,
  onKeyDown,
}) => {
  if (!isVisible) return null;

  return (
    <>
      {/* Dark backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40" 
        onClick={onClose}
      />
      
      {/* Main dropdown container - Dark theme */}
      <div 
        className="absolute top-full left-0 right-0 mt-3 z-50 max-h-[480px] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(71, 85, 105, 0.2)',
          backdropFilter: 'blur(12px)'
        }}
      >
        {/* Header with dark gradient */}
        <div 
          className="px-6 py-4 border-b"
          style={{
            background: 'linear-gradient(90deg, rgba(51, 65, 85, 0.4) 0%, rgba(30, 41, 59, 0.6) 100%)',
            borderBottomColor: 'rgba(71, 85, 105, 0.3)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-2 h-2 rounded-full shadow-sm"
                style={{ backgroundColor: '#60a5fa' }}
              ></div>
              <span 
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: '#cbd5e1' }}
              >
                {isLoading ? 'Searching...' : `${results.length} Results`}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'rgba(71, 85, 105, 0.5)',
                color: '#cbd5e1'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.5)';
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="relative">
                <div 
                  className="animate-spin rounded-full h-10 w-10 border-2"
                  style={{ borderColor: 'rgba(71, 85, 105, 0.3)' }}
                ></div>
                <div 
                  className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent absolute top-0 left-0"
                  style={{ borderColor: '#60a5fa' }}
                ></div>
              </div>
              <span 
                className="ml-4 font-medium"
                style={{ color: '#cbd5e1' }}
              >
                Searching companies...
              </span>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result, index) => (
                <button
                  key={result.id || index}
                  onClick={() => onSelectResult(result)}
                  onKeyDown={onKeyDown}
                  className="w-full text-left p-4 rounded-xl transition-all duration-200 group border mb-1 last:mb-0"
                  style={{
                    backgroundColor: index === selectedIndex 
                      ? 'rgba(59, 130, 246, 0.15)' 
                      : 'transparent',
                    borderColor: index === selectedIndex 
                      ? 'rgba(96, 165, 250, 0.4)' 
                      : 'transparent',
                    transform: index === selectedIndex ? 'scale(1.01)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    if (index !== selectedIndex) {
                      e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.3)';
                      e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== selectedIndex) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-start space-x-4">
                    {/* Company Icon with dark theme */}
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200"
                      style={{
                        background: index === selectedIndex
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.3) 100%)'
                          : 'linear-gradient(135deg, rgba(71, 85, 105, 0.4) 0%, rgba(51, 65, 85, 0.6) 100%)',
                        border: index === selectedIndex ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid transparent'
                      }}
                    >
                      <Building2 
                        className="h-6 w-6 transition-colors" 
                        style={{ 
                          color: index === selectedIndex ? '#93c5fd' : '#cbd5e1' 
                        }} 
                      />
                    </div>
                    
                    {/* Company Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 
                            className="text-base font-semibold truncate transition-colors"
                            style={{ 
                              color: index === selectedIndex ? '#ffffff' : '#f1f5f9' 
                            }}
                          >
                            {result.CompanyName || result.company_name || result.name || 'Unknown Company'}
                          </h4>
                          <div 
                            className="flex-shrink-0 w-2 h-2 rounded-full shadow-sm"
                            style={{ backgroundColor: '#4ade80' }}
                          ></div>
                        </div>
                        
                        {/* Action indicator */}
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <ArrowUpRight className="h-4 w-4" style={{ color: '#94a3b8' }} />
                        </div>
                      </div>
                      
                      {/* Address */}
                      {result.address && (
                        <div className="flex items-center space-x-2 text-sm mb-2" style={{ color: '#cbd5e1' }}>
                          <MapPin className="h-4 w-4" style={{ color: '#94a3b8' }} />
                          <span className="truncate">{result.address}</span>
                        </div>
                      )}
                      
                      {/* Contact Information */}
                      <div className="flex items-center space-x-6">
                        {result.phone && (
                          <div className="flex items-center space-x-2 text-sm" style={{ color: '#94a3b8' }}>
                            <Phone className="h-3.5 w-3.5" style={{ color: '#6b7280' }} />
                            <span className="font-medium">{result.phone}</span>
                          </div>
                        )}
                        {result.email && (
                          <div className="flex items-center space-x-2 text-sm" style={{ color: '#94a3b8' }}>
                            <Mail className="h-3.5 w-3.5" style={{ color: '#6b7280' }} />
                            <span className="truncate font-medium">{result.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.4) 0%, rgba(51, 65, 85, 0.6) 100%)',
                  border: '1px solid rgba(71, 85, 105, 0.3)'
                }}
              >
                <Search className="h-8 w-8" style={{ color: '#94a3b8' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#e2e8f0' }}>
                No results found
              </h3>
              <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{ color: '#94a3b8' }}>
                We couldn't find any companies matching your search. Try using different keywords or check the spelling.
              </p>
            </div>
          )}
        </div>

        {/* Footer with dark theme */}
        {results.length > 0 && !isLoading && (
          <div 
            className="px-6 py-3 border-t"
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              borderTopColor: 'rgba(71, 85, 105, 0.3)'
            }}
          >
            <div className="flex items-center justify-between text-xs" style={{ color: '#94a3b8' }}>
              <span>Press ↵ to select</span>
              <span>ESC to close</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchDropdown;