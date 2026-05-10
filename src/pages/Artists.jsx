import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { setPageSeo } from '../lib/seo';

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageSeo({
      title: 'Sanatçılar | AKOR',
      description: 'AKOR kütüphanesindeki sanatçıları keşfet ve sevdiğin müzisyenlerin şarkı akorlarına hızlıca ulaş.',
      canonicalPath: '/artists',
    });

    async function fetchArtists() {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('name', { ascending: true });
      
      if (!error) setArtists(data);
      setLoading(false);
    }
    fetchArtists();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400 animate-pulse">Sanatçılar yükleniyor...</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-600 rounded-2xl text-white">
          <Users size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Sanatçılar</h1>
          <p className="text-gray-500">Kütüphanemizdeki tüm müzisyenler</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {artists.map(artist => (
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
    </div>
  );
}
