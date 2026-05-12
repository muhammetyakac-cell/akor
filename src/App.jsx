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
      {/* Hafif mavimsi, göz yormayan ana arka plan */}
      <div className="min-h-screen bg-[#f5f9ff] text-gray-900 font-sans selection:bg-blue-200/50">
        
        {/* Navbar: Buzlu cam efektiyle arka plana uyum sağlar */}
        <nav className="bg-white/70 backdrop-blur-xl border-b border-blue-100/50 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 h-16 flex justify-between items-center">
            <Link to="/" className="text-2xl font-black tracking-tighter hover:text-blue-600 transition-all">
              {BRAND_NAME}
            </Link>
            <Link to="/artists" className="text-[20px] font-black tracking-[0.3em] text-blue-400/80 hover:text-blue-600 transition-all uppercase">
              Sanatçılar
            </Link>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 py-10">
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
