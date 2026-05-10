import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Clock, Heart, Inbox, Loader2, Music, Search, Send, Sparkles, X } from 'lucide-react';
import { setPageSeo } from '../lib/seo';

const FAVORITES_KEY = 'akor:favorites';
const RECENT_KEY = 'akor:recentSongs';
const REQUESTS_KEY = 'akor:songRequests';
const QUICK_SEARCH_TERMS = ['Sezen Aksu', 'Kolay akor', 'Popüler', 'Akustik'];

const getStoredSongs = (key) => {
  const rawSongs = window.localStorage.getItem(key);
  if (!rawSongs) return [];

  try {
    const parsedSongs = JSON.parse(rawSongs);
    return Array.isArray(parsedSongs) ? parsedSongs : [];
  } catch {
    return [];
  }
};

const getSongArtist = (song) => song.artists?.name || song.artist || 'Bilinmeyen sanatçı';

const saveLocalRequest = (request) => {
  const previousRequests = getStoredSongs(REQUESTS_KEY);
  window.localStorage.setItem(REQUESTS_KEY, JSON.stringify([request, ...previousRequests].slice(0, 30)));
};

function SongCard({ song, index, colorSchemes, favoriteSongs, onToggleFavorite }) {
  const scheme = colorSchemes[index % colorSchemes.length];
  const isFavorite = favoriteSongs.some((favorite) => favorite.slug === song.slug);

  return (
    <div className="relative h-full">
      <Link
        to={`/song/${song.slug}`}
        className={`
          ${scheme.bg} ${scheme.border} ${scheme.hover}
          flex aspect-square flex-col items-center justify-center rounded-[2rem] border p-6 text-center
          transition-all duration-300 hover:-translate-y-2 hover:shadow-lg
        `}
      >
        <Music className={`${scheme.text} mb-3 opacity-30`} size={26} />
        <h3 className={`${scheme.text} mb-2 text-xl font-black leading-tight tracking-tight`}>
          {song.title}
        </h3>
        <p className={`${scheme.text} text-sm font-bold uppercase tracking-widest opacity-60`}>
          {getSongArtist(song)}
        </p>
      </Link>
      <button
        type="button"
        onClick={() => onToggleFavorite(song)}
        className={`absolute right-3 top-3 rounded-full p-2 shadow-sm transition-all ${isFavorite ? 'bg-rose-500 text-white' : 'bg-white/80 text-gray-400 hover:bg-white hover:text-rose-500'}`}
        aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      >
        <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}

function MiniSongList({ title, icon, items, emptyText }) {
  return (
    <section className="rounded-3xl border border-blue-100 bg-white/80 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-2xl bg-blue-50 p-2 text-blue-600">{icon}</div>
          <h2 className="text-lg font-black text-gray-900">{title}</h2>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">{items.length}</span>
      </div>
      {items.length > 0 ? (
        <div className="grid gap-2">
          {items.slice(0, 4).map((song) => (
            <Link key={song.slug} to={`/song/${song.slug}`} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 transition-colors hover:bg-blue-50">
              <div>
                <p className="font-bold text-gray-800">{song.title}</p>
                <p className="text-sm font-medium text-gray-400">{song.artist}</p>
              </div>
              <span className="text-sm font-black text-blue-500">Çal</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-gray-50 p-4 text-sm font-medium text-gray-400">{emptyText}</p>
      )}
    </section>
  );
}

function SongRequestForm({ initialQuery, onSubmitRequest }) {
  const [songTitle, setSongTitle] = useState(initialQuery);
  const [artistName, setArtistName] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!songTitle.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    const result = await onSubmitRequest({
      songTitle: songTitle.trim(),
      artistName: artistName.trim(),
      note: note.trim(),
    });

    setSubmitting(false);
    setFeedback(result);

    if (result.ok) {
      setSongTitle('');
      setArtistName('');
      setNote('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 rounded-[2rem] border border-blue-100 bg-blue-50/70 p-5 text-left">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm">
          <Inbox size={22} />
        </div>
        <div>
          <h4 className="text-lg font-black text-gray-900">Bulamadığın şarkıyı iste</h4>
          <p className="text-sm font-medium text-gray-500">İsteğini kaydedelim; yeni akor eklerken öncelik verelim.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-gray-600">
          Şarkı adı
          <input
            type="text"
            value={songTitle}
            onChange={(event) => setSongTitle(event.target.value)}
            placeholder="Örn. Gülpembe"
            className="rounded-2xl border border-white bg-white px-4 py-3 font-medium text-gray-800 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            required
          />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-600">
          Sanatçı
          <input
            type="text"
            value={artistName}
            onChange={(event) => setArtistName(event.target.value)}
            placeholder="Örn. Barış Manço"
            className="rounded-2xl border border-white bg-white px-4 py-3 font-medium text-gray-800 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </div>

      <label className="mt-3 grid gap-1 text-sm font-bold text-gray-600">
        Not / ton isteği
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Varsa ton, capo veya versiyon notunu yazabilirsin."
          className="min-h-24 rounded-2xl border border-white bg-white px-4 py-3 font-medium text-gray-800 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {feedback ? (
          <p className={`text-sm font-bold ${feedback.ok ? 'text-emerald-600' : 'text-amber-600'}`}>{feedback.message}</p>
        ) : <span />}
        <button
          type="submit"
          disabled={submitting || !songTitle.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          İstek gönder
        </button>
      </div>
    </form>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="aspect-square animate-pulse rounded-[2rem] border border-blue-50 bg-white/70 p-6">
          <div className="mx-auto mb-5 h-9 w-9 rounded-full bg-blue-100" />
          <div className="mx-auto mb-3 h-5 w-3/4 rounded-full bg-blue-100" />
          <div className="mx-auto h-4 w-1/2 rounded-full bg-blue-50" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [favoriteSongs, setFavoriteSongs] = useState(() => getStoredSongs(FAVORITES_KEY));
  const [recentSongs, setRecentSongs] = useState(() => getStoredSongs(RECENT_KEY));

  const colorSchemes = useMemo(() => [
    { bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-800', hover: 'hover:bg-teal-100' },
    { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-800', hover: 'hover:bg-rose-100' },
    { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-800', hover: 'hover:bg-amber-100' },
    { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-800', hover: 'hover:bg-indigo-100' },
    { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-800', hover: 'hover:bg-emerald-100' },
    { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-800', hover: 'hover:bg-sky-100' },
    { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-800', hover: 'hover:bg-violet-100' },
    { bg: 'bg-fuchsia-50', border: 'border-fuchsia-100', text: 'text-fuchsia-800', hover: 'hover:bg-fuchsia-100' },
  ], []);

  const trimmedSearch = searchTerm.trim();

  const refreshStoredSongs = () => {
    setFavoriteSongs(getStoredSongs(FAVORITES_KEY));
    setRecentSongs(getStoredSongs(RECENT_KEY));
  };

  const performSearch = async (term) => {
    const cleanTerm = term.trim();
    setLoading(true);
    setErrorMessage('');

    try {
      if (!cleanTerm) {
        const { data, error } = await supabase
          .from('songs')
          .select('*, artists(name)')
          .order('view_count', { ascending: false, nullsFirst: false })
          .limit(50);

        if (error) throw error;
        setSongs(data || []);
        return;
      }

      const [{ data: titleMatch, error: titleError }, { data: artistMatch, error: artistError }] = await Promise.all([
        supabase
          .from('songs')
          .select('*, artists(name)')
          .ilike('title', `%${cleanTerm}%`)
          .limit(50),
        supabase
          .from('songs')
          .select('*, artists!inner(name)')
          .ilike('artists.name', `%${cleanTerm}%`)
          .limit(50),
      ]);

      if (titleError || artistError) throw titleError || artistError;

      const mergedResults = [...(titleMatch || []), ...(artistMatch || [])];
      const uniqueSongs = Array.from(new Map(mergedResults.map((item) => [item.id, item])).values());

      setSongs(uniqueSongs);
    } catch (error) {
      console.error('Arama yapılamadı:', error.message);
      setErrorMessage('Şarkıları getirirken bir sorun oluştu. Birazdan tekrar dene.');
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageSeo({
      title: trimmedSearch ? `${trimmedSearch} akor arama sonuçları | AKOR` : 'AKOR | Türkçe şarkı akorları',
      description: trimmedSearch
        ? `${trimmedSearch} için şarkı ve sanatçı akorlarını ara; favorilerine ekle ve çalma modunda pratik yap.`
        : 'Türkçe şarkı akorlarını ara, favorilerine ekle, son baktıklarına dön ve çalma modunda pratik yap.',
      canonicalPath: '/',
    });
  }, [trimmedSearch]);

  useEffect(() => {
    const delay = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    const handleStorageChange = () => refreshStoredSongs();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      performSearch(searchTerm);
    }
  };

  const toggleFavorite = (song) => {
    const exists = favoriteSongs.some((favorite) => favorite.slug === song.slug);
    const payload = {
      slug: song.slug,
      title: song.title,
      artist: getSongArtist(song),
    };
    const nextFavorites = exists
      ? favoriteSongs.filter((favorite) => favorite.slug !== song.slug)
      : [payload, ...favoriteSongs].slice(0, 50);

    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites));
    setFavoriteSongs(nextFavorites);
  };

  const submitSongRequest = async ({ songTitle, artistName, note }) => {
    const requestPayload = {
      song_title: songTitle,
      artist_name: artistName || null,
      search_query: trimmedSearch || null,
      note: note || null,
    };
    const localPayload = { ...requestPayload, created_at: new Date().toISOString() };

    try {
      const { error } = await supabase.from('song_requests').insert(requestPayload);
      if (error) throw error;

      saveLocalRequest(localPayload);
      return { ok: true, message: 'İsteğini aldık, teşekkürler! Yeni akorlarda önceliklendireceğiz.' };
    } catch (error) {
      console.warn('Şarkı isteği Supabase’e yazılamadı, yerel olarak saklandı:', error.message);
      saveLocalRequest(localPayload);
      return { ok: true, message: 'İsteğini bu cihazda kaydettik. Veritabanı hazır olduğunda otomatik toplama açılabilir.' };
    }
  };

  return (
    <div>
      <div className="mt-8 mb-10 text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-600">
          <Sparkles size={16} /> Akorunu bul, tonu ayarla, çalmaya başla
        </div>
        <h1 className="mb-8 text-4xl font-black tracking-tight text-gray-900">Hangi şarkıyı çalmak istersin?</h1>
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={22} />
          <input
            type="text"
            placeholder="Şarkı veya sanatçı ara..."
            className="w-full rounded-2xl border border-gray-100 bg-white py-4 pr-14 pl-14 text-lg shadow-sm outline-none transition-all focus:border-blue-200 focus:ring-4 focus:ring-blue-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
              aria-label="Aramayı temizle"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {QUICK_SEARCH_TERMS.map((term) => (
            <button
              type="button"
              key={term}
              onClick={() => setSearchTerm(term)}
              className="rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-500 transition-colors hover:bg-blue-50"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {!trimmedSearch && (
        <div className="mb-10 grid gap-4 md:grid-cols-2">
          <MiniSongList
            title="Favorilerim"
            icon={<Heart size={20} />}
            items={favoriteSongs}
            emptyText="Beğendiğin şarkıları kalple işaretle, burada hızlıca bul."
          />
          <MiniSongList
            title="Son baktıklarım"
            icon={<Clock size={20} />}
            items={recentSongs}
            emptyText="Bir şarkı açtığında geçmişin burada listelenecek."
          />
        </div>
      )}

      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">{trimmedSearch ? 'Arama sonuçları' : 'Popüler akorlar'}</h2>
          <p className="text-sm font-medium text-gray-500">
            {loading ? 'Şarkılar aranıyor...' : `${songs.length} şarkı listeleniyor`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && trimmedSearch && (
            <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-blue-600 shadow-sm">
              {songs.length} sonuç
            </span>
          )}
          {loading && <Loader2 className="animate-spin text-blue-500" size={24} />}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-3xl border border-rose-100 bg-rose-50 p-5 text-center font-bold text-rose-600">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <LoadingGrid />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {songs.length > 0 ? (
            songs.map((song, index) => (
              <SongCard
                key={song.id || song.slug}
                song={song}
                index={index}
                colorSchemes={colorSchemes}
                favoriteSongs={favoriteSongs}
                onToggleFavorite={toggleFavorite}
              />
            ))
          ) : null}
        </div>
      )}

      {!loading && songs.length === 0 && !errorMessage && (
        <div className="rounded-[2rem] border border-dashed border-blue-200 bg-white p-10 text-center">
          <h3 className="mb-2 text-2xl font-black text-gray-800">Sonuç bulamadık.</h3>
          <p className="mx-auto mb-5 max-w-md text-gray-500">
            Şarkı adını kısaltmayı, sanatçı adıyla aramayı veya aşağıdaki hızlı aramalardan birini denemeyi deneyebilirsin.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_SEARCH_TERMS.map((term) => (
              <button
                type="button"
                key={term}
                onClick={() => setSearchTerm(term)}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
              >
                {term}
              </button>
            ))}
          </div>
          <SongRequestForm key={trimmedSearch || 'empty'} initialQuery={trimmedSearch} onSubmitRequest={submitSongRequest} />
        </div>
      )}
    </div>
  );
}
