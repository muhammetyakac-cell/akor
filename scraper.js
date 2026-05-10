import * as dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const createSlug = (t) => t.toLowerCase().replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c').replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');

async function scrapeData(url) {
  console.log(`\n🚀 Ultimate Veri Avcısı Başlatıldı: ${url}`);
  
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });

    const result = await page.evaluate(() => {
      // 1. JSON-LD kontrolü (Mükemmel veri kaynağı)
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      for (const script of scripts) {
        try {
          const json = JSON.parse(script.textContent);
          const data = Array.isArray(json) ? json.find(i => i["@type"] === "MusicComposition") : (json["@type"] === "MusicComposition" ? json : null);
          
          if (data && data.lyrics && data.lyrics.text) {
            // \u00A0 kodu &nbsp; (özel boşluk) demektir. Onu normal boşluğa çeviriyoruz.
            const chordsRaw = data.lyrics.text.replace(/\u00A0/g, ' ');
            return {
              artist: data.composer?.name || data.composer[0]?.name || "Bilinmeyen Sanatçı",
              title: data.name,
              chords: chordsRaw,
              method: 'JSON-LD'
            };
          }
        } catch (e) {}
      }

      // 2. DOM-Hybrid kontrolü (Senin attığın span karmaşasından veri kurtarma)
      const h1 = document.querySelector('h1.page-title-h1');
      const artist = h1?.querySelector('a')?.innerText.trim() || "Bilinmeyen Sanatçı";
      const title = h1?.innerText.replace(artist, '').replace('-', '').replace(/Akor/gi, '').trim();

      // Sitedeki her bir span satırını tek tek işleyip aradaki özel boşlukları temizliyoruz
      const spanLines = Array.from(document.querySelectorAll('#key > span'));
      const chordsDOM = spanLines.map(span => {
        // \u00A0 kodu &nbsp; (özel boşluk) demektir. Onu normal boşluğa çeviriyoruz.
        return span.textContent.replace(/\u00A0/g, ' ');
      }).join('\n');

      if (chordsDOM.trim().length > 50) {
        return { artist, title, chords: chordsDOM, method: 'DOM-HYBRID' };
      }

      return null;
    });

    await browser.close();

    if (!result || !result.chords) {
      console.log("❌ İçerik bulunamadı.");
      return;
    }

    console.log(`📡 Veri çekme yöntemi: ${result.method}`);

    // Supabase Kayıt
    const aSlug = createSlug(result.artist);
    let { data: art } = await supabase.from('artists').select('*').eq('slug', aSlug).single();
    if (!art) { const { data: nA } = await supabase.from('artists').insert([{ name: result.artist, slug: aSlug }]).select().single(); art = nA; }
    
    const sSlug = createSlug(result.title);
    let { data: sng } = await supabase.from('songs').select('*').eq('slug', sSlug).single();
    if (!sng) { const { data: nS } = await supabase.from('songs').insert([{ artist_id: art.id, title: result.title, slug: sSlug }]).select().single(); sng = nS; }

    await supabase.from('chords').delete().eq('song_id', sng.id);
    await supabase.from('chords').insert([{ song_id: sng.id, content: result.chords }]);

    console.log(`✅ BAŞARILI: ${result.artist} - ${result.title} kaydedildi.`);
  } catch (err) {
    console.error('❌ Hata:', err.message);
    if (browser) await browser.close();
  }
}

// Test için link
scrapeData('https://akorlar.com/baris-manco-daglar-daglar');
