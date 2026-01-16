import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react'; // Import ikon search

export default function Navbar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Arahkan ke halaman search dengan query string
      navigate(`/search?q=${query}`);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
      {/* SISI KIRI: Logo & Menu */}
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="text-red-600 font-black text-3xl tracking-tighter"
        >
          KonFLIX
        </Link>
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-red-500 transition">
            Home
          </Link>
          <Link to="/movie" className="hover:text-red-500 transition">
            Movie
          </Link>
          <Link to="/browse" className="hover:text-red-500 transition">
            Browse
          </Link>
          <Link to="/movies" className="hover:text-red-500 transition">
            Movies
          </Link>
          <Link to="/series" className="hover:text-red-500 transition">
            Series
          </Link>
          <Link to="/shorts" className="hover:text-red-500 transition">
            Shorts
          </Link>
          <Link to="/live" className="hover:text-red-500 transition">
            Live Sport
          </Link>
        </div>
      </div>

      {/* SISI KANAN: Search Bar Transparan */}
      <form
        onSubmit={handleSearch}
        className="relative flex items-center group"
      >
        <SearchIcon
          size={18}
          className="absolute left-3 text-gray-400 group-focus-within:text-red-600 transition-colors"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Titles, people, genres..."
          className="bg-black/40 border border-gray-600 text-white pl-10 pr-4 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-black/80 transition-all w-40 md:w-64"
        />
      </form>
    </div>
  );
}
