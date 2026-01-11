import React, { useState, useRef, useEffect } from 'react';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  boundingbox?: [string, string, string, string];
}

interface PlaceSearchBarProps {
  onPlaceSelect: (lat: number, lon: number, boundingbox?: [number, number, number, number]) => void;
}

const PlaceSearchBar: React.FC<PlaceSearchBarProps> = ({ onPlaceSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<number>();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const searchPlaces = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      // First try searching within India
      let response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&addressdetails=1&countrycodes=in&bounded=0`
      );
      
      let data: SearchResult[] = [];
      
      if (response.ok) {
        data = await response.json();
      }
      
      // If no results found in India, search worldwide
      if (data.length === 0) {
        response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=5&addressdetails=1`
        );
        
        if (response.ok) {
          data = await response.json();
        }
      }
      
      setResults(data);
      setShowResults(data.length > 0);
    } catch (error) {
      console.error('Error searching places:', error);
      setResults([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = window.setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  // Handle place selection
  const handlePlaceSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    // Convert boundingbox if available
    let boundingbox: [number, number, number, number] | undefined;
    if (result.boundingbox) {
      const [south, north, west, east] = result.boundingbox.map(parseFloat);
      boundingbox = [south, north, west, east];
    }

    // Call the parent callback
    onPlaceSelect(lat, lon, boundingbox);

    // Clear search
    setQuery(result.display_name);
    setShowResults(false);
    setResults([]);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
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

  return (
    <div className="place-search-container">
      <div className="place-search-input-container">
        <input
          type="text"
          placeholder="🔍 Search places in India..."
          value={query}
          onChange={handleInputChange}
          className="place-search-input"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="clear-place-search-button"
            title="Clear search"
          >
            ×
          </button>
        )}
        {isLoading && (
          <div className="search-loading-indicator">
            🔍
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="place-search-results" ref={resultsRef}>
          {results.map((result) => (
            <div
              key={result.place_id}
              className="place-search-result-item"
              onClick={() => handlePlaceSelect(result)}
            >
              <div className="place-name">
                {result.display_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaceSearchBar;