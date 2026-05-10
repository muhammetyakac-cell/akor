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
  console.log(`📊 Sayfa Analizi: ${analysis.validSongs} geçerli şarkı linki bulundu.`);
  return analysis;
}

const TARGET_URLS = [
  'https://akorlar.com/sezen-aksu',
'https://akorlar.com/muslum-gurses',
'https://akorlar.com/ahmet-kaya',
'https://akorlar.com/tarkan',
'https://akorlar.com/teoman',
'https://akorlar.com/duman',
'https://akorlar.com/mubiz',
'https://akorlar.com/mabel-matiz',
'https://akorlar.com/melike-sahin',
'https://akorlar.com/sagopa-kajmer',
'https://akorlar.com/ceza',
'https://akorlar.com/baris-manco',
'https://akorlar.com/cem-karaca',
'https://akorlar.com/erkin-koray',
'https://akorlar.com/manga',
'https://akorlar.com/mor-ve-otesi',
'https://akorlar.com/adamlar',
'https://akorlar.com/yuzyuzeyken-konusuruz',
'https://akorlar.com/dolu-kadehi-ters-tut',
'https://akorlar.com/pinhani',
'https://akorlar.com/dedubluman',
'https://akorlar.com/madrigal',
'https://akorlar.com/semicenk',
'https://akorlar.com/emir-can-igrek',
'https://akorlar.com/mert-demir',
'https://akorlar.com/ezhel',
'https://akorlar.com/uzi',
'https://akorlar.com/motive',
'https://akorlar.com/blok3',
'https://akorlar.com/lvbel-c5',
'https://akorlar.com/gunes',
'https://akorlar.com/sertab-erener',
'https://akorlar.com/sebnem-ferah',
'https://akorlar.com/haluk-levent',
'https://akorlar.com/athena',
'https://akorlar.com/gripin',
'https://akorlar.com/model',
'https://akorlar.com/seksendort',
'https://akorlar.com/zakkum',
'https://akorlar.com/kolpa',
'https://akorlar.com/kurban',
'https://akorlar.com/redd',
'https://akorlar.com/gece-yolculari',
'https://akorlar.com/yuksek-sadakat',
'https://akorlar.com/pera',
'https://akorlar.com/badem',
'https://akorlar.com/can-gox',
'https://akorlar.com/hayko-cepkin',
'https://akorlar.com/pentagram',
'https://akorlar.com/ogün-sanlisoy',
'https://akorlar.com/emre-aydin',
'https://akorlar.com/ferman-akgul',
'https://akorlar.com/fatma-turgut',
'https://akorlar.com/kaan-bosnak',
'https://akorlar.com/canozan',
'https://akorlar.com/deniz-tekin',
'https://akorlar.com/kalben',
'https://akorlar.com/nilipek',
'https://akorlar.com/can-kazaz',
'https://akorlar.com/evdeki-saat',
'https://akorlar.com/perdenin-ardindakiler',
'https://akorlar.com/ikilem',
'https://akorlar.com/mavi-gri',
'https://akorlar.com/yasli-amca',
'https://akorlar.com/son-feci-bisiklet',
'https://akorlar.com/buyuk-ev-ablukada',
'https://akorlar.com/palmiyeler',
'https://akorlar.com/soft-analog',
'https://akorlar.com/gokhan-turkmen',
'https://akorlar.com/irem-derici',
'https://akorlar.com/simge',
'https://akorlar.com/edis',
'https://akorlar.com/zeynep-bastik',
'https://akorlar.com/hande-yener',
'https://akorlar.com/gulsen',
'https://akorlar.com/hadise',
'https://akorlar.com/murat-boz',
'https://akorlar.com/murat-dalkilic',
'https://akorlar.com/kenan-dogulu',
'https://akorlar.com/serdar-ortac',
'https://akorlar.com/yildiz-tilbe',
'https://akorlar.com/ebru-gundes',
'https://akorlar.com/sibel-can',
'https://akorlar.com/ibrahim-tatlises',
'https://akorlar.com/orhan-gencebay',
'https://akorlar.com/ferdi-tayfur',
'https://akorlar.com/cengiz-kurtoglu',
'https://akorlar.com/arif-susam',
'https://akorlar.com/umit-besen',
'https://akorlar.com/hakan-altun',
'https://akorlar.com/selami-sahin',
'https://akorlar.com/bulent-ersoy',
'https://akorlar.com/zeki-muren',
'https://akorlar.com/muzeyyen-senar',
'https://akorlar.com/ajda-pekkan',
'https://akorlar.com/nukhet-duru',
'https://akorlar.com/ayten-alpman',
'https://akorlar.com/nilufer',
'https://akorlar.com/kayahan',
'https://akorlar.com/ilhan-irem',
'https://akorlar.com/levent-yuksel',
'https://akorlar.com/askin-nur-yengi',
'https://akorlar.com/yasar',
'https://akorlar.com/ferhat-gocer',
'https://akorlar.com/funda-arar',
'https://akorlar.com/sila',
'https://akorlar.com/can-bonomo',
'https://akorlar.com/mustafa-ceceli',
'https://akorlar.com/ilyas-yalcintas',
'https://akorlar.com/buray',
'https://akorlar.com/oguzhan-koc',
'https://akorlar.com/mfo',
'https://akorlar.com/yeni-turku',
'https://akorlar.com/ezginin-gunlugu',
'https://akorlar.com/kardes-turkuler',
'https://akorlar.com/mogollar',
'https://akorlar.com/bulutsuzluk-ozlemi',
'https://akorlar.com/ayna',
'https://akorlar.com/kargo',
'https://akorlar.com/vega',
'https://akorlar.com/replikas',
'https://akorlar.com/kurban',
'https://akorlar.com/cilekes',
'https://akorlar.com/lin-pesto',
'https://akorlar.com/jakuzi',
'https://akorlar.com/she-past-away',
'https://akorlar.com/umut-kaya',
'https://akorlar.com/anıl-piyanci',
'https://akorlar.com/khontkar',
'https://akorlar.com/sebinsah',
'https://akorlar.com/contra',
'https://akorlar.com/stabil',
'https://akorlar.com/hidra',
'https://akorlar.com/allame',
'https://akorlar.com/sansar-salvo',
'https://akorlar.com/joker',
'https://akorlar.com/no1',
'https://akorlar.com/canbay-wolker',
'https://akorlar.com/velet',
'https://akorlar.com/gazapizm',
'https://akorlar.com/heijan',
'https://akorlar.com/muti',
'https://akorlar.com/cakal',
'https://akorlar.com/reckol',
'https://akorlar.com/azer-bulbul',
'https://akorlar.com/neset-ertas',
'https://akorlar.com/asik-veysel',
'https://akorlar.com/mahzuni-serif',
'https://akorlar.com/selda-bagcan',
'https://akorlar.com/edip-akbayram',
'https://akorlar.com/volkan-konak',
'https://akorlar.com/erkan-ogur',
'https://akorlar.com/bulent-ortacgil',
'https://akorlar.com/fikret-kizilok',
'https://akorlar.com/leman-sam',
'https://akorlar.com/zuhal-olcay',
'https://akorlar.com/birsen-tezer',
'https://akorlar.com/jehan-barbur',
'https://akorlar.com/ceylan-ertem',
'https://akorlar.com/karsu',
'https://akorlar.com/gaye-su-akyol',
'https://akorlar.com/nilipek',
'https://akorlar.com/gulden-karabocek',
'https://akorlar.com/belkis-akkale',
'https://akorlar.com/izzet-altinmese',
'https://akorlar.com/mahsun-kirmizigul',
'https://akorlar.com/ozcan-deniz',
'https://akorlar.com/alisan',
'https://akorlar.com/ismail-yk',
'https://akorlar.com/tan-tasci',
'https://akorlar.com/derya-ulug',
'https://akorlar.com/merve-ozbey',
'https://akorlar.com/ece-seckin',
'https://akorlar.com/derya-bedavaci',
'https://akorlar.com/koray-avci',
'https://akorlar.com/halil-sezai',
'https://akorlar.com/rubato',
'https://akorlar.com/taksim-trio',
'https://akorlar.com/resul-dindar',
'https://akorlar.com/selcuk-balci',
'https://akorlar.com/ekin-uzunlar',
'https://akorlar.com/ece-mumay',
'https://akorlar.com/suran-iskenderli',
'https://akorlar.com/nahide-babashli',
'https://akorlar.com/irmak-arici',
'https://akorlar.com/bilal-hanci',
'https://akorlar.com/reynmen',
'https://akorlar.com/enes-batur',
'https://akorlar.com/altay',
'https://akorlar.com/berkay',
'https://akorlar.com/fettah-can',
'https://akorlar.com/soner-sarikabadayi',
'https://akorlar.com/sinan-akcil',
'https://akorlar.com/rafet-el-roman',
'https://akorlar.com/celik',
'https://akorlar.com/yalin',
'https://akorlar.com/keremcem',
'https://akorlar.com/kutsi',
'https://akorlar.com/gokhan-tepe',
'https://akorlar.com/bendeniz',
'https://akorlar.com/deniz-seki',
'https://akorlar.com/gulben-ergen',
'https://akorlar.com/demet-akalin',
'https://akorlar.com/hakan-peker',
'https://akorlar.com/yonca-evcimik',
'https://akorlar.com/mustafa-sandal',
'https://akorlar.com/oya-bora',
'https://akorlar.com/mirkelam',
'https://akorlar.com/goksel',
'https://akorlar.com/sevval-sam',
'https://akorlar.com/burcu-gunes',
'https://akorlar.com/nil-karaibrahimgil',
'https://akorlar.com/aydilge',
'https://akorlar.com/atiye',
'https://akorlar.com/emre-altug', 'https://akorlar.com/ara/ze'
];

