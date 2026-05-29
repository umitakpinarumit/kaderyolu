const cases = Array.from({ length: 30 }).map((_, i) => {
  const n = i + 1;
  const items = [
    { stem: 'Statik: Basit kiriş ortadan yükle eğilme momenti?', ops: ['M=L/4', 'M=PL/4', 'M=PL/2'], correct: 1 },
    { stem: 'Beton: Dayanım sınıfı C30/37 neyi ifade eder?', ops: ['Silindir/küp dayanımı', 'Su geçirimsizliği', 'Donatı oranı'], correct: 0 },
    { stem: 'Zemin: Terzaghi taşıma gücü bileşeni?', ops: ['Nc, Nq, Nγ', 'Cu, Cv, Cc', 'e, n, S'], correct: 0 },
    { stem: 'Deprem: Periyot artarsa?', ops: ['Kesme kuvveti artar', 'Taban kesme azalır', 'Yanal yer değiştirme azalır'], correct: 1 },
    { stem: 'Çelik: Akma dayanımı?', ops: ['σy', 'E', 'G'], correct: 0 },
    { stem: 'Donatı: Pas payı?', ops: ['Beton örtü kalınlığı', 'Donatı aralığı', 'Bindirme boyu'], correct: 0 },
    { stem: 'Kesit: Moment taşıma kapasitesi neye bağlı?', ops: ['b,d,fy,fc', 'λ, μ', 'ψ'], correct: 0 },
    { stem: 'Yapı: Kesme duvarı işlevi?', ops: ['Yanal rijitlik', 'Isı yalıtımı', 'Akustik'], correct: 0 },
    { stem: 'Temel: Radye temel ne zaman?', ops: ['Zayıf zemin/yük dağıtımı', 'Kaya zeminde', 'Yalnızlık'], correct: 0 },
    { stem: 'Akış: Reynolds sayısı?', ops: ['Atalet/viskozite oranı', 'Yoğunluk/kayma', 'Basınç/alan'], correct: 0 },
  ];
  const c = items[i % items.length];
  return { id: `civil_${n.toString().padStart(2,'0')}`, ...c };
});

export default cases;


