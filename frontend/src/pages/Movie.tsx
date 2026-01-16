import { useEffect, useMemo, useState } from 'react';
import { getHomepage } from '../services/api';
import { Link } from 'react-router-dom';

type Item = any;

const PAGE_SIZE = 24;

export default function Movie() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'series'>(
    'all'
  );
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'relevance' | 'rating' | 'year' | 'title'
  >('relevance');
  const [search, setSearch] = useState('');

  // pagination
  const [page, setPage] = useState(1);

  useEffect(() => {
    getHomepage()
      .then((res) => {
        const lists = res.data?.operatingList || [];

        const all = lists
          .filter((x: any) => x.type === 'SUBJECTS_MOVIE')
          .flatMap((x: any) => x.subjects || []);

        // ✅ deduplicate by subjectId
        const map = new Map<string, any>();
        for (const item of all) {
          if (item?.subjectId && !map.has(item.subjectId)) {
            map.set(item.subjectId, item);
          }
        }

        setItems(Array.from(map.values()));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // build genre & country list
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      i.genre?.split(',').forEach((g: string) => g && set.add(g.trim()));
    });
    return Array.from(set).sort();
  }, [items]);

  const allCountries = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.countryName && set.add(i.countryName));
    return Array.from(set).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    // SEARCH
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.title?.toLowerCase().includes(q));
    }

    // TYPE
    if (typeFilter !== 'all') {
      result = result.filter((i) =>
        typeFilter === 'movie' ? i.subjectType === 1 : i.subjectType === 2
      );
    }

    // GENRE
    if (genreFilter !== 'all') {
      result = result.filter((i) => i.genre?.includes(genreFilter));
    }

    // COUNTRY
    if (countryFilter !== 'all') {
      result = result.filter((i) => i.countryName === countryFilter);
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
          new Date(b.releaseDate || '1900').getTime() -
          new Date(a.releaseDate || '1900').getTime()
      );
    }

    if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [items, search, typeFilter, genreFilter, countryFilter, sortBy]);

  // reset page if filter changes
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, genreFilter, countryFilter, sortBy]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const pagedItems = filteredItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#141414]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-28 px-8 md:px-16 min-h-screen bg-[#141414] text-white">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-2xl font-bold">Browse Catalog</h1>

        {/* TOOLBAR */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* SEARCH */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles..."
            className="bg-black/40 border border-gray-600 text-white px-4 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-black/80 transition-all w-48"
          />

          {/* TYPE */}
          <PillSelect value={typeFilter} onChange={setTypeFilter}>
            <option value="all">All</option>
            <option value="movie">Movies</option>
            <option value="series">Series</option>
          </PillSelect>

          {/* GENRE */}
          <PillSelect value={genreFilter} onChange={setGenreFilter}>
            <option value="all">All Genres</option>
            {allGenres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </PillSelect>

          {/* COUNTRY */}
          <PillSelect value={countryFilter} onChange={setCountryFilter}>
            <option value="all">All Countries</option>
            {allCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </PillSelect>

          {/* SORT */}
          <PillSelect value={sortBy} onChange={setSortBy}>
            <option value="relevance">Relevance</option>
            <option value="rating">Highest Rating</option>
            <option value="year">Newest</option>
            <option value="title">Title A–Z</option>
          </PillSelect>

          <div className="text-sm text-gray-400 ml-auto">
            {filteredItems.length} items
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
        {pagedItems.map((t) => (
          <Link
            key={t.subjectId}
            to={'/detail/' + t.subjectId}
            className="group transition-transform duration-300 hover:scale-105"
          >
            <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-lg border border-gray-800">
              <img
                src={t.cover?.url}
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

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-12">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-full border border-gray-600 disabled:opacity-30"
          >
            Prev
          </button>

          <span className="text-sm text-gray-400">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-full border border-gray-600 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function PillSelect({
  value,
  onChange,
  children,
}: {
  value: any;
  onChange: (v: any) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-black/40 border border-gray-600 text-white px-4 pr-9 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-black/80 transition-all"
      >
        {children}
      </select>
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
  );
}
