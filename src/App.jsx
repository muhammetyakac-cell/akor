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
      <div className="retro-shell min-h-screen text-[#2f2138] selection:bg-[#ffe26a]/70 selection:text-[#2f2138]">
        <div className="retro-noise" aria-hidden="true" />

        <nav className="retro-nav sticky top-0 z-50 border-b-4 border-[#3b2432]">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-3 sm:px-4">
            <Link
              to="/"
              className="retro-chip text-base font-black uppercase tracking-[0.2em] sm:text-lg"
            >
              {BRAND_NAME}
            </Link>
            <div className="hidden items-center gap-2 md:flex">
              <span className="retro-dot" />
              <span className="retro-dot" />
              <span className="retro-dot" />
            </div>
            <Link
              to="/artists"
              className="retro-btn px-3 py-2 text-xs font-black uppercase tracking-[0.18em] sm:text-sm"
            >
              Sanatçılar
            </Link>
          </div>
        </nav>

        <main className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-4 sm:py-8 md:py-10">
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
