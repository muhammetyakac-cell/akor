import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ChordViewer from '../components/ChordViewer';
import { ArrowLeft } from 'lucide-react';

const RECENT_KEY = 'akor:recentSongs';

const getRecentSongs = () => {
  const rawRecentSongs = window.localStorage.getItem(RECENT_KEY);
  if (!rawRecentSongs) return [];

  try {
    const parsedRecentSongs = JSON.parse(rawRecentSongs);
    return Array.isArray(parsedRecentSongs) ? parsedRecentSongs : [];
  } catch {
    return [];
  }
};

export default function SongDetail() {
  const { slug } = useParams();
  const [songData, setSongData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchSongDetail() {
      setLoading(true);

      try {
        const { data: song, error: songError } = await supabase
          .from('songs')
          .select('id, title, slug, artists(name)')
          .eq('slug', slug)
          .single();

        if (songError) throw songError;

        const { data: chord, error: chordError } = await supabase
          .from('chords')
          .select('content')
          .eq('song_id', song.id)
          .single();

        if (chordError) throw chordError;

        const nextSongData = {
          title: song.title,
          artist: song.artists.name,
          content: chord.content,
          slug: song.slug
        };

        if (isMounted) {
          setSongData(nextSongData);
        }

        const recentPayload = { slug: song.slug, title: song.title, artist: song.artists.name };
        const nextRecentSongs = [
          recentPayload,
          ...getRecentSongs().filter((recentSong) => recentSong.slug !== song.slug)
        ].slice(0, 8);
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(nextRecentSongs));

        // İZLENME SAYISINI ARTIR
        await supabase.rpc('increment_view_count', { song_id: song.id });

      } catch (error) {
        console.error('Şarkı detayı çekilemedi:', error.message);
        if (isMounted) {
          setSongData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSongDetail();

    return () => {
      isMounted = false;
    };
  }, [slug]);

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
        key={songData.slug}
        title={songData.title}
        artist={songData.artist}
        rawContent={songData.content}
        songSlug={songData.slug}
      />
    </div>
  );
}
