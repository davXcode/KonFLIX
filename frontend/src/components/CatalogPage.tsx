import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter } from 'lucide-react';

import { getHomepage } from '../services/api';
import { extractSubjectsFromHomepage } from '../utils/extractCatalog';
import { useCatalogQuery } from '../hooks/useCatalogQuery';
import PillSelect from './PillSelect';

type Props = {
  title: string;
  filterType?: number;
};

export default function CatalogPage({ title, filterType }: Props) {
  const q = useCatalogQuery();
  const location = useLocation();
  const navigate = useNavigate();

  // URL synced states
  const [search, setSearch] = useState(q.get('q', ''));
  const [genreFilter, setGenreFilter] = useState(q.get('genre', 'all'));
  const [countryFilter, setCountryFilter] = useState(q.get('country', 'all'));
  const [sortBy, setSortBy] = useState<
    'relevance' | 'rating' | 'year' | 'title'
  >(q.get('sort', 'relevance') as any);
  const [page, setPage] = useState(Number(q.get('page', '1')) || 1);

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const PAGE_SIZE = 24;

  // ==============================
  // 🔥 NORMALIZE URL (always full params)
  // ==============================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let changed = false;

    if (!params.get('genre')) {
      params.set('genre', 'all');
      changed = true;
    }
    if (!params.get('country')) {
      params.set('country', 'all');
      changed = true;
    }
    if (!params.get('sort')) {
      params.set('sort', 'relevance');
      changed = true;
    }
    if (!params.get('page')) {
      params.set('page', '1');
      changed = true;
    }

    if (changed) {
      navigate(
        {
          pathname: location.pathname,
          search: params.toString(),
        },
        { replace: true }
      );
    }
  }, [location.search]);

  // ==============================
  // 🔁 SYNC STATE FROM URL
  // ==============================
  useEffect(() => {
    setSearch(q.get('q', ''));
    setGenreFilter(q.get('genre', 'all'));
    setCountryFilter(q.get('country', 'all'));
    setSortBy(q.get('sort', 'relevance') as any);
    setPage(Number(q.get('page', '1')) || 1);
  }, [location.search]);

  // ==============================
  // 📦 FETCH DATA
  // ==============================
  useEffect(() => {
    setLoading(true);
    getHomepage()
      .then((res) => {
        let all = extractSubjectsFromHomepage(res.data);
        if (filterType)
          all = all.filter((i: any) => i.subjectType === filterType);
        setItems(all);
      })
      .finally(() => setLoading(false));
  }, [filterType]);

  // ==============================
  // 🧩 GENRE & COUNTRY
  // ==============================
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

  // ==============================
  // 🔍 FILTER + SORT
  // ==============================
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter((i) => i.title?.toLowerCase().includes(s));
    }

    if (genreFilter !== 'all')
      result = result.filter((i) => i.genre?.includes(genreFilter));
    if (countryFilter !== 'all')
      result = result.filter((i) => i.countryName === countryFilter);

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
  }, [items, search, genreFilter, countryFilter, sortBy]);

  // ==============================
  // 📄 PAGINATION
  // ==============================
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pagedItems = filteredItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // ==============================
  // 🔄 RESET PAGE + SCROLL TOP WHEN FILTER CHANGES
  // ==============================
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPage(1);
  }, [genreFilter, countryFilter, sortBy, search]);

  // ==============================
  // 🔗 SYNC TO URL
  // ==============================
  useEffect(() => {
    q.set({
      q: search,
      genre: genreFilter,
      country: countryFilter,
      sort: sortBy,
      page: String(page),
    });
  }, [search, genreFilter, countryFilter, sortBy, page]);

  // ==============================
  // ⏳ LOADING
  // ==============================
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#141414]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
      </div>
    );

  // ==============================
  // 🖼️ RENDER
  // ==============================
  return (
    <div className="pt-28 px-6 md:px-16 min-h-screen bg-[#141414] text-white">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-2xl font-bold">{title}</h1>

        <div className="flex flex-wrap gap-3 items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles..."
            className="bg-black/40 border border-gray-600 text-white px-4 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-600 w-48"
          />

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

            <PillSelect value={sortBy} onChange={setSortBy}>
              <option value="relevance">Relevance</option>
              <option value="rating">Highest Rating</option>
              <option value="year">Newest</option>
              <option value="title">Title A–Z</option>
            </PillSelect>
          </div>

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

      {/* GRID WITH ANIMATION */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.search}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-5"
        >
          {pagedItems.map((t) => (
            <Link key={t.subjectId} to={'/detail/' + t.subjectId}>
              <div className="aspect-[2/3] rounded-lg overflow-hidden border border-gray-800">
                <img
                  src={t.cover?.url}
                  className="w-full h-full object-cover hover:scale-105 transition"
                />
              </div>
              <p className="mt-1 text-sm font-semibold truncate">{t.title}</p>
            </Link>
          ))}
        </motion.div>
      </AnimatePresence>

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
    </div>
  );
}
