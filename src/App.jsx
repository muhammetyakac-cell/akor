import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Home from './pages/Home';
import Artists from './pages/Artists';
import ArtistDetail from './pages/ArtistDetail';
import SongDetail from './pages/SongDetail';
import { BRAND_NAME } from './lib/seo';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#fff8d6_0,#fff8d6_18%,#f4e5c2_40%,#efd5a6_100%)] text-stone-900 font-sans selection:bg-amber-300/70">
        <nav className="sticky top-0 z-50 border-b-4 border-stone-900 bg-[#fdf0c5]/95 shadow-[0_6px_0_#1c1917] backdrop-blur">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-3 sm:px-4">
            <Link to="/" className="rounded-md border-2 border-transparent px-2 py-1 text-xl font-black tracking-tight transition-all hover:-rotate-1 hover:border-stone-900 hover:bg-amber-200 sm:text-2xl">
              {BRAND_NAME}
            </Link>
            <Link to="/artists" className="rounded-md border-2 border-stone-900 bg-lime-200 px-3 py-1 text-xs font-black tracking-[0.2em] text-stone-900 uppercase shadow-[3px_3px_0_#1c1917] transition-all hover:-translate-y-0.5 hover:bg-lime-300 sm:text-sm">
              Sanatçılar
            </Link>
          </div>
        </nav>

        <main className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8 md:py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/artist/:slug" element={<ArtistDetail />} />
            <Route path="/song/:slug" element={<SongDetail />} />
          </Routes>
        </main>
      </div>
      <Analytics />
    </Router>
  );
}

export default App;
