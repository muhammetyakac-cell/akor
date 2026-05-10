import * as dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const createSlug = (t) => {
  if (!t) return "";
  return t.toString().toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/\s+/g,'-')
    .replace(/[^a-z0-9-]/g,'')
    .replace(/-+/g, '-');
};

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function analyzePageLinks(page) {
  const analysis = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    let validSongs = 0;
    anchors.forEach(a => {
      const iconDiv = a.querySelector('div.icon');
      if (iconDiv && iconDiv.classList.contains('color-a')) validSongs++;
    });
    return { validSongs, total: anchors.length };
  });
  console.log(`📊 Ana Sekme Analizi: ${analysis.validSongs} geçerli şarkı linki havuza alınıyor...`);
  return analysis;
}

const TARGET_URLS = [
'https://akorlar.com/aynur-dogan',
'https://akorlar.com/agire-jiyan',
'https://akorlar.com/ciwan-haco',
'https://akorlar.com/sivan-perwer',
'https://akorlar.com/dr-fuchs',
'https://akorlar.com/sirhot',
'https://akorlar.com/erci-e',
'https://akorlar.com/ayben',
'https://akorlar.com/kolera',
'https://akorlar.com/mode-xl',
'https://akorlar.com/karacali',
'https://akorlar.com/saian',
'https://akorlar.com/kayra',
'https://akorlar.com/saniser',
'https://akorlar.com/sokrat-st',
'https://akorlar.com/ados',
'https://akorlar.com/kamufle',
'https://akorlar.com/server-uraz',
'https://akorlar.com/pit10',
'https://akorlar.com/beta',
'https://akorlar.com/da-poet',
'https://akorlar.com/hayki',
'https://akorlar.com/patron',
'https://akorlar.com/eypio',
'https://akorlar.com/burak-king',
'https://akorlar.com/tankurt-manas',
'https://akorlar.com/grogi',
'https://akorlar.com/sefo',
'https://akorlar.com/batuflex',
'https://akorlar.com/emel-sayin',
'https://akorlar.com/muazzez-abaci',
'https://akorlar.com/muazzez-ersoy',
'https://akorlar.com/adnan-senses',
'https://akorlar.com/ahmet-ozhan',
'https://akorlar.com/coskun-sabah',
'https://akorlar.com/samime-sanay',
'https://akorlar.com/behiye-aksoy',
'https://akorlar.com/zekai-tunca',
'https://akorlar.com/alaeddin-yavasca',
'https://akorlar.com/avni-anil',
'https://akorlar.com/erol-sayan',
'https://akorlar.com/sadettin-kaynak',
'https://akorlar.com/munir-nurettin-selcuk',
'https://akorlar.com/kibariye',
'https://akorlar.com/gullu',
'https://akorlar.com/tudanya',
'https://akorlar.com/bergen',
'https://akorlar.com/kamuran-akkor',
'https://akorlar.com/handan-kara',
'https://akorlar.com/esengul',
'https://akorlar.com/vahdet-vural',
'https://akorlar.com/bayram-senpinar',
'https://akorlar.com/kucuk-emrah',
'https://akorlar.com/ceylan',
'https://akorlar.com/ferdi-ozbege',
'https://akorlar.com/melis-fis',
'https://akorlar.com/alizade',
'https://akorlar.com/bege',
'https://akorlar.com/lil-zey',
'https://akorlar.com/ben-fero',
'https://akorlar.com/killa-hakan',
'https://akorlar.com/massaka',
'https://akorlar.com/tugba-yurt',
'https://akorlar.com/ayse-hatun-onal',
'https://akorlar.com/petek-dincoz',
'https://akorlar.com/lerzan-mutlu',
'https://akorlar.com/nihat-dogan',
'https://akorlar.com/bayhan',
'https://akorlar.com/baris-akarsu',
'https://akorlar.com/ozgur-cevik',
'https://akorlar.com/zeynep-dizdar',
'https://akorlar.com/meyra',
'https://akorlar.com/niran-unsal',
'https://akorlar.com/pamela',
'https://akorlar.com/asli-gungor',
'https://akorlar.com/ferhat-tunc',
'https://akorlar.com/suavi',
'https://akorlar.com/onur-akin',
'https://akorlar.com/nurettin-rencber',
'https://akorlar.com/ahmet-aslan',
'https://akorlar.com/mehmet-atalay',
'https://akorlar.com/erol-evgin',
'https://akorlar.com/altan-cetin',
'https://akorlar.com/ozan-dogulu',
'https://akorlar.com/kofn',
'https://akorlar.com/aynil',
'https://akorlar.com/serkan-kaya',
'https://akorlar.com/elvan-gunaydin',
'https://akorlar.com/fatih-urek',
'https://akorlar.com/kusum-aydin',
'https://akorlar.com/fedon',
'https://akorlar.com/yasar-ipek',
'https://akorlar.com/izzet-yildizhan',
'https://akorlar.com/metin-senturk',
'https://akorlar.com/mustafa-topaloglu',
'https://akorlar.com/mahmut-tuncer',
'https://akorlar.com/ankarali-namik',
'https://akorlar.com/ankarali-turgut',
'https://akorlar.com/oguz-yilmaz',
'https://akorlar.com/hakki-bulut',
'https://akorlar.com/nejat-alp',
'https://akorlar.com/hayko',
'https://akorlar.com/taner',
'https://akorlar.com/atilla-kaya',
'https://akorlar.com/umut-akyurek',
'https://akorlar.com/safiye-soyman',
'https://akorlar.com/faik-ozturk',
'https://akorlar.com/bulent-serttas',
'https://akorlar.com/burak-yeter',
'https://akorlar.com/mahmut-orhan',
'https://akorlar.com/deeperise',
'https://akorlar.com/can-turan',
'https://akorlar.com/melihat-gulses',
'https://akorlar.com/cigdem-gurdal',
'https://akorlar.com/ayse-tas',
'https://akorlar.com/nesrin-sipahi',
'https://akorlar.com/gonul-yazar',
'https://akorlar.com/secil-heper',
'https://akorlar.com/incesaz',
'https://akorlar.com/yansimalar',
'https://akorlar.com/kumdan-kaleler',
'https://akorlar.com/senforock',
'https://akorlar.com/siluethler',
'https://akorlar.com/haramiler',
'https://akorlar.com/apaslar',
'https://akorlar.com/kaygisizlar',
'https://akorlar.com/ersen-ve-dadaslar',
'https://akorlar.com/seyyal-taner',
'https://akorlar.com/neco',
'https://akorlar.com/mazhar-ve-fuat',
'https://akorlar.com/kurtalan-ekspress',
'https://akorlar.com/grup-karma',
'https://akorlar.com/grup-merdiven',
'https://akorlar.com/grup-vitamin',
'https://akorlar.com/feyyaz-kurus',
'https://akorlar.com/metin-ozulku',
'https://akorlar.com/eda-ozulku',
'https://akorlar.com/erhan-guleryuz',
'https://akorlar.com/serdar-ortac-2',
'https://akorlar.com/ozgun',
'https://akorlar.com/seray-sever',
'https://akorlar.com/melis-aydin', 'https://akorlar.com/ara/ze'
];

