import React from 'react';
import { useAppStore } from '../store/useAppStore';

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useAppStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search features..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="clear-search-button"
            title="Clear"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;