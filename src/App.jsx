import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react'; // <-- BURASI EKLENDİ
import Home from './pages/Home';
import Artists from './pages/Artists';
import ArtistDetail from './pages/ArtistDetail';
import SongDetail from './pages/SongDetail';
import { BRAND_NAME } from './lib/seo';

function App() {
  return (
    <Router>
      <div className="retro-shell min-h-screen text-gray-900 selection:bg-amber-300/60">
        <nav className="retro-nav sticky top-0 z-50">
          <div className="retro-nav-inner max-w-4xl mx-auto px-4 h-16 flex justify-between items-center">
            <Link to="/" className="text-2xl font-black tracking-tight transition-all retro-brand">
              {BRAND_NAME}
            </Link>
            <Link to="/artists" className="text-sm sm:text-base font-black tracking-[0.22em] text-amber-900 transition-all uppercase retro-link">
              Sanatçılar
            </Link>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/artist/:slug" element={<ArtistDetail />} />
            <Route path="/song/:slug" element={<SongDetail />} />
          </Routes>
        </main>
      </div>
      <Analytics /> {/* <-- BURASI EKLENDİ */}
    </Router>
  );
}

export default App;
