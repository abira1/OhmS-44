import React, { useRef, useEffect } from 'react';
import { SearchIcon, XIcon, LoaderIcon } from 'lucide-react';
import { useAccessibility } from '../../hooks/useAccessibility';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  resultsCount?: number;
  className?: string;
  autoFocus?: boolean;
  onClear?: () => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  isLoading = false,
  resultsCount,
  className = '',
  autoFocus = false,
  onClear,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { announceToScreenReader } = useAccessibility();

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Announce search results to screen readers
  useEffect(() => {
    if (value && resultsCount !== undefined) {
      const message = resultsCount === 0 
        ? `No results found for "${value}"`
        : `${resultsCount} result${resultsCount === 1 ? '' : 's'} found for "${value}"`;
      announceToScreenReader(message, 'polite');
    }
  }, [value, resultsCount, announceToScreenReader]);

  const handleClear = () => {
    onChange('');
    onClear?.();
    inputRef.current?.focus();
    announceToScreenReader('Search cleared', 'polite');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && value) {
      handleClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <LoaderIcon 
              className="h-4 w-4 text-retro-purple dark:text-retro-teal animate-spin" 
              aria-hidden="true"
            />
          ) : (
            <SearchIcon 
              className="h-4 w-4 text-retro-purple dark:text-retro-teal" 
              aria-hidden="true"
            />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel || 'Search input'}
          aria-describedby={ariaDescribedBy}
          className={`
            w-full pl-10 pr-10 py-3 
            bg-white dark:bg-gray-800 
            border-2 border-retro-purple/20 dark:border-retro-teal/20
            rounded-xl
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none 
            focus:border-retro-purple dark:focus:border-retro-teal
            focus:ring-2 focus:ring-retro-purple/20 dark:focus:ring-retro-teal/20
            transition-all duration-200
            neu-shadow-inner
            font-vhs text-sm
            retro-input
          `}
        />
        
        {/* Clear Button */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-xl transition-colors"
            aria-label="Clear search"
            title="Clear search (Esc)"
          >
            <XIcon className="h-4 w-4 text-gray-400 hover:text-retro-purple dark:hover:text-retro-teal transition-colors" />
          </button>
        )}
      </div>
      
      {/* Search Status */}
      {value && resultsCount !== undefined && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 px-3 py-1 text-xs text-gray-500 dark:text-gray-400 font-vhs"
          aria-live="polite"
          aria-atomic="true"
        >
          {isLoading ? (
            'Searching...'
          ) : resultsCount === 0 ? (
            'No results found'
          ) : (
            `${resultsCount} result${resultsCount === 1 ? '' : 's'} found`
          )}
        </div>
      )}
    </div>
  );
};

// Retro-styled search bar with enhanced visual effects
export const RetroSearchInput: React.FC<SearchInputProps> = (props) => {
  return (
    <div className="relative">
      {/* Retro glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-retro-purple/10 via-retro-pink/10 to-retro-purple/10 rounded-xl blur-sm -z-10" />
      
      <SearchInput
        {...props}
        className={`
          relative
          before:absolute before:inset-0 before:rounded-xl
          before:bg-gradient-to-r before:from-retro-purple/5 before:via-transparent before:to-retro-purple/5
          before:opacity-0 hover:before:opacity-100 focus-within:before:opacity-100
          before:transition-opacity before:duration-300
          ${props.className || ''}
        `}
      />
      
      {/* Retro scanline effect */}
      <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
        <div className="retro-scanline opacity-10" />
      </div>
    </div>
  );
};

// Search input with quick filters
interface SearchWithFiltersProps extends SearchInputProps {
  filters?: Array<{
    label: string;
    value: string;
    active: boolean;
    onClick: () => void;
  }>;
}

export const SearchWithFilters: React.FC<SearchWithFiltersProps> = ({
  filters = [],
  ...searchProps
}) => {
  return (
    <div className="space-y-3">
      <RetroSearchInput {...searchProps} />
      
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={filter.onClick}
              className={`
                px-3 py-1 rounded-full text-xs font-vhs transition-all duration-200
                ${filter.active
                  ? 'bg-retro-purple text-white neu-shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
              aria-pressed={filter.active}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
