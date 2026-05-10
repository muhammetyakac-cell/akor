import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ChordViewer from '../components/ChordViewer';

export default function SongDetail() {
  const { slug } = useParams();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSong() {
      const { data, error } = await supabase
        .from('songs')
        .select('*, artists(name), chords(content)')
        .eq('slug', slug)
        .single();
      
      if (!error) setSong(data);
      setLoading(false);
    }
    fetchSong();
  }, [slug]);

  if (loading) return <div className="text-center py-20 text-gray-400 animate-pulse">Akorlar hazırlanıyor...</div>;
  if (!song) return <div className="text-center py-20">Şarkı bulunamadı.</div>;

  return (
    <ChordViewer 
      title={song.title} 
      artist={song.artists?.name} 
      rawContent={song.chords?.[0]?.content} 
    />
  );
}
