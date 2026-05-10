import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function masterCleanup() {
  console.log("🧹 KAPSAMLI TEMİZLİK BAŞLIYOR...");

  try {
    // 1. Tüm şarkıları akor durumlarıyla birlikte çek
    let allSongs = [];
    let from = 0;
    const step = 20000;
    
    console.log("📥 Veritabanı taranıyor...");
    while (true) {
      const { data, error } = await supabase
        .from('songs')
        .select('id, title, artist_id, slug, chords(id)')
        .range(from, from + step - 1);
        
      if (error) throw error;
      if (!data || data.length === 0) break;
      
      allSongs.push(...data);
      from += step;
    }

    console.log(`💡 Toplam ${allSongs.length} kayıt hafızaya alındı. Analiz ediliyor...\n`);

    const emptySongs = [];
    const validSongs = [];

    // 2. Kural 1: Akoru olmayanları ayır
    for (const song of allSongs) {
      if (!song.chords || song.chords.length === 0) {
        emptySongs.push(song);
      } else {
        validSongs.push(song);
      }
    }

    // BOŞ ŞARKILARI SİL
    console.log(`🗑️ İÇİ BOŞ (Akorsuz) ŞARKILAR SİLİNİYOR... (${emptySongs.length} adet bulundu)`);
    let emptyDeleted = 0;
    for (const item of emptySongs) {
      // Akoru olmadığı için doğrudan şarkıyı siliyoruz
      await supabase.from('songs').delete().eq('id', item.id);
      emptyDeleted++;
    }
    console.log(`✅ ${emptyDeleted} adet boş şarkı silindi.\n`);

    // 3. Kural 2: Dolu şarkılar arasında kopya taraması yap
    const groupedSongs = {};
    for (const song of validSongs) {
      const cleanTitle = song.title.toLowerCase().trim();
      const key = `${song.artist_id}_${cleanTitle}`;
      
      if (!groupedSongs[key]) groupedSongs[key] = [];
      groupedSongs[key].push(song);
    }

    let duplicateDeleted = 0;
    console.log(`🗑️ KOPYA (Birden fazla) ŞARKILAR SİLİNİYOR...`);
    for (const key in groupedSongs) {
      const group = groupedSongs[key];
      
      if (group.length > 1) {
        // İlk kaydı tut, geri kalanları sil
        const songsToDelete = group.slice(1);

        for (const item of songsToDelete) {
          console.log(`   - Siliniyor: ${item.title} (Akorlu Kopya)`);
          
          // Akor tablosundan sil (Foreign key kısıtlamasına takılmamak için)
          await supabase.from('chords').delete().eq('song_id', item.id);
          
          // Şarkı tablosundan sil
          await supabase.from('songs').delete().eq('id', item.id);
          duplicateDeleted++;
        }
      }
    }

    console.log(`✅ ${duplicateDeleted} adet kopya şarkı silindi.\n`);
    console.log(`🎉 TERTEMİZ! Veritabanında sadece akoru olan ve tekil şarkılar kaldı.`);
    
  } catch (error) {
    console.error("❌ Bir hata oluştu:", error.message);
  }
}

masterCleanup();
