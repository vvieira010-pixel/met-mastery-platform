import { useState, useMemo, useRef, useEffect } from 'react';
import {
  DEFAULT_TEST_FILES,
  filterTestFiles,
  highlightSegments,
  getTagTheme,
} from '../lib/test-file-search-utils.js';

/**
 * Helper component that renders text with matching search terms highlighted
 */
function HighlightedText({ text = '', query = '' }) {
  const segments = useMemo(() => highlightSegments(text, query), [text, query]);

  return (
    <span>
      {segments.map((segment, idx) =>
        segment.isMatch ? (
          <mark
            key={idx}
            className="bg-amber-200 text-amber-950 font-semibold px-0.5 rounded-sm"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={idx}>{segment.text}</span>
        )
      )}
    </span>
  );
}

/**
 * Expanded TestFileSearch component
 *
 * Real-time filter component for test files by filename, tag, status, and path.
 *
 * @param {Object} props
 * @param {Array<{ id: string|number, filename: string, tag?: string, status?: string, duration?: string, path?: string, testsCount?: number }>} [props.files]
 * @param {Function} [props.onSelect]
 * @param {string} [props.initialQuery]
 * @param {string} [props.initialTag]
 * @param {string} [props.placeholder]
 * @param {string} [props.className]
 * @param {string} [props.data-testid]
 */
