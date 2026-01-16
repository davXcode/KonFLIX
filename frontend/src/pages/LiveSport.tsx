import { useEffect, useState } from 'react';
import { getHomepage } from '../services/api';
import { extractLiveSports } from '../utils/extractCatalog';

export default function LiveSport() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    getHomepage().then((res) => {
      setMatches(extractLiveSports(res.data));
    });
  }, []);

  return (
    <div className="pt-28 px-8 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Live Sports</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {matches.map((m) => (
          <a
            key={m.matchId}
            href={m.url}
            target="_blank"
            className="block border rounded-lg p-4"
          >
            <p className="font-semibold">
              {m.team1.name} vs {m.team2.name}
            </p>
            <p className="text-sm text-gray-400">
              {new Date(+m.startTime).toLocaleString()}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
