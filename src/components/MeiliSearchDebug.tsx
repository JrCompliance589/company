import React, { useState } from 'react';
import { meiliSearchService } from '../services/meiliSearch';

const MeiliSearchDebug: React.FC = () => {
  const [testQuery, setTestQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [indexInfo, setIndexInfo] = useState<any>(null);

  const testSearch = async () => {
    if (!testQuery.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const searchResults = await meiliSearchService.search(testQuery, 5);
      setResults(searchResults);
      //console.log('Search results:', searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIndexInfo = async () => {
    setLoading(true);
    try {
      const info = await meiliSearchService.getIndexInfo();
      setIndexInfo(info);
      //console.log('Index info:', info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get index info');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const isConnected = await meiliSearchService.testConnection();
      if (isConnected) {
        setError('');
        //console.log('✅ MeiliSearch connection successful');
      } else {
        setError('❌ MeiliSearch connection failed');
      }
    } catch (err) {
      setError('❌ Connection test failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">MeiliSearch Debug Panel</h2>
      
      <div className="space-y-4">
        {/* Connection Test */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Connection Test</h3>
          <button 
            onClick={testConnection}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {/* Index Info */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Index Information</h3>
          <button 
            onClick={getIndexInfo}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Index Info'}
          </button>
          {indexInfo && (
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(indexInfo, null, 2)}
            </pre>
          )}
        </div>

        {/* Search Test */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Search Test</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Enter search query..."
              className="flex-1 px-3 py-2 border rounded"
            />
            <button 
              onClick={testSearch}
              disabled={loading || !testQuery.trim()}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {results.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Results ({results.length}):</h4>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="border border-red-300 bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeiliSearchDebug;
