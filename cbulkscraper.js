import * as dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const createSlug = (t) => t.toLowerCase().replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c').replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// DEBUG: Sayfadaki linkləri analiz et (isteğe bağlı)
async function analyzePageLinks(page) {
  const analysis = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    let validSongs = 0;
    let skippedArtists = 0;
    let skippedOther = 0;

    anchors.forEach(a => {
      const iconDiv = a.querySelector('div.icon');
      
      if (!iconDiv) {
        skippedOther++;
        return;
      }
      
      if (iconDiv.classList.contains('color-a')) {
        validSongs++;
      } else if (iconDiv.classList.contains('color-s')) {
        skippedArtists++;
      } else {
        skippedOther++;
      }
    });

    return { validSongs, skippedArtists, skippedOther, total: anchors.length };
  });

  console.log(`📊 Link Analizi: ${analysis.validSongs} ✅ şarkı | ${analysis.skippedArtists} 👤 sanatçı | ${analysis.skippedOther} ⏭️ diğer (Toplam: ${analysis.total})`);
  return analysis;
}

// --- BURAYA İSTEDİĞİN KADAR LİNK EKLEYEBİLİRSİN ---
const TARGET_URLS = [
'https://akorlar.com/ara/ac',
'https://akorlar.com/ara/ad',
'https://akorlar.com/ara/ae',
'https://akorlar.com/ara/af',
'https://akorlar.com/ara/ag',
'https://akorlar.com/ara/ah',
'https://akorlar.com/ara/ai',
'https://akorlar.com/ara/ak',
'https://akorlar.com/ara/al',
'https://akorlar.com/ara/am',
'https://akorlar.com/ara/an',
'https://akorlar.com/ara/ap',
'https://akorlar.com/ara/ar',
'https://akorlar.com/ara/as',
'https://akorlar.com/ara/at',
'https://akorlar.com/ara/au',
'https://akorlar.com/ara/av',
'https://akorlar.com/ara/ay',
'https://akorlar.com/ara/az',
'https://akorlar.com/ara/ba',
'https://akorlar.com/ara/be',
'https://akorlar.com/ara/bi',
'https://akorlar.com/ara/bo',
'https://akorlar.com/ara/bu',
'https://akorlar.com/ara/ca',
'https://akorlar.com/ara/ce',
'https://akorlar.com/ara/ci',
'https://akorlar.com/ara/co',
'https://akorlar.com/ara/cu',
'https://akorlar.com/ara/da',
'https://akorlar.com/ara/de',
'https://akorlar.com/ara/di',
'https://akorlar.com/ara/do',
'https://akorlar.com/ara/du',
'https://akorlar.com/ara/fa',
'https://akorlar.com/ara/fe',
'https://akorlar.com/ara/fi',
'https://akorlar.com/ara/fo',
'https://akorlar.com/ara/fu',
'https://akorlar.com/ara/ga',
'https://akorlar.com/ara/ge',
'https://akorlar.com/ara/gi',
'https://akorlar.com/ara/go',
'https://akorlar.com/ara/gu',
'https://akorlar.com/ara/ha',
'https://akorlar.com/ara/he',
'https://akorlar.com/ara/hi',
'https://akorlar.com/ara/ho',
'https://akorlar.com/ara/hu',
'https://akorlar.com/ara/ka',
'https://akorlar.com/ara/ke',
'https://akorlar.com/ara/ki',
'https://akorlar.com/ara/ko',
'https://akorlar.com/ara/ku',
'https://akorlar.com/ara/la',
'https://akorlar.com/ara/le',
'https://akorlar.com/ara/li',
'https://akorlar.com/ara/lo',
'https://akorlar.com/ara/lu',
'https://akorlar.com/ara/ma',
'https://akorlar.com/ara/me',
'https://akorlar.com/ara/mi',
'https://akorlar.com/ara/mo',
'https://akorlar.com/ara/mu',
'https://akorlar.com/ara/na',
'https://akorlar.com/ara/ne',
'https://akorlar.com/ara/ni',
'https://akorlar.com/ara/no',
'https://akorlar.com/ara/nu',
'https://akorlar.com/ara/pa',
'https://akorlar.com/ara/pe',
'https://akorlar.com/ara/pi',
'https://akorlar.com/ara/po',
'https://akorlar.com/ara/pu',
'https://akorlar.com/ara/ra',
'https://akorlar.com/ara/re',
'https://akorlar.com/ara/ri',
'https://akorlar.com/ara/ro',
'https://akorlar.com/ara/ru',
'https://akorlar.com/ara/sa',
'https://akorlar.com/ara/se',
'https://akorlar.com/ara/si',
'https://akorlar.com/ara/so',
'https://akorlar.com/ara/su',
'https://akorlar.com/ara/ta',
'https://akorlar.com/ara/te',
'https://akorlar.com/ara/ti',
'https://akorlar.com/ara/to',
'https://akorlar.com/ara/tu',
'https://akorlar.com/ara/va',
'https://akorlar.com/ara/ve',
'https://akorlar.com/ara/vi',
'https://akorlar.com/ara/ya',
'https://akorlar.com/ara/ye',
'https://akorlar.com/ara/yi',
'https://akorlar.com/ara/yo',
'https://akorlar.com/ara/yu',
'https://akorlar.com/ara/za',
'https://akorlar.com/ara/ze',
];

