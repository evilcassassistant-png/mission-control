'use client';

import { useState } from 'react';

interface SearchResult {
  id: string;
  type: 'memory' | 'document' | 'task' | 'conversation';
  title: string;
  content: string;
  path: string;
  date: string;
  relevance: number;
}

const typeColors: Record<string, string> = {
  memory: 'bg-green-500/20 text-green-400 border-green-500/30',
  document: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  task: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  conversation: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const typeIcons: Record<string, string> = {
  memory: '🧠',
  document: '📄',
  task: '✅',
  conversation: '💬',
};

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredResults = filter === 'all' 
    ? results 
    : results.filter(r => r.type === filter);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memories, documents, tasks, and conversations..."
            className="w-full px-6 py-4 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 text-lg"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 rounded-lg text-white font-medium transition-all"
          >
            {isSearching ? '🔄' : '🔍 Search'}
          </button>
        </div>
        
        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {['crypto', 'twitter', 'monetization', 'cron', 'revenue', 'sama', 'noahkagan'].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setQuery(suggestion);
              }}
              className="px-3 py-1 bg-gray-800/50 border border-gray-700 rounded-full text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Result Stats & Filters */}
          <div className="flex items-center justify-between">
            <div className="text-gray-400">
              Found <span className="text-white font-medium">{results.length}</span> results
            </div>
            <div className="flex gap-2">
              {['all', 'memory', 'document', 'task'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    filter === type
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                      : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {type === 'all' ? 'All' : `${typeIcons[type] || '📁'} ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                </button>
              ))}
            </div>
          </div>

          {/* Result List */}
          <div className="space-y-3">
            {filteredResults.map((result) => (
              <div
                key={result.id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-purple-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Type Badge */}
                  <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${typeColors[result.type] || typeColors.document}`}>
                    {typeIcons[result.type] || '📁'} {result.type}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1">{result.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{result.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>📁 {result.path}</span>
                      <span>📅 {result.date}</span>
                    </div>
                  </div>

                  {/* Relevance Score */}
                  <div className="text-right">
                    <div className="text-sm font-medium text-purple-400">
                      {Math.round(result.relevance * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">relevance</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {hasSearched && results.length === 0 && !isSearching && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
          <p className="text-gray-400">Try different keywords or check your filters</p>
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-xl font-semibold text-white mb-2">Search Evil Cass's Memory</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Search through all memories, documents, tasks, and past conversations. 
            Find any nugget of information from the workspace.
          </p>
          
          {/* Recent Searches */}
          <div className="mt-8">
            <h4 className="text-sm font-medium text-gray-500 mb-3">POPULAR SEARCHES</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {['Sam Altman', 'crypto narratives', 'X monetization', 'ClawdX airdrop', 'reply guy'].map((recent) => (
                <button
                  key={recent}
                  onClick={() => setQuery(recent)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-all"
                >
                  {recent}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
