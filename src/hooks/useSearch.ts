import { useState, useEffect, useMemo, useCallback } from 'react';

// Generic search hook with debouncing and highlighting
export interface SearchOptions {
  debounceMs?: number;
  caseSensitive?: boolean;
  searchFields?: string[];
  minSearchLength?: number;
}

export interface SearchResult<T> {
  item: T;
  matches: SearchMatch[];
  score: number;
}

export interface SearchMatch {
  field: string;
  value: string;
  highlightedValue: string;
  indices: [number, number][];
}

export function useSearch<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  options: SearchOptions = {}
) {
  const {
    debounceMs = 300,
    caseSensitive = false,
    searchFields = [],
    minSearchLength = 1
  } = options;

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search term
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Search and highlight function
  const searchAndHighlight = useCallback((
    text: string,
    term: string,
    caseSensitive: boolean
  ): SearchMatch | null => {
    if (!text || !term) return null;

    const searchText = caseSensitive ? text : text.toLowerCase();
    const searchTerm = caseSensitive ? term : term.toLowerCase();
    
    const indices: [number, number][] = [];
    let index = 0;
    
    while (index < searchText.length) {
      const foundIndex = searchText.indexOf(searchTerm, index);
      if (foundIndex === -1) break;
      
      indices.push([foundIndex, foundIndex + searchTerm.length]);
      index = foundIndex + 1;
    }

    if (indices.length === 0) return null;

    // Create highlighted text
    let highlightedValue = '';
    let lastIndex = 0;
    
    indices.forEach(([start, end]) => {
      highlightedValue += text.slice(lastIndex, start);
      highlightedValue += `<mark class="bg-retro-yellow/30 dark:bg-retro-blue/30 text-retro-purple dark:text-retro-teal font-medium rounded px-1">${text.slice(start, end)}</mark>`;
      lastIndex = end;
    });
    highlightedValue += text.slice(lastIndex);

    return {
      field: '',
      value: text,
      highlightedValue,
      indices
    };
  }, []);

  // Perform search
  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < minSearchLength) {
      return items.map(item => ({ item, matches: [], score: 0 }));
    }

    const results: SearchResult<T>[] = [];

    items.forEach(item => {
      const matches: SearchMatch[] = [];
      let totalScore = 0;

      // If no specific fields provided, search all string fields
      const fieldsToSearch = searchFields.length > 0 
        ? searchFields 
        : Object.keys(item).filter(key => typeof item[key] === 'string');

      fieldsToSearch.forEach(field => {
        const fieldValue = item[field];
        if (typeof fieldValue === 'string') {
          const match = searchAndHighlight(fieldValue, debouncedSearchTerm, caseSensitive);
          if (match) {
            match.field = field;
            matches.push(match);
            
            // Calculate score based on field importance and match quality
            let fieldScore = match.indices.length;
            
            // Boost score for exact matches
            if (fieldValue.toLowerCase() === debouncedSearchTerm.toLowerCase()) {
              fieldScore *= 3;
            }
            
            // Boost score for matches at the beginning
            if (match.indices.some(([start]) => start === 0)) {
              fieldScore *= 2;
            }
            
            // Field-specific scoring (can be customized)
            if (field === 'title') fieldScore *= 2;
            if (field === 'subject') fieldScore *= 1.5;
            
            totalScore += fieldScore;
          }
        }
      });

      if (matches.length > 0) {
        results.push({ item, matches, score: totalScore });
      }
    });

    // Sort by score (highest first)
    return results.sort((a, b) => b.score - a.score);
  }, [items, debouncedSearchTerm, searchFields, caseSensitive, minSearchLength, searchAndHighlight]);

  // Extract just the items for easier use
  const filteredItems = useMemo(() => 
    searchResults.map(result => result.item),
    [searchResults]
  );

  // Get highlighted value for a specific field
  const getHighlightedValue = useCallback((item: T, field: string): string => {
    const result = searchResults.find(r => r.item === item);
    const match = result?.matches.find(m => m.field === field);
    return match?.highlightedValue || item[field] || '';
  }, [searchResults]);

  return {
    searchResults,
    filteredItems,
    isSearching,
    hasResults: searchResults.length > 0,
    hasSearchTerm: debouncedSearchTerm.length >= minSearchLength,
    getHighlightedValue,
    debouncedSearchTerm
  };
}

// Specialized hook for Notes search
export function useNotesSearch(notes: any[], searchTerm: string) {
  return useSearch(notes, searchTerm, {
    debounceMs: 300,
    caseSensitive: false,
    searchFields: ['title', 'content', 'subject'],
    minSearchLength: 1
  });
}

// Specialized hook for Students search
export function useStudentsSearch(students: any[], searchTerm: string) {
  return useSearch(students, searchTerm, {
    debounceMs: 300,
    caseSensitive: false,
    searchFields: ['name', 'roll', 'bloodGroup', 'phone', 'email', 'role'],
    minSearchLength: 1
  });
}
