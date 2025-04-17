"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface ScrapedBursary {
  title: string;
  amount?: string;
  description?: string;
  deadline?: string;
  url?: string;
  source: string;
  scrapedAt?: Date;
  _id: string;
  relevance?: number;
  region?: string;
  eligibility?: string; // New field added for LangChain scraper
}

interface SourceStatus {
  source: string;
  status: 'idle' | 'starting' | 'fetching' | 'parsing' | 'complete' | 'error';
  message: string;
}

const ScrapedOpportunitiesPage = () => {
  const [bursaries, setBursaries] = useState<ScrapedBursary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);
  
  // Streaming scrape state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamLog, setStreamLog] = useState<string[]>([]);
  const [sourceStatuses, setSourceStatuses] = useState<Record<string, SourceStatus>>({
    ScholarshipsCanada: { source: 'ScholarshipsCanada', status: 'idle', message: 'Ready to scrape' },
    Indspire: { source: 'Indspire', status: 'idle', message: 'Ready to scrape' },
    UniversitiesCanada: { source: 'Universities Canada', status: 'idle', message: 'Ready to scrape' }
  });
  const [scrapingItems, setScrapingItems] = useState<ScrapedBursary[]>([]);
  
  // Settings for scraping
  const [limitPerSource, setLimitPerSource] = useState<number>(5);
  const [selectedSources, setSelectedSources] = useState<string[]>(['all']);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [useLangChain, setUseLangChain] = useState<boolean>(true); // Default to using LangChain
  
  // Ref for auto-scrolling log
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll the log to the bottom when new messages arrive
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [streamLog]);
  
  // Filtered bursaries based on region selection
  const filteredBursaries = filterRegion === 'all' 
    ? bursaries
    : bursaries.filter(b => b.region === filterRegion || 
                             (b.relevance && b.relevance > 5)); // Include highly relevant items

  async function fetchScrapedBursaries(forceRefresh = false) {
    try {
      setLoading(true);
      setError(null);
      
      const url = forceRefresh 
        ? '/api/scrape?refresh=true' 
        : '/api/scrape';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch scraped opportunities');
      }
      
      const data = await response.json();
      
      // Sort by relevance if available, then by date
      let sortedBursaries = [...data.bursaries];
      sortedBursaries.sort((a, b) => {
        if (a.relevance && b.relevance) return b.relevance - a.relevance;
        if (a.scrapedAt && b.scrapedAt) return new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime();
        return 0;
      });
      
      setBursaries(sortedBursaries);
      setIsCached(!!data.cached);
      
      if (data.bursaries.length > 0 && data.bursaries[0].scrapedAt) {
        setLastUpdated(new Date(data.bursaries[0].scrapedAt));
      }
      
      if (data.error) {
        toast.warning(data.error);
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching scraped bursaries:', err);
      setError('Failed to load external opportunities. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchScrapedBursaries();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const result = await fetchScrapedBursaries(true);
    setIsRefreshing(false);
    
    if (result) {
      toast.success('Opportunities refreshed successfully!');
    }
  };
  
  // Function to handle streaming scrape
  const handleStreamingScrape = () => {
    setIsStreaming(true);
    setStreamLog([]);
    setScrapingItems([]);
    setSourceStatuses({
      ScholarshipsCanada: { source: 'ScholarshipsCanada', status: 'idle', message: 'Waiting to start' },
      Indspire: { source: 'Indspire', status: 'idle', message: 'Waiting to start' },
      UniversitiesCanada: { source: 'Universities Canada', status: 'idle', message: 'Waiting to start' }
    });
    
    // Create the EventSource for server-sent events
    const sourcesParam = selectedSources.join(',');
    // Select the appropriate endpoint based on the useLangChain flag
    const endpoint = useLangChain ? 'langchain' : 'stream';
    
    // Build the URL differently based on the scraper type
    let url = '';
    if (useLangChain) {
      // For Claude AI, custom URL is the primary parameter
      url = `/api/scrape/${endpoint}?sources=${sourcesParam}`;
      if (customUrl) {
        url += `&url=${encodeURIComponent(customUrl)}`;
      }
    } else {
      // For regular scraper, use the original URL structure
      url = `/api/scrape/${endpoint}?sources=${sourcesParam}&limit=${limitPerSource}`;
      if (customUrl) {
        url += `&url=${encodeURIComponent(customUrl)}`;
      }
    }
    
    const eventSource = new EventSource(url);
    
    // Handle different event types
    eventSource.addEventListener('init', (event) => {
      const data = JSON.parse(event.data);
      setStreamLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${data.message}`]);
    });
    
    eventSource.addEventListener('status', (event) => {
      const data = JSON.parse(event.data);
      
      // Update source-specific status
      if (data.source) {
        setSourceStatuses(prev => ({
          ...prev,
          [data.source]: { 
            source: data.source, 
            status: data.status || prev[data.source]?.status || 'idle', 
            message: data.message 
          }
        }));
      }
      
      setStreamLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${data.message || 'Status update'}`]);
    });
    
    eventSource.addEventListener('item', (event) => {
      const data = JSON.parse(event.data);
      if (data.item) {
        setScrapingItems(prev => [...prev, data.item]);
      }
    });
    
    eventSource.addEventListener('complete', (event) => {
      const data = JSON.parse(event.data);
      setStreamLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${data.message} (Found ${data.count} opportunities)`]);
      
      // Close the connection
      eventSource.close();
      setIsStreaming(false);
      
      // Refresh the full list
      fetchScrapedBursaries();
      
      toast.success(`Scraping completed! Found ${data.count} opportunities.`);
    });
    
    eventSource.addEventListener('error', (event) => {
      const data = event.data ? JSON.parse(event.data) : { message: 'Unknown error occurred' };
      setStreamLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ERROR - ${data.message}`]);
      
      // Close the connection
      eventSource.close();
      setIsStreaming(false);
      
      toast.error('An error occurred during scraping.');
    });
    
    // Handle connection error
    eventSource.onerror = () => {
      setStreamLog(prev => [...prev, `${new Date().toLocaleTimeString()}: Connection error occurred`]);
      eventSource.close();
      setIsStreaming(false);
      toast.error('Connection error occurred during scraping.');
    };
  };

  // Function to toggle source selection
  const toggleSource = (source: string) => {
    if (source === 'all') {
      setSelectedSources(['all']);
      return;
    }
    
    // If 'all' is already selected, remove it
    const newSources = selectedSources.filter(s => s !== 'all');
    
    // Toggle the specific source
    if (newSources.includes(source)) {
      const filtered = newSources.filter(s => s !== source);
      setSelectedSources(filtered.length === 0 ? ['all'] : filtered);
    } else {
      setSelectedSources([...newSources, source]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">External Bursary Opportunities</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleString()} 
              {isCached && " (cached)"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="px-2 py-1.5 border border-gray-300 dark:border-gray-700 rounded text-sm"
          >
            <option value="all">All Regions</option>
            <option value="Atlantic Canada">Atlantic Canada</option>
            <option value="Indigenous">Indigenous</option>
          </select>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing || isStreaming}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isRefreshing ? 'Refreshing...' : 'Quick Refresh'}
          </button>
          <button 
            onClick={() => document.getElementById('scrapeModal')?.classList.remove('hidden')}
            disabled={isStreaming}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Advanced Scraping
          </button>
        </div>
      </div>
      
      {/* Live Scraping Modal */}
      <div id="scrapeModal" className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Live Opportunity Scraping</h2>
            <button 
              onClick={() => document.getElementById('scrapeModal')?.classList.add('hidden')}
              disabled={isStreaming}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
            >
              ✕
            </button>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            {/* Custom URL */}
            <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Custom Source URL (Optional)</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="Enter URL of a specific scholarships page to scrape..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded"
                  disabled={isStreaming}
                />
                <button 
                  onClick={() => setCustomUrl('')}
                  disabled={!customUrl || isStreaming}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                *If you enter a URL, only that site will be scraped unless an error occurs.
              </p>
            </div>
            
            {/* Controls */}
            <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Scraping Controls</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sources to Scrape</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedSources.includes('all')} 
                        onChange={() => setSelectedSources(['all'])} 
                        className="mr-2"
                        disabled={isStreaming || !!customUrl}
                      />
                      All Sources
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedSources.includes('scholarships')} 
                        onChange={() => toggleSource('scholarships')} 
                        disabled={selectedSources.includes('all') || isStreaming || !!customUrl}
                        className="mr-2"
                      />
                      ScholarshipsCanada
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedSources.includes('indigenous')} 
                        onChange={() => toggleSource('indigenous')} 
                        disabled={selectedSources.includes('all') || isStreaming || !!customUrl}
                        className="mr-2"
                      />
                      Indigenous Opportunities (Indspire)
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedSources.includes('universities')} 
                        onChange={() => toggleSource('universities')} 
                        disabled={selectedSources.includes('all') || isStreaming || !!customUrl}
                        className="mr-2"
                      />
                      University Scholarships
                    </label>
                  </div>
                  
                  {/* LangChain Toggle */}
                  <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-200 dark:border-indigo-800">
                    <label className="flex items-center font-medium text-indigo-800 dark:text-indigo-300">
                      <input
                        type="checkbox"
                        checked={useLangChain}
                        onChange={() => setUseLangChain(!useLangChain)}
                        disabled={isStreaming}
                        className="mr-2"
                      />
                      Use Claude AI for Enhanced Scraping
                    </label>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                      Activates Anthropic's Claude AI to identify and format complete scholarship information with higher accuracy
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="limitPerSource">
                    Max Items Per Source: {limitPerSource}
                  </label>
                  <input 
                    type="range" 
                    id="limitPerSource"
                    min="1" 
                    max="20" 
                    value={limitPerSource} 
                    onChange={(e) => setLimitPerSource(parseInt(e.target.value))} 
                    disabled={isStreaming}
                    className="w-full"
                  />
                  
                  <div className="mt-4">
                    <button 
                      onClick={handleStreamingScrape} 
                      disabled={isStreaming}
                      className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isStreaming ? (
                        <>
                          <span className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></span>
                          Scraping in Progress...
                        </>
                      ) : (
                        'Start Scraping'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status Indicators */}
            <div className="mb-4 grid grid-cols-3 gap-4">
              {Object.values(sourceStatuses).map((source) => (
                <div 
                  key={source.source} 
                  className={`p-3 rounded-lg border ${
                    source.status === 'error' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 
                    source.status === 'complete' ? 'border-green-300 bg-green-50 dark:bg-green-900/20' :
                    source.status !== 'idle' ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' :
                    'border-gray-300 bg-gray-50 dark:bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <div className={`h-3 w-3 rounded-full mr-2 ${
                      source.status === 'error' ? 'bg-red-500' :
                      source.status === 'complete' ? 'bg-green-500' :
                      source.status !== 'idle' ? 'bg-blue-500 animate-pulse' :
                      'bg-gray-400'
                    }`}></div>
                    <h4 className="font-medium">{source.source}</h4>
                  </div>
                  <p className="text-sm">{source.message}</p>
                </div>
              ))}
            </div>
            
            {/* Live Log */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Live Log</h3>
              <div 
                ref={logContainerRef}
                className="bg-gray-100 dark:bg-gray-900 rounded p-3 h-40 overflow-y-auto font-mono text-xs"
              >
                {streamLog.length === 0 ? (
                  <p className="text-gray-500">Scraping log will appear here...</p>
                ) : (
                  streamLog.map((log, index) => (
                    <div key={index} className="mb-1">{log}</div>
                  ))
                )}
              </div>
            </div>
            
            {/* Live Results */}
            {scrapingItems.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Live Results</h3>
                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Source</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Relevance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Region</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {scrapingItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.source}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{item.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {item.relevance ? (
                              <span className={`px-2 py-1 rounded text-xs ${
                                item.relevance > 8 ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                item.relevance > 5 ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}>
                                {item.relevance > 8 ? 'High' : item.relevance > 5 ? 'Medium' : 'Low'}
                              </span>
                            ) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {item.region || 'General'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button 
              onClick={() => document.getElementById('scrapeModal')?.classList.add('hidden')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      {loading && !isRefreshing && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {!loading && filteredBursaries.length === 0 && !error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No external opportunities found matching your criteria. Please try refreshing or using the Advanced Scraping feature to find new opportunities.</p>
        </div>
      )}
      
      {!loading && filteredBursaries.length > 0 && (
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Showing {filteredBursaries.length} opportunities {filterRegion !== 'all' && `for ${filterRegion}`}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBursaries.map((bursary, index) => (
              <div 
                key={bursary._id || `bursary-${index}`} 
                className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                  bursary.relevance && bursary.relevance > 8 ? 'border-l-4 border-green-500' : 
                  bursary.relevance && bursary.relevance > 5 ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{bursary.title}</h2>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 rounded">
                      {bursary.source}
                    </span>
                    {bursary.region && (
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded">
                        {bursary.region}
                      </span>
                    )}
                  </div>
                </div>
                
                {bursary.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">{bursary.description}</p>
                )}
                
                <div className="mt-4 space-y-2">
                  {bursary.amount && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium mr-2">Amount:</span>
                      <span>{bursary.amount}</span>
                    </div>
                  )}
                  
                  {bursary.deadline && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium mr-2">Deadline:</span>
                      <span>{bursary.deadline}</span>
                    </div>
                  )}
                  
                  {bursary.eligibility && (
                    <div className="flex items-start text-sm">
                      <span className="font-medium mr-2">Eligibility:</span>
                      <span className="flex-1">{bursary.eligibility}</span>
                    </div>
                  )}
                </div>
                
                {bursary.url && (
                  <div className="mt-4">
                    <Link 
                      href={bursary.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:text-orange-600 font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrapedOpportunitiesPage; 