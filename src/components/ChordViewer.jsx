import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Heart,
  Maximize2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Type,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FAVORITES_KEY = 'akor:favorites';
const CHORD_REGEX = /(^|\s|[(])([A-G][#b]?)(m|min|maj|sus|dim|aug|add)?(4|5|6|7|9|11|13|\/|(\/[A-G][#b]?))*(?=$|\s|[)])/g;
const CHORD_TOKEN_REGEX = /^([A-G][#b]?)(m|min|maj|sus|dim|aug|add)?(4|5|6|7|9|11|13|\/|(\/[A-G][#b]?))*$/;

function ControlButton({ children, label, onClick, active = false, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-bold transition-all ${
        active
          ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-200'
          : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
      } ${className}`}
    >
      {children}
    </button>
  );
}

const getStoredFavorites = () => {
  const rawFavorites = window.localStorage.getItem(FAVORITES_KEY);
  if (!rawFavorites) return [];

  try {
    const parsedFavorites = JSON.parse(rawFavorites);
    return Array.isArray(parsedFavorites) ? parsedFavorites : [];
  } catch {
    return [];
  }
};

export default function ChordViewer({ title, artist, rawContent, songSlug }) {
  const [transposeStep, setTransposeStep] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1.2);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isFavorite, setIsFavorite] = useState(() => {
    if (!songSlug) return false;
    return getStoredFavorites().some((song) => song.slug === songSlug);
  });
  const stageRef = useRef(null);

  const favoritePayload = useMemo(() => ({
    slug: songSlug,
    title,
    artist,
  }), [artist, songSlug, title]);


  useEffect(() => {
    if (!isAutoScrolling) return undefined;

    const intervalId = window.setInterval(() => {
      const scrollTarget = isFocusMode && stageRef.current ? stageRef.current : window;

      if (scrollTarget === window) {
        const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        if (isAtBottom) {
          setIsAutoScrolling(false);
          return;
        }
        window.scrollBy({ top: scrollSpeed, behavior: 'auto' });
        return;
      }

      const isAtBottom = scrollTarget.scrollTop + scrollTarget.clientHeight >= scrollTarget.scrollHeight - 4;
      if (isAtBottom) {
        setIsAutoScrolling(false);
        return;
      }
      scrollTarget.scrollTop += scrollSpeed;
    }, 24);

    return () => window.clearInterval(intervalId);
  }, [isAutoScrolling, isFocusMode, scrollSpeed]);

  useEffect(() => {
    document.body.style.overflow = isFocusMode ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFocusMode]);

  const transposeChord = (chord, steps) => {
    const match = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chord;
    let root = match[1];
    const suffix = match[2];
    if (root === 'Bb') root = 'A#';
    if (root === 'Eb') root = 'D#';
    const index = NOTES.indexOf(root);
    if (index === -1) return chord;
    let newIndex = (index + steps) % 12;
    if (newIndex < 0) newIndex += 12;
    return NOTES[newIndex] + suffix;
  };

  const getArtistSlug = (name) => {
    if (!name) return '';
    return name.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const toggleFavorite = () => {
    if (!songSlug) return;

    const favorites = getStoredFavorites();
    const exists = favorites.some((song) => song.slug === songSlug);
    const nextFavorites = exists
      ? favorites.filter((song) => song.slug !== songSlug)
      : [favoritePayload, ...favorites].slice(0, 50);

    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites));
    setIsFavorite(!exists);
  };

  const toggleBrowserFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
      return;
    }
    await document.exitFullscreen?.();
  };

  const adjustFontSize = (amount) => {
    setFontSize((currentSize) => Math.min(24, Math.max(13, currentSize + amount)));
  };

  const renderContent = () => {
    if (!rawContent) return null;
    const lines = rawContent.split('\n');
    return lines.map((line, idx) => {
      const hasChord = line.match(CHORD_REGEX);

      const rowStyle = {
        display: 'block',
        fontFamily: '"Consolas", "Monaco", "Courier New", monospace',
        fontSize: `${fontSize}px`,
        whiteSpace: 'pre',
        margin: '0',
        padding: '0',
        letterSpacing: '0px',
        transform: 'none',
        wordSpacing: '-0.46ch'
      };

      if (hasChord) {
        const tokens = line.split(/(\s+|[()])/);
        const renderedLine = tokens.map((token, tIdx) => {
          if (CHORD_TOKEN_REGEX.test(token.trim())) {
            const transposed = transposeChord(token.trim(), transposeStep);
            return <span key={tIdx} className="text-blue-600 font-bold" style={{ wordSpacing: 'inherit' }}>{transposed}</span>;
          }
          return <span key={tIdx} className="text-gray-800" style={{ wordSpacing: 'inherit' }}>{token}</span>;
        });

        return (
          <div key={idx} style={{ ...rowStyle, height: `${fontSize + 2}px`, lineHeight: `${fontSize + 2}px` }}>
            {renderedLine}
          </div>
        );
      }

      return (
        <div key={idx} style={{
          ...rowStyle,
          height: `${fontSize + 8}px`,
          lineHeight: `${fontSize + 8}px`,
          marginBottom: '2px',
          color: '#1f2937'
        }}>
          {line || ' '}
        </div>
      );
    });
  };


  const viewer = (
    <div className={`mx-auto bg-white border border-gray-100 ${isFocusMode ? 'max-w-5xl min-h-screen rounded-none shadow-none' : 'max-w-4xl rounded-xl shadow-sm mt-6 mb-28'} p-4 sm:p-10`}>
      <div className="mb-6 border-b border-gray-100 pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Çalma Modu
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
            <h2 className="text-xl mt-1">
              <Link
                to={`/artist/${getArtistSlug(artist)}`}
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors cursor-pointer"
              >
                {artist}
              </Link>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ControlButton label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'} onClick={toggleFavorite} active={isFavorite}>
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              <span className="hidden sm:inline">Favori</span>
            </ControlButton>
            <ControlButton label="Odak modunu aç veya kapat" onClick={() => setIsFocusMode((current) => !current)} active={isFocusMode}>
              <Maximize2 size={18} />
              <span className="hidden sm:inline">Odak</span>
            </ControlButton>
            <ControlButton label="Tarayıcı tam ekranı" onClick={toggleBrowserFullscreen}>
              <Maximize2 size={18} />
              <span className="hidden sm:inline">Tam ekran</span>
            </ControlButton>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-3xl bg-gray-50 p-3 lg:grid-cols-[1fr_1.1fr_1fr]">
          <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 shadow-sm">
            <span className="text-sm font-bold text-gray-500">Ton</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setTransposeStep((step) => step - 1)} className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600" aria-label="Tonu yarım ses düşür"><Minus size={18} /></button>
              <span className="w-10 text-center font-extrabold text-blue-600">{transposeStep > 0 ? `+${transposeStep}` : transposeStep}</span>
              <button type="button" onClick={() => setTransposeStep((step) => step + 1)} className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600" aria-label="Tonu yarım ses yükselt"><Plus size={18} /></button>
              <button type="button" onClick={() => setTransposeStep(0)} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600" aria-label="Tonu sıfırla"><RotateCcw size={16} /></button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 shadow-sm">
            <span className="flex items-center gap-2 text-sm font-bold text-gray-500"><Type size={16} /> Yazı</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => adjustFontSize(-1)} className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600" aria-label="Yazıyı küçült"><ChevronDown size={18} /></button>
              <span className="w-12 text-center font-extrabold text-gray-700">{fontSize}px</span>
              <button type="button" onClick={() => adjustFontSize(1)} className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600" aria-label="Yazıyı büyüt"><ChevronUp size={18} /></button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 shadow-sm">
            <span className="text-sm font-bold text-gray-500">Auto-scroll</span>
            <div className="flex items-center gap-2">
              <select
                value={scrollSpeed}
                onChange={(event) => setScrollSpeed(Number(event.target.value))}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-bold text-gray-600 outline-none focus:border-blue-300"
                aria-label="Otomatik kaydırma hızı"
              >
                <option value={0.7}>Yavaş</option>
                <option value={1.2}>Orta</option>
                <option value={1.8}>Hızlı</option>
              </select>
              <button
                type="button"
                onClick={() => setIsAutoScrolling((current) => !current)}
                className={`rounded-full p-2 transition-colors ${isAutoScrolling ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
                aria-label={isAutoScrolling ? 'Otomatik kaydırmayı durdur' : 'Otomatik kaydırmayı başlat'}
              >
                {isAutoScrolling ? <Pause size={18} /> : <Play size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-2 sm:p-4" style={{ overflowX: 'auto' }}>
        <div style={{ display: 'inline-block', minWidth: '100%' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isFocusMode ? (
        <div ref={stageRef} className="fixed inset-0 z-[100] overflow-y-auto bg-[#f5f9ff]">
          {viewer}
        </div>
      ) : viewer}

      <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-blue-100 bg-white/90 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsAutoScrolling((current) => !current)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-colors ${isAutoScrolling ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}
          >
            {isAutoScrolling ? <Pause size={18} /> : <Play size={18} />}
            {isAutoScrolling ? 'Durdur' : 'Kaydır'}
          </button>
          <button type="button" onClick={() => setTransposeStep((step) => step - 1)} className="rounded-2xl bg-gray-100 px-4 py-3 font-black text-gray-700" aria-label="Tonu düşür">-</button>
          <span className="min-w-12 rounded-2xl bg-white px-3 py-3 text-center text-sm font-black text-blue-600 shadow-sm">{transposeStep > 0 ? `+${transposeStep}` : transposeStep}</span>
          <button type="button" onClick={() => setTransposeStep((step) => step + 1)} className="rounded-2xl bg-gray-100 px-4 py-3 font-black text-gray-700" aria-label="Tonu yükselt">+</button>
          <button type="button" onClick={toggleFavorite} className={`rounded-2xl px-4 py-3 ${isFavorite ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'}`} aria-label="Favori durumunu değiştir">
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </>
  );
}