async function startMultiTargetScraping(urls) {
  console.log(`\n🚀 TOPLU TARAMA BAŞLADI (${urls.length} hedef sayfa)`);
  
  // 1. ADIM: Mevcut şarkıları bir kez hafızaya al (sanatçı + slug kombinasyonu)
  const { data: existingSongs } = await supabase.from('songs').select('slug, artists(slug)');
  const existingCombos = new Set(
    existingSongs?.map(s => `${s.artists.slug}:${s.slug}`) || []
  );
  console.log(`💡 Veritabanında zaten ${existingCombos.size} şarkı var.`);

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Her bir hedef URL için döngü
  for (const targetUrl of urls) {
    console.log(`\n--- 📂 ŞU AN TARANIYOR: ${targetUrl} ---`);
    
    try {
      await page.goto(targetUrl, { waitUntil: 'networkidle2' });
      
      // Linkləri analiz et ve filtrele
      await analyzePageLinks(page);

      const songLinks = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        return anchors
          .filter(a => {
            // Şarkı linkini belirle: "color-a" class'ı olan icon div içeren link
            const iconDiv = a.querySelector('div.icon');
            
            if (!iconDiv) return false;
            if (!iconDiv.classList.contains('color-a')) return false;
            
            // akorlar.com domain'i kontrol et
            try {
              const url = new URL(a.href);
              if (!url.hostname.includes('akorlar.com')) return false;
            } catch {
              return false;
            }
            
            return true;
          })
          .map(a => a.href);
      });

      const uniqueLinks = [...new Set(songLinks)];
      console.log(`🔍 Bu sayfada ${uniqueLinks.length} potansiyel şarkı bulundu.`);

      for (let i = 0; i < uniqueLinks.length; i++) {
        const url = uniqueLinks[i];

        try {
          const result = await scrapeSingleSong(page, url, existingCombos);
          if (result) {
            console.log(`   [${i + 1}/${uniqueLinks.length}] ✅ EKLENDİ: ${result.artist} - ${result.title}`);
          } else {
            console.log(`   [${i + 1}/${uniqueLinks.length}] ⏩ ATLANDI (zaten var): ${url.split('/').pop()}`);
          }
          await delay(500); 
        } catch (err) {
          console.error(`   ❌ Hata (${url}):`, err.message);
        }
      }
    } catch (err) {
      console.error(`❌ Hedef sayfa açılamadı (${targetUrl}):`, err.message);
    }
  }

  await browser.close();
  console.log('\n✅ TÜM LİSTEYİ BİTİRDİM, REİS!');
}

async function scrapeSingleSong(page, url, existingCombos) {
  await page.goto(url, { waitUntil: 'networkidle2' });

  const result = await page.evaluate(() => {
    const h1 = document.querySelector('h1.page-title-h1');
    const artist = h1?.querySelector('a')?.innerText.trim();
    if(!h1 || !artist) return null;

    const title = h1.innerText.replace(artist, '').replace('-', '').replace(/Akor/gi, '').trim();
    const spanLines = Array.from(document.querySelectorAll('#key > span'));
    const chords = spanLines.map(span => span.textContent.replace(/\u00A0/g, ' ')).join('\n');

    return { artist, title, chords };
  });

  if (!result || !result.chords) return null;

  const aSlug = createSlug(result.artist);
  const sSlug = createSlug(result.title);
  
  // Sanatçı + şarkı kombinasyonunu kontrol et
  const comboKey = `${aSlug}:${sSlug}`;
  if (existingCombos.has(comboKey)) {
    return null; // Zaten var, atla
  }

  let { data: dbArtist } = await supabase.from('artists').select('*').eq('slug', aSlug).single();
  if (!dbArtist) { 
    const { data: nA } = await supabase.from('artists').insert([{ name: result.artist, slug: aSlug }]).select().single(); 
    dbArtist = nA; 
  }

  let { data: song } = await supabase.from('songs').select('*').eq('slug', sSlug).single();
  if (!song) { 
    const { data: nS } = await supabase.from('songs').insert([{ artist_id: dbArtist.id, title: result.title, slug: sSlug }]).select().single(); 
    song = nS; 
  }

  await supabase.from('chords').delete().eq('song_id', song.id);
  await supabase.from('chords').insert([{ song_id: song.id, content: result.chords }]);

  // Yeni eklenen şarkıyı sete ekle ki aynı run'da tekrar etmesin
  existingCombos.add(comboKey);

  return result;
}

// Diziyi göndererek işlemi başlat
startMultiTargetScraping(TARGET_URLS);