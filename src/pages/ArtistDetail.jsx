import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Music } from 'lucide-react';

export default function ArtistDetail() {
  const { slug } = useParams();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtistData() {
      // Önce sanatçıyı bul
      const { data: artData } = await supabase
        .from('artists')
        .select('*')
        .eq('slug', slug)
        .single();

      if (artData) {
        setArtist(artData);
        // Sonra o sanatçıya ait şarkıları çek
        const { data: sngData } = await supabase
          .from('songs')
          .select('*')
          .eq('artist_id', artData.id)
          .order('title', { ascending: true });
        
        setSongs(sngData || []);
      }
      setLoading(false);
    }
    fetchArtistData();
  }, [slug]);

  if (loading) return <div className="text-center py-20 text-gray-400 animate-pulse">Şarkılar listeleniyor...</div>;
  if (!artist) return <div className="text-center py-20">Sanatçı bulunamadı.</div>;

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 mb-2">{artist.name}</h1>
        <p className="text-lg text-gray-500">{songs.length} Şarkı Akoru</p>
      </div>

      <div className="grid gap-3">
        {songs.map(song => (
          <Link 
            key={song.id} 
            to={`/song/${song.slug}`}
            className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <Music size={20} />
              </div>
              <span className="text-lg font-bold text-gray-700 group-hover:text-blue-700">{song.title}</span>
            </div>
            <span className="text-sm font-medium text-gray-400 border border-gray-100 px-3 py-1 rounded-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
              Akora Git
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
