import axios from 'axios';
import { ChevronDown, Loader2, MapPin, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  
  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentMiningSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load recent searches:', err);
    }
  }, []);
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Update suggestions when query changes
  useEffect(() => {
    const searchLocations = async () => {
      if (query.trim().length >= 1) {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE}/locations/search`, {
            params: { q: query.trim() }
          });
          
          if (response.data.suggestions.length > 0) {
            setSuggestions(response.data.suggestions);
          } else {
            setSuggestions([]);
          }
          
          setShowSuggestions(true);
        } catch (error) {
          console.error('Search API error:', error);
          setSuggestions([]);
          setShowSuggestions(true);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 1) {
        searchLocations();
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [query]);
  
  // Save search to recent searches with management
  const saveToRecentSearches = (locationName) => {
    const newSearch = {
      id: Date.now(),
      name: locationName,
      timestamp: new Date().toISOString()
    };
    
    const filtered = recentSearches.filter(s => s.name !== locationName);
    const updated = [newSearch, ...filtered].slice(0, 5);
    
    setRecentSearches(updated);
    localStorage.setItem('recentMiningSearches', JSON.stringify(updated));
  };
  
  // Remove from recent searches
  const removeRecentSearch = (id, e) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s.id !== id);
    setRecentSearches(updated);
    localStorage.setItem('recentMiningSearches', JSON.stringify(updated));
  };
  
  // Clear all recent searches
  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentMiningSearches');
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      saveToRecentSearches(query.trim());
      setQuery('');
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionClick = (location) => {
    setQuery(location.name);
    onSearch(location.name);
    saveToRecentSearches(location.name);
    setShowSuggestions(false);
  };
  
  // Quick search buttons
  const quickCities = [
    { name: 'Papua', emoji: '🦘' },
    { name: 'Jayapura', emoji: '🦘' },
    { name: 'Timika', emoji: '🦘' },
    { name: 'Jakarta', emoji: '🌆' },
    { name: 'Bandung', emoji: '🏔️' },
    { name: 'Surabaya', emoji: '🌉' },
    { name: 'Balikpapan', emoji: '🌳' },
    { name: 'Makassar', emoji: '🌊' },
    { name: 'Denpasar', emoji: '🏖️' },
    { name: 'Medan', emoji: '🌴' }
  ];

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Cari lokasi tambang di Indonesia..."
            className="w-full pl-12 pr-24 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none text-white placeholder-gray-400 text-lg transition-all"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {loading && (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            )}
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Cari
            </button>
          </div>
        </div>
      </form>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {/* Recent Searches with management */}
            {query.length === 0 && recentSearches.length > 0 && (
              <div className="border-b border-white/10">
                <div className="px-4 py-3 bg-gray-900/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>Riwayat Pencarian</span>
                  </div>
                  <button
                    onClick={clearAllRecentSearches}
                    className="text-xs text-gray-500 hover:text-red-400"
                  >
                    Hapus Semua
                  </button>
                </div>
                {recentSearches.map((search) => (
                  <div
                    key={search.id}
                    className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-all group flex items-center justify-between"
                  >
                    <div 
                      className="flex-1"
                      onClick={() => {
                        onSearch(search.name);
                        setShowSuggestions(false);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <HistoryIcon className="w-4 h-4 text-gray-500" />
                        <div className="font-medium text-white">{search.name}</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => removeRecentSearch(search.id, e)}
                      className="text-gray-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Search Results */}
            {suggestions.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 text-xs text-gray-400 bg-gray-900/80">
                  {suggestions.length} lokasi ditemukan
                </div>
                {suggestions.map((location, index) => (
                  <div
                    key={location.id || index}
                    onClick={() => handleSuggestionClick(location)}
                    className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-all group border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="font-medium text-white">{location.name}</div>
                        {location.coordinates && (
                          <div className="text-xs text-gray-400">
                            {location.coordinates.lat.toFixed(2)}°, {location.coordinates.lon.toFixed(2)}°
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : query.length >= 1 && !loading && (
              <div className="py-8 text-center">
                <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Lokasi tidak ditemukan</p>
                <p className="text-gray-500 text-sm mt-1">Coba cari dengan nama lain</p>
              </div>
            )}
            
            {/* Quick Cities - Hanya tampilkan dalam dropdown */}
            {query.length === 0 && (
              <div className="border-t border-white/10">
                <div className="px-4 py-3 bg-gray-900/80">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <ChevronDown className="w-4 h-4" />
                    <span>Lokasi Populer</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {quickCities.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => handleSuggestionClick({ name: city.name })}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white transition-all text-sm flex items-center justify-center space-x-2 hover:scale-105"
                      >
                        <span>{city.emoji}</span>
                        <span>{city.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for history icon
const HistoryIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default SearchBar;