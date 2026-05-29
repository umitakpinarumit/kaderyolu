const cases = Array.from({ length: 30 }).map((_, i) => {
  const n = i + 1;
  const items = [
    { stem: 'Periyodizasyon: Yarışa 4 hafta kala?', ops: ['Taper (yük azalt)', 'Hacmi artır', 'Yeni teknik öğren'], correct: 0 },
    { stem: 'Beslenme: Uzun antrenman öncesi?', ops: ['Kompleks karbonhidrat', 'Yüksek yağ', 'Hiç yememe'], correct: 0 },
    { stem: 'Toparlanma: DOMS azaltımı?', ops: ['Aktif toparlanma', 'Tam yatak istirahati', 'Ağır yük'], correct: 0 },
    { stem: 'Sakatlık riski: Diz ağrısı başlangıcı?', ops: ['Hacmi azalt/rehab', 'Ağrıyı görmezden gel', 'Yükü ikiye katla'], correct: 0 },
    { stem: 'Isınma: En iyi yaklaşım?', ops: ['Dinamik ısınma', 'Statik uzun esneme', 'Isınmasız başla'], correct: 0 },
    { stem: 'Hidrasyon: Elektrolit yönetimi?', ops: ['Terle kaybolanı tamamla', 'Sadece su', 'Sadece gazlı'], correct: 0 },
    { stem: 'Uyku: Performans etkisi?', ops: ['7–9 saat hedefle', '3 saat yeter', 'Hiç etkisi yok'], correct: 0 },
    { stem: 'Mental: Yarış anksiyetesi?', ops: ['Nefes/visualizasyon', 'Kafein aşırı', 'Sosyal medya'], correct: 0 },
    { stem: 'Teknik: Koşu kadansı artırımı?', ops: ['Aşırı adım uzunluğu yok', 'Topuk tokatı', 'Düz ayak'], correct: 0 },
    { stem: 'Güç idmanı: Hangi gün?', ops: ['Ana antrenmandan ayrı', 'Ana antrenman öncesi ağır', 'Her gün maksimum'], correct: 0 },
  ];
  const c = items[i % items.length];
  return { id: `sport_${n.toString().padStart(2,'0')}`, ...c };
});

export default cases;


