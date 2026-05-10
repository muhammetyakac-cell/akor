import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ChordViewer from '../components/ChordViewer';
import { ArrowLeft } from 'lucide-react';

export default function SongDetail() {
  const { slug } = useParams();
  const [songData, setSongData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongDetail();
  }, [slug]);

  const fetchSongDetail = async () => {
    try {
      const { data: song, error: songError } = await supabase
        .from('songs')
        .select('id, title, artists(name)')
        .eq('slug', slug)
        .single();

      if (songError) throw songError;

      const { data: chord, error: chordError } = await supabase
        .from('chords')
        .select('content')
        .eq('song_id', song.id)
        .single();

      if (chordError) throw chordError;

      setSongData({
        title: song.title,
        artist: song.artists.name,
        content: chord.content
      });
    } catch (error) {
      console.error('Şarkı detayı çekilemedi:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!songData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Şarkı Bulunamadı</h2>
        <Link to="/" className="text-blue-600 hover:underline">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium mb-2 transition-colors px-4 py-2 hover:bg-blue-50 rounded-lg -ml-4"
      >
        <ArrowLeft size={20} />
        Ana Sayfaya Dön
      </Link>
      
      <ChordViewer 
        title={songData.title}
        artist={songData.artist}
        rawContent={songData.content}
      />
    </div>
  );
}