export default function TestFileSearch({
  files,
  onSelect,
  initialQuery = '',
  initialTag = 'all',
  placeholder = 'Search by filename or tag... (Esc to clear)',
  className = '',
  'data-testid': testId = 'test-file-search-component',
}) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [sortBy, setSortBy] = useState('default');
  const [copiedId, setCopiedId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Normalize source files: use provided array, or fallback to default suite
  const sourceFiles = useMemo(() => {
    if (Array.isArray(files)) {
      return files;
    }
    return DEFAULT_TEST_FILES;
  }, [files]);

  // Extract unique tags and calculate item counts
  const availableTags = useMemo(() => {
    const counts = {};
    for (const f of sourceFiles) {
      if (f.tag) {
        const tag = String(f.tag).toLowerCase();
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
    const tags = Object.keys(counts).sort();
    return [{ tag: 'all', count: sourceFiles.length }, ...tags.map((t) => ({ tag: t, count: counts[t] }))];
  }, [sourceFiles]);

  // Optimized real-time search & filtering with useMemo
  const filteredFiles = useMemo(() => {
    return filterTestFiles(sourceFiles, query, {
      selectedTag,
      sortBy,
    });
  }, [sourceFiles, query, selectedTag, sortBy]);

  // Keep active keyboard navigation index in bounds
  useEffect(() => {
    setActiveIndex(-1);
  }, [query, selectedTag, sortBy]);

  // Handle keyboard shortcuts (Esc to clear, Arrow navigation, Enter to select)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (query || selectedTag !== 'all') {
        e.preventDefault();
        setQuery('');
        setSelectedTag('all');
        setActiveIndex(-1);
      }
    } else if (e.key === 'ArrowDown') {
      if (filteredFiles.length > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1 < filteredFiles.length ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      if (filteredFiles.length > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredFiles.length - 1));
      }
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < filteredFiles.length) {
        e.preventDefault();
        handleSelectFile(filteredFiles[activeIndex]);
      }
    }
  };

  const handleSelectFile = (file) => {
    if (onSelect) {
      onSelect(file);
    }
  };

  const handleCopy = (e, file) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(file.filename);
      setCopiedId(file.id);
      setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    }
  };

  const handleResetFilters = () => {
    setQuery('');
    setSelectedTag('all');
    setSortBy('default');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const isFilteringActive = Boolean(query.trim() || selectedTag !== 'all');

  return (
    <div
      data-testid={testId}
      className={`test-file-search-container max-w-2xl mx-auto w-full bg-white rounded-xl shadow-xs border border-slate-200 p-5 ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Test File Navigator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant real-time search across test specifications, paths, and tags
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <label htmlFor="test-file-sort" className="text-xs font-medium text-slate-500">
            Sort:
          </label>
          <select
            id="test-file-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
          >
            <option value="default">Default Order</option>
            <option value="name-asc">Filename (A → Z)</option>
            <option value="name-desc">Filename (Z → A)</option>
            <option value="tag">Tag Group</option>
          </select>
        </div>
      </div>

      {/* Search Input Container */}
      <div className="relative mb-3.5" role="search">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <input
          ref={searchInputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search test files by filename or tag"
          data-testid="test-file-search-input"
          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
        />

        {/* Clear query button */}
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search query"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Tag filter pills */}
      {availableTags.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter by tag">
          <span className="text-xs text-slate-500 font-medium mr-1">Tags:</span>
          {availableTags.map(({ tag, count }) => {
            const isSelected = selectedTag === tag;
            const theme = getTagTheme(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                role="tab"
                aria-selected={isSelected}
                data-testid={`tag-filter-${tag}`}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors inline-flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : `${theme.badgeBg} ${theme.border} hover:opacity-85`
                }`}
              >
                <span>{tag === 'all' ? 'All' : tag}</span>
                <span
                  className={`text-[10px] px-1 py-0.2 rounded-full ${
                    isSelected ? 'bg-slate-700 text-slate-200' : 'bg-black/5 text-current'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Live Search Status summary */}
      <div
        className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1"
        aria-live="polite"
        role="status"
      >
        <span>
          Showing{' '}
          <strong className="text-slate-800 font-semibold">{filteredFiles.length}</strong> of{' '}
          {sourceFiles.length} test {sourceFiles.length === 1 ? 'file' : 'files'}
        </span>
        {isFilteringActive && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-teal-600 hover:text-teal-800 font-medium hover:underline focus:outline-hidden"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* File List */}
      <ul
        ref={listRef}
        role="listbox"
        aria-label="Filtered test files"
        className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white overflow-hidden max-h-[480px] overflow-y-auto"
      >
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file, index) => {
            const isSelected = activeIndex === index;
            const tagTheme = getTagTheme(file.tag);
            const isCopied = copiedId === file.id;

            return (
              <li
                key={file.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectFile(file)}
                data-testid={`test-file-item-${file.id}`}
                className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-teal-50/70 border-l-3 border-teal-600' : 'hover:bg-slate-50/90'
                }`}
              >
                {/* File info */}
                <div className="min-w-0 flex-1 flex items-start gap-3">
                  {/* File icon */}
                  <div className="mt-0.5 p-1.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900 tracking-tight break-all font-mono">
                        <HighlightedText text={file.filename} query={query} />
                      </span>

                      {/* Status indicator if available */}
                      {file.status && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                            file.status === 'passed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : file.status === 'failed'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              file.status === 'passed'
                                ? 'bg-emerald-600'
                                : file.status === 'failed'
                                ? 'bg-rose-600'
                                : 'bg-slate-500'
                            }`}
                          />
                          {file.status}
                        </span>
                      )}

                      {/* Optional test count / duration */}
                      {file.duration && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {file.duration}
                        </span>
                      )}
                    </div>

                    {/* Path or description */}
                    {file.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        <HighlightedText text={file.description} query={query} />
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side actions & tag badge */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Tag badge with click-to-filter */}
                  {file.tag && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTag(file.tag);
                      }}
                      title={`Filter by tag: ${file.tag}`}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${tagTheme.badgeBg} ${tagTheme.border} hover:opacity-80`}
                    >
                      <HighlightedText text={file.tag} query={query} />
                    </button>
                  )}

                  {/* Copy filename button */}
                  <button
                    type="button"
                    onClick={(e) => handleCopy(e, file)}
                    title={isCopied ? 'Copied to clipboard' : 'Copy filename'}
                    aria-label={`Copy filename ${file.filename}`}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors focus:outline-hidden"
                  >
                    {isCopied ? (
                      <svg
                        className="w-4 h-4 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M5 13l4 4L19 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
                      </svg>
                    )}
                  </button>
                </div>
              </li>
            );
          })
        ) : (
          /* Empty state */
          <li className="p-8 text-center" data-testid="test-file-empty-state">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">
              No test files found
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No files matched the search <span className="font-semibold text-slate-700">"{query}"</span>
              {selectedTag !== 'all' && (
                <span> in tag category <span className="font-semibold text-slate-700">"{selectedTag}"</span></span>
              )}
              .
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-3.5 inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs"
            >
              Clear filters and show all
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