async function startMultiTargetScraping(urls) {
  console.log(`\n🚀 TOPLU TARAMA BAŞLADI (${urls.length} hedef sayfa)`);
  
  // Sadece akoru da olanları "var" sayıyoruz. 10.000 kayıt çekiyoruz.
  const { data: existingSongs } = await supabase.from('songs').select('slug, artists(slug), chords(id)').range(0, 10000);
  
  const existingCombos = new Set(
    existingSongs?.filter(s => s.chords && s.chords.length > 0)
      .map(s => `${s.artists?.slug}:${s.slug}`) || []
  );
  
  console.log(`💡 Hafızada ${existingCombos.size} TAM KAYITLI (Akorlu) şarkı var.`);

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  for (const targetUrl of urls) {
    console.log(`\n--- 📂 TARANIYOR: ${targetUrl} ---`);
    try {
      await page.goto(targetUrl, { waitUntil: 'networkidle2' });
      await analyzePageLinks(page);

      const songLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a'))
          .filter(a => {
            const iconDiv = a.querySelector('div.icon');
            return iconDiv && iconDiv.classList.contains('color-a') && a.href.includes('akorlar.com/');
          })
          .map(a => a.href);
      });

      const uniqueLinks = [...new Set(songLinks)];
      for (let i = 0; i < uniqueLinks.length; i++) {
        const url = uniqueLinks[i];
        try {
          const result = await scrapeSingleSong(page, url, existingCombos);
          if (result === "UPDATED") {
            console.log(`   [${i + 1}/${uniqueLinks.length}] 🔄 AKOR GÜNCELLENDİ: ${url.split('/').pop()}`);
          } else if (result) {
            console.log(`   [${i + 1}/${uniqueLinks.length}] ✅ YENİ EKLENDİ: ${result.artist} - ${result.title}`);
          } else {
            console.log(`   [${i + 1}/${uniqueLinks.length}] ⏩ ATLANDI: Zaten tam kayıtlı.`);
          }
          await delay(100); 
        } catch (err) {
          console.error(`   ❌ Hata (${url}):`, err.message);
        }
      }
    } catch (err) {
      console.error(`❌ Sayfa hatası:`, err.message);
    }
  }
  await browser.close();
  console.log('\n✅ İŞLEM TAMAMLANDI.');
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
    console.log(`   ⚠️ Akor bulunamadı, atlanıyor: ${url}`);
    return null;
  }

  const aSlug = createSlug(res.artist);
  const rawSongSlug = createSlug(res.title);
  
  // ÇAKIŞMA ÖNLEYİCİ: Sanatçı-Şarkı slug'ını birleştiriyoruz (Örn: duman-belki-alisman-lazim)
  const sSlug = `${aSlug}-${rawSongSlug}`;
  const comboKey = `${aSlug}:${sSlug}`;

  if (existingCombos.has(comboKey)) return null;

  // 1. SANATÇI
  let { data: dbArt, error: artErr } = await supabase.from('artists').select('id').eq('slug', aSlug).maybeSingle();
  if (artErr) console.error("   ❌ Artist sorgu hatası:", artErr.message);
  
  if (!dbArt) { 
    const { data, error } = await supabase.from('artists').insert([{ name: res.artist, slug: aSlug }]).select().maybeSingle();
    if (error) { console.error("   ❌ Artist ekleme hatası:", error.message); return null; }
    dbArt = data;
  }

  if (!dbArt) return null;

  // 2. ŞARKI
  let { data: song, error: sngErr } = await supabase.from('songs').select('id').eq('slug', sSlug).maybeSingle();
  if (sngErr) console.error("   ❌ Şarkı sorgu hatası:", sngErr.message);

  if (!song) {
    const { data, error } = await supabase.from('songs').insert([{ artist_id: dbArt.id, title: res.title, slug: sSlug }]).select().maybeSingle();
    if (error) { 
        // Duplicate yakalarsak mevcut olanı çek
        if (error.code === '23505') {
            const { data: retry } = await supabase.from('songs').select('id').eq('slug', sSlug).single();
            song = retry;
        } else {
            console.error("   ❌ Şarkı ekleme hatası:", error.message); 
            return null; 
        }
    } else {
        song = data;
    }
  }

  if (!song) return null;

  // 3. AKOR KAYDI (Kesin Yöntem: Varsa sil, sonra ekle)
  await supabase.from('chords').delete().eq('song_id', song.id);
  const { error: chordErr } = await supabase.from('chords').insert([{ song_id: song.id, content: res.chords }]);
  
  if (chordErr) {
    console.error("   ❌ AKOR KAYDEDİLEMEDİ! Sebeb:", chordErr.message);
    return null;
  }

  existingCombos.add(comboKey);
  return res;
}

startMultiTargetScraping(TARGET_URLS);
