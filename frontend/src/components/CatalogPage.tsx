import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter } from 'lucide-react';

import { getHomepage } from '../services/api';
import {
  extractSubjectsFromHomepage,
  extractPlatforms,
} from '../utils/extractCatalog';
import { useCatalogQuery } from '../hooks/useCatalogQuery';
import PillSelect from './PillSelect';

type Props = {
  title: string;
  filterType?: number;
};

export default function CatalogPage({ title, filterType }: Props) {
  const q = useCatalogQuery();

  // URL synced states
  const [search, setSearch] = useState(q.get('q', ''));
  const [genreFilter, setGenreFilter] = useState(q.get('genre', 'all'));
  const [countryFilter, setCountryFilter] = useState(q.get('country', 'all'));
  const [platformFilter, setPlatformFilter] = useState(
    q.get('platform', 'all')
  );
  const [sortBy, setSortBy] = useState<
    'relevance' | 'rating' | 'year' | 'title'
  >(q.get('sort', 'relevance') as any);
  const [page, setPage] = useState(Number(q.get('page', '1')) || 1);

  const [items, setItems] = useState<any[]>([]);
  const [allPlatforms, setAllPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterOpen, setFilterOpen] = useState(false);

  const PAGE_SIZE = 24;

  // fetch data
  useEffect(() => {
    getHomepage()
      .then((res) => {
        let all = extractSubjectsFromHomepage(res.data);
        if (filterType)
          all = all.filter((i: any) => i.subjectType === filterType);
        setItems(all);
        setAllPlatforms(extractPlatforms(res.data));
      })
      .finally(() => setLoading(false));
  }, [filterType]);

  // collect genre & country
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) =>
      i.genre?.split(',').forEach((g: string) => set.add(g.trim()))
    );
    return Array.from(set).sort();
  }, [items]);

  const allCountries = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.countryName && set.add(i.countryName));
    return Array.from(set).sort();
  }, [items]);

  // filtering + sorting
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.title?.toLowerCase().includes(q));
    }

    if (genreFilter !== 'all')
      result = result.filter((i) => i.genre?.includes(genreFilter));
    if (countryFilter !== 'all')
      result = result.filter((i) => i.countryName === countryFilter);
    if (platformFilter !== 'all')
      result = result.filter((i) => i.platforms?.includes(platformFilter));

    if (sortBy === 'rating')
      result.sort(
        (a, b) =>
          parseFloat(b.imdbRatingValue || 0) -
          parseFloat(a.imdbRatingValue || 0)
      );
    if (sortBy === 'year')
      result.sort(
        (a, b) =>
          new Date(b.releaseDate || '1900').getTime() -
          new Date(a.releaseDate || '1900').getTime()
      );
    if (sortBy === 'title')
      result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [items, search, genreFilter, countryFilter, platformFilter, sortBy]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pagedItems = filteredItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [search, genreFilter, countryFilter, platformFilter, sortBy]);

  // sync to URL
  useEffect(() => {
    q.set({
      q: search,
      genre: genreFilter,
      country: countryFilter,
      platform: platformFilter,
      sort: sortBy,
      page: String(page),
    });
  }, [search, genreFilter, countryFilter, platformFilter, sortBy, page]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#141414]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
      </div>
    );

  return (
    <div className="pt-28 px-6 md:px-16 min-h-screen bg-[#141414] text-white">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-2xl font-bold">{title}</h1>

        {/* TOOLBAR */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* SEARCH */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles..."
            className="bg-black/40 border border-gray-600 text-white px-4 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-black/80 transition-all w-48"
          />

          {/* DESKTOP FILTERS */}
          <div className="hidden md:flex gap-3">
            <PillSelect value={genreFilter} onChange={setGenreFilter}>
              <option value="all">All Genres</option>
              {allGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </PillSelect>

            <PillSelect value={countryFilter} onChange={setCountryFilter}>
              <option value="all">All Countries</option>
              {allCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </PillSelect>

            <PillSelect value={platformFilter} onChange={setPlatformFilter}>
              <option value="all">All Platforms</option>
              {allPlatforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </PillSelect>

            <PillSelect value={sortBy} onChange={setSortBy}>
              <option value="relevance">Relevance</option>
              <option value="rating">Highest Rating</option>
              <option value="year">Newest</option>
              <option value="title">Title A–Z</option>
            </PillSelect>
          </div>

          {/* MOBILE FILTER BUTTON */}
          <button
            className="md:hidden flex items-center gap-2 bg-black/40 border border-gray-600 px-4 py-1.5 rounded-full"
            onClick={() => setFilterOpen(true)}
          >
            <Filter size={16} />
            Filters
          </button>

          <div className="text-sm text-gray-400 ml-auto">
            {filteredItems.length} items
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-5">
        {pagedItems.map((t) => (
          <Link
            key={t.subjectId}
            to={'/detail/' + t.subjectId}
            className="group"
          >
            <div className="aspect-[2/3] rounded-lg overflow-hidden border border-gray-800">
              <img
                src={t.cover?.url}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <p className="mt-1 text-sm font-semibold truncate group-hover:text-red-500">
              {t.title}
            </p>
          </Link>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-4 py-10">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* MOBILE FILTER DRAWER */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
            />

            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-[#141414] z-50 rounded-t-2xl p-6"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex justify-between mb-4">
                <h2 className="font-bold text-lg">Filters</h2>
                <button onClick={() => setFilterOpen(false)}>✕</button>
              </div>

              <div className="flex flex-col gap-4">
                <PillSelect value={genreFilter} onChange={setGenreFilter}>
                  ...
                </PillSelect>
                <PillSelect value={countryFilter} onChange={setCountryFilter}>
                  ...
                </PillSelect>
                <PillSelect value={platformFilter} onChange={setPlatformFilter}>
                  ...
                </PillSelect>
                <PillSelect value={sortBy} onChange={setSortBy}>
                  ...
                </PillSelect>
              </div>

              <button
                className="mt-6 w-full bg-red-600 py-2 rounded-full"
                onClick={() => setFilterOpen(false)}
              >
                Apply Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
