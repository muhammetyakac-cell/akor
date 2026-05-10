import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modern, saydam ve soft renk paleti (Tailwind 3+ / opacity desteğiyle)
  const colorSchemes = [
    { bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-800', hover: 'hover:bg-teal-100' },
    { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-800', hover: 'hover:bg-rose-100' },
    { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-800', hover: 'hover:bg-amber-100' },
    { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-800', hover: 'hover:bg-indigo-100' },
    { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-800', hover: 'hover:bg-emerald-100' },
    { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-800', hover: 'hover:bg-sky-100' },
    { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-800', hover: 'hover:bg-violet-100' },
    { bg: 'bg-fuchsia-50', border: 'border-fuchsia-100', text: 'text-fuchsia-800', hover: 'hover:bg-fuchsia-100' },
  ];

  useEffect(() => {
    async function fetchSongs() {
      const { data } = await supabase.from('songs').select('*, artists(name)');
      if (data) setSongs(data);
    }
    fetchSongs();
  }, []);

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.artists?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="text-center mb-16 mt-8">
        <h1 className="text-4xl font-black mb-8 tracking-tight text-gray-900">Hangi şarkıyı çalmak istersin?</h1>
        <div className="relative max-w-xl mx-auto">
          <input 
            type="text" 
            placeholder="Şarkı veya sanatçı ara..." 
            className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:border-gray-300 transition-all text-lg"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Modern Transparan Grid - 1 Satırda 4 Kutucuk */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {filteredSongs.map((song, index) => {
          const scheme = colorSchemes[index % colorSchemes.length];
          return (
            <Link 
              key={song.id} 
              to={`/song/${song.slug}`}
              className={`
                ${scheme.bg} ${scheme.border} ${scheme.hover}
                aspect-square p-6 border rounded-[2rem]
                flex flex-col justify-center items-center text-center 
                transition-all duration-300 transform hover:-translate-y-2
              `}
            >
              <h3 className={`${scheme.text} font-black text-xl leading-tight mb-2 tracking-tight`}>
                {song.title}
              </h3>
              <p className={`${scheme.text} opacity-60 text-sm font-bold uppercase tracking-widest`}>
                {song.artists?.name}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
