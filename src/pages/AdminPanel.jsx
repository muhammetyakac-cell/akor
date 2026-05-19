import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { BRAND_NAME, setPageSeo } from '../lib/seo';

const ADMIN_SESSION_KEY = 'akor:admin-auth';

const slugify = (value = '') => value
  .toLocaleLowerCase('tr-TR')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');

export default function AdminPanel() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthed, setIsAuthed] = useState(() => window.localStorage.getItem(ADMIN_SESSION_KEY) === '1');
  const [activeTab, setActiveTab] = useState('requests');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const [requests, setRequests] = useState([]);
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);

  const [newArtistName, setNewArtistName] = useState('');
  const [newSong, setNewSong] = useState({ title: '', artistId: '', content: '' });

  useEffect(() => {
    setPageSeo({ title: `Admin | ${BRAND_NAME}`, description: 'Akor yönetim paneli', canonicalPath: '/mami' });
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setNotice('');
    try {
      const [reqRes, artRes, songRes] = await Promise.all([
        supabase.from('song_requests').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('artists').select('*').order('name', { ascending: true }).limit(1000),
        supabase.from('songs').select('id,title,slug,artist_id,view_count,artists(name)').order('view_count', { ascending: false, nullsFirst: false }).limit(1000),
      ]);
      if (reqRes.error || artRes.error || songRes.error) throw reqRes.error || artRes.error || songRes.error;
      setRequests(reqRes.data || []);
      setArtists(artRes.data || []);
      setSongs(songRes.data || []);
    } catch (e) {
      setNotice(`Yükleme hatası: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAuthed) loadAll(); }, [isAuthed]);

  const login = (e) => {
    e.preventDefault();
    if (username === import.meta.env.VITE_ADMIN && password === import.meta.env.VITE_PASSWORD) {
      setIsAuthed(true);
      window.localStorage.setItem(ADMIN_SESSION_KEY, '1');
      setNotice('Giriş başarılı.');
    } else {
      setNotice('Hatalı giriş bilgileri.');
    }
  };

  const logout = () => {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthed(false);
  };

  const filteredSongs = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr-TR');
    if (!q) return songs;
    return songs.filter((s) => `${s.title} ${s.artists?.name || ''}`.toLocaleLowerCase('tr-TR').includes(q));
  }, [songs, search]);

  const filteredArtists = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr-TR');
    if (!q) return artists;
    return artists.filter((a) => a.name.toLocaleLowerCase('tr-TR').includes(q));
  }, [artists, search]);

  const deleteRequest = async (id) => {
    const { error } = await supabase.from('song_requests').delete().eq('id', id);
    if (!error) setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const addArtist = async (e) => {
    e.preventDefault();
    const name = newArtistName.trim();
    if (!name) return;
    const { error } = await supabase.from('artists').insert({ name, slug: slugify(name) });
    if (!error) {
      setNewArtistName('');
      loadAll();
    }
  };

  const updateArtist = async (artist) => {
    const { error } = await supabase.from('artists').update({ name: artist.name, slug: slugify(artist.name) }).eq('id', artist.id);
    if (!error) loadAll();
  };

  const deleteArtist = async (artistId) => {
    if (!window.confirm('Sanatçı silinsin mi?')) return;
    await supabase.from('artists').delete().eq('id', artistId);
    loadAll();
  };

  const addSong = async (e) => {
    e.preventDefault();
    if (!newSong.title.trim() || !newSong.artistId) return;
    const { data: inserted, error } = await supabase.from('songs').insert({ title: newSong.title.trim(), slug: slugify(newSong.title), artist_id: Number(newSong.artistId) }).select().single();
    if (!error && newSong.content.trim()) {
      await supabase.from('chords').insert({ song_id: inserted.id, content: newSong.content.trim() });
    }
    if (!error) {
      setNewSong({ title: '', artistId: '', content: '' });
      loadAll();
    }
  };

  const deleteSong = async (songId) => {
    if (!window.confirm('Şarkı silinsin mi?')) return;
    await supabase.from('chords').delete().eq('song_id', songId);
    await supabase.from('songs').delete().eq('id', songId);
    loadAll();
  };

  if (!isAuthed) {
    return <form onSubmit={login} className="mx-auto max-w-md space-y-3 rounded-2xl border bg-white p-6"><h1 className="text-2xl font-black">Mami Admin Giriş</h1><input className="w-full rounded border p-3" placeholder="Admin" value={username} onChange={(e)=>setUsername(e.target.value)} /><input className="w-full rounded border p-3" type="password" placeholder="Şifre" value={password} onChange={(e)=>setPassword(e.target.value)} /><button className="w-full rounded bg-black p-3 font-bold text-white" type="submit">Giriş Yap</button>{notice && <p className="text-sm text-rose-600">{notice}</p>}</form>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><h1 className="text-3xl font-black">Admin Panel</h1><div className="flex gap-2"><button onClick={loadAll} className="rounded border px-3 py-2">Yenile</button><button onClick={logout} className="rounded bg-rose-600 px-3 py-2 text-white">Çıkış</button><Link to="/" className="rounded border px-3 py-2">Site</Link></div></div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">{['requests','songs','artists','popular'].map((t)=><button key={t} onClick={()=>setActiveTab(t)} className={`rounded p-2 ${activeTab===t?'bg-black text-white':'bg-white border'}`}>{t}</button>)}</div>
      <input className="w-full rounded border bg-white p-3" placeholder="Şarkı/sanatçı ara..." value={search} onChange={(e)=>setSearch(e.target.value)} />
      {loading && <p>Yükleniyor...</p>}
      {notice && <p>{notice}</p>}

      {activeTab === 'requests' && <div className="space-y-2">{requests.map((r)=><div key={r.id} className="rounded border bg-white p-3"><div className="flex justify-between"><div><p className="font-bold">{r.song_title} - {r.artist_name || 'Belirtilmedi'}</p><p className="text-sm text-gray-500">{r.note || 'Not yok'}</p></div><button onClick={()=>deleteRequest(r.id)} className="rounded bg-rose-600 px-2 text-white">Sil</button></div></div>)}</div>}

      {activeTab === 'artists' && <div className="space-y-3"><form onSubmit={addArtist} className="flex gap-2"><input className="flex-1 rounded border bg-white p-2" value={newArtistName} onChange={(e)=>setNewArtistName(e.target.value)} placeholder="Yeni sanatçı" /><button className="rounded bg-emerald-600 px-3 text-white">Ekle</button></form>{filteredArtists.map((a)=><div key={a.id} className="flex items-center gap-2 rounded border bg-white p-2"><input className="flex-1 rounded border p-2" value={a.name} onChange={(e)=>setArtists((prev)=>prev.map((x)=>x.id===a.id?{...x,name:e.target.value}:x))} /><button onClick={()=>updateArtist(a)} className="rounded bg-blue-600 px-3 text-white">Kaydet</button><button onClick={()=>deleteArtist(a.id)} className="rounded bg-rose-600 px-3 text-white">Sil</button></div>)}</div>}

      {activeTab === 'songs' && <div className="space-y-3"><form onSubmit={addSong} className="grid gap-2 rounded border bg-white p-3"><input className="rounded border p-2" placeholder="Şarkı adı" value={newSong.title} onChange={(e)=>setNewSong((p)=>({...p,title:e.target.value}))} /><select className="rounded border p-2" value={newSong.artistId} onChange={(e)=>setNewSong((p)=>({...p,artistId:e.target.value}))}><option value="">Sanatçı seç</option>{artists.map((a)=><option key={a.id} value={a.id}>{a.name}</option>)}</select><textarea className="rounded border p-2" placeholder="Akor içeriği (opsiyonel)" value={newSong.content} onChange={(e)=>setNewSong((p)=>({...p,content:e.target.value}))} /><button className="rounded bg-emerald-600 p-2 text-white">Şarkı Ekle</button></form>{filteredSongs.map((s)=><div key={s.id} className="flex items-center justify-between rounded border bg-white p-3"><div><p className="font-bold">{s.title}</p><p className="text-sm text-gray-500">{s.artists?.name} • {s.slug} • #{s.id}</p></div><div className="flex gap-2"><a href={`/song/${s.slug}--${s.id}`} target="_blank" className="rounded border px-2 py-1">Aç</a><button onClick={()=>deleteSong(s.id)} className="rounded bg-rose-600 px-2 py-1 text-white">Sil</button></div></div>)}</div>}

      {activeTab === 'popular' && <div className="space-y-2">{songs.slice(0,100).map((s,idx)=><div key={s.id} className="rounded border bg-white p-3"><p className="font-bold">#{idx+1} {s.title}</p><p className="text-sm text-gray-500">{s.artists?.name} • {s.view_count || 0} görüntülenme</p></div>)}</div>}
    </div>
  );
}
