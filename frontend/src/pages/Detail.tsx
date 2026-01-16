import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDetail, getSources, generateStream } from '../services/api';
import { Play, Info, Settings, Star, Calendar, Globe } from 'lucide-react';

import { Languages } from 'lucide-react'; // Tambah ikon baru

export default function Detail() {
  const { id } = useParams();
  const [detail, setDetail] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [captions, setCaptions] = useState<any[]>([]); // State untuk subtitle
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [activeSubtitle, setActiveSubtitle] = useState<string>('en'); // Default English
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'quality' | 'subtitle'>('quality'); // Tab di menu settings

  // EPISODE
  const [seasons, setSeasons] = useState<any[]>([]);
  const [activeSeason, setActiveSeason] = useState(1);
  const [activeEpisode, setActiveEpisode] = useState<number | null>(null);

  const loadEpisode = async (season: number, episode: number) => {
    if (!id) return;

    setActiveSeason(season);
    setActiveEpisode(episode);

    setStreamUrl('');
    setSources([]);
    setCaptions([]);

    const res = await getSources(id, season, episode);

    setSources(res.data.processedSources || []);
    setCaptions(res.data.captions || []);

    if (res.data.processedSources?.length) {
      const best =
        res.data.processedSources[res.data.processedSources.length - 1];
      const stream = await generateStream(best.directUrl);
      setStreamUrl(stream.data.streamUrl);
    }

    setTimeout(() => {
      document.getElementById('player')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);

    // Promise.all([getDetail(id), getSources(id)]).then(
    Promise.all([getDetail(id), getSources(id)]).then(
      ([detailRes, sourceRes]) => {
        const subject = detailRes.data.subject;
        setDetail(subject);

        setStars(detailRes.data.stars || []); // ✅ TAMBAH INI

        if (detailRes.data.resource?.seasons) {
          const validSeasons = detailRes.data.resource.seasons.filter(
            (s: any) => s.se > 0 && s.maxEp > 0
          );
          setSeasons(validSeasons);
        }

        setSources(sourceRes.data.processedSources || []);
        setCaptions(sourceRes.data.captions || []);
        setIsLoading(false);
      }
    );

    //   ([detailRes, sourceRes]) => {
    //     const subject = detailRes.data.subject;
    //     setDetail(subject);

    //     // // Series?
    //     if (detailRes.data.resource?.seasons) {
    //       const validSeasons = detailRes.data.resource.seasons.filter(
    //         (s: any) => s.se > 0 && s.maxEp > 0
    //       );

    //       setSeasons(validSeasons);
    //     }

    //     setSources(sourceRes.data.processedSources || []);
    //     setCaptions(sourceRes.data.captions || []);
    //     setIsLoading(false);
    //   }
    // );
  }, [id]);

  const handleAutoPlay = async () => {
    if (sources.length > 0) {
      // Ambil kualitas tertinggi (biasanya 1080p ada di index terakhir atau pertama tergantung API)
      // Kita asumsikan index terakhir adalah kualitas terbaik
      const bestSource = sources[sources.length - 1];
      const res = await generateStream(bestSource.directUrl);
      setStreamUrl(res.data.streamUrl);

      setTimeout(() => {
        document
          .getElementById('player')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const changeQuality = async (url: string) => {
    const res = await generateStream(url);
    setStreamUrl(res.data.streamUrl);
    setShowSettings(false);
  };

  const [stars, setStars] = useState<any[]>([]);

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#141414]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#141414] text-white pb-20">
      {/* 1. HERO BACKDROP SECTION */}
      <div className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-105"
          style={{ backgroundImage: `url(${detail.cover.url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 px-8 md:px-16 pb-12 z-10 max-w-4xl">
          <div className="flex items-center gap-4 mb-4">
            <span className="flex items-center gap-1 text-yellow-500 font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
              <Star size={16} fill="currentColor" />{' '}
              {detail.imdbRatingValue || 'N/A'}
            </span>
            <span className="flex items-center gap-1 text-gray-300">
              <Calendar size={16} /> {detail.releaseDate?.split('-')[0]}
            </span>
            <span className="flex items-center gap-1 text-gray-300">
              <Globe size={16} /> {detail.countryName}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase italic tracking-tighter drop-shadow-2xl">
            {detail.title}
          </h1>

          <p className="text-gray-300 text-lg mb-8 line-clamp-3 md:line-clamp-none max-w-2xl leading-relaxed">
            {detail.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleAutoPlay}
              className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl active:scale-95"
            >
              <Play fill="currentColor" size={24} /> WATCH NOW
            </button>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold transition-all border border-white/10">
              <Info size={24} /> MY LIST
            </button>
          </div>
        </div>
      </div>
      {/* CAST - HOVER POPUP */}
      {stars.length > 0 && (
        <div className="px-8 md:px-16 mt-12">
          <h3 className="text-lg font-bold mb-4 text-red-600 uppercase tracking-widest">
            Cast
          </h3>

          <div className="flex flex-wrap gap-4">
            {stars.map((star) => (
              <div key={star.staffId} className="relative group">
                {/* Trigger */}
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                    <img
                      src={
                        star.avatarUrl ||
                        'https://ui-avatars.com/api/?size=128&name=' +
                          encodeURIComponent(star.name)
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-red-500 transition">
                    {star.name}
                  </span>
                </div>

                {/* Popup */}
                <div className="absolute left-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl p-3 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all z-50">
                  <div className="flex gap-3">
                    <img
                      src={
                        star.avatarUrl ||
                        'https://ui-avatars.com/api/?size=256&name=' +
                          encodeURIComponent(star.name)
                      }
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-bold text-sm">{star.name}</div>
                      <div className="text-xs text-gray-400">
                        as {star.character}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. VIDEO PLAYER SECTION */}
      {streamUrl && (
        <div id="player" className="px-8 md:px-16 mt-8 animate-fade-in">
          <div className="relative group max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)] border border-white/5 bg-black">
            <video
              key={streamUrl + activeSubtitle} // Re-render video saat source atau sub berubah
              controls
              autoPlay
              className="w-full aspect-video"
              crossOrigin="anonymous" // PENTING: Agar browser diizinkan mengambil file subtitle (CORS)
            >
              <source src={streamUrl} type="video/mp4" />

              {captions.map((cap) => {
                return (
                  <track
                    key={cap.id}
                    src={`${
                      import.meta.env.VITE_BASE_URL
                    }/api/subtitle?url=${encodeURIComponent(cap.url)}`}
                    kind="subtitles"
                    srcLang={cap.lan}
                    label={cap.lanName}
                    default={cap.lan === activeSubtitle}
                  />
                );
              })}
            </video>

            {/* SETTINGS UI */}
            <div className="absolute top-4 right-4 z-30">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 bg-black/60 backdrop-blur-md rounded-full hover:bg-red-600 transition-all border border-white/10"
              >
                <Settings
                  size={20}
                  className={
                    showSettings ? 'rotate-90 transition-transform' : ''
                  }
                />
              </button>

              {showSettings && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                  {/* Tab Header */}
                  <div className="flex border-b border-white/5">
                    <button
                      onClick={() => setActiveTab('quality')}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${
                        activeTab === 'quality'
                          ? 'text-red-600 border-b-2 border-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      Quality
                    </button>
                    <button
                      onClick={() => setActiveTab('subtitle')}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${
                        activeTab === 'subtitle'
                          ? 'text-red-600 border-b-2 border-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      Subtitles
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="max-h-60 overflow-y-auto no-scrollbar">
                    {activeTab === 'quality' ? (
                      <div className="p-2">
                        {sources.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => changeQuality(s.directUrl)}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 rounded-lg transition-colors flex justify-between items-center group"
                          >
                            <span className="group-hover:text-red-500 font-medium">
                              {s.quality}p
                            </span>
                            {streamUrl.includes(s.directUrl) && (
                              <div className="w-2 h-2 bg-red-600 rounded-full" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2">
                        {captions.map((cap) => (
                          <button
                            key={cap.id}
                            onClick={() => {
                              setActiveSubtitle(cap.lan);
                              // Untuk native video tag, perubahan track default butuh re-load atau manual selection
                              setShowSettings(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 rounded-lg transition-colors flex justify-between items-center group"
                          >
                            <div className="flex items-center gap-3">
                              <Languages size={14} className="text-gray-500" />
                              <span className="group-hover:text-red-500">
                                {cap.lanName}
                              </span>
                            </div>
                            {activeSubtitle === cap.lan && (
                              <div className="w-2 h-2 bg-red-600 rounded-full" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EPISODE LIST */}
      {seasons.length > 0 && (
        <div className="px-8 md:px-16 mt-8">
          <h2 className="text-xl font-bold mb-4">Episodes</h2>

          {seasons.map((s) => (
            <div key={s.se} className="mb-6">
              <h3 className="text-lg font-bold mb-3">Season {s.se}</h3>

              <div className="grid grid-cols-6 md:grid-cols-10 gap-3">
                {Array.from({ length: s.maxEp }).map((_, i) => {
                  const ep = i + 1;
                  const active = activeSeason === s.se && activeEpisode === ep;

                  return (
                    <button
                      key={ep}
                      onClick={() => loadEpisode(s.se, ep)}
                      className={`p-3 rounded-lg text-sm font-bold transition ${
                        active
                          ? 'bg-red-600 text-white'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      EP {ep}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. ADDITIONAL INFO */}
      <div className="px-8 md:px-16 mt-16 grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <h3 className="text-xl font-bold mb-4 text-red-600 uppercase tracking-widest">
            Storyline
          </h3>
          <p className="text-gray-400 leading-loose text-lg italic">
            "{detail.description}"
          </p>
        </div>
        <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5">
          <h3 className="text-xl font-bold mb-6">Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
              <span className="text-gray-500">Genres</span>
              <span className="text-gray-200">{detail.genre}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 text-sm relative group">
              <span className="text-gray-500">Subtitles</span>

              {/* Text (truncate) */}
              <span className="text-gray-200 truncate ml-4 max-w-[150px] cursor-pointer">
                {detail.subtitles}
              </span>

              {/* Hover Popup */}
              <div className="absolute right-0 top-full mt-2 max-w-sm bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl p-3 text-xs text-gray-200 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all z-50">
                <div className="font-semibold mb-1 text-red-500">
                  Available Subtitles
                </div>
                <div className="leading-relaxed break-words">
                  {detail.subtitles}
                </div>
              </div>
            </div>

            <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
              <span className="text-gray-500">Rating</span>
              <span className="text-yellow-500 font-bold">
                {detail.imdbRatingValue} / 10
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