// EŞZAMANLI SEKME SAYISI
const CONCURRENCY = 7;

async function startMultiTargetScraping(urls) {
  console.log(`\n🚀 MULTI-TAB TARAMA BAŞLADI (${CONCURRENCY} Sekme, ${urls.length} hedef sayfa)`);
  
  // Hafızayı al (Kapasite 15.000)
  const { data: existingSongs } = await supabase.from('songs').select('slug, artists(slug), chords(id)').range(0, 15000);
  const existingCombos = new Set(
    existingSongs?.filter(s => s.chords && s.chords.length > 0).map(s => `${s.artists?.slug}:${s.slug}`) || []
  );
  console.log(`💡 Hafızada ${existingCombos.size} TAM KAYITLI şarkı var.\n`);

  const browser = await puppeteer.launch({ headless: "new" });
  
  // Linkleri toplayacak olan Ana Sekme
  const mainPage = await browser.newPage();
  await mainPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  // Şarkıları çekecek İşçi Sekmeler
  const workerPages = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    const p = await browser.newPage();
    await p.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    workerPages.push(p);
  }

  for (const targetUrl of urls) {
    console.log(`\n--- 📂 DİZİN: ${targetUrl} ---`);
    try {
      await mainPage.goto(targetUrl, { waitUntil: 'networkidle2' });
      await analyzePageLinks(mainPage);

      const songLinks = await mainPage.evaluate(() => {
        return Array.from(document.querySelectorAll('a'))
          .filter(a => {
            const iconDiv = a.querySelector('div.icon');
            return iconDiv && iconDiv.classList.contains('color-a') && a.href.includes('akorlar.com/');
          })
          .map(a => a.href);
      });

      const uniqueLinks = [...new Set(songLinks)];
      let linkIndex = 0;

      // WORKER (İŞÇİ) FONKSİYONU
      async function worker(workerId) {
        while (linkIndex < uniqueLinks.length) {
          const currentIndex = linkIndex++; // Havuzdan sıradaki linki al
          const url = uniqueLinks[currentIndex];
          
          try {
            const result = await scrapeSingleSong(workerPages[workerId], url, existingCombos);
            const prefix = `   [Sekme ${workerId + 1}] [${currentIndex + 1}/${uniqueLinks.length}]`;
            
            if (result === "UPDATED") {
              console.log(`${prefix} 🔄 AKOR GÜNCELLENDİ: ${url.split('/').pop()}`);
            } else if (result) {
              console.log(`${prefix} ✅ YENİ: ${result.artist} - ${result.title}`);
            } else {
              console.log(`${prefix} ⏩ ATLANDI: Tam Kayıtlı.`);
            }
            await delay(300); // Tarayıcıyı ve sunucuyu çok boğmamak için ufak bekleme
          } catch (err) {
            console.error(`   [Sekme ${workerId + 1}] ❌ Hata (${url}):`, err.message);
          }
        }
      }

      // Tüm işçi sekmeleri aynı anda serbest bırak
      const workers = workerPages.map((_, id) => worker(id));
      await Promise.all(workers); // Havuzdaki tüm linkler bitene kadar bekle

    } catch (err) {
      console.error(`❌ Dizin sayfası açılamadı:`, err.message);
    }
  }

  await browser.close();
  console.log('\n✅ TÜM İŞLEMLER IŞIK HIZINDA TAMAMLANDI.');
}

