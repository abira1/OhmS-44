import React from 'react';

interface HighlightedTextProps {
  text: string;
  highlightedText?: string;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Component for displaying text with search term highlighting
 * Safely renders HTML highlights from search results
 */
export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  highlightedText,
  className = '',
  fallback
}) => {
  // If no highlighted text provided, return plain text
  if (!highlightedText || highlightedText === text) {
    return (
      <span className={className}>
        {text || fallback}
      </span>
    );
  }

  // Safely render highlighted HTML
  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: highlightedText }}
    />
  );
};

/**
 * Component for displaying truncated text with highlighting
 */
interface TruncatedHighlightedTextProps extends HighlightedTextProps {
  maxLength?: number;
  showTooltip?: boolean;
}

export const TruncatedHighlightedText: React.FC<TruncatedHighlightedTextProps> = ({
  text,
  highlightedText,
  maxLength = 150,
  showTooltip = true,
  className = '',
  fallback
}) => {
  const shouldTruncate = text && text.length > maxLength;
  const displayText = shouldTruncate ? text.slice(0, maxLength) + '...' : text;
  
  // If text is truncated, we need to also truncate the highlighted version
  const displayHighlightedText = shouldTruncate && highlightedText
    ? truncateHighlightedText(highlightedText, maxLength)
    : highlightedText;

  const content = (
    <HighlightedText
      text={displayText}
      highlightedText={displayHighlightedText}
      className={className}
      fallback={fallback}
    />
  );

  if (shouldTruncate && showTooltip) {
    return (
      <span title={text} className="cursor-help">
        {content}
      </span>
    );
  }

  return content;
};

/**
 * Helper function to truncate highlighted text while preserving HTML tags
 */
function truncateHighlightedText(highlightedText: string, maxLength: number): string {
  // Simple approach: remove HTML tags, truncate, then try to preserve highlights
  const plainText = highlightedText.replace(/<[^>]*>/g, '');
  
  if (plainText.length <= maxLength) {
    return highlightedText;
  }

  // Find the truncation point
  const truncateAt = maxLength;
  let htmlLength = 0;
  let result = '';
  let inTag = false;
  
  for (let i = 0; i < highlightedText.length; i++) {
    const char = highlightedText[i];
    
    if (char === '<') {
      inTag = true;
      result += char;
    } else if (char === '>') {
      inTag = false;
      result += char;
    } else if (inTag) {
      result += char;
    } else {
      if (htmlLength >= truncateAt) {
        break;
      }
      result += char;
      htmlLength++;
    }
  }
  
  // Close any open tags
  const openTags = result.match(/<mark[^>]*>/g) || [];
  const closeTags = result.match(/<\/mark>/g) || [];
  
  if (openTags.length > closeTags.length) {
    result += '</mark>';
  }
  
  return result + '...';
}

/**
 * Component for displaying search result snippets with context
 */
interface SearchSnippetProps {
  text: string;
  searchTerm: string;
  maxLength?: number;
  contextLength?: number;
  className?: string;
}

export const SearchSnippet: React.FC<SearchSnippetProps> = ({
  text,
  searchTerm,
  maxLength = 200,
  contextLength = 50,
  className = ''
}) => {
  if (!text || !searchTerm) {
    return <span className={className}>{text}</span>;
  }

  const lowerText = text.toLowerCase();
  const lowerTerm = searchTerm.toLowerCase();
  const termIndex = lowerText.indexOf(lowerTerm);

  if (termIndex === -1) {
    // No match found, return truncated text
    const truncated = text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    return <span className={className}>{truncated}</span>;
  }

  // Calculate snippet boundaries
  const start = Math.max(0, termIndex - contextLength);
  const end = Math.min(text.length, termIndex + searchTerm.length + contextLength);
  
  let snippet = text.slice(start, end);
  
  // Add ellipsis if needed
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  // Highlight the search term in the snippet
  const highlightedSnippet = snippet.replace(
    new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi'),
    '<mark class="bg-retro-yellow/30 dark:bg-retro-blue/30 text-retro-purple dark:text-retro-teal font-medium rounded px-1">$1</mark>'
  );

  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: highlightedSnippet }}
    />
  );
};

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Component for displaying multiple highlighted fields
 */
interface MultiFieldHighlightProps {
  fields: Array<{
    label: string;
    value: string;
    highlighted?: string;
    className?: string;
  }>;
  className?: string;
}

export const MultiFieldHighlight: React.FC<MultiFieldHighlightProps> = ({
  fields,
  className = ''
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {fields.map((field, index) => (
        <div key={index} className="text-sm">
          <span className="font-medium text-gray-600 dark:text-gray-400 mr-2">
            {field.label}:
          </span>
          <HighlightedText
            text={field.value}
            highlightedText={field.highlighted}
            className={field.className}
          />
        </div>
      ))}
    </div>
  );
};
