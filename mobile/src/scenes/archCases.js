const cases = Array.from({ length: 30 }).map((_, i) => {
  const n = i + 1;
  const items = [
    { stem: 'Taşıyıcı sistem: Kiriş açıklığı arttıkça?', ops: ['Kesit artar', 'Kesit azalır', 'Değişmez'], correct: 0 },
    { stem: 'Malzeme: Ahşabın avantajı?', ops: ['Hafif ve yenilenebilir', 'Yüksek ısı iletkenliği', 'Korozyona dayanıklı değil'], correct: 0 },
    { stem: 'Isı yalıtımı için doğru katman?', ops: ['Dış kabukta yalıtım', 'İç yüzeyde metal', 'Boşluk bırakma'], correct: 0 },
    { stem: 'Güneş kontrolü: Güney cephe?', ops: ['Yatay saçak', 'Dikey panjur', 'Yansıtıcı zemin'], correct: 0 },
    { stem: 'Akustik: Yankıyı azaltmak için?', ops: ['Emici yüzey', 'Sert yüzey', 'Cam'], correct: 0 },
    { stem: 'Aydınlatma: Gün ışığı faktörü artarsa?', ops: ['Daha iyi aydınlık', 'Daha kötü parlama', 'Renk doygunluğu düşer'], correct: 0 },
    { stem: 'Sirkülasyon: Kaçış mesafesi?', ops: ['Kodlara uygun kısalt', 'Uzun tut', 'Rastgele'], correct: 0 },
    { stem: 'Erişilebilirlik: Rampa eğimi?', ops: ['%6–8', '%15', '%1'], correct: 0 },
    { stem: 'Sürdürülebilirlik: Yağmur suyu?', ops: ['Topla ve tekrar kullan', 'Atık suya ver', 'Sahaya yay'], correct: 0 },
    { stem: 'Yangın güvenliği: Duman tahliyesi?', ops: ['Doğru basınçlandırma', 'Küçük açıklık', 'Dar merdiven'], correct: 0 },
  ];
  const c = items[i % items.length];
  return { id: `arch_${n.toString().padStart(2,'0')}`, ...c };
});

export default cases;


