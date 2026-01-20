import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Search as SearchIcon, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Profile = {
  username: string | null;
  avatar_url: string | null;
};

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      authListener.subscription.unsubscribe();
      unsubscribeProfile();
    };
  }, []);

  let profileChannel: any = null;

  const subscribeProfile = (userId: string) => {
    unsubscribeProfile();

    profileChannel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setProfile(payload.new as Profile);
        },
      )
      .subscribe();
  };

  const unsubscribeProfile = () => {
    if (profileChannel) {
      supabase.removeChannel(profileChannel);
      profileChannel = null;
    }
  };

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUser(null);
      setProfile(null);
      unsubscribeProfile();
      return;
    }

    setUser(user);

    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();

    setProfile(data);

    subscribeProfile(user.id);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
      {/* LEFT */}
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="text-red-600 font-black text-3xl tracking-tighter"
        >
          KonFLIX
        </Link>

        <div className="hidden md:flex gap-6 text-sm font-medium items-center">
          <Link to="/" className="hover:text-red-500 transition">
            Home
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

          {/* CATEGORY */}
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-red-500 transition">
              Categories <ChevronDown size={16} />
            </button>

            <div className="absolute top-full left-0 mt-3 w-48 bg-black/40 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl overflow-hidden opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-[9999]">
              <CategoryLink to="/browse?country=Korea&genre=Drama">
                K-Drama
              </CategoryLink>
              <CategoryLink to="/browse?country=China&genre=Drama">
                C-Drama
              </CategoryLink>
              <CategoryLink to="/browse?country=Japan&genre=Drama">
                J-Drama
              </CategoryLink>
              <CategoryLink to="/browse?country=Thailand&genre=Drama">
                Thai Drama
              </CategoryLink>
              <CategoryLink to="/browse?genre=Animation">Anime</CategoryLink>
              <CategoryLink to="/browse?country=United%20States">
                Western
              </CategoryLink>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* SEARCH */}
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
            className="bg-black/40 border border-gray-600 text-white pl-10 pr-6 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-black/80 transition-all w-40 md:w-64"
          />
        </form>

        {/* AUTH */}
        {!user ? (
          <Link
            to="/login"
            className="text-sm px-4 py-1.5 rounded-full border border-white/20 hover:bg-white/10 transition"
          >
            Login
          </Link>
        ) : (
          <div className="relative group">
            <button className="flex items-center gap-2">
              <img
                src={
                  profile?.avatar_url || 'https://ui-avatars.com/api/?name=User'
                }
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm text-white/80 hidden md:block">
                {profile?.username || user.email}
              </span>
            </button>

            {/* DROPDOWN */}
            <div className="absolute right-0 mt-3 w-40 bg-black/60 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl overflow-hidden opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm hover:bg-white/10"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 text-red-400"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-red-400 transition"
    >
      {children}
    </Link>
  );
}
