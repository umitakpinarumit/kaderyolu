const cases = Array.from({ length: 30 }).map((_, i) => {
  const n = i + 1;
  const items = [
    { stem: 'Devre: Seri RC step cevabı?', ops: ['Üstel azalan', 'Lineer', 'Sinüs'], correct: 0 },
    { stem: 'Güç: Üç faz aktif güç formülü?', ops: ['√3·V·I·cosφ', 'V·I·sinφ', '3·V·I'], correct: 0 },
    { stem: 'Elektronik: Diyot yönü?', ops: ['Anot→Katot', 'Katot→Anot', 'Rastgele'], correct: 0 },
    { stem: 'Sinyal: Nyquist örnekleme?', ops: ['2·fmax', 'fmax', '4·fmax'], correct: 0 },
    { stem: 'EM: Faraday kanunu?', ops: ['dΦ/dt', 'q·E', 'μ·H'], correct: 0 },
    { stem: 'Kontrol: PID bileşenleri?', ops: ['Oransal, Integral, Türev', 'Frekans, Faz, Genlik', 'Açı, Hız, İvme'], correct: 0 },
    { stem: 'Dönüştürücü: Buck nedir?', ops: ['Düşürücü', 'Yükseltici', 'Ters çevirici'], correct: 0 },
    { stem: 'Filtre: Butterworth özelliği?', ops: ['Düz geçiş bandı', 'En keskin geçiş', 'En az dalgalanma'], correct: 0 },
    { stem: 'Gürültü: SNR yükseltme?', ops: ['Filtreleme + ortalama', 'Gain arttır', 'Daha kötü ADC'], correct: 0 },
    { stem: 'PCB: Topraklama tekniği?', ops: ['Yıldız/plane', 'Rastgele', 'Üst üste via'], correct: 0 },
  ];
  const c = items[i % items.length];
  return { id: `elec_${n.toString().padStart(2,'0')}`, ...c };
});

export default cases;


