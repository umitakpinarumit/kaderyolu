const cases = Array.from({ length: 30 }).map((_, i) => {
  const n = i + 1;
  const items = [
    { stem: 'Schengen: 90/180 kuralı neyi ifade eder?', ops: ['180 günde toplam 90 gün', '90 günde 180 gün', 'Sınırsız kalış'], correct: 0 },
    { stem: 'Vize: Multi-entry avantajı?', ops: ['Çoklu giriş', 'Ücretsiz', 'Sınırsız kalış'], correct: 0 },
    { stem: 'Rota: Uçuşta aktarma süresi?', ops: ['Minimum bağlantı süresi', 'Her zaman 10 dk', 'Önemli değil'], correct: 0 },
    { stem: 'Lojistik: Kabin sıvı kuralı?', ops: ['100 ml sınırı', '1 L serbest', 'Sınırsız'], correct: 0 },
    { stem: 'Sağlık: Aşı kartı nerede gerekebilir?', ops: ['Bazı Afrika/G.Amerika', 'Schengen', 'Her yerde'], correct: 0 },
    { stem: 'Bütçe: En uygun döviz alma zamanı?', ops: ['Kur dalgalanmasına hedge', 'Rastgele', 'Seyahat sonrası'], correct: 0 },
    { stem: 'Konaklama: Overbooking durumunda?', ops: ['Alternatif/kompansasyon talep', 'Kabul et', 'Yasal değil'], correct: 0 },
    { stem: 'Gümrük: Duty-free limit?', ops: ['Ülkeye göre değişir', 'Sınırsız', 'Herkes için aynı'], correct: 0 },
    { stem: 'Güvenlik: Pasaport kaybı?', ops: ['Konsolosluk geçici belge', 'Yolculuk iptal', 'Gümrük çözer'], correct: 0 },
    { stem: 'Ulaşım: Eurail ne sağlar?', ops: ['Çoklu tren geçişi', 'Uçuş indirimi', 'Araç kiralama'], correct: 0 },
  ];
  const c = items[i % items.length];
  return { id: `travel_${n.toString().padStart(2,'0')}`, ...c };
});

export default cases;




