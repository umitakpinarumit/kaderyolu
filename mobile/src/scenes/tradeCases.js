const cases = Array.from({ length: 30 }).map((_, i) => {
  const n = i + 1;
  const items = [
    { stem: 'INCOTERMS: FOB sorumluluk sınırı?', ops: ['Gemi küpeştisi', 'Alıcının deposu', 'Satıcının kapısı'], correct: 0 },
    { stem: 'Ödeme: Akreditif (LC) avantajı?', ops: ['Banka güvencesi', 'En ucuz', 'En hızlı'], correct: 0 },
    { stem: 'Kur riski yönetimi?', ops: ['Forward/hedge', 'Hiçbir şey yapma', 'Rastgele alım'], correct: 0 },
    { stem: 'Gümrükte gecikme nedeni?', ops: ['Belge hatası', 'Mükemmel evrak', 'Hava güneşli'], correct: 0 },
    { stem: 'Navlun: CIF kime ait?', ops: ['Satıcı öder', 'Alıcı öder', 'Acenta öder'], correct: 0 },
    { stem: 'Sigorta: CIF’te kimin yükümlülüğü?', ops: ['Satıcı', 'Alıcı', 'Gümrük'], correct: 0 },
    { stem: 'Teslim şekli: EXW risk?', ops: ['Alıcıda', 'Satıcıda', 'Taşıyıcıda'], correct: 0 },
    { stem: 'Belgeler: Konşimento (B/L) ne sağlar?', ops: ['Mülkiyet/emtia hakkı', 'KDV muafiyeti', 'Kur indirimi'], correct: 0 },
    { stem: 'HS kodu önemi?', ops: ['Vergi/tarife belirler', 'Teslim tarihini belirler', 'Kur seviyesini belirler'], correct: 0 },
    { stem: 'CAD (cash against documents)?', ops: ['Belge karşılığı ödeme', 'Peşin', 'Vadeli çek'], correct: 0 },
  ];
  const c = items[i % items.length];
  return { id: `trade_${n.toString().padStart(2,'0')}`, ...c };
});

export default cases;


