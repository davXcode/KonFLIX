import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type HistoryItem = {
  id: number;
  movie_id: string;
  movie_title: string;
  poster_url: string;
  updated_at: string;
  season?: number | null;
  episode?: number | null;
};

export default function History() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate('/login');
      return;
    }

    const { data } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    setItems(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading history...
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 px-10 text-white">
      <h1 className="text-3xl font-bold mb-8">Watch History</h1>

      {items.length === 0 && (
        <div className="text-white/60">No watch history yet.</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {items.map((item) => (
          <Link key={item.id} to={`/detail/${item.movie_id}`} className="group">
            <div className="relative">
              <img
                src={item.poster_url}
                className="rounded-lg shadow-lg group-hover:scale-105 transition"
              />
              <div className="mt-2 text-sm text-white/80 line-clamp-2">
                {item.movie_title}
              </div>
              <div className="text-xs text-white/40">
                {item.season
                  ? `Season ${item.season} Episode ${item.episode}`
                  : 'Movie'}
              </div>
              <div className="text-xs text-white/40">
                {new Date(item.updated_at).toLocaleString()}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
