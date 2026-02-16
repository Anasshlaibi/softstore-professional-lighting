import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = "Rechercher un produit..."
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        onSearch(value); // Live search as user types
    };

    const handleClear = () => {
        setSearchQuery('');
        onSearch('');
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto mb-6">
            <div className="relative">
                {/* Search Icon */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fa-solid fa-search text-gray-400"></i>
                </div>

                {/* Search Input */}
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-12 py-3 md:py-4 text-base border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />

                {/* Clear Button */}
                {searchQuery && (
                    <button
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-black transition-colors"
                        aria-label="Effacer"
                    >
                        <i className="fa-solid fa-times"></i>
                    </button>
                )}
            </div>

            {/* Search Result Count (optional - can be passed as prop) */}
            {searchQuery && (
                <div className="mt-2 text-sm text-gray-500 text-center">
                    Recherche: "{searchQuery}"
                </div>
            )}
        </div>
    );
};

export default SearchBar;
