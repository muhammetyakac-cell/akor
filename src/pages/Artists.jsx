import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { RefreshCcw, Search, Users, X } from 'lucide-react';
import { BRAND_NAME, setPageSeo } from '../lib/seo';

const shuffleArtists = (artists) => [...artists].sort(() => Math.random() - 0.5);

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [visibleArtists, setVisibleArtists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageSeo({
      title: `Sanatçılar | ${BRAND_NAME}`,
      description: `${BRAND_NAME} kütüphanesindeki sanatçı akorlarını keşfet, rastgele önerilen müzisyenlere bak ve sanatçı adına göre arama yap.`,
      canonicalPath: '/artists',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${BRAND_NAME} Sanatçılar`,
        url: `${window.location.origin}/artists`,
      },
    });

    async function fetchArtists() {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('name', { ascending: true });

      if (!error) {
        setArtists(data || []);
        setVisibleArtists(shuffleArtists(data || []).slice(0, 50));
      }
      setLoading(false);
    }
    fetchArtists();
  }, []);

  const filteredArtists = useMemo(() => {
    const cleanTerm = searchTerm.trim().toLocaleLowerCase('tr-TR');
    if (!cleanTerm) return visibleArtists;

    return artists
      .filter((artist) => artist.name.toLocaleLowerCase('tr-TR').includes(cleanTerm))
      .slice(0, 80);
  }, [artists, searchTerm, visibleArtists]);

  const randomizeArtists = () => {
    setSearchTerm('');
    setVisibleArtists(shuffleArtists(artists).slice(0, 50));
  };

  if (loading) return <div className="text-center py-20 text-gray-400 animate-pulse">Sanatçılar yükleniyor...</div>;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-2xl text-white">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Sanatçılar</h1>
            <p className="text-gray-500">
              {searchTerm ? `${filteredArtists.length} sanatçı bulundu` : 'Her yenilemede rastgele 50 sanatçı'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={randomizeArtists}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-blue-600 shadow-sm transition-colors hover:bg-blue-50"
        >
          <RefreshCcw size={18} />
          Rastgele 50
        </button>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={22} />
        <input
          type="text"
          placeholder="Sanatçı ara..."
          className="w-full rounded-2xl border border-gray-100 bg-white py-4 pr-14 pl-14 text-lg shadow-sm outline-none transition-all focus:border-blue-200 focus:ring-4 focus:ring-blue-50"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
            aria-label="Sanatçı aramasını temizle"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {filteredArtists.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredArtists.map((artist) => (
            <Link
              key={artist.id}
              to={`/artist/${artist.slug}`}
              className="group p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                {artist.name[0].toUpperCase()}
              </div>
              <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{artist.name}</h3>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-blue-200 bg-white p-10 text-center">
          <h2 className="mb-2 text-2xl font-black text-gray-800">Sanatçı bulunamadı.</h2>
          <p className="text-gray-500">Arama metnini kısaltmayı veya rastgele listeye dönmeyi deneyebilirsin.</p>
        </div>
      )}
    </div>
  );
}