async function scrapeSingleSong(page, url, existingCombos) {
  await page.goto(url, { waitUntil: 'networkidle2' });
  const res = await page.evaluate(() => {
    const h1 = document.querySelector('h1.page-title-h1');
    const artist = h1?.querySelector('a')?.innerText.trim();
    if(!h1 || !artist) return null;
    const title = h1.innerText.replace(artist, '').replace('-', '').replace(/Akor/gi, '').trim();
    const chords = Array.from(document.querySelectorAll('#key > span')).map(s => s.textContent.replace(/\u00A0/g, ' ')).join('\n');
    return { artist, title, chords };
  });

  if (!res || !res.chords || res.chords.trim() === "") {
    return null;
  }

  const aSlug = createSlug(res.artist);
  const rawSongSlug = createSlug(res.title);
  
  const sSlug = `${aSlug}-${rawSongSlug}`;
  const comboKey = `${aSlug}:${sSlug}`;

  if (existingCombos.has(comboKey)) return null;

  // 1. SANATÇI (Multi-tab çarpışma korumalı)
  let { data: dbArt } = await supabase.from('artists').select('id').eq('slug', aSlug).maybeSingle();
  if (!dbArt) { 
    const { data, error } = await supabase.from('artists').insert([{ name: res.artist, slug: aSlug }]).select().maybeSingle();
    if (error) { 
      if (error.code === '23505') { // Başka bir sekme o saniye bu sanatçıyı eklemişse mevcut olanı çek
          const { data: retry } = await supabase.from('artists').select('id').eq('slug', aSlug).single();
          dbArt = retry;
      } else {
          console.error("   ❌ Artist ekleme hatası:", error.message); return null; 
      }
    } else {
      dbArt = data;
    }
  }

  if (!dbArt) return null;

  // 2. ŞARKI (Multi-tab çarpışma korumalı)
  let { data: song } = await supabase.from('songs').select('id').eq('slug', sSlug).maybeSingle();
  if (!song) {
    const { data, error } = await supabase.from('songs').insert([{ artist_id: dbArt.id, title: res.title, slug: sSlug }]).select().maybeSingle();
    if (error) { 
        if (error.code === '23505') { // Başka sekme eklemişse
            const { data: retry } = await supabase.from('songs').select('id').eq('slug', sSlug).single();
            song = retry;
        } else {
            console.error("   ❌ Şarkı ekleme hatası:", error.message); return null; 
        }
    } else {
        song = data;
    }
  }

  if (!song) return null;

  // 3. AKOR KAYDI (Senin Hatasız Yöntemin)
  await supabase.from('chords').delete().eq('song_id', song.id);
  const { error: chordErr } = await supabase.from('chords').insert([{ song_id: song.id, content: res.chords }]);
  
  if (chordErr) {
    console.error("   ❌ AKOR KAYDEDİLEMEDİ:", chordErr.message);
    return null;
  }

  existingCombos.add(comboKey);
  return res;
}

startMultiTargetScraping(TARGET_URLS);