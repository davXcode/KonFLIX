import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchMovie } from '../services/api';

export default function Search() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Ambil keyword 'q' dari URL
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

  return (
    <div className="pt-28 px-8 md:px-16 min-h-screen bg-[#141414] text-white">
      <h1 className="text-2xl mb-8 text-gray-400">
        Showing results for:{' '}
        <span className="text-white font-bold">"{query}"</span>
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
          {items.map((t) => (
            <Link
              key={t.subjectId + t.title}
              to={'/detail/' + t.subjectId}
              className="group relative transition-transform duration-300 hover:scale-105"
            >
              <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-lg border border-gray-800">
                <img
                  src={t.cover.url}
                  alt={t.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-2 text-sm font-semibold truncate group-hover:text-red-500 transition">
                {t.title}
              </p>
            </Link>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && query && (
        <p className="text-center text-gray-500 py-20">
          No movies found for "{query}".
        </p>
      )}
    </div>
  );
}
