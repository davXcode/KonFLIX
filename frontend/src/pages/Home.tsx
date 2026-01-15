import { useEffect, useState, useRef } from 'react';
import { getHomepage, getTrending } from '../services/api';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

export default function Home() {
  const [banners, setBanners] = useState<any[]>([]); // Ubah jadi array untuk menampung banyak banner
  const [currentIndex, setCurrentIndex] = useState(0); // Index banner yang aktif
  const [trending, setTrending] = useState<any[]>([]);
  const [filteredTrending, setFilteredTrending] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [activePlatform, setActivePlatform] = useState<string>('All');

  const platformRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk geser manual lewat tombol
  const scroll = (direction: 'left' | 'right') => {
    if (platformRef.current) {
      const { scrollLeft, clientWidth } = platformRef.current;
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth / 2
          : scrollLeft + clientWidth / 2;
      platformRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Ganti tipe data ref
  const timeoutRef = useRef<number | null>(null);

  // Ganti saat pemanggilan
  timeoutRef.current = window.setTimeout(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  }, 5000);

  // Ganti saat clear
  if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

  const trendingRef = useRef<HTMLDivElement>(null);

  const scrollTrending = (direction: 'left' | 'right') => {
    if (trendingRef.current) {
      const { scrollLeft, clientWidth } = trendingRef.current;
      // Kita geser sejauh 80% dari lebar layar agar smooth
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth * 0.8
          : scrollLeft + clientWidth * 0.8;
      trendingRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    getHomepage().then((res) => {
      const items = res.data?.operatingList?.[0]?.banner?.items || [];
      setBanners(items);
      setPlatforms(res.data?.platformList || []);
    });

    getTrending().then((res) => {
      const data = res.data.subjectList || [];
      setTrending(data);
      // Trending Section hanya ambil 10 data pertama
      setFilteredTrending(data.slice(0, 10));
    });
  }, []);

  // useEffect(() => {
  //   getHomepage().then((res) => {
  //     const items = res.data?.operatingList?.[0]?.banner?.items || [];
  //     setBanners(items); // Simpan semua item banner
  //     setPlatforms(res.data?.platformList || []);
  //   });

  //   getTrending().then((res) => {
  //     const data = res.data.subjectList || [];
  //     setTrending(data);
  //     setFilteredTrending(data);
  //   });
  // }, []);

  // --- LOGIKA AUTO PLAY BANNER ---
  useEffect(() => {
    if (banners.length > 0) {
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === banners.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Ganti banner setiap 5 detik
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, banners]);

  const handleFilter = (platformName: string) => {
    setActivePlatform(platformName);
    if (platformName === 'All') {
      setFilteredTrending(trending);
    } else {
      // Filter yang lebih akurat berdasarkan platform ID atau Name
      const filtered = trending.filter(
        (item) =>
          item.subjectTitle
            ?.toLowerCase()
            .includes(platformName.toLowerCase()) ||
          item.tagList?.some(
            (tag: any) => tag.name.toLowerCase() === platformName.toLowerCase()
          )
      );
      setFilteredTrending(filtered);
    }
  };

  const currentBanner = banners[currentIndex];

  const top10Ref = useRef<HTMLDivElement>(null);

  const scrollHorizontal = (
    ref: React.RefObject<HTMLDivElement>,
    direction: 'left' | 'right'
  ) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth * 0.8
          : scrollLeft + clientWidth * 0.8;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#141414] min-h-screen text-white">
      {/* 1. HERO BANNER */}
      {currentBanner && (
        <div className="relative w-full h-[85vh] md:h-[95vh] overflow-hidden">
          {/* Background Image dengan Overlay */}
          <div
            key={currentBanner.subject.subjectId}
            className="absolute inset-0 bg-cover bg-center animate-fade-in transition-all duration-1000"
            style={{ backgroundImage: `url(${currentBanner.image.url})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

          <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-5xl z-10">
            {/* Meta Info: Rating & Metadata */}
            <div className="flex items-center gap-3 mb-4 text-sm md:text-base font-semibold">
              <span className="bg-yellow-500 text-black px-2 py-0.5 rounded flex items-center gap-1">
                ⭐ {currentBanner.subject.imdbRatingValue}
              </span>
              <span className="text-green-400">
                {currentBanner.subject.releaseDate.split('-')[0]}
              </span>
              <span className="border border-gray-500 px-2 py-0.5 rounded text-xs">
                {currentBanner.subject.countryName}
              </span>
              <span className="text-gray-300">
                {currentBanner.subject.genre.replace(',', ' • ')}
              </span>
            </div>

            {/* Judul */}
            <h1 className="text-4xl md:text-7xl font-black uppercase italic mb-4 drop-shadow-2xl leading-tight tracking-tighter">
              {currentBanner.subject.title}
            </h1>

            {/* Deskripsi */}
            <p className="text-gray-300 text-sm md:text-lg mb-8 line-clamp-3 md:line-clamp-4 max-w-2xl drop-shadow-md leading-relaxed">
              {currentBanner.subject.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                to={'/detail/' + currentBanner.subject.subjectId}
                className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded hover:bg-red-600 hover:text-white transition-all font-bold uppercase tracking-widest shadow-lg"
              >
                <Play fill="currentColor" size={20} /> WATCH NOW
              </Link>

              {/* Tombol Tambahan biar rame */}
              <button className="flex items-center gap-2 bg-gray-500/40 backdrop-blur-md text-white px-8 py-3 rounded hover:bg-gray-500/60 transition-all font-bold uppercase tracking-widest border border-gray-400/30">
                MY LIST
              </button>
            </div>

            {/* Subtitles (Biar kelihatan fiturnya banyak) */}
            <div className="mt-8 hidden md:block">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                Available Subtitles
              </p>
              <div className="flex flex-wrap gap-2">
                {currentBanner.subject.subtitles
                  .split(',')
                  .slice(0, 5)
                  .map((sub: string) => (
                    <span
                      key={sub}
                      className="text-[10px] bg-white/10 px-2 py-1 rounded"
                    >
                      {sub}
                    </span>
                  ))}
                <span className="text-[10px] bg-white/10 px-2 py-1 rounded">
                  +{currentBanner.subject.subtitles.split(',').length - 5} More
                </span>
              </div>
            </div>

            {/* Indikator Slide */}
            <div className="flex gap-3 mt-12">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    idx === currentIndex
                      ? 'w-12 bg-red-600'
                      : 'w-6 bg-gray-700 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. PLATFORM LIST */}
      <div className="relative z-20 -mt-10 px-8 md:px-16 group">
        {/* Tombol Geser Kiri */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-10 top-1/2 -translate-y-1/2 z-30 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
        >
          <ChevronLeft size={24} />
        </button>

        <div
          ref={platformRef}
          className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth active:cursor-grabbing cursor-grab"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          <button
            onClick={() => handleFilter('All')}
            className={`flex-shrink-0 min-w-[120px] h-14 rounded-lg border transition-all font-bold italic shadow-lg ${
              activePlatform === 'All'
                ? 'bg-red-600 border-red-600'
                : 'bg-[#222] border-gray-800'
            }`}
          >
            ALL
          </button>

          {platforms.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleFilter(p.name)}
              className={`flex-shrink-0 min-w-[140px] h-14 rounded-lg border transition-all flex items-center justify-center group/btn shadow-lg ${
                activePlatform === p.name
                  ? 'bg-red-600 border-red-600'
                  : 'bg-[#222] border-gray-800'
              }`}
            >
              <span
                className={`uppercase font-bold italic tracking-widest ${
                  activePlatform === p.name
                    ? 'text-white'
                    : 'text-gray-400 group-hover/btn:text-white'
                }`}
              >
                {p.name}
              </span>
            </button>
          ))}
        </div>

        {/* Tombol Geser Kanan */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-10 top-1/2 -translate-y-1/2 z-30 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* 3. TRENDING SECTION */}
      <div className="px-8 md:px-16 py-12 relative group">
        <h2 className="text-2xl font-bold mb-6 flex justify-between items-center">
          <span>
            {activePlatform === 'All'
              ? 'Trending Now'
              : `Results for ${activePlatform}`}
          </span>

          {/* Tombol Navigasi Desktop */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scrollTrending('left')}
              className="p-2 bg-[#222] hover:bg-red-600 rounded-full transition-all shadow-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollTrending('right')}
              className="p-2 bg-[#222] hover:bg-red-600 rounded-full transition-all shadow-lg"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </h2>

        <div
          ref={trendingRef}
          className="flex gap-4 overflow-x-auto pb-8 no-scrollbar scroll-smooth"
        >
          {filteredTrending.length > 0 ? (
            filteredTrending.map((t) => (
              <Link
                key={t.subjectId}
                to={'/detail/' + t.subjectId}
                className="flex-shrink-0 w-[160px] md:w-[220px] group/item relative"
              >
                <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-2xl relative transition-transform duration-300 group-hover/item:scale-105 group-hover/item:z-20">
                  <img
                    src={t.cover.url}
                    alt={t.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay info saat di hover (Biar Rame) */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-xs font-bold text-yellow-500 mb-1">
                      ⭐ {t.imdbRatingValue || 'N/A'}
                    </p>
                    <p className="text-[10px] line-clamp-2 text-gray-200 leading-tight">
                      {t.title}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 italic">
              No content found for this platform.
            </p>
          )}
        </div>
      </div>

      {/* 4. TOP 10 GLOBAL */}
      {trending.length > 5 && (
        <div className="px-8 md:px-16 py-12 relative group bg-gradient-to-b from-transparent via-red-900/10 to-transparent">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            Top 10 Global{' '}
            <span className="text-sm bg-red-600 px-2 py-1 rounded">LIVE</span>
          </h2>

          <div
            ref={top10Ref}
            className="flex gap-12 overflow-x-auto pb-10 no-scrollbar scroll-smooth px-4"
          >
            {/* Logic: Ambil data mulai dari index ke-10. 
          Jika data ke-10 kosong, ambil saja dari index 0 tapi di-reverse (dibalik) 
          biar isinya beda dengan yang di atas.
      */}
            {(trending.length > 15
              ? trending.slice(1, 20)
              : [...trending].reverse()
            ).map((t, idx) => (
              <Link
                key={t.subjectId}
                to={'/detail/' + t.subjectId}
                className="flex-shrink-0 relative w-[200px] md:w-[240px] group/top"
              >
                {/* Angka Ranking */}
                <span
                  className="absolute -left-10 bottom-0 text-[120px] md:text-[150px] font-black leading-none opacity-50 group-hover/top:opacity-100 transition-opacity duration-500 select-none text-transparent"
                  style={{
                    WebkitTextStroke: '2px #555',
                    fontFamily: 'Arial Black, sans-serif',
                  }}
                >
                  {idx + 1}
                </span>

                <div className="ml-10 aspect-[2/3] rounded-md overflow-hidden shadow-2xl relative z-10 transition-transform duration-300 group-hover/top:-translate-y-4">
                  <img
                    src={t.cover.url}
                    alt={t.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 right-0 p-2">
                    <span className="bg-red-600 text-[10px] font-bold px-2 py-1 rounded-sm shadow-lg">
                      TOP 10
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 5. CTA SECTION (Biar kelihatan ada interaksi) */}
      <div className="px-8 md:px-16 py-20 border-t border-gray-800/50">
        <div className="bg-gradient-to-r from-red-900/40 to-black p-8 md:p-16 rounded-3xl border border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase italic">
              Ready to dive in?
            </h2>
            <p className="text-gray-400 text-lg">
              Download our mobile app for better experience and offline viewing.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="bg-white text-black font-bold px-8 py-4 rounded-full hover:bg-gray-200 transition-all shadow-xl uppercase tracking-tighter">
              Get Mobile App
            </button>
            <button className="border border-white/20 font-bold px-8 py-4 rounded-full hover:bg-white/10 transition-all uppercase tracking-tighter">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* 6. SIMPLE FOOTER */}
      <footer className="px-8 md:px-16 py-12 text-gray-500 text-sm border-t border-gray-900">
        <div className="flex flex-wrap gap-8 mb-8">
          <a href="#" className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Help Center
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Contact Us
          </a>
        </div>
        <p>© 2026 KonFLIX App. All rights reserved.</p>
      </footer>
    </div>
  );
}
