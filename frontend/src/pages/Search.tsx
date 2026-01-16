import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchMovie } from '../services/api';

type Item = any;

export default function Search() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  // filter & sort state
  const [typeFilter, setTypeFilter] = useState<
    'all' | 'movie' | 'series' | 'music'
  >('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'year'>(
    'relevance'
  );

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchMovie(query).then((res) => {
        setItems(res.data.items || []);
        setLoading(false);
      });
    }
  }, [query]);

  // mapping subjectType:
  // 1 = movie, 2 = series, 6 = music

  const filteredItems = useMemo(() => {
    let result = [...items];

    // FILTER
    if (typeFilter !== 'all') {
      result = result.filter((item) => {
        if (typeFilter === 'movie') return item.subjectType === 1;
        if (typeFilter === 'series') return item.subjectType === 2;
        if (typeFilter === 'music') return item.subjectType === 6;
        return true;
      });
    }

    // SORT
    if (sortBy === 'rating') {
      result.sort(
        (a, b) =>
          parseFloat(b.imdbRatingValue || '0') -
          parseFloat(a.imdbRatingValue || '0')
      );
    }

    if (sortBy === 'year') {
      result.sort(
        (a, b) =>
          new Date(b.releaseDate || '1900-01-01').getTime() -
          new Date(a.releaseDate || '1900-01-01').getTime()
      );
    }

    return result;
  }, [items, typeFilter, sortBy]);

  return (
    <div className="pt-28 px-8 md:px-16 min-h-screen bg-[#141414] text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-2xl text-gray-400">
          Showing results for:{' '}
          <span className="text-white font-bold">"{query}"</span>
        </h1>

        {/* FILTER BAR */}
        <div className="flex gap-3">
          {/* TYPE FILTER */}
          <div className="relative group">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="appearance-none bg-black/40 border border-gray-600 text-white px-4 pr-9 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-black/80 transition-all"
            >
              <option value="all">All</option>
              <option value="movie">Movies</option>
              <option value="series">Series</option>
              <option value="music">Music</option>
            </select>

            {/* arrow */}
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* SORT */}
          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-black/40 border border-gray-600 text-white px-4 pr-9 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-black/80 transition-all"
            >
              <option value="relevance">Relevance</option>
              <option value="rating">Highest Rating</option>
              <option value="year">Newest</option>
            </select>

            {/* arrow */}
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
          {filteredItems.map((t) => (
            <Link
              key={t.subjectId + t.title}
              to={'/detail/' + t.subjectId}
              className="group relative transition-transform duration-300 hover:scale-105"
            >
              <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-lg border border-gray-800">
                <img
                  src={t.cover?.url || t.thumbnail}
                  alt={t.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-2 text-sm font-semibold truncate group-hover:text-red-500 transition">
                {t.title}
              </p>
              <p className="text-xs text-gray-400">
                ⭐ {t.imdbRatingValue || 'N/A'} •{' '}
                {t.releaseDate?.slice(0, 4) || '—'}
              </p>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredItems.length === 0 && query && (
        <p className="text-center text-gray-500 py-20">
          No movies found for "{query}".
        </p>
      )}
    </div>
  );
}
