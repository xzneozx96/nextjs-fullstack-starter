import React, { useEffect, useRef, useState } from 'react';

type WebSearchComponentProps = {
  onSearchComplete?: (result: string) => void;
};

const WebSearchComponent: React.FC<WebSearchComponentProps> = ({ onSearchComplete }) => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function to abort any in-progress requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSearch = async () => {
    if (!prompt.trim()) {
      setError('Please enter a search query');
      return;
    }

    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setError('');
    setResult('');

    // Set a timeout to abort the request after 60 seconds
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setError('Request timed out. Please try with a simpler query.');
        setIsLoading(false);
      }
    }, 60000); // 60 seconds timeout

    try {
      const response = await fetch('/api/openai-web-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
        signal,
      });

      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get search results');
      }

      const data = await response.json();
      setResult(data.result || '');

      if (onSearchComplete && data.result) {
        onSearchComplete(data.result);
      }
    } catch (err: any) {
      // Clear the timeout
      clearTimeout(timeoutId);

      // Don't show error for aborted requests (unless it was our timeout)
      if (err.name === 'AbortError' && !err.message.includes('timed out')) {
        console.log('Request was aborted');
        return;
      }

      setError(err.message || 'An error occurred while searching. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4">Web Search</h3>

      <div className="mb-4">
        <label htmlFor="search-prompt" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Enter your search query:
        </label>
        <textarea
          id="search-prompt"
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="What would you like to search for?"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
      </div>

      <button
        type="button"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        onClick={handleSearch}
        disabled={isLoading || !prompt.trim()}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h4 className="text-md font-medium mb-2">Results:</h4>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="prose dark:prose-invert max-w-none">
              {result}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebSearchComponent;
